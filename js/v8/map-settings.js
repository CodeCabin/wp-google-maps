/**
 * @namespace WPGMZA
 * @module MapSettings
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * Handles map settings, parsing them from the data-settings attribute on the maps HTML element.
	 * NB: This will be split into GoogleMapSettings and OLMapSettings in the future.
	 * @class WPGMZA.MapSettings
	 * @constructor WPGMZA.MapSettings
	 */
	WPGMZA.MapSettings = function(element)
	{
		var self = this;
		var str = element.getAttribute("data-settings");
		var json;
		
		try{
			json = JSON.parse(str);
		}catch(e) {
			
			str = str.replace(/\\%/g, "%");
			str = str.replace(/\\\\"/g, '\\"');
			
			try{
				json = JSON.parse(str);
			}catch(e) {
				json = {};
				console.warn("Failed to parse map settings JSON");
			}
			
		}
		
		WPGMZA.assertInstanceOf(this, "MapSettings");
		
		function addSettings(input)
		{
			if(!input)
				return;
			
			for(var key in input)
			{
				if(key == "other_settings")
					continue; // Ignore other_settings
				
				var value = input[key];
				
				if(String(value).match(/^-?\d+$/))
					value = parseInt(value);
					
				self[key] = value;
			}
		}
		
		addSettings(WPGMZA.settings);
		
		addSettings(json);
		
		if(json && json.other_settings)
			addSettings(json.other_settings);
	}
	
	/**
	 * Returns settings on this object converted to OpenLayers view options
	 * @method
	 * @memberof WPGMZA.MapSettings
	 * @return {object} The map settings, in a format understood by OpenLayers
	 */
	WPGMZA.MapSettings.prototype.toOLViewOptions = function()
	{
		var self = this;
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
		
		if(!empty("map_start_lat") && !empty("map_start_lng"))
		{
			options.center = ol.proj.fromLonLat([
				parseFloat(this.map_start_lng),
				parseFloat(this.map_start_lat)
			]);
		}
		
		// Start zoom
		if(this.zoom)
			options.zoom = parseInt(this.zoom);
		
		if(this.start_zoom)
			options.zoom = parseInt(this.start_zoom);
		
		// Zoom limits
		// TODO: This matches the Google code, so some of these could be potentially put on a parent class
		if(this.map_min_zoom && this.map_max_zoom)
		{
			options.minZoom = Math.min(this.map_min_zoom, this.map_max_zoom);
			options.maxZoom = Math.max(this.map_min_zoom, this.map_max_zoom);
		}
		
		return options;
	}
	
	/**
	 * Returns settings on this object converted to Google's MapOptions spec.
	 * @method
	 * @memberof WPGMZA.MapSettings
	 * @return {object} The map settings, in the format specified by google.maps.MapOptions
	 */
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
		
		if(!empty("map_start_lat") && !empty("map_start_lng"))
		{
			// NB: map_start_lat and map_start_lng are the "real" values. Not sure where start_location comes from
			options.center = new google.maps.LatLng({
				lat: parseFloat(this.map_start_lat),
				lng: parseFloat(this.map_start_lng)
			});
		}
		
		if(this.map_min_zoom && this.map_max_zoom)
		{
			options.minZoom = Math.min(this.map_min_zoom, this.map_max_zoom);
			options.maxZoom = Math.max(this.map_min_zoom, this.map_max_zoom);
		}
		
		// These settings are all inverted because the checkbox being set means "disabled"
		options.zoomControl				= !(this.wpgmza_settings_map_zoom == 'yes');
        options.panControl				= !(this.wpgmza_settings_map_pan == 'yes');
        options.mapTypeControl			= !(this.wpgmza_settings_map_type == 'yes');
        options.streetViewControl		= !(this.wpgmza_settings_map_streetview == 'yes');
        options.fullscreenControl		= !(this.wpgmza_settings_map_full_screen_control == 'yes');
        
        options.draggable				= !(this.wpgmza_settings_map_draggable == 'yes');
        options.disableDoubleClickZoom	= (this.wpgmza_settings_map_clickzoom == 'yes');
		
		// NB: This setting is handled differently as setting scrollwheel to true breaks gestureHandling
		if(this.wpgmza_settings_map_scroll)
			options.scrollwheel			= false;
		
		if(this.wpgmza_force_greedy_gestures == "greedy" || this.wpgmza_force_greedy_gestures == "yes")
			options.gestureHandling = "greedy";
		else
			options.gestureHandling = "cooperative";
		
		switch(parseInt(this.type))
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
		
		if(this.wpgmza_theme_data && this.wpgmza_theme_data.length)
			options.styles = WPGMZA.GoogleMap.parseThemeData(this.wpgmza_theme_data);
		
		return options;
	}
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXAtc2V0dGluZ3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTWFwU2V0dGluZ3NcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEhhbmRsZXMgbWFwIHNldHRpbmdzLCBwYXJzaW5nIHRoZW0gZnJvbSB0aGUgZGF0YS1zZXR0aW5ncyBhdHRyaWJ1dGUgb24gdGhlIG1hcHMgSFRNTCBlbGVtZW50LlxyXG5cdCAqIE5COiBUaGlzIHdpbGwgYmUgc3BsaXQgaW50byBHb29nbGVNYXBTZXR0aW5ncyBhbmQgT0xNYXBTZXR0aW5ncyBpbiB0aGUgZnV0dXJlLlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuTWFwU2V0dGluZ3NcclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLk1hcFNldHRpbmdzXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcFNldHRpbmdzID0gZnVuY3Rpb24oZWxlbWVudClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgc3RyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNldHRpbmdzXCIpO1xyXG5cdFx0dmFyIGpzb247XHJcblx0XHRcclxuXHRcdHRyeXtcclxuXHRcdFx0anNvbiA9IEpTT04ucGFyc2Uoc3RyKTtcclxuXHRcdH1jYXRjaChlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRzdHIgPSBzdHIucmVwbGFjZSgvXFxcXCUvZywgXCIlXCIpO1xyXG5cdFx0XHRzdHIgPSBzdHIucmVwbGFjZSgvXFxcXFxcXFxcIi9nLCAnXFxcXFwiJyk7XHJcblx0XHRcdFxyXG5cdFx0XHR0cnl7XHJcblx0XHRcdFx0anNvbiA9IEpTT04ucGFyc2Uoc3RyKTtcclxuXHRcdFx0fWNhdGNoKGUpIHtcclxuXHRcdFx0XHRqc29uID0ge307XHJcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiRmFpbGVkIHRvIHBhcnNlIG1hcCBzZXR0aW5ncyBKU09OXCIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRXUEdNWkEuYXNzZXJ0SW5zdGFuY2VPZih0aGlzLCBcIk1hcFNldHRpbmdzXCIpO1xyXG5cdFx0XHJcblx0XHRmdW5jdGlvbiBhZGRTZXR0aW5ncyhpbnB1dClcclxuXHRcdHtcclxuXHRcdFx0aWYoIWlucHV0KVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIga2V5IGluIGlucHV0KVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYoa2V5ID09IFwib3RoZXJfc2V0dGluZ3NcIilcclxuXHRcdFx0XHRcdGNvbnRpbnVlOyAvLyBJZ25vcmUgb3RoZXJfc2V0dGluZ3NcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgdmFsdWUgPSBpbnB1dFtrZXldO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKFN0cmluZyh2YWx1ZSkubWF0Y2goL14tP1xcZCskLykpXHJcblx0XHRcdFx0XHR2YWx1ZSA9IHBhcnNlSW50KHZhbHVlKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdHNlbGZba2V5XSA9IHZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGFkZFNldHRpbmdzKFdQR01aQS5zZXR0aW5ncyk7XHJcblx0XHRcclxuXHRcdGFkZFNldHRpbmdzKGpzb24pO1xyXG5cdFx0XHJcblx0XHRpZihqc29uICYmIGpzb24ub3RoZXJfc2V0dGluZ3MpXHJcblx0XHRcdGFkZFNldHRpbmdzKGpzb24ub3RoZXJfc2V0dGluZ3MpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHNldHRpbmdzIG9uIHRoaXMgb2JqZWN0IGNvbnZlcnRlZCB0byBPcGVuTGF5ZXJzIHZpZXcgb3B0aW9uc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFNldHRpbmdzXHJcblx0ICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWFwIHNldHRpbmdzLCBpbiBhIGZvcm1hdCB1bmRlcnN0b29kIGJ5IE9wZW5MYXllcnNcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwU2V0dGluZ3MucHJvdG90eXBlLnRvT0xWaWV3T3B0aW9ucyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgb3B0aW9ucyA9IHtcclxuXHRcdFx0Y2VudGVyOiBvbC5wcm9qLmZyb21Mb25MYXQoWy0xMTkuNDE3OSwgMzYuNzc4M10pLFxyXG5cdFx0XHR6b29tOiA0XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRmdW5jdGlvbiBlbXB0eShuYW1lKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0eXBlb2Ygc2VsZltuYW1lXSA9PSBcIm9iamVjdFwiKVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiAhc2VsZltuYW1lXSB8fCAhc2VsZltuYW1lXS5sZW5ndGg7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFN0YXJ0IGxvY2F0aW9uXHJcblx0XHRpZih0eXBlb2YgdGhpcy5zdGFydF9sb2NhdGlvbiA9PSBcInN0cmluZ1wiKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgY29vcmRzID0gdGhpcy5zdGFydF9sb2NhdGlvbi5yZXBsYWNlKC9eXFwofFxcKSQvZywgXCJcIikuc3BsaXQoXCIsXCIpO1xyXG5cdFx0XHRpZihXUEdNWkEuaXNMYXRMbmdTdHJpbmcodGhpcy5zdGFydF9sb2NhdGlvbikpXHJcblx0XHRcdFx0b3B0aW9ucy5jZW50ZXIgPSBvbC5wcm9qLmZyb21Mb25MYXQoW1xyXG5cdFx0XHRcdFx0cGFyc2VGbG9hdChjb29yZHNbMV0pLFxyXG5cdFx0XHRcdFx0cGFyc2VGbG9hdChjb29yZHNbMF0pXHJcblx0XHRcdFx0XSk7XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJJbnZhbGlkIHN0YXJ0IGxvY2F0aW9uXCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZih0aGlzLmNlbnRlcilcclxuXHRcdHtcclxuXHRcdFx0b3B0aW9ucy5jZW50ZXIgPSBvbC5wcm9qLmZyb21Mb25MYXQoW1xyXG5cdFx0XHRcdHBhcnNlRmxvYXQodGhpcy5jZW50ZXIubG5nKSxcclxuXHRcdFx0XHRwYXJzZUZsb2F0KHRoaXMuY2VudGVyLmxhdClcclxuXHRcdFx0XSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKCFlbXB0eShcIm1hcF9zdGFydF9sYXRcIikgJiYgIWVtcHR5KFwibWFwX3N0YXJ0X2xuZ1wiKSlcclxuXHRcdHtcclxuXHRcdFx0b3B0aW9ucy5jZW50ZXIgPSBvbC5wcm9qLmZyb21Mb25MYXQoW1xyXG5cdFx0XHRcdHBhcnNlRmxvYXQodGhpcy5tYXBfc3RhcnRfbG5nKSxcclxuXHRcdFx0XHRwYXJzZUZsb2F0KHRoaXMubWFwX3N0YXJ0X2xhdClcclxuXHRcdFx0XSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFN0YXJ0IHpvb21cclxuXHRcdGlmKHRoaXMuem9vbSlcclxuXHRcdFx0b3B0aW9ucy56b29tID0gcGFyc2VJbnQodGhpcy56b29tKTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5zdGFydF96b29tKVxyXG5cdFx0XHRvcHRpb25zLnpvb20gPSBwYXJzZUludCh0aGlzLnN0YXJ0X3pvb20pO1xyXG5cdFx0XHJcblx0XHQvLyBab29tIGxpbWl0c1xyXG5cdFx0Ly8gVE9ETzogVGhpcyBtYXRjaGVzIHRoZSBHb29nbGUgY29kZSwgc28gc29tZSBvZiB0aGVzZSBjb3VsZCBiZSBwb3RlbnRpYWxseSBwdXQgb24gYSBwYXJlbnQgY2xhc3NcclxuXHRcdGlmKHRoaXMubWFwX21pbl96b29tICYmIHRoaXMubWFwX21heF96b29tKVxyXG5cdFx0e1xyXG5cdFx0XHRvcHRpb25zLm1pblpvb20gPSBNYXRoLm1pbih0aGlzLm1hcF9taW5fem9vbSwgdGhpcy5tYXBfbWF4X3pvb20pO1xyXG5cdFx0XHRvcHRpb25zLm1heFpvb20gPSBNYXRoLm1heCh0aGlzLm1hcF9taW5fem9vbSwgdGhpcy5tYXBfbWF4X3pvb20pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gb3B0aW9ucztcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBzZXR0aW5ncyBvbiB0aGlzIG9iamVjdCBjb252ZXJ0ZWQgdG8gR29vZ2xlJ3MgTWFwT3B0aW9ucyBzcGVjLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFNldHRpbmdzXHJcblx0ICogQHJldHVybiB7b2JqZWN0fSBUaGUgbWFwIHNldHRpbmdzLCBpbiB0aGUgZm9ybWF0IHNwZWNpZmllZCBieSBnb29nbGUubWFwcy5NYXBPcHRpb25zXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcFNldHRpbmdzLnByb3RvdHlwZS50b0dvb2dsZU1hcHNPcHRpb25zID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdHZhciBsYXRMbmdDb29yZHMgPSAodGhpcy5zdGFydF9sb2NhdGlvbiAmJiB0aGlzLnN0YXJ0X2xvY2F0aW9uLmxlbmd0aCA/IHRoaXMuc3RhcnRfbG9jYXRpb24uc3BsaXQoXCIsXCIpIDogWzM2Ljc3ODMsIC0xMTkuNDE3OV0pO1xyXG5cdFx0XHJcblx0XHRmdW5jdGlvbiBlbXB0eShuYW1lKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0eXBlb2Ygc2VsZltuYW1lXSA9PSBcIm9iamVjdFwiKVxyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiAhc2VsZltuYW1lXSB8fCAhc2VsZltuYW1lXS5sZW5ndGg7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZ1bmN0aW9uIGZvcm1hdENvb3JkKGNvb3JkKVxyXG5cdFx0e1xyXG5cdFx0XHRpZigkLmlzTnVtZXJpYyhjb29yZCkpXHJcblx0XHRcdFx0cmV0dXJuIGNvb3JkO1xyXG5cdFx0XHRyZXR1cm4gcGFyc2VGbG9hdCggU3RyaW5nKGNvb3JkKS5yZXBsYWNlKC9bXFwoXFwpXFxzXS8sIFwiXCIpICk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBsYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKFxyXG5cdFx0XHRmb3JtYXRDb29yZChsYXRMbmdDb29yZHNbMF0pLFxyXG5cdFx0XHRmb3JtYXRDb29yZChsYXRMbmdDb29yZHNbMV0pXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHR2YXIgem9vbSA9ICh0aGlzLnN0YXJ0X3pvb20gPyBwYXJzZUludCh0aGlzLnN0YXJ0X3pvb20pIDogNCk7XHJcblx0XHRcclxuXHRcdGlmKCF0aGlzLnN0YXJ0X3pvb20gJiYgdGhpcy56b29tKVxyXG5cdFx0XHR6b29tID0gcGFyc2VJbnQoIHRoaXMuem9vbSApO1xyXG5cdFx0XHJcblx0XHR2YXIgb3B0aW9ucyA9IHtcclxuXHRcdFx0em9vbTpcdFx0XHR6b29tLFxyXG5cdFx0XHRjZW50ZXI6XHRcdFx0bGF0TG5nXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRpZighZW1wdHkoXCJjZW50ZXJcIikpXHJcblx0XHRcdG9wdGlvbnMuY2VudGVyID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyh7XHJcblx0XHRcdFx0bGF0OiBwYXJzZUZsb2F0KHRoaXMuY2VudGVyLmxhdCksXHJcblx0XHRcdFx0bG5nOiBwYXJzZUZsb2F0KHRoaXMuY2VudGVyLmxuZylcclxuXHRcdFx0fSk7XHJcblx0XHRcclxuXHRcdGlmKCFlbXB0eShcIm1hcF9zdGFydF9sYXRcIikgJiYgIWVtcHR5KFwibWFwX3N0YXJ0X2xuZ1wiKSlcclxuXHRcdHtcclxuXHRcdFx0Ly8gTkI6IG1hcF9zdGFydF9sYXQgYW5kIG1hcF9zdGFydF9sbmcgYXJlIHRoZSBcInJlYWxcIiB2YWx1ZXMuIE5vdCBzdXJlIHdoZXJlIHN0YXJ0X2xvY2F0aW9uIGNvbWVzIGZyb21cclxuXHRcdFx0b3B0aW9ucy5jZW50ZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHtcclxuXHRcdFx0XHRsYXQ6IHBhcnNlRmxvYXQodGhpcy5tYXBfc3RhcnRfbGF0KSxcclxuXHRcdFx0XHRsbmc6IHBhcnNlRmxvYXQodGhpcy5tYXBfc3RhcnRfbG5nKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYodGhpcy5tYXBfbWluX3pvb20gJiYgdGhpcy5tYXBfbWF4X3pvb20pXHJcblx0XHR7XHJcblx0XHRcdG9wdGlvbnMubWluWm9vbSA9IE1hdGgubWluKHRoaXMubWFwX21pbl96b29tLCB0aGlzLm1hcF9tYXhfem9vbSk7XHJcblx0XHRcdG9wdGlvbnMubWF4Wm9vbSA9IE1hdGgubWF4KHRoaXMubWFwX21pbl96b29tLCB0aGlzLm1hcF9tYXhfem9vbSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFRoZXNlIHNldHRpbmdzIGFyZSBhbGwgaW52ZXJ0ZWQgYmVjYXVzZSB0aGUgY2hlY2tib3ggYmVpbmcgc2V0IG1lYW5zIFwiZGlzYWJsZWRcIlxyXG5cdFx0b3B0aW9ucy56b29tQ29udHJvbFx0XHRcdFx0PSAhKHRoaXMud3BnbXphX3NldHRpbmdzX21hcF96b29tID09ICd5ZXMnKTtcclxuICAgICAgICBvcHRpb25zLnBhbkNvbnRyb2xcdFx0XHRcdD0gISh0aGlzLndwZ216YV9zZXR0aW5nc19tYXBfcGFuID09ICd5ZXMnKTtcclxuICAgICAgICBvcHRpb25zLm1hcFR5cGVDb250cm9sXHRcdFx0PSAhKHRoaXMud3BnbXphX3NldHRpbmdzX21hcF90eXBlID09ICd5ZXMnKTtcclxuICAgICAgICBvcHRpb25zLnN0cmVldFZpZXdDb250cm9sXHRcdD0gISh0aGlzLndwZ216YV9zZXR0aW5nc19tYXBfc3RyZWV0dmlldyA9PSAneWVzJyk7XHJcbiAgICAgICAgb3B0aW9ucy5mdWxsc2NyZWVuQ29udHJvbFx0XHQ9ICEodGhpcy53cGdtemFfc2V0dGluZ3NfbWFwX2Z1bGxfc2NyZWVuX2NvbnRyb2wgPT0gJ3llcycpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIG9wdGlvbnMuZHJhZ2dhYmxlXHRcdFx0XHQ9ICEodGhpcy53cGdtemFfc2V0dGluZ3NfbWFwX2RyYWdnYWJsZSA9PSAneWVzJyk7XHJcbiAgICAgICAgb3B0aW9ucy5kaXNhYmxlRG91YmxlQ2xpY2tab29tXHQ9ICh0aGlzLndwZ216YV9zZXR0aW5nc19tYXBfY2xpY2t6b29tID09ICd5ZXMnKTtcclxuXHRcdFxyXG5cdFx0Ly8gTkI6IFRoaXMgc2V0dGluZyBpcyBoYW5kbGVkIGRpZmZlcmVudGx5IGFzIHNldHRpbmcgc2Nyb2xsd2hlZWwgdG8gdHJ1ZSBicmVha3MgZ2VzdHVyZUhhbmRsaW5nXHJcblx0XHRpZih0aGlzLndwZ216YV9zZXR0aW5nc19tYXBfc2Nyb2xsKVxyXG5cdFx0XHRvcHRpb25zLnNjcm9sbHdoZWVsXHRcdFx0PSBmYWxzZTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy53cGdtemFfZm9yY2VfZ3JlZWR5X2dlc3R1cmVzID09IFwiZ3JlZWR5XCIgfHwgdGhpcy53cGdtemFfZm9yY2VfZ3JlZWR5X2dlc3R1cmVzID09IFwieWVzXCIpXHJcblx0XHRcdG9wdGlvbnMuZ2VzdHVyZUhhbmRsaW5nID0gXCJncmVlZHlcIjtcclxuXHRcdGVsc2VcclxuXHRcdFx0b3B0aW9ucy5nZXN0dXJlSGFuZGxpbmcgPSBcImNvb3BlcmF0aXZlXCI7XHJcblx0XHRcclxuXHRcdHN3aXRjaChwYXJzZUludCh0aGlzLnR5cGUpKVxyXG5cdFx0e1xyXG5cdFx0XHRjYXNlIDI6XHJcblx0XHRcdFx0b3B0aW9ucy5tYXBUeXBlSWQgPSBnb29nbGUubWFwcy5NYXBUeXBlSWQuU0FURUxMSVRFO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2FzZSAzOlxyXG5cdFx0XHRcdG9wdGlvbnMubWFwVHlwZUlkID0gZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLkhZQlJJRDtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHJcblx0XHRcdGNhc2UgNDpcclxuXHRcdFx0XHRvcHRpb25zLm1hcFR5cGVJZCA9IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5URVJSQUlOO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdG9wdGlvbnMubWFwVHlwZUlkID0gZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVA7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRoaXMud3BnbXphX3RoZW1lX2RhdGEgJiYgdGhpcy53cGdtemFfdGhlbWVfZGF0YS5sZW5ndGgpXHJcblx0XHRcdG9wdGlvbnMuc3R5bGVzID0gV1BHTVpBLkdvb2dsZU1hcC5wYXJzZVRoZW1lRGF0YSh0aGlzLndwZ216YV90aGVtZV9kYXRhKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9wdGlvbnM7XHJcblx0fVxyXG59KTsiXSwiZmlsZSI6Im1hcC1zZXR0aW5ncy5qcyJ9
