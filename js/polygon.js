(function($) {
	WPGMZA.Polygon = function(options, googlePolygon)
	{
		var self = this;
		
		this.id = -1;
		this.modified = true;
		this.settings = {};
		this.name = options.name;
		this.paths = null;
		
		if(options && options.settings)
			this.settings = options.settings;
		
		if(googlePolygon)
		{
			this.googlePolygon = googlePolygon;
		}
		else
		{
			this.googlePolygon = new google.maps.Polygon(this.settings);
			this.googlePolygon.wpgmzaPolygon = this;
			
			var points;
			if(options && (points = options.points))
			{
				var stripped, pairs, coords, paths = [];
				stripped = points.replace(/[^ ,\d\.\-+e]/g, "");
				pairs = stripped.split(",");
				
				for(var i = 0; i < pairs.length; i++)
				{
					coords = pairs[i].split(" ");
					paths.push({
						lat: parseFloat(coords[1]),
						lng: parseFloat(coords[0])
					});
				}
				
				this.paths = paths;
				
				this.googlePolygon.setOptions({paths: paths});
			}
		}
			
		google.maps.event.addListener(this.googlePolygon, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	eventDispatcher.apply(WPGMZA.Polygon.prototype);
})(jQuery);