(function($) {
	WPGMZA.MapSettings = function(element)
	{
		var str = element.getAttribute("data-settings");
		var json = JSON.parse(str);
		
		for(var key in json)
			this[key] = json[key];
	}
	
	WPGMZA.MapSettings.prototype.toGoogleMapsOptions = function()
	{
		var latLngCoords = (this.start_location && this.start_location.length ? this.start_location.split(",") : [36.7783, 119.4179]);
		
		var latLng = new google.maps.LatLng(
			latLngCoords[0],
			latLngCoords[1]
		);
		
		var options = {
			zoom:			parseInt(this.start_zoom),
			center:			latLng
		};
		
		function empty(name)
		{
			return !this[name] || !this[name].length;
		}
		
		if(!empty("min_zoom"))
			options.minZoom = this.min_zoom;
		if(!empty("max_zoom"))
			options.maxZoom = this.max_zoom;
		
		// These settings are all inverted because the checkbox being set means "disabled"
		options.zoomControl 			= !(this.map_zoom == true);
		options.panControl 				= !(this.map_pan == true);
		options.mapTypeControl			= !(this.map_type == true);
		options.streetViewControl		= !(this.map_streetview == true);
		options.draggable				= !(this.map_draggable == true);
		options.disableDoubleClickZoom	= !(this.map_clickzoom == true);
		options.scrollwheel				= !(this.map_scroll == true);
		options.fullscreenControl		= !(this.map_full_screen_control == true);
		
		switch(this.map_type)
		{
			case 2:
				options.mapTypeId = google.maps.MapTypeId.SATELLITE;
				break;
			
			case 3:
				options.mapTypeId = google.maps.MapTypeId.HYBRID;
				break;
			
			case 4:
				options.mapTypeId = google.maps.MapTypeId.TERRAIN;
				break;
				
			default:
				options.mapTypeId = google.maps.MapTypeId.ROADMAP;
				break;
		}
		
		return options;
	}
})(jQuery);