/**
 * @namespace WPGMZA
 * @module GoogleGeocoder
 * @requires WPGMZA.Geocoder
 */
jQuery(function($) {
	
	/**
	 * Subclass, used when Google is the maps engine. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.GoogleGeocoder
	 * @constructor WPGMZA.GoogleGeocoder
	 * @memberof WPGMZA
	 * @augments WPGMZA.Geocoder
	 * @see WPGMZA.Geocoder.createInstance
	 */
	WPGMZA.GoogleGeocoder = function()
	{
		
	}
	
	WPGMZA.GoogleGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.GoogleGeocoder.prototype.constructor = WPGMZA.GoogleGeocoder;

	WPGMZA.GoogleGeocoder.DIRECT_REQUEST_URL = "https://maps.googleapis.com/maps/api/geocode/json"; 
	
	WPGMZA.GoogleGeocoder.prototype.getLatLngFromAddress = function(options, callback) {

		if(!options || !options.address) {
			
			nativeStatus = WPGMZA.Geocoder.NO_ADDRESS;
			callback(null, nativeStatus);
			return;
			/*throw new Error("No address specified");*/

		}

		if (options.lat && options.lng) {
			var latLng = {
				lat: options.lat,
				lng: options.lng
			};
			var bounds = null;
			
			var results = [
				{
					geometry: {
						location: latLng
					},
					latLng: latLng,
					lat: latLng.lat,
					lng: latLng.lng,
					bounds: bounds
				}
			];
			
			callback(results, WPGMZA.Geocoder.SUCCESS);
		} else {

		}
		
		if(WPGMZA.isLatLngString(options.address))
			return WPGMZA.Geocoder.prototype.getLatLngFromAddress.call(this, options, callback);
		
		if(options.country)
			options.componentRestrictions = {
				country: options.country
			};

		if(!this.isGoogleAvailable()){
			/* Google SDK not available, direct mode */
			this.fetchGeocode(options, callback);
			return;
		}
		
		var geocoder = new google.maps.Geocoder();
		
		geocoder.geocode(options, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK)
			{
				var location = results[0].geometry.location;
				var latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				var bounds = null;
				
				if(results[0].geometry.bounds)
					bounds = WPGMZA.LatLngBounds.fromGoogleLatLngBounds(results[0].geometry.bounds);
				
				var results = [
					{
						geometry: {
							location: latLng
						},
						latLng: latLng,
						lat: latLng.lat,
						lng: latLng.lng,
						bounds: bounds
					}
				];
				
				
				
				callback(results, WPGMZA.Geocoder.SUCCESS);
			}
			else
			{
				var nativeStatus = WPGMZA.Geocoder.FAIL;
				
				if(status == google.maps.GeocoderStatus.ZERO_RESULTS)
					nativeStatus = WPGMZA.Geocoder.ZERO_RESULTS;
				
				callback(null, nativeStatus);
			}
		});
	}
	
	WPGMZA.GoogleGeocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		if(!options || !options.latLng)
			throw new Error("No latLng specified");
		
		var latLng = new WPGMZA.LatLng(options.latLng);

		if(!this.isGoogleAvailable()){
			/* Google SDK not available, direct mode */
			this.fetchGeocode(options, callback);
			return;
		}

		var geocoder = new google.maps.Geocoder();
		
		var options = $.extend(options, {
			location: {
				lat: latLng.lat,
				lng: latLng.lng
			}
		});

		let fullResult = false;
		if(options.fullResult){
			fullResult = true;
			delete options.fullResult;
		}
		
		delete options.latLng;
		
		geocoder.geocode(options, function(results, status) {
			
			if(status !== "OK")
				callback(null, WPGMZA.Geocoder.FAIL);
			
			if(!results || !results.length)
				callback([], WPGMZA.Geocoder.NO_RESULTS);
			
			if(fullResult){
				callback([results[0]], WPGMZA.Geocoder.SUCCESS);
			} else {
				callback([results[0].formatted_address], WPGMZA.Geocoder.SUCCESS);
			}
			
		});
	}

	WPGMZA.GoogleGeocoder.prototype.fetchGeocode = function(options, callback){
		let apikey = this.getApiKey();

		if(!apikey){
			callback(null, WPGMZA.Geocoder.FAIL);
			return;
		}

		let params = {
			key : apikey,
		};

		if(options.address){
			params.address = options.address;
		} else if(options.latLng){
			let latLng = new WPGMZA.LatLng(options.latLng);
			params.latlng = `${latLng.lat},${latLng.lng}`;
		}

		params = new URLSearchParams(params);

		if (options.country) {
			params.append('region', options.country.toLowerCase()); 
		}

		let url = `${WPGMZA.GoogleGeocoder.DIRECT_REQUEST_URL}?${params.toString()}`;
		fetch(url)
			.then((response) => {
				if (!response.ok) {
					return response.json().then(errorData => {

					});
				}
				return response.json();
			})
			.then((data) => {
				const results = data.results ? data.results : [];
				if(data.status === 'OK' && results.length > 0){
					let top = results.shift();

					if(options.address){
						/* Address mode response */
						let pos = {
							lat: top.geometry.location.lat,
							lng: top.geometry.location.lng
						};

						let bound = null;
						if(top.geometry && top.geometry.viewport && top.geometry.viewport.northeast && top.geometry.viewport.southwest){
							bounds = new WPGMZA.LatLngBounds(
								new WPGMZA.LatLng({
									lat: top.geometry.viewport.northeast.lat,
									lng: top.geometry.viewport.northeast.lng
								}),
								new WPGMZA.LatLng({
									lat: top.geometry.viewport.southwest.lat,
									lng: top.geometry.viewport.southwest.lng
								})
							);
						}
						
						let compiled = [
							{
								geometry: {
									location: pos
								},
								latLng: pos,
								lat: pos.lat,
								lng: pos.lng,
								bounds: bounds
							}
						];
						
						callback(compiled, WPGMZA.Geocoder.SUCCESS);
					} else {
						/* LatLng mode response */
						if(options.fullResult){
							callback([top], WPGMZA.Geocoder.SUCCESS);
						} else {
							callback([top.formatted_address], WPGMZA.Geocoder.SUCCESS);
						}
					}
				} else {
					callback([], WPGMZA.Geocoder.NO_RESULTS);
				}
			})
		
	}

	WPGMZA.GoogleGeocoder.prototype.isGoogleAvailable = function() {
		if(typeof google !== 'undefined' && typeof google.maps !== 'undefined' && typeof google.maps.Geocoder !== 'undefined'){
			/* The SDK module is available */
			return true;
		}
		return false;
	}

	WPGMZA.GoogleGeocoder.prototype.getApiKey = function(){
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
	
});