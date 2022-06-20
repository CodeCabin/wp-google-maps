/**
 * @namespace WPGMZA
 * @module Pointlabel
 * @requires WPGMZA.Feature
 */
jQuery(function($) {
	
	WPGMZA.Pointlabel = function(options, pointlabel){
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Pointlabel");
		
		if(!options)
			options = {};
		
		if(options.map){
			this.map = options.map;
		} else if(!options.map && options.map_id){
			let map = WPGMZA.getMapByID(options.map_id);
			if(map){
				this.map = map;
			}
		} 

		this.center = new WPGMZA.LatLng();


		WPGMZA.Feature.apply(this, arguments);

		if(pointlabel){
			this.setPosition(pointlabel.getPosition());

			if(pointlabel.marker){
				this.marker = pointlabel.marker;
			}
		}
	}
	
	WPGMZA.Pointlabel.prototype = Object.create(WPGMZA.Feature.prototype);
	WPGMZA.Pointlabel.prototype.constructor = WPGMZA.Pointlabel;

	Object.defineProperty(WPGMZA.Pointlabel.prototype, "map", {
		enumerable: true,
		"get": function(){
			if(this._map){
				return this._map;
			}
			
			return null;
		},
		"set" : function(a){
			if(this.textFeature && !a){
				this.textFeature.remove();
			}
			this._map = a;
		}
		
	});

	WPGMZA.Pointlabel.getConstructor = function(){
		switch(WPGMZA.settings.engine){
			case "open-layers":
				if(WPGMZA.isProVersion()){
					return WPGMZA.OLProPointlabel;
					break;
				}
				return WPGMZA.OLPointlabel;
				break;
			
			default:
				if(WPGMZA.isProVersion()){
					return WPGMZA.GoogleProPointlabel;
					break;
				}
				return WPGMZA.GooglePointlabel;
				break;
		}
	}

	WPGMZA.Pointlabel.createInstance = function(options, pointlabel){
		var constructor = WPGMZA.Pointlabel.getConstructor();
		return new constructor(options, pointlabel);
	}

	WPGMZA.Pointlabel.createEditableMarker = function(options){
		var options = $.extend({
			draggable: true,
			disableInfoWindow: true
		}, options);
		
		if(options.pointlabel){
			let latLng = options.pointlabel.getPosition();
			options.lat = latLng.lat;
			options.lng = latLng.lng;
		}
		

		var marker = WPGMZA.Marker.createInstance(options);
		
		// NB: Hack for constructor not accepting icon prooperly. Once it does, this can be removed
		var callback = function(){
			try{
				// Try use Pro method to set a custom icon
				marker.setIcon(WPGMZA.labelpointIcon);
			} catch (ex){ }
			
			marker.off("added", callback);
		};

		marker.on("added", callback);

		return marker;
	}

	WPGMZA.Pointlabel.prototype.setEditable = function(editable){
		var self = this;
		
		if(this.marker){
			this.marker.map.removeMarker(this.marker);
			delete this.marker;
		}
		
		if(this._prevMap){
			delete this._prevMap;
		}
		
		if(editable){
			var options = {
				pointlabel: this
			};

			this.marker = WPGMZA.Pointlabel.createEditableMarker(options);
			this.map.addMarker(this.marker);
			
			
			this._dragEndCallback = function(event) {
				self.onDragEnd(event);
			};

			var map = this.map;

			this.marker.on("dragend", this._dragEndCallback);
			
			map.on("pointlabelremoved", function(event) {
				if(event.pointlabel !== self)
					return;
			});
		}
	}

	WPGMZA.Pointlabel.prototype.onDragEnd = function(event){
		if(!(event.target instanceof WPGMZA.Marker))
			return;
			
		
		if(!this.marker)
			return;

		if(event.latLng){
			this.setPosition(event.latLng);
		}
		
		this.trigger("change");
	}

	WPGMZA.Pointlabel.prototype.onMapMouseDown = function(event){
		if(event.button == 0){
			this._mouseDown = true;
			event.preventDefault();
			return false;
		}
	}
	
	WPGMZA.Pointlabel.prototype.onWindowMouseUp = function(event){
		if(event.button == 0)
			this._mouseDown = false;
	}
	
	WPGMZA.Pointlabel.prototype.onMapMouseMove = function(event){
		if(!this._mouseDown)
			return;
		
		var pixels = {
			x: event.pageX - $(this.map.element).offset().left,
			y: (event.pageY + 30) - $(this.map.element).offset().top
		}
		
		var latLng = this.map.pixelsToLatLng(pixels);
		
		if(latLng){
			this.setPosition(latLng);
		}

		this.trigger("change");
	}

	WPGMZA.Pointlabel.prototype.getPosition = function(){
		if(this.center){
			return new WPGMZA.LatLng({
				lat : this.center.lat,
				lng : this.center.lng,
			});
		}
		return null;
	}

	WPGMZA.Pointlabel.prototype.setPosition = function(position){
		this.center = {};
		this.center.lat = position.lat;
		this.center.lng = position.lng;

		if(this.textFeature){
			this.textFeature.setPosition(this.getPosition());
		}
	}

	WPGMZA.Pointlabel.prototype.getMap = function(){
		return this.map;
	}

	WPGMZA.Pointlabel.prototype.setMap = function(map){
		if(this.map){
			this.map.removePointlabel(this);
		}
		
		if(map){
			map.addPointlabel(this);
		}
			
	}
});