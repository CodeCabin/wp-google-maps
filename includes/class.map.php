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
		
		try {
			Crud::__construct("{$wpdb->prefix}wpgmza_maps", $id_or_fields);
		} catch (\Exception $e){
			// Map ID not found
			return;
		}

		if(!$overrides)
			$this->_overrides = array();
		else
			$this->_overrides = $overrides;
		
		$document = new DOMDocument();
		$document->loadHTML('<div class="wpgmza_map"></div>');
		
		$this->_element = $document->querySelector("div");
		$this->_element->setAttribute('data-settings', json_encode($this->getDataSettingsObject()));
		
		if(empty($wpgmza))
		{
			// NB: This is for when the plugin is first being activated - the global plugin object is not yet available as we're still in the plugins constructor further up the stack trace. There is probably a more elegant solution to this, perhaps set an "isDoingFirstRun" flag as a static member of the plugin class?
			return;
		}
		
		if(!$wpgmza->isProVersion())
			$this->onInit();
		
		$wpgmza->loadScripts(true);
	}

	public function getDataSettingsObject(){
		$localized = $this;
		$ignore = array('shortcode');

		foreach ($ignore as $key) {
			if(!empty($localized->{$key})){
				unset($localized->{$key});
			}
		}
		
		return $localized;
	}
	
	protected function onInit()
	{
		if($this->store_locator_enabled == 1)
			$this->_storeLocator = StoreLocator::createInstance($this);


		/** Legacy rollback for layers */
		$this->bicycle = (!empty($this->bicycle) && intval($this->bicycle) == 2) ? 0 : $this->bicycle;
		$this->traffic = (!empty($this->traffic) && intval($this->traffic) == 2) ? 0 : $this->traffic;
		$this->transport_layer = (!empty($this->transport_layer) && intval($this->transport_layer) == 2) ? 0 : $this->transport_layer;
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case 'overrides':
			case 'storeLocator':
				return $this->{"_$name"};
				break;
			case 'shortcodeAttributes':
				return $this->_overrides;
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
		/* Developer Hook (Filter) - Alter map create instnace, deprecated */
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
	
	protected function create()
	{
		Crud::create();


		// Set defaults 
		$this->set(array(
			'map_start_zoom'	=> 4,
			'map_width'			=> 100,
			'map_width_type'	=> '%',
			'map_height'		=> 400,
			'map_height_type'	=> 'px',
			'map_type'			=> 1, // Roadmap,
			'sl_stroke_color'	=> "#FF0000",
			'sl_fill_color' 	=> "#FF0000",
			'sl_stroke_opacity' => 1,
			'sl_fill_opacity'	=> 0.5
		));
		
		// Only default if these were not set initially 
		if(empty($this->map_title)){
			$this->set('map_title', __('New Map', 'wp-google-maps'));	
		}

		if(empty($this->map_start_lat) || empty($this->map_start_lng)){
			$this->set(array(
				'map_start_lat'		=> 36.778261,
				'map_start_lng'		=> -119.4179323999,
			));	
		}


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
		
		/* Developer Hook (Filter) - XML cache generated, passes DOMDOcument for mutation, must return DOMDocument */
		$document = apply_filters('wpgmza_xml_cache_generated', $document);
		
		$dest	= $this->getMarkerXMLFilename();
		$text	= $document->saveXML();
		$result	= file_put_contents($dest, $text);
		
		if($result === false)
		{
			if(Map::$xmlFolderWarningDisplayed)
				return;
			
			Map::$xmlFolderWarningDisplayed = true;
			
			add_action('admin_notices', function() {
				?>
				<div class='notice notice-error'>
					<p>
						<strong><?php _e('WP Go Maps:', 'wp-google-maps'); ?></strong>
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
		
	    /* Developer Hook (Action) - Log change to the XML storage,passes destination of file */     
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
