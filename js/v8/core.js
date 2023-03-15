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
		PAGE_STYLING:			"map-styling",
		PAGE_SUPPORT:			"map-support",

		PAGE_INSTALLER: 			"installer",
		
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
		
		// NB: Legacy
		loadingHTML: '<div class="wpgmza-preloader"><div class="wpgmza-loader">...</div></div>',
		
		// NB: Correct
		preloaderHTML: "<div class='wpgmza-preloader'><div></div><div></div><div></div><div></div></div>",
		
		getCurrentPage: function() {
			
			switch(WPGMZA.getQueryParamValue("page"))
			{
				case "wp-google-maps-menu":
					if(window.location.href.match(/action=edit/) && window.location.href.match(/map_id=\d+/))
						return WPGMZA.PAGE_MAP_EDIT;

					if(window.location.href.match(/action=installer/))
						return WPGMZA.PAGE_INSTALLER;
				
					return WPGMZA.PAGE_MAP_LIST;
					break;
					
				case 'wp-google-maps-menu-settings':
					return WPGMZA.PAGE_SETTINGS;
					break;
				
				case 'wp-google-maps-menu-styling':
					return WPGMZA.PAGE_STYLING;
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
			return (WPGMZA.settings.scroll_animation_offset || 0) + ($("#wpadminbar").height() || 0);
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
		
		hexOpacityToString: function(colour, opacity)
		{
			var arr = WPGMZA.hexOpacityToRGBA(colour, opacity);
			return "rgba(" + arr[0] + ", " + arr[1] + ", " + arr[2] + ", " + arr[3] + ")";
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
		openMediaDialog: function(callback, config) {
			var file_frame;
			
			if ( file_frame ) {
				file_frame.uploader.uploader.param( 'post_id', set_to_post_id );
				file_frame.open();
				return;
			}
			
			if(config){
				file_frame = wp.media.frames.file_frame = wp.media(config);
			} else {
				file_frame = wp.media.frames.file_frame = wp.media({
					title: 'Select a image to upload',
					button: {
						text: 'Use this image',
					},
					multiple: false	
				});
			}

			file_frame.on( 'select', function() {
				attachment = file_frame.state().get('selection').first().toJSON();
				callback(attachment.id, attachment.url, attachment);
			});

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
		
		capitalizeWords: function(string)
		{
			return (string + "").replace(/^(.)|\s+(.)/g, function(m) {
				return m.toUpperCase()
			});
		},
		
		pluralize: function(string)
		{
			return WPGMZA.singularize(string) + "s";
		},
		
		singularize: function(string)
		{
			return string.replace(/s$/, "");
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
			
			if(
				WPGMZA[engine + pro + instanceName]
				&&
				engine + instanceName != "OLFeature" // NB: Some classes, such as OLFeature, are static utility classes and cannot be inherited from, do not check the inheritence chain for these
				)
				fullInstanceName = engine + pro + instanceName;
			else if(WPGMZA[pro + instanceName])
				fullInstanceName = pro + instanceName;
			else if(
				WPGMZA[engine + instanceName] 
				&& 
				WPGMZA[engine + instanceName].prototype
				)
				fullInstanceName = engine + instanceName; 
			else
				fullInstanceName = instanceName;
			
			if(fullInstanceName == "OLFeature")
				return;	// Nothing inherits from OLFeature - it's purely a "static" utility class
			
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
			
			for(var i = 0; i < WPGMZA.maps.length; i++) {
				if(WPGMZA.maps[i].id == id)
					return WPGMZA.maps[i];
			}
			
			return null;
			
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
			if(!WPGMZA.InternalEngine.isLegacy()){
				/* Atlas Novus doesn't allow this */
				return false;	
			}
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
			
			return wpgmzaisFullScreen;
			
		},

		isNumeric: function(num) {
			return !isNaN(parseFloat(num)) && isFinite(num);
		},
		
		getQueryParamValue: function(name) {
			
			var regex = new RegExp(name + "=([^&#]*)");
			var m;
			
			if(!(m = window.location.href.match(regex)))
				return null;
			
			return decodeURIComponent(m[1]);
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
			
		},

		initMaps: function(){
			$(document.body).find(".wpgmza_map:not(.wpgmza-initialized)").each(function(index, el) {
				if(el.wpgmzaMap) {
					console.warn("Element missing class wpgmza-initialized but does have wpgmzaMap property. No new instance will be created");
					return;
				}
				try{
					el.wpgmzaMap = WPGMZA.Map.createInstance(el);
				} catch (ex){
					console.warn('Map initalization: ' + ex);
				}
			});
			
			WPGMZA.Map.nextInitTimeoutID = setTimeout(WPGMZA.initMaps, 3000);
		},

		initCapsules: function(){
			WPGMZA.capsuleModules = WPGMZA.CapsuleModules.createInstance(); 
		},

		onScroll: function(){
			$(".wpgmza_map").each(function(index, el) {
				var isInView = WPGMZA.isElementInView(el);
				if(!el.wpgmzaScrollIntoViewTriggerFlag){
					if(isInView){
						$(el).trigger("mapscrolledintoview.wpgmza");
						el.wpgmzaScrollIntoViewTriggerFlag = true;
					}
				} else if(!isInView){
					el.wpgmzaScrollIntoViewTriggerFlag = false;
				}
				
			});
		},

		initInstallerRedirect : function(url){
			$('.wpgmza-wrap').hide();
			
			window.location.href = url;
		},

		delayedReloader(){
			/* This script attempts to load the core, but waits for all modules using a try catch block
			 * 
			 * As of 9.0.18 (2023-03-14) this is an experimental reloader, it should work well enough, as it is triggered only by missing modules 
			 * and should not run in 'normal runs', but we've only confirmed this with a handful of delaying script systems
			*/ 
			setTimeout(() => {
				try {
					WPGMZA.restAPI	= WPGMZA.RestAPI.createInstance();
					if(WPGMZA.CloudAPI){
						WPGMZA.cloudAPI	= WPGMZA.CloudAPI.createInstance();
					}

					$(document.body).trigger('preinit.wpgmza');
					
					WPGMZA.initMaps();
					WPGMZA.onScroll();

					WPGMZA.initCapsules();

					$(document.body).trigger('postinit.wpgmza');
				} catch (ex) {
					/* The initial loading failed, this likely happened because the API cores were not loaded yet */
					WPGMZA.delayedReloader();
				}	
			}, 1000);
		}
	};
	
	var wpgmzaisFullScreen = false;


	// NB: Warn the user if the built in Array prototype has been extended. This will save debugging headaches where for ... in loops do bizarre things.
	for(var key in [])
	{
		console.warn("It appears that the built in JavaScript Array has been extended, this can create issues with for ... in loops, which may cause failure.");
		break;
	}
	
	if(window.WPGMZA)
		window.WPGMZA = $.extend(window.WPGMZA, core);
	else
		window.WPGMZA = core;

	/* Usercentrics base level integration */
	if(window.uc && window.uc.reloadOnOptIn){
		window.uc.reloadOnOptIn(
		    'S1pcEj_jZX'
		); 	

		window.uc.reloadOnOptOut(
			'S1pcEj_jZX'
		);
	}

	
	for(var key in WPGMZA_localized_data){
		var value = WPGMZA_localized_data[key];
		WPGMZA[key] = value;
	}

	/*
	 * De-Obscure Google API keys 
	 * 
	 * Google has started sending out emails about exposed keys, this is specifically due to our plugin localizing 
	 * the API keys in settings object, for use in autocomplete requests 
	 * 
	 * We will just reverse the original obscurity we added to sort this out
	 * 
	 * As of 9.0.18 (23-03-13) 
	 */
	var apiKeyIndexes = ['googleMapsApiKey', 'wpgmza_google_maps_api_key', 'google_maps_api_key'];
	for(let apiKeyIndex of apiKeyIndexes){
		if(WPGMZA.settings[apiKeyIndex]){
			/* We have an obscured key, this is to prevent false emails from being sent to site owner about 'exposed' keys */
			WPGMZA.settings[apiKeyIndex] = atob(WPGMZA.settings[apiKeyIndex]);
		}
	}
	
	// delete window.WPGMZA_localized_data;
	
	var wpgmzaisFullScreen = false;


	// NB: Warn the user if the built in Array prototype has been extended. This will save debugging headaches where for ... in loops do bizarre things.
	for(var key in [])
	{
		console.warn("It appears that the built in JavaScript Array has been extended, this can create issues with for ... in loops, which may cause failure.");
		break;
	}
	
	if(window.WPGMZA)
		window.WPGMZA = $.extend(window.WPGMZA, core);
	else
		window.WPGMZA = core;

	/* Usercentrics base level integration */
	if(window.uc && window.uc.reloadOnOptIn){
		window.uc.reloadOnOptIn(
		    'S1pcEj_jZX'
		); 	

		window.uc.reloadOnOptOut(
			'S1pcEj_jZX'
		);
	}

	/* Check if experimental google font option is enabled, and run it here to allow it to run early */
	try {
		if(WPGMZA && WPGMZA.settings && WPGMZA.settings.disable_google_fonts){
			/**
			 * WP Google Maps makes use of the Google Maps API for map serving. 
			 * 
			 * All credit to "coma" from this thread: https://stackoverflow.com/questions/25523806/google-maps-v3-prevent-api-from-loading-roboto-font
			 * - This was the initial inspiration for the solution implemented here 
			 * 
			 * Highly experiment option - This whole block should be moved to a dedicated module
			*/
			const _wpgmzaGoogleFontDisabler = {
				head : document.getElementsByTagName('head')[0]
			};

			if(_wpgmzaGoogleFontDisabler.head){
				/* Save the original function to recall it later */
				_wpgmzaGoogleFontDisabler.insertBefore = _wpgmzaGoogleFontDisabler.head.insertBefore;

				_wpgmzaGoogleFontDisabler.head.insertBefore = (nElem, rElem) => {
					if(nElem.href && nElem.href.indexOf('//fonts.googleapis.com/css') !== -1){
						const exclList = ['Roboto', 'Google'];
						for(let excl of exclList){
							if(nElem.href.indexOf('?family=' + excl) !== -1){
								/* Matched - Block the font */
								return;
							}
						}
					}

					_wpgmzaGoogleFontDisabler.insertBefore.call(_wpgmzaGoogleFontDisabler.head, nElem, rElem);
				};
			}
		}
	} catch (_wpgmzaDisableFontException){
		/* Silence */
	}

	
	for(var key in WPGMZA_localized_data){
		var value = WPGMZA_localized_data[key];
		WPGMZA[key] = value;
	}
	
	// delete window.WPGMZA_localized_data;
	
	WPGMZA.settings.useLegacyGlobals = true;
	
	$(document).on("fullscreenchange mozfullscreenchange webkitfullscreenchange", function() {
		wpgmzaisFullScreen = document.fullscreenElement ? true : false;

		/* Dispatch a global event */
		$(document.body).trigger("fullscreenchange.wpgmza");
	});

	$('body').on('click',"#wpgmzaCloseChat", function(e) {
		e.preventDefault();
		$.ajax(WPGMZA.ajaxurl, {
    		method: 'POST',
    		data: {
    			action: 'wpgmza_hide_chat',
    			nonce: WPGMZA_localized_data.ajaxnonce
    		}	    		
    	});
   		$('.wpgmza-chat-help').remove();
	});
	
	
	$(window).on("scroll", WPGMZA.onScroll);
	
	$(document.body).on("click", "button.wpgmza-api-consent", function(event) {
		Cookies.set("wpgmza-api-consent-given", true);
		window.location.reload();
	});
	
	$(document.body).on("keydown", function(event) {
		if(event.altKey)
			WPGMZA.altKeyDown = true;
	});
	
	$(document.body).on("keyup", function(event) {
		if(!event.altKey)
			WPGMZA.altKeyDown = false;
	});

	$(document.body).on('preinit.wpgmza', function(){
		$(window).trigger("ready.wpgmza");
		$(document.body).trigger('ready.body.wpgmza');
		
		// Combined script warning
		if($("script[src*='wp-google-maps.combined.js'], script[src*='wp-google-maps-pro.combined.js']").length){
			console.warn("Minified script is out of date, using combined script instead.");
		}
		
		// Check for multiple jQuery versions
		var elements = $("script[src]").filter(function() {
			return this.src.match(/(^|\/)jquery\.(min\.)?js(\?|$)/i);
		});

		if(elements.length > 1){
			console.warn("Multiple jQuery versions detected: ", elements);
		}

		// Array incorrectly extended warning
		var test = [];
		for(var key in test) {
			console.warn("The Array object has been extended incorrectly by your theme or another plugin. This can cause issues with functionality.");
			break;
		}
		
		// Geolocation warnings
		if(window.location.protocol != 'https:'){
			var warning = '<div class="' + (WPGMZA.InternalEngine.isLegacy() ? '' : 'wpgmza-shadow wpgmza-card wpgmza-pos-relative ') + 'notice notice-warning"><p>' + WPGMZA.localized_strings.unsecure_geolocation + "</p></div>";
			
			$(".wpgmza-geolocation-setting").first().after( $(warning) );
		}

		if(WPGMZA.googleAPIStatus && WPGMZA.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN") {
			if(jQuery('.wpgmza-gdpr-compliance').length <= 0){
				/*$("#wpgmza_map, .wpgmza_map").each(function(index, el) {
					$(el).append($(WPGMZA.api_consent_html));
					$(el).css({height: "auto"});
				});*/

				$('.wpgmza-inner-stack').hide();
				
				$("button.wpgmza-api-consent").on("click", function(event) {
					Cookies.set("wpgmza-api-consent-given", true);
					window.location.reload();
				});
			}
			
			return;
		}
	});

	/**
	 * We use to use the win-the-race approach with set timeouts
	 * 
	 * This caused immense issues with older versions of WP
	 * 
	 * Instead, we call an anon-func, which queues on the ready call, this controls the queue without the need for timeouts
	 * 
	 * While also maintaining the stack order, and the ability for consent plugins to stop ready calls early
	 * 
	 * --
	 * 
	 * In some cases, delayed script loading will fail in this loop, this happens because the core modules are not prepared/loaded yet
	 * we really should overcome this limitation, to allow more versatile loading approaches
	 * 
	 * This is a little tricky due to the way that we call this function (anon) -> But we believe we have a better approach to this 
	*/
	(function($){
		$(function(){
			try {
				WPGMZA.restAPI	= WPGMZA.RestAPI.createInstance();
				if(WPGMZA.CloudAPI){
					WPGMZA.cloudAPI	= WPGMZA.CloudAPI.createInstance();
				}

				$(document.body).trigger('preinit.wpgmza');
				
				WPGMZA.initMaps();
				WPGMZA.onScroll();

				WPGMZA.initCapsules();

				$(document.body).trigger('postinit.wpgmza');
			} catch (ex) {
				/* The initial loading failed, this likely happened because the API cores were not loaded yet */
				if(WPGMZA && typeof WPGMZA.delayedReloader === 'function'){
					WPGMZA.delayedReloader();
				}
			}	
		});
	})($);
	
});