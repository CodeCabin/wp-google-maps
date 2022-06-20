/**
 * @namespace WPGMZA
 * @module GoogleDrawingManager
 * @requires WPGMZA.DrawingManager
 */
jQuery(function($) {
	
	WPGMZA.GoogleDrawingManager = function(map)
	{
		var self = this;
		
		WPGMZA.DrawingManager.call(this, map);
		
		this.mode = null;
		
		this.googleDrawingManager = new google.maps.drawing.DrawingManager({
			drawingControl: false,
			polygonOptions: {
				editable: true
			},
			polylineOptions: {
				editable: true
			},
			circleOptions: {
				editable: true
			},
			rectangleOptions: {
				draggable: true,
				editable: true,
				strokeWeight: 1,
				fillOpacity: 0
			}
		});
		
		this.googleDrawingManager.setMap(map.googleMap);
		
		google.maps.event.addListener(this.googleDrawingManager, "polygoncomplete", function(polygon) {
			self.onPolygonClosed(polygon);
		});
		
		google.maps.event.addListener(this.googleDrawingManager, "polylinecomplete", function(polyline) {
			self.onPolylineComplete(polyline);
		});
		
		google.maps.event.addListener(this.googleDrawingManager, "circlecomplete", function(circle) {
			self.onCircleComplete(circle);
		});
		
		google.maps.event.addListener(this.googleDrawingManager, "rectanglecomplete", function(rectangle) {
			self.onRectangleComplete(rectangle);
		});
	}
	
	WPGMZA.GoogleDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.GoogleDrawingManager.prototype.constructor = WPGMZA.GoogleDrawingManager;
	
	WPGMZA.GoogleDrawingManager.prototype.setDrawingMode = function(mode)
	{
		var googleMode;
		
		WPGMZA.DrawingManager.prototype.setDrawingMode.call(this, mode);
		
		switch(mode)
		{
			case WPGMZA.DrawingManager.MODE_NONE:
				googleMode = null;
				break;
				
			case WPGMZA.DrawingManager.MODE_MARKER:
				/* Set to null to allow only right click */
				/*
					googleMode = google.maps.drawing.OverlayType.MARKER;
				*/
				googleMode = null;
				break;
			
            case WPGMZA.DrawingManager.MODE_POLYGON:
				googleMode = google.maps.drawing.OverlayType.POLYGON;
				break;
			
		    case WPGMZA.DrawingManager.MODE_POLYLINE:
				googleMode = google.maps.drawing.OverlayType.POLYLINE;
				break;
				
			case WPGMZA.DrawingManager.MODE_CIRCLE:
				googleMode = google.maps.drawing.OverlayType.CIRCLE;
				break;
				
			case WPGMZA.DrawingManager.MODE_RECTANGLE:
				googleMode = google.maps.drawing.OverlayType.RECTANGLE;
				break;
				
			case WPGMZA.DrawingManager.MODE_HEATMAP:
				googleMode = null;
				break;

			case WPGMZA.DrawingManager.MODE_POINTLABEL:
				googleMode = null;
				// googleMode = google.maps.drawing.OverlayType.MARKER;
				break;

			case WPGMZA.DrawingManager.MODE_IMAGEOVERLAY:
				googleMode = google.maps.drawing.OverlayType.RECTANGLE;
				break;
				
			default:
				throw new Error("Invalid drawing mode");
				break;
		}
		
		this.googleDrawingManager.setDrawingMode(googleMode);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.setOptions = function(options)
	{
		this.googleDrawingManager.setOptions({
			polygonOptions: options,
			polylineOptions: options
		});
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onVertexClicked = function(event) {
		
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onPolygonClosed = function(googlePolygon)
	{
		var event = new WPGMZA.Event("polygonclosed");
		event.enginePolygon = googlePolygon;
		this.dispatchEvent(event);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onPolylineComplete = function(googlePolyline)
	{
		var event = new WPGMZA.Event("polylinecomplete");
		event.enginePolyline = googlePolyline;
		this.dispatchEvent(event);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onCircleComplete = function(googleCircle)
	{
		var event = new WPGMZA.Event("circlecomplete");
		event.engineCircle = googleCircle;
		this.dispatchEvent(event);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onRectangleComplete = function(googleRectangle){
		if(this.mode === WPGMZA.DrawingManager.MODE_IMAGEOVERLAY){
			/* Uses rectangles, but doesn't store them, so relay */
			this.onImageoverlayComplete(googleRectangle);
			return;
		}

		var event = new WPGMZA.Event("rectanglecomplete");
		event.engineRectangle = googleRectangle;
		this.dispatchEvent(event);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onHeatmapPointAdded = function(googleMarker)
	{
		var position = WPGMZA.LatLng.fromGoogleLatLng(googleMarker.getPosition());
		googleMarker.setMap(null);
		
		var marker = WPGMZA.Marker.createInstance();
		marker.setPosition(position);
		
		var image = {
			url:	WPGMZA.imageFolderURL + "heatmap-point.png",
			origin:	new google.maps.Point(0, 0),
			anchor: new google.maps.Point(13, 13)
		};
		
		marker.googleMarker.setIcon(image);
		
		this.map.addMarker(marker);
		
		var event = new WPGMZA.Event("heatmappointadded");
		event.position = position;
		this.trigger(event);
	}

	WPGMZA.GoogleDrawingManager.prototype.onImageoverlayComplete = function(rectangle){
		var event = new WPGMZA.Event("imageoverlaycomplete");
		event.engineImageoverlay = {
			googleRectangle : rectangle
		};
		this.dispatchEvent(event);	
	}
	
});