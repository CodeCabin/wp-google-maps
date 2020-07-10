/**
 * @namespace WPGMZA
 * @module MapEditPage
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	if(WPGMZA.currentPage != "map-edit")
		return;
	
	WPGMZA.MapEditPage = function()
	{
		var self = this;
		
		this.themePanel = new WPGMZA.ThemePanel();
		this.themeEditor = new WPGMZA.ThemeEditor();
		
		this.map = WPGMZA.maps[0];

		// Check if user enabled any interactions
		if(WPGMZA.settings.wpgmza_settings_map_scroll == 'yes' || WPGMZA.settings.wpgmza_settings_map_draggable == "yes" || WPGMZA.settings.wpgmza_settings_map_clickzoom == 'yes')
		{
			// Display notice and button if user enabled interactions
			var diplay_enable_interactions_notice = $("<div class='notice notice-info wpgmza_disabled_interactions_notice' style= 'height: 45px; padding: 7px 5px 2px 5px;'><p style='float: left; padding-top: 10px;'>" + WPGMZA.localized_strings.disabled_interactions_notice + 
			"</p><a class='button button-primary enable_interactions_notice_button' style='float: right;'>" + WPGMZA.localized_strings.disabled_interactions_button + "</a></div>");
			
			$(".wpgmza_map").after(diplay_enable_interactions_notice);

			$(".enable_interactions_notice_button").on("click", function() {
	
				WPGMZA.mapEditPage.map.enableAllInteractions();
	
				$(diplay_enable_interactions_notice).fadeOut('slow');
	
				var successNotice = $("<div class='notice notice-success'><p>" + WPGMZA.localized_strings.interactions_enabled_notice + "</p></div>");
				$(WPGMZA.mapEditPage.map.element).after(successNotice);
				$(successNotice).delay(2000).fadeIn('slow');
				$(successNotice).delay(4000).fadeOut('slow');
			});
		}

		$('#wpgmza_max_zoom, #wpgmza_min_zoom').on("change input", function(event) {
			self.onZoomLimitChanged(event);
		});
	}
	
	WPGMZA.MapEditPage.createInstance = function()
	{
		if(WPGMZA.isProVersion() && WPGMZA.Version.compare(WPGMZA.pro_version, "8.0.0") >= WPGMZA.Version.EQUAL_TO)
			return new WPGMZA.ProMapEditPage();
		
		return new WPGMZA.MapEditPage();
	}

	WPGMZA.MapEditPage.prototype.onZoomLimitChanged = function(event)
	{
		this.map.setOptions({
			minZoom:	$("#wpgmza_max_zoom").val(),
			maxZoom:	$("#wpgmza_min_zoom").val()
		});
	}
	
	$(window).on("load", function(event) {
		
		WPGMZA.mapEditPage = WPGMZA.MapEditPage.createInstance();
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXAtZWRpdC1wYWdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIE1hcEVkaXRQYWdlXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRpZihXUEdNWkEuY3VycmVudFBhZ2UgIT0gXCJtYXAtZWRpdFwiKVxyXG5cdFx0cmV0dXJuO1xyXG5cdFxyXG5cdFdQR01aQS5NYXBFZGl0UGFnZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMudGhlbWVQYW5lbCA9IG5ldyBXUEdNWkEuVGhlbWVQYW5lbCgpO1xyXG5cdFx0dGhpcy50aGVtZUVkaXRvciA9IG5ldyBXUEdNWkEuVGhlbWVFZGl0b3IoKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXAgPSBXUEdNWkEubWFwc1swXTtcclxuXHJcblx0XHQvLyBDaGVjayBpZiB1c2VyIGVuYWJsZWQgYW55IGludGVyYWN0aW9uc1xyXG5cdFx0aWYoV1BHTVpBLnNldHRpbmdzLndwZ216YV9zZXR0aW5nc19tYXBfc2Nyb2xsID09ICd5ZXMnIHx8IFdQR01aQS5zZXR0aW5ncy53cGdtemFfc2V0dGluZ3NfbWFwX2RyYWdnYWJsZSA9PSBcInllc1wiIHx8IFdQR01aQS5zZXR0aW5ncy53cGdtemFfc2V0dGluZ3NfbWFwX2NsaWNrem9vbSA9PSAneWVzJylcclxuXHRcdHtcclxuXHRcdFx0Ly8gRGlzcGxheSBub3RpY2UgYW5kIGJ1dHRvbiBpZiB1c2VyIGVuYWJsZWQgaW50ZXJhY3Rpb25zXHJcblx0XHRcdHZhciBkaXBsYXlfZW5hYmxlX2ludGVyYWN0aW9uc19ub3RpY2UgPSAkKFwiPGRpdiBjbGFzcz0nbm90aWNlIG5vdGljZS1pbmZvIHdwZ216YV9kaXNhYmxlZF9pbnRlcmFjdGlvbnNfbm90aWNlJyBzdHlsZT0gJ2hlaWdodDogNDVweDsgcGFkZGluZzogN3B4IDVweCAycHggNXB4Oyc+PHAgc3R5bGU9J2Zsb2F0OiBsZWZ0OyBwYWRkaW5nLXRvcDogMTBweDsnPlwiICsgV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLmRpc2FibGVkX2ludGVyYWN0aW9uc19ub3RpY2UgKyBcclxuXHRcdFx0XCI8L3A+PGEgY2xhc3M9J2J1dHRvbiBidXR0b24tcHJpbWFyeSBlbmFibGVfaW50ZXJhY3Rpb25zX25vdGljZV9idXR0b24nIHN0eWxlPSdmbG9hdDogcmlnaHQ7Jz5cIiArIFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5kaXNhYmxlZF9pbnRlcmFjdGlvbnNfYnV0dG9uICsgXCI8L2E+PC9kaXY+XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0JChcIi53cGdtemFfbWFwXCIpLmFmdGVyKGRpcGxheV9lbmFibGVfaW50ZXJhY3Rpb25zX25vdGljZSk7XHJcblxyXG5cdFx0XHQkKFwiLmVuYWJsZV9pbnRlcmFjdGlvbnNfbm90aWNlX2J1dHRvblwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdFx0XHRcdFdQR01aQS5tYXBFZGl0UGFnZS5tYXAuZW5hYmxlQWxsSW50ZXJhY3Rpb25zKCk7XHJcblx0XHJcblx0XHRcdFx0JChkaXBsYXlfZW5hYmxlX2ludGVyYWN0aW9uc19ub3RpY2UpLmZhZGVPdXQoJ3Nsb3cnKTtcclxuXHRcclxuXHRcdFx0XHR2YXIgc3VjY2Vzc05vdGljZSA9ICQoXCI8ZGl2IGNsYXNzPSdub3RpY2Ugbm90aWNlLXN1Y2Nlc3MnPjxwPlwiICsgV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLmludGVyYWN0aW9uc19lbmFibGVkX25vdGljZSArIFwiPC9wPjwvZGl2PlwiKTtcclxuXHRcdFx0XHQkKFdQR01aQS5tYXBFZGl0UGFnZS5tYXAuZWxlbWVudCkuYWZ0ZXIoc3VjY2Vzc05vdGljZSk7XHJcblx0XHRcdFx0JChzdWNjZXNzTm90aWNlKS5kZWxheSgyMDAwKS5mYWRlSW4oJ3Nsb3cnKTtcclxuXHRcdFx0XHQkKHN1Y2Nlc3NOb3RpY2UpLmRlbGF5KDQwMDApLmZhZGVPdXQoJ3Nsb3cnKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblxyXG5cdFx0JCgnI3dwZ216YV9tYXhfem9vbSwgI3dwZ216YV9taW5fem9vbScpLm9uKFwiY2hhbmdlIGlucHV0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHNlbGYub25ab29tTGltaXRDaGFuZ2VkKGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFwRWRpdFBhZ2UuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpICYmIFdQR01aQS5WZXJzaW9uLmNvbXBhcmUoV1BHTVpBLnByb192ZXJzaW9uLCBcIjguMC4wXCIpID49IFdQR01aQS5WZXJzaW9uLkVRVUFMX1RPKVxyXG5cdFx0XHRyZXR1cm4gbmV3IFdQR01aQS5Qcm9NYXBFZGl0UGFnZSgpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5NYXBFZGl0UGFnZSgpO1xyXG5cdH1cclxuXHJcblx0V1BHTVpBLk1hcEVkaXRQYWdlLnByb3RvdHlwZS5vblpvb21MaW1pdENoYW5nZWQgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR0aGlzLm1hcC5zZXRPcHRpb25zKHtcclxuXHRcdFx0bWluWm9vbTpcdCQoXCIjd3BnbXphX21heF96b29tXCIpLnZhbCgpLFxyXG5cdFx0XHRtYXhab29tOlx0JChcIiN3cGdtemFfbWluX3pvb21cIikudmFsKClcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHQkKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcclxuXHRcdFdQR01aQS5tYXBFZGl0UGFnZSA9IFdQR01aQS5NYXBFZGl0UGFnZS5jcmVhdGVJbnN0YW5jZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibWFwLWVkaXQtcGFnZS5qcyJ9
