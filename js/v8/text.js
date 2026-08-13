/**
 * @namespace WPGMZA
 * @module Text
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.Text = function(options)
	{
		if(options)
			for(var name in options)
				this[name] = options[name];
	}
	
	WPGMZA.Text.createInstance = function(options)
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
			case "open-layers-latest":
				return new WPGMZA.OLText(options);
				break;
			case "leaflet":
			case "leaflet-azure":
			case "leaflet-stadia":
			case "leaflet-maptiler":
			case "leaflet-locationiq":
			case "leaflet-zerocost":
				return new WPGMZA.LeafletText(options);
				break;
				
			default:
				return new WPGMZA.GoogleText(options);
				break;
		}
	}

	WPGMZA.Text.prototype.setPosition = function(position){
		if(this.overlay){
			this.overlay.setPosition(position);
		}
	}

	WPGMZA.Text.prototype.setText = function(text){
		if(this.overlay){
			this.overlay.setText(text);
		}
	}

	/**
	 * Renders a "card" style label instead of plain text - title, optional subheading, optional
	 * icon, styled entirely from the site's Styling (--wpgmza-component-*) CSS vars rather than
	 * fillColor/lineColor, which don't apply to this style
	 *
	 * @param object content {title, subText, icon}
	 *
	 * @return void
	 */
	WPGMZA.Text.prototype.setCardContent = function(content){
		if(this.overlay){
			this.overlay.setCardContent(content);
		}
	}

	WPGMZA.Text.prototype.setFontSize = function(size){
		if(this.overlay){
			this.overlay.setFontSize(size);
		}
	}

	WPGMZA.Text.prototype.setFillColor = function(color){
		if(this.overlay){
			this.overlay.setFillColor(color);
		}
	}

	WPGMZA.Text.prototype.setLineColor = function(color){
		if(this.overlay){
			this.overlay.setLineColor(color);
		}
	}

	WPGMZA.Text.prototype.setOpacity = function(opacity){
		if(this.overlay){
			this.overlay.setOpacity(opacity);
		}
	}

	WPGMZA.Text.prototype.setZIndex = function(zIndex){
		if(this.overlay){
			this.overlay.setZIndex(zIndex);
		}
	}

	WPGMZA.Text.prototype.remove = function(){
		if(this.overlay){
			this.overlay.remove();
		}
	}

	WPGMZA.Text.prototype.refresh = function(){
		
	}

	WPGMZA.Text.prototype.setMap = function(map){
		
	}
	
});