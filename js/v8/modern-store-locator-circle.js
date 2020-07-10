/**
 * @namespace WPGMZA
 * @module ModernStoreLocatorCircle
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * This is the base class the modern store locator circle. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.ModernStoreLocatorCircle
	 * @constructor WPGMZA.ModernStoreLocatorCircle
	 * @param {int} map_id The ID of the map this circle belongs to
	 * @param {object} [settings] Settings to pass into this circle, such as strokeColor
	 */
	WPGMZA.ModernStoreLocatorCircle = function(map_id, settings) {
		var self = this;
		var map;
		
		if(WPGMZA.isProVersion())
			map = this.map = MYMAP[map_id].map;
		else
			map = this.map = MYMAP.map;
		
		this.map_id = map_id;
		this.mapElement = map.element;
		this.mapSize = {
			width:  $(this.mapElement).width(),
			height: $(this.mapElement).height()
		};
			
		this.initCanvasLayer();
		
		this.settings = {
			center: new WPGMZA.LatLng(0, 0),
			radius: 1,
			color: "#63AFF2",
			
			shadowColor: "white",
			shadowBlur: 4,
			
			centerRingRadius: 10,
			centerRingLineWidth: 3,

			numInnerRings: 9,
			innerRingLineWidth: 1,
			innerRingFade: true,
			
			numOuterRings: 7,
			
			ringLineWidth: 1,
			
			mainRingLineWidth: 2,
			
			numSpokes: 6,
			spokesStartAngle: Math.PI / 2,
			
			numRadiusLabels: 6,
			radiusLabelsStartAngle: Math.PI / 2,
			radiusLabelFont: "13px sans-serif",
			
			visible: false
		};
		
		if(settings)
			this.setOptions(settings);
	};
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.ModernStoreLocatorCircle.createInstance = function(map, settings) {
		
		if(WPGMZA.settings.engine == "google-maps")
			return new WPGMZA.GoogleModernStoreLocatorCircle(map, settings);
		else
			return new WPGMZA.OLModernStoreLocatorCircle(map, settings);
		
	};
	
	/**
	 * Abstract function to initialize the canvas layer
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.initCanvasLayer = function() {
		
	}
	
	/**
	 * Handles the map viewport being resized
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.onResize = function(event) { 
		this.draw();
	};
	
	/**
	 * Updates and redraws the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.onUpdate = function(event) { 
		this.draw();
	};
	
	/**
	 * Sets options on the circle (for example, strokeColor)
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {object} options An object of options to iterate over and set on this circle.
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setOptions = function(options) {
		for(var name in options)
		{
			var functionName = "set" + name.substr(0, 1).toUpperCase() + name.substr(1);
			
			if(typeof this[functionName] == "function")
				this[functionName](options[name]);
			else
				this.settings[name] = options[name];
		}
	};
	
	/**
	 * Gets the resolution scale for drawing on the circles canvas.
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {number} The device pixel ratio, or 1 where that is not present.
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getResolutionScale = function() {
		return window.devicePixelRatio || 1;
	};
	
	/**
	 * Returns the center of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {object} A latLng literal
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getCenter = function() {
		return this.getPosition();
	};
	
	/**
	 * Sets the center of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {WPGMZA.LatLng|object} A LatLng literal or instance of WPGMZA.LatLng
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setCenter = function(value) {
		this.setPosition(value);
	};
	
	/**
	 * Gets the center of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {object} The center as a LatLng literal
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getPosition = function() {
		return this.settings.center;
	};
	
	/**
	 * Alias for setCenter
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setPosition = function(position) {
		this.settings.center = position;
	};
	
	/**
	 * Gets the circle radius, in kilometers
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {number} The circles radius, in kilometers
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getRadius = function() {
		return this.settings.radius;
	};
	
	/**
	 * Sets the circles radius, in kilometers
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {number} radius The radius, in kilometers
	 * @throws Invalid radius
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setRadius = function(radius) {
		
		if(isNaN(radius))
			throw new Error("Invalid radius");
		
		this.settings.radius = radius;
	};
	
	/**
	 * Gets the visibility of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @return {bool} Whether or not the circle is visible
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getVisible = function() {
		return this.settings.visible;
	};
	
	/**
	 * Sets the visibility of the circle
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {bool} visible Whether the circle should be visible
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.setVisible = function(visible) {
		this.settings.visible = visible;
	};
	
	/**
	 * Abstract function to get the transformed circle radius (see subclasses)
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {number} km The input radius, in kilometers
	 * @throws Abstract function called
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getTransformedRadius = function(km)
	{
		throw new Error("Abstract function called");
	}
	
	/**
	 * Abstract function to set the canvas context
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @param {string} type The context type
	 * @throws Abstract function called
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getContext = function(type)
	{
		throw new Error("Abstract function called");
	}
	
	/**
	 * Abstract function to get the canvas dimensions
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 * @throws Abstract function called
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.getCanvasDimensions = function()
	{
		throw new Error("Abstract function called");
	}
	
	/**
	 * Validates the circle settings and corrects them where they are invalid
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.validateSettings = function()
	{
		if(!WPGMZA.isHexColorString(this.settings.color))
			this.settings.color = "#63AFF2";
	}
	
	/**
	 * Draws the circle to the canvas
	 * @method
	 * @memberof WPGMZA.ModernStoreLocatorCircle
	 */
	WPGMZA.ModernStoreLocatorCircle.prototype.draw = function() {
		
		this.validateSettings();
		
		var settings = this.settings;
		var canvasDimensions = this.getCanvasDimensions();
		
        var canvasWidth = canvasDimensions.width;
        var canvasHeight = canvasDimensions.height;
		
		var map = this.map;
		var resolutionScale = this.getResolutionScale();
		
		context = this.getContext("2d");
        context.clearRect(0, 0, canvasWidth, canvasHeight);

		if(!settings.visible)
			return;
		
		context.shadowColor = settings.shadowColor;
		context.shadowBlur = settings.shadowBlur;
		
		// NB: 2018/02/13 - Left this here in case it needs to be calibrated more accurately
		/*if(!this.testCircle)
		{
			this.testCircle = new google.maps.Circle({
				strokeColor: "#ff0000",
				strokeOpacity: 0.5,
				strokeWeight: 3,
				map: this.map,
				center: this.settings.center
			});
		}
		
		this.testCircle.setCenter(settings.center);
		this.testCircle.setRadius(settings.radius * 1000);*/
		
        // Reset transform
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        var scale = this.getScale();
        context.scale(scale, scale);

		// Translate by world origin
		var offset = this.getWorldOriginOffset();
		context.translate(offset.x, offset.y);

        // Get center and project to pixel space
		var center = new WPGMZA.LatLng(this.settings.center);
		var worldPoint = this.getCenterPixels();
		
		var rgba = WPGMZA.hexToRgba(settings.color);
		var ringSpacing = this.getTransformedRadius(settings.radius) / (settings.numInnerRings + 1);
		
		// TODO: Implement gradients for color and opacity
		
		// Inside circle (fixed?)
        context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(
			worldPoint.x, 
			worldPoint.y, 
			this.getTransformedRadius(settings.centerRingRadius) / scale, 0, 2 * Math.PI
		);
		context.stroke();
		context.closePath();
		
		// Spokes
		var radius = this.getTransformedRadius(settings.radius) + (ringSpacing * settings.numOuterRings) + 1;
		var grad = context.createRadialGradient(0, 0, 0, 0, 0, radius);
		var rgba = WPGMZA.hexToRgba(settings.color);
		var start = WPGMZA.rgbaToString(rgba), end;
		var spokeAngle;
		
		rgba.a = 0;
		end = WPGMZA.rgbaToString(rgba);
		
		grad.addColorStop(0, start);
		grad.addColorStop(1, end);
		
		context.save();
		
		context.translate(worldPoint.x, worldPoint.y);
		context.strokeStyle = grad;
		context.lineWidth = 2 / scale;
		
		for(var i = 0; i < settings.numSpokes; i++)
		{
			spokeAngle = settings.spokesStartAngle + (Math.PI * 2) * (i / settings.numSpokes);
			
			x = Math.cos(spokeAngle) * radius;
			y = Math.sin(spokeAngle) * radius;
			
			context.setLineDash([2 / scale, 15 / scale]);
			
			context.beginPath();
			context.moveTo(0, 0);
			context.lineTo(x, y);
			context.stroke();
		}
		
		context.setLineDash([]);
		
		context.restore();
		
		// Inner ringlets
		context.lineWidth = (1 / scale) * settings.innerRingLineWidth;
		
		for(var i = 1; i <= settings.numInnerRings; i++)
		{
			var radius = i * ringSpacing;
			
			if(settings.innerRingFade)
				rgba.a = 1 - (i - 1) / settings.numInnerRings;
			
			context.strokeStyle = WPGMZA.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		}
		
		// Main circle
		context.strokeStyle = settings.color;
		context.lineWidth = (1 / scale) * settings.centerRingLineWidth;
		
		context.beginPath();
		context.arc(worldPoint.x, worldPoint.y, this.getTransformedRadius(settings.radius), 0, 2 * Math.PI);
		context.stroke();
		context.closePath();
		
		// Outer ringlets
		var radius = radius + ringSpacing;
		for(var i = 0; i < settings.numOuterRings; i++)
		{
			if(settings.innerRingFade)
				rgba.a = 1 - i / settings.numOuterRings;
			
			context.strokeStyle = WPGMZA.rgbaToString(rgba);
			
			context.beginPath();
			context.arc(worldPoint.x, worldPoint.y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.closePath();
		
			radius += ringSpacing;
		}
		
		// Text
		if(settings.numRadiusLabels > 0)
		{
			var m;
			var radius = this.getTransformedRadius(settings.radius);
			var clipRadius = (12 * 1.1) / scale;
			var x, y;
			
			if(m = settings.radiusLabelFont.match(/(\d+)px/))
				clipRadius = (parseInt(m[1]) / 2 * 1.1) / scale;
			
			context.font = settings.radiusLabelFont;
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillStyle = settings.color;
			
			context.save();
			
			context.translate(worldPoint.x, worldPoint.y)
			
			for(var i = 0; i < settings.numRadiusLabels; i++)
			{
				var spokeAngle = settings.radiusLabelsStartAngle + (Math.PI * 2) * (i / settings.numRadiusLabels);
				var textAngle = spokeAngle + Math.PI / 2;
				var text = settings.radiusString;
				var width;
				
				if(Math.sin(spokeAngle) > 0)
					textAngle -= Math.PI;
				
				x = Math.cos(spokeAngle) * radius;
				y = Math.sin(spokeAngle) * radius;
				
				context.save();
				
				context.translate(x, y);
				
				context.rotate(textAngle);
				context.scale(1 / scale, 1 / scale);
				
				width = context.measureText(text).width;
				height = width / 2;
				context.clearRect(-width, -height, 2 * width, 2 * height);
				
				context.fillText(settings.radiusString, 0, 0);
				
				context.restore();
			}
			
			context.restore();
		}
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtb2Rlcm4tc3RvcmUtbG9jYXRvci1jaXJjbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBUaGlzIGlzIHRoZSBiYXNlIGNsYXNzIHRoZSBtb2Rlcm4gc3RvcmUgbG9jYXRvciBjaXJjbGUuIDxzdHJvbmc+UGxlYXNlIDxlbT5kbyBub3Q8L2VtPiBjYWxsIHRoaXMgY29uc3RydWN0b3IgZGlyZWN0bHkuIEFsd2F5cyB1c2UgY3JlYXRlSW5zdGFuY2UgcmF0aGVyIHRoYW4gaW5zdGFudGlhdGluZyB0aGlzIGNsYXNzIGRpcmVjdGx5Ljwvc3Ryb25nPiBVc2luZyBjcmVhdGVJbnN0YW5jZSBhbGxvd3MgdGhpcyBjbGFzcyB0byBiZSBleHRlcm5hbGx5IGV4dGVuc2libGUuXHJcblx0ICogQGNsYXNzIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEBwYXJhbSB7aW50fSBtYXBfaWQgVGhlIElEIG9mIHRoZSBtYXAgdGhpcyBjaXJjbGUgYmVsb25ncyB0b1xyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbc2V0dGluZ3NdIFNldHRpbmdzIHRvIHBhc3MgaW50byB0aGlzIGNpcmNsZSwgc3VjaCBhcyBzdHJva2VDb2xvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUgPSBmdW5jdGlvbihtYXBfaWQsIHNldHRpbmdzKSB7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgbWFwO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuaXNQcm9WZXJzaW9uKCkpXHJcblx0XHRcdG1hcCA9IHRoaXMubWFwID0gTVlNQVBbbWFwX2lkXS5tYXA7XHJcblx0XHRlbHNlXHJcblx0XHRcdG1hcCA9IHRoaXMubWFwID0gTVlNQVAubWFwO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcF9pZCA9IG1hcF9pZDtcclxuXHRcdHRoaXMubWFwRWxlbWVudCA9IG1hcC5lbGVtZW50O1xyXG5cdFx0dGhpcy5tYXBTaXplID0ge1xyXG5cdFx0XHR3aWR0aDogICQodGhpcy5tYXBFbGVtZW50KS53aWR0aCgpLFxyXG5cdFx0XHRoZWlnaHQ6ICQodGhpcy5tYXBFbGVtZW50KS5oZWlnaHQoKVxyXG5cdFx0fTtcclxuXHRcdFx0XHJcblx0XHR0aGlzLmluaXRDYW52YXNMYXllcigpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldHRpbmdzID0ge1xyXG5cdFx0XHRjZW50ZXI6IG5ldyBXUEdNWkEuTGF0TG5nKDAsIDApLFxyXG5cdFx0XHRyYWRpdXM6IDEsXHJcblx0XHRcdGNvbG9yOiBcIiM2M0FGRjJcIixcclxuXHRcdFx0XHJcblx0XHRcdHNoYWRvd0NvbG9yOiBcIndoaXRlXCIsXHJcblx0XHRcdHNoYWRvd0JsdXI6IDQsXHJcblx0XHRcdFxyXG5cdFx0XHRjZW50ZXJSaW5nUmFkaXVzOiAxMCxcclxuXHRcdFx0Y2VudGVyUmluZ0xpbmVXaWR0aDogMyxcclxuXHJcblx0XHRcdG51bUlubmVyUmluZ3M6IDksXHJcblx0XHRcdGlubmVyUmluZ0xpbmVXaWR0aDogMSxcclxuXHRcdFx0aW5uZXJSaW5nRmFkZTogdHJ1ZSxcclxuXHRcdFx0XHJcblx0XHRcdG51bU91dGVyUmluZ3M6IDcsXHJcblx0XHRcdFxyXG5cdFx0XHRyaW5nTGluZVdpZHRoOiAxLFxyXG5cdFx0XHRcclxuXHRcdFx0bWFpblJpbmdMaW5lV2lkdGg6IDIsXHJcblx0XHRcdFxyXG5cdFx0XHRudW1TcG9rZXM6IDYsXHJcblx0XHRcdHNwb2tlc1N0YXJ0QW5nbGU6IE1hdGguUEkgLyAyLFxyXG5cdFx0XHRcclxuXHRcdFx0bnVtUmFkaXVzTGFiZWxzOiA2LFxyXG5cdFx0XHRyYWRpdXNMYWJlbHNTdGFydEFuZ2xlOiBNYXRoLlBJIC8gMixcclxuXHRcdFx0cmFkaXVzTGFiZWxGb250OiBcIjEzcHggc2Fucy1zZXJpZlwiLFxyXG5cdFx0XHRcclxuXHRcdFx0dmlzaWJsZTogZmFsc2VcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGlmKHNldHRpbmdzKVxyXG5cdFx0XHR0aGlzLnNldE9wdGlvbnMoc2V0dGluZ3MpO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgY29udHJ1Y3RvciB0byBiZSB1c2VkIGJ5IGNyZWF0ZUluc3RhbmNlLCBkZXBlbmRpbmcgb24gdGhlIHNlbGVjdGVkIG1hcHMgZW5naW5lLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEByZXR1cm4ge2Z1bmN0aW9ufSBUaGUgYXBwcm9wcmlhdGUgY29udHJ1Y3RvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihtYXAsIHNldHRpbmdzKSB7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgPT0gXCJnb29nbGUtbWFwc1wiKVxyXG5cdFx0XHRyZXR1cm4gbmV3IFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUobWFwLCBzZXR0aW5ncyk7XHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiBuZXcgV1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlKG1hcCwgc2V0dGluZ3MpO1xyXG5cdFx0XHJcblx0fTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiB0byBpbml0aWFsaXplIHRoZSBjYW52YXMgbGF5ZXJcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5pbml0Q2FudmFzTGF5ZXIgPSBmdW5jdGlvbigpIHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBIYW5kbGVzIHRoZSBtYXAgdmlld3BvcnQgYmVpbmcgcmVzaXplZFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLm9uUmVzaXplID0gZnVuY3Rpb24oZXZlbnQpIHsgXHJcblx0XHR0aGlzLmRyYXcoKTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFVwZGF0ZXMgYW5kIHJlZHJhd3MgdGhlIGNpcmNsZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLm9uVXBkYXRlID0gZnVuY3Rpb24oZXZlbnQpIHsgXHJcblx0XHR0aGlzLmRyYXcoKTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgb3B0aW9ucyBvbiB0aGUgY2lyY2xlIChmb3IgZXhhbXBsZSwgc3Ryb2tlQ29sb3IpXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgQW4gb2JqZWN0IG9mIG9wdGlvbnMgdG8gaXRlcmF0ZSBvdmVyIGFuZCBzZXQgb24gdGhpcyBjaXJjbGUuXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHRcdGZvcih2YXIgbmFtZSBpbiBvcHRpb25zKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgZnVuY3Rpb25OYW1lID0gXCJzZXRcIiArIG5hbWUuc3Vic3RyKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cigxKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHR5cGVvZiB0aGlzW2Z1bmN0aW9uTmFtZV0gPT0gXCJmdW5jdGlvblwiKVxyXG5cdFx0XHRcdHRoaXNbZnVuY3Rpb25OYW1lXShvcHRpb25zW25hbWVdKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHRoaXMuc2V0dGluZ3NbbmFtZV0gPSBvcHRpb25zW25hbWVdO1xyXG5cdFx0fVxyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgcmVzb2x1dGlvbiBzY2FsZSBmb3IgZHJhd2luZyBvbiB0aGUgY2lyY2xlcyBjYW52YXMuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHJldHVybiB7bnVtYmVyfSBUaGUgZGV2aWNlIHBpeGVsIHJhdGlvLCBvciAxIHdoZXJlIHRoYXQgaXMgbm90IHByZXNlbnQuXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0UmVzb2x1dGlvblNjYWxlID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhlIGNlbnRlciBvZiB0aGUgY2lyY2xlXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHJldHVybiB7b2JqZWN0fSBBIGxhdExuZyBsaXRlcmFsXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0Q2VudGVyID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5nZXRQb3NpdGlvbigpO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGVcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5MYXRMbmd8b2JqZWN0fSBBIExhdExuZyBsaXRlcmFsIG9yIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0dGhpcy5zZXRQb3NpdGlvbih2YWx1ZSk7XHJcblx0fTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEByZXR1cm4ge29iamVjdH0gVGhlIGNlbnRlciBhcyBhIExhdExuZyBsaXRlcmFsXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHRcdHJldHVybiB0aGlzLnNldHRpbmdzLmNlbnRlcjtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFsaWFzIGZvciBzZXRDZW50ZXJcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHBvc2l0aW9uKSB7XHJcblx0XHR0aGlzLnNldHRpbmdzLmNlbnRlciA9IHBvc2l0aW9uO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgY2lyY2xlIHJhZGl1cywgaW4ga2lsb21ldGVyc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEByZXR1cm4ge251bWJlcn0gVGhlIGNpcmNsZXMgcmFkaXVzLCBpbiBraWxvbWV0ZXJzXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0UmFkaXVzID0gZnVuY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zZXR0aW5ncy5yYWRpdXM7XHJcblx0fTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSBjaXJjbGVzIHJhZGl1cywgaW4ga2lsb21ldGVyc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgVGhlIHJhZGl1cywgaW4ga2lsb21ldGVyc1xyXG5cdCAqIEB0aHJvd3MgSW52YWxpZCByYWRpdXNcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRSYWRpdXMgPSBmdW5jdGlvbihyYWRpdXMpIHtcclxuXHRcdFxyXG5cdFx0aWYoaXNOYU4ocmFkaXVzKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByYWRpdXNcIik7XHJcblx0XHRcclxuXHRcdHRoaXMuc2V0dGluZ3MucmFkaXVzID0gcmFkaXVzO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgY2lyY2xlXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHJldHVybiB7Ym9vbH0gV2hldGhlciBvciBub3QgdGhlIGNpcmNsZSBpcyB2aXNpYmxlXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0VmlzaWJsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2V0dGluZ3MudmlzaWJsZTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGNpcmNsZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqIEBwYXJhbSB7Ym9vbH0gdmlzaWJsZSBXaGV0aGVyIHRoZSBjaXJjbGUgc2hvdWxkIGJlIHZpc2libGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5zZXRWaXNpYmxlID0gZnVuY3Rpb24odmlzaWJsZSkge1xyXG5cdFx0dGhpcy5zZXR0aW5ncy52aXNpYmxlID0gdmlzaWJsZTtcclxuXHR9O1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFic3RyYWN0IGZ1bmN0aW9uIHRvIGdldCB0aGUgdHJhbnNmb3JtZWQgY2lyY2xlIHJhZGl1cyAoc2VlIHN1YmNsYXNzZXMpXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGttIFRoZSBpbnB1dCByYWRpdXMsIGluIGtpbG9tZXRlcnNcclxuXHQgKiBAdGhyb3dzIEFic3RyYWN0IGZ1bmN0aW9uIGNhbGxlZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmdldFRyYW5zZm9ybWVkUmFkaXVzID0gZnVuY3Rpb24oa20pXHJcblx0e1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQWJzdHJhY3QgZnVuY3Rpb24gY2FsbGVkXCIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiB0byBzZXQgdGhlIGNhbnZhcyBjb250ZXh0XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIGNvbnRleHQgdHlwZVxyXG5cdCAqIEB0aHJvd3MgQWJzdHJhY3QgZnVuY3Rpb24gY2FsbGVkXHJcblx0ICovXHJcblx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKHR5cGUpXHJcblx0e1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQWJzdHJhY3QgZnVuY3Rpb24gY2FsbGVkXCIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBYnN0cmFjdCBmdW5jdGlvbiB0byBnZXQgdGhlIGNhbnZhcyBkaW1lbnNpb25zXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlXHJcblx0ICogQHRocm93cyBBYnN0cmFjdCBmdW5jdGlvbiBjYWxsZWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yQ2lyY2xlLnByb3RvdHlwZS5nZXRDYW52YXNEaW1lbnNpb25zID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRocm93IG5ldyBFcnJvcihcIkFic3RyYWN0IGZ1bmN0aW9uIGNhbGxlZFwiKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogVmFsaWRhdGVzIHRoZSBjaXJjbGUgc2V0dGluZ3MgYW5kIGNvcnJlY3RzIHRoZW0gd2hlcmUgdGhleSBhcmUgaW52YWxpZFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLnZhbGlkYXRlU2V0dGluZ3MgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoIVdQR01aQS5pc0hleENvbG9yU3RyaW5nKHRoaXMuc2V0dGluZ3MuY29sb3IpKVxyXG5cdFx0XHR0aGlzLnNldHRpbmdzLmNvbG9yID0gXCIjNjNBRkYyXCI7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIERyYXdzIHRoZSBjaXJjbGUgdG8gdGhlIGNhbnZhc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JDaXJjbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuXHRcdFxyXG5cdFx0dGhpcy52YWxpZGF0ZVNldHRpbmdzKCk7XHJcblx0XHRcclxuXHRcdHZhciBzZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3M7XHJcblx0XHR2YXIgY2FudmFzRGltZW5zaW9ucyA9IHRoaXMuZ2V0Q2FudmFzRGltZW5zaW9ucygpO1xyXG5cdFx0XHJcbiAgICAgICAgdmFyIGNhbnZhc1dpZHRoID0gY2FudmFzRGltZW5zaW9ucy53aWR0aDtcclxuICAgICAgICB2YXIgY2FudmFzSGVpZ2h0ID0gY2FudmFzRGltZW5zaW9ucy5oZWlnaHQ7XHJcblx0XHRcclxuXHRcdHZhciBtYXAgPSB0aGlzLm1hcDtcclxuXHRcdHZhciByZXNvbHV0aW9uU2NhbGUgPSB0aGlzLmdldFJlc29sdXRpb25TY2FsZSgpO1xyXG5cdFx0XHJcblx0XHRjb250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCk7XHJcblxyXG5cdFx0aWYoIXNldHRpbmdzLnZpc2libGUpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0Y29udGV4dC5zaGFkb3dDb2xvciA9IHNldHRpbmdzLnNoYWRvd0NvbG9yO1xyXG5cdFx0Y29udGV4dC5zaGFkb3dCbHVyID0gc2V0dGluZ3Muc2hhZG93Qmx1cjtcclxuXHRcdFxyXG5cdFx0Ly8gTkI6IDIwMTgvMDIvMTMgLSBMZWZ0IHRoaXMgaGVyZSBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIGNhbGlicmF0ZWQgbW9yZSBhY2N1cmF0ZWx5XHJcblx0XHQvKmlmKCF0aGlzLnRlc3RDaXJjbGUpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudGVzdENpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoe1xyXG5cdFx0XHRcdHN0cm9rZUNvbG9yOiBcIiNmZjAwMDBcIixcclxuXHRcdFx0XHRzdHJva2VPcGFjaXR5OiAwLjUsXHJcblx0XHRcdFx0c3Ryb2tlV2VpZ2h0OiAzLFxyXG5cdFx0XHRcdG1hcDogdGhpcy5tYXAsXHJcblx0XHRcdFx0Y2VudGVyOiB0aGlzLnNldHRpbmdzLmNlbnRlclxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dGhpcy50ZXN0Q2lyY2xlLnNldENlbnRlcihzZXR0aW5ncy5jZW50ZXIpO1xyXG5cdFx0dGhpcy50ZXN0Q2lyY2xlLnNldFJhZGl1cyhzZXR0aW5ncy5yYWRpdXMgKiAxMDAwKTsqL1xyXG5cdFx0XHJcbiAgICAgICAgLy8gUmVzZXQgdHJhbnNmb3JtXHJcbiAgICAgICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgMCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHNjYWxlID0gdGhpcy5nZXRTY2FsZSgpO1xyXG4gICAgICAgIGNvbnRleHQuc2NhbGUoc2NhbGUsIHNjYWxlKTtcclxuXHJcblx0XHQvLyBUcmFuc2xhdGUgYnkgd29ybGQgb3JpZ2luXHJcblx0XHR2YXIgb2Zmc2V0ID0gdGhpcy5nZXRXb3JsZE9yaWdpbk9mZnNldCgpO1xyXG5cdFx0Y29udGV4dC50cmFuc2xhdGUob2Zmc2V0LngsIG9mZnNldC55KTtcclxuXHJcbiAgICAgICAgLy8gR2V0IGNlbnRlciBhbmQgcHJvamVjdCB0byBwaXhlbCBzcGFjZVxyXG5cdFx0dmFyIGNlbnRlciA9IG5ldyBXUEdNWkEuTGF0TG5nKHRoaXMuc2V0dGluZ3MuY2VudGVyKTtcclxuXHRcdHZhciB3b3JsZFBvaW50ID0gdGhpcy5nZXRDZW50ZXJQaXhlbHMoKTtcclxuXHRcdFxyXG5cdFx0dmFyIHJnYmEgPSBXUEdNWkEuaGV4VG9SZ2JhKHNldHRpbmdzLmNvbG9yKTtcclxuXHRcdHZhciByaW5nU3BhY2luZyA9IHRoaXMuZ2V0VHJhbnNmb3JtZWRSYWRpdXMoc2V0dGluZ3MucmFkaXVzKSAvIChzZXR0aW5ncy5udW1Jbm5lclJpbmdzICsgMSk7XHJcblx0XHRcclxuXHRcdC8vIFRPRE86IEltcGxlbWVudCBncmFkaWVudHMgZm9yIGNvbG9yIGFuZCBvcGFjaXR5XHJcblx0XHRcclxuXHRcdC8vIEluc2lkZSBjaXJjbGUgKGZpeGVkPylcclxuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gc2V0dGluZ3MuY29sb3I7XHJcblx0XHRjb250ZXh0LmxpbmVXaWR0aCA9ICgxIC8gc2NhbGUpICogc2V0dGluZ3MuY2VudGVyUmluZ0xpbmVXaWR0aDtcclxuXHRcdFxyXG5cdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcclxuXHRcdGNvbnRleHQuYXJjKFxyXG5cdFx0XHR3b3JsZFBvaW50LngsIFxyXG5cdFx0XHR3b3JsZFBvaW50LnksIFxyXG5cdFx0XHR0aGlzLmdldFRyYW5zZm9ybWVkUmFkaXVzKHNldHRpbmdzLmNlbnRlclJpbmdSYWRpdXMpIC8gc2NhbGUsIDAsIDIgKiBNYXRoLlBJXHJcblx0XHQpO1xyXG5cdFx0Y29udGV4dC5zdHJva2UoKTtcclxuXHRcdGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblx0XHRcclxuXHRcdC8vIFNwb2tlc1xyXG5cdFx0dmFyIHJhZGl1cyA9IHRoaXMuZ2V0VHJhbnNmb3JtZWRSYWRpdXMoc2V0dGluZ3MucmFkaXVzKSArIChyaW5nU3BhY2luZyAqIHNldHRpbmdzLm51bU91dGVyUmluZ3MpICsgMTtcclxuXHRcdHZhciBncmFkID0gY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudCgwLCAwLCAwLCAwLCAwLCByYWRpdXMpO1xyXG5cdFx0dmFyIHJnYmEgPSBXUEdNWkEuaGV4VG9SZ2JhKHNldHRpbmdzLmNvbG9yKTtcclxuXHRcdHZhciBzdGFydCA9IFdQR01aQS5yZ2JhVG9TdHJpbmcocmdiYSksIGVuZDtcclxuXHRcdHZhciBzcG9rZUFuZ2xlO1xyXG5cdFx0XHJcblx0XHRyZ2JhLmEgPSAwO1xyXG5cdFx0ZW5kID0gV1BHTVpBLnJnYmFUb1N0cmluZyhyZ2JhKTtcclxuXHRcdFxyXG5cdFx0Z3JhZC5hZGRDb2xvclN0b3AoMCwgc3RhcnQpO1xyXG5cdFx0Z3JhZC5hZGRDb2xvclN0b3AoMSwgZW5kKTtcclxuXHRcdFxyXG5cdFx0Y29udGV4dC5zYXZlKCk7XHJcblx0XHRcclxuXHRcdGNvbnRleHQudHJhbnNsYXRlKHdvcmxkUG9pbnQueCwgd29ybGRQb2ludC55KTtcclxuXHRcdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBncmFkO1xyXG5cdFx0Y29udGV4dC5saW5lV2lkdGggPSAyIC8gc2NhbGU7XHJcblx0XHRcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzZXR0aW5ncy5udW1TcG9rZXM7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0c3Bva2VBbmdsZSA9IHNldHRpbmdzLnNwb2tlc1N0YXJ0QW5nbGUgKyAoTWF0aC5QSSAqIDIpICogKGkgLyBzZXR0aW5ncy5udW1TcG9rZXMpO1xyXG5cdFx0XHRcclxuXHRcdFx0eCA9IE1hdGguY29zKHNwb2tlQW5nbGUpICogcmFkaXVzO1xyXG5cdFx0XHR5ID0gTWF0aC5zaW4oc3Bva2VBbmdsZSkgKiByYWRpdXM7XHJcblx0XHRcdFxyXG5cdFx0XHRjb250ZXh0LnNldExpbmVEYXNoKFsyIC8gc2NhbGUsIDE1IC8gc2NhbGVdKTtcclxuXHRcdFx0XHJcblx0XHRcdGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0XHRcdGNvbnRleHQubW92ZVRvKDAsIDApO1xyXG5cdFx0XHRjb250ZXh0LmxpbmVUbyh4LCB5KTtcclxuXHRcdFx0Y29udGV4dC5zdHJva2UoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Y29udGV4dC5zZXRMaW5lRGFzaChbXSk7XHJcblx0XHRcclxuXHRcdGNvbnRleHQucmVzdG9yZSgpO1xyXG5cdFx0XHJcblx0XHQvLyBJbm5lciByaW5nbGV0c1xyXG5cdFx0Y29udGV4dC5saW5lV2lkdGggPSAoMSAvIHNjYWxlKSAqIHNldHRpbmdzLmlubmVyUmluZ0xpbmVXaWR0aDtcclxuXHRcdFxyXG5cdFx0Zm9yKHZhciBpID0gMTsgaSA8PSBzZXR0aW5ncy5udW1Jbm5lclJpbmdzOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdHZhciByYWRpdXMgPSBpICogcmluZ1NwYWNpbmc7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihzZXR0aW5ncy5pbm5lclJpbmdGYWRlKVxyXG5cdFx0XHRcdHJnYmEuYSA9IDEgLSAoaSAtIDEpIC8gc2V0dGluZ3MubnVtSW5uZXJSaW5ncztcclxuXHRcdFx0XHJcblx0XHRcdGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBXUEdNWkEucmdiYVRvU3RyaW5nKHJnYmEpO1xyXG5cdFx0XHRcclxuXHRcdFx0Y29udGV4dC5iZWdpblBhdGgoKTtcclxuXHRcdFx0Y29udGV4dC5hcmMod29ybGRQb2ludC54LCB3b3JsZFBvaW50LnksIHJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG5cdFx0XHRjb250ZXh0LnN0cm9rZSgpO1xyXG5cdFx0XHRjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBNYWluIGNpcmNsZVxyXG5cdFx0Y29udGV4dC5zdHJva2VTdHlsZSA9IHNldHRpbmdzLmNvbG9yO1xyXG5cdFx0Y29udGV4dC5saW5lV2lkdGggPSAoMSAvIHNjYWxlKSAqIHNldHRpbmdzLmNlbnRlclJpbmdMaW5lV2lkdGg7XHJcblx0XHRcclxuXHRcdGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcblx0XHRjb250ZXh0LmFyYyh3b3JsZFBvaW50LngsIHdvcmxkUG9pbnQueSwgdGhpcy5nZXRUcmFuc2Zvcm1lZFJhZGl1cyhzZXR0aW5ncy5yYWRpdXMpLCAwLCAyICogTWF0aC5QSSk7XHJcblx0XHRjb250ZXh0LnN0cm9rZSgpO1xyXG5cdFx0Y29udGV4dC5jbG9zZVBhdGgoKTtcclxuXHRcdFxyXG5cdFx0Ly8gT3V0ZXIgcmluZ2xldHNcclxuXHRcdHZhciByYWRpdXMgPSByYWRpdXMgKyByaW5nU3BhY2luZztcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzZXR0aW5ncy5udW1PdXRlclJpbmdzOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKHNldHRpbmdzLmlubmVyUmluZ0ZhZGUpXHJcblx0XHRcdFx0cmdiYS5hID0gMSAtIGkgLyBzZXR0aW5ncy5udW1PdXRlclJpbmdzO1xyXG5cdFx0XHRcclxuXHRcdFx0Y29udGV4dC5zdHJva2VTdHlsZSA9IFdQR01aQS5yZ2JhVG9TdHJpbmcocmdiYSk7XHJcblx0XHRcdFxyXG5cdFx0XHRjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG5cdFx0XHRjb250ZXh0LmFyYyh3b3JsZFBvaW50LngsIHdvcmxkUG9pbnQueSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XHJcblx0XHRcdGNvbnRleHQuc3Ryb2tlKCk7XHJcblx0XHRcdGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcblx0XHRcclxuXHRcdFx0cmFkaXVzICs9IHJpbmdTcGFjaW5nO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBUZXh0XHJcblx0XHRpZihzZXR0aW5ncy5udW1SYWRpdXNMYWJlbHMgPiAwKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgbTtcclxuXHRcdFx0dmFyIHJhZGl1cyA9IHRoaXMuZ2V0VHJhbnNmb3JtZWRSYWRpdXMoc2V0dGluZ3MucmFkaXVzKTtcclxuXHRcdFx0dmFyIGNsaXBSYWRpdXMgPSAoMTIgKiAxLjEpIC8gc2NhbGU7XHJcblx0XHRcdHZhciB4LCB5O1xyXG5cdFx0XHRcclxuXHRcdFx0aWYobSA9IHNldHRpbmdzLnJhZGl1c0xhYmVsRm9udC5tYXRjaCgvKFxcZCspcHgvKSlcclxuXHRcdFx0XHRjbGlwUmFkaXVzID0gKHBhcnNlSW50KG1bMV0pIC8gMiAqIDEuMSkgLyBzY2FsZTtcclxuXHRcdFx0XHJcblx0XHRcdGNvbnRleHQuZm9udCA9IHNldHRpbmdzLnJhZGl1c0xhYmVsRm9udDtcclxuXHRcdFx0Y29udGV4dC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG5cdFx0XHRjb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XHJcblx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gc2V0dGluZ3MuY29sb3I7XHJcblx0XHRcdFxyXG5cdFx0XHRjb250ZXh0LnNhdmUoKTtcclxuXHRcdFx0XHJcblx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHdvcmxkUG9pbnQueCwgd29ybGRQb2ludC55KVxyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHNldHRpbmdzLm51bVJhZGl1c0xhYmVsczsgaSsrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHNwb2tlQW5nbGUgPSBzZXR0aW5ncy5yYWRpdXNMYWJlbHNTdGFydEFuZ2xlICsgKE1hdGguUEkgKiAyKSAqIChpIC8gc2V0dGluZ3MubnVtUmFkaXVzTGFiZWxzKTtcclxuXHRcdFx0XHR2YXIgdGV4dEFuZ2xlID0gc3Bva2VBbmdsZSArIE1hdGguUEkgLyAyO1xyXG5cdFx0XHRcdHZhciB0ZXh0ID0gc2V0dGluZ3MucmFkaXVzU3RyaW5nO1xyXG5cdFx0XHRcdHZhciB3aWR0aDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihNYXRoLnNpbihzcG9rZUFuZ2xlKSA+IDApXHJcblx0XHRcdFx0XHR0ZXh0QW5nbGUgLT0gTWF0aC5QSTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR4ID0gTWF0aC5jb3Moc3Bva2VBbmdsZSkgKiByYWRpdXM7XHJcblx0XHRcdFx0eSA9IE1hdGguc2luKHNwb2tlQW5nbGUpICogcmFkaXVzO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnRleHQuc2F2ZSgpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnRleHQudHJhbnNsYXRlKHgsIHkpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnRleHQucm90YXRlKHRleHRBbmdsZSk7XHJcblx0XHRcdFx0Y29udGV4dC5zY2FsZSgxIC8gc2NhbGUsIDEgLyBzY2FsZSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0d2lkdGggPSBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpLndpZHRoO1xyXG5cdFx0XHRcdGhlaWdodCA9IHdpZHRoIC8gMjtcclxuXHRcdFx0XHRjb250ZXh0LmNsZWFyUmVjdCgtd2lkdGgsIC1oZWlnaHQsIDIgKiB3aWR0aCwgMiAqIGhlaWdodCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Y29udGV4dC5maWxsVGV4dChzZXR0aW5ncy5yYWRpdXNTdHJpbmcsIDAsIDApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnRleHQucmVzdG9yZSgpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRjb250ZXh0LnJlc3RvcmUoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibW9kZXJuLXN0b3JlLWxvY2F0b3ItY2lyY2xlLmpzIn0=
