/**
 * @namespace WPGMZA
 * @module OLText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.OLText = function(options){
		WPGMZA.Text.apply(this, arguments);

		this.overlay = new WPGMZA.OLTextOverlay(options);
	}

	WPGMZA.extend(WPGMZA.OLText, WPGMZA.Text);

	WPGMZA.OLText.prototype.refresh = function(){
		/* Only for OL */
		if(this.overlay){
			this.overlay.refresh();
		}
	}
});