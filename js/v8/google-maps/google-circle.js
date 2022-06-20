/**
 * @namespace WPGMZA
 * @module GoogleCircle
 * @requires WPGMZA.Circle
 * @pro-requires WPGMZA.ProCircle
 */
jQuery(function($) {
	
	var Parent = WPGMZA.Circle;
	/**
	 * Subclass, used when Google is the maps engine. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.GoogleCircle
	 * @constructor WPGMZA.GoogleCircle
	 * @memberof WPGMZA
	 * @augments WPGMZA.Circle
	 * @see WPGMZA.Circle.createInstance
	 */
	WPGMZA.GoogleCircle = function(options, googleCircle)
	{
		var self = this;
		
		Parent.call(this, options, googleCircle);
		
		if(googleCircle)
		{
			this.googleCircle = googleCircle;
			
			if(options)
			{

				options.center = WPGMZA.LatLng.fromGoogleLatLng( googleCircle.getCenter() );
				options.radius = googleCircle.getRadius() / 1000; // Meters to kilometers
			}
		}
		else
		{
			this.googleCircle = new google.maps.Circle();
			this.googleCircle.wpgmzaCircle = this;
		}
		
		this.googleFeature = this.googleCircle;
		
		if(options)
			this.setOptions(options);
		
		google.maps.event.addListener(this.googleCircle, "click", function() {
			self.dispatchEvent({type: "click"});
		});
	}

	if(WPGMZA.isProVersion())
		Parent = WPGMZA.ProCircle;
	
	WPGMZA.GoogleCircle.prototype = Object.create(Parent.prototype);
	WPGMZA.GoogleCircle.prototype.constructor = WPGMZA.GoogleCircle;
	
	WPGMZA.GoogleCircle.prototype.getCenter = function()
	{
		return WPGMZA.LatLng.fromGoogleLatLng( this.googleCircle.getCenter() );
	}
	
	WPGMZA.GoogleCircle.prototype.setCenter = function(center)
	{
		WPGMZA.Circle.prototype.setCenter.apply(this, arguments);
		
		this.googleCircle.setCenter(center);
	}
	
	WPGMZA.GoogleCircle.prototype.getRadius = function()
	{
		return this.googleCircle.getRadius() / 1000; // Meters to kilometers
	}
	
	WPGMZA.GoogleCircle.prototype.setRadius = function(radius)
	{
		WPGMZA.Circle.prototype.setRadius.apply(this, arguments);
		
		this.googleCircle.setRadius(parseFloat(radius) * 1000); // Kilometers to meters
	}
	
	WPGMZA.GoogleCircle.prototype.setVisible = function(visible)
	{
		this.googleCircle.setVisible(visible ? true : false);
	}
	
	WPGMZA.GoogleCircle.prototype.setDraggable = function(value)
	{
		this.googleCircle.setDraggable(value ? true : false);
	}
	
	WPGMZA.GoogleCircle.prototype.setEditable = function(value)
	{
		var self = this;
		
		this.googleCircle.setOptions({editable: value});
		
		if(value)
		{
			google.maps.event.addListener(this.googleCircle, "center_changed", function(event) {
				
				self.center = WPGMZA.LatLng.fromGoogleLatLng(self.googleCircle.getCenter());
				self.trigger("change");
				
			});
			
			google.maps.event.addListener(this.googleCircle, "radius_changed", function(event) {
				
				self.radius = self.googleCircle.getRadius() / 1000; // Meters to kilometers
				self.trigger("change");
				
			});
		}
	}
	
	WPGMZA.GoogleCircle.prototype.setOptions = function(options)
	{
		WPGMZA.Circle.prototype.setOptions.apply(this, arguments);
		
		if(options.center)
			this.center = new WPGMZA.LatLng(options.center);
	}
	
	WPGMZA.GoogleCircle.prototype.updateNativeFeature = function()
	{
		var googleOptions = this.getScalarProperties();
		var center = new WPGMZA.LatLng(this.center); // In case center is a lat lng literal, this should really happen though
		
		googleOptions.radius *= 1000; // Kilometers to meters
		googleOptions.center = center.toGoogleLatLng();
		
		this.googleCircle.setOptions(googleOptions);
	}
	
});