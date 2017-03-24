var WPGMZA = {
	maps: [],
	settings: "Not Loaded"
};

(function($) {
	$(document).ready(function(event) {
		WPGMZA.settings = window.WPGMZA_global_settings;
		
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
		
		$(".switch label").on("click", function(event) {
			var input = $(this).prev(".cmn-toggle");
			var val = input.prop("checked");
			input.prop("checked", !val);
			input.trigger("change");
		});
	});
})(jQuery);