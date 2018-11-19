<?php

namespace WPGMZA;

/**
 * This class facilitates all communication between the client and any server side modules which can be interacted with through the WordPress REST API.
 */
class RestAPI
{
	/**
	 * @const The plugins REST API namespace
	 */
	const NS = 'wpgmza/v1';
	
	/**
	 * Constructor
	 */
	public function __construct()
	{
		add_action('wp_enqueue_scripts', array($this, 'onEnqueueScripts'));
		add_action('admin_enqueue_scripts', array($this, 'onEnqueueScripts'));
		add_action('enqueue_block_assets', array($this, 'onEnqueueScripts'));
		
		add_action('rest_api_init', array($this, 'onRestAPIInit'));
	}
	
	/**
	 * Enqueues the wp-api script, required to use the Rest API client side.
	 * @return void
	 */
	public function onEnqueueScripts()
	{
		wp_enqueue_script('wp-api');
	}
	
	/**
	 * Callback for the rest_api_init action, this function registers the plugins REST API routes.
	 * @return void
	 */
	public function onRestAPIInit()
	{
		register_rest_route(RestAPI::NS, '/markers(\/\d+)?/', array(
			'methods' => 'GET',
			'callback' => array($this, 'markers')
		));
	}
	
	/**
	 * Callback for the /markers REST API route.
	 * @param \WP_REST_Request The REST request.
	 * @return mixed Where an ID is specified on the URL, a single marker is returned. Where no ID is specified, an array of all markers are returned.
	 */
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