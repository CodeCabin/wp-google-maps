(function($) {
	/**
	* A menu that lets a user delete a selected vertex of a path.
	* @constructor
	*/
	function DeleteMenu(mapEditPage) {
		this.div_ = document.createElement('div');
		this.div_.className = 'wpgmza-delete-vertex-menu';
		this.div_.innerHTML = 'Delete';
		this.mapEditPage = mapEditPage;

		var menu = this;
		google.maps.event.addDomListener(this.div_, 'click', function(event) {
		  menu.removeVertex();
		  
		  event.preventDefault();
		  event.stopPropagation();
		  return false;
		});
	}
	
	WPGMZA.DeleteMenu = DeleteMenu;
	
	DeleteMenu.prototype = new google.maps.OverlayView();

	DeleteMenu.prototype.onAdd = function() {
		var deleteMenu = this;
		var map = this.getMap();
		this.getPanes().floatPane.appendChild(this.div_);

		// mousedown anywhere on the map except on the menu div will close the
		// menu.
		this.divListener_ = google.maps.event.addDomListener(map.getDiv(), 'mousedown', function(e) {
		  if (e.target != deleteMenu.div_) {
			deleteMenu.close();
		  }
		}, true);
	};

	DeleteMenu.prototype.onRemove = function() {
		google.maps.event.removeListener(this.divListener_);
		this.div_.parentNode.removeChild(this.div_);

		// clean up
		this.set('position');
		this.set('path');
		this.set('vertex');
	};

	DeleteMenu.prototype.close = function() {
		this.setMap(null);
	};

	DeleteMenu.prototype.draw = function() {
		var position = this.get('position');
		var projection = this.getProjection();

		if (!position || !projection) {
		  return;
		}

		var point = projection.fromLatLngToDivPixel(position);
		this.div_.style.top = point.y + 'px';
		this.div_.style.left = point.x + 'px';
	};

	/**
	* Opens the menu at a vertex of a given path.
	*/
	DeleteMenu.prototype.open = function(map, path, vertex) {
		this.set('position', path.getAt(vertex));
		this.set('path', path);
		this.set('vertex', vertex);
		this.setMap(map);
		this.draw();
	};

	/**
	* Deletes the vertex from the path.
	*/
	DeleteMenu.prototype.removeVertex = function() {
		var self = this;
		
		var path = self.get('path');
		var vertex = self.get('vertex');

		if (!path || vertex == undefined) {
		  self.close();
		  return;
		}

		path.removeAt(vertex);
		self.close();
	};
})(jQuery);