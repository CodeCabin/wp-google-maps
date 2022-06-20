<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class GlobalSettings extends Settings
{
	const TABLE_NAME = 'wpgmza_global_settings';
	const LEGACY_TABLE_NAME = 'WPGMZA_OTHER_SETTINGS';
	
	private $updatingLegacySettings = false;
	
	public function __construct()
	{
		// TODO: Update XML locations here
		
		$self = $this;
		
		$legacy_settings_exist = (get_option(GlobalSettings::LEGACY_TABLE_NAME) ? true : false);
		$settings_exist = (get_option(GlobalSettings::TABLE_NAME) ? true : false);
		
		if($legacy_settings_exist && !$settings_exist)
			$this->migrate();
		
		Settings::__construct(GlobalSettings::TABLE_NAME);
		
		if(!empty(get_option('wpgmza_google_maps_api_key')))
		{
			$this->wpgmza_google_maps_api_key = get_option('wpgmza_google_maps_api_key');
		}
		
		if(!$legacy_settings_exist && !$settings_exist)
			$this->install();
		
		// Defaults for directories
		if (empty(get_option("wpgmza_xml_location")))
		{
			$upload_dir = wp_upload_dir();
			add_option("wpgmza_xml_location",'{uploads_dir}/wp-google-maps/');
		}
		
		if(empty(get_option("wpgmza_xml_url")))
		{
			$upload_dir = wp_upload_dir();
			add_option("wpgmza_xml_url",'{uploads_url}/wp-google-maps/');
		}
		
		$this->wpgmza_marker_xml_location	= $this->getXMLCacheDirPath();
		$this->wpgmza_marker_xml_url		= $this->getXMLCacheDirURL();
		
		// Legacy Pro support. Users with older Pro will lose settings 
		add_filter('pre_update_option_WPGMZA_OTHER_SETTINGS', array($this, 'onPreUpdateLegacySettings'), 10, 2);
	}
	
	public function __set($name, $value)
	{
		switch($name)
		{
			case "wpgmza_google_maps_api_key":
				// NB: Legacy support
				update_option('wpgmza_google_maps_api_key', $value);
				break;
				
			case "wpgmza_marker_xml_location":
				
				// NB: Dreadful hack, it seems you can either have slashes constantly doubling up, or no slashes. Suspect fighting with legacy code, no time to fix this now. This should at least stop slashes accumulating on Windows machines.
				$value = preg_replace("#\\{2,}#", "\\", $value);
				update_option('wpgmza_xml_location', $value);
				
				break;
			
			case "wpgmza_marker_xml_url":
				update_option('wpgmza_xml_url', $value);
				break;
				
			case "wpgmza_maps_engine":
				// NB: Support difference in names
				Settings::__set("engine", $value);
				break;
		}
		
		Settings::__set($name, $value);
	}
	
	public function __get($name)
	{
		if($name == 'useLegacyHTML')
			return true;
		
		return Settings::__get($name);
	}
	
	// TODO: This should inherit from Factory when traits are available
	public static function createInstance()
	{
		$class = get_called_class();
		$args = func_get_args();
		$count = count($args);
		$filter = "wpgmza_create_$class";
		
		if(empty($args))
			$filter_args = array($filter, null);
		else
			$filter_args = array_merge(array($filter), $args);
		
		/* Developer Hook (Filter) - Call global class overrie, which can be used to replace the PHP class, similarly to inheritence. We recommend using Factory for most classes */
		$override = call_user_func_array('apply_filters', $filter_args);
		
		if($override)
			return $override;
		
		$reflect = new \ReflectionClass($class);
		$instance = $reflect->newInstanceArgs($args);
		
		return $instance;
	}
	
	public function getDefaults()
	{
		/* Developer Hook (Filter) - Add or alter default plugin installation settings */
		$settings = apply_filters('wpgmza_plugin_get_default_settings', array(
			'engine' 				=> 'google-maps',
			'internal_engine'		=> InternalEngine::getRandomEngine(),
			'google_maps_api_key'	=> get_option('wpgmza_google_maps_api_key'),
			'default_marker_icon'	=> Marker::DEFAULT_ICON,
			'developer_mode'		=> false,
			'user_interface_style'	=> "default",
		));
		
		return $settings;
	}
	
	private function getXMLCacheDirPath()
	{
		$file = get_option("wpgmza_xml_location");
		$content_dir = WP_CONTENT_DIR;
		$content_dir = trim($content_dir, '/');
		if (defined('WP_PLUGIN_DIR')) {
			$plugin_dir = str_replace(wpgmza_get_document_root(), '', WP_PLUGIN_DIR);
			$plugin_dir = trim($plugin_dir, '/');
		} else {
			$plugin_dir = str_replace(wpgmza_get_document_root(), '', WP_CONTENT_DIR . '/plugins');
			$plugin_dir = trim($plugin_dir, '/');
		}
		$upload_dir = wp_upload_dir();
		$upload_dir = $upload_dir['basedir'];
		$upload_dir = rtrim($upload_dir, '/');
		
		$file = str_replace('{wp_content_dir}', $content_dir, $file);
		$file = str_replace('{plugins_dir}', $plugin_dir, $file);
		$file = str_replace('{uploads_dir}', $upload_dir, $file);
		$file = trim($file);
		
		if (empty($file))
			$file = $upload_dir."/wp-google-maps/";
		
		if (substr($file, -1) != "/") { $file = $file."/"; }
		
		return $file;
	}
	
	private function getXMLCacheDirURL()
	{
		$url = get_option("wpgmza_xml_url");
		
		$content_url = content_url();
		$content_url = trim($content_url, '/');
		 
		$plugins_url = plugins_url();
		$plugins_url = trim($plugins_url, '/');
		 
		$upload_url = wp_upload_dir();
		$upload_url = $upload_url['baseurl'];
		$upload_url = trim($upload_url, '/');

		$url = str_replace('{wp_content_url}', $content_url, $url);
		$url = str_replace('{plugins_url}', $plugins_url, $url);
		$url = str_replace('{uploads_url}', $upload_url, $url);
		
		$url = str_replace('{wp_content_dir}', $content_url, $url);
		$url = str_replace('{plugins_dir}', $plugins_url, $url);
		$url = str_replace('{uploads_dir}', $upload_url, $url);

		if (empty($url))
			$url = $upload_url."/wp-google-maps/";
		
		if (substr($url, -1) != "/") { $url = $url."/"; }

		return $url;
	}
	
	public function onPreUpdateLegacySettings($new_value, $old_value)
	{
		// Merge legacy settings into this settings
		if(!$this->updatingLegacySettings)
			$this->set($new_value);
		
		return $new_value;
	}
	
	protected function update()
	{
		Settings::update();
		
		// Legacy Pro support
		$this->updatingLegacySettings = true;
		
		$legacy = $this->toArray();
		
		update_option(GlobalSettings::LEGACY_TABLE_NAME, $legacy);
		
		$this->updatingLegacySettings = false;
	}
	
	protected function install()
	{
		$this->set( $this->getDefaults() );
	}
	
	protected function migrate()
	{
		$legacy = get_option(GlobalSettings::LEGACY_TABLE_NAME);
		
		$json = json_encode($legacy);
		
		update_option(GlobalSettings::TABLE_NAME, $json);
	}
	
	public function jsonSerialize()
	{
		$src = Settings::jsonSerialize();
		$data = clone $src;
		
		if(isset($data->wpgmza_settings_ugm_email_address))
			unset($data->wpgmza_settings_ugm_email_address);
		
		if(isset($data->ugmEmailAddress))
			unset($data->ugmEmailAddress);
		
		return $data;
	}
	
	public function toArray()
	{
		$src = Settings::toArray();
		$data = (array)$src;
		
		if(isset($data['wpgmza_settings_ugm_email_address']))
			unset($data['wpgmza_settings_ugm_email_address']);
		
		if(isset($data['ugmEmailAddress']))
			unset($data['ugmEmailAddress']);
		
		return $data;
	}
}
