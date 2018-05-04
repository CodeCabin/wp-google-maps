<?php

namespace WPGMZA;

class NominatimGeocodeCache
{
	public function __construct()
	{
		global $wpdb;
		
		$this->table = $wpdb->prefix . "wpgmza_nominatim_geocode_cache";
		
		if(!$wpdb->get_var("SHOW TABLES LIKE '{$this->table}'"))
		{
			require_once(ABSPATH . '/wp-admin/includes/upgrade.php');
			
			\dbDelta("CREATE TABLE {$this->table} (
				id int(11) NOT NULL AUTO_INCREMENT,
				query VARCHAR(512),
				response TEXT,
				PRIMARY KEY  (id)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1");
		}
	}
	
	public function get($query)
	{
		global $wpdb;
		
		// Check the cache first, as per the nominatim usage policy
		$stmt = $wpdb->prepare("SELECT response FROM {$this->table} WHERE query=%s LIMIT 1", array($query));
		
		$stmt = apply_filters( 'wpgmza_osm_nomination_cache_query_get', $stmt, $query );

		return $wpdb->get_var($stmt);
	}
	
	public function set($query, $response)
	{
		global $wpdb;
		
		if(empty($query))
			throw new \Exception("First argument cannot be empty");
				
		$stmt = $wpdb->prepare("INSERT INTO {$this->table} (query, response) VALUES (%s, %s)", array(
			$query,
			$response
		));

		$stmt = apply_filters( 'wpgmza_osm_nomination_cache_query_set', $stmt, $query, $response );

		$wpdb->query($stmt);
	}
}

add_action('wp_ajax_wpgmza_query_nominatim_cache', function() {
	
	$cache = new NominatimGeocodeCache();
	$record = $cache->get($_GET['query']);
	
	if(!$record)
		$record = array();

	wp_send_json($record);
	exit;
	
});
