/**
 * @namespace WPGMZA
 * @module GoogleMap
 * @requires WPGMZA.Map
 * @gulp-requires ../map.js
 * @pro-requires WPGMZA.ProMap
 * @gulp-pro-requires pro-map.js
 */
jQuery(function($) {
	var Parent;
	
	/**
	 * Constructor
	 * @param element to contain the map
	 */
	WPGMZA.GoogleMap = function(element, options)
	{
		var self = this;
		
		Parent.call(this, element, options);
		
		if(!window.google)
		{
			var status = WPGMZA.googleAPIStatus;
			var message = "Google API not loaded";
			
			if(status && status.message)
				message += " - " + status.message;
			
			if(status.code == "USER_CONSENT_NOT_GIVEN")
			{
				return;
			}
			
			$(element).html("<div class='notice notice-error'><p>" + WPGMZA.localized_strings.google_api_not_loaded + "<pre>" + message + "</pre></p></div>");
			
			throw new Error(message);
		}
		
		this.loadGoogleMap();
		
		if(options)
			this.setOptions(options, true);

		google.maps.event.addListener(this.googleMap, "click", function(event) {
			var wpgmzaEvent = new WPGMZA.Event("click");
			wpgmzaEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(wpgmzaEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "rightclick", function(event) {
			var wpgmzaEvent = new WPGMZA.Event("rightclick");
			wpgmzaEvent.latLng = {
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			self.dispatchEvent(wpgmzaEvent);
		});
		
		google.maps.event.addListener(this.googleMap, "dragend", function(event) {
			self.dispatchEvent("dragend");
		});
		
		google.maps.event.addListener(this.googleMap, "zoom_changed", function(event) {
			self.dispatchEvent("zoom_changed");
			self.dispatchEvent("zoomchanged");
		});
		
		// Idle event
		google.maps.event.addListener(this.googleMap, "idle", function(event) {
			self.onIdle(event);
		});
		
		// Dispatch event
		if(!WPGMZA.isProVersion())
		{
			this.trigger("init");
			
			this.dispatchEvent("created");
			WPGMZA.events.dispatchEvent({type: "mapcreated", map: this});
			
			// Legacy event
			$(this.element).trigger("wpgooglemaps_loaded");
		}
	}
	
	// If we're running the Pro version, inherit from ProMap, otherwise, inherit from Map
	if(WPGMZA.isProVersion())
	{
		Parent = WPGMZA.ProMap;
		WPGMZA.GoogleMap.prototype = Object.create(WPGMZA.ProMap.prototype);
	}
	else
	{
		Parent = WPGMZA.Map;
		WPGMZA.GoogleMap.prototype = Object.create(WPGMZA.Map.prototype);
	}
	WPGMZA.GoogleMap.prototype.constructor = WPGMZA.GoogleMap;
	
	WPGMZA.GoogleMap.parseThemeData = function(raw)
	{
		var json;
		
		try{
			json = JSON.parse(raw);	// Try to parse strict JSON
		}catch(e) {
			
			try{
				
				json = eval(raw);	// Try to parse JS object
				
			}catch(e) {
				
				var str = raw;
				
				str = str.replace(/\\'/g, '\'');
				str = str.replace(/\\"/g, '"');
				str = str.replace(/\\0/g, '\0');
				str = str.replace(/\\\\/g, '\\');
				
				try{
					
					json = eval(str);
					
				}catch(e) {
					
					console.warn("Couldn't parse theme data");
				
				return [];
					
				}
				
			}
			
		}
		
		return json;
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
		
		if(this.settings.bicycle == 1)
			this.enableBicycleLayer(true);
		if(this.settings.traffic == 1)
			this.enableTrafficLayer(true);
		if(this.settings.transport == 1)
			this.enablePublicTransportLayer(true);
		this.showPointsOfInterest(this.settings.show_point_of_interest);
		
		// Move the loading wheel into the map element (it has to live outside in the HTML file because it'll be overwritten by Google otherwise)
		$(this.engineElement).append($(this.element).find(".wpgmza-loader"));
	}
	
	WPGMZA.GoogleMap.prototype.setOptions = function(options, initializing)
	{
		Parent.prototype.setOptions.call(this, options);
		
		if(options.scrollwheel)
			delete options.scrollwheel;	// NB: Delete this when true, scrollwheel: true breaks gesture handling
		
		if(!initializing)
		{
			this.googleMap.setOptions(options);
			return;
		}
		
		var converted = $.extend(options, this.settings.toGoogleMapsOptions());
		
		var clone = $.extend({}, converted);
		if(!clone.center instanceof google.maps.LatLng && (clone.center instanceof WPGMZA.LatLng || typeof clone.center == "object"))
			clone.center = {
				lat: parseFloat(clone.center.lat),
				lng: parseFloat(clone.center.lng)
			};
		
		if(this.settings.hide_point_of_interest == "1")
		{
			var noPoi = {
				featureType: "poi",
				elementType: "labels",
				stylers: [
					{
						visibility: "off"
					}
				]
			};
			
			if(!clone.styles)
				clone.styles = [];
			
			clone.styles.push(noPoi);
		}
		
		this.googleMap.setOptions(clone);
	}
	
	/**
	 * Adds the specified marker to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addMarker = function(marker)
	{
		marker.googleMarker.setMap(this.googleMap);
		
		Parent.prototype.addMarker.call(this, marker);
	}
	
	/**
	 * Removes the specified marker from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.removeMarker = function(marker)
	{
		marker.googleMarker.setMap(null);
		
		Parent.prototype.removeMarker.call(this, marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addPolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(this.googleMap);
		
		Parent.prototype.addPolygon.call(this, polygon);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.removePolygon = function(polygon)
	{
		polygon.googlePolygon.setMap(null);
		
		Parent.prototype.removePolygon.call(this, polygon);
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.addPolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(this.googleMap);
		
		Parent.prototype.addPolyline.call(this, polyline);
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.removePolyline = function(polyline)
	{
		polyline.googlePolyline.setMap(null);
		
		Parent.prototype.removePolyline.call(this, polyline);
	}
	
	WPGMZA.GoogleMap.prototype.addCircle = function(circle)
	{
		circle.googleCircle.setMap(this.googleMap);
		
		Parent.prototype.addCircle.call(this, circle);
	}
	
	WPGMZA.GoogleMap.prototype.removeCircle = function(circle)
	{
		circle.googleCircle.setMap(null);
		
		Parent.prototype.removeCircle.call(this, circle);
	}
	
	WPGMZA.GoogleMap.prototype.addRectangle = function(rectangle)
	{
		rectangle.googleRectangle.setMap(this.googleMap);
		
		Parent.prototype.addRectangle.call(this, rectangle);
	}
	
	WPGMZA.GoogleMap.prototype.removeRectangle = function(rectangle)
	{
		rectangle.googleRectangle.setMap(null);
		
		Parent.prototype.removeRectangle.call(this, rectangle);
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
		WPGMZA.Map.prototype.setCenter.call(this, latLng);
		
		if(latLng instanceof WPGMZA.LatLng)
			this.googleMap.setCenter({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
			this.googleMap.setCenter(latLng);
	}
	
	/**
	 * Delegate for google maps setPan
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.panTo = function(latLng)
	{
		if(latLng instanceof WPGMZA.LatLng)
			this.googleMap.panTo({
				lat: latLng.lat,
				lng: latLng.lng
			});
		else
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
		if(isNaN(value))
			throw new Error("Value must not be NaN");
		
		return this.googleMap.setZoom(parseInt(value));
	}
	
	/**
	 * Gets the bounds
	 * @return object
	 */
	WPGMZA.GoogleMap.prototype.getBounds = function()
	{
		var bounds = this.googleMap.getBounds();
		var northEast = bounds.getNorthEast();
		var southWest = bounds.getSouthWest();
		
		var nativeBounds = new WPGMZA.LatLngBounds({});
		
		nativeBounds.north = northEast.lat();
		nativeBounds.south = southWest.lat();
		nativeBounds.west = southWest.lng();
		nativeBounds.east = northEast.lng();
		
		// Backward compatibility
		nativeBounds.topLeft = {
			lat: northEast.lat(),
			lng: southWest.lng()
		};
		
		nativeBounds.bottomRight = {
			lat: southWest.lat(),
			lng: northEast.lng()
		};
		
		return nativeBounds;
	}
	
	/**
	 * Fit to given boundaries
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.fitBounds = function(southWest, northEast)
	{
		if(southWest instanceof WPGMZA.LatLng)
			southWest = {lat: southWest.lat, lng: southWest.lng};
		if(northEast instanceof WPGMZA.LatLng)
			northEast = {lat: northEast.lat, lng: northEast.lng};
		else if(southWest instanceof WPGMZA.LatLngBounds)
		{
			var bounds = southWest;
			
			southWest = {
				lat: bounds.south,
				lng: bounds.west
			};
			
			northEast = {
				lat: bounds.north,
				lng: bounds.east
			};
		}
		
		var nativeBounds = new google.maps.LatLngBounds(southWest, northEast);
		this.googleMap.fitBounds(nativeBounds);
	}
	
	/**
	 * Fit the map boundaries to visible markers
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.fitBoundsToVisibleMarkers = function()
	{
		var bounds = new google.maps.LatLngBounds();
		for(var i = 0; i < this.markers.length; i++)
		{
			if(markers[i].getVisible())
				bounds.extend(markers[i].getPosition());
		}
		this.googleMap.fitBounds(bounds);
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
		// TODO: This will bug the front end because there is no textarea with theme data
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
		return parseInt(this.settings.min_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setMinZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: value,
			maxZoom: this.getMaxZoom()
		});
	}
	
	/**
	 * Gets the min zoom of the map
	 * @return int
	 */
	WPGMZA.GoogleMap.prototype.getMaxZoom = function()
	{
		return parseInt(this.settings.max_zoom);
	}
	
	/**
	 * Sets the min zoom of the map
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.setMaxZoom = function(value)
	{
		this.googleMap.setOptions({
			minZoom: this.getMinZoom(),
			maxZoom: value
		});
	}
	
	WPGMZA.GoogleMap.prototype.latLngToPixels = function(latLng)
	{
		var map = this.googleMap;
		var nativeLatLng = new google.maps.LatLng({
			lat: parseFloat(latLng.lat),
			lng: parseFloat(latLng.lng)
		});
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = map.getProjection().fromLatLngToPoint(nativeLatLng);
		return {
			x: (worldPoint.x - bottomLeft.x) * scale, 
			y: (worldPoint.y - topRight.y) * scale
		};
	}
	
	WPGMZA.GoogleMap.prototype.pixelsToLatLng = function(x, y)
	{
		if(y == undefined)
		{
			if("x" in x && "y" in x)
			{
				y = x.y;
				x = x.x;
			}
			else
				console.warn("Y coordinate undefined in pixelsToLatLng (did you mean to pass 2 arguments?)");
		}
		
		var map = this.googleMap;
		var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
		var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
		var scale = Math.pow(2, map.getZoom());
		var worldPoint = new google.maps.Point(x / scale + bottomLeft.x, y / scale + topRight.y);
		var latLng = map.getProjection().fromPointToLatLng(worldPoint);
		return {
			lat: latLng.lat(),
			lng: latLng.lng()
		};
	}
	
	/**
	 * Handle the map element resizing
	 * @return void
	 */
	WPGMZA.GoogleMap.prototype.onElementResized = function(event)
	{
		if(!this.googleMap)
			return;
		google.maps.event.trigger(this.googleMap, "resize");
	}

	WPGMZA.GoogleMap.prototype.enableAllInteractions = function()
	{	
		var options = {};

		options.scrollwheel				= true;
		options.draggable				= true;
		options.disableDoubleClickZoom	= false;
		
		this.googleMap.setOptions(options);
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtbWFwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZU1hcFxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1hcFxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9tYXAuanNcclxuICogQHByby1yZXF1aXJlcyBXUEdNWkEuUHJvTWFwXHJcbiAqIEBndWxwLXByby1yZXF1aXJlcyBwcm8tbWFwLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdHZhciBQYXJlbnQ7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ29uc3RydWN0b3JcclxuXHQgKiBAcGFyYW0gZWxlbWVudCB0byBjb250YWluIHRoZSBtYXBcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucylcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFBhcmVudC5jYWxsKHRoaXMsIGVsZW1lbnQsIG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHRpZighd2luZG93Lmdvb2dsZSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIHN0YXR1cyA9IFdQR01aQS5nb29nbGVBUElTdGF0dXM7XHJcblx0XHRcdHZhciBtZXNzYWdlID0gXCJHb29nbGUgQVBJIG5vdCBsb2FkZWRcIjtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHN0YXR1cyAmJiBzdGF0dXMubWVzc2FnZSlcclxuXHRcdFx0XHRtZXNzYWdlICs9IFwiIC0gXCIgKyBzdGF0dXMubWVzc2FnZTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHN0YXR1cy5jb2RlID09IFwiVVNFUl9DT05TRU5UX05PVF9HSVZFTlwiKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHQkKGVsZW1lbnQpLmh0bWwoXCI8ZGl2IGNsYXNzPSdub3RpY2Ugbm90aWNlLWVycm9yJz48cD5cIiArIFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5nb29nbGVfYXBpX25vdF9sb2FkZWQgKyBcIjxwcmU+XCIgKyBtZXNzYWdlICsgXCI8L3ByZT48L3A+PC9kaXY+XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR0aGlzLmxvYWRHb29nbGVNYXAoKTtcclxuXHRcdFxyXG5cdFx0aWYob3B0aW9ucylcclxuXHRcdFx0dGhpcy5zZXRPcHRpb25zKG9wdGlvbnMsIHRydWUpO1xyXG5cclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFwLCBcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHZhciB3cGdtemFFdmVudCA9IG5ldyBXUEdNWkEuRXZlbnQoXCJjbGlja1wiKTtcclxuXHRcdFx0d3BnbXphRXZlbnQubGF0TG5nID0ge1xyXG5cdFx0XHRcdGxhdDogZXZlbnQubGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogZXZlbnQubGF0TG5nLmxuZygpXHJcblx0XHRcdH07XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudCh3cGdtemFFdmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5nb29nbGVNYXAsIFwicmlnaHRjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHR2YXIgd3BnbXphRXZlbnQgPSBuZXcgV1BHTVpBLkV2ZW50KFwicmlnaHRjbGlja1wiKTtcclxuXHRcdFx0d3BnbXphRXZlbnQubGF0TG5nID0ge1xyXG5cdFx0XHRcdGxhdDogZXZlbnQubGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRcdGxuZzogZXZlbnQubGF0TG5nLmxuZygpXHJcblx0XHRcdH07XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudCh3cGdtemFFdmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5nb29nbGVNYXAsIFwiZHJhZ2VuZFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJkcmFnZW5kXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFwLCBcInpvb21fY2hhbmdlZFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLmRpc3BhdGNoRXZlbnQoXCJ6b29tX2NoYW5nZWRcIik7XHJcblx0XHRcdHNlbGYuZGlzcGF0Y2hFdmVudChcInpvb21jaGFuZ2VkXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIElkbGUgZXZlbnRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKHRoaXMuZ29vZ2xlTWFwLCBcImlkbGVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbklkbGUoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdC8vIERpc3BhdGNoIGV2ZW50XHJcblx0XHRpZighV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnRyaWdnZXIoXCJpbml0XCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KFwiY3JlYXRlZFwiKTtcclxuXHRcdFx0V1BHTVpBLmV2ZW50cy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcIm1hcGNyZWF0ZWRcIiwgbWFwOiB0aGlzfSk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBMZWdhY3kgZXZlbnRcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLnRyaWdnZXIoXCJ3cGdvb2dsZW1hcHNfbG9hZGVkXCIpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyBJZiB3ZSdyZSBydW5uaW5nIHRoZSBQcm8gdmVyc2lvbiwgaW5oZXJpdCBmcm9tIFByb01hcCwgb3RoZXJ3aXNlLCBpbmhlcml0IGZyb20gTWFwXHJcblx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdHtcclxuXHRcdFBhcmVudCA9IFdQR01aQS5Qcm9NYXA7XHJcblx0XHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLlByb01hcC5wcm90b3R5cGUpO1xyXG5cdH1cclxuXHRlbHNlXHJcblx0e1xyXG5cdFx0UGFyZW50ID0gV1BHTVpBLk1hcDtcclxuXHRcdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTWFwLnByb3RvdHlwZSk7XHJcblx0fVxyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLkdvb2dsZU1hcDtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFwLnBhcnNlVGhlbWVEYXRhID0gZnVuY3Rpb24ocmF3KVxyXG5cdHtcclxuXHRcdHZhciBqc29uO1xyXG5cdFx0XHJcblx0XHR0cnl7XHJcblx0XHRcdGpzb24gPSBKU09OLnBhcnNlKHJhdyk7XHQvLyBUcnkgdG8gcGFyc2Ugc3RyaWN0IEpTT05cclxuXHRcdH1jYXRjaChlKSB7XHJcblx0XHRcdFxyXG5cdFx0XHR0cnl7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0anNvbiA9IGV2YWwocmF3KTtcdC8vIFRyeSB0byBwYXJzZSBKUyBvYmplY3RcclxuXHRcdFx0XHRcclxuXHRcdFx0fWNhdGNoKGUpIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR2YXIgc3RyID0gcmF3O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9cXFxcJy9nLCAnXFwnJyk7XHJcblx0XHRcdFx0c3RyID0gc3RyLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKTtcclxuXHRcdFx0XHRzdHIgPSBzdHIucmVwbGFjZSgvXFxcXDAvZywgJ1xcMCcpO1xyXG5cdFx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKC9cXFxcXFxcXC9nLCAnXFxcXCcpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRyeXtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0anNvbiA9IGV2YWwoc3RyKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdH1jYXRjaChlKSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNvbnNvbGUud2FybihcIkNvdWxkbid0IHBhcnNlIHRoZW1lIGRhdGFcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuIFtdO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4ganNvbjtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyB0aGUgR29vZ2xlIE1hcHMgbWFwXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUubG9hZEdvb2dsZU1hcCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMuc2V0dGluZ3MudG9Hb29nbGVNYXBzT3B0aW9ucygpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5lbmdpbmVFbGVtZW50LCBvcHRpb25zKTtcclxuXHRcdFxyXG5cdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIodGhpcy5nb29nbGVNYXAsIFwiYm91bmRzX2NoYW5nZWRcIiwgZnVuY3Rpb24oKSB7IFxyXG5cdFx0XHRzZWxmLm9uQm91bmRzQ2hhbmdlZCgpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuc2V0dGluZ3MuYmljeWNsZSA9PSAxKVxyXG5cdFx0XHR0aGlzLmVuYWJsZUJpY3ljbGVMYXllcih0cnVlKTtcclxuXHRcdGlmKHRoaXMuc2V0dGluZ3MudHJhZmZpYyA9PSAxKVxyXG5cdFx0XHR0aGlzLmVuYWJsZVRyYWZmaWNMYXllcih0cnVlKTtcclxuXHRcdGlmKHRoaXMuc2V0dGluZ3MudHJhbnNwb3J0ID09IDEpXHJcblx0XHRcdHRoaXMuZW5hYmxlUHVibGljVHJhbnNwb3J0TGF5ZXIodHJ1ZSk7XHJcblx0XHR0aGlzLnNob3dQb2ludHNPZkludGVyZXN0KHRoaXMuc2V0dGluZ3Muc2hvd19wb2ludF9vZl9pbnRlcmVzdCk7XHJcblx0XHRcclxuXHRcdC8vIE1vdmUgdGhlIGxvYWRpbmcgd2hlZWwgaW50byB0aGUgbWFwIGVsZW1lbnQgKGl0IGhhcyB0byBsaXZlIG91dHNpZGUgaW4gdGhlIEhUTUwgZmlsZSBiZWNhdXNlIGl0J2xsIGJlIG92ZXJ3cml0dGVuIGJ5IEdvb2dsZSBvdGhlcndpc2UpXHJcblx0XHQkKHRoaXMuZW5naW5lRWxlbWVudCkuYXBwZW5kKCQodGhpcy5lbGVtZW50KS5maW5kKFwiLndwZ216YS1sb2FkZXJcIikpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucywgaW5pdGlhbGl6aW5nKVxyXG5cdHtcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuc2V0T3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLnNjcm9sbHdoZWVsKVxyXG5cdFx0XHRkZWxldGUgb3B0aW9ucy5zY3JvbGx3aGVlbDtcdC8vIE5COiBEZWxldGUgdGhpcyB3aGVuIHRydWUsIHNjcm9sbHdoZWVsOiB0cnVlIGJyZWFrcyBnZXN0dXJlIGhhbmRsaW5nXHJcblx0XHRcclxuXHRcdGlmKCFpbml0aWFsaXppbmcpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMuZ29vZ2xlTWFwLnNldE9wdGlvbnMob3B0aW9ucyk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIGNvbnZlcnRlZCA9ICQuZXh0ZW5kKG9wdGlvbnMsIHRoaXMuc2V0dGluZ3MudG9Hb29nbGVNYXBzT3B0aW9ucygpKTtcclxuXHRcdFxyXG5cdFx0dmFyIGNsb25lID0gJC5leHRlbmQoe30sIGNvbnZlcnRlZCk7XHJcblx0XHRpZighY2xvbmUuY2VudGVyIGluc3RhbmNlb2YgZ29vZ2xlLm1hcHMuTGF0TG5nICYmIChjbG9uZS5jZW50ZXIgaW5zdGFuY2VvZiBXUEdNWkEuTGF0TG5nIHx8IHR5cGVvZiBjbG9uZS5jZW50ZXIgPT0gXCJvYmplY3RcIikpXHJcblx0XHRcdGNsb25lLmNlbnRlciA9IHtcclxuXHRcdFx0XHRsYXQ6IHBhcnNlRmxvYXQoY2xvbmUuY2VudGVyLmxhdCksXHJcblx0XHRcdFx0bG5nOiBwYXJzZUZsb2F0KGNsb25lLmNlbnRlci5sbmcpXHJcblx0XHRcdH07XHJcblx0XHRcclxuXHRcdGlmKHRoaXMuc2V0dGluZ3MuaGlkZV9wb2ludF9vZl9pbnRlcmVzdCA9PSBcIjFcIilcclxuXHRcdHtcclxuXHRcdFx0dmFyIG5vUG9pID0ge1xyXG5cdFx0XHRcdGZlYXR1cmVUeXBlOiBcInBvaVwiLFxyXG5cdFx0XHRcdGVsZW1lbnRUeXBlOiBcImxhYmVsc1wiLFxyXG5cdFx0XHRcdHN0eWxlcnM6IFtcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dmlzaWJpbGl0eTogXCJvZmZcIlxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdF1cclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKCFjbG9uZS5zdHlsZXMpXHJcblx0XHRcdFx0Y2xvbmUuc3R5bGVzID0gW107XHJcblx0XHRcdFxyXG5cdFx0XHRjbG9uZS5zdHlsZXMucHVzaChub1BvaSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMuZ29vZ2xlTWFwLnNldE9wdGlvbnMoY2xvbmUpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBZGRzIHRoZSBzcGVjaWZpZWQgbWFya2VyIHRvIHRoaXMgbWFwXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuYWRkTWFya2VyID0gZnVuY3Rpb24obWFya2VyKVxyXG5cdHtcclxuXHRcdG1hcmtlci5nb29nbGVNYXJrZXIuc2V0TWFwKHRoaXMuZ29vZ2xlTWFwKTtcclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5hZGRNYXJrZXIuY2FsbCh0aGlzLCBtYXJrZXIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgbWFya2VyIGZyb20gdGhpcyBtYXBcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5yZW1vdmVNYXJrZXIgPSBmdW5jdGlvbihtYXJrZXIpXHJcblx0e1xyXG5cdFx0bWFya2VyLmdvb2dsZU1hcmtlci5zZXRNYXAobnVsbCk7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUucmVtb3ZlTWFya2VyLmNhbGwodGhpcywgbWFya2VyKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQWRkcyB0aGUgc3BlY2lmaWVkIHBvbHlnb24gdG8gdGhpcyBtYXBcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5hZGRQb2x5Z29uID0gZnVuY3Rpb24ocG9seWdvbilcclxuXHR7XHJcblx0XHRwb2x5Z29uLmdvb2dsZVBvbHlnb24uc2V0TWFwKHRoaXMuZ29vZ2xlTWFwKTtcclxuXHRcdFxyXG5cdFx0UGFyZW50LnByb3RvdHlwZS5hZGRQb2x5Z29uLmNhbGwodGhpcywgcG9seWdvbik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBwb2x5Z29uIGZyb20gdGhpcyBtYXBcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5yZW1vdmVQb2x5Z29uID0gZnVuY3Rpb24ocG9seWdvbilcclxuXHR7XHJcblx0XHRwb2x5Z29uLmdvb2dsZVBvbHlnb24uc2V0TWFwKG51bGwpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnJlbW92ZVBvbHlnb24uY2FsbCh0aGlzLCBwb2x5Z29uKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQWRkcyB0aGUgc3BlY2lmaWVkIHBvbHlsaW5lIHRvIHRoaXMgbWFwXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuYWRkUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHRwb2x5bGluZS5nb29nbGVQb2x5bGluZS5zZXRNYXAodGhpcy5nb29nbGVNYXApO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLmFkZFBvbHlsaW5lLmNhbGwodGhpcywgcG9seWxpbmUpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgcG9seWdvbiBmcm9tIHRoaXMgbWFwXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUucmVtb3ZlUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHRwb2x5bGluZS5nb29nbGVQb2x5bGluZS5zZXRNYXAobnVsbCk7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUucmVtb3ZlUG9seWxpbmUuY2FsbCh0aGlzLCBwb2x5bGluZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmFkZENpcmNsZSA9IGZ1bmN0aW9uKGNpcmNsZSlcclxuXHR7XHJcblx0XHRjaXJjbGUuZ29vZ2xlQ2lyY2xlLnNldE1hcCh0aGlzLmdvb2dsZU1hcCk7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkQ2lyY2xlLmNhbGwodGhpcywgY2lyY2xlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUucmVtb3ZlQ2lyY2xlID0gZnVuY3Rpb24oY2lyY2xlKVxyXG5cdHtcclxuXHRcdGNpcmNsZS5nb29nbGVDaXJjbGUuc2V0TWFwKG51bGwpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnJlbW92ZUNpcmNsZS5jYWxsKHRoaXMsIGNpcmNsZSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmFkZFJlY3RhbmdsZSA9IGZ1bmN0aW9uKHJlY3RhbmdsZSlcclxuXHR7XHJcblx0XHRyZWN0YW5nbGUuZ29vZ2xlUmVjdGFuZ2xlLnNldE1hcCh0aGlzLmdvb2dsZU1hcCk7XHJcblx0XHRcclxuXHRcdFBhcmVudC5wcm90b3R5cGUuYWRkUmVjdGFuZ2xlLmNhbGwodGhpcywgcmVjdGFuZ2xlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUucmVtb3ZlUmVjdGFuZ2xlID0gZnVuY3Rpb24ocmVjdGFuZ2xlKVxyXG5cdHtcclxuXHRcdHJlY3RhbmdsZS5nb29nbGVSZWN0YW5nbGUuc2V0TWFwKG51bGwpO1xyXG5cdFx0XHJcblx0XHRQYXJlbnQucHJvdG90eXBlLnJlbW92ZVJlY3RhbmdsZS5jYWxsKHRoaXMsIHJlY3RhbmdsZSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIERlbGVnYXRlIGZvciBnb29nbGUgbWFwcyBnZXRDZW50ZXJcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGxhdExuZyA9IHRoaXMuZ29vZ2xlTWFwLmdldENlbnRlcigpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRsYXQ6IGxhdExuZy5sYXQoKSxcclxuXHRcdFx0bG5nOiBsYXRMbmcubG5nKClcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIERlbGVnYXRlIGZvciBnb29nbGUgbWFwcyBzZXRDZW50ZXJcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbihsYXRMbmcpXHJcblx0e1xyXG5cdFx0V1BHTVpBLk1hcC5wcm90b3R5cGUuc2V0Q2VudGVyLmNhbGwodGhpcywgbGF0TG5nKTtcclxuXHRcdFxyXG5cdFx0aWYobGF0TG5nIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZylcclxuXHRcdFx0dGhpcy5nb29nbGVNYXAuc2V0Q2VudGVyKHtcclxuXHRcdFx0XHRsYXQ6IGxhdExuZy5sYXQsXHJcblx0XHRcdFx0bG5nOiBsYXRMbmcubG5nXHJcblx0XHRcdH0pO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcC5zZXRDZW50ZXIobGF0TG5nKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogRGVsZWdhdGUgZm9yIGdvb2dsZSBtYXBzIHNldFBhblxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLnBhblRvID0gZnVuY3Rpb24obGF0TG5nKVxyXG5cdHtcclxuXHRcdGlmKGxhdExuZyBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHRcdHRoaXMuZ29vZ2xlTWFwLnBhblRvKHtcclxuXHRcdFx0XHRsYXQ6IGxhdExuZy5sYXQsXHJcblx0XHRcdFx0bG5nOiBsYXRMbmcubG5nXHJcblx0XHRcdH0pO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLmdvb2dsZU1hcC5wYW5UbyhsYXRMbmcpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBEZWxlZ2F0ZSBmb3IgZ29vZ2xlIG1hcHMgZ2V0Q2VudGVyXHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuZ2V0Wm9vbSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpcy5nb29nbGVNYXAuZ2V0Wm9vbSgpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBEZWxlZ2F0ZSBmb3IgZ29vZ2xlIG1hcHMgZ2V0Wm9vbVxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLnNldFpvb20gPSBmdW5jdGlvbih2YWx1ZSlcclxuXHR7XHJcblx0XHRpZihpc05hTih2YWx1ZSkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlZhbHVlIG11c3Qgbm90IGJlIE5hTlwiKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHRoaXMuZ29vZ2xlTWFwLnNldFpvb20ocGFyc2VJbnQodmFsdWUpKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgYm91bmRzXHJcblx0ICogQHJldHVybiBvYmplY3RcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5nZXRCb3VuZHMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGJvdW5kcyA9IHRoaXMuZ29vZ2xlTWFwLmdldEJvdW5kcygpO1xyXG5cdFx0dmFyIG5vcnRoRWFzdCA9IGJvdW5kcy5nZXROb3J0aEVhc3QoKTtcclxuXHRcdHZhciBzb3V0aFdlc3QgPSBib3VuZHMuZ2V0U291dGhXZXN0KCk7XHJcblx0XHRcclxuXHRcdHZhciBuYXRpdmVCb3VuZHMgPSBuZXcgV1BHTVpBLkxhdExuZ0JvdW5kcyh7fSk7XHJcblx0XHRcclxuXHRcdG5hdGl2ZUJvdW5kcy5ub3J0aCA9IG5vcnRoRWFzdC5sYXQoKTtcclxuXHRcdG5hdGl2ZUJvdW5kcy5zb3V0aCA9IHNvdXRoV2VzdC5sYXQoKTtcclxuXHRcdG5hdGl2ZUJvdW5kcy53ZXN0ID0gc291dGhXZXN0LmxuZygpO1xyXG5cdFx0bmF0aXZlQm91bmRzLmVhc3QgPSBub3J0aEVhc3QubG5nKCk7XHJcblx0XHRcclxuXHRcdC8vIEJhY2t3YXJkIGNvbXBhdGliaWxpdHlcclxuXHRcdG5hdGl2ZUJvdW5kcy50b3BMZWZ0ID0ge1xyXG5cdFx0XHRsYXQ6IG5vcnRoRWFzdC5sYXQoKSxcclxuXHRcdFx0bG5nOiBzb3V0aFdlc3QubG5nKClcclxuXHRcdH07XHJcblx0XHRcclxuXHRcdG5hdGl2ZUJvdW5kcy5ib3R0b21SaWdodCA9IHtcclxuXHRcdFx0bGF0OiBzb3V0aFdlc3QubGF0KCksXHJcblx0XHRcdGxuZzogbm9ydGhFYXN0LmxuZygpXHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmF0aXZlQm91bmRzO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBGaXQgdG8gZ2l2ZW4gYm91bmRhcmllc1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmZpdEJvdW5kcyA9IGZ1bmN0aW9uKHNvdXRoV2VzdCwgbm9ydGhFYXN0KVxyXG5cdHtcclxuXHRcdGlmKHNvdXRoV2VzdCBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHRcdHNvdXRoV2VzdCA9IHtsYXQ6IHNvdXRoV2VzdC5sYXQsIGxuZzogc291dGhXZXN0LmxuZ307XHJcblx0XHRpZihub3J0aEVhc3QgaW5zdGFuY2VvZiBXUEdNWkEuTGF0TG5nKVxyXG5cdFx0XHRub3J0aEVhc3QgPSB7bGF0OiBub3J0aEVhc3QubGF0LCBsbmc6IG5vcnRoRWFzdC5sbmd9O1xyXG5cdFx0ZWxzZSBpZihzb3V0aFdlc3QgaW5zdGFuY2VvZiBXUEdNWkEuTGF0TG5nQm91bmRzKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYm91bmRzID0gc291dGhXZXN0O1xyXG5cdFx0XHRcclxuXHRcdFx0c291dGhXZXN0ID0ge1xyXG5cdFx0XHRcdGxhdDogYm91bmRzLnNvdXRoLFxyXG5cdFx0XHRcdGxuZzogYm91bmRzLndlc3RcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdG5vcnRoRWFzdCA9IHtcclxuXHRcdFx0XHRsYXQ6IGJvdW5kcy5ub3J0aCxcclxuXHRcdFx0XHRsbmc6IGJvdW5kcy5lYXN0XHJcblx0XHRcdH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBuYXRpdmVCb3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKHNvdXRoV2VzdCwgbm9ydGhFYXN0KTtcclxuXHRcdHRoaXMuZ29vZ2xlTWFwLmZpdEJvdW5kcyhuYXRpdmVCb3VuZHMpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBGaXQgdGhlIG1hcCBib3VuZGFyaWVzIHRvIHZpc2libGUgbWFya2Vyc1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmZpdEJvdW5kc1RvVmlzaWJsZU1hcmtlcnMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKG1hcmtlcnNbaV0uZ2V0VmlzaWJsZSgpKVxyXG5cdFx0XHRcdGJvdW5kcy5leHRlbmQobWFya2Vyc1tpXS5nZXRQb3NpdGlvbigpKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuZ29vZ2xlTWFwLmZpdEJvdW5kcyhib3VuZHMpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBFbmFibGVzIC8gZGlzYWJsZXMgdGhlIGJpY3ljbGUgbGF5ZXJcclxuXHQgKiBAcGFyYW0gZW5hYmxlIGJvb2xlYW4sIGVuYWJsZSBvciBub3RcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5lbmFibGVCaWN5Y2xlTGF5ZXIgPSBmdW5jdGlvbihlbmFibGUpXHJcblx0e1xyXG5cdFx0aWYoIXRoaXMuYmljeWNsZUxheWVyKVxyXG5cdFx0XHR0aGlzLmJpY3ljbGVMYXllciA9IG5ldyBnb29nbGUubWFwcy5CaWN5Y2xpbmdMYXllcigpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmJpY3ljbGVMYXllci5zZXRNYXAoXHJcblx0XHRcdGVuYWJsZSA/IHRoaXMuZ29vZ2xlTWFwIDogbnVsbFxyXG5cdFx0KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogRW5hYmxlcyAvIGRpc2FibGVzIHRoZSBiaWN5Y2xlIGxheWVyXHJcblx0ICogQHBhcmFtIGVuYWJsZSBib29sZWFuLCBlbmFibGUgb3Igbm90XHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuZW5hYmxlVHJhZmZpY0xheWVyID0gZnVuY3Rpb24oZW5hYmxlKVxyXG5cdHtcclxuXHRcdGlmKCF0aGlzLnRyYWZmaWNMYXllcilcclxuXHRcdFx0dGhpcy50cmFmZmljTGF5ZXIgPSBuZXcgZ29vZ2xlLm1hcHMuVHJhZmZpY0xheWVyKCk7XHJcblx0XHRcclxuXHRcdHRoaXMudHJhZmZpY0xheWVyLnNldE1hcChcclxuXHRcdFx0ZW5hYmxlID8gdGhpcy5nb29nbGVNYXAgOiBudWxsXHJcblx0XHQpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBFbmFibGVzIC8gZGlzYWJsZXMgdGhlIGJpY3ljbGUgbGF5ZXJcclxuXHQgKiBAcGFyYW0gZW5hYmxlIGJvb2xlYW4sIGVuYWJsZSBvciBub3RcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5lbmFibGVQdWJsaWNUcmFuc3BvcnRMYXllciA9IGZ1bmN0aW9uKGVuYWJsZSlcclxuXHR7XHJcblx0XHRpZighdGhpcy5wdWJsaWNUcmFuc3BvcnRMYXllcilcclxuXHRcdFx0dGhpcy5wdWJsaWNUcmFuc3BvcnRMYXllciA9IG5ldyBnb29nbGUubWFwcy5UcmFuc2l0TGF5ZXIoKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5wdWJsaWNUcmFuc3BvcnRMYXllci5zZXRNYXAoXHJcblx0XHRcdGVuYWJsZSA/IHRoaXMuZ29vZ2xlTWFwIDogbnVsbFxyXG5cdFx0KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2hvd3MgLyBoaWRlcyBwb2ludHMgb2YgaW50ZXJlc3RcclxuXHQgKiBAcGFyYW0gc2hvdyBib29sZWFuLCBlbmFibGUgb3Igbm90XHJcblx0ICogQHJldHVybiB2b2lkXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuc2hvd1BvaW50c09mSW50ZXJlc3QgPSBmdW5jdGlvbihzaG93KVxyXG5cdHtcclxuXHRcdC8vIFRPRE86IFRoaXMgd2lsbCBidWcgdGhlIGZyb250IGVuZCBiZWNhdXNlIHRoZXJlIGlzIG5vIHRleHRhcmVhIHdpdGggdGhlbWUgZGF0YVxyXG5cdFx0dmFyIHRleHQgPSAkKFwidGV4dGFyZWFbbmFtZT0ndGhlbWVfZGF0YSddXCIpLnZhbCgpO1xyXG5cdFx0XHJcblx0XHRpZighdGV4dClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHR2YXIgc3R5bGVzID0gSlNPTi5wYXJzZSh0ZXh0KTtcclxuXHRcdFxyXG5cdFx0c3R5bGVzLnB1c2goe1xyXG5cdFx0XHRmZWF0dXJlVHlwZTogXCJwb2lcIixcclxuXHRcdFx0c3R5bGVyczogW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHZpc2liaWxpdHk6IChzaG93ID8gXCJvblwiIDogXCJvZmZcIilcclxuXHRcdFx0XHR9XHJcblx0XHRcdF1cclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcC5zZXRPcHRpb25zKHtzdHlsZXM6IHN0eWxlc30pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIHRoZSBtaW4gem9vbSBvZiB0aGUgbWFwXHJcblx0ICogQHJldHVybiBpbnRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5nZXRNaW5ab29tID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiBwYXJzZUludCh0aGlzLnNldHRpbmdzLm1pbl96b29tKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgbWluIHpvb20gb2YgdGhlIG1hcFxyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLnNldE1pblpvb20gPSBmdW5jdGlvbih2YWx1ZSlcclxuXHR7XHJcblx0XHR0aGlzLmdvb2dsZU1hcC5zZXRPcHRpb25zKHtcclxuXHRcdFx0bWluWm9vbTogdmFsdWUsXHJcblx0XHRcdG1heFpvb206IHRoaXMuZ2V0TWF4Wm9vbSgpXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgbWluIHpvb20gb2YgdGhlIG1hcFxyXG5cdCAqIEByZXR1cm4gaW50XHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuZ2V0TWF4Wm9vbSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gcGFyc2VJbnQodGhpcy5zZXR0aW5ncy5tYXhfem9vbSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIG1pbiB6b29tIG9mIHRoZSBtYXBcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5zZXRNYXhab29tID0gZnVuY3Rpb24odmFsdWUpXHJcblx0e1xyXG5cdFx0dGhpcy5nb29nbGVNYXAuc2V0T3B0aW9ucyh7XHJcblx0XHRcdG1pblpvb206IHRoaXMuZ2V0TWluWm9vbSgpLFxyXG5cdFx0XHRtYXhab29tOiB2YWx1ZVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLmxhdExuZ1RvUGl4ZWxzID0gZnVuY3Rpb24obGF0TG5nKVxyXG5cdHtcclxuXHRcdHZhciBtYXAgPSB0aGlzLmdvb2dsZU1hcDtcclxuXHRcdHZhciBuYXRpdmVMYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHtcclxuXHRcdFx0bGF0OiBwYXJzZUZsb2F0KGxhdExuZy5sYXQpLFxyXG5cdFx0XHRsbmc6IHBhcnNlRmxvYXQobGF0TG5nLmxuZylcclxuXHRcdH0pO1xyXG5cdFx0dmFyIHRvcFJpZ2h0ID0gbWFwLmdldFByb2plY3Rpb24oKS5mcm9tTGF0TG5nVG9Qb2ludChtYXAuZ2V0Qm91bmRzKCkuZ2V0Tm9ydGhFYXN0KCkpO1xyXG5cdFx0dmFyIGJvdHRvbUxlZnQgPSBtYXAuZ2V0UHJvamVjdGlvbigpLmZyb21MYXRMbmdUb1BvaW50KG1hcC5nZXRCb3VuZHMoKS5nZXRTb3V0aFdlc3QoKSk7XHJcblx0XHR2YXIgc2NhbGUgPSBNYXRoLnBvdygyLCBtYXAuZ2V0Wm9vbSgpKTtcclxuXHRcdHZhciB3b3JsZFBvaW50ID0gbWFwLmdldFByb2plY3Rpb24oKS5mcm9tTGF0TG5nVG9Qb2ludChuYXRpdmVMYXRMbmcpO1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0eDogKHdvcmxkUG9pbnQueCAtIGJvdHRvbUxlZnQueCkgKiBzY2FsZSwgXHJcblx0XHRcdHk6ICh3b3JsZFBvaW50LnkgLSB0b3BSaWdodC55KSAqIHNjYWxlXHJcblx0XHR9O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTWFwLnByb3RvdHlwZS5waXhlbHNUb0xhdExuZyA9IGZ1bmN0aW9uKHgsIHkpXHJcblx0e1xyXG5cdFx0aWYoeSA9PSB1bmRlZmluZWQpXHJcblx0XHR7XHJcblx0XHRcdGlmKFwieFwiIGluIHggJiYgXCJ5XCIgaW4geClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHkgPSB4Lnk7XHJcblx0XHRcdFx0eCA9IHgueDtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiWSBjb29yZGluYXRlIHVuZGVmaW5lZCBpbiBwaXhlbHNUb0xhdExuZyAoZGlkIHlvdSBtZWFuIHRvIHBhc3MgMiBhcmd1bWVudHM/KVwiKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIG1hcCA9IHRoaXMuZ29vZ2xlTWFwO1xyXG5cdFx0dmFyIHRvcFJpZ2h0ID0gbWFwLmdldFByb2plY3Rpb24oKS5mcm9tTGF0TG5nVG9Qb2ludChtYXAuZ2V0Qm91bmRzKCkuZ2V0Tm9ydGhFYXN0KCkpO1xyXG5cdFx0dmFyIGJvdHRvbUxlZnQgPSBtYXAuZ2V0UHJvamVjdGlvbigpLmZyb21MYXRMbmdUb1BvaW50KG1hcC5nZXRCb3VuZHMoKS5nZXRTb3V0aFdlc3QoKSk7XHJcblx0XHR2YXIgc2NhbGUgPSBNYXRoLnBvdygyLCBtYXAuZ2V0Wm9vbSgpKTtcclxuXHRcdHZhciB3b3JsZFBvaW50ID0gbmV3IGdvb2dsZS5tYXBzLlBvaW50KHggLyBzY2FsZSArIGJvdHRvbUxlZnQueCwgeSAvIHNjYWxlICsgdG9wUmlnaHQueSk7XHJcblx0XHR2YXIgbGF0TG5nID0gbWFwLmdldFByb2plY3Rpb24oKS5mcm9tUG9pbnRUb0xhdExuZyh3b3JsZFBvaW50KTtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGxhdDogbGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRsbmc6IGxhdExuZy5sbmcoKVxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogSGFuZGxlIHRoZSBtYXAgZWxlbWVudCByZXNpemluZ1xyXG5cdCAqIEByZXR1cm4gdm9pZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Hb29nbGVNYXAucHJvdG90eXBlLm9uRWxlbWVudFJlc2l6ZWQgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHRpZighdGhpcy5nb29nbGVNYXApXHJcblx0XHRcdHJldHVybjtcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LnRyaWdnZXIodGhpcy5nb29nbGVNYXAsIFwicmVzaXplXCIpO1xyXG5cdH1cclxuXHJcblx0V1BHTVpBLkdvb2dsZU1hcC5wcm90b3R5cGUuZW5hYmxlQWxsSW50ZXJhY3Rpb25zID0gZnVuY3Rpb24oKVxyXG5cdHtcdFxyXG5cdFx0dmFyIG9wdGlvbnMgPSB7fTtcclxuXHJcblx0XHRvcHRpb25zLnNjcm9sbHdoZWVsXHRcdFx0XHQ9IHRydWU7XHJcblx0XHRvcHRpb25zLmRyYWdnYWJsZVx0XHRcdFx0PSB0cnVlO1xyXG5cdFx0b3B0aW9ucy5kaXNhYmxlRG91YmxlQ2xpY2tab29tXHQ9IGZhbHNlO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdvb2dsZU1hcC5zZXRPcHRpb25zKG9wdGlvbnMpO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtbWFwLmpzIn0=
