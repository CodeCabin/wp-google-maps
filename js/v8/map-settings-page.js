/**
 * @namespace WPGMZA
 * @module MapSettingsPage
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.MapSettingsPage = function()
	{
		var self = this;
		
		this.updateEngineSpecificControls();
		
		$("select[name='wpgmza_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});
	}
	
	WPGMZA.MapSettingsPage.prototype.updateEngineSpecificControls = function()
	{
		var engine = $("select[name='wpgmza_maps_engine']").val();
		
		$("[data-required-maps-engine][data-required-maps-engine!='" + engine + "']").hide();
		$("[data-required-maps-engine='" + engine + "']").show();
	}
	
	$(document).ready(function(event) {
		
		if(!window.location.href.match(/wp-google-maps-menu-settings/))
			return;
		
		WPGMZA.mapSettingsPage = new WPGMZA.MapSettingsPage();
		
	});
	
})(jQuery);