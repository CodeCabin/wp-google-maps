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

		this.autocompleteProvider = WPGMZA.AddressInput.AutocompleteProviders.GOOGLE_AUTOCOMPLETE;

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

	WPGMZA.AddressInput.AutocompleteProviders = {
		GOOGLE_AUTOCOMPLETE : 1,
		GOOGLE_PLACES : 2
	}
	
	WPGMZA.AddressInput.createInstance = function(element, map) {
		return new WPGMZA.AddressInput(element, map);
	}

	WPGMZA.AddressInput.prototype.loadGoogleAutocomplete = function(){
		if(WPGMZA.settings){
			if(WPGMZA.settings.googleMapsApiKey || WPGMZA.settings.wpgmza_google_maps_api_key){
				/* Google Autocomplete can initialize normally, as the user has their own key */
				if(WPGMZA.isGooglePlacesSearchSupported()){
					/* 
					 * We cannot use the Autocomplete widget google wants us to use to replace autocomplete modules
					 * as it requires alpha/beta version channels, does not replace the tooling properly and is very unreliable
					 * 
					 * Instead we will leverage our own internal modules to provide a similar experience and set 
					 * the autocomplete data via a searchByText function call on Google API's 
					*/
					this.autocompleteProvider = WPGMZA.AddressInput.AutocompleteProviders.GOOGLE_PLACES;
					this.prepareAutocomplete();
				}else if(WPGMZA.isGoogleAutocompleteSupported()) {
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

	WPGMZA.AddressInput.prototype.prepareAutocomplete = function(){
		if(this.autocompleteProvider === WPGMZA.AddressInput.AutocompleteProviders.GOOGLE_AUTOCOMPLETE){
			/* Legacy, we don't do anything as the input is replaced by Google Autocomplete */
			return;
		}
		
		/* For all others, we can go ahead and initialize some supporting modules to allow use to trigger/listen for events */
		this.autocomplete = {
			list : document.createElement('div'),
			delayTime : 700
		};

		this.autocomplete.list.classList.add('wpgmza-hidden');
		this.autocomplete.list.classList.add('wpgmza-internal-autocomplete-list');

		document.body.appendChild(this.autocomplete.list);
		this.element.internalAutocomplete = this.autocomplete;

		let dataTag = '';
		if(this.autocompleteProvider === WPGMZA.AddressInput.AutocompleteProviders.GOOGLE_PLACES){
			dataTag = "google-places-search";
		}

		if(dataTag){
			this.element.setAttribute('data-autocomplete-provider', dataTag);
		}

		if(WPGMZA.localized_strings.autcomplete_placeholder){
			this.element.setAttribute('placeholder', WPGMZA.localized_strings.autcomplete_placeholder);
		}

		this.element.setAttribute('autocomplete', 'off');

		this.bindAutocomplete();
	}
	
	WPGMZA.AddressInput.prototype.bindAutocomplete = function(){
		this.element.addEventListener("keyup", (event) => {
			if(event.key.length > 1){
				/* Ignore these as they are likely mutators */
				if(event.key !== "Backspace"){
					return;
				}
			}

			if(this.autocomplete.timer){
				clearTimeout(this.autocomplete.timer);
			}

			/* We have a valid key so we can go about performing a search */
			this.autocomplete.timer = setTimeout(() => {
				this.findLocations();
			}, this.autocomplete.delayTime);
		});

		this.element.addEventListener("focusout", (event) => {
			setTimeout(() => {
				this.hideAutocomplete();
			}, 500);
		});

		this.element.addEventListener("focusin", (event) => {
			this.showAutocomplete();
			this.autoplaceAutocomplete();
		});

		this.element.addEventListener("click", (event) => {
			this.showAutocomplete();
			this.autoplaceAutocomplete();
		});

		document.addEventListener("scroll", (event) => {
			this.hideAutocomplete();
		});
	}

	WPGMZA.AddressInput.prototype.findLocations = function(){
		const term = this.element.value;
		this.hideAutocomplete();

		if(!term || term.trim().length < 0){
			return;
		}

		if(this.autocompleteProvider === WPGMZA.AddressInput.AutocompleteProviders.GOOGLE_PLACES){
			/* The user is using Google Places search, so we can leverage their system to fetch results */
			if(WPGMZA.isGooglePlacesSearchSupported()){
				const googlePlaceConfig = this.getConfigGooglePlacesSearch(term);

				if(this.options && this.options.country){
					googlePlaceConfig.region = this.options.country;
				}

				google.maps.places.Place.searchByText(googlePlaceConfig).then((locations) => {
					if(locations && locations.places){
						this.presentLocations(locations.places);
					}
				});
			}
		}
	}

	WPGMZA.AddressInput.prototype.presentLocations = function(locations){
		this.autocomplete.list.innerHTML = "";
		if(locations && locations.length){
			let compiled = "";
			for(let location of locations){
				if(location.displayName){
					let locationType = location.primaryTypeDisplayName || "Location";
					let adrLabel = location.adrFormatAddress || "";

					compiled += `<div class='wpgmza-internal-autocomplete-location' data-address='${location.displayName}'>`;
					compiled +=    `<strong data-autocomplete-field='display'>${location.displayName}</strong>`;
					compiled +=    `<span data-autocomplete-field='adr'>${adrLabel}</span>`;
					compiled +=    `<small data-autocomplete-field='type'>${locationType.replaceAll("_", " ")}</small>`;
					compiled += `</div>`;
				}
			}

			if(compiled && compiled.length){
				this.autocomplete.list.innerHTML = compiled;

				this.showAutocomplete();
				this.autoplaceAutocomplete();

				/* Now bind the event listener, and make it fill the field on click */
				const items = this.autocomplete.list.querySelectorAll('.wpgmza-internal-autocomplete-location');
				for(let item of items){
					item.addEventListener('click', (event) => {
						event.preventDefault();
						let address = item.querySelector('[data-autocomplete-field="adr"]');
						if(address){
							address = address.innerText;
						} else {
							address = item.getAttribute('data-address');
						}

						if(address){
							this.element.value = address;
						}
						
						this.hideAutocomplete();
						this.autocomplete.list.innerHTML = "";
					});
				}
			}
		} else {
			this.hideAutocomplete();
		}
	}

	WPGMZA.AddressInput.prototype.showAutocomplete = function(){
		if(this.autocomplete && this.autocomplete.list && this.autocomplete.list.innerHTML.length){
			this.autocomplete.list.classList.remove('wpgmza-hidden');
		}
	}

	WPGMZA.AddressInput.prototype.hideAutocomplete = function(){
		if(this.autocomplete && this.autocomplete.list){
			this.autocomplete.list.classList.add('wpgmza-hidden');
		}
	}

	WPGMZA.AddressInput.prototype.autoplaceAutocomplete = function(){
		if(this.autocomplete && this.autocomplete.list){
			let boundingTarget = this.element;
			const boundingRect = boundingTarget.getBoundingClientRect();
			if(boundingRect.width){
				this.autocomplete.list.style.width = boundingRect.width + "px";
				this.autocomplete.list.style.left = boundingRect.left + "px";
				this.autocomplete.list.style.top = (boundingRect.bottom) + "px";
			}
		}
	}

	WPGMZA.AddressInput.prototype.getConfigGooglePlacesSearch = function(term){
		/* For overrides */
		return {
			textQuery: term.trim(),
			fields: ["displayName", "adrFormatAddress", "primaryTypeDisplayName"],
			maxResultCount: 8,
		};
	} 
});