<?php

namespace WPGMZA;

class NominatimGeocodeCache
{
	public function __construct()
	{
		global $wpdb;
		
		$this->table = $wpdb->prefix . "wpgmza_nominatim_geocode_cache";
		
		require_once(ABSPATH . '/wp-admin/includes/upgrade.php');
		
		\dbDelta("CREATE TABLE {$this->table} (
			id int(11) NOT NULL AUTO_INCREMENT,
			query VARCHAR(512),
			response TEXT,
			PRIMARY KEY  (id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1");
	}
	
	public function get($query)
	{
		global $wpdb;
		
		// Check the cache first, as per the nominatim usage policy
		$stmt = $wpdb->prepare("SELECT response FROM {$this->table} WHERE query=%s LIMIT 1", array($query));
		
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
		$wpdb->query($stmt);
	}
}

?>