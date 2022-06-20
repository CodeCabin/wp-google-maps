/**
 * @namespace WPGMZA
 * @module OLInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLInfoWindow = function(feature)
	{
		var self = this;
		
		Parent.call(this, feature);
		
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
	 * TODO: This should take a feature, not an event
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.OLInfoWindow.prototype.open = function(map, feature)
	{
		var self = this;
		var latLng = feature.getPosition();

		if(!latLng){
			return false;
		}
		
		if(!Parent.prototype.open.call(this, map, feature)){
			return false;
		}
		
		// Set parent for events to bubble up
		this.parent = map;
		
		if(this.overlay)
			this.feature.map.olMap.removeOverlay(this.overlay);
			
		this.overlay = new ol.Overlay({
			element: this.element,
			stopEvent: true,
			insertFirst: true
		});
		
		this.overlay.setPosition(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		self.feature.map.olMap.addOverlay(this.overlay);
		
		$(this.element).show();
		
		this.setContent(this.content);
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			WPGMZA.getImageDimensions(feature.getIcon(), function(size) {
				
				$(self.element).css({left: Math.round(size.width / 2) + "px"});
				
			});
		}

		/* Apply scroll fix for OpenLayers */
		this.autoResize();
		
		this.trigger("infowindowopen");
		this.trigger("domready");
	}
	
	WPGMZA.OLInfoWindow.prototype.close = function(event)
	{
		
		if(!this.overlay)
			return;
		
		// TODO: Why? This shouldn't have to be here. Removing the overlay should hide the element (it doesn't)
		$(this.element).hide();
			
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.trigger("infowindowclose");
		
		this.feature.map.olMap.removeOverlay(this.overlay);
		this.overlay = null;
	}
	
	WPGMZA.OLInfoWindow.prototype.setContent = function(html)
	{
		Parent.prototype.setContent.call(this, html);
		
		this.content = html;
		var eaBtn = !WPGMZA.isProVersion() ? this.addEditButton() : '';
		$(this.element).html(eaBtn+"<i class='fa fa-times ol-info-window-close' aria-hidden='true'></i>" + html);
	}
	
	WPGMZA.OLInfoWindow.prototype.setOptions = function(options)
	{
		if(options.maxWidth){
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

		let canAutoPan = true;

		/* Handle one shot auto pan disabler */
		if(typeof this.feature._osDisableAutoPan !== 'undefined'){
			if(this.feature._osDisableAutoPan){
				canAutoPan = false;
				this.feature._osDisableAutoPan = false;
			}
		}

		if(this.isPanIntoViewAllowed && canAutoPan)
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
				var offset	= -(height + 180) * 0.45;
				
				self.feature.map.animateNudge(0, offset, self.feature.getPosition());
			}
			
			imgs.each(function(index, el) {
				el.onload = function() {
					if(++numImagesLoaded == numImages && !inside(self.element, self.feature.map.element))
						panIntoView();
				}
			});
			
			if(numImages == 0 && !inside(self.element, self.feature.map.element))
				panIntoView();
		}
	}

	WPGMZA.OLInfoWindow.prototype.autoResize = function(){
		/* Applies size maxes based on content and container, similar to scroll fix for Google Maps */
		$(this.element).css("max-height", 'none');

		if($(this.feature.map.element).length){
			const mapHeight = $(this.feature.map.element).height();
			const mapWidth = $(this.feature.map.element).width();

			const maxHeight = mapHeight - 180;
			if($(this.element).height() > maxHeight){
				$(this.element).css("max-height", maxHeight + "px");	
			}

			const maxWidth = mapWidth > 648 ? 648 : (mapWidth - 120);
			if($(this.element).width() > maxWidth){
				$(this.element).css("max-width", maxWidth + "px");	
			}
		}

	}
	
});