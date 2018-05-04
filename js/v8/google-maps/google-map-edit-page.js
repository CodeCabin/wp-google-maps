/**
 * @namespace WPGMZA
 * @module GoogleMapEditPage
 * @requires WPGMZA.MapEditPage
 * @pro-requires WPGMZA.ProMapEditPage
 */
(function($) {
	
	var Parent;
	
	/**
	 * Map edit page for Google maps
	 * @return void
	 */
	WPGMZA.GoogleMapEditPage = function()
	{
		var self = this;
		
		Parent.call(this);
		
		// Set marker image for the right click marker
		this.rightClickCursor.googleMarker.setOptions({
			icon: {
				url: $("[data-right-click-marker-image]").attr("data-right-click-marker-image")
			},
			draggable: true
		});
		
		// Right click marker drag
		google.maps.event.addListener(this.rightClickCursor.googleMarker, "dragend", function(event) {
			var wpgmzaEvent = new WPGMZA.Event({
				type: "dragend",
				latLng: {
					lat: event.latLng.lat(),
					lng: event.latLng.lng()
				}
			});
			self.rightClickCursor.dispatchEvent(wpgmzaEvent);
		});
	}
	
	// Inheritence
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMapEditPage;
	else
		Parent = WPGMZA.MapEditPage;
	
	WPGMZA.GoogleMapEditPage.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleMapEditPage.prototype.constructor = WPGMZA.GoogleMapEditPage;
	
	// Override listeners
	WPGMZA.GoogleMapEditPage.prototype.createVertexContextMenuInstance = function()
	{
		return new WPGMZA.GoogleVertexContextMenu(this);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onRightClickMap = function(event)
	{
		Parent.prototype.onRightClickMap.call(this, event);
		
		this.rightClickCursor.googleMarker.setMap(this.map.googleMap);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.editMarker = function(marker)
	{
		this.rightClickCursor.googleMarker.setMap(null);
		
		Parent.prototype.editMarker.call(this, marker);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolygonAdded = function(event)
	{
		Parent.prototype.onPolygonAdded.call(this, event);
		
		var self = this,
			polygon = event.polygon;
		
		polygon.rightClickListener = google.maps.event.addListener(polygon.googlePolygon, "rightclick", function(e) {
			self.vertexContextMenu.open(self.map.googleMap, polygon.googlePolygon.getPath(), e.vertex);
		});
		
		polygon.googlePolygon.getPaths().forEach(function(path, index) {
			google.maps.event.addListener(path, "insert_at", function(event) {
				self.onPolygonModified(event);
			});
			google.maps.event.addListener(path, "remove_at", function(event) {
				self.onPolygonModified(event);
			})
			google.maps.event.addListener(path, "set_at", function(event) {
				self.onPolygonModified(event);
			});
		});
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolygonRemoved = function(event)
	{
		Parent.prototype.onPolygonRemoved.call(this, event);
		
		google.maps.event.removeListener(event.polygon.rightClickListener);
		delete event.polygon.rightClickListener;
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolygonSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polygon))
			return;
		
		Parent.prototype.onPolygonSettingChanged.call(this, event);
		
		var name = this.getInputNameWithoutPrefix(event.target.name);
		var value = this.getFieldValue(event.target);
		
		// NB: Options have to be passed like this so that the property name is a literal and not a string
		var options = {};
		options[name] = value;
		this.editMapObjectTarget.googlePolygon.setOptions(options);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolylineAdded = function(event)
	{
		Parent.prototype.onPolylineAdded.call(this, event);
		
		var self = this,
			polyline = event.polyline;
		
		polyline.rightClickListener = google.maps.event.addListener(polyline.googlePolyline, "rightclick", function(e) {
			self.vertexContextMenu.open(self.map.googleMap, polyline.googlePolyline.getPath(), e.vertex);
		});
		
		var path = polyline.googlePolyline.getPath();
		google.maps.event.addListener(path, "insert_at", function(event) {
			self.onPolylineModified(event);
		});
		google.maps.event.addListener(path, "remove_at", function(event) {
			self.onPolylineModified(event);
		});
		google.maps.event.addListener(path, "set_at", function(event) {
			self.onPolylineModified(event);
		});
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolylineSettingChanged = function(event)
	{
		if(!(this.editMapObjectTarget instanceof WPGMZA.Polyline))
			return;
		
		Parent.prototype.onPolylineSettingChanged.call(this, event);
		
		var name = this.getInputNameWithoutPrefix(event.target.name);
		var value = this.getFieldValue(event.target);
		
		// NB: Options have to be passed like this so that the property name is a literal and not a string
		var options = {};
		options[name] = value;
		this.editMapObjectTarget.googlePolyline.setOptions(options);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.onPolylineRemoved = function(event)
	{
		Parent.prototype.onPolylineRemoved.call(this, event);
		
		google.maps.event.removeListener(polyline.rightClickListener);
	}
	
	WPGMZA.GoogleMapEditPage.prototype.applyThemeData = function()
	{
		var str = $("textarea[name='theme_data']").val();
		
		try{
			var json = JSON.parse(str);
		}catch(e) {
			alert(e.message);
			return;
		}
		
		var data = $.extend(json, {name: "Styled Map"});
		var styledMapType = new google.maps.StyledMapType(data);
		this.map.googleMap.mapTypes.set("styled_map", styledMapType);
		this.map.googleMap.setMapTypeId("styled_map");
		
		// Respect points of interest stylers after applying the theme
		this.map.showPointsOfInterest(
			$("input[name='show_points_of_interest]").prop("checked")
		);
	}
	
})(jQuery);