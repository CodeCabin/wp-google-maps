(function($) {
	
	/**
	 * Map edit page constructor
	 * TODO: Break this up a bit, it's huge
	 */
	WPGMZA.MapEditPage = function()
	{
		var self = this;
		
		this.map = null;
		this.rightClickCursor = null;
		this.editMarkerTarget = null;
		this.editPolygonTarget = null;
		this.editPolylineTarget = null;
		this.drawingManager = null;
		this.deleteMenu = null;
		this.markerTable = null;
		this.onFetchEditMarkerID = null;
		this.unloadListenerBound = false;
		
		this.deleteIDs = {
			markers: [],
			polygons: [],
			polylines: []
		};
		
		// Main tabs
		$(".wpgmza-tabs").each(function(index, el) {
			var options = {};
			
			var active = 0;
			if(window.localStorage)
				active = parseInt(localStorage.getItem(el.id));
			
			options = {
				active: active,
				beforeActivate: function(event, ui) {
					self.finishEditing();
				},
				activate: function(event, ui) {
					self.onMapPanelTabActivated(event, ui);
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
				self.map.setZoom(ui.value);
			}
		});
		
		// Set up theme radio buttons
		$("#themes input[type='radio']").on("change", function(event) {
			// Grab JSON from the radio button
			var str = $(this).attr("data-theme-json");
			json = JSON.parse(str);
			
			// Pretty print the JSON
			str = JSON.stringify(json, undefined, 4);
			
			// Set the value into text field
			$("textarea[name='theme_data']").val(str);
			
			self.applyThemeData();
		});
		
		// Preview custom theme button
		$("#preview-custom-theme").on("click", function(event) {
			$("#themes input[type='radio']").prop("checked", false);
			
			self.applyThemeData();
		});
		
		// Get map instance
		this.map = WPGMZA.maps[0];
		
		// Listen for markers, polygons and polylines being added
		this.map.addEventListener("markeradded", function(event) {
			self.onMarkerAdded(event);
		});
		this.map.addEventListener("markerremoved", function(event) {
			self.onMarkerRemoved(event);
		});
		this.map.addEventListener("polygonadded", function(event) {
			self.onPolygonAdded(event);
		});
		this.map.addEventListener("polygonremoved", function(event) {
			self.onPolygonRemoved(event);
		});
		this.map.addEventListener("polylineadded", function(event) {
			self.onPolylineAdded(event);
		});
		this.map.addEventListener("fetchsuccess", function(event) {
			self.onMapFetchSuccess(event);
		});
		
		// Listen for bounds change
		this.map.addEventListener("bounds_changed", function(event) {
			self.onBoundsChanged(event);
		});
		
		// When the user clicks cancel edit button or blank space on the map, cancel editing marker
		google.maps.event.addListener(this.map.googleMap, "click", function(event) {
			self.onCancelEditMarker(event);
		});
		google.maps.event.addListener(this.map.googleMap, "click", function(event) {
			self.onFinishEditingPolygon(event);
		});
		google.maps.event.addListener(this.map.googleMap, "click", function(event) {
			self.onFinishEditingPolyline(event);
		});
		
		// Set up right click marker adding
		this.rightClickCursor = new google.maps.Marker({
			draggable: true,
			icon: {
				url: $("[data-right-click-marker-image]").attr("data-right-click-marker-image"),
				anchor: new google.maps.Point(14, 39),
			}
		});
		
		google.maps.event.addListener(this.rightClickCursor, 'dragend', function(event) {
			self.onRightClickMap(event);
		});
		google.maps.event.addListener(this.map.googleMap, 'rightclick', function(event) {
			self.onRightClickMap(event);
		});
		
		// Bind listener to update form on changes
		$("form.wpgmza").on("change", function(event) {
			self.onFormChanged(event);
		});
		this.onFormChanged();
		
		// Marker buttons
		$("#add-marker, #update-marker").on("click", function(event) { 
			self.onSaveMarker(event); 
		});
		$("#cancel-marker-edit").on("click", function(event) { 
			self.onCancelEditMarker(event); 
		});
		$("#delete-marker").on("click", function(event) { 
			self.onDeleteMarker(event); 
		});
		
		// Polygon buttons
		$("#draw-polygon").on("click", function(event) { 
			self.onDrawPolygon(event); 
		});
		$("#finish-editing-polygon").on("click", function(event) { 
			self.onFinishEditingPolygon(event); 
		});
		$("#delete-polygon").on("click", function(event) { 
			self.onDeletePolygon(event);
		});
		
		// Polyline buttons
		$("#draw-polyline").on("click", function(event) { 
			self.onDrawPolyline(event); 
		});
		$("#finish-editing-polyline").on("click", function(event) { 
			self.onFinishEditingPolyline(event); 
		});
		$("#delete-polyline").on("click", function(event) { 
			self.onDeletePolyline(event); 
		});
		
		// Polygon input change listeners
		$("#polygons").find("input, textarea, select").on("change input", function(event) { 
			self.onPolygonSettingChanged(event); 
		});
		
		// Polyline input change listeners
		$("#polylines").find("input, textarea, select").on("change input", function(event) { 
			self.onPolylineSettingChanged(event); 
		});
		
		// Drawing manager for polygons and polylines
		this.drawingManager = new google.maps.drawing.DrawingManager({
			drawingControl: false,
			polygonOptions: {
				editable: true
			},
			polylineOptions: {
				editable: true
			}
		});
		this.drawingManager.setMap(this.map.googleMap);
		google.maps.event.addListener(this.drawingManager, "polygoncomplete", function(event) {
			self.onPolygonClosed(event);
		});
		google.maps.event.addListener(this.drawingManager, "polylinecomplete", function(event) {
			self.onPolylineComplete(event);
		});
		
		// Right click delete menu for polygon and polyline points
		this.deleteMenu = new WPGMZA.DeleteMenu(this);
		
		// Marker table
		this.loadMarkerTable();
		
		// Listen for changes on "live" polygon and polyline forms (markers are flagged as modified by updateMarker, that form is not "live")
		$("#polygons").find("input, select, textarea").on("change", function(event) { 
			if(self.editPolygonTarget)
				self.editPolygonTarget.modified = true;
		});
		$("#polylines").find("input, select, textarea").on("change", function(event) {
			if(self.editPolylineTarget)
				self.editPolylineTarget.modified = true;
		});
		
		$("form.wpgmza").on("change", function(event) {
			self.bindUnloadListener();
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
				
				self.map.googleMap.setOptions({
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
			self.map.enableBicycleLayer(event.target.checked);
		});
		$("input[name='traffic']").on("change", function(event) {
			self.map.enableTrafficLayer(event.target.checked);
		});
		$("input[name='transport']").on("change", function(event) {
			self.map.enablePublicTransportLayer(event.target.checked);
		});
		$("input[name='show_points_of_interest']").on("change", function(event) {
			self.map.showPointsOfInterest(event.target.checked);
		});
		
		// Alignment and dimensions
		$("select[name='map_align']").on("change", function(event) {
			self.map.setAlignment(event.target.value);
		});
		
		// Polyfill for color pickers
		if(!window.Modernizr || !Modernizr.inputtypes.color)
			$("input[type='color']").spectrum();
		
		// Form submission
		$("form.wpgmza").submit(function(event) {
			self.onSubmit(event)
		});
		
		// Clear marker fields
		this.clearMarkerFields();
		
		// Show instructions for the active map panel tab
		var active = $("#map-edit-tabs").tabs("option", "active");
		var panel = $("#map-edit-tabs>div")[active];
		if(panel)
		{
			var id = $(panel).attr("id");
			this.showMapInstructions(id.replace(/s$/, ""));
		}
		
		// Escape key finishes editing
		$(document).on("keyup", function(event) {
			if(event.keyCode == 27)
				self.finishEditing();
		});
		
		// Hide preloader
		$(".main-preloader").hide();
		$("form.wpgmza").show();
	}

	// TODO: Shouldn't touch googleMarker or googlePolygon here, it will be more code but the class should update those things itself, so that our users don't have to if they extend the plugin (eg to make their own editor or similar). In other words, the marker object should be responsible for updating its own googleMarker on property change, and this should be a wrapper
	
	/**
	 * Returns the index of the tab with specified ID, used to switch tabs programatically
	 * @return int|null
	 */
	WPGMZA.MapEditPage.prototype.getTabIndexByID = function(id)
	{
		var result = null;
		$("#map-edit-tabs .ui-tabs-nav a").each(function(index, el) {
			if($(el).attr("href") == "#" + id)
			{
				result = index;
				return false;
			}
		});
		return result;
	}
	
	// Marker Functions ///////////////////////
	WPGMZA.MapEditPage.prototype.enableMarkerButtons = function(enable)
	{
		$("#marker-buttons button").prop("disabled", !enable);
	}
	
	/**
	 * Creates a marker at the specified coordinates, and puts the data from the markers tab into it
	 * @return WPGMZA.Marker
	 */
	WPGMZA.MapEditPage.prototype.updateMarker = function(latLng, preventRefreshControls)
	{
		var marker;
		if(this.editMarkerTarget)
			marker = this.editMarkerTarget;
		else
			marker = WPGMZA.createMarkerInstance();
		
		$("#wpgmza-markers-tab").find("input[name], select[name], textarea[name]").each(function(index, el) {
			var name = $(this).attr("name");
			var value = $(el).val();
			
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
			this.map.addMarker(marker);
		this.map.googleMap.panTo(latLng);
		
		$("input[name='address']").val("");
		this.enableMarkerButtons(true);
		
		this.rightClickCursor.setMap(null);
		
		marker.modified = true;
		this.bindUnloadListener();
		
		if(!preventRefreshControls)
			this.editMarker(marker);
		
		return marker;
	}
	
	/**
	 * Clears all fields in the marker tab
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.clearMarkerFields = function()
	{
		$("#wpgmza-markers-tab").find("input[name], textarea[name], select[name]").each(function(index, el) {
			switch(String($(el).attr("type")).toLowerCase())
			{
				case "radio":
				case "checkbox":
					var checked = false;
					
					if($(el).attr("name") == "approved")
						checked = true;
					
					$(el).prop("checked", checked);				
					break;
				
				default:
					if($(el).prop("tagName").toLowerCase() == "select")
						$(el).val(
							$(el).find("option:first-child").val()
						);
					else
						$(el).val("");
					break;
			}
		});
	}
	
	/**
	 * Call this WPGMZA.MapEditPage.prototype.to = function begin editing the specified marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.editMarker = function(marker)
	{
		// Stop right click add if that was happening
		this.rightClickCursor.setMap(null);
		
		// Set edit marker target
		this.editMarkerTarget = marker;
		
		if(!marker)
		{
			// Clear marker fields
			this.clearMarkerFields();
			$("#wpgmza-markers-tab").removeClass("update-marker").addClass("add-marker");
			return;
		}
		
		// Select the marker tab
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: 0
		});
		
		// Stop editing polygons / polylines
		this.editPolygon(null);
		this.editPolyline(null);
		
		// Center on the marker
		this.map.googleMap.panTo(marker.googleMarker.getPosition());
		
		// Fill the form with markers data
		$("#wpgmza-markers-tab").find("input, select, textarea").each(function(index, el) {
			if($(el).parents(".wp-editor-wrap").length)
				return;
			
			var name = $(el).attr("name"), val;
			if(marker.hasOwnProperty(name))
				val = marker[name];
			else
				val = marker.settings[name];
			
			switch(String($(el).attr("type")).toLowerCase())
			{
				case "checkbox":
				case "radio":
					$(el).prop("checked", val);
					break;
				
				default:
					$(el).val(val);
					break;
			}
			
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
	WPGMZA.MapEditPage.prototype.onCancelEditMarker = function(event)
	{
		this.editMarker(null);
	}
	
	/**
	 * Called when user deletes a marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.deleteMarkerByID = function(id)
	{
		this.deleteIDs.markers.push(id);
		this.map.deleteMarkerByID(id);
	}
	
	/**
	 * Called when the user clicks delete marker in the markers tab
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onDeleteMarker = function(event)
	{
		this.deleteMarkerByID(this.editMarkerTarget.id);
		this.editMarker(null);
		this.markerTable.refresh();
		this.bindUnloadListener();
	}
	
	/**
	 * Called when the user right clicks on the map
	 * NB: Some of this code might have to be moved to the Map object to 
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onRightClickMap = function(event)
	{
		// Stop editing marker, do this before setting the address input value as it clears it
		this.editMarker(null);
		
		var value = event.latLng.toString().replace(/[() ]/g, "");
		$("input[name='address']").val(value);
		
		this.rightClickCursor.setMap(this.map.googleMap);
		this.rightClickCursor.setPosition(event.latLng);
	}
	
	/**
	 * Called when the user clicks add marker or save marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onSaveMarker = function()
	{
		var self = this;
		var address = $("form.wpgmza input[name='address']").val();
		
		$("#geocoder-error").hide();
		
		if(!WPGMZA.isLatLngString(address))
		{
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({address: address}, function(results, status) {
				self.onGeocoderResponse(results, status);
			});
			this.enableMarkerButtons(false);
		}
		else
		{
			var parts = address.split(",");
			var latLng = new google.maps.LatLng(parts[0], parts[1]);
			this.updateMarker(latLng);
		}
	}
	
	/**
	 * Called when the geocoder returns a response from save / add marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onGeocoderResponse = function(results, status)
	{
		this.enableMarkerButtons(true);
		
		if(status != google.maps.GeocoderStatus.OK)
		{
			$("#geocoder-error").show();
			$("input[name='address']").focus().select();
			return;
		}
		
		var result = results[0];
		var latLng = result.geometry.location;
		
		this.updateMarker(latLng);
	}
	
	
	/**
	 * Callback for when a WPGMZA marker is added
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onMarkerAdded = function(event)
	{
		// TODO: Unbind on remove
		var self = this;
		event.marker.addEventListener("click", function(event) {
			self.onMarkerClicked(event);
		});
	}
	
	/**
	 * Callback for when a WPGMZA marker is removed
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onMarkerRemoved = function(event)
	{
		event.marker.removeEventListener("click", function(event) {
			onMarkerClicked(event);
		});
	}
	
	/**
	 * Called when the user clicks on the map
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onMarkerClicked = function(event) 
	{
		this.editMarker(event.target);
	}
	
	// Polygon Functions //////////////////////
	 
	/**
	 * Utility WPGMZA.MapEditPage.prototype.to = function get polygon fields without the polygon- prefix
	 * @return object
	 */
	WPGMZA.MapEditPage.prototype.getPolygonFields = function()
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
	WPGMZA.MapEditPage.prototype.editPolygon = function(polygon)
	{
		var prevTarget = this.editPolygonTarget;
		this.editPolygonTarget = polygon;
		
		if(prevTarget)
			prevTarget.googlePolygon.setOptions({editable: false});
		
		if(!polygon)
		{
			$("#polygons input:not([type])").val("");
			$("#polygons").removeClass("update-polygon").addClass("add-polygon");
			this.drawingManager.setDrawingMode(null);
			return;
		}
		
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("polygons")
		});
		
		// TODO: Fit polygon bounds?
		
		polygon.googlePolygon.setOptions({editable: true});
		
		$("input[name='polygon-name']").val(polygon.name);
		
		$("#polygons input").each(function(index, el) {
			if($(el).prop("disabled"))
				return;
			
			var nameWithoutPrefix = $(el).attr("name").replace(/^polygon-/, "");
			$(el).val(polygon.settings[nameWithoutPrefix]);
		});
		
		$("#polygons").removeClass("add-polygon").addClass("update-polygon");
	}
	
	/**
	 * Called when user clicks draw polygon or clicks on a polygon
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onDrawPolygon = function(event)
	{
		var fields = this.getPolygonFields();
		this.drawingManager.setOptions({
			polygonOptions: fields
		});
		this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonClosed = function(googlePolygon)
	{
		var fields = this.getPolygonFields();
		var polygon = WPGMZA.createPolygonInstance({settings: fields}, googlePolygon);
		
		polygon.modified = true;
		this.bindUnloadListener();
		
		this.drawingManager.setDrawingMode(null);
		this.map.addPolygon(polygon);
		
		this.editPolygon(polygon);
	}
	
	/**
	 * Called when the user clicks finish editing polygon, or clicks off the polygon tab
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onFinishEditingPolygon = function(event)
	{
		this.editPolygon(null);
	}
	
	/**
	 * Called when the user clicks delete polygon
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onDeletePolygon = function(event)
	{
		var id = this.editPolygonTarget.id;
		
		this.deleteIDs.polygons.push(id);
		this.map.deletePolygon(this.editPolygonTarget);
		this.editPolygon(null);
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonModified = function(vertex)
	{
		this.editPolygonTarget.modified = true;
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonAdded = function(event)
	{
		// TODO: Unbind on remove
		var self = this;
		var polygon = event.polygon;
		
		polygon.addEventListener("click", function(event) {
			self.onPolygonClicked(event);
		});
		
		polygon.rightClickListener = google.maps.event.addListener(polygon.googlePolygon, "rightclick", function(e) {
			self.deleteMenu.open(self.map.googleMap, polygon.googlePolygon.getPath(), e.vertex);
		});
		
		polygon.googlePolygon.getPaths().forEach(function(path, index) {
			google.maps.event.addListener(path, "insert_at", function(event) {
				self.onPolygonModified(event);
			});
			google.maps.event.addListener(path, "remove_at", function(event) {
				self.onPolygonModified(event);
			})
			google.maps.event.addListener(path, "set_at", function(event) {
				self.onPolygonModified(event);
			});
		});
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonRemoved = function(event)
	{
		event.polygon.removeEventListener("click", onPolygonClicked);
		google.maps.event.removeListener(event.polygon.rightClickListener);
		delete polygon.rightClickListener;
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonClicked = function(event)
	{
		this.editPolygon(event.target);
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonSettingChanged = function(event)
	{
		if(!this.editPolygonTarget)
			return;
		
		var name = event.target.name.replace(/^polygon-/, "");
		var value = $(event.target).val();
		
		if(this.editPolygonTarget.hasOwnProperty(name))
			this.editPolygonTarget[name] = value;
		else
			this.editPolygonTarget.settings[name] = value;
		
		// NB: Options have to be passed like this so that the property name is a literal and not a string
		var options = {};
		options[name] = value;
		this.editPolygonTarget.googlePolygon.setOptions(options);
	}
	
	// Polyline Functions /////////////////////
	WPGMZA.MapEditPage.prototype.getPolylineFields = function()
	{
		var fields = {};
		
		$("#polylines").find("input, select, textarea").each(function(index, el) {
			var name = $(el).attr("name").replace(/^polyline-/, "");
			fields[name] = $(el).val();
		});
		
		return fields;
	}
	
	WPGMZA.MapEditPage.prototype.editPolyline = function(polyline)
	{
		var prevTarget = this.editPolylineTarget;
		this.editPolylineTarget = polyline;
		
		if(prevTarget)
			prevTarget.googlePolyline.setOptions({editable: false});
		
		if(!polyline)
		{
			$("input[name='polyline-name']").val("");
			$("#polylines").removeClass("update-polyline").addClass("add-polyline");
			this.drawingManager.setDrawingMode(null);
			return;
		}
		
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("polylines")
		});
		
		// TODO: Fit polyline bounds
		
		polyline.googlePolyline.setOptions({editable: true});
		
		$("#polylines input").each(function(index, el) {
			if($(el).prop("disabled"))
				return;
			
			var nameWithoutPrefix = $(el).attr("name").replace(/^polyline-/, "");
			$(el).val(polyline.settings[nameWithoutPrefix]);
		});
		
		$("input[name='polyline-title']").val(polyline.title);
		
		$("#polylines").removeClass("add-polyline").addClass("update-polyline");
	}
	
	WPGMZA.MapEditPage.prototype.onDrawPolyline = function(event)
	{
		var fields = this.getPolylineFields();
		this.drawingManager.setOptions({
			polylineOptions: fields
		});
		this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineComplete = function(googlePolyline)
	{
		var fields = this.getPolylineFields();
		var polyline = new WPGMZA.Polyline({settings: fields}, googlePolyline);
		
		polyline.modified = true;
		this.bindUnloadListener();
		
		this.drawingManager.setDrawingMode(null);
		this.map.addPolyline(polyline);
		
		this.editPolyline(polyline);
	}
	
	WPGMZA.MapEditPage.prototype.onFinishEditingPolyline = function(event)
	{
		this.editPolyline(null);
	}
	
	WPGMZA.MapEditPage.prototype.onDeletePolyline = function(event)
	{
		var id = this.editPolylineTarget.id;
		
		this.deleteIDs.polylines.push(id);
		this.map.deletePolyline(this.editPolylineTarget);
		this.editPolyline(null);
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineSettingChanged = function(event)
	{
		if(!this.editPolylineTarget)
			return;
		
		var name = event.target.name.replace(/^polyline-/, "");
		var value = $(event.target).val();
		
		if(this.editPolylineTarget.hasOwnProperty(name))
			this.editPolylineTarget[name] = value;
		else
			this.editPolylineTarget.settings[name] = value;
		
		// NB: Options have to be passed like this so that the property name is a literal and not a string
		var options = {};
		options[name] = value;
		this.editPolylineTarget.googlePolyline.setOptions(options);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineModified = function(vertex)
	{
		this.editPolylineTarget.modified = true;
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineAdded = function(event)
	{
		var self = this;
		var polyline = event.polyline;
		
		polyline.addEventListener("click", function(event) {
			self.onPolylineClicked(event);
		});
		polyline.rightClickListener = google.maps.event.addListener(polyline.googlePolyline, "rightclick", function(e) {
			deleteMenu.open(self.map.googleMap, polyline.googlePolyline.getPath(), e.vertex);
		});
		
		var path = polyline.googlePolyline.getPath();
		google.maps.event.addListener(path, "insert_at", function(event) {
			self.onPolylineModified(event);
		});
		google.maps.event.addListener(path, "remove_at", function(event) {
			self.onPolylineModified(event);
		});
		google.maps.event.addListener(path, "set_at", function(event) {
			self.onPolylineModified(event);
		});
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineRemoved = function(event)
	{
		polyline.removeEventListener("click", onPolylineClicked);
		google.maps.event.removeListener(polyline.rightClickListener);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineClicked = function(event)
	{
		this.editPolyline(event.target);
	}
	
	// General Functions //////////////////////
	/**
	 * Updates the page based on form controls, display warnings, change distance units, etc.
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onFormChanged = function()
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
		
		if(this.map.storeLocator)
			this.map.storeLocator.setUnits(input.prop("checked"));
	}
	
	/**
	 * Called when the map bounds change
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onBoundsChanged = function(event)
	{
		var latLng = this.map.getCenter();
		var zoom = this.map.getZoom();
		
		$("input[name='start_location']").val(latLng.toString());
		$("input[name='start_zoom']").val(zoom);
		
		$("#zoom-level-slider").slider("value", zoom);
		
		this.bindUnloadListener();
	}

	WPGMZA.MapEditPage.prototype.onBeforeUnload = function(event)
	{
		var confirmationMessage = "Are you sure you want to leave without saving your changes?";
		
		event.preventDefault();
		event.returnValue = confirmationMessage;
		
		return confirmationMessage;
	}
	
	WPGMZA.MapEditPage.prototype.bindUnloadListener = function(event)
	{
		if(this.unloadListenerBound)
			return;
		
		window.addEventListener("beforeunload", this.onBeforeUnload);
		
		this.unloadListenerBound = true;
	}
	
	WPGMZA.MapEditPage.prototype.applyThemeData = function()
	{
		var str = $("textarea[name='theme_data']").val();
		
		try{
			var json = JSON.parse(str);
		}catch(e) {
			alert(e.message);
			return;
		}
		
		var data = $.extend(json, {name: "Styled Map"});
		var styledMapType = new google.maps.StyledMapType(data);
		this.map.googleMap.mapTypes.set("styled_map", styledMapType);
		this.map.googleMap.setMapTypeId("styled_map");
		
		// Respect points of interest stylers after applying the theme
		this.map.showPointsOfInterest(
			$("input[name='show_points_of_interest]").prop("checked")
		);
	}
	
	WPGMZA.MapEditPage.prototype.showMapInstructions = function(type)
	{
		$(".wpgmza-google-map *[id$='instructions']").hide();
		$("#" + type + "-instructions").show();
	}
	
	WPGMZA.MapEditPage.prototype.onMapPanelTabActivated = function(event, ui)
	{
		// Show/hide the relevant instructions
		var singular = ui.newPanel.attr("id").replace(/s$/, "");
		this.showMapInstructions(singular);
		
		// Remember this tab
		var target = event.target;
		if(window.localStorage)
			localStorage.setItem(target.id, $(target).tabs("option", "active"));
	}
	
	// Marker list functions //////////////////
	/**
	 * This WPGMZA.MapEditPage.prototype.adds = function the mark checkboxes and edit controls to the marker list, extending it beyond its front end default setup
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.loadMarkerTable = function()
	{
		// Add admin controls to marker table
		var self = this;
		var element = $("#marker-table-container .wpgmza-datatable")[0];
		
		this.markerTable = new WPGMZA.DataTable(element, {
			"ajax": {
				"data":	function(data) {
					return $.extend({}, data, {
						"action": 		$(element).attr("data-ajax-action"),
						"map_id": 		$(element).attr("data-map-id"),
						"exclude_ids":	self.deleteIDs.markers.join(",")
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
		
		$("#marker-table-container").on("click", ".edit-marker", function(event) { self.onTableRowEditMarker(event); });
		$("#marker-table-container").on("click", ".delete-marker", function(event) { self.onTableRowDeleteMarker(event); });
		
		$("#marker-table-container").find("thead>tr, tfoot>tr").prepend("<th>Mark</th>");
		$("#marker-table-container").find("thead>tr, tfoot>tr").append("<th>Actions</th>");
		
		$("#marker-bulk-buttons .select-all").on("click", function(event) { self.onSelectAllMarkers(event); });
		$("#marker-bulk-buttons .bulk-delete").on("click", function(event) { self.onBulkDeleteMarkers(event); });
	}
	
	/**
	 * Called when the user clicks to edit a marker in the marker table
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onTableRowEditMarker = function(event)
	{
		var td = $(event.target).closest("td");
		var id = td.attr("data-marker-id");
		
		var latLng = new google.maps.LatLng({
			lat: parseFloat(td.attr("data-lat")),
			lng: parseFloat(td.attr("data-lng"))
		});
		
		var marker;
		if(marker = this.map.getMarkerByID(id))
			this.editMarker(marker);	// Marker loaded, go straight to editing it
		else
			this.onFetchEditMarkerID = id; // Marker not loaded, remember to edit it once fetch completes
		
		this.map.googleMap.panTo(latLng);
	}
	
	/**
	 * Called when the user clicks to delete a marker in the marker table
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onTableRowDeleteMarker = function(event)
	{
		var td = $(event.target).closest("td");
		var id = td.attr("data-marker-id");
		
		// Add the marker to the list of markers to be deleted
		this.deleteMarkerByID(id);
		
		// If the marker is open in the edit menu, finish editing
		if(this.editMarkerTarget && this.editMarkerTarget.id == id)
			this.editMarker(null);
		
		// Refresh the table
		this.markerTable.refresh();
		
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onMapFetchSuccess = function(event)
	{
		if(!this.onFetchEditMarkerID)
			return;
		
		this.editMarker(this.map.getMarkerByID(this.onFetchEditMarkerID));
		
		this.onFetchEditMarkerID = null;
	}
	
	WPGMZA.MapEditPage.prototype.onSelectAllMarkers = function(event)
	{
		$("#marker-table-container .wpgmza-datatable input[type='checkbox']").prop("checked", true);
	}
	
	WPGMZA.MapEditPage.prototype.onBulkDeleteMarkers = function(event)
	{
		$("#marker-table-container tbody>tr").each(function(index, el) {
			if($(el).find(".mark").prop("checked") == false)
				return;
			
			var marker_id = $(el).find("[data-marker-id]").attr("data-marker-id");
			this.deleteMarkerByID(marker_id);
		});
		
		this.markerTable.refresh();
		this.bindUnloadListener();
	}
	
	// General functions //////////////////////
	
	/**
	 * This function will cancel any editing taking place, useful when switching tabs, pressing ESC, etc.
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.finishEditing = function()
	{
		this.editMarker(null);
		this.editPolygon(null);
		this.editPolyline(null);
	}
	
	/**
	 * Gets all map object data as JSON to be submitted
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.getMapObjectData = function()
	{
		// Map Objects
		var data = {
			markers: [],
			polygons: [],
			polylines: [],
			deleteIDs: this.deleteIDs
		};
		
		for(var i = 0; i < this.map.markers.length; i++)
			if(this.map.markers[i].modified)
				data.markers.push(this.map.markers[i].toJSON());
		
		for(i = 0; i < this.map.polygons.length; i++)
			if(this.map.polygons[i].modified)
				data.polygons.push(this.map.polygons[i].toJSON());
			
		for(i = 0; i < this.map.polylines.length; i++)
			if(this.map.polylines[i].modified)
				data.polylines.push(this.map.polylines[i].toJSON());
		
		return data;
	}
	
	/**
	 * Called when the form submits. This WPGMZA.MapEditPage.prototype.puts = function all the markers, 
	 * polygons and polylines in an array to be sent along with the rest 
	 * of the from data. Any deleted markers, polygons and polylines are 
	 * sent in deleteIDs
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onSubmit = function(event)
	{
		// Get the map object data
		var data = this.getMapObjectData();
		var input = $("<input name='map-objects'/>");
		input.val(JSON.stringify(data));
		$("form.wpgmza").append(input);
		
		// Disable marker, polygon, polyline and heatmap inputs so they don't get sent to the server, they conflict with other inputs
		$("#wpgmza_map_panel *:input").prop("disabled", true);
		
		// Unbind the beforeunload listener
		window.removeEventListener("beforeunload", this.onBeforeUnload);
	}
	
	$(document).ready(function() {
		if(WPGMZA.ProMapEditPage)
			WPGMZA.mapEditPage = new WPGMZA.ProMapEditPage();
		else
			WPGMZA.mapEditPage = new WPGMZA.MapEditPage();
	});
})(jQuery);