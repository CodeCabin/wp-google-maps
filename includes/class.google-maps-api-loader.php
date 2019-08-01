<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

if(class_exists('WPGMZA\\GoogleMapsAPILoader'))
	return;

/**
 * This class handles loading the Google Maps API and the conditional settings associated with that (load API conditions, exclude pages, etc.)
 * @deprecated This class will be merged into GoogleLoader, the API conditionality mechanisms will be abstracted to APILoader for use with OpenLayers
 */
class GoogleMapsAPILoader
{
	private static $googleAPILoadCalled = false;
	
	/**
	 * @const Status code when the user has selected "Do not load Google Maps API"
	 */
	const REMOVE_API_CHECKED			= 'REMOVE_API_CHECKED';

	/**
	 * @const Status code when the user has not given GDPR consent, where it is required
	 */
	const USER_CONSENT_NOT_GIVEN		= 'USER_CONSENT_NOT_GIVEN';
	
	/**
	 * @const Status code when the selected maps engine is not Google Maps
	 */
	const ENGINE_NOT_GOOGLE_MAPS		= 'ENGINE_NOT_GOOGLE_MAPS';
	
	/**
	 * @const Status code when the current page ID has been explicitly included in the load settings
	 */
	const PAGE_EXPLICITLY_INCLUDED		= 'PAGE_EXPLICITLY_INCLUDED';
	
	/**
	 * @const Status code when the current page ID has been explicitly excluded in the load settings
	 */
	const PAGE_EXPLICITLY_EXCLUDED		= 'PAGE_EXPLICITLY_EXCLUDED';
	
	/**
	 * @const Status code when the "Never" option has been selected in the load API condition setting
	 */
	const NEVER_LOAD_API_SELECTED		= 'NEVER_LOAD_API_SELECTED';
	
	/**
	 * @const Status code when the "Front End Only" option has been selected in the load API condition setting
	 */
	const ONLY_LOAD_FRONT_END_SELECTED	= 'ONLY_LOAD_FRONT_END_SELECTED';
	
	/**
	 * @const Status code when the "Back End Only" option has been selected in the load API condition setting
	 */
	const ONLY_LOAD_BACK_END_SELECTED	= 'ONLY_LOAD_BACK_END_SELECTED';
	
	/**
	 * @const Status code when class has attempted to enqueue the API. Please note that this does not necessarily guarantee it was successful in doing so, just that the conditions to enqueue were met.
	 */
	const ENQUEUED						= 'ENQUEUED';
	
	private static $apiWillNotLoadWarningDisplayed = false;
	
	/**
	 * Constructor
	 */
	public function __construct()
	{
		global $wpgmza;
		
		$include_allowed = $this->isIncludeAllowed($status);
		$isAllowed = $this->isIncludeAllowed($status);
		
		wp_enqueue_script('wpgmza_data', plugin_dir_url(__DIR__) . 'wpgmza_data.js');
		wp_localize_script('wpgmza_data', 'wpgmza_google_api_status', (array)$status);
		
		if($wpgmza->settings->engine == "google-maps" && !$isAllowed && !GoogleMapsAPILoader::$apiWillNotLoadWarningDisplayed)
		{
			GoogleMapsAPILoader::$apiWillNotLoadWarningDisplayed = true;
			
			add_action('admin_notices', function() use ($status) {
				?>
				<div class="notice notice-warning is-dismissable">
					<p>
						<?php
						_e( sprintf(
							'WP Google Maps: You have selected the Google Maps engine, but the Google Maps API is not being loaded for the following reason: %s.<br/>We recommend you uncheck "Do not load Google Maps API" and set "Load Maps Engine API" to "Where Required" in your <a href="%s">maps settings page</a>', 
							$status->message,
							admin_url('admin.php?page=wp-google-maps-menu-settings')
						));
						?>
					</p>
				</div>
				<?php
			});
		}
	}
	
