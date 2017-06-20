(function($) {
	
	var parentConstructor;
	
	WPGMZA.OSMMap = function(element)
	{
		var self = this;
		
		parentConstructor.call(this, element);
		
		var viewOptions = this.settings.toOSMViewOptions();
		
		this.osmMap = new ol.Map({
			target: $(element).find(".wpgmza-engine-map")[0],
			layers: [
				new ol.layer.Tile({
					source: new ol.source.OSM()
				})
			],
			view: new ol.View(viewOptions)
		});
		
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
		
		// Click event
		/*this.osmMap.on("click", function(event) {
			var feature;
			self.osmMap.forEachFeatureAtPixel(event.pixel, function(target) {
				feature = target;
			});
			if(feature)
				feature.wpgmzaObject.dispatchEvent("click");
			else
				this.dispatchEvent("click");
		});*/
		
		// Listen for bounds changing
		this.osmMap.getView().on("change", function() {
			self.onBoundsChanged();
		});
		self.onBoundsChanged();
	}

	if(WPGMZA.isProVersion())
		parentConstructor = WPGMZA.ProMap;
	else
		parentConstructor = WPGMZA.Map;
	
	WPGMZA.OSMMap.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.OSMMap.prototype.constructor = WPGMZA.OSMMap;
	
	WPGMZA.OSMMap.prototype.createMarkerInstance = function(row)
	{
		return new WPGMZA.OSMMarker(row);
	}
	
	WPGMZA.OSMMap.prototype.createPolygonInstance = function(row, osmPolygon)
	{
		return new WPGMZA.OSMPolygon(row, osmPolygon);
	}
	
	WPGMZA.OSMMap.prototype.createPolylineInstance = function(row, osmPolyline)
	{
		return new WPGMZA.OSMPolyline(row, osmPolyline);
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
		view.setCenter(ol.proj.fromLonLat([
			latLng.lng,
			latLng.lat
		]));
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
		// this.osmMap.addLayer(marker.layer);
		this.osmMap.addOverlay(marker.overlay);
		
		parentConstructor.prototype.addMarker.call(this, marker);
	}
	
	WPGMZA.OSMMap.prototype.deleteMarker = function(marker)
	{
		this.osmMap.removeOverlay(marker.overlay);
		
		parentConstructor.prototype.deleteMarker.call(this, marker);
	}
	
	WPGMZA.OSMMap.prototype.addPolygon = function(polygon)
	{
		this.osmMap.addLayer(polygon.layer);
		
		parentConstructor.prototype.addPolygon.call(this, polygon);
	}
	
	WPGMZA.OSMMap.prototype.deletePolygon = function(polygon)
	{
		this.osmMap.removeLayer(polygon.layer);
		
		parentConstructor.prototype.deletePolygon.call(this, polygon);
	}
	
	WPGMZA.OSMMap.prototype.addPolyline = function(polyline)
	{
		this.osmMap.addLayer(polyline.layer);
		
		parentConstructor.prototype.addPolyline.call(this, polyline);
	}
	
	WPGMZA.OSMMap.prototype.deletePolyline = function(polyline)
	{
		this.osmMap.removeLayer(polyline.layer);
		
		parentConstructor.prototype.deletePolyline.call(this, polyline);
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
	
})(jQuery);