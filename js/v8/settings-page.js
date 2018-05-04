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