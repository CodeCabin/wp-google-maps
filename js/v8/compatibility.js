/**
 * @namespace WPGMZA
 * @module Compatibility
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.Compatibility = function()
	{
		this.preventDocumentWriteGoogleMapsAPI();
	}
	
	WPGMZA.Compatibility.prototype.preventDocumentWriteGoogleMapsAPI = function()
	{
		var old = document.write;
		
		document.write = function(content)
		{
			if(content.match && content.match(/maps\.google/))
				return;
			
			old.call(document, content);
		}
	}
	
	WPGMZA.compatiblityModule = new WPGMZA.Compatibility();
	
});