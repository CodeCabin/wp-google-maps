var WPGMZA = {
	maps: [],
	events: null,
	
	settings: window.WPGMZA_global_settings,
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
		var result = isLatLngString(str);
		
		if(!result)
			throw new Error("Not a valid latLng");
		
		return 
	},
	
	/**
	 * Returns true if running the Pro version of the plugin
	 * @return void
	 */
	isProVersion: function()
	{
		return this.settings.is_pro_version;
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
	
	createMapInstance: function(element) {
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				if(WPGMZA.isProVersion())
					return new WPGMZA.GoogleProMap(element);
				
				return new WPGMZA.GoogleMap(element);
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return new WPGMZA.OSMProMap(element);
				
				return new WPGMZA.OSMMap(element);
				break;
		}
	},
	
	runCatchableTask: function(callback, friendlyErrorContainer) {
		
		var $ = jQuery;
		
		if(WPGMZA.settings.developer_mode || (window.Cookies && window.Cookies.get("wpgmza-developer-mode")))
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
	}
};

(function($) {
	$(document).ready(function(event) {
		// Check for multiple jQuery versions
		var elements = $("script").filter(function() {
			return this.src.match(/(^|\/)jquery\.(min\.)?js(\?|$)/i);
		});

		if(elements.length > 1)
			console.warn("Multiple jQuery versions detected: ", elements);
	
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
			var warning = '<span class="wpgmza-warning">' + WPGMZA.settings.localized_strings.unsecure_geolocation + "</span>";
			
			$(".wpgmza-geolocation-setting").after(
				$(warning)
			);
		}
		
		// Switch off thanks for feedback message
		document.cookie = "wpgmza_feedback_thanks=false; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
	});
})(jQuery);