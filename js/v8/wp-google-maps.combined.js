
// js/v8/core.js
/**
 * @module WPGMZA
 */
(function($) {
	var core = {
		maps: [],
		events: null,
		settings: null,
		
		loadingHTML: '<div class="wpgmza-preloader"><div class="wpgmza-loader">...</div></div>',
		
		/**
		 * Utility function returns a GUID
		 * @return void
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
		 * @return array RGBA whre color components are 0-255 and opacity is 0.0-1.0
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
		 * Utility function returns true is string is a latitude and longitude
		 * @return array the matched latitude and longitude or null if no match
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
		 * Utility function returns a latLng literal given a valid latLng string
		 * @return latLng
		 */
		stringToLatLng: function(str)
		{
			var result = WPGMZA.isLatLngString(str);
			
			if(!result)
				throw new Error("Not a valid latLng");
			
			return result;
		},
		
		/**
		 * Utility function to get the dimensions of an image
		 * @return void
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
		 * Returns true if developer mode is set
		 * @return void
		 */
		isDeveloperMode: function()
		{
			return this.settings.developer_mode || (window.Cookies && window.Cookies.get("wpgmza-developer-mode"));
		},
		
		/**
		 * Returns true if running the Pro version of the plugin
		 * @return void
		 */
		isProVersion: function()
		{
			return this.is_pro_version;
		},
		
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
		 * This function will get the users position, it first attempts to get
		 * high accuracy position (mobile with GPS sensors etc.), if that fails
		 * (desktops will time out) then it tries again without high accuracy
		 * enabled
		 * @return object The users position
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
				callback(position);
			},
			function(error) {
				
				options.enableHighAccuracy = false;
				
				navigator.geolocation.getCurrentPosition(function(position) {
					callback(position);
				},
				function(error) {
					console.warn(error.code, error.message);
				},
				options);
				
			},
			options);
		},
		
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
		 * This function is for checking inheritence has been setup correctly.
		 * For objects that have engine and Pro specific classes, it will automatically
		 * add the engine and pro prefix to the supplied string and if such an object
		 * exists it will test against that name rather than the un-prefix argument
		 * supplied.
		 *
		 * For example, if we are running the Pro addon with Google maps as the engine,
		 * if you supply Marker as the instance name the function will check to see
		 * if instance is an instance of GoogleProMarker
		 *
		 * return @void
		 */
		assertInstanceOf: function(instance, instanceName) {
			var engine, fullInstanceName, assert;
			var pro = WPGMZA.isProVersion() ? "Pro" : "";
			
			switch(WPGMZA.settings.engine)
			{
				case "google-maps":
					engine = "Google";
					break;
				
				default:
					engine = "OSM";
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
				throw new Error("Object must be an instance of " + fullInstanceName);
		},
		
		getMapByID: function(id) {
			for(var i = 0; i < WPGMZA.maps.length; i++) {
				if(WPGMZA.maps[i].id == id)
					return WPGMZA.maps[i];
			}
			
			return null;
		},
		
		isGoogleAutocompleteSupported: function() {
			return typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.places === 'object' && typeof google.maps.places.Autocomplete === 'function';
		}
	};
	
	if(window.WPGMZA)
		window.WPGMZA = $.extend(window.WPGMZA, core);
	else
		window.WPGMZA = core;
	
	for(var key in WPGMZA_localized_data)
		WPGMZA[key] = WPGMZA_localized_data[key];
	
	/*for(var key in WPGMZA_localized_data)
		WPGMZA[key] = WPGMZA_localized_data[key];

	$(document).ready(function(event) {
		// Datatables to throw errors
		if($.fn.dataTable)
			$.fn.dataTable.ext.errMode = 'throw';
		
		// Combined script warning
		if($("script[src*='wp-google-maps.combined.js'], script[src*='wp-google-maps-pro.combined.js']").length)
			console.warn("Minified script is out of date, using combined script instead.");
		
		// Check for multiple jQuery versions
		var elements = $("script").filter(function() {
			return this.src.match(/(^|\/)jquery\.(min\.)?js(\?|$)/i);
		});

		if(elements.length > 1)
			console.warn("Multiple jQuery versions detected: ", elements);
	
		// Disable map edit page preloader in developer more
		if(WPGMZA.isDeveloperMode())
			$("#wpgmza-map-edit-page form.wpgmza").show();
	
		// Shortcode boxes
		$(".wpgmza_copy_shortcode").on("click", function() {
			var temp = $("<input>");
			var temp2 = $('<div id="wpgmza_tmp" style="display: none;" width:100%; text-align:center;"/>');
			$(document.body).append(temp);
			temp.val($(this).val()).select();
			document.execCommand("copy");
			temp.remove();
			$(this).after(temp2);
			$(temp2).html(
				$("[data-shortcode-copy-string]").attr("data-shortcode-copy-string")
			);
			$(temp2).fadeIn();
			setTimeout(function() {
				$(temp2).fadeOut();
			}, 1000);
			setTimeout(function() {
				$(temp2).remove();
			}, 1500);
		});
		
		// Fancy switches
		// $("form.wpgmza .cmn-toggle").each(function(index, el) {
		// 	
		// 	$(el).wrap("<div class='switch'/>");
		// 	$(el).after("<label for=""/>")
		// 	
		// });
		
		$("form.wpgmza").on("click", ".switch label", function(event) {
			var input = $(this).prev(".cmn-toggle");
			
			if(input.prop("disabled"))
				return;
			
			var val = !input.prop("checked");
			
			input.prop("checked", val);
			
			if(val)
				input.attr("checked", "checked");
			else
				input.removeAttr("checked");
			
			input.trigger("change");
		});
		
		// Geolocation warnings
		if(window.location.protocol != 'https:')
		{
			var warning = '<span class="notice notice-warning">' + WPGMZA.localized_strings.unsecure_geolocation + "</span>";
			
			$(".wpgmza-geolocation-setting").after(
				$(warning)
			);
		}
		
		// Switch off thanks for feedback message
		document.cookie = "wpgmza_feedback_thanks=false; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
	});*/
})(jQuery);

// js/v8/distance.js
/**
 * @namespace WPGMZA
 * @module Distance
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.Distance = {
		
		MILES:					true,
		KILOMETERS:				false,
		
		MILES_PER_KILOMETER:	0.621371,
		KILOMETERS_PER_MILE:	1.60934,
		
		/**
		 * Converts a UI distance (eg from a form control) to meters,
		 * accounting for the global units setting
		 */
		uiToMeters: function(uiDistance)
		{
			return parseFloat(uiDistance) / (WPGMZA.settings.distance_units == WPGMZA.Distance.MILES ? WPGMZA.Distance.MILES_PER_KILOMETER : 1) * 1000;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to kilometers,
		 * accounting for the global units setting
		 */
		uiToKilometers: function(uiDistance)
		{
			return WPGMZA.Distance.uiToMeters(uiDistance) * 0.001;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to miles,
		 * accounting for the global units setting
		 */
		uiToMiles: function(uiDistance)
		{
			return WPGMZA.Distance.uiToKilometers(uiDistance) * WPGMZA.Distance.MILES_PER_KILOMETER;
		},
		
		kilometersToUI: function(km)
		{
			if(WPGMZA.settings.distance_units == WPGMZA.Distance.MILES)
				return km * WPGMZA.Distance.MILES_PER_KILOMETER;
			return km;
		}
		
	};
	
})(jQuery);

// js/v8/event-dispatcher.js
/**
 * @namespace WPGMZA
 * @module EventDispatcher
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.EventDispatcher = function()
	{
		WPGMZA.assertInstanceOf(this, "EventDispatcher");
		
		this._listenersByType = [];
	}

	WPGMZA.EventDispatcher.prototype.addEventListener = function(type, listener, thisObject, useCapture)
	{
		var arr;
		
		var types = type.split(/\s+/);
		if(types.length > 1)
		{
			for(var i = 0; i < types.length; i++)
				this.addEventListener(types[i], listener, thisObject, useCapture);
			
			return;
		}
		
		if(!(listener instanceof Function))
			throw new Error("Listener must be a function");

		if(!(arr = this._listenersByType[type]))
			arr = this._listenersByType[type] = [];
			
		var obj = {
			listener: listener,
			thisObject: (thisObject ? thisObject : this),
			useCapture: (useCapture ? true : false)
			};
			
		arr.push(obj);
	}

	WPGMZA.EventDispatcher.prototype.on = WPGMZA.EventDispatcher.prototype.addEventListener;

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

	WPGMZA.EventDispatcher.prototype.off = WPGMZA.EventDispatcher.prototype.removeEventListener;

	WPGMZA.EventDispatcher.prototype.hasEventListener = function(type)
	{
		return (_listenersByType[type] ? true : false);
	}

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
	}

	WPGMZA.EventDispatcher.prototype.trigger = WPGMZA.EventDispatcher.prototype.dispatchEvent;

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

})(jQuery);

// js/v8/datatable.js
/**
 * @namespace WPGMZA
 * @module DataTable
 * @requires WPGMZA.EventDispatcher
 */
(function($) {
	
	WPGMZA.DataTable = function(element, options)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		if(!(element instanceof HTMLElement))
			throw new Error("First argument must be an instance of HTMLElement");
		
		if(!$(element).attr("data-ajax-action"))
			throw new Error("data-ajax-action attribute is missing");
		
		if(!$(element).attr("data-map-id"))
			throw new Error("data-map-id attribute is missing");
		
		this.element = element;
		this.ajaxAction = $(element).attr("data-ajax-action");
		this.mapID = $(element).attr("data-map-id");
		
		var settings = this.getDataTableSettings();
		
		if(options)
			$.extend(true, settings, options);
		
		this.dataTable = $(element).DataTable(settings);
		
		// TODO: Uncomment and test
		/*$(element).on("draw.dt", function() {
			self.trigger("refresh");
		});*/
	}
	
	WPGMZA.DataTable.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.DataTable.prototype.constructor = WPGMZA.DataTable;
	
	WPGMZA.DataTable.prototype.refresh = function()
	{
		$(this.element).DataTable().ajax.reload();
	}
	
	WPGMZA.DataTable.prototype.onAJAXRequest = function(data, settings)
	{
		$.extend(data, {
			"action": this.ajaxAction,
			"map_id": this.mapID
		});
		
		return data;
	}
	
	WPGMZA.DataTable.prototype.onAJAXResponse = function(response)
	{
		this.lastResponseMeta = response.meta;
		return response.data;
	}
	
	WPGMZA.DataTable.prototype.onCreatedRow = function(row, data, index)
	{
		var meta = this.lastResponseMeta[index];
		
		for(var name in meta)
			$(row).attr("data-" + name, meta[name]);
		
		this.trigger("rowcreated");
	}
	
	WPGMZA.DataTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var columns = null;
		
		$(this.element).find("[data-column-key]").each(function(index, el) {
			if(!columns)
				columns = [];
			columns.push({
				"data": $(el).attr("data-column-key")
			});
		});

		var settings = {
			"processing":	true,
			"serverSide":	true,
			"ajax": {
				"url":		WPGMZA.ajaxurl,
				"type":		"POST",
				"data":		function(data, settings) {
					return self.onAJAXRequest(data, settings);
				},
				"dataSrc":	function(response) {
					return self.onAJAXResponse(response);
				}
			},
			"createdRow":	function(row, data, index) {
				self.onCreatedRow(row, data, index);
			}
		};
		
		var languageURL;
		
		switch(WPGMZA.locale.substr(0, 2))
		{
			case "af":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Afrikaans.json";
				break;

			case "sq":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Albanian.json";
				break;

			case "am":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Amharic.json";
				break;

			case "ar":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Arabic.json";
				break;

			case "hy":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Armenian.json";
				break;

			case "az":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Azerbaijan.json";
				break;

			case "bn":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Bangla.json";
				break;

			case "eu":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Basque.json";
				break;

			case "be":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Belarusian.json";
				break;

			case "bg":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Bulgarian.json";
				break;

			case "ca":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Catalan.json";
				break;

			case "zh":
				if(WPGMZA.locale == "zh_TW")
					languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Chinese-traditional.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Chinese.json";
				break;

			case "hr":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Croatian.json";
				break;

			case "cs":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Czech.json";
				break;

			case "da":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Danish.json";
				break;

			case "nl":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Dutch.json";
				break;

			/*case "en":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/English.json";
				break;*/

			case "et":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Estonian.json";
				break;

			case "fi":
				if(WPGMZA.locale.match(/^fil/))
					languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Filipino.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Finnish.json";
				break;

			case "fr":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/French.json";
				break;

			case "gl":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Galician.json";
				break;

			case "ka":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Georgian.json";
				break;

			case "de":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/German.json";
				break;

			case "el":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Greek.json";
				break;

			case "gu":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Gujarati.json";
				break;

			case "he":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Hebrew.json";
				break;

			case "hi":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Hindi.json";
				break;

			case "hu":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Hungarian.json";
				break;

			case "is":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Icelandic.json";
				break;

			/*case "id":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Indonesian-Alternative.json";
				break;*/
			
			case "id":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Indonesian.json";
				break;

			case "ga":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Irish.json";
				break;

			case "it":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Italian.json";
				break;

			case "ja":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Japanese.json";
				break;

			case "kk":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Kazakh.json";
				break;

			case "ko":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Korean.json";
				break;

			case "ky":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Kyrgyz.json";
				break;

			case "lv":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Latvian.json";
				break;

			case "lt":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Lithuanian.json";
				break;

			case "mk":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Macedonian.json";
				break;

			case "ml":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Malay.json";
				break;

			case "mn":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Mongolian.json";
				break;

			case "ne":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Nepali.json";
				break;

			case "nb":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Norwegian-Bokmal.json";
				break;
			
			case "nn":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Norwegian-Nynorsk.json";
				break;
			
			case "ps":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Pashto.json";
				break;

			case "fa":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Persian.json";
				break;

			case "pl":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Polish.json";
				break;

			case "pt":
				if(WPGMZA.locale == "pt_BR")
					languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Portuguese-Brasil.json";
				else
					languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Portuguese.json";
				break;
			
			case "ro":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Romanian.json";
				break;

			case "ru":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Russian.json";
				break;

			case "sr":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Serbian.json";
				break;

			case "si":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Sinhala.json";
				break;

			case "sk":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Slovak.json";
				break;

			case "sl":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Slovenian.json";
				break;

			case "es":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json";
				break;

			case "sw":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Swahili.json";
				break;

			case "sv":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Swedish.json";
				break;

			case "ta":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Tamil.json";
				break;

			case "te":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/telugu.json";
				break;

			case "th":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Thai.json";
				break;

			case "tr":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Turkish.json";
				break;

			case "uk":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Ukrainian.json";
				break;

			case "ur":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Urdu.json";
				break;

			case "uz":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Uzbek.json";
				break;

			case "vi":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Vietnamese.json";
				break;

			case "cy":
				languageURL = "//cdn.datatables.net/plug-ins/1.10.16/i18n/Welsh.json";
				break;
		}
		
		if(languageURL)
			settings["language"] = {
				"url": languageURL
			};
		
		// TODO: Debug. These custom columns break the datatable completely
		//if(columns)
			//settings["columns"] = columns;
		
		return settings;
	}
	
})(jQuery);

// js/v8/admin-table.js
/**
 * @namespace WPGMZA
 * @module AdminTable
 * @requires WPGMZA.DataTable
 */
