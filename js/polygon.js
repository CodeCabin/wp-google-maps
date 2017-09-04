(function($) {
	WPGMZA.Polygon = function(row, enginePolygon)
	{
		var self = this;
		
		this.paths = null;
		this.title = null;
		this.name = null;
		this.link = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polygon.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polygon.prototype.constructor = WPGMZA.Polygon;
	
	WPGMZA.Polygon.createInstance = function(row)
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				if(WPGMZA.isProVersion())
					return new WPGMZA.GoogleProPolygon(row);
				return new WPGMZA.GooglePolygon(row);
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return new WPGMZA.OSMProPolygon(row);
				return new WPGMZA.OSMPolygon(row);
				break;
		}
	}
	
	WPGMZA.Polygon.prototype.toJSON = function()
	{
		var result = {
			id: 		this.id,
			name:		this.name,
			title:		this.title,
			link:		this.link,
			settings: 	this.settings
		};
		
		return result;
	}
	
})(jQuery);