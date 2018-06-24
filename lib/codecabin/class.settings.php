<?php

namespace codecabin;

class Settings implements \ArrayAccess, \JsonSerializable, \IteratorAggregate
{
	private $data;
	private $option_name;
	
	public function __construct($option_name)
	{
		if(empty($option_name) || !is_string($option_name))
			throw new \Exception('Invalid option name');
		
		$this->option_name = $option_name;
		
		$option_value = get_option($this->option_name);
		
		if(empty($option_value))
			$this->data = (object)array();
		else if(!($this->data = json_decode($option_value)))
			throw new \Exception("Option value is not valid JSON");
	}
	
	
	public function __get($name)
	{
		if(!isset($this->data->{$name}))
			return null;
		
		return ($this->data->{$name});
	}
	
	public function __set($name, $value)
	{
		$this->data->{$name} = $value;
		$this->update();
	}
	
	public function __isset($name)
	{
		return isset($this->data->{$name});
	}
	
	public function __unset($name)
	{
		unset($this->data->{$name});
		$this->update();
	}
	
	public function offsetExists($offset)
	{
		return isset($this->data->{$offset});
	}
	
	public function offsetGet($offset)
	{
		return $this->data->{$offset};
	}
	
	public function offsetSet($offset, $value)
	{
		$this->data->{$offset} = $value;
		$this->update();
	}
	
	public function offsetUnset($offset)
	{
		unset($this->data->{$offset});
		$this->update();
	}
	
	public function jsonSerialize()
	{
		return $this->data;
	}
	
	public function getIterator()
	{
		return new \ArrayIterator($this->data);
	}
	
	/**
	 * Used to set values, optionally in bulk
	 * @param $arg (string|array) Either a string naming the setting to be set, or an object / array of settings to set in bulk
	 * @param $val (optional) Where a string is given as the first parameter, pass the value you want to assign here
	 * @return $this
	 */
	public function set($arg, $val=null)
	{
		if(is_string($arg))
			$this->data->{$arg} = $val;
		
		else if(is_object($arg) || is_array($arg))
		{
			if($val != null)
				trigger_error("Settings::set called incorrectly, second argument will be ignored", E_USER_WARNING);
			
			foreach($arg as $key => $val)
				$this->data->{$key} = $val;
		}
		
		$this->update();
		
		return $this;
	}
	
	public function toArray()
	{
		return (array)$this->data;
	}
	
	protected function update()
	{
		$str = json_encode($this->data);
		update_option($this->option_name, $str);
	}
	
	
}
