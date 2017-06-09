(function($) {
	/**
	 * Constructor
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
		this.infoWindow = this.createInfoWindowInstance(this);
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	WPGMZA.Marker.prototype.setPosition = function(latLng)
	{
		this.lat = latLng.lat;
		this.lng = latLng.lng;
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
	 * Creates info window for this marker
	 * @return void
	 */
	WPGMZA.Marker.prototype.createInfoWindowInstance = function(mapObject)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProInfoWindow(mapObject);
		
		return new WPGMZA.InfoWindow(mapObject);
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