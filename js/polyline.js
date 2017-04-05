(function($) {
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		this.id = -1;
		this.modified = false;
		this.settings = {};
		this.name = null;
		
		if(row)
		{
			for(var name in row)
				this[name] = row[name];
		}
		
		if(googlePolyline)
		{
			this.googlePolyline = googlePolyline;
		}
		else
		{
			this.googlePolyline = new google.maps.Polyline(this.settings);
			this.googlePolyline.wpgmzaPolyline = this;
			
			var points;
			if(row && (points = row.points))
			{
				var stripped, pairs, coords, path = [];
				stripped = points.replace(/[^ ,\d\.\-+e]/g, "");
				pairs = stripped.split(",");
				
				for(var i = 0; i < pairs.length; i++)
				{
					coords = pairs[i].split(" ");
					path.push({
						lat: parseFloat(coords[1]),
						lng: parseFloat(coords[0])
					});
				}
				
				this.googlePolyline.setOptions({path: path});
			}
		}
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
		
	}
	
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = {
			id:			this.id,
			name:		this.name,
			points:		[],
			settings:	this.settings
		};
		
		var path = this.googlePolyline.getPath();
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
	
	eventDispatcher.apply(WPGMZA.Polyline.prototype);
})(jQuery);