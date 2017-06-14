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
	
	WPGMZA.Geocoder.getLatLngFromAddress = function(address, callback)
	{
		if(WPGMZA.isLatLngString(address))
		{
			var parts = address.split(",");
			var latLng = {
				lat: parts[0],
				lng: parts[1]
			}
			callback(latLng);
		}
	}
	
})(jQuery);