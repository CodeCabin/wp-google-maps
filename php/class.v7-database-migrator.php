<?php

namespace WPGMZA;

class V7DatabaseMigrator
{
	public function __construct()
	{
		
	}
	
	public function migrate()
	{
		global $wpdb;
		
		set_time_limit(-1);
		
		$this->migrateOptions();
		$this->migrateStats();
		$this->migrateMaps();
		$this->migrateMarkers();
		$this->migratePolygons();
		$this->migratePolylines();
	}
	
	protected function migrateOptions()
	{
		$options = get_option('WPGMZA_OTHER_SETTINGS');
		$parsed = maybe_unserialize($options);
		
		$standardised = (object)array();
		
		foreach($parsed as $key => $value)
		{
			$key = preg_replace('/^wpgmza_(settings_)?/', '', $key);
			$standardised->{$key} = $value;
		}
		
		$json = json_encode($standardised);
		update_option('wpgmza_settings', $json);
	}
	
	protected function migrateStats()
	{
		$stats = get_option('wpgmza_stats');
		
		if(empty($stats))
			return;
		
		$stats = maybe_unserialize($stats);
		$statistics = json_encode($stats);
		
		update_option('wpgmza_statistics', $statistics);
	}
	
	protected function migrateMaps()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		$remap_setting_names = array(
			'map_width'				=> 'width',
			'map_height'			=> 'height',
			'map_start_location'	=> 'start_location',
			'map_start_zoom'		=> 'start_zoom',
			'styling_json'			=> 'styling_data',
			'dbox'					=> 'directions_box_enabled',
			'dbox_width'			=> 'directions_box_width',
			'listmarkers'			=> 'list_markers',
			'listmarkers_advanced'	=> 'list_markers_advanced',
			'filterbycat'			=> 'filter_by_category'
		);
		
		$columns = $wpdb->get_results("SHOW COLUMNS FROM $WPGMZA_TABLE_NAME_MAPS");
		$maps = $wpdb->get_results("SELECT * FROM $WPGMZA_TABLE_NAME_MAPS");
		
