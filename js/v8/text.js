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
				return new WPGMZA.OLText(options);
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

	WPGMZA.Text.prototype.remove = function(){
		if(this.overlay){
			this.overlay.remove();
		}
	}

	WPGMZA.Text.prototype.refresh = function(){
		
	}
	
});