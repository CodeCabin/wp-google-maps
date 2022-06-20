<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class Circle extends Feature
{
	private $_center;

	public function __construct($id_or_fields=-1, $read_mode=Crud::SINGLE_READ)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_CIRCLES;
		
		$this->_center = new LatLng();
		
		Crud::__construct($WPGMZA_TABLE_NAME_CIRCLES, $id_or_fields, $read_mode);
	}
	
	protected function get_column_parameter($name)
	{
		if($name == 'center')
			return "POINT(" . floatval($this->center->lat) . " " . floatval($this->center->lng) . ")";
		
		return Crud::get_column_parameter($name);
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case "center":
				return $this->{"_$name"};
				break;
				
			default:
				break;
		}
	}
	
	public function __set($name, $value)
	{
		switch($name)
		{
			case "center":
				$this->_center = new LatLng($value);
				break;
				
			default:
				break;
		}
	}
	
	public function set($arg, $val=null)
	{
		if(is_array($arg) && isset($arg['center']))
			$arg['center'] = $this->_center = new LatLng($arg['center']);
		else if(is_object($arg) && isset($arg->center))
			$arg->center = $this->_center = new LatLng($arg->center);
		
		Crud::set($arg, $val);
	}
}