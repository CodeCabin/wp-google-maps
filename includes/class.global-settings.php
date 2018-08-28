<?php

namespace WPGMZA;

class GlobalSettings
{
	private static $migrationRequired = false;
	
	private $data;
	
	public function __construct()
	{
		$this->reload();
			
		if(empty($this->data))
			$this->migrate();
	}
	
	public function reload()
	{
		$string = get_option('wpgmza_global_settings');
		if(empty($string))
			$this->data = (object)array();
		else
		{
			$this->data = json_decode($string);
			
			if(!$this->data)
				throw new \Exception('wpgmza_global_settings is not valid JSON');
		}
	}
	
	protected static function createInstanceDelegate()
	{
		//var_dump("It doesn't work");
		//exit;
		
		return new GlobalSettings();
	}
	
	public static function createInstance()
	{
		return static::createInstanceDelegate();
	}

	/**
	 * Migrates old settings (< 7.11.*), merges WPGMZA_SETTINGS and WPGMZA_OTHER_SETTINGS into wpgmza_global_settings (JSON)
	 * @return void
	 */
	private function migrate()
	{
		if(GlobalSettings::$migrationRequired)
			return;
		
		$settings 			= get_option('WPGMZA_SETTINGS');
		$other_settings		= get_option('WPGMZA_OTHER_SETTINGS');
		
		$json = json_encode( array_merge($settings, $other_settings) );
		
		update_option('wpgmza_global_settings', $json);
		
		$this->reload();
	}
	
	/**
	 * Used to set values, optionally in bulk
	 * @param $arg (string|array) Either a string naming the setting to be set, or an object / array of settings to set in bulk
	 * @param $val (optional) Where a string is given as the first parameter, pass the value you want to assign here
	 * @return $this
	 */
	public function set($arg, $val=null)
	{
		throw new \Exception('Not yet implemented');
		
		return $this;
	}
	
	public function toArray()
	{
		throw new \Exception('Not yet implemented');
	}
}