/**
 * @namespace WPGMZA
 * @module OLInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
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