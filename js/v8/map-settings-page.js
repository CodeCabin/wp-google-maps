/**
 * @namespace WPGMZA
 * @module MapSettingsPage
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.MapSettingsPage = function()
	{
		var self = this;
		
		this.updateEngineSpecificControls();
		this.updateGDPRControls();
		
		$("select[name='wpgmza_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});
		
		$("input[name='wpgmza_gdpr_require_consent_before_load'], input[name='wpgmza_gdpr_require_consent_before_vgm_submit'], input[name='wpgmza_gdpr_override_notice']").on("change", function(event) {
			self.updateGDPRControls();
		});
	}
	
	WPGMZA.MapSettingsPage.prototype.updateEngineSpecificControls = function()
	{
		var engine = $("select[name='wpgmza_maps_engine']").val();
		
		$("[data-required-maps-engine][data-required-maps-engine!='" + engine + "']").hide();
		$("[data-required-maps-engine='" + engine + "']").show();
	}
	
	WPGMZA.MapSettingsPage.prototype.updateGDPRControls = function()
	{
		var showNoticeControls = $("input[name='wpgmza_gdpr_require_consent_before_load']").prop("checked");
		
		var vgmCheckbox = $("input[name='wpgmza_gdpr_require_consent_before_vgm_submit']");
		
		if(vgmCheckbox.length)
			showNoticeControls = showNoticeControls || vgmCheckbox.prop("checked");
		
		var showOverrideTextarea = showNoticeControls && $("input[name='wpgmza_gdpr_override_notice']").prop("checked");
		
		if(showNoticeControls)
		{
			$("#wpgmza-gdpr-compliance-notice").show("slow");
		}
		else
		{
			$("#wpgmza-gdpr-compliance-notice").hide("slow");
		}
		
		if(showOverrideTextarea)
		{
			$("#wpgmza_gdpr_override_notice_text").show("slow");
		}
		else
		{
			$("#wpgmza_gdpr_override_notice_text").hide("slow");
		}
	}
	
	jQuery(function($) {
		
		if(!window.location.href.match(/wp-google-maps-menu-settings/))
			return;
		
		WPGMZA.mapSettingsPage = new WPGMZA.MapSettingsPage();
		
	});
	
});