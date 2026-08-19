/**
 * @namespace WPGMZA
 * @module GoogleTextOverlay
 * @requires WPGMZA.GoogleText
 */
jQuery(function($) {
	
	WPGMZA.GoogleTextOverlay = function(options)
	{
		if(!options)
			options = {};

		this.element = $("<div class='wpgmza-google-text-overlay" + (options.class ? ` ${options.class}` : '') + "'><div class='wpgmza-inner'></div></div>");

		this.offsetX = parseFloat(options.offsetX) || 0;
		this.offsetY = parseFloat(options.offsetY) || 0;

		if(options.position)
			this.position = options.position;
		
		if(options.text)
			this.element.find(".wpgmza-inner").text(options.text);
		
		if(options.map)
			this.setMap(options.map.googleMap);
	}
	
	if(window.google && google.maps && google.maps.OverlayView)
		WPGMZA.GoogleTextOverlay.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleTextOverlay.prototype.onAdd = function()
	{
		var overlayProjection = this.getProjection();
		var position = overlayProjection.fromLatLngToDivPixel(this.position.toGoogleLatLng());
		
		this.element.css({
			position: "absolute",
			left: position.x + "px",
			top: position.y + "px",
			minWidth : "200px"
		});

		var panes = this.getPanes();
		panes.floatPane.appendChild(this.element[0]);
	}
	
	WPGMZA.GoogleTextOverlay.prototype.draw = function()
	{
		var overlayProjection = this.getProjection();
		var position = overlayProjection.fromLatLngToDivPixel(this.position.toGoogleLatLng());
		
		this.element.css({
			position: "absolute",
			left: position.x + "px",
			top: position.y + "px",
			minWidth : "200px"
		});
	}
	
	WPGMZA.GoogleTextOverlay.prototype.onRemove = function()
	{
		this.element.remove();
	}
	
	WPGMZA.GoogleTextOverlay.prototype.hide = function()
	{
		this.element.hide();
	}
	
	WPGMZA.GoogleTextOverlay.prototype.show = function()
	{
		this.element.show();
	}
	
	WPGMZA.GoogleTextOverlay.prototype.toggle = function()
	{
		if(this.element.is(":visible"))
			this.element.hide();
		else
			this.element.show();
	}

	WPGMZA.GoogleTextOverlay.prototype.setPosition = function(position){
		this.position = position;
	}

	/**
	 * Applies the offset as a percentage of the label's OWN rendered width/height, via a
	 * transform composed with the existing centering transform on .wpgmza-inner (see
	 * common.css) - not a pixel offset baked into a nudged lat/lng (drifts at other zoom
	 * levels) and not a fixed pixel value (meaningless once content/box size changes,
	 * e.g. a longer title). CSS percentage translate() is always relative to the element's
	 * own box, so this stays correct regardless of zoom or content width with no
	 * measurement needed - "100%" always means "shifted by one full box width/height".
	 *
	 * @param number x
	 * @param number y
	 *
	 * @return void
	 */
	WPGMZA.GoogleTextOverlay.prototype.setOffset = function(x, y){
		this.offsetX = parseFloat(x) || 0;
		this.offsetY = parseFloat(y) || 0;

		this.element.find(".wpgmza-inner").css('transform', 'translate(-50%, -50%) translate(' + this.offsetX + '%, ' + this.offsetY + '%)');
	}

	/**
	 * Stores the owning marker (only ever set for a marker-owned label, never a standalone
	 * Point Label) and (re)applies click-to-select behaviour, gated behind the
	 * marker_label_click_opens_infowindow map setting. Bound directly on the outer
	 * (stable) element - a real marker click dispatches a "select" event on the
	 * WPGMZA.Marker instance itself (see WPGMZA.Marker.prototype.onSelect), which is what
	 * actually opens the info window, so this reuses that same path rather than
	 * reimplementing it.
	 *
	 * @param WPGMZA.Marker|undefined marker
	 *
	 * @return void
	 */
	WPGMZA.GoogleTextOverlay.prototype.setMarker = function(marker){
		this.marker = marker;

		var self = this;
		var clickable = !!(this.marker && this.marker.map && this.marker.map.settings && this.marker.map.settings.marker_label_click_opens_infowindow);

		this.element.css('pointer-events', clickable ? 'auto' : '');
		this.element.off('click.wpgmzaLabelSelect');

		if(clickable){
			this.element.on('click.wpgmzaLabelSelect', function(event){
				event.stopPropagation();
				self.marker.dispatchEvent("select");
			});
		}
	}

	WPGMZA.GoogleTextOverlay.prototype.setText = function(text){
		this.element.find(".wpgmza-inner").text(text);
	}

	/**
	 * Builds the card element - title, optional subheading, optional icon. Colors/background/border/
	 * font size come entirely from the --wpgmza-component-* CSS vars (see components.css), not
	 * fillColor/lineColor/fontSize - those fields are hidden in the editor for card style. Note the
	 * card's own font-size rule would win over an inherited .wpgmza-inner value either way, since a
	 * direct rule always beats an inherited one - opacity still applies via that same inheritance
	 * since nothing here overrides it
	 *
	 * @return jQuery
	 */
	WPGMZA.GoogleTextOverlay.prototype.getCardElement = function(){
		const content = this.cardContent || {};
		const card = $("<div class='wpgmza-text-overlay-card'></div>");

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

	WPGMZA.GoogleTextOverlay.prototype.setCardContent = function(content){
		this.cardContent = content || {};
		this.element.find(".wpgmza-inner").empty().append(this.getCardElement());
	}

	WPGMZA.GoogleTextOverlay.prototype.setFontSize = function(size){
		size = parseInt(size);
		this.element.find(".wpgmza-inner").css('font-size', size + 'px');
	}

	WPGMZA.GoogleTextOverlay.prototype.setFillColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;

		this.element.find(".wpgmza-inner").css('color', color);
	}

	WPGMZA.GoogleTextOverlay.prototype.setLineColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;

		this.element.find(".wpgmza-inner").css('--wpgmza-color-white', color);
	}

	WPGMZA.GoogleTextOverlay.prototype.setOpacity = function(opacity){
		opacity = parseFloat(opacity);

		if(opacity > 1){
			opacity = 1;
		} else if (opacity < 0){
			opacity = 0;
		}

		this.element.find(".wpgmza-inner").css('opacity', opacity);
	}

	WPGMZA.GoogleTextOverlay.prototype.setZIndex = function(zIndex){
		this.element.css('z-index', zIndex);
	}

	WPGMZA.GoogleTextOverlay.prototype.remove = function(){
		if(this.element){
			this.element.remove();
		}
	}
	
});