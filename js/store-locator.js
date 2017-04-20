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
			display: map.settings.store_locator ? "block" : "none"
		})
		
		this.address.val(
			map.settings.store_locator_default_address
		);
		
		if(map.settings.store_locator_default_radius)
			this.radius.val(
				map.settings.store_locator_default_radius
			);
		
		this.setUnits(map.settings.store_locator_distance);
		
		$(this.element).find("button").on("click", function(event) {
			self.onSearch(event);
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
	
	/**
	 * Clears the store locator - takes the circle off the map and reverts the last markre to its original animation, and hides the error and no results messages
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.clear = function()
	{
		if(this.circle)
			this.circle.setMap(null);
		
		if(this.closestMarker)
			this.closestMarker.googleMarker.setAnimation(
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
	 * Triggered when the user presses "search" or presses enter
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onSearch = function(event)
	{
		var self = this;
		var restrict = this.map.settings.store_locator_restrict;
		var zoom = this.getZoomFromRadius();
		var geocoder = new google.maps.Geocoder();
		
		var options = {
			address: this.address.val()
		};1
		
		if(restrict && restrict.length)
			options.componentRestrictions = {
				country: restrict
			};
			
		if(this.circle)
			this.circle.setMap(null);
		
		this.clear();
		
		geocoder.geocode(options, function(results, status) {
			if(status != google.maps.GeocoderStatus.OK)
				self.error.show();
			else
			{
				var latLng = results[0].geometry.location;
				var marker = self.map.getClosestMarker(latLng);
				
				self.circle = new google.maps.Circle({
					strokeColor: "#ff0000",
					strokeCopacity: 0.25,
					strokeWeight: 2,
					fillColor: "#ff0000",
					map: self.map.googleMap,
					center: latLng,
					clickable: false,
					radius: self.getRadiusInMeters()
				});
				
				// Add the circle and pan to it
				self.map.googleMap.setZoom(zoom);
				self.map.googleMap.panTo(latLng);
				
				// Is "show bouncing icon" set?
				if(self.map.settings.store_locator_bounce)
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
					) / 1000;
					var maximum = self.getRadiusInKm();
					
					if(distance > maximum)
					{
						self.noResults.show();
						return;
					}
					
					marker.googleMarker.setAnimation(google.maps.Animation.BOUNCE);
				}
			}
		});
	}
	
})(jQuery);