/**
 * @namespace WPGMZA
 * @module Marker
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * Base class for markers. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Marker
	 * @constructor WPGMZA.Marker
	 * @memberof WPGMZA
	 * @param {object} [row] Data to map to this object (eg from the database)
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Marker = function(row)
	{
		var self = this;
		
		this._offset = {x: 0, y: 0};
		
		WPGMZA.assertInstanceOf(this, "Marker");
		
		this.lat = "36.778261";
		this.lng = "-119.4179323999";
		this.address = "California";
		this.title = null;
		this.description = "";
		this.link = "";
		this.icon = "";
		this.approved = 1;
		this.pic = null;
		
		this.isFilterable = true;
		this.disableInfoWindow = false;
		
		WPGMZA.MapObject.apply(this, arguments);
		
		if(row && row.heatmap)
			return; // Don't listen for these events on heatmap markers.
		
		if(row)
			this.on("init", function(event) {
				if(row.position)
					this.setPosition(row.position);
				
				if(row.map)
					row.map.addMarker(this);
			});
		
		this.addEventListener("added", function(event) {
			self.onAdded(event);
		});
		
		this.handleLegacyGlobals(row);
	}
	
	WPGMZA.Marker.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Marker.prototype.constructor = WPGMZA.Marker;
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Marker.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProMarker;
				return WPGMZA.OLMarker;
				break;
				
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProMarker;
				return WPGMZA.GoogleMarker;
				break;
		}
	}
	
	/**
	 * Creates an instance of a marker, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {object} [row] Data to map to this object (eg from the database)
	 */
	WPGMZA.Marker.createInstance = function(row)
	{
		var constructor = WPGMZA.Marker.getConstructor();
		return new constructor(row);
	}
	
	WPGMZA.Marker.ANIMATION_NONE			= "0";
	WPGMZA.Marker.ANIMATION_BOUNCE			= "1";
	WPGMZA.Marker.ANIMATION_DROP			= "2";
	
	Object.defineProperty(WPGMZA.Marker.prototype, "offsetX", {
		
		get: function()
		{
			return this._offset.x;
		},
		
		set: function(value)
		{
			this._offset.x = value;
			this.updateOffset();
		}
		
	});
	
	Object.defineProperty(WPGMZA.Marker.prototype, "offsetY", {
		
		get: function()
		{
			return this._offset.y;
		},
		
		set: function(value)
		{
			this._offset.y = value;
			this.updateOffset();
		}
		
	});
	
	/**
	 * Called when the marker has been added to a map
	 * @method
	 * @memberof WPGMZA.Marker
	 * @listens module:WPGMZA.Marker~added
	 * @fires module:WPGMZA.Marker~select When this marker is targeted by the marker shortcode attribute
	 */
	WPGMZA.Marker.prototype.onAdded = function(event)
	{
		var self = this;
		
		this.addEventListener("click", function(event) {
			self.onClick(event);
		});
		
		this.addEventListener("mouseover", function(event) {
			self.onMouseOver(event);
		});
		
		this.addEventListener("select", function(event) {
			self.onSelect(event);
		});
		
		if(this.map.settings.marker == this.id)
			self.trigger("select");
		
		if(this.infoopen == "1")
			this.openInfoWindow();
	}
	
	WPGMZA.Marker.prototype.handleLegacyGlobals = function(row)
	{
		if(!(WPGMZA.settings.useLegacyGlobals && this.map_id && this.id))
			return;
		
		var m;
		if(WPGMZA.pro_version && (m = WPGMZA.pro_version.match(/\d+/)))
		{
			if(m[0] <= 7)
				return; // Don't touch the legacy globals
		}
		
		if(!window.marker_array)
			window.marker_array = {};
		
		if(!marker_array[this.map_id])
			marker_array[this.map_id] = [];
		
		marker_array[this.map_id][this.id] = this;
		
		if(!window.wpgmaps_localize_marker_data)
			window.wpgmaps_localize_marker_data = {};
		
		if(!wpgmaps_localize_marker_data[this.map_id])
			wpgmaps_localize_marker_data[this.map_id] = [];
		
		var cloned = $.extend({marker_id: this.id}, row);
		wpgmaps_localize_marker_data[this.map_id][this.id] = cloned;
	}
	
	WPGMZA.Marker.prototype.initInfoWindow = function()
	{
		if(this.infoWindow)
			return;
		
		this.infoWindow = WPGMZA.InfoWindow.createInstance();
	}
	
	/**
	 * Placeholder for future use
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.openInfoWindow = function()
	{
		if(!this.map)
		{
			console.warn("Cannot open infowindow for marker with no map");
			return;
		}
		
		// NB: This is a workaround for "undefined" in InfoWindows (basic only) on map edit page
		if(WPGMZA.currentPage == "map-edit" && !WPGMZA.pro_version)
			return;
		
		if(this.map.lastInteractedMarker)
			this.map.lastInteractedMarker.infoWindow.close();
		this.map.lastInteractedMarker = this;
		
		this.initInfoWindow();
		this.infoWindow.open(this.map, this);
	}
	
	/**
	 * Called when the marker has been clicked
	 * @method
	 * @memberof WPGMZA.Marker
	 * @listens module:WPGMZA.Marker~click
	 */
	WPGMZA.Marker.prototype.onClick = function(event)
	{
		
	}
	
	/**
	 * Called when the marker has been selected, either by the icon being clicked, or from a marker listing
	 * @method
	 * @memberof WPGMZA.Marker
	 * @listens module:WPGMZA.Marker~select
	 */
	WPGMZA.Marker.prototype.onSelect = function(event)
	{
		this.openInfoWindow();
	}
	
	/**
	 * Called when the user hovers the mouse over this marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @listens module:WPGMZA.Marker~mouseover
	 */
	WPGMZA.Marker.prototype.onMouseOver = function(event)
	{
		if(this.map.settings.info_window_open_by == WPGMZA.InfoWindow.OPEN_BY_HOVER)
			this.openInfoWindow();
	}
	
	/**
	 * Gets the marker icon image URL, without the protocol prefix
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {string} The URL to the markers icon image
	 */
	WPGMZA.Marker.prototype.getIcon = function()
	{
		function stripProtocol(url)
		{
			if(typeof url != "string")
				return url;
			
			return url.replace(/^http(s?):/, "");
		}
		
		if(WPGMZA.defaultMarkerIcon)
			return stripProtocol(WPGMZA.defaultMarkerIcon);
		
		return stripProtocol(WPGMZA.settings.default_marker_icon);
	}
	
	/**
	 * Gets the position of the marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {object} LatLng literal of this markers position
	 */
	WPGMZA.Marker.prototype.getPosition = function()
	{
		return new WPGMZA.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		});
	}
	
	/**
	 * Sets the position of the marker.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {object|WPGMZA.LatLng} latLng The position either as a LatLng literal or instance of WPGMZA.LatLng.
	 */
	WPGMZA.Marker.prototype.setPosition = function(latLng)
	{
		if(latLng instanceof WPGMZA.LatLng)
		{
			this.lat = latLng.lat;
			this.lng = latLng.lng;
		}
		else
		{
			this.lat = parseFloat(latLng.lat);
			this.lng = parseFloat(latLng.lng);
		}
	}
	
	WPGMZA.Marker.prototype.setOffset = function(x, y)
	{
		this._offset.x = x;
		this._offset.y = y;
		
		this.updateOffset();
	}
	
	WPGMZA.Marker.prototype.updateOffset = function()
	{
		
	}
	
	/**
	 * Returns the animation set on this marker (see WPGMZA.Marker ANIMATION_* constants).
	 * @method
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.getAnimation = function(animation)
	{
		return this.settings.animation;
	}
	
	/**
	 * Sets the animation for this marker (see WPGMZA.Marker ANIMATION_* constants).
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {int} animation The animation to set.
	 */
	WPGMZA.Marker.prototype.setAnimation = function(animation)
	{
		this.settings.animation = animation;
	}
	
	/**
	 * Get the marker visibility
	 * @method
	 * @todo Implement
	 * @memberof WPGMZA.Marker
	 */
	WPGMZA.Marker.prototype.getVisible = function()
	{
		
	}
	
	/**
	 * Set the marker visibility. This is used by the store locator etc. and is not a setting. Closes the InfoWindow if the marker is being hidden and the InfoWindow for this marker is open.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {bool} visible Whether the marker should be visible or not
	 */
	WPGMZA.Marker.prototype.setVisible = function(visible)
	{
		if(!visible && this.infoWindow)
			this.infoWindow.close();
	}
	
	WPGMZA.Marker.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * Sets the map this marker should be displayed on. If it is already on a map, it will be removed from that map first, before being added to the supplied map.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {WPGMZA.Map} map The map to add this markmer to
	 */
	WPGMZA.Marker.prototype.setMap = function(map)
	{
		if(!map)
		{
			if(this.map)
				this.map.removeMarker(this);
		}
		else
			map.addMarker(this);
		
		this.map = map;
	}
	
	/**
	 * Gets whether this marker is draggable or not
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {bool} True if the marker is draggable
	 */
	WPGMZA.Marker.prototype.getDraggable = function()
	{
		
	}
	
	/**
	 * Sets whether the marker is draggable
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {bool} draggable Set to true to make this marker draggable
	 */
	WPGMZA.Marker.prototype.setDraggable = function(draggable)
	{
		
	}
	
	/**
	 * Sets options on this marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {object} options An object containing the options to be set
	 */
	WPGMZA.Marker.prototype.setOptions = function(options)
	{
		
	}
	
	WPGMZA.Marker.prototype.setOpacity = function(opacity)
	{
		
	}
	
	/**
	 * Centers the map this marker belongs to on this marker
	 * @method
	 * @memberof WPGMZA.Marker
	 * @throws Marker hasn't been added to a map
	 */
	WPGMZA.Marker.prototype.panIntoView = function()
	{
		if(!this.map)
			throw new Error("Marker hasn't been added to a map");
		
		this.map.setCenter(this.getPosition());
	}
	
	/**
	 * Overrides MapObject.toJSON, serializes the marker to a JSON object
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {object} A JSON representation of this marker
	 */
	WPGMZA.Marker.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		var position = this.getPosition();
		
		$.extend(result, {
			lat: position.lat,
			lng: position.lng,
			address: this.address,
			title: this.title,
			description: this.description,
			link: this.link,
			icon: this.icon,
			pic: this.pic,
			approved: this.approved
		});
		
		return result;
	}
	
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXJrZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTWFya2VyXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBCYXNlIGNsYXNzIGZvciBtYXJrZXJzLiA8c3Ryb25nPlBsZWFzZSA8ZW0+ZG8gbm90PC9lbT4gY2FsbCB0aGlzIGNvbnN0cnVjdG9yIGRpcmVjdGx5LiBBbHdheXMgdXNlIGNyZWF0ZUluc3RhbmNlIHJhdGhlciB0aGFuIGluc3RhbnRpYXRpbmcgdGhpcyBjbGFzcyBkaXJlY3RseS48L3N0cm9uZz4gVXNpbmcgY3JlYXRlSW5zdGFuY2UgYWxsb3dzIHRoaXMgY2xhc3MgdG8gYmUgZXh0ZXJuYWxseSBleHRlbnNpYmxlLlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuTWFya2VyXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5NYXJrZXJcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIERhdGEgdG8gbWFwIHRvIHRoaXMgb2JqZWN0IChlZyBmcm9tIHRoZSBkYXRhYmFzZSlcclxuXHQgKiBAYXVnbWVudHMgV1BHTVpBLk1hcE9iamVjdFxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXJrZXIgPSBmdW5jdGlvbihyb3cpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLl9vZmZzZXQgPSB7eDogMCwgeTogMH07XHJcblx0XHRcclxuXHRcdFdQR01aQS5hc3NlcnRJbnN0YW5jZU9mKHRoaXMsIFwiTWFya2VyXCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmxhdCA9IFwiMzYuNzc4MjYxXCI7XHJcblx0XHR0aGlzLmxuZyA9IFwiLTExOS40MTc5MzIzOTk5XCI7XHJcblx0XHR0aGlzLmFkZHJlc3MgPSBcIkNhbGlmb3JuaWFcIjtcclxuXHRcdHRoaXMudGl0bGUgPSBudWxsO1xyXG5cdFx0dGhpcy5kZXNjcmlwdGlvbiA9IFwiXCI7XHJcblx0XHR0aGlzLmxpbmsgPSBcIlwiO1xyXG5cdFx0dGhpcy5pY29uID0gXCJcIjtcclxuXHRcdHRoaXMuYXBwcm92ZWQgPSAxO1xyXG5cdFx0dGhpcy5waWMgPSBudWxsO1xyXG5cdFx0XHJcblx0XHR0aGlzLmlzRmlsdGVyYWJsZSA9IHRydWU7XHJcblx0XHR0aGlzLmRpc2FibGVJbmZvV2luZG93ID0gZmFsc2U7XHJcblx0XHRcclxuXHRcdFdQR01aQS5NYXBPYmplY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFxyXG5cdFx0aWYocm93ICYmIHJvdy5oZWF0bWFwKVxyXG5cdFx0XHRyZXR1cm47IC8vIERvbid0IGxpc3RlbiBmb3IgdGhlc2UgZXZlbnRzIG9uIGhlYXRtYXAgbWFya2Vycy5cclxuXHRcdFxyXG5cdFx0aWYocm93KVxyXG5cdFx0XHR0aGlzLm9uKFwiaW5pdFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdGlmKHJvdy5wb3NpdGlvbilcclxuXHRcdFx0XHRcdHRoaXMuc2V0UG9zaXRpb24ocm93LnBvc2l0aW9uKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihyb3cubWFwKVxyXG5cdFx0XHRcdFx0cm93Lm1hcC5hZGRNYXJrZXIodGhpcyk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJhZGRlZFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uQWRkZWQoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMuaGFuZGxlTGVnYWN5R2xvYmFscyhyb3cpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLk1hcE9iamVjdC5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk1hcmtlcjtcclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBjb250cnVjdG9yIHRvIGJlIHVzZWQgYnkgY3JlYXRlSW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgc2VsZWN0ZWQgbWFwcyBlbmdpbmUuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHJldHVybiB7ZnVuY3Rpb259IFRoZSBhcHByb3ByaWF0ZSBjb250cnVjdG9yXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5nZXRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRzd2l0Y2goV1BHTVpBLnNldHRpbmdzLmVuZ2luZSlcclxuXHRcdHtcclxuXHRcdFx0Y2FzZSBcIm9wZW4tbGF5ZXJzXCI6XHJcblx0XHRcdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTFByb01hcmtlcjtcclxuXHRcdFx0XHRyZXR1cm4gV1BHTVpBLk9MTWFya2VyO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFx0XHRcdHJldHVybiBXUEdNWkEuR29vZ2xlUHJvTWFya2VyO1xyXG5cdFx0XHRcdHJldHVybiBXUEdNWkEuR29vZ2xlTWFya2VyO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgbWFya2VyLCA8c3Ryb25nPnBsZWFzZSA8ZW0+YWx3YXlzPC9lbT4gdXNlIHRoaXMgZnVuY3Rpb24gcmF0aGVyIHRoYW4gY2FsbGluZyB0aGUgY29uc3RydWN0b3IgZGlyZWN0bHk8L3N0cm9uZz4uXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIERhdGEgdG8gbWFwIHRvIHRoaXMgb2JqZWN0IChlZyBmcm9tIHRoZSBkYXRhYmFzZSlcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24ocm93KVxyXG5cdHtcclxuXHRcdHZhciBjb25zdHJ1Y3RvciA9IFdQR01aQS5NYXJrZXIuZ2V0Q29uc3RydWN0b3IoKTtcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3Iocm93KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcmtlci5BTklNQVRJT05fTk9ORVx0XHRcdD0gXCIwXCI7XHJcblx0V1BHTVpBLk1hcmtlci5BTklNQVRJT05fQk9VTkNFXHRcdFx0PSBcIjFcIjtcclxuXHRXUEdNWkEuTWFya2VyLkFOSU1BVElPTl9EUk9QXHRcdFx0PSBcIjJcIjtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLk1hcmtlci5wcm90b3R5cGUsIFwib2Zmc2V0WFwiLCB7XHJcblx0XHRcclxuXHRcdGdldDogZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fb2Zmc2V0Lng7XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbHVlKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLl9vZmZzZXQueCA9IHZhbHVlO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFdQR01aQS5NYXJrZXIucHJvdG90eXBlLCBcIm9mZnNldFlcIiwge1xyXG5cdFx0XHJcblx0XHRnZXQ6IGZ1bmN0aW9uKClcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldC55O1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0c2V0OiBmdW5jdGlvbih2YWx1ZSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5fb2Zmc2V0LnkgPSB2YWx1ZTtcclxuXHRcdFx0dGhpcy51cGRhdGVPZmZzZXQoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBtYXJrZXIgaGFzIGJlZW4gYWRkZWQgdG8gYSBtYXBcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXJrZXJcclxuXHQgKiBAbGlzdGVucyBtb2R1bGU6V1BHTVpBLk1hcmtlcn5hZGRlZFxyXG5cdCAqIEBmaXJlcyBtb2R1bGU6V1BHTVpBLk1hcmtlcn5zZWxlY3QgV2hlbiB0aGlzIG1hcmtlciBpcyB0YXJnZXRlZCBieSB0aGUgbWFya2VyIHNob3J0Y29kZSBhdHRyaWJ1dGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5vbkFkZGVkID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uQ2xpY2soZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uTW91c2VPdmVyKGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHR0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3RcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vblNlbGVjdChldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5tYXAuc2V0dGluZ3MubWFya2VyID09IHRoaXMuaWQpXHJcblx0XHRcdHNlbGYudHJpZ2dlcihcInNlbGVjdFwiKTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5pbmZvb3BlbiA9PSBcIjFcIilcclxuXHRcdFx0dGhpcy5vcGVuSW5mb1dpbmRvdygpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5oYW5kbGVMZWdhY3lHbG9iYWxzID0gZnVuY3Rpb24ocm93KVxyXG5cdHtcclxuXHRcdGlmKCEoV1BHTVpBLnNldHRpbmdzLnVzZUxlZ2FjeUdsb2JhbHMgJiYgdGhpcy5tYXBfaWQgJiYgdGhpcy5pZCkpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dmFyIG07XHJcblx0XHRpZihXUEdNWkEucHJvX3ZlcnNpb24gJiYgKG0gPSBXUEdNWkEucHJvX3ZlcnNpb24ubWF0Y2goL1xcZCsvKSkpXHJcblx0XHR7XHJcblx0XHRcdGlmKG1bMF0gPD0gNylcclxuXHRcdFx0XHRyZXR1cm47IC8vIERvbid0IHRvdWNoIHRoZSBsZWdhY3kgZ2xvYmFsc1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZighd2luZG93Lm1hcmtlcl9hcnJheSlcclxuXHRcdFx0d2luZG93Lm1hcmtlcl9hcnJheSA9IHt9O1xyXG5cdFx0XHJcblx0XHRpZighbWFya2VyX2FycmF5W3RoaXMubWFwX2lkXSlcclxuXHRcdFx0bWFya2VyX2FycmF5W3RoaXMubWFwX2lkXSA9IFtdO1xyXG5cdFx0XHJcblx0XHRtYXJrZXJfYXJyYXlbdGhpcy5tYXBfaWRdW3RoaXMuaWRdID0gdGhpcztcclxuXHRcdFxyXG5cdFx0aWYoIXdpbmRvdy53cGdtYXBzX2xvY2FsaXplX21hcmtlcl9kYXRhKVxyXG5cdFx0XHR3aW5kb3cud3BnbWFwc19sb2NhbGl6ZV9tYXJrZXJfZGF0YSA9IHt9O1xyXG5cdFx0XHJcblx0XHRpZighd3BnbWFwc19sb2NhbGl6ZV9tYXJrZXJfZGF0YVt0aGlzLm1hcF9pZF0pXHJcblx0XHRcdHdwZ21hcHNfbG9jYWxpemVfbWFya2VyX2RhdGFbdGhpcy5tYXBfaWRdID0gW107XHJcblx0XHRcclxuXHRcdHZhciBjbG9uZWQgPSAkLmV4dGVuZCh7bWFya2VyX2lkOiB0aGlzLmlkfSwgcm93KTtcclxuXHRcdHdwZ21hcHNfbG9jYWxpemVfbWFya2VyX2RhdGFbdGhpcy5tYXBfaWRdW3RoaXMuaWRdID0gY2xvbmVkO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5pbml0SW5mb1dpbmRvdyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZih0aGlzLmluZm9XaW5kb3cpXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dGhpcy5pbmZvV2luZG93ID0gV1BHTVpBLkluZm9XaW5kb3cuY3JlYXRlSW5zdGFuY2UoKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUGxhY2Vob2xkZXIgZm9yIGZ1dHVyZSB1c2VcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXJrZXJcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5vcGVuSW5mb1dpbmRvdyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZighdGhpcy5tYXApXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUud2FybihcIkNhbm5vdCBvcGVuIGluZm93aW5kb3cgZm9yIG1hcmtlciB3aXRoIG5vIG1hcFwiKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBOQjogVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIFwidW5kZWZpbmVkXCIgaW4gSW5mb1dpbmRvd3MgKGJhc2ljIG9ubHkpIG9uIG1hcCBlZGl0IHBhZ2VcclxuXHRcdGlmKFdQR01aQS5jdXJyZW50UGFnZSA9PSBcIm1hcC1lZGl0XCIgJiYgIVdQR01aQS5wcm9fdmVyc2lvbilcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLm1hcC5sYXN0SW50ZXJhY3RlZE1hcmtlcilcclxuXHRcdFx0dGhpcy5tYXAubGFzdEludGVyYWN0ZWRNYXJrZXIuaW5mb1dpbmRvdy5jbG9zZSgpO1xyXG5cdFx0dGhpcy5tYXAubGFzdEludGVyYWN0ZWRNYXJrZXIgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLmluaXRJbmZvV2luZG93KCk7XHJcblx0XHR0aGlzLmluZm9XaW5kb3cub3Blbih0aGlzLm1hcCwgdGhpcyk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBtYXJrZXIgaGFzIGJlZW4gY2xpY2tlZFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBsaXN0ZW5zIG1vZHVsZTpXUEdNWkEuTWFya2VyfmNsaWNrXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUub25DbGljayA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgbWFya2VyIGhhcyBiZWVuIHNlbGVjdGVkLCBlaXRoZXIgYnkgdGhlIGljb24gYmVpbmcgY2xpY2tlZCwgb3IgZnJvbSBhIG1hcmtlciBsaXN0aW5nXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQGxpc3RlbnMgbW9kdWxlOldQR01aQS5NYXJrZXJ+c2VsZWN0XHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUub25TZWxlY3QgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR0aGlzLm9wZW5JbmZvV2luZG93KCk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENhbGxlZCB3aGVuIHRoZSB1c2VyIGhvdmVycyB0aGUgbW91c2Ugb3ZlciB0aGlzIG1hcmtlclxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBsaXN0ZW5zIG1vZHVsZTpXUEdNWkEuTWFya2Vyfm1vdXNlb3ZlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLm9uTW91c2VPdmVyID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0aWYodGhpcy5tYXAuc2V0dGluZ3MuaW5mb193aW5kb3dfb3Blbl9ieSA9PSBXUEdNWkEuSW5mb1dpbmRvdy5PUEVOX0JZX0hPVkVSKVxyXG5cdFx0XHR0aGlzLm9wZW5JbmZvV2luZG93KCk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIG1hcmtlciBpY29uIGltYWdlIFVSTCwgd2l0aG91dCB0aGUgcHJvdG9jb2wgcHJlZml4XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHJldHVybiB7c3RyaW5nfSBUaGUgVVJMIHRvIHRoZSBtYXJrZXJzIGljb24gaW1hZ2VcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5nZXRJY29uID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGZ1bmN0aW9uIHN0cmlwUHJvdG9jb2wodXJsKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0eXBlb2YgdXJsICE9IFwic3RyaW5nXCIpXHJcblx0XHRcdFx0cmV0dXJuIHVybDtcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiB1cmwucmVwbGFjZSgvXmh0dHAocz8pOi8sIFwiXCIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuZGVmYXVsdE1hcmtlckljb24pXHJcblx0XHRcdHJldHVybiBzdHJpcFByb3RvY29sKFdQR01aQS5kZWZhdWx0TWFya2VySWNvbik7XHJcblx0XHRcclxuXHRcdHJldHVybiBzdHJpcFByb3RvY29sKFdQR01aQS5zZXR0aW5ncy5kZWZhdWx0X21hcmtlcl9pY29uKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlclxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEByZXR1cm4ge29iamVjdH0gTGF0TG5nIGxpdGVyYWwgb2YgdGhpcyBtYXJrZXJzIHBvc2l0aW9uXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0bGF0OiBwYXJzZUZsb2F0KHRoaXMubGF0KSxcclxuXHRcdFx0bG5nOiBwYXJzZUZsb2F0KHRoaXMubG5nKVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBtYXJrZXIuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHBhcmFtIHtvYmplY3R8V1BHTVpBLkxhdExuZ30gbGF0TG5nIFRoZSBwb3NpdGlvbiBlaXRoZXIgYXMgYSBMYXRMbmcgbGl0ZXJhbCBvciBpbnN0YW5jZSBvZiBXUEdNWkEuTGF0TG5nLlxyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24obGF0TG5nKVxyXG5cdHtcclxuXHRcdGlmKGxhdExuZyBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubGF0ID0gbGF0TG5nLmxhdDtcclxuXHRcdFx0dGhpcy5sbmcgPSBsYXRMbmcubG5nO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmxhdCA9IHBhcnNlRmxvYXQobGF0TG5nLmxhdCk7XHJcblx0XHRcdHRoaXMubG5nID0gcGFyc2VGbG9hdChsYXRMbmcubG5nKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuc2V0T2Zmc2V0ID0gZnVuY3Rpb24oeCwgeSlcclxuXHR7XHJcblx0XHR0aGlzLl9vZmZzZXQueCA9IHg7XHJcblx0XHR0aGlzLl9vZmZzZXQueSA9IHk7XHJcblx0XHRcclxuXHRcdHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLnVwZGF0ZU9mZnNldCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgYW5pbWF0aW9uIHNldCBvbiB0aGlzIG1hcmtlciAoc2VlIFdQR01aQS5NYXJrZXIgQU5JTUFUSU9OXyogY29uc3RhbnRzKS5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXJrZXJcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5nZXRBbmltYXRpb24gPSBmdW5jdGlvbihhbmltYXRpb24pXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuc2V0dGluZ3MuYW5pbWF0aW9uO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSBhbmltYXRpb24gZm9yIHRoaXMgbWFya2VyIChzZWUgV1BHTVpBLk1hcmtlciBBTklNQVRJT05fKiBjb25zdGFudHMpLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBwYXJhbSB7aW50fSBhbmltYXRpb24gVGhlIGFuaW1hdGlvbiB0byBzZXQuXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuc2V0QW5pbWF0aW9uID0gZnVuY3Rpb24oYW5pbWF0aW9uKVxyXG5cdHtcclxuXHRcdHRoaXMuc2V0dGluZ3MuYW5pbWF0aW9uID0gYW5pbWF0aW9uO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXQgdGhlIG1hcmtlciB2aXNpYmlsaXR5XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEB0b2RvIEltcGxlbWVudFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuZ2V0VmlzaWJsZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogU2V0IHRoZSBtYXJrZXIgdmlzaWJpbGl0eS4gVGhpcyBpcyB1c2VkIGJ5IHRoZSBzdG9yZSBsb2NhdG9yIGV0Yy4gYW5kIGlzIG5vdCBhIHNldHRpbmcuIENsb3NlcyB0aGUgSW5mb1dpbmRvdyBpZiB0aGUgbWFya2VyIGlzIGJlaW5nIGhpZGRlbiBhbmQgdGhlIEluZm9XaW5kb3cgZm9yIHRoaXMgbWFya2VyIGlzIG9wZW4uXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHBhcmFtIHtib29sfSB2aXNpYmxlIFdoZXRoZXIgdGhlIG1hcmtlciBzaG91bGQgYmUgdmlzaWJsZSBvciBub3RcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5zZXRWaXNpYmxlID0gZnVuY3Rpb24odmlzaWJsZSlcclxuXHR7XHJcblx0XHRpZighdmlzaWJsZSAmJiB0aGlzLmluZm9XaW5kb3cpXHJcblx0XHRcdHRoaXMuaW5mb1dpbmRvdy5jbG9zZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5nZXRNYXAgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMubWFwO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSBtYXAgdGhpcyBtYXJrZXIgc2hvdWxkIGJlIGRpc3BsYXllZCBvbi4gSWYgaXQgaXMgYWxyZWFkeSBvbiBhIG1hcCwgaXQgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhhdCBtYXAgZmlyc3QsIGJlZm9yZSBiZWluZyBhZGRlZCB0byB0aGUgc3VwcGxpZWQgbWFwLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBwYXJhbSB7V1BHTVpBLk1hcH0gbWFwIFRoZSBtYXAgdG8gYWRkIHRoaXMgbWFya21lciB0b1xyXG5cdCAqL1xyXG5cdFdQR01aQS5NYXJrZXIucHJvdG90eXBlLnNldE1hcCA9IGZ1bmN0aW9uKG1hcClcclxuXHR7XHJcblx0XHRpZighbWFwKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0aGlzLm1hcClcclxuXHRcdFx0XHR0aGlzLm1hcC5yZW1vdmVNYXJrZXIodGhpcyk7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHRcdG1hcC5hZGRNYXJrZXIodGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwID0gbWFwO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBHZXRzIHdoZXRoZXIgdGhpcyBtYXJrZXIgaXMgZHJhZ2dhYmxlIG9yIG5vdFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEByZXR1cm4ge2Jvb2x9IFRydWUgaWYgdGhlIG1hcmtlciBpcyBkcmFnZ2FibGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5nZXREcmFnZ2FibGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgd2hldGhlciB0aGUgbWFya2VyIGlzIGRyYWdnYWJsZVxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEBwYXJhbSB7Ym9vbH0gZHJhZ2dhYmxlIFNldCB0byB0cnVlIHRvIG1ha2UgdGhpcyBtYXJrZXIgZHJhZ2dhYmxlXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuc2V0RHJhZ2dhYmxlID0gZnVuY3Rpb24oZHJhZ2dhYmxlKVxyXG5cdHtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIG9wdGlvbnMgb24gdGhpcyBtYXJrZXJcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5NYXJrZXJcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgb3B0aW9ucyB0byBiZSBzZXRcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucylcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUuc2V0T3BhY2l0eSA9IGZ1bmN0aW9uKG9wYWNpdHkpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENlbnRlcnMgdGhlIG1hcCB0aGlzIG1hcmtlciBiZWxvbmdzIHRvIG9uIHRoaXMgbWFya2VyXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTWFya2VyXHJcblx0ICogQHRocm93cyBNYXJrZXIgaGFzbid0IGJlZW4gYWRkZWQgdG8gYSBtYXBcclxuXHQgKi9cclxuXHRXUEdNWkEuTWFya2VyLnByb3RvdHlwZS5wYW5JbnRvVmlldyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRpZighdGhpcy5tYXApXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk1hcmtlciBoYXNuJ3QgYmVlbiBhZGRlZCB0byBhIG1hcFwiKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXAuc2V0Q2VudGVyKHRoaXMuZ2V0UG9zaXRpb24oKSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE92ZXJyaWRlcyBNYXBPYmplY3QudG9KU09OLCBzZXJpYWxpemVzIHRoZSBtYXJrZXIgdG8gYSBKU09OIG9iamVjdFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLk1hcmtlclxyXG5cdCAqIEByZXR1cm4ge29iamVjdH0gQSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgbWFya2VyXHJcblx0ICovXHJcblx0V1BHTVpBLk1hcmtlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciByZXN1bHQgPSBXUEdNWkEuTWFwT2JqZWN0LnByb3RvdHlwZS50b0pTT04uY2FsbCh0aGlzKTtcclxuXHRcdHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb24oKTtcclxuXHRcdFxyXG5cdFx0JC5leHRlbmQocmVzdWx0LCB7XHJcblx0XHRcdGxhdDogcG9zaXRpb24ubGF0LFxyXG5cdFx0XHRsbmc6IHBvc2l0aW9uLmxuZyxcclxuXHRcdFx0YWRkcmVzczogdGhpcy5hZGRyZXNzLFxyXG5cdFx0XHR0aXRsZTogdGhpcy50aXRsZSxcclxuXHRcdFx0ZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXHJcblx0XHRcdGxpbms6IHRoaXMubGluayxcclxuXHRcdFx0aWNvbjogdGhpcy5pY29uLFxyXG5cdFx0XHRwaWM6IHRoaXMucGljLFxyXG5cdFx0XHRhcHByb3ZlZDogdGhpcy5hcHByb3ZlZFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Im1hcmtlci5qcyJ9
