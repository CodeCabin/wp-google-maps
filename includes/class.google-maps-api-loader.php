<?php

namespace WPGMZA;

if(class_exists('WPGMZA\\GoogleMapsAPILoader'))
	return;

class GoogleMapsAPILoader
{
	private static $googleAPILoadCalled = false;
	private static $settings;
	
	public function __construct()
	{
		if(empty(GoogleMapsAPILoader::$settings))
		{
			global $wpgmza;
			GoogleMapsAPILoader::$settings = (array)$wpgmza->settings;
		}
	}
	
	public static function _createInstance()
	{
		return new GoogleMapsAPILoader();
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
			'v' 		=> '3.31',
			'language'	=> $locale,
			'suffix'	=> $suffix
		);
		
		// API Key
		$key = get_option('wpgmza_google_maps_api_key');
		
		if($key)
			$params['key'] = $key;
		else if(is_admin())
			$params['key'] = get_option('wpgmza_temp_api');
		
		// API Version
		$settings = (array)GoogleMapsAPILoader::$settings;
		
		if(!empty($settings['wpgmza_api_version']))
			$params['v'] = $settings['wpgmza_api_version'];
		
		// Libraries
		$libraries = array('geometry', 'places', 'visualization');
		$params['libraries'] = implode(',', $libraries);
		
		$params = apply_filters( 'wpgmza_google_maps_api_params', $params );
		
		return $params;
	}
	
	/**
	 * This function loads the Google API if it hasn't been called already
	 * @return void
	 */
	public function registerGoogleMaps()
	{
		global $post;
		
		$settings = (array)GoogleMapsAPILoader::$settings;
		
		if(GoogleMapsAPILoader::$googleAPILoadCalled)
			return;
		
		$params = $this->getGoogleMapsAPIParams();
		
		$suffix = $params['suffix'];
		unset($params['suffix']);
		
		$url = '//maps.google' . $suffix . '/maps/api/js?' . http_build_query($params);
		
		wp_register_script('wpgmza_api_call', $url);
		
		// Are we always enqueuing?
		if(!empty($settings['wpgmza_load_google_maps_api_condition']) && $settings['wpgmza_load_google_maps_api_condition'] == 'always')
			$this->enqueueGoogleMaps();
		
		// Are we always enqueuing on this page?
		if($post && $this->isPageIncluded($post->ID))
			$this->enqueueGoogleMaps();
		
		GoogleMapsAPILoader::$googleAPILoadCalled = true;
		
		// Block other plugins from including the API
		add_filter('script_loader_tag', array($this, 'preventOtherGoogleMapsTag'), 9999999, 3);
	}
	
	public function enqueueGoogleMaps()
	{
		wp_enqueue_script('wpgmza_api_call');
	}
	
	public function isPageIncluded($page_id)
	{
		global $post;
		$settings = (array)GoogleMapsAPILoader::$settings;
		
		if(empty($settings['wpgmza_always_include_google_maps_api_on_pages']))
			return false;
		
		if(!preg_match_all('/\d+/', $settings['wpgmza_always_include_google_maps_api_on_pages'], $m))
			return false;
		
		if(empty($m[0]))
			return false;
		
		$page_ids = $m[0];
		
		return (array_search($page_id, $page_ids) !== false);
	}
	
	public function isPageExcluded($page_id)
	{
		$settings = (array)GoogleMapsAPILoader::$settings;
		
		if(empty($settings['wpgmza_always_exclude_google_maps_api_on_pages']))
			return false;
		
		if(!preg_match_all('/\d+/', $settings['wpgmza_always_exclude_google_maps_api_on_pages'], $m))
			return false;
			
		if(empty($m[0]))
			return false;
		
		$page_ids = $m[0];
			
		return (array_search($page_id, $page_ids) !== false);
	}
	
	public function isIncludeAllowed(&$reason=null)
	{
		global $wpgmza;
		global $post;
		
		$settings = (array)$wpgmza->settings;
		
		if(!empty($settings['wpgmza_settings_remove_api']))
		{
			$reason = 'Remove API checked in settings';
			return false;
		}
		
		if(empty($settings['wpgmza_maps_engine']) || $settings['wpgmza_maps_engine'] != 'google-maps')
		{
			$reason = 'Engine is not google-maps';
			return false;
		}
		
		if($post)
		{
			if($this->isPageIncluded($post->ID))
			{
				$reason = 'Page is explicitly included in settings';
				return true;
			}
			
			if($this->isPageExcluded($post->ID))
			{
				$reason = 'Page is explicitly excluded in settings';
				return false;
			}
		}
			
		if(!empty($settings['wpgmza_load_google_maps_api_condition']))
			switch($settings['wpgmza_load_google_maps_api_condition'])
			{
				case 'never':
					$reason = 'Never load API chosen in settings';
					return false;
					break;
					
				case 'only-front-end':
					$reason = 'Load API front end only chosen in settings';
					return !is_admin();
					break;
					
				case 'only-back-end':
					$reason = 'Load API back end only chosen in settings';
					return is_admin();
					break;
				
				default:
					break;
			}
		
		$reason = 'Enqueue is allowed';
		return true;
	}
	
	public function preventOtherGoogleMapsTag($tag, $handle, $src)
	{
		if(preg_match('/maps\.google/i', $src))
		{
			if(!$this->isIncludeAllowed($reason))
			{
				echo "<script>var wpgmza_api_not_enqueued_reason = '$reason';</script>";
				return '';
			}
			
			else if($handle != 'wpgmza_api_call')
				return '';
			
			if(!preg_match('/\?.+$/', $src))
				return str_replace($src, $src . '?' . http_build_query($this->getGoogleMapsAPIParams()), $tag);
		}

		return $tag;
	}
	
	public function getSettingsHTML()
	{
		require_once(plugin_dir_path(__FILE__) . 'class.dom-document.php');
		
		// Load HTML
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/google-maps-api-settings.html.php');
		
		// Populate options
		$document->populate(GoogleMapsAPILoader::$settings);
		
		return $document->saveInnerBody();
	}
	
}
