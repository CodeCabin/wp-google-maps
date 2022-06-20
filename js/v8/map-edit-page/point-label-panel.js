/**
 * @namespace WPGMZA
 * @module PointlabelPanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.PointlabelPanel = function(element, mapEditPage){
		WPGMZA.FeaturePanel.apply(this, arguments);
	}
	
	WPGMZA.extend(WPGMZA.PointlabelPanel, WPGMZA.FeaturePanel);
	
	WPGMZA.PointlabelPanel.createInstance = function(element, mapEditPage){
		/*if(WPGMZA.isProVersion())
			return new WPGMZA.ProPointLabelPanel(element, mapEditPage);
		*/
		return new WPGMZA.PointlabelPanel(element, mapEditPage);
	}
	
	WPGMZA.PointlabelPanel.prototype.updateFields = function(){
		$(this.element).find("[data-ajax-name='center']").val( this.feature.getPosition().toString() );
	}
	
	WPGMZA.PointlabelPanel.prototype.onDrawingComplete = function(event){
		WPGMZA.FeaturePanel.prototype.onDrawingComplete.apply(this, arguments);
		this.updateFields();
	}

	WPGMZA.PointlabelPanel.prototype.setTargetFeature = function(feature){
		WPGMZA.FeaturePanel.prototype.setTargetFeature.apply(this, arguments);

		if(feature){
			this.updateFields();
		}
	}
	
	WPGMZA.PointlabelPanel.prototype.onFeatureChanged = function(event){
		WPGMZA.FeaturePanel.prototype.onFeatureChanged.apply(this, arguments);
		this.updateFields();
	}
});