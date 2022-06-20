/**
 * @namespace WPGMZA
 * @module GoogleInfoWindow
 * @requires WPGMZA.InfoWindow
 * @pro-requires WPGMZA.ProInfoWindow
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleInfoWindow = function(feature)
	{
		Parent.call(this, feature);
		
		this.setFeature(feature);
	}
	
	WPGMZA.GoogleInfoWindow.Z_INDEX		= 99;
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProInfoWindow;
	else
		Parent = WPGMZA.InfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleInfoWindow.prototype.constructor = WPGMZA.GoogleInfoWindow;
	
	WPGMZA.GoogleInfoWindow.prototype.setFeature = function(feature)
	{
		this.feature = feature;
		
		if(feature instanceof WPGMZA.Marker)
			this.googleObject = feature.googleMarker;
		else if(feature instanceof WPGMZA.Polygon)
			this.googleObject = feature.googlePolygon;
		else if(feature instanceof WPGMZA.Polyline)
			this.googleObject = feature.googlePolyline;
	}
	
	WPGMZA.GoogleInfoWindow.prototype.createGoogleInfoWindow = function()
	{
		var self = this;
		
		if(this.googleInfoWindow)
			return;
		
		this.googleInfoWindow = new google.maps.InfoWindow();
		
		this.googleInfoWindow.setZIndex(WPGMZA.GoogleInfoWindow.Z_INDEX);
		
		google.maps.event.addListener(this.googleInfoWindow, "domready", function(event) {
			self.trigger("domready");
		});
		
		google.maps.event.addListener(this.googleInfoWindow, "closeclick", function(event) {
			
			if(self.state == WPGMZA.InfoWindow.STATE_CLOSED)
				return;
			
			self.state = WPGMZA.InfoWindow.STATE_CLOSED;
			self.feature.map.trigger("infowindowclose");
			
		});
	}
	
	/**
	 * Opens the info window
	 * @return boolean FALSE if the info window should not & will not open, TRUE if it will
	 */
	WPGMZA.GoogleInfoWindow.prototype.open = function(map, feature) {
		var self = this;
		
		if(!Parent.prototype.open.call(this, map, feature))
			return false;

		
		// Set parent for events to bubble up to
		this.parent = map;
		
		this.createGoogleInfoWindow();
		this.setFeature(feature);

		/* Handle one shot auto pan disabler */
		if(typeof feature._osDisableAutoPan !== 'undefined'){
			if(feature._osDisableAutoPan){
				/* This has been flagged to not be an auto-pan open call */
				this.googleInfoWindow.setOptions({disableAutoPan : true});
				feature._osDisableAutoPan = false;
			} else {
				/* Restore auto pan for manual interactions */
				this.googleInfoWindow.setOptions({disableAutoPan : false});
			}
		}
		
		this.googleInfoWindow.open(
			this.feature.map.googleMap,
			this.googleObject
		);

		var guid = WPGMZA.guid();
		var eaBtn = !WPGMZA.isProVersion() ? this.addEditButton() : '';
		var html = "<div id='" + guid + "'>" + eaBtn + ' ' + this.content + "</div>";

		this.googleInfoWindow.setContent(html);
		
		var intervalID;
		intervalID = setInterval(function(event) {
			
			div = $("#" + guid);
			
			if(div.length)
			{
				clearInterval(intervalID);
				
				div[0].wpgmzaFeature = self.feature;
				div.addClass("wpgmza-infowindow");
				
				self.element = div[0];
				self.trigger("infowindowopen");
			}
			
		}, 50);

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