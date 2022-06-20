/**
 * @namespace WPGMZA
 * @module PolygonPanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.PolygonPanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.PolygonPanel, WPGMZA.FeaturePanel);
	
	WPGMZA.PolygonPanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProPolygonPanel(element, mapEditPage);
		
		return new WPGMZA.PolygonPanel(element, mapEditPage);
	}
	
	Object.defineProperty(WPGMZA.PolygonPanel.prototype, "drawingManagerCompleteEvent", {
		
		"get": function() {
			return "polygonclosed";
		}
		
	});
	
});