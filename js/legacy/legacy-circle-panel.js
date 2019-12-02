(function ($) {

	var myLatLng = new google.maps.LatLng(wpgmza_legacy.wpgmza_lat, wpgmza_legacy.wpgmza_lng);
	circle = null;
	MYMAP = {
		map: null,
		bounds: null
	};

	jQuery(function ($) {
		
		function wpgmza_InitMap() {

			MYMAP.init('#wpgmza_map', myLatLng, wpgmza_legacy.start_zoom);
		}
		$("#wpgmza_map").css({
			height: wpgmza_legacy.wpgmza_height + wpgmza_legacy.wpgmza_height_type,
			width: wpgmza_legacy.wpgmza_width + wpgmza_legacy.wpgmza_width_type
		});
		wpgmza_InitMap();

		$("#circle_radius").on("input", function (event) {
			if (!circle)
				return;
			circle.setRadius(parseFloat($(event.target).val()));

		});
		$("#circle_opacity").keyup(function () {
			if (!circle)
				return;
			circle.setOptions({
				fillOpacity: parseFloat($(event.target).val())
			});
		});

		$("#circle_color").on("input", function (event) {
			if (!circle)
				return;
			circle.setOptions({
				fillColor: $(event.target).val()
			});
		});

		$("#wpgmaps_add_circle_form").on("submit", function (event) {

			$("input[name='center']").val(circle.getCenter());

		});

	});

	function wpgmza_update_center_field() {
		$("input[name='center']").val(circle.getCenter().toString());
	}

	function wpgmza_get_width_in_kilometers(map) {
		var spherical = google.maps.geometry.spherical,
		bounds = map.getBounds(),
		cor1 = bounds.getNorthEast(),
		cor2 = bounds.getSouthWest(),
		cor3 = new google.maps.LatLng(cor2.lat(), cor1.lng()),
		cor4 = new google.maps.LatLng(cor1.lat(), cor2.lng()),
		width = spherical.computeDistanceBetween(cor1, cor3),
		height = spherical.computeDistanceBetween(cor1, cor4);

		return width;
	}

	function handle_radius_warning() {
		var km = wpgmza_get_width_in_kilometers(MYMAP.map);
		var circleRadius = $("#circle_radius").val();

		var ratio = circleRadius / km;

		if (ratio < 0.005)
			$("#circle-radius-visibility-warning").show();
		else
			$("#circle-radius-visibility-warning").hide();

		return km;
	}

	MYMAP.init = function (selector, latLng, zoom) {

		var self = this;

		$("#circle-radius-visibility-warning").hide();

		var myOptions = {
			zoom: parseInt(zoom),
			center: latLng,
			zoomControl: true,
			panControl: true,
			mapTypeControl: true,
			streetViewControl: true,
			mapTypeId: google.maps.MapTypeId[wpgmza_legacy.wpgmza_map_type]
		};

		this.map = new google.maps.Map($(selector)[0], myOptions);
		this.bounds = new google.maps.LatLngBounds();

		google.maps.event.addListener(this.map, "click", function (event) {

			if (circle)
				circle.setMap(null);

			circle = new google.maps.Circle({
					fillColor: $("input[name='circle_color']").val(),
					fillOpacity: $("input[name='circle_opacity']").val(),
					strokeOpacity: 0,
					map: self.map,
					center: event.latLng,
					radius: parseFloat($("input[name='circle_radius']").val()),
					draggable: true
				});

			circle.addListener("dragend", function () {
				wpgmza_update_center_field();
			});

			wpgmza_update_center_field();

			handle_radius_warning();

		});

		google.maps.event.addListener(this.map, "zoom_changed", function (event) {

			handle_radius_warning();

		});

		setTimeout(function () {
			handle_radius_warning();
		}, 2000);

		if (window.location.href.match(/edit_circle/)) {
			var m = $("input[name='center']").val().match(/-?\d+(\.\d+)?/g);

			circle = new google.maps.Circle({
					fillColor: $("input[name='circle_color']").val(),
					fillOpacity: $("input[name='circle_opacity']").val(),
					strokeOpacity: 0,
					map: self.map,
					center: new google.maps.LatLng({
						lat: parseFloat(m[0]),
						lng: parseFloat(m[1])
					}),
					radius: parseFloat($("input[name='circle_radius']").val()),
					draggable: true
				});

			circle.addListener("dragend", function () {
				wpgmza_update_center_field();
			});

			MYMAP.map.fitBounds(circle.getBounds());

		}
	}

})(jQuery);
