/**
 * @namespace WPGMZA
 * @module GooglePolyline
 * @requires WPGMZA.Polyline
 * @gulp-requires ../polyline.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtcG9seWxpbmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlUG9seWxpbmVcclxuICogQHJlcXVpcmVzIFdQR01aQS5Qb2x5bGluZVxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9wb2x5bGluZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlUG9seWxpbmUgPSBmdW5jdGlvbihvcHRpb25zLCBnb29nbGVQb2x5bGluZSlcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFdQR01aQS5Qb2x5bGluZS5jYWxsKHRoaXMsIG9wdGlvbnMsIGdvb2dsZVBvbHlsaW5lKTtcclxuXHRcdFxyXG5cdFx0aWYoZ29vZ2xlUG9seWxpbmUpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlUG9seWxpbmUgPSBnb29nbGVQb2x5bGluZTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5nb29nbGVQb2x5bGluZSA9IG5ldyBnb29nbGUubWFwcy5Qb2x5bGluZSh0aGlzLnNldHRpbmdzKTtcdFx0XHRcclxuXHRcdFx0XHJcblx0XHRcdGlmKG9wdGlvbnMpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgZ29vZ2xlT3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBvcHRpb25zKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihvcHRpb25zLnBvbHlkYXRhKVxyXG5cdFx0XHRcdFx0Z29vZ2xlT3B0aW9ucy5wYXRoID0gdGhpcy5wYXJzZUdlb21ldHJ5KG9wdGlvbnMucG9seWRhdGEpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKG9wdGlvbnMubGluZWNvbG9yKVxyXG5cdFx0XHRcdFx0Z29vZ2xlT3B0aW9ucy5zdHJva2VDb2xvciA9IFwiI1wiICsgb3B0aW9ucy5saW5lY29sb3I7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYob3B0aW9ucy5saW5ldGhpY2tuZXNzKVxyXG5cdFx0XHRcdFx0Z29vZ2xlT3B0aW9ucy5zdHJva2VXZWlnaHQgPSBwYXJzZUludChvcHRpb25zLmxpbmV0aGlja25lc3MpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKG9wdGlvbnMub3BhY2l0eSlcclxuXHRcdFx0XHRcdGdvb2dsZU9wdGlvbnMuc3Ryb2tlT3BhY2l0eSA9IHBhcnNlRmxvYXQob3B0aW9ucy5vcGFjaXR5KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYob3B0aW9ucyAmJiBvcHRpb25zLnBvbHlkYXRhKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHBhdGggPSB0aGlzLnBhcnNlR2VvbWV0cnkob3B0aW9ucy5wb2x5ZGF0YSk7XHJcblx0XHRcdFx0dGhpcy5zZXRQb2ludHMocGF0aCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVQb2x5bGluZS53cGdtemFQb2x5bGluZSA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlUG9seWxpbmUsIFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudCh7dHlwZTogXCJjbGlja1wifSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlsaW5lLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLlBvbHlsaW5lLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlsaW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5Hb29nbGVQb2x5bGluZTtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlUG9seWxpbmUucHJvdG90eXBlLnNldEVkaXRhYmxlID0gZnVuY3Rpb24odmFsdWUpXHJcblx0e1xyXG5cdFx0dGhpcy5nb29nbGVQb2x5bGluZS5zZXRPcHRpb25zKHtlZGl0YWJsZTogdmFsdWV9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlsaW5lLnByb3RvdHlwZS5zZXRQb2ludHMgPSBmdW5jdGlvbihwb2ludHMpXHJcblx0e1xyXG5cdFx0dGhpcy5nb29nbGVQb2x5bGluZS5zZXRPcHRpb25zKHtwYXRoOiBwb2ludHN9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlsaW5lLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHJlc3VsdCA9IFdQR01aQS5Qb2x5bGluZS5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHJlc3VsdC5wb2ludHMgPSBbXTtcclxuXHRcdFxyXG5cdFx0dmFyIHBhdGggPSB0aGlzLmdvb2dsZVBvbHlsaW5lLmdldFBhdGgoKTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoLmdldExlbmd0aCgpOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBsYXRMbmcgPSBwYXRoLmdldEF0KGkpO1xyXG5cdFx0XHRyZXN1bHQucG9pbnRzLnB1c2goe1xyXG5cdFx0XHRcdGxhdDogbGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogbGF0TG5nLmxuZygpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtcG9seWxpbmUuanMifQ==
