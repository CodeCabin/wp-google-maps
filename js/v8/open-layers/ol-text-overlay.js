/**
 * @namespace WPGMZA
 * @module OLTextOverlay
 * @requires WPGMZA.OLText
 */
jQuery(function($) {

	WPGMZA.OLTextOverlay = function(options){
		if(!options.position || !options.map) {
			return;
		}

		this.element = $("<div class='wpgmza-ol-text-overlay-wrapper" + (options.class ? ` ${options.class}` : '') + "'></div>")[0];

		this.styleOptions = (!options) ? {} : options;
		this.map = options.map;

		this.offsetX = parseFloat(options.offsetX) || 0;
		this.offsetY = parseFloat(options.offsetY) || 0;

		/* "top-left" pins the element's own top-left corner at the projected pixel with no
		 * measurement of any kind on OL's part - centering AND the user-configurable offset
		 * are both applied ourselves as a single CSS transform on this.element (see
		 * setOffset()), exactly like GoogleTextOverlay does on .wpgmza-inner. OL's own
		 * "center-center" positioning was tried first, but unlike Leaflet/Google (which
		 * center via a self-referential CSS percentage transform, unaffected by content
		 * size or timing) OL centers via a JS-measured pixel margin - which didn't track
		 * correctly here. Doing it ourselves in pure CSS sidesteps that entirely. */
		this.olOverlay = new ol.Overlay({
			element : this.element,
			position : ol.proj.fromLonLat([options.position.lng, options.position.lat]),
			positioning : "top-left",
			stopEvent : false
		});

		this.applyTransform();

		this.map.olMap.addOverlay(this.olOverlay);

		this.refresh();
	}

	WPGMZA.OLTextOverlay.prototype.getStyle = function(){
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

	WPGMZA.OLTextOverlay.prototype.refresh = function(){
		if(!this.styleOptions){ return; }
		this.setText(this.styleOptions.text);
	}

	/**
	 * Applies centering plus the user-configurable offset as ONE CSS transform on
	 * this.element itself - translate(-50%,-50%) centers the element on the point (a
	 * self-referential percentage, always correct regardless of the element's actual
	 * rendered size, with no measurement needed), composed with a further translate(X%,Y%)
	 * for the offset, which is a percentage of that same box - so "100%" always means
	 * "shifted by one full label width/height", however long the title/subheading gets.
	 * Not a pixel offset baked into a nudged lat/lng either - that only holds true at the
	 * zoom level it was computed at, and would drift away from whatever this label is
	 * meant to stay anchored next to (e.g. its owning marker) as soon as the map zoomed.
	 *
	 * @return void
	 */
	WPGMZA.OLTextOverlay.prototype.applyTransform = function(){
		if(this.element){
			$(this.element).css('transform', 'translate(-50%, -50%) translate(' + (this.offsetX || 0) + '%, ' + (this.offsetY || 0) + '%)');
		}
	}

	/**
	 * @param number x
	 * @param number y
	 *
	 * @return void
	 */
	WPGMZA.OLTextOverlay.prototype.setOffset = function(x, y){
		this.offsetX = parseFloat(x) || 0;
		this.offsetY = parseFloat(y) || 0;

		this.applyTransform();
	}

	/**
	 * Stores the owning marker (only ever set for a marker-owned label, never a standalone
	 * Point Label) and (re)applies click-to-select behaviour, gated behind the
	 * marker_label_click_opens_infowindow map setting. Bound directly on this.element,
	 * which OL never recreates itself. pointer-events is overridden here too, since the
	 * wrapper is pointer-events:none by default (see open-layers.css) so clicks reach the
	 * map underneath when this is off.
	 *
	 * A real marker click dispatches a "select" event on the WPGMZA.Marker instance itself
	 * (see WPGMZA.Marker.prototype.onSelect), which is what actually opens the info
	 * window, so this reuses that same path rather than reimplementing it.
	 *
	 * @param WPGMZA.Marker|undefined marker
	 *
	 * @return void
	 */
	WPGMZA.OLTextOverlay.prototype.setMarker = function(marker){
		this.marker = marker;

		if(!this.element){ return; }

		var self = this;
		var clickable = !!(this.marker && this.marker.map && this.marker.map.settings && this.marker.map.settings.marker_label_click_opens_infowindow);

		$(this.element).css('pointer-events', clickable ? 'auto' : '');
		$(this.element).off('click.wpgmzaLabelSelect');

		if(clickable){
			$(this.element).on('click.wpgmzaLabelSelect', function(event){
				event.stopPropagation();
				self.marker.dispatchEvent("select");
			});
		}
	}

	WPGMZA.OLTextOverlay.prototype.setPosition = function(position){
		if(this.olOverlay){
			this.olOverlay.setPosition(ol.proj.fromLonLat([
				parseFloat(position.lng),
				parseFloat(position.lat)
			]));
		}
	}

	WPGMZA.OLTextOverlay.prototype.setText = function(text){
		if(!this.styleOptions){ return; }

		if(text){
        	this.styleOptions.text = text;
		}

		if(this.element){
			$(this.element).html(`<div class='wpgmza-ol-text-overlay' style='${this.getStyle()}'>${this.styleOptions.text || ''}</div>`);
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
	WPGMZA.OLTextOverlay.prototype.getCardElement = function(){
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

	WPGMZA.OLTextOverlay.prototype.setCardContent = function(content){
		if(!this.styleOptions){ return; }

		this.cardContent = content || {};

		if(this.element){
			$(this.element).empty().append(this.getCardElement());
		}
	}

	WPGMZA.OLTextOverlay.prototype.setFontSize = function(size){
		if(!this.styleOptions){ return; }

		size = parseInt(size);
		this.styleOptions.fontSize = size;
	}

	WPGMZA.OLTextOverlay.prototype.setFillColor = function(color){
		if(!this.styleOptions){ return; }

		if(!color.match(/^#/))
			color = "#" + color;


		this.styleOptions.fillColor = color;
	}

	WPGMZA.OLTextOverlay.prototype.setLineColor = function(color){
		if(!this.styleOptions){ return; }

		if(!color.match(/^#/))
			color = "#" + color;

		this.styleOptions.strokeColor = color
	}

	WPGMZA.OLTextOverlay.prototype.setOpacity = function(opacity){
		if(!this.styleOptions){ return; }

		opacity = parseFloat(opacity);

		if(opacity > 1){
			opacity = 1;
		} else if (opacity < 0){
			opacity = 0;
		}

        this.styleOptions.opacity = opacity;
	}

	WPGMZA.OLTextOverlay.prototype.setZIndex = function(zIndex){
		if(this.element){
			$(this.element).css('z-index', zIndex);
		}
	}


	WPGMZA.OLTextOverlay.prototype.remove = function(){
		if(this.olOverlay && this.map && this.map.olMap){
        	this.map.olMap.removeOverlay(this.olOverlay);
		}
	}

});
