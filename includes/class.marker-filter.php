<?php

// See https://docs.google.com/document/d/16NdGw4C4cd5Q20OwQDGpMB_GiYnojz0Mrug-QRS5zoE/edit#

namespace WPGMZA;

class MarkerFilter
{
	public function __construct()
	{
		
	}
	
	public static function createInstance()
	{
		// TODO: Change this to use $wpgmza->isProVersion()
		
		if(class_exists('WPGMZA\\ProMarkerFilter'))
			return new ProMarkerFilter();
		
		return new MarkerFilter();
	}
}

/*class ProMarkerFilter extends MarkerFilter
{
	public function __construct()
	{
		
	}
}

$filter = MarkerFilter::createInstance();

var_dump($filter);
*/