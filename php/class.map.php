<?php

namespace WPGMZA;

use Smart;

require_once(WPGMZA_DIR . '/php/class.marker-table.php');

class Map extends Smart\Document
{
	// TODO: Make all these private and expose them through __get and __set
	public $id;
	public $title;
	public $settings;
	public $tables;
	
	public function __construct($id)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		Smart\Document::__construct();
		
		$this->enqueueScripts();
		
		$this->loadXML('<div class="wpgmza-map"></div>');
		
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

		// Init tables
		$this->loadTables();
		
		// Pass data to Javascript
		$this->documentElement->setAttribute('data-map-id', $this->id);
		$this->documentElement->setAttribute('data-settings', json_encode($this->settings));
	}
	
	/**
	 * Static method to enqueue any scripts the map needs, front or backend
	 * @return void
	 */
	public function enqueueScripts()
	{
		// Map scripts
		wp_enqueue_script('wpgmza-event-dispatcher', WPGMZA_BASE . 'lib/eventDispatcher.min.js');
		
		wp_enqueue_script('wpgmza-map', WPGMZA_BASE . 'js/map.js', array(
			'jquery',
			'wpgmza-event-dispatcher'
		));
		wp_enqueue_script('wpgmza-marker', WPGMZA_BASE . 'js/marker.js', array(
			'wpgmza-map'
		));
		wp_enqueue_script('wpgmza-polygon', WPGMZA_BASE . 'js/polygon.js', array(
			'wpgmza-map'
		));
		wp_enqueue_script('wpgmza-polyline', WPGMZA_BASE . 'js/polyline.js', array(
			'wpgmza-map'
		));
		
		wp_enqueue_script('wpgmza-map-settings', WPGMZA_BASE . 'js/map-settings.js', array(
			'wpgmza-map'
		));
		
		// Global Settings
		if(!defined('WPGMZA_FAST_AJAX'))
		{
			$data = clone Plugin::$settings;
			
			$data->ajaxurl 		= admin_url('admin-ajax.php');
			$data->fast_ajaxurl	= WPGMZA_BASE . 'php/ajax.fetch.php';
			
			wp_localize_script('wpgmza-map', 'WPGMZA_global_settings', $data);
		}
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
		if(!empty($_SESSION['wpgmza_transmitted-marker-ids']))
			$qstr .= ' AND id NOT IN (' . implode(',', $_SESSION['wpgmza_transmitted-marker-ids']) . ')';
		else
			$_SESSION['wpgzma_transmitted-ids'] = array();
		
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
			array_push($_SESSION['wpgmza_transmitted-marker-ids'], $m->id);
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
		{
			$p->settings = json_decode($p->settings);
			array_push($_SESSION['wpgmza_transmitted-polygon-ids'], $p->id);
		}
			
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
		{
			$p->settings = json_decode($p->settings);
			array_push($_SESSION['wpgmza_transmitted-polyline-ids'], $p->id);
		}
			
		return $polylines;
	}
	
	/**
	 * Fetches all markers, polygons and polylines within the specified bounds
	 * @return object
	 */
	public function fetch($bounds, $session_id=null)
	{
		if(empty(session_id()))
			session_start();
		
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
	
	/**
	 * Saves map to database
	 * @return void
	 */
	public function save($file)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		// TODO: Check privledges here
		
		$stmt = $wpdb->prepare("UPDATE $WPGMZA_TABLE_NAME_MAPS SET title=%s, settings=%s WHERE id=%d", array(
			$this->title,
			json_encode($this->settings),
			$this->id
		));
		$wpdb->query($stmt);
	}
}

?>