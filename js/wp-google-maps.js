var MYMAP = new Array();
var WPGM_Path_Polygon = new Array();
var WPGM_Path = new Array();

if (markers && markers.length > 0 && markers !== "[]"){ 
    var db_marker_array = JSON.stringify(markers);
} else { 
    db_marker_array = '';
}
     
if ('undefined' === typeof window.jQuery) {
    setTimeout(function(){ 
        for(var entry in wpgmaps_localize) {
            document.getElementById('wpgmza_map_'+entry).innerHTML = wpgmza_jquery_error_string_1;
        }
    }, 3000);
} else {
    
}

jQuery(function() {


    jQuery(document).ready(function(){
        if (/1\.(0|1|2|3|4|5|6|7)\.(0|1|2|3|4|5|6|7|8|9)/.test(jQuery.fn.jquery)) {
            setTimeout(function(){ 
                for(var entry in wpgmaps_localize) {
                    document.getElementById('wpgmza_map_'+entry).innerHTML = wpgmza_jquery_error_string_2;
                }
            }, 3000);
        } else {

            for(var entry in wpgmaps_localize) {
                InitMap(wpgmaps_localize[entry]['id'],false);
            }
           
        }

    });

});


for(var entry in wpgmaps_localize) {

    MYMAP[entry] = {
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


    if ('undefined' === typeof wpgmaps_localize[entry]['other_settings']['map_max_zoom'] || wpgmaps_localize[entry]['other_settings']['map_max_zoom'] === "") { wpgmza_max_zoom = 0; } else { wpgmza_max_zoom = parseInt(wpgmaps_localize[entry]['other_settings']['map_max_zoom']); }

    MYMAP[entry].init = function(selector, latLng, zoom, maptype,mapid) {
        zoom = parseInt(zoom);
        if (maptype === "1") { 
            var myOptions = {
                zoom:zoom,
                minZoom: wpgmza_max_zoom,
                maxZoom: 21,
                center: latLng,
                draggable: wpgmza_settings_map_draggable,
                disableDoubleClickZoom: wpgmza_settings_map_clickzoom,
                scrollwheel: wpgmza_settings_map_scroll,
                zoomControl: wpgmza_settings_map_zoom,
                panControl: wpgmza_settings_map_pan,
                mapTypeControl: wpgmza_settings_map_type,
                streetViewControl: wpgmza_settings_map_streetview,
                mapTypeId: google.maps.MapTypeId.ROADMAP
              };
        }
        else if (maptype === "2") { 
            var myOptions = {
                zoom:zoom,
                minZoom: wpgmza_max_zoom,
                maxZoom: 21,
                center: latLng,
                draggable: wpgmza_settings_map_draggable,
                disableDoubleClickZoom: wpgmza_settings_map_clickzoom,
                scrollwheel: wpgmza_settings_map_scroll,
                zoomControl: wpgmza_settings_map_zoom,
                panControl: wpgmza_settings_map_pan,
                mapTypeControl: wpgmza_settings_map_type,
                streetViewControl: wpgmza_settings_map_streetview,
                mapTypeId: google.maps.MapTypeId.SATELLITE
              };

        }
        else if (maptype === "3") { 
            var myOptions = {
                zoom:zoom,
                minZoom: wpgmza_max_zoom,
                maxZoom: 21,
                center: latLng,
                draggable: wpgmza_settings_map_draggable,
                disableDoubleClickZoom: wpgmza_settings_map_clickzoom,
                scrollwheel: wpgmza_settings_map_scroll,
                zoomControl: wpgmza_settings_map_zoom,
                panControl: wpgmza_settings_map_pan,
                mapTypeControl: wpgmza_settings_map_type,
                streetViewControl: wpgmza_settings_map_streetview,
                mapTypeId: google.maps.MapTypeId.HYBRID
              };


        }
        else if (maptype === "4") { 
            var myOptions = {
                zoom:zoom,
                minZoom: wpgmza_max_zoom,
                maxZoom: 21,
                center: latLng,
                draggable: wpgmza_settings_map_draggable,
                disableDoubleClickZoom: wpgmza_settings_map_clickzoom,
                scrollwheel: wpgmza_settings_map_scroll,
                zoomControl: wpgmza_settings_map_zoom,
                panControl: wpgmza_settings_map_pan,
                mapTypeControl: wpgmza_settings_map_type,
                streetViewControl: wpgmza_settings_map_streetview,
                mapTypeId: google.maps.MapTypeId.TERRAIN
              };

        }
        else { 
            var myOptions = {
                zoom:zoom,
                minZoom: wpgmza_max_zoom,
                maxZoom: 21,
                center: latLng,
                draggable: wpgmza_settings_map_draggable,
                disableDoubleClickZoom: wpgmza_settings_map_clickzoom,
                scrollwheel: wpgmza_settings_map_scroll,
                zoomControl: wpgmza_settings_map_zoom,
                panControl: wpgmza_settings_map_pan,
                mapTypeControl: wpgmza_settings_map_type,
                streetViewControl: wpgmza_settings_map_streetview,
                mapTypeId: google.maps.MapTypeId.ROADMAP
              };


        }

        this.map = new google.maps.Map(jQuery(selector)[0], myOptions);
        this.bounds = new google.maps.LatLngBounds();
        jQuery( "#wpgmza_map_"+mapid).trigger( 'wpgooglemaps_loaded' );

        if ("undefined" !== typeof wpgmaps_localize[mapid]['other_settings']['wpgmza_theme_data'] && wpgmaps_localize[mapid]['other_settings']['wpgmza_theme_data'] !== false) {
           this.map.setOptions({styles: jQuery.parseJSON(wpgmaps_localize[mapid]['other_settings']['wpgmza_theme_data'])});
        } 


        /* insert polygon and polyline functionality */
        if (wpgmaps_localize_polygon_settings !== null) {
            if (typeof wpgmaps_localize_polygon_settings[mapid] !== "undefined") {
                  for(var poly_entry in wpgmaps_localize_polygon_settings[mapid]) {
                    add_polygon(mapid,poly_entry);
                  }
            }
        }
        if (wpgmaps_localize_polyline_settings !== null) {
            if (typeof wpgmaps_localize_polyline_settings[mapid] !== "undefined") {
                  for(var poly_entry in wpgmaps_localize_polyline_settings[mapid]) {
                    add_polyline(mapid,poly_entry);
                  }
            }
        }

        
        if (wpgmaps_localize[entry]['bicycle'] === "1") {
            var bikeLayer = new google.maps.BicyclingLayer();
            bikeLayer.setMap(this.map);
        }        
        if (wpgmaps_localize[entry]['traffic'] === "1") {
            var trafficLayer = new google.maps.TrafficLayer();
            trafficLayer.setMap(this.map);
        }  
        if (wpgmaps_localize[entry]['transport'] === "1") {
            var transitLayer = new google.maps.TransitLayer();
            transitLayer.setMap(this.map);
        }  
        

        
        google.maps.event.addListener(MYMAP[entry].map, 'click', function() {
            infoWindow.close();
        });
        
        
        
    }

    var infoWindow = new google.maps.InfoWindow();

    infoWindow.setOptions({maxWidth:wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width']});

    google.maps.event.addDomListener(window, 'resize', function() {
        var myLatLng = new google.maps.LatLng(wpgmza_lat,wpgmza_lng);
        MYMAP[entry].map.setCenter(myLatLng);
    });
    MYMAP[entry].placeMarkers = function(filename,map_id,radius,searched_center,distance_type) {
        var check1 = 0;
        if (marker_pull === '1') {
        
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
                                MYMAP[entry].bounds.extend(point);
                                
                                if (wpgmaps_localize[map_id]['other_settings']['store_locator_bounce'] === 1) {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP[entry].map,
                                        animation: google.maps.Animation.BOUNCE
                                });
                                } else { /* do nothing */ }

                                if (distance_type === "1") {
                                    var populationOptions = {
                                          strokeColor: '#FF0000',
                                          strokeOpacity: 0.25,
                                          strokeWeight: 2,
                                          fillColor: '#FF0000',
                                          fillOpacity: 0.15,
                                          map: MYMAP[entry].map,
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
                                          map: MYMAP[entry].map,
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
                        MYMAP[entry].bounds.extend(point);
                        if (show_marker_radius === true) {
                            if (wpmgza_anim === "1") {
                            var marker = new google.maps.Marker({
                                    position: point,
                                    map: MYMAP[entry].map,
                                    animation: google.maps.Animation.BOUNCE
                                });
                            }
                            else if (wpmgza_anim === "2") {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP[entry].map,
                                        animation: google.maps.Animation.DROP
                                });
                            }
                            else {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP[entry].map
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


                            var html='<p style=\'min-width:100px; display:block;\'>'+wpmgza_address+'</p>'+d_string;
                            if (wpmgza_infoopen === "1") {
                                infoWindow.setContent(html);
                                infoWindow.open(MYMAP[entry].map, marker);
                            }
                            
                            if (wpgmaps_localize_global_settings['wpgmza_settings_map_open_marker_by'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_open_marker_by'] || wpgmaps_localize_global_settings['wpgmza_settings_map_open_marker_by'] === '1') { 
                                google.maps.event.addListener(marker, 'click', function() {
                                    infoWindow.close();
                                    infoWindow.setContent(html);
                                    infoWindow.open(MYMAP[entry].map, marker);

                                });
                            } else {
                                google.maps.event.addListener(marker, 'mouseover', function() {
                                    infoWindow.close();
                                    infoWindow.setContent(html);
                                    infoWindow.open(MYMAP[entry].map, marker);

                                });   
                            }
                            
                        }
                    }
                });

            });
        } else { 
        
            if (db_marker_array.length > 0) {
                var dec_marker_array = jQuery.parseJSON(db_marker_array);
                jQuery.each(dec_marker_array, function(i, val) {
                    
                    
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
                                    MYMAP[entry].bounds.extend(point);
                                    if (wpgmaps_localize[map_id]['other_settings']['store_locator_bounce'] === 1) {
                                    var marker = new google.maps.Marker({
                                            position: point,
                                            map: MYMAP[entry].map,
                                            animation: google.maps.Animation.BOUNCE
                                    });
                                    } else { /* do nothing */ }



                                    if (distance_type === "1") {
                                        var populationOptions = {
                                              strokeColor: '#FF0000',
                                              strokeOpacity: 0.25,
                                              strokeWeight: 2,
                                              fillColor: '#FF0000',
                                              fillOpacity: 0.15,
                                              map: MYMAP[entry].map,
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
                                              map: MYMAP[entry].map,
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
                            MYMAP[entry].bounds.extend(point);
                            if (show_marker_radius === true) {
                                if (wpmgza_anim === "1") {
                                var marker = new google.maps.Marker({
                                        position: point,
                                        map: MYMAP[entry].map,
                                        animation: google.maps.Animation.BOUNCE
                                    });
                                }
                                else if (wpmgza_anim === "2") {
                                    var marker = new google.maps.Marker({
                                            position: point,
                                            map: MYMAP[entry].map,
                                            animation: google.maps.Animation.DROP
                                    });
                                }
                                else {
                                    var marker = new google.maps.Marker({
                                            position: point,
                                            map: MYMAP[entry].map
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


                                var html='<p style=\'min-width:100px; display:block;\'>'+wpmgza_address+'</p>'+d_string;
                                if (wpmgza_infoopen === "1") {
                                    infoWindow.setContent(html);
                                    infoWindow.open(MYMAP[entry].map, marker);
                                }

                                if (wpgmaps_localize_global_settings['wpgmza_settings_map_open_marker_by'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_open_marker_by'] || wpgmaps_localize_global_settings['wpgmza_settings_map_open_marker_by'] === '1') { 
                                    google.maps.event.addListener(marker, 'click', function() {
                                        infoWindow.close();
                                        infoWindow.setContent(html);
                                        infoWindow.open(MYMAP[entry].map, marker);

                                    });
                                } else {
                                    google.maps.event.addListener(marker, 'mouseover', function() {
                                        infoWindow.close();
                                        infoWindow.setContent(html);
                                        infoWindow.open(MYMAP[entry].map, marker);

                                    });   
                                }


                            }
                        }
                    
                    
                    
                    
                    
                });
            }


                    
        
        }
    }
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
    if (elementExists !== null) {
        /* initialize the autocomplete form */
        autocomplete = new google.maps.places.Autocomplete(
          /** @type {HTMLInputElement} */(document.getElementById('addressInput')),
          { types: ['geocode'] });
        // When the user selects an address from the dropdown,
        // populate the address fields in the form.
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
        fillInAddress();
        });
    } 
}

function add_polygon(mapid,polygonid) {
    var tmp_data = wpgmaps_localize_polygon_settings[mapid][polygonid];
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
         map: MYMAP[mapid].map
   });
   WPGM_Path_Polygon[polygonid].setMap(MYMAP[mapid].map);

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
         infoWindow_poly[polygonid].open(MYMAP[mapid].map,this.position);
     }); 
    }


   google.maps.event.addListener(WPGM_Path_Polygon[polygonid], "mouseover", function(event) {
         this.setOptions({fillColor: "#"+tmp_data['ohfillcolor']});
         this.setOptions({fillOpacity: tmp_data['ohopacity']});
         this.setOptions({strokeColor: "#"+tmp_data['ohlinecolor']});
         this.setOptions({strokeWeight: 2});
         this.setOptions({strokeOpacity: 0.9});
   });
   google.maps.event.addListener(WPGM_Path_Polygon[polygonid], "click", function(event) {

         this.setOptions({fillColor: "#"+tmp_data['ohfillcolor']});
         this.setOptions({fillOpacity: tmp_data['ohopacity']});
         this.setOptions({strokeColor: "#"+tmp_data['ohlinecolor']});
         this.setOptions({strokeWeight: 2});
         this.setOptions({strokeOpacity: 0.9});
   });
   google.maps.event.addListener(WPGM_Path_Polygon[polygonid], "mouseout", function(event) {
         this.setOptions({fillColor: "#"+tmp_data['fillcolor']});
         this.setOptions({fillOpacity: tmp_data['opacity']});
         this.setOptions({strokeColor: "#"+tmp_data['linecolor']});
         this.setOptions({strokeWeight: 2});
         this.setOptions({strokeOpacity: tmp_data['lineopacity']});
   });


       
    
    
}
function add_polyline(mapid,polyline) {
    
    
    var tmp_data = wpgmaps_localize_polyline_settings[mapid][polyline];

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
         map: MYMAP[mapid].map
   });
   WPGM_Path[polyline].setMap(MYMAP[mapid].map);
    
    
}



