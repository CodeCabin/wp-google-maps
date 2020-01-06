/**
 * @namespace WPGMZA
 * @module OLMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
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