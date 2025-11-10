/**
 * @namespace WPGMZA
 * @module AzureAutocomplete
 * @requires WPGMZA.Autocomplete
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Autocomplete;

	WPGMZA.AzureAutocomplete = function(element, options) {
		Parent.call(this, element, options);
	}

	WPGMZA.AzureAutocomplete.prototype = Object.create(Parent.prototype);
	WPGMZA.AzureAutocomplete.prototype.constructor = WPGMZA.AzureAutocomplete;

	WPGMZA.AzureAutocomplete.API_URL = "https://atlas.microsoft.com/search/fuzzy/json"; 
	
	WPGMZA.AzureAutocomplete.prototype.autoload = function() {
		WPGMZA.Autocomplete.prototype.autoload.apply(this, arguments);

		let apikey = this.getApiKey();
        if(apikey){
            this.prepare();
            this.setReady(true);
        }
	}

	WPGMZA.AzureAutocomplete.prototype.getApiKey = function(){
		let apikey = false;
		if(WPGMZA.settings){
			if(WPGMZA.settings.address_provider_api_key){
				apikey = WPGMZA.settings.address_provider_api_key;
			} else if(WPGMZA.settings.wpgmza_leaflet_azure_key){
				apikey = WPGMZA.settings.wpgmza_leaflet_azure_key;
			} 
		}
		return apikey;
	}

	WPGMZA.AzureAutocomplete.prototype.getProvider = function(){
		return WPGMZA.Autocomplete.Providers.AZURE_MAPS;
	}

	WPGMZA.AzureAutocomplete.prototype.find = function(){
		WPGMZA.Autocomplete.prototype.find.apply(this, arguments);

        let term = this.getTerm();
        if(term){
            let apikey = this.getApiKey();

            if(apikey){
                this.setBusy(true);

                let params = new URLSearchParams({
                    'api-version' : '1.0',
                    'query' : term.trim(),
                    'typeahead' : 'true', 
                    'subscription-key' : apikey
                });

                if(this.options && this.options.country){
                    params.append('countrySet', this.options.country.toUpperCase());
                }

                fetch(`${WPGMZA.AzureAutocomplete.API_URL}?${params.toString()}`)
                    .then((response) => {
                        if(!response.ok){
                            return response.json().then((error) => {
                                /* Do nothing */	
                                this.setBusy(false);
                            });
                        }
                        return response.json();
                    }).then((data) => {
                        suggestions = data.results ? data.results : [];
                        suggestions = suggestions.map((place) => {
                            let type = place.entityType ? place.entityType : false;
                            if(!type){
                                type = place.type;
                            }

                            switch(type){
                                case 'Municipality':
                                    type = 'City';
                                    break;
                                case 'MunicipalitySubdivision':
                                    type = 'Borough';
                                    break;
                                case 'CountrySubdivision':
                                    type = 'State/Province';
                                    break;
                                case 'PointOfInterest':
                                case 'POI':
                                    type = 'Point of Interest';
                                    break;
                                case 'PostalCodeArea':
                                    type = 'Postal Code Area';
                                    break;
                                case 'PointAddress':
                                    type = 'Address';
                                    break;
                            }

                            let name = false;
                            if(place.poi && place.poi.name){
                                name = place.poi.name;
                            }

                            let address = place.address.freeformAddress;
                            if(!name && place.type === 'Geography'){
                                /* Attempt to construct the address from the full component list and then use the freeform name as the display name */
                                let addressCompiled = [];
                                let addressKeys = ['municipalitySubdivision', 'municipality', 'countrySubdivision', 'country'];

                                for(let addressKey of addressKeys){
                                    if(place.address[addressKey]){
                                        addressCompiled.push(place.address[addressKey]);
                                    }
                                }

                                if(addressCompiled && addressCompiled.length){
                                    name = address;
                                    address = addressCompiled.join(', ');
                                }
                            }

                            return {
                                name : name,
                                address : address,
                                id : place.id,
                                coordinates : place.position,
                                country : place.address.country ? place.address.country : false,
                                entityType : type
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

	WPGMZA.AzureAutocomplete.prototype.remapItem = function(item){
		return {
			display : item.name ? item.name : false,
			address : item.address ? item.address : false,
            country : item.country ? item.country : false,
			type : item.entityType ? WPGMZA.capitalizeWords(item.entityType.replaceAll("_", " ")) : "Location",
            coordinates : item.coordinates ? `${item.coordinates.lat}, ${item.coordinates.lon}` : false
		};
	}
});