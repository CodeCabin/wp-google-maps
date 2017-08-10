(function($) {
	
	var parentConstructor;
	
	WPGMZA.OSMPolygon = function(row, osmFeature)
	{
		var self = this;
		
		parentConstructor.call(this, row, osmFeature);
		
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
				
				var params = {};
				
				if(this.settings.strokeOpacity)
					params.stroke = new ol.style.Stroke({
						color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
					});
				
				if(this.settings.fillOpacity)
					params.fill = new ol.style.Fill({
						color: WPGMZA.hexOpacityToRGBA(this.settings.fillColor, this.settings.fillOpacity)
					});
			
				this.osmStyle = new ol.style.Style(params);
			}
			
			this.osmFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinates)
			});
		}
		
		this.osmFeature.setProperties({
			wpgmzaPolygon: this
		});
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.osmFeature]
			}),
			style: this.osmStyle
		});
	}
	
	if(WPGMZA.isProVersion())
		parentConstructor = WPGMZA.ProPolygon;
	else
		parentConstructor = WPGMZA.Polygon;
	
	WPGMZA.OSMPolygon.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.OSMPolygon.prototype.constructor = WPGMZA.OSMPolygon;

	WPGMZA.OSMPolygon.prototype.setEditable = function(editable)
	{
		WPGMZA.OSMMapEditPage.setPolyEditable(this, editable);
	}
	
	WPGMZA.OSMPolygon.prototype.toJSON = function()
	{
		var result = parentConstructor.prototype.toJSON.call(this);
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