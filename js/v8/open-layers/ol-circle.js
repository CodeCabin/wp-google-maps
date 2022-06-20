/**
 * @namespace WPGMZA
 * @module OLCircle
 * @requires WPGMZA.Circle
 * @pro-requires WPGMZA.ProCircle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.OLCircle = function(options, olFeature)
	{
		var self = this, geom;
		
		Parent.call(this, options, olFeature);
		
		if(!options)
			options = {};
		
		if(olFeature)
		{
			var circle = olFeature.getGeometry();
			var center = ol.proj.toLonLat(circle.getCenter());
			
			geom = circle;
			
			options.center = new WPGMZA.LatLng(
				center[1],
				center[0]
			);
			options.radius = circle.getRadius() / 1000;
		}
		else
		{
			geom = new ol.geom.Circle(
				ol.proj.fromLonLat([
					parseFloat(options.center.lng),
					parseFloat(options.center.lat)
				]),
				options.radius * 1000
			);
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector()
		});
		
		this.olFeature = new ol.Feature({
			geometry: geom
		});

		this.layer.getSource().addFeature(this.olFeature);
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaCircle: this,
			wpgmzaFeature: this
		});
		
		if(options)
			this.setOptions(options);
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProCircle;
	
	WPGMZA.OLCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.OLCircle.prototype.constructor = WPGMZA.OLCircle;
	
	WPGMZA.OLCircle.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
	WPGMZA.OLCircle.prototype.getCenter = function()
	{
		var lonLat = ol.proj.toLonLat(this.olFeature.getGeometry().getCenter());
			
		return new WPGMZA.LatLng({
			lat: lonLat[1],
			lng: lonLat[0]
		});
	}

	WPGMZA.OLCircle.prototype.recreate = function()
	{
		if(this.olFeature)
		{
			this.layer.getSource().removeFeature(this.olFeature);
			delete this.olFeature;
		}
		
		if(!this.center || !this.radius)
			return;
		
		// IMPORTANT: Please note that due to what appears to be a bug in OpenLayers, the following code MUST be exected specifically in this order, or the circle won't appear
		var radius = parseFloat(this.radius) * 1000;
		var x, y;
		
		x = this.center.lng;
		y = this.center.lat;
		
		var circle4326 = ol.geom.Polygon.circular([x, y], radius, 64);
		var circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
		
		this.olFeature = new ol.Feature(circle3857);
		
		this.layer.getSource().addFeature(this.olFeature);
	}

	WPGMZA.OLCircle.prototype.setVisible = function(visible)
	{
		this.layer.setVisible(visible ? true : false);
	}
	
	WPGMZA.OLCircle.prototype.setCenter = function(center)
	{
		WPGMZA.Circle.prototype.setCenter.apply(this, arguments);
		
		this.recreate();
	}
	
	WPGMZA.OLCircle.prototype.getRadius = function()
	{
		var geom = this.layer.getSource().getFeatures()[0].getGeometry();
		return geom.getRadius() / 1000; // Meters to kilometers
	}
	
	WPGMZA.OLCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
	}
	
	WPGMZA.OLCircle.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
});