(function($) {
	
	WPGMZA.AdminTable = function(element, settings)
	{
		WPGMZA.DataTable.call(this, element, settings);
		
		var self = this;
		
		this.settings = {};
		$.extend(this.settings, settings);
		
		this.objectType = $(element).attr("data-object-type");
		this.capitalizedSingularObjectType = this.objectType.charAt(0).toUpperCase() + this.objectType.slice(1).replace(/s$/, "");
		this.markerDragNoticeIssued = false;
		
		element.adminTable = this;
	}
	
	WPGMZA.AdminTable.prototype = Object.create(WPGMZA.DataTable.prototype);
	WPGMZA.AdminTable.prototype.constructor = WPGMZA.AdminTable;
	
	WPGMZA.AdminTable.prototype.getDataTableSettings = function()
	{
		var self = this;
		var settings = WPGMZA.DataTable.prototype.getDataTableSettings.call(this);
		
		settings["initComplete"] = function(settings, json) {
			self.onInitComplete(settings, json);
		};
		
		return settings;
	}
	
	WPGMZA.AdminTable.prototype.onInitComplete = function(settings, json)
	{
		// TODO: Localize these strings, or better still, move the code to PHP
		var self = this;
		var element = this.element;
		
		// Additional column headers
		$(element).find("thead>tr, tfoot>tr").prepend("<th>Mark</th>");
		$(element).find("thead>tr, tfoot>tr").append("<th>Actions</th>");
		
		// Action buttons
		$(element).on("click", "button[data-action]", function(event) {
			var action = $(event.currentTarget).attr("data-action");
			var actionFunctionName = action + self.capitalizedSingularObjectType;
			var objectID = $(event.target).closest("[data-id]").attr("data-id");
			
			if($(event.currentTarget).hasClass("wpgmza-edit-marker-location") && !self.markerDragNoticeIssued)
			{
				var timeout = parseInt(WPGMZA.settings.scroll_animation_milliseconds || 400);
				
				setTimeout(function() {
					$(".wpgmza-engine-map").after("<p class='notice notice-info animated bounce'>\
						" + WPGMZA.localized_strings.marker_drag_notice + "\
					</p>");
				}, timeout);
				
				self.markerDragNoticeIssued = true;
			}
			
			switch(action)
			{
				case "edit":
					var getFunctionName = "get" + self.capitalizedSingularObjectType + "ByID";
					var object = WPGMZA.mapEditPage.map[getFunctionName](objectID);
				
					WPGMZA.mapEditPage[actionFunctionName](object);
					WPGMZA.mapEditPage.map.setZoom(16);
					
					WPGMZA.animateScroll($("#map-edit-tabs"));
					
					break;
					
				case "delete":
					actionFunctionName += "ByID";
					WPGMZA.mapEditPage[actionFunctionName](objectID);
					self.refresh();
					break;
			}
		});
		
		// Bulk controls
		$(element).after(
			'<div class="wpgmza-bulk-buttons">' +
				'&#x21b3;' +
				'<button type="button" class="button button-primary select-all">Select All</button>' +
				'<button type="button" class="button button-primary bulk-delete">Bulk Delete</button>' +
			'</div>'
		);
		
		var buttons = $(element).next(".wpgmza-bulk-buttons");
		
		buttons.find(".select-all").on("click", function(event) {
			$(element).find("input[type='checkbox'].mark").prop("checked", "true");
		});
		
		var deleteFunctionName = "delete" + this.capitalizedSingularObjectType + "ByID";
		buttons.find(".bulk-delete").on("click", function(event) {
			$(element).find("input[data-mark-id]:checked").each(function(index, el) {
				var objectID = parseInt($(el).attr("data-mark-id"));
				WPGMZA.mapEditPage[deleteFunctionName](objectID);
			});
			
			self.refresh();
		});
	}
	
	WPGMZA.AdminTable.prototype.onCreatedRow = function(row, data, index)
	{
		WPGMZA.DataTable.prototype.onCreatedRow.call(this, row, data, index);
		
		var td = $('<td class="wpgmza-actions"/>');
		var meta = this.lastResponseMeta[index];
		
		$(row).prepend(
			$("<td><input type='checkbox' class='mark' data-mark-id='" + meta.id + "'/></td>")
		);
		
		$(td).append("<button data-action='edit' type='button' class='button button-primary wpgmza-edit'><i class='fa fa-pencil-square-o' aria-hidden='true'></i></button>");
		$(td).append(" ");
		
		if(this.objectType == "markers")
		{
			$(td).append("<button data-action='edit' type='button' class='button button-primary wpgmza-edit wpgmza-edit-marker-location'><i class='fa fa-map-marker' aria-hidden='true'></i></button>");
			$(td).append(" ");
		}
		
		$(td).append("<button data-action='delete' type='button' class='button button-primary wpgmza-delete'><i class='fa fa-trash-o' aria-hidden='true'></i></button>");
		
		if(this.objectType == "markers")
		{
			$(td).find(".wpgmza-edit").attr("title", WPGMZA.localized_strings.edit_this_marker);
			$(td).find(".wpgmza-edit-marker-location").attr("title", WPGMZA.localized_strings.edit_this_marker_location);
			$(td).find(".wpgmza-delete").attr("title", WPGMZA.localized_strings.delete_this_marker);
		}
		
		$(row).append(td);
		
		this.trigger({
			type: "admintable.rowcreated",
			row: row,
			data: data,
			index: index,
			meta: meta
		});
	}
	
	WPGMZA.AdminTable.prototype.onAJAXRequest = function(data, settings)
	{
		WPGMZA.DataTable.prototype.onAJAXRequest.call(this, data, settings);
		
		if(!WPGMZA.mapEditPage)
			return data;	// Still initializing
		
		$.extend(data, {
			"exclude_ids": WPGMZA.mapEditPage.deleteIDs[this.objectType].join(",")
		});
		
		//console.log(data);
		
		return data;
	}
	
})(jQuery);

// js/v8/drawing-manager.js
/**
 * @namespace WPGMZA
 * @module DrawingManager
 * @requires WPGMZA.EventDispatcher
 */
(function($) {
	
	WPGMZA.DrawingManager = function(map)
	{
		WPGMZA.assertInstanceOf(this, "DrawingManager");
		
		WPGMZA.EventDispatcher.call(this);
		
		this.map = map;
		this.mode = WPGMZA.DrawingManager.MODE_NONE;
	}
	
	WPGMZA.DrawingManager.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.DrawingManager.prototype.constructor = WPGMZA.DrawingManager;
	
	WPGMZA.DrawingManager.MODE_NONE				= null;
	WPGMZA.DrawingManager.MODE_MARKER			= "marker";
	WPGMZA.DrawingManager.MODE_POLYGON			= "polygon";
	WPGMZA.DrawingManager.MODE_POLYLINE			= "polyline";
	
	WPGMZA.DrawingManager.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return WPGMZA.GoogleDrawingManager;
				break;
				
			default:
				return WPGMZA.OSMDrawingManager;
				break;
		}
	}
	
	WPGMZA.DrawingManager.createInstance = function(map)
	{
		var constructor = WPGMZA.DrawingManager.getConstructor();
		return new constructor(map);
	}
	
	WPGMZA.DrawingManager.prototype.setDrawingMode = function(mode)
	{
		this.mode = mode;
	}
	
})(jQuery);

// js/v8/event.js
/**
 * @namespace WPGMZA
 * @module Event
 * @requires WPGMZA
 */ 
(function($) {
		
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

	WPGMZA.Event.prototype.stopPropagation = function()
	{
		this._cancelled = true;
	}
	
})(jQuery);

// js/v8/friendly-error.js
/**
 * @namespace WPGMZA
 * @module FriendlyError
 * @requires WPGMZA
 */
(function($) {
	
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
	
})(jQuery);

// js/v8/geocoder.js
/**
 * @namespace WPGMZA
 * @module Geocoder
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.Geocoder = function()
	{
		WPGMZA.assertInstanceOf(this, "Geocoder");
	}
	
	WPGMZA.Geocoder.SUCCESS			= "success";
	WPGMZA.Geocoder.ZERO_RESULTS	= "zero-results";
	WPGMZA.Geocoder.FAIL			= "fail";
	
	WPGMZA.Geocoder.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return WPGMZA.GoogleGeocoder;
				break;
				
			default:
				return WPGMZA.OSMGeocoder;
				break;
		}
	}
	
	WPGMZA.Geocoder.createInstance = function()
	{
		var constructor = WPGMZA.Geocoder.getConstructor();
		return new constructor();
	}
	
	WPGMZA.Geocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(WPGMZA.isLatLngString(options.address))
		{
			var parts = options.address.split(/,\s*/);
			var latLng = {
				lat: parseFloat(parts[0]),
				lng: parseFloat(parts[1])
			}
			callback(latLng);
		}
	}
	
	WPGMZA.Geocoder.prototype.geocode = function(options, callback)
	{
		return this.getLatLngFromAddress(options, callback);
	}
	
})(jQuery);

// js/v8/info-window.js
/**
 * @namespace WPGMZA
 * @module InfoWindow
 * @requires WPGMZA.EventDispatcher
 */
(function($) {
	
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
	
	WPGMZA.InfoWindow.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProInfoWindow;
				return WPGMZA.GoogleInfoWindow;
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.OSMProInfoWindow;
				return WPGMZA.OSMInfoWindow;
				break;
		}
	}
	
	WPGMZA.InfoWindow.createInstance = function(mapObject)
	{
		var constructor = this.getConstructor();
		return new constructor(mapObject);
	}
	
	/**
	 * Gets the content for the info window and passes it to the specified callback - this allows for delayed loading (eg AJAX) as well as instant content
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
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.InfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		this.mapObject = mapObject;
		
		if(WPGMZA.settings.disable_infowindows)
			return false;
		
		return true;
	}
	
	WPGMZA.InfoWindow.prototype.close = function()
	{
		
	}
	
	/**
	 * Event listener for when the map object is added. This will cause the info window to open if the map object has infoopen set
	 * @return void
	 */
	WPGMZA.InfoWindow.prototype.onMapObjectAdded = function()
	{
		if(this.mapObject.settings.infoopen == 1)
			this.open();
	}
	
})(jQuery);

// js/v8/latlng.js
/**
 * @namespace WPGMZA
 * @module LatLng
 * @requires WPGMZA
 */
