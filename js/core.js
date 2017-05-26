var WPGMZA = {
	maps: [],
	settings: "Not Loaded",
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
	 * Utility function returns true is string is a latitude and longitude
	 * @return string
	 */
	isLatLngString: function(str)
	{
		return str.match(/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/);
	},
	
	openMediaDialog: function(callback) {
		// Media upload
		var file_frame;
		event.preventDefault();
		
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
		if(WPGMZA.ProMap)
			return new WPGMZA.ProMap(element);
		
		return new WPGMZA.Map(element);
	},
	
	createMarkerInstance: function(row) {
		if(WPGMZA.ProMarker)
			return new WPGMZA.ProMarker(row);
		
		return new WPGMZA.Marker(row);
	},
	
	createPolygonInstance: function(row, googlePolygon) {
		if(WPGMZA.ProPolygon)
			return new WPGMZA.ProPolygon(row, googlePolygon);
		
		return WPGMZA.Polygon(row, googlePolygon);
	},
	
	createInfoWindowInstance: function(mapObject) {
		if(WPGMZA.ProInfoWindow)
			return new WPGMZA.ProInfoWindow(mapObject);
		
		return new WPGMZA.InfoWindow(mapObject);
	}
};

(function($) {
	$(document).ready(function(event) {
		WPGMZA.settings = window.WPGMZA_global_settings;
		
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
			var warning = '<span class="wpgmza-warning"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + WPGMZA.settings.localized_strings.unsecure_geolocation + "</span>";
			
			$(".wpgmza-geolocation-setting").after(
				$(warning)
			);
		}
		
		// Switch off thanks for feedback message
		document.cookie = "wpgmza_feedback_thanks=false; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
	});
})(jQuery);