/**
 * @namespace WPGMZA
 * @module LeafletMarker
 * @requires WPGMZA.Marker
 * @pro-requires WPGMZA.ProMarker
 */
jQuery(function($) {
	
	var Parent;
	
	WPGMZA.LeafletMarker = function(options) {
		var self = this;
		
		Parent.call(this, options);
		
		let settings = {};
		if(options) {
			for(let name in options) {
				if(options[name] instanceof WPGMZA.LatLng) {
					settings[name] = options[name].toLatLngLiteral();
				} else if(options[name] instanceof WPGMZA.Map) {
					// Do nothing (ignore)
				} else {
					settings[name] = options[name];
                }
			}
		}

        let origin = L.latLng({lat : this.lat, lng : this.lng});
        let icon = L.icon({
            iconUrl : WPGMZA.defaultMarkerIcon
        });

        this.leafletMarker = L.marker(origin, {icon : icon});
        this.leafletMarker.wpgmzaMarker = this;
        this.leafletFeature = this.leafletMarker;
        
        this.leafletMarker.on('mouseover', function(event) {
            self.dispatchEvent("mouseover");
        });

        this.leafletMarker.on("mouseout", function(event) {
            self.dispatchEvent("mouseout");
        });

		this.leafletMarker.on('dragstart', function(event){
			self.onDragStart(event);
		});

		this.leafletMarker.on('dragend', function(event){
			self.onDragEnd(event);
		});
        
		this.leafletMarker.on('remove', () => {
			if(this.label){
				this.label.remove();
			}
		});
		
        this.rebindClickListener();
		
		this.setOptions(settings);
		this.trigger("init");
	}
	
	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProMarker;
	else
		Parent = WPGMZA.Marker;
	
	WPGMZA.LeafletMarker.prototype = Object.create(Parent.prototype);
	WPGMZA.LeafletMarker.prototype.constructor = WPGMZA.LeafletMarker;
	
	WPGMZA.LeafletMarker.prototype.addLabel = function() {
		this.setLabel(this.getLabelText());
	}
	
	WPGMZA.LeafletMarker.prototype.setLabel = function(label){
		if(!label){
			if(this.label){
				this.label.remove();
			}
			return;
		}
		
		if(!this.label) {
			label = label.replaceAll("&amp;", "&");
			
			this.label = WPGMZA.Text.createInstance({
				text: label,
				map: this.map,
				position: this.getPosition(),
				class: 'leaflet-marker-label'
			});
		}
	}
	
	WPGMZA.LeafletMarker.prototype.getVisible = function(visible){
		let element = this.getNativeElement();
		if(element && this.overlay){
			return this.overlay.getElement().style.display != "none";
		}
		return false;
	}
	
	WPGMZA.LeafletMarker.prototype.setVisible = function(visible) {
		Parent.prototype.setVisible.call(this, visible);

		let element = this.getNativeElement();
		if(element){
			element.style.display = (visible ? "block" : "none");
		}
	}
	
	WPGMZA.LeafletMarker.prototype.setPosition = function(latLng) {
		Parent.prototype.setPosition.call(this, latLng);

		this.leafletMarker.setLatLng({lat : latLng.lat, lng : latLng.lng});
	}
	
	WPGMZA.LeafletMarker.prototype.updateOffset = function(x, y){
		var x = this._offset.x;
		var y = this._offset.y;
		
		this.element.style.position = "relative";
		this.element.style.left = x + "px";
		this.element.style.top = y + "px";
	}
	
	WPGMZA.LeafletMarker.prototype.setAnimation = function(anim) {
		Parent.prototype.setAnimation.call(this, anim);

		let element = this.getNativeElement();
		if(element){
			switch(anim) {
				case WPGMZA.Marker.ANIMATION_NONE:
					$(element).removeAttr("data-anim");
					break;
				case WPGMZA.Marker.ANIMATION_BOUNCE:
					$(element).attr("data-anim", "bounce");
					break;
				case WPGMZA.Marker.ANIMATION_DROP:
					$(element).attr("data-anim", "drop");
					break;
			}
		}
	}
	
	WPGMZA.LeafletMarker.prototype.setDraggable = function(draggable) {
		if(this.leafletMarker && this.leafletMarker.dragging){
			if(draggable){
				this.leafletMarker.dragging.enable();
			} else {
				this.leafletMarker.dragging.disable();
			}
		}
	}
	
	WPGMZA.LeafletMarker.prototype.setOpacity = function(opacity) {
		let element = this.getNativeElement();
		if(element){
			$(element).css({opacity: opacity});
		}
	}
	
	WPGMZA.LeafletMarker.prototype.onDragStart = function(event) {
		this.isBeingDragged = true;
	}
	
	WPGMZA.LeafletMarker.prototype.onDragEnd = function(event){
		var self = this;
		if(event && event.target && event.target.getLatLng()){
			let latLng = event.target.getLatLng()
		
			this.setPosition({lat : latLng.lat, lng : latLng.lng});
			
			this.trigger({type: "dragend", latLng: {lat : latLng.lat, lng : latLng.lng}});

			this.trigger("change");

			/* Delay this slightly to allow event chain to remain in tact */
			setTimeout(() => {
				this.isBeingDragged = false;
			}, 100);
		}
		
	}
	
	WPGMZA.LeafletMarker.prototype.onElementClick = function(event)
	{
		if(this.wpgmzaMarker.isBeingDragged)
			return; // Don't dispatch click event after a drag
		
		this.wpgmzaMarker.dispatchEvent("click");
		this.wpgmzaMarker.dispatchEvent("select");
	}
	
	/**
	 * Binds / rebinds the click listener. This must be bound after draggable is initialized,
	 * this solves the click listener firing before dragend
	 */
	WPGMZA.LeafletMarker.prototype.rebindClickListener = function() {
		this.leafletMarker.off("click", this.onElementClick);
		this.leafletMarker.on("click", this.onElementClick);
	}
	
	WPGMZA.LeafletMarker.prototype.getNativeElement = function(){
		return this.leafletMarker._icon || false;
	}

	WPGMZA.LeafletMarker.prototype.onAdded = function(event) {
		Parent.prototype.onAdded.call(this, event);
		
		if(this.animation){
            this.setAnimation(this.animation);

		} else if(this.anim){	// NB: Code to support old name
            this.setAnimation(this.anim);
		}

		if(this.draggable){
			this.setDraggable(true);
		}
	}
	
});