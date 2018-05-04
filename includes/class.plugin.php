<?php

namespace WPGMZA;

require_once(plugin_dir_path(__FILE__) . 'class.script-loader.php');

class Plugin
{
	const PAGE_MAP_LIST			= "map-list";
	const PAGE_MAP_EDIT			= "map-edit";
	const PAGE_SETTINGS			= "map-settings";
	const PAGE_SUPPORT			= "map-support";
	
	const PAGE_CATEGORIES		= "categories";
	const PAGE_ADVANCED			= "advanced";
	const PAGE_CUSTOM_FIELDS	= "custom-fields";
	
	private static $enqueueScriptsFired = false;
	
	public $settings;
	protected $scriptLoader;
	
	public function __construct()
	{
		$legacy_settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		$settings = array(
			'engine' 				=> (empty($legacy_settings['wpgmza_maps_engine']) || $legacy_settings['wpgmza_maps_engine'] != 'google-maps' ? 'open-street-map' : 'google-maps'),
			'google_maps_api_key'	=> get_option('wpgmza_google_maps_api_key'),
			'default_marker_icon'	=> "//maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
			'developer_mode'		=> true // TODO: remove
		);
		
		if(empty($legacy_settings))
			$legacy_settings = array();
		
		$this->settings = (object)array_merge($legacy_settings, $settings);
		
		add_action('wp_enqueue_scripts', function() {
			Plugin::$enqueueScriptsFired = true;
		});
		
		add_action('admin_enqueue_scripts', function() {
			Plugin::$enqueueScriptsFired = true;
		});
		
		if($this->settings->engine == 'open-street-map')
			require_once(plugin_dir_path(__FILE__) . 'open-street-map/class.nominatim-geocode-cache.php');
	}
	
	public function loadScripts()
	{
		if(!$this->scriptLoader)
			$this->scriptLoader = new ScriptLoader(Plugin::isProVersion());
		
		// TODO: Remove this, it's for debugging
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
		return apply_filters('wpgmza_plugin_get_localized_Data', array(
			'ajaxurl' 	=> admin_url('admin-ajax.php'),
			'settings' 	=> $this->settings
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
		// TODO: Remove this debug default
		return false;
	}
	
	public function isProVersion()
	{
		return false;
	}
}

global $wpgmza;
$wpgmza = new Plugin();
