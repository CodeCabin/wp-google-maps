(function($) {
	
	var parentConstructor;
	
	WPGMZA.OSMStoreLocator = function(map)
	{
		parentConstructor.call(this, map);
	}
	
	parentConstructor = (WPGMZA.isProVersion() ? WPGMZA.ProStoreLocator : WPGMZA.StoreLocator);
	
	WPGMZA.OSMStoreLocator.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.OSMStoreLocator.prototype.constructor = WPGMZA.OSMStoreLocator;
	
	/**
	 * Displays the search radius at the given latLng, or hides it if latLng is null
	 * @return void
	 */
	WPGMZA.OSMStoreLocator.prototype.showCircle = function(latLng)
	{
		var radius = ol.proj.METERS_PER_UNIT.m * this.getRadiusInMeters();

		if(this.circleLayer)
			this.map.osmMap.removeLayer(this.circleLayer);
		
		if(!latLng)
			return;
			
		this.circleLayer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [
					new ol.Feature({
						geometry: new ol.geom.Circle(
							ol.proj.fromLonLat([
								parseFloat(latLng.lng),
								parseFloat(latLng.lat)
							]),
							radius
						)
					})
				]
			}),
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: [255, 0, 0, 1],
					width: 2
				}),
				fill: new ol.style.Fill({
					color: [255, 0, 0, 0.25]
				})
			})
		});
		
		this.map.osmMap.addLayer(this.circleLayer);
	}
	
	/**
	 * Shows/hides a marker at the center point of the search radius
	 * @return void
	 */
	WPGMZA.OSMStoreLocator.prototype.showCenterMarker = function(latLng)
	{
		WPGMZA.StoreLocator.prototype.showCenterMarker.call(this, latLng);
		
		if(latLng)
			this.map.osmMap.addOverlay(this.centerMarker.overlay);
		else if(this.map.osmMap)
			this.map.osmMap.removeOverlay(this.centerMarker.overlay);
	}
	
})(jQuery);