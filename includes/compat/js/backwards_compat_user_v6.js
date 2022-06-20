jQuery(function($){
	jQuery(document).ready(function(){
		if(typeof wpgmaps_localize !== "undefined"){
			for(var i in wpgmaps_localize){
				var mapid = wpgmaps_localize[i]['id'];
				
				if(window.wpgmza_circle_data_array) {
					window.circle_array = [];
					for(var circle_id in wpgmza_circle_data_array){
						if(wpgmza_circle_data_array[circle_id]['map_id'] === mapid){
							add_circle(mapid, wpgmza_circle_data_array[circle_id]);
						}
					}
				}
				
				if(window.wpgmza_rectangle_data_array) {
					window.rectangle_array = [];
					for(var rectangle_id in wpgmza_rectangle_data_array){
						if(wpgmza_rectangle_data_array[rectangle_id]['map_id'] === mapid){
							add_rectangle(mapid, wpgmza_rectangle_data_array[rectangle_id]);
						}
					}
				}
			}
		}
	});

	function add_circle(mapid, data){
		data.map = MYMAP[mapid].map;
		
		var m = data.center.match(/-?\d+(\.\d*)?/g);
		data.center = new google.maps.LatLng({
			lat: parseFloat(m[0]),
			lng: parseFloat(m[1]),
		});
		
		data.radius = parseFloat(data.radius);
		data.fillColor = data.color;
		data.fillOpacity = parseFloat(data.opacity);
		
		data.strokeOpacity = 0;
		
		var circle = new google.maps.Circle(data);
		circle_array.push(circle);
	}

	function add_rectangle(mapid, data)	{

		var map;

		if(MYMAP[mapid].map instanceof google.maps.Map)
			map = MYMAP[mapid].map;
		else if(MYMAP[mapid].map instanceof WPGMZA.Map)
			map = MYMAP[mapid].googleMap;

		data.map = map;
		
		data.fillColor = data.color;
		data.fillOpacity = parseFloat(data.opacity);
		
		var northWest = data.cornerA;
		var southEast = data.cornerB;
		
		var m = northWest.match(/-?\d+(\.\d+)?/g);
		var north = parseFloat(m[0]);
		var west = parseFloat(m[1]);
		
		m = southEast.match(/-?\d+(\.\d+)?/g);
		var south = parseFloat(m[0]);
		var east = parseFloat(m[1]);
		
		data.bounds = {
			north: north,
			west: west,
			south: south,
			east: east
		};
		
		data.strokeOpacity = 0;
		
		var rectangle = new google.maps.Rectangle(data);
		rectangle_array.push(rectangle);
	}
});