(function($) {
	
	var parentConstructor;
	
	WPGMZA.GoogleMarker = function(row)
	{
		var self = this;
		
		parentConstructor.call(this, row);
		
		this.googleMarker = new google.maps.Marker(/*this.settings*/);
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
		this.googleMarker.setLabel({
			text: this.getLabelText()
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
	 * Sets the position offset of a marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setOffset = function(x, y)
	{
		var self = this;
		var icon = this.googleMarker.getIcon();
		var img = new Image();
		var params;
		
		if(typeof icon == "string")
			params = {
				url: icon
			};
		else
			params = icon;
		
		img.onload = function()
		{
			var defaultAnchor = {
				x: img.width / 2,
				y: img.height
			};
			
			params.anchor = new google.maps.Point(defaultAnchor.x - x, defaultAnchor.y - y);
			
			self.googleMarker.setIcon(params);
		}
		
		img.src = params.url;
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
	
})(jQuery);