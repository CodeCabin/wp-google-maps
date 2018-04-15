var WPGM_Path_Polygon = new Array();
var WPGM_Path = new Array();
var infoWindow_poly = Array();
var marker_array = Array();
var marker_sl = null;

for (var entry in wpgmaps_localize) {
    if ('undefined' === typeof window.jQuery) {
        setTimeout(function(){ document.getElementById('wpgmza_map').innerHTML = 'Error: In order for WP Google Maps to work, jQuery must be installed. A check was done and jQuery was not present. Please see the <a href="http://www.wpgmaps.com/documentation/troubleshooting/jquery-troubleshooting/" title="WP Google Maps - jQuery Troubleshooting">jQuery troubleshooting section of our site</a> for more information.'; }, 5000);
    }
}

function wpgmza_parse_theme_data(raw)
{
	
	var json;
	
	try{
		json = JSON.parse(raw);
	}catch(e) {
		try{
			json = eval(raw);
		}catch(e) {
			console.warn("Couldn't parse theme data");
			return [];
		}
	}
	
	return json;
}

function InitMap() {
	var myLatLng = new google.maps.LatLng(wpgmaps_localize[wpgmaps_mapid].map_start_lat,wpgmaps_localize[wpgmaps_mapid].map_start_lng);
	
	if(typeof wpgmza_override_zoom !== "undefined")
		MYMAP.init('#wpgmza_map', myLatLng, parseInt(wpgmza_override_zoom));
	else
		MYMAP.init('#wpgmza_map', myLatLng, parseInt(wpgmaps_localize[wpgmaps_mapid].map_start_zoom));
	
	UniqueCode=Math.round(Math.random()*10000);
	
	MYMAP.placeMarkers(wpgmaps_markerurl+'?u='+UniqueCode,wpgmaps_localize[wpgmaps_mapid].id,null,null,null);
	
	if(wpgmaps_localize[wpgmaps_mapid].other_settings.store_locator_style == 'modern')
	{
		MYMAP.modernStoreLocator = new WPGMZA.ModernStoreLocator(wpgmaps_mapid);
		wpgmza_create_places_autocomplete();
	}
}
jQuery(function() {
	
    jQuery(document).ready(function(){
        if (/1\.([0-7])\.([0-9])/.test(jQuery.fn.jquery)) {
            setTimeout(function(){ 
                document.getElementById('wpgmza_map').innerHTML = 'Error: Your version of jQuery is outdated. WP Google Maps requires jQuery version 1.7+ to function correctly. Go to Maps->Settings and check the box that allows you to over-ride your current jQuery to try eliminate this problem.';
            }, 6000);
        } else {
			
			// Fastclick adapation
			jQuery(document).on({'DOMNodeInserted': function() {
				jQuery('.pac-item, .pac-item span', this).addClass('needsclick');
				}
			}, '.pac-container');
			
			var temp;
			var selector = "#wpgmza_map";
			var mapElement = jQuery(selector);
			
			var width = wpgmaps_localize[wpgmaps_mapid]['map_width']+wpgmaps_localize[wpgmaps_mapid]['map_width_type'];
			var height = wpgmaps_localize[wpgmaps_mapid]['map_height']+wpgmaps_localize[wpgmaps_mapid]['map_height_type'];
			
			if((temp = mapElement.attr("data-shortcode-width")) != "inherit")
				width = temp;
			if((temp = mapElement.attr("data-shortcode-height")) != "inherit")
				height = temp;
			
            mapElement.css({
                width: width,
                height: height
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
if (wpgmaps_localize_global_settings['wpgmza_settings_map_full_screen_control'] === "" || 'undefined' === typeof wpgmaps_localize_global_settings['wpgmza_settings_map_full_screen_control']) { wpgmza_settings_map_full_screen_control = true; } else { wpgmza_settings_map_full_screen_control = false; }

if ('undefined' === typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_max_zoom'] || wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_max_zoom'] === "") { wpgmza_max_zoom = 0; } else { wpgmza_max_zoom = parseInt(wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_max_zoom']); }
if ('undefined' === typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_min_zoom'] || wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_min_zoom'] === "") { wpgmza_min_zoom = 21; } else { wpgmza_min_zoom = parseInt(wpgmaps_localize[wpgmaps_mapid]['other_settings']['map_min_zoom']); }

function wpgmza_create_places_autocomplete() {
	
	var elementExists = document.getElementById("addressInput");
	
	if (typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.places === 'object' && typeof google.maps.places.Autocomplete === 'function') {

		// user autofill
		if (elementExists !== null) {
			if (typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_store_locator_restrict'] === "undefined" || wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_store_locator_restrict'] === "" )  {
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
				  { types: ['geocode'], componentRestrictions: {country: wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_store_locator_restrict']} });
				// When the user selects an address from the dropdown,
				// populate the address fields in the form.
				google.maps.event.addListener(autocomplete, 'place_changed', function() {
					fillInAddress();
				});                                                
			}
		} 
	}
}

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

    if(typeof wpgmza_force_greedy_gestures !== "undefined"){
        myOptions.gestureHandling = wpgmza_force_greedy_gestures;
    }
	
	// NB: Perry: Moved this block up here and altered it so it plays nicely with other maps styles settings
	if ("undefined" !== typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_theme_data'] && wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_theme_data'] !== false && wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_theme_data'] !== "") {
		if(!myOptions.styles)
			myOptions.styles = [];
		
		wpgmza_theme_data = wpgmza_parse_theme_data(wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_theme_data']);
        myOptions.styles = myOptions.styles.concat(wpgmza_theme_data);
    }

	if(!wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_show_points_of_interest'])
	{
		// Only create a new array if styles aren't set already, so no existing styles are overwritten
		if(!myOptions.styles)
			myOptions.styles = [];
		
		// Push a style to hide all points of interest
		myOptions.styles.push(
			{
				featureType: "poi",
				stylers: [{visibility: "off"}]
			}
		);
	}

	var element = jQuery(selector)[0];
    this.map = new google.maps.Map(element, myOptions);
    this.bounds = new google.maps.LatLngBounds();

	if(MYMAP.modernStoreLocator)
	{
		MYMAP.modernStoreLocator.element.index = 1;
		this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(MYMAP.modernStoreLocator.element);
		wpgmza_create_places_autocomplete();
	}
	
	/*var map = this.map;
	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center); 
	});*/
	
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
    
	if(window.wpgmza_circle_data_array) {
		window.circle_array = [];
		
		for(var circle_id in wpgmza_circle_data_array) {
			
			// Check that this belongs to the array itself, as opposed to its prototype, or else this will break if you add methods to the array prototype (please don't extend the native types)
			if(!wpgmza_circle_data_array.hasOwnProperty(circle_id))
				continue;
			
			add_circle(1, wpgmza_circle_data_array[circle_id]);
		}
	}
	
	if(window.wpgmza_rectangle_data_array) {
		window.rectangle_array = [];
		
		for(var rectangle_id in wpgmza_rectangle_data_array) {
			
			// Check that this belongs to the array itself, as opposed to its prototype, or else this will break if you add methods to the array prototype (please don't extend the native types)
			if(!wpgmza_rectangle_data_array.hasOwnProperty(rectangle_id))
				continue;
			
			add_rectangle(1, wpgmza_rectangle_data_array[rectangle_id]);
			
		}
	}

    google.maps.event.addListener(MYMAP.map, 'click', function() {
        infoWindow.close();
    });
    
    window.addEventListener("keydown", function(e) {
		var k = (e.which ? e.which : e.keyCode);
		if(k == 27)
			infoWindow.close();
	});
}

var infoWindow = new google.maps.InfoWindow();
if (typeof wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width'] !== "undefined" && wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width'] !== "") { infoWindow.setOptions({maxWidth:wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width']}); }

google.maps.event.addDomListener(window, 'resize', function() {
    var myLatLng = new google.maps.LatLng(wpgmaps_localize[wpgmaps_mapid].map_start_lat,wpgmaps_localize[wpgmaps_mapid].map_start_lng);
    MYMAP.map.setCenter(myLatLng);
});

if(!window.WPGMZA)
	window.WPGMZA = {};

WPGMZA.KM_PER_MILE = 1.60934;
WPGMZA.MILE_PER_KM = 0.621371;

WPGMZA.UNITS_MILES = 1;
WPGMZA.UNITS_KM = 2;

function wpgmza_get_zoom_from_radius(radius, units)
{
	// With thanks to Jeff Jason http://jeffjason.com/2011/12/google-maps-radius-to-zoom/
	
	if(units == WPGMZA.UNITS_MILES)
		radius *= WPGMZA.KM_PER_MILE;
	
	return Math.round(14-Math.log(radius)/Math.LN2);
}

var wpgmza_last_default_circle = null;

function wpgmza_show_store_locator_radius(map_id, center, radius, distance_type)
{
	switch(wpgmaps_localize[map_id].other_settings.wpgmza_store_locator_radius_style)
	{
		case "modern":
			if(MYMAP.modernStoreLocatorCircle)
				MYMAP.modernStoreLocatorCircle.destroy();
				
			MYMAP.modernStoreLocatorCircle = WPGMZA.ModernStoreLocatorCircle.createInstance(map_id);
			
			MYMAP.modernStoreLocatorCircle.setOptions({
				visible: true,
				center: center,
				radius: radius * (distance_type == 1 ? WPGMZA.KM_PER_MILE : 1),
				radiusString: radius
			});
			
			break;
		
		default:
			var options = {
				strokeColor: '#FF0000',
				strokeOpacity: 0.25,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.15,
				map: MYMAP.map,
				center: center
			};
			
			if (distance_type === "1")
				options.radius = parseInt(radius / 0.000621371);
			else
				options.radius = parseInt(radius / 0.001);

			if(typeof wpgmza_last_default_circle !== "undefined" && wpgmza_last_default_circle !== null){
				wpgmza_last_default_circle.setMap(null);
				wpgmza_last_default_circle = null;
			}

			wpgmza_last_default_circle = new google.maps.Circle(options);
			break;
	}
}

MYMAP.placeMarkers = function(filename,map_id,radius,searched_center,distance_type) {
    var check1 = 0,
        slNotFoundMessage = jQuery('.js-not-found-msg');
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
	                var wpmgza_marker_id = jQuery(this).find('marker_id').text();

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
	                            marker_sl = marker;
                            }
							
							wpgmza_show_store_locator_radius(map_id, point, radius, distance_type);
							
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
                        if (wpmgza_infoopen === "1" && !wpgmaps_localize_global_settings["wpgmza_settings_disable_infowindows"]) {
                            infoWindow.setContent(html);
                            infoWindow.open(MYMAP.map, marker);
                        }
                        temp_actiontype = 'click';
                        if (typeof wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by !== "undefined" && wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by == '2') {
                         	temp_actiontype = 'mouseover';
                        }
                        google.maps.event.addListener(marker, temp_actiontype, function() {
                            infoWindow.close();
							if(!wpgmaps_localize_global_settings["wpgmza_settings_disable_infowindows"])
							{
								infoWindow.setContent(html);
								infoWindow.open(MYMAP.map, marker);
							}
                        });

	                    marker_array[wpmgza_marker_id] = marker;
                    }
                }
            });

        });
    } else { 
	
        if (Object.keys(wpgmaps_localize_marker_data).length > 0) {
          var markerStoreLocatorsNum = 0;

          if (typeof wpgmaps_localize_marker_data !== "undefined") {

            jQuery.each(wpgmaps_localize_marker_data, function(i, val) {

                var wpmgza_map_id = val.map_id;

                    if (wpmgza_map_id == map_id) {

                        var wpmgza_address = val.address;
                        var wpmgza_anim = val.anim;
                        var wpmgza_infoopen = val.infoopen;
                        var lat = val.lat;
                        var lng = val.lng;
                        var point = new google.maps.LatLng(parseFloat(lat),parseFloat(lng));
	                    var wpmgza_marker_id = val.marker_id;


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
		                            marker_sl = marker;
	                            } else { /* dont show icon */ }
                               
								wpgmza_show_store_locator_radius(map_id, point, radius, distance_type);
							   
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

                            if (d < radius) {
                                show_marker_radius = true;
                                markerStoreLocatorsNum++;
                            } else {
                                show_marker_radius = false;
                            }
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
                            if (wpmgza_infoopen === "1" && !wpgmaps_localize_global_settings["wpgmza_settings_disable_infowindows"]) {
                                infoWindow.setContent(html);
                                infoWindow.open(MYMAP.map, marker);
                            }
	                        temp_actiontype = 'click';
	                        if (typeof wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by !== "undefined" && wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by == '2') {
	                         	temp_actiontype = 'mouseover';
	                        }
	                        google.maps.event.addListener(marker, temp_actiontype, function() {
	                            infoWindow.close();
								if(!wpgmaps_localize_global_settings["wpgmza_settings_disable_infowindows"])
								{
									infoWindow.setContent(html);
									infoWindow.open(MYMAP.map, marker);
								}
	                        });
	                        
	                        marker_array[wpmgza_marker_id] = marker;
                        }
                    }
            });

            if ('' !== jQuery('#addressInput').val() && markerStoreLocatorsNum < 1) {
                slNotFoundMessage.addClass('is-active');
                setTimeout(function () {
                    slNotFoundMessage.removeClass('is-active');
                }, 5000);
            }
        }
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
		 if(!wpgmaps_localize_global_settings["wpgmza_settings_disable_infowindows"])
		 {
			infoWindow_poly[polygonid].setContent(content);
			infoWindow_poly[polygonid].open(MYMAP.map,this.position);
		 }
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

wpgmza_create_places_autocomplete();


function searchLocations(map_id) {
    var address = document.getElementById("addressInput").value;
	
	if(address.length == 0)
	{
		document.getElementById("addressInput").focus();
		return;
	}
	
    var geocoder = new google.maps.Geocoder();

    if (typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_store_locator_restrict'] === "undefined" || wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_store_locator_restrict'] === "" )  {
	    geocoder.geocode({address: address}, function(results, status) {
	      if (status === google.maps.GeocoderStatus.OK) {
	           searchLocationsNear(map_id,results[0].geometry.location);
	      } else {
	           alert(address + ' not found');
	      }
	    });
	} else {
	    geocoder.geocode({address: address,componentRestrictions: {country: wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_store_locator_restrict']}}, function(results, status) {
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
    var distance_type = wpgmaps_localize[mapid].other_settings.store_locator_distance;
	
    var radius = document.getElementById('radiusSelect').value;
	var zoomie = wpgmza_get_zoom_from_radius(radius);

	MYMAP.map.setCenter(center_searched);
	MYMAP.map.setZoom(zoomie);
	if (typeof marker_array !== "undefined") {
		jQuery.each(marker_array,function(i,v){
			/* remove any instance of a marker first tio avoid using a full reinit which causes the map to flicker */
			if (typeof v !== 'undefined') {

				v.setMap(null);
				/* Check which map we are working on, and only reset the correct markers. (Store locator, etc) */
			}
		});
	}
	if (marker_sl !== null){
		marker_sl.setMap(null);
	}
    MYMAP.placeMarkers(wpgmaps_markerurl+'?u='+UniqueCode,wpgmaps_localize[wpgmaps_mapid].id,radius,center_searched,distance_type);
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

(function($) {
	
	if(!window.WPGMZA)
		window.WPGMZA = {};
	
	WPGMZA.hexToRgba = function(hex) {
		var c;
		if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
			c= hex.substring(1).split('');
			if(c.length== 3){
				c= [c[0], c[0], c[1], c[1], c[2], c[2]];
			}
			c= '0x'+c.join('');
			
			return {
				r: (c>>16)&255,
				g: (c>>8)&255,
				b: c&255,
				a: 1
			};
		}
		throw new Error('Bad Hex');
	}
	
	WPGMZA.rgbaToString = function(rgba) {
		return "rgba(" + rgba.r + ", " + rgba.g + ", " + rgba.b + ", " + rgba.a + ")";
	}
	
	WPGMZA.ModernStoreLocator = function(map_id) {
		var self = this;
		
		var original = $(".wpgmza_sl_search_button").closest(".wpgmza_sl_main_div");
		
		if(!original.length)
			return;
		
		// Build / re-arrange elements
		this.element = $("<div class='wpgmza-modern-store-locator'><div class='wpgmza-inner'><!--<i class='fas fa-bars'></i>--></div></div>")[0];
		
		var inner = $(this.element).find(".wpgmza-inner");
		
		MYMAP.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.element);
		
		inner.append($(original).find( "#addressInput" ));
		inner.append($(original).find( "select.wpgmza_sl_radius_select" ));
		
		// Buttons
		this.searchButton = $(original).find( ".wpgmza_sl_search_button" );
		inner.append(this.searchButton);
		
		this.resetButton = $(original).find( ".wpgmza_sl_reset_button_div>input" );
		inner.append(this.resetButton);
		
		// Distance type
		inner.append($("#wpgmza_distance_type_" + map_id));
		
		// Remove original element
		$(original).remove();
		
		// Event listeners
		$(this.element).find("input, select").on("focus", function() {
			$(inner).addClass("active");
		});
		
		$(this.element).find("input, select").on("blur", function() {
			$(inner).removeClass("active");
		});
	}

	WPGMZA.GoogleAPIErrorHandler = function() {
		var _error = console.error;
		
		console.error = function(message)
		{
			var m = message.match(/^Google Maps API error: (\w+) (.+)/);
			
			if(m)
			{
				var friendlyMessage = m[1].replace(/([A-Z])/g, " $1") + " - See " + m[2] + " for more information";
				alert(friendlyMessage);
			}
			
			_error.apply(this, arguments);
		}
	}
	
	WPGMZA.googleAPIErrorHandler = new WPGMZA.GoogleAPIErrorHandler();
	
	/**
	 * This module is the modern store locator circle
	 * @constructor
	 */
	WPGMZA.ModernStoreLocatorCircle = function(map_id, settings) {
		var self = this;
		
		this.map = MYMAP.map;
		
		this.canvasLayer = new CanvasLayer({
			map: this.map,
			resizeHandler: function(event) {
				self.onResize(event);
			},
			updateHandler: function(event) {
				self.onUpdate(event);
			},
			animate: true,
			resolutionScale: this.getResolutionScale()
        });
		
		this.settings = {
			center: new google.maps.LatLng(0, 0),
			radius: 1,
			color: "#63AFF2",
			
			shadowColor: "white",
			shadowBlur: 2,
			
			centerRingRadius: 10,
			centerRingLineWidth: 3,

			numInnerRings: 9,
			innerRingLineWidth: 1,
			innerRingFade: true,
			
			numOuterRings: 7,
			
			ringLineWidth: 1,
			
			mainRingLineWidth: 2,
			
			numSpokes: 6,
			spokesStartAngle: Math.PI / 2,
			
			numRadiusLabels: 6,
			radiusLabelsStartAngle: Math.PI / 2,
			radiusLabelFont: "13px sans-serif",
			
			visible: false
		};
		
		if(settings)
			this.setOptions(settings);
	}
	
	WPGMZA.ModernStoreLocatorCircle.createInstance = function(map_id, settings) {
		return new WPGMZA.ModernStoreLocatorCircle(map_id, settings);
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.destroy = function() {
		if(this.canvasLayer) {
			this.canvasLayer.setOptions({
				animate: false,
				updateHandler: null,
				resizeHandler: null,
				map: null
			});
		}
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.onResize = function(event) { 
		this.draw();
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.onUpdate = function(event) { 
		this.draw();
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.setOptions = function(options) {
		for(var name in options)
		{
			var functionName = "set" + name.substr(0, 1).toUpperCase() + name.substr(1);
			
			if(typeof this[functionName] == "function")
				this[functionName](options[name]);
			else
				this.settings[name] = options[name];
		}
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.getResolutionScale = function() {
		return window.devicePixelRatio || 1;
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.getCenter = function() {
		return this.getPosition();
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.setCenter = function(value) {
		this.setPosition(value);
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.getPosition = function() {
		return this.settings.center;
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.setPosition = function(position) {
		this.settings.center = position;
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.getRadius = function() {
		return this.settings.radius;
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.setRadius = function(radius) {
		this.settings.radius = radius;
		this.canvasLayer.scheduleUpdate();
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.getVisible = function(visible) {
		return this.settings.visible;
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.setVisible = function(visible) {
		this.settings.visible = visible;
		this.canvasLayer.scheduleUpdate();
	}
	
	/**
	 * This function transforms a km radius into canvas space
	 * @return number
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getTransformedRadius = function(km) {
		var multiplierAtEquator = 0.006395;
		var spherical = google.maps.geometry.spherical;
		
		var center = this.settings.center;
		var equator = new google.maps.LatLng({
			lat: 0.0,
			lng: 0.0
		});
		var latitude = new google.maps.LatLng({
			lat: center.lat(),
			lng: 0.0
		});
		
		var offsetAtEquator = spherical.computeOffset(equator, km * 1000, 90);
		var offsetAtLatitude = spherical.computeOffset(latitude, km * 1000, 90);
		
		var factor = offsetAtLatitude.lng() / offsetAtEquator.lng();
		
		return km * multiplierAtEquator * factor;
	}
	
	WPGMZA.ModernStoreLocatorCircle.prototype.draw = function() {
		// clear previous canvas contents
		var canvasLayer = this.canvasLayer;
		var settings = this.settings;
		
        var canvasWidth = canvasLayer.canvas.width;
        var canvasHeight = canvasLayer.canvas.height;
		
		var map = MYMAP.map;
		var resolutionScale = this.getResolutionScale();
		
		context = canvasLayer.canvas.getContext('2d');
		
        context.clearRect(0, 0, canvasWidth, canvasHeight);

		if(!settings.visible)
			return;
		
		context.shadowColor = settings.shadowColor;
		context.shadowBlur = settings.shadowBlur;
		
		// NB: 2018/02/13 - Left this here in case it needs to be calibrated more accurately
		/*if(!this.testCircle)
		{
			this.testCircle = new google.maps.Circle({
				strokeColor: "#ff0000",
				strokeOpacity: 0.5,
				strokeWeight: 3,
				map: this.map,
				center: this.settings.center
			});
		}
		
		this.testCircle.setCenter(settings.center);
		this.testCircle.setRadius(settings.radius * 1000);*/
		
        /* We need to scale and translate the map for current view.
         * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinates
         */
        var mapProjection = map.getProjection();

        /**
         * Clear transformation from last update by setting to identity matrix.
         * Could use context.resetTransform(), but most browsers don't support
         * it yet.
         */
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        // scale is just 2^zoom
        // If canvasLayer is scaled (with resolutionScale), we need to scale by
        // the same amount to account for the larger canvas.
        var scale = Math.pow(2, map.zoom) * resolutionScale;
        context.scale(scale, scale);

        /* If the map was not translated, the topLeft corner would be 0,0 in
         * world coordinates. Our translation is just the vector from the
         * world coordinate of the topLeft corder to 0,0.
         */
        var offset = mapProjection.fromLatLngToPoint(canvasLayer.getTopLeft());
        context.translate(-offset.x, -offset.y);

        // project rectLatLng to world coordinates and draw
        var worldPoint = mapProjection.fromLatLngToPoint(this.settings.center);
		var rgba = WPGMZA.hexToRgba(settings.color);
		var ringSpacing = this.getTransformedRadius(settings.radius) / (settings.numInnerRings + 1);
		
		// TODO: Implement gradients for color and opacity
		
		// Inside circle (fixed?)
        context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(
			worldPoint.x, 
			worldPoint.y, 
			this.getTransformedRadius(settings.centerRingRadius) / scale, 0, 2 * Math.PI
		);
		context.stroke();
		context.closePath();
		
		// Spokes
		var radius = this.getTransformedRadius(settings.radius) + (ringSpacing * settings.numOuterRings) + 1;
		var grad = context.createRadialGradient(0, 0, 0, 0, 0, radius);
		var rgba = WPGMZA.hexToRgba(settings.color);
		var start = WPGMZA.rgbaToString(rgba), end;
		var spokeAngle;
		
		rgba.a = 0;
		end = WPGMZA.rgbaToString(rgba);
		
		grad.addColorStop(0, start);
		grad.addColorStop(1, end);
		
		context.save();
		
		context.translate(worldPoint.x, worldPoint.y);
		context.strokeStyle = grad;
		context.lineWidth = 2 / scale;
		
		for(var i = 0; i < settings.numSpokes; i++)
		{
			spokeAngle = settings.spokesStartAngle + (Math.PI * 2) * (i / settings.numSpokes);
			
			x = Math.cos(spokeAngle) * radius;
			y = Math.sin(spokeAngle) * radius;
			
			context.setLineDash([2 / scale, 15 / scale]);
			
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(x, y);
			context.stroke();
		}
		
		context.setLineDash([]);
		
		context.restore();
		
		// Inner ringlets
		context.lineWidth = (1 / scale) * settings.innerRingLineWidth;
		
		for(var i = 1; i <= settings.numInnerRings; i++)
		{
			var radius = i * ringSpacing;
			
			if(settings.innerRingFade)
				rgba.a = 1 - (i - 1) / settings.numInnerRings;
			
			context.strokeStyle = WPGMZA.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		}
		
		// Main circle
		context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(worldPoint.x, worldPoint.y, this.getTransformedRadius(settings.radius), 0, 2 * Math.PI);
		context.stroke();
		context.closePath();
		
		// Outer ringlets
		var radius = radius + ringSpacing;
		for(var i = 0; i < settings.numOuterRings; i++)
		{
			if(settings.innerRingFade)
				rgba.a = 1 - i / settings.numOuterRings;
			
			context.strokeStyle = WPGMZA.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		
			radius += ringSpacing;
		}
		
		// Text
		if(settings.numRadiusLabels > 0)
		{
			var m;
			var radius = this.getTransformedRadius(settings.radius);
			var clipRadius = (12 * 1.1) / scale;
			var x, y;
			
			if(m = settings.radiusLabelFont.match(/(\d+)px/))
				clipRadius = (parseInt(m[1]) / 2 * 1.1) / scale;
			
			context.font = settings.radiusLabelFont;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = settings.color;
			
			context.save();
			
			context.translate(worldPoint.x, worldPoint.y)
			
			for(var i = 0; i < settings.numRadiusLabels; i++)
			{
				var spokeAngle = settings.radiusLabelsStartAngle + (Math.PI * 2) * (i / settings.numRadiusLabels);
				var textAngle = spokeAngle + Math.PI / 2;
				var text = settings.radiusString;
				var width;
				
				if(Math.sin(spokeAngle) > 0)
					textAngle -= Math.PI;
				
				x = Math.cos(spokeAngle) * radius;
				y = Math.sin(spokeAngle) * radius;
				
				context.save();
				
				context.translate(x, y);
				
				context.rotate(textAngle);
				context.scale(1 / scale, 1 / scale);
				
				width = context.measureText(text).width;
				height = width / 2;
				context.clearRect(-width, -height, 2 * width, 2 * height);
				
				context.fillText(settings.radiusString, 0, 0);
				
				context.restore();
			}
			
			context.restore();
		}
	}
	
})(jQuery);

function add_circle(mapid, data)
{
	data.map = MYMAP.map;
	
	if(!(data.center instanceof google.maps.LatLng)) {
		
		if(typeof data.center != "string")
			return;
		
		var m = data.center.match(/-?\d+(\.\d*)?/g);
		data.center = new google.maps.LatLng({
			lat: parseFloat(m[0]),
			lng: parseFloat(m[1]),
		});
	}
	
	data.radius = parseFloat(data.radius);
	data.fillColor = data.color;
	data.fillOpacity = parseFloat(data.opacity);
	
	data.strokeOpacity = 0;
	
	var circle = new google.maps.Circle(data);
	circle_array.push(circle);
}

function add_rectangle(mapid, data)
{
	data.map = MYMAP.map;
	
	data.fillColor = data.color;
	data.fillOpacity = parseFloat(data.opacity);
	
	var northWest = data.cornerA;
	var southEast = data.cornerB;
	
	var m = northWest.match(/-?\d+(\.\d+)?/g);
	var north = parseFloat(m[0]);
	var west = parseFloat(m[1]);
	
	m = southEast.match(/-?\d+(\.\d+)?/g);
	var south = parseFloat(m[0]);
	var east = parseFloat(m[1]);
	
	data.bounds = {
		north: north,
		west: west,
		south: south,
		east: east
	};
	
	data.strokeOpacity = 0;
	
	var rectangle = new google.maps.Rectangle(data);
	rectangle_array.push(rectangle);
}