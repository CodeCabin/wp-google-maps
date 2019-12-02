jQuery(function ($) {
	function wpgmza_InitMap() {
		var myLatLng = new google.maps.LatLng(
				wpgmza_legacy_polygon_panel_vars.wpgmza_lat,
				wpgmza_legacy_polygon_panel_vars.wpgmza_lng);

		MYMAP.init('#wpgmza_map', myLatLng, wpgmza_legacy_polygon_panel_vars.start_zoom);
	}

	jQuery("#wpgmza_map").css({
		height: wpgmza_legacy_polygon_panel_vars.wpgmza_height + wpgmza_legacy_polygon_panel_vars.wpgmza_height_type,
		width: wpgmza_legacy_polygon_panel_vars.wpgmza_width + wpgmza_legacy_polygon_panel_vars.wpgmza_width_type
	});

	wpgmza_InitMap();
	jQuery("#poly_line").focusout(function () {
		poly.setOptions({
			strokeColor: "#" + jQuery("#poly_line").val()
		});
	});
	jQuery("#poly_fill").focusout(function () {
		poly.setOptions({
			fillColor: "#" + jQuery("#poly_fill").val()
		});
	});
	jQuery("#poly_line_opacity").focusout(function () {
		poly.setOptions({
			strokeOpacity: jQuery("#poly_line_opacity").val()
		});
	});
	jQuery("#poly_opacity").keyup(function () {
		poly.setOptions({
			fillOpacity: jQuery("#poly_opacity").val()
		});
	});

});
// polygons variables
var poly;
var poly_markers = [];
var poly_path = new google.maps.MVCArray;
var polygon_mvc_arrays = [];

var MYMAP = {
	map: null,
	bounds: null
}
MYMAP.init = function (selector, latLng, zoom)
{
	var myOptions = {
		zoom: parseInt(zoom),
		center: latLng,
		zoomControl: true,
		panControl: true,
		mapTypeControl: true,
		streetViewControl: true,
		mapTypeId: google.maps.MapTypeId[wpgmza_legacy_polygon_panel_vars.wpgmza_map_type]
	};
	var data, existingPolygon, marker, markers = [];
	
	this.map = new google.maps.Map(jQuery(selector)[0], myOptions);
	this.bounds = new google.maps.LatLngBounds();

	var targetPolygonID = WPGMZA.getQueryParamValue("poly_id");
	
	for(var poly_id in wpgmza_legacy_polygon_panel_vars.polygon_data)
	{
		data = wpgmza_legacy_polygon_panel_vars.polygon_data[poly_id];
		data.path = new google.maps.MVCArray(WPGMZA.LatLng.toGoogleLatLngArray(data.path));
		
		existingPolygon = new google.maps.Polygon(data);
		existingPolygon.setMap(this.map);
		
		if(poly_id == targetPolygonID)
		{
			poly_path = data.path;
			poly = existingPolygon;
		}
	}
	
	if(!targetPolygonID)
	{
		poly = new google.maps.Polygon({
			strokeWeight: 3,
			fillColor: '#66FF00'
		});
		poly.setMap(this.map);
		poly.setPaths(new google.maps.MVCArray([poly_path]));
	}
	else
	{
		data = wpgmza_legacy_polygon_panel_vars.polygon_data[targetPolygonID];
		
		for(var i = 0; i < data.path.length; i++)
		{
			addExistingPoint(data.path.getAt(i));
		}
	}
	
	google.maps.event.addListener(this.map, 'click', addPoint);
	
}

function addPoint(event)
{
	poly_path.insertAt(poly_path.length, event.latLng);

	var poly_marker = new google.maps.Marker({
		position: event.latLng,
		map: MYMAP.map,
		icon: WPGMZA.defaultMarkerIcon,
		draggable: true
	});

	poly_markers.push(poly_marker);
	poly_marker.setTitle("#" + poly_path.length);

	google.maps.event.addListener(poly_marker, 'click', function () {
		poly_marker.setMap(null);
		for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
		poly_markers.splice(i, 1);
		poly_path.removeAt(i);
		updatePolyPath(poly_path);
	});

	google.maps.event.addListener(poly_marker, 'dragend', function () {
		for (var i = 0, I = poly_markers.length; i < I && poly_markers[i] != poly_marker; ++i);
		poly_path.setAt(i, poly_marker.getPosition());
		updatePolyPath(poly_path);
	});

	updatePolyPath(poly_path);
}

function addExistingPoint(position)
{
	var marker = new google.maps.Marker({
		position: position,
		map: MYMAP.map,
		draggable: true
	});
	
	poly_markers.push(marker);
	
	google.maps.event.addListener(marker, "click", function() {
		
		var i = poly_markers.indexOf(marker);
		
		marker.setMap(null);
		
		poly_markers.splice(i, 1);
		poly_path.removeAt(i);
		
		updatePolyPath(poly_path);
		
	});
	
	google.maps.event.addListener(marker, "dragend", function() {
		
		var i = poly_markers.indexOf(marker);
		
		poly_path.setAt(i, marker.getPosition());
		
		updatePolyPath(poly_path);
		
	});
}

function updatePolyPath(poly_path)
{	
	poly.setPath(poly_path);
	
	var temp_array;
	temp_array = "";
	
	poly_path.forEach(function (latLng, index) {
		//                  temp_array = temp_array + " ["+ index +"] => "+ latLng + ", ";
		temp_array = temp_array + latLng + ",";
	});
	
	jQuery("#poly_line_list").html(temp_array);
}
