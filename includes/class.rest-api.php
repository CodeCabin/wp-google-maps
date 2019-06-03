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
	const CUSTOM_BASE64_REGEX = '/base64[A-Za-z0-9+\-]+(={0,3})?/';
	
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
	
	protected function registerRoute($route, $args)
	{
		register_rest_route(RestAPI::NS, $route, $args);
		
		if(isset($args['supportsCompressedPathVariable']) && $args['supportsCompressedPathVariable'])
		{
			$compressedRoute	= preg_replace('#/$#', '', $route) . RestAPI::CUSTOM_BASE64_REGEX;
			$callback			= $args['callback'];
			
			$arg['callback'] = function($request) use ($callback) {
				
				var_dump($this);
				exit;
				
				$callback($request);
				
			};
			
			register_rest_route(RestAPI::NS, $compressedRoute, $args);
		}
	}
	
	protected function parseCompressedParameters($param)
	{
		$param = preg_replace('/^base64/', '', $param);
		$param = preg_replace('/-/', '/', $param);
		$param = base64_decode($param);
		
		if(!function_exists('zlib_decode'))
			throw new \Exception('Server does not support inflate');
		
		if(!($string = zlib_decode($param)))
			throw new \Exception('The server failed to inflate the request');
		
		if(!($request = json_decode($string, JSON_OBJECT_AS_ARRAY)))
			throw new \Exception('The decompressed request could not be interpreted as JSON');
		
		return $request;
	}
	
	/**
	 * This function will interpret the request parameters either from a compressed base64 string,
	 * or from the $_REQUEST array when no compressed string is present
	 * @return array The request parameters
	 */
	protected function getRequestParameters()
	{
		switch($_SERVER['REQUEST_METHOD'])
		{
			case 'GET':
				
				$uri = $_SERVER['REQUEST_URI'];
				
				if(preg_match(RestAPI::CUSTOM_BASE64_REGEX, $_SERVER['REQUEST_URI'], $m))
					return $this->parseCompressedParameters($m[0]);
				
				return $_GET;
			
				break;
			
			case 'POST':
			
				return $_POST;
				
				break;
			
			case 'DELETE':
			case 'PUT':
			
				$request = array();
				$body = file_get_contents('php://input');
				parse_str($body, $request);
				
				return $request;
				
				break;
			
			default:
			
				return $_REQUEST;
				
				break;
		}
	}
	
	/**
	 * Enqueues the wp-api script, required to use the Rest API client side.
	 * @return void
	 */
	public function onEnqueueScripts()
	{
		wp_enqueue_script('wp-api');
	}
	
	public function test($request)
	{
		$params = $this->getRequestParameters();
		return $params;
	}
	
	/**
	 * Callback for the rest_api_init action, this function registers the plugins REST API routes.
	 * @return void
	 */
	public function onRestAPIInit()
	{
		$this->registerRoute('/test', array(
			'methods'							=> array('GET', 'POST'),
			'callback'							=> array($this, 'test'),
			'supportsCompressedPathVariable'	=> true
		));
		
		register_rest_route(RestAPI::NS, '/maps(\/\d+)?/', array(
			'methods'				=> 'GET',
			'callback'				=> array($this, 'maps')
		));
		
		register_rest_route(RestAPI::NS, '/markers(\/\d+)?/', array(
			'methods'				=> array('GET'),
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
			'methods'				=> array('POST'),
			'callback'				=> array($this, 'datatables'),
			'compressed'			=> '/datatables/.+'
		));
		
		register_rest_route(RestAPI::NS, '/datatables/.+', array(
			'methods'				=> array('GET'),
			'callback'				=> array($this, 'datatablesCompressed')
		));
	}
	
	public function maps($request)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		$route = $request->get_route();
		
		switch($_SERVER['REQUEST_METHOD'])
		{
			case 'GET':
				if(preg_match('#/wpgmza/v1/maps/(\d+)#', $route, $m))
				{
					$map = Map::createInstance($m[1]);
					return $map;
				}
				
				$ids = $wpdb->get_col("SELECT id FROM $WPGMZA_TABLE_NAME_MAPS WHERE active=0");
				
				$result = array();
				
				if(empty($ids))
					return $result;
				
				foreach($ids as $id)
					$result[] = Map::createInstance($id);
				
				return $result;
				
				break;
			
			default:
				return new \WP_Error('wpgmza_invalid_request_method', 'Invalid request method');
				break;
		}
	}
	
	protected function sanitizeFieldNames($fields, $table)
	{
		global $wpdb;
		
		$whitelist = $wpdb->get_col("SHOW COLUMNS FROM $table");
		$result = array();
		
		foreach($fields as $name)
		{
			if(array_search($name, $whitelist) !== false)
				$result[] = $name;
		}
		
		return $result;
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
					$marker = Marker::createInstance($m[1]);
					return $marker;
				}
				
				$fields = null;
				
				if(isset($_GET['fields']) && is_string($_GET['fields']))
					$fields = explode(',', $_GET['fields']);
				else if(!empty($_GET['fields']))
					$fields = $_GET['fields'];
				
				if(!empty($fields))
					$fields = $this->sanitizeFieldNames($fields, $wpgmza_tblname);
				
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
					$query = new Query();
					
					$query->type = "SELECT";
					$query->table = $wpgmza_tblname;
					$query->fields = $fields;
					
					$qstr = $query->build();
					
					$results = $wpdb->get_results($qstr);
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
					$marker = Marker::createInstance($request['id']);
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
	
	public function datatablesCompressed($request)
	{
		$route = $request->get_route();
		
		if(!preg_match('#datatables/(.+)#', $route, $m))
			return WP_Error('wpgmza_malformed_datatable_request', 'No compressed string found', array('status' => 400));
		
		// NB: We use a custom base64 encoding because percent signs are not permitted in the REST URL, and slashes would indicate a path. This is a resource, and not a path
		$decoded = base64_decode( preg_replace('/-/', '/', $m[1]) );
		
		if(!function_exists('zlib_decode'))
			return WP_Error('wpgmza_invalid_datatable_request', 'The request was deflated, this server does not support inflate');
		
		if(!($string = zlib_decode($decoded)))
			return WP_Error('wpgmza_invalid_datatable_request', 'The server failed to decompress the request');
		
		if(!($request = json_decode($string, JSON_OBJECT_AS_ARRAY)))
			return WP_Error('wpgmza_invalid_datatable_request', 'The decompressed request could not be interpreted as JSON');
		
		$request['phpClass'] = addslashes($request['phpClass']);
		$_REQUEST['wpgmzaDataTableRequestData'] = $request;
		
		return $this->datatables();
	}
	
	public function datatables()
	{
		$request = $_REQUEST['wpgmzaDataTableRequestData'];
		
		if(is_string($request) && ($decoded = base64_decode($request, true)))
		{
			$decoded = base64_decode($request);
			
			if(!function_exists('zlib_decode'))
				return WP_Error('wpgmza_invalid_datatable_request', 'The request was deflated, this server does not support inflate');
			
			if(!($string = zlib_decode($decoded)))
				return WP_Error('wpgmza_invalid_datatable_request', 'The server failed to decompress the request');
			
			if(!($request = json_decode($string, JSON_OBJECT_AS_ARRAY)))
				return WP_Error('wpgmza_invalid_datatable_request', 'The decompressed request could not be interpreted as JSON');
			
			$class = '\\' . $request['phpClass'];
		}
		else
			$class = '\\' . stripslashes( $request['phpClass'] );
		
		try{
			
			$reflection = new \ReflectionClass($class);
			
		}catch(Exception $e) {
			
			return WP_Error('wpgmza_invalid_datatable_class', 'Invalid class specified', array('status' => 403));
			
		}
		
		if(
				(
					class_exists('\\WPGMZA\\MarkerListing') 
					&&
					$reflection->isSubclassOf('\\WPGMZA\\MarkerListing')
				)
				
				||
				
				(
					class_exists('\\WPGMZA\\MarkerListing\\AdvancedTable')
					&&
					(
						$class == '\\WPGMZA\\MarkerListing\\AdvancedTable'
						||
						$reflection->isSubclassOf('\\WPGMZA\\MarkerListing\\AdvancedTable')
					)
				)
			)
		{
			$map_id = $request['map_id'];
			$instance = $class::createInstance($map_id);
		}
		else
			$instance = $class::createInstance();
		
		if(!($instance instanceof DataTable))
			return WP_Error('wpgmza_invalid_datatable_class', 'Specified PHP class must extend WPGMZA\\DataTable', array('status' => 403));
		
		return $instance->data($request);
	}
}