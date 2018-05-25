<?php

namespace WPGMZA;

class LatLng
{
	const REGEXP = '/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/';
	
	private $_lat;
	private $_lng;
	
	public function __construct($arg=null, $lng=null)
	{
		$this->_lat = 0;
		$this->_lng = 0;
		
		if($arg === null && $lng === null)
			return;
		
		if($lng === null)
		{
			if(is_string($arg))
			{
				$str = trim($arg, '() ');
				
				if(!preg_match(LatLng::REGEXP, $str, $m))
					throw new \Exception('Invalid LatLng string');
				
				$arg = array(
					'lat' => $m[1],
					'lng' => $m[3]
				);
			}
			
			if(!is_object($arg) && !is_array($arg))
				throw new \Exception('Argument must be a LatLng literal');
			
			$obj = (object)$arg;
			
			if(!property_exists($obj, 'lat') || !property_exists($obj, 'lng'))
				throw new \Exception('Argument must define lat and lng');
			
			$this->lat = $obj->lat;
			$this->lng = $obj->lng;
		}
		else
		{
			$this->lat = $arg;
			$this->lng = $lng;
		}
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case "lat":
				return $this->_lat;
				break;
				
			case "lng":
				return $this->_lng;
				break;
				
			default:
				return $this->{$name};
				break;
		}
	}
	
	public function __set($name, $value)
	{
		switch($name)
		{
			case "lat":
			case "lng":
				if(!is_numeric($value))
					throw new \Exception('Value must be numeric');
			
				$this->{"_$name"} = floatval($value);
			
				break;
			
			default:
				$this->{$name} = $value;
				break;
		}
	}
	
	public function __toString()
	{
		return "{$this->_lat}, {$this->_lng}";
	}
}
