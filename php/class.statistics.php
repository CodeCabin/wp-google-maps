<?php

namespace WPGMZA;

class Statistics
{
	public function __construct()
	{
		$src = get_option('wpgmza_statistics');
		
		if(!$src)
			return;
		
		$json = json_decode($src);
		foreach($json as $key => $value)
			$this->{$key} = $value;
	}
	
	protected function createIfNotExists($name)
	{
		if(!isset($this->{$name}))
			$this->{$name} = (object)array(
				'first_accessed' => date('Y-m-d H:i:s'),
				'views' => 0
			);
	}
	
	public function __get($name)
	{
		$this->createIfNotExists($name);
		return $this->{$name};
	}
	
	public function touch($name)
	{
		$this->createIfNotExists($name);
		$this->{$name}->last_accessed = date('Y-m-d H:i:s');
		$this->{$name}->views++;
			
		$this->save();
	}
	
	public function save()
	{
		update_option('wpgmza_statistics', json_encode($this));
	}
}

?>