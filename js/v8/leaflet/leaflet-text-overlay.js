/**
 * @namespace WPGMZA
 * @module LeafletTextOverlay
 * @requires WPGMZA.LeafletText
 */
jQuery(function($) {
	
	WPGMZA.LeafletTextOverlay = function(options){
		if(!options.position || !options.map) {
			return;
		}

		this.leafletFeature = L.marker(L.latLng({lat : options.position.lat, lng : options.position.lng}), {
			icon : L.divIcon({
				className : 'wpgmza-leaflet-text-overlay-wrapper' + (options.class ? ` ${options.class}` : ''),
				html : '',
				iconSize : [0, 0],
				iconAnchor : [0, 0]
			}),
			pane : options.map.getLayerGroupPane('text_layer_', 0, 'markerPane')
		});

		this.styleOptions = (!options) ? {} : options;
		
		this.leafletFeature.on('add', () => {
			this.refresh();
		});

		this.leafletFeature.addTo(options.map.leafletMap);
	}

	WPGMZA.LeafletTextOverlay.prototype.getStyle = function(){
		let defaults = {
			fontSize : 11,
			fillColor : "#000000",
			strokeColor : "#ffffff"
		};

		for(let i in defaults){
			if(typeof this.styleOptions[i] === 'undefined'){
				this.styleOptions[i] = defaults[i]
			}
		}

        let labelStyles = [];
        labelStyles.push("width: fit-content");
        labelStyles.push("font: bold " + this.styleOptions.fontSize + "px \"Open Sans\", \"Arial Unicode MS\", \"sans-serif\"");
        labelStyles.push("color: " + this.styleOptions.fillColor);
        labelStyles.push("z-index: 10");
        labelStyles.push("text-shadow: -1px -1px 0 " + this.styleOptions.strokeColor + ", 1px -1px 0 " + this.styleOptions.strokeColor + ", -1px 1px 0 " + this.styleOptions.strokeColor + ", 1px 1px 0 " + this.styleOptions.strokeColor);

        if(this.styleOptions.opacity){
            labelStyles.push("opacity: " + this.styleOptions.opacity);
        }

		return labelStyles.join('; ');
	}

	WPGMZA.LeafletTextOverlay.prototype.refresh = function(){
		this.setText(this.styleOptions.text);
	}

	WPGMZA.LeafletTextOverlay.prototype.setPosition = function(position){
		if(this.leafletFeature){
			this.leafletFeature.setLatLng({lat : position.lat, lng : position.lng});
		}
	}

	WPGMZA.LeafletTextOverlay.prototype.setText = function(text){
		if(text){
        	this.styleOptions.text = text;
		}

		if(this.leafletFeature){
			let nativeElement = this.leafletFeature.getElement();
			$(nativeElement).html(`<div class='wpgmza-leaflet-text-overlay' style='${this.getStyle()}'>${this.styleOptions.text || ''}</div>`);
        }
	}

	WPGMZA.LeafletTextOverlay.prototype.setFontSize = function(size){
		size = parseInt(size);
		this.styleOptions.fontSize = size;
	}

	WPGMZA.LeafletTextOverlay.prototype.setFillColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;


		this.styleOptions.fillColor = color;
	}

	WPGMZA.LeafletTextOverlay.prototype.setLineColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;

		this.styleOptions.strokeColor = color
	}

	WPGMZA.LeafletTextOverlay.prototype.setOpacity = function(opacity){
		opacity = parseFloat(opacity);

		if(opacity > 1){
			opacity = 1;
		} else if (opacity < 0){
			opacity = 0;
		}

        this.styleOptions.opacity = opacity;
	}

	
	WPGMZA.LeafletTextOverlay.prototype.remove = function(){
        this.leafletFeature.remove();
	}
	
});