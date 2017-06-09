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