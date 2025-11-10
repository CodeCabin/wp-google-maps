/**
 * @namespace WPGMZA
 * @module LeafletMap
 * @requires WPGMZA.Map
 * @pro-requires WPGMZA.ProMap
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.LeafletMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element);
		
		this.setOptions(options);
		
		$(this.element).html("");

		let mapOptions = this.settings.toLeafletViewOptions();
        mapOptions = mapOptions ? mapOptions : {};

		this.mapType = mapOptions.mapType ? mapOptions.mapType : 'roadmap';
		this.tileLayers = this.getTileLayers();

        mapOptions.layers = this.tileLayers;

		if(this.customTileMode){
			mapOptions.crs = L.extend({}, L.CRS.Simple, {
				scale: (zoom) => {
					const initialScale = Math.min(
						1000 / this.customTileDimensions.width,
						1000 / this.customTileDimensions.height
					);
					return initialScale * Math.pow(2, zoom);
				}
			});

			if(this.customTileBounds){
				const mapBounds = L.latLngBounds(this.customTileBounds);
				if(!mapBounds.contains(mapOptions.center)){
					/* Starting location is out of bounds */
					mapOptions.center = mapBounds.getCenter();
					this.onBoundsChanged();
				}
			}
		}

		mapOptions = this.extendNativeConfig(mapOptions);

        this.leafletMap = L.map($(element)[0], mapOptions);

		function isSettingDisabled(value) {
			if(value === "yes"){
				return true;
			}
			return (value ? true : false);
		}
		
		/* Gesture Handling */
		if(!(this.settings.wpgmza_force_greedy_gestures == "greedy" || this.settings.wpgmza_force_greedy_gestures == "yes" || this.settings.wpgmza_force_greedy_gestures == true)){
			this.gestureOverlay = $("<div class='wpgmza-gesture-overlay'></div>")
			this.gestureOverlayTimeoutID = null;
			
			if(WPGMZA.isTouchDevice()) {
				/* Touch : Two finger pan for drag events */
				if(this.leafletMap.dragging){
					this.leafletMap.dragging.disable();

					this.gestureState = {
						touches : {},
						touchCount : 0,
						midpoint : null,
						center : null
					};

					const leafletContainer = this.leafletMap.getContainer();

					L.DomEvent.on(leafletContainer, 'touchstart', (event) => {
						Array.from(event.touches).forEach((touch) => {
							this.gestureState.touches[touch.identifier] = {
								x : touch.clientX,
								y : touch.clientY
							};
						});

						this.gestureState.touchCount = Object.keys(this.gestureState.touches).length;
						if(this.gestureState.touchCount === 2){
							/* Two finger pan, track the gesture event for panning */
							L.DomEvent.preventDefault(event);

							let touches = {
								a : event.touches[0],
								b : event.touches[1]
							};

							this.gestureState.midpoint = L.point(
								(touches.a.clientX + touches.b.clientX) / 2,
								(touches.a.clientY + touches.b.clientY) / 2
							);

							this.gestureState.center = this.leafletMap.getCenter();
						} else if(this.gestureState.touchCount === 1){
							/* If one touch, show the notice, if more we don't do anything */
							this.showGestureOverlay();
						}
					});

					L.DomEvent.on(leafletContainer, 'touchmove', (event) => {
						if(this.gestureState.touchCount === 2 && event.touches.length === 2){
							L.DomEvent.preventDefault(event);

							let touches = {
								a : event.touches[0],
								b : event.touches[1]
							};

							const midpoint = L.point(
								(touches.a.clientX + touches.b.clientX) / 2,
								(touches.a.clientY + touches.b.clientY) / 2
							);

							const delta = {
								x : midpoint.x - this.gestureState.midpoint.x,
								y : midpoint.y - this.gestureState.midpoint.y
							};

							const mapCenterPoint = this.leafletMap.latLngToContainerPoint(this.gestureState.center);

							this.leafletMap.panTo(
								this.leafletMap.containerPointToLatLng(
									L.point(
										mapCenterPoint.x - delta.x,
										mapCenterPoint.y - delta.y
									)
								),
								{
									animate : false
								}
							);
						}
					});

					L.DomEvent.on(leafletContainer, 'touchend', (event) => {
						Array.from(event.changedTouches).forEach((touch) => {
							delete this.gestureState.touches[touch.identifier];
						});

						if(Object.keys(this.gestureState.touches).length < 2){
							this.gestureState.midpoint = null;
							this.gestureState.center = null;
						}
					});

					L.DomEvent.on(leafletContainer, 'touchcancel', (event) => {
						this.gestureState.touches = {};
						this.gestureState.midpoint = null;
						this.gestureState.center = null;
					});

					this.gestureOverlay.text(WPGMZA.localized_strings.use_two_fingers);
				}
			} else {
				/* Desktop : Require CTLR or CMD + Scroll to zoom, show overlay if not */
				if(this.leafletMap.scrollWheelZoom){
					this.leafletMap.scrollWheelZoom.disable();

					const leafletContainer = this.leafletMap.getContainer();
					L.DomEvent.on(leafletContainer, 'wheel', (event) => {
						L.DomEvent.preventDefault(event);

						if(event.ctrlKey || event.metaKey){
							const delta = L.DomEvent.getWheelDelta(event);
							this.leafletMap.setZoom(this.leafletMap.getZoom() + (delta > 0 ? 1 : -1));
						} else {
							this.showGestureOverlay();
						}
					});

					let getstureString = WPGMZA.localized_strings.use_ctrl_scroll_to_zoom;
					if(WPGMZA.isDeviceiOS()){
						getstureString = WPGMZA.localized_strings.use_ctrl_scroll_to_zoom_ios;
					}
					
					this.gestureOverlay.text(getstureString);
				}
			}
		}
		
		/* Layer control */
		const multiLayerConfig = this.settings.hasMutlilayerTileServer();
		if(multiLayerConfig && !this.customTileMode){
			/* This map has more than one layer in it's tile server configuration */

			if(!isSettingDisabled(WPGMZA.settings.wpgmza_settings_map_type)){
				this.addMapTypeControl(multiLayerConfig);
			}
		}

		/* Fullscreen Controller */
		if(!isSettingDisabled(WPGMZA.settings.wpgmza_settings_map_full_screen_control)){
			this.addFullscreenControl();
		}

		/* Click listener */
		this.leafletMap.on('click', (event) => {
			this.dispatchEvent({
				type: "click", 
				map: this, 
				latLng : {
					lat : event.latlng.lat, 
					lng : event.latlng.lng
				}
			});
		})
		
		/* Drag Start */
		this.leafletMap.on("movestart", (event) => {
			this.isBeingDragged = true;
		});
		
		/* Drag End */
		this.leafletMap.on("moveend", (event) => {
			// this.wrapLongitude();
			
			if(this.isBeingDragged){
				this.dispatchEvent("dragend");
				this.isBeingDragged = false;
			}
			this.onIdle();
		});
		
		/* Zoom Event */
		this.leafletMap.on('zoomend', (event) => {
			this.dispatchEvent("zoom_changed");
			this.dispatchEvent("zoomchanged");
			setTimeout(() => {
				this.onIdle();
			}, 10);
		});
		
		/* Bounds change */
		this.leafletMap.on("move", () => {
			this.onBoundsChanged();
		});

		this.onBoundsChanged();
		
		/* Right click listener */
		this.leafletMap.on('click contextmenu', (event) => {
			let isRight;
			
			if("which" in event.originalEvent)
				isRight = event.originalEvent.which == 3;
			else if("button" in event.originalEvent)
				isRight = event.originalEvent.button == 2;
			
			if(event.originalEvent.which == 1 || event.originalEvent.button == 1){
				if(this.isBeingDragged){
					return;
				}
			}
			
			if(!isRight){
				return;
			}
			
			return this.onRightClick(event);
		});
		
		// Dispatch event
		if(!WPGMZA.isProVersion()) {
			this.trigger("init");
			
			this.dispatchEvent("created");
			WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
			
			// Legacy event
			$(this.element).trigger("wpgooglemaps_loaded");
		}

		if(this.innerStack && this.innerStack.length > 0){
			/* Disable inner stack components from allowing clicks through to the map surface */
			this.innerStack.each((index, element) => {
				L.DomEvent.disableClickPropagation(element);
				L.DomEvent.disableScrollPropagation(element);
				L.DomEvent.on(element, 'mousedown', L.DomEvent.stopPropagation);
			});
		}
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMap;
	else
		Parent = WPGMZA.Map;
	
	WPGMZA.LeafletMap.prototype = Object.create(Parent.prototype);
	WPGMZA.LeafletMap.prototype.constructor = WPGMZA.LeafletMap;
	
	WPGMZA.LeafletMap.prototype.getTileLayers = function(){
		let url = WPGMZA.settings.tile_server_url ? WPGMZA.settings.tile_server_url : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
		let tileKey = WPGMZA.settings.leaflet_api_key ? WPGMZA.settings.leaflet_api_key : false;

		switch(WPGMZA.settings.engine){
			case 'leaflet-azure':
				/* Remap to Azure settings */
				url = WPGMZA.settings.tile_server_url_leaflet_azure ? WPGMZA.settings.tile_server_url_leaflet_azure : url;
				tileKey = WPGMZA.settings.wpgmza_leaflet_azure_key ? WPGMZA.settings.wpgmza_leaflet_azure_key : tileKey;
				break;
			case 'leaflet-stadia':
				/* Remap to Stadia settings */
				url = WPGMZA.settings.tile_server_url_leaflet_stadia ? WPGMZA.settings.tile_server_url_leaflet_stadia : url;
				tileKey = WPGMZA.settings.wpgmza_leaflet_stadia_key ? WPGMZA.settings.wpgmza_leaflet_stadia_key : tileKey;
				break;
			case 'leaflet-maptiler':
				/* Remap to Maptiler settings */
				url = WPGMZA.settings.tile_server_url_leaflet_maptiler ? WPGMZA.settings.tile_server_url_leaflet_maptiler : url;
				tileKey = WPGMZA.settings.wpgmza_leaflet_maptiler_key ? WPGMZA.settings.wpgmza_leaflet_maptiler_key : tileKey;
				break;
			case 'leaflet-locationiq':
				/* Remap to LocationIQ settings */
				url = WPGMZA.settings.tile_server_url_leaflet_locationiq ? WPGMZA.settings.tile_server_url_leaflet_locationiq : url;
				tileKey = WPGMZA.settings.wpgmza_leaflet_locationiq_key ? WPGMZA.settings.wpgmza_leaflet_locationiq_key : tileKey;
				break;
			case 'leaflet-zerocost':
				/* Remap to zerocost settings */
				url = WPGMZA.settings.tile_server_url_leaflet_zerocost ? WPGMZA.settings.tile_server_url_leaflet_zerocost : url;
				break;
		}

		const config = this.settings.configureTileServer(url, {
			authentication : tileKey, 
			preferServerGlobals : true,
			map : this
		});

		if(config && config.url){
			if(config.type && config.type === 'vector' && typeof L.maplibreGL !== 'undefined'){
				/* Vector base layer, so we use MapLibreGL */
				let mapLibreOptions = {style :  config.url};
				if(config.options){
					for(let key in config.options){
						if(key === 'url'){
							continue;
						}

						mapLibreOptions[key] = config.options[key];
					};
				}
				
				return [L.maplibreGL(mapLibreOptions)];
			} else if (config.type && config.type === 'custom'){
				this.customTileDimensions = {width : config.custom.width, height : config.custom.height};
				this.customTileBounds = [[0,0], [this.customTileDimensions.height, this.customTileDimensions.width]];
				this.customTileMode = true;
				return [L.imageOverlay(config.url, this.customTileBounds, {
					attribution: config.custom.attribution ? config.custom.attribution : '©'
				})];
			}

			const layers = [];

			if(config.dependencies){
				for(let dependency of config.dependencies){
					layers.push(new L.tileLayer(dependency.url, config.options ? config.options : {}));
				}
			}

			layers.push(new L.tileLayer(config.url, config.options ? config.options : {}));
			return layers;
		} 

		/* Fallback */
		return [new L.tileLayer(url, {})];
	}
	
	WPGMZA.LeafletMap.prototype.wrapLongitude = function(){
		let center = this.leafletMap.getCenter();
		if(center.lng >= -180 && center.lng <= 180){
			return;
		}
		
		center.lng = center.lng - 360 * Math.floor(center.lng / 360);
		
		if(center.lng > 180){
			center.lng -= 360;
		}
		
		this.setCenter(center);
	}
	
	WPGMZA.LeafletMap.prototype.getCenter = function(){
		const center = this.leafletMap.getCenter();
		return {
			lat: center.lat,
			lng: center.lng
		};
	}
	
	WPGMZA.LeafletMap.prototype.setCenter = function(latLng) {
		WPGMZA.Map.prototype.setCenter.call(this, latLng);
		
		this.leafletMap.panTo(L.latLng({lat : latLng.lat, lng : latLng.lng}), {animate : false});
		// this.wrapLongitude();

		this.onBoundsChanged();
	}
	
	WPGMZA.LeafletMap.prototype.getBounds = function() {
		let bounds = this.leafletMap.getBounds();
		let nativeBounds = new WPGMZA.LatLngBounds();
		
		nativeBounds.north = bounds.getNorth();
		nativeBounds.south = bounds.getSouth();
		
		nativeBounds.west = bounds.getWest();
		nativeBounds.east = bounds.getEast();
		
		return nativeBounds;
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	WPGMZA.LeafletMap.prototype.fitBounds = function(southWest, northEast) {
		if(southWest instanceof WPGMZA.LatLng){
			southWest = {lat: southWest.lat, lng: southWest.lng};
		}

		if(northEast instanceof WPGMZA.LatLng){
			northEast = {lat: northEast.lat, lng: northEast.lng};
		} else if(southWest instanceof WPGMZA.LatLngBounds) {
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
		
		const leafletBounds = L.latLngBounds(
			L.latLng({lat : northEast.lat, lng : northEast.lng}), 
			L.latLng({lat : southWest.lat, lng : southWest.lng})
		);

		this.leafletMap.fitBounds(leafletBounds, { padding : [60, 60]});
	}
	
	WPGMZA.LeafletMap.prototype.panTo = function(latLng, zoom) {
		if(arguments.length > 1){
			this.leafletMap.flyTo(L.latLng({lat: latLng.lat, lng: latLng.lng}), parseInt(zoom));
		} else {
			this.leafletMap.flyTo(L.latLng({lat: latLng.lat, lng: latLng.lng}));
		}
	}
	
	WPGMZA.LeafletMap.prototype.getZoom = function() {
		return Math.round( this.leafletMap.getZoom() );
	}
	
	WPGMZA.LeafletMap.prototype.setZoom = function(value) {
		this.leafletMap.setZoom(value);
	}
	
	WPGMZA.LeafletMap.prototype.getMinZoom = function() {
		return this.leafletMap.getMinZoom();
	}
	
	WPGMZA.LeafletMap.prototype.setMinZoom = function(value) {
		this.leafletMap.setMinZoom(value);
	}
	
	WPGMZA.LeafletMap.prototype.getMaxZoom = function() {
		return this.leafletMap.getMaxZoom();
	}
	
	WPGMZA.LeafletMap.prototype.setMaxZoom = function(value) {
		this.leafletMap.setMaxZoom(value);
	}

	WPGMZA.LeafletMap.prototype.setMapType = function(type){
		if(this.mapType !== type){
			this.mapType = type;

			if(this.tileLayers){
				for(let layer of this.tileLayers){
					if(this.leafletMap.hasLayer(layer)){
						this.leafletMap.removeLayer(layer);
					}
				}
			}

			this.tileLayers = this.getTileLayers();

			for(let layer of this.tileLayers){
				this.leafletMap.addLayer(layer);
			}

			$(this.element).find('.leaflet-layer-button[data-map-type]').removeClass('selected');
			$(this.element).find('.leaflet-layer-button[data-map-type="' + type + '"]').addClass('selected');
		}	
	}

	WPGMZA.LeafletMap.prototype.getMapType = function(){
		return this.mapType ? this.mapType : 'roadmap';
	}
	
	WPGMZA.LeafletMap.prototype.setOptions = function(options) {
		Parent.prototype.setOptions.call(this, options);
		
		if(!this.leafletMap){
			/* Hasn't been initialized yet */
			return;
		}

		/* Leaflet doesn't allow a bulk setter like other engines, we need to manage this internally */
		let mapOptions = this.settings.toLeafletViewOptions();
		for (const key in mapOptions) {
			if (!mapOptions.hasOwnProperty(key)) {
				continue;
			}

        	const value = options[key];

			switch (key) {
				case 'zoomControl':
					if (value === false && this.leafletMap.zoomControl) {
						this.leafletMap.removeControl(this.leafletMap.zoomControl);
					} else if (value === true && !this.leafletMap.zoomControl) {
						this.leafletMap.addControl(L.control.zoom());
					}
					break;
				case 'dragging':
				case 'doubleClickZoom':
				case 'scrollWheelZoom':
				case 'boxZoom':
				case 'keyboard':
				case 'tap': 
				case 'touchZoom':
					if (this.leafletMap[key]) {
						if (value === true) {
							this.leafletMap[key].enable();
						} else {
							this.leafletMap[key].disable();
						}
					}
					break;
				case 'minZoom':
					this.setMinZoom(value);
					break;
				case 'maxZoom':
					this.setMaxZoom(value);
					break;
				default:
					break;
			}
		}
	}
	
	/**
	 * TODO: Consider moving all these functions to their respective classes, same on google map (DO IT!!! It's very misleading having them here)
	 */
	WPGMZA.LeafletMap.prototype.addMarker = function(marker) {
		marker.leafletMarker.addTo(this.leafletMap);
		Parent.prototype.addMarker.call(this, marker);
	}
	
	WPGMZA.LeafletMap.prototype.removeMarker = function(marker) {
		marker.leafletMarker.removeFrom(this.leafletMap);
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	WPGMZA.LeafletMap.prototype.addPolygon = function(polygon) {
		polygon.leafletFeature.addTo(this.leafletMap);
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	WPGMZA.LeafletMap.prototype.removePolygon = function(polygon) {
		polygon.leafletFeature.remove();
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	WPGMZA.LeafletMap.prototype.addPolyline = function(polyline) {
		polyline.leafletFeature.addTo(this.leafletMap);
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	WPGMZA.LeafletMap.prototype.removePolyline = function(polyline) {
		polyline.leafletFeature.remove();
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	WPGMZA.LeafletMap.prototype.addCircle = function(circle) {
		circle.leafletFeature.addTo(this.leafletMap);
		Parent.prototype.addCircle.call(this, circle);
	}
	
	WPGMZA.LeafletMap.prototype.removeCircle = function(circle) {
		circle.leafletFeature.remove();
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	WPGMZA.LeafletMap.prototype.addRectangle = function(rectangle) {
		rectangle.leafletFeature.addTo(this.leafletMap);
		Parent.prototype.addRectangle.call(this, rectangle);
	}
	
	WPGMZA.LeafletMap.prototype.removeRectangle = function(rectangle) {
		rectangle.leafletFeature.remove();
		Parent.prototype.removeRectangle.call(this, rectangle);
	}
	
	WPGMZA.LeafletMap.prototype.pixelsToLatLng = function(x, y) {
		if(y == undefined) {
			if("x" in x && "y" in x) {
				y = x.y;
				x = x.x;
			} else {
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
			}
		}
		
		let coord = this.leafletMap.containerPointToLatLng(L.point(x, y));
		if(!coord){
			return {
				x: null,
				y: null
			};
		}
		
		return {
			lat: coord.lat,
			lng: coord.lng
		};
	}
	
	WPGMZA.LeafletMap.prototype.latLngToPixels = function(latLng) {
		let pixel = this.leafletMap.latLngToContainerPoint(latLng);
		if(!pixel){
			return {
				x: null,
				y: null
			};
		}
		
		return {
			x: pixel.x,
			y: pixel.y
		};
	}
	
	WPGMZA.LeafletMap.prototype.showGestureOverlay = function() {
		clearTimeout(this.gestureOverlayTimeoutID);
		
		$(this.gestureOverlay).stop().animate({opacity: "100"});
		$(this.element).append(this.gestureOverlay);
		
		$(this.gestureOverlay).css({
			"line-height":	$(this.element).height() + "px",
			"opacity":		"1.0"
		});

		$(this.gestureOverlay).show();
		
		this.gestureOverlayTimeoutID = setTimeout(() => {
			this.gestureOverlay.fadeOut(500);
		}, 1000);
	}
	
	WPGMZA.LeafletMap.prototype.onRightClick = function(event) {
		this.trigger({type: "rightclick", latLng: event.latlng});

		// Legacy event compatibility
		$(this.element).trigger({type: "rightclick", latLng: event.latlng});
		
		// Prevent menu
		event.originalEvent.preventDefault();
		return false;
	}

	WPGMZA.LeafletMap.prototype.addFullscreenControl = function(){
		if(this.leafletMap){
			const fullscreenController = L.control({position : 'topright'});
			fullscreenController.onAdd = (map) => {
				const container = L.DomUtil.create('div');
				container.classList.add('leaflet-bar');
				container.classList.add('leaflet-control');
				container.classList.add('leaflet-control-fullscreen');

				const button = L.DomUtil.create('a');
				button.classList.add('leaflet-control-button');
				button.classList.add('leaflet-fullscreen-button');
				button.href = '#';

				button.setAttribute('aria-label', "Fullscreen");

				const corners = ['tl' , 'tr' , 'bl', 'br'];
				for(let corner of corners){
					const element = L.DomUtil.create('span');
					element.classList.add('leaflet-fullscreen-corner');
					element.classList.add('leaflet-fullscreen-corner-' + corner);
					button.append(element);
				}
				
				container.append(button);

				L.DomEvent.on(button, 'click', (event) => {
					event.preventDefault();
					if(document.fullscreenElement){
						document.exitFullscreen();
					} else {
						const mapContainer = this.element;
						if (mapContainer.requestFullscreen) {
							mapContainer.requestFullscreen();
						} else if (mapContainer.mozRequestFullScreen) {
							mapContainer.mozRequestFullScreen();
						} else if (mapContainer.webkitRequestFullscreen) {
							mapContainer.webkitRequestFullscreen();
						} else if (mapContainer.msRequestFullscreen) {
							mapContainer.msRequestFullscreen();
						}
					}
				});

				return container;
			}

			fullscreenController.addTo(this.leafletMap);
		}
	}

	WPGMZA.LeafletMap.prototype.addMapTypeControl = function(config){
		if(this.leafletMap && config && config.layers && config.layers.length >= 2){
			const layerController = L.control({position : 'topright'});
			layerController.onAdd = (map) => {
				const container = L.DomUtil.create('div');
				container.classList.add('leaflet-bar');
				container.classList.add('leaflet-control');
				container.classList.add('leaflet-control-layers');

				for(let index in config.layers){
					const layer = config.layers[index];

					let label = WPGMZA.localized_strings[`map_type_${layer}`] ? WPGMZA.localized_strings[`map_type_${layer}`] : WPGMZA.capitalizeWords(layer);

					const button = L.DomUtil.create('a');
					button.innerText = label;
					button.classList.add('leaflet-control-button');
					button.classList.add('leaflet-layer-button');
					button.href = '#';

					button.setAttribute('data-map-type', layer);

					if(config.active && config.active === layer){
						button.classList.add('selected');
					}

					container.append(button);

					L.DomEvent.on(button, 'click', (event) => {
						event.preventDefault();
						this.setMapType(layer);
					});
				}
				

				return container;
			}

			layerController.addTo(this.leafletMap);
		}
	}

	WPGMZA.LeafletMap.prototype.getLayerGroupPane = function(pane, layer, basePane){
		basePane = typeof basePane === 'undefined' || !basePane ? 'overlayPane' : basePane;
		if(this.leafletMap){
			let nativePane = this.leafletMap.getPane(`${pane}${layer}`);
			if(!nativePane){
				nativePane = this.leafletMap.createPane(`${pane}${layer}`, this.leafletMap.getPane(basePane)); 
				nativePane.style.zIndex = layer;    
			} 

			return `${pane}${layer}`;
		}
		return false;
	}

	WPGMZA.LeafletMap.prototype.resetBounds = function() {
		var latlng = new WPGMZA.LatLng(this.settings.map_start_lat, this.settings.map_start_lng);
		this.panTo(latlng, this.settings.map_start_zoom);
	}
});
