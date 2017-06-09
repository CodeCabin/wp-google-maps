(function($) {
	
	WPGMZA.DrawingManager = function(map)
	{
		WPGMZA.EventDispatcher.call(this);
		
		this.map = map;
	}
	
	WPGMZA.DrawingManager.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.DrawingManager.prototype.constructor = WPGMZA.DrawingManager;
	
	WPGMZA.DrawingManager.MODE_NONE				= null;
	WPGMZA.DrawingManager.MODE_MARKER			= "marker";
	WPGMZA.DrawingManager.MODE_POLYGON			= "polygon";
	WPGMZA.DrawingManager.MODE_POLYLINE			= "marker";
	
	WPGMZA.DrawingManager.createInstance = function(map)
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return new WPGMZA.GoogleDrawingManager(map);
				break;
				
			default:
				console.log("Not yet implemented");
				break;
		}
	}
	
})(jQuery);