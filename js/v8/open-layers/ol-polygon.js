/**
 * @namespace WPGMZA
 * @module OLPolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolygon = function(options, olFeature)
	{
		var self = this;
		
		Parent.call(this, options, olFeature);
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [[]];
			
			if(options && options.polydata)
			{
				var paths = this.parseGeometry(options.polydata);
				
				// NB: We have to close the polygon in OpenLayers for the edit interaction to pick up on the last edge
				for(var i = 0; i <= paths.length; i++)
					coordinates[0].push(ol.proj.fromLonLat([
						parseFloat(paths[i % paths.length].lng),
						parseFloat(paths[i % paths.length].lat)
					]));
			}
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			})
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolygon: this,
			wpgmzaFeature: this
		});
		
		if(options)
			this.setOptions(options);
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
	
	WPGMZA.OLPolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolygon.prototype.constructor = WPGMZA.OLPolygon;
	
	WPGMZA.OLPolygon.prototype.getGeometry = function()
	{
		var coordinates = this.olFeature.getGeometry().getCoordinates()[0];
		var result = [];
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.push(latLng);
		}
		
		return result;
	}
	
	WPGMZA.OLPolygon.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
});