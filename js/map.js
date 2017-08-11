(function($) {
	
	/**
	 * Constructor
	 * @param element to contain map
	 */
	WPGMZA.Map = function(element)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		if(!(element instanceof HTMLElement))
			throw new Error("Argument must be a HTMLElement");
		
		WPGMZA.maps.push(this);
		
		this.id = element.getAttribute("data-map-id");
		if(!/\d+/.test(this.id))
			throw new Error("Map ID must be an integer");
		
		this.element = element;
		this.element.wpgmzaMap = this;
		
		this.engineElement = $(this.element).find(".wpgmza-engine-map")[0];
		
		if(!jQuery.fn.jquery.match(/1\.([0-7])\.([0-9])/))
			$(this.element).find("#wpgmza-jquery-error").remove();
		
		this.loader = $(element).find(".wpgmza-loader");
		
		this.markers = [];
		this.polygons = [];
		this.polylines = [];
		
		var data;
		this.shortcodeAttributes = {};
		if(data = $(this.element).attr("data-shortcode-attributes"))
			this.shortcodeAttributes = JSON.parse(data);
		
		// Please use ID for the *key*, do NOT use push, eg this.excludeIDs.markers[id] = true
		this.excludeIDs = {
			markers: [],
			polygons: [],
			polylines: []
		};
		
		// This session ID is unique to the map on this visit, as opposed to the PHP session ID. This is used server side to remember which markers have already been sent
		this.sessionID = WPGMZA.guid();
		
		this.ajaxTimeoutID = null;
		this.pendingAJAXRequests = 0;
		
		this.loadSettings();
		
		// Store locator
		if(this.settings.store_locator_enabled)
			this.storeLocator = WPGMZA.StoreLocator.createInstance(this);
		
		// Parse marker IDs to get order for marker labels
		this.markerLabelOrder = this.decodeIDs($(element).attr("data-marker-id-ranges"));
		
		// Layout
		if(this.settings.general_layout)
			$(element).addClass(this.settings.general_layout);
		
		if(this.settings.layout && this.settings.layout.length)
		{
			layout = JSON.parse(this.settings.layout);
			this.setLayout(layout);
		}
		
		var width, height, prevWidth, prevHeight;
		setInterval(function() {
			
			width = $(self.engineElement).width();
			height = $(self.engineElement).height();
			
			if(width != prevWidth || height != prevHeight)
				self.onElementResized();
			
			prevWidth = width;
			prevHeight = height;
			
		}, 1000);
		
		$(element).find(".wpgmza-load-failed").remove();
	}
	
	WPGMZA.Map.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.Map.prototype.constructor = WPGMZA.Map;
	
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

		if(!this.settings.width)
			this.settings.width = "100%";
		if(!this.settings.height)
			this.settings.height = "400px";
		
		this.setDimensions(this.settings.width, this.settings.height);
		this.setAlignment(this.settings.map_align);
	}
	
	/**
	 * Decodes the marker IDs for label order
	 * @return void
	 */
	WPGMZA.Map.prototype.decodeIDs = function(ids)
	{
		var ranges = ids.split(",");
		var result = [];
		
		for(var i = 0; i < ranges.length; i++)
		{
			var range = ranges[i];
			var parts = range.split("-");
			
			if(parts.length == 1)
				result.push(parseInt(parts[0], 36));
			else
			{
				var end = parseInt(parts[1], 36);
				for(var j = parseInt(parts[0], 36); j <= end; j++)
					result.push(j);
			}
		}
		
		return result;
	}
	
	/**
	 * Fired when map bounds are initially set or change
	 * @return void
	 */
	WPGMZA.Map.prototype.onBoundsChanged = function()
	{
        if (this.allMarkersFetched) {
            return;	// We've already got them all, don't make another call
        }

        var self = this;
		
		if(this.ajaxTimeoutID != null)
			clearTimeout(this.ajaxTimeoutID);
		
		this.ajaxTimeoutID = setTimeout(function() {
			self.fetch();
		}, 500);
		
		this.dispatchEvent({type: "boundschanged"});
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
		
		this.markers.push(marker);
		this.dispatchEvent({type: "markeradded", marker: marker});
		marker.dispatchEvent({type: "added"});
	}
	
	/**
	 * Removes the specified marker from this map
	 * @return void
	 */
	WPGMZA.Map.prototype.deleteMarker = function(marker)
	{
		if(!(marker instanceof WPGMZA.Marker))
			throw new Error("Argument must be an instance of WPGMZA.Marker");
		
		if(marker.map !== this)
			throw new Error("Wrong map error");
		
		marker.map = null;
		
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
		
		this.polygons.push(polygon);
		this.dispatchEvent({type: "polygonadded", polygon: polygon});
	}
	
	/**
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.Map.prototype.deletePolygon = function(polygon)
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
	 * Adds the specified polyline to this map
	 * @return void
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
	 * Removes the specified polygon from this map
	 * @return void
	 */
	WPGMZA.Map.prototype.deletePolyline = function(polyline)
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
	 * @return void
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
	 * Get closeset marker, used by store locator
	 * TODO: A binary tree or  quadtree would speed this up massively
	 * @param latLng
	 * @return WPGMZA.Marker
	 */
	WPGMZA.Map.prototype.getClosestMarker = function(lat, lng)
	{
		var dist;
		var closestIndex;
		var closestDistance = Infinity;
		
		var x1 = lng;
		var y1 = lat;
		var x2, y2, dx, dy;
		var position;
		var count = this.markers.length;
		
		if(count == 0)
			return null;
		
		for(var i = 0; i < count; i++)
		{
			// IMPORTANT: Please do NOT use this formula for getting the distance between two latLngs, it is ONLY good for a quick and dirty way to find the closest marker. It does not account for the curvature of the earth.
			position = this.markers[i].getPosition();
			x2 = position.lng;
			y2 = position.lat;
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
	 * Gets the parameters to be sent with AJAX fetch request
	 * @return object
	 */
	WPGMZA.Map.prototype.getFetchParameters = function()
	{
		return {
			map_id:	this.id,
			action:	"wpgmza_map_fetch",
			sid:	this.sessionID
		};
	}
	
	/**
	 * Fetches all markers, polygons and polylines within viewport bounds
	 * @return void
	 */
	WPGMZA.Map.prototype.fetch = function()
	{
		var self = this;
		var data = this.getFetchParameters();
		
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
				
				self.onFetchComplete(json);
			}
		});
	}
	
	/**
	 * Called when the AJAX fetch call completes
	 * @return void
	 */
	WPGMZA.Map.prototype.onFetchComplete = function(json)
	{
        if (json.markers == null) {
            this.allMarkersFetched = true;
        } else {
            for(var i = 0; i < json.markers.length; i++)
            {
                if(this.excludeIDs.markers[json.markers[i].id])
                    continue;

                var marker = this.createMarkerInstance(json.markers[i]);
                marker.modified = false;
                this.addMarker(marker);
            }
        }

		for(i = 0; i < json.polygons.length; i++)
		{
			if(this.excludeIDs.polygons[json.polygons[i].id])
				continue;
			
			var polygon = this.createPolygonInstance(json.polygons[i]);
			polygon.modified = false;
			this.addPolygon(polygon);
		}
		
		for(i = 0; i < json.polylines.length; i++)
		{
			if(this.excludeIDs.polylines[json.polylines[i].id])
				continue;
			
			var polyline = this.createPolylineInstance(json.polylines[i]);
			polyline.modified = false;
			this.addPolyline(polyline);
		}
		
		this.dispatchEvent({type: "fetchsuccess"});
	}
	
	/**
	 * Sets the dimensions of the map
	 * @return void
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
	
	/**
	 * Gets the layout information for serialization
	 * @return void
	 */
	WPGMZA.Map.prototype.getLayout = function()
	{
		var elements = $(this.element).find("[data-wpgmza-layout-element]");
		var data = {
			order: [],
			grid: {}
		};
		
		for(var i = 0; i < elements.length; i++)
		{
			var grid = $(elements[i]).closest(".wpgmza-in-map-grid");
			var name = $(elements[i]).attr("data-wpgmza-layout-element");
			
			if(grid.length)
				data.grid[ $(elements[i]).closest(".wpgmza-cell").attr("data-grid-position") ] = name;
			else
				data.order.push(name);
		}
		
		return data;
	}
	
	/**
	 * Sets the layout of the map
	 * @return object
	 */
	WPGMZA.Map.prototype.setLayout = function(layout)
	{
		var element = this.element;
		
		for(var i = 0; i < layout.order.length; i++)
		{
			var layoutElement = $(element).find("[data-wpgmza-layout-element='" + layout.order[i] + "']");
			
			if(layoutElement.length)
				$(element).append(layoutElement);
			else
				console.warn("Element '" + name + "' not found for layout");
		}
		
		for(var position in layout.grid)
		{
			var container = $(element).find(".wpgmza-in-map-grid [data-grid-position='" + position + "']");
			var layoutElement = $(element).find("[data-wpgmza-layout-element='" + layout.grid[position] + "']");
			
			if(layoutElement.length)
				$(container).append(layoutElement);
			else
				console.warn("Element '" + name + "' not found for layout");
		}
	}
	
	/**
	 * Listener for when the engine map div is resized
	 * @return void
	 */
	WPGMZA.Map.prototype.onElementResized = function(event)
	{
		
	}
	
	$(document).ready(function() {
		function createMaps()
		{
			// TODO: Test that this works for maps off screen (which borks google)
			$(".wpgmza-map").each(function(index, el) {
				if(!el.wpgmzaMap)
				{
					WPGMZA.runCatchableTask(function() {
						WPGMZA.createMapInstance(el);
					}, el);
				}
			});
		}
		
		createMaps();
		
		// Call again each second to load AJAX maps
		setInterval(createMaps, 1000);
	});
})(jQuery);