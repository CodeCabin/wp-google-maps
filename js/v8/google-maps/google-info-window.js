/**
 * @namespace WPGMZA
 * @module GoogleInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleInfoWindow = function(mapObject)
	{
		Parent.call(this, mapObject);
		
		this.setMapObject(mapObject);
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleInfoWindow.prototype.constructor = WPGMZA.GoogleInfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype.setMapObject = function(mapObject)
	{
		if(mapObject instanceof WPGMZA.Marker)
			this.googleObject = mapObject.googleMarker;
		else if(mapObject instanceof WPGMZA.Polygon)
			this.googleObject = mapObject.googlePolygon;
		else if(mapObject instanceof WPGMZA.Polyline)
			this.googleObject = mapObject.googlePolyline;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.createGoogleInfoWindow = function()
	{
		if(this.googleInfoWindow)
			return;
		
		this.googleInfoWindow = new google.maps.InfoWindow();
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.GoogleInfoWindow.prototype.open = function(map, mapObject)
	{
		var self = this;
		
		if(!Parent.prototype.open.call(this, map, mapObject))
			return false;
		
		this.createGoogleInfoWindow();
		this.setMapObject(mapObject);
		
		this.googleInfoWindow.open(
			this.mapObject.map.googleMap,
			this.googleObject
		);
		
		if(this.content)
			this.googleInfoWindow.setContent(this.content);
		
		//this.
		
		/*this.getContent(function(html) {
			
			// Wrap HTML with unique ID
			var guid = WPGMZA.guid();
			var html = "<div id='" + guid + "'>" + html + "</div>";
			var div, intervalID;
			
			self.googleInfoWindow.setContent(html);
			self.googleInfoWindow.open(
				self.mapObject.map.googleMap,
				self.googleObject
			);
			
			intervalID = setInterval(function(event) {
				
				div = $("#" + guid);
				
				if(div.find(".gm-style-iw").length)
				{
					div[0].wpgmzaMapObject = self.mapObject;
					
					self.dispatchEvent("infowindowopen");
					div.trigger("infowindowopen");
					clearInterval(intervalID);
				}
				
			}, 50);
			
		});*/
		
		return true;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.close = function()
	{
		if(!this.googleInfoWindow)
			return;
		
		WPGMZA.InfoWindow.prototype.close.call(this);
		
		this.googleInfoWindow.close();
	}
	
	WPGMZA.GoogleInfoWindow.prototype.setContent = function(html)
	{
		Parent.prototype.setContent.call(this, html);
		
		this.content = html;
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setContent(html);
	}
	
	WPGMZA.GoogleInfoWindow.prototype.setOptions = function(options)
	{
		Parent.prototype.setOptions.call(this, options);
		
		this.createGoogleInfoWindow();
		
		this.googleInfoWindow.setOptions(options);
	}
	
});