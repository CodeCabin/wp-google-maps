/**
 * @namespace WPGMZA
 * @module MapsEngineDialog
 * @requires WPGMZA
 * @gulp-requires core.js
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
				engine: $("[name='wpgmza_maps_engine']:checked").val(),
				nonce: $("#wpgmza-maps-engine-dialog").attr("data-ajax-nonce")
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXBzLWVuZ2luZS1kaWFsb2cuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTWFwc0VuZ2luZURpYWxvZ1xyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIG1vZGFsIGRpYWxvZyBwcmVzZW50ZWQgdG8gdGhlIHVzZXIgaW4gdGhlIG1hcCBlZGl0IHBhZ2UsIHByb21wdGluZyB0aGVtIHRvIGNob29zZSBhIG1hcCBlbmdpbmUsIGlmIHRoZXkgaGF2ZW4ndCBkb25lIHNvIGFscmVhZHlcclxuXHQgKiBAY2xhc3MgV1BHTVpBLk1hcEVuZ2luZURpYWxvZ1xyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTWFwRW5naW5lRGlhbG9nXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdG8gY3JlYXRlIG1vZGFsIGRpYWxvZyBmcm9tXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcHNFbmdpbmVEaWFsb2cgPSBmdW5jdGlvbihlbGVtZW50KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHRcdFxyXG5cdFx0aWYod2luZG93LndwZ216YVVuYmluZFNhdmVSZW1pbmRlcilcclxuXHRcdFx0d2luZG93LndwZ216YVVuYmluZFNhdmVSZW1pbmRlcigpO1xyXG5cdFx0XHJcblx0XHQkKGVsZW1lbnQpLnNob3coKTtcclxuXHRcdCQoZWxlbWVudCkucmVtb2RhbCgpLm9wZW4oKTtcclxuXHRcdFxyXG5cdFx0JChlbGVtZW50KS5maW5kKFwiaW5wdXQ6cmFkaW9cIikub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdCQoXCIjd3BnbXphLWNvbmZpcm0tZW5naW5lXCIpLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoXCIjd3BnbXphLWNvbmZpcm0tZW5naW5lXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYub25CdXR0b25DbGlja2VkKGV2ZW50KTtcclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogVHJpZ2dlcmVkIHdoZW4gYW4gZW5naW5lIGlzIHNlbGVjdGVkLiBNYWtlcyBhbiBBSkFYIGNhbGwgdG8gdGhlIHNlcnZlciB0byBzYXZlIHRoZSBzZWxlY3RlZCBlbmdpbmUuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwRW5naW5lRGlhbG9nXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBjbGljayBldmVudCBmcm9tIHRoZSBzZWxlY3RlZCBidXR0b24uXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcHNFbmdpbmVEaWFsb2cucHJvdG90eXBlLm9uQnV0dG9uQ2xpY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdCQoZXZlbnQudGFyZ2V0KS5wcm9wKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcblx0XHRcclxuXHRcdCQuYWpheChXUEdNWkEuYWpheHVybCwge1xyXG5cdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxyXG5cdFx0XHRkYXRhOiB7XHJcblx0XHRcdFx0YWN0aW9uOiBcIndwZ216YV9tYXBzX2VuZ2luZV9kaWFsb2dfc2V0X2VuZ2luZVwiLFxyXG5cdFx0XHRcdGVuZ2luZTogJChcIltuYW1lPSd3cGdtemFfbWFwc19lbmdpbmUnXTpjaGVja2VkXCIpLnZhbCgpLFxyXG5cdFx0XHRcdG5vbmNlOiAkKFwiI3dwZ216YS1tYXBzLWVuZ2luZS1kaWFsb2dcIikuYXR0cihcImRhdGEtYWpheC1ub25jZVwiKVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzLCB4aHIpIHtcclxuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHQkKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcclxuXHRcdHZhciBlbGVtZW50ID0gJChcIiN3cGdtemEtbWFwcy1lbmdpbmUtZGlhbG9nXCIpO1xyXG5cdFx0XHJcblx0XHRpZighZWxlbWVudC5sZW5ndGgpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLnNldHRpbmdzLndwZ216YV9tYXBzX2VuZ2luZV9kaWFsb2dfZG9uZSlcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuc2V0dGluZ3Mud3BnbXphX2dvb2dsZV9tYXBzX2FwaV9rZXkgJiYgV1BHTVpBLnNldHRpbmdzLndwZ216YV9nb29nbGVfbWFwc19hcGlfa2V5Lmxlbmd0aClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEubWFwc0VuZ2luZURpYWxvZyA9IG5ldyBXUEdNWkEuTWFwc0VuZ2luZURpYWxvZyhlbGVtZW50KTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6Im1hcHMtZW5naW5lLWRpYWxvZy5qcyJ9
