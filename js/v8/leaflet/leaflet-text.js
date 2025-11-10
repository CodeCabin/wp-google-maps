/**
 * @namespace WPGMZA
 * @module LeafletText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.LeafletText = function(options){
		WPGMZA.Text.apply(this, arguments);

		this.overlay = new WPGMZA.LeafletTextOverlay(options);
	}

	WPGMZA.extend(WPGMZA.LeafletText, WPGMZA.Text);

	WPGMZA.LeafletText.prototype.refresh = function(){
		/* Only for OL */
		if(this.overlay){
			this.overlay.refresh();
		}
	}
});