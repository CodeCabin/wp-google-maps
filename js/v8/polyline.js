/**
 * @namespace WPGMZA
 * @module Polyline
 * @requires WPGMZA.MapObject
 */
jQuery(function($) {
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polyline");
		
		this.title = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;
	
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
	
	WPGMZA.Polyline.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polyline.getConstructor();
		return new constructor(row, engineObject);
	}
	
	WPGMZA.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}
	
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}
	
	
});