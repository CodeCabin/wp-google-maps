/**
 * @namespace WPGMZA
 * @module OLRectangle
 * @requires WPGMZA.Rectangle
 * @pro-requires WPGMZA.ProRectangle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Rectangle;

	
	WPGMZA.OLRectangle = function(options, olFeature)
	{
		var self = this;
		
		Parent.apply(this, arguments);
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [[]];
			
			if(options.cornerA && options.cornerB)
			{
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerA.lng),
					parseFloat(options.cornerA.lat)
				]));
				
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerB.lng),
					parseFloat(options.cornerA.lat)
				]));
				
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerB.lng),
					parseFloat(options.cornerB.lat)
				]));
				
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerA.lng),
					parseFloat(options.cornerB.lat)
				]));
				
				coordinates[0].push(ol.proj.fromLonLat([
					parseFloat(options.cornerA.lng),
					parseFloat(options.cornerA.lat)
				]));
			}
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style: this.olStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaRectangle: this,
			wpgmzaFeature: this
		});
		
		if(options)
			this.setOptions(options);
	}
	

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProRectangle;
	
	WPGMZA.extend(WPGMZA.OLRectangle, Parent);
	
	// NB: Would be nice to move this onto OLFeature
	WPGMZA.OLRectangle.prototype.getBounds = function()
	{
		var extent				= this.olFeature.getGeometry().getExtent();
		var topLeft				= ol.extent.getTopLeft(extent);
		var bottomRight			= ol.extent.getBottomRight(extent);
		
		var topLeftLonLat		= ol.proj.toLonLat(topLeft);
		var bottomRightLonLat	= ol.proj.toLonLat(bottomRight);
		
		var topLeftLatLng		= new WPGMZA.LatLng(topLeftLonLat[1], topLeftLonLat[0]);
		var bottomRightLatLng	= new WPGMZA.LatLng(bottomRightLonLat[1], bottomRightLonLat[0]);
		
		return new WPGMZA.LatLngBounds(
			topLeftLatLng,
			bottomRightLatLng
		);
	}
	
	WPGMZA.OLRectangle.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
});