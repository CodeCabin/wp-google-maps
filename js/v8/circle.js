/**
 * @namespace WPGMZA
 * @module Circle
 * @requires WPGMZA.Shape
 * @pro-requires WPGMZA.ProShape
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Shape;
	
	
	/**
	 * Base class for circles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Circle
	 * @constructor WPGMZA.Circle
	 * @memberof WPGMZA
	 * @augments WPGMZA.Feature
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
	

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProShape;

	WPGMZA.extend(WPGMZA.Circle, Parent);
	
	Object.defineProperty(WPGMZA.Circle.prototype, "fillColor", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.color || !this.color.length)
				return "#ff0000";
			
			return this.color;
		},
		"set" : function(a){
			this.color = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Circle.prototype, "fillOpacity", {
	
		enumerable: true,
		
		"get": function()
		{
			if(!this.opacity && this.opacity != 0)
				return 0.5;
			
			return parseFloat(this.opacity);
		},
		"set": function(a){
			this.opacity = a;
		}
	
	});
	
	Object.defineProperty(WPGMZA.Circle.prototype, "strokeColor", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.lineColor){
				return "#000000";
			}
			return this.lineColor;
		},
		"set": function(a){
			this.lineColor = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Circle.prototype, "strokeOpacity", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.lineOpacity && this.lineOpacity != 0)
				return 0;
			
			return parseFloat(this.lineOpacity);
		},
		"set": function(a){
			this.lineOpacity = a;
		}
		
	});
	
	/**
	 * Creates an instance of a circle, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.Circle.createInstance = function(options, engineCircle)
	{
		var constructor;
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion()){
					constructor = WPGMZA.OLProCircle;
					break;
				}
				constructor = WPGMZA.OLCircle;
				break;
			
			default:
				if(WPGMZA.isProVersion()){
					constructor = WPGMZA.GoogleProCircle;
					break;
				}
				constructor = WPGMZA.GoogleCircle;
				break;
		}
		
		return new constructor(options, engineCircle);
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