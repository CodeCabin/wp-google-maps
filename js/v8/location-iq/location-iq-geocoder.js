/**
 * @namespace WPGMZA
 * @module LocationIQGeocoder
 * @requires WPGMZA.Geocoder
 */
jQuery(function($) {
	
	/**
	 * @class LocationIQGeocoder
	 * @extends Geocoder
	 */
	WPGMZA.LocationIQGeocoder = function() {
		
	}
	
	WPGMZA.LocationIQGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.LocationIQGeocoder.prototype.constructor = WPGMZA.LocationIQGeocoder;

    WPGMZA.LocationIQGeocoder.API_URL = "https://us1.locationiq.com/v1/"; 

    WPGMZA.LocationIQGeocoder.Modes = {
        ADDRESS : 1,
        LATLNG : 2
    };

    WPGMZA.LocationIQGeocoder.prototype.getApiKey = function(){
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

    WPGMZA.LocationIQGeocoder.prototype.getLatLngFromAddress = function(options, callback) {
		return WPGMZA.LocationIQGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.LocationIQGeocoder.prototype.getAddressFromLatLng = function(options, callback) {
		return WPGMZA.LocationIQGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.LocationIQGeocoder.prototype.geocode = function(options, callback) {
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
            mode = WPGMZA.LocationIQGeocoder.Modes.ADDRESS;
        } else if(options.latLng) {
            /* LatLng Based */
			if(!(options.latLng instanceof WPGMZA.LatLng)){
				options.latLng = new WPGMZA.LatLng(options.latLng);
			}

            location = options.latLng;
            mode = WPGMZA.LocationIQGeocoder.Modes.LATLNG;
        } else {
            /* Not allowed */
			throw new Error("You must supply either a latLng or address");
        }

        let apikey = this.getApiKey();
        if(mode){
            /* We have a valid mode */
            let params = new URLSearchParams({
                'format': 'json',
                'key': apikey
            });

            if(mode === WPGMZA.LocationIQGeocoder.Modes.ADDRESS){
                params.append('q', location);
            } else if(mode === WPGMZA.LocationIQGeocoder.Modes.LATLNG){
                params.append('lat', location.lat);
                params.append('lon', location.lng);
            }

            let endpoint = WPGMZA.LocationIQGeocoder.API_URL + (mode === WPGMZA.LocationIQGeocoder.Modes.ADDRESS ? "search" : 'reverse');
            let url = `${endpoint}?${params.toString()}`;

            fetch(url)
                .then((response) => {
                    if(!response.ok){
                        return response.json().then((error) => {
                            
                        });
                    }
                    return response.json();
                }).then((data) => {
                    let locations = data ? data : false;

                    const formatted = [];
                    if(locations.length){
                        for(let result of locations){
                            if(mode === WPGMZA.LocationIQGeocoder.Modes.ADDRESS){
                                formatted.push({
                                    geometry : {
                                        location : new WPGMZA.LatLng({
                                            lat: parseFloat(result.lat),
                                            lng: parseFloat(result.lon)
                                        })
                                    },
                                    latLng : {
                                        lat: parseFloat(result.lat),
                                        lng: parseFloat(result.lon)
                                    },
                                    bounds : null,
                                    lat : result.lat,
                                    lng : result.lon
                                });
                            } else if(mode === WPGMZA.LocationIQGeocoder.Modes.LATLNG){
                                if(options.fullResult){
                                    formatted.push(result);
                                } else {
                                    formatted.push(result.display_name);
                                }
                            }
                        }

                        if(formatted.length > 0){
                            callback(formatted, WPGMZA.Geocoder.SUCCESS);
                        } else {
                            callback([], WPGMZA.Geocoder.ZERO_RESULTS);
                        }
                    } else {
                        if(mode === WPGMZA.LocationIQGeocoder.Modes.LATLNG){
                            if(options.fullResult){
                                formatted.push(locations);
                            } else {
                                formatted.push(locations.display_name);
                            }

                            if(formatted.length > 0){
                                callback(formatted, WPGMZA.Geocoder.SUCCESS);
                            } else {
                                callback([], WPGMZA.Geocoder.ZERO_RESULTS);
                            }
                        } else {
                            callback([], WPGMZA.Geocoder.ZERO_RESULTS);
                        }
                    }
                }).catch((error) => {
                    callback(null, WPGMZA.Geocoder.FAIL);
                });
        }
	}
});