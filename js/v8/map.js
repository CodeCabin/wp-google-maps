/**
 * @namespace WPGMZA
 * @module Map
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	/**
	 * Base class for maps. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Map
	 * @constructor WPGMZA.Map
	 * @memberof WPGMZA
	 * @param {HTMLElement} element to contain map
	 * @param {object} [options] Options to apply to this map
	 * @augments WPGMZA.EventDispatcher
	 */
	WPGMZA.Map = function(element, options)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Map");
		
		WPGMZA.EventDispatcher.call(this);
		
		if(!(element instanceof HTMLElement))
			throw new Error("Argument must be a HTMLElement");
		
		// NB: This should be moved to a getID function or similar and offloaded to Pro. ID should be fixed to 1 in basic.
		if(element.hasAttribute("data-map-id"))
			this.id = element.getAttribute("data-map-id");
		else
			this.id = 1;
		
		if(!/\d+/.test(this.id))
			throw new Error("Map ID must be an integer");
		
		WPGMZA.maps.push(this);
		
		this.element = element;
		this.element.wpgmzaMap = this;
		
		this.engineElement = element;
		
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		this.circles = [];
		this.rectangles = [];
		
		this.loadSettings(options);
		
		this.shortcodeAttributes = {};
		if($(this.element).attr("data-shortcode-attributes"))
			try{
				this.shortcodeAttributes = JSON.parse($(this.element).attr("data-shortcode-attributes"))
			}catch(e) {
				console.warn("Error parsing shortcode attributes");
			}
		
		if(WPGMZA.getCurrentPage() != WPGMZA.PAGE_MAP_EDIT)
			this.initStoreLocator();
		
		this.markerFilter = WPGMZA.MarkerFilter.createInstance(this);
	}
	
	WPGMZA.Map.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.Map.prototype.constructor = WPGMZA.Map;
	WPGMZA.Map.nightTimeThemeData = [{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#575663"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#80823e"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#1b737a"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}];
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Map
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Map.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProMap;
				
				return WPGMZA.OLMap;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProMap;
				
				return WPGMZA.GoogleMap;
				break;
		}
	}

	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {HTMLElement} element to contain map
	 * @param {object} [options] Options to apply to this map
	 * @return {WPGMZA.Map} An instance of WPGMZA.Map
	 */
	WPGMZA.Map.createInstance = function(element, options)
	{
		var constructor = WPGMZA.Map.getConstructor();
		return new constructor(element, options);
	}
	
	/**
	 * The maps current latitude
	 * 
	 * @property lat
	 * @memberof WPGMZA.Map
	 * @name WPGMZA.Map#lat
	 * @type Number
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "lat", {
		
		get: function() {
			return this.getCenter().lat;
		},
		
		set: function(value) {
			var center = this.getCenter();
			center.lat = value;
			this.setCenter(center);
		}
		
	});
	
	/**
	 * The maps current longitude
	 * 
	 * @property lng
	 * @memberof WPGMZA.Map
	 * @name WPGMZA.Map#lng
	 * @type Number
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "lng", {
		
		get: function() {
			return this.getCenter().lng;
		},
		
		set: function(value) {
			var center = this.getCenter();
			center.lng = value;
			this.setCenter(center);
		}
		
	});
	
	/**
	 * The maps current zoom level
	 *  
	 * @property zoom
	 * @memberof WPGMZA.Map
	 * @name WPGMZA.Map#zoom
	 * @type Number
	 */
	Object.defineProperty(WPGMZA.Map.prototype, "zoom", {
		
		get: function() {
			return this.getZoom();
		},
		
		set: function(value) {
			this.setZoom(value);
		}
		
	});
	
	/**
	 * Loads the maps settings and sets some defaults
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.loadSettings = function(options)
	{
		var settings = new WPGMZA.MapSettings(this.element);
		var other_settings = settings.other_settings;
		
		delete settings.other_settings;
		
		/*if(other_settings)
			for(var key in other_settings)
				settings[key] = other_settings[key];*/
			
		if(options)
			for(var key in options)
				settings[key] = options[key];
			
		this.settings = settings;
	}
	
	WPGMZA.Map.prototype.initStoreLocator = function()
	{
		var storeLocatorElement = $(".wpgmza_sl_main_div");
		if(storeLocatorElement.length)
			this.storeLocator = WPGMZA.StoreLocator.createInstance(this, storeLocatorElement[0]);
	}
	
	/**
	 * Sets options in bulk on map
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.setOptions = function(options)
	{
		for(var name in options)
			this.settings[name] = options[name];
	}
	
	/**
	 * Gets the distance between two latLngs in kilometers
	 * NB: Static function
	 * @return number
	 */
	var earthRadiusMeters = 6371;
	var piTimes360 = Math.PI / 360;
	
	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	};
	
	/**
	 * This gets the distance in kilometers between two latitude / longitude points
	 * TODO: Move this to the distance class, or the LatLng class
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} lat1 Latitude from the first coordinate pair
	 * @param {number} lon1 Longitude from the first coordinate pair
	 * @param {number} lat2 Latitude from the second coordinate pair
	 * @param {number} lon1 Longitude from the second coordinate pair
	 * @return {number} The distance between the latitude and longitudes, in kilometers
	 */
	WPGMZA.Map.getGeographicDistance = function(lat1, lon1, lat2, lon2)
	{
		var dLat = deg2rad(lat2-lat1);
		var dLon = deg2rad(lon2-lon1); 
		
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
			
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = earthRadiusMeters * c; // Distance in km
		
		return d;
	}
	
	/**
	 * Centers the map on the supplied latitude and longitude
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {object|WPGMZA.LatLng} latLng A LatLng literal or an instance of WPGMZA.LatLng
	 */
	WPGMZA.Map.prototype.setCenter = function(latLng)
	{
		if(!("lat" in latLng && "lng" in latLng))
			throw new Error("Argument is not an object with lat and lng");
	}
	
	/**
	 * Sets the dimensions of the map engine element
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} width Width as a CSS string
	 * @param {number} height Height as a CSS string
	 */
	WPGMZA.Map.prototype.setDimensions = function(width, height)
	{
		$(this.element).css({
			width: width
		});
		
		$(this.engineElement).css({
			width: "100%",
			height: height
		});
	}
	
	/**
	 * Adds the specified marker to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Marker} marker The marker to add
	 * @fires markeradded
	 * @fires WPGMZA.Marker#added
	 * @throws Argument must be an instance of WPGMZA.Marker
	 */
	WPGMZA.Map.prototype.addMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		marker.map = this;
		marker.parent = this;
		
		this.markers.push(marker);
		this.dispatchEvent({type: "markeradded", marker: marker});
		marker.dispatchEvent({type: "added"});
	}
	
	/**
	 * Removes the specified marker from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Marker} marker The marker to remove
	 * @fires markerremoved
	 * @fires WPGMZA.Marker#removed
	 * @throws Argument must be an instance of WPGMZA.Marker
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removeMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		if(marker.infoWindow)
			marker.infoWindow.close();
		
		marker.map = null;
		marker.parent = null;
		
		this.markers.splice(this.markers.indexOf(marker), 1);
		this.dispatchEvent({type: "markerremoved", marker: marker});
		marker.dispatchEvent({type: "removed"});
	}
	
	/**
	 * Gets a marker by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the marker to get
	 * @return {WPGMZA.Marker|null} The marker, or null if no marker with the specified ID is found
	 */
	WPGMZA.Map.prototype.getMarkerByID = function(id)
	{
		for(var i = 0; i < this.markers.length; i++)
		{
			if(this.markers[i].id == id)
				return this.markers[i];
		}
		
		return null;
	}
	
	WPGMZA.Map.prototype.getMarkerByTitle = function(title)
	{
		if(typeof title == "string")
			for(var i = 0; i < this.markers.length; i++)
			{
				if(this.markers[i].title == title)
					return this.markers[i];
			}
		else if(title instanceof RegExp)
			for(var i = 0; i < this.markers.length; i++)
			{
				if(title.test(this.markers[i].title))
					return this.markers[i];
			}
		else
			throw new Error("Invalid argument");
		
		return null;
	}
	
	/**
	 * Removes a marker by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the marker to remove
	 * @fires markerremoved
	 * @fires WPGMZA.Marker#removed
	 */
	WPGMZA.Map.prototype.removeMarkerByID = function(id)
	{
		var marker = this.getMarkerByID(id);
		
		if(!marker)
			return;
		
		this.removeMarker(marker);
	}
	
	/**
	 * Adds the specified polygon to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polygon} polygon The polygon to add
	 * @fires polygonadded
	 * @throws Argument must be an instance of WPGMZA.Polygon
	 */
	WPGMZA.Map.prototype.addPolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		polygon.map = this;
		
		this.polygons.push(polygon);
		this.dispatchEvent({type: "polygonadded", polygon: polygon});
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polygon} polygon The polygon to remove
	 * @fires polygonremoved
	 * @throws Argument must be an instance of WPGMZA.Polygon
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removePolygon = function(polygon)
	{
		if(!(polygon instanceof WPGMZA.Polygon))
			throw new Error("Argument must be an instance of WPGMZA.Polygon");
		
		if(polygon.map !== this)
			throw new Error("Wrong map error");
		
		polygon.map = null;
		
		this.polygons.splice(this.polygons.indexOf(polygon), 1);
		this.dispatchEvent({type: "polygonremoved", polygon: polygon});
	}
	
	/**
	 * Gets a polygon by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polygon to get
	 * @return {WPGMZA.Polygon|null} The polygon, or null if no polygon with the specified ID is found
	 */
	WPGMZA.Map.prototype.getPolygonByID = function(id)
	{
		for(var i = 0; i < this.polygons.length; i++)
		{
			if(this.polygons[i].id == id)
				return this.polygons[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a polygon by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polygon to remove
	 */
	WPGMZA.Map.prototype.removePolygonByID = function(id)
	{
		var polygon = this.getPolygonByID(id);
		
		if(!polygon)
			return;
		
		this.removePolygon(polygon);
	}
	
	/**
	 * Gets a polyline by ID
	 * @return void
	 */
	WPGMZA.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Adds the specified polyline to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polyline} polyline The polyline to add
	 * @fires polylineadded
	 * @throws Argument must be an instance of WPGMZA.Polyline
	 */
	WPGMZA.Map.prototype.addPolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		polyline.map = this;
		
		this.polylines.push(polyline);
		this.dispatchEvent({type: "polylineadded", polyline: polyline});
	}
	
	/**
	 * Removes the specified polyline from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Polyline} polyline The polyline to remove
	 * @fires polylineremoved
	 * @throws Argument must be an instance of WPGMZA.Polyline
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removePolyline = function(polyline)
	{
		if(!(polyline instanceof WPGMZA.Polyline))
			throw new Error("Argument must be an instance of WPGMZA.Polyline");
		
		if(polyline.map !== this)
			throw new Error("Wrong map error");
		
		polyline.map = null;
		
		this.polylines.splice(this.polylines.indexOf(polyline), 1);
		this.dispatchEvent({type: "polylineremoved", polyline: polyline});
	}
	
	/**
	 * Gets a polyline by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polyline to get
	 * @return {WPGMZA.Polyline|null} The polyline, or null if no polyline with the specified ID is found
	 */
	WPGMZA.Map.prototype.getPolylineByID = function(id)
	{
		for(var i = 0; i < this.polylines.length; i++)
		{
			if(this.polylines[i].id == id)
				return this.polylines[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a polyline by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the polyline to remove
	 */
	WPGMZA.Map.prototype.removePolylineByID = function(id)
	{
		var polyline = this.getPolylineByID(id);
		
		if(!polyline)
			return;
		
		this.removePolyline(polyline);
	}
	
	/**
	 * Adds the specified circle to this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Circle} circle The circle to add
	 * @fires polygonadded
	 * @throws Argument must be an instance of WPGMZA.Circle
	 */
	WPGMZA.Map.prototype.addCircle = function(circle)
	{
		if(!(circle instanceof WPGMZA.Circle))
			throw new Error("Argument must be an instance of WPGMZA.Circle");
		
		circle.map = this;
		
		this.circles.push(circle);
		this.dispatchEvent({type: "circleadded", circle: circle});
	}
	
	/**
	 * Removes the specified circle from this map
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {WPGMZA.Circle} circle The circle to remove
	 * @fires circleremoved
	 * @throws Argument must be an instance of WPGMZA.Circle
	 * @throws Wrong map error
	 */
	WPGMZA.Map.prototype.removeCircle = function(circle)
	{
		if(!(circle instanceof WPGMZA.Circle))
			throw new Error("Argument must be an instance of WPGMZA.Circle");
		
		if(circle.map !== this)
			throw new Error("Wrong map error");
		
		circle.map = null;
		
		this.circles.splice(this.circles.indexOf(circle), 1);
		this.dispatchEvent({type: "circleremoved", circle: circle});
	}
	
	/**
	 * Gets a circle by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the circle to get
	 * @return {WPGMZA.Circle|null} The circle, or null if no circle with the specified ID is found
	 */
	WPGMZA.Map.prototype.getCircleByID = function(id)
	{
		for(var i = 0; i < this.circles.length; i++)
		{
			if(this.circles[i].id == id)
				return this.circles[i];
		}
		
		return null;
	}
	
	/**
	 * Removes a circle by ID
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {int} id The ID of the circle to remove
	 */
	WPGMZA.Map.prototype.removeCircleByID = function(id)
	{
		var circle = this.getCircleByID(id);
		
		if(!circle)
			return;
		
		this.removeCircle(circle);
	}
	
	WPGMZA.Map.prototype.nudgeLatLng = function(latLng, x, y)
	{
		var pixels = this.latLngToPixels(latLng);
		
		pixels.x += parseFloat(x);
		pixels.y += parseFloat(y);
		
		if(isNaN(pixels.x) || isNaN(pixels.y))
			throw new Error("Invalid coordinates supplied");
		
		return this.pixelsToLatLng(pixels);
	}
	
	/**
	 * Nudges the map viewport by the given pixel coordinates
	 * @method
	 * @memberof WPGMZA.Map
	 * @param {number} x Number of pixels to nudge along the x axis
	 * @param {number} y Number of pixels to nudge along the y axis
	 * @throws Invalid coordinates supplied
	 */
	WPGMZA.Map.prototype.nudge = function(x, y)
	{
		var nudged = this.nudgeLatLng(this.getCenter(), x, y);
		
		this.setCenter(nudged);
	}
	
	WPGMZA.Map.prototype.animateNudge = function(x, y, origin, milliseconds)
	{
		var nudged;
	
		if(!origin)
			origin = this.getCenter();
		else if(!(origin instanceof WPGMZA.LatLng))
			throw new Error("Origin must be an instance of WPGMZA.LatLng");

		nudged = this.nudgeLatLng(origin, x, y);
		
		if(!milliseconds)
			milliseconds = WPGMZA.getScrollAnimationDuration();
		
		$(this).animate({
			lat: nudged.lat,
			lng: nudged.lng
		}, milliseconds);
	}
	
	/**
	 * Called when the window resizes
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.onWindowResize = function(event)
	{
		
	}
	
	/**
	 * Called when the engine map div is resized
	 * @method
	 * @memberof WPGMZA.Map
	 */
	WPGMZA.Map.prototype.onElementResized = function(event)
	{
		
	}
	
	/**
	 * Called when the map viewport bounds change. Fires the legacy bounds_changed event.
	 * @method
	 * @memberof WPGMZA.Map
	 * @fires boundschanged
	 * @fires bounds_changed
	 */
	WPGMZA.Map.prototype.onBoundsChanged = function(event)
	{
		// Native events
		this.trigger("boundschanged");
		
		// Google / legacy compatibility events
		this.trigger("bounds_changed");
	}
	
	/**
	 * Called when the map viewport becomes idle (eg movement done, tiles loaded)
	 * @method
	 * @memberof WPGMZA.Map
	 * @fires idle
	 */
	WPGMZA.Map.prototype.onIdle = function(event)
	{
		this.trigger("idle");
	}

	WPGMZA.Map.prototype.hasVisibleMarkers = function(event)
	{
		// see how many markers is visible
		var markers_visible = 0;

		// loop through the markers
		for(var marker_id in marker_array)
		{
			// find markers on map after search
			var marker = marker_array[marker_id];
			
			// NB: We check whether the marker is on a map or not here, Pro toggles visibility, basic adds and removes markers
			if(marker.isFilterable && marker.getMap())
			{
				// count markers visible
				markers_visible++;
				break;			
			}
		}

		return markers_visible > 0; // Returns true if markers are visible, false if not
	}
	
	WPGMZA.Map.prototype.closeAllInfoWindows = function()
	{
		this.markers.forEach(function(marker) {
			
			if(marker.infoWindow)
				marker.infoWindow.close();
				
		});
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTWFwXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuRXZlbnREaXNwYXRjaGVyXHJcbiAqIEBndWxwLXJlcXVpcmVzIGV2ZW50LWRpc3BhdGNoZXIuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyBmb3IgbWFwcy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLk1hcFxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTWFwXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdG8gY29udGFpbiBtYXBcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgdG8gYXBwbHkgdG8gdGhpcyBtYXBcclxuXHQgKiBAYXVnbWVudHMgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0V1BHTVpBLmFzc2VydEluc3RhbmNlT2YodGhpcywgXCJNYXBcIik7XHJcblx0XHRcclxuXHRcdFdQR01aQS5FdmVudERpc3BhdGNoZXIuY2FsbCh0aGlzKTtcclxuXHRcdFxyXG5cdFx0aWYoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGEgSFRNTEVsZW1lbnRcIik7XHJcblx0XHRcclxuXHRcdC8vIE5COiBUaGlzIHNob3VsZCBiZSBtb3ZlZCB0byBhIGdldElEIGZ1bmN0aW9uIG9yIHNpbWlsYXIgYW5kIG9mZmxvYWRlZCB0byBQcm8uIElEIHNob3VsZCBiZSBmaXhlZCB0byAxIGluIGJhc2ljLlxyXG5cdFx0aWYoZWxlbWVudC5oYXNBdHRyaWJ1dGUoXCJkYXRhLW1hcC1pZFwiKSlcclxuXHRcdFx0dGhpcy5pZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1tYXAtaWRcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdHRoaXMuaWQgPSAxO1xyXG5cdFx0XHJcblx0XHRpZighL1xcZCsvLnRlc3QodGhpcy5pZCkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk1hcCBJRCBtdXN0IGJlIGFuIGludGVnZXJcIik7XHJcblx0XHRcclxuXHRcdFdQR01aQS5tYXBzLnB1c2godGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblx0XHR0aGlzLmVsZW1lbnQud3BnbXphTWFwID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5lbmdpbmVFbGVtZW50ID0gZWxlbWVudDtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXJrZXJzID0gW107XHJcblx0XHR0aGlzLnBvbHlnb25zID0gW107XHJcblx0XHR0aGlzLnBvbHlsaW5lcyA9IFtdO1xyXG5cdFx0dGhpcy5jaXJjbGVzID0gW107XHJcblx0XHR0aGlzLnJlY3RhbmdsZXMgPSBbXTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sb2FkU2V0dGluZ3Mob3B0aW9ucyk7XHJcblx0XHRcclxuXHRcdHRoaXMuc2hvcnRjb2RlQXR0cmlidXRlcyA9IHt9O1xyXG5cdFx0aWYoJCh0aGlzLmVsZW1lbnQpLmF0dHIoXCJkYXRhLXNob3J0Y29kZS1hdHRyaWJ1dGVzXCIpKVxyXG5cdFx0XHR0cnl7XHJcblx0XHRcdFx0dGhpcy5zaG9ydGNvZGVBdHRyaWJ1dGVzID0gSlNPTi5wYXJzZSgkKHRoaXMuZWxlbWVudCkuYXR0cihcImRhdGEtc2hvcnRjb2RlLWF0dHJpYnV0ZXNcIikpXHJcblx0XHRcdH1jYXRjaChlKSB7XHJcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiRXJyb3IgcGFyc2luZyBzaG9ydGNvZGUgYXR0cmlidXRlc1wiKTtcclxuXHRcdFx0fVxyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuZ2V0Q3VycmVudFBhZ2UoKSAhPSBXUEdNWkEuUEFHRV9NQVBfRURJVClcclxuXHRcdFx0dGhpcy5pbml0U3RvcmVMb2NhdG9yKCk7XHJcblx0XHRcclxuXHRcdHRoaXMubWFya2VyRmlsdGVyID0gV1BHTVpBLk1hcmtlckZpbHRlci5jcmVhdGVJbnN0YW5jZSh0aGlzKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFdQR01aQS5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5NYXA7XHJcblx0V1BHTVpBLk1hcC5uaWdodFRpbWVUaGVtZURhdGEgPSBbe1wiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMjQyZjNlXCJ9XX0se1wiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM3NDY4NTVcIn1dfSx7XCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMjQyZjNlXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlLmxvY2FsaXR5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Q1OTU2M1wifV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjNTc1NjYzXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaVwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNkNTk1NjNcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLnBhcmtcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzI2M2MzZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kucGFya1wiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM2YjlhNzZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMzg0MTRlXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWRcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMyMTJhMzdcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM5Y2E1YjNcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM3NDY4NTVcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzgwODIzZVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmhpZ2h3YXlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMxZjI4MzVcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2YzZDE5Y1wifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMyZjM5NDhcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwidHJhbnNpdC5zdGF0aW9uXCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Q1OTU2M1wifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMTcyNjNjXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzFiNzM3YVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM1MTVjNmRcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwid2F0ZXJcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMxNzI2M2NcIn1dfV07XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgY29udHJ1Y3RvciB0byBiZSB1c2VkIGJ5IGNyZWF0ZUluc3RhbmNlLCBkZXBlbmRpbmcgb24gdGhlIHNlbGVjdGVkIG1hcHMgZW5naW5lLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEByZXR1cm4ge2Z1bmN0aW9ufSBUaGUgYXBwcm9wcmlhdGUgY29udHJ1Y3RvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAuZ2V0Q29uc3RydWN0b3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFx0XHRcdHJldHVybiBXUEdNWkEuT0xQcm9NYXA7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTE1hcDtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIFdQR01aQS5Hb29nbGVQcm9NYXA7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5Hb29nbGVNYXA7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgbWFwLCA8c3Ryb25nPnBsZWFzZSA8ZW0+YWx3YXlzPC9lbT4gdXNlIHRoaXMgZnVuY3Rpb24gcmF0aGVyIHRoYW4gY2FsbGluZyB0aGUgY29uc3RydWN0b3IgZGlyZWN0bHk8L3N0cm9uZz4uXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCB0byBjb250YWluIG1hcFxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyB0byBhcHBseSB0byB0aGlzIG1hcFxyXG5cdCAqIEByZXR1cm4ge1dQR01aQS5NYXB9IEFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXBcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucylcclxuXHR7XHJcblx0XHR2YXIgY29uc3RydWN0b3IgPSBXUEdNWkEuTWFwLmdldENvbnN0cnVjdG9yKCk7XHJcblx0XHRyZXR1cm4gbmV3IGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBUaGUgbWFwcyBjdXJyZW50IGxhdGl0dWRlXHJcblx0ICogXHJcblx0ICogQHByb3BlcnR5IGxhdFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQG5hbWUgV1BHTVpBLk1hcCNsYXRcclxuXHQgKiBAdHlwZSBOdW1iZXJcclxuXHQgKi9cclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLk1hcC5wcm90b3R5cGUsIFwibGF0XCIsIHtcclxuXHRcdFxyXG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0Q2VudGVyKCkubGF0O1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHR2YXIgY2VudGVyID0gdGhpcy5nZXRDZW50ZXIoKTtcclxuXHRcdFx0Y2VudGVyLmxhdCA9IHZhbHVlO1xyXG5cdFx0XHR0aGlzLnNldENlbnRlcihjZW50ZXIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIG1hcHMgY3VycmVudCBsb25naXR1ZGVcclxuXHQgKiBcclxuXHQgKiBAcHJvcGVydHkgbG5nXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAbmFtZSBXUEdNWkEuTWFwI2xuZ1xyXG5cdCAqIEB0eXBlIE51bWJlclxyXG5cdCAqL1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuTWFwLnByb3RvdHlwZSwgXCJsbmdcIiwge1xyXG5cdFx0XHJcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRDZW50ZXIoKS5sbmc7XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcblx0XHRcdHZhciBjZW50ZXIgPSB0aGlzLmdldENlbnRlcigpO1xyXG5cdFx0XHRjZW50ZXIubG5nID0gdmFsdWU7XHJcblx0XHRcdHRoaXMuc2V0Q2VudGVyKGNlbnRlcik7XHJcblx0XHR9XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBUaGUgbWFwcyBjdXJyZW50IHpvb20gbGV2ZWxcclxuXHQgKiAgXHJcblx0ICogQHByb3BlcnR5IHpvb21cclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBuYW1lIFdQR01aQS5NYXAjem9vbVxyXG5cdCAqIEB0eXBlIE51bWJlclxyXG5cdCAqL1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuTWFwLnByb3RvdHlwZSwgXCJ6b29tXCIsIHtcclxuXHRcdFxyXG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0Wm9vbSgpO1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG5cdFx0XHR0aGlzLnNldFpvb20odmFsdWUpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcblx0LyoqXHJcblx0ICogTG9hZHMgdGhlIG1hcHMgc2V0dGluZ3MgYW5kIHNldHMgc29tZSBkZWZhdWx0c1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLmxvYWRTZXR0aW5ncyA9IGZ1bmN0aW9uKG9wdGlvbnMpXHJcblx0e1xyXG5cdFx0dmFyIHNldHRpbmdzID0gbmV3IFdQR01aQS5NYXBTZXR0aW5ncyh0aGlzLmVsZW1lbnQpO1xyXG5cdFx0dmFyIG90aGVyX3NldHRpbmdzID0gc2V0dGluZ3Mub3RoZXJfc2V0dGluZ3M7XHJcblx0XHRcclxuXHRcdGRlbGV0ZSBzZXR0aW5ncy5vdGhlcl9zZXR0aW5ncztcclxuXHRcdFxyXG5cdFx0LyppZihvdGhlcl9zZXR0aW5ncylcclxuXHRcdFx0Zm9yKHZhciBrZXkgaW4gb3RoZXJfc2V0dGluZ3MpXHJcblx0XHRcdFx0c2V0dGluZ3Nba2V5XSA9IG90aGVyX3NldHRpbmdzW2tleV07Ki9cclxuXHRcdFx0XHJcblx0XHRpZihvcHRpb25zKVxyXG5cdFx0XHRmb3IodmFyIGtleSBpbiBvcHRpb25zKVxyXG5cdFx0XHRcdHNldHRpbmdzW2tleV0gPSBvcHRpb25zW2tleV07XHJcblx0XHRcdFxyXG5cdFx0dGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5pbml0U3RvcmVMb2NhdG9yID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBzdG9yZUxvY2F0b3JFbGVtZW50ID0gJChcIi53cGdtemFfc2xfbWFpbl9kaXZcIik7XHJcblx0XHRpZihzdG9yZUxvY2F0b3JFbGVtZW50Lmxlbmd0aClcclxuXHRcdFx0dGhpcy5zdG9yZUxvY2F0b3IgPSBXUEdNWkEuU3RvcmVMb2NhdG9yLmNyZWF0ZUluc3RhbmNlKHRoaXMsIHN0b3JlTG9jYXRvckVsZW1lbnRbMF0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIG9wdGlvbnMgaW4gYnVsayBvbiBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRmb3IodmFyIG5hbWUgaW4gb3B0aW9ucylcclxuXHRcdFx0dGhpcy5zZXR0aW5nc1tuYW1lXSA9IG9wdGlvbnNbbmFtZV07XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdHdvIGxhdExuZ3MgaW4ga2lsb21ldGVyc1xyXG5cdCAqIE5COiBTdGF0aWMgZnVuY3Rpb25cclxuXHQgKiBAcmV0dXJuIG51bWJlclxyXG5cdCAqL1xyXG5cdHZhciBlYXJ0aFJhZGl1c01ldGVycyA9IDYzNzE7XHJcblx0dmFyIHBpVGltZXMzNjAgPSBNYXRoLlBJIC8gMzYwO1xyXG5cdFxyXG5cdGZ1bmN0aW9uIGRlZzJyYWQoZGVnKSB7XHJcblx0ICByZXR1cm4gZGVnICogKE1hdGguUEkvMTgwKVxyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhpcyBnZXRzIHRoZSBkaXN0YW5jZSBpbiBraWxvbWV0ZXJzIGJldHdlZW4gdHdvIGxhdGl0dWRlIC8gbG9uZ2l0dWRlIHBvaW50c1xyXG5cdCAqIFRPRE86IE1vdmUgdGhpcyB0byB0aGUgZGlzdGFuY2UgY2xhc3MsIG9yIHRoZSBMYXRMbmcgY2xhc3NcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbGF0MSBMYXRpdHVkZSBmcm9tIHRoZSBmaXJzdCBjb29yZGluYXRlIHBhaXJcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gbG9uMSBMb25naXR1ZGUgZnJvbSB0aGUgZmlyc3QgY29vcmRpbmF0ZSBwYWlyXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGxhdDIgTGF0aXR1ZGUgZnJvbSB0aGUgc2Vjb25kIGNvb3JkaW5hdGUgcGFpclxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBsb24xIExvbmdpdHVkZSBmcm9tIHRoZSBzZWNvbmQgY29vcmRpbmF0ZSBwYWlyXHJcblx0ICogQHJldHVybiB7bnVtYmVyfSBUaGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZXMsIGluIGtpbG9tZXRlcnNcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLmdldEdlb2dyYXBoaWNEaXN0YW5jZSA9IGZ1bmN0aW9uKGxhdDEsIGxvbjEsIGxhdDIsIGxvbjIpXHJcblx0e1xyXG5cdFx0dmFyIGRMYXQgPSBkZWcycmFkKGxhdDItbGF0MSk7XHJcblx0XHR2YXIgZExvbiA9IGRlZzJyYWQobG9uMi1sb24xKTsgXHJcblx0XHRcclxuXHRcdHZhciBhID0gXHJcblx0XHRcdE1hdGguc2luKGRMYXQvMikgKiBNYXRoLnNpbihkTGF0LzIpICtcclxuXHRcdFx0TWF0aC5jb3MoZGVnMnJhZChsYXQxKSkgKiBNYXRoLmNvcyhkZWcycmFkKGxhdDIpKSAqIFxyXG5cdFx0XHRNYXRoLnNpbihkTG9uLzIpICogTWF0aC5zaW4oZExvbi8yKTsgXHJcblx0XHRcdFxyXG5cdFx0dmFyIGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxLWEpKTsgXHJcblx0XHR2YXIgZCA9IGVhcnRoUmFkaXVzTWV0ZXJzICogYzsgLy8gRGlzdGFuY2UgaW4ga21cclxuXHRcdFxyXG5cdFx0cmV0dXJuIGQ7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENlbnRlcnMgdGhlIG1hcCBvbiB0aGUgc3VwcGxpZWQgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fFdQR01aQS5MYXRMbmd9IGxhdExuZyBBIExhdExuZyBsaXRlcmFsIG9yIGFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbihsYXRMbmcpXHJcblx0e1xyXG5cdFx0aWYoIShcImxhdFwiIGluIGxhdExuZyAmJiBcImxuZ1wiIGluIGxhdExuZykpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IGlzIG5vdCBhbiBvYmplY3Qgd2l0aCBsYXQgYW5kIGxuZ1wiKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0cyB0aGUgZGltZW5zaW9ucyBvZiB0aGUgbWFwIGVuZ2luZSBlbGVtZW50XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIFdpZHRoIGFzIGEgQ1NTIHN0cmluZ1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IGFzIGEgQ1NTIHN0cmluZ1xyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnNldERpbWVuc2lvbnMgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KVxyXG5cdHtcclxuXHRcdCQodGhpcy5lbGVtZW50KS5jc3Moe1xyXG5cdFx0XHR3aWR0aDogd2lkdGhcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZW5naW5lRWxlbWVudCkuY3NzKHtcclxuXHRcdFx0d2lkdGg6IFwiMTAwJVwiLFxyXG5cdFx0XHRoZWlnaHQ6IGhlaWdodFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdGhlIHNwZWNpZmllZCBtYXJrZXIgdG8gdGhpcyBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5NYXJrZXJ9IG1hcmtlciBUaGUgbWFya2VyIHRvIGFkZFxyXG5cdCAqIEBmaXJlcyBtYXJrZXJhZGRlZFxyXG5cdCAqIEBmaXJlcyBXUEdNWkEuTWFya2VyI2FkZGVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXJrZXJcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5hZGRNYXJrZXIgPSBmdW5jdGlvbihtYXJrZXIpXHJcblx0e1xyXG5cdFx0aWYoIShtYXJrZXIgaW5zdGFuY2VvZiBXUEdNWkEuTWFya2VyKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuTWFya2VyXCIpO1xyXG5cdFx0XHJcblx0XHRtYXJrZXIubWFwID0gdGhpcztcclxuXHRcdG1hcmtlci5wYXJlbnQgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcmtlcnMucHVzaChtYXJrZXIpO1xyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcIm1hcmtlcmFkZGVkXCIsIG1hcmtlcjogbWFya2VyfSk7XHJcblx0XHRtYXJrZXIuZGlzcGF0Y2hFdmVudCh7dHlwZTogXCJhZGRlZFwifSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBtYXJrZXIgZnJvbSB0aGlzIG1hcFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7V1BHTVpBLk1hcmtlcn0gbWFya2VyIFRoZSBtYXJrZXIgdG8gcmVtb3ZlXHJcblx0ICogQGZpcmVzIG1hcmtlcnJlbW92ZWRcclxuXHQgKiBAZmlyZXMgV1BHTVpBLk1hcmtlciNyZW1vdmVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXJrZXJcclxuXHQgKiBAdGhyb3dzIFdyb25nIG1hcCBlcnJvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnJlbW92ZU1hcmtlciA9IGZ1bmN0aW9uKG1hcmtlcilcclxuXHR7XHJcblx0XHRpZighKG1hcmtlciBpbnN0YW5jZW9mIFdQR01aQS5NYXJrZXIpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXJrZXJcIik7XHJcblx0XHRcclxuXHRcdGlmKG1hcmtlci5tYXAgIT09IHRoaXMpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIldyb25nIG1hcCBlcnJvclwiKTtcclxuXHRcdFxyXG5cdFx0aWYobWFya2VyLmluZm9XaW5kb3cpXHJcblx0XHRcdG1hcmtlci5pbmZvV2luZG93LmNsb3NlKCk7XHJcblx0XHRcclxuXHRcdG1hcmtlci5tYXAgPSBudWxsO1xyXG5cdFx0bWFya2VyLnBhcmVudCA9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMubWFya2Vycy5zcGxpY2UodGhpcy5tYXJrZXJzLmluZGV4T2YobWFya2VyKSwgMSk7XHJcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoe3R5cGU6IFwibWFya2VycmVtb3ZlZFwiLCBtYXJrZXI6IG1hcmtlcn0pO1xyXG5cdFx0bWFya2VyLmRpc3BhdGNoRXZlbnQoe3R5cGU6IFwicmVtb3ZlZFwifSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgYSBtYXJrZXIgYnkgSURcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge2ludH0gaWQgVGhlIElEIG9mIHRoZSBtYXJrZXIgdG8gZ2V0XHJcblx0ICogQHJldHVybiB7V1BHTVpBLk1hcmtlcnxudWxsfSBUaGUgbWFya2VyLCBvciBudWxsIGlmIG5vIG1hcmtlciB3aXRoIHRoZSBzcGVjaWZpZWQgSUQgaXMgZm91bmRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRNYXJrZXJCeUlEID0gZnVuY3Rpb24oaWQpXHJcblx0e1xyXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHRoaXMubWFya2Vycy5sZW5ndGg7IGkrKylcclxuXHRcdHtcclxuXHRcdFx0aWYodGhpcy5tYXJrZXJzW2ldLmlkID09IGlkKVxyXG5cdFx0XHRcdHJldHVybiB0aGlzLm1hcmtlcnNbaV07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRNYXJrZXJCeVRpdGxlID0gZnVuY3Rpb24odGl0bGUpXHJcblx0e1xyXG5cdFx0aWYodHlwZW9mIHRpdGxlID09IFwic3RyaW5nXCIpXHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcmtlcnMubGVuZ3RoOyBpKyspXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpZih0aGlzLm1hcmtlcnNbaV0udGl0bGUgPT0gdGl0bGUpXHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5tYXJrZXJzW2ldO1xyXG5cdFx0XHR9XHJcblx0XHRlbHNlIGlmKHRpdGxlIGluc3RhbmNlb2YgUmVnRXhwKVxyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXJrZXJzLmxlbmd0aDsgaSsrKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYodGl0bGUudGVzdCh0aGlzLm1hcmtlcnNbaV0udGl0bGUpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMubWFya2Vyc1tpXTtcclxuXHRcdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGFyZ3VtZW50XCIpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBhIG1hcmtlciBieSBJRFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7aW50fSBpZCBUaGUgSUQgb2YgdGhlIG1hcmtlciB0byByZW1vdmVcclxuXHQgKiBAZmlyZXMgbWFya2VycmVtb3ZlZFxyXG5cdCAqIEBmaXJlcyBXUEdNWkEuTWFya2VyI3JlbW92ZWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5yZW1vdmVNYXJrZXJCeUlEID0gZnVuY3Rpb24oaWQpXHJcblx0e1xyXG5cdFx0dmFyIG1hcmtlciA9IHRoaXMuZ2V0TWFya2VyQnlJRChpZCk7XHJcblx0XHRcclxuXHRcdGlmKCFtYXJrZXIpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZW1vdmVNYXJrZXIobWFya2VyKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQWRkcyB0aGUgc3BlY2lmaWVkIHBvbHlnb24gdG8gdGhpcyBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5Qb2x5Z29ufSBwb2x5Z29uIFRoZSBwb2x5Z29uIHRvIGFkZFxyXG5cdCAqIEBmaXJlcyBwb2x5Z29uYWRkZWRcclxuXHQgKiBAdGhyb3dzIEFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLlBvbHlnb25cclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5hZGRQb2x5Z29uID0gZnVuY3Rpb24ocG9seWdvbilcclxuXHR7XHJcblx0XHRpZighKHBvbHlnb24gaW5zdGFuY2VvZiBXUEdNWkEuUG9seWdvbikpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLlBvbHlnb25cIik7XHJcblx0XHRcclxuXHRcdHBvbHlnb24ubWFwID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5wb2x5Z29ucy5wdXNoKHBvbHlnb24pO1xyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcInBvbHlnb25hZGRlZFwiLCBwb2x5Z29uOiBwb2x5Z29ufSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBwb2x5Z29uIGZyb20gdGhpcyBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5Qb2x5Z29ufSBwb2x5Z29uIFRoZSBwb2x5Z29uIHRvIHJlbW92ZVxyXG5cdCAqIEBmaXJlcyBwb2x5Z29ucmVtb3ZlZFxyXG5cdCAqIEB0aHJvd3MgQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuUG9seWdvblxyXG5cdCAqIEB0aHJvd3MgV3JvbmcgbWFwIGVycm9yXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUucmVtb3ZlUG9seWdvbiA9IGZ1bmN0aW9uKHBvbHlnb24pXHJcblx0e1xyXG5cdFx0aWYoIShwb2x5Z29uIGluc3RhbmNlb2YgV1BHTVpBLlBvbHlnb24pKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5Qb2x5Z29uXCIpO1xyXG5cdFx0XHJcblx0XHRpZihwb2x5Z29uLm1hcCAhPT0gdGhpcylcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiV3JvbmcgbWFwIGVycm9yXCIpO1xyXG5cdFx0XHJcblx0XHRwb2x5Z29uLm1hcCA9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMucG9seWdvbnMuc3BsaWNlKHRoaXMucG9seWdvbnMuaW5kZXhPZihwb2x5Z29uKSwgMSk7XHJcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoe3R5cGU6IFwicG9seWdvbnJlbW92ZWRcIiwgcG9seWdvbjogcG9seWdvbn0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIGEgcG9seWdvbiBieSBJRFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7aW50fSBpZCBUaGUgSUQgb2YgdGhlIHBvbHlnb24gdG8gZ2V0XHJcblx0ICogQHJldHVybiB7V1BHTVpBLlBvbHlnb258bnVsbH0gVGhlIHBvbHlnb24sIG9yIG51bGwgaWYgbm8gcG9seWdvbiB3aXRoIHRoZSBzcGVjaWZpZWQgSUQgaXMgZm91bmRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRQb2x5Z29uQnlJRCA9IGZ1bmN0aW9uKGlkKVxyXG5cdHtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnBvbHlnb25zLmxlbmd0aDsgaSsrKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0aGlzLnBvbHlnb25zW2ldLmlkID09IGlkKVxyXG5cdFx0XHRcdHJldHVybiB0aGlzLnBvbHlnb25zW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBhIHBvbHlnb24gYnkgSURcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge2ludH0gaWQgVGhlIElEIG9mIHRoZSBwb2x5Z29uIHRvIHJlbW92ZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnJlbW92ZVBvbHlnb25CeUlEID0gZnVuY3Rpb24oaWQpXHJcblx0e1xyXG5cdFx0dmFyIHBvbHlnb24gPSB0aGlzLmdldFBvbHlnb25CeUlEKGlkKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBvbHlnb24pXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZW1vdmVQb2x5Z29uKHBvbHlnb24pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIGEgcG9seWxpbmUgYnkgSURcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRQb2x5bGluZUJ5SUQgPSBmdW5jdGlvbihpZClcclxuXHR7XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wb2x5bGluZXMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMucG9seWxpbmVzW2ldLmlkID09IGlkKVxyXG5cdFx0XHRcdHJldHVybiB0aGlzLnBvbHlsaW5lc1tpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEFkZHMgdGhlIHNwZWNpZmllZCBwb2x5bGluZSB0byB0aGlzIG1hcFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7V1BHTVpBLlBvbHlsaW5lfSBwb2x5bGluZSBUaGUgcG9seWxpbmUgdG8gYWRkXHJcblx0ICogQGZpcmVzIHBvbHlsaW5lYWRkZWRcclxuXHQgKiBAdGhyb3dzIEFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLlBvbHlsaW5lXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUuYWRkUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHRpZighKHBvbHlsaW5lIGluc3RhbmNlb2YgV1BHTVpBLlBvbHlsaW5lKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuUG9seWxpbmVcIik7XHJcblx0XHRcclxuXHRcdHBvbHlsaW5lLm1hcCA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMucG9seWxpbmVzLnB1c2gocG9seWxpbmUpO1xyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcInBvbHlsaW5lYWRkZWRcIiwgcG9seWxpbmU6IHBvbHlsaW5lfSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBwb2x5bGluZSBmcm9tIHRoaXMgbWFwXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtXUEdNWkEuUG9seWxpbmV9IHBvbHlsaW5lIFRoZSBwb2x5bGluZSB0byByZW1vdmVcclxuXHQgKiBAZmlyZXMgcG9seWxpbmVyZW1vdmVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5Qb2x5bGluZVxyXG5cdCAqIEB0aHJvd3MgV3JvbmcgbWFwIGVycm9yXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUucmVtb3ZlUG9seWxpbmUgPSBmdW5jdGlvbihwb2x5bGluZSlcclxuXHR7XHJcblx0XHRpZighKHBvbHlsaW5lIGluc3RhbmNlb2YgV1BHTVpBLlBvbHlsaW5lKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuUG9seWxpbmVcIik7XHJcblx0XHRcclxuXHRcdGlmKHBvbHlsaW5lLm1hcCAhPT0gdGhpcylcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiV3JvbmcgbWFwIGVycm9yXCIpO1xyXG5cdFx0XHJcblx0XHRwb2x5bGluZS5tYXAgPSBudWxsO1xyXG5cdFx0XHJcblx0XHR0aGlzLnBvbHlsaW5lcy5zcGxpY2UodGhpcy5wb2x5bGluZXMuaW5kZXhPZihwb2x5bGluZSksIDEpO1xyXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOiBcInBvbHlsaW5lcmVtb3ZlZFwiLCBwb2x5bGluZTogcG9seWxpbmV9KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyBhIHBvbHlsaW5lIGJ5IElEXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtpbnR9IGlkIFRoZSBJRCBvZiB0aGUgcG9seWxpbmUgdG8gZ2V0XHJcblx0ICogQHJldHVybiB7V1BHTVpBLlBvbHlsaW5lfG51bGx9IFRoZSBwb2x5bGluZSwgb3IgbnVsbCBpZiBubyBwb2x5bGluZSB3aXRoIHRoZSBzcGVjaWZpZWQgSUQgaXMgZm91bmRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5nZXRQb2x5bGluZUJ5SUQgPSBmdW5jdGlvbihpZClcclxuXHR7XHJcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5wb2x5bGluZXMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMucG9seWxpbmVzW2ldLmlkID09IGlkKVxyXG5cdFx0XHRcdHJldHVybiB0aGlzLnBvbHlsaW5lc1tpXTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJlbW92ZXMgYSBwb2x5bGluZSBieSBJRFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7aW50fSBpZCBUaGUgSUQgb2YgdGhlIHBvbHlsaW5lIHRvIHJlbW92ZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnJlbW92ZVBvbHlsaW5lQnlJRCA9IGZ1bmN0aW9uKGlkKVxyXG5cdHtcclxuXHRcdHZhciBwb2x5bGluZSA9IHRoaXMuZ2V0UG9seWxpbmVCeUlEKGlkKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBvbHlsaW5lKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHRcdHRoaXMucmVtb3ZlUG9seWxpbmUocG9seWxpbmUpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBBZGRzIHRoZSBzcGVjaWZpZWQgY2lyY2xlIHRvIHRoaXMgbWFwXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtXUEdNWkEuQ2lyY2xlfSBjaXJjbGUgVGhlIGNpcmNsZSB0byBhZGRcclxuXHQgKiBAZmlyZXMgcG9seWdvbmFkZGVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5DaXJjbGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5hZGRDaXJjbGUgPSBmdW5jdGlvbihjaXJjbGUpXHJcblx0e1xyXG5cdFx0aWYoIShjaXJjbGUgaW5zdGFuY2VvZiBXUEdNWkEuQ2lyY2xlKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuQ2lyY2xlXCIpO1xyXG5cdFx0XHJcblx0XHRjaXJjbGUubWFwID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dGhpcy5jaXJjbGVzLnB1c2goY2lyY2xlKTtcclxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh7dHlwZTogXCJjaXJjbGVhZGRlZFwiLCBjaXJjbGU6IGNpcmNsZX0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgY2lyY2xlIGZyb20gdGhpcyBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXBcclxuXHQgKiBAcGFyYW0ge1dQR01aQS5DaXJjbGV9IGNpcmNsZSBUaGUgY2lyY2xlIHRvIHJlbW92ZVxyXG5cdCAqIEBmaXJlcyBjaXJjbGVyZW1vdmVkXHJcblx0ICogQHRocm93cyBBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAdGhyb3dzIFdyb25nIG1hcCBlcnJvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLnJlbW92ZUNpcmNsZSA9IGZ1bmN0aW9uKGNpcmNsZSlcclxuXHR7XHJcblx0XHRpZighKGNpcmNsZSBpbnN0YW5jZW9mIFdQR01aQS5DaXJjbGUpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5DaXJjbGVcIik7XHJcblx0XHRcclxuXHRcdGlmKGNpcmNsZS5tYXAgIT09IHRoaXMpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIldyb25nIG1hcCBlcnJvclwiKTtcclxuXHRcdFxyXG5cdFx0Y2lyY2xlLm1hcCA9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMuY2lyY2xlcy5zcGxpY2UodGhpcy5jaXJjbGVzLmluZGV4T2YoY2lyY2xlKSwgMSk7XHJcblx0XHR0aGlzLmRpc3BhdGNoRXZlbnQoe3R5cGU6IFwiY2lyY2xlcmVtb3ZlZFwiLCBjaXJjbGU6IGNpcmNsZX0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIGEgY2lyY2xlIGJ5IElEXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQHBhcmFtIHtpbnR9IGlkIFRoZSBJRCBvZiB0aGUgY2lyY2xlIHRvIGdldFxyXG5cdCAqIEByZXR1cm4ge1dQR01aQS5DaXJjbGV8bnVsbH0gVGhlIGNpcmNsZSwgb3IgbnVsbCBpZiBubyBjaXJjbGUgd2l0aCB0aGUgc3BlY2lmaWVkIElEIGlzIGZvdW5kXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUuZ2V0Q2lyY2xlQnlJRCA9IGZ1bmN0aW9uKGlkKVxyXG5cdHtcclxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmNpcmNsZXMubGVuZ3RoOyBpKyspXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMuY2lyY2xlc1tpXS5pZCA9PSBpZClcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaXJjbGVzW2ldO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmVtb3ZlcyBhIGNpcmNsZSBieSBJRFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7aW50fSBpZCBUaGUgSUQgb2YgdGhlIGNpcmNsZSB0byByZW1vdmVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5yZW1vdmVDaXJjbGVCeUlEID0gZnVuY3Rpb24oaWQpXHJcblx0e1xyXG5cdFx0dmFyIGNpcmNsZSA9IHRoaXMuZ2V0Q2lyY2xlQnlJRChpZCk7XHJcblx0XHRcclxuXHRcdGlmKCFjaXJjbGUpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZW1vdmVDaXJjbGUoY2lyY2xlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUubnVkZ2VMYXRMbmcgPSBmdW5jdGlvbihsYXRMbmcsIHgsIHkpXHJcblx0e1xyXG5cdFx0dmFyIHBpeGVscyA9IHRoaXMubGF0TG5nVG9QaXhlbHMobGF0TG5nKTtcclxuXHRcdFxyXG5cdFx0cGl4ZWxzLnggKz0gcGFyc2VGbG9hdCh4KTtcclxuXHRcdHBpeGVscy55ICs9IHBhcnNlRmxvYXQoeSk7XHJcblx0XHRcclxuXHRcdGlmKGlzTmFOKHBpeGVscy54KSB8fCBpc05hTihwaXhlbHMueSkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29vcmRpbmF0ZXMgc3VwcGxpZWRcIik7XHJcblx0XHRcclxuXHRcdHJldHVybiB0aGlzLnBpeGVsc1RvTGF0TG5nKHBpeGVscyk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE51ZGdlcyB0aGUgbWFwIHZpZXdwb3J0IGJ5IHRoZSBnaXZlbiBwaXhlbCBjb29yZGluYXRlc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB4IE51bWJlciBvZiBwaXhlbHMgdG8gbnVkZ2UgYWxvbmcgdGhlIHggYXhpc1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB5IE51bWJlciBvZiBwaXhlbHMgdG8gbnVkZ2UgYWxvbmcgdGhlIHkgYXhpc1xyXG5cdCAqIEB0aHJvd3MgSW52YWxpZCBjb29yZGluYXRlcyBzdXBwbGllZFxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLm51ZGdlID0gZnVuY3Rpb24oeCwgeSlcclxuXHR7XHJcblx0XHR2YXIgbnVkZ2VkID0gdGhpcy5udWRnZUxhdExuZyh0aGlzLmdldENlbnRlcigpLCB4LCB5KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zZXRDZW50ZXIobnVkZ2VkKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUuYW5pbWF0ZU51ZGdlID0gZnVuY3Rpb24oeCwgeSwgb3JpZ2luLCBtaWxsaXNlY29uZHMpXHJcblx0e1xyXG5cdFx0dmFyIG51ZGdlZDtcclxuXHRcclxuXHRcdGlmKCFvcmlnaW4pXHJcblx0XHRcdG9yaWdpbiA9IHRoaXMuZ2V0Q2VudGVyKCk7XHJcblx0XHRlbHNlIGlmKCEob3JpZ2luIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZykpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk9yaWdpbiBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcIik7XHJcblxyXG5cdFx0bnVkZ2VkID0gdGhpcy5udWRnZUxhdExuZyhvcmlnaW4sIHgsIHkpO1xyXG5cdFx0XHJcblx0XHRpZighbWlsbGlzZWNvbmRzKVxyXG5cdFx0XHRtaWxsaXNlY29uZHMgPSBXUEdNWkEuZ2V0U2Nyb2xsQW5pbWF0aW9uRHVyYXRpb24oKTtcclxuXHRcdFxyXG5cdFx0JCh0aGlzKS5hbmltYXRlKHtcclxuXHRcdFx0bGF0OiBudWRnZWQubGF0LFxyXG5cdFx0XHRsbmc6IG51ZGdlZC5sbmdcclxuXHRcdH0sIG1pbGxpc2Vjb25kcyk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSB3aW5kb3cgcmVzaXplc1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLm9uV2luZG93UmVzaXplID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBlbmdpbmUgbWFwIGRpdiBpcyByZXNpemVkXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUub25FbGVtZW50UmVzaXplZCA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIHZpZXdwb3J0IGJvdW5kcyBjaGFuZ2UuIEZpcmVzIHRoZSBsZWdhY3kgYm91bmRzX2NoYW5nZWQgZXZlbnQuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFwXHJcblx0ICogQGZpcmVzIGJvdW5kc2NoYW5nZWRcclxuXHQgKiBAZmlyZXMgYm91bmRzX2NoYW5nZWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFwLnByb3RvdHlwZS5vbkJvdW5kc0NoYW5nZWQgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHQvLyBOYXRpdmUgZXZlbnRzXHJcblx0XHR0aGlzLnRyaWdnZXIoXCJib3VuZHNjaGFuZ2VkXCIpO1xyXG5cdFx0XHJcblx0XHQvLyBHb29nbGUgLyBsZWdhY3kgY29tcGF0aWJpbGl0eSBldmVudHNcclxuXHRcdHRoaXMudHJpZ2dlcihcImJvdW5kc19jaGFuZ2VkXCIpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIHZpZXdwb3J0IGJlY29tZXMgaWRsZSAoZWcgbW92ZW1lbnQgZG9uZSwgdGlsZXMgbG9hZGVkKVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcFxyXG5cdCAqIEBmaXJlcyBpZGxlXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUub25JZGxlID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dGhpcy50cmlnZ2VyKFwiaWRsZVwiKTtcclxuXHR9XHJcblxyXG5cdFdQR01aQS5NYXAucHJvdG90eXBlLmhhc1Zpc2libGVNYXJrZXJzID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0Ly8gc2VlIGhvdyBtYW55IG1hcmtlcnMgaXMgdmlzaWJsZVxyXG5cdFx0dmFyIG1hcmtlcnNfdmlzaWJsZSA9IDA7XHJcblxyXG5cdFx0Ly8gbG9vcCB0aHJvdWdoIHRoZSBtYXJrZXJzXHJcblx0XHRmb3IodmFyIG1hcmtlcl9pZCBpbiBtYXJrZXJfYXJyYXkpXHJcblx0XHR7XHJcblx0XHRcdC8vIGZpbmQgbWFya2VycyBvbiBtYXAgYWZ0ZXIgc2VhcmNoXHJcblx0XHRcdHZhciBtYXJrZXIgPSBtYXJrZXJfYXJyYXlbbWFya2VyX2lkXTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIE5COiBXZSBjaGVjayB3aGV0aGVyIHRoZSBtYXJrZXIgaXMgb24gYSBtYXAgb3Igbm90IGhlcmUsIFBybyB0b2dnbGVzIHZpc2liaWxpdHksIGJhc2ljIGFkZHMgYW5kIHJlbW92ZXMgbWFya2Vyc1xyXG5cdFx0XHRpZihtYXJrZXIuaXNGaWx0ZXJhYmxlICYmIG1hcmtlci5nZXRNYXAoKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIGNvdW50IG1hcmtlcnMgdmlzaWJsZVxyXG5cdFx0XHRcdG1hcmtlcnNfdmlzaWJsZSsrO1xyXG5cdFx0XHRcdGJyZWFrO1x0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIG1hcmtlcnNfdmlzaWJsZSA+IDA7IC8vIFJldHVybnMgdHJ1ZSBpZiBtYXJrZXJzIGFyZSB2aXNpYmxlLCBmYWxzZSBpZiBub3RcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcC5wcm90b3R5cGUuY2xvc2VBbGxJbmZvV2luZG93cyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR0aGlzLm1hcmtlcnMuZm9yRWFjaChmdW5jdGlvbihtYXJrZXIpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKG1hcmtlci5pbmZvV2luZG93KVxyXG5cdFx0XHRcdG1hcmtlci5pbmZvV2luZG93LmNsb3NlKCk7XHJcblx0XHRcdFx0XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibWFwLmpzIn0=
