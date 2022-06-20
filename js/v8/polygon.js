/**
 * @namespace WPGMZA
 * @module Polygon
 * @requires WPGMZA.Feature
 */
jQuery(function($) {
	
	/**
	 * Base class for polygons. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polygon
	 * @constructor WPGMZA.Polygon
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @augments WPGMZA.Feature
	 */
	WPGMZA.Polygon = function(row, enginePolygon)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polygon");
		
		this.paths = null;
		
		WPGMZA.Feature.apply(this, arguments);

		this.addEventListener("added", function(event) {
            self.onAdded();
        });
	}
	
	WPGMZA.Polygon.prototype = Object.create(WPGMZA.Feature.prototype);
	WPGMZA.Polygon.prototype.constructor = WPGMZA.Polygon;
	
	Object.defineProperty(WPGMZA.Polygon.prototype, "fillColor", {
		
		enumerable: true,
		"get": function()
		{
			if(!this.fillcolor || !this.fillcolor.length)
				return "#ff0000";
			
			return "#" + this.fillcolor.replace(/^#/, "");
		},
		"set": function(a){
			this.fillcolor = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Polygon.prototype, "fillOpacity", {
		
		enumerable: true,
		"get": function()
		{
			if(!this.opacity || !this.opacity.length)
				return 0.6;
			
			return this.opacity;
		},
		"set": function(a){
			this.opacity = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Polygon.prototype, "strokeColor", {
		
		enumerable: true,
		"get": function()
		{
			if(!this.linecolor || !this.linecolor.length)
				return "#ff0000";
			
			return "#" + this.linecolor.replace(/^#/, "");
		},
		"set": function(a){
			this.linecolor = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Polygon.prototype, "strokeOpacity", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.lineopacity || !this.lineopacity.length)
				return 0.6;
			
			return this.lineopacity;
		},
		"set": function(a){
			this.lineopacity = a;
		}
		
	});

	Object.defineProperty(WPGMZA.Polygon.prototype, "strokeWeight", {
		enumerable: true,
		"get": function()
		{
			if(!this.linethickness || !this.linethickness.length)
				return 3;
			
			return parseInt(this.linethickness);
		}
		
	});
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Polygon.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProPolygon;
				return WPGMZA.OLPolygon;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProPolygon;
				return WPGMZA.GooglePolygon;
				break;
		}
	}
	
	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @returns {WPGMZA.Polygon} An instance of WPGMZA.Polygon
	 */
	WPGMZA.Polygon.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polygon.getConstructor();
		return new constructor(row, engineObject);
	}

	WPGMZA.Polygon.prototype.onAdded = function(){
        
    }
	
});