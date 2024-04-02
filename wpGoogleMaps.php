<?php
/*
Plugin Name: WP Go Maps (formerly WP Google Maps)
Plugin URI: https://www.wpgmaps.com
Description: The easiest to use Google Maps plugin! Create custom Google Maps or a map block with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.
Version: 9.0.36
Author: WP Go Maps (formerly WP Google Maps)
Author URI: https://www.wpgmaps.com
Text Domain: wp-google-maps
Domain Path: /languages
*/


/*
 * 9.0.36 - 2024-04-02
 * Removed legacy affiliate linking system, which was causing false security reports in ImunifyAV and similar scanning tools
 * Updated da_DK translations, thanks to Finn Sommer Jensen
 * 
 * 9.0.35 - 2024-03-25
 * Added temporary key generator to allow users to try the system before setting up their own keys. Will only function in the admin area, and user must opt-in during installation wizard
 * Fixed issue with Gutenberg classes not properly handling unexpected objects arguments in some installation
 * Fixed issue where classic widget output would not be fully escaped, for users still using classic widgets
 * Fixed issue where legacy template module had some unescaped outputs, does not effect latest versions
 * Fixed issue where some attribute/elements within our installer wizard were not properly escaped
 * Fixed issue where some attribute/elements within our newletter opt-in template were not properly escaped
 * Improved sytem info class to use wpdb class to access the MySQL version number, this prevents false positive error reports by plugin scanners
 * Removed static temporary API key previously bundled with the plugin to improve first time usage
 * Tested with WP 6.5
 * Archived V8 changelogs
 * 
 * 9.0.34 - 2024-03-14
 * Fixed issue where some marker fields may contain redirect scripts from code exploited before 9.0.28, specifically defunct image tags and generic script tags. Security issue
 * Fixed issue where marker endpoint would return 500 error code when marker was missing, now returns 404 instead
 * Fixed issue where CanvasLayer would fail to initialize when async Google Maps loader was enabled
 * Improved the bundled CanvasLayer lib module, to allow for recursive delayed loading, with limitations
 * 
 * 9.0.33 - 2024-03-05
 * Added a required include for the Page class which causes issues in some installations
 * Added additional danger zone tool supports
 * Added processing context supports for improved operational context tracking
 * Added additional settings API supports
 * Added ability to set Google Maps API param "loading=async" from the settings area. This will become default in the future (beta)
 * Added ability to defer load all JavaScript assets within the plugin (beta) (Atlas Novus)
 * Fixed issue where 'wpgmza_google_api_status' would be localized multiple times
 * Fixed issue where Marker instance would throw fatal error if missing marker was accessed via the REST API
 * Fixed issue where "&" symbols would show up endoded in marker editor, for other key fields
 * Fixed issue where "prevent other API's" option would always run in admin, affecting other mapping plugins
 * Fixed issue where Meta Box map location editor would not load when plugin was activated, see above
 * Fixed issue where Authenticated Stored Cross-Site Scripting (XSS) could be stored/served using the Custom CSS block. Thanks to Marco Wotschka & Akbar Kustirama (Wordfence)
 * Fixed issue where Authenticated Stored Cross-Site Scripting (XSS) could be stored/served using the map shortcode classname attribute. Thanks to Richard Telleng (Wordfence)
 * Improved autoloader to account for issues in some installations
 * Improved shortcode attribute security by escaping attributes further, based on recent security reports
 * 
 * 9.0.32 - 2024-01-23
 * Improved the line.js mitigator to include address and title fields, due to a report showcasing these fields containing the some asset. This data is cleared, and runs automatically. Thanks to Hostpoint AG (Pascal)
 * 
 * 9.0.31 - 2024-01-17
 * Fixed issue where 9030 mitigation function would falsely trigger WordFence malware scan, due to mitigation of a known bad URL 
 * 
 * 9.0.30 - 2024-01-16
 * Fixed issue where some marker descriptions would contain a line.js asset due to an earlier exploit. Our code will automatically clear descriptions with these values present
 * Fixed issue where map edit link was vulnerable to an XSS could be executed via the map ID query paramater. Thanks Rafie Muhammad (Patchstack)
 * Fixed issue where 'mb_encode_numericentity' would be called even when the function is not available within the environment
 * 
 * 9.0.29 - 2024-01-11
 * Fixed issue with autoload tokenizer on some environments
 * Fixed issue where OpenLayers library would point to a source map that does not exist
 * Fixed issue where some non-nullable parameter were passed to internal PHP functions (Phase 1)
 * Fixed issue where map click events in OpenLayers would not respect target, and misfire as a result
 * Fixed issue where "&" symbols would show up encoded in the marker editor 
 * Improved redirect store locator search to retain original search query after redirecting
 * Updated ro_RO translation files, minor improvement
 * Updated sv_SE translation files, thanks to Mats Wale
 * Updated sk_SK translation files, thanks to Starlogic
 * Added zh-CN franslation files, thanks to Daniel Tan
 * 
 * 9.0.28 - 2023-12-12
 * Fixed issue where PHP 8.3 would throw a deprecated noticed when loading files with DomDocument (ReturnTypeWillChange)
 * Fixed issue where Unauthenticated Persistent XSS could be executed on the REST API by exploiting route/method vulnerabilities. Security issue, thanks to WPScan (Marc)
 * Fixed issue with decoding of already sanitized WP KSES values on CRUD module. As a result some HTML may no longer be valid in marker data, and will be cleaned on next storage.
 * Fixed issue where permission on POST/DELETE methods would not be reaffirmed once the regex route was matched on the REST API 
 * Fixed issue where $m reference in legacy-core would cause a conflict with WordPress Calendar Block
 * Tested with WP 6.4
 * 
 * 9.0.27 - 2023-10-11
 * Fixed issue where some older versions of PHP would experience issues decoding HTML with the latest update. This resulted in malformed UI for a subset of environments
 * Fixed issue where prepend/append methods are missing from the base DomElement class, which is required for older PHP version 
 * 
 * 9.0.26 - 2023-10-11
 * Fixed issue where some installations would experience a fatal error due to changed to DomElement base class (Older PHP Builds affected) (Thanks KleinDev)
 * 
 * 9.0.25 - 2023-10-11
 * Added option to only use ajax transports for background data (beta)
 * Added option to add Google CSP headers to your site (beta)
 * Added automatic marker creation panel trigger when right clicking on map from default view, or marker list (Atlas Novus)
 * Fixed issue where deprecation notices are shown in PHP 8.2, including dynamic property creation and function changes
 * Fixed issue where some marker fields would be over formatted by HTML entities 
 * Fixed issue where any classname could be passed to the Datatable rest endpoint, and might be instantiated. Security issue, thanks to Arūnas Liuiza (Kayak)
 * Improved core code base by refactoring some modules/sections
 * Improved and reworked affiliate link system, driven by a filter
 * Updated fr_FR translation files, minor improvement
 * Removed "Mapnik OSM No Labels" OpenLayers tile server as it is no longer available
 * Removed "Mapnik OSM B&W" OpenLayers tile server as it is no longer available
 * 
 * 9.0.24 - 2023-08-30
 * Added dynamic documentation links, which direct users to documentation based on internal build engine
 * Updated all documentation links to point to the correct engine documentation
 * Updated Atlas Novus install ratio to decrease the amount of users who receive the new user interface (Ratio: 25%)
 * 
 * 9.0.23 - 2023-08-15
 * Fixed issue where Block assets were being enqueued when not needed
 * Fixed issue where XML storage path would be localized on the frontend
 * Fixed issue where a call to getConsentPromptHTML would be made early, causing an error to be logged
 * Fixed issue where marker icons would not show when using Elementor and OpenLayers. This was due to a change of style priority in Elementor
 * Fixed issue with dynamic property creation. This has been done partially to reduce warnings, but it is part of a larger process
 * Fixed issue where pricing was incorrect in the pl_PL translation file
 * Fixed issue where some datatable columns may become misaligned at specific screen widths
 * Fixed issue where 'All' datatable length selector was not present
 * Fixed issue where sensitive settings data would be deleted instead of hidden when being localized
 * 
 * 9.0.22 - 2023-08-08
 * Fixed issue where some environments would report a fatal error due to a trailing comma in a script registration
 * 
 * 9.0.21 - 2023-08-08
 * Added 'wpgmza-get-core-script-dependencies' filter to allow for more granular dependency control
 * Added conditional loading of the API core when loading block editors, as this would sometimes prevent blocks from loading
 * Fixed issue where OpenLayers geocoding would fail due to an API specification change on Nominatim
 * Fixed various Gutenberg block definition issues, which would cause unexpected visual outputs in the block editor
 * Improved Map Block (Gutenberg) to use the block.json definition, and brought up to specification with V3 block engine
 * Improved Store Locator Block (Gutenberg) to use the block.json definition, and brought up to specification with V3 block engine
 * Improved loading order of block assets
 * Updated legacy Gutenberg blocks to use the new WP Go Maps block category
 * Removed Gutenberg modules from auto-builder, allowing them to be loaded separately
 * 
 * 9.0.20 - 2023-08-03
 * Fixed issue where Gutenberg blocks would not initialize properly in WP 6.3 due to script localization changes
 * Fixed issue where Gutenberg block definition were not up to specifications
 * Fixed issue where Store Locator block would trigger a React issue with inspector keys 
 * Fixed issue where Gutenberg element classname property was incorrectly defined 
 * Fixed issue where Gutenberg inspector dependency was still referencing an old variable instance within WP Core
 * Fixed issue where Google Vertex Context Menu module would sometimes throw an error when Google was not
 * Updated default Gutenberg block name to "Map" for clarity (Legacy)
 * Replaced older documentation links with new links
 * Added more information to the readme file
 * Tested with WP 6.3
 * 
 * 9.0.19 - 2023-04-28
 * Fixed issue where default Google Maps theme may cause initialization issues, preventing the map from loading all markers
 * Fixed issue where default theme JSON was in a no longer supported format, selecting this theme would cause parsing issues 
 * 
 * 9.0.18 - 2023-03-15
 * Added filter to prevent welcome page activation hook (wpgmza-plugin-core-prevent-welcome-redirect)
 * Improved delayed/async/defer (lazy) script loading substantially, by introducing 'delayedReloader' which will gracefully reinitialize plugin core as needed. Tested with LS Cache, Async JS, and Flying Scripts
 * Improved XML path filters to better support UNIX file systems
 * Fixed issue where Google Maps API key was localized in a settings object, causing Google to email account owner about a potential exposed key. We now obscure this, as it is safe to have localized, but caused falsed positive when page was crawled.
 * Fixed issue where Google Maps API would report a callback being required. This is a new requirement from Google, which we now adhere to 
 * Fixed issue where OpenLayers maps would not scroll the page when greedy gestures are disabled, now inline with Google Maps implementation
 * Fixed issue where Pro disabled marker fields would be editable when in edit mode, although not stored, confusing to the end user
 * Updated spotlight icon from Google
 * 
 * 9.0.17 - 2023-01-11 
 * Improved XML directory pathing system, and introduced a new validation system which limits access to only primary directory as specified in the settings area, while preventing traversal or root access 
 * Removed realpath XML directory validation, now replaced by a new path validation system 
 * 
 * 9.0.16 - 2023-01-11
 * Fixed issue where some users reported warning/error being thrown by realpath implementation. Now catches these errors and reverts to default 
 * Improved absolute path enforcement and directory traversal implementation from 9.0.15 (Thanks to Rezaduty)
 * 
 * 9.0.15 - 2023-01-10
 * Fixed issue where XML directory path allowed directory traversal, absolute paths now enforced, using realpath method (Thanks to Rezaduty)
 * 
 * 9.0.14 - 2022-12-14
 * Improved PHP8.1 compatibility by introducing "#[\ReturnTypeWillChange]" to classes which extend without return types
 * Improved overall stability of Gutenberg modules
 * Improved settings area styling (Atlas Novus)
 * Fixed issue where some panel/component layouts would be visible outside of container during initialization
 * Fixed issue where updateOffset would fail on Google Markers in some older installations
 * Fixed issue where styling page had a typo for the phrase "effect" (Atlas Novus)
 * Fixed issue where some (most) translations would include "1" before the radius selection unit
 * Fixed issue where remove duplicate would delete duplicates from different maps (Thanks Nicoletta Maia)
 * Fixed issue where shape hit regions would be calculated incorrectly at alternate broswer zoom levels and retina displays (OpenLayers)
 * Fixed issue where some older themes would throw a warning in widget area due to Gutenberg integration
 * Fixed issue where some installations would cause an activation error which could cause some automated test systems to falsely flag the plugin as not compatible with a PHP version (Example: WP Hive)
 * 
 * 9.0.13 - 2022-11-01
 * Fixed issue where map would not initialize in some AMP environments, even when AMP is disabled, due to prototype overrides
 * Fixed issue where Google Maps API would not load correctly for zn_CN locale users
 * Fixed issue where Upgrader class did not assert validity of the fromVersion, which could lead to errors 
 * Fixed issue where Settings class would not properly correct corrupted settings objects
 * Update Atlas Novus install ratio to split based on the day in the month, this should be more consistent 
 * Updated all translation files to include missing string definitions 
 * Updated all translation definitions to not be "fuzzy"
 * Update it_IT translation file (Thanks to updownbikes)
 * Tested up to WordPress 6.1
 * 
 * 9.0.12 - 2022-10-13
 * Fixed issue where minified library files were being loaded when in developer mode only
 * Fixed issue with CRUD class KSES processing
 * Updated Atlas Novus install ratio probability calculations to use a larger sample range
 * 
 * 9.0.11 - 2022-09-20 
 * Added various supports for Pro add-on settings
 * Fixed issue with country code module where it was using TLD instead of ISO 3166-1 alpha-2 
 * Updated internal engine controller to make use of mt_rand() instead of rand(), to improve probability factoring
 * Updated da_DK translation file (Internal Adjustment)
 * 
 * 9.0.10 - 2022-08-24
 * Fixed issue where "I agree" GDPR button would not be translated once global settings are saved
 * Fixed issue with Nominatim query params, where some restrictions would not be respected
 * Fixed issue where combined file was preferred over minified file when the servers archive class would extract slower than expected. Introduces delta tolerance 
 * Updated Atlas Novus install ratio to increase the amount of users who receive the new user interface temporarily (Ratio: 70%)
 * Tested Borlabs Cookie integration, found to be fully functional after in depth discussion with their team
 * 
 * 9.0.9 - 2022-08-11
 * Added Atlas Novus tag to plugin website link
 * Removed internal build swap notice, for the time being
 * 
 * 9.0.8 - 2022-08-03
 * Added installer links to API key fields in settings area, to improve API key creation process for returning users
 * Updated all base PO files, source information updated for future improvements
 * Updated branding assets
 * 
 * 9.0.7 - 2022-07-27
 * Added button styling to primary installer skip button, to make this option more clear to new users 
 * Added installer auto skip system, which will delay the first time setup flow by 1 day automatically for new users
 * Added intelli-panel system to editor, which opens the feature editor if a map does not have any of the specified feature type (Atlas Novus)
 * Added map editor tour system (beta), which leads the user through the first time marker creation process (Atlas Novus)
 * Fixed issue where gallery setting hint was being shown in basic only, incorrectly
 * 
 * 9.0.6 - 2022-07-14
 * Added option to dynamically refactor single quote SQL queries within our core. This solves issues in environments where single quote statements are not supported, such as WP Engine
 * Fixed issue where OpenLayers canvas would scale incorrectly on retina displays 
 * Fixed issue where OpenLayers canvas would inherit theme max width values, which could lead to misplacement of markers 
 * Fixed issue where separated Store Locator search would run even when no request is passed, causing a focus on address field
 * Fixed issue where Store locator was initializing on the first element broadly matched, this could lead to issues when using add-on
 * Fixed issue where DataTables reload would be called early and cause an error to be thrown
 * Fixed issue in 'isModernComponentStyleAllowed' method which did not account for Atlas Novus build
 * Fixed issue where Reflection exception would not be handled gracefully where no class name is present (Thanks to Amit Tal)
 * Updated Atlas Novus install ratio to reduce the amount of users who receive the new user interface temporarily (Ratio: 30%)
 * Updated DataTables bundles to 1.12.1 (Excl. Styles)
 * Updated DataTables Responsive bundles to 2.3.0
 * 
 * 9.0.5 - 2022-07-06
 * Added 'is-fullscreen' class to maps when they enter fullscreen mode, adding control over styling
 * Improved underlying canvas handling on retina displays with OpenLayers
 * Fixed issue where fullscreen height on Safari, with OpenLayers would not be respected
 * Removed calls to $.isNumeric and replaced them with WPGMZA.isNumeric counterpart
 * Removed $.bind calls and replaced them with standard $.on event listeners
 * 
 * 9.0.4 - 2022-06-29
 * Fixed issue where enhanced autocomplete may not initialize on some websites 
 * 
 * 9.0.3 - 2022-06-28
 * Added improvements to enhanced autocomplete module for admin marker creation 
 * Fixed issue where enhanced autocomplete would handle referrer bound keys incorrectly 
 * Updated de_DE translation file (Internal Adjustment)
 * 
 * 9.0.2 - 2022-06-24
 * Added ability to skip installer. Will be reminded 1 day after to complete installation
 * Added improvements to admin marker addition autocomplete system tools
 * Fixed issue where installations running PHP 7.2.X would be unstable in some cases 
 * Fixed issue with spelling on support pages
 * Fixed issue with writrsblock reset delegation (Atlas Novus)
 * 
 * 9.0.1 - 2022-06-22
 * Added "day one" core patches across all cores 
 * Added WritersBlock support logic (Atlas Novus)
 * Added ability to reopen installer (Legacy)
 * Fixed issue with html overlay placement within map container
 * Fixed issue with support forum links
 * Fixed activation order issues with some add-ons
 * Improved upsell locations to better convey value of upgrading (Atlas Novus)
 * Removed Pro 8 stability notices to avoid confusion
 * Removed Advanced Marker panel, moved fields to standard marker panel (Atlas Novus)
 * 
 * 9.0.0 - 2022-06-20
 * Added Atlas Novus Internal Engine
 * Added Internal Engine base architecture
 * Added infrastructure to support HTML overrides in a later version
 * Added local file overrides based on engine selection
 * Added ability to switch between internal engine (Atlas Novus or Legacy)
 * Added installer to plugin flow to improve and simplify plugin setup 
 * Added Quick Start tool from Google Maps Platform, simplifying API key creation
 * Added tile server preview to OpenLayers installer to simplify setup process
 * Added persistent notice system, allowing dismissable actionable notices to be shown to users as needed 
 * Added system information to support areas to help with debugging issues as needed
 * Added streetview event delegation triggers 
 * Added additional dimension options for map sizes
 * Added additional developer hooks
 * Added additional JS events 
 * Added attribution for lnglat column patch (Thanks to CNick)
 * Added cs_CZ translation file (Thanks to Petr Aubrecht)
 * Added cross version compatibility checks and support
 * Improved OpenLayers gesture handling, should function similarly to Google Maps now
 * Improved Custom Script editors to use CodeMirror with custom theme. Uses bundled WP Core version of CodeMirror
 * Improved shortcode handling to better support extending code 
 * Improved shape management by standardizing modules and extension
 * Improved GDPR consent management system
 * Improved info window management system 
 * Improved map initialization system 
 * Improved "Open by default" info window functionality  
 * Improved query variable supports 
 * Improved map event management and distributors 
 * Improved bounds based event management
 * Improved distance management systems
 * Improved auto pan system for info window in OpenLayers 
 * Improved existing developer hooks 
 * Improved existing JS events
 * Improved code comments and clarity of primary modules 
 * Improved underlying architecture, in support of future development
 * Improved older modules by converting them to the new architecture (Atlas Novus refactor)
 * Improved compatibility core 
 * Improved major version migration core
 * Improved map widget
 * Fixed issue where dependencies would be managed incorrectly in edge cases (Thanks to shazahm1)
 * Optimized file sizes (Thanks to lowwebtech)
 * Removed redundant files
 * 
 * Atlas Novus
 * - Added extensive use of CSS variables
 * - Added Styling page to allow component styling
 * - Added Internal Viewport Architecture for component management
 * - Added comprehensive placement options for components
 * - Added fullscreen supports to move viewport into fullscreen mode
 * - Added quick add tools to map editor
 * - Added OpenLayers theme support, via CSS Filters
 * - Added OpenLayers theme editor, via CSS Filters
 * - Added dedicated store locator shortcode 
 * - Added ability to place store locator on a separate page and redirect to a map page when submitted 
 * - Added Store Locator Gutenberg Block
 * - Added Gutenberg custom category
 * - Added batch loading support
 * - Added SVG icons to user facing elements to reduce dependency on libraries
 * - Added point label feature type, allowing you to add text to maps 
 * - Added color picker, allowing for improved color management 
 * - Added supports for feature state handling
 * - Added capsule module core architecture
 * - Added additional file processors to support new components 
 * - Improved Welcome UI/UX
 * - Improved Credits UI/UX 
 * - Improved Map List UI/UX
 * - Improved Map Editor UI/UX
 * - Improved feature editor panel UI/UX
 * - Improved settings panels reduce time to setup
 * - Improved Settings Page UI
 * - Improved settings placement/groupings to reduce time to setup
 * - Improved all admin datatables
 * - Improved all preloaders
 * - Improved all admin notices 
 * - Improved Google Maps theme editor
 * - Improved Danger Zone tools 
 * - Improved Support page
 * - Improved Shape drawing tools
 * - Improved Gutenberg block supports
 * - Improved responsiveness of all map related components 
 * - Improved error notice reporting
 * - Improved front end component UI/UX drastically
 * - Improved map placement/alignment system 
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
