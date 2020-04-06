<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

require_once(plugin_dir_path(__FILE__) . 'class.crud.php');

/**
 * This class represents a map.
 */
class Map extends Crud
{
	private static $xmlFolderWarningDisplayed = false;
	private static $xmlShutdownHandlerRegistered = false;
	
	protected $_overrides;
	protected $_element;
	
	protected $_storeLocator;
	
	/**
	 * Constructor
	 * @param int|array|object $id_or_fields The ID to read an existing map, or an object or array to create a new one.
	 */
	public function __construct($id_or_fields=-1, $overrides=null)
	{
		global $wpdb;
		global $wpgmza;
		
		Crud::__construct("{$wpdb->prefix}wpgmza_maps", $id_or_fields);
		
		if(!$overrides)
			$this->_overrides = array();
		else
			$this->_overrides = $overrides;
		
		$document = new DOMDocument();
		$document->loadHTML('<div class="wpgmza_map"></div>');
		
		$this->_element = $document->querySelector("div");
		$this->_element->setAttribute('data-settings', json_encode($this));
		
		if(!$wpgmza->isProVersion())
			$this->onInit();
	}
	
	protected function onInit()
	{
		if($this->store_locator_enabled == 1)
			$this->_storeLocator = StoreLocator::createInstance($this);
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case 'overrides':
			case 'storeLocator':
				return $this->{"_$name"};
				break;
			
			case "storeLocatorDistanceUnits":
				if(!empty($this->store_locator_distance) && $this->store_locator_distance == 1)
					return Distance::UNITS_MI;
				else
					return Distance::UNITS_KM;
				break;
			
			case "element":
				
				return $this->_element;
				
				break;
		}
		
		return Crud::__get($name);
	}
	
	/**
	 * Deprecated. The Factory class will takeover here
	 * @deprecated
	 */
	public static function create_instance($id_or_fields=-1)
	{
		return apply_filters('wpgmza_create_map_instance', $id_or_fields);
	}
	
	/**
	 * Returns the name of the column used to store arbitrary data, which is "other_settings" on the map table.
	 * @return string The column name.
	 */
	protected function get_arbitrary_data_column_name()
	{
		return "other_settings";
	}
	
	protected function getMarkersQuery()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		// NB: We need to use markerfilter here
		$stmt = $wpdb->prepare("SELECT * FROM $WPGMZA_TABLE_NAME_MARKERS WHERE approved=1 AND map_id=%d", array($this->id));
		
		return $stmt;
	}
	
	public function getMarkers()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		$result = array();
		$stmt = $this->getMarkersQuery();
		$data = $wpdb->get_results($stmt);
		
		foreach($data as $obj)
			$result[] = Marker::createInstance($obj, Crud::BULK_READ);
		
		return $result;
	}
	
	public static function onShutdownDuringXMLUpdate()
	{
		global $wpgmza;
		
		$error = error_get_last();
		
		if(!$error)
			return;
		
		if(preg_match('/Maximum execution time/', $error['message']))
		{
			$wpgmza->settings->displayXMLExecutionTimeWarning = true;
			$wpgmza->settings->wpgmza_settings_marker_pull = "0";
		}
		
		if(preg_match('/Allowed memory size/', $error['message']))
		{
			$wpgmza->settings->displayXMLMemoryLimitWarning = true;
			$wpgmza->settings->wpgmza_settings_marker_pull = "0";
		}
	}
	
	public function updateXMLFile()
	{
		global $wpgmza;
		
		if(!Map::$xmlShutdownHandlerRegistered)
		{
			register_shutdown_function(array('WPGMZA\\Map', 'onShutdownDuringXMLUpdate'));
			Map::$xmlShutdownHandlerRegistered = true;
		}
		
		if($wpgmza->settings->wpgmza_settings_marker_pull != Plugin::MARKER_PULL_XML)
			return;
		
		$document = new DOMDocument();
		$document->loadXML('<markers/>');
		
		$root = $document->getDocumentElementSafe();
		
		$remap = array(
			'id'		=> 'marker_id',
			'link'		=> 'linkd'
		);
		
		$markers = $this->getMarkers();
		
		foreach($markers as $marker)
		{
			$markerElement = $document->createElement('marker');
			
			// First convert to JSON rather than working on the marker directly, so we can be sure it's serialized properly rather than writing code to convert from the internal format.
			// TODO: There must be a better method than this. In the very least, implement it on the Marker class and don't use this hack
			$json = json_encode($marker);
			$json = json_decode($json);
			
			// Now convert that JSON to XML!
			foreach($json as $key => $value)
			{
				if(isset($remap[$key]))
					$key = $remap[$key];
				
				try{
					$node = $document->createElement($key);
				}catch(\Exception $e) {
					continue;	// Ignore invalid data
				}
				
				if($key == "other_data")
					$value = maybe_unserialize($key);
				
				if(is_scalar($value))
					$node->appendText($value);
				else
				{
					$text = json_encode($value);
					
					$node->appendText($text);
					$node->setAttribute('data-json', 'true');
				}
				
				$markerElement->appendChild($node);
			}
			
			$root->appendChild($markerElement);
		}
		
		$document = apply_filters('wpgmza_xml_cache_generated', $document);
		
		$dest = $this->getMarkerXMLFilename();
		if(file_put_contents($dest, $document->saveXML()) === false)
		{
			if(Map::$xmlFolderWarningDisplayed)
				return;
			
			Map::$xmlFolderWarningDisplayed = true;
			
			add_action('admin_notices', function() {
				?>
				<div class='notice notice-error'>
					<p>
						<strong><?php _e('WP Google Maps:', 'wp-google-maps'); ?></strong>
						<?php
						echo sprintf(
							_e('The plugin couldn\'t find the directory %s, which is the directory your settings specify to use for XML caching. Please make sure the directory exists, and that you assign file permissions of 755 to this directory.', 'wp-google-maps'),
							$dest
						);
						?>
					</p>
				</div>
				<?php
			});
			
			return;
		}
		
		do_action('wpgmza_xml_cache_saved', $dest);
	}
	
	protected function getMarkerXMLFilename()
	{
		global $blog_id;
		
		// TODO: Drop this global
		$path = wpgmza_return_marker_path();
		
		if(!file_exists($path))
			@mkdir($path);	// Attempt to create the directory
		
		if(is_multisite())
			return $path . $blog_id . "-" . $this->id . "markers.xml";
	
		return $path . $this->id . "markers.xml";
	}
	
	public static function getMarkerXMLPathURL()
	{
		global $wpgmza, $blog_id;
		
		$url = get_option('wpgmza_xml_url');
		
		if(empty($url))
		{
			$default = '{uploads_url}/wp-google-maps/';
			add_option('wpgmza_xml_url', $default);
			
			$url = $default;
		}
		
		$content_url	= trim( content_url(), '/' );
		$plugins_url	= trim( plugins_url(), '/' );
		$upload_url		= trim( wp_upload_dir()['baseurl'], '/' );
		
		$url = preg_replace(
			array('/{wp_content_(url|dir)}/', '/{plugins_(url|dir)}/', '/{uploads_(url|dir)}/'),
			array($content_url, $plugins_url, $upload_url),
			$url
		);
		
		if(empty($url))
			$url = $upload_url . "/wp-google-maps/";
		
		if(substr($url, -1) != '/')
			$url .= '/';
		
		if(is_multisite())
			$result = $url . $blog_id . "-";
		else
			$result = $url;
		
		return preg_replace('#^http(s?):#', '', $result);
	}
}
