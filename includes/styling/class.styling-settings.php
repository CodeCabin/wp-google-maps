<?php
/*
 * Manages custom styles 
*/

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class StylingSettings extends Settings{
	const TABLE_NAME = 'wpgmza_component_styling';

	public function __construct(){
		$self = $this;		
		Settings::__construct(StylingSettings::TABLE_NAME);
	}

	public function __set($name, $value){
		if($name == 'action'){
			return;
		}
		Settings::__set($name, $value);
	}
	
	public function __get($name){
		return Settings::__get($name);
	}

	public static function createInstance(){
		$class = get_called_class();
		$args = func_get_args();
		$count = count($args);
		$filter = "wpgmza_create_$class";
		
		if(empty($args))
			$filter_args = array($filter, null);
		else
			$filter_args = array_merge(array($filter), $args);
		
		/* Developer Hook (Filter) - Apply styling page instance filter, allows class overrides */
		$override = call_user_func_array('apply_filters', $filter_args);
		
		if($override)
			return $override;
		
		$reflect = new \ReflectionClass($class);
		$instance = $reflect->newInstanceArgs($args);
		
		return $instance;
	}

	public function jsonSerialize()
	{
		$src = Settings::jsonSerialize();
		$data = clone $src;
		
		return $data;
	}
	
	public function toArray(){
		$src = Settings::toArray();
		$data = (array)$src;

		return $data;
	}
}