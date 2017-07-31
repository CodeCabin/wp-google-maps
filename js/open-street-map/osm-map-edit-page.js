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
			
			for(var name in event.element)
			{
				if(event.element[name] instanceof WPGMZA.MapObject)
				{
					event.element[name].dispatchEvent("click");
					
					self.finishEditingMapObject();
				}
			}
		});
		this.map.osmMap.addInteraction(this.selectInteraction);
		
		// Set the right click marker image and add it to the OSM map
		$(this.rightClickCursor.element).find("img")[0].src = $(".wpgmza-map").attr("data-right-click-marker-image");
		this.map.osmMap.addOverlay( this.rightClickCursor.overlay );
		
		// Bind listeners for rightClickCursor
		$( ".wpgmza-engine-map" ).on("mousemove", function(event) {
			var offset = $(this).offset();
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;
			
            self.mouseCoordinates = {
                x: x,
                y: y
            }
        });
		
		$( ".wpgmza-engine-map" ).bind('contextmenu',function(e) {
			
            var conversion = self.map.osmMap.getCoordinateFromPixel( [self.mouseCoordinates.x, self.mouseCoordinates.y] );

            var coordinates = ol.proj.toLonLat( [ conversion[0], conversion[1] ] );

			self.map.dispatchEvent({
				type: "rightclick",
				latLng: {
					lat: coordinates[1],
					lng: coordinates[0]
				}
			});
			
            return false;
        });
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