(function($) {

	/**
	 * Constructor
	 * @param mixed A latLng literal, or latitude
	 * @param mixed The latitude, where arg is a longitude
	 */
	WPGMZA.LatLng = function(arg, lng)
	{
		this._lat = 0;
		this._lng = 0;
		
		if(arguments.length == 0)
			return;
		
		if(arguments.length == 1)
		{
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
	
	WPGMZA.LatLng.isValid = function(obj)
	{
		if(typeof obj != "object")
			return false;
		
		if(!("lat" in obj && "lng" in obj))
			return false;
		
		return true;
	}
	
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
	
})(jQuery);

// js/v8/latlngbounds.js
/**
 * @namespace WPGMZA
 * @module LatLngBounds
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.LatLngBounds = function(southWest, northEast)
	{
		
	}
	
	WPGMZA.LatLngBounds.prototype.isInInitialState = function()
	{
		return (this.north == undefined && this.south == undefined && this.west == undefined && this.east == undefined);
	}
	
	WPGMZA.LatLngBounds.prototype.extend = function(latLng)
	{
		if(this.isInInitialState())
		{
			this.north = this.south = this.west = this.east = new WPGMZA.LatLng(latLng);
			return;
		}
		
		if(!(latLng instanceof WPGMZA.LatLng))
			latLng = new WPGMZA.LatLng(latLng);
		
		if(latLng.lat < this.north)
			this.north = latLng.lat;
		
		if(latLng.lat > this.south)
			this.south = latLng.lat;
		
		if(latLng.lng < this.west)
			this.west = latLng.lng;
		
		if(latLng.lng > this.east)
			this.east = latLng.lng;
	}
	
})(jQuery);


// js/v8/map-object.js
/**
 * @namespace WPGMZA
 * @module MapObject
 * @requires WPGMZA.EventDispatcher
 */
(function($) {
	
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
	
	WPGMZA.MapObject.prototype.toJSON = function()
	{
		return {
			id: this.id,
			guid: this.guid,
			settings: this.settings
		};
	}
	
})(jQuery);

// js/v8/circle.js
/**
 * @namespace WPGMZA
 * @module Circle
 * @requires WPGMZA.MapObject
 */
(function($) {
	
	var Parent = WPGMZA.MapObject;
	
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
	
	WPGMZA.Circle.createInstance = function(options)
	{
		var constructor;
		
		if(WPGMZA.settings.engine == "google-maps")
			constructor = WPGMZA.GoogleCircle;
		else
			constructor = WPGMZA.OSMCircle;
		
		return new constructor(options);
	}
	
	WPGMZA.Circle.prototype.getCenter = function()
	{
		return this.center.clone();
	}
	
	WPGMZA.Circle.prototype.setCenter = function(latLng)
	{
		this.center.lat = latLng.lat;
		this.center.lng = latLng.lng;
	}
	
	WPGMZA.Circle.prototype.getRadius = function()
	{
		return this.radius;
	}
	
	WPGMZA.Circle.prototype.setRadius = function(radius)
	{
		this.radius = radius;
	}
	
	WPGMZA.Circle.prototype.getMap = function()
	{
		return this.map;
	}
	
	WPGMZA.Circle.prototype.setMap = function(map)
	{
		if(this.map)
			this.map.removeCircle(this);
		
		if(map)
			map.addCircle(this);
			
	}
	
})(jQuery);

// js/v8/map-settings.js
/**
 * @namespace WPGMZA
 * @module MapSettings
 * @requires WPGMZA
 */
(function($) {
	
	function empty(name)
	{
		return !self[name] || !self[name].length;
	}
	
	WPGMZA.MapSettings = function(element)
	{
		var str = element.getAttribute("data-settings");
		var json = JSON.parse(str);
		
		//var id = $(element).attr("data-map-id");
		//var json = JSON.parse(window["wpgmza_map_settings_" + id]);
		
		WPGMZA.assertInstanceOf(this, "MapSettings");
		
		for(var key in json)
		{
			var value = json[key];
			
			if(String(value).match(/^-?\d+$/))
				value = parseInt(value);
				
			this[key] = value;
		}
	}
	
	WPGMZA.MapSettings.prototype.toOSMViewOptions = function()
	{
		var options = {
			center: ol.proj.fromLonLat([-119.4179, 36.7783]),
			zoom: 4
		};
		
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
		
		// Start zoom
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
		
		var options = {
			zoom:			zoom,
			center:			latLng
		};
		
		if(!empty("min_zoom"))
			options.minZoom = parseInt(this.min_zoom);
		if(!empty("max_zoom"))
			options.maxZoom = parseInt(this.max_zoom);
		
		// These settings are all inverted because the checkbox being set means "disabled"
		options.zoomControl 			= !(this.map_zoom == true);
		options.panControl 				= !(this.map_pan == true);
		options.mapTypeControl			= !(this.disable_map_type_controls == true);
		options.streetViewControl		= !(this.map_streetview == true);
		options.fullscreenControl		= !(this.map_full_screen_control == true);
		
		options.draggable				= !(this.map_draggable == true);
		options.disableDoubleClickZoom	= !(this.map_clickzoom == true);
		options.scrollwheel				= !(this.map_scroll == true);
		
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

// js/v8/map.js
/**
 * @namespace WPGMZA
 * @module Map
 * @requires WPGMZA.EventDispatcher
 */
(function($) {
	
	/**
	 * Constructor
	 * @param element to contain map
	 */
	WPGMZA.Map = function(element)
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
		
		this.loadSettings();
	}
	
	WPGMZA.Map.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.Map.prototype.constructor = WPGMZA.Map;
	
	WPGMZA.Map.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProMap;
				
				return WPGMZA.GoogleMap;
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.OSMProMap;
				
				return WPGMZA.OSMMap;
				break;
		}
	}
	
	WPGMZA.Map.createInstance = function(element)
	{
		var constructor = WPGMZA.Map.getConstructor();
		return new constructor(element);
	}
	
	/**
	 * Loads the maps settings and sets some defaults
	 * @return void
	 */
	WPGMZA.Map.prototype.loadSettings = function()
	{
		var settings = new WPGMZA.MapSettings(this.element);
		this.settings = $.extend({}, WPGMZA.settings, settings);
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
	 * @return void
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
	
	WPGMZA.Map.prototype.setCenter = function(latLng)
	{
		if(!("lat" in latLng && "lng" in latLng))
			throw new Error("Argument is not an object with lat and lng");
	}
	
	/**
	 * Sets the dimensions of the map
	 * @return void
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
	 * @return void
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
	 * @return void
	 */
	WPGMZA.Map.prototype.removeMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		marker.map = null;
		marker.parent = null;
		
		this.markers.splice(this.markers.indexOf(marker), 1);
		this.dispatchEvent({type: "markerremoved", marker: marker});
		marker.dispatchEvent({type: "removed"});
	}
	
	WPGMZA.Map.prototype.getMarkerByID = function(id)
	{
		for(var i = 0; i < this.markers.length; i++)
		{
			if(this.markers[i].id == id)
				return this.markers[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.removeMarkerByID = function(id)
	{
		var marker = this.getMarkerByID(id);
		
		if(!marker)
			return;
		
		this.removeMarker(marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
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
	 * @return void
	 */
	WPGMZA.Map.prototype.deletePolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		if(polygon.map !== this)
			throw new Error("Wrong map error");
		
		polygon.map = null;
		
		this.polygons.splice(this.polygons.indexOf(polygon), 1);
		this.dispatchEvent({type: "polygonremoved", polygon: polygon});
	}
	
	WPGMZA.Map.prototype.getPolygonByID = function(id)
	{
		for(var i = 0; i < this.polygons.length; i++)
		{
			if(this.polygons[i].id == id)
				return this.polygons[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.deletePolygonByID = function(id)
	{
		var polygon = this.getPolygonByID(id);
		
		if(!polygon)
			return;
		
		this.deletePolygon(polygon);
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
	 * @return void
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
	 * @return void
	 */
	WPGMZA.Map.prototype.deletePolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		if(polyline.map !== this)
			throw new Error("Wrong map error");
		
		polyline.map = null;
		
		this.polylines.splice(this.polylines.indexOf(polyline), 1);
		this.dispatchEvent({type: "polylineremoved", polyline: polyline});
	}
	
	WPGMZA.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.deletePolylineByID = function(id)
	{
		var polyline = this.getPolylineByID(id);
		
		if(!polyline)
			return;
		
		this.deletePolyline(polyline);
	}
	
	/**
	 * Adds the specified circle to this map
	 * @return void
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
	 * @return void
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
	
	WPGMZA.Map.prototype.getCircleByID = function(id)
	{
		for(var i = 0; i < this.circles.length; i++)
		{
			if(this.circles[i].id == id)
				return this.circles[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.deleteCircleByID = function(id)
	{
		var circle = this.getCircleByID(id);
		
		if(!circle)
			return;
		
		this.deleteCircle(circle);
	}
	
	/**
	 * Nudges the map viewport by the given pixel coordinates
	 * @return void
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
	 * Triggered when the window resizes
	 * @return void
	 */
	WPGMZA.Map.prototype.onWindowResize = function(event)
	{
		
	}
	
	/**
	 * Listener for when the engine map div is resized
	 * @return void
	 */
	WPGMZA.Map.prototype.onElementResized = function(event)
	{
		
	}
	
	WPGMZA.Map.prototype.onBoundsChanged = function(event)
	{
		$(this.element).trigger("bounds_changed");
		$(this.element).trigger("boundschanged.wpgmza");
	}
	
	WPGMZA.Map.prototype.onIdle = function(event)
	{
		$(this.element).trigger("idle");
		$(this.element).trigger("idle.wpgmza");
	}
	
	/*$(document).ready(function() {
		function createMaps()
		{
			// TODO: Test that this works for maps off screen (which borks google)
			$(".wpgmza-map").each(function(index, el) {
				if(!el.wpgmzaMap)
				{
					WPGMZA.runCatchableTask(function() {
						WPGMZA.Map.createInstance(el);
					}, el);
				}
			});
		}
		
		createMaps();
		
		// Call again each second to load AJAX maps
		setInterval(createMaps, 1000);
	});*/
})(jQuery);

// js/v8/map-edit-page.js
/**
 * @namespace WPGMZA
 * @module MapEditPage
 * @requires WPGMZA.Map
 */
(function($) {
	
	/**
	 * Map edit page constructor
	 * TODO: Break this up a bit into smaller functions, it's huge
	 */
	WPGMZA.MapEditPage = function()
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "MapEditPage");
		
		this.map = null;
		this.rightClickCursor = null;
		this.editMapObjectTarget = null;
		this.drawingManager = null;
		this.onFetchEditMarkerID = null;
		this.unloadListenerBound = false;
		this.initialBoundsChanged = true;
		
		this.deleteIDs = {
			markers: [],
			polygons: [],
			polylines: []
		};
		
		// Main tabs
		$(".wpgmza-tabs").each(function(index, el) {
			var options = {};
			
			var active = 0;
			if(window.sessionStorage)
				active = parseInt(sessionStorage.getItem(el.id));
			
			options = {
				active: active,
				beforeActivate: function(event, ui) {
					self.finishEditingMapObject();
				},
				activate: function(event, ui) {
					self.onMapPanelTabActivated(event, ui);
				}
			};
				
			$(el).tabs(options);
		});
		
		// Settings accordion
		var active = 0;
		if(window.sessionStorage)
			active = parseInt(sessionStorage.getItem("wpgmza-map-edit-page-accordion"));
		$(".wpgmza-accordion").accordion({
			heightStyle: "content",
			autoHeight: false,
			clearStyle: true,
			collapsible: true,
			active: active,
			activate: function(event, ui) {
				if(window.sessionStorage)
					sessionStorage.setItem("wpgmza-map-edit-page-accordion", $(event.target).accordion("option", "active"));
			}
		});
		
		// Map start zoom slider
		$("#zoom-level-slider").slider({
			min: 1,
			max: 21,
			value: $("input[name='start_zoom']").val(),
			slide: function(event, ui) {
				$("input[name='start_zoom']").val(
					ui.value
				);
				self.map.setZoom(ui.value);
			}
		});
		
		// Set up theme radio buttons
		$("#themes input[type='radio']").on("change", function(event) {
			// Grab JSON from the radio button
			var str = $(this).attr("data-theme-json");
			json = JSON.parse(str);
			
			// Pretty print the JSON
			str = JSON.stringify(json, undefined, 4);
			
			// Set the value into text field
			$("textarea[name='theme_data']").val(str);
			
			self.applyThemeData();
		});
		
		// Preview custom theme button
		$("#preview-custom-theme").on("click", function(event) {
			$("#themes input[type='radio']").prop("checked", false);
			
			self.applyThemeData();
		});
		
		// Preview mode
		function onPreviewMode(event)
		{
			if($("input[name='preview_mode']").prop("checked"))
				$("#wpgmza-map-edit-page").addClass("wpgmza-preview-front-end");
			else
				$("#wpgmza-map-edit-page").removeClass("wpgmza-preview-front-end");
		}
		$("input[name='preview_mode']").on("change", onPreviewMode);
		onPreviewMode();
		
		// Get map instance
		this.map = WPGMZA.maps[0];
		
		// Listen for markers, polygons and polylines being added
		self.map.markers.forEach(function(marker) {
			self.onMarkerAdded({marker: marker});
		});
		
		self.map.polygons.forEach(function(polygon) {
			self.onPolygonAdded({polygon: polygon});
		});
		
		self.map.polylines.forEach(function(polyline) {
			self.onPolylineAdded({polyline: polyline});
		});
		
		this.map.addEventListener("markeradded", function(event) {
			self.onMarkerAdded(event);
		});
		this.map.addEventListener("markerremoved", function(event) {
			self.onMarkerRemoved(event);
		});
		this.map.addEventListener("polygonadded", function(event) {
			self.onPolygonAdded(event);
		});
		this.map.addEventListener("polygonremoved", function(event) {
			self.onPolygonRemoved(event);
		});
		this.map.addEventListener("polylineadded", function(event) {
			self.onPolylineAdded(event);
		});
		this.map.addEventListener("fetchsuccess", function(event) {
			self.onMapFetchSuccess(event);
		});
		
		// Listen for bounds change
		this.map.addEventListener("boundschanged", function(event) {
			self.onBoundsChanged(event);
		});
		
		// When the user clicks cancel edit button or blank space on the map, cancel editing marker
		this.map.addEventListener("click", function(event) {
			if(event.target instanceof WPGMZA.Map)
				self.finishEditingMapObject();
		});
		
		// Set up right click marker adding
		this.rightClickCursor = WPGMZA.Marker.createInstance({
			draggable: true
		});
		
		// TODO: This should really be on the OSMMapEditPage class
		if(WPGMZA.OSMMapEditPage && this instanceof WPGMZA.OSMMapEditPage)
			$(this.rightClickCursor.element).addClass("wpgmza-right-click-marker");
		
		this.rightClickCursor.setVisible(false);
		
		function placeRightClickMarker(event) {
			self.onRightClickMap(event);
		}
		
		this.map.addEventListener("rightclick", placeRightClickMarker);
		this.rightClickCursor.addEventListener("dragend", placeRightClickMarker);

		// Lock start viewport
		function onLockStartViewport(event) {
			var locked = $("input[name='lock_start_viewport']").prop("checked");
			
            $("input[name='start_location'], input[name='start_zoom']").prop("disabled", locked);
			$("button#view-locked-viewport").prop("disabled", !locked);
        }
		
        $("#lock_start_viewport").on("change", onLockStartViewport);
        onLockStartViewport();
		
		$("button#view-locked-viewport").on("click", function(event) {
			var center = WPGMZA.stringToLatLng($("input[name='start_location']").val());
			var zoom = parseInt( $("input[name='start_zoom']").val() );
			
			self.map.setCenter(center);
			self.map.setZoom(zoom);
		});

		// Bind listener to update form on changes
		$("form.wpgmza").on("change", function(event) {
			self.onFormChanged(event);
		});
		this.onFormChanged();
		
		// Marker buttons
		$("#add-marker, #update-marker").on("click", function(event) { 
			self.onSaveMarker(event); 
		});
		$("#cancel-marker-edit").on("click", function(event) { 
			self.finishEditingMapObject();
		});
		$("#delete-marker").on("click", function(event) { 
			self.onDeleteMarker(event); 
		});
		
		// Polygon buttons
		$("#draw-polygon").on("click", function(event) {
			WPGMZA.animateScroll($(".wpgmza-engine-map"));
			self.onDrawPolygon(event); 
		});
		$("#finish-editing-polygon").on("click", function(event) { 
			self.finishEditingMapObject();
		});
		$("#delete-polygon").on("click", function(event) { 
			self.onDeletePolygon(event);
		});
		
		// Polyline buttons
		$("#draw-polyline").on("click", function(event) {
            WPGMZA.animateScroll($(".wpgmza-engine-map"));
			self.onDrawPolyline(event);
		});
		$("#finish-editing-polyline").on("click", function(event) { 
			self.onFinishEditingPolyline(event); 
		});
		$("#delete-polyline").on("click", function(event) { 
			self.onDeletePolyline(event); 
		});
		
		// Polygon input change listeners
		$("#polygons").find("input, textarea, select").on("change input", function(event) { 
			self.onPolygonSettingChanged(event); 
		});
		
		// Polyline input change listeners
		$("#polylines").find("input, textarea, select").on("change input", function(event) { 
			self.onPolylineSettingChanged(event); 
		});
		
		// Drawing manager for polygons and polylines
		this.drawingManager = WPGMZA.DrawingManager.createInstance(this.map);
		this.drawingManager.addEventListener("polygonclosed", function(event) {
			self.onPolygonClosed(event);
		});
		this.drawingManager.addEventListener("polylinecomplete", function(event) {
			self.onPolylineComplete(event);
		});
		
		// Right click delete menu for polygon and polyline points
		this.vertexContextMenu = this.createVertexContextMenuInstance();
		
		// Marker table
		this.loadMapObjectTables();
		
		// Listen for changes on "live" polygon and polyline forms (markers are flagged as modified by createOrUpdateMarker, that form is not "live")
		$("#polygons").find("input, select, textarea").on("change", function(event) { 
			if(self.editMapObjectTarget instanceof WPGMZA.Polygon)
				self.editMapObjectTarget.modified = true;
		});
		$("#polylines").find("input, select, textarea").on("change", function(event) {
			if(self.editMapObjectTarget)
				self.editMapObjectTarget.modified = true;
		});
		
		// Marker drag
		this.map.on("dragend", function(event) {
			event.target.modified = true;
			event.target.settings.dragged = true;
			
			if(self.editMapObjectTarget instanceof WPGMZA.Marker && event.target == self.editMapObjectTarget)
			{
				var latLng = self.editMapObjectTarget.getPosition();
				$("input[name='lat']").val(latLng.lat);
				$("input[name='lng']").val(latLng.lng);
				$("[name='dragged']").prop("checked", true);
			}
		});
		
		$("form.wpgmza").on("change", function(event) {
			self.bindUnloadListener();
		});
		
		// Hide / show store locator dynamically
		$("input[name='store_locator']").on("change", function(event) {
			$(".wpgmza-map .store-locator").css({
				display: $(event.target).prop("checked") ? "block" : "none"
			});
		});
		
		// Zoom limit slider
		$("#zoom-range-slider").slider({
			range: true,
			min: 1,
			max: 21,
			values: [
				$("input[name='min_zoom']").val(), 
				$("input[name='max_zoom']").val()
			],
			slide: function(event, ui) {
				self.onZoomLimitsChanged(event, ui);
			}
		});
		
		// Move polygon and polyline instructions from map edit panel into map element
		$(".wpgmza-engine-map").append(
			$("#markers-instructions")
		);
		
		$(".wpgmza-engine-map").append(
			$("#polygon-instructions")
		);
		
		$(".wpgmza-engine-map").append(
			$("#polyline-instructions")
		);
		
		// Dynamic show/hide layers and points of interest
		$("input[name='bicycle']").on("change", function(event) {
			self.map.enableBicycleLayer(event.target.checked);
		});
		$("input[name='traffic']").on("change", function(event) {
			self.map.enableTrafficLayer(event.target.checked);
		});
		$("input[name='transport']").on("change", function(event) {
			self.map.enablePublicTransportLayer(event.target.checked);
		});
		$("input[name='show_points_of_interest']").on("change", function(event) {
			self.map.showPointsOfInterest(event.target.checked);
		});
		
		// Alignment and dimensions
		$("select[name='map_align']").on("change", function(event) {
			self.map.setAlignment(event.target.value);
		});
		
		// Polyfill for color pickers
		if(!window.Modernizr || !Modernizr.inputtypes.color)
			$("input[type='color']").spectrum();
		
		// Form submission
		$("form.wpgmza").submit(function(event) {
			self.onSubmit(event)
		});
		
		// Clear marker fields
		this.clearMarkerFields();
		
		// Show instructions for the active map panel tab
		var active = $("#map-edit-tabs").tabs("option", "active");
		var panel = $("#map-edit-tabs>div")[active];
		if(panel)
		{
			var id = $(panel).attr("id");
			this.showMapInstructions(id.replace(/s$/, ""));
		}
		
		// Escape key finishes editing
		$(document).on("keyup", function(event) {
			if(event.keyCode == 27)
				self.finishEditingMapObject();
		});
		
		// Large polyline warning dialog
		$("#wpgmza-big-polyline-dialog").remodal();
		
		// General layout
		$("select[name='general_layout']").on("change", function(event) {
			self.onGeneralLayoutChanged(event);
		});
		
		// Layout system
		/*var mouseX, mouseY;
		
		$("[data-wpgmza-layout-element]").each(function(index, el) {
			$(el).append($("<div class='wpgmza-layout-handle' data-for='" + $(el).attr("data-wpgmza-layout-element") + "'><i class='fa fa-arrows' aria-hidden='true'></i></div>"));
		});
		
		$(document).on("mousemove", function(event) {
			mouseX = event.clientX;
			mouseY = event.clientY;
		});
		
		$(".wpgmza-map").sortable({
			handle: ".wpgmza-layout-handle",
			items: "[data-wpgmza-layout-element]",
			start: function(event, ui) {
				$("#wpgmza-map-container").addClass("wpgmza-layout-dragging");
			},
			stop: function(event, ui) {
				var el = document.elementFromPoint(mouseX, mouseY);
				
				function removeStyle(elem, name)
				{
					if (elem.style.removeProperty)
						elem.style.removeProperty(name);
					else
						elem.style.removeAttribute(name);
				}
				
				removeStyle(ui.item[0], "position");
				removeStyle(ui.item[0], "left");
				removeStyle(ui.item[0], "top");
				
				$("#wpgmza-map-container").removeClass("wpgmza-layout-dragging");
				
				if(!$(el).hasClass("wpgmza-cell") || $(el).attr("data-grid-postiion") == "center")
					return;
				
				if($(el).children().length)
					return;
				
				if($.contains(ui.item[0], el))
					return;
				
				$(el).append(ui.item);
			}
		});*/
		
		var mouseX, mouseY;
		
		$(document).on("mousemove", function(event) {
			mouseX = event.clientX;
			mouseY = event.clientY;
		});
		
		$("#wpgmza-layout-editor").sortable({
			stop: function(event, ui) {
				var el = document.elementFromPoint(mouseX, mouseY);
				
				function removeStyle(elem, name)
				{
					if (elem.style.removeProperty)
						elem.style.removeProperty(name);
					else
						elem.style.removeAttribute(name);
				}
				
				removeStyle(ui.item[0], "position");
				removeStyle(ui.item[0], "left");
				removeStyle(ui.item[0], "top");
				
				if(!$(el).hasClass("wpgmza-cell") || $(el).attr("data-grid-postiion") == "center")
					return;
				
				if($(el).children().length)
					return;
				
				if($.contains(ui.item[0], el))
					return;
				
				$(el).append(ui.item);
			}
		});
		
		this.setLayout();
		
		// When the user presses enter in the address input, 
		$('form.wpgmza').on('keydown', function( e ){
			if (e.keyCode == 13 && $(e.target).attr('name') == 'address') {
				
				if(!self.editMapObjectTarget || self.editMapObjectTarget.id == -1)
					$("#add-marker").click();
				else
					$("#update-marker").click();
				
				return false;
		    }	
		});
		
		// Live latitude / longitude edit
		$("input[name='lat'], input[name='lng']").on("input", function(event) {
			
			if(!(self.editMapObjectTarget instanceof WPGMZA.Marker))
				return;
			
			var marker = self.editMapObjectTarget;
			
			marker.setPosition({
				lat: $("input[name='lat']").val(),
				lng: $("input[name='lng']").val()
			});
			
			$("input[name='dragged']").prop("checked", true);
			
		});
		
		// Hide preloader
		$("#wpgmza-map-edit-page>.wpgmza-preloader").remove();
		$("form.wpgmza").show();
	}
	
	WPGMZA.MapEditPage.getConstructor = function()
	{
		var pro = WPGMZA.isProVersion();
		
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return (pro ? WPGMZA.GoogleProMapEditPage : WPGMZA.GoogleMapEditPage);
				break;
			
			default:
				return (pro ? WPGMZA.OSMProMapEditPage : WPGMZA.OSMMapEditPage);
				break;
		}
	}
	
	WPGMZA.MapEditPage.createInstance = function()
	{
		var constructor = WPGMZA.MapEditPage.getConstructor();
		return new constructor();
	}
	
	/**
	 * Gets the name of an input without it's prefix
	 * @return string
	 */
	WPGMZA.MapEditPage.prototype.getInputNameWithoutPrefix = function(name)
	{
		return name.replace(/^(polygon|polyline|heatmap)?-/, "");
	}
	
	/**
	 * Gets the value of a field
	 * @return mixed
	 */
	WPGMZA.MapEditPage.prototype.getFieldValue = function(input)
	{
		var type = input.type.toLowerCase();
		var value;
		
		switch(type)
		{
			case "checkbox":
			case "radio":
				value = $(input).prop("checked");
				break;
			
			default:
				value = $(input).val();
				break;
		}
		
		return value;
	}

	/**
	 * Puts the value of the input into the settings or directly on to the specified map object
	 * Removes the inputs prefix if it has one, and correctly gets the value of select elements
	 * @return string the value
	 */
	WPGMZA.MapEditPage.prototype.inputValueToMapObjectProperty = function(input, mapObject)
	{
		var name = this.getInputNameWithoutPrefix(input.name);
		var value = this.getFieldValue(input);
		
		if(mapObject.hasOwnProperty(name))
			mapObject[name] = value;
		else
			mapObject.settings[name] = value;
		
		return value;
	}
	
	/**
	 * Returns an instance of the vertex context menu
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.createVertexContextMenuInstance = function()
	{
		
	}
	
	/**
	 * Returns the index of the tab with specified ID, used to switch tabs programatically
	 * @return int|null
	 */
	WPGMZA.MapEditPage.prototype.getTabIndexByID = function(id)
	{
		var result = null;
		$("#map-edit-tabs .ui-tabs-nav a").each(function(index, el) {
			if($(el).attr("href") == "#" + id)
			{
				result = index;
				return false;
			}
		});
		return result;
	}
	
	// Marker Functions ///////////////////////
	WPGMZA.MapEditPage.prototype.enableMarkerButtons = function(enable)
	{
		$("#marker-buttons>button").prop("disabled", !enable);
	}
	
	/**
	 * Creates a marker at the specified coordinates, and puts the data from the markers tab into it
	 * @return WPGMZA.Marker
	 */
	WPGMZA.MapEditPage.prototype.createOrUpdateMarker = function(latLng, preventRefreshControls)
	{
		var self = this;
		var marker;
		
		if(this.editMapObjectTarget && !(this.editMapObjectTarget instanceof WPGMZA.Marker))
			finishEditingMapObject();
		
		if(!this.editMapObjectTarget)
			marker = WPGMZA.Marker.createInstance();
		else
			marker = this.editMapObjectTarget;
		
		$("#markers").find("input[name], select[name], textarea[name]").each(function(index, el) {
			self.inputValueToMapObjectProperty(el, marker);
		});
		
		marker.setPosition(latLng);
		marker.setAnimation(marker.settings.animation);
		
		if(!marker.map)
			this.map.addMarker(marker);
		
		$("input[name='address']").val("");
		this.enableMarkerButtons(true);
		
		this.rightClickCursor.setVisible(false);
		
		marker.modified = true;
		this.bindUnloadListener();
		
		/*if(!preventRefreshControls)
			this.editMarker(marker);
		else*/
			this.map.panTo(latLng);
		
		// The pro add-on needs to add data before doing AJAX submit
		if(!WPGMZA.isProVersion())
			this.doAJAXSubmit();
		
		return marker;
	}
	
	/**
	 * Clears all fields in the marker tab
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.clearMarkerFields = function()
	{
		$("#markers").find("input[name], textarea[name], select[name]").each(function(index, el) {
			switch(String($(el).attr("type")).toLowerCase())
			{
				case "radio":
				case "checkbox":
					var checked = false;
					
					if($(el).attr("name") == "approved")
						checked = true;
					
					$(el).prop("checked", checked);				
					break;
				
				default:
					if($(el).prop("tagName").toLowerCase() == "select")
						$(el).val(
							$(el).find("option:first-child").val()
						);
					else
						$(el).val("");
					break;
			}
		});
	}
	
	/**
	 * Call this WPGMZA.MapEditPage.prototype.to = function begin editing the specified marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.editMarker = function(marker)
	{
		// Select the marker tab
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: 0
		});
		
		if(!marker)
			return;
		
		// Set edit marker target
		this.editMapObjectTarget = marker;
		
		// Center on the marker
		this.map.panTo(marker.getPosition());
		
		marker.setDraggable(true);
		
		// Fill the form with markers data
		$("#markers").find("input, select, textarea").each(function(index, el) {
			if($(el).parents(".wp-editor-wrap").length)
				return;
			
			var name = $(el).attr("name"), val;
			if(marker.hasOwnProperty(name))
				val = marker[name];
			else
				val = marker.settings[name];
			
			switch(String($(el).attr("type")).toLowerCase())
			{
				case "checkbox":
				case "radio":
					$(el).prop("checked", val);
					break;
				
				default:
					$(el).val(val);
					break;
			}
			
			if((!val || typeof val == "string" && val.length == 0) && 
				el.nodeName.match(/select/i))
				$(el).find("option:first-child").prop("selected", true);
		});
		
		// Set the form to update (not add)
		$("#markers").removeClass("add-marker").addClass("update-marker");
	}
	
	/**
	 * Deletes a marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.deleteMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument is not a marker");
		
		if(marker.map != this.map)
			throw new Error("Wrong map");
		
		this.deleteIDs.markers.push(marker.id);
		this.map.deleteMarker(marker);
	}
	
	/**
	 * Called when user deletes a marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.deleteMarkerByID = function(id)
	{
		this.deleteIDs.markers.push(id);
		this.map.deleteMarkerByID(id);
	}
	
	/**
	 * Called when the user clicks delete marker in the markers tab
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onDeleteMarker = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Marker))
			return;
		
		this.deleteMarkerByID(this.editMapObjectTarget.id);
		this.finishEditingMapObject();
		this.markerTable.refresh();
		this.bindUnloadListener();
	}
	
	/**
	 * Called when the user right clicks on the map
	 * NB: Some of this code might have to be moved to the Map object to 
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onRightClickMap = function(event)
	{
		// Switch to the marker tab
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("markers")
		});
		
		// Put lat/lng into the address box
		var value = (event.latLng.lat + ", " + event.latLng.lng).replace(/[() ]/g, "");
		$("input[name='address']").val(value);
		
		// Set the position of the right click marker
		this.rightClickCursor.setPosition(event.latLng);
		this.rightClickCursor.setVisible(true);
	}
	
	/**
	 * Called when the user clicks add marker or save marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onSaveMarker = function(event)
	{
		var self = this;
		var address = $("form.wpgmza input[name='address']").val();
		var marker = this.editMapObjectTarget;
		
		if(!address.length)
		{
			alert(WPGMZA.localized_strings.no_address_entered);
			return;
		}
		
		$("#geocoder-error").hide();
		
		if(!marker || !marker.settings.dragged)
		{
			var geocoder = WPGMZA.Geocoder.createInstance();
			this.enableMarkerButtons(false);
			
			geocoder.getLatLngFromAddress({address: address}, function(latLng) {
				if(!latLng)
				{
					alert(WPGMZA.localized_strings.geocode_failed);
					return;
				}
				
				self.onGeocoderResponse(latLng);
			});
		}
		else
			self.onGeocoderResponse(marker.getPosition());
	}
	
	/**
	 * Called when the geocoder returns a response from save / add marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onGeocoderResponse = function(latLng)
	{
		this.enableMarkerButtons(true);
		
		if(latLng == null)
		{
			$("#geocoder-error").show();
			$("input[name='address']").focus().select();
			return;
		}
		
		this.createOrUpdateMarker(latLng);
	}
	
	
	/**
	 * Callback for when a WPGMZA marker is added
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onMarkerAdded = function(event)
	{
		// TODO: Unbind on remove
		var self = this;
		event.marker.addEventListener("click", function(event) {
			self.onMarkerClicked(event);
		});
	}
	
	/**
	 * Callback for when a WPGMZA marker is removed
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onMarkerRemoved = function(event)
	{
		event.marker.removeEventListener("click", function(event) {
			onMarkerClicked(event);
		});
	}
	
	/**
	 * Called when the user clicks on the map
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onMarkerClicked = function(event) 
	{
		this.editMarker(event.target);
	}
	
	// Polygon Functions //////////////////////
	 
	/**
	 * Utility WPGMZA.MapEditPage.prototype.to = function get polygon fields without the polygon- prefix
	 * @return object
	 */
	WPGMZA.MapEditPage.prototype.getPolygonFields = function()
	{
		var fields = {};
		
		$("#polygons").find("input, select, textarea").each(function(index, el) {
			var name = $(el).attr("name");
			
			if(!name)
				return;
			
			name = name.replace(/^polygon-/, "");
			fields[name] = $(el).val();
		});
		
		return fields;
	}
	
	/**
	 * Start editing the specified polygon
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.editPolygon = function(polygon)
	{
		var self = this;
		
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("polygons")
		});
		
		$("#polygons .wpgmza-admin-form-hideable").removeClass("wpgmza-admin-form-hidden");
		
		if(!polygon)
			return;

		this.editMapObjectTarget = polygon;
		
		// TODO: Fit polygon bounds?
		polygon.setEditable(true);
		
		$("input[name='polygon-name']").val(polygon.name);
		
		$("#polygons input").each(function(index, el) {
			if($(el).prop("disabled"))
				return;
			
			if(!$(el).attr("name"))
				return;
			
			var name = self.getInputNameWithoutPrefix(el.name);
			var value = self.getFieldValue(el);
			
			if(name in polygon)
				$(el).val(polygon[name]);
			else
				$(el).val(polygon.settings[name]);
		});
		
		$("#polygons").removeClass("add-polygon").addClass("update-polygon");
	}
	
	/**
	 * Called when user clicks draw polygon or clicks on a polygon
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onDrawPolygon = function(event)
	{
		var fields = this.getPolygonFields();
		
		$("#polygons .wpgmza-admin-form-hideable").removeClass("wpgmza-admin-form-hidden");
		
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_POLYGON);
		this.drawingManager.setOptions(fields);
	}
	
	/**
	 * Called when the user closes a polygon when drawing
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onPolygonClosed = function(event)
	{
		var fields = this.getPolygonFields();
		var polygon = WPGMZA.Polygon.createInstance({settings: fields}, event.enginePolygon);
		
		polygon.modified = true;
		this.bindUnloadListener();
		
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.map.addPolygon(polygon);

		this.editPolygon(polygon);
	}
	
	/**
	 * Called when the user clicks finish editing polygon, or clicks off the polygon tab
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onFinishEditingPolygon = function(event)
	{
		this.finishEditingMapObject();
	}
	
	/**
	 * Called when the user clicks delete polygon
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onDeletePolygon = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polygon))
			return;
		
		var id = this.editMapObjectTarget.id;
		
		this.deleteIDs.polygons.push(id);
		this.map.deletePolygon(this.editMapObjectTarget);
		this.finishEditingMapObject();
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonModified = function(vertex)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polygon))
			return;
		
		this.editMapObjectTarget.modified = true;
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonAdded = function(event)
	{
		// TODO: Unbind on remove
		var self = this;
		var polygon = event.polygon;
		
		polygon.addEventListener("click", function(event) {
			self.onPolygonClicked(event);
		});
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonRemoved = function(event)
	{
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonClicked = function(event)
	{
		this.editPolygon(event.target);
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polygon))
			return;
		
		return this.inputValueToMapObjectProperty(event.target, this.editMapObjectTarget);
	}
	
	// Polyline Functions /////////////////////
	WPGMZA.MapEditPage.prototype.getPolylineFields = function()
	{
		var fields = {};
		
		$("#polylines").find("input, select, textarea").each(function(index, el) {
			var name = $(el).attr("name");
			
			if(!name)
				return;
			
			name = name.replace(/^polyline-/, "");
			fields[name] = $(el).val();
		});
		
		return fields;
	}
	
	WPGMZA.MapEditPage.prototype.editPolyline = function(polyline)
	{
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("polylines")
		});
		
		$("#polylines .wpgmza-admin-form-hideable").removeClass("wpgmza-admin-form-hidden");
		
		if(!polyline)
			return;
		
		this.editMapObjectTarget = polyline;
		
		// TODO: Fit polyline bounds?
		polyline.setEditable(true);
		
		$("#polylines input").each(function(index, el) {
			if($(el).prop("disabled"))
				return;
			
			if(!$(el).attr("name"))
				return;
			
			var nameWithoutPrefix = $(el).attr("name").replace(/^polyline-/, "");
			$(el).val(polyline.settings[nameWithoutPrefix]);
		});
		
		$("input[name='polyline-title']").val(polyline.title);
		
		$("#polylines").removeClass("add-polyline").addClass("update-polyline");
	}
	
	WPGMZA.MapEditPage.prototype.onDrawPolyline = function(event)
	{
		var fields = this.getPolylineFields();
		
		$("#polylines .wpgmza-admin-form-hideable").removeClass("wpgmza-admin-form-hidden");
		
		this.drawingManager.setOptions(fields);
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_POLYLINE);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineComplete = function(event)
	{
		var fields = this.getPolylineFields();
		var polyline = WPGMZA.Polyline.createInstance({settings: fields}, event.enginePolyline);
		
		polyline.modified = true;
		this.bindUnloadListener();
		
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.map.addPolyline(polyline);
		
		this.editPolyline(polyline);
	}
	
	WPGMZA.MapEditPage.prototype.onFinishEditingPolyline = function(event)
	{
		this.finishEditingMapObject();
	}
	
	WPGMZA.MapEditPage.prototype.onDeletePolyline = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polyline))
			return;
		
		var id = this.editMapObjectTarget.id;
		
		this.deleteIDs.polylines.push(id);
		this.map.deletePolyline(this.editMapObjectTarget);
		this.finishEditingMapObject();
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polyline))
			return;
		
		return this.inputValueToMapObjectProperty(event.target, this.editMapObjectTarget);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineModified = function(vertex)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polyline))
			return;
		
		this.editMapObjectTarget.modified = true;
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineAdded = function(event)
	{
		var self = this;
		var polyline = event.polyline;
		
		polyline.addEventListener("click", function(event) {
			self.onPolylineClicked(event);
		});
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineRemoved = function(event)
	{
		polyline.removeEventListener("click", onPolylineClicked);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineClicked = function(event)
	{
		if(WPGMZA.settings.engine == "google-maps" && event.target.getPoints().length > 1000)
		{
			this.warningPolyline = event.target;
			$("#wpgmza-big-polyline-dialog").remodal().open();
			return;
		}
		
		this.editPolyline(event.target);
	}
	
	// General Functions //////////////////////
	/**
	 * Updates the page based on form controls, display warnings, change distance units, etc.
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onFormChanged = function()
	{
		$("form.wpgmza .height-warning").css({
			display: ($("form.wpgmza select[name='height_units']>option:selected").val() == '%' ? 'inline-block' : 'none')
		});
	}
	
	/**
	 * Called when the map bounds change
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onBoundsChanged = function(event)
	{
		var latLng = this.map.getCenter();
		var zoom = this.map.getZoom();
		
		$("input[name='start_location']").val(latLng.lat + ", " + latLng.lng);
		$("input[name='start_zoom']").val(zoom);
		
		$("#zoom-level-slider").slider("value", zoom);
		
		this.bindUnloadListener();
	}

	WPGMZA.MapEditPage.prototype.onBeforeUnload = function(event)
	{
		var confirmationMessage = "Are you sure you want to leave without saving your changes?";
		
		event.preventDefault();
		event.returnValue = confirmationMessage;
		
		return confirmationMessage;
	}
	
	WPGMZA.MapEditPage.prototype.bindUnloadListener = function(event)
	{
		if(this.initialBoundsChanged)
		{
			// Don't bind the unload listener on the first boundchanged event, it fires when the map initializes
			this.initialBoundsChanged = false;
			return;
		}
		
		if(this.unloadListenerBound)
			return;
		
		window.addEventListener("beforeunload", this.onBeforeUnload);
		
		this.unloadListenerBound = true;
	}
	
	WPGMZA.MapEditPage.prototype.applyThemeData = function()
	{
		
	}
	
	WPGMZA.MapEditPage.prototype.showMapInstructions = function(type)
	{
		$(".wpgmza-engine-map *[id$='instructions']").hide();
		$("#" + type + "-instructions").show();
	}
	
	WPGMZA.MapEditPage.prototype.onMapPanelTabActivated = function(event, ui)
	{
		// Show/hide the relevant instructions
		var singular = ui.newPanel.attr("id").replace(/s$/, "");
		this.showMapInstructions(singular);
		
		// Remember this tab
		var target = event.target;
		if(window.sessionStorage)
			sessionStorage.setItem(target.id, $(target).tabs("option", "active"));
	}
	
	// Map object list functions //////////////
	
	/**
	 * Loads the marker, polygon and polyline admin tables
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.loadMapObjectTables = function()
	{
		// Marker table
		this.markerTable = new WPGMZA.AdminTable($("#marker-table-container .wpgmza-datatable[data-object-type='markers']")[0]);
		this.polygonTable = new WPGMZA.AdminTable($(".wpgmza-datatable[data-object-type='polygons']")[0]);
		this.polylineTable = new WPGMZA.AdminTable($(".wpgmza-datatable[data-object-type='polylines']")[0]);
	}
	
	// Marker list functions //////////////////
	
	/**
	 * Called when the user clicks to edit a marker in the marker table
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onTableRowEditMarker = function(event)
	{
		var td = $(event.target).closest("td");
		var id = td.attr("data-marker-id");
		
		var latLng = {
			lat: parseFloat(td.attr("data-lat")),
			lng: parseFloat(td.attr("data-lng"))
		};
		
		var marker;
		if(marker = this.map.getMarkerByID(id))
			this.editMarker(marker);	// Marker loaded, go straight to editing it
		else
			this.onFetchEditMarkerID = id; // Marker not loaded, remember to edit it once fetch completes
		
		this.map.panTo(latLng);
	}
	
	WPGMZA.MapEditPage.prototype.onMapFetchSuccess = function(event)
	{
		if(!this.onFetchEditMarkerID)
			return;
		
		this.editMarker(this.map.getMarkerByID(this.onFetchEditMarkerID));
		
		this.onFetchEditMarkerID = null;
	}
	
	/**
	 * Delete a polygon by ID and remember the ID
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.deletePolygonByID = function(id)
	{
		this.deleteIDs.polygons.push(id);
		this.map.deletePolygonByID(id);
	}
	
	/**
	 * Delete a polyline by ID and remember the ID
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.deletePolylineByID = function(id)
	{
		this.deleteIDs.polylines.push(id);
		this.map.deletePolylineByID(id);
	}
	
	// General functions //////////////////////
	
	WPGMZA.MapEditPage.prototype.onZoomLimitsChanged = function(event, ui)
	{
		var min = ui.values[0];
		var max = ui.values[1];
		
		$("input[name='min_zoom']").val(min);
		$("input[name='max_zoom']").val(max);
		
		this.map.setMinZoom(min);
		this.map.setMaxZoom(max);
	}
	
	/**
	 * This function returns an array of the editing functions, used by finishEditingMapObject to avoid infinite recursion
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.getEditFunctionNames = function()
	{
		return [
			"editMarker",
			"editPolygon",
			"editPolyline"
		];
	}
	
	/**
	 * This function will cancel any editing taking place, useful when switching tabs, pressing ESC, etc.
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.finishEditingMapObject = function()
	{
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		
		if(!this.editMapObjectTarget)
			return;
		
		if(this.editMapObjectTarget instanceof WPGMZA.Marker)
			this.editMapObjectTarget.setDraggable(false);
		
		this.doAJAXSubmit();
		
		this.clearMarkerFields();
		$("#markers").removeClass("update-marker").addClass("add-marker");
		
		$("#polygons input:not([type])").val("");
		$("#polygons").removeClass("update-polygon").addClass("add-polygon");
		
		$("input[name='polyline-title']").val("");
		$("#polylines").removeClass("update-polyline").addClass("add-polyline");
		
		if(this.editMapObjectTarget.setEditable)
			this.editMapObjectTarget.setEditable(false);
		this.editMapObjectTarget = null;
	}
	
	
	/**
	 * Called when the user changes the general layout
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onGeneralLayoutChanged = function(event)
	{
		var self = this;
		var layout = $(event.target).val();
		
		// Remove old layout classes
		$("select[name='general_layout']>option").each(function(index, el) {
			$(self.map.element).removeClass($(el).val());
		});
		
		// Add new layout class
		$(self.map.element).addClass(layout);
		
		switch(layout)
		{
			case "wpgmza-compact":
				var layout = this.map.getLayout();
				var index;
				
				if((index = layout.order.indexOf("marker-listing")) != -1)
					layout.order.splice(index, 1);
				
				for(var position in layout.grid)
					if(layout.grid[position] == "marker-listing")
						delete layout.grid[position];
				
				layout.grid["center-right"] = "marker-listing";
				
				this.map.setLayout(layout);
				
				break;
		}
	};
	
	/**
	 * Gets all map object data as JSON to be submitted
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.getMapObjectData = function()
	{
		// Map Objects
		var data = {
			markers: [],
			polygons: [],
			polylines: [],
			deleteIDs: this.deleteIDs
		};
		
		for(var i = 0; i < this.map.markers.length; i++)
			if(this.map.markers[i].modified)
				data.markers.push(this.map.markers[i].toJSON());
		
		for(i = 0; i < this.map.polygons.length; i++)
			if(this.map.polygons[i].modified)
				data.polygons.push(this.map.polygons[i].toJSON());
			
		for(i = 0; i < this.map.polylines.length; i++)
			if(this.map.polylines[i].modified)
				data.polylines.push(this.map.polylines[i].toJSON());
		
		return data;
	}
	
	/**
	 * Get the layout from the layout panel
	 * @return object
	 */
	WPGMZA.MapEditPage.prototype.getLayout = function()
	{
		var elements = $("#wpgmza-layout-editor").find("[data-wpgmza-layout-element]");
		var data = {
			order: [],
			grid: {}
		};
		
		for(var i = 0; i < elements.length; i++)
		{
			var grid = $(elements[i]).closest(".wpgmza-in-map-grid");
			var name = $(elements[i]).attr("data-wpgmza-layout-element");
			
			if(grid.length)
				data.grid[ $(elements[i]).closest(".wpgmza-cell").attr("data-grid-position") ] = name;
			else
				data.order.push(name);
		}
		
		return data;
	}
	
	/**
	 * Sets the layout in the layout panel
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.setLayout = function()
	{
		if(!this.map.settings.layout)
			return;
		
		this.map.setLayout(JSON.parse(this.map.settings.layout), $("#wpgmza-layout-editor"));
	}
	
	WPGMZA.MapEditPage.prototype.doAJAXSubmit = function()
	{
		var self = this;
		var data = this.getMapObjectData();
		
		$("#map-edit-tabs *:input").prop("disabled", true);
		
		$.ajax({
			method: "POST",
			url: WPGMZA.ajaxurl,
			data: {
				"action":		"wpgmza_ajax_submit",
				"map_id":		this.map.id,
				"map-objects":	JSON.stringify(data)
			},
			success: function(response)
			{
				for(var guid in response.newIDsByGUID)
				{
					var object = self.map.getObjectByGUID(guid);
					object.id = parseInt(response.newIDsByGUID[guid]);
					object.modified = false;
				}
				
				self.finishEditingMapObject();
			},
			error: function(xhr, textStatus, errorThrown)
			{
				if(WPGMZA.isDeveloperMode())
					throw new Error(xhr.responseText);
				else
					alert(xhr.responseText);
			},
			complete: function()
			{
				$("#map-edit-tabs *:input").prop("disabled", false);
			}
		});
	}
	
	/**
	 * Called when the form submits. This WPGMZA.MapEditPage.prototype puts all the markers, 
	 * polygons and polylines in an array to be sent along with the rest 
	 * of the from data. Any deleted markers, polygons and polylines are 
	 * sent in deleteIDs
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onSubmit = function(event)
	{
		// Get the map object data
		var data = this.getMapObjectData();
		
		var input = $("<input name='map-objects' type='hidden'/>");
		input.val(JSON.stringify(data));
		$("form.wpgmza").append(input);
		
		// Send layout
		var layout = $("<input name='layout' type='hidden'/>");
		layout.val(JSON.stringify(this.getLayout()));
		$("form.wpgmza").append(layout);
		
		// Disable marker, polygon, polyline and heatmap inputs so they don't get sent to the server, they conflict with other inputs
		$("form.wpgmza .no-submit *:input").prop("disabled", true);
		
		// Unbind the beforeunload listener
		window.removeEventListener("beforeunload", this.onBeforeUnload);
	}
	
	$(document).ready(function() {

		if(WPGMZA.current_page != "map-edit")
			return;
	
		WPGMZA.runCatchableTask(function() {
			
			WPGMZA.mapEditPage = WPGMZA.MapEditPage.createInstance();
			
			// Fire the event here, not in the constructor, so that the Pro constructor can finish running
			WPGMZA.events.dispatchEvent("mapeditpageready");
			
		}, $("form.wpgmza"));
		
	});
	
})(jQuery);

// js/v8/marker-filter.js
/**
 * @namespace WPGMZA
 * @module MarkerFilter
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.MarkerFilter = function(options)
	{
		this.functionChain = [
			this.isMarkerAllowedByRadius,
			this.isMarkerAllowedByString
		];
		
		this.hideAll = null;
		
		this.center = null;
		this.radius = null;
		
		this.categories = null;
		
		this.string = null;
		
		this.logic = (WPGMZA.settings.cat_logic == 1 ? WPGMZA.MarkerFilter.LOGIC_AND : WPGMZA.MarkerFilter.LOGIC_OR);
		
		this.units = WPGMZA.MarkerFilter.UNITS_KILOMETERS;
		
		for(var name in options)
			this[name] = options[name];
	}
	
	WPGMZA.MarkerFilter.LOGIC_OR	= "or";
	WPGMZA.MarkerFilter.LOGIC_AND	= "and";
	
	WPGMZA.MarkerFilter.getConstructor = function()
	{
		if(WPGMZA.isProVersion())
			return WPGMZA.ProMarkerFilter;
		return WPGMZA.MarkerFilter;
	}
	
	WPGMZA.MarkerFilter.createInstance = function(options)
	{
		var constructor = WPGMZA.MarkerFilter.getConstructor();
		return new constructor(options);
	}
	
	// /**
	 // * Gets the current radius in meters
	 // * @return number
	 // */
	// WPGMZA.MarkerFilter.prototype.getRadiusInMeters = function()
	// {
		// // TODO: Check this uses the correct units
		// return this.radius * 1000;
	// }
	
	// /**
	 // * Gets the current radius in KM
	 // * @return number
	 // */
	// WPGMZA.MarkerFilter.prototype.getRadiusInKm = function()
	// {
		// return this.getRadiusInMeters() / 1000;
	// }
	
	// /**
	 // * Gets the current radius in miles
	 // * @return number
	 // */
	// WPGMZA.MarkerFilter.prototype.getRadiusInMiles = function()
	// {
		// return this.getRadiusInKm() * milesPerKm;
	// }
	
	/**
	 * Filters marker based on radius
	 * @return void
	 */
	WPGMZA.MarkerFilter.prototype.isMarkerAllowedByRadius = function(marker)
	{
		if(!this.radius)
			return true;	// Not filtering by radius
		
		if(!this.center)
			throw new Error("You must supply a center to filter by radius");
		
		var position = marker.getPosition();
		
		var distance = WPGMZA.Map.getGeographicDistance(
			position.lat,
			position.lng,
			this.center.lat,
			this.center.lng
		);
		
		var maximum = WPGMZA.Distance.uiToKilometers(this.radius);
		
		return (distance <= maximum);
	}
	
	/**
	 * If string search is disabled, or the marker contains the specified keyword, this function returns true
	 * @return boolean
	 */
	WPGMZA.MarkerFilter.prototype.isMarkerAllowedByString = function(marker)
	{
		if(this.string == null || this.string.length == 0)
			return true;	// Not filtering on string
		
		return this.cachedSearchRegex.test(marker.title);
	}
	
	/**
	 * Iterates through the function chain to determine if marker is allowed by filter
	 * @return boolean
	 */
	WPGMZA.MarkerFilter.prototype.isMarkerAllowed = function(marker)
	{
		if(this.hideAll)
			return false;
		
		for(var i = 0; i < this.functionChain.length; i++)
		{
			if(!this.functionChain[i].call(this, marker))
				return false;
		}
		
		return true;
	}
	
	/**
	 * Takes an array of markers and returns an array 
	 * of markers allowed by this filter
	 * @return array The filtered markers
	 */
	WPGMZA.MarkerFilter.prototype.apply = function(markers)
	{
		var result = [];
		
		this.map(markers, function(marker, allowed) {
			if(allowed)
				result.push(marker);
		});
		
		return result;
	}
	
	/**
	 * Takes an array of markers and filters them, executing
	 * the given callback on each marker
	 * @return void
	 */
	WPGMZA.MarkerFilter.prototype.map = function(markers, callback)
	{
		this.prepare();
		
		for(var i = 0; i < markers.length; i++)
			callback(markers[i], this.isMarkerAllowed(markers[i]));
	}
	
	WPGMZA.MarkerFilter.prototype.prepare = function()
	{
		this.categoryLookup = null;

		this.cachedSearchRegex = null;
		if(this.string && this.string.length > 0)
			this.cachedSearchRegex = new RegExp(this.string, "i");
	}
	
})(jQuery);

// js/v8/marker.js
/**
 * @namespace WPGMZA
 * @module Marker
 * @requires WPGMZA
 */
(function($) {
	/**
	 * Constructor
	 * @param json to load (optional)
	 */
	WPGMZA.Marker = function(row)
	{
		var self = this;
		
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
		
		WPGMZA.MapObject.apply(this, arguments);
		
		if(row && row.heatmap)
			return; // Don't listen for these events on heatmap markers.
		
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
	 * Gets the constructor. You can use this instead of hard coding the parent class when inheriting,
	 * which is helpful for making subclasses that work with Basic only, Pro, Google, OSM or a 
	 * combination of the four.
	 * @return function
	 */
	WPGMZA.Marker.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProMarker;
				return WPGMZA.GoogleMarker;
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.OSMProMarker;
				return WPGMZA.OSMMarker;
				break;
		}
	}
	
	WPGMZA.Marker.createInstance = function(row)
	{
		var constructor = WPGMZA.Marker.getConstructor();
		return new constructor(row);
	}
	
	WPGMZA.Marker.ANIMATION_NONE			= "0";
	WPGMZA.Marker.ANIMATION_BOUNCE			= "1";
	WPGMZA.Marker.ANIMATION_DROP			= "2";
	
	WPGMZA.Marker.prototype.onAdded = function(event)
	{
		var self = this;
		
		this.infoWindow = WPGMZA.InfoWindow.createInstance(this);
		
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
	}
	
	/**
	 * This function will hide the last info the user interacted with
	 * @return void
	 */
	WPGMZA.Marker.prototype.hidePreviousInteractedInfoWindow = function()
	{
		if(!this.map.lastInteractedMarker)
			return;
		
		this.map.lastInteractedMarker.infoWindow.close();
	}
	
	WPGMZA.Marker.prototype.openInfoWindow = function()
	{
		this.hidePreviousInteractedInfoWindow();
		
		this.infoWindow.open(this.map, this);
		this.map.lastInteractedMarker = this;
	}
	
	WPGMZA.Marker.prototype.onClick = function(event)
	{
		
	}
	
	WPGMZA.Marker.prototype.onSelect = function(event)
	{
		this.openInfoWindow();
	}
	
	WPGMZA.Marker.prototype.onMouseOver = function(event)
	{
		if(this.map.settings.info_window_open_by == WPGMZA.InfoWindow.OPEN_BY_HOVER)
			this.openInfoWindow();
	}
	
	WPGMZA.Marker.prototype.getIcon = function()
	{
		return WPGMZA.settings.default_marker_icon;
	}
	
	/**
	 * Gets the position of the marker
	 * @return object
	 */
	WPGMZA.Marker.prototype.getPosition = function()
	{
		return {
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		};
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
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
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.Marker.prototype.getAnimation = function(animation)
	{
		return this.settings.animation;
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.Marker.prototype.setAnimation = function(animation)
	{
		this.settings.animation = animation;
	}
	
	/**
	 * Get the marker visibility
	 * @return void
	 */
	WPGMZA.Marker.prototype.getVisible = function(visible)
	{
		
	}
	
	/**
	 * Set the marker visibility. This is used by the store locator etc. and is not a setting
	 * @return void
	 */
	WPGMZA.Marker.prototype.setVisible = function(visible)
	{
		if(!visible && this.infoWindow)
			this.infoWindow.close();
	}
	
	WPGMZA.Marker.prototype.setMap = function(map)
	{
		if(!map)
		{
			if(this.map)
				this.map.removeMarker(this);
			
			return;
		}
		
		map.addMarker(this);
	}
	
	WPGMZA.Marker.prototype.getDraggable = function()
	{
		
	}
	
	WPGMZA.Marker.prototype.setDraggable = function(draggable)
	{
		
	}
	
	WPGMZA.Marker.prototype.panIntoView = function()
	{
		if(!this.map)
			throw new Error("Marker hasn't been added to a map");
		
		this.map.setCenter(this.getPosition());
	}
	
	/**
	 * Returns the marker as a JSON object
	 * @return object
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
	
	
})(jQuery);

// js/v8/polygon.js
/**
 * @namespace WPGMZA
 * @module Polygon
 * @requires WPGMZA.MapObject
 */
(function($) {
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
	
	WPGMZA.Polygon.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProPolygon;
				return WPGMZA.GooglePolygon;
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.OSMProPolygon;
				return WPGMZA.OSMPolygon;
				break;
		}
	}
	
	WPGMZA.Polygon.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polygon.getConstructor();
		return new constructor(row, engineObject);
	}
	
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
	
})(jQuery);

// js/v8/polyline.js
/**
 * @namespace WPGMZA
 * @module Polyline
 * @requires WPGMZA.MapObject
 */
(function($) {
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polyline");
		
		this.title = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;
	
	WPGMZA.Polyline.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return WPGMZA.GooglePolyline;
				break;
				
			default:
				return WPGMZA.OSMPolyline;
				break;
		}
	}
	
	WPGMZA.Polyline.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polyline.getConstructor();
		return new constructor(row, engineObject);
	}
	
	WPGMZA.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}
	
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}
	
	
})(jQuery);

// js/v8/settings-page.js
/**
 * @namespace WPGMZA
 * @module SettingsPage
 */
(function($) {
	
	var unloadListenerBound = false;
	
	function onBeforeUnload(event)
	{
		var confirmationMessage = "Are you sure you want to leave without saving your changes?";
		
		event.preventDefault();
		event.returnValue = confirmationMessage;
		
		return confirmationMessage;
	}
	
	function bindUnloadListener(event)
	{
		if(unloadListenerBound)
			return;
		
		window.addEventListener("beforeunload", onBeforeUnload);
		
		unloadListenerBound = true;
	}

	$(document).ready(function() {
		var options = {};
		var active = 0;
		var element = $("#wpgmza-settings-tabs");
		
		if(WPGMZA.current_page != "map-settings")
			return;
		
		if(window.sessionStorage)
		{
			active = parseInt(sessionStorage.getItem("wpgmza-settings-tabs"));
			if(isNaN(active))
				active = 0;
		}
		
		options = {
			active: active,
			activate: function(event, ui) {
				if(window.sessionStorage)
					sessionStorage.setItem(
						"wpgmza-settings-tabs", 
						$(event.target).tabs("option", "active")
					);
			}
		};
		
		$(element).tabs(options);
		
		$("input[name='scroll_animation_milliseconds']").on("change", function(event) {
			
			var progress = $("#animation-example");
			var timing = parseInt($(event.target).val());
			
			$("#animation-example-container").show();
			
			$(progress).val(0);
			$(progress).animate({
				value: 100
			}, timing);
			
		});
		
		$("select[name='data_transmission_mode']").on("change", function(event) {
			
			$(".transmission-info").hide();
			$("#" + event.target.value + "-info").show();
			
		}).change();
		
		/*$("a.wpgmza-rollback").on("click", function(event) {
			// TODO: Remove the control in PHP if not migrated / no v6 pro
		});*/
		
		$("form.wpgmza").on("change", bindUnloadListener);
		
		$("form.wpgmza input[type='submit']").on("click", function() {
			var input = $("input[name='info_window_width']");
			var infoWindowWidth = input.val();
			var min = parseInt(input.attr("min"));
			
			if(!infoWindowWidth || infoWindowWidth.length == 0)
				return;
			
			if(parseInt(infoWindowWidth) < min)
			{
				$("a[href='#infowindows']").click();
				WPGMZA.animateScroll(input, 250);
			}
		});
		
		$("form.wpgmza").on("submit", function(event) {
			window.removeEventListener("beforeunload", onBeforeUnload);
		});
	});
})(jQuery);

// js/v8/store-locator.js
/**
 * @namespace WPGMZA
 * @module StoreLocator
 * @requires WPGMZA.EventDispatcher
 */
(function($) {
	var milesPerKm = 0.621371;
	
	/**
	 * Constructor
	 * @param map The map this store locator is attached to
	 */
	WPGMZA.StoreLocator = function(map)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		WPGMZA.assertInstanceOf(this, "StoreLocator");
		
		this.map = this.parent = map;
		this.element = $(map.element).find(".store-locator")[0];
		this.units = WPGMZA.Distance.KILOMETERS;
		this.circle = null;
		this.closestMarker = null;
		this.displayingResult = false;
		
		this.address = $(this.element).find("[name='store_locator_address']");
		this.radius = $(this.element).find("[name='store_locator_radius']");
		this.error = $(this.element).find(".error");
		this.noResults = $(this.element).find(".no-results");
		
		$(this.element).css({
			display: map.settings.store_locator_enabled ? "block" : "none"
		});
		
		this.address.val(
			map.settings.store_locator_default_address
		);
		
		if(map.settings.store_locator_default_radius)
			this.radius.val(
				map.settings.store_locator_default_radius
			);
		
		$(this.element).find(".wpgmza-submit").on("click", function(event) {
			self.onSearch(event);
		});
		
		$(this.element).find(".wpgmza-reset").on("click", function(event) {
			self.onReset(event);
		});
		
		$(this.element).find("input").on("keydown", function(event) {
			if(event.keyCode == 13)
			{
				self.onSearch(event);
				event.preventDefault();
				return false;
			}
		});
		
		this.map.addEventListener("fetchsuccess", function(event) {
			self.filterMarkers();
		});
		
		this.clear();
		
		this.initialized = true;
	}
	
	WPGMZA.StoreLocator.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.StoreLocator.prototype.constructor = WPGMZA.StoreLocator;
	
	WPGMZA.StoreLocator.getConstructor = function()
	{
		if(WPGMZA.isProVersion())
			switch(WPGMZA.settings.engine)
			{
				case "google-maps":
					return WPGMZA.GoogleProStoreLocator;
					break;
					
				default:
					return WPGMZA.OSMProStoreLocator;
					break;
			}

		else
			switch(WPGMZA.settings.engine)
			{
				case "google-maps":
					return WPGMZA.GoogleStoreLocator;
					break;
					
				default:
					return WPGMZA.OSMStoreLocator;
					break;
			}
	}
	
	WPGMZA.StoreLocator.createInstance = function(map)
	{
		var constructor = WPGMZA.StoreLocator.getConstructor();
		return new constructor(map);
	}
	
	/**
	 * Clears the store locator - takes the circle off the map and reverts the last marker to its original animation, and hides the error and no results messages
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.clear = function()
	{
		this.showCircle(false);
		this.showCenterMarker(false);
		
		if(this.closestMarker)
			this.closestMarker.setAnimation(
				this.closestMarker.settings.animation
			);
		this.closestMarker = null;
		
		this.error.hide();
		this.noResults.hide();
		
		this.displayingResult = false;
	}
	
	/**
	 * Gets the marker filter
	 * @return MarkerFilter
	 */
	WPGMZA.StoreLocator.prototype.getMarkerFilter = function()
	{
		var filter = WPGMZA.MarkerFilter.createInstance();
		
		if(this.map.settings.store_locator_hide_before_search && !this.displayingResult)
			filter.hideAll = true;
		
		if(this.displayingResult && this.map.settings.hide_markers_outside_store_locator_radius)
		{
			filter.center = this.centerPoint;
			filter.radius = parseFloat($(this.element).find("[name='store_locator_radius']").val());
		}
		
		if(this.map.settings.store_locator_name_search)
			filter.string = $(this.element).find("[name='store_locator_title_search_term']").val();
		
		return filter;
	}
	
	/**
	 * Filters map markers
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.filterMarkers = function()
	{
		var filter = this.getMarkerFilter();
		
		var event = {
			type: "filtercomplete",
			markers: []
		};
		
		filter.map(this.map.markers, function(marker, allowed) {
			if(allowed)
				event.markers.push(marker);
				
			marker.setVisible(allowed);
		});

		if(this.initialized)
			this.dispatchEvent(event);
	}
	
	/**
	 * Returns the selected radius
	 * @return number
	 */
	WPGMZA.StoreLocator.prototype.getRadius = function()
	{
		return parseFloat(this.radius.val());
	}
	
	/**
	 * Gets the zoom level for the currently set radius
	 * @return number
	 */
	WPGMZA.StoreLocator.prototype.getZoomFromRadius = function()
	{
		// With thanks to Jeff Jason http://jeffjason.com/2011/12/google-maps-radius-to-zoom/
		var r = WPGMZA.Distance.uiToKilometers(this.getRadius());
		return Math.round(14-Math.log(r)/Math.LN2);
	}
	
	/**
	 * Shows the circle at the specified location, or hides it
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.showCircle = function(options)
	{
		
	}
	
	/**
	 * Shows/hides a marker at the center point of the search radius
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.showCenterMarker = function(latLng)
	{
		if(!this.centerMarker)
			this.centerMarker = WPGMZA.Marker.createInstance();
		
		if(latLng)
		{
			this.centerMarker.setPosition(latLng);
			this.centerMarker.setAnimation(WPGMZA.Marker.ANIMATION_BOUNCE);
		}
	}
	
	/**
	 * Triggered when the user presses "search" or presses enter
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onSearch = function(event)
	{
		var self = this;
		var button = $(this.element).find(".wpgmza-submit");
		var restrict = this.map.settings.store_locator_restrict;
		var geocoder = WPGMZA.Geocoder.createInstance();
		
		var addressInput = $(this.element).find("[name='store_locator_address']");
		
		var options = {
			address: addressInput.val() || addressInput.attr("value")
		};
		
		if(restrict && restrict.length)
			options.country = restrict;
			
		this.showCircle(false);
		
		this.clear();
		
		if(!options.address.length)
		{
			alert(WPGMZA.localized_strings.no_address_entered);
			return;
		}
			
		button.prop("disabled", true);
		
		geocoder.getLatLngFromAddress(options, function(latLng) {
			button.prop("disabled", false);
			
			if(!latLng)
			{
				self.onNoResults();
				return;
			}
			
			self.onGeocodeSuccess(latLng);
		});
	}
	
	/**
	 * Called when the geocoder finds the specified address
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onGeocodeSuccess = function(latLng)
	{
		var zoom = this.getZoomFromRadius();
		var marker = this.map.getClosestMarker(latLng);
		
		this.showCircle(latLng);
		
		if(this.map.settings.store_locator_bounce)
			this.showCenterMarker(latLng);
		
		// Add the circle and pan to it
		this.map.setZoom(zoom);
		this.map.panTo(latLng);
		
		this.displayingResult = true;
		this.centerPoint = latLng;
		
		this.filterMarkers();
		
		this.dispatchEvent({type: "geocodesuccess", latLng: latLng});
	}
	
	/**
	 * Called when there are no results
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onNoResults = function()
	{
		this.noResults.show();
	}
	
	/**
	 * Called when the user clicks reset
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onReset = function(event)
	{
		this.clear();
		
		$(this.element).find("input[name='store_locator_address'], input[name='store_locator_title_search_term']").val("");
	}
	
})(jQuery);

// js/v8/tour.js
/**
 * @namespace WPGMZA
 * @module Tour
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.Tour = function()
	{
		var self = this;
		
		if(!window.hopscotch)
			return;
		
		this.tour = {
			id: "wpgmza-tour",
			steps: []
		};
		
		for(var i = 0; i < wpgmza_tour_data.length; i++)
		{
			var item = wpgmza_tour_data[i];
			
			item.target = $(item.target)[0];
			
			if(!item.target)
				continue;
			
			item.zindex = 9999;
			
			this.tour.steps.push(item);
		}
		
		hopscotch.listen("beforeShow", function(event) {
			var step = self.tour.steps[hopscotch.getCurrStepNum()];
			
			if(step.javascript)
				eval(step.javascript);
		});
		
		hopscotch.listen("close", function() {
			window.Cookies.set("wpgmza-tour-taken", true);
		});
		hopscotch.listen("end", function() {
			window.Cookies.set("wpgmza-tour-taken", true);
		});
	}
	
	WPGMZA.Tour.prototype.start = function()
	{
		$("#wpgmza_tabs").tabs({active: 0});
		hopscotch.startTour(this.tour);
	}
	
	$(document).ready(function(event) {
		
		WPGMZA.tour = new WPGMZA.Tour();
		
		//|| (window.Cookies && !window.Cookies.get("wpgmza-tour-taken")))
		
		if(window.location.hash.match(/tour/))
			WPGMZA.tour.start();
			
		$("#take-a-tour a").on("click", function(event) {
			WPGMZA.tour.start();
		});
	});
	
})(jQuery);

// js/v8/vertex-context-menu.js
/**
 * @namespace WPGMZA
 * @module VertexContextMenu
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.VertexContextMenu = function(mapEditPage, items)
	{
		WPGMZA.assertInstanceOf(this, "VertexContextMenu");
		
		this.mapEditPage = mapEditPage;
		
		this.element = document.createElement("div");
		this.element.className = "wpgmza-vertex-context-menu";
		
		for(var i = 0; i < items.length; i++)
		{
			var item = $("<div/>");
			item.html(items[i]);
			$(this.element).append(item);
		}
	}
	
})(jQuery);

// js/v8/google-maps/google-circle.js
/**
 * @namespace WPGMZA
 * @module GoogleCircle
 * @requires WPGMZA.Circle
 */
(function($) {
	
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
			this.googleCircle = new google.maps.Circle(this.settings);
			this.googleCircle.wpgmzaCircle = this;
		}
		
		google.maps.event.addListener(this.googleCircle, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.GoogleCircle.prototype = Object.create(WPGMZA.Circle.prototype);
	WPGMZA.GoogleCircle.prototype.constructor = WPGMZA.GoogleCircle;
	
})(jQuery);

// js/v8/google-maps/google-drawing-manager.js
/**
 * @namespace WPGMZA
 * @module GoogleDrawingManager
 * @requires WPGMZA.DrawingManager
 */
(function($) {
	
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
			}
		});
		
		this.googleDrawingManager.setMap(map.googleMap);
		
		google.maps.event.addListener(this.googleDrawingManager, "markercomplete", function(marker) {
			self.onMarkerPlaced(marker);
		});
		google.maps.event.addListener(this.googleDrawingManager, "polygoncomplete", function(polygon) {
			self.onPolygonClosed(polygon);
		});
		google.maps.event.addListener(this.googleDrawingManager, "polylinecomplete", function(polyline) {
			self.onPolylineComplete(polyline)
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
				googleMode = google.maps.drawing.OverlayType.MARKER;
				break;
			
            case WPGMZA.DrawingManager.MODE_POLYGON:
				googleMode = google.maps.drawing.OverlayType.POLYGON;
				break;
			
		    case WPGMZA.DrawingManager.MODE_POLYLINE:
				googleMode = google.maps.drawing.OverlayType.POLYLINE;
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
	
	WPGMZA.GoogleDrawingManager.prototype.onMarkerPlaced = function(googleMarker)
	{
		var event = new WPGMZA.Event("markerplaced", googleMarker);
		var position = googleMarker.getPosition();
		
		event.engineMarker = googleMarker;
		event.latLng = {
			lat: position.lat(),
			lng: position.lng()
		};
		
		googleMarker.setMap(null);
		
		this.dispatchEvent(event);
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
	
})(jQuery);

// js/v8/google-maps/google-geocoder.js
/**
 * @namespace WPGMZA
 * @module GoogleGeocoder
 * @requires WPGMZA.Geocoder
 */
(function($) {
	
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
				latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				callback(latLng);
			}
			else
				callback(null);
		});
	}
	
})(jQuery);

