/**
 * @namespace WPGMZA
 * @module SettingsPage
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.SettingsPage = function()
	{
		$("#wpgmza-global-settings").tabs();
	}
	
	WPGMZA.SettingsPage.createInstance = function()
	{
		return new WPGMZA.SettingsPage();
	}
	
	$(window).on("load", function(event) {
		
		var useLegacyHTML = WPGMZA.settings.useLegacyHTML || !window.location.href.match(/no-legacy-html/);
		
		if(WPGMZA.getCurrentPage() == WPGMZA.PAGE_SETTINGS && !useLegacyHTML)
			WPGMZA.settingsPage = WPGMZA.SettingsPage.createInstance();
		
	});
	
});