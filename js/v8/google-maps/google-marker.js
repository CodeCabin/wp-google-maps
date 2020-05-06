/**
 * @namespace WPGMZA
 * @module GoogleMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleMarker = function(row)
	{
		var self = this;
		
		Parent.call(this, row);
		
		this._opacity = 1.0;
		
		var settings = {};
		if(row)
		{
			for(var name in row)
			{
				if(row[name] instanceof WPGMZA.LatLng)
				{
					settings[name] = row[name].toGoogleLatLng();
				}
				else if(row[name] instanceof WPGMZA.Map || name == "icon")
				{
					// NB: Ignore map here, it's not a google.maps.Map, Google would throw an exception
					// NB: Ignore icon here, it conflicts with updateIcon in Pro
				}
				else
					settings[name] = row[name];
			}
		}
		
		this.googleMarker = new google.maps.Marker(settings);
		this.googleMarker.wpgmzaMarker = this;
		
		this.googleMarker.setPosition(new google.maps.LatLng({
			lat: parseFloat(this.lat),
			lng: parseFloat(this.lng)
		}));
			
		// this.googleMarker.setLabel(this.settings.label);
		
		if(this.anim)
			this.googleMarker.setAnimation(this.anim);
		if(this.animation)
			this.googleMarker.setAnimation(this.animation);
			
		google.maps.event.addListener(this.googleMarker, "click", function() {
			self.dispatchEvent("click");
			self.dispatchEvent("select");
		});
		
		google.maps.event.addListener(this.googleMarker, "mouseover", function() {
			self.dispatchEvent("mouseover");
		});
		
		google.maps.event.addListener(this.googleMarker, "dragend", function() {
			var googleMarkerPosition = self.googleMarker.getPosition();
			
			self.setPosition({
				lat: googleMarkerPosition.lat(),
				lng: googleMarkerPosition.lng()
			});
			
			self.dispatchEvent({
				type: "dragend",
				latLng: self.getPosition()
			});
		});
		
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.GoogleMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleMarker.prototype.constructor = WPGMZA.GoogleMarker;
	
	Object.defineProperty(WPGMZA.GoogleMarker.prototype, "opacity", {
		
		"get": function() {
			return this._opacity;
		},
		
		"set": function(value) {
			this._opacity = value;
			this.googleMarker.setOpacity(value);
		}
		
	});
	
	WPGMZA.GoogleMarker.prototype.setLabel = function(label)
	{
		if(!label)
		{
			this.googleMarker.setLabel(null);
			return;
		}
		
		this.googleMarker.setLabel({
			text: label
		});
		
		if(!this.googleMarker.getIcon())
			this.googleMarker.setIcon(WPGMZA.settings.default_marker_icon);
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);
		this.googleMarker.setPosition({
			lat: this.lat,
			lng: this.lng
		});
	}
	
	/**
	 * Sets the position offset of a marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.updateOffset = function()
	{
		var self = this;
		var icon = this.googleMarker.getIcon();
		var img = new Image();
		var params;
		var x = this._offset.x;
		var y = this._offset.y;
		
		if(!icon)
			icon = WPGMZA.settings.default_marker_icon;
		
		if(typeof icon == "string")
			params = {
				url: icon
			};
		else
			params = icon;
		
		img.onload = function()
		{
			var defaultAnchor = {
				x: img.width / 2,
				y: img.height
			};
			
			params.anchor = new google.maps.Point(defaultAnchor.x - x, defaultAnchor.y - y);
			
			self.googleMarker.setIcon(params);
		}
		
		img.src = params.url;
	}
	
	WPGMZA.GoogleMarker.prototype.setOptions = function(options)
	{
		this.googleMarker.setOptions(options);
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setAnimation = function(animation)
	{
		Parent.prototype.setAnimation.call(this, animation);
		this.googleMarker.setAnimation(animation);
	}
	
	/**
	 * Sets the visibility of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);
		
		this.googleMarker.setVisible(visible ? true : false);
	}
	
	WPGMZA.GoogleMarker.prototype.getVisible = function(visible)
	{
		return this.googleMarker.getVisible();
	}
	
	WPGMZA.GoogleMarker.prototype.setDraggable = function(draggable)
	{
		this.googleMarker.setDraggable(draggable);
	}
	
	WPGMZA.GoogleMarker.prototype.setOpacity = function(opacity)
	{
		this.googleMarker.setOpacity(opacity);
	}
	
});