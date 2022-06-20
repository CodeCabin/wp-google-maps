/**
 * @namespace WPGMZA
 * @module GooglePolyline
 * @requires WPGMZA.Polyline
 */
jQuery(function($) {
	
	WPGMZA.GooglePolyline = function(options, googlePolyline) {

		var self = this;
		
		WPGMZA.Polyline.call(this, options, googlePolyline);
		
		if(googlePolyline) {
			this.googlePolyline = googlePolyline;
		} else {
			this.googlePolyline = new google.maps.Polyline(this.settings);			
		}
		

		this.googleFeature = this.googlePolyline;
		
		if(options && options.polydata)
		{

			var path = this.parseGeometry(options.polydata);
			this.googlePolyline.setPath(path);
		}		
		
		this.googlePolyline.wpgmzaPolyline = this;
		
		if(options)
			this.setOptions(options);
		
		google.maps.event.addListener(this.googlePolyline, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}
	
	WPGMZA.GooglePolyline.prototype = Object.create(WPGMZA.Polyline.prototype);
	WPGMZA.GooglePolyline.prototype.constructor = WPGMZA.GooglePolyline;
	
	WPGMZA.GooglePolyline.prototype.updateNativeFeature = function() {
		this.googlePolyline.setOptions(this.getScalarProperties());
	}
	
	WPGMZA.GooglePolyline.prototype.setEditable = function(value) {
		var self = this;
		
		this.googlePolyline.setOptions({editable: value});
		
		
		
		if (value) {
			// TODO: Unbind these when value is false
			var path = this.googlePolyline.getPath();
			var events = [
				"insert_at",
				"remove_at",
				"set_at"
			];
			
			events.forEach(function(name) {
				google.maps.event.addListener(path, name, function() {
					self.trigger("change");
				})
			});
			
			// TODO: Add dragging and listen for dragend
			google.maps.event.addListener(this.googlePolyline, "dragend", function(event) {
				self.trigger("change");
			});
			
			google.maps.event.addListener(this.googlePolyline, "click", function(event) {
				if(!WPGMZA.altKeyDown)
					return;
				
				var path = this.getPath();
				path.removeAt(event.vertex);
				self.trigger("change");
				
			});
		}
	}
	
	WPGMZA.GooglePolyline.prototype.setDraggable = function(value) {
		this.googlePolyline.setOptions({draggable: value});
	}
	
	WPGMZA.GooglePolyline.prototype.getGeometry = function() {

		var result = [];
		
		var path = this.googlePolyline.getPath();
		for(var i = 0; i < path.getLength(); i++)
		{
			var latLng = path.getAt(i);
			result.push({
				lat: latLng.lat(),
				lng: latLng.lng()
			});
		}
		
		return result;
	}
	
});