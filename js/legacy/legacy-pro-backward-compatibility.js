jQuery(function($) {
	
	// NB: This code should really be delegated to Pro, as it handles Pro pages and features. Historically, this has always been in basic. For this reason, this needs to remain here for now until older versions of Pro have been altered.
	
	if(!WPGMZA.isProVersion())
		return; // Not running Pro, no need for this code to run
	
	if(WPGMZA.Version.compare(WPGMZA.pro_version, "8.1.0") >= 0)
		return;	// Running Pro 8.1.0 or above, no need for this code to run
	
	switch(WPGMZA.getCurrentPage())
	{
		case WPGMZA.PAGE_MAP_EDIT:
		
			$("#wpgmaps_tabs_markers").tabs();
			
			if($( "#slider-range-max" ).slider) {
				$( "#slider-range-max" ).slider({
					range: "max",
					min: 1,
					max: 21,
					value: $( "#amount" ).val(),
					slide: function( event, ui ) {
						$("#wpgmza_start_zoom").val(ui.value);
							MYMAP.map.setZoom(ui.value);
					}
				});
		   }
			
			$('#wpgmza_map_height_type').on('change', function() {
				if (this.value === "%") {
					$("#wpgmza_height_warning").show();
				}
			}); 
			
		case WPGMZA.PAGE_SETTINGS:
		
			$('.wpgmza_settings_marker_pull').on('click', function() {
				if (this.value === '1') {
					$(".wpgmza_marker_dir_tr").css('visibility','visible');
					$(".wpgmza_marker_dir_tr").css('display','table-row');
					$(".wpgmza_marker_url_tr").css('visibility','visible');
					$(".wpgmza_marker_url_tr").css('display','table-row');
				} else {
					$(".wpgmza_marker_dir_tr").css('visibility','hidden');
					$(".wpgmza_marker_dir_tr").css('display','none');
					$(".wpgmza_marker_url_tr").css('visibility','hidden');
					$(".wpgmza_marker_url_tr").css('display','none');
				}
			});
		
		case WPGMZA.PAGE_ADVANCED:
		
			$("#wpgmaps_tabs").tabs();
			
			break;
	}
	
});