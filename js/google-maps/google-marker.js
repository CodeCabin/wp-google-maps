(function($) {
	
	var parentConstructor;
	
	WPGMZA.GoogleMarker = function(row)
	{
		var self = this;
		
		parentConstructor.call(this, row);
		
		this.googleMarker = new google.maps.Marker(this.settings);
		this.googleMarker.wpgmzaMarker = this;
		
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
				
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent("click");
		});
		
		google.maps.event.addListener(this.googleMarker, "mouseover", function() {
			self.dispatchEvent("mouseover");
		});
	}
	
	if(WPGMZA.isProVersion())
		parentConstructor = WPGMZA.ProMarker;
	else
		parentConstructor = WPGMZA.Marker;
	WPGMZA.GoogleMarker.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.GoogleMarker.prototype.constructor = WPGMZA.GoogleMarker;
	
	WPGMZA.GoogleMarker.prototype.addLabel = function()
	{
		var map = this.map;
		var labels = map.settings.marker_label_characters;
		var length = labels.length;
		
		if(length == 0)
			return;
		
		if(!("currentMarkerLabelIndex" in map))
			map.currentMarkerLabelIndex = 0;
		
		var label = labels.substr(map.currentMarkerLabelIndex % length, 1);
		map.currentMarkerLabelIndex++;
		
		this.googleMarker.setLabel({
			text: label
		});
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setPosition = function(latLng)
	{
		parentConstructor.prototype.setPosition.call(this, latLng);
		this.googleMarker.setPosition(latLng);
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setAnimation = function(animation)
	{
		parentConstructor.prototype.setAnimation.call(this, animation);
		this.googleMarker.setAnimation(animation);
	}
	
	/**
	 * Sets the visibility of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setVisible = function(visible)
	{
		this.googleMarker.setVisible(visible);
	}
	
	// createInfoWindow
	// setPositionFromAddress
	
})(jQuery);