(function($) {
	
	var parentConstructor;
	
	WPGMZA.OSMMarker = function(row)
	{
		var self = this;
		
		parentConstructor.call(this, row);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		this.feature = new ol.Feature({
			geometry: new ol.geom.Point(origin)
		});
		
		var iconStyle = new ol.style.Style({
			image: new ol.style.Icon({
				anchor: [0.5, 1],
				anchorXUnits: "fraction",
				anchorYUnits: "fraction",
				opacity: 1,
				src: this.getIcon()
			})
		});
		
		this.feature.setStyle(iconStyle);
		
		this.vectorSource = new ol.source.Vector({
			features: [this.feature]
		});
		
		this.vectorLayer = new ol.layer.Vector({
			source: this.vectorSource
		});
	}
	
	if(WPGMZA.isProVersion())
		parentConstructor = WPGMZA.ProMarker;
	else
		parentConstructor = WPGMZA.Marker;
	WPGMZA.OSMMarker.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.OSMMarker.prototype.constructor = WPGMZA.OSMMarker;
	
	WPGMZA.OSMMarker.prototype.setVisible = function(visible)
	{
		this.vectorLayer.setVisible(visible);
	}
	
	WPGMZA.OSMMarker.prototype.setPosition = function(latLng)
	{
		parentConstructor.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		this.feature.setGeometry(new ol.geom.Point(origin));
	}
	
})(jQuery);