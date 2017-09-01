(function($) {
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		this.title = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;
	
	WPGMZA.Polyline.createInstance = function(row)
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return new WPGMZA.GooglePolyline(row);
				break;
				
			default:
				return new WPGMZA.OSMPolyline(row);
				break;
		}
	}
	
	WPGMZA.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}
	
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