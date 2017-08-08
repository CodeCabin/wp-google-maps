<?php

namespace WPGMZA;

class V7DatabaseMigrator
{
	public $remap_setting_names = array(
		// General settings
		'iw_type'							=> 'info_window_type',
		'image_resizing'					=> 'info_window_image_resizing',
		'image_width'						=> 'info_window_image_width',
		'image_height'						=> 'info_window_image_height',
		'infowindow_width'					=> 'info_window_width',
		'infowindow_links'					=> 'info_window_link_opens_new_window',
		'infowindow_address'				=> 'info_window_hide_address',
		'infowindow_link_text'				=> 'info_window_link_text',
		'map_open_marker_by'				=> 'info_window_open_by',
					
		'map_type'							=> 'disable_map_type_controls',
		
		// Carousel listing merge
		'carousel_markerlist_title'			=> 'marker_listing_hide_title',
		'carousel_markerlist_icon'			=> 'marker_listing_hide_icon',
		'carousel_markerlist_address'		=> 'marker_listing_hide_address',
		'carousel_markerlist_description'	=> 'marker_listing_hide_description',
		'carousel_markerlist_image'			=> 'marker_listing_hide_pic',
		
		// Marker listing settings		
		'listmarkers_by'					=> 'marker_listing_style',
		'markerlist_icon'					=> 'marker_listing_hide_icon',
		'markerlist_title'					=> 'marker_listing_hide_title',
		'markerlist_address'				=> 'marker_listing_hide_address',
		'markerlist_category'				=> 'marker_listing_hide_categories',
		'markerlist_description'			=> 'marker_listing_hide_description',
		'default_items'						=> 'marker_listing_default_num_items',
		
		'carousel_markerlist_marker_link'	=> 'marker_listing_hide_link',
		'markerlist_directions'				=> 'marker_listing_hide_directions',
	
		// Map specific
		'map_width'							=> 'width',
		'map_height'						=> 'height',
		'map_start_location'				=> 'start_location',
		'map_start_zoom'					=> 'start_zoom',
		'styling_json'						=> 'theme_data',
		'directions'						=> 'directions_box_enabled',
		'directions_enabled'				=> 'directions_box_enabled',
		'dbox'								=> 'directions_box_open_by_default',
		'dbox_width'						=> 'directions_box_width',
		'listmarkers'						=> 'list_markers',
		'listmarkers_advanced'				=> 'list_markers_advanced',
		'filterbycat'						=> 'marker_listing_filter_by_category',
		'store_locator'						=> 'store_locator_enabled',
		'store_locator_bounce'				=> 'store_locator_show_center_icon',
		'store_locator_category'			=> 'store_locator_category_enabled',
		'sl_stroke_color'					=> 'store_locator_stroke_color',
		'sl_fill_color'						=> 'store_locator_fill_color',
		'iw_primary_color'					=> 'info_window_primary_color',
		'iw_accent_color'					=> 'info_window_accent_color',
		'iw_text_color'						=> 'info_window_text_color',
		'transport_layer'					=> 'transport'
	);
	
	public function __construct()
	{
		
	}
	
	public function standardiseName($name)
	{
		return preg_replace('/^wpgmza_(settings_)?/', '', $name);
	}
	
