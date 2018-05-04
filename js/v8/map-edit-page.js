/**
 * @namespace WPGMZA
 * @module MapEditPage
 * @requires WPGMZA.Map
 */
(function($) {
	
	/**
	 * Map edit page constructor
	 * TODO: Break this up a bit into smaller functions, it's huge
	 */
	WPGMZA.MapEditPage = function()
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "MapEditPage");
		
		this.map = null;
		this.rightClickCursor = null;
		this.editMapObjectTarget = null;
		this.drawingManager = null;
		this.onFetchEditMarkerID = null;
		this.unloadListenerBound = false;
		this.initialBoundsChanged = true;
		
		this.deleteIDs = {
			markers: [],
			polygons: [],
			polylines: []
		};
		
		// Main tabs
		$(".wpgmza-tabs").each(function(index, el) {
			var options = {};
			
			var active = 0;
			if(window.sessionStorage)
				active = parseInt(sessionStorage.getItem(el.id));
			
			options = {
				active: active,
				beforeActivate: function(event, ui) {
					self.finishEditingMapObject();
				},
				activate: function(event, ui) {
					self.onMapPanelTabActivated(event, ui);
				}
			};
				
			$(el).tabs(options);
		});
		
		// Settings accordion
		var active = 0;
		if(window.sessionStorage)
			active = parseInt(sessionStorage.getItem("wpgmza-map-edit-page-accordion"));
		$(".wpgmza-accordion").accordion({
			heightStyle: "content",
			autoHeight: false,
			clearStyle: true,
			collapsible: true,
			active: active,
			activate: function(event, ui) {
				if(window.sessionStorage)
					sessionStorage.setItem("wpgmza-map-edit-page-accordion", $(event.target).accordion("option", "active"));
			}
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
		
		// Preview mode
		function onPreviewMode(event)
		{
			if($("input[name='preview_mode']").prop("checked"))
				$("#wpgmza-map-edit-page").addClass("wpgmza-preview-front-end");
			else
				$("#wpgmza-map-edit-page").removeClass("wpgmza-preview-front-end");
		}
		$("input[name='preview_mode']").on("change", onPreviewMode);
		onPreviewMode();
		
		// Get map instance
		this.map = WPGMZA.maps[0];
		
		// Listen for markers, polygons and polylines being added
		self.map.markers.forEach(function(marker) {
			self.onMarkerAdded({marker: marker});
		});
		
		self.map.polygons.forEach(function(polygon) {
			self.onPolygonAdded({polygon: polygon});
		});
		
		self.map.polylines.forEach(function(polyline) {
			self.onPolylineAdded({polyline: polyline});
		});
		
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
		this.map.addEventListener("boundschanged", function(event) {
			self.onBoundsChanged(event);
		});
		
		// When the user clicks cancel edit button or blank space on the map, cancel editing marker
		this.map.addEventListener("click", function(event) {
			if(event.target instanceof WPGMZA.Map)
				self.finishEditingMapObject();
		});
		
		// Set up right click marker adding
		this.rightClickCursor = WPGMZA.Marker.createInstance({
			draggable: true
		});
		
		// TODO: This should really be on the OSMMapEditPage class
		if(WPGMZA.OSMMapEditPage && this instanceof WPGMZA.OSMMapEditPage)
			$(this.rightClickCursor.element).addClass("wpgmza-right-click-marker");
		
		this.rightClickCursor.setVisible(false);
		
		function placeRightClickMarker(event) {
			self.onRightClickMap(event);
		}
		
		this.map.addEventListener("rightclick", placeRightClickMarker);
		this.rightClickCursor.addEventListener("dragend", placeRightClickMarker);

		// Lock start viewport
		function onLockStartViewport(event) {
			var locked = $("input[name='lock_start_viewport']").prop("checked");
			
            $("input[name='start_location'], input[name='start_zoom']").prop("disabled", locked);
			$("button#view-locked-viewport").prop("disabled", !locked);
        }
		
        $("#lock_start_viewport").on("change", onLockStartViewport);
        onLockStartViewport();
		
		$("button#view-locked-viewport").on("click", function(event) {
			var center = WPGMZA.stringToLatLng($("input[name='start_location']").val());
			var zoom = parseInt( $("input[name='start_zoom']").val() );
			
			self.map.setCenter(center);
			self.map.setZoom(zoom);
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
			self.finishEditingMapObject();
		});
		$("#delete-marker").on("click", function(event) { 
			self.onDeleteMarker(event); 
		});
		
		// Polygon buttons
		$("#draw-polygon").on("click", function(event) {
			WPGMZA.animateScroll($(".wpgmza-engine-map"));
			self.onDrawPolygon(event); 
		});
		$("#finish-editing-polygon").on("click", function(event) { 
			self.finishEditingMapObject();
		});
		$("#delete-polygon").on("click", function(event) { 
			self.onDeletePolygon(event);
		});
		
		// Polyline buttons
		$("#draw-polyline").on("click", function(event) {
            WPGMZA.animateScroll($(".wpgmza-engine-map"));
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
		this.drawingManager = WPGMZA.DrawingManager.createInstance(this.map);
		this.drawingManager.addEventListener("polygonclosed", function(event) {
			self.onPolygonClosed(event);
		});
		this.drawingManager.addEventListener("polylinecomplete", function(event) {
			self.onPolylineComplete(event);
		});
		
		// Right click delete menu for polygon and polyline points
		this.vertexContextMenu = this.createVertexContextMenuInstance();
		
		// Marker table
		this.loadMapObjectTables();
		
		// Listen for changes on "live" polygon and polyline forms (markers are flagged as modified by createOrUpdateMarker, that form is not "live")
		$("#polygons").find("input, select, textarea").on("change", function(event) { 
			if(self.editMapObjectTarget instanceof WPGMZA.Polygon)
				self.editMapObjectTarget.modified = true;
		});
		$("#polylines").find("input, select, textarea").on("change", function(event) {
			if(self.editMapObjectTarget)
				self.editMapObjectTarget.modified = true;
		});
		
		// Marker drag
		this.map.on("dragend", function(event) {
			event.target.modified = true;
			event.target.settings.dragged = true;
			
			if(self.editMapObjectTarget instanceof WPGMZA.Marker && event.target == self.editMapObjectTarget)
			{
				var latLng = self.editMapObjectTarget.getPosition();
				$("input[name='lat']").val(latLng.lat);
				$("input[name='lng']").val(latLng.lng);
				$("[name='dragged']").prop("checked", true);
			}
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
				self.onZoomLimitsChanged(event, ui);
			}
		});
		
		// Move polygon and polyline instructions from map edit panel into map element
		$(".wpgmza-engine-map").append(
			$("#markers-instructions")
		);
		
		$(".wpgmza-engine-map").append(
			$("#polygon-instructions")
		);
		
		$(".wpgmza-engine-map").append(
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
				self.finishEditingMapObject();
		});
		
		// Large polyline warning dialog
		$("#wpgmza-big-polyline-dialog").remodal();
		
		// General layout
		$("select[name='general_layout']").on("change", function(event) {
			self.onGeneralLayoutChanged(event);
		});
		
		// Layout system
		/*var mouseX, mouseY;
		
		$("[data-wpgmza-layout-element]").each(function(index, el) {
			$(el).append($("<div class='wpgmza-layout-handle' data-for='" + $(el).attr("data-wpgmza-layout-element") + "'><i class='fa fa-arrows' aria-hidden='true'></i></div>"));
		});
		
		$(document).on("mousemove", function(event) {
			mouseX = event.clientX;
			mouseY = event.clientY;
		});
		
		$(".wpgmza-map").sortable({
			handle: ".wpgmza-layout-handle",
			items: "[data-wpgmza-layout-element]",
			start: function(event, ui) {
				$("#wpgmza-map-container").addClass("wpgmza-layout-dragging");
			},
			stop: function(event, ui) {
				var el = document.elementFromPoint(mouseX, mouseY);
				
				function removeStyle(elem, name)
				{
					if (elem.style.removeProperty)
						elem.style.removeProperty(name);
					else
						elem.style.removeAttribute(name);
				}
				
				removeStyle(ui.item[0], "position");
				removeStyle(ui.item[0], "left");
				removeStyle(ui.item[0], "top");
				
				$("#wpgmza-map-container").removeClass("wpgmza-layout-dragging");
				
				if(!$(el).hasClass("wpgmza-cell") || $(el).attr("data-grid-postiion") == "center")
					return;
				
				if($(el).children().length)
					return;
				
				if($.contains(ui.item[0], el))
					return;
				
				$(el).append(ui.item);
			}
		});*/
		
		var mouseX, mouseY;
		
		$(document).on("mousemove", function(event) {
			mouseX = event.clientX;
			mouseY = event.clientY;
		});
		
		$("#wpgmza-layout-editor").sortable({
			stop: function(event, ui) {
				var el = document.elementFromPoint(mouseX, mouseY);
				
				function removeStyle(elem, name)
				{
					if (elem.style.removeProperty)
						elem.style.removeProperty(name);
					else
						elem.style.removeAttribute(name);
				}
				
				removeStyle(ui.item[0], "position");
				removeStyle(ui.item[0], "left");
				removeStyle(ui.item[0], "top");
				
				if(!$(el).hasClass("wpgmza-cell") || $(el).attr("data-grid-postiion") == "center")
					return;
				
				if($(el).children().length)
					return;
				
				if($.contains(ui.item[0], el))
					return;
				
				$(el).append(ui.item);
			}
		});
		
		this.setLayout();
		
		// When the user presses enter in the address input, 
		$('form.wpgmza').on('keydown', function( e ){
			if (e.keyCode == 13 && $(e.target).attr('name') == 'address') {
				
				if(!self.editMapObjectTarget || self.editMapObjectTarget.id == -1)
					$("#add-marker").click();
				else
					$("#update-marker").click();
				
				return false;
		    }	
		});
		
		// Live latitude / longitude edit
		$("input[name='lat'], input[name='lng']").on("input", function(event) {
			
			if(!(self.editMapObjectTarget instanceof WPGMZA.Marker))
				return;
			
			var marker = self.editMapObjectTarget;
			
			marker.setPosition({
				lat: $("input[name='lat']").val(),
				lng: $("input[name='lng']").val()
			});
			
			$("input[name='dragged']").prop("checked", true);
			
		});
		
		// Hide preloader
		$("#wpgmza-map-edit-page>.wpgmza-preloader").remove();
		$("form.wpgmza").show();
	}
	
	WPGMZA.MapEditPage.getConstructor = function()
	{
		var pro = WPGMZA.isProVersion();
		
		switch(WPGMZA.settings.engine)
		{
			case "google-maps":
				return (pro ? WPGMZA.GoogleProMapEditPage : WPGMZA.GoogleMapEditPage);
				break;
			
			default:
				return (pro ? WPGMZA.OSMProMapEditPage : WPGMZA.OSMMapEditPage);
				break;
		}
	}
	
	WPGMZA.MapEditPage.createInstance = function()
	{
		var constructor = WPGMZA.MapEditPage.getConstructor();
		return new constructor();
	}
	
	/**
	 * Gets the name of an input without it's prefix
	 * @return string
	 */
	WPGMZA.MapEditPage.prototype.getInputNameWithoutPrefix = function(name)
	{
		return name.replace(/^(polygon|polyline|heatmap)?-/, "");
	}
	
	/**
	 * Gets the value of a field
	 * @return mixed
	 */
	WPGMZA.MapEditPage.prototype.getFieldValue = function(input)
	{
		var type = input.type.toLowerCase();
		var value;
		
		switch(type)
		{
			case "checkbox":
			case "radio":
				value = $(input).prop("checked");
				break;
			
			default:
				value = $(input).val();
				break;
		}
		
		return value;
	}

	/**
	 * Puts the value of the input into the settings or directly on to the specified map object
	 * Removes the inputs prefix if it has one, and correctly gets the value of select elements
	 * @return string the value
	 */
	WPGMZA.MapEditPage.prototype.inputValueToMapObjectProperty = function(input, mapObject)
	{
		var name = this.getInputNameWithoutPrefix(input.name);
		var value = this.getFieldValue(input);
		
		if(mapObject.hasOwnProperty(name))
			mapObject[name] = value;
		else
			mapObject.settings[name] = value;
		
		return value;
	}
	
	/**
	 * Returns an instance of the vertex context menu
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.createVertexContextMenuInstance = function()
	{
		
	}
	
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
		$("#marker-buttons>button").prop("disabled", !enable);
	}
	
	/**
	 * Creates a marker at the specified coordinates, and puts the data from the markers tab into it
	 * @return WPGMZA.Marker
	 */
	WPGMZA.MapEditPage.prototype.createOrUpdateMarker = function(latLng, preventRefreshControls)
	{
		var self = this;
		var marker;
		
		if(this.editMapObjectTarget && !(this.editMapObjectTarget instanceof WPGMZA.Marker))
			finishEditingMapObject();
		
		if(!this.editMapObjectTarget)
			marker = WPGMZA.Marker.createInstance();
		else
			marker = this.editMapObjectTarget;
		
		$("#markers").find("input[name], select[name], textarea[name]").each(function(index, el) {
			self.inputValueToMapObjectProperty(el, marker);
		});
		
		marker.setPosition(latLng);
		marker.setAnimation(marker.settings.animation);
		
		if(!marker.map)
			this.map.addMarker(marker);
		
		$("input[name='address']").val("");
		this.enableMarkerButtons(true);
		
		this.rightClickCursor.setVisible(false);
		
		marker.modified = true;
		this.bindUnloadListener();
		
		/*if(!preventRefreshControls)
			this.editMarker(marker);
		else*/
			this.map.panTo(latLng);
		
		// The pro add-on needs to add data before doing AJAX submit
		if(!WPGMZA.isProVersion())
			this.doAJAXSubmit();
		
		return marker;
	}
	
	/**
	 * Clears all fields in the marker tab
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.clearMarkerFields = function()
	{
		$("#markers").find("input[name], textarea[name], select[name]").each(function(index, el) {
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
		// Select the marker tab
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: 0
		});
		
		if(!marker)
			return;
		
		// Set edit marker target
		this.editMapObjectTarget = marker;
		
		// Center on the marker
		this.map.panTo(marker.getPosition());
		
		marker.setDraggable(true);
		
		// Fill the form with markers data
		$("#markers").find("input, select, textarea").each(function(index, el) {
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
		$("#markers").removeClass("add-marker").addClass("update-marker");
	}
	
	/**
	 * Deletes a marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.deleteMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument is not a marker");
		
		if(marker.map != this.map)
			throw new Error("Wrong map");
		
		this.deleteIDs.markers.push(marker.id);
		this.map.deleteMarker(marker);
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
		if(!(this.editMapObjectTarget instanceof WPGMZA.Marker))
			return;
		
		this.deleteMarkerByID(this.editMapObjectTarget.id);
		this.finishEditingMapObject();
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
		// Switch to the marker tab
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("markers")
		});
		
		// Put lat/lng into the address box
		var value = (event.latLng.lat + ", " + event.latLng.lng).replace(/[() ]/g, "");
		$("input[name='address']").val(value);
		
		// Set the position of the right click marker
		this.rightClickCursor.setPosition(event.latLng);
		this.rightClickCursor.setVisible(true);
	}
	
	/**
	 * Called when the user clicks add marker or save marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onSaveMarker = function(event)
	{
		var self = this;
		var address = $("form.wpgmza input[name='address']").val();
		var marker = this.editMapObjectTarget;
		
		if(!address.length)
		{
			alert(WPGMZA.localized_strings.no_address_entered);
			return;
		}
		
		$("#geocoder-error").hide();
		
		if(!marker || !marker.settings.dragged)
		{
			var geocoder = WPGMZA.Geocoder.createInstance();
			this.enableMarkerButtons(false);
			
			geocoder.getLatLngFromAddress({address: address}, function(latLng) {
				if(!latLng)
				{
					alert(WPGMZA.localized_strings.geocode_failed);
					return;
				}
				
				self.onGeocoderResponse(latLng);
			});
		}
		else
			self.onGeocoderResponse(marker.getPosition());
	}
	
	/**
	 * Called when the geocoder returns a response from save / add marker
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onGeocoderResponse = function(latLng)
	{
		this.enableMarkerButtons(true);
		
		if(latLng == null)
		{
			$("#geocoder-error").show();
			$("input[name='address']").focus().select();
			return;
		}
		
		this.createOrUpdateMarker(latLng);
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
			var name = $(el).attr("name");
			
			if(!name)
				return;
			
			name = name.replace(/^polygon-/, "");
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
		var self = this;
		
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("polygons")
		});
		
		$("#polygons .wpgmza-admin-form-hideable").removeClass("wpgmza-admin-form-hidden");
		
		if(!polygon)
			return;

		this.editMapObjectTarget = polygon;
		
		// TODO: Fit polygon bounds?
		polygon.setEditable(true);
		
		$("input[name='polygon-name']").val(polygon.name);
		
		$("#polygons input").each(function(index, el) {
			if($(el).prop("disabled"))
				return;
			
			if(!$(el).attr("name"))
				return;
			
			var name = self.getInputNameWithoutPrefix(el.name);
			var value = self.getFieldValue(el);
			
			if(name in polygon)
				$(el).val(polygon[name]);
			else
				$(el).val(polygon.settings[name]);
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
		
		$("#polygons .wpgmza-admin-form-hideable").removeClass("wpgmza-admin-form-hidden");
		
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_POLYGON);
		this.drawingManager.setOptions(fields);
	}
	
	/**
	 * Called when the user closes a polygon when drawing
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onPolygonClosed = function(event)
	{
		var fields = this.getPolygonFields();
		var polygon = WPGMZA.Polygon.createInstance({settings: fields}, event.enginePolygon);
		
		polygon.modified = true;
		this.bindUnloadListener();
		
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.map.addPolygon(polygon);

		this.editPolygon(polygon);
	}
	
	/**
	 * Called when the user clicks finish editing polygon, or clicks off the polygon tab
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onFinishEditingPolygon = function(event)
	{
		this.finishEditingMapObject();
	}
	
	/**
	 * Called when the user clicks delete polygon
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onDeletePolygon = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polygon))
			return;
		
		var id = this.editMapObjectTarget.id;
		
		this.deleteIDs.polygons.push(id);
		this.map.deletePolygon(this.editMapObjectTarget);
		this.finishEditingMapObject();
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonModified = function(vertex)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polygon))
			return;
		
		this.editMapObjectTarget.modified = true;
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
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonRemoved = function(event)
	{
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonClicked = function(event)
	{
		this.editPolygon(event.target);
	}
	
	WPGMZA.MapEditPage.prototype.onPolygonSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polygon))
			return;
		
		return this.inputValueToMapObjectProperty(event.target, this.editMapObjectTarget);
	}
	
	// Polyline Functions /////////////////////
	WPGMZA.MapEditPage.prototype.getPolylineFields = function()
	{
		var fields = {};
		
		$("#polylines").find("input, select, textarea").each(function(index, el) {
			var name = $(el).attr("name");
			
			if(!name)
				return;
			
			name = name.replace(/^polyline-/, "");
			fields[name] = $(el).val();
		});
		
		return fields;
	}
	
	WPGMZA.MapEditPage.prototype.editPolyline = function(polyline)
	{
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("polylines")
		});
		
		$("#polylines .wpgmza-admin-form-hideable").removeClass("wpgmza-admin-form-hidden");
		
		if(!polyline)
			return;
		
		this.editMapObjectTarget = polyline;
		
		// TODO: Fit polyline bounds?
		polyline.setEditable(true);
		
		$("#polylines input").each(function(index, el) {
			if($(el).prop("disabled"))
				return;
			
			if(!$(el).attr("name"))
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
		
		$("#polylines .wpgmza-admin-form-hideable").removeClass("wpgmza-admin-form-hidden");
		
		this.drawingManager.setOptions(fields);
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_POLYLINE);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineComplete = function(event)
	{
		var fields = this.getPolylineFields();
		var polyline = WPGMZA.Polyline.createInstance({settings: fields}, event.enginePolyline);
		
		polyline.modified = true;
		this.bindUnloadListener();
		
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		this.map.addPolyline(polyline);
		
		this.editPolyline(polyline);
	}
	
	WPGMZA.MapEditPage.prototype.onFinishEditingPolyline = function(event)
	{
		this.finishEditingMapObject();
	}
	
	WPGMZA.MapEditPage.prototype.onDeletePolyline = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polyline))
			return;
		
		var id = this.editMapObjectTarget.id;
		
		this.deleteIDs.polylines.push(id);
		this.map.deletePolyline(this.editMapObjectTarget);
		this.finishEditingMapObject();
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polyline))
			return;
		
		return this.inputValueToMapObjectProperty(event.target, this.editMapObjectTarget);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineModified = function(vertex)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polyline))
			return;
		
		this.editMapObjectTarget.modified = true;
		this.bindUnloadListener();
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineAdded = function(event)
	{
		var self = this;
		var polyline = event.polyline;
		
		polyline.addEventListener("click", function(event) {
			self.onPolylineClicked(event);
		});
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineRemoved = function(event)
	{
		polyline.removeEventListener("click", onPolylineClicked);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineClicked = function(event)
	{
		if(WPGMZA.settings.engine == "google-maps" && event.target.getPoints().length > 1000)
		{
			this.warningPolyline = event.target;
			$("#wpgmza-big-polyline-dialog").remodal().open();
			return;
		}
		
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
	}
	
	/**
	 * Called when the map bounds change
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onBoundsChanged = function(event)
	{
		var latLng = this.map.getCenter();
		var zoom = this.map.getZoom();
		
		$("input[name='start_location']").val(latLng.lat + ", " + latLng.lng);
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
		if(this.initialBoundsChanged)
		{
			// Don't bind the unload listener on the first boundchanged event, it fires when the map initializes
			this.initialBoundsChanged = false;
			return;
		}
		
		if(this.unloadListenerBound)
			return;
		
		window.addEventListener("beforeunload", this.onBeforeUnload);
		
		this.unloadListenerBound = true;
	}
	
	WPGMZA.MapEditPage.prototype.applyThemeData = function()
	{
		
	}
	
	WPGMZA.MapEditPage.prototype.showMapInstructions = function(type)
	{
		$(".wpgmza-engine-map *[id$='instructions']").hide();
		$("#" + type + "-instructions").show();
	}
	
	WPGMZA.MapEditPage.prototype.onMapPanelTabActivated = function(event, ui)
	{
		// Show/hide the relevant instructions
		var singular = ui.newPanel.attr("id").replace(/s$/, "");
		this.showMapInstructions(singular);
		
		// Remember this tab
		var target = event.target;
		if(window.sessionStorage)
			sessionStorage.setItem(target.id, $(target).tabs("option", "active"));
	}
	
	// Map object list functions //////////////
	
	/**
	 * Loads the marker, polygon and polyline admin tables
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.loadMapObjectTables = function()
	{
		// Marker table
		this.markerTable = new WPGMZA.AdminTable($("#marker-table-container .wpgmza-datatable[data-object-type='markers']")[0]);
		this.polygonTable = new WPGMZA.AdminTable($(".wpgmza-datatable[data-object-type='polygons']")[0]);
		this.polylineTable = new WPGMZA.AdminTable($(".wpgmza-datatable[data-object-type='polylines']")[0]);
	}
	
	// Marker list functions //////////////////
	
	/**
	 * Called when the user clicks to edit a marker in the marker table
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onTableRowEditMarker = function(event)
	{
		var td = $(event.target).closest("td");
		var id = td.attr("data-marker-id");
		
		var latLng = {
			lat: parseFloat(td.attr("data-lat")),
			lng: parseFloat(td.attr("data-lng"))
		};
		
		var marker;
		if(marker = this.map.getMarkerByID(id))
			this.editMarker(marker);	// Marker loaded, go straight to editing it
		else
			this.onFetchEditMarkerID = id; // Marker not loaded, remember to edit it once fetch completes
		
		this.map.panTo(latLng);
	}
	
	WPGMZA.MapEditPage.prototype.onMapFetchSuccess = function(event)
	{
		if(!this.onFetchEditMarkerID)
			return;
		
		this.editMarker(this.map.getMarkerByID(this.onFetchEditMarkerID));
		
		this.onFetchEditMarkerID = null;
	}
	
	/**
	 * Delete a polygon by ID and remember the ID
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.deletePolygonByID = function(id)
	{
		this.deleteIDs.polygons.push(id);
		this.map.deletePolygonByID(id);
	}
	
	/**
	 * Delete a polyline by ID and remember the ID
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.deletePolylineByID = function(id)
	{
		this.deleteIDs.polylines.push(id);
		this.map.deletePolylineByID(id);
	}
	
	// General functions //////////////////////
	
	WPGMZA.MapEditPage.prototype.onZoomLimitsChanged = function(event, ui)
	{
		var min = ui.values[0];
		var max = ui.values[1];
		
		$("input[name='min_zoom']").val(min);
		$("input[name='max_zoom']").val(max);
		
		this.map.setMinZoom(min);
		this.map.setMaxZoom(max);
	}
	
	/**
	 * This function returns an array of the editing functions, used by finishEditingMapObject to avoid infinite recursion
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.getEditFunctionNames = function()
	{
		return [
			"editMarker",
			"editPolygon",
			"editPolyline"
		];
	}
	
	/**
	 * This function will cancel any editing taking place, useful when switching tabs, pressing ESC, etc.
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.finishEditingMapObject = function()
	{
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_NONE);
		
		if(!this.editMapObjectTarget)
			return;
		
		if(this.editMapObjectTarget instanceof WPGMZA.Marker)
			this.editMapObjectTarget.setDraggable(false);
		
		this.doAJAXSubmit();
		
		this.clearMarkerFields();
		$("#markers").removeClass("update-marker").addClass("add-marker");
		
		$("#polygons input:not([type])").val("");
		$("#polygons").removeClass("update-polygon").addClass("add-polygon");
		
		$("input[name='polyline-title']").val("");
		$("#polylines").removeClass("update-polyline").addClass("add-polyline");
		
		if(this.editMapObjectTarget.setEditable)
			this.editMapObjectTarget.setEditable(false);
		this.editMapObjectTarget = null;
	}
	
	
	/**
	 * Called when the user changes the general layout
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onGeneralLayoutChanged = function(event)
	{
		var self = this;
		var layout = $(event.target).val();
		
		// Remove old layout classes
		$("select[name='general_layout']>option").each(function(index, el) {
			$(self.map.element).removeClass($(el).val());
		});
		
		// Add new layout class
		$(self.map.element).addClass(layout);
		
		switch(layout)
		{
			case "wpgmza-compact":
				var layout = this.map.getLayout();
				var index;
				
				if((index = layout.order.indexOf("marker-listing")) != -1)
					layout.order.splice(index, 1);
				
				for(var position in layout.grid)
					if(layout.grid[position] == "marker-listing")
						delete layout.grid[position];
				
				layout.grid["center-right"] = "marker-listing";
				
				this.map.setLayout(layout);
				
				break;
		}
	};
	
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
	 * Get the layout from the layout panel
	 * @return object
	 */
	WPGMZA.MapEditPage.prototype.getLayout = function()
	{
		var elements = $("#wpgmza-layout-editor").find("[data-wpgmza-layout-element]");
		var data = {
			order: [],
			grid: {}
		};
		
		for(var i = 0; i < elements.length; i++)
		{
			var grid = $(elements[i]).closest(".wpgmza-in-map-grid");
			var name = $(elements[i]).attr("data-wpgmza-layout-element");
			
			if(grid.length)
				data.grid[ $(elements[i]).closest(".wpgmza-cell").attr("data-grid-position") ] = name;
			else
				data.order.push(name);
		}
		
		return data;
	}
	
	/**
	 * Sets the layout in the layout panel
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.setLayout = function()
	{
		if(!this.map.settings.layout)
			return;
		
		this.map.setLayout(JSON.parse(this.map.settings.layout), $("#wpgmza-layout-editor"));
	}
	
	WPGMZA.MapEditPage.prototype.doAJAXSubmit = function()
	{
		var self = this;
		var data = this.getMapObjectData();
		
		$("#map-edit-tabs *:input").prop("disabled", true);
		
		$.ajax({
			method: "POST",
			url: WPGMZA.ajaxurl,
			data: {
				"action":		"wpgmza_ajax_submit",
				"map_id":		this.map.id,
				"map-objects":	JSON.stringify(data)
			},
			success: function(response)
			{
				for(var guid in response.newIDsByGUID)
				{
					var object = self.map.getObjectByGUID(guid);
					object.id = parseInt(response.newIDsByGUID[guid]);
					object.modified = false;
				}
				
				self.finishEditingMapObject();
			},
			error: function(xhr, textStatus, errorThrown)
			{
				if(WPGMZA.isDeveloperMode())
					throw new Error(xhr.responseText);
				else
					alert(xhr.responseText);
			},
			complete: function()
			{
				$("#map-edit-tabs *:input").prop("disabled", false);
			}
		});
	}
	
	/**
	 * Called when the form submits. This WPGMZA.MapEditPage.prototype puts all the markers, 
	 * polygons and polylines in an array to be sent along with the rest 
	 * of the from data. Any deleted markers, polygons and polylines are 
	 * sent in deleteIDs
	 * @return void
	 */
	WPGMZA.MapEditPage.prototype.onSubmit = function(event)
	{
		// Get the map object data
		var data = this.getMapObjectData();
		
		var input = $("<input name='map-objects' type='hidden'/>");
		input.val(JSON.stringify(data));
		$("form.wpgmza").append(input);
		
		// Send layout
		var layout = $("<input name='layout' type='hidden'/>");
		layout.val(JSON.stringify(this.getLayout()));
		$("form.wpgmza").append(layout);
		
		// Disable marker, polygon, polyline and heatmap inputs so they don't get sent to the server, they conflict with other inputs
		$("form.wpgmza .no-submit *:input").prop("disabled", true);
		
		// Unbind the beforeunload listener
		window.removeEventListener("beforeunload", this.onBeforeUnload);
	}
	
	$(document).ready(function() {

		if(WPGMZA.current_page != "map-edit")
			return;
	
		WPGMZA.runCatchableTask(function() {
			
			WPGMZA.mapEditPage = WPGMZA.MapEditPage.createInstance();
			
			// Fire the event here, not in the constructor, so that the Pro constructor can finish running
			WPGMZA.events.dispatchEvent("mapeditpageready");
			
		}, $("form.wpgmza"));
		
	});
	
})(jQuery);