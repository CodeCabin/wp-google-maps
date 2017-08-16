(function($) {
	var parentConstructor;
	
	/**
	 * Constructor
	 * @param element to contain the map
	 */
	WPGMZA.GoogleMap = function(element)
	{
		var self = this;
		
		if(!window.google)
			throw new Error("Google API not loaded");
		
		parentConstructor.call(this, element);
		
		this.loadGoogleMap();
		
		google.maps.event.addListener(this.googleMap, "click", function(event) {
			self.dispatchEvent("click");
		});
		
		google.maps.event.addListener(this.googleMap, "rightclick", function(event) {
			var wpgmzaEvent = new WPGMZA.Event("rightclick");
			wpgmzaEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(wpgmzaEvent);
		});
		
		var marker;
		if(this.storeLocator && (marker = this.storeLocator.centerPointMarker))
		{
			this.storeLocator.centerPointMarker.googleMarker.setMap(this.googleMap);
			marker.setVisible(false);
		}
	}
	
	// If we're running the Pro version, inherit from ProMap, otherwise, inherit from Map
	if(WPGMZA.isProVersion())
	{
		parentConstructor = WPGMZA.ProMap;
		WPGMZA.GoogleMap.prototype = Object.create(WPGMZA.ProMap.prototype);
	}
	else
	{
		parentConstructor = WPGMZA.Map;
		WPGMZA.GoogleMap.prototype = Object.create(WPGMZA.Map.prototype);
	}
	WPGMZA.GoogleMap.prototype.constructor = WPGMZA.GoogleMap;
	
	/**
	 * Create a marker, called by the abstract map class
	 * @return WPGMZA.GoogleMarker
	 */
	WPGMZA.GoogleMap.prototype.createMarkerInstance = function(row)
	{
		return new WPGMZA.GoogleMarker(row);
	}
	
	/**
	 * Create a polygon, called by the abstract map class
	 * @return WPGMZA.GoogleMarker
	 */
	WPGMZA.GoogleMap.prototype.createPolygonInstance = function(row, googlePolygon)
	{
		return new WPGMZA.GooglePolygon(row, googlePolygon);
	}
	
	/**
	 * Create a polyline, called by the abstract map class
	 * @return WPGMZA.GoogleMarker
	 */
	WPGMZA.GoogleMap.prototype.createPolylineInstance = function(row, googlePolyline)
	{
		return new WPGMZA.GooglePolyline(row, googlePolyline);
	}
	
	/**
	 * Creates the Google Maps map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.loadGoogleMap = function()
	{
		var self = this;
		var options = this.settings.toGoogleMapsOptions();
		
		this.googleMap = new google.maps.Map(this.engineElement, options);
		google.maps.event.addListener(this.googleMap, "bounds_changed", function() { 
			self.onBoundsChanged();
		});
		
		if(this.settings.bicycle)
			this.enableBicycleLayer(true);
		if(this.settings.traffic)
			this.enableTrafficLayer(true);
		if(this.settings.transport)
			this.enablePublicTransportLayer(true);
		this.showPointsOfInterest(this.settings.show_points_of_interest);
		
		// Move the loading wheel into the map element (it has to live outside in the HTML file because it'll be overwritten by Google otherwise)
		$(this.engineElement).append($(this.element).find(".wpgmza-loader"));
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addMarker = function(marker)
	{
		marker.googleMarker.setMap(this.googleMap);
		
		parentConstructor.prototype.addMarker.call(this, marker);
	}
	
	/**
	 * Removes the specified marker from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.deleteMarker = function(marker)
	{
		marker.googleMarker.setMap(null);
		
		parentConstructor.prototype.deleteMarker.call(this, marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addPolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(this.googleMap);
		
		parentConstructor.prototype.addPolygon.call(this, polygon);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.deletePolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(null);
		
		parentConstructor.prototype.deletePolygon.call(this, polygon);
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addPolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(this.googleMap);
		
		parentConstructor.prototype.addPolyline.call(this, polyline);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.deletePolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(null);
		
		parentConstructor.prototype.deletePolyline.call(this, polyline);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.getCenter = function()
	{
		var latLng = this.googleMap.getCenter();
		
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Delegate for google maps setCenter
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setCenter = function(latLng)
	{
		this.googleMap.setCenter(latLng);
	}
	
	/**
	 * Delegate for google maps setPan
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.panTo = function(latLng)
	{
		this.googleMap.panTo(latLng);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.getZoom = function()
	{
		return this.googleMap.getZoom();
	}
	
	/**
	 * Delegate for google maps getZoom
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setZoom = function(value)
	{
		return this.googleMap.setZoom(value);
	}
	
	/**
	 * Gets the parameters to be sent with AJAX fetch request
	 * @return object
	 */
	WPGMZA.GoogleMap.prototype.getFetchParameters = function()
	{
		var data = parentConstructor.prototype.getFetchParameters.call(this);
		data.bounds = this.googleMap.getBounds().toUrlValue(7);
		return data;
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.enableBicycleLayer = function(enable)
	{
		if(!this.bicycleLayer)
			this.bicycleLayer = new google.maps.BicyclingLayer();
		
		this.bicycleLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.enableTrafficLayer = function(enable)
	{
		if(!this.trafficLayer)
			this.trafficLayer = new google.maps.TrafficLayer();
		
		this.trafficLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.enablePublicTransportLayer = function(enable)
	{
		if(!this.publicTransportLayer)
			this.publicTransportLayer = new google.maps.TransitLayer();
		
		this.publicTransportLayer.setMap(
			enable ? this.googleMap : null
		);
	}
	
	/**
	 * Shows / hides points of interest
	 * @param show boolean, enable or not
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.showPointsOfInterest = function(show)
	{
		// TODO: This will bug the front end because there is textarea with theme data
		var text = $("textarea[name='theme_data']").val();
		
		if(!text)
			return;
		
		var styles = JSON.parse(text);
		
		styles.push({
			featureType: "poi",
			stylers: [
				{
					visibility: (show ? "on" : "off")
				}
			]
		});
		
		this.googleMap.setOptions({styles: styles});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	WPGMZA.GoogleMap.prototype.getMinZoom = function()
	{
		this.googleMap.getMinZoom();
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setMinZoom = function(value)
	{
		this.googleMap.setMinZoom(value);
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	WPGMZA.GoogleMap.prototype.getMaxZoom = function()
	{
		this.googleMap.getMaxZoom();
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setMaxZoom = function(value)
	{
		this.googleMap.setMaxZoom(value);
	}
	
	/**
	 * Handle the map element resizing
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.onElementResized = function(event)
	{
		google.maps.event.trigger(this.googleMap, "resize");
	}
	
})(jQuery);