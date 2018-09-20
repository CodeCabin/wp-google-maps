<?php

namespace WPGMZA;

if(class_exists('WPGMZA\\GoogleMapsAPILoader'))
	return;

class GoogleMapsAPILoader
{
	private static $googleAPILoadCalled = false;
	private static $settings;
	
	const REMOVE_API_CHECKED			= 'REMOVE_API_CHECKED';
	const USER_CONSENT_NOT_GIVEN		= 'USER_CONSENT_NOT_GIVEN';
	const ENGINE_NOT_GOOGLE_MAPS		= 'ENGINE_NOT_GOOGLE_MAPS';
	const PAGE_EXPLICITLY_INCLUDED		= 'PAGE_EXPLICITLY_INCLUDED';
	const PAGE_EXPLICITLY_EXCLUDED		= 'PAGE_EXPLICITLY_EXCLUDED';
	const NEVER_LOAD_API_SELECTED		= 'NEVER_LOAD_API_SELECTED';
	const ONLY_LOAD_FRONT_END_SELECTED	= 'ONLY_LOAD_FRONT_END_SELECTED';
	const ONLY_LOAD_BACK_END_SELECTED	= 'ONLY_LOAD_BACK_END_SELECTED';
	const ENQUEUED						= 'ENQUEUED';
	
	public function __construct()
	{
		if(empty(GoogleMapsAPILoader::$settings))
		{
			global $wpgmza;
			GoogleMapsAPILoader::$settings = (array)$wpgmza->settings;
		}
		
		$include_allowed = $this->isIncludeAllowed($status);
		$isAllowed = $this->isIncludeAllowed($status);
		
		wp_enqueue_script('wpgmza_data', plugin_dir_url(__DIR__) . 'wpgmza_data.js');
		wp_localize_script('wpgmza_data', 'wpgmza_google_api_status', (array)$status);
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
		
		if(!$this->isIncludeAllowed())
			return;
		
		$params = $this->getGoogleMapsAPIParams();
		
		$suffix = $params['suffix'];
		unset($params['suffix']);

		$url = '//maps.google' . $suffix . '/maps/api/js?' . http_build_query($params);
		
		wp_register_script('wpgmza_api_call', $url);
		
		// Are we always enqueuing?
		if(!empty($settings['wpgmza_load_engine_api_condition']) && $settings['wpgmza_load_engine_api_condition'] == 'always')
			$this->enqueueGoogleMaps();
		
		// Are we always enqueuing on this page?
		if($post && $this->isPageIncluded($post->ID))
			$this->enqueueGoogleMaps();
		
		GoogleMapsAPILoader::$googleAPILoadCalled = true;
		
		// Block other plugins from including the API
		if(!empty($settings['wpgmza_prevent_other_plugins_and_theme_loading_api']))
			add_filter('script_loader_tag', array($this, 'preventOtherGoogleMapsTag'), 9999999, 3);
	}
	
	public function enqueueGoogleMaps()
	{
		if(!$this->isIncludeAllowed())
			return;
		
		wp_enqueue_script('wpgmza_api_call');
	}
	
	public function isPageIncluded($page_id)
	{
		global $post;
		$settings = (array)GoogleMapsAPILoader::$settings;
		
		if(empty($settings['wpgmza_always_include_engine_api_on_pages']))
			return false;
		
		if(!preg_match_all('/\d+/', $settings['wpgmza_always_include_engine_api_on_pages'], $m))
			return false;
		
		if(empty($m[0]))
			return false;
		
		$page_ids = $m[0];
		
		return (array_search($page_id, $page_ids) !== false);
	}
	
	public function isPageExcluded($page_id)
	{
		$settings = (array)GoogleMapsAPILoader::$settings;
		
		if(empty($settings['wpgmza_always_exclude_engine_api_on_pages']))
			return false;
		
		if(!preg_match_all('/\d+/', $settings['wpgmza_always_exclude_engine_api_on_pages'], $m))
			return false;
			
		if(empty($m[0]))
			return false;
		
		$page_ids = $m[0];
			
		return (array_search($page_id, $page_ids) !== false);
	}
	
