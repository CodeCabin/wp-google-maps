<?php

namespace WPGMZA;

use Smart;

require_once(WPGMZA_DIR . '/php/class.marker.php');
require_once(WPGMZA_DIR . '/php/class.polygon.php');
require_once(WPGMZA_DIR . '/php/class.polyline.php');
require_once(WPGMZA_DIR . '/php/class.marker-table.php');

class Map extends Smart\Document
{
	// TODO: Make all these private and expose them through __get and __set
	public $id;
	public $title;
	public $settings;
	public $tables;
	
	public $shortcode_atts = array();
	
	public function __construct($id, $shortcode_atts=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		Smart\Document::__construct();
		
		$this->shortcode_atts = $shortcode_atts;
		
		$this->enqueueScripts();
		
		$this->loadPHPFile(WPGMZA_DIR . 'html/map.html.php');
		$this->root = $this->querySelector('.wpgmza-map');
		
		// Fetch map data from database
		$stmt = $wpdb->prepare("SELECT id, title, settings FROM $WPGMZA_TABLE_NAME_MAPS WHERE id=%d", array($id));
		$results = $wpdb->get_results($stmt);
		
		if(empty($results))
			throw new \Exception('Map not found');
			
		$obj = $results[0];
		
		$this->id 			= $obj->id;
		$this->title 		= $obj->title;
		$this->shortcode 	= "[wpgmza id=\"{$this->id}\"]";
		
		// Load settings
		$this->settings 	= json_decode($obj->settings);
		if(!$this->settings)
			$this->settings = Map::getDefaultSettings();
		
		// Override settings with shortcode attributes
		$this->handleParameters($shortcode_atts);

		// Add the store locator
		if(!empty($this->settings->store_locator_enabled))
			$this->addStoreLocator($this);
		
		// Init tables
		$this->loadTables();
		
		// Get ID ranges for marker labels
		$stmt = $wpdb->prepare("SELECT id FROM $WPGMZA_TABLE_NAME_MARKERS WHERE map_id=%d", array($id));
		$ids = $wpdb->get_col($stmt);
		$range = $this->encodeIDs($ids);
		$this->root->setAttribute('data-marker-id-ranges', $range);
		
		// Pass data to Javascript
		$this->root->setAttribute('data-map-id', $this->id);
		$this->root->setAttribute('data-settings', json_encode($this->settings));
		
		if(!empty($shortcode_atts))
			$this->root->setAttribute('data-shortcode-attributes', json_encode($shortcode_atts));
	}
	
	public static function getDefaultSettings()
	{
		return (object)array(
			'width'						=> apply_filters( 'wpgmza_map_default_settings_width', '100%' ),
			'height'					=> apply_filters( 'wpgmza_map_default_settings_height', '400px' ),
			'start_location'			=> apply_filters( 'wpgmza_map_default_settings_start_location', '51.29091499999999,-2.920355500143068' ),
			'start_zoom'				=> apply_filters( 'wpgmza_map_default_settings_start_zoom', '2' ),
			'alignment'					=> apply_filters( 'wpgmza_map_default_settings_alignment', '4' ),
			'show_points_of_interest'	=> apply_filters( 'wpgmza_map_default_settings_show_poi', '1 ' )
		);
	}
	
	/**
	 * This function handles shortcode attributes
	 * @return void
	 */
	protected function handleParameters($shortcode_atts)
	{
		if(!$shortcode_atts)
			return;
		
		// TODO: Use remap from the migrator class
		$remap = array(
			'zoom'					=> 'start_zoom',
			'enable_directions'		=> 'directions_box_enabled',
			'enable_category'		=> 'store_locator_enabled'
		);
		
		foreach($shortcode_atts as $key => $value)
		{
			if(isset($remap[$key]))
				$this->settings->{$remap[$key]} = $value;
			else
				$this->settings->{$key} = $value;
		}
		
		if(isset($shortcode_atts['marker']))
			$this->setCenterByMarkerID($shortcode_atts['marker']);
		
		if(isset($shortcode_atts['lat']) && isset($shortcode_atts['lng']))
			$this->settings->start_location = $shortcode_atts['lat'] . "," . isset($shortcode_atts['lng']);
	}
	
	/**
	 * Sets the start location by marker ID
	 * @return boolean false if the marker ID is not found
	 */
	protected function setCenterByMarkerID($markerID)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		$stmt = $wpdb->prepare("SELECT X(latLng) AS lng, Y(latLng) AS lat FROM $WPGMZA_TABLE_NAME_MARKERS WHERE id=%d", array($markerID));
		$results = $wpdb->get_results($stmt);
		if(!empty($results))
		{
			$this->settings->start_location = "{$results[0]->lat},{$results[0]->lng}";
			return true;
		}
		
