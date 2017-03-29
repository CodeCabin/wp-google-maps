(function($) {
	var map;
	var rightClickCursor;
	var editMarkerTarget;
	var editPolygonTarget;
	var editPolylineTarget;
	var drawingManager;
	var deleteMenu;
	
	// TODO: Shouldn't touch googleMarker or googlePolygon here, it will be more code but the class should update those things itself, so that our users don't have to if they extend the plugin (eg to make their own editor or similar). In other words, the marker object should be responsible for updating its own googleMarker on property change
	
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
		$(".marker-buttons button").prop("disabled", !enable);
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
			marker[$(this).attr("name")] = $(el).val();
		});
		
		marker.lat = latLng.lat();
		marker.lng = latLng.lng();
		
		if(!marker.map)
			map.addMarker(marker);
		map.setCenter(latLng);
		
		$("input[name='address']").val("");
		enableMarkerButtons(true);
		
		rightClickCursor.setMap(null);
		
		editMarker(marker);
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
		
		// TODO: Stop editing polygon
		
		// Center on the marker
		map.setCenter(marker.googleMarker.getPosition());
		
		// Fill the form with markers data
		$("#wpgmza-markers-tab").find("input, select, textarea").each(function(index, el) {
			var val = marker[$(el).attr("name")];
			
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
	 * Called when the user clicks delete marker in the markers tab
	 * @return void
	 */
	function onDeleteMarker(event)
	{
		var id = editMarkerTarget.id;
		
		$("form.wpgmza").append($("<input type='hidden' name='delete_markers[]' value='" + id + "'/>"));
		map.deleteMarker(editMarkerTarget);
		editMarker(null);
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
		
		enableMarkerButtons(false);
		$("#geocoder-error").hide();
		
		if(!isLatLngString(address))
		{
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({address: address}, onGeocoderResponse);
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
		
		$("form.wpgmza").append($("<input type='hidden' name='delete_polygons[]' value='" + id + "'/>"));
		map.deletePolygon(editPolygonTarget);
		editPolygon(null);
	}
	
	function onPolygonAdded(event)
	{
		// TODO: Unbind on remove
		var polygon = event.polygon;
		
		polygon.addEventListener("click", onPolygonClicked);
		google.maps.event.addListener(polygon.googlePolygon, "rightclick", function(e) {
			deleteMenu.open(map.googleMap, polygon.googlePolygon.getPath(), e.vertex);
		});
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
		
		$("form.wpgmza").append($("<input type='hidden' name='delete_polylines[]' value='" + id + "'/>"));
		map.deletePolygon(editPolylineTarget);
		editPolyline(null);
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
	
	function onPolylineAdded(event)
	{
		// TODO: Unbind on remove
		var polyline = event.polyline;
		
		polyline.addEventListener("click", onPolylineClicked);
		google.maps.event.addListener(polyline.googlePolyline, "rightclick", function(e) {
			deleteMenu.open(map.googleMap, polyline.googlePolyline.getPath(), e.vertex);
		});
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
	
	/**
	 * Called when the form submits. This function puts all the markers, 
	 * polygons and polylines in an array to be sent along with the rest 
	 * of the from data. Any deleted markers, polygons and polylines are 
	 * sent as hidden array input fields (see onDeleteMarker etc.)
	 * @return void
	 */
	function onSubmit(event)
	{
		var data = {
			markers: [],
			polygons: [],
			polylines: []
		};
		
		for(var i = 0; i < map.markers.length; i++)
			if(map.markers[i].modified)
				data.markers.push(map.markers[i].toJSON());
		
		for(i = 0; i < map.polygons.length; i++)
			if(map.polygons[i].modified)
				data.polygons.push(map.polygons[i].toJSON());
			
		for(i = 0; i < map.polygons.length; i++)
			if(map.polygons[i].modified)
				data.polygons.push(map.polygons[i].toJSON());
		
		// TODO: Send map lat and lng
		
		$("input[name='spatial-json']").val(JSON.stringify(data));
	}
	
	$(document).ready(function() {		
		// Main tabs
		$(".wpgmza-tabs").tabs();
		
		// Map start zoom slider
		$("#zoom-level-slider").slider({
			range: "max",
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
		
		// Set up radio buttons
		$("#themes input[type='radio']").on("change", function() {
			var str = $(this).attr("data-theme-json");
			var json = JSON.parse(str);
			str = JSON.stringify(json, undefined, 4);
			$("textarea[name='styling_data']").val(str);
		});
		
		// Create map
		var element = $(".wpgmza-map")[0];
		$(element).on("wpgmza_loaded", function() {
			$("#wpgmza-load-failed").remove();
		});
		map = new WPGMZA.Map(element);
		
		// Listen for markers, polygons and polylines being added
		map.addEventListener("markeradded", onMarkerAdded);
		map.addEventListener("polygonadded", onPolygonAdded);
		map.addEventListener("polylineadded", onPolylineAdded);
		
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
		deleteMenu = new WPGMZA.DeleteMenu();
		
		// Polyfill for color pickers
		if(!window.Modernizr || !Modernizr.inputtypes.color)
			$("input[type='color']").spectrum();
		
		// Form submission
		$("form.wpgmza").submit(onSubmit);
	});
})(jQuery);