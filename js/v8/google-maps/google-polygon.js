/**
 * @namespace WPGMZA
 * @module GooglePolygon
 * @requires WPGMZA.Polygon
 * @gulp-requires ../polygon.js
 * @pro-requires WPGMZA.ProPolygon
 * @gulp-pro-requires pro-polygon.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GooglePolygon = function(options, googlePolygon)
	{
		var self = this;
		
		Parent.call(this, options, googlePolygon);
		
		if(googlePolygon)
		{
			this.googlePolygon = googlePolygon;
		}
		else
		{
			this.googlePolygon = new google.maps.Polygon();
			
			if(options)
			{
				var googleOptions = $.extend({}, options);
				
				if(options.polydata)
					googleOptions.paths = this.parseGeometry(options.polydata);
				
				if(options.linecolor)
					googleOptions.strokeColor = "#" + options.linecolor;
				
				if(options.lineopacity)
					googleOptions.strokeOpacity = parseFloat(options.lineopacity);
				
				if(options.fillcolor)
					googleOptions.fillColor = "#" + options.fillcolor;
				
				if(options.opacity)
					googleOptions.fillOpacity = parseFloat(options.opacity);
				
				this.googlePolygon.setOptions(googleOptions);
			}
		}
		
		this.googlePolygon.wpgmzaPolygon = this;
			
		google.maps.event.addListener(this.googlePolygon, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
		
	WPGMZA.GooglePolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.GooglePolygon.prototype.constructor = WPGMZA.GooglePolygon;
	
	/**
	 * Returns true if the polygon is editable
	 * @return void
	 */
	WPGMZA.GooglePolygon.prototype.getEditable = function()
	{
		return this.googlePolygon.getOptions().editable;
	}
	
	/**
	 * Sets the editable state of the polygon
	 * @return void
	 */
	WPGMZA.GooglePolygon.prototype.setEditable = function(value)
	{
		this.googlePolygon.setOptions({editable: value});
	}
	
	/**
	 * Returns the polygon represented by a JSON object
	 * @return object
	 */
	WPGMZA.GooglePolygon.prototype.toJSON = function()
	{
		var result = WPGMZA.Polygon.prototype.toJSON.call(this);
		
		result.points = [];
		
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
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtcG9seWdvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBHb29nbGVQb2x5Z29uXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuUG9seWdvblxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9wb2x5Z29uLmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb1BvbHlnb25cclxuICogQGd1bHAtcHJvLXJlcXVpcmVzIHByby1wb2x5Z29uLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdHZhciBQYXJlbnQ7XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlnb24gPSBmdW5jdGlvbihvcHRpb25zLCBnb29nbGVQb2x5Z29uKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0UGFyZW50LmNhbGwodGhpcywgb3B0aW9ucywgZ29vZ2xlUG9seWdvbik7XHJcblx0XHRcclxuXHRcdGlmKGdvb2dsZVBvbHlnb24pXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlUG9seWdvbiA9IGdvb2dsZVBvbHlnb247XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlUG9seWdvbiA9IG5ldyBnb29nbGUubWFwcy5Qb2x5Z29uKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIGdvb2dsZU9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgb3B0aW9ucyk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYob3B0aW9ucy5wb2x5ZGF0YSlcclxuXHRcdFx0XHRcdGdvb2dsZU9wdGlvbnMucGF0aHMgPSB0aGlzLnBhcnNlR2VvbWV0cnkob3B0aW9ucy5wb2x5ZGF0YSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYob3B0aW9ucy5saW5lY29sb3IpXHJcblx0XHRcdFx0XHRnb29nbGVPcHRpb25zLnN0cm9rZUNvbG9yID0gXCIjXCIgKyBvcHRpb25zLmxpbmVjb2xvcjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihvcHRpb25zLmxpbmVvcGFjaXR5KVxyXG5cdFx0XHRcdFx0Z29vZ2xlT3B0aW9ucy5zdHJva2VPcGFjaXR5ID0gcGFyc2VGbG9hdChvcHRpb25zLmxpbmVvcGFjaXR5KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihvcHRpb25zLmZpbGxjb2xvcilcclxuXHRcdFx0XHRcdGdvb2dsZU9wdGlvbnMuZmlsbENvbG9yID0gXCIjXCIgKyBvcHRpb25zLmZpbGxjb2xvcjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihvcHRpb25zLm9wYWNpdHkpXHJcblx0XHRcdFx0XHRnb29nbGVPcHRpb25zLmZpbGxPcGFjaXR5ID0gcGFyc2VGbG9hdChvcHRpb25zLm9wYWNpdHkpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZ29vZ2xlUG9seWdvbi5zZXRPcHRpb25zKGdvb2dsZU9wdGlvbnMpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuZ29vZ2xlUG9seWdvbi53cGdtemFQb2x5Z29uID0gdGhpcztcclxuXHRcdFx0XHJcblx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLmdvb2dsZVBvbHlnb24sIFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudCh7dHlwZTogXCJjbGlja1wifSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLlByb1BvbHlnb247XHJcblx0ZWxzZVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLlBvbHlnb247XHJcblx0XHRcclxuXHRXUEdNWkEuR29vZ2xlUG9seWdvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBhcmVudC5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5Hb29nbGVQb2x5Z29uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5Hb29nbGVQb2x5Z29uO1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcG9seWdvbiBpcyBlZGl0YWJsZVxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVQb2x5Z29uLnByb3RvdHlwZS5nZXRFZGl0YWJsZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5nb29nbGVQb2x5Z29uLmdldE9wdGlvbnMoKS5lZGl0YWJsZTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgZWRpdGFibGUgc3RhdGUgb2YgdGhlIHBvbHlnb25cclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlUG9seWdvbi5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbih2YWx1ZSlcclxuXHR7XHJcblx0XHR0aGlzLmdvb2dsZVBvbHlnb24uc2V0T3B0aW9ucyh7ZWRpdGFibGU6IHZhbHVlfSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHBvbHlnb24gcmVwcmVzZW50ZWQgYnkgYSBKU09OIG9iamVjdFxyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZVBvbHlnb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gV1BHTVpBLlBvbHlnb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKHRoaXMpO1xyXG5cdFx0XHJcblx0XHRyZXN1bHQucG9pbnRzID0gW107XHJcblx0XHRcclxuXHRcdC8vIFRPRE86IFN1cHBvcnQgaG9sZXMgdXNpbmcgbXVsdGlwbGUgcGF0aHNcclxuXHRcdHZhciBwYXRoID0gdGhpcy5nb29nbGVQb2x5Z29uLmdldFBhdGgoKTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoLmdldExlbmd0aCgpOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBsYXRMbmcgPSBwYXRoLmdldEF0KGkpO1xyXG5cdFx0XHRyZXN1bHQucG9pbnRzLnB1c2goe1xyXG5cdFx0XHRcdGxhdDogbGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogbGF0TG5nLmxuZygpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtcG9seWdvbi5qcyJ9
