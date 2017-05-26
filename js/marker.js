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
		
		this.googleMarker = new google.maps.Marker(this.settings);
		this.googleMarker.wpgmzaMarker = this;
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
		
		this.infoWindow = WPGMZA.createInfoWindowInstance(this);
		
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.Marker.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Marker.prototype.constructor = WPGMZA.Marker;
	
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