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

		$(document).on("click", ".wpgmza_edit_btn", function() {
			var cur_id = jQuery(this).attr("data-edit-marker-id");

			WPGMZA.AdminMarkerDataTable.prototype.onCenterMarker(cur_id);		
		});

		$('#wpgmza_max_zoom, #wpgmza_min_zoom').on("change", function() {
			setTimeout(function(){
				WPGMZA.MapEditPage.liveZoomControl();
			}, 500);
		});
	}
	
	WPGMZA.MapEditPage.createInstance = function()
	{
		if(WPGMZA.isProVersion() && WPGMZA.Version.compare(WPGMZA.pro_version, "8.0.0") >= WPGMZA.Version.EQUAL_TO)
			return new WPGMZA.ProMapEditPage();
		
		return new WPGMZA.MapEditPage();
	}

	WPGMZA.MapEditPage.liveZoomControl = function()
	{

		//Get Maximum Zoom Out Level
		var el_max_zoom = $('#wpgmza_max_zoom');
		var value_max_zoom = $(el_max_zoom).find(':selected').val();

		var find_max_zoom = WPGMZA.mapEditPage.map.googleMap.maxZoom;

		//Set the selected value to maxZoom
		find_max_zoom = value_max_zoom;

		//Get Maximum Zoom Out Level
		var el_min_zoom = $('#wpgmza_min_zoom');
		var value_min_zoom = $(el_min_zoom).find(':selected').val();

		var find_min_zoom = WPGMZA.mapEditPage.map.googleMap.minZoom ;
		
		//Set the selected value to minZoom
		find_min_zoom = value_min_zoom;
		
		WPGMZA.mapEditPage.map.setOptions({	
			minZoom:find_max_zoom ,
			maxZoom: find_min_zoom
		});

	}
	
	$(window).on("load", function(event) {
		
		WPGMZA.mapEditPage = WPGMZA.MapEditPage.createInstance();
		
	});
	
});