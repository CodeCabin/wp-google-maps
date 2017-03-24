(function($) {
	function generateUUID () { // Public Domain/MIT
		var d = new Date().getTime();
		if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
			d += performance.now(); //use high-precision timer if available
		}
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	}
	
	/**
	 * Constructor
	 * @param element to contain map
	 */
	WPGMZA.Map = function(element)
	{
		if(!(element instanceof HTMLElement))
			throw new Error("Argument must be a HTMLElement");
		
		this.element = element;
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		
		// This session ID is unique to the map on this visit, as opposed to the PHP session ID. This is used server side to remember which markers have already been sent
		this.sessionID = generateUUID();	
		
		this.ajaxTimeoutID = null;
		this.pendingAJAXRequests = 0;
		
		this.loadSettings();
		this.loadGoogleMap();
		this.loadProgressBar();
	}
	
	/**
	 * Loads all the settings from the data-settings attribute of the element
	 * @return void
	 */
	WPGMZA.Map.prototype.loadSettings = function()
	{
		var localSettings = new WPGMZA.MapSettings(this.element);
		var localizedSettings = new WPGMZA.MapSettings(this.element);
		
		$.extend(localizedSettings, WPGMZA.settings, localSettings);
		
		this.settings = localizedSettings;
		
		this.element.style.height = this.settings.height;
	}
	
	/**
	 * Creates the Google Maps map
	 * @return void
	 */
	WPGMZA.Map.prototype.loadGoogleMap = function()
	{
		var self = this;
		var options = this.settings.toGoogleMapsOptions();
		
		this.map = new google.maps.Map(this.element, options);
		google.maps.event.addListener(this.map, "bounds_changed", function() { self.onBoundsChanged(); });
		
		$(this.element).trigger("wpgmza_loaded");
	}
	
	/**
	 * Creates a progress bar for the map
	 * @return void
	 */
	WPGMZA.Map.prototype.loadProgressBar = function()
	{
		this.progressBar = $("<div class='wpgmza-progress'><div/></div>");
		$(this.element).append(this.progressBar);
	}
	
	/**
	 * Updates the progress bar
	 * @return void
	 */
	WPGMZA.Map.prototype.updateProgressBar = function()
	{
		var val = 1 / (this.pendingAJAXRequests + 1);
		var el = $(this.element).find(".wpgmza-progress");
		var inner = el.find("div");
		
		if(el[0].progressAmount > val)
			el.addClass("notransition");
		el[0].progressAmount = val;
		
		inner.css({
			width: Math.round(val * 100) + "%"
		});
		el.css({
			display: (val == 1 ? "none" : "block")
		});
		
		el.removeClass("notransition");
	}
	
	/**
	 * Fired when map bounds are initially set or change
	 * @return void
	 */
	WPGMZA.Map.prototype.onBoundsChanged = function()
	{
		var self = this;
		
		if(this.ajaxTimeoutID != null)
			clearTimeout(this.ajaxTimeoutID);
		
		this.ajaxTimeoutID = setTimeout(function() {
			self.fetch();
		}, 500);
		
		this.dispatchEvent({type: "bounds_changed"});
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	WPGMZA.Map.prototype.addMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		marker.map = this;
		marker.marker.setMap(this.map);
		
		this.markers.push(marker);
		this.dispatchEvent({type: "markeradded", marker: marker});
	}
	
	WPGMZA.Map.prototype.deleteMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		marker.map = null;
		marker.marker.setMap(null);
		
		this.markers.splice(this.markers.indexOf(marker), 1);
		this.dispatchEvent({type: "markerremoved", marker: marker});
	}
	
	
	/* 
	TODO: I'm a little bit worried that these delegate functions might end up being hard to maintain. I think it might be better to name this.maps this.googleMap to differentiate between the WPGMZA Map and the native Google Map
	*/
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.Map.prototype.getCenter = function()
	{
		return this.map.getCenter();
	}
	
	/**
	 * Delegate for google maps setCenter
	 * @return void
	 */
	WPGMZA.Map.prototype.setCenter = function(latLng)
	{
		this.map.setCenter(latLng);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.Map.prototype.getZoom = function()
	{
		return this.map.getZoom();
	}
	
	/**
	 * Delegate for google maps getZoom
	 * @return void
	 */
	WPGMZA.Map.prototype.setZoom = function(value)
	{
		return this.map.setZoom(value);
	}
	
	/**
	 * Fetches all markers, polygons and polylines within viewport bounds
	 * @return void
	 */
	WPGMZA.Map.prototype.fetch = function()
	{
		var self = this;
		var data = {
			map_id:	this.element.getAttribute("data-map-id"),
			action:	"wpgmza_map_fetch",
			bounds: this.map.getBounds().toUrlValue(7),
			sid:	this.sessionID
		};
		
		this.pendingAJAXRequests++;
		this.updateProgressBar();
		
		$.ajax(this.settings.ajaxurl, {
			data: data,
			complete: function() {
				self.pendingAJAXRequests--;
				self.updateProgressBar();
			},
			success: function(response) {
				var json = JSON.parse(response);
				
				for(var i = 0; i < json.markers.length; i++)
				{
					var marker = new WPGMZA.Marker(json.markers[i]);
					marker.modified = false;
					self.addMarker(marker);
				}
			}
		});
	}
	
	eventDispatcher.apply(WPGMZA.Map.prototype);
})(jQuery);