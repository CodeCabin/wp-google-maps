<?php
/*
Plugin Name: WP Go Maps (formerly WP Google Maps)
Plugin URI: https://www.wpgmaps.com
Description: The easiest to use Google Maps plugin! Create custom Google Maps or a map block with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.
Version: 9.0.28
Author: WP Go Maps (formerly WP Google Maps)
Author URI: https://www.wpgmaps.com
Text Domain: wp-google-maps
Domain Path: /languages
*/


/*
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
 * 8.1.22 - 2022-03-29
 * Recompiled some internal files as they were out-dated for some new installations
 *
 * 8.1.21 - 2022-03-03
 * Fixed issue where XML source would not be updated when deleting a marker 
 * Improved cloud based autocomplete system 
 * Updated de_DE translation file due to missing translations
 * Updated es_ES translation file (Thanks to Alejandro Catalán)
 * Updated most language file sources
 *
 * 8.1.20 - 2022-02-03
 * Fixed issue where GDPR notice would not appear in some installation when using OpenLayers
 * Fixed issue where traditional Chinese language would not work with DataTables (Encoding issue) 
 * Fixed issue where erroneous marker read error would be thrown on some installations
 * Added Facebook, Reddit and Newsletter Links (Opt-in) to welcome and support page
 * Updated de_DE translation file (Thanks to michik1712)
 * Improved REST API request response sanitization
 * Improved experimental  batch loader, feature not available by default (beta)
 * Tested up to WordPress 5.9 
 *
 * 8.1.19 - 2021-12-09
 * Added simple API key creation link to improve the process of getting a key setup
 * Fixed issue where uncaught error would be thrown by GDPR module, and tools like Complianz
 * Fixed issue where settings and map editor templates contained incorrect class names for info-window styles
 * Fixed issue where color fields were not correctly marked in some template files
 * Improved initialization error handling, these are now shown as warnings, caught by the primary initializer
 *
 * 8.1.18 - 2021-11-02
 * Improved sanitization, validation and escaping. Improving user editable content management, trace calls, and temporary variables
 * Improved sanitization, validation and escaping on legacy code base. Code largely unused but has been addressed for additional security
 * Removed polygons labels settings placeholder when in OpenLayers engine, this is not supported by OpenLayers presently
 * Removed legacy code which loaded internal version of CodeMirror
 * Removed legacy code which allowed manual jQuery version to be loaded. This has been disabled for some time, however, code is now fully deprecated
 * Deprecated some legacy functionality
 * Updated stable tag to reflect version number correctly
 *
 * 8.1.17 - 2021-10-18
 * Improved marker editor geocode usage to only geocode when an address has changed, or is being added for the first time. (Reduced API calls due to usage)
 * Fixed issue where editing a marker which has already been position adusted would trigger a geocode on the original address, moving the marker back to the original placement
 * Fixed issue where map preview would not load on some elementor pages (Preview view only)
 * Fixed issue where RTL sites would misplace markers in OpenLayers
 * Fixed issue where StreetView icon would not show on some websites (Theme dependent)
 * Fixed issue where SQL quotation mark usage for actions on marker, map, and features (trait) would cause datatable failures 
 * Removed uses of 'SQL_CALC_FOUND_ROWS' AND 'FOUND_ROWS' in queries to ensure MySQL 8.0.17 and above compatibility
 *
 * 8.1.16 - 2021-09-20
 * Fixed issue where map editor would not initialize on some older WordPress versions 
 * Fixed issue where admin bar scroll offset would sometimes be undefined
 * Updated Real Cookie Banner integration, for improved stability
 *
 * 8.1.15 - 2021-09-01
 * Fixed issue where special symbols would be overprocessed by the KSES sanitizer
 * Fixed issue where Avada Alert icons would not show due to our icon libraries loading in post/page editor
 * Fixed issue where modern store locator would not display correctly in OpenLayers 
 * Remove Klokantech 3D tileserver as this does not appear to be supported (OpenLayers)
 * Added MapTiler Streets, Outdoor, Pastel, Basic (OpenLayers)
 * Added indicator for most tilesets that require an API key (OpenLayers)
 * Added preinit event delegate
 * Added global initMaps method
 * Added global onScroll method
 * Added core integration for Real Cookie Banner integration
 * Updated it_IT translation file (Thanks to Alessio Cornale)
 * Updated Stamen Watercolor tileset to point to HTTP host (OpenLayers)
 * Updated OpenPtMap tileset to point to HTTP host (OpenLayers)
 *
 * 8.1.14 - 2021-07-28
 * Fixed issue where custom scripts (CSS & JS) would be html_entities encoded by the wp_kses_post function, causing custom scripts to run unpredictably
 * Fixed issue where uncaught exception would cause errors to show on the frontend, although it is gracefully handled
 * Fixed issue where carousel time placeholder had an unclosed attribute
 * Resized credit images to standard sizes (Reduction in file size)
 * Resized interface images and changed color spaces (Reduction in file size) (Thanks to lowwebtech on GitHub)
 * Tested up to WordPress 5.8 
 *
 * 8.1.13 - 2021-06-15
 * Fixed issue where Authenticated Persistent XSS could be executed on any CRUD module. Uses wp_kses_post for cleanup. Applies to Markers, Polygons, Polylines and Shapes (Thanks to Visse) 
 * Fixed issue where Authenticated Persistent XSS could be executed on GDPR settings fields. This was resolved by adding wp_kses_post to all settings fields (Thanks to Visse) 
 * Updated security report credit for 8.1.12 withi changlog and readme files 
 * 
 * 8.1.12 - 2021-06-03
 * Fixed issue where authenticated Stored Cross-Site Scripting could be executed in the map list (Thanks to Mohammed Adam)
 * Fixed issue with translation file name for no_NO. Changed to nb_NO
 * Fixed issue where some OpenLayers tilesets were loaded via http instead of https
 * Fixed issue where legacy admin styles were force loaded in gutenberg editor. Reported for causing conflicts with SEOPress
 * Fixed issue where checboxes within the admin area would show a white tick due to issues in the legacy admin stylesheet
 * Fixed issue where 'no results' alert would show when resetting the store locator search
 * Fixed issue where 'Store' post types in WP Store Locator would break due to our API loader take preference, as reported by plugin author
 * Fixed issue where polygon info-windows would have quick edit link in map editor. This is not supported by polygons at the moment
 * Fixed issue where map click event would fire when clicking on polygons in OpenLayers. This is due to pixel interpolation issues.
 * Fixed issue where custom CSS would be added to the DOM multiple times
 * Fixed issue where custom JS would be added to the DOM multiple times
 * Fixed issue where global localized variables would be added to the DOM multiple times
 * Fixed issue where create map page link would cause a fatal error due to a non-static method definition
 * Fixed issue where included automcomplete styling would not appear as intended
 * Removed 'Delete all maps' danger zone controller from the settings area as this does not apply to basic users
 * Removed PHP8 disable functionality
 * Removed chat link
 * Added support for PHP8, this is a prelim pass but from tests works well. May be revisited in the future
 * Added link to WPML integration documentation
 * Added setting to disable tilt controls in the Google Maps option
 * Added check for the 'lnglat' column, if it is present, it will be automatically pruned from the database as it is not supported or used
 * Added general notices about features
 * Added supporting polygon info-window placement style for OpenLayers
 * Updated es_ES translation file (Thanks to Pedro Ponz)
 *
 * 8.1.11 - 2021-03-08
 * Fixed issue with 'No results found' alert not showing in some cases
 * Fixed issue where max/min zoom levels would not be respected
 * Fixed issue with Fr translation file mi and km translations being prefixed wth '1'
 *
 * 8.1.10 - 2021-02-18
 * Fixed issue where text JSON was not parsed with some caching solutions (Breeze for example)
 * Fixed issue with spelling of 'Autoptimize' in advanced settings tab
 * Fixed issue where compact/bare-bones/minimal user interace styles may not have an effect on some sites
 * Fixed issue where multiple jQuery identification module would cause a failure in map initialization when finding embedded scripts
 * Fixed issue where legacy store locator layout would use the JS Alert 'not found' message, instead of the message container in the DOM
 * Fixed issue with 'miles away' spacing on store locator searches
 * Fixed issue with switch styling which have inline 'notices'
 * Fixed issue where the /features/ ajax fallback would fail due to the regex comparison
 * Adjusted width of settings labels in map editor, for slightly improved interface layouts
 * Added option to show/hide store locator distances
 * Added notice to GDPR settings when Complianz is enabled, as they manage our GDPR settings internally instead. Settings are now disabled to reduce any confusion
 * Added base upgrade hook for auto backup triggers in Pro add-on
 * Added beta notice to "Only load markers within viewport"
 *
 * 8.1.9 - 2021-02-04
 * Fixed issue where 'Hide Point of Interest' option was not available without the Pro add-on
 * Added establishment suggestions to the Google Maps Autocomplete module
 * Added basic Usercentrics integration. Thanks to the Usercentrics development team for additional technical documentation
 *
 * 8.1.8 - 2021-02-01
 * Fixed an issue where OpenLayers Tile Server Key field would not be visible without the Pro add-on
 * Fixed an issue where OpenLayers would not allow click event bubbling for features
 * Fixed an issue with marker storage logic that would prevent the Pro add-on from removing gallery images
 * Fixed an issue where the store locator would scroll to the map element, even when modern locator style is active
 * Fixed an issue with the onApproveMarker event trigger in the marker panel
 * Added pep.js to the dependencies of the plugin to support pointer events on iOS 12 devices
 *
 * 8.1.7 - 2021-01-26
 * Fixed issue where you could not disable FontAwesome from loading on the frontend
 * Fixed issue where FontAwesome V4 would be loaded when V5 should have been loaded
 * Fixed issue where Datatables API extension would occur before datatables is initialized 
 * Fixed issue with polygon line opacity mutator not allowing for changes to take affect
 * Fixed issue with the WPGMZA isFullscreen variable scope would resolve correctly
 * Fixed issue where OpenLayers Geocoder would not respect country restirctions
 * Fixed issue where primary stylesheets would not have a version number present, this caused issues with cache busting when updates are released
 * Fixed issue where no max-width rule was applied to icon column in marker list within the admin area
 * Added placeholder structure for owl carousel dependency settings
 * Added 'color paste' buttons next to all color fields to allow for easy hex code pasting for specific components
 * Added a failsafe for broken polydata (legacy) paths which will fail to resolve in some instances, which could break the features end point
 * Added option to set a custom OpenLayers tile server URL if you prefer to do so, API field still applies if filled
 *
 * 8.1.6 - 2021-01-21
 * Fixed issue where polyline opacity would not be respected
 * Fixed issue where 'get_user_locale' would fail in some environments
 * Fixed issue where 'approve' button would not fire relevant events with VGM add-on in place
 * Fixed kml field storage issue
 * Added styling classes to the danger zone to match UI
 * Added a 405 DELETE fallback check to the REST API handlers
 * Added scroll to feature panel when editing a feature
 *
 * 8.1.5 - 2021-01-19
 * Removed the external reference for the live chat image and made it local
 * Added new functionality to reset and/or delete your map, marker and shape data
 * Fixed a conflict with instant.page ('i' and 'l' variable conflict)
 * Fixed issue where modern interface style will not override the store locator styles for legacy maps
 * Fixed issue where modern store locator was not responsive
 * Fixed issue where olMarkers were attempting to access Google LatLng objects in some instances, this now uses LatLng Literals instead
 * Fixed issue where text overlays would not have a minimum width, which caused text to appear strangely on the map
 * Fixed issues with some store locator settings not being respected on the frontend
 * Fixed issue where polygon settings may not be mutated by the polygon module
 * Fixed issue with WP Rest Cache (by Acato) not caching the marker-listing end point correctly
 * Fixed issue where map click event would not bubble correctly from native event dispatcher
 * Added back marker position adjust mode and refined the functionality slightly. This was removed in an earlier version mistakenly
 * Added a fallback for servers which do not support the DELETE request method via the RestAPI
 * Added a close button to the live chat link in the map editor and map settings page
 * 
 * 8.1.4 - 2021-01-14
 * Fixed a bug that stopped the GDPR consent form to display if Open Layers was enabled
 * Fixed a bug that broke the compatibility with the ComplianZ WordPress Plugin
 * Fixed a bug with dataTables translations for Finnish
 * Fixed a bug that caused "open_basedir restriction in effect" on some servers
 * Fixed a bug that caused "Unparenthesized'a ? b : c ? d : e'is deprecated" to appear for some users
 * 
 * 8.1.3 - 2021-01-13 - High priority
 * Fixed the bug where "miles away" or "km away" was not showing up on markers once a store locator search was done
 * Fixed a bug that caused markers to not load in some instances
 * Fixed an issue where the MapsEngineDialog would cause headers already sent error on some sites, causing a white screen on admin-post.php
 * Fixed an issue where settings don't get sent to the frontend, such as the starting location of the map. Only occurs on some sites 
 * Added an option to add an OpenLayers TileServer API key for server that require an 'apikey' to be sent with requests
 * 
 * 8.1.2 - 2021-01-11 - High priority
 * Fixed issue where polylines would not respect their stored configuration
 * Fixed issue with V6 API dequeuer still running in V8, even though option was removed from core
 * Fixed bug with open infow windows by default only opening 1 marker, usually the last one
 * Fixed issue where bicycle, traffic and transport layers would be enabled for all users
 * Fixed issue where legcay transport layer setting name would always be true on frontend
 * Fixed issue with Finnish datatables language file being lowercase, crashing map list
 * Fixed an issue where sometimes the settings area would produce a white page instead of redirecting back to settings
 * Fixed an issue where you would not be able to edit shapes
 * Fixed an issue where you would not be able to delete shapes
 * Allowed for a one-click experience to swap over to Open Layers if you're not using a Google Maps API key in the map editor
 * Added a new "Edit" button in the marker infowindow within the map editor
 * Fixed a bug that cause "modern store locator" to not respect the setting
 * 
 * 8.1.1 - 2021-01-07 - High priority
 * Fixed SVN issue
 * 
 * 8.1.0 - 2021-01-07 - High priority
 * OpenLayers now fully supports shapes
 * New, easy-to-use and highly efficient shape drawing tools
 * New "batched marker loading" feature allows marker loading to be broken up into parts for a smoother loading experience with large amount of markers
 * Hide Load Maps Engine API option when you select the OpenLayers map engine
 * Fixed Store Locator Radii values not updating Default radius option
 * Fixed OpenLayers Disable Zoom Controls not working
 * New, searchable, paginated, sortable tables for polygons, polylines, heatmaps, circles and rectangles
 * New Vector render mode setting for OpenLayers - Significantly improves performance with large amount of markers
 * Map editor now "all-in-one" with all controls on a single page
 * Map editor and settings page are now fully W3C and WCAG compliant
 * Map editor and settings page are now using DOM for easy and flexible customisation
 * Map editor and settings page now handle setting serialization dynamically
 * Marker, polygon, polyline, heatmap, rectangle and circle panels now handle setting serialization dynamically
 * All backend content, logic and presentation is now separate
 * All miscellaneous JavaScript now fully modular and fully extensible
 * AJAX loading fully supported
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
