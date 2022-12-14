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
	
	#[\ReturnTypeWillChange]
	public function offsetExists($offset)
	{
		return isset($this->container[$offset]);
	}
	
	#[\ReturnTypeWillChange]
	public function offsetGet($offset)
	{
		return isset($this->container[$offset]) ? $this->container[$offset] : null;
	}
	
	#[\ReturnTypeWillChange]
	public function offsetSet($offset, $value)
	{
		if(!($value instanceof DOMElement))
			throw new \Exception("Only DOMElement is permitted in query results");
		
		if(is_null($offset))
			$this->container[] = $value;
		else
			$this->container[$offset] = $value;
	}
	
	#[\ReturnTypeWillChange]
	public function offsetUnset($offset)
	{
		unset($this->container[$offset]);
	}
	
	#[\ReturnTypeWillChange]
	public function count()
	{
		return count($this->container);
	}
	
	#[\ReturnTypeWillChange]
	public function current()
	{
		return $this->container[$this->index];
	}
	
	#[\ReturnTypeWillChange]
	public function next()
	{
		$this->index++;
	}
	
	#[\ReturnTypeWillChange]
	public function key()
	{
		return $this->index;
	}
	
	#[\ReturnTypeWillChange]
	public function valid()
	{
		return isset($this->container[$this->key()]);
	}

	#[\ReturnTypeWillChange]
	public function rewind()
	{
		$this->index = 0;
	}
	
	#[\ReturnTypeWillChange]
	public function reverse()
	{
		$this->container = array_reverse($this->container);
		$this->rewind();
	}
}
