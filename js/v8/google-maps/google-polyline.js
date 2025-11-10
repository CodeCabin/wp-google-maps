/**
 * @namespace WPGMZA
 * @module GooglePolyline
 * @requires WPGMZA.Polyline
 * @pro-requires WPGMZA.ProPolyline
 */
jQuery(function($) {
	
	var Parent;

	WPGMZA.GooglePolyline = function(options, googlePolyline) {

		var self = this;
		
		Parent.call(this, options, googlePolyline);
		
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
		
		google.maps.event.addListener(this.googlePolyline, "click", function(event) {
			let coordinates = new WPGMZA.LatLng(event.latLng.lat(), event.latLng.lng());
			self.dispatchEvent({type: "click", coordinates : coordinates});
		});
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProPolyline;
	else
		Parent = WPGMZA.Polyline;
	
	WPGMZA.GooglePolyline.prototype = Object.create(Parent.prototype);
	WPGMZA.GooglePolyline.prototype.constructor = WPGMZA.GooglePolyline;
	
	WPGMZA.GooglePolyline.prototype.updateNativeFeature = function() {
		this.googlePolyline.setOptions(WPGMZA.GoogleFeature.getGoogleStyle(this.getScalarProperties()));
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

	WPGMZA.GooglePolyline.prototype.setVisible = function(visible) {
		this.googlePolyline.setVisible(visible ? true : false);
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