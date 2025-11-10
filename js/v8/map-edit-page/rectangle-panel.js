/**
 * @namespace WPGMZA
 * @module RectanglePanel
 * @requires WPGMZA.FeaturePanel
 */
jQuery(function($) {
	
	WPGMZA.RectanglePanel = function(element, mapEditPage)
	{
		WPGMZA.FeaturePanel.apply(this, arguments);

		if($(this.element).find('.wpgmza-boundary-input').length){
			this.boundaryInput = WPGMZA.BoundaryInput.createInstance($(this.element).find('.wpgmza-boundary-input'), {
				update : (bounds) => {
					if(this.feature && bounds && bounds instanceof WPGMZA.LatLngBounds){
						this.feature.setBounds(
							new WPGMZA.LatLng(bounds.south, bounds.west),
							new WPGMZA.LatLng(bounds.north, bounds.east)
						);

						if(this.drawingManager){
							this.drawingManager.trigger('refresh');
						}
					}
				}
			});
		}
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

			if(this.boundaryInput){
				this.boundaryInput.receive({lat : bounds.south, lng : bounds.west}, {lat : bounds.north, lng : bounds.east});
			}
		}
	}

	WPGMZA.RectanglePanel.prototype.setTargetFeature = function(feature){
		WPGMZA.FeaturePanel.prototype.setTargetFeature.apply(this, arguments);

		if(feature){
			this.updateFields();
		} else {
			if(this.boundaryInput){
				this.boundaryInput.reset();
			}
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