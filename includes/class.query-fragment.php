<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class QueryFragment implements \ArrayAccess, \Countable
{
	private $nextIndex = 0;
	
	public function offsetExists($offset)
	{
		return property_exists($this, $offset);
	}
	
	public function offsetGet($offset)
	{
		return $this->{$offset};
	}
	
	public function offsetSet($offset, $value)
	{
		if(!$offset)
			$offset = $this->nextIndex++;
		
		$this->{$offset} = $value;
	}
	
	public function offsetUnset($offset)
	{
		unset($this->{$offset});
	}
	
	public function reset()
	{
		foreach($this as $key => $value)
			unset($this->{$key});
	}
	
	public function toArray()
	{
		$arr = (array)$this;
		
		array_shift($arr);
		
		return $arr;
	}
	
	public function count()
	{
		$count = 0;
		
		foreach($this as $key => $value)
			$count++;
		
		return $count;
	}
}

class_alias('WPGMZA\\QueryFragment', 'WPGMZA\\QueryFields');
