(function($) {
	WPGMZA.Polygon = function(row, googlePolygon)
	{
		var self = this;
		
		this.paths = null;
		
		WPGMZA.MapObject.apply(this, arguments);
		
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
	
	WPGMZA.Polygon.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polygon.prototype.constructor = WPGMZA.Polygon;
	
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
	
})(jQuery);