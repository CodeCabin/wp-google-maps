/**
 * @namespace WPGMZA
 * @module GoogleInfoWindow
 * @requires WPGMZA.InfoWindow
 * @gulp-requires ../info-window.js
 * @pro-requires WPGMZA.ProInfoWindow
 * @gulp-pro-requires pro-info-window.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleInfoWindow = function(mapObject)
	{
		Parent.call(this, mapObject);
		
		this.setMapObject(mapObject);
	}
	
	WPGMZA.GoogleInfoWindow.Z_INDEX		= 99;
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleInfoWindow.prototype.constructor = WPGMZA.GoogleInfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype.setMapObject = function(mapObject)
	{
		if(mapObject instanceof WPGMZA.Marker)
			this.googleObject = mapObject.googleMarker;
		else if(mapObject instanceof WPGMZA.Polygon)
			this.googleObject = mapObject.googlePolygon;
		else if(mapObject instanceof WPGMZA.Polyline)
			this.googleObject = mapObject.googlePolyline;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.createGoogleInfoWindow = function()
	{
		var self = this;
		
		if(this.googleInfoWindow)
			return;
		
		this.googleInfoWindow = new google.maps.InfoWindow();
		
		this.googleInfoWindow.setZIndex(WPGMZA.GoogleInfoWindow.Z_INDEX);
		
		google.maps.event.addListener(this.googleInfoWindow, "domready", function(event) {
			self.trigger("domready");
		});
		
		google.maps.event.addListener(this.googleInfoWindow, "closeclick", function(event) {
			
			if(self.state == WPGMZA.InfoWindow.STATE_CLOSED)
				return;
			
			self.state = WPGMZA.InfoWindow.STATE_CLOSED;
			self.trigger("infowindowclose");
			
		});
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.GoogleInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		if(!Parent.prototype.open.call(this, map, mapObject))
			return false;
		
		// Set parent for events to bubble up to
		this.parent = map;
		
		this.createGoogleInfoWindow();
		this.setMapObject(mapObject);

		if(this.googleObject instanceof google.maps.Polygon)
		{

		}
		else{
			this.googleInfoWindow.open(
				this.mapObject.map.googleMap,
				this.googleObject
			);
		}
		

		
		var guid = WPGMZA.guid();
		var html = "<div id='" + guid + "'>" + this.content + "</div>";

		this.googleInfoWindow.setContent(html);
		
		var intervalID;
		intervalID = setInterval(function(event) {
			
			div = $("#" + guid);
			
			if(div.length)
			{
				clearInterval(intervalID);
				
				div[0].wpgmzaMapObject = self.mapObject;
				div.addClass("wpgmza-infowindow");
				
				self.element = div[0];
				self.trigger("infowindowopen");
			}
			
		}, 50);
		
		return true;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.close = function()
	{
		if(!this.googleInfoWindow)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.googleInfoWindow.close();
	}
	
	WPGMZA.GoogleInfoWindow.prototype.setContent = function(html)
	{
		Parent.prototype.setContent.call(this, html);
		
		this.content = html;
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setContent(html);
	}
	
	WPGMZA.GoogleInfoWindow.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setOptions(options);
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtaW5mby13aW5kb3cuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlSW5mb1dpbmRvd1xyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkluZm9XaW5kb3dcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vaW5mby13aW5kb3cuanNcclxuICogQHByby1yZXF1aXJlcyBXUEdNWkEuUHJvSW5mb1dpbmRvd1xyXG4gKiBAZ3VscC1wcm8tcmVxdWlyZXMgcHJvLWluZm8td2luZG93LmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdHZhciBQYXJlbnQ7XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cgPSBmdW5jdGlvbihtYXBPYmplY3QpXHJcblx0e1xyXG5cdFx0UGFyZW50LmNhbGwodGhpcywgbWFwT2JqZWN0KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZXRNYXBPYmplY3QobWFwT2JqZWN0KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cuWl9JTkRFWFx0XHQ9IDk5O1xyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9JbmZvV2luZG93O1xyXG5cdGVsc2VcclxuXHRcdFBhcmVudCA9IFdQR01aQS5JbmZvV2luZG93O1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVJbmZvV2luZG93LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGFyZW50LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLkdvb2dsZUluZm9XaW5kb3c7XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cucHJvdG90eXBlLnNldE1hcE9iamVjdCA9IGZ1bmN0aW9uKG1hcE9iamVjdClcclxuXHR7XHJcblx0XHRpZihtYXBPYmplY3QgaW5zdGFuY2VvZiBXUEdNWkEuTWFya2VyKVxyXG5cdFx0XHR0aGlzLmdvb2dsZU9iamVjdCA9IG1hcE9iamVjdC5nb29nbGVNYXJrZXI7XHJcblx0XHRlbHNlIGlmKG1hcE9iamVjdCBpbnN0YW5jZW9mIFdQR01aQS5Qb2x5Z29uKVxyXG5cdFx0XHR0aGlzLmdvb2dsZU9iamVjdCA9IG1hcE9iamVjdC5nb29nbGVQb2x5Z29uO1xyXG5cdFx0ZWxzZSBpZihtYXBPYmplY3QgaW5zdGFuY2VvZiBXUEdNWkEuUG9seWxpbmUpXHJcblx0XHRcdHRoaXMuZ29vZ2xlT2JqZWN0ID0gbWFwT2JqZWN0Lmdvb2dsZVBvbHlsaW5lO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSW5mb1dpbmRvdy5wcm90b3R5cGUuY3JlYXRlR29vZ2xlSW5mb1dpbmRvdyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuZ29vZ2xlSW5mb1dpbmRvdylcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZUluZm9XaW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdygpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZUluZm9XaW5kb3cuc2V0WkluZGV4KFdQR01aQS5Hb29nbGVJbmZvV2luZG93LlpfSU5ERVgpO1xyXG5cdFx0XHJcblx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLmdvb2dsZUluZm9XaW5kb3csIFwiZG9tcmVhZHlcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi50cmlnZ2VyKFwiZG9tcmVhZHlcIik7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5nb29nbGVJbmZvV2luZG93LCBcImNsb3NlY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHNlbGYuc3RhdGUgPT0gV1BHTVpBLkluZm9XaW5kb3cuU1RBVEVfQ0xPU0VEKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYuc3RhdGUgPSBXUEdNWkEuSW5mb1dpbmRvdy5TVEFURV9DTE9TRUQ7XHJcblx0XHRcdHNlbGYudHJpZ2dlcihcImluZm93aW5kb3djbG9zZVwiKTtcclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogT3BlbnMgdGhlIGluZm8gd2luZG93XHJcblx0ICogQHJldHVybiBib29sZWFuIEZBTFNFIGlmIHRoZSBpbmZvIHdpbmRvdyBzaG91bGQgbm90ICYgd2lsbCBub3Qgb3BlbiwgVFJVRSBpZiBpdCB3aWxsXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbihtYXAsIG1hcE9iamVjdClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGlmKCFQYXJlbnQucHJvdG90eXBlLm9wZW4uY2FsbCh0aGlzLCBtYXAsIG1hcE9iamVjdCkpXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFxyXG5cdFx0Ly8gU2V0IHBhcmVudCBmb3IgZXZlbnRzIHRvIGJ1YmJsZSB1cCB0b1xyXG5cdFx0dGhpcy5wYXJlbnQgPSBtYXA7XHJcblx0XHRcclxuXHRcdHRoaXMuY3JlYXRlR29vZ2xlSW5mb1dpbmRvdygpO1xyXG5cdFx0dGhpcy5zZXRNYXBPYmplY3QobWFwT2JqZWN0KTtcclxuXHJcblx0XHRpZih0aGlzLmdvb2dsZU9iamVjdCBpbnN0YW5jZW9mIGdvb2dsZS5tYXBzLlBvbHlnb24pXHJcblx0XHR7XHJcblxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dGhpcy5nb29nbGVJbmZvV2luZG93Lm9wZW4oXHJcblx0XHRcdFx0dGhpcy5tYXBPYmplY3QubWFwLmdvb2dsZU1hcCxcclxuXHRcdFx0XHR0aGlzLmdvb2dsZU9iamVjdFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblxyXG5cdFx0XHJcblx0XHR2YXIgZ3VpZCA9IFdQR01aQS5ndWlkKCk7XHJcblx0XHR2YXIgaHRtbCA9IFwiPGRpdiBpZD0nXCIgKyBndWlkICsgXCInPlwiICsgdGhpcy5jb250ZW50ICsgXCI8L2Rpdj5cIjtcclxuXHJcblx0XHR0aGlzLmdvb2dsZUluZm9XaW5kb3cuc2V0Q29udGVudChodG1sKTtcclxuXHRcdFxyXG5cdFx0dmFyIGludGVydmFsSUQ7XHJcblx0XHRpbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdGRpdiA9ICQoXCIjXCIgKyBndWlkKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGRpdi5sZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjbGVhckludGVydmFsKGludGVydmFsSUQpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGRpdlswXS53cGdtemFNYXBPYmplY3QgPSBzZWxmLm1hcE9iamVjdDtcclxuXHRcdFx0XHRkaXYuYWRkQ2xhc3MoXCJ3cGdtemEtaW5mb3dpbmRvd1wiKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRzZWxmLmVsZW1lbnQgPSBkaXZbMF07XHJcblx0XHRcdFx0c2VsZi50cmlnZ2VyKFwiaW5mb3dpbmRvd29wZW5cIik7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHR9LCA1MCk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSW5mb1dpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoIXRoaXMuZ29vZ2xlSW5mb1dpbmRvdylcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuSW5mb1dpbmRvdy5wcm90b3R5cGUuY2xvc2UuY2FsbCh0aGlzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVJbmZvV2luZG93LmNsb3NlKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVJbmZvV2luZG93LnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24oaHRtbClcclxuXHR7XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnNldENvbnRlbnQuY2FsbCh0aGlzLCBodG1sKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jb250ZW50ID0gaHRtbDtcclxuXHRcdFxyXG5cdFx0dGhpcy5jcmVhdGVHb29nbGVJbmZvV2luZG93KCk7XHJcblx0XHRcclxuXHRcdHRoaXMuZ29vZ2xlSW5mb1dpbmRvdy5zZXRDb250ZW50KGh0bWwpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSW5mb1dpbmRvdy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpXHJcblx0e1xyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5zZXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblx0XHRcclxuXHRcdHRoaXMuY3JlYXRlR29vZ2xlSW5mb1dpbmRvdygpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZUluZm9XaW5kb3cuc2V0T3B0aW9ucyhvcHRpb25zKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiZ29vZ2xlLW1hcHMvZ29vZ2xlLWluZm8td2luZG93LmpzIn0=
