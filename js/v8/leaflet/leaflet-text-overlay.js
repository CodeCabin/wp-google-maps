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
		this.map = options.map;

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
		if(!this.styleOptions){ return; }
		this.setText(this.styleOptions.text);
	}

	WPGMZA.LeafletTextOverlay.prototype.setPosition = function(position){
		if(this.leafletFeature){
			this.leafletFeature.setLatLng({lat : position.lat, lng : position.lng});
		}
	}

	WPGMZA.LeafletTextOverlay.prototype.setText = function(text){
		if(!this.styleOptions){ return; }

		if(text){
        	this.styleOptions.text = text;
		}

		if(this.leafletFeature){
			let nativeElement = this.leafletFeature.getElement();
			$(nativeElement).html(`<div class='wpgmza-leaflet-text-overlay' style='${this.getStyle()}'>${this.styleOptions.text || ''}</div>`);
        }
	}

	/**
	 * Builds the card element - title, optional subheading, optional icon. Colors/background/border/
	 * font size come entirely from the --wpgmza-component-* CSS vars (see components.css), not
	 * fillColor/lineColor/fontSize - those fields are hidden in the editor for card style. Opacity
	 * still applies since that remains relevant either way
	 *
	 * @return jQuery
	 */
	WPGMZA.LeafletTextOverlay.prototype.getCardElement = function(){
		const content = this.cardContent || {};
		const card = $("<div class='wpgmza-text-overlay-card'></div>");

		if(typeof this.styleOptions.opacity !== 'undefined'){
			card.css('opacity', this.styleOptions.opacity);
		}

		if(content.icon){
			card.append($("<img class='wpgmza-text-overlay-card-icon'/>").attr('src', content.icon));
		}

		const textWrapper = $("<div class='wpgmza-text-overlay-card-content'></div>");
		textWrapper.append($("<div class='wpgmza-text-overlay-card-title'></div>").text(content.title || ''));

		if(content.subText){
			textWrapper.append($("<div class='wpgmza-text-overlay-card-subtext'></div>").text(content.subText));
		}

		card.append(textWrapper);

		return card;
	}

	WPGMZA.LeafletTextOverlay.prototype.setCardContent = function(content){
		if(!this.styleOptions){ return; }

		this.cardContent = content || {};

		if(this.leafletFeature){
			const nativeElement = this.leafletFeature.getElement();
			$(nativeElement).empty().append(this.getCardElement());
		}
	}

	WPGMZA.LeafletTextOverlay.prototype.setFontSize = function(size){
		if(!this.styleOptions){ return; }

		size = parseInt(size);
		this.styleOptions.fontSize = size;
	}

	WPGMZA.LeafletTextOverlay.prototype.setFillColor = function(color){
		if(!this.styleOptions){ return; }

		if(!color.match(/^#/))
			color = "#" + color;


		this.styleOptions.fillColor = color;
	}

	WPGMZA.LeafletTextOverlay.prototype.setLineColor = function(color){
		if(!this.styleOptions){ return; }

		if(!color.match(/^#/))
			color = "#" + color;

		this.styleOptions.strokeColor = color
	}

	WPGMZA.LeafletTextOverlay.prototype.setOpacity = function(opacity){
		if(!this.styleOptions){ return; }

		opacity = parseFloat(opacity);

		if(opacity > 1){
			opacity = 1;
		} else if (opacity < 0){
			opacity = 0;
		}

        this.styleOptions.opacity = opacity;
	}

	/**
	 * Leaflet doesn't respect inline z-index within a shared pane the way Google/OL overlays
	 * do, so layering re-parents into a dedicated numbered pane instead - same technique
	 * WPGMZA.LeafletPolyline.setLayergroup already uses for shapes. Removing/re-adding the
	 * marker regenerates its element, but the 'add' listener in the constructor already
	 * re-runs refresh() (and the caller re-applies card content afterwards), so content isn't lost.
	 */
	WPGMZA.LeafletTextOverlay.prototype.setZIndex = function(zIndex){
		if(!this.map || !this.leafletFeature){ return; }

		var pane = this.map.getLayerGroupPane('text_layer_', zIndex, 'markerPane');
		if(!pane || this.leafletFeature.options.pane === pane){ return; }

		this.leafletFeature.remove();
		this.leafletFeature.options.pane = pane;
		this.leafletFeature.addTo(this.map.leafletMap);
	}


	WPGMZA.LeafletTextOverlay.prototype.remove = function(){
		if(this.leafletFeature){
        	this.leafletFeature.remove();
		}
	}
	
});