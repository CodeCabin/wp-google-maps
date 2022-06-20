jQuery(function ($) {
	function wpgmza_InitMap() {
		var myLatLng = new WPGMZA.LatLng(wpgmza_legacy.lat, wpgmza_legacy.lng);
		MYMAP.init('#wpgmza_map', myLatLng, 15);
	}
	
	jQuery("#wpgmza_map").css({
		height: 400,
		width: 400
	});

	$(document).ready(function (event) {
		wpgmza_InitMap();
	});
});

var MYMAP = {
	map: null,
	bounds: null
}
MYMAP.init = function (selector, latLng, zoom) {

	var myOptions = {
		zoom: zoom,
		center: latLng,
		zoomControl: true,
		panControl: true,
		mapTypeControl: true,
		draggable: true,
		disableDoubleClickZoom: false,
		scrollwheel: true,
		streetViewControl: false,
		autoFetchMarkers: false
	}

	if (window.google)
		myOptions.mapTypeId = google.maps.MapTypeId[wpgmza_legacy.type];

	var element = jQuery(selector)[0];

	element.setAttribute("data-map-id", wpgmza_legacy.map_id);

	this.map = WPGMZA.Map.createInstance(element, myOptions);
	this.bounds = new WPGMZA.LatLngBounds();

	updateMarkerPosition(latLng);

	var marker = WPGMZA.Marker.createInstance({
			position: latLng,
			map: this.map,
			draggable: true
		});

	marker.on("dragend", function () {
		updateMarkerPosition(marker.getPosition());
	});
}
function updateMarkerPosition(latLng) {
	jQuery("#wpgmaps_marker_lat").val(latLng.lat);
	jQuery("#wpgmaps_marker_lng").val(latLng.lng);
}
