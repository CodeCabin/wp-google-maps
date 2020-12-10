<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * This class facilitates all communication between the client and any server side modules which can be interacted with through the WordPress REST API.
 */
class RestAPI extends Factory
{
	/**
	 * @const The plugins REST API namespace
	 */
	const NS = 'wpgmza/v1';
	const CUSTOM_BASE64_REGEX = '/base64[A-Za-z0-9+\- ]+(={0,3})?(\/[A-Za-z0-9+\- ]+(={0,3})?)?/';
	
	private $fallbackRoutesByRegex;
	private $nonceTable;
	
	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->fallbackRoutesByRegex = array();
		$this->nonceTable = array();
		
		// REST API init
		add_action('rest_api_init', array($this, 'onRestAPIInit'));
		
		add_action('parse_request', array($this, 'onParseRequest'));
		add_action('init', array($this, 'onInit'));
		
		// WP REST Cache integration
		add_filter('wp_rest_cache/allowed_endpoints', array($this, 'onWPRestCacheAllowedEndpoints'));
		
		// AJAX callbacks for when REST API is blocked
		add_action('wp_ajax_wpgmza_report_rest_api_blocked', array($this, 'onReportRestAPIBlocked'));
		add_action('wp_ajax_nopriv_wpgmza_report_rest_api_blocked', array($this, 'onReportRestAPIBlocked'));
		
