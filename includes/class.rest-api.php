<?php

namespace WPGMZA;

class RestAPI
{
	const NS = 'wpgmza/v1';
	
	public function __construct()
	{
		add_action('wp_enqueue_scripts', array($this, 'onEnqueueScripts'));
		add_action('admin_enqueue_scripts', array($this, 'onEnqueueScripts'));
		
		add_action('rest_api_init', array($this, 'onRestAPIInit'));
	}
	
	public function onEnqueueScripts()
	{
		wp_enqueue_script('wp-api');
	}
	
	public function onRestAPIInit()
	{
		register_rest_route(RestAPI::NS, '/markers(\/\d+)?/', array(
			'methods' => 'GET',
			'callback' => array($this, 'markers')
		));
	}
	
	public function markers($request)
	{
		global $wpdb;
		global $wpgmza_tblname;
		
		$route = $request->get_route();
		
		if(preg_match('#/wpgmza/v1/markers/(\d+)#', $route, $m))
		{
			$marker = new Marker($m[1]);
			return $marker;
		}
		
		$results = $wpdb->get_results("SELECT * FROM $wpgmza_tblname");
		
		// TODO: Select all custom field data too, in one query, and add that to the marker data in the following loop. Ideally we could add a bulk get function to the CRUD classes which takes IDs?
		
		foreach($results as $obj)
			unset($obj->latlng);
		
		return $results;
	}
}