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

		let self = this;

		let coords = ol.proj.fromLonLat([
				options.position.lng,
				options.position.lat
		]);

		this.olFeature = new ol.Feature({
			geometry: new ol.geom.Point(coords)
		});

		this.styleOptions = (!options) ? {} : options;

		this.layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: [this.olFeature]
			}),
			style : this.getStyle()
		});

		this.layer.setZIndex(10);

		options.map.olMap.addLayer(this.layer);
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

		let labelStyles = new ol.style.Style({
			text: new ol.style.Text({
		    	font: 'bold ' + this.styleOptions.fontSize + 'px "Open Sans", "Arial Unicode MS", "sans-serif"',
		    	placement: 'point',
		    	fill: new ol.style.Fill({
		      		color: this.styleOptions.fillColor,
		    	}),
		    	stroke: new ol.style.Stroke({
		      		color: this.styleOptions.strokeColor,
		      		width: 1
		    	}),
		  	})
		});

		labelStyles.getText().setText(this.styleOptions.text || "");

		return labelStyles;
	}

	WPGMZA.OLTextOverlay.prototype.refresh = function(){
		if(this.layer){
			this.layer.setStyle(this.getStyle());
		}
	}

	WPGMZA.OLTextOverlay.prototype.setPosition = function(position){
		if(this.olFeature){
			let origin = ol.proj.fromLonLat([
				parseFloat(position.lng),
				parseFloat(position.lat)
			]);

			this.olFeature.setGeometry(new ol.geom.Point(origin));
		}
	}

	WPGMZA.OLTextOverlay.prototype.setText = function(text){
		this.styleOptions.text = text;
	}

	WPGMZA.OLTextOverlay.prototype.setFontSize = function(size){
		size = parseInt(size);
		this.styleOptions.fontSize = size;
	}

	WPGMZA.OLTextOverlay.prototype.setFillColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;


		this.styleOptions.fillColor = color;
	}

	WPGMZA.OLTextOverlay.prototype.setLineColor = function(color){
		if(!color.match(/^#/))
			color = "#" + color;

		this.styleOptions.strokeColor = color
	}

	WPGMZA.OLTextOverlay.prototype.setOpacity = function(opacity){
		opacity = parseFloat(opacity);

		if(opacity > 1){
			opacity = 1;
		} else if (opacity < 0){
			opacity = 0;
		}

		if(this.layer){
			this.layer.setOpacity(opacity);
		}
	}

	
	WPGMZA.OLTextOverlay.prototype.remove = function(){
		if(this.styleOptions.map){
			this.styleOptions.map.olMap.removeLayer(this.layer);
		}
	}
	
});