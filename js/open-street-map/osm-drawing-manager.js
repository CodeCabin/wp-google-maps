(function($) {
	
	WPGMZA.OSMDrawingManager = function(map)
	{
		WPGMZA.DrawingManager.call(this, map);
	}
	
	WPGMZA.OSMDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.OSMDrawingManager.prototype.constructor = WPGMZA.OSMDrawingManager;
	
})(jQuery);