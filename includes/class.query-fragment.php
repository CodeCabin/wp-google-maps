<?php

namespace WPGMZA;

class QueryFragment implements \ArrayAccess
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
}

class_alias('WPGMZA\\QueryFragment', 'WPGMZA\\QueryFields');
