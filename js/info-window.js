(function($) {
	
	WPGMZA.InfoWindow = function(mapObject)
	{
		var self = this;
		
		this.mapObject = mapObject;
		
		if(mapObject instanceof WPGMZA.Marker)
			this.googleObject = mapObject.googleMarker;
		else if(mapObject instanceof WPGMZA.Polygon)
			this.googleObject = mapObject.googlePolygon;
		else if(mapObject instanceof WPGMZA.Polyline)
			this.googleObject = mapObject.googlePolyline;
		
		this.googleObject.addListener("click", function(event) { self.onClick(event); });
		this.googleObject.addListener("mouseover", function(event) { self.onHover(event); });
	}
	
	WPGMZA.InfoWindow.OPEN_BY_CLICK = 1;
	WPGMZA.InfoWindow.OPEN_BY_HOVER = 2;
	
	WPGMZA.InfoWindow.prototype.getContent = function()
	{
		if(this.mapObject instanceof WPGMZA.Marker)
			return this.mapObject.address;
		
		return null;
	}
	
	WPGMZA.InfoWindow.prototype.open = function(event)
	{
		var self = this;
		
		if(WPGMZA.settings.disable_infowindows)
			return;
		
		if(!this.googleInfoWindow)
			this.googleInfoWindow = new google.maps.InfoWindow();
		
		this.googleInfoWindow.setContent(this.getContent());
		
		this.googleInfoWindow.open(
			this.mapObject.map.googleMap,
			this.googleObject
		);
	}
	
	WPGMZA.InfoWindow.prototype.onClick = function()
	{
		if(WPGMZA.settings.map_open_marker_by != WPGMZA.InfoWindow.OPEN_BY_HOVER)
			this.open();
	}
	
	WPGMZA.InfoWindow.prototype.onHover = function()
	{
		if(WPGMZA.settings.map_open_marker_by != WPGMZA.InfoWindow.OPEN_BY_HOVER)
			return;
		this.open();
	}
	
})(jQuery);