<?php

namespace WPGMZA;

class OSMLoader
{
	private static $osmAPILoadCalled = false;
	
	/**
	 * Enqueue scripts
	 * @return void
	 */
	public function enqueueScripts()
	{
		global $wpgmza;
		
		$this->loadOpenStreetMap();
		
		$dependencyVersion = ($wpgmza->isProVersion() ? 'pro-' : '');
		
		wp_enqueue_script('wpgmza-osm-drawing-manager', 	WPGMZA_BASE . 'js/open-street-map/osm-drawing-manager.js', 	array('wpgmza-drawing-manager'));
		wp_enqueue_script('wpgmza-osm-geocoder', 			WPGMZA_BASE . 'js/open-street-map/osm-geocoder.js', 		array('wpgmza-geocoder'));
		wp_enqueue_script('wpgmza-osm-info-window', 		WPGMZA_BASE . 'js/open-street-map/osm-info-window.js', 		array("wpgmza-{$dependencyVersion}info-window"));
		wp_enqueue_script('wpgmza-osm-map-edit-page',	 	WPGMZA_BASE . 'js/open-street-map/osm-map-edit-page.js',  	array("wpgzma-{$dependencyVersion}map-edit-page"));
		wp_enqueue_script('wpgmza-osm-map', 				WPGMZA_BASE . 'js/open-street-map/osm-map.js', 				array("wpgmza-{$dependencyVersion}map"));
		wp_enqueue_script('wpgmza-osm-marker', 				WPGMZA_BASE . 'js/open-street-map/osm-marker.js', 			array("wpgmza-{$dependencyVersion}marker"));
		wp_enqueue_script('wpgmza-osm-polygon', 			WPGMZA_BASE . 'js/open-street-map/osm-polygon.js', 			array("wpgmza-{$dependencyVersion}polygon"));
		wp_enqueue_script('wpgmza-osm-polyline', 			WPGMZA_BASE . 'js/open-street-map/osm-polyline.js', 		array('wpgmza-polyline'));
		wp_enqueue_script('wpgmza-osm-store-locator', 		WPGMZA_BASE . 'js/open-street-map/osm-store-locator.js', 	array('wpgmza-store-locator'));
		wp_enqueue_script('wpgmza-osm-drawing-manager', 	WPGMZA_BASE . 'js/open-street-map/osm-drawing-manager.js',	array('wpgmza-core'));

		do_action( 'wpgmza_osm_loader_scripts' );
		
	}
	
	public function loadOpenStreetMap()
	{
		if(Plugin::$settings->remove_api)
			return;
		
		if(OSMLoader::$osmAPILoadCalled)
			return;
		
		wp_enqueue_style('wpgmza-osm-base-style', WPGMZA_BASE . 'lib/ol.css');
		if(defined('SCRIPT_DEBUG') && SCRIPT_DEBUG)
			wp_enqueue_script('wpgmza-osm-api-call', WPGMZA_BASE . 'lib/ol-debug.js');
		else
			wp_enqueue_script('wpgmza-osm-api-call', WPGMZA_BASE . 'lib/ol.js');
		
		wp_enqueue_style('wpgmza-osm-style', WPGMZA_BASE . 'css/open-street-map.css');
	}
}

?>