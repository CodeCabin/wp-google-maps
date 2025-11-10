/**
 * @namespace WPGMZA
 * @module MapSettings
 * @requires WPGMZA
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


		
		function addSettings(input) {
			if(!input)
				return;
			
			for(var key in input) {
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
		if(this.zoom){
			options.zoom = parseInt(this.zoom);
		}
		
		if(this.start_zoom){
			options.zoom = parseInt(this.start_zoom);
		}

		if(this.map_start_zoom){
			options.zoom = parseInt(this.map_start_zoom);
		}
		
		// Zoom limits
		// TODO: This matches the Google code, so some of these could be potentially put on a parent class
		if(this.map_min_zoom && this.map_max_zoom)
		{
			options.minZoom = Math.min(this.map_min_zoom, this.map_max_zoom);
			options.maxZoom = Math.max(this.map_min_zoom, this.map_max_zoom);
		}

		switch(parseInt(this.type)) {
			case 2:
				options.mapType = 'satellite';
				break;
			case 3:
				options.mapType = 'hybrid';
				break;
			case 4:
				options.mapType = 'terrain';
				break;
			default:
				options.mapType = 'roadmap';
				break;
		}
		
		return options;
	}

	/**
	 * Returns settings on this object converted to Leaflet view options
	 * @method
	 * @memberof WPGMZA.MapSettings
	 * @return {object} The map settings, in a format understood by OpenLayers
	 */
	WPGMZA.MapSettings.prototype.toLeafletViewOptions = function()
	{
		var self = this;
		var options = {
			center: L.latLng({lat: 36.7783, lng: -119.4179}),
			zoom: 4
		};
		
		function empty(name) {
			if(typeof self[name] == "object")
				return false;
			
			return !self[name] || (typeof self[name] === 'string' ? !self[name].length : !(self[name].toString().length));
		}
		
		// Start location
		if(typeof this.start_location == "string") {
			var coords = this.start_location.replace(/^\(|\)$/g, "").split(",");
			if(WPGMZA.isLatLngString(this.start_location))
				options.center = L.latLng({
					lat: parseFloat(coords[0]),
					lng: parseFloat(coords[1])
				});
			else
				console.warn("Invalid start location");
		}
		
		if(this.center) {
			options.center = L.latLng({
					lat: this.center.lat,
					lng: this.center.lng
			});
			
		}
		
		if(!empty("map_start_lat") && !empty("map_start_lng")) {
			options.center = L.latLng({
					lat: this.map_start_lat,
					lng: this.map_start_lng
			});
		}
		
		// Start zoom
		if(this.zoom){
			options.zoom = parseInt(this.zoom);
		}
		
		if(this.start_zoom){
			options.zoom = parseInt(this.start_zoom);
		}

		if(this.map_start_zoom || this.map_start_zoom == 0){
			options.zoom = parseInt(this.map_start_zoom);
		}
		
		// Zoom limits
		// TODO: This matches the Google code, so some of these could be potentially put on a parent class
		if(this.map_min_zoom && this.map_max_zoom) {
			options.minZoom = Math.min(this.map_min_zoom, this.map_max_zoom);
			options.maxZoom = Math.max(this.map_min_zoom, this.map_max_zoom);
		}

		function isSettingDisabled(value) {
			if(value === "yes")
				return true;
			
			return (value ? true : false);
		}

		options.zoomControl = !isSettingDisabled(this.wpgmza_settings_map_zoom);
        options.dragging = !isSettingDisabled(this.wpgmza_settings_map_draggable);
        options.doubleClickZoom	= !isSettingDisabled(this.wpgmza_settings_map_clickzoom);
        options.scrollWheelZoom	= !isSettingDisabled(this.wpgmza_settings_map_scroll);

		options.closePopupOnClick = this.close_infowindow_on_map_click ? true : false;
		
		switch(parseInt(this.type)) {
			case 2:
				options.mapType = 'satellite';
				break;
			case 3:
				options.mapType = 'hybrid';
				break;
			case 4:
				options.mapType = 'terrain';
				break;
			default:
				options.mapType = 'roadmap';
				break;
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
			if(WPGMZA.isNumeric(coord))
				return coord;
			return parseFloat( String(coord).replace(/[\(\)\s]/, "") );
		}
		
		var latLng = new google.maps.LatLng(
			formatCoord(latLngCoords[0]),
			formatCoord(latLngCoords[1])
		);
		
		var zoom = (this.start_zoom ? parseInt(this.start_zoom) : 4);
		
		if(!this.start_zoom && this.zoom){
			zoom = parseInt( this.zoom );
		}

		if(this.map_start_zoom){
			zoom = parseInt(this.map_start_zoom);
		}
		
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
		
		// NB: Handles legacy checkboxes as well as new, standard controls
		function isSettingDisabled(value)
		{
			if(value === "yes")
				return true;
			
			return (value ? true : false);
		}
		
		// These settings are all inverted because the checkbox being set means "disabled"
		options.zoomControl				= !isSettingDisabled(this.wpgmza_settings_map_zoom);
		options.cameraControl			= !isSettingDisabled(this.wpgmza_settings_map_camera_control);
        options.panControl				= !isSettingDisabled(this.wpgmza_settings_map_pan);
        options.mapTypeControl			= !isSettingDisabled(this.wpgmza_settings_map_type);
        options.streetViewControl		= !isSettingDisabled(this.wpgmza_settings_map_streetview);
        options.fullscreenControl		= !isSettingDisabled(this.wpgmza_settings_map_full_screen_control);
        
        options.draggable				= !isSettingDisabled(this.wpgmza_settings_map_draggable);
        options.disableDoubleClickZoom	= isSettingDisabled(this.wpgmza_settings_map_clickzoom);

        if(isSettingDisabled(this.wpgmza_settings_map_tilt_controls)){
        	options.rotateControl = false;
        	options.tilt = 0;
        }
		
		// NB: This setting is handled differently as setting scrollwheel to true breaks gestureHandling
		if(this.wpgmza_settings_map_scroll)
			options.scrollwheel			= false;
		
		if(this.wpgmza_force_greedy_gestures == "greedy" 
			|| this.wpgmza_force_greedy_gestures == "yes"
			|| this.wpgmza_force_greedy_gestures == true)
		{
			options.gestureHandling = "greedy";
			
			// Setting this at all will break gesture handling. Make sure we delete it when using greedy gesture handling
			if(!this.wpgmza_settings_map_scroll && "scrollwheel" in options)
				delete options.scrollwheel;
		}
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

		if(WPGMZA.settings && WPGMZA.settings.googleMarkerMode && WPGMZA.settings.googleMarkerMode === WPGMZA.GoogleMarker.MARKER_MODE_ADVANCED){
			options.mapId = `wpgmza_map_${this.id}`;
		}
		
		if(this.wpgmza_theme_data && this.wpgmza_theme_data.length){
			if(WPGMZA.settings && WPGMZA.settings.googleMarkerMode && WPGMZA.settings.googleMarkerMode !== WPGMZA.GoogleMarker.MARKER_MODE_ADVANCED){
				options.styles = WPGMZA.GoogleMap.parseThemeData(this.wpgmza_theme_data);
			}
		}


		
		return options;
	}

	/**
	 * Configure tile server
	 * 
	 * This is specifically for engines that utilize either and XYZ or vector tile layer system (Not Google Maps)
	 * 
	 * This hydrates the content with global definition, manages inline replacements, building paramaters and 
	 * eventually will be used for local map setting overrides as well
	 * 
	 * @param string url The URL being processed
	 * @param object options The options to apply while configuring
	 * 
	 * @return object
	 */
	WPGMZA.MapSettings.prototype.configureTileServer = function(url, options){
		if(url){
            const config = {
                url : url,
                params : {},
                replacements : [],
                authentication : {
                    name : 'apikey',
                    token : false
                },
                options : {},
                type : 'xyz'
            };

            /* We could add localized map options here as well */
            const settings = WPGMZA.settings ? WPGMZA.settings : {};

            /* Check for a custom override */
            if(config.url === 'custom_override'){
                /* Custom override detected */
                if(settings.tile_server_url_override && settings.tile_server_url_override.trim() !== ""){
                    config.url = settings.tile_server_url_override.trim();
                }
            }

            if(options){
                if(options.authentication && options.authentication.trim().length > 0){
                    config.authentication.token = options.authentication.trim();
                }

                if(options.preferServerGlobals){
                    /* Engine prefers {s} server flag */
                    config.replacements.push({key : "{a-c}", value : "{s}"});
                } else {
					config.replacements.push({key : "{s}", value : "{a-c}"});
				}
            }

            /* Hydrate the server definition */
            config.definition = WPGMZA.tileServer && WPGMZA.tileServer instanceof Object ? WPGMZA.tileServer : false;
			if(options.map && options.map.settings){
				if(options.map.settings.tile_server_override && options.map.settings.tile_server_override_config){
					/* We have a full override for this specific map */
					if(options.map.settings.tile_server_override_config.provider === config.definition.provider){
						/* Providers do match, we can go ahead */
						config.definition = options.map.settings.tile_server_override_config;
						config.url = config.definition.url;
					}
				}
			}

            if(config.definition){
				if(config.definition.multi){
					/* Multi layer - Complex*/
					if(config.definition.layers && config.definition.layers.length){
						/* Check the active map selection layer type */
						let selectedLayerType = 'roadmap'; 

						if(options.map && options.map.getMapType){
							selectedLayerType = options.map.getMapType();
						}

						let layerLookup = [];
						let activeLayer = config.definition.layers[0] ? config.definition.layers[0] : false;
						/* Check that the selection type is available in the layer list */
						for(let layerIndex in config.definition.layers){
							let layer = config.definition.layers[layerIndex];
							if(layer.selection_type === selectedLayerType){
								/* Match */
								activeLayer = layer;
							}

							layerLookup[layerIndex] = layer.selection_type;
						}

						if(activeLayer && activeLayer.config && activeLayer.config instanceof Object){
							/* We have matched a layer for use - replace the hydration override */
							config.definition = activeLayer.config;

							/* Replace the local config drivers as well */
							if(config.definition.url !== config.url){
								config.url = config.definition.url;
							}

							/* Flag multi-layer support on the map settings - This will allow us to generate controls */
							this._multilayerTileserver = {
								layers : layerLookup,
								active : selectedLayerType
							};

							config.layers = layerLookup;
						} else {
							console.warn(`📍 WP Go Maps: Could not identify default map layer`);
						}
					} else {
						console.warn(`📍 WP Go Maps: You are using a multi-layer tile server, but no layers were found. Please check your configuration.`);
					}
				} 

				/* Definition - Attributions */
				if(config.definition.attribution){
					let attribution = config.definition.attribution;
					let attrReplace = {
						YEAR : new Date().getFullYear()
					};

					for(let replaceK in attrReplace){
						attribution = attribution.replace(`{{${replaceK}}}`, attrReplace[replaceK]);
					}

					config.options.attributions = attribution;
					config.options.attribution = attribution;
				}

				/* Definition - Check auth name  */
				if(config.definition.key_field_name){
					config.authentication.name = config.definition.key_field_name;
				} 

				/* Definition - Check type change */
				if(config.definition.type && config.definition.type !== config.type){
					config.type = config.definition.type;
				}

				/* Definition - Params */
				if(config.definition.params){
					for(let paramName in config.definition.params){
						config.params[paramName] = config.definition.params[paramName];
					}
				}
            }

			/* Check for dependency layers */
			if(config.definition.dependencies){
				config.dependencies = [];
				for(let depIndex in config.definition.dependencies){
					let dependency = config.definition.dependencies[depIndex];
					if(dependency && dependency.provider && config.definition.provider){
						if(dependency.provider === config.definition.provider){
							/* Dependency providers match, so we can work with it */
							config.dependencies.push({
								url : dependency.url,
								params : dependency.params ? dependency.params : {}
							});
						}
					}
				}
			}

            /* Append the authentication */
            if(config.authentication.token){
                if(config.url.indexOf('{' + config.authentication.name + '}') !== -1){
                    /* It's an inline auth token */
                    config.replacements.push({key : "{" + config.authentication.name + "}", value : config.authentication.token});
                } else {
                    /* Append as a param */
                    config.params[config.authentication.name] = config.authentication.token;
                }
		    }

            /* Check for an alias - Aliases are only for storage system */
            if(config.url.indexOf("{alias:") !== -1){
                /* This is a direct replacement */
                config.url = config.url.replace(/{alias:.*?}/, '');
            }

			/* Handle dependency layers */
			if(config.dependencies){
				for(let depIndex in config.dependencies){
					let dependencyUrl = config.dependencies[depIndex].url;
					let dependencyParams = config.dependencies[depIndex].params;

					dependencyUrl = dependencyUrl.replace(/{alias:.*?}/, '');
					if(dependencyUrl.indexOf('{' + config.authentication.name + '}') !== -1){
						dependencyUrl = dependencyUrl.replace('{' + config.authentication.name + '}', config.authentication.token);
					} else {
						/* Append as a param */
						dependencyParams[config.authentication.name] = config.authentication.token;
					}

					let compiledDepParams = [];
					for(let paramName in dependencyParams){
						compiledDepParams.push(`${paramName}=${dependencyParams[paramName]}`);
					}

					config.dependencies[depIndex].compiledParams = compiledDepParams.join("&");
					if(config.dependencies[depIndex].compiledParams){
						dependencyUrl = `${dependencyUrl}?${config.dependencies[depIndex].compiledParams}`;
					}

					config.dependencies[depIndex].url = dependencyUrl;
				}
			}

            /* Compile the URL */
            config.compiledParams = [];
            for(let paramName in config.params){
				config.compiledParams.push(`${paramName}=${config.params[paramName]}`);
            }

			config.compiledParams = config.compiledParams.join("&");
			if(config.compiledParams){
				config.url = `${config.url}?${config.compiledParams}`;
			}

            /* Perform replacements */
            for(let replacementKey in config.replacements){
				const replacement = config.replacements[replacementKey];
                config.url = config.url.replace(replacement.key, replacement.value);
            }

			/* Check if this is a custom image instead */
			if(this.custom_tile_enabled){
				config.custom = {
					width : 1024,
					height : 1024
				};

				if(this.custom_tile_image_width){
					config.custom.width = parseInt(this.custom_tile_image_width);
				}

				if(this.custom_tile_image_height){
					config.custom.height = parseInt(this.custom_tile_image_height);
				}

				config.custom.dimensions = null;
				try { 
					if(window.devicePixelRatio && window.devicePixelRatio != 1){
						config.custom.dimensions = [config.custom.width, config.custom.height];
					}
				} catch (ex){
					/* Do nothing */
				}

				if(this.custom_tile_image){
					config.type = 'custom';
					config.url = this.custom_tile_image;

					if(this.custom_tile_image_attribution){
						config.custom.attribution = this.custom_tile_image_attribution;
					}
				}
			}

            return config;
        }
        return false;
	}

	WPGMZA.MapSettings.prototype.hasMutlilayerTileServer = function() {
		return this._multilayerTileserver ? this._multilayerTileserver : false;
	}
});
