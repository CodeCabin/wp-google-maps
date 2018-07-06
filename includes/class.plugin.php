<?php

namespace WPGMZA;

class Plugin extends Factory
{
	const PAGE_MAP_LIST			= "map-list";
	const PAGE_MAP_EDIT			= "map-edit";
	const PAGE_SETTINGS			= "map-settings";
	const PAGE_SUPPORT			= "map-support";
	
	const PAGE_CATEGORIES		= "categories";
	const PAGE_ADVANCED			= "advanced";
	const PAGE_CUSTOM_FIELDS	= "custom-fields";
	
	public static $enqueueScriptsFired = false;
	
	private $_settings;
	private $_gdprCompliance;
	
	protected $scriptLoader;
	
	private $cachedVersion = null;
	private $legacySettings;
	
	public function __construct()
	{
		$this->legacySettings = get_option('WPGMZA_OTHER_SETTINGS');
		if(!$this->legacySettings)
			$this->legacySettings = array();
		
		// Legacy compatibility
		global $wpgmza_pro_version;
		
		$this->_settings = new GlobalSettings();
		
		// TODO: This should be in default settings, this code is duplicaetd
		if(!empty($wpgmza_pro_version) && version_compare(trim($wpgmza_pro_version), '7.10.00', '<'))
		{
			$self = $this;
			
			$settings['wpgmza_maps_engine'] = $settings['engine'] = 'google-maps';
			
			add_filter('wpgooglemaps_filter_map_div_output', function($output) use ($self) {
				
				$loader = new GoogleMapsAPILoader();
				$loader->registerGoogleMaps();
				$loader->enqueueGoogleMaps();
				
				$self->loadScripts();
				
				return $output;
				
			});
		}
		
		if(!empty($this->settings->wpgmza_maps_engine))
			$this->settings->engine = $this->settings->wpgmza_maps_engine;
		
		add_action('init', array($this, 'onInit'));
		
		add_action('wp_enqueue_scripts', function() {
			Plugin::$enqueueScriptsFired = true;
		});
		
		add_action('admin_enqueue_scripts', function() {
			Plugin::$enqueueScriptsFired = true;
		});
		
		if($this->settings->engine == 'open-layers')
			require_once(plugin_dir_path(__FILE__) . 'open-layers/class.nominatim-geocode-cache.php');
	}
	
	public function __set($name, $value)
	{
		switch($name)
		{
			case 'settings':
			case 'gdprCompliance':
				throw new \Exception('Property is read only');
				break;
		}
		
		$this->{$name} = $value;
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case 'settings':
			case 'gdprCompliance':
				return $this->{'_' . $name};
				break;
		}
		
		return $this->{$name};
	}
	
	public function onInit()
	{
		$this->_gdprCompliance = new GDPRCompliance();
	}
	
	public function loadScripts()
	{
		if(!$this->scriptLoader)
			$this->scriptLoader = new ScriptLoader($this->isProVersion());
		
		if(!empty($this->settings->developer_mode))
			$this->scriptLoader->build();
		
		if(Plugin::$enqueueScriptsFired)
		{
			$this->scriptLoader->enqueueScripts();
			$this->scriptLoader->enqueueStyles();
		}
		else
		{
			add_action('wp_enqueue_scripts', function() {
				$this->scriptLoader->enqueueScripts();
				$this->scriptLoader->enqueueStyles();
			});
			
			add_action('admin_enqueue_scripts', function() {
				$this->scriptLoader->enqueueScripts();
				$this->scriptLoader->enqueueStyles();
			});
		}
	}
	
	public function getLocalizedData()
	{
		$strings = new Strings();
		
		return apply_filters('wpgmza_plugin_get_localized_data', array(
			'ajaxurl' 				=> admin_url('admin-ajax.php'),
			'settings' 				=> $this->settings,
			'localized_strings'		=> $strings->getLocalizedStrings(),
			'api_consent_html'		=> $this->gdprCompliance->getConsentPromptHTML(),
			'basic_version'			=> $this->getBasicVersion(),
			'_isProVersion'			=> $this->isProVersion()
		));
	}
	
	public function getCurrentPage()
	{
		if(!isset($_GET['page']))
			return null;
		
		switch($_GET['page'])
		{
			case 'wp-google-maps-menu':
				if(isset($_GET['action']) && $_GET['action'] == 'edit')
					return Plugin::PAGE_MAP_EDIT;
				
				return Plugin::PAGE_MAP_LIST;
				break;
				
			case 'wp-google-maps-menu-settings':
				return Plugin::PAGE_SETTINGS;
				break;
				
			case 'wp-google-maps-menu-support':
				return Plugin::PAGE_SUPPORT;
				break;
				
			case 'wp-google-maps-menu-categories':
				return Plugin::PAGE_CATEGORIES;
				break;
				
			case 'wp-google-maps-menu-advanced':
				return Plugin::PAGE_ADVANCED;
				break;
				
			case 'wp-google-maps-menu-custom-fields':
				return Plugin::PAGE_CUSTOM_FIELDS;
				break;
		}
		
		return null;
	}
	
	public function isUsingMinifiedScripts()
	{
		return empty($this->settings->developer_mode);
	}
	
	public function isProVersion()
	{
		return false;
	}
	
	public function getBasicVersion()
	{
		if($this->cachedVersion != null)
			return $this->cachedVersion;
		
		$subject = file_get_contents(plugin_dir_path(__DIR__) . 'wpGoogleMaps.php');
		if(preg_match('/Version:\s*(.+)/', $subject, $m))
			$this->cachedVersion = $m[1];
		
		return $this->cachedVersion;
	}
}

add_action('plugins_loaded', function() {
	
	global $wpgmza;
	
	$wpgmza = Plugin::createInstance();
	
});
