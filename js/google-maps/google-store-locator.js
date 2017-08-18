(function($) {
	
	var parentConstructor;
	
	/**
	 * Constructor
	 * @param map The map this store locator is attached to
	 */
	WPGMZA.GoogleStoreLocator = function(map)
	{
		parentConstructor.call(this, map);
	}
	
	parentConstructor = (WPGMZA.isProVersion() ? WPGMZA.ProStoreLocator : WPGMZA.StoreLocator);
	
	WPGMZA.GoogleStoreLocator.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.GoogleStoreLocator.prototype.constructor = WPGMZA.GoogleStoreLocator;
	
	/**
	 * Creates an instance of a circle to display the radius
	 * @return void
	 */
	WPGMZA.GoogleStoreLocator.prototype.showCircle = function(latLng)
	{
		if(!this.circle)
			this.circle = new google.maps.Circle({
				strokeColor: "#ff0000",
				strokeCopacity: 0.25,
				strokeWeight: 2,
				fillColor: "#ff0000",
				clickable: false
			});
			
		if(!latLng)
		{
			this.circle.setMap(null);
			return;
		}
		
		this.circle.setOptions({
			center: latLng,
			map: this.map.googleMap,
			radius: this.getRadiusInMeters()
		});
	}
	
	/**
	 * Shows/hides bouncing marker at the center of the search radius
	 * @return void
	 */
	WPGMZA.GoogleStoreLocator.prototype.showCenterMarker = function(latLng)
	{
		WPGMZA.StoreLocator.prototype.showCenterMarker.call(this, latLng);
		
		this.centerMarker.googleMarker.setMap((latLng ? this.map.googleMap : null));
	}
	
})(jQuery);