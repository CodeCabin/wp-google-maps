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

		this.olOverlay = new ol.Overlay({
			element : this.element,
			position : ol.proj.fromLonLat([options.position.lng, options.position.lat]),
			positioning : "center-center",
			stopEvent : false
		});

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
