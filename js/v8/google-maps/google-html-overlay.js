/**
 * @namespace WPGMZA
 * @module GoogleHTMLOverlay
 * @gulp-requires ../core.js
 */
jQuery(function($) {
	
	// https://developers.google.com/maps/documentation/javascript/customoverlays
	
	if(WPGMZA.settings.engine && WPGMZA.settings.engine != "google-maps")
		return;
	
	if(!window.google || !window.google.maps)
		return;
	
	WPGMZA.GoogleHTMLOverlay = function(map)
	{
		this.element	= $("<div class='wpgmza-google-html-overlay'></div>");
		
		this.visible	= true;
		this.position	= new WPGMZA.LatLng();
		
		this.setMap(map.googleMap);
		this.wpgmzaMap = map;
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleHTMLOverlay.prototype.onAdd = function()
	{
		var panes = this.getPanes();
		panes.overlayMouseTarget.appendChild(this.element[0]);
		
		/*google.maps.event.addDomListener(this.element, "click", function() {
			
		});*/
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.onRemove = function()
	{
		if(this.element && $(this.element).parent().length)
		{
			$(this.element).remove();
			this.element = null;
		}
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.draw = function()
	{
		this.updateElementPosition();
	}
	
	/*WPGMZA.GoogleHTMLOverlay.prototype.setMap = function(map)
	{
		if(!(map instanceof WPGMZA.Map))
			throw new Error("Map must be an instance of WPGMZA.Map");
		
		google.maps.OverlayView.prototype.setMap.call(this, map.googleMap);
		
		this.wpgmzaMap = map;
	}*/
	
	/*WPGMZA.GoogleHTMLOverlay.prototype.getVisible = function()
	{
		return $(this.element).css("display") != "none";
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.setVisible = function(visible)
	{
		$(this.element).css({
			"display": (visible ? "block" : "none")
		});
	}*/
	
	/*WPGMZA.GoogleHTMLOverlay.prototype.getPosition = function()
	{
		return new WPGMZA.LatLng(this.position);
	}
	
	WPGMZA.GoogleHTMLOverlay.prototype.setPosition = function(position)
	{
		if(!(position instanceof WPGMZA.LatLng))
			throw new Error("Argument must be an instance of WPGMZA.LatLng");
		
		this.position = position;
		this.updateElementPosition();
	}*/
	
	WPGMZA.GoogleHTMLOverlay.prototype.updateElementPosition = function()
	{
		//var pixels = this.wpgmzaMap.latLngToPixels(this.position);
		
		var projection = this.getProjection();
		
		if(!projection)
			return;
		
		var pixels = projection.fromLatLngToDivPixel(this.position.toGoogleLatLng());
		
		$(this.element).css({
			"left": pixels.x,
			"top": pixels.y
		});
	}
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtaHRtbC1vdmVybGF5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZUhUTUxPdmVybGF5XHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2NvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2phdmFzY3JpcHQvY3VzdG9tb3ZlcmxheXNcclxuXHRcclxuXHRpZihXUEdNWkEuc2V0dGluZ3MuZW5naW5lICYmIFdQR01aQS5zZXR0aW5ncy5lbmdpbmUgIT0gXCJnb29nbGUtbWFwc1wiKVxyXG5cdFx0cmV0dXJuO1xyXG5cdFxyXG5cdGlmKCF3aW5kb3cuZ29vZ2xlIHx8ICF3aW5kb3cuZ29vZ2xlLm1hcHMpXHJcblx0XHRyZXR1cm47XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUhUTUxPdmVybGF5ID0gZnVuY3Rpb24obWFwKVxyXG5cdHtcclxuXHRcdHRoaXMuZWxlbWVudFx0PSAkKFwiPGRpdiBjbGFzcz0nd3BnbXphLWdvb2dsZS1odG1sLW92ZXJsYXknPjwvZGl2PlwiKTtcclxuXHRcdFxyXG5cdFx0dGhpcy52aXNpYmxlXHQ9IHRydWU7XHJcblx0XHR0aGlzLnBvc2l0aW9uXHQ9IG5ldyBXUEdNWkEuTGF0TG5nKCk7XHJcblx0XHRcclxuXHRcdHRoaXMuc2V0TWFwKG1hcC5nb29nbGVNYXApO1xyXG5cdFx0dGhpcy53cGdtemFNYXAgPSBtYXA7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVIVE1MT3ZlcmxheS5wcm90b3R5cGUgPSBuZXcgZ29vZ2xlLm1hcHMuT3ZlcmxheVZpZXcoKTtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLm9uQWRkID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYW5lcyA9IHRoaXMuZ2V0UGFuZXMoKTtcclxuXHRcdHBhbmVzLm92ZXJsYXlNb3VzZVRhcmdldC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnRbMF0pO1xyXG5cdFx0XHJcblx0XHQvKmdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHRoaXMuZWxlbWVudCwgXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHR9KTsqL1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLm9uUmVtb3ZlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGlmKHRoaXMuZWxlbWVudCAmJiAkKHRoaXMuZWxlbWVudCkucGFyZW50KCkubGVuZ3RoKVxyXG5cdFx0e1xyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkucmVtb3ZlKCk7XHJcblx0XHRcdHRoaXMuZWxlbWVudCA9IG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVIVE1MT3ZlcmxheS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR0aGlzLnVwZGF0ZUVsZW1lbnRQb3NpdGlvbigpO1xyXG5cdH1cclxuXHRcclxuXHQvKldQR01aQS5Hb29nbGVIVE1MT3ZlcmxheS5wcm90b3R5cGUuc2V0TWFwID0gZnVuY3Rpb24obWFwKVxyXG5cdHtcclxuXHRcdGlmKCEobWFwIGluc3RhbmNlb2YgV1BHTVpBLk1hcCkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk1hcCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5NYXBcIik7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLk92ZXJsYXlWaWV3LnByb3RvdHlwZS5zZXRNYXAuY2FsbCh0aGlzLCBtYXAuZ29vZ2xlTWFwKTtcclxuXHRcdFxyXG5cdFx0dGhpcy53cGdtemFNYXAgPSBtYXA7XHJcblx0fSovXHJcblx0XHJcblx0LypXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLmdldFZpc2libGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuICQodGhpcy5lbGVtZW50KS5jc3MoXCJkaXNwbGF5XCIpICE9IFwibm9uZVwiO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLnNldFZpc2libGUgPSBmdW5jdGlvbih2aXNpYmxlKVxyXG5cdHtcclxuXHRcdCQodGhpcy5lbGVtZW50KS5jc3Moe1xyXG5cdFx0XHRcImRpc3BsYXlcIjogKHZpc2libGUgPyBcImJsb2NrXCIgOiBcIm5vbmVcIilcclxuXHRcdH0pO1xyXG5cdH0qL1xyXG5cdFxyXG5cdC8qV1BHTVpBLkdvb2dsZUhUTUxPdmVybGF5LnByb3RvdHlwZS5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5MYXRMbmcodGhpcy5wb3NpdGlvbik7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVIVE1MT3ZlcmxheS5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihwb3NpdGlvbilcclxuXHR7XHJcblx0XHRpZighKHBvc2l0aW9uIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZykpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLkxhdExuZ1wiKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cdFx0dGhpcy51cGRhdGVFbGVtZW50UG9zaXRpb24oKTtcclxuXHR9Ki9cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlSFRNTE92ZXJsYXkucHJvdG90eXBlLnVwZGF0ZUVsZW1lbnRQb3NpdGlvbiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQvL3ZhciBwaXhlbHMgPSB0aGlzLndwZ216YU1hcC5sYXRMbmdUb1BpeGVscyh0aGlzLnBvc2l0aW9uKTtcclxuXHRcdFxyXG5cdFx0dmFyIHByb2plY3Rpb24gPSB0aGlzLmdldFByb2plY3Rpb24oKTtcclxuXHRcdFxyXG5cdFx0aWYoIXByb2plY3Rpb24pXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0dmFyIHBpeGVscyA9IHByb2plY3Rpb24uZnJvbUxhdExuZ1RvRGl2UGl4ZWwodGhpcy5wb3NpdGlvbi50b0dvb2dsZUxhdExuZygpKTtcclxuXHRcdFxyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmNzcyh7XHJcblx0XHRcdFwibGVmdFwiOiBwaXhlbHMueCxcclxuXHRcdFx0XCJ0b3BcIjogcGl4ZWxzLnlcclxuXHRcdH0pO1xyXG5cdH1cclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtaHRtbC1vdmVybGF5LmpzIn0=
