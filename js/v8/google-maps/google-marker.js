/**
 * @namespace WPGMZA
 * @module GoogleMarker
 * @requires WPGMZA.Marker
 * @gulp-requires ../core.js
 * @pro-requires WPGMZA.ProMarker
 * @gulp-pro-requires pro-marker.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);
		
		this._opacity = 1.0;
		
		var settings = {};
		if(row)
		{
			for(var name in row)
			{
				if(row[name] instanceof WPGMZA.LatLng)
				{
					settings[name] = row[name].toGoogleLatLng();
				}
				else if(row[name] instanceof WPGMZA.Map || name == "icon")
				{
					// NB: Ignore map here, it's not a google.maps.Map, Google would throw an exception
					// NB: Ignore icon here, it conflicts with updateIcon in Pro
				}
				else
					settings[name] = row[name];
			}
		}
		
		this.googleMarker = new google.maps.Marker(settings);
		this.googleMarker.wpgmzaMarker = this;
		
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
			
		// this.googleMarker.setLabel(this.settings.label);
		
		if(this.anim)
			this.googleMarker.setAnimation(this.anim);
		if(this.animation)
			this.googleMarker.setAnimation(this.animation);
			
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent("click");
			self.dispatchEvent("select");
		});
		
		google.maps.event.addListener(this.googleMarker, "mouseover", function() {
			self.dispatchEvent("mouseover");
		});
		
		google.maps.event.addListener(this.googleMarker, "dragend", function() {
			var googleMarkerPosition = self.googleMarker.getPosition();
			
			self.setPosition({
				lat: googleMarkerPosition.lat(),
				lng: googleMarkerPosition.lng()
			});
			
			self.dispatchEvent({
				type: "dragend",
				latLng: self.getPosition()
			});
		});
		
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.GoogleMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleMarker.prototype.constructor = WPGMZA.GoogleMarker;
	
	Object.defineProperty(WPGMZA.GoogleMarker.prototype, "opacity", {
		
		"get": function() {
			return this._opacity;
		},
		
		"set": function(value) {
			this._opacity = value;
			this.googleMarker.setOpacity(value);
		}
		
	});
	
	WPGMZA.GoogleMarker.prototype.setLabel = function(label)
	{
		if(!label)
		{
			this.googleMarker.setLabel(null);
			return;
		}
		
		this.googleMarker.setLabel({
			text: label
		});
		
		if(!this.googleMarker.getIcon())
			this.googleMarker.setIcon(WPGMZA.settings.default_marker_icon);
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		this.googleMarker.setPosition({
			lat: this.lat,
			lng: this.lng
		});
	}
	
	/**
	 * Sets the position offset of a marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.updateOffset = function()
	{
		var self = this;
		var icon = this.googleMarker.getIcon();
		var img = new Image();
		var params;
		var x = this._offset.x;
		var y = this._offset.y;
		
		if(!icon)
			icon = WPGMZA.settings.default_marker_icon;
		
		if(typeof icon == "string")
			params = {
				url: icon
			};
		else
			params = icon;
		
		img.onload = function()
		{
			var defaultAnchor = {
				x: img.width / 2,
				y: img.height
			};
			
			params.anchor = new google.maps.Point(defaultAnchor.x - x, defaultAnchor.y - y);
			
			self.googleMarker.setIcon(params);
		}
		
		img.src = params.url;
	}
	
	WPGMZA.GoogleMarker.prototype.setOptions = function(options)
	{
		this.googleMarker.setOptions(options);
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setAnimation = function(animation)
	{
		Parent.prototype.setAnimation.call(this, animation);
		this.googleMarker.setAnimation(animation);
	}
	
	/**
	 * Sets the visibility of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);
		
		this.googleMarker.setVisible(visible ? true : false);
	}
	
	WPGMZA.GoogleMarker.prototype.getVisible = function(visible)
	{
		return this.googleMarker.getVisible();
	}
	
	WPGMZA.GoogleMarker.prototype.setDraggable = function(draggable)
	{
		this.googleMarker.setDraggable(draggable);
	}
	
	WPGMZA.GoogleMarker.prototype.setOpacity = function(opacity)
	{
		this.googleMarker.setOpacity(opacity);
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtbWFya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZU1hcmtlclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1hcmtlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9jb3JlLmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb01hcmtlclxyXG4gKiBAZ3VscC1wcm8tcmVxdWlyZXMgcHJvLW1hcmtlci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIgPSBmdW5jdGlvbihyb3cpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQuY2FsbCh0aGlzLCByb3cpO1xyXG5cdFx0XHJcblx0XHR0aGlzLl9vcGFjaXR5ID0gMS4wO1xyXG5cdFx0XHJcblx0XHR2YXIgc2V0dGluZ3MgPSB7fTtcclxuXHRcdGlmKHJvdylcclxuXHRcdHtcclxuXHRcdFx0Zm9yKHZhciBuYW1lIGluIHJvdylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmKHJvd1tuYW1lXSBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0c2V0dGluZ3NbbmFtZV0gPSByb3dbbmFtZV0udG9Hb29nbGVMYXRMbmcoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZihyb3dbbmFtZV0gaW5zdGFuY2VvZiBXUEdNWkEuTWFwIHx8IG5hbWUgPT0gXCJpY29uXCIpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Ly8gTkI6IElnbm9yZSBtYXAgaGVyZSwgaXQncyBub3QgYSBnb29nbGUubWFwcy5NYXAsIEdvb2dsZSB3b3VsZCB0aHJvdyBhbiBleGNlcHRpb25cclxuXHRcdFx0XHRcdC8vIE5COiBJZ25vcmUgaWNvbiBoZXJlLCBpdCBjb25mbGljdHMgd2l0aCB1cGRhdGVJY29uIGluIFByb1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRzZXR0aW5nc1tuYW1lXSA9IHJvd1tuYW1lXTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoc2V0dGluZ3MpO1xyXG5cdFx0dGhpcy5nb29nbGVNYXJrZXIud3BnbXphTWFya2VyID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVNYXJrZXIuc2V0UG9zaXRpb24obmV3IGdvb2dsZS5tYXBzLkxhdExuZyh7XHJcblx0XHRcdGxhdDogcGFyc2VGbG9hdCh0aGlzLmxhdCksXHJcblx0XHRcdGxuZzogcGFyc2VGbG9hdCh0aGlzLmxuZylcclxuXHRcdH0pKTtcclxuXHRcdFx0XHJcblx0XHQvLyB0aGlzLmdvb2dsZU1hcmtlci5zZXRMYWJlbCh0aGlzLnNldHRpbmdzLmxhYmVsKTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5hbmltKVxyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRBbmltYXRpb24odGhpcy5hbmltKTtcclxuXHRcdGlmKHRoaXMuYW5pbWF0aW9uKVxyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRBbmltYXRpb24odGhpcy5hbmltYXRpb24pO1xyXG5cdFx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFya2VyLCBcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJjbGlja1wiKTtcclxuXHRcdFx0c2VsZi5kaXNwYXRjaEV2ZW50KFwic2VsZWN0XCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFya2VyLCBcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2VsZi5kaXNwYXRjaEV2ZW50KFwibW91c2VvdmVyXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFya2VyLCBcImRyYWdlbmRcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBnb29nbGVNYXJrZXJQb3NpdGlvbiA9IHNlbGYuZ29vZ2xlTWFya2VyLmdldFBvc2l0aW9uKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLnNldFBvc2l0aW9uKHtcclxuXHRcdFx0XHRsYXQ6IGdvb2dsZU1hcmtlclBvc2l0aW9uLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogZ29vZ2xlTWFya2VyUG9zaXRpb24ubG5nKClcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoe1xyXG5cdFx0XHRcdHR5cGU6IFwiZHJhZ2VuZFwiLFxyXG5cdFx0XHRcdGxhdExuZzogc2VsZi5nZXRQb3NpdGlvbigpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMudHJpZ2dlcihcImluaXRcIik7XHJcblx0fVxyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9NYXJrZXI7XHJcblx0ZWxzZVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLk1hcmtlcjtcclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGFyZW50LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZU1hcmtlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuR29vZ2xlTWFya2VyO1xyXG5cdFxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZSwgXCJvcGFjaXR5XCIsIHtcclxuXHRcdFxyXG5cdFx0XCJnZXRcIjogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9vcGFjaXR5O1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0XCJzZXRcIjogZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0dGhpcy5fb3BhY2l0eSA9IHZhbHVlO1xyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRPcGFjaXR5KHZhbHVlKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIucHJvdG90eXBlLnNldExhYmVsID0gZnVuY3Rpb24obGFiZWwpXHJcblx0e1xyXG5cdFx0aWYoIWxhYmVsKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRMYWJlbChudWxsKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRMYWJlbCh7XHJcblx0XHRcdHRleHQ6IGxhYmVsXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMuZ29vZ2xlTWFya2VyLmdldEljb24oKSlcclxuXHRcdFx0dGhpcy5nb29nbGVNYXJrZXIuc2V0SWNvbihXUEdNWkEuc2V0dGluZ3MuZGVmYXVsdF9tYXJrZXJfaWNvbik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXJcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnNldFBvc2l0aW9uLmNhbGwodGhpcywgbGF0TG5nKTtcclxuXHRcdHRoaXMuZ29vZ2xlTWFya2VyLnNldFBvc2l0aW9uKHtcclxuXHRcdFx0bGF0OiB0aGlzLmxhdCxcclxuXHRcdFx0bG5nOiB0aGlzLmxuZ1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHBvc2l0aW9uIG9mZnNldCBvZiBhIG1hcmtlclxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIucHJvdG90eXBlLnVwZGF0ZU9mZnNldCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgaWNvbiA9IHRoaXMuZ29vZ2xlTWFya2VyLmdldEljb24oKTtcclxuXHRcdHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuXHRcdHZhciBwYXJhbXM7XHJcblx0XHR2YXIgeCA9IHRoaXMuX29mZnNldC54O1xyXG5cdFx0dmFyIHkgPSB0aGlzLl9vZmZzZXQueTtcclxuXHRcdFxyXG5cdFx0aWYoIWljb24pXHJcblx0XHRcdGljb24gPSBXUEdNWkEuc2V0dGluZ3MuZGVmYXVsdF9tYXJrZXJfaWNvbjtcclxuXHRcdFxyXG5cdFx0aWYodHlwZW9mIGljb24gPT0gXCJzdHJpbmdcIilcclxuXHRcdFx0cGFyYW1zID0ge1xyXG5cdFx0XHRcdHVybDogaWNvblxyXG5cdFx0XHR9O1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRwYXJhbXMgPSBpY29uO1xyXG5cdFx0XHJcblx0XHRpbWcub25sb2FkID0gZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgZGVmYXVsdEFuY2hvciA9IHtcclxuXHRcdFx0XHR4OiBpbWcud2lkdGggLyAyLFxyXG5cdFx0XHRcdHk6IGltZy5oZWlnaHRcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdHBhcmFtcy5hbmNob3IgPSBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoZGVmYXVsdEFuY2hvci54IC0geCwgZGVmYXVsdEFuY2hvci55IC0geSk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLmdvb2dsZU1hcmtlci5zZXRJY29uKHBhcmFtcyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGltZy5zcmMgPSBwYXJhbXMudXJsO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRPcHRpb25zKG9wdGlvbnMpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIG1hcmtlciBhbmltYXRpb25cclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5zZXRBbmltYXRpb24gPSBmdW5jdGlvbihhbmltYXRpb24pXHJcblx0e1xyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5zZXRBbmltYXRpb24uY2FsbCh0aGlzLCBhbmltYXRpb24pO1xyXG5cdFx0dGhpcy5nb29nbGVNYXJrZXIuc2V0QW5pbWF0aW9uKGFuaW1hdGlvbik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIG1hcmtlclxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuc2V0VmlzaWJsZS5jYWxsKHRoaXMsIHZpc2libGUpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRWaXNpYmxlKHZpc2libGUgPyB0cnVlIDogZmFsc2UpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5nZXRWaXNpYmxlID0gZnVuY3Rpb24odmlzaWJsZSlcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5nb29nbGVNYXJrZXIuZ2V0VmlzaWJsZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5zZXREcmFnZ2FibGUgPSBmdW5jdGlvbihkcmFnZ2FibGUpXHJcblx0e1xyXG5cdFx0dGhpcy5nb29nbGVNYXJrZXIuc2V0RHJhZ2dhYmxlKGRyYWdnYWJsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIucHJvdG90eXBlLnNldE9wYWNpdHkgPSBmdW5jdGlvbihvcGFjaXR5KVxyXG5cdHtcclxuXHRcdHRoaXMuZ29vZ2xlTWFya2VyLnNldE9wYWNpdHkob3BhY2l0eSk7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Imdvb2dsZS1tYXBzL2dvb2dsZS1tYXJrZXIuanMifQ==
