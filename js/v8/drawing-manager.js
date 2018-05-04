/**
 * @namespace WPGMZA
 * @module DrawingManager
 * @requires WPGMZA.EventDispatcher
 */
(function($) {
	
	WPGMZA.DrawingManager = function(map)
	{
		WPGMZA.assertInstanceOf(this, "DrawingManager");
		
		WPGMZA.EventDispatcher.call(this);
		
		this.map = map;
		this.mode = WPGMZA.DrawingManager.MODE_NONE;
	}
	
	WPGMZA.DrawingManager.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.DrawingManager.prototype.constructor = WPGMZA.DrawingManager;
	
	WPGMZA.DrawingManager.MODE_NONE				= null;
	WPGMZA.DrawingManager.MODE_MARKER			= "marker";
	WPGMZA.DrawingManager.MODE_POLYGON			= "polygon";
	WPGMZA.DrawingManager.MODE_POLYLINE			= "polyline";
	
	WPGMZA.DrawingManager.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return WPGMZA.GoogleDrawingManager;
				break;
				
			default:
				return WPGMZA.OSMDrawingManager;
				break;
		}
	}
	
	WPGMZA.DrawingManager.createInstance = function(map)
	{
		var constructor = WPGMZA.DrawingManager.getConstructor();
		return new constructor(map);
	}
	
	WPGMZA.DrawingManager.prototype.setDrawingMode = function(mode)
	{
		this.mode = mode;
	}
	
})(jQuery);