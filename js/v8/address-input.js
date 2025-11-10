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
			types:	["geocode", "establishment"]
		};
		
		if(json = $(element).attr("data-autocomplete-options")){
			options = $.extend(options, JSON.parse(json));
		}
		
		if(map && map.settings.wpgmza_store_locator_restrict){
			options.country = map.settings.wpgmza_store_locator_restrict;
		}

		/* Store the options to the instance */
		this.options = options;

		/* Local reference to the address input */
		element._wpgmzaAddressInput = this;
		
		this.wpgmzaAutocomplete = WPGMZA.Autocomplete.createInstance(this.element, this.options);
		this.autocompleteProvider = this.wpgmzaAutocomplete.getProvider();
	}
	
	WPGMZA.extend(WPGMZA.AddressInput, WPGMZA.EventDispatcher);
	
	WPGMZA.AddressInput.createInstance = function(element, map) {
		return new WPGMZA.AddressInput(element, map);
	}
});