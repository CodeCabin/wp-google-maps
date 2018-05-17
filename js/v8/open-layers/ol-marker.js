/**
 * @namespace WPGMZA
 * @module OLMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OLMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);

		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		this.element = $("<div class='ol-marker'><img src='" + WPGMZA.settings.default_marker_icon + "'/></div>")[0];
		
		$(this.element).on("click", function(event) {
			self.dispatchEvent("click");
			self.dispatchEvent("select");
		});

		$(this.element).on("mouseover", function(event) {
			self.dispatchEvent("mouseover");
		});
		
		this.overlay = new ol.Overlay({
			element: this.element
		});
		this.overlay.setPosition(origin);
		
		if(this.animation)
			this.setAnimation(this.animation);
		
		this.setLabel(this.settings.label);
		
		if(row.draggable)
			this.setDraggable(true);
		
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.OLMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.OLMarker.prototype.constructor = WPGMZA.OLMarker;
	
	WPGMZA.OLMarker.prototype.addLabel = function()
	{
		this.setLabel(this.getLabelText());
	}
	
	WPGMZA.OLMarker.prototype.setLabel = function(label)
	{
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
	
	WPGMZA.OLMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible(visible);
		
		this.overlay.getElement().style.display = (visible ? "block" : "none");
	}
	
	WPGMZA.OLMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
	
		this.overlay.setPosition(origin);
	}
	
	WPGMZA.OLMarker.prototype.setOffset = function(x, y)
	{
		this.element.style.position = "relative";
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
	}
	
	WPGMZA.OLMarker.prototype.setAnimation = function(anim)
	{
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
		
		if(draggable)
		{
			var options = {
				disabled: false
			};
			
			if(!this.jQueryDraggableInitialized)
			{
				options.stop = function(event) {
					self.onDragEnd(event);
				}
			}
			
			$(this.element).draggable(options);
		}
		else
			$(this.element).draggable({disabled: true});
	}
	
	WPGMZA.OLMarker.prototype.onDragEnd = function(event)
	{
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
		
		this.trigger({type: "dragend", latLng: latLngAfterDrag})
		$(this.element).trigger("dragend.wpgmza");
	}
	
})(jQuery);