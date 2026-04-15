/**
 * @namespace WPGMZA
 * @module GoogleDrawingManager
 * @requires WPGMZA.DrawingManager
 *
 * As of 2026-04-01 this module replaces the Google Maps Drawing Library
 * (google.maps.drawing.DrawingManager), which Google has deprecated. Rather
 * than adopting a third-party replacement such as TerraDraw, drawing is now
 * implemented internally using core Google Maps primitives, keeping it
 * consistent with how the Leaflet and OpenLayers engines already work.
 */
jQuery(function($) {

	/**
	 * Google Maps implementation of the drawing manager. Handles interactive
	 * drawing of polygons, polylines, circles, rectangles, and image overlay
	 * bounds directly on the map using native Google Maps events and overlays.
	 *
	 * @constructor
	 * @augments WPGMZA.DrawingManager
	 * @param {WPGMZA.GoogleMap} map
	 */
	WPGMZA.GoogleDrawingManager = function(map)
	{
		WPGMZA.DrawingManager.call(this, map);

		this.mode = null;
		this.mapListeners   = [];
		this.previewShapes  = [];
		this.vertexMarkers  = [];
		this.vertices       = [];
		this.dragging       = false;
		this.dragStart      = null;
	}

	WPGMZA.GoogleDrawingManager.prototype = Object.create(WPGMZA.DrawingManager.prototype);
	WPGMZA.GoogleDrawingManager.prototype.constructor = WPGMZA.GoogleDrawingManager;

	/**
	 * Registers a Google Maps event listener and tracks it so it can be
	 * removed in bulk by clearMapListeners.
	 *
	 * @param {google.maps.MVCObject} target
	 * @param {string} eventName
	 * @param {Function} handler
	 * @returns {google.maps.MapsEventListener}
	 */
	WPGMZA.GoogleDrawingManager.prototype.addMapListener = function(target, eventName, handler)
	{
		var listener = google.maps.event.addListener(target, eventName, handler);
		this.mapListeners.push(listener);
		return listener;
	}

	/**
	 * Removes all Google Maps event listeners registered via addMapListener.
	 * Called whenever the drawing mode changes or a shape is completed.
	 */
	WPGMZA.GoogleDrawingManager.prototype.clearMapListeners = function()
	{
		this.mapListeners.forEach(function(l) {
			google.maps.event.removeListener(l);
		});
		this.mapListeners = [];
	}

	/**
	 * Removes all in-progress preview overlays (lines, circles, rectangles) and
	 * vertex handle markers from the map, then resets drawing state. Called on
	 * mode change or shape completion.
	 */
	WPGMZA.GoogleDrawingManager.prototype.clearPreview = function()
	{
		this.previewShapes.forEach(function(shape) { shape.setMap(null); });
		this.previewShapes = [];

		this.vertexMarkers.forEach(function(marker) { marker.setMap(null); });
		this.vertexMarkers = [];

		this.vertices  = [];
		this.dragging  = false;
		this.dragStart = null;
	}

	/**
	 * Sets the map cursor to a crosshair and disables clicks on POI labels
	 * (park names, business names etc.) so they do not intercept vertex
	 * placement clicks during drawing.
	 */
	WPGMZA.GoogleDrawingManager.prototype.setCrosshairCursor = function()
	{
		this.map.googleMap.setOptions({ draggableCursor: 'crosshair', clickableIcons: false });
	}

	/**
	 * Returns the geographic midpoint between two LatLng positions.
	 *
	 * @param {google.maps.LatLng} a
	 * @param {google.maps.LatLng} b
	 * @returns {google.maps.LatLng}
	 */
	WPGMZA.GoogleDrawingManager.prototype.getLatLngMidpoint = function(a, b)
	{
		return new google.maps.LatLng(
			(a.lat() + b.lat()) / 2,
			(a.lng() + b.lng()) / 2
		);
	}

	/**
	 * Places a single circular handle marker on the map and registers it in
	 * vertexMarkers for cleanup. If a clickHandler is provided the marker is
	 * made interactive.
	 *
	 * Note: google.maps.Marker is deprecated by Google in favour of
	 * AdvancedMarkerElement, however AdvancedMarkerElement requires a mapId
	 * which is not guaranteed to be available. google.maps.Marker remains
	 * fully functional and is appropriate for these short-lived drawing handles.
	 *
	 * @param {google.maps.LatLng} position
	 * @param {Object} iconOptions  scale, fillColor, strokeWeight, zIndex
	 * @param {Function|null} clickHandler
	 * @returns {google.maps.Marker}
	 */
	WPGMZA.GoogleDrawingManager.prototype.placeVertexMarker = function(position, iconOptions, clickHandler)
	{
		var marker = new google.maps.Marker({
			position:  position,
			map:       this.map.googleMap,
			clickable: !!clickHandler,
			cursor:    clickHandler ? 'pointer' : 'crosshair',
			zIndex:    iconOptions.zIndex || 1000,
			icon: {
				path:         google.maps.SymbolPath.CIRCLE,
				scale:        iconOptions.scale,
				fillColor:    iconOptions.fillColor,
				fillOpacity:  1,
				strokeColor:  '#0494f4',
				strokeWeight: iconOptions.strokeWeight !== undefined ? iconOptions.strokeWeight : 2
			}
		});

		if(clickHandler) {
			google.maps.event.addListener(marker, 'click', clickHandler);
		}

		this.vertexMarkers.push(marker);
		return marker;
	}

	/**
	 * Rebuilds all vertex and midpoint markers from the current this.vertices
	 * array. Called after every vertex is placed so the handles stay in sync.
	 *
	 * When firstClickHandler is supplied the first vertex is promoted to an
	 * action handle (polygon close) once at least 3 vertices have been placed.
	 * When lastClickHandler is supplied the last vertex is promoted to an
	 * action handle (polyline complete) once at least 2 vertices have been placed.
	 * Between each pair of adjacent vertices a smaller floating midpoint handle
	 * is rendered to indicate the segment.
	 *
	 * @param {Function|null} firstClickHandler
	 * @param {Function|null} lastClickHandler
	 */
	WPGMZA.GoogleDrawingManager.prototype.rebuildVertexHandles = function(firstClickHandler, lastClickHandler)
	{
		this.vertexMarkers.forEach(function(m) { m.setMap(null); });
		this.vertexMarkers = [];

		var vertices = this.vertices;
		var n = vertices.length;

		for(var i = 0; i < n; i++) {
			var isFirst = (i === 0);
			var isLast  = (i === n - 1);
			var icon    = { scale: 4, fillColor: '#FFFFFF', strokeWeight: 3, zIndex: 1000 };
			var handler = null;

			if(isFirst && firstClickHandler && n >= 3) {
				icon.scale     = 6;
				icon.fillColor = '#0494f4';
				handler        = firstClickHandler;
			} else if(isLast && !isFirst && lastClickHandler && n >= 2) {
				icon.scale     = 6;
				icon.fillColor = '#0369a1';
				handler        = lastClickHandler;
			}

			this.placeVertexMarker(vertices[i], icon, handler);

			if(i < n - 1) {
				this.placeVertexMarker(
					this.getLatLngMidpoint(vertices[i], vertices[i + 1]),
					{ scale: 3, fillColor: '#FFFFFF', strokeWeight: 2, zIndex: 999 },
					null
				);
			}
		}
	}

	/**
	 * Activates the given drawing mode, tearing down any previous drawing
	 * session and delegating to the appropriate enable* method.
	 * Restores map options (cursor, draggability, POI clicks, double-click zoom)
	 * before setting up the new mode.
	 *
	 * @param {string|null} mode  One of the WPGMZA.DrawingManager.MODE_* constants
	 */
	WPGMZA.GoogleDrawingManager.prototype.setDrawingMode = function(mode)
	{
		WPGMZA.DrawingManager.prototype.setDrawingMode.call(this, mode);

		this.clearMapListeners();
		this.clearPreview();

		var googleMap = this.map.googleMap;
		googleMap.setOptions({
			draggableCursor:        null,
			draggable:              true,
			disableDoubleClickZoom: false,
			clickableIcons:         true
		});

		switch(mode)
		{
			case WPGMZA.DrawingManager.MODE_NONE:
			case WPGMZA.DrawingManager.MODE_MARKER:
			case WPGMZA.DrawingManager.MODE_HEATMAP:
			case WPGMZA.DrawingManager.MODE_POINTLABEL:
				break;

			case WPGMZA.DrawingManager.MODE_POLYGON:
				this.enablePolygonDrawing();
				break;

			case WPGMZA.DrawingManager.MODE_POLYLINE:
				this.enablePolylineDrawing();
				break;

			case WPGMZA.DrawingManager.MODE_CIRCLE:
				this.enableCircleDrawing();
				break;

			case WPGMZA.DrawingManager.MODE_RECTANGLE:
			case WPGMZA.DrawingManager.MODE_IMAGEOVERLAY:
				this.enableRectangleDrawing();
				break;

			default:
				throw new Error("Invalid drawing mode");
		}
	}

	/**
	 * Begins an interactive polygon drawing session. Each map click appends a
	 * vertex; vertex and midpoint handles are rendered after every click. Once
	 * three or more vertices exist the first vertex handle becomes clickable to
	 * close the polygon. Double-clicking also closes it, discarding the
	 * duplicate vertex produced by the second click in the sequence.
	 * Dispatches a "polygonclosed" event carrying the completed google.maps.Polygon.
	 */
	WPGMZA.GoogleDrawingManager.prototype.enablePolygonDrawing = function()
	{
		var self      = this;
		var googleMap = this.map.googleMap;

		this.setCrosshairCursor();
		googleMap.setOptions({ disableDoubleClickZoom: true });

		var previewLine = new google.maps.Polyline({
			map: googleMap, path: [],
			strokeColor: '#0494f4', strokeWeight: 3, strokeOpacity: 0.8, clickable: false
		});
		this.previewShapes.push(previewLine);

		var ghostLine = new google.maps.Polyline({
			map: googleMap, path: [],
			strokeColor: '#0494f4', strokeWeight: 3, strokeOpacity: 0.4, clickable: false
		});
		this.previewShapes.push(ghostLine);

		var completePolygon = function() {
			if(self.vertices.length < 3) return;

			var polygon = new google.maps.Polygon({
				paths: self.vertices.slice(),
				editable: true
			});

			self.clearMapListeners();
			self.clearPreview();
			googleMap.setOptions({ draggableCursor: null, disableDoubleClickZoom: false, clickableIcons: true });
			self.onPolygonClosed(polygon);
		};

		this.addMapListener(googleMap, 'click', function(event) {
			self.vertices.push(event.latLng);
			previewLine.setPath(self.vertices.slice());
			self.rebuildVertexHandles(completePolygon, null);
		});

		this.addMapListener(googleMap, 'mousemove', function(event) {
			if(self.vertices.length > 0) {
				ghostLine.setPath([self.vertices[self.vertices.length - 1], event.latLng]);
			}
		});

		this.addMapListener(googleMap, 'dblclick', function() {
			if(self.vertices.length > 1) self.vertices.pop();
			completePolygon();
		});
	}

	/**
	 * Begins an interactive polyline drawing session. Each map click appends a
	 * vertex; vertex and midpoint handles are rendered after every click. Once
	 * two or more vertices exist the last vertex handle becomes clickable to
	 * complete the polyline. Double-clicking also completes it, discarding the
	 * duplicate vertex produced by the second click in the sequence.
	 * Dispatches a "polylinecomplete" event carrying the completed google.maps.Polyline.
	 */
	WPGMZA.GoogleDrawingManager.prototype.enablePolylineDrawing = function()
	{
		var self      = this;
		var googleMap = this.map.googleMap;

		this.setCrosshairCursor();
		googleMap.setOptions({ disableDoubleClickZoom: true });

		var previewLine = new google.maps.Polyline({
			map: googleMap, path: [],
			strokeColor: '#0494f4', strokeWeight: 3, strokeOpacity: 0.8, clickable: false
		});
		this.previewShapes.push(previewLine);

		var ghostLine = new google.maps.Polyline({
			map: googleMap, path: [],
			strokeColor: '#0494f4', strokeWeight: 3, strokeOpacity: 0.4, clickable: false
		});
		this.previewShapes.push(ghostLine);

		var completePolyline = function() {
			if(self.vertices.length < 2) return;

			var polyline = new google.maps.Polyline({
				path: self.vertices.slice(),
				editable: true
			});

			self.clearMapListeners();
			self.clearPreview();
			googleMap.setOptions({ draggableCursor: null, disableDoubleClickZoom: false, clickableIcons: true });
			self.onPolylineComplete(polyline);
		};

		this.addMapListener(googleMap, 'click', function(event) {
			self.vertices.push(event.latLng);
			previewLine.setPath(self.vertices.slice());
			self.rebuildVertexHandles(null, completePolyline);
		});

		this.addMapListener(googleMap, 'mousemove', function(event) {
			if(self.vertices.length > 0) {
				ghostLine.setPath([self.vertices[self.vertices.length - 1], event.latLng]);
			}
		});

		this.addMapListener(googleMap, 'dblclick', function() {
			if(self.vertices.length > 1) self.vertices.pop();
			completePolyline();
		});
	}

	/**
	 * Begins an interactive circle drawing session. The user click-drags to
	 * define the centre and radius; a preview circle updates in real time.
	 * Map dragging is suppressed during the drag. Radius is computed using
	 * google.maps.geometry.spherical, which is always available as the geometry
	 * library is loaded unconditionally.
	 * Dispatches a "circlecomplete" event carrying the completed google.maps.Circle,
	 * which is editable (edge resize handle) and draggable (centre repositioning).
	 */
	WPGMZA.GoogleDrawingManager.prototype.enableCircleDrawing = function()
	{
		var self      = this;
		var googleMap = this.map.googleMap;

		this.setCrosshairCursor();

		var previewCircle = new google.maps.Circle({
			map: googleMap, center: { lat: 0, lng: 0 }, radius: 1,
			strokeColor: '#0494f4', strokeWeight: 2, strokeOpacity: 0.8,
			fillColor: '#FFFFFF', fillOpacity: 0.3,
			clickable: false, visible: false
		});
		this.previewShapes.push(previewCircle);

		this.addMapListener(googleMap, 'mousedown', function(event) {
			self.dragging  = true;
			self.dragStart = event.latLng;
			previewCircle.setCenter(event.latLng);
			previewCircle.setRadius(1);
			previewCircle.setVisible(true);
			googleMap.setOptions({ draggable: false });
		});

		this.addMapListener(googleMap, 'mousemove', function(event) {
			if(!self.dragging || !self.dragStart) return;
			var radius = google.maps.geometry.spherical.computeDistanceBetween(
				self.dragStart, event.latLng
			);
			previewCircle.setRadius(Math.max(radius, 1));
		});

		this.addMapListener(googleMap, 'mouseup', function(event) {
			if(!self.dragging || !self.dragStart) return;
			self.dragging = false;

			var radius = google.maps.geometry.spherical.computeDistanceBetween(
				self.dragStart, event.latLng
			);

			if(radius < 10) {
				previewCircle.setVisible(false);
				googleMap.setOptions({ draggable: true });
				return;
			}

			var circle = new google.maps.Circle({
				center:    self.dragStart,
				radius:    radius,
				editable:  true,
				draggable: true
			});

			self.clearMapListeners();
			self.clearPreview();
			googleMap.setOptions({ draggable: true, draggableCursor: null });
			self.onCircleComplete(circle);
		});
	}

	/**
	 * Begins an interactive rectangle drawing session. The user click-drags to
	 * define the bounding box; a preview rectangle updates in real time. Map
	 * dragging is suppressed during the drag. Drags that produce no meaningful
	 * area are ignored to prevent accidental single-click placement.
	 * Both MODE_RECTANGLE and MODE_IMAGEOVERLAY use this method; the distinction
	 * is handled in onRectangleComplete which routes to onImageoverlayComplete
	 * when appropriate.
	 * Dispatches a "rectanglecomplete" or "imageoverlaycomplete" event carrying
	 * the completed google.maps.Rectangle, which is editable and draggable.
	 */
	WPGMZA.GoogleDrawingManager.prototype.enableRectangleDrawing = function()
	{
		var self      = this;
		var googleMap = this.map.googleMap;

		this.setCrosshairCursor();

		var previewRect = new google.maps.Rectangle({
			map: googleMap, bounds: { north: 0, south: 0, east: 0, west: 0 },
			strokeColor: '#0494f4', strokeWeight: 1, strokeOpacity: 0.8,
			fillColor: '#FFFFFF', fillOpacity: 0,
			clickable: false, visible: false
		});
		this.previewShapes.push(previewRect);

		this.addMapListener(googleMap, 'mousedown', function(event) {
			self.dragging  = true;
			self.dragStart = event.latLng;
			previewRect.setVisible(true);
			googleMap.setOptions({ draggable: false });
		});

		this.addMapListener(googleMap, 'mousemove', function(event) {
			if(!self.dragging || !self.dragStart) return;
			previewRect.setBounds({
				north: Math.max(self.dragStart.lat(), event.latLng.lat()),
				south: Math.min(self.dragStart.lat(), event.latLng.lat()),
				east:  Math.max(self.dragStart.lng(), event.latLng.lng()),
				west:  Math.min(self.dragStart.lng(), event.latLng.lng())
			});
		});

		this.addMapListener(googleMap, 'mouseup', function(event) {
			if(!self.dragging || !self.dragStart) return;
			self.dragging = false;

			var bounds = {
				north: Math.max(self.dragStart.lat(), event.latLng.lat()),
				south: Math.min(self.dragStart.lat(), event.latLng.lat()),
				east:  Math.max(self.dragStart.lng(), event.latLng.lng()),
				west:  Math.min(self.dragStart.lng(), event.latLng.lng())
			};

			if(Math.abs(bounds.north - bounds.south) < 0.0001 || Math.abs(bounds.east - bounds.west) < 0.0001) {
				previewRect.setVisible(false);
				googleMap.setOptions({ draggable: true });
				return;
			}

			var rectangle = new google.maps.Rectangle({
				bounds:       bounds,
				draggable:    true,
				editable:     true,
				strokeWeight: 1,
				fillOpacity:  0
			});

			self.clearMapListeners();
			self.clearPreview();
			googleMap.setOptions({ draggable: true, draggableCursor: null });
			self.onRectangleComplete(rectangle);
		});
	}

	/**
	 * No-op. Previously forwarded style options to google.maps.drawing.DrawingManager.
	 * Retained for API compatibility with any callers expecting this method to exist.
	 */
	WPGMZA.GoogleDrawingManager.prototype.setOptions = function()
	{

	}

	/**
	 * No-op. Retained for API compatibility.
	 */
	WPGMZA.GoogleDrawingManager.prototype.onVertexClicked = function(event)
	{
		
	}

	/**
	 * Wraps the completed google.maps.Polygon in a WPGMZA event and dispatches it.
	 * @param {google.maps.Polygon} googlePolygon
	 */
	WPGMZA.GoogleDrawingManager.prototype.onPolygonClosed = function(googlePolygon)
	{
		var event = new WPGMZA.Event("polygonclosed");
		event.enginePolygon = googlePolygon;
		this.dispatchEvent(event);
	}

	/**
	 * Wraps the completed google.maps.Polyline in a WPGMZA event and dispatches it.
	 * @param {google.maps.Polyline} googlePolyline
	 */
	WPGMZA.GoogleDrawingManager.prototype.onPolylineComplete = function(googlePolyline)
	{
		var event = new WPGMZA.Event("polylinecomplete");
		event.enginePolyline = googlePolyline;
		this.dispatchEvent(event);
	}

	/**
	 * Wraps the completed google.maps.Circle in a WPGMZA event and dispatches it.
	 * @param {google.maps.Circle} googleCircle
	 */
	WPGMZA.GoogleDrawingManager.prototype.onCircleComplete = function(googleCircle)
	{
		var event = new WPGMZA.Event("circlecomplete");
		event.engineCircle = googleCircle;
		this.dispatchEvent(event);
	}

	/**
	 * Routes the completed google.maps.Rectangle to either onImageoverlayComplete
	 * or dispatches a "rectanglecomplete" event, depending on the active mode.
	 * @param {google.maps.Rectangle} googleRectangle
	 */
	WPGMZA.GoogleDrawingManager.prototype.onRectangleComplete = function(googleRectangle)
	{
		if(this.mode === WPGMZA.DrawingManager.MODE_IMAGEOVERLAY) {
			this.onImageoverlayComplete(googleRectangle);
			return;
		}

		var event = new WPGMZA.Event("rectanglecomplete");
		event.engineRectangle = googleRectangle;
		this.dispatchEvent(event);
	}

	/**
	 * Handles a heatmap point placement. Creates a WPGMZA marker at the given
	 * position with the heatmap point icon and adds it to the map.
	 * @param {google.maps.Marker} googleMarker  Temporary marker from the drawing session
	 */
	WPGMZA.GoogleDrawingManager.prototype.onHeatmapPointAdded = function(googleMarker)
	{
		var position = WPGMZA.LatLng.fromGoogleLatLng(googleMarker.getPosition());
		googleMarker.setMap(null);

		var marker = WPGMZA.Marker.createInstance();
		marker.setPosition(position);

		var image = {
			url:    WPGMZA.imageFolderURL + "heatmap-point.png",
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(13, 13)
		};

		marker.googleMarker.setIcon(image);

		this.map.addMarker(marker);

		var event = new WPGMZA.Event("heatmappointadded");
		event.position = position;
		this.trigger(event);
	}

	/**
	 * Wraps the completed rectangle in the shape expected by the image overlay
	 * panel and dispatches an "imageoverlaycomplete" event.
	 * @param {google.maps.Rectangle} rectangle
	 */
	WPGMZA.GoogleDrawingManager.prototype.onImageoverlayComplete = function(rectangle)
	{
		var event = new WPGMZA.Event("imageoverlaycomplete");
		event.engineImageoverlay = {
			googleRectangle: rectangle
		};
		this.dispatchEvent(event);
	}

});
