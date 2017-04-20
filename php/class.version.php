<?php

namespace WPGMZA;

class Version
{
	public $major = 0;
	public $minor = 0;
	public $patch = 0;
	
	public function __construct($string)
	{
		if(!is_string($string))
			throw new \Exception('Input must be a string');
		
		if(empty($string))
			return;
		
		if(!preg_match('/(\d+)\.(\d+)\.(\d+)/', $string, $m))
			throw new \Exception('Version string must be in semantic versioning format');
		
		$this->major = (int)$m[1];
		$this->minor = (int)$m[2];
		$this->patch = (int)$m[3];
	}
	
	public function isLessThan($other)
	{
		if($this->major < $other->major ||
			$this->minor < $other->minor ||
			$this->minor < $other->minor)
			return true;
			
		return false;
	}
	
	public function isGreaterThan($other)
	{
		if($this->major > $other->major ||
			$this->minor > $other->minor ||
			$this->minor > $other->minor)
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