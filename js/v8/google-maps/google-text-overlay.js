/**
 * @namespace WPGMZA
 * @module GoogleTextOverlay
 * @requires WPGMZA.GoogleText
 * @gulp-requires google-text.js
 */
jQuery(function($) {
	
	WPGMZA.GoogleTextOverlay = function(options)
	{
		this.element = $("<div class='wpgmza-google-text-overlay'><div class='wpgmza-inner'></div></div>");
		
		if(!options)
			options = {};
		
		if(options.position)
			this.position = options.position;
		
		if(options.text)
			this.element.find(".wpgmza-inner").text(options.text);
		
		if(options.map)
			this.setMap(options.map.googleMap);
	}
	
	if(window.google && google.maps && google.maps.OverlayView)
		WPGMZA.GoogleTextOverlay.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleTextOverlay.prototype.onAdd = function()
	{
		var overlayProjection = this.getProjection();
		var position = overlayProjection.fromLatLngToDivPixel(this.position.toGoogleLatLng());
		
		this.element.css({
			position: "absolute",
			left: position.x + "px",
			top: position.y + "px"
		});

		var panes = this.getPanes();
		panes.floatPane.appendChild(this.element[0]);
	}
	
	WPGMZA.GoogleTextOverlay.prototype.draw = function()
	{
		var overlayProjection = this.getProjection();
		var position = overlayProjection.fromLatLngToDivPixel(this.position.toGoogleLatLng());
		
		this.element.css({
			position: "absolute",
			left: position.x + "px",
			top: position.y + "px"
		});
	}
	
	WPGMZA.GoogleTextOverlay.prototype.onRemove = function()
	{
		this.element.remove();
	}
	
	WPGMZA.GoogleTextOverlay.prototype.hide = function()
	{
		this.element.hide();
	}
	
	WPGMZA.GoogleTextOverlay.prototype.show = function()
	{
		this.element.show();
	}
	
	WPGMZA.GoogleTextOverlay.prototype.toggle = function()
	{
		if(this.element.is(":visible"))
			this.element.hide();
		else
			this.element.show();
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtdGV4dC1vdmVybGF5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZVRleHRPdmVybGF5XHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuR29vZ2xlVGV4dFxyXG4gKiBAZ3VscC1yZXF1aXJlcyBnb29nbGUtdGV4dC5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlVGV4dE92ZXJsYXkgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdHRoaXMuZWxlbWVudCA9ICQoXCI8ZGl2IGNsYXNzPSd3cGdtemEtZ29vZ2xlLXRleHQtb3ZlcmxheSc+PGRpdiBjbGFzcz0nd3BnbXphLWlubmVyJz48L2Rpdj48L2Rpdj5cIik7XHJcblx0XHRcclxuXHRcdGlmKCFvcHRpb25zKVxyXG5cdFx0XHRvcHRpb25zID0ge307XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMucG9zaXRpb24pXHJcblx0XHRcdHRoaXMucG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLnRleHQpXHJcblx0XHRcdHRoaXMuZWxlbWVudC5maW5kKFwiLndwZ216YS1pbm5lclwiKS50ZXh0KG9wdGlvbnMudGV4dCk7XHJcblx0XHRcclxuXHRcdGlmKG9wdGlvbnMubWFwKVxyXG5cdFx0XHR0aGlzLnNldE1hcChvcHRpb25zLm1hcC5nb29nbGVNYXApO1xyXG5cdH1cclxuXHRcclxuXHRpZih3aW5kb3cuZ29vZ2xlICYmIGdvb2dsZS5tYXBzICYmIGdvb2dsZS5tYXBzLk92ZXJsYXlWaWV3KVxyXG5cdFx0V1BHTVpBLkdvb2dsZVRleHRPdmVybGF5LnByb3RvdHlwZSA9IG5ldyBnb29nbGUubWFwcy5PdmVybGF5VmlldygpO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVUZXh0T3ZlcmxheS5wcm90b3R5cGUub25BZGQgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIG92ZXJsYXlQcm9qZWN0aW9uID0gdGhpcy5nZXRQcm9qZWN0aW9uKCk7XHJcblx0XHR2YXIgcG9zaXRpb24gPSBvdmVybGF5UHJvamVjdGlvbi5mcm9tTGF0TG5nVG9EaXZQaXhlbCh0aGlzLnBvc2l0aW9uLnRvR29vZ2xlTGF0TG5nKCkpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmVsZW1lbnQuY3NzKHtcclxuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuXHRcdFx0bGVmdDogcG9zaXRpb24ueCArIFwicHhcIixcclxuXHRcdFx0dG9wOiBwb3NpdGlvbi55ICsgXCJweFwiXHJcblx0XHR9KTtcclxuXHJcblx0XHR2YXIgcGFuZXMgPSB0aGlzLmdldFBhbmVzKCk7XHJcblx0XHRwYW5lcy5mbG9hdFBhbmUuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50WzBdKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVRleHRPdmVybGF5LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBvdmVybGF5UHJvamVjdGlvbiA9IHRoaXMuZ2V0UHJvamVjdGlvbigpO1xyXG5cdFx0dmFyIHBvc2l0aW9uID0gb3ZlcmxheVByb2plY3Rpb24uZnJvbUxhdExuZ1RvRGl2UGl4ZWwodGhpcy5wb3NpdGlvbi50b0dvb2dsZUxhdExuZygpKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5lbGVtZW50LmNzcyh7XHJcblx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcblx0XHRcdGxlZnQ6IHBvc2l0aW9uLnggKyBcInB4XCIsXHJcblx0XHRcdHRvcDogcG9zaXRpb24ueSArIFwicHhcIlxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVUZXh0T3ZlcmxheS5wcm90b3R5cGUub25SZW1vdmUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dGhpcy5lbGVtZW50LnJlbW92ZSgpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlVGV4dE92ZXJsYXkucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dGhpcy5lbGVtZW50LmhpZGUoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVRleHRPdmVybGF5LnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHRoaXMuZWxlbWVudC5zaG93KCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVUZXh0T3ZlcmxheS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGlmKHRoaXMuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpKVxyXG5cdFx0XHR0aGlzLmVsZW1lbnQuaGlkZSgpO1xyXG5cdFx0ZWxzZVxyXG5cdFx0XHR0aGlzLmVsZW1lbnQuc2hvdygpO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtdGV4dC1vdmVybGF5LmpzIn0=