function searchLocations(map_id) {
    var address = document.getElementById("addressInput").value;
    var geocoder = new google.maps.Geocoder();

        checker = address.split(",");
        var wpgm_lat = "";
        var wpgm_lng = "";
        wpgm_lat = checker[0];
        wpgm_lng = checker[1];
        checker1 = parseFloat(checker[0]);
        checker2 = parseFloat(checker[1]);


        if (typeof wpgmaps_localize[map_id]['other_settings']['wpgmza_store_locator_restrict'] !== "undefined" && wpgmaps_localize[map_id]['other_settings']['wpgmza_store_locator_restrict'] != "") {
            if ((wpgm_lat.match(/[a-zA-Z]/g) === null && wpgm_lng.match(/[a-zA-Z]/g) === null) && checker.length === 2 && (checker1 != NaN && (checker1 <= 90 || checker1 >= -90)) && (checker2 != NaN && (checker2 <= 90 || checker2 >= -90))) {
                var point = new google.maps.LatLng(parseFloat(wpgm_lat),parseFloat(wpgm_lng));
                searchLocationsNear(map_id,point);
            }
            else {
                /* is an address, must geocode */
                geocoder.geocode({address: address,componentRestrictions: {country: wpgmaps_localize[map_id]['other_settings']['wpgmza_store_locator_restrict']}}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        searchLocationsNear(map_id,results[0].geometry.location);
                    } else {
                        alert(address + ' not found');
                    }
                });

            }
        } else {

            if ((typeof wpgm_lng !== "undefined" && wpgm_lat.match(/[a-zA-Z]/g) === null && wpgm_lng.match(/[a-zA-Z]/g) === null) && checker.length === 2 && (checker1 != NaN && (checker1 <= 90 || checker1 >= -90)) && (checker2 != NaN && (checker2 <= 90 || checker2 >= -90))) {
                var point = new google.maps.LatLng(parseFloat(wpgm_lat),parseFloat(wpgm_lng));
                searchLocationsNear(map_id,point);
            }
            else {
                /* is an address, must geocode */
            geocoder.geocode({address: address}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        searchLocationsNear(map_id,results[0].geometry.location);
                    } else {
                        alert(address + ' not found');
                    }
                });

            }

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
    MYMAP[mapid].init("#wpgmza_map_"+mapid, center_searched, zoomie, 3,mapid);
    MYMAP[mapid].placeMarkers(wpgmaps_markerurl+mapid+'markers.xml?u='+UniqueCode,mapid,radius,center_searched,distance_type);
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}



