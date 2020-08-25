/**
 * @namespace WPGMZA
 * @module MapSettingsPage
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * This class helps manage the map settings pageX
	 * @class WPGMZA.MapSettingsPage
	 * @constructor WPGMZA.MapSettingsPage
	 * @memberof WPGMZA
	 */
	WPGMZA.MapSettingsPage = function()
	{
		var self = this;
		
		this._keypressHistory = [];
		
		this.updateEngineSpecificControls();
		this.updateGDPRControls();
		
		$("#wpgmza-developer-mode").hide();
		$(window).on("keypress", function(event) {
			self.onKeyPress(event);
		});
		
		$("select[name='wpgmza_maps_engine']").on("change", function(event) {
			self.updateEngineSpecificControls();
		});
		
		$("input[name='wpgmza_gdpr_require_consent_before_load'], input[name='wpgmza_gdpr_require_consent_before_vgm_submit'], input[name='wpgmza_gdpr_override_notice']").on("change", function(event) {
			self.updateGDPRControls();
		});
	}
	
	WPGMZA.MapSettingsPage.createInstance = function()
	{
		return new WPGMZA.MapSettingsPage();
	}
	
	/**
	 * Updates engine specific controls, hiding irrelevant controls (eg Google controls when OpenLayers is the selected engine) and showing relevant controls.
	 * @method
	 * @memberof WPGMZA.MapSettingsPage
	 */
	WPGMZA.MapSettingsPage.prototype.updateEngineSpecificControls = function()
	{
		var engine = $("select[name='wpgmza_maps_engine']").val();
		
		$("[data-required-maps-engine][data-required-maps-engine!='" + engine + "']").hide();
		$("[data-required-maps-engine='" + engine + "']").show();
	}
	
	/**
	 * Updates the GDPR controls (eg visibility state) based on the selected GDPR settings
	 * @method
	 * @memberof WPGMZA.MapSettingsPage
	 */
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

	/**
	 * Flushes the geocode cache
	 */
	WPGMZA.MapSettingsPage.prototype.flushGeocodeCache = function()
	{
		var OLGeocoder = new WPGMZA.OLGeocoder();
		OLGeocoder.clearCache(function(response){
			jQuery('#wpgmza_flush_cache_btn').removeAttr('disabled');
		});
	}
	
	WPGMZA.MapSettingsPage.prototype.onKeyPress = function(event)
	{
		var string;
		
		this._keypressHistory.push(event.key);
		
		if(this._keypressHistory.length > 9)
			this._keypressHistory = this._keypressHistory.slice(this._keypressHistory.length - 9);
		
		string = this._keypressHistory.join("");
		
		if(string == "codecabin" && !this._developerModeRevealed)
		{
			$("#wpgmza-developer-mode").show();
			this._developerModeRevealed = true;
		}
	}
	
	jQuery(function($) {
		
		if(!window.location.href.match(/wp-google-maps-menu-settings/))
			return;
		
		WPGMZA.mapSettingsPage = WPGMZA.MapSettingsPage.createInstance();

		jQuery(document).ready(function(){
			jQuery('#wpgmza_flush_cache_btn').on('click', function(){
				jQuery(this).attr('disabled', 'disabled');
				WPGMZA.mapSettingsPage.flushGeocodeCache();
			});
		});
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXAtc2V0dGluZ3MtcGFnZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBNYXBTZXR0aW5nc1BhZ2VcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFRoaXMgY2xhc3MgaGVscHMgbWFuYWdlIHRoZSBtYXAgc2V0dGluZ3MgcGFnZVhcclxuXHQgKiBAY2xhc3MgV1BHTVpBLk1hcFNldHRpbmdzUGFnZVxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTWFwU2V0dGluZ3NQYWdlXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXBTZXR0aW5nc1BhZ2UgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLl9rZXlwcmVzc0hpc3RvcnkgPSBbXTtcclxuXHRcdFxyXG5cdFx0dGhpcy51cGRhdGVFbmdpbmVTcGVjaWZpY0NvbnRyb2xzKCk7XHJcblx0XHR0aGlzLnVwZGF0ZUdEUFJDb250cm9scygpO1xyXG5cdFx0XHJcblx0XHQkKFwiI3dwZ216YS1kZXZlbG9wZXItbW9kZVwiKS5oaWRlKCk7XHJcblx0XHQkKHdpbmRvdykub24oXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uS2V5UHJlc3MoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoXCJzZWxlY3RbbmFtZT0nd3BnbXphX21hcHNfZW5naW5lJ11cIikub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi51cGRhdGVFbmdpbmVTcGVjaWZpY0NvbnRyb2xzKCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0JChcImlucHV0W25hbWU9J3dwZ216YV9nZHByX3JlcXVpcmVfY29uc2VudF9iZWZvcmVfbG9hZCddLCBpbnB1dFtuYW1lPSd3cGdtemFfZ2Rwcl9yZXF1aXJlX2NvbnNlbnRfYmVmb3JlX3ZnbV9zdWJtaXQnXSwgaW5wdXRbbmFtZT0nd3BnbXphX2dkcHJfb3ZlcnJpZGVfbm90aWNlJ11cIikub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi51cGRhdGVHRFBSQ29udHJvbHMoKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFwU2V0dGluZ3NQYWdlLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiBuZXcgV1BHTVpBLk1hcFNldHRpbmdzUGFnZSgpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBVcGRhdGVzIGVuZ2luZSBzcGVjaWZpYyBjb250cm9scywgaGlkaW5nIGlycmVsZXZhbnQgY29udHJvbHMgKGVnIEdvb2dsZSBjb250cm9scyB3aGVuIE9wZW5MYXllcnMgaXMgdGhlIHNlbGVjdGVkIGVuZ2luZSkgYW5kIHNob3dpbmcgcmVsZXZhbnQgY29udHJvbHMuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwU2V0dGluZ3NQYWdlXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcFNldHRpbmdzUGFnZS5wcm90b3R5cGUudXBkYXRlRW5naW5lU3BlY2lmaWNDb250cm9scyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgZW5naW5lID0gJChcInNlbGVjdFtuYW1lPSd3cGdtemFfbWFwc19lbmdpbmUnXVwiKS52YWwoKTtcclxuXHRcdFxyXG5cdFx0JChcIltkYXRhLXJlcXVpcmVkLW1hcHMtZW5naW5lXVtkYXRhLXJlcXVpcmVkLW1hcHMtZW5naW5lIT0nXCIgKyBlbmdpbmUgKyBcIiddXCIpLmhpZGUoKTtcclxuXHRcdCQoXCJbZGF0YS1yZXF1aXJlZC1tYXBzLWVuZ2luZT0nXCIgKyBlbmdpbmUgKyBcIiddXCIpLnNob3coKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogVXBkYXRlcyB0aGUgR0RQUiBjb250cm9scyAoZWcgdmlzaWJpbGl0eSBzdGF0ZSkgYmFzZWQgb24gdGhlIHNlbGVjdGVkIEdEUFIgc2V0dGluZ3NcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBTZXR0aW5nc1BhZ2VcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwU2V0dGluZ3NQYWdlLnByb3RvdHlwZS51cGRhdGVHRFBSQ29udHJvbHMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIHNob3dOb3RpY2VDb250cm9scyA9ICQoXCJpbnB1dFtuYW1lPSd3cGdtemFfZ2Rwcl9yZXF1aXJlX2NvbnNlbnRfYmVmb3JlX2xvYWQnXVwiKS5wcm9wKFwiY2hlY2tlZFwiKTtcclxuXHRcdFxyXG5cdFx0dmFyIHZnbUNoZWNrYm94ID0gJChcImlucHV0W25hbWU9J3dwZ216YV9nZHByX3JlcXVpcmVfY29uc2VudF9iZWZvcmVfdmdtX3N1Ym1pdCddXCIpO1xyXG5cdFx0XHJcblx0XHRpZih2Z21DaGVja2JveC5sZW5ndGgpXHJcblx0XHRcdHNob3dOb3RpY2VDb250cm9scyA9IHNob3dOb3RpY2VDb250cm9scyB8fCB2Z21DaGVja2JveC5wcm9wKFwiY2hlY2tlZFwiKTtcclxuXHRcdFxyXG5cdFx0dmFyIHNob3dPdmVycmlkZVRleHRhcmVhID0gc2hvd05vdGljZUNvbnRyb2xzICYmICQoXCJpbnB1dFtuYW1lPSd3cGdtemFfZ2Rwcl9vdmVycmlkZV9ub3RpY2UnXVwiKS5wcm9wKFwiY2hlY2tlZFwiKTtcclxuXHRcdFxyXG5cdFx0aWYoc2hvd05vdGljZUNvbnRyb2xzKVxyXG5cdFx0e1xyXG5cdFx0XHQkKFwiI3dwZ216YS1nZHByLWNvbXBsaWFuY2Utbm90aWNlXCIpLnNob3coXCJzbG93XCIpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHQkKFwiI3dwZ216YS1nZHByLWNvbXBsaWFuY2Utbm90aWNlXCIpLmhpZGUoXCJzbG93XCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihzaG93T3ZlcnJpZGVUZXh0YXJlYSlcclxuXHRcdHtcclxuXHRcdFx0JChcIiN3cGdtemFfZ2Rwcl9vdmVycmlkZV9ub3RpY2VfdGV4dFwiKS5zaG93KFwic2xvd1wiKTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0JChcIiN3cGdtemFfZ2Rwcl9vdmVycmlkZV9ub3RpY2VfdGV4dFwiKS5oaWRlKFwic2xvd1wiKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEZsdXNoZXMgdGhlIGdlb2NvZGUgY2FjaGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwU2V0dGluZ3NQYWdlLnByb3RvdHlwZS5mbHVzaEdlb2NvZGVDYWNoZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgT0xHZW9jb2RlciA9IG5ldyBXUEdNWkEuT0xHZW9jb2RlcigpO1xyXG5cdFx0T0xHZW9jb2Rlci5jbGVhckNhY2hlKGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuXHRcdFx0alF1ZXJ5KCcjd3BnbXphX2ZsdXNoX2NhY2hlX2J0bicpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJyk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcFNldHRpbmdzUGFnZS5wcm90b3R5cGUub25LZXlQcmVzcyA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdHZhciBzdHJpbmc7XHJcblx0XHRcclxuXHRcdHRoaXMuX2tleXByZXNzSGlzdG9yeS5wdXNoKGV2ZW50LmtleSk7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuX2tleXByZXNzSGlzdG9yeS5sZW5ndGggPiA5KVxyXG5cdFx0XHR0aGlzLl9rZXlwcmVzc0hpc3RvcnkgPSB0aGlzLl9rZXlwcmVzc0hpc3Rvcnkuc2xpY2UodGhpcy5fa2V5cHJlc3NIaXN0b3J5Lmxlbmd0aCAtIDkpO1xyXG5cdFx0XHJcblx0XHRzdHJpbmcgPSB0aGlzLl9rZXlwcmVzc0hpc3Rvcnkuam9pbihcIlwiKTtcclxuXHRcdFxyXG5cdFx0aWYoc3RyaW5nID09IFwiY29kZWNhYmluXCIgJiYgIXRoaXMuX2RldmVsb3Blck1vZGVSZXZlYWxlZClcclxuXHRcdHtcclxuXHRcdFx0JChcIiN3cGdtemEtZGV2ZWxvcGVyLW1vZGVcIikuc2hvdygpO1xyXG5cdFx0XHR0aGlzLl9kZXZlbG9wZXJNb2RlUmV2ZWFsZWQgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRqUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFx0XHJcblx0XHRpZighd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goL3dwLWdvb2dsZS1tYXBzLW1lbnUtc2V0dGluZ3MvKSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEubWFwU2V0dGluZ3NQYWdlID0gV1BHTVpBLk1hcFNldHRpbmdzUGFnZS5jcmVhdGVJbnN0YW5jZSgpO1xyXG5cclxuXHRcdGpRdWVyeShkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcclxuXHRcdFx0alF1ZXJ5KCcjd3BnbXphX2ZsdXNoX2NhY2hlX2J0bicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0alF1ZXJ5KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XHJcblx0XHRcdFx0V1BHTVpBLm1hcFNldHRpbmdzUGFnZS5mbHVzaEdlb2NvZGVDYWNoZSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibWFwLXNldHRpbmdzLXBhZ2UuanMifQ==
