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
		
		WPGMZA.maps.push(this);
		
		this.id = element.getAttribute("data-map-id");
		
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
		
		this.googleMap = new google.maps.Map(this.element, options);
		google.maps.event.addListener(this.googleMap, "bounds_changed", function() { self.onBoundsChanged(); });
		
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
		}, 300);
		
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
		marker.googleMarker.setMap(this.googleMap);
		
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
		marker.googleMarker.setMap(null);
		
		this.markers.splice(this.markers.indexOf(marker), 1);
		this.dispatchEvent({type: "markerremoved", marker: marker});
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	WPGMZA.Map.prototype.addPolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		polygon.map = this;
		polygon.googlePolygon.setMap(this.googleMap);
		
		this.polygons.push(polygon);
		this.dispatchEvent({type: "polygonadded", polygon: polygon});
	}
	
	WPGMZA.Map.prototype.deletePolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		if(polygon.map !== this)
			throw new Error("Wrong map error");
		
		polygon.map = null;
		polygon.googlePolygon.setMap(null);
		
		this.polygons.splice(this.polygons.indexOf(polygon), 1);
		this.dispatchEvent({type: "polygonremoved", polygon: polygon});
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	WPGMZA.Map.prototype.addPolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		polyline.map = this;
		polyline.googlePolyline.setMap(this.googleMap);
		
		this.polylines.push(polyline);
		this.dispatchEvent({type: "polylineadded", polyline: polyline});
	}
	
	WPGMZA.Map.prototype.deletePolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		if(polyline.map !== this)
			throw new Error("Wrong map error");
		
		polyline.map = null;
		polyline.googlePolyline.setMap(null);
		
		this.polylines.splice(this.polylines.indexOf(polyline), 1);
		this.dispatchEvent({type: "polylineremoved", polyline: polyline});
	}
	
	/* 
	TODO: I'm a little bit worried that these delegate functions might end up being hard to maintain
	*/
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.Map.prototype.getCenter = function()
	{
		return this.googleMap.getCenter();
	}
	
	/**
	 * Delegate for google maps setCenter
	 * @return void
	 */
	WPGMZA.Map.prototype.setCenter = function(latLng)
	{
		this.googleMap.setCenter(latLng);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.Map.prototype.getZoom = function()
	{
		return this.googleMap.getZoom();
	}
	
	/**
	 * Delegate for google maps getZoom
	 * @return void
	 */
	WPGMZA.Map.prototype.setZoom = function(value)
	{
		return this.googleMap.setZoom(value);
	}
	
	/**
	 * Fetches all markers, polygons and polylines within viewport bounds
	 * @return void
	 */
	WPGMZA.Map.prototype.fetch = function()
	{
		var self = this;
		var data = {
			map_id:	this.id,
			action:	"wpgmza_map_fetch",
			bounds: this.googleMap.getBounds().toUrlValue(7),
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
				//var json = JSON.parse(response);
				var json = response;
				
				for(var i = 0; i < json.markers.length; i++)
				{
					var marker = new WPGMZA.Marker(json.markers[i]);
					marker.modified = false;
					self.addMarker(marker);
				}
				
				for(i = 0; i < json.polygons.length; i++)
				{
					var polygon = new WPGMZA.Polygon(json.polygons[i]);
					polygon.modified = false;
					self.addPolygon(polygon);
				}
				
				for(i = 0; i < json.polylines.length; i++)
				{
					var polyline = new WPGMZA.Polyline(json.polylines[i]);
					polyline.modified = false;
					self.addPolyline(polyline);
				}
			}
		});
	}
	
	eventDispatcher.apply(WPGMZA.Map.prototype);
})(jQuery);