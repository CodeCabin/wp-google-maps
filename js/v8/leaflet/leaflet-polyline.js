/**
 * @namespace WPGMZA
 * @module LeafletPolyline
 * @requires WPGMZA.Polyline
 * @pro-requires WPGMZA.ProPolyline
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.LeafletPolyline = function(options, leafletFeature)
	{
		var self = this;
		
		Parent.call(this, options);
		
		if(leafletFeature) {
            this.leafletFeature = leafletFeature;
		} else {
            let coordinates = [];
			if(options && options.polydata) {
				let paths = this.parseGeometry(options.polydata);
				
				for(let i = 0; i <= paths.length; i++){
                    if(paths[i]){
                        if(!(WPGMZA.isNumeric(paths[i].lat)))
                            throw new Error("Invalid latitude");
                        
                        if(!(WPGMZA.isNumeric(paths[i].lng)))
                            throw new Error("Invalid longitude");

                        coordinates.push(
                            {
                                lat : parseFloat(paths[i % paths.length].lat),
                                lng : parseFloat(paths[i % paths.length].lng)
                            }
                        );
                    }
                    
                }
					
			}
			
            this.leafletFeature = L.polyline(coordinates);
		}
		
        this.leafletFeature.wpgmzaPolyline = this;
        this.leafletFeature.wpgmzaFeature = this;

		this.leafletFeature.on('click', (event) => {
			let coordinates = new WPGMZA.LatLng(event.latlng.lat, event.latlng.lng);
			this.dispatchEvent({type: "click", coordinates : coordinates});
		});
		
		if(options)
			this.setOptions(options);
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolyline;
	else
		Parent = WPGMZA.Polyline;
		
	WPGMZA.LeafletPolyline.prototype = Object.create(Parent.prototype);
	WPGMZA.LeafletPolyline.prototype.constructor = WPGMZA.LeafletPolyline;
	
	WPGMZA.LeafletPolyline.prototype.getGeometry = function() {
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

	WPGMZA.LeafletPolyline.prototype.setVisible = function(visible) {
		if(visible){
			if(this.map && this.map.leafletMap){
				this.leafletFeature.addTo(this.map.leafletMap);
			}
		} else {
			this.leafletFeature.remove();
		}
	}
	
	WPGMZA.LeafletPolyline.prototype.setOptions = function(options) {
		Parent.prototype.setOptions.apply(this, arguments);
		if("editable" in options){
			WPGMZA.LeafletFeature.setEditable(this, options.editable);
		}
	}

	WPGMZA.LeafletPolyline.prototype.setLayergroup = function(layergroup){
    	Parent.prototype.setLayergroup.call(this, layergroup);

    	if(this.layergroup){
            if(this.map){
                const pane = this.map.getLayerGroupPane(`polygon_layer_`, this.layergroup);
                if(pane){
                    this.leafletFeature.remove();
                    this.leafletFeature.options.pane = pane;
                    this.leafletFeature.addTo(this.map.leafletMap);
                }
            }
    	}
	}
});