/**
 * @namespace WPGMZA
 * @module PolylinePanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.PolylinePanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.PolylinePanel, WPGMZA.FeaturePanel);
	
	WPGMZA.PolylinePanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProPolylinePanel(element, mapEditPage);
		
		return new WPGMZA.PolylinePanel(element, mapEditPage);
	}
	
});