/**
 * @namespace WPGMZA
 * @module RectanglePanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.RectanglePanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.RectanglePanel, WPGMZA.FeaturePanel);
	
	WPGMZA.RectanglePanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProRectanglePanel(element, mapEditPage);
		
		return new WPGMZA.RectanglePanel(element, mapEditPage);
	}
	
	WPGMZA.RectanglePanel.prototype.updateFields = function()
	{
		var bounds = this.feature.getBounds();
		if(bounds.north && bounds.west && bounds.south && bounds.east){
			$(this.element).find("[data-ajax-name='cornerA']").val( bounds.north + ", " + bounds.west );
			$(this.element).find("[data-ajax-name='cornerB']").val( bounds.south + ", " + bounds.east );
		}
	}

	WPGMZA.RectanglePanel.prototype.setTargetFeature = function(feature){
		WPGMZA.FeaturePanel.prototype.setTargetFeature.apply(this, arguments);

		if(feature){
			this.updateFields();
		}
	}
	
	WPGMZA.RectanglePanel.prototype.onDrawingComplete = function(event)
	{
		WPGMZA.FeaturePanel.prototype.onDrawingComplete.apply(this, arguments);
		
		this.updateFields();
	}
	
	WPGMZA.RectanglePanel.prototype.onFeatureChanged = function(event)
	{
		WPGMZA.FeaturePanel.prototype.onFeatureChanged.apply(this, arguments);
		this.updateFields();
	}
	
});