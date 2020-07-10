/**
 * @namespace WPGMZA
 * @module OLPolyline
 * @requires WPGMZA.Polyline
 * @gulp-requires ../polyline.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLPolyline = function(options, olFeature)
	{
		var self = this;
		
		WPGMZA.Polyline.call(this, options);
		
		this.olStyle = new ol.style.Style();
		
		if(olFeature)
		{
			this.olFeature = olFeature;
		}
		else
		{
			var coordinates = [];
			
			if(options && (options.polydata || options.points))
			{
				var path;
				
				if(options.polydata)
					path = this.parseGeometry(options.polydata);
				else	
					path = options.points;
				
				for(var i = 0; i < path.length; i++)
				{
					if(!($.isNumeric(path[i].lat)))
						throw new Error("Invalid latitude");
					
					if(!($.isNumeric(path[i].lng)))
						throw new Error("Invalid longitude");
					
					coordinates.push(ol.proj.fromLonLat([
						parseFloat(path[i].lng),
						parseFloat(path[i].lat)
					]));
				}
			}
			
			var params = this.getStyleFromSettings();
			this.olStyle = new ol.style.Style(params);
			
			this.olFeature = new ol.Feature({
				geometry: new ol.geom.LineString(coordinates)
			});
		}
		
		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style: this.olStyle
		});
		
		this.layer.getSource().getFeatures()[0].setProperties({
			wpgmzaPolyline: this
		});
	}
	
	Parent = WPGMZA.Polyline;
		
	WPGMZA.OLPolyline.prototype = Object.create(Parent.prototype);
	WPGMZA.OLPolyline.prototype.constructor = WPGMZA.OLPolyline;
	
	WPGMZA.OLPolyline.prototype.getStyleFromSettings = function()
	{
		var params = {};
		
		if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity),
				width: parseInt(this.settings.strokeWeight)
			});
			
		return params;
	}
	
	WPGMZA.OLPolyline.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
	}
	
	WPGMZA.OLPolyline.prototype.setEditable = function(editable)
	{
		
	}
	
	WPGMZA.OLPolyline.prototype.setPoints = function(points)
	{
		if(this.olFeature)
			this.layer.getSource().removeFeature(this.olFeature);
		
		var coordinates = [];
		
		for(var i = 0; i < points.length; i++)
			coordinates.push(ol.proj.fromLonLat([
				parseFloat(points[i].lng),
				parseFloat(points[i].lat)
			]));
		
		this.olFeature = new ol.Feature({
			geometry: new ol.geom.LineString(coordinates)
		});
		
		this.layer.getSource().addFeature(this.olFeature);
	}
	
	WPGMZA.OLPolyline.prototype.toJSON = function()
	{
		var result = Parent.prototype.toJSON.call(this);
		var coordinates = this.olFeature.getGeometry().getCoordinates();
		
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1wb2x5bGluZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBPTFBvbHlsaW5lXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuUG9seWxpbmVcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vcG9seWxpbmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0dmFyIFBhcmVudDtcclxuXHRcclxuXHRXUEdNWkEuT0xQb2x5bGluZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIG9sRmVhdHVyZSlcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFdQR01aQS5Qb2x5bGluZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUoKTtcclxuXHRcdFxyXG5cdFx0aWYob2xGZWF0dXJlKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLm9sRmVhdHVyZSA9IG9sRmVhdHVyZTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dmFyIGNvb3JkaW5hdGVzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zICYmIChvcHRpb25zLnBvbHlkYXRhIHx8IG9wdGlvbnMucG9pbnRzKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBwYXRoO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKG9wdGlvbnMucG9seWRhdGEpXHJcblx0XHRcdFx0XHRwYXRoID0gdGhpcy5wYXJzZUdlb21ldHJ5KG9wdGlvbnMucG9seWRhdGEpO1xyXG5cdFx0XHRcdGVsc2VcdFxyXG5cdFx0XHRcdFx0cGF0aCA9IG9wdGlvbnMucG9pbnRzO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGlmKCEoJC5pc051bWVyaWMocGF0aFtpXS5sYXQpKSlcclxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBsYXRpdHVkZVwiKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoISgkLmlzTnVtZXJpYyhwYXRoW2ldLmxuZykpKVxyXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGxvbmdpdHVkZVwiKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Y29vcmRpbmF0ZXMucHVzaChvbC5wcm9qLmZyb21Mb25MYXQoW1xyXG5cdFx0XHRcdFx0XHRwYXJzZUZsb2F0KHBhdGhbaV0ubG5nKSxcclxuXHRcdFx0XHRcdFx0cGFyc2VGbG9hdChwYXRoW2ldLmxhdClcclxuXHRcdFx0XHRcdF0pKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBwYXJhbXMgPSB0aGlzLmdldFN0eWxlRnJvbVNldHRpbmdzKCk7XHJcblx0XHRcdHRoaXMub2xTdHlsZSA9IG5ldyBvbC5zdHlsZS5TdHlsZShwYXJhbXMpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5vbEZlYXR1cmUgPSBuZXcgb2wuRmVhdHVyZSh7XHJcblx0XHRcdFx0Z2VvbWV0cnk6IG5ldyBvbC5nZW9tLkxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmxheWVyID0gbmV3IG9sLmxheWVyLlZlY3Rvcih7XHJcblx0XHRcdHNvdXJjZTogbmV3IG9sLnNvdXJjZS5WZWN0b3Ioe1xyXG5cdFx0XHRcdGZlYXR1cmVzOiBbdGhpcy5vbEZlYXR1cmVdXHJcblx0XHRcdH0pLFxyXG5cdFx0XHRzdHlsZTogdGhpcy5vbFN0eWxlXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sYXllci5nZXRTb3VyY2UoKS5nZXRGZWF0dXJlcygpWzBdLnNldFByb3BlcnRpZXMoe1xyXG5cdFx0XHR3cGdtemFQb2x5bGluZTogdGhpc1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFBhcmVudCA9IFdQR01aQS5Qb2x5bGluZTtcclxuXHRcdFxyXG5cdFdQR01aQS5PTFBvbHlsaW5lLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGFyZW50LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLk9MUG9seWxpbmUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk9MUG9seWxpbmU7XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWxpbmUucHJvdG90eXBlLmdldFN0eWxlRnJvbVNldHRpbmdzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSB7fTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5zZXR0aW5ncy5zdHJva2VPcGFjaXR5KVxyXG5cdFx0XHRwYXJhbXMuc3Ryb2tlID0gbmV3IG9sLnN0eWxlLlN0cm9rZSh7XHJcblx0XHRcdFx0Y29sb3I6IFdQR01aQS5oZXhPcGFjaXR5VG9SR0JBKHRoaXMuc2V0dGluZ3Muc3Ryb2tlQ29sb3IsIHRoaXMuc2V0dGluZ3Muc3Ryb2tlT3BhY2l0eSksXHJcblx0XHRcdFx0d2lkdGg6IHBhcnNlSW50KHRoaXMuc2V0dGluZ3Muc3Ryb2tlV2VpZ2h0KVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0XHJcblx0XHRyZXR1cm4gcGFyYW1zO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xQb2x5bGluZS5wcm90b3R5cGUudXBkYXRlU3R5bGVGcm9tU2V0dGluZ3MgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0Ly8gUmUtY3JlYXRlIHRoZSBzdHlsZSAtIHdvcmtpbmcgb24gaXQgZGlyZWN0bHkgZG9lc24ndCBjYXVzZSBhIHJlLXJlbmRlclxyXG5cdFx0dmFyIHBhcmFtcyA9IHRoaXMuZ2V0U3R5bGVGcm9tU2V0dGluZ3MoKTtcclxuXHRcdHRoaXMub2xTdHlsZSA9IG5ldyBvbC5zdHlsZS5TdHlsZShwYXJhbXMpO1xyXG5cdFx0dGhpcy5sYXllci5zZXRTdHlsZSh0aGlzLm9sU3R5bGUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xQb2x5bGluZS5wcm90b3R5cGUuc2V0RWRpdGFibGUgPSBmdW5jdGlvbihlZGl0YWJsZSlcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWxpbmUucHJvdG90eXBlLnNldFBvaW50cyA9IGZ1bmN0aW9uKHBvaW50cylcclxuXHR7XHJcblx0XHRpZih0aGlzLm9sRmVhdHVyZSlcclxuXHRcdFx0dGhpcy5sYXllci5nZXRTb3VyY2UoKS5yZW1vdmVGZWF0dXJlKHRoaXMub2xGZWF0dXJlKTtcclxuXHRcdFxyXG5cdFx0dmFyIGNvb3JkaW5hdGVzID0gW107XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspXHJcblx0XHRcdGNvb3JkaW5hdGVzLnB1c2gob2wucHJvai5mcm9tTG9uTGF0KFtcclxuXHRcdFx0XHRwYXJzZUZsb2F0KHBvaW50c1tpXS5sbmcpLFxyXG5cdFx0XHRcdHBhcnNlRmxvYXQocG9pbnRzW2ldLmxhdClcclxuXHRcdFx0XSkpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sRmVhdHVyZSA9IG5ldyBvbC5GZWF0dXJlKHtcclxuXHRcdFx0Z2VvbWV0cnk6IG5ldyBvbC5nZW9tLkxpbmVTdHJpbmcoY29vcmRpbmF0ZXMpXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sYXllci5nZXRTb3VyY2UoKS5hZGRGZWF0dXJlKHRoaXMub2xGZWF0dXJlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MUG9seWxpbmUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gUGFyZW50LnByb3RvdHlwZS50b0pTT04uY2FsbCh0aGlzKTtcclxuXHRcdHZhciBjb29yZGluYXRlcyA9IHRoaXMub2xGZWF0dXJlLmdldEdlb21ldHJ5KCkuZ2V0Q29vcmRpbmF0ZXMoKTtcclxuXHRcdFxyXG5cdFx0cmVzdWx0LnBvaW50cyA9IFtdO1xyXG5cdFx0XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgY29vcmRpbmF0ZXMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciBsb25MYXQgPSBvbC5wcm9qLnRvTG9uTGF0KGNvb3JkaW5hdGVzW2ldKTtcclxuXHRcdFx0dmFyIGxhdExuZyA9IHtcclxuXHRcdFx0XHRsYXQ6IGxvbkxhdFsxXSxcclxuXHRcdFx0XHRsbmc6IGxvbkxhdFswXVxyXG5cdFx0XHR9O1xyXG5cdFx0XHRyZXN1bHQucG9pbnRzLnB1c2gobGF0TG5nKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoib3Blbi1sYXllcnMvb2wtcG9seWxpbmUuanMifQ==
