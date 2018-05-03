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
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.OSMInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMInfoWindow.prototype.constructor = WPGMZA.OSMInfoWindow;
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.OSMInfoWindow.prototype.open = function(event)
	{
		var self = this;
		
		if(!WPGMZA.InfoWindow.prototype.open.call(this, event))
			return false;
		
		this.getContent(function(html) {
			var latLng = self.mapObject.getPosition();
			
			self.element = $("<div class='osm-info-window-container osm-info-window-plain'><i class='fa fa-times osm-info-window-close' aria-hidden='true'></i>" + html + "</div>")[0];
			$(self.element).find(".osm-info-window-close").on("click", function(event) {
				self.mapObject.map.osmMap.removeOverlay(self.overlay);
				self.overlay = null;
			});

			if(self.overlay)
				self.mapObject.map.osmMap.removeOverlay(self.overlay);
			
			self.overlay = new ol.Overlay({
				element: self.element
			});
			
			self.overlay.setPosition(ol.proj.fromLonLat([
				latLng.lng,
				latLng.lat
			]));
			self.mapObject.map.osmMap.addOverlay(self.overlay);
			
			self.dispatchEvent("infowindowopen");
			$(self.element).trigger("infowindowopen");
		});
	}
	
	WPGMZA.OSMInfoWindow.prototype.close = function(event)
	{
		if(!self.overlay)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		self.mapObject.map.osmMap.removeOverlay(self.overlay);
	}
	
})(jQuery);