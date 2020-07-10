/**
 * @module WPGMZA
 * @summary This is the core Javascript module. Some code exists in ../core.js, the functionality there will slowly be handed over to this module.
 */
jQuery(function($) {
	
	var core = {
		MARKER_PULL_DATABASE:	"0",
		MARKER_PULL_XML:		"1",
		
		PAGE_MAP_LIST: 			"map-list",
		PAGE_MAP_EDIT:			"map-edit",
		PAGE_SETTINGS:			"map-settings",
		PAGE_SUPPORT:			"map-support",
		
		PAGE_CATEGORIES:		"categories",
		PAGE_ADVANCED:			"advanced",
		PAGE_CUSTOM_FIELDS:		"custom-fields",
		
		/**
		 * Indexed array of map instances
		 * @constant {array} maps
		 * @static
		 */
		maps: [],
		
		/**
		 * Global EventDispatcher used to listen for global plugin events
		 * @constant {EventDispatcher} events
		 * @static
		 */
		events: null,
		
		/**
		 * Settings, passed from the server
		 * @constant {object} settings
		 * @static
		 */
		settings: null,
		
		/**
		 * Instance of the restAPI. Not to be confused with WPGMZA.RestAPI, which is the instances constructor
		 * @constant {RestAPI} restAPI
		 * @static
		 */
		restAPI: null,
		
		/**
		 * Key and value pairs of localized strings passed from the server
		 * @constant {object} localized_strings
		 * @static
		 */
		localized_strings: null,
		
		loadingHTML: '<div class="wpgmza-preloader"><div></div><div></div><div></div><div></div></div>',
		
		getCurrentPage: function() {
			
			switch(WPGMZA.getQueryParamValue("page"))
			{
				case "wp-google-maps-menu":
					if(window.location.href.match(/action=edit/) && window.location.href.match(/map_id=\d+/))
						return WPGMZA.PAGE_MAP_EDIT;
				
					return WPGMZA.PAGE_MAP_LIST;
					break;
					
				case 'wp-google-maps-menu-settings':
					return WPGMZA.PAGE_SETTINGS;
					break;
					
				case 'wp-google-maps-menu-support':
					return WPGMZA.PAGE_SUPPORT;
					break;
					
				case 'wp-google-maps-menu-categories':
					return WPGMZA.PAGE_CATEGORIES;
					break;
					
				case 'wp-google-maps-menu-advanced':
					return WPGMZA.PAGE_ADVANCED;
					break;
					
				case 'wp-google-maps-menu-custom-fields':
					return WPGMZA.PAGE_CUSTOM_FIELDS;
					break;
					
				default:
					return null;
					break;
			}
			
		},
		
		/**
		 * Override this method to add a scroll offset when using animated scroll, useful for sites with fixed headers.
		 * @method getScrollAnimationOffset
		 * @static
		 * @return {number} The scroll offset
		 */
		getScrollAnimationOffset: function() {
			return (WPGMZA.settings.scroll_animation_offset || 0) + $("#wpadminbar").height();
		},
		
		getScrollAnimationDuration: function() {
			if(WPGMZA.settings.scroll_animation_milliseconds)
				return WPGMZA.settings.scroll_animation_milliseconds;
			else
				return 500;
		},
		
		/**
		 * Animated scroll, accounts for animation settings and fixed header height
		 * @method animateScroll
		 * @static
		 * @param {HTMLElement} element The element to scroll to
		 * @param {number} [milliseconds] The time in milliseconds to scroll over. Defaults to 500 if no value is specified.
		 * @return void
		 */
		animateScroll: function(element, milliseconds) {
			
			var offset = WPGMZA.getScrollAnimationOffset();
			
			if(!milliseconds)
				milliseconds = WPGMZA.getScrollAnimationDuration();
			
			$("html, body").animate({
				scrollTop: $(element).offset().top - offset
			}, milliseconds);
			
		},
		
		extend: function(child, parent) {
			
			var constructor = child;
			
			child.prototype = Object.create(parent.prototype);
			child.prototype.constructor = constructor;
			
		},
		
		/**
		 * Generates and returns a GUID
		 * @method guid
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
		 * Takes a hex string and opacity value and converts it to Openlayers RGBA format
		 * @method hexOpacityToRGBA
		 * @static
		 * @param {string} colour The hex color string
		 * @param {number} opacity The opacity from 0.0 - 1.0
		 * @return {array} RGBA array where color components are 0 - 255 and opacity is 0.0 - 1.0
		 */
		hexOpacityToRGBA: function(colour, opacity)
		{
			var hex = parseInt(colour.replace(/^#/, ""), 16);
			return [
				(hex & 0xFF0000) >> 16,
				(hex & 0xFF00) >> 8,
				hex & 0xFF,
				parseFloat(opacity)
			];
		},
		
		/**
		 * Takes a hex color string and converts it to an RGBA object.
		 * @method hexToRgba
		 * @static
		 * @param {string} hex The hex color string
		 * @return {object} Object with r, g, b and a properties, or 0 if the input is invalid.
		 */
		hexToRgba: function(hex) {
			var c;
			if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
				c= hex.substring(1).split('');
				if(c.length== 3){
					c= [c[0], c[0], c[1], c[1], c[2], c[2]];
				}
				c= '0x'+c.join('');
				
				return {
					r: (c>>16)&255,
					g: (c>>8)&255,
					b: c&255,
					a: 1
				};
			}
			
			return 0;
			
			//throw new Error('Bad Hex');
		},
		
		/**
		 * Takes an object with r, g, b and a properties and returns a CSS rgba color string
		 * @method rgbaToString
		 * @static
		 * @param {string} rgba The input object
		 * @return {string} The CSS rgba color string
		 */
		rgbaToString: function(rgba) {
			return "rgba(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + rgba.a + ")";
		},
		
		/**
		 * A regular expression that matches a latitude / longitude coordinate pair
		 * @constant {RegExp} latLngRegexp
		 * @static
		 */
		latLngRegexp: /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/,
		
		/**
		 * Utility function returns true is string is a latitude and longitude
		 * @method isLatLngString
		 * @deprecated Moved to WPGMZA.LatLng.isLatLngString
		 * @static
		 * @param str {string} The string to attempt to parse as coordinates
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
			
			return new WPGMZA.LatLng({
				lat: parseFloat(m[1]),
				lng: parseFloat(m[3])
			});
		},
		
		/**
		 * Utility function returns a latLng literal given a valid latLng string
		 * @method stringToLatLng
		 * @static
		 * @param str {string} The string to attempt to parse as coordinates
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
		 * Utility function returns a latLng literal given a valid latLng string
		 * @method stringToLatLng
		 * @static
		 * @param str {string} The string to attempt to parse as coordinates
		 * @return {object} LatLng literal
		 */
		isHexColorString: function(str)
		{
			if(typeof str != "string")
				return false;
			
			return (str.match(/#[0-9A-F]{6}/i) ? true : false);
		},
		
		/**
		 * Cache of image dimensions by URL, for internal use only
		 * @var imageDimensionsCache
		 * @inner
		 * @see WPGMZA.getImageDimensions
		 */
		imageDimensionsCache: {},
		
		/**
		 * Utility function to get the dimensions of an image, caches results for best performance
		 * @method getImageDimensions
		 * @static
		 * @param src {string} Image source URL
		 * @param callback {function} Callback to recieve image dimensions
		 * @return {void}
		 */
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
					width: img.width,
					height: img.height
				};
				WPGMZA.imageDimensionsCache[src] = result;
				callback(result);
			};
			img.src = src;
		},
		
		decodeEntities: function(input)
		{
			return input.replace(/&(nbsp|amp|quot|lt|gt);/g, function(m, e) {
				return m[e];
			}).replace(/&#(\d+);/gi, function(m, e) {
				return String.fromCharCode(parseInt(e, 10));
			});
		},
		
		/**
		 * Returns true if developer mode is set or if developer mode cookie is set
		 * @method isDeveloperMode
		 * @static
		 * @return {boolean} True if developer mode is on
		 */
		isDeveloperMode: function()
		{
			return this.settings.developer_mode || (window.Cookies && window.Cookies.get("wpgmza-developer-mode"));
		},
		
		/**
		 * Returns true if the Pro add-on is active
		 * @method isProVersion
		 * @static
		 * @return {boolean} True if the Pro add-on is active
		 */
		isProVersion: function()
		{
			return (this._isProVersion == "1");
		},
		
		/**
		 * Opens the WP media dialog and returns the result to a callback
		 * @method openMediaDialog
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
		getCurrentPosition: function(callback, error, watch)
		{
			var trigger = "userlocationfound";
			var nativeFunction = "getCurrentPosition";
			
			if(WPGMZA.userLocationDenied)
			{
				// NB: This code can also be reached on non https:// sites, the error code is the same
				if(error)
					error({code: 1, message: "Location unavailable"});
				
				return; // NB: The user has declined to share location. Only ask once per session.
			}
			
			if(watch)
			{
				trigger = "userlocationupdated";
				nativeFunction = "watchPosition";
				
				// Call again immediatly to get current position, watchPosition won't fire until the user moves
				/*setTimeout(function() {
					WPGMZA.getCurrentPosition(callback, false);
				}, 0);*/
			}
			
			if(!navigator.geolocation)
			{
				console.warn("No geolocation available on this device");
				return;
			}
			
			var options = {
				enableHighAccuracy: true
			};
			
			if(!navigator.geolocation[nativeFunction])
			{
				console.warn(nativeFunction + " is not available");
				return;
			}
			
			navigator.geolocation[nativeFunction](function(position) {
				if(callback)
					callback(position);
				
				WPGMZA.events.trigger("userlocationfound");
			},
			function(err) {
				
				options.enableHighAccuracy = false;
				
				navigator.geolocation[nativeFunction](function(position) {
					if(callback)
						callback(position);
					
					WPGMZA.events.trigger("userlocationfound");
				},
				function(err) {
					console.warn(err.code, err.message);
					
					if(err.code == 1)
						WPGMZA.userLocationDenied = true;
					
					if(error)
						error(err);
				},
				options);
				
			},
			options);
		},
		
		watchPosition: function(callback, error)
		{
			return WPGMZA.getCurrentPosition(callback, error, true);
		},
		
		/**
		 * Runs a catchable task and displays a friendly error if the function throws an error
		 * @method runCatchableTask
		 * @static
		 * @param {function} callback The function to run
		 * @param {HTMLElement} friendlyErrorContainer The container element to hold the error
		 * @return {void}
		 * @see WPGMZA.FriendlyError
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
		 * This function is for checking inheritence has been setup correctly. For objects that have engine and Pro specific classes, it will automatically add the engine and pro prefix to the supplied string and if such an object exists it will test against that name rather than the un-prefix argument supplied.
		 *
		 * For example, if we are running the Pro addon with Google maps as the engine, if you supply Marker as the instance name the function will check to see if instance is an instance of GoogleProMarker
		 * @method assertInstanceOf
		 * @static
		 * @param {object} instance The object to check
		 * @param {string} instanceName The class name as a string which this object should be an instance of
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
		 * @method getMapByID
		 * @static
		 * @param {mixed} id The ID of the map to retrieve
		 * @return {object} The map object, or null if no such map exists
		 */
		getMapByID: function(id) {
			
			// Workaround for map ID member not set correctly
			
			if(WPGMZA.isProVersion() && !(MYMAP.map instanceof WPGMZA.Map))
				return MYMAP[id].map;
			
			return MYMAP.map;
			
			/*for(var i = 0; i < WPGMZA.maps.length; i++) {
				if(WPGMZA.maps[i].id == id)
					return WPGMZA.maps[i];
			}
			
			return null;*/
		},
		
		/**
		 * Shorthand function to determine if the Places Autocomplete is available
		 * @method isGoogleAutocompleteSupported
		 * @static
		 * @return {boolean} True if the places autocomplete is available
		 */
		isGoogleAutocompleteSupported: function() {
			
			if(!window.google)
				return false;
			
			if(!google.maps)
				return false;
			
			if(!google.maps.places)
				return false;
			
			if(!google.maps.places.Autocomplete)
				return false;
			
			if(WPGMZA.CloudAPI && WPGMZA.CloudAPI.isBeingUsed)
				return false;
			
			return true;
			
		},
		
		/**
		 * The Google API status script enqueue, as reported by the server
		 * @constant
		 * @static
		 */
		googleAPIStatus: window.wpgmza_google_api_status,
		
		/**
		 * Makes an educated guess as to whether the browser is Safari
		 * @method isSafari
		 * @static
		 * @return {boolean} True if it's likely the browser is Safari
		 */
		isSafari: function() {
			
			var ua = navigator.userAgent.toLowerCase();
			return (ua.match(/safari/i) && !ua.match(/chrome/i));
			
		},
		
		/**
		 * Makes an educated guess as to whether the browser is running on a touch device
		 * @method isTouchDevice
		 * @static
		 * @return {boolean} True if it's likely the browser is running on a touch device
		 */
		isTouchDevice: function() {
			
			return ("ontouchstart" in window);
			
		},
		
		/**
		 * Makes an educated guess whether the browser is running on an iOS device
		 * @method isDeviceiOS
		 * @static
		 * @return {boolean} True if it's likely the browser is running on an iOS device
		 */
		isDeviceiOS: function() {
			
			return (
			
				(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
				
				||
				
				(!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform))
			
			);
			
		},
		
		/**
		 * This function prevents modern style components being used with new UI styles (8.0.0)
		 * @method isModernComponentStyleAllowed
		 * @static
		 * @return {boolean} True if modern or legacy style is selected, or no UI style is selected
		 */
		isModernComponentStyleAllowed: function() {
			
			return (!WPGMZA.settings.user_interface_style || WPGMZA.settings.user_interface_style == "legacy" || WPGMZA.settings.user_interface_style == "modern");
			
		},
		
		isElementInView: function(element) {
			
			var pageTop = $(window).scrollTop();
			var pageBottom = pageTop + $(window).height();
			var elementTop = $(element).offset().top;
			var elementBottom = elementTop + $(element).height();

			if(elementTop < pageTop && elementBottom > pageBottom)
				return true;
			
			if(elementTop >= pageTop && elementTop <= pageBottom)
				return true;
			
			if(elementBottom >= pageTop && elementBottom <= pageBottom)
				return true;
			
			return false;
			
		},
		
		isFullScreen: function() {
			
			return isFullScreen;
			
		},
		
		getQueryParamValue: function(name) {
			
			var regex = new RegExp(name + "=([^&#]*)");
			var m;
			
			if(!(m = window.location.href.match(regex)))
				return null;
			
			return m[1];	
		},

		notification: function(text, time) {
			
			switch(arguments.length)
			{
				case 0:
					text = "";
					time = 4000;
					break;
					
				case 1:
					time = 4000;
					break;
			}
			
			var html = '<div class="wpgmza-popup-notification">' + text + '</div>';
			jQuery('body').append(html);
			setTimeout(function(){
				jQuery('body').find('.wpgmza-popup-notification').remove();
			}, time);
			
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
	
	WPGMZA.settings.useLegacyGlobals = true;
	
	jQuery(function($) {
		
		$(window).trigger("ready.wpgmza");
		
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
		WPGMZA.restAPI	= WPGMZA.RestAPI.createInstance();
		
		if(WPGMZA.CloudAPI)
			WPGMZA.cloudAPI	= WPGMZA.CloudAPI.createInstance();
		
		// TODO: Move to map edit page JS
		$(document).on("click", ".wpgmza_edit_btn", function() {
			
			WPGMZA.animateScroll("#wpgmaps_tabs_markers");
			
		});
		
	});
	
	var isFullScreen = false;
	
	$(document).on("fullscreenchange", function() {
		
		isFullScreen = document.fullscreenElement ? true : false;
		
	});
	
	$(window).on("load", function(event) {
		
		// Array incorrectly extended warning
		var test = [];
		for(var key in test) {
			console.warn("The Array object has been extended incorrectly by your theme or another plugin. This can cause issues with functionality.");
			break;
		}
		
		// Geolocation warnings
		if(window.location.protocol != 'https:')
		{
			var warning = '<div class="notice notice-warning"><p>' + WPGMZA.localized_strings.unsecure_geolocation + "</p></div>";
			
			$(".wpgmza-geolocation-setting").each(function(index, el) {
				$(el).after( $(warning) );
			});
		}
		
	});
	
	function onScroll(event)
	{
		
		// Test if map is scrolled into view
		$(".wpgmza_map").each(function(index, el) {
			
			var isInView = WPGMZA.isElementInView(el);
			
			if(!el.wpgmzaScrollIntoViewTriggerFlag)
			{
				if(isInView)
				{
					$(el).trigger("mapscrolledintoview.wpgmza");
					el.wpgmzaScrollIntoViewTriggerFlag = true;
				}
			}
			else if(!isInView)
				el.wpgmzaScrollIntoViewTriggerFlag = false;
			
		});
		
	}
	
	$(window).on("scroll", onScroll);
	$(window).on("load", onScroll);
	
	if(WPGMZA.refreshOnLoad)
		window.location.reload();
	
});