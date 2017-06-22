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
		$this->loadOpenStreetMap();
		
		$files = glob(WPGMZA_DIR . 'js/open-street-map/*.js');
		foreach($files as $file)
		{
			if(preg_match('/(-map-edit-page|-drawing-manager)\.js$/i', $file))
				continue;
			
			$basename = basename($file);
			$handle = basename($file, '.js');
			
			wp_enqueue_script($handle, WPGMZA_BASE . "js/open-street-map/$basename", array('wpgmza-core'));
		}
	}
	
	public function loadOpenStreetMap()
	{
		if(Plugin::$settings->remove_api)
			return;
		
		if(OSMLoader::$osmAPILoadCalled)
			return;
		
		wp_enqueue_style('wpgmza-osm-base-style', 'https://openlayers.org/en/v4.1.1/css/ol.css');
		wp_enqueue_script('wpgmza-osm-api-call', 'https://openlayers.org/en/v4.1.1/build/ol.js');
		
		wp_enqueue_style('wpgmza-osm-style', WPGMZA_BASE . 'css/open-street-map.css');
	}
}

?>