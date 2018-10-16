/**
 * @namespace WPGMZA
 * @module MapSettings
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.MapSettings = function(element)
	{
		var str = element.getAttribute("data-settings");
		var json = JSON.parse(str);
		
		//var id = $(element).attr("data-map-id");
		//var json = JSON.parse(window["wpgmza_map_settings_" + id]);
		
		WPGMZA.assertInstanceOf(this, "MapSettings");
		
		for(var key in WPGMZA.settings)
		{
			var value = WPGMZA.settings[key];
			
			this[key] = value;
		}
		
		for(var key in json)
		{
			var value = json[key];
			
			if(String(value).match(/^-?\d+$/))
				value = parseInt(value);
				
			this[key] = value;
		}
	}
	
	WPGMZA.MapSettings.prototype.toOLViewOptions = function()
	{
		var options = {
			center: ol.proj.fromLonLat([-119.4179, 36.7783]),
			zoom: 4
		};
		
		function empty(name)
		{
			if(typeof self[name] == "object")
				return false;
			
			return !self[name] || !self[name].length;
		}
		
		// Start location
		if(typeof this.start_location == "string")
		{
			var coords = this.start_location.replace(/^\(|\)$/g, "").split(",");
			if(WPGMZA.isLatLngString(this.start_location))
				options.center = ol.proj.fromLonLat([
					parseFloat(coords[1]),
					parseFloat(coords[0])
				]);
			else
				console.warn("Invalid start location");
		}
		
		if(this.center)
		{
			options.center = ol.proj.fromLonLat([
				parseFloat(this.center.lng),
				parseFloat(this.center.lat)
			]);
		}
		
		// Start zoom
		if(this.zoom)
			options.zoom = parseInt(this.zoom);
		
		if(this.start_zoom)
			options.zoom = parseInt(this.start_zoom);
		
		// Zoom limits
		// TODO: This matches the Google code, so some of these could be potentially put on a parent class
		if(!empty("min_zoom"))
			options.minZoom = parseInt(this.min_zoom);
		if(!empty("max_zoom"))
			options.maxZoom = parseInt(this.max_zoom);
		
		return options;
	}
	
	WPGMZA.MapSettings.prototype.toGoogleMapsOptions = function()
	{
		var self = this;
		var latLngCoords = (this.start_location && this.start_location.length ? this.start_location.split(",") : [36.7783, -119.4179]);
		
		function empty(name)
		{
			if(typeof self[name] == "object")
				return false;
			
			return !self[name] || !self[name].length;
		}
		
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
		
		var zoom = (this.start_zoom ? parseInt(this.start_zoom) : 4);
		
		if(!this.start_zoom && this.zoom)
			zoom = parseInt( this.zoom );
		
		var options = {
			zoom:			zoom,
			center:			latLng
		};
		
		if(!empty("center"))
			options.center = new google.maps.LatLng({
				lat: parseFloat(this.center.lat),
				lng: parseFloat(this.center.lng)
			});
		
		if(!empty("min_zoom"))
			options.minZoom = parseInt(this.min_zoom);
		if(!empty("max_zoom"))
			options.maxZoom = parseInt(this.max_zoom);
		
		// These settings are all inverted because the checkbox being set means "disabled"
		options.zoomControl				= !(this.wpgmza_settings_map_zoom == 'yes');
        options.panControl				= !(this.wpgmza_settings_map_pan == 'yes');
        options.mapTypeControl			= !(this.wpgmza_settings_map_type == 'yes');
        options.streetViewControl		= !(this.wpgmza_settings_map_streetview == 'yes');
        options.fullscreenControl		= !(this.wpgmza_settings_map_full_screen_control == 'yes');
        
        options.draggable				= !(this.wpgmza_settings_map_draggable == 'yes');
        options.disableDoubleClickZoom	= !(this.wpgmza_settings_map_clickzoom == 'yes');
        options.scrollwheel				= !(this.wpgmza_settings_map_scroll == 'yes');
		
		if(this.wpgmza_force_greedy_gestures == "greedy" || this.wpgmza_force_greedy_gestures == "yes")
			options.gestureHandling = "greedy";
		else
			options.gestureHandling = "cooperative";
		
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
});