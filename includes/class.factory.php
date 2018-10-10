<?php

namespace WPGMZA;

class Factory
{
	public static function createInstance()
	{
		$class = get_called_class();
		$args = func_get_args();
		$count = count($args);
		$filter = "wpgmza_create_$class";

		if($class == 'WPGMZA\Factory')
			throw new \Exception('Factory createInstance would return abstract Factory');
		
		if(empty($args))
			$filter_args = array($filter, null);
		else
			$filter_args = array_merge(array($filter), $args);
		
		$override = call_user_func_array('apply_filters', $filter_args);
		
		if($override instanceof \WPGMZA\Factory)
			return $override;
		
		$reflect = new \ReflectionClass($class);
		$instance = $reflect->newInstanceArgs($args);
		
		return $instance;
	}
}
