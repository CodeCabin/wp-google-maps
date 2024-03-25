
// js/v8/core.js
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

// js/v8/compatibility.js
/**
 * @namespace WPGMZA
 * @module Compatibility
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Reverse compatibility module
	 *
	 * @class WPGMZA.Compatibility
	 * @constructor WPGMZA.Compatibility
	 * @memberof WPGMZA
	 */
	WPGMZA.Compatibility = function()
	{
		this.preventDocumentWriteGoogleMapsAPI();
	}
	
	/**
	 * Prevents document.write from outputting Google Maps API script tag
	 *
	 * @method
	 * @memberof WPGMZA.Compatibility
	 */
	WPGMZA.Compatibility.prototype.preventDocumentWriteGoogleMapsAPI = function()
	{
		var old = document.write;
		
		document.write = function(content)
		{
			if(content.match && content.match(/maps\.google/))
				return;
			
			old.call(document, content);
		}
	}
	
	WPGMZA.compatiblityModule = new WPGMZA.Compatibility();
	
});

// js/v8/css-escape.js
/**
 * Polyfill for CSS.escape, with thanks to @mathias
 * @namespace WPGMZA
 * @module CSS
 * @requires WPGMZA
 */

/*! https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
;(function(root, factory) {
	// https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports == 'object') {
		// For Node.js.
		module.exports = factory(root);
	} else if (typeof define == 'function' && define.amd) {
		// For AMD. Register as an anonymous module.
		define([], factory.bind(root, root));
	} else {
		// For browser globals (not exposing the function separately).
		factory(root);
	}
}(typeof global != 'undefined' ? global : this, function(root) {

	if (root.CSS && root.CSS.escape) {
		return root.CSS.escape;
	}

	// https://drafts.csswg.org/cssom/#serialize-an-identifier
	var cssEscape = function(value) {
		if (arguments.length == 0) {
			throw new TypeError('`CSS.escape` requires an argument.');
		}
		var string = String(value);
		var length = string.length;
		var index = -1;
		var codeUnit;
		var result = '';
		var firstCodeUnit = string.charCodeAt(0);
		while (++index < length) {
			codeUnit = string.charCodeAt(index);
			// Note: there’s no need to special-case astral symbols, surrogate
			// pairs, or lone surrogates.

			// If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
			// (U+FFFD).
			if (codeUnit == 0x0000) {
				result += '\uFFFD';
				continue;
			}

			if (
				// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
				// U+007F, […]
				(codeUnit >= 0x0001 && codeUnit <= 0x001F) || codeUnit == 0x007F ||
				// If the character is the first character and is in the range [0-9]
				// (U+0030 to U+0039), […]
				(index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
				// If the character is the second character and is in the range [0-9]
				// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
				(
					index == 1 &&
					codeUnit >= 0x0030 && codeUnit <= 0x0039 &&
					firstCodeUnit == 0x002D
				)
			) {
				// https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
				result += '\\' + codeUnit.toString(16) + ' ';
				continue;
			}

			if (
				// If the character is the first character and is a `-` (U+002D), and
				// there is no second character, […]
				index == 0 &&
				length == 1 &&
				codeUnit == 0x002D
			) {
				result += '\\' + string.charAt(index);
				continue;
			}

			// If the character is not handled by one of the above rules and is
			// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
			// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
			// U+005A), or [a-z] (U+0061 to U+007A), […]
			if (
				codeUnit >= 0x0080 ||
				codeUnit == 0x002D ||
				codeUnit == 0x005F ||
				codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
				codeUnit >= 0x0041 && codeUnit <= 0x005A ||
				codeUnit >= 0x0061 && codeUnit <= 0x007A
			) {
				// the character itself
				result += string.charAt(index);
				continue;
			}

			// Otherwise, the escaped character.
			// https://drafts.csswg.org/cssom/#escape-a-character
			result += '\\' + string.charAt(index);

		}
		return result;
	};

	if (!root.CSS) {
		root.CSS = {};
	}

	root.CSS.escape = cssEscape;
	return cssEscape;

}));

// js/v8/distance.js
/**
 * Collection of distance utility functions and constants
 * @namespace WPGMZA
 * @module Distance
 * @requires WPGMZA
 */
jQuery(function($) {
	
	var earthRadiusMeters = 6371;
	var piTimes360 = Math.PI / 360;
	
	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	};
	
	/**
	 * @class WPGMZA.Distance
	 * @memberof WPGMZA
	 * @deprecated Will be dropped wiht the introduction of global distance units
	 */
	WPGMZA.Distance = {
		
		/**
		 * Miles, represented as true by legacy versions of the plugin
		 * @constant MILES
		 * @static
		 * @memberof WPGMZA.Distance
		 */
		MILES:					true,
		
		/**
		 * Kilometers, represented as false by legacy versions of the plugin
		 * @constant KILOMETERS
		 * @static
		 * @memberof WPGMZA.Distance
		 */
		KILOMETERS:				false,
		
		/**
		 * Miles per kilometer
		 * @constant MILES_PER_KILOMETER
		 * @static
		 * @memberof WPGMZA.Distance
		 */
		MILES_PER_KILOMETER:	0.621371,
		
		/**
		 * Kilometers per mile
		 * @constant KILOMETERS_PER_MILE
		 * @static
		 */
		KILOMETERS_PER_MILE:	1.60934,
		
		// TODO: Implement WPGMZA.settings.distance_units
		
		/**
		 * Converts a UI distance (eg from a form control) to meters,
		 * accounting for the global units setting
		 * @method uiToMeters
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} uiDistance The distance from the UI, could be in miles or kilometers depending on settings
		 * @return {number} The input distance in meters
		 */
		uiToMeters: function(uiDistance)
		{
			return parseFloat(uiDistance) / (WPGMZA.settings.distance_units == WPGMZA.Distance.MILES ? WPGMZA.Distance.MILES_PER_KILOMETER : 1) * 1000;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to kilometers,
		 * accounting for the global units setting
		 * @method uiToKilometers
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} uiDistance The distance from the UI, could be in miles or kilometers depending on settings
		 * @return {number} The input distance in kilometers
		 */
		uiToKilometers: function(uiDistance)
		{
			return WPGMZA.Distance.uiToMeters(uiDistance) * 0.001;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to miles, according to settings
		 * @method uiToMiles
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} uiDistance The distance from the UI, could be in miles or kilometers depending on settings
		 * @return {number} The input distance 
		 */
		uiToMiles: function(uiDistance)
		{
			return WPGMZA.Distance.uiToKilometers(uiDistance) * WPGMZA.Distance.MILES_PER_KILOMETER;
		},
		
		/**
		 * Converts kilometers to a UI distance, either the same value, or converted to miles depending on settings.
		 * @method kilometersToUI
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} km The input distance in kilometers
		 * @param {number} The UI distance in the units specified by settings
		 */
		kilometersToUI: function(km)
		{
			if(WPGMZA.settings.distance_units == WPGMZA.Distance.MILES)
				return km * WPGMZA.Distance.MILES_PER_KILOMETER;
			return km;
		},
		
		/**
		 * Returns the distance, in kilometers, between two LatLng's
		 * @method between
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {WPGMZA.Latlng} The first point
		 * @param {WPGMZA.Latlng} The second point
		 * @return {number} The distance, in kilometers
		 */
		between: function(a, b)
		{
			if(!(a instanceof WPGMZA.LatLng) && !("lat" in a && "lng" in a))
				throw new Error("First argument must be an instance of WPGMZA.LatLng or a literal");
			
			if(!(b instanceof WPGMZA.LatLng) && !("lat" in b && "lng" in b))
				throw new Error("Second argument must be an instance of WPGMZA.LatLng or a literal");
			
			if(a === b)
				return 0.0;
			
			var lat1 = a.lat;
			var lon1 = a.lng;
			var lat2 = b.lat;
			var lon2 = b.lng;
			
			var dLat = deg2rad(lat2 - lat1);
			var dLon = deg2rad(lon2 - lon1); 
			
			var a = 
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
				Math.sin(dLon/2) * Math.sin(dLon/2); 
				
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = earthRadiusMeters * c; // Distance in km
			
			return d;
		}
		
	};
	
});

// js/v8/elias-fano.js
/**
 * @namespace WPGMZA
 * @module EliasFano
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.EliasFano = function()
	{
		if(!WPGMZA.EliasFano.isSupported)
			throw new Error("Elias Fano encoding is not supported on browsers without Uint8Array");
		
		if(!WPGMZA.EliasFano.decodingTablesInitialised)
			WPGMZA.EliasFano.createDecodingTable();
	}
	
	WPGMZA.EliasFano.isSupported = ("Uint8Array" in window);
	
	WPGMZA.EliasFano.decodingTableHighBits			= [];
	WPGMZA.EliasFano.decodingTableDocIDNumber		= null;
	WPGMZA.EliasFano.decodingTableHighBitsCarryover = null;
	
	WPGMZA.EliasFano.createDecodingTable = function()
	{
		WPGMZA.EliasFano.decodingTableDocIDNumber = new Uint8Array(256);
		WPGMZA.EliasFano.decodingTableHighBitsCarryover = new Uint8Array(256);
		
		var decodingTableHighBits = WPGMZA.EliasFano.decodingTableHighBits;
		var decodingTableDocIDNumber = WPGMZA.EliasFano.decodingTableDocIDNumber;
		var decodingTableHighBitsCarryover = WPGMZA.EliasFano.decodingTableHighBitsCarryover;
		
		for(var i = 0; i < 256; i++)
		{
			var zeroCount = 0;
			
			decodingTableHighBits[i] = [];
			
			for(var j = 7; j >= 0; j--)
			{
				if((i & (1 << j)) > 0)
				{
					decodingTableHighBits[i][decodingTableDocIDNumber[i]] = zeroCount;
					
					decodingTableDocIDNumber[i]++;
					zeroCount = 0;
				}
				else
					zeroCount = (zeroCount + 1) % 0xFF;
			}
			
			decodingTableHighBitsCarryover[i] = zeroCount;
		}
		
		WPGMZA.EliasFano.decodingTablesInitialised = true;
	}
	
	WPGMZA.EliasFano.prototype.encode = function(list)
	{
		var lastDocID		= 0,
			buffer1 		= 0,
			bufferLength1 	= 0,
			buffer2 		= 0,
			bufferLength2 	= 0;
		
		if(list.length == 0)
			return result;
		
		function toByte(n)
		{
			return n & 0xFF;
		}
		
		var compressedBufferPointer1 = 0;
		var compressedBufferPointer2 = 0;
		var largestBlockID = list[list.length - 1];
		var averageDelta = largestBlockID / list.length;
		var averageDeltaLog = Math.log2(averageDelta);
		var lowBitsLength = Math.floor(averageDeltaLog);
		var lowBitsMask = (1 << lowBitsLength) - 1;
		var prev = null;
		
		var maxCompressedSize = Math.floor(
			(
				2 + Math.ceil(
					Math.log2(averageDelta)
				)
			) * list.length / 8
		) + 6;
		
		var compressedBuffer = new Uint8Array(maxCompressedSize);
		
		if(lowBitsLength < 0)
			lowBitsLength = 0;
		
		compressedBufferPointer2 = Math.floor(lowBitsLength * list.length / 8 + 6);
		
		compressedBuffer[compressedBufferPointer1++] = toByte( list.length );
		compressedBuffer[compressedBufferPointer1++] = toByte( list.length >> 8 );
		compressedBuffer[compressedBufferPointer1++] = toByte( list.length >> 16 );
		compressedBuffer[compressedBufferPointer1++] = toByte( list.length >> 24 );
		
		compressedBuffer[compressedBufferPointer1++] = toByte( lowBitsLength );
		
		list.forEach(function(docID) {
			
			var docIDDelta = (docID - lastDocID - 1);
			
			if(!WPGMZA.isNumeric(docID))
				throw new Error("Value is not numeric");
			
			// NB: Force docID to an integer in case it's a string
			docID = parseInt(docID);
			
			if(prev !== null && docID <= prev)
				throw new Error("Elias Fano encoding can only be used on a sorted, ascending list of unique integers.");
			
			prev = docID;
			
			buffer1 <<= lowBitsLength;
			buffer1 |= (docIDDelta & lowBitsMask);
			bufferLength1 += lowBitsLength;
			
			// Flush buffer 1
			while(bufferLength1 > 7)
			{
				bufferLength1 -= 8;
				compressedBuffer[compressedBufferPointer1++] = toByte( buffer1 >> bufferLength1 );
			}
			
			var unaryCodeLength = (docIDDelta >> lowBitsLength) + 1;
			
			buffer2 <<= unaryCodeLength;
			buffer2 |= 1;
			bufferLength2 += unaryCodeLength;
			
			// Flush buffer 2
			while(bufferLength2 > 7)
			{
				bufferLength2 -= 8;
				compressedBuffer[compressedBufferPointer2++] = toByte( buffer2 >> bufferLength2 );
			}
			
			lastDocID = docID;
		});
		
		if(bufferLength1 > 0)
			compressedBuffer[compressedBufferPointer1++] = toByte( buffer1 << (8 - bufferLength1) );
		
		if(bufferLength2 > 0)
			compressedBuffer[compressedBufferPointer2++] = toByte( buffer2 << (8 - bufferLength2) );
		
		var result = new Uint8Array(compressedBuffer);
		
		result.pointer = compressedBufferPointer2;
		
		return result;
	}
	
	WPGMZA.EliasFano.prototype.decode = function(compressedBuffer)
	{
		var resultPointer = 0;
		var list = [];
		
		//console.log("Decoding buffer from pointer " + compressedBuffer.pointer);
		//console.log(compressedBuffer);
		
		var decodingTableHighBits = WPGMZA.EliasFano.decodingTableHighBits;
		var decodingTableDocIDNumber = WPGMZA.EliasFano.decodingTableDocIDNumber;
		var decodingTableHighBitsCarryover = WPGMZA.EliasFano.decodingTableHighBitsCarryover;
		
		var lowBitsPointer = 0,
			lastDocID = 0,
			docID = 0,
			docIDNumber = 0;
		
		var listCount = compressedBuffer[lowBitsPointer++];
		
		//console.log("listCount is now " + listCount);
		
		listCount |= compressedBuffer[lowBitsPointer++] << 8;
		
		//console.log("listCount is now " + listCount);
		
		listCount |= compressedBuffer[lowBitsPointer++] << 16;
		
		//console.log("listCount is now " + listCount);
		
		listCount |= compressedBuffer[lowBitsPointer++] << 24;
		
		//console.log("Read list count " + listCount);
		
		var lowBitsLength = compressedBuffer[lowBitsPointer++];
		
		//console.log("lowBitsLength = " + lowBitsLength);
		
		var highBitsPointer,
			lowBitsCount = 0,
			lowBits = 0,
			cb = 1;
		
		for(
			highBitsPointer = Math.floor(lowBitsLength * listCount / 8 + 6);
			highBitsPointer < compressedBuffer.pointer;
			highBitsPointer++
			)
		{
			docID += decodingTableHighBitsCarryover[cb];
			cb = compressedBuffer[highBitsPointer];
			
			docIDNumber = decodingTableDocIDNumber[cb];
			
			for(var i = 0; i < docIDNumber; i++)
			{
				docID <<= lowBitsCount;
				docID |= lowBits & ((1 << lowBitsCount) - 1);
				
				while(lowBitsCount < lowBitsLength)
				{
					docID <<= 8;
					
					lowBits = compressedBuffer[lowBitsPointer++];
					docID |= lowBits;
					lowBitsCount += 8;
				}
				
				lowBitsCount -= lowBitsLength;
				docID >>= lowBitsCount;
				
				docID += (decodingTableHighBits[cb][i] << lowBitsLength) + lastDocID + 1;
				
				list[resultPointer++] = docID;
				
				lastDocID = docID;
				docID = 0;
			}
		}
		
		return list;
	}
	
});

// js/v8/event-dispatcher.js
/**
 * @namespace WPGMZA
 * @module EventDispatcher
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Base class for any (non HTMLElement) object which dispatches or listens for events
	 * @class WPGMZA.EventDispatcher
	 * @constructor WPGMZA.EventDispatcher
	 * @memberof WPGMZA
	 */
	WPGMZA.EventDispatcher = function()
	{
		WPGMZA.assertInstanceOf(this, "EventDispatcher");
		
		this._listenersByType = {};
	}

	/**
	 * Adds an event listener on this object
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @param {string} type The event type, or multiple types separated by spaces
	 * @param {function} callback The callback to call when the event fires
	 * @param {object} [thisObject] The object to use as "this" when firing the callback
	 * @param {bool} [useCapture] If true, fires the callback on the capture phase, as opposed to bubble phase
	 */
	WPGMZA.EventDispatcher.prototype.addEventListener = function(type, listener, thisObject, useCapture)
	{
		var types = type.split(/\s+/);
		if(types.length > 1)
		{
			for(var i = 0; i < types.length; i++)
				this.addEventListener(types[i], listener, thisObject, useCapture);
			
			return;
		}
		
		if(!(listener instanceof Function))
			throw new Error("Listener must be a function");
	
		var target;
		if(!this._listenersByType.hasOwnProperty(type))
			target = this._listenersByType[type] = [];
		else
			target = this._listenersByType[type];
		
		var obj = {
			listener: listener,
			thisObject: (thisObject ? thisObject : this),
			useCapture: (useCapture ? true : false)
			};
			
		target.push(obj);
	}

	/**
	 * Alias for addEventListener
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @see WPGMZA.EventDispatcher#addEventListener
	 */
	WPGMZA.EventDispatcher.prototype.on = WPGMZA.EventDispatcher.prototype.addEventListener;

	/**
	 * Removes event listeners from this object
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @param {string} type The event type to remove listeners from
	 * @param {function} [listener] The function to remove. If omitted, all listeners will be removed
	 * @param {object} [thisObject] Use the parameter to remove listeners bound with the same thisObject
	 * @param {bool} [useCapture] Remove the capture phase event listener. Otherwise, the bubble phase event listener will be removed.
	 */
	WPGMZA.EventDispatcher.prototype.removeEventListener = function(type, listener, thisObject, useCapture)
	{
		var arr, index, obj;

		if(!(arr = this._listenersByType[type]))
			return;
			
		if(!thisObject)
			thisObject = this;
			
		useCapture = (useCapture ? true : false);
		
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
		
			if((arguments.length == 1 || obj.listener == listener) && obj.thisObject == thisObject && obj.useCapture == useCapture)
			{
				arr.splice(i, 1);
				return;
			}
		}
	}

	/**
	 * Alias for removeEventListener
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @see WPGMZA.EventDispatcher#removeEventListener
	 */
	WPGMZA.EventDispatcher.prototype.off = WPGMZA.EventDispatcher.prototype.removeEventListener;

	/**
	 * Test for listeners of type on this object
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @param {string} type The event type to test for
	 * @return {bool} True if this object has listeners bound for the specified type
	 */
	WPGMZA.EventDispatcher.prototype.hasEventListener = function(type)
	{
		return (_listenersByType[type] ? true : false);
	}

	/**
	 * Fires an event on this object
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @param {string|WPGMZA.Event} event Either the event type as a string, or an instance of WPGMZA.Event
	 */
	WPGMZA.EventDispatcher.prototype.dispatchEvent = function(event) {

		if(!(event instanceof WPGMZA.Event)) {
			if(typeof event == "string")
				event = new WPGMZA.Event(event);
			else
			{
				var src = event;
				event = new WPGMZA.Event();
				for(var name in src)
					event[name] = src[name];
			}
		}



		event.target = this;
			
		var path = [];
		for(var obj = this.parent; obj != null; obj = obj.parent)
			path.unshift(obj);
		
		event.phase = WPGMZA.Event.CAPTURING_PHASE;
		for(var i = 0; i < path.length && !event._cancelled; i++)
			path[i]._triggerListeners(event);
			
		if(event._cancelled)
			return;
			
		event.phase = WPGMZA.Event.AT_TARGET;
		this._triggerListeners(event);
			
		event.phase = WPGMZA.Event.BUBBLING_PHASE;
		for(i = path.length - 1; i >= 0 && !event._cancelled; i--)
			path[i]._triggerListeners(event);
		
		// Native DOM event
		var topMostElement = this.element;
		for(var obj = this.parent; obj != null; obj = obj.parent)
		{
			if(obj.element)
				topMostElement = obj.element;
		}
		
		if(topMostElement)
		{
			var customEvent = {};
			
			for(var key in event)
			{
				var value = event[key];
				
				if(key == "type")
					value += ".wpgmza";
				
				customEvent[key] = value;
			}
			$(topMostElement).trigger(customEvent);
		}
	}

	/**
	 * Alias for removeEventListener
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @see WPGMZA.EventDispatcher#removeEventListener
	 */
	WPGMZA.EventDispatcher.prototype.trigger = WPGMZA.EventDispatcher.prototype.dispatchEvent;

	/**
	 * Handles the logic of triggering listeners
	 * @method
	 * @memberof WPGMZA.EventDispatcher
	 * @inner
	 */
	WPGMZA.EventDispatcher.prototype._triggerListeners = function(event)
	{
		var arr, obj;
		
		if(!(arr = this._listenersByType[event.type]))
			return;
			
		for(var i = 0; i < arr.length; i++)
		{
			obj = arr[i];
			
			if(event.phase == WPGMZA.Event.CAPTURING_PHASE && !obj.useCapture)
				continue;
				
			obj.listener.call(arr[i].thisObject, event);
		}
	}

	WPGMZA.events = new WPGMZA.EventDispatcher();

});

// js/v8/address-input.js
/**
 * @namespace WPGMZA
 * @module AddressInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.AddressInput = function(element, map)
	{
		if(!(element instanceof HTMLInputElement))
			throw new Error("Element is not an instance of HTMLInputElement");
		
		this.element = element;
		
		var json;

		var options = {
			fields: ["name", "formatted_address"],
			types:	["geocode", "establishment"]
		};
		
		if(json = $(element).attr("data-autocomplete-options")){
			options = $.extend(options, JSON.parse(json));
		}
		
		if(map && map.settings.wpgmza_store_locator_restrict){
			options.country = map.settings.wpgmza_store_locator_restrict;
		}

		/* Store the options to the instance */
		this.options = options;

		/* Local reference to the address input */
		element._wpgmzaAddressInput = this;

		this.googleAutocompleteLoaded = false;

		if(WPGMZA.isGoogleAutocompleteSupported()) {
			/*
			 * This logic was entirely rebuilt as of 2022-06-28 to allow more complex handling of autocomplete modules
			 * 
			 * The admin marker address field will now default to our free cloud system first, but rollback to the google autocomplete if any issues are encountered during the usage
			 * 
			 * This is handled in the MapEditPage module, but we have plans to move this to it's own module at a later date. 
			 * 
			 * For now this is the simplest route to achieve the goal we set out to reach
			 */
			if (this.shouldAutoLoadGoogleAutocomplete()) {
				this.loadGoogleAutocomplete();
			}
		} else if(WPGMZA.CloudAPI && WPGMZA.CloudAPI.isBeingUsed){
			element.cloudAutoComplete = new WPGMZA.CloudAutocomplete(element, options);
		}
	}
	
	WPGMZA.extend(WPGMZA.AddressInput, WPGMZA.EventDispatcher);
	
	WPGMZA.AddressInput.createInstance = function(element, map) {
		return new WPGMZA.AddressInput(element, map);
	}

	WPGMZA.AddressInput.prototype.loadGoogleAutocomplete = function(){
		if(WPGMZA.settings){
			if(WPGMZA.settings.googleMapsApiKey || WPGMZA.settings.wpgmza_google_maps_api_key){
				/* Google Autocomplete can initialize normally, as the user has their own key */
				if(WPGMZA.isGoogleAutocompleteSupported()) {
					this.element.googleAutoComplete = new google.maps.places.Autocomplete(this.element, this.options);
				
					if(this.options.country){
						/* Apply country restrictios to the autocomplet, based on the settings */
						this.element.googleAutoComplete.setComponentRestrictions({country: this.options.country});
					}
				}

				this.googleAutocompleteLoaded = true;
			}
		}
		
	}

	WPGMZA.AddressInput.prototype.shouldAutoLoadGoogleAutocomplete = function(){
		/* 
		 * Checks if this field should automatically initialize Google Autocomplete
		 * 
		 * This is true for all address inputs, with the exception of the marker address admin input 
		*/
		if(this.element && this.element.id && this.element.id === 'wpgmza_add_address_map_editor'){
			return false;
		}
		return true;
	}
});

// js/v8/capsule-modules.js
/**
 * @namespace WPGMZA
 * @module CapsuleModules
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.CapsuleModules = function(){

		WPGMZA.EventDispatcher.call(this);
		
		this.proxies = {};
		this.capsules = [];
		this.prepareCapsules();
		this.flagCapsules();
	}

	WPGMZA.extend(WPGMZA.CapsuleModules, WPGMZA.EventDispatcher);

	WPGMZA.CapsuleModules.getConstructor = function(){
		if(WPGMZA.isProVersion())
			return WPGMZA.ProCapsuleModules;
		
		return WPGMZA.CapsuleModules;
	}


	WPGMZA.CapsuleModules.createInstance = function(){
		const constructor = WPGMZA.CapsuleModules.getConstructor();
		return new constructor();
	}

	WPGMZA.CapsuleModules.prototype.proxyMap = function(id, settings){
		if(!this.proxies[id]){
			this.proxies[id] = Object.create(this);
			
			this.proxies[id].id = id;

			this.proxies[id].markers = [];

			this.proxies[id].showPreloader = function(){};
			this.proxies[id].getMarkerByID = function(){ return {}; };

			this.proxies[id].markerFilter = WPGMZA.MarkerFilter.createInstance(this.proxies[id]);
		}

		if(settings){
			this.proxies[id].settings = settings;
		}

		return this.proxies[id];
	}

	WPGMZA.CapsuleModules.prototype.flagCapsules = function(){
		if(this.capsules){
			for(let i in this.capsules){
				if(this.capsules[i].element){
					$(this.capsules[i].element).addClass('wpgmza-capsule-module');
				}
			}
		}
	}

	WPGMZA.CapsuleModules.prototype.prepareCapsules = function(){
		this.registerStoreLocator();
	}

	WPGMZA.CapsuleModules.prototype.registerStoreLocator = function(){
		$('.wpgmza-store-locator').each((index, element) => {
			const mapId = $(element).data('map-id');
			const url = $(element).data('url');
			if(mapId && !WPGMZA.getMapByID(mapId)){
				if(url){
					const settings = $(element).data('map-settings');
					const mapProxy = this.proxyMap(mapId, settings);

					const capsule = {
						type : 'store_locator',
						element : element,
						instance : WPGMZA.StoreLocator.createInstance(mapProxy, element)
					};

					capsule.instance.isCapsule = true;
					capsule.instance.redirectUrl = url;

					this.capsules.push(capsule);
				} else {
					console.warn("WPGMZA: You seem to have added a stadalone store locator without a map page URL. Please add a URL to your shortcode [wpgmza_store_locator id=\"" + mapId + "\" url=\"{URL}\"] and try again");
				}
			}
		});
	}
});

// js/v8/color-input.js
/**
 * @namespace WPGMZA
 * @module ColorInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.ColorInput = function(element, options){
        if(!(element instanceof HTMLInputElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.dataAttributes = this.element.data();
        this.type = element.type;
        this.value = element.value;

        this.options = {
            format : 'hex',
            anchor : 'left',
            container : false,
            autoClose : true,
            autoOpen : false,
            supportAlpha : true,
            supportPalette : true,
            wheelBorderWidth : 10,
            wheelPadding : 6,
            wheelBorderColor: "rgb(255,255,255)"
        };

        this.parseOptions(options);

        this.state = {
            initialized : false,
            sliderInvert : false,
            lockSlide : false,
            lockPicker : false,
            open : false,
            mouse : {
                down : false
            }
        }

        this.color = {
            h : 0,
            s : 0,
            l : 100,
            a : 1
        };

        this.wrap();
        this.renderControls();

        this.parseColor(this.value);
    }

    WPGMZA.extend(WPGMZA.ColorInput, WPGMZA.EventDispatcher);

    WPGMZA.ColorInput.createInstance = function(element) {
        return new WPGMZA.ColorInput(element);
    }

    WPGMZA.ColorInput.prototype.clamp = function(min, max, value){
        if(isNaN(value)){
            value = 0;
        }
        return Math.min(Math.max(value, min), max);
    }

    WPGMZA.ColorInput.prototype.degreesToRadians = function(degrees) {
        return degrees * (Math.PI / 180);
    }

    WPGMZA.ColorInput.prototype.hueToRgb = function(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    WPGMZA.ColorInput.prototype.getMousePositionInCanvas = function(canvas, event){
        var rect = canvas.getBoundingClientRect();
        
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    WPGMZA.ColorInput.prototype.parseOptions = function(options){
        if(options){
            for(var i in options){
                if(typeof this.options[i] !== 'undefined'){
                    if(typeof this.options[i] === 'object' && typeof options[i] === 'object'){
                        this.options[i] = Object.assign(this.options[i], options[i]);
                    } else {
                        this.options[i] = options[i];
                    }
                }
            }
        }

        if(this.dataAttributes){
            for(var i in this.dataAttributes){
                if(typeof this.options[i] !== 'undefined'){
                    this.options[i] = this.dataAttributes[i];
                } 
            }
        }
    }

    WPGMZA.ColorInput.prototype.getColor = function(override, format){
        var hsl = Object.assign({},this.color);
        if(override){
            for(var i in override){
                hsl[i] = override[i];
            }
        }

        if(!format){
            format = this.options.format;
        }
        
        var rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l, hsl.a);
        switch(format){
            case 'hsl':
                return "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
            case 'hsla':
                return "hsla(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%, " + hsl.a + ")";
            case 'rgb':
                return "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
            case 'rgba':
                return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + rgb.a + ")";
        }

        return this.rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    }

    WPGMZA.ColorInput.prototype.setColor = function(hsl){
        for(var i in hsl){
            this.color[i] = hsl[i];
        }

        if(!this.options.supportAlpha){
            this.color.a = 1;
        }

        this.updatePreview();
        this.commit();

        if(this.state.initialized){
            this.update();
        }
    }

    WPGMZA.ColorInput.prototype.parseColor = function(value){
        if(typeof value === "string"){
            value = value.trim().toLowerCase().replace(/ /g, '');
            if(value === ""){
                value = "rgb(255,255,255)";
            }

            if(value.indexOf("rgb") !== -1){
                value = value.replace(/[a-z\(\)%]/g, '');
                parts = value.split(',');

                this.setColor(this.rgbToHsl(parts[0], parts[1], parts[2], parts[3]));
            } else if (value.indexOf('hsl') !== -1){
                value = value.replace(/[a-z\(\)%]/g, '');
                parts = value.split(',');

                var hsl = {
                    h : parts[0] ? parseInt(parts[0]) : 0,
                    s : parts[1] ? parseInt(parts[1]) : 0,
                    l : parts[2] ? parseInt(parts[2]) : 100,
                    a : parts[3] ? parseFloat(parts[3]) : 1,
                };

                this.setColor(hsl);
            } else {
                var rgb = this.hexToRgb(value);
                this.setColor(this.rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a));
            }
        }
    }

    WPGMZA.ColorInput.prototype.rgbToHsl = function(r, g, b, a) {
        var rgb = {
            r : r >= 0 ? (r / 255) : 255,
            g : g >= 0 ? (g / 255) : 255,
            b : b >= 0 ? (b / 255) : 255,
            a : (a >= 0 ? a : 1)
        };

        var bounds = {
            min : Math.min(rgb.r, rgb.g, rgb.b),
            max : Math.max(rgb.r, rgb.g, rgb.b)
        };

        var delta = bounds.max - bounds.min;

        var hsl = {
            h : (bounds.max + bounds.min) / 2,
            s : (bounds.max + bounds.min) / 2,
            l : (bounds.max + bounds.min) / 2,
            a : rgb.a
        };

        if(delta !== 0){
            hsl.s = hsl.l > 0.5 ? delta / (2 - bounds.max - bounds.min) : delta / (bounds.max + bounds.min);

            switch (bounds.max) {
              case rgb.r: 
                hsl.h = (rgb.g - rgb.b) / delta + (rgb.g < rgb.b ? 6 : 0); 
                break;
              case rgb.g: 
                hsl.h = (rgb.b - rgb.r) / delta + 2; 
                break;
              case rgb.b: 
                hsl.h = (rgb.r - rgb.g) / delta + 4; 
                break;
            }

            hsl.h = hsl.h / 6;
        } else {
            hsl.h = 0;
            hsl.s = 0;
        }

        hsl.h = parseInt(hsl.h * 360);
        hsl.s = parseInt(hsl.s * 100);
        hsl.l = parseInt(hsl.l * 100);

        return hsl;
    }

    WPGMZA.ColorInput.prototype.hexToRgb = function(hex){
        hex = hex.trim().toLowerCase().replace(/ /g, '').replace(/[^A-Za-z0-9\s]/g,'');

        if(hex.length < 6){
            hex += hex.charAt(hex.length - 1).repeat((6 - hex.length));
        }

        return  {
            r : parseInt((hex.slice(0, 2)), 16),
            g : parseInt((hex.slice(2, 4)), 16),
            b : parseInt((hex.slice(4, 6)), 16),
            a : hex.length > 6 ? this.floatToPrecision((parseInt(hex.slice(6, 8), 16)) / 255, 2) : 1
        };
    }

    WPGMZA.ColorInput.prototype.hslToRgb = function(h, s, l, a) {
        var hsl = {
            h : h >= 0 ? h : 0,
            s : s >= 0 ? s / 100 : 0,
            l : l >= 0 ? l / 100 : 0,
            a : a >= 0 ? a : 1
        };

        var rgb = {
            r : 0,
            g : 0,
            b : 0,
            a : hsl.a
        };

        var chroma = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
        var exp = chroma * (1 - Math.abs((hsl.h / 60) % 2 -1));
        var diff = hsl.l - chroma / 2;

        if (0 <= hsl.h && hsl.h < 60) {
            rgb.r = chroma; 
            rgb.g = exp; 
            rgb.b = 0;  
        } else if (60 <= hsl.h && hsl.h < 120) {
            rgb.r = exp; 
            rgb.g = chroma; 
            rgb.b = 0;
        } else if (120 <= hsl.h && hsl.h < 180) {
            rgb.r = 0; 
            rgb.g = chroma; 
            rgb.b = exp;
        } else if (180 <= hsl.h && hsl.h < 240) {
            rgb.r = 0; 
            rgb.g = exp; 
            rgb.b = chroma;
        } else if (240 <= hsl.h && hsl.h < 300) {
            rgb.r = exp; 
            rgb.g = 0; 
            rgb.b = chroma;
        } else if (300 <= hsl.h && hsl.h < 360) {
            rgb.r = chroma; 
            rgb.g = 0; 
            rgb.b = exp;
        }
        rgb.r = Math.round((rgb.r + diff) * 255);
        rgb.g = Math.round((rgb.g + diff) * 255);
        rgb.b = Math.round((rgb.b + diff) * 255);

        return rgb;
    }

    WPGMZA.ColorInput.prototype.rgbToHex = function(r, g, b, a){
        var rgb = {
            r : r >= 0 ? r : 255,
            g : g >= 0 ? g : 255,
            b : b >= 0 ? b : 255,
            a : a >= 0 ? a : 1
        };


        rgb.r = rgb.r.toString(16);
        rgb.g = rgb.g.toString(16);
        rgb.b = rgb.b.toString(16);
        
        if(rgb.a < 1){
            rgb.a = Math.round(rgb.a * 255).toString(16);
        } else {
            rgb.a = "";
        }

        for(var i in rgb){
            if(rgb[i].length === 1){
                rgb[i] = "0" + rgb[i];
            }
        }

        return "#" + rgb.r + rgb.g + rgb.b + rgb.a;
    }

    WPGMZA.ColorInput.prototype.floatToPrecision = function(float, precision){
        float = parseFloat(float);
        return parseFloat(float.toFixed(precision));
    }

    WPGMZA.ColorInput.prototype.wrap = function(){
        var self = this;
        if(this.element && this.type === "text"){
            this.element.hide();
            this.container = $("<div class='wpgmza-color-input-wrapper' />");

            this.container.insertAfter(this.element);
            this.container.append(this.element);

            if(this.options.autoClose){
                $(document.body).on('click', function(){
                    if(self.state.open){
                        self.state.mouse.down = false;
                        self.onTogglePicker();
                    }
                });

                $(document.body).on('colorpicker.open.wpgmza', function(event){
                    if(event.instance === self){
                        return;
                    }

                    if(self.state.open){
                        self.onTogglePicker();
                    }
                });
            }
        } else {
            throw new Error("WPGMZA.ColorInput requires a text field as a base");
        }
    }

    WPGMZA.ColorInput.prototype.renderControls = function(){
        var self = this;
        if(this.container){
            this.preview = $("<div class='wpgmza-color-preview wpgmza-shadow' />");
            this.swatch = $("<div class='swatch' />");
            this.picker = $("<div class='wpgmza-color-picker wpgmza-card wpgmza-shadow' />");

            this.preview.append(this.swatch);

            this.picker.addClass('anchor-' + this.options.anchor);
            this.preview.addClass('anchor-' + this.options.anchor);

            this.preview.on('click', function(event){
                event.stopPropagation();
                self.onTogglePicker();
            });

            this.picker.on('click', function(event){
                event.stopPropagation();
            });

            this.container.append(this.preview);

            if(this.options.container && $(this.options.container).length > 0){
                $(this.options.container).append(this.picker);
                $(this.options.container).addClass('wpgmza-color-input-host');
            } else {
                this.container.append(this.picker);
            }


            if(this.options.autoOpen){
                this.preview.trigger('click');
            }
        }
    }

    WPGMZA.ColorInput.prototype.renderPicker = function(){
        if(!this.state.initialized){
            this.renderWheel();
            this.renderFields();
            this.renderPalette();

            this.state.initialized = true;
        }
    }

    WPGMZA.ColorInput.prototype.renderWheel = function(){
        var self = this;

        this.wheel = {
            wrap : $("<div class='canvas-wrapper' />"),
            element : $("<canvas class='color-wheel' />"),
            handle : $("<div class='canvas-handle' />"),
            slider : $("<div class='canvas-slider' />")
        };

        this.wheel.target = this.wheel.element.get(0);
        
        this.wheel.target.height = 256;
        this.wheel.target.width = 256;

        this.wheel.radius = (this.wheel.target.width - ((this.options.wheelBorderWidth + this.options.wheelPadding) * 2)) / 2;
        this.wheel.degreeStep = 1 / this.wheel.radius;

        this.wheel.context = this.wheel.target.getContext("2d");

        this.wheel.context.clearRect(0, 0, this.wheel.target.width, this.wheel.target.height);

        this.wheel.grid = {
            canvas : document.createElement('canvas')
        };

        this.wheel.grid.canvas.width = 20;
        this.wheel.grid.canvas.height = 20;

        this.wheel.grid.context = this.wheel.grid.canvas.getContext('2d');
        this.wheel.grid.context.fillStyle = 'rgb(255,255,255)';
        this.wheel.grid.context.fillRect(0, 0, this.wheel.grid.canvas.width, this.wheel.grid.canvas.height);
        
        this.wheel.grid.context.fillStyle = 'rgb(180,180,180)';
        this.wheel.grid.context.fillRect(0, 0, this.wheel.grid.canvas.width / 2, this.wheel.grid.canvas.height / 2);
        this.wheel.grid.context.fillRect(this.wheel.grid.canvas.width / 2, this.wheel.grid.canvas.height / 2, this.wheel.grid.canvas.width / 2, this.wheel.grid.canvas.height / 2);
        
        this.wheel.element.on('mousedown', function(event){
            self.state.mouse.down = true;
            self.onPickerMouseSelect(event);
        });

        this.wheel.element.on('mousemove', function(event){
            if(self.state.mouse.down){
                self.onPickerMouseSelect(event);
            }
        });

        this.wheel.element.on('mouseup', function(event){
            self.clearStates();
        });

        this.wheel.element.on('mouseleave', function(event){
            self.clearStates();
        });

        this.wheel.wrap.append(this.wheel.element);        
        this.wheel.wrap.append(this.wheel.handle);        
        this.wheel.wrap.append(this.wheel.slider);        
        this.picker.append(this.wheel.wrap);
    }

    WPGMZA.ColorInput.prototype.renderFields = function(){
        var self = this;
        this.fields = {
            wrap : $("<div class='wpgmza-color-field-wrapper' />"),
            toggle : $("<div class='color-field-toggle' />"),
            blocks : {
                hsla : {
                    keys : ['h','s','l','a']
                }, 
                rgba : {
                    keys : ['r','g','b','a']                    
                },
                hex : {
                    keys : ['hex']
                }
            }
        };

        this.fields.toggle.on('click', function(){
            var view = self.fields.view;
            switch(view){
                case 'hex':
                    view = 'hsla';
                    break;
                case 'hsla':
                    view = 'rgba';
                    break;
                case 'rgba':
                    view = 'hex';
                    break;
            }

            self.updateFieldView(view);
        });

        this.fields.wrap.append(this.fields.toggle);

        for(var group in this.fields.blocks){
            var keys = this.fields.blocks[group].keys;

            this.fields.blocks[group].wrap = $("<div class='field-block' data-type='" + group + "'/>");
            
            this.fields.blocks[group].rows = {
                labels : $("<div class='labels' />"),
                controls : $("<div class='controls' />")
            };

            this.fields.blocks[group].wrap.append(this.fields.blocks[group].rows.controls);
            this.fields.blocks[group].wrap.append(this.fields.blocks[group].rows.labels);

            if(!this.options.supportAlpha && keys.indexOf('a') !== -1){
                this.fields.blocks[group].wrap.addClass('alpha-disabled');
            }

            for(var index in keys){
                var name = keys[index];

                var label = $("<div class='inner-label' />");
                label.text(name);

                this.fields.blocks[group][name] = $("<input type='text'/>");

                this.fields.blocks[group].rows.controls.append(this.fields.blocks[group][name]);
                this.fields.blocks[group].rows.labels.append(label);

                this.fields.blocks[group][name].on('keydown', function(event){
                    const originalEvent = event.originalEvent;
                    if(originalEvent.key === 'Enter'){
                        originalEvent.preventDefault();
                        originalEvent.stopPropagation();
                        $(event.currentTarget).trigger('change');
                    }
                });

                this.fields.blocks[group][name].on('change', function(){
                    self.onFieldChange(this);
                });              
            }

            this.fields.wrap.append(this.fields.blocks[group].wrap);
        }

        this.picker.append(this.fields.wrap);

        this.updateFieldView();
    }

    WPGMZA.ColorInput.prototype.renderPalette = function(){
        var self = this;
        if(!this.options.supportPalette){
            return;
        }

        this.palette = {
            wrap : $("<div class='wpgmza-color-palette-wrap' />"),
            variations : [
                {
                    s : -10,
                    l : -10
                },
                {
                    h : 15,
                },
                {
                    h : 30,
                },
                {
                    h : -15,
                },
                {
                    h : -30,
                },
                {
                    h : 100,
                    s : 10
                },
                {
                    h : -100,
                    s : -10
                },
                {
                    h : 180
                }
            ],
            controls : []
        };

        for(var i in this.palette.variations){
            var variation = this.palette.variations[i];
            var control = $("<div class='palette-swatch' />");
            
            for(var mutator in variation){
                control.attr("data-" + mutator, variation[mutator]);
            }

            control.on('click', function(){
                var elem = $(this);
                self.parseColor(elem.css("background-color"));
                /* Trigger input event, as in user caused changed */
                self.element.trigger('input');
            });

            this.palette.wrap.append(control);
            this.palette.controls.push(control);
        }

        this.picker.append(this.palette.wrap);
    }

    WPGMZA.ColorInput.prototype.updateWheel = function(){
        this.wheel.center = {
            x : this.wheel.radius + this.options.wheelBorderWidth + this.options.wheelPadding,
            y : this.wheel.radius + this.options.wheelBorderWidth + this.options.wheelPadding,
        };

        if(this.color.a < 1){
            this.wheel.grid.pattern = this.wheel.context.createPattern(this.wheel.grid.canvas, 'repeat');
            this.wheel.context.fillStyle = this.wheel.grid.pattern;
            this.wheel.context.beginPath();
            this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, this.wheel.radius, 0, Math.PI * 2, true);
            this.wheel.context.closePath();
            this.wheel.context.fill();
        }

        for(var i = 0; i < 360; i ++) {
            var startAngle = (i - 1) * Math.PI / 180;
            var endAngle = (i + 1) * Math.PI / 180;
            this.wheel.context.beginPath();
            this.wheel.context.moveTo(this.wheel.center.x, this.wheel.center.y);
            this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, this.wheel.radius, startAngle, endAngle);
            this.wheel.context.closePath();
            this.wheel.context.fillStyle = 'hsla(' + i + ', 100%, 50%, ' + this.color.a + ')';
            this.wheel.context.fill();
        }

        var gradient = this.wheel.context.createRadialGradient(this.wheel.center.x , this.wheel.center.y, 0, this.wheel.center.x, this.wheel.center.y, this.wheel.radius);
        gradient.addColorStop(0,'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1,'rgba(255, 255, 255, 0)');
            
        this.wheel.context.fillStyle = gradient;
        this.wheel.context.beginPath();
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, this.wheel.radius, 0, Math.PI * 2, true);
        this.wheel.context.closePath();
        this.wheel.context.fill();

        this.wheel.context.lineWidth = 2;
        this.wheel.context.strokeStyle = this.options.wheelBorderColor;
        this.wheel.context.stroke();
        
        var strokeGradient = this.wheel.context.createLinearGradient(this.wheel.center.x, 0, this.wheel.center.x, this.wheel.target.height);
        strokeGradient.addColorStop(0, this.getColor({l: 95}, 'hsl'));
        strokeGradient.addColorStop(0.5, this.getColor({l: 50}, 'hsl'));
        strokeGradient.addColorStop(1, this.getColor({l: 5}, 'hsl'));

        this.wheel.context.beginPath();
        this.wheel.context.lineWidth = this.options.wheelBorderWidth;
        this.wheel.context.strokeStyle = strokeGradient;
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, (this.wheel.radius + this.options.wheelPadding + (this.options.wheelBorderWidth / 2)), 0, Math.PI * 2);
        this.wheel.context.stroke();

        this.wheel.context.beginPath();
        this.wheel.context.lineWidth = 1;
        this.wheel.context.strokeStyle = this.options.wheelBorderColor;
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, (this.wheel.radius + this.options.wheelPadding + this.options.wheelBorderWidth), 0, Math.PI * 2);
        this.wheel.context.stroke();
        
        this.wheel.context.beginPath();
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, (this.wheel.radius + this.options.wheelPadding), 0, Math.PI * 2);
        this.wheel.context.stroke();

        var shadow = this.wheel.context.createRadialGradient(this.wheel.center.x ,this.wheel.center.y, 0, this.wheel.center.x, this.wheel.center.y, this.wheel.radius);
        shadow.addColorStop(0,'rgba(80, 80, 80, 0)');
        shadow.addColorStop(0.95,'rgba(80, 80, 80, 0.0)');
        shadow.addColorStop(1,'rgba(80, 80, 80, 0.1)');

        this.wheel.context.beginPath();
        this.wheel.context.lineWidth = 6;
        this.wheel.context.strokeStyle = shadow;
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, (this.wheel.radius - 3), 0, Math.PI * 2);
        this.wheel.context.stroke();
    }

    WPGMZA.ColorInput.prototype.update = function(){
        this.updateHandles();
        this.updateWheel();
        this.updateFields();
        this.updatePalette();
    }

    WPGMZA.ColorInput.prototype.updateHandles = function(){
        var localRadius = this.wheel.element.width() / 2;
        var localHandleOffset = ((localRadius - this.options.wheelBorderWidth - this.options.wheelPadding) / 100) * this.color.s;
        
        var handleStyles = {
            left : ((localRadius) + (localHandleOffset * Math.cos(this.degreesToRadians(this.color.h)))) + 'px',
            top : ((localRadius) + (localHandleOffset  * Math.sin(this.degreesToRadians(this.color.h)))) + 'px',
        };

        this.wheel.handle.css(handleStyles);
        
        var sliderDegrees = (360 * (this.color.l / 100) / 2);
        var sliderDegreeOffset = 90;
        if(this.state.sliderInvert){
            sliderDegrees = 360 - sliderDegrees;
        }

        var sliderStyles = {
            left : ((localRadius) + ((localRadius - (this.options.wheelBorderWidth / 2)) * Math.cos(this.degreesToRadians(sliderDegrees + sliderDegreeOffset)))) + 'px',
            top : ((localRadius) + ((localRadius - (this.options.wheelBorderWidth / 2)) * Math.sin(this.degreesToRadians(sliderDegrees + sliderDegreeOffset)))) + 'px',
        };

        this.wheel.slider.css(sliderStyles);
    }

    WPGMZA.ColorInput.prototype.updatePreview = function(){
        this.swatch.css({background: this.getColor(false, 'rgba')});
    }

    WPGMZA.ColorInput.prototype.updateFields = function(){
        var hsl = Object.assign({}, this.color);

        for(var group in this.fields.blocks){
            switch(group){
                case 'hsla':
                    this.fields.blocks[group].h.val(hsl.h);            
                    this.fields.blocks[group].s.val(hsl.s);            
                    this.fields.blocks[group].l.val(hsl.l);            
                    this.fields.blocks[group].a.val(hsl.a);            
                    break;
                case 'rgba':
                    var rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l, hsl.a);
                    this.fields.blocks[group].r.val(rgb.r);            
                    this.fields.blocks[group].g.val(rgb.g);            
                    this.fields.blocks[group].b.val(rgb.b);            
                    this.fields.blocks[group].a.val(rgb.a);  
                    break;
                case 'hex':
                    var rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l, hsl.a);
                    var hex = this.rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);

                    this.fields.blocks[group].hex.val(hex);
                    break;
            }
        }
    }

    WPGMZA.ColorInput.prototype.updatePalette = function(){
        if(!this.options.supportPalette){
            return;
        }

        for(var i in this.palette.controls){
            var hsl = Object.assign({}, this.color);
            var control = this.palette.controls[i];
            var data = control.data();

            if(hsl.l === 0){
                if(data.h){
                    hsl.l += (Math.abs(data.h) / 360) * 100;
                }
                hsl.l += 10;
            } else if (hsl.l === 100){
                if(data.h){
                    hsl.l -= (Math.abs(data.h) / 360) * 100;
                }
                hsl.l -= 10;
            }

            for(var mutator in data){
                hsl[mutator] += data[mutator]; 
            }

            if(hsl.h < 0){
                hsl.h += 360;
            } else if (hsl.h > 360){
                hsl.h -= 360;
            }

            hsl.h = this.clamp(0, 360, hsl.h);
            hsl.s = this.clamp(0, 100, hsl.s);
            hsl.l = this.clamp(0, 100, hsl.l);

            var rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
            
            control.css("background", "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")");
        }
    }

    WPGMZA.ColorInput.prototype.updateFieldView = function(view){
        if(!view){
            view = this.options.format ? this.options.format : 'hex'; 
        }

        switch(view){
            case "rgb":
                view = "rgba";
                break;
            case "hsl":
                view = "hsla";
                break;
        }

        this.fields.view = view;

        for(var group in this.fields.blocks){
            if(group === this.fields.view){
                this.fields.blocks[group].wrap.show();
            } else {
                this.fields.blocks[group].wrap.hide();
            }
        }
    }

    WPGMZA.ColorInput.prototype.onPickerMouseSelect = function(event){
        var localRadius = this.wheel.element.width() / 2;
        var localPosition = this.getMousePositionInCanvas(this.wheel.target, event);

        var dir = {
            x : localPosition.x - localRadius,
            y : localPosition.y - localRadius,
        }

        var angle = Math.atan2(dir.y, dir.x) * 360 / (2 * Math.PI);
        if(angle < 0){
            angle += 360;
        }
        
        
        var distance = Math.sqrt(dir.x * dir.x + dir.y * dir.y);     
        var range = {
            pickerScaler : localRadius / this.wheel.radius,
        }

        range.pickerEdge = range.pickerScaler * (localRadius);
        
        if((distance <= range.pickerEdge || this.state.lockPicker) && !this.state.lockSlide){
            /* We are in range of the main picker cirlce */
            this.setColor({
                h : parseInt(angle), 
                s : Math.min(parseInt((distance / range.pickerEdge) * 100), 100)
            });

            this.state.lockPicker = true;
        } else {
            /* Outside, let's assume they are trying to adjust the brightness? */
            angle = angle - 90;
            if(angle < 0){
                angle += 360;
            }

            this.state.sliderInvert = false;
            if(angle > 180){
                angle = 180 - (angle - 180);
                this.state.sliderInvert = true;
            }


            this.setColor({
                l : parseInt((angle / 180) * 100) 
            });
            
            this.state.lockSlide = true;

        }

        /* Trigger input event, as in user caused changed */
        this.element.trigger('input');
    }

    WPGMZA.ColorInput.prototype.onFieldChange = function(field){
        if(field){
            if($(field).val().trim() === ""){
                return;
            }

            var block = $(field).closest('.field-block');
            var type = block.data('type');

            var raw = [];
            block.find('input').each(function(){
                raw.push($(this).val());
            });

            if(type === "hsla" || type === "rgba"){
                if(raw[3]){
                    var tA = raw[3];
                    if(tA.trim().charAt(tA.trim().length - 1) === "."){
                        return;
                    }
                }
            }

            switch(type){
                case 'hsla':
                    var hsl = {
                        h : raw[0] ? parseInt(raw[0]) : 0,
                        s : raw[1] ? parseInt(raw[1]) : 0,
                        l : raw[2] ? parseInt(raw[2]) : 100,
                        a : raw[3] ? parseFloat(raw[3]) : 1
                    };

                    hsl.h = this.clamp(0, 360, hsl.h);
                    hsl.s = this.clamp(0, 100, hsl.s);
                    hsl.l = this.clamp(0, 100, hsl.l);
                    hsl.a = this.clamp(0.0, 1.0, hsl.a);

                    this.setColor(hsl);
                    break;
                case 'rgba':
                    var rgb = {
                        r : raw[0] ? parseInt(raw[0]) : 255,
                        g : raw[1] ? parseInt(raw[1]) : 255,
                        b : raw[2] ? parseInt(raw[2]) : 255,
                        a : raw[3] ? parseFloat(raw[3]) : 1
                    };

                    rgb.r = this.clamp(0, 255, rgb.r);
                    rgb.g = this.clamp(0, 255, rgb.g);
                    rgb.b = this.clamp(0, 255, rgb.b);
                    rgb.a = this.clamp(0.0, 1.0, rgb.a);

                    var hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
                    this.setColor(hsl);

                    break;
                case 'hex':
                    var rgb = this.hexToRgb(raw[0] ? raw[0] : "#ffffff");
                    this.setColor(this.rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a));
                    break;
            }

            /* Trigger input event, as in user caused changed */
            this.element.trigger('input');
        }
    }

    WPGMZA.ColorInput.prototype.onTogglePicker = function(){
        this.renderPicker();

        this.picker.toggleClass('active');
        this.update();

        this.state.open = this.picker.hasClass('active');
        if(this.state.open){
            $(document.body).trigger({type:"colorpicker.open.wpgmza", instance: this});
        }
    }

    WPGMZA.ColorInput.prototype.clearStates = function(){
        this.state.mouse.down = false;
        this.state.lockSlide = false;
        this.state.lockPicker = false;
    }

    WPGMZA.ColorInput.prototype.commit = function(){
        var syncValue = this.getColor();
        this.element.val(syncValue);
        this.element.trigger('change');
    }

    $(document.body).ready(function(){
        $("input.wpgmza-color-input").each(function(index, el) {
            el.wpgmzaColorInput = WPGMZA.ColorInput.createInstance(el);
        });
    });

});

// js/v8/css-backdrop-filter-input.js
/**
 * @namespace WPGMZA
 * @module CSSBackdropFilterInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.CSSBackdropFilterInput = function(element, options){
        if(!(element instanceof HTMLInputElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.dataAttributes = this.element.data();
        this.type = element.type;
        this.value = element.value;

        this.options = {

        };

        this.parseOptions(options);

        this.state = {
            initialized : false
        }

        this.filters = {
            blur : {
                enable : false,
                value : 0,
                unit : 'px'
            },
            brightness : {
                enable : false,
                value : 0,
                unit : '%'
            },
            contrast : {
                enable : false,
                value : 0,
                unit : '%'
            },
            grayscale : {
                enable : false,
                value : 0,
                unit : '%'
            },
            hue_rotate : {
                enable : false,
                value : 0,
                unit : 'deg'
            },
            invert : {
                enable : false,
                value : 0,
                unit : '%'
            },
            sepia : {
                enable : false,
                value : 0,
                unit : '%'
            },
            saturate : {
                enable : false,
                value : 0,
                unit : '%'
            }
        };

        this.wrap();
        this.renderControls();

        this.parseFilters(this.value);
    }

    WPGMZA.extend(WPGMZA.CSSBackdropFilterInput, WPGMZA.EventDispatcher);

    WPGMZA.CSSBackdropFilterInput.FILTER_PATTERN = /(\S+)/g;
    WPGMZA.CSSBackdropFilterInput.VALUE_PATTERN = /(\(\S*\))/g;

    WPGMZA.CSSBackdropFilterInput.createInstance = function(element) {
        return new WPGMZA.CSSBackdropFilterInput(element);
    }

    WPGMZA.CSSBackdropFilterInput.prototype.parseOptions = function(options){
        if(options){
            for(var i in options){
                if(typeof this.options[i] !== 'undefined'){
                    if(typeof this.options[i] === 'object' && typeof options[i] === 'object'){
                        this.options[i] = Object.assign(this.options[i], options[i]);
                    } else {
                        this.options[i] = options[i];
                    }
                }
            }
        }

        if(this.dataAttributes){
            for(var i in this.dataAttributes){
                if(typeof this.options[i] !== 'undefined'){
                    this.options[i] = this.dataAttributes[i];
                } 
            }
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.getFilters = function(override, format){
        let filters = [];
        for(let type in this.filters){
            const data = this.filters[type];

            if(data.enable){
                type = type.replace("_", "-");
                filters.push(type + "(" + data.value + data.unit + ")");
            }
        }
        return filters.length > 0 ? filters.join(" ") : "none";
    }

    WPGMZA.CSSBackdropFilterInput.prototype.setFilters = function(filters){
        this.clearFilters();
        
        if(filters instanceof Object){
            for(let type in filters){
                if(this.filters[type]){
                    const value = filters[type];
                    if(value){
                        this.filters[type].enable = true;
                        this.filters[type].value = value;
                    }
                }
            }
        }
        
        this.commit();
        if(this.state.initialized){
            this.update();
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.clearFilters = function(){
        for(let i in this.filters){
            this.filters[i].enable = false;
            this.filters[i].value = 0;
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.parseFilters = function(value){
        if(typeof value === "string"){
            value = value.trim().toLowerCase();
            if(value === ""){
                value = "none";
            }

            let filters = {};
            if(value !== "none"){
                /* Some filters exist */
                let matches = value.match(WPGMZA.CSSBackdropFilterInput.FILTER_PATTERN);
                if(matches && matches instanceof Array){
                    for(let match of matches){
                        let valueArg = match.match(WPGMZA.CSSBackdropFilterInput.VALUE_PATTERN);
                        valueArg = valueArg instanceof Array && valueArg.length > 0 ? valueArg[0] : '';

                        let type = match.replace(valueArg, '').replace('-', '_');
                        let value = null;
                        if(valueArg.length > 0){
                            let numericValue = valueArg.match(/(\d+)/g);
                            if(numericValue instanceof Array && numericValue.length > 0){
                                value = parseFloat(numericValue[0]);
                            }
                        }

                        filters[type] = value;
                    }
                }
            }

            this.setFilters(filters);
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.wrap = function(){
        var self = this;
        if(this.element && this.type === "text"){
            this.element.hide();
            this.container = $("<div class='wpgmza-styling-backdrop-filter-input-wrapper' />");

            this.container.insertAfter(this.element);
            this.container.append(this.element);
        } else {
            throw new Error("WPGMZA.CSSUnitInput requires a text field as a base");
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.renderControls = function(){
        var self = this;
        if(this.container){
            this.itemWrappers = {};
            for(let type in this.filters){
                let data = this.filters[type];

                let printType = type.replace("_", " ");

                const wrapper = $("<div class='backdrop-filter-item-wrap' data-type='" + type + "' />");

                const toggleWrap = $("<div class='backdrop-filter-toggle-wrap' />");
                const toggleInput = $("<input type='checkbox' class='backdrop-filter-item-toggle' />");
                const toggleLabel = $("<label />");

                const controlWrap = $("<div class='backdrop-filter-control-wrap' />");

                let controlType = 'text';
                controlAttributes = "data-min='1' data-max='100'";
                if(data.unit === 'deg'){
                    controlAttributes = "data-min='1' data-max='360'";
                } else if (data.unit === 'px'){
                    controlAttributes = "data-min='1' data-max='200'";
                }

                const controlInput = $("<input class='backdrop-filter-item-input' type='" + controlType + "' " + controlAttributes + " value='" + data.value + "' />");
                const controlLabel = $("<small />");
                controlLabel.append("<span>" + data.value + "</span>" + data.unit);

                const slider = $("<div class='backdrop-filter-item-slider' />"); 


                toggleLabel.append(toggleInput);
                toggleLabel.append(printType);

                toggleWrap.append(toggleLabel);

                controlWrap.append(controlInput);
                controlWrap.append(controlLabel);
                controlWrap.append(slider);

                wrapper.append(toggleWrap);
                wrapper.append(controlWrap);


                this.itemWrappers[type] = wrapper;
                this.container.append(wrapper);

                this.state.initialized = true;
                
                /* Events */
                slider.slider({
                    range: "max",
                    min: controlInput.data('min'),
                    max: controlInput.data('max'),
                    value: controlInput.val(),
                    slide: function( event, ui ) {
                        controlInput.val(ui.value);
                        controlLabel.find('span').text(ui.value);
                        controlInput.trigger('change');
                        // self.commit();
                    },
                    change: function(event, ui){
                    }
                });

                controlInput.wpgmzaRelativeSlider = slider;               

                toggleInput.on('change', (event) => {
                    const target = $(event.currentTarget);
                    const parent = target.closest('.backdrop-filter-item-wrap');
                    const type = parent.data('type');

                    if(target.is(':checked')){
                        parent.addClass('enabled');
                        this.setFilterState(type, true);
                    } else {
                        parent.removeClass('enabled');
                        this.setFilterState(type, false);
                    }
                });

                controlInput.on('change', (event) => {
                    const target = $(event.currentTarget);
                    const parent = target.closest('.backdrop-filter-item-wrap');
                    const type = parent.data('type');
                    this.setFilterValue(type, target.val());
                });

            }
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.setFilterState = function(type, state){
        if(this.filters[type]){
            this.filters[type].enable = state;
        }

        this.commit();
    }

    WPGMZA.CSSBackdropFilterInput.prototype.setFilterValue = function(type, value){
        if(this.filters[type]){
            this.filters[type].value = parseFloat(value);
        }

        this.commit();
    }

    WPGMZA.CSSBackdropFilterInput.prototype.update = function(){
        if(this.container){
            for(let type in this.filters){
                const data = this.filters[type];
                
                const row = this.container.find('.backdrop-filter-item-wrap[data-type="' + type + '"]');

                row.find('.backdrop-filter-item-toggle').prop('checked', data.enable).trigger('change');
                row.find('.backdrop-filter-item-input').val(data.value).trigger('change');

                row.find('.backdrop-filter-item-slider').slider('value', data.value);
                row.find('.backdrop-filter-control-wrap').find('small span').text(data.value);

            }
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.commit = function(){
        var syncValue = this.getFilters();
        this.element.val(syncValue);
        this.element.trigger('change');
    }

    $(document.body).ready(function(){
        $("input.wpgmza-styling-backdrop-filter-input").each(function(index, el) {
            el.wpgmzaCSSBackdropFilterInput = WPGMZA.CSSBackdropFilterInput.createInstance(el);
        });
    });

});

// js/v8/css-filter-input.js
/**
 * @namespace WPGMZA
 * @module CSSFilterInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.CSSFilterInput = function(element, options){
        if(!(element instanceof HTMLInputElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.dataAttributes = this.element.data();
        this.type = element.type;
        this.value = element.value;

        this.options = {

        };

        this.parseOptions(options);

        this.state = {
            initialized : false
        }

        this.filters = {
            blur : {
                enable : false,
                value : 0,
                unit : 'px'
            },
            brightness : {
                enable : false,
                value : 0,
                unit : '%'
            },
            contrast : {
                enable : false,
                value : 0,
                unit : '%'
            },
            grayscale : {
                enable : false,
                value : 0,
                unit : '%'
            },
            hue_rotate : {
                enable : false,
                value : 0,
                unit : 'deg'
            },
            invert : {
                enable : false,
                value : 0,
                unit : '%'
            },
            sepia : {
                enable : false,
                value : 0,
                unit : '%'
            },
            saturate : {
                enable : false,
                value : 0,
                unit : '%'
            }
        };

        this.wrap();
        this.renderControls();

        this.parseFilters(this.value);
    }

    WPGMZA.extend(WPGMZA.CSSFilterInput, WPGMZA.EventDispatcher);

    WPGMZA.CSSFilterInput.FILTER_PATTERN = /(\S+)/g;
    WPGMZA.CSSFilterInput.VALUE_PATTERN = /(\(\S*\))/g;

    WPGMZA.CSSFilterInput.createInstance = function(element) {
        return new WPGMZA.CSSFilterInput(element);
    }

    WPGMZA.CSSFilterInput.prototype.parseOptions = function(options){
        if(options){
            for(var i in options){
                if(typeof this.options[i] !== 'undefined'){
                    if(typeof this.options[i] === 'object' && typeof options[i] === 'object'){
                        this.options[i] = Object.assign(this.options[i], options[i]);
                    } else {
                        this.options[i] = options[i];
                    }
                }
            }
        }

        if(this.dataAttributes){
            for(var i in this.dataAttributes){
                if(typeof this.options[i] !== 'undefined'){
                    this.options[i] = this.dataAttributes[i];
                } 
            }
        }
    }

    WPGMZA.CSSFilterInput.prototype.getFilters = function(override, format){
        let filters = [];
        for(let type in this.filters){
            const data = this.filters[type];

            if(data.enable){
                type = type.replace("_", "-");
                filters.push(type + "(" + data.value + data.unit + ")");
            }
        }
        return filters.length > 0 ? filters.join(" ") : "none";
    }

    WPGMZA.CSSFilterInput.prototype.setFilters = function(filters){
        this.clearFilters();
        
        if(filters instanceof Object){
            for(let type in filters){
                if(this.filters[type]){
                    const value = filters[type];
                    if(value){
                        this.filters[type].enable = true;
                        this.filters[type].value = value;
                    }
                }
            }
        }
        
        this.commit();
        if(this.state.initialized){
            this.update();
        }
    }

    WPGMZA.CSSFilterInput.prototype.clearFilters = function(){
        for(let i in this.filters){
            this.filters[i].enable = false;
            this.filters[i].value = 0;
        }
    }

    WPGMZA.CSSFilterInput.prototype.parseFilters = function(value){
        if(typeof value === "string"){
            value = value.trim().toLowerCase();
            if(value === ""){
                value = "none";
            }

            let filters = {};
            if(value !== "none"){
                /* Some filters exist */
                let matches = value.match(WPGMZA.CSSFilterInput.FILTER_PATTERN);
                if(matches && matches instanceof Array){
                    for(let match of matches){
                        let valueArg = match.match(WPGMZA.CSSFilterInput.VALUE_PATTERN);
                        valueArg = valueArg instanceof Array && valueArg.length > 0 ? valueArg[0] : '';

                        let type = match.replace(valueArg, '').replace('-', '_');
                        let value = null;
                        if(valueArg.length > 0){
                            let numericValue = valueArg.match(/(\d+)/g);
                            if(numericValue instanceof Array && numericValue.length > 0){
                                value = parseFloat(numericValue[0]);
                            }
                        }

                        filters[type] = value;
                    }
                }
            }

            this.setFilters(filters);
        }
    }

    WPGMZA.CSSFilterInput.prototype.wrap = function(){
        var self = this;
        if(this.element && this.type === "text"){
            this.element.hide();
            this.container = $("<div class='wpgmza-css-filter-input-wrapper' />");

            this.container.insertAfter(this.element);
            this.container.append(this.element);
        } else {
            throw new Error("WPGMZA.CSSFilterInput requires a text field as a base");
        }
    }

    WPGMZA.CSSFilterInput.prototype.renderControls = function(){
        var self = this;
        if(this.container){
            this.itemWrappers = {};
            for(let type in this.filters){
                let data = this.filters[type];

                let printType = type.replace("_", " ");

                const wrapper = $("<div class='css-filter-item-wrap' data-type='" + type + "' />");

                const toggleWrap = $("<div class='css-filter-toggle-wrap' />");
                const toggleInput = $("<input type='checkbox' class='css-filter-item-toggle' />");
                const toggleLabel = $("<label />");

                const controlWrap = $("<div class='css-filter-control-wrap' />");

                let controlType = 'text';
                controlAttributes = "data-min='1' data-max='100'";
                if(data.unit === 'deg'){
                    controlAttributes = "data-min='1' data-max='360'";
                } else if (data.unit === 'px'){
                    controlAttributes = "data-min='1' data-max='200'";
                }

                const controlInput = $("<input class='css-filter-item-input' type='" + controlType + "' " + controlAttributes + " value='" + data.value + "' />");
                const controlLabel = $("<small />");
                controlLabel.append("<span>" + data.value + "</span>" + data.unit);

                const slider = $("<div class='css-filter-item-slider' />"); 


                toggleLabel.append(toggleInput);
                toggleLabel.append(printType);

                toggleWrap.append(toggleLabel);

                controlWrap.append(controlInput);
                controlWrap.append(controlLabel);
                controlWrap.append(slider);

                wrapper.append(toggleWrap);
                wrapper.append(controlWrap);


                this.itemWrappers[type] = wrapper;
                this.container.append(wrapper);

                this.state.initialized = true;
                
                /* Events */
                slider.slider({
                    range: "max",
                    min: controlInput.data('min'),
                    max: controlInput.data('max'),
                    value: controlInput.val(),
                    slide: function( event, ui ) {
                        controlInput.val(ui.value);
                        controlLabel.find('span').text(ui.value);
                        controlInput.trigger('change');
                        // self.commit();
                    },
                    change: function(event, ui){
                    }
                });

                controlInput.wpgmzaRelativeSlider = slider;               

                toggleInput.on('change', (event) => {
                    const target = $(event.currentTarget);
                    const parent = target.closest('.css-filter-item-wrap');
                    const type = parent.data('type');

                    if(target.is(':checked')){
                        parent.addClass('enabled');
                        this.setFilterState(type, true);
                    } else {
                        parent.removeClass('enabled');
                        this.setFilterState(type, false);
                    }
                });

                controlInput.on('change', (event) => {
                    const target = $(event.currentTarget);
                    const parent = target.closest('.css-filter-item-wrap');
                    const type = parent.data('type');
                    this.setFilterValue(type, target.val());
                });

            }
        }
    }

    WPGMZA.CSSFilterInput.prototype.setFilterState = function(type, state){
        if(this.filters[type]){
            this.filters[type].enable = state;
        }

        this.commit();
    }

    WPGMZA.CSSFilterInput.prototype.setFilterValue = function(type, value){
        if(this.filters[type]){
            this.filters[type].value = parseFloat(value);
        }

        this.commit();
    }

    WPGMZA.CSSFilterInput.prototype.update = function(){
        if(this.container){
            for(let type in this.filters){
                const data = this.filters[type];
                
                const row = this.container.find('.css-filter-item-wrap[data-type="' + type + '"]');

                row.find('.css-filter-item-toggle').prop('checked', data.enable).trigger('change');
                row.find('.css-filter-item-input').val(data.value).trigger('change');

                row.find('.css-filter-item-slider').slider('value', data.value);
                row.find('.css-filter-control-wrap').find('small span').text(data.value);

            }
        }
    }

    WPGMZA.CSSFilterInput.prototype.commit = function(){
        var syncValue = this.getFilters();
        this.element.val(syncValue);
        this.element.trigger('change');
    }

    $(document.body).ready(function(){
        $("input.wpgmza-css-filter-input").each(function(index, el) {
            el.wpgmzaCSSFilterInput = WPGMZA.CSSFilterInput.createInstance(el);
        });
    });

});

// js/v8/css-state-block.js
/**
 * @namespace WPGMZA
 * @module CSSStateBlock
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.CSSStateBlock = function(element, options){
        if(!(element instanceof HTMLElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.tabs = this.element.find('.wpgmza-css-state-block-item');
        this.items = this.element.find('.wpgmza-css-state-block-content');

        this.items.removeClass('active');
    
        this.bindEvents();
        
        this.element.find('.wpgmza-css-state-block-item:first-child').click();
    }

    WPGMZA.extend(WPGMZA.CSSStateBlock, WPGMZA.EventDispatcher);

    WPGMZA.CSSStateBlock.createInstance = function(element) {
        return new WPGMZA.CSSStateBlock(element);
    }

    WPGMZA.CSSStateBlock.prototype.bindEvents = function(){
        let self = this;
        this.tabs.on('click', function(event) {
            self.onClick($(this));
        });
    }

    WPGMZA.CSSStateBlock.prototype.onClick = function(item){
        const type = item.data('type');
        if(type){
            this.tabs.removeClass('active');
            item.addClass('active');
            
            this.items.removeClass('active');
            this.element.find('.wpgmza-css-state-block-content[data-type="' + type + '"]').addClass('active');
        }
    }

    $(document.body).ready(function(){
        $(".wpgmza-css-state-block").each(function(index, el) {
            el.wpgmzaCSSStateBlock = WPGMZA.CSSStateBlock.createInstance(el);
        });
    });
});

// js/v8/css-unit-input.js
/**
 * @namespace WPGMZA
 * @module CSSUnitInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.CSSUnitInput = function(element, options){
        if(!(element instanceof HTMLInputElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.dataAttributes = this.element.data();
        this.type = element.type;
        this.value = element.value;

        this.options = {

        };

        this.parseOptions(options);

        this.state = {
            initialized : false
        }

        this.unit = {
            value : 0,
            suffix : "px" 
        };

        this.wrap();
        this.renderControls();

        this.parseUnits(this.value);
    }

    WPGMZA.extend(WPGMZA.CSSUnitInput, WPGMZA.EventDispatcher);

    WPGMZA.CSSUnitInput.VALID_TYPES = ['px', '%', 'rem', 'em'];

    WPGMZA.CSSUnitInput.createInstance = function(element) {
        return new WPGMZA.CSSUnitInput(element);
    }

    WPGMZA.CSSUnitInput.prototype.parseOptions = function(options){
        if(options){
            for(var i in options){
                if(typeof this.options[i] !== 'undefined'){
                    if(typeof this.options[i] === 'object' && typeof options[i] === 'object'){
                        this.options[i] = Object.assign(this.options[i], options[i]);
                    } else {
                        this.options[i] = options[i];
                    }
                }
            }
        }

        if(this.dataAttributes){
            for(var i in this.dataAttributes){
                if(typeof this.options[i] !== 'undefined'){
                    this.options[i] = this.dataAttributes[i];
                } 
            }
        }
    }

    WPGMZA.CSSUnitInput.prototype.getUnits = function(override, format){
        return this.unit.value + this.unit.suffix;
    }

    WPGMZA.CSSUnitInput.prototype.setUnits = function(value, suffix){
        this.unit.value = value ? parseFloat(value) : this.unit.value;
        this.unit.suffix = suffix ? suffix.trim() : this.unit.suffix;               

        if(this.unit.value - parseInt(this.unit.value) > 0.0){
            this.unit.value = parseFloat(this.unit.value.toFixed(2));
        }

        if(this.unit.value <= 0){
            this.unit.value = 0;
        }

        this.validateSuffix();
        this.commit();

        if(this.state.initialized){
            this.update();
        }
    }

    WPGMZA.CSSUnitInput.prototype.parseUnits = function(value){
        if(typeof value === "string"){
            value = value.trim().toLowerCase().replace(/ /g, '');
            if(value === ""){
                value = "0px";
            }

            let unit = value.match(/((\d+\.\d+)|(\d+))/);
            if(unit && unit[0]){
                unit = parseFloat(unit[0]);
            } else {
                unit = this.unit.value;
            }

            let suffix = value.match(/(([a-z]+)|(%))/);
            if(suffix && suffix[0]){
                suffix = suffix[0];
            } else {
                suffix = this.unit.suffix;
            }

            this.setUnits(unit, suffix);
        }
    }

    WPGMZA.CSSUnitInput.prototype.wrap = function(){
        var self = this;
        if(this.element && this.type === "text"){
            this.element.hide();
            this.container = $("<div class='wpgmza-styling-unit-input-wrapper' />");

            this.container.insertAfter(this.element);
            this.container.append(this.element);
        } else {
            throw new Error("WPGMZA.CSSUnitInput requires a text field as a base");
        }
    }

    WPGMZA.CSSUnitInput.prototype.renderControls = function(){
        var self = this;
        if(this.container){
            this.unitValueInput = $("<input type='text' class='unit-value-input' />");
            this.unitSuffixToggle = $("<div class='unit-suffix-toggle' />");

            this.unitValueStepDownBtn = $("<div class='unit-stepper-button' data-mode='down' />");
            this.unitValueStepUpBtn = $("<div class='unit-stepper-button' data-mode='up' />");
            this.unitValueStepperWrap = $("<div class='unit-stepper-wrapper' />");

            this.unitInnerWrap = $("<div class='unit-input-inner-wrap' />");

            this.unitValueStepperWrap.append(this.unitValueStepUpBtn);
            this.unitValueStepperWrap.append(this.unitValueStepDownBtn);

            this.unitInnerWrap.append(this.unitValueStepperWrap);
            this.unitInnerWrap.append(this.unitValueInput);
            this.unitInnerWrap.append(this.unitSuffixToggle);

            this.container.append(this.unitInnerWrap);

            this.state.initialized = true;

            this.unitValueInput.on('keydown', (event) => {
                const originalEvent = event.originalEvent;
                if(originalEvent.key && originalEvent.key.length === 1){
                    if(originalEvent.key.trim().length === 0 || (originalEvent.key !== '.' && isNaN(parseInt(originalEvent.key)))){
                        /* Space, hide the dimensions input */
                        this.unitSuffixToggle.hide();
                    } 
                } else {
                    if(originalEvent.key === 'ArrowUp'){
                        this.increment();
                    } else if(originalEvent.key === 'ArrowDown'){
                        this.decrement();
                    } else if(originalEvent.key === 'Enter'){
                        originalEvent.preventDefault();
                        originalEvent.stopPropagation();

                        $(event.currentTarget).trigger('change');
                    }
                }
            });

            this.unitValueInput.on('change', (event) => {
                const input = $(event.currentTarget);
                this.parseUnits(input.val());
            });

            this.unitValueStepUpBtn.on('click', (event) => {
                this.increment();
            });

            this.unitValueStepDownBtn.on('click', (event) => {
                this.decrement();
            });
        }
    }

    WPGMZA.CSSUnitInput.prototype.validateSuffix = function(){
        if(this.unit.suffix){
            if(WPGMZA.CSSUnitInput.VALID_TYPES.indexOf(this.unit.suffix) === -1){
                this.unit.suffix = this.options.defaultSuffix;
            }
        } else {
            this.unit.suffix = this.options.defaultSuffix;
        }
    }

    WPGMZA.CSSUnitInput.prototype.increment = function(){
        this.parseUnits(this.unitValueInput.val());
        
        let value = this.unit.value;
        if(value - parseInt(value) > 0.0){
            value += 0.1;
        } else {
            value += 1;
        }
        this.setUnits(value, this.unit.suffix);
    }

    WPGMZA.CSSUnitInput.prototype.decrement = function(){
        this.parseUnits(this.unitValueInput.val());

        let value = this.unit.value;
        if(value - parseInt(value) > 0.0){
            value -= 0.1;
        } else {
            value -= 1;
        }

        this.setUnits(this.unit.value - 1, this.unit.suffix);
    }

    WPGMZA.CSSUnitInput.prototype.update = function(){
        if(this.unitValueInput && this.unitSuffixToggle){
            this.unitValueInput.val(this.unit.value);
            this.unitSuffixToggle.text(this.unit.suffix);

            this.unitSuffixToggle.show();
        }
    }

    WPGMZA.CSSUnitInput.prototype.commit = function(){
        var syncValue = this.getUnits();
        this.element.val(syncValue);
        this.element.trigger('change');
    }

    $(document.body).ready(function(){
        $("input.wpgmza-stylig-unit-input").each(function(index, el) {
            el.wpgmzaCSSUnitInput = WPGMZA.CSSUnitInput.createInstance(el);
        });
    });

});

// js/v8/drawing-manager.js
/**
 * @namespace WPGMZA
 * @module DrawingManager
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.DrawingManager = function(map)
	{
		WPGMZA.assertInstanceOf(this, "DrawingManager");
		
		WPGMZA.EventDispatcher.call(this);
		
		var self = this;

		this.map = map;
		this.mode = WPGMZA.DrawingManager.MODE_NONE;

		this.map.on("click rightclick", function(event) {
			self.onMapClick(event);
		});
	}
	
	WPGMZA.DrawingManager.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.DrawingManager.prototype.constructor = WPGMZA.DrawingManager;
	
	WPGMZA.DrawingManager.MODE_NONE			= null;
	WPGMZA.DrawingManager.MODE_MARKER		= "marker";
	WPGMZA.DrawingManager.MODE_POLYGON		= "polygon";
	WPGMZA.DrawingManager.MODE_POLYLINE		= "polyline";
	WPGMZA.DrawingManager.MODE_CIRCLE		= "circle";
	WPGMZA.DrawingManager.MODE_RECTANGLE	= "rectangle";
	WPGMZA.DrawingManager.MODE_HEATMAP		= "heatmap";
	WPGMZA.DrawingManager.MODE_POINTLABEL	= "pointlabel";
	WPGMZA.DrawingManager.MODE_IMAGEOVERLAY	= "imageoverlay";
	
	WPGMZA.DrawingManager.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return WPGMZA.GoogleDrawingManager;
				break;
				
			default:
				return WPGMZA.OLDrawingManager;
				break;
		}
	}
	
	WPGMZA.DrawingManager.createInstance = function(map)
	{
		var constructor = WPGMZA.DrawingManager.getConstructor();
		return new constructor(map);
	}
	
	WPGMZA.DrawingManager.prototype.setDrawingMode = function(mode) {
		this.mode = mode;
		
		this.trigger("drawingmodechanged");
	}

	WPGMZA.DrawingManager.prototype.onMapClick = function(event) {
		var self = this;
		
		if(!(event.target instanceof WPGMZA.Map))
			return;

		switch(this.mode){
			case WPGMZA.DrawingManager.MODE_POINTLABEL:
				if(!this.pointlabel){
					this.pointlabel = WPGMZA.Pointlabel.createInstance({
						center : new WPGMZA.LatLng({
							lat : event.latLng.lat,
							lng : event.latLng.lng
						}), 
						map : this.map
					});

					this.map.addPointlabel(this.pointlabel);
					this.pointlabel.setEditable(true);

					this.onPointlabelComplete(this.pointlabel);

					this.pointlabel = false;
				}
				break;
		}

	}

	WPGMZA.DrawingManager.prototype.onPointlabelComplete = function(pointlabel){
		var event = new WPGMZA.Event("pointlabelcomplete");
		event.enginePointlabel = pointlabel;
		this.dispatchEvent(event);
	}
	
});

// js/v8/embedded-media.js
/**
 * @namespace WPGMZA
 * @module EmbeddedMedia
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.EmbeddedMedia = function(element, container){
        if(!(element instanceof HTMLElement)){
            throw new Error("Element is not an instance of HTMLInputElement");
        }

        if(!(container instanceof HTMLElement)){
            throw new Error("Container is not an instance of HTMLInputElement");
        }

        const self = this;

        WPGMZA.EventDispatcher.apply(this);

        this.element = $(element);
        this.container = $(container);

        this.corners = [
            'southEast'
        ];

        this.handles = null;
        this.activeCorner = false;

        this.container.on('mousemove', function(event){
            self.onMoveHandle(event);
        });

        this.container.on('mouseup', function(event){
            if(self.activeCorner){
                self.onDeactivateHandle(self.activeCorner);
            }
        });

        this.container.on('mouseleave', function(event){
            if(self.activeCorner){
                self.onDeactivateHandle(self.activeCorner);
                self.onDetach();
            }
        });

        this.container.on('mousedown', function(event){
            self.onDetach();
        });
    }

    WPGMZA.extend(WPGMZA.EmbeddedMedia, WPGMZA.EventDispatcher);

    WPGMZA.EmbeddedMedia.createInstance = function(element, container) {
        return new WPGMZA.EmbeddedMedia(element, container);
    }

    WPGMZA.EmbeddedMedia.detatchAll = function(){
        let embedded = document.querySelectorAll('.wpgmza-embedded-media');
        for(let element of embedded){
            if(element.wpgmzaEmbeddedMedia){
                element.wpgmzaEmbeddedMedia.onDetach();
            }
        }

        $('.wpgmza-embedded-media').removeClass('selected');
        $('.wpgmza-embedded-media-handle').remove();
    }

    WPGMZA.EmbeddedMedia.prototype.onSelect = function(){
        this.element.addClass('selected');
        this.updateHandles();
    }

    WPGMZA.EmbeddedMedia.prototype.onDetach = function(){
        this.element.removeClass('selected');
        this.destroyHandles();

        this.container.trigger('media_resized');
    }

    WPGMZA.EmbeddedMedia.prototype.onActivateHandle = function(corner){
        this.activeCorner = corner;
    }

    WPGMZA.EmbeddedMedia.prototype.onDeactivateHandle = function(corner){
        this.activeCorner = false;

        this.updateHandles();
    }

    WPGMZA.EmbeddedMedia.prototype.onMoveHandle = function(event){
        if(this.activeCorner && this.handles[this.activeCorner]){
            const mouse = this.getMousePosition(event);
            if(this.handles[this.activeCorner].element){

                const anchor = this.getAnchorPosition();
                const maxTop = anchor.y + this.element.height();

                if(mouse.y > maxTop){
                    mouse.y = maxTop;
                }

                this.handles[this.activeCorner].element.css({
                    left : (mouse.x - 3) + "px",
                    top : (mouse.y - 3) + "px"
                });

                this.applyResize(mouse);
            }
        }
    }

    WPGMZA.EmbeddedMedia.prototype.createHandles = function(){
        if(!this.handles){
            this.handles = {}

            for(let corner of this.corners){
                this.handles[corner] = {
                    element : $('<div/>'),
                    mutating : false
                }

                this.handles[corner].element.addClass('wpgmza-embedded-media-handle');
                this.handles[corner].element.attr('data-corner', corner);


                this.container.append(this.handles[corner].element);

                this.bindHandle(corner);
            }



            // this.handles.bottomRight.
        }
    }

    WPGMZA.EmbeddedMedia.prototype.destroyHandles = function(){
        if(this.handles && this.handles instanceof Object){
            for(let i in this.handles){
                const handle = this.handles[i];
                if(handle.element){
                    handle.element.remove();
                }
            }

            this.handles = null;
        }
    }


    WPGMZA.EmbeddedMedia.prototype.updateHandles = function(){
        this.createHandles();
        const anchor = this.getAnchorPosition();

        if(this.handles && this.handles instanceof Object){
            for(let corner in this.handles){
                const handle = this.handles[corner].element;
                const position = {
                    top : 0,
                    left : 0
                };

                switch(corner){
                    case 'southEast':
                        position.left = anchor.x + this.element.width();
                        position.top = anchor.y + this.element.height();
                        break;
                }

                handle.css({
                    left : (position.left - 3) + "px",
                    top : (position.top - 3) + "px"
                });
            }
        }

    }

    WPGMZA.EmbeddedMedia.prototype.bindHandle = function(corner){
        const self = this;
        if(this.handles && this.handles[corner]){
            this.handles[corner].element.on('mousedown', function(event){
                event.preventDefault();
                event.stopPropagation();

                self.onActivateHandle(corner);
            });

            this.handles[corner].element.on('mouseup', function(event){
                event.preventDefault();
                event.stopPropagation();

                self.onDeactivateHandle(corner);
            });
        }
    }

    WPGMZA.EmbeddedMedia.prototype.applyResize = function(mouse){
        const anchor = this.getAnchorPosition();
        
        const padding = parseInt(this.container.css('padding').replace('px', ''));

        let maxWidth = Math.abs(mouse.x - anchor.x);
        maxWidth = this.clamp(padding, this.container.width() - padding, maxWidth);

        this.element.css('width', parseInt(maxWidth) + 'px');
        this.element.attr('width', parseInt(maxWidth));

        this.container.trigger('media_resized');
    }

    WPGMZA.EmbeddedMedia.prototype.getMousePosition = function(event){
        event = event.originalEvent ? event.originalEvent : event;
        const pos = {
            x : parseInt(event.pageX - this.container.offset().left),
            y : parseInt(event.pageY - this.container.offset().top)
        };

        const padding = parseInt(this.container.css('padding').replace('px', ''));

        pos.x = this.clamp(padding, this.container.width() - padding, pos.x);
        pos.y = this.clamp(padding, this.container.height() - padding, pos.y);

        return pos;
    }

    WPGMZA.EmbeddedMedia.prototype.getAnchorPosition = function(){
        const pos = {
            x : parseInt(this.element.offset().left - this.container.offset().left),
            y : parseInt(this.element.offset().top - this.container.offset().top)
        };

        return pos;
    }

    WPGMZA.EmbeddedMedia.prototype.clamp = function(min, max, value){
        if(isNaN(value)){
            value = 0;
        }
        return Math.min(Math.max(value, min), max);
    }

});

// js/v8/event.js
/**
 * @namespace WPGMZA
 * @module Event
 * @requires WPGMZA
 */ 
jQuery(function($) {
		
	/**
	 * Base class used for events (for non-HTMLElement objects)
	 * @class WPGMZA.Event
	 * @constructor WPGMZA.Event
	 * @memberof WPGMZA
	 * @param {string|object} options The event type as a string, or an object of options to be mapped to this event
	 */
	WPGMZA.Event = function(options)
	{
		if(typeof options == "string")
			this.type = options;
		
		this.bubbles		= true;
		this.cancelable		= true;
		this.phase			= WPGMZA.Event.PHASE_CAPTURE;
		this.target			= null;
		
		this._cancelled = false;
		
		if(typeof options == "object")
			for(var name in options)
				this[name] = options[name];
	}

	WPGMZA.Event.CAPTURING_PHASE		= 0;
	WPGMZA.Event.AT_TARGET				= 1;
	WPGMZA.Event.BUBBLING_PHASE			= 2;

	/**
	 * Prevents any further propagation of this event
	 * @method
	 * @memberof WPGMZA.Event
	 */
	WPGMZA.Event.prototype.stopPropagation = function()
	{
		this._cancelled = true;
	}
	
});

// js/v8/fancy-controls.js
/**
 * @namespace WPGMZA
 * @module FancyControls
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.FancyControls = {
		
		formatToggleSwitch: function(el)
		{
			var div			= $("<div class='switch'></div>");
			var input		= el;
			var container	= el.parentNode;
			var text		= $(container).text().trim();
			var label		= $("<label></label>");
			
			$(input).addClass("cmn-toggle cmn-toggle-round-flat");
			$(input).attr("id", $(input).attr("name"));
			
			$(label).attr("for", $(input).attr("name"));
			
			$(div).append(input);
			$(div).append(label);
			
			$(container).replaceWith(div);
			
			$(div).wrap($("<div></div>"));
			$(div).after(text);
		},
		
		formatToggleButton: function(el)
		{
			var div			= $("<div class='switch'></div>");
			var input		= el;
			var container	= el.parentNode;
			var text		= $(container).text().trim();
			var label		= $("<label></label>");
			
			$(input).addClass("cmn-toggle cmn-toggle-yes-no");
			$(input).attr("id", $(input).attr("name"));
			
			$(label).attr("for", $(input).attr("name"));
			
			$(label).attr("data-on", WPGMZA.localized_strings.yes);
			$(label).attr("data-off", WPGMZA.localized_strings.no);
			
			$(div).append(input);
			$(div).append(label);
			
			$(container).replaceWith(div);
			
			$(div).wrap($("<div></div>"));
			$(div).after(text);
		}
		
	};
	
	$(".wpgmza-fancy-toggle-switch").each(function(index, el) {
		WPGMZA.FancyControls.formatToggleSwitch(el);
	});
	
	$(".wpgmza-fancy-toggle-button").each(function(index, el) {
		WPGMZA.FancyControls.formatToggleButton(el);
	});
	
});

// js/v8/feature.js
/**
 * @namespace WPGMZA
 * @module Feature
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Base class for featuers (formerlly MapObjects), that is, markers, polygons, polylines, circles, rectangles and heatmaps. Implements functionality shared by all map objects, such as parsing geometry and serialization.
	 * @class WPGMZA.Feature
	 * @constructor WPGMZA.Feature
	 * @memberof WPGMZA
	 * @augments WPGMZA.EventDispatcher
	 */
	WPGMZA.Feature = function(options)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Feature");
		
		WPGMZA.EventDispatcher.call(this);
		
		this.id = -1;

		for(var key in options)
			this[key] = options[key];
	}
	
	WPGMZA.extend(WPGMZA.Feature, WPGMZA.EventDispatcher);
	
	// NB: Legacy compatibility
	WPGMZA.MapObject = WPGMZA.Feature;
	
	/**
	 * Scans a string for all floating point numbers and build an array of latitude and longitude literals from the matched numbers
	 * @method
	 * @memberof WPGMZA.Feature
	 * @param {string} string The string to parse numbers from
	 * @return {array} An array of LatLng literals parsed from the string
	 */
	WPGMZA.Feature.prototype.parseGeometry = function(subject)
	{
		// TODO: Rename "subject" to "subject". It's unclear right now
		
		if(typeof subject == "string" && subject.match(/^\[/))
		{
			try{
				
				var json = JSON.parse(subject);
				subject = json;
				
			}catch(e) {
				// Continue execution
			}
		}
		
		if(typeof subject == "object")
		{
			var arr = subject;
			
			for(var i = 0; i < arr.length; i++)
			{
				arr[i].lat = parseFloat(arr[i].lat);
				arr[i].lng = parseFloat(arr[i].lng);
			}
			
			return arr;
		}
		else if(typeof subject == "string")
		{
			// Guessing old format
			var stripped, pairs, coords, results = [];
			
			stripped = subject.replace(/[^ ,\d\.\-+e]/g, "");
			pairs = stripped.split(",");
			
			for(var i = 0; i < pairs.length; i++)
			{
				coords = pairs[i].split(" ");
				results.push({
					lat: parseFloat(coords[1]),
					lng: parseFloat(coords[0])
				});
			}
			
			return results;
		}
		
		throw new Error("Invalid geometry");
	}
	
	WPGMZA.Feature.prototype.setOptions = function(options)
	{
		for(var key in options)
			this[key] = options[key];


		this.updateNativeFeature();
	}
	
	WPGMZA.Feature.prototype.setEditable = function(editable)
	{
		this.setOptions({
			editable: editable
		});
	}
	
	WPGMZA.Feature.prototype.setDraggable = function(draggable)
	{
		this.setOptions({
			draggable: draggable
		});
		
		// this.layer.setVisible(visible ? true : false);
	}
	
	WPGMZA.Feature.prototype.getScalarProperties = function()
	{
		var options = {};
		
		for(var key in this)
		{
			switch(typeof this[key])
			{
				case "number":
					options[key] = parseFloat(this[key]);
					break;
				
				case "boolean":
				case "string":
					options[key] = this[key];
					break;
					
				default:
					break;
			}
		}
		
		return options;
	}
	
	WPGMZA.Feature.prototype.updateNativeFeature = function()
	{
		// NB: Because we don't have different base classes for GoogleFeature and OLFeature*, it's necessary to have an if/else here. This design pattern should be avoided wherever possible. Prefer adding engine specific code on the OL / Google modules.
		// * - OLFeature is actually a class, but nothing extends from it. It's purely provided as a utility.
		
		var props = this.getScalarProperties();
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
			
				// The native properties (strokeColor, fillOpacity, etc) have to be translated for OpenLayers.
				if(this.layer){
					this.layer.setStyle(WPGMZA.OLFeature.getOLStyle(props));
				}
				break;
			
			default:
			
				// For Google, because the native properties share the same name as the Google properties, we can just pass them straight in
				
				this.googleFeature.setOptions(props);
			
				break;
		}
	}
	
});

// js/v8/friendly-error.js
/**
 * @namespace WPGMZA
 * @module FriendlyError
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Deprecated
	 * @class WPGMZA.FriendlyError
	 * @constructor WPGMZA.FriendlyError
	 * @memberof WPGMZA
	 * @deprecated
	 */
	WPGMZA.FriendlyError = function()
	{
		
	}
	
	/*var template = '\
		<div class="notice notice-error"> \
			<p> \
			' + WPGMZA.localized_strings.friendly_error + ' \
			</p> \
			<pre style="white-space: pre-line;"></pre> \
		<div> \
		';
	
	WPGMZA.FriendlyError = function(nativeError)
	{
		if(!WPGMZA.is_admin)
		{
			this.element = $(WPGMZA.preloaderHTML);
			$(this.element).removeClass("animated");
			return;
		}
		
		$("#wpgmza-map-edit-page>.wpgmza-preloader").remove();
		
		this.element = $(template);
		this.element.find("pre").html(nativeError.message + "\r\n" + nativeError.stack + "\r\n\r\n on " + window.location.href);
	}*/
	
});

// js/v8/generic-modal.js
/**
 * @namespace WPGMZA
 * @module GenericModal
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.GenericModal = function(element, complete, cancel){
        this.element = $(element);

        this._onComplete = complete ? complete : false;
        this._onCancel = cancel ? cancel : false;

        this.bindEvents();
    }

    WPGMZA.extend(WPGMZA.GenericModal, WPGMZA.EventDispatcher);

    WPGMZA.GenericModal.createInstance = function(element, complete, cancel) {
        if(WPGMZA.isProVersion()){
            return new WPGMZA.ProGenericModal(element, complete, cancel);
        }
        return new WPGMZA.GenericModal(element, complete, cancel);
    }

    WPGMZA.GenericModal.prototype.bindEvents = function(){
        const self = this;
        this.element.on('click', '.wpgmza-button', function(){
            const action = $(this).data('action');
            if(action === 'complete'){
                self.onComplete();
            } else {
                self.onCancel();
            }
        });
    }

    WPGMZA.GenericModal.prototype.getData = function(){
        const data = {};
        this.element.find('input,select').each(function(){
            if($(this).data('ajax-name')){
                data[$(this).data('ajax-name')] = $(this).val();
            }
        });

        return data;
    }

    WPGMZA.GenericModal.prototype.onComplete = function(){
        this.hide();
        if(typeof this._onComplete === 'function'){
            this._onComplete(this.getData());
        }
    }

    WPGMZA.GenericModal.prototype.onCancel = function(){
        this.hide();
        if(typeof this._onCancel === 'function'){
            this._onCancel();
        }
    }

    WPGMZA.GenericModal.prototype.show = function(complete, cancel){
        /* Support hotswapping */
        this._onComplete = complete ? complete : this._onComplete;
        this._onCancel = cancel ? cancel : this._onCancel;

        this.element.addClass('pending');
    }

    WPGMZA.GenericModal.prototype.hide = function(){
        this.element.removeClass('pending');
    }


});

// js/v8/geocoder.js
/**
 * @namespace WPGMZA
 * @module Geocoder
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Base class for geocoders. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Geocoder
	 * @constructor WPGMZA.Geocoder
	 * @memberof WPGMZA
	 * @see WPGMZA.Geocoder.createInstance
	 */
	WPGMZA.Geocoder = function()
	{
		WPGMZA.assertInstanceOf(this, "Geocoder");
	}
	
	/**
	 * Indicates a successful geocode, with one or more results
	 * @constant SUCCESS
	 * @memberof WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.SUCCESS			= "success";
	
	/**
	 * Indicates the geocode was successful, but returned no results
	 * @constant ZERO_RESULTS
	 * @memberof WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.ZERO_RESULTS	= "zero-results";
	
	/**
	 * Indicates the geocode failed, usually due to technical reasons (eg connectivity)
	 * @constant FAIL
	 * @memberof WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.FAIL			= "fail";
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Geocoder.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return WPGMZA.OLGeocoder;
				break;
				
			default:
				return WPGMZA.GoogleGeocoder;
				break;
		}
	}
	
	/**
	 * Creates an instance of a Geocoder, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @return {WPGMZA.Geocoder} A subclass of WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.createInstance = function()
	{
		var constructor = WPGMZA.Geocoder.getConstructor();
		return new constructor();
	}
	
	/**
	 * Attempts to convert a street address to an array of potential coordinates that match the address, which are passed to a callback. If the address is interpreted as a latitude and longitude coordinate pair, the callback is immediately fired.
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @param {object} options The options to geocode, address is mandatory.
	 * @param {function} callback The callback to receive the geocode result.
	 * @return {void}
	 */
	WPGMZA.Geocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(WPGMZA.isLatLngString(options.address))
		{
			var parts = options.address.split(/,\s*/);
			var latLng = new WPGMZA.LatLng({
				lat: parseFloat(parts[0]),
				lng: parseFloat(parts[1])
			});
			
			// NB: Quick fix, solves issue with right click marker. Solve this there by making behaviour consistent
			latLng.latLng = latLng;
			
			callback([latLng], WPGMZA.Geocoder.SUCCESS);
		}
	}
	
	/**
	 * Attempts to convert latitude eand longitude coordinates into a street address. By default this will simply return the coordinates wrapped in an array.
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @param {object} options The options to geocode, latLng is mandatory.
	 * @param {function} callback The callback to receive the geocode result.
	 * @return {void}
	 */
	WPGMZA.Geocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		var latLng = new WPGMZA.LatLng(options.latLng);
		callback([latLng.toString()], WPGMZA.Geocoder.SUCCESS);
	}
	
	/**
	 * Geocodes either an address or a latitude and longitude coordinate pair, depending on the input
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @param {object} options The options to geocode, you must supply <em>either</em> latLng <em>or</em> address.
	 * @throws You must supply either a latLng or address
	 * @return {void}
	 */
	WPGMZA.Geocoder.prototype.geocode = function(options, callback)
	{
		if("address" in options)
			return this.getLatLngFromAddress(options, callback);
		else if("latLng" in options)
			return this.getAddressFromLatLng(options, callback);
		
		throw new Error("You must supply either a latLng or address");
	}
	
});

// js/v8/google-api-error-handler.js
/**
 * @namespace WPGMZA
 * @module GoogleAPIErrorHandler
 * @requires WPGMZA
 */
jQuery(function($) { 

	/**
	 * This class catches Google Maps API errors and presents them in a friendly manner, before sending them on to the consoles default error handler.
	 * @class WPGMZA.GoogleAPIErrorHandler
	 * @constructor WPGMZA.GoogleAPIErrorHandler
	 * @memberof WPGMZA
	 */
	WPGMZA.GoogleAPIErrorHandler = function() {
		
		var self = this;
		
		// Don't do anything if Google isn't the selected API
		if(WPGMZA.settings.engine != "google-maps")
			return;
		
		// Only allow on the map edit page, or front end if user has administrator role
		if(!(WPGMZA.currentPage == "map-edit" || (WPGMZA.is_admin == 0 && WPGMZA.userCanAdministrator == 1)))
			return;
		
		this.element = $(WPGMZA.html.googleMapsAPIErrorDialog);
		
		if(WPGMZA.is_admin == 1)
			this.element.find(".wpgmza-front-end-only").remove();
		
		this.errorMessageList = this.element.find(".wpgmza-google-api-error-list");
		this.templateListItem = this.element.find("li.template").remove();
		
		this.messagesAlreadyDisplayed = {};
		
		//if(WPGMZA.settings.developer_mode)
			//return;
		
		// Override error function
		var _error = console.error;
		
		console.error = function(message)
		{
			self.onErrorMessage(message);
			
			_error.apply(this, arguments);
		}
		
		// Check for no API key
		if(
			WPGMZA.settings.engine == "google-maps" 
			&& 
			(!WPGMZA.settings.wpgmza_google_maps_api_key || !WPGMZA.settings.wpgmza_google_maps_api_key.length)
			&&
			WPGMZA.getCurrentPage() != WPGMZA.PAGE_MAP_EDIT
			)
			this.addErrorMessage(WPGMZA.localized_strings.no_google_maps_api_key, ["https://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/"]);
	}
	
	/**
	 * Overrides console.error to scan the error message for Google Maps API error messages.
	 * @method 
	 * @memberof WPGMZA.GoogleAPIErrorHandler
	 * @param {string} message The error message passed to the console
	 */
	WPGMZA.GoogleAPIErrorHandler.prototype.onErrorMessage = function(message)
	{
		var m;
		var regexURL = /http(s)?:\/\/[^\s]+/gm;
		
		if(!message)
			return;
		
		if((m = message.match(/You have exceeded your (daily )?request quota for this API/)) || (m = message.match(/This API project is not authorized to use this API/)) || (m = message.match(/^Geocoding Service: .+/)))
		{
			var urls = message.match(regexURL);
			this.addErrorMessage(m[0], urls);
		}
		else if(m = message.match(/^Google Maps.+error: (.+)\s+(http(s?):\/\/.+)/m))
		{
			this.addErrorMessage(m[1].replace(/([A-Z])/g, " $1"), [m[2]]);
		}
	}
	
	/**
	 * Called by onErrorMessage when a Google Maps API error is picked up, this will add the specified message to the Maps API error message dialog, along with URLs to compliment it. This function ignores duplicate error messages.
	 * @method
	 * @memberof WPGMZA.GoogleAPIErrorHandler
	 * @param {string} message The message, or part of the message, intercepted from the console
	 * @param {array} [urls] An array of URLs relating to the error message to compliment the message.
	 */
	WPGMZA.GoogleAPIErrorHandler.prototype.addErrorMessage = function(message, urls)
	{
		var self = this;
		
		if(this.messagesAlreadyDisplayed[message])
			return;
		
		var li = this.templateListItem.clone();
		$(li).find(".wpgmza-message").html(message);
		
		var buttonContainer = $(li).find(".wpgmza-documentation-buttons");
		
		var buttonTemplate = $(li).find(".wpgmza-documentation-buttons>a");
		buttonTemplate.remove();
		
		if(urls && urls.length)
		{
			for(var i = 0; i < urls.length; i++)
			{
				var url = urls[i];
				var button = buttonTemplate.clone();
				var icon = "fa-external-link";
				var text = WPGMZA.localized_strings.documentation;
				
				button.attr("href", urls[i]);
				
				/*if(url.match(/google.+documentation/))
				{
					// icon = "fa-google";
					icon = "fa-wrench"
				}
				else if(url.match(/maps-no-account/))
				{
					icon = "fa-wrench"
					text = WPGMZA.localized_strings.verify_project;
				}
				else if(url.match(/console\.developers\.google/))
				{
					icon = "fa-wrench";
					text = WPGMZA.localized_strings.api_dashboard;
				}*/
				
				$(button).find("i").addClass(icon);
				$(button).append(text);
			}
			
			buttonContainer.append(button);
		}
		
		$(this.errorMessageList).append(li);
		
		/*if(!this.dialog)
			this.dialog = $(this.element).remodal();
		
		switch(this.dialog.getState())
		{
			case "open":
			case "opened":
			case "opening":
				break;
				
			default:
				this.dialog.open();
				break;
		}*/
		
		$("#wpgmza_map, .wpgmza_map").each(function(index, el) {
			
			var container = $(el).find(".wpgmza-google-maps-api-error-overlay");

			if(container.length == 0)
			{
				container = $("<div class='wpgmza-google-maps-api-error-overlay'></div>");
				container.html(self.element.html());
			}
			
			setTimeout(function() {
				$(el).append(container);
			}, 1000);
		});
		
		$(".gm-err-container").parent().css({"z-index": 1});
		
		this.messagesAlreadyDisplayed[message] = true;
	}
	
	WPGMZA.googleAPIErrorHandler = new WPGMZA.GoogleAPIErrorHandler();

});

// js/v8/info-window.js
/**
 * @namespace WPGMZA
 * @module InfoWindow
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Base class for infoWindows. This acts as an abstract class so that infoWindows for both Google and OpenLayers can be interacted with seamlessly by the overlying logic. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.InfoWindow
	 * @constructor WPGMZA.InfoWindow
	 * @memberof WPGMZA
	 * @see WPGMZA.InfoWindow.createInstance
	 */
	WPGMZA.InfoWindow = function(feature) {
		var self = this;


		
		WPGMZA.EventDispatcher.call(this);
		
		WPGMZA.assertInstanceOf(this, "InfoWindow");
		
		this.on("infowindowopen", function(event) {
			self.onOpen(event);
		});
		
		if(!feature)
			return;
		
		this.feature = feature;
		this.state = WPGMZA.InfoWindow.STATE_CLOSED;
		
		if(feature.map)
		{
			// This has to be slightly delayed so the map initialization won't overwrite the infowindow element
			setTimeout(function() {
				self.onFeatureAdded(event);
			}, 100);
		}
		else
			feature.addEventListener("added", function(event) { 
				self.onFeatureAdded(event);
			});		
	}

	
	
	WPGMZA.InfoWindow.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.InfoWindow.prototype.constructor = WPGMZA.InfoWindow;
	
	WPGMZA.InfoWindow.OPEN_BY_CLICK = 1;
	WPGMZA.InfoWindow.OPEN_BY_HOVER = 2;
	
	WPGMZA.InfoWindow.STATE_OPEN	= "open";
	WPGMZA.InfoWindow.STATE_CLOSED	= "closed";
	
	/**
	 * Fetches the constructor to be used by createInstance, based on the selected maps engine
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return {function} The appropriate constructor
	 */
	WPGMZA.InfoWindow.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProInfoWindow;
				return WPGMZA.OLInfoWindow;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProInfoWindow;
				return WPGMZA.GoogleInfoWindow;
				break;
		}
	}
	
	/**
	 * Creates an instance of an InfoWindow, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.InfoWindow.createInstance = function(feature)
	{
		var constructor = this.getConstructor();
		return new constructor(feature);
	}
	
	Object.defineProperty(WPGMZA.InfoWindow.prototype, "content", {
		
		"get": function()
		{
			return this.getContent();
		},

		"set": function(value)
		{
			this.contentHtml = value;
		}
	});
	
	
	WPGMZA.InfoWindow.prototype.addEditButton = function() {
		if (WPGMZA.currentPage == "map-edit") {
			if(this.feature instanceof WPGMZA.Marker){
				return ' <a title="Edit this marker" style="width:15px;" class="wpgmza_edit_btn" data-edit-marker-id="'+this.feature.id+'"><i class="fa fa-edit"></i></a>';	
			}
		}
		return '';

	}

	WPGMZA.InfoWindow.prototype.workOutDistanceBetweenTwoMarkers = function(location1, location2) {
		if(!location1 || !location2)
			return; // No location (no search performed, user location unavailable)
		
		var distanceInKM = WPGMZA.Distance.between(location1, location2);
		var distanceToDisplay = distanceInKM;
			
		if(this.distanceUnits == WPGMZA.Distance.MILES)
			distanceToDisplay /= WPGMZA.Distance.KILOMETERS_PER_MILE;
		
		var text = Math.round(distanceToDisplay, 2);
		
		return text;
	}


	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.getContent = function(callback) {
		var html = "";
		var extra_html = "";

		if (this.feature instanceof WPGMZA.Marker) {
			// Store locator distance away
			// added by Nick 2020-01-12
			if (this.feature.map.settings.store_locator_show_distance && this.feature.map.storeLocator && (this.feature.map.storeLocator.state == WPGMZA.StoreLocator.STATE_APPLIED)) {
				var currentLatLng = this.feature.getPosition();
				var distance = this.workOutDistanceBetweenTwoMarkers(this.feature.map.storeLocator.center, currentLatLng);

				extra_html += "<p>"+(this.feature.map.settings.store_locator_distance == WPGMZA.Distance.KILOMETERS ? distance + WPGMZA.localized_strings.kilometers_away : distance + " " + WPGMZA.localized_strings.miles_away)+"</p>";	
			} 

			html = this.feature.address+extra_html;
		}
		
		if (this.contentHtml){
			html = this.contentHtml;
		}


		if(callback)
			callback(html);
		
		return html;
	}
	
	/**
	 * Opens the info window on the specified map, with the specified map object as the subject.
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {WPGMZA.Map} map The map to open this InfoWindow on.
	 * @param {WPGMZA.Feature} feature The map object (eg marker, polygon) to open this InfoWindow on.
	 * @return boolean FALSE if the info window should not and will not open, TRUE if it will. This can be used by subclasses to establish whether or not the subclassed open should bail or open the window.
	 */
	WPGMZA.InfoWindow.prototype.open = function(map, feature) {
		var self = this;
		
		this.feature = feature;
		
		if(WPGMZA.settings.disable_infowindows || WPGMZA.settings.wpgmza_settings_disable_infowindows == "1")
			return false;
		
		if(this.feature.disableInfoWindow)
			return false;
		
		this.state = WPGMZA.InfoWindow.STATE_OPEN;
		
		return true;
	}
	
	/**
	 * Abstract function, closes this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.close = function()
	{
		if(this.state == WPGMZA.InfoWindow.STATE_CLOSED)
			return;
		
		this.state = WPGMZA.InfoWindow.STATE_CLOSED;
		this.trigger("infowindowclose");
	}
	
	/**
	 * Abstract function, sets the content in this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.setContent = function(options)
	{
		
	}
	
	/**
	 * Abstract function, sets options on this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.setOptions = function(options)
	{
		
	}
	
	/**
	 * Event listener for when the map object is added. This will cause the info window to open if the map object has infoopen set
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.onFeatureAdded = function()
	{
		if(this.feature.settings.infoopen == 1)
			this.open();
	}
	
	WPGMZA.InfoWindow.prototype.onOpen = function()
	{
		
	}
	
});


// js/v8/installer.js
/**
 * @namespace WPGMZA
 * @module Installer
 * @requires WPGMZA.EventDispatcher
 */


jQuery(function($) {
	/*
	 * General note on this code:
	 * - This is messy at the moment, although modular, it needs to be restructured a bit later on
	*/
	if(WPGMZA.currentPage != "installer")
		return;

	WPGMZA.Installer = function(){
		var self = this;

        WPGMZA.EventDispatcher.apply(this);

		this.element = $(document.body).find('.wpgmza-installer-steps');
		this.skipButton = $(document.body).find('.wpgmza-installer-skip');

		if(this.element.length <= 0){
			return;
		}

		this.redirectUrl = this.element.data('redirect');

		this.declineAssistedSkip = false;
		this.step = 0;
		this.max = 0;
		this.findMax();

		

		$(this.element).on('click', '.next-step-button', function(event){
			self.next();
		});

		$(this.element).on('click', '.prev-step-button', function(event){
			self.prev();
		});

		$(this.element).on('click', '.sub-step-trigger', function(event){
			self.triggerSubStep($(this));
		});

		$(this.element).on('change', 'input[name="wpgmza_maps_engine"]', function(event){
			self.setEngine($(this).val());
		});

		$(this.element).on('keyup change', 'input[name="api_key"]', function(event){
			self.setApiKey($(this).val());
		});

		$(this.element).on('change', 'select[name="tile_server_url"]', function(event){
			self.setTileServer($(this).val());
		});

		$(this.element).on('click', '.google-maps-auto-key-form-wrapper .wpgmza-button', function(event){
			self.getAutoKey();
		});

		$(this.element).on('click', '.assisted-setup-button', function(event){
			self.assistedSetupIntent($(this));
		});

		$(this.element).on('click', '.launcher-trigger', function(event){
			const launcher = $(this).data('launcher');
			if(launcher){
				switch(launcher){
					case 'google-maps-quick-start-launcher':
						self.launchQuickStart();
						break;
				}
			}
		});

		this.skipButton.on('click', function(event){
			event.preventDefault();
			self.skip();
		});

		let defaultEngine = (WPGMZA && WPGMZA.settings && WPGMZA.settings.engine) ? WPGMZA.settings.engine : 'google-maps';
		$(this.element).find('input[name="wpgmza_maps_engine"][value="' + defaultEngine + '"]').prop('checked', true).trigger('change');

		let currentApiKey = (WPGMZA && WPGMZA.settings && WPGMZA.settings.googleMapsApiKey) ? WPGMZA.settings.googleMapsApiKey : '';
		this.element.find('input[name="api_key"]').val(currentApiKey).trigger('change');

		this.trigger('init.installer.admin');
		this.loadStep(this.step);

		this.checkAutoSkip();
	}

	WPGMZA.extend(WPGMZA.Installer, WPGMZA.EventDispatcher);

	WPGMZA.Installer.NODE_SERVER = "https://wpgmaps.us-3.evennode.com/api/v1/";

	WPGMZA.Installer.createInstance = function(){
		return new WPGMZA.Installer();
	}

	WPGMZA.Installer.prototype.findMax = function(){
		var self = this;
		$(this.element).find('.step').each(function(){
			if(parseInt($(this).data('step')) > self.max){
				self.max = parseInt($(this).data('step'));
			}
		});
	}

	WPGMZA.Installer.prototype.prepareAddressFields = function(){
		$(this.element).find("input.wpgmza-address").each(function(index, el) {
			el.addressInput = WPGMZA.AddressInput.createInstance(el, null);
		});
	}

	WPGMZA.Installer.prototype.next = function(){
		if(this.step < this.max){
			this.loadStep(this.step + 1);
		} else {
			this.complete();
		}
	}

	WPGMZA.Installer.prototype.prev = function(){
		if(this.step > 0){
			this.loadStep(this.step - 1);
		}
	}

	WPGMZA.Installer.prototype.loadStep = function(index){
		this.loadSubSteps(index);

		$(this.element).find('.step').removeClass('active');
		$(this.element).find('.step[data-step="' + index + '"]').addClass('active');

		this.step = index;

		if(this.step === 0){
			$(this.element).find('.prev-step-button').addClass('wpgmza-hidden');
		} else {
			$(this.element).find('.prev-step-button').removeClass('wpgmza-hidden');
		}

		if(this.step === this.max){
			$(this.element).find('.next-step-button span').text($(this.element).find('.next-step-button').data('final'));
		} else {
			$(this.element).find('.next-step-button span').text($(this.element).find('.next-step-button').data('next'));
		}

		this.autoFocus();

		this.applyStepConditionState();

		$(window).scrollTop(0);

		this.trigger('step.installer.admin');
	}

	WPGMZA.Installer.prototype.loadSubSteps = function(index){
		const stepWrapper = $(this.element).find('.step[data-step="' + index + '"]');
		if(stepWrapper.find('.sub-step-container').length){
			stepWrapper.find('.sub-step').addClass('wpgmza-hidden');
			stepWrapper.find('.sub-step-container').removeClass('wpgmza-hidden');
		}	
	}

	WPGMZA.Installer.prototype.triggerSubStep = function(context){
		const stepWrapper = $(this.element).find('.step[data-step="' + this.step + '"]');
		if(stepWrapper.find('.sub-step-container').length){
			const target = context.data('sub-step');

			if(stepWrapper.find('.sub-step[data-sub-step="' + target + '"]').length){
				stepWrapper.find('.sub-step-container').addClass('wpgmza-hidden');
				stepWrapper.find('.sub-step').addClass('wpgmza-hidden');
				stepWrapper.find('.sub-step[data-sub-step="' + target + '"]').removeClass('wpgmza-hidden');

				if(target === 'google-maps-auto-key'){
					/* We should auto fetch the users location, this helps the onboarding flow substantially */
					try {
						const self = this;
						WPGMZA.getCurrentPosition(function(data){
						    if(data.coords){
						    	const coords = data.coords;
							    
							    $('.google-maps-auto-key-form-wrapper input[name="address"]').attr('placeholder', 'Fetching...');
							    if(coords.latitude && coords.longitude){
							    	const geocoder = WPGMZA.Geocoder.createInstance();

							    	geocoder.getAddressFromLatLng({ latLng : new WPGMZA.LatLng({lat : coords.latitude, lng : coords.longitude}) },
							    		function(address){
							    			$('.google-maps-auto-key-form-wrapper input[name="address"]').attr('placeholder', '');
							    			
							    			if(address){
							    				$('.google-maps-auto-key-form-wrapper input[name="address"]').val(address);
							    			}
							    		}
							    	)
							    } else {
							    	$('.google-maps-auto-key-form-wrapper input[name="address"]').attr('placeholder', '');
							    }
						    }
						});

						if($('.google-maps-auto-key-form-wrapper input[name="site_url"]').val().trim().length <= 0){
							var domain = window.location.hostname;
				            if(domain === 'localhost'){
				            	try{
				            		var paths = window.location.pathname.match(/\/(.*?)\//);
				            		if(paths && paths.length >= 2 && paths[1]){
				            			var path = paths[1];
				            			domain += "-" + path
				            		}
				            	} catch (ex){
				            		/* Leave it alone */
				            	}
				            }

				            $('.google-maps-auto-key-form-wrapper input[name="site_url"]').val(domain);
				            $('.google-maps-auto-key-form-wrapper input[name="site_url"]').attr('data-predicted-domain', domain);
						}
					} catch (ex) {
						/* No need to do anything */
					}
				}
			}
		}
		
	}

	WPGMZA.Installer.prototype.getActiveBlock = function(){
		return $(this.element).find('.step[data-step="' + this.step + '"]');
	}

	WPGMZA.Installer.prototype.autoFocus = function(){
		var block = this.getActiveBlock();
		if(block){
			if(block.find('input').length > 0){
				block.find('input')[0].focus();
			} else if(block.find('select').length > 0){
				block.find('select')[0].focus();
			} 
		}
	}

	WPGMZA.Installer.prototype.complete = function(){
		$(this.element).find('.step').removeClass('active');
		$(this.element).find('.step-controller').addClass('wpgmza-hidden');
		$(this.element).find('.step-loader').removeClass('wpgmza-hidden');

		$(this.element).find('.step-loader .progress-finish').removeClass('wpgmza-hidden');

		this.saveOptions();
	}

	WPGMZA.Installer.prototype.getData = function(){
		var data = {};

        $(this.element).find('.step').each(function(){
        	$(this).find('input,select').each(function(){
        		var name = $(this).attr('name');
        		if(name && name.trim() !== ""){
        			var value = $(this).val();
        			if(value.trim() !== ""){
        				data[name.trim()] = value.trim();
        			}
        		}
        	});
        });

        return data;

	}

	WPGMZA.Installer.prototype.setEngine = function(engine){
		this.engine = engine;
		$(this.element).attr('data-engine', engine);
	}

	WPGMZA.Installer.prototype.setApiKey = function(apiKey){
		this.apiKey = apiKey.trim();
		this.applyStepConditionState();
	}

	WPGMZA.Installer.prototype.setTileServer = function(server) {
		this.tileServer = server;

		let previewLink = server;
		previewLink = previewLink.replace("{a-c}", "a");
		previewLink = previewLink.replace("{z}/{x}/{y}", "7/20/49");

		$(this.element).find('.open_layers_sample_tile').attr('src', previewLink);
	}

	WPGMZA.Installer.prototype.applyStepConditionState = function(){
		const stepWrapper = this.getActiveBlock();
		const condition = stepWrapper.data('conditional');
		const continueButton = $(this.element).find('.next-step-button');
		
		if(condition){
			if(this.hasSatisfiedStepCondition(condition)){
				continueButton.removeClass('wpgmza-hidden');
			} else {
				continueButton.addClass('wpgmza-hidden');
			}
		} else {
			continueButton.removeClass('wpgmza-hidden');
		}
	}

	WPGMZA.Installer.prototype.hasSatisfiedStepCondition = function(condition){
		let satisfied = false;
		switch(condition){
			case 'engine-set-up':
				satisfied = (this.engine && this.engine === 'google-maps') ? (this.apiKey ? true : false) : true 
				break;
		}

		return satisfied;
	}

	WPGMZA.Installer.prototype.getAutoKey = function(){
		/* Not being deployed, meaning managed keys cannot be created */
		/* Instead quick start was introduced */
		return false;

		const self = this;
		const formData = this.getData();
		
		const fields = {
			site_name : false,
			site_url : false,
			user_email : false,
			address : false
		};

		/** 
		 * If the system has required the user to do additional manual entry, 
		 * lets force that here
		*/
		$('.google-maps-auto-key-form-wrapper .optional-sub-field').each(function(){
			if(!$(this).hasClass('wpgmza-hidden')){
				const forField = $(this).data('field');
				fields[forField] = false;
			}
		});

		this.hideAutoKeyError();

		for(let i in formData){
			let value = formData[i];
			if(typeof fields[i] !== 'undefined'){
				fields[i] = value;
			}
		}

		let hasRequiredFields = true;
		for(let i in fields){
			if(!fields[i]){
				hasRequiredFields = false;
				$('.google-maps-auto-key-form-wrapper input[name="' + i + '"]').focus();
			}
		}

		if(hasRequiredFields){
			$(this.element).find('.step').removeClass('active');
			$(this.element).find('.step-controller').addClass('wpgmza-hidden');
			$(this.element).find('.step-loader').removeClass('wpgmza-hidden');
			$(this.element).find('.step-loader .progress-busy').removeClass('wpgmza-hidden');


			$.post(WPGMZA.Installer.NODE_SERVER + 'create-managed-account', fields, function(response) {

				if(response instanceof Object){
					if(response.success && response.apikey){
						$(self.element).find('input[name="api_key"]').val(response.apikey).trigger('change');
						self.next();
					} else {
						if(response.error){
							if(response.error_code){
								if(response.error_code === "invalidField"){
									/* One or more fields are invalid, we need to relay this to the end user */
									if(response.error_field){
										if(response.error_field === "postal_code" || response.error_field === "region_code"){
											self.showAutoKeyError(response.error_field.replace('_', ''));

											if($('.google-maps-auto-key-form-wrapper .optional-sub-field[data-field="' + response.error_field + '"]').length){
												$('.google-maps-auto-key-form-wrapper .optional-sub-field[data-field="' + response.error_field + '"]').removeClass('wpgmza-hidden');
											}
										} else {
											self.showAutoKeyError('missing-fields');
										}
									} else {
										self.showAutoKeyError('missing-fields');
									}
								} else if(response.error_code === 'alreadyExists'){
									self.showAutoKeyError('already-exists');

									const nameField = $('.google-maps-auto-key-form-wrapper input[name="site_name"]');
									let siteName = nameField.val();

									if(siteName.length > 14){
										siteName = siteName.substring(0, 14);
									}

									const rands = [];
									for(let i = 0; i < 4; i++){
										rands.push(parseInt(Math.random() * 9));
									}

									siteName += " " + rands.join("");

									nameField.val(siteName);
									nameField.trigger('change');
									nameField.focus();
								} else {
									self.showAutoKeyError(response.error);
								}
							} else {
								self.showAutoKeyError(response.error);
							}
						} else {
							/* Show generic error? */
							self.showAutoKeyError('generic');
						}
					}
				}

				self.getActiveBlock().addClass('active');
				$(self.element).find('.step-controller').removeClass('wpgmza-hidden');
				$(self.element).find('.step-loader').addClass('wpgmza-hidden');
				$(self.element).find('.step-loader .progress-busy').addClass('wpgmza-hidden');

			});
		} else {
			this.showAutoKeyError('missing-fields');
		}
	}

	WPGMZA.Installer.prototype.launchQuickStart = function(){
		const popupDimensions = {
			width : 570,
			height : 700
		};

		popupDimensions.left = (screen.width - popupDimensions.width) / 2;
		popupDimensions.top = (screen.height - popupDimensions.height) / 2;

		if($('#adminmenuwrap').length){
			popupDimensions.left += $('#adminmenuwrap').width() / 2;
		}

		const title = "WP Go Maps - Create API Key";
		const url = "https://console.cloud.google.com/google/maps-hosted";
		
		let attributes = [];
		attributes.push("resizable=yes");
		attributes.push("width=" + popupDimensions.width);
		attributes.push("height=" + popupDimensions.height);
		attributes.push("left=" + popupDimensions.left);
		attributes.push("top=" + popupDimensions.top);
		attributes = attributes.join(",");

    	window.open(url, title, attributes);
	}

	WPGMZA.Installer.prototype.saveOptions = function(){
		const self = this;
		const formData = this.getData();

		const options = {
			action: "wpgmza_installer_page_save_options",
			nonce: this.element.attr("data-ajax-nonce"),
			wpgmza_maps_engine : this.engine,
			tile_server_url : formData.tile_server_url,
			api_key : formData.api_key
		};

		$(event.target).prop("disabled", true);
		
		$.ajax(WPGMZA.ajaxurl, {
			method: "POST",
			data: options,
			success: function(response, status, xhr) {
				window.location.href = self.redirectUrl;
			}
		});
	}

	WPGMZA.Installer.prototype.hideAutoKeyError = function(){
		$('.auto-key-error').addClass("wpgmza-hidden");
	}

	WPGMZA.Installer.prototype.showAutoKeyError = function(codeOrMsg){
		let message = "";
		if(codeOrMsg.indexOf(" ") === -1){
			const localizedError = $('.auto-key-error').data(codeOrMsg);
			if(localizedError){
				message = localizedError;
			} else {
				message = codeOrMsg;
			}
		} else {
			message = codeOrMsg;
		}


		if(message.length){
			$('.auto-key-error').find('.notice').text(message);
			$('.auto-key-error').removeClass('wpgmza-hidden');
		} else {
			this.hideAutoKeyError();
		}
	}

	WPGMZA.Installer.prototype.skip = function(){
		const self = this;

		if(!this.element.data('has-temp-api-key') && !this.declineAssistedSkip){
			/* Assisted skip, where we allow the user to get a temp key from us to try things out */
			this.assistedSkip();
			return;
		} 

		/* Normal skip behaviour */
		$(this.element).find('.step').removeClass('active');
		$(this.element).find('.step-controller').addClass('wpgmza-hidden');
		$(this.element).find('.step-loader').removeClass('wpgmza-hidden');

		$(this.element).find('.step-loader .progress-finish').removeClass('wpgmza-hidden');

		this.skipButton.addClass('wpgmza-hidden');

		const options = {
			action: "wpgmza_installer_page_skip",
			nonce: this.element.attr("data-ajax-nonce")
		};

		$.ajax(WPGMZA.ajaxurl, {
			method: "POST",
			data: options,
			success: function(response, status, xhr) {
				window.location.href = self.redirectUrl;
			}
		});

		
	}

	WPGMZA.Installer.prototype.assistedSetupIntent = function(button){
		const self = this;
		const intent = button.data('intent');

		switch(intent){
			case 'quick-setup':
				$(this.element).find('.step-assisted-prompt').addClass('wpgmza-hidden');
				$(this.element).find('.step-assisted-permission').removeClass('wpgmza-hidden');
				break;
			case 'full-setup':
			case 'assisted-decline':
				this.declineAssistedSkip = true;
				this.loadStep(this.step);

				this.skipButton.removeClass('wpgmza-hidden');
				$(this.element).find('.step-assisted-skip').addClass('wpgmza-hidden');
				$(this.element).find('.step-controller').removeClass('wpgmza-hidden');

				break;
			case 'generate-key':
				$(this.element).find('.step-assisted-skip').addClass('wpgmza-hidden');
				
				$(this.element).find('.step-controller').addClass('wpgmza-hidden');
				$(this.element).find('.step-loader').removeClass('wpgmza-hidden');

				$(this.element).find('.step-loader .progress-finish').removeClass('wpgmza-hidden');

				this.skipButton.addClass('wpgmza-hidden');

				const options = {
					action: "wpgmza_installer_page_temp_api_key",
					nonce: this.element.attr("data-ajax-nonce")
				};

				$.ajax(WPGMZA.ajaxurl, {
					method: "POST",
					data: options,
					success: function(response, status, xhr) {
						window.location.href = self.redirectUrl;
					}
				});
				break;
		}
	}

	WPGMZA.Installer.prototype.assistedSkip = function(){
		const self = this;

		$(this.element).find('.step').removeClass('active');
		$(this.element).find('.step-controller').addClass('wpgmza-hidden');
		$(this.element).find('.step-loader').addClass('wpgmza-hidden');
		
		this.skipButton.addClass('wpgmza-hidden');

		$(this.element).find('.step-assisted-skip').removeClass('wpgmza-hidden');
	}

	WPGMZA.Installer.prototype.checkAutoSkip = function(){
		/* Check if the system was flagged for auto-skip mode */
		if(this.element.data('auto-skip')){
			this.skip();
		}
	}

	$(document).ready(function(event) {
		WPGMZA.installer = WPGMZA.Installer.createInstance();
	});
});



// js/v8/internal-engine.js
/**
 * Internal Engine Constants
 * @namespace WPGMZA
 * @module InternalEngine
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * @class WPGMZA.InternalEngine
	 * @memberof WPGMZA
	 */
	WPGMZA.InternalEngine = {
		
		/**
		 * Legacy
		 * @constant LEGACY
		 * @static
		 * @memberof WPGMZA.InternalEngine
		 */
		LEGACY:	"legacy",
		
		/**
		 * Atlas Novus
		 * @constant ATLAS_NOVUS
		 * @static
		 * @memberof WPGMZA.InternalEngine
		 */
		ATLAS_NOVUS: "atlast-novus",
		
		/**
		 * Check if the interface is in legacy mode,
		 * @method isLegacy
		 * @static
		 * @memberof WPGMZA.InternalEngine
		 * @return {bool} True if in legacy
		 */
		isLegacy: function(){
			return WPGMZA.settings.internalEngine === WPGMZA.InternalEngine.LEGACY;
		},

		/**
		 * Access the global setting in a safe way
		 * @method getEngine
		 * @static
		 * @memberof WPGMZA.InternalEngine
		 * @return {string} The selected engine
		 */
		getEngine: function(){
			return WPGMZA.settings.internalEngine;
		}
	};
	
});

// js/v8/internal-viewport.js
/**
 * @namespace WPGMZA
 * @module InternalViewport
 * @requires WPGMZA.EventDispatcher
 */
 jQuery(function($) {
    /**
     * Constructor
     * 
     * @param WPGMZA.Map map The map this viewport is bound to 
     */	
	WPGMZA.InternalViewport = function(map){
        const self = this;
        WPGMZA.EventDispatcher.apply(this);

        this.map = map;
        this.limits = {};

        this.element = this.getContainer();

        this.update();

        /* Window events */
        $(window).on('resize', (event) => {
            this.trigger('resize.internalviewport');
            this.update();
        });
    }

    WPGMZA.extend(WPGMZA.InternalViewport, WPGMZA.EventDispatcher);

    WPGMZA.InternalViewport.RECT_TYPE_LARGE  = 0;
    WPGMZA.InternalViewport.RECT_TYPE_MEDIUM = 1;
    WPGMZA.InternalViewport.RECT_TYPE_SMALL  = 2;

    WPGMZA.InternalViewport.CONTAINER_THRESHOLD_MEDIUM = 960;
    WPGMZA.InternalViewport.CONTAINER_THRESHOLD_SMALL = 760;
    
    /**
     * Instance delegate 
     * 
     * @param WPGMZA.Map map The map this viewport is bound to 
     * 
     * @returns WPGMZA.InternalViewport
     */
    WPGMZA.InternalViewport.createInstance = function(map) {
        return new WPGMZA.InternalViewport(map);
    }

    /**
     * Get the active container
     * 
     * @returns Element
     */
    WPGMZA.InternalViewport.prototype.getContainer = function(){
        if(this.map && this.map.element){
            return this.map.element;
        } 
        return document.body || false;
    }

    /**
     * Get the type of rect space available 
     * 
     * Sort of like a media query, but for the container
     * 
     * This aligns with WPGMZA.RECT_TYPE_LARGE, WPGMZA.RECT_TYPE_MEDIUM or WPGMZA.RECT_TYPE_SMALL
     * 
     * @returns int
     */
    WPGMZA.InternalViewport.prototype.getRectType = function(){
        let type = WPGMZA.InternalViewport.RECT_TYPE_LARGE;
        if(this.limits.container && this.limits.container.width.value){
            if(this.limits.container.width.value <= WPGMZA.InternalViewport.CONTAINER_THRESHOLD_SMALL){
                type = WPGMZA.InternalViewport.RECT_TYPE_SMALL;
            } else if (this.limits.container.width.value <= WPGMZA.InternalViewport.CONTAINER_THRESHOLD_MEDIUM){
                type = WPGMZA.InternalViewport.RECT_TYPE_MEDIUM;
            } 
        }
        return type;
    }

    /**
     * Wrap a measurement as an object
     * 
     * @param int|float value The measurement value 
     * @param string suffix The unit of measurement
     * 
     * @returns object 
     */
    WPGMZA.InternalViewport.prototype.wrapMeasurement = function(value, suffix){
        return {
            value : value,
            suffix : (suffix ? suffix : 'px')
        };
    }

    /**
     * Update viewport 
     * 
     * Delegates to trace, localize and addClass methods. May also trigger events for developers
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.update = function(){
        this.trace();
        this.localize();
        this.addClass();

        this.trigger('update.internalviewport');
    }

    /**
     * Trace the viewport 
     * 
     * This is just terminology, as really trace methods only sample resolutions, dimensions, and offsets
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.trace = function(){
        this.traceLimits();

        this.trigger('trace.internalviewport');
    }

    /**
     * Trace limits of the viewport
     * 
     * Measures the container width/height then calculates the maximum dimensions for the inner components (stacks/groups)
     * 
     * Note: This could later take additional steps if we needed it to, but for now it's isolated to stacks and groups
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.traceLimits = function(){
        this.limits = {
            container : {},
            overlays : {},
            panels : {}
        };

        const container  = this.getContainer();
        if(container){
            this.limits.container.width = this.wrapMeasurement(parseInt(this.map.element.offsetWidth));
            this.limits.container.height = this.wrapMeasurement(parseInt(this.map.element.offsetHeight));

            mode = this.getRectType();

            if(this.limits.container.width){
                const overlayMultipliers = [0.5, 0.7, 1];
                this.limits.overlays.max_width = this.wrapMeasurement((overlayMultipliers[mode] * 100), "%");
                
                const panelMultipliers = [0.3, 0.5, 1];
                this.limits.panels.max_width = this.wrapMeasurement((panelMultipliers[mode] * 100), "%");
            }
        }
    }

    /**
     * Localize the limits to the document
     * 
     * This is dome by setting CSS variables on the map container itself
     * 
     * These variables are then used on the CSS side of things to allow the system to adapt it's layouts. Consider this a shim, or polyfill?
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.localize = function(){
        const localized = {};
        for(let tag in this.limits){
            if(!this.limits[tag]){
                continue;
            }

            for(let name in this.limits[tag]){
                const prop = this.limits[tag][name];

                name = name.replaceAll("_", "-");
                name = "--wpgmza--viewport-" + tag + "-" + name;

                localized[name] = prop.value + prop.suffix;
            } 
        }

        const container = this.getContainer();
        if(container){
            $(container).css(localized);
        }

        this.trigger('localize.internalviewport');
    }

    /**
     * Add a class to the container to indicate what type of view is being used at the moment
     * 
     * This may be small, medium or large, depending on the container width. Again nothing to do with screen size
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.addClass = function(){
        const classes = ['wpgmza-viewport-large', 'wpgmza-viewport-medium', 'wpgmza-viewport-small'];
        const container = this.getContainer();
        if(container){
            $(container).removeClass(classes);

            const mode = this.getRectType();
            $(container).addClass(classes[mode]);
        }
    }

});

// js/v8/latlng.js
/**
 * @namespace WPGMZA
 * @module LatLng
 * @requires WPGMZA
 */
jQuery(function($) {

	/**
	 * This class represents a latitude and longitude coordinate pair, and provides utilities to work with coordinates, parsing and conversion.
	 * @class WPGMZA.LatLng
	 * @constructor WPGMZA.LatLng
	 * @memberof WPGMZA
	 * @param {number|object} arg A latLng literal, or latitude
	 * @param {number} [lng] The latitude, where arg is a longitude
	 */
	WPGMZA.LatLng = function(arg, lng)
	{
		this._lat = 0;
		this._lng = 0;
		
		if(arguments.length == 0)
			return;
		
		if(arguments.length == 1)
		{
			// TODO: Support latlng string
			
			if(typeof arg == "string")
			{
				var m;
				
				if(!(m = arg.match(WPGMZA.LatLng.REGEXP)))
					throw new Error("Invalid LatLng string");
				
				arg = {
					lat: m[1],
					lng: m[3]
				};
			}
			
			if(typeof arg != "object" || !("lat" in arg && "lng" in arg))
				throw new Error("Argument must be a LatLng literal");
			
			this.lat = arg.lat;
			this.lng = arg.lng;
		}
		else
		{
			this.lat = arg;
			this.lng = lng;
		}
	}
	
	/**
	 * A regular expression which matches latitude and longitude coordinate pairs from a string. Matches 1 and 3 correspond to latitude and longitude, respectively,
	 * @constant {RegExp}
	 * @memberof WPGMZA.LatLng
	 */
	WPGMZA.LatLng.REGEXP = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/;
	
	/**
	 * Returns true if the supplied object is a LatLng literal, also returns true for instances of WPGMZA.LatLng
	 * @method
	 * @static
	 * @memberof WPGMZA.LatLng
	 * @param {object} obj A LatLng literal, or an instance of WPGMZA.LatLng
	 * @return {bool} True if this object is a valid LatLng literal or instance of WPGMZA.LatLng
	 */
	WPGMZA.LatLng.isValid = function(obj)
	{
		if(typeof obj != "object")
			return false;
		
		if(!("lat" in obj && "lng" in obj))
			return false;
		
		return true;
	}
	
	WPGMZA.LatLng.isLatLngString = function(str)
	{
		if(typeof str != "string")
			return false;
		
		return str.match(WPGMZA.LatLng.REGEXP) ? true : false;
	}
	
	/**
	 * The latitude, guaranteed to be a number
	 * @property lat
	 * @memberof WPGMZA.LatLng
	 */
	Object.defineProperty(WPGMZA.LatLng.prototype, "lat", {
		get: function() {
			return this._lat;
		},
		set: function(val) {
			if(!WPGMZA.isNumeric(val))
				throw new Error("Latitude must be numeric");
			this._lat = parseFloat( val );
		}
	});
	
	/**
	 * The longitude, guaranteed to be a number
	 * @property lng
	 * @memberof WPGMZA.LatLng
	 */
	Object.defineProperty(WPGMZA.LatLng.prototype, "lng", {
		get: function() {
			return this._lng;
		},
		set: function(val) {
			if(!WPGMZA.isNumeric(val))
				throw new Error("Longitude must be numeric");
			this._lng = parseFloat( val );
		}
	});
	
	WPGMZA.LatLng.fromString = function(string)
	{
		if(!WPGMZA.LatLng.isLatLngString(string))
			throw new Error("Not a valid latlng string");
		
		var m = string.match(WPGMZA.LatLng.REGEXP);
		
		return new WPGMZA.LatLng({
			lat: parseFloat(m[1]),
			lng: parseFloat(m[3])
		});
	}
	
	/**
	 * Returns this latitude and longitude as a string
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @return {string} This object represented as a string
	 */
	WPGMZA.LatLng.prototype.toString = function()
	{
		return this._lat + ", " + this._lng;
	}
	
	/**
	 * Queries the users current location and passes it to a callback, you can pass
	 * geocodeAddress through options if you would like to also receive the address
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @param {function} A callback to receive the WPGMZA.LatLng
	 * @param {object} An object of options, only geocodeAddress is currently supported
	 * @return void
	 */
	WPGMZA.LatLng.fromCurrentPosition = function(callback, options)
	{
		if(!options)
			options = {};
		
		if(!callback)
			return;
		
		WPGMZA.getCurrentPosition(function(position) {
			
			var latLng = new WPGMZA.LatLng({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});
			
			if(options.geocodeAddress)
			{
				var geocoder = WPGMZA.Geocoder.createInstance();
				
				geocoder.getAddressFromLatLng({
					latLng: latLng
				}, function(results) {
					
					if(results.length)
						latLng.address = results[0];
					
					callback(latLng);
					
				});
				
				
			}	
			else
				callback(latLng);
			
		});
	}
	
	/**
	 * Returns an instnace of WPGMZA.LatLng from an instance of google.maps.LatLng
	 * @method
	 * @static
	 * @memberof WPGMZA.LatLng
	 * @param {google.maps.LatLng} The google.maps.LatLng to convert
	 * @return {WPGMZA.LatLng} An instance of WPGMZA.LatLng built from the supplied google.maps.LatLng
	 */
	WPGMZA.LatLng.fromGoogleLatLng = function(googleLatLng)
	{
		return new WPGMZA.LatLng(
			googleLatLng.lat(),
			googleLatLng.lng()
		);
	}
	
	WPGMZA.LatLng.toGoogleLatLngArray = function(arr)
	{
		var result = [];
		
		arr.forEach(function(nativeLatLng) {
			
			if(! (nativeLatLng instanceof WPGMZA.LatLng || ("lat" in nativeLatLng && "lng" in nativeLatLng)) )
				throw new Error("Unexpected input");
			
			result.push(new google.maps.LatLng({
				lat: parseFloat(nativeLatLng.lat),
				lng: parseFloat(nativeLatLng.lng)
			}));
			
		});
		
		return result;
	}
	
	/**
	 * Returns an instance of google.maps.LatLng with the same coordinates as this object
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @return {google.maps.LatLng} This object, expressed as a google.maps.LatLng
	 */
	WPGMZA.LatLng.prototype.toGoogleLatLng = function()
	{
		return new google.maps.LatLng({
			lat: this.lat,
			lng: this.lng
		});
	}
	
	WPGMZA.LatLng.prototype.toLatLngLiteral = function()
	{
		return {
			lat: this.lat,
			lng: this.lng
		};
	}
	
	/**
	 * Moves this latLng by the specified kilometers along the given heading. This function operates in place, as opposed to creating a new instance of WPGMZA.LatLng. With many thanks to Hu Kenneth - https://gis.stackexchange.com/questions/234473/get-a-lonlat-point-by-distance-or-between-2-lonlat-points
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @param {number} kilometers The number of kilometers to move this LatLng by
	 * @param {number} heading The heading, in degrees, to move along, where zero is North
	 * @return {void}
	 */
	WPGMZA.LatLng.prototype.moveByDistance = function(kilometers, heading)
	{
		var radius 		= 6371;
		
		var delta 		= parseFloat(kilometers) / radius;
		var theta 		= parseFloat(heading) / 180 * Math.PI;
		
		var phi1 		= this.lat / 180 * Math.PI;
		var lambda1 	= this.lng / 180 * Math.PI;
		
		var sinPhi1 	= Math.sin(phi1), cosPhi1 = Math.cos(phi1);
		var sinDelta	= Math.sin(delta), cosDelta = Math.cos(delta);
		var sinTheta	= Math.sin(theta), cosTheta = Math.cos(theta);
		
		var sinPhi2		= sinPhi1 * cosDelta + cosPhi1 * sinDelta * cosTheta;
		var phi2		= Math.asin(sinPhi2);
		var y			= sinTheta * sinDelta * cosPhi1;
		var x			= cosDelta - sinPhi1 * sinPhi2;
		var lambda2		= lambda1 + Math.atan2(y, x);
		
		this.lat		= phi2 * 180 / Math.PI;
		this.lng		= lambda2 * 180 / Math.PI;
	}
	
	/**
	 * @function getGreatCircleDistance
	 * @summary Uses the haversine formula to get the great circle distance between this and another LatLng / lat & lng pair
	 * @param arg1 [WPGMZA.LatLng|Object|Number] Either a WPGMZA.LatLng, an object representing a lat/lng literal, or a latitude
	 * @param arg2 (optional) If arg1 is a Number representing latitude, pass arg2 to represent the longitude
	 * @return number The distance "as the crow files" between this point and the other
	 */
	WPGMZA.LatLng.prototype.getGreatCircleDistance = function(arg1, arg2)
	{
		var lat1 = this.lat;
		var lon1 = this.lng;
		var other;
		
		if(arguments.length == 1)
			other = new WPGMZA.LatLng(arg1);
		else if(arguments.length == 2)
			other = new WPGMZA.LatLng(arg1, arg2);
		else
			throw new Error("Invalid number of arguments");
		
		var lat2 = other.lat;
		var lon2 = other.lng;
		
		var R = 6371; // Kilometers
		var phi1 = lat1.toRadians();
		var phi2 = lat2.toRadians();
		var deltaPhi = (lat2-lat1).toRadians();
		var deltaLambda = (lon2-lon1).toRadians();

		var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
				Math.cos(phi1) * Math.cos(phi2) *
				Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		var d = R * c;
		
		return d;
	}
	
});

// js/v8/latlngbounds.js
/**
 * @namespace WPGMZA
 * @module LatLngBounds
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * This class represents latitude and longitude bounds as a rectangular area.
	 * NB: This class is not fully implemented
	 * @class WPGMZA.LatLngBounds
	 * @constructor WPGMZA.LatLngBounds
	 * @memberof WPGMZA
	 */
	WPGMZA.LatLngBounds = function(southWest, northEast)
	{
		//console.log("Created bounds", southWest, northEast);
		
		if(southWest instanceof WPGMZA.LatLngBounds)
		{
			var other = southWest;
			this.south = other.south;
			this.north = other.north;
			this.west = other.west;
			this.east = other.east;
		}
		else if(southWest && northEast)
		{
			// TODO: Add checks and errors
			this.south = southWest.lat;
			this.north = northEast.lat;
			this.west = southWest.lng;
			this.east = northEast.lng;
		}
	}
	
	WPGMZA.LatLngBounds.fromGoogleLatLngBounds = function(googleLatLngBounds)
	{
		if(!(googleLatLngBounds instanceof google.maps.LatLngBounds))
			throw new Error("Argument must be an instance of google.maps.LatLngBounds");
		
		var result = new WPGMZA.LatLngBounds();
		var southWest = googleLatLngBounds.getSouthWest();
		var northEast = googleLatLngBounds.getNorthEast();
		
		result.north = northEast.lat();
		result.south = southWest.lat();
		result.west = southWest.lng();
		result.east = northEast.lng();
		
		return result;
	}
	
	WPGMZA.LatLngBounds.fromGoogleLatLngBoundsLiteral = function(obj)
	{
		var result = new WPGMZA.LatLngBounds();
		
		var southWest = obj.southwest;
		var northEast = obj.northeast;
		
		result.north = northEast.lat;
		result.south = southWest.lat;
		result.west = southWest.lng;
		result.east = northEast.lng;
		
		return result;
	}
	
	/**
	 * Returns true if this object is in it's initial state (eg no points specified to gather bounds from)
	 * @method
	 * @memberof WPGMZA.LatLngBounds
	 * @return {bool} True if the object is in it's initial state
	 */
	WPGMZA.LatLngBounds.prototype.isInInitialState = function()
	{
		return (this.north == undefined && this.south == undefined && this.west == undefined && this.east == undefined);
	}
	
	/**
	 * Extends this bounds object to encompass the given latitude and longitude coordinates
	 * @method
	 * @memberof WPGMZA.LatLngBounds
	 * @param {object|WPGMZA.LatLng} latLng either a LatLng literal or an instance of WPGMZA.LatLng
	 */
	WPGMZA.LatLngBounds.prototype.extend = function(latLng)
	{
		if(!(latLng instanceof WPGMZA.LatLng))
			latLng = new WPGMZA.LatLng(latLng);
		
		//console.log("Expanding bounds to " + latLng.toString());
		
		if(this.isInInitialState())
		{
			this.north = this.south = latLng.lat;
			this.west = this.east = latLng.lng;
			return;
		}
		
		if(latLng.lat < this.north)
			this.north = latLng.lat;
		
		if(latLng.lat > this.south)
			this.south = latLng.lat;
		
		if(latLng.lng < this.west)
			this.west = latLng.lng;
		
		if(latLng.lng > this.east)
			this.east = latLng.lng;
	}
	
	WPGMZA.LatLngBounds.prototype.extendByPixelMargin = function(map, x, arg)
	{
		var y = x;
		
		if(!(map instanceof WPGMZA.Map))
			throw new Error("First argument must be an instance of WPGMZA.Map");
		
		if(this.isInInitialState())
			throw new Error("Cannot extend by pixels in initial state");
		
		if(arguments.length >= 3)
			y = arg;
		
		var southWest = new WPGMZA.LatLng(this.south, this.west);
		var northEast = new WPGMZA.LatLng(this.north, this.east);
		
		southWest = map.latLngToPixels(southWest);
		northEast = map.latLngToPixels(northEast);
		
		southWest.x -= x;
		southWest.y += y;
		
		northEast.x += x;
		northEast.y -= y;
		
		southWest = map.pixelsToLatLng(southWest.x, southWest.y);
		northEast = map.pixelsToLatLng(northEast.x, northEast.y);
		
		var temp = this.toString();
		
		this.north = northEast.lat;
		this.south = southWest.lat;
		this.west = southWest.lng;
		this.east = northEast.lng;
		
		// console.log("Extended", temp, "to", this.toString());
	}
	
	WPGMZA.LatLngBounds.prototype.contains = function(latLng)
	{
		//console.log("Checking if latLng ", latLng, " is within bounds " + this.toString());
		
		if(!(latLng instanceof WPGMZA.LatLng))
			throw new Error("Argument must be an instance of WPGMZA.LatLng");
		
		if(latLng.lat < Math.min(this.north, this.south))
			return false;
		
		if(latLng.lat > Math.max(this.north, this.south))
			return false;
		
		if(this.west < this.east)
			return (latLng.lng >= this.west && latLng.lng <= this.east);
		
		return (latLng.lng <= this.west || latLng.lng >= this.east);
	}
	
	WPGMZA.LatLngBounds.prototype.toString = function()
	{
		return this.north + "N " + this.south + "S " + this.west + "W " + this.east + "E";
	}
	
	WPGMZA.LatLngBounds.prototype.toLiteral = function()
	{
		return {
			north: this.north,
			south: this.south,
			west: this.west,
			east: this.east
		};
	}
	
});

// js/v8/legacy-global-symbols.js
/**
 * @namespace WPGMZA
 * @module LegacyGlobalSymbols
 * @requires WPGMZA
 */
jQuery(function($) {	

	var legacyGlobals = {
		marker_pull:		"0",
		marker_array:		[],
		MYMAP:			 	[],
		infoWindow_poly:	[],
		markerClusterer:	[],
		heatmap:			[],
		WPGM_Path:			[],
		WPGM_Path_Polygon:	[],
		WPGM_PathLine:		[],
		WPGM_PathLineData:	[],
		WPGM_PathData:		[],
		original_iw:		null,
		wpgmza_user_marker:	null,
		
		wpgmaps_localize_marker_data:		[],
		wpgmaps_localize_polygon_settings:	[],
		wpgmaps_localize_heatmap_settings:	[],
		wpgmaps_localize_polyline_settings:	[],
		wpgmza_cirtcle_data_array:			[],
		wpgmza_rectangle_data_array:		[],
		
		wpgmzaForceLegacyMarkerClusterer: false
	};
	
	function bindLegacyGlobalProperty(key)
	{
		if(key in window)
		{
			console.warn("Cannot redefine legacy global " + key);
			return;
		}
		
		Object.defineProperty(window, key, {
			"get": function() {
				
				console.warn("This property is deprecated and should no longer be used");
				
				return legacyGlobals[key];
				
			},
			"set": function(value) {
				
				console.warn("This property is deprecated and should no longer be used");
				
				legacyGlobals[key] = value;
				
			}
		});
	}
	
	for(var key in legacyGlobals)
		bindLegacyGlobalProperty(key);
	
	WPGMZA.legacyGlobals = legacyGlobals;

	window.InitMap =
		window.resetLocations =
		window.searchLocations =
		window.fillInAddress =
		window.searchLocationsNear =
	function () {
		console.warn("This function is deprecated and should no longer be used");
	}

	/*window.add_polygon = function (mapid, polygonid) {
		
		console.warn("This function is deprecated and should no longer be used");
		
		if (WPGMZA.settings.engine == "open-layers")
			return;

		var tmp_data = wpgmaps_localize_polygon_settings[mapid][polygonid];
		var current_poly_id = polygonid;
		var tmp_polydata = tmp_data['polydata'];
		var WPGM_PathData = new Array();
		for (tmp_entry2 in tmp_polydata) {
			if (typeof tmp_polydata[tmp_entry2][0] !== "undefined") {

				WPGM_PathData.push(new google.maps.LatLng(tmp_polydata[tmp_entry2][0], tmp_polydata[tmp_entry2][1]));
			}
		}
		if (tmp_data['lineopacity'] === null || tmp_data['lineopacity'] === "") {
			tmp_data['lineopacity'] = 1;
		}

		var bounds = new google.maps.LatLngBounds();
		for (i = 0; i < WPGM_PathData.length; i++) {
			bounds.extend(WPGM_PathData[i]);
		}

		function addPolygonLabel(googleLatLngs) {
			var label = tmp_data.title;

			var geojson = [[]];

			googleLatLngs.forEach(function (latLng) {
				geojson[0].push([
						latLng.lng(),
						latLng.lat()
					])
			});

			var lngLat = WPGMZA.ProPolygon.getLabelPosition(geojson);

			var latLng = new WPGMZA.LatLng({
					lat: lngLat[1],
					lng: lngLat[0]
				});

			var marker = WPGMZA.Marker.createInstance({
					position: latLng
				});

			// TODO: Support target map
			// TODO: Read polygon title

			var text = WPGMZA.Text.createInstance({
					text: label,
					map: WPGMZA.getMapByID(mapid),
					position: latLng
				});

			//var marker = WPGMZA.Marker.createInst)
		}

		WPGM_Path_Polygon[polygonid] = new google.maps.Polygon({
				path: WPGM_PathData,
				clickable: true,
				strokeColor: "#" + tmp_data['linecolor'],
				fillOpacity: tmp_data['opacity'],
				strokeOpacity: tmp_data['lineopacity'],
				fillColor: "#" + tmp_data['fillcolor'],
				strokeWeight: 2,
				map: MYMAP[mapid].map.googleMap
			});
		WPGM_Path_Polygon[polygonid].setMap(MYMAP[mapid].map.googleMap);

		var map = WPGMZA.getMapByID(mapid);
		if (map.settings.polygon_labels)
			addPolygonLabel(WPGM_PathData);

		if (tmp_data['title'] !== "") {
			infoWindow_poly[polygonid] = new google.maps.InfoWindow();
			infoWindow_poly[polygonid].setZIndex(WPGMZA.GoogleInfoWindow.Z_INDEX);

			google.maps.event.addListener(WPGM_Path_Polygon[polygonid], 'click', function (event) {
				infoWindow_poly[polygonid].setPosition(event.latLng);
				content = "";
				if (tmp_data['link'] !== "") {
					var content = "<a href='" + tmp_data['link'] + "'><h4 class='wpgmza_polygon_title'>" + tmp_data['title'] + "</h4></a>";
					if (tmp_data['description'] !== "") {
						content += '<p class="wpgmza_polygon_description">' + tmp_data['description'] + '</p>';
					}
				} else {
					var content = '<h4 class="wpgmza_polygon_title">' + tmp_data['title'] + '</h4>';
					if (tmp_data['description'] !== "") {
						content += '<p class="wpgmza_polygon_description">' + tmp_data['description'] + '</p>';
					}
				}
				infoWindow_poly[polygonid].setContent(content);
				infoWindow_poly[polygonid].open(MYMAP[mapid].map.googleMap, this.position);
			});
		}

		google.maps.event.addListener(WPGM_Path_Polygon[polygonid], "mouseover", function (event) {
			this.setOptions({
				fillColor: "#" + tmp_data['ohfillcolor']
			});
			this.setOptions({
				fillOpacity: tmp_data['ohopacity']
			});
			this.setOptions({
				strokeColor: "#" + tmp_data['ohlinecolor']
			});
			this.setOptions({
				strokeWeight: 2
			});
			this.setOptions({
				strokeOpacity: 0.9
			});
		});
		google.maps.event.addListener(WPGM_Path_Polygon[polygonid], "click", function (event) {

			this.setOptions({
				fillColor: "#" + tmp_data['ohfillcolor']
			});
			this.setOptions({
				fillOpacity: tmp_data['ohopacity']
			});
			this.setOptions({
				strokeColor: "#" + tmp_data['ohlinecolor']
			});
			this.setOptions({
				strokeWeight: 2
			});
			this.setOptions({
				strokeOpacity: 0.9
			});
		});
		google.maps.event.addListener(WPGM_Path_Polygon[polygonid], "mouseout", function (event) {
			this.setOptions({
				fillColor: "#" + tmp_data['fillcolor']
			});
			this.setOptions({
				fillOpacity: tmp_data['opacity']
			});
			this.setOptions({
				strokeColor: "#" + tmp_data['linecolor']
			});
			this.setOptions({
				strokeWeight: 2
			});
			this.setOptions({
				strokeOpacity: tmp_data['lineopacity']
			});
		});
	}
	
	window.add_polyline = function (mapid, polyline) {
		
		console.warn("This function is deprecated and should no longer be used");

		if (WPGMZA.settings.engine == "open-layers")
			return;

		var tmp_data = wpgmaps_localize_polyline_settings[mapid][polyline];

		var current_poly_id = polyline;
		var tmp_polydata = tmp_data['polydata'];
		var WPGM_Polyline_PathData = new Array();
		for (tmp_entry2 in tmp_polydata) {
			if (typeof tmp_polydata[tmp_entry2][0] !== "undefined" && typeof tmp_polydata[tmp_entry2][1] !== "undefined") {
				var lat = tmp_polydata[tmp_entry2][0].replace(')', '');
				lat = lat.replace('(', '');
				var lng = tmp_polydata[tmp_entry2][1].replace(')', '');
				lng = lng.replace('(', '');
				WPGM_Polyline_PathData.push(new google.maps.LatLng(lat, lng));
			}

		}
		if (tmp_data['lineopacity'] === null || tmp_data['lineopacity'] === "") {
			tmp_data['lineopacity'] = 1;
		}

		WPGM_Path[polyline] = new google.maps.Polyline({
				path: WPGM_Polyline_PathData,
				strokeColor: "#" + tmp_data['linecolor'],
				strokeOpacity: tmp_data['opacity'],
				strokeWeight: tmp_data['linethickness'],
				map: MYMAP[mapid].map.googleMap
			});
		WPGM_Path[polyline].setMap(MYMAP[mapid].map.googleMap);

	}

	window.add_circle = function (mapid, data) {
		
		console.warn("This function is deprecated and should no longer be used");
		
		if (WPGMZA.settings.engine != "google-maps" || !MYMAP.hasOwnProperty(mapid))
			return;

		data.map = MYMAP[mapid].map.googleMap;

		if (!(data.center instanceof google.maps.LatLng)) {
			var m = data.center.match(/-?\d+(\.\d*)?/g);
			data.center = new google.maps.LatLng({
					lat: parseFloat(m[0]),
					lng: parseFloat(m[1]),
				});
		}

		data.radius = parseFloat(data.radius);
		data.fillColor = data.color;
		data.fillOpacity = parseFloat(data.opacity);

		data.strokeOpacity = 0;

		var circle = new google.maps.Circle(data);
		circle_array.push(circle);
	}

	window.add_rectangle = function (mapid, data) {
		
		console.warn("This function is deprecated and should no longer be used");
		
		if (WPGMZA.settings.engine != "google-maps" || !MYMAP.hasOwnProperty(mapid))
			return;

		data.map = MYMAP[mapid].map.googleMap;

		data.fillColor = data.color;
		data.fillOpacity = parseFloat(data.opacity);

		var northWest = data.cornerA;
		var southEast = data.cornerB;

		var m = northWest.match(/-?\d+(\.\d+)?/g);
		var north = parseFloat(m[0]);
		var west = parseFloat(m[1]);

		m = southEast.match(/-?\d+(\.\d+)?/g);
		var south = parseFloat(m[0]);
		var east = parseFloat(m[1]);

		data.bounds = {
			north: north,
			west: west,
			south: south,
			east: east
		};

		data.strokeOpacity = 0;

		var rectangle = new google.maps.Rectangle(data);
		rectangle_array.push(rectangle);
	}

	window.add_heatmap = function (mapid, datasetid) {
		
		console.warn("This function is deprecated and should no longer be used");

		if (WPGMZA.settings.engine != "google-maps")
			return;

		var tmp_data = wpgmaps_localize_heatmap_settings[mapid][datasetid];
		var current_poly_id = datasetid;
		var tmp_polydata = tmp_data['polydata'];
		var WPGM_PathData = new Array();
		for (tmp_entry2 in tmp_polydata) {
			if (typeof tmp_polydata[tmp_entry2][0] !== "undefined") {

				WPGM_PathData.push(new google.maps.LatLng(tmp_polydata[tmp_entry2][0], tmp_polydata[tmp_entry2][1]));
			}
		}
		if (tmp_data['radius'] === null || tmp_data['radius'] === "") {
			tmp_data['radius'] = 20;
		}
		if (tmp_data['gradient'] === null || tmp_data['gradient'] === "") {
			tmp_data['gradient'] = null;
		}
		if (tmp_data['opacity'] === null || tmp_data['opacity'] === "") {
			tmp_data['opacity'] = 0.6;
		}

		var bounds = new google.maps.LatLngBounds();
		for (i = 0; i < WPGM_PathData.length; i++) {
			bounds.extend(WPGM_PathData[i]);
		}

		WPGM_Path_Polygon[datasetid] = new google.maps.visualization.HeatmapLayer({
				data: WPGM_PathData,
				map: MYMAP[mapid].map.googleMap
			});

		WPGM_Path_Polygon[datasetid].setMap(MYMAP[mapid].map.googleMap);
		var gradient = JSON.parse(tmp_data['gradient']);
		WPGM_Path_Polygon[datasetid].set('radius', tmp_data['radius']);
		WPGM_Path_Polygon[datasetid].set('opacity', tmp_data['opacity']);
		WPGM_Path_Polygon[datasetid].set('gradient', gradient);
	};*/

});

// js/v8/map-list-page.js
/**
 * @namespace WPGMZA
 * @module MapListPage
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.MapListPage = function()
	{

		$("body").on("click",".wpgmza_copy_shortcode", function() {
	        var $temp = jQuery('<input>');
	        var $tmp2 = jQuery('<span id="wpgmza_tmp" style="display:none; width:100%; text-align:center;">');
	        jQuery("body").append($temp);
	        $temp.val(jQuery(this).val()).select();
	        document.execCommand("copy");
	        $temp.remove();
	        WPGMZA.notification("Shortcode Copied");
	    });
		
	}
	
	WPGMZA.MapListPage.createInstance = function()
	{
		return new WPGMZA.MapListPage();
	}
	
	$(document).ready(function(event) {
		
		if(WPGMZA.getCurrentPage() == WPGMZA.PAGE_MAP_LIST)
			WPGMZA.mapListPage = WPGMZA.MapListPage.createInstance();
		
	});
	
});

// js/v8/map-settings.js
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
		
		if(this.wpgmza_theme_data && this.wpgmza_theme_data.length)
			options.styles = WPGMZA.GoogleMap.parseThemeData(this.wpgmza_theme_data);
		
		return options;
	}
});


// js/v8/map.js
/**
 * @namespace WPGMZA
 * @module Map
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	/**
	 * Base class for maps. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Map
	 * @constructor WPGMZA.Map
	 * @memberof WPGMZA
	 * @param {HTMLElement} element to contain map
	 * @param {object} [options] Options to apply to this map
	 * @augments WPGMZA.EventDispatcher
	 */
	WPGMZA.Map = function(element, options)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Map");
		
		WPGMZA.EventDispatcher.call(this);
		
		if(!(element instanceof HTMLElement) && !(element instanceof HTMLDivElement)){
			if(!window.elementor){
				/**
				 * Temporary Solution
				 * 
				 * If elementor is active, it won't be an HTML Element just yet, due to preview block loading
				 * 
				 * However, our timer initializer will load it later, so we just don't throw the error
				*/
				throw new Error("Argument must be a HTMLElement");
			}
		}
		
		// NB: This should be moved to a getID function or similar and offloaded to Pro. ID should be fixed to 1 in basic.
		if(element.hasAttribute("data-map-id"))
			this.id = element.getAttribute("data-map-id");
		else
			this.id = 1;
		
		if(!/\d+/.test(this.id))
			throw new Error("Map ID must be an integer");
		
		WPGMZA.maps.push(this);
		
		this.element = element;
		this.element.wpgmzaMap = this;
		$(this.element).addClass("wpgmza-initialized");
		
		this.engineElement = element;
		
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		this.circles = [];
		this.rectangles = [];

		this.pointlabels = [];

		// GDPR
		if(WPGMZA.googleAPIStatus && WPGMZA.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN") {
			$(element).append($(WPGMZA.api_consent_html));
			$(element).css({height: "auto"});
			return;
		}
		
		this.loadSettings(options);
		this.loadStyling();

		this.shortcodeAttributes = {};
		if($(this.element).attr("data-shortcode-attributes")){
			try{
				this.shortcodeAttributes = JSON.parse($(this.element).attr("data-shortcode-attributes"));
				if(this.shortcodeAttributes.zoom){
					this.settings.map_start_zoom = parseInt(this.shortcodeAttributes.zoom);
				}
			}catch(e) {
				console.warn("Error parsing shortcode attributes");
			}
		}

		this.innerStack = $(this.element).find('.wpgmza-inner-stack');

		/* Deprecated to allow for internal stack init (V9.0.0) */
		/*if(WPGMZA.getCurrentPage() != WPGMZA.PAGE_MAP_EDIT)
			this.initStoreLocator();*/
		
		this.setDimensions();
		this.setAlignment();

		/* V9.0.0 - Load internal viewport, this is a new system which allows for container specific redraw logic (More for stacks at the moment) */
		this.initInternalViewport();

		// Init marker filter
		this.markerFilter = WPGMZA.MarkerFilter.createInstance(this);
		
		// Initialisation
		this.on("init", function(event) {
			self.onInit(event);
		});

		this.on("click", function(event){
			self.onClick(event);
		});

		// Fullscreen delegates
		$(document.body).on('fullscreenchange.wpgmza', function(event){
			let fullscreen = self.isFullScreen();
			self.onFullScreenChange(fullscreen);
		});
		
		// Legacy support
		if(WPGMZA.useLegacyGlobals)
		{
			// NB: this.id stuff should be moved to Map
			wpgmzaLegacyGlobals.MYMAP[this.id] = {
				map: null,
				bounds: null,
				mc: null
			};
			
			wpgmzaLegacyGlobals.MYMAP.init =
				wpgmzaLegacyGlobals.MYMAP[this.id].init =
				wpgmzaLegacyGlobals.MYMAP.placeMarkers = 
				wpgmzaLegacyGlobals.MYMAP[this.id].placeMarkers = 
				function() {
				console.warn("This function is deprecated and should no longer be used");
			}
		}
	}
	
	WPGMZA.Map.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.Map.prototype.constructor = WPGMZA.Map;
	WPGMZA.Map.nightTimeThemeData = [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#575663"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#80823e"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#1b737a"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}];
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Map
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Map.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProMap;
				
				return WPGMZA.OLMap;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProMap;
				
				return WPGMZA.GoogleMap;
				break;
		}
	}

	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {HTMLElement} element to contain map
	 * @param {object} [options] Options to apply to this map
	 * @return {WPGMZA.Map} An instance of WPGMZA.Map
	 */
	WPGMZA.Map.createInstance = function(element, options)
	{
		var constructor = WPGMZA.Map.getConstructor();
		return new constructor(element, options);
	}
	
	/**
	 * Whether or not the markers have been placed yet
	 *  
	 * @name WPGMZA.ProMap#markersPlaced
	 * @type Boolean
	 * @readonly
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "markersPlaced", {
		
		get: function() {
			return this._markersPlaced;
		},
		
		set: function(value) {
			throw new Error("Value is read only");
		}
		
	});
	
	/**
	 * The maps current latitude
	 * 
	 * @property lat
	 * @memberof WPGMZA.Map
	 * @name WPGMZA.Map#lat
	 * @type Number
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "lat", {
		
		get: function() {
			return this.getCenter().lat;
		},
		
		set: function(value) {
			var center = this.getCenter();
			center.lat = value;
			this.setCenter(center);
		}
		
	});
	
	/**
	 * The maps current longitude
	 * 
	 * @property lng
	 * @memberof WPGMZA.Map
	 * @name WPGMZA.Map#lng
	 * @type Number
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "lng", {
		
		get: function() {
			return this.getCenter().lng;
		},
		
		set: function(value) {
			var center = this.getCenter();
			center.lng = value;
			this.setCenter(center);
		}
		
	});
	
	/**
	 * The maps current zoom level
	 *  
	 * @property zoom
	 * @memberof WPGMZA.Map
	 * @name WPGMZA.Map#zoom
	 * @type Number
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "zoom", {
		
		get: function() {
			return this.getZoom();
		},
		
		set: function(value) {
			this.setZoom(value);
		}
		
	});
	
	/**
	 * Called by the engine specific map classes when the map has fully initialised
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Event} The event
	 * @listens module:WPGMZA.Map~init
	 */
	WPGMZA.Map.prototype.onInit = function(event)
	{
		var self = this;
		
		this.initPreloader();

		if(this.innerStack.length > 0){
			$(this.element).append(this.innerStack);

		}
		
		if(WPGMZA.getCurrentPage() != WPGMZA.PAGE_MAP_EDIT){
			this.initStoreLocator();
		}
		
		if(!("autoFetchFeatures" in this.settings) || (this.settings.autoFetchFeatures !== false))
			this.fetchFeatures();
	}
	
	/**
	 * Initialises the preloader
	 * @method
	 * @memberof WPGMZA.Map
	 * @protected
	 */
	WPGMZA.Map.prototype.initPreloader = function()
	{
		this.preloader = $(WPGMZA.preloaderHTML);

		$(this.preloader).hide();
		
		$(this.element).append(this.preloader);
	}
	
	/**
	 * Shows or hides the maps preloader
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.showPreloader = function(show)
	{
		if(show)
			$(this.preloader).show();
		else
			$(this.preloader).hide();
	}
	
	/**
	 * Loads the maps settings and sets some defaults
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.loadSettings = function(options)
	{
		var settings = new WPGMZA.MapSettings(this.element);
		var other_settings = settings.other_settings;
		
		delete settings.other_settings;
		
		/*if(other_settings)
			for(var key in other_settings)
				settings[key] = other_settings[key];*/
			
		if(options)
			for(var key in options)
				settings[key] = options[key];
			
		this.settings = settings;
	}

	/**
	 * Loads global component styling variables onto each map element as it is initialized
	 * 
	 * This is a global styling support, but it could be pivoted later into a per map option as well if needed. This is the primary reason for map instancing
	 * 
	 * @method
	 * @memberof WPGMZA.Map
	*/
	WPGMZA.Map.prototype.loadStyling = function(){
		if(!WPGMZA.InternalEngine.isLegacy()){
			if(WPGMZA.stylingSettings && WPGMZA.stylingSettings instanceof Object){
				if(Object.keys(WPGMZA.stylingSettings).length > 0){
					for(let name in WPGMZA.stylingSettings){
						if(name.indexOf('--') !== -1){
							/* This is a CSS variable, so it's okay to set this on the wrapper */
							const value = WPGMZA.stylingSettings[name];
							if(value){
								$(this.element).css(name, value);
							}
						}
					}
				}
			}

			if(this.settings && this.settings.wpgmza_ol_tile_filter){
				let tileFilter = this.settings.wpgmza_ol_tile_filter.trim();
				if(tileFilter){
					$(this.element).css('--wpgmza-ol-tile-filter', tileFilter);
				}
			}
		}
	}

	/**
	 * Loads and initializes internal viewport logic
	 * 
	 * This allows each stacked item in the map (placed in map, atlas novus) to listen to changes in the document
	 * 
	 * These changes are treated as an internal viewport for the map container, allowing panels to resize similar to media queries,
	 * but with the added benefit of being container based, and not screen based. This means we can resize stacked components/panels without being 
	 * reliant on the screen size, which is more effective in our opinion
	 * 
	 * Note: We could have looked into using container queries, but they just don't seem quite ready yet under the current CSS specification
	 * 
	 * This initialized a new module, which is dedicated to monitoring changes in the internal viewport 
	 * 
	 * @return void
	 */
	WPGMZA.Map.prototype.initInternalViewport = function(){
		if(WPGMZA.is_admin == "1")
			return;	// NB: Only on frontend (for now anyway)
		
		this.internalViewport = WPGMZA.InternalViewport.createInstance(this);
	}
	
	WPGMZA.Map.prototype.initStoreLocator = function()
	{
		let selectors = [
			".wpgmza-store-locator[data-id='" + this.id + "']",
			".wpgmza-store-locator",
			".wpgmza_sl_main_div"
		];

		let storeLocatorElement = false;
		for(let i in selectors){
			if($(selectors[i]).length > 0 && storeLocatorElement === false){
				storeLocatorElement = $(selectors[i]);
			}
		}
		if(storeLocatorElement.length){
			this.storeLocator = WPGMZA.StoreLocator.createInstance(this, storeLocatorElement[0]);
		}
	}
	
	/**
	 * Get's arrays of all features for each of the feature types on the map
	 * @method
	 * @protected
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.getFeatureArrays = function()
	{
		var arrays = WPGMZA.Map.prototype.getFeatureArrays.call(this);
		
		arrays.heatmaps = this.heatmaps;
		arrays.imageoverlays = this.imageoverlays;
		
		return arrays;
	}
	
	/**
	 * Sets options in bulk on map
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.setOptions = function(options)
	{
		for(var name in options)
			this.settings[name] = options[name];
	}
	
	WPGMZA.Map.prototype.getRESTParameters = function(options)
	{
		var defaults = {};
		
		if(!options || !options.filter)
			defaults.filter = JSON.stringify(this.markerFilter.getFilteringParameters());
		
		return $.extend(true, defaults, options);
	}
	
	WPGMZA.Map.prototype.fetchFeaturesViaREST = function()
	{
		var self = this;
		var data;
		var filter = this.markerFilter.getFilteringParameters();
		
		if(WPGMZA.is_admin == "1")
		{
			filter.includeUnapproved = true;
			filter.excludeIntegrated = true;
		}
		
		if(this.shortcodeAttributes.acf_post_id)
			filter.acfPostID = this.shortcodeAttributes.acf_post_id;
		
		this.showPreloader(true);
		
		if(this.fetchFeaturesXhr)
			this.fetchFeaturesXhr.abort();
			
		if(!WPGMZA.settings.fetchMarkersBatchSize || !WPGMZA.settings.enable_batch_loading)
		{
			data = this.getRESTParameters({
				filter: JSON.stringify(filter)
			});
			
			this.fetchFeaturesXhr = WPGMZA.restAPI.call("/features/", {
				
				useCompressedPathVariable: true,
				data: data,
				success: function(result, status, xhr) {
					self.onFeaturesFetched(result);
				}
				
			});
		} else {
			var offset = 0;
			var limit = parseInt(WPGMZA.settings.fetchMarkersBatchSize);
			
			function fetchNextBatch(){
				filter.offset = offset;
				filter.limit = limit;
				
				data = self.getRESTParameters({
					filter: JSON.stringify(filter)
				});
				
				self.fetchFeaturesXhr = WPGMZA.restAPI.call("/markers/", {
					
					useCompressedPathVariable: true,
					data: data,
					success: function(result, status, xhr) {
						
						if(result.length){
							self.onMarkersFetched(result, true);	// Expect more batches
							
							offset += limit;
							fetchNextBatch();
						} else {
							self.onMarkersFetched(result);			// Final batch
							
							data.exclude = "markers";
							
							WPGMZA.restAPI.call("/features/", {
								
								useCompressedPathVariable: true,
								data: data,
								success: function(result, status, xhr) {
									self.onFeaturesFetched(result);
								}
								
							});
						}
						
					}
					
				});
			}
			
			fetchNextBatch();
		}
	}
	
	WPGMZA.Map.prototype.fetchFeaturesViaXML = function()
	{
		var self = this;
		
		var urls = [
			WPGMZA.markerXMLPathURL + this.id + "markers.xml"
		];
		
		if(this.mashupIDs)
			this.mashupIDs.forEach(function(id) {
				urls.push(WPGMZA.markerXMLPathURL + id + "markers.xml")
			});
		
		var unique = urls.filter(function(item, index) {
			return urls.indexOf(item) == index;
		});
		
		urls = unique;
		
		function fetchFeaturesExcludingMarkersViaREST()
		{
			var filter = {
				map_id: this.id,
				mashup_ids: this.mashupIDs
			};
			
			var data = {
				filter: JSON.stringify(filter),
				exclude: "markers"
			};
			
			WPGMZA.restAPI.call("/features/", {
								
				useCompressedPathVariable: true,
				data: data,
				success: function(result, status, xhr) {
					self.onFeaturesFetched(result);
				}
				
			});
		}
		
		if(window.Worker && window.Blob && window.URL && WPGMZA.settings.enable_asynchronous_xml_parsing)
		{
			var source 	= WPGMZA.loadXMLAsWebWorker.toString().replace(/function\(\)\s*{([\s\S]+)}/, "$1");
			var blob 	= new Blob([source], {type: "text/javascript"});
			var worker	= new Worker(URL.createObjectURL(blob));
			
			worker.onmessage = function(event) {
				self.onMarkersFetched(event.data);
				
				fetchFeaturesExcludingMarkersViaREST();
			};
			
			worker.postMessage({
				command: "load",
				protocol: window.location.protocol,
				urls: urls
			});
		}
		else
		{
			var filesLoaded = 0;
			var converter = new WPGMZA.XMLCacheConverter();
			var converted = [];
			
			for(var i = 0; i < urls.length; i++)
			{
				$.ajax(urls[i], {
					success: function(response, status, xhr) {
						converted = converted.concat( converter.convert(response) );
						
						if(++filesLoaded == urls.length)
						{
							self.onMarkersFetched(converted);
							
							fetchFeaturesExcludingMarkersViaREST();
						}
					}
				});
			}
		}
	}
	
	WPGMZA.Map.prototype.fetchFeatures = function()
	{
		var self = this;
		
		if(WPGMZA.settings.wpgmza_settings_marker_pull != WPGMZA.MARKER_PULL_XML || WPGMZA.is_admin == "1")
		{
			this.fetchFeaturesViaREST();
		}
		else
		{
			this.fetchFeaturesViaXML();
		}
	}
	
	WPGMZA.Map.prototype.onFeaturesFetched = function(data)
	{
		if(data.markers)
			this.onMarkersFetched(data.markers);
		
		for(var type in data)
		{
			if(type == "markers")
				continue;	// NB: Ignore markers for now - onMarkersFetched processes them
			
			var module = type.substr(0, 1).toUpperCase() + type.substr(1).replace(/s$/, "");
			
			for(var i = 0; i < data[type].length; i++)
			{	
				var instance = WPGMZA[module].createInstance(data[type][i]);
				var addFunctionName = "add" + module;
				
				this[addFunctionName](instance);
			}
		}
	}
	
	WPGMZA.Map.prototype.onMarkersFetched = function(data, expectMoreBatches)
	{
		var self = this;
		var startFiltered = (this.shortcodeAttributes.cat && this.shortcodeAttributes.cat.length)
		
		for(var i = 0; i < data.length; i++)
		{
			var obj = data[i];
			var marker = WPGMZA.Marker.createInstance(obj);
			
			if(startFiltered)
			{
				marker.isFiltered = true;
				marker.setVisible(false);
			}
			
			this.addMarker(marker);
		}
		
		if(expectMoreBatches)
			return;
		
		this.showPreloader(false);
		
		var triggerEvent = function()
		{
			self._markersPlaced = true;
			self.trigger("markersplaced");
			self.off("filteringcomplete", triggerEvent);
		}
		
		if(this.shortcodeAttributes.cat)
		{
			var categories = this.shortcodeAttributes.cat.split(",");
			
			// Set filtering controls
			var select = $("select[mid='" + this.id + "'][name='wpgmza_filter_select']");
			
			for(var i = 0; i < categories.length; i++)
			{
				$("input[type='checkbox'][mid='" + this.id + "'][value='" + categories[i] + "']").prop("checked", true);
				select.val(categories[i]);
			}
			
			this.on("filteringcomplete", triggerEvent);
			
			// Force category ID's in case no filtering controls are present
			this.markerFilter.update({
				categories: categories
			});
		}
		else
			triggerEvent();

		//Check to see if they have added markers in the shortcode
		if(this.shortcodeAttributes.markers)
		{	 
			//remove all , from the shortcode to find ID's  
			var arr = this.shortcodeAttributes.markers.split(",");

			//Store all the markers ID's
			var markers = [];
		   
			//loop through the shortcode
			for (var i = 0; i < arr.length; i++) {
				var id = arr[i];
			    id = id.replace(' ', '');
				var marker = this.getMarkerByID(id);
		   
				//push the marker infromation to markers
				markers.push(marker);
			   }

			//call fitMapBoundsToMarkers function on markers ID's in shortcode
			this.fitMapBoundsToMarkers(markers);	   
		}
	}
	
	WPGMZA.Map.prototype.fetchFeaturesViaXML = function()
	{
		var self = this;
		
		var urls = [
			WPGMZA.markerXMLPathURL + this.id + "markers.xml"
		];
		
		if(this.mashupIDs)
			this.mashupIDs.forEach(function(id) {
				urls.push(WPGMZA.markerXMLPathURL + id + "markers.xml")
			});
		
		var unique = urls.filter(function(item, index) {
			return urls.indexOf(item) == index;
		});
		
		urls = unique;
		
		function fetchFeaturesExcludingMarkersViaREST()
		{
			var filter = {
				map_id: this.id,
				mashup_ids: this.mashupIDs
			};
			
			var data = {
				filter: JSON.stringify(filter),
				exclude: "markers"
			};
			
			WPGMZA.restAPI.call("/features/", {
								
				useCompressedPathVariable: true,
				data: data,
				success: function(result, status, xhr) {
					self.onFeaturesFetched(result);
				}
				
			});
		}
		
		if(window.Worker && window.Blob && window.URL && WPGMZA.settings.enable_asynchronous_xml_parsing)
		{
			var source 	= WPGMZA.loadXMLAsWebWorker.toString().replace(/function\(\)\s*{([\s\S]+)}/, "$1");
			var blob 	= new Blob([source], {type: "text/javascript"});
			var worker	= new Worker(URL.createObjectURL(blob));
			
			worker.onmessage = function(event) {
				self.onMarkersFetched(event.data);
				
				fetchFeaturesExcludingMarkersViaREST();
			};
			
			worker.postMessage({
				command: "load",
				protocol: window.location.protocol,
				urls: urls
			});
		}
		else
		{
			var filesLoaded = 0;
			var converter = new WPGMZA.XMLCacheConverter();
			var converted = [];
			
			for(var i = 0; i < urls.length; i++)
			{
				$.ajax(urls[i], {
					success: function(response, status, xhr) {
						converted = converted.concat( converter.convert(response) );
						
						if(++filesLoaded == urls.length)
						{
							self.onMarkersFetched(converted);
							
							fetchFeaturesExcludingMarkersViaREST();
						}
					}
				});
			}
		}
	}
	
	WPGMZA.Map.prototype.fetchFeatures = function()
	{
		var self = this;
		
		if(WPGMZA.settings.wpgmza_settings_marker_pull != WPGMZA.MARKER_PULL_XML || WPGMZA.is_admin == "1")
		{
			this.fetchFeaturesViaREST();
		}
		else
		{
			this.fetchFeaturesViaXML();
		}
	}
	
	WPGMZA.Map.prototype.onFeaturesFetched = function(data)
	{
		if(data.markers)
			this.onMarkersFetched(data.markers);
		
		for(var type in data)
		{
			if(type == "markers")
				continue;	// NB: Ignore markers for now - onMarkersFetched processes them
			
			var module = type.substr(0, 1).toUpperCase() + type.substr(1).replace(/s$/, "");
			
			for(var i = 0; i < data[type].length; i++)
			{
				var instance = WPGMZA[module].createInstance(data[type][i]);
				var addFunctionName = "add" + module;
				
				this[addFunctionName](instance);
			}
		}
	}
	
	WPGMZA.Map.prototype.onMarkersFetched = function(data, expectMoreBatches)
	{
		var self = this;
		var startFiltered = (this.shortcodeAttributes.cat && this.shortcodeAttributes.cat.length)
		
		for(var i = 0; i < data.length; i++)
		{
			var obj = data[i];
			var marker = WPGMZA.Marker.createInstance(obj);
			
			if(startFiltered)
			{
				marker.isFiltered = true;
				marker.setVisible(false);
			}
			
			this.addMarker(marker);
		}
		
		if(expectMoreBatches)
			return;
		
		this.showPreloader(false);
		
		var triggerEvent = function()
		{
			self._markersPlaced = true;
			self.trigger("markersplaced");
			self.off("filteringcomplete", triggerEvent);
		}
		
		if(this.shortcodeAttributes.cat)
		{
			var categories = this.shortcodeAttributes.cat.split(",");
			
			// Set filtering controls
			var select = $("select[mid='" + this.id + "'][name='wpgmza_filter_select']");
			
			for(var i = 0; i < categories.length; i++)
			{
				$("input[type='checkbox'][mid='" + this.id + "'][value='" + categories[i] + "']").prop("checked", true);
				select.val(categories[i]);
			}
			
			this.on("filteringcomplete", triggerEvent);
			
			// Force category ID's in case no filtering controls are present
			this.markerFilter.update({
				categories: categories
			});
		}
		else
			triggerEvent();

		//Check to see if they have added markers in the shortcode
		if(this.shortcodeAttributes.markers)
		{	 
			//remove all , from the shortcode to find ID's  
			var arr = this.shortcodeAttributes.markers.split(",");

			//Store all the markers ID's
			var markers = [];
		   
			//loop through the shortcode
			for (var i = 0; i < arr.length; i++) {
				var id = arr[i];
			    id = id.replace(' ', '');
				var marker = this.getMarkerByID(id);
		   
				//push the marker infromation to markers
				markers.push(marker);
			   }

			//call fitMapBoundsToMarkers function on markers ID's in shortcode
			this.fitMapBoundsToMarkers(markers);	   
		}
	}
	
	/**
	 * Gets the distance between two latLngs in kilometers
	 * NB: Static function
	 * @return number
	 */
	var earthRadiusMeters = 6371;
	var piTimes360 = Math.PI / 360;
	
	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	};
	
	/**
	 * This gets the distance in kilometers between two latitude / longitude points
	 * TODO: Move this to the distance class, or the LatLng class
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} lat1 Latitude from the first coordinate pair
	 * @param {number} lon1 Longitude from the first coordinate pair
	 * @param {number} lat2 Latitude from the second coordinate pair
	 * @param {number} lon1 Longitude from the second coordinate pair
	 * @return {number} The distance between the latitude and longitudes, in kilometers
	 */
	WPGMZA.Map.getGeographicDistance = function(lat1, lon1, lat2, lon2)
	{
		var dLat = deg2rad(lat2-lat1);
		var dLon = deg2rad(lon2-lon1); 
		
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
			
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = earthRadiusMeters * c; // Distance in km
		
		return d;
	}
	
	/**
	 * Centers the map on the supplied latitude and longitude
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {object|WPGMZA.LatLng} latLng A LatLng literal or an instance of WPGMZA.LatLng
	 */
	WPGMZA.Map.prototype.setCenter = function(latLng)
	{
		if(!("lat" in latLng && "lng" in latLng))
			throw new Error("Argument is not an object with lat and lng");
	}
	
	/**
	 * Sets the dimensions of the map engine element
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} width Width as a CSS string
	 * @param {number} height Height as a CSS string
	 */
	WPGMZA.Map.prototype.setDimensions = function(width, height)
	{
		if(arguments.length == 0)
		{
			if(this.settings.map_width)
				width = this.settings.map_width;
			else
				width = "100";
			
			if(this.settings.map_width_type)
				width += this.settings.map_width_type.replace("\\", "");
			else
				width += "%";
			
			if(this.settings.map_height)
				height = this.settings.map_height;
			else
				height = "400";
			
			if(this.settings.map_height_type)
				height += this.settings.map_height_type.replace("\\", "");
			else
				height += "px";
		}
	
		$(this.engineElement).css({
			width: width,
			height: height
		});
	}
	
	WPGMZA.Map.prototype.setAlignment = function()
	{
		switch(parseInt(this.settings.wpgmza_map_align))
		{
			case 1:
				/* Float rules result in unreliable placement in some themes, which can cause overlaps */
				/* $(this.element).css({"float": "left"}); */

				$(this.element).addClass('wpgmza-auto-left');
				break;
				
			case 2:
				/*
				$(this.element).css({
					"margin-left": "auto",
					"margin-right": "auto"
				});
				*/
				
				$(this.element).addClass('wpgmza-auto-left');
				break;
			
			case 3:
				/* Float rules result in unreliable placement in some themes, which can cause overlaps */
				/* $(this.element).css({"float": "right"}); */

				$(this.element).addClass('wpgmza-auto-right');
				break;
			
			default:
				break;
		}
	}
	
	/**
	 * Adds the specified marker to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Marker} marker The marker to add
	 * @fires markeradded
	 * @fires WPGMZA.Marker#added
	 * @throws Argument must be an instance of WPGMZA.Marker
	 */
	WPGMZA.Map.prototype.addMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		marker.map = this;
		marker.parent = this;
		
		this.markers.push(marker);
		this.dispatchEvent({type: "markeradded", marker: marker});
		marker.dispatchEvent({type: "added"});
	}
	
	/**
	 * Removes the specified marker from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Marker} marker The marker to remove
	 * @fires markerremoved
	 * @fires WPGMZA.Marker#removed
	 * @throws Argument must be an instance of WPGMZA.Marker
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removeMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		if(marker.infoWindow)
			marker.infoWindow.close();
		
		marker.map = null;
		marker.parent = null;
		
		var index = this.markers.indexOf(marker);
		
		if(index == -1)
			throw new Error("Marker not found in marker array");
		
		this.markers.splice(index, 1);
		
		this.dispatchEvent({type: "markerremoved", marker: marker});
		marker.dispatchEvent({type: "removed"});
	}
	
	WPGMZA.Map.prototype.removeAllMarkers = function(options)
	{
		for(var i = this.markers.length - 1; i >= 0; i--)
			this.removeMarker(this.markers[i]);
	}
	
	/**
	 * Gets a marker by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the marker to get
	 * @return {WPGMZA.Marker|null} The marker, or null if no marker with the specified ID is found
	 */
	WPGMZA.Map.prototype.getMarkerByID = function(id)
	{
		for(var i = 0; i < this.markers.length; i++)
		{
			if(this.markers[i].id == id)
				return this.markers[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.getMarkerByTitle = function(title)
	{
		if(typeof title == "string")
			for(var i = 0; i < this.markers.length; i++)
			{
				if(this.markers[i].title == title)
					return this.markers[i];
			}
		else if(title instanceof RegExp)
			for(var i = 0; i < this.markers.length; i++)
			{
				if(title.test(this.markers[i].title))
					return this.markers[i];
			}
		else
			throw new Error("Invalid argument");
		
		return null;
	}
	
	/**
	 * Removes a marker by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the marker to remove
	 * @fires markerremoved
	 * @fires WPGMZA.Marker#removed
	 */
	WPGMZA.Map.prototype.removeMarkerByID = function(id)
	{
		var marker = this.getMarkerByID(id);
		
		if(!marker)
			return;
		
		this.removeMarker(marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polygon} polygon The polygon to add
	 * @fires polygonadded
	 * @throws Argument must be an instance of WPGMZA.Polygon
	 */
	WPGMZA.Map.prototype.addPolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		polygon.map = this;
		
		this.polygons.push(polygon);
		this.dispatchEvent({type: "polygonadded", polygon: polygon});
		polygon.dispatchEvent({type: "added"});
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polygon} polygon The polygon to remove
	 * @fires polygonremoved
	 * @throws Argument must be an instance of WPGMZA.Polygon
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removePolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		if(polygon.map !== this)
			throw new Error("Wrong map error");
		
		polygon.map = null;
		
		this.polygons.splice(this.polygons.indexOf(polygon), 1);
		this.dispatchEvent({type: "polygonremoved", polygon: polygon});
	}
	
	/**
	 * Gets a polygon by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polygon to get
	 * @return {WPGMZA.Polygon|null} The polygon, or null if no polygon with the specified ID is found
	 */
	WPGMZA.Map.prototype.getPolygonByID = function(id)
	{
		for(var i = 0; i < this.polygons.length; i++)
		{
			if(this.polygons[i].id == id)
				return this.polygons[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a polygon by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polygon to remove
	 */
	WPGMZA.Map.prototype.removePolygonByID = function(id)
	{
		var polygon = this.getPolygonByID(id);
		
		if(!polygon)
			return;
		
		this.removePolygon(polygon);
	}
	
	/**
	 * Gets a polyline by ID
	 * @return void
	 */
	WPGMZA.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polyline} polyline The polyline to add
	 * @fires polylineadded
	 * @throws Argument must be an instance of WPGMZA.Polyline
	 */
	WPGMZA.Map.prototype.addPolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		polyline.map = this;
		
		this.polylines.push(polyline);
		this.dispatchEvent({type: "polylineadded", polyline: polyline});
		polyline.dispatchEvent({type: "added"});

	}
	
	/**
	 * Removes the specified polyline from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polyline} polyline The polyline to remove
	 * @fires polylineremoved
	 * @throws Argument must be an instance of WPGMZA.Polyline
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removePolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		if(polyline.map !== this)
			throw new Error("Wrong map error");
		
		polyline.map = null;
		
		this.polylines.splice(this.polylines.indexOf(polyline), 1);
		this.dispatchEvent({type: "polylineremoved", polyline: polyline});
	}
	
	/**
	 * Gets a polyline by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polyline to get
	 * @return {WPGMZA.Polyline|null} The polyline, or null if no polyline with the specified ID is found
	 */
	WPGMZA.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a polyline by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polyline to remove
	 */
	WPGMZA.Map.prototype.removePolylineByID = function(id)
	{
		var polyline = this.getPolylineByID(id);
		
		if(!polyline)
			return;
		
		this.removePolyline(polyline);
	}
	
	/**
	 * Adds the specified circle to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Circle} circle The circle to add
	 * @fires polygonadded
	 * @throws Argument must be an instance of WPGMZA.Circle
	 */
	WPGMZA.Map.prototype.addCircle = function(circle)
	{
		if(!(circle instanceof WPGMZA.Circle))
			throw new Error("Argument must be an instance of WPGMZA.Circle");
		
		circle.map = this;
		
		this.circles.push(circle);
		this.dispatchEvent({type: "circleadded", circle: circle});
		circle.dispatchEvent({type: "added"});

	}
	
	/**
	 * Removes the specified circle from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Circle} circle The circle to remove
	 * @fires circleremoved
	 * @throws Argument must be an instance of WPGMZA.Circle
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removeCircle = function(circle)
	{
		if(!(circle instanceof WPGMZA.Circle))
			throw new Error("Argument must be an instance of WPGMZA.Circle");
		
		if(circle.map !== this)
			throw new Error("Wrong map error");
		
		circle.map = null;
		
		this.circles.splice(this.circles.indexOf(circle), 1);
		this.dispatchEvent({type: "circleremoved", circle: circle});
	}
	
	/**
	 * Gets a circle by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the circle to get
	 * @return {WPGMZA.Circle|null} The circle, or null if no circle with the specified ID is found
	 */
	WPGMZA.Map.prototype.getCircleByID = function(id)
	{
		for(var i = 0; i < this.circles.length; i++)
		{
			if(this.circles[i].id == id)
				return this.circles[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a circle by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the circle to remove
	 */
	WPGMZA.Map.prototype.removeCircleByID = function(id)
	{
		var circle = this.getCircleByID(id);
		
		if(!circle)
			return;
		
		this.removeCircle(circle);
	}
	
	WPGMZA.Map.prototype.addRectangle = function(rectangle)
	{
		if(!(rectangle instanceof WPGMZA.Rectangle))
			throw new Error("Argument must be an instance of WPGMZA.Rectangle");
		
		rectangle.map = this;
		
		this.rectangles.push(rectangle);
		this.dispatchEvent({type: "rectangleadded", rectangle: rectangle});
		rectangle.dispatchEvent({type: "added"});
	}
	
	WPGMZA.Map.prototype.removeRectangle = function(rectangle)
	{
		if(!(rectangle instanceof WPGMZA.Rectangle))
			throw new Error("Argument must be an instance of WPGMZA.Rectangle");
		
		if(rectangle.map !== this)
			throw new Error("Wrong map error");
		
		rectangle.map = null;
		
		this.rectangles.splice(this.rectangles.indexOf(rectangle), 1);
		this.dispatchEvent({type: "rectangleremoved", rectangle: rectangle});
	}
	
	WPGMZA.Map.prototype.getRectangleByID = function(id)
	{
		for(var i = 0; i < this.rectangles.length; i++)
		{
			if(this.rectangles[i].id == id)
				return this.rectangles[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.removeRectangleByID = function(id)
	{
		var rectangle = this.getRectangleByID(id);
		
		if(!rectangle)
			return;
		
		this.removeRectangle(rectangle);
	}

	/**
	 * Adds the specified pointlabel to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Pointlabel} pointlabel The Point Label to add
	 * @fires pointlabeladded
	 * @throws Argument must be an instance of WPGMZA.Pointlabel
	 */
	WPGMZA.Map.prototype.addPointlabel = function(pointlabel)
	{
		if(!(pointlabel instanceof WPGMZA.Pointlabel))
			throw new Error("Argument must be an instance of WPGMZA.Pointlabel");
		
		pointlabel.map = this;
		
		this.pointlabels.push(pointlabel);
		this.dispatchEvent({type: "pointlabeladded", pointlabel: pointlabel});
	}

	/**
	 * Removes the specified pointlabel from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Pointlabel} pointlabel The Point Label to remove
	 * @fires pointlabelremoved
	 * @throws Argument must be an instance of WPGMZA.Pointlabel
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removePointlabel = function(pointlabel)
	{
		if(!(pointlabel instanceof WPGMZA.Pointlabel))
			throw new Error("Argument must be an instance of WPGMZA.Pointlabel");
		
		if(pointlabel.map !== this)
			throw new Error("Wrong map error");
		
		pointlabel.map = null;
		
		this.pointlabels.splice(this.pointlabels.indexOf(pointlabel), 1);
		this.dispatchEvent({type: "pointlabelremoved", pointlabel: pointlabel});
	}

	WPGMZA.Map.prototype.getPointlabelByID = function(id){
		for(var i = 0; i < this.pointlabels.length; i++){
			if(this.pointlabels[i].id == id)
				return this.pointlabels[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.removePointlabelByID = function(id){
		var pointlabel = this.getPointlabelByID(id);
		
		if(!pointlabel)
			return;
		
		this.removePointlabel(pointlabel);
	}
	
	/**
	 * Resets the map latitude, longitude and zoom to their starting values in the map settings.
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.resetBounds = function()
	{
		var latlng = new WPGMZA.LatLng(this.settings.map_start_lat, this.settings.map_start_lng);
		this.panTo(latlng);
		this.setZoom(this.settings.map_start_zoom);
	}
	
	/**
	 * Nudges the map viewport by the given pixel coordinates
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} x Number of pixels to nudge along the x axis
	 * @param {number} y Number of pixels to nudge along the y axis
	 * @throws Invalid coordinates supplied
	 */
	WPGMZA.Map.prototype.nudge = function(x, y)
	{
		var nudged = this.nudgeLatLng(this.getCenter(), x, y);
		
		this.setCenter(nudged);
	}
	
	WPGMZA.Map.prototype.nudgeLatLng = function(latLng, x, y)
	{
		var pixels = this.latLngToPixels(latLng);
		
		pixels.x += parseFloat(x);
		pixels.y += parseFloat(y);
		
		if(isNaN(pixels.x) || isNaN(pixels.y))
			throw new Error("Invalid coordinates supplied");
		
		return this.pixelsToLatLng(pixels);
	}
	
	WPGMZA.Map.prototype.animateNudge = function(x, y, origin, milliseconds)
	{
		var nudged;
		
		if(!origin)
			origin = this.getCenter();
		else if(!(origin instanceof WPGMZA.LatLng))
			throw new Error("Origin must be an instance of WPGMZA.LatLng");

		nudged = this.nudgeLatLng(origin, x, y);
		
		if(!milliseconds)
			milliseconds = WPGMZA.getScrollAnimationDuration();
		
		$(this).animate({
			lat: nudged.lat,
			lng: nudged.lng
		}, milliseconds);
	}
	
	/**
	 * Called when the window resizes
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.onWindowResize = function(event)
	{
		
	}
	
	/**
	 * Called when the engine map div is resized
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.onElementResized = function(event)
	{
		
	}
	
	/**
	 * Called when the map viewport bounds change. Fires the legacy bounds_changed event.
	 * @method
	 * @memberof WPGMZA.Map
	 * @fires boundschanged
	 * @fires bounds_changed
	 */
	WPGMZA.Map.prototype.onBoundsChanged = function(event)
	{
		// Native events
		this.trigger("boundschanged");
		
		// Google / legacy compatibility events
		this.trigger("bounds_changed");
	}
	
	/**
	 * Called when the map viewport becomes idle (eg movement done, tiles loaded)
	 * @method
	 * @memberof WPGMZA.Map
	 * @fires idle
	 */
	WPGMZA.Map.prototype.onIdle = function(event)
	{
		this.trigger("idle");
	}

	WPGMZA.Map.prototype.onClick = function(event){

	}

	/**
	 * On fullscreen change
	 * 
	 * @param bool fullscreen Is this map fullscreen
	 * 
	 * @return void 
	 */
	WPGMZA.Map.prototype.onFullScreenChange = function(fullscreen){
		this.trigger("fullscreenchange.map");

		/* Add or Remove the 'is-fullscreen' class */
		if(fullscreen){
			$(this.element).addClass('is-fullscreen');
		} else {
			$(this.element).removeClass('is-fullscreen');
		}
	}

	/**
	 * Find out if the map has visible markers. Only counts filterable markers (not the user location marker, store locator center point marker, etc.)
	 * @method
	 * @memberof WPGMZA.Map
	 * @returns {Boolean} True if at least one marker is visible
	 */
	WPGMZA.Map.prototype.hasVisibleMarkers = function()
	{
		var length = this.markers.length, marker;
		
		for(var i = 0; i < length; i++)
		{
			marker = this.markers[i];
			
			if(marker.isFilterable && marker.getVisible())
				return true;
		}
	
		return false;
	}

	/**
	 * Check if this map is full screen 
	 * 
	 * Note: Engine specific maps may need an override
	 * 
	 * @return bool
	*/
	WPGMZA.Map.prototype.isFullScreen = function(){
		if(WPGMZA.isFullScreen()){
			if(parseInt(window.screen.height) === parseInt(this.element.offsetHeight)){
				return true;
			}
		}
		return false;
	}
	
	WPGMZA.Map.prototype.closeAllInfoWindows = function()
	{
		this.markers.forEach(function(marker) {
			
			if(marker.infoWindow)
				marker.infoWindow.close();
				
		});
	}

	WPGMZA.Map.prototype.openStreetView = function(options){
		
	}

	WPGMZA.Map.prototype.closeStreetView = function(options){
		
	}
	
	$(document).ready(function(event) {
		
		if(!WPGMZA.visibilityWorkaroundIntervalID)
		{
			// This should handle all cases of tabs, accordions or any other offscreen maps
			var invisibleMaps = jQuery(".wpgmza_map:hidden");
			
			WPGMZA.visibilityWorkaroundIntervalID = setInterval(function() {
				
				jQuery(invisibleMaps).each(function(index, el) {
					
					if(jQuery(el).is(":visible"))
					{
						var id = jQuery(el).attr("data-map-id");
						var map = WPGMZA.getMapByID(id);
						
						map.onElementResized();
						
						invisibleMaps.splice(invisibleMaps.toArray().indexOf(el), 1);
					}
					
				});
				
			}, 1000);
		}
		
	});
	
});


// js/v8/maps-engine-dialog.js
/**
 * @namespace WPGMZA
 * @module MapsEngineDialog
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * The modal dialog presented to the user in the map edit page, prompting them to choose a map engine, if they haven't done so already
	 * @class WPGMZA.MapEngineDialog
	 * @constructor WPGMZA.MapEngineDialog
	 * @memberof WPGMZA
	 * @param {HTMLElement} element to create modal dialog from
	 */
	WPGMZA.MapsEngineDialog = function(element)
	{
		var self = this;
		
		this.element = element;

		if(window.wpgmzaUnbindSaveReminder)
			window.wpgmzaUnbindSaveReminder();


		/**
		 * As of V9.0.0
		 * 
		 * We no longer use this modal, but we do use it as a 'installation' redirect for simplicity
		 * 
		 * This just calls a new internal delegate method and doesn't use the remodal core, or popup actions
		*/
		if($(this.element).data('installer-link')){
			WPGMZA.initInstallerRedirect($(this.element).data('installer-link'));
			return;
		}


		$(element).remodal().open();
		$(element).show();
		$(element).find("input:radio").on("change", function(event) {
			
			$("#wpgmza-confirm-engine").prop("disabled", false);

			$("#wpgmza-confirm-engine").click();
			
		});
		
		$("#wpgmza-confirm-engine").on("click", function(event) {
			
			self.onButtonClicked(event);
			
		});
	}
	
	/**
	 * Triggered when an engine is selected. Makes an AJAX call to the server to save the selected engine.
	 * @method
	 * @memberof WPGMZA.MapEngineDialog
	 * @param {object} event The click event from the selected button.
	 */
	WPGMZA.MapsEngineDialog.prototype.onButtonClicked = function(event)
	{
		$(event.target).prop("disabled", true);
		
		$.ajax(WPGMZA.ajaxurl, {
			method: "POST",
			data: {
				action: "wpgmza_maps_engine_dialog_set_engine",
				engine: $("[name='wpgmza_maps_engine']:checked").val(),
				nonce: $("#wpgmza-maps-engine-dialog").attr("data-ajax-nonce")
			},
			success: function(response, status, xhr) {
				window.location.reload();
			}
		});
	}
	
	$(document).ready(function(event) {
		
		var element = $("#wpgmza-maps-engine-dialog");
		
		if(!element.length)
			return;
		
		if(WPGMZA.settings.wpgmza_maps_engine_dialog_done)
			return;
		
		if(WPGMZA.settings.wpgmza_google_maps_api_key && WPGMZA.settings.wpgmza_google_maps_api_key.length)
			return;

		if(WPGMZA.ignoreInstallerRedirect){
			/* We are still in paused installer mode */
			return;
		}

		WPGMZA.mapsEngineDialog = new WPGMZA.MapsEngineDialog(element);
		
	});
	
});

// js/v8/marker-filter.js
/**
 * @namespace WPGMZA
 * @module MarkerFilter
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.MarkerFilter = function(map)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.map = map;
	}
	
	WPGMZA.MarkerFilter.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.MarkerFilter.prototype.constructor = WPGMZA.MarkerFilter;
	
	WPGMZA.MarkerFilter.createInstance = function(map)
	{
		return new WPGMZA.MarkerFilter(map);
	}
	
	WPGMZA.MarkerFilter.prototype.getFilteringParameters = function()
	{
		var params = {map_id: this.map.id};
		
		if(this.map.storeLocator)
			params = $.extend(params, this.map.storeLocator.getFilteringParameters());
		
		return params;
	}
	
	WPGMZA.MarkerFilter.prototype.update = function(params, source)
	{
		var self = this;
		
		if(this.updateTimeoutID)
			return;
		
		if(!params)
			params = {};
		
		if(this.xhr)
		{
			this.xhr.abort();
			delete this.xhr;
		}
		
		function dispatchEvent(result)
		{
			var event = new WPGMZA.Event("filteringcomplete");
			
			event.map = self.map;
			event.source = source;
			
			event.filteredMarkers = result;
			event.filteringParams = params;
			
			self.onFilteringComplete(event);
			
			self.trigger(event);
			self.map.trigger(event);
		}
		
		this.updateTimeoutID = setTimeout(function() {
			
			params = $.extend(self.getFilteringParameters(), params);
			
			if(params.center instanceof WPGMZA.LatLng)
				params.center = params.center.toLatLngLiteral();
			
			if(params.hideAll)
			{
				// Hide all markers before a store locator search is done
				dispatchEvent([]);
				delete self.updateTimeoutID;
				return;
			}
			
			self.map.showPreloader(true);
			
			self.xhr = WPGMZA.restAPI.call("/markers", {
				data: {
					fields: ["id"],
					filter: JSON.stringify(params)
				},
				success: function(result, status, xhr) {
					
					self.map.showPreloader(false);
					
					dispatchEvent(result);
					
				},
				useCompressedPathVariable: true
			});
			
			delete self.updateTimeoutID;
			
		}, 0);
	}
	
	WPGMZA.MarkerFilter.prototype.onFilteringComplete = function(event)
	{
		var self = this;
		var map = [];
		
		event.filteredMarkers.forEach(function(data) {
			map[data.id] = true;
		});
		
		this.map.markers.forEach(function(marker) {
			if(!marker.isFilterable)
				return;
				
			var allowByFilter = map[marker.id] ? true : false;
			marker.isFiltered = !allowByFilter;
			marker.setVisible(allowByFilter);
			
		});
	}
	
});

// js/v8/marker.js
/**
 * @namespace WPGMZA
 * @module Marker
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Base class for markers. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Marker
	 * @constructor WPGMZA.Marker
	 * @memberof WPGMZA
	 * @param {object} [row] Data to map to this object (eg from the database)
	 * @augments WPGMZA.Feature
	 */
	WPGMZA.Marker = function(row)
	{
		var self = this;
		
		this._offset = {x: 0, y: 0};
		
		WPGMZA.assertInstanceOf(this, "Marker");
		
		this.lat = "36.778261";
		this.lng = "-119.4179323999";
		this.address = "California";
		this.title = null;
		this.description = "";
		this.link = "";
		this.icon = "";
		this.approved = 1;
		this.pic = null;
		
		this.isFilterable = true;
		this.disableInfoWindow = false;
		
		WPGMZA.Feature.apply(this, arguments);
		
		if(row && row.heatmap)
			return; // Don't listen for these events on heatmap markers.
		
		if(row)
			this.on("init", function(event) {
				if(row.position)
					this.setPosition(row.position);
				
				if(row.map)
					row.map.addMarker(this);
			});
		
		this.addEventListener("added", function(event) {
			self.onAdded(event);
		});
		
		this.handleLegacyGlobals(row);
	}
	
	WPGMZA.Marker.prototype = Object.create(WPGMZA.Feature.prototype);
	WPGMZA.Marker.prototype.constructor = WPGMZA.Marker;
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Marker.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProMarker;
				return WPGMZA.OLMarker;
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProMarker;
				return WPGMZA.GoogleMarker;
				break;
		}
	}
	
	/**
	 * Creates an instance of a marker, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {object} [row] Data to map to this object (eg from the database)
	 */
	WPGMZA.Marker.createInstance = function(row)
	{
		var constructor = WPGMZA.Marker.getConstructor();
		return new constructor(row);
	}
	
	WPGMZA.Marker.ANIMATION_NONE			= "0";
	WPGMZA.Marker.ANIMATION_BOUNCE			= "1";
	WPGMZA.Marker.ANIMATION_DROP			= "2";
	
	Object.defineProperty(WPGMZA.Marker.prototype, "offsetX", {
		
		get: function()
		{
			return this._offset.x;
		},
		
		set: function(value)
		{
			this._offset.x = value;
			this.updateOffset();
		}
		
	});
	
	Object.defineProperty(WPGMZA.Marker.prototype, "offsetY", {
		
		get: function()
		{
			return this._offset.y;
		},
		
		set: function(value)
		{
			this._offset.y = value;
			this.updateOffset();
		}
		
	});
	
	/**
	 * Called when the marker has been added to a map
	 * @method
	 * @memberof WPGMZA.Marker
	 * @listens module:WPGMZA.Marker~added
	 * @fires module:WPGMZA.Marker~select When this marker is targeted by the marker shortcode attribute
	 */
	WPGMZA.Marker.prototype.onAdded = function(event)
	{
		var self = this;
		
		this.addEventListener("click", function(event) {
			self.onClick(event);
		});
		
		this.addEventListener("mouseover", function(event) {
			self.onMouseOver(event);
		});
		
		this.addEventListener("select", function(event) {
			self.onSelect(event);
		});
		
		if(this.map.settings.marker == this.id){
			self.trigger("select");
		}
		
		if(this.infoopen == "1"){
			// Flag a one-shot (one use) call to disable auto-pan controllers in the native engines
			this._osDisableAutoPan = true;

			this.openInfoWindow(true);
		}
	}
	
	WPGMZA.Marker.prototype.handleLegacyGlobals = function(row)
	{
		if(!(WPGMZA.settings.useLegacyGlobals && this.map_id && this.id))
			return;
		
		var m;
		if(WPGMZA.pro_version && (m = WPGMZA.pro_version.match(/\d+/)))
		{
			if(m[0] <= 7)
				return; // Don't touch the legacy globals
		}
		
		if(!WPGMZA.legacyGlobals.marker_array[this.map_id])
			WPGMZA.legacyGlobals.marker_array[this.map_id] = [];
		
		WPGMZA.legacyGlobals.marker_array[this.map_id][this.id] = this;
		
		if(!WPGMZA.legacyGlobals.wpgmaps_localize_marker_data[this.map_id])
			WPGMZA.legacyGlobals.wpgmaps_localize_marker_data[this.map_id] = [];
		
		var cloned = $.extend({marker_id: this.id}, row);
		WPGMZA.legacyGlobals.wpgmaps_localize_marker_data[this.map_id][this.id] = cloned;
	}
	
	WPGMZA.Marker.prototype.initInfoWindow = function()
	{
		if(this.infoWindow)
			return;
		
		this.infoWindow = WPGMZA.InfoWindow.createInstance();
	}
	
	/**
	 * Placeholder for future use
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.openInfoWindow = function(autoOpen) {

		if(!this.map) {
			console.warn("Cannot open infowindow for marker with no map");
			return;
		}
		
		// NB: This is a workaround for "undefined" in InfoWindows (basic only) on map edit page
		// removed by Nick 30 Dec 2020
		// 
		//if(WPGMZA.currentPage == "map-edit" && !WPGMZA.pro_version)
		//	return;
		
		if(!autoOpen){
			if(this.map.lastInteractedMarker)
				this.map.lastInteractedMarker.infoWindow.close();
			this.map.lastInteractedMarker = this;
		}
		
		this.initInfoWindow();
		this.infoWindow.open(this.map, this);
	}
	
	/**
	 * Called when the marker has been clicked
	 * @method
	 * @memberof WPGMZA.Marker
	 * @listens module:WPGMZA.Marker~click
	 */
	WPGMZA.Marker.prototype.onClick = function(event)
	{
		
	}
	
	/**
	 * Called when the marker has been selected, either by the icon being clicked, or from a marker listing
	 * @method
	 * @memberof WPGMZA.Marker
	 * @listens module:WPGMZA.Marker~select
	 */
	WPGMZA.Marker.prototype.onSelect = function(event)
	{
		this.openInfoWindow();
	}
	
	/**
	 * Called when the user hovers the mouse over this marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @listens module:WPGMZA.Marker~mouseover
	 */
	WPGMZA.Marker.prototype.onMouseOver = function(event)
	{
		if(WPGMZA.settings.wpgmza_settings_map_open_marker_by == WPGMZA.InfoWindow.OPEN_BY_HOVER)
			this.openInfoWindow();
	}
	
	/**
	 * Gets the marker icon image URL, without the protocol prefix
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {string} The URL to the markers icon image
	 */
	WPGMZA.Marker.prototype.getIcon = function()
	{
		function stripProtocol(url)
		{
			if(typeof url != "string")
				return url;
			
			return url.replace(/^http(s?):/, "");
		}
		
		if(WPGMZA.defaultMarkerIcon)
			return stripProtocol(WPGMZA.defaultMarkerIcon);
		
		return stripProtocol(WPGMZA.settings.default_marker_icon);
	}
	
	/**
	 * Gets the position of the marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {object} LatLng literal of this markers position
	 */
	WPGMZA.Marker.prototype.getPosition = function()
	{
		return new WPGMZA.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		});
	}
	
	/**
	 * Sets the position of the marker.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {object|WPGMZA.LatLng} latLng The position either as a LatLng literal or instance of WPGMZA.LatLng.
	 */
	WPGMZA.Marker.prototype.setPosition = function(latLng)
	{
		if(latLng instanceof WPGMZA.LatLng)
		{
			this.lat = latLng.lat;
			this.lng = latLng.lng;
		}
		else
		{
			this.lat = parseFloat(latLng.lat);
			this.lng = parseFloat(latLng.lng);
		}
	}
	
	WPGMZA.Marker.prototype.setOffset = function(x, y)
	{
		this._offset.x = x;
		this._offset.y = y;
		
		this.updateOffset();
	}
	
	WPGMZA.Marker.prototype.updateOffset = function()
	{
		
	}
	
	/**
	 * Returns the animation set on this marker (see WPGMZA.Marker ANIMATION_* constants).
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.getAnimation = function()
	{
		return this.anim;
	}
	
	/**
	 * Sets the animation for this marker (see WPGMZA.Marker ANIMATION_* constants).
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {int} animation The animation to set.
	 */
	WPGMZA.Marker.prototype.setAnimation = function(animation)
	{
		
	}
	
	/**
	 * Get the marker visibility
	 * @method
	 * @todo Implement
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.getVisible = function()
	{
		
	}
	
	/**
	 * Set the marker visibility. This is used by the store locator etc. and is not a setting. Closes the InfoWindow if the marker is being hidden and the InfoWindow for this marker is open.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {bool} visible Whether the marker should be visible or not
	 */
	WPGMZA.Marker.prototype.setVisible = function(visible)
	{
		if(!visible && this.infoWindow)
			this.infoWindow.close();
	}
	
	WPGMZA.Marker.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * Sets the map this marker should be displayed on. If it is already on a map, it will be removed from that map first, before being added to the supplied map.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {WPGMZA.Map} map The map to add this markmer to
	 */
	WPGMZA.Marker.prototype.setMap = function(map)
	{
		if(!map)
		{
			if(this.map)
				this.map.removeMarker(this);
		}
		else
			map.addMarker(this);
		
		this.map = map;
	}
	
	/**
	 * Gets whether this marker is draggable or not
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {bool} True if the marker is draggable
	 */
	WPGMZA.Marker.prototype.getDraggable = function()
	{
		
	}
	
	/**
	 * Sets whether the marker is draggable
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {bool} draggable Set to true to make this marker draggable
	 */
	WPGMZA.Marker.prototype.setDraggable = function(draggable)
	{
		
	}
	
	/**
	 * Sets options on this marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {object} options An object containing the options to be set
	 */
	WPGMZA.Marker.prototype.setOptions = function(options)
	{
		
	}
	
	WPGMZA.Marker.prototype.setOpacity = function(opacity)
	{
		
	}
	
	/**
	 * Centers the map this marker belongs to on this marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @throws Marker hasn't been added to a map
	 */
	WPGMZA.Marker.prototype.panIntoView = function()
	{
		if(!this.map)
			throw new Error("Marker hasn't been added to a map");
		
		this.map.setCenter(this.getPosition());
	}
	
	/**
	 * Overrides Feature.toJSON, serializes the marker to a JSON object
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {object} A JSON representation of this marker
	 */
	WPGMZA.Marker.prototype.toJSON = function()
	{
		var result = WPGMZA.Feature.prototype.toJSON.call(this);
		var position = this.getPosition();
		
		$.extend(result, {
			lat: position.lat,
			lng: position.lng,
			address: this.address,
			title: this.title,
			description: this.description,
			link: this.link,
			icon: this.icon,
			pic: this.pic,
			approved: this.approved
		});
		
		return result;
	}
	
	
});

// js/v8/modern-store-locator-circle.js
/**
 * @namespace WPGMZA
 * @module ModernStoreLocatorCircle
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * This is the base class the modern store locator circle. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.ModernStoreLocatorCircle
	 * @constructor WPGMZA.ModernStoreLocatorCircle
	 * @param {int} map_id The ID of the map this circle belongs to
	 * @param {object} [settings] Settings to pass into this circle, such as strokeColor
	 */
	WPGMZA.ModernStoreLocatorCircle = function(map_id, settings) {
		var self = this;
		var map;
		
		if(WPGMZA.isProVersion())
			map = this.map = WPGMZA.getMapByID(map_id);
		else
			map = this.map = WPGMZA.maps[0];
		
		this.map_id = map_id;
		this.mapElement = map.element;
		this.mapSize = {
			width:  $(this.mapElement).width(),
			height: $(this.mapElement).height()
		};
			
		this.initCanvasLayer();
		
		this.settings = {
			center: new WPGMZA.LatLng(0, 0),
			radius: 1,
			color: "#ff0000",
			
			shadowColor: "white",
			shadowBlur: 4,
			
			centerRingRadius: 10,
			centerRingLineWidth: 3,

			numInnerRings: 9,
			innerRingLineWidth: 1,
			innerRingFade: true,
			
			numOuterRings: 7,
			
			ringLineWidth: 1,
			
			mainRingLineWidth: 2,
			
			numSpokes: 6,
			spokesStartAngle: Math.PI / 2,
			
			numRadiusLabels: 6,
			radiusLabelsStartAngle: Math.PI / 2,
			radiusLabelFont: "13px sans-serif",
			
			visible: false
		};
		
		if(settings)
			this.setOptions(settings);
	};
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.ModernStoreLocatorCircle.createInstance = function(map, settings) {
		
		if(WPGMZA.settings.engine == "google-maps")
			return new WPGMZA.GoogleModernStoreLocatorCircle(map, settings);
		else
			return new WPGMZA.OLModernStoreLocatorCircle(map, settings);
		
	};
	
	/**
	 * Abstract function to initialize the canvas layer
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.initCanvasLayer = function() {
		
	}
	
	/**
	 * Handles the map viewport being resized
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.onResize = function(event) { 
		this.draw();
	};
	
	/**
	 * Updates and redraws the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.onUpdate = function(event) { 
		this.draw();
	};
	
	/**
	 * Sets options on the circle (for example, strokeColor)
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {object} options An object of options to iterate over and set on this circle.
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setOptions = function(options) {
		for(var name in options)
		{
			var functionName = "set" + name.substr(0, 1).toUpperCase() + name.substr(1);
			
			if(typeof this[functionName] == "function")
				this[functionName](options[name]);
			else
				this.settings[name] = options[name];
		}
	};
	
	/**
	 * Gets the resolution scale for drawing on the circles canvas.
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {number} The device pixel ratio, or 1 where that is not present.
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getResolutionScale = function() {
		return window.devicePixelRatio || 1;
	};
	
	/**
	 * Returns the center of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {object} A latLng literal
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getCenter = function() {
		return this.getPosition();
	};
	
	/**
	 * Sets the center of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {WPGMZA.LatLng|object} A LatLng literal or instance of WPGMZA.LatLng
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setCenter = function(value) {
		this.setPosition(value);
	};
	
	/**
	 * Gets the center of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {object} The center as a LatLng literal
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getPosition = function() {
		return this.settings.center;
	};
	
	/**
	 * Alias for setCenter
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setPosition = function(position) {
		this.settings.center = position;
	};
	
	/**
	 * Gets the circle radius, in kilometers
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {number} The circles radius, in kilometers
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getRadius = function() {
		return this.settings.radius;
	};
	
	/**
	 * Sets the circles radius, in kilometers
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {number} radius The radius, in kilometers
	 * @throws Invalid radius
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setRadius = function(radius) {
		if(isNaN(radius))
			throw new Error("Invalid radius");
		
		this.settings.radius = radius;
	};
	
	/**
	 * Gets the visibility of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {bool} Whether or not the circle is visible
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getVisible = function() {
		return this.settings.visible;
	};
	
	/**
	 * Sets the visibility of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {bool} visible Whether the circle should be visible
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setVisible = function(visible) {
		this.settings.visible = visible;
	};
	
	/**
	 * Abstract function to get the transformed circle radius (see subclasses)
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {number} km The input radius, in kilometers
	 * @throws Abstract function called
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		throw new Error("Abstract function called");
	}
	
	/**
	 * Abstract function to set the canvas context
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {string} type The context type
	 * @throws Abstract function called
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		throw new Error("Abstract function called");
	}
	
	/**
	 * Abstract function to get the canvas dimensions
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @throws Abstract function called
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		throw new Error("Abstract function called");
	}
	
	/**
	 * Validates the circle settings and corrects them where they are invalid
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.validateSettings = function()
	{
		if(!WPGMZA.isHexColorString(this.settings.color))
			this.settings.color = "#ff0000";
	}
	
	/**
	 * Draws the circle to the canvas
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.draw = function() {
		
		this.validateSettings();
		
		var settings = this.settings;
		var canvasDimensions = this.getCanvasDimensions();
		
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;
		
		var map = this.map;
		var resolutionScale = this.getResolutionScale();
		
		context = this.getContext("2d");
        context.clearRect(0, 0, canvasWidth, canvasHeight);

		if(!settings.visible)
			return;
		
		context.shadowColor = settings.shadowColor;
		context.shadowBlur = settings.shadowBlur;
		
		// NB: 2018/02/13 - Left this here in case it needs to be calibrated more accurately
		/*if(!this.testCircle)
		{
			this.testCircle = new google.maps.Circle({
				strokeColor: "#ff0000",
				strokeOpacity: 0.5,
				strokeWeight: 3,
				map: this.map,
				center: this.settings.center
			});
		}
		
		this.testCircle.setCenter(settings.center);
		this.testCircle.setRadius(settings.radius * 1000);*/
		
        // Reset transform
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        var scale = this.getScale();
        context.scale(scale, scale);

		// Translate by world origin
		var offset = this.getWorldOriginOffset();
		context.translate(offset.x, offset.y);

        // Get center and project to pixel space
		var center = new WPGMZA.LatLng(this.settings.center);
		var worldPoint = this.getCenterPixels();
		
		var rgba = WPGMZA.hexToRgba(settings.color);
		var ringSpacing = this.getTransformedRadius(settings.radius) / (settings.numInnerRings + 1);
		
		// TODO: Implement gradients for color and opacity
		
		// Inside circle (fixed?)
        context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(
			worldPoint.x, 
			worldPoint.y, 
			this.getTransformedRadius(settings.centerRingRadius) / scale, 0, 2 * Math.PI
		);
		context.stroke();
		context.closePath();
		
		// Spokes
		var radius = this.getTransformedRadius(settings.radius) + (ringSpacing * settings.numOuterRings) + 1;
		var grad = context.createRadialGradient(0, 0, 0, 0, 0, radius);
		var rgba = WPGMZA.hexToRgba(settings.color);
		var start = WPGMZA.rgbaToString(rgba), end;
		var spokeAngle;
		
		rgba.a = 0;
		end = WPGMZA.rgbaToString(rgba);
		
		grad.addColorStop(0, start);
		grad.addColorStop(1, end);
		
		context.save();
		
		context.translate(worldPoint.x, worldPoint.y);
		context.strokeStyle = grad;
		context.lineWidth = 2 / scale;
		
		for(var i = 0; i < settings.numSpokes; i++)
		{
			spokeAngle = settings.spokesStartAngle + (Math.PI * 2) * (i / settings.numSpokes);
			
			x = Math.cos(spokeAngle) * radius;
			y = Math.sin(spokeAngle) * radius;
			
			context.setLineDash([2 / scale, 15 / scale]);
			
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(x, y);
			context.stroke();
		}
		
		context.setLineDash([]);
		
		context.restore();
		
		// Inner ringlets
		context.lineWidth = (1 / scale) * settings.innerRingLineWidth;
		
		for(var i = 1; i <= settings.numInnerRings; i++)
		{
			var radius = i * ringSpacing;
			
			if(settings.innerRingFade)
				rgba.a = 1 - (i - 1) / settings.numInnerRings;
			
			context.strokeStyle = WPGMZA.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		}
		
		// Main circle
		context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(worldPoint.x, worldPoint.y, this.getTransformedRadius(settings.radius), 0, 2 * Math.PI);
		context.stroke();
		context.closePath();
		
		// Outer ringlets
		var radius = radius + ringSpacing;
		for(var i = 0; i < settings.numOuterRings; i++)
		{
			if(settings.innerRingFade)
				rgba.a = 1 - i / settings.numOuterRings;
			
			context.strokeStyle = WPGMZA.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		
			radius += ringSpacing;
		}
		
		// Text
		if(settings.numRadiusLabels > 0)
		{
			var m;
			var radius = this.getTransformedRadius(settings.radius);
			var clipRadius = (12 * 1.1) / scale;
			var x, y;
			
			if(m = settings.radiusLabelFont.match(/(\d+)px/))
				clipRadius = (parseInt(m[1]) / 2 * 1.1) / scale;
			
			context.font = settings.radiusLabelFont;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = settings.color;
			
			context.save();
			
			context.translate(worldPoint.x, worldPoint.y)
			
			for(var i = 0; i < settings.numRadiusLabels; i++)
			{
				var spokeAngle = settings.radiusLabelsStartAngle + (Math.PI * 2) * (i / settings.numRadiusLabels);
				var textAngle = spokeAngle + Math.PI / 2;
				var text = settings.radiusString;
				var width;
				
				if(Math.sin(spokeAngle) > 0)
					textAngle -= Math.PI;
				
				x = Math.cos(spokeAngle) * radius;
				y = Math.sin(spokeAngle) * radius;
				
				context.save();
				
				context.translate(x, y);
				
				context.rotate(textAngle);
				context.scale(1 / scale, 1 / scale);
				
				width = context.measureText(text).width;
				height = width / 2;
				context.clearRect(-width, -height, 2 * width, 2 * height);
				
				context.fillText(settings.radiusString, 0, 0);
				
				context.restore();
			}
			
			context.restore();
		}
	}
	
});

// js/v8/modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module ModernStoreLocator
 * @requires WPGMZA
 * @pro-requires WPGMZA.UseMyLocationButton
 */
jQuery(function($) {
	
	/**
	 * The new modern look store locator. It takes the elements from the default look and moves them into the map, wrapping in a new element so we can apply new styles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.ModernStoreLocator
	 * @constructor WPGMZA.ModernStoreLocator
	 * @memberof WPGMZA
	 * @param {int} map_id The ID of the map this store locator belongs to
	 */
	WPGMZA.ModernStoreLocator = function(map_id)
	{
		var self = this;
		var original;
		var map = WPGMZA.getMapByID(map_id);
		
		WPGMZA.assertInstanceOf(this, "ModernStoreLocator");
		
		if(WPGMZA.isProVersion())
			original = $(".wpgmza_sl_search_button[mid='" + map_id + "'], .wpgmza_sl_search_button_" + map_id).closest(".wpgmza_sl_main_div");
		else
			original = $(".wpgmza_sl_search_button").closest(".wpgmza_sl_main_div");
		
		if(!original.length)
			return;
		
		// Build / re-arrange elements
		this.element = $("<div class='wpgmza-modern-store-locator'><div class='wpgmza-inner wpgmza-modern-hover-opaque'/></div>")[0];
		
		var inner = $(this.element).find(".wpgmza-inner");
		
		var addressInput;
		if(WPGMZA.isProVersion())
			addressInput = $(original).find(".addressInput");
		else
			addressInput = $(original).find("#addressInput");
		
		if(map.settings.store_locator_query_string && map.settings.store_locator_query_string.length)
			addressInput.attr("placeholder", map.settings.store_locator_query_string);
		
		inner.append(addressInput);
		
		var titleSearch = $(original).find("[id='nameInput_" + map_id + "']");
		if(titleSearch.length)
		{
			var placeholder = map.settings.store_locator_name_string;
			if(placeholder && placeholder.length)
				titleSearch.attr("placeholder", placeholder);
			inner.append(titleSearch);
		}
		
		var button;
		if(button = $(original).find("button.wpgmza-use-my-location"))
			inner.append(button);
		
		$(addressInput).on("keydown keypress", function(event) {
			
			if(event.keyCode == 13 && self.searchButton.is(":visible"))
				self.searchButton.trigger("click");
			
		});
		
		$(addressInput).on("input", function(event) {
			
			self.searchButton.show();
			self.resetButton.hide();
			
		});
		
		inner.append($(original).find("select.wpgmza_sl_radius_select"));
		// inner.append($(original).find(".wpgmza_filter_select_" + map_id));
		
		// Buttons
		this.searchButton = $(original).find( ".wpgmza_sl_search_button, .wpgmza_sl_search_button_div" );
		inner.append(this.searchButton);
		
		this.resetButton = $(original).find( ".wpgmza_sl_reset_button_div" );
		inner.append(this.resetButton);
		
		this.resetButton.on("click", function(event) {
			resetLocations(map_id);
		});
		
		this.resetButton.hide();
		
		if(WPGMZA.isProVersion())
		{
			this.searchButton.on("click", function(event) {
				if($("addressInput_" + map_id).val() == 0)
					return;
				
				self.searchButton.hide();
				self.resetButton.show();
				
				map.storeLocator.state = WPGMZA.StoreLocator.STATE_APPLIED;
			});
			this.resetButton.on("click", function(event) {
				self.resetButton.hide();
				self.searchButton.show();
				
				map.storeLocator.state = WPGMZA.StoreLocator.STATE_INITIAL;
			});
		}
		
		// Distance type
		inner.append($("#wpgmza_distance_type_" + map_id));
		
		// Categories
		var container = $(original).find(".wpgmza_cat_checkbox_holder");
		var ul = $(container).children("ul");
		var items = $(container).find("li");
		var numCategories = 0;
		
		//$(items).find("ul").remove();
		//$(ul).append(items);
		
		var icons = [];
		
		items.each(function(index, el) {
			var id = $(el).attr("class").match(/\d+/);
			
			for(var category_id in wpgmza_category_data) {
				
				if(id == category_id) {
					var src = wpgmza_category_data[category_id].image;
					var icon = $('<div class="wpgmza-chip-icon"/>');
					
					icon.css({
						"background-image": "url('" + src + "')",
						"width": $("#wpgmza_cat_checkbox_" + category_id + " + label").height() + "px"
					});
					icons.push(icon);
					
                    if(src != null && src != ""){
					   //$(el).find("label").prepend(icon);
                       $("#wpgmza_cat_checkbox_" + category_id + " + label").prepend(icon);
                    }
					
					numCategories++;
					
					break;
				}
				
			}
		});

        $(this.element).append(container);

		
		if(numCategories) {
			this.optionsButton = $('<span class="wpgmza_store_locator_options_button"><i class="fa fa-list"></i></span>');
			$(this.searchButton).before(this.optionsButton);
		}
		
		setInterval(function() {
			
			icons.forEach(function(icon) {
				var height = $(icon).height();
				$(icon).css({"width": height + "px"});
				$(icon).closest("label").css({"padding-left": height + 8 + "px"});
			});
			
			$(container).css("width", $(self.element).find(".wpgmza-inner").outerWidth() + "px");
			
		}, 1000);
		
		$(this.element).find(".wpgmza_store_locator_options_button").on("click", function(event) {
			
			if(container.hasClass("wpgmza-open"))
				container.removeClass("wpgmza-open");
			else
				container.addClass("wpgmza-open");
			
		});
		
		// Remove original element
		$(original).remove();
		
		// Event listeners
		$(this.element).find("input, select").on("focus", function() {
			$(inner).addClass("active");
		});
		
		$(this.element).find("input, select").on("blur", function() {
			$(inner).removeClass("active");
		});
		
		$(this.element).on("mouseover", "li.wpgmza_cat_checkbox_item_holder", function(event) {
			self.onMouseOverCategory(event);
		});
		
		$(this.element).on("mouseleave", "li.wpgmza_cat_checkbox_item_holder", function(event) {
			self.onMouseLeaveCategory(event);
		});
		
		$('body').on('click', '.wpgmza_store_locator_options_button', function(event) {
			setTimeout(function(){

				if ($('.wpgmza_cat_checkbox_holder').hasClass('wpgmza-open')) {

					var p_cat = $( ".wpgmza_cat_checkbox_holder" );
					var position_cat = p_cat.position().top + p_cat.outerHeight(true) + $('.wpgmza-modern-store-locator').height();
			
					var $p_map = $('.wpgmza_map');  
					var position_map = $p_map.position().top + $p_map.outerHeight(true); 

					var cat_height = position_cat;

					if (cat_height >= position_map) {
			
						$('.wpgmza_cat_ul').css('overflow', 'scroll ');
					
						$('.wpgmza_cat_ul').css('height', '100%');
				
						$('.wpgmza-modern-store-locator').css('height','100%');
						$('.wpgmza_cat_checkbox_holder.wpgmza-open').css({'padding-bottom': '50px', 'height': '100%'});
					}
				}
			}, 500);
		});

	}
	
	/**
	 * Creates an instance of a modern store locator, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.ModernStoreLocator
	 * @param {int} map_id The ID of the map this store locator belongs to
	 * @return {WPGMZA.ModernStoreLocator} An instance of WPGMZA.ModernStoreLocator
	 */
	WPGMZA.ModernStoreLocator.createInstance = function(map_id) {
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return new WPGMZA.OLModernStoreLocator(map_id);
				break;
			
			default:
				return new WPGMZA.GoogleModernStoreLocator(map_id);
				break;
		}
	}
	
	// TODO: Move these to a Pro module
	WPGMZA.ModernStoreLocator.prototype.onMouseOverCategory = function(event)
	{
		var li = event.currentTarget;
		
		$(li).children("ul.wpgmza_cat_checkbox_item_holder").stop(true, false).fadeIn();
	}
	
	WPGMZA.ModernStoreLocator.prototype.onMouseLeaveCategory = function(event)
	{
		var li = event.currentTarget;
		
		$(li).children("ul.wpgmza_cat_checkbox_item_holder").stop(true, false).fadeOut();
	}
	
});

// js/v8/native-maps-icon.js
/**
 * @namespace WPGMZA
 * @module NativeMapsAppIcon
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Small utility class to create an icon for the native maps app, an Apple icon on iOS devices, a Google icon on other devices
	 * @method WPGMZA.NativeMapsAppIcon
	 * @constructor WPGMZA.NativeMapsAppIcon
	 * @memberof WPGMZA
	 */
	WPGMZA.NativeMapsAppIcon = function() {
		if(navigator.userAgent.match(/^Apple|iPhone|iPad|iPod/))
		{
			this.type = "apple";
			this.element = $('<span><i class="fab fa fa-apple" aria-hidden="true"></i></span>');
		}
		else
		{
			this.type = "google";
			this.element = $('<span><i class="fab fa fa-google" aria-hidden="true"></i></span>');
		}
	};
	
});

// js/v8/persistent-admin-notice.js
/**
 * @namespace WPGMZA
 * @module PersistentAdminNotice
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.PersistentAdminNotice = function(element, options){
        if(!(element instanceof HTMLElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.dismissButton = this.element.find('.notice-dismiss');

        this.ajaxActionButton = this.element.find('a[data-ajax]');

        this.bindEvents();
    }

    WPGMZA.extend(WPGMZA.PersistentAdminNotice, WPGMZA.EventDispatcher);

    WPGMZA.PersistentAdminNotice.createInstance = function(element) {
        return new WPGMZA.PersistentAdminNotice(element);
    }

    WPGMZA.PersistentAdminNotice.prototype.bindEvents = function(){
        let self = this;
        this.dismissButton.on('click', function(event) {
            self.onDismiss($(this));
        });

        this.ajaxActionButton.on('click', function(event) {
            event.preventDefault();
            self.onAjaxAction($(this));
        });
    }

    WPGMZA.PersistentAdminNotice.prototype.onDismiss = function(item){
        const noticeSlug = this.element.data('slug');

        const data = {
            action  : 'wpgmza_dismiss_persistent_notice',
            slug : noticeSlug,
            wpgmza_security : WPGMZA.ajaxnonce
        };

        $.ajax(WPGMZA.ajaxurl, {
            method: "POST",
            data: data,
            success: function(response, status, xhr) {
                // Nothing to do
            },
            error : function(){}
        });
    }

    WPGMZA.PersistentAdminNotice.prototype.onAjaxAction = function(item){
        if(item.data('disabled')){
            return;
        }

        const action = item.data('ajax-action');

        item.attr('data-disabled', 'true');
        item.css('opacity', "0.5");

        if(action){
            const data = {
                action : 'wpgmza_persisten_notice_quick_action',
                relay : action,
                wpgmza_security : WPGMZA.ajaxnonce
            };

            $.ajax(WPGMZA.ajaxurl, {
                method: "POST",
                data : data,
                success : function(response){
                    window.location.reload();
                },
                error: function(){}
            });
        }
    }

    $(document.body).ready(function(){
        $(".wpgmza-persistent-notice").each(function(index, el) {
            el.wpgmzaPersistentAdminNotice = WPGMZA.PersistentAdminNotice.createInstance(el);
        });
    });
});

// js/v8/pointlabel.js
/**
 * @namespace WPGMZA
 * @module Pointlabel
 * @requires WPGMZA.Feature
 */
jQuery(function($) {
	
	WPGMZA.Pointlabel = function(options, pointlabel){
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Pointlabel");
		
		if(!options)
			options = {};
		
		if(options.map){
			this.map = options.map;
		} else if(!options.map && options.map_id){
			let map = WPGMZA.getMapByID(options.map_id);
			if(map){
				this.map = map;
			}
		} 

		this.center = new WPGMZA.LatLng();


		WPGMZA.Feature.apply(this, arguments);

		if(pointlabel){
			this.setPosition(pointlabel.getPosition());

			if(pointlabel.marker){
				this.marker = pointlabel.marker;
			}
		}
	}
	
	WPGMZA.Pointlabel.prototype = Object.create(WPGMZA.Feature.prototype);
	WPGMZA.Pointlabel.prototype.constructor = WPGMZA.Pointlabel;

	Object.defineProperty(WPGMZA.Pointlabel.prototype, "map", {
		enumerable: true,
		"get": function(){
			if(this._map){
				return this._map;
			}
			
			return null;
		},
		"set" : function(a){
			if(this.textFeature && !a){
				this.textFeature.remove();
			}
			this._map = a;
		}
		
	});

	WPGMZA.Pointlabel.getConstructor = function(){
		switch(WPGMZA.settings.engine){
			case "open-layers":
				if(WPGMZA.isProVersion()){
					return WPGMZA.OLProPointlabel;
					break;
				}
				return WPGMZA.OLPointlabel;
				break;
			
			default:
				if(WPGMZA.isProVersion()){
					return WPGMZA.GoogleProPointlabel;
					break;
				}
				return WPGMZA.GooglePointlabel;
				break;
		}
	}

	WPGMZA.Pointlabel.createInstance = function(options, pointlabel){
		var constructor = WPGMZA.Pointlabel.getConstructor();
		return new constructor(options, pointlabel);
	}

	WPGMZA.Pointlabel.createEditableMarker = function(options){
		var options = $.extend({
			draggable: true,
			disableInfoWindow: true
		}, options);
		
		if(options.pointlabel){
			let latLng = options.pointlabel.getPosition();
			options.lat = latLng.lat;
			options.lng = latLng.lng;
		}
		

		var marker = WPGMZA.Marker.createInstance(options);
		
		// NB: Hack for constructor not accepting icon prooperly. Once it does, this can be removed
		var callback = function(){
			try{
				// Try use Pro method to set a custom icon
				marker.setIcon(WPGMZA.labelpointIcon);
			} catch (ex){ }
			
			marker.off("added", callback);
		};

		marker.on("added", callback);

		return marker;
	}

	WPGMZA.Pointlabel.prototype.setEditable = function(editable){
		var self = this;
		
		if(this.marker){
			this.marker.map.removeMarker(this.marker);
			delete this.marker;
		}
		
		if(this._prevMap){
			delete this._prevMap;
		}
		
		if(editable){
			var options = {
				pointlabel: this
			};

			this.marker = WPGMZA.Pointlabel.createEditableMarker(options);
			this.map.addMarker(this.marker);
			
			
			this._dragEndCallback = function(event) {
				self.onDragEnd(event);
			};

			var map = this.map;

			this.marker.on("dragend", this._dragEndCallback);
			
			map.on("pointlabelremoved", function(event) {
				if(event.pointlabel !== self)
					return;
			});
		}
	}

	WPGMZA.Pointlabel.prototype.onDragEnd = function(event){
		if(!(event.target instanceof WPGMZA.Marker))
			return;
			
		
		if(!this.marker)
			return;

		if(event.latLng){
			this.setPosition(event.latLng);
		}
		
		this.trigger("change");
	}

	WPGMZA.Pointlabel.prototype.onMapMouseDown = function(event){
		if(event.button == 0){
			this._mouseDown = true;
			event.preventDefault();
			return false;
		}
	}
	
	WPGMZA.Pointlabel.prototype.onWindowMouseUp = function(event){
		if(event.button == 0)
			this._mouseDown = false;
	}
	
	WPGMZA.Pointlabel.prototype.onMapMouseMove = function(event){
		if(!this._mouseDown)
			return;
		
		var pixels = {
			x: event.pageX - $(this.map.element).offset().left,
			y: (event.pageY + 30) - $(this.map.element).offset().top
		}
		
		var latLng = this.map.pixelsToLatLng(pixels);
		
		if(latLng){
			this.setPosition(latLng);
		}

		this.trigger("change");
	}

	WPGMZA.Pointlabel.prototype.getPosition = function(){
		if(this.center){
			return new WPGMZA.LatLng({
				lat : this.center.lat,
				lng : this.center.lng,
			});
		}
		return null;
	}

	WPGMZA.Pointlabel.prototype.setPosition = function(position){
		this.center = {};
		this.center.lat = position.lat;
		this.center.lng = position.lng;

		if(this.textFeature){
			this.textFeature.setPosition(this.getPosition());
		}
	}

	WPGMZA.Pointlabel.prototype.getMap = function(){
		return this.map;
	}

	WPGMZA.Pointlabel.prototype.setMap = function(map){
		if(this.map){
			this.map.removePointlabel(this);
		}
		
		if(map){
			map.addPointlabel(this);
		}
			
	}
});

// js/v8/polyfills.js
/**
 * @namespace WPGMZA
 * @module Polyfills
 * @requires WPGMZA
 */
jQuery(function($) {

	// IE11 polyfill for slice not being implemented on Uint8Array (used by text.js)
	if (!Uint8Array.prototype.slice) {
		Object.defineProperty(Uint8Array.prototype, 'slice', {
			value: function (begin, end) {
				return new Uint8Array(Array.prototype.slice.call(this, begin, end));
			}
		});
	}
	
	// Safari polyfill for Enfold themes TypeError: 'undefined' is not a valid argument for 'in'
	if(WPGMZA.isSafari() && !window.external)
		window.external = {};

});

// js/v8/polygon.js
/**
 * @namespace WPGMZA
 * @module Polygon
 * @requires WPGMZA.Feature
 */
jQuery(function($) {
	
	/**
	 * Base class for polygons. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polygon
	 * @constructor WPGMZA.Polygon
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @augments WPGMZA.Feature
	 */
	WPGMZA.Polygon = function(row, enginePolygon)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polygon");
		
		this.paths = null;
		
		WPGMZA.Feature.apply(this, arguments);

		this.addEventListener("added", function(event) {
            self.onAdded();
        });
	}
	
	WPGMZA.Polygon.prototype = Object.create(WPGMZA.Feature.prototype);
	WPGMZA.Polygon.prototype.constructor = WPGMZA.Polygon;
	
	Object.defineProperty(WPGMZA.Polygon.prototype, "fillColor", {
		
		enumerable: true,
		"get": function()
		{
			if(!this.fillcolor || !this.fillcolor.length)
				return "#ff0000";
			
			return "#" + this.fillcolor.replace(/^#/, "");
		},
		"set": function(a){
			this.fillcolor = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Polygon.prototype, "fillOpacity", {
		
		enumerable: true,
		"get": function()
		{
			if(!this.opacity || !this.opacity.length)
				return 0.6;
			
			return this.opacity;
		},
		"set": function(a){
			this.opacity = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Polygon.prototype, "strokeColor", {
		
		enumerable: true,
		"get": function()
		{
			if(!this.linecolor || !this.linecolor.length)
				return "#ff0000";
			
			return "#" + this.linecolor.replace(/^#/, "");
		},
		"set": function(a){
			this.linecolor = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Polygon.prototype, "strokeOpacity", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.lineopacity || !this.lineopacity.length)
				return 0.6;
			
			return this.lineopacity;
		},
		"set": function(a){
			this.lineopacity = a;
		}
		
	});

	Object.defineProperty(WPGMZA.Polygon.prototype, "strokeWeight", {
		enumerable: true,
		"get": function()
		{
			if(!this.linethickness || !this.linethickness.length)
				return 3;
			
			return parseInt(this.linethickness);
		}
		
	});
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Polygon.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProPolygon;
				return WPGMZA.OLPolygon;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProPolygon;
				return WPGMZA.GooglePolygon;
				break;
		}
	}
	
	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @returns {WPGMZA.Polygon} An instance of WPGMZA.Polygon
	 */
	WPGMZA.Polygon.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polygon.getConstructor();
		return new constructor(row, engineObject);
	}

	WPGMZA.Polygon.prototype.onAdded = function(){
        
    }
	
});

// js/v8/polyline.js
/**
 * @namespace WPGMZA
 * @module Polyline
 * @requires WPGMZA.Feature
 */
jQuery(function($) {
	
	/**
	 * Base class for polylines. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polyline
	 * @constructor WPGMZA.Polyline
	 * @memberof WPGMZA
	 * @param {object} [options] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @augments WPGMZA.Feature
	 */
	WPGMZA.Polyline = function(options, googlePolyline)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polyline");
		
		WPGMZA.Feature.apply(this, arguments);

		this.addEventListener("added", function(event) {
            self.onAdded();
        });
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.Feature.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;

	Object.defineProperty(WPGMZA.Polyline.prototype, "strokeColor", {
		enumerable: true,
		"get": function()
		{
			if(!this.linecolor || !this.linecolor.length)
				return "#ff0000";
			
			return "#" + this.linecolor.replace(/^#/, "");
		},
		"set": function(a){
			this.linecolor = a;
		}
		
	});

	Object.defineProperty(WPGMZA.Polyline.prototype, "strokeOpacity", {
		enumerable: true,
		"get": function()
		{
			if(!this.opacity || !this.opacity.length)
				return 0.6;
			
			return this.opacity;
		},
		"set": function(a){
			this.opacity = a;
		}
		
	});

	Object.defineProperty(WPGMZA.Polyline.prototype, "strokeWeight", {
		enumerable: true,
		"get": function()
		{
			if(!this.linethickness || !this.linethickness.length)
				return 1;
			
			return parseInt(this.linethickness);
		},
		"set": function(a){
			this.linethickness = a;
		}
		
	});

	Object.defineProperty(WPGMZA.Polyline.prototype, "layergroup", {
        enumerable : true,
        get: function() {
            if(this._layergroup){
                return this._layergroup;
            }
            return 0;
        },
        set: function(value) {
            if(parseInt(value)){
                this._layergroup = parseInt(value) + WPGMZA.Shape.BASE_LAYER_INDEX;
            }
        }
    });
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Polyline.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return WPGMZA.OLPolyline;
				break;
			
			default:
				return WPGMZA.GooglePolyline;
				break;
		}
	}
	
	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @param {object} [options] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @returns {WPGMZA.Polyline} An instance of WPGMZA.Polyline
	 */
	WPGMZA.Polyline.createInstance = function(options, engineObject)
	{
		var constructor = WPGMZA.Polyline.getConstructor();
		return new constructor(options, engineObject);
	}
	
	/**
	 * Gets the points on this polylines
	 * @return {array} An array of LatLng literals
	 */
	WPGMZA.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}

	WPGMZA.Polyline.prototype.onAdded = function(){
        if(this.layergroup){
            this.setLayergroup(this.layergroup);
        }
    }
	
	/**
	 * Returns a JSON representation of this polyline, for serialization
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @returns {object} A JSON object representing this polyline
	 */
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = WPGMZA.Feature.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}

	WPGMZA.Polyline.prototype.setLayergroup = function(layergroup){
	    this.layergroup = layergroup;
	    if(this.layergroup){
	        this.setOptions({
	            zIndex: this.layergroup
	        });
	    }
	} 
	
});

// js/v8/popout-panel.js
/**
 * @namespace WPGMZA
 * @module PopoutPanel
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Common functionality for popout panels, which is the directions box, directions result box, and the modern style marker listing
	 * @class WPGMZA.PopoutPanel
	 * @constructor WPGMZA.PopoutPanel
	 * @memberof WPGMZA
	 */
	WPGMZA.PopoutPanel = function(element)
	{
		this.element = element;
	}
	
	/**
	 * Opens the direction box
	 * @method
	 * @memberof WPGMZA.PopoutPanel
	 */
	WPGMZA.PopoutPanel.prototype.open = function() {
		$(this.element).addClass("wpgmza-open");
	};
	
	/**
	 * Closes the direction box
	 * @method
	 * @memberof WPGMZA.PopoutPanel
	 */
	WPGMZA.PopoutPanel.prototype.close = function() {
		$(this.element).removeClass("wpgmza-open");
	};
	
});

// js/v8/rest-api.js
/**
 * @namespace WPGMZA
 * @module WPGMZA.RestAPI
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Used to interact with the WordPress REST API. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.RestAPI
	 * @constructor WPGMZA.RestAPI
	 * @memberof WPGMZA
	 */
	WPGMZA.RestAPI = function()
	{
		WPGMZA.RestAPI.URL = WPGMZA.resturl;
	
		this.useAJAXFallback = false;

		if(WPGMZA.settings && WPGMZA.settings.force_ajax_only_mode){
			this.useAJAXFallback = true;
		}

		$(document.body).trigger("init.restapi.wpgmza");
	}
	
	WPGMZA.RestAPI.CONTEXT_REST		= "REST";
	WPGMZA.RestAPI.CONTEXT_AJAX		= "AJAX";
	
	/**
	 * Creates an instance of a RestAPI, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.RestAPI
	 */
	WPGMZA.RestAPI.createInstance = function() 
	{
		return new WPGMZA.RestAPI();
	}
	
	Object.defineProperty(WPGMZA.RestAPI.prototype, "isCompressedPathVariableSupported", {
		
		get: function()
		{
			return WPGMZA.serverCanInflate && "Uint8Array" in window && "TextEncoder" in window;
		}
		
	});
	
	Object.defineProperty(WPGMZA.RestAPI.prototype, "isCompressedPathVariableAllowed", {
		
		get: function()
		{
			// NB: Pro 7 still has a "disable" setting. So use that if Pro 7 is installed.
			if(!WPGMZA.pro_version || WPGMZA.Version.compare(WPGMZA.pro_version, "8.0.0") >= WPGMZA.Version.EQUAL_TO)
				return !WPGMZA.settings.disable_compressed_path_variables;
			
			// Running Pro 7 or below
			return WPGMZA.settings.enable_compressed_path_variables;
		}
		
	});
	
	Object.defineProperty(WPGMZA.RestAPI.prototype, "maxURLLength", {
		
		get: function()
		{
			return 2083;
		}
		
	});
	
	WPGMZA.RestAPI.prototype.compressParams = function(params)
	{
		var suffix = "";
		
		if(params.markerIDs)
		{
			var markerIDs	= params.markerIDs.split(",");
			
			if(markerIDs.length > 1)
			{
				// NB: Only use Elias Fano encoding if more than one marker is present. The server side decoder does not correctly decode a single digit.
				var encoder		= new WPGMZA.EliasFano();
				var encoded		= encoder.encode(markerIDs);
				var compressed	= pako.deflate(encoded);
				var string		= Array.prototype.map.call(compressed, function(ch) {
					return String.fromCharCode(ch);
				}).join("");
				
				// NB: Append as another path component, this stops the code below performing base64 encoding twice and enlarging the request
				suffix = "/" + btoa(string).replace(/\//g, "-").replace(/=+$/, "");
				
				// NB: midcbp = Marker ID compressed buffer pointer, abbreviated to save space
				params.midcbp = encoded.pointer;
				
				delete params.markerIDs;
			}
		}
		
		var string		= JSON.stringify(params);
		var encoder		= new TextEncoder();
		var input		= encoder.encode(string);
		var compressed	= pako.deflate(input);
		var raw			= Array.prototype.map.call(compressed, function(ch) {
			return String.fromCharCode(ch);
		}).join("");
		
		var base64		= btoa(raw);
		return base64.replace(/\//g, "-").replace(/=+$/, "") + suffix;
	}
	
	function sendAJAXFallbackRequest(route, params)
	{
		var params = $.extend({}, params);
		
		if(!params.data)
			params.data = {};
		
		if("route" in params.data){
			throw new Error("Cannot send route through this method");
		}
		
		if("action" in params.data){
			throw new Error("Cannot send action through this method");
		}

		if(params.method === "DELETE"){
			params.method = "POST";
	
			if(!params.data){
				params.data = {};
			}
	
			params.data.simulateDelete = 'yes';
		}
		
		params.data.route = route;
		params.data.action = "wpgmza_rest_api_request";
		
		WPGMZA.restAPI.addNonce(route, params, WPGMZA.RestAPI.CONTEXT_AJAX);
		
		return $.ajax(WPGMZA.ajaxurl, params);
	}
	
	WPGMZA.RestAPI.prototype.getNonce = function(route)
	{
		var matches = [];
		
		for(var pattern in WPGMZA.restnoncetable)
		{
			var regex = new RegExp(pattern);
			
			if(route.match(regex))
				matches.push({
					pattern: pattern,
					nonce: WPGMZA.restnoncetable[pattern],
					length: pattern.length
				});
		}
		
		if(!matches.length)
			throw new Error("No nonce found for route");
		
		matches.sort(function(a, b) {
			return b.length - a.length;
		});
		
		return matches[0].nonce;
	}
	
	WPGMZA.RestAPI.prototype.addNonce = function(route, params, context)
	{
		var self = this;

		var setRESTNonce = function(xhr) {
			if(context == WPGMZA.RestAPI.CONTEXT_REST && self.shouldAddNonce(route)){
				xhr.setRequestHeader('X-WP-Nonce', WPGMZA.restnonce);
			} 
			
			if(params && params.method && !params.method.match(/^GET$/i)){
				xhr.setRequestHeader('X-WPGMZA-Action-Nonce', self.getNonce(route));
			}
		};
		
		if(!params.beforeSend){
			params.beforeSend = setRESTNonce;
		} else {
			var base = params.beforeSend;
			
			params.beforeSend = function(xhr) {
				base(xhr);
				setRESTNonce(xhr);
			}
		}
	}

	WPGMZA.RestAPI.prototype.shouldAddNonce = function(route){
		route = route.replace(/\//g, '');

		var isAdmin = false;
		if(WPGMZA.is_admin){
			if(parseInt(WPGMZA.is_admin) === 1){
				isAdmin = true;
			}
		}

		var skipNonceRoutes = ['markers', 'features', 'marker-listing', 'datatables'];
		if(route && skipNonceRoutes.includes(route) && !isAdmin){
			return false;
		}

		return true;
	}
	
	/**
	 * Makes an AJAX to the REST API, this function is a wrapper for $.ajax
	 * @method
	 * @memberof WPGMZA.RestAPI
	 * @param {string} route The REST API route
	 * @param {object} params The request parameters, see http://api.jquery.com/jquery.ajax/
	 */
	WPGMZA.RestAPI.prototype.call = function(route, params)
	{
		if(this.useAJAXFallback)
			return sendAJAXFallbackRequest(route, params);
		
		var self = this;
		var attemptedCompressedPathVariable = false;
		var fallbackRoute = route;
		var fallbackParams = $.extend({}, params);
		
		if(typeof route != "string" || (!route.match(/^\//) && !route.match(/^http/)))
			throw new Error("Invalid route");
		
		if(WPGMZA.RestAPI.URL.match(/\/$/))
			route = route.replace(/^\//, "");
		
		if(!params)
			params = {};
		
		this.addNonce(route, params, WPGMZA.RestAPI.CONTEXT_REST);
		
		if(!params.error)
			params.error = function(xhr, status, message) {
				if(status == "abort")
					return;	// Don't report abort, let it happen silently
				
				switch(xhr.status)
				{
					case 401:
					case 403:
					case 405:
						// Report back to the server. This is usually due to a security plugin blocking REST requests for non-authenticated users
						$.post(WPGMZA.ajaxurl, {
							action: "wpgmza_report_rest_api_blocked"
						}, function(response) {});
						
						console.warn("The REST API was blocked. This is usually due to security plugins blocking REST requests for non-authenticated users.");
						
						if(params.method === "DELETE"){
							console.warn("The REST API rejected a DELETE request, attempting again with POST fallback");
							params.method = "POST";

							if(!params.data){
								params.data = {};
							}

							params.data.simulateDelete = 'yes';

							return WPGMZA.restAPI.call(route, params);

						}

						this.useAJAXFallback = true;
						
						return sendAJAXFallbackRequest(fallbackRoute, fallbackParams);
						break;
					
					case 414:
						if(!attemptedCompressedPathVariable)
							break;
					
						// Fallback for HTTP 414 - Request too long with compressed requests
						fallbackParams.method = "POST";
						fallbackParams.useCompressedPathVariable = false;
						
						return WPGMZA.restAPI.call(fallbackRoute, fallbackParams);
					
						break;
				}
				
				throw new Error(message);
			}
		
		if(params.useCompressedPathVariable && 
			this.isCompressedPathVariableSupported && 
			this.isCompressedPathVariableAllowed)
		{
			var compressedParams = $.extend({}, params);
			var data = params.data;
			var base64 = this.compressParams(data);
			
			if(WPGMZA.isServerIIS)
				base64 = base64.replace(/\+/g, "%20");
			
			var compressedRoute = route.replace(/\/$/, "") + "/base64" + base64;
			var fullCompressedRoute = WPGMZA.RestAPI.URL + compressedRoute;
			
			compressedParams.method = "GET";
			delete compressedParams.data;
			
			if(params.cache === false)
				compressedParams.data = {
					skip_cache: 1
				};
			
			if(compressedRoute.length < this.maxURLLength)
			{
				attemptedCompressedPathVariable = true;
				
				route = compressedRoute;
				params = compressedParams;
			}
			else
			{
				// Fallback for when URL exceeds predefined length limit
				if(!WPGMZA.RestAPI.compressedPathVariableURLLimitWarningDisplayed)
					console.warn("Compressed path variable route would exceed URL length limit");
				
				WPGMZA.RestAPI.compressedPathVariableURLLimitWarningDisplayed = true;
			}
		}

		var onSuccess = null;
		if(params.success){
			onSuccess = params.success;
		}

		params.success = function(result, status, xhr){
			if(typeof result !== 'object'){
				var rawResult = result;
				try{
					result = JSON.parse(result);
				} catch (parseExc){
					result = rawResult;
				}
			}

			if(onSuccess && typeof onSuccess === 'function'){
				onSuccess(result, status, xhr);
			}
		};

		// NB: Support plain permalinks
		if(WPGMZA.RestAPI.URL.match(/\?/))
			route = route.replace(/\?/, "&");
		
		return $.ajax(WPGMZA.RestAPI.URL + route, params);
	}
	
	var nativeCallFunction = WPGMZA.RestAPI.call;
	WPGMZA.RestAPI.call = function()
	{
		console.warn("WPGMZA.RestAPI.call was called statically, did you mean to call the function on WPGMZA.restAPI?");
		
		nativeCallFunction.apply(this, arguments);
	}

	$(document.body).on("click", "#wpgmza-rest-api-blocked button.notice-dismiss", function(event) {
		
		WPGMZA.restAPI.call("/rest-api/", {
			method: "POST",
			data: {
				dismiss_blocked_notice: true
			}
		});
		
	});
	
});

// js/v8/settings-page.js
/**
 * @namespace WPGMZA
 * @module SettingsPage
 * @requires WPGMZA
 */

var $_GET = {};
if(document.location.toString().indexOf('?') !== -1) {
    var query = document.location
                   .toString()
                   // get the query string
                   .replace(/^.*?\?/, '')
                   // and remove any existing hash string (thanks, @vrijdenker)
                   .replace(/#.*$/, '')
                   .split('&');

    for(var wpgmza_i=0, wpgmza_l=query.length; wpgmza_i<wpgmza_l; wpgmza_i++) {
       var aux = decodeURIComponent(query[wpgmza_i]).split('=');
       $_GET[aux[0]] = aux[1];
    }
}

jQuery(function($) {
	
	WPGMZA.SettingsPage = function()
	{
		var self = this;
		
		this._keypressHistory = [];
		this._codemirrors = {};
		
		this.updateEngineSpecificControls();
		this.updateStorageControls();
		this.updateBatchControls();
		this.updateGDPRControls();
		this.updateWooControls();
		
		//$("#wpgmza-developer-mode").hide();
		$(window).on("keypress", function(event) {
			self.onKeyPress(event);
		});


		

		
		jQuery('body').on('click',".wpgmza_destroy_data", function(e) {
			e.preventDefault();
			var ttype = jQuery(this).attr('danger');
			var warning = 'Are you sure?';
			if (ttype == 'wpgmza_destroy_all_data') { warning = 'Are you sure? This will delete ALL data and settings for WP Go Maps!'; }
			if (window.confirm(warning)) {
	            
				jQuery.ajax(WPGMZA.ajaxurl, {
		    		method: 'POST',
		    		data: {
		    			action: 'wpgmza_maps_settings_danger_zone_delete_data',
		    			type: ttype,
		    			nonce: wpgmza_dz_nonce
		    		},
		    		success: function(response, status, xhr) {
		    			if (ttype == 'wpgmza_destroy_all_data') {
		    				window.location.replace('admin.php?page=wp-google-maps-menu&action=welcome_page');
		    			} else if (ttype == 'wpgmza_reset_all_settings') {
		    				window.location.reload();
		    			}  else {
		    				alert('Complete.');
		    			}
		    			
	    			}
		    	});
	        }

			

		});

		
		$("select[name='wpgmza_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});
		
		$('[name="wpgmza_settings_marker_pull"]').on('click', function(event) {
			self.updateStorageControls();
		});

		$('input[name="enable_batch_loading"]').on('change', function(event) {
			self.updateBatchControls();
		});
		
		$("input[name='wpgmza_gdpr_require_consent_before_load'], input[name='wpgmza_gdpr_require_consent_before_vgm_submit'], input[name='wpgmza_gdpr_override_notice']").on("change", function(event) {
			self.updateGDPRControls();
		});

		$('input[name="woo_checkout_map_enabled"]').on('change', function(event) {
			self.updateWooControls();
		});

		$('select[name="tile_server_url"]').on('change', function(event){
			if($('select[name="tile_server_url"]').val() === "custom_override"){
				$('.wpgmza_tile_server_override_component').removeClass('wpgmza-hidden');
			} else {
				$('.wpgmza_tile_server_override_component').addClass('wpgmza-hidden');
			}
		});
		$('select[name="tile_server_url"]').trigger('change');
		
		jQuery('#wpgmza_flush_cache_btn').on('click', function(){
			jQuery(this).attr('disabled', 'disabled');
			WPGMZA.settingsPage.flushGeocodeCache();
		});
		
		$("#wpgmza-global-settings").tabs({
	       create: function(event, ui) {
	       		
	       	if (typeof $_GET['highlight'] !== 'undefined') {

					var elmnt = document.getElementById($_GET['highlight']);
					elmnt.classList.add('highlight-item');
					
					setTimeout(function() {
						elmnt.classList.add('highlight-item-step-2');	
					},1000);
					
					var yOffset = -100; 
					var y = elmnt.getBoundingClientRect().top + window.pageYOffset + yOffset;
					window.scrollTo({top: y, behavior: 'smooth'});
				
				}
	       },
	       activate: function(){
	       	for(var i in self._codemirrors){
	       		self._codemirrors[i].refresh();
	       	}
	       }
	    });

	    $( "#wpgmza-global-setting" ).on( "create", function(event, ui) {
			/* Not used */
			// alert('now');
		});
		
		$("#wpgmza-global-settings fieldset").each(function(index, el) {
			
			var children = $(el).children(":not(legend)");
			children.wrapAll("<span class='settings-group'></span>");
			
		});

		$("textarea[name^='wpgmza_custom_']").each(function(){
			var name = $(this).attr('name');
			var type = name.replace("wpgmza_custom_", "") === "js" ? "javascript" : "css";

			self._codemirrors[name] = wp.CodeMirror.fromTextArea(this, {
				lineNumbers: true,
				mode: type,
				theme: "wpgmza"
			});

			self._codemirrors[name].on('change', function(instance){
				instance.save();
			});

			self._codemirrors[name].refresh();
		});

		$('.wpgmza-integration-tool-button').on('click', function(event){
			event.preventDefault();
			const type = $(this).data('tool-type');
			if(type){
				const data = {
					type : type
				};

				const button = $(this);
				button.attr('disabled', 'disabled');

				WPGMZA.restAPI.call("/integration-tools/", {
					method:	"POST",
					data:	data,
					success: function(data, status, xhr) {
						button.removeAttr('disabled');

						if(data){
							if(data.type){
								switch(data.type){
									case 'test_collation':
										if(!data.success){
											$('.wpgmza-integration-tool-button[data-tool-type="test_collation"]').addClass('wpgmza-hidden');
											$('.wpgmza-integration-tool-button[data-tool-type="resolve_collation"]').removeClass('wpgmza-hidden');
										}

										if(data.message){
											window.alert(data.message);
										}
										break;
									case 'resolve_collation':
										if(!data.success){
											$('.wpgmza-integration-tool-button[data-tool-type="test_collation"]').removeClass('wpgmza-hidden');
											$('.wpgmza-integration-tool-button[data-tool-type="resolve_collation"]').addClass('wpgmza-hidden');
										}

										if(data.message){
											window.alert(data.message);
										}
										break;
									default:
										if(data.message){
											window.alert(data.message);
										}
										break;
								}
							}
						}
					}
				});

			}
		});

		$('.wpgmza-performance-tool-button').on('click', function(event){
			event.preventDefault();
			const type = $(this).data('tool-type');
			if(type){
				const data = {
					type : type
				};

				const button = $(this);
				button.attr('disabled', 'disabled');

				WPGMZA.restAPI.call("/performance-tools/", {
					method:	"POST",
					data:	data,
					success: function(data, status, xhr) {
						button.removeAttr('disabled');
						if(data){
							if(data.message){
								window.alert(data.message);
							}
						}
					}
				});
			}
		});
	}
	
	WPGMZA.SettingsPage.createInstance = function()
	{
		return new WPGMZA.SettingsPage();
	}
	
	/**
	 * Updates engine specific controls, hiding irrelevant controls (eg Google controls when OpenLayers is the selected engine) and showing relevant controls.
	 * @method
	 * @memberof WPGMZA.SettingsPage
	 */
	WPGMZA.SettingsPage.prototype.updateEngineSpecificControls = function()
	{
		var engine = $("select[name='wpgmza_maps_engine']").val();
		
		$("[data-required-maps-engine][data-required-maps-engine!='" + engine + "']").hide();
		$("[data-required-maps-engine='" + engine + "']").show();
	}
	
	WPGMZA.SettingsPage.prototype.updateStorageControls = function()
	{
		if($("input[name='wpgmza_settings_marker_pull'][value='1']").is(":checked"))
			$("#xml-cache-settings").show();
		else
			$("#xml-cache-settings").hide();
	}

	WPGMZA.SettingsPage.prototype.updateBatchControls = function(){
		if($("input[name='enable_batch_loading']").is(":checked")){
			$('#batch-loader-settings').show();
		} else {
			$('#batch-loader-settings').hide();
		}
	}
	
	/**
	 * Updates the GDPR controls (eg visibility state) based on the selected GDPR settings
	 * @method
	 * @memberof WPGMZA.SettingsPage
	 */
	WPGMZA.SettingsPage.prototype.updateGDPRControls = function()
	{
		var showNoticeControls = $("input[name='wpgmza_gdpr_require_consent_before_load']").prop("checked");
		
		var vgmCheckbox = $("input[name='wpgmza_gdpr_require_consent_before_vgm_submit']");
		
		if(vgmCheckbox.length)
			showNoticeControls = showNoticeControls || vgmCheckbox.prop("checked");
		
		var showOverrideTextarea = showNoticeControls && $("input[name='wpgmza_gdpr_override_notice']").prop("checked");
		
		if(showNoticeControls) {
			$("#wpgmza-gdpr-compliance-notice").show(WPGMZA.InternalEngine.isLegacy() ? "slow" : false);
		} else {
			$("#wpgmza-gdpr-compliance-notice").hide(WPGMZA.InternalEngine.isLegacy() ? "slow" : false);
		}
		
		if(showOverrideTextarea) {
			$("#wpgmza_gdpr_override_notice_text").show(WPGMZA.InternalEngine.isLegacy() ? "slow" : false);
		} else {
			$("#wpgmza_gdpr_override_notice_text").hide(WPGMZA.InternalEngine.isLegacy() ? "slow" : false);
		}
	}

	/**
	 * Update the Woo controls (visibility etc) based on toggle selections
	 * @method
	 * @memberof WPGMZA.SettingsPage
	*/
	WPGMZA.SettingsPage.prototype.updateWooControls = function(){
		const showMapSelect =  $("input[name='woo_checkout_map_enabled']").prop("checked");
		if(showMapSelect){
			$('.woo-checkout-maps-select-row').show();
		} else {
			$('.woo-checkout-maps-select-row').hide();
		}
	}

	/**
	 * Flushes the geocode cache
	 */
	WPGMZA.SettingsPage.prototype.flushGeocodeCache = function()
	{
		var OLGeocoder = new WPGMZA.OLGeocoder();
		OLGeocoder.clearCache(function(response){
			jQuery('#wpgmza_flush_cache_btn').removeAttr('disabled');
		});
	}
	
	WPGMZA.SettingsPage.prototype.onKeyPress = function(event)
	{
		var string;
		
		this._keypressHistory.push(event.key);
		
		if(this._keypressHistory.length > 9)
			this._keypressHistory = this._keypressHistory.slice(this._keypressHistory.length - 9);
		
		string = this._keypressHistory.join("");
		
		if(string == "codecabin" && !this._developerModeRevealed)
		{
			$("fieldset#wpgmza-developer-mode").show();
			this._developerModeRevealed = true;
		}
	}
	
	$(document).ready(function(event) {
		
		if(WPGMZA.getCurrentPage())
			WPGMZA.settingsPage = WPGMZA.SettingsPage.createInstance();
		
	});
	
});

// js/v8/shape.js
/**
 * @namespace WPGMZA
 * @module Shape
 * @requires WPGMZA.Feature
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Feature;

    /** 
     * A generic shape relay so that shapes can share common polygon features
    */
    WPGMZA.Shape = function(options, engineFeature)
    {
        var self = this;
        WPGMZA.assertInstanceOf(this, "Shape");
        
        Parent.apply(this, arguments);

        this.addEventListener("added", function(event) {
            self.onAdded();
        });
    }
    
    WPGMZA.extend(WPGMZA.Shape, WPGMZA.Feature);

    WPGMZA.Shape.BASE_LAYER_INDEX       = 99999;

    WPGMZA.Shape.prototype.onAdded = function(){
        
    }
});

// js/v8/circle.js
/**
 * @namespace WPGMZA
 * @module Circle
 * @requires WPGMZA.Shape
 * @pro-requires WPGMZA.ProShape
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Shape;
	
	
	/**
	 * Base class for circles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Circle
	 * @constructor WPGMZA.Circle
	 * @memberof WPGMZA
	 * @augments WPGMZA.Feature
	 * @see WPGMZA.Circle.createInstance
	 */
	WPGMZA.Circle = function(options, engineCircle)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Circle");
		
		this.center = new WPGMZA.LatLng();
		this.radius = 100;
		
		Parent.apply(this, arguments);
	}
	

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProShape;

	WPGMZA.extend(WPGMZA.Circle, Parent);
	
	Object.defineProperty(WPGMZA.Circle.prototype, "fillColor", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.color || !this.color.length)
				return "#ff0000";
			
			return this.color;
		},
		"set" : function(a){
			this.color = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Circle.prototype, "fillOpacity", {
	
		enumerable: true,
		
		"get": function()
		{
			if(!this.opacity && this.opacity != 0)
				return 0.5;
			
			return parseFloat(this.opacity);
		},
		"set": function(a){
			this.opacity = a;
		}
	
	});
	
	Object.defineProperty(WPGMZA.Circle.prototype, "strokeColor", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.lineColor){
				return "#000000";
			}
			return this.lineColor;
		},
		"set": function(a){
			this.lineColor = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Circle.prototype, "strokeOpacity", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.lineOpacity && this.lineOpacity != 0)
				return 0;
			
			return parseFloat(this.lineOpacity);
		},
		"set": function(a){
			this.lineOpacity = a;
		}
		
	});
	
	/**
	 * Creates an instance of a circle, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.Circle.createInstance = function(options, engineCircle)
	{
		var constructor;
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion()){
					constructor = WPGMZA.OLProCircle;
					break;
				}
				constructor = WPGMZA.OLCircle;
				break;
			
			default:
				if(WPGMZA.isProVersion()){
					constructor = WPGMZA.GoogleProCircle;
					break;
				}
				constructor = WPGMZA.GoogleCircle;
				break;
		}
		
		return new constructor(options, engineCircle);
	}
	
	/**
	 * Gets the circles center
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getCenter = function()
	{
		return this.center.clone();
	}
	
	/**
	 * Sets the circles center
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object|WPGMZA.LatLng} latLng either a literal or as a WPGMZA.LatLng
	 */
	WPGMZA.Circle.prototype.setCenter = function(latLng)
	{
		this.center.lat = latLng.lat;
		this.center.lng = latLng.lng;
	}
	
	/**
	 * Gets the circles radius, in kilometers
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object|WPGMZA.LatLng} latLng either a literal or as a WPGMZA.LatLng
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getRadius = function()
	{
		return this.radius;
	}
	
	/**
	 * Sets the circles radius, in kilometers
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {number} radius The radius
	 * @returns {void}
	 */
	WPGMZA.Circle.prototype.setRadius = function(radius)
	{
		this.radius = radius;
	}
	
	/**
	 * Returns the map that this circle is being displayed on
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @return {WPGMZA.Map}
	 */
	WPGMZA.Circle.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * Puts this circle on a map
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {WPGMZA.Map} map The target map
	 * @return {void}
	 */
	WPGMZA.Circle.prototype.setMap = function(map)
	{
		if(this.map)
			this.map.removeCircle(this);
		
		if(map)
			map.addCircle(this);
			
	}
	
});

// js/v8/rectangle.js
/**
 * @namespace WPGMZA
 * @module Rectangle
 * @requires WPGMZA.Shape
 * @pro-requires WPGMZA.ProShape
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Shape;
	
	/**
	 * Base class for circles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Rectangle
	 * @constructor WPGMZA.Rectangle
	 * @memberof WPGMZA
	 * @augments WPGMZA.Feature
	 * @see WPGMZA.Rectangle.createInstance
	 */
	WPGMZA.Rectangle = function(options, engineRectangle)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Rectangle");
		
		this.name = "";
		this.cornerA = new WPGMZA.LatLng();
		this.cornerB = new WPGMZA.LatLng();
		this.color = "#ff0000";
		this.opacity = 0.5;
		
		Parent.apply(this, arguments);
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProShape;

	
	WPGMZA.extend(WPGMZA.Rectangle, Parent);
	
	Object.defineProperty(WPGMZA.Rectangle.prototype, "fillColor", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.color || !this.color.length)
				return "#ff0000";
			
			return this.color;
		},
		"set" : function(a){
			this.color = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Rectangle.prototype, "fillOpacity", {
	
		enumerable: true,
		
		"get": function()
		{
			if(!this.opacity && this.opacity != 0)
				return 0.5;
			
			return parseFloat(this.opacity);
		},
		"set": function(a){
			this.opacity = a;
		}
	
	});
	
	Object.defineProperty(WPGMZA.Rectangle.prototype, "strokeColor", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.lineColor){
				return "#000000";
			}
			return this.lineColor;
		},
		"set": function(a){
			this.lineColor = a;
		}
		
	});
	
	Object.defineProperty(WPGMZA.Rectangle.prototype, "strokeOpacity", {
		
		enumerable: true,
		
		"get": function()
		{
			if(!this.lineOpacity && this.lineOpacity != 0)
				return 0;
			
			return parseFloat(this.lineOpacity);
		},
		"set": function(a){
			this.lineOpacity = a;
		}
		
	});
	
	WPGMZA.Rectangle.createInstance = function(options, engineRectangle)
	{
		var constructor;
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion()){
					constructor = WPGMZA.OLProRectangle;
					break;
				}
				constructor = WPGMZA.OLRectangle;
				break;
			
			default:
				if(WPGMZA.isProVersion()){
					constructor = WPGMZA.GoogleProRectangle;
					break;
				}
				constructor = WPGMZA.GoogleRectangle;
				break;
		}
		
		return new constructor(options, engineRectangle);
	}
	
});

// js/v8/sidebar-groupings.js
/**
 * @namespace WPGMZA
 * @module SidebarGroupings
 * @requires WPGMZA.EventDispatcher
 */

jQuery(function($) {
	WPGMZA.SidebarGroupings = function(){
		var self = this;
		this.element = document.body;
		this.actionBar = {
			element : $(this.element).find('.action-bar'),
			dynamicAction : null,
			dynamicLabel : ""
		};

		$(this.element).on("click", ".grouping .item", function(event){
			self.openTab(event);

			if($(this).hasClass('caret-right')){
				/* Intelli-Panels - Only applies when moving forward (caret-right) */
				self.intelliFeaturePanel();
			}
		});

		$('.quick-actions .actions').on('click', '.icon', function(event){
			var feature = $(this).data('type');
			if(feature){
				self.openTabByFeatureType(feature);

				$('.quick-actions #qa-add-datasets').prop('checked', false);
			}
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-edit', function(event){
			if(event.feature){
				self.openTabByFeatureType(event.feature);
			}
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-saved', function(event){
			if(event.feature){
				self.closeCurrent();
			}
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-busy', function(event){
			self.resetScroll();
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-created', function(event){
			/* Nothing to do yet */
		});

		$(this.element).find('.fieldset-toggle').on('click', function(event){
			$(this).toggleClass('toggled');
		});

		/** Should move this to it's own module... hard to justify right now */
		$(this.element).on('click', '.wpgmza-toolbar .wpgmza-toolbar-list > *', function(event){
			$(this).parent().parent().find('label').click();
		});

		$('.wpgmza-feature-accordion[data-wpgmza-feature-type]').on('sidebar-delegate-feature-caption-loaded', function(event){
			if(self.actionBar.dynamicAction){
				self.actionBar.dynamicLabel = self.actionBar.dynamicAction.text(); 
				self.actionBar.element.find('.dynamic-action').removeClass('wpgmza-hidden').text(self.actionBar.dynamicLabel);
			}
		});

		this.actionBar.element.find('.dynamic-action').on('click', function(event){
			if(self.actionBar.dynamicAction){
				self.actionBar.dynamicAction.click();
			}
		});

		this.initUpsellBlocks();
	}

	WPGMZA.extend(WPGMZA.SidebarGroupings, WPGMZA.EventDispatcher);

	WPGMZA.SidebarGroupings.createInstance = function(){
		return new WPGMZA.SidebarGroupings();
	}

	WPGMZA.SidebarGroupings.prototype.openTab = function(event){
		var tab = event.currentTarget;
		var groupId = $(tab).data('group');

		this.openTabByGroupId(groupId);

		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.map){
			/* Trigger resize events as panels may extend/retract from screen space */
			WPGMZA.mapEditPage.map.onElementResized();
		}
	}

	WPGMZA.SidebarGroupings.prototype.openTabByFeatureType = function(feature){
		if($(this.element).find('.grouping[data-feature="' + feature + '"]').length > 0){
			var groupId = $(this.element).find('.grouping[data-feature="' + feature + '"]').data('group');
			this.openTabByGroupId(groupId);
		}
	}

	WPGMZA.SidebarGroupings.prototype.openTabByGroupId = function(groupId){
		if(groupId && this.hasGroup(groupId)){
			this.closeAll();

			var element = $(this.element).find('.grouping[data-group="' + groupId + '"]');
			
			element.addClass('open');

			if(element.data('feature-discard')){
				$(element).trigger('feature-block-closed');
			}

			
			if($('.wpgmza-map-settings-form').find(element).length > 0){
				$('.wpgmza-map-settings-form').removeClass('wpgmza-hidden');
			} else {
				$('.wpgmza-map-settings-form').addClass('wpgmza-hidden');
			}

			if(element.hasClass('auto-expand')){
				$('.sidebar').addClass('expanded');
			} else {
				$('.sidebar').removeClass('expanded');
			}

			if(element.data('feature')){
				$(element).trigger('feature-block-opened');
			}

			/* Dispatch an event to let other tools know panels are being opened. Features use a different event (feature-block-opened) */
			$(element).trigger('grouping-opened', [groupId]);

			this.updateActionBar(element);
		}
	}

	WPGMZA.SidebarGroupings.prototype.hasGroup = function(groupId){
		return $(this.element).find('.grouping[data-group="' + groupId + '"]').length > 0;
	}

	WPGMZA.SidebarGroupings.prototype.closeAll = function(){
		var self = this;
		$(this.element).find('.grouping.open').each(function(){
			/* Dispatch and event to let other tools know things are being closed */
			const group = $(this).data('group');
			if(group){
				$(self.element).trigger('grouping-closed', [group]);
			}
		});

		$(this.element).find('.grouping').removeClass('open');
	}

	WPGMZA.SidebarGroupings.prototype.closeCurrent = function(){
		if($(this.element).find('.grouping.open').length > 0){
			$(this.element).find('.grouping.open').find('.heading.has-back .item').click();
		}
	}

	WPGMZA.SidebarGroupings.prototype.getActiveGroup = function(){
		if($(this.element).find('.grouping.open').length > 0){
			return $(this.element).find('.grouping.open').data('group');
		}
		return false;
	}

	WPGMZA.SidebarGroupings.prototype.isOpen = function(groupId){
		let activeGroup = this.getActiveGroup();
		return activeGroup === groupId ? true : false;
	}

	WPGMZA.SidebarGroupings.prototype.updateActionBar = function(element){
		/* 
		 * This should be a part of a new module specific to the action bar, but this is hard to justify right now...
		 * Let's leave it all here for now, cut down on noise and excessive modules later 
		*/ 
		this.actionBar.dynamicAction = null;
		if(element && element.data('feature') && element.find('.wpgmza-save-feature').length > 0){
			this.actionBar.dynamicAction = element.find('.wpgmza-save-feature').first();
			this.actionBar.dynamicLabel = this.actionBar.dynamicAction.text().trim();
		} 

		if(this.actionBar.dynamicAction){
			// Hide original button
			this.actionBar.dynamicAction.addClass('wpgmza-hidden');
		}

		if(this.actionBar.dynamicAction && this.actionBar.dynamicLabel){
			this.actionBar.element.find('.dynamic-action').removeClass('wpgmza-hidden').text(this.actionBar.dynamicLabel);
			this.actionBar.element.find('.static-action').addClass('wpgmza-hidden');
		} else {
			this.actionBar.element.find('.static-action').removeClass('wpgmza-hidden');
			this.actionBar.element.find('.dynamic-action').addClass('wpgmza-hidden').text("");
		}
	}

	WPGMZA.SidebarGroupings.prototype.resetScroll = function(){
		if($(this.element).find('.grouping.open').length > 0){
			$(this.element).find('.grouping.open .settings').scrollTop(0);
		}
	}

	WPGMZA.SidebarGroupings.prototype.intelliFeaturePanel = function(){
		/* 
		 * Check if the curretly open panel is subject to intelli panel logic 
		 * 
		 * This is when a feature list is loaded, but the list is empty, in these cases, we can skip right on to the creator/editor in most cases
		 */
		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.map && WPGMZA.mapEditPage.map.markersPlaced){
			const element = $(this.element).find('.grouping.open');
			const map =  WPGMZA.mapEditPage.map;
			if(element.find('*[data-wpgmza-table]').length > 0){
				const feature = element.find('*[data-wpgmza-table]').data('wpgmza-feature-type');
				if(feature){
					/* We have a map edit page, the markers at very least have been placed, and we found a matching data-type list (DataTable) */
					const featurePlural = WPGMZA.pluralize(feature);
					if(map[featurePlural] && map[featurePlural].length === 0){
						element.find('.navigation .item:first-child').click();
					}
				}
			}
		}
	}

	WPGMZA.SidebarGroupings.prototype.initUpsellBlocks = function(){
		const upsellWrappers = $(this.element).find('.upsell-block.auto-rotate');
		if(upsellWrappers && upsellWrappers.length > 0){
			/* We have some upsell rotations to handle */
			for(let currentWrapper of upsellWrappers){
				currentWrapper = $(currentWrapper);
				if(currentWrapper.find('.upsell-block-card').length > 1){
					currentWrapper.addClass('rotate');
					
					currentWrapper.on('wpgmza-upsell-rotate-card', function(){
						const cardLength = $(this).find('.upsell-block-card').length; 
						$(this).find('.upsell-block-card').hide();
						

						let nextCard = parseInt(Math.random() * cardLength);
						if(nextCard < 0){
							nextCard = 0;
						} else if(nextCard >= cardLength){
							nextCard = cardLength - 1;
						}

						let nextCardElem = $(this).find('.upsell-block-card:nth-child(' + (nextCard + 1) + ')');
						if(nextCardElem.length > 0 && !nextCardElem.hasClass('active')){
							$(this).find('.upsell-block-card').removeClass('active');
							nextCardElem.addClass('active');
							nextCardElem.fadeIn(200);
						} else {
							/* Just reshow the card for another 10 seconds */
							nextCardElem.show();
						}

						setTimeout(() => {
							$(this).trigger('wpgmza-upsell-rotate-card');
						}, 10000);
					});
					currentWrapper.trigger('wpgmza-upsell-rotate-card');
				} else {
					currentWrapper.addClass('static');
				}
			}
		}
	}
});

// js/v8/store-locator.js
/**
 * @namespace WPGMZA
 * @module StoreLocator
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.StoreLocator = function(map, element)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this._center = null;
		
		this.map = map;
		this.element = element;
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;

		this.distanceUnits = this.map.settings.store_locator_distance;

		this.addressInput = WPGMZA.AddressInput.createInstance(this.addressElement, this.map);
		
		$(element).find(".wpgmza-not-found-msg").hide();
		
		// Default radius
		if(this.radiusElement && this.map.settings.wpgmza_store_locator_default_radius){
			if(!this.radiusElement.data('default-override')){
				if(this.radiusElement.find("option[value='" + this.map.settings.wpgmza_store_locator_default_radius + "']").length > 0){
					this.radiusElement.val(this.map.settings.wpgmza_store_locator_default_radius);
				}
			}

		}
		
		// TODO: This will be moved into this module instead of listening to the map event
		this.map.on("storelocatorgeocodecomplete", function(event) {
			self.onGeocodeComplete(event);
		});
		
		this.map.on("init", function(event) {
			
			self.map.markerFilter.on("filteringcomplete", function(event) {
				self.onFilteringComplete(event);
			});
			
			// Workaround for improper inheritance. Because ModernStoreLocator was written in v7, before this StoreLocator module, the ModernStoreLocator effectively re-arranges the store locators HTML. At some point, ModernStoreLocator should properly inherit from StoreLocator. For now, we'll just initialise this here to get the right look and feel. This is not ideal but it will work.
			if(WPGMZA.InternalEngine.isLegacy()){
				if(typeof self.map.settings.store_locator_style === 'undefined' || self.map.settings.store_locator_style == "modern" || WPGMZA.settings.user_interface_style === 'modern'){
					if(WPGMZA.settings.user_interface_style === 'default' || WPGMZA.settings.user_interface_style == 'modern' || WPGMZA.settings.user_interface_style == 'legacy'){
						self.legacyModernAdapter = WPGMZA.ModernStoreLocator.createInstance(map.id);
					}
				}
			}
			
		});

		if(WPGMZA.InternalEngine.isLegacy()){
			/* Legacy, non modern, button binders */
			$(document.body).on("click", ".wpgmza_sl_search_button_" + map.id + ", [data-map-id='" + map.id + "'] .wpgmza_sl_search_button", function(event) {
				self.onSearch(event);
			});
			
			$(document.body).on("click", ".wpgmza_sl_reset_button_" + map.id + ", [data-map-id='" + map.id + "'] .wpgmza_sl_reset_button_div", function(event) {
				self.onReset(event);
			});
		} else {
			$(this.searchButton).on("click", function(event){
				self.onSearch(event);
			});

			$(this.resetButton).on("click", function(event){
				self.onReset(event);
			});
		}
		
		// Enter listener
		$(this.addressElement).on("keypress", function(event) {
			if(event.which == 13)
				self.onSearch(event);	
		});

		// Delegate query param searches
		this.onQueryParamSearch();

		self.trigger('init.storelocator');
	}
	
	WPGMZA.StoreLocator.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.StoreLocator.prototype.constructor = WPGMZA.StoreLocator;
	
	WPGMZA.StoreLocator.STATE_INITIAL		= "initial";
	WPGMZA.StoreLocator.STATE_APPLIED		= "applied";
	
	WPGMZA.StoreLocator.createInstance = function(map, element){
		return new WPGMZA.StoreLocator(map, element);
	}
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "address", {
		"get": function() {
			return $(this.addressElement).val();
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "addressElement", {
		"get": function() {
			
			if(this.legacyModernAdapter)
				return $(this.legacyModernAdapter.element).find("input.wpgmza-address")[0];
			
			return $(this.element).find("input.wpgmza-address")[0];
			
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "countryRestriction", {
		"get": function() {
			return this.map.settings.wpgmza_store_locator_restrict;
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "radiusElement", {
		"get": function() {
			if(WPGMZA.InternalEngine.isLegacy()){
				return $("#radiusSelect, #radiusSelect_" + this.map.id);
			}
			return $(this.element).find('select.wpgmza-radius');
		}
	});		
		
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "searchButton", {
		"get": function() {
			return $(this.element).find(".wpgmza-search");
		}
	});

	Object.defineProperty(WPGMZA.StoreLocator.prototype, "resetButton", {
		"get": function() {
			return $(this.element).find(".wpgmza-reset");
		}
	});

	Object.defineProperty(WPGMZA.StoreLocator.prototype, "errorElement", {
		"get": function() {
			return $(this.element).find(".wpgmza-error");
		}
	});

	Object.defineProperty(WPGMZA.StoreLocator.prototype, "radius", {
		"get": function() {
			return parseFloat(this.radiusElement.val());
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "center", {
		"get": function() {
			return this._center;
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "bounds", {
		"get": function() {
			return this._bounds;
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "marker", {
		
		"get": function() {
			


			if(this.map.settings.store_locator_bounce != 1)
				return null;
			
			if(this._marker)
				return this._marker;
			
			var options = {
				visible: false
			};
			
			this._marker = WPGMZA.Marker.createInstance(options);
			this._marker.disableInfoWindow = true;
			this._marker.isFilterable = false;
			
			this._marker.setAnimation(WPGMZA.Marker.ANIMATION_BOUNCE);
			
			return this._marker;
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "circle", {
		
		"get": function() {
			
			if(this._circle)
				return this._circle;
			
			if(this.map.settings.wpgmza_store_locator_radius_style == "modern" && !WPGMZA.isDeviceiOS()) {
				this._circle = WPGMZA.ModernStoreLocatorCircle.createInstance(this.map.id);
				this._circle.settings.color = this.circleStrokeColor;
			} else {
				this._circle = WPGMZA.Circle.createInstance({
					strokeColor:	"#ff0000",
					strokeOpacity:	"0.25",
					strokeWeight:	2,
					fillColor:		"#ff0000",
					fillOpacity:	"0.15",
					visible:		false,
					clickable:      false,
					center: new WPGMZA.LatLng()
				});
			}
			
			return this._circle;
			
		}
		
	});
	
	WPGMZA.StoreLocator.prototype.onGeocodeComplete = function(event){
		if(!event.results || !event.results.length){
			this._center = null;
			this._bounds = null;

			return;
		} else {

			if(event.results[0].latLng){
				this._center = new WPGMZA.LatLng( event.results[0].latLng );
			} else if (event.results[0] instanceof WPGMZA.LatLng){
				this._center = new WPGMZA.LatLng( event.results[0] );
			}

			this._bounds = new WPGMZA.LatLngBounds( event.results[0].bounds );
		}
		
		if(this.isCapsule){
			/* This is running as a capsule, with a redirect */
			if(this.redirectUrl){
				this.onRedirectSearch();
			}
			return;
		}

		this.map.markerFilter.update({}, this);
	}
	
	WPGMZA.StoreLocator.prototype.onSearch = function(event){
		var self = this;
		
		this.state = WPGMZA.StoreLocator.STATE_APPLIED;
		
		// NB: Moved in from legacy searchLocations
		if(!this.address || !this.address.length){
			this.addressElement.focus();
			return false;
		}
		
		if(WPGMZA.InternalEngine.isLegacy()){
			if((typeof this.map.settings.store_locator_style !== 'undefined' && this.map.settings.store_locator_style !== "modern") && WPGMZA.settings.user_interface_style !== 'modern' && WPGMZA.settings.user_interface_style === 'default'){
				WPGMZA.animateScroll(this.map.element);
			}
		}

		$(this.element).find(".wpgmza-not-found-msg").hide();

		$(this.element).find(".wpgmza-error").removeClass("visible");

		this.setVisualState('busy');

		function callback(results, status){
			self.map.trigger({
				type:		"storelocatorgeocodecomplete",
				results:	results,
				status:		status
			});

			self.setVisualState('complete');
		}
		
		if(!WPGMZA.LatLng.isLatLngString(this.address)){
			var geocoder = WPGMZA.Geocoder.createInstance();
			var options = {
				address: this.address
			};
			
			if(this.countryRestriction)
				options.country = this.countryRestriction;
			
			geocoder.geocode(options, function(results, status) {
				
				if(status == WPGMZA.Geocoder.SUCCESS)
					callback(results, status);
				else{
					if(WPGMZA.InternalEngine.isLegacy()){
						alert(WPGMZA.localized_strings.address_not_found);
					} else {
						self.showError(WPGMZA.localized_strings.address_not_found);
						self.setVisualState(false);
					}
				}
				 
			});
		} else {
			callback([WPGMZA.LatLng.fromString(this.address)], WPGMZA.Geocoder.SUCCESS);
		}

		self.trigger('search.storelocator');
		
		return true;
	}
	
	WPGMZA.StoreLocator.prototype.onReset = function(event){
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		this._center = null;
		this._bounds = null;
		
		// NB: Moved in from legacy resetLocations
		this.map.setZoom(this.map.settings.map_start_zoom);

		$(this.element).find(".wpgmza-not-found-msg").hide();
		
		if(this.circle)
			this.circle.setVisible(false);
		
		if(this.marker && this.marker.map)
			this.map.removeMarker(this.marker);
		
		this.map.markerFilter.update({}, this);

		this.setVisualState(false);

		if(!WPGMZA.InternalEngine.isLegacy()){
			$(this.addressElement).val("").focus();
		}

		this.trigger('reset.storelocator');
	}
	
	WPGMZA.StoreLocator.prototype.onRedirectSearch = function(){
		if(this.redirectUrl){
			try{
				const data = {
					radius : this.radius,
					center : this.address ? this.address : (this.center.lat + "," + this.center.lng)
				};

				const params = new URLSearchParams(data);

				window.location.href = this.redirectUrl + "?" + params.toString();

				this.setVisualState('busy');
			} catch (ex){
				console.warn(ex);
			}
		}
	}

	WPGMZA.StoreLocator.prototype.getFilteringParameters = function(){
		if(!this.center)
			return {};
		
		return {
			center: this.center,
			radius: this.radius
		};
	}
	
	WPGMZA.StoreLocator.prototype.getZoomFromRadius = function(radius){
		if(this.distanceUnits == WPGMZA.Distance.MILES)
			radius *= WPGMZA.Distance.KILOMETERS_PER_MILE;
		
		return Math.round(14 - Math.log(radius) / Math.LN2);
	}
	
	WPGMZA.StoreLocator.prototype.onFilteringComplete = function(event){
		var params = event.filteringParams;
		var marker = this.marker;

		if(marker)
			marker.setVisible(false);
		

		// Center point marker
		if(params.center)
		{
			this.map.setCenter(params.center);
			
			if(marker)
			{
				marker.setPosition(params.center);
				marker.setVisible(true);
				
				if(marker.map != this.map)
					this.map.addMarker(marker);
			}
		}
		
		// Set zoom level
		if(params.radius){
			this.map.setZoom(this.getZoomFromRadius(params.radius));
		}
		
		// Display circle
		var circle = this.circle;
		
		if(circle){
			circle.setVisible(false);

			var factor = (this.distanceUnits == WPGMZA.Distance.MILES ? WPGMZA.Distance.KILOMETERS_PER_MILE : 1.0);
			
			if(params.center && params.radius){
				circle.setRadius(params.radius * factor);
				circle.setCenter(params.center);
				circle.setVisible(true);
				
				if(!(circle instanceof WPGMZA.ModernStoreLocatorCircle) && circle.map != this.map)
					this.map.addCircle(circle);
			}
			
			if(circle instanceof WPGMZA.ModernStoreLocatorCircle)
				circle.settings.radiusString = this.radius;
		}
		
		if(event.filteredMarkers.length == 0 && this.state === WPGMZA.StoreLocator.STATE_APPLIED){
			if(WPGMZA.InternalEngine.isLegacy()){
				if($(this.element).find('.wpgmza-no-results').length > 0 && WPGMZA.settings.user_interface_style === 'legacy'){
					$(this.element).find('.wpgmza-no-results').show();
				} else {
					alert(this.map.settings.store_locator_not_found_message ? this.map.settings.store_locator_not_found_message : WPGMZA.localized_strings.zero_results);
				}
			} else {
				this.showError(this.map.settings.store_locator_not_found_message ? this.map.settings.store_locator_not_found_message : WPGMZA.localized_strings.zero_results);
			}
		}
	}

	WPGMZA.StoreLocator.prototype.onQueryParamSearch = function(){
		const queryCenter = WPGMZA.getQueryParamValue("center");
		if(queryCenter){
			$(this.addressElement).val(queryCenter.replaceAll('+', ' '));
		}

		const queryRadius = WPGMZA.getQueryParamValue("radius");
		if(queryRadius){
			$(this.radiusElement).val(queryRadius);
		}

		if(!this.isCapsule && queryRadius && queryCenter){
			/* Only run if not part of a capsule */
			this.map.on('init', () => {
				this.onSearch();
			});
		}
	}

	WPGMZA.StoreLocator.prototype.setVisualState = function(state){
		if(state !== false){
			$(this.element).attr('data-state', state);
		} else {
			$(this.element).removeAttr('data-state');
		}
	}

	WPGMZA.StoreLocator.prototype.showError = function(error){
		var self = this;
		if(!WPGMZA.InternalEngine.isLegacy()){
			$(this.errorElement).text(error).addClass('visible');
			setTimeout(function(){
				$(self.errorElement).text("").removeClass('visible');
			}, 3000);
			
		}
	}
	
});


// js/v8/styling-page.js
/**
 * @namespace WPGMZA
 * @module StylingPage
 * @requires WPGMZA
 */

jQuery(function($) {
	WPGMZA.StylingPage = function(){
		var self = this;
		
        this.element = document.body;
        
        this.styleGuide = {
            wrapper : $(this.element).find('.wpgmza-styling-map-preview .wpgmza-style-guide-wrapper')
        };

        this.controls = {};
        $(this.element).find('.wpgmza-styling-editor fieldset').each(function(){
            self.prepareControl(this);
        });

        $(this.element).find('.wpgmza-styling-preset-select').on('change', function(){
            self.applyPreset(this);
        });

        this.bindEvents();
        this.parseUserPreset();
    }

    WPGMZA.StylingPage.PRESETS = {};
    WPGMZA.StylingPage.PRESETS.default = {
        "--wpgmza-component-color" : "#ffffff",
        "--wpgmza-component-text-color" : "#000000",
        "--wpgmza-component-color-accent" : "#1A73E8",
        "--wpgmza-component-text-color-accent" : "#ffffff",
        "--wpgmza-color-grey-500" : "#bfbfbf",
        "--wpgmza-component-border-radius" : "2px",
        "--wpgmza-component-font-size" : "15px",
        "--wpgmza-component-backdrop-filter" : "none"
    };
    
    WPGMZA.StylingPage.PRESETS.glass = {
        "--wpgmza-component-color" : "rgba(255, 255, 255, 0.3)",
        "--wpgmza-component-text-color" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-text-color"],
        "--wpgmza-component-color-accent" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-color-accent"],
        "--wpgmza-component-text-color-accent" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-text-color-accent"],
        "--wpgmza-color-grey-500" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-color-grey-500"],
        "--wpgmza-component-border-radius" : "8px",
        "--wpgmza-component-font-size" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-font-size"],
        "--wpgmza-component-backdrop-filter" : "blur(20px)"
    };

    WPGMZA.StylingPage.PRESETS.rounded = {
        "--wpgmza-component-color" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-color"],
        "--wpgmza-component-text-color" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-text-color"],
        "--wpgmza-component-color-accent" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-color-accent"],
        "--wpgmza-component-text-color-accent" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-text-color-accent"],
        "--wpgmza-color-grey-500" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-color-grey-500"],
        "--wpgmza-component-border-radius" : "20px",
        "--wpgmza-component-font-size" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-font-size"],
        "--wpgmza-component-backdrop-filter" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-backdrop-filter"]
    };

    WPGMZA.StylingPage.createInstance = function(){
        return new WPGMZA.StylingPage();
    }

    WPGMZA.StylingPage.prototype.prepareControl = function(element){
        var container = $(element);
        var input = container.find('input');

        var name = input.attr('name');

        if(name.trim() === ""){
            return;
        }
        
        this.controls[name] = {
            container : container,
            input : input
        };

        let activeInput = this.controls[name].input.length > 0 ? this.controls[name].input.get(0) : false;
        if(activeInput){
            if(activeInput.wpgmzaColorInput){
                const colorInput = activeInput.wpgmzaColorInput;
                if(colorInput.container){
                    this.controls[name].resetButton = $("<div class='wpgmza-styling-editor-reset-btn' data-reset-control-name='" + name + "' />");
                    colorInput.container.prepend(this.controls[name].resetButton);
                    colorInput.container.addClass('wpgmza-styling-editor-contains-reset');
                }
            } else if(activeInput.wpgmzaCSSUnitInput){
                const unitInput = activeInput.wpgmzaCSSUnitInput;
                if(unitInput.container){
                    this.controls[name].resetButton = $("<div class='wpgmza-styling-editor-reset-btn' data-reset-control-name='" + name + "' />");
                    unitInput.container.prepend(this.controls[name].resetButton);
                    unitInput.container.addClass('wpgmza-styling-editor-contains-reset');
                }

            }
        }


        this.resetControl(this.controls[name]);

    }

    WPGMZA.StylingPage.prototype.bindEvents = function(){
        var self = this;
        for(var name in this.controls){
            this.controls[name].input.on('change', function(){
                self.updateControl(this);
            });
        }

        this.styleGuide.steps = this.styleGuide.wrapper.find('.wpgmza-style-guide-step').length;
        this.styleGuide.index = 0;

        this.styleGuide.wrapper.find('.wpgmza-style-guide-nav .prev-btn').on('click', function(){
            self.styleGuide.index -= 1;
            if(self.styleGuide.index < 0){
                self.styleGuide.index = (self.styleGuide.steps - 1);
            }

            self.styleGuide.wrapper.trigger('update-view');
        });

        this.styleGuide.wrapper.find('.wpgmza-style-guide-nav .next-btn').on('click', function(){
            self.styleGuide.index += 1;
            if(self.styleGuide.index >= self.styleGuide.steps){
                self.styleGuide.index = 0;
            }

            self.styleGuide.wrapper.trigger('update-view');
        });

        this.styleGuide.wrapper.on('update-view', function(){
            self.styleGuide.wrapper.find('.wpgmza-style-guide-step').removeClass('active');
            self.styleGuide.wrapper.find('.wpgmza-style-guide-step:nth-child(' + (self.styleGuide.index + 1) + ')').addClass('active');
        });

        /* Body bound events */
        $(document.body).on('click', '.wpgmza-styling-editor-reset-btn', function(){
            const element = $(this);
            const field = $(this).data('reset-control-name');
            if(field && self.controls[field]){
                self.resetControl(self.controls[field]);
            }
        });
    }

    WPGMZA.StylingPage.prototype.updateControl = function(input){
        var name = $(input).attr('name');
        if(name && name.indexOf('--') !== -1){
            $('.wpgmza-styling-preview-wrap .wpgmza_map').css(name, $(input).val());
        }
    }

    WPGMZA.StylingPage.prototype.resetControl = function(control){
        var name = control.input.attr('name');
        if(!name || name.indexOf('--') === -1){
            return;
        }

        var value = $(':root').css(name);
        if(value){
            value = value.trim();

            const activeInput = control.input.length > 0 ? control.input.get(0) : false;
            if(activeInput){
                if(activeInput.wpgmzaColorInput){
                    const colorInput = activeInput.wpgmzaColorInput;
                    colorInput.parseColor(value);
                } else if(activeInput.wpgmzaCSSUnitInput){
                    const unitInput = activeInput.wpgmzaCSSUnitInput;
                    unitInput.parseUnits(value);
                } else if(activeInput.wpgmzaCSSBackdropFilterInput){
                    const backdropInput = activeInput.wpgmzaCSSBackdropFilterInput;
                    backdropInput.parseFilters(value);
                } else {
                    control.input.val(value);
                }
            } 
        }
    }

    WPGMZA.StylingPage.prototype.parseUserPreset = function(){
        if(WPGMZA.stylingSettings && WPGMZA.stylingSettings instanceof Object){
            if(Object.keys(WPGMZA.stylingSettings).length > 0){
                WPGMZA.StylingPage.PRESETS.user = WPGMZA.stylingSettings;
                $('.wpgmza-styling-preset-select').append("<option value='user'>User Defined</option>");
                $('.wpgmza-styling-preset-select').val('user').trigger('change');
            }
        }
    }

    WPGMZA.StylingPage.prototype.applyPreset = function(element){
        element = $(element);
        const value = element.val();
        if(value && WPGMZA.StylingPage.PRESETS[value]){
            const preset = WPGMZA.StylingPage.PRESETS[value];
            for(let fieldName in preset){
                const fieldValue = preset[fieldName];

                let field = $(this.element).find('input[name="' + fieldName + '"]');
                if(field.length > 0){
                    field = field.get(0);
                    if(field.wpgmzaColorInput){
                        field.wpgmzaColorInput.parseColor(fieldValue);
                    } else if(field.wpgmzaCSSUnitInput){
                        field.wpgmzaCSSUnitInput.parseUnits(fieldValue);
                    } else if(field.wpgmzaCSSBackdropFilterInput){
                        field.wpgmzaCSSBackdropFilterInput.parseFilters(fieldValue);
                    } else {
                        $(field).val(fieldValue);
                        $(field).trigger('change');
                    }
                }
            }
        }
    }

    $(document).ready(function(event) {
        if(WPGMZA.getCurrentPage()){
            WPGMZA.stylingPage = WPGMZA.StylingPage.createInstance();
        }
    });
});

// js/v8/support-page.js
/**
 * @namespace WPGMZA
 * @module SupportPage
 * @requires WPGMZA
 */


jQuery(function($) {
	WPGMZA.SupportPage = function(){
		var self = this;

        $(".support-page").tabs();

        $('.wpgmza-copy-sysinfo').on('click', function(){
            const info = $('.system-info').text();

            if(info.length){
				const temp = jQuery('<textarea>');
		        $(document.body).append(temp);
		        temp.val(info).select();
		        document.execCommand("copy");
		        temp.remove();
		        WPGMZA.notification("Info Copied");
			}
        });
    }

    WPGMZA.SupportPage.createInstance = function(){
        return new WPGMZA.SupportPage();
    }

    $(document).ready(function(event) { 
        if(WPGMZA.getCurrentPage() === WPGMZA.PAGE_SUPPORT){
            WPGMZA.supportPage = WPGMZA.SupportPage.createInstance();
        }
    });
});

// js/v8/text.js
/**
 * @namespace WPGMZA
 * @module Text
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.Text = function(options)
	{
		if(options)
			for(var name in options)
				this[name] = options[name];
	}
	
	WPGMZA.Text.createInstance = function(options)
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return new WPGMZA.OLText(options);
				break;
				
			default:
				return new WPGMZA.GoogleText(options);
				break;
		}
	}

	WPGMZA.Text.prototype.setPosition = function(position){
		if(this.overlay){
			this.overlay.setPosition(position);
		}
	}

	WPGMZA.Text.prototype.setText = function(text){
		if(this.overlay){
			this.overlay.setText(text);
		}
	}

	WPGMZA.Text.prototype.setFontSize = function(size){
		if(this.overlay){
			this.overlay.setFontSize(size);
		}
	}

	WPGMZA.Text.prototype.setFillColor = function(color){
		if(this.overlay){
			this.overlay.setFillColor(color);
		}
	}

	WPGMZA.Text.prototype.setLineColor = function(color){
		if(this.overlay){
			this.overlay.setLineColor(color);
		}
	}

	WPGMZA.Text.prototype.setOpacity = function(opacity){
		if(this.overlay){
			this.overlay.setOpacity(opacity);
		}
	}

	WPGMZA.Text.prototype.remove = function(){
		if(this.overlay){
			this.overlay.remove();
		}
	}

	WPGMZA.Text.prototype.refresh = function(){
		
	}
	
});

// js/v8/theme-editor.js
/**
 * @namespace WPGMZA
 * @module ThemeEditor
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.ThemeEditor = function()
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.element = $("#wpgmza-theme-editor");
		
		if(WPGMZA.settings.engine == "open-layers")
		{
			this.element.remove();

			/* Auto init OL Theme Editor, we could do this with a createInstance call, but the code here will be minimal, so lets skip this for the moment */
			this.olThemeEditor = new WPGMZA.OLThemeEditor();
			return;
		}
		
		if(!this.element.length)
		{
			console.warn("No element to initialise theme editor on");
			return;
		}
		
		this.json = [{}];
		this.mapElement = WPGMZA.maps[0].element;

		this.element.appendTo('#wpgmza-map-theme-editor__holder');
		
		$(window).on("scroll", function(event) {
			//self.updatePosition();
		});
		
		setInterval(function() {
			//self.updatePosition();
		}, 200);
		
		this.initHTML();
		
		WPGMZA.themeEditor = this;
	}
	
	WPGMZA.extend(WPGMZA.ThemeEditor, WPGMZA.EventDispatcher);
	
	WPGMZA.ThemeEditor.prototype.updatePosition = function()
	{
		//var offset = $(this.mapElement).offset();
		
		// var relativeTop = offset.top - $(window).scrollTop();
		// var relativeLeft = offset.left - $(window).scrollLeft();
		// var height = $(this.mapElement).height();
		// var width = $(this.mapElement).width();

		// this.element.css({
		// 	top:	(relativeTop - (height + 5)) + "px",
		// 	left:	(relativeLeft + width) + "px",
		// 	height:	height + "px",
		// 	width: width + 'px'
		// });
	}
	
	WPGMZA.ThemeEditor.features = {
		'all' : [],
		'administrative' : [
			'country',
			'land_parcel',
			'locality',
			'neighborhood',
			'province'
		],
		'landscape' : [
			'man_made',
			'natural',
			'natural.landcover',
			'natural.terrain'
		],
		'poi' : [
			'attraction',
			'business',
			'government',
			'medical',
			'park',
			'place_of_worship',
			'school',
			'sports_complex'
		],
		'road' : [
			'arterial',
			'highway',
			'highway.controlled_access',
			'local'
		],
		'transit' : [
			'line',
			'station',
			'station.airport',
			'station.bus',
			'station.rail'
		],
		'water' : []
	};
	
	WPGMZA.ThemeEditor.elements = {
		'all' : [],
		'geometry' : [
			'fill',
			'stroke'
		],
		'labels' : [
			'icon',
			'text',
			'text.fill',
			'text.stroke'
		]
	};
	
	WPGMZA.ThemeEditor.prototype.parse = function()
	{
		$('#wpgmza_theme_editor_feature option, #wpgmza_theme_editor_element option').css('font-weight', 'normal');
		$('#wpgmza_theme_editor_error').hide();
		$('#wpgmza_theme_editor').show();
		$('#wpgmza_theme_editor_do_hue').prop('checked', false);
		$('#wpgmza_theme_editor_hue').val('#000000');
		$('#wpgmza_theme_editor_lightness').val('');
		$('#wpgmza_theme_editor_saturation').val('');
		$('#wpgmza_theme_editor_gamma').val('');
		$('#wpgmza_theme_editor_do_invert_lightness').prop('checked', false);
		$('#wpgmza_theme_editor_visibility').val('inherit');
		$('#wpgmza_theme_editor_do_color').prop('checked', false);
		$('#wpgmza_theme_editor_color').val('#000000');
		$('#wpgmza_theme_editor_weight').val('');
		
		var textarea = $('textarea[name="wpgmza_theme_data"]');

		/* Refresh V9 Color Pickers */
		this.refreshColorInputs();
		
		if (!textarea.val() || textarea.val().length < 1) {
			this.json = [{}];
			return;
		}
		
		try {
			this.json = $.parseJSON($('textarea[name="wpgmza_theme_data"]').val());
		} catch (e) {
			this.json = [{}
			];
			$('#wpgmza_theme_editor').hide();
			$('#wpgmza_theme_editor_error').show();
			return;
		}
		if (!$.isArray(this.json)) {
			var jsonCopy = this.json;
			this.json = [];
			this.json.push(jsonCopy);
		}
		
		this.highlightFeatures();
		this.highlightElements();
		this.loadElementStylers();
	}
	
	WPGMZA.ThemeEditor.prototype.highlightFeatures = function()
	{
		$('#wpgmza_theme_editor_feature option').css('font-weight', 'normal');
		$.each(this.json, function (i, v) {
			if (v.hasOwnProperty('featureType')) {
				$('#wpgmza_theme_editor_feature option[value="' + v.featureType + '"]').css('font-weight', 'bold');
			} else {
				$('#wpgmza_theme_editor_feature option[value="all"]').css('font-weight', 'bold');
			}
		});

	}
	
	WPGMZA.ThemeEditor.prototype.highlightElements = function()
	{
		var feature = $('#wpgmza_theme_editor_feature').val();
		$('#wpgmza_theme_editor_element option').css('font-weight', 'normal');
		$.each(this.json, function (i, v) {
			if ((v.hasOwnProperty('featureType') && v.featureType == feature) ||
				(feature == 'all' && !v.hasOwnProperty('featureType'))) {
				if (v.hasOwnProperty('elementType')) {
					$('#wpgmza_theme_editor_element option[value="' + v.elementType + '"]').css('font-weight', 'bold');
				} else {
					$('#wpgmza_theme_editor_element option[value="all"]').css('font-weight', 'bold');
				}
			}
		});
	}
	
	WPGMZA.ThemeEditor.prototype.loadElementStylers = function()
	{
		const self = this;
		
		var feature = $('#wpgmza_theme_editor_feature').val();
		var element = $('#wpgmza_theme_editor_element').val();
		$('#wpgmza_theme_editor_do_hue').prop('checked', false);
		$('#wpgmza_theme_editor_hue').val('#000000');
		$('#wpgmza_theme_editor_lightness').val('');
		$('#wpgmza_theme_editor_saturation').val('');
		$('#wpgmza_theme_editor_gamma').val('');
		$('#wpgmza_theme_editor_do_invert_lightness').prop('checked', false);
		$('#wpgmza_theme_editor_visibility').val('inherit');
		$('#wpgmza_theme_editor_do_color').prop('checked', false);
		$('#wpgmza_theme_editor_color').val('#000000');
		$('#wpgmza_theme_editor_weight').val('');

		$.each(this.json, function (i, v) {
			if ((v.hasOwnProperty('featureType') && v.featureType == feature) ||
				(feature == 'all' && !v.hasOwnProperty('featureType'))) {
				if ((v.hasOwnProperty('elementType') && v.elementType == element) ||
					(element == 'all' && !v.hasOwnProperty('elementType'))) {
					if (v.hasOwnProperty('stylers') && $.isArray(v.stylers) && v.stylers.length > 0) {
						$.each(v.stylers, function (ii, vv) {
							if (vv.hasOwnProperty('hue')) {
								$('#wpgmza_theme_editor_do_hue').prop('checked', true);
								$('#wpgmza_theme_editor_hue').val(vv.hue);
							}
							if (vv.hasOwnProperty('lightness')) {
								$('#wpgmza_theme_editor_lightness').val(vv.lightness);
							}
							if (vv.hasOwnProperty('saturation')) {
								$('#wpgmza_theme_editor_saturation').val(vv.xaturation);
							}
							if (vv.hasOwnProperty('gamma')) {
								$('#wpgmza_theme_editor_gamma').val(vv.gamma);
							}
							if (vv.hasOwnProperty('invert_lightness')) {
								$('#wpgmza_theme_editor_do_invert_lightness').prop('checked', true);
							}
							if (vv.hasOwnProperty('visibility')) {
								$('#wpgmza_theme_editor_visibility').val(vv.visibility);
							}
							if (vv.hasOwnProperty('color')) {
								$('#wpgmza_theme_editor_do_color').prop('checked', true);
								$('#wpgmza_theme_editor_color').val(vv.color);
							}
							if (vv.hasOwnProperty('weight')) {
								$('#wpgmza_theme_editor_weight').val(vv.weight);
							}
						});
					}
				}
			}
		});

		/* Refresh V9 Color Pickers */
		this.refreshColorInputs();

	}
	
	WPGMZA.ThemeEditor.prototype.writeElementStylers = function()
	{
		var feature = $('#wpgmza_theme_editor_feature').val();
		var element = $('#wpgmza_theme_editor_element').val();
		var indexJSON = null;
		var stylers = [];
		
		if ($('#wpgmza_theme_editor_visibility').val() != "inherit") {
			stylers.push({
				'visibility': $('#wpgmza_theme_editor_visibility').val()
			});
		}
		if ($('#wpgmza_theme_editor_do_color').prop('checked') === true) {
			stylers.push({
				'color': $('#wpgmza_theme_editor_color').val()
			});
		}
		if ($('#wpgmza_theme_editor_do_hue').prop('checked') === true) {
			stylers.push({
				"hue": $('#wpgmza_theme_editor_hue').val()
			});
		}
		if ($('#wpgmza_theme_editor_gamma').val().length > 0) {
			stylers.push({
				'gamma': parseFloat($('#wpgmza_theme_editor_gamma').val())
			});
		}
		if ($('#wpgmza_theme_editor_weight').val().length > 0) {
			stylers.push({
				'weight': parseFloat($('#wpgmza_theme_editor_weight').val())
			});
		}
		if ($('#wpgmza_theme_editor_saturation').val().length > 0) {
			stylers.push({
				'saturation': parseFloat($('#wpgmza_theme_editor_saturation').val())
			});
		}
		if ($('#wpgmza_theme_editor_lightness').val().length > 0) {
			stylers.push({
				'lightness': parseFloat($('#wpgmza_theme_editor_lightness').val())
			});
		}
		if ($('#wpgmza_theme_editor_do_invert_lightness').prop('checked') === true) {
			stylers.push({
				'invert_lightness': true
			});
		}
		
		$.each(this.json, function (i, v) {
			if ((v.hasOwnProperty('featureType') && v.featureType == feature) ||
				(feature == 'all' && !v.hasOwnProperty('featureType'))) {
				if ((v.hasOwnProperty('elementType') && v.elementType == element) ||
					(element == 'all' && !v.hasOwnProperty('elementType'))) {
					indexJSON = i;
				}
			}
		});
		if (indexJSON === null) {
			if (stylers.length > 0) {
				var new_feature_element_stylers = {};
				if (feature != 'all') {
					new_feature_element_stylers.featureType = feature;
				}
				if (element != 'all') {
					new_feature_element_stylers.elementType = element;
				}
				new_feature_element_stylers.stylers = stylers;
				this.json.push(new_feature_element_stylers);
			}
		} else {
			if (stylers.length > 0) {
				this.json[indexJSON].stylers = stylers;
			} else {
				this.json.splice(indexJSON, 1);
			}
		}
		
		$('textarea[name="wpgmza_theme_data"]').val(JSON.stringify(this.json).replace(/:/g, ': ').replace(/,/g, ', '));
		
		this.highlightFeatures();
		this.highlightElements();
		
		WPGMZA.themePanel.updateMapTheme();
	}
	
	// TODO: WPGMZA.localized_strings
	
	WPGMZA.ThemeEditor.prototype.initHTML = function()
	{
		var self = this;

		$.each(WPGMZA.ThemeEditor.features, function (i, v) {
			$('#wpgmza_theme_editor_feature').append('<option value="' + i + '">' + i + '</option>');
			if (v.length > 0) {
				$.each(v, function (ii, vv) {
					$('#wpgmza_theme_editor_feature').append('<option value="' + i + '.' + vv + '">' + i + '.' + vv + '</option>');
				});
			}
		});
		$.each(WPGMZA.ThemeEditor.elements, function (i, v) {
			$('#wpgmza_theme_editor_element').append('<option value="' + i + '">' + i + '</option>');
			if (v.length > 0) {
				$.each(v, function (ii, vv) {
					$('#wpgmza_theme_editor_element').append('<option value="' + i + '.' + vv + '">' + i + '.' + vv + '</option>');
				});
			}
		});

		this.parse();
		
		// Bind listeners
		$('textarea[name="wpgmza_theme_data"]').on('input selectionchange propertychange', function() {
			self.parse();
		});
		
		$('.wpgmza_theme_selection').click(function(){
			setTimeout(function(){$('textarea[name="wpgmza_theme_data"]').trigger('input');}, 1000);
		});

		$('#wpgmza-theme-editor__toggle').click(function() {
			$('#wpgmza-theme-editor').removeClass('active');
		})
		
		$('#wpgmza_theme_editor_feature').on("change", function() {
			self.highlightElements();
			self.loadElementStylers();
		});
		
		$('#wpgmza_theme_editor_element').on("change", function() {
			self.loadElementStylers();
		});
		
		$('#wpgmza_theme_editor_do_hue, #wpgmza_theme_editor_hue, #wpgmza_theme_editor_lightness, #wpgmza_theme_editor_saturation, #wpgmza_theme_editor_gamma, #wpgmza_theme_editor_do_invert_lightness, #wpgmza_theme_editor_visibility, #wpgmza_theme_editor_do_color, #wpgmza_theme_editor_color, #wpgmza_theme_editor_weight').on('input selectionchange propertychange', function() {
			self.writeElementStylers();
		});
		
		if(WPGMZA.settings.engine == "open-layers")
			$("#wpgmza_theme_editor :input").prop("disabled", true);
	}

	WPGMZA.ThemeEditor.prototype.refreshColorInputs = function(){
		/* Will only run if wpgmzaColorInput is initialized, uses value as set */
		$('input#wpgmza_theme_editor_hue,input#wpgmza_theme_editor_color').each(function(){
			if(this.wpgmzaColorInput){
				this.wpgmzaColorInput.parseColor(this.value);
			}
		});
	}
	
});

// js/v8/theme-panel.js
/**
 * @namespace WPGMZA
 * @module ThemePanel
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.ThemePanel = function()
	{
		var self = this;
		
		this.element = $("#wpgmza-theme-panel");
		this.map = WPGMZA.maps[0];
		
		if(WPGMZA.settings.engine == "open-layers"){
			this.element.remove();

			/* Init OL Theme Panel from here, we could use createInstance for this, but for now it's not needed */
			this.olThemePanel = new WPGMZA.OLThemePanel();
			return;
		} 
		
		if(!this.element.length)
		{
			console.warn("No element to initialise theme panel on");
			return;
		}
		
		$("#wpgmza-theme-presets").owlCarousel({
			items: 6,
			dots: true
		});
		
		this.element.on("click", "#wpgmza-theme-presets label, .theme-selection-panel label", function(event) {
			self.onThemePresetClick(event);
		});
		
		$("#wpgmza-open-theme-editor").on("click", function(event) {
			$('#wpgmza-map-theme-editor__holder').addClass('active');
			$("#wpgmza-theme-editor").addClass('active');
			WPGMZA.animateScroll($("#wpgmza-theme-editor"));
		});
		
		WPGMZA.themePanel = this;
		
		/*CodeMirror.fromTextArea($("textarea[name='wpgmza_theme_data']")[0], {
			lineNumbers: true,
			mode: "javascript"
		});*/
	}
	
	// NB: These aren't used anywhere, but they are recorded here for future use in making preview images
	WPGMZA.ThemePanel.previewImageCenter	= {lat: 33.701806462148646, lng: -118.15949896058983};
	WPGMZA.ThemePanel.previewImageZoom		= 11;
	
	WPGMZA.ThemePanel.prototype.onThemePresetClick = function(event)
	{
		var selectedData	= $(event.currentTarget).find("[data-theme-json]").attr("data-theme-json");
		var textarea		= $("textarea[name='wpgmza_theme_data']");
		var existingData	= textarea.val();
		var allPresetData	= [];
		
		$(this.element).find("[data-theme-json]").each(function(index, el) {
			allPresetData.push( $(el).attr("data-theme-json") );
		});
		
		// NB: This code will only prompt the user to overwrite if a custom theme is not being used. This way you can still flick through the unmodified themes
		if(existingData.length && allPresetData.indexOf(existingData) == -1)
		{
			if(!confirm(WPGMZA.localized_strings.overwrite_theme_data))
				return;
		}
		
		textarea.val(selectedData);
		
		this.updateMapTheme();
		WPGMZA.themeEditor.parse();
	}
	
	WPGMZA.ThemePanel.prototype.updateMapTheme = function()
	{
		var data;
		
		try{
			data = JSON.parse($("textarea[name='wpgmza_theme_data']").val());
		}catch(e) {
			alert(WPGMZA.localized_strings.invalid_theme_data);
			return;
		}
		
		this.map.setOptions({styles: data});
	}
	
});

// js/v8/tour.js
/**
 * @namespace WPGMZA
 * @module Tour
 * @requires WPGMZA
 */

jQuery(function($) {
    /**
     * Constructor 
     * 
     * @param Element element The wrapper element 
     */
	WPGMZA.Tour = function(element){
        this.findElements(element);
        this.bindEvents();

        this.prepare();
        setTimeout(() => {
            this.prompt();
        }, 3000);
    }

    WPGMZA.Tour.INPUT_CHANGE_INTERVAL = 1500; 

    /**
     * Create a single tour instance
     *  
     * @param Element element The wrapper element 
     * @return WPGMZA.Tour
     */
    WPGMZA.Tour.createInstance = function(element){
        return new WPGMZA.Tour(element);
    }

    /**
     * Static auto init of all tours 
     * 
     * @return void
     */
    WPGMZA.Tour.AutoInit = function(){
        WPGMZA.adminTours = {};
        $(document.body).find('.wpgmza-tour').each(function(index, element){
            const type = $(element).data('type');
            WPGMZA.adminTours[type] = WPGMZA.Tour.createInstance(element);
        });
    }

    /**
     * Prepare the tour based on the elements we have in this instance 
     * 
     * This finds the max steps, and then also sets the start, while initializing a state tracker 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.prepare = function(){
        this.slug = this.elements.wrapper.data('type');

        this.state = {
            running : false,
            step : 0,
            steps : this.elements.steps.length || 0
        }
    }

    /**
     * Find all relelvant tour elements 
     * 
     * @param Element wrapper The tour wrapper element 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.findElements = function(wrapper){
        this.elements = {};
        this.elements.wrapper = $(wrapper);

        this.elements.prompt = this.elements.wrapper.find('.wpgmza-tour-prompt'); 
        this.elements.promptAction = this.elements.prompt.find('.wpgmza-tour-prompt-actions .wpgmza-button');

        this.elements.steps = this.elements.wrapper.find('.wpgmza-tour-step');
    }

    /**
     * Bind events for the tour within the system 
     * 
     * This is more so for the main tour handlers, and less on the anchors
     * 
     * @return void 
     */
    WPGMZA.Tour.prototype.bindEvents = function(){
        /* Prebound events */
        this.elements.promptAction.on('click', (event) => {
            if(event && event.currentTarget){
                this.onPromptAction(event.currentTarget);
            }
        });

        /* Nested events */
        this.elements.steps.each((i, elem) => {
            const anchor = $(elem).data('anchor');
            if(anchor){
                $(anchor).addClass('wpgmza-tour-anchor-link');
            }
        });

        /* Global events, dynamically bounds to body, filers to class */
        $(document.body).on('click', '.wpgmza-tour-next-step-delegate', (event) => {
            if(event.currentTarget instanceof HTMLInputElement){
                /* This is an input, let the input delegate handler sort it */
                return;
            }

            if($(event.currentTarget).data('auto-step')){
                /* This step is automatically handled by the system, no user interaction required */
                event.preventDefault();
                return;
            }

            this.next();
        });

        $(document.body).on('keyup', '.wpgmza-tour-next-step-delegate', (event) => {
            if(event.currentTarget instanceof HTMLInputElement){
                if(event.currentTarget._wpgmzaChangeTimer){
                    clearTimeout(event.currentTarget._wpgmzaChangeTimer);
                }

                /* Timeouts should allow for a few characters to be typed before continuing to the next step */
                event.currentTarget._wpgmzaChangeTimer = setTimeout(() => {
                    this.next();
                }, WPGMZA.Tour.INPUT_CHANGE_INTERVAL);
            }
        });

        $(document.body).on('click', '.wpgmza-tour-anchor-link', (event) => {
            if(!this.state.running){
                /* The user clicked on a tour item before starting the tour, let's dismiss it early */
                this.stop();

                /* We dismiss it as a short term dismissal, this allows it to reload in a few days ideally */
                this.dismiss(true);
            }
        });

        $(document.body).on('click', (event) => {
            this.onFramedClick(event);
        });
    }

    /**
     * On prompt action taen 
     *  
     * @param Element context The button that triggered this event
     */
    WPGMZA.Tour.prototype.onPromptAction = function(context){
        if(context instanceof Element){
            const action = $(context).data('action');            
            switch(action){
                case 'start':
                    this.state.running = true;
                    this.step(0);
                    break;
                default: 
                    this.stop();
                    this.dismiss();
                    break;
            }

        }
    }

    /**
     * On click while framed, we assume framed, but this method will actually check if the frame is active, and do the things 
     * 
     * @param Event event The event that triggered this element 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.onFramedClick = function(event) {
        if(this.elements.frame && this.elements.frame.hasClass('active')){
            if(!jQuery.contains(this.elements.wrapper.get(0), event.target)){
                /* The element is not a part of the tour, that's for sure, but lets make sure it's not a delegate */
                if(!$(event.target).hasClass('wpgmza-tour-next-step-delegate') && !$(event.target).hasClass('wpgmza-tour-anchor-link')){

                    /* Finally, because we don't actually fully bind to elements on an individual level, we must run a boundary comparison on the frame */
                    const boundary = Object.assign({}, this._lastFramePlacement);
                    const pointerEvent = event.originalEvent || false;
                    if(boundary.top && boundary.left && pointerEvent && pointerEvent instanceof PointerEvent){
                        boundary.right = boundary.left + boundary.width;
                        boundary.bottom = boundary.top + boundary.height;

                        const mouse = {
                            x : pointerEvent.clientX,
                            y : pointerEvent.clientY
                        };

                        let shouldDismiss = false;
                        if(mouse.x < boundary.left || mouse.x > boundary.right){
                            /* User is either too far left or too far right */
                            shouldDismiss = true;
                        }

                        if(mouse.y < boundary.top || mouse.y > boundary.bottom){
                            /* User is either too high or too low */
                            shouldDismiss = true;
                        }

                        if(shouldDismiss){
                            this.stop();
                            this.dismiss(true);
                        }
                    } else {
                        /* Assume but ya - Short term dismissal*/
                        this.stop();
                        this.dismiss(true);
                    }                    
                }
            }
        }
    }

    /**
     * Load the prompt popup to either start or dismiss the tour 
     * 
     * This also sets the default step to the start so that everything flows correctly 
     * 
     * @return void 
     */
    WPGMZA.Tour.prototype.prompt = function(){
        this.state.running = false;
        this.state.step = 0;

        this.elements.steps.removeClass('active');
        this.elements.prompt.addClass('active');
    }

    /**
     * Stop the tour 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.stop = function(){
        this.clearViewport();

        this.elements.prompt.removeClass('active');
        this.elements.steps.removeClass('active');
    }

    /**
     * Load a specific step in the tour 
     * 
     * This will hide prompt, and any open steps 
     * 
     * @param int index The step index you want to load up
     * 
     * @return void 
     */
    WPGMZA.Tour.prototype.step = function(index){
        if(this.state.running){
            this.state.step = index;
            
            this.elements.prompt.removeClass('active');
            this.elements.steps.removeClass('active');

            /* Unbind delegates */
            $('.wpgmza-tour-next-step-delegate').removeClass('wpgmza-tour-next-step-delegate');

            if(this.elements.steps[this.state.step]){
                const stepElement = $(this.elements.steps[this.state.step]);
                const anchor = stepElement.data('anchor');

                this.frame(anchor);

                if(this._lastFramePlacement){

                    stepElement.addClass('active');

                    stepElement.css({
                        left : (this._lastFramePlacement.left + this._lastFramePlacement.width) + 'px',
                        top : ((this._lastFramePlacement.top + (this._lastFramePlacement.height / 2)) - (stepElement.outerHeight() / 2)) + 'px'
                    });

                }

                /* Bind delegates */
                $(anchor).addClass('wpgmza-tour-next-step-delegate');

                if(this._lastAutoStepTimer){
                    clearTimeout(this._lastAutoStepTimer);
                }
                if(stepElement.data('auto-step')){
                    this._lastAutoStepTimer = setTimeout(() => {
                        this.next();
                    }, parseInt(stepElement.data('auto-step')));
                }
            }
        }
    }

    /**
     * Move to the next step 
     * 
     * This would be driven by the anchor being clicked/interacted with on screen, perhaps also by a next button, but we will see
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.next = function(){
        if(this.state.running){
            this.clearViewport();
            
            let nextStep = this.state.step + 1; 
            if(nextStep < this.state.steps){
                /* We can step */
                let delay = this.getStepDelay(nextStep);
                if(delay){
                    /* This has a delay */
                    setTimeout(() => {
                        this.step(nextStep);
                    }, delay);
                } else {
                    /* Run it */
                    this.step(nextStep);
                }
            } else {
                this.complete();
            }
        }
    }

    /**
     * Frame the anchor with a shadow box 
     * 
     * @param string anchor The anchor selector 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.frame = function(anchor){
        if(!this.elements.frame){
            this.elements.frame = $("<div class='wpgmza-tour-frame'></div>");
            this.elements.frame.appendTo(this.elements.wrapper);
        }

        this._lastFramePlacement = false;
        this.elements.frame.removeClass('active');

        const anchorElement = document.querySelector(anchor);
        if(anchorElement){
            const anchorRect = anchorElement.getBoundingClientRect();
            const computedStyles = window.getComputedStyle(anchorElement, null);

            const frameStyle = {
                top : parseInt(anchorRect.top),
                left : parseInt(anchorRect.left),
                width : parseInt(anchorRect.width),
                height : parseInt(anchorRect.height),
                borderRadius : 0
            };

            this.elements.frame.css('--wpgmza-tour-frame-border-radius', '0px');
            if(parseInt(computedStyles['border-radius'])){
                frameStyle.borderRadius = parseInt(computedStyles['border-radius']);
                this.elements.frame.css('--wpgmza-tour-frame-border-radius', parseInt(computedStyles['border-radius']) + 'px');
            }

            this._lastFramePlacement = Object.assign({}, frameStyle);

            for(let i in frameStyle){
                frameStyle[i] += "px";
            }
            
            this.elements.frame.css(frameStyle);
            this.elements.frame.addClass('active');
        } 
    }

    /**
     * Clears the active viewport in full, of frames and popups 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.clearViewport = function(){
        if(this.elements.frame && this.elements.frame.hasClass('active')){
            this.elements.frame.removeClass('active');
        }

        this.elements.steps.removeClass('active');
    }

    /**
     * Get and check if a step has a delay associated with it 
     * 
     * @param int index The step you want to get the delay for 
     * 
     * @return int
     */
    WPGMZA.Tour.prototype.getStepDelay = function(index){
        if($(this.elements.steps[index]).data('step-delay')){
            return parseInt($(this.elements.steps[index]).data('step-delay'));
        }
        return 0;
    }

    /**
     * Dismiss the tour
     * 
     * This sends a request to server-side to actually flag this tour as dismissed, you could allow a tour to be dismissed for a few days, or permanently
     * 
     * @param bool short Should this be a short term dismissal, or is it permanent 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.dismiss = function(short){
        if(this.state.complete){
            /* It's already been completed */
            return true;
        }

        short = short ? true : false;
        const data = {
            action  : 'wpgmza_tour_progress_update',
            wpgmza_security : WPGMZA.ajaxnonce,
            tour : this.slug,
            type : short ? 'sleep' : 'dismiss'
        };

        this.request(data, () => {
            /* We don't need to do anything */
        });
    }

    /**
     * Complete a tour, this could store metadata about the tour, if needed, and trigger the next tour, if you wanted it to 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.complete = function(){
        this.state.running = false;
        this.state.complete = true;

        const data = {
            action  : 'wpgmza_tour_progress_update',
            wpgmza_security : WPGMZA.ajaxnonce,
            tour : this.slug,
            type : 'complete'
        };

        this.request(data, () => {
            /* We don't need to do anything */
        });
    }

    /**
     * Server side request, always sent via POST, but with any data you might need 
     * 
     * @param object data 
     * @param function complete 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.request = function(data, complete){
        if(typeof complete !== 'function'){
            complete = () => {};
        }

        $.ajax(WPGMZA.ajaxurl, {
            method: "POST",
            data: data,
            success: function(response, status, xhr) {
                complete(response);
            },
            error : function(){
                complete();
            }
        });
    }

    /* Init */
    $(document).ready(function(event) {
        if(WPGMZA.getCurrentPage()){
            WPGMZA.Tour.AutoInit();
        }
    });
})

// js/v8/version.js
/**
 * @namespace WPGMZA
 * @module Version
 * @requires WPGMZA
 */
jQuery(function($) {

	function isPositiveInteger(x) {
		// http://stackoverflow.com/a/1019526/11236
		return /^\d+$/.test(x);
	}

	function validateParts(parts) {
		for (var i = 0; i < parts.length; ++i) {
			if (!isPositiveInteger(parts[i])) {
				return false;
			}
		}
		return true;
	}
	
	WPGMZA.Version = function()
	{
		
	}
	
	WPGMZA.Version.GREATER_THAN		= 1;
	WPGMZA.Version.EQUAL_TO			= 0;
	WPGMZA.Version.LESS_THAN		= -1;
	
	/**
	 * Compare two software version numbers (e.g. 1.7.1)
	 * Returns:
	 *
	 *  0 if they're identical
	 *  negative if v1 < v2
	 *  positive if v1 > v2
	 *  NaN if they in the wrong format
	 *
	 *  "Unit tests": http://jsfiddle.net/ripper234/Xv9WL/28/
	 *
	 *  Taken from http://stackoverflow.com/a/6832721/11236
	 */
	WPGMZA.Version.compare = function(v1, v2)
	{
		var v1parts = v1.match(/\d+/g);
		var v2parts = v2.match(/\d+/g);

		for (var i = 0; i < v1parts.length; ++i) {
			if (v2parts.length === i) {
				return 1;
			}

			if (v1parts[i] === v2parts[i]) {
				continue;
			}
			if (v1parts[i] > v2parts[i]) {
				return 1;
			}
			return -1;
		}

		if (v1parts.length != v2parts.length) {
			return -1;
		}

		return 0;
	}

});

// js/v8/xml-cache-converter.js
/**
 * @namespace WPGMZA
 * @module XMLCacheConverter
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.XMLCacheConverter = function()
	{
		
	}
	
	WPGMZA.XMLCacheConverter.prototype.convert = function(xml)
	{
		var markers = [];
		var remap = {
			"marker_id":	"id",
			"linkd":		"link"
		};
		
		$(xml).find("marker").each(function(index, el) {
			
			var data = {};
			
			$(el).children().each(function(j, child) {
				
				var key = child.nodeName;
				
				if(remap[key])
					key = remap[key];
				
				if(child.hasAttribute("data-json"))
					data[key] = JSON.parse($(child).text());
				else
					data[key] = $(child).text();
				
			});
			
			markers.push(data);
			
		});
		
		return markers;
	}
	
});

// js/v8/xml-parse-web-worker.js
/**
 * @namespace WPGMZA
 * @module XMLParseWebWorker
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.loadXMLAsWebWorker = function()
	{
		// tXml by Tobias Nickel
		/**
		 * @author: Tobias Nickel
		 * @created: 06.04.2015
		 * I needed a small xmlparser chat can be used in a worker.
		 */
		function tXml(a,d){function c(){for(var l=[];a[b];){if(60==a.charCodeAt(b)){if(47===a.charCodeAt(b+1)){b=a.indexOf(">",b);break}else if(33===a.charCodeAt(b+1)){if(45==a.charCodeAt(b+2)){for(;62!==a.charCodeAt(b)||45!=a.charCodeAt(b-1)||45!=a.charCodeAt(b-2)||-1==b;)b=a.indexOf(">",b+1);-1===b&&(b=a.length)}else for(b+=2;62!==a.charCodeAt(b);)b++;b++;continue}var c=f();l.push(c)}else c=b,b=a.indexOf("<",b)-1,-2===b&&(b=a.length),c=a.slice(c,b+1),0<c.trim().length&&l.push(c);b++}return l}function l(){for(var c=
		b;-1===g.indexOf(a[b]);)b++;return a.slice(c,b)}function f(){var d={};b++;d.tagName=l();for(var f=!1;62!==a.charCodeAt(b);){var e=a.charCodeAt(b);if(64<e&&91>e||96<e&&123>e){for(var g=l(),e=a.charCodeAt(b);39!==e&&34!==e&&!(64<e&&91>e||96<e&&123>e)&&62!==e;)b++,e=a.charCodeAt(b);f||(d.attributes={},f=!0);if(39===e||34===e){var e=a[b],h=++b;b=a.indexOf(e,h);e=a.slice(h,b)}else e=null,b--;d.attributes[g]=e}b++}47!==a.charCodeAt(b-1)&&("script"==d.tagName?(f=b+1,b=a.indexOf("\x3c/script>",b),d.children=
		[a.slice(f,b-1)],b+=8):"style"==d.tagName?(f=b+1,b=a.indexOf("</style>",b),d.children=[a.slice(f,b-1)],b+=7):-1==k.indexOf(d.tagName)&&(b++,d.children=c(g)));return d}d=d||{};var g="\n\t>/= ",k=["img","br","input","meta","link"],h=null;if(d.searchId){var b=(new RegExp("s*ids*=s*['\"]"+d.searchId+"['\"]")).exec(a).index;-1!==b&&(b=a.lastIndexOf("<",b),-1!==b&&(h=f()));return b}b=0;h=c();d.filter&&(h=tXml.filter(h,d.filter));d.simplify&&(h=tXml.simplefy(h));return h}
		tXml.simplify=function(a){var d={};if(1===a.length&&"string"==typeof a[0])return a[0];a.forEach(function(a){d[a.tagName]||(d[a.tagName]=[]);if("object"==typeof a){var c=tXml.simplefy(a.children);d[a.tagName].push(c);a.attributes&&(c._attributes=a.attributes)}else d[a.tagName].push(a)});for(var c in d)1==d[c].length&&(d[c]=d[c][0]);return d};tXml.filter=function(a,d){var c=[];a.forEach(function(a){"object"===typeof a&&d(a)&&c.push(a);a.children&&(a=tXml.filter(a.children,d),c=c.concat(a))});return c};
		tXml.domToXml=function(a){function d(a){if(a)for(var f=0;f<a.length;f++)if("string"==typeof a[f])c+=a[f].trim();else{var g=a[f];c+="<"+g.tagName;var k=void 0;for(k in g.attributes)c=-1===g.attributes[k].indexOf('"')?c+(" "+k+'="'+g.attributes[k].trim()+'"'):c+(" "+k+"='"+g.attributes[k].trim()+"'");c+=">";d(g.children);c+="</"+g.tagName+">"}}var c="";d(O);return c};"object"!==typeof window&&(module.exports=tXml);
		
		var worker = self;
		var inputData;
		var dataForMainThread = [];
		var filesLoaded = 0;
		var totalFiles;
		
		function onXMLLoaded(request)
		{
			if(request.readyState != 4 || request.status != 200)
				return;
			
			var start	= new Date().getTime();
			var xml		= tXml(request.responseText);
			
			convertAndAppend(xml);
			
			if(++filesLoaded >= totalFiles)
			{
				worker.postMessage(dataForMainThread);
				return;
			}
			
			loadNextFile();
		}
		
		function convertAndAppend(xml)
		{
			var root	= xml[0];
			var markers	= root.children[0];
			var json	= [];
			var remap	= {
				"marker_id":	"id",
				"linkd":		"link"
			};
			
			for(var i = 0; i < markers.children.length; i++)
			{
				var data = {};
				
				markers.children[i].children.forEach(function(node) {
					
					var key = node.tagName;
					
					if(remap[key])
						key = remap[key];
					
					if(node.attributes["data-json"])
						data[key] = JSON.parse(node.children[0]);
					else
					{
						if(node.children.length)
							data[key] = node.children[0];
						else
							data[key] = "";
					}
					
				});
				
				dataForMainThread.push(data);
			}
		}
		
		function loadNextFile()
		{
			var url = inputData.urls[filesLoaded];
			var request = new XMLHttpRequest();
			
			request.onreadystatechange = function() {
				onXMLLoaded(this);
			};
			
			request.open("GET", inputData.protocol + url, true);
			request.send();
		}
		
		self.addEventListener("message", function(event) {
			
			var data = event.data;
			
			switch(data.command)
			{
				case "load":
				
					inputData = data;
					dataForMainThread = [];
					filesLoaded = 0;
					totalFiles = data.urls.length;
					
					loadNextFile();
					
					break;
				
				default:
					throw new Error("Unknown command");
					break;
			}
			
		}, false);
		
	}
	
});

// js/v8/3rd-party-integration/integration.js
/**
 * @namespace WPGMZA
 * @module Integration
 * @requires WPGMZA
 */
jQuery(function($) {
	WPGMZA.Integration = {};
	WPGMZA.integrationModules = {};

	WPGMZA.Integration.Blocks = {};
	WPGMZA.Integration.Blocks.instances = {};
});

// js/v8/compatibility/astra-theme-compatibility.js
/**
 * @namespace WPGMZA
 * @module AstraThemeCompatiblity
 * @requires WPGMZA
 * @description Prevents the document.body.onclick handler firing for markers, which causes the Astra theme to throw an error, preventing the infowindow from opening
 */
jQuery(function($) {
	
	$(document).ready(function(event) {
		
		var parent = document.body.onclick;
		
		if(!parent)
			return;
		
		document.body.onclick = function(event)
		{
			if(event.target instanceof WPGMZA.Marker)
				return;
			
			parent(event);
		}
		
	});
	
});

// js/v8/compatibility/google-ui-compatibility.js
/**
 * @namespace WPGMZA
 * @module GoogleUICompatibility
 * @requires WPGMZA
 */ 
jQuery(function($) {
	
	WPGMZA.GoogleUICompatibility = function()
	{
		var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
				   navigator.userAgent &&
				   navigator.userAgent.indexOf('CriOS') == -1 &&
				   navigator.userAgent.indexOf('FxiOS') == -1;
		
		if(!isSafari)
		{
			var style = $("<style id='wpgmza-google-ui-compatiblity-fix'/>");
			style.html(".wpgmza_map img:not(button img) { padding:0 !important; }");
			$(document.head).append(style);
		}
	}
	
	WPGMZA.googleUICompatibility = new WPGMZA.GoogleUICompatibility();
	
});

// js/v8/google-maps/google-circle.js
/**
 * @namespace WPGMZA
 * @module GoogleCircle
 * @requires WPGMZA.Circle
 * @pro-requires WPGMZA.ProCircle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	/**
	 * Subclass, used when Google is the maps engine. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.GoogleCircle
	 * @constructor WPGMZA.GoogleCircle
	 * @memberof WPGMZA
	 * @augments WPGMZA.Circle
	 * @see WPGMZA.Circle.createInstance
	 */
	WPGMZA.GoogleCircle = function(options, googleCircle)
	{
		var self = this;
		
		Parent.call(this, options, googleCircle);
		
		if(googleCircle)
		{
			this.googleCircle = googleCircle;
			
			if(options)
			{

				options.center = WPGMZA.LatLng.fromGoogleLatLng( googleCircle.getCenter() );
				options.radius = googleCircle.getRadius() / 1000; // Meters to kilometers
			}
		}
		else
		{
			this.googleCircle = new google.maps.Circle();
			this.googleCircle.wpgmzaCircle = this;
		}
		
		this.googleFeature = this.googleCircle;
		
		if(options)
			this.setOptions(options);
		
		google.maps.event.addListener(this.googleCircle, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProCircle;
	
	WPGMZA.GoogleCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleCircle.prototype.constructor = WPGMZA.GoogleCircle;
	
	WPGMZA.GoogleCircle.prototype.getCenter = function()
	{
		return WPGMZA.LatLng.fromGoogleLatLng( this.googleCircle.getCenter() );
	}
	
	WPGMZA.GoogleCircle.prototype.setCenter = function(center)
	{
		WPGMZA.Circle.prototype.setCenter.apply(this, arguments);
		
		this.googleCircle.setCenter(center);
	}
	
	WPGMZA.GoogleCircle.prototype.getRadius = function()
	{
		return this.googleCircle.getRadius() / 1000; // Meters to kilometers
	}
	
	WPGMZA.GoogleCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
		
		this.googleCircle.setRadius(parseFloat(radius) * 1000); // Kilometers to meters
	}
	
	WPGMZA.GoogleCircle.prototype.setVisible = function(visible)
	{
		this.googleCircle.setVisible(visible ? true : false);
	}
	
	WPGMZA.GoogleCircle.prototype.setDraggable = function(value)
	{
		this.googleCircle.setDraggable(value ? true : false);
	}
	
	WPGMZA.GoogleCircle.prototype.setEditable = function(value)
	{
		var self = this;
		
		this.googleCircle.setOptions({editable: value});
		
		if(value)
		{
			google.maps.event.addListener(this.googleCircle, "center_changed", function(event) {
				
				self.center = WPGMZA.LatLng.fromGoogleLatLng(self.googleCircle.getCenter());
				self.trigger("change");
				
			});
			
			google.maps.event.addListener(this.googleCircle, "radius_changed", function(event) {
				
				self.radius = self.googleCircle.getRadius() / 1000; // Meters to kilometers
				self.trigger("change");
				
			});
		}
	}
	
	WPGMZA.GoogleCircle.prototype.setOptions = function(options)
	{
		WPGMZA.Circle.prototype.setOptions.apply(this, arguments);
		
		if(options.center)
			this.center = new WPGMZA.LatLng(options.center);
	}
	
	WPGMZA.GoogleCircle.prototype.updateNativeFeature = function()
	{
		var googleOptions = this.getScalarProperties();
		var center = new WPGMZA.LatLng(this.center); // In case center is a lat lng literal, this should really happen though
		
		googleOptions.radius *= 1000; // Kilometers to meters
		googleOptions.center = center.toGoogleLatLng();
		
		this.googleCircle.setOptions(googleOptions);
	}
	
});

// js/v8/google-maps/google-drawing-manager.js
/**
 * @namespace WPGMZA
 * @module GoogleDrawingManager
 * @requires WPGMZA.DrawingManager
 */
jQuery(function($) {
	
	WPGMZA.GoogleDrawingManager = function(map)
	{
		var self = this;
		
		WPGMZA.DrawingManager.call(this, map);
		
		this.mode = null;
		
		this.googleDrawingManager = new google.maps.drawing.DrawingManager({
			drawingControl: false,
			polygonOptions: {
				editable: true
			},
			polylineOptions: {
				editable: true
			},
			circleOptions: {
				editable: true
			},
			rectangleOptions: {
				draggable: true,
				editable: true,
				strokeWeight: 1,
				fillOpacity: 0
			}
		});
		
		this.googleDrawingManager.setMap(map.googleMap);
		
		google.maps.event.addListener(this.googleDrawingManager, "polygoncomplete", function(polygon) {
			self.onPolygonClosed(polygon);
		});
		
		google.maps.event.addListener(this.googleDrawingManager, "polylinecomplete", function(polyline) {
			self.onPolylineComplete(polyline);
		});
		
		google.maps.event.addListener(this.googleDrawingManager, "circlecomplete", function(circle) {
			self.onCircleComplete(circle);
		});
		
		google.maps.event.addListener(this.googleDrawingManager, "rectanglecomplete", function(rectangle) {
			self.onRectangleComplete(rectangle);
		});
	}
	
	WPGMZA.GoogleDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.GoogleDrawingManager.prototype.constructor = WPGMZA.GoogleDrawingManager;
	
	WPGMZA.GoogleDrawingManager.prototype.setDrawingMode = function(mode)
	{
		var googleMode;
		
		WPGMZA.DrawingManager.prototype.setDrawingMode.call(this, mode);
		
		switch(mode)
		{
			case WPGMZA.DrawingManager.MODE_NONE:
				googleMode = null;
				break;
				
			case WPGMZA.DrawingManager.MODE_MARKER:
				/* Set to null to allow only right click */
				/*
					googleMode = google.maps.drawing.OverlayType.MARKER;
				*/
				googleMode = null;
				break;
			
            case WPGMZA.DrawingManager.MODE_POLYGON:
				googleMode = google.maps.drawing.OverlayType.POLYGON;
				break;
			
		    case WPGMZA.DrawingManager.MODE_POLYLINE:
				googleMode = google.maps.drawing.OverlayType.POLYLINE;
				break;
				
			case WPGMZA.DrawingManager.MODE_CIRCLE:
				googleMode = google.maps.drawing.OverlayType.CIRCLE;
				break;
				
			case WPGMZA.DrawingManager.MODE_RECTANGLE:
				googleMode = google.maps.drawing.OverlayType.RECTANGLE;
				break;
				
			case WPGMZA.DrawingManager.MODE_HEATMAP:
				googleMode = null;
				break;

			case WPGMZA.DrawingManager.MODE_POINTLABEL:
				googleMode = null;
				// googleMode = google.maps.drawing.OverlayType.MARKER;
				break;

			case WPGMZA.DrawingManager.MODE_IMAGEOVERLAY:
				googleMode = google.maps.drawing.OverlayType.RECTANGLE;
				break;
				
			default:
				throw new Error("Invalid drawing mode");
				break;
		}
		
		this.googleDrawingManager.setDrawingMode(googleMode);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.setOptions = function(options)
	{
		this.googleDrawingManager.setOptions({
			polygonOptions: options,
			polylineOptions: options
		});
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onVertexClicked = function(event) {
		
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onPolygonClosed = function(googlePolygon)
	{
		var event = new WPGMZA.Event("polygonclosed");
		event.enginePolygon = googlePolygon;
		this.dispatchEvent(event);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onPolylineComplete = function(googlePolyline)
	{
		var event = new WPGMZA.Event("polylinecomplete");
		event.enginePolyline = googlePolyline;
		this.dispatchEvent(event);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onCircleComplete = function(googleCircle)
	{
		var event = new WPGMZA.Event("circlecomplete");
		event.engineCircle = googleCircle;
		this.dispatchEvent(event);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onRectangleComplete = function(googleRectangle){
		if(this.mode === WPGMZA.DrawingManager.MODE_IMAGEOVERLAY){
			/* Uses rectangles, but doesn't store them, so relay */
			this.onImageoverlayComplete(googleRectangle);
			return;
		}

		var event = new WPGMZA.Event("rectanglecomplete");
		event.engineRectangle = googleRectangle;
		this.dispatchEvent(event);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onHeatmapPointAdded = function(googleMarker)
	{
		var position = WPGMZA.LatLng.fromGoogleLatLng(googleMarker.getPosition());
		googleMarker.setMap(null);
		
		var marker = WPGMZA.Marker.createInstance();
		marker.setPosition(position);
		
		var image = {
			url:	WPGMZA.imageFolderURL + "heatmap-point.png",
			origin:	new google.maps.Point(0, 0),
			anchor: new google.maps.Point(13, 13)
		};
		
		marker.googleMarker.setIcon(image);
		
		this.map.addMarker(marker);
		
		var event = new WPGMZA.Event("heatmappointadded");
		event.position = position;
		this.trigger(event);
	}

	WPGMZA.GoogleDrawingManager.prototype.onImageoverlayComplete = function(rectangle){
		var event = new WPGMZA.Event("imageoverlaycomplete");
		event.engineImageoverlay = {
			googleRectangle : rectangle
		};
		this.dispatchEvent(event);	
	}
	
});

// js/v8/google-maps/google-geocoder.js
/**
 * @namespace WPGMZA
 * @module GoogleGeocoder
 * @requires WPGMZA.Geocoder
 */
jQuery(function($) {
	
	/**
	 * Subclass, used when Google is the maps engine. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.GoogleGeocoder
	 * @constructor WPGMZA.GoogleGeocoder
	 * @memberof WPGMZA
	 * @augments WPGMZA.Geocoder
	 * @see WPGMZA.Geocoder.createInstance
	 */
	WPGMZA.GoogleGeocoder = function()
	{
		
	}
	
	WPGMZA.GoogleGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.GoogleGeocoder.prototype.constructor = WPGMZA.GoogleGeocoder;
	
	WPGMZA.GoogleGeocoder.prototype.getLatLngFromAddress = function(options, callback) {

		if(!options || !options.address) {
			
			nativeStatus = WPGMZA.Geocoder.NO_ADDRESS;
			callback(null, nativeStatus);
			return;
			/*throw new Error("No address specified");*/

		}

		if (options.lat && options.lng) {
			var latLng = {
				lat: options.lat,
				lng: options.lng
			};
			var bounds = null;
			
			var results = [
				{
					geometry: {
						location: latLng
					},
					latLng: latLng,
					lat: latLng.lat,
					lng: latLng.lng,
					bounds: bounds
				}
			];
			
			callback(results, WPGMZA.Geocoder.SUCCESS);
		} else {

		}
		
		if(WPGMZA.isLatLngString(options.address))
			return WPGMZA.Geocoder.prototype.getLatLngFromAddress.call(this, options, callback);
		
		if(options.country)
			options.componentRestrictions = {
				country: options.country
			};
		
		var geocoder = new google.maps.Geocoder();
		
		geocoder.geocode(options, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK)
			{
				var location = results[0].geometry.location;
				var latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				var bounds = null;
				
				if(results[0].geometry.bounds)
					bounds = WPGMZA.LatLngBounds.fromGoogleLatLngBounds(results[0].geometry.bounds);
				
				var results = [
					{
						geometry: {
							location: latLng
						},
						latLng: latLng,
						lat: latLng.lat,
						lng: latLng.lng,
						bounds: bounds
					}
				];
				
				
				
				callback(results, WPGMZA.Geocoder.SUCCESS);
			}
			else
			{
				var nativeStatus = WPGMZA.Geocoder.FAIL;
				
				if(status == google.maps.GeocoderStatus.ZERO_RESULTS)
					nativeStatus = WPGMZA.Geocoder.ZERO_RESULTS;
				
				callback(null, nativeStatus);
			}
		});
	}
	
	WPGMZA.GoogleGeocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		if(!options || !options.latLng)
			throw new Error("No latLng specified");
		
		var latLng = new WPGMZA.LatLng(options.latLng);
		var geocoder = new google.maps.Geocoder();
		
		var options = $.extend(options, {
			location: {
				lat: latLng.lat,
				lng: latLng.lng
			}
		});

		let fullResult = false;
		if(options.fullResult){
			fullResult = true;
			delete options.fullResult;
		}
		
		delete options.latLng;
		
		geocoder.geocode(options, function(results, status) {
			
			if(status !== "OK")
				callback(null, WPGMZA.Geocoder.FAIL);
			
			if(!results || !results.length)
				callback([], WPGMZA.Geocoder.NO_RESULTS);
			
			if(fullResult){
				callback([results[0]], WPGMZA.Geocoder.SUCCESS);
			} else {
				callback([results[0].formatted_address], WPGMZA.Geocoder.SUCCESS);
			}
			
		});
	}
	
});

// js/v8/google-maps/google-html-overlay.js
/**
 * @namespace WPGMZA
 * @module GoogleHTMLOverlay
 * @requires WPGMZA
 */
jQuery(function($) {
	
	// https://developers.google.com/maps/documentation/javascript/customoverlays
	
	if(WPGMZA.settings.engine && WPGMZA.settings.engine != "google-maps")
		return;
	
	if(!window.google || !window.google.maps)
		return;
	
	WPGMZA.GoogleHTMLOverlay = function(map)
	{
		this.element	= $("<div class='wpgmza-google-html-overlay'></div>");
		
		this.visible	= true;
		this.position	= new WPGMZA.LatLng();
		
		this.setMap(map.googleMap);
		this.wpgmzaMap = map;
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleHTMLOverlay.prototype.onAdd = function()
	{
		var panes = this.getPanes();
		panes.overlayMouseTarget.appendChild(this.element[0]);
		
		/*google.maps.event.addDomListener(this.element, "click", function() {
			
		});*/
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.onRemove = function()
	{
		if(this.element && $(this.element).parent().length)
		{
			$(this.element).remove();
			this.element = null;
		}
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.draw = function()
	{
		this.updateElementPosition();
	}
	
	/*WPGMZA.GoogleHTMLOverlay.prototype.setMap = function(map)
	{
		if(!(map instanceof WPGMZA.Map))
			throw new Error("Map must be an instance of WPGMZA.Map");
		
		google.maps.OverlayView.prototype.setMap.call(this, map.googleMap);
		
		this.wpgmzaMap = map;
	}*/
	
	/*WPGMZA.GoogleHTMLOverlay.prototype.getVisible = function()
	{
		return $(this.element).css("display") != "none";
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.setVisible = function(visible)
	{
		$(this.element).css({
			"display": (visible ? "block" : "none")
		});
	}*/
	
	/*WPGMZA.GoogleHTMLOverlay.prototype.getPosition = function()
	{
		return new WPGMZA.LatLng(this.position);
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.setPosition = function(position)
	{
		if(!(position instanceof WPGMZA.LatLng))
			throw new Error("Argument must be an instance of WPGMZA.LatLng");
		
		this.position = position;
		this.updateElementPosition();
	}*/
	
	WPGMZA.GoogleHTMLOverlay.prototype.updateElementPosition = function()
	{
		//var pixels = this.wpgmzaMap.latLngToPixels(this.position);
		
		var projection = this.getProjection();
		
		if(!projection)
			return;
		
		var pixels = projection.fromLatLngToDivPixel(this.position.toGoogleLatLng());
		
		$(this.element).css({
			"left": pixels.x,
			"top": pixels.y
		});
	}
});

// js/v8/google-maps/google-info-window.js
/**
 * @namespace WPGMZA
 * @module GoogleInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleInfoWindow = function(feature)
	{
		Parent.call(this, feature);
		
		this.setFeature(feature);
	}
	
	WPGMZA.GoogleInfoWindow.Z_INDEX		= 99;
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleInfoWindow.prototype.constructor = WPGMZA.GoogleInfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype.setFeature = function(feature)
	{
		this.feature = feature;
		
		if(feature instanceof WPGMZA.Marker)
			this.googleObject = feature.googleMarker;
		else if(feature instanceof WPGMZA.Polygon)
			this.googleObject = feature.googlePolygon;
		else if(feature instanceof WPGMZA.Polyline)
			this.googleObject = feature.googlePolyline;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.createGoogleInfoWindow = function()
	{
		var self = this;
		
		if(this.googleInfoWindow)
			return;
		
		this.googleInfoWindow = new google.maps.InfoWindow();
		
		this.googleInfoWindow.setZIndex(WPGMZA.GoogleInfoWindow.Z_INDEX);
		
		google.maps.event.addListener(this.googleInfoWindow, "domready", function(event) {
			self.trigger("domready");
		});
		
		google.maps.event.addListener(this.googleInfoWindow, "closeclick", function(event) {
			
			if(self.state == WPGMZA.InfoWindow.STATE_CLOSED)
				return;
			
			self.state = WPGMZA.InfoWindow.STATE_CLOSED;
			self.feature.map.trigger("infowindowclose");
			
		});
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.GoogleInfoWindow.prototype.open = function(map, feature) {
		var self = this;
		
		if(!Parent.prototype.open.call(this, map, feature))
			return false;

		
		// Set parent for events to bubble up to
		this.parent = map;
		
		this.createGoogleInfoWindow();
		this.setFeature(feature);

		/* Handle one shot auto pan disabler */
		if(typeof feature._osDisableAutoPan !== 'undefined'){
			if(feature._osDisableAutoPan){
				/* This has been flagged to not be an auto-pan open call */
				this.googleInfoWindow.setOptions({disableAutoPan : true});
				feature._osDisableAutoPan = false;
			} else {
				/* Restore auto pan for manual interactions */
				this.googleInfoWindow.setOptions({disableAutoPan : false});
			}
		}
		
		this.googleInfoWindow.open(
			this.feature.map.googleMap,
			this.googleObject
		);

		var guid = WPGMZA.guid();
		var eaBtn = !WPGMZA.isProVersion() ? this.addEditButton() : '';
		var html = "<div id='" + guid + "'>" + eaBtn + ' ' + this.content + "</div>";

		this.googleInfoWindow.setContent(html);
		
		var intervalID;
		intervalID = setInterval(function(event) {
			
			div = $("#" + guid);
			
			if(div.length)
			{
				clearInterval(intervalID);
				
				div[0].wpgmzaFeature = self.feature;
				div.addClass("wpgmza-infowindow");
				
				self.element = div[0];
				self.trigger("infowindowopen");
			}
			
		}, 50);

		return true;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.close = function()
	{
		if(!this.googleInfoWindow)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.googleInfoWindow.close();
	}
	
	WPGMZA.GoogleInfoWindow.prototype.setContent = function(html)
	{
		Parent.prototype.setContent.call(this, html);

		this.content = html;

		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setContent(html);
	}
	
	WPGMZA.GoogleInfoWindow.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setOptions(options);
	}
	
});

// js/v8/google-maps/google-map.js
/**
 * @namespace WPGMZA
 * @module GoogleMap
 * @requires WPGMZA.Map
 * @pro-requires WPGMZA.ProMap
 */
jQuery(function($) {
	var Parent;
	
	/**
	 * Constructor
	 * @param element to contain the map
	 */
	WPGMZA.GoogleMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element, options);
		
		this.loadGoogleMap();
		
		if(options){
			this.setOptions(options, true);
		} else {
			this.setOptions({}, true);
		}

		google.maps.event.addListener(this.googleMap, "click", function(event) {
			var wpgmzaEvent = new WPGMZA.Event("click");
			wpgmzaEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(wpgmzaEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "rightclick", function(event) {
			var wpgmzaEvent = new WPGMZA.Event("rightclick");
			wpgmzaEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(wpgmzaEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "dragend", function(event) {
			self.dispatchEvent("dragend");
		});
		
		google.maps.event.addListener(this.googleMap, "zoom_changed", function(event) {
			self.dispatchEvent("zoom_changed");
			self.dispatchEvent("zoomchanged");
		});
		
		// Idle event
		google.maps.event.addListener(this.googleMap, "idle", function(event) {
			self.onIdle(event);
		});

		if(this.googleMap.getStreetView()){
			// Bind streetview events
			google.maps.event.addListener(this.googleMap.getStreetView(), "visible_changed", function(){
				var wpgmzaEvent = new WPGMZA.Event("streetview_visible_changed");

				wpgmzaEvent.visible = this.getVisible();

				self.dispatchEvent(wpgmzaEvent);
			});

			google.maps.event.addListener(this.googleMap.getStreetView(), "position_changed", function(){
				var wpgmzaEvent = new WPGMZA.Event("streetview_position_changed");

				const position = this.getPosition();
				if(position){
					wpgmzaEvent.latLng = {
						lat: position.lat(),
						lng: position.lng()
					};
				}	

				wpgmzaEvent.visible = this.getVisible();

				self.dispatchEvent(wpgmzaEvent);
			});

			google.maps.event.addListener(this.googleMap.getStreetView(), "pov_changed", function(){
				var wpgmzaEvent = new WPGMZA.Event("streetview_pov_changed");

				const pov = this.getPov();
				if(pov){
					wpgmzaEvent.pov = {
						heading: pov.heading,
						pitch: pov.pitch
					};
				}	

				wpgmzaEvent.visible = this.getVisible();

				self.dispatchEvent(wpgmzaEvent);
			});
		}
		
		// Dispatch event
		if(!WPGMZA.isProVersion())
		{
			this.trigger("init");
			
			this.dispatchEvent("created");
			WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
			
			// Legacy event
			$(this.element).trigger("wpgooglemaps_loaded");
		}
	}
	
	// If we're running the Pro version, inherit from ProMap, otherwise, inherit from Map
	if(WPGMZA.isProVersion())
	{
		Parent = WPGMZA.ProMap;
		WPGMZA.GoogleMap.prototype = Object.create(WPGMZA.ProMap.prototype);
	}
	else
	{
		Parent = WPGMZA.Map;
		WPGMZA.GoogleMap.prototype = Object.create(WPGMZA.Map.prototype);
	}
	WPGMZA.GoogleMap.prototype.constructor = WPGMZA.GoogleMap;
	
	WPGMZA.GoogleMap.parseThemeData = function(raw)
	{
		var json;
		
		try{
			json = JSON.parse(raw);	// Try to parse strict JSON
		}catch(e) {
			
			try{
				
				json = eval(raw);	// Try to parse JS object
				
			}catch(e) {
				
				var str = raw;
				
				str = str.replace(/\\'/g, '\'');
				str = str.replace(/\\"/g, '"');
				str = str.replace(/\\0/g, '\0');
				str = str.replace(/\\\\/g, '\\');
				
				try{
					
					json = eval(str);
					
				}catch(e) {
					
					console.warn("Couldn't parse theme data");
				
				return [];
					
				}
				
			}
			
		}

		/* As of 2023-04-28 Google Maps themes must contain array with each item being a defined object. This means older theme definitions
		 * will cause initialization issues as they may contain only keyname like ["visibility", "weight"] 
		 * 
		 * We will attempt to catch these and return the default theme instead of breaking the map 
		*/
		if(json instanceof Array){
			try{
				for(let data of json){
					if(!(data instanceof Object)){
						/* This key is not an object, it's safe to assume the theme has been corrupted */
						return [];
					}
				}
			} catch (ex){
				/* Loop failed, for validation, return default */
				return [];
			}
		} else {
			/* Not array, something failed, default */
			return [];
		}
		
		return json;
	}
	
	/**
	 * Creates the Google Maps map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.loadGoogleMap = function()
	{
		var self = this;
		var options = this.settings.toGoogleMapsOptions();
		
		this.googleMap = new google.maps.Map(this.engineElement, options);
		
		google.maps.event.addListener(this.googleMap, "bounds_changed", function() { 
			self.onBoundsChanged();
		});

		if(this.settings.bicycle == 1)
			this.enableBicycleLayer(true);
		if(this.settings.traffic == 1)
			this.enableTrafficLayer(true);
		if(this.settings.transport_layer)
			this.enablePublicTransportLayer(true);

		this.showPointsOfInterest(this.settings.wpgmza_show_point_of_interest);
		
		// Move the loading wheel into the map element (it has to live outside in the HTML file because it'll be overwritten by Google otherwise)
		$(this.engineElement).append($(this.element).find(".wpgmza-loader"));
	}
	
	WPGMZA.GoogleMap.prototype.setOptions = function(options, initializing)
	{
		Parent.prototype.setOptions.call(this, options);
		
		if(options.scrollwheel)
			delete options.scrollwheel;	// NB: Delete this when true, scrollwheel: true breaks gesture handling
		
		if(!initializing)
		{
			this.googleMap.setOptions(options);
			return;
		}
		
		var converted = $.extend(options, this.settings.toGoogleMapsOptions());
		
		var clone = $.extend({}, converted);
		if(!clone.center instanceof google.maps.LatLng && (clone.center instanceof WPGMZA.LatLng || typeof clone.center == "object"))
			clone.center = {
				lat: parseFloat(clone.center.lat),
				lng: parseFloat(clone.center.lng)
			};
		
		if(this.settings.hide_point_of_interest)
		{
			var noPoi = {
				featureType: "poi",
				elementType: "labels",
				stylers: [
					{
						visibility: "off"
					}
				]
			};
			
			if(!clone.styles)
				clone.styles = [];
			
			clone.styles.push(noPoi);
		}
		
		this.googleMap.setOptions(clone);
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addMarker = function(marker)
	{
		marker.googleMarker.setMap(this.googleMap);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	/**
	 * Removes the specified marker from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.removeMarker = function(marker)
	{
		marker.googleMarker.setMap(null);
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addPolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(this.googleMap);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.removePolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(null);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addPolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(this.googleMap);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.removePolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(null);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	WPGMZA.GoogleMap.prototype.addCircle = function(circle)
	{
		circle.googleCircle.setMap(this.googleMap);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	WPGMZA.GoogleMap.prototype.removeCircle = function(circle)
	{
		circle.googleCircle.setMap(null);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	WPGMZA.GoogleMap.prototype.addRectangle = function(rectangle)
	{
		rectangle.googleRectangle.setMap(this.googleMap);
		
		Parent.prototype.addRectangle.call(this, rectangle);
	}
	
	WPGMZA.GoogleMap.prototype.removeRectangle = function(rectangle)
	{
		rectangle.googleRectangle.setMap(null);
		
		Parent.prototype.removeRectangle.call(this, rectangle);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.getCenter = function()
	{
		var latLng = this.googleMap.getCenter();
		
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Delegate for google maps setCenter
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setCenter = function(latLng)
	{
		WPGMZA.Map.prototype.setCenter.call(this, latLng);
		
		if(latLng instanceof WPGMZA.LatLng)
			this.googleMap.setCenter({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
			this.googleMap.setCenter(latLng);
	}
	
	/**
	 * Delegate for google maps setPan
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.panTo = function(latLng)
	{
		if(latLng instanceof WPGMZA.LatLng)
			this.googleMap.panTo({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
			this.googleMap.panTo(latLng);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.getZoom = function()
	{
		return this.googleMap.getZoom();
	}
	
	/**
	 * Delegate for google maps getZoom
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setZoom = function(value)
	{
		if(isNaN(value))
			throw new Error("Value must not be NaN");
		
		return this.googleMap.setZoom(parseInt(value));
	}
	
	/**
	 * Gets the bounds
	 * @return object
	 */
	WPGMZA.GoogleMap.prototype.getBounds = function() {
		
		var nativeBounds = new WPGMZA.LatLngBounds({});

		try{
			var bounds = this.googleMap.getBounds();
			var northEast = bounds.getNorthEast();
			var southWest = bounds.getSouthWest();
			
			
			nativeBounds.north = northEast.lat();
			nativeBounds.south = southWest.lat();
			nativeBounds.west = southWest.lng();
			nativeBounds.east = northEast.lng();
			
			// Backward compatibility
			nativeBounds.topLeft = {
				lat: northEast.lat(),
				lng: southWest.lng()
			};
			
			nativeBounds.bottomRight = {
				lat: southWest.lat(),
				lng: northEast.lng()
			};
		} catch (ex){
			/* Just return a default, instead of throwing an error */
		}
		
		return nativeBounds;
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.fitBounds = function(southWest, northEast)
	{
		if(southWest instanceof WPGMZA.LatLng)
			southWest = {lat: southWest.lat, lng: southWest.lng};
		if(northEast instanceof WPGMZA.LatLng)
			northEast = {lat: northEast.lat, lng: northEast.lng};
		else if(southWest instanceof WPGMZA.LatLngBounds)
		{
			var bounds = southWest;
			
			southWest = {
				lat: bounds.south,
				lng: bounds.west
			};
			
			northEast = {
				lat: bounds.north,
				lng: bounds.east
			};
		}
		
		var nativeBounds = new google.maps.LatLngBounds(southWest, northEast);
		this.googleMap.fitBounds(nativeBounds);
	}
	
	/**
	 * Fit the map boundaries to visible markers
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.fitBoundsToVisibleMarkers = function()
	{
		var bounds = new google.maps.LatLngBounds();
		for(var i = 0; i < this.markers.length; i++)
		{
			if(markers[i].getVisible())
				bounds.extend(markers[i].getPosition());
		}
		this.googleMap.fitBounds(bounds);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.enableBicycleLayer = function(enable)
	{
		if(!this.bicycleLayer)
			this.bicycleLayer = new google.maps.BicyclingLayer();
		
		this.bicycleLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.enableTrafficLayer = function(enable)
	{
		if(!this.trafficLayer)
			this.trafficLayer = new google.maps.TrafficLayer();
		
		this.trafficLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.enablePublicTransportLayer = function(enable)
	{		
		if(!this.publicTransportLayer)
			this.publicTransportLayer = new google.maps.TransitLayer();
				
		this.publicTransportLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Shows / hides points of interest
	 * @param show boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.showPointsOfInterest = function(show)
	{
		// TODO: This will bug the front end because there is no textarea with theme data
		var text = $("textarea[name='theme_data']").val();
		
		if(!text)
			return;
		
		var styles = JSON.parse(text);
		
		styles.push({
			featureType: "poi",
			stylers: [
				{
					visibility: (show ? "on" : "off")
				}
			]
		});
		
		this.googleMap.setOptions({styles: styles});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	WPGMZA.GoogleMap.prototype.getMinZoom = function()
	{
		return parseInt(this.settings.min_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setMinZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: value,
			maxZoom: this.getMaxZoom()
		});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	WPGMZA.GoogleMap.prototype.getMaxZoom = function()
	{
		return parseInt(this.settings.max_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setMaxZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: this.getMinZoom(),
			maxZoom: value
		});
	}
	
	WPGMZA.GoogleMap.prototype.latLngToPixels = function(latLng)
	{
		var map = this.googleMap;
		var nativeLatLng = new google.maps.LatLng({
			lat: parseFloat(latLng.lat),
			lng: parseFloat(latLng.lng)
		});
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = map.getProjection().fromLatLngToPoint(nativeLatLng);
		return {
			x: (worldPoint.x - bottomLeft.x) * scale, 
			y: (worldPoint.y - topRight.y) * scale
		};
	}
	
	WPGMZA.GoogleMap.prototype.pixelsToLatLng = function(x, y)
	{
		if(y == undefined)
		{
			if("x" in x && "y" in x)
			{
				y = x.y;
				x = x.x;
			}
			else
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
		}
		
		var map = this.googleMap;
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = new google.maps.Point(x / scale + bottomLeft.x, y / scale + topRight.y);
		var latLng = map.getProjection().fromPointToLatLng(worldPoint);
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Handle the map element resizing
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.onElementResized = function(event)
	{
		if(!this.googleMap)
			return;
		google.maps.event.trigger(this.googleMap, "resize");
	}

	WPGMZA.GoogleMap.prototype.enableAllInteractions = function()
	{	
		var options = {};

		options.scrollwheel				= true;
		options.draggable				= true;
		options.disableDoubleClickZoom	= false;
		
		this.googleMap.setOptions(options);
	}

	WPGMZA.GoogleMap.prototype.openStreetView = function(options){
		if(this.googleMap.getStreetView()){
			if(options){
				if(options.position && options.position instanceof WPGMZA.LatLng){
					this.googleMap.getStreetView().setPosition(options.position.toGoogleLatLng());
				}

				if(options.heading || options.pitch){
					const pov = {};
					if(options.heading){
						pov.heading = parseFloat(options.heading);
					}

					if(options.pitch){
						pov.pitch = parseFloat(options.pitch);
					}

					this.googleMap.getStreetView().setPov(pov);
				}
			}
			this.googleMap.getStreetView().setVisible(true);
		}
	}
	
	WPGMZA.GoogleMap.prototype.closeStreetView = function(){
		if(this.googleMap.getStreetView()){
			this.googleMap.getStreetView().setVisible(false);
		}
	}

	/**
	 * Override default map isFullScreen method for Google Maps
	 * 
	 * This allows us to check the first child div's height, instead of the container.
	 * 
	 * OpenLayers sets the container to fullscreen, Google sets their nested div instead
	 * 
	 * @returns bool
	 */
	WPGMZA.GoogleMap.prototype.isFullScreen = function(){
		let fullscreen = WPGMZA.Map.prototype.isFullScreen.call(this);

		if(!fullscreen && WPGMZA.isFullScreen()){
			if(parseInt(window.screen.height) === parseInt(this.element.firstChild.offsetHeight)){
				return true;
			}
		}
		return false;
	}

	/**
	 * Override the map on Fullscreen change method, this allows us to move embedded `stacks` into the main map div to allow them to be visible 
	 * as part of the fullscreen display 
	 * 
	 * @param bool fullscreen Is this map fullscreen 
	 * 
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.onFullScreenChange = function(fullscreen){
		Parent.prototype.onFullScreenChange.call(this, fullscreen);
		
		if(fullscreen && !this._stackedComponentsMoved){
			if(this.element.firstChild){
				const innerContainer = this.element.firstChild;
				$(this.element).find('.wpgmza-inner-stack').each(function(index, element){
					$(element).appendTo(innerContainer);
				});
			
				this._stackedComponentsMoved = true;
			}
		}
	}
});

// js/v8/google-maps/google-marker.js
/**
 * @namespace WPGMZA
 * @module GoogleMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleMarker = function(options)
	{
		var self = this;
		
		Parent.call(this, options);
		
		var settings = {};
		if(options)
		{
			for(var name in options)
			{
				if(options[name] instanceof WPGMZA.LatLng)
				{
					settings[name] = options[name].toGoogleLatLng();
				}
				else if(options[name] instanceof WPGMZA.Map || name == "icon")
				{
					// NB: Ignore map here, it's not a google.maps.Map, Google would throw an exception
					// NB: Ignore icon here, it conflicts with updateIcon in Pro
				}
				else
					settings[name] = options[name];
			}
		}
		
		this.googleMarker = new google.maps.Marker(settings);
		this.googleMarker.wpgmzaMarker = this;
		
		this.googleFeature = this.googleMarker;
		
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
		
		if(this.anim)
			this.googleMarker.setAnimation(this.anim);
		if(this.animation)
			this.googleMarker.setAnimation(this.animation);
			
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent("click");
			self.dispatchEvent("select");
		});
		
		google.maps.event.addListener(this.googleMarker, "mouseover", function() {
			self.dispatchEvent("mouseover");
		});

		google.maps.event.addListener(this.googleMarker, "mouseout", function() {
			self.dispatchEvent("mouseout");
		});
		
		google.maps.event.addListener(this.googleMarker, "dragend", function() {
			var googleMarkerPosition = self.googleMarker.getPosition();
			
			self.setPosition({
				lat: googleMarkerPosition.lat(),
				lng: googleMarkerPosition.lng()
			});
			
			self.dispatchEvent({
				type: "dragend",
				latLng: self.getPosition()
			});

			self.trigger("change");
		});
		
		this.setOptions(settings);
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.GoogleMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleMarker.prototype.constructor = WPGMZA.GoogleMarker;
	
	Object.defineProperty(WPGMZA.GoogleMarker.prototype, "opacity", {
		
		"get": function() {
			return this._opacity;
		},
		
		"set": function(value) {
			this._opacity = value;
			this.googleMarker.setOpacity(value);
		}
		
	});
	
	WPGMZA.GoogleMarker.prototype.setLabel = function(label)
	{
		if(!label)
		{
			this.googleMarker.setLabel(null);
			return;
		}
		
		this.googleMarker.setLabel({
			text: label
		});
		
		if(!this.googleMarker.getIcon())
			this.googleMarker.setIcon(WPGMZA.settings.default_marker_icon);
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		this.googleMarker.setPosition({
			lat: this.lat,
			lng: this.lng
		});
	}
	
	/**
	 * Sets the position offset of a marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.updateOffset = function()
	{
		var self = this;
		var icon = this.googleMarker.getIcon();
		var img = new Image();
		var params;
		var x = this._offset.x;
		var y = this._offset.y;
		
		if(!icon){
			if(WPGMZA.settings.default_marker_icon){
				icon = WPGMZA.settings.default_marker_icon;
			} else if (this.map.settings.default_marker_icon){
				icon = this.map.settings.default_marker_icon;
			} else if(this.map.settings.default_marker){
				icon = this.map.settings.default_marker;
			}
		}

		if(typeof icon == "string"){
			params = {
				url: icon
			};
		}else{
			params = icon;
		}

		img.onload = function(){
			var defaultAnchor = {
				x: img.width / 2,
				y: img.height
			};
			
			params.anchor = new google.maps.Point(defaultAnchor.x - x, defaultAnchor.y - y);
			
			self.googleMarker.setIcon(params);
		}
		
		img.src = params.url;
	}
	
	WPGMZA.GoogleMarker.prototype.setOptions = function(options)
	{
		this.googleMarker.setOptions(options);
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setAnimation = function(animation)
	{
		Parent.prototype.setAnimation.call(this, animation);
		this.googleMarker.setAnimation(animation);
	}
	
	/**
	 * Sets the visibility of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);
		
		this.googleMarker.setVisible(visible ? true : false);
	}
	
	WPGMZA.GoogleMarker.prototype.getVisible = function(visible)
	{
		return this.googleMarker.getVisible();
	}
	
	WPGMZA.GoogleMarker.prototype.setDraggable = function(draggable)
	{
		this.googleMarker.setDraggable(draggable);
	}
	
	WPGMZA.GoogleMarker.prototype.setOpacity = function(opacity)
	{
		this.googleMarker.setOpacity(opacity);
	}
	
});

// js/v8/google-maps/google-modern-store-locator-circle.js
/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 */
jQuery(function($) {
	
	WPGMZA.GoogleModernStoreLocatorCircle = function(map, settings)
	{
		var self = this;
		
		WPGMZA.ModernStoreLocatorCircle.call(this, map, settings);
		
		this.intervalID = setInterval(function() {
			
			var mapSize = {
				width: $(self.mapElement).width(),
				height: $(self.mapElement).height()
			};
			
			if(mapSize.width == self.mapSize.width && mapSize.height == self.mapSize.height)
				return;
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
			self.mapSize = mapSize;
			
		}, 1000);
		
		$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
			
			self.canvasLayer.resize_();
			self.canvasLayer.draw();
			
		});
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype = Object.create(WPGMZA.ModernStoreLocatorCircle.prototype);
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.constructor = WPGMZA.GoogleModernStoreLocatorCircle;
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		
		if(this.canvasLayer)
		{
			this.canvasLayer.setMap(null);
			this.canvasLayer.setAnimate(false);
		}
		
		this.canvasLayer = new CanvasLayer({
			map: this.map.googleMap,
			resizeHandler: function(event) {
				self.onResize(event);
			},
			updateHandler: function(event) {
				self.onUpdate(event);
			},
			animate: true,
			resolutionScale: this.getResolutionScale()
        });
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setOptions = function(options)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setOptions.call(this, options);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setPosition = function(position)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setPosition.call(this, position);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setRadius.call(this, radius);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var multiplierAtEquator = 0.006395;
		var spherical = google.maps.geometry.spherical;
		
		var center = this.settings.center;
		var equator = new WPGMZA.LatLng({
			lat: 0.0,
			lng: 0.0
		});
		var latitude = new WPGMZA.LatLng({
			lat: center.lat,
			lng: 0.0
		});
		
		var offsetAtEquator = spherical.computeOffset(equator.toGoogleLatLng(), km * 1000, 90);
		var offsetAtLatitude = spherical.computeOffset(latitude.toGoogleLatLng(), km * 1000, 90);
		
		var factor = offsetAtLatitude.lng() / offsetAtEquator.lng();
		var result = km * multiplierAtEquator * factor;
		
		if(isNaN(result))
			throw new Error("here");
		
		return result;
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvasLayer.canvas.width,
			height: this.canvasLayer.canvas.height
		};
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		var projection = this.map.googleMap.getProjection();
		var position = projection.fromLatLngToPoint(this.canvasLayer.getTopLeft());
		
		return {
			x: -position.x,
			y: -position.y
		};
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = new WPGMZA.LatLng(this.settings.center);
		var projection = this.map.googleMap.getProjection();
		return projection.fromLatLngToPoint(center.toGoogleLatLng());
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvasLayer.canvas.getContext("2d");
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.getScale = function()
	{
		return Math.pow(2, this.map.getZoom()) * this.getResolutionScale();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.setVisible = function(visible)
	{
		WPGMZA.ModernStoreLocatorCircle.prototype.setVisible.call(this, visible);
		
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.GoogleModernStoreLocatorCircle.prototype.destroy = function()
	{
		this.canvasLayer.setMap(null);
		this.canvasLayer = null;
		
		clearInterval(this.intervalID);
	}
	
});

// js/v8/google-maps/google-modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 */
jQuery(function($) {
	
	WPGMZA.GoogleModernStoreLocator = function(map_id) {
		var googleMap, self = this;
		
		var map = this.map = WPGMZA.getMapByID(map_id);
		
		WPGMZA.ModernStoreLocator.call(this, map_id);

		var options = {
			fields: ["name", "formatted_address"],
			types: ["geocode"]
		};
		var restrict = map.settings["wpgmza_store_locator_restrict"];
		
		this.addressInput = $(this.element).find(".addressInput, #addressInput")[0];
		
		if(this.addressInput)
		{
			if(restrict && restrict.length)
				options.componentRestrictions = {
					country: restrict
				};
			
			/*this.autoComplete = new google.maps.places.Autocomplete(
				this.addressInput,
				options
			);*/
		}
		
		// Positioning for Google
		this.map.googleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(this.element);
	}
	
	WPGMZA.GoogleModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator.prototype);
	WPGMZA.GoogleModernStoreLocator.prototype.constructor = WPGMZA.GoogleModernStoreLocator;
	
});

// js/v8/google-maps/google-pointlabel.js
/**
 * @namespace WPGMZA
 * @module GooglePointlabel
 * @requires WPGMZA.Text
 * @requires WPGMZA.Pointlabel
 * @pro-requires WPGMZA.ProPointlabel
 */
jQuery(function($) {
	var Parent;

	WPGMZA.GooglePointlabel = function(options, pointFeature){
		Parent.call(this, options, pointFeature);

		if(pointFeature && pointFeature.textFeature){
			this.textFeature = pointFeature.textFeature;
		} else {
			this.textFeature = new WPGMZA.Text.createInstance({
				text: "",
				map: this.map,
				position: this.getPosition()
			});
		}

		this.googleFeature = this;

		this.setOptions(options);
	}

	if(WPGMZA.isProVersion()){
	 	Parent = WPGMZA.ProPointlabel;
	} else {
		Parent = WPGMZA.Pointlabel
	}

	WPGMZA.extend(WPGMZA.GooglePointlabel, Parent);

	WPGMZA.GooglePointlabel.prototype.setOptions = function(options){
		/* We don't actually handle this here */
		if(options.name){
			this.textFeature.setText(options.name);
		}
	}

});
		

// js/v8/google-maps/google-polygon.js
/**
 * @namespace WPGMZA
 * @module GooglePolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GooglePolygon = function(options, googlePolygon)
	{
		var self = this;
		
		if(!options)
			options = {};
		
		Parent.call(this, options, googlePolygon);
		
		if(googlePolygon)
		{
			this.googlePolygon = googlePolygon;
		}
		else
		{
			this.googlePolygon = new google.maps.Polygon();
		}
		
		this.googleFeature = this.googlePolygon;
		
		if(options && options.polydata)
			this.googlePolygon.setOptions({
				paths: this.parseGeometry(options.polydata)
			});
		
		this.googlePolygon.wpgmzaPolygon = this;

		if(options)
			this.setOptions(options);
		
		google.maps.event.addListener(this.googlePolygon, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
		
	WPGMZA.GooglePolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.GooglePolygon.prototype.constructor = WPGMZA.GooglePolygon;
	
	WPGMZA.GooglePolygon.prototype.updateNativeFeature = function()
	{
		this.googlePolygon.setOptions(this.getScalarProperties());
	}
	
	/**
	 * Returns true if the polygon is editable
	 * @return void
	 */
	WPGMZA.GooglePolygon.prototype.getEditable = function()
	{
		return this.googlePolygon.getOptions().editable;
	}
	
	/**
	 * Sets the editable state of the polygon
	 * @return void
	 */
	WPGMZA.GooglePolygon.prototype.setEditable = function(value)
	{
		var self = this;
		
		this.googlePolygon.setOptions({editable: value});
		
		if(value)
		{
			// TODO: Unbind these when value is false
			this.googlePolygon.getPaths().forEach(function(path, index) {
				
				var events = [
					"insert_at",
					"remove_at",
					"set_at"
				];
				
				events.forEach(function(name) {
					google.maps.event.addListener(path, name, function() {
						self.trigger("change");
					})
				});
				
			});
			
			// TODO: Add dragging and listen for dragend
			google.maps.event.addListener(this.googlePolygon, "dragend", function(event) {
				self.trigger("change");
			});
			
			google.maps.event.addListener(this.googlePolygon, "click", function(event) {
				
				if(!WPGMZA.altKeyDown)
					return;
				
				var path = this.getPath();
				path.removeAt(event.vertex);
				self.trigger("change");
				
			});
		}
	}
	
	WPGMZA.GooglePolygon.prototype.setDraggable = function(value)
	{
		this.googlePolygon.setDraggable(value);
	}
	
	/**
	 * Returns the polygon represented by a JSON object
	 * @return object
	 */
	WPGMZA.GooglePolygon.prototype.getGeometry = function()
	{
		var result = [];
		
		// TODO: Support holes using multiple paths
		var path = this.googlePolygon.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});

// js/v8/google-maps/google-polyline.js
/**
 * @namespace WPGMZA
 * @module GooglePolyline
 * @requires WPGMZA.Polyline
 */
jQuery(function($) {
	
	WPGMZA.GooglePolyline = function(options, googlePolyline) {

		var self = this;
		
		WPGMZA.Polyline.call(this, options, googlePolyline);
		
		if(googlePolyline) {
			this.googlePolyline = googlePolyline;
		} else {
			this.googlePolyline = new google.maps.Polyline(this.settings);			
		}
		

		this.googleFeature = this.googlePolyline;
		
		if(options && options.polydata)
		{

			var path = this.parseGeometry(options.polydata);
			this.googlePolyline.setPath(path);
		}		
		
		this.googlePolyline.wpgmzaPolyline = this;
		
		if(options)
			this.setOptions(options);
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.GooglePolyline.prototype = Object.create(WPGMZA.Polyline.prototype);
	WPGMZA.GooglePolyline.prototype.constructor = WPGMZA.GooglePolyline;
	
	WPGMZA.GooglePolyline.prototype.updateNativeFeature = function() {
		this.googlePolyline.setOptions(this.getScalarProperties());
	}
	
	WPGMZA.GooglePolyline.prototype.setEditable = function(value) {
		var self = this;
		
		this.googlePolyline.setOptions({editable: value});
		
		
		
		if (value) {
			// TODO: Unbind these when value is false
			var path = this.googlePolyline.getPath();
			var events = [
				"insert_at",
				"remove_at",
				"set_at"
			];
			
			events.forEach(function(name) {
				google.maps.event.addListener(path, name, function() {
					self.trigger("change");
				})
			});
			
			// TODO: Add dragging and listen for dragend
			google.maps.event.addListener(this.googlePolyline, "dragend", function(event) {
				self.trigger("change");
			});
			
			google.maps.event.addListener(this.googlePolyline, "click", function(event) {
				if(!WPGMZA.altKeyDown)
					return;
				
				var path = this.getPath();
				path.removeAt(event.vertex);
				self.trigger("change");
				
			});
		}
	}
	
	WPGMZA.GooglePolyline.prototype.setDraggable = function(value) {
		this.googlePolyline.setOptions({draggable: value});
	}
	
	WPGMZA.GooglePolyline.prototype.getGeometry = function() {

		var result = [];
		
		var path = this.googlePolyline.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});

// js/v8/google-maps/google-rectangle.js
/**
 * @namespace WPGMZA
 * @module GoogleRectangle
 * @requires WPGMZA.Rectangle
 * @pro-requires WPGMZA.ProRectangle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Rectangle;

	/**
	 * Subclass, used when Google is the maps engine. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.GoogleRectangle
	 * @constructor WPGMZA.GoogleRectangle
	 * @memberof WPGMZA
	 * @augments WPGMZA.Rectangle
	 * @see WPGMZA.Rectangle.createInstance
	 */
	WPGMZA.GoogleRectangle = function(options, googleRectangle)
	{
		var self = this;
		
		if(!options)
			options = {};
		
		Parent.call(this, options, googleRectangle);
		
		if(googleRectangle)
		{
			this.googleRectangle = googleRectangle;
			
			this.cornerA = options.cornerA = new WPGMZA.LatLng({
				lat:	googleRectangle.getBounds().getNorthEast().lat(),
				lng:	googleRectangle.getBounds().getSouthWest().lng(),
			});
			
			this.cornerB = options.cornerB = new WPGMZA.LatLng({
				lat:	googleRectangle.getBounds().getSouthWest().lat(),
				lng:	googleRectangle.getBounds().getNorthEast().lng()
			});
		}
		else
		{
			this.googleRectangle = new google.maps.Rectangle();
			this.googleRectangle.wpgmzaRectangle = this;
		}
		
		this.googleFeature = this.googleRectangle;
		
		if(options)
			this.setOptions(options);
		
		google.maps.event.addListener(this.googleRectangle, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProRectangle;
	
	WPGMZA.GoogleRectangle.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleRectangle.prototype.constructor = WPGMZA.GoogleRectangle;
	
	WPGMZA.GoogleRectangle.prototype.getBounds = function()
	{
		return WPGMZA.LatLngBounds.fromGoogleLatLngBounds( this.googleRectangle.getBounds() );
	}
	
	WPGMZA.GoogleRectangle.prototype.setVisible = function(visible)
	{
		this.googleRectangle.setVisible(visible ? true : false);
	}
	
	WPGMZA.GoogleRectangle.prototype.setDraggable = function(value)
	{
		this.googleRectangle.setDraggable(value ? true : false);
	}
	
	WPGMZA.GoogleRectangle.prototype.setEditable = function(value)
	{
		var self = this;
		
		this.googleRectangle.setEditable(value ? true : false);
		
		if(value)
		{
			google.maps.event.addListener(this.googleRectangle, "bounds_changed", function(event) {
				self.trigger("change");
			});
		}
	}
	
	WPGMZA.GoogleRectangle.prototype.setOptions = function(options)
	{
		WPGMZA.Rectangle.prototype.setOptions.apply(this, arguments);
		
		if(options.cornerA && options.cornerB)
		{
			this.cornerA = new WPGMZA.LatLng(options.cornerA);
			this.cornerB = new WPGMZA.LatLng(options.cornerB);
		}
	}
	
	WPGMZA.GoogleRectangle.prototype.updateNativeFeature = function()
	{
		var googleOptions = this.getScalarProperties();
	
		var north	= parseFloat(this.cornerA.lat);
		var west	= parseFloat(this.cornerA.lng);
		var south	= parseFloat(this.cornerB.lat);
		var east	= parseFloat(this.cornerB.lng);
		
		if(north && west && south && east){
			googleOptions.bounds = {
				north: north,
				west: west,
				south: south,
				east: east
			};

		}
		
		this.googleRectangle.setOptions(googleOptions);
	}
	
});

// js/v8/google-maps/google-text.js
/**
 * @namespace WPGMZA
 * @module GoogleText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.GoogleText = function(options)
	{
		WPGMZA.Text.apply(this, arguments);
		
		this.overlay = new WPGMZA.GoogleTextOverlay(options);
	}
	
	WPGMZA.extend(WPGMZA.GoogleText, WPGMZA.Text);
	
});

// js/v8/google-maps/google-text-overlay.js
/**
 * @namespace WPGMZA
 * @module GoogleTextOverlay
 * @requires WPGMZA.GoogleText
 */
jQuery(function($) {
	
	WPGMZA.GoogleTextOverlay = function(options)
	{
		this.element = $("<div class='wpgmza-google-text-overlay'><div class='wpgmza-inner'></div></div>");
		
		if(!options)
			options = {};
		
		if(options.position)
			this.position = options.position;
		
		if(options.text)
			this.element.find(".wpgmza-inner").text(options.text);
		
		if(options.map)
			this.setMap(options.map.googleMap);
	}
	
	if(window.google && google.maps && google.maps.OverlayView)
		WPGMZA.GoogleTextOverlay.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleTextOverlay.prototype.onAdd = function()
	{
		var overlayProjection = this.getProjection();
		var position = overlayProjection.fromLatLngToDivPixel(this.position.toGoogleLatLng());
		
		this.element.css({
			position: "absolute",
			left: position.x + "px",
			top: position.y + "px",
			minWidth : "200px"
		});

		var panes = this.getPanes();
		panes.floatPane.appendChild(this.element[0]);
	}
	
	WPGMZA.GoogleTextOverlay.prototype.draw = function()
	{
		var overlayProjection = this.getProjection();
		var position = overlayProjection.fromLatLngToDivPixel(this.position.toGoogleLatLng());
		
		this.element.css({
			position: "absolute",
			left: position.x + "px",
			top: position.y + "px",
			minWidth : "200px"
		});
	}
	
	WPGMZA.GoogleTextOverlay.prototype.onRemove = function()
	{
		this.element.remove();
	}
	
	WPGMZA.GoogleTextOverlay.prototype.hide = function()
	{
		this.element.hide();
	}
	
	WPGMZA.GoogleTextOverlay.prototype.show = function()
	{
		this.element.show();
	}
	
	WPGMZA.GoogleTextOverlay.prototype.toggle = function()
	{
		if(this.element.is(":visible"))
			this.element.hide();
		else
			this.element.show();
	}

	WPGMZA.GoogleTextOverlay.prototype.setPosition = function(position){
		this.position = position;
	}

	WPGMZA.GoogleTextOverlay.prototype.setText = function(text){
		this.element.find(".wpgmza-inner").text(text);
	}

	WPGMZA.GoogleTextOverlay.prototype.setFontSize = function(size){
		size = parseInt(size);
		this.element.find(".wpgmza-inner").css('font-size', size + 'px');
	}

	WPGMZA.GoogleTextOverlay.prototype.setFillColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;

		this.element.find(".wpgmza-inner").css('color', color);
	}

	WPGMZA.GoogleTextOverlay.prototype.setLineColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;

		this.element.find(".wpgmza-inner").css('--wpgmza-color-white', color);
	}

	WPGMZA.GoogleTextOverlay.prototype.setOpacity = function(opacity){
		opacity = parseFloat(opacity);

		if(opacity > 1){
			opacity = 1;
		} else if (opacity < 0){
			opacity = 0;
		}

		this.element.find(".wpgmza-inner").css('opacity', opacity);
	}

	WPGMZA.GoogleTextOverlay.prototype.remove = function(){
		if(this.element){
			this.element.remove();
		}
	}
	
});

// js/v8/google-maps/google-vertex-context-menu.js
/**
 * @namespace WPGMZA
 * @module GoogleVertexContextMenu
 * @requires wpgmza_api_call
 */
jQuery(function($) {
	
	if(WPGMZA.settings.engine != "google-maps")
		return;
	
	if(WPGMZA.googleAPIStatus && WPGMZA.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN")
		return;

	if(typeof google === 'undefined' || typeof google.maps === 'undefined'){
		return;
	}
	
	WPGMZA.GoogleVertexContextMenu = function(mapEditPage)
	{
		var self = this;
		
		this.mapEditPage = mapEditPage;
		
		this.element = document.createElement("div");
		this.element.className = "wpgmza-vertex-context-menu";
		this.element.innerHTML = "Delete";
		
		google.maps.event.addDomListener(this.element, "click", function(event) {
			self.removeVertex();
			event.preventDefault();
			event.stopPropagation();
			return false;
		});
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleVertexContextMenu.prototype.onAdd = function()
	{
		var self = this;
		var map = this.getMap();
		
		this.getPanes().floatPane.appendChild(this.element);
		this.divListener = google.maps.event.addDomListener(map.getDiv(), "mousedown", function(e) {
			if(e.target != self.element)
				self.close();
		}, true);
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.onRemove = function()
	{
		google.maps.event.removeListener(this.divListener);
		this.element.parentNode.removeChild(this.element);
		
		this.set("position");
		this.set("path");
		this.set("vertex");
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.open = function(map, path, vertex)
	{
		this.set('position', path.getAt(vertex));
		this.set('path', path);
		this.set('vertex', vertex);
		this.setMap(map);
		this.draw();
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.close = function()
	{
		this.setMap(null);
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.draw = function()
	{
		var position = this.get('position');
		var projection = this.getProjection();

		if (!position || !projection)
		  return;

		var point = projection.fromLatLngToDivPixel(position);
		this.element.style.top = point.y + 'px';
		this.element.style.left = point.x + 'px';
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.removeVertex = function()
	{
		var path = this.get('path');
		var vertex = this.get('vertex');

		if (!path || vertex == undefined) {
		  this.close();
		  return;
		}

		path.removeAt(vertex);
		this.close();
	}
	
});

// js/v8/map-edit-page/feature-panel.js
/**
 * @namespace WPGMZA
 * @module FeaturePanel
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.FeaturePanel = function(element, mapEditPage)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.apply(this, arguments);
		
		this.map = mapEditPage.map;
		this.drawingManager = mapEditPage.drawingManager;
		this.writersblock = false;
		
		this.feature = null;
		
		this.element = element;

		this.initDefaults();
		this.setMode(WPGMZA.FeaturePanel.MODE_ADD);
		
		this.drawingInstructionsElement = $(this.element).find(".wpgmza-feature-drawing-instructions");
		this.drawingInstructionsElement.detach();
		
		this.editingInstructionsElement = $(this.element).find(".wpgmza-feature-editing-instructions");
		this.editingInstructionsElement.detach();
		
		
		$("#wpgmaps_tabs_markers").on("tabsactivate", function(event, ui) {
			if($.contains(ui.newPanel[0], self.element[0]))
				self.onTabActivated(event);
		});
		
		$("#wpgmaps_tabs_markers").on("tabsactivate", function(event, ui) {
			if($.contains(ui.oldPanel[0], self.element[0]))
				self.onTabDeactivated(event);
		});

		$('.grouping').on('feature-block-opened', function(event){
			var feature = $(event.currentTarget).data('feature');
			if(feature === self.featureType){
				self.onTabActivated(event);
			} else {
				self.onTabDeactivated(event);
			}
		});

		$('.grouping').on('feature-block-closed', function(event){
			self.onTabDeactivated(event);
			mapEditPage.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		});

		// NB: Removed to get styling closer
		/*$(element).closest(".wpgmza-accordion").find("h3[data-add-caption]").on("click", function(event) {
			if(self.mode == "add")
				self.onAddFeature(event);
		});*/

		$(document.body).on("click", "[data-edit-" + this.featureType + "-id]", function(event) {
			self.onEditFeature(event);
		});
		
		$(document.body).on("click", "[data-delete-" + this.featureType + "-id]", function(event) {
			self.onDeleteFeature(event);
		});
		
		$(this.element).find(".wpgmza-save-feature").on("click", function(event) {
			self.onSave(event);
		});
		
		this.drawingManager.on(self.drawingManagerCompleteEvent, function(event) {
			self.onDrawingComplete(event);
		});
		
		this.drawingManager.on("drawingmodechanged", function(event) {
			self.onDrawingModeChanged(event);
		});
		
		$(this.element).on("change input", function(event) {
			self.onPropertyChanged(event);
		});
	}

	
	
	WPGMZA.extend(WPGMZA.FeaturePanel, WPGMZA.EventDispatcher);
	
	WPGMZA.FeaturePanel.MODE_ADD			= "add";
	WPGMZA.FeaturePanel.MODE_EDIT			= "edit";
	
	WPGMZA.FeaturePanel.prevEditableFeature = null;
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "featureType", {
		
		"get": function() {
			return $(this.element).attr("data-wpgmza-feature-type");
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "drawingManagerCompleteEvent", {
		
		"get": function() {
			return this.featureType + "complete";
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "featureDataTable", {
		
		"get": function() {
			return $("[data-wpgmza-datatable][data-wpgmza-feature-type='" + this.featureType + "']")[0].wpgmzaDataTable;
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "featureAccordion", {
		
		"get": function() {
			return $(this.element).closest(".wpgmza-accordion");
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "map", {
		
		"get": function() {
			return WPGMZA.mapEditPage.map;
		}
		
	});
	
	Object.defineProperty(WPGMZA.FeaturePanel.prototype, "mode", {
		
		"get": function() {
			return this._mode;
		}
		
	});
	
	WPGMZA.FeaturePanel.prototype.initPreloader = function()
	{
		if(this.preloader)
			return;
		
		this.preloader = $(WPGMZA.preloaderHTML);
		this.preloader.hide();
		
		$(this.element).append(this.preloader);
	}
	
	WPGMZA.FeaturePanel.prototype.initDataTable = function()
	{
		var el = $(this.element).find("[data-wpgmza-datatable][data-wpgmza-rest-api-route]");
		
		this[this.featureType + "AdminDataTable"] = new WPGMZA.AdminFeatureDataTable( el );
	}
	
	WPGMZA.FeaturePanel.prototype.initDefaults = function()
	{
		$(this.element).find("[data-ajax-name]:not([type='radio'])").each(function(index, el) {
			
			var val = $(el).val();
			
			if(!val)
				return;
			
			$(el).attr("data-default-value", val);
			
		});
	}
	
	WPGMZA.FeaturePanel.prototype.setCaptionType = function(type, id)
	{
		var args = arguments;
		var icons = {
			add: "fa-plus-circle",
			save: "fa-pencil-square-o"
		};
		
		switch(type)
		{
			case WPGMZA.FeaturePanel.MODE_ADD:
			case WPGMZA.FeaturePanel.MODE_EDIT:
			
				this.featureAccordion.find("[data-add-caption][data-edit-caption]").each(function(index, el) {
					
					var text = $(el).attr("data-" + type + "-caption");
					var icon = $(el).find("i.fa");
					
					if(id)
						text += " " + id;
				
					$(el).text(text);
					
					if(icon.length)
					{
						// Need to recreate the icon as text() will have wiped it out
						icon = $("<i class='fa' aria-hidden='true'></i>");
						
						icon.addClass(icons[type]);
						
						$(el).prepend(" ");
						$(el).prepend(icon);
					}
				
				});

				this.sidebarTriggerDelegate('feature-caption-loaded');
				
				break;
				
			default:
				throw new Error("Invalid type");
				break;
		}
	}
	
	WPGMZA.FeaturePanel.prototype.setMode = function(type, id)
	{
		this._mode = type;
		this.setCaptionType(type, id);
	}
	
	WPGMZA.FeaturePanel.prototype.setTargetFeature = function(feature)
	{
		var self = this;

		// TODO: Implement fitBounds for all features
		//var bounds = feature.getBounds();
		//map.fitBounds(bounds);
		

		if(WPGMZA.FeaturePanel.prevEditableFeature) {
			var prev = WPGMZA.FeaturePanel.prevEditableFeature;
			
			prev.setEditable(false);
			prev.setDraggable(false);

			prev.off("change");
		}
		if(feature) {
			feature.setEditable(true);
			feature.setDraggable(true);

			feature.on("change", function(event) {
				self.onFeatureChanged(event);
			});
			this.setMode(WPGMZA.FeaturePanel.MODE_EDIT);
			this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
			
			this.showInstructions();
		} else {
			this.setMode(WPGMZA.FeaturePanel.MODE_ADD);
		}
		this.feature = WPGMZA.FeaturePanel.prevEditableFeature = feature;
	}
	
	WPGMZA.FeaturePanel.prototype.reset = function()
	{
		$(this.element).find("[data-ajax-name]:not([data-ajax-name='map_id']):not([type='color']):not([type='checkbox']):not([type='radio'])").val("");
		$(this.element).find("select[data-ajax-name]>option:first-child").prop("selected", true);
		$(this.element).find("[data-ajax-name='id']").val("-1");
		
		$(this.element).find("input[type='checkbox']").prop("checked", false);
		
		if(!WPGMZA.InternalEngine.isLegacy()){
			if(typeof WritersBlock !== 'undefined' && this.writersblock != false && this.writersblock.ready){
				this.writersblock.setContent("");

				if(this.writersblock.elements && this.writersblock.elements._codeEditor){
					/* We have an HTML code block */
					this.writersblock.elements._codeEditor.value = "";
				}
			} else {
				$("#wpgmza-description-editor").val("");
			}


			$(this.element).find('input.wpgmza-color-input').each(function(){
				if(this.wpgmzaColorInput){
					this.wpgmzaColorInput.parseColor($(this).data('default-value') || this.value);
				}
			});
		} else {
			if(tinyMCE.get("wpgmza-description-editor")) {
				tinyMCE.get("wpgmza-description-editor").setContent("");
			} else {
				$("#wpgmza-description-editor").val("");
			}
		}


		$('#wpgmza-description-editor').val("");

		$(this.element).find('.wpgmza-image-single-input').trigger('change');
		
		this.showPreloader(false);
		this.setMode(WPGMZA.FeaturePanel.MODE_ADD);
		
		$(this.element).find("[data-ajax-name][data-default-value]").each(function(index, el) {
			
			$(el).val( $(el).data("default-value") );
			
		});
	}
	
	WPGMZA.FeaturePanel.prototype.select = function(arg) {
		var id, expectedBaseClass, self = this;
		
		this.reset();
		
		if(WPGMZA.isNumeric(arg))
			id = arg;
		else
		{
			expectedBaseClass = WPGMZA[ WPGMZA.capitalizeWords(this.featureType) ];
			
			if(!(feature instanceof expectedBaseClass))
				throw new Error("Invalid feature type for this panel");
			
			id = arg.id;
		}
		
		this.showPreloader(true);
		this.sidebarTriggerDelegate('edit');

		if(WPGMZA.InternalEngine.isLegacy()){
			/* Only applies in legacy */
			WPGMZA.animateScroll($(".wpgmza_map"));
		}
		
		WPGMZA.restAPI.call("/" + this.featureType + "s/" + id + "?skip_cache=1&context=editor", {
			
			success: function(data, status, xhr) {
				
				var functionSuffix 		= WPGMZA.capitalizeWords(self.featureType);
				var getByIDFunction		= "get" + functionSuffix + "ByID";
				var feature				= self.map[getByIDFunction](id);
				
				self.populate(data);
				self.showPreloader(false);
				self.setMode(WPGMZA.FeaturePanel.MODE_EDIT, id);
				
				self.setTargetFeature(feature);
				
			}
			
		});
	}
	
	WPGMZA.FeaturePanel.prototype.showPreloader = function(show)
	{
		this.initPreloader();
		
		if(arguments.length == 0 || show)
		{
			this.preloader.fadeIn();
			this.element.addClass("wpgmza-loading");
		}
		else
		{
			this.preloader.fadeOut();
			this.element.removeClass("wpgmza-loading");
		}
	}
	
	WPGMZA.FeaturePanel.prototype.populate = function(data)
	{
		var value, target, name;
		
		for(name in data)
		{
			target = $(this.element).find("[data-ajax-name='" + name + "']");
			value = data[name];
			
			switch((target.attr("type") || "").toLowerCase())
			{
				case "checkbox":
				case "radio":
				
					target.prop("checked", data[name] == 1);
				
					break;
				
				case "color":
				
					// NB: Account for legacy color format
					if(!value.match(/^#/))
						value = "#" + value;
					
				default:
				
					if(typeof value == "object")
						value = JSON.stringify(value);

					if(typeof value == 'string'){
						/* Convert &amp; back to & for editing, but stores safely */
						value = value.replace(/&amp;/g, '&');
					}
				
					$(this.element).find("[data-ajax-name='" + name + "']:not(select)").val(value);

					if($(this.element).find("[data-ajax-name='" + name + "']:not(select)").hasClass('wpgmza-color-input')){
						/* Need to update the preview here, for UI reasons, perhaps a change listener would be better but for now this will do fine */
						let colorInput = $(this.element).find("[data-ajax-name='" + name + "']:not(select)").get(0);
						if(colorInput.wpgmzaColorInput){
							colorInput.wpgmzaColorInput.parseColor(colorInput.value);
						}
					}

					if($(this.element).find("[data-ajax-name='" + name + "']:not(select)").hasClass('wpgmza-image-single-input')){
						/* Need to update the preview here, for UI reasons, perhaps a change listener would be better but for now this will do fine */
						let imageInputSingle = $(this.element).find("[data-ajax-name='" + name + "']:not(select)").get(0);
						if(imageInputSingle.wpgmzaImageInputSingle){
							imageInputSingle.wpgmzaImageInputSingle.parseImage(imageInputSingle.value);
						}
					}
					
					$(this.element).find("select[data-ajax-name='" + name + "']").each(function(index, el) {
						
						if(typeof value == "string" && data[name].length == 0)
							return;
						
						$(el).val(value);
						
					});
				
					break;
			}
		}
	}
	
	WPGMZA.FeaturePanel.prototype.serializeFormData = function()
	{
		var fields = $(this.element).find("[data-ajax-name]");
		var data = {};
		
		fields.each(function(index, el) {
			
			var type = "text";
			if($(el).attr("type"))
				type = $(el).attr("type").toLowerCase();
			
			switch(type)
			{
				case "checkbox":
					data[$(el).attr("data-ajax-name")] = $(el).prop("checked") ? 1 : 0;
					break;
				
				case "radio":
					if($(el).prop("checked"))
						data[$(el).attr("data-ajax-name")] = $(el).val();
					break;
					
				default:
					data[$(el).attr("data-ajax-name")] = $(el).val()
					break;
			}
			
		});
		
		return data;
	}
	
	WPGMZA.FeaturePanel.prototype.discardChanges = function() {
		if(!this.feature)
			return;
			
		var feature = this.feature;
		
		this.setTargetFeature(null);
		
		if(feature && feature.map)
		{
			this.map["remove" + WPGMZA.capitalizeWords(this.featureType)](feature);
			
			if(feature.id > -1)
				this.updateFeatureByID(feature.id);
		}
	}
	
	WPGMZA.FeaturePanel.prototype.updateFeatureByID = function(id)
	{
		var self = this;
		var feature;
		
		var route				= "/" + this.featureType + "s/";
		var functionSuffix 		= WPGMZA.capitalizeWords(self.featureType);
		var getByIDFunction		= "get" + functionSuffix + "ByID";
		var removeFunction		= "remove" + functionSuffix;
		var addFunction			= "add" + functionSuffix;
		
		WPGMZA.restAPI.call(route + id, {
			success: function(data, status, xhr) {
				
				if(feature = self.map[getByIDFunction](id))
					self.map[removeFunction](feature);
				
				feature	= WPGMZA[WPGMZA.capitalizeWords(self.featureType)].createInstance(data);
				self.map[addFunction](feature);
				
			}
		});
	}
	
	WPGMZA.FeaturePanel.prototype.showInstructions = function()
	{
		switch(this.mode)
		{
			case WPGMZA.FeaturePanel.MODE_ADD:
				if(WPGMZA.InternalEngine.isLegacy()){
					$(this.map.element).append(this.drawingInstructionsElement);
					$(this.drawingInstructionsElement).hide().fadeIn();
				} else {
					$(this.element).prepend(this.drawingInstructionsElement);
				}
				break;
			
			default:
				if(WPGMZA.InternalEngine.isLegacy()){
					$(this.map.element).append(this.editingInstructionsElement);
					$(this.editingInstructionsElement).hide().fadeIn();
				} else {
					$(this.element).prepend(this.editingInstructionsElement);
				}
				break;
		}
	}
	
	WPGMZA.FeaturePanel.prototype.onTabActivated = function() {
		this.reset();
		this.drawingManager.setDrawingMode(this.featureType);
		this.onAddFeature(event);

		if(WPGMZA.InternalEngine.isLegacy()){
			/* Only applies in legacy */
			$(".wpgmza-table-container-title").hide();
			$(".wpgmza-table-container").hide();

			var featureString = this.featureType.charAt(0).toUpperCase() + this.featureType.slice(1);
			
			$("#wpgmza-table-container-"+featureString).show();
			$("#wpgmza-table-container-title-"+featureString).show();
		}

	}
	
	WPGMZA.FeaturePanel.prototype.onTabDeactivated = function()
	{
		this.discardChanges();
		this.setTargetFeature(null);
	}
	
	WPGMZA.FeaturePanel.prototype.onAddFeature = function(event)
	{
		this.drawingManager.setDrawingMode(this.featureType);
		
		//if(this.featureType != "marker")
		//	WPGMZA.animateScroll(WPGMZA.mapEditPage.map.element);
	}
	
	WPGMZA.FeaturePanel.prototype.onEditFeature = function(event)
	{
		var self		= this;
		var name		= "data-edit-" + this.featureType + "-id";
		var id			= $(event.currentTarget).attr(name);

		this.discardChanges();
		
		this.select(id);
	}
	
	WPGMZA.FeaturePanel.prototype.onDeleteFeature = function(event)
	{
		var self		= this;
		var name		= "data-delete-" + this.featureType + "-id";
		var id			= $(event.currentTarget).attr(name);
		var route		= "/" + this.featureType + "s/";
		var feature		= this.map["get" + WPGMZA.capitalizeWords(this.featureType) + "ByID"](id);

		var result = confirm(WPGMZA.localized_strings.general_delete_prompt_text);
		if (result) {	
			this.featureDataTable.dataTable.processing(true);
			WPGMZA.restAPI.call(route + id, {
				method: "DELETE",
				success: function(data, status, xhr) {
					
					self.map["remove" + WPGMZA.capitalizeWords(self.featureType)](feature);
					self.featureDataTable.reload();
					
				}
			});
		}
	}
	
	WPGMZA.FeaturePanel.prototype.onDrawingModeChanged = function(event)
	{
		$(this.drawingInstructionsElement).detach();
		$(this.editingInstructionsElement).detach();
		
		if(this.drawingManager.mode == this.featureType)
		{
			this.showInstructions();
		}
	}
	
	WPGMZA.FeaturePanel.prototype.onDrawingComplete = function(event)
	{
		var self			= this;
		var property		= "engine" + WPGMZA.capitalizeWords(this.featureType);
		var engineFeature	= event[property];
		var formData		= this.serializeFormData();
		var geometryField	= $(self.element).find("textarea[data-ajax-name$='data']");
		
		delete formData.polydata;
		
		var nativeFeature = WPGMZA[WPGMZA.capitalizeWords(this.featureType)].createInstance(
			formData,
			engineFeature
		);
		
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.map["add" + WPGMZA.capitalizeWords(this.featureType)](nativeFeature);
		
		this.setTargetFeature(nativeFeature);
		
		// NB: This only applies to some features, maybe updateGeometryFields would be better
		if(geometryField.length)
			geometryField.val(JSON.stringify(nativeFeature.getGeometry()));
		
		if(this.featureType != "marker") {
			//WPGMZA.animateScroll( $(this.element).closest(".wpgmza-accordion") );
		}
	}
	
	WPGMZA.FeaturePanel.prototype.onPropertyChanged = function(event)
	{
		var self = this;
		var feature = this.feature;
		
		if(!feature)
			return;	// No feature, we're likely in drawing mode and not editing a feature right now

		/* Track changed fields */
		if(!feature._dirtyFields){
			feature._dirtyFields = [];
		}
		
		// Gather all the fields from our inputs and set those properties on the feature
		$(this.element)
			.find(":input[data-ajax-name]")
			.each(function(index, el) {
				
				var key = $(el).attr("data-ajax-name");

				if(feature[key] && feature._dirtyFields.indexOf(key) === -1){
					if(feature[key] !== $(el).val()){
						feature._dirtyFields.push(key);
					}
				}

				feature[key] = $(el).val();
			});
		

		// Now cause the feature to update itself
		feature.updateNativeFeature();
	}
	
	WPGMZA.FeaturePanel.prototype.onFeatureChanged = function(event)
	{
		var geometryField = $(this.element).find("textarea[data-ajax-name$='data']");
		
		if(!geometryField.length)
			return;
		
		geometryField.val(JSON.stringify(this.feature.getGeometry()));
	}
	
	WPGMZA.FeaturePanel.prototype.onSave = function(event) {
		
		WPGMZA.EmbeddedMedia.detatchAll();
		
		var self		= this;
		var id			= $(self.element).find("[data-ajax-name='id']").val();
		var data		= this.serializeFormData();
		
		var route		= "/" + this.featureType + "s/";
		var isNew		= id == -1;


		if (this.featureType == 'circle') {
			if (!data.center) {
				alert(WPGMZA.localized_strings.no_shape_circle);
				return;
			}
		}
		if (this.featureType == 'rectangle') {
			if (!data.cornerA) {
				alert(WPGMZA.localized_strings.no_shape_rectangle);
				return;
			}
		}
		if (this.featureType == 'polygon') {
			if (!data.polydata) {
				alert(WPGMZA.localized_strings.no_shape_polygon);
				return;
			}
		}
		if (this.featureType == 'polyline') {
			if (!data.polydata) {
				alert(WPGMZA.localized_strings.no_shape_polyline);
				return;
			}
		}

		if(!isNew)
			route += id;
		
		WPGMZA.mapEditPage.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.showPreloader(true);

		self.sidebarTriggerDelegate('busy');
		
		WPGMZA.restAPI.call(route, {
			method:		"POST",
			data:		data,
			success:	function(data, status, xhr) {
				
				var feature;
				
				var functionSuffix 		= WPGMZA.capitalizeWords(self.featureType);
				var getByIDFunction		= "get" + functionSuffix + "ByID";
				var removeFunction		= "remove" + functionSuffix;
				var addFunction			= "add" + functionSuffix;
				
				if(feature = self.map[getByIDFunction](id)){
					self.map[removeFunction](feature);
				}
				
				self.setTargetFeature(null);
				self.showPreloader(false);
				
				feature	= WPGMZA[WPGMZA.capitalizeWords(self.featureType)].createInstance(data);
				self.map[addFunction](feature);
				
				self.featureDataTable.reload();
				self.onTabActivated(event);

				self.reset();
				
				if(!isNew){
					self.sidebarTriggerDelegate('saved');
				} else {
					self.sidebarTriggerDelegate('created');
				}

				WPGMZA.notification(WPGMZA.capitalizeWords(self.featureType) + " " + (isNew ? "Added" : "Saved"));
			}
		})
	}

	WPGMZA.FeaturePanel.prototype.sidebarTriggerDelegate = function(type){
		var eventType = 'sidebar-delegate-' + type;
		$(this.element).trigger({type: eventType, feature: this.featureType});
	}

	WPGMZA.FeaturePanel.prototype.initWritersBlock = function(element){
		if(element){
			if(!WPGMZA.InternalEngine.isLegacy() && typeof WritersBlock !== 'undefined'){
				this.writersblock = new WritersBlock(element, this.getWritersBlockConfig());

				if(this.writersblock.elements && this.writersblock.elements.editor){
					$(this.writersblock.elements.editor).on('click', '.wpgmza-embedded-media', (event) => {
						event.stopPropagation();
						if(event.currentTarget){
							if(!event.currentTarget.wpgmzaEmbeddedMedia){
								event.currentTarget.wpgmzaEmbeddedMedia = WPGMZA.EmbeddedMedia.createInstance(event.currentTarget, this.writersblock.elements.editor);
							} 
								
							event.currentTarget.wpgmzaEmbeddedMedia.onSelect();
						}
					});

					$(this.writersblock.elements.editor).on('media_resized', () => {
						this.writersblock.onEditorChange();
					});
				}
			}
		}
	}

	WPGMZA.FeaturePanel.prototype.getWritersBlockConfig = function(){
		return {
			customTools : [
				{
					tag : 'shared-blocks',
					tools : {
						'custom-media' : {
							icon : 'fa fa-file-image-o',
							title : 'Upload Media',
							action : (editor) => {
    							if(typeof wp !== 'undefined' && typeof wp.media !== 'undefined' && typeof WPGMZA.openMediaDialog !== 'undefined'){
    								WPGMZA.openMediaDialog(
    									(mediaId, mediaUrl, media) => {
	    								    if(mediaUrl){
	    								    	if(media.type){
	    								    		switch(media.type){
	    								    			case 'image':
	    								    				// editor.writeHtml(`<div class='wpgmza-embedded-media'><img src='${mediaUrl}' /></div>`);
	    								    				editor.writeHtml(`<img class='wpgmza-embedded-media' src='${mediaUrl}' />`);
	    								    				break;
	    								    			case 'video':
	    								    				editor.writeHtml(`<video class='wpgmza-embedded-media' controls src='${mediaUrl}'></video>`);
	    								    				break;
	    								    			case 'audio':
	    								    				editor.writeHtml(`<audio controls src='${mediaUrl}'></audio>`);
	    								    				break;
	    								    		}
	    								    	} else {
	    								    		/* Should be localized */
	    								    		WPGMZA.notification("We couldn't determine the type of media being added");
	    								    	}
	    								    }
    									},
    									{
    										title: 'Select media',
											button: {
												text: 'Add media',
											},
											multiple: false,	
    										library: {
										            type: [ 'video', 'image', 'audio' ]
										    }
    									}
    								);
    							}
							}
						},
						'code-editor' : {
							icon : 'fa fa-code',
							title : 'Code Editor (HTML)',
							action : (editor) => {
								if(!editor._codeEditorActive){
									/* No code editor active yet */
									if(!editor.elements._codeEditor){
										editor.elements._codeEditor = editor.createElement('textarea', ['writersblock-wpgmza-code-editor']);

										editor.elements._codeEditor.setAttribute('placeholder', '<!-- Add HTML Here -->');
										editor.elements.wrap.appendChild(editor.elements._codeEditor);

										editor.elements._codeEditor.__editor = editor;

										/* Use a trigger to update the source based on HTML edits made by the user */
										$(editor.elements._codeEditor).on('wpgmza-writersblock-code-edited', function(){
											const target = $(this).get(0);

											if(target.__editor){
												/* We do have the HTML editor, lets grab the latest input value here, clean it a bit and then send it back */
												let editedHtml = target.__editor.elements._codeEditor.value;
												editedHtml = editedHtml.replaceAll("\n", "");
												
												/* Use the DOM to correct any HTML entered by the user, this allows us to clean up on the fly */
												const validator = document.createElement('div');

												validator.innerHTML = editedHtml;
												if(validator.innerHTML === editedHtml){
													/* HTML is the same as validated by the DOM */
													target.__editor.elements.editor.innerHTML = validator.innerHTML;
													target.__editor.onEditorChange();

													editor.elements.wrap.classList.remove('wpgmza-code-syntax-invalid');
												} else {
													editor.elements.wrap.classList.add('wpgmza-code-syntax-invalid');
												}
											}
											


										});

										$(editor.elements._codeEditor).on('change input', function(){
											$(this).trigger('wpgmza-writersblock-code-edited');
										});
									}


									editor.elements.editor.classList.add('wpgmza-hidden');
									editor.elements._codeEditor.classList.remove('wpgmza-hidden');
									
									let toolbarItems = editor.elements.toolbar.querySelectorAll('a.tool');
									for(let tool of toolbarItems){
										if(tool.getAttribute('data-value') !== 'codeeditor'){
											tool.classList.add('wpgmza-writersblock-disabled');
										} else {
											tool.classList.add('wpgmza-writersblock-hold-state');
										}
									}

									if(editor.elements.editor.innerHTML && editor.elements.editor.innerHTML.trim().length > 0){
										let sourceHtml = editor.elements.editor.innerHTML;
										sourceHtml = sourceHtml.replaceAll(/<\/(\w+)>/g, "</$1>\n");
										editor.elements._codeEditor.value = sourceHtml;
									}

									editor._codeEditorActive = true;
								} else {
									/* Dispose of the code editor and resync the DOM */
									if(editor.elements._codeEditor){
										editor.elements.editor.classList.remove('wpgmza-hidden');
										editor.elements._codeEditor.classList.add('wpgmza-hidden');


										let toolbarItems = editor.elements.toolbar.querySelectorAll('a.tool');
										for(let tool of toolbarItems){
											if(tool.getAttribute('data-value') !== 'codeeditor'){
												tool.classList.remove('wpgmza-writersblock-disabled');
											} else {
												tool.classList.remove('wpgmza-writersblock-hold-state');
											}
										}
										
										$(editor.elements._codeEditor).trigger('wpgmza-writersblock-code-edited');
									}

									editor.elements.wrap.classList.remove('wpgmza-code-syntax-invalid');
									editor._codeEditorActive = false;
								}
							}
						}
					}
				}
			],
			enabledTools : [
				'p', 'h1', 'h2',
				'createlink', 'unlink',
				'bold', 'italic', 'underline', 'strikeThrough',
				'justifyLeft', 'justifyCenter', 'justifyRight',
				'insertUnorderedList', 'insertOrderedList', 
				'insertHorizontalRule', 'custom-media', 'code-editor'
			],
			events : {
				onUpdateSelection : (packet) => {
					if(packet.instance){
						/* WritersBlock will use the last interaction, which means with 'click' events it can be behind by one interaction */
						setTimeout(
							() => {
								const pingedSelection = window.getSelection();
								if(pingedSelection && pingedSelection.toString().trim().length === 0){
									/* Force hide for continuity */
									this.writersblock.hidePopupTools();
								}
							}, 10
						);
					}
				},
			}
		}
	}

	WPGMZA.FeaturePanel.prototype.hasDirtyField = function(field){
		if(this.feature && this.feature._dirtyFields){
			if(this.feature._dirtyFields instanceof Array){
				if(this.feature._dirtyFields.indexOf(field) !== -1){
					return true;
				}
			}
		} else if(!this.feature){
			// Assume all fields are dirty as we are probably adding a new feature
			// This could probably be made a bit more complex, but no reason right now
			return true;
		}
		return false;
	}
	
});


// js/v8/map-edit-page/marker-panel.js
/**
 * @namespace WPGMZA
 * @module MarkerPanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.MarkerPanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.MarkerPanel, WPGMZA.FeaturePanel);
	
	WPGMZA.MarkerPanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProMarkerPanel(element, mapEditPage);
		
		return new WPGMZA.MarkerPanel(element, mapEditPage);
	}

	WPGMZA.MarkerPanel.prototype.initDefaults = function(){
		var self = this;
		
		WPGMZA.FeaturePanel.prototype.initDefaults.apply(this, arguments);
		
		this.adjustSubMode = false;

		if(WPGMZA.InternalEngine.isLegacy()){
			/* Only applies in legacy */
			this.onTabActivated(null);
		}

		$(document.body).on("click", "[data-adjust-" + this.featureType + "-id]", function(event) {
			self.onAdjustFeature(event);
		});

		$(document.body).on("click", ".wpgmza_approve_btn", function(event) {
			self.onApproveMarker(event);
		});
		
	}

	WPGMZA.MarkerPanel.prototype.onAdjustFeature = function(event){
		var self		= this;
		var name		= "data-adjust-" + this.featureType + "-id";
		var id			= $(event.currentTarget).attr(name);

		this.discardChanges();

		this.adjustSubMode = true;

		this.select(id);
	}

	WPGMZA.MarkerPanel.prototype.onApproveMarker = function(event){
		var self		= this;
		
		var route		= "/" + this.featureType + "s/" + $(event.currentTarget).attr('id');
		WPGMZA.restAPI.call(route, {
			method:		"POST",
			data:		{
				approved : "1"
			},
			success:	function(data, status, xhr) {
				self.featureDataTable.reload();
			}
		});
	}

	WPGMZA.MarkerPanel.prototype.onFeatureChanged = function(event){
		if(this.adjustSubMode){
			var aPos = this.feature.getPosition();

			if(aPos){
				$(this.element).find("[data-ajax-name='lat']").val(aPos.lat);
				$(this.element).find("[data-ajax-name='lng']").val(aPos.lng);
			}
			// Exit early, we don't want to adjust the address
			return;
		}

		var addressField = $(this.element).find("input[data-ajax-name$='address']");
		
		if(!addressField.length)
			return;
		
		var pos = this.feature.getPosition();
		addressField.val(pos.lat + ', ' + pos.lng);
		addressField.trigger('change');
	}

	WPGMZA.MarkerPanel.prototype.setTargetFeature = function(feature){
		if(WPGMZA.FeaturePanel.prevEditableFeature){
			var prev = WPGMZA.FeaturePanel.prevEditableFeature;
			
			if(prev.setOpacity){
				prev.setOpacity(1);
			}
		}


		/**
		 * We could probably make this adjust mode code more elegant in the future
		 *
		 * Temporary solution as it is causing trouble for clients 
		 *
		 * Date: 2021-01-15
		*/
		$(this.element).find('[data-ajax-name]').removeAttr('disabled');
		$(this.element).find('fieldset').show();
		$(this.element).find('.wpgmza-adjust-mode-notice').addClass('wpgmza-hidden');

		$(this.element).find('[data-ajax-name="lat"]').attr('type', 'hidden');
		$(this.element).find('[data-ajax-name="lng"]').attr('type', 'hidden');

		$(this.element).find('.wpgmza-hide-in-adjust-mode').removeClass('wpgmza-hidden');				
		$(this.element).find('.wpgmza-show-in-adjust-mode').addClass('wpgmza-hidden');

		/* Re-add disabled attribute to pro feature fields */
		$(this.element).find('.wpgmza-pro-feature [data-ajax-name]').attr('disabled', 'disabled');

		if(feature){
			if(feature.setOpacity){
				feature.setOpacity(0.7);
			}

			feature.getMap().panTo(feature.getPosition());

			if(this.adjustSubMode){
				$(this.element).find('[data-ajax-name]').attr('disabled', 'disabled');
				$(this.element).find('fieldset:not(.wpgmza-always-on)').hide();
				$(this.element).find('.wpgmza-adjust-mode-notice').removeClass('wpgmza-hidden');

				$(this.element).find('[data-ajax-name="lat"]').attr('type', 'text').removeAttr('disabled');
				$(this.element).find('[data-ajax-name="lng"]').attr('type', 'text').removeAttr('disabled');

				$(this.element).find('.wpgmza-hide-in-adjust-mode').addClass('wpgmza-hidden');				
				$(this.element).find('.wpgmza-show-in-adjust-mode').removeClass('wpgmza-hidden');				
			}
		} else {
			this.adjustSubMode = false;
		}

		WPGMZA.FeaturePanel.prototype.setTargetFeature.apply(this, arguments);
	}
	
	WPGMZA.MarkerPanel.prototype.onSave = function(event)
	{
		var self		= this;
		var geocoder	= WPGMZA.Geocoder.createInstance();
		var address		= $(this.element).find("[data-ajax-name='address']").val();

		var geocodingData = {
			address: address
		}

		
		WPGMZA.mapEditPage.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.showPreloader(true);
		
		// New cloud functions
		var cloud_lat = false;
		var cloud_lng = false;

		// is the lat and lng set from the WPGM Cloud Search?
		if (document.getElementsByName("lat").length > 0) { cloud_lat = document.getElementsByName("lat")[0].value; }
		if (document.getElementsByName("lng").length > 0) { cloud_lng = document.getElementsByName("lng")[0].value; }

		if (cloud_lat && cloud_lng) {
			if(!WPGMZA_localized_data.settings.googleMapsApiKey || WPGMZA_localized_data.settings.googleMapsApiKey === ''){
				//Let's only do this if it's not their own key, this causes issues with repositioning a marker 
				geocodingData.lat = parseFloat(cloud_lat);
				geocodingData.lng = parseFloat(cloud_lng);
			}
		}
		
		var addressUnchanged = !this.hasDirtyField('address');

		if(this.adjustSubMode || addressUnchanged){
			// Trust the force!
			WPGMZA.FeaturePanel.prototype.onSave.apply(self, arguments);
		} else {
			geocoder.geocode(geocodingData, function(results, status) {
				switch(status)
				{
					case WPGMZA.Geocoder.ZERO_RESULTS:
						alert(WPGMZA.localized_strings.zero_results);
						self.showPreloader(false);
						return;
						break;
					
					case WPGMZA.Geocoder.SUCCESS:	
						break;

					case WPGMZA.Geocoder.NO_ADDRESS:
						alert(WPGMZA.localized_strings.no_address);
						self.showPreloader(false);
						return;
						break;

					
					case WPGMZA.Geocoder.FAIL:
					default:
						alert(WPGMZA.localized_strings.geocode_fail);
						self.showPreloader(false);
						return;
						break;
				}
				
				var result = results[0];
				
				$(self.element).find("[data-ajax-name='lat']").val(result.lat);
				$(self.element).find("[data-ajax-name='lng']").val(result.lng);
				WPGMZA.FeaturePanel.prototype.onSave.apply(self, arguments);
				
			});
		}

		WPGMZA.mapEditPage.map.resetBounds();
	}

});

// js/v8/map-edit-page/circle-panel.js
/**
 * @namespace WPGMZA
 * @module CirclePanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.CirclePanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.CirclePanel, WPGMZA.FeaturePanel);
	
	WPGMZA.CirclePanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProCirclePanel(element, mapEditPage);
		
		return new WPGMZA.CirclePanel(element, mapEditPage);
	}
	
	WPGMZA.CirclePanel.prototype.updateFields = function()
	{
		$(this.element).find("[data-ajax-name='center']").val( this.feature.getCenter().toString() );
		$(this.element).find("[data-ajax-name='radius']").val( this.feature.getRadius() );
	}
	
	WPGMZA.CirclePanel.prototype.onDrawingComplete = function(event)
	{
		WPGMZA.FeaturePanel.prototype.onDrawingComplete.apply(this, arguments);
		
		this.updateFields();
	}

	WPGMZA.CirclePanel.prototype.setTargetFeature = function(feature){
		WPGMZA.FeaturePanel.prototype.setTargetFeature.apply(this, arguments);

		if(feature){
			this.updateFields();
		}
	}
	
	WPGMZA.CirclePanel.prototype.onFeatureChanged = function(event)
	{
		WPGMZA.FeaturePanel.prototype.onFeatureChanged.apply(this, arguments);
		this.updateFields();
	}
	
});

// js/v8/map-edit-page/map-edit-page.js
/**
 * @namespace WPGMZA
 * @module MapEditPage
 * @requires WPGMZA.EventDispatcher
 */

var wpgmza_autoCompleteDisabled = false;

jQuery(function($) {
	
	if(WPGMZA.currentPage != "map-edit")
		return;
	
	WPGMZA.MapEditPage = function()
	{
		var self = this;
		var element = document.body;
		
		WPGMZA.EventDispatcher.call(this);
		
		if(!WPGMZA.settings.internalEngine || WPGMZA.InternalEngine.isLegacy()){
			// Only force this if we are in legacy
			// New internal engines will handle this internally instead
			$("#wpgmaps_options fieldset").wrapInner("<div class='wpgmza-flex'></div>");
		}
		
		this.themePanel = new WPGMZA.ThemePanel();
		this.themeEditor = new WPGMZA.ThemeEditor();

		this.sidebarGroupings = new WPGMZA.SidebarGroupings();

		this.map = WPGMZA.maps[0];
		
		// Drawing manager
		if(!WPGMZA.pro_version || WPGMZA.Version.compare(WPGMZA.pro_version, '8.1.0') >= WPGMZA.Version.EQUAL_TO)
			this.drawingManager = WPGMZA.DrawingManager.createInstance(this.map);
		
		// UI
		this.initDataTables();
		this.initFeaturePanels();
		this.initJQueryUIControls();

		if(WPGMZA.locale !== 'en'){
			if(WPGMZA.InternalEngine.isLegacy()){
				$('#datatable_no_result_message,#datatable_search_string').parent().parent().hide();
			} else {
				$('#datatable_no_result_message,#datatable_search_string').parent().hide();
			}
		}
		
		// Address input
		$("input.wpgmza-address").each(function(index, el) {
			el.addressInput = WPGMZA.AddressInput.createInstance(el, self.map);
		});

		$('#wpgmza-map-edit-page input[type="color"]').each(function(){
			var buttonClass = WPGMZA.InternalEngine.isLegacy() ? 'button-secondary' : 'wpgmza-button';
			$("<div class='" + buttonClass + " wpgmza-paste-color-btn' title='Paste a HEX color code'><i class='fa fa-clipboard' aria-hidden='true'></i></div>").insertAfter(this);
		});


		jQuery('body').on('click','.wpgmza_ac_result', function(e) {
			var index = jQuery(this).data('id');
			var lat = jQuery(this).data('lat');
			var lng = jQuery(this).data('lng');
			var name = jQuery('#wpgmza_item_address_'+index).html();
			
			
			jQuery("input[name='lat']").val(lat);
			jQuery("input[name='lng']").val(lng);
			jQuery("#wpgmza_add_address_map_editor").val(name);
			jQuery('#wpgmza_autocomplete_search_results').hide();
		});

		jQuery('body').on('click', '.wpgmza-paste-color-btn', function(){
			try{
				var colorBtn = $(this);
				if(!navigator || !navigator.clipboard || !navigator.clipboard.readText){
					return;
				}

				navigator.clipboard.readText()
				  	.then(function(textcopy) {
				    	colorBtn.parent().find('input[type="color"]').val("#" + textcopy.replace("#","").trim());
				  	})
				  	.catch(function(err) {
				    	console.error("WP Go Maps: Could not access clipboard", err);
				  	});

			} catch(c_ex){

			}
		});

		jQuery('body').on('focusout', '#wpgmza_add_address_map_editor', function(e) {
			setTimeout(function() {
				jQuery('#wpgmza_autocomplete_search_results').fadeOut('slow');
			},500)
			
		});

		var ajaxRequest = false;
		var wpgmzaAjaxTimeout = false;

		var wpgmzaStartTyping = false;
		var wpgmzaKeyStrokeCount = 1;
		var wpgmzaAvgTimeBetweenStrokes = 300; //300 ms by default (equates to 40wpm which is the average typing speed of a person)
		var wpgmzaTotalTimeForKeyStrokes = 0;
		var wpgmzaTmp = '';
		var wpgmzaIdentifiedTypingSpeed = false;

		$('body').on('keypress', '.wpgmza-address', function(e) {
			if(self.shouldAddressFieldUseEnhancedAutocomplete(this)){
				self.onKeyUpEnhancedAutocomplete(e, this);
			}
		});


		// Map height change (for warning)
		$("#wpgmza_map_height_type").on("change", function(event) {
			self.onMapHeightTypeChange(event);
		});
		
		// Don't have instructions in advanced marker panel, it's confusing for debugging and unnecessary
		$("#advanced-markers .wpgmza-feature-drawing-instructions").remove();
		
		// Hide the auto search area maximum zoom - not available in Basic. Pro will take care of showing it when needed
		$("[data-search-area='auto']").hide();
		
		// Control listeners
		$(document.body).on("click", "[data-wpgmza-admin-marker-datatable] input[name='mark']", function(event) {
			self.onShiftClick(event);
		});
		
		$("#wpgmza_map_type").on("change", function(event) {
			self.onMapTypeChanged(event);
		});

		$("body").on("click",".wpgmza_copy_shortcode", function() {
	        var $temp = jQuery('<input>');
	        var $tmp2 = jQuery('<span id="wpgmza_tmp" style="display:none; width:100%; text-align:center;">');
	        jQuery("body").append($temp);
	        $temp.val(jQuery(this).val()).select();
	        document.execCommand("copy");
	        $temp.remove();
	        WPGMZA.notification("Shortcode Copied");
	    });
		
		this.on("markerupdated", function(event) {
			self.onMarkerUpdated(event);
		});

		// NB: Older version of Pro (< 7.0.0 - pre-WPGMZA.Map) will have this.map as undefined. Only run this code if we have a WPGMZA.Map to work with.
		if(this.map)
		{
			this.map.on("zoomchanged", function(event) {
				self.onZoomChanged(event);
			});
			
			this.map.on("boundschanged", function(event) {
				self.onBoundsChanged(event);
			});
			
			this.map.on("rightclick", function(event) {
				self.onRightClick(event);
			});
		}
		
		$(element).on("click", ".wpgmza_poly_del_btn", function(event) {
			self.onDeletePolygon(event);
		});
		
		$(element).on("click", ".wpgmza_polyline_del_btn", function(event) {
			self.onDeletePolyline(event);
		});
		
		$(element).on("click", ".wpgmza_dataset_del_btn", function(evevnt) {
			self.onDeleteHeatmap(event);
		});
		
		$(element).on("click", ".wpgmza_circle_del_btn", function(event) {
			self.onDeleteCircle(event);
		});
		
		$(element).on("click", ".wpgmza_rectangle_del_btn", function(event) {
			self.onDeleteRectangle(event);
		});

		$(element).on("click", "#wpgmza-open-advanced-theme-data", function(event){
			event.preventDefault();
			$('.wpgmza_theme_data_container').toggleClass('wpgmza_hidden');
		});

		$(element).on("click", ".wpgmza-shortcode-button", function(event){
			event.preventDefault();
			$(element).find('.wpgmza-shortcode-description').addClass('wpgmza-hidden');

			const nearestRow = $(this).closest('.wpgmza-row');
			if(nearestRow.length){
				const nearestHint = nearestRow.next('.wpgmza-shortcode-description');
				if(nearestHint.length){
					nearestHint.removeClass('wpgmza-hidden');
				}
			}

			const shortcode = $(this).text();
			if(shortcode.length){
				const temp = jQuery('<input>');
		        $(document.body).append(temp);
		        temp.val(shortcode).select();
		        document.execCommand("copy");
		        temp.remove();
		        WPGMZA.notification("Shortcode Copied");
			}
		});
	}
	
	WPGMZA.extend(WPGMZA.MapEditPage, WPGMZA.EventDispatcher);
	
	WPGMZA.MapEditPage.createInstance = function()
	{
		if(WPGMZA.isProVersion() && WPGMZA.Version.compare(WPGMZA.pro_version, "8.0.0") >= WPGMZA.Version.EQUAL_TO)
			return new WPGMZA.ProMapEditPage();
		
		return new WPGMZA.MapEditPage();
	}
	
	WPGMZA.MapEditPage.prototype.initDataTables = function()
	{
		var self = this;
		
		$("[data-wpgmza-datatable][data-wpgmza-rest-api-route]").each(function(index, el) {
			
			var featureType	= $(el).attr("data-wpgmza-feature-type");
			
			self[featureType + "AdminDataTable"] = new WPGMZA.AdminFeatureDataTable(el);
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.initFeaturePanels = function()
	{
		var self = this;
		
		$(".wpgmza-feature-accordion[data-wpgmza-feature-type]").each(function(index, el) {
			
			var featurePanelElement	= $(el).find(".wpgmza-feature-panel-container > *");
			var featureType			= $(el).attr("data-wpgmza-feature-type");
			var panelClassName		= WPGMZA.capitalizeWords(featureType) + "Panel";
			var module				= WPGMZA[panelClassName];
			var instance			= module.createInstance(featurePanelElement, self);
			
			self[featureType + "Panel"] = instance;
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.initJQueryUIControls = function()
	{
		var self = this;
		var mapContainer;
		
		// Now initialise tabs
		$("#wpgmaps_tabs").tabs();
		
		// NB: If the map container has a <ul> then this will break the tabs (this happens in OpenLayers). Temporarily detach the map to avoid this.
		mapContainer = $("#wpgmza-map-container").detach();
		
		$("#wpgmaps_tabs_markers").tabs(); 
		
		// NB: Re-add the map container (see above)
		$(".map_wrapper").prepend(mapContainer);
		
		// And the zoom slider
		$("#slider-range-max").slider({
			range: "max",
			min: 1,
			max: 21,
			value: $("input[name='map_start_zoom']").val(),
			slide: function( event, ui ) {
				$("input[name='map_start_zoom']").val(ui.value);
				self.map.setZoom(ui.value);
			}
		});
	}
	
	WPGMZA.MapEditPage.prototype.onShiftClick = function(event)
	{
		var checkbox = event.currentTarget;
		var row = jQuery(checkbox).closest("tr");
		
		if(this.lastSelectedRow && event.shiftKey)
		{
			var prevIndex = this.lastSelectedRow.index();
			var currIndex = row.index();
			var startIndex = Math.min(prevIndex, currIndex);
			var endIndex = Math.max(prevIndex, currIndex);
			var rows = jQuery("[data-wpgmza-admin-marker-datatable] tbody>tr");
			
			// Clear
			jQuery("[data-wpgmza-admin-marker-datatable] input[name='mark']").prop("checked", false);
			
			for(var i = startIndex; i <= endIndex; i++)
				jQuery(rows[i]).find("input[name='mark']").prop("checked", true);
			
			

		}
		
		this.lastSelectedRow = row;
	}
	
	WPGMZA.MapEditPage.prototype.onMapTypeChanged = function(event)
	{
		if(WPGMZA.settings.engine == "open-layers")
			return;
		
		var mapTypeId;
		
		switch(event.target.value)
		{
			case "2":
				mapTypeId = google.maps.MapTypeId.SATELLITE;
				break;
			
			case "3":
				mapTypeId = google.maps.MapTypeId.HYBRID;
				break;
			
			case "4":
				mapTypeId = google.maps.MapTypeId.TERRAIN;
				break;
			
			default:
				mapTypeId = google.maps.MapTypeId.ROADMAP;
				break;
		}
		
		this.map.setOptions({
			mapTypeId: mapTypeId
		});
	}
	
	WPGMZA.MapEditPage.prototype.onMarkerUpdated = function(event)
	{
		this.markerDataTable.reload();
	}
	
	WPGMZA.MapEditPage.prototype.onZoomChanged = function(event) {
		$(".map_start_zoom").val(this.map.getZoom());
	}
	
	WPGMZA.MapEditPage.prototype.onBoundsChanged = function(event)
	{
		var location = this.map.getCenter();
		
		$("#wpgmza_start_location").val(location.lat + "," + location.lng);
		$("input[name='map_start_lat']").val(location.lat);
		$("input[name='map_start_lng']").val(location.lng);
		
		$("#wpgmza_start_zoom").val(this.map.getZoom());
		
		$("#wpgmaps_save_reminder").show();
	}
	
	WPGMZA.MapEditPage.prototype.onMapHeightTypeChange = function(event)
	{
		if(event.target.value == "%")
			$("#wpgmza_height_warning").show();
	}
	
	WPGMZA.MapEditPage.prototype.onRightClick = function(event)
	{
		var self = this;
		var marker;

		if(!WPGMZA.InternalEngine.isLegacy() && this.sidebarGroupings){
			if(this.sidebarGroupings.isOpen('global') || this.sidebarGroupings.isOpen('map-markers')){
				/* Either their on the root tab, or they are on the marker list, so let's open the marker creator for them */
				this.sidebarGroupings.openTabByFeatureType('marker');
			}
		}

		if(this.drawingManager && this.drawingManager.mode != WPGMZA.DrawingManager.MODE_MARKER)
			return;	// Do nothing, not in marker mode
		
		if(!this.rightClickMarker)
		{
			this.rightClickMarker = WPGMZA.Marker.createInstance({
				draggable: true
			});
		
			this.rightClickMarker.on("dragend", function(event) {
				$(".wpgmza-marker-panel [data-ajax-name='address']").val(event.latLng.lat + ", " + event.latLng.lng);
			});
			
			this.map.on("click", function(event) {
				/* Remove the marker on left click*/
				self.rightClickMarker.setMap(null);

				/* Seeing as we are removing the marker, clear the lat/lng combo as well */
				$(".wpgmza-marker-panel [data-ajax-name='address']").val("");
			});
		}
		
		marker = this.rightClickMarker;
		
		marker.setPosition(event.latLng);
		marker.setMap(this.map);
		
		$(".wpgmza-marker-panel [data-ajax-name='address']").val(event.latLng.lat+', '+event.latLng.lng);
	}
	
	WPGMZA.MapEditPage.prototype.onDeletePolygon = function(event)
	{
		var cur_id = parseInt($(this).attr("id"));
		var data = {
			action:		'delete_poly',
			security:	wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:		this.map.id,
			poly_id:	cur_id
		};
		
		$.post(ajaxurl, data, function (response) {

			WPGM_Path[cur_id].setMap(null);
			delete WPGM_PathData[cur_id];
			delete WPGM_Path[cur_id];
			$("#wpgmza_poly_holder").html(response);
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.onDeletePolyline = function(event)
	{
		var cur_id = $(this).attr("id");
		var data = {
			action:		'delete_polyline',
			security:	wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:		this.map.id,
			poly_id:	cur_id
		};
		
		$.post(ajaxurl, data, function (response) {
			
			WPGM_PathLine[cur_id].setMap(null);
			delete WPGM_PathLineData[cur_id];
			delete WPGM_PathLine[cur_id];
			$("#wpgmza_polyline_holder").html(response);
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.onDeleteHeatmap = function(event)
	{
		var cur_id = $(this).attr("id");
		var data = {
			action:		'delete_dataset',
			security:	wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:		this.map.id,
			poly_id:	cur_id
		};
		
		$.post(ajaxurl, data, function (response) {
			
			heatmap[cur_id].setMap(null);
			delete heatmap[cur_id];
			$("#wpgmza_heatmap_holder").html(response);
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.onDeleteCircle = function(event)
	{
		var circle_id = $(this).attr("id");
		
		var data = {
			action:		'delete_circle',
			security:	wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:		this.map.id,
			circle_id:	circle_id
		};
		
		$.post(ajaxurl, data, function (response) {
			
			$("#tabs-m-5 table").replaceWith(response);
			
			circle_array.forEach(function (circle) {

				if (circle.id == circle_id) {
					circle.setMap(null);
					return false;
				}

			});

		});
	}
	
	WPGMZA.MapEditPage.prototype.onDeleteRectangle = function(event)
	{
		var rectangle_id = $(this).attr("id");
		
		var data = {
			action:			'delete_rectangle',
			security:		wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:			this.map.id,
			rectangle_id:	rectangle_id
		};
		
		$.post(ajaxurl, data, function (response) {
			
			$("#tabs-m-6 table").replaceWith(response);
			
			rectangle_array.forEach(function (rectangle) {

				if (rectangle.id == rectangle_id) {
					rectangle.setMap(null);
					return false;
				}

			});

		});
	}

	WPGMZA.MapEditPage.prototype.shouldAddressFieldUseEnhancedAutocomplete = function(element){
		/* This should really be moved to its own module later (EnhancedAutocomplete) */
		if(element && element.id && element.id === 'wpgmza_add_address_map_editor'){
			return true;
		} 
		return false;
	}

	WPGMZA.MapEditPage.prototype.onKeyUpEnhancedAutocomplete = function(event, element){
		/* This should really be moved to its own module later (EnhancedAutocomplete) */
		if(element._wpgmzaAddressInput && element._wpgmzaAddressInput.googleAutocompleteLoaded){
			/* At some point the system swapped over to the Google Autocomplete, we should not take further action here */
			return;
		}

		if(!element._wpgmzaEnhancedAutocomplete){
			/*
			 * Set up some default state trackers 
			 * 
			 * Some notes, 300ms for avg keystroke equates to 40wpm, which is the average typing speed of a person
			*/
			element._wpgmzaEnhancedAutocomplete = {
				identifiedTypingSpeed : false,
				typingTimeout : false,
				startTyping : false,
				keyStrokeCount : 1,
				avgTimeBetweenStrokes : 300,
				totalTimeForKeyStrokes : 0,
				ajaxRequest : false,
				ajaxTimeout : false,
				requestErrorCount : 0,
				disabledFlag : false,
				disabledCheckCount : 0
			};
		} 

		let enhancedAutocomplete = element._wpgmzaEnhancedAutocomplete;

		const ignoredKeys = [
			"Escape", "Alt", "Control", "Option", "Shift", 
			"ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
		];

		if(ignoredKeys.indexOf(event.key) !== -1){
			/* This keystroke should be ignored */
			$('#wpgmza_autocomplete_search_results').hide();
			return;
		}

		if(enhancedAutocomplete.disabledFlag){
			/* The server has disabled autocomplete requests manually */
			enhancedAutocomplete.disabledCheckCount ++;
			if(enhancedAutocomplete.disabledCheckCount >= 5){
				/* User keeps trying to use te autocomplete, even though server has reported this as disabled */
				/* Swap out to Google now, because this is silly */
				this.swapEnhancedAutocomplete(element);
			}
			return;
		}
		
		let googleApiKey = false;
		if(WPGMZA.settings && (WPGMZA.settings.googleMapsApiKey || WPGMZA.settings.wpgmza_google_maps_api_key)){
			googleApiKey = WPGMZA.settings.googleMapsApiKey ? WPGMZA.settings.googleMapsApiKey : WPGMZA.settings.wpgmza_google_maps_api_key;
		}

		if(!enhancedAutocomplete.identifiedTypingSpeed){
			let d = new Date();
			if(enhancedAutocomplete.typingTimeout){
				clearTimeout(enhancedAutocomplete.typingTimeout);
			}

			enhancedAutocomplete.typingTimeout = setTimeout(() => {
				enhancedAutocomplete.startTyping = false;
				enhancedAutocomplete.avgTimeBetweenStrokes = 300;
				enhancedAutocomplete.totalTimeForKeyStrokes = 0;
			}, 1500);

			if(!enhancedAutocomplete.startTyping){
				enhancedAutocomplete.startTyping = d.getTime();
				enhancedAutocomplete.keyStrokeCount ++;
			} else {
				if(enhancedAutocomplete.keyStrokeCount > 1){
					enhancedAutocomplete.currentTimeBetweenStrokes = d.getTime() - enhancedAutocomplete.startTyping;
					enhancedAutocomplete.totalTimeForKeyStrokes += enhancedAutocomplete.currentTimeBetweenStrokes;

					enhancedAutocomplete.avgTimeBetweenStrokes = (enhancedAutocomplete.totalTimeForKeyStrokes / (enhancedAutocomplete.keyStrokeCount - 1));
					enhancedAutocomplete.startTyping = d.getTime();

					if(enhancedAutocomplete.keyStrokeCount >= 3){
						/* We only need to measure speed based on the first 3 strokes */
						enhancedAutocomplete.identifiedTypingSpeed = enhancedAutocomplete.avgTimeBetweenStrokes;
					}
				}

				enhancedAutocomplete.keyStrokeCount ++;
			}

			/* Bail while we take our measurements, should be the first 3 characters */
			return;
		}

		/* Continue processing this request, we have at this stage, determined the users typing speed and we are ready to roll */
		if(enhancedAutocomplete.ajaxTimeout){
			clearTimeout(enhancedAutocomplete.ajaxTimeout);
		}

		/* Show the searching stub */
		$('#wpgmza_autocomplete_search_results').html('<div class="wpgmza-pad-5">Searching...</div>');
		$('#wpgmza_autocomplete_search_results').show();

		enhancedAutocomplete.currentSearch = $(element).val();
		if(enhancedAutocomplete.currentSearch && enhancedAutocomplete.currentSearch.trim().length > 0){
			/* Check if we are in the middle of a request, if so, let's abore that to do focus on the new one instead */
			if(enhancedAutocomplete.ajaxRequest !== false){
				enhancedAutocomplete.ajaxRequest.abort();
			}

			enhancedAutocomplete.requestParams = {
				domain : window.location.hostname
			};

			if(enhancedAutocomplete.requestParams.domain === 'localhost'){
				try {
					/* 
					 * Local domains sometimes run into issues with the enhanced autocomplete. 
					 *
					 * To ensure new users get the most out of the free service, let's go ahead and prepare a local style request 
					*/
					let paths = window.location.pathname.match(/\/(.*?)\//);
					if(paths && paths.length >= 2 && paths[1]){
						let path = paths[1];
						enhancedAutocomplete.requestParams.domain += "-" + path;
					}
				} catch (ex){
					/* Leave it alone */
				}
			}

			enhancedAutocomplete.requestParams.url = "https://wpgmaps.us-3.evennode.com/api/v1/autocomplete";

			enhancedAutocomplete.requestParams.query = {
				s : enhancedAutocomplete.currentSearch,
				d : enhancedAutocomplete.requestParams.domain,
				hash : WPGMZA.siteHash
			};

			if(googleApiKey){
				/* Send through the google key for further enhancements */
				enhancedAutocomplete.requestParams.query.k = googleApiKey;
			}

			if(WPGMZA.settings){
				if(WPGMZA.settings.engine){
					enhancedAutocomplete.requestParams.query.engine = WPGMZA.settings.engine;
				}

				if(WPGMZA.settings.internal_engine){
					enhancedAutocomplete.requestParams.query.build = WPGMZA.settings.internal_engine;
				}
			}

			/* Finalize the enhanced autocomplete URL query */
			enhancedAutocomplete.requestParams.query = new URLSearchParams(enhancedAutocomplete.requestParams.query);					
			enhancedAutocomplete.requestParams.url += "?" + enhancedAutocomplete.requestParams.query.toString();

			/* Place request in a timetout, to delay the send time by the typing speed */
			enhancedAutocomplete.ajaxTimeout = setTimeout(() => {
				/* Prepare and send the request */
				enhancedAutocomplete.ajaxRequest = $.ajax({
					url : enhancedAutocomplete.requestParams.url,
					type : 'GET',
					dataType : 'json',
					success : (results) => {
						try {
							if(results instanceof Object){
								if(results.error){
									/* We have an error, we need to work with this */
									if (results.error == 'error1') {
										$('#wpgmza_autoc_disabled').html(WPGMZA.localized_strings.cloud_api_key_error_1);
										$('#wpgmza_autoc_disabled').fadeIn('slow');
										$('#wpgmza_autocomplete_search_results').hide();

										enhancedAutocomplete.disabledFlag = true;
									} else {
										/* General request error was reached, we need to report it and instantly swap back to Google */
										console.error(results.error);
										this.swapEnhancedAutocomplete(element);
									}
								} else {
									/* Things are looking good, let's serve the data */
									$('#wpgmza_autocomplete_search_results').html('');
									let html = "";
									
									for(var i in results){ 
										html += "<div class='wpgmza_ac_result " + (html === "" ? "" : "border-top") + "' data-id='" + i + "' data-lat='"+results[i]['lat']+"' data-lng='"+results[i]['lng']+"'><div class='wpgmza_ac_container'><div class='wpgmza_ac_icon'><img src='"+results[i]['icon']+"' /></div><div class='wpgmza_ac_item'><span id='wpgmza_item_name_"+i+"' class='wpgmza_item_name'>" + results[i]['place_name'] + "</span><span id='wpgmza_item_address_"+i+"' class='wpgmza_item_address'>" + results[i]['formatted_address'] + "</span></div></div></div>"; 
									}
									
									if(!html || html.length <= 0){ 
										html = "<div class='p-2 text-center'><small>No results found...</small></div>"; 
									} 
									
									$('#wpgmza_autocomplete_search_results').html(html);
									$('#wpgmza_autocomplete_search_results').show();

									/* Finally reset all error counters */
									enhancedAutocomplete.disabledCheckCount = 0;
									enhancedAutocomplete.requestErrorCount = 0;
								}
							} else {
								/* Results are malformed - Swap out now */
								this.swapEnhancedAutocomplete(element);
							}
						} catch (ex){
							/* Results are malformed - Swap out now */
							console.error("WP Go Maps Plugin: There was an error returning the list of places for your search");
							this.swapEnhancedAutocomplete(element);
						}
					},
					error : () => {
						/* Request failed */
						$('#wpgmza_autocomplete_search_results').hide();
						
						/* There is a chance that this was purely a network issue, we should count it, and bail later if need be */
						enhancedAutocomplete.requestErrorCount ++;
						if(enhancedAutocomplete.requestErrorCount >= 3){
							/* Swap out now */
							this.swapEnhancedAutocomplete(element);
						}
					}
				});
			}, (enhancedAutocomplete.identifiedTypingSpeed * 2));
		} else {
			/* Search is empty, just hide the popup for now */
			$('#wpgmza_autocomplete_search_results').hide();
		}
		
	}

	WPGMZA.MapEditPage.prototype.swapEnhancedAutocomplete = function(element){
		/* Disable the enhanced autocomplete, and swap back to the native systems instead */
		if(element._wpgmzaAddressInput){
			if(!element._wpgmzaAddressInput.googleAutocompleteLoaded){
				element._wpgmzaAddressInput.loadGoogleAutocomplete();
			}
		}
		
		$('#wpgmza_autocomplete_search_results').hide();
		$('#wpgmza_autoc_disabled').hide();
	}
	
	$(document).ready(function(event) {
		
		WPGMZA.mapEditPage = WPGMZA.MapEditPage.createInstance();
		
	});
	
});


// js/v8/map-edit-page/point-label-panel.js
/**
 * @namespace WPGMZA
 * @module PointlabelPanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.PointlabelPanel = function(element, mapEditPage){
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.PointlabelPanel, WPGMZA.FeaturePanel);
	
	WPGMZA.PointlabelPanel.createInstance = function(element, mapEditPage){
		/*if(WPGMZA.isProVersion())
			return new WPGMZA.ProPointLabelPanel(element, mapEditPage);
		*/
		return new WPGMZA.PointlabelPanel(element, mapEditPage);
	}
	
	WPGMZA.PointlabelPanel.prototype.updateFields = function(){
		$(this.element).find("[data-ajax-name='center']").val( this.feature.getPosition().toString() );
	}
	
	WPGMZA.PointlabelPanel.prototype.onDrawingComplete = function(event){
		WPGMZA.FeaturePanel.prototype.onDrawingComplete.apply(this, arguments);
		this.updateFields();
	}

	WPGMZA.PointlabelPanel.prototype.setTargetFeature = function(feature){
		WPGMZA.FeaturePanel.prototype.setTargetFeature.apply(this, arguments);

		if(feature){
			this.updateFields();
		}
	}
	
	WPGMZA.PointlabelPanel.prototype.onFeatureChanged = function(event){
		WPGMZA.FeaturePanel.prototype.onFeatureChanged.apply(this, arguments);
		this.updateFields();
	}
});

// js/v8/map-edit-page/polygon-panel.js
/**
 * @namespace WPGMZA
 * @module PolygonPanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.PolygonPanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.PolygonPanel, WPGMZA.FeaturePanel);
	
	WPGMZA.PolygonPanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProPolygonPanel(element, mapEditPage);
		
		return new WPGMZA.PolygonPanel(element, mapEditPage);
	}
	
	Object.defineProperty(WPGMZA.PolygonPanel.prototype, "drawingManagerCompleteEvent", {
		
		"get": function() {
			return "polygonclosed";
		}
		
	});
	
});

// js/v8/map-edit-page/polyline-panel.js
/**
 * @namespace WPGMZA
 * @module PolylinePanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.PolylinePanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.PolylinePanel, WPGMZA.FeaturePanel);
	
	WPGMZA.PolylinePanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProPolylinePanel(element, mapEditPage);
		
		return new WPGMZA.PolylinePanel(element, mapEditPage);
	}
	
});

// js/v8/map-edit-page/rectangle-panel.js
/**
 * @namespace WPGMZA
 * @module RectanglePanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.RectanglePanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.RectanglePanel, WPGMZA.FeaturePanel);
	
	WPGMZA.RectanglePanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProRectanglePanel(element, mapEditPage);
		
		return new WPGMZA.RectanglePanel(element, mapEditPage);
	}
	
	WPGMZA.RectanglePanel.prototype.updateFields = function()
	{
		var bounds = this.feature.getBounds();
		if(bounds.north && bounds.west && bounds.south && bounds.east){
			$(this.element).find("[data-ajax-name='cornerA']").val( bounds.north + ", " + bounds.west );
			$(this.element).find("[data-ajax-name='cornerB']").val( bounds.south + ", " + bounds.east );
		}
	}

	WPGMZA.RectanglePanel.prototype.setTargetFeature = function(feature){
		WPGMZA.FeaturePanel.prototype.setTargetFeature.apply(this, arguments);

		if(feature){
			this.updateFields();
		}
	}
	
	WPGMZA.RectanglePanel.prototype.onDrawingComplete = function(event)
	{
		WPGMZA.FeaturePanel.prototype.onDrawingComplete.apply(this, arguments);
		
		this.updateFields();
	}
	
	WPGMZA.RectanglePanel.prototype.onFeatureChanged = function(event)
	{
		WPGMZA.FeaturePanel.prototype.onFeatureChanged.apply(this, arguments);
		this.updateFields();
	}
	
});

// js/v8/open-layers/ol-circle.js
/**
 * @namespace WPGMZA
 * @module OLCircle
 * @requires WPGMZA.Circle
 * @pro-requires WPGMZA.ProCircle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.OLCircle = function(options, olFeature)
	{
		var self = this, geom;
		
		Parent.call(this, options, olFeature);
		
		if(!options)
			options = {};
		
		if(olFeature)
		{
			var circle = olFeature.getGeometry();
			var center = ol.proj.toLonLat(circle.getCenter());
			
			geom = circle;
			
			options.center = new WPGMZA.LatLng(
				center[1],
				center[0]
			);
			options.radius = circle.getRadius() / 1000;
		}
		else
		{
			geom = new ol.geom.Circle(
				ol.proj.fromLonLat([
					parseFloat(options.center.lng),
					parseFloat(options.center.lat)
				]),
				options.radius * 1000
			);
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector()
		});
		
		this.olFeature = new ol.Feature({
			geometry: geom
		});

		this.layer.getSource().addFeature(this.olFeature);
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaCircle: this,
			wpgmzaFeature: this
		});
		
		if(options)
			this.setOptions(options);
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProCircle;
	
	WPGMZA.OLCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.OLCircle.prototype.constructor = WPGMZA.OLCircle;
	
	WPGMZA.OLCircle.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
	WPGMZA.OLCircle.prototype.getCenter = function()
	{
		var lonLat = ol.proj.toLonLat(this.olFeature.getGeometry().getCenter());
			
		return new WPGMZA.LatLng({
			lat: lonLat[1],
			lng: lonLat[0]
		});
	}

	WPGMZA.OLCircle.prototype.recreate = function()
	{
		if(this.olFeature)
		{
			this.layer.getSource().removeFeature(this.olFeature);
			delete this.olFeature;
		}
		
		if(!this.center || !this.radius)
			return;
		
		// IMPORTANT: Please note that due to what appears to be a bug in OpenLayers, the following code MUST be exected specifically in this order, or the circle won't appear
		var radius = parseFloat(this.radius) * 1000;
		var x, y;
		
		x = this.center.lng;
		y = this.center.lat;
		
		var circle4326 = ol.geom.Polygon.circular([x, y], radius, 64);
		var circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
		
		this.olFeature = new ol.Feature(circle3857);
		
		this.layer.getSource().addFeature(this.olFeature);
	}

	WPGMZA.OLCircle.prototype.setVisible = function(visible)
	{
		this.layer.setVisible(visible ? true : false);
	}
	
	WPGMZA.OLCircle.prototype.setCenter = function(center)
	{
		WPGMZA.Circle.prototype.setCenter.apply(this, arguments);
		
		this.recreate();
	}
	
	WPGMZA.OLCircle.prototype.getRadius = function()
	{
		var geom = this.layer.getSource().getFeatures()[0].getGeometry();
		return geom.getRadius() / 1000; // Meters to kilometers
	}
	
	WPGMZA.OLCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
	}
	
	WPGMZA.OLCircle.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
});

// js/v8/open-layers/ol-drawing-manager.js
/**
 * @namespace WPGMZA
 * @module OLDrawingManager
 * @requires WPGMZA.DrawingManager
 */
jQuery(function($) {
	WPGMZA.OLDrawingManager = function(map)
	{
		var self = this;
		
		WPGMZA.DrawingManager.call(this, map);
		
		this.source = new ol.source.Vector({wrapX: false});
		
		this.layer = new ol.layer.Vector({
			source: this.source
		});
		
		/*this.map.on("init", function() {
			self.map.olMap.addLayer(self.layer);
		});*/
	}
	
	WPGMZA.OLDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.OLDrawingManager.prototype.constructor = WPGMZA.OLDrawingManager;
	
	WPGMZA.OLDrawingManager.prototype.setOptions = function(options)
	{
		var params = {};
	
		if(options.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(options.strokeColor, options.strokeOpacity)
			})
		
		if(options.fillOpacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(options.fillColor, options.fillOpacity)
			});
	
		this.layer.setStyle(new ol.style.Style(params));
	}
	
	WPGMZA.OLDrawingManager.prototype.setDrawingMode = function(mode)
	{
		var self = this;
		var type, endEventType;
		
		WPGMZA.DrawingManager.prototype.setDrawingMode.call(this, mode);
		
		if(this.interaction)
		{
			this.map.olMap.removeInteraction(this.interaction);
			this.interaction = null;
		}
		
		switch(mode)
		{
			case WPGMZA.DrawingManager.MODE_NONE:
				return;
				break;
			
			case WPGMZA.DrawingManager.MODE_MARKER:
				return;
				break;
			
            case WPGMZA.DrawingManager.MODE_POLYGON:
				type = "Polygon";
				endEventType = "polygonclosed";
				break;
			
		    case WPGMZA.DrawingManager.MODE_POLYLINE:
				type = "LineString";
				endEventType = "polylinecomplete";
				break;
				
			case WPGMZA.DrawingManager.MODE_CIRCLE:
				type = "Circle";
				endEventType = "circlecomplete";
				break;
				
			case WPGMZA.DrawingManager.MODE_RECTANGLE:
				type = "Circle";
				endEventType = "rectanglecomplete";
				break;
			
			case WPGMZA.DrawingManager.MODE_HEATMAP:
				return;
				break;

			case WPGMZA.DrawingManager.MODE_POINTLABEL:
				return;
				break;
			case WPGMZA.DrawingManager.MODE_IMAGEOVERLAY:
				type = "Circle";
				endEventType = "imageoverlaycomplete";
				break;
			
			default:
				throw new Error("Invalid drawing mode");
				break;
		}
		
		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.selectInteraction)
		{
			WPGMZA.mapEditPage.map.olMap.removeInteraction(WPGMZA.mapEditPage.selectInteraction);
		}
		
		var options = {
			source: this.source,
			type: type
		};
		
		if(mode == WPGMZA.DrawingManager.MODE_RECTANGLE || mode == WPGMZA.DrawingManager.MODE_IMAGEOVERLAY)
			options.geometryFunction = ol.interaction.Draw.createBox();
		
		this.interaction = new ol.interaction.Draw(options);
		
		this.interaction.on("drawend", function(event) {
			if(!endEventType)
				return;
			
			var WPGMZAEvent = new WPGMZA.Event(endEventType);
			
			switch(mode)
			{
				case WPGMZA.DrawingManager.MODE_POLYGON:
					WPGMZAEvent.enginePolygon = event.feature;
					break;
					
				case WPGMZA.DrawingManager.MODE_POLYLINE:
					WPGMZAEvent.enginePolyline = event.feature;
					break;
				
				case WPGMZA.DrawingManager.MODE_CIRCLE:
					WPGMZAEvent.engineCircle = event.feature;
					break;
				
				case WPGMZA.DrawingManager.MODE_RECTANGLE:
					WPGMZAEvent.engineRectangle = event.feature;
					break;
				case WPGMZA.DrawingManager.MODE_IMAGEOVERLAY:
					WPGMZAEvent.engineImageoverlay = {
						engineRectangle : event.feature
					};
					break;
					
				default:
					throw new Error("Drawing mode not implemented");
					break;
			}
			
			self.dispatchEvent(WPGMZAEvent);
		});
		
		this.map.olMap.addInteraction(this.interaction);
	}
	
});

// js/v8/open-layers/ol-feature.js
/**
 * @namespace WPGMZA
 * @module OLFeature
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.OLFeature = function(options)
	{
		WPGMZA.assertInstangeOf(this, "OLFeature");
		
		WPGMZA.Feature.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.OLFeature, WPGMZA.Feature);
	
	WPGMZA.OLFeature.getOLStyle = function(options)
	{
		var translated = {};
		
		if(!options)
			return new ol.style.Style();
		
		options = $.extend({}, options);
		
		// NB: Legacy name support
		var map = {
			"fillcolor":		"fillColor",
			"opacity":			"fillOpacity",
			"linecolor":		"strokeColor",
			"lineopacity":		"strokeOpacity",
			"linethickness":	"strokeWeight",
		};
		
		for(var name in options){
			if(name in map)
				options[map[name]] = options[name];
		}
		
		// Translate
		if(options.strokeColor){
			var opacity = 1.0;
			var weight = 1;
			
			if("strokeOpacity" in options)
				opacity = options.strokeOpacity;
			
			if("strokeWeight" in options)
				weight = options.strokeWeight;
			
			translated.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToString(options.strokeColor, opacity),
				width: weight
			});
		}
		
		if(options.fillColor){
			var opacity = 1.0;
			
			if("fillOpacity" in options)
				opacity = options.fillOpacity;
			
			var color = WPGMZA.hexOpacityToString(options.fillColor, opacity);
			
			translated.fill = new ol.style.Fill({
				color: color
			});
		}

		return new ol.style.Style(translated);
	}
	
	WPGMZA.OLFeature.setInteractionsOnFeature = function(feature, enable)
	{
		if(enable)
		{
			if(feature.modifyInteraction)
				return;
			
			feature.snapInteraction = new ol.interaction.Snap({
				source: feature.layer.getSource()
			});
			
			feature.map.olMap.addInteraction(feature.snapInteraction);
			
			feature.modifyInteraction = new ol.interaction.Modify({
				source: feature.layer.getSource()
			});
			
			feature.map.olMap.addInteraction(feature.modifyInteraction);
			
			feature.modifyInteraction.on("modifyend", function(event) {
				feature.trigger("change");
			});
			
			// NB: I believe this was causing issues with an older version of OpenLayers when two interactions were simultaneiously on, worth trying again.
			/*feature.translateInteraction = new ol.interaction.Translate({
				source: feature.layer.getSource()
			});
			
			feature.map.olMap.addInteraction(feature.translateInteraction);*/
		}
		else
		{
			if(!feature.modifyInteraction)
				return;
			
			if(feature.map)
			{
				feature.map.olMap.removeInteraction(feature.snapInteraction);
				feature.map.olMap.removeInteraction(feature.modifyInteraction);
				// feature.map.olMap.removeInteraction(feature.translateInteraction);
			}
			
			delete feature.snapInteraction;
			delete feature.modifyInteraction;
			// delete feature.translateInteraction;
		}
	}
	
});

// js/v8/open-layers/ol-geocoder.js
/**
 * @namespace WPGMZA
 * @module OLGeocoder
 * @requires WPGMZA.Geocoder
 */
jQuery(function($) {
	
	/**
	 * @class OLGeocoder
	 * @extends Geocoder
	 * @summary OpenLayers geocoder - uses Nominatim by default
	 */
	WPGMZA.OLGeocoder = function()
	{
		
	}
	
	WPGMZA.OLGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.OLGeocoder.prototype.constructor = WPGMZA.OLGeocoder;
	
	/**
	 * @function getResponseFromCache
	 * @access protected
	 * @summary Tries to retrieve cached coordinates from server cache
	 * @param {string} address The street address to geocode
	 * @param {function} callback Where to send the results, as an array
	 * @return {void}
	 */
	WPGMZA.OLGeocoder.prototype.getResponseFromCache = function(query, callback)
	{
		WPGMZA.restAPI.call("/geocode-cache", {
			data: {
				query: JSON.stringify(query)
			},
			success: function(response, xhr, status) {
				// Legacy compatibility support
				response.lng = response.lon;
				
				callback(response);
			},
			useCompressedPathVariable: true
		});
		
		/*$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_query_nominatim_cache",
				query: JSON.stringify(query)
			},
			success: function(response, xhr, status) {
				// Legacy compatibility support
				response.lng = response.lon;
				
				callback(response);
			}
		});*/
	}
	
	/**
	 * @function getResponseFromNominatim
	 * @access protected
	 * @summary Queries Nominatim on the specified address
	 * @param {object} options An object containing the options for geocoding, address is a mandatory field
	 * @param {function} callback The function to send the results to, as an array
	 */
	WPGMZA.OLGeocoder.prototype.getResponseFromNominatim = function(options, callback)
	{
		var data = {
			q: options.address,
			format: "json"
		};
		
		if(options.componentRestrictions && options.componentRestrictions.country){
			data.countrycodes = options.componentRestrictions.country;
		} else if(options.country){
			data.countrycodes = options.country;
		}
		
		$.ajax("https://nominatim.openstreetmap.org/search", {
			data: data,
			success: function(response, xhr, status) {
				callback(response);
			},
			error: function(response, xhr, status) {
				callback(null, WPGMZA.Geocoder.FAIL)
			}
		});
	}
	
	/**
	 * @function cacheResponse
	 * @access protected
	 * @summary Caches a response on the server, usually after it's been returned from Nominatim
	 * @param {string} address The street address
	 * @param {object|array} response The response to cache
	 * @returns {void}
	 */
	WPGMZA.OLGeocoder.prototype.cacheResponse = function(query, response)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_store_nominatim_cache",
				query: JSON.stringify(query),
				response: JSON.stringify(response)
			},
			method: "POST"
		});
	}

	/**
	 * @function clearCache
	 * @access protected
	 * @summary Clears the Nomanatim geocode cache
	 * @returns {void}
	 */
	WPGMZA.OLGeocoder.prototype.clearCache = function(callback)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_clear_nominatim_cache"
			},
			method: "POST",
			success: function(response){
				callback(response);
			}
		});
	}
	
	WPGMZA.OLGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		return WPGMZA.OLGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.OLGeocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		return WPGMZA.OLGeocoder.prototype.geocode(options, callback);
	}
	
	WPGMZA.OLGeocoder.prototype.geocode = function(options, callback)
	{
		var self = this;
		
		if(!options)
			throw new Error("Invalid options");
		
		if(WPGMZA.LatLng.REGEXP.test(options.address))
		{
			var latLng = WPGMZA.LatLng.fromString(options.address);
			
			callback([{
				geometry: {
					location: latLng
				},
				latLng: latLng,
				lat: latLng.lat,
				lng: latLng.lng
			}], WPGMZA.Geocoder.SUCCESS);
			
			return;
		}
		
		if(options.location)
			options.latLng = new WPGMZA.LatLng(options.location);
		
		var finish, location;
		
		if(options.address)
		{
			location = options.address;
			
			finish = function(response, status)
			{
				for(var i = 0; i < response.length; i++)
				{
					response[i].geometry = {
						location: new WPGMZA.LatLng({
							lat: parseFloat(response[i].lat),
							lng: parseFloat(response[i].lon)
						})
					};
					
					response[i].latLng = {
						lat: parseFloat(response[i].lat),
						lng: parseFloat(response[i].lon)
					};
					
					response[i].bounds = new WPGMZA.LatLngBounds(
						new WPGMZA.LatLng({
							lat: response[i].boundingbox[1],
							lng: response[i].boundingbox[2]
						}),
						new WPGMZA.LatLng({
							lat: response[i].boundingbox[0],
							lng: response[i].boundingbox[3]
						})
					);
					
					// Backward compatibility with old UGM
					response[i].lng = response[i].lon;
				}
				
				callback(response, status);
			}
		}
		else if(options.latLng)
		{
			location = options.latLng.toString();
			
			finish = function(response, status)
			{
				var address = response[0].display_name;

				if(options.fullResult){
					address = response[0];
				}
				
				callback([address], status);
			}
		}
		else
			throw new Error("You must supply either a latLng or address")
		
		var query = {location: location, options: options};
		this.getResponseFromCache(query, function(response) {
			if(response.length)
			{
				finish(response, WPGMZA.Geocoder.SUCCESS);
				return;
			}
			
			self.getResponseFromNominatim($.extend(options, {address: location}), function(response, status) {
				if(status == WPGMZA.Geocoder.FAIL)
				{
					callback(null, WPGMZA.Geocoder.FAIL);
					return;
				}
				
				if(response.length == 0)
				{
					callback([], WPGMZA.Geocoder.ZERO_RESULTS);
					return;
				}
				
				finish(response, WPGMZA.Geocoder.SUCCESS);
				
				self.cacheResponse(query, response);
			});
		});
	}
	
});

// js/v8/open-layers/ol-info-window.js
/**
 * @namespace WPGMZA
 * @module OLInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLInfoWindow = function(feature)
	{
		var self = this;
		
		Parent.call(this, feature);
		
		this.element = $("<div class='wpgmza-infowindow ol-info-window-container ol-info-window-plain'></div>")[0];
			
		$(this.element).on("click", ".ol-info-window-close", function(event) {
			self.close();
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.OLInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.OLInfoWindow.prototype.constructor = WPGMZA.OLInfoWindow;
	
	Object.defineProperty(WPGMZA.OLInfoWindow.prototype, "isPanIntoViewAllowed", {
		
		"get": function()
		{
			return true;
		}
		
	});
	
	/**
	 * Opens the info window
	 * TODO: This should take a feature, not an event
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.OLInfoWindow.prototype.open = function(map, feature)
	{
		var self = this;
		var latLng = feature.getPosition();

		if(!latLng){
			return false;
		}
		
		if(!Parent.prototype.open.call(this, map, feature)){
			return false;
		}
		
		// Set parent for events to bubble up
		this.parent = map;
		
		if(this.overlay)
			this.feature.map.olMap.removeOverlay(this.overlay);
			
		this.overlay = new ol.Overlay({
			element: this.element,
			stopEvent: true,
			insertFirst: true
		});
		
		this.overlay.setPosition(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		self.feature.map.olMap.addOverlay(this.overlay);
		
		$(this.element).show();
		
		this.setContent(this.content);
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			WPGMZA.getImageDimensions(feature.getIcon(), function(size) {
				
				$(self.element).css({left: Math.round(size.width / 2) + "px"});
				
			});
		}

		/* Apply scroll fix for OpenLayers */
		this.autoResize();
		
		this.trigger("infowindowopen");
		this.trigger("domready");
	}
	
	WPGMZA.OLInfoWindow.prototype.close = function(event)
	{
		
		if(!this.overlay)
			return;
		
		// TODO: Why? This shouldn't have to be here. Removing the overlay should hide the element (it doesn't)
		$(this.element).hide();
			
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.trigger("infowindowclose");
		
		this.feature.map.olMap.removeOverlay(this.overlay);
		this.overlay = null;
	}
	
	WPGMZA.OLInfoWindow.prototype.setContent = function(html)
	{
		Parent.prototype.setContent.call(this, html);
		
		this.content = html;
		var eaBtn = !WPGMZA.isProVersion() ? this.addEditButton() : '';
		$(this.element).html(eaBtn+"<i class='fa fa-times ol-info-window-close' aria-hidden='true'></i>" + html);
	}
	
	WPGMZA.OLInfoWindow.prototype.setOptions = function(options)
	{
		if(options.maxWidth){
			$(this.element).css({"max-width": options.maxWidth + "px"});
		}
	}
	
	WPGMZA.OLInfoWindow.prototype.onOpen = function()
	{
		var self = this;
		var imgs = $(this.element).find("img");
		var numImages = imgs.length;
		var numImagesLoaded = 0;
		
		WPGMZA.InfoWindow.prototype.onOpen.apply(this, arguments);

		let canAutoPan = true;

		/* Handle one shot auto pan disabler */
		if(typeof this.feature._osDisableAutoPan !== 'undefined'){
			if(this.feature._osDisableAutoPan){
				canAutoPan = false;
				this.feature._osDisableAutoPan = false;
			}
		}

		if(this.isPanIntoViewAllowed && canAutoPan)
		{
			function inside(el, viewport)
			{
				var a = $(el)[0].getBoundingClientRect();
				var b = $(viewport)[0].getBoundingClientRect();
				
				return a.left >= b.left && a.left <= b.right &&
						a.right <= b.right && a.right >= b.left &&
						a.top >= b.top && a.top <= b.bottom &&
						a.bottom <= b.bottom && a.bottom >= b.top;
			}
			
			function panIntoView()
			{
				var height	= $(self.element).height();
				var offset	= -(height + 180) * 0.45;
				
				self.feature.map.animateNudge(0, offset, self.feature.getPosition());
			}
			
			imgs.each(function(index, el) {
				el.onload = function() {
					if(++numImagesLoaded == numImages && !inside(self.element, self.feature.map.element))
						panIntoView();
				}
			});
			
			if(numImages == 0 && !inside(self.element, self.feature.map.element))
				panIntoView();
		}
	}

	WPGMZA.OLInfoWindow.prototype.autoResize = function(){
		/* Applies size maxes based on content and container, similar to scroll fix for Google Maps */
		$(this.element).css("max-height", 'none');

		if($(this.feature.map.element).length){
			const mapHeight = $(this.feature.map.element).height();
			const mapWidth = $(this.feature.map.element).width();

			const maxHeight = mapHeight - 180;
			if($(this.element).height() > maxHeight){
				$(this.element).css("max-height", maxHeight + "px");	
			}

			const maxWidth = mapWidth > 648 ? 648 : (mapWidth - 120);
			if($(this.element).width() > maxWidth){
				$(this.element).css("max-width", maxWidth + "px");	
			}
		}

	}
	
});

// js/v8/open-layers/ol-map.js
/**
 * @namespace WPGMZA
 * @module OLMap
 * @requires WPGMZA.Map
 * @pro-requires WPGMZA.ProMap
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element);
		
		this.setOptions(options);
		
		var viewOptions = this.settings.toOLViewOptions();
		
		$(this.element).html("");
		
		this.olMap = new ol.Map({
			target: $(element)[0],
			layers: [
				this.getTileLayer()
			],
			view: this.getTileView(viewOptions)
		});

		if(this.customTileMode){
			/* The system is in custom tile view mode */
			if(!(ol.extent.containsCoordinate(this.customTileModeExtent, this.olMap.getView().getCenter()))){
				const view = this.olMap.getView();

				view.setCenter(ol.extent.getCenter(this.customTileModeExtent));
				this.wrapLongitude();
				this.onBoundsChanged();
			}
		}
		
		// NB: Handles legacy checkboxes as well as new, standard controls
		function isSettingDisabled(value)
		{
			if(value === "yes")
				return true;
			
			return (value ? true : false);
		}
		
		// TODO: Re-implement using correct setting names
		// Interactions
		this.olMap.getInteractions().forEach(function(interaction) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive(
					!isSettingDisabled(self.settings.wpgmza_settings_map_draggable)
				);
			else if(interaction instanceof ol.interaction.DoubleClickZoom)
				interaction.setActive(
					!isSettingDisabled(self.settings.wpgmza_settings_map_clickzoom)
				);
			else if(interaction instanceof ol.interaction.MouseWheelZoom)
				interaction.setActive(
					!isSettingDisabled(self.settings.wpgmza_settings_map_scroll)
				);
			
		}, this);
		
		// Cooperative gesture handling
		if(!(this.settings.wpgmza_force_greedy_gestures == "greedy" || this.settings.wpgmza_force_greedy_gestures == "yes" || this.settings.wpgmza_force_greedy_gestures == true))
		{
			this.gestureOverlay = $("<div class='wpgmza-gesture-overlay'></div>")
			this.gestureOverlayTimeoutID = null;
			
			if(WPGMZA.isTouchDevice())
			{
				// On touch devices, require two fingers to drag and pan
				// NB: Temporarily removed due to inconsistent behaviour

				// Reintroduced: 9.0.0 -> We have made some changes to improve consistency 
				this.olMap.getInteractions().forEach(function(interaction) {
					
					if(interaction instanceof ol.interaction.DragPan)
						self.olMap.removeInteraction(interaction);
					
				});
				
				this.olMap.addInteraction(new ol.interaction.DragPan({
					
					condition: function(olBrowserEvent) {
						let allowed = false;
						let originalEvent = olBrowserEvent.originalEvent; 
						if(originalEvent instanceof PointerEvent){
							/* Handle this as a pointer */
							if(this.targetPointers && this.targetPointers.length){
								allowed = this.targetPointers.length == 2;
							}
						} else if (originalEvent instanceof TouchEvent){
							if(originalEvent.touches && originalEvent.touches.length){
								allowed = originalEvent.touches.length == 2;
							}
						}
						
						if(!allowed)
							self.showGestureOverlay();
						
						return allowed;
					}
					
				}));
				
				this.gestureOverlay.text(WPGMZA.localized_strings.use_two_fingers);
			}
			else
			{
				// On desktops, require Ctrl + zoom to zoom, show an overlay if that condition is not met
				this.olMap.on("wheel", function(event) {
					
					if(!ol.events.condition.platformModifierKeyOnly(event))
					{
						self.showGestureOverlay();

						// Allow the page to scroll normally by commenting this out 
						//event.originalEvent.preventDefault();
						
						return false;
					}
					
				});
				
				this.gestureOverlay.text(WPGMZA.localized_strings.use_ctrl_scroll_to_zoom);
			}
		}
		
		// Controls
		this.olMap.getControls().forEach(function(control) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(control instanceof ol.control.Zoom && WPGMZA.settings.wpgmza_settings_map_zoom == true)
				self.olMap.removeControl(control);
			
		}, this);
		
		if(!isSettingDisabled(WPGMZA.settings.wpgmza_settings_map_full_screen_control))
			this.olMap.addControl(new ol.control.FullScreen());
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			// Marker layer
			this.markerLayer = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: []
				})
			});
			this.olMap.addLayer(this.markerLayer);
			
			this.olMap.on("click", function(event) {
				var features = self.olMap.getFeaturesAtPixel(event.pixel);
				
				if(!features || !features.length)
					return;
				
				var marker = features[0].wpgmzaMarker;
					
				if(!marker){
					return;
				}
				
				marker.trigger("click");
				marker.trigger("select");
			});
		}
		
		// Listen for drag start
		this.olMap.on("movestart", function(event) {
			self.isBeingDragged = true;
		});
		
		// Listen for end of pan so we can wrap longitude if needs be
		this.olMap.on("moveend", function(event) {
			self.wrapLongitude();
			
			self.isBeingDragged = false;
			self.dispatchEvent("dragend");
			self.onIdle();
		});
		
		// Listen for zoom
		this.olMap.getView().on("change:resolution", function(event) {
			self.dispatchEvent("zoom_changed");
			self.dispatchEvent("zoomchanged");
			setTimeout(function() {
				self.onIdle();
			}, 10);
		});
		
		// Listen for bounds changing
		this.olMap.getView().on("change", function() {
			// Wrap longitude
			self.onBoundsChanged();
		});
		self.onBoundsChanged();
		
		// Hover interaction
		this._mouseoverNativeFeatures = [];
		
		this.olMap.on("pointermove", function(event) {
			
			if(event.dragging)
				return;
			
			try{
				var featuresUnderPixel = event.target.getFeaturesAtPixel(event.pixel);
			}catch(e) {
				// NB: Hacktacular.. An error is thrown when you mouse over a heatmap. See https://github.com/openlayers/openlayers/issues/10100. This was allegedly solved and merged in but seems to still be present in OpenLayers 6.4.3.
				return;
			}
			
			if(!featuresUnderPixel)
				featuresUnderPixel = [];
			
			var nativeFeaturesUnderPixel = [], i, props;
			
			for(i = 0; i < featuresUnderPixel.length; i++)
			{
				props = featuresUnderPixel[i].getProperties();
				
				if(!props.wpgmzaFeature)
					continue;
				
				nativeFeature = props.wpgmzaFeature;
				nativeFeaturesUnderPixel.push(nativeFeature);
				
				if(self._mouseoverNativeFeatures.indexOf(nativeFeature) == -1)
				{
					// Now hovering over this feature, when we weren't previously
					nativeFeature.trigger("mouseover");
					self._mouseoverNativeFeatures.push(nativeFeature);
				}
			}
				
			for(i = self._mouseoverNativeFeatures.length - 1; i >= 0; i--)
			{
				nativeFeature = self._mouseoverNativeFeatures[i];
				
				if(nativeFeaturesUnderPixel.indexOf(nativeFeature) == -1)
				{
					// No longer hovering over this feature, where we had been previously
					nativeFeature.trigger("mouseout");
					self._mouseoverNativeFeatures.splice(i, 1);
				}
			}
			
		});
		
		// Right click listener
		$(this.element).on("click contextmenu", function(event) {
			
			var isRight;
			event = event || window.event;

			var latLng = self.pixelsToLatLng(event.offsetX, event.offsetY);
			
			if("which" in event)
				isRight = event.which == 3;
			else if("button" in event)
				isRight = event.button == 2;
			
			if(event.which == 1 || event.button == 1){
				if(self.isBeingDragged)
					return;
				
				// Left click
				if($(event.target).closest(".ol-marker").length)
					return; // A marker was clicked, not the map. Do nothing

				/*
				 * User is clicking on the map, but looks like it was not a marker...
				 * 
				 * Finding a light at the end of the tunnel 
				*/
				try{
					if(self.element){
						const nestedCanvases = self.element.querySelectorAll('canvas');
						if(nestedCanvases.length > 1){
							const diff = (nestedCanvases[0].width  /  nestedCanvases[1].width);
							event.offsetX *= diff;
							event.offsetY *= diff;
						}
					}

					var featuresUnderPixel = self.olMap.getFeaturesAtPixel([event.offsetX, event.offsetY]);
				}catch(e) {
					return;
				}
				
				if(!featuresUnderPixel)
					featuresUnderPixel = [];
				
				var nativeFeaturesUnderPixel = [], i, props;
				for(i = 0; i < featuresUnderPixel.length; i++){
					props = featuresUnderPixel[i].getProperties();
					
					if(!props.wpgmzaFeature)
						continue;
					
					nativeFeature = props.wpgmzaFeature;
					nativeFeaturesUnderPixel.push(nativeFeature);
					
					nativeFeature.trigger("click");
				}

				if(featuresUnderPixel.length > 0){
					/*
					 * This is for a pixel interpolated feature, like polygons
					 *
					 * Let's return early, to avoid double event firing
					*/
					return;
				}

				if(event.target instanceof HTMLCanvasElement){
					/* Only trigger if this is the canvas element directly */
					self.trigger({
						type: "click",
						latLng: latLng
					});
				}
				
				return;
			}
			
			if(!isRight){
				return;
			}
			
			return self.onRightClick(event);
		});
		
		// Dispatch event
		if(!WPGMZA.isProVersion())
		{
			this.trigger("init");
			
			this.dispatchEvent("created");
			WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
			
			// Legacy event
			$(this.element).trigger("wpgooglemaps_loaded");
		}
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMap;
	else
		Parent = WPGMZA.Map;
	
	WPGMZA.OLMap.prototype = Object.create(Parent.prototype);
	WPGMZA.OLMap.prototype.constructor = WPGMZA.OLMap;
	
	WPGMZA.OLMap.prototype.getTileLayer = function()
	{
		var options = {};
		
		if(WPGMZA.settings.tile_server_url){
			options.url = WPGMZA.settings.tile_server_url;

			if(WPGMZA.settings.tile_server_url === 'custom_override'){
				if(WPGMZA.settings.tile_server_url_override && WPGMZA.settings.tile_server_url_override.trim() !== ""){
					options.url = WPGMZA.settings.tile_server_url_override.trim();
				} else {
					//Override attempt, let's default?
					options.url = "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png";
				}
			}

			if(WPGMZA.settings.open_layers_api_key && WPGMZA.settings.open_layers_api_key !== ""){
				options.url += "?apikey=" + WPGMZA.settings.open_layers_api_key.trim();
			}
		}

		if(this.settings && this.settings.custom_tile_enabled){
			if(this.settings.custom_tile_image_width && this.settings.custom_tile_image_height){
				let width = parseInt(this.settings.custom_tile_image_width);
				let height = parseInt(this.settings.custom_tile_image_height);

				let imageDimensions = null; //autodetect
				try{
					if(window.devicePixelRatio && window.devicePixelRatio != 1){
						/* For retina displays, lets multiple the target dimensions, with the devicePixelRatio */
						/* Updated 2022-07-07: Was unreliable, moved to setting manual dimensions */
						/*
						width *= window.devicePixelRatio;
						height *= window.devicePixelRatio;
						*/
						imageDimensions = [width, height];
					}
				} catch (ex){
					/* Do nothing */
				}

				if(this.settings.custom_tile_image){
					const extent = [0, 0, width, height];
		
					const projection = new ol.proj.Projection({
						code: 'custom-tile-map',
						units: 'pixels',
						extent: extent
					});

					return new ol.layer.Image({
						source: new ol.source.ImageStatic({
							attributions: this.settings.custom_tile_image_attribution ? this.settings.custom_tile_image_attribution : '©',
							url: this.settings.custom_tile_image,
							projection: projection,
							imageExtent: extent,
							imageSize: imageDimensions
						})
					});
				}
			}
		}
		
		return new ol.layer.Tile({
			source: new ol.source.OSM(options)
		});
	}

	WPGMZA.OLMap.prototype.getTileView = function(viewOptions){
		if(this.settings && this.settings.custom_tile_enabled){
			if(this.settings.custom_tile_image_width && this.settings.custom_tile_image_height){
				const width = parseInt(this.settings.custom_tile_image_width);
				const height = parseInt(this.settings.custom_tile_image_height);
				
				if(this.settings.custom_tile_image){
					const extent = [0, 0, width, height];
		
					const projection = new ol.proj.Projection({
						code: 'custom-tile-map',
						units: 'pixels',
						extent: extent
					});

					viewOptions.projection = projection;

					this.customTileModeExtent = extent;
					this.customTileMode = true;
				}
			}
		}
		return new ol.View(viewOptions)
	}
	
	WPGMZA.OLMap.prototype.wrapLongitude = function()
	{
		var transformed = ol.proj.transform(this.olMap.getView().getCenter(), "EPSG:3857", "EPSG:4326");
		var center = {
			lat: transformed[1],
			lng: transformed[0]
		};
		
		if(center.lng >= -180 && center.lng <= 180)
			return;
		
		center.lng = center.lng - 360 * Math.floor(center.lng / 360);
		
		if(center.lng > 180)
			center.lng -= 360;
		
		this.setCenter(center);
	}
	
	WPGMZA.OLMap.prototype.getCenter = function()
	{
		var lonLat = ol.proj.toLonLat(
			this.olMap.getView().getCenter()
		);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	WPGMZA.OLMap.prototype.setCenter = function(latLng)
	{
		var view = this.olMap.getView();
		
		WPGMZA.Map.prototype.setCenter.call(this, latLng);
		
		view.setCenter(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		
		this.wrapLongitude();

		this.onBoundsChanged();
	}
	
	WPGMZA.OLMap.prototype.getBounds = function()
	{
		var bounds = this.olMap.getView().calculateExtent(this.olMap.getSize());
		var nativeBounds = new WPGMZA.LatLngBounds();
		
		var topLeft = ol.proj.toLonLat([bounds[0], bounds[1]]);
		var bottomRight = ol.proj.toLonLat([bounds[2], bounds[3]]);
		
		nativeBounds.north = topLeft[1];
		nativeBounds.south = bottomRight[1];
		
		nativeBounds.west = topLeft[0];
		nativeBounds.east = bottomRight[0];
		
		return nativeBounds;
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	WPGMZA.OLMap.prototype.fitBounds = function(southWest, northEast)
	{
		if(southWest instanceof WPGMZA.LatLng)
			southWest = {lat: southWest.lat, lng: southWest.lng};
		if(northEast instanceof WPGMZA.LatLng)
			northEast = {lat: northEast.lat, lng: northEast.lng};
		else if(southWest instanceof WPGMZA.LatLngBounds)
		{
			var bounds = southWest;
			
			southWest = {
				lat: bounds.south,
				lng: bounds.west
			};
			
			northEast = {
				lat: bounds.north,
				lng: bounds.east
			};
		}
		
		var view = this.olMap.getView();
		
		var extent = ol.extent.boundingExtent([
			ol.proj.fromLonLat([
				parseFloat(southWest.lng),
				parseFloat(southWest.lat)
			]),
			ol.proj.fromLonLat([
				parseFloat(northEast.lng),
				parseFloat(northEast.lat)
			])
		]);
		view.fit(extent, this.olMap.getSize());
	}
	
	WPGMZA.OLMap.prototype.panTo = function(latLng, zoom)
	{
		var view = this.olMap.getView();
		var options = {
			center: ol.proj.fromLonLat([
				parseFloat(latLng.lng),
				parseFloat(latLng.lat),
			]),
			duration: 500
		};
		
		if(arguments.length > 1)
			options.zoom = parseInt(zoom);
		
		view.animate(options);
	}
	
	WPGMZA.OLMap.prototype.getZoom = function()
	{
		return Math.round( this.olMap.getView().getZoom() );
	}
	
	WPGMZA.OLMap.prototype.setZoom = function(value)
	{
		this.olMap.getView().setZoom(value);
	}
	
	WPGMZA.OLMap.prototype.getMinZoom = function()
	{
		return this.olMap.getView().getMinZoom();
	}
	
	WPGMZA.OLMap.prototype.setMinZoom = function(value)
	{
		this.olMap.getView().setMinZoom(value);
	}
	
	WPGMZA.OLMap.prototype.getMaxZoom = function()
	{
		return this.olMap.getView().getMaxZoom();
	}
	
	WPGMZA.OLMap.prototype.setMaxZoom = function(value)
	{
		this.olMap.getView().setMaxZoom(value);
	}
	
	WPGMZA.OLMap.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		if(!this.olMap)
			return;
		
		this.olMap.getView().setProperties( this.settings.toOLViewOptions() );
	}
	
	/**
	 * TODO: Consider moving all these functions to their respective classes, same on google map (DO IT!!! It's very misleading having them here)
	 */
	WPGMZA.OLMap.prototype.addMarker = function(marker)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT)
			this.olMap.addOverlay(marker.overlay);
		else
		{
			this.markerLayer.getSource().addFeature(marker.feature);
			marker.featureInSource = true;
		}
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	WPGMZA.OLMap.prototype.removeMarker = function(marker)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT)
			this.olMap.removeOverlay(marker.overlay);
		else
		{
			this.markerLayer.getSource().removeFeature(marker.feature);
			marker.featureInSource = false;
		}
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	WPGMZA.OLMap.prototype.addPolygon = function(polygon)
	{
		this.olMap.addLayer(polygon.layer);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	WPGMZA.OLMap.prototype.removePolygon = function(polygon)
	{
		this.olMap.removeLayer(polygon.layer);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	WPGMZA.OLMap.prototype.addPolyline = function(polyline)
	{
		this.olMap.addLayer(polyline.layer);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	WPGMZA.OLMap.prototype.removePolyline = function(polyline)
	{
		this.olMap.removeLayer(polyline.layer);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	WPGMZA.OLMap.prototype.addCircle = function(circle)
	{
		this.olMap.addLayer(circle.layer);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	WPGMZA.OLMap.prototype.removeCircle = function(circle)
	{
		this.olMap.removeLayer(circle.layer);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	WPGMZA.OLMap.prototype.addRectangle = function(rectangle)
	{
		this.olMap.addLayer(rectangle.layer);
		
		Parent.prototype.addRectangle.call(this, rectangle);
	}
	
	WPGMZA.OLMap.prototype.removeRectangle = function(rectangle)
	{
		this.olMap.removeLayer(rectangle.layer);
		
		Parent.prototype.removeRectangle.call(this, rectangle);
	}
	
	WPGMZA.OLMap.prototype.pixelsToLatLng = function(x, y)
	{
		if(y == undefined)
		{
			if("x" in x && "y" in x)
			{
				y = x.y;
				x = x.x;
			}
			else
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
		}
		
		var coord = this.olMap.getCoordinateFromPixel([x, y]);
		
		if(!coord)
			return {
				x: null,
				y: null
			};
		
		var lonLat = ol.proj.toLonLat(coord);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	WPGMZA.OLMap.prototype.latLngToPixels = function(latLng)
	{
		var coord = ol.proj.fromLonLat([latLng.lng, latLng.lat]);
		var pixel = this.olMap.getPixelFromCoordinate(coord);
		
		if(!pixel)
			return {
				x: null,
				y: null
			};
		
		return {
			x: pixel[0],
			y: pixel[1]
		};
	}
	
	WPGMZA.OLMap.prototype.enableBicycleLayer = function(value)
	{
		if(value)
		{
			if(!this.bicycleLayer)
				this.bicycleLayer = new ol.layer.Tile({
					source: new ol.source.OSM({
						url: "http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
					})
				});
				
			this.olMap.addLayer(this.bicycleLayer);
		}
		else
		{
			if(!this.bicycleLayer)
				return;
			
			this.olMap.removeLayer(this.bicycleLayer);
		}
	}
	
	WPGMZA.OLMap.prototype.showGestureOverlay = function()
	{
		var self = this;
		
		clearTimeout(this.gestureOverlayTimeoutID);
		
		$(this.gestureOverlay).stop().animate({opacity: "100"});
		$(this.element).append(this.gestureOverlay);
		
		$(this.gestureOverlay).css({
			"line-height":	$(this.element).height() + "px",
			"opacity":		"1.0"
		});
		$(this.gestureOverlay).show();
		
		this.gestureOverlayTimeoutID = setTimeout(function() {
			self.gestureOverlay.fadeOut(2000);
		}, 2000);
	}
	
	WPGMZA.OLMap.prototype.onElementResized = function(event)
	{
		this.olMap.updateSize();
	}
	
	WPGMZA.OLMap.prototype.onRightClick = function(event)
	{
		if($(event.target).closest(".ol-marker, .wpgmza_modern_infowindow, .wpgmza-modern-store-locator").length)
			return true;
		
		var parentOffset = $(this.element).offset();
		var relX = event.pageX - parentOffset.left;
		var relY = event.pageY - parentOffset.top;
		var latLng = this.pixelsToLatLng(relX, relY);
		
		this.trigger({type: "rightclick", latLng: latLng});
		
		// Legacy event compatibility
		$(this.element).trigger({type: "rightclick", latLng: latLng});
		
		// Prevent menu
		event.preventDefault();
		return false;
	}

	WPGMZA.OLMap.prototype.enableAllInteractions = function()
	{	

		this.olMap.getInteractions().forEach(function(interaction) {
			
			if(interaction instanceof ol.interaction.DragPan || interaction instanceof ol.interaction.DoubleClickZoom || interaction instanceof ol.interaction.MouseWheelZoom)
			{
				interaction.setActive(true);
			}
			
		}, this);

	}
	
});


// js/v8/open-layers/ol-marker.js
/**
 * @namespace WPGMZA
 * @module OLMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLMarker = function(options)
	{
		var self = this;
		
		Parent.call(this, options);
		
		var settings = {};
		if(options)
		{
			for(var name in options)
			{
				if(options[name] instanceof WPGMZA.LatLng)
				{
					settings[name] = options[name].toLatLngLiteral();
				}
				else if(options[name] instanceof WPGMZA.Map)
				{
					// Do nothing (ignore)
				}
				else
					settings[name] = options[name];
			}
		}

		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT)
		{
			var img = $("<img alt=''/>")[0];
			img.onload = function(event) {
				self.updateElementHeight();
				if(self.map)
					self.map.olMap.updateSize();
			}
			img.src = WPGMZA.defaultMarkerIcon;
			
			this.element = $("<div class='ol-marker'></div>")[0];
			this.element.appendChild(img);
			
			this.element.wpgmzaMarker = this;
			
			$(this.element).on("mouseover", function(event) {
				self.dispatchEvent("mouseover");
			});

			$(this.element).on("mouseout", function(event) {
				self.dispatchEvent("mouseout");
			});
			
			this.overlay = new ol.Overlay({
				element: this.element,
				position: origin,
				positioning: "bottom-center",
				stopEvent: false
			});
			this.overlay.setPosition(origin);
			
			if(this.animation)
				this.setAnimation(this.animation);
			else if(this.anim)	// NB: Code to support old name
				this.setAnimation(this.anim);
			
			if(options)
			{
				if(options.draggable)
					this.setDraggable(true);
			}
			
			this.rebindClickListener();
		}
		else if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			this.feature = new ol.Feature({
				geometry: new ol.geom.Point(origin)
			});
			
			this.feature.setStyle(this.getVectorLayerStyle());
			this.feature.wpgmzaMarker = this;
			this.feature.wpgmzaFeature = this;
		}
		else
			throw new Error("Invalid marker render mode");
		
		this.setOptions(settings);
		this.trigger("init");
	}
	
	// NB: Does not presently inherit OLFeature, which it probably should
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	
	WPGMZA.OLMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.OLMarker.prototype.constructor = WPGMZA.OLMarker;
	
	WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT		= "element";
	WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER		= "vector";	// NB: This feature is experimental
	
	WPGMZA.OLMarker.renderMode = WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT;
	
	if(WPGMZA.settings.engine == "open-layers" && WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
	{
		WPGMZA.OLMarker.defaultVectorLayerStyle = new ol.style.Style({
			image: new ol.style.Icon({
				anchor: [0.5, 1],
				src: WPGMZA.defaultMarkerIcon
			})
		});
		
		WPGMZA.OLMarker.hiddenVectorLayerStyle = new ol.style.Style({});
	}
	
	WPGMZA.OLMarker.prototype.getVectorLayerStyle = function()
	{
		if(this.vectorLayerStyle)
			return this.vectorLayerStyle;
		
		return WPGMZA.OLMarker.defaultVectorLayerStyle;
	}
	
	WPGMZA.OLMarker.prototype.updateElementHeight = function(height, calledOnFocus)
	{
		var self = this;
		
		if(!height)
			height = $(this.element).find("img").height();
		
		if(height == 0 && !calledOnFocus)
		{
			$(window).one("focus", function(event) {
				self.updateElementHeight(false, true);
			});
		}
		
		$(this.element).css({height: height + "px"});
	}
	
	WPGMZA.OLMarker.prototype.addLabel = function()
	{
		this.setLabel(this.getLabelText());
	}
	
	WPGMZA.OLMarker.prototype.setLabel = function(label)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker labels are not currently supported in Vector Layer rendering mode");
			return;
		}
		
		if(!label)
		{
			if(this.label)
				$(this.element).find(".ol-marker-label").remove();
			
			return;
		}
		
		if(!this.label)
		{
			this.label = $("<div class='ol-marker-label'/>");
			$(this.element).append(this.label);
		}
		
		this.label.html(label);
	}
	
	WPGMZA.OLMarker.prototype.getVisible = function(visible)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			
		}
		else
			return this.overlay.getElement().style.display != "none";
	}
	
	WPGMZA.OLMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			if(visible)
			{
				var style = this.getVectorLayerStyle();
				this.feature.setStyle(style);
			}
			else
				this.feature.setStyle(null);
			
			/*var source = this.map.markerLayer.getSource();
			
			/*if(this.featureInSource == visible)
				return;
			
			if(visible)
				source.addFeature(this.feature);
			else
				source.removeFeature(this.feature);
			
			this.featureInSource = visible;*/
		}
		else
			this.overlay.getElement().style.display = (visible ? "block" : "none");
	}
	
	WPGMZA.OLMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
	
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
			this.feature.setGeometry(new ol.geom.Point(origin));
		else
			this.overlay.setPosition(origin);
	}
	
	WPGMZA.OLMarker.prototype.updateOffset = function(x, y)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker offset is not currently supported in Vector Layer rendering mode");
			return;
		}
		
		var x = this._offset.x;
		var y = this._offset.y;
		
		this.element.style.position = "relative";
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
	}
	
	WPGMZA.OLMarker.prototype.setAnimation = function(anim)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker animation is not currently supported in Vector Layer rendering mode");
			return;
		}
		
		Parent.prototype.setAnimation.call(this, anim);
		
		switch(anim)
		{
			case WPGMZA.Marker.ANIMATION_NONE:
				$(this.element).removeAttr("data-anim");
				break;
			
			case WPGMZA.Marker.ANIMATION_BOUNCE:
				$(this.element).attr("data-anim", "bounce");
				break;
			
			case WPGMZA.Marker.ANIMATION_DROP:
				$(this.element).attr("data-anim", "drop");
				break;
		}
	}
	
	WPGMZA.OLMarker.prototype.setDraggable = function(draggable)
	{
		var self = this;
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker dragging is not currently supported in Vector Layer rendering mode");
			return;
		}
		
		if(draggable)
		{
			var options = {
				disabled: false
			};
			
			if(!this.jQueryDraggableInitialized)
			{
				options.start = function(event) {
					self.onDragStart(event);
				}
				
				options.stop = function(event) {
					self.onDragEnd(event);
				};
			}
			
			try{
				$(this.element).draggable(options);
				this.jQueryDraggableInitialized = true;
				
				this.rebindClickListener();
			} catch (ex){
				/* Draggable not available */
			}
		}
		else
			$(this.element).draggable({disabled: true});
	}
	
	WPGMZA.OLMarker.prototype.setOpacity = function(opacity)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker opacity is not currently supported in Vector Layer rendering mode");
			return;
		}
		
		$(this.element).css({opacity: opacity});
	}
	
	WPGMZA.OLMarker.prototype.onDragStart = function(event)
	{
		this.isBeingDragged = true;
		
		this.map.olMap.getInteractions().forEach(function(interaction) {
			
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive(false);
			
		});
	}
	
	WPGMZA.OLMarker.prototype.onDragEnd = function(event)
	{
		var self = this;
		var offset = {
			top:	parseFloat( $(this.element).css("top").match(/-?\d+/)[0] ),
			left:	parseFloat( $(this.element).css("left").match(/-?\d+/)[0] )
		};
		
		$(this.element).css({
			top: 	"0px",
			left: 	"0px"
		});
		
		var currentLatLng 		= this.getPosition();
		var pixelsBeforeDrag 	= this.map.latLngToPixels(currentLatLng);
		var pixelsAfterDrag		= {
			x: pixelsBeforeDrag.x + offset.left,
			y: pixelsBeforeDrag.y + offset.top
		};
		var latLngAfterDrag		= this.map.pixelsToLatLng(pixelsAfterDrag);
		
		this.setPosition(latLngAfterDrag);
		
		this.isBeingDragged = false;
		this.trigger({type: "dragend", latLng: latLngAfterDrag});

		this.trigger("change");
		
		// NB: "yes" represents disabled
		if(this.map.settings.wpgmza_settings_map_draggable != "yes")
			this.map.olMap.getInteractions().forEach(function(interaction) {
				
				if(interaction instanceof ol.interaction.DragPan)
					interaction.setActive(true);
				
			});
	}
	
	WPGMZA.OLMarker.prototype.onElementClick = function(event)
	{
		var self = event.currentTarget.wpgmzaMarker;
		
		if(self.isBeingDragged)
			return; // Don't dispatch click event after a drag
		
		self.dispatchEvent("click");
		self.dispatchEvent("select");
	}
	
	/**
	 * Binds / rebinds the click listener. This must be bound after draggable is initialized,
	 * this solves the click listener firing before dragend
	 */
	WPGMZA.OLMarker.prototype.rebindClickListener = function()
	{
		$(this.element).off("click", this.onElementClick);
		$(this.element).on("click", this.onElementClick);
	}
	
});

// js/v8/open-layers/ol-modern-store-locator-circle.js
/**
 * @namespace WPGMZA
 * @module OLModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 */
jQuery(function($) {
	
	WPGMZA.OLModernStoreLocatorCircle = function(map, settings)
	{
		WPGMZA.ModernStoreLocatorCircle.call(this, map, settings);
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype = Object.create(WPGMZA.ModernStoreLocatorCircle.prototype);
	WPGMZA.OLModernStoreLocatorCircle.prototype.constructor = WPGMZA.OLModernStoreLocatorCircle;
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		var mapElement = $(this.map.element);
		var olViewportElement = mapElement.children(".ol-viewport");
		
		this.canvas = document.createElement("canvas");
		this.canvas.className = "wpgmza-ol-canvas-overlay";
		olViewportElement.find('.ol-layers .ol-layer:first-child').prepend(this.canvas);
		
		this.renderFunction = function(event) {
			
			if(self.canvas.width != olViewportElement.width() || self.canvas.height != olViewportElement.height())
			{
				self.canvas.width = olViewportElement.width();
				self.canvas.height = olViewportElement.height();
				
				$(this.canvas).css({
					width: olViewportElement.width() + "px",
					height: olViewportElement.height() + "px"
				});
			}
			
			self.draw();
		};
		
		this.map.olMap.on("postrender", this.renderFunction);
	}

	WPGMZA.OLModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvas.getContext(type);
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvas.width,
			height: this.canvas.height
		};
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = this.map.latLngToPixels(this.settings.center);
		
		return center;
	}
		
	WPGMZA.OLModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		return {
			x: 0,
			y: 0
		};
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var center = new WPGMZA.LatLng(this.settings.center);
		var outer = new WPGMZA.LatLng(center);
		
		outer.moveByDistance(km, 90);
		
		var centerPixels = this.map.latLngToPixels(center);
		var outerPixels = this.map.latLngToPixels(outer);
		
		return Math.abs(outerPixels.x - centerPixels.x);

		/*if(!window.testMarker){
			window.testMarker = WPGMZA.Marker.createInstance({
				position: outer
			});
			WPGMZA.maps[0].addMarker(window.testMarker);
		}
		
		return 100;*/
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getScale = function()
	{
		return 1;
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.destroy = function()
	{
		$(this.canvas).remove();
		
		this.map.olMap.un("postrender", this.renderFunction);
		this.map = null;
		this.canvas = null;
	}
	
});

// js/v8/open-layers/ol-modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module OLModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 */
jQuery(function($) {
	
	WPGMZA.OLModernStoreLocator = function(map_id)
	{
		var element;
		
		WPGMZA.ModernStoreLocator.call(this, map_id);
		
		if(WPGMZA.isProVersion())
			element = $(".wpgmza_map[data-map-id='" + map_id + "']");
		else
			element = $("#wpgmza_map");
		
		element.append(this.element);
	}
	
	WPGMZA.OLModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator);
	WPGMZA.OLModernStoreLocator.prototype.constructor = WPGMZA.OLModernStoreLocator;
	
});

// js/v8/open-layers/ol-pointlabel.js
/**
 * @namespace WPGMZA
 * @module OLPointlabel
 * @requires WPGMZA.Text
 * @requires WPGMZA.Pointlabel
 * @pro-requires WPGMZA.ProPointlabel
 */
jQuery(function($) {
	var Parent = WPGMZA.Pointlabel;

	WPGMZA.OLPointlabel = function(options, pointFeature){
		Parent.call(this, options, pointFeature);

		if(pointFeature && pointFeature.textFeature){
			this.textFeature = pointFeature.textFeature;
		} else {
			this.textFeature = new WPGMZA.Text.createInstance({
				text: "",
				map: this.map,
				position: this.getPosition()
			});
		}
		this.updateNativeFeature();
	}

	if(WPGMZA.isProVersion()){
	 	Parent = WPGMZA.ProPointlabel;
	} else {
		Parent = WPGMZA.Pointlabel
	}

	WPGMZA.extend(WPGMZA.OLPointlabel, Parent);

	WPGMZA.OLPointlabel.prototype.updateNativeFeature = function(){
		var options = this.getScalarProperties();

		if(options.name){
			this.textFeature.setText(options.name);
		}

		this.textFeature.refresh();
	}
});
		

// js/v8/open-layers/ol-polygon.js
/**
 * @namespace WPGMZA
 * @module OLPolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolygon = function(options, olFeature)
	{
		var self = this;
		
		Parent.call(this, options, olFeature);
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [[]];
			
			if(options && options.polydata)
			{
				var paths = this.parseGeometry(options.polydata);
				
				// NB: We have to close the polygon in OpenLayers for the edit interaction to pick up on the last edge
				for(var i = 0; i <= paths.length; i++)
					coordinates[0].push(ol.proj.fromLonLat([
						parseFloat(paths[i % paths.length].lng),
						parseFloat(paths[i % paths.length].lat)
					]));
			}
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			})
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolygon: this,
			wpgmzaFeature: this
		});
		
		if(options)
			this.setOptions(options);
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
	
	WPGMZA.OLPolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolygon.prototype.constructor = WPGMZA.OLPolygon;
	
	WPGMZA.OLPolygon.prototype.getGeometry = function()
	{
		var coordinates = this.olFeature.getGeometry().getCoordinates()[0];
		var result = [];
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.push(latLng);
		}
		
		return result;
	}
	
	WPGMZA.OLPolygon.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
});

// js/v8/open-layers/ol-polyline.js
/**
 * @namespace WPGMZA
 * @module OLPolyline
 * @requires WPGMZA.Polyline
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolyline = function(options, olFeature)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, options);
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [];
			
			if(options && options.polydata)
			{
				var path = this.parseGeometry(options.polydata);
				
				for(var i = 0; i < path.length; i++)
				{
					if(!(WPGMZA.isNumeric(path[i].lat)))
						throw new Error("Invalid latitude");
					
					if(!(WPGMZA.isNumeric(path[i].lng)))
						throw new Error("Invalid longitude");
					
					coordinates.push(ol.proj.fromLonLat([
						parseFloat(path[i].lng),
						parseFloat(path[i].lat)
					]));
				}
			}
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.LineString(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			})
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolyline: this,
			wpgmzaFeature: this
		});
		
		if(options)
			this.setOptions(options);
	}
	
	Parent = WPGMZA.Polyline;
		
	WPGMZA.OLPolyline.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolyline.prototype.constructor = WPGMZA.OLPolyline;
	
	WPGMZA.OLPolyline.prototype.getGeometry = function()
	{
		var result = [];
		var coordinates = this.olFeature.getGeometry().getCoordinates();
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.push(latLng);
		}
		
		return result;
	}
	
	WPGMZA.OLPolyline.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
});

// js/v8/open-layers/ol-rectangle.js
/**
 * @namespace WPGMZA
 * @module OLRectangle
 * @requires WPGMZA.Rectangle
 * @pro-requires WPGMZA.ProRectangle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Rectangle;

	
	WPGMZA.OLRectangle = function(options, olFeature)
	{
		var self = this;
		
		Parent.apply(this, arguments);
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [[]];
			
			if(options.cornerA && options.cornerB)
			{
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerA.lng),
					parseFloat(options.cornerA.lat)
				]));
				
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerB.lng),
					parseFloat(options.cornerA.lat)
				]));
				
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerB.lng),
					parseFloat(options.cornerB.lat)
				]));
				
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerA.lng),
					parseFloat(options.cornerB.lat)
				]));
				
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerA.lng),
					parseFloat(options.cornerA.lat)
				]));
			}
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style: this.olStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaRectangle: this,
			wpgmzaFeature: this
		});
		
		if(options)
			this.setOptions(options);
	}
	

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProRectangle;
	
	WPGMZA.extend(WPGMZA.OLRectangle, Parent);
	
	// NB: Would be nice to move this onto OLFeature
	WPGMZA.OLRectangle.prototype.getBounds = function()
	{
		var extent				= this.olFeature.getGeometry().getExtent();
		var topLeft				= ol.extent.getTopLeft(extent);
		var bottomRight			= ol.extent.getBottomRight(extent);
		
		var topLeftLonLat		= ol.proj.toLonLat(topLeft);
		var bottomRightLonLat	= ol.proj.toLonLat(bottomRight);
		
		var topLeftLatLng		= new WPGMZA.LatLng(topLeftLonLat[1], topLeftLonLat[0]);
		var bottomRightLatLng	= new WPGMZA.LatLng(bottomRightLonLat[1], bottomRightLonLat[0]);
		
		return new WPGMZA.LatLngBounds(
			topLeftLatLng,
			bottomRightLatLng
		);
	}
	
	WPGMZA.OLRectangle.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
});

// js/v8/open-layers/ol-text.js
/**
 * @namespace WPGMZA
 * @module OLText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.OLText = function(options){
		WPGMZA.Text.apply(this, arguments);

		this.overlay = new WPGMZA.OLTextOverlay(options);
	}

	WPGMZA.extend(WPGMZA.OLText, WPGMZA.Text);

	WPGMZA.OLText.prototype.refresh = function(){
		/* Only for OL */
		if(this.overlay){
			this.overlay.refresh();
		}
	}
});

// js/v8/open-layers/ol-text-overlay.js
/**
 * @namespace WPGMZA
 * @module OLTextOverlay
 * @requires WPGMZA.OLText
 */
jQuery(function($) {
	
	WPGMZA.OLTextOverlay = function(options){
		if(!options.position || !options.map) {
			return;
		}

		let self = this;

		let coords = ol.proj.fromLonLat([
				options.position.lng,
				options.position.lat
		]);

		this.olFeature = new ol.Feature({
			geometry: new ol.geom.Point(coords)
		});

		this.styleOptions = (!options) ? {} : options;

		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style : this.getStyle()
		});

		this.layer.setZIndex(10);

		options.map.olMap.addLayer(this.layer);
	}

	WPGMZA.OLTextOverlay.prototype.getStyle = function(){
		let defaults = {
			fontSize : 11,
			fillColor : "#000000",
			strokeColor : "#ffffff"
		};

		for(let i in defaults){
			if(typeof this.styleOptions[i] === 'undefined'){
				this.styleOptions[i] = defaults[i]
			}
		}

		let labelStyles = new ol.style.Style({
			text: new ol.style.Text({
		    	font: 'bold ' + this.styleOptions.fontSize + 'px "Open Sans", "Arial Unicode MS", "sans-serif"',
		    	placement: 'point',
		    	fill: new ol.style.Fill({
		      		color: this.styleOptions.fillColor,
		    	}),
		    	stroke: new ol.style.Stroke({
		      		color: this.styleOptions.strokeColor,
		      		width: 1
		    	}),
		  	})
		});

		labelStyles.getText().setText(this.styleOptions.text || "");

		return labelStyles;
	}

	WPGMZA.OLTextOverlay.prototype.refresh = function(){
		if(this.layer){
			this.layer.setStyle(this.getStyle());
		}
	}

	WPGMZA.OLTextOverlay.prototype.setPosition = function(position){
		if(this.olFeature){
			let origin = ol.proj.fromLonLat([
				parseFloat(position.lng),
				parseFloat(position.lat)
			]);

			this.olFeature.setGeometry(new ol.geom.Point(origin));
		}
	}

	WPGMZA.OLTextOverlay.prototype.setText = function(text){
		this.styleOptions.text = text;
	}

	WPGMZA.OLTextOverlay.prototype.setFontSize = function(size){
		size = parseInt(size);
		this.styleOptions.fontSize = size;
	}

	WPGMZA.OLTextOverlay.prototype.setFillColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;


		this.styleOptions.fillColor = color;
	}

	WPGMZA.OLTextOverlay.prototype.setLineColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;

		this.styleOptions.strokeColor = color
	}

	WPGMZA.OLTextOverlay.prototype.setOpacity = function(opacity){
		opacity = parseFloat(opacity);

		if(opacity > 1){
			opacity = 1;
		} else if (opacity < 0){
			opacity = 0;
		}

		if(this.layer){
			this.layer.setOpacity(opacity);
		}
	}

	
	WPGMZA.OLTextOverlay.prototype.remove = function(){
		if(this.styleOptions.map){
			this.styleOptions.map.olMap.removeLayer(this.layer);
		}
	}
	
});

// js/v8/open-layers/ol-theme-editor.js
/**
 * @namespace WPGMZA
 * @module OLThemeEditor
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.OLThemeEditor = function()
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.element = $("#wpgmza-ol-theme-editor");
		
		if(!this.element.length){
			console.warn("No element to initialise theme editor on");
			return;
		}

		this.mapElement = WPGMZA.maps[0].element;

		$(this.element).find('input[name="wpgmza_ol_tile_filter"]').on('change', function(event){
			self.onFilterChange(event.currentTarget);
		});	
	}
	
	WPGMZA.extend(WPGMZA.OLThemeEditor, WPGMZA.EventDispatcher);

	WPGMZA.OLThemeEditor.prototype.onFilterChange = function(context){
		if(context instanceof HTMLInputElement){
			const value = $(context).val();

			if(this.mapElement){
            	$(this.mapElement).css('--wpgmza-ol-tile-filter', value);
			}
		}
	}
});

// js/v8/open-layers/ol-theme-panel.js
/**
 * @namespace WPGMZA
 * @module OLThemePanel
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.OLThemePanel = function()
	{
		var self = this;
		
		this.element = $("#wpgmza-ol-theme-panel");
		this.map = WPGMZA.maps[0];
		
		if(!this.element.length)
		{
			console.warn("No element to initialise theme panel on");
			return;
		}
		
		this.element.on("click", "#wpgmza-theme-presets label, .theme-selection-panel label", function(event) {
			self.onThemePresetClick(event);
		});
		
		WPGMZA.OLThemePanel = this;
	}

	WPGMZA.OLThemePanel.prototype.onThemePresetClick = function(event){
		if(event.currentTarget){
			const element = $(event.currentTarget);
			const filter = element.data('filter');

			if(filter && $('input[name="wpgmza_ol_tile_filter"]').length){
				const input = $('input[name="wpgmza_ol_tile_filter"]').get(0);
				// $('input[name="wpgmza_ol_tile_filter"]').val(filter).trigger('change');

				if(input.wpgmzaCSSFilterInput){
					input.wpgmzaCSSFilterInput.parseFilters(filter);
				}
			}
		}
	}

});

// js/v8/tables/datatable.js
/**
 * @namespace WPGMZA
 * @module DataTable
 * @requires WPGMZA
 */
jQuery(function($) {

	WPGMZA.DataTable = function(element)
	{
		var self = this;
		if(!$.fn.dataTable)
		{
			console.warn("The dataTables library is not loaded. Cannot create a dataTable. Did you enable 'Do not enqueue dataTables'?");
			
			if(WPGMZA.settings.wpgmza_do_not_enqueue_datatables && WPGMZA.getCurrentPage() == WPGMZA.PAGE_MAP_EDIT)
				alert("You have selected 'Do not enqueue DataTables' in WP Go Maps' settings. No 3rd party software is loading the DataTables library. Because of this, the marker table cannot load. Please uncheck this option to use the marker table.");
			
			return;
		}
		
		if($.fn.dataTable.ext){
			$.fn.dataTable.ext.errMode = "throw";
		} else {
			var version = $.fn.dataTable.version ? $.fn.dataTable.version : "unknown";
			console.warn("You appear to be running an outdated or modified version of the dataTables library. This may cause issues with table functionality. This is usually caused by 3rd party software loading an older version of DataTables. The loaded version is " + version + ", we recommend version 1.10.12 or above.");
		}

		if($.fn.dataTable.Api){
			$.fn.dataTable.Api.register( 'processing()', function ( show ) {
				return this.iterator( 'table', function ( ctx ) {
					ctx.oApi._fnProcessingDisplay( ctx, show );
				} );
			} );
		}
		
		this.element = element;
		this.element.wpgmzaDataTable = this;
		this.dataTableElement = this.getDataTableElement();

		var settings = this.getDataTableSettings();
		
		
		this.phpClass			= $(element).attr("data-wpgmza-php-class");
		// this.dataTable			= $(this.dataTableElement).DataTable(settings);
		this.wpgmzaDataTable	= this;
		
		this.useCompressedPathVariable = (WPGMZA.restAPI.isCompressedPathVariableSupported && WPGMZA.settings.enable_compressed_path_variables);
		this.method = (this.useCompressedPathVariable ? "GET" : "POST");
		
		if(this.getLanguageURL() == undefined || this.getLanguageURL() == "//cdn.datatables.net/plug-ins/1.10.12/i18n/English.json") {
			this.dataTable = $(this.dataTableElement).DataTable(settings);
			this.dataTable.ajax.reload();
		}
		else {
			
			$.ajax(this.getLanguageURL(), {

				success: function(response, status, xhr){
					self.languageJSON = response;
					self.dataTable = $(self.dataTableElement).DataTable(settings);
					self.dataTable.ajax.reload();
				}
				
			});
		}
	}
	
	WPGMZA.DataTable.prototype.getDataTableElement = function()
	{
		return $(this.element).find("table");
	}
	
	/**
	 * This function wraps the request so it doesn't collide with WP query vars,
	 * it also adds the PHP class so that the controller knows which class to 
	 * instantiate
	 * @return object
	 */
	WPGMZA.DataTable.prototype.onAJAXRequest = function(data, settings)
	{
		// TODO: Move this to the REST API module and add useCompressedPathVariable
		var params = {
			"phpClass":	this.phpClass
		};
		
		var attr = $(this.element).attr("data-wpgmza-ajax-parameters");
		if(attr)
			$.extend(params, JSON.parse(attr));
		
		return $.extend(data, params);
	}
	
	WPGMZA.DataTable.prototype.onDataTableAjaxRequest = function(data, callback, settings)
	{
		var self = this;
		var element = this.element;
		var route = $(element).attr("data-wpgmza-rest-api-route");
		var params = this.onAJAXRequest(data, settings);
		var draw = params.draw;
		
		delete params.draw;
		
		if(!route)
			throw new Error("No data-wpgmza-rest-api-route attribute specified");
		
		var options = {
			method: "POST",
			useCompressedPathVariable: true,
			data: params,
			dataType: "json",
			cache: !this.preventCaching,
			beforeSend: function(xhr) {
				// Put draw in header, for compressed requests
				xhr.setRequestHeader("X-DataTables-Draw", draw);
			},
			success: function(response, status, xhr) {
				
				response.draw = draw;
				self.lastResponse = response;

				
				callback(response);
				
				$("[data-marker-icon-src]").each(function(index, element) {
					var icon = WPGMZA.MarkerIcon.createInstance(
						$(element).attr("data-marker-icon-src")
					);
					
					icon.applyToElement(element);
				});
				
			}
		};
		
		return WPGMZA.restAPI.call(route, options);
	}
	
	WPGMZA.DataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var element = this.element;
		var options = {};
		
		if($(element).attr("data-wpgmza-datatable-options"))
			options = JSON.parse($(element).attr("data-wpgmza-datatable-options"));
	
		options.deferLoading = true;
		options.processing = true;
		options.serverSide = true;
		
		options.ajax = function(data, callback, settings) { 
			return WPGMZA.DataTable.prototype.onDataTableAjaxRequest.apply(self, arguments); 
		}
		
		if(WPGMZA.AdvancedTableDataTable && this instanceof WPGMZA.AdvancedTableDataTable && WPGMZA.settings.wpgmza_default_items){
			options.iDisplayLength = parseInt(WPGMZA.settings.wpgmza_default_items);
		}

		if(WPGMZA.settings && WPGMZA.settings.enable_datatables_enter_search){
			options.search = { return : true };
		}
		
		options.aLengthMenu = [[5, 10, 25, 50, 100, -1], ["5", "10", "25", "50", "100", WPGMZA.localized_strings.all]];
		
		var languageURL = this.getLanguageURL();
		if(languageURL)
			options.language = {
				"url": languageURL
			};
		
		return options;
	}
	
	WPGMZA.DataTable.prototype.getLanguageURL = function()
	{
		if(!WPGMZA.locale)
			return null;
		
		var languageURL;
		
		switch(WPGMZA.locale.substr(0, 2))
		{
			case "af":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Afrikaans.json";
				break;

			case "sq":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Albanian.json";
				break;

			case "am":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Amharic.json";
				break;

			case "ar":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Arabic.json";
				break;

			case "hy":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Armenian.json";
				break;

			case "az":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Azerbaijan.json";
				break;

			case "bn":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Bangla.json";
				break;

			case "eu":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Basque.json";
				break;

			case "be":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Belarusian.json";
				break;

			case "bg":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Bulgarian.json";
				break;

			case "ca":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Catalan.json";
				break;

			case "zh":
				if(WPGMZA.locale == "zh_TW")
					languageURL = WPGMZA.pluginDirURL + "languages/datatables/Chinese-traditional.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Chinese.json";
				break;

			case "hr":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Croatian.json";
				break;

			case "cs":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Czech.json";
				break;

			case "da":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Danish.json";
				break;

			case "nl":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Dutch.json";
				break;

			/*case "en":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/English.json";
				break;*/

			case "et":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Estonian.json";
				break;

			case "fi":
				if(WPGMZA.locale.match(/^fil/))
					languageURL = WPGMZA.pluginDirURL + "languages/datatables/Filipino.json";
				else
					languageURL = WPGMZA.pluginDirURL + "languages/datatables/Finnish.json";
				break;

			case "fr":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/French.json";
				break;

			case "gl":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Galician.json";
				break;

			case "ka":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Georgian.json";
				break;

			case "de":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/German.json";
				break;

			case "el":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Greek.json";
				break;

			case "gu":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Gujarati.json";
				break;

			case "he":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Hebrew.json";
				break;

			case "hi":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Hindi.json";
				break;

			case "hu":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Hungarian.json";
				break;

			case "is":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Icelandic.json";
				break;

			/*case "id":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Indonesian-Alternative.json";
				break;*/
			
			case "id":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Indonesian.json";
				break;

			case "ga":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Irish.json";
				break;

			case "it":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Italian.json";
				break;

			case "ja":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Japanese.json";
				break;

			case "kk":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Kazakh.json";
				break;

			case "ko":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Korean.json";
				break;

			case "ky":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Kyrgyz.json";
				break;

			case "lv":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Latvian.json";
				break;

			case "lt":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Lithuanian.json";
				break;

			case "mk":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Macedonian.json";
				break;

			case "ml":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Malay.json";
				break;

			case "mn":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Mongolian.json";
				break;

			case "ne":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Nepali.json";
				break;

			case "nb":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Norwegian-Bokmal.json";
				break;
			
			case "nn":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Norwegian-Nynorsk.json";
				break;
			
			case "ps":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Pashto.json";
				break;

			case "fa":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Persian.json";
				break;

			case "pl":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Polish.json";
				break;

			case "pt":
				if(WPGMZA.locale == "pt_BR")
					languageURL = WPGMZA.pluginDirURL + "languages/datatables/Portuguese-Brasil.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Portuguese.json";
				break;
			
			case "ro":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Romanian.json";
				break;

			case "ru":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Russian.json";
				break;

			case "sr":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Serbian.json";
				break;

			case "si":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Sinhala.json";
				break;

			case "sk":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Slovak.json";
				break;

			case "sl":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Slovenian.json";
				break;

			case "es":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Spanish.json";
				break;

			case "sw":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Swahili.json";
				break;

			case "sv":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Swedish.json";
				break;

			case "ta":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Tamil.json";
				break;

			case "te":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/telugu.json";
				break;

			case "th":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Thai.json";
				break;

			case "tr":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Turkish.json";
				break;

			case "uk":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Ukrainian.json";
				break;

			case "ur":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Urdu.json";
				break;

			case "uz":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Uzbek.json";
				break;

			case "vi":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Vietnamese.json";
				break;

			case "cy":
				languageURL = WPGMZA.pluginDirURL + "languages/datatables/Welsh.json";
				break;
		}
		
		return languageURL;
	}
	
	WPGMZA.DataTable.prototype.onAJAXResponse = function(response)
	{
		
	}
	
	WPGMZA.DataTable.prototype.reload = function()
	{	
		if(this.dataTable){
			this.dataTable.ajax.reload(null, false); // null callback, false for resetPaging
		}
	}
	
});

// js/v8/tables/admin-feature-datatable.js
/**
 * @namespace WPGMZA
 * @module AdminFeatureDataTable
 * @requires WPGMZA.DataTable
 */
jQuery(function($) {
	
	WPGMZA.AdminFeatureDataTable = function(element)
	{
		var self = this;

		this.allSelected = false;

		
		WPGMZA.DataTable.call(this, element);
		
		this.initModals();

		$(element).on("click", ".wpgmza.bulk_delete", function(event) {
			self.onBulkDelete(event);
		});

		$(element).on("click", ".wpgmza.select_all_markers", function(event) {
			self.onSelectAll(event);
		});

		$(element).on("click", ".wpgmza.bulk_edit", function(event) {
			self.onBulkEdit(event);
		});
		
		// TODO: Move to dedicated marker class, or center feature ID instead
		$(element).on("click", "[data-center-marker-id]",function(event) {
			self.onCenterMarker(event);
		});

		$(element).on("click", "[data-duplicate-feature-id]", function(event) {
			self.onDuplicate(event);
		});

		$(element).on("click", "[data-move-map-feature-id]", function(event) {
			self.onMoveMap(event);
		});
	}
	
	WPGMZA.extend(WPGMZA.AdminFeatureDataTable, WPGMZA.DataTable);
	
	Object.defineProperty(WPGMZA.AdminFeatureDataTable.prototype, "featureType", {
		
		"get": function() {
			return $(this.element).attr("data-wpgmza-feature-type");
		}
		
	});
	
	Object.defineProperty(WPGMZA.AdminFeatureDataTable.prototype, "featurePanel", {
		
		"get": function() {
			return WPGMZA.mapEditPage[this.featureType + "Panel"];
		}
		
	});

	WPGMZA.AdminFeatureDataTable.prototype.initModals = function(){
		this.moveModal = false;
		this.bulkEditorModal = false;

		if(this.featureType === 'marker'){
			if($('.wpgmza-map-select-modal').length){
				this.moveModal = WPGMZA.GenericModal.createInstance($('.wpgmza-map-select-modal'));
			}

			if($('.wpgmza-bulk-marker-editor-modal').length){
				this.bulkEditorModal = WPGMZA.GenericModal.createInstance($('.wpgmza-bulk-marker-editor-modal'));
			}
		}
	}
	
	WPGMZA.AdminFeatureDataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var options = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		options.createdRow = function(row, data, index)
		{
			var meta = self.lastResponse.meta[index];
			row.wpgmzaFeatureData = meta;

			try {
				if($(row).find('.wpgmza-toolbar .wpgmza_approve_btn').length){
					$(row).addClass('wpgmza-row-needs-approval')
					$(row).attr('title', 'Pending Approval')
				}
			} catch (ex){	
				/* Nothing to do here */
			}
		}
		
		return options;
	}
	
	WPGMZA.AdminFeatureDataTable.prototype.onBulkDelete = function(event){
		var self = this;
		var ids = [];
		var map = WPGMZA.maps[0];
		var plural = this.featureType + "s";
		
		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaFeatureData.id);
		});

		var result = confirm(WPGMZA.localized_strings.general_delete_prompt_text);
		if (result) {
			ids.forEach(function(marker_id) {
				var marker = map.getMarkerByID(marker_id);
				
				if(marker)
					map.removeMarker(marker);
			});
			
			WPGMZA.restAPI.call("/" + plural + "/", {
				method: "DELETE",
				data: {
					ids: ids
				},
				complete: function() {
					self.reload();
				}
			});
		}
	}

	WPGMZA.AdminFeatureDataTable.prototype.onSelectAll = function(event){
		this.allSelected = !this.allSelected;

		var self = this;

		$(this.element).find("input[name='mark']").each(function(){
			if(self.allSelected){
				$(this).prop("checked", true);
			} else {
				$(this).prop("checked", false);
			}
		});
	}

	WPGMZA.AdminFeatureDataTable.prototype.onBulkEdit = function(event){
		const self = this;
		const ids = [];
		const map = WPGMZA.maps[0];
		const plural = this.featureType + "s";

		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaFeatureData.id);
		});

		if(this.bulkEditorModal && ids.length){
			this.bulkEditorModal.show(function(data){
				data.ids = ids;
				data.action = "bulk_edit";

				WPGMZA.restAPI.call("/" + plural + "/", {
					method: "POST",
					data: data,
					success: function(response, status, xhr) {
						self.reload();
					}
				});
			});
		}
	}
	
	// TODO: Move to dedicated marker class, or center feature ID instead
	WPGMZA.AdminFeatureDataTable.prototype.onCenterMarker = function(event){
		var id;

		//Check if we have selected the center on marker button or called this function elsewhere 
		if(event.currentTarget == undefined){
			id = event;
		} else {
			id = $(event.currentTarget).attr("data-center-marker-id");
		}

		var marker = WPGMZA.mapEditPage.map.getMarkerByID(id);
		
		if(marker){
			var latLng = new WPGMZA.LatLng({
				lat: marker.lat,
				lng: marker.lng
			});
			
			//Set a static zoom level
			var zoom_value = 6;
			WPGMZA.mapEditPage.map.setCenter(latLng);
			//WPGMZA.mapEditPage.map.setZoom(zoom_value);
			if(WPGMZA.InternalEngine.isLegacy()){
				/* Only applies in legacy */
				WPGMZA.animateScroll("#wpgmaps_tabs_markers");
			}
		}


	}

	WPGMZA.AdminFeatureDataTable.prototype.onDuplicate = function(event){
		const self = this;

		let id = false;
		if(event.currentTarget == undefined){
			id = event;
		} else {
			id = $(event.currentTarget).attr("data-duplicate-feature-id");
		}

		let plural = this.featureType + "s";
		
		WPGMZA.restAPI.call("/" + plural + "/", {
			method: "POST",
			data: {
				id: id,
				action: "duplicate"
			},
			success: function(response, status, xhr) {
				self.reload();
			}
		});

	}

	WPGMZA.AdminFeatureDataTable.prototype.onMoveMap = function(event){
		const self = this;

		let id = false;
		if(event.currentTarget == undefined){
			id = event;
		} else {
			id = $(event.currentTarget).attr("data-move-map-feature-id");
		}

		let plural = this.featureType + "s";
		
		if(this.moveModal){
			this.moveModal.show(function(data){
				const map = data.map_id ? parseInt(data.map_id) : false;

				if(map){
					WPGMZA.restAPI.call("/" + plural + "/", {
						method: "POST",
						data: {
							id: id,
							map_id : map,
							action: "move_map"
						},
						success: function(response, status, xhr) {
							self.reload();
						}
					});		
				}
			});
		}

	}
	
});

// js/v8/tables/admin-map-datatable.js
/**
 * @namespace WPGMZA
 * @module AdminDataTable
 * @requires WPGMZA.DataTable
 */
 jQuery(function($) {

 	WPGMZA.AdminMapDataTable = function(element) 
 	{	
 		var self = this;

		this.allSelected = false;

 		WPGMZA.DataTable.call(this, element);

    	$(element).on("mousedown", "button[data-action='edit']", function(event){
        	switch (event.which) {
                case 1:
					var map_id = $(event.target).attr("data-map-id");
					window.location.href = window.location.href + "&action=edit&map_id=" + map_id;
                    break;
                case 2:
                    var map_id = $(event.target).attr("data-map-id");
					window.open(window.location.href + "&action=edit&map_id=" + map_id);
                    break;
            }
        });

 		$(element).find(".wpgmza.select_all_maps").on("click", function(event) {
			self.onSelectAll(event); 
		});
		
		$(element).find(".wpgmza.bulk_delete_maps").on("click", function(event) {
			self.onBulkDelete(event);
		});

		$(element).on("click", "button[data-action='duplicate']", function(event) {

			var map_id = $(event.target).attr('data-map-id');

			WPGMZA.restAPI.call("/maps/", {
				method: "POST",
				data: {
					id: map_id,
					action: "duplicate"
				},
				success: function(response, status, xhr) {
					self.reload();
				}
			});

		}); 

 		$(element).on("click", "button[data-action='trash']", function(event) {

 			var result = confirm(WPGMZA.localized_strings.map_delete_prompt_text);

 			if (result) {

	 			var map_id = $(event.target).attr('data-map-id');

	 			WPGMZA.restAPI.call("/maps/", {
	 				method: "DELETE",
	 				data: {
	 					id: map_id
	 				},
	 				success: function(response, status, xhr) {
	 					self.reload();
	 				}
	 			})
	 		}

 		});
 	}

 	WPGMZA.extend(WPGMZA.AdminMapDataTable, WPGMZA.DataTable);

 	WPGMZA.AdminMapDataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var options = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		options.createdRow = function(row, data, index)
		{
			var meta = self.lastResponse.meta[index];
			row.wpgmzaMapData = meta;
		}
		
		return options;
	}

 	WPGMZA.AdminMapDataTable.prototype.onSelectAll = function(event)
	{
		this.allSelected = !this.allSelected;

		var self = this;
		$(this.element).find("input[name='mark']").each(function(){
			if(self.allSelected){
				$(this).prop("checked", true);
			} else {
				$(this).prop("checked", false);
			}
		});
	}

	WPGMZA.AdminMapDataTable.prototype.onBulkDelete = function(event)
	{
		var self = this;
		var ids = [];
		
		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaMapData.id);
		});
		
		var result = confirm(WPGMZA.localized_strings.map_bulk_delete_prompt_text);

		if (result) {
			WPGMZA.restAPI.call("/maps/", {
				method: "DELETE",
				data: {
					ids: ids
				},
				complete: function() {
					self.reload();
				}
			});		
		}
	}

 	$(document).ready(function(event){

 		$("[data-wpgmza-admin-map-datatable]").each(function(index, el) {
 			WPGMZA.AdminMapDataTable = new WPGMZA.AdminMapDataTable(el);
 		});

 	});

 });


// js/v8/tables/admin-marker-datatable.js
/**
 * @namespace WPGMZA
 * @module AdminMarkerDataTable
 * @requires WPGMZA.DataTable
 */
jQuery(function($) {
	
	WPGMZA.AdminMarkerDataTable = function(element)
	{
		var self = this;
		
		this.preventCaching = true;
		
		WPGMZA.DataTable.call(this, element);
		
		// NB: Pro marker panel currently manages edit marker buttons
		
		$(element).on("click", "[data-delete-marker-id]", function(event) {
			self.onDeleteMarker(event);
		});
		
		$(element).find(".wpgmza.select_all_markers").on("click", function(event) {
			self.onSelectAll(event);
		});
		
		$(element).find(".wpgmza.bulk_delete").on("click", function(event) {
			self.onBulkDelete(event);
		});

		$(element).on("click", "[data-center-marker-id]", function(event) {
			self.onCenterMarker(event);
		});
	}
	
	WPGMZA.AdminMarkerDataTable.prototype = Object.create(WPGMZA.DataTable.prototype);
	WPGMZA.AdminMarkerDataTable.prototype.constructor = WPGMZA.AdminMarkerDataTable;
	
	WPGMZA.AdminMarkerDataTable.createInstance = function(element)
	{
		return new WPGMZA.AdminMarkerDataTable(element);
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var options = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		options.createdRow = function(row, data, index)
		{
			var meta = self.lastResponse.meta[index];
			row.wpgmzaMarkerData = meta;
		}
		
		return options;
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onEditMarker = function(event)
	{
		WPGMZA.animatedScroll("#wpgmaps_tabs_markers");
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onDeleteMarker = function(event)
	{
		var self	= this;
		var id		= $(event.currentTarget).attr("data-delete-marker-id");
		
		var data	= {
			action: 'delete_marker',
			security: WPGMZA.legacyajaxnonce,
			map_id: WPGMZA.mapEditPage.map.id,
			marker_id: id
		};
		
		$.post(ajaxurl, data, function(response) {
			
			WPGMZA.mapEditPage.map.removeMarkerByID(id);
			self.reload();
			
		});
	}
	
	// NB: Move this to UGM
	WPGMZA.AdminMarkerDataTable.prototype.onApproveMarker = function(event)
	{
		var self	= this;
		var cur_id	= $(this).attr("id");
		
		var data = {
			action:		'approve_marker',
			security:	WPGMZA.legacyajaxnonce,
			map_id:		WPGMZA.mapEditPage.map.id,
			marker_id:	cur_id
		};
		$.post(ajaxurl, data, function (response) {
			
			
			wpgmza_InitMap();
			wpgmza_reinitialisetbl();

		});
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onSelectAll = function(event)
	{
		$(this.element).find("input[name='mark']").prop("checked", true);
	}
	
	WPGMZA.AdminMarkerDataTable.prototype.onBulkDelete = function(event)
	{
		var self = this;
		var ids = [];
		var map = WPGMZA.maps[0];
		
		$(this.element).find("input[name='mark']:checked").each(function(index, el) {
			var row = $(el).closest("tr")[0];
			ids.push(row.wpgmzaMarkerData.id);
		});
		
		ids.forEach(function(marker_id) {
			var marker = map.getMarkerByID(marker_id);
			
			if(marker)
				map.removeMarker(marker);
		});
		
		WPGMZA.restAPI.call("/markers/", {
			method: "DELETE",
			data: {
				ids: ids
			},
			complete: function() {
				self.reload();
			}
		});
	}

	WPGMZA.AdminMarkerDataTable.prototype.onCenterMarker = function(event)
	{
		var id;

		//Check if we have selected the center on marker button or called this function elsewhere 
		if(event.currentTarget == undefined)
		{
			id = event;
		}
		else{
			id = $(event.currentTarget).attr("data-center-marker-id");
		}

		var marker = WPGMZA.mapEditPage.map.getMarkerByID(id);
		
		if(marker){
			var latLng = new WPGMZA.LatLng({
				lat: marker.lat,
				lng: marker.lng
			});
			
			//Set a static zoom level
			var zoom_value = 6;
			WPGMZA.mapEditPage.map.setCenter(latLng);
			WPGMZA.mapEditPage.map.setZoom(zoom_value);

			if(WPGMZA.InternalEngine.isLegacy()){
				/* Only applies to legacy */
				WPGMZA.animateScroll("#wpgmaps_tabs_markers");
			}
		}


	}
	
	/*$(document).ready(function(event) {
		
		$("[data-wpgmza-admin-marker-datatable]").each(function(index, el) {
			WPGMZA.adminMarkerDataTable = WPGMZA.AdminMarkerDataTable.createInstance(el);
		});
		
	});*/
	
});