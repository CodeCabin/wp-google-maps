<?php

namespace WPGMZA;

class GoogleMapsLoader
{
	private static $googleAPILoadCalled = false;
	
	public static function _createInstance()
	{
		return new GoogleMapsLoader();
	}
	
	public static function createInstance()
	{
		return static::_createInstance();
	}
	
	/**
	 * Gets the parameters to be sent to the Google Maps API load call
	 * @return array
	 */
	protected function getGoogleMapsAPIParams()
	{
		global $wpgmza;
		
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
			'v' 		=> '3.29',
			//'key'		=> Plugin::$settings->temp_api,	// TODO: Remove on front end
			'language'	=> $locale,
			'suffix'	=> $suffix
		);
		
		// API Version
		if(!empty(Plugin::$settings->api_version))
		{
			// Force 3.28 if the user has a setting below this
			if(version_compare(Plugin::$settings->api_version, '3.29', '<'))
			{
				$params['v'] = '3.29';
				
				// Force greedy gesture behaviour (the default before 3.27) if the user had this set
				if(version_compare(Plugin::$settings->api_version, '3.27', '<'))
					Plugin::$settings->force_greedy_gestures = true;
			}
			else
				$params['v'] = Plugin::$settings->api_version;
		}
		
		// API Key
		if(!empty(Plugin::$settings->google_maps_api_key))
			$params['key'] = Plugin::$settings->google_maps_api_key;
		
		if($wpgmza->getCurrentPage() == 'map-edit')
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
		global $wpgmza;
		
		// TODO: Bring this in line with new Google Maps settings
		//if($wpgmza->settings->remove_api)
			//return;
		
		if(GoogleMapsLoader::$googleAPILoadCalled)
			return;
		
		$params = $this->getGoogleMapsAPIParams();
		
		$suffix = $params['suffix'];
		unset($params['suffix']);
		
		$url = '//maps.google' . $suffix . '/maps/api/js?' . http_build_query($params);
		
		wp_enqueue_script('wpgmza_api_call', $url);
		
		GoogleMapsLoader::$googleAPILoadCalled = true;
		
		add_filter('script_loader_tag', array($this, 'preventOtherGoogleMapsTag'), 9999999, 3);
	}
	
	public function preventOtherGoogleMapsTag($tag, $handle, $src)
	{
		if(preg_match('/maps\.google/i', $src))
		{
			if($handle != 'wpgmza_api_call')
				return '';
			
			if(!preg_match('/\?.+$/', $src))
				return str_replace($src, $src . '?' . http_build_query($this->getGoogleMapsAPIParams()), $tag);
		}

		return $tag;
	}
	
}

?>