/**
 * @namespace WPGMZA
 * @module InfoWindow
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Base class for infoWindows. This acts as an abstract class so that infoWindows for both Google and OpenLayers can be interacted with seamlessly by the overlying logic. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.InfoWindow
	 * @constructor WPGMZA.InfoWindow
	 * @memberof WPGMZA
	 * @see WPGMZA.InfoWindow.createInstance
	 */
	WPGMZA.InfoWindow = function(feature) {
		var self = this;


		
		WPGMZA.EventDispatcher.call(this);
		
		WPGMZA.assertInstanceOf(this, "InfoWindow");
		
		this.on("infowindowopen", function(event) {
			self.onOpen(event);
		});
		
		if(!feature)
			return;
		
		this.feature = feature;
		this.state = WPGMZA.InfoWindow.STATE_CLOSED;
		
		if(feature.map)
		{
			// This has to be slightly delayed so the map initialization won't overwrite the infowindow element
			setTimeout(function() {
				self.onFeatureAdded(event);
			}, 100);
		}
		else
			feature.addEventListener("added", function(event) { 
				self.onFeatureAdded(event);
			});		
	}

	
	
	WPGMZA.InfoWindow.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.InfoWindow.prototype.constructor = WPGMZA.InfoWindow;
	
	WPGMZA.InfoWindow.OPEN_BY_CLICK = 1;
	WPGMZA.InfoWindow.OPEN_BY_HOVER = 2;
	
	WPGMZA.InfoWindow.STATE_OPEN	= "open";
	WPGMZA.InfoWindow.STATE_CLOSED	= "closed";
	
	/**
	 * Fetches the constructor to be used by createInstance, based on the selected maps engine
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return {function} The appropriate constructor
	 */
	WPGMZA.InfoWindow.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProInfoWindow;
				return WPGMZA.OLInfoWindow;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProInfoWindow;
				return WPGMZA.GoogleInfoWindow;
				break;
		}
	}
	
	/**
	 * Creates an instance of an InfoWindow, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.InfoWindow.createInstance = function(feature)
	{
		var constructor = this.getConstructor();
		return new constructor(feature);
	}
	
	Object.defineProperty(WPGMZA.InfoWindow.prototype, "content", {
		
		"get": function()
		{
			return this.getContent();
		},

		"set": function(value)
		{
			this.contentHtml = value;
		}
	});
	
	
	WPGMZA.InfoWindow.prototype.addEditButton = function() {
		if (WPGMZA.currentPage == "map-edit") {
			if(this.feature instanceof WPGMZA.Marker){
				return ' <a title="Edit this marker" style="width:15px;" class="wpgmza_edit_btn" data-edit-marker-id="'+this.feature.id+'"><i class="fa fa-edit"></i></a>';	
			}
		}
		return '';

	}

	WPGMZA.InfoWindow.prototype.workOutDistanceBetweenTwoMarkers = function(location1, location2) {
		if(!location1 || !location2)
			return; // No location (no search performed, user location unavailable)
		
		var distanceInKM = WPGMZA.Distance.between(location1, location2);
		var distanceToDisplay = distanceInKM;
			
		if(this.distanceUnits == WPGMZA.Distance.MILES)
			distanceToDisplay /= WPGMZA.Distance.KILOMETERS_PER_MILE;
		
		var text = Math.round(distanceToDisplay, 2);
		
		return text;
	}


	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.getContent = function(callback) {
		var html = "";
		var extra_html = "";

		if (this.feature instanceof WPGMZA.Marker) {
			// Store locator distance away
			// added by Nick 2020-01-12
			if (this.feature.map.settings.store_locator_show_distance && this.feature.map.storeLocator && (this.feature.map.storeLocator.state == WPGMZA.StoreLocator.STATE_APPLIED)) {
				var currentLatLng = this.feature.getPosition();
				var distance = this.workOutDistanceBetweenTwoMarkers(this.feature.map.storeLocator.center, currentLatLng);

				extra_html += "<p>"+(this.feature.map.settings.store_locator_distance == WPGMZA.Distance.KILOMETERS ? distance + WPGMZA.localized_strings.kilometers_away : distance + " " + WPGMZA.localized_strings.miles_away)+"</p>";	
			} 

			html = this.feature.address+extra_html;
		}
		
		if (this.contentHtml){
			html = this.contentHtml;
		}


		if(callback)
			callback(html);
		
		return html;
	}
	
	/**
	 * Opens the info window on the specified map, with the specified map object as the subject.
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {WPGMZA.Map} map The map to open this InfoWindow on.
	 * @param {WPGMZA.Feature} feature The map object (eg marker, polygon) to open this InfoWindow on.
	 * @return boolean FALSE if the info window should not and will not open, TRUE if it will. This can be used by subclasses to establish whether or not the subclassed open should bail or open the window.
	 */
	WPGMZA.InfoWindow.prototype.open = function(map, feature) {
		var self = this;
		
		this.feature = feature;
		
		if(WPGMZA.settings.disable_infowindows || WPGMZA.settings.wpgmza_settings_disable_infowindows == "1")
			return false;
		
		if(this.feature.disableInfoWindow)
			return false;
		
		this.state = WPGMZA.InfoWindow.STATE_OPEN;
		
		return true;
	}
	
	/**
	 * Abstract function, closes this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.close = function()
	{
		if(this.state == WPGMZA.InfoWindow.STATE_CLOSED)
			return;
		
		this.state = WPGMZA.InfoWindow.STATE_CLOSED;
		this.trigger("infowindowclose");
	}
	
	/**
	 * Abstract function, sets the content in this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.setContent = function(options)
	{
		
	}
	
	/**
	 * Abstract function, sets options on this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.setOptions = function(options)
	{
		
	}
	
	/**
	 * Event listener for when the map object is added. This will cause the info window to open if the map object has infoopen set
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.onFeatureAdded = function()
	{
		if(this.feature.settings.infoopen == 1)
			this.open();
	}
	
	WPGMZA.InfoWindow.prototype.onOpen = function()
	{
		
	}
	
});
