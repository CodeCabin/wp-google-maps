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
		/* Developer Hook (Filter) - Modify localized strings */
		return apply_filters('wpgmza_localized_strings', array(
			'unsecure_geolocation' 		=> __('Many browsers are no longer allowing geolocation from unsecured origins. You will need to secure your site with an SSL certificate (HTTPS) or this feature may not work for your visitors', 'wp-google-maps'),
			'use_my_location'			=> __('Use my location', 'wp-google-maps'),
			
			'google_api_not_loaded'		=> __('The map cannot be initialized because the Maps API has not been loaded. Please check your settings.', 'wp-google-maps'),
			'no_google_maps_api_key'	=> sprintf(
			
				__('You have not entered a <b>Google Maps API Key</b>.<br /><br />Please go to the your admin area, then Maps, then Settings, then the Advanced tab to <a href="%s">enter your Google Maps API key</a>.<br /><br />Alternatively, <a href="%s">choose the Open Layers engine</a> to avoid getting an API key.', 'wp-google-maps'),
				
				admin_url("admin.php?page=wp-google-maps-menu-settings&highlight=wpgmza_google_maps_api_key#advanced-settings"),
				admin_url("admin.php?page=wp-google-maps-menu-settings&highlight=wpgmza_maps_engine")
				
			),
			
			'documentation'				=> __('Documentation', 'wp-google-maps'),
			'api_dashboard'				=> __('API Dashboard', 'wp-google-maps'),
			'verify_project'			=> __('Verify Project', 'wp-google-maps'),


			'no_shape_circle'			=> __('Please create the circle first.', 'wp-google-maps'),
			'no_shape_rectangle'		=> __('Please create the rectangle first.', 'wp-google-maps'),
			'no_shape_polygon'			=> __('Please create the polygon first.', 'wp-google-maps'),
			'no_shape_polyline'			=> __('Please create the polyline first.', 'wp-google-maps'),
			
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
			'zero_results'				=> __('No results found in this location. Please try again.', 'wp-google-maps'),
			'address_not_found'			=> __('This address could not be found. WP Go Maps uses a 3rd party service (eg Google) to convert addresses to geographic coordinates. Unfortunately, the service has no records for this address at present. Please try an alternative format, or manually position the marker using right click.', 'wp-google-maps'),
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
			'bulk_jpeg_media_title'		=> __('WP Go Maps - Bulk JPEG Upload', 'wp-google-maps'),
			
			'from_your_location'		=> __('from your location', 'wp-google-maps'),
			'from_searched_location'	=> __('from searched location', 'wp-google-maps'),
			
			'yes'						=> __('Yes', 'wp-google-maps'),
			'no'						=> __('No', 'wp-google-maps'),
			
			'requires_gold_v5'			=> __('Requires WP Go Maps - Gold add-on 5.0.0 or above', 'wp-google-maps'),
			
			'confirm_remove_duplicates'	=> __('This operation is not reversable. We recommend you take a backup before proceeding. Would you like to continue?', 'wp-google-maps'),

			'invalid_theme_data'		=> __('Invalid theme data', 'wp-google-maps'),

			'duplicate_custom_field_name'	=> __('Duplicate custom field names, please ensure you only add unique custom field names.', 'wp-google-maps'),
		
			'disabled_interactions_notice'	=> __('Some interactions are disabled.', 'wp-google-maps'),
			'interactions_enabled_notice'	=> __('Interactions Enabled', 'wp-google-maps'),
			'disabled_interactions_button'	=> __('Re-Enable Interactions', 'wp-google-maps'),

			'use_two_fingers'			=> __('Use two fingers to move the map', 'wp-google-maps'),
			'use_ctrl_scroll_to_zoom'	=> __('Use ctrl + scroll to zoom the map', 'wp-google-maps'),
			'use_ctrl_scroll_to_zoom_ios'	=> __('Use cmd + scroll to zoom the map', 'wp-google-maps'),
			'geocode_was_not_successful'	=> __('Geocode was not successful for the following reason: ', 'wp-google-maps'),
			'geocoding_library_notice'	=> __('Geocoding this address failed. Please check you have enabled the Geocoding API for your Google Maps API project.', 'wp-google-maps'),
			
			'map_delete_prompt_text'		=> __('Are you sure you want to delete this map?', 'wp-google-maps'),
			'map_bulk_delete_prompt_text'	=> __('Are you sure you want to delete these maps?', 'wp-google-maps'),
			
			'general_delete_prompt_text'	=> __('Are you sure you want to delete this data?', 'wp-google-maps'),
			
			'new_map'						=> __('New Map', 'wp-google-maps'),
			'all'							=> __('All', 'wp-google-maps'),
			'cloud_api_key_error_1'			=> sprintf(__('Autocomplete disabled. <a href="%s" target="_BLANK">Find out more</a>.', 'wp-google-maps'),"https://wpgmaps.com/documentation/autocomplete-disabled/?utm_source=plugin&utm_medium=link&utm_campaign=cloud-autocomplete-error"),
			'autcomplete_placeholder' 		=> __('Enter a location', 'wp-google-maps'),
			'map_type_roadmap'				=> __('Roadmap', 'wp-google-maps'),
			'map_type_satellite'			=> __('Satellite', 'wp-google-maps'),
			'map_type_terrain'			    => __('Terrain', 'wp-google-maps'),
			'map_type_hybrid'				=> __('Hybrid', 'wp-google-maps'),

			/* Atlas Major — autosave pill + live preview fallbacks.
			   Keys consumed by atlas-major-autosave.js and
			   atlas-major-live-preview.js. The store locator label
			   fallbacks reuse strings that already exist in the
			   .po files from the store-locator templates. */
			'atlas_major_saving'			=> __('Saving…', 'wp-google-maps'),
			'atlas_major_saved'				=> __('Saved', 'wp-google-maps'),
			'atlas_major_unsaved'			=> __('Unsaved changes', 'wp-google-maps'),
			'atlas_major_save_failed'		=> __('Save failed', 'wp-google-maps'),
			'atlas_major_save_failed_retrying'	=> __('Save failed — retrying in %ds', 'wp-google-maps'),
			'atlas_major_sl_address_label'		=> __('ZIP / Address:', 'wp-google-maps'),
			'atlas_major_sl_keywords_label'		=> __('Title / Description:', 'wp-google-maps'),
			'atlas_major_sl_keywords_placeholder'	=> __('Enter a title', 'wp-google-maps'),

			/* Atlas Major autosave pill toggle labels + tooltip
			   tips. Consumed by atlas-major-autosave.js via the
			   L('key', 'fallback') helper — the fallback strings
			   here MUST match the second argument of those L()
			   calls exactly so the JS renders the right text when
			   localized_strings hasn't loaded yet. */
			'atlas_major_autosave_paused_label'	=> __('Autosave off', 'wp-google-maps'),
			'atlas_major_autosave_active_label'	=> __('Autosave on', 'wp-google-maps'),
			'atlas_major_autosave_resume_tip'	=> __('Click to enable autosave', 'wp-google-maps'),
			'atlas_major_autosave_pause_tip'	=> __('Click to disable autosave (manual Save Map still works)', 'wp-google-maps'),

			/* Info window edit / delete button title-attribute
			   tooltips. Consumed by info-window.js when building
			   the inline marker-action buttons inside an info
			   window in the map editor. The same msgids are also
			   used by class.admin-marker-datatable.php's row
			   action buttons — gettext returns the same translation
			   for both call sites. */
			'info_window_edit_marker_title'		=> __('Edit this marker', 'wp-google-maps'),
			'info_window_delete_marker_title'	=> __('Delete this marker', 'wp-google-maps'),

			/* Visible labels for the same info-window edit / delete
			   buttons. Previously these labels were injected via CSS
			   pseudo-elements (`.wpgmza_edit_btn::after { content:
			   "Edit"; }` in atlas-major.css ~L6757), which made them
			   un-translatable because CSS `content` strings don't go
			   through gettext. Moved to localized_strings + injected
			   into the DOM by info-window.js so they translate. */
			'info_window_edit_marker_label'		=> __('Edit', 'wp-google-maps'),
			'info_window_delete_marker_label'	=> __('Delete', 'wp-google-maps'),

			/* Sidebar grouping headings — used to live as
			   `::before { content: "Add Marker" }` rules in
			   atlas-major.css. Now applied via a small init in
			   atlas-major-marker-list.js which sets data-am-label
			   on each `.navigation` / `.feature-list`, with the CSS
			   reading `content: attr(data-am-label)`. */
			'am_sidebar_add_default'		=> __('Add', 'wp-google-maps'),
			'am_sidebar_add_marker'			=> __('Add Marker', 'wp-google-maps'),
			'am_sidebar_list_default'		=> __('List', 'wp-google-maps'),
			'am_sidebar_list_marker'		=> __('Marker List', 'wp-google-maps'),
			'am_sidebar_list_polygon'		=> __('Polygon List', 'wp-google-maps'),
			'am_sidebar_list_polyline'		=> __('Polyline List', 'wp-google-maps'),
			'am_sidebar_list_circle'		=> __('Circle List', 'wp-google-maps'),
			'am_sidebar_list_rectangle'		=> __('Rectangle List', 'wp-google-maps'),
			'am_sidebar_list_heatmap'		=> __('Heatmap List', 'wp-google-maps'),
			'am_sidebar_list_point_label'	=> __('Point Label List', 'wp-google-maps'),
			'am_sidebar_list_image_overlay'	=> __('Image Overlay List', 'wp-google-maps'),

			/* Preview-failed error message — used by tileset /
			   theme / tile-server preview UIs via CSS
			   `:before { content: "Could not fetch preview" }`.
			   Same data-am-label fix: PHP onerror handlers and
			   tile-server-preview.js now set data-am-label with
			   the translated text. */
			'am_preview_fetch_failed'		=> __('Could not fetch preview', 'wp-google-maps')
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
