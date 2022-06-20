/**
 * @namespace WPGMZA
 * @module Polyline
 * @requires WPGMZA.Feature
 */
jQuery(function($) {
	
	/**
	 * Base class for polylines. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polyline
	 * @constructor WPGMZA.Polyline
	 * @memberof WPGMZA
	 * @param {object} [options] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @augments WPGMZA.Feature
	 */
	WPGMZA.Polyline = function(options, googlePolyline)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polyline");
		
		WPGMZA.Feature.apply(this, arguments);

		this.addEventListener("added", function(event) {
            self.onAdded();
        });
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.Feature.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;

	Object.defineProperty(WPGMZA.Polyline.prototype, "strokeColor", {
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

	Object.defineProperty(WPGMZA.Polyline.prototype, "strokeOpacity", {
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

	Object.defineProperty(WPGMZA.Polyline.prototype, "strokeWeight", {
		enumerable: true,
		"get": function()
		{
			if(!this.linethickness || !this.linethickness.length)
				return 1;
			
			return parseInt(this.linethickness);
		},
		"set": function(a){
			this.linethickness = a;
		}
		
	});

	Object.defineProperty(WPGMZA.Polyline.prototype, "layergroup", {
        enumerable : true,
        get: function() {
            if(this._layergroup){
                return this._layergroup;
            }
            return 0;
        },
        set: function(value) {
            if(parseInt(value)){
                this._layergroup = parseInt(value) + WPGMZA.Shape.BASE_LAYER_INDEX;
            }
        }
    });
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Polyline.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return WPGMZA.OLPolyline;
				break;
			
			default:
				return WPGMZA.GooglePolyline;
				break;
		}
	}
	
	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @param {object} [options] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @returns {WPGMZA.Polyline} An instance of WPGMZA.Polyline
	 */
	WPGMZA.Polyline.createInstance = function(options, engineObject)
	{
		var constructor = WPGMZA.Polyline.getConstructor();
		return new constructor(options, engineObject);
	}
	
	/**
	 * Gets the points on this polylines
	 * @return {array} An array of LatLng literals
	 */
	WPGMZA.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}

	WPGMZA.Polyline.prototype.onAdded = function(){
        if(this.layergroup){
            this.setLayergroup(this.layergroup);
        }
    }
	
	/**
	 * Returns a JSON representation of this polyline, for serialization
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @returns {object} A JSON object representing this polyline
	 */
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = WPGMZA.Feature.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}

	WPGMZA.Polyline.prototype.setLayergroup = function(layergroup){
	    this.layergroup = layergroup;
	    if(this.layergroup){
	        this.setOptions({
	            zIndex: this.layergroup
	        });
	    }
	} 
	
});