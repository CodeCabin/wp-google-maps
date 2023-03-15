<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * This module loads the Google Maps API unconditionally (as opposed to the GoogleMapsAPILoader)
 * @deprecated This functionality will be merged into one class with GoogleMapsAPILoader
 * @see GoogleMapsAPILoader
 */
class GoogleMapsLoader
{
	private static $googleAPILoadCalled = false;
	const TEMPORARY_API_KEY	= "QUl6YVN5RG9fZkc3RFhCT1Z2ZGhsckxhLVBIUkV1RkRwVGtsV2hZ";
	
	/**
	 * This will be handled by the Factory class
	 * @deprecated
	 */
	public static function _createInstance()
	{
		return new GoogleMapsLoader();
	}
	
	/**
	 * This will be handled by the Factory class
	 * @deprecated
	 */
	public static function createInstance()
	{
		return static::_createInstance();
	}
	
	/**
	 * Gets the parameters to be sent to the Google Maps API load call
	 * @return array An array of key value parameters to be passed to the load URL
	 */
	protected function getGoogleMapsAPIParams()
	{
		global $wpgmza;
		
		// Locale
		$locale = get_locale();
		$suffix = '.com';
		$region = false;

		switch($locale){
			case 'he_IL':
				// Hebrew correction
				$locale = 'iw';
				break;
			
			case 'zh_CN':
				// Chinese integration
				// $suffix = '.cn';
				$region = 'CN';
				break;
		}
		
		
		$locale = substr($locale, 0, 2);
		
		// Default params for google maps
		$params = array(
			'v' 		=> 'quarterly',
			'language'	=> $locale,
			'suffix'	=> $suffix
		);

		if(!empty($region)){
			/* Google now requires that we load region over the .com suffix, but with a region query */
			$params['region'] = $region;
		}
		
		// Libraries
		$libraries = array('geometry', 'places', 'visualization');
		
		if($wpgmza->getCurrentPage() == Plugin::PAGE_MAP_EDIT){
			$libraries[] = 'drawing';
		}
		
		$params['libraries'] = implode(',', $libraries);
		
		// API Version
		/*if(!empty(Plugin::$settings->api_version))
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
		
		*/
		
		// API Key
		//if(!empty($wpgmza->settings->google_maps_api_key))
			//$params['key'] = $wpgmza->settings->google_maps_api_key;
		
		//if($wpgmza->getCurrentPage() == 'map-edit')
			//$params['libraries'] = 'drawing';
		
		$key = get_option('wpgmza_google_maps_api_key');
		if(!empty($key))
			$params['key'] = $key;
		else if(is_admin())
			$params['key'] = base64_decode(GoogleMapsLoader::TEMPORARY_API_KEY);

		// Callback, required as of 2023
		$params['callback'] = "__wpgmzaMapEngineLoadedCallback";

		/* Developer Hook (Filter) - Modify Googl Maps API params (URL) */
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
		
		if(GoogleMapsLoader::$googleAPILoadCalled)
			return;
		
		$apiLoader = new GoogleMapsAPILoader();
		if(!$apiLoader->isIncludeAllowed())
			return;
		
		$params = $this->getGoogleMapsAPIParams();
		
		$suffix = $params['suffix'];
		unset($params['suffix']);
		
		$url = '//maps.google' . $suffix . '/maps/api/js?' . http_build_query($params);
		
		wp_enqueue_script('wpgmza_api_call', $url);
		
		GoogleMapsLoader::$googleAPILoadCalled = true;
		
		add_filter('script_loader_tag', array($this, 'preventOtherGoogleMapsTag'), 9999999, 3);
	}
	
	/**
	 * Gets the HTML for the settings panel for this module, which appears in the general settings tab.
	 * @return string The HTML string for the settings panel
	 */
	public function preventOtherGoogleMapsTag($tag, $handle, $src)
	{
		if(preg_match('/maps\.google/i', $src))
		{
			if($handle != 'wpgmza_api_call') {
				return '';
			}
			
			if(!preg_match('/\?.+$/', $src))
				return str_replace($src, $src . '?' . http_build_query($this->getGoogleMapsAPIParams()), $tag);
		}

		return $tag;
	}
	
}