		// AJAX fallback for when REST API is blocked
		add_action('wp_ajax_wpgmza_rest_api_request', array($this, 'onAJAXRequest'));
		add_action('wp_ajax_nopriv_wpgmza_rest_api_request', array($this, 'onAJAXRequest'));
	}
	
	public static function isCompressedPathVariableSupported()
	{
		return function_exists('zlib_decode');
	}
	
	public static function isRequestURIUsingCompressedPathVariable()
	{
		return preg_match(RestAPI::CUSTOM_BASE64_REGEX, $_SERVER['REQUEST_URI']);
	}
	
	public static function isDoingAjax()
	{
		if(function_exists('wp_doing_ajax'))
			return wp_doing_ajax();
		
		return apply_filters( 'wp_doing_ajax', defined( 'DOING_AJAX' ) && DOING_AJAX );
	}
	
	protected function addRestNonce($route)
	{
		$this->nonceTable[$route] = wp_create_nonce('wpgmza_' . $route);
	}
	
	public function getNonceTable()
	{
		return $this->nonceTable;
	}
	
	protected function checkActionNonce($route)
	{
		$route = preg_replace('#^/wpgmza/v1#', '', $route);
		$nonce = $_SERVER['HTTP_X_WPGMZA_ACTION_NONCE'];
		
		$result = wp_verify_nonce($nonce, 'wpgmza_' . $route);
		
		return $result !== false;
	}
	
	public function registerRoute($route, $args)
	{
		$methodIsOnlyGET = true;
		
		if(!empty($args['methods']))
		{
			$methods = $args['methods'];
			
			if(is_string($methods))
				$methodIsOnlyGET = $methods == 'GET';
			else if(is_array($methods))
			{
				foreach($methods as $method)
				{
					if($method == 'GET')
						continue;
					
					$methodIsOnlyGET = false;
					break;
				}
			}
		}
		
		if(!defined('REST_REQUEST'))
		{
			if($methodIsOnlyGET)
			{
				$this->fallbackRoutesByRegex["#$route#"] = $args;
				return;	// No need to add nonces for GET requests to the nonce table
			}
			
			$this->addRestNonce($route);
			
			if(!RestAPI::isDoingAjax())
				return;
		}
		
		$callback = $args['callback'];
		
		$args['callback'] = function($request) use ($route, $args, $callback, $methodIsOnlyGET)
		{
			global $wpgmza;
			
			$doActionNonceCheck = 
				empty($args['skipNonceCheck']) &&
				!$methodIsOnlyGET && 
				(
					!$wpgmza->isProVersion() 
					||
					version_compare($wpgmza->getProVersion(), '7.11.47', '>=')
				);
			
			if($doActionNonceCheck && !$this->checkActionNonce($route))
				return new \WP_Error('wpgmza_action_not_allowed', 'You do not have permission to perform this action', array('status' => 403));
			
			return $callback($request);
		};
		
		if(defined('REST_REQUEST'))
		{
			register_rest_route(RestAPI::NS, $route, $args);
			
			if(isset($args['useCompressedPathVariable']) && $args['useCompressedPathVariable'])
			{
				$compressedRoute = preg_replace('#/$#', '', $route) . RestAPI::CUSTOM_BASE64_REGEX;
				register_rest_route(RestAPI::NS, $compressedRoute, $args);
			}
		}
		
		$this->fallbackRoutesByRegex["#$route#"] = $args;
	}
	
	protected function parseCompressedParameters($param)
	{
		$parts = explode('/', $param);
		
		if(empty($parts))
			throw new \Exception('Failed to explode compressed parameters');
		
		$data = $parts[0];
		
		$data = preg_replace('/^base64/', '', $data);
		$data = preg_replace('/-/', '/', $data);
		$data = preg_replace('/ /', '+', $data);
		$data = base64_decode($data);
		
		if(!function_exists('zlib_decode'))
			throw new \Exception('Server does not support inflate');
		
		if(!($string = zlib_decode($data)))
			throw new \Exception('The server failed to inflate the request');
		
		// TODO: Maybe $string should have stripslashes applied here
		
		if(!($request = json_decode($string, JSON_OBJECT_AS_ARRAY)))
			throw new \Exception('The decompressed request could not be interpreted as JSON');
		
		if(count($parts) == 2)
		{
			if(!isset($request['midcbp']))
				throw new \Exception('No compressed buffer pointer supplied for marker IDs');
			
			// Marker IDs
			$compressed = $parts[1];
			
			$compressed = preg_replace('/-/', '/', $compressed);
			$compressed = base64_decode($compressed);
			$compressed = zlib_decode($compressed);
			$compressed = array_values( unpack('C' . strlen($compressed), $compressed) );
			
			$pointer = (int)$request['midcbp'];
			
			$eliasFano = new EliasFano();
			$markerIDs = $eliasFano->decode($compressed, (int)$request['midcbp']);
			
			// TODO: Legacy markerIDs was a string, because this was historically more compact than POSTing an array. This can be altered, but the marker listing modules will have to be adjusted to cater for that
			$request['markerIDs'] = implode(',', $markerIDs);
		}
		
		return $request;
	}
	
	/**
	 * This function will interpret the request parameters either from a compressed base64 string,
	 * or from the $_REQUEST array when no compressed string is present
	 * @return array The request parameters
	 */
	public function getRequestParameters()
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
	
	protected function registerRoutes()
	{
		global $wpgmza;
		
		$this->registerRoute('/maps(\/\d+)?/', array(
			'methods'					=> 'GET',
			'callback'					=> array($this, 'maps')
		));
		
		$this->registerRoute('/markers/\d+/', array(
			'methods'					=> array('GET'),
			'callback'					=> array($this, 'markers')
		));
		
		$this->registerRoute('/markers', array(
			'methods'					=> array('GET'),
			'callback'					=> array($this, 'markers'),
			'useCompressedPathVariable'	=> true
		));

		$this->registerRoute('/markers(\/\d+)?/', array(
			'methods'				=> array('DELETE', 'POST'),
			'callback'				=> array($this, 'markers'),
			'permission_callback'	=> array($wpgmza, 'isUserAllowedToEdit')
		));
		
		$this->registerRoute('/datatables', array(
			'methods'					=> array('GET'),
			'callback'					=> array($this, 'datatables'),
			'useCompressedPathVariable'	=> true
		));
		
		$this->registerRoute('/datatables', array(
			'methods'					=> array('POST'),
			'callback'					=> array($this, 'datatables')
		));
		
		$this->registerRoute('/geocode-cache', array(
			'methods'					=> array('GET'),
			'callback'					=> array($this, 'geocodeCache'),
			'useCompressedPathVariable'	=> true
		));
		
		$this->registerRoute('/decompress', array(
			'methods'					=> array('GET'),
			'callback'					=> array($this, 'decompress'),
			'useCompressedPathVariable'	=> true
		));
		
		do_action('wpgmza_register_rest_api_routes');
	}
	
	/**
	 * Callback for the rest_api_init action, this function registers the plugins REST API routes.
	 * @return void
	 */
	public function onRestAPIInit()
	{
		// NB: Permalink Manager Lite compatibility. This fix prevents the plugin from causing POST REST requests being redirected to GET
		// NB: We also check the plugin is active to mitigate any potential effects to other plugins. This could be removed, as an optimization
		global $wp_query;
		
		$active_plugins = get_option('active_plugins');
		if(!empty($wp_query->query_vars) && array_search('permalink-manager/permalink-manager.php', $active_plugins))
			$wp_query->query_vars['do_not_redirect'] = 1;
		
		$this->registerRoutes();
	}
	
	public function onParseRequest()
	{
		// Register routes for the nonce table
		if(!defined('REST_REQUEST'))
			$this->registerRoutes();
	}
	
	public function onInit()
	{
		$this->registerRoutes();
	}
	
	protected function sendAJAXResponse($result, $code=200)
	{
		if($code != 200)
			http_response_code($code);
		
		header('Content-type: application/json');
		
		echo json_encode($result);
	}
	
	public function onAJAXRequest()
	{
		$this->onRestAPIInit();
		
		// Check route is specified
		if(empty($_REQUEST['route']))
		{
			$this->sendAJAXResponse(array(
				'code'			=> 'rest_no_route',
				'message'		=> 'No route was found matching the URL request method',
				'data'			=> array(
					'status'	=> 404
				)
			), 404);
			return;
		}
		
		// Try to match the route
		$args = null;
		
		foreach($this->fallbackRoutesByRegex as $regex => $value)
		{
			if(preg_match($regex, $_REQUEST['route']))
			{
				$args = $value;
				break;
			}
		}
		
		if(!$args)
		{
			$this->sendAJAXResponse(array(
				'code'			=> 'rest_no_route',
				'message'		=> 'No route was found matching the URL request method',
				'data'			=> array(
					'status'	=> 404
				)
			), 404);
			exit;
		}
		
		// Check permissions
		if(!empty($args['permission_callback']))
		{
			$allowed = $args['permission_callback']();

			if(!$allowed)
			{
				$this->sendAJAXResponse(array(
					'code'			=> 'rest_forbidden',
					'message'		=> 'You are not authorized to use this method',
					'data'			=> array(
						'status'	=> 403
					)
				), 403);
				exit;
			}
		}
		
		// Fire callback
		$result = $args['callback'](null);
		$this->sendAJAXResponse($result);
		
		exit;
	}
	
	public function onWPRestCacheAllowedEndpoints($allowed_endpoints)
	{
		$cachable_endpoints = array(
			'markers',
			'datatables',
			'geocode-cache',
			'marker-listing'
		);
		
		foreach($cachable_endpoints as $endpoint)
		{
			if(!isset($allowed_endpoints[RestAPI::NS]) || !in_array($endpoint, $allowed_endpoints[RestAPI::NS]))
				$allowed_endpoints[RestAPI::NS][] = $endpoint;
		}
		
		return $allowed_endpoints;
	}
	
	public function maps($request)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		$route = $_SERVER['REQUEST_URI'];
		
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
	
	protected function getFilteringParameters($params)
	{
		$filteringParameters = array();
		
		if(!empty($params['filter']))
		{
			if(is_object($params['filter']))
				$filteringParameters = (array)$params['filter'];
			else if(is_array($params['filter']))
				$filteringParameters = $params['filter'];
			else if(is_string($params['filter']))
			{
				if(!($filteringParameters = json_decode( stripslashes($params['filter']) )))
					throw new \Exception("Invalid JSON in filtering parameters");
			}
			else
				throw new \Exception("Failed to interpret filtering parameters");
		}
		
		return (array)$filteringParameters;
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
		
		$route 		= $_SERVER['REQUEST_URI'];
		$params		= $this->getRequestParameters();
		
		switch($_SERVER['REQUEST_METHOD'])
		{
			case 'GET':
				if(preg_match('#/wpgmza/v1/markers/(\d+)#', $route, $m))
				{
					$marker = Marker::createInstance($m[1], Crud::SINGLE_READ, isset($_GET['raw_data']));
					return $marker;
				}
				
				if(isset($_GET['action']))
				{
					switch($_GET['action'])
					{
						case 'count-duplicates':
						
							$total		= $wpdb->get_var("SELECT COUNT(*) FROM $wpgmza_tblname");
							$duplicates	= $wpdb->get_var("SELECT COUNT(*) FROM $wpgmza_tblname GROUP BY lat, lng, address, title, link, description");
						
							return array(
								'count' => number_format($total - $duplicates)
							);
							
							break;
						
						case 'remove-duplicates':
							
							$table		= "{$wpdb->prefix}wpgmza_temp";
							$allowed	= $wpdb->get_col("SELECT MIN(id) FROM $wpgmza_tblname GROUP BY lat, lng, address, title, link, description");
							
							if(empty($allowed))
								return array(
									'message' => sprintf(
										__("Removed %s markers", "wp-google-maps"),
										"0"
									)
								);
							
							$imploded	= implode(',', $allowed);
							$qstr		= "DELETE FROM $wpgmza_tblname WHERE id NOT IN ($imploded)";
							$result		= $wpdb->query($qstr);
							
							if($result === false)
								throw new \Exception($wpdb->last_error);
							
							return array(
								'message' => sprintf(
									__("Removed %s markers", "wp-google-maps"),
									number_format($result)
								)
							);
							
							break;
						
						default:
							// Don't throw if doing AJAX, that would break the AJAX fallback
							if(!preg_match('/admin-ajax\.php/', $_SERVER['REQUEST_URI']))
								throw new \Exception('Unknown action');
							break;
					}
				}
				
				$fields = null;
				
				if(isset($params['fields']) && is_string($params['fields']))
					$fields = explode(',', $params['fields']);
				else if(!empty($params['fields']))
					$fields = $params['fields'];
				
				if(!empty($fields))
					$fields = $this->sanitizeFieldNames($fields, $wpgmza_tblname);
				
				$filteringParameters = $this->getFilteringParameters($params);
				
				$markerFilter = MarkerFilter::createInstance($filteringParameters);
				
				foreach($filteringParameters as $key => $value)
					$markerFilter->{$key} = $value;
					
				$results = $markerFilter->getFilteredMarkers($fields);
				$arr = array();
				
				// We call this here so that caching doesn't try to serialize markers, resulting in bad characters
				// NB: A better approach might be to implement serializable, however I didn't have much luck doing that
				$classImplementsJsonSerializableCache = array();
				
				foreach($results as $marker)
				{
					if($marker instanceof Marker)
					{
						// Convert the marker to a plain array, so that it can be properly cached by REST API cache
						$json = $marker->jsonSerialize();
						
						foreach($json as $key => $value)
						{
							if(!is_object($value))
								continue;
							
							if(!isset($classImplementsJsonSerializableCache[$key]))
							{
								$reflection = new \ReflectionClass($value);
								$classImplementsJsonSerializableCache[$key] = $reflection->implementsInterface('JsonSerializable');
							}
							
							if(!$classImplementsJsonSerializableCache[$key])
								continue;
							
							$json[$key] = $value->jsonSerialize();
						}
						
						$arr[] = $json;
					}
					else
						$arr[] = $marker;
				}
					
				// TODO: Select all custom field data too, in one query, and add that to the marker data in the following loop. Ideally we could add a bulk get function to the CRUD classes which takes IDs?
				// NB: Such a function has been implemented, just need to hook that up
				
				return $arr;
				break;
			
			case 'POST':
			
				if(preg_match('#/wpgmza/v1/markers/(\d+)#', $route, $m))
					$id = $m[1];
				else
					$id = -1;
				
				$marker = Marker::createInstance($id);
				
				foreach($_POST as $key => $value)
				{
					if($key == 'id')
						continue;
					
					if($key == 'gallery')
					{
						$gallery = new MarkerGallery($_POST[$key]);
						$marker->gallery = $gallery;
					}
					else
						$marker->{$key} = stripslashes($value);
				}
				
				$map = Map::createInstance($marker->map_id);
				$map->updateXMLFile();
				
				return $marker;
				
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
	
	public function datatables()
	{
		$request = $this->getRequestParameters();
		
		// NB: Legacy support
		if(isset($request['wpgmzaDataTableRequestData']))
			$request = $request['wpgmzaDataTableRequestData'];
		
		if(RestAPI::isRequestURIUsingCompressedPathVariable())
			$class = '\\' . $request['phpClass'];
		else
			$class = '\\' . stripslashes( $request['phpClass'] );
		
		try{
			
			$reflection = new \ReflectionClass($class);
			
		}catch(Exception $e) {
			
			return new \WP_Error('wpgmza_invalid_datatable_class', 'Invalid class specified', array('status' => 403));
			
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
			return new \WP_Error('wpgmza_invalid_datatable_class', 'Specified PHP class must extend WPGMZA\\DataTable', array('status' => 403));
		
		$result = $instance->data($request);
		
		return $result;
	}
	
	public function geocodeCache($request)
	{
		$params	= $this->getRequestParameters();
		$cache	= new NominatimGeocodeCache();
		
		$record	= $cache->get(addslashes($params['query']));
		
		if(!$record)
			$record = array();
		
		return $record;
	}
	
	public function decompress($request)
	{
		$params = $this->getRequestParameters();
		
		return $params;
	}
	
	public function onReportRestAPIBlocked()
	{
		$now = new \DateTime();
		
		update_option('wpgmza_last_rest_api_blocked', $now->format(\DateTime::ISO8601));
	}
}