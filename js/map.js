(function($) {
	function generateUUID () { // Public Domain/MIT
		var d = new Date().getTime();
		if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
			d += performance.now(); //use high-precision timer if available
		}
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	}
	
	/**
	 * Constructor
	 * @param element to contain map
	 */
	WPGMZA.Map = function(element)
	{
		if(!(element instanceof HTMLElement))
			throw new Error("Argument must be a HTMLElement");
		
		WPGMZA.maps.push(this);
		
		this.id = element.getAttribute("data-map-id");
		if(!/\d+/.test(this.id))
			throw new Error("Map ID must be an integer");
		
		this.element = element;
		this.googleElement = $(this.element).find(".wpgmza-google-map")[0];
		
		if(!jQuery.fn.jquery.match(/1\.([0-7])\.([0-9])/))
			$(this.element).find("#wpgmza-jquery-error").remove();
		
		this.loader = $(element).find(".wpgmza-loader");
		
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		
		// Please use ID for the *key*, do NOT use push, eg this.excludeIDs.markers[id] = true
		this.excludeIDs = {
			markers: [],
			polygons: [],
			polylines: []
		};
		
		// This session ID is unique to the map on this visit, as opposed to the PHP session ID. This is used server side to remember which markers have already been sent
		this.sessionID = generateUUID();	
		
		this.ajaxTimeoutID = null;
		this.pendingAJAXRequests = 0;
		
		this.loadSettings();
		this.loadGoogleMap();
		
		this.storeLocator = new WPGMZA.StoreLocator(this);
		
		$(element).find(".wpgmza-load-failed").remove();
	}
	
	WPGMZA.Map.ALIGN_LEFT 		= 1;
	WPGMZA.Map.ALIGN_CENTER 	= 2;
	WPGMZA.Map.ALIGN_RIGHT		= 3;
	WPGMZA.Map.ALIGN_NONE		= 4;
	
	/**
	 * Loads all the settings from the data-settings attribute of the element
	 * @return void
	 */
	WPGMZA.Map.prototype.loadSettings = function()
	{
		var localSettings = new WPGMZA.MapSettings(this.element);
		var localizedSettings = new WPGMZA.MapSettings(this.element);
		
		$.extend(localizedSettings, WPGMZA.settings, localSettings);
		
		this.settings = localizedSettings;

		this.setDimensions(this.settings.width, this.settings.height);
		this.setAlignment(this.settings.map_align);
	}
	
	/**
	 * Creates the Google Maps map
	 * @return void
	 */
	WPGMZA.Map.prototype.loadGoogleMap = function()
	{
		var self = this;
		var options = this.settings.toGoogleMapsOptions();
		
		this.googleMap = new google.maps.Map(this.googleElement, options);
		google.maps.event.addListener(this.googleMap, "bounds_changed", function() { self.onBoundsChanged(); });
		
		if(this.settings.bicycle)
			this.enableBicycleLayer(true);
		if(this.settings.traffic)
			this.enableTrafficLayer(true);
		if(this.settings.transport)
			this.enablePublicTransportLayer(true);
		this.showPointsOfInterest(this.settings.show_points_of_interest);
	}
	
	/**
	 * Fired when map bounds are initially set or change
	 * @return void
	 */
	WPGMZA.Map.prototype.onBoundsChanged = function()
	{
		var self = this;
		
		if(this.ajaxTimeoutID != null)
			clearTimeout(this.ajaxTimeoutID);
		
		this.ajaxTimeoutID = setTimeout(function() {
			self.fetch();
		}, 500);
		
		this.dispatchEvent({type: "bounds_changed"});
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	WPGMZA.Map.prototype.addMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		marker.map = this;
		marker.googleMarker.setMap(this.googleMap);
		
		this.markers.push(marker);
		this.dispatchEvent({type: "markeradded", marker: marker});
		marker.dispatchEvent({type: "added"});
	}
	
	WPGMZA.Map.prototype.deleteMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		marker.map = null;
		marker.googleMarker.setMap(null);
		
		this.markers.splice(this.markers.indexOf(marker), 1);
		this.dispatchEvent({type: "markerremoved", marker: marker});
		marker.dispatchEvent({type: "removed"});
	}
	
	WPGMZA.Map.prototype.getMarkerByID = function(id)
	{
		for(var i = 0; i < this.markers.length; i++)
		{
			if(this.markers[i].id == id)
				return this.markers[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.deleteMarkerByID = function(id)
	{
		var marker = this.getMarkerByID(id);
		
		if(!marker)
			return;
		
		this.deleteMarker(marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	WPGMZA.Map.prototype.addPolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		polygon.map = this;
		polygon.googlePolygon.setMap(this.googleMap);
		
		this.polygons.push(polygon);
		this.dispatchEvent({type: "polygonadded", polygon: polygon});
	}
	
	WPGMZA.Map.prototype.deletePolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		if(polygon.map !== this)
			throw new Error("Wrong map error");
		
		polygon.map = null;
		polygon.googlePolygon.setMap(null);
		
		this.polygons.splice(this.polygons.indexOf(polygon), 1);
		this.dispatchEvent({type: "polygonremoved", polygon: polygon});
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	WPGMZA.Map.prototype.addPolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		polyline.map = this;
		polyline.googlePolyline.setMap(this.googleMap);
		
		this.polylines.push(polyline);
		this.dispatchEvent({type: "polylineadded", polyline: polyline});
	}
	
	WPGMZA.Map.prototype.deletePolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		if(polyline.map !== this)
			throw new Error("Wrong map error");
		
		polyline.map = null;
		polyline.googlePolyline.setMap(null);
		
		this.polylines.splice(this.polylines.indexOf(polyline), 1);
		this.dispatchEvent({type: "polylineremoved", polyline: polyline});
	}
	
	/* 
	TODO: I'm a little bit worried that these delegate functions might end up being hard to maintain
	*/
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.Map.prototype.getCenter = function()
	{
		return this.googleMap.getCenter();
	}
	
	/**
	 * Delegate for google maps setCenter
	 * @return void
	 */
	WPGMZA.Map.prototype.setCenter = function(latLng)
	{
		this.googleMap.setCenter(latLng);
	}
	
	/**
	 * Delegate for google maps getCenter
	 * @return void
	 */
	WPGMZA.Map.prototype.getZoom = function()
	{
		return this.googleMap.getZoom();
	}
	
	/**
	 * Delegate for google maps getZoom
	 * @return void
	 */
	WPGMZA.Map.prototype.setZoom = function(value)
	{
		return this.googleMap.setZoom(value);
	}
	
	/**
	 * Gets the distance between two latLngs in kilometers
	 * NB: Static function
	 * @return number
	 */
	var earthRadiusMeters = 6378137;
	var piTimes360 = Math.PI / 360;
	
	WPGMZA.Map.getGeographicDistance = function(lat1, lng1, lat2, lng2)
	{
		var clat = Math.cos((lat1 + lng1) * piTimes360),
			dlat = (lat2 - lat1) * piTimes360,
			dlon = (lng2 - lng1) * piTimes360,
			f = dlat * dlat + clat * clat + dlon * dlon,
			c = 2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f));
		return (earthRadiusMeters * c) / 1000;
	}
	
	/**
	 * Get closeset marker, used by store locator
	 * TODO: A binary tree or  quadtree would speed this up massively
	 * @param latLng
	 * @return WPGMZA.Marker
	 */
	WPGMZA.Map.prototype.getClosestMarker = function(latLng)
	{
		var dist;
		var closestIndex;
		var closestDistance = Infinity;
		
		var x1 = latLng.lng();
		var y1 = latLng.lat();
		var x2, y2, dx, dy;
		var position;
		var count = this.markers.length;
		
		if(count == 0)
			return null;
		
		for(var i = 0; i < count; i++)
		{
			// IMPORTANT: Please do NOT use this formula for getting the distance between two latLngs, it is ONLY good for a quick and dirty way to find the closest marker. It does not account for the curvature of the earth.
			position = this.markers[i].googleMarker.getPosition();
			x2 = position.lng();
			y2 = position.lat();
			dx = x2 - x1;
			dy = y2 - y1;
			
			dist = Math.sqrt(dx * dx + dy * dy);
			
			if(dist < closestDistance)
			{
				closestDistance = dist;
				closestIndex = i;
			}
		}
		
		return this.markers[closestIndex];
	}
	
	/**
	 * Fetches all markers, polygons and polylines within viewport bounds
	 * @return void
	 */
	WPGMZA.Map.prototype.fetch = function()
	{
		var self = this;
		var data = {
			map_id:	this.id,
			action:	"wpgmza_map_fetch",
			bounds: this.googleMap.getBounds().toUrlValue(7),
			sid:	this.sessionID
		};
		
		this.pendingAJAXRequests++;
		$(this.loader).show();
		
		$.ajax(this.settings.ajaxurl, {
			data: data,
			complete: function() {
				if(--self.pendingAJAXRequests == 0)
					$(self.loader).hide();
			},
			success: function(response) {
				var json;
				
				if(typeof response === "string")
					json = JSON.parse(response);
				else
					json = response;
				
				for(var i = 0; i < json.markers.length; i++)
				{
					if(self.excludeIDs.markers[json.markers[i].id])
						continue;
					
					var marker = new WPGMZA.Marker(json.markers[i]);
					marker.modified = false;
					self.addMarker(marker);
				}
				
				for(i = 0; i < json.polygons.length; i++)
				{
					if(self.excludeIDs.polygons[json.polygons[i].id])
						continue;
					
					var polygon = new WPGMZA.Polygon(json.polygons[i]);
					polygon.modified = false;
					self.addPolygon(polygon);
				}
				
				for(i = 0; i < json.polylines.length; i++)
				{
					if(self.excludeIDs.polylines[json.polylines[i].id])
						continue;
					
					var polyline = new WPGMZA.Polyline(json.polylines[i]);
					polyline.modified = false;
					self.addPolyline(polyline);
				}
				
				self.dispatchEvent({type: "fetchsuccess"});
			}
		});
	}
	
	/**
	 * Enables / disables the bicycle layer
	 * @param enable boolean, enable or not
	 * @return void
	 */
	WPGMZA.Map.prototype.enableBicycleLayer = function(enable)
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
	WPGMZA.Map.prototype.enableTrafficLayer = function(enable)
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
	WPGMZA.Map.prototype.enablePublicTransportLayer = function(enable)
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
	WPGMZA.Map.prototype.showPointsOfInterest = function(show)
	{
		var styles = [
			{
				featureType: "poi",
				stylers: [
					{
						visibility: (show ? "on" : "off")
					}
				]
			}
		];
		
		this.googleMap.setOptions({styles: styles});
	}
	
	/**
	 * Sets the dimensions of the map
	 * @return void
	 */
	WPGMZA.Map.prototype.setDimensions = function(width, height)
	{
		$(this.element).css({
			width: width,
			height: height
		});
		
		$(this.googleElement).css({
			width: "100%",
			height: height
		});
	}
	
	/**
	 * Changes the alignment of the map
	 * @param align 1 = Left, 2 = Center, 3 = Right, 4 = None
	 * @return void
	 */
	WPGMZA.Map.prototype.setAlignment = function(align)
	{
		var css;
		switch(align)
		{
			case WPGMZA.Map.ALIGN_LEFT:
				css = {
					"float": "left"
				};
				break;
			case WPGMZA.Map.ALIGN_CENTER:
				css = {
					"margin-left":	"auto",
					"margin-right": "auto",
					"float":		"none"
				};
				break;
			case WPGMZA.Map.ALIGN_RIGHT:
				css = {
					"float": "right"
				};
				break;
			default:
				css = {
					"float": "none"
				};
				break;
		}
		
		if(css)
			$(this.element).css(css);
	}
	
	$(document).ready(function() {
		if(false != WPGMZA.settings.autoCreateMaps)
		{
			$(".wpgmza-map").each(function(index, el) {
				new WPGMZA.Map(el);
			});
		}
	});
	
	eventDispatcher.apply(WPGMZA.Map.prototype);
})(jQuery);