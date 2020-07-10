/**
 * @namespace WPGMZA
 * @module OLGeocoder
 * @requires WPGMZA.Geocoder
 * @gulp-requires ../geocoder.js
 */
jQuery(function($) {
	
	/**
	 * @class OLGeocoder
	 * @extends Geocoder
	 * @summary OpenLayers geocoder - uses Nominatim by default
	 */
	WPGMZA.OLGeocoder = function()
	{
		
	}
	
	WPGMZA.OLGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.OLGeocoder.prototype.constructor = WPGMZA.OLGeocoder;
	
	/**
	 * @function getResponseFromCache
	 * @access protected
	 * @summary Tries to retrieve cached coordinates from server cache
	 * @param {string} address The street address to geocode
	 * @param {function} callback Where to send the results, as an array
	 * @return {void}
	 */
	WPGMZA.OLGeocoder.prototype.getResponseFromCache = function(query, callback)
	{
		WPGMZA.restAPI.call("/geocode-cache", {
			data: {
				query: JSON.stringify(query)
			},
			success: function(response, xhr, status) {
				// Legacy compatibility support
				response.lng = response.lon;
				
				callback(response);
			},
			useCompressedPathVariable: true
		});
		
		/*$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_query_nominatim_cache",
				query: JSON.stringify(query)
			},
			success: function(response, xhr, status) {
				// Legacy compatibility support
				response.lng = response.lon;
				
				callback(response);
			}
		});*/
	}
	
	/**
	 * @function getResponseFromNominatim
	 * @access protected
	 * @summary Queries Nominatim on the specified address
	 * @param {object} options An object containing the options for geocoding, address is a mandatory field
	 * @param {function} callback The function to send the results to, as an array
	 */
	WPGMZA.OLGeocoder.prototype.getResponseFromNominatim = function(options, callback)
	{
		var data = {
			q: options.address,
			format: "json"
		};
		
		if(options.componentRestrictions && options.componentRestrictions.country)
			data.countrycodes = options.componentRestrictions.country;
		
		$.ajax("https://nominatim.openstreetmap.org/search/", {
			data: data,
			success: function(response, xhr, status) {
				callback(response);
			},
			error: function(response, xhr, status) {
				callback(null, WPGMZA.Geocoder.FAIL)
			}
		});
	}
	
	/**
	 * @function cacheResponse
	 * @access protected
	 * @summary Caches a response on the server, usually after it's been returned from Nominatim
	 * @param {string} address The street address
	 * @param {object|array} response The response to cache
	 * @returns {void}
	 */
	WPGMZA.OLGeocoder.prototype.cacheResponse = function(query, response)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_store_nominatim_cache",
				query: JSON.stringify(query),
				response: JSON.stringify(response)
			},
			method: "POST"
		});
	}

	/**
	 * @function clearCache
	 * @access protected
	 * @summary Clears the Nomanatim geocode cache
	 * @returns {void}
	 */
	WPGMZA.OLGeocoder.prototype.clearCache = function(callback)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_clear_nominatim_cache"
			},
			method: "POST",
			success: function(response){
				callback(response);
			}
		});
	}
	
	WPGMZA.OLGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		return WPGMZA.OLGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.OLGeocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		return WPGMZA.OLGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.OLGeocoder.prototype.geocode = function(options, callback)
	{
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
		
		if(options.address)
		{
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
		}
		else if(options.latLng)
		{
			location = options.latLng.toString();
			
			finish = function(response, status)
			{
				var address = response[0].display_name;
				callback([address], status);
			}
		}
		else
			throw new Error("You must supply either a latLng or address")
		
		var query = {location: location, options: options};
		this.getResponseFromCache(query, function(response) {
			if(response.length)
			{
				finish(response, WPGMZA.Geocoder.SUCCESS);
				return;
			}
			
			self.getResponseFromNominatim($.extend(options, {address: location}), function(response, status) {
				if(status == WPGMZA.Geocoder.FAIL)
				{
					callback(null, WPGMZA.Geocoder.FAIL);
					return;
				}
				
				if(response.length == 0)
				{
					callback([], WPGMZA.Geocoder.ZERO_RESULTS);
					return;
				}
				
				finish(response, WPGMZA.Geocoder.SUCCESS);
				
				self.cacheResponse(query, response);
			});
		});
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1nZW9jb2Rlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBPTEdlb2NvZGVyXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuR2VvY29kZXJcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vZ2VvY29kZXIuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQGNsYXNzIE9MR2VvY29kZXJcclxuXHQgKiBAZXh0ZW5kcyBHZW9jb2RlclxyXG5cdCAqIEBzdW1tYXJ5IE9wZW5MYXllcnMgZ2VvY29kZXIgLSB1c2VzIE5vbWluYXRpbSBieSBkZWZhdWx0XHJcblx0ICovXHJcblx0V1BHTVpBLk9MR2VvY29kZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTEdlb2NvZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLkdlb2NvZGVyLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLk9MR2VvY29kZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk9MR2VvY29kZXI7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQGZ1bmN0aW9uIGdldFJlc3BvbnNlRnJvbUNhY2hlXHJcblx0ICogQGFjY2VzcyBwcm90ZWN0ZWRcclxuXHQgKiBAc3VtbWFyeSBUcmllcyB0byByZXRyaWV2ZSBjYWNoZWQgY29vcmRpbmF0ZXMgZnJvbSBzZXJ2ZXIgY2FjaGVcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gYWRkcmVzcyBUaGUgc3RyZWV0IGFkZHJlc3MgdG8gZ2VvY29kZVxyXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFdoZXJlIHRvIHNlbmQgdGhlIHJlc3VsdHMsIGFzIGFuIGFycmF5XHJcblx0ICogQHJldHVybiB7dm9pZH1cclxuXHQgKi9cclxuXHRXUEdNWkEuT0xHZW9jb2Rlci5wcm90b3R5cGUuZ2V0UmVzcG9uc2VGcm9tQ2FjaGUgPSBmdW5jdGlvbihxdWVyeSwgY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0V1BHTVpBLnJlc3RBUEkuY2FsbChcIi9nZW9jb2RlLWNhY2hlXCIsIHtcclxuXHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdHF1ZXJ5OiBKU09OLnN0cmluZ2lmeShxdWVyeSlcclxuXHRcdFx0fSxcclxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UsIHhociwgc3RhdHVzKSB7XHJcblx0XHRcdFx0Ly8gTGVnYWN5IGNvbXBhdGliaWxpdHkgc3VwcG9ydFxyXG5cdFx0XHRcdHJlc3BvbnNlLmxuZyA9IHJlc3BvbnNlLmxvbjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjYWxsYmFjayhyZXNwb25zZSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdHVzZUNvbXByZXNzZWRQYXRoVmFyaWFibGU6IHRydWVcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQvKiQuYWpheChXUEdNWkEuYWpheHVybCwge1xyXG5cdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0YWN0aW9uOiBcIndwZ216YV9xdWVyeV9ub21pbmF0aW1fY2FjaGVcIixcclxuXHRcdFx0XHRxdWVyeTogSlNPTi5zdHJpbmdpZnkocXVlcnkpXHJcblx0XHRcdH0sXHJcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlLCB4aHIsIHN0YXR1cykge1xyXG5cdFx0XHRcdC8vIExlZ2FjeSBjb21wYXRpYmlsaXR5IHN1cHBvcnRcclxuXHRcdFx0XHRyZXNwb25zZS5sbmcgPSByZXNwb25zZS5sb247XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Y2FsbGJhY2socmVzcG9uc2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTsqL1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBAZnVuY3Rpb24gZ2V0UmVzcG9uc2VGcm9tTm9taW5hdGltXHJcblx0ICogQGFjY2VzcyBwcm90ZWN0ZWRcclxuXHQgKiBAc3VtbWFyeSBRdWVyaWVzIE5vbWluYXRpbSBvbiB0aGUgc3BlY2lmaWVkIGFkZHJlc3NcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgb3B0aW9ucyBmb3IgZ2VvY29kaW5nLCBhZGRyZXNzIGlzIGEgbWFuZGF0b3J5IGZpZWxkXHJcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHNlbmQgdGhlIHJlc3VsdHMgdG8sIGFzIGFuIGFycmF5XHJcblx0ICovXHJcblx0V1BHTVpBLk9MR2VvY29kZXIucHJvdG90eXBlLmdldFJlc3BvbnNlRnJvbU5vbWluYXRpbSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKVxyXG5cdHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRxOiBvcHRpb25zLmFkZHJlc3MsXHJcblx0XHRcdGZvcm1hdDogXCJqc29uXCJcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMuY29tcG9uZW50UmVzdHJpY3Rpb25zICYmIG9wdGlvbnMuY29tcG9uZW50UmVzdHJpY3Rpb25zLmNvdW50cnkpXHJcblx0XHRcdGRhdGEuY291bnRyeWNvZGVzID0gb3B0aW9ucy5jb21wb25lbnRSZXN0cmljdGlvbnMuY291bnRyeTtcclxuXHRcdFxyXG5cdFx0JC5hamF4KFwiaHR0cHM6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoL1wiLCB7XHJcblx0XHRcdGRhdGE6IGRhdGEsXHJcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlLCB4aHIsIHN0YXR1cykge1xyXG5cdFx0XHRcdGNhbGxiYWNrKHJlc3BvbnNlKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlLCB4aHIsIHN0YXR1cykge1xyXG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIFdQR01aQS5HZW9jb2Rlci5GQUlMKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQGZ1bmN0aW9uIGNhY2hlUmVzcG9uc2VcclxuXHQgKiBAYWNjZXNzIHByb3RlY3RlZFxyXG5cdCAqIEBzdW1tYXJ5IENhY2hlcyBhIHJlc3BvbnNlIG9uIHRoZSBzZXJ2ZXIsIHVzdWFsbHkgYWZ0ZXIgaXQncyBiZWVuIHJldHVybmVkIGZyb20gTm9taW5hdGltXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFkZHJlc3MgVGhlIHN0cmVldCBhZGRyZXNzXHJcblx0ICogQHBhcmFtIHtvYmplY3R8YXJyYXl9IHJlc3BvbnNlIFRoZSByZXNwb25zZSB0byBjYWNoZVxyXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTEdlb2NvZGVyLnByb3RvdHlwZS5jYWNoZVJlc3BvbnNlID0gZnVuY3Rpb24ocXVlcnksIHJlc3BvbnNlKVxyXG5cdHtcclxuXHRcdCQuYWpheChXUEdNWkEuYWpheHVybCwge1xyXG5cdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0YWN0aW9uOiBcIndwZ216YV9zdG9yZV9ub21pbmF0aW1fY2FjaGVcIixcclxuXHRcdFx0XHRxdWVyeTogSlNPTi5zdHJpbmdpZnkocXVlcnkpLFxyXG5cdFx0XHRcdHJlc3BvbnNlOiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSlcclxuXHRcdFx0fSxcclxuXHRcdFx0bWV0aG9kOiBcIlBPU1RcIlxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAZnVuY3Rpb24gY2xlYXJDYWNoZVxyXG5cdCAqIEBhY2Nlc3MgcHJvdGVjdGVkXHJcblx0ICogQHN1bW1hcnkgQ2xlYXJzIHRoZSBOb21hbmF0aW0gZ2VvY29kZSBjYWNoZVxyXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTEdlb2NvZGVyLnByb3RvdHlwZS5jbGVhckNhY2hlID0gZnVuY3Rpb24oY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0JC5hamF4KFdQR01aQS5hamF4dXJsLCB7XHJcblx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRhY3Rpb246IFwid3BnbXphX2NsZWFyX25vbWluYXRpbV9jYWNoZVwiXHJcblx0XHRcdH0sXHJcblx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXHJcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRjYWxsYmFjayhyZXNwb25zZSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xHZW9jb2Rlci5wcm90b3R5cGUuZ2V0TGF0TG5nRnJvbUFkZHJlc3MgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaylcclxuXHR7XHJcblx0XHRyZXR1cm4gV1BHTVpBLk9MR2VvY29kZXIucHJvdG90eXBlLmdlb2NvZGUob3B0aW9ucywgY2FsbGJhY2spO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xHZW9jb2Rlci5wcm90b3R5cGUuZ2V0QWRkcmVzc0Zyb21MYXRMbmcgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaylcclxuXHR7XHJcblx0XHRyZXR1cm4gV1BHTVpBLk9MR2VvY29kZXIucHJvdG90eXBlLmdlb2NvZGUob3B0aW9ucywgY2FsbGJhY2spO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xHZW9jb2Rlci5wcm90b3R5cGUuZ2VvY29kZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0aWYoIW9wdGlvbnMpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3B0aW9uc1wiKTtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLkxhdExuZy5SRUdFWFAudGVzdChvcHRpb25zLmFkZHJlc3MpKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgbGF0TG5nID0gV1BHTVpBLkxhdExuZy5mcm9tU3RyaW5nKG9wdGlvbnMuYWRkcmVzcyk7XHJcblx0XHRcdFxyXG5cdFx0XHRjYWxsYmFjayhbe1xyXG5cdFx0XHRcdGdlb21ldHJ5OiB7XHJcblx0XHRcdFx0XHRsb2NhdGlvbjogbGF0TG5nXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRsYXRMbmc6IGxhdExuZyxcclxuXHRcdFx0XHRsYXQ6IGxhdExuZy5sYXQsXHJcblx0XHRcdFx0bG5nOiBsYXRMbmcubG5nXHJcblx0XHRcdH1dLCBXUEdNWkEuR2VvY29kZXIuU1VDQ0VTUyk7XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMubG9jYXRpb24pXHJcblx0XHRcdG9wdGlvbnMubGF0TG5nID0gbmV3IFdQR01aQS5MYXRMbmcob3B0aW9ucy5sb2NhdGlvbik7XHJcblx0XHRcclxuXHRcdHZhciBmaW5pc2gsIGxvY2F0aW9uO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLmFkZHJlc3MpXHJcblx0XHR7XHJcblx0XHRcdGxvY2F0aW9uID0gb3B0aW9ucy5hZGRyZXNzO1xyXG5cdFx0XHRcclxuXHRcdFx0ZmluaXNoID0gZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXNwb25zZVtpXS5nZW9tZXRyeSA9IHtcclxuXHRcdFx0XHRcdFx0bG9jYXRpb246IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0XHRcdFx0XHRsYXQ6IHBhcnNlRmxvYXQocmVzcG9uc2VbaV0ubGF0KSxcclxuXHRcdFx0XHRcdFx0XHRsbmc6IHBhcnNlRmxvYXQocmVzcG9uc2VbaV0ubG9uKVxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cmVzcG9uc2VbaV0ubGF0TG5nID0ge1xyXG5cdFx0XHRcdFx0XHRsYXQ6IHBhcnNlRmxvYXQocmVzcG9uc2VbaV0ubGF0KSxcclxuXHRcdFx0XHRcdFx0bG5nOiBwYXJzZUZsb2F0KHJlc3BvbnNlW2ldLmxvbilcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHJlc3BvbnNlW2ldLmJvdW5kcyA9IG5ldyBXUEdNWkEuTGF0TG5nQm91bmRzKFxyXG5cdFx0XHRcdFx0XHRuZXcgV1BHTVpBLkxhdExuZyh7XHJcblx0XHRcdFx0XHRcdFx0bGF0OiByZXNwb25zZVtpXS5ib3VuZGluZ2JveFsxXSxcclxuXHRcdFx0XHRcdFx0XHRsbmc6IHJlc3BvbnNlW2ldLmJvdW5kaW5nYm94WzJdXHJcblx0XHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0XHRuZXcgV1BHTVpBLkxhdExuZyh7XHJcblx0XHRcdFx0XHRcdFx0bGF0OiByZXNwb25zZVtpXS5ib3VuZGluZ2JveFswXSxcclxuXHRcdFx0XHRcdFx0XHRsbmc6IHJlc3BvbnNlW2ldLmJvdW5kaW5nYm94WzNdXHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBCYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggb2xkIFVHTVxyXG5cdFx0XHRcdFx0cmVzcG9uc2VbaV0ubG5nID0gcmVzcG9uc2VbaV0ubG9uO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjYWxsYmFjayhyZXNwb25zZSwgc3RhdHVzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihvcHRpb25zLmxhdExuZylcclxuXHRcdHtcclxuXHRcdFx0bG9jYXRpb24gPSBvcHRpb25zLmxhdExuZy50b1N0cmluZygpO1xyXG5cdFx0XHRcclxuXHRcdFx0ZmluaXNoID0gZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBhZGRyZXNzID0gcmVzcG9uc2VbMF0uZGlzcGxheV9uYW1lO1xyXG5cdFx0XHRcdGNhbGxiYWNrKFthZGRyZXNzXSwgc3RhdHVzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzdXBwbHkgZWl0aGVyIGEgbGF0TG5nIG9yIGFkZHJlc3NcIilcclxuXHRcdFxyXG5cdFx0dmFyIHF1ZXJ5ID0ge2xvY2F0aW9uOiBsb2NhdGlvbiwgb3B0aW9uczogb3B0aW9uc307XHJcblx0XHR0aGlzLmdldFJlc3BvbnNlRnJvbUNhY2hlKHF1ZXJ5LCBmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRpZihyZXNwb25zZS5sZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRmaW5pc2gocmVzcG9uc2UsIFdQR01aQS5HZW9jb2Rlci5TVUNDRVNTKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHNlbGYuZ2V0UmVzcG9uc2VGcm9tTm9taW5hdGltKCQuZXh0ZW5kKG9wdGlvbnMsIHthZGRyZXNzOiBsb2NhdGlvbn0pLCBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzKSB7XHJcblx0XHRcdFx0aWYoc3RhdHVzID09IFdQR01aQS5HZW9jb2Rlci5GQUlMKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGNhbGxiYWNrKG51bGwsIFdQR01aQS5HZW9jb2Rlci5GQUlMKTtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYocmVzcG9uc2UubGVuZ3RoID09IDApXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y2FsbGJhY2soW10sIFdQR01aQS5HZW9jb2Rlci5aRVJPX1JFU1VMVFMpO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmaW5pc2gocmVzcG9uc2UsIFdQR01aQS5HZW9jb2Rlci5TVUNDRVNTKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRzZWxmLmNhY2hlUmVzcG9uc2UocXVlcnksIHJlc3BvbnNlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoib3Blbi1sYXllcnMvb2wtZ2VvY29kZXIuanMifQ==
