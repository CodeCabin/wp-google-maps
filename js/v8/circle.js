/**
 * @namespace WPGMZA
 * @module Circle
 * @requires WPGMZA.MapObject
 */
(function($) {
	
	var Parent = WPGMZA.MapObject;
	
	WPGMZA.Circle = function(options, engineCircle)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Circle");
		
		this.center = new WPGMZA.LatLng();
		this.radius = 100;
		
		Parent.apply(this, arguments);
	}
	
	WPGMZA.Circle.prototype = Object.create(Parent.prototype);
	WPGMZA.Circle.prototype.constructor = WPGMZA.Circle;
	
	WPGMZA.Circle.createInstance = function(options)
	{
		var constructor;
		
		if(WPGMZA.settings.engine == "google-maps")
			constructor = WPGMZA.GoogleCircle;
		else
			constructor = WPGMZA.OSMCircle;
		
		return new constructor(options);
	}
	
	WPGMZA.Circle.prototype.getCenter = function()
	{
		return this.center.clone();
	}
	
	WPGMZA.Circle.prototype.setCenter = function(latLng)
	{
		this.center.lat = latLng.lat;
		this.center.lng = latLng.lng;
	}
	
	WPGMZA.Circle.prototype.getRadius = function()
	{
		return this.radius;
	}
	
	WPGMZA.Circle.prototype.setRadius = function(radius)
	{
		this.radius = radius;
	}
	
	WPGMZA.Circle.prototype.getMap = function()
	{
		return this.map;
	}
	
	WPGMZA.Circle.prototype.setMap = function(map)
	{
		if(this.map)
			this.map.removeCircle(this);
		
		if(map)
			map.addCircle(this);
			
	}
	
})(jQuery);