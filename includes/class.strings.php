<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

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
			'no_google_maps_api_key'	=> __('You have not entered a Google Maps API Key. Please see our documentation on obtaining an API key.', 'wp-google-maps'),
			
			'documentation'				=> __('Documentation', 'wp-google-maps'),
			'api_dashboard'				=> __('API Dashboard', 'wp-google-maps'),
			'verify_project'			=> __('Verify Project', 'wp-google-maps'),
			
			'failed_to_get_address'		=> __('Failed to get address', 'wp-google-maps'),
			'failed_to_create_marker'	=> __('Failed to create marker %d - this marker cannot be placed on the map.', 'wp-google-maps'),
			
			'my_location'				=> __('My Location', 'wp-google-maps'),
			
			'kilometers_away'			=> __('km away', 'wp-google-maps'),
			'miles_away'				=> __('miles away', 'wp-google-maps'),
			
			'import_completed'			=> __( 'Import completed.', 'wp-google-maps' ),
			'importing_please_wait'		=> __('Importing, this may take a moment...', 'wp-google-maps'),
			
			'no_address_specified'		=> __('No address specified', 'wp-google-maps'),
			'add_marker'				=> __('Add Marker', 'wp-google-maps'),
			'save_marker'				=> __('Save Marker', 'wp-google-maps'),
			'please_wait'				=> __('Please Wait...', 'wp-google-maps'),
			'zero_results'				=> __('Zero results found', 'wp-google-maps'),
			'geocode_fail'				=> __('Geocode failed due to technical reasons', 'wp-google-maps'),
			
			'you_must_check_gdpr_consent'	=> __('You must check the GDPR consent box to continue', 'wp-google-maps')
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
