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
			$(nativeElement).html(`<div style='display: inline-block; transform: translate(-50%, -50%) translate(${this.offsetX || 0}%, ${this.offsetY || 0}%)'><div class='wpgmza-leaflet-text-overlay' style='${this.getStyle()}'>${this.styleOptions.text || ''}</div></div>`);
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
			const offsetWrapper = $(`<div style='display: inline-block; transform: translate(-50%, -50%) translate(${this.offsetX || 0}%, ${this.offsetY || 0}%)'></div>`);
			offsetWrapper.append(this.getCardElement());
			$(nativeElement).empty().append(offsetWrapper);
		}
	}

	/**
	 * Applies centering plus the user-configurable offset as ONE composed CSS transform
	 * (translate(-50%,-50%) translate(X%,Y%)) on an extra wrapper div, both as percentages
	 * of the label's OWN rendered width/height - not pixels baked into a nudged lat/lng
	 * (drifts at other zoom levels) and not a fixed pixel value (meaningless once content/
	 * box size changes, e.g. a longer title). CSS percentage translate() is always relative
	 * to the element's own box, and the wrapper is sized to shrink-wrap its content
	 * (display:inline-block) so that box IS the card/text's actual rendered size - "100%"
	 * always means "shifted by one full box width/height", with no measurement needed. The
	 * wrapper sits between Leaflet's own positioned element (which this must not interfere
	 * with - Leaflet moves it via its own transform) and the plain text/card content, which
	 * no longer carry any centering of their own (that used to live in a CSS rule scoped to
	 * plain-text labels only, which is why Card mode never centered - see leaflet.css).
	 *
	 * @param number x
	 * @param number y
	 *
	 * @return void
	 */
	WPGMZA.LeafletTextOverlay.prototype.setOffset = function(x, y){
		this.offsetX = parseFloat(x) || 0;
		this.offsetY = parseFloat(y) || 0;

		if(this.cardContent){
			this.setCardContent(this.cardContent);
		} else if(this.styleOptions){
			this.setText(this.styleOptions.text);
		}
	}

	/**
	 * Stores the owning marker (only ever set for a marker-owned label, never a standalone
	 * Point Label) and (re)applies click-to-select behaviour, gated behind the
	 * marker_label_click_opens_infowindow map setting. Bound directly on the divIcon's own
	 * element (stable across setText()/setCardContent() rebuilding its inner HTML), rather
	 * than any inner child - re-adding via setZIndex()'s pane change creates a fresh
	 * element, but the caller always re-applies content afterwards (same pattern the class
	 * comment on setZIndex already documents), which is also where this gets re-bound.
	 * pointer-events is overridden here too, since the wrapper is pointer-events:none by
	 * default (see leaflet.css) so clicks reach the map underneath when this is off.
	 *
	 * A real marker click dispatches a "select" event on the WPGMZA.Marker instance itself
	 * (see WPGMZA.Marker.prototype.onSelect), which is what actually opens the info
	 * window, so this reuses that same path rather than reimplementing it.
	 *
	 * @param WPGMZA.Marker|undefined marker
	 *
	 * @return void
	 */
	WPGMZA.LeafletTextOverlay.prototype.setMarker = function(marker){
		this.marker = marker;

		if(!this.leafletFeature){ return; }

		var self = this;
		var nativeElement = this.leafletFeature.getElement();
		if(!nativeElement){ return; }

		var clickable = !!(this.marker && this.marker.map && this.marker.map.settings && this.marker.map.settings.marker_label_click_opens_infowindow);

		$(nativeElement).css('pointer-events', clickable ? 'auto' : '');
		$(nativeElement).off('click.wpgmzaLabelSelect');

		if(clickable){
			$(nativeElement).on('click.wpgmzaLabelSelect', function(event){
				event.stopPropagation();
				self.marker.dispatchEvent("select");
			});
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