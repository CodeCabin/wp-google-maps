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
	
});