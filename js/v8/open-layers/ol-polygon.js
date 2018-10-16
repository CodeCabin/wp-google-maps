/**
 * @namespace WPGMZA
 * @module OLPolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolygon = function(row, olFeature)
	{
		var self = this;
		
		Parent.call(this, row, olFeature);
		
		this.olStyle = new ol.style.Style();
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [[]];
			
			if(row && row.points)
			{
				var paths = this.parseGeometry(row.points);
				
				for(var i = 0; i < paths.length; i++)
					coordinates[0].push(ol.proj.fromLonLat([
						parseFloat(paths[i].lng),
						parseFloat(paths[i].lat)
					]));
				
				this.olStyle = new ol.style.Style(this.getStyleFromSettings());
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
			wpgmzaPolygon: this
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
	
	WPGMZA.OLPolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolygon.prototype.constructor = WPGMZA.OLPolygon;

	WPGMZA.OLPolygon.prototype.getStyleFromSettings = function()
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
	
	WPGMZA.OLPolygon.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
	WPGMZA.OLPolygon.prototype.setEditable = function(editable)
	{
		
	}
	
	WPGMZA.OLPolygon.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.olFeature.getGeometry().getCoordinates()[0];
		
		result.points = [];
		
		for(var i = 0; i < coordinates.length; i++)
		{
			var lonLat = ol.proj.toLonLat(coordinates[i]);
			var latLng = {
				lat: lonLat[1],
				lng: lonLat[0]
			};
			result.points.push(latLng);
		}
		
		return result;
	}
	
});