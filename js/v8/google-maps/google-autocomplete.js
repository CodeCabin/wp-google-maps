/**
 * @namespace WPGMZA
 * @module GoogleAutocomplete
 * @requires WPGMZA.Autocomplete
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Autocomplete;

	WPGMZA.GoogleAutocomplete = function(element, options) {
		Parent.call(this, element, options);
	}

	WPGMZA.GoogleAutocomplete.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleAutocomplete.prototype.constructor = WPGMZA.GoogleAutocomplete;

	WPGMZA.GoogleAutocomplete.DIRECT_REQUEST_URL = "https://places.googleapis.com/v1/places:autocomplete"; 
	
	WPGMZA.GoogleAutocomplete.prototype.autoload = function() {
		WPGMZA.Autocomplete.prototype.autoload.apply(this, arguments);

		let apikey = this.getApiKey();
        if(apikey){
			let provider = this.getProvider();
			if(provider === WPGMZA.Autocomplete.Providers.GOOGLE_PLACES){
				/* New Places API search is supported - We will use internal presentation system */
				this.prepare();
				this.setReady(true);
			} else if(provider === WPGMZA.Autocomplete.Providers.GOOGLE_AUTOCOMPLETE){
				/* Legacy autocomplete should be used - Full handover */
				this.element.googleAutoComplete = new google.maps.places.Autocomplete(this.element, this.options);
				
				if(this.options.country){
					this.element.googleAutoComplete.setComponentRestrictions({country: this.options.country});
				}

				this.setReady(true);
			}
        }
	}

	WPGMZA.GoogleAutocomplete.prototype.getApiKey = function(){
		let apikey = false;
		if(WPGMZA.settings){
			if(WPGMZA.settings.address_provider_api_key){
				apikey = WPGMZA.settings.address_provider_api_key;
			} else if(WPGMZA.settings.googleMapsApiKey){
				apikey = WPGMZA.settings.googleMapsApiKey;
			} else if(WPGMZA.settings.wpgmza_google_maps_api_key){
				apikey = WPGMZA.settings.wpgmza_google_maps_api_key;
			}
		}
		return apikey;
	}

	WPGMZA.GoogleAutocomplete.prototype.getProvider = function(){
		if(WPGMZA.isGooglePlacesSearchSupported()){
			return WPGMZA.Autocomplete.Providers.GOOGLE_PLACES;
		} else if(WPGMZA.isGoogleAutocompleteSupported()){
			return WPGMZA.Autocomplete.Providers.GOOGLE_AUTOCOMPLETE;
		}
		/* Fallback to places, our system will automatically run a standard web request if the API is not present */
		return WPGMZA.Autocomplete.Providers.GOOGLE_PLACES;
	}

	WPGMZA.GoogleAutocomplete.prototype.find = function(){
		WPGMZA.Autocomplete.prototype.find.apply(this, arguments);

		if(this.getProvider() === WPGMZA.Autocomplete.Providers.GOOGLE_PLACES){
			/* Internally, we onyl handle this for the Places API */

			let term = this.getTerm();
			if(term){
				const config = this.getPlacesConfig(term);
				if(this.options && this.options.country){
					config.region = this.options.country;
				}

				this.setBusy(true);

				if(this.isPlacesAvailable()){
					/* Use the Google Maps API - SDK */
					google.maps.places.Place.searchByText(config).then((locations) => {
						if(locations && locations.places){
							this.setItems(locations.places);
							this.setBusy(false);
							this.present();
						}
					});
				} else {
					/* Perform a fetch request instead */
					let apikey = this.getApiKey();
					if(apikey){
						const body = {
							input : config.textQuery
						};

						if(config.region){
							body.includedRegionCodes = [config.region];
						}

						const headers = {
							'Content-Type': 'application/json',
							'X-Goog-Api-Key': apikey
						};

						fetch(WPGMZA.GoogleAutocomplete.DIRECT_REQUEST_URL, {
							method : 'POST',
							headers : headers,
							body : JSON.stringify(body)
						}).then((response) => {
							if(!response.ok){
								return response.json().then((error) => {
									/* Do nothing */	
									this.setBusy(false);
								});
							}
							return response.json();
						}).then((data) => {
							suggestions = data.suggestions ? data.suggestions : [];
							suggestions = suggestions.slice(0, config.maxResultCount);

							suggestions = suggestions.map((place) => {
								return {
									displayName : place.placePrediction.structuredFormat.mainText.text,
									adrFormatAddress : place.placePrediction.text.text,
									placeId : place.placePrediction.placeId,
									primaryTypeDisplayName : place.placePrediction.types ? place.placePrediction.types.shift() : false
								}
							});

							this.setItems(suggestions);
							this.setBusy(false);
							this.present();
						}).catch((error) => {
							this.setBusy(false);
						});
					} else {
						this.setBusy(false);
					}
				}
				
			}
		}
	}

	WPGMZA.GoogleAutocomplete.prototype.isPlacesAvailable = function(){
		if(typeof google !== 'undefined' && typeof google.maps !== 'undefined' && typeof google.maps.places !== 'undefined'){
			/* The SDK moduel is available */
			return true;
		}
		return false;
	}

	WPGMZA.GoogleAutocomplete.prototype.getPlacesConfig = function(term){
		return {
			textQuery: term.trim(),
			fields: ["displayName", "adrFormatAddress", "primaryTypeDisplayName"],
			maxResultCount: 8,
		};
	}

	WPGMZA.GoogleAutocomplete.prototype.remapItem = function(item){
		return {
			display : item.displayName ? item.displayName : false,
			address : item.adrFormatAddress ? item.adrFormatAddress : false,
			type : item.primaryTypeDisplayName ? WPGMZA.capitalizeWords(item.primaryTypeDisplayName.replaceAll("_", " ")) : "Location"
		};
	}
});