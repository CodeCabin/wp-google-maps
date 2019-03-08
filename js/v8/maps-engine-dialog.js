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
				engine: $("[name='wpgmza_maps_engine']:checked").val()
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