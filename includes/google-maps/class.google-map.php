<?php

namespace WPGMZA;

require_once(plugin_dir_path(__DIR__) . 'google-maps/class.google-maps-loader.php');

/*
 * IMPORTANT:
 * Because GoogleProMap needs to inherit from ProMap, any functions implemented here
 * will not be available to GoogleProMap. If you're thinking of adding a function
 * here, you should probably implement it in ProMap or Map instead
 */

class GoogleMap extends Map
{
	public function __construct($id, $shortcode_atts=null)
	{
		Map::__construct($id, $shortcode_atts);
	}
}

?>