/**
 * @namespace WPGMZA
 * @module OLModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 * @gulp-requires ../modern-store-locator-circle.js
 */
jQuery(function($) {
	
	WPGMZA.OLModernStoreLocatorCircle = function(map, settings)
	{
		WPGMZA.ModernStoreLocatorCircle.call(this, map, settings);
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype = Object.create(WPGMZA.ModernStoreLocatorCircle.prototype);
	WPGMZA.OLModernStoreLocatorCircle.prototype.constructor = WPGMZA.OLModernStoreLocatorCircle;
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		var mapElement = $(this.map.element);
		var olViewportElement = mapElement.children(".ol-viewport");
		
		this.canvas = document.createElement("canvas");
		this.canvas.className = "wpgmza-ol-canvas-overlay";
		mapElement.append(this.canvas);
		
		this.renderFunction = function(event) {
			
			if(self.canvas.width != olViewportElement.width() || self.canvas.height != olViewportElement.height())
			{
				self.canvas.width = olViewportElement.width();
				self.canvas.height = olViewportElement.height();
				
				$(this.canvas).css({
					width: olViewportElement.width() + "px",
					height: olViewportElement.height() + "px"
				});
			}
			
			self.draw();
		};
		
		this.map.olMap.on("postrender", this.renderFunction);
	}

	WPGMZA.OLModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvas.getContext(type);
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvas.width,
			height: this.canvas.height
		};
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = this.map.latLngToPixels(this.settings.center);
		
		return center;
	}
		
	WPGMZA.OLModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		return {
			x: 0,
			y: 0
		};
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var center = new WPGMZA.LatLng(this.settings.center);
		var outer = new WPGMZA.LatLng(center);
		
		outer.moveByDistance(km, 90);
		
		var centerPixels = this.map.latLngToPixels(center);
		var outerPixels = this.map.latLngToPixels(outer);
		
		return Math.abs(outerPixels.x - centerPixels.x);

		/*if(!window.testMarker){
			window.testMarker = WPGMZA.Marker.createInstance({
				position: outer
			});
			WPGMZA.maps[0].addMarker(window.testMarker);
		}
		
		return 100;*/
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getScale = function()
	{
		return 1;
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.destroy = function()
	{
		$(this.canvas).remove();
		
		this.map.olMap.un("postrender", this.renderFunction);
		this.map = null;
		this.canvas = null;
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1tb2Rlcm4tc3RvcmUtbG9jYXRvci1jaXJjbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuICogQHJlcXVpcmVzIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vbW9kZXJuLXN0b3JlLWxvY2F0b3ItY2lyY2xlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5PTE1vZGVyblN0b3JlTG9jYXRvckNpcmNsZSA9IGZ1bmN0aW9uKG1hcCwgc2V0dGluZ3MpXHJcblx0e1xyXG5cdFx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5jYWxsKHRoaXMsIG1hcCwgc2V0dGluZ3MpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5PTE1vZGVyblN0b3JlTG9jYXRvckNpcmNsZTtcclxuXHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmluaXRDYW52YXNMYXllciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgbWFwRWxlbWVudCA9ICQodGhpcy5tYXAuZWxlbWVudCk7XHJcblx0XHR2YXIgb2xWaWV3cG9ydEVsZW1lbnQgPSBtYXBFbGVtZW50LmNoaWxkcmVuKFwiLm9sLXZpZXdwb3J0XCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0XHR0aGlzLmNhbnZhcy5jbGFzc05hbWUgPSBcIndwZ216YS1vbC1jYW52YXMtb3ZlcmxheVwiO1xyXG5cdFx0bWFwRWxlbWVudC5hcHBlbmQodGhpcy5jYW52YXMpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnJlbmRlckZ1bmN0aW9uID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHNlbGYuY2FudmFzLndpZHRoICE9IG9sVmlld3BvcnRFbGVtZW50LndpZHRoKCkgfHwgc2VsZi5jYW52YXMuaGVpZ2h0ICE9IG9sVmlld3BvcnRFbGVtZW50LmhlaWdodCgpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0c2VsZi5jYW52YXMud2lkdGggPSBvbFZpZXdwb3J0RWxlbWVudC53aWR0aCgpO1xyXG5cdFx0XHRcdHNlbGYuY2FudmFzLmhlaWdodCA9IG9sVmlld3BvcnRFbGVtZW50LmhlaWdodCgpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdCQodGhpcy5jYW52YXMpLmNzcyh7XHJcblx0XHRcdFx0XHR3aWR0aDogb2xWaWV3cG9ydEVsZW1lbnQud2lkdGgoKSArIFwicHhcIixcclxuXHRcdFx0XHRcdGhlaWdodDogb2xWaWV3cG9ydEVsZW1lbnQuaGVpZ2h0KCkgKyBcInB4XCJcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0c2VsZi5kcmF3KCk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcC5vbE1hcC5vbihcInBvc3RyZW5kZXJcIiwgdGhpcy5yZW5kZXJGdW5jdGlvbik7XHJcblx0fVxyXG5cclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbih0eXBlKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KHR5cGUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldENhbnZhc0RpbWVuc2lvbnMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0d2lkdGg6IHRoaXMuY2FudmFzLndpZHRoLFxyXG5cdFx0XHRoZWlnaHQ6IHRoaXMuY2FudmFzLmhlaWdodFxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRDZW50ZXJQaXhlbHMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGNlbnRlciA9IHRoaXMubWFwLmxhdExuZ1RvUGl4ZWxzKHRoaXMuc2V0dGluZ3MuY2VudGVyKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGNlbnRlcjtcclxuXHR9XHJcblx0XHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldFdvcmxkT3JpZ2luT2Zmc2V0ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IDAsXHJcblx0XHRcdHk6IDBcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtZWRSYWRpdXMgPSBmdW5jdGlvbihrbSlcclxuXHR7XHJcblx0XHR2YXIgY2VudGVyID0gbmV3IFdQR01aQS5MYXRMbmcodGhpcy5zZXR0aW5ncy5jZW50ZXIpO1xyXG5cdFx0dmFyIG91dGVyID0gbmV3IFdQR01aQS5MYXRMbmcoY2VudGVyKTtcclxuXHRcdFxyXG5cdFx0b3V0ZXIubW92ZUJ5RGlzdGFuY2Uoa20sIDkwKTtcclxuXHRcdFxyXG5cdFx0dmFyIGNlbnRlclBpeGVscyA9IHRoaXMubWFwLmxhdExuZ1RvUGl4ZWxzKGNlbnRlcik7XHJcblx0XHR2YXIgb3V0ZXJQaXhlbHMgPSB0aGlzLm1hcC5sYXRMbmdUb1BpeGVscyhvdXRlcik7XHJcblx0XHRcclxuXHRcdHJldHVybiBNYXRoLmFicyhvdXRlclBpeGVscy54IC0gY2VudGVyUGl4ZWxzLngpO1xyXG5cclxuXHRcdC8qaWYoIXdpbmRvdy50ZXN0TWFya2VyKXtcclxuXHRcdFx0d2luZG93LnRlc3RNYXJrZXIgPSBXUEdNWkEuTWFya2VyLmNyZWF0ZUluc3RhbmNlKHtcclxuXHRcdFx0XHRwb3NpdGlvbjogb3V0ZXJcclxuXHRcdFx0fSk7XHJcblx0XHRcdFdQR01aQS5tYXBzWzBdLmFkZE1hcmtlcih3aW5kb3cudGVzdE1hcmtlcik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiAxMDA7Ki9cclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRTY2FsZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gMTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdCQodGhpcy5jYW52YXMpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcC5vbE1hcC51bihcInBvc3RyZW5kZXJcIiwgdGhpcy5yZW5kZXJGdW5jdGlvbik7XHJcblx0XHR0aGlzLm1hcCA9IG51bGw7XHJcblx0XHR0aGlzLmNhbnZhcyA9IG51bGw7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Im9wZW4tbGF5ZXJzL29sLW1vZGVybi1zdG9yZS1sb2NhdG9yLWNpcmNsZS5qcyJ9
