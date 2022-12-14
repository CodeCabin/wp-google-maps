<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class QueryFragment implements \ArrayAccess, \Countable
{
	private $nextIndex = 0;
	
	#[\ReturnTypeWillChange]
	public function offsetExists($offset)
	{
		return property_exists($this, $offset);
	}
	
	#[\ReturnTypeWillChange]
	public function offsetGet($offset)
	{
		return $this->{$offset};
	}
	
	#[\ReturnTypeWillChange]
	public function offsetSet($offset, $value)
	{
		if(!$offset)
			$offset = $this->nextIndex++;
		
		$this->{$offset} = $value;
	}
	
	#[\ReturnTypeWillChange]
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
	
	#[\ReturnTypeWillChange]
	public function count()
	{
		$count = 0;
		
		foreach($this as $key => $value)
			$count++;
		
		return $count - 1;
	}
	
	public function clear()
	{
		foreach($this as $key => $value)
		{
			if($key == 'nextIndex')
				continue;
				
			unset($this->{$key});
		}
	}
}

class_alias('WPGMZA\\QueryFragment', 'WPGMZA\\QueryFields');
