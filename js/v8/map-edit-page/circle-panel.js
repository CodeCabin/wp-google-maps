/**
 * @namespace WPGMZA
 * @module CirclePanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.CirclePanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.CirclePanel, WPGMZA.FeaturePanel);
	
	WPGMZA.CirclePanel.createInstance = function(element, mapEditPage)
	{
		if(WPGMZA.isProVersion())
			return new WPGMZA.ProCirclePanel(element, mapEditPage);
		
		return new WPGMZA.CirclePanel(element, mapEditPage);
	}
	
	WPGMZA.CirclePanel.prototype.updateFields = function()
	{
		$(this.element).find("[data-ajax-name='center']").val( this.feature.getCenter().toString() );
		$(this.element).find("[data-ajax-name='radius']").val( this.feature.getRadius() );
	}
	
	WPGMZA.CirclePanel.prototype.onDrawingComplete = function(event)
	{
		WPGMZA.FeaturePanel.prototype.onDrawingComplete.apply(this, arguments);
		
		this.updateFields();
	}

	WPGMZA.CirclePanel.prototype.setTargetFeature = function(feature){
		WPGMZA.FeaturePanel.prototype.setTargetFeature.apply(this, arguments);

		if(feature){
			this.updateFields();
		}
	}
	
	WPGMZA.CirclePanel.prototype.onFeatureChanged = function(event)
	{
		WPGMZA.FeaturePanel.prototype.onFeatureChanged.apply(this, arguments);
		this.updateFields();
	}
	
});