	protected function arrayValuesToKeys($arr)
	{
		$result = array();
		foreach($arr as $val)
			$result[$val] = true;
		return $result;
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
		
		if(!$options)
			return;
		
		$parsed = maybe_unserialize($options);
		$standardised = (object)array();
		
		foreach($parsed as $key => $value)
		{
			$key = $this->standardiseName($key);
			
			if(isset($this->remap_setting_names[$key]))
				$key = $this->remap_setting_names[$key];
			
			$standardised->{$key} = $value;
		}
		
		$standardised->engine = 'google-maps';
		
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
	
	public function migrateMaps($ids=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		$specifiedIDsByKey = array();
		if($ids != null)
			$specifiedIDsByKey = $this->arrayValuesToKeys($ids);
		
		$columns = $wpdb->get_results("SHOW COLUMNS FROM $WPGMZA_TABLE_NAME_MAPS");
		$maps = $wpdb->get_results("SELECT * FROM $WPGMZA_TABLE_NAME_MAPS");
		
		foreach($maps as $map)
		{
			if($ids != null && !array_key_exists($map->id, $specifiedIDsByKey))
				continue; // This map is excluded from migration (used when importing V6 CSV data)
			
			$settings = array();
			
			foreach($columns as $col)
			{
				$name = $col->Field;
				
				// Skip these settings
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
				
				// Rename the setting?
				if(isset($this->remap_setting_names[$col->Field]))
					$name = $this->remap_setting_names[$col->Field];
				
				$settings[$name] = $map->{$col->Field};
				
				// Translate values for these settings into their V7 equivilants
				switch($name)
				{
					case 'width':
					case 'height':
						$value = $map->{"map_{$name}_type"};
						$settings[$name] .= stripslashes($value);
						
						if(empty($settings[$name]))
							$settings[$name] = ($name == 'width' ? '100%' : '400px');
						
						break;
						
					case 'alignment':
						$value = $map->alignment;
						if(empty($value))
							$value = '4';
						$settings['alignment'] = $value;
						break;
						
					case 'bicycle':
					case 'traffic':
						$original = $settings[$name];
						$settings[$name] = ((int)$original == 2 ? 0 : 1);
						break;
						
					case 'directions_box_open_by_default':
						$settings[$name] = (empty($settings[$name]) || $settings[$name] == ? "1" : 0 : 1);
						break;
						
					case 'other_settings':
						if(is_serialized($map->{$name}))
						{
							$data = maybe_unserialize($map->{$name});
							foreach($data as $key => $value)
							{
								$key = $this->standardiseName($key);
								
								// Change name of this setting?
								if(isset($this->remap_setting_names[$key]))
									$key = $this->remap_setting_names[$key];
								
								if($key == 'theme_data')
									$value = stripslashes($value);
							
								if($key == 'transport')
									$value = ((int)$value == 2 ? 0 : 1);
								
								if(preg_match('/color$/', $key))
									$value = '#' . $value;
								
								$settings[$key] = $value;
							}
						}
						
						unset($settings['other_settings']);
						break;
				}
			}
			
			// Map title
			$title = $map->map_title;
			if(empty($title))
				$title = 'Untitled Map';
			
			// Migrate the layout
			$layout = (object)array(
				'order' => array(
					'map'
				),
				'grid' => (object)array()
			);
			
			// Marker listing above?
			if(empty($settings->store_marker_listing_below))
				array_unshift($layout->order, 'marker-listing');
			
			// Store locator above?
			if(empty($settings->store_locator_below))
				array_unshift($layout->order, 'store-locator');
			
			// Directions box above?
			if(!empty($settings->directions_box_placement) && $settings->directions_box_placement == '4')
				array_unshift($layout->order, 'directions-box');
				
			// Directions below?
			if(!empty($settings->store_marker_listing_below) && $settings->store_marker_listing_below)
				array_push($layout->order, 'directions-box');
			
			// Store locator below?
			if(!empty($settings->store_locator_below))
				array_push($layout->order, 'store-locator');
			
			// Marker listing below?
			if(!empty($settings->store_marker_listing_below))
				array_push($layout->order, 'marker-listing');
			
			// Update DB
			$wpdb->update(
				$WPGMZA_TABLE_NAME_MAPS,
				array(
					'title'		=> $title,
					'settings' 	=> json_encode($settings)
				),
				array(
					'id' => $map->id
				)
			);
		}
	}
	
	public function migrateMarkers($ids=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		$specifiedIDsByKey = array();
		if($ids != null)
			$specifiedIDsByKey = $this->arrayValuesToKeys($ids);
		
		$oldtable = $wpdb->prefix . 'wpgmza';
		
		if($ids == null)
		{
			// Copy data into a new table (with _markers prefix)
			if($wpdb->query("INSERT INTO $WPGMZA_TABLE_NAME_MARKERS 
				SELECT id, map_id, address, description, pic, link, icon, title, approved, NULL,
				PointFromText(CONCAT('POINT(',$oldtable.lng,' ',$oldtable.lat,')'))
				FROM $oldtable 
				ON DUPLICATE KEY UPDATE $WPGMZA_TABLE_NAME_MARKERS.id=$WPGMZA_TABLE_NAME_MARKERS.id
			") === false)
				throw new \Exception($wpdb->last_error . ' (' . $wpdb->last_query . ')');
		}
		else
		{
			// Partial migrate. Don't copy from old table, but do update spatial data for specified markers
			$placeholders = implode(',', array_fill(0, count($ids), "%d"));
			
			$query = "UPDATE $WPGMZA_TABLE_NAME_MARKERS
				SET latlng=PointFromText(
					CONCAT('POINT(', lat, ' ', lng, ')')
				)
				WHERE id IN (
					$placeholders
				)
			";
			
			$stmt = $wpdb->prepare($query, $ids);
			if($wpdb->query($stmt) === false)
				throw new \Exception($wpdb->last_error . ' (' . $wpdb->last_query . ')');
		}
		
		// Convert columns into settings JSON
		$markers = $wpdb->get_results("SELECT * FROM $oldtable");
		foreach($markers as $marker)
		{
			if($ids != null && !array_key_exists($marker->id, $specifiedIDsByKey))
				continue; // This marker is excluded from migration
			
			$settings = (object)array();
			
			$names = array(
				'anim'			=> 'animation',
				'did'			=> 'deviceID'
			);
			
			foreach($names as $old_key => $new_key)
				if(!empty($marker->{$old_key}))
					$settings->{$new_key} = $marker->{$old_key};
					
			$other_data = maybe_unserialize($marker->other_data);
			if(is_object($other_data) || is_array($other_data))
				foreach($other_data as $key => $value)
					$settings->{$key} = $value;
					
			// Unset "0", this was creeping in somewhere in V6. Begone
			if(isset($settings->{"0"}))
				unset($settings->{"0"});
			
			$json = json_encode($settings);
			$stmt = $wpdb->prepare("UPDATE $WPGMZA_TABLE_NAME_MARKERS SET settings=%s WHERE id=%d", array(
				$json,
				$marker->id
			));
			if($wpdb->query($stmt) === false)
				throw new \Exception($wpdb->last_error . ' (' . $wpdb->last_query . ')');
		}
		
		$auto_increment = $wpdb->get_var("SELECT MAX(id)+1 FROM $WPGMZA_TABLE_NAME_MARKERS");
		$wpdb->query("ALTER TABLE $WPGMZA_TABLE_NAME_MARKERS AUTO_INCREMENT=$auto_increment");
	}
	
	public static function parsePolydata($polydata)
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
	
	public static function migratePolygonSettings($poly)
	{
		return (object)array(
			'strokeColor'		=> '#' . (empty($poly->linecolor) 	? '000000' : $poly->linecolor),
			'strokeOpacity'		=> 		 (empty($poly->lineopacity) ? '0.5' : $poly->lineopacity),
			'fillColor'			=> '#' . (empty($poly->fillcolor) 	? '66ff00' : $poly->fillcolor),
			'fillOpacity'		=> 		 (empty($poly->opacity) 	? '0.5' : $poly->opacity),
			'hoverStrokeColor'	=> '#' . (empty($poly->ohlinecolor) ? '333333' : $poly->ohlinecolor),
			'hoverFillColor'	=> '#' . (empty($poly->ohfillcolor) ? 'aaff00' : $poly->ohfillcolor),
			'hoverOpacity'		=> 		 (empty($poly->ohopacity)	? '0.75' : $poly->ohopacity)
		);
	}
	
	protected function migratePolygons($ids=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_POLYGONS;
		
		$specifiedIDsByKey = array();
		if($ids != null)
			$specifiedIDsByKey = $this->arrayValuesToKeys($ids);
		
		$oldtable = $wpdb->prefix . 'wpgmza_polygon';
		
		if($ids == null)
		{
			// Copy data into a new table (with pluralised name)
			if($wpdb->query("INSERT INTO $WPGMZA_TABLE_NAME_POLYGONS 
				SELECT id, map_id, polyname, title, link, NULL, NULL
				FROM $oldtable
				ON DUPLICATE KEY UPDATE $WPGMZA_TABLE_NAME_POLYGONS.id=$WPGMZA_TABLE_NAME_POLYGONS.id
			") === false)
				throw new \Exception($wpdb->last_error . ' (' . $wpdb->last_query . ')');
			
			// Update auto_increment
			$auto_increment = $wpdb->get_var("SELECT MAX(id)+1 FROM $WPGMZA_TABLE_NAME_POLYGONS");
			$wpdb->query("ALTER TABLE $WPGMZA_TABLE_NAME_POLYGONS AUTO_INCREMENT=$auto_increment");
		}
		
		// Convert polydata text into spatial data polygon
		$query = "SELECT id, polydata FROM ";
		
		if($ids == null)
			$query .= $oldtable;
		else
		{
			$placeholders = implode(',', array_fill(0, count($ids), '%d'));
			
			$query .= "$WPGMZA_TABLE_NAME_POLYGONS WHERE id IN ($placeholders)";
			$query = $wpdb->prepare($query, $ids);
		}
		
		$oldpolygons = $wpdb->get_results($query);
		foreach($oldpolygons as $oldpoly)
		{
			$coords = V7DatabaseMigrator::parsePolydata($oldpoly->polydata);
			
			// Close polygon
			array_push($coords, $coords[0]);

			// TODO: Potential injection here when importing CSV V6 data
			$wkt_polygon = 'POLYGON((' . implode(',', $coords) . '))';
			
			if($wpdb->query("UPDATE $WPGMZA_TABLE_NAME_POLYGONS SET points=PolygonFromText('$wkt_polygon') WHERE id={$oldpoly->id}") === false)
				throw new \Exception($wpdb->last_error . ' (' . $wpdb->last_query . ')');
		}
		
		// Convert columns into settings JSON
		$query = "SELECT * FROM $WPGMZA_TABLE_NAME_POLYGONS";
		if($ids != null)
		{
			$query .= " WHERE id IN ($placeholders)";
			$query = $wpdb->prepare($query, $ids);
		}
		
		$polygons = $wpdb->get_results($query);
		foreach($polygons as $poly)
		{
			$settings = V7DatabaseMigrator::migratePolygonSettings($poly);
			$json = json_encode($settings);
			$stmt = $wpdb->prepare("UPDATE $WPGMZA_TABLE_NAME_POLYGONS SET settings=%s WHERE id=%d", array(
				$json,
				$poly->id
			));
			if($wpdb->query($stmt) === false)
				throw new \Exception($wpdb->last_error . ' (' . $wpdb->last_query . ')');
		}
	}
	
	public static function migratePolylineSettings($poly)
	{
		return (object)array(
			'strokeColor'		=> '#' . (empty($poly->linecolor) 		? '000000' : $poly->linecolor),
			'strokeOpacity'		=> 		 (empty($poly->lineopacity) 	? '0.5' : $poly->lineopacity),
			'strokeWeight'		=> 		 (empty($poly->linethickness)	? '4' : $poly->linethickness)
		);
	}
	
	protected function migratePolylines($ids=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_POLYLINES;
		
		// Convert spatial data first
		$query = "SELECT id, polydata FROM $WPGMZA_TABLE_NAME_POLYLINES";
		
		if($ids != null)
		{
			$placeholders = implode(',', array_fill(0, count($ids), "%d"));
			$query .= " WHERE id IN ($placeholders)";
			$query = $wpdb->prepare($query, $ids);
		}
		
		$polylines = $wpdb->get_results($query);
		foreach($polylines as $line)
		{
			$coords = V7DatabaseMigrator::parsePolydata($line->polydata);
			
			// TODO: Potential injection here when converting V6 CSV data
			$wkt_linestring = 'LINESTRING(' . implode(',', $coords) . ')';
			
			if($wpdb->query("UPDATE $WPGMZA_TABLE_NAME_POLYLINES SET points=LineStringFromText('$wkt_linestring') WHERE id={$line->id}") === false)
				throw new \Exception($wpdb->last_error . ' (' . $wpdb->last_query . ')');
		}
		
		// Now convert columns to settings
		$query = "SELECT * FROM $WPGMZA_TABLE_NAME_POLYLINES";
		
		if($ids != null)
		{
			$query .= " WHERE id IN ($placeholders)";
			$query = $wpdb->prepare($query, $ids);
		}
		
		$polylines = $wpdb->get_results($query);
		foreach($polylines as $poly)
		{
			$settings = V7DatabaseMigrator::migratePolylineSettings($poly);
			
			$json = json_encode($settings);
			$stmt = $wpdb->prepare("UPDATE $WPGMZA_TABLE_NAME_POLYLINES SET settings=%s WHERE id=%d", array(
				$json,
				$poly->id
			));
			if($wpdb->query($stmt) === false)
				throw new \Exception($wpdb->last_error . ' (' . $wpdb->last_query . ')');
		}
	}
}

?>