<?php

namespace WPGMZA;

/**
 * This class facilitates all communication between the client and any server side modules which can be interacted with through the WordPress REST API.
 */
class RestAPI extends Factory
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
			'methods'				=> 'GET',
			'callback'				=> array($this, 'markers')
		));
		
		register_rest_route(RestAPI::NS, '/markers(\/\d+)?/', array(
			'methods'				=> 'DELETE',
			'callback'				=> array($this, 'markers'),
			'permission_callback'	=> function() {
				return current_user_can('administrator');
			}
		));
		
		register_rest_route(RestAPI::NS, '/datatables/', array(
			'methods'				=> array('GET', 'POST'),
			'callback'				=> array($this, 'datatables')
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
		
		switch($_SERVER['REQUEST_METHOD'])
		{
			case 'GET':
				if(preg_match('#/wpgmza/v1/markers/(\d+)#', $route, $m))
				{
					// TODO: Marker::createInstance should be used here
					$marker = new Marker($m[1]);
					return $marker;
				}
				
				$fields = null;
				if(empty($_GET['fields']))
					$fields = explode(',', $_GET['fields']);
				else
					$fields = $_GET['fields'];
				
				if(!empty($_GET['filter']))
				{
					$filteringParameters = json_decode( stripslashes($_GET['filter']) );
					
					$markerFilter = MarkerFilter::createInstance($filteringParameters);
					
					foreach($filteringParameters as $key => $value)
						$markerFilter->{$key} = $value;
					
					$results = $markerFilter->getFilteredMarkers($fields);
				}
				else if(!empty($fields))
				{
					//$placeholders = array_fill(0, count($fields), '%s');
					//$placeholders = implode(',', $placeholders);
					
					foreach($fields as $key => $value)
						$fields[$key] = '`' . preg_replace('/[a-z_]/i', '', $value) . '`';
					
					$imploded = implode(',', $fields);
					
					$stmt = $wpdb->prepare("SELECT $imploded FROM $wpgmza_tblname");
					
					$results = $wpdb->get_results($stmt);
				}
				else if(!$fields)
				{
					$results = $wpdb->get_results("SELECT * FROM $wpgmza_tblname");
				}
				
				// TODO: Select all custom field data too, in one query, and add that to the marker data in the following loop. Ideally we could add a bulk get function to the CRUD classes which takes IDs?
				// NB: Such a function has been implemented, just need to hook that up
				
				foreach($results as $obj)
					unset($obj->latlng);
				
				return $results;
				break;
			
			case 'DELETE':
				
				// Workaround for PHP not populating $_REQUEST
				$request = array();
				$body = file_get_contents('php://input');
				parse_str($body, $request);
				
				if(isset($request['id']))
				{
					$marker = new Marker($request['id']);
					$marker->trash();
				}
				
				if(isset($request['ids']))
					Marker::bulk_trash($request['ids']);
				
				return (object)array(
					'success' => true
				);
				
				break;
				
			default:
				return new \WP_Error('wpgmza_invalid_request_method', 'Invalid request method');
				break;
		}
		
		
	}
	
	public function datatables()
	{
		$request = $_REQUEST['wpgmzaDataTableRequestData'];
		
		$class = '\\' . stripslashes( $request['phpClass'] );
		
		$instance = $class::createInstance();
		
		if(!($instance instanceof DataTable))
			return WP_Error('wpgmza_invalid_datatable_class', 'Specified PHP class must extend WPGMZA\\DataTable', array('status' => 403));
		
		return $instance->data($request);
	}
}