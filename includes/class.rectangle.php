<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class Rectangle extends Feature
{
	private $_cornerA;
	private $_cornerB;
	
	public function __construct($id_or_fields=-1, $read_mode=Crud::SINGLE_READ)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_RECTANGLES;
		
		$this->_cornerA = new LatLng();
		$this->_cornerB = new LatLng();
		
		Crud::__construct($WPGMZA_TABLE_NAME_RECTANGLES, $id_or_fields, $read_mode);
	}
	
	protected function get_column_parameter($name)
	{
		switch($name)
		{
			case "cornerA":
			case "cornerB":
				return "POINT(" . floatval($this->{"_$name"}->lat) . " " . floatval($this->{"_$name"}->lng) . ")";
				break;
			
			default:
				break;
		}
		
		return Crud::get_column_parameter($name);
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case "cornerA":
			case "cornerB":
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
			case "cornerA":
			case "cornerB":
				$this->{"_$name"} = new LatLng($value);
				break;
				
			default:
				break;
		}
	}
	
	public function set($arg, $val=null)
	{
		if(is_array($arg) && isset($arg['cornerA']))
			$arg['cornerA'] = $this->_cornerA = new LatLng($arg['cornerA']);
		else if(is_object($arg) && isset($arg->cornerA))
			$arg->cornerA = $this->_cornerA = new LatLng($arg->cornerA);
		
		if(is_array($arg) && isset($arg['cornerB']))
			$arg['cornerB'] = $this->_cornerB = new LatLng($arg['cornerB']);
		else if(is_object($arg) && isset($arg->cornerB))
			$arg->cornerB = $this->_cornerB = new LatLng($arg->cornerB);
		
		Crud::set($arg, $val);
	}
}