		foreach($maps as $map)
		{
			$settings = array();
			
			foreach($columns as $col)
			{
				$name = $col->Field;
				
				switch($name)
				{
					case 'id':
					case 'settings':
					case 'title':
					case 'map_title':
					case 'map_start_lat':
					case 'map_start_lng':
					case 'map_width_type':
					case 'map_height_type':
						continue 2;
				}
				
				if(isset($remap_setting_names[$col->Field]))
					$name = $remap_setting_names[$col->Field];
				
				$settings[$name] = $map->{$col->Field};
				
				switch($name)
				{
					case 'width':
					case 'height':
						$settings[$name] .= stripslashes($map->{"map_{$name}_type"});
						break;
						
					case 'styling_data':
						$settings[$name] = json_decode($settings[$name]);
						break;
						
					case 'other_settings':
						if(is_serialized($map->{$name}))
						{
							$data = maybe_unserialize($map->{$name});
							foreach($data as $key => $value)
								$settings[$key] = $value;
						}
						
						unset($settings['other_settings']);
						break;
				}
			}
			
			$wpdb->update(
				$WPGMZA_TABLE_NAME_MAPS,
				array(
					'title'		=> $map->map_title,
					'settings' 	=> json_encode($settings)
				),
				array(
					'id' => $map->id
				)
			);
		}
	}
	
	protected function migrateMarkers()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		$oldtable = $wpdb->prefix . 'wpgmza';
		
		// Copy data into a new table (with _markers prefix)
		$wpdb->query("INSERT INTO $WPGMZA_TABLE_NAME_MARKERS 
			SELECT *,
			NULL,
			PointFromText(CONCAT('POINT(',$oldtable.lng,' ',$oldtable.lat,')'))
			FROM $oldtable 
			ON DUPLICATE KEY UPDATE $WPGMZA_TABLE_NAME_MARKERS.id=$WPGMZA_TABLE_NAME_MARKERS.id
		");
		
		// Convert columns into settings JSON
		$markers = $wpdb->get_results("SELECT * FROM $WPGMZA_TABLE_NAME_MARKERS");
		foreach($markers as $marker)
		{
			$settings = (object)array();
			
			$names = array(
				'description'	=> 'description',
				'pic'			=> 'pic',
				'link'			=> 'link',
				'icon'			=> 'icon',
				'anim'			=> 'animation',
				'title'			=> 'title',
				'infoopen'		=> 'infoopen',
				'retina'		=> 'retina',
				'type'			=> 'type',
				'did'			=> 'deviceID'
			);
			
			foreach($names as $old_key => $new_key)
				if(!empty($marker->{$old_key}))
					$settings->{$new_key} = $marker->{$old_key};
					
			$other_data = maybe_unserialize($marker->other_data);
			if(is_object($other_data) || is_array($other_data))
				foreach($other_data as $key => $value)
					$settings->{$key} = $value;
			
			// TODO: Insert into wpgmza_markers_has_categories
			
			$json = json_encode($settings);
			$stmt = $wpdb->prepare("UPDATE $WPGMZA_TABLE_NAME_MARKERS SET settings=%s WHERE id=%d", array(
				$json,
				$marker->id
			));
			$wpdb->query($stmt);
		}
		
		$auto_increment = $wpdb->get_var("SELECT MAX(id)+1 FROM $WPGMZA_TABLE_NAME_MARKERS");
		$wpdb->query("ALTER TABLE $WPGMZA_TABLE_NAME_MARKERS AUTO_INCREMENT=$auto_increment");
	}
	
	protected function parsePolydata($polydata)
	{
		$parts = preg_split('/[()\s,]/', $polydata, null, PREG_SPLIT_NO_EMPTY);
			
		$coords = array();
		
		// Swap lat/lng
		for($i = 0; $i < count($parts); $i += 2)
		{
			array_push($coords, 
				$parts[$i + 1] . ' ' . $parts[$i]
			);
		}
		
		return $coords;
	}
	
	protected function migratePolygons()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_POLYGONS;
		
		$oldtable = $wpdb->prefix . 'wpgmza_polygon';
		
		// Copy data into a new table (with pluralised name)
		$wpdb->query("INSERT INTO $WPGMZA_TABLE_NAME_POLYGONS 
			SELECT *, NULL, NULL
			FROM $oldtable
			ON DUPLICATE KEY UPDATE $WPGMZA_TABLE_NAME_POLYGONS.id=$WPGMZA_TABLE_NAME_POLYGONS.id
		");
		
		$auto_increment = $wpdb->get_var("SELECT MAX(id)+1 FROM $WPGMZA_TABLE_NAME_POLYGONS");
		$wpdb->query("ALTER TABLE $WPGMZA_TABLE_NAME_POLYGONS AUTO_INCREMENT=$auto_increment");
		
		// Convert polydata text into spatial data polygon
		$oldpolygons = $wpdb->get_results("SELECT id, polydata FROM $oldtable");
		foreach($oldpolygons as $oldpoly)
		{
			$coords = $this->parsePolydata($oldpoly->polydata);
			
			// Close polygon
			array_push($coords, $coords[0]);
			
			$wkt_polygon = 'POLYGON((' . implode(',', $coords) . '))';
			
			$result = $wpdb->query("UPDATE $WPGMZA_TABLE_NAME_POLYGONS SET points=PolygonFromText('$wkt_polygon') WHERE id={$oldpoly->id}");
		}
		
		// Convert columns into settings JSON
		$polygons = $wpdb->get_results("SELECT * FROM $WPGMZA_TABLE_NAME_POLYGONS");
		foreach($polygons as $poly)
		{
			$settings = (object)array(
				'strokeColor'		=> '#' . (empty($poly->linecolor) 	? '000000' : $poly->linecolor),
				'strokeOpacity'		=> 		 (empty($poly->lineopacity) ? '0.5' : $poly->lineopacity),
				'fillColor'			=> '#' . (empty($poly->fillcolor) 	? '66ff00' : $poly->fillcolor),
				'fillOpacity'		=> 		 (empty($poly->opacity) 	? '0.5' : $poly->opacity),
				'hoverStrokeColor'	=> '#' . (empty($poly->ohlinecolor) ? '333333' : $poly->ohlinecolor),
				'hoverFillColor'	=> '#' . (empty($poly->ohfillcolor) ? 'aaff00' : $poly->ohfillcolor),
				'hoverOpacity'		=> 		 (empty($poly->ohopacity)	? '0.75' : $poly->ohopacity),
				
				'title'	=> $poly->title,
				'link'	=> $poly->{'link'}
			);
			$json = json_encode($settings);
			$stmt = $wpdb->prepare("UPDATE $WPGMZA_TABLE_NAME_POLYGONS SET settings=%s WHERE id=%d", array(
				$json,
				$poly->id
			));
			$wpdb->query($stmt);
		}
	}
	
	protected function migratePolylines()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_POLYLINES;
		
		$polylines = $wpdb->get_results("SELECT id, polydata FROM $WPGMZA_TABLE_NAME_POLYLINES");
		foreach($polylines as $line)
		{
			$coords = $this->parsePolydata($line->polydata);
			
			$wkt_linestring = 'LINESTRING(' . implode(',', $coords) . ')';
			
			$result = $wpdb->query("UPDATE $WPGMZA_TABLE_NAME_POLYLINES SET points=LineStringFromText('$wkt_linestring') WHERE id={$line->id}");
		}
		
		$polylines = $wpdb->get_results("SELECT * FROM $WPGMZA_TABLE_NAME_POLYLINES");
		foreach($polylines as $poly)
		{
			$settings = (object)array(
				'strokeColor'		=> '#' . (empty($poly->linecolor) 		? '000000' : $poly->linecolor),
				'strokeOpacity'		=> 		 (empty($poly->lineopacity) 	? '0.5' : $poly->lineopacity),
				'strokeWeight'		=> 		 (empty($poly->linethickness)	? '4' : $poly->linethickness)
			);
			
			$json = json_encode($settings);
			$stmt = $wpdb->prepare("UPDATE $WPGMZA_TABLE_NAME_POLYLINES SET settings=%s WHERE id=%d", array(
				$json,
				$poly->id
			));
			$wpdb->query($stmt);
		}
	}
	
	// TODO: Will have to migrate other tables because useing JSON not maybe_serialize
	
	
}

?>