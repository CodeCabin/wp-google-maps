(function($) {
	WPGMZA.Polygon = function(row, googlePolygon)
	{
		var self = this;
		
		this.id = -1;
		this.modified = false;
		this.settings = {};
		this.paths = null;
		
		if(row)
		{
			for(var name in row)
				this[name] = row[name];
		}
		
		if(googlePolygon)
		{
			this.googlePolygon = googlePolygon;
		}
		else
		{
			this.googlePolygon = new google.maps.Polygon(this.settings);
			this.googlePolygon.wpgmzaPolygon = this;
			
			var points;
			if(row && (points = row.points))
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
		
		this.googlePolygon.wpgmzaPolygon = this;
			
		google.maps.event.addListener(this.googlePolygon, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.Polygon.prototype.toJSON = function()
	{
		var result = {
			id: 		this.id,
			name:		this.name,
			points:		[],
			settings: 	this.settings
		};
		
		// TODO: Support holes using multiple paths
		var path = this.googlePolygon.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.points.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
	eventDispatcher.apply(WPGMZA.Polygon.prototype);
})(jQuery);