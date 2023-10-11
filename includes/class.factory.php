<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * The Factory class is a base class which can be used to make any classes
 * externally extensible. A filter is added for wpgmza_create_{class} which
 * is called by createInstance. If this filter returns a subclass of Factory,
 * that filter will override the default class and will be used.
 *
 * IMPORTANT: Any objects which subclass Factory MUST be created by calling
 * createInstance on the subclass. Calling new on the constructor directly will
 * not cause this filter to fire, and the extended class will not be used.
 */
#[\AllowDynamicProperties]
class Factory
{
	/**
	 * Creates an instance of the desired subclass, this will return the default instance if no filter is used to override the process, or will return the extended class if a filter has been bound
	 * @throws \Exception
	 */
	public static function createInstance()
	{
		$class = get_called_class();
		$args = func_get_args();
		$count = count($args);
		$filter = "wpgmza_create_$class";


		if($class == 'WPGMZA\\Factory')
			throw new \Exception('Factory createInstance would return abstract Factory');
		
		// TODO: If the created object is a descendant of CRUD 
		if(empty($args)){
			if(is_subclass_of($class, '\\WPGMZA\\Crud'))
				$filter_args = array($filter, -1);
			else
				$filter_args = array($filter, null);
		}
		else
			$filter_args = array_merge(array($filter), $args);
		
		/* Developer Hook (Filter) - Apply CRUD class filters */
		$override = call_user_func_array('apply_filters', $filter_args);
		

		// NB: This stops override being the same as the first argument, which is needed for example when passing a Map as the first argument of StoreLocator
		if(count($args) && $args[0] === $override)
			$override = null;
		
		if($override instanceof \WPGMZA\Factory)
			return $override;
		
		$reflect = new \ReflectionClass($class);
		$instance = $reflect->newInstanceArgs($args);
		
		return $instance;
	}
}
