(function($) {
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		this.title = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;
	
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = {
			id:			this.id,
			title:		this.title,
			settings:	this.settings
		};
		
		return result;
	}
	
	
})(jQuery);