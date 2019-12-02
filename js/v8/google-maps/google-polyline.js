/**
 * @namespace WPGMZA
 * @module GooglePolyline
 * @requires WPGMZA.Polyline
 */
jQuery(function($) {
	
	WPGMZA.GooglePolyline = function(options, googlePolyline)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, options, googlePolyline);
		
		if(googlePolyline)
		{
			this.googlePolyline = googlePolyline;
		}
		else
		{
			this.googlePolyline = new google.maps.Polyline(this.settings);			
			
			if(options)
			{
				var googleOptions = $.extend({}, options);
				
				if(options.polydata)
					googleOptions.path = this.parseGeometry(options.polydata);
				
				if(options.linecolor)
					googleOptions.strokeColor = "#" + options.linecolor;
				
				if(options.linethickness)
					googleOptions.strokeWeight = parseInt(options.linethickness);
				
				if(options.opacity)
					googleOptions.strokeOpacity = parseFloat(options.opacity);
			}
			
			if(options && options.polydata)
			{
				var path = this.parseGeometry(options.polydata);
				this.setPoints(path);
			}
		}
		
		this.googlePolyline.wpgmzaPolyline = this;
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.GooglePolyline.prototype = Object.create(WPGMZA.Polyline.prototype);
	WPGMZA.GooglePolyline.prototype.constructor = WPGMZA.GooglePolyline;
	
	WPGMZA.GooglePolyline.prototype.setEditable = function(value)
	{
		this.googlePolyline.setOptions({editable: value});
	}
	
	WPGMZA.GooglePolyline.prototype.setPoints = function(points)
	{
		this.googlePolyline.setOptions({path: points});
	}
	
	WPGMZA.GooglePolyline.prototype.toJSON = function()
	{
		var result = WPGMZA.Polyline.prototype.toJSON.call(this);
		
		result.points = [];
		
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
	
});