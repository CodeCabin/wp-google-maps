/**
 * @namespace WPGMZA
 * @module AddressInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.AddressInput = function(element, map)
	{
		if(!(element instanceof HTMLInputElement))
			throw new Error("Element is not an instance of HTMLInputElement");
		
		this.element = element;
		
		var json;
		var options = {
			fields: ["name", "formatted_address"],
			types:	["geocode"]
		};
		
		if(json = $(element).attr("data-autocomplete-options"))
			options = $.extend(options, JSON.parse(json));
		
		if(map && map.settings.wpgmza_store_locator_restrict)
			options.country = map.settings.wpgmza_store_locator_restrict;
		
		if(WPGMZA.isGoogleAutocompleteSupported())
		{
			element.googleAutoComplete = new google.maps.places.Autocomplete(element, options);
			
			if(options.country)
				element.googleAutoComplete.setComponentRestrictions({country: options.country});
		}
		else if(WPGMZA.CloudAPI && WPGMZA.CloudAPI.isBeingUsed)
			element.cloudAutoComplete = new WPGMZA.CloudAutocomplete(element, options);
	}
	
	WPGMZA.extend(WPGMZA.AddressInput, WPGMZA.EventDispatcher);
	
	WPGMZA.AddressInput.createInstance = function(element, map)
	{
		return new WPGMZA.AddressInput(element, map);
	}
	
	/*$(window).on("load", function(event) {
		
		$("input.wpgmza-address").each(function(index, el) {
			
			el.wpgmzaAddressInput = WPGMZA.AddressInput.createInstance(el);
			
		});
		
	});*/
	
});