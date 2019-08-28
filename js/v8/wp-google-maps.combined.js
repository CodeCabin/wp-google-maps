
// js/v8/core.js
/**
 * @module WPGMZA
 * @summary This is the core Javascript module. Some code exists in ../core.js, the functionality there will slowly be handed over to this module.
 */
jQuery(function($) {
	
	var core = {
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
		
		loadingHTML: '<div class="wpgmza-preloader"><div class="wpgmza-loader">...</div></div>',
		
		/**
		 * Override this method to add a scroll offset when using animated scroll, useful for sites with fixed headers.
		 * @method getScrollAnimationOffset
		 * @static
		 * @return {number} The scroll offset
		 */
		getScrollAnimationOffset: function() {
			return (WPGMZA.settings.scroll_animation_offset || 0) + $("#wpadminbar").height();
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
			hex = parseInt(colour.replace(/^#/, ""), 16);
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
		getCurrentPosition: function(callback, watch)
		{
			var trigger = "userlocationfound";
			var nativeFunction = "getCurrentPosition";
			
			if(watch)
			{
				trigger = "userlocationupdated";
				nativeFunction = "watchPosition";
				
				// Call again immediatly to get current position, watchPosition won't fire until the user moves
				WPGMZA.getCurrentPosition(callback, false);
			}
			
			if(!navigator.geolocation)
			{
				console.warn("No geolocation available on this device");
				return;
			}
			
			var options = {
				enableHighAccuracy: true
			};
			
			navigator.geolocation[nativeFunction](function(position) {
				if(callback)
					callback(position);
				
				WPGMZA.events.trigger("userlocationfound");
			},
			function(error) {
				
				options.enableHighAccuracy = false;
				
				navigator.geolocation[nativeFunction](function(position) {
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
		
		watchPosition: function(callback)
		{
			return WPGMZA.getCurrentPosition(callback, true);
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
			
			if(WPGMZA.isProVersion())
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
			return typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.places === 'object' && typeof google.maps.places.Autocomplete === 'function';
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
			return (ua.indexOf("safari") != -1 && ua.indexOf("chrome") == -1);
			
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
		
		getQueryParamValue: function(name) {
			
			var regex = new RegExp(name + "=([^&#]*)");
			var m;
			
			if(!(m = window.location.href.match(regex)))
				return null;
			
			return m[1];
			
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
			if(!(a instanceof WPGMZA.LatLng))
				throw new Error("First argument must be an instance of WPGMZA.LatLng");
			
			if(!(b instanceof WPGMZA.LatLng))
				throw new Error("Second argument must be an instance of WPGMZA.LatLng");
			
			if(a === b)
				return 0.0;
			
			var lat1 = a.lat;
			var lon1 = a.lng;
			var lat2 = b.lat;
			var lon2 = b.lng;
			
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
		
		console.log("Decoding buffer from pointer " + compressedBuffer.pointer);
		console.log(compressedBuffer);
		
		var decodingTableHighBits = WPGMZA.EliasFano.decodingTableHighBits;
		var decodingTableDocIDNumber = WPGMZA.EliasFano.decodingTableDocIDNumber;
		var decodingTableHighBitsCarryover = WPGMZA.EliasFano.decodingTableHighBitsCarryover;
		
		var lowBitsPointer = 0,
			lastDocID = 0,
			docID = 0,
			docIDNumber = 0;
		
		var listCount = compressedBuffer[lowBitsPointer++];
		
		console.log("listCount is now " + listCount);
		
		listCount |= compressedBuffer[lowBitsPointer++] << 8;
		
		console.log("listCount is now " + listCount);
		
		listCount |= compressedBuffer[lowBitsPointer++] << 16;
		
		console.log("listCount is now " + listCount);
		
		listCount |= compressedBuffer[lowBitsPointer++] << 24;
		
		console.log("Read list count " + listCount);
		
		var lowBitsLength = compressedBuffer[lowBitsPointer++];
		
		console.log("lowBitsLength = " + lowBitsLength);
		
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
		
			if(obj.listener == listener && obj.thisObject == thisObject && obj.useCapture == useCapture)
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
		if(WPGMZA.settings.engine == "google-maps" && (!WPGMZA.settings.wpgmza_google_maps_api_key || !WPGMZA.settings.wpgmza_google_maps_api_key.length))
			this.addErrorMessage(WPGMZA.localized_strings.no_google_maps_api_key, ["https://www.wpgmaps.com/get-a-google-maps-api-key/"]);
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
			}, 100);
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
	WPGMZA.InfoWindow = function(mapObject)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		WPGMZA.assertInstanceOf(this, "InfoWindow");
		
		if(!mapObject)
			return;
		
		this.mapObject = mapObject;
		
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
		
		return true;
	}
	
	/**
	 * Abstract function, closes this InfoWindow
	 * @method
	 * @memberof WPGMZA.InfoWindow
	 */
	WPGMZA.InfoWindow.prototype.close = function()
	{
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
	
});

// js/v8/map-object.js
/**
 * @namespace WPGMZA
 * @module MapObject
 * @requires WPGMZA.EventDispatcher
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

// js/v8/map-settings-page.js
/**
 * @namespace WPGMZA
 * @module MapSettingsPage
 * @requires WPGMZA
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
		
		this.updateEngineSpecificControls();
		this.updateGDPRControls();
		
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
        options.scrollwheel				= !(this.wpgmza_settings_map_scroll == 'yes');
		
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
		
		if(!(element instanceof HTMLElement))
			throw new Error("Argument must be a HTMLElement");
		
		this.id = element.getAttribute("data-map-id");
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
		
		this.loadSettings(options);
		
		this.shortcodeAttributes = {};
		if($(this.element).attr("data-shortcode-attributes"))
			try{
				this.shortcodeAttributes = JSON.parse($(this.element).attr("data-shortcode-attributes"))
			}catch(e) {
				console.warn("Error parsing shortcode attributes");
			}
		
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
	 * This override should automatically dispatch a .wpgmza scoped event on the element
	 * TODO: Implement
	 */
	/*WPGMZA.Map.prototype.trigger = function(event)
	{
		
	}*/
	
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
		var pixels = this.latLngToPixels(this.getCenter());
		
		pixels.x += parseFloat(x);
		pixels.y += parseFloat(y);
		
		if(isNaN(pixels.x) || isNaN(pixels.y))
			throw new Error("Invalid coordinates supplied");
		
		var latLng = this.pixelsToLatLng(pixels);
		
		this.setCenter(latLng);
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
	
	WPGMZA.MarkerFilter.prototype.update = function()
	{
		// NB: This function takes no action. The client can hide and show markers based on radius without putting load on the server. This function is only used by the ProMarkerFilter module
	}
	
	WPGMZA.MarkerFilter.prototype.onFilteringComplete = function(results)
	{
		
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
	 * @method
	 * @memberof WPGMZA.Marker
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
	 */
	WPGMZA.Marker.prototype.onClick = function(event)
	{
		
	}
	
	/**
	 * Called when the marker has been selected, either by the icon being clicked, or from a marker listing
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.onSelect = function(event)
	{
		this.openInfoWindow();
	}
	
	/**
	 * Called when the user hovers the mouse over this marker
	 * @method
	 * @memberof WPGMZA.Marker
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
			original = $(".wpgmza_sl_search_button[mid='" + map_id + "']").closest(".wpgmza_sl_main_div");
		else
			original = $(".wpgmza_sl_search_button").closest(".wpgmza_sl_main_div");
		
		if(!original.length)
			return;
		
		// Build / re-arrange elements
		this.element = $("<div class='wpgmza-modern-store-locator'><div class='wpgmza-inner wpgmza-modern-hover-opaque'/></div>")[0];
		
		var inner = $(this.element).find(".wpgmza-inner");
		
		var titleSearch = $(original).find("[id='nameInput_" + map_id + "']");
		if(titleSearch.length)
		{
			var placeholder = wpgmaps_localize[map_id].other_settings.store_locator_name_string;
			if(placeholder && placeholder.length)
				titleSearch.attr("placeholder", placeholder);
			inner.append(titleSearch);
		}
		
		var addressInput;
		if(WPGMZA.isProVersion())
			addressInput = $(original).find(".addressInput");
		else
			addressInput = $(original).find("#addressInput");
		
		if(wpgmaps_localize[map_id].other_settings.store_locator_query_string && wpgmaps_localize[map_id].other_settings.store_locator_query_string.length)
			addressInput.attr("placeholder", wpgmaps_localize[map_id].other_settings.store_locator_query_string);
		
		inner.append(addressInput);
		
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
		this.searchButton = $(original).find( ".wpgmza_sl_search_button" );
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
			this.element = $('<span><i class="fab fa-apple" aria-hidden="true"></i></span>');
		}
		else
		{
			this.type = "google";
			this.element = $('<span><i class="fab fa-google" aria-hidden="true"></i></span>');
		}
	};
	
});

// js/v8/polygon.js
/**
 * @namespace WPGMZA
 * @module Polygon
 * @requires WPGMZA.MapObject
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

// js/v8/polyline.js
/**
 * @namespace WPGMZA
 * @module Polyline
 * @requires WPGMZA.MapObject
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
	WPGMZA.PopoutPanel = function()
	{
		
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
			var encoder		= new WPGMZA.EliasFano();
			var encoded		= encoder.encode(markerIDs);
			var compressed	= pako.deflate(encoded);
			var string		= Array.prototype.map.call(compressed, function(ch) {
				return String.fromCharCode(ch);
			}).join("");
			
			// NB: Append as another path component, this stops the code below performing base64 encoding twice and enlarging the request
			suffix = "/" + btoa(string).replace(/\//g, "-");
			
			// NB: midcbp = Marker ID compressed buffer pointer, abbreviated to save space
			params.midcbp = encoded.pointer;
			
			delete params.markerIDs;
		}
		
		var string		= JSON.stringify(params);
		var encoder		= new TextEncoder();
		var input		= encoder.encode(string);
		var compressed	= pako.deflate(input);
		var raw			= Array.prototype.map.call(compressed, function(ch) {
			return String.fromCharCode(ch);
		}).join("");
		
		var base64		= btoa(raw);
		return base64.replace(/\//g, "-") + suffix;
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
		
		if(typeof route != "string" || !route.match(/^\//))
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
		
		if(params.useCompressedPathVariable && this.isCompressedPathVariableSupported && WPGMZA.settings.enable_compressed_path_variables)
		{
			var compressedParams = $.extend({}, params);
			var data = params.data;
			var compressedRoute = route.replace(/\/$/, "") + "/base64" + this.compressParams(data);
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
		
		// TODO: This will be moved into this module instead of listening to the map event
		this.map.on("storelocatorgeocodecomplete", function(event) {
			self.onGeocodeComplete(event);
		});
		
		this.map.on("init", function(event) {
			
			self.map.markerFilter.on("filteringcomplete", function(event) {
				self.onFilteringComplete(event);
			});
			
		});
		
		// Legacy store locator buttons
		$(document.body).on("click", ".wpgmza_sl_search_button_" + map.id, function(event) {
			self.onSearch(event);
		});
		
		$(document.body).on("click", ".wpgmza_sl_reset_button_" + map.id, function(event) {
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
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "radius", {
		"get": function() {
			return $("#radiusSelect_" + this.map.id).val();
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "center", {
		"get": function() {
			return this._center;
		}
	});
	
	WPGMZA.StoreLocator.prototype.onGeocodeComplete = function(event)
	{
		if(!event.results || !event.results.length)
		{
			this._center = null;
			return;
		}
		else
			this._center = new WPGMZA.LatLng( event.results[0].latLng );
		
		this.map.markerFilter.update();
	}
	
	WPGMZA.StoreLocator.prototype.onSearch = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_APPLIED;
	}
	
	WPGMZA.StoreLocator.prototype.onReset = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		this._center = null;
		
		this.map.markerFilter.update();
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
		if(event.filteredMarkers.length == 0)
			$(this.element).find(".wpgmza-not-found-msg").show();
		else
			$(this.element).find(".wpgmza-not-found-msg").hide();
	}
	
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
	
});

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
		{
			var googleOptions = {};
			
			googleOptions = $.extend({}, options);
			delete googleOptions.map;
			delete googleOptions.center;
			
			if(options.center)
				googleOptions.center = new google.maps.LatLng({
					lat: options.center.lat,
					lng: options.center.lng
				});
			
			this.googleCircle.setOptions(googleOptions);
			
			if(options.map)
				options.map.addCircle(this);
		}
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
		
		var geocoder = new google.maps.Geocoder();
		
		geocoder.geocode(options, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK)
			{
				var location = results[0].geometry.location;
				var latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				
				var results = [
					{
						geometry: {
							location: latLng
						},
						latLng: latLng,
						lat: latLng.lat,
						lng: latLng.lng
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
	
	WPGMZA.GoogleInfoWindow = function(mapObject)
	{
		Parent.call(this, mapObject);
		
		this.setMapObject(mapObject);
	}
	
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
		
		google.maps.event.addListener(this.googleInfoWindow, "domready", function(event) {
			self.trigger("domready");
		});
		
		google.maps.event.addListener(this.googleInfoWindow, "closeclick", function(event) {
			self.mapObject.map.trigger("infowindowclose");
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
		
		this.googleInfoWindow.open(
			this.mapObject.map.googleMap,
			this.googleObject
		);
		
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
		
		if(!initializing)
		{
			this.googleMap.setOptions(options);
			return;
		}
		
		var converted = $.extend(options, this.settings.toGoogleMapsOptions());
		
		//this.googleMap.setOptions(converted);
		
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
		// TODO: This will bug the front end because there is textarea with theme data
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
	
	WPGMZA.GoogleMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);
		
		var settings = {};
		if(row)
		{
			for(var name in row)
			{
				if(row[name] instanceof WPGMZA.LatLng)
				{
					settings[name] = row[name].toGoogleLatLng();
				}
				else if(row[name] instanceof WPGMZA.Map)
				{
					// Do nothing (ignore)
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
			
		this.googleMarker.setLabel(this.settings.label);
		
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

// js/v8/google-maps/google-modern-store-locator.js
/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
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

// js/v8/google-maps/google-polygon.js
/**
 * @namespace WPGMZA
 * @module GooglePolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GooglePolygon = function(row, googlePolygon)
	{
		var self = this;
		
		Parent.call(this, row, googlePolygon);
		
		if(googlePolygon)
		{
			this.googlePolygon = googlePolygon;
		}
		else
		{
			this.googlePolygon = new google.maps.Polygon(this.settings);
			
			if(row && row.points)
			{
				var paths = this.parseGeometry(row.points);
				this.googlePolygon.setOptions({paths: paths});
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

// js/v8/google-maps/google-polyline.js
/**
 * @namespace WPGMZA
 * @module GooglePolyline
 * @requires WPGMZA.Polyline
 */
jQuery(function($) {
	
	WPGMZA.GooglePolyline = function(row, googlePolyline)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, row, googlePolyline);
		
		if(googlePolyline)
		{
			this.googlePolyline = googlePolyline;
		}
		else
		{
			this.googlePolyline = new google.maps.Polyline(this.settings);			
			this.googlePolyline.wpgmzaPolyline = this;
			
			if(row && row.points)
			{
				var path = this.parseGeometry(row.points);
				this.setPoints(path);
			}
		}
		
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
		
		console.log(options);
		
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

// js/v8/open-layers/ol-circle.js
/**
 * @namespace WPGMZA
 * @module OLCircle
 * @requires WPGMZA.Circle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.OLCircle = function(options, olFeature)
	{
		var self = this;
		
		this.center = {lat: 0, lng: 0};
		this.radius = 0;
		
		Parent.call(this, options, olFeature);
		
		if(!this.settings.fillColor)
		{
			this.settings.fillColor = "#ff0000";
			this.settings.fillOpacity = 0.6;
		}
		
		if(options.fillColor)
			this.settings.fillColor = options.fillColor;
		if(options.fillOpacity)
			this.settings.fillOpacity = options.fillOpacity;
		
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
		var wgs84Sphere = new ol.Sphere(6378137);
		var radius = parseFloat(this.radius) * 1000;
		var x, y;
		
		x = this.center.lng;
		y = this.center.lat;
		
		var circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [x, y], radius, 64);
		var circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
		
		this.olFeature = new ol.Feature(circle3857);
		
		this.layer.getSource().addFeature(this.olFeature);
	}
	
	WPGMZA.OLCircle.prototype.getStyleFromSettings = function()
	{
		var params = {};
				
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
			});
		
		if(this.settings.fillOpacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(this.settings.fillColor, this.settings.fillOpacity)
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

// js/v8/open-layers/ol-info-window.js
/**
 * @namespace WPGMZA
 * @module OLInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
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
		
		// Controls
		this.olMap.getControls().forEach(function(control) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(control instanceof ol.control.Zoom && WPGMZA.settings.wpgmza_settings_map_zoom == "yes")
				self.olMap.removeControl(control);
			
		}, this);
		
		if(WPGMZA.settings.wpgmza_settings_map_full_screen_control != "yes")
			this.olMap.addControl(new ol.control.FullScreen());
		
		// Marker layer
		this.markerLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: []
			})
		});
		this.olMap.addLayer(this.markerLayer);
		
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
		var center = this.getCenter();
		
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
		this.olMap.addOverlay(marker.overlay);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	WPGMZA.OLMap.prototype.removeMarker = function(marker)
	{
		this.olMap.removeOverlay(marker.overlay);
		
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
	
	WPGMZA.OLMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);

		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		var img = $("<img alt=''/>")[0];
		img.onload = function(event) {
			if(self.map)
				self.map.olMap.updateSize();
		}
		img.src = WPGMZA.defaultMarkerIcon;
		
		this.element = $("<div class='ol-marker'></div>")[0];
		this.element.append(img);
		
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
		
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.OLMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.OLMarker.prototype.constructor = WPGMZA.OLMarker;
	
	WPGMZA.OLMarker.prototype.addLabel = function()
	{
		this.setLabel(this.getLabelText());
	}
	
	WPGMZA.OLMarker.prototype.setLabel = function(label)
	{
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
		return this.overlay.getElement().style.display != "none";
	}
	
	WPGMZA.OLMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);
		
		this.overlay.getElement().style.display = (visible ? "block" : "none");
	}
	
	WPGMZA.OLMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
	
		this.overlay.setPosition(origin);
	}
	
	WPGMZA.OLMarker.prototype.updateOffset = function(x, y)
	{
		var x = this._offset.x;
		var y = this._offset.y;
		
		this.element.style.position = "relative";
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
	}
	
	WPGMZA.OLMarker.prototype.setAnimation = function(anim)
	{
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
		$(this.element).css({opacity: opacity});
	}
	
	WPGMZA.OLMarker.prototype.onDragStart = function(event)
	{
		this.isBeingDragged = true;
	}
		
	WPGMZA.OLMarker.prototype.onDragEnd = function(event)
	{
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

// js/v8/open-layers/ol-polygon.js
/**
 * @namespace WPGMZA
 * @module OLPolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolygon = function(row, olFeature)
	{
		var self = this;
		
		Parent.call(this, row, olFeature);
		
		this.olStyle = new ol.style.Style();
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [[]];
			
			if(row && row.points)
			{
				var paths = this.parseGeometry(row.points);
				
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
				
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
			});
		
		if(this.settings.fillOpacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(this.settings.fillColor, this.settings.fillOpacity)
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

// js/v8/open-layers/ol-polyline.js
/**
 * @namespace WPGMZA
 * @module OLPolyline
 * @requires WPGMZA.Polyline
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolyline = function(row, olFeature)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, row);
		
		this.olStyle = new ol.style.Style();
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [];
			
			if(row && row.points)
			{
				var path = this.parseGeometry(row.points);
				
				for(var i = 0; i < path.length; i++)
					coordinates.push(ol.proj.fromLonLat([
						parseFloat(path[i].lng),
						parseFloat(path[i].lat)
					]));
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

// js/v8/open-layers/ol-text.js
/**
 * @namespace WPGMZA
 * @module OLText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.OLText = function()
	{
		
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
		if($.fn.dataTable.ext)
			$.fn.dataTable.ext.errMode = "throw";
		else
		{
			var version = $.fn.dataTable.version ? $.fn.dataTable.version : "unknown";
			
			console.log("You appear to be running an outdated or modified version of the dataTables library. This may cause issues with table functionality. This is usually caused by 3rd party software loading an older version of DataTables. The loaded version is " + version + ", we recommend version 1.10.12 or above.");
		}
		
		this.element = element;
		this.element.wpgmzaDataTable = this;
		this.dataTableElement = this.getDataTableElement();

		var settings = this.getDataTableSettings();
		
		this.phpClass			= $(element).attr("data-wpgmza-php-class");
		this.dataTable			= $(this.dataTableElement).DataTable(settings);
		this.wpgmzaDataTable	= this;
		
		this.useCompressedPathVariable = (WPGMZA.restAPI.isCompressedPathVariableSupported && WPGMZA.settings.enable_compressed_path_variables);
		this.method = (this.useCompressedPathVariable ? "GET" : "POST");
		
		this.dataTable.ajax.reload();
	}
	
	Object.defineProperty(WPGMZA.DataTable.prototype, "canSendCompressedRequests", {
		
		"get": function() {
			
			return (
				WPGMZA.serverCanInflate == 1 && 
				"Uint8Array" in window && 
				"TextEncoder" in window && 
				!WPGMZA.settings.forceDatatablesPOST && 
				WPGMZA.settings.useCompressedDataTablesRequests
			);
			
		}
		
	});
	
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
		
		options.aLengthMenu = [5, 10, 25, 50, 100];
		
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
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Afrikaans.json";
				break;

			case "sq":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Albanian.json";
				break;

			case "am":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Amharic.json";
				break;

			case "ar":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Arabic.json";
				break;

			case "hy":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Armenian.json";
				break;

			case "az":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Azerbaijan.json";
				break;

			case "bn":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Bangla.json";
				break;

			case "eu":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Basque.json";
				break;

			case "be":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Belarusian.json";
				break;

			case "bg":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Bulgarian.json";
				break;

			case "ca":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Catalan.json";
				break;

			case "zh":
				if(WPGMZA.locale == "zh_TW")
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Chinese-traditional.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Chinese.json";
				break;

			case "hr":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Croatian.json";
				break;

			case "cs":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Czech.json";
				break;

			case "da":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Danish.json";
				break;

			case "nl":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Dutch.json";
				break;

			/*case "en":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/English.json";
				break;*/

			case "et":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Estonian.json";
				break;

			case "fi":
				if(WPGMZA.locale.match(/^fil/))
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Filipino.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Finnish.json";
				break;

			case "fr":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/French.json";
				break;

			case "gl":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Galician.json";
				break;

			case "ka":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Georgian.json";
				break;

			case "de":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/German.json";
				break;

			case "el":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Greek.json";
				break;

			case "gu":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Gujarati.json";
				break;

			case "he":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Hebrew.json";
				break;

			case "hi":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Hindi.json";
				break;

			case "hu":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Hungarian.json";
				break;

			case "is":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Icelandic.json";
				break;

			/*case "id":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Indonesian-Alternative.json";
				break;*/
			
			case "id":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Indonesian.json";
				break;

			case "ga":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Irish.json";
				break;

			case "it":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Italian.json";
				break;

			case "ja":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Japanese.json";
				break;

			case "kk":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Kazakh.json";
				break;

			case "ko":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Korean.json";
				break;

			case "ky":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Kyrgyz.json";
				break;

			case "lv":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Latvian.json";
				break;

			case "lt":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Lithuanian.json";
				break;

			case "mk":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Macedonian.json";
				break;

			case "ml":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Malay.json";
				break;

			case "mn":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Mongolian.json";
				break;

			case "ne":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Nepali.json";
				break;

			case "nb":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Norwegian-Bokmal.json";
				break;
			
			case "nn":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Norwegian-Nynorsk.json";
				break;
			
			case "ps":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Pashto.json";
				break;

			case "fa":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Persian.json";
				break;

			case "pl":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Polish.json";
				break;

			case "pt":
				if(WPGMZA.locale == "pt_BR")
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Portuguese-Brasil.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Portuguese.json";
				break;
			
			case "ro":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Romanian.json";
				break;

			case "ru":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Russian.json";
				break;

			case "sr":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Serbian.json";
				break;

			case "si":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Sinhala.json";
				break;

			case "sk":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Slovak.json";
				break;

			case "sl":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Slovenian.json";
				break;

			case "es":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Spanish.json";
				break;

			case "sw":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Swahili.json";
				break;

			case "sv":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Swedish.json";
				break;

			case "ta":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Tamil.json";
				break;

			case "te":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/telugu.json";
				break;

			case "th":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Thai.json";
				break;

			case "tr":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Turkish.json";
				break;

			case "uk":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Ukrainian.json";
				break;

			case "ur":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Urdu.json";
				break;

			case "uz":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Uzbek.json";
				break;

			case "vi":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Vietnamese.json";
				break;

			case "cy":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.12/i18n/Welsh.json";
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
 */
jQuery(function($) {
	
	WPGMZA.AdminMarkerDataTable = function(element)
	{
		var self = this;
		
		this.preventCaching = true;
		
		WPGMZA.DataTable.call(this, element);
		
		$(element).find(".wpgmza.select_all_markers").on("click", function(event) {
			self.onSelectAll(event);
		});
		
		$(element).find(".wpgmza.bulk_delete").on("click", function(event) {
			self.onBulkDelete(event);
		});
	}
	
	WPGMZA.AdminMarkerDataTable.prototype = Object.create(WPGMZA.DataTable.prototype);
	WPGMZA.AdminMarkerDataTable.prototype.constructor = WPGMZA.AdminMarkerDataTable;
	
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
		
		WPGMZA.restAPI.call("/markers/?skip_cache=1", {
			method: "DELETE",
			data: {
				ids: ids
			},
			complete: function() {
				self.reload();
			}
		});
	}
	
	$(document).ready(function(event) {
		
		$("[data-wpgmza-admin-marker-datatable]").each(function(index, el) {
			WPGMZA.adminMarkerDataTable = new WPGMZA.AdminMarkerDataTable(el);
		});
		
	});
	
});