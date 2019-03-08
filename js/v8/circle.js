/**
 * @namespace WPGMZA
 * @module Circle
 * @requires WPGMZA.MapObject
 */
jQuery(function($) {
	
	var Parent = WPGMZA.MapObject;
	
	/**
	 * Base class for circles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Circle
	 * @constructor WPGMZA.Circle
	 * @memberof WPGMZA
	 * @augments WPGMZA.MapObject
	 * @see WPGMZA.Circle.createInstance
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
	 * Creates an instance of a circle, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.Circle.createInstance = function(options)
	{
		var constructor;
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				constructor = WPGMZA.OLCircle;
				break;
			
			default:
				constructor = WPGMZA.GoogleCircle;
				break;
		}
		
		return new constructor(options);
	}
	
	/**
	 * Gets the circles center
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getCenter = function()
	{
		return this.center.clone();
	}
	
	/**
	 * Sets the circles center
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object|WPGMZA.LatLng} latLng either a literal or as a WPGMZA.LatLng
	 */
	WPGMZA.Circle.prototype.setCenter = function(latLng)
	{
		this.center.lat = latLng.lat;
		this.center.lng = latLng.lng;
	}
	
	/**
	 * Gets the circles radius, in kilometers
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object|WPGMZA.LatLng} latLng either a literal or as a WPGMZA.LatLng
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getRadius = function()
	{
		return this.radius;
	}
	
	/**
	 * Sets the circles radius, in kilometers
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {number} radius The radius
	 * @returns {void}
	 */
	WPGMZA.Circle.prototype.setRadius = function(radius)
	{
		this.radius = radius;
	}
	
	/**
	 * Returns the map that this circle is being displayed on
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @return {WPGMZA.Map}
	 */
	WPGMZA.Circle.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * Puts this circle on a map
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {WPGMZA.Map} map The target map
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