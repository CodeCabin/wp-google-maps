/**
 * @namespace WPGMZA
 * @module OLText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.OLText = function(options){
		WPGMZA.Text.apply(this, arguments);

		this.options = options;
		this.overlay = new WPGMZA.OLTextOverlay(options);
	}

	WPGMZA.extend(WPGMZA.OLText, WPGMZA.Text);

	WPGMZA.OLText.prototype.refresh = function(){
		/* Only for OL */
		if(this.overlay){
			this.overlay.refresh();
		}
	}

	WPGMZA.OLText.prototype.setMap = function(map){
		if(this.overlay){
			if(map && map.olMap){
				if(this.overlay.olMap){
					this.overlay.remove();
					map.olMap.addLayer(this.overlay.layer);
				} else {
					this.options.map = map;
					this.overlay = new WPGMZA.OLTextOverlay(this.options);
				}
			} else {
				this.overlay.remove();
			}
		}
	}
});