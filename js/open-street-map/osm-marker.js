(function($) {
	
	var parentConstructor;
	
	WPGMZA.OSMMarker = function(row)
	{
		var self = this;
		
		parentConstructor.call(this, row);

		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
		
		this.element = $("<div class='osm-marker'><img src='" + WPGMZA.settings.default_marker_icon + "'/></div>")[0];
		
		$(this.element).on("click", function(event) {
			self.dispatchEvent("click");
		});
		$(this.element).on("mouseover", function(event) {
			self.dispatchEvent("mouseover");
		});
		
		this.overlay = new ol.Overlay({
			element: this.element
		});
		this.overlay.setPosition(origin);
		
		this.setAnimation(this.settings.animation);
	}
	
	if(WPGMZA.isProVersion())
		parentConstructor = WPGMZA.ProMarker;
	else
		parentConstructor = WPGMZA.Marker;
	WPGMZA.OSMMarker.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.OSMMarker.prototype.constructor = WPGMZA.OSMMarker;
	
	WPGMZA.OSMMarker.prototype.addLabel = function()
	{
		if(!this.label)
		{
			this.label = $("<div class='osm-marker-label'/>");
			$(this.element).append(this.label);
		}
		
		this.label.html(this.getLabelText());
	}
	
	WPGMZA.OSMMarker.prototype.setVisible = function(visible)
	{
		parentConstructor.prototype.setVisible(visible);
		
		this.overlay.getElement().style.display = (visible ? "block" : "none");
	}
	
	WPGMZA.OSMMarker.prototype.setPosition = function(latLng)
	{
		parentConstructor.prototype.setPosition.call(this, latLng);
		
		var origin = ol.proj.fromLonLat([
			parseFloat(this.lng),
			parseFloat(this.lat)
		]);
	
		this.overlay.setPosition(origin);
	}
	
	WPGMZA.OSMMarker.prototype.setAnimation = function(anim)
	{
		parentConstructor.prototype.setAnimation.call(this, anim);
		
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