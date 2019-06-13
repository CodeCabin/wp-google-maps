<?php

namespace WPGMZA;

/**
 * Loads the OpenLayers map engine
 */
class OLLoader
{
	private static $olAPILoadCalled = false;
	
	/**
	 * Enqueue scripts
	 * @return void
	 */
	public function enqueueScripts()
	{
		global $wpgmza;
		
		$this->loadOpenLayers();
	}
	
	/**
	 * Loads the OpenLayers libraries and styles
	 */
	public function loadOpenLayers()
	{
		global $wpgmza;
		
		//if(Plugin::$settings->remove_api)
			//return;
		
		if(OLLoader::$olAPILoadCalled)
			return;
		
		wp_enqueue_style('wpgmza-ol-base-style', plugin_dir_url(dirname(__DIR__)) . 'lib/ol.css');
		wp_enqueue_style('wpgmza-ol-style', plugin_dir_url(dirname(__DIR__)) . 'css/open-layers.css');
		
		// TODO: Fix this, don't use this handle, use wpgmza_api_call. For some reason it won't enqueue using that. I suspect something else is using this handle. Whatever it is isn't in wpGoogleMaps.php
		if($wpgmza->isInDeveloperMode() || defined('SCRIPT_DEBUG'))
			wp_enqueue_script('wpgmza_ol_api_call', plugin_dir_url(dirname(__DIR__)) . 'lib/ol-debug.js');
		else
			wp_enqueue_script('wpgmza_ol_api_call', plugin_dir_url(dirname(__DIR__)) . 'lib/ol.js');
	}
}

