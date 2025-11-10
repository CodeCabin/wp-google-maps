/**
 * @namespace WPGMZA
 * @module AzureGeocoder
 * @requires WPGMZA.Geocoder
 */
jQuery(function($) {
	
	/**
	 * @class AzureGeocoder
	 * @extends Geocoder
	 */
	WPGMZA.AzureGeocoder = function() {
		
	}
	
	WPGMZA.AzureGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.AzureGeocoder.prototype.constructor = WPGMZA.AzureGeocoder;

    WPGMZA.AzureGeocoder.API_URL = "https://atlas.microsoft.com/search/address/"; 

    WPGMZA.AzureGeocoder.Modes = {
        ADDRESS : 1,
        LATLNG : 2
    };

    WPGMZA.AzureGeocoder.prototype.getApiKey = function(){
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

    WPGMZA.AzureGeocoder.prototype.getLatLngFromAddress = function(options, callback) {
		return WPGMZA.AzureGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.AzureGeocoder.prototype.getAddressFromLatLng = function(options, callback) {
		return WPGMZA.AzureGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.AzureGeocoder.prototype.geocode = function(options, callback) {
		if(!options){
			throw new Error("Invalid options");
        }
		
		if(WPGMZA.LatLng.REGEXP.test(options.address)) {
			let latLng = WPGMZA.LatLng.fromString(options.address);
			
			callback([{
				geometry: {
					location: latLng
				},
				latLng: latLng,
				lat: latLng.lat,
				lng: latLng.lng
			}], WPGMZA.Geocoder.SUCCESS);
			
			return;
		}
		
		if(options.location){
			options.latLng = new WPGMZA.LatLng(options.location);
        }

        let location = false;
        let mode = false;
        if(options.address) {
            /* Address based */
            location = options.address;
            mode = WPGMZA.AzureGeocoder.Modes.ADDRESS;
        } else if(options.latLng) {
            /* LatLng Based */
			if(!(options.latLng instanceof WPGMZA.LatLng)){
				options.latLng = new WPGMZA.LatLng(options.latLng);
			}

            location = options.latLng.toString().replaceAll(' ', '');
            mode = WPGMZA.AzureGeocoder.Modes.LATLNG;
        } else {
            /* Not allowed */
			throw new Error("You must supply either a latLng or address");
        }

        let apikey = this.getApiKey();
        if(mode){
            /* We have a valid mode */
            let params = new URLSearchParams({
                'api-version': '1.0',
                "query": location.trim(),
                'subscription-key': apikey
            });

            let endpoint = WPGMZA.AzureGeocoder.API_URL + (mode === WPGMZA.AzureGeocoder.Modes.ADDRESS ? "json" : 'reverse/json');
            let url = `${endpoint}?${params.toString()}`;

            fetch(url)
                .then((response) => {
                    if(!response.ok){
                        return response.json().then((error) => {
                            
                        });
                    }
                    return response.json();
                }).then((data) => {
                    let locations = data.results ? data.results : false;
                    if(!locations && data.addresses){
                        locations = data.addresses;
                    } 

                    locations = locations ? locations : [];

                    const formatted = [];
                    if(locations.length){
                        for(let result of locations){
                            if(mode === WPGMZA.AzureGeocoder.Modes.ADDRESS){
                                formatted.push({
                                    geometry : {
                                        location : new WPGMZA.LatLng({
                                            lat: parseFloat(result.position.lat),
                                            lng: parseFloat(result.position.lon)
                                        })
                                    },
                                    latLng : {
                                        lat: parseFloat(result.position.lat),
                                        lng: parseFloat(result.position.lon)
                                    },
                                    bounds : new WPGMZA.LatLngBounds(
                                        new WPGMZA.LatLng({
                                            lat: result.boundingBox && result.boundingBox.topLeftPoint && result.boundingBox.topLeftPoint.lat ? result.boundingBox.topLeftPoint.lat : result.viewport.topLeftPoint.lat,
                                            lng: result.boundingBox && result.boundingBox.topLeftPoint && result.boundingBox.topLeftPoint.lon ? result.boundingBox.topLeftPoint.lon : result.viewport.topLeftPoint.lon
                                        }),
                                        new WPGMZA.LatLng({
                                            lat: result.boundingBox && result.boundingBox.btmRightPoint && result.boundingBox.btmRightPoint.lat ? result.boundingBox.btmRightPoint.lat : result.viewport.btmRightPoint.lat,
                                            lng: result.boundingBox && result.boundingBox.btmRightPoint && result.boundingBox.btmRightPoint.lon ? result.boundingBox.btmRightPoint.lon : result.viewport.btmRightPoint.lon
                                        })
                                    ),
                                    lat : result.position.lat,
                                    lng : result.position.lon
                                });
                            } else if(mode === WPGMZA.AzureGeocoder.Modes.LATLNG){
                                if(options.fullResult){
                                    formatted.push(result);
                                } else {
                                    formatted.push(result.address.freeformAddress);
                                }
                            }
                        }

                        if(formatted.length > 0){
                            callback(formatted, WPGMZA.Geocoder.SUCCESS);
                        } else {
                            callback([], WPGMZA.Geocoder.ZERO_RESULTS);
                        }
                    } else {
                        callback([], WPGMZA.Geocoder.ZERO_RESULTS);
                    }
                }).catch((error) => {
                    callback(null, WPGMZA.Geocoder.FAIL);
                });
        }
	}
});