// js/v8/google-maps/google-info-window.js
/**
 * @namespace WPGMZA
 * @module GoogleInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
(function($) {
	
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
	
	WPGMZA.GoogleInfoWindow.prototype.setGoogleObject = function()
	{
		if(mapObject instanceof WPGMZA.Marker)
			this.googleObject = mapObject.googleMarker;
		else if(mapObject instanceof WPGMZA.Polygon)
			this.googleObject = mapObject.googlePolygon;
		else if(mapObject instanceof WPGMZA.Polyline)
			this.googleObject = mapObject.googlePolyline;
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
		
		this.setGoogleObject();
		
		if(!this.googleInfoWindow)
			this.googleInfoWindow = new google.maps.InfoWindow();
		
		this.googleInfoWindow.open(
			this.mapObject.map.googleMap,
			this.googleObject
		);
		
		this.getContent(function(html) {
			
			// Wrap HTML with unique ID
			var guid = WPGMZA.guid();
			var html = "<div id='" + guid + "'>" + html + "</div>";
			var div, intervalID;
			
			self.googleInfoWindow.setContent(html);
			self.googleInfoWindow.open(
				self.mapObject.map.googleMap,
				self.googleObject
			);
			
			intervalID = setInterval(function(event) {
				
				div = $("#" + guid);
				
				if(div.find(".gm-style-iw").length)
				{
					div[0].wpgmzaMapObject = self.mapObject;
					
					self.dispatchEvent("infowindowopen");
					div.trigger("infowindowopen");
					clearInterval(intervalID);
				}
				
			}, 50);
			
		});
		
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
		this.googleInfoWindow.setContent(html);
	}
	
})(jQuery);

// js/v8/google-maps/google-map-edit-page.js
/**
 * @namespace WPGMZA
 * @module GoogleMapEditPage
 * @requires WPGMZA.MapEditPage
 * @pro-requires WPGMZA.ProMapEditPage
 */
