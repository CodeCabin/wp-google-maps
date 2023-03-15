/**
 * @namespace WPGMZA
 * @module OLMap
 * @requires WPGMZA.Map
 * @pro-requires WPGMZA.ProMap
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element);
		
		this.setOptions(options);
		
		var viewOptions = this.settings.toOLViewOptions();
		
		$(this.element).html("");
		
		this.olMap = new ol.Map({
			target: $(element)[0],
			layers: [
				this.getTileLayer()
			],
			view: this.getTileView(viewOptions)
		});

		if(this.customTileMode){
			/* The system is in custom tile view mode */
			if(!(ol.extent.containsCoordinate(this.customTileModeExtent, this.olMap.getView().getCenter()))){
				const view = this.olMap.getView();

				view.setCenter(ol.extent.getCenter(this.customTileModeExtent));
				this.wrapLongitude();
				this.onBoundsChanged();
			}
		}
		
		// NB: Handles legacy checkboxes as well as new, standard controls
		function isSettingDisabled(value)
		{
			if(value === "yes")
				return true;
			
			return (value ? true : false);
		}
		
		// TODO: Re-implement using correct setting names
		// Interactions
		this.olMap.getInteractions().forEach(function(interaction) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive(
					!isSettingDisabled(self.settings.wpgmza_settings_map_draggable)
				);
			else if(interaction instanceof ol.interaction.DoubleClickZoom)
				interaction.setActive(
					!isSettingDisabled(self.settings.wpgmza_settings_map_clickzoom)
				);
			else if(interaction instanceof ol.interaction.MouseWheelZoom)
				interaction.setActive(
					!isSettingDisabled(self.settings.wpgmza_settings_map_scroll)
				);
			
		}, this);
		
		// Cooperative gesture handling
		if(!(this.settings.wpgmza_force_greedy_gestures == "greedy" || this.settings.wpgmza_force_greedy_gestures == "yes" || this.settings.wpgmza_force_greedy_gestures == true))
		{
			this.gestureOverlay = $("<div class='wpgmza-gesture-overlay'></div>")
			this.gestureOverlayTimeoutID = null;
			
			if(WPGMZA.isTouchDevice())
			{
				// On touch devices, require two fingers to drag and pan
				// NB: Temporarily removed due to inconsistent behaviour

				// Reintroduced: 9.0.0 -> We have made some changes to improve consistency 
				this.olMap.getInteractions().forEach(function(interaction) {
					
					if(interaction instanceof ol.interaction.DragPan)
						self.olMap.removeInteraction(interaction);
					
				});
				
				this.olMap.addInteraction(new ol.interaction.DragPan({
					
					condition: function(olBrowserEvent) {
						let allowed = false;
						let originalEvent = olBrowserEvent.originalEvent; 
						if(originalEvent instanceof PointerEvent){
							/* Handle this as a pointer */
							if(this.targetPointers && this.targetPointers.length){
								allowed = this.targetPointers.length == 2;
							}
						} else if (originalEvent instanceof TouchEvent){
							if(originalEvent.touches && originalEvent.touches.length){
								allowed = originalEvent.touches.length == 2;
							}
						}
						
						if(!allowed)
							self.showGestureOverlay();
						
						return allowed;
					}
					
				}));
				
				this.gestureOverlay.text(WPGMZA.localized_strings.use_two_fingers);
			}
			else
			{
				// On desktops, require Ctrl + zoom to zoom, show an overlay if that condition is not met
				this.olMap.on("wheel", function(event) {
					
					if(!ol.events.condition.platformModifierKeyOnly(event))
					{
						self.showGestureOverlay();

						// Allow the page to scroll normally by commenting this out 
						//event.originalEvent.preventDefault();
						
						return false;
					}
					
				});
				
				this.gestureOverlay.text(WPGMZA.localized_strings.use_ctrl_scroll_to_zoom);
			}
		}
		
		// Controls
		this.olMap.getControls().forEach(function(control) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(control instanceof ol.control.Zoom && WPGMZA.settings.wpgmza_settings_map_zoom == true)
				self.olMap.removeControl(control);
			
		}, this);
		
		if(!isSettingDisabled(WPGMZA.settings.wpgmza_settings_map_full_screen_control))
			this.olMap.addControl(new ol.control.FullScreen());
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			// Marker layer
			this.markerLayer = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: []
				})
			});
			this.olMap.addLayer(this.markerLayer);
			
			this.olMap.on("click", function(event) {
				var features = self.olMap.getFeaturesAtPixel(event.pixel);
				
				if(!features || !features.length)
					return;
				
				var marker = features[0].wpgmzaMarker;
					
				if(!marker){
					return;
				}
				
				marker.trigger("click");
				marker.trigger("select");
			});
		}
		
		// Listen for drag start
		this.olMap.on("movestart", function(event) {
			self.isBeingDragged = true;
		});
		
		// Listen for end of pan so we can wrap longitude if needs be
		this.olMap.on("moveend", function(event) {
			self.wrapLongitude();
			
			self.isBeingDragged = false;
			self.dispatchEvent("dragend");
			self.onIdle();
		});
		
		// Listen for zoom
		this.olMap.getView().on("change:resolution", function(event) {
			self.dispatchEvent("zoom_changed");
			self.dispatchEvent("zoomchanged");
			setTimeout(function() {
				self.onIdle();
			}, 10);
		});
		
		// Listen for bounds changing
		this.olMap.getView().on("change", function() {
			// Wrap longitude
			self.onBoundsChanged();
		});
		self.onBoundsChanged();
		
		// Hover interaction
		this._mouseoverNativeFeatures = [];
		
		this.olMap.on("pointermove", function(event) {
			
			if(event.dragging)
				return;
			
			try{
				var featuresUnderPixel = event.target.getFeaturesAtPixel(event.pixel);
			}catch(e) {
				// NB: Hacktacular.. An error is thrown when you mouse over a heatmap. See https://github.com/openlayers/openlayers/issues/10100. This was allegedly solved and merged in but seems to still be present in OpenLayers 6.4.3.
				return;
			}
			
			if(!featuresUnderPixel)
				featuresUnderPixel = [];
			
			var nativeFeaturesUnderPixel = [], i, props;
			
			for(i = 0; i < featuresUnderPixel.length; i++)
			{
				props = featuresUnderPixel[i].getProperties();
				
				if(!props.wpgmzaFeature)
					continue;
				
				nativeFeature = props.wpgmzaFeature;
				nativeFeaturesUnderPixel.push(nativeFeature);
				
				if(self._mouseoverNativeFeatures.indexOf(nativeFeature) == -1)
				{
					// Now hovering over this feature, when we weren't previously
					nativeFeature.trigger("mouseover");
					self._mouseoverNativeFeatures.push(nativeFeature);
				}
			}
				
			for(i = self._mouseoverNativeFeatures.length - 1; i >= 0; i--)
			{
				nativeFeature = self._mouseoverNativeFeatures[i];
				
				if(nativeFeaturesUnderPixel.indexOf(nativeFeature) == -1)
				{
					// No longer hovering over this feature, where we had been previously
					nativeFeature.trigger("mouseout");
					self._mouseoverNativeFeatures.splice(i, 1);
				}
			}
			
		});
		
		// Right click listener
		$(this.element).on("click contextmenu", function(event) {
			
			var isRight;
			event = event || window.event;

			var latLng = self.pixelsToLatLng(event.offsetX, event.offsetY);
			
			if("which" in event)
				isRight = event.which == 3;
			else if("button" in event)
				isRight = event.button == 2;
			
			if(event.which == 1 || event.button == 1){
				if(self.isBeingDragged)
					return;
				
				// Left click
				if($(event.target).closest(".ol-marker").length)
					return; // A marker was clicked, not the map. Do nothing

				/*
				 * User is clicking on the map, but looks like it was not a marker...
				 * 
				 * Finding a light at the end of the tunnel 
				*/
				try{
					if(self.element){
						const nestedCanvases = self.element.querySelectorAll('canvas');
						if(nestedCanvases.length > 1){
							const diff = (nestedCanvases[0].width  /  nestedCanvases[1].width);
							event.offsetX *= diff;
							event.offsetY *= diff;
						}
					}

					var featuresUnderPixel = self.olMap.getFeaturesAtPixel([event.offsetX, event.offsetY]);
				}catch(e) {
					return;
				}
				
				if(!featuresUnderPixel)
					featuresUnderPixel = [];
				
				var nativeFeaturesUnderPixel = [], i, props;
				for(i = 0; i < featuresUnderPixel.length; i++){
					props = featuresUnderPixel[i].getProperties();
					
					if(!props.wpgmzaFeature)
						continue;
					
					nativeFeature = props.wpgmzaFeature;
					nativeFeaturesUnderPixel.push(nativeFeature);
					
					nativeFeature.trigger("click");
				}

				if(featuresUnderPixel.length > 0){
					/*
					 * This is for a pixel interpolated feature, like polygons
					 *
					 * Let's return early, to avoid double event firing
					*/
					return;
				}

				self.trigger({
					type: "click",
					latLng: latLng
				});
				
				return;
			}
			
			if(!isRight){
				return;
			}
			
			return self.onRightClick(event);
		});
		
		// Dispatch event
		if(!WPGMZA.isProVersion())
		{
			this.trigger("init");
			
			this.dispatchEvent("created");
			WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
			
			// Legacy event
			$(this.element).trigger("wpgooglemaps_loaded");
		}
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMap;
	else
		Parent = WPGMZA.Map;
	
	WPGMZA.OLMap.prototype = Object.create(Parent.prototype);
	WPGMZA.OLMap.prototype.constructor = WPGMZA.OLMap;
	
	WPGMZA.OLMap.prototype.getTileLayer = function()
	{
		var options = {};
		
		if(WPGMZA.settings.tile_server_url){
			options.url = WPGMZA.settings.tile_server_url;

			if(WPGMZA.settings.tile_server_url === 'custom_override'){
				if(WPGMZA.settings.tile_server_url_override && WPGMZA.settings.tile_server_url_override.trim() !== ""){
					options.url = WPGMZA.settings.tile_server_url_override.trim();
				} else {
					//Override attempt, let's default?
					options.url = "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png";
				}
			}

			if(WPGMZA.settings.open_layers_api_key && WPGMZA.settings.open_layers_api_key !== ""){
				options.url += "?apikey=" + WPGMZA.settings.open_layers_api_key.trim();
			}
		}

		if(this.settings && this.settings.custom_tile_enabled){
			if(this.settings.custom_tile_image_width && this.settings.custom_tile_image_height){
				let width = parseInt(this.settings.custom_tile_image_width);
				let height = parseInt(this.settings.custom_tile_image_height);

				let imageDimensions = null; //autodetect
				try{
					if(window.devicePixelRatio && window.devicePixelRatio != 1){
						/* For retina displays, lets multiple the target dimensions, with the devicePixelRatio */
						/* Updated 2022-07-07: Was unreliable, moved to setting manual dimensions */
						/*
						width *= window.devicePixelRatio;
						height *= window.devicePixelRatio;
						*/
						imageDimensions = [width, height];
					}
				} catch (ex){
					/* Do nothing */
				}

				if(this.settings.custom_tile_image){
					const extent = [0, 0, width, height];
		
					const projection = new ol.proj.Projection({
						code: 'custom-tile-map',
						units: 'pixels',
						extent: extent
					});

					return new ol.layer.Image({
						source: new ol.source.ImageStatic({
							attributions: this.settings.custom_tile_image_attribution ? this.settings.custom_tile_image_attribution : '©',
							url: this.settings.custom_tile_image,
							projection: projection,
							imageExtent: extent,
							imageSize: imageDimensions
						})
					});
				}
			}
		}
		
		return new ol.layer.Tile({
			source: new ol.source.OSM(options)
		});
	}

	WPGMZA.OLMap.prototype.getTileView = function(viewOptions){
		if(this.settings && this.settings.custom_tile_enabled){
			if(this.settings.custom_tile_image_width && this.settings.custom_tile_image_height){
				const width = parseInt(this.settings.custom_tile_image_width);
				const height = parseInt(this.settings.custom_tile_image_height);
				
				if(this.settings.custom_tile_image){
					const extent = [0, 0, width, height];
		
					const projection = new ol.proj.Projection({
						code: 'custom-tile-map',
						units: 'pixels',
						extent: extent
					});

					viewOptions.projection = projection;

					this.customTileModeExtent = extent;
					this.customTileMode = true;
				}
			}
		}
		return new ol.View(viewOptions)
	}
	
	WPGMZA.OLMap.prototype.wrapLongitude = function()
	{
		var transformed = ol.proj.transform(this.olMap.getView().getCenter(), "EPSG:3857", "EPSG:4326");
		var center = {
			lat: transformed[1],
			lng: transformed[0]
		};
		
		if(center.lng >= -180 && center.lng <= 180)
			return;
		
		center.lng = center.lng - 360 * Math.floor(center.lng / 360);
		
		if(center.lng > 180)
			center.lng -= 360;
		
		this.setCenter(center);
	}
	
	WPGMZA.OLMap.prototype.getCenter = function()
	{
		var lonLat = ol.proj.toLonLat(
			this.olMap.getView().getCenter()
		);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	WPGMZA.OLMap.prototype.setCenter = function(latLng)
	{
		var view = this.olMap.getView();
		
		WPGMZA.Map.prototype.setCenter.call(this, latLng);
		
		view.setCenter(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		
		this.wrapLongitude();

		this.onBoundsChanged();
	}
	
	WPGMZA.OLMap.prototype.getBounds = function()
	{
		var bounds = this.olMap.getView().calculateExtent(this.olMap.getSize());
		var nativeBounds = new WPGMZA.LatLngBounds();
		
		var topLeft = ol.proj.toLonLat([bounds[0], bounds[1]]);
		var bottomRight = ol.proj.toLonLat([bounds[2], bounds[3]]);
		
		nativeBounds.north = topLeft[1];
		nativeBounds.south = bottomRight[1];
		
		nativeBounds.west = topLeft[0];
		nativeBounds.east = bottomRight[0];
		
		return nativeBounds;
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	WPGMZA.OLMap.prototype.fitBounds = function(southWest, northEast)
	{
		if(southWest instanceof WPGMZA.LatLng)
			southWest = {lat: southWest.lat, lng: southWest.lng};
		if(northEast instanceof WPGMZA.LatLng)
			northEast = {lat: northEast.lat, lng: northEast.lng};
		else if(southWest instanceof WPGMZA.LatLngBounds)
		{
			var bounds = southWest;
			
			southWest = {
				lat: bounds.south,
				lng: bounds.west
			};
			
			northEast = {
				lat: bounds.north,
				lng: bounds.east
			};
		}
		
		var view = this.olMap.getView();
		
		var extent = ol.extent.boundingExtent([
			ol.proj.fromLonLat([
				parseFloat(southWest.lng),
				parseFloat(southWest.lat)
			]),
			ol.proj.fromLonLat([
				parseFloat(northEast.lng),
				parseFloat(northEast.lat)
			])
		]);
		view.fit(extent, this.olMap.getSize());
	}
	
	WPGMZA.OLMap.prototype.panTo = function(latLng, zoom)
	{
		var view = this.olMap.getView();
		var options = {
			center: ol.proj.fromLonLat([
				parseFloat(latLng.lng),
				parseFloat(latLng.lat),
			]),
			duration: 500
		};
		
		if(arguments.length > 1)
			options.zoom = parseInt(zoom);
		
		view.animate(options);
	}
	
	WPGMZA.OLMap.prototype.getZoom = function()
	{
		return Math.round( this.olMap.getView().getZoom() );
	}
	
	WPGMZA.OLMap.prototype.setZoom = function(value)
	{
		this.olMap.getView().setZoom(value);
	}
	
	WPGMZA.OLMap.prototype.getMinZoom = function()
	{
		return this.olMap.getView().getMinZoom();
	}
	
	WPGMZA.OLMap.prototype.setMinZoom = function(value)
	{
		this.olMap.getView().setMinZoom(value);
	}
	
	WPGMZA.OLMap.prototype.getMaxZoom = function()
	{
		return this.olMap.getView().getMaxZoom();
	}
	
	WPGMZA.OLMap.prototype.setMaxZoom = function(value)
	{
		this.olMap.getView().setMaxZoom(value);
	}
	
	WPGMZA.OLMap.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		if(!this.olMap)
			return;
		
		this.olMap.getView().setProperties( this.settings.toOLViewOptions() );
	}
	
	/**
	 * TODO: Consider moving all these functions to their respective classes, same on google map (DO IT!!! It's very misleading having them here)
	 */
	WPGMZA.OLMap.prototype.addMarker = function(marker)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT)
			this.olMap.addOverlay(marker.overlay);
		else
		{
			this.markerLayer.getSource().addFeature(marker.feature);
			marker.featureInSource = true;
		}
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	WPGMZA.OLMap.prototype.removeMarker = function(marker)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT)
			this.olMap.removeOverlay(marker.overlay);
		else
		{
			this.markerLayer.getSource().removeFeature(marker.feature);
			marker.featureInSource = false;
		}
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	WPGMZA.OLMap.prototype.addPolygon = function(polygon)
	{
		this.olMap.addLayer(polygon.layer);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	WPGMZA.OLMap.prototype.removePolygon = function(polygon)
	{
		this.olMap.removeLayer(polygon.layer);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	WPGMZA.OLMap.prototype.addPolyline = function(polyline)
	{
		this.olMap.addLayer(polyline.layer);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	WPGMZA.OLMap.prototype.removePolyline = function(polyline)
	{
		this.olMap.removeLayer(polyline.layer);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	WPGMZA.OLMap.prototype.addCircle = function(circle)
	{
		this.olMap.addLayer(circle.layer);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	WPGMZA.OLMap.prototype.removeCircle = function(circle)
	{
		this.olMap.removeLayer(circle.layer);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	WPGMZA.OLMap.prototype.addRectangle = function(rectangle)
	{
		this.olMap.addLayer(rectangle.layer);
		
		Parent.prototype.addRectangle.call(this, rectangle);
	}
	
	WPGMZA.OLMap.prototype.removeRectangle = function(rectangle)
	{
		this.olMap.removeLayer(rectangle.layer);
		
		Parent.prototype.removeRectangle.call(this, rectangle);
	}
	
	WPGMZA.OLMap.prototype.pixelsToLatLng = function(x, y)
	{
		if(y == undefined)
		{
			if("x" in x && "y" in x)
			{
				y = x.y;
				x = x.x;
			}
			else
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
		}
		
		var coord = this.olMap.getCoordinateFromPixel([x, y]);
		
		if(!coord)
			return {
				x: null,
				y: null
			};
		
		var lonLat = ol.proj.toLonLat(coord);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	WPGMZA.OLMap.prototype.latLngToPixels = function(latLng)
	{
		var coord = ol.proj.fromLonLat([latLng.lng, latLng.lat]);
		var pixel = this.olMap.getPixelFromCoordinate(coord);
		
		if(!pixel)
			return {
				x: null,
				y: null
			};
		
		return {
			x: pixel[0],
			y: pixel[1]
		};
	}
	
	WPGMZA.OLMap.prototype.enableBicycleLayer = function(value)
	{
		if(value)
		{
			if(!this.bicycleLayer)
				this.bicycleLayer = new ol.layer.Tile({
					source: new ol.source.OSM({
						url: "http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
					})
				});
				
			this.olMap.addLayer(this.bicycleLayer);
		}
		else
		{
			if(!this.bicycleLayer)
				return;
			
			this.olMap.removeLayer(this.bicycleLayer);
		}
	}
	
	WPGMZA.OLMap.prototype.showGestureOverlay = function()
	{
		var self = this;
		
		clearTimeout(this.gestureOverlayTimeoutID);
		
		$(this.gestureOverlay).stop().animate({opacity: "100"});
		$(this.element).append(this.gestureOverlay);
		
		$(this.gestureOverlay).css({
			"line-height":	$(this.element).height() + "px",
			"opacity":		"1.0"
		});
		$(this.gestureOverlay).show();
		
		this.gestureOverlayTimeoutID = setTimeout(function() {
			self.gestureOverlay.fadeOut(2000);
		}, 2000);
	}
	
	WPGMZA.OLMap.prototype.onElementResized = function(event)
	{
		this.olMap.updateSize();
	}
	
	WPGMZA.OLMap.prototype.onRightClick = function(event)
	{
		if($(event.target).closest(".ol-marker, .wpgmza_modern_infowindow, .wpgmza-modern-store-locator").length)
			return true;
		
		var parentOffset = $(this.element).offset();
		var relX = event.pageX - parentOffset.left;
		var relY = event.pageY - parentOffset.top;
		var latLng = this.pixelsToLatLng(relX, relY);
		
		this.trigger({type: "rightclick", latLng: latLng});
		
		// Legacy event compatibility
		$(this.element).trigger({type: "rightclick", latLng: latLng});
		
		// Prevent menu
		event.preventDefault();
		return false;
	}

	WPGMZA.OLMap.prototype.enableAllInteractions = function()
	{	

		this.olMap.getInteractions().forEach(function(interaction) {
			
			if(interaction instanceof ol.interaction.DragPan || interaction instanceof ol.interaction.DoubleClickZoom || interaction instanceof ol.interaction.MouseWheelZoom)
			{
				interaction.setActive(true);
			}
			
		}, this);

	}
	
});
