(function($) {
	WPGMZA.MapSettings = function(element)
	{
		var str = element.getAttribute("data-settings");
		var json = JSON.parse(str);
		
		for(var key in json)
		{
			var value = json[key];
			
			if(String(value).match(/^-?\d+$/))
				value = parseInt(value);
				
			this[key] = value;
		}
	}
	
	WPGMZA.MapSettings.prototype.toGoogleMapsOptions = function()
	{
		var self = this;
		var latLngCoords = (this.start_location && this.start_location.length ? this.start_location.split(",") : [36.7783, 119.4179]);
		
		function formatCoord(coord)
		{
			if($.isNumeric(coord))
				return coord;
			return parseFloat( String(coord).replace(/[\(\)\s]/, "") );
		}
		
		var latLng = new google.maps.LatLng(
			formatCoord(latLngCoords[0]),
			formatCoord(latLngCoords[1])
		);
		
		var options = {
			zoom:			parseInt(this.start_zoom),
			center:			latLng
		};
		
		function empty(name)
		{
			return !self[name] || !self[name].length;
		}
		
		if(!empty("min_zoom"))
			options.minZoom = parseInt(this.min_zoom);
		if(!empty("max_zoom"))
			options.maxZoom = parseInt(this.max_zoom);
		
		// These settings are all inverted because the checkbox being set means "disabled"
		options.zoomControl 			= !(this.map_zoom == true);
		options.panControl 				= !(this.map_pan == true);
		options.mapTypeControl			= !(this.disable_map_type_controls == true);
		options.streetViewControl		= !(this.map_streetview == true);
		options.draggable				= !(this.map_draggable == true);
		options.disableDoubleClickZoom	= !(this.map_clickzoom == true);
		options.scrollwheel				= !(this.map_scroll == true);
		options.fullscreenControl		= !(this.map_full_screen_control == true);
		
		if(this.force_greedy_gestures)
			options.gestureHandling = "greedy";
		
		switch(parseInt(this.map_type))
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
		
		if(this.theme_data && this.theme_data.length > 0)
		{
			try{
				options.styles = JSON.parse(this.theme_data);
			}catch(e) {
				alert("Your theme data is not valid JSON and has been ignored");
			}
		}
		
		return options;
	}
})(jQuery);