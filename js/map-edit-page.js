(function($) {
	
	/**
	 * Map edit page constructor
	 * TODO: Break this up a bit into smaller functions, it's huge
	 */
	WPGMZA.MapEditPage = function()
	{
		var self = this;
		
		this.map = null;
		this.rightClickCursor = null;
		this.editMapObjectTarget = null;
		this.drawingManager = null;
		this.markerTable = null;
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
			if(window.localStorage)
				active = parseInt(localStorage.getItem(el.id));
			
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
		if(window.localStorage)
			active = parseInt(localStorage.getItem("wpgmza-map-edit-page-accordion"));
		$(".wpgmza-accordion").accordion({
			heightStyle: "content",
			autoHeight: false,
			clearStyle: true,
			collapsible: true,
			active: active,
			activate: function(event, ui) {
				if(window.localStorage)
					localStorage.setItem("wpgmza-map-edit-page-accordion", $(event.target).accordion("option", "active"));
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
		this.map.addEventListener("boundschanged", function(event) {
			self.onBoundsChanged(event);
		});
		
		// When the user clicks cancel edit button or blank space on the map, cancel editing marker
		this.map.addEventListener("click", function(event) {
			self.finishEditingMapObject();
		});
		
		// Set up right click marker adding
		this.rightClickCursor = this.map.createMarkerInstance({
			draggable: true
		});
		if(this instanceof WPGMZA.OSMMapEditPage)
			$(this.rightClickCursor.element).addClass("wpgmza-right-click-marker");
		this.rightClickCursor.setVisible(false);
		
		function placeRightClickMarker(event) {
			self.onRightClickMap(event);
		}
		
		this.map.addEventListener("rightclick", placeRightClickMarker);
		this.rightClickCursor.addEventListener("dragend", placeRightClickMarker);

		// Lock start viewport
		function lockStartViewport(event) {
            $("input[name='start_location'], input[name='start_zoom']").prop("disabled",
                $("input[name='lock_start_viewport']").prop("checked")
            );
        }

        lockStartViewport();

        $("#lock_start_viewport").on("change", lockStartViewport);

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
            $('html, body').animate({
                scrollTop: $('html').offset().top
            }, 500);
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
            $('html, body').animate({
                scrollTop: $('html').offset().top
            }, 500);
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
		this.loadMarkerTable();
		
		// Listen for changes on "live" polygon and polyline forms (markers are flagged as modified by createOrUpdateMarker, that form is not "live")
		$("#polygons").find("input, select, textarea").on("change", function(event) { 
			if(self.editMapObjectTarget instanceof WPGMZA.Polygon)
				self.editMapObjectTarget.modified = true;
		});
		$("#polylines").find("input, select, textarea").on("change", function(event) {
			if(self.editMapObjectTarget)
				self.editMapObjectTarget.modified = true;
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
		
		// Layout system
		var mouseX, mouseY;
		
		$("select[name='general_layout']").on("change", function(event) {
			self.onGeneralLayoutChanged(event);
		});
		
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
		});
		
		$(".wpgmza-engine-map").append($(".wpgmza-in-map-grid"));
		
		// Hide preloader
		$(".main-preloader").hide();
		$("form.wpgmza").show();
	}
	
	/**
	 * Gets the name of an input without it's prefix
	 * @return string
	 */
	WPGMZA.MapEditPage.prototype.getInputNameWithoutPrefix = function(name)
	{
		return name.replace(/^.+?-/, "");
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
		$("#marker-buttons button").prop("disabled", !enable);
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
			marker = this.map.createMarkerInstance();
		else
			marker = this.editMapObjectTarget;
		
		$("#wpgmza-markers-tab").find("input[name], select[name], textarea[name]").each(function(index, el) {
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
		
		if(!preventRefreshControls)
			this.editMarker(marker);
		else
			this.map.panTo(latLng);
		
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
		this.finishEditingMapObject();
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
			active: this.getTabIndexByID("wpgmza-markers-tab")
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
	WPGMZA.MapEditPage.prototype.onSaveMarker = function()
	{
		var self = this;
		var address = $("form.wpgmza input[name='address']").val();
		
		if(!address.length)
		{
			alert(WPGMZA.settings.localized_strings.no_address_entered);
			return;
		}
		
		$("#geocoder-error").hide();
		
		var geocoder = WPGMZA.Geocoder.createInstance();
		geocoder.getLatLngFromAddress({address: address}, function(latLng) {
			if(!latLng)
			{
				alert(WPGMZA.settings.localized_strings.geocode_failed);
				return;
			}
			
			self.onGeocoderResponse(latLng);
		});
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
		var self = this;
		
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("polygons")
		});
		
		if(!polygon)
			return;

		this.editMapObjectTarget = polygon;
		
		// TODO: Fit polygon bounds?
		polygon.setEditable(true);
		
		$("input[name='polygon-name']").val(polygon.name);
		
		$("#polygons input").each(function(index, el) {
			if($(el).prop("disabled"))
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
		var polygon = this.map.createPolygonInstance({settings: fields}, event.enginePolygon);
		
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
			var name = $(el).attr("name").replace(/^polyline-/, "");
			fields[name] = $(el).val();
		});
		
		return fields;
	}
	
	WPGMZA.MapEditPage.prototype.editPolyline = function(polyline)
	{
		$("#wpgmza_map_panel .wpgmza-tabs").tabs({
			active: this.getTabIndexByID("polylines")
		});
		
		if(!polyline)
			return;
		
		this.editMapObjectTarget = polyline;
		
		// TODO: Fit polyline bounds?
		polyline.setEditable(true);
		
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
		this.drawingManager.setOptions(fields);
		this.drawingManager.setDrawingMode(WPGMZA.DrawingManager.MODE_POLYLINE);
	}
	
	WPGMZA.MapEditPage.prototype.onPolylineComplete = function(event)
	{
		var fields = this.getPolylineFields();
		var polyline = this.map.createPolylineInstance({settings: fields}, event.enginePolyline);
		
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
		if(this.editMapObjectTarget && this.editMapObjectTarget.id == id)
			this.finishEditingMapObject();
		
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
		
		this.clearMarkerFields();
		$("#wpgmza-markers-tab").removeClass("update-marker").addClass("add-marker");
		
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
		layout.val(JSON.stringify(this.map.getLayout()));
		$("form.wpgmza").append(layout);
		
		// Disable marker, polygon, polyline and heatmap inputs so they don't get sent to the server, they conflict with other inputs
		$("form.wpgmza .no-submit *:input").prop("disabled", true);
		
		// Unbind the beforeunload listener
		window.removeEventListener("beforeunload", this.onBeforeUnload);
	}
	
	$(document).ready(function() {

		$('form.wpgmza').on('keydown', function( e ){
			if (e.keyCode == 13 ) {
				if( $(e.target).attr('name') == 'address' ){
					if( $("#add-marker").lengh > 0 ){
						$("#add-marker").click();
						return false;
					} else if( $("#update-marker").length > 0 ){
						$("#update-marker").click();
						$("#cancel-marker-edit").click();
						return false;
					}
				} else if( e.target.nodeName.match(/input/i) ) {
			        return false;
			    }
		    }	
		});
		 

		var pro = WPGMZA.isProVersion();
		
		WPGMZA.runCatchableTask(function() {
			switch(WPGMZA.settings.engine)
			{
				case "google-maps":
					WPGMZA.mapEditPage = (pro ? new WPGMZA.GoogleProMapEditPage() : new WPGMZA.GoogleMapEditPage());
					break;
				
				default:
					WPGMZA.mapEditPage = (pro ? new WPGMZA.OSMProMapEditPage() : new WPGMZA.OSMMapEditPage());
					break;
			}
		}, $("form.wpgmza"));
	});
})(jQuery);