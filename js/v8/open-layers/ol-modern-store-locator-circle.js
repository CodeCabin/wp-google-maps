/**
 * @namespace WPGMZA
 * @module OLModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 */
jQuery(function($) {
	
	WPGMZA.OLModernStoreLocatorCircle = function(map, settings)
	{
		WPGMZA.ModernStoreLocatorCircle.call(this, map, settings);
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype = Object.create(WPGMZA.ModernStoreLocatorCircle.prototype);
	WPGMZA.OLModernStoreLocatorCircle.prototype.constructor = WPGMZA.OLModernStoreLocatorCircle;
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		var mapElement = $(this.map.element);
		var olViewportElement = mapElement.children(".ol-viewport");
		
		this.canvas = document.createElement("canvas");
		this.canvas.className = "wpgmza-ol-canvas-overlay";
		mapElement.append(this.canvas);
		
		this.renderFunction = function(event) {
			
			if(self.canvas.width != olViewportElement.width() || self.canvas.height != olViewportElement.height())
			{
				self.canvas.width = olViewportElement.width();
				self.canvas.height = olViewportElement.height();
				
				$(this.canvas).css({
					width: olViewportElement.width() + "px",
					height: olViewportElement.height() + "px"
				});
			}
			
			self.draw();
		};
		
		this.map.olMap.on("postrender", this.renderFunction);
	}

	WPGMZA.OLModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvas.getContext(type);
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvas.width,
			height: this.canvas.height
		};
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		var center = this.map.latLngToPixels(this.settings.center);
		
		return center;
	}
		
	WPGMZA.OLModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		return {
			x: 0,
			y: 0
		};
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		var center = new WPGMZA.LatLng(this.settings.center);
		var outer = new WPGMZA.LatLng(center);
		
		outer.moveByDistance(km, 90);
		
		var centerPixels = this.map.latLngToPixels(center);
		var outerPixels = this.map.latLngToPixels(outer);
		
		return Math.abs(outerPixels.x - centerPixels.x);

		/*if(!window.testMarker){
			window.testMarker = WPGMZA.Marker.createInstance({
				position: outer
			});
			WPGMZA.maps[0].addMarker(window.testMarker);
		}
		
		return 100;*/
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getScale = function()
	{
		return 1;
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.destroy = function()
	{
		$(this.canvas).remove();
		
		this.map.olMap.un("postrender", this.renderFunction);
		this.map = null;
		this.canvas = null;
	}
	
});