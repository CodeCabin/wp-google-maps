<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * Loads the OpenLayers map engine
 */
class LeafletLoader extends Factory {
	const VERSION_LATEST = "1.9.4";
	const DRAWING_VERSION = "1.0.4";
	const MAP_LIBRE_VERSION = "5.6.1";
	const MAP_LIBRE_LEAFLET_VERSION = "0.1.1";

	private static $leafletAPILoadCalled = false;

	public function __construct(){

	}

	/**
	 * Enqueue scripts
	 * @return void
	 */
	public function enqueueScripts() {
		global $wpgmza;
		$this->load();
	}
	
	/**
	 * Loads the OpenLayers libraries and styles
	 */
	public function load() {
		global $wpgmza;
		
		if(LeafletLoader::$leafletAPILoadCalled){
			return;
		}
		
		$library = (object) array(
			'css' => "https://unpkg.com/leaflet@" . self::VERSION_LATEST . "/dist/leaflet.css",
			'js' => "https://unpkg.com/leaflet@" . self::VERSION_LATEST . "/dist/leaflet.js",
			'style' => plugin_dir_url(dirname(__DIR__)) . 'css/leaflet.css',
			'plugins' => array(
				/* Support for vector layers */
				'maplibre-gl' => (object) array(
					'css' => 'https://unpkg.com/maplibre-gl@' . self::MAP_LIBRE_VERSION . '/dist/maplibre-gl.css',
					'js' => 'https://unpkg.com/maplibre-gl@' . self::MAP_LIBRE_VERSION . '/dist/maplibre-gl.js'
				),
				'maplibre-gl-leaflet' => (object) array(
					'js' => 'https://unpkg.com/@maplibre/maplibre-gl-leaflet@' . self::MAP_LIBRE_LEAFLET_VERSION . '/leaflet-maplibre-gl.js'
				)
			)
		);

		if(is_admin() && !empty($wpgmza->getCurrentPage())){
			if($wpgmza->getCurrentPage() === 'map-edit'){
				/* Load leaflet drawing plugin extension */
				$library->plugins['draw'] = (object) array(
					'css' => "https://unpkg.com/leaflet-draw@" . self::DRAWING_VERSION . "/dist/leaflet.draw.css",
					'js' => "https://unpkg.com/leaflet-draw@" . self::DRAWING_VERSION . "/dist/leaflet.draw.js"
				);
			}
		}

		$library = apply_filters('wpgmza-leaflet-loader-assets', $library);

		wp_enqueue_style('wpgmza-leaflet-base-style', $library->css);
		wp_enqueue_style('wpgmza-leaflet-style', $library->style);

		$scriptArgs = apply_filters('wpgmza-get-scripts-arguments', array());
		
		wp_enqueue_script('wpgmza_leaflet_api_call', $library->js, false, false, $scriptArgs);

		/* Load any required plugins */
		if(!empty($library->plugins)){
			foreach($library->plugins as $tag => $assets){
				if(!empty($assets->css)){
					wp_enqueue_style("wpgmza-leaflet-{$tag}-style", $assets->css);
				}

				if(!empty($assets->js)){
					wp_enqueue_script("wpgmza-leaflet-{$tag}-script", $assets->js, false, false, $scriptArgs);
				}
			}
		}
		

		LeafletLoader::$leafletAPILoadCalled = true;
	}
}

