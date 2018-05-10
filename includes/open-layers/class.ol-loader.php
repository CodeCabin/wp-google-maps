<?php

namespace WPGMZA;

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
		
		$this->loadOpenLayer();
	}
	
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
		wp_enqueue_script('wpgmza_ol_api_call', plugin_dir_url(dirname(__DIR__)) . 'lib/' . ($wpgmza->isUsingMinifiedScripts() ? 'ol.js' : 'ol-debug.js'));
		//wp_enqueue_script('wpgmza_api_call', plugin_dir_url(dirname(__DIR__)) . 'lib/' . ($wpgmza->isUsingMinifiedScripts() ? 'ol.js' : 'ol-debug.js'));
	}
}

