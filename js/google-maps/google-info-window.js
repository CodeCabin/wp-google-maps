(function($) {
	
	var parentConstructor;
	
	WPGMZA.GoogleInfoWindow = function(mapObject)
	{
		parentConstructor.call(this, mapObject);
		
		if(mapObject instanceof WPGMZA.Marker)
			this.googleObject = mapObject.googleMarker;
		else if(mapObject instanceof WPGMZA.Polygon)
			this.googleObject = mapObject.googlePolygon;
		else if(mapObject instanceof WPGMZA.Polyline)
			this.googleObject = mapObject.googlePolyline;
	}
	
	if(WPGMZA.isProVersion())
		parentConstructor = WPGMZA.ProInfoWindow;
	else
		parentConstructor = WPGMZA.InfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.GoogleInfoWindow.prototype.constructor = WPGMZA.GoogleInfoWindow;
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.GoogleInfoWindow.prototype.open = function()
	{
		var self = this;
		
		if(!WPGMZA.InfoWindow.prototype.open.call(this))
			return false;
		
		if(!this.googleInfoWindow)
			this.googleInfoWindow = new google.maps.InfoWindow();
		
		this.googleInfoWindow.open(
			this.mapObject.map.googleMap,
			this.googleObject
		);
		
		this.getContent(function(html) {
			self.googleInfoWindow.setContent(html);
		});
				
		return true;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.close = function()
	{
		if(!this.googleInfoWindow)
			return;
		
		this.googleInfoWindow.close();
	}
	
})(jQuery);