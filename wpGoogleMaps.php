<?php
/*
Plugin Name: WP Go Maps (formerly WP Google Maps)
Plugin URI: https://www.wpgmaps.com
Description: The easiest to use Google Maps plugin! Create custom Google Maps or a map block with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.
Version: 10.0.04
Author: WP Go Maps (formerly WP Google Maps)
Author URI: https://www.wpgmaps.com
Text Domain: wp-google-maps
Domain Path: /languages
*/


/*
 * 10.0.04 - 2025-12-04
 * Added pro features page and menu item
 * Added additional page construction hooks
 * Added demo list to maps view page
 * Added LocationIQ to engine swap toolbar
 * Improved PHP 8.5 stability & compatibility
 * Fixed issue where engine swap toolbar would not set tileserver defaults for first time users
 * Fixed issue where map list clicks were not being handled correctly for action buttons
 * Fixed issue where PHP 8.5 would throw a deprecation warning due to an outdated switch case
 * Fixed issue with our internal links, docs, site, support, forums, throughout the plugin
 * Fixed issue where bulk marker selection button would not work in some environments 
 * Fixed issue where info-window link controls were available in basic
 * Updated marker listing demo image
 * 
 * 10.0.03 - 2025-11-27
 * Added first time usage flow which opens the marker creator once for new users (UX Improvement)
 * Added engine swap toolbar to map editor for first time usage, once dismissed does not show again (UX Improvement)
 * Added a new setting to enable dynamic translations, as this must be an opt in for large data sites
 * Updated internal CTA buttons and controls from gold to blue (UX Improvement)
 * Removed a console log within the map initialization controller, it is not relevant with delayed loading
 * Removed the disable dynamic translation, instead we now allow this via an opt in instead
 * 
 * 10.0.02 - 2025-11-17
 * Added shapes and overlays sub-section to map editor, moving all relevant datasets into that panel (UX Improvement)
 * Added ability to click on a map from the map list to open the editor (UX Improvement)
 * Added primary button color to edit map button within map list (UX Improvement)
 * Added blue highlight to primary dataset creation buttons to make it clearer how to add datasets (UX Improvement)
 * Added button to marker quick tip notice to jump straight to marker creation (UX Improvement)
 * Added conditional checks for major version mismatches in compiler, preventing mismatched major versions from throwing build errors
 * Added a one time hint tool to our internal map editor tour system, which will show helpful usage hints after the main tour is completed. 
 * Fixed issue where Google Maps logo would not display on some installations, within the engine selector
 * Fixed issue where plugins that load bootstrap in our editor might cause editor placement issues, plugin conflict
 * Fixed issue where map preview would not generate on some themes. We now generate a draft page, which is reused and pruned when new previews are created
 * Moved save map notice in map editor to top anchor
 * Moved add marker quick tip notice in map editor to bottom left anchor
 * Removed bounds reset system when adding a marker to a map, to allow multiple markers to be added to the same region without reset
 * 
 * 10.0.01 - 2025-11-10
 * Fixed issue with compatibility layer for older versions of Pro add-on (V8 and below)
 * 
 * 10.0.00 - 2025-11-10
 * Added Leaflet engine support
 * Added Azure engine, powered by Leaflet
 * Added Stadia engine, powered by Leaflet
 * Added Maptiler engine, powered by Leaflet
 * Added LocationIQ engine, powered by Leaflet
 * Added support for OpenLayers V10
 * Added ability to use legacy (V6) OpenLayers, should be considered deprecated. Will be removed in the future
 * Added ability to change address providers, for autocomplete and client side geocoding
 * Added additional address providers including Google Maps, Azure Maps, Nominatim, LocationIQ and engine default
 * Added ability to provide a supplementary address provider API key if needed
 * Added ability to switch tile servers, with another from the same provider, on a per map basis
 * Added additional tile server options, with providers and automated groupings
 * Added ability to set line thickness on both rectangles and circles
 * Added tile server previews for improved customization
 * Added support for dynamic content translations with WPML
 * Added Atlas Novus as the default internal build
 * Added danger zone tool to reindex any spatial coordinate data for markers, where a spatial coordinate has gone missing
 * Added ability to adjust rectangle boundaries with  boundary input
 * Added ability to bulk delete shapes 
 * Added ability to center on shapes and datasets within the editor
 * Added dropdown context meny to shape datatables
 * Added option to cachebust REST API requests
 * Added improved GDPR styling, it becomes the new default
 * Added quick delete button to info-window within the map editor
 * Added ability to override any HTML template part via a child theme override 
 * Added map preview system, allowing maps to be previewed on frontpage 
 * Added default indexes to all tables to improve performance
 * Added spatial indexes to tables where applicable to improve performance
 * Added fullscreen map editor panel mode, for dataset listings, allowing more data to be viewed
 * Added extended maximum zoom level (22) which is supported by all map engines
 * Added mobile settings tab to editor
 * Added ability to set a different map width/height for mobile devices
 * Added new default engine/installer preset for zero cost mapping, for all new installations
 * Added ability to reduce marker editor geocoder usage. Skips geocoding if lat/lng coordinates are present, opt in available in settings
 * Added ability to select store locator button style (Icons (default), or Text) on a per map basis
 * Added accessibility support, with the goal of being WCAG Level AA compliant
 * - Aria labels and roles added where needed
 * - Improved focus cues and managing of indexing
 * - Keyboard navigation added (tab, enter, space, and escape for panels)
 * - Hierarchy restructuring where needed to better support navigation
 * - Tested with various tools:
 * - - Microsoft Accessibility Insights: Pass (FastPass)
 * - - Axe DevTools: Pass (WCAG Level AA)
 * - - Google Lighthouse: Pass (100% Accessible)
 * - - Wave Tools: Pass
 * - Manual testing completed for navigation with a keyboard
 * - We will continue to improve this over time
 * - Known Issues
 * - - Only supported on the frontend
 * - - Does not allow marker selection via the map container (Marker listings supported, and encouraged for accessibility focused installations)
 * - - Although a substantial rework has been implemented, this has not been verified by 3rd party compliance testers at this stage
 * - - - We know that accessibility is more nuanced than simple machine driven tests, we'd like to work with our community to ensure we improve this further
 * - - - Please reach out to us if you find anything that you feel should be improved as a priority!
 * Improved internal autocomplete modules for better user experience and management
 * Improved theme preset user interface 
 * Improved theme CSS editor
 * Improved tile server system to handle params and authentication more efficiently
 * Improved tile server system to properly attribute various service providers
 * Improved settings user interface, adding sections and descriptors for better clarity
 * Improved Google Maps Advanced Marker render mode support
 * Improved Google Async support
 * Improved zoom sliders within editor
 * Improved map initialization state control
 * Improved map initialization error correction
 * Improved map initialization automatic delayed retry module
 * Improved info-window open calls to include data-props in container for styling
 * Improved styling system to allow native info-windows to inherit brand styling
 * Improved open layers native info-window, now includes border radius and shadows
 * Improved checkbox styling within the map viewport
 * Improved available WP filters within our AjaxTable class, allowing count values to be filtered
 * Improved internal shape architecture
 * Improved batch loader logic and modularized method
 * Improved welcome page to include new features
 * Improved all option management by disabling autoloading, reducing impact on server resources
 * Improved Legacy to Atlas Novus migration flow by introducing automatic map settings migration modules
 * Improved DomDocument param handlers where needed
 * Fixed issue where marker labels would not render & symbols correctly
 * Fixed issue where major version mismatch would cause UI error to be thrown in REST API requests
 * Fixed issue where shape datatables within the editor couldn't be searched fully
 * Fixed issue where touch events would not dispatch on OpenLayers shapes
 * Fixed issue with error suppression in DomDocument class, added LIBXML_NOERROR when
 * Fixed issue where some overlays would overlap info-windows in Open Layers (Example clusters)
 * Fixed issue with clustering translations in DE language files
 * Fixed issue where engine switch notice would show even if the user has already switched to Atlas Novus (manually)
 * Moved build selection Danger Zone
 * Moved optimization options out of beta
 * Moved map mobile zoom level control to mobile panel section
 * Removed Stamen Design tile servers, as they have moved to Stadia
 * Removed OpenPtMap tile server due to missing SSL
 * Removed duplicate map fetch methods, which were unused
 * Archived V9 changelogs
 *  
 */

