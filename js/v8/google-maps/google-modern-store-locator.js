/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 */
jQuery(function($) {
	
	WPGMZA.GoogleModernStoreLocator = function(map_id)
	{
		WPGMZA.ModernStoreLocator.call(this, map_id);
		
		var googleMap;
		
		if(WPGMZA.isProVersion())
			googleMap = MYMAP[map_id].map.googleMap;
		else
			googleMap = MYMAP.map.googleMap;
		
		googleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(this.element);
	}
	
	WPGMZA.GoogleModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator.prototype);
	WPGMZA.GoogleModernStoreLocator.prototype.constructor = WPGMZA.GoogleModernStoreLocator;
	
});