	public function isIncludeAllowed(&$status=null)
	{
		global $wpgmza;
		global $post;
		
		$status = (object)array(
			'message' => null,
			'code' => null
		);
		
		$settings = (array)$wpgmza->settings;
		
		// Correction for Pro <= 7.10.04
		if(!empty($settings['wpgmza_maps_engine']) && $settings['wpgmza_maps_engine'] == 'open-street-map')
			$settings['wpgmza_maps_engine'] = 'open-layers';
		
		if(!empty($settings['wpgmza_settings_remove_api']))
		{
			$status->message = 'Remove API checked in settings';
			$status->code = GoogleMapsAPILoader::REMOVE_API_CHECKED;
			
			return false;
		}
		
		if(!is_admin() && 
			!empty($settings['wpgmza_gdpr_require_consent_before_load']) && 
			!isset($_COOKIE['wpgmza-api-consent-given']))
		{
			$status->message = 'User consent not given';
			$status->code = GoogleMapsAPILoader::USER_CONSENT_NOT_GIVEN;
			
			return false;
		}
		
		if(!empty($settings['wpgmza_maps_engine']) && $settings['wpgmza_maps_engine'] == 'open-layers')
		{
			$status->message = 'Engine is not google-maps';
			$status->code = GoogleMapsAPILoader::ENGINE_NOT_GOOGLE_MAPS;
			
			return false;
		}
		
		if($post)
		{
			if($this->isPageIncluded($post->ID))
			{
				$status->message = 'Page is explicitly included in settings';
				$status->code = GoogleMapsAPILoader::PAGE_EXPLICITLY_INCLUDED;
				
				return true;
			}
			
			if($this->isPageExcluded($post->ID))
			{
				$status->message = 'Page is explicitly excluded in settings';
				$status->code = GoogleMapsAPILoader::PAGE_EXPLICITLY_EXCLUDED;
				
				return false;
			}
		}
			
		if(!empty($settings['wpgmza_load_engine_api_condition']))
			switch($settings['wpgmza_load_engine_api_condition'])
			{
				case 'never':
					$status->message = 'Never load API chosen in settings';
					$status->code = GoogleMapsAPILoader::NEVER_LOAD_API_SELECTED;
					
					return false;
					break;
					
				case 'only-front-end':
					$status->message = 'Load API front end only chosen in settings';
					$status->code = GoogleMapsAPILoader::ONLY_LOAD_FRONT_END_SELECTED;
					
					return !is_admin();
					break;
					
				case 'only-back-end':
					$status->message = 'Load API back end only chosen in settings';
					$status->code = GoogleMapsAPILoader::ONLY_LOAD_BACK_END_SELECTED;
					
					return is_admin();
					break;
				
				default:
					break;
			}
		
		$status->message = 'Enqueued';
		$status->code = GoogleMapsAPILoader::ENQUEUED;
		
		return true;
	}
	
	public function preventOtherGoogleMapsTag($tag, $handle, $src)
	{
		if(preg_match('/maps\.google/i', $src))
		{
			if(!$this->isIncludeAllowed($status))
				return '';
			
			if($handle != 'wpgmza_api_call')
				return '';
			
			if(!preg_match('/\?.+$/', $src))
				return str_replace($src, $src . '?' . http_build_query($this->getGoogleMapsAPIParams()), $tag);
		}

		return $tag;
	}
	
	public function getSettingsHTML()
	{
		// Load our subclass of PHPs DOMDocument, for the populate function
		require_once(plugin_dir_path(__FILE__) . 'class.dom-document.php');
		
		// Load HTML
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/google-maps-api-settings.html.php');
		
		// Populate options. This is a quick way to put key => value array/object values into elements with "name" matching "key"
		$document->populate(GoogleMapsAPILoader::$settings);
		
		return $document->saveInnerBody();
	}
	
}