(function($) {
	
	var Parent;
	
	/**
	 * Map edit page for Google maps
	 * @return void
	 */
	WPGMZA.GoogleMapEditPage = function()
	{
		var self = this;
		
		Parent.call(this);
		
		// Set marker image for the right click marker
		this.rightClickCursor.googleMarker.setOptions({
			icon: {
				url: $("[data-right-click-marker-image]").attr("data-right-click-marker-image")
			},
			draggable: true
		});
		
		// Right click marker drag
		google.maps.event.addListener(this.rightClickCursor.googleMarker, "dragend", function(event) {
			var wpgmzaEvent = new WPGMZA.Event({
				type: "dragend",
				latLng: {
					lat: event.latLng.lat(),
					lng: event.latLng.lng()
				}
			});
			self.rightClickCursor.dispatchEvent(wpgmzaEvent);
		});
	}
	
	// Inheritence
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMapEditPage;
	else
		Parent = WPGMZA.MapEditPage;
	
	WPGMZA.GoogleMapEditPage.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleMapEditPage.prototype.constructor = WPGMZA.GoogleMapEditPage;
	
	// Override listeners
	WPGMZA.GoogleMapEditPage.prototype.createVertexContextMenuInstance = function()
	{
		return new WPGMZA.GoogleVertexContextMenu(this);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onRightClickMap = function(event)
	{
		Parent.prototype.onRightClickMap.call(this, event);
		
		this.rightClickCursor.googleMarker.setMap(this.map.googleMap);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.editMarker = function(marker)
	{
		this.rightClickCursor.googleMarker.setMap(null);
		
		Parent.prototype.editMarker.call(this, marker);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolygonAdded = function(event)
	{
		Parent.prototype.onPolygonAdded.call(this, event);
		
		var self = this,
			polygon = event.polygon;
		
		polygon.rightClickListener = google.maps.event.addListener(polygon.googlePolygon, "rightclick", function(e) {
			self.vertexContextMenu.open(self.map.googleMap, polygon.googlePolygon.getPath(), e.vertex);
		});
		
		polygon.googlePolygon.getPaths().forEach(function(path, index) {
			google.maps.event.addListener(path, "insert_at", function(event) {
				self.onPolygonModified(event);
			});
			google.maps.event.addListener(path, "remove_at", function(event) {
				self.onPolygonModified(event);
			})
			google.maps.event.addListener(path, "set_at", function(event) {
				self.onPolygonModified(event);
			});
		});
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolygonRemoved = function(event)
	{
		Parent.prototype.onPolygonRemoved.call(this, event);
		
		google.maps.event.removeListener(event.polygon.rightClickListener);
		delete event.polygon.rightClickListener;
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolygonSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polygon))
			return;
		
		Parent.prototype.onPolygonSettingChanged.call(this, event);
		
		var name = this.getInputNameWithoutPrefix(event.target.name);
		var value = this.getFieldValue(event.target);
		
		// NB: Options have to be passed like this so that the property name is a literal and not a string
		var options = {};
		options[name] = value;
		this.editMapObjectTarget.googlePolygon.setOptions(options);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolylineAdded = function(event)
	{
		Parent.prototype.onPolylineAdded.call(this, event);
		
		var self = this,
			polyline = event.polyline;
		
		polyline.rightClickListener = google.maps.event.addListener(polyline.googlePolyline, "rightclick", function(e) {
			self.vertexContextMenu.open(self.map.googleMap, polyline.googlePolyline.getPath(), e.vertex);
		});
		
		var path = polyline.googlePolyline.getPath();
		google.maps.event.addListener(path, "insert_at", function(event) {
			self.onPolylineModified(event);
		});
		google.maps.event.addListener(path, "remove_at", function(event) {
			self.onPolylineModified(event);
		});
		google.maps.event.addListener(path, "set_at", function(event) {
			self.onPolylineModified(event);
		});
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolylineSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polyline))
			return;
		
		Parent.prototype.onPolylineSettingChanged.call(this, event);
		
		var name = this.getInputNameWithoutPrefix(event.target.name);
		var value = this.getFieldValue(event.target);
		
		// NB: Options have to be passed like this so that the property name is a literal and not a string
		var options = {};
		options[name] = value;
		this.editMapObjectTarget.googlePolyline.setOptions(options);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolylineRemoved = function(event)
	{
		Parent.prototype.onPolylineRemoved.call(this, event);
		
		google.maps.event.removeListener(polyline.rightClickListener);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.applyThemeData = function()
	{
		var str = $("textarea[name='theme_data']").val();
		
		try{
			var json = JSON.parse(str);
		}catch(e) {
			alert(e.message);
			return;
		}
		
		var data = $.extend(json, {name: "Styled Map"});
		var styledMapType = new google.maps.StyledMapType(data);
		this.map.googleMap.mapTypes.set("styled_map", styledMapType);
		this.map.googleMap.setMapTypeId("styled_map");
		
		// Respect points of interest stylers after applying the theme
		this.map.showPointsOfInterest(
			$("input[name='show_points_of_interest]").prop("checked")
		);
	}
	
})(jQuery);

// js/v8/google-maps/google-map.js
/**
 * @namespace WPGMZA
 * @module GoogleMap
 * @requires WPGMZA.Map
 * @pro-requires WPGMZA.ProMap
 */
(function($) {
	var Parent;
	
	/**
	 * Constructor
	 * @param element to contain the map
	 */
	WPGMZA.GoogleMap = function(element)
	{
		var self = this;
		
		if(!window.google)
			throw new Error("Google API not loaded");
		
		Parent.call(this, element);
		
		this.loadGoogleMap();
		
		google.maps.event.addListener(this.googleMap, "click", function(event) {
			self.dispatchEvent("click");
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
		
		if(this.settings.bicycle)
			this.enableBicycleLayer(true);
		if(this.settings.traffic)
			this.enableTrafficLayer(true);
		if(this.settings.transport)
			this.enablePublicTransportLayer(true);
		this.showPointsOfInterest(this.settings.show_points_of_interest);
		
		// Move the loading wheel into the map element (it has to live outside in the HTML file because it'll be overwritten by Google otherwise)
		$(this.engineElement).append($(this.element).find(".wpgmza-loader"));
		
		// Legacy V6 JS compatibility
		if(!window.MYMAP)
			window.MYMAP = [];
		MYMAP[this.id] = {map: this.googleMap};
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addMarker = function(marker)
	{
		marker.googleMarker.setMap(this.googleMap);
		
		Parent.prototype.addMarker.call(this, marker);
		
		// Legacy V6 JS compatibility
		if(!window.marker_array)
			window.marker_array = [];
		
		if(!marker_array[this.id])
			marker_array[this.id] = [];
		
		marker_array[this.id][marker.id] = marker.googleMarker;
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
		return this.googleMap.setZoom(value);
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
		
		return {
			topLeft: {
				lat: northEast.lat(),
				lng: southWest.lng()
			},
			bottomRight: {
				lat: southWest.lat(),
				lng: northEast.lng()
			}
		};
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
		
		this.googleMap.fitBounds(southWest, northEast);
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
			lat: latLng.lat,
			lng: latLng.lng
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
	
})(jQuery);

// js/v8/google-maps/google-marker.js
/**
 * @namespace WPGMZA
 * @module GoogleMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
(function($) {
	
	var Parent;
	
	WPGMZA.GoogleMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);
		
		this.googleMarker = new google.maps.Marker(/*this.settings*/);
		this.googleMarker.wpgmzaMarker = this;
		
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
			
		this.googleMarker.setLabel(this.settings.label);
		this.googleMarker.setAnimation(this.settings.animation);
			
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
			
			self.dispatchEvent("dragend");
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
	WPGMZA.GoogleMarker.prototype.setOffset = function(x, y)
	{
		var self = this;
		var icon = this.googleMarker.getIcon();
		var img = new Image();
		var params;
		
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
		
		this.googleMarker.setVisible(visible);
	}
	
	WPGMZA.GoogleMarker.prototype.setDraggable = function(draggable)
	{
		this.googleMarker.setDraggable(draggable);
	}
	
})(jQuery);

// js/v8/google-maps/google-polygon.js
/**
 * @namespace WPGMZA
 * @module GooglePolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
(function($) {
	
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
	
})(jQuery);

// js/v8/google-maps/google-polyline.js
/**
 * @namespace WPGMZA
 * @module GooglePolyline
 * @requires WPGMZA.Polyline
 */
(function($) {
	
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
	
})(jQuery);

// js/v8/google-maps/google-store-locator.js
/**
 * @namespace WPGMZA
 * @module GoogleStoreLocator
 * @requires WPGMZA.StoreLocator
 * @pro-requires WPGMZA.ProStoreLocator
 */
(function($) {
	
	var Parent;
	
	/**
	 * Constructor
	 * @param map The map this store locator is attached to
	 */
	WPGMZA.GoogleStoreLocator = function(map)
	{
		Parent.call(this, map);
	}
	
	Parent = (WPGMZA.isProVersion() ? WPGMZA.ProStoreLocator : WPGMZA.StoreLocator);
	
	WPGMZA.GoogleStoreLocator.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleStoreLocator.prototype.constructor = WPGMZA.GoogleStoreLocator;
	
	/**
	 * Creates an instance of a circle to display the radius
	 * @return void
	 */
	WPGMZA.GoogleStoreLocator.prototype.showCircle = function(latLng)
	{
		if(!this.circle)
			this.circle = new google.maps.Circle({
				strokeColor: "#ff0000",
				strokeCopacity: 0.25,
				strokeWeight: 2,
				fillColor: "#ff0000",
				clickable: false
			});
			
		if(!latLng)
		{
			this.circle.setMap(null);
			return;
		}
		
		this.circle.setOptions({
			center: latLng,
			map: this.map.googleMap,
			radius: WPGMZA.Distance.uiToMeters(this.getRadius())
		});
	}
	
	/**
	 * Shows/hides bouncing marker at the center of the search radius
	 * @return void
	 */
	WPGMZA.GoogleStoreLocator.prototype.showCenterMarker = function(latLng)
	{
		WPGMZA.StoreLocator.prototype.showCenterMarker.call(this, latLng);
		
		this.centerMarker.googleMarker.setMap((latLng ? this.map.googleMap : null));
	}
	
})(jQuery);

// js/v8/google-maps/google-vertex-context-menu.js
/**
 * @namespace WPGMZA
 * @module GoogleVertexContextMenu
 * @requires wpgmza_api_call
 */
(function($) {
	
	if(WPGMZA.settings.engine != "google-maps")
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
	
})(jQuery);

// js/v8/open-street-map/osm-circle.js
/**
 * @namespace WPGMZA
 * @module OSMCircle
 * @requires WPGMZA.Circle
 */
(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.OSMCircle = function(options, osmFeature)
	{
		var self = this;
		
		this.center = {lat: 0, lng: 0};
		this.radius = 0;
		
		Parent.call(this, options, osmFeature);
		
		if(!this.settings.fillColor)
		{
			this.settings.fillColor = "#ff0000";
			this.settings.fillOpacity = 0.6;
		}
		
		this.osmStyle = new ol.style.Style(this.getStyleFromSettings());
		
		// IMPORTANT: Please note that due to what appears to be a bug in OpenLayers, the following code MUST be exected specifically in this order, or the circle won't appear
		var vectorLayer3857 = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: this.osmStyle
		});
		
		if(osmFeature)
		{
			this.osmFeature = osmFeature;
		}
		else
		{
			var wgs84Sphere = new ol.Sphere(6378137);
			var radius = this.radius;
			var x, y;
			
			x = this.center.lng;
			y = this.center.lat;
			
			var circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [x, y], radius, 64);
			var circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
			
			vectorLayer3857.getSource().addFeature(new ol.Feature(circle3857));
		}
		
		this.layer = vectorLayer3857;
		
		options.map.osmMap.addLayer(vectorLayer3857);
	}
	
	WPGMZA.OSMCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMCircle.prototype.constructor = WPGMZA.OSMCircle;
	
	WPGMZA.OSMCircle.prototype.getStyleFromSettings = function()
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
	
	WPGMZA.OSMCircle.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.osmStyle = new ol.style.Style(params);
		this.layer.setStyle(this.osmStyle);
	}
	
})(jQuery);

