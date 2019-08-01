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
	WPGMZA.InfoWindow = function(mapObject)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		WPGMZA.assertInstanceOf(this, "InfoWindow");
		
		if(!mapObject)
			return;
		
		this.mapObject = mapObject;
		
		if(mapObject.map)
		{
			// This has to be slightly delayed so the map initialization won't overwrite the infowindow element
			setTimeout(function() {
				self.onMapObjectAdded(event);
			}, 100);
		}
		else
			mapObject.addEventListener("added", function(event) { 
				self.onMapObjectAdded(event);
			});		
	}
	
	WPGMZA.InfoWindow.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.InfoWindow.prototype.constructor = WPGMZA.InfoWindow;
	
	WPGMZA.InfoWindow.OPEN_BY_CLICK = 1;
	WPGMZA.InfoWindow.OPEN_BY_HOVER = 2;
	
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
	WPGMZA.InfoWindow.createInstance = function(mapObject)
	{
		var constructor = this.getConstructor();
		return new constructor(mapObject);
	}
	
	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.getContent = function(callback)
	{
		var html = "";
		
		if(this.mapObject instanceof WPGMZA.Marker)
			html = this.mapObject.address;
		
		callback(html);
	}
	
	/**
	 * Opens the info window on the specified map, with the specified map object as the subject.
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {WPGMZA.Map} map The map to open this InfoWindow on.
	 * @param {WPGMZA.MapObject} mapObject The map object (eg marker, polygon) to open this InfoWindow on.
	 * @return boolean FALSE if the info window should not and will not open, TRUE if it will. This can be used by subclasses to establish whether or not the subclassed open should bail or open the window.
	 */
	WPGMZA.InfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		this.mapObject = mapObject;
		
		if(WPGMZA.settings.disable_infowindows || WPGMZA.settings.wpgmza_settings_disable_infowindows == "1")
			return false;
		
		if(this.mapObject.disableInfoWindow)
			return false;
		
		return true;
	}
	
	/**
	 * Abstract function, closes this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.close = function()
	{
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
	WPGMZA.InfoWindow.prototype.onMapObjectAdded = function()
	{
		if(this.mapObject.settings.infoopen == 1)
			this.open();
	}
	
});