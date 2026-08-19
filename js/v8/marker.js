/**
 * @namespace WPGMZA
 * @module Marker
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Base class for markers. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Marker
	 * @constructor WPGMZA.Marker
	 * @memberof WPGMZA
	 * @param {object} [row] Data to map to this object (eg from the database)
	 * @augments WPGMZA.Feature
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
		
		WPGMZA.Feature.apply(this, arguments);
		
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

		// Marker.removeMarker() dispatches "removed" here but never touches native engine
		// state directly - without this, an owned label would be orphaned on the map after
		// its marker is removed (e.g. deleted, or replaced during a marker refetch).
		this.addEventListener("removed", function(event) {
			if(self.label){
				self.label.map = null;
				self.label = false;
			}
		});

		this.handleLegacyGlobals(row);
	}
	
	WPGMZA.Marker.prototype = Object.create(WPGMZA.Feature.prototype);
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
			case "open-layers-latest":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProMarker;
				return WPGMZA.OLMarker;
				break;
			case "leaflet":
			case "leaflet-azure":
			case "leaflet-stadia":
			case "leaflet-maptiler":
			case "leaflet-locationiq":
			case "leaflet-zerocost":
				if(WPGMZA.isProVersion())
					return WPGMZA.LeafletProMarker;
				return WPGMZA.LeafletMarker;
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
		
		if(this.map.settings.marker == this.id){
			self.trigger("select");
		}
		
		if(this.infoopen == "1"){
			// Flag a one-shot (one use) call to disable auto-pan controllers in the native engines
			this._osDisableAutoPan = true;

			this.openInfoWindow(true);
		}
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
		
		if(!WPGMZA.legacyGlobals.marker_array[this.map_id])
			WPGMZA.legacyGlobals.marker_array[this.map_id] = [];
		
		WPGMZA.legacyGlobals.marker_array[this.map_id][this.id] = this;
		
		if(!WPGMZA.legacyGlobals.wpgmaps_localize_marker_data[this.map_id])
			WPGMZA.legacyGlobals.wpgmaps_localize_marker_data[this.map_id] = [];
		
		var cloned = $.extend({marker_id: this.id}, row);
		WPGMZA.legacyGlobals.wpgmaps_localize_marker_data[this.map_id][this.id] = cloned;
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
	WPGMZA.Marker.prototype.openInfoWindow = function(autoOpen) {

		if(!this.map) {
			console.warn("Cannot open infowindow for marker with no map");
			return;
		}
		
		// NB: This is a workaround for "undefined" in InfoWindows (basic only) on map edit page
		// removed by Nick 30 Dec 2020
		// 
		//if(WPGMZA.currentPage == "map-edit" && !WPGMZA.pro_version)
		//	return;
		
		if(!autoOpen){
			if(this.map.lastInteractedMarker)
				this.map.lastInteractedMarker.infoWindow.close();
			this.map.lastInteractedMarker = this;
		}
		
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
		if(WPGMZA.settings.wpgmza_settings_map_open_marker_by == WPGMZA.InfoWindow.OPEN_BY_HOVER)
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
		if(latLng instanceof WPGMZA.LatLng){
			this.lat = latLng.lat;
			this.lng = latLng.lng;
		} else {
			this.lat = parseFloat(latLng.lat);
			this.lng = parseFloat(latLng.lng);
		}

		if(this.label)
			this.setLabel(this.label.name);
	}

	/**
	 * Adds, updates or removes this marker's label. The label is rendered by an internally
	 * owned WPGMZA.Pointlabel instance (never saved, never added to the map's pointlabel
	 * collection), so it reuses the exact same Text/Card rendering engine as point labels
	 * instead of duplicating engine-specific DOM/native label code per map provider.
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {string} [label] The label text. Defaults to this.title if omitted. Falsy removes the label.
	 */
	WPGMZA.Marker.prototype.setLabel = function(label)
	{
		if(arguments.length === 0)
			label = this.title;

		if(!label || !this.map)
		{
			if(this.label)
			{
				this.label.map = null;
				this.label = false;
			}

			return;
		}

		var settings = this.map.settings || {};

		/* Per-marker visibility override. marker_label_hidden_by_default is deliberately
		 * phrased so an UNSET value (any map that predates this setting, or simply hasn't
		 * had it touched) reads as "false" - i.e. shown - matching the only behaviour that
		 * existed before this setting was added. Nothing needs to special-case "unset" vs
		 * "explicitly off"; both are just falsy.
		 *
		 * markerLabelVisibilityOverride is a plain boolean meaning "flip from whatever the
		 * map's default currently is" - not "show" or "hide" directly - so the same stored
		 * value keeps working correctly regardless of which way the map-wide default is
		 * set, and the per-marker checkbox's label text (composed client-side in the
		 * marker panel) is the only thing that needs to know which state that resolves to
		 * for display purposes. */
		/* FeaturePanel.serializeFormData() explicitly writes 0 for every unchecked
		 * checkbox on save, for every marker - not just ones a user has actually
		 * touched. After a save+reload round-trip that comes back as the STRING "0"
		 * (form-urlencoded POST data is always strings), and "0" is truthy in JS - so
		 * a plain !!this.markerLabelVisibilityOverride check treats every marker as
		 * having an override, permanently. parseInt() normalises "0"/"1"/0/1/undefined
		 * to the correct boolean regardless of type. */
		var hiddenByDefault = !!parseInt(settings.marker_label_hidden_by_default, 10);
		var hasOverride = !!parseInt(this.markerLabelVisibilityOverride, 10);
		var effectiveVisible = hasOverride ? hiddenByDefault : !hiddenByDefault;

		if(!effectiveVisible)
		{
			if(this.label)
			{
				this.label.map = null;
				this.label = false;
			}

			return;
		}

		var offsetX = parseFloat(settings.marker_label_offset_x) || 0;
		var offsetY = parseFloat(settings.marker_label_offset_y) || 0;

		/* offsetX/offsetY are percentages of the label's OWN rendered width/height, not
		 * pixels - applied as a CSS transform on the rendered label (see Pointlabel/Text/
		 * *TextOverlay setOffset()), not baked into a nudged lat/lng. A lat/lng delta
		 * computed from a pixel offset only holds true at the zoom level it was computed
		 * at (the label would drift away from the marker as soon as the map zoomed), and a
		 * fixed pixel value stops meaning anything useful once the label's content/size
		 * changes (e.g. a longer title). A percentage of the label's own box stays
		 * meaningful either way - "100" always means "shifted by one full label width/
		 * height". The label's real position is always the marker's own position. */
		var position = this.getPosition();
		var style = settings.marker_label_style || "";

		// NB: marker_label_icon is a single global icon (set once in Behaviour settings)
		// shown in every marker's label card, unless this marker sets its own
		// markerLabelIconOverride - not the marker's own pin icon either way.
		var icon;
		if(style === "card")
			icon = this.markerLabelIconOverride || settings.marker_label_icon;

		// "Render above marker icons" rides the same Layer field Point Label/Circle/Rectangle
		// use - layer 1 is enough to clear an un-layered marker icon's default stacking.
		var layergroup = settings.marker_label_above_icons ? 1 : 0;

		if(!this.label)
		{
			this.label = WPGMZA.Pointlabel.createInstance({
				center: position,
				map: this.map,
				name: label,
				subText: this.markerLabelSubText,
				style: style,
				fontSize: settings.marker_label_font_size,
				fillColor: settings.marker_label_font_color,
				lineColor: settings.marker_label_outline_color,
				icon: icon,
				layergroup: layergroup,
				offsetX: offsetX,
				offsetY: offsetY,
				marker: this
			});

			return;
		}

		this.label.name = label;
		this.label.subText = this.markerLabelSubText;
		this.label.style = style;
		this.label.fontSize = settings.marker_label_font_size;
		this.label.fillColor = settings.marker_label_font_color;
		this.label.lineColor = settings.marker_label_outline_color;
		this.label.icon = icon;
		this.label.layergroup = layergroup;
		this.label.offsetX = offsetX;
		this.label.offsetY = offsetY;
		this.label.marker = this;

		this.label.setPosition(position);
		this.label.updateNativeFeature();
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
	WPGMZA.Marker.prototype.getAnimation = function()
	{
		return this.anim;
	}
	
	/**
	 * Sets the animation for this marker (see WPGMZA.Marker ANIMATION_* constants).
	 * @method
	 * @memberof WPGMZA.Marker
	 * @param {int} animation The animation to set.
	 */
	WPGMZA.Marker.prototype.setAnimation = function(animation)
	{
		
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
	 * Overrides Feature.toJSON, serializes the marker to a JSON object
	 * @method
	 * @memberof WPGMZA.Marker
	 * @return {object} A JSON representation of this marker
	 */
	WPGMZA.Marker.prototype.toJSON = function()
	{
		var result = WPGMZA.Feature.prototype.toJSON.call(this);
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