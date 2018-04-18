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
			GoogleMapsAPILoader::$settings = array_merge(get_option('WPGMZA_SETTINGS'), get_option('WPGMZA_OTHER_SETTINGS'));
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
		$settings = GoogleMapsAPILoader::$settings;
		
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
		$settings = GoogleMapsAPILoader::$settings;
		
		if(!empty($settings['wpgmza_settings_remove_api']))
			return;
		
		if(GoogleMapsAPILoader::$googleAPILoadCalled)
			return;
		
		$params = $this->getGoogleMapsAPIParams();
		
		$suffix = $params['suffix'];
		unset($params['suffix']);
		
		$url = '//maps.google' . $suffix . '/maps/api/js?' . http_build_query($params);
		
		wp_register_script('wpgmza_api_call', $url);
		
		GoogleMapsAPILoader::$googleAPILoadCalled = true;
		
		add_filter('script_loader_tag', array($this, 'preventOtherGoogleMapsTag'), 9999999, 3);
	}
	
	public function enqueueGoogleMaps()
	{
		wp_enqueue_script('wpgmza_api_call');
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
	
	public function getSettingsHTML()
	{
		?>
		
		<fieldset>
			<label><?php _e('Use Google Maps API:', 'wp-google-maps'); ?></label>
			<select name="wpgmza_api_version">
				<option value="3.exp">
					<?php
					_e('3.exp (Experimental)', 'wp-google-maps');
					?>
				</option>
				<option value="3.31">
					<?php
					_e('3.exp (Experimental)', 'wp-google-maps');
					?>
				</option>
				<option value="3.30">
					<?php
					_e('3.exp (Experimental)', 'wp-google-maps');
					?>
				</option>
			</select>
		</fieldset>
			<label><?php _e('Load Google Maps API:', 'wp-google-maps'); ?></label>
			<select name="wpgmza_load_google_maps_api_condition">
				<option value="always">
					<?php
					_e('Always', 'wp-google-maps');
					?>
				</option>
				<option value="where-required">
					<?php
					_e('Where required', 'wp-google-maps');
					?>
				</option>
				<option value="only-front-end">
					<?php
					_e('Only Front End', 'wp-google-maps');
					?>
				</option>
				<option value="only-back-end">
					<?php
					_e('Only Back End', 'wp-google-maps');
					?>
				</option>
				<option value="never">
					<?php
					_e('Never', 'wp-google-maps');
					?>
				</option>
			</select>
		</fieldset>
		<fieldset>
			<label><?php _e('Always load Google Maps API on pages:') ?></label>
			<input name="wpgmza_always_load_google_maps_api_on_pages" placeholder="<?php _e('Page IDs') ?>"/>
		</fieldset>
		<fieldset>
			<label><?php _e('Always exclude Google Maps API on pages:') ?></label>
			<input name="wpgmza_always_exclude_google_maps_api_on_pages" placeholder="<?php _e('Page IDs') ?>"/>
		</fieldset>
		<?php
	}
	
}
