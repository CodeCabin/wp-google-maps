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
	
	public function __construct($id, $shortcode_atts=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		Smart\Document::__construct();
		
		$this->enqueueScripts();
		
		$this->loadPHPFile(WPGMZA_DIR . 'html/map.html');
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
		$this->settings 	= json_decode($obj->settings);

		// Load store locator
		$storeLocator = new Smart\Document();
		$storeLocator->loadPHPFile(WPGMZA_DIR . 'html/store-locator.html');
		$storeLocator->populate($this->settings);
		$this->querySelector(".store-locator-container")->import($storeLocator);
		
		// Init tables
		$this->loadTables();
		
		// Pass data to Javascript
		$this->root->setAttribute('data-map-id', $this->id);
		$this->root->setAttribute('data-settings', json_encode($this->settings));
		if(!empty($shortcode_atts))
			$this->root->setAttribute('data-shortcode-attributes', json_encode($shortcode_atts));
	}
	
	public function loadGoogleMaps()
	{
		if(Plugin::$settings->remove_api)
			return;
		
		// Locale
		$locale = get_locale();
		$suffix = '.com';
		
		switch($locale)
		{
			case 'he_IL':
				// Hebrew correction
				$locale = 'iw';
				break;
			
			case 'zh_CN':
				// Chinese integration
				$suffix = '.cn';
				break;
		}
		
		$locale = substr($locale, 0, 2);
		
		// Default params for google maps
		$params = array(
			'v' 		=> '3.26',
			'key'		=> Plugin::$settings->temp_api,
			'language'	=> $locale
		);
		
		// API Version
		if(!empty(Plugin::$settings->api_version))
			$params['v'] = Plugin::$settings->api_version;
		
		// API Key
		if(!empty(Plugin::$settings->google_maps_api_key))
			$params['key'] = Plugin::$settings->google_maps_api_key;
		
		if(is_admin())
			$params['libraries'] = 'drawing';
		
		wp_enqueue_script('wpgmza_api_call', '//maps.google' . $suffix . '/maps/api/js?' . http_build_query($params));
	}
	
	/**
	 * Enqueue any scripts the map needs, front or backend
	 * @return void
	 */
	public function enqueueScripts()
	{
		$this->loadGoogleMaps();
		
		// Map scripts
		wp_enqueue_script('wpgmza-event-dispatcher', WPGMZA_BASE . 'lib/eventDispatcher.min.js');
	
		wp_enqueue_script('wpgmza-map-settings', WPGMZA_BASE . 'js/map-settings.js', array(
			'wpgmza_api_call',
			'wpgmza-core'
		));
		
		wp_enqueue_script('wpgmza-map', WPGMZA_BASE . 'js/map.js', array(
			'wpgmza-event-dispatcher',
			'wpgmza-map-settings'
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
		wp_enqueue_script('wpgmza-store-locator', WPGMZA_BASE . 'js/store-locator.js', array(
			'wpgmza-map'
		));
		wp_enqueue_script('wpgmza-info-window', WPGMZA_BASE . 'js/info-window.js', array(
			'wpgmza-core'
		));
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
			'marker'	=> new MarkerTable($this->id)
		);
	}
	
	/**
	 * Fetches all markers within specified bounds, that haven't been fetched already in this session
	 * @return array
	 */
	protected function fetchMarkers($bounds, $session_id=null)
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
		$qstr = "SELECT *, Y(latlng) AS lat, X(latlng) AS lng 
			FROM $WPGMZA_TABLE_NAME_MARKERS
			WHERE map_id = %d AND
			approved = 1 AND
			(CASE WHEN CAST(%s AS DECIMAL(11,7)) < CAST(%s AS DECIMAL(11,7))
				THEN X(latlng) BETWEEN CAST(%s AS DECIMAL(11,7)) AND CAST(%s AS DECIMAL(11,7))
				ELSE X(latlng) NOT BETWEEN CAST(%s AS DECIMAL(11,7)) AND CAST(%s AS DECIMAL(11,7))
			END)
			
			AND Y(latlng) BETWEEN CAST(%s AS DECIMAL(11,7)) AND CAST(%s AS DECIMAL(11,7))";
		
		$lat1 = $bounds[0];
		$lng1 = $bounds[1];
		$lat2 = $bounds[2];
		$lng2 = $bounds[3];
		
		$params = array(
			$this->id,
			$lng1,
			$lng2,
			$lng1,
			$lng2,
			$lng1,
			$lng2,
			$lat1,
			$lat2
		);
		
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
	protected function fetchPolygons($bounds, $session_id=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_POLYGONS;
		
		$exclusions = array();
		
		$qstr = "SELECT id, polyname AS name, AsText(points) AS points, settings FROM $WPGMZA_TABLE_NAME_POLYGONS";
		
		if(!empty($_SESSION['wpgmza_transmitted-polygon-ids']))
			$qstr .= " WHERE id NOT IN (" . implode(',', $_SESSION['wpgmza_transmitted-polygon-ids']) . ")";
		
		$polygons = $wpdb->get_results($qstr);
		
		foreach($polygons as $p)
			array_push($_SESSION['wpgmza_transmitted-polygon-ids'], $p->id);
			
		return $polygons;
	}
	
	/**
	 * Fetches all polylines
	 * TODO: Optimize by only fetching polylines within bounds
	 * @return array
	 */
	protected function fetchPolylines($bounds, $session_id=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_POLYLINES;
		
		$exclusions = array();
		
		$qstr = "SELECT id, polyname AS name, AsText(points) AS points, settings FROM $WPGMZA_TABLE_NAME_POLYLINES";
		
		if(!empty($_SESSION['wpgmza_transmitted-polyline-ids']))
			$qstr .= " WHERE id NOT IN (" . implode(',', $_SESSION['wpgmza_transmitted-polyline-ids']) . ")";
		
		$polylines = $wpdb->get_results($qstr);
		
		foreach($polylines as $p)
			array_push($_SESSION['wpgmza_transmitted-polyline-ids'], $p->id);
			
		return $polylines;
	}
	
	/**
	 * Fetches all markers, polygons and polylines within the specified bounds
	 * @return object
	 */
	public function fetch($bounds, $session_id=null)
	{
		$php_session_id = session_id();
		if(empty($php_session_id))
			session_start();
		
		ini_set("zlib.output_compression", "On");
		
		if(!isset($_SESSION['wpgmza_map-session-id']) || $session_id != $_SESSION['wpgmza_map-session-id'])
		{
			$_SESSION['wpgmza_transmitted-marker-ids'] = array();
			$_SESSION['wpgmza_transmitted-polygon-ids'] = array();
			$_SESSION['wpgmza_transmitted-polyline-ids'] = array();
			$_SESSION['wpgmza_map-session-id'] = $session_id;
		}
		
		$results = (object)array(
			'markers'	=> $this->fetchMarkers($bounds, $session_id),
			'polygons'	=> $this->fetchPolygons($bounds, $session_id),
			'polylines'	=> $this->fetchPolylines($bounds, $session_id)
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
		foreach($map_object_data as $key => $arr)
		{
			switch($key)
			{
				case 'markers':
				case 'polygons':
				case 'polylines':
					$class = $this->getClassFromPlural($key);
				
					foreach($arr as $data)
					{
						$data->write_only = true;
						if($data->id == -1)
							$data->map_id = $this->id;
						
						$instance = new $class((array)$data);
						
						if($data->id != -1)
							$instance->save();
					}
					break;
				
				default:
					break;
			}
		}
		
		// Delete
		foreach($map_object_data->deleteIDs as $key => $arr)
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
}

?>