function InitMap(map_id,reinit) {
    
    jQuery("#wpgmza_map_"+map_id).css({
            height:wpgmaps_localize[map_id]['map_height']+''+wpgmaps_localize[map_id]['map_height_type'],
            width:wpgmaps_localize[map_id]['map_width']+''+wpgmaps_localize[map_id]['map_width_type']

    });
    var myLatLng = new google.maps.LatLng(wpgmza_lat,wpgmza_lng);
    MYMAP[map_id].init('#wpgmza_map_'+map_id, myLatLng, wpgmza_start_zoom, wpgmaps_localize['type'],map_id);
    UniqueCode=Math.round(Math.random()*10000);
    MYMAP[map_id].placeMarkers(wpgmaps_markerurl+map_id+'markers.xml?u='+UniqueCode,map_id,null,null,null);

    jQuery('body').on('tabsactivate', function(event, ui) {
        MYMAP[map_id].init('#wpgmza_map_'+map_id, myLatLng, wpgmza_start_zoom, wpgmaps_localize['type'],map_id);
        UniqueCode=Math.round(Math.random()*10000);
        MYMAP[map_id].placeMarkers(wpgmaps_markerurl+map_id+'markers.xml?u='+UniqueCode,map_id,null,null,null);
    });

    jQuery('body').on('click','.x-accordion-heading', function(){
        setTimeout(function(){
            MYMAP[map_id].init('#wpgmza_map_'+map_id, myLatLng, wpgmza_start_zoom, wpgmaps_localize['type'],map_id);
            UniqueCode=Math.round(Math.random()*10000);
            MYMAP[map_id].placeMarkers(wpgmaps_markerurl+map_id+'markers.xml?u='+UniqueCode,map_id,null,null,null);
        }, 100);
    });
    



    
   
};
