(function($) {
	
	var parentConstructor;

	/**
	 * Constructor
	 * NB: There is a bug in openlayers, so it's necessary to make the modify interaction inactive
	 * please do not remove that code. See https://github.com/openlayers/openlayers/issues/6310
	 */
	WPGMZA.OSMMapEditPage = function()
	{
		var self = this;
		
		parentConstructor.call(this);
		
		this.map.osmMap.updateSize();
		
		this.selectInteraction = new ol.interaction.Select();
		
		this.selectInteraction.on("select", function(event) {
			if(self.editMapObjectTarget instanceof WPGMZA.Heatmap || self.drawingManager.mode != WPGMZA.DrawingManager.MODE_NONE)
				return;
			
			self.finishEditingMapObject(false);
			
			var features = event.target.getFeatures().getArray();
			for(var i = 0; i < features.length; i++)
			{
				var properties = features[i].getProperties();
				for(var name in properties)
					if(properties[name] instanceof WPGMZA.MapObject)
					{
						properties[name].dispatchEvent("click");
						self.modifyInteraction.setActive(true);
						return;
					}
			}
		});
		
		this.map.osmMap.addInteraction(this.selectInteraction);
		
		this.modifyInteraction = new ol.interaction.Modify({
			features: this.selectInteraction.getFeatures(),
			deleteCondition: function(event) {
				return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
			}
		});
		
		this.modifyInteraction.on("modifyend", function(event) {
			self.editMapObjectTarget.modified = true;
		});
		
		this.modifyInteraction.setActive(false);
		
		this.map.osmMap.addInteraction(this.modifyInteraction);
		
		// Set the right click marker image and add it to the OSM map
		$(this.rightClickCursor.element).find("img")[0].src = $(".wpgmza-map").attr("data-right-click-marker-image");
		this.map.osmMap.addOverlay( this.rightClickCursor.overlay );
		
		// Bind listeners for rightClickCursor
		$(".wpgmza-engine-map").on("mousemove", function(event) {
			var offset = $(this).offset();
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;
			
            self.mouseCoordinates = {
                x: x,
                y: y
            };
        });
		
		$(".wpgmza-engine-map").bind("contextmenu", function(event) {
			return self.onRightClick(event);
        });
	}
	
	// Inheritence
	if(WPGMZA.isProVersion())
		parentConstructor = WPGMZA.ProMapEditPage;
	else
		parentConstructor = WPGMZA.MapEditPage;
	
	WPGMZA.OSMMapEditPage.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.OSMMapEditPage.prototype.constructor = WPGMZA.OSMMapEditPage;
	
	WPGMZA.OSMMapEditPage.prototype.onRightClick = function(event)
	{
		if($(event.target).closest("[data-wpgmza-layout-element]:not(.wpgmza-engine-map)").length)
			return true;
		
		var conversion = this.map.osmMap.getCoordinateFromPixel( [this.mouseCoordinates.x, this.mouseCoordinates.y] );
		var coordinates = ol.proj.toLonLat( [ conversion[0], conversion[1] ] );

		this.map.dispatchEvent({
			type: "rightclick",
			latLng: {
				lat: coordinates[1],
				lng: coordinates[0]
			}
		});
		
		return false;
	}
	
	WPGMZA.OSMMapEditPage.prototype.onFinishEditingPolygon = function(event)
	{
		this.selectInteraction.getFeatures().clear();
	}
	
	WPGMZA.OSMMapEditPage.prototype.finishEditingMapObject = function(clearSelectInteraction)
	{
		parentConstructor.prototype.finishEditingMapObject.call(this);
		
		this.modifyInteraction.setActive(false);
		
		if(clearSelectInteraction === undefined || clearSelectInteraction == true)
			WPGMZA.mapEditPage.selectInteraction.getFeatures().clear();
	}
	
})(jQuery);