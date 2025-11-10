/**
 * @namespace WPGMZA
 * @module LeafletRectangle
 * @requires WPGMZA.Rectangle
 * @pro-requires WPGMZA.ProRectangle
 */
jQuery(function($) {
	var Parent = WPGMZA.Rectangle;
	
	WPGMZA.LeafletRectangle = function(options, leafletFeature) {
		var self = this;
		
		Parent.apply(this, arguments);
		
		if(leafletFeature) {
			this.leafletFeature = leafletFeature;
		} else {
			var coordinates = [];
			
			if(options.cornerA && options.cornerB) {
				coordinates.push({
                    lat : parseFloat(options.cornerA.lat),
                    lng : parseFloat(options.cornerA.lng)
                });

                coordinates.push({
                    lat : parseFloat(options.cornerB.lat),
                    lng : parseFloat(options.cornerB.lng)
                });
			}
			
			this.leafletFeature = L.rectangle(coordinates);
		}
		
		this.leafletFeature.wpgmzaRectangle = this;
		this.leafletFeature.wpgmzaFeature = this;

		this.leafletFeature.on('click', () => {
			this.dispatchEvent({type: "click"});
		});
		
		if(options){
			this.setOptions(options);
        }
	}
	

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProRectangle;
	
	WPGMZA.extend(WPGMZA.LeafletRectangle, Parent);
	
	// NB: Would be nice to move this onto OLFeature
	WPGMZA.LeafletRectangle.prototype.getBounds = function() {
        const bounds = this.leafletFeature.getBounds();

		let topLeft				= bounds.getNorthWest();
		let bottomRight			= bounds.getSouthEast();
		
		return new WPGMZA.LatLngBounds(
			new WPGMZA.LatLng(topLeft.lat, topLeft.lng),
			new WPGMZA.LatLng(bottomRight.lat, bottomRight.lng)
		);
	}

	WPGMZA.LeafletRectangle.prototype.setBounds = function(cornerA, cornerB){
		if(this.leafletFeature){
			this.cornerA = cornerA;
			this.cornerB = cornerB;

			let coordinates = [];
			if(this.cornerA  && this.cornerB) {
				coordinates.push({
                    lat : parseFloat(this.cornerA.lat),
                    lng : parseFloat(this.cornerA.lng)
                });

                coordinates.push({
                    lat : parseFloat(this.cornerB.lat),
                    lng : parseFloat(this.cornerB.lng)
                });

				this.leafletFeature.setBounds(coordinates);

				this.trigger('change');
			}
		}
	}

	WPGMZA.LeafletRectangle.prototype.setVisible = function(visible) {
		if(visible){
			if(this.map && this.map.leafletMap){
				this.leafletFeature.addTo(this.map.leafletMap);
			}
		} else {
			this.leafletFeature.remove();
		}
	}
	
	WPGMZA.LeafletRectangle.prototype.setOptions = function(options) {
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options){
			WPGMZA.LeafletFeature.setEditable(this, options.editable);
		}
	}
	
});