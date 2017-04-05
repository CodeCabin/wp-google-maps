(function($) {
	/**
	 * Constructor
	 * @param json to load (optional)
	 */
	WPGMZA.Marker = function(row)
	{
		var self = this;
		
		this.id = -1;
		this.modified = false;
		this.lat = "36.778261";
		this.lng = "-119.4179323999";
		this.address = "California";
		this.settings = {};
		
		if(row)
		{
			for(var name in row)
				this[name] = row[name];
		}
		
		this.googleMarker = new google.maps.Marker(this.settings);
		this.googleMarker.wpgmzaMarker = this;
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
		
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
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
	
	eventDispatcher.apply(WPGMZA.Marker.prototype);
})(jQuery);