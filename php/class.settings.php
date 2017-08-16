<?php

namespace WPGMZA;

class Settings implements \IteratorAggregate, \JsonSerializable
{
	// Default settings (which aren't in DB), stored in their own array to avoid name collisions
	private $explicit_options;
	private $vars = array();
	
	// Load settings from database
	public function __construct()
	{
		global $wpdb;
		
		$this->setDefaults();

		// Fetch settings out of wp_options
		$options = $wpdb->get_results("SELECT option_name, option_value 
			FROM {$wpdb->prefix}options 
			WHERE option_name REGEXP '^wpgmza' 
			AND option_name NOT REGEXP '(wpgmza_(other_)?settings)|(wpgmza_stat(istic)?s)|(wpgmza_pro)'"
		);
		
		foreach($options as $opt)
		{
			$short_name = $this->standardizeName($opt->option_name);
			$this->vars[$short_name] = $opt->option_value;
		}
		
		// Fetch settings out of wpgmza_settings
		$settings_json = get_option('wpgmza_settings');
		if(!empty($settings_json))
		{
			$settings_json = json_decode($settings_json, true);
			foreach($settings_json as $key => $value)
				$this->vars[$key] = $value;
		}
	}
	
	public function getIterator()
	{
		return new \ArrayIterator($this->vars);
	}
	
	public function jsonSerialize()
	{
		return $this->vars;
	}
	
	protected function setDefaults()
	{
		$this->vars = array(
			'access_level'			=> 'manage_options',
			'api_version'			=> '3.28',
			'info_window_open_by'	=> '1',
			'info_window_link_text'	=> __('More details', 'wp-google-maps')
		);
	}
	
	protected function standardizeName($name)
	{
		return strtolower(
			preg_replace('/^wpgmza_(settings_)?/i', '', $name)
		);
	}
	
	public function __get($name)
	{
		if(isset($this->vars[$name]))
			return $this->vars[$name];
		
		return null;
	}
	
	public function __isset($name)
	{
		return isset($this->vars[$name]);
	}
	
	public function __set($name, $value)
	{
		global $wpdb;
		
		// Has the user just enabled usage tracking?
		if($name == 'enable_usage_tracking' && $value == 'yes')
			Plugin::requestCoupon();
		
		// Force these options to be stored in wp_options, and NOT in wpgmza_settings
		$force_explicit = array(
			'google_maps_api_key'
		);
		
		// TODO: Cache which options are explicitly stored (eg have their own row in wp_options)
		$stmt = $wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}options WHERE option_name REGEXP %s", array(
			'wpgmza_' . $name
		));
		
		$explicit_option = $wpdb->get_var($stmt) || array_search($name, $force_explicit);
		
		if($explicit_option)
		{
			// Set the setting in wp_options
			$this->vars[$name] = $value;
			
			update_option('wpgmza_' . $name, $value);
			
			return;
		}
		else
		{
			// Set the setting in wp_options wpgmza_settings
			$this->vars[$name] = $value;
			
			$settings = get_option('wpgmza_settings');
			
			if(empty($settings))
				$json = new \stdClass();
			else
				$json = json_decode($settings);
			
			$json->{$name} = $value;
			
			$settings = json_encode($json);
			update_option('wpgmza_settings', $settings);
			
			return;
		}
		
		throw new \Exception('Don\'t know where to save setting "'.$name.'"');
	}
}

?>