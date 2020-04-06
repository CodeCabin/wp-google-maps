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
			'no_google_maps_api_key'	=> __('You have not entered a <b>Google Maps API Key</b>.<br /><br />Please go to the your admin area, then Maps, then Settings, then the Advanced tab to enter your Google Maps API key.<br /><br />Alternatively, choose the Open Layers engine to avoid getting an API key.', 'wp-google-maps'),
			
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
			'zero_results'				=> __('No results found for this address', 'wp-google-maps'),
			'address_not_found'			=> __('Couldn\'t find this address', 'wp-google-maps'),
			'geocode_fail'				=> __('Geocode failed due to technical reasons', 'wp-google-maps'),
			
			'you_must_check_gdpr_consent'	=> __('You must check the GDPR consent box to continue', 'wp-google-maps'),

			'no_gps_coordinates'		=> __('No GPS coordinates found', 'wp-google-maps'),
			
			'fetching_directions'						=> __("Fetching directions...","wp-google-maps"),
			'unknown_directions_service_status'			=> __("Unknown directions service status", "wp-google-maps"),
			'please_fill_out_both_from_and_to_fields' 	=> __("Please fill out both the \"from\" and \"to\" fields","wp-google-maps"),
			
			'no_picture_found'			=> __('No picture found', 'wp-google-maps'),
			'overwrite_theme_data'		=> __('Are you sure you want to overwrite the existing theme data?', 'wp-google-maps'),
			
			'upload_complete'			=> __('Upload Complete', 'wp-google-maps'),
			'uploading_file'			=> __('Uploading file', 'wp-google-maps'),
			'bulk_jpeg_media_title'		=> __('WP Google Maps - Bulk JPEG Upload'),
			
			'from_your_location'		=> __('from your location', 'wp-google-maps'),
			'from_searched_location'	=> __('from searched location', 'wp-google-maps'),
			
			'yes'						=> __('Yes', 'wp-google-maps'),
			'no'						=> __('No', 'wp-google-maps'),
			
			'requires_gold_v5'			=> __('Requires WP Google Maps - Gold add-on 5.0.0 or above', 'wp-google-maps'),
			
			'confirm_remove_duplicates'	=> __('This operation is not reversable. We recommend you take a backup before proceeding. Would you like to continue?', 'wp-google-maps'),

			'invalid_theme_data'		=> __('Invalid theme data', 'wp-google-maps'),

			'duplicate_custom_field_name'	=> __('Duplicate custom field names, please ensure you only add unique custom field names.', 'wp-google-maps'),
		
			'disabled_interactions_notice'	=> __('Some interactions are disabled.', 'wp-google-maps'),
			'interactions_enabled_notice'	=> __('Interactions Enabled', 'wp-google-maps'),
			'disabled_interactions_button'	=> __('Re-Enable Interactions', 'wp-google-maps'),

			'use_two_fingers'			=> __('Use two fingers to move the map', 'wp-google-maps'),
			'use_ctrl_scroll_to_zoom'	=> __('Use ctrl + scroll to zoom the map', 'wp-google-maps'),
			'geocode_was_not_successful'	=> __('Geocode was not successful for the following reason: ', 'wp-google-maps'),
			'geocoding_library_notice'	=> __('Geocoding this address failed. Please check you have enabled the Geocoding API for your Google Maps API project.', 'wp-google-maps'),
			
			'map_delete_prompt_text'		=> __('Are you sure you want to delete this map?', 'wp-google-maps'),
			'map_bulk_delete_prompt_text'	=> __('Are you sure you want to delete these maps?', 'wp-google-maps')
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
