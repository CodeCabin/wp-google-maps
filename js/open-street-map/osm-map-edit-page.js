(function($) {
	
	var parentConstructor;
	var osmModifyInteraction;
	
	WPGMZA.OSMMapEditPage = function()
	{
		var self = this;
		
		parentConstructor.call(this);
		
		this.map.osmMap.updateSize();
		
		this.selectInteraction = new ol.interaction.Select();
		this.selectInteraction.getFeatures().on("add", function(event) {
			if(self.editMapObjectTarget instanceof WPGMZA.Heatmap)
				return;
			
			self.finishEditingMapObject();
			
			for(var name in event.element)
				if(event.element[name] instanceof WPGMZA.MapObject)
					event.element[name].dispatchEvent("click");
		});
		this.map.osmMap.addInteraction(this.selectInteraction);
	}
	
	// Inheritence
	if(WPGMZA.isProVersion())
		parentConstructor = WPGMZA.ProMapEditPage;
	else
		parentConstructor = WPGMZA.MapEditPage;
	
	WPGMZA.OSMMapEditPage.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.OSMMapEditPage.prototype.constructor = WPGMZA.OSMMapEditPage;
	
	WPGMZA.OSMMapEditPage.setPolyEditable = function(poly, editable)
	{
		if(osmModifyInteraction)
		{
			WPGMZA.mapEditPage.map.osmMap.removeInteraction(osmModifyInteraction);
			osmModifyInteraction = false;
		}
		
		if(!editable)
			return;
		
		var collection = new ol.Collection();
		collection.push(poly.osmFeature);
		
		osmModifyInteraction = new ol.interaction.Modify({
			features: collection,
			deleteCondition: function(event) {
			  return ol.events.condition.shiftKeyOnly(event) &&
				  ol.events.condition.singleClick(event);
			}
		});
		
		osmModifyInteraction.on("modifystart", function(event) {
			poly.modified = true;
		});
		
		WPGMZA.mapEditPage.map.osmMap.addInteraction(osmModifyInteraction);
	}
	
	WPGMZA.OSMMapEditPage.prototype.finishEditingMapObject = function()
	{
		parentConstructor.prototype.finishEditingMapObject.call(this);
		
		if(this.osmModifyInteraction)
		{
			this.osmMap.removeInteraction(this.osmModifyInteraction);
			this.osmModifyInteraction = null;
		}
	}
	
})(jQuery);