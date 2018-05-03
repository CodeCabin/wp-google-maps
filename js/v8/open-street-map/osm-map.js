/**
 * @namespace WPGMZA
 * @module OSMMap
 * @requires WPGMZA.Map
 * @pro-requires WPGMZA.ProMap
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMMap = function(element)
	{
		var self = this;
		
		Parent.call(this, element);
		
		var viewOptions = this.settings.toOSMViewOptions();
		
		$(this.element).html("");
		
		this.osmMap = new ol.Map({
			target: $(element)[0],
			layers: [
				new ol.layer.Tile({
					source: new ol.source.OSM()
				})
			],
			view: new ol.View(viewOptions)
		});
		
		// Put grid inside map
		$(this.engineElement).append($(this.element).find(".wpgmza-in-map-grid"));
		
		// Interactions
		this.osmMap.getInteractions().forEach(function(interaction) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive( (this.settings.map_draggable ? false : true) );
			else if(interaction instanceof ol.interaction.DoubleClickZoom)
				interaction.setActive( (this.settings.map_clickzoom ? false : true) );
			else if(interaction instanceof ol.interaction.MouseWheelZoom)
				interaction.setActive( (this.settings.map_scroll ? false : true) );
			
		}, this);
		
		// Controls
		this.osmMap.getControls().forEach(function(control) {
			
			// NB: The true and false values are flipped because these settings represent the "disabled" state when true
			if(control instanceof ol.control.Zoom && this.settings.map_zoom)
				this.osmMap.removeControl(control);
			
		}, this);
		
		if(!this.settings.map_full_screen_control)
			this.osmMap.addControl(new ol.control.FullScreen());
		
		// Marker layer
		this.markerLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: []
			})
		});
		this.osmMap.addLayer(this.markerLayer);
		
		// Listen for end of pan so we can wrap longitude if needs be
		this.osmMap.on("moveend", function(event) {
			self.wrapLongitude();
			self.dispatchEvent("dragend");
			self.onIdle();
		});
		
		// Listen for zoom
		this.osmMap.getView().on("change:resolution", function(event) {
			self.dispatchEvent("zoomchanged");
			self.onIdle();
		});
		
		// Listen for bounds changing
		this.osmMap.getView().on("change", function() {
			// Wrap longitude
			self.onBoundsChanged();
		});
		self.onBoundsChanged();
		
		// Store locator center
		var marker;
		if(this.storeLocator && (marker = this.storeLocator.centerPointMarker))
		{
			this.osmMap.addOverlay(marker.overlay);
			marker.setVisible(false);
		}
		
		// Dispatch event
		if(!WPGMZA.isProVersion())
		{
			this.dispatchEvent("created");
			WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
		}
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMap;
	else
		Parent = WPGMZA.Map;
	
	WPGMZA.OSMMap.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMMap.prototype.constructor = WPGMZA.OSMMap;
	
	WPGMZA.OSMMap.prototype.wrapLongitude = function()
	{
		var center = this.getCenter();
		
		if(center.lng >= -180 && center.lng <= 180)
			return;
		
		center.lng = center.lng - 360 * Math.floor(center.lng / 360);
		
		if(center.lng > 180)
			center.lng -= 360;
		
		this.setCenter(center);
	}
	
	WPGMZA.OSMMap.prototype.getCenter = function()
	{
		var lonLat = ol.proj.toLonLat(
			this.osmMap.getView().getCenter()
		);
		return {
			lat: lonLat[1],
			lng: lonLat[0]
		};
	}
	
	WPGMZA.OSMMap.prototype.setCenter = function(latLng)
	{
		var view = this.osmMap.getView();
		
		WPGMZA.Map.prototype.setCenter.call(this, latLng);
		
		view.setCenter(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
		
		this.wrapLongitude();

		this.onBoundsChanged();
	}
	
	WPGMZA.OSMMap.prototype.getBounds = function()
	{
		var bounds = this.osmMap.getView().calculateExtent(this.osmMap.getSize());
		
		var topLeft = ol.proj.toLonLat([bounds[0], bounds[1]]);
		var bottomRight = ol.proj.toLonLat([bounds[2], bounds[3]]);
		
		return {
			topLeft: {
				lat: topLeft[1],
				lng: topLeft[0]
			},
			bottomRight: {
				lat: bottomRight[1],
				lng: bottomRight[0]
			}
		};
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	WPGMZA.OSMMap.prototype.fitBounds = function(southWest, northEast)
	{
		this.osmMap.getView().fitExtent(
			[southWest.lng, southWest.lat, northEast.lng, northEast.lat],
			this.osmMap.getSize()
		);
	}
	
	WPGMZA.OSMMap.prototype.panTo = function(latLng)
	{
		var view = this.osmMap.getView();
		view.animate({
			center: ol.proj.fromLonLat([
				parseFloat(latLng.lng),
				parseFloat(latLng.lat),
			]),
			duration: 500
		});
	}
	
	WPGMZA.OSMMap.prototype.getZoom = function()
	{
		return this.osmMap.getView().getZoom();
	}
	
	WPGMZA.OSMMap.prototype.setZoom = function(value)
	{
		this.osmMap.getView().setZoom(value);
	}
	
	WPGMZA.OSMMap.prototype.getMinZoom = function()
	{
		return this.osmMap.getView().getMinZoom();
	}
	
	WPGMZA.OSMMap.prototype.setMinZoom = function(value)
	{
		this.osmMap.getView().setMinZoom(value);
	}
	
	WPGMZA.OSMMap.prototype.getMaxZoom = function()
	{
		return this.osmMap.getView().getMaxZoom();
	}
	
	WPGMZA.OSMMap.prototype.setMaxZoom = function(value)
	{
		this.osmMap.getView().setMaxZoom(value);
	}
	
	/**
	 * TODO: Consider moving all these functions to their respective classes, same on google map (DO IT!!! It's very misleading having them here)
	 */
	WPGMZA.OSMMap.prototype.addMarker = function(marker)
	{
		this.osmMap.addOverlay(marker.overlay);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	WPGMZA.OSMMap.prototype.deleteMarker = function(marker)
	{
		this.osmMap.removeOverlay(marker.overlay);
		
		Parent.prototype.deleteMarker.call(this, marker);
	}
	
	WPGMZA.OSMMap.prototype.addPolygon = function(polygon)
	{
		this.osmMap.addLayer(polygon.layer);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	WPGMZA.OSMMap.prototype.deletePolygon = function(polygon)
	{
		this.osmMap.removeLayer(polygon.layer);
		
		Parent.prototype.deletePolygon.call(this, polygon);
	}
	
	WPGMZA.OSMMap.prototype.addPolyline = function(polyline)
	{
		this.osmMap.addLayer(polyline.layer);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	WPGMZA.OSMMap.prototype.deletePolyline = function(polyline)
	{
		this.osmMap.removeLayer(polyline.layer);
		
		Parent.prototype.deletePolyline.call(this, polyline);
	}
	
	WPGMZA.OSMMap.prototype.getFetchParameters = function()
	{
		var result = WPGMZA.Map.prototype.getFetchParameters.call(this);
		
		var bounds = this.osmMap.getView().calculateExtent(this.osmMap.getSize());
		
		var topLeft = ol.proj.toLonLat([bounds[0], bounds[1]]);
		var bottomRight = ol.proj.toLonLat([bounds[2], bounds[3]]);
		
		result.bounds = topLeft[1] + "," + topLeft[0] + "," + bottomRight[1] + "," + bottomRight[0];
		
		return result;
	}
	
	WPGMZA.OSMMap.prototype.pixelsToLatLng = function(x, y)
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
		
		var coord = this.osmMap.getCoordinateFromPixel([x, y]);
		
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
	
	WPGMZA.OSMMap.prototype.latLngToPixels = function(latLng)
	{
		var coord = ol.proj.fromLonLat([latLng.lng, latLng.lat]);
		var pixel = this.osmMap.getPixelFromCoordinate(coord);
		
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
	
	WPGMZA.OSMMap.prototype.enableBicycleLayer = function(value)
	{
		if(value)
		{
			if(!this.bicycleLayer)
				this.bicycleLayer = new ol.layer.Tile({
					source: new ol.source.OSM({
						url: "http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
					})
				});
				
			this.osmMap.addLayer(this.bicycleLayer);
		}
		else
		{
			if(!this.bicycleLayer)
				return;
			
			this.osmMap.removeLayer(this.bicycleLayer);
		}
	}
	
	WPGMZA.OSMMap.prototype.onElementResized = function(event)
	{
		this.osmMap.updateSize();
	}
	
})(jQuery);