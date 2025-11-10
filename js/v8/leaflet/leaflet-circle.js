/**
 * @namespace WPGMZA
 * @module LeafletCircle
 * @requires WPGMZA.Circle
 * @pro-requires WPGMZA.ProCircle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	
	WPGMZA.LeafletCircle = function(options, leafletFeature) {
		Parent.call(this, options, leafletFeature);
		
		if(!options)
			options = {};
		
		if(leafletFeature) {
			let center = leafletFeature.getLatLng();
			options.center = new WPGMZA.LatLng(
				center.lat,
				center.lng
			);
			options.radius = leafletFeature.getRadius() / 1000;
		} 
		
		this.leafletFeature = L.circle({lat : options.center.lat, lng : options.center.lng}, {radius : options.radius ? options.radius * 1000 : 0});

		this.leafletFeature.wpgmzaCircle = this;
		this.leafletFeature.wpgmzaFeature = this;

		this.leafletFeature.on('click', () => {
			this.dispatchEvent({type: "click"});
		});
		
		if(options){
			this.setOptions(options);
        }
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProCircle;
	
	WPGMZA.LeafletCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.LeafletCircle.prototype.constructor = WPGMZA.LeafletCircle;
	
	WPGMZA.LeafletCircle.prototype.getCenter = function() {
		const coordinates = this.leafletFeature.getLatLng();
			
		return new WPGMZA.LatLng({
			lat: coordinates.lat,
			lng: coordinates.lng
		});
	}

	WPGMZA.LeafletCircle.prototype.setVisible = function(visible) {
		if(visible){
			if(this.map && this.map.leafletMap){
				this.leafletFeature.addTo(this.map.leafletMap);
			}
		} else {
			this.leafletFeature.remove();
		}
	}
	
	WPGMZA.LeafletCircle.prototype.setCenter = function(center) {
		WPGMZA.Circle.prototype.setCenter.apply(this, arguments);
		this.leafletFeature.setLatLng({lat : this.center.lat, lng : this.center.lng});
	}
	
	WPGMZA.LeafletCircle.prototype.getRadius = function() {
		let radius = this.leafletFeature.getRadius();
		return radius / 1000; // Meters to kilometers
	}
	
	WPGMZA.LeafletCircle.prototype.setRadius = function(radius) {
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
		this.leafletFeature.setRadius(radius * 1000);
	}
	
	WPGMZA.LeafletCircle.prototype.setOptions = function(options){
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options){
			WPGMZA.LeafletFeature.setEditable(this, options.editable);
		}
	}
});