/**
 * @namespace WPGMZA
 * @module LegacyGlobalSymbols
 * @requires WPGMZA
 */
jQuery(function($) {	

	var legacyGlobals = {
		marker_pull:		"0",
		marker_array:		[],
		MYMAP:			 	[],
		infoWindow_poly:	[],
		markerClusterer:	[],
		heatmap:			[],
		WPGM_Path:			[],
		WPGM_Path_Polygon:	[],
		WPGM_PathLine:		[],
		WPGM_PathLineData:	[],
		WPGM_PathData:		[],
		original_iw:		null,
		wpgmza_user_marker:	null,
		
		wpgmaps_localize_marker_data:		[],
		wpgmaps_localize_polygon_settings:	[],
		wpgmaps_localize_heatmap_settings:	[],
		wpgmaps_localize_polyline_settings:	[],
		wpgmza_cirtcle_data_array:			[],
		wpgmza_rectangle_data_array:		[],
		
		wpgmzaForceLegacyMarkerClusterer: false
	};
	
	function bindLegacyGlobalProperty(key)
	{
		if(key in window)
		{
			console.warn("Cannot redefine legacy global " + key);
			return;
		}
		
		Object.defineProperty(window, key, {
			"get": function() {
				
				console.warn("This property is deprecated and should no longer be used");
				
				return legacyGlobals[key];
				
			},
			"set": function(value) {
				
				console.warn("This property is deprecated and should no longer be used");
				
				legacyGlobals[key] = value;
				
			}
		});
	}
	
	for(var key in legacyGlobals)
		bindLegacyGlobalProperty(key);
	
	WPGMZA.legacyGlobals = legacyGlobals;

	window.InitMap =
		window.resetLocations =
		window.searchLocations =
		window.fillInAddress =
		window.searchLocationsNear =
	function () {
		console.warn("This function is deprecated and should no longer be used");
	}

	/*window.add_polygon = function (mapid, polygonid) {
		
		console.warn("This function is deprecated and should no longer be used");
		
		if (WPGMZA.settings.engine == "open-layers")
			return;

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

		function addPolygonLabel(googleLatLngs) {
			var label = tmp_data.title;

			var geojson = [[]];

			googleLatLngs.forEach(function (latLng) {
				geojson[0].push([
						latLng.lng(),
						latLng.lat()
					])
			});

			var lngLat = WPGMZA.ProPolygon.getLabelPosition(geojson);

			var latLng = new WPGMZA.LatLng({
					lat: lngLat[1],
					lng: lngLat[0]
				});

			var marker = WPGMZA.Marker.createInstance({
					position: latLng
				});

			// TODO: Support target map
			// TODO: Read polygon title

			var text = WPGMZA.Text.createInstance({
					text: label,
					map: WPGMZA.getMapByID(mapid),
					position: latLng
				});

			//var marker = WPGMZA.Marker.createInst)
		}

		WPGM_Path_Polygon[polygonid] = new google.maps.Polygon({
				path: WPGM_PathData,
				clickable: true,
				strokeColor: "#" + tmp_data['linecolor'],
				fillOpacity: tmp_data['opacity'],
				strokeOpacity: tmp_data['lineopacity'],
				fillColor: "#" + tmp_data['fillcolor'],
				strokeWeight: 2,
				map: MYMAP[mapid].map.googleMap
			});
		WPGM_Path_Polygon[polygonid].setMap(MYMAP[mapid].map.googleMap);

		var map = WPGMZA.getMapByID(mapid);
		if (map.settings.polygon_labels)
			addPolygonLabel(WPGM_PathData);

		if (tmp_data['title'] !== "") {
			infoWindow_poly[polygonid] = new google.maps.InfoWindow();
			infoWindow_poly[polygonid].setZIndex(WPGMZA.GoogleInfoWindow.Z_INDEX);

			google.maps.event.addListener(WPGM_Path_Polygon[polygonid], 'click', function (event) {
				infoWindow_poly[polygonid].setPosition(event.latLng);
				content = "";
				if (tmp_data['link'] !== "") {
					var content = "<a href='" + tmp_data['link'] + "'><h4 class='wpgmza_polygon_title'>" + tmp_data['title'] + "</h4></a>";
					if (tmp_data['description'] !== "") {
						content += '<p class="wpgmza_polygon_description">' + tmp_data['description'] + '</p>';
					}
				} else {
					var content = '<h4 class="wpgmza_polygon_title">' + tmp_data['title'] + '</h4>';
					if (tmp_data['description'] !== "") {
						content += '<p class="wpgmza_polygon_description">' + tmp_data['description'] + '</p>';
					}
				}
				infoWindow_poly[polygonid].setContent(content);
				infoWindow_poly[polygonid].open(MYMAP[mapid].map.googleMap, this.position);
			});
		}

		google.maps.event.addListener(WPGM_Path_Polygon[polygonid], "mouseover", function (event) {
			this.setOptions({
				fillColor: "#" + tmp_data['ohfillcolor']
			});
			this.setOptions({
				fillOpacity: tmp_data['ohopacity']
			});
			this.setOptions({
				strokeColor: "#" + tmp_data['ohlinecolor']
			});
			this.setOptions({
				strokeWeight: 2
			});
			this.setOptions({
				strokeOpacity: 0.9
			});
		});
		google.maps.event.addListener(WPGM_Path_Polygon[polygonid], "click", function (event) {

			this.setOptions({
				fillColor: "#" + tmp_data['ohfillcolor']
			});
			this.setOptions({
				fillOpacity: tmp_data['ohopacity']
			});
			this.setOptions({
				strokeColor: "#" + tmp_data['ohlinecolor']
			});
			this.setOptions({
				strokeWeight: 2
			});
			this.setOptions({
				strokeOpacity: 0.9
			});
		});
		google.maps.event.addListener(WPGM_Path_Polygon[polygonid], "mouseout", function (event) {
			this.setOptions({
				fillColor: "#" + tmp_data['fillcolor']
			});
			this.setOptions({
				fillOpacity: tmp_data['opacity']
			});
			this.setOptions({
				strokeColor: "#" + tmp_data['linecolor']
			});
			this.setOptions({
				strokeWeight: 2
			});
			this.setOptions({
				strokeOpacity: tmp_data['lineopacity']
			});
		});
	}
	
	window.add_polyline = function (mapid, polyline) {
		
		console.warn("This function is deprecated and should no longer be used");

		if (WPGMZA.settings.engine == "open-layers")
			return;

		var tmp_data = wpgmaps_localize_polyline_settings[mapid][polyline];

		var current_poly_id = polyline;
		var tmp_polydata = tmp_data['polydata'];
		var WPGM_Polyline_PathData = new Array();
		for (tmp_entry2 in tmp_polydata) {
			if (typeof tmp_polydata[tmp_entry2][0] !== "undefined" && typeof tmp_polydata[tmp_entry2][1] !== "undefined") {
				var lat = tmp_polydata[tmp_entry2][0].replace(')', '');
				lat = lat.replace('(', '');
				var lng = tmp_polydata[tmp_entry2][1].replace(')', '');
				lng = lng.replace('(', '');
				WPGM_Polyline_PathData.push(new google.maps.LatLng(lat, lng));
			}

		}
		if (tmp_data['lineopacity'] === null || tmp_data['lineopacity'] === "") {
			tmp_data['lineopacity'] = 1;
		}

		WPGM_Path[polyline] = new google.maps.Polyline({
				path: WPGM_Polyline_PathData,
				strokeColor: "#" + tmp_data['linecolor'],
				strokeOpacity: tmp_data['opacity'],
				strokeWeight: tmp_data['linethickness'],
				map: MYMAP[mapid].map.googleMap
			});
		WPGM_Path[polyline].setMap(MYMAP[mapid].map.googleMap);

	}

	window.add_circle = function (mapid, data) {
		
		console.warn("This function is deprecated and should no longer be used");
		
		if (WPGMZA.settings.engine != "google-maps" || !MYMAP.hasOwnProperty(mapid))
			return;

		data.map = MYMAP[mapid].map.googleMap;

		if (!(data.center instanceof google.maps.LatLng)) {
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

	window.add_rectangle = function (mapid, data) {
		
		console.warn("This function is deprecated and should no longer be used");
		
		if (WPGMZA.settings.engine != "google-maps" || !MYMAP.hasOwnProperty(mapid))
			return;

		data.map = MYMAP[mapid].map.googleMap;

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

	window.add_heatmap = function (mapid, datasetid) {
		
		console.warn("This function is deprecated and should no longer be used");

		if (WPGMZA.settings.engine != "google-maps")
			return;

		var tmp_data = wpgmaps_localize_heatmap_settings[mapid][datasetid];
		var current_poly_id = datasetid;
		var tmp_polydata = tmp_data['polydata'];
		var WPGM_PathData = new Array();
		for (tmp_entry2 in tmp_polydata) {
			if (typeof tmp_polydata[tmp_entry2][0] !== "undefined") {

				WPGM_PathData.push(new google.maps.LatLng(tmp_polydata[tmp_entry2][0], tmp_polydata[tmp_entry2][1]));
			}
		}
		if (tmp_data['radius'] === null || tmp_data['radius'] === "") {
			tmp_data['radius'] = 20;
		}
		if (tmp_data['gradient'] === null || tmp_data['gradient'] === "") {
			tmp_data['gradient'] = null;
		}
		if (tmp_data['opacity'] === null || tmp_data['opacity'] === "") {
			tmp_data['opacity'] = 0.6;
		}

		var bounds = new google.maps.LatLngBounds();
		for (i = 0; i < WPGM_PathData.length; i++) {
			bounds.extend(WPGM_PathData[i]);
		}

		WPGM_Path_Polygon[datasetid] = new google.maps.visualization.HeatmapLayer({
				data: WPGM_PathData,
				map: MYMAP[mapid].map.googleMap
			});

		WPGM_Path_Polygon[datasetid].setMap(MYMAP[mapid].map.googleMap);
		var gradient = JSON.parse(tmp_data['gradient']);
		WPGM_Path_Polygon[datasetid].set('radius', tmp_data['radius']);
		WPGM_Path_Polygon[datasetid].set('opacity', tmp_data['opacity']);
		WPGM_Path_Polygon[datasetid].set('gradient', gradient);
	};*/

});