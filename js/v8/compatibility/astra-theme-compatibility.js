/**
 * @namespace WPGMZA
 * @module AstraThemeCompatiblity
 * @requires WPGMZA
 * @description Prevents the document.body.onclick handler firing for markers, which causes the Astra theme to throw an error, preventing the infowindow from opening
 */
jQuery(function($) {
	
	$(window).on("load", function(event) {
		
		var parent = document.body.onclick;
		
		if(!parent)
			return;
		
		document.body.onclick = function(event)
		{
			if(event.target instanceof WPGMZA.Marker)
				return;
			
			parent(event);
		}
		
	});
	
});