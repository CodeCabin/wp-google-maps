(function($) {
	var map;
	var rightClickCursor;
	var editMarkerTarget;
	var editPolygonTarget;
	var editPolylineTarget;
	var drawingManager;
	var deleteMenu;
	var markerTable;
	var onFetchEditMarkerID;
	var unloadListenerBound = false;
	
	var deleteIDs = {
		markers: [],
		polygons: [],
		polylines: []
	};
	
	// TODO: Shouldn't touch googleMarker or googlePolygon here, it will be more code but the class should update those things itself, so that our users don't have to if they extend the plugin (eg to make their own editor or similar). In other words, the marker object should be responsible for updating its own googleMarker on property change, and this should be a wrapper
	
	/**
	 * Utility function returns true is string is a latitude and longitude
	 * @return string
	 */
	function isLatLngString(str)
	{
		return str.match(/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/);
	}
	
	// Marker Functions ///////////////////////
	
	function enableMarkerButtons(enable)
	{
		$("#marker-buttons button").prop("disabled", !enable);
	}
	
	/**
	 * Creates a marker at the specified coordinates, and puts the data from the markers tab into it
	 * @return void
	 */
	function updateMarker(latLng)
	{
		var marker;
		if(editMarkerTarget)
			marker = editMarkerTarget;
		else
			marker = new WPGMZA.Marker();
		
		$("#wpgmza-markers-tab").find("input, select, textarea").each(function(index, el) {
			var name = $(this).attr("name");
			var value = $(el).val();;
			
			if(marker.hasOwnProperty(name))
				marker[name] = value;
			else
				marker.settings[name] = value;
		});
		
		marker.lat = latLng.lat();
		marker.lng = latLng.lng();
		marker.googleMarker.setPosition(latLng);
		marker.googleMarker.setAnimation(marker.settings.animation);
		
		if(!marker.map)
			map.addMarker(marker);
		map.googleMap.panTo(latLng);
		
		$("input[name='address']").val("");
		enableMarkerButtons(true);
		
		rightClickCursor.setMap(null);
		
		editMarker(marker);
		marker.modified = true;
		bindUnloadListener();
	}
	
	/**
	 * Call this function to begin editing the specified marker
	 * @return void
	 */
	function editMarker(marker)
	{
		// Stop right click add if that was happening
		rightClickCursor.setMap(null);
		
		// Set edit marker target
		editMarkerTarget = marker;
		
		if(!marker)
		{
			$("input[name='address']").val("");
			$("#wpgmza-markers-tab").removeClass("update-marker").addClass("add-marker");
			return;
		}
		
		// Select the marker tab
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: 0
		});
		
		// Stop editing polygons / polylins
		editPolygon(null);
		editPolyline(null);
		
		// Center on the marker
		map.googleMap.panTo(marker.googleMarker.getPosition());
		
		// Fill the form with markers data
		$("#wpgmza-markers-tab").find("input, select, textarea").each(function(index, el) {
			var name = $(el).attr("name"), val;
			if(marker.hasOwnProperty(name))
				val = marker[name];
			else
				val = marker.settings[name];
			
			$(el).val(val);
			
			if((!val || typeof val == "string" && val.length == 0) && 
				el.nodeName.match(/select/i))
				$(el).find("option:first-child").prop("selected", true);
		});
		
		// Set the form to update (not add)
		$("#wpgmza-markers-tab").removeClass("add-marker").addClass("update-marker");
	}
	
	/**
	 * Called when the user clicks cancel edit on markers tab or clicks blank space on the map
	 * @return void
	 */
	function onCancelEditMarker(event)
	{
		editMarker(null);
	}
	
	/**
	 * Called when user deletes a marker
	 * @return void
	 */
	function deleteMarkerByID(id)
	{
		deleteIDs.markers.push(id);
		map.deleteMarkerByID(id);
	}
	
	/**
	 * Called when the user clicks delete marker in the markers tab
	 * @return void
	 */
	function onDeleteMarker(event)
	{
		deleteMarkerByID(editMarkerTarget.id);
		editMarker(null);
		markerTable.refresh();
		bindUnloadListener();
	}
	
	/**
	 * Called when the user right clicks on the map
	 * NB: Some of this code might have to be moved to the Map object to 
	 * @return void
	 */
	function onRightClickMap(event)
	{
		// Stop editing marker, do this before setting the address input value as it clears it
		editMarker(null);
		
		var value = event.latLng.toString().replace(/[() ]/g, "");
		$("input[name='address']").val(value).focus().select();
		
		rightClickCursor.setMap(map.googleMap);
		rightClickCursor.setPosition(event.latLng);
	}
	
	/**
	 * Called when the user clicks add marker or save marker
	 * @return void
	 */
	function onSaveMarker()
	{
		var self = this;
		var address = $("form.wpgmza input[name='address']").val();
		
		$("#geocoder-error").hide();
		
		if(!isLatLngString(address))
		{
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({address: address}, onGeocoderResponse);
			enableMarkerButtons(false);
		}
		else
		{
			var parts = address.split(",");
			var latLng = new google.maps.LatLng(parts[0], parts[1]);
			updateMarker(latLng);
		}
	}
	
	/**
	 * Called when the geocoder returns a response from save / add marker
	 * @return void
	 */
	function onGeocoderResponse(results, status)
	{
		enableMarkerButtons(true);
		
		if(status != google.maps.GeocoderStatus.OK)
		{
			$("#geocoder-error").show();
			$("input[name='address']").focus().select();
			return;
		}
		
		var result = results[0];
		var latLng = result.geometry.location;
		
		updateMarker(latLng);
	}
	
	
	/**
	 * Callback for when a WPGMZA marker is added
	 * @return void
	 */
	function onMarkerAdded(event)
	{
		// TODO: Unbind on remove
		event.marker.addEventListener("click", onMarkerClicked);
	}
	
	/**
	 * Callback for when a WPGMZA marker is removed
	 * @return void
	 */
	function onMarkerRemoved(event)
	{
		event.marker.removeEventListener("click", onMarkerClicked);
	}
	
	/**
	 * Called when the user clicks on the map
	 * @return void
	 */
	function onMarkerClicked(event) 
	{
		editMarker(event.target);
	}
	
	// Polygon Functions //////////////////////
	 
	/**
	 * Utility function to get polygon fields without the polygon- prefix
	 * @return object
	 */
	function getPolygonFields()
	{
		var fields = {};
		
		$("#polygons").find("input, select, textarea").each(function(index, el) {
			var name = $(el).attr("name").replace(/^polygon-/, "");
			fields[name] = $(el).val();
		});
		
		return fields;
	}
	
	/**
	 * Start editing the specified polygon
	 * @return void
	 */
	function editPolygon(polygon)
	{
		var prevTarget = editPolygonTarget;
		editPolygonTarget = polygon;
		
		if(prevTarget)
			prevTarget.googlePolygon.setOptions({editable: false});
		
		if(!polygon)
		{
			$("input[name='polygon-name']").val("");
			$("#polygons").removeClass("update-polygon").addClass("add-polygon");
			drawingManager.setDrawingMode(null);
			return;
		}
		
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: 2
		});
		
		// TODO: Fit polygon bounds
		
		polygon.googlePolygon.setOptions({editable: true});
		
		$("input[name='polygon-name']").val(polygon.name);
		
		$("#polygons input").each(function(index, el) {
			if($(el).prop("disabled"))
				return;
			
			if($(el).attr("name") == "polygon-name")
				return;
			
			var nameWithoutPrefix = $(el).attr("name").replace(/^polygon-/, "");
			$(el).val(polygon.settings[nameWithoutPrefix]);
		});
		
		$("#polygons").removeClass("add-polygon").addClass("update-polygon");
	}
	
	/**
	 * Called when use clicks draw polygon or clicks on a polygon
	 * @return void
	 */
	function onDrawPolygon(event)
	{
		var fields = getPolygonFields();
		drawingManager.setOptions({
			polygonOptions: fields
		});
		drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
	}
	
	function onPolygonClosed(googlePolygon)
	{
		var fields = getPolygonFields();
		var polygon = new WPGMZA.Polygon({settings: fields}, googlePolygon);
		
		polygon.modified = true;
		bindUnloadListener();
		
		drawingManager.setDrawingMode(null);
		map.addPolygon(polygon);
		
		editPolygon(polygon);
	}
	
	/**
	 * Called when the user clicks finish editing polygon, or clicks off the polygon tab
	 * @return void
	 */
	function onFinishEditingPolygon(event)
	{
		editPolygon(null);
	}
	
	/**
	 * Called when the user clicks delete polygon
	 * @return void
	 */
	function onDeletePolygon(event)
	{
		var id = editPolygonTarget.id;
		
		deleteIDs.polygons.push(id);
		map.deletePolygon(editPolygonTarget);
		editPolygon(null);
		bindUnloadListener();
	}
	
	function onPolygonModified(vertex)
	{
		editPolygonTarget.modified = true;
		bindUnloadListener();
	}
	
	function onPolygonAdded(event)
	{
		// TODO: Unbind on remove
		var polygon = event.polygon;
		
		polygon.addEventListener("click", onPolygonClicked);
		
		polygon.rightClickListener = google.maps.event.addListener(polygon.googlePolygon, "rightclick", function(e) {
			deleteMenu.open(map.googleMap, polygon.googlePolygon.getPath(), e.vertex);
		});
		
		polygon.googlePolygon.getPaths().forEach(function(path, index) {
			google.maps.event.addListener(path, "insert_at", onPolygonModified);
			google.maps.event.addListener(path, "remove_at", onPolygonModified);
			google.maps.event.addListener(path, "set_at", onPolygonModified);
		});
	}
	
	function onPolygonRemoved(event)
	{
		event.polygon.removeEventListener("click", onPolygonClicked);
		google.maps.event.removeListener(event.polygon.rightClickListener);
		delete polygon.rightClickListener;
	}
	
	function onPolygonClicked(event)
	{
		editPolygon(event.target);
	}
	
	function onPolygonSettingChanged(event)
	{
		if(!editPolygonTarget)
			return;
		
		var name = event.target.name.replace(/^polygon-/, "");
		var value = $(event.target).val();
		
		editPolygonTarget.settings[name] = value;
		
		// NB: Options have to be passed like this so that the property name is a literal and not a string
		var options = {};
		options[name] = value;
		editPolygonTarget.googlePolygon.setOptions(options);
	}
	
	// Polyline Functions /////////////////////
	function getPolylineFields()
	{
		var fields = {};
		
		$("#polylines").find("input, select, textarea").each(function(index, el) {
			var name = $(el).attr("name").replace(/^polyline-/, "");
			fields[name] = $(el).val();
		});
		
		return fields;
	}
	
	function editPolyline(polyline)
	{
		var prevTarget = editPolylineTarget;
		editPolylineTarget = polyline;
		
		if(prevTarget)
			prevTarget.googlePolyline.setOptions({editable: false});
		
		if(!polyline)
		{
			$("input[name='polyline-name']").val("");
			$("#polylines").removeClass("update-polyline").addClass("add-polyline");
			drawingManager.setDrawingMode(null);
			return;
		}
		
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: 3
		});
		
		// TODO: Fit polyline bounds
		
		polyline.googlePolyline.setOptions({editable: true});
		
		$("input[name='polyline-name']").val(polyline.name);
		
		$("#polylines input").each(function(index, el) {
			if($(el).prop("disabled"))
				return;
			
			if($(el).attr("name") == "polyline-name")
				return;
			
			var nameWithoutPrefix = $(el).attr("name").replace(/^polyline-/, "");
			$(el).val(polyline.settings[nameWithoutPrefix]);
		});
		
		$("#polylines").removeClass("add-polyline").addClass("update-polyline");
	}
	
	function onDrawPolyline(event)
	{
		var fields = getPolylineFields();
		drawingManager.setOptions({
			polylineOptions: fields
		});
		drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
	}
	
	function onPolylineComplete(googlePolyline)
	{
		var fields = getPolylineFields();
		var polyline = new WPGMZA.Polyline({settings: fields}, googlePolyline);
		
		polyline.modified = true;
		bindUnloadListener();
		
		drawingManager.setDrawingMode(null);
		map.addPolyline(polyline);
		
		editPolyline(polyline);
	}
	
	function onFinishEditingPolyline(event)
	{
		editPolyline(null);
	}
	
	function onDeletePolyline(event)
	{
		var id = editPolylineTarget.id;
		
		deleteIDs.polylines.push(id);
		map.deletePolyline(editPolylineTarget);
		editPolyline(null);
		bindUnloadListener();
	}
	
	function onPolylineSettingChanged(event)
	{
		if(!editPolylineTarget)
			return;
		
		var name = event.target.name.replace(/^polyline-/, "");
		var value = $(event.target).val();
		
		editPolylineTarget.settings[name] = value;
		
		// NB: Options have to be passed like this so that the property name is a literal and not a string
		var options = {};
		options[name] = value;
		editPolylineTarget.googlePolyline.setOptions(options);
	}
	
	function onPolylineModified(vertex)
	{
		editPolylineTarget.modified = true;
		bindUnloadListener();
	}
	
	function onPolylineAdded(event)
	{
		var polyline = event.polyline;
		
		polyline.addEventListener("click", onPolylineClicked);
		polyline.rightClickListener = google.maps.event.addListener(polyline.googlePolyline, "rightclick", function(e) {
			deleteMenu.open(map.googleMap, polyline.googlePolyline.getPath(), e.vertex);
		});
		
		var path = polyline.googlePolyline.getPath();
		google.maps.event.addListener(path, "insert_at", onPolylineModified);
		google.maps.event.addListener(path, "remove_at", onPolylineModified);
		google.maps.event.addListener(path, "set_at", onPolylineModified);
	}
	
	function onPolylineRemoved(event)
	{
		polyline.removeEventListener("click", onPolylineClicked);
		google.maps.event.removeListener(polyline.rightClickListener);
	}
	
	function onPolylineClicked(event)
	{
		editPolyline(event.target);
	}
	
	// General Functions //////////////////////
	/**
	 * Updates the page based on form controls, display warnings, change distance units, etc.
	 * @return void
	 */
	function onFormChanged()
	{
		$("form.wpgmza .height-warning").css({
			display: ($("form.wpgmza select[name='height_units']>option:selected").val() == '%' ? 'inline-block' : 'none')
		});
		
		var input = $("input[name='store_locator_distance']");
		var label = input.next("label");
		$("form.wpgmza .default-radius-units").html(
			input.prop("checked") ? 
			label.attr("data-on") :
			label.attr("data-off")
		);
		
		map.storeLocator.setUnits(input.prop("checked"));
	}
	
	/**
	 * Called when the map bounds change
	 * @return void
	 */
	function onBoundsChanged(event)
	{
		var latLng = map.getCenter();
		var zoom = map.getZoom();
		
		$("input[name='start_location']").val(latLng.toString());
		$("input[name='start_zoom']").val(zoom);
		
		$("#zoom-level-slider").slider("value", zoom);
	}

	function onBeforeUnload(event)
	{
		var confirmationMessage = "Are you sure you want to leave without saving your changes?";
		
		event.preventDefault();
		event.returnValue = confirmationMessage;
		
		return confirmationMessage;
	}
	
	function bindUnloadListener(event)
	{
		if(unloadListenerBound)
			return;
		
		window.addEventListener("beforeunload", onBeforeUnload);
		
		unloadListenerBound = true;
	}
	
	function applyThemeData()
	{
		var str = $("textarea[name='styling_data']").val();
		
		try{
			var json = JSON.parse(str);
		}catch(e) {
			alert(e.message);
			return;
		}
		
		var data = $.extend(json, {name: "Styled Map"});
		var styledMapType = new google.maps.StyledMapType(data);
		map.googleMap.mapTypes.set("styled_map", styledMapType);
		map.googleMap.setMapTypeId("styled_map");
	}
	
	// Marker list functions //////////////////
	/**
	 * This function adds the mark checkboxes and edit controls to the marker list, extending it beyond its front end default setup
	 * @return void
	 */
	function loadMarkerTable()
	{
		// Add admin controls to marker table
		var element = $("#marker-table-container .wpgmza-datatable")[0];
		markerTable = new WPGMZA.DataTable(element, {
			"ajax": {
				"data":	function(data) {
					return $.extend({}, data, {
						"action": 		$(element).attr("data-ajax-action"),
						"map_id": 		$(element).attr("data-map-id"),
						"exclude_ids":	deleteIDs.markers.join(",")
					});
				}
			},
			"createdRow": function(row, data, index) {
				$(row).find("td:nth-child(2)").addClass("address");
				
				$(row).prepend(
					$("<td><input type='checkbox' class='mark'/></td>")
				);
				
				var td = $('<td/>');
				
				$(td).attr("data-marker-id", data[0]);
				$(td).attr("data-lat", data[data.length - 2]);
				$(td).attr("data-lng", data[data.length - 1]);
				
				$(td).append("<button type='button' class='button button-primary edit-marker'><i class='fa fa-pencil-square-o' aria-hidden='true'></i></button>");
				
				$(td).append(" ");
				
				$(td).append("<button type='button' class='button button-primary delete-marker'><i class='fa fa-trash-o' aria-hidden='true'></i></button>");
				
				$(row).append(td);
			}
		});
		
		$("#marker-table-container").on("click", ".edit-marker", onTableRowEditMarker);
		$("#marker-table-container").on("click", ".delete-marker", onTableRowDeleteMarker);
		
		$("#marker-table-container").find("thead>tr, tfoot>tr").prepend("<th>Mark</th>");
		$("#marker-table-container").find("thead>tr, tfoot>tr").append("<th>Actions</th>");
		
		$("#marker-bulk-buttons .select-all").on("click", onSelectAllMarkers);
		$("#marker-bulk-buttons .bulk-delete").on("click", onBulkDeleteMarkers);
	}
	
	/**
	 * Called when the user clicks to edit a marker in the marker table
	 * @return void
	 */
	function onTableRowEditMarker(event)
	{
		var td = $(event.target).closest("td");
		var id = td.attr("data-marker-id");
		
		var latLng = new google.maps.LatLng({
			lat: parseFloat(td.attr("data-lat")),
			lng: parseFloat(td.attr("data-lng"))
		});
		
		var marker;
		if(marker = map.getMarkerByID(id))
			editMarker(marker);	// Marker loaded, go straight to editing it
		else
			onFetchEditMarkerID = id; // Marker not loaded, remember to edit it once fetch completes
		
		map.googleMap.panTo(latLng);
	}
	
	/**
	 * Called when the user clicks to delete a marker in the marker table
	 * @return void
	 */
	function onTableRowDeleteMarker(event)
	{
		var td = $(event.target).closest("td");
		var id = td.attr("data-marker-id");
		
		// Add the marker to the list of markers to be deleted
		deleteMarkerByID(id);
		
		// If the marker is open in the edit menu, finish editing
		if(editMarkerTarget && editMarkerTarget.id == id)
			editMarker(null);
		
		// Refresh the table
		markerTable.refresh();
		
		bindUnloadListener();
	}
	
	function onMapFetchSuccess(event)
	{
		if(!onFetchEditMarkerID)
			return;
		
		editMarker(map.getMarkerByID(onFetchEditMarkerID));
		
		onFetchEditMarkerID = null;
	}
	
	function onSelectAllMarkers(event)
	{
		$("#marker-table-container .wpgmza-datatable input[type='checkbox']").prop("checked", true);
	}
	
	function onBulkDeleteMarkers(event)
	{
		$("#marker-table-container tbody>tr").each(function(index, el) {
			if($(el).find(".mark").prop("checked") == false)
				return;
			
			var marker_id = $(el).find("[data-marker-id]").attr("data-marker-id");
			deleteMarkerByID(marker_id);
		});
		
		markerTable.refresh();
		bindUnloadListener();
	}
	
	/**
	 * Called when the form submits. This function puts all the markers, 
	 * polygons and polylines in an array to be sent along with the rest 
	 * of the from data. Any deleted markers, polygons and polylines are 
	 * sent in deleteIDs
	 * @return void
	 */
	function onSubmit(event)
	{
		// Map Objects
		var data = {
			markers: [],
			polygons: [],
			polylines: [],
			deleteIDs: deleteIDs
		};
		
		for(var i = 0; i < map.markers.length; i++)
			if(map.markers[i].modified)
				data.markers.push(map.markers[i].toJSON());
		
		for(i = 0; i < map.polygons.length; i++)
			if(map.polygons[i].modified)
				data.polygons.push(map.polygons[i].toJSON());
			
		for(i = 0; i < map.polylines.length; i++)
			if(map.polylines[i].modified)
				data.polylines.push(map.polylines[i].toJSON());
		
		var input = $("<input name='map-objects'/>");
		input.val(JSON.stringify(data));
		$("form.wpgmza").append(input);
		
		window.removeEventListener("beforeunload", onBeforeUnload);
	}
	
	
	
	$(document).ready(function() {
		// Main tabs
		$(".wpgmza-tabs").each(function(index, el) {
			var options = {};
			
			var active = 0;
			if(window.localStorage)
				active = parseInt(localStorage.getItem(el.id));
			
			options = {
				active: active,
				activate: function(event, ui) {
					$("#polygon-instructions, #polyline-instructions").hide();
					
					switch(ui.newPanel.attr("id"))
					{
						case "polygons":
							$("#polygon-instructions").show();
							break;
						
						case "polylines":
							$("#polyline-instructions").show();
							break;
					}
					
					if(window.localStorage)
						localStorage.setItem(this.id, $(this).tabs("option", "active"));
				}
			};
				
			$(el).tabs(options);
		});
		
		// Map start zoom slider
		$("#zoom-level-slider").slider({
			min: 1,
			max: 21,
			value: $("input[name='start_zoom']").val(),
			slide: function(event, ui) {
				$("input[name='start_zoom']").val(
					ui.value
				);
				map.setZoom(ui.value);
			}
		});
		
		// Set up theme radio buttons
		$("#themes input[type='radio']").on("change", function() {
			// Grab JSON from the radio button
			var str = $(this).attr("data-theme-json");
			json = JSON.parse(str);
			
			// Pretty print the JSON
			str = JSON.stringify(json, undefined, 4);
			
			// Set the value into text field
			$("textarea[name='styling_data']").val(str);
			
			applyThemeData();
		});
		
		// Preview custom theme button
		$("#preview-custom-theme").on("click", function() {
			$("#themes input[type='radio']").prop("checked", false);
			
			applyThemeData();
		});
		
		// Get map instance
		map = WPGMZA.maps[0];
		
		// Listen for markers, polygons and polylines being added
		map.addEventListener("markeradded", onMarkerAdded);
		map.addEventListener("markerremoved", onMarkerRemoved);
		map.addEventListener("polygonadded", onPolygonAdded);
		map.addEventListener("polygonremoved", onPolygonRemoved);
		map.addEventListener("polylineadded", onPolylineAdded);
		map.addEventListener("fetchsuccess", onMapFetchSuccess);
		
		// Listen for bounds change
		map.addEventListener("bounds_changed", onBoundsChanged);
		
		// When the user clicks cancel edit button or blank space on the map, cancel editing marker
		google.maps.event.addListener(map.googleMap, "click", onCancelEditMarker);
		google.maps.event.addListener(map.googleMap, "click", onFinishEditingPolygon);
		google.maps.event.addListener(map.googleMap, "click", onFinishEditingPolyline);
		
		// Set up right click marker adding
		rightClickCursor = new google.maps.Marker({
			draggable: true,
			icon: {
				url: $("[data-right-click-marker-image]").attr("data-right-click-marker-image"),
				anchor: new google.maps.Point(14, 39),
			}
		});
		
		google.maps.event.addListener(rightClickCursor, 'dragend', onRightClickMap);
		google.maps.event.addListener(map.googleMap, 'rightclick', onRightClickMap);
		
		// Bind listener to update form on changes
		$("form.wpgmza").on("change", onFormChanged);
		onFormChanged();
		
		// Marker buttons
		$("#add-marker, #update-marker").on("click", onSaveMarker);
		$("#cancel-marker-edit").on("click", onCancelEditMarker);
		$("#delete-marker").on("click", onDeleteMarker);
		
		// Polygon buttons
		$("#draw-polygon").on("click", onDrawPolygon);
		$("#finish-editing-polygon").on("click", onFinishEditingPolygon);
		$("#delete-polygon").on("click", onDeletePolygon);
		
		// Polyline buttons
		$("#draw-polyline").on("click", onDrawPolyline);
		$("#finish-editing-polyline").on("click", onFinishEditingPolyline);
		$("#delete-polyline").on("click", onDeletePolyline);
		
		// Polygon input change listeners
		$("#polygons").find("input, textarea, select").on("change input", onPolygonSettingChanged);
		
		// Polyline input change listeners
		$("#polylines").find("input, textarea, select").on("change input", onPolylineSettingChanged);
		
		// Drawing manager for polygons and polylines
		drawingManager = new google.maps.drawing.DrawingManager({
			drawingControl: false,
			polygonOptions: {
				editable: true
			},
			polylineOptions: {
				editable: true
			}
		});
		drawingManager.setMap(map.googleMap);
		google.maps.event.addListener(drawingManager, "polygoncomplete", onPolygonClosed);
		google.maps.event.addListener(drawingManager, "polylinecomplete", onPolylineComplete);
		
		// Right click delete menu for polygon and polyline points
		deleteMenu = new WPGMZA.DeleteMenu(this);
		
		// Marker table
		loadMarkerTable();
		
		// Listen for changes on "live" polygon and polyline forms (markers are flagged as modified by updateMarker, that form is not "live")
		$("#polygons").find("input, select, textarea").on("change", function(event) {
			if(editPolygonTarget)
				editPolygonTarget.modified = true;
		});
		$("#polylines").find("input, select, textarea").on("change", function(event) {
			if(editPolylineTarget)
				editPolylineTarget.modified = true;
		});
		
		$("form.wpgmza").on("change", function(event) {
			bindUnloadListener();
		});
		
		// Hide / show store locator dynamically
		$("input[name='store_locator']").on("change", function(event) {
			$(".wpgmza-map .store-locator").css({
				display: $(event.target).prop("checked") ? "block" : "none"
			});
		});
		
		// Zoom limit slider
		$("#zoom-range-slider").slider({
			range: true,
			min: 1,
			max: 21,
			values: [
				$("input[name='min_zoom']").val(), 
				$("input[name='max_zoom']").val()
			],
			slide: function(event, ui) {
				$("input[name='min_zoom']").val(
					ui.values[0]
				);
				$("input[name='max_zoom']").val(
					ui.values[1]
				);
				
				map.googleMap.setOptions({
					minZoom: ui.values[0],
					maxZoom: ui.values[1]
				});
			}
		});
		
		// Move polygon and polyline instructions from map edit panel into map element
		$(".wpgmza-google-map").append(
			$("#polygon-instructions")
		);
		
		$(".wpgmza-google-map").append(
			$("#polyline-instructions")
		);
		
		// Dynamic show/hide layers and points of interest
		$("input[name='bicycle']").on("change", function(event) {
			map.enableBicycleLayer(event.target.checked);
		});
		$("input[name='traffic']").on("change", function(event) {
			map.enableTrafficLayer(event.target.checked);
		});
		$("input[name='transport']").on("change", function(event) {
			map.enablePublicTransportLayer(event.target.checked);
		});
		$("input[name='show_points_of_interest']").on("change", function(event) {
			map.showPointsOfInterest(event.target.checked);
		});
		
		// Alignment and dimensions
		$("select[name='map_align']").on("change", function(event) {
			map.setAlignment(event.target.value);
		});
		
		// Polyfill for color pickers
		if(!window.Modernizr || !Modernizr.inputtypes.color)
			$("input[type='color']").spectrum();
		
		// Form submission
		$("form.wpgmza").submit(onSubmit);
		
		// Hide preloader
		$(".main-preloader").hide();
		$("form.wpgmza").show();
	});
})(jQuery);