(function($) {
	
	WPGMZA.Geocoder = function()
	{
		
	}
	
	WPGMZA.Geocoder.createInstance = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return new WPGMZA.GoogleGeocoder();
				break;
				
			default:
				return new WPGMZA.OSMGeocoder();
				break;
		}
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
	
})(jQuery);