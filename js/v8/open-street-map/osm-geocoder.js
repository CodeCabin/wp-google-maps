/**
 * @namespace WPGMZA
 * @module OSMGeocoder
 * @requires WPGMZA.Geocoder
 */
(function($) {
	
	WPGMZA.OSMGeocoder = function()
	{
		
	}
	
	WPGMZA.OSMGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.OSMGeocoder.prototype.constructor = WPGMZA.OSMGeocoder;
	
	WPGMZA.OSMGeocoder.prototype.getResponseFromCache = function(address, callback)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_query_nominatim_cache",
				query: address
			},
			success: function(response, xhr, status) {
				callback(response);
			}
		});
	}
	
	WPGMZA.OSMGeocoder.prototype.getResponseFromNominatim = function(options, callback)
	{
		var data = {
			q: options.address,
			format: "json"
		};
		
		if(options.country)
			data.countrycodes = options.country;
		
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
	
	WPGMZA.OSMGeocoder.prototype.cacheResponse = function(address, response)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_query_nominatim_cache",
				query: address,
				response: JSON.stringify(response)
			},
			method: "POST"
		});
	}
	
	WPGMZA.OSMGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		var self = this;
		var address = options.address;
		
		var latLng;
		if(latLng = WPGMZA.isLatLngString(address))
			return WPGMZA.Geocoder.prototype.getLatLngFromAddress.call(this, options, callback);
		
		function finish(response, status)
		{
			for(var i = 0; i < response.length; i++)
			{
				response[i].geometry = {
					location: {
						lat: parseFloat(response[i].lat),
						lng: parseFloat(response[i].lon)
					}
				};
				
				response[i].lng = response[i].lon;
			}
			
			callback(response, status);
		}
		
		this.getResponseFromCache(address, function(response) {
			if(response.length)
			{
				finish(response, WPGMZA.Geocoder.SUCCESS);
				return;
			}
			
			self.getResponseFromNominatim(options, function(response, status) {
				if(status == WPGMZA.Geocoder.FAIL)
				{
					callback(null, WPGMZA.Geocoder.FAIL);
					return;
				}
				
				if(response.length == 0)
				{
					callback(response, WPGMZA.Geocoder.ZERO_RESULTS);
					return;
				}
				
				finish(response, WPGMZA.Geocoder.SUCCESS);
				
				self.cacheResponse(address, response);
			});
		});
	}
	
})(jQuery);