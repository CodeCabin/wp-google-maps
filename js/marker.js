(function($) {
	/**
	 * Constructor
	 * @param json to load (optional)
	 */
	WPGMZA.Marker = function(row)
	{
		var self = this;
		
		this.lat = "36.778261";
		this.lng = "-119.4179323999";
		this.address = "California";
		
		WPGMZA.MapObject.apply(this, arguments);
		
		this.googleMarker = new google.maps.Marker(this.settings);
		this.googleMarker.wpgmzaMarker = this;
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
		
		this.infoWindow = new WPGMZA.InfoWindow(this);
		
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.Marker.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Marker.prototype.constructor = WPGMZA.Marker;
	
	WPGMZA.Marker.prototype.toJSON = function()
	{
		var result = {
			id:	this.id,
			lat: this.lat,
			lng: this.lng,
			address: this.address,
			settings: this.settings
		};
		
		return result;
	}
	
	
})(jQuery);