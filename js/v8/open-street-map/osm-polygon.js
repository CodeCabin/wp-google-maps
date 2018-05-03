/**
 * @namespace WPGMZA
 * @module OSMPolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMPolygon = function(row, osmFeature)
	{
		var self = this;
		
		Parent.call(this, row, osmFeature);
		
		this.osmStyle = new ol.style.Style();
		
		if(osmFeature)
		{
			this.osmFeature = osmFeature;
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
				
				this.osmStyle = new ol.style.Style(this.getStyleFromSettings());
			}
			
			this.osmFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.osmFeature]
			}),
			style: this.osmStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolygon: this
		});
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
	
	WPGMZA.OSMPolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMPolygon.prototype.constructor = WPGMZA.OSMPolygon;

	WPGMZA.OSMPolygon.prototype.getStyleFromSettings = function()
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
	
	WPGMZA.OSMPolygon.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.osmStyle = new ol.style.Style(params);
		this.layer.setStyle(this.osmStyle);
	}
	
	WPGMZA.OSMPolygon.prototype.setEditable = function(editable)
	{
		
	}
	
	WPGMZA.OSMPolygon.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.osmFeature.getGeometry().getCoordinates()[0];
		
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
	
})(jQuery);