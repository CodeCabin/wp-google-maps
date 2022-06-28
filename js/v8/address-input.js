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

		this.googleAutocompleteLoaded = false;

		if(WPGMZA.isGoogleAutocompleteSupported()) {
			/*
			 * This logic was entirely rebuilt as of 2022-06-28 to allow more complex handling of autocomplete modules
			 * 
			 * The admin marker address field will now default to our free cloud system first, but rollback to the google autocomplete if any issues are encountered during the usage
			 * 
			 * This is handled in the MapEditPage module, but we have plans to move this to it's own module at a later date. 
			 * 
			 * For now this is the simplest route to achieve the goal we set out to reach
			 */
			if (this.shouldAutoLoadGoogleAutocomplete()) {
				this.loadGoogleAutocomplete();
			}
		} else if(WPGMZA.CloudAPI && WPGMZA.CloudAPI.isBeingUsed){
			element.cloudAutoComplete = new WPGMZA.CloudAutocomplete(element, options);
		}
	}
	
	WPGMZA.extend(WPGMZA.AddressInput, WPGMZA.EventDispatcher);
	
	WPGMZA.AddressInput.createInstance = function(element, map) {
		return new WPGMZA.AddressInput(element, map);
	}

	WPGMZA.AddressInput.prototype.loadGoogleAutocomplete = function(){
		if(WPGMZA.settings){
			if(WPGMZA.settings.googleMapsApiKey || WPGMZA.settings.wpgmza_google_maps_api_key){
				/* Google Autocomplete can initialize normally, as the user has their own key */
				if(WPGMZA.isGoogleAutocompleteSupported()) {
					this.element.googleAutoComplete = new google.maps.places.Autocomplete(this.element, this.options);
				
					if(this.options.country){
						/* Apply country restrictios to the autocomplet, based on the settings */
						this.element.googleAutoComplete.setComponentRestrictions({country: this.options.country});
					}
				}

				this.googleAutocompleteLoaded = true;
			}
		}
		
	}

	WPGMZA.AddressInput.prototype.shouldAutoLoadGoogleAutocomplete = function(){
		/* 
		 * Checks if this field should automatically initialize Google Autocomplete
		 * 
		 * This is true for all address inputs, with the exception of the marker address admin input 
		*/
		if(this.element && this.element.id && this.element.id === 'wpgmza_add_address_map_editor'){
			return false;
		}
		return true;
	}
});