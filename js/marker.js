(function($) {
	/**
	 * Constructor
	 * IMPORTANT: Please note that heatmap markers and the right click marker are special cases.
	 * @param json to load (optional)
	 */
	WPGMZA.Marker = function(row)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.lat = "36.778261";
		this.lng = "-119.4179323999";
		this.address = "California";
		this.title = null;
		this.description = "";
		this.link = "";
		this.icon = "";
		this.approved = 1;
		this.pic = null;
		
		WPGMZA.MapObject.apply(this, arguments);
		
		if(row && row.heatmap)
			return; // Don't listen for these events on heatmap markers.
		
		this.addEventListener("added", function(event) {
			self.onAdded(event);
		});
	}
	
	WPGMZA.Marker.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Marker.prototype.constructor = WPGMZA.Marker;
	
	WPGMZA.Marker.ANIMATION_NONE			= "0";
	WPGMZA.Marker.ANIMATION_BOUNCE			= "1";
	WPGMZA.Marker.ANIMATION_DROP			= "2";
	
	WPGMZA.Marker.prototype.onAdded = function(event)
	{
		var self = this;
		
		this.infoWindow = WPGMZA.InfoWindow.createInstance(this);
		
		this.addEventListener("click", function(event) {
			self.onClick(event);
		});
		
		this.addEventListener("mouseover", function(event) {
			self.onMouseOver(event);
		});
		
		if(this.map.settings.enable_marker_labels)
			this.addLabel();
	}
	
	/**
	 * This function will hide the last info the user interacted with
	 * @return void
	 */
	WPGMZA.Marker.prototype.hidePreviousInteractedInfoWindow = function()
	{
		if(!this.map.lastInteractedMarker)
			return;
		
		this.map.lastInteractedMarker.infoWindow.close();
	}
	
	WPGMZA.Marker.prototype.onClick = function(event)
	{
		if(this.map.settings.info_window_open_by == WPGMZA.InfoWindow.OPEN_BY_CLICK)
		{
			this.hidePreviousInteractedInfoWindow();
			this.infoWindow.open();
			this.map.lastInteractedMarker = this;
		}
	}
	
	WPGMZA.Marker.prototype.onMouseOver = function(event)
	{
		if(this.map.settings.info_window_open_by == WPGMZA.InfoWindow.OPEN_BY_HOVER)
		{
			this.hidePreviousInteractedInfoWindow();
			this.infoWindow.open();
			this.map.lastInteractedMarker = this;
		}
	}
	
	WPGMZA.Marker.prototype.getIcon = function()
	{
		return WPGMZA.settings.default_marker_icon;
	}
	
	/**
	 * Gets the position of the marker
	 * @return object
	 */
	WPGMZA.Marker.prototype.getPosition = function()
	{
		return {
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		};
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	WPGMZA.Marker.prototype.setPosition = function(latLng)
	{
		this.lat = parseFloat(latLng.lat);
		this.lng = parseFloat(latLng.lng);
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.Marker.prototype.getAnimation = function(animation)
	{
		return this.settings.animation;
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.Marker.prototype.setAnimation = function(animation)
	{
		this.settings.animation = animation;
	}
	
	/**
	 * Get the marker visibility
	 * @return void
	 */
	WPGMZA.Marker.prototype.getVisible = function(visible)
	{
		
	}
	
	/**
	 * Set the marker visibility. This is used by the store locator etc. and is not a setting
	 * @return void
	 */
	WPGMZA.Marker.prototype.setVisible = function(visible)
	{
		
	}
	
	/**
	 * Gets the label text for this marker
	 * @return void
	 */
	WPGMZA.Marker.prototype.getLabelText = function()
	{
		var chars = this.map.settings.marker_label_characters;
		var count = chars.length;
		var index;
		
		if(this.id > -1)
			index = this.map.markerLabelOrder.indexOf(parseInt(this.id));
		else
			index = this.map.markers.length;
		
		return chars[index % count];
	}
	
	/**
	 * Returns the marker as a JSON object
	 * @return object
	 */
	WPGMZA.Marker.prototype.toJSON = function()
	{
		var result = {
			id:	this.id,
			lat: this.lat,
			lng: this.lng,
			address: this.address,
			title: this.title,
			description: this.description,
			link: this.link,
			icon: this.icon,
			pic: this.pic,
			approved: this.approved,
			settings: this.settings
		};
		
		return result;
	}
	
	
})(jQuery);