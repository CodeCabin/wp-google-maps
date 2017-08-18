(function($) {
	WPGMZA.OSMDrawingManager = function(map)
	{
		WPGMZA.DrawingManager.call(this, map);
		
		this.source = new ol.source.Vector({wrapX: false});
		
		this.layer = new ol.layer.Vector({
			source: this.source
		});
		
		this.map.osmMap.addLayer(this.layer);
	}
	
	WPGMZA.OSMDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.OSMDrawingManager.prototype.constructor = WPGMZA.OSMDrawingManager;
	
	WPGMZA.OSMDrawingManager.prototype.setOptions = function(options)
	{	
		var params = {};
	
		if(options.strokeOpacity)
			params.stroke = new ol.style.Stroke({
				color: WPGMZA.hexOpacityToRGBA(options.strokeColor, options.strokeOpacity)
			})
		
		if(options.fillOpacity)
			params.fill = new ol.style.Fill({
				color: WPGMZA.hexOpacityToRGBA(options.fillColor, options.fillOpacity)
			});
	
		this.layer.setStyle(new ol.style.Style(params));
	}
	
	WPGMZA.OSMDrawingManager.prototype.setDrawingMode = function(mode)
	{
		var self = this;
		var type, endEventType;
		
		WPGMZA.DrawingManager.prototype.setDrawingMode.call(this, mode);
		
		if(this.interaction)
		{
			this.map.osmMap.removeInteraction(this.interaction);
			this.interaction = null;
		}
		
		switch(mode)
		{
			case WPGMZA.DrawingManager.MODE_NONE:
				return;
				break;
				
			case WPGMZA.DrawingManager.MODE_MARKER:
				type = "Point";
				endEventType = "markerplaced";
				break;
			
            case WPGMZA.DrawingManager.MODE_POLYGON:
				type = "Polygon";
				endEventType = "polygonclosed";
				break;
			
		    case WPGMZA.DrawingManager.MODE_POLYLINE:
				type = "LineString";
				endEventType = "polylinecomplete";
				break;
				
			default:
				throw new Error("Invalid drawing mode");
				break;
		}
		
		this.interaction = new ol.interaction.Draw({
			source: this.source,
			type: type
		});
		
		this.interaction.on("drawend", function(event) {
			if(!endEventType)
				return;
			
			var wpgmzaEvent = new WPGMZA.Event(endEventType);
			
			switch(mode)
			{
				case WPGMZA.DrawingManager.MODE_MARKER:
					var lonLat = ol.proj.toLonLat(event.feature.getGeometry().getCoordinates());
				
					wpgmzaEvent.engineMarker = event.feature;
					wpgmzaEvent.latLng = {
						lat: lonLat[1],
						lng: lonLat[0]
					};
					
					break;
				
				case WPGMZA.DrawingManager.MODE_POLYGON:
					wpgmzaEvent.enginePolygon = event.feature;
					break;
					
				case WPGMZA.DrawingManager.MODE_POLYLINE:
					wpgmzaEvent.enginePolyline = event.feature;
					break;
			}
			
			self.dispatchEvent(wpgmzaEvent);
		});
		this.map.osmMap.addInteraction(this.interaction);
	}
	
})(jQuery);