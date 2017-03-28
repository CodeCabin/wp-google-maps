(function($) {
	var map;
	var rightClickCursor;
	var editMarkerTarget;
	var editPolygonTarget;
	var drawingManager;
	
	// TODO: Shouldn't touch googleMarker or googlePolygon here, it will be more code but the class should update those things itself, so that our users don't have to if they extend the plugin
	
	/**
	 * Utility function returns true is string is a latitude and longitude
	 * @return string
	 */
	function isLatLngString(str)
	{
		return str.match(/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/);
	}
	
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
	 * Updates the page based on form controls, display warnings, change distance units, etc.
	 * @return void
	 */
	function update()
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
	
	function enableMarkerButtons(enable)
	{
		$(".marker-buttons button").prop("disabled", !enable);
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
		
		// TODO: Show "right click to delete points" hint
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
		var polygon = new WPGMZA.Polygon(fields, googlePolygon);
		
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
		event.polygon.addEventListener("click", onPolygonClicked);
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
	 * Called when the form submits
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
		
		// Listen for bounds change
		map.addEventListener("bounds_changed", onBoundsChanged);
		
		// When the user clicks cancel edit button or blank space on the map, cancel editing marker
		google.maps.event.addListener(map.googleMap, "click", onCancelEditMarker);
		google.maps.event.addListener(map.googleMap, "click", onFinishEditingPolygon);
		
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
		$("form.wpgmza").on("change", update);
		update();
		
		// Marker buttons
		$("#add-marker, #update-marker").on("click", onSaveMarker);
		$("#cancel-marker-edit").on("click", onCancelEditMarker);
		$("#delete-marker").on("click", onDeleteMarker);
		
		// Polygon buttons
		$("#draw-polygon").on("click", onDrawPolygon);
		$("#finish-editing-polygon").on("click", onFinishEditingPolygon);
		$("#delete-polygon").on("click", onDeletePolygon);
		
		// Polygon input change listeners
		$("#polygons").find("input, textarea, select").on("change input", onPolygonSettingChanged);
		
		// Drawing manager for polygons and polylines
		drawingManager = new google.maps.drawing.DrawingManager({
			drawingControl: false,
			polygonOptions: {
				editable: true
			}
		});
		drawingManager.setMap(map.googleMap);
		google.maps.event.addListener(drawingManager, "polygoncomplete", onPolygonClosed);
		
		// Form submission
		$("form.wpgmza").submit(onSubmit);
	});
})(jQuery);