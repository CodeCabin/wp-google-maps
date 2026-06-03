/**
 * @namespace WPGMZA
 * @module LeafletModernStoreLocatorCircle
 * @requires WPGMZA.ModernStoreLocatorCircle
 */
jQuery(function($) {
	
	WPGMZA.LeafletModernStoreLocatorCircle = function(map, settings)
	{
		WPGMZA.ModernStoreLocatorCircle.call(this, map, settings);
	}
	
	WPGMZA.LeafletModernStoreLocatorCircle.prototype = Object.create(WPGMZA.ModernStoreLocatorCircle.prototype);
	WPGMZA.LeafletModernStoreLocatorCircle.prototype.constructor = WPGMZA.LeafletModernStoreLocatorCircle;
	
	WPGMZA.LeafletModernStoreLocatorCircle.prototype.initCanvasLayer = function()
	{
		var self = this;
		var mapElement = $(this.map.element);
		var leafletViewportElement = mapElement;


		this.canvas = document.createElement("canvas");
		this.canvas.className = "wpgmza-leaflet-canvas-overlay";
		leafletViewportElement.find('.leaflet-map-pane .leaflet-overlay-pane').prepend(this.canvas);

		this.renderFunction = function(event) {

			if(self.canvas.width != leafletViewportElement.width() || self.canvas.height != leafletViewportElement.height())
			{
				self.canvas.width = leafletViewportElement.width();
				self.canvas.height = leafletViewportElement.height();

				$(this.canvas).css({
					width: leafletViewportElement.width() + "px",
					height: leafletViewportElement.height() + "px"
				});
			}

			self.draw();
		};

		this.map.leafletMap.on("moveend", this.renderFunction);

		/* Size the canvas to match the map viewport right away, not on
		 * first moveend. Fresh HTML canvases default to 300x150 which
		 * is much smaller than the map — without this initial sizing,
		 * a circle created mid-session (e.g. user toggles radius style
		 * from classic to radar without moving the map) paints into
		 * the tiny default canvas and the rings never become visible
		 * until the user drags/zooms the map. The `renderFunction`
		 * above has the same resize logic; we invoke it once inline
		 * so it applies on construction as well. */
		self.canvas.width = leafletViewportElement.width();
		self.canvas.height = leafletViewportElement.height();
		$(self.canvas).css({
			width: leafletViewportElement.width() + "px",
			height: leafletViewportElement.height() + "px"
		});
	}

	WPGMZA.LeafletModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		return this.canvas.getContext(type);
	}
	
	WPGMZA.LeafletModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		return {
			width: this.canvas.width,
			height: this.canvas.height
		};
	}
	
	WPGMZA.LeafletModernStoreLocatorCircle.prototype.getCenterPixels = function()
	{
		/* The canvas lives inside .leaflet-overlay-pane which gets CSS-
		 * transformed as the user pans the map. `latLngToContainerPoint`
		 * returns viewport-relative pixels, so combined with the pane's
		 * offset the drawing ends up double-shifted in the wrong
		 * direction on drag. `latLngToLayerPoint` returns pane-relative
		 * pixels which cancels out the pane offset — the radar now
		 * stays pinned to its geographic location as the user drags. */
		var leafletPoint = this.map.leafletMap.latLngToLayerPoint(this.settings.center);
		if(!leafletPoint){
			return { x: 0, y: 0 };
		}
		return { x: leafletPoint.x, y: leafletPoint.y };
	}
		
	WPGMZA.LeafletModernStoreLocatorCircle.prototype.getWorldOriginOffset = function()
	{
		return {
			x: 0,
			y: 0
		};
	}
	
	WPGMZA.LeafletModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
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
	
	WPGMZA.LeafletModernStoreLocatorCircle.prototype.getScale = function()
	{
		return 1;
	}
	
	WPGMZA.LeafletModernStoreLocatorCircle.prototype.destroy = function()
	{
		$(this.canvas).remove();
		
		this.map.leafletMap.off("moveend", this.renderFunction);
		this.map = null;
		this.canvas = null;
	}
	
});