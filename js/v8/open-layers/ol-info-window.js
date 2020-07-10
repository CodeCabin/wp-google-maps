/**
 * @namespace WPGMZA
 * @module OLInfoWindow
 * @requires WPGMZA.InfoWindow
 * @gulp-requires ../info-window.js
 * @pro-requires WPGMZA.ProInfoWindow
 * @gulp-pro-requires pro-info-window.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLInfoWindow = function(mapObject)
	{
		var self = this;
		
		Parent.call(this, mapObject);
		
		this.element = $("<div class='wpgmza-infowindow ol-info-window-container ol-info-window-plain'></div>")[0];
			
		$(this.element).on("click", ".ol-info-window-close", function(event) {
			self.close();
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.OLInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.OLInfoWindow.prototype.constructor = WPGMZA.OLInfoWindow;
	
	Object.defineProperty(WPGMZA.OLInfoWindow.prototype, "isPanIntoViewAllowed", {
		
		"get": function()
		{
			return true;
		}
		
	});
	
	/**
	 * Opens the info window
	 * TODO: This should take a mapObject, not an event
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.OLInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		var latLng = mapObject.getPosition();
		
		if(!Parent.prototype.open.call(this, map, mapObject))
			return false;
		
		// Set parent for events to bubble up
		this.parent = map;
		
		if(this.overlay)
			this.mapObject.map.olMap.removeOverlay(this.overlay);
			
		this.overlay = new ol.Overlay({
			element: this.element,
			stopEvent: false
		});
		
		this.overlay.setPosition(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		self.mapObject.map.olMap.addOverlay(this.overlay);
		
		$(this.element).show();
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			WPGMZA.getImageDimensions(mapObject.getIcon(), function(size) {
				
				$(self.element).css({left: Math.round(size.width / 2) + "px"});
				
			});
		}
		
		this.trigger("infowindowopen");
		this.trigger("domready");
	}
	
	WPGMZA.OLInfoWindow.prototype.close = function(event)
	{
		// TODO: Why? This shouldn't have to be here. Removing the overlay should hide the element (it doesn't)
		$(this.element).hide();
		
		if(!this.overlay)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.trigger("infowindowclose");
		
		this.mapObject.map.olMap.removeOverlay(this.overlay);
		this.overlay = null;
	}
	
	WPGMZA.OLInfoWindow.prototype.setContent = function(html)
	{
		$(this.element).html("<i class='fa fa-times ol-info-window-close' aria-hidden='true'></i>" + html);
	}
	
	WPGMZA.OLInfoWindow.prototype.setOptions = function(options)
	{
		if(options.maxWidth)
		{
			$(this.element).css({"max-width": options.maxWidth + "px"});
		}
	}
	
	WPGMZA.OLInfoWindow.prototype.onOpen = function()
	{
		var self = this;
		var imgs = $(this.element).find("img");
		var numImages = imgs.length;
		var numImagesLoaded = 0;
		
		WPGMZA.InfoWindow.prototype.onOpen.apply(this, arguments);
		
		if(this.isPanIntoViewAllowed)
		{
			function inside(el, viewport)
			{
				var a = $(el)[0].getBoundingClientRect();
				var b = $(viewport)[0].getBoundingClientRect();
				
				return a.left >= b.left && a.left <= b.right &&
						a.right <= b.right && a.right >= b.left &&
						a.top >= b.top && a.top <= b.bottom &&
						a.bottom <= b.bottom && a.bottom >= b.top;
			}
			
			function panIntoView()
			{
				var height	= $(self.element).height();
				var offset	= -height * 0.45;
				
				self.mapObject.map.animateNudge(0, offset, self.mapObject.getPosition());
			}
			
			imgs.each(function(index, el) {
				el.onload = function() {
					if(++numImagesLoaded == numImages && !inside(self.element, self.mapObject.map.element))
						panIntoView();
				}
			});
			
			if(numImages == 0 && !inside(self.element, self.mapObject.map.element))
				panIntoView();
		}
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1pbmZvLXdpbmRvdy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBPTEluZm9XaW5kb3dcclxuICogQHJlcXVpcmVzIFdQR01aQS5JbmZvV2luZG93XHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2luZm8td2luZG93LmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb0luZm9XaW5kb3dcclxuICogQGd1bHAtcHJvLXJlcXVpcmVzIHByby1pbmZvLXdpbmRvdy5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5PTEluZm9XaW5kb3cgPSBmdW5jdGlvbihtYXBPYmplY3QpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQuY2FsbCh0aGlzLCBtYXBPYmplY3QpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmVsZW1lbnQgPSAkKFwiPGRpdiBjbGFzcz0nd3BnbXphLWluZm93aW5kb3cgb2wtaW5mby13aW5kb3ctY29udGFpbmVyIG9sLWluZm8td2luZG93LXBsYWluJz48L2Rpdj5cIilbMF07XHJcblx0XHRcdFxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIub2wtaW5mby13aW5kb3ctY2xvc2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5jbG9zZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9JbmZvV2luZG93O1xyXG5cdGVsc2VcclxuXHRcdFBhcmVudCA9IFdQR01aQS5JbmZvV2luZG93O1xyXG5cdFxyXG5cdFdQR01aQS5PTEluZm9XaW5kb3cucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQYXJlbnQucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuT0xJbmZvV2luZG93LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5PTEluZm9XaW5kb3c7XHJcblx0XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFdQR01aQS5PTEluZm9XaW5kb3cucHJvdG90eXBlLCBcImlzUGFuSW50b1ZpZXdBbGxvd2VkXCIsIHtcclxuXHRcdFxyXG5cdFx0XCJnZXRcIjogZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE9wZW5zIHRoZSBpbmZvIHdpbmRvd1xyXG5cdCAqIFRPRE86IFRoaXMgc2hvdWxkIHRha2UgYSBtYXBPYmplY3QsIG5vdCBhbiBldmVudFxyXG5cdCAqIEByZXR1cm4gYm9vbGVhbiBGQUxTRSBpZiB0aGUgaW5mbyB3aW5kb3cgc2hvdWxkIG5vdCAmIHdpbGwgbm90IG9wZW4sIFRSVUUgaWYgaXQgd2lsbFxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTEluZm9XaW5kb3cucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbihtYXAsIG1hcE9iamVjdClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgbGF0TG5nID0gbWFwT2JqZWN0LmdldFBvc2l0aW9uKCk7XHJcblx0XHRcclxuXHRcdGlmKCFQYXJlbnQucHJvdG90eXBlLm9wZW4uY2FsbCh0aGlzLCBtYXAsIG1hcE9iamVjdCkpXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFxyXG5cdFx0Ly8gU2V0IHBhcmVudCBmb3IgZXZlbnRzIHRvIGJ1YmJsZSB1cFxyXG5cdFx0dGhpcy5wYXJlbnQgPSBtYXA7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMub3ZlcmxheSlcclxuXHRcdFx0dGhpcy5tYXBPYmplY3QubWFwLm9sTWFwLnJlbW92ZU92ZXJsYXkodGhpcy5vdmVybGF5KTtcclxuXHRcdFx0XHJcblx0XHR0aGlzLm92ZXJsYXkgPSBuZXcgb2wuT3ZlcmxheSh7XHJcblx0XHRcdGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcclxuXHRcdFx0c3RvcEV2ZW50OiBmYWxzZVxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMub3ZlcmxheS5zZXRQb3NpdGlvbihvbC5wcm9qLmZyb21Mb25MYXQoW1xyXG5cdFx0XHRsYXRMbmcubG5nLFxyXG5cdFx0XHRsYXRMbmcubGF0XHJcblx0XHRdKSk7XHJcblx0XHRzZWxmLm1hcE9iamVjdC5tYXAub2xNYXAuYWRkT3ZlcmxheSh0aGlzLm92ZXJsYXkpO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuc2hvdygpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRXUEdNWkEuZ2V0SW1hZ2VEaW1lbnNpb25zKG1hcE9iamVjdC5nZXRJY29uKCksIGZ1bmN0aW9uKHNpemUpIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQkKHNlbGYuZWxlbWVudCkuY3NzKHtsZWZ0OiBNYXRoLnJvdW5kKHNpemUud2lkdGggLyAyKSArIFwicHhcIn0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy50cmlnZ2VyKFwiaW5mb3dpbmRvd29wZW5cIik7XHJcblx0XHR0aGlzLnRyaWdnZXIoXCJkb21yZWFkeVwiKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MSW5mb1dpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHQvLyBUT0RPOiBXaHk/IFRoaXMgc2hvdWxkbid0IGhhdmUgdG8gYmUgaGVyZS4gUmVtb3ZpbmcgdGhlIG92ZXJsYXkgc2hvdWxkIGhpZGUgdGhlIGVsZW1lbnQgKGl0IGRvZXNuJ3QpXHJcblx0XHQkKHRoaXMuZWxlbWVudCkuaGlkZSgpO1xyXG5cdFx0XHJcblx0XHRpZighdGhpcy5vdmVybGF5KVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5jbG9zZS5jYWxsKHRoaXMpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnRyaWdnZXIoXCJpbmZvd2luZG93Y2xvc2VcIik7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwT2JqZWN0Lm1hcC5vbE1hcC5yZW1vdmVPdmVybGF5KHRoaXMub3ZlcmxheSk7XHJcblx0XHR0aGlzLm92ZXJsYXkgPSBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xJbmZvV2luZG93LnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24oaHRtbClcclxuXHR7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuaHRtbChcIjxpIGNsYXNzPSdmYSBmYS10aW1lcyBvbC1pbmZvLXdpbmRvdy1jbG9zZScgYXJpYS1oaWRkZW49J3RydWUnPjwvaT5cIiArIGh0bWwpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xJbmZvV2luZG93LnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRpZihvcHRpb25zLm1heFdpZHRoKVxyXG5cdFx0e1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkuY3NzKHtcIm1heC13aWR0aFwiOiBvcHRpb25zLm1heFdpZHRoICsgXCJweFwifSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTEluZm9XaW5kb3cucHJvdG90eXBlLm9uT3BlbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgaW1ncyA9ICQodGhpcy5lbGVtZW50KS5maW5kKFwiaW1nXCIpO1xyXG5cdFx0dmFyIG51bUltYWdlcyA9IGltZ3MubGVuZ3RoO1xyXG5cdFx0dmFyIG51bUltYWdlc0xvYWRlZCA9IDA7XHJcblx0XHRcclxuXHRcdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5vbk9wZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5pc1BhbkludG9WaWV3QWxsb3dlZClcclxuXHRcdHtcclxuXHRcdFx0ZnVuY3Rpb24gaW5zaWRlKGVsLCB2aWV3cG9ydClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBhID0gJChlbClbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblx0XHRcdFx0dmFyIGIgPSAkKHZpZXdwb3J0KVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRyZXR1cm4gYS5sZWZ0ID49IGIubGVmdCAmJiBhLmxlZnQgPD0gYi5yaWdodCAmJlxyXG5cdFx0XHRcdFx0XHRhLnJpZ2h0IDw9IGIucmlnaHQgJiYgYS5yaWdodCA+PSBiLmxlZnQgJiZcclxuXHRcdFx0XHRcdFx0YS50b3AgPj0gYi50b3AgJiYgYS50b3AgPD0gYi5ib3R0b20gJiZcclxuXHRcdFx0XHRcdFx0YS5ib3R0b20gPD0gYi5ib3R0b20gJiYgYS5ib3R0b20gPj0gYi50b3A7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZ1bmN0aW9uIHBhbkludG9WaWV3KClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBoZWlnaHRcdD0gJChzZWxmLmVsZW1lbnQpLmhlaWdodCgpO1xyXG5cdFx0XHRcdHZhciBvZmZzZXRcdD0gLWhlaWdodCAqIDAuNDU7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c2VsZi5tYXBPYmplY3QubWFwLmFuaW1hdGVOdWRnZSgwLCBvZmZzZXQsIHNlbGYubWFwT2JqZWN0LmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpbWdzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XHJcblx0XHRcdFx0ZWwub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRpZigrK251bUltYWdlc0xvYWRlZCA9PSBudW1JbWFnZXMgJiYgIWluc2lkZShzZWxmLmVsZW1lbnQsIHNlbGYubWFwT2JqZWN0Lm1hcC5lbGVtZW50KSlcclxuXHRcdFx0XHRcdFx0cGFuSW50b1ZpZXcoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYobnVtSW1hZ2VzID09IDAgJiYgIWluc2lkZShzZWxmLmVsZW1lbnQsIHNlbGYubWFwT2JqZWN0Lm1hcC5lbGVtZW50KSlcclxuXHRcdFx0XHRwYW5JbnRvVmlldygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1pbmZvLXdpbmRvdy5qcyJ9
