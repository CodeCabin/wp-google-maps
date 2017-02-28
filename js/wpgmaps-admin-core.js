var placeSearch, autocomplete;
var wpgmza_table_length;
var wpgmzaTable;
var marker_added = false;
var wpgmaps_markers_array = [];
var infoWindow = new Array();
var tmp_marker;
var WPGM_Path_Polygon = new Array();
var WPGM_Path = new Array();


if ('undefined' == typeof window.jQuery) {
    alert("jQuery is not installed. WP Google Maps requires jQuery in order to function properly. Please ensure you have jQuery installed.")
} else {
    // all good.. continue...
}



jQuery(function() {
    
    
    function fillInAddress() {
      // Get the place details from the autocomplete object.
      var place = autocomplete.getPlace();
    }



    jQuery(document).ready(function(){

        jQuery("select[name=wpgmza_table_length]").change(function () {
            wpgmza_table_length = jQuery(this).val();
        })

        if (typeof document.getElementById('wpgmza_add_address') !== "undefined") {
            if (typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.places === 'object' && typeof google.maps.places.Autocomplete === 'function') {
                /* initialize the autocomplete form */
                autocomplete = new google.maps.places.Autocomplete(
                  /** @type {HTMLInputElement} */(document.getElementById('wpgmza_add_address')),
                  { types: ['geocode'] });
                // When the user selects an address from the dropdown,
                // populate the address fields in the form.
                google.maps.event.addListener(autocomplete, 'place_changed', function() {
                    fillInAddress();
                });
            }
        }
        wpgmzaTable = jQuery('#wpgmza_table').DataTable({
            "bProcessing": true,
            "aaSorting": [[ 0, "desc" ]]
        });
    
        function wpgmza_reinitialisetbl() {
            //wpgmzaTable.fnClearTable( 0 );
            if (wpgmza_table_length === "") { wpgmza_table_length = 10; }
            var wpgmzaTable = jQuery('#wpgmza_table').DataTable({
                "bProcessing": true,
                "iDisplayLength": wpgmza_table_length
            });
        }

        function wpgmza_InitMap() {
            var myLatLng = new google.maps.LatLng(wpgmaps_localize[wpgmaps_mapid].map_start_lat ,wpgmaps_localize[wpgmaps_mapid].map_start_lng);
            MYMAP.init('#wpgmza_map', myLatLng, parseInt(wpgmaps_localize[wpgmaps_mapid].map_start_zoom));
            UniqueCode=Math.round(Math.random()*10000);
            MYMAP.placeMarkers(wpgmaps_markerurl + '?u='+UniqueCode,wpgmaps_mapid,null,myLatLng);
        }

        jQuery("#wpgmza_map").css({
            height:wpgmaps_localize[wpgmaps_mapid].map_height+''+wpgmaps_localize[wpgmaps_mapid].map_height_type,
            width:wpgmaps_localize[wpgmaps_mapid].map_width+''+wpgmaps_localize[wpgmaps_mapid].map_width_type

        });
        var geocoder = new google.maps.Geocoder();
        wpgmza_InitMap();




        jQuery("body").on("click", ".wpgmza_del_btn", function() {
            var cur_id = jQuery(this).attr("id");
            var data = {
                action: 'delete_marker',
                security: wpgmaps_nonce,
                map_id: wpgmaps_mapid,
                marker_id: cur_id
            };
            jQuery.post(ajaxurl, data, function(response) {
                returned_data = JSON.parse(response);
                wpgmaps_localize_marker_data = returned_data.marker_data;
                //wpgmza_InitMap();
                wpgmaps_markers_array[cur_id].setMap(null);
                delete wpgmaps_markers_array[cur_id];

                jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
                wpgmza_reinitialisetbl();
            });


        });
        jQuery("body").on("click", ".wpgmza_poly_del_btn", function() {
            var cur_id = jQuery(this).attr("id");
            var data = {
                    action: 'delete_poly',
                    security: wpgmaps_nonce,
                    map_id: wpgmaps_mapid,
                    poly_id: cur_id
            };
            jQuery.post(ajaxurl, data, function(response) {
                    WPGM_Path_Polygon[cur_id].setMap(null);
                    delete wpgmaps_localize_polygon_settings[cur_id];
                    jQuery("#wpgmza_poly_holder").html(response);

            });

        });
        jQuery("body").on("click", ".wpgmza_polyline_del_btn", function() {
            var cur_id = jQuery(this).attr("id");
            var data = {
                    action: 'delete_polyline',
                    security: wpgmaps_nonce,
                    map_id: wpgmaps_mapid,
                    poly_id: cur_id
            };
            jQuery.post(ajaxurl, data, function(response) {
                    WPGM_Path[cur_id].setMap(null);
                    delete wpgmaps_localize_polyline_settings[cur_id];
                    jQuery("#wpgmza_polyline_holder").html(response);
                    

            });

        });

        jQuery('#wpgmza_map_type').on('change', function (e) {
            var optionSelected = jQuery("option:selected", this);
            var valueSelected = this.value;
            if (typeof valueSelected !== "undefined") {
                if (valueSelected === "1") { maptype = google.maps.MapTypeId.ROADMAP; }
                else if (valueSelected === "2") { maptype = google.maps.MapTypeId.SATELLITE; }
                else if (valueSelected === "3") { maptype = google.maps.MapTypeId.HYBRID; }
                else if (valueSelected === "4") { maptype = google.maps.MapTypeId.TERRAIN; }
                else { maptype = google.maps.MapTypeId.ROADMAP; }
            } else {
                maptype = google.maps.MapTypeId.ROADMAP;
            }
            MYMAP.map.setMapTypeId(maptype);
        });


        var wpgmza_edit_address = ""; /* set this here so we can use it in the edit marker function below */
        var wpgmza_edit_lat = ""; 
        var wpgmza_edit_lng = ""; 
        jQuery("body").on("click", ".wpgmza_edit_btn", function() {
            var cur_id = jQuery(this).attr("id");
            wpgmza_edit_address = jQuery("#wpgmza_hid_marker_address_"+cur_id).val();
            var wpgmza_edit_title = jQuery("#wpgmza_hid_marker_title_"+cur_id).val();
            var wpgmza_edit_anim = jQuery("#wpgmza_hid_marker_anim_"+cur_id).val();
            var wpgmza_edit_infoopen = jQuery("#wpgmza_hid_marker_infoopen_"+cur_id).val();
            
            if( wpgmza_edit_anim == '' ){ wpgmza_edit_anim = '0'; }
            if( wpgmza_edit_infoopen == '' ){ wpgmza_edit_infoopen = '0'; }
            
            wpgmza_edit_lat = jQuery("#wpgmza_hid_marker_lat_"+cur_id).val();
            wpgmza_edit_lng = jQuery("#wpgmza_hid_marker_lng_"+cur_id).val();
            
            jQuery("#wpgmza_edit_id").val(cur_id);
            jQuery("#wpgmza_add_address").val(wpgmza_edit_address);
            jQuery("#wpgmza_add_title").val(wpgmza_edit_title);
            jQuery("#wpgmza_animation").val(wpgmza_edit_anim);
            jQuery("#wpgmza_infoopen").val(wpgmza_edit_infoopen);
            jQuery("#wpgmza_addmarker_div").hide();
            jQuery("#wpgmza_editmarker_div").show();
        });

        jQuery("#wpgmza_addmarker").click(function(){
            jQuery("#wpgmza_addmarker").hide();
            jQuery("#wpgmza_addmarker_loading").show();

            var wpgm_address = "0";
            var wpgm_gps = "0";
            if (document.getElementsByName("wpgmza_add_address").length > 0) { wpgm_address = jQuery("#wpgmza_add_address").val(); }
            var wpgm_anim = "0";
            var wpgm_infoopen = "0";
            if (document.getElementsByName("wpgmza_animation").length > 0) { wpgm_anim = jQuery("#wpgmza_animation").val(); }
            if (document.getElementsByName("wpgmza_infoopen").length > 0) { wpgm_infoopen = jQuery("#wpgmza_infoopen").val(); }

            /* first check if user has added a GPS co-ordinate */
            checker = wpgm_address.split(",");
            var wpgm_lat = "";
            var wpgm_lng = "";
            wpgm_lat = checker[0];
            wpgm_lng = checker[1];
            checker1 = parseFloat(checker[0]);
            checker2 = parseFloat(checker[1]);
            if (typeof wpgm_lat !== "undefined" && typeof wpgm_lng !== "undefined" && (wpgm_lat.match(/[a-zA-Z]/g) === null && wpgm_lng.match(/[a-zA-Z]/g) === null) && checker.length === 2 && (checker1 != NaN && (checker1 <= 90 || checker1 >= -90)) && (checker2 != NaN && (checker2 <= 90 || checker2 >= -90))) {
                var data = {
                    action: 'add_marker',
                    security: wpgmaps_nonce,
                    map_id: wpgmaps_mapid,
                    address: wpgm_address,
                    lat: wpgm_lat,
                    lng: wpgm_lng,
                    infoopen: wpgm_infoopen,
                    anim: wpgm_anim 
                };
                jQuery.post(ajaxurl, data, function(response) {

                    if (typeof tmp_marker !== "undefined" && typeof tmp_marker.map !== "undefined") {
                        tmp_marker.setMap(null);
                    }
                    returned_data = JSON.parse(response);

                    marker_id = returned_data.marker_id;
                    marker_data = returned_data.marker_data[marker_id];
                    wpgmaps_localize_marker_data[marker_id] = marker_data;
                    marker_data.map = MYMAP.map;

                    marker_data.point = new google.maps.LatLng(wpgm_lat,wpgm_lng);

                    add_marker(marker_data);

                    //wpgmza_InitMap();
                    jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
                    jQuery("#wpgmza_addmarker").show();
                    jQuery("#wpgmza_addmarker_loading").hide();
                    jQuery("#wpgmza_add_address").val("");
                    jQuery("#wpgmza_animation").val("0");
                    jQuery("#wpgmza_infoopen").val("0");
                    wpgmza_reinitialisetbl();
                    
                    MYMAP.map.setCenter(marker_data.point);
                    marker_added = false;
                    
                    if( jQuery("#wpgmaps_marker_cache_reminder").length > 0 ){

                        jQuery("#wpgmaps_marker_cache_reminder").fadeIn();

                    }

                    
                });
            } else { 
                geocoder.geocode ({ 'address': wpgm_address }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {

                        wpgm_gps = String(results[0].geometry.location);
                        var latlng1 = wpgm_gps.replace("(","");
                        var latlng2 = latlng1.replace(")","");
                        var latlngStr = latlng2.split(",",2);
                        wpgm_lat = parseFloat(latlngStr[0]);
                        wpgm_lng = parseFloat(latlngStr[1]);


                        var data = {
                            action: 'add_marker',
                            security: wpgmaps_nonce,
                            map_id: wpgmaps_mapid,
                            address: wpgm_address,
                            lat: wpgm_lat,
                            lng: wpgm_lng,
                            infoopen: wpgm_infoopen,
                            anim: wpgm_anim 
                        };
                        jQuery.post(ajaxurl, data, function(response) {
                            returned_data = JSON.parse(response);

                            marker_id = returned_data.marker_id;
                            marker_data = returned_data.marker_data[marker_id];
                            wpgmaps_localize_marker_data[marker_id] = marker_data;
                            marker_data.map = MYMAP.map;

                            marker_data.point = new google.maps.LatLng(wpgm_lat,wpgm_lng);
                            add_marker(marker_data);

                            jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
                            jQuery("#wpgmza_addmarker").show();
                            jQuery("#wpgmza_addmarker_loading").hide();
                            jQuery("#wpgmza_add_address").val("");
                            jQuery("#wpgmza_animation").val("0");
                            jQuery("#wpgmza_infoopen").val("0");
                            wpgmza_reinitialisetbl();
                            var myLatLng = new google.maps.LatLng(wpgm_lat,wpgm_lng);
                            MYMAP.map.setCenter(myLatLng);
                            marker_added = false;

                            if( jQuery("#wpgmaps_marker_cache_reminder").length > 0 ){

                                jQuery("#wpgmaps_marker_cache_reminder").fadeIn();
                                
                            }
                        });
                        

                    } else {
                        alert("Geocode was not successful for the following reason: " + status);
                        jQuery("#wpgmza_addmarker").show();
                        jQuery("#wpgmza_addmarker_loading").hide();

                    }
                });
            }
        });


        jQuery("#wpgmza_editmarker").click(function(){

            jQuery("#wpgmza_editmarker_div").hide();
            jQuery("#wpgmza_editmarker_loading").show();


            var wpgm_edit_id;
            wpgm_edit_id = parseInt(jQuery("#wpgmza_edit_id").val());
            var wpgm_address = "0";
            var wpgm_gps = "0";
            var wpgm_anim = "0";
            var wpgm_infoopen = "0";
            if (document.getElementsByName("wpgmza_add_address").length > 0) { wpgm_address = jQuery("#wpgmza_add_address").val(); }
            
            var do_geocode;
            if (wpgm_address === wpgmza_edit_address) {
                do_geocode = false;
                var wpgm_lat = wpgmza_edit_lat;
                var wpgm_lng = wpgmza_edit_lng;
            } else { 
                do_geocode = true;
            }
            
            if (document.getElementsByName("wpgmza_animation").length > 0) { wpgm_anim = jQuery("#wpgmza_animation").val(); }
            if (document.getElementsByName("wpgmza_infoopen").length > 0) { wpgm_infoopen = jQuery("#wpgmza_infoopen").val(); }

            if (do_geocode === true) {

            geocoder.geocode( { 'address': wpgm_address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    wpgm_gps = String(results[0].geometry.location);
                    var latlng1 = wpgm_gps.replace("(","");
                    var latlng2 = latlng1.replace(")","");
                    var latlngStr = latlng2.split(",",2);
                    var wpgm_lat = parseFloat(latlngStr[0]);
                    var wpgm_lng = parseFloat(latlngStr[1]);

                    var data = {
                        action: 'edit_marker',
                        security: wpgmaps_nonce,
                        map_id: wpgmaps_mapid,
                        edit_id: wpgm_edit_id,
                        address: wpgm_address,
                        lat: wpgm_lat,
                        lng: wpgm_lng,
                        anim: wpgm_anim,
                        infoopen: wpgm_infoopen
                    };

                    jQuery.post(ajaxurl, data, function(response) {
                        returned_data = JSON.parse(response);
                        marker_id = returned_data.marker_id;
                        marker_data = returned_data.marker_data[marker_id];
                        wpgmaps_localize_marker_data[marker_id] = marker_data;
                        marker_data.map = MYMAP.map;

                        marker_data.point = new google.maps.LatLng(wpgm_lat,wpgm_lng);

                        add_marker(marker_data);
                        
                        jQuery("#wpgmza_add_address").val("");
                        jQuery("#wpgmza_add_title").val("");
                        jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
                        jQuery("#wpgmza_addmarker_div").show();
                        jQuery("#wpgmza_editmarker_loading").hide();
                        jQuery("#wpgmza_edit_id").val("");
                        wpgmza_reinitialisetbl();
                        marker_added = false;

                        if( jQuery("#wpgmaps_marker_cache_reminder").length > 0 ){

                            jQuery("#wpgmaps_marker_cache_reminder").fadeIn();

                        }
                    });

                } else {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });
            } else {
                /* address was the same, no need for geocoding */
                var data = {
                        action: 'edit_marker',
                        security: wpgmaps_nonce,
                        map_id: wpgmaps_mapid,
                        edit_id: wpgm_edit_id,
                        address: wpgm_address,
                        lat: wpgm_lat,
                        lng: wpgm_lng,
                        anim: wpgm_anim,
                        infoopen: wpgm_infoopen
                    };

                    jQuery.post(ajaxurl, data, function(response) {
                        returned_data = JSON.parse(response);
                        marker_id = returned_data.marker_id;
                        marker_data = returned_data.marker_data[marker_id];
                        
                        wpgmaps_localize_marker_data[marker_id] = marker_data;
                        marker_data.map = MYMAP.map;

                        marker_data.point = new google.maps.LatLng(wpgm_lat,wpgm_lng);

                        add_marker(marker_data);
                        
                        jQuery("#wpgmza_add_address").val("");
                        jQuery("#wpgmza_add_title").val("");
                        jQuery("#wpgmza_marker_holder").html(JSON.parse(response).table_html);
                        jQuery("#wpgmza_addmarker_div").show();
                        jQuery("#wpgmza_editmarker_loading").hide();
                        jQuery("#wpgmza_edit_id").val("");
                        wpgmza_reinitialisetbl();
                        marker_added = false;
                        if( jQuery("#wpgmaps_marker_cache_reminder").length > 0 ){

                            jQuery("#wpgmaps_marker_cache_reminder").fadeIn();

                        }
                    });
            }



        });
    });

});

