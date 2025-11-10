/**
 * @namespace WPGMZA
 * @module NominatimAutocomplete
 * @requires WPGMZA.Autocomplete
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Autocomplete;

	WPGMZA.NominatimAutocomplete = function(element, options) {
		Parent.call(this, element, options);
	}

	WPGMZA.NominatimAutocomplete.prototype = Object.create(Parent.prototype);
	WPGMZA.NominatimAutocomplete.prototype.constructor = WPGMZA.NominatimAutocomplete;
	
	WPGMZA.NominatimAutocomplete.prototype.autoload = function() {
		WPGMZA.Autocomplete.prototype.autoload.apply(this, arguments);

        this.prepare();
        this.setReady(true);
	}

	WPGMZA.NominatimAutocomplete.prototype.getProvider = function(){
        return WPGMZA.Autocomplete.Providers.NOMINATIM;
	}

	WPGMZA.NominatimAutocomplete.prototype.find = function(){
		WPGMZA.Autocomplete.prototype.find.apply(this, arguments);

        let term = this.getTerm();
        if(term){
            
            this.setBusy(true);
            this.queryCache(term, (locations) => {
                if(locations && locations.length){
                    this.setItems(locations);
                    this.setBusy(false);
                    this.present();
                } else {
                    this.queryNominatim(term, (locations) => {
                        if(locations && locations.length){
                            this.setItems(locations);
                            this.setBusy(false);
                            this.present();
                        }
                    })
                }
            });
        }
	}

	WPGMZA.NominatimAutocomplete.prototype.remapItem = function(item){
		return {
			display : item.displayName ? item.displayName : false,
			address : item.adrFormatAddress ? item.adrFormatAddress : false,
			type : item.primaryTypeDisplayName ? item.primaryTypeDisplayName.replaceAll("_", " ") : "Location"
		};
	}

    WPGMZA.NominatimAutocomplete.prototype.queryCache = function(query, callback) {
		WPGMZA.restAPI.call("/geocode-cache", {
			data: {
				query: JSON.stringify({location: query, options: {address : query}})
			},
			success: function(response, xhr, status) {
				callback(response);
			},
			useCompressedPathVariable: true
		});
	}

    WPGMZA.NominatimAutocomplete.prototype.queryNominatim = function(query, callback) {
        const config = this.getConfig(query);
		
        if(this.options && this.options.country){
            config.countrycodes = this.options.country;
        }

		config._query = JSON.stringify({location: query, options: {address : query}});
		
		WPGMZA.restAPI.call("/query-nominatim", {
			data: {
				data: config,
			},
			success: function(response, xhr, status) {
				if(response && response.length){
					callback(response);
				} else {
					callback(null)
				}
			},
			error: function(response, xhr, status) {
				callback(null)
			}
		});
	}

    WPGMZA.NominatimAutocomplete.prototype.getConfig = function(term){
		return {
			q : term,
			format : "json"
		};
	}

    WPGMZA.NominatimAutocomplete.prototype.remapItem = function(item){
		return {
			display : item.name ? item.name : false,
			address : item.display_name ? item.display_name : false,
			type : item.addresstype ? WPGMZA.capitalizeWords(item.addresstype.replaceAll("_", " ")) : "Location",
            coordinates : item.lat && item.lon ? `${item.lat}, ${item.lon}` : false
		};
	}
});