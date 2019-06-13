(function() {
	
	var temp = wpgmaps_mapid.wpgmza_legacy_current_map_id;
	window.wpgmaps_mapid = temp;
	
})();

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

function wpgmza_get_guid() 
{
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function wpgmza_open_info_window(infoWindow, content)
{
	var guid = wpgmza_get_guid();
	var div = $("<div hidden data-info-window-guid='" + guid + "'/>");
	
	wpgmza_init_infowindow();
	
	infoWindow.setContent(div);
	infoWindow.open();
	
	$("div[data-info-window-guid='" + guid + "']").trigger("infowindowopen.wpgmza");
}

function InitMap() {
	
	var $ = jQuery;
	
	if(WPGMZA.googleAPIStatus && WPGMZA.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN")
	{
		$("#wpgmza_map, .wpgmza_map").each(function(index, el) {
			$(el).append($(WPGMZA.api_consent_html));
			$(el).css({height: "auto"});
		});
		
		$("button.wpgmza-api-consent").on("click", function(event) {
			Cookies.set("wpgmza-api-consent-given", true);
			window.location.reload();
		});
		
		return;
	}
	
	var myLatLng = {
		lat: wpgmaps_localize[wpgmaps_mapid].map_start_lat,
		lng: wpgmaps_localize[wpgmaps_mapid].map_start_lng
	};
	
	if(typeof wpgmza_override_zoom !== "undefined")
		MYMAP.init('#wpgmza_map', myLatLng, parseInt(wpgmza_override_zoom));
	else
		MYMAP.init('#wpgmza_map', myLatLng, parseInt(wpgmaps_localize[wpgmaps_mapid].map_start_zoom));
	
	UniqueCode=Math.round(Math.random()*10000);
	
	MYMAP.placeMarkers(wpgmaps_markerurl+'?u='+UniqueCode,wpgmaps_localize[wpgmaps_mapid].id,null,null,null);
	
	if(wpgmaps_localize[wpgmaps_mapid].other_settings.store_locator_style == 'modern')
	{
		if(!MYMAP.map)
			return;
		
		MYMAP.modernStoreLocator = WPGMZA.ModernStoreLocator.createInstance(wpgmaps_mapid);
		wpgmza_create_places_autocomplete();
	}
}

jQuery(function($) {
	if (/1\.([0-7])\.([0-9])/.test(jQuery.fn.jquery))
		console.warn("You are running a version of jQuery which may not be compatible with WP Google Maps.");
	
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
	
	var element = document.getElementById("addressInput");
	
	if(!element)
		return;
	
	if(!window.google)
		return;
	
	if(!google.maps)
		return;
	
	if(!google.maps.places || !google.maps.places.Autocomplete)
		return;
	
	if(WPGMZA.settings.engine != "google-maps")
		return;
	
	var options = {
		fields: ["name", "formatted_address"],
		types: ["geocode"]
	};
	
	var restriction = wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_store_locator_restrict'];
	
	if(restriction)
		options.componentRestrictions = {
			country: restriction
		};
	
	autocomplete = new google.maps.places.Autocomplete(element, options);
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		fillInAddress();
	});
}

MYMAP.init = function(selector, latLng, zoom) {

	var maptype = null;
	
	if(window.google)
	{
		if (typeof wpgmaps_localize[wpgmaps_mapid].type !== "undefined") {
			if (wpgmaps_localize[wpgmaps_mapid].type === "1") { maptype = google.maps.MapTypeId.ROADMAP; }
			else if (wpgmaps_localize[wpgmaps_mapid].type === "2") { maptype = google.maps.MapTypeId.SATELLITE; }
			else if (wpgmaps_localize[wpgmaps_mapid].type === "3") { maptype = google.maps.MapTypeId.HYBRID; }
			else if (wpgmaps_localize[wpgmaps_mapid].type === "4") { maptype = google.maps.MapTypeId.TERRAIN; }
			else { maptype = google.maps.MapTypeId.ROADMAP; }
		} else {
			maptype = google.maps.MapTypeId.ROADMAP;
		}
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

    if(typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_auto_night'] != 'undefined' && wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_auto_night'] == 1 ){
    	
    	var date = new Date();
		var isNightTime = date.getHours() < 7 || date.getHours() > 19;

    	if(isNightTime) {
    		myOptions.styles = myOptions.styles.concat(WPGMZA.Map.nightTimeThemeData);
    	}
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
	
	// DIVI compatibility fix
	if(!element)
		return;
	
	element.setAttribute("data-map-id", 1);
	element.setAttribute("data-maps-engine", WPGMZA.settings.engine);
	this.map = WPGMZA.Map.createInstance(element, myOptions);
    this.bounds = new WPGMZA.LatLngBounds();

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
	
	if(WPGMZA.settings.engine == "google-maps")
	{
		if (wpgmaps_localize[wpgmaps_mapid]['bicycle'] === "1") {
			var bikeLayer = new google.maps.BicyclingLayer();
			bikeLayer.setMap(MYMAP.map.googleMap);
		}        
		if (wpgmaps_localize[wpgmaps_mapid]['traffic'] === "1") {
			var trafficLayer = new google.maps.TrafficLayer();
			trafficLayer.setMap(MYMAP.map.googleMap);
		}    
		
		if ("undefined" !== typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['transport_layer'] && wpgmaps_localize[wpgmaps_mapid]['other_settings']['transport_layer'] === 1) {
			var transitLayer = new google.maps.TransitLayer();
			transitLayer.setMap(MYMAP.map.googleMap);
		}   
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

	MYMAP.map.on("click", function(event) {
		if(event.target instanceof WPGMZA.Marker)
			return;
		
		if(window.infoWindow)
			infoWindow.close();
    });
    
    window.addEventListener("keydown", function(e) {
		var k = (e.which ? e.which : e.keyCode);
		if(k == 27)
			infoWindow.close();
	});
}

function wpgmza_init_infowindow()   
{
	if(!window.WPGMZA)
		return;
	
	window.infoWindow = WPGMZA.InfoWindow.createInstance();
	
	if(wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width'] && wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width'].length)
		infoWindow.setOptions({maxWidth: wpgmaps_localize_global_settings['wpgmza_settings_infowindow_width']});
}

function wpgmza_get_zoom_from_radius(radius, units)
{
	// With thanks to Jeff Jason http://jeffjason.com/2011/12/google-maps-radius-to-zoom/
	
	if(units == WPGMZA.Distance.MILES)
		radius *= WPGMZA.Distance.KILOMETERS_PER_MILE;
	
	return Math.round(14-Math.log(radius)/Math.LN2);
}

var wpgmza_last_default_circle = null;

function wpgmza_show_store_locator_radius(map_id, center, radius, distance_type)
{
	var style = wpgmaps_localize[map_id].other_settings.wpgmza_store_locator_radius_style;
	
	// Force legacy style on iOS, it appears CanvasLayer crashes some iOS devices
	if(WPGMZA.isDeviceiOS())
		style = "legacy";
	
	switch(style)
	{
		case "modern":
			if(MYMAP.modernStoreLocatorCircle)
				MYMAP.modernStoreLocatorCircle.destroy();
				
			MYMAP.modernStoreLocatorCircle = WPGMZA.ModernStoreLocatorCircle.createInstance(map_id);
			
			MYMAP.modernStoreLocatorCircle.setOptions({
				visible: true,
				center: center,
				radius: radius * (distance_type == 1 ? WPGMZA.Distance.KILOMETERS_PER_MILE : 1),
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
			
			if (distance_type == "1")
				options.radius = parseInt(radius / 0.000621371);
			else
				options.radius = parseInt(radius / 0.001);

			if(typeof wpgmza_last_default_circle !== "undefined" && wpgmza_last_default_circle !== null){
				wpgmza_last_default_circle.setMap(null);
				wpgmza_last_default_circle = null;
			}

			wpgmza_last_default_circle = WPGMZA.Circle.createInstance(options);
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
                        
                        var R = 0;
                        if (distance_type == "1") {
                            R = 3958.7558657440545; 
                        } else {
                            R = 6378.16; 
                        }
                        var dLat = toRad(searched_center.lat-current_lat);
                        var dLon = toRad(searched_center.lng-current_lng); 
                        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(current_lat)) * Math.cos(toRad(searched_center.lat)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
                        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                        var d = R * c;
                        
                        if (d < radius) { show_marker_radius = true; } else { show_marker_radius = false; }
                    }

					var point = new WPGMZA.LatLng(parseFloat(lat),parseFloat(lng));
					
                    // MYMAP.bounds.extend(point);
					
                    if (show_marker_radius === true) {
						
						var options = {
							position: point,
							map: MYMAP.map
						}
						
						if(wpmgza_anim)
							options.animation = wpmgza_anim;
						
						var marker = WPGMZA.Marker.createInstance(options);
						
                        var d_string = "";
                        if (radius !== null) {                                 
                            if (distance_type == "1") {
                                d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+wpgmaps_lang_m_away+"</p>"; 
                            } else {
                                d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+wpgmaps_lang_km_away+"</p>";
                            }
                        } else { d_string = ''; }


                        var html='<span style=\'min-width:100px; display:block;\'>'+wpmgza_address+'</span>'+d_string;
                        if (wpmgza_infoopen === "1" && !wpgmaps_localize_global_settings["wpgmza_settings_disable_infowindows"]) {
							
							if(!window.infoWindow)
								wpgmza_init_infowindow();
							
                            infoWindow.setContent(html);
                            infoWindow.open(MYMAP.map, marker);
                        }
						
                        temp_actiontype = 'click';
						
                        if (typeof wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by !== "undefined" && wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by == '2') {
                         	temp_actiontype = 'mouseover';
                        }
						
						if(WPGMZA.isTouchDevice())
							temp_actiontype = "click";
						
						marker.on(temp_actiontype, function() {
							if(window.infoWindow)
								infoWindow.close();
							if(!wpgmaps_localize_global_settings["wpgmza_settings_disable_infowindows"])
							{
								if(!window.infoWindow)
									wpgmza_init_infowindow();
								
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
						var point = new WPGMZA.LatLng(lat, lng);
	                    var wpmgza_marker_id = val.marker_id;


                        var current_lat = val.lat;
                        var current_lng = val.lng;
                        var show_marker_radius = true;

                        if (radius !== null) {
                            if (check1 > 0 ) { } else {


								var point = searched_center;
                                // MYMAP.bounds.extend(point);
	                            if (typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['store_locator_bounce'] === "undefined" || wpgmaps_localize[wpgmaps_mapid]['other_settings']['store_locator_bounce'] === 1) {
		                            var marker = WPGMZA.Marker.createInstance({
		                                    position: point,
		                                    map: MYMAP.map/*,
		                                    animation: google.maps.Animation.BOUNCE*/
		                            });
		                            marker_sl = marker;
	                            } else { /* dont show icon */ }
                               
								wpgmza_show_store_locator_radius(map_id, point, radius, distance_type);
							   
                                check1 = check1 + 1;
                            }
                            var R = 0;
                            if (distance_type == "1") {
                                R = 3958.7558657440545;
                            } else {
                                R = 6378.16;
                            }
                            var dLat = toRad(searched_center.lat-current_lat);
                            var dLon = toRad(searched_center.lng-current_lng);
                            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(current_lat)) * Math.cos(toRad(searched_center.lat)) * Math.sin(dLon/2) * Math.sin(dLon/2);
                            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                            var d = R * c;

                            if (d < radius) {
                                show_marker_radius = true;
                                markerStoreLocatorsNum++;
                            } else {
                                show_marker_radius = false;
                            }
                        }

                        var point = {
							lat: parseFloat(lat),
							lng: parseFloat(lng)
						};

						// Prevent JS error in Gutenberg editor (Temporary fix)
						if(WPGMZA.is_admin == "1")
							return;
						
                        if (show_marker_radius === true) {
							
							var marker = WPGMZA.Marker.createInstance({
								position: point,
								map: MYMAP.map
							});
							
							if(wpmgza_anim)
								marker.setAnimation(wpmgza_anim);
							
                            var d_string = "";
	                        if (radius !== null) {
	                            if (distance_type == "1") {
	                                d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+wpgmaps_lang_m_away+"</p>";
	                            } else {
	                                d_string = "<p style='min-width:100px; display:block;'>"+Math.round(d,2)+" "+wpgmaps_lang_km_away+"</p>";
	                            }
	                        } else { d_string = ''; }


                            var html='<span>'+wpmgza_address+'</span>'+d_string;
                            if (wpmgza_infoopen === "1" && !wpgmaps_localize_global_settings["wpgmza_settings_disable_infowindows"]) {
								wpgmza_init_infowindow();
								
                                infoWindow.setContent(html);
                                infoWindow.open(MYMAP.map, marker);
                            }
	                        temp_actiontype = 'click';
	                        if (typeof wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by !== "undefined" && wpgmaps_localize_global_settings.wpgmza_settings_map_open_marker_by == '2') {
	                         	temp_actiontype = 'mouseover';
	                        }
							
							if(WPGMZA.isTouchDevice())
								temp_actiontype = "click";
							
	                        //google.maps.event.addListener(marker, temp_actiontype, function() {
							marker.on(temp_actiontype, function(event) {
								/*if(window.infoWindow)
									infoWindow.close();
								if(!wpgmaps_localize_global_settings["wpgmza_settings_disable_infowindows"])
								{
									wpgmza_init_infowindow();
									
									infoWindow.setContent(html);
									infoWindow.open(MYMAP.map, marker);
								}*/
								
								this.openInfoWindow();
								this.infoWindow.setContent(html);
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
	
	if (check1 == 0 && radius) {
		var point = new WPGMZA.LatLng(parseFloat(searched_center.lat),parseFloat(searched_center.lng));
		// MYMAP.bounds.extend(point);
		if (typeof wpgmaps_localize[wpgmaps_mapid]['other_settings']['store_locator_bounce'] === "undefined" || wpgmaps_localize[wpgmaps_mapid]['other_settings']['store_locator_bounce'] === 1) {
			var marker = WPGMZA.Marker.createInstance({
				position: point,
				map: MYMAP.map,
				animation: WPGMZA.Marker.ANIMATION_BOUNCE
			})
			
			marker_sl = marker;
		}
		
		wpgmza_show_store_locator_radius(map_id, point, radius, distance_type);
		
		check1 = check1 + 1;
	}
}

function add_polygon(polygonid) {
	
	if(WPGMZA.settings.engine != "google-maps")
		return;
	
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
         map: MYMAP.map.googleMap
   });
   WPGM_Path_Polygon[polygonid].setMap(MYMAP.map.googleMap);

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
    
    if(WPGMZA.settings.engine != "google-maps")
		return;
	
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
         map: MYMAP.map.googleMap
   });
   WPGM_Path[polyline].setMap(MYMAP.map.googleMap);
    
    
}
    

jQuery("body").on("keypress","#addressInput", function(event) {
  if ( event.which == 13 ) {
     jQuery('.wpgmza_sl_search_button').trigger('click');
  }
});
var autocomplete;
function fillInAddress() {
  // Get the place details from the autocomplete object.
  //var place = autocomplete.getPlace();
}

jQuery(window).on("load", function() {
	wpgmza_create_places_autocomplete();
});


function searchLocations(map_id) {
    var address = document.getElementById("addressInput").value;
	
	if(address.length == 0)
	{
		document.getElementById("addressInput").focus();
		return;
	}
	
    //var geocoder = new google.maps.Geocoder();
	var geocoder = WPGMZA.Geocoder.createInstance();

	var options = {
		address: address
	};
	
	var restrict = wpgmaps_localize[wpgmaps_mapid]['other_settings']['wpgmza_store_locator_restrict'];
	if(restrict && restrict.length)
		options.componentRestrictions = {
			country: restrict
		};
	
	geocoder.geocode(options, function(results, status) {
		
		var event = {
			type: 		"storelocatorgeocodecomplete",
			results:	results,
			status:		status
		};
		
		MYMAP.map.trigger(event);
		
		if(status == WPGMZA.Geocoder.SUCCESS)
		{
			searchLocationsNear(map_id,results[0].geometry.location);
		}
		else
		{
			alert(address + ' not found');
		}
		
	});
}
function clearLocations() {
	if(window.infoWindow)
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
	
	var event = {
		type: 		"storelocatorresult",
		position:	center_searched
	};
	
	MYMAP.map.trigger(event);
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

(function($) {
	
	if(!window.WPGMZA)
		return;
	
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

	// GoogleAPIErrorHandler moved to /js/v8/google-api-error-handler.js
	
})(jQuery);

function add_circle(mapid, data)
{
	if(WPGMZA.settings.engine != "google-maps")
		return;
	
	data.map = MYMAP.map.googleMap;
	
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
	if(WPGMZA.settings.engine != "google-maps")
		return;
	
	data.map = MYMAP.map.googleMap;
	
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