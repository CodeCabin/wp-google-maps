(function($) {
	WPGMZA.Polyline = function(options, googlePolyline)
	{
		var self = this;
		
		this.id = -1;
		this.modified = true;
		this.settings = {};
		this.name = options.name;
		this.path = null;
		
		if(options && options.settings)
			this.settings = options.settings;
		
		if(googlePolyline)
		{
			this.googlePolyline = googlePolyline;
		}
		else
		{
			this.googlePolyline = new google.maps.Polyline(this.settings);
			this.googlePolyline.wpgmzaPolyline = this;
			
			var points;
			if(options && (points = options.points))
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
				
				this.path = path;
				
				this.googlePolyline.setOptions({path: path});
			}
		}
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
		
		eventDispatcher.apply(WPGMZA.Polyline.prototype);
	}
})(jQuery);