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
		
		if(window.localStorage)
			active = parseInt(localStorage.getItem("wpgmza-settings-tabs"));
		
		options = {
			active: active,
			activate: function(event, ui) {
				if(window.localStorage)
					localStorage.setItem(
						"wpgmza-settings-tabs", 
						$(event.target).tabs("option", "active")
					);
			}
		};
		
		$(element).tabs(options);
		
		$("form.wpgmza").on("change", bindUnloadListener);
		
		$("form.wpgmza").on("submit", function(event) {
			window.removeEventListener("beforeunload", onBeforeUnload);
		});
	});
})(jQuery);