// js/v8/open-street-map/osm-drawing-manager.js
/**
 * @namespace WPGMZA
 * @module OSMDrawingManager
 * @requires WPGMZA.DrawingManager
 */
(function($) {
	WPGMZA.OSMDrawingManager = function(map)
	{
		WPGMZA.DrawingManager.call(this, map);
		
		this.source = new ol.source.Vector({wrapX: false});
		
		this.layer = new ol.layer.Vector({
			source: this.source
		});
		
		this.map.osmMap.addLayer(this.layer);
	}
	
	WPGMZA.OSMDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.OSMDrawingManager.prototype.constructor = WPGMZA.OSMDrawingManager;
	
	WPGMZA.OSMDrawingManager.prototype.setOptions = function(options)
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
	
	WPGMZA.OSMDrawingManager.prototype.setDrawingMode = function(mode)
	{
		var self = this;
		var type, endEventType;
		
		WPGMZA.DrawingManager.prototype.setDrawingMode.call(this, mode);
		
		if(this.interaction)
		{
			this.map.osmMap.removeInteraction(this.interaction);
			this.interaction = null;
		}
		
		switch(mode)
		{
			case WPGMZA.DrawingManager.MODE_NONE:
				return;
				break;
				
			case WPGMZA.DrawingManager.MODE_MARKER:
				type = "Point";
				endEventType = "markerplaced";
				break;
			
            case WPGMZA.DrawingManager.MODE_POLYGON:
				type = "Polygon";
				endEventType = "polygonclosed";
				break;
			
		    case WPGMZA.DrawingManager.MODE_POLYLINE:
				type = "LineString";
				endEventType = "polylinecomplete";
				break;
				
			default:
				throw new Error("Invalid drawing mode");
				break;
		}
		
		this.interaction = new ol.interaction.Draw({
			source: this.source,
			type: type
		});
		
		this.interaction.on("drawend", function(event) {
			if(!endEventType)
				return;
			
			var wpgmzaEvent = new WPGMZA.Event(endEventType);
			
			switch(mode)
			{
				case WPGMZA.DrawingManager.MODE_MARKER:
					var lonLat = ol.proj.toLonLat(event.feature.getGeometry().getCoordinates());
				
					wpgmzaEvent.engineMarker = event.feature;
					wpgmzaEvent.latLng = {
						lat: lonLat[1],
						lng: lonLat[0]
					};
					
					break;
				
				case WPGMZA.DrawingManager.MODE_POLYGON:
					wpgmzaEvent.enginePolygon = event.feature;
					break;
					
				case WPGMZA.DrawingManager.MODE_POLYLINE:
					wpgmzaEvent.enginePolyline = event.feature;
					break;
			}
			
			self.dispatchEvent(wpgmzaEvent);
		});
		this.map.osmMap.addInteraction(this.interaction);
	}
	
})(jQuery);

