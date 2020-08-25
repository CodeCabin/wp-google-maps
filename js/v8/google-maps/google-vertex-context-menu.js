/**
 * @namespace WPGMZA
 * @module GoogleVertexContextMenu
 * @requires wpgmza_api_call
 * @gulp-requires ../core.js
 */
jQuery(function($) {
	
	if(WPGMZA.settings.engine != "google-maps")
		return;
	
	if(WPGMZA.googleAPIStatus && WPGMZA.googleAPIStatus.code == "USER_CONSENT_NOT_GIVEN")
		return;
	
	WPGMZA.GoogleVertexContextMenu = function(mapEditPage)
	{
		var self = this;
		
		this.mapEditPage = mapEditPage;
		
		this.element = document.createElement("div");
		this.element.className = "wpgmza-vertex-context-menu";
		this.element.innerHTML = "Delete";
		
		google.maps.event.addDomListener(this.element, "click", function(event) {
			self.removeVertex();
			event.preventDefault();
			event.stopPropagation();
			return false;
		});
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype = new google.maps.OverlayView();
	
	WPGMZA.GoogleVertexContextMenu.prototype.onAdd = function()
	{
		var self = this;
		var map = this.getMap();
		
		this.getPanes().floatPane.appendChild(this.element);
		this.divListener = google.maps.event.addDomListener(map.getDiv(), "mousedown", function(e) {
			if(e.target != self.element)
				self.close();
		}, true);
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.onRemove = function()
	{
		google.maps.event.removeListener(this.divListener);
		this.element.parentNode.removeChild(this.element);
		
		this.set("position");
		this.set("path");
		this.set("vertex");
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.open = function(map, path, vertex)
	{
		this.set('position', path.getAt(vertex));
		this.set('path', path);
		this.set('vertex', vertex);
		this.setMap(map);
		this.draw();
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.close = function()
	{
		this.setMap(null);
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.draw = function()
	{
		var position = this.get('position');
		var projection = this.getProjection();

		if (!position || !projection)
		  return;

		var point = projection.fromLatLngToDivPixel(position);
		this.element.style.top = point.y + 'px';
		this.element.style.left = point.x + 'px';
	}
	
	WPGMZA.GoogleVertexContextMenu.prototype.removeVertex = function()
	{
		var path = this.get('path');
		var vertex = this.get('vertex');

		if (!path || vertex == undefined) {
		  this.close();
		  return;
		}

		path.removeAt(vertex);
		this.close();
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtdmVydGV4LWNvbnRleHQtbWVudS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBHb29nbGVWZXJ0ZXhDb250ZXh0TWVudVxyXG4gKiBAcmVxdWlyZXMgd3BnbXphX2FwaV9jYWxsXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2NvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0aWYoV1BHTVpBLnNldHRpbmdzLmVuZ2luZSAhPSBcImdvb2dsZS1tYXBzXCIpXHJcblx0XHRyZXR1cm47XHJcblx0XHJcblx0aWYoV1BHTVpBLmdvb2dsZUFQSVN0YXR1cyAmJiBXUEdNWkEuZ29vZ2xlQVBJU3RhdHVzLmNvZGUgPT0gXCJVU0VSX0NPTlNFTlRfTk9UX0dJVkVOXCIpXHJcblx0XHRyZXR1cm47XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51ID0gZnVuY3Rpb24obWFwRWRpdFBhZ2UpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLm1hcEVkaXRQYWdlID0gbWFwRWRpdFBhZ2U7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblx0XHR0aGlzLmVsZW1lbnQuY2xhc3NOYW1lID0gXCJ3cGdtemEtdmVydGV4LWNvbnRleHQtbWVudVwiO1xyXG5cdFx0dGhpcy5lbGVtZW50LmlubmVySFRNTCA9IFwiRGVsZXRlXCI7XHJcblx0XHRcclxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHRoaXMuZWxlbWVudCwgXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLnJlbW92ZVZlcnRleCgpO1xyXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVWZXJ0ZXhDb250ZXh0TWVudS5wcm90b3R5cGUgPSBuZXcgZ29vZ2xlLm1hcHMuT3ZlcmxheVZpZXcoKTtcclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlVmVydGV4Q29udGV4dE1lbnUucHJvdG90eXBlLm9uQWRkID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdHZhciBtYXAgPSB0aGlzLmdldE1hcCgpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmdldFBhbmVzKCkuZmxvYXRQYW5lLmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XHJcblx0XHR0aGlzLmRpdkxpc3RlbmVyID0gZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIobWFwLmdldERpdigpLCBcIm1vdXNlZG93blwiLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGlmKGUudGFyZ2V0ICE9IHNlbGYuZWxlbWVudClcclxuXHRcdFx0XHRzZWxmLmNsb3NlKCk7XHJcblx0XHR9LCB0cnVlKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51LnByb3RvdHlwZS5vblJlbW92ZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRnb29nbGUubWFwcy5ldmVudC5yZW1vdmVMaXN0ZW5lcih0aGlzLmRpdkxpc3RlbmVyKTtcclxuXHRcdHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XHJcblx0XHRcclxuXHRcdHRoaXMuc2V0KFwicG9zaXRpb25cIik7XHJcblx0XHR0aGlzLnNldChcInBhdGhcIik7XHJcblx0XHR0aGlzLnNldChcInZlcnRleFwiKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24obWFwLCBwYXRoLCB2ZXJ0ZXgpXHJcblx0e1xyXG5cdFx0dGhpcy5zZXQoJ3Bvc2l0aW9uJywgcGF0aC5nZXRBdCh2ZXJ0ZXgpKTtcclxuXHRcdHRoaXMuc2V0KCdwYXRoJywgcGF0aCk7XHJcblx0XHR0aGlzLnNldCgndmVydGV4JywgdmVydGV4KTtcclxuXHRcdHRoaXMuc2V0TWFwKG1hcCk7XHJcblx0XHR0aGlzLmRyYXcoKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR0aGlzLnNldE1hcChudWxsKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZVZlcnRleENvbnRleHRNZW51LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0KCdwb3NpdGlvbicpO1xyXG5cdFx0dmFyIHByb2plY3Rpb24gPSB0aGlzLmdldFByb2plY3Rpb24oKTtcclxuXHJcblx0XHRpZiAoIXBvc2l0aW9uIHx8ICFwcm9qZWN0aW9uKVxyXG5cdFx0ICByZXR1cm47XHJcblxyXG5cdFx0dmFyIHBvaW50ID0gcHJvamVjdGlvbi5mcm9tTGF0TG5nVG9EaXZQaXhlbChwb3NpdGlvbik7XHJcblx0XHR0aGlzLmVsZW1lbnQuc3R5bGUudG9wID0gcG9pbnQueSArICdweCc7XHJcblx0XHR0aGlzLmVsZW1lbnQuc3R5bGUubGVmdCA9IHBvaW50LnggKyAncHgnO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlVmVydGV4Q29udGV4dE1lbnUucHJvdG90eXBlLnJlbW92ZVZlcnRleCA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcGF0aCA9IHRoaXMuZ2V0KCdwYXRoJyk7XHJcblx0XHR2YXIgdmVydGV4ID0gdGhpcy5nZXQoJ3ZlcnRleCcpO1xyXG5cclxuXHRcdGlmICghcGF0aCB8fCB2ZXJ0ZXggPT0gdW5kZWZpbmVkKSB7XHJcblx0XHQgIHRoaXMuY2xvc2UoKTtcclxuXHRcdCAgcmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdHBhdGgucmVtb3ZlQXQodmVydGV4KTtcclxuXHRcdHRoaXMuY2xvc2UoKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiZ29vZ2xlLW1hcHMvZ29vZ2xlLXZlcnRleC1jb250ZXh0LW1lbnUuanMifQ==