/*
 * NOTICE:
 *
 * Core code moved to legacy-core.php. This file checks two things:
 *
 * 1) PHP version >= 5.3 - needed for namespace and anonymous functions
 * 2) DOMDocument, increasingly used throughout the plugin
 *
 * The following checks will cause the script to return rather than loading legacy-core.php,
 * which would cause syntax errors in case of 1) and fatal errors in case of 2)
 *
 */

if(!defined('ABSPATH'))
	exit;

// NB: Removed - plugin class was being initialised twice previously. This should no longer be necessary
// if(defined('WPGMZA_FILE'))
	// return;	// NB: For some reason, the plugin activation process executes this file twice. Don't let it.

define('WPGMZA_FILE', __FILE__);

require_once(plugin_dir_path(__FILE__) . 'constants.php');

if(!function_exists('wpgmza_show_php_version_error'))
{
	function wpgmza_show_php_version_error()
	{
		?>
		<div class="notice notice-error">
			<p>
				<?php
				_e('<strong>WP Go Maps:</strong> This plugin does not support PHP version 5.2 or below. Please use your cPanel or contact your host to switch version.', 'wp-google-maps');
				?>
			</p>
		</div>
		<?php
	}
}

if(!function_exists('wpgmza_show_dom_document_error'))
{
	function wpgmza_show_dom_document_error()
	{
		?>
		<div class="notice notice-error">
			<p>
				<?php
				_e('<strong>WP Go Maps:</strong> This plugin uses the DOMDocument class, which is unavailable on this server. Please contact your host to request they enable this library.', 'wp-google-maps');
				?>
			</p>
		</div>
		<?php
	}
}

