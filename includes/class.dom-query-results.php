<?php

namespace WPGMZA;

class DOMQueryResults implements \ArrayAccess, \Countable, \Iterator
{
	private $index = 0;
	private $container;
	
	public function __construct(array $arr = null)
	{
		if(!empty($arr))
			$this->container = $arr;
		else
			$this->container = array();
	}
	
	public function __call($name, $arguments)
	{
		foreach($this->container as $element)
		{
			if(!method_exists($element, $name))
				throw new \Exception("No such method '$name' on " . get_class($element));
			
			call_user_func_array(
				array($element, $name),
				$arguments
			);
		}
		
		return $this;
	}
	
	public function offsetExists($offset)
	{
		return isset($this->container[$offset]);
	}
	
	public function offsetGet($offset)
	{
		return isset($this->container[$offset]) ? $this->container[$offset] : null;
	}
	
	public function offsetSet($offset, $value)
	{
		if(!($value instanceof DOMElement))
			throw new \Exception("Only DOMElement is permitted in query results");
		
		if(is_null($offset))
			$this->container[] = $value;
		else
			$this->container[$offset] = $value;
	}
	
	public function offsetUnset($offset)
	{
		unset($this->container[$offset]);
	}
	
	public function count()
	{
		return count($this->container);
	}
	
	public function current()
	{
		return $this->container[$this->index];
	}
	
	public function next()
	{
		$this->index++;
	}
	
	public function key()
	{
		return $this->index;
	}
	
	public function valid()
	{
		return isset($this->container[$this->key()]);
	}
	
	public function rewind()
	{
		$this->index = 0;
	}
	
	public function reverse()
	{
		$this->container = array_reverse($this->container);
		$this->rewind();
	}
}
