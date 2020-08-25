
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

// js/v8/compatibility.js
/**
 * @namespace WPGMZA
 * @module Compatibility
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wYXRpYmlsaXR5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIENvbXBhdGliaWxpdHlcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldmVyc2UgY29tcGF0aWJpbGl0eSBtb2R1bGVcclxuXHQgKlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuQ29tcGF0aWJpbGl0eVxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuQ29tcGF0aWJpbGl0eVxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKi9cclxuXHRXUEdNWkEuQ29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR0aGlzLnByZXZlbnREb2N1bWVudFdyaXRlR29vZ2xlTWFwc0FQSSgpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBQcmV2ZW50cyBkb2N1bWVudC53cml0ZSBmcm9tIG91dHB1dHRpbmcgR29vZ2xlIE1hcHMgQVBJIHNjcmlwdCB0YWdcclxuXHQgKlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkNvbXBhdGliaWxpdHlcclxuXHQgKi9cclxuXHRXUEdNWkEuQ29tcGF0aWJpbGl0eS5wcm90b3R5cGUucHJldmVudERvY3VtZW50V3JpdGVHb29nbGVNYXBzQVBJID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBvbGQgPSBkb2N1bWVudC53cml0ZTtcclxuXHRcdFxyXG5cdFx0ZG9jdW1lbnQud3JpdGUgPSBmdW5jdGlvbihjb250ZW50KVxyXG5cdFx0e1xyXG5cdFx0XHRpZihjb250ZW50Lm1hdGNoICYmIGNvbnRlbnQubWF0Y2goL21hcHNcXC5nb29nbGUvKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFxyXG5cdFx0XHRvbGQuY2FsbChkb2N1bWVudCwgY29udGVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5jb21wYXRpYmxpdHlNb2R1bGUgPSBuZXcgV1BHTVpBLkNvbXBhdGliaWxpdHkoKTtcclxuXHRcclxufSk7Il0sImZpbGUiOiJjb21wYXRpYmlsaXR5LmpzIn0=


// js/v8/css-escape.js
/**
 * Polyfill for CSS.escape, with thanks to @mathias
 * @namespace WPGMZA
 * @module CSS
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjc3MtZXNjYXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBQb2x5ZmlsbCBmb3IgQ1NTLmVzY2FwZSwgd2l0aCB0aGFua3MgdG8gQG1hdGhpYXNcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBDU1NcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5cclxuLyohIGh0dHBzOi8vbXRocy5iZS9jc3Nlc2NhcGUgdjEuNS4xIGJ5IEBtYXRoaWFzIHwgTUlUIGxpY2Vuc2UgKi9cclxuOyhmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XHJcblx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci9yZXR1cm5FeHBvcnRzLmpzXHJcblx0aWYgKHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnKSB7XHJcblx0XHQvLyBGb3IgTm9kZS5qcy5cclxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyb290KTtcclxuXHR9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcblx0XHQvLyBGb3IgQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxyXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5LmJpbmQocm9vdCwgcm9vdCkpO1xyXG5cdH0gZWxzZSB7XHJcblx0XHQvLyBGb3IgYnJvd3NlciBnbG9iYWxzIChub3QgZXhwb3NpbmcgdGhlIGZ1bmN0aW9uIHNlcGFyYXRlbHkpLlxyXG5cdFx0ZmFjdG9yeShyb290KTtcclxuXHR9XHJcbn0odHlwZW9mIGdsb2JhbCAhPSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHRoaXMsIGZ1bmN0aW9uKHJvb3QpIHtcclxuXHJcblx0aWYgKHJvb3QuQ1NTICYmIHJvb3QuQ1NTLmVzY2FwZSkge1xyXG5cdFx0cmV0dXJuIHJvb3QuQ1NTLmVzY2FwZTtcclxuXHR9XHJcblxyXG5cdC8vIGh0dHBzOi8vZHJhZnRzLmNzc3dnLm9yZy9jc3NvbS8jc2VyaWFsaXplLWFuLWlkZW50aWZpZXJcclxuXHR2YXIgY3NzRXNjYXBlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApIHtcclxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignYENTUy5lc2NhcGVgIHJlcXVpcmVzIGFuIGFyZ3VtZW50LicpO1xyXG5cdFx0fVxyXG5cdFx0dmFyIHN0cmluZyA9IFN0cmluZyh2YWx1ZSk7XHJcblx0XHR2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcclxuXHRcdHZhciBpbmRleCA9IC0xO1xyXG5cdFx0dmFyIGNvZGVVbml0O1xyXG5cdFx0dmFyIHJlc3VsdCA9ICcnO1xyXG5cdFx0dmFyIGZpcnN0Q29kZVVuaXQgPSBzdHJpbmcuY2hhckNvZGVBdCgwKTtcclxuXHRcdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XHJcblx0XHRcdGNvZGVVbml0ID0gc3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpO1xyXG5cdFx0XHQvLyBOb3RlOiB0aGVyZeKAmXMgbm8gbmVlZCB0byBzcGVjaWFsLWNhc2UgYXN0cmFsIHN5bWJvbHMsIHN1cnJvZ2F0ZVxyXG5cdFx0XHQvLyBwYWlycywgb3IgbG9uZSBzdXJyb2dhdGVzLlxyXG5cclxuXHRcdFx0Ly8gSWYgdGhlIGNoYXJhY3RlciBpcyBOVUxMIChVKzAwMDApLCB0aGVuIHRoZSBSRVBMQUNFTUVOVCBDSEFSQUNURVJcclxuXHRcdFx0Ly8gKFUrRkZGRCkuXHJcblx0XHRcdGlmIChjb2RlVW5pdCA9PSAweDAwMDApIHtcclxuXHRcdFx0XHRyZXN1bHQgKz0gJ1xcdUZGRkQnO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0Ly8gSWYgdGhlIGNoYXJhY3RlciBpcyBpbiB0aGUgcmFuZ2UgW1xcMS1cXDFGXSAoVSswMDAxIHRvIFUrMDAxRikgb3IgaXNcclxuXHRcdFx0XHQvLyBVKzAwN0YsIFvigKZdXHJcblx0XHRcdFx0KGNvZGVVbml0ID49IDB4MDAwMSAmJiBjb2RlVW5pdCA8PSAweDAwMUYpIHx8IGNvZGVVbml0ID09IDB4MDA3RiB8fFxyXG5cdFx0XHRcdC8vIElmIHRoZSBjaGFyYWN0ZXIgaXMgdGhlIGZpcnN0IGNoYXJhY3RlciBhbmQgaXMgaW4gdGhlIHJhbmdlIFswLTldXHJcblx0XHRcdFx0Ly8gKFUrMDAzMCB0byBVKzAwMzkpLCBb4oCmXVxyXG5cdFx0XHRcdChpbmRleCA9PSAwICYmIGNvZGVVbml0ID49IDB4MDAzMCAmJiBjb2RlVW5pdCA8PSAweDAwMzkpIHx8XHJcblx0XHRcdFx0Ly8gSWYgdGhlIGNoYXJhY3RlciBpcyB0aGUgc2Vjb25kIGNoYXJhY3RlciBhbmQgaXMgaW4gdGhlIHJhbmdlIFswLTldXHJcblx0XHRcdFx0Ly8gKFUrMDAzMCB0byBVKzAwMzkpIGFuZCB0aGUgZmlyc3QgY2hhcmFjdGVyIGlzIGEgYC1gIChVKzAwMkQpLCBb4oCmXVxyXG5cdFx0XHRcdChcclxuXHRcdFx0XHRcdGluZGV4ID09IDEgJiZcclxuXHRcdFx0XHRcdGNvZGVVbml0ID49IDB4MDAzMCAmJiBjb2RlVW5pdCA8PSAweDAwMzkgJiZcclxuXHRcdFx0XHRcdGZpcnN0Q29kZVVuaXQgPT0gMHgwMDJEXHJcblx0XHRcdFx0KVxyXG5cdFx0XHQpIHtcclxuXHRcdFx0XHQvLyBodHRwczovL2RyYWZ0cy5jc3N3Zy5vcmcvY3Nzb20vI2VzY2FwZS1hLWNoYXJhY3Rlci1hcy1jb2RlLXBvaW50XHJcblx0XHRcdFx0cmVzdWx0ICs9ICdcXFxcJyArIGNvZGVVbml0LnRvU3RyaW5nKDE2KSArICcgJztcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKFxyXG5cdFx0XHRcdC8vIElmIHRoZSBjaGFyYWN0ZXIgaXMgdGhlIGZpcnN0IGNoYXJhY3RlciBhbmQgaXMgYSBgLWAgKFUrMDAyRCksIGFuZFxyXG5cdFx0XHRcdC8vIHRoZXJlIGlzIG5vIHNlY29uZCBjaGFyYWN0ZXIsIFvigKZdXHJcblx0XHRcdFx0aW5kZXggPT0gMCAmJlxyXG5cdFx0XHRcdGxlbmd0aCA9PSAxICYmXHJcblx0XHRcdFx0Y29kZVVuaXQgPT0gMHgwMDJEXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdHJlc3VsdCArPSAnXFxcXCcgKyBzdHJpbmcuY2hhckF0KGluZGV4KTtcclxuXHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Ly8gSWYgdGhlIGNoYXJhY3RlciBpcyBub3QgaGFuZGxlZCBieSBvbmUgb2YgdGhlIGFib3ZlIHJ1bGVzIGFuZCBpc1xyXG5cdFx0XHQvLyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gVSswMDgwLCBpcyBgLWAgKFUrMDAyRCkgb3IgYF9gIChVKzAwNUYpLCBvclxyXG5cdFx0XHQvLyBpcyBpbiBvbmUgb2YgdGhlIHJhbmdlcyBbMC05XSAoVSswMDMwIHRvIFUrMDAzOSksIFtBLVpdIChVKzAwNDEgdG9cclxuXHRcdFx0Ly8gVSswMDVBKSwgb3IgW2Etel0gKFUrMDA2MSB0byBVKzAwN0EpLCBb4oCmXVxyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0Y29kZVVuaXQgPj0gMHgwMDgwIHx8XHJcblx0XHRcdFx0Y29kZVVuaXQgPT0gMHgwMDJEIHx8XHJcblx0XHRcdFx0Y29kZVVuaXQgPT0gMHgwMDVGIHx8XHJcblx0XHRcdFx0Y29kZVVuaXQgPj0gMHgwMDMwICYmIGNvZGVVbml0IDw9IDB4MDAzOSB8fFxyXG5cdFx0XHRcdGNvZGVVbml0ID49IDB4MDA0MSAmJiBjb2RlVW5pdCA8PSAweDAwNUEgfHxcclxuXHRcdFx0XHRjb2RlVW5pdCA+PSAweDAwNjEgJiYgY29kZVVuaXQgPD0gMHgwMDdBXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdC8vIHRoZSBjaGFyYWN0ZXIgaXRzZWxmXHJcblx0XHRcdFx0cmVzdWx0ICs9IHN0cmluZy5jaGFyQXQoaW5kZXgpO1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBPdGhlcndpc2UsIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cclxuXHRcdFx0Ly8gaHR0cHM6Ly9kcmFmdHMuY3Nzd2cub3JnL2Nzc29tLyNlc2NhcGUtYS1jaGFyYWN0ZXJcclxuXHRcdFx0cmVzdWx0ICs9ICdcXFxcJyArIHN0cmluZy5jaGFyQXQoaW5kZXgpO1xyXG5cclxuXHRcdH1cclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fTtcclxuXHJcblx0aWYgKCFyb290LkNTUykge1xyXG5cdFx0cm9vdC5DU1MgPSB7fTtcclxuXHR9XHJcblxyXG5cdHJvb3QuQ1NTLmVzY2FwZSA9IGNzc0VzY2FwZTtcclxuXHRyZXR1cm4gY3NzRXNjYXBlO1xyXG5cclxufSkpOyJdLCJmaWxlIjoiY3NzLWVzY2FwZS5qcyJ9


// js/v8/distance.js
/**
 * Collection of distance utility functions and constants
 * @namespace WPGMZA
 * @module Distance
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkaXN0YW5jZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29sbGVjdGlvbiBvZiBkaXN0YW5jZSB1dGlsaXR5IGZ1bmN0aW9ucyBhbmQgY29uc3RhbnRzXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgRGlzdGFuY2VcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdHZhciBlYXJ0aFJhZGl1c01ldGVycyA9IDYzNzE7XHJcblx0dmFyIHBpVGltZXMzNjAgPSBNYXRoLlBJIC8gMzYwO1xyXG5cdFxyXG5cdGZ1bmN0aW9uIGRlZzJyYWQoZGVnKSB7XHJcblx0ICByZXR1cm4gZGVnICogKE1hdGguUEkvMTgwKVxyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogQGNsYXNzIFdQR01aQS5EaXN0YW5jZVxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKiBAZGVwcmVjYXRlZCBXaWxsIGJlIGRyb3BwZWQgd2lodCB0aGUgaW50cm9kdWN0aW9uIG9mIGdsb2JhbCBkaXN0YW5jZSB1bml0c1xyXG5cdCAqL1xyXG5cdFdQR01aQS5EaXN0YW5jZSA9IHtcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBNaWxlcywgcmVwcmVzZW50ZWQgYXMgdHJ1ZSBieSBsZWdhY3kgdmVyc2lvbnMgb2YgdGhlIHBsdWdpblxyXG5cdFx0ICogQGNvbnN0YW50IE1JTEVTXHJcblx0XHQgKiBAc3RhdGljXHJcblx0XHQgKiBAbWVtYmVyb2YgV1BHTVpBLkRpc3RhbmNlXHJcblx0XHQgKi9cclxuXHRcdE1JTEVTOlx0XHRcdFx0XHR0cnVlLFxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIEtpbG9tZXRlcnMsIHJlcHJlc2VudGVkIGFzIGZhbHNlIGJ5IGxlZ2FjeSB2ZXJzaW9ucyBvZiB0aGUgcGx1Z2luXHJcblx0XHQgKiBAY29uc3RhbnQgS0lMT01FVEVSU1xyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQG1lbWJlcm9mIFdQR01aQS5EaXN0YW5jZVxyXG5cdFx0ICovXHJcblx0XHRLSUxPTUVURVJTOlx0XHRcdFx0ZmFsc2UsXHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogTWlsZXMgcGVyIGtpbG9tZXRlclxyXG5cdFx0ICogQGNvbnN0YW50IE1JTEVTX1BFUl9LSUxPTUVURVJcclxuXHRcdCAqIEBzdGF0aWNcclxuXHRcdCAqIEBtZW1iZXJvZiBXUEdNWkEuRGlzdGFuY2VcclxuXHRcdCAqL1xyXG5cdFx0TUlMRVNfUEVSX0tJTE9NRVRFUjpcdDAuNjIxMzcxLFxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIEtpbG9tZXRlcnMgcGVyIG1pbGVcclxuXHRcdCAqIEBjb25zdGFudCBLSUxPTUVURVJTX1BFUl9NSUxFXHJcblx0XHQgKiBAc3RhdGljXHJcblx0XHQgKi9cclxuXHRcdEtJTE9NRVRFUlNfUEVSX01JTEU6XHQxLjYwOTM0LFxyXG5cdFx0XHJcblx0XHQvLyBUT0RPOiBJbXBsZW1lbnQgV1BHTVpBLnNldHRpbmdzLmRpc3RhbmNlX3VuaXRzXHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udmVydHMgYSBVSSBkaXN0YW5jZSAoZWcgZnJvbSBhIGZvcm0gY29udHJvbCkgdG8gbWV0ZXJzLFxyXG5cdFx0ICogYWNjb3VudGluZyBmb3IgdGhlIGdsb2JhbCB1bml0cyBzZXR0aW5nXHJcblx0XHQgKiBAbWV0aG9kIHVpVG9NZXRlcnNcclxuXHRcdCAqIEBzdGF0aWNcclxuXHRcdCAqIEBtZW1iZXJvZiBXUEdNWkEuRGlzdGFuY2VcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB1aURpc3RhbmNlIFRoZSBkaXN0YW5jZSBmcm9tIHRoZSBVSSwgY291bGQgYmUgaW4gbWlsZXMgb3Iga2lsb21ldGVycyBkZXBlbmRpbmcgb24gc2V0dGluZ3NcclxuXHRcdCAqIEByZXR1cm4ge251bWJlcn0gVGhlIGlucHV0IGRpc3RhbmNlIGluIG1ldGVyc1xyXG5cdFx0ICovXHJcblx0XHR1aVRvTWV0ZXJzOiBmdW5jdGlvbih1aURpc3RhbmNlKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gcGFyc2VGbG9hdCh1aURpc3RhbmNlKSAvIChXUEdNWkEuc2V0dGluZ3MuZGlzdGFuY2VfdW5pdHMgPT0gV1BHTVpBLkRpc3RhbmNlLk1JTEVTID8gV1BHTVpBLkRpc3RhbmNlLk1JTEVTX1BFUl9LSUxPTUVURVIgOiAxKSAqIDEwMDA7XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIENvbnZlcnRzIGEgVUkgZGlzdGFuY2UgKGVnIGZyb20gYSBmb3JtIGNvbnRyb2wpIHRvIGtpbG9tZXRlcnMsXHJcblx0XHQgKiBhY2NvdW50aW5nIGZvciB0aGUgZ2xvYmFsIHVuaXRzIHNldHRpbmdcclxuXHRcdCAqIEBtZXRob2QgdWlUb0tpbG9tZXRlcnNcclxuXHRcdCAqIEBzdGF0aWNcclxuXHRcdCAqIEBtZW1iZXJvZiBXUEdNWkEuRGlzdGFuY2VcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB1aURpc3RhbmNlIFRoZSBkaXN0YW5jZSBmcm9tIHRoZSBVSSwgY291bGQgYmUgaW4gbWlsZXMgb3Iga2lsb21ldGVycyBkZXBlbmRpbmcgb24gc2V0dGluZ3NcclxuXHRcdCAqIEByZXR1cm4ge251bWJlcn0gVGhlIGlucHV0IGRpc3RhbmNlIGluIGtpbG9tZXRlcnNcclxuXHRcdCAqL1xyXG5cdFx0dWlUb0tpbG9tZXRlcnM6IGZ1bmN0aW9uKHVpRGlzdGFuY2UpXHJcblx0XHR7XHJcblx0XHRcdHJldHVybiBXUEdNWkEuRGlzdGFuY2UudWlUb01ldGVycyh1aURpc3RhbmNlKSAqIDAuMDAxO1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb252ZXJ0cyBhIFVJIGRpc3RhbmNlIChlZyBmcm9tIGEgZm9ybSBjb250cm9sKSB0byBtaWxlcywgYWNjb3JkaW5nIHRvIHNldHRpbmdzXHJcblx0XHQgKiBAbWV0aG9kIHVpVG9NaWxlc1xyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQG1lbWJlcm9mIFdQR01aQS5EaXN0YW5jZVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IHVpRGlzdGFuY2UgVGhlIGRpc3RhbmNlIGZyb20gdGhlIFVJLCBjb3VsZCBiZSBpbiBtaWxlcyBvciBraWxvbWV0ZXJzIGRlcGVuZGluZyBvbiBzZXR0aW5nc1xyXG5cdFx0ICogQHJldHVybiB7bnVtYmVyfSBUaGUgaW5wdXQgZGlzdGFuY2UgXHJcblx0XHQgKi9cclxuXHRcdHVpVG9NaWxlczogZnVuY3Rpb24odWlEaXN0YW5jZSlcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuIFdQR01aQS5EaXN0YW5jZS51aVRvS2lsb21ldGVycyh1aURpc3RhbmNlKSAqIFdQR01aQS5EaXN0YW5jZS5NSUxFU19QRVJfS0lMT01FVEVSO1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb252ZXJ0cyBraWxvbWV0ZXJzIHRvIGEgVUkgZGlzdGFuY2UsIGVpdGhlciB0aGUgc2FtZSB2YWx1ZSwgb3IgY29udmVydGVkIHRvIG1pbGVzIGRlcGVuZGluZyBvbiBzZXR0aW5ncy5cclxuXHRcdCAqIEBtZXRob2Qga2lsb21ldGVyc1RvVUlcclxuXHRcdCAqIEBzdGF0aWNcclxuXHRcdCAqIEBtZW1iZXJvZiBXUEdNWkEuRGlzdGFuY2VcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBrbSBUaGUgaW5wdXQgZGlzdGFuY2UgaW4ga2lsb21ldGVyc1xyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IFRoZSBVSSBkaXN0YW5jZSBpbiB0aGUgdW5pdHMgc3BlY2lmaWVkIGJ5IHNldHRpbmdzXHJcblx0XHQgKi9cclxuXHRcdGtpbG9tZXRlcnNUb1VJOiBmdW5jdGlvbihrbSlcclxuXHRcdHtcclxuXHRcdFx0aWYoV1BHTVpBLnNldHRpbmdzLmRpc3RhbmNlX3VuaXRzID09IFdQR01aQS5EaXN0YW5jZS5NSUxFUylcclxuXHRcdFx0XHRyZXR1cm4ga20gKiBXUEdNWkEuRGlzdGFuY2UuTUlMRVNfUEVSX0tJTE9NRVRFUjtcclxuXHRcdFx0cmV0dXJuIGttO1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSBkaXN0YW5jZSwgaW4ga2lsb21ldGVycywgYmV0d2VlbiB0d28gTGF0TG5nJ3NcclxuXHRcdCAqIEBtZXRob2QgYmV0d2VlblxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQG1lbWJlcm9mIFdQR01aQS5EaXN0YW5jZVxyXG5cdFx0ICogQHBhcmFtIHtXUEdNWkEuTGF0bG5nfSBUaGUgZmlyc3QgcG9pbnRcclxuXHRcdCAqIEBwYXJhbSB7V1BHTVpBLkxhdGxuZ30gVGhlIHNlY29uZCBwb2ludFxyXG5cdFx0ICogQHJldHVybiB7bnVtYmVyfSBUaGUgZGlzdGFuY2UsIGluIGtpbG9tZXRlcnNcclxuXHRcdCAqL1xyXG5cdFx0YmV0d2VlbjogZnVuY3Rpb24oYSwgYilcclxuXHRcdHtcclxuXHRcdFx0aWYoIShhIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZykgJiYgIShcImxhdFwiIGluIGEgJiYgXCJsbmdcIiBpbiBhKSlcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmcgb3IgYSBsaXRlcmFsXCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoIShiIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZykgJiYgIShcImxhdFwiIGluIGIgJiYgXCJsbmdcIiBpbiBiKSlcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuTGF0TG5nIG9yIGEgbGl0ZXJhbFwiKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGEgPT09IGIpXHJcblx0XHRcdFx0cmV0dXJuIDAuMDtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBsYXQxID0gYS5sYXQ7XHJcblx0XHRcdHZhciBsb24xID0gYS5sbmc7XHJcblx0XHRcdHZhciBsYXQyID0gYi5sYXQ7XHJcblx0XHRcdHZhciBsb24yID0gYi5sbmc7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZExhdCA9IGRlZzJyYWQobGF0MiAtIGxhdDEpO1xyXG5cdFx0XHR2YXIgZExvbiA9IGRlZzJyYWQobG9uMiAtIGxvbjEpOyBcclxuXHRcdFx0XHJcblx0XHRcdHZhciBhID0gXHJcblx0XHRcdFx0TWF0aC5zaW4oZExhdC8yKSAqIE1hdGguc2luKGRMYXQvMikgK1xyXG5cdFx0XHRcdE1hdGguY29zKGRlZzJyYWQobGF0MSkpICogTWF0aC5jb3MoZGVnMnJhZChsYXQyKSkgKiBcclxuXHRcdFx0XHRNYXRoLnNpbihkTG9uLzIpICogTWF0aC5zaW4oZExvbi8yKTsgXHJcblx0XHRcdFx0XHJcblx0XHRcdHZhciBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMS1hKSk7IFxyXG5cdFx0XHR2YXIgZCA9IGVhcnRoUmFkaXVzTWV0ZXJzICogYzsgLy8gRGlzdGFuY2UgaW4ga21cclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBkO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fTtcclxuXHRcclxufSk7Il0sImZpbGUiOiJkaXN0YW5jZS5qcyJ9


// js/v8/elias-fano.js
/**
 * @namespace WPGMZA
 * @module EliasFano
 * @requires WPGMZA
 * @gulp-requires core.js
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
			
			if(!$.isNumeric(docID))
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJlbGlhcy1mYW5vLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEVsaWFzRmFub1xyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0V1BHTVpBLkVsaWFzRmFubyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZighV1BHTVpBLkVsaWFzRmFuby5pc1N1cHBvcnRlZClcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRWxpYXMgRmFubyBlbmNvZGluZyBpcyBub3Qgc3VwcG9ydGVkIG9uIGJyb3dzZXJzIHdpdGhvdXQgVWludDhBcnJheVwiKTtcclxuXHRcdFxyXG5cdFx0aWYoIVdQR01aQS5FbGlhc0Zhbm8uZGVjb2RpbmdUYWJsZXNJbml0aWFsaXNlZClcclxuXHRcdFx0V1BHTVpBLkVsaWFzRmFuby5jcmVhdGVEZWNvZGluZ1RhYmxlKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5FbGlhc0Zhbm8uaXNTdXBwb3J0ZWQgPSAoXCJVaW50OEFycmF5XCIgaW4gd2luZG93KTtcclxuXHRcclxuXHRXUEdNWkEuRWxpYXNGYW5vLmRlY29kaW5nVGFibGVIaWdoQml0c1x0XHRcdD0gW107XHJcblx0V1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlRG9jSUROdW1iZXJcdFx0PSBudWxsO1xyXG5cdFdQR01aQS5FbGlhc0Zhbm8uZGVjb2RpbmdUYWJsZUhpZ2hCaXRzQ2FycnlvdmVyID0gbnVsbDtcclxuXHRcclxuXHRXUEdNWkEuRWxpYXNGYW5vLmNyZWF0ZURlY29kaW5nVGFibGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0V1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlRG9jSUROdW1iZXIgPSBuZXcgVWludDhBcnJheSgyNTYpO1xyXG5cdFx0V1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlSGlnaEJpdHNDYXJyeW92ZXIgPSBuZXcgVWludDhBcnJheSgyNTYpO1xyXG5cdFx0XHJcblx0XHR2YXIgZGVjb2RpbmdUYWJsZUhpZ2hCaXRzID0gV1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlSGlnaEJpdHM7XHJcblx0XHR2YXIgZGVjb2RpbmdUYWJsZURvY0lETnVtYmVyID0gV1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlRG9jSUROdW1iZXI7XHJcblx0XHR2YXIgZGVjb2RpbmdUYWJsZUhpZ2hCaXRzQ2FycnlvdmVyID0gV1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlSGlnaEJpdHNDYXJyeW92ZXI7XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIHplcm9Db3VudCA9IDA7XHJcblx0XHRcdFxyXG5cdFx0XHRkZWNvZGluZ1RhYmxlSGlnaEJpdHNbaV0gPSBbXTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIgaiA9IDc7IGogPj0gMDsgai0tKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYoKGkgJiAoMSA8PCBqKSkgPiAwKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGRlY29kaW5nVGFibGVIaWdoQml0c1tpXVtkZWNvZGluZ1RhYmxlRG9jSUROdW1iZXJbaV1dID0gemVyb0NvdW50O1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRkZWNvZGluZ1RhYmxlRG9jSUROdW1iZXJbaV0rKztcclxuXHRcdFx0XHRcdHplcm9Db3VudCA9IDA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHplcm9Db3VudCA9ICh6ZXJvQ291bnQgKyAxKSAlIDB4RkY7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGRlY29kaW5nVGFibGVIaWdoQml0c0NhcnJ5b3ZlcltpXSA9IHplcm9Db3VudDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0V1BHTVpBLkVsaWFzRmFuby5kZWNvZGluZ1RhYmxlc0luaXRpYWxpc2VkID0gdHJ1ZTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkVsaWFzRmFuby5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24obGlzdClcclxuXHR7XHJcblx0XHR2YXIgbGFzdERvY0lEXHRcdD0gMCxcclxuXHRcdFx0YnVmZmVyMSBcdFx0PSAwLFxyXG5cdFx0XHRidWZmZXJMZW5ndGgxIFx0PSAwLFxyXG5cdFx0XHRidWZmZXIyIFx0XHQ9IDAsXHJcblx0XHRcdGJ1ZmZlckxlbmd0aDIgXHQ9IDA7XHJcblx0XHRcclxuXHRcdGlmKGxpc3QubGVuZ3RoID09IDApXHJcblx0XHRcdHJldHVybiByZXN1bHQ7XHJcblx0XHRcclxuXHRcdGZ1bmN0aW9uIHRvQnl0ZShuKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gbiAmIDB4RkY7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjEgPSAwO1xyXG5cdFx0dmFyIGNvbXByZXNzZWRCdWZmZXJQb2ludGVyMiA9IDA7XHJcblx0XHR2YXIgbGFyZ2VzdEJsb2NrSUQgPSBsaXN0W2xpc3QubGVuZ3RoIC0gMV07XHJcblx0XHR2YXIgYXZlcmFnZURlbHRhID0gbGFyZ2VzdEJsb2NrSUQgLyBsaXN0Lmxlbmd0aDtcclxuXHRcdHZhciBhdmVyYWdlRGVsdGFMb2cgPSBNYXRoLmxvZzIoYXZlcmFnZURlbHRhKTtcclxuXHRcdHZhciBsb3dCaXRzTGVuZ3RoID0gTWF0aC5mbG9vcihhdmVyYWdlRGVsdGFMb2cpO1xyXG5cdFx0dmFyIGxvd0JpdHNNYXNrID0gKDEgPDwgbG93Qml0c0xlbmd0aCkgLSAxO1xyXG5cdFx0dmFyIHByZXYgPSBudWxsO1xyXG5cdFx0XHJcblx0XHR2YXIgbWF4Q29tcHJlc3NlZFNpemUgPSBNYXRoLmZsb29yKFxyXG5cdFx0XHQoXHJcblx0XHRcdFx0MiArIE1hdGguY2VpbChcclxuXHRcdFx0XHRcdE1hdGgubG9nMihhdmVyYWdlRGVsdGEpXHJcblx0XHRcdFx0KVxyXG5cdFx0XHQpICogbGlzdC5sZW5ndGggLyA4XHJcblx0XHQpICsgNjtcclxuXHRcdFxyXG5cdFx0dmFyIGNvbXByZXNzZWRCdWZmZXIgPSBuZXcgVWludDhBcnJheShtYXhDb21wcmVzc2VkU2l6ZSk7XHJcblx0XHRcclxuXHRcdGlmKGxvd0JpdHNMZW5ndGggPCAwKVxyXG5cdFx0XHRsb3dCaXRzTGVuZ3RoID0gMDtcclxuXHRcdFxyXG5cdFx0Y29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIyID0gTWF0aC5mbG9vcihsb3dCaXRzTGVuZ3RoICogbGlzdC5sZW5ndGggLyA4ICsgNik7XHJcblx0XHRcclxuXHRcdGNvbXByZXNzZWRCdWZmZXJbY29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIxKytdID0gdG9CeXRlKCBsaXN0Lmxlbmd0aCApO1xyXG5cdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjErK10gPSB0b0J5dGUoIGxpc3QubGVuZ3RoID4+IDggKTtcclxuXHRcdGNvbXByZXNzZWRCdWZmZXJbY29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIxKytdID0gdG9CeXRlKCBsaXN0Lmxlbmd0aCA+PiAxNiApO1xyXG5cdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjErK10gPSB0b0J5dGUoIGxpc3QubGVuZ3RoID4+IDI0ICk7XHJcblx0XHRcclxuXHRcdGNvbXByZXNzZWRCdWZmZXJbY29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIxKytdID0gdG9CeXRlKCBsb3dCaXRzTGVuZ3RoICk7XHJcblx0XHRcclxuXHRcdGxpc3QuZm9yRWFjaChmdW5jdGlvbihkb2NJRCkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGRvY0lERGVsdGEgPSAoZG9jSUQgLSBsYXN0RG9jSUQgLSAxKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKCEkLmlzTnVtZXJpYyhkb2NJRCkpXHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVmFsdWUgaXMgbm90IG51bWVyaWNcIik7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBOQjogRm9yY2UgZG9jSUQgdG8gYW4gaW50ZWdlciBpbiBjYXNlIGl0J3MgYSBzdHJpbmdcclxuXHRcdFx0ZG9jSUQgPSBwYXJzZUludChkb2NJRCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihwcmV2ICE9PSBudWxsICYmIGRvY0lEIDw9IHByZXYpXHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRWxpYXMgRmFubyBlbmNvZGluZyBjYW4gb25seSBiZSB1c2VkIG9uIGEgc29ydGVkLCBhc2NlbmRpbmcgbGlzdCBvZiB1bmlxdWUgaW50ZWdlcnMuXCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0cHJldiA9IGRvY0lEO1xyXG5cdFx0XHRcclxuXHRcdFx0YnVmZmVyMSA8PD0gbG93Qml0c0xlbmd0aDtcclxuXHRcdFx0YnVmZmVyMSB8PSAoZG9jSUREZWx0YSAmIGxvd0JpdHNNYXNrKTtcclxuXHRcdFx0YnVmZmVyTGVuZ3RoMSArPSBsb3dCaXRzTGVuZ3RoO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gRmx1c2ggYnVmZmVyIDFcclxuXHRcdFx0d2hpbGUoYnVmZmVyTGVuZ3RoMSA+IDcpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRidWZmZXJMZW5ndGgxIC09IDg7XHJcblx0XHRcdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjErK10gPSB0b0J5dGUoIGJ1ZmZlcjEgPj4gYnVmZmVyTGVuZ3RoMSApO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgdW5hcnlDb2RlTGVuZ3RoID0gKGRvY0lERGVsdGEgPj4gbG93Qml0c0xlbmd0aCkgKyAxO1xyXG5cdFx0XHRcclxuXHRcdFx0YnVmZmVyMiA8PD0gdW5hcnlDb2RlTGVuZ3RoO1xyXG5cdFx0XHRidWZmZXIyIHw9IDE7XHJcblx0XHRcdGJ1ZmZlckxlbmd0aDIgKz0gdW5hcnlDb2RlTGVuZ3RoO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gRmx1c2ggYnVmZmVyIDJcclxuXHRcdFx0d2hpbGUoYnVmZmVyTGVuZ3RoMiA+IDcpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRidWZmZXJMZW5ndGgyIC09IDg7XHJcblx0XHRcdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjIrK10gPSB0b0J5dGUoIGJ1ZmZlcjIgPj4gYnVmZmVyTGVuZ3RoMiApO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRsYXN0RG9jSUQgPSBkb2NJRDtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRpZihidWZmZXJMZW5ndGgxID4gMClcclxuXHRcdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjErK10gPSB0b0J5dGUoIGJ1ZmZlcjEgPDwgKDggLSBidWZmZXJMZW5ndGgxKSApO1xyXG5cdFx0XHJcblx0XHRpZihidWZmZXJMZW5ndGgyID4gMClcclxuXHRcdFx0Y29tcHJlc3NlZEJ1ZmZlcltjb21wcmVzc2VkQnVmZmVyUG9pbnRlcjIrK10gPSB0b0J5dGUoIGJ1ZmZlcjIgPDwgKDggLSBidWZmZXJMZW5ndGgyKSApO1xyXG5cdFx0XHJcblx0XHR2YXIgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkoY29tcHJlc3NlZEJ1ZmZlcik7XHJcblx0XHRcclxuXHRcdHJlc3VsdC5wb2ludGVyID0gY29tcHJlc3NlZEJ1ZmZlclBvaW50ZXIyO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuRWxpYXNGYW5vLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbihjb21wcmVzc2VkQnVmZmVyKVxyXG5cdHtcclxuXHRcdHZhciByZXN1bHRQb2ludGVyID0gMDtcclxuXHRcdHZhciBsaXN0ID0gW107XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJEZWNvZGluZyBidWZmZXIgZnJvbSBwb2ludGVyIFwiICsgY29tcHJlc3NlZEJ1ZmZlci5wb2ludGVyKTtcclxuXHRcdC8vY29uc29sZS5sb2coY29tcHJlc3NlZEJ1ZmZlcik7XHJcblx0XHRcclxuXHRcdHZhciBkZWNvZGluZ1RhYmxlSGlnaEJpdHMgPSBXUEdNWkEuRWxpYXNGYW5vLmRlY29kaW5nVGFibGVIaWdoQml0cztcclxuXHRcdHZhciBkZWNvZGluZ1RhYmxlRG9jSUROdW1iZXIgPSBXUEdNWkEuRWxpYXNGYW5vLmRlY29kaW5nVGFibGVEb2NJRE51bWJlcjtcclxuXHRcdHZhciBkZWNvZGluZ1RhYmxlSGlnaEJpdHNDYXJyeW92ZXIgPSBXUEdNWkEuRWxpYXNGYW5vLmRlY29kaW5nVGFibGVIaWdoQml0c0NhcnJ5b3ZlcjtcclxuXHRcdFxyXG5cdFx0dmFyIGxvd0JpdHNQb2ludGVyID0gMCxcclxuXHRcdFx0bGFzdERvY0lEID0gMCxcclxuXHRcdFx0ZG9jSUQgPSAwLFxyXG5cdFx0XHRkb2NJRE51bWJlciA9IDA7XHJcblx0XHRcclxuXHRcdHZhciBsaXN0Q291bnQgPSBjb21wcmVzc2VkQnVmZmVyW2xvd0JpdHNQb2ludGVyKytdO1xyXG5cdFx0XHJcblx0XHQvL2NvbnNvbGUubG9nKFwibGlzdENvdW50IGlzIG5vdyBcIiArIGxpc3RDb3VudCk7XHJcblx0XHRcclxuXHRcdGxpc3RDb3VudCB8PSBjb21wcmVzc2VkQnVmZmVyW2xvd0JpdHNQb2ludGVyKytdIDw8IDg7XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJsaXN0Q291bnQgaXMgbm93IFwiICsgbGlzdENvdW50KTtcclxuXHRcdFxyXG5cdFx0bGlzdENvdW50IHw9IGNvbXByZXNzZWRCdWZmZXJbbG93Qml0c1BvaW50ZXIrK10gPDwgMTY7XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJsaXN0Q291bnQgaXMgbm93IFwiICsgbGlzdENvdW50KTtcclxuXHRcdFxyXG5cdFx0bGlzdENvdW50IHw9IGNvbXByZXNzZWRCdWZmZXJbbG93Qml0c1BvaW50ZXIrK10gPDwgMjQ7XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJSZWFkIGxpc3QgY291bnQgXCIgKyBsaXN0Q291bnQpO1xyXG5cdFx0XHJcblx0XHR2YXIgbG93Qml0c0xlbmd0aCA9IGNvbXByZXNzZWRCdWZmZXJbbG93Qml0c1BvaW50ZXIrK107XHJcblx0XHRcclxuXHRcdC8vY29uc29sZS5sb2coXCJsb3dCaXRzTGVuZ3RoID0gXCIgKyBsb3dCaXRzTGVuZ3RoKTtcclxuXHRcdFxyXG5cdFx0dmFyIGhpZ2hCaXRzUG9pbnRlcixcclxuXHRcdFx0bG93Qml0c0NvdW50ID0gMCxcclxuXHRcdFx0bG93Qml0cyA9IDAsXHJcblx0XHRcdGNiID0gMTtcclxuXHRcdFxyXG5cdFx0Zm9yKFxyXG5cdFx0XHRoaWdoQml0c1BvaW50ZXIgPSBNYXRoLmZsb29yKGxvd0JpdHNMZW5ndGggKiBsaXN0Q291bnQgLyA4ICsgNik7XHJcblx0XHRcdGhpZ2hCaXRzUG9pbnRlciA8IGNvbXByZXNzZWRCdWZmZXIucG9pbnRlcjtcclxuXHRcdFx0aGlnaEJpdHNQb2ludGVyKytcclxuXHRcdFx0KVxyXG5cdFx0e1xyXG5cdFx0XHRkb2NJRCArPSBkZWNvZGluZ1RhYmxlSGlnaEJpdHNDYXJyeW92ZXJbY2JdO1xyXG5cdFx0XHRjYiA9IGNvbXByZXNzZWRCdWZmZXJbaGlnaEJpdHNQb2ludGVyXTtcclxuXHRcdFx0XHJcblx0XHRcdGRvY0lETnVtYmVyID0gZGVjb2RpbmdUYWJsZURvY0lETnVtYmVyW2NiXTtcclxuXHRcdFx0XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBkb2NJRE51bWJlcjsgaSsrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZG9jSUQgPDw9IGxvd0JpdHNDb3VudDtcclxuXHRcdFx0XHRkb2NJRCB8PSBsb3dCaXRzICYgKCgxIDw8IGxvd0JpdHNDb3VudCkgLSAxKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR3aGlsZShsb3dCaXRzQ291bnQgPCBsb3dCaXRzTGVuZ3RoKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGRvY0lEIDw8PSA4O1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRsb3dCaXRzID0gY29tcHJlc3NlZEJ1ZmZlcltsb3dCaXRzUG9pbnRlcisrXTtcclxuXHRcdFx0XHRcdGRvY0lEIHw9IGxvd0JpdHM7XHJcblx0XHRcdFx0XHRsb3dCaXRzQ291bnQgKz0gODtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bG93Qml0c0NvdW50IC09IGxvd0JpdHNMZW5ndGg7XHJcblx0XHRcdFx0ZG9jSUQgPj49IGxvd0JpdHNDb3VudDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRkb2NJRCArPSAoZGVjb2RpbmdUYWJsZUhpZ2hCaXRzW2NiXVtpXSA8PCBsb3dCaXRzTGVuZ3RoKSArIGxhc3REb2NJRCArIDE7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bGlzdFtyZXN1bHRQb2ludGVyKytdID0gZG9jSUQ7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bGFzdERvY0lEID0gZG9jSUQ7XHJcblx0XHRcdFx0ZG9jSUQgPSAwO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBsaXN0O1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJlbGlhcy1mYW5vLmpzIn0=


// js/v8/event-dispatcher.js
/**
 * @namespace WPGMZA
 * @module EventDispatcher
 * @requires WPGMZA
 * @gulp-requires core.js
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
	WPGMZA.EventDispatcher.prototype.dispatchEvent = function(event)
	{
		if(!(event instanceof WPGMZA.Event))
		{
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
 * @gulp-requires event-dispatcher.js
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
			types:	["geocode"]
		};
		
		if(json = $(element).attr("data-autocomplete-options"))
			options = $.extend(options, JSON.parse(json));
		
		if(map && map.settings.wpgmza_store_locator_restrict)
			options.country = map.settings.wpgmza_store_locator_restrict;
		
		if(WPGMZA.isGoogleAutocompleteSupported())
		{
			element.googleAutoComplete = new google.maps.places.Autocomplete(element, options);
			
			if(options.country)
				element.googleAutoComplete.setComponentRestrictions({country: options.country});
		}
		else if(WPGMZA.CloudAPI && WPGMZA.CloudAPI.isBeingUsed)
			element.cloudAutoComplete = new WPGMZA.CloudAutocomplete(element, options);
	}
	
	WPGMZA.extend(WPGMZA.AddressInput, WPGMZA.EventDispatcher);
	
	WPGMZA.AddressInput.createInstance = function(element, map)
	{
		return new WPGMZA.AddressInput(element, map);
	}
	
	/*$(window).on("load", function(event) {
		
		$("input.wpgmza-address").each(function(index, el) {
			
			el.wpgmzaAddressInput = WPGMZA.AddressInput.createInstance(el);
			
		});
		
	});*/
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhZGRyZXNzLWlucHV0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEFkZHJlc3NJbnB1dFxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyBldmVudC1kaXNwYXRjaGVyLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5BZGRyZXNzSW5wdXQgPSBmdW5jdGlvbihlbGVtZW50LCBtYXApXHJcblx0e1xyXG5cdFx0aWYoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgaXMgbm90IGFuIGluc3RhbmNlIG9mIEhUTUxJbnB1dEVsZW1lbnRcIik7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblx0XHRcclxuXHRcdHZhciBqc29uO1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB7XHJcblx0XHRcdGZpZWxkczogW1wibmFtZVwiLCBcImZvcm1hdHRlZF9hZGRyZXNzXCJdLFxyXG5cdFx0XHR0eXBlczpcdFtcImdlb2NvZGVcIl1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGlmKGpzb24gPSAkKGVsZW1lbnQpLmF0dHIoXCJkYXRhLWF1dG9jb21wbGV0ZS1vcHRpb25zXCIpKVxyXG5cdFx0XHRvcHRpb25zID0gJC5leHRlbmQob3B0aW9ucywgSlNPTi5wYXJzZShqc29uKSk7XHJcblx0XHRcclxuXHRcdGlmKG1hcCAmJiBtYXAuc2V0dGluZ3Mud3BnbXphX3N0b3JlX2xvY2F0b3JfcmVzdHJpY3QpXHJcblx0XHRcdG9wdGlvbnMuY291bnRyeSA9IG1hcC5zZXR0aW5ncy53cGdtemFfc3RvcmVfbG9jYXRvcl9yZXN0cmljdDtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLmlzR29vZ2xlQXV0b2NvbXBsZXRlU3VwcG9ydGVkKCkpXHJcblx0XHR7XHJcblx0XHRcdGVsZW1lbnQuZ29vZ2xlQXV0b0NvbXBsZXRlID0gbmV3IGdvb2dsZS5tYXBzLnBsYWNlcy5BdXRvY29tcGxldGUoZWxlbWVudCwgb3B0aW9ucyk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zLmNvdW50cnkpXHJcblx0XHRcdFx0ZWxlbWVudC5nb29nbGVBdXRvQ29tcGxldGUuc2V0Q29tcG9uZW50UmVzdHJpY3Rpb25zKHtjb3VudHJ5OiBvcHRpb25zLmNvdW50cnl9KTtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYoV1BHTVpBLkNsb3VkQVBJICYmIFdQR01aQS5DbG91ZEFQSS5pc0JlaW5nVXNlZClcclxuXHRcdFx0ZWxlbWVudC5jbG91ZEF1dG9Db21wbGV0ZSA9IG5ldyBXUEdNWkEuQ2xvdWRBdXRvY29tcGxldGUoZWxlbWVudCwgb3B0aW9ucyk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5leHRlbmQoV1BHTVpBLkFkZHJlc3NJbnB1dCwgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlcik7XHJcblx0XHJcblx0V1BHTVpBLkFkZHJlc3NJbnB1dC5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG1hcClcclxuXHR7XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5BZGRyZXNzSW5wdXQoZWxlbWVudCwgbWFwKTtcclxuXHR9XHJcblx0XHJcblx0LyokKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcclxuXHRcdCQoXCJpbnB1dC53cGdtemEtYWRkcmVzc1wiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xyXG5cdFx0XHRcclxuXHRcdFx0ZWwud3BnbXphQWRkcmVzc0lucHV0ID0gV1BHTVpBLkFkZHJlc3NJbnB1dC5jcmVhdGVJbnN0YW5jZShlbCk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHR9KTsqL1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6ImFkZHJlc3MtaW5wdXQuanMifQ==


// js/v8/event.js
/**
 * @namespace WPGMZA
 * @module Event
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJldmVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBFdmVudFxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovIFxyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyB1c2VkIGZvciBldmVudHMgKGZvciBub24tSFRNTEVsZW1lbnQgb2JqZWN0cylcclxuXHQgKiBAY2xhc3MgV1BHTVpBLkV2ZW50XHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5FdmVudFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IG9wdGlvbnMgVGhlIGV2ZW50IHR5cGUgYXMgYSBzdHJpbmcsIG9yIGFuIG9iamVjdCBvZiBvcHRpb25zIHRvIGJlIG1hcHBlZCB0byB0aGlzIGV2ZW50XHJcblx0ICovXHJcblx0V1BHTVpBLkV2ZW50ID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRpZih0eXBlb2Ygb3B0aW9ucyA9PSBcInN0cmluZ1wiKVxyXG5cdFx0XHR0aGlzLnR5cGUgPSBvcHRpb25zO1xyXG5cdFx0XHJcblx0XHR0aGlzLmJ1YmJsZXNcdFx0PSB0cnVlO1xyXG5cdFx0dGhpcy5jYW5jZWxhYmxlXHRcdD0gdHJ1ZTtcclxuXHRcdHRoaXMucGhhc2VcdFx0XHQ9IFdQR01aQS5FdmVudC5QSEFTRV9DQVBUVVJFO1xyXG5cdFx0dGhpcy50YXJnZXRcdFx0XHQ9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMuX2NhbmNlbGxlZCA9IGZhbHNlO1xyXG5cdFx0XHJcblx0XHRpZih0eXBlb2Ygb3B0aW9ucyA9PSBcIm9iamVjdFwiKVxyXG5cdFx0XHRmb3IodmFyIG5hbWUgaW4gb3B0aW9ucylcclxuXHRcdFx0XHR0aGlzW25hbWVdID0gb3B0aW9uc1tuYW1lXTtcclxuXHR9XHJcblxyXG5cdFdQR01aQS5FdmVudC5DQVBUVVJJTkdfUEhBU0VcdFx0PSAwO1xyXG5cdFdQR01aQS5FdmVudC5BVF9UQVJHRVRcdFx0XHRcdD0gMTtcclxuXHRXUEdNWkEuRXZlbnQuQlVCQkxJTkdfUEhBU0VcdFx0XHQ9IDI7XHJcblxyXG5cdC8qKlxyXG5cdCAqIFByZXZlbnRzIGFueSBmdXJ0aGVyIHByb3BhZ2F0aW9uIG9mIHRoaXMgZXZlbnRcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5FdmVudFxyXG5cdCAqL1xyXG5cdFdQR01aQS5FdmVudC5wcm90b3R5cGUuc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRoaXMuX2NhbmNlbGxlZCA9IHRydWU7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6ImV2ZW50LmpzIn0=


// js/v8/fancy-controls.js
/**
 * @namespace WPGMZA
 * @module FancyControls
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJmYW5jeS1jb250cm9scy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBGYW5jeUNvbnRyb2xzXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuRmFuY3lDb250cm9scyA9IHtcclxuXHRcdFxyXG5cdFx0Zm9ybWF0VG9nZ2xlU3dpdGNoOiBmdW5jdGlvbihlbClcclxuXHRcdHtcclxuXHRcdFx0dmFyIGRpdlx0XHRcdD0gJChcIjxkaXYgY2xhc3M9J3N3aXRjaCc+PC9kaXY+XCIpO1xyXG5cdFx0XHR2YXIgaW5wdXRcdFx0PSBlbDtcclxuXHRcdFx0dmFyIGNvbnRhaW5lclx0PSBlbC5wYXJlbnROb2RlO1xyXG5cdFx0XHR2YXIgdGV4dFx0XHQ9ICQoY29udGFpbmVyKS50ZXh0KCkudHJpbSgpO1xyXG5cdFx0XHR2YXIgbGFiZWxcdFx0PSAkKFwiPGxhYmVsPjwvbGFiZWw+XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChpbnB1dCkuYWRkQ2xhc3MoXCJjbW4tdG9nZ2xlIGNtbi10b2dnbGUtcm91bmQtZmxhdFwiKTtcclxuXHRcdFx0JChpbnB1dCkuYXR0cihcImlkXCIsICQoaW5wdXQpLmF0dHIoXCJuYW1lXCIpKTtcclxuXHRcdFx0XHJcblx0XHRcdCQobGFiZWwpLmF0dHIoXCJmb3JcIiwgJChpbnB1dCkuYXR0cihcIm5hbWVcIikpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChkaXYpLmFwcGVuZChpbnB1dCk7XHJcblx0XHRcdCQoZGl2KS5hcHBlbmQobGFiZWwpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChjb250YWluZXIpLnJlcGxhY2VXaXRoKGRpdik7XHJcblx0XHRcdFxyXG5cdFx0XHQkKGRpdikud3JhcCgkKFwiPGRpdj48L2Rpdj5cIikpO1xyXG5cdFx0XHQkKGRpdikuYWZ0ZXIodGV4dCk7XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHRmb3JtYXRUb2dnbGVCdXR0b246IGZ1bmN0aW9uKGVsKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgZGl2XHRcdFx0PSAkKFwiPGRpdiBjbGFzcz0nc3dpdGNoJz48L2Rpdj5cIik7XHJcblx0XHRcdHZhciBpbnB1dFx0XHQ9IGVsO1xyXG5cdFx0XHR2YXIgY29udGFpbmVyXHQ9IGVsLnBhcmVudE5vZGU7XHJcblx0XHRcdHZhciB0ZXh0XHRcdD0gJChjb250YWluZXIpLnRleHQoKS50cmltKCk7XHJcblx0XHRcdHZhciBsYWJlbFx0XHQ9ICQoXCI8bGFiZWw+PC9sYWJlbD5cIik7XHJcblx0XHRcdFxyXG5cdFx0XHQkKGlucHV0KS5hZGRDbGFzcyhcImNtbi10b2dnbGUgY21uLXRvZ2dsZS15ZXMtbm9cIik7XHJcblx0XHRcdCQoaW5wdXQpLmF0dHIoXCJpZFwiLCAkKGlucHV0KS5hdHRyKFwibmFtZVwiKSk7XHJcblx0XHRcdFxyXG5cdFx0XHQkKGxhYmVsKS5hdHRyKFwiZm9yXCIsICQoaW5wdXQpLmF0dHIoXCJuYW1lXCIpKTtcclxuXHRcdFx0XHJcblx0XHRcdCQobGFiZWwpLmF0dHIoXCJkYXRhLW9uXCIsIFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy55ZXMpO1xyXG5cdFx0XHQkKGxhYmVsKS5hdHRyKFwiZGF0YS1vZmZcIiwgV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLm5vKTtcclxuXHRcdFx0XHJcblx0XHRcdCQoZGl2KS5hcHBlbmQoaW5wdXQpO1xyXG5cdFx0XHQkKGRpdikuYXBwZW5kKGxhYmVsKTtcclxuXHRcdFx0XHJcblx0XHRcdCQoY29udGFpbmVyKS5yZXBsYWNlV2l0aChkaXYpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChkaXYpLndyYXAoJChcIjxkaXY+PC9kaXY+XCIpKTtcclxuXHRcdFx0JChkaXYpLmFmdGVyKHRleHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fTtcclxuXHRcclxuXHQkKFwiLndwZ216YS1mYW5jeS10b2dnbGUtc3dpdGNoXCIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XHJcblx0XHRXUEdNWkEuRmFuY3lDb250cm9scy5mb3JtYXRUb2dnbGVTd2l0Y2goZWwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdCQoXCIud3BnbXphLWZhbmN5LXRvZ2dsZS1idXR0b25cIikuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcclxuXHRcdFdQR01aQS5GYW5jeUNvbnRyb2xzLmZvcm1hdFRvZ2dsZUJ1dHRvbihlbCk7XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiZmFuY3ktY29udHJvbHMuanMifQ==


// js/v8/friendly-error.js
/**
 * @namespace WPGMZA
 * @module FriendlyError
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJmcmllbmRseS1lcnJvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBGcmllbmRseUVycm9yXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBEZXByZWNhdGVkXHJcblx0ICogQGNsYXNzIFdQR01aQS5GcmllbmRseUVycm9yXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5GcmllbmRseUVycm9yXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBkZXByZWNhdGVkXHJcblx0ICovXHJcblx0V1BHTVpBLkZyaWVuZGx5RXJyb3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qdmFyIHRlbXBsYXRlID0gJ1xcXHJcblx0XHQ8ZGl2IGNsYXNzPVwibm90aWNlIG5vdGljZS1lcnJvclwiPiBcXFxyXG5cdFx0XHQ8cD4gXFxcclxuXHRcdFx0JyArIFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5mcmllbmRseV9lcnJvciArICcgXFxcclxuXHRcdFx0PC9wPiBcXFxyXG5cdFx0XHQ8cHJlIHN0eWxlPVwid2hpdGUtc3BhY2U6IHByZS1saW5lO1wiPjwvcHJlPiBcXFxyXG5cdFx0PGRpdj4gXFxcclxuXHRcdCc7XHJcblx0XHJcblx0V1BHTVpBLkZyaWVuZGx5RXJyb3IgPSBmdW5jdGlvbihuYXRpdmVFcnJvcilcclxuXHR7XHJcblx0XHRpZighV1BHTVpBLmlzX2FkbWluKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmVsZW1lbnQgPSAkKFdQR01aQS5wcmVsb2FkZXJIVE1MKTtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWRcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0JChcIiN3cGdtemEtbWFwLWVkaXQtcGFnZT4ud3BnbXphLXByZWxvYWRlclwiKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5lbGVtZW50ID0gJCh0ZW1wbGF0ZSk7XHJcblx0XHR0aGlzLmVsZW1lbnQuZmluZChcInByZVwiKS5odG1sKG5hdGl2ZUVycm9yLm1lc3NhZ2UgKyBcIlxcclxcblwiICsgbmF0aXZlRXJyb3Iuc3RhY2sgKyBcIlxcclxcblxcclxcbiBvbiBcIiArIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcclxuXHR9Ki9cclxuXHRcclxufSk7Il0sImZpbGUiOiJmcmllbmRseS1lcnJvci5qcyJ9


// js/v8/geocoder.js
/**
 * @namespace WPGMZA
 * @module Geocoder
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnZW9jb2Rlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBHZW9jb2RlclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyBmb3IgZ2VvY29kZXJzLiA8c3Ryb25nPlBsZWFzZSA8ZW0+ZG8gbm90PC9lbT4gY2FsbCB0aGlzIGNvbnN0cnVjdG9yIGRpcmVjdGx5LiBBbHdheXMgdXNlIGNyZWF0ZUluc3RhbmNlIHJhdGhlciB0aGFuIGluc3RhbnRpYXRpbmcgdGhpcyBjbGFzcyBkaXJlY3RseS48L3N0cm9uZz4gVXNpbmcgY3JlYXRlSW5zdGFuY2UgYWxsb3dzIHRoaXMgY2xhc3MgdG8gYmUgZXh0ZXJuYWxseSBleHRlbnNpYmxlLlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuR2VvY29kZXJcclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBzZWUgV1BHTVpBLkdlb2NvZGVyLmNyZWF0ZUluc3RhbmNlXHJcblx0ICovXHJcblx0V1BHTVpBLkdlb2NvZGVyID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdFdQR01aQS5hc3NlcnRJbnN0YW5jZU9mKHRoaXMsIFwiR2VvY29kZXJcIik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEluZGljYXRlcyBhIHN1Y2Nlc3NmdWwgZ2VvY29kZSwgd2l0aCBvbmUgb3IgbW9yZSByZXN1bHRzXHJcblx0ICogQGNvbnN0YW50IFNVQ0NFU1NcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICovXHJcblx0V1BHTVpBLkdlb2NvZGVyLlNVQ0NFU1NcdFx0XHQ9IFwic3VjY2Vzc1wiO1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEluZGljYXRlcyB0aGUgZ2VvY29kZSB3YXMgc3VjY2Vzc2Z1bCwgYnV0IHJldHVybmVkIG5vIHJlc3VsdHNcclxuXHQgKiBAY29uc3RhbnQgWkVST19SRVNVTFRTXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5HZW9jb2Rlci5aRVJPX1JFU1VMVFNcdD0gXCJ6ZXJvLXJlc3VsdHNcIjtcclxuXHRcclxuXHQvKipcclxuXHQgKiBJbmRpY2F0ZXMgdGhlIGdlb2NvZGUgZmFpbGVkLCB1c3VhbGx5IGR1ZSB0byB0ZWNobmljYWwgcmVhc29ucyAoZWcgY29ubmVjdGl2aXR5KVxyXG5cdCAqIEBjb25zdGFudCBGQUlMXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5HZW9jb2Rlci5GQUlMXHRcdFx0PSBcImZhaWxcIjtcclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBjb250cnVjdG9yIHRvIGJlIHVzZWQgYnkgY3JlYXRlSW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgc2VsZWN0ZWQgbWFwcyBlbmdpbmUuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuR2VvY29kZXJcclxuXHQgKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIGFwcHJvcHJpYXRlIGNvbnRydWN0b3JcclxuXHQgKi9cclxuXHRXUEdNWkEuR2VvY29kZXIuZ2V0Q29uc3RydWN0b3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdHJldHVybiBXUEdNWkEuT0xHZW9jb2RlcjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRyZXR1cm4gV1BHTVpBLkdvb2dsZUdlb2NvZGVyO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgR2VvY29kZXIsIDxzdHJvbmc+cGxlYXNlIDxlbT5hbHdheXM8L2VtPiB1c2UgdGhpcyBmdW5jdGlvbiByYXRoZXIgdGhhbiBjYWxsaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseTwvc3Ryb25nPlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICogQHJldHVybiB7V1BHTVpBLkdlb2NvZGVyfSBBIHN1YmNsYXNzIG9mIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5HZW9jb2Rlci5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgY29uc3RydWN0b3IgPSBXUEdNWkEuR2VvY29kZXIuZ2V0Q29uc3RydWN0b3IoKTtcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3IoKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQXR0ZW1wdHMgdG8gY29udmVydCBhIHN0cmVldCBhZGRyZXNzIHRvIGFuIGFycmF5IG9mIHBvdGVudGlhbCBjb29yZGluYXRlcyB0aGF0IG1hdGNoIHRoZSBhZGRyZXNzLCB3aGljaCBhcmUgcGFzc2VkIHRvIGEgY2FsbGJhY2suIElmIHRoZSBhZGRyZXNzIGlzIGludGVycHJldGVkIGFzIGEgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBjb29yZGluYXRlIHBhaXIsIHRoZSBjYWxsYmFjayBpcyBpbW1lZGlhdGVseSBmaXJlZC5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIHRvIGdlb2NvZGUsIGFkZHJlc3MgaXMgbWFuZGF0b3J5LlxyXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBjYWxsYmFjayB0byByZWNlaXZlIHRoZSBnZW9jb2RlIHJlc3VsdC5cclxuXHQgKiBAcmV0dXJuIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5HZW9jb2Rlci5wcm90b3R5cGUuZ2V0TGF0TG5nRnJvbUFkZHJlc3MgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaylcclxuXHR7XHJcblx0XHRpZihXUEdNWkEuaXNMYXRMbmdTdHJpbmcob3B0aW9ucy5hZGRyZXNzKSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIHBhcnRzID0gb3B0aW9ucy5hZGRyZXNzLnNwbGl0KC8sXFxzKi8pO1xyXG5cdFx0XHR2YXIgbGF0TG5nID0gbmV3IFdQR01aQS5MYXRMbmcoe1xyXG5cdFx0XHRcdGxhdDogcGFyc2VGbG9hdChwYXJ0c1swXSksXHJcblx0XHRcdFx0bG5nOiBwYXJzZUZsb2F0KHBhcnRzWzFdKVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIE5COiBRdWljayBmaXgsIHNvbHZlcyBpc3N1ZSB3aXRoIHJpZ2h0IGNsaWNrIG1hcmtlci4gU29sdmUgdGhpcyB0aGVyZSBieSBtYWtpbmcgYmVoYXZpb3VyIGNvbnNpc3RlbnRcclxuXHRcdFx0bGF0TG5nLmxhdExuZyA9IGxhdExuZztcclxuXHRcdFx0XHJcblx0XHRcdGNhbGxiYWNrKFtsYXRMbmddLCBXUEdNWkEuR2VvY29kZXIuU1VDQ0VTUyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEF0dGVtcHRzIHRvIGNvbnZlcnQgbGF0aXR1ZGUgZWFuZCBsb25naXR1ZGUgY29vcmRpbmF0ZXMgaW50byBhIHN0cmVldCBhZGRyZXNzLiBCeSBkZWZhdWx0IHRoaXMgd2lsbCBzaW1wbHkgcmV0dXJuIHRoZSBjb29yZGluYXRlcyB3cmFwcGVkIGluIGFuIGFycmF5LlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgdG8gZ2VvY29kZSwgbGF0TG5nIGlzIG1hbmRhdG9yeS5cclxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gcmVjZWl2ZSB0aGUgZ2VvY29kZSByZXN1bHQuXHJcblx0ICogQHJldHVybiB7dm9pZH1cclxuXHQgKi9cclxuXHRXUEdNWkEuR2VvY29kZXIucHJvdG90eXBlLmdldEFkZHJlc3NGcm9tTGF0TG5nID0gZnVuY3Rpb24ob3B0aW9ucywgY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0dmFyIGxhdExuZyA9IG5ldyBXUEdNWkEuTGF0TG5nKG9wdGlvbnMubGF0TG5nKTtcclxuXHRcdGNhbGxiYWNrKFtsYXRMbmcudG9TdHJpbmcoKV0sIFdQR01aQS5HZW9jb2Rlci5TVUNDRVNTKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2VvY29kZXMgZWl0aGVyIGFuIGFkZHJlc3Mgb3IgYSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIGNvb3JkaW5hdGUgcGFpciwgZGVwZW5kaW5nIG9uIHRoZSBpbnB1dFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgdG8gZ2VvY29kZSwgeW91IG11c3Qgc3VwcGx5IDxlbT5laXRoZXI8L2VtPiBsYXRMbmcgPGVtPm9yPC9lbT4gYWRkcmVzcy5cclxuXHQgKiBAdGhyb3dzIFlvdSBtdXN0IHN1cHBseSBlaXRoZXIgYSBsYXRMbmcgb3IgYWRkcmVzc1xyXG5cdCAqIEByZXR1cm4ge3ZvaWR9XHJcblx0ICovXHJcblx0V1BHTVpBLkdlb2NvZGVyLnByb3RvdHlwZS5nZW9jb2RlID0gZnVuY3Rpb24ob3B0aW9ucywgY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0aWYoXCJhZGRyZXNzXCIgaW4gb3B0aW9ucylcclxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0TGF0TG5nRnJvbUFkZHJlc3Mob3B0aW9ucywgY2FsbGJhY2spO1xyXG5cdFx0ZWxzZSBpZihcImxhdExuZ1wiIGluIG9wdGlvbnMpXHJcblx0XHRcdHJldHVybiB0aGlzLmdldEFkZHJlc3NGcm9tTGF0TG5nKG9wdGlvbnMsIGNhbGxiYWNrKTtcclxuXHRcdFxyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc3VwcGx5IGVpdGhlciBhIGxhdExuZyBvciBhZGRyZXNzXCIpO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnZW9jb2Rlci5qcyJ9


// js/v8/google-api-error-handler.js
/**
 * @namespace WPGMZA
 * @module GoogleAPIErrorHandler
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtYXBpLWVycm9yLWhhbmRsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlQVBJRXJyb3JIYW5kbGVyXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHsgXHJcblxyXG5cdC8qKlxyXG5cdCAqIFRoaXMgY2xhc3MgY2F0Y2hlcyBHb29nbGUgTWFwcyBBUEkgZXJyb3JzIGFuZCBwcmVzZW50cyB0aGVtIGluIGEgZnJpZW5kbHkgbWFubmVyLCBiZWZvcmUgc2VuZGluZyB0aGVtIG9uIHRvIHRoZSBjb25zb2xlcyBkZWZhdWx0IGVycm9yIGhhbmRsZXIuXHJcblx0ICogQGNsYXNzIFdQR01aQS5Hb29nbGVBUElFcnJvckhhbmRsZXJcclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLkdvb2dsZUFQSUVycm9ySGFuZGxlclxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlQVBJRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0Ly8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgR29vZ2xlIGlzbid0IHRoZSBzZWxlY3RlZCBBUElcclxuXHRcdGlmKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgIT0gXCJnb29nbGUtbWFwc1wiKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdC8vIE9ubHkgYWxsb3cgb24gdGhlIG1hcCBlZGl0IHBhZ2UsIG9yIGZyb250IGVuZCBpZiB1c2VyIGhhcyBhZG1pbmlzdHJhdG9yIHJvbGVcclxuXHRcdGlmKCEoV1BHTVpBLmN1cnJlbnRQYWdlID09IFwibWFwLWVkaXRcIiB8fCAoV1BHTVpBLmlzX2FkbWluID09IDAgJiYgV1BHTVpBLnVzZXJDYW5BZG1pbmlzdHJhdG9yID09IDEpKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLmVsZW1lbnQgPSAkKFdQR01aQS5odG1sLmdvb2dsZU1hcHNBUElFcnJvckRpYWxvZyk7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5pc19hZG1pbiA9PSAxKVxyXG5cdFx0XHR0aGlzLmVsZW1lbnQuZmluZChcIi53cGdtemEtZnJvbnQtZW5kLW9ubHlcIikucmVtb3ZlKCk7XHJcblx0XHRcclxuXHRcdHRoaXMuZXJyb3JNZXNzYWdlTGlzdCA9IHRoaXMuZWxlbWVudC5maW5kKFwiLndwZ216YS1nb29nbGUtYXBpLWVycm9yLWxpc3RcIik7XHJcblx0XHR0aGlzLnRlbXBsYXRlTGlzdEl0ZW0gPSB0aGlzLmVsZW1lbnQuZmluZChcImxpLnRlbXBsYXRlXCIpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1lc3NhZ2VzQWxyZWFkeURpc3BsYXllZCA9IHt9O1xyXG5cdFx0XHJcblx0XHQvL2lmKFdQR01aQS5zZXR0aW5ncy5kZXZlbG9wZXJfbW9kZSlcclxuXHRcdFx0Ly9yZXR1cm47XHJcblx0XHRcclxuXHRcdC8vIE92ZXJyaWRlIGVycm9yIGZ1bmN0aW9uXHJcblx0XHR2YXIgX2Vycm9yID0gY29uc29sZS5lcnJvcjtcclxuXHRcdFxyXG5cdFx0Y29uc29sZS5lcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpXHJcblx0XHR7XHJcblx0XHRcdHNlbGYub25FcnJvck1lc3NhZ2UobWVzc2FnZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRfZXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2sgZm9yIG5vIEFQSSBrZXlcclxuXHRcdGlmKFxyXG5cdFx0XHRXUEdNWkEuc2V0dGluZ3MuZW5naW5lID09IFwiZ29vZ2xlLW1hcHNcIiBcclxuXHRcdFx0JiYgXHJcblx0XHRcdCghV1BHTVpBLnNldHRpbmdzLndwZ216YV9nb29nbGVfbWFwc19hcGlfa2V5IHx8ICFXUEdNWkEuc2V0dGluZ3Mud3BnbXphX2dvb2dsZV9tYXBzX2FwaV9rZXkubGVuZ3RoKVxyXG5cdFx0XHQmJlxyXG5cdFx0XHRXUEdNWkEuZ2V0Q3VycmVudFBhZ2UoKSAhPSBXUEdNWkEuUEFHRV9NQVBfRURJVFxyXG5cdFx0XHQpXHJcblx0XHRcdHRoaXMuYWRkRXJyb3JNZXNzYWdlKFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5ub19nb29nbGVfbWFwc19hcGlfa2V5LCBbXCJodHRwczovL3d3dy53cGdtYXBzLmNvbS9kb2N1bWVudGF0aW9uL2NyZWF0aW5nLWEtZ29vZ2xlLW1hcHMtYXBpLWtleS9cIl0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBPdmVycmlkZXMgY29uc29sZS5lcnJvciB0byBzY2FuIHRoZSBlcnJvciBtZXNzYWdlIGZvciBHb29nbGUgTWFwcyBBUEkgZXJyb3IgbWVzc2FnZXMuXHJcblx0ICogQG1ldGhvZCBcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdvb2dsZUFQSUVycm9ySGFuZGxlclxyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlIHBhc3NlZCB0byB0aGUgY29uc29sZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVBUElFcnJvckhhbmRsZXIucHJvdG90eXBlLm9uRXJyb3JNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSlcclxuXHR7XHJcblx0XHR2YXIgbTtcclxuXHRcdHZhciByZWdleFVSTCA9IC9odHRwKHMpPzpcXC9cXC9bXlxcc10rL2dtO1xyXG5cdFx0XHJcblx0XHRpZighbWVzc2FnZSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRpZigobSA9IG1lc3NhZ2UubWF0Y2goL1lvdSBoYXZlIGV4Y2VlZGVkIHlvdXIgKGRhaWx5ICk/cmVxdWVzdCBxdW90YSBmb3IgdGhpcyBBUEkvKSkgfHwgKG0gPSBtZXNzYWdlLm1hdGNoKC9UaGlzIEFQSSBwcm9qZWN0IGlzIG5vdCBhdXRob3JpemVkIHRvIHVzZSB0aGlzIEFQSS8pKSB8fCAobSA9IG1lc3NhZ2UubWF0Y2goL15HZW9jb2RpbmcgU2VydmljZTogLisvKSkpXHJcblx0XHR7XHJcblx0XHRcdHZhciB1cmxzID0gbWVzc2FnZS5tYXRjaChyZWdleFVSTCk7XHJcblx0XHRcdHRoaXMuYWRkRXJyb3JNZXNzYWdlKG1bMF0sIHVybHMpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihtID0gbWVzc2FnZS5tYXRjaCgvXkdvb2dsZSBNYXBzLitlcnJvcjogKC4rKVxccysoaHR0cChzPyk6XFwvXFwvLispL20pKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmFkZEVycm9yTWVzc2FnZShtWzFdLnJlcGxhY2UoLyhbQS1aXSkvZywgXCIgJDFcIiksIFttWzJdXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCBieSBvbkVycm9yTWVzc2FnZSB3aGVuIGEgR29vZ2xlIE1hcHMgQVBJIGVycm9yIGlzIHBpY2tlZCB1cCwgdGhpcyB3aWxsIGFkZCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UgdG8gdGhlIE1hcHMgQVBJIGVycm9yIG1lc3NhZ2UgZGlhbG9nLCBhbG9uZyB3aXRoIFVSTHMgdG8gY29tcGxpbWVudCBpdC4gVGhpcyBmdW5jdGlvbiBpZ25vcmVzIGR1cGxpY2F0ZSBlcnJvciBtZXNzYWdlcy5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Hb29nbGVBUElFcnJvckhhbmRsZXJcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgbWVzc2FnZSwgb3IgcGFydCBvZiB0aGUgbWVzc2FnZSwgaW50ZXJjZXB0ZWQgZnJvbSB0aGUgY29uc29sZVxyXG5cdCAqIEBwYXJhbSB7YXJyYXl9IFt1cmxzXSBBbiBhcnJheSBvZiBVUkxzIHJlbGF0aW5nIHRvIHRoZSBlcnJvciBtZXNzYWdlIHRvIGNvbXBsaW1lbnQgdGhlIG1lc3NhZ2UuXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZUFQSUVycm9ySGFuZGxlci5wcm90b3R5cGUuYWRkRXJyb3JNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgdXJscylcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMubWVzc2FnZXNBbHJlYWR5RGlzcGxheWVkW21lc3NhZ2VdKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdHZhciBsaSA9IHRoaXMudGVtcGxhdGVMaXN0SXRlbS5jbG9uZSgpO1xyXG5cdFx0JChsaSkuZmluZChcIi53cGdtemEtbWVzc2FnZVwiKS5odG1sKG1lc3NhZ2UpO1xyXG5cdFx0XHJcblx0XHR2YXIgYnV0dG9uQ29udGFpbmVyID0gJChsaSkuZmluZChcIi53cGdtemEtZG9jdW1lbnRhdGlvbi1idXR0b25zXCIpO1xyXG5cdFx0XHJcblx0XHR2YXIgYnV0dG9uVGVtcGxhdGUgPSAkKGxpKS5maW5kKFwiLndwZ216YS1kb2N1bWVudGF0aW9uLWJ1dHRvbnM+YVwiKTtcclxuXHRcdGJ1dHRvblRlbXBsYXRlLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0XHRpZih1cmxzICYmIHVybHMubGVuZ3RoKVxyXG5cdFx0e1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciB1cmwgPSB1cmxzW2ldO1xyXG5cdFx0XHRcdHZhciBidXR0b24gPSBidXR0b25UZW1wbGF0ZS5jbG9uZSgpO1xyXG5cdFx0XHRcdHZhciBpY29uID0gXCJmYS1leHRlcm5hbC1saW5rXCI7XHJcblx0XHRcdFx0dmFyIHRleHQgPSBXUEdNWkEubG9jYWxpemVkX3N0cmluZ3MuZG9jdW1lbnRhdGlvbjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRidXR0b24uYXR0cihcImhyZWZcIiwgdXJsc1tpXSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0LyppZih1cmwubWF0Y2goL2dvb2dsZS4rZG9jdW1lbnRhdGlvbi8pKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdC8vIGljb24gPSBcImZhLWdvb2dsZVwiO1xyXG5cdFx0XHRcdFx0aWNvbiA9IFwiZmEtd3JlbmNoXCJcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZih1cmwubWF0Y2goL21hcHMtbm8tYWNjb3VudC8pKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGljb24gPSBcImZhLXdyZW5jaFwiXHJcblx0XHRcdFx0XHR0ZXh0ID0gV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLnZlcmlmeV9wcm9qZWN0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlIGlmKHVybC5tYXRjaCgvY29uc29sZVxcLmRldmVsb3BlcnNcXC5nb29nbGUvKSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRpY29uID0gXCJmYS13cmVuY2hcIjtcclxuXHRcdFx0XHRcdHRleHQgPSBXUEdNWkEubG9jYWxpemVkX3N0cmluZ3MuYXBpX2Rhc2hib2FyZDtcclxuXHRcdFx0XHR9Ki9cclxuXHRcdFx0XHRcclxuXHRcdFx0XHQkKGJ1dHRvbikuZmluZChcImlcIikuYWRkQ2xhc3MoaWNvbik7XHJcblx0XHRcdFx0JChidXR0b24pLmFwcGVuZCh0ZXh0KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0YnV0dG9uQ29udGFpbmVyLmFwcGVuZChidXR0b24pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQkKHRoaXMuZXJyb3JNZXNzYWdlTGlzdCkuYXBwZW5kKGxpKTtcclxuXHRcdFxyXG5cdFx0LyppZighdGhpcy5kaWFsb2cpXHJcblx0XHRcdHRoaXMuZGlhbG9nID0gJCh0aGlzLmVsZW1lbnQpLnJlbW9kYWwoKTtcclxuXHRcdFxyXG5cdFx0c3dpdGNoKHRoaXMuZGlhbG9nLmdldFN0YXRlKCkpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuXCI6XHJcblx0XHRcdGNhc2UgXCJvcGVuZWRcIjpcclxuXHRcdFx0Y2FzZSBcIm9wZW5pbmdcIjpcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHR0aGlzLmRpYWxvZy5vcGVuKCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9Ki9cclxuXHRcdFxyXG5cdFx0JChcIiN3cGdtemFfbWFwLCAud3BnbXphX21hcFwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNvbnRhaW5lciA9ICQoZWwpLmZpbmQoXCIud3BnbXphLWdvb2dsZS1tYXBzLWFwaS1lcnJvci1vdmVybGF5XCIpO1xyXG5cclxuXHRcdFx0aWYoY29udGFpbmVyLmxlbmd0aCA9PSAwKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y29udGFpbmVyID0gJChcIjxkaXYgY2xhc3M9J3dwZ216YS1nb29nbGUtbWFwcy1hcGktZXJyb3Itb3ZlcmxheSc+PC9kaXY+XCIpO1xyXG5cdFx0XHRcdGNvbnRhaW5lci5odG1sKHNlbGYuZWxlbWVudC5odG1sKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQoZWwpLmFwcGVuZChjb250YWluZXIpO1xyXG5cdFx0XHR9LCAxMDAwKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKFwiLmdtLWVyci1jb250YWluZXJcIikucGFyZW50KCkuY3NzKHtcInotaW5kZXhcIjogMX0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1lc3NhZ2VzQWxyZWFkeURpc3BsYXllZFttZXNzYWdlXSA9IHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5nb29nbGVBUElFcnJvckhhbmRsZXIgPSBuZXcgV1BHTVpBLkdvb2dsZUFQSUVycm9ySGFuZGxlcigpO1xyXG5cclxufSk7Il0sImZpbGUiOiJnb29nbGUtYXBpLWVycm9yLWhhbmRsZXIuanMifQ==


// js/v8/info-window.js
/**
 * @namespace WPGMZA
 * @module InfoWindow
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	/**
	 * Base class for infoWindows. This acts as an abstract class so that infoWindows for both Google and OpenLayers can be interacted with seamlessly by the overlying logic. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.InfoWindow
	 * @constructor WPGMZA.InfoWindow
	 * @memberof WPGMZA
	 * @see WPGMZA.InfoWindow.createInstance
	 */
	WPGMZA.InfoWindow = function(mapObject)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		WPGMZA.assertInstanceOf(this, "InfoWindow");
		
		this.on("infowindowopen", function(event) {
			self.onOpen(event);
		});
		
		if(!mapObject)
			return;
		
		this.mapObject = mapObject;
		this.state = WPGMZA.InfoWindow.STATE_CLOSED;
		
		if(mapObject.map)
		{
			// This has to be slightly delayed so the map initialization won't overwrite the infowindow element
			setTimeout(function() {
				self.onMapObjectAdded(event);
			}, 100);
		}
		else
			mapObject.addEventListener("added", function(event) { 
				self.onMapObjectAdded(event);
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
	WPGMZA.InfoWindow.createInstance = function(mapObject)
	{
		var constructor = this.getConstructor();
		return new constructor(mapObject);
	}
	
	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.getContent = function(callback)
	{
		var html = "";
		
		if(this.mapObject instanceof WPGMZA.Marker)
			html = this.mapObject.address;
		
		callback(html);
	}
	
	/**
	 * Opens the info window on the specified map, with the specified map object as the subject.
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 * @param {WPGMZA.Map} map The map to open this InfoWindow on.
	 * @param {WPGMZA.MapObject} mapObject The map object (eg marker, polygon) to open this InfoWindow on.
	 * @return boolean FALSE if the info window should not and will not open, TRUE if it will. This can be used by subclasses to establish whether or not the subclassed open should bail or open the window.
	 */
	WPGMZA.InfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		this.mapObject = mapObject;
		
		if(WPGMZA.settings.disable_infowindows || WPGMZA.settings.wpgmza_settings_disable_infowindows == "1")
			return false;
		
		if(this.mapObject.disableInfoWindow)
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
	WPGMZA.InfoWindow.prototype.onMapObjectAdded = function()
	{
		if(this.mapObject.settings.infoopen == 1)
			this.open();
	}
	
	WPGMZA.InfoWindow.prototype.onOpen = function()
	{
		
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJpbmZvLXdpbmRvdy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBJbmZvV2luZG93XHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuRXZlbnREaXNwYXRjaGVyXHJcbiAqIEBndWxwLXJlcXVpcmVzIGV2ZW50LWRpc3BhdGNoZXIuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyBmb3IgaW5mb1dpbmRvd3MuIFRoaXMgYWN0cyBhcyBhbiBhYnN0cmFjdCBjbGFzcyBzbyB0aGF0IGluZm9XaW5kb3dzIGZvciBib3RoIEdvb2dsZSBhbmQgT3BlbkxheWVycyBjYW4gYmUgaW50ZXJhY3RlZCB3aXRoIHNlYW1sZXNzbHkgYnkgdGhlIG92ZXJseWluZyBsb2dpYy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLkluZm9XaW5kb3dcclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLkluZm9XaW5kb3dcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQHNlZSBXUEdNWkEuSW5mb1dpbmRvdy5jcmVhdGVJbnN0YW5jZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5JbmZvV2luZG93ID0gZnVuY3Rpb24obWFwT2JqZWN0KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0V1BHTVpBLkV2ZW50RGlzcGF0Y2hlci5jYWxsKHRoaXMpO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuYXNzZXJ0SW5zdGFuY2VPZih0aGlzLCBcIkluZm9XaW5kb3dcIik7XHJcblx0XHRcclxuXHRcdHRoaXMub24oXCJpbmZvd2luZG93b3BlblwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uT3BlbihldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aWYoIW1hcE9iamVjdClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcE9iamVjdCA9IG1hcE9iamVjdDtcclxuXHRcdHRoaXMuc3RhdGUgPSBXUEdNWkEuSW5mb1dpbmRvdy5TVEFURV9DTE9TRUQ7XHJcblx0XHRcclxuXHRcdGlmKG1hcE9iamVjdC5tYXApXHJcblx0XHR7XHJcblx0XHRcdC8vIFRoaXMgaGFzIHRvIGJlIHNsaWdodGx5IGRlbGF5ZWQgc28gdGhlIG1hcCBpbml0aWFsaXphdGlvbiB3b24ndCBvdmVyd3JpdGUgdGhlIGluZm93aW5kb3cgZWxlbWVudFxyXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHNlbGYub25NYXBPYmplY3RBZGRlZChldmVudCk7XHJcblx0XHRcdH0sIDEwMCk7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHRcdG1hcE9iamVjdC5hZGRFdmVudExpc3RlbmVyKFwiYWRkZWRcIiwgZnVuY3Rpb24oZXZlbnQpIHsgXHJcblx0XHRcdFx0c2VsZi5vbk1hcE9iamVjdEFkZGVkKGV2ZW50KTtcclxuXHRcdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5JbmZvV2luZG93O1xyXG5cdFxyXG5cdFdQR01aQS5JbmZvV2luZG93Lk9QRU5fQllfQ0xJQ0sgPSAxO1xyXG5cdFdQR01aQS5JbmZvV2luZG93Lk9QRU5fQllfSE9WRVIgPSAyO1xyXG5cdFxyXG5cdFdQR01aQS5JbmZvV2luZG93LlNUQVRFX09QRU5cdD0gXCJvcGVuXCI7XHJcblx0V1BHTVpBLkluZm9XaW5kb3cuU1RBVEVfQ0xPU0VEXHQ9IFwiY2xvc2VkXCI7XHJcblx0XHJcblx0LyoqXHJcblx0ICogRmV0Y2hlcyB0aGUgY29uc3RydWN0b3IgdG8gYmUgdXNlZCBieSBjcmVhdGVJbnN0YW5jZSwgYmFzZWQgb24gdGhlIHNlbGVjdGVkIG1hcHMgZW5naW5lXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuSW5mb1dpbmRvd1xyXG5cdCAqIEByZXR1cm4ge2Z1bmN0aW9ufSBUaGUgYXBwcm9wcmlhdGUgY29uc3RydWN0b3JcclxuXHQgKi9cclxuXHRXUEdNWkEuSW5mb1dpbmRvdy5nZXRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRzd2l0Y2goV1BHTVpBLnNldHRpbmdzLmVuZ2luZSlcclxuXHRcdHtcclxuXHRcdFx0Y2FzZSBcIm9wZW4tbGF5ZXJzXCI6XHJcblx0XHRcdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTFByb0luZm9XaW5kb3c7XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTEluZm9XaW5kb3c7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFxyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFx0XHRcdHJldHVybiBXUEdNWkEuR29vZ2xlUHJvSW5mb1dpbmRvdztcclxuXHRcdFx0XHRyZXR1cm4gV1BHTVpBLkdvb2dsZUluZm9XaW5kb3c7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYW4gSW5mb1dpbmRvdywgPHN0cm9uZz5wbGVhc2UgPGVtPmFsd2F5czwvZW0+IHVzZSB0aGlzIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGNhbGxpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5PC9zdHJvbmc+XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuSW5mb1dpbmRvd1xyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBvYmplY3QgKG9wdGlvbmFsKVxyXG5cdCAqL1xyXG5cdFdQR01aQS5JbmZvV2luZG93LmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24obWFwT2JqZWN0KVxyXG5cdHtcclxuXHRcdHZhciBjb25zdHJ1Y3RvciA9IHRoaXMuZ2V0Q29uc3RydWN0b3IoKTtcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3IobWFwT2JqZWN0KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgY29udGVudCBmb3IgdGhlIGluZm8gd2luZG93IGFuZCBwYXNzZXMgaXQgdG8gdGhlIHNwZWNpZmllZCBjYWxsYmFjayAtIHRoaXMgYWxsb3dzIGZvciBkZWxheWVkIGxvYWRpbmcgKGVnIEFKQVgpIGFzIHdlbGwgYXMgaW5zdGFudCBjb250ZW50XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuSW5mb1dpbmRvd1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5nZXRDb250ZW50ID0gZnVuY3Rpb24oY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0dmFyIGh0bWwgPSBcIlwiO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLm1hcE9iamVjdCBpbnN0YW5jZW9mIFdQR01aQS5NYXJrZXIpXHJcblx0XHRcdGh0bWwgPSB0aGlzLm1hcE9iamVjdC5hZGRyZXNzO1xyXG5cdFx0XHJcblx0XHRjYWxsYmFjayhodG1sKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogT3BlbnMgdGhlIGluZm8gd2luZG93IG9uIHRoZSBzcGVjaWZpZWQgbWFwLCB3aXRoIHRoZSBzcGVjaWZpZWQgbWFwIG9iamVjdCBhcyB0aGUgc3ViamVjdC5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5JbmZvV2luZG93XHJcblx0ICogQHBhcmFtIHtXUEdNWkEuTWFwfSBtYXAgVGhlIG1hcCB0byBvcGVuIHRoaXMgSW5mb1dpbmRvdyBvbi5cclxuXHQgKiBAcGFyYW0ge1dQR01aQS5NYXBPYmplY3R9IG1hcE9iamVjdCBUaGUgbWFwIG9iamVjdCAoZWcgbWFya2VyLCBwb2x5Z29uKSB0byBvcGVuIHRoaXMgSW5mb1dpbmRvdyBvbi5cclxuXHQgKiBAcmV0dXJuIGJvb2xlYW4gRkFMU0UgaWYgdGhlIGluZm8gd2luZG93IHNob3VsZCBub3QgYW5kIHdpbGwgbm90IG9wZW4sIFRSVUUgaWYgaXQgd2lsbC4gVGhpcyBjYW4gYmUgdXNlZCBieSBzdWJjbGFzc2VzIHRvIGVzdGFibGlzaCB3aGV0aGVyIG9yIG5vdCB0aGUgc3ViY2xhc3NlZCBvcGVuIHNob3VsZCBiYWlsIG9yIG9wZW4gdGhlIHdpbmRvdy5cclxuXHQgKi9cclxuXHRXUEdNWkEuSW5mb1dpbmRvdy5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKG1hcCwgbWFwT2JqZWN0KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXBPYmplY3QgPSBtYXBPYmplY3Q7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5zZXR0aW5ncy5kaXNhYmxlX2luZm93aW5kb3dzIHx8IFdQR01aQS5zZXR0aW5ncy53cGdtemFfc2V0dGluZ3NfZGlzYWJsZV9pbmZvd2luZG93cyA9PSBcIjFcIilcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLm1hcE9iamVjdC5kaXNhYmxlSW5mb1dpbmRvdylcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0YXRlID0gV1BHTVpBLkluZm9XaW5kb3cuU1RBVEVfT1BFTjtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFic3RyYWN0IGZ1bmN0aW9uLCBjbG9zZXMgdGhpcyBJbmZvV2luZG93XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuSW5mb1dpbmRvd1xyXG5cdCAqL1xyXG5cdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZih0aGlzLnN0YXRlID09IFdQR01aQS5JbmZvV2luZG93LlNUQVRFX0NMT1NFRClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0YXRlID0gV1BHTVpBLkluZm9XaW5kb3cuU1RBVEVfQ0xPU0VEO1xyXG5cdFx0dGhpcy50cmlnZ2VyKFwiaW5mb3dpbmRvd2Nsb3NlXCIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiwgc2V0cyB0aGUgY29udGVudCBpbiB0aGlzIEluZm9XaW5kb3dcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5JbmZvV2luZG93XHJcblx0ICovXHJcblx0V1BHTVpBLkluZm9XaW5kb3cucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiwgc2V0cyBvcHRpb25zIG9uIHRoaXMgSW5mb1dpbmRvd1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkluZm9XaW5kb3dcclxuXHQgKi9cclxuXHRXUEdNWkEuSW5mb1dpbmRvdy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEV2ZW50IGxpc3RlbmVyIGZvciB3aGVuIHRoZSBtYXAgb2JqZWN0IGlzIGFkZGVkLiBUaGlzIHdpbGwgY2F1c2UgdGhlIGluZm8gd2luZG93IHRvIG9wZW4gaWYgdGhlIG1hcCBvYmplY3QgaGFzIGluZm9vcGVuIHNldFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkluZm9XaW5kb3dcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuSW5mb1dpbmRvdy5wcm90b3R5cGUub25NYXBPYmplY3RBZGRlZCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZih0aGlzLm1hcE9iamVjdC5zZXR0aW5ncy5pbmZvb3BlbiA9PSAxKVxyXG5cdFx0XHR0aGlzLm9wZW4oKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkluZm9XaW5kb3cucHJvdG90eXBlLm9uT3BlbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiaW5mby13aW5kb3cuanMifQ==


// js/v8/latlng.js
/**
 * @namespace WPGMZA
 * @module LatLng
 * @requires WPGMZA
 * @gulp-requires core.js
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
			if(!$.isNumeric(val))
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
			if(!$.isNumeric(val))
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsYXRsbmcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTGF0TG5nXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHJcblx0LyoqXHJcblx0ICogVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBjb29yZGluYXRlIHBhaXIsIGFuZCBwcm92aWRlcyB1dGlsaXRpZXMgdG8gd29yayB3aXRoIGNvb3JkaW5hdGVzLCBwYXJzaW5nIGFuZCBjb252ZXJzaW9uLlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuTGF0TG5nXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5MYXRMbmdcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQHBhcmFtIHtudW1iZXJ8b2JqZWN0fSBhcmcgQSBsYXRMbmcgbGl0ZXJhbCwgb3IgbGF0aXR1ZGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gW2xuZ10gVGhlIGxhdGl0dWRlLCB3aGVyZSBhcmcgaXMgYSBsb25naXR1ZGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTGF0TG5nID0gZnVuY3Rpb24oYXJnLCBsbmcpXHJcblx0e1xyXG5cdFx0dGhpcy5fbGF0ID0gMDtcclxuXHRcdHRoaXMuX2xuZyA9IDA7XHJcblx0XHRcclxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPT0gMClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09IDEpXHJcblx0XHR7XHJcblx0XHRcdC8vIFRPRE86IFN1cHBvcnQgbGF0bG5nIHN0cmluZ1xyXG5cdFx0XHRcclxuXHRcdFx0aWYodHlwZW9mIGFyZyA9PSBcInN0cmluZ1wiKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIG07XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoIShtID0gYXJnLm1hdGNoKFdQR01aQS5MYXRMbmcuUkVHRVhQKSkpXHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIExhdExuZyBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0YXJnID0ge1xyXG5cdFx0XHRcdFx0bGF0OiBtWzFdLFxyXG5cdFx0XHRcdFx0bG5nOiBtWzNdXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYodHlwZW9mIGFyZyAhPSBcIm9iamVjdFwiIHx8ICEoXCJsYXRcIiBpbiBhcmcgJiYgXCJsbmdcIiBpbiBhcmcpKVxyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IG11c3QgYmUgYSBMYXRMbmcgbGl0ZXJhbFwiKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubGF0ID0gYXJnLmxhdDtcclxuXHRcdFx0dGhpcy5sbmcgPSBhcmcubG5nO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmxhdCA9IGFyZztcclxuXHRcdFx0dGhpcy5sbmcgPSBsbmc7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEEgcmVndWxhciBleHByZXNzaW9uIHdoaWNoIG1hdGNoZXMgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBjb29yZGluYXRlIHBhaXJzIGZyb20gYSBzdHJpbmcuIE1hdGNoZXMgMSBhbmQgMyBjb3JyZXNwb25kIHRvIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUsIHJlc3BlY3RpdmVseSxcclxuXHQgKiBAY29uc3RhbnQge1JlZ0V4cH1cclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkxhdExuZ1xyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmcuUkVHRVhQID0gL14oXFwtP1xcZCsoXFwuXFxkKyk/KSxcXHMqKFxcLT9cXGQrKFxcLlxcZCspPykkLztcclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHN1cHBsaWVkIG9iamVjdCBpcyBhIExhdExuZyBsaXRlcmFsLCBhbHNvIHJldHVybnMgdHJ1ZSBmb3IgaW5zdGFuY2VzIG9mIFdQR01aQS5MYXRMbmdcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQHN0YXRpY1xyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IG9iaiBBIExhdExuZyBsaXRlcmFsLCBvciBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHJldHVybiB7Ym9vbH0gVHJ1ZSBpZiB0aGlzIG9iamVjdCBpcyBhIHZhbGlkIExhdExuZyBsaXRlcmFsIG9yIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcclxuXHQgKi9cclxuXHRXUEdNWkEuTGF0TG5nLmlzVmFsaWQgPSBmdW5jdGlvbihvYmopXHJcblx0e1xyXG5cdFx0aWYodHlwZW9mIG9iaiAhPSBcIm9iamVjdFwiKVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcclxuXHRcdGlmKCEoXCJsYXRcIiBpbiBvYmogJiYgXCJsbmdcIiBpbiBvYmopKVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nLmlzTGF0TG5nU3RyaW5nID0gZnVuY3Rpb24oc3RyKVxyXG5cdHtcclxuXHRcdGlmKHR5cGVvZiBzdHIgIT0gXCJzdHJpbmdcIilcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gc3RyLm1hdGNoKFdQR01aQS5MYXRMbmcuUkVHRVhQKSA/IHRydWUgOiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIGxhdGl0dWRlLCBndWFyYW50ZWVkIHRvIGJlIGEgbnVtYmVyXHJcblx0ICogQHByb3BlcnR5IGxhdFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICovXHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFdQR01aQS5MYXRMbmcucHJvdG90eXBlLCBcImxhdFwiLCB7XHJcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fbGF0O1xyXG5cdFx0fSxcclxuXHRcdHNldDogZnVuY3Rpb24odmFsKSB7XHJcblx0XHRcdGlmKCEkLmlzTnVtZXJpYyh2YWwpKVxyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkxhdGl0dWRlIG11c3QgYmUgbnVtZXJpY1wiKTtcclxuXHRcdFx0dGhpcy5fbGF0ID0gcGFyc2VGbG9hdCggdmFsICk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIGxvbmdpdHVkZSwgZ3VhcmFudGVlZCB0byBiZSBhIG51bWJlclxyXG5cdCAqIEBwcm9wZXJ0eSBsbmdcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkxhdExuZ1xyXG5cdCAqL1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuTGF0TG5nLnByb3RvdHlwZSwgXCJsbmdcIiwge1xyXG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2xuZztcclxuXHRcdH0sXHJcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbCkge1xyXG5cdFx0XHRpZighJC5pc051bWVyaWModmFsKSlcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJMb25naXR1ZGUgbXVzdCBiZSBudW1lcmljXCIpO1xyXG5cdFx0XHR0aGlzLl9sbmcgPSBwYXJzZUZsb2F0KCB2YWwgKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nLmZyb21TdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpXHJcblx0e1xyXG5cdFx0aWYoIVdQR01aQS5MYXRMbmcuaXNMYXRMbmdTdHJpbmcoc3RyaW5nKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGEgdmFsaWQgbGF0bG5nIHN0cmluZ1wiKTtcclxuXHRcdFxyXG5cdFx0dmFyIG0gPSBzdHJpbmcubWF0Y2goV1BHTVpBLkxhdExuZy5SRUdFWFApO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5MYXRMbmcoe1xyXG5cdFx0XHRsYXQ6IHBhcnNlRmxvYXQobVsxXSksXHJcblx0XHRcdGxuZzogcGFyc2VGbG9hdChtWzNdKVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhpcyBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIGFzIGEgc3RyaW5nXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHJldHVybiB7c3RyaW5nfSBUaGlzIG9iamVjdCByZXByZXNlbnRlZCBhcyBhIHN0cmluZ1xyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9sYXQgKyBcIiwgXCIgKyB0aGlzLl9sbmc7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFF1ZXJpZXMgdGhlIHVzZXJzIGN1cnJlbnQgbG9jYXRpb24gYW5kIHBhc3NlcyBpdCB0byBhIGNhbGxiYWNrLCB5b3UgY2FuIHBhc3NcclxuXHQgKiBnZW9jb2RlQWRkcmVzcyB0aHJvdWdoIG9wdGlvbnMgaWYgeW91IHdvdWxkIGxpa2UgdG8gYWxzbyByZWNlaXZlIHRoZSBhZGRyZXNzXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gQSBjYWxsYmFjayB0byByZWNlaXZlIHRoZSBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IEFuIG9iamVjdCBvZiBvcHRpb25zLCBvbmx5IGdlb2NvZGVBZGRyZXNzIGlzIGN1cnJlbnRseSBzdXBwb3J0ZWRcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTGF0TG5nLmZyb21DdXJyZW50UG9zaXRpb24gPSBmdW5jdGlvbihjYWxsYmFjaywgb3B0aW9ucylcclxuXHR7XHJcblx0XHRpZighb3B0aW9ucylcclxuXHRcdFx0b3B0aW9ucyA9IHt9O1xyXG5cdFx0XHJcblx0XHRpZighY2FsbGJhY2spXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0V1BHTVpBLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbihwb3NpdGlvbikge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGxhdExuZyA9IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0XHRsYXQ6IHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRsbmc6IHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zLmdlb2NvZGVBZGRyZXNzKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIGdlb2NvZGVyID0gV1BHTVpBLkdlb2NvZGVyLmNyZWF0ZUluc3RhbmNlKCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Z2VvY29kZXIuZ2V0QWRkcmVzc0Zyb21MYXRMbmcoe1xyXG5cdFx0XHRcdFx0bGF0TG5nOiBsYXRMbmdcclxuXHRcdFx0XHR9LCBmdW5jdGlvbihyZXN1bHRzKSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKHJlc3VsdHMubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHRsYXRMbmcuYWRkcmVzcyA9IHJlc3VsdHNbMF07XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNhbGxiYWNrKGxhdExuZyk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRcclxuXHRcdFx0fVx0XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjYWxsYmFjayhsYXRMbmcpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGFuIGluc3RuYWNlIG9mIFdQR01aQS5MYXRMbmcgZnJvbSBhbiBpbnN0YW5jZSBvZiBnb29nbGUubWFwcy5MYXRMbmdcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQHN0YXRpY1xyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHBhcmFtIHtnb29nbGUubWFwcy5MYXRMbmd9IFRoZSBnb29nbGUubWFwcy5MYXRMbmcgdG8gY29udmVydFxyXG5cdCAqIEByZXR1cm4ge1dQR01aQS5MYXRMbmd9IEFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmcgYnVpbHQgZnJvbSB0aGUgc3VwcGxpZWQgZ29vZ2xlLm1hcHMuTGF0TG5nXHJcblx0ICovXHJcblx0V1BHTVpBLkxhdExuZy5mcm9tR29vZ2xlTGF0TG5nID0gZnVuY3Rpb24oZ29vZ2xlTGF0TG5nKVxyXG5cdHtcclxuXHRcdHJldHVybiBuZXcgV1BHTVpBLkxhdExuZyhcclxuXHRcdFx0Z29vZ2xlTGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRnb29nbGVMYXRMbmcubG5nKClcclxuXHRcdCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5MYXRMbmcudG9Hb29nbGVMYXRMbmdBcnJheSA9IGZ1bmN0aW9uKGFycilcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gW107XHJcblx0XHRcclxuXHRcdGFyci5mb3JFYWNoKGZ1bmN0aW9uKG5hdGl2ZUxhdExuZykge1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoISAobmF0aXZlTGF0TG5nIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZyB8fCAoXCJsYXRcIiBpbiBuYXRpdmVMYXRMbmcgJiYgXCJsbmdcIiBpbiBuYXRpdmVMYXRMbmcpKSApXHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBpbnB1dFwiKTtcclxuXHRcdFx0XHJcblx0XHRcdHJlc3VsdC5wdXNoKG5ldyBnb29nbGUubWFwcy5MYXRMbmcoe1xyXG5cdFx0XHRcdGxhdDogcGFyc2VGbG9hdChuYXRpdmVMYXRMbmcubGF0KSxcclxuXHRcdFx0XHRsbmc6IHBhcnNlRmxvYXQobmF0aXZlTGF0TG5nLmxuZylcclxuXHRcdFx0fSkpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIGdvb2dsZS5tYXBzLkxhdExuZyB3aXRoIHRoZSBzYW1lIGNvb3JkaW5hdGVzIGFzIHRoaXMgb2JqZWN0XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHJldHVybiB7Z29vZ2xlLm1hcHMuTGF0TG5nfSBUaGlzIG9iamVjdCwgZXhwcmVzc2VkIGFzIGEgZ29vZ2xlLm1hcHMuTGF0TG5nXHJcblx0ICovXHJcblx0V1BHTVpBLkxhdExuZy5wcm90b3R5cGUudG9Hb29nbGVMYXRMbmcgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoe1xyXG5cdFx0XHRsYXQ6IHRoaXMubGF0LFxyXG5cdFx0XHRsbmc6IHRoaXMubG5nXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkxhdExuZy5wcm90b3R5cGUudG9MYXRMbmdMaXRlcmFsID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGxhdDogdGhpcy5sYXQsXHJcblx0XHRcdGxuZzogdGhpcy5sbmdcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE1vdmVzIHRoaXMgbGF0TG5nIGJ5IHRoZSBzcGVjaWZpZWQga2lsb21ldGVycyBhbG9uZyB0aGUgZ2l2ZW4gaGVhZGluZy4gVGhpcyBmdW5jdGlvbiBvcGVyYXRlcyBpbiBwbGFjZSwgYXMgb3Bwb3NlZCB0byBjcmVhdGluZyBhIG5ldyBpbnN0YW5jZSBvZiBXUEdNWkEuTGF0TG5nLiBXaXRoIG1hbnkgdGhhbmtzIHRvIEh1IEtlbm5ldGggLSBodHRwczovL2dpcy5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMjM0NDczL2dldC1hLWxvbmxhdC1wb2ludC1ieS1kaXN0YW5jZS1vci1iZXR3ZWVuLTItbG9ubGF0LXBvaW50c1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkxhdExuZ1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBraWxvbWV0ZXJzIFRoZSBudW1iZXIgb2Yga2lsb21ldGVycyB0byBtb3ZlIHRoaXMgTGF0TG5nIGJ5XHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGhlYWRpbmcgVGhlIGhlYWRpbmcsIGluIGRlZ3JlZXMsIHRvIG1vdmUgYWxvbmcsIHdoZXJlIHplcm8gaXMgTm9ydGhcclxuXHQgKiBAcmV0dXJuIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmcucHJvdG90eXBlLm1vdmVCeURpc3RhbmNlID0gZnVuY3Rpb24oa2lsb21ldGVycywgaGVhZGluZylcclxuXHR7XHJcblx0XHR2YXIgcmFkaXVzIFx0XHQ9IDYzNzE7XHJcblx0XHRcclxuXHRcdHZhciBkZWx0YSBcdFx0PSBwYXJzZUZsb2F0KGtpbG9tZXRlcnMpIC8gcmFkaXVzO1xyXG5cdFx0dmFyIHRoZXRhIFx0XHQ9IHBhcnNlRmxvYXQoaGVhZGluZykgLyAxODAgKiBNYXRoLlBJO1xyXG5cdFx0XHJcblx0XHR2YXIgcGhpMSBcdFx0PSB0aGlzLmxhdCAvIDE4MCAqIE1hdGguUEk7XHJcblx0XHR2YXIgbGFtYmRhMSBcdD0gdGhpcy5sbmcgLyAxODAgKiBNYXRoLlBJO1xyXG5cdFx0XHJcblx0XHR2YXIgc2luUGhpMSBcdD0gTWF0aC5zaW4ocGhpMSksIGNvc1BoaTEgPSBNYXRoLmNvcyhwaGkxKTtcclxuXHRcdHZhciBzaW5EZWx0YVx0PSBNYXRoLnNpbihkZWx0YSksIGNvc0RlbHRhID0gTWF0aC5jb3MoZGVsdGEpO1xyXG5cdFx0dmFyIHNpblRoZXRhXHQ9IE1hdGguc2luKHRoZXRhKSwgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XHJcblx0XHRcclxuXHRcdHZhciBzaW5QaGkyXHRcdD0gc2luUGhpMSAqIGNvc0RlbHRhICsgY29zUGhpMSAqIHNpbkRlbHRhICogY29zVGhldGE7XHJcblx0XHR2YXIgcGhpMlx0XHQ9IE1hdGguYXNpbihzaW5QaGkyKTtcclxuXHRcdHZhciB5XHRcdFx0PSBzaW5UaGV0YSAqIHNpbkRlbHRhICogY29zUGhpMTtcclxuXHRcdHZhciB4XHRcdFx0PSBjb3NEZWx0YSAtIHNpblBoaTEgKiBzaW5QaGkyO1xyXG5cdFx0dmFyIGxhbWJkYTJcdFx0PSBsYW1iZGExICsgTWF0aC5hdGFuMih5LCB4KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sYXRcdFx0PSBwaGkyICogMTgwIC8gTWF0aC5QSTtcclxuXHRcdHRoaXMubG5nXHRcdD0gbGFtYmRhMiAqIDE4MCAvIE1hdGguUEk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEBmdW5jdGlvbiBnZXRHcmVhdENpcmNsZURpc3RhbmNlXHJcblx0ICogQHN1bW1hcnkgVXNlcyB0aGUgaGF2ZXJzaW5lIGZvcm11bGEgdG8gZ2V0IHRoZSBncmVhdCBjaXJjbGUgZGlzdGFuY2UgYmV0d2VlbiB0aGlzIGFuZCBhbm90aGVyIExhdExuZyAvIGxhdCAmIGxuZyBwYWlyXHJcblx0ICogQHBhcmFtIGFyZzEgW1dQR01aQS5MYXRMbmd8T2JqZWN0fE51bWJlcl0gRWl0aGVyIGEgV1BHTVpBLkxhdExuZywgYW4gb2JqZWN0IHJlcHJlc2VudGluZyBhIGxhdC9sbmcgbGl0ZXJhbCwgb3IgYSBsYXRpdHVkZVxyXG5cdCAqIEBwYXJhbSBhcmcyIChvcHRpb25hbCkgSWYgYXJnMSBpcyBhIE51bWJlciByZXByZXNlbnRpbmcgbGF0aXR1ZGUsIHBhc3MgYXJnMiB0byByZXByZXNlbnQgdGhlIGxvbmdpdHVkZVxyXG5cdCAqIEByZXR1cm4gbnVtYmVyIFRoZSBkaXN0YW5jZSBcImFzIHRoZSBjcm93IGZpbGVzXCIgYmV0d2VlbiB0aGlzIHBvaW50IGFuZCB0aGUgb3RoZXJcclxuXHQgKi9cclxuXHRXUEdNWkEuTGF0TG5nLnByb3RvdHlwZS5nZXRHcmVhdENpcmNsZURpc3RhbmNlID0gZnVuY3Rpb24oYXJnMSwgYXJnMilcclxuXHR7XHJcblx0XHR2YXIgbGF0MSA9IHRoaXMubGF0O1xyXG5cdFx0dmFyIGxvbjEgPSB0aGlzLmxuZztcclxuXHRcdHZhciBvdGhlcjtcclxuXHRcdFxyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA9PSAxKVxyXG5cdFx0XHRvdGhlciA9IG5ldyBXUEdNWkEuTGF0TG5nKGFyZzEpO1xyXG5cdFx0ZWxzZSBpZihhcmd1bWVudHMubGVuZ3RoID09IDIpXHJcblx0XHRcdG90aGVyID0gbmV3IFdQR01aQS5MYXRMbmcoYXJnMSwgYXJnMik7XHJcblx0XHRlbHNlXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbnVtYmVyIG9mIGFyZ3VtZW50c1wiKTtcclxuXHRcdFxyXG5cdFx0dmFyIGxhdDIgPSBvdGhlci5sYXQ7XHJcblx0XHR2YXIgbG9uMiA9IG90aGVyLmxuZztcclxuXHRcdFxyXG5cdFx0dmFyIFIgPSA2MzcxOyAvLyBLaWxvbWV0ZXJzXHJcblx0XHR2YXIgcGhpMSA9IGxhdDEudG9SYWRpYW5zKCk7XHJcblx0XHR2YXIgcGhpMiA9IGxhdDIudG9SYWRpYW5zKCk7XHJcblx0XHR2YXIgZGVsdGFQaGkgPSAobGF0Mi1sYXQxKS50b1JhZGlhbnMoKTtcclxuXHRcdHZhciBkZWx0YUxhbWJkYSA9IChsb24yLWxvbjEpLnRvUmFkaWFucygpO1xyXG5cclxuXHRcdHZhciBhID0gTWF0aC5zaW4oZGVsdGFQaGkvMikgKiBNYXRoLnNpbihkZWx0YVBoaS8yKSArXHJcblx0XHRcdFx0TWF0aC5jb3MocGhpMSkgKiBNYXRoLmNvcyhwaGkyKSAqXHJcblx0XHRcdFx0TWF0aC5zaW4oZGVsdGFMYW1iZGEvMikgKiBNYXRoLnNpbihkZWx0YUxhbWJkYS8yKTtcclxuXHRcdHZhciBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMS1hKSk7XHJcblxyXG5cdFx0dmFyIGQgPSBSICogYztcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGQ7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6ImxhdGxuZy5qcyJ9


// js/v8/latlngbounds.js
/**
 * @namespace WPGMZA
 * @module LatLngBounds
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsYXRsbmdib3VuZHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTGF0TG5nQm91bmRzXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBib3VuZHMgYXMgYSByZWN0YW5ndWxhciBhcmVhLlxyXG5cdCAqIE5COiBUaGlzIGNsYXNzIGlzIG5vdCBmdWxseSBpbXBsZW1lbnRlZFxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuTGF0TG5nQm91bmRzXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5MYXRMbmdCb3VuZHNcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICovXHJcblx0V1BHTVpBLkxhdExuZ0JvdW5kcyA9IGZ1bmN0aW9uKHNvdXRoV2VzdCwgbm9ydGhFYXN0KVxyXG5cdHtcclxuXHRcdC8vY29uc29sZS5sb2coXCJDcmVhdGVkIGJvdW5kc1wiLCBzb3V0aFdlc3QsIG5vcnRoRWFzdCk7XHJcblx0XHRcclxuXHRcdGlmKHNvdXRoV2VzdCBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmdCb3VuZHMpXHJcblx0XHR7XHJcblx0XHRcdHZhciBvdGhlciA9IHNvdXRoV2VzdDtcclxuXHRcdFx0dGhpcy5zb3V0aCA9IG90aGVyLnNvdXRoO1xyXG5cdFx0XHR0aGlzLm5vcnRoID0gb3RoZXIubm9ydGg7XHJcblx0XHRcdHRoaXMud2VzdCA9IG90aGVyLndlc3Q7XHJcblx0XHRcdHRoaXMuZWFzdCA9IG90aGVyLmVhc3Q7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmKHNvdXRoV2VzdCAmJiBub3J0aEVhc3QpXHJcblx0XHR7XHJcblx0XHRcdC8vIFRPRE86IEFkZCBjaGVja3MgYW5kIGVycm9yc1xyXG5cdFx0XHR0aGlzLnNvdXRoID0gc291dGhXZXN0LmxhdDtcclxuXHRcdFx0dGhpcy5ub3J0aCA9IG5vcnRoRWFzdC5sYXQ7XHJcblx0XHRcdHRoaXMud2VzdCA9IHNvdXRoV2VzdC5sbmc7XHJcblx0XHRcdHRoaXMuZWFzdCA9IG5vcnRoRWFzdC5sbmc7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5MYXRMbmdCb3VuZHMuZnJvbUdvb2dsZUxhdExuZ0JvdW5kcyA9IGZ1bmN0aW9uKGdvb2dsZUxhdExuZ0JvdW5kcylcclxuXHR7XHJcblx0XHRpZighKGdvb2dsZUxhdExuZ0JvdW5kcyBpbnN0YW5jZW9mIGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcykpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzXCIpO1xyXG5cdFx0XHJcblx0XHR2YXIgcmVzdWx0ID0gbmV3IFdQR01aQS5MYXRMbmdCb3VuZHMoKTtcclxuXHRcdHZhciBzb3V0aFdlc3QgPSBnb29nbGVMYXRMbmdCb3VuZHMuZ2V0U291dGhXZXN0KCk7XHJcblx0XHR2YXIgbm9ydGhFYXN0ID0gZ29vZ2xlTGF0TG5nQm91bmRzLmdldE5vcnRoRWFzdCgpO1xyXG5cdFx0XHJcblx0XHRyZXN1bHQubm9ydGggPSBub3J0aEVhc3QubGF0KCk7XHJcblx0XHRyZXN1bHQuc291dGggPSBzb3V0aFdlc3QubGF0KCk7XHJcblx0XHRyZXN1bHQud2VzdCA9IHNvdXRoV2VzdC5sbmcoKTtcclxuXHRcdHJlc3VsdC5lYXN0ID0gbm9ydGhFYXN0LmxuZygpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nQm91bmRzLmZyb21Hb29nbGVMYXRMbmdCb3VuZHNMaXRlcmFsID0gZnVuY3Rpb24ob2JqKVxyXG5cdHtcclxuXHRcdHZhciByZXN1bHQgPSBuZXcgV1BHTVpBLkxhdExuZ0JvdW5kcygpO1xyXG5cdFx0XHJcblx0XHR2YXIgc291dGhXZXN0ID0gb2JqLnNvdXRod2VzdDtcclxuXHRcdHZhciBub3J0aEVhc3QgPSBvYmoubm9ydGhlYXN0O1xyXG5cdFx0XHJcblx0XHRyZXN1bHQubm9ydGggPSBub3J0aEVhc3QubGF0O1xyXG5cdFx0cmVzdWx0LnNvdXRoID0gc291dGhXZXN0LmxhdDtcclxuXHRcdHJlc3VsdC53ZXN0ID0gc291dGhXZXN0LmxuZztcclxuXHRcdHJlc3VsdC5lYXN0ID0gbm9ydGhFYXN0LmxuZztcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoaXMgb2JqZWN0IGlzIGluIGl0J3MgaW5pdGlhbCBzdGF0ZSAoZWcgbm8gcG9pbnRzIHNwZWNpZmllZCB0byBnYXRoZXIgYm91bmRzIGZyb20pXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nQm91bmRzXHJcblx0ICogQHJldHVybiB7Ym9vbH0gVHJ1ZSBpZiB0aGUgb2JqZWN0IGlzIGluIGl0J3MgaW5pdGlhbCBzdGF0ZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmdCb3VuZHMucHJvdG90eXBlLmlzSW5Jbml0aWFsU3RhdGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuICh0aGlzLm5vcnRoID09IHVuZGVmaW5lZCAmJiB0aGlzLnNvdXRoID09IHVuZGVmaW5lZCAmJiB0aGlzLndlc3QgPT0gdW5kZWZpbmVkICYmIHRoaXMuZWFzdCA9PSB1bmRlZmluZWQpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBFeHRlbmRzIHRoaXMgYm91bmRzIG9iamVjdCB0byBlbmNvbXBhc3MgdGhlIGdpdmVuIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgY29vcmRpbmF0ZXNcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5MYXRMbmdCb3VuZHNcclxuXHQgKiBAcGFyYW0ge29iamVjdHxXUEdNWkEuTGF0TG5nfSBsYXRMbmcgZWl0aGVyIGEgTGF0TG5nIGxpdGVyYWwgb3IgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLkxhdExuZ1xyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmdCb3VuZHMucHJvdG90eXBlLmV4dGVuZCA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHRpZighKGxhdExuZyBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpKVxyXG5cdFx0XHRsYXRMbmcgPSBuZXcgV1BHTVpBLkxhdExuZyhsYXRMbmcpO1xyXG5cdFx0XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiRXhwYW5kaW5nIGJvdW5kcyB0byBcIiArIGxhdExuZy50b1N0cmluZygpKTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5pc0luSW5pdGlhbFN0YXRlKCkpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubm9ydGggPSB0aGlzLnNvdXRoID0gbGF0TG5nLmxhdDtcclxuXHRcdFx0dGhpcy53ZXN0ID0gdGhpcy5lYXN0ID0gbGF0TG5nLmxuZztcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihsYXRMbmcubGF0IDwgdGhpcy5ub3J0aClcclxuXHRcdFx0dGhpcy5ub3J0aCA9IGxhdExuZy5sYXQ7XHJcblx0XHRcclxuXHRcdGlmKGxhdExuZy5sYXQgPiB0aGlzLnNvdXRoKVxyXG5cdFx0XHR0aGlzLnNvdXRoID0gbGF0TG5nLmxhdDtcclxuXHRcdFxyXG5cdFx0aWYobGF0TG5nLmxuZyA8IHRoaXMud2VzdClcclxuXHRcdFx0dGhpcy53ZXN0ID0gbGF0TG5nLmxuZztcclxuXHRcdFxyXG5cdFx0aWYobGF0TG5nLmxuZyA+IHRoaXMuZWFzdClcclxuXHRcdFx0dGhpcy5lYXN0ID0gbGF0TG5nLmxuZztcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkxhdExuZ0JvdW5kcy5wcm90b3R5cGUuZXh0ZW5kQnlQaXhlbE1hcmdpbiA9IGZ1bmN0aW9uKG1hcCwgeCwgYXJnKVxyXG5cdHtcclxuXHRcdHZhciB5ID0geDtcclxuXHRcdFxyXG5cdFx0aWYoIShtYXAgaW5zdGFuY2VvZiBXUEdNWkEuTWFwKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuTWFwXCIpO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLmlzSW5Jbml0aWFsU3RhdGUoKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGV4dGVuZCBieSBwaXhlbHMgaW4gaW5pdGlhbCBzdGF0ZVwiKTtcclxuXHRcdFxyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA+PSAzKVxyXG5cdFx0XHR5ID0gYXJnO1xyXG5cdFx0XHJcblx0XHR2YXIgc291dGhXZXN0ID0gbmV3IFdQR01aQS5MYXRMbmcodGhpcy5zb3V0aCwgdGhpcy53ZXN0KTtcclxuXHRcdHZhciBub3J0aEVhc3QgPSBuZXcgV1BHTVpBLkxhdExuZyh0aGlzLm5vcnRoLCB0aGlzLmVhc3QpO1xyXG5cdFx0XHJcblx0XHRzb3V0aFdlc3QgPSBtYXAubGF0TG5nVG9QaXhlbHMoc291dGhXZXN0KTtcclxuXHRcdG5vcnRoRWFzdCA9IG1hcC5sYXRMbmdUb1BpeGVscyhub3J0aEVhc3QpO1xyXG5cdFx0XHJcblx0XHRzb3V0aFdlc3QueCAtPSB4O1xyXG5cdFx0c291dGhXZXN0LnkgKz0geTtcclxuXHRcdFxyXG5cdFx0bm9ydGhFYXN0LnggKz0geDtcclxuXHRcdG5vcnRoRWFzdC55IC09IHk7XHJcblx0XHRcclxuXHRcdHNvdXRoV2VzdCA9IG1hcC5waXhlbHNUb0xhdExuZyhzb3V0aFdlc3QueCwgc291dGhXZXN0LnkpO1xyXG5cdFx0bm9ydGhFYXN0ID0gbWFwLnBpeGVsc1RvTGF0TG5nKG5vcnRoRWFzdC54LCBub3J0aEVhc3QueSk7XHJcblx0XHRcclxuXHRcdHZhciB0ZW1wID0gdGhpcy50b1N0cmluZygpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm5vcnRoID0gbm9ydGhFYXN0LmxhdDtcclxuXHRcdHRoaXMuc291dGggPSBzb3V0aFdlc3QubGF0O1xyXG5cdFx0dGhpcy53ZXN0ID0gc291dGhXZXN0LmxuZztcclxuXHRcdHRoaXMuZWFzdCA9IG5vcnRoRWFzdC5sbmc7XHJcblx0XHRcclxuXHRcdC8vIGNvbnNvbGUubG9nKFwiRXh0ZW5kZWRcIiwgdGVtcCwgXCJ0b1wiLCB0aGlzLnRvU3RyaW5nKCkpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nQm91bmRzLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiQ2hlY2tpbmcgaWYgbGF0TG5nIFwiLCBsYXRMbmcsIFwiIGlzIHdpdGhpbiBib3VuZHMgXCIgKyB0aGlzLnRvU3RyaW5nKCkpO1xyXG5cdFx0XHJcblx0XHRpZighKGxhdExuZyBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcIik7XHJcblx0XHRcclxuXHRcdGlmKGxhdExuZy5sYXQgPCBNYXRoLm1pbih0aGlzLm5vcnRoLCB0aGlzLnNvdXRoKSlcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHRpZihsYXRMbmcubGF0ID4gTWF0aC5tYXgodGhpcy5ub3J0aCwgdGhpcy5zb3V0aCkpXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy53ZXN0IDwgdGhpcy5lYXN0KVxyXG5cdFx0XHRyZXR1cm4gKGxhdExuZy5sbmcgPj0gdGhpcy53ZXN0ICYmIGxhdExuZy5sbmcgPD0gdGhpcy5lYXN0KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIChsYXRMbmcubG5nIDw9IHRoaXMud2VzdCB8fCBsYXRMbmcubG5nID49IHRoaXMuZWFzdCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5MYXRMbmdCb3VuZHMucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLm5vcnRoICsgXCJOIFwiICsgdGhpcy5zb3V0aCArIFwiUyBcIiArIHRoaXMud2VzdCArIFwiVyBcIiArIHRoaXMuZWFzdCArIFwiRVwiO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nQm91bmRzLnByb3RvdHlwZS50b0xpdGVyYWwgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bm9ydGg6IHRoaXMubm9ydGgsXHJcblx0XHRcdHNvdXRoOiB0aGlzLnNvdXRoLFxyXG5cdFx0XHR3ZXN0OiB0aGlzLndlc3QsXHJcblx0XHRcdGVhc3Q6IHRoaXMuZWFzdFxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibGF0bG5nYm91bmRzLmpzIn0=


// js/v8/map-edit-page.js
/**
 * @namespace WPGMZA
 * @module MapEditPage
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	if(WPGMZA.currentPage != "map-edit")
		return;
	
	WPGMZA.MapEditPage = function()
	{
		var self = this;
		
		this.themePanel = new WPGMZA.ThemePanel();
		this.themeEditor = new WPGMZA.ThemeEditor();
		
		this.map = WPGMZA.maps[0];

		// Check if user enabled any interactions
		if(WPGMZA.settings.wpgmza_settings_map_scroll == 'yes' || WPGMZA.settings.wpgmza_settings_map_draggable == "yes" || WPGMZA.settings.wpgmza_settings_map_clickzoom == 'yes')
		{
			// Display notice and button if user enabled interactions
			var diplay_enable_interactions_notice = $("<div class='notice notice-info wpgmza_disabled_interactions_notice' style= 'height: 45px; padding: 7px 5px 2px 5px;'><p style='float: left; padding-top: 10px;'>" + WPGMZA.localized_strings.disabled_interactions_notice + 
			"</p><a class='button button-primary enable_interactions_notice_button' style='float: right;'>" + WPGMZA.localized_strings.disabled_interactions_button + "</a></div>");
			
			$(".wpgmza_map").after(diplay_enable_interactions_notice);

			$(".enable_interactions_notice_button").on("click", function() {
	
				WPGMZA.mapEditPage.map.enableAllInteractions();
	
				$(diplay_enable_interactions_notice).fadeOut('slow');
	
				var successNotice = $("<div class='notice notice-success'><p>" + WPGMZA.localized_strings.interactions_enabled_notice + "</p></div>");
				$(WPGMZA.mapEditPage.map.element).after(successNotice);
				$(successNotice).delay(2000).fadeIn('slow');
				$(successNotice).delay(4000).fadeOut('slow');
			});
		}

		$('#wpgmza_max_zoom, #wpgmza_min_zoom').on("change input", function(event) {
			self.onZoomLimitChanged(event);
		});
	}
	
	WPGMZA.MapEditPage.createInstance = function()
	{
		if(WPGMZA.isProVersion() && WPGMZA.Version.compare(WPGMZA.pro_version, "8.0.0") >= WPGMZA.Version.EQUAL_TO)
			return new WPGMZA.ProMapEditPage();
		
		return new WPGMZA.MapEditPage();
	}

	WPGMZA.MapEditPage.prototype.onZoomLimitChanged = function(event)
	{
		this.map.setOptions({
			minZoom:	$("#wpgmza_max_zoom").val(),
			maxZoom:	$("#wpgmza_min_zoom").val()
		});
	}
	
	$(window).on("load", function(event) {
		
		WPGMZA.mapEditPage = WPGMZA.MapEditPage.createInstance();
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXAtZWRpdC1wYWdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIE1hcEVkaXRQYWdlXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRpZihXUEdNWkEuY3VycmVudFBhZ2UgIT0gXCJtYXAtZWRpdFwiKVxyXG5cdFx0cmV0dXJuO1xyXG5cdFxyXG5cdFdQR01aQS5NYXBFZGl0UGFnZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMudGhlbWVQYW5lbCA9IG5ldyBXUEdNWkEuVGhlbWVQYW5lbCgpO1xyXG5cdFx0dGhpcy50aGVtZUVkaXRvciA9IG5ldyBXUEdNWkEuVGhlbWVFZGl0b3IoKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXAgPSBXUEdNWkEubWFwc1swXTtcclxuXHJcblx0XHQvLyBDaGVjayBpZiB1c2VyIGVuYWJsZWQgYW55IGludGVyYWN0aW9uc1xyXG5cdFx0aWYoV1BHTVpBLnNldHRpbmdzLndwZ216YV9zZXR0aW5nc19tYXBfc2Nyb2xsID09ICd5ZXMnIHx8IFdQR01aQS5zZXR0aW5ncy53cGdtemFfc2V0dGluZ3NfbWFwX2RyYWdnYWJsZSA9PSBcInllc1wiIHx8IFdQR01aQS5zZXR0aW5ncy53cGdtemFfc2V0dGluZ3NfbWFwX2NsaWNrem9vbSA9PSAneWVzJylcclxuXHRcdHtcclxuXHRcdFx0Ly8gRGlzcGxheSBub3RpY2UgYW5kIGJ1dHRvbiBpZiB1c2VyIGVuYWJsZWQgaW50ZXJhY3Rpb25zXHJcblx0XHRcdHZhciBkaXBsYXlfZW5hYmxlX2ludGVyYWN0aW9uc19ub3RpY2UgPSAkKFwiPGRpdiBjbGFzcz0nbm90aWNlIG5vdGljZS1pbmZvIHdwZ216YV9kaXNhYmxlZF9pbnRlcmFjdGlvbnNfbm90aWNlJyBzdHlsZT0gJ2hlaWdodDogNDVweDsgcGFkZGluZzogN3B4IDVweCAycHggNXB4Oyc+PHAgc3R5bGU9J2Zsb2F0OiBsZWZ0OyBwYWRkaW5nLXRvcDogMTBweDsnPlwiICsgV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLmRpc2FibGVkX2ludGVyYWN0aW9uc19ub3RpY2UgKyBcclxuXHRcdFx0XCI8L3A+PGEgY2xhc3M9J2J1dHRvbiBidXR0b24tcHJpbWFyeSBlbmFibGVfaW50ZXJhY3Rpb25zX25vdGljZV9idXR0b24nIHN0eWxlPSdmbG9hdDogcmlnaHQ7Jz5cIiArIFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5kaXNhYmxlZF9pbnRlcmFjdGlvbnNfYnV0dG9uICsgXCI8L2E+PC9kaXY+XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChcIi53cGdtemFfbWFwXCIpLmFmdGVyKGRpcGxheV9lbmFibGVfaW50ZXJhY3Rpb25zX25vdGljZSk7XHJcblxyXG5cdFx0XHQkKFwiLmVuYWJsZV9pbnRlcmFjdGlvbnNfbm90aWNlX2J1dHRvblwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdFx0XHRcdFdQR01aQS5tYXBFZGl0UGFnZS5tYXAuZW5hYmxlQWxsSW50ZXJhY3Rpb25zKCk7XHJcblx0XHJcblx0XHRcdFx0JChkaXBsYXlfZW5hYmxlX2ludGVyYWN0aW9uc19ub3RpY2UpLmZhZGVPdXQoJ3Nsb3cnKTtcclxuXHRcclxuXHRcdFx0XHR2YXIgc3VjY2Vzc05vdGljZSA9ICQoXCI8ZGl2IGNsYXNzPSdub3RpY2Ugbm90aWNlLXN1Y2Nlc3MnPjxwPlwiICsgV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLmludGVyYWN0aW9uc19lbmFibGVkX25vdGljZSArIFwiPC9wPjwvZGl2PlwiKTtcclxuXHRcdFx0XHQkKFdQR01aQS5tYXBFZGl0UGFnZS5tYXAuZWxlbWVudCkuYWZ0ZXIoc3VjY2Vzc05vdGljZSk7XHJcblx0XHRcdFx0JChzdWNjZXNzTm90aWNlKS5kZWxheSgyMDAwKS5mYWRlSW4oJ3Nsb3cnKTtcclxuXHRcdFx0XHQkKHN1Y2Nlc3NOb3RpY2UpLmRlbGF5KDQwMDApLmZhZGVPdXQoJ3Nsb3cnKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0JCgnI3dwZ216YV9tYXhfem9vbSwgI3dwZ216YV9taW5fem9vbScpLm9uKFwiY2hhbmdlIGlucHV0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHNlbGYub25ab29tTGltaXRDaGFuZ2VkKGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFwRWRpdFBhZ2UuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpICYmIFdQR01aQS5WZXJzaW9uLmNvbXBhcmUoV1BHTVpBLnByb192ZXJzaW9uLCBcIjguMC4wXCIpID49IFdQR01aQS5WZXJzaW9uLkVRVUFMX1RPKVxyXG5cdFx0XHRyZXR1cm4gbmV3IFdQR01aQS5Qcm9NYXBFZGl0UGFnZSgpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5NYXBFZGl0UGFnZSgpO1xyXG5cdH1cclxuXHJcblx0V1BHTVpBLk1hcEVkaXRQYWdlLnByb3RvdHlwZS5vblpvb21MaW1pdENoYW5nZWQgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR0aGlzLm1hcC5zZXRPcHRpb25zKHtcclxuXHRcdFx0bWluWm9vbTpcdCQoXCIjd3BnbXphX21heF96b29tXCIpLnZhbCgpLFxyXG5cdFx0XHRtYXhab29tOlx0JChcIiN3cGdtemFfbWluX3pvb21cIikudmFsKClcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHQkKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcclxuXHRcdFdQR01aQS5tYXBFZGl0UGFnZSA9IFdQR01aQS5NYXBFZGl0UGFnZS5jcmVhdGVJbnN0YW5jZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibWFwLWVkaXQtcGFnZS5qcyJ9


// js/v8/map-object.js
/**
 * @namespace WPGMZA
 * @module MapObject
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	/**
	 * Base class for Map Objects (known as Features in Map Block), that is, markers, polygons, polylines, circles, rectangles and heatmaps. Implements functionality shared by all map objects, such as parsing geometry and serialization.
	 * @class WPGMZA.MapObject
	 * @constructor WPGMZA.MapObject
	 * @memberof WPGMZA
	 * @augments WPGMZA.EventDispatcher
	 */
	WPGMZA.MapObject = function(row)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "MapObject");
		
		WPGMZA.EventDispatcher.call(this);
		
		this.id = -1;
		this.map_id = null;
		this.guid = WPGMZA.guid();
		this.modified = true;
		this.settings = {};
		
		if(row)
		{
			for(var name in row)
			{
				if(name == "settings")
				{
					if(row["settings"] == null)
						this["settings"] = {};
					else switch(typeof row["settings"]) {
						case "string":
							this["settings"] = JSON.parse(row[name]);
							break;
						case "object":
							this["settings"] = row[name];
							break;
						default:
							throw new Error("Don't know how to interpret settings")
							break;
					}
					
					for(var name in this.settings)
					{
						var value = this.settings[name];
						if(String(value).match(/^-?\d+$/))
							this.settings[name] = parseInt(value);
					}
				}
				else
					this[name] = row[name];
			}
		}		
	}
	
	WPGMZA.MapObject.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.MapObject.prototype.constructor = WPGMZA.MapObject;
	
	/**
	 * Scans a string for all floating point numbers and build an array of latitude and longitude literals from the matched numbers
	 * @method
	 * @memberof WPGMZA.MapObject
	 * @param {string} string The string to parse numbers from
	 * @return {array} An array of LatLng literals parsed from the string
	 */
	WPGMZA.MapObject.prototype.parseGeometry = function(string)
	{
		var stripped, pairs, coords, results = [];
		
		if(typeof string == "object")
			return string;
		
		stripped = string.replace(/[^ ,\d\.\-+e]/g, "");
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
	
	/**
	 * Returns a copy of this object as a JSON object for serializsation
	 * @method
	 * @memberof WPGMZA.MapObject
	 * @return {object} This object as represented by JSON
	 */
	WPGMZA.MapObject.prototype.toJSON = function()
	{
		return {
			id: this.id,
			guid: this.guid,
			settings: this.settings
		};
	}
	
});

// js/v8/circle.js
/**
 * @namespace WPGMZA
 * @module Circle
 * @requires WPGMZA.MapObject
 * @gulp-requires map-object.js
 */
jQuery(function($) {
	
	var Parent = WPGMZA.MapObject;
	
	/**
	 * Base class for circles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Circle
	 * @constructor WPGMZA.Circle
	 * @memberof WPGMZA
	 * @augments WPGMZA.MapObject
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
	
	WPGMZA.Circle.prototype = Object.create(Parent.prototype);
	WPGMZA.Circle.prototype.constructor = WPGMZA.Circle;
	
	/**
	 * Creates an instance of a circle, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.Circle.createInstance = function(options)
	{
		var constructor;
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				constructor = WPGMZA.OLCircle;
				break;
			
			default:
				constructor = WPGMZA.GoogleCircle;
				break;
		}
		
		return new constructor(options);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjaXJjbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgQ2lyY2xlXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuTWFwT2JqZWN0XHJcbiAqIEBndWxwLXJlcXVpcmVzIG1hcC1vYmplY3QuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0dmFyIFBhcmVudCA9IFdQR01aQS5NYXBPYmplY3Q7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyBmb3IgY2lyY2xlcy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLkNpcmNsZVxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuQ2lyY2xlXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBhdWdtZW50cyBXUEdNWkEuTWFwT2JqZWN0XHJcblx0ICogQHNlZSBXUEdNWkEuQ2lyY2xlLmNyZWF0ZUluc3RhbmNlXHJcblx0ICovXHJcblx0V1BHTVpBLkNpcmNsZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGVuZ2luZUNpcmNsZSlcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFdQR01aQS5hc3NlcnRJbnN0YW5jZU9mKHRoaXMsIFwiQ2lyY2xlXCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmNlbnRlciA9IG5ldyBXUEdNWkEuTGF0TG5nKCk7XHJcblx0XHR0aGlzLnJhZGl1cyA9IDEwMDtcclxuXHRcdFxyXG5cdFx0UGFyZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5DaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQYXJlbnQucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5DaXJjbGU7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIGNpcmNsZSwgPHN0cm9uZz5wbGVhc2UgPGVtPmFsd2F5czwvZW0+IHVzZSB0aGlzIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGNhbGxpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5PC9zdHJvbmc+LlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkNpcmNsZVxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBvYmplY3QgKG9wdGlvbmFsKVxyXG5cdCAqL1xyXG5cdFdQR01aQS5DaXJjbGUuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdHZhciBjb25zdHJ1Y3RvcjtcclxuXHRcdFxyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdGNvbnN0cnVjdG9yID0gV1BHTVpBLk9MQ2lyY2xlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRjb25zdHJ1Y3RvciA9IFdQR01aQS5Hb29nbGVDaXJjbGU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3Iob3B0aW9ucyk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIGNpcmNsZXMgY2VudGVyXHJcblx0ICpcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAcmV0dXJucyB7V1BHTVpBLkxhdExuZ31cclxuXHQgKi9cclxuXHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuY2VudGVyLmNsb25lKCk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIGNpcmNsZXMgY2VudGVyXHJcblx0ICpcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAcGFyYW0ge29iamVjdHxXUEdNWkEuTGF0TG5nfSBsYXRMbmcgZWl0aGVyIGEgbGl0ZXJhbCBvciBhcyBhIFdQR01aQS5MYXRMbmdcclxuXHQgKi9cclxuXHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbihsYXRMbmcpXHJcblx0e1xyXG5cdFx0dGhpcy5jZW50ZXIubGF0ID0gbGF0TG5nLmxhdDtcclxuXHRcdHRoaXMuY2VudGVyLmxuZyA9IGxhdExuZy5sbmc7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIGNpcmNsZXMgcmFkaXVzLCBpbiBraWxvbWV0ZXJzXHJcblx0ICpcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAcGFyYW0ge29iamVjdHxXUEdNWkEuTGF0TG5nfSBsYXRMbmcgZWl0aGVyIGEgbGl0ZXJhbCBvciBhcyBhIFdQR01aQS5MYXRMbmdcclxuXHQgKiBAcmV0dXJucyB7V1BHTVpBLkxhdExuZ31cclxuXHQgKi9cclxuXHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5nZXRSYWRpdXMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMucmFkaXVzO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSBjaXJjbGVzIHJhZGl1cywgaW4ga2lsb21ldGVyc1xyXG5cdCAqXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyBUaGUgcmFkaXVzXHJcblx0ICogQHJldHVybnMge3ZvaWR9XHJcblx0ICovXHJcblx0V1BHTVpBLkNpcmNsZS5wcm90b3R5cGUuc2V0UmFkaXVzID0gZnVuY3Rpb24ocmFkaXVzKVxyXG5cdHtcclxuXHRcdHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtYXAgdGhhdCB0aGlzIGNpcmNsZSBpcyBiZWluZyBkaXNwbGF5ZWQgb25cclxuXHQgKlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkNpcmNsZVxyXG5cdCAqIEByZXR1cm4ge1dQR01aQS5NYXB9XHJcblx0ICovXHJcblx0V1BHTVpBLkNpcmNsZS5wcm90b3R5cGUuZ2V0TWFwID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLm1hcDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUHV0cyB0aGlzIGNpcmNsZSBvbiBhIG1hcFxyXG5cdCAqXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtXUEdNWkEuTWFwfSBtYXAgVGhlIHRhcmdldCBtYXBcclxuXHQgKiBAcmV0dXJuIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5DaXJjbGUucHJvdG90eXBlLnNldE1hcCA9IGZ1bmN0aW9uKG1hcClcclxuXHR7XHJcblx0XHRpZih0aGlzLm1hcClcclxuXHRcdFx0dGhpcy5tYXAucmVtb3ZlQ2lyY2xlKHRoaXMpO1xyXG5cdFx0XHJcblx0XHRpZihtYXApXHJcblx0XHRcdG1hcC5hZGRDaXJjbGUodGhpcyk7XHJcblx0XHRcdFxyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJjaXJjbGUuanMifQ==


// js/v8/map-settings-page.js
/**
 * @namespace WPGMZA
 * @module MapSettingsPage
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * This class helps manage the map settings pageX
	 * @class WPGMZA.MapSettingsPage
	 * @constructor WPGMZA.MapSettingsPage
	 * @memberof WPGMZA
	 */
	WPGMZA.MapSettingsPage = function()
	{
		var self = this;
		
		this._keypressHistory = [];
		
		this.updateEngineSpecificControls();
		this.updateGDPRControls();
		
		$("#wpgmza-developer-mode").hide();
		$(window).on("keypress", function(event) {
			self.onKeyPress(event);
		});
		
		$("select[name='wpgmza_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});
		
		$("input[name='wpgmza_gdpr_require_consent_before_load'], input[name='wpgmza_gdpr_require_consent_before_vgm_submit'], input[name='wpgmza_gdpr_override_notice']").on("change", function(event) {
			self.updateGDPRControls();
		});
	}
	
	WPGMZA.MapSettingsPage.createInstance = function()
	{
		return new WPGMZA.MapSettingsPage();
	}
	
	/**
	 * Updates engine specific controls, hiding irrelevant controls (eg Google controls when OpenLayers is the selected engine) and showing relevant controls.
	 * @method
	 * @memberof WPGMZA.MapSettingsPage
	 */
	WPGMZA.MapSettingsPage.prototype.updateEngineSpecificControls = function()
	{
		var engine = $("select[name='wpgmza_maps_engine']").val();
		
		$("[data-required-maps-engine][data-required-maps-engine!='" + engine + "']").hide();
		$("[data-required-maps-engine='" + engine + "']").show();
	}
	
	/**
	 * Updates the GDPR controls (eg visibility state) based on the selected GDPR settings
	 * @method
	 * @memberof WPGMZA.MapSettingsPage
	 */
	WPGMZA.MapSettingsPage.prototype.updateGDPRControls = function()
	{
		var showNoticeControls = $("input[name='wpgmza_gdpr_require_consent_before_load']").prop("checked");
		
		var vgmCheckbox = $("input[name='wpgmza_gdpr_require_consent_before_vgm_submit']");
		
		if(vgmCheckbox.length)
			showNoticeControls = showNoticeControls || vgmCheckbox.prop("checked");
		
		var showOverrideTextarea = showNoticeControls && $("input[name='wpgmza_gdpr_override_notice']").prop("checked");
		
		if(showNoticeControls)
		{
			$("#wpgmza-gdpr-compliance-notice").show("slow");
		}
		else
		{
			$("#wpgmza-gdpr-compliance-notice").hide("slow");
		}
		
		if(showOverrideTextarea)
		{
			$("#wpgmza_gdpr_override_notice_text").show("slow");
		}
		else
		{
			$("#wpgmza_gdpr_override_notice_text").hide("slow");
		}
	}

	/**
	 * Flushes the geocode cache
	 */
	WPGMZA.MapSettingsPage.prototype.flushGeocodeCache = function()
	{
		var OLGeocoder = new WPGMZA.OLGeocoder();
		OLGeocoder.clearCache(function(response){
			jQuery('#wpgmza_flush_cache_btn').removeAttr('disabled');
		});
	}
	
	WPGMZA.MapSettingsPage.prototype.onKeyPress = function(event)
	{
		var string;
		
		this._keypressHistory.push(event.key);
		
		if(this._keypressHistory.length > 9)
			this._keypressHistory = this._keypressHistory.slice(this._keypressHistory.length - 9);
		
		string = this._keypressHistory.join("");
		
		if(string == "codecabin" && !this._developerModeRevealed)
		{
			$("#wpgmza-developer-mode").show();
			this._developerModeRevealed = true;
		}
	}
	
	jQuery(function($) {
		
		if(!window.location.href.match(/wp-google-maps-menu-settings/))
			return;
		
		WPGMZA.mapSettingsPage = WPGMZA.MapSettingsPage.createInstance();

		jQuery(document).ready(function(){
			jQuery('#wpgmza_flush_cache_btn').on('click', function(){
				jQuery(this).attr('disabled', 'disabled');
				WPGMZA.mapSettingsPage.flushGeocodeCache();
			});
		});
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXAtc2V0dGluZ3MtcGFnZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBNYXBTZXR0aW5nc1BhZ2VcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFRoaXMgY2xhc3MgaGVscHMgbWFuYWdlIHRoZSBtYXAgc2V0dGluZ3MgcGFnZVhcclxuXHQgKiBAY2xhc3MgV1BHTVpBLk1hcFNldHRpbmdzUGFnZVxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTWFwU2V0dGluZ3NQYWdlXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXBTZXR0aW5nc1BhZ2UgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLl9rZXlwcmVzc0hpc3RvcnkgPSBbXTtcclxuXHRcdFxyXG5cdFx0dGhpcy51cGRhdGVFbmdpbmVTcGVjaWZpY0NvbnRyb2xzKCk7XHJcblx0XHR0aGlzLnVwZGF0ZUdEUFJDb250cm9scygpO1xyXG5cdFx0XHJcblx0XHQkKFwiI3dwZ216YS1kZXZlbG9wZXItbW9kZVwiKS5oaWRlKCk7XHJcblx0XHQkKHdpbmRvdykub24oXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uS2V5UHJlc3MoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoXCJzZWxlY3RbbmFtZT0nd3BnbXphX21hcHNfZW5naW5lJ11cIikub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi51cGRhdGVFbmdpbmVTcGVjaWZpY0NvbnRyb2xzKCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0JChcImlucHV0W25hbWU9J3dwZ216YV9nZHByX3JlcXVpcmVfY29uc2VudF9iZWZvcmVfbG9hZCddLCBpbnB1dFtuYW1lPSd3cGdtemFfZ2Rwcl9yZXF1aXJlX2NvbnNlbnRfYmVmb3JlX3ZnbV9zdWJtaXQnXSwgaW5wdXRbbmFtZT0nd3BnbXphX2dkcHJfb3ZlcnJpZGVfbm90aWNlJ11cIikub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi51cGRhdGVHRFBSQ29udHJvbHMoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFwU2V0dGluZ3NQYWdlLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiBuZXcgV1BHTVpBLk1hcFNldHRpbmdzUGFnZSgpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBVcGRhdGVzIGVuZ2luZSBzcGVjaWZpYyBjb250cm9scywgaGlkaW5nIGlycmVsZXZhbnQgY29udHJvbHMgKGVnIEdvb2dsZSBjb250cm9scyB3aGVuIE9wZW5MYXllcnMgaXMgdGhlIHNlbGVjdGVkIGVuZ2luZSkgYW5kIHNob3dpbmcgcmVsZXZhbnQgY29udHJvbHMuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwU2V0dGluZ3NQYWdlXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcFNldHRpbmdzUGFnZS5wcm90b3R5cGUudXBkYXRlRW5naW5lU3BlY2lmaWNDb250cm9scyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgZW5naW5lID0gJChcInNlbGVjdFtuYW1lPSd3cGdtemFfbWFwc19lbmdpbmUnXVwiKS52YWwoKTtcclxuXHRcdFxyXG5cdFx0JChcIltkYXRhLXJlcXVpcmVkLW1hcHMtZW5naW5lXVtkYXRhLXJlcXVpcmVkLW1hcHMtZW5naW5lIT0nXCIgKyBlbmdpbmUgKyBcIiddXCIpLmhpZGUoKTtcclxuXHRcdCQoXCJbZGF0YS1yZXF1aXJlZC1tYXBzLWVuZ2luZT0nXCIgKyBlbmdpbmUgKyBcIiddXCIpLnNob3coKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogVXBkYXRlcyB0aGUgR0RQUiBjb250cm9scyAoZWcgdmlzaWJpbGl0eSBzdGF0ZSkgYmFzZWQgb24gdGhlIHNlbGVjdGVkIEdEUFIgc2V0dGluZ3NcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBTZXR0aW5nc1BhZ2VcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwU2V0dGluZ3NQYWdlLnByb3RvdHlwZS51cGRhdGVHRFBSQ29udHJvbHMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHNob3dOb3RpY2VDb250cm9scyA9ICQoXCJpbnB1dFtuYW1lPSd3cGdtemFfZ2Rwcl9yZXF1aXJlX2NvbnNlbnRfYmVmb3JlX2xvYWQnXVwiKS5wcm9wKFwiY2hlY2tlZFwiKTtcclxuXHRcdFxyXG5cdFx0dmFyIHZnbUNoZWNrYm94ID0gJChcImlucHV0W25hbWU9J3dwZ216YV9nZHByX3JlcXVpcmVfY29uc2VudF9iZWZvcmVfdmdtX3N1Ym1pdCddXCIpO1xyXG5cdFx0XHJcblx0XHRpZih2Z21DaGVja2JveC5sZW5ndGgpXHJcblx0XHRcdHNob3dOb3RpY2VDb250cm9scyA9IHNob3dOb3RpY2VDb250cm9scyB8fCB2Z21DaGVja2JveC5wcm9wKFwiY2hlY2tlZFwiKTtcclxuXHRcdFxyXG5cdFx0dmFyIHNob3dPdmVycmlkZVRleHRhcmVhID0gc2hvd05vdGljZUNvbnRyb2xzICYmICQoXCJpbnB1dFtuYW1lPSd3cGdtemFfZ2Rwcl9vdmVycmlkZV9ub3RpY2UnXVwiKS5wcm9wKFwiY2hlY2tlZFwiKTtcclxuXHRcdFxyXG5cdFx0aWYoc2hvd05vdGljZUNvbnRyb2xzKVxyXG5cdFx0e1xyXG5cdFx0XHQkKFwiI3dwZ216YS1nZHByLWNvbXBsaWFuY2Utbm90aWNlXCIpLnNob3coXCJzbG93XCIpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHQkKFwiI3dwZ216YS1nZHByLWNvbXBsaWFuY2Utbm90aWNlXCIpLmhpZGUoXCJzbG93XCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihzaG93T3ZlcnJpZGVUZXh0YXJlYSlcclxuXHRcdHtcclxuXHRcdFx0JChcIiN3cGdtemFfZ2Rwcl9vdmVycmlkZV9ub3RpY2VfdGV4dFwiKS5zaG93KFwic2xvd1wiKTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0JChcIiN3cGdtemFfZ2Rwcl9vdmVycmlkZV9ub3RpY2VfdGV4dFwiKS5oaWRlKFwic2xvd1wiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZsdXNoZXMgdGhlIGdlb2NvZGUgY2FjaGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwU2V0dGluZ3NQYWdlLnByb3RvdHlwZS5mbHVzaEdlb2NvZGVDYWNoZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgT0xHZW9jb2RlciA9IG5ldyBXUEdNWkEuT0xHZW9jb2RlcigpO1xyXG5cdFx0T0xHZW9jb2Rlci5jbGVhckNhY2hlKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0alF1ZXJ5KCcjd3BnbXphX2ZsdXNoX2NhY2hlX2J0bicpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcFNldHRpbmdzUGFnZS5wcm90b3R5cGUub25LZXlQcmVzcyA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdHZhciBzdHJpbmc7XHJcblx0XHRcclxuXHRcdHRoaXMuX2tleXByZXNzSGlzdG9yeS5wdXNoKGV2ZW50LmtleSk7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuX2tleXByZXNzSGlzdG9yeS5sZW5ndGggPiA5KVxyXG5cdFx0XHR0aGlzLl9rZXlwcmVzc0hpc3RvcnkgPSB0aGlzLl9rZXlwcmVzc0hpc3Rvcnkuc2xpY2UodGhpcy5fa2V5cHJlc3NIaXN0b3J5Lmxlbmd0aCAtIDkpO1xyXG5cdFx0XHJcblx0XHRzdHJpbmcgPSB0aGlzLl9rZXlwcmVzc0hpc3Rvcnkuam9pbihcIlwiKTtcclxuXHRcdFxyXG5cdFx0aWYoc3RyaW5nID09IFwiY29kZWNhYmluXCIgJiYgIXRoaXMuX2RldmVsb3Blck1vZGVSZXZlYWxlZClcclxuXHRcdHtcclxuXHRcdFx0JChcIiN3cGdtemEtZGV2ZWxvcGVyLW1vZGVcIikuc2hvdygpO1xyXG5cdFx0XHR0aGlzLl9kZXZlbG9wZXJNb2RlUmV2ZWFsZWQgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRqUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFx0XHJcblx0XHRpZighd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL3dwLWdvb2dsZS1tYXBzLW1lbnUtc2V0dGluZ3MvKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEubWFwU2V0dGluZ3NQYWdlID0gV1BHTVpBLk1hcFNldHRpbmdzUGFnZS5jcmVhdGVJbnN0YW5jZSgpO1xyXG5cclxuXHRcdGpRdWVyeShkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcclxuXHRcdFx0alF1ZXJ5KCcjd3BnbXphX2ZsdXNoX2NhY2hlX2J0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0alF1ZXJ5KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XHJcblx0XHRcdFx0V1BHTVpBLm1hcFNldHRpbmdzUGFnZS5mbHVzaEdlb2NvZGVDYWNoZSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibWFwLXNldHRpbmdzLXBhZ2UuanMifQ==


// js/v8/map-settings.js
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


// js/v8/map.js
/**
 * @namespace WPGMZA
 * @module Map
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
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
		
		if(!(element instanceof HTMLElement))
			throw new Error("Argument must be a HTMLElement");
		
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
		
		this.engineElement = element;
		
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		this.circles = [];
		this.rectangles = [];
		
		this.loadSettings(options);
		
		this.shortcodeAttributes = {};
		if($(this.element).attr("data-shortcode-attributes"))
			try{
				this.shortcodeAttributes = JSON.parse($(this.element).attr("data-shortcode-attributes"))
			}catch(e) {
				console.warn("Error parsing shortcode attributes");
			}
		
		if(WPGMZA.getCurrentPage() != WPGMZA.PAGE_MAP_EDIT)
			this.initStoreLocator();
		
		this.markerFilter = WPGMZA.MarkerFilter.createInstance(this);
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
	
	WPGMZA.Map.prototype.initStoreLocator = function()
	{
		var storeLocatorElement = $(".wpgmza_sl_main_div");
		if(storeLocatorElement.length)
			this.storeLocator = WPGMZA.StoreLocator.createInstance(this, storeLocatorElement[0]);
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
		$(this.element).css({
			width: width
		});
		
		$(this.engineElement).css({
			width: "100%",
			height: height
		});
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
		
		this.markers.splice(this.markers.indexOf(marker), 1);
		this.dispatchEvent({type: "markerremoved", marker: marker});
		marker.dispatchEvent({type: "removed"});
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
	
	WPGMZA.Map.prototype.nudgeLatLng = function(latLng, x, y)
	{
		var pixels = this.latLngToPixels(latLng);
		
		pixels.x += parseFloat(x);
		pixels.y += parseFloat(y);
		
		if(isNaN(pixels.x) || isNaN(pixels.y))
			throw new Error("Invalid coordinates supplied");
		
		return this.pixelsToLatLng(pixels);
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

	WPGMZA.Map.prototype.hasVisibleMarkers = function(event)
	{
		// see how many markers is visible
		var markers_visible = 0;

		// loop through the markers
		for(var marker_id in marker_array)
		{
			// find markers on map after search
			var marker = marker_array[marker_id];
			
			// NB: We check whether the marker is on a map or not here, Pro toggles visibility, basic adds and removes markers
			if(marker.isFilterable && marker.getMap())
			{
				// count markers visible
				markers_visible++;
				break;			
			}
		}

		return markers_visible > 0; // Returns true if markers are visible, false if not
	}
	
	WPGMZA.Map.prototype.closeAllInfoWindows = function()
	{
		this.markers.forEach(function(marker) {
			
			if(marker.infoWindow)
				marker.infoWindow.close();
				
		});
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTWFwXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuRXZlbnREaXNwYXRjaGVyXHJcbiAqIEBndWxwLXJlcXVpcmVzIGV2ZW50LWRpc3BhdGNoZXIuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyBmb3IgbWFwcy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLk1hcFxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTWFwXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdG8gY29udGFpbiBtYXBcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgdG8gYXBwbHkgdG8gdGhpcyBtYXBcclxuXHQgKiBAYXVnbWVudHMgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0V1BHTVpBLmFzc2VydEluc3RhbmNlT2YodGhpcywgXCJNYXBcIik7XHJcblx0XHRcclxuXHRcdFdQR01aQS5FdmVudERpc3BhdGNoZXIuY2FsbCh0aGlzKTtcclxuXHRcdFxyXG5cdFx0aWYoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGEgSFRNTEVsZW1lbnRcIik7XHJcblx0XHRcclxuXHRcdC8vIE5COiBUaGlzIHNob3VsZCBiZSBtb3ZlZCB0byBhIGdldElEIGZ1bmN0aW9uIG9yIHNpbWlsYXIgYW5kIG9mZmxvYWRlZCB0byBQcm8uIElEIHNob3VsZCBiZSBmaXhlZCB0byAxIGluIGJhc2ljLlxyXG5cdFx0aWYoZWxlbWVudC5oYXNBdHRyaWJ1dGUoXCJkYXRhLW1hcC1pZFwiKSlcclxuXHRcdFx0dGhpcy5pZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1tYXAtaWRcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdHRoaXMuaWQgPSAxO1xyXG5cdFx0XHJcblx0XHRpZighL1xcZCsvLnRlc3QodGhpcy5pZCkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk1hcCBJRCBtdXN0IGJlIGFuIGludGVnZXJcIik7XHJcblx0XHRcclxuXHRcdFdQR01aQS5tYXBzLnB1c2godGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblx0XHR0aGlzLmVsZW1lbnQud3BnbXphTWFwID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5lbmdpbmVFbGVtZW50ID0gZWxlbWVudDtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXJrZXJzID0gW107XHJcblx0XHR0aGlzLnBvbHlnb25zID0gW107XHJcblx0XHR0aGlzLnBvbHlsaW5lcyA9IFtdO1xyXG5cdFx0dGhpcy5jaXJjbGVzID0gW107XHJcblx0XHR0aGlzLnJlY3RhbmdsZXMgPSBbXTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sb2FkU2V0dGluZ3Mob3B0aW9ucyk7XHJcblx0XHRcclxuXHRcdHRoaXMuc2hvcnRjb2RlQXR0cmlidXRlcyA9IHt9O1xyXG5cdFx0aWYoJCh0aGlzLmVsZW1lbnQpLmF0dHIoXCJkYXRhLXNob3J0Y29kZS1hdHRyaWJ1dGVzXCIpKVxyXG5cdFx0XHR0cnl7XHJcblx0XHRcdFx0dGhpcy5zaG9ydGNvZGVBdHRyaWJ1dGVzID0gSlNPTi5wYXJzZSgkKHRoaXMuZWxlbWVudCkuYXR0cihcImRhdGEtc2hvcnRjb2RlLWF0dHJpYnV0ZXNcIikpXHJcblx0XHRcdH1jYXRjaChlKSB7XHJcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiRXJyb3IgcGFyc2luZyBzaG9ydGNvZGUgYXR0cmlidXRlc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuZ2V0Q3VycmVudFBhZ2UoKSAhPSBXUEdNWkEuUEFHRV9NQVBfRURJVClcclxuXHRcdFx0dGhpcy5pbml0U3RvcmVMb2NhdG9yKCk7XHJcblx0XHRcclxuXHRcdHRoaXMubWFya2VyRmlsdGVyID0gV1BHTVpBLk1hcmtlckZpbHRlci5jcmVhdGVJbnN0YW5jZSh0aGlzKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFdQR01aQS5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5NYXA7XHJcblx0V1BHTVpBLk1hcC5uaWdodFRpbWVUaGVtZURhdGEgPSBbe1wiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMjQyZjNlXCJ9XX0se1wiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM3NDY4NTVcIn1dfSx7XCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMjQyZjNlXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlLmxvY2FsaXR5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Q1OTU2M1wifV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjNTc1NjYzXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaVwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNkNTk1NjNcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLnBhcmtcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzI2M2MzZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kucGFya1wiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM2YjlhNzZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMzg0MTRlXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWRcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMyMTJhMzdcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM5Y2E1YjNcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM3NDY4NTVcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzgwODIzZVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmhpZ2h3YXlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMxZjI4MzVcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2YzZDE5Y1wifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMyZjM5NDhcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwidHJhbnNpdC5zdGF0aW9uXCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Q1OTU2M1wifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMTcyNjNjXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzFiNzM3YVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM1MTVjNmRcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwid2F0ZXJcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMxNzI2M2NcIn1dfV07XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgY29udHJ1Y3RvciB0byBiZSB1c2VkIGJ5IGNyZWF0ZUluc3RhbmNlLCBkZXBlbmRpbmcgb24gdGhlIHNlbGVjdGVkIG1hcHMgZW5naW5lLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEByZXR1cm4ge2Z1bmN0aW9ufSBUaGUgYXBwcm9wcmlhdGUgY29udHJ1Y3RvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAuZ2V0Q29uc3RydWN0b3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFx0XHRcdHJldHVybiBXUEdNWkEuT0xQcm9NYXA7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTE1hcDtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIFdQR01aQS5Hb29nbGVQcm9NYXA7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5Hb29nbGVNYXA7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgbWFwLCA8c3Ryb25nPnBsZWFzZSA8ZW0+YWx3YXlzPC9lbT4gdXNlIHRoaXMgZnVuY3Rpb24gcmF0aGVyIHRoYW4gY2FsbGluZyB0aGUgY29uc3RydWN0b3IgZGlyZWN0bHk8L3N0cm9uZz4uXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCB0byBjb250YWluIG1hcFxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyB0byBhcHBseSB0byB0aGlzIG1hcFxyXG5cdCAqIEByZXR1cm4ge1dQR01aQS5NYXB9IEFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXBcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucylcclxuXHR7XHJcblx0XHR2YXIgY29uc3RydWN0b3IgPSBXUEdNWkEuTWFwLmdldENvbnN0cnVjdG9yKCk7XHJcblx0XHRyZXR1cm4gbmV3IGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBUaGUgbWFwcyBjdXJyZW50IGxhdGl0dWRlXHJcblx0ICogXHJcblx0ICogQHByb3BlcnR5IGxhdFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQG5hbWUgV1BHTVpBLk1hcCNsYXRcclxuXHQgKiBAdHlwZSBOdW1iZXJcclxuXHQgKi9cclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLk1hcC5wcm90b3R5cGUsIFwibGF0XCIsIHtcclxuXHRcdFxyXG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0Q2VudGVyKCkubGF0O1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHR2YXIgY2VudGVyID0gdGhpcy5nZXRDZW50ZXIoKTtcclxuXHRcdFx0Y2VudGVyLmxhdCA9IHZhbHVlO1xyXG5cdFx0XHR0aGlzLnNldENlbnRlcihjZW50ZXIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIG1hcHMgY3VycmVudCBsb25naXR1ZGVcclxuXHQgKiBcclxuXHQgKiBAcHJvcGVydHkgbG5nXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAbmFtZSBXUEdNWkEuTWFwI2xuZ1xyXG5cdCAqIEB0eXBlIE51bWJlclxyXG5cdCAqL1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuTWFwLnByb3RvdHlwZSwgXCJsbmdcIiwge1xyXG5cdFx0XHJcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRDZW50ZXIoKS5sbmc7XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdHZhciBjZW50ZXIgPSB0aGlzLmdldENlbnRlcigpO1xyXG5cdFx0XHRjZW50ZXIubG5nID0gdmFsdWU7XHJcblx0XHRcdHRoaXMuc2V0Q2VudGVyKGNlbnRlcik7XHJcblx0XHR9XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBUaGUgbWFwcyBjdXJyZW50IHpvb20gbGV2ZWxcclxuXHQgKiAgXHJcblx0ICogQHByb3BlcnR5IHpvb21cclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBuYW1lIFdQR01aQS5NYXAjem9vbVxyXG5cdCAqIEB0eXBlIE51bWJlclxyXG5cdCAqL1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuTWFwLnByb3RvdHlwZSwgXCJ6b29tXCIsIHtcclxuXHRcdFxyXG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0Wm9vbSgpO1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHR0aGlzLnNldFpvb20odmFsdWUpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcblx0LyoqXHJcblx0ICogTG9hZHMgdGhlIG1hcHMgc2V0dGluZ3MgYW5kIHNldHMgc29tZSBkZWZhdWx0c1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLmxvYWRTZXR0aW5ncyA9IGZ1bmN0aW9uKG9wdGlvbnMpXHJcblx0e1xyXG5cdFx0dmFyIHNldHRpbmdzID0gbmV3IFdQR01aQS5NYXBTZXR0aW5ncyh0aGlzLmVsZW1lbnQpO1xyXG5cdFx0dmFyIG90aGVyX3NldHRpbmdzID0gc2V0dGluZ3Mub3RoZXJfc2V0dGluZ3M7XHJcblx0XHRcclxuXHRcdGRlbGV0ZSBzZXR0aW5ncy5vdGhlcl9zZXR0aW5ncztcclxuXHRcdFxyXG5cdFx0LyppZihvdGhlcl9zZXR0aW5ncylcclxuXHRcdFx0Zm9yKHZhciBrZXkgaW4gb3RoZXJfc2V0dGluZ3MpXHJcblx0XHRcdFx0c2V0dGluZ3Nba2V5XSA9IG90aGVyX3NldHRpbmdzW2tleV07Ki9cclxuXHRcdFx0XHJcblx0XHRpZihvcHRpb25zKVxyXG5cdFx0XHRmb3IodmFyIGtleSBpbiBvcHRpb25zKVxyXG5cdFx0XHRcdHNldHRpbmdzW2tleV0gPSBvcHRpb25zW2tleV07XHJcblx0XHRcdFxyXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5pbml0U3RvcmVMb2NhdG9yID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBzdG9yZUxvY2F0b3JFbGVtZW50ID0gJChcIi53cGdtemFfc2xfbWFpbl9kaXZcIik7XHJcblx0XHRpZihzdG9yZUxvY2F0b3JFbGVtZW50Lmxlbmd0aClcclxuXHRcdFx0dGhpcy5zdG9yZUxvY2F0b3IgPSBXUEdNWkEuU3RvcmVMb2NhdG9yLmNyZWF0ZUluc3RhbmNlKHRoaXMsIHN0b3JlTG9jYXRvckVsZW1lbnRbMF0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIG9wdGlvbnMgaW4gYnVsayBvbiBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRmb3IodmFyIG5hbWUgaW4gb3B0aW9ucylcclxuXHRcdFx0dGhpcy5zZXR0aW5nc1tuYW1lXSA9IG9wdGlvbnNbbmFtZV07XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIGxhdExuZ3MgaW4ga2lsb21ldGVyc1xyXG5cdCAqIE5COiBTdGF0aWMgZnVuY3Rpb25cclxuXHQgKiBAcmV0dXJuIG51bWJlclxyXG5cdCAqL1xyXG5cdHZhciBlYXJ0aFJhZGl1c01ldGVycyA9IDYzNzE7XHJcblx0dmFyIHBpVGltZXMzNjAgPSBNYXRoLlBJIC8gMzYwO1xyXG5cdFxyXG5cdGZ1bmN0aW9uIGRlZzJyYWQoZGVnKSB7XHJcblx0ICByZXR1cm4gZGVnICogKE1hdGguUEkvMTgwKVxyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhpcyBnZXRzIHRoZSBkaXN0YW5jZSBpbiBraWxvbWV0ZXJzIGJldHdlZW4gdHdvIGxhdGl0dWRlIC8gbG9uZ2l0dWRlIHBvaW50c1xyXG5cdCAqIFRPRE86IE1vdmUgdGhpcyB0byB0aGUgZGlzdGFuY2UgY2xhc3MsIG9yIHRoZSBMYXRMbmcgY2xhc3NcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbGF0MSBMYXRpdHVkZSBmcm9tIHRoZSBmaXJzdCBjb29yZGluYXRlIHBhaXJcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbG9uMSBMb25naXR1ZGUgZnJvbSB0aGUgZmlyc3QgY29vcmRpbmF0ZSBwYWlyXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdDIgTGF0aXR1ZGUgZnJvbSB0aGUgc2Vjb25kIGNvb3JkaW5hdGUgcGFpclxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBsb24xIExvbmdpdHVkZSBmcm9tIHRoZSBzZWNvbmQgY29vcmRpbmF0ZSBwYWlyXHJcblx0ICogQHJldHVybiB7bnVtYmVyfSBUaGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZXMsIGluIGtpbG9tZXRlcnNcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLmdldEdlb2dyYXBoaWNEaXN0YW5jZSA9IGZ1bmN0aW9uKGxhdDEsIGxvbjEsIGxhdDIsIGxvbjIpXHJcblx0e1xyXG5cdFx0dmFyIGRMYXQgPSBkZWcycmFkKGxhdDItbGF0MSk7XHJcblx0XHR2YXIgZExvbiA9IGRlZzJyYWQobG9uMi1sb24xKTsgXHJcblx0XHRcclxuXHRcdHZhciBhID0gXHJcblx0XHRcdE1hdGguc2luKGRMYXQvMikgKiBNYXRoLnNpbihkTGF0LzIpICtcclxuXHRcdFx0TWF0aC5jb3MoZGVnMnJhZChsYXQxKSkgKiBNYXRoLmNvcyhkZWcycmFkKGxhdDIpKSAqIFxyXG5cdFx0XHRNYXRoLnNpbihkTG9uLzIpICogTWF0aC5zaW4oZExvbi8yKTsgXHJcblx0XHRcdFxyXG5cdFx0dmFyIGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxLWEpKTsgXHJcblx0XHR2YXIgZCA9IGVhcnRoUmFkaXVzTWV0ZXJzICogYzsgLy8gRGlzdGFuY2UgaW4ga21cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGQ7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENlbnRlcnMgdGhlIG1hcCBvbiB0aGUgc3VwcGxpZWQgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fFdQR01aQS5MYXRMbmd9IGxhdExuZyBBIExhdExuZyBsaXRlcmFsIG9yIGFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbihsYXRMbmcpXHJcblx0e1xyXG5cdFx0aWYoIShcImxhdFwiIGluIGxhdExuZyAmJiBcImxuZ1wiIGluIGxhdExuZykpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IGlzIG5vdCBhbiBvYmplY3Qgd2l0aCBsYXQgYW5kIGxuZ1wiKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgZGltZW5zaW9ucyBvZiB0aGUgbWFwIGVuZ2luZSBlbGVtZW50XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIFdpZHRoIGFzIGEgQ1NTIHN0cmluZ1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IGFzIGEgQ1NTIHN0cmluZ1xyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnNldERpbWVuc2lvbnMgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KVxyXG5cdHtcclxuXHRcdCQodGhpcy5lbGVtZW50KS5jc3Moe1xyXG5cdFx0XHR3aWR0aDogd2lkdGhcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZW5naW5lRWxlbWVudCkuY3NzKHtcclxuXHRcdFx0d2lkdGg6IFwiMTAwJVwiLFxyXG5cdFx0XHRoZWlnaHQ6IGhlaWdodFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdGhlIHNwZWNpZmllZCBtYXJrZXIgdG8gdGhpcyBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5NYXJrZXJ9IG1hcmtlciBUaGUgbWFya2VyIHRvIGFkZFxyXG5cdCAqIEBmaXJlcyBtYXJrZXJhZGRlZFxyXG5cdCAqIEBmaXJlcyBXUEdNWkEuTWFya2VyI2FkZGVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXJrZXJcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5hZGRNYXJrZXIgPSBmdW5jdGlvbihtYXJrZXIpXHJcblx0e1xyXG5cdFx0aWYoIShtYXJrZXIgaW5zdGFuY2VvZiBXUEdNWkEuTWFya2VyKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuTWFya2VyXCIpO1xyXG5cdFx0XHJcblx0XHRtYXJrZXIubWFwID0gdGhpcztcclxuXHRcdG1hcmtlci5wYXJlbnQgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcmtlcnMucHVzaChtYXJrZXIpO1xyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcIm1hcmtlcmFkZGVkXCIsIG1hcmtlcjogbWFya2VyfSk7XHJcblx0XHRtYXJrZXIuZGlzcGF0Y2hFdmVudCh7dHlwZTogXCJhZGRlZFwifSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBtYXJrZXIgZnJvbSB0aGlzIG1hcFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7V1BHTVpBLk1hcmtlcn0gbWFya2VyIFRoZSBtYXJrZXIgdG8gcmVtb3ZlXHJcblx0ICogQGZpcmVzIG1hcmtlcnJlbW92ZWRcclxuXHQgKiBAZmlyZXMgV1BHTVpBLk1hcmtlciNyZW1vdmVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXJrZXJcclxuXHQgKiBAdGhyb3dzIFdyb25nIG1hcCBlcnJvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnJlbW92ZU1hcmtlciA9IGZ1bmN0aW9uKG1hcmtlcilcclxuXHR7XHJcblx0XHRpZighKG1hcmtlciBpbnN0YW5jZW9mIFdQR01aQS5NYXJrZXIpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXJrZXJcIik7XHJcblx0XHRcclxuXHRcdGlmKG1hcmtlci5tYXAgIT09IHRoaXMpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIldyb25nIG1hcCBlcnJvclwiKTtcclxuXHRcdFxyXG5cdFx0aWYobWFya2VyLmluZm9XaW5kb3cpXHJcblx0XHRcdG1hcmtlci5pbmZvV2luZG93LmNsb3NlKCk7XHJcblx0XHRcclxuXHRcdG1hcmtlci5tYXAgPSBudWxsO1xyXG5cdFx0bWFya2VyLnBhcmVudCA9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMubWFya2Vycy5zcGxpY2UodGhpcy5tYXJrZXJzLmluZGV4T2YobWFya2VyKSwgMSk7XHJcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoe3R5cGU6IFwibWFya2VycmVtb3ZlZFwiLCBtYXJrZXI6IG1hcmtlcn0pO1xyXG5cdFx0bWFya2VyLmRpc3BhdGNoRXZlbnQoe3R5cGU6IFwicmVtb3ZlZFwifSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgYSBtYXJrZXIgYnkgSURcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge2ludH0gaWQgVGhlIElEIG9mIHRoZSBtYXJrZXIgdG8gZ2V0XHJcblx0ICogQHJldHVybiB7V1BHTVpBLk1hcmtlcnxudWxsfSBUaGUgbWFya2VyLCBvciBudWxsIGlmIG5vIG1hcmtlciB3aXRoIHRoZSBzcGVjaWZpZWQgSUQgaXMgZm91bmRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRNYXJrZXJCeUlEID0gZnVuY3Rpb24oaWQpXHJcblx0e1xyXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0aWYodGhpcy5tYXJrZXJzW2ldLmlkID09IGlkKVxyXG5cdFx0XHRcdHJldHVybiB0aGlzLm1hcmtlcnNbaV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRNYXJrZXJCeVRpdGxlID0gZnVuY3Rpb24odGl0bGUpXHJcblx0e1xyXG5cdFx0aWYodHlwZW9mIHRpdGxlID09IFwic3RyaW5nXCIpXHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZih0aGlzLm1hcmtlcnNbaV0udGl0bGUgPT0gdGl0bGUpXHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXJrZXJzW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRlbHNlIGlmKHRpdGxlIGluc3RhbmNlb2YgUmVnRXhwKVxyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYodGl0bGUudGVzdCh0aGlzLm1hcmtlcnNbaV0udGl0bGUpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMubWFya2Vyc1tpXTtcclxuXHRcdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBhIG1hcmtlciBieSBJRFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7aW50fSBpZCBUaGUgSUQgb2YgdGhlIG1hcmtlciB0byByZW1vdmVcclxuXHQgKiBAZmlyZXMgbWFya2VycmVtb3ZlZFxyXG5cdCAqIEBmaXJlcyBXUEdNWkEuTWFya2VyI3JlbW92ZWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5yZW1vdmVNYXJrZXJCeUlEID0gZnVuY3Rpb24oaWQpXHJcblx0e1xyXG5cdFx0dmFyIG1hcmtlciA9IHRoaXMuZ2V0TWFya2VyQnlJRChpZCk7XHJcblx0XHRcclxuXHRcdGlmKCFtYXJrZXIpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZW1vdmVNYXJrZXIobWFya2VyKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQWRkcyB0aGUgc3BlY2lmaWVkIHBvbHlnb24gdG8gdGhpcyBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5Qb2x5Z29ufSBwb2x5Z29uIFRoZSBwb2x5Z29uIHRvIGFkZFxyXG5cdCAqIEBmaXJlcyBwb2x5Z29uYWRkZWRcclxuXHQgKiBAdGhyb3dzIEFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLlBvbHlnb25cclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5hZGRQb2x5Z29uID0gZnVuY3Rpb24ocG9seWdvbilcclxuXHR7XHJcblx0XHRpZighKHBvbHlnb24gaW5zdGFuY2VvZiBXUEdNWkEuUG9seWdvbikpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLlBvbHlnb25cIik7XHJcblx0XHRcclxuXHRcdHBvbHlnb24ubWFwID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5wb2x5Z29ucy5wdXNoKHBvbHlnb24pO1xyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcInBvbHlnb25hZGRlZFwiLCBwb2x5Z29uOiBwb2x5Z29ufSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBwb2x5Z29uIGZyb20gdGhpcyBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5Qb2x5Z29ufSBwb2x5Z29uIFRoZSBwb2x5Z29uIHRvIHJlbW92ZVxyXG5cdCAqIEBmaXJlcyBwb2x5Z29ucmVtb3ZlZFxyXG5cdCAqIEB0aHJvd3MgQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuUG9seWdvblxyXG5cdCAqIEB0aHJvd3MgV3JvbmcgbWFwIGVycm9yXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUucmVtb3ZlUG9seWdvbiA9IGZ1bmN0aW9uKHBvbHlnb24pXHJcblx0e1xyXG5cdFx0aWYoIShwb2x5Z29uIGluc3RhbmNlb2YgV1BHTVpBLlBvbHlnb24pKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5Qb2x5Z29uXCIpO1xyXG5cdFx0XHJcblx0XHRpZihwb2x5Z29uLm1hcCAhPT0gdGhpcylcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiV3JvbmcgbWFwIGVycm9yXCIpO1xyXG5cdFx0XHJcblx0XHRwb2x5Z29uLm1hcCA9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMucG9seWdvbnMuc3BsaWNlKHRoaXMucG9seWdvbnMuaW5kZXhPZihwb2x5Z29uKSwgMSk7XHJcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoe3R5cGU6IFwicG9seWdvbnJlbW92ZWRcIiwgcG9seWdvbjogcG9seWdvbn0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIGEgcG9seWdvbiBieSBJRFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7aW50fSBpZCBUaGUgSUQgb2YgdGhlIHBvbHlnb24gdG8gZ2V0XHJcblx0ICogQHJldHVybiB7V1BHTVpBLlBvbHlnb258bnVsbH0gVGhlIHBvbHlnb24sIG9yIG51bGwgaWYgbm8gcG9seWdvbiB3aXRoIHRoZSBzcGVjaWZpZWQgSUQgaXMgZm91bmRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRQb2x5Z29uQnlJRCA9IGZ1bmN0aW9uKGlkKVxyXG5cdHtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnBvbHlnb25zLmxlbmd0aDsgaSsrKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0aGlzLnBvbHlnb25zW2ldLmlkID09IGlkKVxyXG5cdFx0XHRcdHJldHVybiB0aGlzLnBvbHlnb25zW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBhIHBvbHlnb24gYnkgSURcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge2ludH0gaWQgVGhlIElEIG9mIHRoZSBwb2x5Z29uIHRvIHJlbW92ZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnJlbW92ZVBvbHlnb25CeUlEID0gZnVuY3Rpb24oaWQpXHJcblx0e1xyXG5cdFx0dmFyIHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb25CeUlEKGlkKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBvbHlnb24pXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZW1vdmVQb2x5Z29uKHBvbHlnb24pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIGEgcG9seWxpbmUgYnkgSURcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRQb2x5bGluZUJ5SUQgPSBmdW5jdGlvbihpZClcclxuXHR7XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wb2x5bGluZXMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMucG9seWxpbmVzW2ldLmlkID09IGlkKVxyXG5cdFx0XHRcdHJldHVybiB0aGlzLnBvbHlsaW5lc1tpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdGhlIHNwZWNpZmllZCBwb2x5bGluZSB0byB0aGlzIG1hcFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7V1BHTVpBLlBvbHlsaW5lfSBwb2x5bGluZSBUaGUgcG9seWxpbmUgdG8gYWRkXHJcblx0ICogQGZpcmVzIHBvbHlsaW5lYWRkZWRcclxuXHQgKiBAdGhyb3dzIEFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLlBvbHlsaW5lXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUuYWRkUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHRpZighKHBvbHlsaW5lIGluc3RhbmNlb2YgV1BHTVpBLlBvbHlsaW5lKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuUG9seWxpbmVcIik7XHJcblx0XHRcclxuXHRcdHBvbHlsaW5lLm1hcCA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMucG9seWxpbmVzLnB1c2gocG9seWxpbmUpO1xyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcInBvbHlsaW5lYWRkZWRcIiwgcG9seWxpbmU6IHBvbHlsaW5lfSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBwb2x5bGluZSBmcm9tIHRoaXMgbWFwXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtXUEdNWkEuUG9seWxpbmV9IHBvbHlsaW5lIFRoZSBwb2x5bGluZSB0byByZW1vdmVcclxuXHQgKiBAZmlyZXMgcG9seWxpbmVyZW1vdmVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5Qb2x5bGluZVxyXG5cdCAqIEB0aHJvd3MgV3JvbmcgbWFwIGVycm9yXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUucmVtb3ZlUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHRpZighKHBvbHlsaW5lIGluc3RhbmNlb2YgV1BHTVpBLlBvbHlsaW5lKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuUG9seWxpbmVcIik7XHJcblx0XHRcclxuXHRcdGlmKHBvbHlsaW5lLm1hcCAhPT0gdGhpcylcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiV3JvbmcgbWFwIGVycm9yXCIpO1xyXG5cdFx0XHJcblx0XHRwb2x5bGluZS5tYXAgPSBudWxsO1xyXG5cdFx0XHJcblx0XHR0aGlzLnBvbHlsaW5lcy5zcGxpY2UodGhpcy5wb2x5bGluZXMuaW5kZXhPZihwb2x5bGluZSksIDEpO1xyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcInBvbHlsaW5lcmVtb3ZlZFwiLCBwb2x5bGluZTogcG9seWxpbmV9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyBhIHBvbHlsaW5lIGJ5IElEXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtpbnR9IGlkIFRoZSBJRCBvZiB0aGUgcG9seWxpbmUgdG8gZ2V0XHJcblx0ICogQHJldHVybiB7V1BHTVpBLlBvbHlsaW5lfG51bGx9IFRoZSBwb2x5bGluZSwgb3IgbnVsbCBpZiBubyBwb2x5bGluZSB3aXRoIHRoZSBzcGVjaWZpZWQgSUQgaXMgZm91bmRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRQb2x5bGluZUJ5SUQgPSBmdW5jdGlvbihpZClcclxuXHR7XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wb2x5bGluZXMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMucG9seWxpbmVzW2ldLmlkID09IGlkKVxyXG5cdFx0XHRcdHJldHVybiB0aGlzLnBvbHlsaW5lc1tpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgYSBwb2x5bGluZSBieSBJRFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7aW50fSBpZCBUaGUgSUQgb2YgdGhlIHBvbHlsaW5lIHRvIHJlbW92ZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnJlbW92ZVBvbHlsaW5lQnlJRCA9IGZ1bmN0aW9uKGlkKVxyXG5cdHtcclxuXHRcdHZhciBwb2x5bGluZSA9IHRoaXMuZ2V0UG9seWxpbmVCeUlEKGlkKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBvbHlsaW5lKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdHRoaXMucmVtb3ZlUG9seWxpbmUocG9seWxpbmUpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBZGRzIHRoZSBzcGVjaWZpZWQgY2lyY2xlIHRvIHRoaXMgbWFwXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtXUEdNWkEuQ2lyY2xlfSBjaXJjbGUgVGhlIGNpcmNsZSB0byBhZGRcclxuXHQgKiBAZmlyZXMgcG9seWdvbmFkZGVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5DaXJjbGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5hZGRDaXJjbGUgPSBmdW5jdGlvbihjaXJjbGUpXHJcblx0e1xyXG5cdFx0aWYoIShjaXJjbGUgaW5zdGFuY2VvZiBXUEdNWkEuQ2lyY2xlKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuQ2lyY2xlXCIpO1xyXG5cdFx0XHJcblx0XHRjaXJjbGUubWFwID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5jaXJjbGVzLnB1c2goY2lyY2xlKTtcclxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh7dHlwZTogXCJjaXJjbGVhZGRlZFwiLCBjaXJjbGU6IGNpcmNsZX0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgY2lyY2xlIGZyb20gdGhpcyBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5DaXJjbGV9IGNpcmNsZSBUaGUgY2lyY2xlIHRvIHJlbW92ZVxyXG5cdCAqIEBmaXJlcyBjaXJjbGVyZW1vdmVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAdGhyb3dzIFdyb25nIG1hcCBlcnJvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnJlbW92ZUNpcmNsZSA9IGZ1bmN0aW9uKGNpcmNsZSlcclxuXHR7XHJcblx0XHRpZighKGNpcmNsZSBpbnN0YW5jZW9mIFdQR01aQS5DaXJjbGUpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5DaXJjbGVcIik7XHJcblx0XHRcclxuXHRcdGlmKGNpcmNsZS5tYXAgIT09IHRoaXMpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIldyb25nIG1hcCBlcnJvclwiKTtcclxuXHRcdFxyXG5cdFx0Y2lyY2xlLm1hcCA9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMuY2lyY2xlcy5zcGxpY2UodGhpcy5jaXJjbGVzLmluZGV4T2YoY2lyY2xlKSwgMSk7XHJcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoe3R5cGU6IFwiY2lyY2xlcmVtb3ZlZFwiLCBjaXJjbGU6IGNpcmNsZX0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIGEgY2lyY2xlIGJ5IElEXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtpbnR9IGlkIFRoZSBJRCBvZiB0aGUgY2lyY2xlIHRvIGdldFxyXG5cdCAqIEByZXR1cm4ge1dQR01aQS5DaXJjbGV8bnVsbH0gVGhlIGNpcmNsZSwgb3IgbnVsbCBpZiBubyBjaXJjbGUgd2l0aCB0aGUgc3BlY2lmaWVkIElEIGlzIGZvdW5kXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUuZ2V0Q2lyY2xlQnlJRCA9IGZ1bmN0aW9uKGlkKVxyXG5cdHtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmNpcmNsZXMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMuY2lyY2xlc1tpXS5pZCA9PSBpZClcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaXJjbGVzW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBhIGNpcmNsZSBieSBJRFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7aW50fSBpZCBUaGUgSUQgb2YgdGhlIGNpcmNsZSB0byByZW1vdmVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5yZW1vdmVDaXJjbGVCeUlEID0gZnVuY3Rpb24oaWQpXHJcblx0e1xyXG5cdFx0dmFyIGNpcmNsZSA9IHRoaXMuZ2V0Q2lyY2xlQnlJRChpZCk7XHJcblx0XHRcclxuXHRcdGlmKCFjaXJjbGUpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZW1vdmVDaXJjbGUoY2lyY2xlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUubnVkZ2VMYXRMbmcgPSBmdW5jdGlvbihsYXRMbmcsIHgsIHkpXHJcblx0e1xyXG5cdFx0dmFyIHBpeGVscyA9IHRoaXMubGF0TG5nVG9QaXhlbHMobGF0TG5nKTtcclxuXHRcdFxyXG5cdFx0cGl4ZWxzLnggKz0gcGFyc2VGbG9hdCh4KTtcclxuXHRcdHBpeGVscy55ICs9IHBhcnNlRmxvYXQoeSk7XHJcblx0XHRcclxuXHRcdGlmKGlzTmFOKHBpeGVscy54KSB8fCBpc05hTihwaXhlbHMueSkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29vcmRpbmF0ZXMgc3VwcGxpZWRcIik7XHJcblx0XHRcclxuXHRcdHJldHVybiB0aGlzLnBpeGVsc1RvTGF0TG5nKHBpeGVscyk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE51ZGdlcyB0aGUgbWFwIHZpZXdwb3J0IGJ5IHRoZSBnaXZlbiBwaXhlbCBjb29yZGluYXRlc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB4IE51bWJlciBvZiBwaXhlbHMgdG8gbnVkZ2UgYWxvbmcgdGhlIHggYXhpc1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB5IE51bWJlciBvZiBwaXhlbHMgdG8gbnVkZ2UgYWxvbmcgdGhlIHkgYXhpc1xyXG5cdCAqIEB0aHJvd3MgSW52YWxpZCBjb29yZGluYXRlcyBzdXBwbGllZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLm51ZGdlID0gZnVuY3Rpb24oeCwgeSlcclxuXHR7XHJcblx0XHR2YXIgbnVkZ2VkID0gdGhpcy5udWRnZUxhdExuZyh0aGlzLmdldENlbnRlcigpLCB4LCB5KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZXRDZW50ZXIobnVkZ2VkKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUuYW5pbWF0ZU51ZGdlID0gZnVuY3Rpb24oeCwgeSwgb3JpZ2luLCBtaWxsaXNlY29uZHMpXHJcblx0e1xyXG5cdFx0dmFyIG51ZGdlZDtcclxuXHRcclxuXHRcdGlmKCFvcmlnaW4pXHJcblx0XHRcdG9yaWdpbiA9IHRoaXMuZ2V0Q2VudGVyKCk7XHJcblx0XHRlbHNlIGlmKCEob3JpZ2luIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZykpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk9yaWdpbiBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcIik7XHJcblxyXG5cdFx0bnVkZ2VkID0gdGhpcy5udWRnZUxhdExuZyhvcmlnaW4sIHgsIHkpO1xyXG5cdFx0XHJcblx0XHRpZighbWlsbGlzZWNvbmRzKVxyXG5cdFx0XHRtaWxsaXNlY29uZHMgPSBXUEdNWkEuZ2V0U2Nyb2xsQW5pbWF0aW9uRHVyYXRpb24oKTtcclxuXHRcdFxyXG5cdFx0JCh0aGlzKS5hbmltYXRlKHtcclxuXHRcdFx0bGF0OiBudWRnZWQubGF0LFxyXG5cdFx0XHRsbmc6IG51ZGdlZC5sbmdcclxuXHRcdH0sIG1pbGxpc2Vjb25kcyk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSB3aW5kb3cgcmVzaXplc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLm9uV2luZG93UmVzaXplID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBlbmdpbmUgbWFwIGRpdiBpcyByZXNpemVkXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUub25FbGVtZW50UmVzaXplZCA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIHZpZXdwb3J0IGJvdW5kcyBjaGFuZ2UuIEZpcmVzIHRoZSBsZWdhY3kgYm91bmRzX2NoYW5nZWQgZXZlbnQuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQGZpcmVzIGJvdW5kc2NoYW5nZWRcclxuXHQgKiBAZmlyZXMgYm91bmRzX2NoYW5nZWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5vbkJvdW5kc0NoYW5nZWQgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHQvLyBOYXRpdmUgZXZlbnRzXHJcblx0XHR0aGlzLnRyaWdnZXIoXCJib3VuZHNjaGFuZ2VkXCIpO1xyXG5cdFx0XHJcblx0XHQvLyBHb29nbGUgLyBsZWdhY3kgY29tcGF0aWJpbGl0eSBldmVudHNcclxuXHRcdHRoaXMudHJpZ2dlcihcImJvdW5kc19jaGFuZ2VkXCIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIHZpZXdwb3J0IGJlY29tZXMgaWRsZSAoZWcgbW92ZW1lbnQgZG9uZSwgdGlsZXMgbG9hZGVkKVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBmaXJlcyBpZGxlXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUub25JZGxlID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dGhpcy50cmlnZ2VyKFwiaWRsZVwiKTtcclxuXHR9XHJcblxyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLmhhc1Zpc2libGVNYXJrZXJzID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0Ly8gc2VlIGhvdyBtYW55IG1hcmtlcnMgaXMgdmlzaWJsZVxyXG5cdFx0dmFyIG1hcmtlcnNfdmlzaWJsZSA9IDA7XHJcblxyXG5cdFx0Ly8gbG9vcCB0aHJvdWdoIHRoZSBtYXJrZXJzXHJcblx0XHRmb3IodmFyIG1hcmtlcl9pZCBpbiBtYXJrZXJfYXJyYXkpXHJcblx0XHR7XHJcblx0XHRcdC8vIGZpbmQgbWFya2VycyBvbiBtYXAgYWZ0ZXIgc2VhcmNoXHJcblx0XHRcdHZhciBtYXJrZXIgPSBtYXJrZXJfYXJyYXlbbWFya2VyX2lkXTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIE5COiBXZSBjaGVjayB3aGV0aGVyIHRoZSBtYXJrZXIgaXMgb24gYSBtYXAgb3Igbm90IGhlcmUsIFBybyB0b2dnbGVzIHZpc2liaWxpdHksIGJhc2ljIGFkZHMgYW5kIHJlbW92ZXMgbWFya2Vyc1xyXG5cdFx0XHRpZihtYXJrZXIuaXNGaWx0ZXJhYmxlICYmIG1hcmtlci5nZXRNYXAoKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIGNvdW50IG1hcmtlcnMgdmlzaWJsZVxyXG5cdFx0XHRcdG1hcmtlcnNfdmlzaWJsZSsrO1xyXG5cdFx0XHRcdGJyZWFrO1x0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG1hcmtlcnNfdmlzaWJsZSA+IDA7IC8vIFJldHVybnMgdHJ1ZSBpZiBtYXJrZXJzIGFyZSB2aXNpYmxlLCBmYWxzZSBpZiBub3RcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUuY2xvc2VBbGxJbmZvV2luZG93cyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR0aGlzLm1hcmtlcnMuZm9yRWFjaChmdW5jdGlvbihtYXJrZXIpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKG1hcmtlci5pbmZvV2luZG93KVxyXG5cdFx0XHRcdG1hcmtlci5pbmZvV2luZG93LmNsb3NlKCk7XHJcblx0XHRcdFx0XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibWFwLmpzIn0=


// js/v8/maps-engine-dialog.js
/**
 * @namespace WPGMZA
 * @module MapsEngineDialog
 * @requires WPGMZA
 * @gulp-requires core.js
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
		
		$(element).show();
		$(element).remodal().open();
		
		$(element).find("input:radio").on("change", function(event) {
			
			$("#wpgmza-confirm-engine").prop("disabled", false);
			
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
	
	$(window).on("load", function(event) {
		
		var element = $("#wpgmza-maps-engine-dialog");
		
		if(!element.length)
			return;
		
		if(WPGMZA.settings.wpgmza_maps_engine_dialog_done)
			return;
		
		if(WPGMZA.settings.wpgmza_google_maps_api_key && WPGMZA.settings.wpgmza_google_maps_api_key.length)
			return;
		
		WPGMZA.mapsEngineDialog = new WPGMZA.MapsEngineDialog(element);
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXBzLWVuZ2luZS1kaWFsb2cuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTWFwc0VuZ2luZURpYWxvZ1xyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIG1vZGFsIGRpYWxvZyBwcmVzZW50ZWQgdG8gdGhlIHVzZXIgaW4gdGhlIG1hcCBlZGl0IHBhZ2UsIHByb21wdGluZyB0aGVtIHRvIGNob29zZSBhIG1hcCBlbmdpbmUsIGlmIHRoZXkgaGF2ZW4ndCBkb25lIHNvIGFscmVhZHlcclxuXHQgKiBAY2xhc3MgV1BHTVpBLk1hcEVuZ2luZURpYWxvZ1xyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTWFwRW5naW5lRGlhbG9nXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdG8gY3JlYXRlIG1vZGFsIGRpYWxvZyBmcm9tXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcHNFbmdpbmVEaWFsb2cgPSBmdW5jdGlvbihlbGVtZW50KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHRcdFxyXG5cdFx0aWYod2luZG93LndwZ216YVVuYmluZFNhdmVSZW1pbmRlcilcclxuXHRcdFx0d2luZG93LndwZ216YVVuYmluZFNhdmVSZW1pbmRlcigpO1xyXG5cdFx0XHJcblx0XHQkKGVsZW1lbnQpLnNob3coKTtcclxuXHRcdCQoZWxlbWVudCkucmVtb2RhbCgpLm9wZW4oKTtcclxuXHRcdFxyXG5cdFx0JChlbGVtZW50KS5maW5kKFwiaW5wdXQ6cmFkaW9cIikub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdCQoXCIjd3BnbXphLWNvbmZpcm0tZW5naW5lXCIpLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoXCIjd3BnbXphLWNvbmZpcm0tZW5naW5lXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYub25CdXR0b25DbGlja2VkKGV2ZW50KTtcclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogVHJpZ2dlcmVkIHdoZW4gYW4gZW5naW5lIGlzIHNlbGVjdGVkLiBNYWtlcyBhbiBBSkFYIGNhbGwgdG8gdGhlIHNlcnZlciB0byBzYXZlIHRoZSBzZWxlY3RlZCBlbmdpbmUuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwRW5naW5lRGlhbG9nXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBjbGljayBldmVudCBmcm9tIHRoZSBzZWxlY3RlZCBidXR0b24uXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcHNFbmdpbmVEaWFsb2cucHJvdG90eXBlLm9uQnV0dG9uQ2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdCQoZXZlbnQudGFyZ2V0KS5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcblx0XHRcclxuXHRcdCQuYWpheChXUEdNWkEuYWpheHVybCwge1xyXG5cdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxyXG5cdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0YWN0aW9uOiBcIndwZ216YV9tYXBzX2VuZ2luZV9kaWFsb2dfc2V0X2VuZ2luZVwiLFxyXG5cdFx0XHRcdGVuZ2luZTogJChcIltuYW1lPSd3cGdtemFfbWFwc19lbmdpbmUnXTpjaGVja2VkXCIpLnZhbCgpLFxyXG5cdFx0XHRcdG5vbmNlOiAkKFwiI3dwZ216YS1tYXBzLWVuZ2luZS1kaWFsb2dcIikuYXR0cihcImRhdGEtYWpheC1ub25jZVwiKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzLCB4aHIpIHtcclxuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHQkKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcclxuXHRcdHZhciBlbGVtZW50ID0gJChcIiN3cGdtemEtbWFwcy1lbmdpbmUtZGlhbG9nXCIpO1xyXG5cdFx0XHJcblx0XHRpZighZWxlbWVudC5sZW5ndGgpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLnNldHRpbmdzLndwZ216YV9tYXBzX2VuZ2luZV9kaWFsb2dfZG9uZSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuc2V0dGluZ3Mud3BnbXphX2dvb2dsZV9tYXBzX2FwaV9rZXkgJiYgV1BHTVpBLnNldHRpbmdzLndwZ216YV9nb29nbGVfbWFwc19hcGlfa2V5Lmxlbmd0aClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEubWFwc0VuZ2luZURpYWxvZyA9IG5ldyBXUEdNWkEuTWFwc0VuZ2luZURpYWxvZyhlbGVtZW50KTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6Im1hcHMtZW5naW5lLWRpYWxvZy5qcyJ9


// js/v8/marker-filter.js
/**
 * @namespace WPGMZA
 * @module MarkerFilter
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
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
	
	WPGMZA.MarkerFilter.prototype.update = function()
	{
		// NB: This function takes no action. The client can hide and show markers based on radius without putting load on the server. This function is only used by the ProMarkerFilter module
	}
	
	WPGMZA.MarkerFilter.prototype.onFilteringComplete = function(results)
	{
		
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXJrZXItZmlsdGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIE1hcmtlckZpbHRlclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyBldmVudC1kaXNwYXRjaGVyLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5NYXJrZXJGaWx0ZXIgPSBmdW5jdGlvbihtYXApXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuRXZlbnREaXNwYXRjaGVyLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwID0gbWFwO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyRmlsdGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5NYXJrZXJGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk1hcmtlckZpbHRlcjtcclxuXHRcclxuXHRXUEdNWkEuTWFya2VyRmlsdGVyLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24obWFwKVxyXG5cdHtcclxuXHRcdHJldHVybiBuZXcgV1BHTVpBLk1hcmtlckZpbHRlcihtYXApO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyRmlsdGVyLnByb3RvdHlwZS5nZXRGaWx0ZXJpbmdQYXJhbWV0ZXJzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSB7bWFwX2lkOiB0aGlzLm1hcC5pZH07XHJcblx0XHRcclxuXHRcdGlmKHRoaXMubWFwLnN0b3JlTG9jYXRvcilcclxuXHRcdFx0cGFyYW1zID0gJC5leHRlbmQocGFyYW1zLCB0aGlzLm1hcC5zdG9yZUxvY2F0b3IuZ2V0RmlsdGVyaW5nUGFyYW1ldGVycygpKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHBhcmFtcztcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcmtlckZpbHRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdC8vIE5COiBUaGlzIGZ1bmN0aW9uIHRha2VzIG5vIGFjdGlvbi4gVGhlIGNsaWVudCBjYW4gaGlkZSBhbmQgc2hvdyBtYXJrZXJzIGJhc2VkIG9uIHJhZGl1cyB3aXRob3V0IHB1dHRpbmcgbG9hZCBvbiB0aGUgc2VydmVyLiBUaGlzIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBieSB0aGUgUHJvTWFya2VyRmlsdGVyIG1vZHVsZVxyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyRmlsdGVyLnByb3RvdHlwZS5vbkZpbHRlcmluZ0NvbXBsZXRlID0gZnVuY3Rpb24ocmVzdWx0cylcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibWFya2VyLWZpbHRlci5qcyJ9


// js/v8/marker-panel.js
/**
 * @namespace WPGMZA
 * @module MarkerPanel
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	WPGMZA.MarkerPanel = function(element)
	{
		this.element = element;
	}
	
	$(window).on("load", function(event) {
		
		if(WPGMZA.getCurrentPage() == WPGMZA.PAGE_MAP_EDIT)
			WPGMZA.mapEditPage.markerPanel = new WPGMZA.MarkerPanel($("#wpgmza-marker-edit-panel")[0]);
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXJrZXItcGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTWFya2VyUGFuZWxcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5NYXJrZXJQYW5lbCA9IGZ1bmN0aW9uKGVsZW1lbnQpXHJcblx0e1xyXG5cdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHR9XHJcblx0XHJcblx0JCh3aW5kb3cpLm9uKFwibG9hZFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuZ2V0Q3VycmVudFBhZ2UoKSA9PSBXUEdNWkEuUEFHRV9NQVBfRURJVClcclxuXHRcdFx0V1BHTVpBLm1hcEVkaXRQYWdlLm1hcmtlclBhbmVsID0gbmV3IFdQR01aQS5NYXJrZXJQYW5lbCgkKFwiI3dwZ216YS1tYXJrZXItZWRpdC1wYW5lbFwiKVswXSk7XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxufSk7Il0sImZpbGUiOiJtYXJrZXItcGFuZWwuanMifQ==


// js/v8/marker.js
/**
 * @namespace WPGMZA
 * @module Marker
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * Base class for markers. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Marker
	 * @constructor WPGMZA.Marker
	 * @memberof WPGMZA
	 * @param {object} [row] Data to map to this object (eg from the database)
	 * @augments WPGMZA.MapObject
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
		
		WPGMZA.MapObject.apply(this, arguments);
		
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
	
	WPGMZA.Marker.prototype = Object.create(WPGMZA.MapObject.prototype);
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
		
		if(this.map.settings.marker == this.id)
			self.trigger("select");
		
		if(this.infoopen == "1")
			this.openInfoWindow();
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
		
		if(!window.marker_array)
			window.marker_array = {};
		
		if(!marker_array[this.map_id])
			marker_array[this.map_id] = [];
		
		marker_array[this.map_id][this.id] = this;
		
		if(!window.wpgmaps_localize_marker_data)
			window.wpgmaps_localize_marker_data = {};
		
		if(!wpgmaps_localize_marker_data[this.map_id])
			wpgmaps_localize_marker_data[this.map_id] = [];
		
		var cloned = $.extend({marker_id: this.id}, row);
		wpgmaps_localize_marker_data[this.map_id][this.id] = cloned;
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
	WPGMZA.Marker.prototype.openInfoWindow = function()
	{
		if(!this.map)
		{
			console.warn("Cannot open infowindow for marker with no map");
			return;
		}
		
		// NB: This is a workaround for "undefined" in InfoWindows (basic only) on map edit page
		if(WPGMZA.currentPage == "map-edit" && !WPGMZA.pro_version)
			return;
		
		if(this.map.lastInteractedMarker)
			this.map.lastInteractedMarker.infoWindow.close();
		this.map.lastInteractedMarker = this;
		
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
		if(this.map.settings.info_window_open_by == WPGMZA.InfoWindow.OPEN_BY_HOVER)
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
	WPGMZA.Marker.prototype.getAnimation = function(animation)
	{
		return this.settings.animation;
	}
	
	/**
	 * Sets the animation for this marker (see WPGMZA.Marker ANIMATION_* constants).
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {int} animation The animation to set.
	 */
	WPGMZA.Marker.prototype.setAnimation = function(animation)
	{
		this.settings.animation = animation;
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
	 * Overrides MapObject.toJSON, serializes the marker to a JSON object
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {object} A JSON representation of this marker
	 */
	WPGMZA.Marker.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXJrZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTWFya2VyXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBCYXNlIGNsYXNzIGZvciBtYXJrZXJzLiA8c3Ryb25nPlBsZWFzZSA8ZW0+ZG8gbm90PC9lbT4gY2FsbCB0aGlzIGNvbnN0cnVjdG9yIGRpcmVjdGx5LiBBbHdheXMgdXNlIGNyZWF0ZUluc3RhbmNlIHJhdGhlciB0aGFuIGluc3RhbnRpYXRpbmcgdGhpcyBjbGFzcyBkaXJlY3RseS48L3N0cm9uZz4gVXNpbmcgY3JlYXRlSW5zdGFuY2UgYWxsb3dzIHRoaXMgY2xhc3MgdG8gYmUgZXh0ZXJuYWxseSBleHRlbnNpYmxlLlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuTWFya2VyXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5NYXJrZXJcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIERhdGEgdG8gbWFwIHRvIHRoaXMgb2JqZWN0IChlZyBmcm9tIHRoZSBkYXRhYmFzZSlcclxuXHQgKiBAYXVnbWVudHMgV1BHTVpBLk1hcE9iamVjdFxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXJrZXIgPSBmdW5jdGlvbihyb3cpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLl9vZmZzZXQgPSB7eDogMCwgeTogMH07XHJcblx0XHRcclxuXHRcdFdQR01aQS5hc3NlcnRJbnN0YW5jZU9mKHRoaXMsIFwiTWFya2VyXCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmxhdCA9IFwiMzYuNzc4MjYxXCI7XHJcblx0XHR0aGlzLmxuZyA9IFwiLTExOS40MTc5MzIzOTk5XCI7XHJcblx0XHR0aGlzLmFkZHJlc3MgPSBcIkNhbGlmb3JuaWFcIjtcclxuXHRcdHRoaXMudGl0bGUgPSBudWxsO1xyXG5cdFx0dGhpcy5kZXNjcmlwdGlvbiA9IFwiXCI7XHJcblx0XHR0aGlzLmxpbmsgPSBcIlwiO1xyXG5cdFx0dGhpcy5pY29uID0gXCJcIjtcclxuXHRcdHRoaXMuYXBwcm92ZWQgPSAxO1xyXG5cdFx0dGhpcy5waWMgPSBudWxsO1xyXG5cdFx0XHJcblx0XHR0aGlzLmlzRmlsdGVyYWJsZSA9IHRydWU7XHJcblx0XHR0aGlzLmRpc2FibGVJbmZvV2luZG93ID0gZmFsc2U7XHJcblx0XHRcclxuXHRcdFdQR01aQS5NYXBPYmplY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0aWYocm93ICYmIHJvdy5oZWF0bWFwKVxyXG5cdFx0XHRyZXR1cm47IC8vIERvbid0IGxpc3RlbiBmb3IgdGhlc2UgZXZlbnRzIG9uIGhlYXRtYXAgbWFya2Vycy5cclxuXHRcdFxyXG5cdFx0aWYocm93KVxyXG5cdFx0XHR0aGlzLm9uKFwiaW5pdFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdGlmKHJvdy5wb3NpdGlvbilcclxuXHRcdFx0XHRcdHRoaXMuc2V0UG9zaXRpb24ocm93LnBvc2l0aW9uKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihyb3cubWFwKVxyXG5cdFx0XHRcdFx0cm93Lm1hcC5hZGRNYXJrZXIodGhpcyk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJhZGRlZFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uQWRkZWQoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMuaGFuZGxlTGVnYWN5R2xvYmFscyhyb3cpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLk1hcE9iamVjdC5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk1hcmtlcjtcclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBjb250cnVjdG9yIHRvIGJlIHVzZWQgYnkgY3JlYXRlSW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgc2VsZWN0ZWQgbWFwcyBlbmdpbmUuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHJldHVybiB7ZnVuY3Rpb259IFRoZSBhcHByb3ByaWF0ZSBjb250cnVjdG9yXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5nZXRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRzd2l0Y2goV1BHTVpBLnNldHRpbmdzLmVuZ2luZSlcclxuXHRcdHtcclxuXHRcdFx0Y2FzZSBcIm9wZW4tbGF5ZXJzXCI6XHJcblx0XHRcdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTFByb01hcmtlcjtcclxuXHRcdFx0XHRyZXR1cm4gV1BHTVpBLk9MTWFya2VyO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFx0XHRcdHJldHVybiBXUEdNWkEuR29vZ2xlUHJvTWFya2VyO1xyXG5cdFx0XHRcdHJldHVybiBXUEdNWkEuR29vZ2xlTWFya2VyO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgbWFya2VyLCA8c3Ryb25nPnBsZWFzZSA8ZW0+YWx3YXlzPC9lbT4gdXNlIHRoaXMgZnVuY3Rpb24gcmF0aGVyIHRoYW4gY2FsbGluZyB0aGUgY29uc3RydWN0b3IgZGlyZWN0bHk8L3N0cm9uZz4uXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIERhdGEgdG8gbWFwIHRvIHRoaXMgb2JqZWN0IChlZyBmcm9tIHRoZSBkYXRhYmFzZSlcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24ocm93KVxyXG5cdHtcclxuXHRcdHZhciBjb25zdHJ1Y3RvciA9IFdQR01aQS5NYXJrZXIuZ2V0Q29uc3RydWN0b3IoKTtcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3Iocm93KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcmtlci5BTklNQVRJT05fTk9ORVx0XHRcdD0gXCIwXCI7XHJcblx0V1BHTVpBLk1hcmtlci5BTklNQVRJT05fQk9VTkNFXHRcdFx0PSBcIjFcIjtcclxuXHRXUEdNWkEuTWFya2VyLkFOSU1BVElPTl9EUk9QXHRcdFx0PSBcIjJcIjtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLk1hcmtlci5wcm90b3R5cGUsIFwib2Zmc2V0WFwiLCB7XHJcblx0XHRcclxuXHRcdGdldDogZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0Lng7XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLl9vZmZzZXQueCA9IHZhbHVlO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFdQR01aQS5NYXJrZXIucHJvdG90eXBlLCBcIm9mZnNldFlcIiwge1xyXG5cdFx0XHJcblx0XHRnZXQ6IGZ1bmN0aW9uKClcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldC55O1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5fb2Zmc2V0LnkgPSB2YWx1ZTtcclxuXHRcdFx0dGhpcy51cGRhdGVPZmZzZXQoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBtYXJrZXIgaGFzIGJlZW4gYWRkZWQgdG8gYSBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXJrZXJcclxuXHQgKiBAbGlzdGVucyBtb2R1bGU6V1BHTVpBLk1hcmtlcn5hZGRlZFxyXG5cdCAqIEBmaXJlcyBtb2R1bGU6V1BHTVpBLk1hcmtlcn5zZWxlY3QgV2hlbiB0aGlzIG1hcmtlciBpcyB0YXJnZXRlZCBieSB0aGUgbWFya2VyIHNob3J0Y29kZSBhdHRyaWJ1dGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5vbkFkZGVkID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uQ2xpY2soZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uTW91c2VPdmVyKGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3RcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vblNlbGVjdChldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5tYXAuc2V0dGluZ3MubWFya2VyID09IHRoaXMuaWQpXHJcblx0XHRcdHNlbGYudHJpZ2dlcihcInNlbGVjdFwiKTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5pbmZvb3BlbiA9PSBcIjFcIilcclxuXHRcdFx0dGhpcy5vcGVuSW5mb1dpbmRvdygpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5oYW5kbGVMZWdhY3lHbG9iYWxzID0gZnVuY3Rpb24ocm93KVxyXG5cdHtcclxuXHRcdGlmKCEoV1BHTVpBLnNldHRpbmdzLnVzZUxlZ2FjeUdsb2JhbHMgJiYgdGhpcy5tYXBfaWQgJiYgdGhpcy5pZCkpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dmFyIG07XHJcblx0XHRpZihXUEdNWkEucHJvX3ZlcnNpb24gJiYgKG0gPSBXUEdNWkEucHJvX3ZlcnNpb24ubWF0Y2goL1xcZCsvKSkpXHJcblx0XHR7XHJcblx0XHRcdGlmKG1bMF0gPD0gNylcclxuXHRcdFx0XHRyZXR1cm47IC8vIERvbid0IHRvdWNoIHRoZSBsZWdhY3kgZ2xvYmFsc1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZighd2luZG93Lm1hcmtlcl9hcnJheSlcclxuXHRcdFx0d2luZG93Lm1hcmtlcl9hcnJheSA9IHt9O1xyXG5cdFx0XHJcblx0XHRpZighbWFya2VyX2FycmF5W3RoaXMubWFwX2lkXSlcclxuXHRcdFx0bWFya2VyX2FycmF5W3RoaXMubWFwX2lkXSA9IFtdO1xyXG5cdFx0XHJcblx0XHRtYXJrZXJfYXJyYXlbdGhpcy5tYXBfaWRdW3RoaXMuaWRdID0gdGhpcztcclxuXHRcdFxyXG5cdFx0aWYoIXdpbmRvdy53cGdtYXBzX2xvY2FsaXplX21hcmtlcl9kYXRhKVxyXG5cdFx0XHR3aW5kb3cud3BnbWFwc19sb2NhbGl6ZV9tYXJrZXJfZGF0YSA9IHt9O1xyXG5cdFx0XHJcblx0XHRpZighd3BnbWFwc19sb2NhbGl6ZV9tYXJrZXJfZGF0YVt0aGlzLm1hcF9pZF0pXHJcblx0XHRcdHdwZ21hcHNfbG9jYWxpemVfbWFya2VyX2RhdGFbdGhpcy5tYXBfaWRdID0gW107XHJcblx0XHRcclxuXHRcdHZhciBjbG9uZWQgPSAkLmV4dGVuZCh7bWFya2VyX2lkOiB0aGlzLmlkfSwgcm93KTtcclxuXHRcdHdwZ21hcHNfbG9jYWxpemVfbWFya2VyX2RhdGFbdGhpcy5tYXBfaWRdW3RoaXMuaWRdID0gY2xvbmVkO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5pbml0SW5mb1dpbmRvdyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZih0aGlzLmluZm9XaW5kb3cpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dGhpcy5pbmZvV2luZG93ID0gV1BHTVpBLkluZm9XaW5kb3cuY3JlYXRlSW5zdGFuY2UoKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUGxhY2Vob2xkZXIgZm9yIGZ1dHVyZSB1c2VcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXJrZXJcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5vcGVuSW5mb1dpbmRvdyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZighdGhpcy5tYXApXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIkNhbm5vdCBvcGVuIGluZm93aW5kb3cgZm9yIG1hcmtlciB3aXRoIG5vIG1hcFwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBOQjogVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIFwidW5kZWZpbmVkXCIgaW4gSW5mb1dpbmRvd3MgKGJhc2ljIG9ubHkpIG9uIG1hcCBlZGl0IHBhZ2VcclxuXHRcdGlmKFdQR01aQS5jdXJyZW50UGFnZSA9PSBcIm1hcC1lZGl0XCIgJiYgIVdQR01aQS5wcm9fdmVyc2lvbilcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLm1hcC5sYXN0SW50ZXJhY3RlZE1hcmtlcilcclxuXHRcdFx0dGhpcy5tYXAubGFzdEludGVyYWN0ZWRNYXJrZXIuaW5mb1dpbmRvdy5jbG9zZSgpO1xyXG5cdFx0dGhpcy5tYXAubGFzdEludGVyYWN0ZWRNYXJrZXIgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLmluaXRJbmZvV2luZG93KCk7XHJcblx0XHR0aGlzLmluZm9XaW5kb3cub3Blbih0aGlzLm1hcCwgdGhpcyk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBtYXJrZXIgaGFzIGJlZW4gY2xpY2tlZFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBsaXN0ZW5zIG1vZHVsZTpXUEdNWkEuTWFya2VyfmNsaWNrXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUub25DbGljayA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgbWFya2VyIGhhcyBiZWVuIHNlbGVjdGVkLCBlaXRoZXIgYnkgdGhlIGljb24gYmVpbmcgY2xpY2tlZCwgb3IgZnJvbSBhIG1hcmtlciBsaXN0aW5nXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQGxpc3RlbnMgbW9kdWxlOldQR01aQS5NYXJrZXJ+c2VsZWN0XHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUub25TZWxlY3QgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR0aGlzLm9wZW5JbmZvV2luZG93KCk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGhvdmVycyB0aGUgbW91c2Ugb3ZlciB0aGlzIG1hcmtlclxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBsaXN0ZW5zIG1vZHVsZTpXUEdNWkEuTWFya2Vyfm1vdXNlb3ZlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLm9uTW91c2VPdmVyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0aWYodGhpcy5tYXAuc2V0dGluZ3MuaW5mb193aW5kb3dfb3Blbl9ieSA9PSBXUEdNWkEuSW5mb1dpbmRvdy5PUEVOX0JZX0hPVkVSKVxyXG5cdFx0XHR0aGlzLm9wZW5JbmZvV2luZG93KCk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIG1hcmtlciBpY29uIGltYWdlIFVSTCwgd2l0aG91dCB0aGUgcHJvdG9jb2wgcHJlZml4XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHJldHVybiB7c3RyaW5nfSBUaGUgVVJMIHRvIHRoZSBtYXJrZXJzIGljb24gaW1hZ2VcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5nZXRJY29uID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGZ1bmN0aW9uIHN0cmlwUHJvdG9jb2wodXJsKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0eXBlb2YgdXJsICE9IFwic3RyaW5nXCIpXHJcblx0XHRcdFx0cmV0dXJuIHVybDtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiB1cmwucmVwbGFjZSgvXmh0dHAocz8pOi8sIFwiXCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuZGVmYXVsdE1hcmtlckljb24pXHJcblx0XHRcdHJldHVybiBzdHJpcFByb3RvY29sKFdQR01aQS5kZWZhdWx0TWFya2VySWNvbik7XHJcblx0XHRcclxuXHRcdHJldHVybiBzdHJpcFByb3RvY29sKFdQR01aQS5zZXR0aW5ncy5kZWZhdWx0X21hcmtlcl9pY29uKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlclxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEByZXR1cm4ge29iamVjdH0gTGF0TG5nIGxpdGVyYWwgb2YgdGhpcyBtYXJrZXJzIHBvc2l0aW9uXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0bGF0OiBwYXJzZUZsb2F0KHRoaXMubGF0KSxcclxuXHRcdFx0bG5nOiBwYXJzZUZsb2F0KHRoaXMubG5nKVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHBhcmFtIHtvYmplY3R8V1BHTVpBLkxhdExuZ30gbGF0TG5nIFRoZSBwb3NpdGlvbiBlaXRoZXIgYXMgYSBMYXRMbmcgbGl0ZXJhbCBvciBpbnN0YW5jZSBvZiBXUEdNWkEuTGF0TG5nLlxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24obGF0TG5nKVxyXG5cdHtcclxuXHRcdGlmKGxhdExuZyBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubGF0ID0gbGF0TG5nLmxhdDtcclxuXHRcdFx0dGhpcy5sbmcgPSBsYXRMbmcubG5nO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmxhdCA9IHBhcnNlRmxvYXQobGF0TG5nLmxhdCk7XHJcblx0XHRcdHRoaXMubG5nID0gcGFyc2VGbG9hdChsYXRMbmcubG5nKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuc2V0T2Zmc2V0ID0gZnVuY3Rpb24oeCwgeSlcclxuXHR7XHJcblx0XHR0aGlzLl9vZmZzZXQueCA9IHg7XHJcblx0XHR0aGlzLl9vZmZzZXQueSA9IHk7XHJcblx0XHRcclxuXHRcdHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLnVwZGF0ZU9mZnNldCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgYW5pbWF0aW9uIHNldCBvbiB0aGlzIG1hcmtlciAoc2VlIFdQR01aQS5NYXJrZXIgQU5JTUFUSU9OXyogY29uc3RhbnRzKS5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXJrZXJcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5nZXRBbmltYXRpb24gPSBmdW5jdGlvbihhbmltYXRpb24pXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuc2V0dGluZ3MuYW5pbWF0aW9uO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSBhbmltYXRpb24gZm9yIHRoaXMgbWFya2VyIChzZWUgV1BHTVpBLk1hcmtlciBBTklNQVRJT05fKiBjb25zdGFudHMpLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBwYXJhbSB7aW50fSBhbmltYXRpb24gVGhlIGFuaW1hdGlvbiB0byBzZXQuXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuc2V0QW5pbWF0aW9uID0gZnVuY3Rpb24oYW5pbWF0aW9uKVxyXG5cdHtcclxuXHRcdHRoaXMuc2V0dGluZ3MuYW5pbWF0aW9uID0gYW5pbWF0aW9uO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIG1hcmtlciB2aXNpYmlsaXR5XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEB0b2RvIEltcGxlbWVudFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuZ2V0VmlzaWJsZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBtYXJrZXIgdmlzaWJpbGl0eS4gVGhpcyBpcyB1c2VkIGJ5IHRoZSBzdG9yZSBsb2NhdG9yIGV0Yy4gYW5kIGlzIG5vdCBhIHNldHRpbmcuIENsb3NlcyB0aGUgSW5mb1dpbmRvdyBpZiB0aGUgbWFya2VyIGlzIGJlaW5nIGhpZGRlbiBhbmQgdGhlIEluZm9XaW5kb3cgZm9yIHRoaXMgbWFya2VyIGlzIG9wZW4uXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHBhcmFtIHtib29sfSB2aXNpYmxlIFdoZXRoZXIgdGhlIG1hcmtlciBzaG91bGQgYmUgdmlzaWJsZSBvciBub3RcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5zZXRWaXNpYmxlID0gZnVuY3Rpb24odmlzaWJsZSlcclxuXHR7XHJcblx0XHRpZighdmlzaWJsZSAmJiB0aGlzLmluZm9XaW5kb3cpXHJcblx0XHRcdHRoaXMuaW5mb1dpbmRvdy5jbG9zZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5nZXRNYXAgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMubWFwO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSBtYXAgdGhpcyBtYXJrZXIgc2hvdWxkIGJlIGRpc3BsYXllZCBvbi4gSWYgaXQgaXMgYWxyZWFkeSBvbiBhIG1hcCwgaXQgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhhdCBtYXAgZmlyc3QsIGJlZm9yZSBiZWluZyBhZGRlZCB0byB0aGUgc3VwcGxpZWQgbWFwLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBwYXJhbSB7V1BHTVpBLk1hcH0gbWFwIFRoZSBtYXAgdG8gYWRkIHRoaXMgbWFya21lciB0b1xyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLnNldE1hcCA9IGZ1bmN0aW9uKG1hcClcclxuXHR7XHJcblx0XHRpZighbWFwKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0aGlzLm1hcClcclxuXHRcdFx0XHR0aGlzLm1hcC5yZW1vdmVNYXJrZXIodGhpcyk7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHRcdG1hcC5hZGRNYXJrZXIodGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwID0gbWFwO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIHdoZXRoZXIgdGhpcyBtYXJrZXIgaXMgZHJhZ2dhYmxlIG9yIG5vdFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEByZXR1cm4ge2Jvb2x9IFRydWUgaWYgdGhlIG1hcmtlciBpcyBkcmFnZ2FibGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5nZXREcmFnZ2FibGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgd2hldGhlciB0aGUgbWFya2VyIGlzIGRyYWdnYWJsZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBwYXJhbSB7Ym9vbH0gZHJhZ2dhYmxlIFNldCB0byB0cnVlIHRvIG1ha2UgdGhpcyBtYXJrZXIgZHJhZ2dhYmxlXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuc2V0RHJhZ2dhYmxlID0gZnVuY3Rpb24oZHJhZ2dhYmxlKVxyXG5cdHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIG9wdGlvbnMgb24gdGhpcyBtYXJrZXJcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXJrZXJcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgb3B0aW9ucyB0byBiZSBzZXRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuc2V0T3BhY2l0eSA9IGZ1bmN0aW9uKG9wYWNpdHkpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENlbnRlcnMgdGhlIG1hcCB0aGlzIG1hcmtlciBiZWxvbmdzIHRvIG9uIHRoaXMgbWFya2VyXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHRocm93cyBNYXJrZXIgaGFzbid0IGJlZW4gYWRkZWQgdG8gYSBtYXBcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5wYW5JbnRvVmlldyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZighdGhpcy5tYXApXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk1hcmtlciBoYXNuJ3QgYmVlbiBhZGRlZCB0byBhIG1hcFwiKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXAuc2V0Q2VudGVyKHRoaXMuZ2V0UG9zaXRpb24oKSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE92ZXJyaWRlcyBNYXBPYmplY3QudG9KU09OLCBzZXJpYWxpemVzIHRoZSBtYXJrZXIgdG8gYSBKU09OIG9iamVjdFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEByZXR1cm4ge29iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgbWFya2VyXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciByZXN1bHQgPSBXUEdNWkEuTWFwT2JqZWN0LnByb3RvdHlwZS50b0pTT04uY2FsbCh0aGlzKTtcclxuXHRcdHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb24oKTtcclxuXHRcdFxyXG5cdFx0JC5leHRlbmQocmVzdWx0LCB7XHJcblx0XHRcdGxhdDogcG9zaXRpb24ubGF0LFxyXG5cdFx0XHRsbmc6IHBvc2l0aW9uLmxuZyxcclxuXHRcdFx0YWRkcmVzczogdGhpcy5hZGRyZXNzLFxyXG5cdFx0XHR0aXRsZTogdGhpcy50aXRsZSxcclxuXHRcdFx0ZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXHJcblx0XHRcdGxpbms6IHRoaXMubGluayxcclxuXHRcdFx0aWNvbjogdGhpcy5pY29uLFxyXG5cdFx0XHRwaWM6IHRoaXMucGljLFxyXG5cdFx0XHRhcHByb3ZlZDogdGhpcy5hcHByb3ZlZFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Im1hcmtlci5qcyJ9


// js/v8/modern-store-locator-circle.js
/**
 * @namespace WPGMZA
 * @module ModernStoreLocatorCircle
 * @requires WPGMZA
 * @gulp-requires core.js
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
			map = this.map = MYMAP[map_id].map;
		else
			map = this.map = MYMAP.map;
		
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
			color: "#63AFF2",
			
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
			this.settings.color = "#63AFF2";
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtb2Rlcm4tc3RvcmUtbG9jYXRvci1jaXJjbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBUaGlzIGlzIHRoZSBiYXNlIGNsYXNzIHRoZSBtb2Rlcm4gc3RvcmUgbG9jYXRvciBjaXJjbGUuIDxzdHJvbmc+UGxlYXNlIDxlbT5kbyBub3Q8L2VtPiBjYWxsIHRoaXMgY29uc3RydWN0b3IgZGlyZWN0bHkuIEFsd2F5cyB1c2UgY3JlYXRlSW5zdGFuY2UgcmF0aGVyIHRoYW4gaW5zdGFudGlhdGluZyB0aGlzIGNsYXNzIGRpcmVjdGx5Ljwvc3Ryb25nPiBVc2luZyBjcmVhdGVJbnN0YW5jZSBhbGxvd3MgdGhpcyBjbGFzcyB0byBiZSBleHRlcm5hbGx5IGV4dGVuc2libGUuXHJcblx0ICogQGNsYXNzIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEBwYXJhbSB7aW50fSBtYXBfaWQgVGhlIElEIG9mIHRoZSBtYXAgdGhpcyBjaXJjbGUgYmVsb25ncyB0b1xyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3NdIFNldHRpbmdzIHRvIHBhc3MgaW50byB0aGlzIGNpcmNsZSwgc3VjaCBhcyBzdHJva2VDb2xvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUgPSBmdW5jdGlvbihtYXBfaWQsIHNldHRpbmdzKSB7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgbWFwO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuaXNQcm9WZXJzaW9uKCkpXHJcblx0XHRcdG1hcCA9IHRoaXMubWFwID0gTVlNQVBbbWFwX2lkXS5tYXA7XHJcblx0XHRlbHNlXHJcblx0XHRcdG1hcCA9IHRoaXMubWFwID0gTVlNQVAubWFwO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcF9pZCA9IG1hcF9pZDtcclxuXHRcdHRoaXMubWFwRWxlbWVudCA9IG1hcC5lbGVtZW50O1xyXG5cdFx0dGhpcy5tYXBTaXplID0ge1xyXG5cdFx0XHR3aWR0aDogICQodGhpcy5tYXBFbGVtZW50KS53aWR0aCgpLFxyXG5cdFx0XHRoZWlnaHQ6ICQodGhpcy5tYXBFbGVtZW50KS5oZWlnaHQoKVxyXG5cdFx0fTtcclxuXHRcdFx0XHJcblx0XHR0aGlzLmluaXRDYW52YXNMYXllcigpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldHRpbmdzID0ge1xyXG5cdFx0XHRjZW50ZXI6IG5ldyBXUEdNWkEuTGF0TG5nKDAsIDApLFxyXG5cdFx0XHRyYWRpdXM6IDEsXHJcblx0XHRcdGNvbG9yOiBcIiM2M0FGRjJcIixcclxuXHRcdFx0XHJcblx0XHRcdHNoYWRvd0NvbG9yOiBcIndoaXRlXCIsXHJcblx0XHRcdHNoYWRvd0JsdXI6IDQsXHJcblx0XHRcdFxyXG5cdFx0XHRjZW50ZXJSaW5nUmFkaXVzOiAxMCxcclxuXHRcdFx0Y2VudGVyUmluZ0xpbmVXaWR0aDogMyxcclxuXHJcblx0XHRcdG51bUlubmVyUmluZ3M6IDksXHJcblx0XHRcdGlubmVyUmluZ0xpbmVXaWR0aDogMSxcclxuXHRcdFx0aW5uZXJSaW5nRmFkZTogdHJ1ZSxcclxuXHRcdFx0XHJcblx0XHRcdG51bU91dGVyUmluZ3M6IDcsXHJcblx0XHRcdFxyXG5cdFx0XHRyaW5nTGluZVdpZHRoOiAxLFxyXG5cdFx0XHRcclxuXHRcdFx0bWFpblJpbmdMaW5lV2lkdGg6IDIsXHJcblx0XHRcdFxyXG5cdFx0XHRudW1TcG9rZXM6IDYsXHJcblx0XHRcdHNwb2tlc1N0YXJ0QW5nbGU6IE1hdGguUEkgLyAyLFxyXG5cdFx0XHRcclxuXHRcdFx0bnVtUmFkaXVzTGFiZWxzOiA2LFxyXG5cdFx0XHRyYWRpdXNMYWJlbHNTdGFydEFuZ2xlOiBNYXRoLlBJIC8gMixcclxuXHRcdFx0cmFkaXVzTGFiZWxGb250OiBcIjEzcHggc2Fucy1zZXJpZlwiLFxyXG5cdFx0XHRcclxuXHRcdFx0dmlzaWJsZTogZmFsc2VcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGlmKHNldHRpbmdzKVxyXG5cdFx0XHR0aGlzLnNldE9wdGlvbnMoc2V0dGluZ3MpO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgY29udHJ1Y3RvciB0byBiZSB1c2VkIGJ5IGNyZWF0ZUluc3RhbmNlLCBkZXBlbmRpbmcgb24gdGhlIHNlbGVjdGVkIG1hcHMgZW5naW5lLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEByZXR1cm4ge2Z1bmN0aW9ufSBUaGUgYXBwcm9wcmlhdGUgY29udHJ1Y3RvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihtYXAsIHNldHRpbmdzKSB7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgPT0gXCJnb29nbGUtbWFwc1wiKVxyXG5cdFx0XHRyZXR1cm4gbmV3IFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUobWFwLCBzZXR0aW5ncyk7XHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBuZXcgV1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlKG1hcCwgc2V0dGluZ3MpO1xyXG5cdFx0XHJcblx0fTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiB0byBpbml0aWFsaXplIHRoZSBjYW52YXMgbGF5ZXJcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5pbml0Q2FudmFzTGF5ZXIgPSBmdW5jdGlvbigpIHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBIYW5kbGVzIHRoZSBtYXAgdmlld3BvcnQgYmVpbmcgcmVzaXplZFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLm9uUmVzaXplID0gZnVuY3Rpb24oZXZlbnQpIHsgXHJcblx0XHR0aGlzLmRyYXcoKTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZXMgYW5kIHJlZHJhd3MgdGhlIGNpcmNsZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLm9uVXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHsgXHJcblx0XHR0aGlzLmRyYXcoKTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgb3B0aW9ucyBvbiB0aGUgY2lyY2xlIChmb3IgZXhhbXBsZSwgc3Ryb2tlQ29sb3IpXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgQW4gb2JqZWN0IG9mIG9wdGlvbnMgdG8gaXRlcmF0ZSBvdmVyIGFuZCBzZXQgb24gdGhpcyBjaXJjbGUuXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHRcdGZvcih2YXIgbmFtZSBpbiBvcHRpb25zKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgZnVuY3Rpb25OYW1lID0gXCJzZXRcIiArIG5hbWUuc3Vic3RyKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cigxKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHR5cGVvZiB0aGlzW2Z1bmN0aW9uTmFtZV0gPT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0XHRcdHRoaXNbZnVuY3Rpb25OYW1lXShvcHRpb25zW25hbWVdKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRoaXMuc2V0dGluZ3NbbmFtZV0gPSBvcHRpb25zW25hbWVdO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgcmVzb2x1dGlvbiBzY2FsZSBmb3IgZHJhd2luZyBvbiB0aGUgY2lyY2xlcyBjYW52YXMuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHJldHVybiB7bnVtYmVyfSBUaGUgZGV2aWNlIHBpeGVsIHJhdGlvLCBvciAxIHdoZXJlIHRoYXQgaXMgbm90IHByZXNlbnQuXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0UmVzb2x1dGlvblNjYWxlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGNlbnRlciBvZiB0aGUgY2lyY2xlXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHJldHVybiB7b2JqZWN0fSBBIGxhdExuZyBsaXRlcmFsXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0Q2VudGVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRQb3NpdGlvbigpO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGVcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5MYXRMbmd8b2JqZWN0fSBBIExhdExuZyBsaXRlcmFsIG9yIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0dGhpcy5zZXRQb3NpdGlvbih2YWx1ZSk7XHJcblx0fTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNlbnRlciBhcyBhIExhdExuZyBsaXRlcmFsXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLnNldHRpbmdzLmNlbnRlcjtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciBzZXRDZW50ZXJcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHBvc2l0aW9uKSB7XHJcblx0XHR0aGlzLnNldHRpbmdzLmNlbnRlciA9IHBvc2l0aW9uO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgY2lyY2xlIHJhZGl1cywgaW4ga2lsb21ldGVyc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEByZXR1cm4ge251bWJlcn0gVGhlIGNpcmNsZXMgcmFkaXVzLCBpbiBraWxvbWV0ZXJzXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0UmFkaXVzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zZXR0aW5ncy5yYWRpdXM7XHJcblx0fTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSBjaXJjbGVzIHJhZGl1cywgaW4ga2lsb21ldGVyc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgVGhlIHJhZGl1cywgaW4ga2lsb21ldGVyc1xyXG5cdCAqIEB0aHJvd3MgSW52YWxpZCByYWRpdXNcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMgPSBmdW5jdGlvbihyYWRpdXMpIHtcclxuXHRcdFxyXG5cdFx0aWYoaXNOYU4ocmFkaXVzKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByYWRpdXNcIik7XHJcblx0XHRcclxuXHRcdHRoaXMuc2V0dGluZ3MucmFkaXVzID0gcmFkaXVzO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgY2lyY2xlXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHJldHVybiB7Ym9vbH0gV2hldGhlciBvciBub3QgdGhlIGNpcmNsZSBpcyB2aXNpYmxlXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0VmlzaWJsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2V0dGluZ3MudmlzaWJsZTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGNpcmNsZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEBwYXJhbSB7Ym9vbH0gdmlzaWJsZSBXaGV0aGVyIHRoZSBjaXJjbGUgc2hvdWxkIGJlIHZpc2libGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRWaXNpYmxlID0gZnVuY3Rpb24odmlzaWJsZSkge1xyXG5cdFx0dGhpcy5zZXR0aW5ncy52aXNpYmxlID0gdmlzaWJsZTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFic3RyYWN0IGZ1bmN0aW9uIHRvIGdldCB0aGUgdHJhbnNmb3JtZWQgY2lyY2xlIHJhZGl1cyAoc2VlIHN1YmNsYXNzZXMpXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGttIFRoZSBpbnB1dCByYWRpdXMsIGluIGtpbG9tZXRlcnNcclxuXHQgKiBAdGhyb3dzIEFic3RyYWN0IGZ1bmN0aW9uIGNhbGxlZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldFRyYW5zZm9ybWVkUmFkaXVzID0gZnVuY3Rpb24oa20pXHJcblx0e1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQWJzdHJhY3QgZnVuY3Rpb24gY2FsbGVkXCIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiB0byBzZXQgdGhlIGNhbnZhcyBjb250ZXh0XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGNvbnRleHQgdHlwZVxyXG5cdCAqIEB0aHJvd3MgQWJzdHJhY3QgZnVuY3Rpb24gY2FsbGVkXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKHR5cGUpXHJcblx0e1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQWJzdHJhY3QgZnVuY3Rpb24gY2FsbGVkXCIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiB0byBnZXQgdGhlIGNhbnZhcyBkaW1lbnNpb25zXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHRocm93cyBBYnN0cmFjdCBmdW5jdGlvbiBjYWxsZWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRDYW52YXNEaW1lbnNpb25zID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcIkFic3RyYWN0IGZ1bmN0aW9uIGNhbGxlZFwiKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogVmFsaWRhdGVzIHRoZSBjaXJjbGUgc2V0dGluZ3MgYW5kIGNvcnJlY3RzIHRoZW0gd2hlcmUgdGhleSBhcmUgaW52YWxpZFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLnZhbGlkYXRlU2V0dGluZ3MgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoIVdQR01aQS5pc0hleENvbG9yU3RyaW5nKHRoaXMuc2V0dGluZ3MuY29sb3IpKVxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmNvbG9yID0gXCIjNjNBRkYyXCI7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIERyYXdzIHRoZSBjaXJjbGUgdG8gdGhlIGNhbnZhc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuXHRcdFxyXG5cdFx0dGhpcy52YWxpZGF0ZVNldHRpbmdzKCk7XHJcblx0XHRcclxuXHRcdHZhciBzZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3M7XHJcblx0XHR2YXIgY2FudmFzRGltZW5zaW9ucyA9IHRoaXMuZ2V0Q2FudmFzRGltZW5zaW9ucygpO1xyXG5cdFx0XHJcbiAgICAgICAgdmFyIGNhbnZhc1dpZHRoID0gY2FudmFzRGltZW5zaW9ucy53aWR0aDtcclxuICAgICAgICB2YXIgY2FudmFzSGVpZ2h0ID0gY2FudmFzRGltZW5zaW9ucy5oZWlnaHQ7XHJcblx0XHRcclxuXHRcdHZhciBtYXAgPSB0aGlzLm1hcDtcclxuXHRcdHZhciByZXNvbHV0aW9uU2NhbGUgPSB0aGlzLmdldFJlc29sdXRpb25TY2FsZSgpO1xyXG5cdFx0XHJcblx0XHRjb250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCk7XHJcblxyXG5cdFx0aWYoIXNldHRpbmdzLnZpc2libGUpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0Y29udGV4dC5zaGFkb3dDb2xvciA9IHNldHRpbmdzLnNoYWRvd0NvbG9yO1xyXG5cdFx0Y29udGV4dC5zaGFkb3dCbHVyID0gc2V0dGluZ3Muc2hhZG93Qmx1cjtcclxuXHRcdFxyXG5cdFx0Ly8gTkI6IDIwMTgvMDIvMTMgLSBMZWZ0IHRoaXMgaGVyZSBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIGNhbGlicmF0ZWQgbW9yZSBhY2N1cmF0ZWx5XHJcblx0XHQvKmlmKCF0aGlzLnRlc3RDaXJjbGUpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudGVzdENpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoe1xyXG5cdFx0XHRcdHN0cm9rZUNvbG9yOiBcIiNmZjAwMDBcIixcclxuXHRcdFx0XHRzdHJva2VPcGFjaXR5OiAwLjUsXHJcblx0XHRcdFx0c3Ryb2tlV2VpZ2h0OiAzLFxyXG5cdFx0XHRcdG1hcDogdGhpcy5tYXAsXHJcblx0XHRcdFx0Y2VudGVyOiB0aGlzLnNldHRpbmdzLmNlbnRlclxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy50ZXN0Q2lyY2xlLnNldENlbnRlcihzZXR0aW5ncy5jZW50ZXIpO1xyXG5cdFx0dGhpcy50ZXN0Q2lyY2xlLnNldFJhZGl1cyhzZXR0aW5ncy5yYWRpdXMgKiAxMDAwKTsqL1xyXG5cdFx0XHJcbiAgICAgICAgLy8gUmVzZXQgdHJhbnNmb3JtXHJcbiAgICAgICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHNjYWxlID0gdGhpcy5nZXRTY2FsZSgpO1xyXG4gICAgICAgIGNvbnRleHQuc2NhbGUoc2NhbGUsIHNjYWxlKTtcclxuXHJcblx0XHQvLyBUcmFuc2xhdGUgYnkgd29ybGQgb3JpZ2luXHJcblx0XHR2YXIgb2Zmc2V0ID0gdGhpcy5nZXRXb3JsZE9yaWdpbk9mZnNldCgpO1xyXG5cdFx0Y29udGV4dC50cmFuc2xhdGUob2Zmc2V0LngsIG9mZnNldC55KTtcclxuXHJcbiAgICAgICAgLy8gR2V0IGNlbnRlciBhbmQgcHJvamVjdCB0byBwaXhlbCBzcGFjZVxyXG5cdFx0dmFyIGNlbnRlciA9IG5ldyBXUEdNWkEuTGF0TG5nKHRoaXMuc2V0dGluZ3MuY2VudGVyKTtcclxuXHRcdHZhciB3b3JsZFBvaW50ID0gdGhpcy5nZXRDZW50ZXJQaXhlbHMoKTtcclxuXHRcdFxyXG5cdFx0dmFyIHJnYmEgPSBXUEdNWkEuaGV4VG9SZ2JhKHNldHRpbmdzLmNvbG9yKTtcclxuXHRcdHZhciByaW5nU3BhY2luZyA9IHRoaXMuZ2V0VHJhbnNmb3JtZWRSYWRpdXMoc2V0dGluZ3MucmFkaXVzKSAvIChzZXR0aW5ncy5udW1Jbm5lclJpbmdzICsgMSk7XHJcblx0XHRcclxuXHRcdC8vIFRPRE86IEltcGxlbWVudCBncmFkaWVudHMgZm9yIGNvbG9yIGFuZCBvcGFjaXR5XHJcblx0XHRcclxuXHRcdC8vIEluc2lkZSBjaXJjbGUgKGZpeGVkPylcclxuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gc2V0dGluZ3MuY29sb3I7XHJcblx0XHRjb250ZXh0LmxpbmVXaWR0aCA9ICgxIC8gc2NhbGUpICogc2V0dGluZ3MuY2VudGVyUmluZ0xpbmVXaWR0aDtcclxuXHRcdFxyXG5cdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcclxuXHRcdGNvbnRleHQuYXJjKFxyXG5cdFx0XHR3b3JsZFBvaW50LngsIFxyXG5cdFx0XHR3b3JsZFBvaW50LnksIFxyXG5cdFx0XHR0aGlzLmdldFRyYW5zZm9ybWVkUmFkaXVzKHNldHRpbmdzLmNlbnRlclJpbmdSYWRpdXMpIC8gc2NhbGUsIDAsIDIgKiBNYXRoLlBJXHJcblx0XHQpO1xyXG5cdFx0Y29udGV4dC5zdHJva2UoKTtcclxuXHRcdGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblx0XHRcclxuXHRcdC8vIFNwb2tlc1xyXG5cdFx0dmFyIHJhZGl1cyA9IHRoaXMuZ2V0VHJhbnNmb3JtZWRSYWRpdXMoc2V0dGluZ3MucmFkaXVzKSArIChyaW5nU3BhY2luZyAqIHNldHRpbmdzLm51bU91dGVyUmluZ3MpICsgMTtcclxuXHRcdHZhciBncmFkID0gY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudCgwLCAwLCAwLCAwLCAwLCByYWRpdXMpO1xyXG5cdFx0dmFyIHJnYmEgPSBXUEdNWkEuaGV4VG9SZ2JhKHNldHRpbmdzLmNvbG9yKTtcclxuXHRcdHZhciBzdGFydCA9IFdQR01aQS5yZ2JhVG9TdHJpbmcocmdiYSksIGVuZDtcclxuXHRcdHZhciBzcG9rZUFuZ2xlO1xyXG5cdFx0XHJcblx0XHRyZ2JhLmEgPSAwO1xyXG5cdFx0ZW5kID0gV1BHTVpBLnJnYmFUb1N0cmluZyhyZ2JhKTtcclxuXHRcdFxyXG5cdFx0Z3JhZC5hZGRDb2xvclN0b3AoMCwgc3RhcnQpO1xyXG5cdFx0Z3JhZC5hZGRDb2xvclN0b3AoMSwgZW5kKTtcclxuXHRcdFxyXG5cdFx0Y29udGV4dC5zYXZlKCk7XHJcblx0XHRcclxuXHRcdGNvbnRleHQudHJhbnNsYXRlKHdvcmxkUG9pbnQueCwgd29ybGRQb2ludC55KTtcclxuXHRcdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBncmFkO1xyXG5cdFx0Y29udGV4dC5saW5lV2lkdGggPSAyIC8gc2NhbGU7XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzZXR0aW5ncy5udW1TcG9rZXM7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0c3Bva2VBbmdsZSA9IHNldHRpbmdzLnNwb2tlc1N0YXJ0QW5nbGUgKyAoTWF0aC5QSSAqIDIpICogKGkgLyBzZXR0aW5ncy5udW1TcG9rZXMpO1xyXG5cdFx0XHRcclxuXHRcdFx0eCA9IE1hdGguY29zKHNwb2tlQW5nbGUpICogcmFkaXVzO1xyXG5cdFx0XHR5ID0gTWF0aC5zaW4oc3Bva2VBbmdsZSkgKiByYWRpdXM7XHJcblx0XHRcdFxyXG5cdFx0XHRjb250ZXh0LnNldExpbmVEYXNoKFsyIC8gc2NhbGUsIDE1IC8gc2NhbGVdKTtcclxuXHRcdFx0XHJcblx0XHRcdGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0XHRcdGNvbnRleHQubW92ZVRvKDAsIDApO1xyXG5cdFx0XHRjb250ZXh0LmxpbmVUbyh4LCB5KTtcclxuXHRcdFx0Y29udGV4dC5zdHJva2UoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Y29udGV4dC5zZXRMaW5lRGFzaChbXSk7XHJcblx0XHRcclxuXHRcdGNvbnRleHQucmVzdG9yZSgpO1xyXG5cdFx0XHJcblx0XHQvLyBJbm5lciByaW5nbGV0c1xyXG5cdFx0Y29udGV4dC5saW5lV2lkdGggPSAoMSAvIHNjYWxlKSAqIHNldHRpbmdzLmlubmVyUmluZ0xpbmVXaWR0aDtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpID0gMTsgaSA8PSBzZXR0aW5ncy5udW1Jbm5lclJpbmdzOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciByYWRpdXMgPSBpICogcmluZ1NwYWNpbmc7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihzZXR0aW5ncy5pbm5lclJpbmdGYWRlKVxyXG5cdFx0XHRcdHJnYmEuYSA9IDEgLSAoaSAtIDEpIC8gc2V0dGluZ3MubnVtSW5uZXJSaW5ncztcclxuXHRcdFx0XHJcblx0XHRcdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBXUEdNWkEucmdiYVRvU3RyaW5nKHJnYmEpO1xyXG5cdFx0XHRcclxuXHRcdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcclxuXHRcdFx0Y29udGV4dC5hcmMod29ybGRQb2ludC54LCB3b3JsZFBvaW50LnksIHJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG5cdFx0XHRjb250ZXh0LnN0cm9rZSgpO1xyXG5cdFx0XHRjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBNYWluIGNpcmNsZVxyXG5cdFx0Y29udGV4dC5zdHJva2VTdHlsZSA9IHNldHRpbmdzLmNvbG9yO1xyXG5cdFx0Y29udGV4dC5saW5lV2lkdGggPSAoMSAvIHNjYWxlKSAqIHNldHRpbmdzLmNlbnRlclJpbmdMaW5lV2lkdGg7XHJcblx0XHRcclxuXHRcdGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0XHRjb250ZXh0LmFyYyh3b3JsZFBvaW50LngsIHdvcmxkUG9pbnQueSwgdGhpcy5nZXRUcmFuc2Zvcm1lZFJhZGl1cyhzZXR0aW5ncy5yYWRpdXMpLCAwLCAyICogTWF0aC5QSSk7XHJcblx0XHRjb250ZXh0LnN0cm9rZSgpO1xyXG5cdFx0Y29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHRcdFxyXG5cdFx0Ly8gT3V0ZXIgcmluZ2xldHNcclxuXHRcdHZhciByYWRpdXMgPSByYWRpdXMgKyByaW5nU3BhY2luZztcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzZXR0aW5ncy5udW1PdXRlclJpbmdzOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKHNldHRpbmdzLmlubmVyUmluZ0ZhZGUpXHJcblx0XHRcdFx0cmdiYS5hID0gMSAtIGkgLyBzZXR0aW5ncy5udW1PdXRlclJpbmdzO1xyXG5cdFx0XHRcclxuXHRcdFx0Y29udGV4dC5zdHJva2VTdHlsZSA9IFdQR01aQS5yZ2JhVG9TdHJpbmcocmdiYSk7XHJcblx0XHRcdFxyXG5cdFx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cdFx0XHRjb250ZXh0LmFyYyh3b3JsZFBvaW50LngsIHdvcmxkUG9pbnQueSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XHJcblx0XHRcdGNvbnRleHQuc3Ryb2tlKCk7XHJcblx0XHRcdGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblx0XHRcclxuXHRcdFx0cmFkaXVzICs9IHJpbmdTcGFjaW5nO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBUZXh0XHJcblx0XHRpZihzZXR0aW5ncy5udW1SYWRpdXNMYWJlbHMgPiAwKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgbTtcclxuXHRcdFx0dmFyIHJhZGl1cyA9IHRoaXMuZ2V0VHJhbnNmb3JtZWRSYWRpdXMoc2V0dGluZ3MucmFkaXVzKTtcclxuXHRcdFx0dmFyIGNsaXBSYWRpdXMgPSAoMTIgKiAxLjEpIC8gc2NhbGU7XHJcblx0XHRcdHZhciB4LCB5O1xyXG5cdFx0XHRcclxuXHRcdFx0aWYobSA9IHNldHRpbmdzLnJhZGl1c0xhYmVsRm9udC5tYXRjaCgvKFxcZCspcHgvKSlcclxuXHRcdFx0XHRjbGlwUmFkaXVzID0gKHBhcnNlSW50KG1bMV0pIC8gMiAqIDEuMSkgLyBzY2FsZTtcclxuXHRcdFx0XHJcblx0XHRcdGNvbnRleHQuZm9udCA9IHNldHRpbmdzLnJhZGl1c0xhYmVsRm9udDtcclxuXHRcdFx0Y29udGV4dC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG5cdFx0XHRjb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcblx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gc2V0dGluZ3MuY29sb3I7XHJcblx0XHRcdFxyXG5cdFx0XHRjb250ZXh0LnNhdmUoKTtcclxuXHRcdFx0XHJcblx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHdvcmxkUG9pbnQueCwgd29ybGRQb2ludC55KVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHNldHRpbmdzLm51bVJhZGl1c0xhYmVsczsgaSsrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHNwb2tlQW5nbGUgPSBzZXR0aW5ncy5yYWRpdXNMYWJlbHNTdGFydEFuZ2xlICsgKE1hdGguUEkgKiAyKSAqIChpIC8gc2V0dGluZ3MubnVtUmFkaXVzTGFiZWxzKTtcclxuXHRcdFx0XHR2YXIgdGV4dEFuZ2xlID0gc3Bva2VBbmdsZSArIE1hdGguUEkgLyAyO1xyXG5cdFx0XHRcdHZhciB0ZXh0ID0gc2V0dGluZ3MucmFkaXVzU3RyaW5nO1xyXG5cdFx0XHRcdHZhciB3aWR0aDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihNYXRoLnNpbihzcG9rZUFuZ2xlKSA+IDApXHJcblx0XHRcdFx0XHR0ZXh0QW5nbGUgLT0gTWF0aC5QSTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR4ID0gTWF0aC5jb3Moc3Bva2VBbmdsZSkgKiByYWRpdXM7XHJcblx0XHRcdFx0eSA9IE1hdGguc2luKHNwb2tlQW5nbGUpICogcmFkaXVzO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnRleHQuc2F2ZSgpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHgsIHkpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnRleHQucm90YXRlKHRleHRBbmdsZSk7XHJcblx0XHRcdFx0Y29udGV4dC5zY2FsZSgxIC8gc2NhbGUsIDEgLyBzY2FsZSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0d2lkdGggPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpLndpZHRoO1xyXG5cdFx0XHRcdGhlaWdodCA9IHdpZHRoIC8gMjtcclxuXHRcdFx0XHRjb250ZXh0LmNsZWFyUmVjdCgtd2lkdGgsIC1oZWlnaHQsIDIgKiB3aWR0aCwgMiAqIGhlaWdodCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Y29udGV4dC5maWxsVGV4dChzZXR0aW5ncy5yYWRpdXNTdHJpbmcsIDAsIDApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnRleHQucmVzdG9yZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRjb250ZXh0LnJlc3RvcmUoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibW9kZXJuLXN0b3JlLWxvY2F0b3ItY2lyY2xlLmpzIn0=


// js/v8/modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module ModernStoreLocator
 * @requires WPGMZA
 * @pro-requires WPGMZA.UseMyLocationButton
 * @gulp-requires core.js
 * @gulp-pro-requires use-my-location-button.js
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
		
		if(wpgmaps_localize[map_id].other_settings.store_locator_query_string && wpgmaps_localize[map_id].other_settings.store_locator_query_string.length)
			addressInput.attr("placeholder", wpgmaps_localize[map_id].other_settings.store_locator_query_string);
		
		inner.append(addressInput);
		
		var titleSearch = $(original).find("[id='nameInput_" + map_id + "']");
		if(titleSearch.length)
		{
			var placeholder = wpgmaps_localize[map_id].other_settings.store_locator_name_string;
			if(placeholder && placeholder.length)
				titleSearch.attr("placeholder", placeholder);
			inner.append(titleSearch);
		}
		
		var button;
		if(button = $(original).find("button.wpgmza-use-my-location"))
			inner.append(button);
		
		$(addressInput).on("keydown keypress", function(event) {
			
			if(event.keyCode == 13)
			{
				// NB: Hacky workaround
				self.searchButton.trigger("click");
				
				// NB: Legacy support
				searchLocations(map_id);
				
				map.storeLocator.onSearch(event);
			}
			
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
		
		$(map.markerFilter).on("filteringcomplete", function(event) {

			if(!this.map.hasVisibleMarkers())
			{
				if(this.map.settings.store_locator_not_found_message !=  WPGMZA.localized_strings.zero_results && this.map.settings.store_locator_not_found_message != "")
				{
					alert(this.map.settings.store_locator_not_found_message);

				}
				else{
					alert(WPGMZA.localized_strings.zero_results);
				}
			}

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
	WPGMZA.ModernStoreLocator.createInstance = function(map_id)
	{
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtb2Rlcm4tc3RvcmUtbG9jYXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBNb2Rlcm5TdG9yZUxvY2F0b3JcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAcHJvLXJlcXVpcmVzIFdQR01aQS5Vc2VNeUxvY2F0aW9uQnV0dG9uXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICogQGd1bHAtcHJvLXJlcXVpcmVzIHVzZS1teS1sb2NhdGlvbi1idXR0b24uanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIG5ldyBtb2Rlcm4gbG9vayBzdG9yZSBsb2NhdG9yLiBJdCB0YWtlcyB0aGUgZWxlbWVudHMgZnJvbSB0aGUgZGVmYXVsdCBsb29rIGFuZCBtb3ZlcyB0aGVtIGludG8gdGhlIG1hcCwgd3JhcHBpbmcgaW4gYSBuZXcgZWxlbWVudCBzbyB3ZSBjYW4gYXBwbHkgbmV3IHN0eWxlcy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvclxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBwYXJhbSB7aW50fSBtYXBfaWQgVGhlIElEIG9mIHRoZSBtYXAgdGhpcyBzdG9yZSBsb2NhdG9yIGJlbG9uZ3MgdG9cclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yID0gZnVuY3Rpb24obWFwX2lkKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdHZhciBvcmlnaW5hbDtcclxuXHRcdHZhciBtYXAgPSBXUEdNWkEuZ2V0TWFwQnlJRChtYXBfaWQpO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuYXNzZXJ0SW5zdGFuY2VPZih0aGlzLCBcIk1vZGVyblN0b3JlTG9jYXRvclwiKTtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRvcmlnaW5hbCA9ICQoXCIud3BnbXphX3NsX3NlYXJjaF9idXR0b25bbWlkPSdcIiArIG1hcF9pZCArIFwiJ10sIC53cGdtemFfc2xfc2VhcmNoX2J1dHRvbl9cIiArIG1hcF9pZCkuY2xvc2VzdChcIi53cGdtemFfc2xfbWFpbl9kaXZcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdG9yaWdpbmFsID0gJChcIi53cGdtemFfc2xfc2VhcmNoX2J1dHRvblwiKS5jbG9zZXN0KFwiLndwZ216YV9zbF9tYWluX2RpdlwiKTtcclxuXHRcdFxyXG5cdFx0aWYoIW9yaWdpbmFsLmxlbmd0aClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHQvLyBCdWlsZCAvIHJlLWFycmFuZ2UgZWxlbWVudHNcclxuXHRcdHRoaXMuZWxlbWVudCA9ICQoXCI8ZGl2IGNsYXNzPSd3cGdtemEtbW9kZXJuLXN0b3JlLWxvY2F0b3InPjxkaXYgY2xhc3M9J3dwZ216YS1pbm5lciB3cGdtemEtbW9kZXJuLWhvdmVyLW9wYXF1ZScvPjwvZGl2PlwiKVswXTtcclxuXHRcdFxyXG5cdFx0dmFyIGlubmVyID0gJCh0aGlzLmVsZW1lbnQpLmZpbmQoXCIud3BnbXphLWlubmVyXCIpO1xyXG5cdFx0XHJcblx0XHR2YXIgYWRkcmVzc0lucHV0O1xyXG5cdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRhZGRyZXNzSW5wdXQgPSAkKG9yaWdpbmFsKS5maW5kKFwiLmFkZHJlc3NJbnB1dFwiKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0YWRkcmVzc0lucHV0ID0gJChvcmlnaW5hbCkuZmluZChcIiNhZGRyZXNzSW5wdXRcIik7XHJcblx0XHRcclxuXHRcdGlmKHdwZ21hcHNfbG9jYWxpemVbbWFwX2lkXS5vdGhlcl9zZXR0aW5ncy5zdG9yZV9sb2NhdG9yX3F1ZXJ5X3N0cmluZyAmJiB3cGdtYXBzX2xvY2FsaXplW21hcF9pZF0ub3RoZXJfc2V0dGluZ3Muc3RvcmVfbG9jYXRvcl9xdWVyeV9zdHJpbmcubGVuZ3RoKVxyXG5cdFx0XHRhZGRyZXNzSW5wdXQuYXR0cihcInBsYWNlaG9sZGVyXCIsIHdwZ21hcHNfbG9jYWxpemVbbWFwX2lkXS5vdGhlcl9zZXR0aW5ncy5zdG9yZV9sb2NhdG9yX3F1ZXJ5X3N0cmluZyk7XHJcblx0XHRcclxuXHRcdGlubmVyLmFwcGVuZChhZGRyZXNzSW5wdXQpO1xyXG5cdFx0XHJcblx0XHR2YXIgdGl0bGVTZWFyY2ggPSAkKG9yaWdpbmFsKS5maW5kKFwiW2lkPSduYW1lSW5wdXRfXCIgKyBtYXBfaWQgKyBcIiddXCIpO1xyXG5cdFx0aWYodGl0bGVTZWFyY2gubGVuZ3RoKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgcGxhY2Vob2xkZXIgPSB3cGdtYXBzX2xvY2FsaXplW21hcF9pZF0ub3RoZXJfc2V0dGluZ3Muc3RvcmVfbG9jYXRvcl9uYW1lX3N0cmluZztcclxuXHRcdFx0aWYocGxhY2Vob2xkZXIgJiYgcGxhY2Vob2xkZXIubGVuZ3RoKVxyXG5cdFx0XHRcdHRpdGxlU2VhcmNoLmF0dHIoXCJwbGFjZWhvbGRlclwiLCBwbGFjZWhvbGRlcik7XHJcblx0XHRcdGlubmVyLmFwcGVuZCh0aXRsZVNlYXJjaCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBidXR0b247XHJcblx0XHRpZihidXR0b24gPSAkKG9yaWdpbmFsKS5maW5kKFwiYnV0dG9uLndwZ216YS11c2UtbXktbG9jYXRpb25cIikpXHJcblx0XHRcdGlubmVyLmFwcGVuZChidXR0b24pO1xyXG5cdFx0XHJcblx0XHQkKGFkZHJlc3NJbnB1dCkub24oXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihldmVudC5rZXlDb2RlID09IDEzKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gTkI6IEhhY2t5IHdvcmthcm91bmRcclxuXHRcdFx0XHRzZWxmLnNlYXJjaEJ1dHRvbi50cmlnZ2VyKFwiY2xpY2tcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gTkI6IExlZ2FjeSBzdXBwb3J0XHJcblx0XHRcdFx0c2VhcmNoTG9jYXRpb25zKG1hcF9pZCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bWFwLnN0b3JlTG9jYXRvci5vblNlYXJjaChldmVudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0JChhZGRyZXNzSW5wdXQpLm9uKFwiaW5wdXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYuc2VhcmNoQnV0dG9uLnNob3coKTtcclxuXHRcdFx0c2VsZi5yZXNldEJ1dHRvbi5oaWRlKCk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGlubmVyLmFwcGVuZCgkKG9yaWdpbmFsKS5maW5kKFwic2VsZWN0LndwZ216YV9zbF9yYWRpdXNfc2VsZWN0XCIpKTtcclxuXHRcdC8vIGlubmVyLmFwcGVuZCgkKG9yaWdpbmFsKS5maW5kKFwiLndwZ216YV9maWx0ZXJfc2VsZWN0X1wiICsgbWFwX2lkKSk7XHJcblx0XHRcclxuXHRcdC8vIEJ1dHRvbnNcclxuXHRcdHRoaXMuc2VhcmNoQnV0dG9uID0gJChvcmlnaW5hbCkuZmluZCggXCIud3BnbXphX3NsX3NlYXJjaF9idXR0b24sIC53cGdtemFfc2xfc2VhcmNoX2J1dHRvbl9kaXZcIiApO1xyXG5cdFx0aW5uZXIuYXBwZW5kKHRoaXMuc2VhcmNoQnV0dG9uKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZXNldEJ1dHRvbiA9ICQob3JpZ2luYWwpLmZpbmQoIFwiLndwZ216YV9zbF9yZXNldF9idXR0b25fZGl2XCIgKTtcclxuXHRcdGlubmVyLmFwcGVuZCh0aGlzLnJlc2V0QnV0dG9uKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZXNldEJ1dHRvbi5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHJlc2V0TG9jYXRpb25zKG1hcF9pZCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZXNldEJ1dHRvbi5oaWRlKCk7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5zZWFyY2hCdXR0b24ub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdGlmKCQoXCJhZGRyZXNzSW5wdXRfXCIgKyBtYXBfaWQpLnZhbCgpID09IDApXHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c2VsZi5zZWFyY2hCdXR0b24uaGlkZSgpO1xyXG5cdFx0XHRcdHNlbGYucmVzZXRCdXR0b24uc2hvdygpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG1hcC5zdG9yZUxvY2F0b3Iuc3RhdGUgPSBXUEdNWkEuU3RvcmVMb2NhdG9yLlNUQVRFX0FQUExJRUQ7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLnJlc2V0QnV0dG9uLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHRzZWxmLnJlc2V0QnV0dG9uLmhpZGUoKTtcclxuXHRcdFx0XHRzZWxmLnNlYXJjaEJ1dHRvbi5zaG93KCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bWFwLnN0b3JlTG9jYXRvci5zdGF0ZSA9IFdQR01aQS5TdG9yZUxvY2F0b3IuU1RBVEVfSU5JVElBTDtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIERpc3RhbmNlIHR5cGVcclxuXHRcdGlubmVyLmFwcGVuZCgkKFwiI3dwZ216YV9kaXN0YW5jZV90eXBlX1wiICsgbWFwX2lkKSk7XHJcblx0XHRcclxuXHRcdC8vIENhdGVnb3JpZXNcclxuXHRcdHZhciBjb250YWluZXIgPSAkKG9yaWdpbmFsKS5maW5kKFwiLndwZ216YV9jYXRfY2hlY2tib3hfaG9sZGVyXCIpO1xyXG5cdFx0dmFyIHVsID0gJChjb250YWluZXIpLmNoaWxkcmVuKFwidWxcIik7XHJcblx0XHR2YXIgaXRlbXMgPSAkKGNvbnRhaW5lcikuZmluZChcImxpXCIpO1xyXG5cdFx0dmFyIG51bUNhdGVnb3JpZXMgPSAwO1xyXG5cdFx0XHJcblx0XHQvLyQoaXRlbXMpLmZpbmQoXCJ1bFwiKS5yZW1vdmUoKTtcclxuXHRcdC8vJCh1bCkuYXBwZW5kKGl0ZW1zKTtcclxuXHRcdFxyXG5cdFx0dmFyIGljb25zID0gW107XHJcblx0XHRcclxuXHRcdGl0ZW1zLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XHJcblx0XHRcdHZhciBpZCA9ICQoZWwpLmF0dHIoXCJjbGFzc1wiKS5tYXRjaCgvXFxkKy8pO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBjYXRlZ29yeV9pZCBpbiB3cGdtemFfY2F0ZWdvcnlfZGF0YSkge1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGlkID09IGNhdGVnb3J5X2lkKSB7XHJcblx0XHRcdFx0XHR2YXIgc3JjID0gd3BnbXphX2NhdGVnb3J5X2RhdGFbY2F0ZWdvcnlfaWRdLmltYWdlO1xyXG5cdFx0XHRcdFx0dmFyIGljb24gPSAkKCc8ZGl2IGNsYXNzPVwid3BnbXphLWNoaXAtaWNvblwiLz4nKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWNvbi5jc3Moe1xyXG5cdFx0XHRcdFx0XHRcImJhY2tncm91bmQtaW1hZ2VcIjogXCJ1cmwoJ1wiICsgc3JjICsgXCInKVwiLFxyXG5cdFx0XHRcdFx0XHRcIndpZHRoXCI6ICQoXCIjd3BnbXphX2NhdF9jaGVja2JveF9cIiArIGNhdGVnb3J5X2lkICsgXCIgKyBsYWJlbFwiKS5oZWlnaHQoKSArIFwicHhcIlxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRpY29ucy5wdXNoKGljb24pO1xyXG5cdFx0XHRcdFx0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoc3JjICE9IG51bGwgJiYgc3JjICE9IFwiXCIpe1xyXG5cdFx0XHRcdFx0ICAgLy8kKGVsKS5maW5kKFwibGFiZWxcIikucHJlcGVuZChpY29uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3dwZ216YV9jYXRfY2hlY2tib3hfXCIgKyBjYXRlZ29yeV9pZCArIFwiICsgbGFiZWxcIikucHJlcGVuZChpY29uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdG51bUNhdGVnb3JpZXMrKztcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcbiAgICAgICAgJCh0aGlzLmVsZW1lbnQpLmFwcGVuZChjb250YWluZXIpO1xyXG5cclxuXHRcdFxyXG5cdFx0aWYobnVtQ2F0ZWdvcmllcykge1xyXG5cdFx0XHR0aGlzLm9wdGlvbnNCdXR0b24gPSAkKCc8c3BhbiBjbGFzcz1cIndwZ216YV9zdG9yZV9sb2NhdG9yX29wdGlvbnNfYnV0dG9uXCI+PGkgY2xhc3M9XCJmYSBmYS1saXN0XCI+PC9pPjwvc3Bhbj4nKTtcclxuXHRcdFx0JCh0aGlzLnNlYXJjaEJ1dHRvbikuYmVmb3JlKHRoaXMub3B0aW9uc0J1dHRvbik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdFx0aWNvbnMuZm9yRWFjaChmdW5jdGlvbihpY29uKSB7XHJcblx0XHRcdFx0dmFyIGhlaWdodCA9ICQoaWNvbikuaGVpZ2h0KCk7XHJcblx0XHRcdFx0JChpY29uKS5jc3Moe1wid2lkdGhcIjogaGVpZ2h0ICsgXCJweFwifSk7XHJcblx0XHRcdFx0JChpY29uKS5jbG9zZXN0KFwibGFiZWxcIikuY3NzKHtcInBhZGRpbmctbGVmdFwiOiBoZWlnaHQgKyA4ICsgXCJweFwifSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0JChjb250YWluZXIpLmNzcyhcIndpZHRoXCIsICQoc2VsZi5lbGVtZW50KS5maW5kKFwiLndwZ216YS1pbm5lclwiKS5vdXRlcldpZHRoKCkgKyBcInB4XCIpO1xyXG5cdFx0XHRcclxuXHRcdH0sIDEwMDApO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuZmluZChcIi53cGdtemFfc3RvcmVfbG9jYXRvcl9vcHRpb25zX2J1dHRvblwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjb250YWluZXIuaGFzQ2xhc3MoXCJ3cGdtemEtb3BlblwiKSlcclxuXHRcdFx0XHRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJ3cGdtemEtb3BlblwiKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnRhaW5lci5hZGRDbGFzcyhcIndwZ216YS1vcGVuXCIpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQvLyBSZW1vdmUgb3JpZ2luYWwgZWxlbWVudFxyXG5cdFx0JChvcmlnaW5hbCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHRcdC8vIEV2ZW50IGxpc3RlbmVyc1xyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmZpbmQoXCJpbnB1dCwgc2VsZWN0XCIpLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQoaW5uZXIpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQodGhpcy5lbGVtZW50KS5maW5kKFwiaW5wdXQsIHNlbGVjdFwiKS5vbihcImJsdXJcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQoaW5uZXIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQodGhpcy5lbGVtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcImxpLndwZ216YV9jYXRfY2hlY2tib3hfaXRlbV9ob2xkZXJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbk1vdXNlT3ZlckNhdGVnb3J5KGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkub24oXCJtb3VzZWxlYXZlXCIsIFwibGkud3BnbXphX2NhdF9jaGVja2JveF9pdGVtX2hvbGRlclwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uTW91c2VMZWF2ZUNhdGVnb3J5KGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKG1hcC5tYXJrZXJGaWx0ZXIpLm9uKFwiZmlsdGVyaW5nY29tcGxldGVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHJcblx0XHRcdGlmKCF0aGlzLm1hcC5oYXNWaXNpYmxlTWFya2VycygpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYodGhpcy5tYXAuc2V0dGluZ3Muc3RvcmVfbG9jYXRvcl9ub3RfZm91bmRfbWVzc2FnZSAhPSAgV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLnplcm9fcmVzdWx0cyAmJiB0aGlzLm1hcC5zZXR0aW5ncy5zdG9yZV9sb2NhdG9yX25vdF9mb3VuZF9tZXNzYWdlICE9IFwiXCIpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0YWxlcnQodGhpcy5tYXAuc2V0dGluZ3Muc3RvcmVfbG9jYXRvcl9ub3RfZm91bmRfbWVzc2FnZSk7XHJcblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0YWxlcnQoV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLnplcm9fcmVzdWx0cyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cclxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLndwZ216YV9zdG9yZV9sb2NhdG9yX29wdGlvbnNfYnV0dG9uJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cclxuXHRcdFx0XHRpZiAoJCgnLndwZ216YV9jYXRfY2hlY2tib3hfaG9sZGVyJykuaGFzQ2xhc3MoJ3dwZ216YS1vcGVuJykpIHtcclxuXHJcblx0XHRcdFx0XHR2YXIgcF9jYXQgPSAkKCBcIi53cGdtemFfY2F0X2NoZWNrYm94X2hvbGRlclwiICk7XHJcblx0XHRcdFx0XHR2YXIgcG9zaXRpb25fY2F0ID0gcF9jYXQucG9zaXRpb24oKS50b3AgKyBwX2NhdC5vdXRlckhlaWdodCh0cnVlKSArICQoJy53cGdtemEtbW9kZXJuLXN0b3JlLWxvY2F0b3InKS5oZWlnaHQoKTtcclxuXHRcdFx0XHJcblx0XHRcdFx0XHR2YXIgJHBfbWFwID0gJCgnLndwZ216YV9tYXAnKTsgIFxyXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uX21hcCA9ICRwX21hcC5wb3NpdGlvbigpLnRvcCArICRwX21hcC5vdXRlckhlaWdodCh0cnVlKTsgXHJcblxyXG5cdFx0XHRcdFx0dmFyIGNhdF9oZWlnaHQgPSBwb3NpdGlvbl9jYXQ7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGNhdF9oZWlnaHQgPj0gcG9zaXRpb25fbWFwKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRcdFx0XHQkKCcud3BnbXphX2NhdF91bCcpLmNzcygnb3ZlcmZsb3cnLCAnc2Nyb2xsICcpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdCQoJy53cGdtemFfY2F0X3VsJykuY3NzKCdoZWlnaHQnLCAnMTAwJScpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHQkKCcud3BnbXphLW1vZGVybi1zdG9yZS1sb2NhdG9yJykuY3NzKCdoZWlnaHQnLCcxMDAlJyk7XHJcblx0XHRcdFx0XHRcdCQoJy53cGdtemFfY2F0X2NoZWNrYm94X2hvbGRlci53cGdtemEtb3BlbicpLmNzcyh7J3BhZGRpbmctYm90dG9tJzogJzUwcHgnLCAnaGVpZ2h0JzogJzEwMCUnfSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCA1MDApO1xyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgbW9kZXJuIHN0b3JlIGxvY2F0b3IsIDxzdHJvbmc+cGxlYXNlIDxlbT5hbHdheXM8L2VtPiB1c2UgdGhpcyBmdW5jdGlvbiByYXRoZXIgdGhhbiBjYWxsaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseTwvc3Ryb25nPi5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JcclxuXHQgKiBAcGFyYW0ge2ludH0gbWFwX2lkIFRoZSBJRCBvZiB0aGUgbWFwIHRoaXMgc3RvcmUgbG9jYXRvciBiZWxvbmdzIHRvXHJcblx0ICogQHJldHVybiB7V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvcn0gQW4gaW5zdGFuY2Ugb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3IuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihtYXBfaWQpXHJcblx0e1xyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdHJldHVybiBuZXcgV1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yKG1hcF9pZCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFxyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdHJldHVybiBuZXcgV1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvcihtYXBfaWQpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyBUT0RPOiBNb3ZlIHRoZXNlIHRvIGEgUHJvIG1vZHVsZVxyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uTW91c2VPdmVyQ2F0ZWdvcnkgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR2YXIgbGkgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xyXG5cdFx0XHJcblx0XHQkKGxpKS5jaGlsZHJlbihcInVsLndwZ216YV9jYXRfY2hlY2tib3hfaXRlbV9ob2xkZXJcIikuc3RvcCh0cnVlLCBmYWxzZSkuZmFkZUluKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uTW91c2VMZWF2ZUNhdGVnb3J5ID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIGxpID0gZXZlbnQuY3VycmVudFRhcmdldDtcclxuXHRcdFxyXG5cdFx0JChsaSkuY2hpbGRyZW4oXCJ1bC53cGdtemFfY2F0X2NoZWNrYm94X2l0ZW1faG9sZGVyXCIpLnN0b3AodHJ1ZSwgZmFsc2UpLmZhZGVPdXQoKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibW9kZXJuLXN0b3JlLWxvY2F0b3IuanMifQ==


// js/v8/native-maps-icon.js
/**
 * @namespace WPGMZA
 * @module NativeMapsAppIcon
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJuYXRpdmUtbWFwcy1pY29uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIE5hdGl2ZU1hcHNBcHBJY29uXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBTbWFsbCB1dGlsaXR5IGNsYXNzIHRvIGNyZWF0ZSBhbiBpY29uIGZvciB0aGUgbmF0aXZlIG1hcHMgYXBwLCBhbiBBcHBsZSBpY29uIG9uIGlPUyBkZXZpY2VzLCBhIEdvb2dsZSBpY29uIG9uIG90aGVyIGRldmljZXNcclxuXHQgKiBAbWV0aG9kIFdQR01aQS5OYXRpdmVNYXBzQXBwSWNvblxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTmF0aXZlTWFwc0FwcEljb25cclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICovXHJcblx0V1BHTVpBLk5hdGl2ZU1hcHNBcHBJY29uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpZihuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9eQXBwbGV8aVBob25lfGlQYWR8aVBvZC8pKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnR5cGUgPSBcImFwcGxlXCI7XHJcblx0XHRcdHRoaXMuZWxlbWVudCA9ICQoJzxzcGFuPjxpIGNsYXNzPVwiZmFiIGZhIGZhLWFwcGxlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvc3Bhbj4nKTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50eXBlID0gXCJnb29nbGVcIjtcclxuXHRcdFx0dGhpcy5lbGVtZW50ID0gJCgnPHNwYW4+PGkgY2xhc3M9XCJmYWIgZmEgZmEtZ29vZ2xlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvc3Bhbj4nKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6Im5hdGl2ZS1tYXBzLWljb24uanMifQ==


// js/v8/polyfills.js
/**
 * @namespace WPGMZA
 * @module Polyfills
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb2x5ZmlsbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgUG9seWZpbGxzXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHJcblx0Ly8gSUUxMSBwb2x5ZmlsbCBmb3Igc2xpY2Ugbm90IGJlaW5nIGltcGxlbWVudGVkIG9uIFVpbnQ4QXJyYXkgKHVzZWQgYnkgdGV4dC5qcylcclxuXHRpZiAoIVVpbnQ4QXJyYXkucHJvdG90eXBlLnNsaWNlKSB7XHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoVWludDhBcnJheS5wcm90b3R5cGUsICdzbGljZScsIHtcclxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIChiZWdpbiwgZW5kKSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBVaW50OEFycmF5KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMsIGJlZ2luLCBlbmQpKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8vIFNhZmFyaSBwb2x5ZmlsbCBmb3IgRW5mb2xkIHRoZW1lcyBUeXBlRXJyb3I6ICd1bmRlZmluZWQnIGlzIG5vdCBhIHZhbGlkIGFyZ3VtZW50IGZvciAnaW4nXHJcblx0aWYoV1BHTVpBLmlzU2FmYXJpKCkgJiYgIXdpbmRvdy5leHRlcm5hbClcclxuXHRcdHdpbmRvdy5leHRlcm5hbCA9IHt9O1xyXG5cclxufSk7Il0sImZpbGUiOiJwb2x5ZmlsbHMuanMifQ==


// js/v8/polygon.js
/**
 * @namespace WPGMZA
 * @module Polygon
 * @requires WPGMZA.MapObject
 * @gulp-requires map-object.js
 */
jQuery(function($) {
	
	/**
	 * Base class for polygons. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polygon
	 * @constructor WPGMZA.Polygon
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Polygon = function(row, enginePolygon)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polygon");
		
		this.paths = null;
		this.title = null;
		this.name = null;
		this.link = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polygon.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polygon.prototype.constructor = WPGMZA.Polygon;
	
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
	
	/**
	 * Returns a JSON representation of this polygon, for serialization
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @returns {object} A JSON object representing this polygon
	 */
	WPGMZA.Polygon.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		$.extend(result, {
			name:		this.name,
			title:		this.title,
			link:		this.link,
		});
	
		return result;
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb2x5Z29uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFBvbHlnb25cclxuICogQHJlcXVpcmVzIFdQR01aQS5NYXBPYmplY3RcclxuICogQGd1bHAtcmVxdWlyZXMgbWFwLW9iamVjdC5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBCYXNlIGNsYXNzIGZvciBwb2x5Z29ucy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLlBvbHlnb25cclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLlBvbHlnb25cclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIE9wdGlvbnMgdG8gYXBwbHkgdG8gdGhpcyBwb2x5Z29uLlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbZW5naW5lUG9seWdvbl0gQW4gZW5naW5lIHBvbHlnb24sIHBhc3NlZCBmcm9tIHRoZSBkcmF3aW5nIG1hbmFnZXIuIFVzZWQgd2hlbiBhIHBvbHlnb24gaGFzIGJlZW4gY3JlYXRlZCBieSBhIGRyYXdpbmcgbWFuYWdlci5cclxuXHQgKiBAYXVnbWVudHMgV1BHTVpBLk1hcE9iamVjdFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Qb2x5Z29uID0gZnVuY3Rpb24ocm93LCBlbmdpbmVQb2x5Z29uKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0V1BHTVpBLmFzc2VydEluc3RhbmNlT2YodGhpcywgXCJQb2x5Z29uXCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnBhdGhzID0gbnVsbDtcclxuXHRcdHRoaXMudGl0bGUgPSBudWxsO1xyXG5cdFx0dGhpcy5uYW1lID0gbnVsbDtcclxuXHRcdHRoaXMubGluayA9IG51bGw7XHJcblx0XHRcclxuXHRcdFdQR01aQS5NYXBPYmplY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlBvbHlnb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTWFwT2JqZWN0LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLlBvbHlnb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLlBvbHlnb247XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgY29udHJ1Y3RvciB0byBiZSB1c2VkIGJ5IGNyZWF0ZUluc3RhbmNlLCBkZXBlbmRpbmcgb24gdGhlIHNlbGVjdGVkIG1hcHMgZW5naW5lLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLlBvbHlnb25cclxuXHQgKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIGFwcHJvcHJpYXRlIGNvbnRydWN0b3JcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9seWdvbi5nZXRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRzd2l0Y2goV1BHTVpBLnNldHRpbmdzLmVuZ2luZSlcclxuXHRcdHtcclxuXHRcdFx0Y2FzZSBcIm9wZW4tbGF5ZXJzXCI6XHJcblx0XHRcdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTFByb1BvbHlnb247XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTFBvbHlnb247XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFxyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFx0XHRcdHJldHVybiBXUEdNWkEuR29vZ2xlUHJvUG9seWdvbjtcclxuXHRcdFx0XHRyZXR1cm4gV1BHTVpBLkdvb2dsZVBvbHlnb247XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBtYXAsIDxzdHJvbmc+cGxlYXNlIDxlbT5hbHdheXM8L2VtPiB1c2UgdGhpcyBmdW5jdGlvbiByYXRoZXIgdGhhbiBjYWxsaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseTwvc3Ryb25nPi5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Qb2x5Z29uXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIE9wdGlvbnMgdG8gYXBwbHkgdG8gdGhpcyBwb2x5Z29uLlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbZW5naW5lUG9seWdvbl0gQW4gZW5naW5lIHBvbHlnb24sIHBhc3NlZCBmcm9tIHRoZSBkcmF3aW5nIG1hbmFnZXIuIFVzZWQgd2hlbiBhIHBvbHlnb24gaGFzIGJlZW4gY3JlYXRlZCBieSBhIGRyYXdpbmcgbWFuYWdlci5cclxuXHQgKiBAcmV0dXJucyB7V1BHTVpBLlBvbHlnb259IEFuIGluc3RhbmNlIG9mIFdQR01aQS5Qb2x5Z29uXHJcblx0ICovXHJcblx0V1BHTVpBLlBvbHlnb24uY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihyb3csIGVuZ2luZU9iamVjdClcclxuXHR7XHJcblx0XHR2YXIgY29uc3RydWN0b3IgPSBXUEdNWkEuUG9seWdvbi5nZXRDb25zdHJ1Y3RvcigpO1xyXG5cdFx0cmV0dXJuIG5ldyBjb25zdHJ1Y3Rvcihyb3csIGVuZ2luZU9iamVjdCk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgcG9seWdvbiwgZm9yIHNlcmlhbGl6YXRpb25cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Qb2x5Z29uXHJcblx0ICogQHJldHVybnMge29iamVjdH0gQSBKU09OIG9iamVjdCByZXByZXNlbnRpbmcgdGhpcyBwb2x5Z29uXHJcblx0ICovXHJcblx0V1BHTVpBLlBvbHlnb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gV1BHTVpBLk1hcE9iamVjdC5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdCQuZXh0ZW5kKHJlc3VsdCwge1xyXG5cdFx0XHRuYW1lOlx0XHR0aGlzLm5hbWUsXHJcblx0XHRcdHRpdGxlOlx0XHR0aGlzLnRpdGxlLFxyXG5cdFx0XHRsaW5rOlx0XHR0aGlzLmxpbmssXHJcblx0XHR9KTtcclxuXHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6InBvbHlnb24uanMifQ==


// js/v8/polyline.js
/**
 * @namespace WPGMZA
 * @module Polyline
 * @requires WPGMZA.MapObject
 * @gulp-requires map-object.js
 */
jQuery(function($) {
	
	/**
	 * Base class for polylines. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polyline
	 * @constructor WPGMZA.Polyline
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polyline");
		
		this.title = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;
	
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
	 * @param {object} [row] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @returns {WPGMZA.Polyline} An instance of WPGMZA.Polyline
	 */
	WPGMZA.Polyline.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polyline.getConstructor();
		return new constructor(row, engineObject);
	}
	
	/**
	 * Gets the points on this polylines
	 * @return {array} An array of LatLng literals
	 */
	WPGMZA.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}
	
	/**
	 * Returns a JSON representation of this polyline, for serialization
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @returns {object} A JSON object representing this polyline
	 */
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}
	
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb2x5bGluZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBQb2x5bGluZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1hcE9iamVjdFxyXG4gKiBAZ3VscC1yZXF1aXJlcyBtYXAtb2JqZWN0LmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEJhc2UgY2xhc3MgZm9yIHBvbHlsaW5lcy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLlBvbHlsaW5lXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5Qb2x5bGluZVxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gW3Jvd10gT3B0aW9ucyB0byBhcHBseSB0byB0aGlzIHBvbHlsaW5lLlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbZW5naW5lUG9seWxpbmVdIEFuIGVuZ2luZSBwb2x5bGluZSwgcGFzc2VkIGZyb20gdGhlIGRyYXdpbmcgbWFuYWdlci4gVXNlZCB3aGVuIGEgcG9seWxpbmUgaGFzIGJlZW4gY3JlYXRlZCBieSBhIGRyYXdpbmcgbWFuYWdlci5cclxuXHQgKiBAYXVnbWVudHMgV1BHTVpBLk1hcE9iamVjdFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Qb2x5bGluZSA9IGZ1bmN0aW9uKHJvdywgZ29vZ2xlUG9seWxpbmUpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuYXNzZXJ0SW5zdGFuY2VPZih0aGlzLCBcIlBvbHlsaW5lXCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnRpdGxlID0gbnVsbDtcclxuXHRcdFxyXG5cdFx0V1BHTVpBLk1hcE9iamVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuUG9seWxpbmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTWFwT2JqZWN0LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLlBvbHlsaW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5Qb2x5bGluZTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBjb250cnVjdG9yIHRvIGJlIHVzZWQgYnkgY3JlYXRlSW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgc2VsZWN0ZWQgbWFwcyBlbmdpbmUuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuUG9seWxpbmVcclxuXHQgKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIGFwcHJvcHJpYXRlIGNvbnRydWN0b3JcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9seWxpbmUuZ2V0Q29uc3RydWN0b3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdHJldHVybiBXUEdNWkEuT0xQb2x5bGluZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5Hb29nbGVQb2x5bGluZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIG1hcCwgPHN0cm9uZz5wbGVhc2UgPGVtPmFsd2F5czwvZW0+IHVzZSB0aGlzIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGNhbGxpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5PC9zdHJvbmc+LlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLlBvbHlsaW5lXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIE9wdGlvbnMgdG8gYXBwbHkgdG8gdGhpcyBwb2x5bGluZS5cclxuXHQgKiBAcGFyYW0ge29iamVjdH0gW2VuZ2luZVBvbHlsaW5lXSBBbiBlbmdpbmUgcG9seWxpbmUsIHBhc3NlZCBmcm9tIHRoZSBkcmF3aW5nIG1hbmFnZXIuIFVzZWQgd2hlbiBhIHBvbHlsaW5lIGhhcyBiZWVuIGNyZWF0ZWQgYnkgYSBkcmF3aW5nIG1hbmFnZXIuXHJcblx0ICogQHJldHVybnMge1dQR01aQS5Qb2x5bGluZX0gQW4gaW5zdGFuY2Ugb2YgV1BHTVpBLlBvbHlsaW5lXHJcblx0ICovXHJcblx0V1BHTVpBLlBvbHlsaW5lLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24ocm93LCBlbmdpbmVPYmplY3QpXHJcblx0e1xyXG5cdFx0dmFyIGNvbnN0cnVjdG9yID0gV1BHTVpBLlBvbHlsaW5lLmdldENvbnN0cnVjdG9yKCk7XHJcblx0XHRyZXR1cm4gbmV3IGNvbnN0cnVjdG9yKHJvdywgZW5naW5lT2JqZWN0KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgcG9pbnRzIG9uIHRoaXMgcG9seWxpbmVzXHJcblx0ICogQHJldHVybiB7YXJyYXl9IEFuIGFycmF5IG9mIExhdExuZyBsaXRlcmFsc1xyXG5cdCAqL1xyXG5cdFdQR01aQS5Qb2x5bGluZS5wcm90b3R5cGUuZ2V0UG9pbnRzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLnRvSlNPTigpLnBvaW50cztcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhpcyBwb2x5bGluZSwgZm9yIHNlcmlhbGl6YXRpb25cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Qb2x5bGluZVxyXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IEEgSlNPTiBvYmplY3QgcmVwcmVzZW50aW5nIHRoaXMgcG9seWxpbmVcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9seWxpbmUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gV1BHTVpBLk1hcE9iamVjdC5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHJlc3VsdC50aXRsZSA9IHRoaXMudGl0bGU7XHJcblx0XHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG59KTsiXSwiZmlsZSI6InBvbHlsaW5lLmpzIn0=


// js/v8/popout-panel.js
/**
 * @namespace WPGMZA
 * @module PopoutPanel
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb3BvdXQtcGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgUG9wb3V0UGFuZWxcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciBwb3BvdXQgcGFuZWxzLCB3aGljaCBpcyB0aGUgZGlyZWN0aW9ucyBib3gsIGRpcmVjdGlvbnMgcmVzdWx0IGJveCwgYW5kIHRoZSBtb2Rlcm4gc3R5bGUgbWFya2VyIGxpc3RpbmdcclxuXHQgKiBAY2xhc3MgV1BHTVpBLlBvcG91dFBhbmVsXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5Qb3BvdXRQYW5lbFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9wb3V0UGFuZWwgPSBmdW5jdGlvbihlbGVtZW50KVxyXG5cdHtcclxuXHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE9wZW5zIHRoZSBkaXJlY3Rpb24gYm94XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuUG9wb3V0UGFuZWxcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9wb3V0UGFuZWwucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50KS5hZGRDbGFzcyhcIndwZ216YS1vcGVuXCIpO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ2xvc2VzIHRoZSBkaXJlY3Rpb24gYm94XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuUG9wb3V0UGFuZWxcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9wb3V0UGFuZWwucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJ3cGdtemEtb3BlblwiKTtcclxuXHR9O1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6InBvcG91dC1wYW5lbC5qcyJ9


// js/v8/rest-api.js
/**
 * @namespace WPGMZA
 * @module WPGMZA.RestAPI
 * @requires WPGMZA
 * @gulp-requires core.js
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
		
		if("route" in params.data)
			throw new Error("Cannot send route through this method");
		
		if("action" in params.data)
			throw new Error("Cannot send action through this method");
		
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
			if(context == WPGMZA.RestAPI.CONTEXT_REST)
				xhr.setRequestHeader('X-WP-Nonce', WPGMZA.restnonce);
			
			if(params && params.method && !params.method.match(/^GET$/i))
				xhr.setRequestHeader('X-WPGMZA-Action-Nonce', self.getNonce(route));
		};
		
		if(!params.beforeSend)
			params.beforeSend = setRESTNonce;
		else
		{
			var base = params.beforeSend;
			
			params.beforeSend = function(xhr) {
				base(xhr);
				setRESTNonce(xhr);
			}
		}
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
						// Report back to the server. This is usually due to a security plugin blocking REST requests for non-authenticated users
						$.post(WPGMZA.ajaxurl, {
							action: "wpgmza_report_rest_api_blocked"
						}, function(response) {});
						
						console.warn("The REST API was blocked. This is usually due to security plugins blocking REST requests for non-authenticated users.");
						
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXN0LWFwaS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBXUEdNWkEuUmVzdEFQSVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVXNlZCB0byBpbnRlcmFjdCB3aXRoIHRoZSBXb3JkUHJlc3MgUkVTVCBBUEkuIDxzdHJvbmc+UGxlYXNlIDxlbT5kbyBub3Q8L2VtPiBjYWxsIHRoaXMgY29uc3RydWN0b3IgZGlyZWN0bHkuIEFsd2F5cyB1c2UgY3JlYXRlSW5zdGFuY2UgcmF0aGVyIHRoYW4gaW5zdGFudGlhdGluZyB0aGlzIGNsYXNzIGRpcmVjdGx5Ljwvc3Ryb25nPiBVc2luZyBjcmVhdGVJbnN0YW5jZSBhbGxvd3MgdGhpcyBjbGFzcyB0byBiZSBleHRlcm5hbGx5IGV4dGVuc2libGUuXHJcblx0ICogQGNsYXNzIFdQR01aQS5SZXN0QVBJXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5SZXN0QVBJXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqL1xyXG5cdFdQR01aQS5SZXN0QVBJID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdFdQR01aQS5SZXN0QVBJLlVSTCA9IFdQR01aQS5yZXN0dXJsO1xyXG5cdFx0XHJcblx0XHR0aGlzLnVzZUFKQVhGYWxsYmFjayA9IGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuUmVzdEFQSS5DT05URVhUX1JFU1RcdFx0PSBcIlJFU1RcIjtcclxuXHRXUEdNWkEuUmVzdEFQSS5DT05URVhUX0FKQVhcdFx0PSBcIkFKQVhcIjtcclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgUmVzdEFQSSwgPHN0cm9uZz5wbGVhc2UgPGVtPmFsd2F5czwvZW0+IHVzZSB0aGlzIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGNhbGxpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5PC9zdHJvbmc+LlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLlJlc3RBUElcclxuXHQgKi9cclxuXHRXUEdNWkEuUmVzdEFQSS5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uKCkgXHJcblx0e1xyXG5cdFx0cmV0dXJuIG5ldyBXUEdNWkEuUmVzdEFQSSgpO1xyXG5cdH1cclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlJlc3RBUEkucHJvdG90eXBlLCBcImlzQ29tcHJlc3NlZFBhdGhWYXJpYWJsZVN1cHBvcnRlZFwiLCB7XHJcblx0XHRcclxuXHRcdGdldDogZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gV1BHTVpBLnNlcnZlckNhbkluZmxhdGUgJiYgXCJVaW50OEFycmF5XCIgaW4gd2luZG93ICYmIFwiVGV4dEVuY29kZXJcIiBpbiB3aW5kb3c7XHJcblx0XHR9XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlJlc3RBUEkucHJvdG90eXBlLCBcImlzQ29tcHJlc3NlZFBhdGhWYXJpYWJsZUFsbG93ZWRcIiwge1xyXG5cdFx0XHJcblx0XHRnZXQ6IGZ1bmN0aW9uKClcclxuXHRcdHtcclxuXHRcdFx0Ly8gTkI6IFBybyA3IHN0aWxsIGhhcyBhIFwiZGlzYWJsZVwiIHNldHRpbmcuIFNvIHVzZSB0aGF0IGlmIFBybyA3IGlzIGluc3RhbGxlZC5cclxuXHRcdFx0aWYoIVdQR01aQS5wcm9fdmVyc2lvbiB8fCBXUEdNWkEuVmVyc2lvbi5jb21wYXJlKFdQR01aQS5wcm9fdmVyc2lvbiwgXCI4LjAuMFwiKSA+PSBXUEdNWkEuVmVyc2lvbi5FUVVBTF9UTylcclxuXHRcdFx0XHRyZXR1cm4gIVdQR01aQS5zZXR0aW5ncy5kaXNhYmxlX2NvbXByZXNzZWRfcGF0aF92YXJpYWJsZXM7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBSdW5uaW5nIFBybyA3IG9yIGJlbG93XHJcblx0XHRcdHJldHVybiBXUEdNWkEuc2V0dGluZ3MuZW5hYmxlX2NvbXByZXNzZWRfcGF0aF92YXJpYWJsZXM7XHJcblx0XHR9XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlJlc3RBUEkucHJvdG90eXBlLCBcIm1heFVSTExlbmd0aFwiLCB7XHJcblx0XHRcclxuXHRcdGdldDogZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gMjA4MztcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdFdQR01aQS5SZXN0QVBJLnByb3RvdHlwZS5jb21wcmVzc1BhcmFtcyA9IGZ1bmN0aW9uKHBhcmFtcylcclxuXHR7XHJcblx0XHR2YXIgc3VmZml4ID0gXCJcIjtcclxuXHRcdFxyXG5cdFx0aWYocGFyYW1zLm1hcmtlcklEcylcclxuXHRcdHtcclxuXHRcdFx0dmFyIG1hcmtlcklEc1x0PSBwYXJhbXMubWFya2VySURzLnNwbGl0KFwiLFwiKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKG1hcmtlcklEcy5sZW5ndGggPiAxKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gTkI6IE9ubHkgdXNlIEVsaWFzIEZhbm8gZW5jb2RpbmcgaWYgbW9yZSB0aGFuIG9uZSBtYXJrZXIgaXMgcHJlc2VudC4gVGhlIHNlcnZlciBzaWRlIGRlY29kZXIgZG9lcyBub3QgY29ycmVjdGx5IGRlY29kZSBhIHNpbmdsZSBkaWdpdC5cclxuXHRcdFx0XHR2YXIgZW5jb2Rlclx0XHQ9IG5ldyBXUEdNWkEuRWxpYXNGYW5vKCk7XHJcblx0XHRcdFx0dmFyIGVuY29kZWRcdFx0PSBlbmNvZGVyLmVuY29kZShtYXJrZXJJRHMpO1xyXG5cdFx0XHRcdHZhciBjb21wcmVzc2VkXHQ9IHBha28uZGVmbGF0ZShlbmNvZGVkKTtcclxuXHRcdFx0XHR2YXIgc3RyaW5nXHRcdD0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGNvbXByZXNzZWQsIGZ1bmN0aW9uKGNoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjaCk7XHJcblx0XHRcdFx0fSkuam9pbihcIlwiKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBOQjogQXBwZW5kIGFzIGFub3RoZXIgcGF0aCBjb21wb25lbnQsIHRoaXMgc3RvcHMgdGhlIGNvZGUgYmVsb3cgcGVyZm9ybWluZyBiYXNlNjQgZW5jb2RpbmcgdHdpY2UgYW5kIGVubGFyZ2luZyB0aGUgcmVxdWVzdFxyXG5cdFx0XHRcdHN1ZmZpeCA9IFwiL1wiICsgYnRvYShzdHJpbmcpLnJlcGxhY2UoL1xcLy9nLCBcIi1cIikucmVwbGFjZSgvPSskLywgXCJcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gTkI6IG1pZGNicCA9IE1hcmtlciBJRCBjb21wcmVzc2VkIGJ1ZmZlciBwb2ludGVyLCBhYmJyZXZpYXRlZCB0byBzYXZlIHNwYWNlXHJcblx0XHRcdFx0cGFyYW1zLm1pZGNicCA9IGVuY29kZWQucG9pbnRlcjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRkZWxldGUgcGFyYW1zLm1hcmtlcklEcztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgc3RyaW5nXHRcdD0gSlNPTi5zdHJpbmdpZnkocGFyYW1zKTtcclxuXHRcdHZhciBlbmNvZGVyXHRcdD0gbmV3IFRleHRFbmNvZGVyKCk7XHJcblx0XHR2YXIgaW5wdXRcdFx0PSBlbmNvZGVyLmVuY29kZShzdHJpbmcpO1xyXG5cdFx0dmFyIGNvbXByZXNzZWRcdD0gcGFrby5kZWZsYXRlKGlucHV0KTtcclxuXHRcdHZhciByYXdcdFx0XHQ9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChjb21wcmVzc2VkLCBmdW5jdGlvbihjaCkge1xyXG5cdFx0XHRyZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjaCk7XHJcblx0XHR9KS5qb2luKFwiXCIpO1xyXG5cdFx0XHJcblx0XHR2YXIgYmFzZTY0XHRcdD0gYnRvYShyYXcpO1xyXG5cdFx0cmV0dXJuIGJhc2U2NC5yZXBsYWNlKC9cXC8vZywgXCItXCIpLnJlcGxhY2UoLz0rJC8sIFwiXCIpICsgc3VmZml4O1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBzZW5kQUpBWEZhbGxiYWNrUmVxdWVzdChyb3V0ZSwgcGFyYW1zKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSAkLmV4dGVuZCh7fSwgcGFyYW1zKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBhcmFtcy5kYXRhKVxyXG5cdFx0XHRwYXJhbXMuZGF0YSA9IHt9O1xyXG5cdFx0XHJcblx0XHRpZihcInJvdXRlXCIgaW4gcGFyYW1zLmRhdGEpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzZW5kIHJvdXRlIHRocm91Z2ggdGhpcyBtZXRob2RcIik7XHJcblx0XHRcclxuXHRcdGlmKFwiYWN0aW9uXCIgaW4gcGFyYW1zLmRhdGEpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzZW5kIGFjdGlvbiB0aHJvdWdoIHRoaXMgbWV0aG9kXCIpO1xyXG5cdFx0XHJcblx0XHRwYXJhbXMuZGF0YS5yb3V0ZSA9IHJvdXRlO1xyXG5cdFx0cGFyYW1zLmRhdGEuYWN0aW9uID0gXCJ3cGdtemFfcmVzdF9hcGlfcmVxdWVzdFwiO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEucmVzdEFQSS5hZGROb25jZShyb3V0ZSwgcGFyYW1zLCBXUEdNWkEuUmVzdEFQSS5DT05URVhUX0FKQVgpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gJC5hamF4KFdQR01aQS5hamF4dXJsLCBwYXJhbXMpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuUmVzdEFQSS5wcm90b3R5cGUuZ2V0Tm9uY2UgPSBmdW5jdGlvbihyb3V0ZSlcclxuXHR7XHJcblx0XHR2YXIgbWF0Y2hlcyA9IFtdO1xyXG5cdFx0XHJcblx0XHRmb3IodmFyIHBhdHRlcm4gaW4gV1BHTVpBLnJlc3Rub25jZXRhYmxlKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgcmVnZXggPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYocm91dGUubWF0Y2gocmVnZXgpKVxyXG5cdFx0XHRcdG1hdGNoZXMucHVzaCh7XHJcblx0XHRcdFx0XHRwYXR0ZXJuOiBwYXR0ZXJuLFxyXG5cdFx0XHRcdFx0bm9uY2U6IFdQR01aQS5yZXN0bm9uY2V0YWJsZVtwYXR0ZXJuXSxcclxuXHRcdFx0XHRcdGxlbmd0aDogcGF0dGVybi5sZW5ndGhcclxuXHRcdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIW1hdGNoZXMubGVuZ3RoKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBub25jZSBmb3VuZCBmb3Igcm91dGVcIik7XHJcblx0XHRcclxuXHRcdG1hdGNoZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcblx0XHRcdHJldHVybiBiLmxlbmd0aCAtIGEubGVuZ3RoO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHJldHVybiBtYXRjaGVzWzBdLm5vbmNlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuUmVzdEFQSS5wcm90b3R5cGUuYWRkTm9uY2UgPSBmdW5jdGlvbihyb3V0ZSwgcGFyYW1zLCBjb250ZXh0KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dmFyIHNldFJFU1ROb25jZSA9IGZ1bmN0aW9uKHhocikge1xyXG5cdFx0XHRpZihjb250ZXh0ID09IFdQR01aQS5SZXN0QVBJLkNPTlRFWFRfUkVTVClcclxuXHRcdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1XUC1Ob25jZScsIFdQR01aQS5yZXN0bm9uY2UpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYocGFyYW1zICYmIHBhcmFtcy5tZXRob2QgJiYgIXBhcmFtcy5tZXRob2QubWF0Y2goL15HRVQkL2kpKVxyXG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVdQR01aQS1BY3Rpb24tTm9uY2UnLCBzZWxmLmdldE5vbmNlKHJvdXRlKSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRpZighcGFyYW1zLmJlZm9yZVNlbmQpXHJcblx0XHRcdHBhcmFtcy5iZWZvcmVTZW5kID0gc2V0UkVTVE5vbmNlO1xyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYmFzZSA9IHBhcmFtcy5iZWZvcmVTZW5kO1xyXG5cdFx0XHRcclxuXHRcdFx0cGFyYW1zLmJlZm9yZVNlbmQgPSBmdW5jdGlvbih4aHIpIHtcclxuXHRcdFx0XHRiYXNlKHhocik7XHJcblx0XHRcdFx0c2V0UkVTVE5vbmNlKHhocik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogTWFrZXMgYW4gQUpBWCB0byB0aGUgUkVTVCBBUEksIHRoaXMgZnVuY3Rpb24gaXMgYSB3cmFwcGVyIGZvciAkLmFqYXhcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5SZXN0QVBJXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHJvdXRlIFRoZSBSRVNUIEFQSSByb3V0ZVxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgVGhlIHJlcXVlc3QgcGFyYW1ldGVycywgc2VlIGh0dHA6Ly9hcGkuanF1ZXJ5LmNvbS9qcXVlcnkuYWpheC9cclxuXHQgKi9cclxuXHRXUEdNWkEuUmVzdEFQSS5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uKHJvdXRlLCBwYXJhbXMpXHJcblx0e1xyXG5cdFx0aWYodGhpcy51c2VBSkFYRmFsbGJhY2spXHJcblx0XHRcdHJldHVybiBzZW5kQUpBWEZhbGxiYWNrUmVxdWVzdChyb3V0ZSwgcGFyYW1zKTtcclxuXHRcdFxyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0dmFyIGF0dGVtcHRlZENvbXByZXNzZWRQYXRoVmFyaWFibGUgPSBmYWxzZTtcclxuXHRcdHZhciBmYWxsYmFja1JvdXRlID0gcm91dGU7XHJcblx0XHR2YXIgZmFsbGJhY2tQYXJhbXMgPSAkLmV4dGVuZCh7fSwgcGFyYW1zKTtcclxuXHRcdFxyXG5cdFx0aWYodHlwZW9mIHJvdXRlICE9IFwic3RyaW5nXCIgfHwgKCFyb3V0ZS5tYXRjaCgvXlxcLy8pICYmICFyb3V0ZS5tYXRjaCgvXmh0dHAvKSkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcm91dGVcIik7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5SZXN0QVBJLlVSTC5tYXRjaCgvXFwvJC8pKVxyXG5cdFx0XHRyb3V0ZSA9IHJvdXRlLnJlcGxhY2UoL15cXC8vLCBcIlwiKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBhcmFtcylcclxuXHRcdFx0cGFyYW1zID0ge307XHJcblx0XHRcclxuXHRcdHRoaXMuYWRkTm9uY2Uocm91dGUsIHBhcmFtcywgV1BHTVpBLlJlc3RBUEkuQ09OVEVYVF9SRVNUKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBhcmFtcy5lcnJvcilcclxuXHRcdFx0cGFyYW1zLmVycm9yID0gZnVuY3Rpb24oeGhyLCBzdGF0dXMsIG1lc3NhZ2UpIHtcclxuXHRcdFx0XHRpZihzdGF0dXMgPT0gXCJhYm9ydFwiKVxyXG5cdFx0XHRcdFx0cmV0dXJuO1x0Ly8gRG9uJ3QgcmVwb3J0IGFib3J0LCBsZXQgaXQgaGFwcGVuIHNpbGVudGx5XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c3dpdGNoKHhoci5zdGF0dXMpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y2FzZSA0MDE6XHJcblx0XHRcdFx0XHRjYXNlIDQwMzpcclxuXHRcdFx0XHRcdFx0Ly8gUmVwb3J0IGJhY2sgdG8gdGhlIHNlcnZlci4gVGhpcyBpcyB1c3VhbGx5IGR1ZSB0byBhIHNlY3VyaXR5IHBsdWdpbiBibG9ja2luZyBSRVNUIHJlcXVlc3RzIGZvciBub24tYXV0aGVudGljYXRlZCB1c2Vyc1xyXG5cdFx0XHRcdFx0XHQkLnBvc3QoV1BHTVpBLmFqYXh1cmwsIHtcclxuXHRcdFx0XHRcdFx0XHRhY3Rpb246IFwid3BnbXphX3JlcG9ydF9yZXN0X2FwaV9ibG9ja2VkXCJcclxuXHRcdFx0XHRcdFx0fSwgZnVuY3Rpb24ocmVzcG9uc2UpIHt9KTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihcIlRoZSBSRVNUIEFQSSB3YXMgYmxvY2tlZC4gVGhpcyBpcyB1c3VhbGx5IGR1ZSB0byBzZWN1cml0eSBwbHVnaW5zIGJsb2NraW5nIFJFU1QgcmVxdWVzdHMgZm9yIG5vbi1hdXRoZW50aWNhdGVkIHVzZXJzLlwiKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMudXNlQUpBWEZhbGxiYWNrID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHJldHVybiBzZW5kQUpBWEZhbGxiYWNrUmVxdWVzdChmYWxsYmFja1JvdXRlLCBmYWxsYmFja1BhcmFtcyk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRjYXNlIDQxNDpcclxuXHRcdFx0XHRcdFx0aWYoIWF0dGVtcHRlZENvbXByZXNzZWRQYXRoVmFyaWFibGUpXHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Ly8gRmFsbGJhY2sgZm9yIEhUVFAgNDE0IC0gUmVxdWVzdCB0b28gbG9uZyB3aXRoIGNvbXByZXNzZWQgcmVxdWVzdHNcclxuXHRcdFx0XHRcdFx0ZmFsbGJhY2tQYXJhbXMubWV0aG9kID0gXCJQT1NUXCI7XHJcblx0XHRcdFx0XHRcdGZhbGxiYWNrUGFyYW1zLnVzZUNvbXByZXNzZWRQYXRoVmFyaWFibGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHJldHVybiBXUEdNWkEucmVzdEFQSS5jYWxsKGZhbGxiYWNrUm91dGUsIGZhbGxiYWNrUGFyYW1zKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG5cdFx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHBhcmFtcy51c2VDb21wcmVzc2VkUGF0aFZhcmlhYmxlICYmIFxyXG5cdFx0XHR0aGlzLmlzQ29tcHJlc3NlZFBhdGhWYXJpYWJsZVN1cHBvcnRlZCAmJiBcclxuXHRcdFx0dGhpcy5pc0NvbXByZXNzZWRQYXRoVmFyaWFibGVBbGxvd2VkKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgY29tcHJlc3NlZFBhcmFtcyA9ICQuZXh0ZW5kKHt9LCBwYXJhbXMpO1xyXG5cdFx0XHR2YXIgZGF0YSA9IHBhcmFtcy5kYXRhO1xyXG5cdFx0XHR2YXIgYmFzZTY0ID0gdGhpcy5jb21wcmVzc1BhcmFtcyhkYXRhKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKFdQR01aQS5pc1NlcnZlcklJUylcclxuXHRcdFx0XHRiYXNlNjQgPSBiYXNlNjQucmVwbGFjZSgvXFwrL2csIFwiJTIwXCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNvbXByZXNzZWRSb3V0ZSA9IHJvdXRlLnJlcGxhY2UoL1xcLyQvLCBcIlwiKSArIFwiL2Jhc2U2NFwiICsgYmFzZTY0O1xyXG5cdFx0XHR2YXIgZnVsbENvbXByZXNzZWRSb3V0ZSA9IFdQR01aQS5SZXN0QVBJLlVSTCArIGNvbXByZXNzZWRSb3V0ZTtcclxuXHRcdFx0XHJcblx0XHRcdGNvbXByZXNzZWRQYXJhbXMubWV0aG9kID0gXCJHRVRcIjtcclxuXHRcdFx0ZGVsZXRlIGNvbXByZXNzZWRQYXJhbXMuZGF0YTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHBhcmFtcy5jYWNoZSA9PT0gZmFsc2UpXHJcblx0XHRcdFx0Y29tcHJlc3NlZFBhcmFtcy5kYXRhID0ge1xyXG5cdFx0XHRcdFx0c2tpcF9jYWNoZTogMVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjb21wcmVzc2VkUm91dGUubGVuZ3RoIDwgdGhpcy5tYXhVUkxMZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRhdHRlbXB0ZWRDb21wcmVzc2VkUGF0aFZhcmlhYmxlID0gdHJ1ZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRyb3V0ZSA9IGNvbXByZXNzZWRSb3V0ZTtcclxuXHRcdFx0XHRwYXJhbXMgPSBjb21wcmVzc2VkUGFyYW1zO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIEZhbGxiYWNrIGZvciB3aGVuIFVSTCBleGNlZWRzIHByZWRlZmluZWQgbGVuZ3RoIGxpbWl0XHJcblx0XHRcdFx0aWYoIVdQR01aQS5SZXN0QVBJLmNvbXByZXNzZWRQYXRoVmFyaWFibGVVUkxMaW1pdFdhcm5pbmdEaXNwbGF5ZWQpXHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oXCJDb21wcmVzc2VkIHBhdGggdmFyaWFibGUgcm91dGUgd291bGQgZXhjZWVkIFVSTCBsZW5ndGggbGltaXRcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0V1BHTVpBLlJlc3RBUEkuY29tcHJlc3NlZFBhdGhWYXJpYWJsZVVSTExpbWl0V2FybmluZ0Rpc3BsYXllZCA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gTkI6IFN1cHBvcnQgcGxhaW4gcGVybWFsaW5rc1xyXG5cdFx0aWYoV1BHTVpBLlJlc3RBUEkuVVJMLm1hdGNoKC9cXD8vKSlcclxuXHRcdFx0cm91dGUgPSByb3V0ZS5yZXBsYWNlKC9cXD8vLCBcIiZcIik7XHJcblx0XHRcclxuXHRcdHJldHVybiAkLmFqYXgoV1BHTVpBLlJlc3RBUEkuVVJMICsgcm91dGUsIHBhcmFtcyk7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBuYXRpdmVDYWxsRnVuY3Rpb24gPSBXUEdNWkEuUmVzdEFQSS5jYWxsO1xyXG5cdFdQR01aQS5SZXN0QVBJLmNhbGwgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0Y29uc29sZS53YXJuKFwiV1BHTVpBLlJlc3RBUEkuY2FsbCB3YXMgY2FsbGVkIHN0YXRpY2FsbHksIGRpZCB5b3UgbWVhbiB0byBjYWxsIHRoZSBmdW5jdGlvbiBvbiBXUEdNWkEucmVzdEFQST9cIik7XHJcblx0XHRcclxuXHRcdG5hdGl2ZUNhbGxGdW5jdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdH1cclxuXHJcblx0JChkb2N1bWVudC5ib2R5KS5vbihcImNsaWNrXCIsIFwiI3dwZ216YS1yZXN0LWFwaS1ibG9ja2VkIGJ1dHRvbi5ub3RpY2UtZGlzbWlzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHJcblx0XHRXUEdNWkEucmVzdEFQSS5jYWxsKFwiL3Jlc3QtYXBpL1wiLCB7XHJcblx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXHJcblx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRkaXNtaXNzX2Jsb2NrZWRfbm90aWNlOiB0cnVlXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoicmVzdC1hcGkuanMifQ==


// js/v8/settings-page.js
/**
 * @namespace WPGMZA
 * @module SettingsPage
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	WPGMZA.SettingsPage = function()
	{
		$("#wpgmza-global-settings").tabs();
	}
	
	WPGMZA.SettingsPage.createInstance = function()
	{
		return new WPGMZA.SettingsPage();
	}
	
	$(window).on("load", function(event) {
		
		var useLegacyHTML = WPGMZA.settings.useLegacyHTML || !window.location.href.match(/no-legacy-html/);
		
		if(WPGMZA.getCurrentPage() == WPGMZA.PAGE_SETTINGS && !useLegacyHTML)
			WPGMZA.settingsPage = WPGMZA.SettingsPage.createInstance();
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy1wYWdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFNldHRpbmdzUGFnZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0V1BHTVpBLlNldHRpbmdzUGFnZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQkKFwiI3dwZ216YS1nbG9iYWwtc2V0dGluZ3NcIikudGFicygpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuU2V0dGluZ3NQYWdlLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiBuZXcgV1BHTVpBLlNldHRpbmdzUGFnZSgpO1xyXG5cdH1cclxuXHRcclxuXHQkKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcclxuXHRcdHZhciB1c2VMZWdhY3lIVE1MID0gV1BHTVpBLnNldHRpbmdzLnVzZUxlZ2FjeUhUTUwgfHwgIXdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9uby1sZWdhY3ktaHRtbC8pO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuZ2V0Q3VycmVudFBhZ2UoKSA9PSBXUEdNWkEuUEFHRV9TRVRUSU5HUyAmJiAhdXNlTGVnYWN5SFRNTClcclxuXHRcdFx0V1BHTVpBLnNldHRpbmdzUGFnZSA9IFdQR01aQS5TZXR0aW5nc1BhZ2UuY3JlYXRlSW5zdGFuY2UoKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6InNldHRpbmdzLXBhZ2UuanMifQ==


// js/v8/store-locator.js
/**
 * @namespace WPGMZA
 * @module StoreLocator
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	WPGMZA.StoreLocator = function(map, element)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this._center = null;
		
		this.map = map;
		this.element = element;
		this.element.wpgmzaStoreLocator = this;
		
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		$(element).find(".wpgmza-not-found-msg").hide();
		
		// Address input
		this.addressInput = WPGMZA.AddressInput.createInstance( $(element).find("input.wpgmza-address")[0], map );
		
		// TODO: This will be moved into this module instead of listening to the map event
		this.map.on("storelocatorgeocodecomplete", function(event) {
			self.onGeocodeComplete(event);
		});
		
		this.map.on("init", function(event) {
			
			self.map.markerFilter.on("filteringcomplete", function(event) {
				self.onFilteringComplete(event);
			});
			
		});
		
		// Catch enter
		$(element).on("keypress", "input", function(event) {
			
			if(event.which != 13)
				return;
			
			// NB: Legacy compatibilty. Do not merge this into 8.1.0
			searchLocations(self.map.id);
			
			self.onSearch(event);
			
		});

		// Legacy store locator buttons
		$(document.body).on("click", ".wpgmza_sl_search_button_" + map.id + ", [data-map-id='" + map.id + "'] .wpgmza_sl_search_button", function(event) {
			self.onSearch(event);
		});
		
		$(document.body).on("click", ".wpgmza_sl_reset_button_" + map.id + ", [data-map-id='" + map.id + "'] .wpgmza_sl_reset_button_div", function(event) {
			self.onReset(event);
		});
	}
	
	WPGMZA.StoreLocator.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.StoreLocator.prototype.constructor = WPGMZA.StoreLocator;
	
	WPGMZA.StoreLocator.STATE_INITIAL		= "initial";
	WPGMZA.StoreLocator.STATE_APPLIED		= "applied";
	
	WPGMZA.StoreLocator.createInstance = function(map, element)
	{
		return new WPGMZA.StoreLocator(map, element);
	}
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "distanceUnits", {
	
		"get": function() {
			if(this.map.settings.store_locator_distance == 1)
				return WPGMZA.Distance.MILES;
			
			return WPGMZA.Distance.KILOMETERS;
		}
	
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "radius", {
		"get": function() {
			return $("#radiusSelect, #radiusSelect_" + this.map.id).val();
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
			
			if(this.map.settings.wpgmza_store_locator_radius_style == "modern" && !WPGMZA.isDeviceiOS())
			{
				this._circle = WPGMZA.ModernStoreLocatorCircle.createInstance(this.map.id);
				this._circle.settings.color = this.circleStrokeColor;
			}
			else
			{
				this._circle = WPGMZA.Circle.createInstance({
					strokeColor:	"#ff0000",
					strokeOpacity:	"0.25",
					strokeWeight:	2,
					fillColor:		"#ff0000",
					fillOpacity:	"0.15",
					visible:		false,
					clickable:      false
				});
			}
			
			return this._circle;
			
		}
		
	});
	
	WPGMZA.StoreLocator.prototype.onGeocodeComplete = function(event)
	{
		if(!event.results || !event.results.length)
		{
			this._center = null;
			this._bounds = null;

			return;
		}
		else
		{
			this._center = new WPGMZA.LatLng( event.results[0].latLng );
			this._bounds = new WPGMZA.LatLngBounds( event.results[0].bounds );
		}
		
		this.map.markerFilter.update({}, this);
	}
	
	WPGMZA.StoreLocator.prototype.onSearch = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_APPLIED;
	}
	
	WPGMZA.StoreLocator.prototype.onReset = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		this._center = null;
		this._bounds = null;
		
		this.map.markerFilter.update({}, this);
	}
	
	WPGMZA.StoreLocator.prototype.getFilteringParameters = function()
	{
		if(!this.center)
			return {};
		
		return {
			center: this.center,
			radius: this.radius
		};
	}
	
	WPGMZA.StoreLocator.prototype.onFilteringComplete = function(event)
	{
		var params = event.filteringParams;
		var marker = this.marker;
		
		if(marker)
			marker.setVisible(false);
		
		// Center point marker
		if(params.center && marker)
		{
			marker.setPosition(params.center);
			marker.setVisible(true);
			
			if(marker.map != this.map)
				this.map.addMarker(marker);
		}
		
		var circle = this.circle;
		
		if(circle)
		{
			var factor = (this.distanceUnits == WPGMZA.Distance.MILES ? WPGMZA.Distance.KILOMETERS_PER_MILE : 1.0);
			
			circle.setVisible(false);
			
			if(params.center && params.radius)
			{
				circle.setRadius(params.radius * factor);
				circle.setCenter(params.center);
				circle.setVisible(true);
				
				if(circle.map != this.map)
					this.map.addCircle(circle);
			}
			
			if(circle instanceof WPGMZA.ModernStoreLocatorCircle)
				circle.settings.radiusString = this.radius;
		}

		// Show / hide not found message
		if(!this.map.hasVisibleMarkers())
			$(this.element).find(".wpgmza-not-found-msg").show();
		else
			$(this.element).find(".wpgmza-not-found-msg").hide();
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzdG9yZS1sb2NhdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFN0b3JlTG9jYXRvclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyBldmVudC1kaXNwYXRjaGVyLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IgPSBmdW5jdGlvbihtYXAsIGVsZW1lbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuRXZlbnREaXNwYXRjaGVyLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMuX2NlbnRlciA9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwID0gbWFwO1xyXG5cdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHRcdHRoaXMuZWxlbWVudC53cGdtemFTdG9yZUxvY2F0b3IgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0YXRlID0gV1BHTVpBLlN0b3JlTG9jYXRvci5TVEFURV9JTklUSUFMO1xyXG5cdFx0XHJcblx0XHQkKGVsZW1lbnQpLmZpbmQoXCIud3BnbXphLW5vdC1mb3VuZC1tc2dcIikuaGlkZSgpO1xyXG5cdFx0XHJcblx0XHQvLyBBZGRyZXNzIGlucHV0XHJcblx0XHR0aGlzLmFkZHJlc3NJbnB1dCA9IFdQR01aQS5BZGRyZXNzSW5wdXQuY3JlYXRlSW5zdGFuY2UoICQoZWxlbWVudCkuZmluZChcImlucHV0LndwZ216YS1hZGRyZXNzXCIpWzBdLCBtYXAgKTtcclxuXHRcdFxyXG5cdFx0Ly8gVE9ETzogVGhpcyB3aWxsIGJlIG1vdmVkIGludG8gdGhpcyBtb2R1bGUgaW5zdGVhZCBvZiBsaXN0ZW5pbmcgdG8gdGhlIG1hcCBldmVudFxyXG5cdFx0dGhpcy5tYXAub24oXCJzdG9yZWxvY2F0b3JnZW9jb2RlY29tcGxldGVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbkdlb2NvZGVDb21wbGV0ZShldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXAub24oXCJpbml0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLm1hcC5tYXJrZXJGaWx0ZXIub24oXCJmaWx0ZXJpbmdjb21wbGV0ZVwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdHNlbGYub25GaWx0ZXJpbmdDb21wbGV0ZShldmVudCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQvLyBDYXRjaCBlbnRlclxyXG5cdFx0JChlbGVtZW50KS5vbihcImtleXByZXNzXCIsIFwiaW5wdXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGV2ZW50LndoaWNoICE9IDEzKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRcdC8vIE5COiBMZWdhY3kgY29tcGF0aWJpbHR5LiBEbyBub3QgbWVyZ2UgdGhpcyBpbnRvIDguMS4wXHJcblx0XHRcdHNlYXJjaExvY2F0aW9ucyhzZWxmLm1hcC5pZCk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLm9uU2VhcmNoKGV2ZW50KTtcclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBMZWdhY3kgc3RvcmUgbG9jYXRvciBidXR0b25zXHJcblx0XHQkKGRvY3VtZW50LmJvZHkpLm9uKFwiY2xpY2tcIiwgXCIud3BnbXphX3NsX3NlYXJjaF9idXR0b25fXCIgKyBtYXAuaWQgKyBcIiwgW2RhdGEtbWFwLWlkPSdcIiArIG1hcC5pZCArIFwiJ10gLndwZ216YV9zbF9zZWFyY2hfYnV0dG9uXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHNlbGYub25TZWFyY2goZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoZG9jdW1lbnQuYm9keSkub24oXCJjbGlja1wiLCBcIi53cGdtemFfc2xfcmVzZXRfYnV0dG9uX1wiICsgbWFwLmlkICsgXCIsIFtkYXRhLW1hcC1pZD0nXCIgKyBtYXAuaWQgKyBcIiddIC53cGdtemFfc2xfcmVzZXRfYnV0dG9uX2RpdlwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uUmVzZXQoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLlN0b3JlTG9jYXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuU3RvcmVMb2NhdG9yO1xyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IuU1RBVEVfSU5JVElBTFx0XHQ9IFwiaW5pdGlhbFwiO1xyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IuU1RBVEVfQVBQTElFRFx0XHQ9IFwiYXBwbGllZFwiO1xyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihtYXAsIGVsZW1lbnQpXHJcblx0e1xyXG5cdFx0cmV0dXJuIG5ldyBXUEdNWkEuU3RvcmVMb2NhdG9yKG1hcCwgZWxlbWVudCk7XHJcblx0fVxyXG5cdFxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSwgXCJkaXN0YW5jZVVuaXRzXCIsIHtcclxuXHRcclxuXHRcdFwiZ2V0XCI6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZih0aGlzLm1hcC5zZXR0aW5ncy5zdG9yZV9sb2NhdG9yX2Rpc3RhbmNlID09IDEpXHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5EaXN0YW5jZS5NSUxFUztcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBXUEdNWkEuRGlzdGFuY2UuS0lMT01FVEVSUztcclxuXHRcdH1cclxuXHRcclxuXHR9KTtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlN0b3JlTG9jYXRvci5wcm90b3R5cGUsIFwicmFkaXVzXCIsIHtcclxuXHRcdFwiZ2V0XCI6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gJChcIiNyYWRpdXNTZWxlY3QsICNyYWRpdXNTZWxlY3RfXCIgKyB0aGlzLm1hcC5pZCkudmFsKCk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLCBcImNlbnRlclwiLCB7XHJcblx0XHRcImdldFwiOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2NlbnRlcjtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlN0b3JlTG9jYXRvci5wcm90b3R5cGUsIFwiYm91bmRzXCIsIHtcclxuXHRcdFwiZ2V0XCI6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYm91bmRzO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdFxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSwgXCJtYXJrZXJcIiwge1xyXG5cdFx0XHJcblx0XHRcImdldFwiOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHRoaXMubWFwLnNldHRpbmdzLnN0b3JlX2xvY2F0b3JfYm91bmNlICE9IDEpXHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdFxyXG5cdFx0XHRpZih0aGlzLl9tYXJrZXIpXHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuX21hcmtlcjtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBvcHRpb25zID0ge1xyXG5cdFx0XHRcdHZpc2libGU6IGZhbHNlXHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLl9tYXJrZXIgPSBXUEdNWkEuTWFya2VyLmNyZWF0ZUluc3RhbmNlKG9wdGlvbnMpO1xyXG5cdFx0XHR0aGlzLl9tYXJrZXIuZGlzYWJsZUluZm9XaW5kb3cgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLl9tYXJrZXIuaXNGaWx0ZXJhYmxlID0gZmFsc2U7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLl9tYXJrZXIuc2V0QW5pbWF0aW9uKFdQR01aQS5NYXJrZXIuQU5JTUFUSU9OX0JPVU5DRSk7XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gdGhpcy5fbWFya2VyO1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSwgXCJjaXJjbGVcIiwge1xyXG5cdFx0XHJcblx0XHRcImdldFwiOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHRoaXMuX2NpcmNsZSlcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fY2lyY2xlO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYodGhpcy5tYXAuc2V0dGluZ3Mud3BnbXphX3N0b3JlX2xvY2F0b3JfcmFkaXVzX3N0eWxlID09IFwibW9kZXJuXCIgJiYgIVdQR01aQS5pc0RldmljZWlPUygpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhpcy5fY2lyY2xlID0gV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5jcmVhdGVJbnN0YW5jZSh0aGlzLm1hcC5pZCk7XHJcblx0XHRcdFx0dGhpcy5fY2lyY2xlLnNldHRpbmdzLmNvbG9yID0gdGhpcy5jaXJjbGVTdHJva2VDb2xvcjtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aGlzLl9jaXJjbGUgPSBXUEdNWkEuQ2lyY2xlLmNyZWF0ZUluc3RhbmNlKHtcclxuXHRcdFx0XHRcdHN0cm9rZUNvbG9yOlx0XCIjZmYwMDAwXCIsXHJcblx0XHRcdFx0XHRzdHJva2VPcGFjaXR5Olx0XCIwLjI1XCIsXHJcblx0XHRcdFx0XHRzdHJva2VXZWlnaHQ6XHQyLFxyXG5cdFx0XHRcdFx0ZmlsbENvbG9yOlx0XHRcIiNmZjAwMDBcIixcclxuXHRcdFx0XHRcdGZpbGxPcGFjaXR5Olx0XCIwLjE1XCIsXHJcblx0XHRcdFx0XHR2aXNpYmxlOlx0XHRmYWxzZSxcclxuXHRcdFx0XHRcdGNsaWNrYWJsZTogICAgICBmYWxzZVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gdGhpcy5fY2lyY2xlO1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uR2VvY29kZUNvbXBsZXRlID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0aWYoIWV2ZW50LnJlc3VsdHMgfHwgIWV2ZW50LnJlc3VsdHMubGVuZ3RoKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLl9jZW50ZXIgPSBudWxsO1xyXG5cdFx0XHR0aGlzLl9ib3VuZHMgPSBudWxsO1xyXG5cclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLl9jZW50ZXIgPSBuZXcgV1BHTVpBLkxhdExuZyggZXZlbnQucmVzdWx0c1swXS5sYXRMbmcgKTtcclxuXHRcdFx0dGhpcy5fYm91bmRzID0gbmV3IFdQR01aQS5MYXRMbmdCb3VuZHMoIGV2ZW50LnJlc3VsdHNbMF0uYm91bmRzICk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMubWFwLm1hcmtlckZpbHRlci51cGRhdGUoe30sIHRoaXMpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuU3RvcmVMb2NhdG9yLnByb3RvdHlwZS5vblNlYXJjaCA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdHRoaXMuc3RhdGUgPSBXUEdNWkEuU3RvcmVMb2NhdG9yLlNUQVRFX0FQUExJRUQ7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uUmVzZXQgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR0aGlzLnN0YXRlID0gV1BHTVpBLlN0b3JlTG9jYXRvci5TVEFURV9JTklUSUFMO1xyXG5cdFx0XHJcblx0XHR0aGlzLl9jZW50ZXIgPSBudWxsO1xyXG5cdFx0dGhpcy5fYm91bmRzID0gbnVsbDtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXAubWFya2VyRmlsdGVyLnVwZGF0ZSh7fSwgdGhpcyk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLmdldEZpbHRlcmluZ1BhcmFtZXRlcnMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoIXRoaXMuY2VudGVyKVxyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHRcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGNlbnRlcjogdGhpcy5jZW50ZXIsXHJcblx0XHRcdHJhZGl1czogdGhpcy5yYWRpdXNcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uRmlsdGVyaW5nQ29tcGxldGUgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR2YXIgcGFyYW1zID0gZXZlbnQuZmlsdGVyaW5nUGFyYW1zO1xyXG5cdFx0dmFyIG1hcmtlciA9IHRoaXMubWFya2VyO1xyXG5cdFx0XHJcblx0XHRpZihtYXJrZXIpXHJcblx0XHRcdG1hcmtlci5zZXRWaXNpYmxlKGZhbHNlKTtcclxuXHRcdFxyXG5cdFx0Ly8gQ2VudGVyIHBvaW50IG1hcmtlclxyXG5cdFx0aWYocGFyYW1zLmNlbnRlciAmJiBtYXJrZXIpXHJcblx0XHR7XHJcblx0XHRcdG1hcmtlci5zZXRQb3NpdGlvbihwYXJhbXMuY2VudGVyKTtcclxuXHRcdFx0bWFya2VyLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihtYXJrZXIubWFwICE9IHRoaXMubWFwKVxyXG5cdFx0XHRcdHRoaXMubWFwLmFkZE1hcmtlcihtYXJrZXIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgY2lyY2xlID0gdGhpcy5jaXJjbGU7XHJcblx0XHRcclxuXHRcdGlmKGNpcmNsZSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIGZhY3RvciA9ICh0aGlzLmRpc3RhbmNlVW5pdHMgPT0gV1BHTVpBLkRpc3RhbmNlLk1JTEVTID8gV1BHTVpBLkRpc3RhbmNlLktJTE9NRVRFUlNfUEVSX01JTEUgOiAxLjApO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2lyY2xlLnNldFZpc2libGUoZmFsc2UpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYocGFyYW1zLmNlbnRlciAmJiBwYXJhbXMucmFkaXVzKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y2lyY2xlLnNldFJhZGl1cyhwYXJhbXMucmFkaXVzICogZmFjdG9yKTtcclxuXHRcdFx0XHRjaXJjbGUuc2V0Q2VudGVyKHBhcmFtcy5jZW50ZXIpO1xyXG5cdFx0XHRcdGNpcmNsZS5zZXRWaXNpYmxlKHRydWUpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGNpcmNsZS5tYXAgIT0gdGhpcy5tYXApXHJcblx0XHRcdFx0XHR0aGlzLm1hcC5hZGRDaXJjbGUoY2lyY2xlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoY2lyY2xlIGluc3RhbmNlb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZSlcclxuXHRcdFx0XHRjaXJjbGUuc2V0dGluZ3MucmFkaXVzU3RyaW5nID0gdGhpcy5yYWRpdXM7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU2hvdyAvIGhpZGUgbm90IGZvdW5kIG1lc3NhZ2VcclxuXHRcdGlmKCF0aGlzLm1hcC5oYXNWaXNpYmxlTWFya2VycygpKVxyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkuZmluZChcIi53cGdtemEtbm90LWZvdW5kLW1zZ1wiKS5zaG93KCk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCQodGhpcy5lbGVtZW50KS5maW5kKFwiLndwZ216YS1ub3QtZm91bmQtbXNnXCIpLmhpZGUoKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoic3RvcmUtbG9jYXRvci5qcyJ9


// js/v8/text.js
/**
 * @namespace WPGMZA
 * @module Text
 * @requires WPGMZA
 * @gulp-requires core.js
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
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0ZXh0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFRleHRcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5UZXh0ID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRpZihvcHRpb25zKVxyXG5cdFx0XHRmb3IodmFyIG5hbWUgaW4gb3B0aW9ucylcclxuXHRcdFx0XHR0aGlzW25hbWVdID0gb3B0aW9uc1tuYW1lXTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlRleHQuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdHN3aXRjaChXUEdNWkEuc2V0dGluZ3MuZW5naW5lKVxyXG5cdFx0e1xyXG5cdFx0XHRjYXNlIFwib3Blbi1sYXllcnNcIjpcclxuXHRcdFx0XHRyZXR1cm4gbmV3IFdQR01aQS5PTFRleHQob3B0aW9ucyk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBXUEdNWkEuR29vZ2xlVGV4dChvcHRpb25zKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoidGV4dC5qcyJ9


// js/v8/theme-editor.js
/**
 * @namespace WPGMZA
 * @module ThemeEditor
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	WPGMZA.ThemeEditor = function()
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.element = $("#wpgmza-theme-editor");
		
		if(!this.element.length)
		{
			console.warn("No element to initialise theme editor on");
			return;
		}
		
		if(WPGMZA.settings.engine == "open-layers")
		{
			this.element.remove();
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
		
		var textarea = $('textarea[name="wpgmza_theme_data"]')
		
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
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aGVtZS1lZGl0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgVGhlbWVFZGl0b3JcclxuICogQHJlcXVpcmVzIFdQR01aQS5FdmVudERpc3BhdGNoZXJcclxuICogQGd1bHAtcmVxdWlyZXMgZXZlbnQtZGlzcGF0Y2hlci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuVGhlbWVFZGl0b3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuRXZlbnREaXNwYXRjaGVyLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9ICQoXCIjd3BnbXphLXRoZW1lLWVkaXRvclwiKTtcclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMuZWxlbWVudC5sZW5ndGgpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIk5vIGVsZW1lbnQgdG8gaW5pdGlhbGlzZSB0aGVtZSBlZGl0b3Igb25cIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLnNldHRpbmdzLmVuZ2luZSA9PSBcIm9wZW4tbGF5ZXJzXCIpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmpzb24gPSBbe31dO1xyXG5cdFx0dGhpcy5tYXBFbGVtZW50ID0gV1BHTVpBLm1hcHNbMF0uZWxlbWVudDtcclxuXHJcblx0XHR0aGlzLmVsZW1lbnQuYXBwZW5kVG8oJyN3cGdtemEtbWFwLXRoZW1lLWVkaXRvcl9faG9sZGVyJyk7XHJcblx0XHRcclxuXHRcdCQod2luZG93KS5vbihcInNjcm9sbFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHQvL3NlbGYudXBkYXRlUG9zaXRpb24oKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuXHRcdFx0Ly9zZWxmLnVwZGF0ZVBvc2l0aW9uKCk7XHJcblx0XHR9LCAyMDApO1xyXG5cdFx0XHJcblx0XHR0aGlzLmluaXRIVE1MKCk7XHJcblx0XHRcclxuXHRcdFdQR01aQS50aGVtZUVkaXRvciA9IHRoaXM7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5leHRlbmQoV1BHTVpBLlRoZW1lRWRpdG9yLCBXUEdNWkEuRXZlbnREaXNwYXRjaGVyKTtcclxuXHRcclxuXHRXUEdNWkEuVGhlbWVFZGl0b3IucHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdC8vdmFyIG9mZnNldCA9ICQodGhpcy5tYXBFbGVtZW50KS5vZmZzZXQoKTtcclxuXHRcdFxyXG5cdFx0Ly8gdmFyIHJlbGF0aXZlVG9wID0gb2Zmc2V0LnRvcCAtICQod2luZG93KS5zY3JvbGxUb3AoKTtcclxuXHRcdC8vIHZhciByZWxhdGl2ZUxlZnQgPSBvZmZzZXQubGVmdCAtICQod2luZG93KS5zY3JvbGxMZWZ0KCk7XHJcblx0XHQvLyB2YXIgaGVpZ2h0ID0gJCh0aGlzLm1hcEVsZW1lbnQpLmhlaWdodCgpO1xyXG5cdFx0Ly8gdmFyIHdpZHRoID0gJCh0aGlzLm1hcEVsZW1lbnQpLndpZHRoKCk7XHJcblxyXG5cdFx0Ly8gdGhpcy5lbGVtZW50LmNzcyh7XHJcblx0XHQvLyBcdHRvcDpcdChyZWxhdGl2ZVRvcCAtIChoZWlnaHQgKyA1KSkgKyBcInB4XCIsXHJcblx0XHQvLyBcdGxlZnQ6XHQocmVsYXRpdmVMZWZ0ICsgd2lkdGgpICsgXCJweFwiLFxyXG5cdFx0Ly8gXHRoZWlnaHQ6XHRoZWlnaHQgKyBcInB4XCIsXHJcblx0XHQvLyBcdHdpZHRoOiB3aWR0aCArICdweCdcclxuXHRcdC8vIH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuVGhlbWVFZGl0b3IuZmVhdHVyZXMgPSB7XHJcblx0XHQnYWxsJyA6IFtdLFxyXG5cdFx0J2FkbWluaXN0cmF0aXZlJyA6IFtcclxuXHRcdFx0J2NvdW50cnknLFxyXG5cdFx0XHQnbGFuZF9wYXJjZWwnLFxyXG5cdFx0XHQnbG9jYWxpdHknLFxyXG5cdFx0XHQnbmVpZ2hib3Job29kJyxcclxuXHRcdFx0J3Byb3ZpbmNlJ1xyXG5cdFx0XSxcclxuXHRcdCdsYW5kc2NhcGUnIDogW1xyXG5cdFx0XHQnbWFuX21hZGUnLFxyXG5cdFx0XHQnbmF0dXJhbCcsXHJcblx0XHRcdCduYXR1cmFsLmxhbmRjb3ZlcicsXHJcblx0XHRcdCduYXR1cmFsLnRlcnJhaW4nXHJcblx0XHRdLFxyXG5cdFx0J3BvaScgOiBbXHJcblx0XHRcdCdhdHRyYWN0aW9uJyxcclxuXHRcdFx0J2J1c2luZXNzJyxcclxuXHRcdFx0J2dvdmVybm1lbnQnLFxyXG5cdFx0XHQnbWVkaWNhbCcsXHJcblx0XHRcdCdwYXJrJyxcclxuXHRcdFx0J3BsYWNlX29mX3dvcnNoaXAnLFxyXG5cdFx0XHQnc2Nob29sJyxcclxuXHRcdFx0J3Nwb3J0c19jb21wbGV4J1xyXG5cdFx0XSxcclxuXHRcdCdyb2FkJyA6IFtcclxuXHRcdFx0J2FydGVyaWFsJyxcclxuXHRcdFx0J2hpZ2h3YXknLFxyXG5cdFx0XHQnaGlnaHdheS5jb250cm9sbGVkX2FjY2VzcycsXHJcblx0XHRcdCdsb2NhbCdcclxuXHRcdF0sXHJcblx0XHQndHJhbnNpdCcgOiBbXHJcblx0XHRcdCdsaW5lJyxcclxuXHRcdFx0J3N0YXRpb24nLFxyXG5cdFx0XHQnc3RhdGlvbi5haXJwb3J0JyxcclxuXHRcdFx0J3N0YXRpb24uYnVzJyxcclxuXHRcdFx0J3N0YXRpb24ucmFpbCdcclxuXHRcdF0sXHJcblx0XHQnd2F0ZXInIDogW11cclxuXHR9O1xyXG5cdFxyXG5cdFdQR01aQS5UaGVtZUVkaXRvci5lbGVtZW50cyA9IHtcclxuXHRcdCdhbGwnIDogW10sXHJcblx0XHQnZ2VvbWV0cnknIDogW1xyXG5cdFx0XHQnZmlsbCcsXHJcblx0XHRcdCdzdHJva2UnXHJcblx0XHRdLFxyXG5cdFx0J2xhYmVscycgOiBbXHJcblx0XHRcdCdpY29uJyxcclxuXHRcdFx0J3RleHQnLFxyXG5cdFx0XHQndGV4dC5maWxsJyxcclxuXHRcdFx0J3RleHQuc3Ryb2tlJ1xyXG5cdFx0XVxyXG5cdH07XHJcblx0XHJcblx0V1BHTVpBLlRoZW1lRWRpdG9yLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9mZWF0dXJlIG9wdGlvbiwgI3dwZ216YV90aGVtZV9lZGl0b3JfZWxlbWVudCBvcHRpb24nKS5jc3MoJ2ZvbnQtd2VpZ2h0JywgJ25vcm1hbCcpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZXJyb3InKS5oaWRlKCk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcicpLnNob3coKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2h1ZScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9odWUnKS52YWwoJyMwMDAwMDAnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2xpZ2h0bmVzcycpLnZhbCgnJyk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uJykudmFsKCcnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2dhbW1hJykudmFsKCcnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2ludmVydF9saWdodG5lc3MnKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfdmlzaWJpbGl0eScpLnZhbCgnaW5oZXJpdCcpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3InKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfY29sb3InKS52YWwoJyMwMDAwMDAnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3dlaWdodCcpLnZhbCgnJyk7XHJcblx0XHRcclxuXHRcdHZhciB0ZXh0YXJlYSA9ICQoJ3RleHRhcmVhW25hbWU9XCJ3cGdtemFfdGhlbWVfZGF0YVwiXScpXHJcblx0XHRcclxuXHRcdGlmICghdGV4dGFyZWEudmFsKCkgfHwgdGV4dGFyZWEudmFsKCkubGVuZ3RoIDwgMSkge1xyXG5cdFx0XHR0aGlzLmpzb24gPSBbe31dO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRyeSB7XHJcblx0XHRcdHRoaXMuanNvbiA9ICQucGFyc2VKU09OKCQoJ3RleHRhcmVhW25hbWU9XCJ3cGdtemFfdGhlbWVfZGF0YVwiXScpLnZhbCgpKTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0dGhpcy5qc29uID0gW3t9XHJcblx0XHRcdF07XHJcblx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yJykuaGlkZSgpO1xyXG5cdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9lcnJvcicpLnNob3coKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCEkLmlzQXJyYXkodGhpcy5qc29uKSkge1xyXG5cdFx0XHR2YXIganNvbkNvcHkgPSB0aGlzLmpzb247XHJcblx0XHRcdHRoaXMuanNvbiA9IFtdO1xyXG5cdFx0XHR0aGlzLmpzb24ucHVzaChqc29uQ29weSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuaGlnaGxpZ2h0RmVhdHVyZXMoKTtcclxuXHRcdHRoaXMuaGlnaGxpZ2h0RWxlbWVudHMoKTtcclxuXHRcdHRoaXMubG9hZEVsZW1lbnRTdHlsZXJzKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5UaGVtZUVkaXRvci5wcm90b3R5cGUuaGlnaGxpZ2h0RmVhdHVyZXMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZmVhdHVyZSBvcHRpb24nKS5jc3MoJ2ZvbnQtd2VpZ2h0JywgJ25vcm1hbCcpO1xyXG5cdFx0JC5lYWNoKHRoaXMuanNvbiwgZnVuY3Rpb24gKGksIHYpIHtcclxuXHRcdFx0aWYgKHYuaGFzT3duUHJvcGVydHkoJ2ZlYXR1cmVUeXBlJykpIHtcclxuXHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9mZWF0dXJlIG9wdGlvblt2YWx1ZT1cIicgKyB2LmZlYXR1cmVUeXBlICsgJ1wiXScpLmNzcygnZm9udC13ZWlnaHQnLCAnYm9sZCcpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUgb3B0aW9uW3ZhbHVlPVwiYWxsXCJdJykuY3NzKCdmb250LXdlaWdodCcsICdib2xkJyk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlRoZW1lRWRpdG9yLnByb3RvdHlwZS5oaWdobGlnaHRFbGVtZW50cyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgZmVhdHVyZSA9ICQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUnKS52YWwoKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQgb3B0aW9uJykuY3NzKCdmb250LXdlaWdodCcsICdub3JtYWwnKTtcclxuXHRcdCQuZWFjaCh0aGlzLmpzb24sIGZ1bmN0aW9uIChpLCB2KSB7XHJcblx0XHRcdGlmICgodi5oYXNPd25Qcm9wZXJ0eSgnZmVhdHVyZVR5cGUnKSAmJiB2LmZlYXR1cmVUeXBlID09IGZlYXR1cmUpIHx8XHJcblx0XHRcdFx0KGZlYXR1cmUgPT0gJ2FsbCcgJiYgIXYuaGFzT3duUHJvcGVydHkoJ2ZlYXR1cmVUeXBlJykpKSB7XHJcblx0XHRcdFx0aWYgKHYuaGFzT3duUHJvcGVydHkoJ2VsZW1lbnRUeXBlJykpIHtcclxuXHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQgb3B0aW9uW3ZhbHVlPVwiJyArIHYuZWxlbWVudFR5cGUgKyAnXCJdJykuY3NzKCdmb250LXdlaWdodCcsICdib2xkJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQgb3B0aW9uW3ZhbHVlPVwiYWxsXCJdJykuY3NzKCdmb250LXdlaWdodCcsICdib2xkJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlRoZW1lRWRpdG9yLnByb3RvdHlwZS5sb2FkRWxlbWVudFN0eWxlcnMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGZlYXR1cmUgPSAkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9mZWF0dXJlJykudmFsKCk7XHJcblx0XHR2YXIgZWxlbWVudCA9ICQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQnKS52YWwoKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2h1ZScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9odWUnKS52YWwoJyMwMDAwMDAnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2xpZ2h0bmVzcycpLnZhbCgnJyk7XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uJykudmFsKCcnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2dhbW1hJykudmFsKCcnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2ludmVydF9saWdodG5lc3MnKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfdmlzaWJpbGl0eScpLnZhbCgnaW5oZXJpdCcpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3InKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xyXG5cdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfY29sb3InKS52YWwoJyMwMDAwMDAnKTtcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3dlaWdodCcpLnZhbCgnJyk7XHJcblx0XHQkLmVhY2godGhpcy5qc29uLCBmdW5jdGlvbiAoaSwgdikge1xyXG5cdFx0XHRpZiAoKHYuaGFzT3duUHJvcGVydHkoJ2ZlYXR1cmVUeXBlJykgJiYgdi5mZWF0dXJlVHlwZSA9PSBmZWF0dXJlKSB8fFxyXG5cdFx0XHRcdChmZWF0dXJlID09ICdhbGwnICYmICF2Lmhhc093blByb3BlcnR5KCdmZWF0dXJlVHlwZScpKSkge1xyXG5cdFx0XHRcdGlmICgodi5oYXNPd25Qcm9wZXJ0eSgnZWxlbWVudFR5cGUnKSAmJiB2LmVsZW1lbnRUeXBlID09IGVsZW1lbnQpIHx8XHJcblx0XHRcdFx0XHQoZWxlbWVudCA9PSAnYWxsJyAmJiAhdi5oYXNPd25Qcm9wZXJ0eSgnZWxlbWVudFR5cGUnKSkpIHtcclxuXHRcdFx0XHRcdGlmICh2Lmhhc093blByb3BlcnR5KCdzdHlsZXJzJykgJiYgJC5pc0FycmF5KHYuc3R5bGVycykgJiYgdi5zdHlsZXJzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdFx0JC5lYWNoKHYuc3R5bGVycywgZnVuY3Rpb24gKGlpLCB2dikge1xyXG5cdFx0XHRcdFx0XHRcdGlmICh2di5oYXNPd25Qcm9wZXJ0eSgnaHVlJykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2h1ZScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2h1ZScpLnZhbCh2di5odWUpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZiAodnYuaGFzT3duUHJvcGVydHkoJ2xpZ2h0bmVzcycpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9saWdodG5lc3MnKS52YWwodnYubGlnaHRuZXNzKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0aWYgKHZ2Lmhhc093blByb3BlcnR5KCdzYXR1cmF0aW9uJykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3NhdHVyYXRpb24nKS52YWwodnYueGF0dXJhdGlvbik7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmICh2di5oYXNPd25Qcm9wZXJ0eSgnZ2FtbWEnKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZ2FtbWEnKS52YWwodnYuZ2FtbWEpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRpZiAodnYuaGFzT3duUHJvcGVydHkoJ2ludmVydF9saWdodG5lc3MnKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9faW52ZXJ0X2xpZ2h0bmVzcycpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0aWYgKHZ2Lmhhc093blByb3BlcnR5KCd2aXNpYmlsaXR5JykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3Zpc2liaWxpdHknKS52YWwodnYudmlzaWJpbGl0eSk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmICh2di5oYXNPd25Qcm9wZXJ0eSgnY29sb3InKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0JCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3InKS5wcm9wKCdjaGVja2VkJywgdHJ1ZSk7XHJcblx0XHRcdFx0XHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9jb2xvcicpLnZhbCh2di5jb2xvcik7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdGlmICh2di5oYXNPd25Qcm9wZXJ0eSgnd2VpZ2h0JykpIHtcclxuXHRcdFx0XHRcdFx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3dlaWdodCcpLnZhbCh2di53ZWlnaHQpO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5UaGVtZUVkaXRvci5wcm90b3R5cGUud3JpdGVFbGVtZW50U3R5bGVycyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgZmVhdHVyZSA9ICQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUnKS52YWwoKTtcclxuXHRcdHZhciBlbGVtZW50ID0gJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZWxlbWVudCcpLnZhbCgpO1xyXG5cdFx0dmFyIGluZGV4SlNPTiA9IG51bGw7XHJcblx0XHR2YXIgc3R5bGVycyA9IFtdO1xyXG5cdFx0XHJcblx0XHRpZiAoJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfdmlzaWJpbGl0eScpLnZhbCgpICE9IFwiaW5oZXJpdFwiKSB7XHJcblx0XHRcdHN0eWxlcnMucHVzaCh7XHJcblx0XHRcdFx0J3Zpc2liaWxpdHknOiAkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl92aXNpYmlsaXR5JykudmFsKClcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRpZiAoJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3InKS5wcm9wKCdjaGVja2VkJykgPT09IHRydWUpIHtcclxuXHRcdFx0c3R5bGVycy5wdXNoKHtcclxuXHRcdFx0XHQnY29sb3InOiAkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9jb2xvcicpLnZhbCgpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2RvX2h1ZScpLnByb3AoJ2NoZWNrZWQnKSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdFwiaHVlXCI6ICQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2h1ZScpLnZhbCgpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2dhbW1hJykudmFsKCkubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdCdnYW1tYSc6IHBhcnNlRmxvYXQoJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZ2FtbWEnKS52YWwoKSlcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRpZiAoJCgnI3dwZ216YV90aGVtZV9lZGl0b3Jfd2VpZ2h0JykudmFsKCkubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdCd3ZWlnaHQnOiBwYXJzZUZsb2F0KCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX3dlaWdodCcpLnZhbCgpKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdGlmICgkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uJykudmFsKCkubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdCdzYXR1cmF0aW9uJzogcGFyc2VGbG9hdCgkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uJykudmFsKCkpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0aWYgKCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2xpZ2h0bmVzcycpLnZhbCgpLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0c3R5bGVycy5wdXNoKHtcclxuXHRcdFx0XHQnbGlnaHRuZXNzJzogcGFyc2VGbG9hdCgkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9saWdodG5lc3MnKS52YWwoKSlcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRpZiAoJCgnI3dwZ216YV90aGVtZV9lZGl0b3JfZG9faW52ZXJ0X2xpZ2h0bmVzcycpLnByb3AoJ2NoZWNrZWQnKSA9PT0gdHJ1ZSkge1xyXG5cdFx0XHRzdHlsZXJzLnB1c2goe1xyXG5cdFx0XHRcdCdpbnZlcnRfbGlnaHRuZXNzJzogdHJ1ZVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0JC5lYWNoKHRoaXMuanNvbiwgZnVuY3Rpb24gKGksIHYpIHtcclxuXHRcdFx0aWYgKCh2Lmhhc093blByb3BlcnR5KCdmZWF0dXJlVHlwZScpICYmIHYuZmVhdHVyZVR5cGUgPT0gZmVhdHVyZSkgfHxcclxuXHRcdFx0XHQoZmVhdHVyZSA9PSAnYWxsJyAmJiAhdi5oYXNPd25Qcm9wZXJ0eSgnZmVhdHVyZVR5cGUnKSkpIHtcclxuXHRcdFx0XHRpZiAoKHYuaGFzT3duUHJvcGVydHkoJ2VsZW1lbnRUeXBlJykgJiYgdi5lbGVtZW50VHlwZSA9PSBlbGVtZW50KSB8fFxyXG5cdFx0XHRcdFx0KGVsZW1lbnQgPT0gJ2FsbCcgJiYgIXYuaGFzT3duUHJvcGVydHkoJ2VsZW1lbnRUeXBlJykpKSB7XHJcblx0XHRcdFx0XHRpbmRleEpTT04gPSBpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRpZiAoaW5kZXhKU09OID09PSBudWxsKSB7XHJcblx0XHRcdGlmIChzdHlsZXJzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHR2YXIgbmV3X2ZlYXR1cmVfZWxlbWVudF9zdHlsZXJzID0ge307XHJcblx0XHRcdFx0aWYgKGZlYXR1cmUgIT0gJ2FsbCcpIHtcclxuXHRcdFx0XHRcdG5ld19mZWF0dXJlX2VsZW1lbnRfc3R5bGVycy5mZWF0dXJlVHlwZSA9IGZlYXR1cmU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChlbGVtZW50ICE9ICdhbGwnKSB7XHJcblx0XHRcdFx0XHRuZXdfZmVhdHVyZV9lbGVtZW50X3N0eWxlcnMuZWxlbWVudFR5cGUgPSBlbGVtZW50O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRuZXdfZmVhdHVyZV9lbGVtZW50X3N0eWxlcnMuc3R5bGVycyA9IHN0eWxlcnM7XHJcblx0XHRcdFx0dGhpcy5qc29uLnB1c2gobmV3X2ZlYXR1cmVfZWxlbWVudF9zdHlsZXJzKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0aWYgKHN0eWxlcnMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdHRoaXMuanNvbltpbmRleEpTT05dLnN0eWxlcnMgPSBzdHlsZXJzO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMuanNvbi5zcGxpY2UoaW5kZXhKU09OLCAxKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQkKCd0ZXh0YXJlYVtuYW1lPVwid3BnbXphX3RoZW1lX2RhdGFcIl0nKS52YWwoSlNPTi5zdHJpbmdpZnkodGhpcy5qc29uKS5yZXBsYWNlKC86L2csICc6ICcpLnJlcGxhY2UoLywvZywgJywgJykpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmhpZ2hsaWdodEZlYXR1cmVzKCk7XHJcblx0XHR0aGlzLmhpZ2hsaWdodEVsZW1lbnRzKCk7XHJcblx0XHRcclxuXHRcdFdQR01aQS50aGVtZVBhbmVsLnVwZGF0ZU1hcFRoZW1lKCk7XHJcblx0fVxyXG5cdFxyXG5cdC8vIFRPRE86IFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5nc1xyXG5cdFxyXG5cdFdQR01aQS5UaGVtZUVkaXRvci5wcm90b3R5cGUuaW5pdEhUTUwgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuXHRcdCQuZWFjaChXUEdNWkEuVGhlbWVFZGl0b3IuZmVhdHVyZXMsIGZ1bmN0aW9uIChpLCB2KSB7XHJcblx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUnKS5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIj4nICsgaSArICc8L29wdGlvbj4nKTtcclxuXHRcdFx0aWYgKHYubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdCQuZWFjaCh2LCBmdW5jdGlvbiAoaWksIHZ2KSB7XHJcblx0XHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9mZWF0dXJlJykuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIGkgKyAnLicgKyB2diArICdcIj4nICsgaSArICcuJyArIHZ2ICsgJzwvb3B0aW9uPicpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdCQuZWFjaChXUEdNWkEuVGhlbWVFZGl0b3IuZWxlbWVudHMsIGZ1bmN0aW9uIChpLCB2KSB7XHJcblx0XHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQnKS5hcHBlbmQoJzxvcHRpb24gdmFsdWU9XCInICsgaSArICdcIj4nICsgaSArICc8L29wdGlvbj4nKTtcclxuXHRcdFx0aWYgKHYubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdCQuZWFjaCh2LCBmdW5jdGlvbiAoaWksIHZ2KSB7XHJcblx0XHRcdFx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9lbGVtZW50JykuYXBwZW5kKCc8b3B0aW9uIHZhbHVlPVwiJyArIGkgKyAnLicgKyB2diArICdcIj4nICsgaSArICcuJyArIHZ2ICsgJzwvb3B0aW9uPicpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHR0aGlzLnBhcnNlKCk7XHJcblx0XHRcclxuXHRcdC8vIEJpbmQgbGlzdGVuZXJzXHJcblx0XHQkKCd0ZXh0YXJlYVtuYW1lPVwid3BnbXphX3RoZW1lX2RhdGFcIl0nKS5vbignaW5wdXQgc2VsZWN0aW9uY2hhbmdlIHByb3BlcnR5Y2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNlbGYucGFyc2UoKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKCcud3BnbXphX3RoZW1lX3NlbGVjdGlvbicpLmNsaWNrKGZ1bmN0aW9uKCl7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKXskKCd0ZXh0YXJlYVtuYW1lPVwid3BnbXphX3RoZW1lX2RhdGFcIl0nKS50cmlnZ2VyKCdpbnB1dCcpO30sIDEwMDApO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2ZlYXR1cmUnKS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2VsZi5oaWdobGlnaHRFbGVtZW50cygpO1xyXG5cdFx0XHRzZWxmLmxvYWRFbGVtZW50U3R5bGVycygpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoJyN3cGdtemFfdGhlbWVfZWRpdG9yX2VsZW1lbnQnKS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2VsZi5sb2FkRWxlbWVudFN0eWxlcnMoKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKCcjd3BnbXphX3RoZW1lX2VkaXRvcl9kb19odWUsICN3cGdtemFfdGhlbWVfZWRpdG9yX2h1ZSwgI3dwZ216YV90aGVtZV9lZGl0b3JfbGlnaHRuZXNzLCAjd3BnbXphX3RoZW1lX2VkaXRvcl9zYXR1cmF0aW9uLCAjd3BnbXphX3RoZW1lX2VkaXRvcl9nYW1tYSwgI3dwZ216YV90aGVtZV9lZGl0b3JfZG9faW52ZXJ0X2xpZ2h0bmVzcywgI3dwZ216YV90aGVtZV9lZGl0b3JfdmlzaWJpbGl0eSwgI3dwZ216YV90aGVtZV9lZGl0b3JfZG9fY29sb3IsICN3cGdtemFfdGhlbWVfZWRpdG9yX2NvbG9yLCAjd3BnbXphX3RoZW1lX2VkaXRvcl93ZWlnaHQnKS5vbignaW5wdXQgc2VsZWN0aW9uY2hhbmdlIHByb3BlcnR5Y2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNlbGYud3JpdGVFbGVtZW50U3R5bGVycygpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgPT0gXCJvcGVuLWxheWVyc1wiKVxyXG5cdFx0XHQkKFwiI3dwZ216YV90aGVtZV9lZGl0b3IgOmlucHV0XCIpLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoidGhlbWUtZWRpdG9yLmpzIn0=


// js/v8/theme-panel.js
/**
 * @namespace WPGMZA
 * @module ThemePanel
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	WPGMZA.ThemePanel = function()
	{
		var self = this;
		
		this.element = $("#wpgmza-theme-panel");
		this.map = WPGMZA.maps[0];
		
		if(!this.element.length)
		{
			console.warn("No element to initialise theme panel on");
			return;
		}
		
		$("#wpgmza-theme-presets").owlCarousel({
			items: 5,
			dots: true
		});
		
		this.element.on("click", "#wpgmza-theme-presets label", function(event) {
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
		var textarea		= $(this.element).find("textarea[name='wpgmza_theme_data']");
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aGVtZS1wYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBUaGVtZVBhbmVsXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuVGhlbWVQYW5lbCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9ICQoXCIjd3BnbXphLXRoZW1lLXBhbmVsXCIpO1xyXG5cdFx0dGhpcy5tYXAgPSBXUEdNWkEubWFwc1swXTtcclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMuZWxlbWVudC5sZW5ndGgpXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIk5vIGVsZW1lbnQgdG8gaW5pdGlhbGlzZSB0aGVtZSBwYW5lbCBvblwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQkKFwiI3dwZ216YS10aGVtZS1wcmVzZXRzXCIpLm93bENhcm91c2VsKHtcclxuXHRcdFx0aXRlbXM6IDUsXHJcblx0XHRcdGRvdHM6IHRydWVcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLmVsZW1lbnQub24oXCJjbGlja1wiLCBcIiN3cGdtemEtdGhlbWUtcHJlc2V0cyBsYWJlbFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uVGhlbWVQcmVzZXRDbGljayhldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0JChcIiN3cGdtemEtb3Blbi10aGVtZS1lZGl0b3JcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHQkKCcjd3BnbXphLW1hcC10aGVtZS1lZGl0b3JfX2hvbGRlcicpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0JChcIiN3cGdtemEtdGhlbWUtZWRpdG9yXCIpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuXHRcdFx0V1BHTVpBLmFuaW1hdGVTY3JvbGwoJChcIiN3cGdtemEtdGhlbWUtZWRpdG9yXCIpKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEudGhlbWVQYW5lbCA9IHRoaXM7XHJcblx0XHRcclxuXHRcdC8qQ29kZU1pcnJvci5mcm9tVGV4dEFyZWEoJChcInRleHRhcmVhW25hbWU9J3dwZ216YV90aGVtZV9kYXRhJ11cIilbMF0sIHtcclxuXHRcdFx0bGluZU51bWJlcnM6IHRydWUsXHJcblx0XHRcdG1vZGU6IFwiamF2YXNjcmlwdFwiXHJcblx0XHR9KTsqL1xyXG5cdH1cclxuXHRcclxuXHQvLyBOQjogVGhlc2UgYXJlbid0IHVzZWQgYW55d2hlcmUsIGJ1dCB0aGV5IGFyZSByZWNvcmRlZCBoZXJlIGZvciBmdXR1cmUgdXNlIGluIG1ha2luZyBwcmV2aWV3IGltYWdlc1xyXG5cdFdQR01aQS5UaGVtZVBhbmVsLnByZXZpZXdJbWFnZUNlbnRlclx0PSB7bGF0OiAzMy43MDE4MDY0NjIxNDg2NDYsIGxuZzogLTExOC4xNTk0OTg5NjA1ODk4M307XHJcblx0V1BHTVpBLlRoZW1lUGFuZWwucHJldmlld0ltYWdlWm9vbVx0XHQ9IDExO1xyXG5cdFxyXG5cdFdQR01aQS5UaGVtZVBhbmVsLnByb3RvdHlwZS5vblRoZW1lUHJlc2V0Q2xpY2sgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR2YXIgc2VsZWN0ZWREYXRhXHQ9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuZmluZChcIltkYXRhLXRoZW1lLWpzb25dXCIpLmF0dHIoXCJkYXRhLXRoZW1lLWpzb25cIik7XHJcblx0XHR2YXIgdGV4dGFyZWFcdFx0PSAkKHRoaXMuZWxlbWVudCkuZmluZChcInRleHRhcmVhW25hbWU9J3dwZ216YV90aGVtZV9kYXRhJ11cIik7XHJcblx0XHR2YXIgZXhpc3RpbmdEYXRhXHQ9IHRleHRhcmVhLnZhbCgpO1xyXG5cdFx0dmFyIGFsbFByZXNldERhdGFcdD0gW107XHJcblx0XHRcclxuXHRcdCQodGhpcy5lbGVtZW50KS5maW5kKFwiW2RhdGEtdGhlbWUtanNvbl1cIikuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcclxuXHRcdFx0YWxsUHJlc2V0RGF0YS5wdXNoKCAkKGVsKS5hdHRyKFwiZGF0YS10aGVtZS1qc29uXCIpICk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Ly8gTkI6IFRoaXMgY29kZSB3aWxsIG9ubHkgcHJvbXB0IHRoZSB1c2VyIHRvIG92ZXJ3cml0ZSBpZiBhIGN1c3RvbSB0aGVtZSBpcyBub3QgYmVpbmcgdXNlZC4gVGhpcyB3YXkgeW91IGNhbiBzdGlsbCBmbGljayB0aHJvdWdoIHRoZSB1bm1vZGlmaWVkIHRoZW1lc1xyXG5cdFx0aWYoZXhpc3RpbmdEYXRhLmxlbmd0aCAmJiBhbGxQcmVzZXREYXRhLmluZGV4T2YoZXhpc3RpbmdEYXRhKSA9PSAtMSlcclxuXHRcdHtcclxuXHRcdFx0aWYoIWNvbmZpcm0oV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLm92ZXJ3cml0ZV90aGVtZV9kYXRhKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRleHRhcmVhLnZhbChzZWxlY3RlZERhdGEpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnVwZGF0ZU1hcFRoZW1lKCk7XHJcblx0XHRXUEdNWkEudGhlbWVFZGl0b3IucGFyc2UoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlRoZW1lUGFuZWwucHJvdG90eXBlLnVwZGF0ZU1hcFRoZW1lID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBkYXRhO1xyXG5cdFx0XHJcblx0XHR0cnl7XHJcblx0XHRcdGRhdGEgPSBKU09OLnBhcnNlKCQoXCJ0ZXh0YXJlYVtuYW1lPSd3cGdtemFfdGhlbWVfZGF0YSddXCIpLnZhbCgpKTtcclxuXHRcdH1jYXRjaChlKSB7XHJcblx0XHRcdGFsZXJ0KFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5pbnZhbGlkX3RoZW1lX2RhdGEpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMubWFwLnNldE9wdGlvbnMoe3N0eWxlczogZGF0YX0pO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJ0aGVtZS1wYW5lbC5qcyJ9


// js/v8/version.js
/**
 * @namespace WPGMZA
 * @module Version
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ2ZXJzaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFZlcnNpb25cclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cclxuXHRmdW5jdGlvbiBpc1Bvc2l0aXZlSW50ZWdlcih4KSB7XHJcblx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMDE5NTI2LzExMjM2XHJcblx0XHRyZXR1cm4gL15cXGQrJC8udGVzdCh4KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHZhbGlkYXRlUGFydHMocGFydHMpIHtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0aWYgKCFpc1Bvc2l0aXZlSW50ZWdlcihwYXJ0c1tpXSkpIHtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuVmVyc2lvbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlZlcnNpb24uR1JFQVRFUl9USEFOXHRcdD0gMTtcclxuXHRXUEdNWkEuVmVyc2lvbi5FUVVBTF9UT1x0XHRcdD0gMDtcclxuXHRXUEdNWkEuVmVyc2lvbi5MRVNTX1RIQU5cdFx0PSAtMTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBDb21wYXJlIHR3byBzb2Z0d2FyZSB2ZXJzaW9uIG51bWJlcnMgKGUuZy4gMS43LjEpXHJcblx0ICogUmV0dXJuczpcclxuXHQgKlxyXG5cdCAqICAwIGlmIHRoZXkncmUgaWRlbnRpY2FsXHJcblx0ICogIG5lZ2F0aXZlIGlmIHYxIDwgdjJcclxuXHQgKiAgcG9zaXRpdmUgaWYgdjEgPiB2MlxyXG5cdCAqICBOYU4gaWYgdGhleSBpbiB0aGUgd3JvbmcgZm9ybWF0XHJcblx0ICpcclxuXHQgKiAgXCJVbml0IHRlc3RzXCI6IGh0dHA6Ly9qc2ZpZGRsZS5uZXQvcmlwcGVyMjM0L1h2OVdMLzI4L1xyXG5cdCAqXHJcblx0ICogIFRha2VuIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNjgzMjcyMS8xMTIzNlxyXG5cdCAqL1xyXG5cdFdQR01aQS5WZXJzaW9uLmNvbXBhcmUgPSBmdW5jdGlvbih2MSwgdjIpXHJcblx0e1xyXG5cdFx0dmFyIHYxcGFydHMgPSB2MS5tYXRjaCgvXFxkKy9nKTtcclxuXHRcdHZhciB2MnBhcnRzID0gdjIubWF0Y2goL1xcZCsvZyk7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB2MXBhcnRzLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdGlmICh2MnBhcnRzLmxlbmd0aCA9PT0gaSkge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZiAodjFwYXJ0c1tpXSA9PT0gdjJwYXJ0c1tpXSkge1xyXG5cdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmICh2MXBhcnRzW2ldID4gdjJwYXJ0c1tpXSkge1xyXG5cdFx0XHRcdHJldHVybiAxO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiAtMTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAodjFwYXJ0cy5sZW5ndGggIT0gdjJwYXJ0cy5sZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIC0xO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHJcbn0pOyJdLCJmaWxlIjoidmVyc2lvbi5qcyJ9


// js/v8/xml-cache-converter.js
/**
 * @namespace WPGMZA
 * @module XMLCacheConverter
 * @requires WPGMZA
 * @gulp-requires core.js
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
 * @gulp-requires core.js
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
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyIzcmQtcGFydHktaW50ZWdyYXRpb24vaW50ZWdyYXRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgSW50ZWdyYXRpb25cclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuSW50ZWdyYXRpb24gPSB7fTtcclxuXHRXUEdNWkEuaW50ZWdyYXRpb25Nb2R1bGVzID0ge307XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiM3JkLXBhcnR5LWludGVncmF0aW9uL2ludGVncmF0aW9uLmpzIn0=


// js/v8/3rd-party-integration/gutenberg/dist/gutenberg.js
"use strict";

/**
 * @namespace WPGMZA.Integration
 * @module Gutenberg
 * @requires WPGMZA.Integration
 * @requires wp-i18n
 * @requires wp-blocks
 * @requires wp-editor
 * @requires wp-components
 * @gulp-requires ../../../core.js
 */

/**
 * Internal block libraries
 */
jQuery(function ($) {

	if (!window.wp || !wp.i18n || !wp.blocks || !wp.editor || !wp.components) return;

	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var _wp$editor = wp.editor,
	    InspectorControls = _wp$editor.InspectorControls,
	    BlockControls = _wp$editor.BlockControls;
	var _wp$components = wp.components,
	    Dashicon = _wp$components.Dashicon,
	    Toolbar = _wp$components.Toolbar,
	    Button = _wp$components.Button,
	    Tooltip = _wp$components.Tooltip,
	    PanelBody = _wp$components.PanelBody,
	    TextareaControl = _wp$components.TextareaControl,
	    CheckboxControl = _wp$components.CheckboxControl,
	    TextControl = _wp$components.TextControl,
	    SelectControl = _wp$components.SelectControl,
	    RichText = _wp$components.RichText;


	WPGMZA.Integration.Gutenberg = function () {
		registerBlockType('gutenberg-wpgmza/block', this.getBlockDefinition());
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockTitle = function () {
		return __("WP Google Maps");
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockInspectorControls = function (props) {

		/*
  <TextControl
  				name="overrideWidthAmount"
  				label={__("Override Width Amount")}
  				checked={props.overrideWidthAmount}
  				onChange={onPropertiesChanged}
  				/>
  			
  			<SelectControl
  				name="overrideWidthUnits"
  				label={__("Override Width Units")}
  				options={[
  					{value: "px", label: "px"},
  					{value: "%", label: "%"},
  					{value: "vw`", label: "vw"},
  					{value: "vh", label: "vh"}
  				]}
  				onChange={onPropertiesChanged}
  				/>
  				
  			<CheckboxControl
  				name="overrideHeight"
  				label={__("Override Height")}
  				checked={props.overrideWidth}
  				onChange={onPropertiesChanged}
  				/>
  				
  			<TextControl
  				name="overrideHeightAmount"
  				label={__("Override Height Amount")}
  				checked={props.overrideWidthAmount}
  				onChange={onPropertiesChanged}
  				/>
  			
  			<SelectControl
  				name="overrideHeightUnits"
  				label={__("Override Height Units")}
  				options={[
  					{value: "px", label: "px"},
  					{value: "%", label: "%"},
  					{value: "vw`", label: "vw"},
  					{value: "vh", label: "vh"}
  				]}
  				onChange={onPropertiesChanged}
  				/>
  				*/

		var onOverrideWidthCheckboxChanged = function onOverrideWidthCheckboxChanged(value) {};

		return React.createElement(
			InspectorControls,
			{ key: "inspector" },
			React.createElement(
				PanelBody,
				{ title: __('Map Settings') },
				React.createElement(
					"p",
					{ "class": "map-block-gutenberg-button-container" },
					React.createElement(
						"a",
						{ href: WPGMZA.adminurl + "admin.php?page=wp-google-maps-menu&action=edit&map_id=1",
							target: "_blank",
							"class": "button button-primary" },
						React.createElement("i", { "class": "fa fa-pencil-square-o", "aria-hidden": "true" }),
						__('Go to Map Editor')
					)
				),
				React.createElement(
					"p",
					{ "class": "map-block-gutenberg-button-container" },
					React.createElement(
						"a",
						{ href: "https://www.wpgmaps.com/documentation/creating-your-first-map/",
							target: "_blank",
							"class": "button button-primary" },
						React.createElement("i", { "class": "fa fa-book", "aria-hidden": "true" }),
						__('View Documentation')
					)
				)
			)
		);
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockAttributes = function () {
		return {};
	};

	WPGMZA.Integration.Gutenberg.prototype.getBlockDefinition = function (props) {
		var _this = this;

		return {

			title: __("WP Google Maps"),
			description: __('The easiest to use Google Maps plugin! Create custom Google Maps with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.'),
			category: 'common',
			icon: 'location-alt',
			keywords: [__('Map'), __('Maps'), __('Google')],
			attributes: this.getBlockAttributes(),

			edit: function edit(props) {
				return [!!props.isSelected && _this.getBlockInspectorControls(props), React.createElement(
					"div",
					{ className: props.className + " wpgmza-gutenberg-block" },
					React.createElement(Dashicon, { icon: "location-alt" }),
					React.createElement(
						"span",
						{ "class": "wpgmza-gutenberg-block-title" },
						__("Your map will appear here on your websites front end")
					)
				)];
			},
			// Defining the front-end interface
			save: function save(props) {
				// Rendering in PHP
				return null;
			}

		};
	};

	WPGMZA.Integration.Gutenberg.getConstructor = function () {
		return WPGMZA.Integration.Gutenberg;
	};

	WPGMZA.Integration.Gutenberg.createInstance = function () {
		var constructor = WPGMZA.Integration.Gutenberg.getConstructor();
		return new constructor();
	};

	// Allow the Pro module to extend and create the module, only create here when Pro isn't loaded
	if(!WPGMZA.isProVersion() && !(/^6/.test(WPGMZA.pro_version))) WPGMZA.integrationModules.gutenberg = WPGMZA.Integration.Gutenberg.createInstance();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyIzcmQtcGFydHktaW50ZWdyYXRpb24vZ3V0ZW5iZXJnL2Rpc3QvZ3V0ZW5iZXJnLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBLkludGVncmF0aW9uXHJcbiAqIEBtb2R1bGUgR3V0ZW5iZXJnXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuSW50ZWdyYXRpb25cclxuICogQHJlcXVpcmVzIHdwLWkxOG5cclxuICogQHJlcXVpcmVzIHdwLWJsb2Nrc1xyXG4gKiBAcmVxdWlyZXMgd3AtZWRpdG9yXHJcbiAqIEByZXF1aXJlcyB3cC1jb21wb25lbnRzXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uLy4uLy4uL2NvcmUuanNcclxuICovXHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgYmxvY2sgbGlicmFyaWVzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24gKCQpIHtcclxuXHJcblx0aWYgKCF3aW5kb3cud3AgfHwgIXdwLmkxOG4gfHwgIXdwLmJsb2NrcyB8fCAhd3AuZWRpdG9yIHx8ICF3cC5jb21wb25lbnRzKSByZXR1cm47XHJcblxyXG5cdHZhciBfXyA9IHdwLmkxOG4uX187XHJcblx0dmFyIHJlZ2lzdGVyQmxvY2tUeXBlID0gd3AuYmxvY2tzLnJlZ2lzdGVyQmxvY2tUeXBlO1xyXG5cdHZhciBfd3AkZWRpdG9yID0gd3AuZWRpdG9yLFxyXG5cdCAgICBJbnNwZWN0b3JDb250cm9scyA9IF93cCRlZGl0b3IuSW5zcGVjdG9yQ29udHJvbHMsXHJcblx0ICAgIEJsb2NrQ29udHJvbHMgPSBfd3AkZWRpdG9yLkJsb2NrQ29udHJvbHM7XHJcblx0dmFyIF93cCRjb21wb25lbnRzID0gd3AuY29tcG9uZW50cyxcclxuXHQgICAgRGFzaGljb24gPSBfd3AkY29tcG9uZW50cy5EYXNoaWNvbixcclxuXHQgICAgVG9vbGJhciA9IF93cCRjb21wb25lbnRzLlRvb2xiYXIsXHJcblx0ICAgIEJ1dHRvbiA9IF93cCRjb21wb25lbnRzLkJ1dHRvbixcclxuXHQgICAgVG9vbHRpcCA9IF93cCRjb21wb25lbnRzLlRvb2x0aXAsXHJcblx0ICAgIFBhbmVsQm9keSA9IF93cCRjb21wb25lbnRzLlBhbmVsQm9keSxcclxuXHQgICAgVGV4dGFyZWFDb250cm9sID0gX3dwJGNvbXBvbmVudHMuVGV4dGFyZWFDb250cm9sLFxyXG5cdCAgICBDaGVja2JveENvbnRyb2wgPSBfd3AkY29tcG9uZW50cy5DaGVja2JveENvbnRyb2wsXHJcblx0ICAgIFRleHRDb250cm9sID0gX3dwJGNvbXBvbmVudHMuVGV4dENvbnRyb2wsXHJcblx0ICAgIFNlbGVjdENvbnRyb2wgPSBfd3AkY29tcG9uZW50cy5TZWxlY3RDb250cm9sLFxyXG5cdCAgICBSaWNoVGV4dCA9IF93cCRjb21wb25lbnRzLlJpY2hUZXh0O1xyXG5cclxuXHJcblx0V1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZyA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJlZ2lzdGVyQmxvY2tUeXBlKCdndXRlbmJlcmctd3BnbXphL2Jsb2NrJywgdGhpcy5nZXRCbG9ja0RlZmluaXRpb24oKSk7XHJcblx0fTtcclxuXHJcblx0V1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZy5wcm90b3R5cGUuZ2V0QmxvY2tUaXRsZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBfXyhcIldQIEdvb2dsZSBNYXBzXCIpO1xyXG5cdH07XHJcblxyXG5cdFdQR01aQS5JbnRlZ3JhdGlvbi5HdXRlbmJlcmcucHJvdG90eXBlLmdldEJsb2NrSW5zcGVjdG9yQ29udHJvbHMgPSBmdW5jdGlvbiAocHJvcHMpIHtcclxuXHJcblx0XHQvKlxyXG4gIDxUZXh0Q29udHJvbFxyXG4gIFx0XHRcdFx0bmFtZT1cIm92ZXJyaWRlV2lkdGhBbW91bnRcIlxyXG4gIFx0XHRcdFx0bGFiZWw9e19fKFwiT3ZlcnJpZGUgV2lkdGggQW1vdW50XCIpfVxyXG4gIFx0XHRcdFx0Y2hlY2tlZD17cHJvcHMub3ZlcnJpZGVXaWR0aEFtb3VudH1cclxuICBcdFx0XHRcdG9uQ2hhbmdlPXtvblByb3BlcnRpZXNDaGFuZ2VkfVxyXG4gIFx0XHRcdFx0Lz5cclxuICBcdFx0XHRcclxuICBcdFx0XHQ8U2VsZWN0Q29udHJvbFxyXG4gIFx0XHRcdFx0bmFtZT1cIm92ZXJyaWRlV2lkdGhVbml0c1wiXHJcbiAgXHRcdFx0XHRsYWJlbD17X18oXCJPdmVycmlkZSBXaWR0aCBVbml0c1wiKX1cclxuICBcdFx0XHRcdG9wdGlvbnM9e1tcclxuICBcdFx0XHRcdFx0e3ZhbHVlOiBcInB4XCIsIGxhYmVsOiBcInB4XCJ9LFxyXG4gIFx0XHRcdFx0XHR7dmFsdWU6IFwiJVwiLCBsYWJlbDogXCIlXCJ9LFxyXG4gIFx0XHRcdFx0XHR7dmFsdWU6IFwidndgXCIsIGxhYmVsOiBcInZ3XCJ9LFxyXG4gIFx0XHRcdFx0XHR7dmFsdWU6IFwidmhcIiwgbGFiZWw6IFwidmhcIn1cclxuICBcdFx0XHRcdF19XHJcbiAgXHRcdFx0XHRvbkNoYW5nZT17b25Qcm9wZXJ0aWVzQ2hhbmdlZH1cclxuICBcdFx0XHRcdC8+XHJcbiAgXHRcdFx0XHRcclxuICBcdFx0XHQ8Q2hlY2tib3hDb250cm9sXHJcbiAgXHRcdFx0XHRuYW1lPVwib3ZlcnJpZGVIZWlnaHRcIlxyXG4gIFx0XHRcdFx0bGFiZWw9e19fKFwiT3ZlcnJpZGUgSGVpZ2h0XCIpfVxyXG4gIFx0XHRcdFx0Y2hlY2tlZD17cHJvcHMub3ZlcnJpZGVXaWR0aH1cclxuICBcdFx0XHRcdG9uQ2hhbmdlPXtvblByb3BlcnRpZXNDaGFuZ2VkfVxyXG4gIFx0XHRcdFx0Lz5cclxuICBcdFx0XHRcdFxyXG4gIFx0XHRcdDxUZXh0Q29udHJvbFxyXG4gIFx0XHRcdFx0bmFtZT1cIm92ZXJyaWRlSGVpZ2h0QW1vdW50XCJcclxuICBcdFx0XHRcdGxhYmVsPXtfXyhcIk92ZXJyaWRlIEhlaWdodCBBbW91bnRcIil9XHJcbiAgXHRcdFx0XHRjaGVja2VkPXtwcm9wcy5vdmVycmlkZVdpZHRoQW1vdW50fVxyXG4gIFx0XHRcdFx0b25DaGFuZ2U9e29uUHJvcGVydGllc0NoYW5nZWR9XHJcbiAgXHRcdFx0XHQvPlxyXG4gIFx0XHRcdFxyXG4gIFx0XHRcdDxTZWxlY3RDb250cm9sXHJcbiAgXHRcdFx0XHRuYW1lPVwib3ZlcnJpZGVIZWlnaHRVbml0c1wiXHJcbiAgXHRcdFx0XHRsYWJlbD17X18oXCJPdmVycmlkZSBIZWlnaHQgVW5pdHNcIil9XHJcbiAgXHRcdFx0XHRvcHRpb25zPXtbXHJcbiAgXHRcdFx0XHRcdHt2YWx1ZTogXCJweFwiLCBsYWJlbDogXCJweFwifSxcclxuICBcdFx0XHRcdFx0e3ZhbHVlOiBcIiVcIiwgbGFiZWw6IFwiJVwifSxcclxuICBcdFx0XHRcdFx0e3ZhbHVlOiBcInZ3YFwiLCBsYWJlbDogXCJ2d1wifSxcclxuICBcdFx0XHRcdFx0e3ZhbHVlOiBcInZoXCIsIGxhYmVsOiBcInZoXCJ9XHJcbiAgXHRcdFx0XHRdfVxyXG4gIFx0XHRcdFx0b25DaGFuZ2U9e29uUHJvcGVydGllc0NoYW5nZWR9XHJcbiAgXHRcdFx0XHQvPlxyXG4gIFx0XHRcdFx0Ki9cclxuXHJcblx0XHR2YXIgb25PdmVycmlkZVdpZHRoQ2hlY2tib3hDaGFuZ2VkID0gZnVuY3Rpb24gb25PdmVycmlkZVdpZHRoQ2hlY2tib3hDaGFuZ2VkKHZhbHVlKSB7fTtcclxuXHJcblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcclxuXHRcdFx0SW5zcGVjdG9yQ29udHJvbHMsXHJcblx0XHRcdHsga2V5OiBcImluc3BlY3RvclwiIH0sXHJcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcblx0XHRcdFx0UGFuZWxCb2R5LFxyXG5cdFx0XHRcdHsgdGl0bGU6IF9fKCdNYXAgU2V0dGluZ3MnKSB9LFxyXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXHJcblx0XHRcdFx0XHRcInBcIixcclxuXHRcdFx0XHRcdHsgXCJjbGFzc1wiOiBcIm1hcC1ibG9jay1ndXRlbmJlcmctYnV0dG9uLWNvbnRhaW5lclwiIH0sXHJcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG5cdFx0XHRcdFx0XHRcImFcIixcclxuXHRcdFx0XHRcdFx0eyBocmVmOiBXUEdNWkEuYWRtaW51cmwgKyBcImFkbWluLnBocD9wYWdlPXdwLWdvb2dsZS1tYXBzLW1lbnUmYWN0aW9uPWVkaXQmbWFwX2lkPTFcIixcclxuXHRcdFx0XHRcdFx0XHR0YXJnZXQ6IFwiX2JsYW5rXCIsXHJcblx0XHRcdFx0XHRcdFx0XCJjbGFzc1wiOiBcImJ1dHRvbiBidXR0b24tcHJpbWFyeVwiIH0sXHJcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJpXCIsIHsgXCJjbGFzc1wiOiBcImZhIGZhLXBlbmNpbC1zcXVhcmUtb1wiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLFxyXG5cdFx0XHRcdFx0XHRfXygnR28gdG8gTWFwIEVkaXRvcicpXHJcblx0XHRcdFx0XHQpXHJcblx0XHRcdFx0KSxcclxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG5cdFx0XHRcdFx0XCJwXCIsXHJcblx0XHRcdFx0XHR7IFwiY2xhc3NcIjogXCJtYXAtYmxvY2stZ3V0ZW5iZXJnLWJ1dHRvbi1jb250YWluZXJcIiB9LFxyXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcclxuXHRcdFx0XHRcdFx0XCJhXCIsXHJcblx0XHRcdFx0XHRcdHsgaHJlZjogXCJodHRwczovL3d3dy53cGdtYXBzLmNvbS9kb2N1bWVudGF0aW9uL2NyZWF0aW5nLXlvdXItZmlyc3QtbWFwL1wiLFxyXG5cdFx0XHRcdFx0XHRcdHRhcmdldDogXCJfYmxhbmtcIixcclxuXHRcdFx0XHRcdFx0XHRcImNsYXNzXCI6IFwiYnV0dG9uIGJ1dHRvbi1wcmltYXJ5XCIgfSxcclxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcImlcIiwgeyBcImNsYXNzXCI6IFwiZmEgZmEtYm9va1wiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLFxyXG5cdFx0XHRcdFx0XHRfXygnVmlldyBEb2N1bWVudGF0aW9uJylcclxuXHRcdFx0XHRcdClcclxuXHRcdFx0XHQpXHJcblx0XHRcdClcclxuXHRcdCk7XHJcblx0fTtcclxuXHJcblx0V1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZy5wcm90b3R5cGUuZ2V0QmxvY2tBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHt9O1xyXG5cdH07XHJcblxyXG5cdFdQR01aQS5JbnRlZ3JhdGlvbi5HdXRlbmJlcmcucHJvdG90eXBlLmdldEJsb2NrRGVmaW5pdGlvbiA9IGZ1bmN0aW9uIChwcm9wcykge1xyXG5cdFx0dmFyIF90aGlzID0gdGhpcztcclxuXHJcblx0XHRyZXR1cm4ge1xyXG5cclxuXHRcdFx0dGl0bGU6IF9fKFwiV1AgR29vZ2xlIE1hcHNcIiksXHJcblx0XHRcdGRlc2NyaXB0aW9uOiBfXygnVGhlIGVhc2llc3QgdG8gdXNlIEdvb2dsZSBNYXBzIHBsdWdpbiEgQ3JlYXRlIGN1c3RvbSBHb29nbGUgTWFwcyB3aXRoIGhpZ2ggcXVhbGl0eSBtYXJrZXJzIGNvbnRhaW5pbmcgbG9jYXRpb25zLCBkZXNjcmlwdGlvbnMsIGltYWdlcyBhbmQgbGlua3MuIEFkZCB5b3VyIGN1c3RvbWl6ZWQgbWFwIHRvIHlvdXIgV29yZFByZXNzIHBvc3RzIGFuZC9vciBwYWdlcyBxdWlja2x5IGFuZCBlYXNpbHkgd2l0aCB0aGUgc3VwcGxpZWQgc2hvcnRjb2RlLiBObyBmdXNzLicpLFxyXG5cdFx0XHRjYXRlZ29yeTogJ2NvbW1vbicsXHJcblx0XHRcdGljb246ICdsb2NhdGlvbi1hbHQnLFxyXG5cdFx0XHRrZXl3b3JkczogW19fKCdNYXAnKSwgX18oJ01hcHMnKSwgX18oJ0dvb2dsZScpXSxcclxuXHRcdFx0YXR0cmlidXRlczogdGhpcy5nZXRCbG9ja0F0dHJpYnV0ZXMoKSxcclxuXHJcblx0XHRcdGVkaXQ6IGZ1bmN0aW9uIGVkaXQocHJvcHMpIHtcclxuXHRcdFx0XHRyZXR1cm4gWyEhcHJvcHMuaXNTZWxlY3RlZCAmJiBfdGhpcy5nZXRCbG9ja0luc3BlY3RvckNvbnRyb2xzKHByb3BzKSwgUmVhY3QuY3JlYXRlRWxlbWVudChcclxuXHRcdFx0XHRcdFwiZGl2XCIsXHJcblx0XHRcdFx0XHR7IGNsYXNzTmFtZTogcHJvcHMuY2xhc3NOYW1lICsgXCIgd3BnbXphLWd1dGVuYmVyZy1ibG9ja1wiIH0sXHJcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KERhc2hpY29uLCB7IGljb246IFwibG9jYXRpb24tYWx0XCIgfSksXHJcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxyXG5cdFx0XHRcdFx0XHRcInNwYW5cIixcclxuXHRcdFx0XHRcdFx0eyBcImNsYXNzXCI6IFwid3BnbXphLWd1dGVuYmVyZy1ibG9jay10aXRsZVwiIH0sXHJcblx0XHRcdFx0XHRcdF9fKFwiWW91ciBtYXAgd2lsbCBhcHBlYXIgaGVyZSBvbiB5b3VyIHdlYnNpdGVzIGZyb250IGVuZFwiKVxyXG5cdFx0XHRcdFx0KVxyXG5cdFx0XHRcdCldO1xyXG5cdFx0XHR9LFxyXG5cdFx0XHQvLyBEZWZpbmluZyB0aGUgZnJvbnQtZW5kIGludGVyZmFjZVxyXG5cdFx0XHRzYXZlOiBmdW5jdGlvbiBzYXZlKHByb3BzKSB7XHJcblx0XHRcdFx0Ly8gUmVuZGVyaW5nIGluIFBIUFxyXG5cdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHRXUEdNWkEuSW50ZWdyYXRpb24uR3V0ZW5iZXJnLmdldENvbnN0cnVjdG9yID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIFdQR01aQS5JbnRlZ3JhdGlvbi5HdXRlbmJlcmc7XHJcblx0fTtcclxuXHJcblx0V1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZy5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdHZhciBjb25zdHJ1Y3RvciA9IFdQR01aQS5JbnRlZ3JhdGlvbi5HdXRlbmJlcmcuZ2V0Q29uc3RydWN0b3IoKTtcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3IoKTtcclxuXHR9O1xyXG5cclxuXHQvLyBBbGxvdyB0aGUgUHJvIG1vZHVsZSB0byBleHRlbmQgYW5kIGNyZWF0ZSB0aGUgbW9kdWxlLCBvbmx5IGNyZWF0ZSBoZXJlIHdoZW4gUHJvIGlzbid0IGxvYWRlZFxyXG5cdGlmKCFXUEdNWkEuaXNQcm9WZXJzaW9uKCkgJiYgISgvXjYvLnRlc3QoV1BHTVpBLnByb192ZXJzaW9uKSkpIFdQR01aQS5pbnRlZ3JhdGlvbk1vZHVsZXMuZ3V0ZW5iZXJnID0gV1BHTVpBLkludGVncmF0aW9uLkd1dGVuYmVyZy5jcmVhdGVJbnN0YW5jZSgpO1xyXG59KTsiXSwiZmlsZSI6IjNyZC1wYXJ0eS1pbnRlZ3JhdGlvbi9ndXRlbmJlcmcvZGlzdC9ndXRlbmJlcmcuanMifQ==


// js/v8/compatibility/astra-theme-compatibility.js
/**
 * @namespace WPGMZA
 * @module AstraThemeCompatiblity
 * @requires WPGMZA
 * @gulp-requires ../core.js
 * @description Prevents the document.body.onclick handler firing for markers, which causes the Astra theme to throw an error, preventing the infowindow from opening
 */
jQuery(function($) {
	
	$(window).on("load", function(event) {
		
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wYXRpYmlsaXR5L2FzdHJhLXRoZW1lLWNvbXBhdGliaWxpdHkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgQXN0cmFUaGVtZUNvbXBhdGlibGl0eVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2NvcmUuanNcclxuICogQGRlc2NyaXB0aW9uIFByZXZlbnRzIHRoZSBkb2N1bWVudC5ib2R5Lm9uY2xpY2sgaGFuZGxlciBmaXJpbmcgZm9yIG1hcmtlcnMsIHdoaWNoIGNhdXNlcyB0aGUgQXN0cmEgdGhlbWUgdG8gdGhyb3cgYW4gZXJyb3IsIHByZXZlbnRpbmcgdGhlIGluZm93aW5kb3cgZnJvbSBvcGVuaW5nXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdCQod2luZG93KS5vbihcImxvYWRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFxyXG5cdFx0dmFyIHBhcmVudCA9IGRvY3VtZW50LmJvZHkub25jbGljaztcclxuXHRcdFxyXG5cdFx0aWYoIXBhcmVudClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRkb2N1bWVudC5ib2R5Lm9uY2xpY2sgPSBmdW5jdGlvbihldmVudClcclxuXHRcdHtcclxuXHRcdFx0aWYoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgV1BHTVpBLk1hcmtlcilcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFxyXG5cdFx0XHRwYXJlbnQoZXZlbnQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiY29tcGF0aWJpbGl0eS9hc3RyYS10aGVtZS1jb21wYXRpYmlsaXR5LmpzIn0=


// js/v8/compatibility/google-ui-compatibility.js
/**
 * @namespace WPGMZA
 * @module GoogleUICompatibility
 * @requires WPGMZA
 * @gulp-requires ../core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wYXRpYmlsaXR5L2dvb2dsZS11aS1jb21wYXRpYmlsaXR5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZVVJQ29tcGF0aWJpbGl0eVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2NvcmUuanNcclxuICovIFxyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVVSUNvbXBhdGliaWxpdHkgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGlzU2FmYXJpID0gbmF2aWdhdG9yLnZlbmRvciAmJiBuYXZpZ2F0b3IudmVuZG9yLmluZGV4T2YoJ0FwcGxlJykgPiAtMSAmJlxyXG5cdFx0XHRcdCAgIG5hdmlnYXRvci51c2VyQWdlbnQgJiZcclxuXHRcdFx0XHQgICBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0NyaU9TJykgPT0gLTEgJiZcclxuXHRcdFx0XHQgICBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0Z4aU9TJykgPT0gLTE7XHJcblx0XHRcclxuXHRcdGlmKCFpc1NhZmFyaSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIHN0eWxlID0gJChcIjxzdHlsZSBpZD0nd3BnbXphLWdvb2dsZS11aS1jb21wYXRpYmxpdHktZml4Jy8+XCIpO1xyXG5cdFx0XHRzdHlsZS5odG1sKFwiLndwZ216YV9tYXAgaW1nOm5vdChidXR0b24gaW1nKSB7IHBhZGRpbmc6MCAhaW1wb3J0YW50OyB9XCIpO1xyXG5cdFx0XHQkKGRvY3VtZW50LmhlYWQpLmFwcGVuZChzdHlsZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5nb29nbGVVSUNvbXBhdGliaWxpdHkgPSBuZXcgV1BHTVpBLkdvb2dsZVVJQ29tcGF0aWJpbGl0eSgpO1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6ImNvbXBhdGliaWxpdHkvZ29vZ2xlLXVpLWNvbXBhdGliaWxpdHkuanMifQ==


// js/v8/google-maps/google-circle.js
/**
 * @namespace WPGMZA
 * @module GoogleCircle
 * @requires WPGMZA.Circle
 * @gulp-requires ../circle.js
 */
jQuery(function($) {
	
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
		
		WPGMZA.Circle.call(this, options, googleCircle);
		
		if(googleCircle)
		{
			this.googleCircle = googleCircle;
		}
		else
		{
			this.googleCircle = new google.maps.Circle();
			this.googleCircle.wpgmzaCircle = this;
		}
		
		google.maps.event.addListener(this.googleCircle, "click", function() {
			self.dispatchEvent({type: "click"});
		});
		
		if(options)
			this.setOptions(options);
	}
	
	WPGMZA.GoogleCircle.prototype = Object.create(WPGMZA.Circle.prototype);
	WPGMZA.GoogleCircle.prototype.constructor = WPGMZA.GoogleCircle;
	
	WPGMZA.GoogleCircle.prototype.setCenter = function(center)
	{
		WPGMZA.Circle.prototype.setCenter.apply(this, arguments);
		
		this.googleCircle.setCenter(center);
	}
	
	WPGMZA.GoogleCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
		
		this.googleCircle.setRadius(parseFloat(radius) * 1000);
	}
	
	WPGMZA.GoogleCircle.prototype.setVisible = function(visible)
	{
		this.googleCircle.setVisible(visible ? true : false);
	}
	
	WPGMZA.GoogleCircle.prototype.setOptions = function(options)
	{
		var googleOptions = {};
		
		googleOptions = $.extend({}, options);
		delete googleOptions.map;
		delete googleOptions.center;
		
		if(options.center)
			googleOptions.center = new google.maps.LatLng({
				lat: parseFloat(options.center.lat),
				lng: parseFloat(options.center.lng)
			});
			
		if(options.radius)
			googleOptions.radius = parseFloat(options.radius);
		
		if(options.color)
			googleOptions.fillColor = options.color;
		
		if(options.opacity)
		{
			googleOptions.fillOpacity = parseFloat(options.opacity);
			googleOptions.strokeOpacity = parseFloat(options.opacity);

		}
		
		this.googleCircle.setOptions(googleOptions);
		
		if(options.map)
			options.map.addCircle(this);
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtY2lyY2xlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZUNpcmNsZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkNpcmNsZVxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9jaXJjbGUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogU3ViY2xhc3MsIHVzZWQgd2hlbiBHb29nbGUgaXMgdGhlIG1hcHMgZW5naW5lLiA8c3Ryb25nPlBsZWFzZSA8ZW0+ZG8gbm90PC9lbT4gY2FsbCB0aGlzIGNvbnN0cnVjdG9yIGRpcmVjdGx5LiBBbHdheXMgdXNlIGNyZWF0ZUluc3RhbmNlIHJhdGhlciB0aGFuIGluc3RhbnRpYXRpbmcgdGhpcyBjbGFzcyBkaXJlY3RseS48L3N0cm9uZz4gVXNpbmcgY3JlYXRlSW5zdGFuY2UgYWxsb3dzIHRoaXMgY2xhc3MgdG8gYmUgZXh0ZXJuYWxseSBleHRlbnNpYmxlLlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuR29vZ2xlQ2lyY2xlXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5Hb29nbGVDaXJjbGVcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQGF1Z21lbnRzIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAc2VlIFdQR01aQS5DaXJjbGUuY3JlYXRlSW5zdGFuY2VcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlQ2lyY2xlID0gZnVuY3Rpb24ob3B0aW9ucywgZ29vZ2xlQ2lyY2xlKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0V1BHTVpBLkNpcmNsZS5jYWxsKHRoaXMsIG9wdGlvbnMsIGdvb2dsZUNpcmNsZSk7XHJcblx0XHRcclxuXHRcdGlmKGdvb2dsZUNpcmNsZSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5nb29nbGVDaXJjbGUgPSBnb29nbGVDaXJjbGU7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlQ2lyY2xlID0gbmV3IGdvb2dsZS5tYXBzLkNpcmNsZSgpO1xyXG5cdFx0XHR0aGlzLmdvb2dsZUNpcmNsZS53cGdtemFDaXJjbGUgPSB0aGlzO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLmdvb2dsZUNpcmNsZSwgXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2VsZi5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcImNsaWNrXCJ9KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zKVxyXG5cdFx0XHR0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVDaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZUNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuR29vZ2xlQ2lyY2xlO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVDaXJjbGUucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uKGNlbnRlcilcclxuXHR7XHJcblx0XHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRDZW50ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVDaXJjbGUuc2V0Q2VudGVyKGNlbnRlcik7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVDaXJjbGUucHJvdG90eXBlLnNldFJhZGl1cyA9IGZ1bmN0aW9uKHJhZGl1cylcclxuXHR7XHJcblx0XHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVDaXJjbGUuc2V0UmFkaXVzKHBhcnNlRmxvYXQocmFkaXVzKSAqIDEwMDApO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlQ2lyY2xlLnByb3RvdHlwZS5zZXRWaXNpYmxlID0gZnVuY3Rpb24odmlzaWJsZSlcclxuXHR7XHJcblx0XHR0aGlzLmdvb2dsZUNpcmNsZS5zZXRWaXNpYmxlKHZpc2libGUgPyB0cnVlIDogZmFsc2UpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlQ2lyY2xlLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHR2YXIgZ29vZ2xlT3B0aW9ucyA9IHt9O1xyXG5cdFx0XHJcblx0XHRnb29nbGVPcHRpb25zID0gJC5leHRlbmQoe30sIG9wdGlvbnMpO1xyXG5cdFx0ZGVsZXRlIGdvb2dsZU9wdGlvbnMubWFwO1xyXG5cdFx0ZGVsZXRlIGdvb2dsZU9wdGlvbnMuY2VudGVyO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLmNlbnRlcilcclxuXHRcdFx0Z29vZ2xlT3B0aW9ucy5jZW50ZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHtcclxuXHRcdFx0XHRsYXQ6IHBhcnNlRmxvYXQob3B0aW9ucy5jZW50ZXIubGF0KSxcclxuXHRcdFx0XHRsbmc6IHBhcnNlRmxvYXQob3B0aW9ucy5jZW50ZXIubG5nKVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0XHJcblx0XHRpZihvcHRpb25zLnJhZGl1cylcclxuXHRcdFx0Z29vZ2xlT3B0aW9ucy5yYWRpdXMgPSBwYXJzZUZsb2F0KG9wdGlvbnMucmFkaXVzKTtcclxuXHRcdFxyXG5cdFx0aWYob3B0aW9ucy5jb2xvcilcclxuXHRcdFx0Z29vZ2xlT3B0aW9ucy5maWxsQ29sb3IgPSBvcHRpb25zLmNvbG9yO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLm9wYWNpdHkpXHJcblx0XHR7XHJcblx0XHRcdGdvb2dsZU9wdGlvbnMuZmlsbE9wYWNpdHkgPSBwYXJzZUZsb2F0KG9wdGlvbnMub3BhY2l0eSk7XHJcblx0XHRcdGdvb2dsZU9wdGlvbnMuc3Ryb2tlT3BhY2l0eSA9IHBhcnNlRmxvYXQob3B0aW9ucy5vcGFjaXR5KTtcclxuXHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuZ29vZ2xlQ2lyY2xlLnNldE9wdGlvbnMoZ29vZ2xlT3B0aW9ucyk7XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMubWFwKVxyXG5cdFx0XHRvcHRpb25zLm1hcC5hZGRDaXJjbGUodGhpcyk7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Imdvb2dsZS1tYXBzL2dvb2dsZS1jaXJjbGUuanMifQ==


// js/v8/google-maps/google-geocoder.js
/**
 * @namespace WPGMZA
 * @module GoogleGeocoder
 * @requires WPGMZA.Geocoder
 * @gulp-requires ../geocoder.js
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
		WPGMZA.Geocoder.call(this);
	}
	
	WPGMZA.GoogleGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.GoogleGeocoder.prototype.constructor = WPGMZA.GoogleGeocoder;
	
	WPGMZA.GoogleGeocoder.prototype.getGoogleGeocoder = function()
	{
		if(WPGMZA.CloudAPI && WPGMZA.CloudAPI.isBeingUsed)
			return new WPGMZA.CloudGeocoder();
		
		return new google.maps.Geocoder();
	}
	
	WPGMZA.GoogleGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(!options || !options.address)
			throw new Error("No address specified");
		
		if(WPGMZA.isLatLngString(options.address))
			return WPGMZA.Geocoder.prototype.getLatLngFromAddress.call(this, options, callback);
		
		if(options.country)
			options.componentRestrictions = {
				country: options.country
			};
		
		var geocoder = this.getGoogleGeocoder();
		
		geocoder.geocode(options, function(results, status) {
			
			if(status == google.maps.GeocoderStatus.OK || status == WPGMZA.CloudGeocoder.SUCCESS)
			{
				var location = results[0].geometry.location;
				var latLng, bounds = null;
				
				latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				
				if(bounds = results[0].geometry.bounds)
				{
					if(bounds instanceof google.maps.LatLngBounds)
						bounds = WPGMZA.LatLngBounds.fromGoogleLatLngBounds(results[0].geometry.bounds);
					else
						bounds = WPGMZA.LatLngBounds.fromGoogleLatLngBoundsLiteral(results[0].geometry.bounds);
				}
				
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
		var geocoder = this.getGoogleGeocoder();
		
		var options = $.extend(options, {
			location: {
				lat: latLng.lat,
				lng: latLng.lng
			}
		});
		delete options.latLng;
		
		geocoder.geocode(options, function(results, status) {
			
			if(status !== "OK")
				callback(null, WPGMZA.Geocoder.FAIL);
			
			if(!results || !results.length)
				callback([], WPGMZA.Geocoder.NO_RESULTS);
			
			callback([results[0].formatted_address], WPGMZA.Geocoder.SUCCESS);
			
		});
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtZ2VvY29kZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlR2VvY29kZXJcclxuICogQHJlcXVpcmVzIFdQR01aQS5HZW9jb2RlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9nZW9jb2Rlci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBTdWJjbGFzcywgdXNlZCB3aGVuIEdvb2dsZSBpcyB0aGUgbWFwcyBlbmdpbmUuIDxzdHJvbmc+UGxlYXNlIDxlbT5kbyBub3Q8L2VtPiBjYWxsIHRoaXMgY29uc3RydWN0b3IgZGlyZWN0bHkuIEFsd2F5cyB1c2UgY3JlYXRlSW5zdGFuY2UgcmF0aGVyIHRoYW4gaW5zdGFudGlhdGluZyB0aGlzIGNsYXNzIGRpcmVjdGx5Ljwvc3Ryb25nPiBVc2luZyBjcmVhdGVJbnN0YW5jZSBhbGxvd3MgdGhpcyBjbGFzcyB0byBiZSBleHRlcm5hbGx5IGV4dGVuc2libGUuXHJcblx0ICogQGNsYXNzIFdQR01aQS5Hb29nbGVHZW9jb2RlclxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuR29vZ2xlR2VvY29kZXJcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQGF1Z21lbnRzIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqIEBzZWUgV1BHTVpBLkdlb2NvZGVyLmNyZWF0ZUluc3RhbmNlXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZUdlb2NvZGVyID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdFdQR01aQS5HZW9jb2Rlci5jYWxsKHRoaXMpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlR2VvY29kZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuR2VvY29kZXIucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuR29vZ2xlR2VvY29kZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLkdvb2dsZUdlb2NvZGVyO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVHZW9jb2Rlci5wcm90b3R5cGUuZ2V0R29vZ2xlR2VvY29kZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoV1BHTVpBLkNsb3VkQVBJICYmIFdQR01aQS5DbG91ZEFQSS5pc0JlaW5nVXNlZClcclxuXHRcdFx0cmV0dXJuIG5ldyBXUEdNWkEuQ2xvdWRHZW9jb2RlcigpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVHZW9jb2Rlci5wcm90b3R5cGUuZ2V0TGF0TG5nRnJvbUFkZHJlc3MgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaylcclxuXHR7XHJcblx0XHRpZighb3B0aW9ucyB8fCAhb3B0aW9ucy5hZGRyZXNzKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBhZGRyZXNzIHNwZWNpZmllZFwiKTtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLmlzTGF0TG5nU3RyaW5nKG9wdGlvbnMuYWRkcmVzcykpXHJcblx0XHRcdHJldHVybiBXUEdNWkEuR2VvY29kZXIucHJvdG90eXBlLmdldExhdExuZ0Zyb21BZGRyZXNzLmNhbGwodGhpcywgb3B0aW9ucywgY2FsbGJhY2spO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLmNvdW50cnkpXHJcblx0XHRcdG9wdGlvbnMuY29tcG9uZW50UmVzdHJpY3Rpb25zID0ge1xyXG5cdFx0XHRcdGNvdW50cnk6IG9wdGlvbnMuY291bnRyeVxyXG5cdFx0XHR9O1xyXG5cdFx0XHJcblx0XHR2YXIgZ2VvY29kZXIgPSB0aGlzLmdldEdvb2dsZUdlb2NvZGVyKCk7XHJcblx0XHRcclxuXHRcdGdlb2NvZGVyLmdlb2NvZGUob3B0aW9ucywgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0sgfHwgc3RhdHVzID09IFdQR01aQS5DbG91ZEdlb2NvZGVyLlNVQ0NFU1MpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgbG9jYXRpb24gPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uO1xyXG5cdFx0XHRcdHZhciBsYXRMbmcsIGJvdW5kcyA9IG51bGw7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bGF0TG5nID0ge1xyXG5cdFx0XHRcdFx0bGF0OiBsb2NhdGlvbi5sYXQoKSxcclxuXHRcdFx0XHRcdGxuZzogbG9jYXRpb24ubG5nKClcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGJvdW5kcyA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkuYm91bmRzKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGlmKGJvdW5kcyBpbnN0YW5jZW9mIGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcylcclxuXHRcdFx0XHRcdFx0Ym91bmRzID0gV1BHTVpBLkxhdExuZ0JvdW5kcy5mcm9tR29vZ2xlTGF0TG5nQm91bmRzKHJlc3VsdHNbMF0uZ2VvbWV0cnkuYm91bmRzKTtcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0Ym91bmRzID0gV1BHTVpBLkxhdExuZ0JvdW5kcy5mcm9tR29vZ2xlTGF0TG5nQm91bmRzTGl0ZXJhbChyZXN1bHRzWzBdLmdlb21ldHJ5LmJvdW5kcyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciByZXN1bHRzID0gW1xyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRnZW9tZXRyeToge1xyXG5cdFx0XHRcdFx0XHRcdGxvY2F0aW9uOiBsYXRMbmdcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0bGF0TG5nOiBsYXRMbmcsXHJcblx0XHRcdFx0XHRcdGxhdDogbGF0TG5nLmxhdCxcclxuXHRcdFx0XHRcdFx0bG5nOiBsYXRMbmcubG5nLFxyXG5cdFx0XHRcdFx0XHRib3VuZHM6IGJvdW5kc1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdF07XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Y2FsbGJhY2socmVzdWx0cywgV1BHTVpBLkdlb2NvZGVyLlNVQ0NFU1MpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBuYXRpdmVTdGF0dXMgPSBXUEdNWkEuR2VvY29kZXIuRkFJTDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuWkVST19SRVNVTFRTKVxyXG5cdFx0XHRcdFx0bmF0aXZlU3RhdHVzID0gV1BHTVpBLkdlb2NvZGVyLlpFUk9fUkVTVUxUUztcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjYWxsYmFjayhudWxsLCBuYXRpdmVTdGF0dXMpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUdlb2NvZGVyLnByb3RvdHlwZS5nZXRBZGRyZXNzRnJvbUxhdExuZyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKVxyXG5cdHtcclxuXHRcdGlmKCFvcHRpb25zIHx8ICFvcHRpb25zLmxhdExuZylcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gbGF0TG5nIHNwZWNpZmllZFwiKTtcclxuXHRcdFxyXG5cdFx0dmFyIGxhdExuZyA9IG5ldyBXUEdNWkEuTGF0TG5nKG9wdGlvbnMubGF0TG5nKTtcclxuXHRcdHZhciBnZW9jb2RlciA9IHRoaXMuZ2V0R29vZ2xlR2VvY29kZXIoKTtcclxuXHRcdFxyXG5cdFx0dmFyIG9wdGlvbnMgPSAkLmV4dGVuZChvcHRpb25zLCB7XHJcblx0XHRcdGxvY2F0aW9uOiB7XHJcblx0XHRcdFx0bGF0OiBsYXRMbmcubGF0LFxyXG5cdFx0XHRcdGxuZzogbGF0TG5nLmxuZ1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGRlbGV0ZSBvcHRpb25zLmxhdExuZztcclxuXHRcdFxyXG5cdFx0Z2VvY29kZXIuZ2VvY29kZShvcHRpb25zLCBmdW5jdGlvbihyZXN1bHRzLCBzdGF0dXMpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHN0YXR1cyAhPT0gXCJPS1wiKVxyXG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIFdQR01aQS5HZW9jb2Rlci5GQUlMKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKCFyZXN1bHRzIHx8ICFyZXN1bHRzLmxlbmd0aClcclxuXHRcdFx0XHRjYWxsYmFjayhbXSwgV1BHTVpBLkdlb2NvZGVyLk5PX1JFU1VMVFMpO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2FsbGJhY2soW3Jlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NdLCBXUEdNWkEuR2VvY29kZXIuU1VDQ0VTUyk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Imdvb2dsZS1tYXBzL2dvb2dsZS1nZW9jb2Rlci5qcyJ9


// js/v8/google-maps/google-html-overlay.js
/**
 * @namespace WPGMZA
 * @module GoogleHTMLOverlay
 * @gulp-requires ../core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtaHRtbC1vdmVybGF5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZUhUTUxPdmVybGF5XHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2NvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2phdmFzY3JpcHQvY3VzdG9tb3ZlcmxheXNcclxuXHRcclxuXHRpZihXUEdNWkEuc2V0dGluZ3MuZW5naW5lICYmIFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgIT0gXCJnb29nbGUtbWFwc1wiKVxyXG5cdFx0cmV0dXJuO1xyXG5cdFxyXG5cdGlmKCF3aW5kb3cuZ29vZ2xlIHx8ICF3aW5kb3cuZ29vZ2xlLm1hcHMpXHJcblx0XHRyZXR1cm47XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUhUTUxPdmVybGF5ID0gZnVuY3Rpb24obWFwKVxyXG5cdHtcclxuXHRcdHRoaXMuZWxlbWVudFx0PSAkKFwiPGRpdiBjbGFzcz0nd3BnbXphLWdvb2dsZS1odG1sLW92ZXJsYXknPjwvZGl2PlwiKTtcclxuXHRcdFxyXG5cdFx0dGhpcy52aXNpYmxlXHQ9IHRydWU7XHJcblx0XHR0aGlzLnBvc2l0aW9uXHQ9IG5ldyBXUEdNWkEuTGF0TG5nKCk7XHJcblx0XHRcclxuXHRcdHRoaXMuc2V0TWFwKG1hcC5nb29nbGVNYXApO1xyXG5cdFx0dGhpcy53cGdtemFNYXAgPSBtYXA7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVIVE1MT3ZlcmxheS5wcm90b3R5cGUgPSBuZXcgZ29vZ2xlLm1hcHMuT3ZlcmxheVZpZXcoKTtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLm9uQWRkID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYW5lcyA9IHRoaXMuZ2V0UGFuZXMoKTtcclxuXHRcdHBhbmVzLm92ZXJsYXlNb3VzZVRhcmdldC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRbMF0pO1xyXG5cdFx0XHJcblx0XHQvKmdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHRoaXMuZWxlbWVudCwgXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHR9KTsqL1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLm9uUmVtb3ZlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGlmKHRoaXMuZWxlbWVudCAmJiAkKHRoaXMuZWxlbWVudCkucGFyZW50KCkubGVuZ3RoKVxyXG5cdFx0e1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkucmVtb3ZlKCk7XHJcblx0XHRcdHRoaXMuZWxlbWVudCA9IG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVIVE1MT3ZlcmxheS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR0aGlzLnVwZGF0ZUVsZW1lbnRQb3NpdGlvbigpO1xyXG5cdH1cclxuXHRcclxuXHQvKldQR01aQS5Hb29nbGVIVE1MT3ZlcmxheS5wcm90b3R5cGUuc2V0TWFwID0gZnVuY3Rpb24obWFwKVxyXG5cdHtcclxuXHRcdGlmKCEobWFwIGluc3RhbmNlb2YgV1BHTVpBLk1hcCkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk1hcCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXBcIik7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLk92ZXJsYXlWaWV3LnByb3RvdHlwZS5zZXRNYXAuY2FsbCh0aGlzLCBtYXAuZ29vZ2xlTWFwKTtcclxuXHRcdFxyXG5cdFx0dGhpcy53cGdtemFNYXAgPSBtYXA7XHJcblx0fSovXHJcblx0XHJcblx0LypXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLmdldFZpc2libGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuICQodGhpcy5lbGVtZW50KS5jc3MoXCJkaXNwbGF5XCIpICE9IFwibm9uZVwiO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdCQodGhpcy5lbGVtZW50KS5jc3Moe1xyXG5cdFx0XHRcImRpc3BsYXlcIjogKHZpc2libGUgPyBcImJsb2NrXCIgOiBcIm5vbmVcIilcclxuXHRcdH0pO1xyXG5cdH0qL1xyXG5cdFxyXG5cdC8qV1BHTVpBLkdvb2dsZUhUTUxPdmVybGF5LnByb3RvdHlwZS5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5MYXRMbmcodGhpcy5wb3NpdGlvbik7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVIVE1MT3ZlcmxheS5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihwb3NpdGlvbilcclxuXHR7XHJcblx0XHRpZighKHBvc2l0aW9uIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZykpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLkxhdExuZ1wiKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdFx0dGhpcy51cGRhdGVFbGVtZW50UG9zaXRpb24oKTtcclxuXHR9Ki9cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLnVwZGF0ZUVsZW1lbnRQb3NpdGlvbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQvL3ZhciBwaXhlbHMgPSB0aGlzLndwZ216YU1hcC5sYXRMbmdUb1BpeGVscyh0aGlzLnBvc2l0aW9uKTtcclxuXHRcdFxyXG5cdFx0dmFyIHByb2plY3Rpb24gPSB0aGlzLmdldFByb2plY3Rpb24oKTtcclxuXHRcdFxyXG5cdFx0aWYoIXByb2plY3Rpb24pXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dmFyIHBpeGVscyA9IHByb2plY3Rpb24uZnJvbUxhdExuZ1RvRGl2UGl4ZWwodGhpcy5wb3NpdGlvbi50b0dvb2dsZUxhdExuZygpKTtcclxuXHRcdFxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmNzcyh7XHJcblx0XHRcdFwibGVmdFwiOiBwaXhlbHMueCxcclxuXHRcdFx0XCJ0b3BcIjogcGl4ZWxzLnlcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtaHRtbC1vdmVybGF5LmpzIn0=


// js/v8/google-maps/google-info-window.js
/**
 * @namespace WPGMZA
 * @module GoogleInfoWindow
 * @requires WPGMZA.InfoWindow
 * @gulp-requires ../info-window.js
 * @pro-requires WPGMZA.ProInfoWindow
 * @gulp-pro-requires pro-info-window.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleInfoWindow = function(mapObject)
	{
		Parent.call(this, mapObject);
		
		this.setMapObject(mapObject);
	}
	
	WPGMZA.GoogleInfoWindow.Z_INDEX		= 99;
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleInfoWindow.prototype.constructor = WPGMZA.GoogleInfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype.setMapObject = function(mapObject)
	{
		if(mapObject instanceof WPGMZA.Marker)
			this.googleObject = mapObject.googleMarker;
		else if(mapObject instanceof WPGMZA.Polygon)
			this.googleObject = mapObject.googlePolygon;
		else if(mapObject instanceof WPGMZA.Polyline)
			this.googleObject = mapObject.googlePolyline;
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
			self.trigger("infowindowclose");
			
		});
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.GoogleInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		if(!Parent.prototype.open.call(this, map, mapObject))
			return false;
		
		// Set parent for events to bubble up to
		this.parent = map;
		
		this.createGoogleInfoWindow();
		this.setMapObject(mapObject);

		if(this.googleObject instanceof google.maps.Polygon)
		{

		}
		else{
			this.googleInfoWindow.open(
				this.mapObject.map.googleMap,
				this.googleObject
			);
		}
		

		
		var guid = WPGMZA.guid();
		var html = "<div id='" + guid + "'>" + this.content + "</div>";

		this.googleInfoWindow.setContent(html);
		
		var intervalID;
		intervalID = setInterval(function(event) {
			
			div = $("#" + guid);
			
			if(div.length)
			{
				clearInterval(intervalID);
				
				div[0].wpgmzaMapObject = self.mapObject;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtaW5mby13aW5kb3cuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlSW5mb1dpbmRvd1xyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkluZm9XaW5kb3dcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vaW5mby13aW5kb3cuanNcclxuICogQHByby1yZXF1aXJlcyBXUEdNWkEuUHJvSW5mb1dpbmRvd1xyXG4gKiBAZ3VscC1wcm8tcmVxdWlyZXMgcHJvLWluZm8td2luZG93LmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdHZhciBQYXJlbnQ7XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cgPSBmdW5jdGlvbihtYXBPYmplY3QpXHJcblx0e1xyXG5cdFx0UGFyZW50LmNhbGwodGhpcywgbWFwT2JqZWN0KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZXRNYXBPYmplY3QobWFwT2JqZWN0KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cuWl9JTkRFWFx0XHQ9IDk5O1xyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9JbmZvV2luZG93O1xyXG5cdGVsc2VcclxuXHRcdFBhcmVudCA9IFdQR01aQS5JbmZvV2luZG93O1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVJbmZvV2luZG93LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGFyZW50LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLkdvb2dsZUluZm9XaW5kb3c7XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cucHJvdG90eXBlLnNldE1hcE9iamVjdCA9IGZ1bmN0aW9uKG1hcE9iamVjdClcclxuXHR7XHJcblx0XHRpZihtYXBPYmplY3QgaW5zdGFuY2VvZiBXUEdNWkEuTWFya2VyKVxyXG5cdFx0XHR0aGlzLmdvb2dsZU9iamVjdCA9IG1hcE9iamVjdC5nb29nbGVNYXJrZXI7XHJcblx0XHRlbHNlIGlmKG1hcE9iamVjdCBpbnN0YW5jZW9mIFdQR01aQS5Qb2x5Z29uKVxyXG5cdFx0XHR0aGlzLmdvb2dsZU9iamVjdCA9IG1hcE9iamVjdC5nb29nbGVQb2x5Z29uO1xyXG5cdFx0ZWxzZSBpZihtYXBPYmplY3QgaW5zdGFuY2VvZiBXUEdNWkEuUG9seWxpbmUpXHJcblx0XHRcdHRoaXMuZ29vZ2xlT2JqZWN0ID0gbWFwT2JqZWN0Lmdvb2dsZVBvbHlsaW5lO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSW5mb1dpbmRvdy5wcm90b3R5cGUuY3JlYXRlR29vZ2xlSW5mb1dpbmRvdyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuZ29vZ2xlSW5mb1dpbmRvdylcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZUluZm9XaW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdygpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZUluZm9XaW5kb3cuc2V0WkluZGV4KFdQR01aQS5Hb29nbGVJbmZvV2luZG93LlpfSU5ERVgpO1xyXG5cdFx0XHJcblx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLmdvb2dsZUluZm9XaW5kb3csIFwiZG9tcmVhZHlcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi50cmlnZ2VyKFwiZG9tcmVhZHlcIik7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5nb29nbGVJbmZvV2luZG93LCBcImNsb3NlY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHNlbGYuc3RhdGUgPT0gV1BHTVpBLkluZm9XaW5kb3cuU1RBVEVfQ0xPU0VEKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYuc3RhdGUgPSBXUEdNWkEuSW5mb1dpbmRvdy5TVEFURV9DTE9TRUQ7XHJcblx0XHRcdHNlbGYudHJpZ2dlcihcImluZm93aW5kb3djbG9zZVwiKTtcclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogT3BlbnMgdGhlIGluZm8gd2luZG93XHJcblx0ICogQHJldHVybiBib29sZWFuIEZBTFNFIGlmIHRoZSBpbmZvIHdpbmRvdyBzaG91bGQgbm90ICYgd2lsbCBub3Qgb3BlbiwgVFJVRSBpZiBpdCB3aWxsXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZUluZm9XaW5kb3cucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbihtYXAsIG1hcE9iamVjdClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGlmKCFQYXJlbnQucHJvdG90eXBlLm9wZW4uY2FsbCh0aGlzLCBtYXAsIG1hcE9iamVjdCkpXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFxyXG5cdFx0Ly8gU2V0IHBhcmVudCBmb3IgZXZlbnRzIHRvIGJ1YmJsZSB1cCB0b1xyXG5cdFx0dGhpcy5wYXJlbnQgPSBtYXA7XHJcblx0XHRcclxuXHRcdHRoaXMuY3JlYXRlR29vZ2xlSW5mb1dpbmRvdygpO1xyXG5cdFx0dGhpcy5zZXRNYXBPYmplY3QobWFwT2JqZWN0KTtcclxuXHJcblx0XHRpZih0aGlzLmdvb2dsZU9iamVjdCBpbnN0YW5jZW9mIGdvb2dsZS5tYXBzLlBvbHlnb24pXHJcblx0XHR7XHJcblxyXG5cdFx0fVxyXG5cdFx0ZWxzZXtcclxuXHRcdFx0dGhpcy5nb29nbGVJbmZvV2luZG93Lm9wZW4oXHJcblx0XHRcdFx0dGhpcy5tYXBPYmplY3QubWFwLmdvb2dsZU1hcCxcclxuXHRcdFx0XHR0aGlzLmdvb2dsZU9iamVjdFxyXG5cdFx0XHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblxyXG5cdFx0XHJcblx0XHR2YXIgZ3VpZCA9IFdQR01aQS5ndWlkKCk7XHJcblx0XHR2YXIgaHRtbCA9IFwiPGRpdiBpZD0nXCIgKyBndWlkICsgXCInPlwiICsgdGhpcy5jb250ZW50ICsgXCI8L2Rpdj5cIjtcclxuXHJcblx0XHR0aGlzLmdvb2dsZUluZm9XaW5kb3cuc2V0Q29udGVudChodG1sKTtcclxuXHRcdFxyXG5cdFx0dmFyIGludGVydmFsSUQ7XHJcblx0XHRpbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdGRpdiA9ICQoXCIjXCIgKyBndWlkKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGRpdi5sZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRjbGVhckludGVydmFsKGludGVydmFsSUQpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGRpdlswXS53cGdtemFNYXBPYmplY3QgPSBzZWxmLm1hcE9iamVjdDtcclxuXHRcdFx0XHRkaXYuYWRkQ2xhc3MoXCJ3cGdtemEtaW5mb3dpbmRvd1wiKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRzZWxmLmVsZW1lbnQgPSBkaXZbMF07XHJcblx0XHRcdFx0c2VsZi50cmlnZ2VyKFwiaW5mb3dpbmRvd29wZW5cIik7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHR9LCA1MCk7XHJcblx0XHRcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSW5mb1dpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoIXRoaXMuZ29vZ2xlSW5mb1dpbmRvdylcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuSW5mb1dpbmRvdy5wcm90b3R5cGUuY2xvc2UuY2FsbCh0aGlzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVJbmZvV2luZG93LmNsb3NlKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVJbmZvV2luZG93LnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24oaHRtbClcclxuXHR7XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnNldENvbnRlbnQuY2FsbCh0aGlzLCBodG1sKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jb250ZW50ID0gaHRtbDtcclxuXHRcdFxyXG5cdFx0dGhpcy5jcmVhdGVHb29nbGVJbmZvV2luZG93KCk7XHJcblx0XHRcclxuXHRcdHRoaXMuZ29vZ2xlSW5mb1dpbmRvdy5zZXRDb250ZW50KGh0bWwpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSW5mb1dpbmRvdy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpXHJcblx0e1xyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5zZXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblx0XHRcclxuXHRcdHRoaXMuY3JlYXRlR29vZ2xlSW5mb1dpbmRvdygpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZUluZm9XaW5kb3cuc2V0T3B0aW9ucyhvcHRpb25zKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiZ29vZ2xlLW1hcHMvZ29vZ2xlLWluZm8td2luZG93LmpzIn0=


// js/v8/google-maps/google-map.js
/**
 * @namespace WPGMZA
 * @module GoogleMap
 * @requires WPGMZA.Map
 * @gulp-requires ../map.js
 * @pro-requires WPGMZA.ProMap
 * @gulp-pro-requires pro-map.js
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
		
		if(!window.google)
		{
			var status = WPGMZA.googleAPIStatus;
			var message = "Google API not loaded";
			
			if(status && status.message)
				message += " - " + status.message;
			
			if(status.code == "USER_CONSENT_NOT_GIVEN")
			{
				return;
			}
			
			$(element).html("<div class='notice notice-error'><p>" + WPGMZA.localized_strings.google_api_not_loaded + "<pre>" + message + "</pre></p></div>");
			
			throw new Error(message);
		}
		
		this.loadGoogleMap();
		
		if(options)
			this.setOptions(options, true);

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
		if(this.settings.transport == 1)
			this.enablePublicTransportLayer(true);
		this.showPointsOfInterest(this.settings.show_point_of_interest);
		
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
		
		if(this.settings.hide_point_of_interest == "1")
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
	WPGMZA.GoogleMap.prototype.getBounds = function()
	{
		var bounds = this.googleMap.getBounds();
		var northEast = bounds.getNorthEast();
		var southWest = bounds.getSouthWest();
		
		var nativeBounds = new WPGMZA.LatLngBounds({});
		
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
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtbWFwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZU1hcFxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1hcFxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9tYXAuanNcclxuICogQHByby1yZXF1aXJlcyBXUEdNWkEuUHJvTWFwXHJcbiAqIEBndWxwLXByby1yZXF1aXJlcyBwcm8tbWFwLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdHZhciBQYXJlbnQ7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0gZWxlbWVudCB0byBjb250YWluIHRoZSBtYXBcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucylcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFBhcmVudC5jYWxsKHRoaXMsIGVsZW1lbnQsIG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHRpZighd2luZG93Lmdvb2dsZSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIHN0YXR1cyA9IFdQR01aQS5nb29nbGVBUElTdGF0dXM7XHJcblx0XHRcdHZhciBtZXNzYWdlID0gXCJHb29nbGUgQVBJIG5vdCBsb2FkZWRcIjtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHN0YXR1cyAmJiBzdGF0dXMubWVzc2FnZSlcclxuXHRcdFx0XHRtZXNzYWdlICs9IFwiIC0gXCIgKyBzdGF0dXMubWVzc2FnZTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHN0YXR1cy5jb2RlID09IFwiVVNFUl9DT05TRU5UX05PVF9HSVZFTlwiKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHQkKGVsZW1lbnQpLmh0bWwoXCI8ZGl2IGNsYXNzPSdub3RpY2Ugbm90aWNlLWVycm9yJz48cD5cIiArIFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5nb29nbGVfYXBpX25vdF9sb2FkZWQgKyBcIjxwcmU+XCIgKyBtZXNzYWdlICsgXCI8L3ByZT48L3A+PC9kaXY+XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmxvYWRHb29nbGVNYXAoKTtcclxuXHRcdFxyXG5cdFx0aWYob3B0aW9ucylcclxuXHRcdFx0dGhpcy5zZXRPcHRpb25zKG9wdGlvbnMsIHRydWUpO1xyXG5cclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFwLCBcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHZhciB3cGdtemFFdmVudCA9IG5ldyBXUEdNWkEuRXZlbnQoXCJjbGlja1wiKTtcclxuXHRcdFx0d3BnbXphRXZlbnQubGF0TG5nID0ge1xyXG5cdFx0XHRcdGxhdDogZXZlbnQubGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogZXZlbnQubGF0TG5nLmxuZygpXHJcblx0XHRcdH07XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudCh3cGdtemFFdmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5nb29nbGVNYXAsIFwicmlnaHRjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHR2YXIgd3BnbXphRXZlbnQgPSBuZXcgV1BHTVpBLkV2ZW50KFwicmlnaHRjbGlja1wiKTtcclxuXHRcdFx0d3BnbXphRXZlbnQubGF0TG5nID0ge1xyXG5cdFx0XHRcdGxhdDogZXZlbnQubGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogZXZlbnQubGF0TG5nLmxuZygpXHJcblx0XHRcdH07XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudCh3cGdtemFFdmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5nb29nbGVNYXAsIFwiZHJhZ2VuZFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJkcmFnZW5kXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFwLCBcInpvb21fY2hhbmdlZFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJ6b29tX2NoYW5nZWRcIik7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudChcInpvb21jaGFuZ2VkXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIElkbGUgZXZlbnRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFwLCBcImlkbGVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbklkbGUoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIERpc3BhdGNoIGV2ZW50XHJcblx0XHRpZighV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnRyaWdnZXIoXCJpbml0XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KFwiY3JlYXRlZFwiKTtcclxuXHRcdFx0V1BHTVpBLmV2ZW50cy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcIm1hcGNyZWF0ZWRcIiwgbWFwOiB0aGlzfSk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBMZWdhY3kgZXZlbnRcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLnRyaWdnZXIoXCJ3cGdvb2dsZW1hcHNfbG9hZGVkXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyBJZiB3ZSdyZSBydW5uaW5nIHRoZSBQcm8gdmVyc2lvbiwgaW5oZXJpdCBmcm9tIFByb01hcCwgb3RoZXJ3aXNlLCBpbmhlcml0IGZyb20gTWFwXHJcblx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdHtcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9NYXA7XHJcblx0XHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLlByb01hcC5wcm90b3R5cGUpO1xyXG5cdH1cclxuXHRlbHNlXHJcblx0e1xyXG5cdFx0UGFyZW50ID0gV1BHTVpBLk1hcDtcclxuXHRcdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTWFwLnByb3RvdHlwZSk7XHJcblx0fVxyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLkdvb2dsZU1hcDtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFwLnBhcnNlVGhlbWVEYXRhID0gZnVuY3Rpb24ocmF3KVxyXG5cdHtcclxuXHRcdHZhciBqc29uO1xyXG5cdFx0XHJcblx0XHR0cnl7XHJcblx0XHRcdGpzb24gPSBKU09OLnBhcnNlKHJhdyk7XHQvLyBUcnkgdG8gcGFyc2Ugc3RyaWN0IEpTT05cclxuXHRcdH1jYXRjaChlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR0cnl7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0anNvbiA9IGV2YWwocmF3KTtcdC8vIFRyeSB0byBwYXJzZSBKUyBvYmplY3RcclxuXHRcdFx0XHRcclxuXHRcdFx0fWNhdGNoKGUpIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgc3RyID0gcmF3O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9cXFxcJy9nLCAnXFwnJyk7XHJcblx0XHRcdFx0c3RyID0gc3RyLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKTtcclxuXHRcdFx0XHRzdHIgPSBzdHIucmVwbGFjZSgvXFxcXDAvZywgJ1xcMCcpO1xyXG5cdFx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9cXFxcXFxcXC9nLCAnXFxcXCcpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRyeXtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0anNvbiA9IGV2YWwoc3RyKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdH1jYXRjaChlKSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNvbnNvbGUud2FybihcIkNvdWxkbid0IHBhcnNlIHRoZW1lIGRhdGFcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuIFtdO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4ganNvbjtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyB0aGUgR29vZ2xlIE1hcHMgbWFwXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUubG9hZEdvb2dsZU1hcCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuc2V0dGluZ3MudG9Hb29nbGVNYXBzT3B0aW9ucygpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5lbmdpbmVFbGVtZW50LCBvcHRpb25zKTtcclxuXHRcdFxyXG5cdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5nb29nbGVNYXAsIFwiYm91bmRzX2NoYW5nZWRcIiwgZnVuY3Rpb24oKSB7IFxyXG5cdFx0XHRzZWxmLm9uQm91bmRzQ2hhbmdlZCgpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuc2V0dGluZ3MuYmljeWNsZSA9PSAxKVxyXG5cdFx0XHR0aGlzLmVuYWJsZUJpY3ljbGVMYXllcih0cnVlKTtcclxuXHRcdGlmKHRoaXMuc2V0dGluZ3MudHJhZmZpYyA9PSAxKVxyXG5cdFx0XHR0aGlzLmVuYWJsZVRyYWZmaWNMYXllcih0cnVlKTtcclxuXHRcdGlmKHRoaXMuc2V0dGluZ3MudHJhbnNwb3J0ID09IDEpXHJcblx0XHRcdHRoaXMuZW5hYmxlUHVibGljVHJhbnNwb3J0TGF5ZXIodHJ1ZSk7XHJcblx0XHR0aGlzLnNob3dQb2ludHNPZkludGVyZXN0KHRoaXMuc2V0dGluZ3Muc2hvd19wb2ludF9vZl9pbnRlcmVzdCk7XHJcblx0XHRcclxuXHRcdC8vIE1vdmUgdGhlIGxvYWRpbmcgd2hlZWwgaW50byB0aGUgbWFwIGVsZW1lbnQgKGl0IGhhcyB0byBsaXZlIG91dHNpZGUgaW4gdGhlIEhUTUwgZmlsZSBiZWNhdXNlIGl0J2xsIGJlIG92ZXJ3cml0dGVuIGJ5IEdvb2dsZSBvdGhlcndpc2UpXHJcblx0XHQkKHRoaXMuZW5naW5lRWxlbWVudCkuYXBwZW5kKCQodGhpcy5lbGVtZW50KS5maW5kKFwiLndwZ216YS1sb2FkZXJcIikpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucywgaW5pdGlhbGl6aW5nKVxyXG5cdHtcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuc2V0T3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLnNjcm9sbHdoZWVsKVxyXG5cdFx0XHRkZWxldGUgb3B0aW9ucy5zY3JvbGx3aGVlbDtcdC8vIE5COiBEZWxldGUgdGhpcyB3aGVuIHRydWUsIHNjcm9sbHdoZWVsOiB0cnVlIGJyZWFrcyBnZXN0dXJlIGhhbmRsaW5nXHJcblx0XHRcclxuXHRcdGlmKCFpbml0aWFsaXppbmcpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlTWFwLnNldE9wdGlvbnMob3B0aW9ucyk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGNvbnZlcnRlZCA9ICQuZXh0ZW5kKG9wdGlvbnMsIHRoaXMuc2V0dGluZ3MudG9Hb29nbGVNYXBzT3B0aW9ucygpKTtcclxuXHRcdFxyXG5cdFx0dmFyIGNsb25lID0gJC5leHRlbmQoe30sIGNvbnZlcnRlZCk7XHJcblx0XHRpZighY2xvbmUuY2VudGVyIGluc3RhbmNlb2YgZ29vZ2xlLm1hcHMuTGF0TG5nICYmIChjbG9uZS5jZW50ZXIgaW5zdGFuY2VvZiBXUEdNWkEuTGF0TG5nIHx8IHR5cGVvZiBjbG9uZS5jZW50ZXIgPT0gXCJvYmplY3RcIikpXHJcblx0XHRcdGNsb25lLmNlbnRlciA9IHtcclxuXHRcdFx0XHRsYXQ6IHBhcnNlRmxvYXQoY2xvbmUuY2VudGVyLmxhdCksXHJcblx0XHRcdFx0bG5nOiBwYXJzZUZsb2F0KGNsb25lLmNlbnRlci5sbmcpXHJcblx0XHRcdH07XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuc2V0dGluZ3MuaGlkZV9wb2ludF9vZl9pbnRlcmVzdCA9PSBcIjFcIilcclxuXHRcdHtcclxuXHRcdFx0dmFyIG5vUG9pID0ge1xyXG5cdFx0XHRcdGZlYXR1cmVUeXBlOiBcInBvaVwiLFxyXG5cdFx0XHRcdGVsZW1lbnRUeXBlOiBcImxhYmVsc1wiLFxyXG5cdFx0XHRcdHN0eWxlcnM6IFtcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dmlzaWJpbGl0eTogXCJvZmZcIlxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdF1cclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKCFjbG9uZS5zdHlsZXMpXHJcblx0XHRcdFx0Y2xvbmUuc3R5bGVzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHRjbG9uZS5zdHlsZXMucHVzaChub1BvaSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuZ29vZ2xlTWFwLnNldE9wdGlvbnMoY2xvbmUpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBZGRzIHRoZSBzcGVjaWZpZWQgbWFya2VyIHRvIHRoaXMgbWFwXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuYWRkTWFya2VyID0gZnVuY3Rpb24obWFya2VyKVxyXG5cdHtcclxuXHRcdG1hcmtlci5nb29nbGVNYXJrZXIuc2V0TWFwKHRoaXMuZ29vZ2xlTWFwKTtcclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5hZGRNYXJrZXIuY2FsbCh0aGlzLCBtYXJrZXIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgbWFya2VyIGZyb20gdGhpcyBtYXBcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5yZW1vdmVNYXJrZXIgPSBmdW5jdGlvbihtYXJrZXIpXHJcblx0e1xyXG5cdFx0bWFya2VyLmdvb2dsZU1hcmtlci5zZXRNYXAobnVsbCk7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUucmVtb3ZlTWFya2VyLmNhbGwodGhpcywgbWFya2VyKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQWRkcyB0aGUgc3BlY2lmaWVkIHBvbHlnb24gdG8gdGhpcyBtYXBcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5hZGRQb2x5Z29uID0gZnVuY3Rpb24ocG9seWdvbilcclxuXHR7XHJcblx0XHRwb2x5Z29uLmdvb2dsZVBvbHlnb24uc2V0TWFwKHRoaXMuZ29vZ2xlTWFwKTtcclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5hZGRQb2x5Z29uLmNhbGwodGhpcywgcG9seWdvbik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBwb2x5Z29uIGZyb20gdGhpcyBtYXBcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5yZW1vdmVQb2x5Z29uID0gZnVuY3Rpb24ocG9seWdvbilcclxuXHR7XHJcblx0XHRwb2x5Z29uLmdvb2dsZVBvbHlnb24uc2V0TWFwKG51bGwpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnJlbW92ZVBvbHlnb24uY2FsbCh0aGlzLCBwb2x5Z29uKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQWRkcyB0aGUgc3BlY2lmaWVkIHBvbHlsaW5lIHRvIHRoaXMgbWFwXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuYWRkUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHRwb2x5bGluZS5nb29nbGVQb2x5bGluZS5zZXRNYXAodGhpcy5nb29nbGVNYXApO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLmFkZFBvbHlsaW5lLmNhbGwodGhpcywgcG9seWxpbmUpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgcG9seWdvbiBmcm9tIHRoaXMgbWFwXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUucmVtb3ZlUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHRwb2x5bGluZS5nb29nbGVQb2x5bGluZS5zZXRNYXAobnVsbCk7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUucmVtb3ZlUG9seWxpbmUuY2FsbCh0aGlzLCBwb2x5bGluZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmFkZENpcmNsZSA9IGZ1bmN0aW9uKGNpcmNsZSlcclxuXHR7XHJcblx0XHRjaXJjbGUuZ29vZ2xlQ2lyY2xlLnNldE1hcCh0aGlzLmdvb2dsZU1hcCk7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkQ2lyY2xlLmNhbGwodGhpcywgY2lyY2xlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUucmVtb3ZlQ2lyY2xlID0gZnVuY3Rpb24oY2lyY2xlKVxyXG5cdHtcclxuXHRcdGNpcmNsZS5nb29nbGVDaXJjbGUuc2V0TWFwKG51bGwpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnJlbW92ZUNpcmNsZS5jYWxsKHRoaXMsIGNpcmNsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmFkZFJlY3RhbmdsZSA9IGZ1bmN0aW9uKHJlY3RhbmdsZSlcclxuXHR7XHJcblx0XHRyZWN0YW5nbGUuZ29vZ2xlUmVjdGFuZ2xlLnNldE1hcCh0aGlzLmdvb2dsZU1hcCk7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkUmVjdGFuZ2xlLmNhbGwodGhpcywgcmVjdGFuZ2xlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUucmVtb3ZlUmVjdGFuZ2xlID0gZnVuY3Rpb24ocmVjdGFuZ2xlKVxyXG5cdHtcclxuXHRcdHJlY3RhbmdsZS5nb29nbGVSZWN0YW5nbGUuc2V0TWFwKG51bGwpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnJlbW92ZVJlY3RhbmdsZS5jYWxsKHRoaXMsIHJlY3RhbmdsZSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIERlbGVnYXRlIGZvciBnb29nbGUgbWFwcyBnZXRDZW50ZXJcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGxhdExuZyA9IHRoaXMuZ29vZ2xlTWFwLmdldENlbnRlcigpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRsYXQ6IGxhdExuZy5sYXQoKSxcclxuXHRcdFx0bG5nOiBsYXRMbmcubG5nKClcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIERlbGVnYXRlIGZvciBnb29nbGUgbWFwcyBzZXRDZW50ZXJcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbihsYXRMbmcpXHJcblx0e1xyXG5cdFx0V1BHTVpBLk1hcC5wcm90b3R5cGUuc2V0Q2VudGVyLmNhbGwodGhpcywgbGF0TG5nKTtcclxuXHRcdFxyXG5cdFx0aWYobGF0TG5nIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZylcclxuXHRcdFx0dGhpcy5nb29nbGVNYXAuc2V0Q2VudGVyKHtcclxuXHRcdFx0XHRsYXQ6IGxhdExuZy5sYXQsXHJcblx0XHRcdFx0bG5nOiBsYXRMbmcubG5nXHJcblx0XHRcdH0pO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcC5zZXRDZW50ZXIobGF0TG5nKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogRGVsZWdhdGUgZm9yIGdvb2dsZSBtYXBzIHNldFBhblxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLnBhblRvID0gZnVuY3Rpb24obGF0TG5nKVxyXG5cdHtcclxuXHRcdGlmKGxhdExuZyBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHRcdHRoaXMuZ29vZ2xlTWFwLnBhblRvKHtcclxuXHRcdFx0XHRsYXQ6IGxhdExuZy5sYXQsXHJcblx0XHRcdFx0bG5nOiBsYXRMbmcubG5nXHJcblx0XHRcdH0pO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcC5wYW5UbyhsYXRMbmcpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBEZWxlZ2F0ZSBmb3IgZ29vZ2xlIG1hcHMgZ2V0Q2VudGVyXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuZ2V0Wm9vbSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5nb29nbGVNYXAuZ2V0Wm9vbSgpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBEZWxlZ2F0ZSBmb3IgZ29vZ2xlIG1hcHMgZ2V0Wm9vbVxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLnNldFpvb20gPSBmdW5jdGlvbih2YWx1ZSlcclxuXHR7XHJcblx0XHRpZihpc05hTih2YWx1ZSkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlZhbHVlIG11c3Qgbm90IGJlIE5hTlwiKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRoaXMuZ29vZ2xlTWFwLnNldFpvb20ocGFyc2VJbnQodmFsdWUpKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgYm91bmRzXHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5nZXRCb3VuZHMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGJvdW5kcyA9IHRoaXMuZ29vZ2xlTWFwLmdldEJvdW5kcygpO1xyXG5cdFx0dmFyIG5vcnRoRWFzdCA9IGJvdW5kcy5nZXROb3J0aEVhc3QoKTtcclxuXHRcdHZhciBzb3V0aFdlc3QgPSBib3VuZHMuZ2V0U291dGhXZXN0KCk7XHJcblx0XHRcclxuXHRcdHZhciBuYXRpdmVCb3VuZHMgPSBuZXcgV1BHTVpBLkxhdExuZ0JvdW5kcyh7fSk7XHJcblx0XHRcclxuXHRcdG5hdGl2ZUJvdW5kcy5ub3J0aCA9IG5vcnRoRWFzdC5sYXQoKTtcclxuXHRcdG5hdGl2ZUJvdW5kcy5zb3V0aCA9IHNvdXRoV2VzdC5sYXQoKTtcclxuXHRcdG5hdGl2ZUJvdW5kcy53ZXN0ID0gc291dGhXZXN0LmxuZygpO1xyXG5cdFx0bmF0aXZlQm91bmRzLmVhc3QgPSBub3J0aEVhc3QubG5nKCk7XHJcblx0XHRcclxuXHRcdC8vIEJhY2t3YXJkIGNvbXBhdGliaWxpdHlcclxuXHRcdG5hdGl2ZUJvdW5kcy50b3BMZWZ0ID0ge1xyXG5cdFx0XHRsYXQ6IG5vcnRoRWFzdC5sYXQoKSxcclxuXHRcdFx0bG5nOiBzb3V0aFdlc3QubG5nKClcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdG5hdGl2ZUJvdW5kcy5ib3R0b21SaWdodCA9IHtcclxuXHRcdFx0bGF0OiBzb3V0aFdlc3QubGF0KCksXHJcblx0XHRcdGxuZzogbm9ydGhFYXN0LmxuZygpXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmF0aXZlQm91bmRzO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBGaXQgdG8gZ2l2ZW4gYm91bmRhcmllc1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmZpdEJvdW5kcyA9IGZ1bmN0aW9uKHNvdXRoV2VzdCwgbm9ydGhFYXN0KVxyXG5cdHtcclxuXHRcdGlmKHNvdXRoV2VzdCBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHRcdHNvdXRoV2VzdCA9IHtsYXQ6IHNvdXRoV2VzdC5sYXQsIGxuZzogc291dGhXZXN0LmxuZ307XHJcblx0XHRpZihub3J0aEVhc3QgaW5zdGFuY2VvZiBXUEdNWkEuTGF0TG5nKVxyXG5cdFx0XHRub3J0aEVhc3QgPSB7bGF0OiBub3J0aEVhc3QubGF0LCBsbmc6IG5vcnRoRWFzdC5sbmd9O1xyXG5cdFx0ZWxzZSBpZihzb3V0aFdlc3QgaW5zdGFuY2VvZiBXUEdNWkEuTGF0TG5nQm91bmRzKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYm91bmRzID0gc291dGhXZXN0O1xyXG5cdFx0XHRcclxuXHRcdFx0c291dGhXZXN0ID0ge1xyXG5cdFx0XHRcdGxhdDogYm91bmRzLnNvdXRoLFxyXG5cdFx0XHRcdGxuZzogYm91bmRzLndlc3RcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdG5vcnRoRWFzdCA9IHtcclxuXHRcdFx0XHRsYXQ6IGJvdW5kcy5ub3J0aCxcclxuXHRcdFx0XHRsbmc6IGJvdW5kcy5lYXN0XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBuYXRpdmVCb3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKHNvdXRoV2VzdCwgbm9ydGhFYXN0KTtcclxuXHRcdHRoaXMuZ29vZ2xlTWFwLmZpdEJvdW5kcyhuYXRpdmVCb3VuZHMpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBGaXQgdGhlIG1hcCBib3VuZGFyaWVzIHRvIHZpc2libGUgbWFya2Vyc1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmZpdEJvdW5kc1RvVmlzaWJsZU1hcmtlcnMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKG1hcmtlcnNbaV0uZ2V0VmlzaWJsZSgpKVxyXG5cdFx0XHRcdGJvdW5kcy5leHRlbmQobWFya2Vyc1tpXS5nZXRQb3NpdGlvbigpKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuZ29vZ2xlTWFwLmZpdEJvdW5kcyhib3VuZHMpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBFbmFibGVzIC8gZGlzYWJsZXMgdGhlIGJpY3ljbGUgbGF5ZXJcclxuXHQgKiBAcGFyYW0gZW5hYmxlIGJvb2xlYW4sIGVuYWJsZSBvciBub3RcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5lbmFibGVCaWN5Y2xlTGF5ZXIgPSBmdW5jdGlvbihlbmFibGUpXHJcblx0e1xyXG5cdFx0aWYoIXRoaXMuYmljeWNsZUxheWVyKVxyXG5cdFx0XHR0aGlzLmJpY3ljbGVMYXllciA9IG5ldyBnb29nbGUubWFwcy5CaWN5Y2xpbmdMYXllcigpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmJpY3ljbGVMYXllci5zZXRNYXAoXHJcblx0XHRcdGVuYWJsZSA/IHRoaXMuZ29vZ2xlTWFwIDogbnVsbFxyXG5cdFx0KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogRW5hYmxlcyAvIGRpc2FibGVzIHRoZSBiaWN5Y2xlIGxheWVyXHJcblx0ICogQHBhcmFtIGVuYWJsZSBib29sZWFuLCBlbmFibGUgb3Igbm90XHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuZW5hYmxlVHJhZmZpY0xheWVyID0gZnVuY3Rpb24oZW5hYmxlKVxyXG5cdHtcclxuXHRcdGlmKCF0aGlzLnRyYWZmaWNMYXllcilcclxuXHRcdFx0dGhpcy50cmFmZmljTGF5ZXIgPSBuZXcgZ29vZ2xlLm1hcHMuVHJhZmZpY0xheWVyKCk7XHJcblx0XHRcclxuXHRcdHRoaXMudHJhZmZpY0xheWVyLnNldE1hcChcclxuXHRcdFx0ZW5hYmxlID8gdGhpcy5nb29nbGVNYXAgOiBudWxsXHJcblx0XHQpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBFbmFibGVzIC8gZGlzYWJsZXMgdGhlIGJpY3ljbGUgbGF5ZXJcclxuXHQgKiBAcGFyYW0gZW5hYmxlIGJvb2xlYW4sIGVuYWJsZSBvciBub3RcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5lbmFibGVQdWJsaWNUcmFuc3BvcnRMYXllciA9IGZ1bmN0aW9uKGVuYWJsZSlcclxuXHR7XHJcblx0XHRpZighdGhpcy5wdWJsaWNUcmFuc3BvcnRMYXllcilcclxuXHRcdFx0dGhpcy5wdWJsaWNUcmFuc3BvcnRMYXllciA9IG5ldyBnb29nbGUubWFwcy5UcmFuc2l0TGF5ZXIoKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5wdWJsaWNUcmFuc3BvcnRMYXllci5zZXRNYXAoXHJcblx0XHRcdGVuYWJsZSA/IHRoaXMuZ29vZ2xlTWFwIDogbnVsbFxyXG5cdFx0KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2hvd3MgLyBoaWRlcyBwb2ludHMgb2YgaW50ZXJlc3RcclxuXHQgKiBAcGFyYW0gc2hvdyBib29sZWFuLCBlbmFibGUgb3Igbm90XHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuc2hvd1BvaW50c09mSW50ZXJlc3QgPSBmdW5jdGlvbihzaG93KVxyXG5cdHtcclxuXHRcdC8vIFRPRE86IFRoaXMgd2lsbCBidWcgdGhlIGZyb250IGVuZCBiZWNhdXNlIHRoZXJlIGlzIG5vIHRleHRhcmVhIHdpdGggdGhlbWUgZGF0YVxyXG5cdFx0dmFyIHRleHQgPSAkKFwidGV4dGFyZWFbbmFtZT0ndGhlbWVfZGF0YSddXCIpLnZhbCgpO1xyXG5cdFx0XHJcblx0XHRpZighdGV4dClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR2YXIgc3R5bGVzID0gSlNPTi5wYXJzZSh0ZXh0KTtcclxuXHRcdFxyXG5cdFx0c3R5bGVzLnB1c2goe1xyXG5cdFx0XHRmZWF0dXJlVHlwZTogXCJwb2lcIixcclxuXHRcdFx0c3R5bGVyczogW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHZpc2liaWxpdHk6IChzaG93ID8gXCJvblwiIDogXCJvZmZcIilcclxuXHRcdFx0XHR9XHJcblx0XHRcdF1cclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcC5zZXRPcHRpb25zKHtzdHlsZXM6IHN0eWxlc30pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIHRoZSBtaW4gem9vbSBvZiB0aGUgbWFwXHJcblx0ICogQHJldHVybiBpbnRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5nZXRNaW5ab29tID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiBwYXJzZUludCh0aGlzLnNldHRpbmdzLm1pbl96b29tKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgbWluIHpvb20gb2YgdGhlIG1hcFxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLnNldE1pblpvb20gPSBmdW5jdGlvbih2YWx1ZSlcclxuXHR7XHJcblx0XHR0aGlzLmdvb2dsZU1hcC5zZXRPcHRpb25zKHtcclxuXHRcdFx0bWluWm9vbTogdmFsdWUsXHJcblx0XHRcdG1heFpvb206IHRoaXMuZ2V0TWF4Wm9vbSgpXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgbWluIHpvb20gb2YgdGhlIG1hcFxyXG5cdCAqIEByZXR1cm4gaW50XHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuZ2V0TWF4Wm9vbSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gcGFyc2VJbnQodGhpcy5zZXR0aW5ncy5tYXhfem9vbSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIG1pbiB6b29tIG9mIHRoZSBtYXBcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5zZXRNYXhab29tID0gZnVuY3Rpb24odmFsdWUpXHJcblx0e1xyXG5cdFx0dGhpcy5nb29nbGVNYXAuc2V0T3B0aW9ucyh7XHJcblx0XHRcdG1pblpvb206IHRoaXMuZ2V0TWluWm9vbSgpLFxyXG5cdFx0XHRtYXhab29tOiB2YWx1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmxhdExuZ1RvUGl4ZWxzID0gZnVuY3Rpb24obGF0TG5nKVxyXG5cdHtcclxuXHRcdHZhciBtYXAgPSB0aGlzLmdvb2dsZU1hcDtcclxuXHRcdHZhciBuYXRpdmVMYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHtcclxuXHRcdFx0bGF0OiBwYXJzZUZsb2F0KGxhdExuZy5sYXQpLFxyXG5cdFx0XHRsbmc6IHBhcnNlRmxvYXQobGF0TG5nLmxuZylcclxuXHRcdH0pO1xyXG5cdFx0dmFyIHRvcFJpZ2h0ID0gbWFwLmdldFByb2plY3Rpb24oKS5mcm9tTGF0TG5nVG9Qb2ludChtYXAuZ2V0Qm91bmRzKCkuZ2V0Tm9ydGhFYXN0KCkpO1xyXG5cdFx0dmFyIGJvdHRvbUxlZnQgPSBtYXAuZ2V0UHJvamVjdGlvbigpLmZyb21MYXRMbmdUb1BvaW50KG1hcC5nZXRCb3VuZHMoKS5nZXRTb3V0aFdlc3QoKSk7XHJcblx0XHR2YXIgc2NhbGUgPSBNYXRoLnBvdygyLCBtYXAuZ2V0Wm9vbSgpKTtcclxuXHRcdHZhciB3b3JsZFBvaW50ID0gbWFwLmdldFByb2plY3Rpb24oKS5mcm9tTGF0TG5nVG9Qb2ludChuYXRpdmVMYXRMbmcpO1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogKHdvcmxkUG9pbnQueCAtIGJvdHRvbUxlZnQueCkgKiBzY2FsZSwgXHJcblx0XHRcdHk6ICh3b3JsZFBvaW50LnkgLSB0b3BSaWdodC55KSAqIHNjYWxlXHJcblx0XHR9O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5waXhlbHNUb0xhdExuZyA9IGZ1bmN0aW9uKHgsIHkpXHJcblx0e1xyXG5cdFx0aWYoeSA9PSB1bmRlZmluZWQpXHJcblx0XHR7XHJcblx0XHRcdGlmKFwieFwiIGluIHggJiYgXCJ5XCIgaW4geClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHkgPSB4Lnk7XHJcblx0XHRcdFx0eCA9IHgueDtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiWSBjb29yZGluYXRlIHVuZGVmaW5lZCBpbiBwaXhlbHNUb0xhdExuZyAoZGlkIHlvdSBtZWFuIHRvIHBhc3MgMiBhcmd1bWVudHM/KVwiKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIG1hcCA9IHRoaXMuZ29vZ2xlTWFwO1xyXG5cdFx0dmFyIHRvcFJpZ2h0ID0gbWFwLmdldFByb2plY3Rpb24oKS5mcm9tTGF0TG5nVG9Qb2ludChtYXAuZ2V0Qm91bmRzKCkuZ2V0Tm9ydGhFYXN0KCkpO1xyXG5cdFx0dmFyIGJvdHRvbUxlZnQgPSBtYXAuZ2V0UHJvamVjdGlvbigpLmZyb21MYXRMbmdUb1BvaW50KG1hcC5nZXRCb3VuZHMoKS5nZXRTb3V0aFdlc3QoKSk7XHJcblx0XHR2YXIgc2NhbGUgPSBNYXRoLnBvdygyLCBtYXAuZ2V0Wm9vbSgpKTtcclxuXHRcdHZhciB3b3JsZFBvaW50ID0gbmV3IGdvb2dsZS5tYXBzLlBvaW50KHggLyBzY2FsZSArIGJvdHRvbUxlZnQueCwgeSAvIHNjYWxlICsgdG9wUmlnaHQueSk7XHJcblx0XHR2YXIgbGF0TG5nID0gbWFwLmdldFByb2plY3Rpb24oKS5mcm9tUG9pbnRUb0xhdExuZyh3b3JsZFBvaW50KTtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGxhdDogbGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRsbmc6IGxhdExuZy5sbmcoKVxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogSGFuZGxlIHRoZSBtYXAgZWxlbWVudCByZXNpemluZ1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLm9uRWxlbWVudFJlc2l6ZWQgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHRpZighdGhpcy5nb29nbGVNYXApXHJcblx0XHRcdHJldHVybjtcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LnRyaWdnZXIodGhpcy5nb29nbGVNYXAsIFwicmVzaXplXCIpO1xyXG5cdH1cclxuXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuZW5hYmxlQWxsSW50ZXJhY3Rpb25zID0gZnVuY3Rpb24oKVxyXG5cdHtcdFxyXG5cdFx0dmFyIG9wdGlvbnMgPSB7fTtcclxuXHJcblx0XHRvcHRpb25zLnNjcm9sbHdoZWVsXHRcdFx0XHQ9IHRydWU7XHJcblx0XHRvcHRpb25zLmRyYWdnYWJsZVx0XHRcdFx0PSB0cnVlO1xyXG5cdFx0b3B0aW9ucy5kaXNhYmxlRG91YmxlQ2xpY2tab29tXHQ9IGZhbHNlO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcC5zZXRPcHRpb25zKG9wdGlvbnMpO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtbWFwLmpzIn0=


// js/v8/google-maps/google-marker.js
/**
 * @namespace WPGMZA
 * @module GoogleMarker
 * @requires WPGMZA.Marker
 * @gulp-requires ../core.js
 * @pro-requires WPGMZA.ProMarker
 * @gulp-pro-requires pro-marker.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);
		
		this._opacity = 1.0;
		
		var settings = {};
		if(row)
		{
			for(var name in row)
			{
				if(row[name] instanceof WPGMZA.LatLng)
				{
					settings[name] = row[name].toGoogleLatLng();
				}
				else if(row[name] instanceof WPGMZA.Map || name == "icon")
				{
					// NB: Ignore map here, it's not a google.maps.Map, Google would throw an exception
					// NB: Ignore icon here, it conflicts with updateIcon in Pro
				}
				else
					settings[name] = row[name];
			}
		}
		
		this.googleMarker = new google.maps.Marker(settings);
		this.googleMarker.wpgmzaMarker = this;
		
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
			
		// this.googleMarker.setLabel(this.settings.label);
		
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
		});
		
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
		
		if(!icon)
			icon = WPGMZA.settings.default_marker_icon;
		
		if(typeof icon == "string")
			params = {
				url: icon
			};
		else
			params = icon;
		
		img.onload = function()
		{
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtbWFya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZU1hcmtlclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1hcmtlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9jb3JlLmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb01hcmtlclxyXG4gKiBAZ3VscC1wcm8tcmVxdWlyZXMgcHJvLW1hcmtlci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIgPSBmdW5jdGlvbihyb3cpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQuY2FsbCh0aGlzLCByb3cpO1xyXG5cdFx0XHJcblx0XHR0aGlzLl9vcGFjaXR5ID0gMS4wO1xyXG5cdFx0XHJcblx0XHR2YXIgc2V0dGluZ3MgPSB7fTtcclxuXHRcdGlmKHJvdylcclxuXHRcdHtcclxuXHRcdFx0Zm9yKHZhciBuYW1lIGluIHJvdylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGlmKHJvd1tuYW1lXSBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0c2V0dGluZ3NbbmFtZV0gPSByb3dbbmFtZV0udG9Hb29nbGVMYXRMbmcoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZSBpZihyb3dbbmFtZV0gaW5zdGFuY2VvZiBXUEdNWkEuTWFwIHx8IG5hbWUgPT0gXCJpY29uXCIpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Ly8gTkI6IElnbm9yZSBtYXAgaGVyZSwgaXQncyBub3QgYSBnb29nbGUubWFwcy5NYXAsIEdvb2dsZSB3b3VsZCB0aHJvdyBhbiBleGNlcHRpb25cclxuXHRcdFx0XHRcdC8vIE5COiBJZ25vcmUgaWNvbiBoZXJlLCBpdCBjb25mbGljdHMgd2l0aCB1cGRhdGVJY29uIGluIFByb1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNlXHJcblx0XHRcdFx0XHRzZXR0aW5nc1tuYW1lXSA9IHJvd1tuYW1lXTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoc2V0dGluZ3MpO1xyXG5cdFx0dGhpcy5nb29nbGVNYXJrZXIud3BnbXphTWFya2VyID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVNYXJrZXIuc2V0UG9zaXRpb24obmV3IGdvb2dsZS5tYXBzLkxhdExuZyh7XHJcblx0XHRcdGxhdDogcGFyc2VGbG9hdCh0aGlzLmxhdCksXHJcblx0XHRcdGxuZzogcGFyc2VGbG9hdCh0aGlzLmxuZylcclxuXHRcdH0pKTtcclxuXHRcdFx0XHJcblx0XHQvLyB0aGlzLmdvb2dsZU1hcmtlci5zZXRMYWJlbCh0aGlzLnNldHRpbmdzLmxhYmVsKTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5hbmltKVxyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRBbmltYXRpb24odGhpcy5hbmltKTtcclxuXHRcdGlmKHRoaXMuYW5pbWF0aW9uKVxyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRBbmltYXRpb24odGhpcy5hbmltYXRpb24pO1xyXG5cdFx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFya2VyLCBcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJjbGlja1wiKTtcclxuXHRcdFx0c2VsZi5kaXNwYXRjaEV2ZW50KFwic2VsZWN0XCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFya2VyLCBcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0c2VsZi5kaXNwYXRjaEV2ZW50KFwibW91c2VvdmVyXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFya2VyLCBcImRyYWdlbmRcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhciBnb29nbGVNYXJrZXJQb3NpdGlvbiA9IHNlbGYuZ29vZ2xlTWFya2VyLmdldFBvc2l0aW9uKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLnNldFBvc2l0aW9uKHtcclxuXHRcdFx0XHRsYXQ6IGdvb2dsZU1hcmtlclBvc2l0aW9uLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogZ29vZ2xlTWFya2VyUG9zaXRpb24ubG5nKClcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoe1xyXG5cdFx0XHRcdHR5cGU6IFwiZHJhZ2VuZFwiLFxyXG5cdFx0XHRcdGxhdExuZzogc2VsZi5nZXRQb3NpdGlvbigpXHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMudHJpZ2dlcihcImluaXRcIik7XHJcblx0fVxyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9NYXJrZXI7XHJcblx0ZWxzZVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLk1hcmtlcjtcclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGFyZW50LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZU1hcmtlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuR29vZ2xlTWFya2VyO1xyXG5cdFxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZSwgXCJvcGFjaXR5XCIsIHtcclxuXHRcdFxyXG5cdFx0XCJnZXRcIjogZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiB0aGlzLl9vcGFjaXR5O1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0XCJzZXRcIjogZnVuY3Rpb24odmFsdWUpIHtcclxuXHRcdFx0dGhpcy5fb3BhY2l0eSA9IHZhbHVlO1xyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRPcGFjaXR5KHZhbHVlKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIucHJvdG90eXBlLnNldExhYmVsID0gZnVuY3Rpb24obGFiZWwpXHJcblx0e1xyXG5cdFx0aWYoIWxhYmVsKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRMYWJlbChudWxsKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRMYWJlbCh7XHJcblx0XHRcdHRleHQ6IGxhYmVsXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMuZ29vZ2xlTWFya2VyLmdldEljb24oKSlcclxuXHRcdFx0dGhpcy5nb29nbGVNYXJrZXIuc2V0SWNvbihXUEdNWkEuc2V0dGluZ3MuZGVmYXVsdF9tYXJrZXJfaWNvbik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXJcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnNldFBvc2l0aW9uLmNhbGwodGhpcywgbGF0TG5nKTtcclxuXHRcdHRoaXMuZ29vZ2xlTWFya2VyLnNldFBvc2l0aW9uKHtcclxuXHRcdFx0bGF0OiB0aGlzLmxhdCxcclxuXHRcdFx0bG5nOiB0aGlzLmxuZ1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHBvc2l0aW9uIG9mZnNldCBvZiBhIG1hcmtlclxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIucHJvdG90eXBlLnVwZGF0ZU9mZnNldCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgaWNvbiA9IHRoaXMuZ29vZ2xlTWFya2VyLmdldEljb24oKTtcclxuXHRcdHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuXHRcdHZhciBwYXJhbXM7XHJcblx0XHR2YXIgeCA9IHRoaXMuX29mZnNldC54O1xyXG5cdFx0dmFyIHkgPSB0aGlzLl9vZmZzZXQueTtcclxuXHRcdFxyXG5cdFx0aWYoIWljb24pXHJcblx0XHRcdGljb24gPSBXUEdNWkEuc2V0dGluZ3MuZGVmYXVsdF9tYXJrZXJfaWNvbjtcclxuXHRcdFxyXG5cdFx0aWYodHlwZW9mIGljb24gPT0gXCJzdHJpbmdcIilcclxuXHRcdFx0cGFyYW1zID0ge1xyXG5cdFx0XHRcdHVybDogaWNvblxyXG5cdFx0XHR9O1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHRwYXJhbXMgPSBpY29uO1xyXG5cdFx0XHJcblx0XHRpbWcub25sb2FkID0gZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgZGVmYXVsdEFuY2hvciA9IHtcclxuXHRcdFx0XHR4OiBpbWcud2lkdGggLyAyLFxyXG5cdFx0XHRcdHk6IGltZy5oZWlnaHRcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdHBhcmFtcy5hbmNob3IgPSBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoZGVmYXVsdEFuY2hvci54IC0geCwgZGVmYXVsdEFuY2hvci55IC0geSk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLmdvb2dsZU1hcmtlci5zZXRJY29uKHBhcmFtcyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGltZy5zcmMgPSBwYXJhbXMudXJsO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRPcHRpb25zKG9wdGlvbnMpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXQgdGhlIG1hcmtlciBhbmltYXRpb25cclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5zZXRBbmltYXRpb24gPSBmdW5jdGlvbihhbmltYXRpb24pXHJcblx0e1xyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5zZXRBbmltYXRpb24uY2FsbCh0aGlzLCBhbmltYXRpb24pO1xyXG5cdFx0dGhpcy5nb29nbGVNYXJrZXIuc2V0QW5pbWF0aW9uKGFuaW1hdGlvbik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIG1hcmtlclxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuc2V0VmlzaWJsZS5jYWxsKHRoaXMsIHZpc2libGUpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcmtlci5zZXRWaXNpYmxlKHZpc2libGUgPyB0cnVlIDogZmFsc2UpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5nZXRWaXNpYmxlID0gZnVuY3Rpb24odmlzaWJsZSlcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5nb29nbGVNYXJrZXIuZ2V0VmlzaWJsZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFya2VyLnByb3RvdHlwZS5zZXREcmFnZ2FibGUgPSBmdW5jdGlvbihkcmFnZ2FibGUpXHJcblx0e1xyXG5cdFx0dGhpcy5nb29nbGVNYXJrZXIuc2V0RHJhZ2dhYmxlKGRyYWdnYWJsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXJrZXIucHJvdG90eXBlLnNldE9wYWNpdHkgPSBmdW5jdGlvbihvcGFjaXR5KVxyXG5cdHtcclxuXHRcdHRoaXMuZ29vZ2xlTWFya2VyLnNldE9wYWNpdHkob3BhY2l0eSk7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Imdvb2dsZS1tYXBzL2dvb2dsZS1tYXJrZXIuanMifQ==


// js/v8/google-maps/google-modern-store-locator-circle.js
/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 * @gulp-requires ../modern-store-locator-circle.js
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
		
		$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
			
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtbW9kZXJuLXN0b3JlLWxvY2F0b3ItY2lyY2xlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZU1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9tb2Rlcm4tc3RvcmUtbG9jYXRvci1jaXJjbGUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvckNpcmNsZSA9IGZ1bmN0aW9uKG1hcCwgc2V0dGluZ3MpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLmNhbGwodGhpcywgbWFwLCBzZXR0aW5ncyk7XHJcblx0XHRcclxuXHRcdHRoaXMuaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIG1hcFNpemUgPSB7XHJcblx0XHRcdFx0d2lkdGg6ICQoc2VsZi5tYXBFbGVtZW50KS53aWR0aCgpLFxyXG5cdFx0XHRcdGhlaWdodDogJChzZWxmLm1hcEVsZW1lbnQpLmhlaWdodCgpXHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHRpZihtYXBTaXplLndpZHRoID09IHNlbGYubWFwU2l6ZS53aWR0aCAmJiBtYXBTaXplLmhlaWdodCA9PSBzZWxmLm1hcFNpemUuaGVpZ2h0KVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYuY2FudmFzTGF5ZXIucmVzaXplXygpO1xyXG5cdFx0XHRzZWxmLmNhbnZhc0xheWVyLmRyYXcoKTtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYubWFwU2l6ZSA9IG1hcFNpemU7XHJcblx0XHRcdFxyXG5cdFx0fSwgMTAwMCk7XHJcblx0XHRcclxuXHRcdCQoZG9jdW1lbnQpLmJpbmQoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UgbW96ZnVsbHNjcmVlbmNoYW5nZSBmdWxsc2NyZWVuY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLmNhbnZhc0xheWVyLnJlc2l6ZV8oKTtcclxuXHRcdFx0c2VsZi5jYW52YXNMYXllci5kcmF3KCk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmluaXRDYW52YXNMYXllciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuY2FudmFzTGF5ZXIpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuY2FudmFzTGF5ZXIuc2V0TWFwKG51bGwpO1xyXG5cdFx0XHR0aGlzLmNhbnZhc0xheWVyLnNldEFuaW1hdGUoZmFsc2UpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmNhbnZhc0xheWVyID0gbmV3IENhbnZhc0xheWVyKHtcclxuXHRcdFx0bWFwOiB0aGlzLm1hcC5nb29nbGVNYXAsXHJcblx0XHRcdHJlc2l6ZUhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0c2VsZi5vblJlc2l6ZShldmVudCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdHVwZGF0ZUhhbmRsZXI6IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0c2VsZi5vblVwZGF0ZShldmVudCk7XHJcblx0XHRcdH0sXHJcblx0XHRcdGFuaW1hdGU6IHRydWUsXHJcblx0XHRcdHJlc29sdXRpb25TY2FsZTogdGhpcy5nZXRSZXNvbHV0aW9uU2NhbGUoKVxyXG4gICAgICAgIH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucyk7XHJcblx0XHRcclxuXHRcdHRoaXMuY2FudmFzTGF5ZXIuc2NoZWR1bGVVcGRhdGUoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihwb3NpdGlvbilcclxuXHR7XHJcblx0XHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRQb3NpdGlvbi5jYWxsKHRoaXMsIHBvc2l0aW9uKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jYW52YXNMYXllci5zY2hlZHVsZVVwZGF0ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMgPSBmdW5jdGlvbihyYWRpdXMpXHJcblx0e1xyXG5cdFx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuc2V0UmFkaXVzLmNhbGwodGhpcywgcmFkaXVzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jYW52YXNMYXllci5zY2hlZHVsZVVwZGF0ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRUcmFuc2Zvcm1lZFJhZGl1cyA9IGZ1bmN0aW9uKGttKVxyXG5cdHtcclxuXHRcdHZhciBtdWx0aXBsaWVyQXRFcXVhdG9yID0gMC4wMDYzOTU7XHJcblx0XHR2YXIgc3BoZXJpY2FsID0gZ29vZ2xlLm1hcHMuZ2VvbWV0cnkuc3BoZXJpY2FsO1xyXG5cdFx0XHJcblx0XHR2YXIgY2VudGVyID0gdGhpcy5zZXR0aW5ncy5jZW50ZXI7XHJcblx0XHR2YXIgZXF1YXRvciA9IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0bGF0OiAwLjAsXHJcblx0XHRcdGxuZzogMC4wXHJcblx0XHR9KTtcclxuXHRcdHZhciBsYXRpdHVkZSA9IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0bGF0OiBjZW50ZXIubGF0LFxyXG5cdFx0XHRsbmc6IDAuMFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHZhciBvZmZzZXRBdEVxdWF0b3IgPSBzcGhlcmljYWwuY29tcHV0ZU9mZnNldChlcXVhdG9yLnRvR29vZ2xlTGF0TG5nKCksIGttICogMTAwMCwgOTApO1xyXG5cdFx0dmFyIG9mZnNldEF0TGF0aXR1ZGUgPSBzcGhlcmljYWwuY29tcHV0ZU9mZnNldChsYXRpdHVkZS50b0dvb2dsZUxhdExuZygpLCBrbSAqIDEwMDAsIDkwKTtcclxuXHRcdFxyXG5cdFx0dmFyIGZhY3RvciA9IG9mZnNldEF0TGF0aXR1ZGUubG5nKCkgLyBvZmZzZXRBdEVxdWF0b3IubG5nKCk7XHJcblx0XHR2YXIgcmVzdWx0ID0ga20gKiBtdWx0aXBsaWVyQXRFcXVhdG9yICogZmFjdG9yO1xyXG5cdFx0XHJcblx0XHRpZihpc05hTihyZXN1bHQpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJoZXJlXCIpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRDYW52YXNEaW1lbnNpb25zID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHdpZHRoOiB0aGlzLmNhbnZhc0xheWVyLmNhbnZhcy53aWR0aCxcclxuXHRcdFx0aGVpZ2h0OiB0aGlzLmNhbnZhc0xheWVyLmNhbnZhcy5oZWlnaHRcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldFdvcmxkT3JpZ2luT2Zmc2V0ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwcm9qZWN0aW9uID0gdGhpcy5tYXAuZ29vZ2xlTWFwLmdldFByb2plY3Rpb24oKTtcclxuXHRcdHZhciBwb3NpdGlvbiA9IHByb2plY3Rpb24uZnJvbUxhdExuZ1RvUG9pbnQodGhpcy5jYW52YXNMYXllci5nZXRUb3BMZWZ0KCkpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR4OiAtcG9zaXRpb24ueCxcclxuXHRcdFx0eTogLXBvc2l0aW9uLnlcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldENlbnRlclBpeGVscyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgY2VudGVyID0gbmV3IFdQR01aQS5MYXRMbmcodGhpcy5zZXR0aW5ncy5jZW50ZXIpO1xyXG5cdFx0dmFyIHByb2plY3Rpb24gPSB0aGlzLm1hcC5nb29nbGVNYXAuZ2V0UHJvamVjdGlvbigpO1xyXG5cdFx0cmV0dXJuIHByb2plY3Rpb24uZnJvbUxhdExuZ1RvUG9pbnQoY2VudGVyLnRvR29vZ2xlTGF0TG5nKCkpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24odHlwZSlcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5jYW52YXNMYXllci5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRTY2FsZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gTWF0aC5wb3coMiwgdGhpcy5tYXAuZ2V0Wm9vbSgpKSAqIHRoaXMuZ2V0UmVzb2x1dGlvblNjYWxlKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLnNldFZpc2libGUuY2FsbCh0aGlzLCB2aXNpYmxlKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5jYW52YXNMYXllci5zY2hlZHVsZVVwZGF0ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRoaXMuY2FudmFzTGF5ZXIuc2V0TWFwKG51bGwpO1xyXG5cdFx0dGhpcy5jYW52YXNMYXllciA9IG51bGw7XHJcblx0XHRcclxuXHRcdGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElEKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiZ29vZ2xlLW1hcHMvZ29vZ2xlLW1vZGVybi1zdG9yZS1sb2NhdG9yLWNpcmNsZS5qcyJ9


// js/v8/google-maps/google-modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 * @gulp-requires ../modern-store-locator.js
 */
jQuery(function($) {
	
	WPGMZA.GoogleModernStoreLocator = function(map_id)
	{
		var googleMap, self = this;
		
		this.map = WPGMZA.getMapByID(map_id);
		
		WPGMZA.ModernStoreLocator.call(this, map_id);

		var options = {
			fields: ["name", "formatted_address"],
			types: ["geocode"]
		};
		var restrict = wpgmaps_localize[map_id]["other_settings"]["wpgmza_store_locator_restrict"];
		
		this.addressInput = $(this.element).find(".addressInput, #addressInput")[0];
		
		if(this.addressInput)
		{
			if(restrict && restrict.length)
				options.componentRestrictions = {
					country: restrict
				};
			
			this.autoComplete = new google.maps.places.Autocomplete(
				this.addressInput,
				options
			);
		}
		
		// Positioning for Google
		this.map.googleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(this.element);
	}
	
	WPGMZA.GoogleModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator.prototype);
	WPGMZA.GoogleModernStoreLocator.prototype.constructor = WPGMZA.GoogleModernStoreLocator;
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtbW9kZXJuLXN0b3JlLWxvY2F0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL21vZGVybi1zdG9yZS1sb2NhdG9yLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3IgPSBmdW5jdGlvbihtYXBfaWQpXHJcblx0e1xyXG5cdFx0dmFyIGdvb2dsZU1hcCwgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwID0gV1BHTVpBLmdldE1hcEJ5SUQobWFwX2lkKTtcclxuXHRcdFxyXG5cdFx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvci5jYWxsKHRoaXMsIG1hcF9pZCk7XHJcblxyXG5cdFx0dmFyIG9wdGlvbnMgPSB7XHJcblx0XHRcdGZpZWxkczogW1wibmFtZVwiLCBcImZvcm1hdHRlZF9hZGRyZXNzXCJdLFxyXG5cdFx0XHR0eXBlczogW1wiZ2VvY29kZVwiXVxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN0cmljdCA9IHdwZ21hcHNfbG9jYWxpemVbbWFwX2lkXVtcIm90aGVyX3NldHRpbmdzXCJdW1wid3BnbXphX3N0b3JlX2xvY2F0b3JfcmVzdHJpY3RcIl07XHJcblx0XHRcclxuXHRcdHRoaXMuYWRkcmVzc0lucHV0ID0gJCh0aGlzLmVsZW1lbnQpLmZpbmQoXCIuYWRkcmVzc0lucHV0LCAjYWRkcmVzc0lucHV0XCIpWzBdO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLmFkZHJlc3NJbnB1dClcclxuXHRcdHtcclxuXHRcdFx0aWYocmVzdHJpY3QgJiYgcmVzdHJpY3QubGVuZ3RoKVxyXG5cdFx0XHRcdG9wdGlvbnMuY29tcG9uZW50UmVzdHJpY3Rpb25zID0ge1xyXG5cdFx0XHRcdFx0Y291bnRyeTogcmVzdHJpY3RcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5hdXRvQ29tcGxldGUgPSBuZXcgZ29vZ2xlLm1hcHMucGxhY2VzLkF1dG9jb21wbGV0ZShcclxuXHRcdFx0XHR0aGlzLmFkZHJlc3NJbnB1dCxcclxuXHRcdFx0XHRvcHRpb25zXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFBvc2l0aW9uaW5nIGZvciBHb29nbGVcclxuXHRcdHRoaXMubWFwLmdvb2dsZU1hcC5jb250cm9sc1tnb29nbGUubWFwcy5Db250cm9sUG9zaXRpb24uVE9QX0NFTlRFUl0ucHVzaCh0aGlzLmVsZW1lbnQpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvci5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvcjtcclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtbW9kZXJuLXN0b3JlLWxvY2F0b3IuanMifQ==


// js/v8/google-maps/google-polygon.js
/**
 * @namespace WPGMZA
 * @module GooglePolygon
 * @requires WPGMZA.Polygon
 * @gulp-requires ../polygon.js
 * @pro-requires WPGMZA.ProPolygon
 * @gulp-pro-requires pro-polygon.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GooglePolygon = function(options, googlePolygon)
	{
		var self = this;
		
		Parent.call(this, options, googlePolygon);
		
		if(googlePolygon)
		{
			this.googlePolygon = googlePolygon;
		}
		else
		{
			this.googlePolygon = new google.maps.Polygon();
			
			if(options)
			{
				var googleOptions = $.extend({}, options);
				
				if(options.polydata)
					googleOptions.paths = this.parseGeometry(options.polydata);
				
				if(options.linecolor)
					googleOptions.strokeColor = "#" + options.linecolor;
				
				if(options.lineopacity)
					googleOptions.strokeOpacity = parseFloat(options.lineopacity);
				
				if(options.fillcolor)
					googleOptions.fillColor = "#" + options.fillcolor;
				
				if(options.opacity)
					googleOptions.fillOpacity = parseFloat(options.opacity);
				
				this.googlePolygon.setOptions(googleOptions);
			}
		}
		
		this.googlePolygon.wpgmzaPolygon = this;
			
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
		this.googlePolygon.setOptions({editable: value});
	}
	
	/**
	 * Returns the polygon represented by a JSON object
	 * @return object
	 */
	WPGMZA.GooglePolygon.prototype.toJSON = function()
	{
		var result = WPGMZA.Polygon.prototype.toJSON.call(this);
		
		result.points = [];
		
		// TODO: Support holes using multiple paths
		var path = this.googlePolygon.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.points.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtcG9seWdvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBHb29nbGVQb2x5Z29uXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuUG9seWdvblxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9wb2x5Z29uLmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb1BvbHlnb25cclxuICogQGd1bHAtcHJvLXJlcXVpcmVzIHByby1wb2x5Z29uLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdHZhciBQYXJlbnQ7XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlnb24gPSBmdW5jdGlvbihvcHRpb25zLCBnb29nbGVQb2x5Z29uKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0UGFyZW50LmNhbGwodGhpcywgb3B0aW9ucywgZ29vZ2xlUG9seWdvbik7XHJcblx0XHRcclxuXHRcdGlmKGdvb2dsZVBvbHlnb24pXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlUG9seWdvbiA9IGdvb2dsZVBvbHlnb247XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlUG9seWdvbiA9IG5ldyBnb29nbGUubWFwcy5Qb2x5Z29uKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIGdvb2dsZU9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgb3B0aW9ucyk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYob3B0aW9ucy5wb2x5ZGF0YSlcclxuXHRcdFx0XHRcdGdvb2dsZU9wdGlvbnMucGF0aHMgPSB0aGlzLnBhcnNlR2VvbWV0cnkob3B0aW9ucy5wb2x5ZGF0YSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYob3B0aW9ucy5saW5lY29sb3IpXHJcblx0XHRcdFx0XHRnb29nbGVPcHRpb25zLnN0cm9rZUNvbG9yID0gXCIjXCIgKyBvcHRpb25zLmxpbmVjb2xvcjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihvcHRpb25zLmxpbmVvcGFjaXR5KVxyXG5cdFx0XHRcdFx0Z29vZ2xlT3B0aW9ucy5zdHJva2VPcGFjaXR5ID0gcGFyc2VGbG9hdChvcHRpb25zLmxpbmVvcGFjaXR5KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihvcHRpb25zLmZpbGxjb2xvcilcclxuXHRcdFx0XHRcdGdvb2dsZU9wdGlvbnMuZmlsbENvbG9yID0gXCIjXCIgKyBvcHRpb25zLmZpbGxjb2xvcjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihvcHRpb25zLm9wYWNpdHkpXHJcblx0XHRcdFx0XHRnb29nbGVPcHRpb25zLmZpbGxPcGFjaXR5ID0gcGFyc2VGbG9hdChvcHRpb25zLm9wYWNpdHkpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZ29vZ2xlUG9seWdvbi5zZXRPcHRpb25zKGdvb2dsZU9wdGlvbnMpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuZ29vZ2xlUG9seWdvbi53cGdtemFQb2x5Z29uID0gdGhpcztcclxuXHRcdFx0XHJcblx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcih0aGlzLmdvb2dsZVBvbHlnb24sIFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudCh7dHlwZTogXCJjbGlja1wifSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLlByb1BvbHlnb247XHJcblx0ZWxzZVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLlBvbHlnb247XHJcblx0XHRcclxuXHRXUEdNWkEuR29vZ2xlUG9seWdvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBhcmVudC5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5Hb29nbGVQb2x5Z29uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5Hb29nbGVQb2x5Z29uO1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcG9seWdvbiBpcyBlZGl0YWJsZVxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVQb2x5Z29uLnByb3RvdHlwZS5nZXRFZGl0YWJsZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5nb29nbGVQb2x5Z29uLmdldE9wdGlvbnMoKS5lZGl0YWJsZTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgZWRpdGFibGUgc3RhdGUgb2YgdGhlIHBvbHlnb25cclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlUG9seWdvbi5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbih2YWx1ZSlcclxuXHR7XHJcblx0XHR0aGlzLmdvb2dsZVBvbHlnb24uc2V0T3B0aW9ucyh7ZWRpdGFibGU6IHZhbHVlfSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIHBvbHlnb24gcmVwcmVzZW50ZWQgYnkgYSBKU09OIG9iamVjdFxyXG5cdCAqIEByZXR1cm4gb2JqZWN0XHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZVBvbHlnb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gV1BHTVpBLlBvbHlnb24ucHJvdG90eXBlLnRvSlNPTi5jYWxsKHRoaXMpO1xyXG5cdFx0XHJcblx0XHRyZXN1bHQucG9pbnRzID0gW107XHJcblx0XHRcclxuXHRcdC8vIFRPRE86IFN1cHBvcnQgaG9sZXMgdXNpbmcgbXVsdGlwbGUgcGF0aHNcclxuXHRcdHZhciBwYXRoID0gdGhpcy5nb29nbGVQb2x5Z29uLmdldFBhdGgoKTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoLmdldExlbmd0aCgpOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBsYXRMbmcgPSBwYXRoLmdldEF0KGkpO1xyXG5cdFx0XHRyZXN1bHQucG9pbnRzLnB1c2goe1xyXG5cdFx0XHRcdGxhdDogbGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogbGF0TG5nLmxuZygpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtcG9seWdvbi5qcyJ9


// js/v8/google-maps/google-polyline.js
/**
 * @namespace WPGMZA
 * @module GooglePolyline
 * @requires WPGMZA.Polyline
 * @gulp-requires ../polyline.js
 */
jQuery(function($) {
	
	WPGMZA.GooglePolyline = function(options, googlePolyline)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, options, googlePolyline);
		
		if(googlePolyline)
		{
			this.googlePolyline = googlePolyline;
		}
		else
		{
			this.googlePolyline = new google.maps.Polyline(this.settings);			
			
			if(options)
			{
				var googleOptions = $.extend({}, options);
				
				if(options.polydata)
					googleOptions.path = this.parseGeometry(options.polydata);
				
				if(options.linecolor)
					googleOptions.strokeColor = "#" + options.linecolor;
				
				if(options.linethickness)
					googleOptions.strokeWeight = parseInt(options.linethickness);
				
				if(options.opacity)
					googleOptions.strokeOpacity = parseFloat(options.opacity);
			}
			
			if(options && options.polydata)
			{
				var path = this.parseGeometry(options.polydata);
				this.setPoints(path);
			}
		}
		
		this.googlePolyline.wpgmzaPolyline = this;
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.GooglePolyline.prototype = Object.create(WPGMZA.Polyline.prototype);
	WPGMZA.GooglePolyline.prototype.constructor = WPGMZA.GooglePolyline;
	
	WPGMZA.GooglePolyline.prototype.setEditable = function(value)
	{
		this.googlePolyline.setOptions({editable: value});
	}
	
	WPGMZA.GooglePolyline.prototype.setPoints = function(points)
	{
		this.googlePolyline.setOptions({path: points});
	}
	
	WPGMZA.GooglePolyline.prototype.toJSON = function()
	{
		var result = WPGMZA.Polyline.prototype.toJSON.call(this);
		
		result.points = [];
		
		var path = this.googlePolyline.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.points.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtcG9seWxpbmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlUG9seWxpbmVcclxuICogQHJlcXVpcmVzIFdQR01aQS5Qb2x5bGluZVxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9wb2x5bGluZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlUG9seWxpbmUgPSBmdW5jdGlvbihvcHRpb25zLCBnb29nbGVQb2x5bGluZSlcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFdQR01aQS5Qb2x5bGluZS5jYWxsKHRoaXMsIG9wdGlvbnMsIGdvb2dsZVBvbHlsaW5lKTtcclxuXHRcdFxyXG5cdFx0aWYoZ29vZ2xlUG9seWxpbmUpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlUG9seWxpbmUgPSBnb29nbGVQb2x5bGluZTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5nb29nbGVQb2x5bGluZSA9IG5ldyBnb29nbGUubWFwcy5Qb2x5bGluZSh0aGlzLnNldHRpbmdzKTtcdFx0XHRcclxuXHRcdFx0XHJcblx0XHRcdGlmKG9wdGlvbnMpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgZ29vZ2xlT3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBvcHRpb25zKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihvcHRpb25zLnBvbHlkYXRhKVxyXG5cdFx0XHRcdFx0Z29vZ2xlT3B0aW9ucy5wYXRoID0gdGhpcy5wYXJzZUdlb21ldHJ5KG9wdGlvbnMucG9seWRhdGEpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKG9wdGlvbnMubGluZWNvbG9yKVxyXG5cdFx0XHRcdFx0Z29vZ2xlT3B0aW9ucy5zdHJva2VDb2xvciA9IFwiI1wiICsgb3B0aW9ucy5saW5lY29sb3I7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYob3B0aW9ucy5saW5ldGhpY2tuZXNzKVxyXG5cdFx0XHRcdFx0Z29vZ2xlT3B0aW9ucy5zdHJva2VXZWlnaHQgPSBwYXJzZUludChvcHRpb25zLmxpbmV0aGlja25lc3MpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKG9wdGlvbnMub3BhY2l0eSlcclxuXHRcdFx0XHRcdGdvb2dsZU9wdGlvbnMuc3Ryb2tlT3BhY2l0eSA9IHBhcnNlRmxvYXQob3B0aW9ucy5vcGFjaXR5KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYob3B0aW9ucyAmJiBvcHRpb25zLnBvbHlkYXRhKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHBhdGggPSB0aGlzLnBhcnNlR2VvbWV0cnkob3B0aW9ucy5wb2x5ZGF0YSk7XHJcblx0XHRcdFx0dGhpcy5zZXRQb2ludHMocGF0aCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5nb29nbGVQb2x5bGluZS53cGdtemFQb2x5bGluZSA9IHRoaXM7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlUG9seWxpbmUsIFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudCh7dHlwZTogXCJjbGlja1wifSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlsaW5lLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLlBvbHlsaW5lLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlsaW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5Hb29nbGVQb2x5bGluZTtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlUG9seWxpbmUucHJvdG90eXBlLnNldEVkaXRhYmxlID0gZnVuY3Rpb24odmFsdWUpXHJcblx0e1xyXG5cdFx0dGhpcy5nb29nbGVQb2x5bGluZS5zZXRPcHRpb25zKHtlZGl0YWJsZTogdmFsdWV9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlsaW5lLnByb3RvdHlwZS5zZXRQb2ludHMgPSBmdW5jdGlvbihwb2ludHMpXHJcblx0e1xyXG5cdFx0dGhpcy5nb29nbGVQb2x5bGluZS5zZXRPcHRpb25zKHtwYXRoOiBwb2ludHN9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVBvbHlsaW5lLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHJlc3VsdCA9IFdQR01aQS5Qb2x5bGluZS5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHJlc3VsdC5wb2ludHMgPSBbXTtcclxuXHRcdFxyXG5cdFx0dmFyIHBhdGggPSB0aGlzLmdvb2dsZVBvbHlsaW5lLmdldFBhdGgoKTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoLmdldExlbmd0aCgpOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBsYXRMbmcgPSBwYXRoLmdldEF0KGkpO1xyXG5cdFx0XHRyZXN1bHQucG9pbnRzLnB1c2goe1xyXG5cdFx0XHRcdGxhdDogbGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogbGF0TG5nLmxuZygpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtcG9seWxpbmUuanMifQ==


// js/v8/google-maps/google-text.js
/**
 * @namespace WPGMZA
 * @module GoogleText
 * @requires WPGMZA.Text
 * @gulp-requires ../text.js
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
 * @gulp-requires google-text.js
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
			top: position.y + "px"
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
			top: position.y + "px"
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
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtdGV4dC1vdmVybGF5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZVRleHRPdmVybGF5XHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuR29vZ2xlVGV4dFxyXG4gKiBAZ3VscC1yZXF1aXJlcyBnb29nbGUtdGV4dC5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlVGV4dE92ZXJsYXkgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdHRoaXMuZWxlbWVudCA9ICQoXCI8ZGl2IGNsYXNzPSd3cGdtemEtZ29vZ2xlLXRleHQtb3ZlcmxheSc+PGRpdiBjbGFzcz0nd3BnbXphLWlubmVyJz48L2Rpdj48L2Rpdj5cIik7XHJcblx0XHRcclxuXHRcdGlmKCFvcHRpb25zKVxyXG5cdFx0XHRvcHRpb25zID0ge307XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMucG9zaXRpb24pXHJcblx0XHRcdHRoaXMucG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLnRleHQpXHJcblx0XHRcdHRoaXMuZWxlbWVudC5maW5kKFwiLndwZ216YS1pbm5lclwiKS50ZXh0KG9wdGlvbnMudGV4dCk7XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMubWFwKVxyXG5cdFx0XHR0aGlzLnNldE1hcChvcHRpb25zLm1hcC5nb29nbGVNYXApO1xyXG5cdH1cclxuXHRcclxuXHRpZih3aW5kb3cuZ29vZ2xlICYmIGdvb2dsZS5tYXBzICYmIGdvb2dsZS5tYXBzLk92ZXJsYXlWaWV3KVxyXG5cdFx0V1BHTVpBLkdvb2dsZVRleHRPdmVybGF5LnByb3RvdHlwZSA9IG5ldyBnb29nbGUubWFwcy5PdmVybGF5VmlldygpO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVUZXh0T3ZlcmxheS5wcm90b3R5cGUub25BZGQgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIG92ZXJsYXlQcm9qZWN0aW9uID0gdGhpcy5nZXRQcm9qZWN0aW9uKCk7XHJcblx0XHR2YXIgcG9zaXRpb24gPSBvdmVybGF5UHJvamVjdGlvbi5mcm9tTGF0TG5nVG9EaXZQaXhlbCh0aGlzLnBvc2l0aW9uLnRvR29vZ2xlTGF0TG5nKCkpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmVsZW1lbnQuY3NzKHtcclxuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuXHRcdFx0bGVmdDogcG9zaXRpb24ueCArIFwicHhcIixcclxuXHRcdFx0dG9wOiBwb3NpdGlvbi55ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0XHR2YXIgcGFuZXMgPSB0aGlzLmdldFBhbmVzKCk7XHJcblx0XHRwYW5lcy5mbG9hdFBhbmUuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50WzBdKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVRleHRPdmVybGF5LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBvdmVybGF5UHJvamVjdGlvbiA9IHRoaXMuZ2V0UHJvamVjdGlvbigpO1xyXG5cdFx0dmFyIHBvc2l0aW9uID0gb3ZlcmxheVByb2plY3Rpb24uZnJvbUxhdExuZ1RvRGl2UGl4ZWwodGhpcy5wb3NpdGlvbi50b0dvb2dsZUxhdExuZygpKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5lbGVtZW50LmNzcyh7XHJcblx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcblx0XHRcdGxlZnQ6IHBvc2l0aW9uLnggKyBcInB4XCIsXHJcblx0XHRcdHRvcDogcG9zaXRpb24ueSArIFwicHhcIlxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVUZXh0T3ZlcmxheS5wcm90b3R5cGUub25SZW1vdmUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dGhpcy5lbGVtZW50LnJlbW92ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlVGV4dE92ZXJsYXkucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dGhpcy5lbGVtZW50LmhpZGUoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVRleHRPdmVybGF5LnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRoaXMuZWxlbWVudC5zaG93KCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVUZXh0T3ZlcmxheS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGlmKHRoaXMuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpKVxyXG5cdFx0XHR0aGlzLmVsZW1lbnQuaGlkZSgpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLmVsZW1lbnQuc2hvdygpO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtdGV4dC1vdmVybGF5LmpzIn0=


// js/v8/google-maps/google-vertex-context-menu.js
/**
 * @namespace WPGMZA
 * @module GoogleVertexContextMenu
 * @requires wpgmza_api_call
 * @gulp-requires ../core.js
 */
jQuery(function($) {
	
	if(WPGMZA.settings.engine != "google-maps")
		return;
	
	if(WPGMZA.googleAPIStatus && WPGMZA.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN")
		return;
	
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtdmVydGV4LWNvbnRleHQtbWVudS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBHb29nbGVWZXJ0ZXhDb250ZXh0TWVudVxyXG4gKiBAcmVxdWlyZXMgd3BnbXphX2FwaV9jYWxsXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2NvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0aWYoV1BHTVpBLnNldHRpbmdzLmVuZ2luZSAhPSBcImdvb2dsZS1tYXBzXCIpXHJcblx0XHRyZXR1cm47XHJcblx0XHJcblx0aWYoV1BHTVpBLmdvb2dsZUFQSVN0YXR1cyAmJiBXUEdNWkEuZ29vZ2xlQVBJU3RhdHVzLmNvZGUgPT0gXCJVU0VSX0NPTlNFTlRfTk9UX0dJVkVOXCIpXHJcblx0XHRyZXR1cm47XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51ID0gZnVuY3Rpb24obWFwRWRpdFBhZ2UpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcEVkaXRQYWdlID0gbWFwRWRpdFBhZ2U7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblx0XHR0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gXCJ3cGdtemEtdmVydGV4LWNvbnRleHQtbWVudVwiO1xyXG5cdFx0dGhpcy5lbGVtZW50LmlubmVySFRNTCA9IFwiRGVsZXRlXCI7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHRoaXMuZWxlbWVudCwgXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLnJlbW92ZVZlcnRleCgpO1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVWZXJ0ZXhDb250ZXh0TWVudS5wcm90b3R5cGUgPSBuZXcgZ29vZ2xlLm1hcHMuT3ZlcmxheVZpZXcoKTtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlVmVydGV4Q29udGV4dE1lbnUucHJvdG90eXBlLm9uQWRkID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdHZhciBtYXAgPSB0aGlzLmdldE1hcCgpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdldFBhbmVzKCkuZmxvYXRQYW5lLmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XHJcblx0XHR0aGlzLmRpdkxpc3RlbmVyID0gZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIobWFwLmdldERpdigpLCBcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGlmKGUudGFyZ2V0ICE9IHNlbGYuZWxlbWVudClcclxuXHRcdFx0XHRzZWxmLmNsb3NlKCk7XHJcblx0XHR9LCB0cnVlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51LnByb3RvdHlwZS5vblJlbW92ZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRnb29nbGUubWFwcy5ldmVudC5yZW1vdmVMaXN0ZW5lcih0aGlzLmRpdkxpc3RlbmVyKTtcclxuXHRcdHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcblx0XHRcclxuXHRcdHRoaXMuc2V0KFwicG9zaXRpb25cIik7XHJcblx0XHR0aGlzLnNldChcInBhdGhcIik7XHJcblx0XHR0aGlzLnNldChcInZlcnRleFwiKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24obWFwLCBwYXRoLCB2ZXJ0ZXgpXHJcblx0e1xyXG5cdFx0dGhpcy5zZXQoJ3Bvc2l0aW9uJywgcGF0aC5nZXRBdCh2ZXJ0ZXgpKTtcclxuXHRcdHRoaXMuc2V0KCdwYXRoJywgcGF0aCk7XHJcblx0XHR0aGlzLnNldCgndmVydGV4JywgdmVydGV4KTtcclxuXHRcdHRoaXMuc2V0TWFwKG1hcCk7XHJcblx0XHR0aGlzLmRyYXcoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR0aGlzLnNldE1hcChudWxsKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0KCdwb3NpdGlvbicpO1xyXG5cdFx0dmFyIHByb2plY3Rpb24gPSB0aGlzLmdldFByb2plY3Rpb24oKTtcclxuXHJcblx0XHRpZiAoIXBvc2l0aW9uIHx8ICFwcm9qZWN0aW9uKVxyXG5cdFx0ICByZXR1cm47XHJcblxyXG5cdFx0dmFyIHBvaW50ID0gcHJvamVjdGlvbi5mcm9tTGF0TG5nVG9EaXZQaXhlbChwb3NpdGlvbik7XHJcblx0XHR0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gcG9pbnQueSArICdweCc7XHJcblx0XHR0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHBvaW50LnggKyAncHgnO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlVmVydGV4Q29udGV4dE1lbnUucHJvdG90eXBlLnJlbW92ZVZlcnRleCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcGF0aCA9IHRoaXMuZ2V0KCdwYXRoJyk7XHJcblx0XHR2YXIgdmVydGV4ID0gdGhpcy5nZXQoJ3ZlcnRleCcpO1xyXG5cclxuXHRcdGlmICghcGF0aCB8fCB2ZXJ0ZXggPT0gdW5kZWZpbmVkKSB7XHJcblx0XHQgIHRoaXMuY2xvc2UoKTtcclxuXHRcdCAgcmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhdGgucmVtb3ZlQXQodmVydGV4KTtcclxuXHRcdHRoaXMuY2xvc2UoKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiZ29vZ2xlLW1hcHMvZ29vZ2xlLXZlcnRleC1jb250ZXh0LW1lbnUuanMifQ==


// js/v8/open-layers/ol-circle.js
/**
 * @namespace WPGMZA
 * @module OLCircle
 * @requires WPGMZA.Circle
 * @gulp-requires ../circle.js
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.OLCircle = function(options, olFeature)
	{
		var self = this;
		
		this.center = {lat: 0, lng: 0};
		this.radius = 0;
		
		this.fillcolor = "#ff0000";
		this.opacity = 0.6;
		
		Parent.call(this, options, olFeature);
		
		this.olStyle = new ol.style.Style(this.getStyleFromSettings());
		
		this.vectorLayer3857 = this.layer = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: this.olStyle
		});
		
		if(olFeature)
			this.olFeature = olFeature;
		else
			this.recreate();
	}
	
	WPGMZA.OLCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.OLCircle.prototype.constructor = WPGMZA.OLCircle;
	
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
		var radius = parseFloat(this.radius) * 1000 / 2;
		var x, y;
		
		x = this.center.lng;
		y = this.center.lat;
		
		var circle4326 = ol.geom.Polygon.circular([x, y], radius, 64);
		var circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
		
		this.olFeature = new ol.Feature(circle3857);
		
		this.layer.getSource().addFeature(this.olFeature);
	}
	
	WPGMZA.OLCircle.prototype.getStyleFromSettings = function()
	{
		var params = {};
				
		/*if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
			});*/
		
		if(this.opacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(this.fillColor, this.opacity)
			});
			
		return params;
	}
	
	WPGMZA.OLCircle.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
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
	
	WPGMZA.OLCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
		
		this.recreate();
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1jaXJjbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgT0xDaXJjbGVcclxuICogQHJlcXVpcmVzIFdQR01aQS5DaXJjbGVcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vY2lyY2xlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdHZhciBQYXJlbnQgPSBXUEdNWkEuQ2lyY2xlO1xyXG5cdFxyXG5cdFdQR01aQS5PTENpcmNsZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIG9sRmVhdHVyZSlcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMuY2VudGVyID0ge2xhdDogMCwgbG5nOiAwfTtcclxuXHRcdHRoaXMucmFkaXVzID0gMDtcclxuXHRcdFxyXG5cdFx0dGhpcy5maWxsY29sb3IgPSBcIiNmZjAwMDBcIjtcclxuXHRcdHRoaXMub3BhY2l0eSA9IDAuNjtcclxuXHRcdFxyXG5cdFx0UGFyZW50LmNhbGwodGhpcywgb3B0aW9ucywgb2xGZWF0dXJlKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5vbFN0eWxlID0gbmV3IG9sLnN0eWxlLlN0eWxlKHRoaXMuZ2V0U3R5bGVGcm9tU2V0dGluZ3MoKSk7XHJcblx0XHRcclxuXHRcdHRoaXMudmVjdG9yTGF5ZXIzODU3ID0gdGhpcy5sYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xyXG5cdFx0XHRzb3VyY2U6IG5ldyBvbC5zb3VyY2UuVmVjdG9yKCksXHJcblx0XHRcdHN0eWxlOiB0aGlzLm9sU3R5bGVcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRpZihvbEZlYXR1cmUpXHJcblx0XHRcdHRoaXMub2xGZWF0dXJlID0gb2xGZWF0dXJlO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLnJlY3JlYXRlKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTENpcmNsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBhcmVudC5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5PTENpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuT0xDaXJjbGU7XHJcblx0XHJcblx0V1BHTVpBLk9MQ2lyY2xlLnByb3RvdHlwZS5yZWNyZWF0ZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZih0aGlzLm9sRmVhdHVyZSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5sYXllci5nZXRTb3VyY2UoKS5yZW1vdmVGZWF0dXJlKHRoaXMub2xGZWF0dXJlKTtcclxuXHRcdFx0ZGVsZXRlIHRoaXMub2xGZWF0dXJlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZighdGhpcy5jZW50ZXIgfHwgIXRoaXMucmFkaXVzKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdC8vIElNUE9SVEFOVDogUGxlYXNlIG5vdGUgdGhhdCBkdWUgdG8gd2hhdCBhcHBlYXJzIHRvIGJlIGEgYnVnIGluIE9wZW5MYXllcnMsIHRoZSBmb2xsb3dpbmcgY29kZSBNVVNUIGJlIGV4ZWN0ZWQgc3BlY2lmaWNhbGx5IGluIHRoaXMgb3JkZXIsIG9yIHRoZSBjaXJjbGUgd29uJ3QgYXBwZWFyXHJcblx0XHR2YXIgcmFkaXVzID0gcGFyc2VGbG9hdCh0aGlzLnJhZGl1cykgKiAxMDAwIC8gMjtcclxuXHRcdHZhciB4LCB5O1xyXG5cdFx0XHJcblx0XHR4ID0gdGhpcy5jZW50ZXIubG5nO1xyXG5cdFx0eSA9IHRoaXMuY2VudGVyLmxhdDtcclxuXHRcdFxyXG5cdFx0dmFyIGNpcmNsZTQzMjYgPSBvbC5nZW9tLlBvbHlnb24uY2lyY3VsYXIoW3gsIHldLCByYWRpdXMsIDY0KTtcclxuXHRcdHZhciBjaXJjbGUzODU3ID0gY2lyY2xlNDMyNi5jbG9uZSgpLnRyYW5zZm9ybSgnRVBTRzo0MzI2JywgJ0VQU0c6Mzg1NycpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sRmVhdHVyZSA9IG5ldyBvbC5GZWF0dXJlKGNpcmNsZTM4NTcpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmxheWVyLmdldFNvdXJjZSgpLmFkZEZlYXR1cmUodGhpcy5vbEZlYXR1cmUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xDaXJjbGUucHJvdG90eXBlLmdldFN0eWxlRnJvbVNldHRpbmdzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSB7fTtcclxuXHRcdFx0XHRcclxuXHRcdC8qaWYodGhpcy5zZXR0aW5ncy5zdHJva2VPcGFjaXR5KVxyXG5cdFx0XHRwYXJhbXMuc3Ryb2tlID0gbmV3IG9sLnN0eWxlLlN0cm9rZSh7XHJcblx0XHRcdFx0Y29sb3I6IFdQR01aQS5oZXhPcGFjaXR5VG9SR0JBKHRoaXMuc2V0dGluZ3Muc3Ryb2tlQ29sb3IsIHRoaXMuc2V0dGluZ3Muc3Ryb2tlT3BhY2l0eSlcclxuXHRcdFx0fSk7Ki9cclxuXHRcdFxyXG5cdFx0aWYodGhpcy5vcGFjaXR5KVxyXG5cdFx0XHRwYXJhbXMuZmlsbCA9IG5ldyBvbC5zdHlsZS5GaWxsKHtcclxuXHRcdFx0XHRjb2xvcjogV1BHTVpBLmhleE9wYWNpdHlUb1JHQkEodGhpcy5maWxsQ29sb3IsIHRoaXMub3BhY2l0eSlcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0cmV0dXJuIHBhcmFtcztcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MQ2lyY2xlLnByb3RvdHlwZS51cGRhdGVTdHlsZUZyb21TZXR0aW5ncyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQvLyBSZS1jcmVhdGUgdGhlIHN0eWxlIC0gd29ya2luZyBvbiBpdCBkaXJlY3RseSBkb2Vzbid0IGNhdXNlIGEgcmUtcmVuZGVyXHJcblx0XHR2YXIgcGFyYW1zID0gdGhpcy5nZXRTdHlsZUZyb21TZXR0aW5ncygpO1xyXG5cdFx0dGhpcy5vbFN0eWxlID0gbmV3IG9sLnN0eWxlLlN0eWxlKHBhcmFtcyk7XHJcblx0XHR0aGlzLmxheWVyLnNldFN0eWxlKHRoaXMub2xTdHlsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTENpcmNsZS5wcm90b3R5cGUuc2V0VmlzaWJsZSA9IGZ1bmN0aW9uKHZpc2libGUpXHJcblx0e1xyXG5cdFx0dGhpcy5sYXllci5zZXRWaXNpYmxlKHZpc2libGUgPyB0cnVlIDogZmFsc2UpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xDaXJjbGUucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uKGNlbnRlcilcclxuXHR7XHJcblx0XHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRDZW50ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZWNyZWF0ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xDaXJjbGUucHJvdG90eXBlLnNldFJhZGl1cyA9IGZ1bmN0aW9uKHJhZGl1cylcclxuXHR7XHJcblx0XHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZWNyZWF0ZSgpO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1jaXJjbGUuanMifQ==


// js/v8/open-layers/ol-geocoder.js
/**
 * @namespace WPGMZA
 * @module OLGeocoder
 * @requires WPGMZA.Geocoder
 * @gulp-requires ../geocoder.js
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
		
		if(options.componentRestrictions && options.componentRestrictions.country)
			data.countrycodes = options.componentRestrictions.country;
		
		$.ajax("https://nominatim.openstreetmap.org/search/", {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1nZW9jb2Rlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBPTEdlb2NvZGVyXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuR2VvY29kZXJcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vZ2VvY29kZXIuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQGNsYXNzIE9MR2VvY29kZXJcclxuXHQgKiBAZXh0ZW5kcyBHZW9jb2RlclxyXG5cdCAqIEBzdW1tYXJ5IE9wZW5MYXllcnMgZ2VvY29kZXIgLSB1c2VzIE5vbWluYXRpbSBieSBkZWZhdWx0XHJcblx0ICovXHJcblx0V1BHTVpBLk9MR2VvY29kZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTEdlb2NvZGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLkdlb2NvZGVyLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLk9MR2VvY29kZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk9MR2VvY29kZXI7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQGZ1bmN0aW9uIGdldFJlc3BvbnNlRnJvbUNhY2hlXHJcblx0ICogQGFjY2VzcyBwcm90ZWN0ZWRcclxuXHQgKiBAc3VtbWFyeSBUcmllcyB0byByZXRyaWV2ZSBjYWNoZWQgY29vcmRpbmF0ZXMgZnJvbSBzZXJ2ZXIgY2FjaGVcclxuXHQgKiBAcGFyYW0ge3N0cmluZ30gYWRkcmVzcyBUaGUgc3RyZWV0IGFkZHJlc3MgdG8gZ2VvY29kZVxyXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFdoZXJlIHRvIHNlbmQgdGhlIHJlc3VsdHMsIGFzIGFuIGFycmF5XHJcblx0ICogQHJldHVybiB7dm9pZH1cclxuXHQgKi9cclxuXHRXUEdNWkEuT0xHZW9jb2Rlci5wcm90b3R5cGUuZ2V0UmVzcG9uc2VGcm9tQ2FjaGUgPSBmdW5jdGlvbihxdWVyeSwgY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0V1BHTVpBLnJlc3RBUEkuY2FsbChcIi9nZW9jb2RlLWNhY2hlXCIsIHtcclxuXHRcdFx0ZGF0YToge1xyXG5cdFx0XHRcdHF1ZXJ5OiBKU09OLnN0cmluZ2lmeShxdWVyeSlcclxuXHRcdFx0fSxcclxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UsIHhociwgc3RhdHVzKSB7XHJcblx0XHRcdFx0Ly8gTGVnYWN5IGNvbXBhdGliaWxpdHkgc3VwcG9ydFxyXG5cdFx0XHRcdHJlc3BvbnNlLmxuZyA9IHJlc3BvbnNlLmxvbjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjYWxsYmFjayhyZXNwb25zZSk7XHJcblx0XHRcdH0sXHJcblx0XHRcdHVzZUNvbXByZXNzZWRQYXRoVmFyaWFibGU6IHRydWVcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQvKiQuYWpheChXUEdNWkEuYWpheHVybCwge1xyXG5cdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0YWN0aW9uOiBcIndwZ216YV9xdWVyeV9ub21pbmF0aW1fY2FjaGVcIixcclxuXHRcdFx0XHRxdWVyeTogSlNPTi5zdHJpbmdpZnkocXVlcnkpXHJcblx0XHRcdH0sXHJcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlLCB4aHIsIHN0YXR1cykge1xyXG5cdFx0XHRcdC8vIExlZ2FjeSBjb21wYXRpYmlsaXR5IHN1cHBvcnRcclxuXHRcdFx0XHRyZXNwb25zZS5sbmcgPSByZXNwb25zZS5sb247XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Y2FsbGJhY2socmVzcG9uc2UpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTsqL1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBAZnVuY3Rpb24gZ2V0UmVzcG9uc2VGcm9tTm9taW5hdGltXHJcblx0ICogQGFjY2VzcyBwcm90ZWN0ZWRcclxuXHQgKiBAc3VtbWFyeSBRdWVyaWVzIE5vbWluYXRpbSBvbiB0aGUgc3BlY2lmaWVkIGFkZHJlc3NcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgb3B0aW9ucyBmb3IgZ2VvY29kaW5nLCBhZGRyZXNzIGlzIGEgbWFuZGF0b3J5IGZpZWxkXHJcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIHNlbmQgdGhlIHJlc3VsdHMgdG8sIGFzIGFuIGFycmF5XHJcblx0ICovXHJcblx0V1BHTVpBLk9MR2VvY29kZXIucHJvdG90eXBlLmdldFJlc3BvbnNlRnJvbU5vbWluYXRpbSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKVxyXG5cdHtcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRxOiBvcHRpb25zLmFkZHJlc3MsXHJcblx0XHRcdGZvcm1hdDogXCJqc29uXCJcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMuY29tcG9uZW50UmVzdHJpY3Rpb25zICYmIG9wdGlvbnMuY29tcG9uZW50UmVzdHJpY3Rpb25zLmNvdW50cnkpXHJcblx0XHRcdGRhdGEuY291bnRyeWNvZGVzID0gb3B0aW9ucy5jb21wb25lbnRSZXN0cmljdGlvbnMuY291bnRyeTtcclxuXHRcdFxyXG5cdFx0JC5hamF4KFwiaHR0cHM6Ly9ub21pbmF0aW0ub3BlbnN0cmVldG1hcC5vcmcvc2VhcmNoL1wiLCB7XHJcblx0XHRcdGRhdGE6IGRhdGEsXHJcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlLCB4aHIsIHN0YXR1cykge1xyXG5cdFx0XHRcdGNhbGxiYWNrKHJlc3BvbnNlKTtcclxuXHRcdFx0fSxcclxuXHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlLCB4aHIsIHN0YXR1cykge1xyXG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIFdQR01aQS5HZW9jb2Rlci5GQUlMKVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQGZ1bmN0aW9uIGNhY2hlUmVzcG9uc2VcclxuXHQgKiBAYWNjZXNzIHByb3RlY3RlZFxyXG5cdCAqIEBzdW1tYXJ5IENhY2hlcyBhIHJlc3BvbnNlIG9uIHRoZSBzZXJ2ZXIsIHVzdWFsbHkgYWZ0ZXIgaXQncyBiZWVuIHJldHVybmVkIGZyb20gTm9taW5hdGltXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IGFkZHJlc3MgVGhlIHN0cmVldCBhZGRyZXNzXHJcblx0ICogQHBhcmFtIHtvYmplY3R8YXJyYXl9IHJlc3BvbnNlIFRoZSByZXNwb25zZSB0byBjYWNoZVxyXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTEdlb2NvZGVyLnByb3RvdHlwZS5jYWNoZVJlc3BvbnNlID0gZnVuY3Rpb24ocXVlcnksIHJlc3BvbnNlKVxyXG5cdHtcclxuXHRcdCQuYWpheChXUEdNWkEuYWpheHVybCwge1xyXG5cdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0YWN0aW9uOiBcIndwZ216YV9zdG9yZV9ub21pbmF0aW1fY2FjaGVcIixcclxuXHRcdFx0XHRxdWVyeTogSlNPTi5zdHJpbmdpZnkocXVlcnkpLFxyXG5cdFx0XHRcdHJlc3BvbnNlOiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSlcclxuXHRcdFx0fSxcclxuXHRcdFx0bWV0aG9kOiBcIlBPU1RcIlxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBAZnVuY3Rpb24gY2xlYXJDYWNoZVxyXG5cdCAqIEBhY2Nlc3MgcHJvdGVjdGVkXHJcblx0ICogQHN1bW1hcnkgQ2xlYXJzIHRoZSBOb21hbmF0aW0gZ2VvY29kZSBjYWNoZVxyXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTEdlb2NvZGVyLnByb3RvdHlwZS5jbGVhckNhY2hlID0gZnVuY3Rpb24oY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0JC5hamF4KFdQR01aQS5hamF4dXJsLCB7XHJcblx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRhY3Rpb246IFwid3BnbXphX2NsZWFyX25vbWluYXRpbV9jYWNoZVwiXHJcblx0XHRcdH0sXHJcblx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXHJcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRjYWxsYmFjayhyZXNwb25zZSk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xHZW9jb2Rlci5wcm90b3R5cGUuZ2V0TGF0TG5nRnJvbUFkZHJlc3MgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaylcclxuXHR7XHJcblx0XHRyZXR1cm4gV1BHTVpBLk9MR2VvY29kZXIucHJvdG90eXBlLmdlb2NvZGUob3B0aW9ucywgY2FsbGJhY2spO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xHZW9jb2Rlci5wcm90b3R5cGUuZ2V0QWRkcmVzc0Zyb21MYXRMbmcgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaylcclxuXHR7XHJcblx0XHRyZXR1cm4gV1BHTVpBLk9MR2VvY29kZXIucHJvdG90eXBlLmdlb2NvZGUob3B0aW9ucywgY2FsbGJhY2spO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xHZW9jb2Rlci5wcm90b3R5cGUuZ2VvY29kZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0aWYoIW9wdGlvbnMpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3B0aW9uc1wiKTtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLkxhdExuZy5SRUdFWFAudGVzdChvcHRpb25zLmFkZHJlc3MpKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgbGF0TG5nID0gV1BHTVpBLkxhdExuZy5mcm9tU3RyaW5nKG9wdGlvbnMuYWRkcmVzcyk7XHJcblx0XHRcdFxyXG5cdFx0XHRjYWxsYmFjayhbe1xyXG5cdFx0XHRcdGdlb21ldHJ5OiB7XHJcblx0XHRcdFx0XHRsb2NhdGlvbjogbGF0TG5nXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRsYXRMbmc6IGxhdExuZyxcclxuXHRcdFx0XHRsYXQ6IGxhdExuZy5sYXQsXHJcblx0XHRcdFx0bG5nOiBsYXRMbmcubG5nXHJcblx0XHRcdH1dLCBXUEdNWkEuR2VvY29kZXIuU1VDQ0VTUyk7XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMubG9jYXRpb24pXHJcblx0XHRcdG9wdGlvbnMubGF0TG5nID0gbmV3IFdQR01aQS5MYXRMbmcob3B0aW9ucy5sb2NhdGlvbik7XHJcblx0XHRcclxuXHRcdHZhciBmaW5pc2gsIGxvY2F0aW9uO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLmFkZHJlc3MpXHJcblx0XHR7XHJcblx0XHRcdGxvY2F0aW9uID0gb3B0aW9ucy5hZGRyZXNzO1xyXG5cdFx0XHRcclxuXHRcdFx0ZmluaXNoID0gZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5sZW5ndGg7IGkrKylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXNwb25zZVtpXS5nZW9tZXRyeSA9IHtcclxuXHRcdFx0XHRcdFx0bG9jYXRpb246IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0XHRcdFx0XHRsYXQ6IHBhcnNlRmxvYXQocmVzcG9uc2VbaV0ubGF0KSxcclxuXHRcdFx0XHRcdFx0XHRsbmc6IHBhcnNlRmxvYXQocmVzcG9uc2VbaV0ubG9uKVxyXG5cdFx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cmVzcG9uc2VbaV0ubGF0TG5nID0ge1xyXG5cdFx0XHRcdFx0XHRsYXQ6IHBhcnNlRmxvYXQocmVzcG9uc2VbaV0ubGF0KSxcclxuXHRcdFx0XHRcdFx0bG5nOiBwYXJzZUZsb2F0KHJlc3BvbnNlW2ldLmxvbilcclxuXHRcdFx0XHRcdH07XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHJlc3BvbnNlW2ldLmJvdW5kcyA9IG5ldyBXUEdNWkEuTGF0TG5nQm91bmRzKFxyXG5cdFx0XHRcdFx0XHRuZXcgV1BHTVpBLkxhdExuZyh7XHJcblx0XHRcdFx0XHRcdFx0bGF0OiByZXNwb25zZVtpXS5ib3VuZGluZ2JveFsxXSxcclxuXHRcdFx0XHRcdFx0XHRsbmc6IHJlc3BvbnNlW2ldLmJvdW5kaW5nYm94WzJdXHJcblx0XHRcdFx0XHRcdH0pLFxyXG5cdFx0XHRcdFx0XHRuZXcgV1BHTVpBLkxhdExuZyh7XHJcblx0XHRcdFx0XHRcdFx0bGF0OiByZXNwb25zZVtpXS5ib3VuZGluZ2JveFswXSxcclxuXHRcdFx0XHRcdFx0XHRsbmc6IHJlc3BvbnNlW2ldLmJvdW5kaW5nYm94WzNdXHJcblx0XHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBCYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggb2xkIFVHTVxyXG5cdFx0XHRcdFx0cmVzcG9uc2VbaV0ubG5nID0gcmVzcG9uc2VbaV0ubG9uO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjYWxsYmFjayhyZXNwb25zZSwgc3RhdHVzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihvcHRpb25zLmxhdExuZylcclxuXHRcdHtcclxuXHRcdFx0bG9jYXRpb24gPSBvcHRpb25zLmxhdExuZy50b1N0cmluZygpO1xyXG5cdFx0XHRcclxuXHRcdFx0ZmluaXNoID0gZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBhZGRyZXNzID0gcmVzcG9uc2VbMF0uZGlzcGxheV9uYW1lO1xyXG5cdFx0XHRcdGNhbGxiYWNrKFthZGRyZXNzXSwgc3RhdHVzKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBzdXBwbHkgZWl0aGVyIGEgbGF0TG5nIG9yIGFkZHJlc3NcIilcclxuXHRcdFxyXG5cdFx0dmFyIHF1ZXJ5ID0ge2xvY2F0aW9uOiBsb2NhdGlvbiwgb3B0aW9uczogb3B0aW9uc307XHJcblx0XHR0aGlzLmdldFJlc3BvbnNlRnJvbUNhY2hlKHF1ZXJ5LCBmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRpZihyZXNwb25zZS5sZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRmaW5pc2gocmVzcG9uc2UsIFdQR01aQS5HZW9jb2Rlci5TVUNDRVNTKTtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHNlbGYuZ2V0UmVzcG9uc2VGcm9tTm9taW5hdGltKCQuZXh0ZW5kKG9wdGlvbnMsIHthZGRyZXNzOiBsb2NhdGlvbn0pLCBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzKSB7XHJcblx0XHRcdFx0aWYoc3RhdHVzID09IFdQR01aQS5HZW9jb2Rlci5GQUlMKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGNhbGxiYWNrKG51bGwsIFdQR01aQS5HZW9jb2Rlci5GQUlMKTtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYocmVzcG9uc2UubGVuZ3RoID09IDApXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y2FsbGJhY2soW10sIFdQR01aQS5HZW9jb2Rlci5aRVJPX1JFU1VMVFMpO1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmaW5pc2gocmVzcG9uc2UsIFdQR01aQS5HZW9jb2Rlci5TVUNDRVNTKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRzZWxmLmNhY2hlUmVzcG9uc2UocXVlcnksIHJlc3BvbnNlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoib3Blbi1sYXllcnMvb2wtZ2VvY29kZXIuanMifQ==


// js/v8/open-layers/ol-info-window.js
/**
 * @namespace WPGMZA
 * @module OLInfoWindow
 * @requires WPGMZA.InfoWindow
 * @gulp-requires ../info-window.js
 * @pro-requires WPGMZA.ProInfoWindow
 * @gulp-pro-requires pro-info-window.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLInfoWindow = function(mapObject)
	{
		var self = this;
		
		Parent.call(this, mapObject);
		
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
	 * TODO: This should take a mapObject, not an event
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.OLInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		var latLng = mapObject.getPosition();
		
		if(!Parent.prototype.open.call(this, map, mapObject))
			return false;
		
		// Set parent for events to bubble up
		this.parent = map;
		
		if(this.overlay)
			this.mapObject.map.olMap.removeOverlay(this.overlay);
			
		this.overlay = new ol.Overlay({
			element: this.element,
			stopEvent: false
		});
		
		this.overlay.setPosition(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		self.mapObject.map.olMap.addOverlay(this.overlay);
		
		$(this.element).show();
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			WPGMZA.getImageDimensions(mapObject.getIcon(), function(size) {
				
				$(self.element).css({left: Math.round(size.width / 2) + "px"});
				
			});
		}
		
		this.trigger("infowindowopen");
		this.trigger("domready");
	}
	
	WPGMZA.OLInfoWindow.prototype.close = function(event)
	{
		// TODO: Why? This shouldn't have to be here. Removing the overlay should hide the element (it doesn't)
		$(this.element).hide();
		
		if(!this.overlay)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.trigger("infowindowclose");
		
		this.mapObject.map.olMap.removeOverlay(this.overlay);
		this.overlay = null;
	}
	
	WPGMZA.OLInfoWindow.prototype.setContent = function(html)
	{
		$(this.element).html("<i class='fa fa-times ol-info-window-close' aria-hidden='true'></i>" + html);
	}
	
	WPGMZA.OLInfoWindow.prototype.setOptions = function(options)
	{
		if(options.maxWidth)
		{
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
		
		if(this.isPanIntoViewAllowed)
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
				var offset	= -height * 0.45;
				
				self.mapObject.map.animateNudge(0, offset, self.mapObject.getPosition());
			}
			
			imgs.each(function(index, el) {
				el.onload = function() {
					if(++numImagesLoaded == numImages && !inside(self.element, self.mapObject.map.element))
						panIntoView();
				}
			});
			
			if(numImages == 0 && !inside(self.element, self.mapObject.map.element))
				panIntoView();
		}
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1pbmZvLXdpbmRvdy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBPTEluZm9XaW5kb3dcclxuICogQHJlcXVpcmVzIFdQR01aQS5JbmZvV2luZG93XHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2luZm8td2luZG93LmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb0luZm9XaW5kb3dcclxuICogQGd1bHAtcHJvLXJlcXVpcmVzIHByby1pbmZvLXdpbmRvdy5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5PTEluZm9XaW5kb3cgPSBmdW5jdGlvbihtYXBPYmplY3QpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQuY2FsbCh0aGlzLCBtYXBPYmplY3QpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmVsZW1lbnQgPSAkKFwiPGRpdiBjbGFzcz0nd3BnbXphLWluZm93aW5kb3cgb2wtaW5mby13aW5kb3ctY29udGFpbmVyIG9sLWluZm8td2luZG93LXBsYWluJz48L2Rpdj5cIilbMF07XHJcblx0XHRcdFxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIub2wtaW5mby13aW5kb3ctY2xvc2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5jbG9zZSgpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9JbmZvV2luZG93O1xyXG5cdGVsc2VcclxuXHRcdFBhcmVudCA9IFdQR01aQS5JbmZvV2luZG93O1xyXG5cdFxyXG5cdFdQR01aQS5PTEluZm9XaW5kb3cucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQYXJlbnQucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuT0xJbmZvV2luZG93LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5PTEluZm9XaW5kb3c7XHJcblx0XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFdQR01aQS5PTEluZm9XaW5kb3cucHJvdG90eXBlLCBcImlzUGFuSW50b1ZpZXdBbGxvd2VkXCIsIHtcclxuXHRcdFxyXG5cdFx0XCJnZXRcIjogZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE9wZW5zIHRoZSBpbmZvIHdpbmRvd1xyXG5cdCAqIFRPRE86IFRoaXMgc2hvdWxkIHRha2UgYSBtYXBPYmplY3QsIG5vdCBhbiBldmVudFxyXG5cdCAqIEByZXR1cm4gYm9vbGVhbiBGQUxTRSBpZiB0aGUgaW5mbyB3aW5kb3cgc2hvdWxkIG5vdCAmIHdpbGwgbm90IG9wZW4sIFRSVUUgaWYgaXQgd2lsbFxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTEluZm9XaW5kb3cucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbihtYXAsIG1hcE9iamVjdClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgbGF0TG5nID0gbWFwT2JqZWN0LmdldFBvc2l0aW9uKCk7XHJcblx0XHRcclxuXHRcdGlmKCFQYXJlbnQucHJvdG90eXBlLm9wZW4uY2FsbCh0aGlzLCBtYXAsIG1hcE9iamVjdCkpXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFxyXG5cdFx0Ly8gU2V0IHBhcmVudCBmb3IgZXZlbnRzIHRvIGJ1YmJsZSB1cFxyXG5cdFx0dGhpcy5wYXJlbnQgPSBtYXA7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMub3ZlcmxheSlcclxuXHRcdFx0dGhpcy5tYXBPYmplY3QubWFwLm9sTWFwLnJlbW92ZU92ZXJsYXkodGhpcy5vdmVybGF5KTtcclxuXHRcdFx0XHJcblx0XHR0aGlzLm92ZXJsYXkgPSBuZXcgb2wuT3ZlcmxheSh7XHJcblx0XHRcdGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcclxuXHRcdFx0c3RvcEV2ZW50OiBmYWxzZVxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMub3ZlcmxheS5zZXRQb3NpdGlvbihvbC5wcm9qLmZyb21Mb25MYXQoW1xyXG5cdFx0XHRsYXRMbmcubG5nLFxyXG5cdFx0XHRsYXRMbmcubGF0XHJcblx0XHRdKSk7XHJcblx0XHRzZWxmLm1hcE9iamVjdC5tYXAub2xNYXAuYWRkT3ZlcmxheSh0aGlzLm92ZXJsYXkpO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuc2hvdygpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRXUEdNWkEuZ2V0SW1hZ2VEaW1lbnNpb25zKG1hcE9iamVjdC5nZXRJY29uKCksIGZ1bmN0aW9uKHNpemUpIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQkKHNlbGYuZWxlbWVudCkuY3NzKHtsZWZ0OiBNYXRoLnJvdW5kKHNpemUud2lkdGggLyAyKSArIFwicHhcIn0pO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy50cmlnZ2VyKFwiaW5mb3dpbmRvd29wZW5cIik7XHJcblx0XHR0aGlzLnRyaWdnZXIoXCJkb21yZWFkeVwiKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MSW5mb1dpbmRvdy5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHQvLyBUT0RPOiBXaHk/IFRoaXMgc2hvdWxkbid0IGhhdmUgdG8gYmUgaGVyZS4gUmVtb3ZpbmcgdGhlIG92ZXJsYXkgc2hvdWxkIGhpZGUgdGhlIGVsZW1lbnQgKGl0IGRvZXNuJ3QpXHJcblx0XHQkKHRoaXMuZWxlbWVudCkuaGlkZSgpO1xyXG5cdFx0XHJcblx0XHRpZighdGhpcy5vdmVybGF5KVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5jbG9zZS5jYWxsKHRoaXMpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnRyaWdnZXIoXCJpbmZvd2luZG93Y2xvc2VcIik7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwT2JqZWN0Lm1hcC5vbE1hcC5yZW1vdmVPdmVybGF5KHRoaXMub3ZlcmxheSk7XHJcblx0XHR0aGlzLm92ZXJsYXkgPSBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xJbmZvV2luZG93LnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24oaHRtbClcclxuXHR7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuaHRtbChcIjxpIGNsYXNzPSdmYSBmYS10aW1lcyBvbC1pbmZvLXdpbmRvdy1jbG9zZScgYXJpYS1oaWRkZW49J3RydWUnPjwvaT5cIiArIGh0bWwpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xJbmZvV2luZG93LnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRpZihvcHRpb25zLm1heFdpZHRoKVxyXG5cdFx0e1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkuY3NzKHtcIm1heC13aWR0aFwiOiBvcHRpb25zLm1heFdpZHRoICsgXCJweFwifSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTEluZm9XaW5kb3cucHJvdG90eXBlLm9uT3BlbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgaW1ncyA9ICQodGhpcy5lbGVtZW50KS5maW5kKFwiaW1nXCIpO1xyXG5cdFx0dmFyIG51bUltYWdlcyA9IGltZ3MubGVuZ3RoO1xyXG5cdFx0dmFyIG51bUltYWdlc0xvYWRlZCA9IDA7XHJcblx0XHRcclxuXHRcdFdQR01aQS5JbmZvV2luZG93LnByb3RvdHlwZS5vbk9wZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5pc1BhbkludG9WaWV3QWxsb3dlZClcclxuXHRcdHtcclxuXHRcdFx0ZnVuY3Rpb24gaW5zaWRlKGVsLCB2aWV3cG9ydClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBhID0gJChlbClbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblx0XHRcdFx0dmFyIGIgPSAkKHZpZXdwb3J0KVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRyZXR1cm4gYS5sZWZ0ID49IGIubGVmdCAmJiBhLmxlZnQgPD0gYi5yaWdodCAmJlxyXG5cdFx0XHRcdFx0XHRhLnJpZ2h0IDw9IGIucmlnaHQgJiYgYS5yaWdodCA+PSBiLmxlZnQgJiZcclxuXHRcdFx0XHRcdFx0YS50b3AgPj0gYi50b3AgJiYgYS50b3AgPD0gYi5ib3R0b20gJiZcclxuXHRcdFx0XHRcdFx0YS5ib3R0b20gPD0gYi5ib3R0b20gJiYgYS5ib3R0b20gPj0gYi50b3A7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGZ1bmN0aW9uIHBhbkludG9WaWV3KClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBoZWlnaHRcdD0gJChzZWxmLmVsZW1lbnQpLmhlaWdodCgpO1xyXG5cdFx0XHRcdHZhciBvZmZzZXRcdD0gLWhlaWdodCAqIDAuNDU7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c2VsZi5tYXBPYmplY3QubWFwLmFuaW1hdGVOdWRnZSgwLCBvZmZzZXQsIHNlbGYubWFwT2JqZWN0LmdldFBvc2l0aW9uKCkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpbWdzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XHJcblx0XHRcdFx0ZWwub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0XHRpZigrK251bUltYWdlc0xvYWRlZCA9PSBudW1JbWFnZXMgJiYgIWluc2lkZShzZWxmLmVsZW1lbnQsIHNlbGYubWFwT2JqZWN0Lm1hcC5lbGVtZW50KSlcclxuXHRcdFx0XHRcdFx0cGFuSW50b1ZpZXcoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYobnVtSW1hZ2VzID09IDAgJiYgIWluc2lkZShzZWxmLmVsZW1lbnQsIHNlbGYubWFwT2JqZWN0Lm1hcC5lbGVtZW50KSlcclxuXHRcdFx0XHRwYW5JbnRvVmlldygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1pbmZvLXdpbmRvdy5qcyJ9


// js/v8/open-layers/ol-map.js
/**
 * @namespace WPGMZA
 * @module OLMap
 * @requires WPGMZA.Map
 * @gulp-requires ../map.js
 * @pro-requires WPGMZA.ProMap
 * @gulp-pro-requires pro-map.js
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
			view: new ol.View(viewOptions)
		});
		
		// TODO: Re-implement using correct setting names
		// Interactions
		this.olMap.getInteractions().forEach(function(interaction) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive( (self.settings.wpgmza_settings_map_draggable == "yes" ? false : true) );
			else if(interaction instanceof ol.interaction.DoubleClickZoom)
				interaction.setActive( (self.settings.wpgmza_settings_map_clickzoom ? false : true) );
			else if(interaction instanceof ol.interaction.MouseWheelZoom)
				interaction.setActive( (self.settings.wpgmza_settings_map_scroll == "yes" ? false : true) );
			
		}, this);
		
		// Cooperative gesture handling
		if(!(this.settings.wpgmza_force_greedy_gestures == "greedy" || this.settings.wpgmza_force_greedy_gestures == "yes"))
		{
			this.gestureOverlay = $("<div class='wpgmza-gesture-overlay'></div>")
			this.gestureOverlayTimeoutID = null;
			
			if(WPGMZA.isTouchDevice())
			{
				// On touch devices, require two fingers to drag and pan
				// NB: Temporarily removed due to inconsistent behaviour
				/*this.olMap.getInteractions().forEach(function(interaction) {
					
					if(interaction instanceof ol.interaction.DragPan)
						self.olMap.removeInteraction(interaction);
					
				});
				
				this.olMap.addInteraction(new ol.interaction.DragPan({
					
					condition: function(olBrowserEvent) {
						
						var allowed = olBrowserEvent.originalEvent.touches.length == 2;
						
						if(!allowed)
							self.showGestureOverlay();
						
						return allowed;
					}
					
				}));
				
				this.gestureOverlay.text(WPGMZA.localized_strings.use_two_fingers);*/
			}
			else
			{
				// On desktops, require Ctrl + zoom to zoom, show an overlay if that condition is not met
				this.olMap.on("wheel", function(event) {
					
					if(!ol.events.condition.platformModifierKeyOnly(event))
					{
						self.showGestureOverlay();
						event.originalEvent.preventDefault();
						return false;
					}
					
				});
				
				this.gestureOverlay.text(WPGMZA.localized_strings.use_ctrl_scroll_to_zoom);
			}
		}
		
		// Controls
		this.olMap.getControls().forEach(function(control) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(control instanceof ol.control.Zoom && WPGMZA.settings.wpgmza_settings_map_zoom == "yes")
				self.olMap.removeControl(control);
			
		}, this);
		
		if(WPGMZA.settings.wpgmza_settings_map_full_screen_control != "yes")
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
				
				if(!marker)
					return;
				
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
		
		// Store locator center
		var marker;
		if(this.storeLocator && (marker = this.storeLocator.centerPointMarker))
		{
			this.olMap.addOverlay(marker.overlay);
			marker.setVisible(false);
		}
		
		// Right click listener
		$(this.element).on("click contextmenu", function(event) {
			
			var isRight;
			event = event || window.event;
			
			var latLng = self.pixelsToLatLng(event.offsetX, event.offsetY);
			
			if("which" in event)
				isRight = event.which == 3;
			else if("button" in event)
				isRight = event.button == 2;
			
			if(event.which == 1 || event.button == 1)
			{
				if(self.isBeingDragged)
					return;
				
				// Left click
				if($(event.target).closest(".ol-marker").length)
					return; // A marker was clicked, not the map. Do nothing
				
				self.trigger({
					type: "click",
					latLng: latLng
				});
				
				return;
			}
			
			if(!isRight)
				return;
			
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
		
		if(WPGMZA.settings.tile_server_url)
			options.url = WPGMZA.settings.tile_server_url;
		
		return new ol.layer.Tile({
			source: new ol.source.OSM(options)
		});
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1tYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgT0xNYXBcclxuICogQHJlcXVpcmVzIFdQR01aQS5NYXBcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vbWFwLmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb01hcFxyXG4gKiBAZ3VscC1wcm8tcmVxdWlyZXMgcHJvLW1hcC5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5PTE1hcCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQuY2FsbCh0aGlzLCBlbGVtZW50KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHR2YXIgdmlld09wdGlvbnMgPSB0aGlzLnNldHRpbmdzLnRvT0xWaWV3T3B0aW9ucygpO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuaHRtbChcIlwiKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5vbE1hcCA9IG5ldyBvbC5NYXAoe1xyXG5cdFx0XHR0YXJnZXQ6ICQoZWxlbWVudClbMF0sXHJcblx0XHRcdGxheWVyczogW1xyXG5cdFx0XHRcdHRoaXMuZ2V0VGlsZUxheWVyKClcclxuXHRcdFx0XSxcclxuXHRcdFx0dmlldzogbmV3IG9sLlZpZXcodmlld09wdGlvbnMpXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Ly8gVE9ETzogUmUtaW1wbGVtZW50IHVzaW5nIGNvcnJlY3Qgc2V0dGluZyBuYW1lc1xyXG5cdFx0Ly8gSW50ZXJhY3Rpb25zXHJcblx0XHR0aGlzLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24oaW50ZXJhY3Rpb24pIHtcclxuXHRcdFx0XHJcblx0XHRcdC8vIE5COiBUaGUgdHJ1ZSBhbmQgZmFsc2UgdmFsdWVzIGFyZSBmbGlwcGVkIGJlY2F1c2UgdGhlc2Ugc2V0dGluZ3MgcmVwcmVzZW50IHRoZSBcImRpc2FibGVkXCIgc3RhdGUgd2hlbiB0cnVlXHJcblx0XHRcdGlmKGludGVyYWN0aW9uIGluc3RhbmNlb2Ygb2wuaW50ZXJhY3Rpb24uRHJhZ1BhbilcclxuXHRcdFx0XHRpbnRlcmFjdGlvbi5zZXRBY3RpdmUoIChzZWxmLnNldHRpbmdzLndwZ216YV9zZXR0aW5nc19tYXBfZHJhZ2dhYmxlID09IFwieWVzXCIgPyBmYWxzZSA6IHRydWUpICk7XHJcblx0XHRcdGVsc2UgaWYoaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBvbC5pbnRlcmFjdGlvbi5Eb3VibGVDbGlja1pvb20pXHJcblx0XHRcdFx0aW50ZXJhY3Rpb24uc2V0QWN0aXZlKCAoc2VsZi5zZXR0aW5ncy53cGdtemFfc2V0dGluZ3NfbWFwX2NsaWNrem9vbSA/IGZhbHNlIDogdHJ1ZSkgKTtcclxuXHRcdFx0ZWxzZSBpZihpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLk1vdXNlV2hlZWxab29tKVxyXG5cdFx0XHRcdGludGVyYWN0aW9uLnNldEFjdGl2ZSggKHNlbGYuc2V0dGluZ3Mud3BnbXphX3NldHRpbmdzX21hcF9zY3JvbGwgPT0gXCJ5ZXNcIiA/IGZhbHNlIDogdHJ1ZSkgKTtcclxuXHRcdFx0XHJcblx0XHR9LCB0aGlzKTtcclxuXHRcdFxyXG5cdFx0Ly8gQ29vcGVyYXRpdmUgZ2VzdHVyZSBoYW5kbGluZ1xyXG5cdFx0aWYoISh0aGlzLnNldHRpbmdzLndwZ216YV9mb3JjZV9ncmVlZHlfZ2VzdHVyZXMgPT0gXCJncmVlZHlcIiB8fCB0aGlzLnNldHRpbmdzLndwZ216YV9mb3JjZV9ncmVlZHlfZ2VzdHVyZXMgPT0gXCJ5ZXNcIikpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ2VzdHVyZU92ZXJsYXkgPSAkKFwiPGRpdiBjbGFzcz0nd3BnbXphLWdlc3R1cmUtb3ZlcmxheSc+PC9kaXY+XCIpXHJcblx0XHRcdHRoaXMuZ2VzdHVyZU92ZXJsYXlUaW1lb3V0SUQgPSBudWxsO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoV1BHTVpBLmlzVG91Y2hEZXZpY2UoKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIE9uIHRvdWNoIGRldmljZXMsIHJlcXVpcmUgdHdvIGZpbmdlcnMgdG8gZHJhZyBhbmQgcGFuXHJcblx0XHRcdFx0Ly8gTkI6IFRlbXBvcmFyaWx5IHJlbW92ZWQgZHVlIHRvIGluY29uc2lzdGVudCBiZWhhdmlvdXJcclxuXHRcdFx0XHQvKnRoaXMub2xNYXAuZ2V0SW50ZXJhY3Rpb25zKCkuZm9yRWFjaChmdW5jdGlvbihpbnRlcmFjdGlvbikge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZihpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLkRyYWdQYW4pXHJcblx0XHRcdFx0XHRcdHNlbGYub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24oaW50ZXJhY3Rpb24pO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbihuZXcgb2wuaW50ZXJhY3Rpb24uRHJhZ1Bhbih7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNvbmRpdGlvbjogZnVuY3Rpb24ob2xCcm93c2VyRXZlbnQpIHtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHZhciBhbGxvd2VkID0gb2xCcm93c2VyRXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzLmxlbmd0aCA9PSAyO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYoIWFsbG93ZWQpXHJcblx0XHRcdFx0XHRcdFx0c2VsZi5zaG93R2VzdHVyZU92ZXJsYXkoKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHJldHVybiBhbGxvd2VkO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0fSkpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZ2VzdHVyZU92ZXJsYXkudGV4dChXUEdNWkEubG9jYWxpemVkX3N0cmluZ3MudXNlX3R3b19maW5nZXJzKTsqL1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIE9uIGRlc2t0b3BzLCByZXF1aXJlIEN0cmwgKyB6b29tIHRvIHpvb20sIHNob3cgYW4gb3ZlcmxheSBpZiB0aGF0IGNvbmRpdGlvbiBpcyBub3QgbWV0XHJcblx0XHRcdFx0dGhpcy5vbE1hcC5vbihcIndoZWVsXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKCFvbC5ldmVudHMuY29uZGl0aW9uLnBsYXRmb3JtTW9kaWZpZXJLZXlPbmx5KGV2ZW50KSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0c2VsZi5zaG93R2VzdHVyZU92ZXJsYXkoKTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmdlc3R1cmVPdmVybGF5LnRleHQoV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLnVzZV9jdHJsX3Njcm9sbF90b196b29tKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBDb250cm9sc1xyXG5cdFx0dGhpcy5vbE1hcC5nZXRDb250cm9scygpLmZvckVhY2goZnVuY3Rpb24oY29udHJvbCkge1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTkI6IFRoZSB0cnVlIGFuZCBmYWxzZSB2YWx1ZXMgYXJlIGZsaXBwZWQgYmVjYXVzZSB0aGVzZSBzZXR0aW5ncyByZXByZXNlbnQgdGhlIFwiZGlzYWJsZWRcIiBzdGF0ZSB3aGVuIHRydWVcclxuXHRcdFx0aWYoY29udHJvbCBpbnN0YW5jZW9mIG9sLmNvbnRyb2wuWm9vbSAmJiBXUEdNWkEuc2V0dGluZ3Mud3BnbXphX3NldHRpbmdzX21hcF96b29tID09IFwieWVzXCIpXHJcblx0XHRcdFx0c2VsZi5vbE1hcC5yZW1vdmVDb250cm9sKGNvbnRyb2wpO1xyXG5cdFx0XHRcclxuXHRcdH0sIHRoaXMpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuc2V0dGluZ3Mud3BnbXphX3NldHRpbmdzX21hcF9mdWxsX3NjcmVlbl9jb250cm9sICE9IFwieWVzXCIpXHJcblx0XHRcdHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5GdWxsU2NyZWVuKCkpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHQvLyBNYXJrZXIgbGF5ZXJcclxuXHRcdFx0dGhpcy5tYXJrZXJMYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xyXG5cdFx0XHRcdHNvdXJjZTogbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe1xyXG5cdFx0XHRcdFx0ZmVhdHVyZXM6IFtdXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fSk7XHJcblx0XHRcdHRoaXMub2xNYXAuYWRkTGF5ZXIodGhpcy5tYXJrZXJMYXllcik7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm9sTWFwLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHR2YXIgZmVhdHVyZXMgPSBzZWxmLm9sTWFwLmdldEZlYXR1cmVzQXRQaXhlbChldmVudC5waXhlbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoIWZlYXR1cmVzIHx8ICFmZWF0dXJlcy5sZW5ndGgpXHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIG1hcmtlciA9IGZlYXR1cmVzWzBdLndwZ216YU1hcmtlcjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZighbWFya2VyKVxyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG1hcmtlci50cmlnZ2VyKFwiY2xpY2tcIik7XHJcblx0XHRcdFx0bWFya2VyLnRyaWdnZXIoXCJzZWxlY3RcIik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBMaXN0ZW4gZm9yIGRyYWcgc3RhcnRcclxuXHRcdHRoaXMub2xNYXAub24oXCJtb3Zlc3RhcnRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5pc0JlaW5nRHJhZ2dlZCA9IHRydWU7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Ly8gTGlzdGVuIGZvciBlbmQgb2YgcGFuIHNvIHdlIGNhbiB3cmFwIGxvbmdpdHVkZSBpZiBuZWVkcyBiZVxyXG5cdFx0dGhpcy5vbE1hcC5vbihcIm1vdmVlbmRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi53cmFwTG9uZ2l0dWRlKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLmlzQmVpbmdEcmFnZ2VkID0gZmFsc2U7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudChcImRyYWdlbmRcIik7XHJcblx0XHRcdHNlbGYub25JZGxlKCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Ly8gTGlzdGVuIGZvciB6b29tXHJcblx0XHR0aGlzLm9sTWFwLmdldFZpZXcoKS5vbihcImNoYW5nZTpyZXNvbHV0aW9uXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudChcInpvb21fY2hhbmdlZFwiKTtcclxuXHRcdFx0c2VsZi5kaXNwYXRjaEV2ZW50KFwiem9vbWNoYW5nZWRcIik7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c2VsZi5vbklkbGUoKTtcclxuXHRcdFx0fSwgMTApO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIExpc3RlbiBmb3IgYm91bmRzIGNoYW5naW5nXHJcblx0XHR0aGlzLm9sTWFwLmdldFZpZXcoKS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0Ly8gV3JhcCBsb25naXR1ZGVcclxuXHRcdFx0c2VsZi5vbkJvdW5kc0NoYW5nZWQoKTtcclxuXHRcdH0pO1xyXG5cdFx0c2VsZi5vbkJvdW5kc0NoYW5nZWQoKTtcclxuXHRcdFxyXG5cdFx0Ly8gU3RvcmUgbG9jYXRvciBjZW50ZXJcclxuXHRcdHZhciBtYXJrZXI7XHJcblx0XHRpZih0aGlzLnN0b3JlTG9jYXRvciAmJiAobWFya2VyID0gdGhpcy5zdG9yZUxvY2F0b3IuY2VudGVyUG9pbnRNYXJrZXIpKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLm9sTWFwLmFkZE92ZXJsYXkobWFya2VyLm92ZXJsYXkpO1xyXG5cdFx0XHRtYXJrZXIuc2V0VmlzaWJsZShmYWxzZSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFJpZ2h0IGNsaWNrIGxpc3RlbmVyXHJcblx0XHQkKHRoaXMuZWxlbWVudCkub24oXCJjbGljayBjb250ZXh0bWVudVwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGlzUmlnaHQ7XHJcblx0XHRcdGV2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50O1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGxhdExuZyA9IHNlbGYucGl4ZWxzVG9MYXRMbmcoZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WSk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihcIndoaWNoXCIgaW4gZXZlbnQpXHJcblx0XHRcdFx0aXNSaWdodCA9IGV2ZW50LndoaWNoID09IDM7XHJcblx0XHRcdGVsc2UgaWYoXCJidXR0b25cIiBpbiBldmVudClcclxuXHRcdFx0XHRpc1JpZ2h0ID0gZXZlbnQuYnV0dG9uID09IDI7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihldmVudC53aGljaCA9PSAxIHx8IGV2ZW50LmJ1dHRvbiA9PSAxKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYoc2VsZi5pc0JlaW5nRHJhZ2dlZClcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBMZWZ0IGNsaWNrXHJcblx0XHRcdFx0aWYoJChldmVudC50YXJnZXQpLmNsb3Nlc3QoXCIub2wtbWFya2VyXCIpLmxlbmd0aClcclxuXHRcdFx0XHRcdHJldHVybjsgLy8gQSBtYXJrZXIgd2FzIGNsaWNrZWQsIG5vdCB0aGUgbWFwLiBEbyBub3RoaW5nXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c2VsZi50cmlnZ2VyKHtcclxuXHRcdFx0XHRcdHR5cGU6IFwiY2xpY2tcIixcclxuXHRcdFx0XHRcdGxhdExuZzogbGF0TG5nXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZighaXNSaWdodClcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gc2VsZi5vblJpZ2h0Q2xpY2soZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIERpc3BhdGNoIGV2ZW50XHJcblx0XHRpZighV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnRyaWdnZXIoXCJpbml0XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KFwiY3JlYXRlZFwiKTtcclxuXHRcdFx0V1BHTVpBLmV2ZW50cy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcIm1hcGNyZWF0ZWRcIiwgbWFwOiB0aGlzfSk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBMZWdhY3kgZXZlbnRcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLnRyaWdnZXIoXCJ3cGdvb2dsZW1hcHNfbG9hZGVkXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLlByb01hcDtcclxuXHRlbHNlXHJcblx0XHRQYXJlbnQgPSBXUEdNWkEuTWFwO1xyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBhcmVudC5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuT0xNYXA7XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5nZXRUaWxlTGF5ZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB7fTtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLnNldHRpbmdzLnRpbGVfc2VydmVyX3VybClcclxuXHRcdFx0b3B0aW9ucy51cmwgPSBXUEdNWkEuc2V0dGluZ3MudGlsZV9zZXJ2ZXJfdXJsO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmV3IG9sLmxheWVyLlRpbGUoe1xyXG5cdFx0XHRzb3VyY2U6IG5ldyBvbC5zb3VyY2UuT1NNKG9wdGlvbnMpXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS53cmFwTG9uZ2l0dWRlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciB0cmFuc2Zvcm1lZCA9IG9sLnByb2oudHJhbnNmb3JtKHRoaXMub2xNYXAuZ2V0VmlldygpLmdldENlbnRlcigpLCBcIkVQU0c6Mzg1N1wiLCBcIkVQU0c6NDMyNlwiKTtcclxuXHRcdHZhciBjZW50ZXIgPSB7XHJcblx0XHRcdGxhdDogdHJhbnNmb3JtZWRbMV0sXHJcblx0XHRcdGxuZzogdHJhbnNmb3JtZWRbMF1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGlmKGNlbnRlci5sbmcgPj0gLTE4MCAmJiBjZW50ZXIubG5nIDw9IDE4MClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRjZW50ZXIubG5nID0gY2VudGVyLmxuZyAtIDM2MCAqIE1hdGguZmxvb3IoY2VudGVyLmxuZyAvIDM2MCk7XHJcblx0XHRcclxuXHRcdGlmKGNlbnRlci5sbmcgPiAxODApXHJcblx0XHRcdGNlbnRlci5sbmcgLT0gMzYwO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldENlbnRlcihjZW50ZXIpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmdldENlbnRlciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgbG9uTGF0ID0gb2wucHJvai50b0xvbkxhdChcclxuXHRcdFx0dGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0Q2VudGVyKClcclxuXHRcdCk7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRsYXQ6IGxvbkxhdFsxXSxcclxuXHRcdFx0bG5nOiBsb25MYXRbMF1cclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuc2V0Q2VudGVyID0gZnVuY3Rpb24obGF0TG5nKVxyXG5cdHtcclxuXHRcdHZhciB2aWV3ID0gdGhpcy5vbE1hcC5nZXRWaWV3KCk7XHJcblx0XHRcclxuXHRcdFdQR01aQS5NYXAucHJvdG90eXBlLnNldENlbnRlci5jYWxsKHRoaXMsIGxhdExuZyk7XHJcblx0XHRcclxuXHRcdHZpZXcuc2V0Q2VudGVyKG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdGxhdExuZy5sbmcsXHJcblx0XHRcdGxhdExuZy5sYXRcclxuXHRcdF0pKTtcclxuXHRcdFxyXG5cdFx0dGhpcy53cmFwTG9uZ2l0dWRlKCk7XHJcblxyXG5cdFx0dGhpcy5vbkJvdW5kc0NoYW5nZWQoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5nZXRCb3VuZHMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGJvdW5kcyA9IHRoaXMub2xNYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudCh0aGlzLm9sTWFwLmdldFNpemUoKSk7XHJcblx0XHR2YXIgbmF0aXZlQm91bmRzID0gbmV3IFdQR01aQS5MYXRMbmdCb3VuZHMoKTtcclxuXHRcdFxyXG5cdFx0dmFyIHRvcExlZnQgPSBvbC5wcm9qLnRvTG9uTGF0KFtib3VuZHNbMF0sIGJvdW5kc1sxXV0pO1xyXG5cdFx0dmFyIGJvdHRvbVJpZ2h0ID0gb2wucHJvai50b0xvbkxhdChbYm91bmRzWzJdLCBib3VuZHNbM11dKTtcclxuXHRcdFxyXG5cdFx0bmF0aXZlQm91bmRzLm5vcnRoID0gdG9wTGVmdFsxXTtcclxuXHRcdG5hdGl2ZUJvdW5kcy5zb3V0aCA9IGJvdHRvbVJpZ2h0WzFdO1xyXG5cdFx0XHJcblx0XHRuYXRpdmVCb3VuZHMud2VzdCA9IHRvcExlZnRbMF07XHJcblx0XHRuYXRpdmVCb3VuZHMuZWFzdCA9IGJvdHRvbVJpZ2h0WzBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmF0aXZlQm91bmRzO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBGaXQgdG8gZ2l2ZW4gYm91bmRhcmllc1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuZml0Qm91bmRzID0gZnVuY3Rpb24oc291dGhXZXN0LCBub3J0aEVhc3QpXHJcblx0e1xyXG5cdFx0aWYoc291dGhXZXN0IGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZylcclxuXHRcdFx0c291dGhXZXN0ID0ge2xhdDogc291dGhXZXN0LmxhdCwgbG5nOiBzb3V0aFdlc3QubG5nfTtcclxuXHRcdGlmKG5vcnRoRWFzdCBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHRcdG5vcnRoRWFzdCA9IHtsYXQ6IG5vcnRoRWFzdC5sYXQsIGxuZzogbm9ydGhFYXN0LmxuZ307XHJcblx0XHRlbHNlIGlmKHNvdXRoV2VzdCBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmdCb3VuZHMpXHJcblx0XHR7XHJcblx0XHRcdHZhciBib3VuZHMgPSBzb3V0aFdlc3Q7XHJcblx0XHRcdFxyXG5cdFx0XHRzb3V0aFdlc3QgPSB7XHJcblx0XHRcdFx0bGF0OiBib3VuZHMuc291dGgsXHJcblx0XHRcdFx0bG5nOiBib3VuZHMud2VzdFxyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0bm9ydGhFYXN0ID0ge1xyXG5cdFx0XHRcdGxhdDogYm91bmRzLm5vcnRoLFxyXG5cdFx0XHRcdGxuZzogYm91bmRzLmVhc3RcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHZpZXcgPSB0aGlzLm9sTWFwLmdldFZpZXcoKTtcclxuXHRcdFxyXG5cdFx0dmFyIGV4dGVudCA9IG9sLmV4dGVudC5ib3VuZGluZ0V4dGVudChbXHJcblx0XHRcdG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdFx0cGFyc2VGbG9hdChzb3V0aFdlc3QubG5nKSxcclxuXHRcdFx0XHRwYXJzZUZsb2F0KHNvdXRoV2VzdC5sYXQpXHJcblx0XHRcdF0pLFxyXG5cdFx0XHRvbC5wcm9qLmZyb21Mb25MYXQoW1xyXG5cdFx0XHRcdHBhcnNlRmxvYXQobm9ydGhFYXN0LmxuZyksXHJcblx0XHRcdFx0cGFyc2VGbG9hdChub3J0aEVhc3QubGF0KVxyXG5cdFx0XHRdKVxyXG5cdFx0XSk7XHJcblx0XHR2aWV3LmZpdChleHRlbnQsIHRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5wYW5UbyA9IGZ1bmN0aW9uKGxhdExuZywgem9vbSlcclxuXHR7XHJcblx0XHR2YXIgdmlldyA9IHRoaXMub2xNYXAuZ2V0VmlldygpO1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB7XHJcblx0XHRcdGNlbnRlcjogb2wucHJvai5mcm9tTG9uTGF0KFtcclxuXHRcdFx0XHRwYXJzZUZsb2F0KGxhdExuZy5sbmcpLFxyXG5cdFx0XHRcdHBhcnNlRmxvYXQobGF0TG5nLmxhdCksXHJcblx0XHRcdF0pLFxyXG5cdFx0XHRkdXJhdGlvbjogNTAwXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID4gMSlcclxuXHRcdFx0b3B0aW9ucy56b29tID0gcGFyc2VJbnQoem9vbSk7XHJcblx0XHRcclxuXHRcdHZpZXcuYW5pbWF0ZShvcHRpb25zKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5nZXRab29tID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKCB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRab29tKCkgKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5zZXRab29tID0gZnVuY3Rpb24odmFsdWUpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC5nZXRWaWV3KCkuc2V0Wm9vbSh2YWx1ZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuZ2V0TWluWm9vbSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0TWluWm9vbSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLnNldE1pblpvb20gPSBmdW5jdGlvbih2YWx1ZSlcclxuXHR7XHJcblx0XHR0aGlzLm9sTWFwLmdldFZpZXcoKS5zZXRNaW5ab29tKHZhbHVlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5nZXRNYXhab29tID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRNYXhab29tKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuc2V0TWF4Wm9vbSA9IGZ1bmN0aW9uKHZhbHVlKVxyXG5cdHtcclxuXHRcdHRoaXMub2xNYXAuZ2V0VmlldygpLnNldE1heFpvb20odmFsdWUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuc2V0T3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHRpZighdGhpcy5vbE1hcClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sTWFwLmdldFZpZXcoKS5zZXRQcm9wZXJ0aWVzKCB0aGlzLnNldHRpbmdzLnRvT0xWaWV3T3B0aW9ucygpICk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFRPRE86IENvbnNpZGVyIG1vdmluZyBhbGwgdGhlc2UgZnVuY3Rpb25zIHRvIHRoZWlyIHJlc3BlY3RpdmUgY2xhc3Nlcywgc2FtZSBvbiBnb29nbGUgbWFwIChETyBJVCEhISBJdCdzIHZlcnkgbWlzbGVhZGluZyBoYXZpbmcgdGhlbSBoZXJlKVxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuYWRkTWFya2VyID0gZnVuY3Rpb24obWFya2VyKVxyXG5cdHtcclxuXHRcdGlmKFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9IVE1MX0VMRU1FTlQpXHJcblx0XHRcdHRoaXMub2xNYXAuYWRkT3ZlcmxheShtYXJrZXIub3ZlcmxheSk7XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubWFya2VyTGF5ZXIuZ2V0U291cmNlKCkuYWRkRmVhdHVyZShtYXJrZXIuZmVhdHVyZSk7XHJcblx0XHRcdG1hcmtlci5mZWF0dXJlSW5Tb3VyY2UgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLmFkZE1hcmtlci5jYWxsKHRoaXMsIG1hcmtlcik7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUucmVtb3ZlTWFya2VyID0gZnVuY3Rpb24obWFya2VyKVxyXG5cdHtcclxuXHRcdGlmKFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9IVE1MX0VMRU1FTlQpXHJcblx0XHRcdHRoaXMub2xNYXAucmVtb3ZlT3ZlcmxheShtYXJrZXIub3ZlcmxheSk7XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubWFya2VyTGF5ZXIuZ2V0U291cmNlKCkucmVtb3ZlRmVhdHVyZShtYXJrZXIuZmVhdHVyZSk7XHJcblx0XHRcdG1hcmtlci5mZWF0dXJlSW5Tb3VyY2UgPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5yZW1vdmVNYXJrZXIuY2FsbCh0aGlzLCBtYXJrZXIpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmFkZFBvbHlnb24gPSBmdW5jdGlvbihwb2x5Z29uKVxyXG5cdHtcclxuXHRcdHRoaXMub2xNYXAuYWRkTGF5ZXIocG9seWdvbi5sYXllcik7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkUG9seWdvbi5jYWxsKHRoaXMsIHBvbHlnb24pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLnJlbW92ZVBvbHlnb24gPSBmdW5jdGlvbihwb2x5Z29uKVxyXG5cdHtcclxuXHRcdHRoaXMub2xNYXAucmVtb3ZlTGF5ZXIocG9seWdvbi5sYXllcik7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUucmVtb3ZlUG9seWdvbi5jYWxsKHRoaXMsIHBvbHlnb24pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmFkZFBvbHlsaW5lID0gZnVuY3Rpb24ocG9seWxpbmUpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC5hZGRMYXllcihwb2x5bGluZS5sYXllcik7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkUG9seWxpbmUuY2FsbCh0aGlzLCBwb2x5bGluZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUucmVtb3ZlUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHR0aGlzLm9sTWFwLnJlbW92ZUxheWVyKHBvbHlsaW5lLmxheWVyKTtcclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5yZW1vdmVQb2x5bGluZS5jYWxsKHRoaXMsIHBvbHlsaW5lKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5hZGRDaXJjbGUgPSBmdW5jdGlvbihjaXJjbGUpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC5hZGRMYXllcihjaXJjbGUubGF5ZXIpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLmFkZENpcmNsZS5jYWxsKHRoaXMsIGNpcmNsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUucmVtb3ZlQ2lyY2xlID0gZnVuY3Rpb24oY2lyY2xlKVxyXG5cdHtcclxuXHRcdHRoaXMub2xNYXAucmVtb3ZlTGF5ZXIoY2lyY2xlLmxheWVyKTtcclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5yZW1vdmVDaXJjbGUuY2FsbCh0aGlzLCBjaXJjbGUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmFkZFJlY3RhbmdsZSA9IGZ1bmN0aW9uKHJlY3RhbmdsZSlcclxuXHR7XHJcblx0XHR0aGlzLm9sTWFwLmFkZExheWVyKHJlY3RhbmdsZS5sYXllcik7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkUmVjdGFuZ2xlLmNhbGwodGhpcywgcmVjdGFuZ2xlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5yZW1vdmVSZWN0YW5nbGUgPSBmdW5jdGlvbihyZWN0YW5nbGUpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC5yZW1vdmVMYXllcihyZWN0YW5nbGUubGF5ZXIpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnJlbW92ZVJlY3RhbmdsZS5jYWxsKHRoaXMsIHJlY3RhbmdsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUucGl4ZWxzVG9MYXRMbmcgPSBmdW5jdGlvbih4LCB5KVxyXG5cdHtcclxuXHRcdGlmKHkgPT0gdW5kZWZpbmVkKVxyXG5cdFx0e1xyXG5cdFx0XHRpZihcInhcIiBpbiB4ICYmIFwieVwiIGluIHgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR5ID0geC55O1xyXG5cdFx0XHRcdHggPSB4Lng7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUud2FybihcIlkgY29vcmRpbmF0ZSB1bmRlZmluZWQgaW4gcGl4ZWxzVG9MYXRMbmcgKGRpZCB5b3UgbWVhbiB0byBwYXNzIDIgYXJndW1lbnRzPylcIik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBjb29yZCA9IHRoaXMub2xNYXAuZ2V0Q29vcmRpbmF0ZUZyb21QaXhlbChbeCwgeV0pO1xyXG5cdFx0XHJcblx0XHRpZighY29vcmQpXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0eDogbnVsbCxcclxuXHRcdFx0XHR5OiBudWxsXHJcblx0XHRcdH07XHJcblx0XHRcclxuXHRcdHZhciBsb25MYXQgPSBvbC5wcm9qLnRvTG9uTGF0KGNvb3JkKTtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGxhdDogbG9uTGF0WzFdLFxyXG5cdFx0XHRsbmc6IGxvbkxhdFswXVxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5sYXRMbmdUb1BpeGVscyA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHR2YXIgY29vcmQgPSBvbC5wcm9qLmZyb21Mb25MYXQoW2xhdExuZy5sbmcsIGxhdExuZy5sYXRdKTtcclxuXHRcdHZhciBwaXhlbCA9IHRoaXMub2xNYXAuZ2V0UGl4ZWxGcm9tQ29vcmRpbmF0ZShjb29yZCk7XHJcblx0XHRcclxuXHRcdGlmKCFwaXhlbClcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR4OiBudWxsLFxyXG5cdFx0XHRcdHk6IG51bGxcclxuXHRcdFx0fTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogcGl4ZWxbMF0sXHJcblx0XHRcdHk6IHBpeGVsWzFdXHJcblx0XHR9O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmVuYWJsZUJpY3ljbGVMYXllciA9IGZ1bmN0aW9uKHZhbHVlKVxyXG5cdHtcclxuXHRcdGlmKHZhbHVlKVxyXG5cdFx0e1xyXG5cdFx0XHRpZighdGhpcy5iaWN5Y2xlTGF5ZXIpXHJcblx0XHRcdFx0dGhpcy5iaWN5Y2xlTGF5ZXIgPSBuZXcgb2wubGF5ZXIuVGlsZSh7XHJcblx0XHRcdFx0XHRzb3VyY2U6IG5ldyBvbC5zb3VyY2UuT1NNKHtcclxuXHRcdFx0XHRcdFx0dXJsOiBcImh0dHA6Ly97YS1jfS50aWxlLm9wZW5jeWNsZW1hcC5vcmcvY3ljbGUve3p9L3t4fS97eX0ucG5nXCJcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdHRoaXMub2xNYXAuYWRkTGF5ZXIodGhpcy5iaWN5Y2xlTGF5ZXIpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHRpZighdGhpcy5iaWN5Y2xlTGF5ZXIpXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5vbE1hcC5yZW1vdmVMYXllcih0aGlzLmJpY3ljbGVMYXllcik7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuc2hvd0dlc3R1cmVPdmVybGF5ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuZ2VzdHVyZU92ZXJsYXlUaW1lb3V0SUQpO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZ2VzdHVyZU92ZXJsYXkpLnN0b3AoKS5hbmltYXRlKHtvcGFjaXR5OiBcIjEwMFwifSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuYXBwZW5kKHRoaXMuZ2VzdHVyZU92ZXJsYXkpO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZ2VzdHVyZU92ZXJsYXkpLmNzcyh7XHJcblx0XHRcdFwibGluZS1oZWlnaHRcIjpcdCQodGhpcy5lbGVtZW50KS5oZWlnaHQoKSArIFwicHhcIixcclxuXHRcdFx0XCJvcGFjaXR5XCI6XHRcdFwiMS4wXCJcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmdlc3R1cmVPdmVybGF5KS5zaG93KCk7XHJcblx0XHRcclxuXHRcdHRoaXMuZ2VzdHVyZU92ZXJsYXlUaW1lb3V0SUQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZWxmLmdlc3R1cmVPdmVybGF5LmZhZGVPdXQoMjAwMCk7XHJcblx0XHR9LCAyMDAwKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5vbkVsZW1lbnRSZXNpemVkID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC51cGRhdGVTaXplKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUub25SaWdodENsaWNrID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0aWYoJChldmVudC50YXJnZXQpLmNsb3Nlc3QoXCIub2wtbWFya2VyLCAud3BnbXphX21vZGVybl9pbmZvd2luZG93LCAud3BnbXphLW1vZGVybi1zdG9yZS1sb2NhdG9yXCIpLmxlbmd0aClcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcclxuXHRcdHZhciBwYXJlbnRPZmZzZXQgPSAkKHRoaXMuZWxlbWVudCkub2Zmc2V0KCk7XHJcblx0XHR2YXIgcmVsWCA9IGV2ZW50LnBhZ2VYIC0gcGFyZW50T2Zmc2V0LmxlZnQ7XHJcblx0XHR2YXIgcmVsWSA9IGV2ZW50LnBhZ2VZIC0gcGFyZW50T2Zmc2V0LnRvcDtcclxuXHRcdHZhciBsYXRMbmcgPSB0aGlzLnBpeGVsc1RvTGF0TG5nKHJlbFgsIHJlbFkpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnRyaWdnZXIoe3R5cGU6IFwicmlnaHRjbGlja1wiLCBsYXRMbmc6IGxhdExuZ30pO1xyXG5cdFx0XHJcblx0XHQvLyBMZWdhY3kgZXZlbnQgY29tcGF0aWJpbGl0eVxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLnRyaWdnZXIoe3R5cGU6IFwicmlnaHRjbGlja1wiLCBsYXRMbmc6IGxhdExuZ30pO1xyXG5cdFx0XHJcblx0XHQvLyBQcmV2ZW50IG1lbnVcclxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmVuYWJsZUFsbEludGVyYWN0aW9ucyA9IGZ1bmN0aW9uKClcclxuXHR7XHRcclxuXHJcblx0XHR0aGlzLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24oaW50ZXJhY3Rpb24pIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGludGVyYWN0aW9uIGluc3RhbmNlb2Ygb2wuaW50ZXJhY3Rpb24uRHJhZ1BhbiB8fCBpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLkRvdWJsZUNsaWNrWm9vbSB8fCBpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLk1vdXNlV2hlZWxab29tKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aW50ZXJhY3Rpb24uc2V0QWN0aXZlKHRydWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fSwgdGhpcyk7XHJcblxyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1tYXAuanMifQ==


// js/v8/open-layers/ol-marker.js
/**
 * @namespace WPGMZA
 * @module OLMarker
 * @requires WPGMZA.Marker
 * @gulp-requires ../marker.js
 * @pro-requires WPGMZA.ProMarker
 * @gulp-pro-requires pro-marker.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);

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
			$(this.element).attr('title', this.title);
			this.element.appendChild(img);
			
			this.element.wpgmzaMarker = this;
			
			$(this.element).on("mouseover", function(event) {
				self.dispatchEvent("mouseover");
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
			
			this.setLabel(this.settings.label);
			
			if(row)
			{
				if(row.draggable)
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
		}
		else
			throw new Error("Invalid marker render mode");
		
		this.trigger("init");
	}
	
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
			
			$(this.element).draggable(options);
			this.jQueryDraggableInitialized = true;
			
			this.rebindClickListener();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1tYXJrZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgT0xNYXJrZXJcclxuICogQHJlcXVpcmVzIFdQR01aQS5NYXJrZXJcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vbWFya2VyLmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb01hcmtlclxyXG4gKiBAZ3VscC1wcm8tcmVxdWlyZXMgcHJvLW1hcmtlci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5PTE1hcmtlciA9IGZ1bmN0aW9uKHJvdylcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFBhcmVudC5jYWxsKHRoaXMsIHJvdyk7XHJcblxyXG5cdFx0dmFyIG9yaWdpbiA9IG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdHBhcnNlRmxvYXQodGhpcy5sbmcpLFxyXG5cdFx0XHRwYXJzZUZsb2F0KHRoaXMubGF0KVxyXG5cdFx0XSk7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9IVE1MX0VMRU1FTlQpXHJcblx0XHR7XHJcblx0XHRcdHZhciBpbWcgPSAkKFwiPGltZyBhbHQ9JycvPlwiKVswXTtcclxuXHRcdFx0aW1nLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0c2VsZi51cGRhdGVFbGVtZW50SGVpZ2h0KCk7XHJcblx0XHRcdFx0aWYoc2VsZi5tYXApXHJcblx0XHRcdFx0XHRzZWxmLm1hcC5vbE1hcC51cGRhdGVTaXplKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aW1nLnNyYyA9IFdQR01aQS5kZWZhdWx0TWFya2VySWNvbjtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZWxlbWVudCA9ICQoXCI8ZGl2IGNsYXNzPSdvbC1tYXJrZXInPjwvZGl2PlwiKVswXTtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLmF0dHIoJ3RpdGxlJywgdGhpcy50aXRsZSk7XHJcblx0XHRcdHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChpbWcpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5lbGVtZW50LndwZ216YU1hcmtlciA9IHRoaXM7XHJcblx0XHRcdFxyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJtb3VzZW92ZXJcIik7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5vdmVybGF5ID0gbmV3IG9sLk92ZXJsYXkoe1xyXG5cdFx0XHRcdGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcclxuXHRcdFx0XHRwb3NpdGlvbjogb3JpZ2luLFxyXG5cdFx0XHRcdHBvc2l0aW9uaW5nOiBcImJvdHRvbS1jZW50ZXJcIixcclxuXHRcdFx0XHRzdG9wRXZlbnQ6IGZhbHNlXHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLm92ZXJsYXkuc2V0UG9zaXRpb24ob3JpZ2luKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHRoaXMuYW5pbWF0aW9uKVxyXG5cdFx0XHRcdHRoaXMuc2V0QW5pbWF0aW9uKHRoaXMuYW5pbWF0aW9uKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc2V0TGFiZWwodGhpcy5zZXR0aW5ncy5sYWJlbCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihyb3cpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZihyb3cuZHJhZ2dhYmxlKVxyXG5cdFx0XHRcdFx0dGhpcy5zZXREcmFnZ2FibGUodHJ1ZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMucmViaW5kQ2xpY2tMaXN0ZW5lcigpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmZlYXR1cmUgPSBuZXcgb2wuRmVhdHVyZSh7XHJcblx0XHRcdFx0Z2VvbWV0cnk6IG5ldyBvbC5nZW9tLlBvaW50KG9yaWdpbilcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmZlYXR1cmUuc2V0U3R5bGUodGhpcy5nZXRWZWN0b3JMYXllclN0eWxlKCkpO1xyXG5cdFx0XHR0aGlzLmZlYXR1cmUud3BnbXphTWFya2VyID0gdGhpcztcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtYXJrZXIgcmVuZGVyIG1vZGVcIik7XHJcblx0XHRcclxuXHRcdHRoaXMudHJpZ2dlcihcImluaXRcIik7XHJcblx0fVxyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9NYXJrZXI7XHJcblx0ZWxzZVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLk1hcmtlcjtcclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQYXJlbnQucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk9MTWFya2VyO1xyXG5cdFxyXG5cdFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9IVE1MX0VMRU1FTlRcdFx0PSBcImVsZW1lbnRcIjtcclxuXHRXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSXHRcdD0gXCJ2ZWN0b3JcIjtcdC8vIE5COiBUaGlzIGZlYXR1cmUgaXMgZXhwZXJpbWVudGFsXHJcblx0XHJcblx0V1BHTVpBLk9MTWFya2VyLnJlbmRlck1vZGUgPSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfSFRNTF9FTEVNRU5UO1xyXG5cdFxyXG5cdGlmKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgPT0gXCJvcGVuLWxheWVyc1wiICYmIFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9WRUNUT1JfTEFZRVIpXHJcblx0e1xyXG5cdFx0V1BHTVpBLk9MTWFya2VyLmRlZmF1bHRWZWN0b3JMYXllclN0eWxlID0gbmV3IG9sLnN0eWxlLlN0eWxlKHtcclxuXHRcdFx0aW1hZ2U6IG5ldyBvbC5zdHlsZS5JY29uKHtcclxuXHRcdFx0XHRhbmNob3I6IFswLjUsIDFdLFxyXG5cdFx0XHRcdHNyYzogV1BHTVpBLmRlZmF1bHRNYXJrZXJJY29uXHJcblx0XHRcdH0pXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0V1BHTVpBLk9MTWFya2VyLmhpZGRlblZlY3RvckxheWVyU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUoe30pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLmdldFZlY3RvckxheWVyU3R5bGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYodGhpcy52ZWN0b3JMYXllclN0eWxlKVxyXG5cdFx0XHRyZXR1cm4gdGhpcy52ZWN0b3JMYXllclN0eWxlO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gV1BHTVpBLk9MTWFya2VyLmRlZmF1bHRWZWN0b3JMYXllclN0eWxlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLnVwZGF0ZUVsZW1lbnRIZWlnaHQgPSBmdW5jdGlvbihoZWlnaHQsIGNhbGxlZE9uRm9jdXMpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRpZighaGVpZ2h0KVxyXG5cdFx0XHRoZWlnaHQgPSAkKHRoaXMuZWxlbWVudCkuZmluZChcImltZ1wiKS5oZWlnaHQoKTtcclxuXHRcdFxyXG5cdFx0aWYoaGVpZ2h0ID09IDAgJiYgIWNhbGxlZE9uRm9jdXMpXHJcblx0XHR7XHJcblx0XHRcdCQod2luZG93KS5vbmUoXCJmb2N1c1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdHNlbGYudXBkYXRlRWxlbWVudEhlaWdodChmYWxzZSwgdHJ1ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuY3NzKHtoZWlnaHQ6IGhlaWdodCArIFwicHhcIn0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLmFkZExhYmVsID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRoaXMuc2V0TGFiZWwodGhpcy5nZXRMYWJlbFRleHQoKSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcmtlci5wcm90b3R5cGUuc2V0TGFiZWwgPSBmdW5jdGlvbihsYWJlbClcclxuXHR7XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRjb25zb2xlLndhcm4oXCJNYXJrZXIgbGFiZWxzIGFyZSBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiBWZWN0b3IgTGF5ZXIgcmVuZGVyaW5nIG1vZGVcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIWxhYmVsKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0aGlzLmxhYmVsKVxyXG5cdFx0XHRcdCQodGhpcy5lbGVtZW50KS5maW5kKFwiLm9sLW1hcmtlci1sYWJlbFwiKS5yZW1vdmUoKTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMubGFiZWwpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubGFiZWwgPSAkKFwiPGRpdiBjbGFzcz0nb2wtbWFya2VyLWxhYmVsJy8+XCIpO1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkuYXBwZW5kKHRoaXMubGFiZWwpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmxhYmVsLmh0bWwobGFiZWwpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLmdldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdGlmKFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9WRUNUT1JfTEFZRVIpXHJcblx0XHR7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gdGhpcy5vdmVybGF5LmdldEVsZW1lbnQoKS5zdHlsZS5kaXNwbGF5ICE9IFwibm9uZVwiO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuc2V0VmlzaWJsZS5jYWxsKHRoaXMsIHZpc2libGUpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih2aXNpYmxlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHN0eWxlID0gdGhpcy5nZXRWZWN0b3JMYXllclN0eWxlKCk7XHJcblx0XHRcdFx0dGhpcy5mZWF0dXJlLnNldFN0eWxlKHN0eWxlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGhpcy5mZWF0dXJlLnNldFN0eWxlKG51bGwpO1xyXG5cdFx0XHRcclxuXHRcdFx0Lyp2YXIgc291cmNlID0gdGhpcy5tYXAubWFya2VyTGF5ZXIuZ2V0U291cmNlKCk7XHJcblx0XHRcdFxyXG5cdFx0XHQvKmlmKHRoaXMuZmVhdHVyZUluU291cmNlID09IHZpc2libGUpXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYodmlzaWJsZSlcclxuXHRcdFx0XHRzb3VyY2UuYWRkRmVhdHVyZSh0aGlzLmZlYXR1cmUpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0c291cmNlLnJlbW92ZUZlYXR1cmUodGhpcy5mZWF0dXJlKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZmVhdHVyZUluU291cmNlID0gdmlzaWJsZTsqL1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLm92ZXJsYXkuZ2V0RWxlbWVudCgpLnN0eWxlLmRpc3BsYXkgPSAodmlzaWJsZSA/IFwiYmxvY2tcIiA6IFwibm9uZVwiKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFya2VyLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnNldFBvc2l0aW9uLmNhbGwodGhpcywgbGF0TG5nKTtcclxuXHRcdFxyXG5cdFx0dmFyIG9yaWdpbiA9IG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdHBhcnNlRmxvYXQodGhpcy5sbmcpLFxyXG5cdFx0XHRwYXJzZUZsb2F0KHRoaXMubGF0KVxyXG5cdFx0XSk7XHJcblx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0XHR0aGlzLmZlYXR1cmUuc2V0R2VvbWV0cnkobmV3IG9sLmdlb20uUG9pbnQob3JpZ2luKSk7XHJcblx0XHRlbHNlXHJcblx0XHRcdHRoaXMub3ZlcmxheS5zZXRQb3NpdGlvbihvcmlnaW4pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLnVwZGF0ZU9mZnNldCA9IGZ1bmN0aW9uKHgsIHkpXHJcblx0e1xyXG5cdFx0aWYoV1BHTVpBLk9MTWFya2VyLnJlbmRlck1vZGUgPT0gV1BHTVpBLk9MTWFya2VyLlJFTkRFUl9NT0RFX1ZFQ1RPUl9MQVlFUilcclxuXHRcdHtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwiTWFya2VyIG9mZnNldCBpcyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiBWZWN0b3IgTGF5ZXIgcmVuZGVyaW5nIG1vZGVcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHggPSB0aGlzLl9vZmZzZXQueDtcclxuXHRcdHZhciB5ID0gdGhpcy5fb2Zmc2V0Lnk7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcclxuXHRcdHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcclxuXHRcdHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLnNldEFuaW1hdGlvbiA9IGZ1bmN0aW9uKGFuaW0pXHJcblx0e1xyXG5cdFx0aWYoV1BHTVpBLk9MTWFya2VyLnJlbmRlck1vZGUgPT0gV1BHTVpBLk9MTWFya2VyLlJFTkRFUl9NT0RFX1ZFQ1RPUl9MQVlFUilcclxuXHRcdHtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwiTWFya2VyIGFuaW1hdGlvbiBpcyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiBWZWN0b3IgTGF5ZXIgcmVuZGVyaW5nIG1vZGVcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5zZXRBbmltYXRpb24uY2FsbCh0aGlzLCBhbmltKTtcclxuXHRcdFxyXG5cdFx0c3dpdGNoKGFuaW0pXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgV1BHTVpBLk1hcmtlci5BTklNQVRJT05fTk9ORTpcclxuXHRcdFx0XHQkKHRoaXMuZWxlbWVudCkucmVtb3ZlQXR0cihcImRhdGEtYW5pbVwiKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHJcblx0XHRcdGNhc2UgV1BHTVpBLk1hcmtlci5BTklNQVRJT05fQk9VTkNFOlxyXG5cdFx0XHRcdCQodGhpcy5lbGVtZW50KS5hdHRyKFwiZGF0YS1hbmltXCIsIFwiYm91bmNlXCIpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2FzZSBXUEdNWkEuTWFya2VyLkFOSU1BVElPTl9EUk9QOlxyXG5cdFx0XHRcdCQodGhpcy5lbGVtZW50KS5hdHRyKFwiZGF0YS1hbmltXCIsIFwiZHJvcFwiKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFya2VyLnByb3RvdHlwZS5zZXREcmFnZ2FibGUgPSBmdW5jdGlvbihkcmFnZ2FibGUpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRjb25zb2xlLndhcm4oXCJNYXJrZXIgZHJhZ2dpbmcgaXMgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQgaW4gVmVjdG9yIExheWVyIHJlbmRlcmluZyBtb2RlXCIpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKGRyYWdnYWJsZSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIG9wdGlvbnMgPSB7XHJcblx0XHRcdFx0ZGlzYWJsZWQ6IGZhbHNlXHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHRpZighdGhpcy5qUXVlcnlEcmFnZ2FibGVJbml0aWFsaXplZClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG9wdGlvbnMuc3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdFx0c2VsZi5vbkRyYWdTdGFydChldmVudCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG9wdGlvbnMuc3RvcCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0XHRzZWxmLm9uRHJhZ0VuZChldmVudCk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLmRyYWdnYWJsZShvcHRpb25zKTtcclxuXHRcdFx0dGhpcy5qUXVlcnlEcmFnZ2FibGVJbml0aWFsaXplZCA9IHRydWU7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnJlYmluZENsaWNrTGlzdGVuZXIoKTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLmRyYWdnYWJsZSh7ZGlzYWJsZWQ6IHRydWV9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFya2VyLnByb3RvdHlwZS5zZXRPcGFjaXR5ID0gZnVuY3Rpb24ob3BhY2l0eSlcclxuXHR7XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRjb25zb2xlLndhcm4oXCJNYXJrZXIgb3BhY2l0eSBpcyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiBWZWN0b3IgTGF5ZXIgcmVuZGVyaW5nIG1vZGVcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmNzcyh7b3BhY2l0eTogb3BhY2l0eX0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLm9uRHJhZ1N0YXJ0ID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dGhpcy5pc0JlaW5nRHJhZ2dlZCA9IHRydWU7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24oaW50ZXJhY3Rpb24pIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGludGVyYWN0aW9uIGluc3RhbmNlb2Ygb2wuaW50ZXJhY3Rpb24uRHJhZ1BhbilcclxuXHRcdFx0XHRpbnRlcmFjdGlvbi5zZXRBY3RpdmUoZmFsc2UpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLm9uRHJhZ0VuZCA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdHZhciBvZmZzZXQgPSB7XHJcblx0XHRcdHRvcDpcdHBhcnNlRmxvYXQoICQodGhpcy5lbGVtZW50KS5jc3MoXCJ0b3BcIikubWF0Y2goLy0/XFxkKy8pWzBdICksXHJcblx0XHRcdGxlZnQ6XHRwYXJzZUZsb2F0KCAkKHRoaXMuZWxlbWVudCkuY3NzKFwibGVmdFwiKS5tYXRjaCgvLT9cXGQrLylbMF0gKVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmNzcyh7XHJcblx0XHRcdHRvcDogXHRcIjBweFwiLFxyXG5cdFx0XHRsZWZ0OiBcdFwiMHB4XCJcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR2YXIgY3VycmVudExhdExuZyBcdFx0PSB0aGlzLmdldFBvc2l0aW9uKCk7XHJcblx0XHR2YXIgcGl4ZWxzQmVmb3JlRHJhZyBcdD0gdGhpcy5tYXAubGF0TG5nVG9QaXhlbHMoY3VycmVudExhdExuZyk7XHJcblx0XHR2YXIgcGl4ZWxzQWZ0ZXJEcmFnXHRcdD0ge1xyXG5cdFx0XHR4OiBwaXhlbHNCZWZvcmVEcmFnLnggKyBvZmZzZXQubGVmdCxcclxuXHRcdFx0eTogcGl4ZWxzQmVmb3JlRHJhZy55ICsgb2Zmc2V0LnRvcFxyXG5cdFx0fTtcclxuXHRcdHZhciBsYXRMbmdBZnRlckRyYWdcdFx0PSB0aGlzLm1hcC5waXhlbHNUb0xhdExuZyhwaXhlbHNBZnRlckRyYWcpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldFBvc2l0aW9uKGxhdExuZ0FmdGVyRHJhZyk7XHJcblx0XHRcclxuXHRcdHRoaXMuaXNCZWluZ0RyYWdnZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMudHJpZ2dlcih7dHlwZTogXCJkcmFnZW5kXCIsIGxhdExuZzogbGF0TG5nQWZ0ZXJEcmFnfSk7XHJcblx0XHRcclxuXHRcdC8vIE5COiBcInllc1wiIHJlcHJlc2VudHMgZGlzYWJsZWRcclxuXHRcdGlmKHRoaXMubWFwLnNldHRpbmdzLndwZ216YV9zZXR0aW5nc19tYXBfZHJhZ2dhYmxlICE9IFwieWVzXCIpXHJcblx0XHRcdHRoaXMubWFwLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24oaW50ZXJhY3Rpb24pIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLkRyYWdQYW4pXHJcblx0XHRcdFx0XHRpbnRlcmFjdGlvbi5zZXRBY3RpdmUodHJ1ZSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLm9uRWxlbWVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSBldmVudC5jdXJyZW50VGFyZ2V0LndwZ216YU1hcmtlcjtcclxuXHRcdFxyXG5cdFx0aWYoc2VsZi5pc0JlaW5nRHJhZ2dlZClcclxuXHRcdFx0cmV0dXJuOyAvLyBEb24ndCBkaXNwYXRjaCBjbGljayBldmVudCBhZnRlciBhIGRyYWdcclxuXHRcdFxyXG5cdFx0c2VsZi5kaXNwYXRjaEV2ZW50KFwiY2xpY2tcIik7XHJcblx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJzZWxlY3RcIik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEJpbmRzIC8gcmViaW5kcyB0aGUgY2xpY2sgbGlzdGVuZXIuIFRoaXMgbXVzdCBiZSBib3VuZCBhZnRlciBkcmFnZ2FibGUgaXMgaW5pdGlhbGl6ZWQsXHJcblx0ICogdGhpcyBzb2x2ZXMgdGhlIGNsaWNrIGxpc3RlbmVyIGZpcmluZyBiZWZvcmUgZHJhZ2VuZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTE1hcmtlci5wcm90b3R5cGUucmViaW5kQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkub2ZmKFwiY2xpY2tcIiwgdGhpcy5vbkVsZW1lbnRDbGljayk7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkub24oXCJjbGlja1wiLCB0aGlzLm9uRWxlbWVudENsaWNrKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoib3Blbi1sYXllcnMvb2wtbWFya2VyLmpzIn0=


// js/v8/open-layers/ol-modern-store-locator-circle.js
/**
 * @namespace WPGMZA
 * @module OLModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 * @gulp-requires ../modern-store-locator-circle.js
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
		mapElement.append(this.canvas);
		
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1tb2Rlcm4tc3RvcmUtbG9jYXRvci1jaXJjbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuICogQHJlcXVpcmVzIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vbW9kZXJuLXN0b3JlLWxvY2F0b3ItY2lyY2xlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5PTE1vZGVyblN0b3JlTG9jYXRvckNpcmNsZSA9IGZ1bmN0aW9uKG1hcCwgc2V0dGluZ3MpXHJcblx0e1xyXG5cdFx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5jYWxsKHRoaXMsIG1hcCwgc2V0dGluZ3MpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5PTE1vZGVyblN0b3JlTG9jYXRvckNpcmNsZTtcclxuXHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmluaXRDYW52YXNMYXllciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgbWFwRWxlbWVudCA9ICQodGhpcy5tYXAuZWxlbWVudCk7XHJcblx0XHR2YXIgb2xWaWV3cG9ydEVsZW1lbnQgPSBtYXBFbGVtZW50LmNoaWxkcmVuKFwiLm9sLXZpZXdwb3J0XCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcblx0XHR0aGlzLmNhbnZhcy5jbGFzc05hbWUgPSBcIndwZ216YS1vbC1jYW52YXMtb3ZlcmxheVwiO1xyXG5cdFx0bWFwRWxlbWVudC5hcHBlbmQodGhpcy5jYW52YXMpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnJlbmRlckZ1bmN0aW9uID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHNlbGYuY2FudmFzLndpZHRoICE9IG9sVmlld3BvcnRFbGVtZW50LndpZHRoKCkgfHwgc2VsZi5jYW52YXMuaGVpZ2h0ICE9IG9sVmlld3BvcnRFbGVtZW50LmhlaWdodCgpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0c2VsZi5jYW52YXMud2lkdGggPSBvbFZpZXdwb3J0RWxlbWVudC53aWR0aCgpO1xyXG5cdFx0XHRcdHNlbGYuY2FudmFzLmhlaWdodCA9IG9sVmlld3BvcnRFbGVtZW50LmhlaWdodCgpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdCQodGhpcy5jYW52YXMpLmNzcyh7XHJcblx0XHRcdFx0XHR3aWR0aDogb2xWaWV3cG9ydEVsZW1lbnQud2lkdGgoKSArIFwicHhcIixcclxuXHRcdFx0XHRcdGhlaWdodDogb2xWaWV3cG9ydEVsZW1lbnQuaGVpZ2h0KCkgKyBcInB4XCJcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0c2VsZi5kcmF3KCk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcC5vbE1hcC5vbihcInBvc3RyZW5kZXJcIiwgdGhpcy5yZW5kZXJGdW5jdGlvbik7XHJcblx0fVxyXG5cclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbih0eXBlKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KHR5cGUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldENhbnZhc0RpbWVuc2lvbnMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0d2lkdGg6IHRoaXMuY2FudmFzLndpZHRoLFxyXG5cdFx0XHRoZWlnaHQ6IHRoaXMuY2FudmFzLmhlaWdodFxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRDZW50ZXJQaXhlbHMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGNlbnRlciA9IHRoaXMubWFwLmxhdExuZ1RvUGl4ZWxzKHRoaXMuc2V0dGluZ3MuY2VudGVyKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGNlbnRlcjtcclxuXHR9XHJcblx0XHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldFdvcmxkT3JpZ2luT2Zmc2V0ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHg6IDAsXHJcblx0XHRcdHk6IDBcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0VHJhbnNmb3JtZWRSYWRpdXMgPSBmdW5jdGlvbihrbSlcclxuXHR7XHJcblx0XHR2YXIgY2VudGVyID0gbmV3IFdQR01aQS5MYXRMbmcodGhpcy5zZXR0aW5ncy5jZW50ZXIpO1xyXG5cdFx0dmFyIG91dGVyID0gbmV3IFdQR01aQS5MYXRMbmcoY2VudGVyKTtcclxuXHRcdFxyXG5cdFx0b3V0ZXIubW92ZUJ5RGlzdGFuY2Uoa20sIDkwKTtcclxuXHRcdFxyXG5cdFx0dmFyIGNlbnRlclBpeGVscyA9IHRoaXMubWFwLmxhdExuZ1RvUGl4ZWxzKGNlbnRlcik7XHJcblx0XHR2YXIgb3V0ZXJQaXhlbHMgPSB0aGlzLm1hcC5sYXRMbmdUb1BpeGVscyhvdXRlcik7XHJcblx0XHRcclxuXHRcdHJldHVybiBNYXRoLmFicyhvdXRlclBpeGVscy54IC0gY2VudGVyUGl4ZWxzLngpO1xyXG5cclxuXHRcdC8qaWYoIXdpbmRvdy50ZXN0TWFya2VyKXtcclxuXHRcdFx0d2luZG93LnRlc3RNYXJrZXIgPSBXUEdNWkEuTWFya2VyLmNyZWF0ZUluc3RhbmNlKHtcclxuXHRcdFx0XHRwb3NpdGlvbjogb3V0ZXJcclxuXHRcdFx0fSk7XHJcblx0XHRcdFdQR01aQS5tYXBzWzBdLmFkZE1hcmtlcih3aW5kb3cudGVzdE1hcmtlcik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiAxMDA7Ki9cclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRTY2FsZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gMTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdCQodGhpcy5jYW52YXMpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcC5vbE1hcC51bihcInBvc3RyZW5kZXJcIiwgdGhpcy5yZW5kZXJGdW5jdGlvbik7XHJcblx0XHR0aGlzLm1hcCA9IG51bGw7XHJcblx0XHR0aGlzLmNhbnZhcyA9IG51bGw7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Im9wZW4tbGF5ZXJzL29sLW1vZGVybi1zdG9yZS1sb2NhdG9yLWNpcmNsZS5qcyJ9


// js/v8/open-layers/ol-modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module OLModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 * @gulp-requires ../modern-store-locator.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1tb2Rlcm4tc3RvcmUtbG9jYXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBPTE1vZGVyblN0b3JlTG9jYXRvclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvclxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9tb2Rlcm4tc3RvcmUtbG9jYXRvci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3IgPSBmdW5jdGlvbihtYXBfaWQpXHJcblx0e1xyXG5cdFx0dmFyIGVsZW1lbnQ7XHJcblx0XHRcclxuXHRcdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3IuY2FsbCh0aGlzLCBtYXBfaWQpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuaXNQcm9WZXJzaW9uKCkpXHJcblx0XHRcdGVsZW1lbnQgPSAkKFwiLndwZ216YV9tYXBbZGF0YS1tYXAtaWQ9J1wiICsgbWFwX2lkICsgXCInXVwiKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0ZWxlbWVudCA9ICQoXCIjd3BnbXphX21hcFwiKTtcclxuXHRcdFxyXG5cdFx0ZWxlbWVudC5hcHBlbmQodGhpcy5lbGVtZW50KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvcik7XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5PTE1vZGVyblN0b3JlTG9jYXRvcjtcclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1tb2Rlcm4tc3RvcmUtbG9jYXRvci5qcyJ9


// js/v8/open-layers/ol-polygon.js
/**
 * @namespace WPGMZA
 * @module OLPolygon
 * @requires WPGMZA.Polygon
 * @gulp-requires ../polygon.js
 * @pro-requires WPGMZA.ProPolygon
 * @gulp-pro-requires pro-polygon.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolygon = function(options, olFeature)
	{
		var self = this;
		
		Parent.call(this, options, olFeature);
		
		this.olStyle = new ol.style.Style();
		
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
				
				for(var i = 0; i < paths.length; i++)
					coordinates[0].push(ol.proj.fromLonLat([
						parseFloat(paths[i].lng),
						parseFloat(paths[i].lat)
					]));
				
				this.olStyle = new ol.style.Style(this.getStyleFromSettings());
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
			wpgmzaPolygon: this
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
	
	WPGMZA.OLPolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolygon.prototype.constructor = WPGMZA.OLPolygon;

	WPGMZA.OLPolygon.prototype.getStyleFromSettings = function()
	{
		var params = {};
				
		if(this.linecolor && this.lineopacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA("#" + this.linecolor, this.lineopacity)
			});
		
		if(this.opacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(this.fillcolor, this.opacity)
			});
			
		return params;
	}
	
	WPGMZA.OLPolygon.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
	WPGMZA.OLPolygon.prototype.setEditable = function(editable)
	{
		
	}
	
	WPGMZA.OLPolygon.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.olFeature.getGeometry().getCoordinates()[0];
		
		result.points = [];
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.points.push(latLng);
		}
		
		return result;
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1wb2x5Z29uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIE9MUG9seWdvblxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLlBvbHlnb25cclxuICogQGd1bHAtcmVxdWlyZXMgLi4vcG9seWdvbi5qc1xyXG4gKiBAcHJvLXJlcXVpcmVzIFdQR01aQS5Qcm9Qb2x5Z29uXHJcbiAqIEBndWxwLXByby1yZXF1aXJlcyBwcm8tcG9seWdvbi5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5PTFBvbHlnb24gPSBmdW5jdGlvbihvcHRpb25zLCBvbEZlYXR1cmUpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQuY2FsbCh0aGlzLCBvcHRpb25zLCBvbEZlYXR1cmUpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcclxuXHRcdFxyXG5cdFx0aWYob2xGZWF0dXJlKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLm9sRmVhdHVyZSA9IG9sRmVhdHVyZTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dmFyIGNvb3JkaW5hdGVzID0gW1tdXTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKG9wdGlvbnMgJiYgb3B0aW9ucy5wb2x5ZGF0YSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBwYXRocyA9IHRoaXMucGFyc2VHZW9tZXRyeShvcHRpb25zLnBvbHlkYXRhKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgcGF0aHMubGVuZ3RoOyBpKyspXHJcblx0XHRcdFx0XHRjb29yZGluYXRlc1swXS5wdXNoKG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdFx0XHRcdHBhcnNlRmxvYXQocGF0aHNbaV0ubG5nKSxcclxuXHRcdFx0XHRcdFx0cGFyc2VGbG9hdChwYXRoc1tpXS5sYXQpXHJcblx0XHRcdFx0XHRdKSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5vbFN0eWxlID0gbmV3IG9sLnN0eWxlLlN0eWxlKHRoaXMuZ2V0U3R5bGVGcm9tU2V0dGluZ3MoKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMub2xGZWF0dXJlID0gbmV3IG9sLkZlYXR1cmUoe1xyXG5cdFx0XHRcdGdlb21ldHJ5OiBuZXcgb2wuZ2VvbS5Qb2x5Z29uKGNvb3JkaW5hdGVzKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5sYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xyXG5cdFx0XHRzb3VyY2U6IG5ldyBvbC5zb3VyY2UuVmVjdG9yKHtcclxuXHRcdFx0XHRmZWF0dXJlczogW3RoaXMub2xGZWF0dXJlXVxyXG5cdFx0XHR9KSxcclxuXHRcdFx0c3R5bGU6IHRoaXMub2xTdHlsZVxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMubGF5ZXIuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXS5zZXRQcm9wZXJ0aWVzKHtcclxuXHRcdFx0d3BnbXphUG9seWdvbjogdGhpc1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9Qb2x5Z29uO1xyXG5cdGVsc2VcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qb2x5Z29uO1xyXG5cdFxyXG5cdFdQR01aQS5PTFBvbHlnb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQYXJlbnQucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuT0xQb2x5Z29uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5PTFBvbHlnb247XHJcblxyXG5cdFdQR01aQS5PTFBvbHlnb24ucHJvdG90eXBlLmdldFN0eWxlRnJvbVNldHRpbmdzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSB7fTtcclxuXHRcdFx0XHRcclxuXHRcdGlmKHRoaXMubGluZWNvbG9yICYmIHRoaXMubGluZW9wYWNpdHkpXHJcblx0XHRcdHBhcmFtcy5zdHJva2UgPSBuZXcgb2wuc3R5bGUuU3Ryb2tlKHtcclxuXHRcdFx0XHRjb2xvcjogV1BHTVpBLmhleE9wYWNpdHlUb1JHQkEoXCIjXCIgKyB0aGlzLmxpbmVjb2xvciwgdGhpcy5saW5lb3BhY2l0eSlcclxuXHRcdFx0fSk7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMub3BhY2l0eSlcclxuXHRcdFx0cGFyYW1zLmZpbGwgPSBuZXcgb2wuc3R5bGUuRmlsbCh7XHJcblx0XHRcdFx0Y29sb3I6IFdQR01aQS5oZXhPcGFjaXR5VG9SR0JBKHRoaXMuZmlsbGNvbG9yLCB0aGlzLm9wYWNpdHkpXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdHJldHVybiBwYXJhbXM7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTFBvbHlnb24ucHJvdG90eXBlLnVwZGF0ZVN0eWxlRnJvbVNldHRpbmdzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdC8vIFJlLWNyZWF0ZSB0aGUgc3R5bGUgLSB3b3JraW5nIG9uIGl0IGRpcmVjdGx5IGRvZXNuJ3QgY2F1c2UgYSByZS1yZW5kZXJcclxuXHRcdHZhciBwYXJhbXMgPSB0aGlzLmdldFN0eWxlRnJvbVNldHRpbmdzKCk7XHJcblx0XHR0aGlzLm9sU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUocGFyYW1zKTtcclxuXHRcdHRoaXMubGF5ZXIuc2V0U3R5bGUodGhpcy5vbFN0eWxlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWdvbi5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbihlZGl0YWJsZSlcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWdvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciByZXN1bHQgPSBQYXJlbnQucHJvdG90eXBlLnRvSlNPTi5jYWxsKHRoaXMpO1xyXG5cdFx0dmFyIGNvb3JkaW5hdGVzID0gdGhpcy5vbEZlYXR1cmUuZ2V0R2VvbWV0cnkoKS5nZXRDb29yZGluYXRlcygpWzBdO1xyXG5cdFx0XHJcblx0XHRyZXN1bHQucG9pbnRzID0gW107XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjb29yZGluYXRlcy5sZW5ndGg7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGxvbkxhdCA9IG9sLnByb2oudG9Mb25MYXQoY29vcmRpbmF0ZXNbaV0pO1xyXG5cdFx0XHR2YXIgbGF0TG5nID0ge1xyXG5cdFx0XHRcdGxhdDogbG9uTGF0WzFdLFxyXG5cdFx0XHRcdGxuZzogbG9uTGF0WzBdXHJcblx0XHRcdH07XHJcblx0XHRcdHJlc3VsdC5wb2ludHMucHVzaChsYXRMbmcpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1wb2x5Z29uLmpzIn0=


// js/v8/open-layers/ol-polyline.js
/**
 * @namespace WPGMZA
 * @module OLPolyline
 * @requires WPGMZA.Polyline
 * @gulp-requires ../polyline.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolyline = function(options, olFeature)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, options);
		
		this.olStyle = new ol.style.Style();
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [];
			
			if(options && (options.polydata || options.points))
			{
				var path;
				
				if(options.polydata)
					path = this.parseGeometry(options.polydata);
				else	
					path = options.points;
				
				for(var i = 0; i < path.length; i++)
				{
					if(!($.isNumeric(path[i].lat)))
						throw new Error("Invalid latitude");
					
					if(!($.isNumeric(path[i].lng)))
						throw new Error("Invalid longitude");
					
					coordinates.push(ol.proj.fromLonLat([
						parseFloat(path[i].lng),
						parseFloat(path[i].lat)
					]));
				}
			}
			
			var params = this.getStyleFromSettings();
			this.olStyle = new ol.style.Style(params);
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.LineString(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style: this.olStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolyline: this
		});
	}
	
	Parent = WPGMZA.Polyline;
		
	WPGMZA.OLPolyline.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolyline.prototype.constructor = WPGMZA.OLPolyline;
	
	WPGMZA.OLPolyline.prototype.getStyleFromSettings = function()
	{
		var params = {};
		
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity),
				width: parseInt(this.settings.strokeWeight)
			});
			
		return params;
	}
	
	WPGMZA.OLPolyline.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
	WPGMZA.OLPolyline.prototype.setEditable = function(editable)
	{
		
	}
	
	WPGMZA.OLPolyline.prototype.setPoints = function(points)
	{
		if(this.olFeature)
			this.layer.getSource().removeFeature(this.olFeature);
		
		var coordinates = [];
		
		for(var i = 0; i < points.length; i++)
			coordinates.push(ol.proj.fromLonLat([
				parseFloat(points[i].lng),
				parseFloat(points[i].lat)
			]));
		
		this.olFeature = new ol.Feature({
			geometry: new ol.geom.LineString(coordinates)
		});
		
		this.layer.getSource().addFeature(this.olFeature);
	}
	
	WPGMZA.OLPolyline.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.olFeature.getGeometry().getCoordinates();
		
		result.points = [];
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.points.push(latLng);
		}
		
		return result;
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1wb2x5bGluZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBPTFBvbHlsaW5lXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuUG9seWxpbmVcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vcG9seWxpbmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0dmFyIFBhcmVudDtcclxuXHRcclxuXHRXUEdNWkEuT0xQb2x5bGluZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIG9sRmVhdHVyZSlcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFdQR01aQS5Qb2x5bGluZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcclxuXHRcdFxyXG5cdFx0aWYob2xGZWF0dXJlKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLm9sRmVhdHVyZSA9IG9sRmVhdHVyZTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dmFyIGNvb3JkaW5hdGVzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zICYmIChvcHRpb25zLnBvbHlkYXRhIHx8IG9wdGlvbnMucG9pbnRzKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBwYXRoO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKG9wdGlvbnMucG9seWRhdGEpXHJcblx0XHRcdFx0XHRwYXRoID0gdGhpcy5wYXJzZUdlb21ldHJ5KG9wdGlvbnMucG9seWRhdGEpO1xyXG5cdFx0XHRcdGVsc2VcdFxyXG5cdFx0XHRcdFx0cGF0aCA9IG9wdGlvbnMucG9pbnRzO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGlmKCEoJC5pc051bWVyaWMocGF0aFtpXS5sYXQpKSlcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBsYXRpdHVkZVwiKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoISgkLmlzTnVtZXJpYyhwYXRoW2ldLmxuZykpKVxyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGxvbmdpdHVkZVwiKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Y29vcmRpbmF0ZXMucHVzaChvbC5wcm9qLmZyb21Mb25MYXQoW1xyXG5cdFx0XHRcdFx0XHRwYXJzZUZsb2F0KHBhdGhbaV0ubG5nKSxcclxuXHRcdFx0XHRcdFx0cGFyc2VGbG9hdChwYXRoW2ldLmxhdClcclxuXHRcdFx0XHRcdF0pKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBwYXJhbXMgPSB0aGlzLmdldFN0eWxlRnJvbVNldHRpbmdzKCk7XHJcblx0XHRcdHRoaXMub2xTdHlsZSA9IG5ldyBvbC5zdHlsZS5TdHlsZShwYXJhbXMpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5vbEZlYXR1cmUgPSBuZXcgb2wuRmVhdHVyZSh7XHJcblx0XHRcdFx0Z2VvbWV0cnk6IG5ldyBvbC5nZW9tLkxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmxheWVyID0gbmV3IG9sLmxheWVyLlZlY3Rvcih7XHJcblx0XHRcdHNvdXJjZTogbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe1xyXG5cdFx0XHRcdGZlYXR1cmVzOiBbdGhpcy5vbEZlYXR1cmVdXHJcblx0XHRcdH0pLFxyXG5cdFx0XHRzdHlsZTogdGhpcy5vbFN0eWxlXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sYXllci5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdLnNldFByb3BlcnRpZXMoe1xyXG5cdFx0XHR3cGdtemFQb2x5bGluZTogdGhpc1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFBhcmVudCA9IFdQR01aQS5Qb2x5bGluZTtcclxuXHRcdFxyXG5cdFdQR01aQS5PTFBvbHlsaW5lLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGFyZW50LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLk9MUG9seWxpbmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk9MUG9seWxpbmU7XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWxpbmUucHJvdG90eXBlLmdldFN0eWxlRnJvbVNldHRpbmdzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSB7fTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5zZXR0aW5ncy5zdHJva2VPcGFjaXR5KVxyXG5cdFx0XHRwYXJhbXMuc3Ryb2tlID0gbmV3IG9sLnN0eWxlLlN0cm9rZSh7XHJcblx0XHRcdFx0Y29sb3I6IFdQR01aQS5oZXhPcGFjaXR5VG9SR0JBKHRoaXMuc2V0dGluZ3Muc3Ryb2tlQ29sb3IsIHRoaXMuc2V0dGluZ3Muc3Ryb2tlT3BhY2l0eSksXHJcblx0XHRcdFx0d2lkdGg6IHBhcnNlSW50KHRoaXMuc2V0dGluZ3Muc3Ryb2tlV2VpZ2h0KVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0XHJcblx0XHRyZXR1cm4gcGFyYW1zO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xQb2x5bGluZS5wcm90b3R5cGUudXBkYXRlU3R5bGVGcm9tU2V0dGluZ3MgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0Ly8gUmUtY3JlYXRlIHRoZSBzdHlsZSAtIHdvcmtpbmcgb24gaXQgZGlyZWN0bHkgZG9lc24ndCBjYXVzZSBhIHJlLXJlbmRlclxyXG5cdFx0dmFyIHBhcmFtcyA9IHRoaXMuZ2V0U3R5bGVGcm9tU2V0dGluZ3MoKTtcclxuXHRcdHRoaXMub2xTdHlsZSA9IG5ldyBvbC5zdHlsZS5TdHlsZShwYXJhbXMpO1xyXG5cdFx0dGhpcy5sYXllci5zZXRTdHlsZSh0aGlzLm9sU3R5bGUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xQb2x5bGluZS5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbihlZGl0YWJsZSlcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWxpbmUucHJvdG90eXBlLnNldFBvaW50cyA9IGZ1bmN0aW9uKHBvaW50cylcclxuXHR7XHJcblx0XHRpZih0aGlzLm9sRmVhdHVyZSlcclxuXHRcdFx0dGhpcy5sYXllci5nZXRTb3VyY2UoKS5yZW1vdmVGZWF0dXJlKHRoaXMub2xGZWF0dXJlKTtcclxuXHRcdFxyXG5cdFx0dmFyIGNvb3JkaW5hdGVzID0gW107XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspXHJcblx0XHRcdGNvb3JkaW5hdGVzLnB1c2gob2wucHJvai5mcm9tTG9uTGF0KFtcclxuXHRcdFx0XHRwYXJzZUZsb2F0KHBvaW50c1tpXS5sbmcpLFxyXG5cdFx0XHRcdHBhcnNlRmxvYXQocG9pbnRzW2ldLmxhdClcclxuXHRcdFx0XSkpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sRmVhdHVyZSA9IG5ldyBvbC5GZWF0dXJlKHtcclxuXHRcdFx0Z2VvbWV0cnk6IG5ldyBvbC5nZW9tLkxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sYXllci5nZXRTb3VyY2UoKS5hZGRGZWF0dXJlKHRoaXMub2xGZWF0dXJlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWxpbmUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gUGFyZW50LnByb3RvdHlwZS50b0pTT04uY2FsbCh0aGlzKTtcclxuXHRcdHZhciBjb29yZGluYXRlcyA9IHRoaXMub2xGZWF0dXJlLmdldEdlb21ldHJ5KCkuZ2V0Q29vcmRpbmF0ZXMoKTtcclxuXHRcdFxyXG5cdFx0cmVzdWx0LnBvaW50cyA9IFtdO1xyXG5cdFx0XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBsb25MYXQgPSBvbC5wcm9qLnRvTG9uTGF0KGNvb3JkaW5hdGVzW2ldKTtcclxuXHRcdFx0dmFyIGxhdExuZyA9IHtcclxuXHRcdFx0XHRsYXQ6IGxvbkxhdFsxXSxcclxuXHRcdFx0XHRsbmc6IGxvbkxhdFswXVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXN1bHQucG9pbnRzLnB1c2gobGF0TG5nKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoib3Blbi1sYXllcnMvb2wtcG9seWxpbmUuanMifQ==


// js/v8/open-layers/ol-text.js
/**
 * @namespace WPGMZA
 * @module OLText
 * @requires WPGMZA.Text
 * @gulp-requires ../text.js
 */
jQuery(function($) {
	
	WPGMZA.OLText = function()
	{
		
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC10ZXh0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIE9MVGV4dFxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLlRleHRcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vdGV4dC5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuT0xUZXh0ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC10ZXh0LmpzIn0=


// js/v8/tables/datatable.js
/**
 * @namespace WPGMZA
 * @module DataTable
 * @requires WPGMZA
 * @gulp-requires ../core.js
 */
jQuery(function($) {
	
	WPGMZA.DataTable = function(element)
	{
		var self = this;
		if(!$.fn.dataTable)
		{
			console.warn("The dataTables library is not loaded. Cannot create a dataTable. Did you enable 'Do not enqueue dataTables'?");
			
			if(WPGMZA.settings.wpgmza_do_not_enqueue_datatables && WPGMZA.getCurrentPage() == WPGMZA.PAGE_MAP_EDIT)
				alert("You have selected 'Do not enqueue DataTables' in WP Google Maps' settings. No 3rd party software is loading the DataTables library. Because of this, the marker table cannot load. Please uncheck this option to use the marker table.");
			
			return;
		}
		
		if($.fn.dataTable.ext)
			$.fn.dataTable.ext.errMode = "throw";
		else
		{
			var version = $.fn.dataTable.version ? $.fn.dataTable.version : "unknown";
			
			console.warn("You appear to be running an outdated or modified version of the dataTables library. This may cause issues with table functionality. This is usually caused by 3rd party software loading an older version of DataTables. The loaded version is " + version + ", we recommend version 1.10.12 or above.");
		}
		
		this.element = element;
		this.element.wpgmzaDataTable = this;
		this.dataTableElement = this.getDataTableElement();

		var settings = this.getDataTableSettings();
		
		this.phpClass			= $(element).attr("data-wpgmza-php-class");
		this.wpgmzaDataTable	= this;
		
		this.useCompressedPathVariable = (WPGMZA.restAPI.isCompressedPathVariableSupported && WPGMZA.settings.enable_compressed_path_variables);
		this.method = (this.useCompressedPathVariable ? "GET" : "POST");
		
		if(this.getLanguageURL() == undefined || this.getLanguageURL() == "//cdn.datatables.net/plug-ins/1.10.12/i18n/English.json") 
		{
			this.dataTable			= $(this.dataTableElement).DataTable(settings);
			this.dataTable.ajax.reload();
		}
		else{
		
			$.ajax(this.getLanguageURL(), {

				success: function(response, status, xhr)
				{
					self.languageJSON = response; // TODO: This doesn't appear to go anywhere
					
					self.dataTable = $(self.dataTableElement).DataTable(settings);
					self.dataTable.ajax.reload();
				},
				
				error: function()
				{
					// TODO: Use complete instead
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
				self.onAJAXResponse(response);
				
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
		
		if(WPGMZA.AdvancedTableDataTable && this instanceof WPGMZA.AdvancedTableDataTable && WPGMZA.settings.wpgmza_default_items)
			options.iDisplayLength = parseInt(WPGMZA.settings.wpgmza_default_items);
		
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
		this.dataTable.ajax.reload(null, false); // null callback, false for resetPaging
	}
	
});

// js/v8/tables/admin-marker-datatable.js
/**
 * @namespace WPGMZA
 * @module AdminMarkerDataTable
 * @requires WPGMZA.DataTable
 * @gulp-requires datatable.js
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
			WPGMZA.animateScroll("#wpgmaps_tabs_markers");
		}


	}
	
	$(document).ready(function(event) {
		
		$("[data-wpgmza-admin-marker-datatable]").each(function(index, el) {
			WPGMZA.adminMarkerDataTable = WPGMZA.AdminMarkerDataTable.createInstance(el);
		});
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0YWJsZXMvYWRtaW4tbWFya2VyLWRhdGF0YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBBZG1pbk1hcmtlckRhdGFUYWJsZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkRhdGFUYWJsZVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBkYXRhdGFibGUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0V1BHTVpBLkFkbWluTWFya2VyRGF0YVRhYmxlID0gZnVuY3Rpb24oZWxlbWVudClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMucHJldmVudENhY2hpbmcgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuRGF0YVRhYmxlLmNhbGwodGhpcywgZWxlbWVudCk7XHJcblx0XHRcclxuXHRcdC8vIE5COiBQcm8gbWFya2VyIHBhbmVsIGN1cnJlbnRseSBtYW5hZ2VzIGVkaXQgbWFya2VyIGJ1dHRvbnNcclxuXHRcdFxyXG5cdFx0JChlbGVtZW50KS5vbihcImNsaWNrXCIsIFwiW2RhdGEtZGVsZXRlLW1hcmtlci1pZF1cIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbkRlbGV0ZU1hcmtlcihldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0JChlbGVtZW50KS5maW5kKFwiLndwZ216YS5zZWxlY3RfYWxsX21hcmtlcnNcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uU2VsZWN0QWxsKGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKGVsZW1lbnQpLmZpbmQoXCIud3BnbXphLmJ1bGtfZGVsZXRlXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbkJ1bGtEZWxldGUoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0JChlbGVtZW50KS5vbihcImNsaWNrXCIsIFwiW2RhdGEtY2VudGVyLW1hcmtlci1pZF1cIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbkNlbnRlck1hcmtlcihldmVudCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkFkbWluTWFya2VyRGF0YVRhYmxlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLkRhdGFUYWJsZS5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGU7XHJcblx0XHJcblx0V1BHTVpBLkFkbWluTWFya2VyRGF0YVRhYmxlLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24oZWxlbWVudClcclxuXHR7XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZShlbGVtZW50KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkFkbWluTWFya2VyRGF0YVRhYmxlLnByb3RvdHlwZS5nZXREYXRhVGFibGVTZXR0aW5ncyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgb3B0aW9ucyA9IFdQR01aQS5EYXRhVGFibGUucHJvdG90eXBlLmdldERhdGFUYWJsZVNldHRpbmdzLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdG9wdGlvbnMuY3JlYXRlZFJvdyA9IGZ1bmN0aW9uKHJvdywgZGF0YSwgaW5kZXgpXHJcblx0XHR7XHJcblx0XHRcdHZhciBtZXRhID0gc2VsZi5sYXN0UmVzcG9uc2UubWV0YVtpbmRleF07XHJcblx0XHRcdHJvdy53cGdtemFNYXJrZXJEYXRhID0gbWV0YTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG9wdGlvbnM7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZS5wcm90b3R5cGUub25FZGl0TWFya2VyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0V1BHTVpBLmFuaW1hdGVkU2Nyb2xsKFwiI3dwZ21hcHNfdGFic19tYXJrZXJzXCIpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGUucHJvdG90eXBlLm9uRGVsZXRlTWFya2VyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGZcdD0gdGhpcztcclxuXHRcdHZhciBpZFx0XHQ9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuYXR0cihcImRhdGEtZGVsZXRlLW1hcmtlci1pZFwiKTtcclxuXHRcdFxyXG5cdFx0dmFyIGRhdGFcdD0ge1xyXG5cdFx0XHRhY3Rpb246ICdkZWxldGVfbWFya2VyJyxcclxuXHRcdFx0c2VjdXJpdHk6IFdQR01aQS5sZWdhY3lhamF4bm9uY2UsXHJcblx0XHRcdG1hcF9pZDogV1BHTVpBLm1hcEVkaXRQYWdlLm1hcC5pZCxcclxuXHRcdFx0bWFya2VyX2lkOiBpZFxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0JC5wb3N0KGFqYXh1cmwsIGRhdGEsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRXUEdNWkEubWFwRWRpdFBhZ2UubWFwLnJlbW92ZU1hcmtlckJ5SUQoaWQpO1xyXG5cdFx0XHRzZWxmLnJlbG9hZCgpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHQvLyBOQjogTW92ZSB0aGlzIHRvIFVHTVxyXG5cdFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZS5wcm90b3R5cGUub25BcHByb3ZlTWFya2VyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGZcdD0gdGhpcztcclxuXHRcdHZhciBjdXJfaWRcdD0gJCh0aGlzKS5hdHRyKFwiaWRcIik7XHJcblx0XHRcclxuXHRcdHZhciBkYXRhID0ge1xyXG5cdFx0XHRhY3Rpb246XHRcdCdhcHByb3ZlX21hcmtlcicsXHJcblx0XHRcdHNlY3VyaXR5Olx0V1BHTVpBLmxlZ2FjeWFqYXhub25jZSxcclxuXHRcdFx0bWFwX2lkOlx0XHRXUEdNWkEubWFwRWRpdFBhZ2UubWFwLmlkLFxyXG5cdFx0XHRtYXJrZXJfaWQ6XHRjdXJfaWRcclxuXHRcdH07XHJcblx0XHQkLnBvc3QoYWpheHVybCwgZGF0YSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRcclxuXHRcdFx0d3BnbXphX0luaXRNYXAoKTtcclxuXHRcdFx0d3BnbXphX3JlaW5pdGlhbGlzZXRibCgpO1xyXG5cclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGUucHJvdG90eXBlLm9uU2VsZWN0QWxsID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmZpbmQoXCJpbnB1dFtuYW1lPSdtYXJrJ11cIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5BZG1pbk1hcmtlckRhdGFUYWJsZS5wcm90b3R5cGUub25CdWxrRGVsZXRlID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0dmFyIGlkcyA9IFtdO1xyXG5cdFx0dmFyIG1hcCA9IFdQR01aQS5tYXBzWzBdO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuZmluZChcImlucHV0W25hbWU9J21hcmsnXTpjaGVja2VkXCIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XHJcblx0XHRcdHZhciByb3cgPSAkKGVsKS5jbG9zZXN0KFwidHJcIilbMF07XHJcblx0XHRcdGlkcy5wdXNoKHJvdy53cGdtemFNYXJrZXJEYXRhLmlkKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRpZHMuZm9yRWFjaChmdW5jdGlvbihtYXJrZXJfaWQpIHtcclxuXHRcdFx0dmFyIG1hcmtlciA9IG1hcC5nZXRNYXJrZXJCeUlEKG1hcmtlcl9pZCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihtYXJrZXIpXHJcblx0XHRcdFx0bWFwLnJlbW92ZU1hcmtlcihtYXJrZXIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdFdQR01aQS5yZXN0QVBJLmNhbGwoXCIvbWFya2Vycy9cIiwge1xyXG5cdFx0XHRtZXRob2Q6IFwiREVMRVRFXCIsXHJcblx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRpZHM6IGlkc1xyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb21wbGV0ZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c2VsZi5yZWxvYWQoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGUucHJvdG90eXBlLm9uQ2VudGVyTWFya2VyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIGlkO1xyXG5cclxuXHRcdC8vQ2hlY2sgaWYgd2UgaGF2ZSBzZWxlY3RlZCB0aGUgY2VudGVyIG9uIG1hcmtlciBidXR0b24gb3IgY2FsbGVkIHRoaXMgZnVuY3Rpb24gZWxzZXdoZXJlIFxyXG5cdFx0aWYoZXZlbnQuY3VycmVudFRhcmdldCA9PSB1bmRlZmluZWQpXHJcblx0XHR7XHJcblx0XHRcdGlkID0gZXZlbnQ7XHJcblx0XHR9XHJcblx0XHRlbHNle1xyXG5cdFx0XHRpZCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCkuYXR0cihcImRhdGEtY2VudGVyLW1hcmtlci1pZFwiKTtcclxuXHRcdH1cclxuXHJcblx0XHR2YXIgbWFya2VyID0gV1BHTVpBLm1hcEVkaXRQYWdlLm1hcC5nZXRNYXJrZXJCeUlEKGlkKTtcclxuXHRcdFxyXG5cdFx0aWYobWFya2VyKXtcclxuXHRcdFx0dmFyIGxhdExuZyA9IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0XHRsYXQ6IG1hcmtlci5sYXQsXHJcblx0XHRcdFx0bG5nOiBtYXJrZXIubG5nXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly9TZXQgYSBzdGF0aWMgem9vbSBsZXZlbFxyXG5cdFx0XHR2YXIgem9vbV92YWx1ZSA9IDY7XHJcblx0XHRcdFdQR01aQS5tYXBFZGl0UGFnZS5tYXAuc2V0Q2VudGVyKGxhdExuZyk7XHJcblx0XHRcdFdQR01aQS5tYXBFZGl0UGFnZS5tYXAuc2V0Wm9vbSh6b29tX3ZhbHVlKTtcclxuXHRcdFx0V1BHTVpBLmFuaW1hdGVTY3JvbGwoXCIjd3BnbWFwc190YWJzX21hcmtlcnNcIik7XHJcblx0XHR9XHJcblxyXG5cclxuXHR9XHJcblx0XHJcblx0JChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFxyXG5cdFx0JChcIltkYXRhLXdwZ216YS1hZG1pbi1tYXJrZXItZGF0YXRhYmxlXVwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xyXG5cdFx0XHRXUEdNWkEuYWRtaW5NYXJrZXJEYXRhVGFibGUgPSBXUEdNWkEuQWRtaW5NYXJrZXJEYXRhVGFibGUuY3JlYXRlSW5zdGFuY2UoZWwpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxufSk7Il0sImZpbGUiOiJ0YWJsZXMvYWRtaW4tbWFya2VyLWRhdGF0YWJsZS5qcyJ9