if(!function_exists('wpgmza_show_rest_api_missing_error'))
{
	function wpgmza_show_rest_api_missing_error()
	{
		?>
		<div class="notice notice-error">
			<p>
				<?php
				_e('<strong>WP Go Maps:</strong> This plugin requires the WordPress REST API, which does not appear to be present on this installation. Please update WordPress to version 4.7 or above.', 'wp-google-maps');
				?>
			</p>
		</div>
		<?php
	}
}

if (isset($_GET['page']) && ($_GET['page'] == 'wp-google-maps-menu' || $_GET['page'] == 'wp-google-maps-menu-settings')) {
	
	global $wpgmza_pro_version;
	if (isset($wpgmza_pro_version)) {
		/* Check Pro Compat - V8.1.0 */
		if(version_compare($wpgmza_pro_version, '8.1.0', '<')){
			add_action('admin_notices', 'wpgmaps_basic_81_notice');
			function wpgmaps_basic_81_notice() {
					?>
					<div class="notice notice-error">
						<h1><?php _e('Urgent notice', 'wp-google-maps'); ?></h1>
						<h3><?php _e('WP Go Maps', 'wp-google-maps'); ?></h3>
						<p><?php
							echo sprintf(__('You are currently using an outdated PRO version. You need to <a href="%s">update your PRO version</a> to the latest version (8.*).', 'wp-google-maps'),'update-core.php');
						?></p><br />
						<p>
							<?php
							_e('We have automatically given all PRO users the ability to update to 8.0.34 and then further to 8.1. Any major versions below 8 will no longer be supported.', 'wp-google-maps');
							?>
						</p><br />
						<p><?php
							echo sprintf(__('If you are struggling to update your Pro version from within WordPress, please get the latest ZIP file <a target="_BLANK" href="%s">here</a>.', 'wp-google-maps'),'https://www.wpgmaps.com/get-updated-version/');
						?></p>
						<p>&nbsp;</p>
					</div><br />

					<?php

			}
		}

		/* Check Pro Compat - V9.0.0 */
		if(version_compare($wpgmza_pro_version, '9.0.0', '<')){
			// Temporary disabling, it's causing confusion mostly
			//add_action('admin_notices', 'wpgmaps_basic_90_notice');
			function wpgmaps_basic_90_notice() {
					/* Pro9Compat will take care of switching back to legacy */
					?>
					<div class="notice notice-error">
						<h3><?php _e('WP Go Maps', 'wp-google-maps'); ?> - <?php _e('Urgent notice', 'wp-google-maps'); ?></h3>
						<p><?php
							echo sprintf(__('You are currently using an outdated PRO version. You need to <a href="%s">update your PRO version</a> to the latest version (9.*).', 'wp-google-maps'),'update-core.php');
						?></p><br />

						<p>
							<?php
							_e('The plugin will remain mostly functional, but some modules may become less stable if you do not update to the latest PRO version.', 'wp-google-maps');
							?>
						</p><br />

						<p><?php
							echo sprintf(__('If you are struggling to update your Pro version from within WordPress, please get the latest ZIP file <a target="_BLANK" href="%s">here</a>.', 'wp-google-maps'),'https://www.wpgmaps.com/get-updated-version/');
						?></p><br />

						<p><?php
							echo __('Please note, in this configuration our new Atlas Novus build cannot be enabled, which means some new features will not be available.', 'wp-google-maps');
						?></p>
						<p>&nbsp;</p>
					</div><br />
					<?php
			}
		}
	}
}


