/**
 * @namespace WPGMZA
 * @module LeafletPolygon
 * @requires WPGMZA.Polygon
 * @pro-requires WPGMZA.ProPolygon
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.LeafletPolygon = function(options, leafletFeature) {
		var self = this;
		
		Parent.call(this, options, leafletFeature);
		
		if(leafletFeature) {
			this.leafletFeature = leafletFeature;
		} else {
			let coordinates = [];
			
			if(options && options.polydata) {
				let paths = this.parseGeometry(options.polydata);
				
				for(let i = 0; i <= paths.length; i++){
                    coordinates.push(
                        {
                            lat : parseFloat(paths[i % paths.length].lat),
                            lng : parseFloat(paths[i % paths.length].lng)
					    }
                    );
                }
					
			}
			
			this.leafletFeature = L.polygon(coordinates);
		}
		
        this.leafletFeature.wpgmzaPolygon = this;
        this.leafletFeature.wpgmzaFeature = this;

		this.leafletFeature.on('click', () => {
			this.dispatchEvent({type: "click"});
		});
		
		if(options){
			this.setOptions(options);
        }
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolygon;
	else
		Parent = WPGMZA.Polygon;
	
	WPGMZA.LeafletPolygon.prototype = Object.create(Parent.prototype);
	WPGMZA.LeafletPolygon.prototype.constructor = WPGMZA.LeafletPolygon;
	
	WPGMZA.LeafletPolygon.prototype.getGeometry = function() {
        let coordinates = this.leafletFeature.getLatLngs();
		let result = [];
		for(let i = 0; i < coordinates.length; i++) {
			let point = coordinates[i];
			if(point instanceof Array){
				for(let subI = 0; subI < point.length; subI ++){
					let subPoint = point[subI];
					if(subPoint.lat && subPoint.lng){
						result.push({
							lat : subPoint.lat,
							lng : subPoint.lng
						});
					}
				}
			} else {
				if(point.lat && point.lng){
					result.push({
						lat : point.lat,
						lng : point.lng
					});
				}
			}
		}
		
		return result;
	}

	WPGMZA.LeafletPolygon.prototype.setVisible = function(visible) {
		if(visible){
			if(this.map && this.map.leafletMap){
				this.leafletFeature.addTo(this.map.leafletMap);
			}
		} else {
			this.leafletFeature.remove();
		}
	}
	
	WPGMZA.LeafletPolygon.prototype.setOptions = function(options){
		Parent.prototype.setOptions.apply(this, arguments);
		
		if("editable" in options){
			WPGMZA.LeafletFeature.setEditable(this, options.editable);
		}
	}
	
});