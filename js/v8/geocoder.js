/**
 * @namespace WPGMZA
 * @module Geocoder
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.Geocoder = function()
	{
		WPGMZA.assertInstanceOf(this, "Geocoder");
	}
	
	WPGMZA.Geocoder.SUCCESS			= "success";
	WPGMZA.Geocoder.ZERO_RESULTS	= "zero-results";
	WPGMZA.Geocoder.FAIL			= "fail";
	
	WPGMZA.Geocoder.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return WPGMZA.GoogleGeocoder;
				break;
				
			default:
				return WPGMZA.OLGeocoder;
				break;
		}
	}
	
	WPGMZA.Geocoder.createInstance = function()
	{
		var constructor = WPGMZA.Geocoder.getConstructor();
		return new constructor();
	}
	
	WPGMZA.Geocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(WPGMZA.isLatLngString(options.address))
		{
			var parts = options.address.split(/,\s*/);
			var latLng = {
				lat: parseFloat(parts[0]),
				lng: parseFloat(parts[1])
			}
			callback(latLng);
		}
	}
	
	WPGMZA.Geocoder.prototype.geocode = function(options, callback)
	{
		return this.getLatLngFromAddress(options, callback);
	}
	
})(jQuery);