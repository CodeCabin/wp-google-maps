/**
 * @namespace WPGMZA
 * @module NominatimGeocoder
 * @requires WPGMZA.Geocoder
 */
jQuery(function($) {
	
	/**
	 * @class NominatimGeocoder
	 * @extends Geocoder
	 * @summary OpenLayers geocoder - uses Nominatim by default
	 */
	WPGMZA.NominatimGeocoder = function() {
		
	}
	
	WPGMZA.NominatimGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.NominatimGeocoder.prototype.constructor = WPGMZA.NominatimGeocoder;
	
	/**
	 * @function getResponseFromCache
	 * @access protected
	 * @summary Tries to retrieve cached coordinates from server cache
	 * @param {string} address The street address to geocode
	 * @param {function} callback Where to send the results, as an array
	 * @return {void}
	 */
	WPGMZA.NominatimGeocoder.prototype.getResponseFromCache = function(query, callback)
	{
		WPGMZA.restAPI.call("/geocode-cache", {
			data: {
				query: JSON.stringify(query)
			},
			success: function(response, xhr, status) {
				if(response && response.lon){
					// Legacy compatibility support
					response.lng = response.lon;
				}
				
				callback(response);
			},
			useCompressedPathVariable: true
		});
	}
	
	/**
	 * @function getResponseFromNominatim
	 * @access protected
	 * @summary Queries Nominatim on the specified address
	 * @param {object} options An object containing the options for geocoding, address is a mandatory field
	 * @param {function} callback The function to send the results to, as an array
	 */
	WPGMZA.NominatimGeocoder.prototype.getResponseFromNominatim = function(options, callback)
	{
		var data = {
			q: options.address,
			format: "json"
		};
		
		if(options.componentRestrictions && options.componentRestrictions.country){
			data.countrycodes = options.componentRestrictions.country;
		} else if(options.country){
			data.countrycodes = options.country;
		}

		if(options._query){
			data._query = options._query;
		}
		
		WPGMZA.restAPI.call("/query-nominatim", {
			data: {
				data: data,
			},
			success: function(response, xhr, status) {
				if(response && response.length){
					callback(response);
				} else {
					if(response && response.error){
						/* There may be an additional error in place */
						callback(response.error, WPGMZA.Geocoder.FAIL)
					} else {
						callback(null, WPGMZA.Geocoder.FAIL)
					}
				}
			},
			error: function(response, xhr, status) {
				callback(null, WPGMZA.Geocoder.FAIL)
			}
		});
	}

	/**
	 * @function clearCache
	 * @access protected
	 * @summary Clears the Nomanatim geocode cache
	 * @returns {void}
	 */
	WPGMZA.NominatimGeocoder.prototype.clearCache = function(callback) {
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_clear_nominatim_cache",
				wpgmza_security : WPGMZA.ajaxnonce || false
			},
			method: "POST",
			success: function(response){
				callback(response);
			}
		});
	}
	
	WPGMZA.NominatimGeocoder.prototype.getLatLngFromAddress = function(options, callback) {
		return WPGMZA.NominatimGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.NominatimGeocoder.prototype.getAddressFromLatLng = function(options, callback) {
		return WPGMZA.NominatimGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.NominatimGeocoder.prototype.geocode = function(options, callback) {
		var self = this;
		
		if(!options)
			throw new Error("Invalid options");
		
		if(WPGMZA.LatLng.REGEXP.test(options.address))
		{
			var latLng = WPGMZA.LatLng.fromString(options.address);
			
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
		
		if(options.location)
			options.latLng = new WPGMZA.LatLng(options.location);
		
		var finish, location;
		
		if(options.address) {
			location = options.address;
			
			finish = function(response, status)
			{
				for(var i = 0; i < response.length; i++)
				{
					response[i].geometry = {
						location: new WPGMZA.LatLng({
							lat: parseFloat(response[i].lat),
							lng: parseFloat(response[i].lon)
						})
					};
					
					response[i].latLng = {
						lat: parseFloat(response[i].lat),
						lng: parseFloat(response[i].lon)
					};
					
					response[i].bounds = new WPGMZA.LatLngBounds(
						new WPGMZA.LatLng({
							lat: response[i].boundingbox[1],
							lng: response[i].boundingbox[2]
						}),
						new WPGMZA.LatLng({
							lat: response[i].boundingbox[0],
							lng: response[i].boundingbox[3]
						})
					);
					
					// Backward compatibility with old UGM
					response[i].lng = response[i].lon;
				}
				
				callback(response, status);
			}
		} else if(options.latLng) {
			if(!(options.latLng instanceof WPGMZA.LatLng)){
				options.latLng = new WPGMZA.LatLng(options.latLng);
			}

			location = options.latLng.toString();
			
			finish = function(response, status)
			{
				var address = response[0].display_name;

				if(options.fullResult){
					address = response[0];
				}
				
				callback([address], status);
			}
		} else {
			throw new Error("You must supply either a latLng or address")
        }
		
		var query = {location: location, options: options};
		this.getResponseFromCache(query, function(response) {
			if(response.length) {
				finish(response, WPGMZA.Geocoder.SUCCESS);
				return;
			}
			
			self.getResponseFromNominatim($.extend(options, {address: location, _query : JSON.stringify({location: location, options: options})}), function(response, status) {
				if(status == WPGMZA.Geocoder.FAIL) {
					callback(typeof response === 'string' ? response : null, WPGMZA.Geocoder.FAIL);
					return;
				}
				
				if(response.length == 0) {
					callback([], WPGMZA.Geocoder.ZERO_RESULTS);
					return;
				}
				
				finish(response, WPGMZA.Geocoder.SUCCESS);
			});
		});
	}
});