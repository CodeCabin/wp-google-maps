/**
 * @namespace WPGMZA
 * @module OSMCircle
 * @requires WPGMZA.Circle
 */
(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.OSMCircle = function(options, osmFeature)
	{
		var self = this;
		
		this.center = {lat: 0, lng: 0};
		this.radius = 0;
		
		Parent.call(this, options, osmFeature);
		
		if(!this.settings.fillColor)
		{
			this.settings.fillColor = "#ff0000";
			this.settings.fillOpacity = 0.6;
		}
		
		this.osmStyle = new ol.style.Style(this.getStyleFromSettings());
		
		// IMPORTANT: Please note that due to what appears to be a bug in OpenLayers, the following code MUST be exected specifically in this order, or the circle won't appear
		var vectorLayer3857 = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: this.osmStyle
		});
		
		if(osmFeature)
		{
			this.osmFeature = osmFeature;
		}
		else
		{
			var wgs84Sphere = new ol.Sphere(6378137);
			var radius = this.radius;
			var x, y;
			
			x = this.center.lng;
			y = this.center.lat;
			
			var circle4326 = ol.geom.Polygon.circular(wgs84Sphere, [x, y], radius, 64);
			var circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
			
			vectorLayer3857.getSource().addFeature(new ol.Feature(circle3857));
		}
		
		this.layer = vectorLayer3857;
		
		options.map.osmMap.addLayer(vectorLayer3857);
	}
	
	WPGMZA.OSMCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMCircle.prototype.constructor = WPGMZA.OSMCircle;
	
	WPGMZA.OSMCircle.prototype.getStyleFromSettings = function()
	{
		var params = {};
				
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
			});
		
		if(this.settings.fillOpacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(this.settings.fillColor, this.settings.fillOpacity)
			});
			
		return params;
	}
	
	WPGMZA.OSMCircle.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.osmStyle = new ol.style.Style(params);
		this.layer.setStyle(this.osmStyle);
	}
	
})(jQuery);