/**
 * @namespace WPGMZA
 * @module OLCircle
 * @requires WPGMZA.Circle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.OLCircle = function(options, olFeature)
	{
		var self = this;
		
		this.center = {lat: 0, lng: 0};
		this.radius = 0;
		
		Parent.call(this, options, olFeature);
		
		if(!this.settings.fillColor)
		{
			this.settings.fillColor = "#ff0000";
			this.settings.fillOpacity = 0.6;
		}
		
		if(options.fillColor)
			this.settings.fillColor = options.fillColor;
		if(options.fillOpacity)
			this.settings.fillOpacity = options.fillOpacity;
		
		this.olStyle = new ol.style.Style(this.getStyleFromSettings());
		
		// IMPORTANT: Please note that due to what appears to be a bug in OpenLayers, the following code MUST be exected specifically in this order, or the circle won't appear
		var vectorLayer3857 = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: this.olStyle
		});
		
		if(olFeature)
		{
			this.olFeature = olFeature;
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
		
		options.map.olMap.addLayer(vectorLayer3857);
	}
	
	WPGMZA.OLCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.OLCircle.prototype.constructor = WPGMZA.OLCircle;
	
	WPGMZA.OLCircle.prototype.getStyleFromSettings = function()
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
	
	WPGMZA.OLCircle.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
});