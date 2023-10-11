/**
 * @namespace WPGMZA
 * @module MapEditPage
 * @requires WPGMZA.EventDispatcher
 */

var wpgmza_autoCompleteDisabled = false;

jQuery(function($) {
	
	if(WPGMZA.currentPage != "map-edit")
		return;
	
	WPGMZA.MapEditPage = function()
	{
		var self = this;
		var element = document.body;
		
		WPGMZA.EventDispatcher.call(this);
		
		if(!WPGMZA.settings.internalEngine || WPGMZA.InternalEngine.isLegacy()){
			// Only force this if we are in legacy
			// New internal engines will handle this internally instead
			$("#wpgmaps_options fieldset").wrapInner("<div class='wpgmza-flex'></div>");
		}
		
		this.themePanel = new WPGMZA.ThemePanel();
		this.themeEditor = new WPGMZA.ThemeEditor();

		this.sidebarGroupings = new WPGMZA.SidebarGroupings();

		this.map = WPGMZA.maps[0];
		
		// Drawing manager
		if(!WPGMZA.pro_version || WPGMZA.Version.compare(WPGMZA.pro_version, '8.1.0') >= WPGMZA.Version.EQUAL_TO)
			this.drawingManager = WPGMZA.DrawingManager.createInstance(this.map);
		
		// UI
		this.initDataTables();
		this.initFeaturePanels();
		this.initJQueryUIControls();

		if(WPGMZA.locale !== 'en'){
			if(WPGMZA.InternalEngine.isLegacy()){
				$('#datatable_no_result_message,#datatable_search_string').parent().parent().hide();
			} else {
				$('#datatable_no_result_message,#datatable_search_string').parent().hide();
			}
		}
		
		// Address input
		$("input.wpgmza-address").each(function(index, el) {
			el.addressInput = WPGMZA.AddressInput.createInstance(el, self.map);
		});

		$('#wpgmza-map-edit-page input[type="color"]').each(function(){
			var buttonClass = WPGMZA.InternalEngine.isLegacy() ? 'button-secondary' : 'wpgmza-button';
			$("<div class='" + buttonClass + " wpgmza-paste-color-btn' title='Paste a HEX color code'><i class='fa fa-clipboard' aria-hidden='true'></i></div>").insertAfter(this);
		});


		jQuery('body').on('click','.wpgmza_ac_result', function(e) {
			var index = jQuery(this).data('id');
			var lat = jQuery(this).data('lat');
			var lng = jQuery(this).data('lng');
			var name = jQuery('#wpgmza_item_address_'+index).html();
			
			
			jQuery("input[name='lat']").val(lat);
			jQuery("input[name='lng']").val(lng);
			jQuery("#wpgmza_add_address_map_editor").val(name);
			jQuery('#wpgmza_autocomplete_search_results').hide();
		});

		jQuery('body').on('click', '.wpgmza-paste-color-btn', function(){
			try{
				var colorBtn = $(this);
				if(!navigator || !navigator.clipboard || !navigator.clipboard.readText){
					return;
				}

				navigator.clipboard.readText()
				  	.then(function(textcopy) {
				    	colorBtn.parent().find('input[type="color"]').val("#" + textcopy.replace("#","").trim());
				  	})
				  	.catch(function(err) {
				    	console.error("WP Go Maps: Could not access clipboard", err);
				  	});

			} catch(c_ex){

			}
		});

		jQuery('body').on('focusout', '#wpgmza_add_address_map_editor', function(e) {
			setTimeout(function() {
				jQuery('#wpgmza_autocomplete_search_results').fadeOut('slow');
			},500)
			
		});

		var ajaxRequest = false;
		var wpgmzaAjaxTimeout = false;

		var wpgmzaStartTyping = false;
		var wpgmzaKeyStrokeCount = 1;
		var wpgmzaAvgTimeBetweenStrokes = 300; //300 ms by default (equates to 40wpm which is the average typing speed of a person)
		var wpgmzaTotalTimeForKeyStrokes = 0;
		var wpgmzaTmp = '';
		var wpgmzaIdentifiedTypingSpeed = false;

		$('body').on('keypress', '.wpgmza-address', function(e) {
			if(self.shouldAddressFieldUseEnhancedAutocomplete(this)){
				self.onKeyUpEnhancedAutocomplete(e, this);
			}
		});


		// Map height change (for warning)
		$("#wpgmza_map_height_type").on("change", function(event) {
			self.onMapHeightTypeChange(event);
		});
		
		// Don't have instructions in advanced marker panel, it's confusing for debugging and unnecessary
		$("#advanced-markers .wpgmza-feature-drawing-instructions").remove();
		
		// Hide the auto search area maximum zoom - not available in Basic. Pro will take care of showing it when needed
		$("[data-search-area='auto']").hide();
		
		// Control listeners
		$(document.body).on("click", "[data-wpgmza-admin-marker-datatable] input[name='mark']", function(event) {
			self.onShiftClick(event);
		});
		
		$("#wpgmza_map_type").on("change", function(event) {
			self.onMapTypeChanged(event);
		});

		$("body").on("click",".wpgmza_copy_shortcode", function() {
	        var $temp = jQuery('<input>');
	        var $tmp2 = jQuery('<span id="wpgmza_tmp" style="display:none; width:100%; text-align:center;">');
	        jQuery("body").append($temp);
	        $temp.val(jQuery(this).val()).select();
	        document.execCommand("copy");
	        $temp.remove();
	        WPGMZA.notification("Shortcode Copied");
	    });
		
		this.on("markerupdated", function(event) {
			self.onMarkerUpdated(event);
		});

		// NB: Older version of Pro (< 7.0.0 - pre-WPGMZA.Map) will have this.map as undefined. Only run this code if we have a WPGMZA.Map to work with.
		if(this.map)
		{
			this.map.on("zoomchanged", function(event) {
				self.onZoomChanged(event);
			});
			
			this.map.on("boundschanged", function(event) {
				self.onBoundsChanged(event);
			});
			
			this.map.on("rightclick", function(event) {
				self.onRightClick(event);
			});
		}
		
		$(element).on("click", ".wpgmza_poly_del_btn", function(event) {
			self.onDeletePolygon(event);
		});
		
		$(element).on("click", ".wpgmza_polyline_del_btn", function(event) {
			self.onDeletePolyline(event);
		});
		
		$(element).on("click", ".wpgmza_dataset_del_btn", function(evevnt) {
			self.onDeleteHeatmap(event);
		});
		
		$(element).on("click", ".wpgmza_circle_del_btn", function(event) {
			self.onDeleteCircle(event);
		});
		
		$(element).on("click", ".wpgmza_rectangle_del_btn", function(event) {
			self.onDeleteRectangle(event);
		});

		$(element).on("click", "#wpgmza-open-advanced-theme-data", function(event){
			event.preventDefault();
			$('.wpgmza_theme_data_container').toggleClass('wpgmza_hidden');
		});

		$(element).on("click", ".wpgmza-shortcode-button", function(event){
			event.preventDefault();
			$(element).find('.wpgmza-shortcode-description').addClass('wpgmza-hidden');

			const nearestRow = $(this).closest('.wpgmza-row');
			if(nearestRow.length){
				const nearestHint = nearestRow.next('.wpgmza-shortcode-description');
				if(nearestHint.length){
					nearestHint.removeClass('wpgmza-hidden');
				}
			}

			const shortcode = $(this).text();
			if(shortcode.length){
				const temp = jQuery('<input>');
		        $(document.body).append(temp);
		        temp.val(shortcode).select();
		        document.execCommand("copy");
		        temp.remove();
		        WPGMZA.notification("Shortcode Copied");
			}
		});
	}
	
	WPGMZA.extend(WPGMZA.MapEditPage, WPGMZA.EventDispatcher);
	
	WPGMZA.MapEditPage.createInstance = function()
	{
		if(WPGMZA.isProVersion() && WPGMZA.Version.compare(WPGMZA.pro_version, "8.0.0") >= WPGMZA.Version.EQUAL_TO)
			return new WPGMZA.ProMapEditPage();
		
		return new WPGMZA.MapEditPage();
	}
	
	WPGMZA.MapEditPage.prototype.initDataTables = function()
	{
		var self = this;
		
		$("[data-wpgmza-datatable][data-wpgmza-rest-api-route]").each(function(index, el) {
			
			var featureType	= $(el).attr("data-wpgmza-feature-type");
			
			self[featureType + "AdminDataTable"] = new WPGMZA.AdminFeatureDataTable(el);
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.initFeaturePanels = function()
	{
		var self = this;
		
		$(".wpgmza-feature-accordion[data-wpgmza-feature-type]").each(function(index, el) {
			
			var featurePanelElement	= $(el).find(".wpgmza-feature-panel-container > *");
			var featureType			= $(el).attr("data-wpgmza-feature-type");
			var panelClassName		= WPGMZA.capitalizeWords(featureType) + "Panel";
			var module				= WPGMZA[panelClassName];
			var instance			= module.createInstance(featurePanelElement, self);
			
			self[featureType + "Panel"] = instance;
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.initJQueryUIControls = function()
	{
		var self = this;
		var mapContainer;
		
		// Now initialise tabs
		$("#wpgmaps_tabs").tabs();
		
		// NB: If the map container has a <ul> then this will break the tabs (this happens in OpenLayers). Temporarily detach the map to avoid this.
		mapContainer = $("#wpgmza-map-container").detach();
		
		$("#wpgmaps_tabs_markers").tabs(); 
		
		// NB: Re-add the map container (see above)
		$(".map_wrapper").prepend(mapContainer);
		
		// And the zoom slider
		$("#slider-range-max").slider({
			range: "max",
			min: 1,
			max: 21,
			value: $("input[name='map_start_zoom']").val(),
			slide: function( event, ui ) {
				$("input[name='map_start_zoom']").val(ui.value);
				self.map.setZoom(ui.value);
			}
		});
	}
	
	WPGMZA.MapEditPage.prototype.onShiftClick = function(event)
	{
		var checkbox = event.currentTarget;
		var row = jQuery(checkbox).closest("tr");
		
		if(this.lastSelectedRow && event.shiftKey)
		{
			var prevIndex = this.lastSelectedRow.index();
			var currIndex = row.index();
			var startIndex = Math.min(prevIndex, currIndex);
			var endIndex = Math.max(prevIndex, currIndex);
			var rows = jQuery("[data-wpgmza-admin-marker-datatable] tbody>tr");
			
			// Clear
			jQuery("[data-wpgmza-admin-marker-datatable] input[name='mark']").prop("checked", false);
			
			for(var i = startIndex; i <= endIndex; i++)
				jQuery(rows[i]).find("input[name='mark']").prop("checked", true);
			
			

		}
		
		this.lastSelectedRow = row;
	}
	
	WPGMZA.MapEditPage.prototype.onMapTypeChanged = function(event)
	{
		if(WPGMZA.settings.engine == "open-layers")
			return;
		
		var mapTypeId;
		
		switch(event.target.value)
		{
			case "2":
				mapTypeId = google.maps.MapTypeId.SATELLITE;
				break;
			
			case "3":
				mapTypeId = google.maps.MapTypeId.HYBRID;
				break;
			
			case "4":
				mapTypeId = google.maps.MapTypeId.TERRAIN;
				break;
			
			default:
				mapTypeId = google.maps.MapTypeId.ROADMAP;
				break;
		}
		
		this.map.setOptions({
			mapTypeId: mapTypeId
		});
	}
	
	WPGMZA.MapEditPage.prototype.onMarkerUpdated = function(event)
	{
		this.markerDataTable.reload();
	}
	
	WPGMZA.MapEditPage.prototype.onZoomChanged = function(event) {
		$(".map_start_zoom").val(this.map.getZoom());
	}
	
	WPGMZA.MapEditPage.prototype.onBoundsChanged = function(event)
	{
		var location = this.map.getCenter();
		
		$("#wpgmza_start_location").val(location.lat + "," + location.lng);
		$("input[name='map_start_lat']").val(location.lat);
		$("input[name='map_start_lng']").val(location.lng);
		
		$("#wpgmza_start_zoom").val(this.map.getZoom());
		
		$("#wpgmaps_save_reminder").show();
	}
	
	WPGMZA.MapEditPage.prototype.onMapHeightTypeChange = function(event)
	{
		if(event.target.value == "%")
			$("#wpgmza_height_warning").show();
	}
	
	WPGMZA.MapEditPage.prototype.onRightClick = function(event)
	{
		var self = this;
		var marker;

		if(!WPGMZA.InternalEngine.isLegacy() && this.sidebarGroupings){
			if(this.sidebarGroupings.isOpen('global') || this.sidebarGroupings.isOpen('map-markers')){
				/* Either their on the root tab, or they are on the marker list, so let's open the marker creator for them */
				this.sidebarGroupings.openTabByFeatureType('marker');
			}
		}

		if(this.drawingManager && this.drawingManager.mode != WPGMZA.DrawingManager.MODE_MARKER)
			return;	// Do nothing, not in marker mode
		
		if(!this.rightClickMarker)
		{
			this.rightClickMarker = WPGMZA.Marker.createInstance({
				draggable: true
			});
		
			this.rightClickMarker.on("dragend", function(event) {
				$(".wpgmza-marker-panel [data-ajax-name='address']").val(event.latLng.lat + ", " + event.latLng.lng);
			});
			
			this.map.on("click", function(event) {
				/* Remove the marker on left click*/
				self.rightClickMarker.setMap(null);

				/* Seeing as we are removing the marker, clear the lat/lng combo as well */
				$(".wpgmza-marker-panel [data-ajax-name='address']").val("");
			});
		}
		
		marker = this.rightClickMarker;
		
		marker.setPosition(event.latLng);
		marker.setMap(this.map);
		
		$(".wpgmza-marker-panel [data-ajax-name='address']").val(event.latLng.lat+', '+event.latLng.lng);
	}
	
	WPGMZA.MapEditPage.prototype.onDeletePolygon = function(event)
	{
		var cur_id = parseInt($(this).attr("id"));
		var data = {
			action:		'delete_poly',
			security:	wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:		this.map.id,
			poly_id:	cur_id
		};
		
		$.post(ajaxurl, data, function (response) {

			WPGM_Path[cur_id].setMap(null);
			delete WPGM_PathData[cur_id];
			delete WPGM_Path[cur_id];
			$("#wpgmza_poly_holder").html(response);
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.onDeletePolyline = function(event)
	{
		var cur_id = $(this).attr("id");
		var data = {
			action:		'delete_polyline',
			security:	wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:		this.map.id,
			poly_id:	cur_id
		};
		
		$.post(ajaxurl, data, function (response) {
			
			WPGM_PathLine[cur_id].setMap(null);
			delete WPGM_PathLineData[cur_id];
			delete WPGM_PathLine[cur_id];
			$("#wpgmza_polyline_holder").html(response);
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.onDeleteHeatmap = function(event)
	{
		var cur_id = $(this).attr("id");
		var data = {
			action:		'delete_dataset',
			security:	wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:		this.map.id,
			poly_id:	cur_id
		};
		
		$.post(ajaxurl, data, function (response) {
			
			heatmap[cur_id].setMap(null);
			delete heatmap[cur_id];
			$("#wpgmza_heatmap_holder").html(response);
			
		});
	}
	
	WPGMZA.MapEditPage.prototype.onDeleteCircle = function(event)
	{
		var circle_id = $(this).attr("id");
		
		var data = {
			action:		'delete_circle',
			security:	wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:		this.map.id,
			circle_id:	circle_id
		};
		
		$.post(ajaxurl, data, function (response) {
			
			$("#tabs-m-5 table").replaceWith(response);
			
			circle_array.forEach(function (circle) {

				if (circle.id == circle_id) {
					circle.setMap(null);
					return false;
				}

			});

		});
	}
	
	WPGMZA.MapEditPage.prototype.onDeleteRectangle = function(event)
	{
		var rectangle_id = $(this).attr("id");
		
		var data = {
			action:			'delete_rectangle',
			security:		wpgmza_legacy_map_edit_page_vars.ajax_nonce,
			map_id:			this.map.id,
			rectangle_id:	rectangle_id
		};
		
		$.post(ajaxurl, data, function (response) {
			
			$("#tabs-m-6 table").replaceWith(response);
			
			rectangle_array.forEach(function (rectangle) {

				if (rectangle.id == rectangle_id) {
					rectangle.setMap(null);
					return false;
				}

			});

		});
	}

	WPGMZA.MapEditPage.prototype.shouldAddressFieldUseEnhancedAutocomplete = function(element){
		/* This should really be moved to its own module later (EnhancedAutocomplete) */
		if(element && element.id && element.id === 'wpgmza_add_address_map_editor'){
			return true;
		} 
		return false;
	}

	WPGMZA.MapEditPage.prototype.onKeyUpEnhancedAutocomplete = function(event, element){
		/* This should really be moved to its own module later (EnhancedAutocomplete) */
		if(element._wpgmzaAddressInput && element._wpgmzaAddressInput.googleAutocompleteLoaded){
			/* At some point the system swapped over to the Google Autocomplete, we should not take further action here */
			return;
		}

		if(!element._wpgmzaEnhancedAutocomplete){
			/*
			 * Set up some default state trackers 
			 * 
			 * Some notes, 300ms for avg keystroke equates to 40wpm, which is the average typing speed of a person
			*/
			element._wpgmzaEnhancedAutocomplete = {
				identifiedTypingSpeed : false,
				typingTimeout : false,
				startTyping : false,
				keyStrokeCount : 1,
				avgTimeBetweenStrokes : 300,
				totalTimeForKeyStrokes : 0,
				ajaxRequest : false,
				ajaxTimeout : false,
				requestErrorCount : 0,
				disabledFlag : false,
				disabledCheckCount : 0
			};
		} 

		let enhancedAutocomplete = element._wpgmzaEnhancedAutocomplete;

		const ignoredKeys = [
			"Escape", "Alt", "Control", "Option", "Shift", 
			"ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"
		];

		if(ignoredKeys.indexOf(event.key) !== -1){
			/* This keystroke should be ignored */
			$('#wpgmza_autocomplete_search_results').hide();
			return;
		}

		if(enhancedAutocomplete.disabledFlag){
			/* The server has disabled autocomplete requests manually */
			enhancedAutocomplete.disabledCheckCount ++;
			if(enhancedAutocomplete.disabledCheckCount >= 5){
				/* User keeps trying to use te autocomplete, even though server has reported this as disabled */
				/* Swap out to Google now, because this is silly */
				this.swapEnhancedAutocomplete(element);
			}
			return;
		}
		
		let googleApiKey = false;
		if(WPGMZA.settings && (WPGMZA.settings.googleMapsApiKey || WPGMZA.settings.wpgmza_google_maps_api_key)){
			googleApiKey = WPGMZA.settings.googleMapsApiKey ? WPGMZA.settings.googleMapsApiKey : WPGMZA.settings.wpgmza_google_maps_api_key;
		}

		if(!enhancedAutocomplete.identifiedTypingSpeed){
			let d = new Date();
			if(enhancedAutocomplete.typingTimeout){
				clearTimeout(enhancedAutocomplete.typingTimeout);
			}

			enhancedAutocomplete.typingTimeout = setTimeout(() => {
				enhancedAutocomplete.startTyping = false;
				enhancedAutocomplete.avgTimeBetweenStrokes = 300;
				enhancedAutocomplete.totalTimeForKeyStrokes = 0;
			}, 1500);

			if(!enhancedAutocomplete.startTyping){
				enhancedAutocomplete.startTyping = d.getTime();
				enhancedAutocomplete.keyStrokeCount ++;
			} else {
				if(enhancedAutocomplete.keyStrokeCount > 1){
					enhancedAutocomplete.currentTimeBetweenStrokes = d.getTime() - enhancedAutocomplete.startTyping;
					enhancedAutocomplete.totalTimeForKeyStrokes += enhancedAutocomplete.currentTimeBetweenStrokes;

					enhancedAutocomplete.avgTimeBetweenStrokes = (enhancedAutocomplete.totalTimeForKeyStrokes / (enhancedAutocomplete.keyStrokeCount - 1));
					enhancedAutocomplete.startTyping = d.getTime();

					if(enhancedAutocomplete.keyStrokeCount >= 3){
						/* We only need to measure speed based on the first 3 strokes */
						enhancedAutocomplete.identifiedTypingSpeed = enhancedAutocomplete.avgTimeBetweenStrokes;
					}
				}

				enhancedAutocomplete.keyStrokeCount ++;
			}

			/* Bail while we take our measurements, should be the first 3 characters */
			return;
		}

		/* Continue processing this request, we have at this stage, determined the users typing speed and we are ready to roll */
		if(enhancedAutocomplete.ajaxTimeout){
			clearTimeout(enhancedAutocomplete.ajaxTimeout);
		}

		/* Show the searching stub */
		$('#wpgmza_autocomplete_search_results').html('<div class="wpgmza-pad-5">Searching...</div>');
		$('#wpgmza_autocomplete_search_results').show();

		enhancedAutocomplete.currentSearch = $(element).val();
		if(enhancedAutocomplete.currentSearch && enhancedAutocomplete.currentSearch.trim().length > 0){
			/* Check if we are in the middle of a request, if so, let's abore that to do focus on the new one instead */
			if(enhancedAutocomplete.ajaxRequest !== false){
				enhancedAutocomplete.ajaxRequest.abort();
			}

			enhancedAutocomplete.requestParams = {
				domain : window.location.hostname
			};

			if(enhancedAutocomplete.requestParams.domain === 'localhost'){
				try {
					/* 
					 * Local domains sometimes run into issues with the enhanced autocomplete. 
					 *
					 * To ensure new users get the most out of the free service, let's go ahead and prepare a local style request 
					*/
					let paths = window.location.pathname.match(/\/(.*?)\//);
					if(paths && paths.length >= 2 && paths[1]){
						let path = paths[1];
						enhancedAutocomplete.requestParams.domain += "-" + path;
					}
				} catch (ex){
					/* Leave it alone */
				}
			}

			enhancedAutocomplete.requestParams.url = "https://wpgmaps.us-3.evennode.com/api/v1/autocomplete";

			enhancedAutocomplete.requestParams.query = {
				s : enhancedAutocomplete.currentSearch,
				d : enhancedAutocomplete.requestParams.domain,
				hash : WPGMZA.siteHash
			};

			if(googleApiKey){
				/* Send through the google key for further enhancements */
				enhancedAutocomplete.requestParams.query.k = googleApiKey;
			}

			if(WPGMZA.settings){
				if(WPGMZA.settings.engine){
					enhancedAutocomplete.requestParams.query.engine = WPGMZA.settings.engine;
				}

				if(WPGMZA.settings.internal_engine){
					enhancedAutocomplete.requestParams.query.build = WPGMZA.settings.internal_engine;
				}
			}

			/* Finalize the enhanced autocomplete URL query */
			enhancedAutocomplete.requestParams.query = new URLSearchParams(enhancedAutocomplete.requestParams.query);					
			enhancedAutocomplete.requestParams.url += "?" + enhancedAutocomplete.requestParams.query.toString();

			/* Place request in a timetout, to delay the send time by the typing speed */
			enhancedAutocomplete.ajaxTimeout = setTimeout(() => {
				/* Prepare and send the request */
				enhancedAutocomplete.ajaxRequest = $.ajax({
					url : enhancedAutocomplete.requestParams.url,
					type : 'GET',
					dataType : 'json',
					success : (results) => {
						try {
							if(results instanceof Object){
								if(results.error){
									/* We have an error, we need to work with this */
									if (results.error == 'error1') {
										$('#wpgmza_autoc_disabled').html(WPGMZA.localized_strings.cloud_api_key_error_1);
										$('#wpgmza_autoc_disabled').fadeIn('slow');
										$('#wpgmza_autocomplete_search_results').hide();

										enhancedAutocomplete.disabledFlag = true;
									} else {
										/* General request error was reached, we need to report it and instantly swap back to Google */
										console.error(results.error);
										this.swapEnhancedAutocomplete(element);
									}
								} else {
									/* Things are looking good, let's serve the data */
									$('#wpgmza_autocomplete_search_results').html('');
									let html = "";
									
									for(var i in results){ 
										html += "<div class='wpgmza_ac_result " + (html === "" ? "" : "border-top") + "' data-id='" + i + "' data-lat='"+results[i]['lat']+"' data-lng='"+results[i]['lng']+"'><div class='wpgmza_ac_container'><div class='wpgmza_ac_icon'><img src='"+results[i]['icon']+"' /></div><div class='wpgmza_ac_item'><span id='wpgmza_item_name_"+i+"' class='wpgmza_item_name'>" + results[i]['place_name'] + "</span><span id='wpgmza_item_address_"+i+"' class='wpgmza_item_address'>" + results[i]['formatted_address'] + "</span></div></div></div>"; 
									}
									
									if(!html || html.length <= 0){ 
										html = "<div class='p-2 text-center'><small>No results found...</small></div>"; 
									} 
									
									$('#wpgmza_autocomplete_search_results').html(html);
									$('#wpgmza_autocomplete_search_results').show();

									/* Finally reset all error counters */
									enhancedAutocomplete.disabledCheckCount = 0;
									enhancedAutocomplete.requestErrorCount = 0;
								}
							} else {
								/* Results are malformed - Swap out now */
								this.swapEnhancedAutocomplete(element);
							}
						} catch (ex){
							/* Results are malformed - Swap out now */
							console.error("WP Go Maps Plugin: There was an error returning the list of places for your search");
							this.swapEnhancedAutocomplete(element);
						}
					},
					error : () => {
						/* Request failed */
						$('#wpgmza_autocomplete_search_results').hide();
						
						/* There is a chance that this was purely a network issue, we should count it, and bail later if need be */
						enhancedAutocomplete.requestErrorCount ++;
						if(enhancedAutocomplete.requestErrorCount >= 3){
							/* Swap out now */
							this.swapEnhancedAutocomplete(element);
						}
					}
				});
			}, (enhancedAutocomplete.identifiedTypingSpeed * 2));
		} else {
			/* Search is empty, just hide the popup for now */
			$('#wpgmza_autocomplete_search_results').hide();
		}
		
	}

	WPGMZA.MapEditPage.prototype.swapEnhancedAutocomplete = function(element){
		/* Disable the enhanced autocomplete, and swap back to the native systems instead */
		if(element._wpgmzaAddressInput){
			if(!element._wpgmzaAddressInput.googleAutocompleteLoaded){
				element._wpgmzaAddressInput.loadGoogleAutocomplete();
			}
		}
		
		$('#wpgmza_autocomplete_search_results').hide();
		$('#wpgmza_autoc_disabled').hide();
	}
	
	$(document).ready(function(event) {
		
		WPGMZA.mapEditPage = WPGMZA.MapEditPage.createInstance();
		
	});
	
});
