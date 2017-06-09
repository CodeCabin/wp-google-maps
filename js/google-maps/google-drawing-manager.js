(function($) {
	
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
			}
		});
		
		this.googleDrawingManager.setMap(map.googleMap);
		
		google.maps.event.addListener(this.googleDrawingManager, "markercomplete", function(marker) {
			self.onMarkerPlaced(marker);
		});
		google.maps.event.addListener(this.googleDrawingManager, "polygoncomplete", function(polygon) {
			self.onPolygonClosed(polygon);
		});
		google.maps.event.addListener(this.googleDrawingManager, "polylinecomplete", function(polyline) {
			self.onPolylineComplete(polyline)
		});
	}
	
	WPGMZA.GoogleDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.GoogleDrawingManager.prototype.constructor = WPGMZA.GoogleDrawingManager;
	
	WPGMZA.GoogleDrawingManager.prototype.setDrawingMode = function(mode)
	{
		var googleMode;
		
		switch(mode)
		{
			case WPGMZA.DrawingManager.MODE_NONE:
				googleMode = null;
				break;
				
			case WPGMZA.DrawingManager.MODE_MARKER:
				googleMode = google.maps.drawing.OverlayType.MARKER;
				break;
			
            case WPGMZA.DrawingManager.MODE_POLYGON:
				googleMode = google.maps.drawing.OverlayType.POLYGON;
				break;
			
		    case WPGMZA.DrawingManager.MODE_POLYLINE:
				googleMode = google.maps.drawing.OverlayType.POLYLINE;
				break;
				
			default:
				throw new Error("Invalid drawing mode");
				break;
		}
		
		this.googleDrawingManager.setDrawingMode(googleMode);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.setOptions = function(options)
	{
		this.googleDrawingManager.setOptions(options);
	}
	
	WPGMZA.GoogleDrawingManager.prototype.onMarkerPlaced = function(googleMarker)
	{
		var event = new WPGMZA.Event("markerplaced", googleMarker);
		var position = googleMarker.getPosition();
		
		event.engineMarker = googleMarker;
		event.latLng = {
			lat: position.lat(),
			lng: position.lng()
		};
		
		googleMarker.setMap(null);
		
		this.dispatchEvent(event);
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
	
})(jQuery);