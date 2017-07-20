(function($) {
	
	var parentConstructor;
	
	WPGMZA.OSMPolyline = function(row, osmFeature)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, row);
		
		this.osmStyle = new ol.style.Style();
		
		if(osmFeature)
		{
			this.osmFeature = osmFeature;
		}
		else
		{
			this.osmFeature = new ol.Feature();
			
			var coordinates = [];
			
			if(row && row.points)
			{
				var path = this.parseGeometry(row.points);
				
				for(var i = 0; i < path.length; i++)
					coordinates.push(ol.proj.fromLonLat([
						parseFloat(path[i].lng),
						parseFloat(path[i].lat)
					]));
			}
			
			var params = {};
			
			if(this.settings.strokeOpacity)
				params.stroke = new ol.style.Stroke({
					color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity),
					width: parseInt(this.settings.strokeWeight)
				});
			
			this.osmStyle = new ol.style.Style(params);
		}
		
		this.osmFeature = new ol.Feature({
			geometry: new ol.geom.LineString(coordinates)
		});
		
		this.osmFeature.wpgmzaPolyline = this;
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.osmFeature]
			}),
			style: this.osmStyle
		});
	}
	
	parentConstructor = WPGMZA.Polyline;
		
	WPGMZA.OSMPolyline.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.OSMPolyline.prototype.constructor = WPGMZA.OSMPolyline;
	
	WPGMZA.OSMPolyline.prototype.setEditable = function(editable)
	{
		WPGMZA.OSMMapEditPage.setPolyEditable(this, editable);
	}
	
	WPGMZA.OSMPolyline.prototype.setPoints = function(points)
	{
		if(this.osmFeature)
			this.layer.getSource().removeFeature(this.osmFeature);
		
		var coordinates = [];
		
		for(var i = 0; i < points.length; i++)
			coordinates.push(ol.proj.fromLonLat([
				parseFloat(points[i].lng),
				parseFloat(points[i].lat)
			]));
		
		this.osmFeature = new ol.Feature({
			geometry: new ol.geom.LineString(coordinates)
		});
		
		this.layer.getSource().addFeature(this.osmFeature);
	}
	
	WPGMZA.OSMPolyline.prototype.toJSON = function()
	{
		var result = parentConstructor.prototype.toJSON.call(this);
		var coordinates = this.osmFeature.getGeometry().getCoordinates();
		
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