var MYMAP = {
    map: null,
    bounds: null
}

if (wpgmaps_localize_global_settings['wpgmza_settings_map_draggable'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_draggable']) { wpgmza_settings_map_draggable = true; } else { wpgmza_settings_map_draggable = false;  }
if (wpgmaps_localize_global_settings['wpgmza_settings_map_clickzoom'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_clickzoom']) { wpgmza_settings_map_clickzoom = false; } else { wpgmza_settings_map_clickzoom = true; }
if (wpgmaps_localize_global_settings['wpgmza_settings_map_scroll'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_scroll']) { wpgmza_settings_map_scroll = true; } else { wpgmza_settings_map_scroll = false; }
if (wpgmaps_localize_global_settings['wpgmza_settings_map_zoom'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_zoom']) { wpgmza_settings_map_zoom = true; } else { wpgmza_settings_map_zoom = false; }
if (wpgmaps_localize_global_settings['wpgmza_settings_map_pan'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_pan']) { wpgmza_settings_map_pan = true; } else { wpgmza_settings_map_pan = false; }
if (wpgmaps_localize_global_settings['wpgmza_settings_map_type'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_type']) { wpgmza_settings_map_type = true; } else { wpgmza_settings_map_type = false; }
if (wpgmaps_localize_global_settings['wpgmza_settings_map_streetview'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_streetview']) { wpgmza_settings_map_streetview = true; } else { wpgmza_settings_map_streetview = false; }
if (wpgmaps_localize_global_settings['wpgmza_settings_map_full_screen_control'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_full_screen_control']) { wpgmza_settings_map_full_screen_control = true; } else { wpgmza_settings_map_full_screen_control = false; }

if ('undefined' === typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_max_zoom'] || wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_max_zoom'] === "") { wpgmza_max_zoom = 0; } else { wpgmza_max_zoom = parseInt(wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_max_zoom']); }
if ('undefined' === typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_min_zoom'] || wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_min_zoom'] === "") { wpgmza_min_zoom = 21; } else { wpgmza_min_zoom = parseInt(wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_min_zoom']); }


MYMAP.init = function(selector, latLng, zoom) {

    if (typeof wpgmaps_localize[wpgmaps_mapid].type !== "undefined") {
        if (wpgmaps_localize[wpgmaps_mapid].type === "1") { maptype = google.maps.MapTypeId.ROADMAP; }
        else if (wpgmaps_localize[wpgmaps_mapid].type === "2") { maptype = google.maps.MapTypeId.SATELLITE; }
        else if (wpgmaps_localize[wpgmaps_mapid].type === "3") { maptype = google.maps.MapTypeId.HYBRID; }
        else if (wpgmaps_localize[wpgmaps_mapid].type === "4") { maptype = google.maps.MapTypeId.TERRAIN; }
        else { maptype = google.maps.MapTypeId.ROADMAP; }
    } else {
        maptype = google.maps.MapTypeId.ROADMAP;
    }

    var myOptions = {
        zoom:zoom,
        minZoom: wpgmza_max_zoom,
        maxZoom: wpgmza_min_zoom,
        center: latLng,
        zoomControl: wpgmza_settings_map_zoom,
        panControl: wpgmza_settings_map_pan,
        mapTypeControl: wpgmza_settings_map_type,
        streetViewControl: wpgmza_settings_map_streetview,
        draggable: wpgmza_settings_map_draggable,
        disableDoubleClickZoom: wpgmza_settings_map_clickzoom,
        scrollwheel: wpgmza_settings_map_scroll,
        fullscreenControl: wpgmza_settings_map_full_screen_control,
        mapTypeId: maptype
    }

    this.map = new google.maps.Map(jQuery(selector)[0], myOptions);
    this.bounds = new google.maps.LatLngBounds();


    if ("undefined" !== typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_theme_data'] && wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_theme_data'] !== false && wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_theme_data'] !== "") {
        wpgmza_theme_data = jQuery.parseJSON(wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_theme_data']);
        this.map.setOptions({styles: jQuery.parseJSON(wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_theme_data'])});
    } 
    google.maps.event.addListener(this.map, 'rightclick', function(event) {
        if (marker_added === false) {
            tmp_marker = new google.maps.Marker({
                position: event.latLng, 
                map: MYMAP.map
            });
            tmp_marker.setDraggable(true);
            google.maps.event.addListener(tmp_marker, 'dragend', function(event) { 
                jQuery("#wpgmza_add_address").val(event.latLng.lat()+', '+event.latLng.lng());
            } );
            jQuery("#wpgmza_add_address").val(event.latLng.lat()+', '+event.latLng.lng());
            jQuery("#wpgm_notice_message_save_marker").show();
            marker_added = true;
            setTimeout(function() {
                jQuery("#wpgm_notice_message_save_marker").fadeOut('slow')
            }, 3000);
        } else {
            jQuery("#wpgm_notice_message_addfirst_marker").fadeIn('fast')
            setTimeout(function() {
                jQuery("#wpgm_notice_message_addfirst_marker").fadeOut('slow')
            }, 3000);
        }
       
    });

    /*
    deprecated this in 6.4.00
    
    google.maps.event.addListener(this.map, 'zoom_changed', function() {
        zoomLevel = MYMAP.map.getZoom();

        jQuery("#wpgmza_start_zoom").val(zoomLevel);
        if (zoomLevel == 0) {
            MYMAP.map.setZoom(10);
        }
    });
    */
    jQuery( "#wpgmza_map").trigger( 'wpgooglemaps_loaded' );

    

    if (wpgmaps_localize_polygon_settings !== null) {
        if (typeof wpgmaps_localize_polygon_settings !== "undefined") {
              for(var poly_entry in wpgmaps_localize_polygon_settings) {
                add_polygon(poly_entry);
              }
        }
    }
    if (wpgmaps_localize_polyline_settings !== null) {
        if (typeof wpgmaps_localize_polyline_settings !== "undefined") {
              for(var poly_entry in wpgmaps_localize_polyline_settings) {
                add_polyline(poly_entry);
              }
        }
    }
    if (wpgmaps_localize[wpgmaps_mapid]['bicycle'] === "1") {
        var bikeLayer = new google.maps.BicyclingLayer();
        bikeLayer.setMap(MYMAP.map);
    }        
    if (wpgmaps_localize[wpgmaps_mapid]['traffic'] === "1") {
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(MYMAP.map);
    }    
    
    if ("undefined" !== typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['transport_layer'] && wpgmaps_localize[wpgmaps_mapid]['other_settings']['transport_layer'] === 1) {
        var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(MYMAP.map);
    }   
    
    google.maps.event.addListener(MYMAP.map, 'click', function() {
        close_infowindows();
    });
    
    
    google.maps.event.addListener(MYMAP.map, 'center_changed', function() {
        var location = MYMAP.map.getCenter();
        jQuery("#wpgmza_start_location").val(location.lat()+","+location.lng());
        jQuery("#wpgmaps_save_reminder").show();
    });

}


if (typeof wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width'] !== "undefined" && wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width'] !== "") { infoWindow.setOptions({maxWidth:wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width']}); }

google.maps.event.addDomListener(window, 'resize', function() {
    var myLatLng = new google.maps.LatLng(wpgmaps_localize[wpgmaps_mapid].map_start_lat,wpgmaps_localize[wpgmaps_mapid].map_start_lng);
    MYMAP.map.setCenter(myLatLng);
});


MYMAP.placeMarkers = function(filename,map_id,radius,searched_center,distance_type) {
    var check1 = 0;
    if (wpgmaps_localize_global_settings.wpgmza_settings_marker_pull === '1') {
        jQuery.get(filename, function(xml){
            jQuery(xml).find("marker").each(function(){
                var wpmgza_map_id = jQuery(this).find('map_id').text();

                if (wpmgza_map_id == map_id) {
                    var wpmgza_address = jQuery(this).find('address').text();
                    var lat = jQuery(this).find('lat').text();
                    var lng = jQuery(this).find('lng').text();
                    var wpmgza_anim = jQuery(this).find('anim').text();
                    var marker_id = jQuery(this).find('marker_id').text();
                    var wpmgza_infoopen = jQuery(this).find('infoopen').text();
                    var current_lat = jQuery(this).find('lat').text();
                    var current_lng = jQuery(this).find('lng').text();
                    var show_marker_radius = true;

                    if (radius !== null) {
                        if (check1 > 0 ) { } else { 


                            var point = new google.maps.LatLng(parseFloat(searched_center.lat()),parseFloat(searched_center.lng()));
                            MYMAP.bounds.extend(point);
                            if (typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['store_locator_bounce'] === "undefined" || wpgmaps_localize[wpgmaps_mapid]['other_settings']['store_locator_bounce'] === 1) {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP.map,
                                        animation: google.maps.Animation.BOUNCE
                                });
                            } else { /* dont show icon */ }
                            if (distance_type === "1") {
                                var populationOptions = {
                                      strokeColor: '#FF0000',
                                      strokeOpacity: 0.25,
                                      strokeWeight: 2,
                                      fillColor: '#FF0000',
                                      fillOpacity: 0.15,
                                      map: MYMAP.map,
                                      center: point,
                                      radius: parseInt(radius / 0.000621371)
                                    };
                            } else {
                                var populationOptions = {
                                      strokeColor: '#FF0000',
                                      strokeOpacity: 0.25,
                                      strokeWeight: 2,
                                      fillColor: '#FF0000',
                                      fillOpacity: 0.15,
                                      map: MYMAP.map,
                                      center: point,
                                      radius: parseInt(radius / 0.001)
                                    };
                            }
                            
                            cityCircle = new google.maps.Circle(populationOptions);
                            check1 = check1 + 1;
                        }
                        var R = 0;
                        if (distance_type === "1") {
                            R = 3958.7558657440545; 
                        } else {
                            R = 6378.16; 
                        }
                        var dLat = toRad(searched_center.lat()-current_lat);
                        var dLon = toRad(searched_center.lng()-current_lng); 
                        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(current_lat)) * Math.cos(toRad(searched_center.lat())) * Math.sin(dLon/2) * Math.sin(dLon/2); 
                        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                        var d = R * c;
                        
                        if (d < radius) { show_marker_radius = true; } else { show_marker_radius = false; }
                    }



                    var point = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
                    MYMAP.bounds.extend(point);
                    if (show_marker_radius === true) {
                            marker_data = new Object();
                            marker_data.anim = wpmgza_anim;
                            marker_data.point = point;
                            marker_data.marker_id = marker_id;
                            marker_data.map = MYMAP.map;
                            marker_data.address = wpmgza_address;
                            marker_data.radius = radius;
                            marker_data.distance_type = distance_type;
                            marker_data.d = d;
                            marker_data.infoopen = wpmgza_infoopen;


                            add_marker(marker_data);

                    }
                }
            });

        });
    } else { 

        if (typeof wpgmaps_localize_marker_data !== "undefined") {
            jQuery.each(wpgmaps_localize_marker_data, function(i, val) {
                
                var wpmgza_map_id = val.map_id;

                    if (wpmgza_map_id == map_id) {
                        
                        var wpmgza_address = val.address;
                        var marker_id = val.marker_id;
                        var wpmgza_anim = val.anim;
                        var wpmgza_infoopen = val.infoopen;
                        var lat = val.lat;
                        var lng = val.lng;
                        var point = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
                        
                       
                        var current_lat = val.lat;
                        var current_lng = val.lng;
                        var show_marker_radius = true;

                        if (radius !== null) {
                            if (check1 > 0 ) { } else { 


                                var point = new google.maps.LatLng(parseFloat(searched_center.lat()),parseFloat(searched_center.lng()));
                                MYMAP.bounds.extend(point);
                                if (typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['store_locator_bounce'] === "undefined" || wpgmaps_localize[wpgmaps_mapid]['other_settings']['store_locator_bounce'] === 1) {
                                    var marker = new google.maps.Marker({
                                            position: point,
                                            map: MYMAP.map,
                                            animation: google.maps.Animation.BOUNCE
                                    });
                                } else { /* dont show icon */ }
                                if (distance_type === "1") {
                                    var populationOptions = {
                                          strokeColor: '#FF0000',
                                          strokeOpacity: 0.25,
                                          strokeWeight: 2,
                                          fillColor: '#FF0000',
                                          fillOpacity: 0.15,
                                          map: MYMAP.map,
                                          center: point,
                                          radius: parseInt(radius / 0.000621371)
                                        };
                                } else {
                                    var populationOptions = {
                                          strokeColor: '#FF0000',
                                          strokeOpacity: 0.25,
                                          strokeWeight: 2,
                                          fillColor: '#FF0000',
                                          fillOpacity: 0.15,
                                          map: MYMAP.map,
                                          center: point,
                                          radius: parseInt(radius / 0.001)
                                        };
                                }
                                
                                cityCircle = new google.maps.Circle(populationOptions);
                                check1 = check1 + 1;
                            }
                            var R = 0;
                            if (distance_type === "1") {
                                R = 3958.7558657440545; 
                            } else {
                                R = 6378.16; 
                            }
                            var dLat = toRad(searched_center.lat()-current_lat);
                            var dLon = toRad(searched_center.lng()-current_lng); 
                            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(current_lat)) * Math.cos(toRad(searched_center.lat())) * Math.sin(dLon/2) * Math.sin(dLon/2); 
                            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                            var d = R * c;
                            
                            if (d < radius) { show_marker_radius = true; } else { show_marker_radius = false; }
                        }

                        

                        var point = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
                        MYMAP.bounds.extend(point);
                        if (show_marker_radius === true) {
                            marker_data = new Object();
                            marker_data.anim = wpmgza_anim;
                            marker_data.point = point;
                            marker_data.marker_id = marker_id;
                            marker_data.map = MYMAP.map;
                            marker_data.address = wpmgza_address;
                            marker_data.radius = radius;
                            marker_data.distance_type = distance_type;
                            marker_data.d = d;
                            marker_data.infoopen = wpmgza_infoopen;



                            add_marker(marker_data);

                          
                        }
                    }
            });
        }
    }
}


function add_marker(marker_data) {


    if (typeof wpgmaps_markers_array[marker_data.marker_id] !== "undefined") {
        wpgmaps_markers_array[marker_data.marker_id].setMap(null);
    }

    marker_data.marker_id = parseInt(marker_data.marker_id);

    if (marker_data.anim === "1") { marker_animation_type = google.maps.Animation.BOUNCE; }
    else if (marker_data.anim === "2") { marker_animation_type = google.maps.Animation.DROP; }
    else {  marker_animation_type = null; } 
    

    wpgmaps_markers_array[marker_data.marker_id] = new google.maps.Marker({
        position: marker_data.point,
        map: MYMAP.map,
        animation: marker_animation_type
    });


    var d_string = "";

    if (typeof marker_data.radius !== "undefined" && marker_data.radius !== null) {                                 
        if (marker_data.distance_type === "1") {
            d_string = "<p style='min-width:100px; display:block;'>"+Math.round(marker_data.d,2)+" "+wpgmaps_lang_m_away+"</p>"; 
        } else {
            d_string = "<p style='min-width:100px; display:block;'>"+Math.round(marker_data.d,2)+" "+wpgmaps_lang_km_away+"</p>";
        }
    } else { d_string = ''; }
    infoWindow[marker_data.marker_id] = new google.maps.InfoWindow();
    var html='<span style=\'min-width:100px; display:block;\'>'+marker_data.address+'</span>'+d_string;
    if (marker_data.infoopen === "1") {
        infoWindow[marker_data.marker_id].setContent(html);
        infoWindow[marker_data.marker_id].open(marker_data.map, wpgmaps_markers_array[marker_data.marker_id]);
    }
    temp_actiontype = 'click';
    if (typeof wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by !== "undefined" && wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by == '2') {
        temp_actiontype = 'mouseover';
    }
    google.maps.event.addListener(wpgmaps_markers_array[marker_data.marker_id], temp_actiontype, function() {
        close_infowindows();
        infoWindow[marker_data.marker_id].setContent(html);
        infoWindow[marker_data.marker_id].open(marker_data.map, wpgmaps_markers_array[marker_data.marker_id]);
    });

}
function close_infowindows() {
    infoWindow.forEach(function(entry,index) {
        infoWindow[index].close();
    });
}

function add_polygon(polygonid) {
    var tmp_data = wpgmaps_localize_polygon_settings[polygonid];
     var current_poly_id = polygonid;
     var tmp_polydata = tmp_data['polydata'];
     var WPGM_PathData = new Array();
     for (tmp_entry2 in tmp_polydata) {
         if (typeof tmp_polydata[tmp_entry2][0] !== "undefined") {
            
            WPGM_PathData.push(new google.maps.LatLng(tmp_polydata[tmp_entry2][0], tmp_polydata[tmp_entry2][1]));
        }
     }
     if (tmp_data['lineopacity'] === null || tmp_data['lineopacity'] === "") {
         tmp_data['lineopacity'] = 1;
     }
     
     var bounds = new google.maps.LatLngBounds();
     for (i = 0; i < WPGM_PathData.length; i++) {
       bounds.extend(WPGM_PathData[i]);
     }

    WPGM_Path_Polygon[polygonid] = new google.maps.Polygon({
         path: WPGM_PathData,
         clickable: true, /* must add option for this */ 
         strokeColor: "#"+tmp_data['linecolor'],
         fillOpacity: tmp_data['opacity'],
         strokeOpacity: tmp_data['lineopacity'],
         fillColor: "#"+tmp_data['fillcolor'],
         strokeWeight: 2,
         map: MYMAP.map
   });
   WPGM_Path_Polygon[polygonid].setMap(MYMAP.map);

    polygon_center = bounds.getCenter();

    if (tmp_data['title'] !== "") {
     infoWindow_poly[polygonid] = new google.maps.InfoWindow();
     google.maps.event.addListener(WPGM_Path_Polygon[polygonid], 'click', function(event) {
         infoWindow_poly[polygonid].setPosition(event.latLng);
         content = "";
         if (tmp_data['link'] !== "") {
             var content = "<a href='"+tmp_data['link']+"'>"+tmp_data['title']+"</a>";
         } else {
             var content = tmp_data['title'];
         }
         infoWindow_poly[polygonid].setContent(content);
         infoWindow_poly[polygonid].open(MYMAP.map,this.position);
     }); 
    }


    
}
function add_polyline(polyline) {
    
    
    var tmp_data = wpgmaps_localize_polyline_settings[polyline];

    var current_poly_id = polyline;
    var tmp_polydata = tmp_data['polydata'];
    var WPGM_Polyline_PathData = new Array();
    for (tmp_entry2 in tmp_polydata) {
        if (typeof tmp_polydata[tmp_entry2][0] !== "undefined" && typeof tmp_polydata[tmp_entry2][1] !== "undefined") {
            var lat = tmp_polydata[tmp_entry2][0].replace(')', '');
            lat = lat.replace('(','');
            var lng = tmp_polydata[tmp_entry2][1].replace(')', '');
            lng = lng.replace('(','');
            WPGM_Polyline_PathData.push(new google.maps.LatLng(lat, lng));
        }
         
         
    }
     if (tmp_data['lineopacity'] === null || tmp_data['lineopacity'] === "") {
         tmp_data['lineopacity'] = 1;
     }

    WPGM_Path[polyline] = new google.maps.Polyline({
         path: WPGM_Polyline_PathData,
         strokeColor: "#"+tmp_data['linecolor'],
         strokeOpacity: tmp_data['opacity'],
         strokeWeight: tmp_data['linethickness'],
         map: MYMAP.map
   });
   WPGM_Path[polyline].setMap(MYMAP.map);
    
    
}
