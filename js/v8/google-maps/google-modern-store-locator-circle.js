/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 * @gulp-requires ../modern-store-locator-circle.js
 */
jQuery(function($) {
	
	WPGMZA.GoogleModernStoreLocatorCircle = function(map, settings)
	{
		var self = this;
		
		WPGMZA.ModernStoreLocatorCircle.call(this, map, settings);
		
		this.intervalID = setInterval(function() {
			
			var mapSize = {
				width: $(self.mapElement).width(),
				height: $(self.mapElement).height()
			};
			
			if(mapSize.width == self.mapSize.width && mapSize.height == self.mapSize.height)
				return;
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
			self.mapSize = mapSize;
			
		}, 1000);
		
		$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
		});
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype = Object.create(WPGMZA.ModernStoreLocatorCircle.prototype);
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.constructor = WPGMZA.GoogleModernStoreLocatorCircle;
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		
		if(this.canvasLayer)
		{
			this.canvasLayer.setMap(null);
			this.canvasLayer.setAnimate(false);
		}
		
		this.canvasLayer = new CanvasLayer({
			map: this.map.googleMap,
			resizeHandler: function(event) {
				self.onResize(event);
			},
			updateHandler: function(event) {
				self.onUpdate(event);
			},
			animate: true,
			resolutionScale: this.getResolutionScale()
        });
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setOptions = function(options)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setOptions.call(this, options);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setPosition = function(position)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setPosition.call(this, position);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setRadius.call(this, radius);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var multiplierAtEquator = 0.006395;
		var spherical = google.maps.geometry.spherical;
		
		var center = this.settings.center;
		var equator = new WPGMZA.LatLng({
			lat: 0.0,
			lng: 0.0
		});
		var latitude = new WPGMZA.LatLng({
			lat: center.lat,
			lng: 0.0
		});
		
		var offsetAtEquator = spherical.computeOffset(equator.toGoogleLatLng(), km * 1000, 90);
		var offsetAtLatitude = spherical.computeOffset(latitude.toGoogleLatLng(), km * 1000, 90);
		
		var factor = offsetAtLatitude.lng() / offsetAtEquator.lng();
		var result = km * multiplierAtEquator * factor;
		
		if(isNaN(result))
			throw new Error("here");
		
		return result;
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvasLayer.canvas.width,
			height: this.canvasLayer.canvas.height
		};
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		var projection = this.map.googleMap.getProjection();
		var position = projection.fromLatLngToPoint(this.canvasLayer.getTopLeft());
		
		return {
			x: -position.x,
			y: -position.y
		};
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = new WPGMZA.LatLng(this.settings.center);
		var projection = this.map.googleMap.getProjection();
		return projection.fromLatLngToPoint(center.toGoogleLatLng());
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvasLayer.canvas.getContext("2d");
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getScale = function()
	{
		return Math.pow(2, this.map.getZoom()) * this.getResolutionScale();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setVisible = function(visible)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setVisible.call(this, visible);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.destroy = function()
	{
		this.canvasLayer.setMap(null);
		this.canvasLayer = null;
		
		clearInterval(this.intervalID);
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtbW9kZXJuLXN0b3JlLWxvY2F0b3ItY2lyY2xlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZU1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9tb2Rlcm4tc3RvcmUtbG9jYXRvci1jaXJjbGUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvckNpcmNsZSA9IGZ1bmN0aW9uKG1hcCwgc2V0dGluZ3MpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLmNhbGwodGhpcywgbWFwLCBzZXR0aW5ncyk7XHJcblx0XHRcclxuXHRcdHRoaXMuaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1hcFNpemUgPSB7XHJcblx0XHRcdFx0d2lkdGg6ICQoc2VsZi5tYXBFbGVtZW50KS53aWR0aCgpLFxyXG5cdFx0XHRcdGhlaWdodDogJChzZWxmLm1hcEVsZW1lbnQpLmhlaWdodCgpXHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHRpZihtYXBTaXplLndpZHRoID09IHNlbGYubWFwU2l6ZS53aWR0aCAmJiBtYXBTaXplLmhlaWdodCA9PSBzZWxmLm1hcFNpemUuaGVpZ2h0KVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYuY2FudmFzTGF5ZXIucmVzaXplXygpO1xyXG5cdFx0XHRzZWxmLmNhbnZhc0xheWVyLmRyYXcoKTtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYubWFwU2l6ZSA9IG1hcFNpemU7XHJcblx0XHRcdFxyXG5cdFx0fSwgMTAwMCk7XHJcblx0XHRcclxuXHRcdCQoZG9jdW1lbnQpLmJpbmQoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UgbW96ZnVsbHNjcmVlbmNoYW5nZSBmdWxsc2NyZWVuY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLmNhbnZhc0xheWVyLnJlc2l6ZV8oKTtcclxuXHRcdFx0c2VsZi5jYW52YXNMYXllci5kcmF3KCk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmluaXRDYW52YXNMYXllciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuY2FudmFzTGF5ZXIpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuY2FudmFzTGF5ZXIuc2V0TWFwKG51bGwpO1xyXG5cdFx0XHR0aGlzLmNhbnZhc0xheWVyLnNldEFuaW1hdGUoZmFsc2UpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmNhbnZhc0xheWVyID0gbmV3IENhbnZhc0xheWVyKHtcclxuXHRcdFx0bWFwOiB0aGlzLm1hcC5nb29nbGVNYXAsXHJcblx0XHRcdHJlc2l6ZUhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0c2VsZi5vblJlc2l6ZShldmVudCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdHVwZGF0ZUhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0c2VsZi5vblVwZGF0ZShldmVudCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdGFuaW1hdGU6IHRydWUsXHJcblx0XHRcdHJlc29sdXRpb25TY2FsZTogdGhpcy5nZXRSZXNvbHV0aW9uU2NhbGUoKVxyXG4gICAgICAgIH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblx0XHRcclxuXHRcdHRoaXMuY2FudmFzTGF5ZXIuc2NoZWR1bGVVcGRhdGUoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihwb3NpdGlvbilcclxuXHR7XHJcblx0XHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRQb3NpdGlvbi5jYWxsKHRoaXMsIHBvc2l0aW9uKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jYW52YXNMYXllci5zY2hlZHVsZVVwZGF0ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMgPSBmdW5jdGlvbihyYWRpdXMpXHJcblx0e1xyXG5cdFx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuc2V0UmFkaXVzLmNhbGwodGhpcywgcmFkaXVzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jYW52YXNMYXllci5zY2hlZHVsZVVwZGF0ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1lZFJhZGl1cyA9IGZ1bmN0aW9uKGttKVxyXG5cdHtcclxuXHRcdHZhciBtdWx0aXBsaWVyQXRFcXVhdG9yID0gMC4wMDYzOTU7XHJcblx0XHR2YXIgc3BoZXJpY2FsID0gZ29vZ2xlLm1hcHMuZ2VvbWV0cnkuc3BoZXJpY2FsO1xyXG5cdFx0XHJcblx0XHR2YXIgY2VudGVyID0gdGhpcy5zZXR0aW5ncy5jZW50ZXI7XHJcblx0XHR2YXIgZXF1YXRvciA9IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0bGF0OiAwLjAsXHJcblx0XHRcdGxuZzogMC4wXHJcblx0XHR9KTtcclxuXHRcdHZhciBsYXRpdHVkZSA9IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0bGF0OiBjZW50ZXIubGF0LFxyXG5cdFx0XHRsbmc6IDAuMFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHZhciBvZmZzZXRBdEVxdWF0b3IgPSBzcGhlcmljYWwuY29tcHV0ZU9mZnNldChlcXVhdG9yLnRvR29vZ2xlTGF0TG5nKCksIGttICogMTAwMCwgOTApO1xyXG5cdFx0dmFyIG9mZnNldEF0TGF0aXR1ZGUgPSBzcGhlcmljYWwuY29tcHV0ZU9mZnNldChsYXRpdHVkZS50b0dvb2dsZUxhdExuZygpLCBrbSAqIDEwMDAsIDkwKTtcclxuXHRcdFxyXG5cdFx0dmFyIGZhY3RvciA9IG9mZnNldEF0TGF0aXR1ZGUubG5nKCkgLyBvZmZzZXRBdEVxdWF0b3IubG5nKCk7XHJcblx0XHR2YXIgcmVzdWx0ID0ga20gKiBtdWx0aXBsaWVyQXRFcXVhdG9yICogZmFjdG9yO1xyXG5cdFx0XHJcblx0XHRpZihpc05hTihyZXN1bHQpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJoZXJlXCIpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRDYW52YXNEaW1lbnNpb25zID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHdpZHRoOiB0aGlzLmNhbnZhc0xheWVyLmNhbnZhcy53aWR0aCxcclxuXHRcdFx0aGVpZ2h0OiB0aGlzLmNhbnZhc0xheWVyLmNhbnZhcy5oZWlnaHRcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldFdvcmxkT3JpZ2luT2Zmc2V0ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwcm9qZWN0aW9uID0gdGhpcy5tYXAuZ29vZ2xlTWFwLmdldFByb2plY3Rpb24oKTtcclxuXHRcdHZhciBwb3NpdGlvbiA9IHByb2plY3Rpb24uZnJvbUxhdExuZ1RvUG9pbnQodGhpcy5jYW52YXNMYXllci5nZXRUb3BMZWZ0KCkpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OiAtcG9zaXRpb24ueCxcclxuXHRcdFx0eTogLXBvc2l0aW9uLnlcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldENlbnRlclBpeGVscyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgY2VudGVyID0gbmV3IFdQR01aQS5MYXRMbmcodGhpcy5zZXR0aW5ncy5jZW50ZXIpO1xyXG5cdFx0dmFyIHByb2plY3Rpb24gPSB0aGlzLm1hcC5nb29nbGVNYXAuZ2V0UHJvamVjdGlvbigpO1xyXG5cdFx0cmV0dXJuIHByb2plY3Rpb24uZnJvbUxhdExuZ1RvUG9pbnQoY2VudGVyLnRvR29vZ2xlTGF0TG5nKCkpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24odHlwZSlcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5jYW52YXNMYXllci5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRTY2FsZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gTWF0aC5wb3coMiwgdGhpcy5tYXAuZ2V0Wm9vbSgpKSAqIHRoaXMuZ2V0UmVzb2x1dGlvblNjYWxlKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLnNldFZpc2libGUuY2FsbCh0aGlzLCB2aXNpYmxlKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jYW52YXNMYXllci5zY2hlZHVsZVVwZGF0ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRoaXMuY2FudmFzTGF5ZXIuc2V0TWFwKG51bGwpO1xyXG5cdFx0dGhpcy5jYW52YXNMYXllciA9IG51bGw7XHJcblx0XHRcclxuXHRcdGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElEKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiZ29vZ2xlLW1hcHMvZ29vZ2xlLW1vZGVybi1zdG9yZS1sb2NhdG9yLWNpcmNsZS5qcyJ9
