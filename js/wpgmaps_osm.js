var WPGM_Path_Polygon = new Array();
var WPGM_Path = new Array();
var infoWindow_poly = Array();

for (var entry in wpgmaps_localize) {
    if ('undefined' === typeof window.jQuery) {
        setTimeout(function(){ document.getElementById('wpgmza_map').innerHTML = 'Error: In order for WP Google Maps to work, jQuery must be installed. A check was done and jQuery was not present. Please see the <a href="http://www.wpgmaps.com/documentation/troubleshooting/jquery-troubleshooting/" title="WP Google Maps - jQuery Troubleshooting">jQuery troubleshooting section of our site</a> for more information.'; }, 5000);
    }
}


function InitMap() {
    var myLatLng = [wpgmaps_localize[0].map_start_lat,wpgmaps_localize[0].map_start_lng];
	//var myLatLng = new google.maps.LatLng(wpgmaps_localize[0].map_start_lat,wpgmaps_localize[0].map_start_lng);
	if (typeof wpgmza_override_zoom !== "undefined") { MYMAP.init('#wpgmza_map', myLatLng, parseInt(wpgmza_override_zoom)); }
	else { MYMAP.init('#wpgmza_map', myLatLng, parseInt(wpgmaps_localize[0].map_start_zoom)); }	
	
	UniqueCode=Math.round(Math.random()*10000);
	
	//MYMAP.placeMarkers(wpgmaps_markerurl+'?u='+UniqueCode,wpgmaps_localize[0].id,null,null,null);
}
jQuery(function() {

    jQuery(document).ready(function(){
        if (/1\.(0|1|2|3|4|5|6|7)\.(0|1|2|3|4|5|6|7|8|9)/.test(jQuery.fn.jquery)) {
            setTimeout(function(){ 
                document.getElementById('wpgmza_map').innerHTML = 'Error: Your version of jQuery is outdated. WP Google Maps requires jQuery version 1.7+ to function correctly. Go to Maps->Settings and check the box that allows you to over-ride your current jQuery to try eliminate this problem.';
            }, 6000);
        } else {
            jQuery("#wpgmza_map").css({
                height:wpgmaps_localize[0]['map_height']+''+wpgmaps_localize[0]['map_height_type'],
                width:wpgmaps_localize[0]['map_width']+''+wpgmaps_localize[0]['map_width_type'],
                overflow:'none'
            });  
           	InitMap();
            jQuery('body').on('tabsactivate', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('tabsshow', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('accordionactivate', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.wpb_tabs_nav li', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.ui-tabs-nav li', function(event, ui) { InitMap(); });
            jQuery('body').on('click', '.tp-tabs li a', function(event, ui) { InitMap(); });
            jQuery('body').on('click', '.nav-tabs li a', function(event, ui) { InitMap(); });
            jQuery('body').on('click', '.vc_tta-panel-heading', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.ult_exp_section',function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.x-accordion-heading', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.x-nav-tabs li', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.tab-title', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.tab-link', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.et_pb_tabs_controls li', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.fusion-tab-heading', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.et_pb_tab', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.tri-tabs-nav span', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '.gdl-tabs li', function(){setTimeout(function(){InitMap();}, 500); });
            jQuery('body').on('click', '#tabnav  li', function(){setTimeout(function(){InitMap();}, 500); });
        }
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

if ('undefined' === typeof wpgmaps_localize[0]['other_settings']['map_max_zoom'] || wpgmaps_localize[0]['other_settings']['map_max_zoom'] === "") { wpgmza_max_zoom = 0; } else { wpgmza_max_zoom = parseInt(wpgmaps_localize[0]['other_settings']['map_max_zoom']); }
if ('undefined' === typeof wpgmaps_localize[0]['other_settings']['map_min_zoom'] || wpgmaps_localize[0]['other_settings']['map_min_zoom'] === "") { wpgmza_min_zoom = 21; } else { wpgmza_min_zoom = parseInt(wpgmaps_localize[0]['other_settings']['map_min_zoom']); }


MYMAP.init = function(selector, latLng, zoom) {


/*

	if (typeof wpgmaps_localize[0].type !== "undefined") {
		if (wpgmaps_localize[0].type === "1") { maptype = google.maps.MapTypeId.ROADMAP; }
		else if (wpgmaps_localize[0].type === "2") { maptype = google.maps.MapTypeId.SATELLITE; }
		else if (wpgmaps_localize[0].type === "3") { maptype = google.maps.MapTypeId.HYBRID; }
		else if (wpgmaps_localize[0].type === "4") { maptype = google.maps.MapTypeId.TERRAIN; }
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
        mapTypeId: maptype
    }
*/

    this.map = L.map(jQuery(selector)[0]).setView(latLng, zoom);
    //this.map = new google.maps.Map(jQuery(selector)[0], myOptions);
    //this.bounds = new google.maps.LatLngBounds();
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        id: 'mapbox.streets'
    }).addTo(this.map);

/*

	if ("undefined" !== typeof wpgmaps_localize[0]['other_settings']['wpgmza_theme_data'] && wpgmaps_localize[0]['other_settings']['wpgmza_theme_data'] !== false && wpgmaps_localize[0]['other_settings']['wpgmza_theme_data'] !== "") {
        wpgmza_theme_data = jQuery.parseJSON(wpgmaps_localize[0]['other_settings']['wpgmza_theme_data']);
        this.map.setOptions({styles: jQuery.parseJSON(wpgmaps_localize[0]['other_settings']['wpgmza_theme_data'])});
    } 
    
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
    if (wpgmaps_localize[0]['bicycle'] === "1") {
        var bikeLayer = new google.maps.BicyclingLayer();
        bikeLayer.setMap(MYMAP.map);
    }        
    if (wpgmaps_localize[0]['traffic'] === "1") {
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(MYMAP.map);
    }    
    
    if ("undefined" !== typeof wpgmaps_localize[0]['other_settings']['transport_layer'] && wpgmaps_localize[0]['other_settings']['transport_layer'] === 1) {
        var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(MYMAP.map);
	}   
    
    google.maps.event.addListener(MYMAP.map, 'click', function() {
        infoWindow.close();
    });
    
    
    
}

var infoWindow = new google.maps.InfoWindow();
if (typeof wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width'] !== "undefined" && wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width'] !== "") { infoWindow.setOptions({maxWidth:wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width']}); }

google.maps.event.addDomListener(window, 'resize', function() {
    var myLatLng = new google.maps.LatLng(wpgmaps_localize[0].map_start_lat,wpgmaps_localize[0].map_start_lng);
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
                    var wpmgza_infoopen = jQuery(this).find('infoopen').text();
                    var current_lat = jQuery(this).find('lat').text();
                    var current_lng = jQuery(this).find('lng').text();
                    var show_marker_radius = true;

                    if (radius !== null) {
                        if (check1 > 0 ) { } else { 


                            var point = new google.maps.LatLng(parseFloat(searched_center.lat()),parseFloat(searched_center.lng()));
                            MYMAP.bounds.extend(point);
                            if (typeof wpgmaps_localize[0]['other_settings']['store_locator_bounce'] === "undefined" || wpgmaps_localize[0]['other_settings']['store_locator_bounce'] === 1) {
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
                        if (wpmgza_anim === "1") {
                        var marker = new google.maps.Marker({
                                position: point,
                                map: MYMAP.map,
                                animation: google.maps.Animation.BOUNCE
                            });
                        }
                        else if (wpmgza_anim === "2") {
                            var marker = new google.maps.Marker({
                                    position: point,
                                    map: MYMAP.map,
                                    animation: google.maps.Animation.DROP
                            });
                        }
                        else {
                            var marker = new google.maps.Marker({
                                    position: point,
                                    map: MYMAP.map
                            });
                        }
                        var d_string = "";
                        if (radius !== null) {                                 
                            if (distance_type === "1") {
                                d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+wpgmaps_lang_m_away+"</p>"; 
                            } else {
                                d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+wpgmaps_lang_km_away+"</p>";
                            }
                        } else { d_string = ''; }


                        var html='<span style=\'min-width:100px; display:block;\'>'+wpmgza_address+'</span>'+d_string;
                        if (wpmgza_infoopen === "1") {
                            infoWindow.setContent(html);
                            infoWindow.open(MYMAP.map, marker);
                        }
                        temp_actiontype = 'click';
                        if (typeof wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by !== "undefined" && wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by == '2') {
                         	temp_actiontype = 'mouseover';
                        }
                        google.maps.event.addListener(marker, temp_actiontype, function() {
                            infoWindow.close();
                            infoWindow.setContent(html);
                            infoWindow.open(MYMAP.map, marker);
                        });
                    }
                }
            });

        });
    } else { 
        if (wpgmaps_localize_marker_data.length > 0) {
            jQuery.each(wpgmaps_localize_marker_data, function(i, val) {
                
                
                var wpmgza_map_id = val.map_id;

                    if (wpmgza_map_id == map_id) {
                        
                        var wpmgza_address = val.address;
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
	                            if (typeof wpgmaps_localize[0]['other_settings']['store_locator_bounce'] === "undefined" || wpgmaps_localize[0]['other_settings']['store_locator_bounce'] === 1) {
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
                            if (wpmgza_anim === "1") {
                            var marker = new google.maps.Marker({
                                    position: point,
                                    map: MYMAP.map,
                                    animation: google.maps.Animation.BOUNCE
                                });
                            }
                            else if (wpmgza_anim === "2") {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP.map,
                                        animation: google.maps.Animation.DROP
                                });
                            }
                            else {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP.map
                                });
                            }
                            var d_string = "";
	                        if (radius !== null) {                                 
	                            if (distance_type === "1") {
	                                d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+wpgmaps_lang_m_away+"</p>"; 
	                            } else {
	                                d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+wpgmaps_lang_km_away+"</p>";
	                            }
	                        } else { d_string = ''; }


                            var html='<span style=\'min-width:100px; display:block;\'>'+wpmgza_address+'</span>'+d_string;
                            if (wpmgza_infoopen === "1") {
                                infoWindow.setContent(html);
                                infoWindow.open(MYMAP.map, marker);
                            }
	                        temp_actiontype = 'click';
	                        if (typeof wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by !== "undefined" && wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by == '2') {
	                         	temp_actiontype = 'mouseover';
	                        }
	                        google.maps.event.addListener(marker, temp_actiontype, function() {
	                            infoWindow.close();
	                            infoWindow.setContent(html);
	                            infoWindow.open(MYMAP.map, marker);
	                        });
                        }
                    }
            });
        }
    }
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
    

jQuery("body").on("keypress","#addressInput", function(event) {
  if ( event.which == 13 ) {
     jQuery('.wpgmza_sl_search_button').trigger('click');
  }
});
var autocomplete;
function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();
}
var elementExists = document.getElementById("addressInput");
if (typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.places === 'object' && typeof google.maps.places.Autocomplete === 'function') {

    // user autofill
    if (elementExists !== null) {
        if (typeof wpgmaps_localize[0]['other_settings']['wpgmza_store_locator_restrict'] === "undefined" || wpgmaps_localize[0]['other_settings']['wpgmza_store_locator_restrict'] === "" )  {
            /* initialize the autocomplete form */
            autocomplete = new google.maps.places.Autocomplete(
              /** @type {HTMLInputElement} */(document.getElementById('addressInput')),
              { types: ['geocode'] });
            // When the user selects an address from the dropdown,
            // populate the address fields in the form.
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                fillInAddress();
            });
        } else {
            /* initialize the autocomplete form */                        
            autocomplete = new google.maps.places.Autocomplete(
              /** @type {HTMLInputElement} */(document.getElementById('addressInput')),
              { types: ['geocode'], componentRestrictions: {country: wpgmaps_localize[0]['other_settings']['wpgmza_store_locator_restrict']} });
            // When the user selects an address from the dropdown,
            // populate the address fields in the form.
            google.maps.event.addListener(autocomplete, 'place_changed', function() {
                fillInAddress();
            });                                                
        }
    } 
}


function searchLocations(map_id) {
    var address = document.getElementById("addressInput").value;
    var geocoder = new google.maps.Geocoder();

    if (typeof wpgmaps_localize[0]['other_settings']['wpgmza_store_locator_restrict'] === "undefined" || wpgmaps_localize[0]['other_settings']['wpgmza_store_locator_restrict'] === "" )  {
	    geocoder.geocode({address: address}, function(results, status) {
	      if (status === google.maps.GeocoderStatus.OK) {
	           searchLocationsNear(map_id,results[0].geometry.location);
	      } else {
	           alert(address + ' not found');
	      }
	    });
	} else {
	    geocoder.geocode({address: address,componentRestrictions: {country: wpgmaps_localize[0]['other_settings']['wpgmza_store_locator_restrict']}}, function(results, status) {
	      if (status === google.maps.GeocoderStatus.OK) {
	           searchLocationsNear(map_id,results[0].geometry.location);
	      } else {
	           alert(address + ' not found');
	      }
	    });
	}
}
function clearLocations() {
    infoWindow.close();
}
function searchLocationsNear(mapid,center_searched) {
    clearLocations();
    var distance_type = document.getElementById("wpgmza_distance_type").value;
    var radius = document.getElementById('radiusSelect').value;
    if (distance_type === "1") {
        if (radius === "1") { zoomie = 14; }
        else if (radius === "5") { zoomie = 12; }
        else if (radius === "10") { zoomie = 11; }
        else if (radius === "25") { zoomie = 9; }
        else if (radius === "50") { zoomie = 8; }
        else if (radius === "75") { zoomie = 8; }
        else if (radius === "100") { zoomie = 7; }
        else if (radius === "150") { zoomie = 7; }
        else if (radius === "200") { zoomie = 6; }
        else if (radius === "300") { zoomie = 6; }
        else { zoomie = 14; }
    } else {
        if (radius === "1") { zoomie = 14; }
        else if (radius === "5") { zoomie = 12; }
        else if (radius === "10") { zoomie = 11; }
        else if (radius === "25") { zoomie = 10; }
        else if (radius === "50") { zoomie = 9; }
        else if (radius === "75") { zoomie = 8; }
        else if (radius === "100") { zoomie = 8; }
        else if (radius === "150") { zoomie = 7; }
        else if (radius === "200") { zoomie = 7; }
        else if (radius === "300") { zoomie = 6; }
        else { zoomie = 14; }
    }
    MYMAP.init("#wpgmza_map", center_searched, zoomie, 3);
    MYMAP.placeMarkers(wpgmaps_markerurl+'?u='+UniqueCode,wpgmaps_localize[0].id,radius,center_searched,distance_type);
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}