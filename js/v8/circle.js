/**
 * @namespace WPGMZA
 * @module Circle
 * @requires WPGMZA.MapObject
 */
jQuery(function($) {
	
	var Parent = WPGMZA.MapObject;
	
	/**
	 * @class Circle
	 * @summary Represents a generic circle. <b>Please do not instantiate this object directly, use createInstance</b>
	 * @return {WPGMZA.Circle}
	 */
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
	
	/**
	 * @function createInstance
	 * @summary Creates an instance of a circle, <b>please always use this function rather than calling the constructor directly</b>
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.Circle.createInstance = function(options)
	{
		var constructor;
		
		if(WPGMZA.settings.engine == "google-maps")
			constructor = WPGMZA.GoogleCircle;
		else
			constructor = WPGMZA.OLCircle;
		
		return new constructor(options);
	}
	
	/**
	 * @function getCenter
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getCenter = function()
	{
		return this.center.clone();
	}
	
	/**
	 * @function setCenter
	 * @param {object|WPGMZA.LatLng} latLng either a literal or as a WPGMZA.LatLng
	 * @returns {void}
	 */
	WPGMZA.Circle.prototype.setCenter = function(latLng)
	{
		this.center.lat = latLng.lat;
		this.center.lng = latLng.lng;
	}
	
	/**
	 * @function getRadius
	 * @summary Returns the circles radius in kilometers
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getRadius = function()
	{
		return this.radius;
	}
	
	/**
	 * @function setRadius
	 * @param {number} The radius
	 * @returns {void}
	 */
	WPGMZA.Circle.prototype.setRadius = function(radius)
	{
		this.radius = radius;
	}
	
	/**
	 * @function getMap
	 * @summary Returns the map that this circle is being displayed on
	 * @return {WPGMZA.Map}
	 */
	WPGMZA.Circle.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * @function setMap
	 * @param {WPGMZA.Map} The target map
	 * @summary Puts this circle on a map
	 * @return {void}
	 */
	WPGMZA.Circle.prototype.setMap = function(map)
	{
		if(this.map)
			this.map.removeCircle(this);
		
		if(map)
			map.addCircle(this);
			
	}
	
});