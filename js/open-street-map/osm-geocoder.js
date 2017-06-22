(function($) {
	
	WPGMZA.OSMGeocoder = function()
	{
		
	}
	
	WPGMZA.OSMGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.OSMGeocoder.prototype.constructor = WPGMZA.OSMGeocoder;
	
	WPGMZA.OSMGeocoder.prototype.getResponseFromCache = function(address, callback)
	{
		$.ajax(WPGMZA.settings.ajaxurl, {
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
			}
		});
	}
	
	WPGMZA.OSMGeocoder.prototype.cacheResponse = function(address, response)
	{
		$.ajax(WPGMZA.settings.ajaxurl, {
			data: {
				action: "wpgmza_query_nominatim_cache",
				query: address,
				response: JSON.stringify(response)
			},
			method: "POST"
		});
	}
	
	WPGMZA.OSMGeocoder.prototype.extractLatLng = function(item)
	{
		return {
			lat: parseFloat(item.lat),
			lng: parseFloat(item.lon)
		};
	}
	
	WPGMZA.OSMGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		var self = this;
		var address = options.address;
		
		var latLng;
		if(latLng = WPGMZA.isLatLngString(address))
		{
			callback(latLng);
			return;
		}
		
		function finish(response)
		{
			var latLng = self.extractLatLng(response[0]);
			callback(latLng);
		}
		
		this.getResponseFromCache(address, function(response) {
			if(response.length)
			{
				finish(response);
				return;
			}
			
			self.getResponseFromNominatim(options, function(response) {
				if(response.length == 0)
				{
					callback(null);
					return;
				}
				
				finish(response);
				
				self.cacheResponse(address, response);
			});
		});
	}
	
})(jQuery);