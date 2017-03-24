<?php

namespace WPGMZA;

class Settings implements \IteratorAggregate, \JsonSerializable
{
	// Default settings (which aren't in DB), stored in their own array to avoid name collisions
	private $vars = [];
	
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
			$this->{$short_name} = $opt->option_value;
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
	
	// TODO: Move this to plugin settings and map settings respecitvely. Perhaps in their own classes
	protected function setDefaults()
	{
		$this->vars = [
			'access_level'			=> 'manage_options',
			'api_version'			=> '3.25',
			'map_open_marker_by'	=> '1'
		];
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
		
		// TODO: Cache which options are explicitly stored (eg have their own row in wp_options)
		$stmt = $wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}options WHERE option_name REGEXP %s", array(
			'wpgmza_' . $name
		));
		
		$explicit_option = $wpdb->get_var($stmt);
		
		if($this->map_id)
		{
			// Set the setting on the map
			//echo "Setting $name to $value for map {$this->map_id}<br/>";
			
			$this->vars[$name] = $value;
			
			// Get the settings JSON for this map
			$stmt = $wpdb->prepare("SELECT settings FROM {$wpdb->prefix}wpgmza_maps WHERE id=%d", array($this->map_id));
			$meta = $wpdb->get_var($stmt);
			
			if(!$meta)
				throw new \Exception('Map missing or invalid ID');
			
			// Update the value in the JSON
			$json = json_decode($meta);
			$json->{$name} = $value;
			
			// Put the JSON back in the database
			$meta = json_encode($json);
			$stmt = $wpdb->prepare("UPDATE {$wpdb->prefix}wpgmza_maps SET settings=%s WHERE id=%d", array(
				$this->map_id,
				$meta
			));
			$wpdb->query($stmt);
			
			return;
		}
		else if($explicit_option)
		{
			// Set the setting in wp_options
			//echo "Setting $name to $value in wp_options<br/>";
			
			$this->vars[$name] = $value;
			
			update_option('wpgmza_' . $name, $value);
			
			return;
		}
		else
		{
			// Set the setting in wp_options wpgmza_settings
			//echo "Setting $name to $value in wpgmza_settings<Br/>";
			
			$this->vars[$name] = $value;
			
			$settings = get_option('wpgmza_settings');
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