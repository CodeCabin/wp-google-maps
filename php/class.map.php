<?php

namespace WPGMZA;

use Smart;

class Map extends Smart\Document
{
	public $id;
	public $title;
	public $settings;
	
	public function __construct($id)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		Smart\Document::__construct();
		
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

		// Pass data to Javascript
		$this->documentElement->setAttribute('data-map-id', $this->id);
		$this->documentElement->setAttribute('data-settings', json_encode($this->settings));

		// Global Settings
		$data = clone Plugin::$settings;
		if(is_admin())
			$data->ajaxurl = admin_url('admin-ajax.php');
		wp_localize_script('wpgmza-map', 'WPGMZA_global_settings', Plugin::$settings);
	}
	
	/**
	 * Fetches all markers, polygons and polylines within the specified bounds
	 * @return object
	 */
	public function fetch($bounds, $session_id=null)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		if(empty(session_id()))
			session_start();
		
		if(!isset($_SESSION['wpgmza_map-session-id']) || $session_id != $_SESSION['wpgmza_map-session-id'])
		{
			$_SESSION['wpgmza_transmitted-ids'] = array();
			$_SESSION['wpgmza_map-session-id'] = $session_id;
		}
		
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
		if(!empty($_SESSION['wpgmza_transmitted-ids']))
			$qstr .= ' AND id NOT IN (' . implode(',', $_SESSION['wpgmza_transmitted-ids']) . ')';
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
			array_push($_SESSION['wpgmza_transmitted-ids'], $m->id);
		}
		
		$results = (object)array(
			'markers'	=> $markers
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