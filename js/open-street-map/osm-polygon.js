(function($) {
	
	WPGMZA.OSMPolygon = function(row)
	{
		var self = this;
		
		WPGMZA.Polygon.call(this, row);
	}
	
	WPGMZA.OSMPolygon.prototype
	
	if(WPGMZA.isProVersion())
		WPGMZA.OSMPolygon.prototype = Object.create(WPGMZA.ProPolygon.prototype);
	else
		WPGMZA.OSMPolygon.prototype = Object.create(WPGMZA.Polygon.prototype);
	WPGMZA.OSMPolygon.prototype.constructor = WPGMZA.OSMPolygon;
	
})(jQuery);