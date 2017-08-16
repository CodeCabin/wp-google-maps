<?php

namespace WPGMZA;

class GoogleMapsLoader
{
	private static $googleAPILoadCalled = false;
	
	/**
	 * Enqueue scripts
	 * @return void
	 */
	public function enqueueScripts()
	{
		global $wpgmza;
		
		$this->loadGoogleMaps();
		
		$dependencyVersion = ($wpgmza->isProVersion() ? 'pro-' : '');
		
		wp_enqueue_script('wpgmza-google-drawing-manager', 	WPGMZA_BASE . 'js/google-maps/google-drawing-manager.js', 	array('wpgmza-drawing-manager'));
		wp_enqueue_script('wpgmza-google-geocoder', 		WPGMZA_BASE . 'js/google-maps/google-geocoder.js', 			array('wpgmza-geocoder'));
		wp_enqueue_script('wpgmza-google-info-window', 		WPGMZA_BASE . 'js/google-maps/google-info-window.js', 		array("wpgmza-{$dependencyVersion}info-window"));
		wp_enqueue_script('wpgmza-google-map-edit-page', 	WPGMZA_BASE . 'js/google-maps/google-map-edit-page.js',  	array("wpgzma-{$dependencyVersion}map-edit-page"));
		wp_enqueue_script('wpgmza-google-map', 				WPGMZA_BASE . 'js/google-maps/google-map.js', 				array("wpgmza-{$dependencyVersion}map"));
		wp_enqueue_script('wpgmza-google-marker', 			WPGMZA_BASE . 'js/google-maps/google-marker.js', 			array("wpgmza-{$dependencyVersion}marker"));
		wp_enqueue_script('wpgmza-google-polygon', 			WPGMZA_BASE . 'js/google-maps/google-polygon.js', 			array("wpgmza-{$dependencyVersion}polygon"));
		wp_enqueue_script('wpgmza-google-polyline', 		WPGMZA_BASE . 'js/google-maps/google-polyline.js', 			array('wpgmza-polyline'));
		wp_enqueue_script('wpgmza-google-store-locator', 	WPGMZA_BASE . 'js/google-maps/google-store-locator.js', 	array('wpgmza-store-locator'));
		wp_enqueue_script('wpgmza-google-drawing-manager', 	WPGMZA_BASE . 'js/google-maps/google-drawing-manager.js',	array('wpgmza-core'));

		do_action( 'wpgmza_google_maps_loader_scripts' );

	}
	
	/**
	 * Gets the parameters to be sent to the Google Maps API load call
	 * @return array
	 */
	protected function getGoogleMapsAPIParams()
	{
		// Locale
		$locale = get_locale();
		$suffix = '.com';
		
		switch($locale)
		{
			case 'he_IL':
				// Hebrew correction
				$locale = 'iw';
				break;
			
			case 'zh_CN':
				// Chinese integration
				$suffix = '.cn';
				break;
		}
		
		
		$locale = substr($locale, 0, 2);
		
		// Default params for google maps
		$params = array(
			'v' 		=> '3.26',
			'key'		=> Plugin::$settings->temp_api,	// TODO: Remove on front end
			'language'	=> $locale,
			'suffix'	=> $suffix
		);
		
		// API Version
		if(!empty(Plugin::$settings->api_version))
			$params['v'] = Plugin::$settings->api_version;
		
		// API Key
		if(!empty(Plugin::$settings->google_maps_api_key))
			$params['key'] = Plugin::$settings->google_maps_api_key;
		
		if(is_admin())
			$params['libraries'] = 'drawing';

		$params = apply_filters( 'wpgmza_google_maps_api_params', $params );
		
		return $params;
	}
	
	/**
	 * This function loads the Google API if it hasn't been called already
	 * @return void
	 */
	public function loadGoogleMaps()
	{
		if(Plugin::$settings->remove_api)
			return;
		
		if(GoogleMapsLoader::$googleAPILoadCalled)
			return;
		
		$params = $this->getGoogleMapsAPIParams();
		
		$suffix = $params['suffix'];
		unset($params['suffix']);
		
		wp_enqueue_script('wpgmza_api_call', '//maps.google' . $suffix . '/maps/api/js?' . http_build_query($params));
		GoogleMapsLoader::$googleAPILoadCalled = true;
		
		// Add hooks to dequeue other google maps scripts
		foreach(array('wp_enqueue_scripts',
			'wp_head',
			'admin_head',
			'init',
			'wp_footer',
			'admin_footer',
			'wp_print_scripts') as $action)
			add_action($action, array(__CLASS__, 'deregisterOtherGoogleMaps'), PHP_INT_MAX);
	}
	
	/**
	 * Prevent any other Google Maps API script from loading
	 * @return void
	 */
	public static function deregisterOtherGoogleMaps()
	{
		global $wp_scripts;
		$map_handle = '';
		
		if(!isset($wp_scripts->registered) || !is_array($wp_scripts->registered))
			return;
		
		foreach($wp_scripts->registered as &$script)
		{
			if(!preg_match('/maps\.google/i', $script->src) || $script->handle == 'wpgmza_api_call')
				continue;
			
			if(empty($script->handle))
				$script->handle = 'remove-this-map-call';
			
			unset($script->src);

			wp_dequeue_script($script->handle);
			$wp_scripts->remove($script->handle);
		}
	}
}

?>