if(version_compare(phpversion(), '5.3', '<'))
{
	add_action('admin_notices', 'wpgmza_show_php_version_error');
	return;
}

if(!class_exists('DOMDocument'))
{
	add_action('admin_notices', 'wpgmza_show_dom_document_error');
	return;
}

if(!function_exists('get_rest_url'))
{
	add_action('admin_notices', 'wpgmza_show_rest_api_missing_error');
	return;
}

if(!function_exists('wpgmza_preload_is_in_developer_mode'))
{
	function wpgmza_preload_is_in_developer_mode()
	{
		$globalSettings = get_option('wpgmza_global_settings');
			
		if(empty($globalSettings))
			return !empty($_COOKIE['wpgmza-developer-mode']);
		
		if(!($globalSettings = json_decode($globalSettings)))
			return false;
		
		return isset($globalSettings->developer_mode) && $globalSettings->developer_mode == true;
	}
}

if(!function_exists('wpgmza_show_php8_incompatibility_error'))
{
	function wpgmza_show_php8_incompatibility_error()
	{
		?>
		<div class="notice notice-error">
			<h4>WP Go Maps - Error Found</h4>
			<p>
				<?php
				_e('PHP 8 includes significant changes from PHP 7, which may cause unexpected issues with our core functionality. WP Go Maps is not officially supported with PHP 8, but support will be added in the near future.', 'wp-google-maps');
				?>
			</p>

			<p>
				<?php
				_e('To continue using WP Go Maps, please downgrade to PHP 7, as it is fully supported by our plugin.', 'wp-google-maps');
				?>
			</p>
		</div>
		<?php
	}
}

if(!function_exists('wpgmzaGetUpsellLinkParams')){
	/**
	 * Get additional upsell link params, these are query params that are appended to the 
	 * upsell links throughout the plugin
	 * 
	 * This was specifically added to allow us to track which referral users was responsible for the free installation
	 * which allows us to attribute any sales from that affiliate correctly on our side
	 * 
	 * The method itself is being kept open ended, so that we can better control the links in the future
	 * 
	 * Note: This is a procedural function just for easy scope access, but I'm not 100% happy with this. We will fix this later, I imagine
	 * 
	 * @return string
	 */
	function wpgmzaGetUpsellLinkParams($prefix = "&amp;"){
		$params = array();

		$filters = array(
			'wpgmza_referral' => '__ref',
			'wpgmza_fpr_referral' => 'fpr',
		);

		$filters = apply_filters('wpgmza_upsell_link_param_filters', $filters);

		if(!empty($filters)){
			foreach($filters as $action => $paramName){
				$paramValue = apply_filters($action, "");
				if(!empty($paramValue)){
					$params[$paramName] = $paramValue;
				}
			}
		}

		$params = apply_filters('wpgmza_upsell_link_params', $params);
		$params = !empty($params) ? http_build_query($params) : "";
		return !empty($params) ? "{$prefix}{$params}" : "";
	}
}

/**
 *  We now support PHP 8, so this check becomes redundant and we do ot need to prevent the core from loading
*/
/*if(version_compare(phpversion(), '8.0', '>=')){
	add_action('admin_notices', 'wpgmza_show_php8_incompatibility_error');
	return;
}*/

if(wpgmza_preload_is_in_developer_mode())
{
	require_once(plugin_dir_path(__FILE__) . 'legacy-core.php');
}else{
	try{
		require_once(plugin_dir_path(__FILE__) . 'legacy-core.php');
	}catch(Exception $e) {
		add_action('admin_notices', function() use ($e) {
	
			?>
			<div class="notice notice-error is-dismissible">
				<p>
					<strong>
					<?php
					_e('WP Go Maps', 'wp-google-maps');
					?></strong>:
					<?php
					_e('The plugin failed to load due to a fatal error. This is usually due to missing files, or incompatible software. Please re-install the plugin. We recommend you use PHP 5.6 or above. Technical details are as follows: ', 'wp-google-maps');
					echo $e->getMessage();
					?>
				</p>
			</div>
			<?php
			
		});
	}
}
