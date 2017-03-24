(function($) {
	var map;
	var rightClickCursor;
	var editMarkerTarget;
	
	/**
	 * Utility function returns true is string is a latitude and longitude
	 * @return string
	 */
	function isLatLngString(str)
	{
		return str.match(/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/);
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
		editMarkerTarget = marker;
		
		if(!marker)
		{
			$("input[name='address']").val("");
			$("#wpgmza-markers-tab").removeClass("update-marker").addClass("add-marker");
			return;
		}
		
		// Stop right click add if that was happening
		rightClickCursor.setMap(null);
		
		// Center on the marker
		map.setCenter(marker.marker.getPosition());
		
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
		
		rightClickCursor.setMap(map.map);
		rightClickCursor.setPosition(event.latLng);
	}
	
	/**
	 * Callback for when a WPGMZA marker is added
	 * @return void
	 */
	function onMarkerAdded(event)
	{
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
		// All tabs
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
		
		// Listen for left clicks on markers
		map.addEventListener("markeradded", onMarkerAdded);
		
		// Listen for bounds change
		map.addEventListener("bounds_changed", onBoundsChanged);
		
		// When the user clicks cancel edit button or blank space on the map, cancel editing marker
		google.maps.event.addListener(map.map, "click", onCancelEditMarker);
		
		// Set up right click marker adding
		rightClickCursor = new google.maps.Marker({
			draggable: true,
			icon: {
				url: $("[data-right-click-marker-image]").attr("data-right-click-marker-image"),
				anchor: new google.maps.Point(14, 39),
			}
		});
		
		google.maps.event.addListener(rightClickCursor, 'dragend', onRightClickMap);
		google.maps.event.addListener(map.map, 'rightclick', onRightClickMap);
		
		// Bind listener to update form on changes
		$("form.wpgmza").on("change", update);
		update();
		
		// Marker buttons
		$("#add-marker, #update-marker").on("click", onSaveMarker);
		$("#cancel-marker-edit").on("click", onCancelEditMarker);
		$("#delete-marker").on("click", onDeleteMarker);
		
		// Form submission
		$("form.wpgmza").submit(onSubmit);
	});
})(jQuery);