
		
			var rectangle;
			var MYMAP = {
					map: null,
					bounds: null
				};
		
			(function($) {
		
				var myLatLng = new google.maps.LatLng(wpgmza_legacy.wpgmza_lat, wpgmza_legacy.wpgmza_lng);
				
				jQuery(function($) {
					function wpgmza_InitMap() {
						
						MYMAP.init('#wpgmza_map', myLatLng, wpgmza_legacy.start_zoom);
					}
					$("#wpgmza_map").css({
						height: wpgmza_legacy.wpgmza_height + wpgmza_legacy.wpgmza_height_type,
						width: wpgmza_legacy.wpgmza_width + wpgmza_legacy.wpgmza_width_type
					});
					wpgmza_InitMap();
					
					
					$("#rectangle_opacity").keyup(function() {
						if(!rectangle)
							return;
						rectangle.setOptions({
							fillOpacity: parseFloat($(event.target).val())
						});
					});
					
					$("#rectangle_color").on("input", function(event) {
						if(!rectangle)
							return;
						rectangle.setOptions({
							fillColor: $(event.target).val()
						});
					});
					
					$("#wpgmaps_add_rectangle_form").on("submit", function(event) {
						
						$("input[name='bounds']").val(rectangle.getBounds().toString());
						
					});
						
				});
				
				MYMAP.init = function(selector, latLng, zoom) {
					
					var self = this;
					
					  var myOptions = {
						zoom: parseInt(zoom),
						center: latLng,
						zoomControl: true,
						panControl: true,
						mapTypeControl: true,
						streetViewControl: true,
						mapTypeId: google.maps.MapTypeId[wpgmza_legacy.wpgmza_map_type]
					  }
					this.map = new google.maps.Map($(selector)[0], myOptions);
					this.bounds = new WPGMZA.LatLngBounds();
					
					google.maps.event.addListener(this.map, "click", function(event) {
						
						if(rectangle)
							rectangle.setMap(null);
						
						var bounds = MYMAP.map.getBounds();
						var northEast = bounds.getNorthEast();
						var southWest = bounds.getSouthWest();
						var center = bounds.getCenter();
						var width = northEast.lng() - southWest.lng();
						var height = northEast.lat() - southWest.lat();
						
						rectangle = new google.maps.Rectangle({
							fillColor: $("input[name='rectangle_color']").val(),
							fillOpacity: $("input[name='rectangle_opacity']").val(),
							bounds: {
								west: center.lng() - width / 4,
								east: center.lng() + width / 4,
								north: center.lat() - height / 4,
								south: center.lat() + height / 4
							},
							strokeOpacity: 0,
							map: self.map,
							draggable: true,
							editable: true
						});
					});
					
					if(window.location.href.match(/edit_rectangle/))
					{
						var m = $("input[name='bounds']").val().match(/-?\d+(\.\d+)?/g);
						
						rectangle = new google.maps.Rectangle({
							fillColor: $("input[name='rectangle_color']").val(),
							fillOpacity: $("input[name='rectangle_opacity']").val(),
							strokeOpacity: 0,
							map: self.map,
							draggable: true,
							editable: true,
							bounds: {
								north: parseFloat(m[0]),
								west: parseFloat(m[1]),
								south: parseFloat(m[2]),
								east: parseFloat(m[3]),
							}
						});
						
					}
					
					setTimeout(function() {
						$("#fit-bounds-to-shape").click();
					}, 500);
				}

			})(jQuery);