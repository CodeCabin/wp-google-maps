jQuery(function($) {
	
   $("#wpgmaps_tabs").tabs();
   $("#wpgmaps_tabs_markers").tabs(); 
   
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
    
    $('#wpgmza_map_height_type').on('change', function() {
        if (this.value === "%") {
            $("#wpgmza_height_warning").show();
        }
    }); 
    
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

    $("#wpgmza_preview_theme").click(function() {
        var style_data_orig = $("#wpgmza_styling_json").val();
        var style_data = JSON.parse(style_data_orig);


        MYMAP.map.setOptions({styles: style_data}); 

    });

    $(".wpgmza_theme_selection").click(function() {
      var tid = $(this).attr('tid');
      var style_data_orig = $("#rb_wpgmza_theme_data_"+tid).val();
      var style_data = JSON.parse(style_data_orig);

      $("#wpgmza_styling_json").val(style_data_orig);

      $('.wpgmza_theme_radio').each(function(i, obj) {
        $(this).attr('checked', false);
      });
      $("#rb_wpgmza_theme_"+tid).attr('checked', true);
      $('.wpgmza_theme_selection').each(function(i, obj) {
        $(this).removeClass("wpgmza_theme_selection_activate");
      });

      $("#wpgmza_theme_selection_"+tid).addClass("wpgmza_theme_selection_activate");
      
      MYMAP.map.setOptions({styles: style_data});
  });
    
	
});