// js/v8/open-street-map/osm-geocoder.js
/**
 * @namespace WPGMZA
 * @module OSMGeocoder
 * @requires WPGMZA.Geocoder
 */
(function($) {
	
	WPGMZA.OSMGeocoder = function()
	{
		
	}
	
	WPGMZA.OSMGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.OSMGeocoder.prototype.constructor = WPGMZA.OSMGeocoder;
	
	WPGMZA.OSMGeocoder.prototype.getResponseFromCache = function(address, callback)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_query_nominatim_cache",
				query: address
			},
			success: function(response, xhr, status) {
				callback(response);
			}
		});
	}
	
	WPGMZA.OSMGeocoder.prototype.getResponseFromNominatim = function(options, callback)
	{
		var data = {
			q: options.address,
			format: "json"
		};
		
		if(options.country)
			data.countrycodes = options.country;
		
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
	
	WPGMZA.OSMGeocoder.prototype.cacheResponse = function(address, response)
	{
		$.ajax(WPGMZA.ajaxurl, {
			data: {
				action: "wpgmza_query_nominatim_cache",
				query: address,
				response: JSON.stringify(response)
			},
			method: "POST"
		});
	}
	
	WPGMZA.OSMGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		var self = this;
		var address = options.address;
		
		var latLng;
		if(latLng = WPGMZA.isLatLngString(address))
			return WPGMZA.Geocoder.prototype.getLatLngFromAddress.call(this, options, callback);
		
		function finish(response, status)
		{
			for(var i = 0; i < response.length; i++)
			{
				response[i].geometry = {
					location: {
						lat: parseFloat(response[i].lat),
						lng: parseFloat(response[i].lon)
					}
				};
				
				response[i].lng = response[i].lon;
			}
			
			callback(response, status);
		}
		
		this.getResponseFromCache(address, function(response) {
			if(response.length)
			{
				finish(response, WPGMZA.Geocoder.SUCCESS);
				return;
			}
			
			self.getResponseFromNominatim(options, function(response, status) {
				if(status == WPGMZA.Geocoder.FAIL)
				{
					callback(null, WPGMZA.Geocoder.FAIL);
					return;
				}
				
				if(response.length == 0)
				{
					callback(response, WPGMZA.Geocoder.ZERO_RESULTS);
					return;
				}
				
				finish(response, WPGMZA.Geocoder.SUCCESS);
				
				self.cacheResponse(address, response);
			});
		});
	}
	
})(jQuery);

// js/v8/open-street-map/osm-info-window.js
/**
 * @namespace WPGMZA
 * @module OSMInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMInfoWindow = function(mapObject)
	{
		var self = this;
		
		Parent.call(this, mapObject);
		
		this.element = $("<div class='osm-info-window-container osm-info-window-plain'></div>")[0];
			
		$(this.element).on("click", ".osm-info-window-close", function(event) {
			self.close();
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.OSMInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMInfoWindow.prototype.constructor = WPGMZA.OSMInfoWindow;
	
	/**
	 * Opens the info window
	 * TODO: This should take a mapObject, not an event
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.OSMInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		var latLng = mapObject.getPosition();
		
		if(!WPGMZA.InfoWindow.prototype.open.call(this, map, mapObject))
			return false;
		
		if(this.overlay)
			this.mapObject.map.osmMap.removeOverlay(this.overlay);
			
		this.overlay = new ol.Overlay({
			element: this.element
		});
		
		this.overlay.setPosition(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		self.mapObject.map.osmMap.addOverlay(this.overlay);
		
		$(this.element).show();
		
		this.dispatchEvent("infowindowopen");
		$(this.element).trigger("infowindowopen.wpgmza");
	}
	
	WPGMZA.OSMInfoWindow.prototype.close = function(event)
	{
		// TODO: Why? This shouldn't have to be here. Removing the overlay should hide the element (it doesn't)
		$(this.element).hide();
		
		if(!this.overlay)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.mapObject.map.osmMap.removeOverlay(this.overlay);
		this.overlay = null;
	}
	
	WPGMZA.OSMInfoWindow.prototype.setContent = function(html)
	{
		$(this.element).html("<i class='fa fa-times osm-info-window-close' aria-hidden='true'></i>" + html);
	}
	
})(jQuery);

// js/v8/open-street-map/osm-map-edit-page.js
/**
 * @namespace WPGMZA
 * @module OSMMapEditPage
 * @requires WPGMZA.MapEditPage
 * @pro-requires WPGMZA.ProMapEditPage
 */
