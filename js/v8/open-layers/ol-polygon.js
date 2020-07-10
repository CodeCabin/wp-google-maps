/**
 * @namespace WPGMZA
 * @module OLPolygon
 * @requires WPGMZA.Polygon
 * @gulp-requires ../polygon.js
 * @pro-requires WPGMZA.ProPolygon
 * @gulp-pro-requires pro-polygon.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolygon = function(options, olFeature)
	{
		var self = this;
		
		Parent.call(this, options, olFeature);
		
		this.olStyle = new ol.style.Style();
		
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
				
		if(this.linecolor && this.lineopacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA("#" + this.linecolor, this.lineopacity)
			});
		
		if(this.opacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(this.fillcolor, this.opacity)
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1wb2x5Z29uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIE9MUG9seWdvblxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLlBvbHlnb25cclxuICogQGd1bHAtcmVxdWlyZXMgLi4vcG9seWdvbi5qc1xyXG4gKiBAcHJvLXJlcXVpcmVzIFdQR01aQS5Qcm9Qb2x5Z29uXHJcbiAqIEBndWxwLXByby1yZXF1aXJlcyBwcm8tcG9seWdvbi5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5PTFBvbHlnb24gPSBmdW5jdGlvbihvcHRpb25zLCBvbEZlYXR1cmUpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQuY2FsbCh0aGlzLCBvcHRpb25zLCBvbEZlYXR1cmUpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcclxuXHRcdFxyXG5cdFx0aWYob2xGZWF0dXJlKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLm9sRmVhdHVyZSA9IG9sRmVhdHVyZTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dmFyIGNvb3JkaW5hdGVzID0gW1tdXTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKG9wdGlvbnMgJiYgb3B0aW9ucy5wb2x5ZGF0YSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBwYXRocyA9IHRoaXMucGFyc2VHZW9tZXRyeShvcHRpb25zLnBvbHlkYXRhKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgcGF0aHMubGVuZ3RoOyBpKyspXHJcblx0XHRcdFx0XHRjb29yZGluYXRlc1swXS5wdXNoKG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdFx0XHRcdHBhcnNlRmxvYXQocGF0aHNbaV0ubG5nKSxcclxuXHRcdFx0XHRcdFx0cGFyc2VGbG9hdChwYXRoc1tpXS5sYXQpXHJcblx0XHRcdFx0XHRdKSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5vbFN0eWxlID0gbmV3IG9sLnN0eWxlLlN0eWxlKHRoaXMuZ2V0U3R5bGVGcm9tU2V0dGluZ3MoKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMub2xGZWF0dXJlID0gbmV3IG9sLkZlYXR1cmUoe1xyXG5cdFx0XHRcdGdlb21ldHJ5OiBuZXcgb2wuZ2VvbS5Qb2x5Z29uKGNvb3JkaW5hdGVzKVxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy5sYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xyXG5cdFx0XHRzb3VyY2U6IG5ldyBvbC5zb3VyY2UuVmVjdG9yKHtcclxuXHRcdFx0XHRmZWF0dXJlczogW3RoaXMub2xGZWF0dXJlXVxyXG5cdFx0XHR9KSxcclxuXHRcdFx0c3R5bGU6IHRoaXMub2xTdHlsZVxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMubGF5ZXIuZ2V0U291cmNlKCkuZ2V0RmVhdHVyZXMoKVswXS5zZXRQcm9wZXJ0aWVzKHtcclxuXHRcdFx0d3BnbXphUG9seWdvbjogdGhpc1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9Qb2x5Z29uO1xyXG5cdGVsc2VcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qb2x5Z29uO1xyXG5cdFxyXG5cdFdQR01aQS5PTFBvbHlnb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQYXJlbnQucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuT0xQb2x5Z29uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5PTFBvbHlnb247XHJcblxyXG5cdFdQR01aQS5PTFBvbHlnb24ucHJvdG90eXBlLmdldFN0eWxlRnJvbVNldHRpbmdzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSB7fTtcclxuXHRcdFx0XHRcclxuXHRcdGlmKHRoaXMubGluZWNvbG9yICYmIHRoaXMubGluZW9wYWNpdHkpXHJcblx0XHRcdHBhcmFtcy5zdHJva2UgPSBuZXcgb2wuc3R5bGUuU3Ryb2tlKHtcclxuXHRcdFx0XHRjb2xvcjogV1BHTVpBLmhleE9wYWNpdHlUb1JHQkEoXCIjXCIgKyB0aGlzLmxpbmVjb2xvciwgdGhpcy5saW5lb3BhY2l0eSlcclxuXHRcdFx0fSk7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMub3BhY2l0eSlcclxuXHRcdFx0cGFyYW1zLmZpbGwgPSBuZXcgb2wuc3R5bGUuRmlsbCh7XHJcblx0XHRcdFx0Y29sb3I6IFdQR01aQS5oZXhPcGFjaXR5VG9SR0JBKHRoaXMuZmlsbGNvbG9yLCB0aGlzLm9wYWNpdHkpXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdHJldHVybiBwYXJhbXM7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTFBvbHlnb24ucHJvdG90eXBlLnVwZGF0ZVN0eWxlRnJvbVNldHRpbmdzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdC8vIFJlLWNyZWF0ZSB0aGUgc3R5bGUgLSB3b3JraW5nIG9uIGl0IGRpcmVjdGx5IGRvZXNuJ3QgY2F1c2UgYSByZS1yZW5kZXJcclxuXHRcdHZhciBwYXJhbXMgPSB0aGlzLmdldFN0eWxlRnJvbVNldHRpbmdzKCk7XHJcblx0XHR0aGlzLm9sU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUocGFyYW1zKTtcclxuXHRcdHRoaXMubGF5ZXIuc2V0U3R5bGUodGhpcy5vbFN0eWxlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWdvbi5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbihlZGl0YWJsZSlcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWdvbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciByZXN1bHQgPSBQYXJlbnQucHJvdG90eXBlLnRvSlNPTi5jYWxsKHRoaXMpO1xyXG5cdFx0dmFyIGNvb3JkaW5hdGVzID0gdGhpcy5vbEZlYXR1cmUuZ2V0R2VvbWV0cnkoKS5nZXRDb29yZGluYXRlcygpWzBdO1xyXG5cdFx0XHJcblx0XHRyZXN1bHQucG9pbnRzID0gW107XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBjb29yZGluYXRlcy5sZW5ndGg7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0dmFyIGxvbkxhdCA9IG9sLnByb2oudG9Mb25MYXQoY29vcmRpbmF0ZXNbaV0pO1xyXG5cdFx0XHR2YXIgbGF0TG5nID0ge1xyXG5cdFx0XHRcdGxhdDogbG9uTGF0WzFdLFxyXG5cdFx0XHRcdGxuZzogbG9uTGF0WzBdXHJcblx0XHRcdH07XHJcblx0XHRcdHJlc3VsdC5wb2ludHMucHVzaChsYXRMbmcpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1wb2x5Z29uLmpzIn0=
