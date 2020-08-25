/**
 * @namespace WPGMZA
 * @module OLCircle
 * @requires WPGMZA.Circle
 * @gulp-requires ../circle.js
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.OLCircle = function(options, olFeature)
	{
		var self = this;
		
		this.center = {lat: 0, lng: 0};
		this.radius = 0;
		
		this.fillcolor = "#ff0000";
		this.opacity = 0.6;
		
		Parent.call(this, options, olFeature);
		
		this.olStyle = new ol.style.Style(this.getStyleFromSettings());
		
		this.vectorLayer3857 = this.layer = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: this.olStyle
		});
		
		if(olFeature)
			this.olFeature = olFeature;
		else
			this.recreate();
	}
	
	WPGMZA.OLCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.OLCircle.prototype.constructor = WPGMZA.OLCircle;
	
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
		var radius = parseFloat(this.radius) * 1000 / 2;
		var x, y;
		
		x = this.center.lng;
		y = this.center.lat;
		
		var circle4326 = ol.geom.Polygon.circular([x, y], radius, 64);
		var circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
		
		this.olFeature = new ol.Feature(circle3857);
		
		this.layer.getSource().addFeature(this.olFeature);
	}
	
	WPGMZA.OLCircle.prototype.getStyleFromSettings = function()
	{
		var params = {};
				
		/*if(this.settings.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(this.settings.strokeColor, this.settings.strokeOpacity)
			});*/
		
		if(this.opacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(this.fillColor, this.opacity)
			});
			
		return params;
	}
	
	WPGMZA.OLCircle.prototype.updateStyleFromSettings = function()
	{
		// Re-create the style - working on it directly doesn't cause a re-render
		var params = this.getStyleFromSettings();
		this.olStyle = new ol.style.Style(params);
		this.layer.setStyle(this.olStyle);
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
	
	WPGMZA.OLCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
		
		this.recreate();
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1jaXJjbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgT0xDaXJjbGVcclxuICogQHJlcXVpcmVzIFdQR01aQS5DaXJjbGVcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vY2lyY2xlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdHZhciBQYXJlbnQgPSBXUEdNWkEuQ2lyY2xlO1xyXG5cdFxyXG5cdFdQR01aQS5PTENpcmNsZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIG9sRmVhdHVyZSlcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMuY2VudGVyID0ge2xhdDogMCwgbG5nOiAwfTtcclxuXHRcdHRoaXMucmFkaXVzID0gMDtcclxuXHRcdFxyXG5cdFx0dGhpcy5maWxsY29sb3IgPSBcIiNmZjAwMDBcIjtcclxuXHRcdHRoaXMub3BhY2l0eSA9IDAuNjtcclxuXHRcdFxyXG5cdFx0UGFyZW50LmNhbGwodGhpcywgb3B0aW9ucywgb2xGZWF0dXJlKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5vbFN0eWxlID0gbmV3IG9sLnN0eWxlLlN0eWxlKHRoaXMuZ2V0U3R5bGVGcm9tU2V0dGluZ3MoKSk7XHJcblx0XHRcclxuXHRcdHRoaXMudmVjdG9yTGF5ZXIzODU3ID0gdGhpcy5sYXllciA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe1xyXG5cdFx0XHRzb3VyY2U6IG5ldyBvbC5zb3VyY2UuVmVjdG9yKCksXHJcblx0XHRcdHN0eWxlOiB0aGlzLm9sU3R5bGVcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRpZihvbEZlYXR1cmUpXHJcblx0XHRcdHRoaXMub2xGZWF0dXJlID0gb2xGZWF0dXJlO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLnJlY3JlYXRlKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTENpcmNsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBhcmVudC5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5PTENpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuT0xDaXJjbGU7XHJcblx0XHJcblx0V1BHTVpBLk9MQ2lyY2xlLnByb3RvdHlwZS5yZWNyZWF0ZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZih0aGlzLm9sRmVhdHVyZSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5sYXllci5nZXRTb3VyY2UoKS5yZW1vdmVGZWF0dXJlKHRoaXMub2xGZWF0dXJlKTtcclxuXHRcdFx0ZGVsZXRlIHRoaXMub2xGZWF0dXJlO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZighdGhpcy5jZW50ZXIgfHwgIXRoaXMucmFkaXVzKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdC8vIElNUE9SVEFOVDogUGxlYXNlIG5vdGUgdGhhdCBkdWUgdG8gd2hhdCBhcHBlYXJzIHRvIGJlIGEgYnVnIGluIE9wZW5MYXllcnMsIHRoZSBmb2xsb3dpbmcgY29kZSBNVVNUIGJlIGV4ZWN0ZWQgc3BlY2lmaWNhbGx5IGluIHRoaXMgb3JkZXIsIG9yIHRoZSBjaXJjbGUgd29uJ3QgYXBwZWFyXHJcblx0XHR2YXIgcmFkaXVzID0gcGFyc2VGbG9hdCh0aGlzLnJhZGl1cykgKiAxMDAwIC8gMjtcclxuXHRcdHZhciB4LCB5O1xyXG5cdFx0XHJcblx0XHR4ID0gdGhpcy5jZW50ZXIubG5nO1xyXG5cdFx0eSA9IHRoaXMuY2VudGVyLmxhdDtcclxuXHRcdFxyXG5cdFx0dmFyIGNpcmNsZTQzMjYgPSBvbC5nZW9tLlBvbHlnb24uY2lyY3VsYXIoW3gsIHldLCByYWRpdXMsIDY0KTtcclxuXHRcdHZhciBjaXJjbGUzODU3ID0gY2lyY2xlNDMyNi5jbG9uZSgpLnRyYW5zZm9ybSgnRVBTRzo0MzI2JywgJ0VQU0c6Mzg1NycpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm9sRmVhdHVyZSA9IG5ldyBvbC5GZWF0dXJlKGNpcmNsZTM4NTcpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmxheWVyLmdldFNvdXJjZSgpLmFkZEZlYXR1cmUodGhpcy5vbEZlYXR1cmUpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xDaXJjbGUucHJvdG90eXBlLmdldFN0eWxlRnJvbVNldHRpbmdzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSB7fTtcclxuXHRcdFx0XHRcclxuXHRcdC8qaWYodGhpcy5zZXR0aW5ncy5zdHJva2VPcGFjaXR5KVxyXG5cdFx0XHRwYXJhbXMuc3Ryb2tlID0gbmV3IG9sLnN0eWxlLlN0cm9rZSh7XHJcblx0XHRcdFx0Y29sb3I6IFdQR01aQS5oZXhPcGFjaXR5VG9SR0JBKHRoaXMuc2V0dGluZ3Muc3Ryb2tlQ29sb3IsIHRoaXMuc2V0dGluZ3Muc3Ryb2tlT3BhY2l0eSlcclxuXHRcdFx0fSk7Ki9cclxuXHRcdFxyXG5cdFx0aWYodGhpcy5vcGFjaXR5KVxyXG5cdFx0XHRwYXJhbXMuZmlsbCA9IG5ldyBvbC5zdHlsZS5GaWxsKHtcclxuXHRcdFx0XHRjb2xvcjogV1BHTVpBLmhleE9wYWNpdHlUb1JHQkEodGhpcy5maWxsQ29sb3IsIHRoaXMub3BhY2l0eSlcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0cmV0dXJuIHBhcmFtcztcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MQ2lyY2xlLnByb3RvdHlwZS51cGRhdGVTdHlsZUZyb21TZXR0aW5ncyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQvLyBSZS1jcmVhdGUgdGhlIHN0eWxlIC0gd29ya2luZyBvbiBpdCBkaXJlY3RseSBkb2Vzbid0IGNhdXNlIGEgcmUtcmVuZGVyXHJcblx0XHR2YXIgcGFyYW1zID0gdGhpcy5nZXRTdHlsZUZyb21TZXR0aW5ncygpO1xyXG5cdFx0dGhpcy5vbFN0eWxlID0gbmV3IG9sLnN0eWxlLlN0eWxlKHBhcmFtcyk7XHJcblx0XHR0aGlzLmxheWVyLnNldFN0eWxlKHRoaXMub2xTdHlsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTENpcmNsZS5wcm90b3R5cGUuc2V0VmlzaWJsZSA9IGZ1bmN0aW9uKHZpc2libGUpXHJcblx0e1xyXG5cdFx0dGhpcy5sYXllci5zZXRWaXNpYmxlKHZpc2libGUgPyB0cnVlIDogZmFsc2UpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xDaXJjbGUucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uKGNlbnRlcilcclxuXHR7XHJcblx0XHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRDZW50ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZWNyZWF0ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xDaXJjbGUucHJvdG90eXBlLnNldFJhZGl1cyA9IGZ1bmN0aW9uKHJhZGl1cylcclxuXHR7XHJcblx0XHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZWNyZWF0ZSgpO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1jaXJjbGUuanMifQ==
