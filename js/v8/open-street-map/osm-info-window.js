/**
 * @namespace WPGMZA
 * @module OSMInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMInfoWindow = function(mapObject)
	{
		var self = this;
		
		Parent.call(this, mapObject);
		
		this.element = $("<div class='osm-info-window-container osm-info-window-plain'></div>")[0];
			
		$(this.element).on("click", ".osm-info-window-close", function(event) {
			self.close();
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.OSMInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMInfoWindow.prototype.constructor = WPGMZA.OSMInfoWindow;
	
	/**
	 * Opens the info window
	 * TODO: This should take a mapObject, not an event
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.OSMInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		var latLng = mapObject.getPosition();
		
		if(!WPGMZA.InfoWindow.prototype.open.call(this, map, mapObject))
			return false;
		
		if(this.overlay)
			this.mapObject.map.osmMap.removeOverlay(this.overlay);
			
		this.overlay = new ol.Overlay({
			element: this.element
		});
		
		this.overlay.setPosition(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		self.mapObject.map.osmMap.addOverlay(this.overlay);
		
		$(this.element).show();
		
		this.dispatchEvent("infowindowopen");
		$(this.element).trigger("infowindowopen.wpgmza");
	}
	
	WPGMZA.OSMInfoWindow.prototype.close = function(event)
	{
		// TODO: Why? This shouldn't have to be here. Removing the overlay should hide the element (it doesn't)
		$(this.element).hide();
		
		if(!this.overlay)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.mapObject.map.osmMap.removeOverlay(this.overlay);
		this.overlay = null;
	}
	
	WPGMZA.OSMInfoWindow.prototype.setContent = function(html)
	{
		$(this.element).html("<i class='fa fa-times osm-info-window-close' aria-hidden='true'></i>" + html);
	}
	
})(jQuery);