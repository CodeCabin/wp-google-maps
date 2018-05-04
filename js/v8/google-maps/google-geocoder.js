/**
 * @namespace WPGMZA
 * @module GoogleGeocoder
 * @requires WPGMZA.Geocoder
 */
(function($) {
	
	WPGMZA.GoogleGeocoder = function()
	{
		
	}
	
	WPGMZA.GoogleGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.GoogleGeocoder.prototype.constructor = WPGMZA.GoogleGeocoder;
	
	WPGMZA.GoogleGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(!options || !options.address)
			throw new Error("No address specified");
		
		if(WPGMZA.isLatLngString(options.address))
			return WPGMZA.Geocoder.prototype.getLatLngFromAddress.call(this, options, callback);
		
		if(options.country)
			options.componentRestrictions = {
				country: options.country
			};
		
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode(options, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK)
			{
				var location = results[0].geometry.location;
				latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				callback(latLng);
			}
			else
				callback(null);
		});
	}
	
})(jQuery);