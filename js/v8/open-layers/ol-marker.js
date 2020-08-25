/**
 * @namespace WPGMZA
 * @module OLMarker
 * @requires WPGMZA.Marker
 * @gulp-requires ../marker.js
 * @pro-requires WPGMZA.ProMarker
 * @gulp-pro-requires pro-marker.js
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.OLMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);

		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT)
		{
			var img = $("<img alt=''/>")[0];
			img.onload = function(event) {
				self.updateElementHeight();
				if(self.map)
					self.map.olMap.updateSize();
			}
			img.src = WPGMZA.defaultMarkerIcon;
			
			this.element = $("<div class='ol-marker'></div>")[0];
			$(this.element).attr('title', this.title);
			this.element.appendChild(img);
			
			this.element.wpgmzaMarker = this;
			
			$(this.element).on("mouseover", function(event) {
				self.dispatchEvent("mouseover");
			});
			
			this.overlay = new ol.Overlay({
				element: this.element,
				position: origin,
				positioning: "bottom-center",
				stopEvent: false
			});
			this.overlay.setPosition(origin);
			
			if(this.animation)
				this.setAnimation(this.animation);
			
			this.setLabel(this.settings.label);
			
			if(row)
			{
				if(row.draggable)
					this.setDraggable(true);
			}
			
			this.rebindClickListener();
		}
		else if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			this.feature = new ol.Feature({
				geometry: new ol.geom.Point(origin)
			});
			
			this.feature.setStyle(this.getVectorLayerStyle());
			this.feature.wpgmzaMarker = this;
		}
		else
			throw new Error("Invalid marker render mode");
		
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	
	WPGMZA.OLMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.OLMarker.prototype.constructor = WPGMZA.OLMarker;
	
	WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT		= "element";
	WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER		= "vector";	// NB: This feature is experimental
	
	WPGMZA.OLMarker.renderMode = WPGMZA.OLMarker.RENDER_MODE_HTML_ELEMENT;
	
	if(WPGMZA.settings.engine == "open-layers" && WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
	{
		WPGMZA.OLMarker.defaultVectorLayerStyle = new ol.style.Style({
			image: new ol.style.Icon({
				anchor: [0.5, 1],
				src: WPGMZA.defaultMarkerIcon
			})
		});
		
		WPGMZA.OLMarker.hiddenVectorLayerStyle = new ol.style.Style({});
	}
	
	WPGMZA.OLMarker.prototype.getVectorLayerStyle = function()
	{
		if(this.vectorLayerStyle)
			return this.vectorLayerStyle;
		
		return WPGMZA.OLMarker.defaultVectorLayerStyle;
	}
	
	WPGMZA.OLMarker.prototype.updateElementHeight = function(height, calledOnFocus)
	{
		var self = this;
		
		if(!height)
			height = $(this.element).find("img").height();
		
		if(height == 0 && !calledOnFocus)
		{
			$(window).one("focus", function(event) {
				self.updateElementHeight(false, true);
			});
		}
		
		$(this.element).css({height: height + "px"});
	}
	
	WPGMZA.OLMarker.prototype.addLabel = function()
	{
		this.setLabel(this.getLabelText());
	}
	
	WPGMZA.OLMarker.prototype.setLabel = function(label)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker labels are not currently supported in Vector Layer rendering mode");
			return;
		}
		
		if(!label)
		{
			if(this.label)
				$(this.element).find(".ol-marker-label").remove();
			
			return;
		}
		
		if(!this.label)
		{
			this.label = $("<div class='ol-marker-label'/>");
			$(this.element).append(this.label);
		}
		
		this.label.html(label);
	}
	
	WPGMZA.OLMarker.prototype.getVisible = function(visible)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			
		}
		else
			return this.overlay.getElement().style.display != "none";
	}
	
	WPGMZA.OLMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			if(visible)
			{
				var style = this.getVectorLayerStyle();
				this.feature.setStyle(style);
			}
			else
				this.feature.setStyle(null);
			
			/*var source = this.map.markerLayer.getSource();
			
			/*if(this.featureInSource == visible)
				return;
			
			if(visible)
				source.addFeature(this.feature);
			else
				source.removeFeature(this.feature);
			
			this.featureInSource = visible;*/
		}
		else
			this.overlay.getElement().style.display = (visible ? "block" : "none");
	}
	
	WPGMZA.OLMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
	
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
			this.feature.setGeometry(new ol.geom.Point(origin));
		else
			this.overlay.setPosition(origin);
	}
	
	WPGMZA.OLMarker.prototype.updateOffset = function(x, y)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker offset is not currently supported in Vector Layer rendering mode");
			return;
		}
		
		var x = this._offset.x;
		var y = this._offset.y;
		
		this.element.style.position = "relative";
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
	}
	
	WPGMZA.OLMarker.prototype.setAnimation = function(anim)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker animation is not currently supported in Vector Layer rendering mode");
			return;
		}
		
		Parent.prototype.setAnimation.call(this, anim);
		
		switch(anim)
		{
			case WPGMZA.Marker.ANIMATION_NONE:
				$(this.element).removeAttr("data-anim");
				break;
			
			case WPGMZA.Marker.ANIMATION_BOUNCE:
				$(this.element).attr("data-anim", "bounce");
				break;
			
			case WPGMZA.Marker.ANIMATION_DROP:
				$(this.element).attr("data-anim", "drop");
				break;
		}
	}
	
	WPGMZA.OLMarker.prototype.setDraggable = function(draggable)
	{
		var self = this;
		
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker dragging is not currently supported in Vector Layer rendering mode");
			return;
		}
		
		if(draggable)
		{
			var options = {
				disabled: false
			};
			
			if(!this.jQueryDraggableInitialized)
			{
				options.start = function(event) {
					self.onDragStart(event);
				}
				
				options.stop = function(event) {
					self.onDragEnd(event);
				};
			}
			
			$(this.element).draggable(options);
			this.jQueryDraggableInitialized = true;
			
			this.rebindClickListener();
		}
		else
			$(this.element).draggable({disabled: true});
	}
	
	WPGMZA.OLMarker.prototype.setOpacity = function(opacity)
	{
		if(WPGMZA.OLMarker.renderMode == WPGMZA.OLMarker.RENDER_MODE_VECTOR_LAYER)
		{
			console.warn("Marker opacity is not currently supported in Vector Layer rendering mode");
			return;
		}
		
		$(this.element).css({opacity: opacity});
	}
	
	WPGMZA.OLMarker.prototype.onDragStart = function(event)
	{
		this.isBeingDragged = true;
		
		this.map.olMap.getInteractions().forEach(function(interaction) {
			
			if(interaction instanceof ol.interaction.DragPan)
				interaction.setActive(false);
			
		});
	}
	
	WPGMZA.OLMarker.prototype.onDragEnd = function(event)
	{
		var self = this;
		var offset = {
			top:	parseFloat( $(this.element).css("top").match(/-?\d+/)[0] ),
			left:	parseFloat( $(this.element).css("left").match(/-?\d+/)[0] )
		};
		
		$(this.element).css({
			top: 	"0px",
			left: 	"0px"
		});
		
		var currentLatLng 		= this.getPosition();
		var pixelsBeforeDrag 	= this.map.latLngToPixels(currentLatLng);
		var pixelsAfterDrag		= {
			x: pixelsBeforeDrag.x + offset.left,
			y: pixelsBeforeDrag.y + offset.top
		};
		var latLngAfterDrag		= this.map.pixelsToLatLng(pixelsAfterDrag);
		
		this.setPosition(latLngAfterDrag);
		
		this.isBeingDragged = false;
		this.trigger({type: "dragend", latLng: latLngAfterDrag});
		
		// NB: "yes" represents disabled
		if(this.map.settings.wpgmza_settings_map_draggable != "yes")
			this.map.olMap.getInteractions().forEach(function(interaction) {
				
				if(interaction instanceof ol.interaction.DragPan)
					interaction.setActive(true);
				
			});
	}
	
	WPGMZA.OLMarker.prototype.onElementClick = function(event)
	{
		var self = event.currentTarget.wpgmzaMarker;
		
		if(self.isBeingDragged)
			return; // Don't dispatch click event after a drag
		
		self.dispatchEvent("click");
		self.dispatchEvent("select");
	}
	
	/**
	 * Binds / rebinds the click listener. This must be bound after draggable is initialized,
	 * this solves the click listener firing before dragend
	 */
	WPGMZA.OLMarker.prototype.rebindClickListener = function()
	{
		$(this.element).off("click", this.onElementClick);
		$(this.element).on("click", this.onElementClick);
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1tYXJrZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgT0xNYXJrZXJcclxuICogQHJlcXVpcmVzIFdQR01aQS5NYXJrZXJcclxuICogQGd1bHAtcmVxdWlyZXMgLi4vbWFya2VyLmpzXHJcbiAqIEBwcm8tcmVxdWlyZXMgV1BHTVpBLlByb01hcmtlclxyXG4gKiBAZ3VscC1wcm8tcmVxdWlyZXMgcHJvLW1hcmtlci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHR2YXIgUGFyZW50O1xyXG5cdFxyXG5cdFdQR01aQS5PTE1hcmtlciA9IGZ1bmN0aW9uKHJvdylcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFBhcmVudC5jYWxsKHRoaXMsIHJvdyk7XHJcblxyXG5cdFx0dmFyIG9yaWdpbiA9IG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdHBhcnNlRmxvYXQodGhpcy5sbmcpLFxyXG5cdFx0XHRwYXJzZUZsb2F0KHRoaXMubGF0KVxyXG5cdFx0XSk7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9IVE1MX0VMRU1FTlQpXHJcblx0XHR7XHJcblx0XHRcdHZhciBpbWcgPSAkKFwiPGltZyBhbHQ9JycvPlwiKVswXTtcclxuXHRcdFx0aW1nLm9ubG9hZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0c2VsZi51cGRhdGVFbGVtZW50SGVpZ2h0KCk7XHJcblx0XHRcdFx0aWYoc2VsZi5tYXApXHJcblx0XHRcdFx0XHRzZWxmLm1hcC5vbE1hcC51cGRhdGVTaXplKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0aW1nLnNyYyA9IFdQR01aQS5kZWZhdWx0TWFya2VySWNvbjtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZWxlbWVudCA9ICQoXCI8ZGl2IGNsYXNzPSdvbC1tYXJrZXInPjwvZGl2PlwiKVswXTtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLmF0dHIoJ3RpdGxlJywgdGhpcy50aXRsZSk7XHJcblx0XHRcdHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChpbWcpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5lbGVtZW50LndwZ216YU1hcmtlciA9IHRoaXM7XHJcblx0XHRcdFxyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJtb3VzZW92ZXJcIik7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5vdmVybGF5ID0gbmV3IG9sLk92ZXJsYXkoe1xyXG5cdFx0XHRcdGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcclxuXHRcdFx0XHRwb3NpdGlvbjogb3JpZ2luLFxyXG5cdFx0XHRcdHBvc2l0aW9uaW5nOiBcImJvdHRvbS1jZW50ZXJcIixcclxuXHRcdFx0XHRzdG9wRXZlbnQ6IGZhbHNlXHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLm92ZXJsYXkuc2V0UG9zaXRpb24ob3JpZ2luKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHRoaXMuYW5pbWF0aW9uKVxyXG5cdFx0XHRcdHRoaXMuc2V0QW5pbWF0aW9uKHRoaXMuYW5pbWF0aW9uKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc2V0TGFiZWwodGhpcy5zZXR0aW5ncy5sYWJlbCk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihyb3cpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZihyb3cuZHJhZ2dhYmxlKVxyXG5cdFx0XHRcdFx0dGhpcy5zZXREcmFnZ2FibGUodHJ1ZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMucmViaW5kQ2xpY2tMaXN0ZW5lcigpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmZlYXR1cmUgPSBuZXcgb2wuRmVhdHVyZSh7XHJcblx0XHRcdFx0Z2VvbWV0cnk6IG5ldyBvbC5nZW9tLlBvaW50KG9yaWdpbilcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmZlYXR1cmUuc2V0U3R5bGUodGhpcy5nZXRWZWN0b3JMYXllclN0eWxlKCkpO1xyXG5cdFx0XHR0aGlzLmZlYXR1cmUud3BnbXphTWFya2VyID0gdGhpcztcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtYXJrZXIgcmVuZGVyIG1vZGVcIik7XHJcblx0XHRcclxuXHRcdHRoaXMudHJpZ2dlcihcImluaXRcIik7XHJcblx0fVxyXG5cdFxyXG5cdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9NYXJrZXI7XHJcblx0ZWxzZVxyXG5cdFx0UGFyZW50ID0gV1BHTVpBLk1hcmtlcjtcclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQYXJlbnQucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk9MTWFya2VyO1xyXG5cdFxyXG5cdFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9IVE1MX0VMRU1FTlRcdFx0PSBcImVsZW1lbnRcIjtcclxuXHRXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSXHRcdD0gXCJ2ZWN0b3JcIjtcdC8vIE5COiBUaGlzIGZlYXR1cmUgaXMgZXhwZXJpbWVudGFsXHJcblx0XHJcblx0V1BHTVpBLk9MTWFya2VyLnJlbmRlck1vZGUgPSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfSFRNTF9FTEVNRU5UO1xyXG5cdFxyXG5cdGlmKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgPT0gXCJvcGVuLWxheWVyc1wiICYmIFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9WRUNUT1JfTEFZRVIpXHJcblx0e1xyXG5cdFx0V1BHTVpBLk9MTWFya2VyLmRlZmF1bHRWZWN0b3JMYXllclN0eWxlID0gbmV3IG9sLnN0eWxlLlN0eWxlKHtcclxuXHRcdFx0aW1hZ2U6IG5ldyBvbC5zdHlsZS5JY29uKHtcclxuXHRcdFx0XHRhbmNob3I6IFswLjUsIDFdLFxyXG5cdFx0XHRcdHNyYzogV1BHTVpBLmRlZmF1bHRNYXJrZXJJY29uXHJcblx0XHRcdH0pXHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0V1BHTVpBLk9MTWFya2VyLmhpZGRlblZlY3RvckxheWVyU3R5bGUgPSBuZXcgb2wuc3R5bGUuU3R5bGUoe30pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLmdldFZlY3RvckxheWVyU3R5bGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYodGhpcy52ZWN0b3JMYXllclN0eWxlKVxyXG5cdFx0XHRyZXR1cm4gdGhpcy52ZWN0b3JMYXllclN0eWxlO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gV1BHTVpBLk9MTWFya2VyLmRlZmF1bHRWZWN0b3JMYXllclN0eWxlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLnVwZGF0ZUVsZW1lbnRIZWlnaHQgPSBmdW5jdGlvbihoZWlnaHQsIGNhbGxlZE9uRm9jdXMpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRpZighaGVpZ2h0KVxyXG5cdFx0XHRoZWlnaHQgPSAkKHRoaXMuZWxlbWVudCkuZmluZChcImltZ1wiKS5oZWlnaHQoKTtcclxuXHRcdFxyXG5cdFx0aWYoaGVpZ2h0ID09IDAgJiYgIWNhbGxlZE9uRm9jdXMpXHJcblx0XHR7XHJcblx0XHRcdCQod2luZG93KS5vbmUoXCJmb2N1c1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdHNlbGYudXBkYXRlRWxlbWVudEhlaWdodChmYWxzZSwgdHJ1ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuY3NzKHtoZWlnaHQ6IGhlaWdodCArIFwicHhcIn0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLmFkZExhYmVsID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRoaXMuc2V0TGFiZWwodGhpcy5nZXRMYWJlbFRleHQoKSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5PTE1hcmtlci5wcm90b3R5cGUuc2V0TGFiZWwgPSBmdW5jdGlvbihsYWJlbClcclxuXHR7XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRjb25zb2xlLndhcm4oXCJNYXJrZXIgbGFiZWxzIGFyZSBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiBWZWN0b3IgTGF5ZXIgcmVuZGVyaW5nIG1vZGVcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIWxhYmVsKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0aGlzLmxhYmVsKVxyXG5cdFx0XHRcdCQodGhpcy5lbGVtZW50KS5maW5kKFwiLm9sLW1hcmtlci1sYWJlbFwiKS5yZW1vdmUoKTtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIXRoaXMubGFiZWwpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubGFiZWwgPSAkKFwiPGRpdiBjbGFzcz0nb2wtbWFya2VyLWxhYmVsJy8+XCIpO1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkuYXBwZW5kKHRoaXMubGFiZWwpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmxhYmVsLmh0bWwobGFiZWwpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLmdldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdGlmKFdQR01aQS5PTE1hcmtlci5yZW5kZXJNb2RlID09IFdQR01aQS5PTE1hcmtlci5SRU5ERVJfTU9ERV9WRUNUT1JfTEFZRVIpXHJcblx0XHR7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHRyZXR1cm4gdGhpcy5vdmVybGF5LmdldEVsZW1lbnQoKS5zdHlsZS5kaXNwbGF5ICE9IFwibm9uZVwiO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuc2V0VmlzaWJsZS5jYWxsKHRoaXMsIHZpc2libGUpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih2aXNpYmxlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIHN0eWxlID0gdGhpcy5nZXRWZWN0b3JMYXllclN0eWxlKCk7XHJcblx0XHRcdFx0dGhpcy5mZWF0dXJlLnNldFN0eWxlKHN0eWxlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0dGhpcy5mZWF0dXJlLnNldFN0eWxlKG51bGwpO1xyXG5cdFx0XHRcclxuXHRcdFx0Lyp2YXIgc291cmNlID0gdGhpcy5tYXAubWFya2VyTGF5ZXIuZ2V0U291cmNlKCk7XHJcblx0XHRcdFxyXG5cdFx0XHQvKmlmKHRoaXMuZmVhdHVyZUluU291cmNlID09IHZpc2libGUpXHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYodmlzaWJsZSlcclxuXHRcdFx0XHRzb3VyY2UuYWRkRmVhdHVyZSh0aGlzLmZlYXR1cmUpO1xyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0c291cmNlLnJlbW92ZUZlYXR1cmUodGhpcy5mZWF0dXJlKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZmVhdHVyZUluU291cmNlID0gdmlzaWJsZTsqL1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLm92ZXJsYXkuZ2V0RWxlbWVudCgpLnN0eWxlLmRpc3BsYXkgPSAodmlzaWJsZSA/IFwiYmxvY2tcIiA6IFwibm9uZVwiKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFya2VyLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnNldFBvc2l0aW9uLmNhbGwodGhpcywgbGF0TG5nKTtcclxuXHRcdFxyXG5cdFx0dmFyIG9yaWdpbiA9IG9sLnByb2ouZnJvbUxvbkxhdChbXHJcblx0XHRcdHBhcnNlRmxvYXQodGhpcy5sbmcpLFxyXG5cdFx0XHRwYXJzZUZsb2F0KHRoaXMubGF0KVxyXG5cdFx0XSk7XHJcblx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0XHR0aGlzLmZlYXR1cmUuc2V0R2VvbWV0cnkobmV3IG9sLmdlb20uUG9pbnQob3JpZ2luKSk7XHJcblx0XHRlbHNlXHJcblx0XHRcdHRoaXMub3ZlcmxheS5zZXRQb3NpdGlvbihvcmlnaW4pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLnVwZGF0ZU9mZnNldCA9IGZ1bmN0aW9uKHgsIHkpXHJcblx0e1xyXG5cdFx0aWYoV1BHTVpBLk9MTWFya2VyLnJlbmRlck1vZGUgPT0gV1BHTVpBLk9MTWFya2VyLlJFTkRFUl9NT0RFX1ZFQ1RPUl9MQVlFUilcclxuXHRcdHtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwiTWFya2VyIG9mZnNldCBpcyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiBWZWN0b3IgTGF5ZXIgcmVuZGVyaW5nIG1vZGVcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHggPSB0aGlzLl9vZmZzZXQueDtcclxuXHRcdHZhciB5ID0gdGhpcy5fb2Zmc2V0Lnk7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcclxuXHRcdHRoaXMuZWxlbWVudC5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcclxuXHRcdHRoaXMuZWxlbWVudC5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLnNldEFuaW1hdGlvbiA9IGZ1bmN0aW9uKGFuaW0pXHJcblx0e1xyXG5cdFx0aWYoV1BHTVpBLk9MTWFya2VyLnJlbmRlck1vZGUgPT0gV1BHTVpBLk9MTWFya2VyLlJFTkRFUl9NT0RFX1ZFQ1RPUl9MQVlFUilcclxuXHRcdHtcclxuXHRcdFx0Y29uc29sZS53YXJuKFwiTWFya2VyIGFuaW1hdGlvbiBpcyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiBWZWN0b3IgTGF5ZXIgcmVuZGVyaW5nIG1vZGVcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5zZXRBbmltYXRpb24uY2FsbCh0aGlzLCBhbmltKTtcclxuXHRcdFxyXG5cdFx0c3dpdGNoKGFuaW0pXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgV1BHTVpBLk1hcmtlci5BTklNQVRJT05fTk9ORTpcclxuXHRcdFx0XHQkKHRoaXMuZWxlbWVudCkucmVtb3ZlQXR0cihcImRhdGEtYW5pbVwiKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHJcblx0XHRcdGNhc2UgV1BHTVpBLk1hcmtlci5BTklNQVRJT05fQk9VTkNFOlxyXG5cdFx0XHRcdCQodGhpcy5lbGVtZW50KS5hdHRyKFwiZGF0YS1hbmltXCIsIFwiYm91bmNlXCIpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2FzZSBXUEdNWkEuTWFya2VyLkFOSU1BVElPTl9EUk9QOlxyXG5cdFx0XHRcdCQodGhpcy5lbGVtZW50KS5hdHRyKFwiZGF0YS1hbmltXCIsIFwiZHJvcFwiKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFya2VyLnByb3RvdHlwZS5zZXREcmFnZ2FibGUgPSBmdW5jdGlvbihkcmFnZ2FibGUpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRjb25zb2xlLndhcm4oXCJNYXJrZXIgZHJhZ2dpbmcgaXMgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQgaW4gVmVjdG9yIExheWVyIHJlbmRlcmluZyBtb2RlXCIpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKGRyYWdnYWJsZSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIG9wdGlvbnMgPSB7XHJcblx0XHRcdFx0ZGlzYWJsZWQ6IGZhbHNlXHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHRpZighdGhpcy5qUXVlcnlEcmFnZ2FibGVJbml0aWFsaXplZClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG9wdGlvbnMuc3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdFx0c2VsZi5vbkRyYWdTdGFydChldmVudCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG9wdGlvbnMuc3RvcCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFx0XHRzZWxmLm9uRHJhZ0VuZChldmVudCk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLmRyYWdnYWJsZShvcHRpb25zKTtcclxuXHRcdFx0dGhpcy5qUXVlcnlEcmFnZ2FibGVJbml0aWFsaXplZCA9IHRydWU7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnJlYmluZENsaWNrTGlzdGVuZXIoKTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLmRyYWdnYWJsZSh7ZGlzYWJsZWQ6IHRydWV9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTWFya2VyLnByb3RvdHlwZS5zZXRPcGFjaXR5ID0gZnVuY3Rpb24ob3BhY2l0eSlcclxuXHR7XHJcblx0XHRpZihXUEdNWkEuT0xNYXJrZXIucmVuZGVyTW9kZSA9PSBXUEdNWkEuT0xNYXJrZXIuUkVOREVSX01PREVfVkVDVE9SX0xBWUVSKVxyXG5cdFx0e1xyXG5cdFx0XHRjb25zb2xlLndhcm4oXCJNYXJrZXIgb3BhY2l0eSBpcyBub3QgY3VycmVudGx5IHN1cHBvcnRlZCBpbiBWZWN0b3IgTGF5ZXIgcmVuZGVyaW5nIG1vZGVcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmNzcyh7b3BhY2l0eTogb3BhY2l0eX0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLm9uRHJhZ1N0YXJ0ID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dGhpcy5pc0JlaW5nRHJhZ2dlZCA9IHRydWU7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24oaW50ZXJhY3Rpb24pIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGludGVyYWN0aW9uIGluc3RhbmNlb2Ygb2wuaW50ZXJhY3Rpb24uRHJhZ1BhbilcclxuXHRcdFx0XHRpbnRlcmFjdGlvbi5zZXRBY3RpdmUoZmFsc2UpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLm9uRHJhZ0VuZCA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdHZhciBvZmZzZXQgPSB7XHJcblx0XHRcdHRvcDpcdHBhcnNlRmxvYXQoICQodGhpcy5lbGVtZW50KS5jc3MoXCJ0b3BcIikubWF0Y2goLy0/XFxkKy8pWzBdICksXHJcblx0XHRcdGxlZnQ6XHRwYXJzZUZsb2F0KCAkKHRoaXMuZWxlbWVudCkuY3NzKFwibGVmdFwiKS5tYXRjaCgvLT9cXGQrLylbMF0gKVxyXG5cdFx0fTtcclxuXHRcdFxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmNzcyh7XHJcblx0XHRcdHRvcDogXHRcIjBweFwiLFxyXG5cdFx0XHRsZWZ0OiBcdFwiMHB4XCJcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR2YXIgY3VycmVudExhdExuZyBcdFx0PSB0aGlzLmdldFBvc2l0aW9uKCk7XHJcblx0XHR2YXIgcGl4ZWxzQmVmb3JlRHJhZyBcdD0gdGhpcy5tYXAubGF0TG5nVG9QaXhlbHMoY3VycmVudExhdExuZyk7XHJcblx0XHR2YXIgcGl4ZWxzQWZ0ZXJEcmFnXHRcdD0ge1xyXG5cdFx0XHR4OiBwaXhlbHNCZWZvcmVEcmFnLnggKyBvZmZzZXQubGVmdCxcclxuXHRcdFx0eTogcGl4ZWxzQmVmb3JlRHJhZy55ICsgb2Zmc2V0LnRvcFxyXG5cdFx0fTtcclxuXHRcdHZhciBsYXRMbmdBZnRlckRyYWdcdFx0PSB0aGlzLm1hcC5waXhlbHNUb0xhdExuZyhwaXhlbHNBZnRlckRyYWcpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnNldFBvc2l0aW9uKGxhdExuZ0FmdGVyRHJhZyk7XHJcblx0XHRcclxuXHRcdHRoaXMuaXNCZWluZ0RyYWdnZWQgPSBmYWxzZTtcclxuXHRcdHRoaXMudHJpZ2dlcih7dHlwZTogXCJkcmFnZW5kXCIsIGxhdExuZzogbGF0TG5nQWZ0ZXJEcmFnfSk7XHJcblx0XHRcclxuXHRcdC8vIE5COiBcInllc1wiIHJlcHJlc2VudHMgZGlzYWJsZWRcclxuXHRcdGlmKHRoaXMubWFwLnNldHRpbmdzLndwZ216YV9zZXR0aW5nc19tYXBfZHJhZ2dhYmxlICE9IFwieWVzXCIpXHJcblx0XHRcdHRoaXMubWFwLm9sTWFwLmdldEludGVyYWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24oaW50ZXJhY3Rpb24pIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihpbnRlcmFjdGlvbiBpbnN0YW5jZW9mIG9sLmludGVyYWN0aW9uLkRyYWdQYW4pXHJcblx0XHRcdFx0XHRpbnRlcmFjdGlvbi5zZXRBY3RpdmUodHJ1ZSk7XHJcblx0XHRcdFx0XHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuT0xNYXJrZXIucHJvdG90eXBlLm9uRWxlbWVudENsaWNrID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSBldmVudC5jdXJyZW50VGFyZ2V0LndwZ216YU1hcmtlcjtcclxuXHRcdFxyXG5cdFx0aWYoc2VsZi5pc0JlaW5nRHJhZ2dlZClcclxuXHRcdFx0cmV0dXJuOyAvLyBEb24ndCBkaXNwYXRjaCBjbGljayBldmVudCBhZnRlciBhIGRyYWdcclxuXHRcdFxyXG5cdFx0c2VsZi5kaXNwYXRjaEV2ZW50KFwiY2xpY2tcIik7XHJcblx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJzZWxlY3RcIik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEJpbmRzIC8gcmViaW5kcyB0aGUgY2xpY2sgbGlzdGVuZXIuIFRoaXMgbXVzdCBiZSBib3VuZCBhZnRlciBkcmFnZ2FibGUgaXMgaW5pdGlhbGl6ZWQsXHJcblx0ICogdGhpcyBzb2x2ZXMgdGhlIGNsaWNrIGxpc3RlbmVyIGZpcmluZyBiZWZvcmUgZHJhZ2VuZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5PTE1hcmtlci5wcm90b3R5cGUucmViaW5kQ2xpY2tMaXN0ZW5lciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkub2ZmKFwiY2xpY2tcIiwgdGhpcy5vbkVsZW1lbnRDbGljayk7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkub24oXCJjbGlja1wiLCB0aGlzLm9uRWxlbWVudENsaWNrKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoib3Blbi1sYXllcnMvb2wtbWFya2VyLmpzIn0=
