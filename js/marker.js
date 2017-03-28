(function($) {
	/**
	 * Constructor
	 * @param json to load (optional)
	 */
	WPGMZA.Marker = function(options)
	{
		var self = this;
		
		this.id = -1;
		this.modified = true;
		this.properties = {
			lat: "36.778261",
			lng: "-119.4179323999"
		};
		
		this.googleMarker = new google.maps.Marker();
		this.googleMarker.wpgmzaMarker = this;
		
		for(var name in options)
			this[name] = options[name];
		
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.Marker.prototype.toJSON = function()
	{
		var result = {};
		
		for(var name in this)
		{
			switch(name)
			{
				case "properties":
				case "marker":
					break;
					
				default:
					result[name] = this[name];
					break;
			}
		}
		
		for(var name in this.properties)
			result[name] = this.properties[name];
		
		return result;
	}
	
	Object.defineProperty(WPGMZA.Marker.prototype, "anim", {
		get: function() {
			return this.properties.anim;
		},
		set: function(value) {
			this.properties.anim = value;
			
			switch(value)
			{
				case 1:
				case "1":
					this.googleMarker.setAnimation(google.maps.Animation.BOUNCE);
					break;
					
				case 2:
				case "2":
					this.googleMarker.setAnimation(google.maps.Animation.DROP);
					break;
				
				default:
					this.googleMarker.setAnimation(null);
					break;
			}
		}
	});
	
	Object.defineProperty(WPGMZA.Marker.prototype, "lat", {
		get: function() {
			return this.properties.lat;
		},
		set: function(value) {
			var position;
			
			this.properties.lat = value;
			position = new google.maps.LatLng(
				this.properties.lat,
				this.properties.lng
			);
			
			this.googleMarker.setPosition(position);
		}
	});
	
	Object.defineProperty(WPGMZA.Marker.prototype, "lng", {
		get: function() {
			return this.properties.lng;
		},
		set: function(value) {
			var position;
			
			this.properties.lng = value;
			position = new google.maps.LatLng(
				this.properties.lat,
				this.properties.lng
			);
			
			this.googleMarker.setPosition(position);
		}
	});
	
	eventDispatcher.apply(WPGMZA.Marker.prototype);
})(jQuery);