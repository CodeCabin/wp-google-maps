/**
 * @namespace WPGMZA
 * @module LocationIQAutocomplete
 * @requires WPGMZA.Autocomplete
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Autocomplete;

	WPGMZA.LocationIQAutocomplete = function(element, options) {
		Parent.call(this, element, options);
	}

	WPGMZA.LocationIQAutocomplete.prototype = Object.create(Parent.prototype);
	WPGMZA.LocationIQAutocomplete.prototype.constructor = WPGMZA.LocationIQAutocomplete;

	WPGMZA.LocationIQAutocomplete.API_URL = "https://api.locationiq.com/v1/autocomplete"; 
	
	WPGMZA.LocationIQAutocomplete.prototype.autoload = function() {
		WPGMZA.Autocomplete.prototype.autoload.apply(this, arguments);

		let apikey = this.getApiKey();
        if(apikey){
            this.prepare();
            this.setReady(true);
        }
	}

	WPGMZA.LocationIQAutocomplete.prototype.getApiKey = function(){
		let apikey = false;
		if(WPGMZA.settings){
			if(WPGMZA.settings.address_provider_api_key){
				apikey = WPGMZA.settings.address_provider_api_key;
			} else if(WPGMZA.settings.wpgmza_leaflet_locationiq_key){
				apikey = WPGMZA.settings.wpgmza_leaflet_locationiq_key;
			}
		}
		return apikey;
	}

	WPGMZA.LocationIQAutocomplete.prototype.getProvider = function(){
		return WPGMZA.Autocomplete.Providers.LOCATION_IQ;
	}

	WPGMZA.LocationIQAutocomplete.prototype.find = function(){
		WPGMZA.Autocomplete.prototype.find.apply(this, arguments);

        let term = this.getTerm();
        if(term){
            let apikey = this.getApiKey();

            if(apikey){
                this.setBusy(true);

                let params = new URLSearchParams({
                    'dedupe' : '1',
                    'q' : term.trim(),
                    'limit' : 8, 
                    'key' : apikey
                });

                if(this.options && this.options.country){
                    params.append('countrycodes', this.options.country.toLowerCase());
                }

                fetch(`${WPGMZA.LocationIQAutocomplete.API_URL}?${params.toString()}`)
                    .then((response) => {
                        if(!response.ok){
                            return response.json().then((error) => {
                                /* Do nothing */	
                                this.setBusy(false);
                            });
                        }
                        return response.json();
                    }).then((data) => {
                        suggestions = data ? data : [];
                        suggestions = suggestions.map((place) => {
                            return {
                                name : place.display_place,
                                address : place.display_name,
                                id : place.place_id,
                                coordinates : {lat : place.lat, lon : place.lon},
                                country : place.address.country ? place.address.country : false,
                                type : place.address && place.address.country ? place.address.country : false
                            }
                        });

                        this.setItems(suggestions);
                        this.setBusy(false);
                        this.present();
                    }).catch((error) => {
                        this.setBusy(false);
                    });
            }
        }
	}

	WPGMZA.LocationIQAutocomplete.prototype.remapItem = function(item){
		return {
			display : item.name ? item.name : false,
			address : item.address ? item.address : false,
            country : item.country ? item.country : false,
			type : item.type ? WPGMZA.capitalizeWords(item.type.replaceAll("_", " ")) : "Location",
            coordinates : item.coordinates ? `${item.coordinates.lat}, ${item.coordinates.lon}` : false
		};
	}
});