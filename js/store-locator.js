(function($) {
	var milesPerKm = 0.621371;
	
	/**
	 * Constructor
	 * @param map The map this store locator is attached to
	 */
	WPGMZA.StoreLocator = function(map)
	{
		var self = this;
		
		this.map = map;
		this.element = $(map.element).find(".store-locator")[0];
		this.units = "kilometers";
		this.circle = null;
		this.closestMarker = null;
		
		this.address = $(this.element).find("input[name='store_locator_address']");
		this.radius = $(this.element).find("input[name='store_locator_radius']");
		this.error = $(this.element).find(".error");
		this.noResults = $(this.element).find(".no-results");
		
		$(this.element).css({
			display: map.settings.store_locator_enabled ? "block" : "none"
		});
		
		this.address.val(
			map.settings.store_locator_default_address
		);
		
		if(map.settings.store_locator_default_radius)
			this.radius.val(
				map.settings.store_locator_default_radius
			);
		
		this.setUnits(map.settings.store_locator_distance);
		
		$(this.element).find(".wpgmza-submit").on("click", function(event) {
			self.onSearch(event);
		});
		
		$(this.element).find(".wpgmza-reset").on("click", function(event) {
			self.onReset(event);
		});
		
		$(this.element).find("input").on("keydown", function(event) {
			self.clear();
			
			if(event.keyCode == 13)
			{
				self.onSearch(event);
				event.preventDefault();
				return false;
			}
		});
		
		this.clear();
	}
	
	WPGMZA.StoreLocator.createInstance = function(map)
	{
		if(WPGMZA.isProVersion())
			switch(WPGMZA.settings.engine)
			{
				case "google-maps":
					return new WPGMZA.GoogleProStoreLocator(map);
					break;
					
				default:
					return new WPGMZA.OSMProStoreLocator(map);
					break;
			}

		else
			switch(WPGMZA.settings.engine)
			{
				case "google-maps":
					return new WPGMZA.GoogleStoreLocator(map);
					break;
					
				default:
					return new WPGMZA.OSMStoreLocator(map);
					break;
			}
	}
	
	/**
	 * Clears the store locator - takes the circle off the map and reverts the last marker to its original animation, and hides the error and no results messages
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.clear = function()
	{
		this.showCircle(false);
		this.showCenterMarker(false);
		
		if(this.closestMarker)
			this.closestMarker.setAnimation(
				this.closestMarker.settings.animation
			);
		this.closestMarker = null;
		
		this.error.hide();
		this.noResults.hide();
	}
	
	/**
	 * Returns the current units as either "miles" or "kilometers"
	 * @return string
	 */
	WPGMZA.StoreLocator.prototype.getUnits = function()
	{
		return this.units;
	}
	
	/**
	 * Gets the radius units as a localized string
	 * @return string
	 */
	WPGMZA.StoreLocator.prototype.getLocalizedUnits = function()
	{
		return this.map.settings.localized_strings[this.units];
	}
	
	/**
	 * Sets the radius units
	 * @param setting the checkbox setting or setting from map.settings, true = miles, false = kilometers
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.setUnits = function(setting)
	{
		if(setting)
			this.units = "miles";
		else
			this.units = "kilometers";
		
		$(this.element).find(".store_locator_radius_units").html(
			this.getLocalizedUnits()
		);
	}
	
	/**
	 * Gets the current radius in meters
	 * @return number
	 */
	WPGMZA.StoreLocator.prototype.getRadiusInMeters = function()
	{
		return parseFloat(this.radius.val()) / (this.units == "miles" ? milesPerKm : 1) * 1000;
	}
	
	WPGMZA.StoreLocator.prototype.getRadiusInKm = function()
	{
		return this.getRadiusInMeters() / 1000;
	}
	
	WPGMZA.StoreLocator.prototype.getRadiusInMiles = function()
	{
		return this.getRadiusInKm() * milesPerKm;
	}
	
	/**
	 * Gets the zoom level for the currently set radius
	 * @return number
	 */
	WPGMZA.StoreLocator.prototype.getZoomFromRadius = function()
	{
		// Uses a curve based on V6 points, generated here: https://www.mycurvefit.com/
		var r = this.getRadiusInKm();
		
		var y = 0.8741227 + (17.00647 - 0.8741227) / (1 + Math.pow(r / 30.10563, 0.4370466));
		
		return Math.floor(y);
	}
	
	/**
	 * Shows the circle at the specified location, or hides it
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.showCircle = function(options)
	{
		
	}
	
	/**
	 * Shows/hides a marker at the center point of the search radius
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.showCenterMarker = function(latLng)
	{
		if(!this.centerMarker)
			this.centerMarker = this.map.createMarkerInstance();
		
		if(latLng)
		{
			this.centerMarker.setPosition(latLng);
			this.centerMarker.setAnimation(WPGMZA.Marker.ANIMATION_BOUNCE);
		}
	}
	
	/**
	 * Triggered when the user presses "search" or presses enter
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onSearch = function(event)
	{
		var self = this;
		var button = $(this.element).find(".wpgmza-submit");
		var restrict = this.map.settings.store_locator_restrict;
		var geocoder = WPGMZA.Geocoder.createInstance();
		var options = {
			address: $(this.element).find("[name='store_locator_address']").val()
		};
		
		if(restrict && restrict.length)
			options.country = restrict;
			
		this.showCircle(false);
		
		this.clear();
		
		button.prop("disabled", true);
		
		geocoder.getLatLngFromAddress(options, function(latLng) {
			button.prop("disabled", false);
			
			if(!latLng)
			{
				self.error.show();
				return;
			}
			
			self.onGeocodeSuccess(latLng);
		});
	}
	
	/**
	 * Called when the geocoder finds the specified address
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onGeocodeSuccess = function(latLng)
	{
		var zoom = this.getZoomFromRadius();
		var marker = this.map.getClosestMarker(latLng);
		
		this.showCircle(latLng);
		
		if(this.map.settings.store_locator_bounce)
			this.showCenterMarker(latLng);
		
		// Add the circle and pan to it
		this.map.setZoom(zoom);
		this.map.panTo(latLng);
		
		// Is "show bouncing icon" set?
		/*if(self.map.settings.store_locator_bounce)
		{
			self.closestMarker = marker;
			
			if(!marker)
				return;
			
			var position = marker.googleMarker.getPosition();
			var distance = WPGMZA.Map.getGeographicDistance(
				position.lat(),
				position.lng(),
				latLng.lat(),
				latLng.lng()
			);
			var maximum = self.getRadiusInKm();
			
			if(distance > maximum)
			{
				self.noResults.show();
				return;
			}
			
			marker.googleMarker.setAnimation(google.maps.Animation.BOUNCE);
		}*/
	}
	
	/**
	 * Called when the user clicks reset
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onReset = function(event)
	{
		this.clear();
	}
	
})(jQuery);