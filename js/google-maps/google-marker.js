(function($) {
	
	WPGMZA.GoogleMarker = function(row)
	{
		var self = this;
		
		WPGMZA.Marker.call(this, row);
		
		this.googleMarker = new google.maps.Marker(this.settings);
		this.googleMarker.wpgmzaMarker = this;
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
		
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	if(WPGMZA.isProVersion())
		WPGMZA.GoogleMarker.prototype = Object.create(WPGMZA.ProMarker.prototype);
	else
		WPGMZA.GoogleMarker.prototype = Object.create(WPGMZA.Marker.prototype);
	WPGMZA.GoogleMarker.prototype.constructor = WPGMZA.GoogleMarker;
	
	/**
	 * Gets the position of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.getPosition = function()
	{
		var latLng = this.googleMarker.getPosition();
		
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setPosition = function(latLng)
	{
		WPGMZA.Marker.prototype.setPosition.call(this, latLng);
		this.googleMarker.setPosition(latLng);
	}
	
	/**
	 * Geocodes the supplied address and then moves the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setPositionFromAddress = function(address, callback)
	{
		var self = this;
		var latLng = null;
		
		function finish()
		{
			self.dispatchEvent("geocodecomplete");
			if(callback)
				callback(latLng);
		}
		
		if(WPGMZA.isLatLng(address))
		{
			var parts = address.split(",");
			this.setPosition({
				lat: parts[0],
				lng: parts[1]
			});
			finish();
			return;
		}
		
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({address: address}, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK)
			{
				var location = results[0].geometry.location;
				latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
			}
			finish();
		});
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setAnimation = function(animation)
	{
		WPGMZA.Marker.prototype.setAnimation.call(this, animation);
		this.googleMarker.setAnimation(animation);
	}
	
	// createInfoWindow
	// setPositionFromAddress
	// setVisibility
	
})(jQuery);