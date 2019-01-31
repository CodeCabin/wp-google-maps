/**
 * @namespace WPGMZA
 * @module GoogleTextOverlay
 * @requires WPGMZA.Text
 */
jQuery(function($) {
	
	WPGMZA.GoogleTextOverlay = function()
	{
		this.element = $("<div></div>");
		
	}
	
	if(window.google && google.maps && google.maps.OverlayView)
		WPGMZA.GoogleTextOverlay.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleTextOverlay.prototype.onAdd = function()
	{
		
	}
	
});