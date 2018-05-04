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