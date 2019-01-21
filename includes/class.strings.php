<?php

namespace WPGMZA;

/**
 * This class is a container for all localized strings used by the plugin.
 * In the future, functionality will be added to build a dummy static string file from dynamic strings in the database, this will allow 3rd party software to scan dynamic strings for translation
 */
class Strings
{
	/**
	 * Returns localized strings, passed through the wpgmza_localized_strings filter
	 * @return array A key value pairs array of localized strings, where the array key is the variable name of the string on WPGMZA.localized_strings, the value is the localized string.
	 */
	public function getLocalizedStrings()
	{
		return apply_filters('wpgmza_localized_strings', array(
			'unsecure_geolocation' 		=> __('Many browsers are no longer allowing geolocation from unsecured origins. You will need to secure your site with an SSL certificate (HTTPS) or this feature may not work for your visitors', 'wp-google-maps'),
			'use_my_location'			=> __('Use my location', 'wp-google-maps'),
			
			'google_api_not_loaded'		=> __('The map cannot be initialized because the Maps API has not been loaded. Please check your settings.', 'wp-google-maps'),
			
			'documentation'				=> __('Documentation', 'wp-google-maps'),
			'api_dashboard'				=> __('API Dashboard', 'wp-google-maps'),
			'verify_project'			=> __('Verify Project', 'wp-google-maps'),
			
			'failed_to_get_address'		=> __('Failed to get address', 'wp-google-maps')
		));
	}
	
	/**
	 * This function builds a dummy PHP file containing strings from the database,
	 * making these strings scannable by translation software.
	 * @todo Implement
	 */
	public function buildDynamicStringDummyFile()
	{
		// For each wp_wpgmza table
		// For each column
		// If column is not text / varchar, continue
		// If column is JSON / serialized, deserialize it
		// Or, if it's plain text, put that in an object
		// Iterate recursively over the object, build PHP file from values
		// Write dummy file
	}
}
