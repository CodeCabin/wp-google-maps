<?php

namespace WPGMZA;

class Version
{
	private $_major = 0;
	private $_minor = 0;
	private $_patch = 0;
	
	public function __construct($string)
	{
		if(!is_string($string))
			throw new \Exception('Input must be a string');
		
		if(!preg_match('/(\d+)\.(\d+)\.(\d+)/', $string, $m))
			throw new \Exception('Version string must be in semantic versioning format');
		
		$this->_major = (int)$m[1];
		$this->_minor = (int)$m[2];
		$this->_patch = (int)$m[3];
	}
	
	public function isLessThan($other)
	{
		if($this->_major < $other->major ||
			$this->_minor < $other->minor ||
			$this->_minor < $other->minor)
			return true;
			
		return false;
	}
	
	public function isGreaterThan($other)
	{
		if($this->_major > $other->major ||
			$this->_minor > $other->minor ||
			$this->_minor > $other->minor)
			return true;
			
		return false;
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case 'minor':
			case 'major':
			case 'patch':
				return $this->{'_' . $name};
				break;
		}
		
		throw new \Exception('Property not found: ' . $name);
	}
	
	public function __toString()
	{
		return "{$this->major}.{$this->minor}.{$this->patch}";
	}
}

?>