<?php

namespace WPGMZA;

require_once(__DIR__ . '/class.osm-loader.php');

/*
 * IMPORTANT:
 * Because OSMProMap needs to inherit from ProMap, any functions implemented here
 * will not be available to OSMProMap. If you're thinking of adding a function
 * here, you should probably implement it in ProMap or Map instead
 */

class OSMMap extends Map
{
	public function __construct($id, $shortcode_atts=null)
	{
		Map::__construct($id, $shortcode_atts);
		
		$loader = new OSMLoader();
		$loader->enqueueScripts();
	}
}

?>