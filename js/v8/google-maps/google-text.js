/**
 * @namespace WPGMZA
 * @module GoogleText
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.GoogleText = function(options)
	{
		WPGMZA.Text.apply(this, arguments);
		
		this.overlay = new WPGMZA.GoogleTextOverlay(options);
	}
	
	WPGMZA.extend(WPGMZA.GoogleText, WPGMZA.Text);

	WPGMZA.GoogleText.prototype.setMap = function(map){
		if(this.overlay){
			if(map && map.googleMap){
				this.overlay.setMap(map.googleMap);
			} else {
				this.overlay.setMap(null);
			}
		}
	}
	
});