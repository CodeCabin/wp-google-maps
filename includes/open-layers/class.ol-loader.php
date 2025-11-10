<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * Loads the OpenLayers map engine
 */
class OLLoader {
	const VERSION_TYPE_LATEST = 'latest';
	const VERSION_TYPE_LEGACY = 'legacy';

	const VERSION_LATEST = '10.6.0';

	private static $olAPILoadCalled = false;
	
	private $version; 

	public function __construct($version = self::VERSION_TYPE_LATEST){
		$this->version = $version;	
	}
	/**
	 * Enqueue scripts
	 * @return void
	 */
	public function enqueueScripts() {
		global $wpgmza;
		$this->loadOpenLayers();
	}
	
	/**
	 * Loads the OpenLayers libraries and styles
	 */
	public function loadOpenLayers() {
		global $wpgmza;
		
		if(OLLoader::$olAPILoadCalled){
			return;
		}
		
		$library = (object) array(
			'css' => false,
			'js' => false,
			'style' => false
		);

		switch($this->version){
			case self::VERSION_TYPE_LEGACY:
				$library->style = plugin_dir_url(dirname(__DIR__)) . 'css/open-layers.css';

				$library->css = plugin_dir_url(dirname(__DIR__)) . 'lib/ol.css';
				$library->js = plugin_dir_url(dirname(__DIR__)) . 'lib/ol.js';
				break;
			case self::VERSION_TYPE_LATEST:
			default:
				$library->style = plugin_dir_url(dirname(__DIR__)) . 'css/open-layers-latest.css';

				$library->css = "https://cdn.jsdelivr.net/npm/ol@v" . self::VERSION_LATEST . "/ol.css";
				$library->js = "https://cdn.jsdelivr.net/npm/ol@v" . self::VERSION_LATEST . "/dist/ol.js";
				break;
		}

		$library = apply_filters('wpgmza-ol-loader-assets', $library);

		wp_enqueue_style('wpgmza-ol-base-style', $library->css);
		wp_enqueue_style('wpgmza-ol-style', $library->style);

		$scriptArgs = apply_filters('wpgmza-get-scripts-arguments', array());
		
		wp_enqueue_script('wpgmza_ol_api_call', $library->js, false, false, $scriptArgs);

		/* Load the vector library for vector style tilesets */
		wp_enqueue_script('wpgmza-ol-olms', 'https://unpkg.com/ol-mapbox-style@13.0.1/dist/olms.js', false, false, $scriptArgs);
		
	}
}