		return false;
	}
	
	/**
	 * Enqueue any scripts the map needs, front or backend
	 * @return void
	 */
	public function enqueueScripts()
	{
		wp_enqueue_script('jquery');
		
		// Dependencies
		wp_enqueue_script('wpgmza-resize-sensor', WPGMZA_BASE . 'lib/ResizeSensor.js');
		
		// Map scripts
		wp_enqueue_script('wpgmza-event', WPGMZA_BASE . 'js/event.js');
		wp_enqueue_script('wpgmza-event-dispatcher', WPGMZA_BASE . 'js/event-dispatcher.js');
	
		wp_enqueue_script('wpgmza-map-settings', WPGMZA_BASE . 'js/map-settings.js', array(
			'wpgmza-core'
		));
		
		wp_enqueue_script('wpgmza-map', WPGMZA_BASE . 'js/map.js', array(
			'wpgmza-event-dispatcher'
		));
		wp_enqueue_script('wpgmza-map-object', WPGMZA_BASE . 'js/map-object.js', array(
			'wpgmza-event-dispatcher'
		));
		wp_enqueue_script('wpgmza-marker', WPGMZA_BASE . 'js/marker.js', array(
			'wpgmza-map',
			'wpgmza-map-object'
		));
		wp_enqueue_script('wpgmza-polygon', WPGMZA_BASE . 'js/polygon.js', array(
			'wpgmza-map',
			'wpgmza-map-object'
		));
		wp_enqueue_script('wpgmza-polyline', WPGMZA_BASE . 'js/polyline.js', array(
			'wpgmza-map',
			'wpgmza-map-object'
		));
		
		wp_enqueue_script('wpgmza-geocoder', WPGMZA_BASE . 'js/geocoder.js', array(
			'wpgmza-core'
		));
		
		wp_enqueue_script('wpgmza-info-window', WPGMZA_BASE . 'js/info-window.js', array(
			'wpgmza-core'
		));
		
		wp_enqueue_style('wpgmza_v7_style', WPGMZA_BASE . 'css/v7-style.css');
		if(!empty(Plugin::$settings->custom_css))
			wp_add_inline_style('wpgmza_v7_style', Plugin::$settings->custom_css);
		
		wp_enqueue_script('wpgmza_v7_custom_script', WPGMZA_BASE . 'js/v7-custom-script.js', array('wpgmza-core'));
		if(!empty(Plugin::$settings->custom_js))
			wp_add_inline_script('wpgmza_v7_custom_script', Plugin::$settings->custom_js);

		// FontAwesome
		wp_register_style('fontawesome', WPGMZA_BASE . 'css/font-awesome.min.css');
		wp_enqueue_style('fontawesome');
	
		// Datatables
		wp_enqueue_style('wpgmza_admin_datatables_style', WPGMZA_BASE . 'css/data_table.css',array(),(string)Plugin::$version.'b');

		do_action( 'wpgmza_enqueue_map_scripts_admin_frontend' );

	}
	
	/**
	 * Adds the store locator
	 * @return void
	 */
	protected function addStoreLocator()
	{
		// Load store locator
		require_once(WPGMZA_DIR . 'php/class.store-locator.php');
		
		$storeLocator = new StoreLocator($this);
		$storeLocator->populate($this->settings);
		
		$this->querySelector('.wpgmza-map')->import($storeLocator);
	}
	
	/**
	 * Load tables, if we're on the admin page (other conditions on pro version)
	 * @return void
	 */
	protected function loadTables()
	{
		if(!is_admin())
			return;
		
		$this->tables = (object)array(
			'marker'	=> new MarkerTable($this)
		);
	}
	
	/**
	 * Encodes an array of IDs into a compact form
	 * @return string
	 */
	protected function encodeIDs($ids)
	{
		if(empty($ids))
			return "";
		
		$len = count($ids);
		$prev = null;
		$parts = array();
		$range = null;
		$result = '';
		
		for($i = 0; $i < $len; $i++)
		{
			$value = $ids[$i];
			
			if($prev === null || $value > $prev + 1)
			{
				// Start new range
				$range = (object)array(
					'start' => $value,
					'end' => $value
				);
				$parts[] = $range;
			}
			else
			{
				// Continue existing range
				$parts[count($parts) - 1]->end = $value;
			}
			
			$prev = $value;
		}
		
		foreach($parts as $range)
		{
			if($range->start == $range->end)
				$result .= base_convert($range->start, 10, 36);
			else
				$result .= base_convert($range->start, 10, 36) . '-' . base_convert($range->end, 10, 36);
			$result .= ',';
		}
		
		return rtrim($result, ',');
	}
	
	/**
	 * Returns the map_id part of the WHERE clause for fetch functions
	 * @return string
	 */
	protected function getFetchWhereClause($table, $options=null)
	{
		return "map_id=" . (int)$this->id;
	}
	
	/**
	 * Fetches all markers within specified bounds, that haven't been fetched already in this session
	 * @return array
	 */
	protected function fetchMarkers($bounds, $session_id=null, $options=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;

		$exclusions = array();
		
		if(isset($_SESSION['wpgmza_transmitted-marker-ids']))
		{
			// A session ID is created for each page visit, so that we know which markers have been transmitted already. If $session_id doesn't match the one we have stored, forget the old session, and start a fresh new one
			if($_SESSION['wpgmza_map-session-id'] != $session_id)
			{
				unset($_SESSION['wpgmza_transmitted-marker-ids']);
				$_SESSION['wpgmza_map-session-id'] = $session_id;
			}
			else
			{
				$deflated = $_SESSION['wpgmza_transmitted-marker-ids'];
				
				$exclusionsString = gzinflate($deflated);	// Keep this string handy so we don't have to implode it into the query
				
				if(!empty($exclusionsString))
					$exclusions = explode(',', $exclusionsString);
			}
		}
		
		/* 
		The following statement will fetch all markers between specified latitude, and longitude even if the longitude crosses the 180th meridian / anti-meridian
		*/
		$clauseArray = array(
			$this->getFetchWhereClause($WPGMZA_TABLE_NAME_MARKERS, $options)
		);
		
		if(is_admin())
			$clauseArray[] = 'approved = 1';
		
		if(empty(Plugin::$settings->load_all_markers))
			$clauseArray[] = "(CASE WHEN CAST(%s AS DECIMAL(11,7)) < CAST(%s AS DECIMAL(11,7))
				THEN X(latlng) BETWEEN CAST(%s AS DECIMAL(11,7)) AND CAST(%s AS DECIMAL(11,7))
				ELSE X(latlng) NOT BETWEEN CAST(%s AS DECIMAL(11,7)) AND CAST(%s AS DECIMAL(11,7))
			END)
			AND Y(latlng) BETWEEN CAST(%s AS DECIMAL(11,7)) AND CAST(%s AS DECIMAL(11,7))";
		
		$clauses = implode(' AND ', $clauseArray);

		$qstr = "SELECT *, Y(latlng) AS lat, X(latlng) AS lng 
			FROM $WPGMZA_TABLE_NAME_MARKERS
			WHERE $clauses
			";

		$params = array();

		if ( empty( Plugin::$settings->load_all_markers ) ) {
			$lat1 = $bounds[0];
			$lng1 = $bounds[1];
			$lat2 = $bounds[2];
			$lng2 = $bounds[3];
			
			array_push( $params,
				$lng1,
				$lng2,
				$lng1,
				$lng2,
				$lng1,
				$lng2,
				$lat1,
				$lat2
			);

		}
		
		// If we've got a list of markers that have already been transmitted, don't send them again
		if(!empty($exclusionsString))
			$qstr .= ' AND id NOT IN (' . $exclusionsString . ')';
		
		$stmt = $wpdb->prepare($qstr, $params);
		$markers = $wpdb->get_results($stmt);
		
		foreach($markers as $m)
		{
			// Unset empty fields to save bandwidth
			foreach($m as $key => $value)
				if(empty($value))
					unset($m->{$key});
				
			// Unset latlng spatial field because it breaks json_encode
			unset($m->latlng);
			
			// Remember we have sent this marker already
			array_push($exclusions, $m->id);
		}
		
		if(!empty($exclusions))
		{
			$string = implode(',', $exclusions);		
			$_SESSION['wpgmza_transmitted-marker-ids'] = gzdeflate($string);
		}
		
		return $markers;
	}
	
	/**
	 * Fetches all polygons
	 * TODO: Optimize by only fetching polygons within bounds
	 * @return array
	 */
	protected function fetchPolygons($bounds, $session_id=null, $options=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_POLYGONS;
		
		$mapIDClause = $this->getFetchWhereClause($WPGMZA_TABLE_NAME_POLYGONS, $options);
		
		$qstr = "SELECT id, name, title, link, AsText(points) AS points, settings FROM $WPGMZA_TABLE_NAME_POLYGONS WHERE $mapIDClause";			

		if(!empty($_SESSION['wpgmza_transmitted-polygon-ids']))
			$qstr .= " AND id NOT IN (" . implode(',', $_SESSION['wpgmza_transmitted-polygon-ids']) . ")";
		
		$qstr = apply_filters( 'wpgmza_basic_polygon_sql_query', $qstr );
		
		$polygons = $wpdb->get_results($qstr);
		
		foreach($polygons as $polygon)
			array_push($_SESSION['wpgmza_transmitted-polygon-ids'], $polygon->id);
			
		return $polygons;
	}
	
	/**
	 * Fetches all polylines
	 * TODO: Optimize by only fetching polylines within bounds
	 * @return array
	 */
	protected function fetchPolylines($bounds, $session_id=null, $options=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_POLYLINES;
		
		$mapIDClause = $this->getFetchWhereClause($WPGMZA_TABLE_NAME_POLYLINES, $options);
		
		$qstr = "SELECT id, title, AsText(points) AS points, settings FROM $WPGMZA_TABLE_NAME_POLYLINES WHERE $mapIDClause";
		
		if(!empty($_SESSION['wpgmza_transmitted-polyline-ids']))
			$qstr .= " AND id NOT IN (" . implode(',', $_SESSION['wpgmza_transmitted-polyline-ids']) . ")";
		
		$qstr = apply_filters( 'wpgmza_basic_polyline_sql_query', $qstr );

		$polylines = $wpdb->get_results($qstr);
		
		foreach($polylines as $polyline)
			array_push($_SESSION['wpgmza_transmitted-polyline-ids'], $polyline->id);
			
		return $polylines;
	}
	
	/**
	 * Starts a new session, forgetting transmitted IDs from the last
	 * @return void
	 */
	protected function sessionStart()
	{
		$_SESSION['wpgmza_transmitted-marker-ids'] = gzdeflate("");
		$_SESSION['wpgmza_transmitted-polygon-ids'] = array();
		$_SESSION['wpgmza_transmitted-polyline-ids'] = array();
	}
	
	/**
	 * Fetches all markers, polygons and polylines within the specified bounds
	 * @return object
	 */
	public function fetch($bounds, $session_id=null, $options=null)
	{
		$php_session_id = session_id();
		if(empty($php_session_id))
			session_start();
		
		// TODO: Turn this back on and figure out why it bugs in functions.php. May be to do with the plugin starting output buffering with POST set, and not with no ob_start. It seems to be one or the other, possibly because the AJAX call uses GET and the dataTables call uses POST
		// ini_set("zlib.output_compression", "On");
		
		if(!isset($_SESSION['wpgmza_map-session-id']) || $session_id != $_SESSION['wpgmza_map-session-id'])
		{
			$_SESSION['wpgmza_map-session-id'] = $session_id;
			$this->sessionStart();
		}
		
		$results = (object)array(
			'markers'	=> $this->fetchMarkers($bounds, $session_id, $options),
			'polygons'	=> $this->fetchPolygons($bounds, $session_id, $options),
			'polylines'	=> $this->fetchPolylines($bounds, $session_id, $options)
		);
		
		return $results;
	}
	
	protected function getClassFromPlural($plural)
	{
		return __NAMESPACE__ . '\\' . ucfirst(
			rtrim($plural, 's')
		);
	}
	
	/**
	 * Saves map to database
	 * @return void
	 */
	public function save($map_object_data)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		// TODO: Check your privledges here
		
		$stmt = $wpdb->prepare("UPDATE $WPGMZA_TABLE_NAME_MAPS SET title=%s, settings=%s WHERE id=%d", array(
			$this->title,
			json_encode($this->settings),
			$this->id
		));
		$wpdb->query($stmt);
		
		// Create and update
		foreach($map_object_data as $key => &$arr)
		{
			switch($key)
			{
				case 'markers':
				case 'polygons':
				case 'polylines':
				case 'heatmaps':
					$class = $this->getClassFromPlural($key);
				
					foreach($arr as &$data)
					{
						// Set write only so the instance doesn't waste cycles fetching the object
						$data->write_only = true;
						
						// If we're creating this object, assign map_id
						if($data->id == -1)
							$data->map_id = $this->id;
						
						$instance = new $class((array)$data);
						
						// Only call save if we haven't just INSERTed, because the "create" method will have inserted/updated the data already
						if($data->id != -1)
							$instance->save();
						else
							$data->id = $instance->id;	// Remember the ID on our form data for inserting many-to-many relationships
					}
					break;
				
				default:
					break;
			}
		}
		
		// For some reason, this has to be cast to an array or else only the first element will be iterated over
		foreach((array)$map_object_data->deleteIDs as $key => $arr)
		{
			$class = $this->getClassFromPlural($key);
			
			foreach($arr as $id)
			{
				$instance = new $class(array(
					'id' => $id,
					'write_only' => true
				));
				$instance->remove();
			}
		}
	}
	
	protected function applyFilters()
	{
		apply_filters('wpgmza_output_filter', $this);
	}
	
	public function saveInnerBody()
	{
		$this->applyFilters();
		
		return Smart\Document::saveInnerBody();
	}
}

?>