	/**
	 * Gets the parameters to be sent to the Google Maps API load call
	 * @return array Key value parameters to be passed to the Google API URL
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
			'v' 		=> 'quarterly',
			'language'	=> $locale,
			'suffix'	=> $suffix
		);
		
		// API Key
		$key = get_option('wpgmza_google_maps_api_key');
		
		if($key)
			$params['key'] = $key;
		else if(is_admin())
			$params['key'] = get_option('wpgmza_temp_api');
		
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
		global $wpgmza;
		global $post;
		
		$settings = (array)$wpgmza->settings;
		
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
	
	/**
	 * This function will enqueue the Google Maps API, if the conditions to include it are met. Otherwise, this function will do nothing.
	 * @return void
	 */
	public function enqueueGoogleMaps()
	{
		if(!$this->isIncludeAllowed())
			return;
		
		wp_enqueue_script('wpgmza_api_call');
	}
	
	/**
	 * Checks whether the specified page ID has been explicitly included in the plugin settings
	 * @param int $page_id The page / post ID.
	 * @return bool Whether or not the user has explicitly stated to include the API on this page.
	 */
	public function isPageIncluded($page_id)
	{
		global $wpgmza;
		global $post;
		
		$settings = $wpgmza->settings;
		
		if(empty($settings['wpgmza_always_include_engine_api_on_pages']))
			return false;
		
		if(!preg_match_all('/\d+/', $settings['wpgmza_always_include_engine_api_on_pages'], $m))
			return false;
		
		if(empty($m[0]))
			return false;
		
		$page_ids = $m[0];
		
		return (array_search($page_id, $page_ids) !== false);
	}
	
	/**
	 * Checks whether the specified page ID has been explicitly excluded in the plugin settings
	 * @param int $page_id The page / post ID.
	 * @return bool Whether or not the user has explicitly stated to exclude the API on this page.
	 */
	public function isPageExcluded($page_id)
	{
		global $wpgmza;
		
		$settings = $wpgmza->settings;
		
		if(empty($settings['wpgmza_always_exclude_engine_api_on_pages']))
			return false;
		
		if(!preg_match_all('/\d+/', $settings['wpgmza_always_exclude_engine_api_on_pages'], $m))
			return false;
			
		if(empty($m[0]))
			return false;
		
		$page_ids = $m[0];
			
		return (array_search($page_id, $page_ids) !== false);
	}
	
	/**
	 * Checks if including the Google API is allowed, based on all the relevant settings.
	 * @param string &$status Reference to a string to store the resulting status in.
	 * @return bool Whether or not it is permitted to include the API on this page, based on the current settings.
	 */
	public function isIncludeAllowed(&$status=null)
	{
		global $wpgmza;
		global $post;
		
		$settings = $wpgmza->settings;
		
		$status = (object)array(
			'message' => null,
			'code' => null
		);
			
		// Correction for Pro <= 7.10.04
		if(isset($wpgmza->settings->wpgmza_maps_engine) && $wpgmza->settings->wpgmza_maps_engine == 'open-street-map')
			$wpgmza->settings->wpgmza_maps_engine = 'open-layers';
		
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
	
	/**
	 * This function hooks into script_loader_tag. If any other plugin or the theme has enqueued a script containing "maps.google", an empty string will be returned, preventing that script loader tag from being rendered. Only the script with the handle wpgmza_api_call will be allowed through. This can be bound using the "prevent other plugins and theme loading maps API" setting.
	 * @param string $tag The full script tag
	 * @param string $handle The handle the script was enqueued with
	 * @param string $src The URL to the script file
	 * @return string Either $tag where permitted, or an empty string if this function should block
	 */
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
	
	/**
	 * Gets the HTML for the settings panel for this module, which appears in the general settings tab.
	 * @return string The HTML string for the settings panel
	 */
	public function getSettingsHTML()
	{
		global $wpgmza;
		
		// Load our subclass of PHPs DOMDocument, for the populate function
		require_once(plugin_dir_path(__FILE__) . 'class.dom-document.php');
		
		// Load HTML
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/google-maps-api-settings.html.php');
		
		// Populate options. This is a quick way to put key => value array/object values into elements with "name" matching "key"
		$document->populate($wpgmza->settings);
		
		return $document->saveInnerBody();
	}
	
}
