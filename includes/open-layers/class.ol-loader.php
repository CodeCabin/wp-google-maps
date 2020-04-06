<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

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
		
		wp_enqueue_script('wpgmza_ol_api_call', plugin_dir_url(dirname(__DIR__)) . 'lib/ol.js');
	}
}

