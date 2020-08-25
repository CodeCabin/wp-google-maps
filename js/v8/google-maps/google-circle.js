/**
 * @namespace WPGMZA
 * @module GoogleCircle
 * @requires WPGMZA.Circle
 * @gulp-requires ../circle.js
 */
jQuery(function($) {
	
	/**
	 * Subclass, used when Google is the maps engine. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.GoogleCircle
	 * @constructor WPGMZA.GoogleCircle
	 * @memberof WPGMZA
	 * @augments WPGMZA.Circle
	 * @see WPGMZA.Circle.createInstance
	 */
	WPGMZA.GoogleCircle = function(options, googleCircle)
	{
		var self = this;
		
		WPGMZA.Circle.call(this, options, googleCircle);
		
		if(googleCircle)
		{
			this.googleCircle = googleCircle;
		}
		else
		{
			this.googleCircle = new google.maps.Circle();
			this.googleCircle.wpgmzaCircle = this;
		}
		
		google.maps.event.addListener(this.googleCircle, "click", function() {
			self.dispatchEvent({type: "click"});
		});
		
		if(options)
			this.setOptions(options);
	}
	
	WPGMZA.GoogleCircle.prototype = Object.create(WPGMZA.Circle.prototype);
	WPGMZA.GoogleCircle.prototype.constructor = WPGMZA.GoogleCircle;
	
	WPGMZA.GoogleCircle.prototype.setCenter = function(center)
	{
		WPGMZA.Circle.prototype.setCenter.apply(this, arguments);
		
		this.googleCircle.setCenter(center);
	}
	
	WPGMZA.GoogleCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
		
		this.googleCircle.setRadius(parseFloat(radius) * 1000);
	}
	
	WPGMZA.GoogleCircle.prototype.setVisible = function(visible)
	{
		this.googleCircle.setVisible(visible ? true : false);
	}
	
	WPGMZA.GoogleCircle.prototype.setOptions = function(options)
	{
		var googleOptions = {};
		
		googleOptions = $.extend({}, options);
		delete googleOptions.map;
		delete googleOptions.center;
		
		if(options.center)
			googleOptions.center = new google.maps.LatLng({
				lat: parseFloat(options.center.lat),
				lng: parseFloat(options.center.lng)
			});
			
		if(options.radius)
			googleOptions.radius = parseFloat(options.radius);
		
		if(options.color)
			googleOptions.fillColor = options.color;
		
		if(options.opacity)
		{
			googleOptions.fillOpacity = parseFloat(options.opacity);
			googleOptions.strokeOpacity = parseFloat(options.opacity);

		}
		
		this.googleCircle.setOptions(googleOptions);
		
		if(options.map)
			options.map.addCircle(this);
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtY2lyY2xlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZUNpcmNsZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkNpcmNsZVxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9jaXJjbGUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogU3ViY2xhc3MsIHVzZWQgd2hlbiBHb29nbGUgaXMgdGhlIG1hcHMgZW5naW5lLiA8c3Ryb25nPlBsZWFzZSA8ZW0+ZG8gbm90PC9lbT4gY2FsbCB0aGlzIGNvbnN0cnVjdG9yIGRpcmVjdGx5LiBBbHdheXMgdXNlIGNyZWF0ZUluc3RhbmNlIHJhdGhlciB0aGFuIGluc3RhbnRpYXRpbmcgdGhpcyBjbGFzcyBkaXJlY3RseS48L3N0cm9uZz4gVXNpbmcgY3JlYXRlSW5zdGFuY2UgYWxsb3dzIHRoaXMgY2xhc3MgdG8gYmUgZXh0ZXJuYWxseSBleHRlbnNpYmxlLlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuR29vZ2xlQ2lyY2xlXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5Hb29nbGVDaXJjbGVcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQGF1Z21lbnRzIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAc2VlIFdQR01aQS5DaXJjbGUuY3JlYXRlSW5zdGFuY2VcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlQ2lyY2xlID0gZnVuY3Rpb24ob3B0aW9ucywgZ29vZ2xlQ2lyY2xlKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0V1BHTVpBLkNpcmNsZS5jYWxsKHRoaXMsIG9wdGlvbnMsIGdvb2dsZUNpcmNsZSk7XHJcblx0XHRcclxuXHRcdGlmKGdvb2dsZUNpcmNsZSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5nb29nbGVDaXJjbGUgPSBnb29nbGVDaXJjbGU7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlQ2lyY2xlID0gbmV3IGdvb2dsZS5tYXBzLkNpcmNsZSgpO1xyXG5cdFx0XHR0aGlzLmdvb2dsZUNpcmNsZS53cGdtemFDaXJjbGUgPSB0aGlzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLmdvb2dsZUNpcmNsZSwgXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2VsZi5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcImNsaWNrXCJ9KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zKVxyXG5cdFx0XHR0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVDaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZUNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuR29vZ2xlQ2lyY2xlO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVDaXJjbGUucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uKGNlbnRlcilcclxuXHR7XHJcblx0XHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRDZW50ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVDaXJjbGUuc2V0Q2VudGVyKGNlbnRlcik7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVDaXJjbGUucHJvdG90eXBlLnNldFJhZGl1cyA9IGZ1bmN0aW9uKHJhZGl1cylcclxuXHR7XHJcblx0XHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVDaXJjbGUuc2V0UmFkaXVzKHBhcnNlRmxvYXQocmFkaXVzKSAqIDEwMDApO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlQ2lyY2xlLnByb3RvdHlwZS5zZXRWaXNpYmxlID0gZnVuY3Rpb24odmlzaWJsZSlcclxuXHR7XHJcblx0XHR0aGlzLmdvb2dsZUNpcmNsZS5zZXRWaXNpYmxlKHZpc2libGUgPyB0cnVlIDogZmFsc2UpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlQ2lyY2xlLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHR2YXIgZ29vZ2xlT3B0aW9ucyA9IHt9O1xyXG5cdFx0XHJcblx0XHRnb29nbGVPcHRpb25zID0gJC5leHRlbmQoe30sIG9wdGlvbnMpO1xyXG5cdFx0ZGVsZXRlIGdvb2dsZU9wdGlvbnMubWFwO1xyXG5cdFx0ZGVsZXRlIGdvb2dsZU9wdGlvbnMuY2VudGVyO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLmNlbnRlcilcclxuXHRcdFx0Z29vZ2xlT3B0aW9ucy5jZW50ZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHtcclxuXHRcdFx0XHRsYXQ6IHBhcnNlRmxvYXQob3B0aW9ucy5jZW50ZXIubGF0KSxcclxuXHRcdFx0XHRsbmc6IHBhcnNlRmxvYXQob3B0aW9ucy5jZW50ZXIubG5nKVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0XHJcblx0XHRpZihvcHRpb25zLnJhZGl1cylcclxuXHRcdFx0Z29vZ2xlT3B0aW9ucy5yYWRpdXMgPSBwYXJzZUZsb2F0KG9wdGlvbnMucmFkaXVzKTtcclxuXHRcdFxyXG5cdFx0aWYob3B0aW9ucy5jb2xvcilcclxuXHRcdFx0Z29vZ2xlT3B0aW9ucy5maWxsQ29sb3IgPSBvcHRpb25zLmNvbG9yO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLm9wYWNpdHkpXHJcblx0XHR7XHJcblx0XHRcdGdvb2dsZU9wdGlvbnMuZmlsbE9wYWNpdHkgPSBwYXJzZUZsb2F0KG9wdGlvbnMub3BhY2l0eSk7XHJcblx0XHRcdGdvb2dsZU9wdGlvbnMuc3Ryb2tlT3BhY2l0eSA9IHBhcnNlRmxvYXQob3B0aW9ucy5vcGFjaXR5KTtcclxuXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuZ29vZ2xlQ2lyY2xlLnNldE9wdGlvbnMoZ29vZ2xlT3B0aW9ucyk7XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMubWFwKVxyXG5cdFx0XHRvcHRpb25zLm1hcC5hZGRDaXJjbGUodGhpcyk7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Imdvb2dsZS1tYXBzL2dvb2dsZS1jaXJjbGUuanMifQ==
