/**
 * @namespace WPGMZA
 * @module OLPolyline
 * @requires WPGMZA.Polyline
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolyline = function(options, olFeature)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, options);
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [];
			
			if(options && options.polydata)
			{
				var path = this.parseGeometry(options.polydata);
				
				for(var i = 0; i < path.length; i++)
				{
					if(!(WPGMZA.isNumeric(path[i].lat)))
						throw new Error("Invalid latitude");
					
					if(!(WPGMZA.isNumeric(path[i].lng)))
						throw new Error("Invalid longitude");
					
					coordinates.push(ol.proj.fromLonLat([
						parseFloat(path[i].lng),
						parseFloat(path[i].lat)
					]));
				}
			}
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.LineString(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			})
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolyline: this,
			wpgmzaFeature: this
		});
		
		if(options)
			this.setOptions(options);
	}
	
	Parent = WPGMZA.Polyline;
		
	WPGMZA.OLPolyline.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolyline.prototype.constructor = WPGMZA.OLPolyline;
	
	WPGMZA.OLPolyline.prototype.getGeometry = function()
	{
		var result = [];
		var coordinates = this.olFeature.getGeometry().getCoordinates();
		
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
	
	WPGMZA.OLPolyline.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options)
			WPGMZA.OLFeature.setInteractionsOnFeature(this, options.editable);
	}
	
});