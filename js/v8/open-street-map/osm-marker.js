/**
 * @namespace WPGMZA
 * @module OSMMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
(function($) {
	
	var Parent;
	
	WPGMZA.OSMMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);

		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		this.element = $("<div class='osm-marker'><img src='" + WPGMZA.settings.default_marker_icon + "'/></div>")[0];
		
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
		
		this.setAnimation(this.settings.animation);
		this.setLabel(this.settings.label);
		
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.OSMMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.OSMMarker.prototype.constructor = WPGMZA.OSMMarker;
	
	WPGMZA.OSMMarker.prototype.addLabel = function()
	{
		this.setLabel(this.getLabelText());
	}
	
	WPGMZA.OSMMarker.prototype.setLabel = function(label)
	{
		if(!label)
		{
			if(this.label)
				$(this.element).find(".osm-marker-label").remove();
			
			return;
		}
		
		if(!this.label)
		{
			this.label = $("<div class='osm-marker-label'/>");
			$(this.element).append(this.label);
		}
		
		this.label.html(label);
	}
	
	WPGMZA.OSMMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible(visible);
		
		this.overlay.getElement().style.display = (visible ? "block" : "none");
	}
	
	WPGMZA.OSMMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
	
		this.overlay.setPosition(origin);
	}
	
	WPGMZA.OSMMarker.prototype.setOffset = function(x, y)
	{
		this.element.style.position = "relative";
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
	}
	
	WPGMZA.OSMMarker.prototype.setAnimation = function(anim)
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
	
})(jQuery);