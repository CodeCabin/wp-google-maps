/**
 * @namespace WPGMZA
 * @module OLMap
 * @requires WPGMZA.Map
 * @gulp-requires ../map.js
 * @pro-requires WPGMZA.ProMap
 * @gulp-pro-requires pro-map.js
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
			view: new ol.View(viewOptions)
		});
		
		// TODO: Re-implement using correct setting names
		// Interactions
		this.olMap.getInteractions().forEach(function(interaction) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive( (self.settings.wpgmza_settings_map_draggable == "yes" ? false : true) );
			else if(interaction instanceof ol.interaction.DoubleClickZoom)
				interaction.setActive( (self.settings.wpgmza_settings_map_clickzoom ? false : true) );
			else if(interaction instanceof ol.interaction.MouseWheelZoom)
				interaction.setActive( (self.settings.wpgmza_settings_map_scroll == "yes" ? false : true) );
			
		}, this);
		
		// Cooperative gesture handling
		if(!(this.settings.wpgmza_force_greedy_gestures == "greedy" || this.settings.wpgmza_force_greedy_gestures == "yes"))
		{
			this.gestureOverlay = $("<div class='wpgmza-gesture-overlay'></div>")
			this.gestureOverlayTimeoutID = null;
			
			if(WPGMZA.isTouchDevice())
			{
				// On touch devices, require two fingers to drag and pan
				// NB: Temporarily removed due to inconsistent behaviour
				/*this.olMap.getInteractions().forEach(function(interaction) {
					
					if(interaction instanceof ol.interaction.DragPan)
						self.olMap.removeInteraction(interaction);
					
				});
				
				this.olMap.addInteraction(new ol.interaction.DragPan({
					
					condition: function(olBrowserEvent) {
						
						var allowed = olBrowserEvent.originalEvent.touches.length == 2;
						
						if(!allowed)
							self.showGestureOverlay();
						
						return allowed;
					}
					
				}));
				
				this.gestureOverlay.text(WPGMZA.localized_strings.use_two_fingers);*/
			}
			else
			{
				// On desktops, require Ctrl + zoom to zoom, show an overlay if that condition is not met
				this.olMap.on("wheel", function(event) {
					
					if(!ol.events.condition.platformModifierKeyOnly(event))
					{
						self.showGestureOverlay();
						event.originalEvent.preventDefault();
						return false;
					}
					
				});
				
				this.gestureOverlay.text(WPGMZA.localized_strings.use_ctrl_scroll_to_zoom);
			}
		}
		
		// Controls
		this.olMap.getControls().forEach(function(control) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(control instanceof ol.control.Zoom && WPGMZA.settings.wpgmza_settings_map_zoom == "yes")
				self.olMap.removeControl(control);
			
		}, this);
		
		if(WPGMZA.settings.wpgmza_settings_map_full_screen_control != "yes")
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
				
				if(!marker)
					return;
				
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
		
		// Store locator center
		var marker;
		if(this.storeLocator && (marker = this.storeLocator.centerPointMarker))
		{
			this.olMap.addOverlay(marker.overlay);
			marker.setVisible(false);
		}
		
		// Right click listener
		$(this.element).on("click contextmenu", function(event) {
			
			var isRight;
			event = event || window.event;
			
			var latLng = self.pixelsToLatLng(event.offsetX, event.offsetY);
			
			if("which" in event)
				isRight = event.which == 3;
			else if("button" in event)
				isRight = event.button == 2;
			
			if(event.which == 1 || event.button == 1)
			{
				if(self.isBeingDragged)
					return;
				
				// Left click
				if($(event.target).closest(".ol-marker").length)
					return; // A marker was clicked, not the map. Do nothing
				
				self.trigger({
					type: "click",
					latLng: latLng
				});
				
				return;
			}
			
			if(!isRight)
				return;
			
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
		
		if(WPGMZA.settings.tile_server_url)
			options.url = WPGMZA.settings.tile_server_url;
		
		return new ol.layer.Tile({
			source: new ol.source.OSM(options)
		});
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1tYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgT0xNYXBcclxuICogQHJlcXVpcmVzIFdQR01aQS5NYXBcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vbWFwLmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb01hcFxyXG4gKiBAZ3VscC1wcm8tcmVxdWlyZXMgcHJvLW1hcC5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5PTE1hcCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQuY2FsbCh0aGlzLCBlbGVtZW50KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHR2YXIgdmlld09wdGlvbnMgPSB0aGlzLnNldHRpbmdzLnRvT0xWaWV3T3B0aW9ucygpO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuaHRtbChcIlwiKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5vbE1hcCA9IG5ldyBvbC5NYXAoe1xyXG5cdFx0XHR0YXJnZXQ6ICQoZWxlbWVudClbMF0sXHJcblx0XHRcdGxheWVyczogW1xyXG5cdFx0XHRcdHRoaXMuZ2V0VGlsZUxheWVyKClcclxuXHRcdFx0XSxcclxuXHRcdFx0dmlldzogbmV3IG9sLlZpZXcodmlld09wdGlvbnMpXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Ly8gVE9ETzogUmUtaW1wbGVtZW50IHVzaW5nIGNvcnJlY3Qgc2V0dGluZyBuYW1lc1xyXG5cdFx0Ly8gSW50ZXJhY3Rpb25zXHJcblx0XHR0aGlzLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24oaW50ZXJhY3Rpb24pIHtcclxuXHRcdFx0XHJcblx0XHRcdC8vIE5COiBUaGUgdHJ1ZSBhbmQgZmFsc2UgdmFsdWVzIGFyZSBmbGlwcGVkIGJlY2F1c2UgdGhlc2Ugc2V0dGluZ3MgcmVwcmVzZW50IHRoZSBcImRpc2FibGVkXCIgc3RhdGUgd2hlbiB0cnVlXHJcblx0XHRcdGlmKGludGVyYWN0aW9uIGluc3RhbmNlb2Ygb2wuaW50ZXJhY3Rpb24uRHJhZ1BhbilcclxuXHRcdFx0XHRpbnRlcmFjdGlvbi5zZXRBY3RpdmUoIChzZWxmLnNldHRpbmdzLndwZ216YV9zZXR0aW5nc19tYXBfZHJhZ2dhYmxlID09IFwieWVzXCIgPyBmYWxzZSA6IHRydWUpICk7XHJcblx0XHRcdGVsc2UgaWYoaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBvbC5pbnRlcmFjdGlvbi5Eb3VibGVDbGlja1pvb20pXHJcblx0XHRcdFx0aW50ZXJhY3Rpb24uc2V0QWN0aXZlKCAoc2VsZi5zZXR0aW5ncy53cGdtemFfc2V0dGluZ3NfbWFwX2NsaWNrem9vbSA/IGZhbHNlIDogdHJ1ZSkgKTtcclxuXHRcdFx0ZWxzZSBpZihpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLk1vdXNlV2hlZWxab29tKVxyXG5cdFx0XHRcdGludGVyYWN0aW9uLnNldEFjdGl2ZSggKHNlbGYuc2V0dGluZ3Mud3BnbXphX3NldHRpbmdzX21hcF9zY3JvbGwgPT0gXCJ5ZXNcIiA/IGZhbHNlIDogdHJ1ZSkgKTtcclxuXHRcdFx0XHJcblx0XHR9LCB0aGlzKTtcclxuXHRcdFxyXG5cdFx0Ly8gQ29vcGVyYXRpdmUgZ2VzdHVyZSBoYW5kbGluZ1xyXG5cdFx0aWYoISh0aGlzLnNldHRpbmdzLndwZ216YV9mb3JjZV9ncmVlZHlfZ2VzdHVyZXMgPT0gXCJncmVlZHlcIiB8fCB0aGlzLnNldHRpbmdzLndwZ216YV9mb3JjZV9ncmVlZHlfZ2VzdHVyZXMgPT0gXCJ5ZXNcIikpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ2VzdHVyZU92ZXJsYXkgPSAkKFwiPGRpdiBjbGFzcz0nd3BnbXphLWdlc3R1cmUtb3ZlcmxheSc+PC9kaXY+XCIpXHJcblx0XHRcdHRoaXMuZ2VzdHVyZU92ZXJsYXlUaW1lb3V0SUQgPSBudWxsO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoV1BHTVpBLmlzVG91Y2hEZXZpY2UoKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIE9uIHRvdWNoIGRldmljZXMsIHJlcXVpcmUgdHdvIGZpbmdlcnMgdG8gZHJhZyBhbmQgcGFuXHJcblx0XHRcdFx0Ly8gTkI6IFRlbXBvcmFyaWx5IHJlbW92ZWQgZHVlIHRvIGluY29uc2lzdGVudCBiZWhhdmlvdXJcclxuXHRcdFx0XHQvKnRoaXMub2xNYXAuZ2V0SW50ZXJhY3Rpb25zKCkuZm9yRWFjaChmdW5jdGlvbihpbnRlcmFjdGlvbikge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZihpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLkRyYWdQYW4pXHJcblx0XHRcdFx0XHRcdHNlbGYub2xNYXAucmVtb3ZlSW50ZXJhY3Rpb24oaW50ZXJhY3Rpb24pO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5vbE1hcC5hZGRJbnRlcmFjdGlvbihuZXcgb2wuaW50ZXJhY3Rpb24uRHJhZ1Bhbih7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNvbmRpdGlvbjogZnVuY3Rpb24ob2xCcm93c2VyRXZlbnQpIHtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHZhciBhbGxvd2VkID0gb2xCcm93c2VyRXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzLmxlbmd0aCA9PSAyO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYoIWFsbG93ZWQpXHJcblx0XHRcdFx0XHRcdFx0c2VsZi5zaG93R2VzdHVyZU92ZXJsYXkoKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHJldHVybiBhbGxvd2VkO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0fSkpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZ2VzdHVyZU92ZXJsYXkudGV4dChXUEdNWkEubG9jYWxpemVkX3N0cmluZ3MudXNlX3R3b19maW5nZXJzKTsqL1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIE9uIGRlc2t0b3BzLCByZXF1aXJlIEN0cmwgKyB6b29tIHRvIHpvb20sIHNob3cgYW4gb3ZlcmxheSBpZiB0aGF0IGNvbmRpdGlvbiBpcyBub3QgbWV0XHJcblx0XHRcdFx0dGhpcy5vbE1hcC5vbihcIndoZWVsXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKCFvbC5ldmVudHMuY29uZGl0aW9uLnBsYXRmb3JtTW9kaWZpZXJLZXlPbmx5KGV2ZW50KSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0c2VsZi5zaG93R2VzdHVyZU92ZXJsYXkoKTtcclxuXHRcdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmdlc3R1cmVPdmVybGF5LnRleHQoV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLnVzZV9jdHJsX3Njcm9sbF90b196b29tKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBDb250cm9sc1xyXG5cdFx0dGhpcy5vbE1hcC5nZXRDb250cm9scygpLmZvckVhY2goZnVuY3Rpb24oY29udHJvbCkge1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gTkI6IFRoZSB0cnVlIGFuZCBmYWxzZSB2YWx1ZXMgYXJlIGZsaXBwZWQgYmVjYXVzZSB0aGVzZSBzZXR0aW5ncyByZXByZXNlbnQgdGhlIFwiZGlzYWJsZWRcIiBzdGF0ZSB3aGVuIHRydWVcclxuXHRcdFx0aWYoY29udHJvbCBpbnN0YW5jZW9mIG9sLmNvbnRyb2wuWm9vbSAmJiBXUEdNWkEuc2V0dGluZ3Mud3BnbXphX3NldHRpbmdzX21hcF96b29tID09IFwieWVzXCIpXHJcblx0XHRcdFx0c2VsZi5vbE1hcC5yZW1vdmVDb250cm9sKGNvbnRyb2wpO1xyXG5cdFx0XHRcclxuXHRcdH0sIHRoaXMpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuc2V0dGluZ3Mud3BnbXphX3NldHRpbmdzX21hcF9mdWxsX3NjcmVlbl9jb250cm9sICE9IFwieWVzXCIpXHJcblx0XHRcdHRoaXMub2xNYXAuYWRkQ29udHJvbChuZXcgb2wuY29udHJvbC5GdWxsU2NyZWVuKCkpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHQvLyBNYXJrZXIgbGF5ZXJcclxuXHRcdFx0dGhpcy5tYXJrZXJMYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xyXG5cdFx0XHRcdHNvdXJjZTogbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe1xyXG5cdFx0XHRcdFx0ZmVhdHVyZXM6IFtdXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0fSk7XHJcblx0XHRcdHRoaXMub2xNYXAuYWRkTGF5ZXIodGhpcy5tYXJrZXJMYXllcik7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLm9sTWFwLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHR2YXIgZmVhdHVyZXMgPSBzZWxmLm9sTWFwLmdldEZlYXR1cmVzQXRQaXhlbChldmVudC5waXhlbCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoIWZlYXR1cmVzIHx8ICFmZWF0dXJlcy5sZW5ndGgpXHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dmFyIG1hcmtlciA9IGZlYXR1cmVzWzBdLndwZ216YU1hcmtlcjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZighbWFya2VyKVxyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG1hcmtlci50cmlnZ2VyKFwiY2xpY2tcIik7XHJcblx0XHRcdFx0bWFya2VyLnRyaWdnZXIoXCJzZWxlY3RcIik7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBMaXN0ZW4gZm9yIGRyYWcgc3RhcnRcclxuXHRcdHRoaXMub2xNYXAub24oXCJtb3Zlc3RhcnRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5pc0JlaW5nRHJhZ2dlZCA9IHRydWU7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Ly8gTGlzdGVuIGZvciBlbmQgb2YgcGFuIHNvIHdlIGNhbiB3cmFwIGxvbmdpdHVkZSBpZiBuZWVkcyBiZVxyXG5cdFx0dGhpcy5vbE1hcC5vbihcIm1vdmVlbmRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi53cmFwTG9uZ2l0dWRlKCk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLmlzQmVpbmdEcmFnZ2VkID0gZmFsc2U7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudChcImRyYWdlbmRcIik7XHJcblx0XHRcdHNlbGYub25JZGxlKCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Ly8gTGlzdGVuIGZvciB6b29tXHJcblx0XHR0aGlzLm9sTWFwLmdldFZpZXcoKS5vbihcImNoYW5nZTpyZXNvbHV0aW9uXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudChcInpvb21fY2hhbmdlZFwiKTtcclxuXHRcdFx0c2VsZi5kaXNwYXRjaEV2ZW50KFwiem9vbWNoYW5nZWRcIik7XHJcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0c2VsZi5vbklkbGUoKTtcclxuXHRcdFx0fSwgMTApO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIExpc3RlbiBmb3IgYm91bmRzIGNoYW5naW5nXHJcblx0XHR0aGlzLm9sTWFwLmdldFZpZXcoKS5vbihcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0Ly8gV3JhcCBsb25naXR1ZGVcclxuXHRcdFx0c2VsZi5vbkJvdW5kc0NoYW5nZWQoKTtcclxuXHRcdH0pO1xyXG5cdFx0c2VsZi5vbkJvdW5kc0NoYW5nZWQoKTtcclxuXHRcdFxyXG5cdFx0Ly8gU3RvcmUgbG9jYXRvciBjZW50ZXJcclxuXHRcdHZhciBtYXJrZXI7XHJcblx0XHRpZih0aGlzLnN0b3JlTG9jYXRvciAmJiAobWFya2VyID0gdGhpcy5zdG9yZUxvY2F0b3IuY2VudGVyUG9pbnRNYXJrZXIpKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLm9sTWFwLmFkZE92ZXJsYXkobWFya2VyLm92ZXJsYXkpO1xyXG5cdFx0XHRtYXJrZXIuc2V0VmlzaWJsZShmYWxzZSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFJpZ2h0IGNsaWNrIGxpc3RlbmVyXHJcblx0XHQkKHRoaXMuZWxlbWVudCkub24oXCJjbGljayBjb250ZXh0bWVudVwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGlzUmlnaHQ7XHJcblx0XHRcdGV2ZW50ID0gZXZlbnQgfHwgd2luZG93LmV2ZW50O1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGxhdExuZyA9IHNlbGYucGl4ZWxzVG9MYXRMbmcoZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WSk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihcIndoaWNoXCIgaW4gZXZlbnQpXHJcblx0XHRcdFx0aXNSaWdodCA9IGV2ZW50LndoaWNoID09IDM7XHJcblx0XHRcdGVsc2UgaWYoXCJidXR0b25cIiBpbiBldmVudClcclxuXHRcdFx0XHRpc1JpZ2h0ID0gZXZlbnQuYnV0dG9uID09IDI7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihldmVudC53aGljaCA9PSAxIHx8IGV2ZW50LmJ1dHRvbiA9PSAxKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYoc2VsZi5pc0JlaW5nRHJhZ2dlZClcclxuXHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBMZWZ0IGNsaWNrXHJcblx0XHRcdFx0aWYoJChldmVudC50YXJnZXQpLmNsb3Nlc3QoXCIub2wtbWFya2VyXCIpLmxlbmd0aClcclxuXHRcdFx0XHRcdHJldHVybjsgLy8gQSBtYXJrZXIgd2FzIGNsaWNrZWQsIG5vdCB0aGUgbWFwLiBEbyBub3RoaW5nXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c2VsZi50cmlnZ2VyKHtcclxuXHRcdFx0XHRcdHR5cGU6IFwiY2xpY2tcIixcclxuXHRcdFx0XHRcdGxhdExuZzogbGF0TG5nXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZighaXNSaWdodClcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gc2VsZi5vblJpZ2h0Q2xpY2soZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIERpc3BhdGNoIGV2ZW50XHJcblx0XHRpZighV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnRyaWdnZXIoXCJpbml0XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KFwiY3JlYXRlZFwiKTtcclxuXHRcdFx0V1BHTVpBLmV2ZW50cy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcIm1hcGNyZWF0ZWRcIiwgbWFwOiB0aGlzfSk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBMZWdhY3kgZXZlbnRcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLnRyaWdnZXIoXCJ3cGdvb2dsZW1hcHNfbG9hZGVkXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLlByb01hcDtcclxuXHRlbHNlXHJcblx0XHRQYXJlbnQgPSBXUEdNWkEuTWFwO1xyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBhcmVudC5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuT0xNYXA7XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5nZXRUaWxlTGF5ZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB7fTtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLnNldHRpbmdzLnRpbGVfc2VydmVyX3VybClcclxuXHRcdFx0b3B0aW9ucy51cmwgPSBXUEdNWkEuc2V0dGluZ3MudGlsZV9zZXJ2ZXJfdXJsO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmV3IG9sLmxheWVyLlRpbGUoe1xyXG5cdFx0XHRzb3VyY2U6IG5ldyBvbC5zb3VyY2UuT1NNKG9wdGlvbnMpXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS53cmFwTG9uZ2l0dWRlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciB0cmFuc2Zvcm1lZCA9IG9sLnByb2oudHJhbnNmb3JtKHRoaXMub2xNYXAuZ2V0VmlldygpLmdldENlbnRlcigpLCBcIkVQU0c6Mzg1N1wiLCBcIkVQU0c6NDMyNlwiKTtcclxuXHRcdHZhciBjZW50ZXIgPSB7XHJcblx0XHRcdGxhdDogdHJhbnNmb3JtZWRbMV0sXHJcblx0XHRcdGxuZzogdHJhbnNmb3JtZWRbMF1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGlmKGNlbnRlci5sbmcgPj0gLTE4MCAmJiBjZW50ZXIubG5nIDw9IDE4MClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRjZW50ZXIubG5nID0gY2VudGVyLmxuZyAtIDM2MCAqIE1hdGguZmxvb3IoY2VudGVyLmxuZyAvIDM2MCk7XHJcblx0XHRcclxuXHRcdGlmKGNlbnRlci5sbmcgPiAxODApXHJcblx0XHRcdGNlbnRlci5sbmcgLT0gMzYwO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldENlbnRlcihjZW50ZXIpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmdldENlbnRlciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgbG9uTGF0ID0gb2wucHJvai50b0xvbkxhdChcclxuXHRcdFx0dGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0Q2VudGVyKClcclxuXHRcdCk7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRsYXQ6IGxvbkxhdFsxXSxcclxuXHRcdFx0bG5nOiBsb25MYXRbMF1cclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuc2V0Q2VudGVyID0gZnVuY3Rpb24obGF0TG5nKVxyXG5cdHtcclxuXHRcdHZhciB2aWV3ID0gdGhpcy5vbE1hcC5nZXRWaWV3KCk7XHJcblx0XHRcclxuXHRcdFdQR01aQS5NYXAucHJvdG90eXBlLnNldENlbnRlci5jYWxsKHRoaXMsIGxhdExuZyk7XHJcblx0XHRcclxuXHRcdHZpZXcuc2V0Q2VudGVyKG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdGxhdExuZy5sbmcsXHJcblx0XHRcdGxhdExuZy5sYXRcclxuXHRcdF0pKTtcclxuXHRcdFxyXG5cdFx0dGhpcy53cmFwTG9uZ2l0dWRlKCk7XHJcblxyXG5cdFx0dGhpcy5vbkJvdW5kc0NoYW5nZWQoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5nZXRCb3VuZHMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGJvdW5kcyA9IHRoaXMub2xNYXAuZ2V0VmlldygpLmNhbGN1bGF0ZUV4dGVudCh0aGlzLm9sTWFwLmdldFNpemUoKSk7XHJcblx0XHR2YXIgbmF0aXZlQm91bmRzID0gbmV3IFdQR01aQS5MYXRMbmdCb3VuZHMoKTtcclxuXHRcdFxyXG5cdFx0dmFyIHRvcExlZnQgPSBvbC5wcm9qLnRvTG9uTGF0KFtib3VuZHNbMF0sIGJvdW5kc1sxXV0pO1xyXG5cdFx0dmFyIGJvdHRvbVJpZ2h0ID0gb2wucHJvai50b0xvbkxhdChbYm91bmRzWzJdLCBib3VuZHNbM11dKTtcclxuXHRcdFxyXG5cdFx0bmF0aXZlQm91bmRzLm5vcnRoID0gdG9wTGVmdFsxXTtcclxuXHRcdG5hdGl2ZUJvdW5kcy5zb3V0aCA9IGJvdHRvbVJpZ2h0WzFdO1xyXG5cdFx0XHJcblx0XHRuYXRpdmVCb3VuZHMud2VzdCA9IHRvcExlZnRbMF07XHJcblx0XHRuYXRpdmVCb3VuZHMuZWFzdCA9IGJvdHRvbVJpZ2h0WzBdO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmF0aXZlQm91bmRzO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBGaXQgdG8gZ2l2ZW4gYm91bmRhcmllc1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuZml0Qm91bmRzID0gZnVuY3Rpb24oc291dGhXZXN0LCBub3J0aEVhc3QpXHJcblx0e1xyXG5cdFx0aWYoc291dGhXZXN0IGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZylcclxuXHRcdFx0c291dGhXZXN0ID0ge2xhdDogc291dGhXZXN0LmxhdCwgbG5nOiBzb3V0aFdlc3QubG5nfTtcclxuXHRcdGlmKG5vcnRoRWFzdCBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHRcdG5vcnRoRWFzdCA9IHtsYXQ6IG5vcnRoRWFzdC5sYXQsIGxuZzogbm9ydGhFYXN0LmxuZ307XHJcblx0XHRlbHNlIGlmKHNvdXRoV2VzdCBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmdCb3VuZHMpXHJcblx0XHR7XHJcblx0XHRcdHZhciBib3VuZHMgPSBzb3V0aFdlc3Q7XHJcblx0XHRcdFxyXG5cdFx0XHRzb3V0aFdlc3QgPSB7XHJcblx0XHRcdFx0bGF0OiBib3VuZHMuc291dGgsXHJcblx0XHRcdFx0bG5nOiBib3VuZHMud2VzdFxyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0bm9ydGhFYXN0ID0ge1xyXG5cdFx0XHRcdGxhdDogYm91bmRzLm5vcnRoLFxyXG5cdFx0XHRcdGxuZzogYm91bmRzLmVhc3RcclxuXHRcdFx0fTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHZpZXcgPSB0aGlzLm9sTWFwLmdldFZpZXcoKTtcclxuXHRcdFxyXG5cdFx0dmFyIGV4dGVudCA9IG9sLmV4dGVudC5ib3VuZGluZ0V4dGVudChbXHJcblx0XHRcdG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdFx0cGFyc2VGbG9hdChzb3V0aFdlc3QubG5nKSxcclxuXHRcdFx0XHRwYXJzZUZsb2F0KHNvdXRoV2VzdC5sYXQpXHJcblx0XHRcdF0pLFxyXG5cdFx0XHRvbC5wcm9qLmZyb21Mb25MYXQoW1xyXG5cdFx0XHRcdHBhcnNlRmxvYXQobm9ydGhFYXN0LmxuZyksXHJcblx0XHRcdFx0cGFyc2VGbG9hdChub3J0aEVhc3QubGF0KVxyXG5cdFx0XHRdKVxyXG5cdFx0XSk7XHJcblx0XHR2aWV3LmZpdChleHRlbnQsIHRoaXMub2xNYXAuZ2V0U2l6ZSgpKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5wYW5UbyA9IGZ1bmN0aW9uKGxhdExuZywgem9vbSlcclxuXHR7XHJcblx0XHR2YXIgdmlldyA9IHRoaXMub2xNYXAuZ2V0VmlldygpO1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB7XHJcblx0XHRcdGNlbnRlcjogb2wucHJvai5mcm9tTG9uTGF0KFtcclxuXHRcdFx0XHRwYXJzZUZsb2F0KGxhdExuZy5sbmcpLFxyXG5cdFx0XHRcdHBhcnNlRmxvYXQobGF0TG5nLmxhdCksXHJcblx0XHRcdF0pLFxyXG5cdFx0XHRkdXJhdGlvbjogNTAwXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID4gMSlcclxuXHRcdFx0b3B0aW9ucy56b29tID0gcGFyc2VJbnQoem9vbSk7XHJcblx0XHRcclxuXHRcdHZpZXcuYW5pbWF0ZShvcHRpb25zKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5nZXRab29tID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiBNYXRoLnJvdW5kKCB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRab29tKCkgKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5zZXRab29tID0gZnVuY3Rpb24odmFsdWUpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC5nZXRWaWV3KCkuc2V0Wm9vbSh2YWx1ZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuZ2V0TWluWm9vbSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5vbE1hcC5nZXRWaWV3KCkuZ2V0TWluWm9vbSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLnNldE1pblpvb20gPSBmdW5jdGlvbih2YWx1ZSlcclxuXHR7XHJcblx0XHR0aGlzLm9sTWFwLmdldFZpZXcoKS5zZXRNaW5ab29tKHZhbHVlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5nZXRNYXhab29tID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLm9sTWFwLmdldFZpZXcoKS5nZXRNYXhab29tKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuc2V0TWF4Wm9vbSA9IGZ1bmN0aW9uKHZhbHVlKVxyXG5cdHtcclxuXHRcdHRoaXMub2xNYXAuZ2V0VmlldygpLnNldE1heFpvb20odmFsdWUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuc2V0T3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHRpZighdGhpcy5vbE1hcClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sTWFwLmdldFZpZXcoKS5zZXRQcm9wZXJ0aWVzKCB0aGlzLnNldHRpbmdzLnRvT0xWaWV3T3B0aW9ucygpICk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFRPRE86IENvbnNpZGVyIG1vdmluZyBhbGwgdGhlc2UgZnVuY3Rpb25zIHRvIHRoZWlyIHJlc3BlY3RpdmUgY2xhc3Nlcywgc2FtZSBvbiBnb29nbGUgbWFwIChETyBJVCEhISBJdCdzIHZlcnkgbWlzbGVhZGluZyBoYXZpbmcgdGhlbSBoZXJlKVxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuYWRkTWFya2VyID0gZnVuY3Rpb24obWFya2VyKVxyXG5cdHtcclxuXHRcdGlmKFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9IVE1MX0VMRU1FTlQpXHJcblx0XHRcdHRoaXMub2xNYXAuYWRkT3ZlcmxheShtYXJrZXIub3ZlcmxheSk7XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubWFya2VyTGF5ZXIuZ2V0U291cmNlKCkuYWRkRmVhdHVyZShtYXJrZXIuZmVhdHVyZSk7XHJcblx0XHRcdG1hcmtlci5mZWF0dXJlSW5Tb3VyY2UgPSB0cnVlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLmFkZE1hcmtlci5jYWxsKHRoaXMsIG1hcmtlcik7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUucmVtb3ZlTWFya2VyID0gZnVuY3Rpb24obWFya2VyKVxyXG5cdHtcclxuXHRcdGlmKFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9IVE1MX0VMRU1FTlQpXHJcblx0XHRcdHRoaXMub2xNYXAucmVtb3ZlT3ZlcmxheShtYXJrZXIub3ZlcmxheSk7XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubWFya2VyTGF5ZXIuZ2V0U291cmNlKCkucmVtb3ZlRmVhdHVyZShtYXJrZXIuZmVhdHVyZSk7XHJcblx0XHRcdG1hcmtlci5mZWF0dXJlSW5Tb3VyY2UgPSBmYWxzZTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5yZW1vdmVNYXJrZXIuY2FsbCh0aGlzLCBtYXJrZXIpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmFkZFBvbHlnb24gPSBmdW5jdGlvbihwb2x5Z29uKVxyXG5cdHtcclxuXHRcdHRoaXMub2xNYXAuYWRkTGF5ZXIocG9seWdvbi5sYXllcik7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkUG9seWdvbi5jYWxsKHRoaXMsIHBvbHlnb24pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLnJlbW92ZVBvbHlnb24gPSBmdW5jdGlvbihwb2x5Z29uKVxyXG5cdHtcclxuXHRcdHRoaXMub2xNYXAucmVtb3ZlTGF5ZXIocG9seWdvbi5sYXllcik7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUucmVtb3ZlUG9seWdvbi5jYWxsKHRoaXMsIHBvbHlnb24pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmFkZFBvbHlsaW5lID0gZnVuY3Rpb24ocG9seWxpbmUpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC5hZGRMYXllcihwb2x5bGluZS5sYXllcik7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkUG9seWxpbmUuY2FsbCh0aGlzLCBwb2x5bGluZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUucmVtb3ZlUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHR0aGlzLm9sTWFwLnJlbW92ZUxheWVyKHBvbHlsaW5lLmxheWVyKTtcclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5yZW1vdmVQb2x5bGluZS5jYWxsKHRoaXMsIHBvbHlsaW5lKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5hZGRDaXJjbGUgPSBmdW5jdGlvbihjaXJjbGUpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC5hZGRMYXllcihjaXJjbGUubGF5ZXIpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLmFkZENpcmNsZS5jYWxsKHRoaXMsIGNpcmNsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUucmVtb3ZlQ2lyY2xlID0gZnVuY3Rpb24oY2lyY2xlKVxyXG5cdHtcclxuXHRcdHRoaXMub2xNYXAucmVtb3ZlTGF5ZXIoY2lyY2xlLmxheWVyKTtcclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5yZW1vdmVDaXJjbGUuY2FsbCh0aGlzLCBjaXJjbGUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmFkZFJlY3RhbmdsZSA9IGZ1bmN0aW9uKHJlY3RhbmdsZSlcclxuXHR7XHJcblx0XHR0aGlzLm9sTWFwLmFkZExheWVyKHJlY3RhbmdsZS5sYXllcik7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkUmVjdGFuZ2xlLmNhbGwodGhpcywgcmVjdGFuZ2xlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5yZW1vdmVSZWN0YW5nbGUgPSBmdW5jdGlvbihyZWN0YW5nbGUpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC5yZW1vdmVMYXllcihyZWN0YW5nbGUubGF5ZXIpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnJlbW92ZVJlY3RhbmdsZS5jYWxsKHRoaXMsIHJlY3RhbmdsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUucGl4ZWxzVG9MYXRMbmcgPSBmdW5jdGlvbih4LCB5KVxyXG5cdHtcclxuXHRcdGlmKHkgPT0gdW5kZWZpbmVkKVxyXG5cdFx0e1xyXG5cdFx0XHRpZihcInhcIiBpbiB4ICYmIFwieVwiIGluIHgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR5ID0geC55O1xyXG5cdFx0XHRcdHggPSB4Lng7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnNvbGUud2FybihcIlkgY29vcmRpbmF0ZSB1bmRlZmluZWQgaW4gcGl4ZWxzVG9MYXRMbmcgKGRpZCB5b3UgbWVhbiB0byBwYXNzIDIgYXJndW1lbnRzPylcIik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBjb29yZCA9IHRoaXMub2xNYXAuZ2V0Q29vcmRpbmF0ZUZyb21QaXhlbChbeCwgeV0pO1xyXG5cdFx0XHJcblx0XHRpZighY29vcmQpXHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0eDogbnVsbCxcclxuXHRcdFx0XHR5OiBudWxsXHJcblx0XHRcdH07XHJcblx0XHRcclxuXHRcdHZhciBsb25MYXQgPSBvbC5wcm9qLnRvTG9uTGF0KGNvb3JkKTtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGxhdDogbG9uTGF0WzFdLFxyXG5cdFx0XHRsbmc6IGxvbkxhdFswXVxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5sYXRMbmdUb1BpeGVscyA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHR2YXIgY29vcmQgPSBvbC5wcm9qLmZyb21Mb25MYXQoW2xhdExuZy5sbmcsIGxhdExuZy5sYXRdKTtcclxuXHRcdHZhciBwaXhlbCA9IHRoaXMub2xNYXAuZ2V0UGl4ZWxGcm9tQ29vcmRpbmF0ZShjb29yZCk7XHJcblx0XHRcclxuXHRcdGlmKCFwaXhlbClcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR4OiBudWxsLFxyXG5cdFx0XHRcdHk6IG51bGxcclxuXHRcdFx0fTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogcGl4ZWxbMF0sXHJcblx0XHRcdHk6IHBpeGVsWzFdXHJcblx0XHR9O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmVuYWJsZUJpY3ljbGVMYXllciA9IGZ1bmN0aW9uKHZhbHVlKVxyXG5cdHtcclxuXHRcdGlmKHZhbHVlKVxyXG5cdFx0e1xyXG5cdFx0XHRpZighdGhpcy5iaWN5Y2xlTGF5ZXIpXHJcblx0XHRcdFx0dGhpcy5iaWN5Y2xlTGF5ZXIgPSBuZXcgb2wubGF5ZXIuVGlsZSh7XHJcblx0XHRcdFx0XHRzb3VyY2U6IG5ldyBvbC5zb3VyY2UuT1NNKHtcclxuXHRcdFx0XHRcdFx0dXJsOiBcImh0dHA6Ly97YS1jfS50aWxlLm9wZW5jeWNsZW1hcC5vcmcvY3ljbGUve3p9L3t4fS97eX0ucG5nXCJcclxuXHRcdFx0XHRcdH0pXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdHRoaXMub2xNYXAuYWRkTGF5ZXIodGhpcy5iaWN5Y2xlTGF5ZXIpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHRpZighdGhpcy5iaWN5Y2xlTGF5ZXIpXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5vbE1hcC5yZW1vdmVMYXllcih0aGlzLmJpY3ljbGVMYXllcik7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUuc2hvd0dlc3R1cmVPdmVybGF5ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuZ2VzdHVyZU92ZXJsYXlUaW1lb3V0SUQpO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZ2VzdHVyZU92ZXJsYXkpLnN0b3AoKS5hbmltYXRlKHtvcGFjaXR5OiBcIjEwMFwifSk7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuYXBwZW5kKHRoaXMuZ2VzdHVyZU92ZXJsYXkpO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZ2VzdHVyZU92ZXJsYXkpLmNzcyh7XHJcblx0XHRcdFwibGluZS1oZWlnaHRcIjpcdCQodGhpcy5lbGVtZW50KS5oZWlnaHQoKSArIFwicHhcIixcclxuXHRcdFx0XCJvcGFjaXR5XCI6XHRcdFwiMS4wXCJcclxuXHRcdH0pO1xyXG5cdFx0JCh0aGlzLmdlc3R1cmVPdmVybGF5KS5zaG93KCk7XHJcblx0XHRcclxuXHRcdHRoaXMuZ2VzdHVyZU92ZXJsYXlUaW1lb3V0SUQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRzZWxmLmdlc3R1cmVPdmVybGF5LmZhZGVPdXQoMjAwMCk7XHJcblx0XHR9LCAyMDAwKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFwLnByb3RvdHlwZS5vbkVsZW1lbnRSZXNpemVkID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dGhpcy5vbE1hcC51cGRhdGVTaXplKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcC5wcm90b3R5cGUub25SaWdodENsaWNrID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0aWYoJChldmVudC50YXJnZXQpLmNsb3Nlc3QoXCIub2wtbWFya2VyLCAud3BnbXphX21vZGVybl9pbmZvd2luZG93LCAud3BnbXphLW1vZGVybi1zdG9yZS1sb2NhdG9yXCIpLmxlbmd0aClcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcclxuXHRcdHZhciBwYXJlbnRPZmZzZXQgPSAkKHRoaXMuZWxlbWVudCkub2Zmc2V0KCk7XHJcblx0XHR2YXIgcmVsWCA9IGV2ZW50LnBhZ2VYIC0gcGFyZW50T2Zmc2V0LmxlZnQ7XHJcblx0XHR2YXIgcmVsWSA9IGV2ZW50LnBhZ2VZIC0gcGFyZW50T2Zmc2V0LnRvcDtcclxuXHRcdHZhciBsYXRMbmcgPSB0aGlzLnBpeGVsc1RvTGF0TG5nKHJlbFgsIHJlbFkpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnRyaWdnZXIoe3R5cGU6IFwicmlnaHRjbGlja1wiLCBsYXRMbmc6IGxhdExuZ30pO1xyXG5cdFx0XHJcblx0XHQvLyBMZWdhY3kgZXZlbnQgY29tcGF0aWJpbGl0eVxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLnRyaWdnZXIoe3R5cGU6IFwicmlnaHRjbGlja1wiLCBsYXRMbmc6IGxhdExuZ30pO1xyXG5cdFx0XHJcblx0XHQvLyBQcmV2ZW50IG1lbnVcclxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHRXUEdNWkEuT0xNYXAucHJvdG90eXBlLmVuYWJsZUFsbEludGVyYWN0aW9ucyA9IGZ1bmN0aW9uKClcclxuXHR7XHRcclxuXHJcblx0XHR0aGlzLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24oaW50ZXJhY3Rpb24pIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGludGVyYWN0aW9uIGluc3RhbmNlb2Ygb2wuaW50ZXJhY3Rpb24uRHJhZ1BhbiB8fCBpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLkRvdWJsZUNsaWNrWm9vbSB8fCBpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLk1vdXNlV2hlZWxab29tKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aW50ZXJhY3Rpb24uc2V0QWN0aXZlKHRydWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fSwgdGhpcyk7XHJcblxyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1tYXAuanMifQ==
