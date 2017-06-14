(function($) {
	
	WPGMZA.OSMPolyline = function(row)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, row);
	}
	
	WPGMZA.OSMPolyline.prototype
	
	if(WPGMZA.isProVersion())
		WPGMZA.OSMPolyline.prototype = Object.create(WPGMZA.ProPolyline.prototype);
	else
		WPGMZA.OSMPolyline.prototype = Object.create(WPGMZA.Polyline.prototype);
	WPGMZA.OSMPolyline.prototype.constructor = WPGMZA.OSMPolyline;
	
})(jQuery);