/**
 * @namespace WPGMZA
 * @module Polyline
 * @requires WPGMZA.MapObject
 */
jQuery(function($) {
	
	/**
	 * Base class for polylines. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polyline
	 * @constructor WPGMZA.Polyline
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polyline");
		
		this.title = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;
	
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
	 * @param {object} [row] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @returns {WPGMZA.Polyline} An instance of WPGMZA.Polyline
	 */
	WPGMZA.Polyline.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polyline.getConstructor();
		return new constructor(row, engineObject);
	}
	
	/**
	 * Gets the points on this polylines
	 * @return {array} An array of LatLng literals
	 */
	WPGMZA.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}
	
	/**
	 * Returns a JSON representation of this polyline, for serialization
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @returns {object} A JSON object representing this polyline
	 */
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}
	
	
});