/**
 * @namespace WPGMZA
 * @module GoogleText
 * @requires WPGMZA.Text
 * @gulp-requires ../text.js
 */
jQuery(function($) {
	
	WPGMZA.GoogleText = function(options)
	{
		WPGMZA.Text.apply(this, arguments);
		
		this.overlay = new WPGMZA.GoogleTextOverlay(options);
	}
	
	WPGMZA.extend(WPGMZA.GoogleText, WPGMZA.Text);
	
});