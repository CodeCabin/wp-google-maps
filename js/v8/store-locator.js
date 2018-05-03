/**
 * @namespace WPGMZA
 * @module StoreLocator
 * @requires WPGMZA.EventDispatcher
 */
(function($) {
	var milesPerKm = 0.621371;
	
	/**
	 * Constructor
	 * @param map The map this store locator is attached to
	 */
	WPGMZA.StoreLocator = function(map)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		WPGMZA.assertInstanceOf(this, "StoreLocator");
		
		this.map = this.parent = map;
		this.element = $(map.element).find(".store-locator")[0];
		this.units = WPGMZA.Distance.KILOMETERS;
		this.circle = null;
		this.closestMarker = null;
		this.displayingResult = false;
		
		this.address = $(this.element).find("[name='store_locator_address']");
		this.radius = $(this.element).find("[name='store_locator_radius']");
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
		
		$(this.element).find(".wpgmza-submit").on("click", function(event) {
			self.onSearch(event);
		});
		
		$(this.element).find(".wpgmza-reset").on("click", function(event) {
			self.onReset(event);
		});
		
		$(this.element).find("input").on("keydown", function(event) {
			if(event.keyCode == 13)
			{
				self.onSearch(event);
				event.preventDefault();
				return false;
			}
		});
		
		this.map.addEventListener("fetchsuccess", function(event) {
			self.filterMarkers();
		});
		
		this.clear();
		
		this.initialized = true;
	}
	
	WPGMZA.StoreLocator.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.StoreLocator.prototype.constructor = WPGMZA.StoreLocator;
	
	WPGMZA.StoreLocator.getConstructor = function()
	{
		if(WPGMZA.isProVersion())
			switch(WPGMZA.settings.engine)
			{
				case "google-maps":
					return WPGMZA.GoogleProStoreLocator;
					break;
					
				default:
					return WPGMZA.OSMProStoreLocator;
					break;
			}

		else
			switch(WPGMZA.settings.engine)
			{
				case "google-maps":
					return WPGMZA.GoogleStoreLocator;
					break;
					
				default:
					return WPGMZA.OSMStoreLocator;
					break;
			}
	}
	
	WPGMZA.StoreLocator.createInstance = function(map)
	{
		var constructor = WPGMZA.StoreLocator.getConstructor();
		return new constructor(map);
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
		
		this.displayingResult = false;
	}
	
	/**
	 * Gets the marker filter
	 * @return MarkerFilter
	 */
	WPGMZA.StoreLocator.prototype.getMarkerFilter = function()
	{
		var filter = WPGMZA.MarkerFilter.createInstance();
		
		if(this.map.settings.store_locator_hide_before_search && !this.displayingResult)
			filter.hideAll = true;
		
		if(this.displayingResult && this.map.settings.hide_markers_outside_store_locator_radius)
		{
			filter.center = this.centerPoint;
			filter.radius = parseFloat($(this.element).find("[name='store_locator_radius']").val());
		}
		
		if(this.map.settings.store_locator_name_search)
			filter.string = $(this.element).find("[name='store_locator_title_search_term']").val();
		
		return filter;
	}
	
	/**
	 * Filters map markers
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.filterMarkers = function()
	{
		var filter = this.getMarkerFilter();
		
		var event = {
			type: "filtercomplete",
			markers: []
		};
		
		filter.map(this.map.markers, function(marker, allowed) {
			if(allowed)
				event.markers.push(marker);
				
			marker.setVisible(allowed);
		});

		if(this.initialized)
			this.dispatchEvent(event);
	}
	
	/**
	 * Returns the selected radius
	 * @return number
	 */
	WPGMZA.StoreLocator.prototype.getRadius = function()
	{
		return parseFloat(this.radius.val());
	}
	
	/**
	 * Gets the zoom level for the currently set radius
	 * @return number
	 */
	WPGMZA.StoreLocator.prototype.getZoomFromRadius = function()
	{
		// With thanks to Jeff Jason http://jeffjason.com/2011/12/google-maps-radius-to-zoom/
		var r = WPGMZA.Distance.uiToKilometers(this.getRadius());
		return Math.round(14-Math.log(r)/Math.LN2);
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
			this.centerMarker = WPGMZA.Marker.createInstance();
		
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
		
		var addressInput = $(this.element).find("[name='store_locator_address']");
		
		var options = {
			address: addressInput.val() || addressInput.attr("value")
		};
		
		if(restrict && restrict.length)
			options.country = restrict;
			
		this.showCircle(false);
		
		this.clear();
		
		if(!options.address.length)
		{
			alert(WPGMZA.localized_strings.no_address_entered);
			return;
		}
			
		button.prop("disabled", true);
		
		geocoder.getLatLngFromAddress(options, function(latLng) {
			button.prop("disabled", false);
			
			if(!latLng)
			{
				self.onNoResults();
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
		
		this.displayingResult = true;
		this.centerPoint = latLng;
		
		this.filterMarkers();
		
		this.dispatchEvent({type: "geocodesuccess", latLng: latLng});
	}
	
	/**
	 * Called when there are no results
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onNoResults = function()
	{
		this.noResults.show();
	}
	
	/**
	 * Called when the user clicks reset
	 * @return void
	 */
	WPGMZA.StoreLocator.prototype.onReset = function(event)
	{
		this.clear();
		
		$(this.element).find("input[name='store_locator_address'], input[name='store_locator_title_search_term']").val("");
	}
	
})(jQuery);