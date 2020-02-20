/**
 * @namespace WPGMZA
 * @module MapEditPage
 * @requires WPGMZA
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