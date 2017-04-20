(function($) {
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		this.name = null;
		
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
		
		WPGMZA.MapObject.apply(this, arguments);
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
		
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;
	
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
	
	
})(jQuery);