/**
 * @module WPGMZA
 * @summary This is the core Javascript module. Some code exists in ../core.js, the functionality there will slowly be handed over to this module.
 */
jQuery(function($) {
	var core = {
		maps: [],
		events: null,
		settings: null,
		
		loadingHTML: '<div class="wpgmza-preloader"><div class="wpgmza-loader">...</div></div>',
		
		/**
		 * Override this method to add a scroll offset when using animated scroll
		 * @return number
		 */
		getScrollAnimationOffset: function() {
			return (WPGMZA.settings.scroll_animation_offset || 0);
		},
		
		/**
		 * Animated scroll, accounts for animation settings and fixed header height
		 * @return void
		 */
		animateScroll: function(element, milliseconds) {
			
			var offset = WPGMZA.getScrollAnimationOffset();
			
			if(!milliseconds)
			{
				if(WPGMZA.settings.scroll_animation_milliseconds)
					milliseconds = WPGMZA.settings.scroll_animation_milliseconds;
				else
					milliseconds = 500;
			}
			
			$("html, body").animate({
				scrollTop: $(element).offset().top - offset
			}, milliseconds);
			
		},
		
		/**
		 * @function guid
		 * @summary Utility function returns a GUID
		 * @static
		 * @return {string} The GUID
		 */
		guid: function() { // Public Domain/MIT
		  var d = new Date().getTime();
			if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
				d += performance.now(); //use high-precision timer if available
			}
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
			});
		},
		
		/**
		 * @function hexOpacityToRGBA
		 * @summary Takes a hex string and opacity value and converts it to Openlayers RGBA format
		 * @param {string} colour The hex color string
		 * @param {number} opacity The opacity from 0.0 - 1.0
		 * @static
		 * @return {array} RGBA where color components are 0 - 255 and opacity is 0.0 - 1.0
		 */
		hexOpacityToRGBA: function(colour, opacity)
		{
			hex = parseInt(colour.replace(/^#/, ""), 16);
			return [
				(hex & 0xFF0000) >> 16,
				(hex & 0xFF00) >> 8,
				hex & 0xFF,
				parseFloat(opacity)
			];
		},
		
		latLngRegexp: /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/,
		
		/**
		 * @function isLatLngString
		 * @summary Utility function returns true is string is a latitude and longitude
		 * @param str {string} The string to attempt to parse as coordinates
		 * @static
		 * @return {array} the matched latitude and longitude or null if no match
		 */
		isLatLngString: function(str)
		{
			if(typeof str != "string")
				return null;
			
			// Remove outer brackets
			if(str.match(/^\(.+\)$/))
				str = str.replace(/^\(|\)$/, "");
			
			var m = str.match(WPGMZA.latLngRegexp);
			
			if(!m)
				return null;
			
			return {
				lat: parseFloat(m[1]),
				lng: parseFloat(m[3])
			};
		},
		
		/**
		 * @function stringToLatLng
		 * @summary Utility function returns a latLng literal given a valid latLng string
		 * @param str {string} The string to attempt to parse as coordinates
		 * @static
		 * @return {object} LatLng literal
		 */
		stringToLatLng: function(str)
		{
			var result = WPGMZA.isLatLngString(str);
			
			if(!result)
				throw new Error("Not a valid latLng");
			
			return result;
		},
		
		/**
		 * @function stringToLatLng
		 * @summary Utility function returns a latLng literal given a valid latLng string
		 * @param str {string} The string to attempt to parse as coordinates
		 * @static
		 * @return {object} LatLng literal
		 */
		isHexColorString: function(str)
		{
			if(typeof str != "string")
				return false;
			
			return (str.match(/#[0-9A-F]{6}/i) ? true : false);
		},
		
		/**
		 * @function getImageDimensions
		 * @summary Utility function to get the dimensions of an image, caches results for best performance
		 * @param src {string} Image source URL
		 * @param callback {function} Callback to recieve image dimensions
		 * @static
		 * @return {void}
		 */
		imageDimensionsCache: {},
		getImageDimensions: function(src, callback)
		{
			if(WPGMZA.imageDimensionsCache[src])
			{
				callback(WPGMZA.imageDimensionsCache[src]);
				return;
			}
			
			var img = document.createElement("img");
			img.onload = function(event) {
				var result = {
					width: image.width,
					height: image.height
				};
				WPGMZA.imageDimensionsCache[src] = result;
				callback(result);
			};
			img.src = src;
		},
		
		/**
		 * @function isDeveloperMode
		 * @summary Returns true if developer mode is set
		 * @static 
		 * @return {boolean} True if developer mode is on
		 */
		isDeveloperMode: function()
		{
			return this.developer_mode || (window.Cookies && window.Cookies.get("wpgmza-developer-mode"));
		},
		
		/**
		 * @function isProVersion
		 * @summary Returns true if the Pro add-on is active
		 * @static
		 * @return {boolean} True if the Pro add-on is active
		 */
		isProVersion: function()
		{
			return (this._isProVersion == "1");
		},
		
		/**
		 * @function openMediaDialog
		 * @summary Opens the WP media dialog and returns the result to a callback
		 * @param {function} callback Callback to recieve the attachment ID as the first parameter and URL as the second
		 * @static
		 * @return {void}
		 */
		openMediaDialog: function(callback) {
			// Media upload
			var file_frame;
			
			// If the media frame already exists, reopen it.
			if ( file_frame ) {
				// Set the post ID to what we want
				file_frame.uploader.uploader.param( 'post_id', set_to_post_id );
				// Open frame
				file_frame.open();
				return;
			}
			
			// Create the media frame.
			file_frame = wp.media.frames.file_frame = wp.media({
				title: 'Select a image to upload',
				button: {
					text: 'Use this image',
				},
				multiple: false	// Set to true to allow multiple files to be selected
			});
			
			// When an image is selected, run a callback.
			file_frame.on( 'select', function() {
				// We set multiple to false so only get one image from the uploader
				attachment = file_frame.state().get('selection').first().toJSON();
				
				callback(attachment.id, attachment.url);
			});
			
			// Finally, open the modal
			file_frame.open();
		},
		
		/**
		 * @function getCurrentPosition
		 * @summary This function will get the users position, it first attempts to get
		 * high accuracy position (mobile with GPS sensors etc.), if that fails
		 * (desktops will time out) then it tries again without high accuracy
		 * enabled
		 * @static
		 * @return {object} The users position as a LatLng literal
		 */
		getCurrentPosition: function(callback)
		{
			if(!navigator.geolocation)
			{
				console.warn("No geolocation available on this device");
				return;
			}
			
			var options = {
				enableHighAccuracy: true
			};
			
			navigator.geolocation.getCurrentPosition(function(position) {
				if(callback)
					callback(position);
				
				WPGMZA.events.trigger("userlocationfound");
			},
			function(error) {
				
				options.enableHighAccuracy = false;
				
				navigator.geolocation.getCurrentPosition(function(position) {
					if(callback)
						callback(position);
					
					WPGMZA.events.trigger("userlocationfound");
				},
				function(error) {
					console.warn(error.code, error.message);
				},
				options);
				
			},
			options);
		},
		
		/**
		 * @function runCatchableTask
		 * @summary Runs a catchable task and displays a friendly error if the function throws an error
		 * @param {function} callback The function to run
		 * @param {HTMLElement} friendlyErrorContainer The container element to hold the error
		 * @static
		 * @return {void}
		 */
		runCatchableTask: function(callback, friendlyErrorContainer) {
			
			if(WPGMZA.isDeveloperMode())
				callback();
			else
				try{
					callback();
				}catch(e) {
					var friendlyError = new WPGMZA.FriendlyError(e);
					$(friendlyErrorContainer).html("");
					$(friendlyErrorContainer).append(friendlyError.element);
					$(friendlyErrorContainer).show();
				}
		},
		
		/**
		 * @function assertInstanceOf
		 * @summary
		 * This function is for checking inheritence has been setup correctly.
		 * For objects that have engine and Pro specific classes, it will automatically
		 * add the engine and pro prefix to the supplied string and if such an object
		 * exists it will test against that name rather than the un-prefix argument
		 * supplied.
		 *
		 * For example, if we are running the Pro addon with Google maps as the engine,
		 * if you supply Marker as the instance name the function will check to see
		 * if instance is an instance of GoogleProMarker
		 * @param {object} instance The object to check
		 * @param {string} instanceName The class name as a string which this object should be an instance of
		 * @static
		 * @return {void}
		 */
		assertInstanceOf: function(instance, instanceName) {
			var engine, fullInstanceName, assert;
			var pro = WPGMZA.isProVersion() ? "Pro" : "";
			
			switch(WPGMZA.settings.engine)
			{
				case "open-layers":
					engine = "OL";
					break;
				
				default:
					engine = "Google";
					break;
			}
			
			if(WPGMZA[engine + pro + instanceName])
				fullInstanceName = engine + pro + instanceName;
			else if(WPGMZA[pro + instanceName])
				fullInstanceName = pro + instanceName;
			else if(WPGMZA[engine + instanceName])
				fullInstanceName = engine + instanceName;
			else
				fullInstanceName = instanceName;
			
			assert = instance instanceof WPGMZA[fullInstanceName];
			
			if(!assert)
				throw new Error("Object must be an instance of " + fullInstanceName + " (did you call a constructor directly, rather than createInstance?)");
		},
		
		/**
		 * @function getMapByID
		 * @param {mixed} id The ID of the map to retrieve
		 * @static
		 * @return {object} The map object, or null if no such map exists
		 */
		getMapByID: function(id) {
			for(var i = 0; i < WPGMZA.maps.length; i++) {
				if(WPGMZA.maps[i].id == id)
					return WPGMZA.maps[i];
			}
			
			return null;
		},
		
		/**
		 * @function isGoogleAutocompleteSupported
		 * @summary Shorthand function to determine if the Places Autocomplete is available
		 * @static
		 * @return {boolean}
		 */
		isGoogleAutocompleteSupported: function() {
			return typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.places === 'object' && typeof google.maps.places.Autocomplete === 'function';
		},
		
		googleAPIStatus: window.wpgmza_google_api_status,
		
		isDeviceiOS: function() {
			
			return (
			
				(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
				
				||
				
				(!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform))
			
			);
			
		}
	};
	
	if(window.WPGMZA)
		window.WPGMZA = $.extend(window.WPGMZA, core);
	else
		window.WPGMZA = core;
	
	for(var key in WPGMZA_localized_data)
	{
		var value = WPGMZA_localized_data[key];
		WPGMZA[key] = value;
	}
	
	jQuery(function($) {
		
		// Combined script warning
		if($("script[src*='wp-google-maps.combined.js'], script[src*='wp-google-maps-pro.combined.js']").length)
			console.warn("Minified script is out of date, using combined script instead.");
		
		// Check for multiple jQuery versions
		var elements = $("script").filter(function() {
			return this.src.match(/(^|\/)jquery\.(min\.)?js(\?|$)/i);
		});

		if(elements.length > 1)
			console.warn("Multiple jQuery versions detected: ", elements);
		
		// Rest API
		WPGMZA.restAPI = WPGMZA.RestAPI.createInstance();
		
		// TODO: Move to map edit page JS
		$(document).on("click", ".wpgmza_edit_btn", function() {
			
			WPGMZA.animateScroll("#wpgmaps_tabs_markers");
			
		});
		
	});
	
	$(window).on("load", function(event) {
		
		// Geolocation warnings
		if(window.location.protocol != 'https:')
		{
			var warning = '<div class="notice notice-warning"><p>' + WPGMZA.localized_strings.unsecure_geolocation + "</p></div>";
			
			$(".wpgmza-geolocation-setting").each(function(index, el) {
				$(el).after( $(warning) );
			});
		}
		
	});
	
	
	
});