(function($) {
	
	WPGMZA.InfoWindow = function(mapObject)
	{
		var self = this;
		
		this.mapObject = mapObject;
		
		mapObject.addEventListener("added", function(event) { 
			self.onMapObjectAdded(event); 
		});
	}
	
	WPGMZA.InfoWindow.OPEN_BY_CLICK = 1;
	WPGMZA.InfoWindow.OPEN_BY_HOVER = 2;
	
	WPGMZA.InfoWindow.createInstance = function(mapObject)
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				if(WPGMZA.isProVersion())
					return new WPGMZA.GoogleProInfoWindow(mapObject);
				return new WPGMZA.GoogleInfoWindow(mapObject);
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return new WPGMZA.OSMProInfoWindow(mapObject);
				return new WPGMZA.OSMInfoWindow(mapObject);
				break;
		}
	}
	
	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
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
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.InfoWindow.prototype.open = function(event)
	{
		var self = this;
		
		if(WPGMZA.settings.disable_infowindows)
			return false;
		
		return true;
	}
	
	/**
	 * Event listener for when the map object is added. This will cause the info window to open if the map object has infoopen set
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.onMapObjectAdded = function()
	{
		if(this.mapObject.settings.infoopen == 1)
			this.open();
	}
	
})(jQuery);