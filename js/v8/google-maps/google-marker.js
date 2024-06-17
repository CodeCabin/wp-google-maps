/**
 * @namespace WPGMZA
 * @module GoogleMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.GoogleMarker = function(options)
	{
		var self = this;
		
		Parent.call(this, options);
		
		var settings = {};
		if(options)
		{
			for(var name in options)
			{
				if(options[name] instanceof WPGMZA.LatLng)
				{
					settings[name] = options[name].toGoogleLatLng();
				}
				else if(options[name] instanceof WPGMZA.Map || name == "icon")
				{
					// NB: Ignore map here, it's not a google.maps.Map, Google would throw an exception
					// NB: Ignore icon here, it conflicts with updateIcon in Pro
				}
				else
					settings[name] = options[name];
			}
		}
		
		if(WPGMZA.settings && WPGMZA.settings.googleMarkerMode && WPGMZA.settings.googleMarkerMode === WPGMZA.GoogleMarker.MARKER_MODE_ADVANCED){
			/* User has opted into the new render mode */
			this.googleMarker = new google.maps.marker.AdvancedMarkerElement();
		} else {
			/* User is in classic/legacy mode, the default */
			this.googleMarker = new google.maps.Marker(settings);

			/* Notice to swap, for more advanced users */
			if(WPGMZA && !WPGMZA.__hasNotifiedLegacyMarkers){
				WPGMZA.__hasNotifiedLegacyMarkers = true;
				/*
				console.log(`📍 WP Go Maps: You are currently using Google Maps default Markers module, which has been deprecated. 
						\nGoogle has not discontinued this module, but is suggesting all users move over to their AdvancedMarkerElement instead, as it performs better and allows for more customization using CSS selectors.
						\nOur team has added full support for this under Maps > Settings > Markers > Marker Render Mode, and highly recommend you try this new option on your site.
						\nFor the moment, this is not our default, as we are still validating the new module for stability. We expect this feature to become the default in the future.
						\nWant to disable this notice? Add the following to your Custom JavaScript block:\njQuery(($) => { WPGMZA.__hasNotifiedLegacyMarkers = true; });`);
				*/
			}
		}

		this.googleMarker.wpgmzaMarker = this;
		this.googleFeature = this.googleMarker;
		
		this.setPosition(new WPGMZA.LatLng(this.lat, this.lng));
		
		if(this.anim){
			this.setAnimation(this.anim);
		}

		if(this.animation){
			this.setAnimation(this.animation);
		}
		
		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			this.googleMarker.addListener("click", function() {
				self.dispatchEvent("click");
				self.dispatchEvent("select");
			});

			this.googleMarker.element.addEventListener("mouseover", function() {
				self.dispatchEvent("mouseover");
			});
	
			this.googleMarker.element.addEventListener("mouseout", function() {
				self.dispatchEvent("mouseout");
			});

			/* Add a globally shared CSS glass for users to leverage */
			if(this.googleMarker.element){
				this.googleMarker.element.classList.add('wpgmza-google-marker-advanced');
			}
		} else {
			/* Assume Marker module */
			google.maps.event.addListener(this.googleMarker, "click", function() {
				self.dispatchEvent("click");
				self.dispatchEvent("select");
			});

			google.maps.event.addListener(this.googleMarker, "mouseover", function() {
				self.dispatchEvent("mouseover");
			});
	
			google.maps.event.addListener(this.googleMarker, "mouseout", function() {
				self.dispatchEvent("mouseout");
			});
		}
		
		google.maps.event.addListener(this.googleMarker, "dragend", function() {
			let googleMarkerPosition;
			if(self.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
				/* AdvancedMarkerElement module */
				googleMarkerPosition = self.googleMarker.position;

				self.setPosition({
					lat: googleMarkerPosition.lat,
					lng: googleMarkerPosition.lng
				});
			} else {
				/* Assume Marker module */
				googleMarkerPosition = self.googleMarker.getPosition();

				self.setPosition({
					lat: googleMarkerPosition.lat(),
					lng: googleMarkerPosition.lng()
				});
			}
			
			self.dispatchEvent({
				type: "dragend",
				latLng: self.getPosition()
			});

			self.trigger("change");
		});
		
		this.setOptions(settings);
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	WPGMZA.GoogleMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleMarker.prototype.constructor = WPGMZA.GoogleMarker;

	WPGMZA.GoogleMarker.MARKER_MODE_LEGACY = 'marker';
	WPGMZA.GoogleMarker.MARKER_MODE_ADVANCED = 'advancedMarkerElement';
	
	Object.defineProperty(WPGMZA.GoogleMarker.prototype, "opacity", {
		
		"get": function() {
			return this._opacity;
		},
		
		"set": function(value) {
			this._opacity = value;
			this.setOpacity(value);
		}
		
	});
	
	WPGMZA.GoogleMarker.prototype.setLabel = function(label)
	{
		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			if(this.googleMarker.content){
				if(!label){
					const existing = this.googleMarker.content.querySelector('.wpgmza-google-marker-label');
					if(existing){
						existing.remove();
					}

					return;
				}

				const labelElement = document.createElement("div");
				labelElement.classList.add('wpgmza-google-marker-label');
				labelElement.innerText = label;

				this.googleMarker.content.appendChild(labelElement);
			}
		} else {
			/* Assume Marker module */
			if(!label){
				this.googleMarker.setLabel(null);
				return;
			}
			
			this.googleMarker.setLabel({
				text: label,
				className: 'wpgmza-google-marker-label-legacy'
			});
			
			if(!this.googleMarker.getIcon()){
				this.googleMarker.setIcon(WPGMZA.settings.default_marker_icon);
			}
		}
	}
	
	/**
	 * Sets the position of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setPosition = function(latLng)
	{
		Parent.prototype.setPosition.call(this, latLng);

		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			this.googleMarker.position = {
				lat: this.lat,
				lng: this.lng
			};
		} else {
			/* Assume Marker module */
			this.googleMarker.setPosition({
				lat: this.lat,
				lng: this.lng
			});
		}
	}
	
	/**
	 * Sets the position offset of a marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.updateOffset = function()
	{
		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			if(this.googleMarker.content){
				this.googleMarker.content.style.setProperty('--wpgmza-nudge-x', this._offset.x + 'px');
				this.googleMarker.content.style.setProperty('--wpgmza-nudge-y', this._offset.y + 'px');
				
				this.googleMarker.content.classList.add('wpgmza-google-icon-nudge');
			}
		} else {
			/* Marker Module */
			var self = this;
			var icon = this.googleMarker.getIcon();
			var img = new Image();
			var params;
			var x = this._offset.x;
			var y = this._offset.y;
			
			if(!icon){
				if(WPGMZA.settings.default_marker_icon){
					icon = WPGMZA.settings.default_marker_icon;
				} else if (this.map.settings.default_marker_icon){
					icon = this.map.settings.default_marker_icon;
				} else if(this.map.settings.default_marker){
					icon = this.map.settings.default_marker;
				}
			}

			if(typeof icon == "string"){
				params = {
					url: icon
				};
			}else{
				params = icon;
			}

			img.onload = function(){
				var defaultAnchor = {
					x: img.width / 2,
					y: img.height
				};
				
				params.anchor = new google.maps.Point(defaultAnchor.x - x, defaultAnchor.y - y);
				
				self.googleMarker.setIcon(params);
			}
			
			img.src = params.url;
		}
		
	}
	
	WPGMZA.GoogleMarker.prototype.setOptions = function(options)
	{
		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			for(let key in options){
				const value = options[key];
				switch(key){
					case 'animation': 
						this.setAnimation(value);
						break;
					case 'opacity':
						this.setOpacity(value);
						break;
					case 'visible':
						this.setVisible(value);
						break;
					case 'zIndex':
						this.googleMarker.zIndex = value;
						break;
					case 'title':
						this.googleMarker.title = value;
						break;
				}
			}
		} else {
			/* Assume Marker module */
			this.googleMarker.setOptions(options);
		}
	}
	
	/**
	 * Set the marker animation
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setAnimation = function(animation)
	{
		Parent.prototype.setAnimation.call(this, animation);
		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			if(this.googleMarker.content){
				switch(animation){
					case WPGMZA.Marker.ANIMATION_BOUNCE:
						this.googleMarker.content.classList.add('wpgmza-google-marker-bounce');
						break;
					case WPGMZA.Marker.ANIMATION_DROP:
						this.googleMarker.content.classList.add('wpgmza-google-marker-drop');
						break;
					case WPGMZA.Marker.ANIMATION_NONE:
					default:
						break;
				}
			}
		} else {
			/* Assume Marker module */
			this.googleMarker.setAnimation(animation);
		}
	}
	
	/**
	 * Sets the visibility of the marker
	 * @return void
	 */
	WPGMZA.GoogleMarker.prototype.setVisible = function(visible)
	{
		Parent.prototype.setVisible.call(this, visible);

		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			if(this.googleMarker.element){
				if(visible){
					this.googleMarker.element.classList.remove('wpgmza-google-marker-hidden');
				} else {
					this.googleMarker.element.classList.add('wpgmza-google-marker-hidden');
				}
			}
		} else {
			/* Assume Marker module */
			this.googleMarker.setVisible(visible ? true : false);
		}
	}
	
	WPGMZA.GoogleMarker.prototype.getVisible = function(visible)
	{
		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			return this.googleMarker.element.classList.contains('wpgmza-google-marker-hidden') ? false : true;
		} else {
			/* Assume Marker module */
			return this.googleMarker.getVisible();
		}
	}
	
	WPGMZA.GoogleMarker.prototype.setDraggable = function(draggable)
	{
		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			this.googleMarker.gmpDraggable = draggable;
		} else {
			/* Assume Marker module */
			this.googleMarker.setDraggable(draggable);
		}
	}
	
	WPGMZA.GoogleMarker.prototype.setOpacity = function(opacity)
	{
		if(this.googleMarker instanceof google.maps.marker.AdvancedMarkerElement){
			/* AdvancedMarkerElement module */
			if(this.googleMarker.content){
				this.googleMarker.content.style.setProperty("--wpgmza-opacity", opacity);
				this.googleMarker.content.classList.add('wpgmza-google-marker-opacity');
			}
		} else {
			/* Assume Marker module */
			this.googleMarker.setOpacity(opacity);
		}
	}
	
});