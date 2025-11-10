/**
 * @namespace WPGMZA
 * @module LeafletDrawingManager
 * @requires WPGMZA.DrawingManager
 */
jQuery(function($) {
	WPGMZA.LeafletDrawingManager = function(map) {
		var self = this;
		
		WPGMZA.DrawingManager.call(this, map);

		this.interactions = {
			draw : false,
			edit : false
		};

		this.bindEvents();
	}
	
	WPGMZA.LeafletDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.LeafletDrawingManager.prototype.constructor = WPGMZA.LeafletDrawingManager;

	WPGMZA.LeafletDrawingManager.prototype.enableEditorInteraction = function(feature){
		const mode = this.getModeFromFeature(feature);
		const modeConfig = this.getModeConfiguration(mode);

		if(!modeConfig){
			return;
		}

		if(this.interactions.edit && this.interactions.edit.feature){
			if(feature !== this.interactions.edit.feature){
				/* Feature has changed */
				this.disableEditorInteraction();
			} else {
				/* Feature has not changed, no need to change this */
				return;
			}
		}

		this.interactions.edit = {
			map : this.map && this.map.leafletMap ? this.map.leafletMap : false,
			feature : feature
		};

		if(!this.interactions.edit.map){
			return;
		}

		if(!this.interactions.edit.tooling){
			this.interactions.edit.tooling = new L.Edit[modeConfig.editType](feature.leafletFeature, this.interactions.edit.map);
		}

		this.interactions.edit.tooling.enable();

		feature.leafletFeature.on('edit', () => {
			feature.trigger("change");
		});

		feature.leafletFeature.on('remove', () => {
			this.disableEditorInteraction();
		});
	}

	WPGMZA.LeafletDrawingManager.prototype.disableEditorInteraction = function() {
		if(this.interactions.edit && this.interactions.edit.feature){
			if(this.interactions.edit.tooling){
				this.interactions.edit.tooling.disable();
				this.interactions.edit.feature.leafletFeature.remove();
				this.interactions.edit = false;
			}
		}
	}

	
	WPGMZA.LeafletDrawingManager.prototype.setDrawingMode = function(mode) {
		WPGMZA.DrawingManager.prototype.setDrawingMode.call(this, mode);
		
		if(this.interactions.draw && this.interactions.draw.tooling){
			this.interactions.draw.tooling.disable();
			this.interactions.draw.tooling = false;
		}
		
		const modeConfig = this.getModeConfiguration(mode);
		if(!modeConfig){
			return;
		}
		
		this.interactions.draw = {
			map : this.map && this.map.leafletMap ? this.map.leafletMap : false,
			config : modeConfig
		};

		if(!this.interactions.draw.map) {
			return;
		}

		this.interactions.draw.tooling = new L.Draw[modeConfig.type](this.interactions.draw.map, modeConfig.drawOptions);

		this.interactions.draw.tooling.enable();
	}

	WPGMZA.LeafletDrawingManager.prototype.bindEvents = function(){
		const map = this.map && this.map.leafletMap ? this.map.leafletMap : false;
		if(!map){
			return;
		}

		map.on(L.Draw.Event.CREATED, (e) => {
			if(this.interactions.draw.tooling){
				this.interactions.draw.tooling.disable();
			}

			if(!this.interactions.draw.config || !this.interactions.draw.config.events.complete){
				return;
			}

			var WPGMZAEvent = new WPGMZA.Event(this.interactions.draw.config.events.complete);
			switch(this.interactions.draw.config.mode) {
				case WPGMZA.DrawingManager.MODE_POLYGON:
					WPGMZAEvent.enginePolygon = e.layer;
					break;
					
				case WPGMZA.DrawingManager.MODE_POLYLINE:
					WPGMZAEvent.enginePolyline = e.layer;
					break;
				
				case WPGMZA.DrawingManager.MODE_CIRCLE:
					WPGMZAEvent.engineCircle = e.layer;
					break;
				
				case WPGMZA.DrawingManager.MODE_RECTANGLE:
					WPGMZAEvent.engineRectangle = e.layer;
					break;
				case WPGMZA.DrawingManager.MODE_IMAGEOVERLAY:
					WPGMZAEvent.engineImageoverlay = {
						engineRectangle : e.layer
					};
					break;
					
				default:
					throw new Error("Drawing mode not implemented");
					break;
			}
			
			this.dispatchEvent(WPGMZAEvent);
		});

		this.on('refresh', () => {
			/* Refresh handles if editing */
			if(this.interactions.edit.tooling.enabled()){
				this.interactions.edit.tooling.disable()
				this.interactions.edit.tooling.enable()
			}
		})
	}

	WPGMZA.LeafletDrawingManager.prototype.getModeFromFeature = function(feature){
		if(feature instanceof WPGMZA.Marker){
			return WPGMZA.DrawingManager.MODE_MARKER;
		} else if(feature instanceof WPGMZA.Polygon){
			return WPGMZA.DrawingManager.MODE_POLYGON;
		} else if(feature instanceof WPGMZA.Polyline){
			return WPGMZA.DrawingManager.MODE_POLYLINE;
		} else if(feature instanceof WPGMZA.Circle){
			return WPGMZA.DrawingManager.MODE_CIRCLE;
		} else if(feature instanceof WPGMZA.Rectangle){
			return WPGMZA.DrawingManager.MODE_RECTANGLE;
		} else if(feature instanceof WPGMZA.Heatmap){
			return WPGMZA.DrawingManager.MODE_HEATMAP;
		} else if(feature instanceof WPGMZA.Pointlabel){
			return WPGMZA.DrawingManager.MODE_POINTLABEL;
		} else if(feature instanceof WPGMZA.Imageoverlay){
			return WPGMZA.DrawingManager.MODE_IMAGEOVERLAY;
		}
		return WPGMZA.DrawingManager.MODE_NONE;
	}

	WPGMZA.LeafletDrawingManager.prototype.getModeConfiguration = function(mode){
		const config = {
			mode : mode,
			type : false,
			editType : false,
			events : {
				complete : false,
				change : 'change'
			},
			drawOptions : {
				shapeOptions : {
					color : "#0494f4",
					fillColor : "#FFFFFF",
					fillOpacity: 0.3,
					weight: 2,
					opacity: 0.8
				}
			}
		};

		switch(mode) {
			case WPGMZA.DrawingManager.MODE_NONE:
			case WPGMZA.DrawingManager.MODE_MARKER:
			case WPGMZA.DrawingManager.MODE_POINTLABEL:
			case WPGMZA.DrawingManager.MODE_HEATMAP:
				break;
            case WPGMZA.DrawingManager.MODE_POLYGON:
				config.type = "Polygon";
				config.editType = "Poly";
				config.events.complete = "polygonclosed";
				config.drawOptions.metric = this.map.settings.store_locator_distance === WPGMZA.Distance.KILOMETERS ? true : false;
				break;
		    case WPGMZA.DrawingManager.MODE_POLYLINE:
				config.type = "Polyline";
				config.editType = "Poly";
				config.events.complete = "polylinecomplete";
				config.drawOptions.metric = this.map.settings.store_locator_distance === WPGMZA.Distance.KILOMETERS ? true : false;
				break;
			case WPGMZA.DrawingManager.MODE_CIRCLE:
				config.type = "Circle";
				config.events.complete = "circlecomplete";
				config.drawOptions.metric = this.map.settings.store_locator_distance === WPGMZA.Distance.KILOMETERS ? true : false;
				config.drawOptions.minRadius = 1;
				break;
			case WPGMZA.DrawingManager.MODE_RECTANGLE:
				config.type = "Rectangle";
				config.events.complete = "rectanglecomplete";
				config.drawOptions.metric = this.map.settings.store_locator_distance === WPGMZA.Distance.KILOMETERS ? true : false;
				break;
			case WPGMZA.DrawingManager.MODE_IMAGEOVERLAY:
				config.type = "Rectangle";
				config.events.complete = "imageoverlaycomplete";
				break;
			default:
				throw new Error("Invalid drawing mode");
				break;
		}

		config.editType = config.editType ? config.editType : config.type;

		return config.type ? config : false;
	}
	
});