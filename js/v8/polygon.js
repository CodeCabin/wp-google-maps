/**
 * @namespace WPGMZA
 * @module Polygon
 * @requires WPGMZA.MapObject
 */
jQuery(function($) {
	
	/**
	 * Base class for polygons. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polygon
	 * @constructor WPGMZA.Polygon
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Polygon = function(row, enginePolygon)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polygon");
		
		this.paths = null;
		this.title = null;
		this.name = null;
		this.link = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polygon.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polygon.prototype.constructor = WPGMZA.Polygon;
	
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
	
	/**
	 * Returns a JSON representation of this polygon, for serialization
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @returns {object} A JSON object representing this polygon
	 */
	WPGMZA.Polygon.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		$.extend(result, {
			name:		this.name,
			title:		this.title,
			link:		this.link,
		});
	
		return result;
	}
	
});