/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 */
jQuery(function($) {
	
	WPGMZA.GoogleModernStoreLocator = function(map_id)
	{
		var googleMap, self = this;
		
		this.map = WPGMZA.getMapByID(map_id);
		
		WPGMZA.ModernStoreLocator.call(this, map_id);

		var options = {
			fields: ["name", "formatted_address"],
			types: ["geocode"]
		};
		var restrict = wpgmaps_localize[map_id]["other_settings"]["wpgmza_store_locator_restrict"];
		
		this.addressInput = $(this.element).find(".addressInput, #addressInput")[0];
		
		if(this.addressInput)
		{
			if(restrict && restrict.length)
				options.componentRestrictions = {
					country: restrict
				};
			
			this.autoComplete = new google.maps.places.Autocomplete(
				this.addressInput,
				options
			);
		}
		
		// Positioning for Google
		this.map.googleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(this.element);
	}
	
	WPGMZA.GoogleModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator.prototype);
	WPGMZA.GoogleModernStoreLocator.prototype.constructor = WPGMZA.GoogleModernStoreLocator;
	
});