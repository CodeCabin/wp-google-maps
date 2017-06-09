<?php

namespace WPGMZA;

class GoogleMapsLoader
{
	private static $googleAPILoadCalled = false;
	
	/**
	 * Override for enqueueScripts
	 * @return void
	 */
	public function enqueueScripts()
	{
		$this->loadGoogleMaps();
		
		wp_enqueue_script('wpgmza-google-map', WPGMZA_BASE . 'js/google-maps/google-map.js', array('wpgmza-core'));
		wp_enqueue_script('wpgmza-google-marker', WPGMZA_BASE . 'js/google-maps/google-marker.js', array('wpgmza-core'));
		wp_enqueue_script('wpgmza-google-polygon', WPGMZA_BASE . 'js/google-maps/google-polygon.js', array('wpgmza-core'));
		wp_enqueue_script('wpgmza-google-polyline', WPGMZA_BASE . 'js/google-maps/google-polyline.js', array('wpgmza-core'));
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