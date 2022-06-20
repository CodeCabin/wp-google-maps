<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * This class represents a latitude and longitude coordinate pair, provides type consistency for latitude and longitude, and some utility functions
 */
class LatLng implements \JsonSerializable
{
	/**
	 * @const A regular expression to match a coordinate pair from a string. The latitdue and longitude will be in matches 1 and 3 respectively.
	 */
	const REGEXP = '/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/';
	
	private $_lat;
	private $_lng;
	
	/**
	 * Constructor
	 * @param mixed $arg Can be a string matching LatLng::REGEXP, or an object/array with lat and lng set.
	 * @param mixed $lng Where $arg is a number, it will be treated as a float, you should supply a number to $lng too.
	 */
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
				$str = $arg;
				$str = trim($str, '() ');
				
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
	
	/**
	 * Gets the specified property.
	 */
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
	
	/**
	 * Sets the specified property.
	 * @throws \Exception The value is not numeric (int, float or a numeric string)
	 */
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
	
	/**
	 * Returns this coordinate pair as a comma separated string.
	 */
	public function __toString()
	{
		return "{$this->_lat}, {$this->_lng}";
	}
	
	public function jsonSerialize()
	{
		return array(
			'lat'	=> $this->_lat,
			'lng'	=> $this->_lng
		);
	}
}
