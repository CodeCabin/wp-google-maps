/**
 * @namespace WPGMZA
 * @module GoogleTextOverlay
 * @requires WPGMZA.GoogleText
 */
jQuery(function($) {
	
	WPGMZA.GoogleTextOverlay = function(options)
	{
		this.element = $("<div class='wpgmza-google-text-overlay'><div class='wpgmza-inner'></div></div>");
		
		if(!options)
			options = {};
		
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

	WPGMZA.GoogleTextOverlay.prototype.setText = function(text){
		this.element.find(".wpgmza-inner").text(text);
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

	WPGMZA.GoogleTextOverlay.prototype.remove = function(){
		if(this.element){
			this.element.remove();
		}
	}
	
});