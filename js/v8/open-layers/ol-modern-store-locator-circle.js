/**
 * @namespace WPGMZA
 * @module OLModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 */
(function($) {
	
	WPGMZA.OLModernStoreLocatorCircle = function(map, settings)
	{
		WPGMZA.ModernStoreLocatorCircle.call(this, map, settings);
		
		
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype = Object.create(WPGMZA.ModernStoreLocatorCircle.prototype);
	WPGMZA.OLModernStoreLocatorCircle.prototype.constructor = WPGMZA.OLModernStoreLocatorCircle;
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		
		this.canvas = document.createElement("canvas");
		
		//if(this.layer)
			//this.map.olMap.removeLayer(this.layer);
		
		/*this.layer = new ol.layer.Image({
			source: new ol.source.ImageCanvas({
				canvasFunction: function(extent, resolution, pixelRatio, size, projection) {
					
					if(!self.canvasDimensions || !self.canvasDimensions.width == size[0] || !self.canvasDimensions.height == size[1])
					{
						self.canvasDimensions = {
							width: size[0],
							height: size[1]
						};
						$(self.canvas).css({
							width: (size[0] / pixelRatio) + "px",
							height: (size[1] / pixelRatio) + "px"
						});
					}
					
					self.draw();
					
				},
				projection: "EPSG:3857"
			})
		});*/
		
		//this.map.olMap.addLayer(this.layer);
	}

	WPGMZA.OLModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvas.getContext(type);
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return this.canvasDimensions;
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		return {
			x: 0,
			y: 0
		};
	}
		
	WPGMZA.OLModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		return {
			x: 0,
			y: 0
		};
	}
	
	WPGMZA.OLModernStoreLocatorCircle.prototype.getTransformedRadius = function()
	{
		return 100;
	}
	
})(jQuery);