(function($) {
	
	var Parent;

	/**
	 * Constructor
	 * NB: There is a bug in openlayers, so it's necessary to make the modify interaction inactive
	 * please do not remove that code. See https://github.com/openlayers/openlayers/issues/6310
	 */
	WPGMZA.OSMMapEditPage = function()
	{
		var self = this;
		
		Parent.call(this);
		
		this.map.osmMap.updateSize();
		
		this.selectInteraction = new ol.interaction.Select();
		
		this.selectInteraction.on("select", function(event) {
			if(self.editMapObjectTarget instanceof WPGMZA.Heatmap || self.drawingManager.mode != WPGMZA.DrawingManager.MODE_NONE)
				return;
			
			self.finishEditingMapObject(false);
			
			var features = event.target.getFeatures().getArray();
			for(var i = 0; i < features.length; i++)
			{
				var properties = features[i].getProperties();
				for(var name in properties)
					if(properties[name] instanceof WPGMZA.MapObject)
					{
						properties[name].dispatchEvent("click");
						self.modifyInteraction.setActive(true);
						return;
					}
			}
		});
		
		this.map.osmMap.addInteraction(this.selectInteraction);
		
		this.modifyInteraction = new ol.interaction.Modify({
			features: this.selectInteraction.getFeatures(),
			deleteCondition: function(event) {
				return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
			}
		});
		
		this.modifyInteraction.on("modifyend", function(event) {
			self.editMapObjectTarget.modified = true;
		});
		
		this.modifyInteraction.setActive(false);
		
		this.map.osmMap.addInteraction(this.modifyInteraction);
		
		// Set the right click marker image and add it to the OSM map
		$(this.rightClickCursor.element).find("img")[0].src = $(".wpgmza-map").attr("data-right-click-marker-image");
		this.map.osmMap.addOverlay( this.rightClickCursor.overlay );
		
		// Bind listeners for rightClickCursor
		$(".wpgmza-engine-map").on("mousemove", function(event) {
			var offset = $(this).offset();
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;
			
            self.mouseCoordinates = {
                x: x,
                y: y
            };
        });
		
		$(".wpgmza-engine-map").bind("contextmenu", function(event) {
			return self.onRightClick(event);
        });
	}
	
	// Inheritence
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMapEditPage;
	else
		Parent = WPGMZA.MapEditPage;
	
	WPGMZA.OSMMapEditPage.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMMapEditPage.prototype.constructor = WPGMZA.OSMMapEditPage;
	
	WPGMZA.OSMMapEditPage.prototype.onRightClick = function(event)
	{
		if($(event.target).closest("[data-wpgmza-layout-element]:not(.wpgmza-engine-map)").length)
			return true;
		
		var conversion = this.map.osmMap.getCoordinateFromPixel( [this.mouseCoordinates.x, this.mouseCoordinates.y] );
		var coordinates = ol.proj.toLonLat( [ conversion[0], conversion[1] ] );

		this.map.dispatchEvent({
			type: "rightclick",
			latLng: {
				lat: coordinates[1],
				lng: coordinates[0]
			}
		});
		
		return false;
	}
	
	WPGMZA.OSMMapEditPage.prototype.onPolygonSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polygon))
			return;
		
		Parent.prototype.onPolygonSettingChanged.call(this, event);
		
		this.editMapObjectTarget.updateStyleFromSettings();
	}
	
	WPGMZA.OSMMapEditPage.prototype.onFinishEditingPolygon = function(event)
	{
		this.selectInteraction.getFeatures().clear();
	}
	
	WPGMZA.OSMMapEditPage.prototype.onPolylineSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polyline))
			return;
		
		Parent.prototype.onPolylineSettingChanged.call(this, event);
		
		this.editMapObjectTarget.updateStyleFromSettings();
	}
	
	WPGMZA.OSMMapEditPage.prototype.finishEditingMapObject = function(clearSelectInteraction)
	{
		Parent.prototype.finishEditingMapObject.call(this);
		
		this.modifyInteraction.setActive(false);
		
		if(clearSelectInteraction === undefined || clearSelectInteraction == true)
			WPGMZA.mapEditPage.selectInteraction.getFeatures().clear();
	}
	
})(jQuery);

// js/v8/open-street-map/osm-map.js
/**
 * @namespace WPGMZA
 * @module OSMMap
 * @requires WPGMZA.Map
 * @pro-requires WPGMZA.ProMap
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMMap = function(element)
	{
		var self = this;
		
		Parent.call(this, element);
		
		var viewOptions = this.settings.toOSMViewOptions();
		
		$(this.element).html("");
		
		this.osmMap = new ol.Map({
			target: $(element)[0],
			layers: [
				new ol.layer.Tile({
					source: new ol.source.OSM()
				})
			],
			view: new ol.View(viewOptions)
		});
		
		// Put grid inside map
		$(this.engineElement).append($(this.element).find(".wpgmza-in-map-grid"));
		
		// Interactions
		this.osmMap.getInteractions().forEach(function(interaction) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive( (this.settings.map_draggable ? false : true) );
			else if(interaction instanceof ol.interaction.DoubleClickZoom)
				interaction.setActive( (this.settings.map_clickzoom ? false : true) );
			else if(interaction instanceof ol.interaction.MouseWheelZoom)
				interaction.setActive( (this.settings.map_scroll ? false : true) );
			
		}, this);
		
		// Controls
		this.osmMap.getControls().forEach(function(control) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(control instanceof ol.control.Zoom && this.settings.map_zoom)
				this.osmMap.removeControl(control);
			
		}, this);
		
		if(!this.settings.map_full_screen_control)
			this.osmMap.addControl(new ol.control.FullScreen());
		
		// Marker layer
		this.markerLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: []
			})
		});
		this.osmMap.addLayer(this.markerLayer);
		
		// Listen for end of pan so we can wrap longitude if needs be
		this.osmMap.on("moveend", function(event) {
			self.wrapLongitude();
			self.dispatchEvent("dragend");
			self.onIdle();
		});
		
		// Listen for zoom
		this.osmMap.getView().on("change:resolution", function(event) {
			self.dispatchEvent("zoomchanged");
			self.onIdle();
		});
		
		// Listen for bounds changing
		this.osmMap.getView().on("change", function() {
			// Wrap longitude
			self.onBoundsChanged();
		});
		self.onBoundsChanged();
		
		// Store locator center
		var marker;
		if(this.storeLocator && (marker = this.storeLocator.centerPointMarker))
		{
			this.osmMap.addOverlay(marker.overlay);
			marker.setVisible(false);
		}
		
		// Dispatch event
		if(!WPGMZA.isProVersion())
		{
			this.dispatchEvent("created");
			WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
		}
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMap;
	else
		Parent = WPGMZA.Map;
	
	WPGMZA.OSMMap.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMMap.prototype.constructor = WPGMZA.OSMMap;
	
	WPGMZA.OSMMap.prototype.wrapLongitude = function()
	{
		var center = this.getCenter();
		
		if(center.lng >= -180 && center.lng <= 180)
			return;
		
		center.lng = center.lng - 360 * Math.floor(center.lng / 360);
		
		if(center.lng > 180)
			center.lng -= 360;
		
		this.setCenter(center);
	}
	
	WPGMZA.OSMMap.prototype.getCenter = function()
	{
		var lonLat = ol.proj.toLonLat(
			this.osmMap.getView().getCenter()
		);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	WPGMZA.OSMMap.prototype.setCenter = function(latLng)
	{
		var view = this.osmMap.getView();
		
		WPGMZA.Map.prototype.setCenter.call(this, latLng);
		
		view.setCenter(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		
		this.wrapLongitude();

		this.onBoundsChanged();
	}
	
	WPGMZA.OSMMap.prototype.getBounds = function()
	{
		var bounds = this.osmMap.getView().calculateExtent(this.osmMap.getSize());
		
		var topLeft = ol.proj.toLonLat([bounds[0], bounds[1]]);
		var bottomRight = ol.proj.toLonLat([bounds[2], bounds[3]]);
		
		return {
			topLeft: {
				lat: topLeft[1],
				lng: topLeft[0]
			},
			bottomRight: {
				lat: bottomRight[1],
				lng: bottomRight[0]
			}
		};
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	WPGMZA.OSMMap.prototype.fitBounds = function(southWest, northEast)
	{
		this.osmMap.getView().fitExtent(
			[southWest.lng, southWest.lat, northEast.lng, northEast.lat],
			this.osmMap.getSize()
		);
	}
	
	WPGMZA.OSMMap.prototype.panTo = function(latLng)
	{
		var view = this.osmMap.getView();
		view.animate({
			center: ol.proj.fromLonLat([
				parseFloat(latLng.lng),
				parseFloat(latLng.lat),
			]),
			duration: 500
		});
	}
	
	WPGMZA.OSMMap.prototype.getZoom = function()
	{
		return this.osmMap.getView().getZoom();
	}
	
	WPGMZA.OSMMap.prototype.setZoom = function(value)
	{
		this.osmMap.getView().setZoom(value);
	}
	
	WPGMZA.OSMMap.prototype.getMinZoom = function()
	{
		return this.osmMap.getView().getMinZoom();
	}
	
	WPGMZA.OSMMap.prototype.setMinZoom = function(value)
	{
		this.osmMap.getView().setMinZoom(value);
	}
	
	WPGMZA.OSMMap.prototype.getMaxZoom = function()
	{
		return this.osmMap.getView().getMaxZoom();
	}
	
	WPGMZA.OSMMap.prototype.setMaxZoom = function(value)
	{
		this.osmMap.getView().setMaxZoom(value);
	}
	
	/**
	 * TODO: Consider moving all these functions to their respective classes, same on google map (DO IT!!! It's very misleading having them here)
	 */
	WPGMZA.OSMMap.prototype.addMarker = function(marker)
	{
		this.osmMap.addOverlay(marker.overlay);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	WPGMZA.OSMMap.prototype.removeMarker = function(marker)
	{
		this.osmMap.removeOverlay(marker.overlay);
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	WPGMZA.OSMMap.prototype.addPolygon = function(polygon)
	{
		this.osmMap.addLayer(polygon.layer);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	WPGMZA.OSMMap.prototype.removePolygon = function(polygon)
	{
		this.osmMap.removeLayer(polygon.layer);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	WPGMZA.OSMMap.prototype.addPolyline = function(polyline)
	{
		this.osmMap.addLayer(polyline.layer);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	WPGMZA.OSMMap.prototype.removePolyline = function(polyline)
	{
		this.osmMap.removeLayer(polyline.layer);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	WPGMZA.OSMMap.prototype.addCircle = function(circle)
	{
		this.osmMap.addLayer(circle.layer);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	WPGMZA.OSMMap.prototype.removeCircle = function(circle)
	{
		this.osmMap.removeLayer(circle.layer);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	WPGMZA.OSMMap.prototype.getFetchParameters = function()
	{
		var result = WPGMZA.Map.prototype.getFetchParameters.call(this);
		
		var bounds = this.osmMap.getView().calculateExtent(this.osmMap.getSize());
		
		var topLeft = ol.proj.toLonLat([bounds[0], bounds[1]]);
		var bottomRight = ol.proj.toLonLat([bounds[2], bounds[3]]);
		
		result.bounds = topLeft[1] + "," + topLeft[0] + "," + bottomRight[1] + "," + bottomRight[0];
		
		return result;
	}
	
	WPGMZA.OSMMap.prototype.pixelsToLatLng = function(x, y)
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
		
		var coord = this.osmMap.getCoordinateFromPixel([x, y]);
		
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
	
	WPGMZA.OSMMap.prototype.latLngToPixels = function(latLng)
	{
		var coord = ol.proj.fromLonLat([latLng.lng, latLng.lat]);
		var pixel = this.osmMap.getPixelFromCoordinate(coord);
		
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
	
	WPGMZA.OSMMap.prototype.enableBicycleLayer = function(value)
	{
		if(value)
		{
			if(!this.bicycleLayer)
				this.bicycleLayer = new ol.layer.Tile({
					source: new ol.source.OSM({
						url: "http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
					})
				});
				
			this.osmMap.addLayer(this.bicycleLayer);
		}
		else
		{
			if(!this.bicycleLayer)
				return;
			
			this.osmMap.removeLayer(this.bicycleLayer);
		}
	}
	
	WPGMZA.OSMMap.prototype.onElementResized = function(event)
	{
		this.osmMap.updateSize();
	}
	
})(jQuery);

// js/v8/open-street-map/osm-marker.js
/**
 * @namespace WPGMZA
 * @module OSMMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);

		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		this.element = $("<div class='osm-marker'><img src='" + WPGMZA.settings.default_marker_icon + "'/></div>")[0];
		
		$(this.element).on("click", function(event) {
			self.dispatchEvent("click");
			self.dispatchEvent("select");
		});

		$(this.element).on("mouseover", function(event) {
			self.dispatchEvent("mouseover");
		});
		
		this.overlay = new ol.Overlay({
			element: this.element
		});
		this.overlay.setPosition(origin);
		
		this.setAnimation(this.settings.animation);
		this.setLabel(this.settings.label);
		
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.OSMMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMMarker.prototype.constructor = WPGMZA.OSMMarker;
	
	WPGMZA.OSMMarker.prototype.addLabel = function()
	{
		this.setLabel(this.getLabelText());
	}
	
	WPGMZA.OSMMarker.prototype.setLabel = function(label)
	{
		if(!label)
		{
			if(this.label)
				$(this.element).find(".osm-marker-label").remove();
			
			return;
		}
		
		if(!this.label)
		{
			this.label = $("<div class='osm-marker-label'/>");
			$(this.element).append(this.label);
		}
		
		this.label.html(label);
	}
	
	WPGMZA.OSMMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible(visible);
		
		this.overlay.getElement().style.display = (visible ? "block" : "none");
	}
	
	WPGMZA.OSMMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
	
		this.overlay.setPosition(origin);
	}
	
	WPGMZA.OSMMarker.prototype.setOffset = function(x, y)
	{
		this.element.style.position = "relative";
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
	}
	
	WPGMZA.OSMMarker.prototype.setAnimation = function(anim)
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
	
})(jQuery);

// js/v8/open-street-map/osm-polygon.js
/**
 * @namespace WPGMZA
 * @module OSMPolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMPolygon = function(row, osmFeature)
	{
		var self = this;
		
		Parent.call(this, row, osmFeature);
		
		this.osmStyle = new ol.style.Style();
		
		if(osmFeature)
		{
			this.osmFeature = osmFeature;
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
				
				this.osmStyle = new ol.style.Style(this.getStyleFromSettings());
			}
			
			this.osmFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.osmFeature]
			}),
			style: this.osmStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolygon: this
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
	
	WPGMZA.OSMPolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMPolygon.prototype.constructor = WPGMZA.OSMPolygon;

	WPGMZA.OSMPolygon.prototype.getStyleFromSettings = function()
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
	
	WPGMZA.OSMPolygon.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.osmStyle = new ol.style.Style(params);
		this.layer.setStyle(this.osmStyle);
	}
	
	WPGMZA.OSMPolygon.prototype.setEditable = function(editable)
	{
		
	}
	
	WPGMZA.OSMPolygon.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.osmFeature.getGeometry().getCoordinates()[0];
		
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
	
})(jQuery);

// js/v8/open-street-map/osm-polyline.js
/**
 * @namespace WPGMZA
 * @module OSMPolyline
 * @requires WPGMZA.Polyline
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMPolyline = function(row, osmFeature)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, row);
		
		this.osmStyle = new ol.style.Style();
		
		if(osmFeature)
		{
			this.osmFeature = osmFeature;
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
			this.osmStyle = new ol.style.Style(params);
			
			this.osmFeature = new ol.Feature({
				geometry: new ol.geom.LineString(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.osmFeature]
			}),
			style: this.osmStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolyling: this
		});
	}
	
	Parent = WPGMZA.Polyline;
		
	WPGMZA.OSMPolyline.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMPolyline.prototype.constructor = WPGMZA.OSMPolyline;
	
	WPGMZA.OSMPolyline.prototype.getStyleFromSettings = function()
	{
		var params = {};
		
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity),
				width: parseInt(this.settings.strokeWeight)
			});
			
		return params;
	}
	
	WPGMZA.OSMPolyline.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.osmStyle = new ol.style.Style(params);
		this.layer.setStyle(this.osmStyle);
	}
	
	WPGMZA.OSMPolyline.prototype.setEditable = function(editable)
	{
		
	}
	
	WPGMZA.OSMPolyline.prototype.setPoints = function(points)
	{
		if(this.osmFeature)
			this.layer.getSource().removeFeature(this.osmFeature);
		
		var coordinates = [];
		
		for(var i = 0; i < points.length; i++)
			coordinates.push(ol.proj.fromLonLat([
				parseFloat(points[i].lng),
				parseFloat(points[i].lat)
			]));
		
		this.osmFeature = new ol.Feature({
			geometry: new ol.geom.LineString(coordinates)
		});
		
		this.layer.getSource().addFeature(this.osmFeature);
	}
	
	WPGMZA.OSMPolyline.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.osmFeature.getGeometry().getCoordinates();
		
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
	
})(jQuery);

// js/v8/open-street-map/osm-store-locator.js
/**
 * @namespace WPGMZA
 * @module OSMStoreLocator
 * @requires WPGMZA.StoreLocator
 * @pro-requires WPGMZA.ProStoreLocator
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMStoreLocator = function(map)
	{
		Parent.call(this, map);
	}
	
	Parent = (WPGMZA.isProVersion() ? WPGMZA.ProStoreLocator : WPGMZA.StoreLocator);
	
	WPGMZA.OSMStoreLocator.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMStoreLocator.prototype.constructor = WPGMZA.OSMStoreLocator;
	
	/**
	 * Displays the search radius at the given latLng, or hides it if latLng is null
	 * @return void
	 */
	WPGMZA.OSMStoreLocator.prototype.showCircle = function(latLng)
	{
		var radius = ol.proj.METERS_PER_UNIT.m * WPGMZA.Distance.uiToMeters(this.getRadius());

		if(this.circleLayer)
			this.map.osmMap.removeLayer(this.circleLayer);
		
		if(!latLng)
			return;
			
		this.circleLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [
					new ol.Feature({
						geometry: new ol.geom.Circle(
							ol.proj.fromLonLat([
								parseFloat(latLng.lng),
								parseFloat(latLng.lat)
							]),
							radius
						)
					})
				]
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: [255, 0, 0, 1],
					width: 2
				}),
				fill: new ol.style.Fill({
					color: [255, 0, 0, 0.25]
				})
			})
		});
		
		this.map.osmMap.addLayer(this.circleLayer);
	}
	
	/**
	 * Shows/hides a marker at the center point of the search radius
	 * @return void
	 */
	WPGMZA.OSMStoreLocator.prototype.showCenterMarker = function(latLng)
	{
		WPGMZA.StoreLocator.prototype.showCenterMarker.call(this, latLng);
		
		if(latLng)
			this.map.osmMap.addOverlay(this.centerMarker.overlay);
		else if(this.map.osmMap)
			this.map.osmMap.removeOverlay(this.centerMarker.overlay);
	}
	
})(jQuery);