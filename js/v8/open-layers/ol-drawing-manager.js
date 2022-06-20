/**
 * @namespace WPGMZA
 * @module OLDrawingManager
 * @requires WPGMZA.DrawingManager
 */
jQuery(function($) {
	WPGMZA.OLDrawingManager = function(map)
	{
		var self = this;
		
		WPGMZA.DrawingManager.call(this, map);
		
		this.source = new ol.source.Vector({wrapX: false});
		
		this.layer = new ol.layer.Vector({
			source: this.source
		});
		
		/*this.map.on("init", function() {
			self.map.olMap.addLayer(self.layer);
		});*/
	}
	
	WPGMZA.OLDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.OLDrawingManager.prototype.constructor = WPGMZA.OLDrawingManager;
	
	WPGMZA.OLDrawingManager.prototype.setOptions = function(options)
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
	
	WPGMZA.OLDrawingManager.prototype.setDrawingMode = function(mode)
	{
		var self = this;
		var type, endEventType;
		
		WPGMZA.DrawingManager.prototype.setDrawingMode.call(this, mode);
		
		if(this.interaction)
		{
			this.map.olMap.removeInteraction(this.interaction);
			this.interaction = null;
		}
		
		switch(mode)
		{
			case WPGMZA.DrawingManager.MODE_NONE:
				return;
				break;
			
			case WPGMZA.DrawingManager.MODE_MARKER:
				return;
				break;
			
            case WPGMZA.DrawingManager.MODE_POLYGON:
				type = "Polygon";
				endEventType = "polygonclosed";
				break;
			
		    case WPGMZA.DrawingManager.MODE_POLYLINE:
				type = "LineString";
				endEventType = "polylinecomplete";
				break;
				
			case WPGMZA.DrawingManager.MODE_CIRCLE:
				type = "Circle";
				endEventType = "circlecomplete";
				break;
				
			case WPGMZA.DrawingManager.MODE_RECTANGLE:
				type = "Circle";
				endEventType = "rectanglecomplete";
				break;
			
			case WPGMZA.DrawingManager.MODE_HEATMAP:
				return;
				break;

			case WPGMZA.DrawingManager.MODE_POINTLABEL:
				return;
				break;
			case WPGMZA.DrawingManager.MODE_IMAGEOVERLAY:
				type = "Circle";
				endEventType = "imageoverlaycomplete";
				break;
			
			default:
				throw new Error("Invalid drawing mode");
				break;
		}
		
		if(WPGMZA.mapEditPage && WPGMZA.mapEditPage.selectInteraction)
		{
			WPGMZA.mapEditPage.map.olMap.removeInteraction(WPGMZA.mapEditPage.selectInteraction);
		}
		
		var options = {
			source: this.source,
			type: type
		};
		
		if(mode == WPGMZA.DrawingManager.MODE_RECTANGLE || mode == WPGMZA.DrawingManager.MODE_IMAGEOVERLAY)
			options.geometryFunction = ol.interaction.Draw.createBox();
		
		this.interaction = new ol.interaction.Draw(options);
		
		this.interaction.on("drawend", function(event) {
			if(!endEventType)
				return;
			
			var WPGMZAEvent = new WPGMZA.Event(endEventType);
			
			switch(mode)
			{
				case WPGMZA.DrawingManager.MODE_POLYGON:
					WPGMZAEvent.enginePolygon = event.feature;
					break;
					
				case WPGMZA.DrawingManager.MODE_POLYLINE:
					WPGMZAEvent.enginePolyline = event.feature;
					break;
				
				case WPGMZA.DrawingManager.MODE_CIRCLE:
					WPGMZAEvent.engineCircle = event.feature;
					break;
				
				case WPGMZA.DrawingManager.MODE_RECTANGLE:
					WPGMZAEvent.engineRectangle = event.feature;
					break;
				case WPGMZA.DrawingManager.MODE_IMAGEOVERLAY:
					WPGMZAEvent.engineImageoverlay = {
						engineRectangle : event.feature
					};
					break;
					
				default:
					throw new Error("Drawing mode not implemented");
					break;
			}
			
			self.dispatchEvent(WPGMZAEvent);
		});
		
		this.map.olMap.addInteraction(this.interaction);
	}
	
});