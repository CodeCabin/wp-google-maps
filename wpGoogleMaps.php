<?php
/*
Plugin Name: WP Google Maps
Plugin URI: https://www.wpgmaps.com
Description: The easiest to use Google Maps plugin! Create custom Google Maps with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.
Version: 7.10.58
Author: WP Google Maps
Author URI: https://www.wpgmaps.com
Text Domain: wp-google-maps
Domain Path: /languages
*/

/*
 * 7.10.58 :- 2019-01-18 :- Low priority
 * Added code to catch Geocoding Service errors in GoogleAPIErrorHandler
 * Fixed wrong database prefix in wpgmaps_return_markers when running on a multisite installation
 *
 * 7.10.57 :- 2019-01-15 :- Low priority
 * Engine selection dialog will no longer be displayed if a Google API key has been entered
 * Google Maps API warning will only be shown after Google Maps API has been explicitly selected
 * Percentage height warning is now more prominant
 * Fixed "Get the rest of these advanced features" using printf where it should be sprintf
 * Bumped "Tested up to" to 5.0.3
 * Corrected year in 7.10.56 changelog
 *
 * 7.10.56 :- 2019-01-09 :- Medium Priority
 * Added function WPGMZA.Distance.between
 * All XML caches are now regenerated when switching to XML pull
 * Removed code to disable TLS verification in WPGMZA\GoogleGeocoder
 *
 * 7.10.55 :- 2018-12-27 :- Medium priority
 * Changed GoogleMap fitBounds to accept a WPGMZA.LatLngBounds
 * Changed OLMap fitBounds to accept a WPGMZA.LatLngBounds
 * Fixed WPGMZA.LatLngBounds setting individual coordinates to LatLngs
 * Fixed WPGMZA.GoogleMap.fitBounds not working with native LatLngBounds
 *
 * 7.10.54 :- 2018-12-20 :- Medium priority
 * Fixed default OpenLayers tiles being fetched over relative URL
 *
 * 7.10.53 :- 2018-12-17 :- Medium priority
 * Added missing file /html/tile-server-fieldset.html.php
 *
 * 7.10.52 :- 2018-12-14 :- Low priority
 * Fixed undefined errors when running Elementor
 * Fixed "Cannot read property 'wpgmza_iw_type' of undefined" preventing infowindow opening
 * Fixed missing spatial prefix on Marker::update_latlng
 * Added class wpgmza-gdpr-compliance to GDPR compliance notice parent div
 * Dynamic content removed from translation strings, printf now used instead
 *
 * 7.10.51 :- 2018-12-11 :- Low priority
 * Added tile server URL setting for OpenLayers
 * Fixed Google vertex context menu preventing OpenLayers engine loading in developer mode
 * Fixed Gutenberg integration module always loading scripts on front end
 *
 * 7.10.50 :- 2018-12-10 :- Low priority
 * Added blank alt attribute to OpenLayers marker img element
 * Updated WP version supported to 5.0
 *
 * 7.10.49 :- 2018-12-05 :- Low priority
 * Improved Gutenberg integration (new buttons added)
 *
 * 7.10.48 :- 2018-12-03 :- Low priority
 * Added a check for wp.editor in Gutenberg JS module
 * Fixed InfoWindow not initialized before open called when using marker open by default setting
 * Fixed WPGMZA.OLMap returning zoom one level too far in (fixes map zooms in one level on save)
 *
 * 7.10.47 :- 2018-11-22 :- Low priority
 * Removed all redundant calls to getPlace
 * Places AutoCompletes now only request the "name" and "formatted_address" fields
 * Changed "Create an API key now" link
 *
 * 7.10.46 :- 2018-11-20 :- Medium priority
 * Fixed store locator circle and radius not displayed when no markers are present
 * Fixed browser compatibility code causing Gutenberg dependency failure
 * Google API version is now fixed at "Quarterly" (solves RetiredVersion notice)
 * Unified store locator circle and radius logic for both XML and DB marker pull
 * All PHP classes and methods now have documentation blocks
 * Server side documentation added in /docs/php
 * Client side documentation added in /docs/js
 *
 * 7.10.45 :- 2018-11-12 :- Medium priority
 * Fixed places autocomplete not initializing with modern store locator
 * Fixed conflict with Autoptimize with large amounts of data by bypassing CSS optimization where shortcode is present
 * Enter key now triggers search on modern store locator
 *
 * 7.10.44 :- 2018-11-05 :- Medium priority
 * Fixed Modern Store Locator Circle not working when Google Maps geometry library not loaded
 * Fixed legacy-map-edit-page.js not enqueued when Gold add-on activated (with Pro >= 7.10.30)
 * Fixed store locator circle color settings not respected in OpenLayers
 * Improved unresolved dependency report, now reports requirements
 *
 * 7.10.43 :- 2018-10-31 :- High priority
 * Improved previous security fix
 *
 * 7.10.42 :- 2018-10-25 :- High priority
 * Closed potential XSS vulnerability in PHP_SELF on map edit page
 *
 * 7.10.41 :- 2018-10-24 :- Medium priority
 * Changed exception to notice when v8 dependencies are missing (fixes issue with Pro < 7.10.37 in developer mode)
 *
 * 7.10.40 :- 2018-10-17 :- Medium priority
 * Added temporary fix for Gutenberg module dependencies preventing wpgmaps.js from loading when in Developer Mode
 * Fixed Infowindow not opening on touch device when using "hover" action
 *
 * 7.10.39 :- 2018-10-15 :- High priority
 * Fixed JS error when Gutenberg framework not loaded
 *
 * 7.10.38 :- 2018-10-15 :- Medium priority
 * Added factory class
 * Added DIVI compatibility fix
 * Added new table name constants
 * Modules added to pave the way for Gutenberg integration
 * Adjusted script loader to support external dependencies
 * Fixed trailing slash breaking rest API routes on some setups
 * Fixed wpgmza_basic_get_admin_path causing URL wrapper not supported
 *
 * 7.10.37 :- 2018-09-27 :- Medium priority
 * Fixed undefined variable on iOS breaking store locator
 * Fixed edit marker using REST API not working when API route has two slashes
 * Fixed map not appearing with particular versions of dataTables where the packaged version is not used
 *
 * 7.10.36 :- 2018-09-25 :- Medium Priority
 * Fixed change in 7.10.35 causing problems with OLMarker click event, preventing infowindow opening
 * Dropped .gitignore which was causing deployment issues, now using .gitattributes to ignore minified files
 *
 * 7.10.35 :- 2018-09-20 :- Medium priority
 * Added links to new API troubleshooting documentation to Google Maps API Error dialog
 * Fixed marker dispatching click event after drag when using OpenLayers
 * Fixed map dispatching click event after drag when using OpenLayers
 * Fixed map editor right click marker appearing multiple times
 * Fixed map editor right click marker disappearing after map drag
 * Fixed modern store locator circle crashing some iOS devices by disabling this feature on iOS devices
 * Fixed gesture handling setting not respected when theme data is set in
 *
 * 7.10.34 :- 2018-09-17 :- Low priority
 * Added descriptive error messages when Google API is required but not loaded
 * Added "I agree" translation to German files
 * Added getPluginScripts to Scriptloader module
 * jQuery 3.x document ready compatibility
 * Changed wpgmza_google_api_status to be passed via wp_localize_script to prevent redirection issues in some circumstances
 * Prevented UGM e-mail address being transmitted in WPGMZA_localized_data
 * Removed redundant locationSelect dropdown
 *
 * 7.10.33 :- 2018-09-05 :- Medium priority
 * Fixed OpenLayers InfoWindow not opening
 *
 * 7.10.32 :- 2018-08-31 :- Medium priority
 * Fixed redundant setting wpgmza_gdpr_enabled causing "user consent not given" to be flagged erroneously
 *
 * 7.10.31 :- 2018-08-30 :- Medium priority
 * Fixed NaN zoom level causing Google Maps to hang
 *
 * 7.10.30 :- 2018-08-29 :- Medium priority
 * Fixed "Access to undeclared static property" on some PHP versions
 * Fixed google-maps-api-error-dialog.html.php does not exist
 *
 * 7.10.29 :- 2018-08-28 :- Medium priority
 * Improved return_polygon_array function making edit polygon page more robust
 * Improved GoogleAPIErrorHandler, modal dialog with documentation links is now shown back end and front end for administrators
 * Implemented setOptions for generic marker module and WPGMZA.GoogleMarker module
 * Added load_textdomain_mofile to fix translation issues
 * Added event storelocatorgeocodecomplete (native) and storelocatorgeocodecomplete.wpgmza
 * Added event storelocatorresult (native) and storelocatorresult.wpgmza
 * Fixed map controls not applied without toggling developer mode
 * Fixed white border around new Google logo
 * Fixed Google API handling change blocking infowindow creation
 * Fixed some global settings not respected (zoom controls, etc.)
 * Fixed can't change wpgmza_maps_engine in WPGMZA_OTHER_SETTINGS when engine is set
 * Removed suffixed .wpgmza events being explicitly dispatched, WPGMZA.EventDispatcher now dispatches these automatically
 *
 * 7.10.28 :- 2018-08-20 :- Low priority
 * Fixed engine being switched to OpenLayers following saving settings on a fresh install
 * Added CSS fix for recent Google UI changes for MacOS / iOS + Safari
 *
 * 7.10.27 :- 2018-08-17 :- Low priority
 * Added wpgmza_xml_cache_generated filter
 * Added wpgmza_xml_cache_saved action
 * Improved return_polyline_array function making edit polyline page more robust
 * Fixed Google API loading before consent given when "Require consent before load" checked
 *
 * 7.10.26 :- 2018-08-15 :- Low priority
 * Improved Google API error handling back end, module issues more comprehensive alerts
 * GoogleAPIErrorHandler moved to /js/v8/google-api-error-handler.js
 * Added CSS fix for recent Google UI changes (Buttons in triplicate)
 *
 * 7.10.25 :- 2018-08-10 :- Low priority
 * Fixed "Undefined variable" notice
 *
 * 7.10.24 :- 2018-07-31 :- Low Priority
 * Added regex callback for class autoloader for installations where token_get_all is not available
 * Added spatial function prefix to spatial data migration function
 * Added lat and lng properties to GoogleGeocoder result (for Pro 5 & UGM compatibility)
 * Altered Map module to deserialize other_settings and merge into the map settings object
 * Altered parent:: to \Exception:: in CSS selector parser
 * Fixed version detection for MySQL 8
 *
 * 7.10.23 :- 2018-07-23 :- Low priority
 * Fixed REST API endpoint URL incorrect for installations in subfolders
 * Fixed WPGMZA\Parent not found
 * Added PHP version requirement 5.3 to readme.txt
 *
 * 7.10.22 :- 2018-07-18 :- Medium priority
 * Added filter wpgmza_localized_strings
 * Added beginnings for REST API
 * Added scroll animation when edit marker is clicked
 * Fixed UTF-8 characters not being decoded into PHPs native charset before passing them to loadHTML in GDPR compliance module
 * Fixed edit marker button not re-enabled following unsuccessful geocode
 *
 * 7.10.21 :- 2018-07-09 :- Medium priority
 * Added MySQL version check and dropped ST_ function prefixes for versions < 8.0
 * Fixed markers not appearing front end and back end marker table empty for servers running old MySQL versions
 *
 * 7.10.20 :- 2018-07-05 :- Low priority
 * Added hook for new GDPR tab content
 * Added JavaScript for VGM GDPR controls
 * Fixed WPGMZA\DOMDocument::saveInnerBody not saving text nodes
 * 
 * 7.10.19 - 2018-07-05 :- Medium Priority
 * Added new event "userlocationfound" dispatched from WPGMZA.events
 * Added fall back to convert UTF-8 to HTML entities on installations without multibyte functions available
 * Changed GDPR settings UI, removed redundant compliance setting, added default notice
 * Fixed media="1" attribute not validating
 * Fixed nominatim geocoder not giving expected response to callback
 * Fixed ScriptLoader module always enqueuing FontAwesome 4.*
 * Fixed debug code breaking WP Migrate DB integration
 * Fixed custom fields blank in marker listing
 * Replaced deprecated MySQL functions with ST_ functions
 * Replaced deprecated jQuery(window).load functions
 * Removed Google autocomplete when using OpenLayers
 * Removed protocol from marker icons / fixed marker icons disappear after switching to https://
 *
 * 7.10.18 - 2018-07-02 :- Medium Priority
 * Fixed GDPR back end warning appearing when GDPR compliance is enabled
 *
 * 7.10.17 - 2018-06-29 :- Medium Priority
 * Fixed country restriction broken in store locator
 * Added dismissable admin GDPR warning when GDPR compliance has been switched off
 * Fixed GDPR settings blank by default on some installations
 *
 * 7.10.16 - 2018-06-21 :- Medium priority
 * Fixed global settings lost
 * Fixed whitespace matched in version variable
 *
 * 7.10.15 - 2018-06-14 :- Medium priority
 * Fixed GDPR consent notice bypassed when "prevent other plugins and theme enqueueing maps API" is not set
 *
 * 7.10.14 - 2018-06-14 :- Medium priority
 * Fixed incompatibilities with UGM
 *
 * 7.10.13 - 2018-06-13 :- Low priority
 * Fixed can't save Modern Store Locator
 * Fixed store locator reset not working
 * Fixed disabling map controls not working
 * Fixed store locator radio button
 *
 * 7.10.12 - 2018-06-12 :- Low priority
 * Handed FontAwesome loading over to ScriptLoader module
 * Deprecated global function wpgmza_enqueue_fontawesome
 * Fixed circles and rectangles only working on map ID 1
 *
 * 7.10.11 - 2018-06-08 :- Low priority
 * Fixed JS error when passing non-string value to document.write
 * Temporary workaround for "Unexpected token % in JSON"
 * API consent no longer required on back-end
 *
 * 7.10.10 - 2018-06-01 :- Medium Priority
 * Adding setting "Prevent other plugins and theme loading API"
 *
 * 7.10.09 - 2018-06-01 :- Medium Priority
 * Fixed unterminated comment warning
 * Fixed map edit page creating Google places autocomplete when engine is set to OpenLayers
 * Fixed icon not draggable in edit marker location page
 *
 * 7.10.08 - 2018-05-31 :- Medium Priority
 * Fixed cannot edit marker in Basic only
 *
 * 7.10.07 - 2018-05-31 :- Medium Priority
 * Fixed issue where map engine was different on back end
 *
 * 7.10.06 - 2018-05-31 :- Medium Priority
 * Added "require consent before API load" to GDPR settings
 *
 * 7.10.05 - 2018-05-30 :- Low Priority
 * Fixed Using $this when not in object context when using older PHP version
 * Fixed google sometimes not defined when selected engine is OpenLayers
 * Fixed can't edit GDPR fields
 *
 * 7.10.04 - 2018-05-30 :- Medium Priority
 * Fixed geocode response coordinates not interpreted properly
 * Italian translation updated
 *
 * 7.10.03 - 2018-05-30 :- High Priority
 * Fixed InfoWindow not opening when max width set in
 * Fixed $this not in context inside closure when using older PHP versions
 * Fixed Gold add-on clustering settings blank
 * Altered map engine selection dialog
 * 
 * 7.10.02 - 2018-05-29
 * Engine defaults to Google Maps 
 *
 * 7.10.01 - 2018-05-29 :- Medium Prority
 * Fixed undefined index notice in GDPR module
 *
 * 7.10.00 - 2018-05-29 :- Medium Priority
 * Added new Javascript modules
 * Added new PHP modules
 * Class AutoLoading implemented
 * OpenLayers / OpenStreetMap integration
 * Fixed Edit Marker Position not working with Pro 6.*
 * Fixed some strings not being translated in German
 * JS Minification
 * Added "Developer mode"
 *
 * 7.0.05
 * Added GoogleMapsAPILoader module which now controls Google Maps API enqueueing and relevant settings
 * Added integration with WP Migrate DB to handle spatial types
 * Added support for shortcodes in marker description
 * Bug fixes
 *
 * 7.0.04 - 2018-05-07
 * Fixed PHP notice regarding store locator default radius
 *
 * 7.0.03 - 2018-04-20
 * Improved spatial data migration function to be more robust
 * Fixed undefined index use_fontawesome
 *
 * 7.0.02 - 2018-04-15
 * Added option to select FontAwesome version
 * Fixed bug with circle data array
 *
 * 7.0.01 - 2018-04-11
 * Switched to WebFont / CSS FontAwesome 5 for compatibility reasons
 * Fixed JS error in for ... in loop when adding methods to Array prototype
 * Fixed FontAwesome CSS being enqueued as script
 * Added functionality to fit map to bounds when editing shapes
 * 
 * 7.0.00 - 2018-04-04
 * Added arbitrary radii control to Maps -> Settings -> Store Locator
 * Added modern store locator look and feel
 * Added modern store locator radius
 * Added custom JS field in Maps -> Settings -> Advanced
 * Added spatial types to marker table
 * Added Google API Error handler and alert
 * Added code to display custom fields in infowindow when Pro is installed
 * Fresh install "My First Map" defaults to modern store locator and radius
 * Relaxed theme data parsing
 * Disabled Street View, zoom controls, pan controls and map type controls on fresh installs
 * 
 * 6.4.08 - 2018-01-14 - Medium priority
 * Update Google Maps API versions to include 3.30 and 3.31
 * On first installation, users are now taken to the welcome page
 * Updated contributors
 * Updated credits page
 * Fixed broken support links
 * Got things ready for the new Version 7 that is on its way
 * 
 * 6.4.07 - 2018-01-08 - Low priority
 * Added a deactivation survey to gain insight before moving to Version 7
 * Tested on WP 4.9.1
 * 
 * 6.4.06 - 2017-09-07 - Medium Priority
 * Bug Fix: Zoom level is not respected when saving
 * 
 * 6.4.05 - 2017-06-13 - Medium priority
 * Fixed the bug that caused JS errors to show up in the map editor
 * Fixed a bug that caused the XML File option (for markers) to cause issues when trying to add a marker in the backend
 * Allowed users to hide the subscribe feature in the plugins page
 * New feature: Bulk delete markers
 * Autocomplete now works when adding markers
 * Autocomplete now works for the store locator on the front end
 * Fixed a bug that caused the map to not load in the map editor for new installations
 * 
 * 6.4.04 - 2017-06-08 - Low priority
 * Tested on WordPress 4.8
 * Refactored the admin JS code
 *
 * 6.4.03 - 2017-02-17 - Low priority
 * Added the ability for affiliates to make use of their affiliate IDs in the pro links
 * Added better SSL support
 * Added shortcode support for XML marker files
 * 
 * 6.4.02 - 2017-01-20 - Low priority
 * Removed an echo that was incorrectly placed
 * 
 * 6.4.01 - 2017-01-20 - Low priority
 * Added the ability for users to subscribe to our mailing list
 * 
 * 6.4.00 - 2017-01-11 - Low priority
 * Documented all PHP functions
 * Added an option to set default store locator address
 * Full screen map functionality added
 * Fixed a bug that caused custom css to be incorrectly escaped
 * Fixed the bug that caused the "save marker" button to not revert when an address couldnt be geocoded
 * Added caching notices to notify users to clear their cache when a marker is added or edited or when map settings were changed
 * Estonian translation added
 * Fixed the incorrect locale setting with the Google Maps API
 * Fixed a bug that caused the admin style sheet to load on all admin pages
 * Added the ability to change the gesture input
 * Fixed a bug that caused PHP warnings when a polygon or polyline had no polydata
 * Fixed a bug that caused non-utf8 characters within an address to cause the insertion of the marker to fail
 * 
 * 6.3.20 - 2016-09-27
 * Fixed a big that prevented the map from loading in a widget
 * Refactored code used to load the Google Maps API and Script files
 * 
 * 6.3.19 - 2016-09-21
 * Fixed a bug that caused some maps to not load markers on page load
 *  
 * 6.3.18 - 2016-09-15
 * Chinese support - when your language is set to Chinese (ZN_cn), the map will now load from maps.google.cn
 * Hebrew language code fixed when accessing the Google Maps API in Hebrew
 * Added support for the KML layer to be visible when adding/editing polygons or polylines
 * Fixed a bug with the store locator not using miles when selected
 * Moved up to versions 3.25 and 3.26 of the Google Maps JavaScript API
 * Datatables updated
 * When a marker is deleted, the view does not reset
 * User javascript has been ported over to a JavaScript file
 * A minimifed and unminified version of the user-side JS file is now included - The minifed version is used by default
 * You can now set the zoom level via the shortcode. Example: [wpgmza id='1' zoom=8]
 * Fixed a PHP warning on the error log page
 * 
 * 6.3.17 - 2016-08-07 - Medium priority
 * Added a temporary Google Maps JavaScript API key for users so that the UX is not negatively affected on the user's first attempt at using the plugin.
 * Added a check to the front end to only display the map if there is an Google Maps JavaScript API key saved 
 * Fixed bugs that caused PHP warnings within the store locator
 * UX improvements to the welcome page
 * Fixed a bug that caused a JS error as a result of the previous versions new tab support
 * 
 * 6.3.16 - 2016-08-02 - Low priority
 * API key is now used on the edit polyline page
 * Removed the resizing script that caused the map to flicker on mobile devices
 * Added additional tab support (tri-tabs-nav span)
 * Fixed a bug in the store locator country restriction list
 * 
 * 6.3.15 - 2016-07-31 - High priority
 * Security patches
 * Code refactoring
 * 
 * 6.3.14 - 2016-07-13 - High priority
 * Many security patches - thank you Gerard Arall
 * Bug fix - trim whitespace before and api the Google Maps API key
 * Additional tab support added
 * Corrected PHP noticess
 * 
 * 6.3.13 - 2016-07-05 - Medium priority
 * Revised Maps API Dequeue Script Added
 * Remove Style dequeue script as this was causing UI conflicts
 * Added option to disable Maps API from being loaded on front end
 *
 * 6.3.12 - 2016-06-27 - Medium priority
 * Modified the API key notification to make it simpler and more intuitive
 * 
 * 6.3.11 - 2016-06-24 - Medium Priority
 * Small activation bug fixed
 * all polygons and polylines are now viewable when editing or creating a new polygon or polyline
 * Notifications of Google Maps API key requirements
 * 
 * 6.3.10 - 2016-05-03 - Low priority
 * Added event listeners for both jQuery and accordions so that the map can init correctly when placed in a tab or accordion
 * Added checks to stop themes and plugins from loading the Google Maps API over and above our call to the API on pages that contain the map shortcode
 * Fixed an SSL issue with the marker URL (Thank you David Clough)
 * Fixed a bug that caused the CSS file to be loaded on all front end pages
 * Added SSL support to the jQuery CDN file
 * 
 * 6.3.09 - 2016-04-15 - High priority
 * Deprecated google maps api 3.14 and 3.15, added 3.23 and 3.24
 * 
 * 6.3.08 - 2016-04-14 - Medium Priority
 * Provides a workaround for users experiencing issues with their maps loading after updating to WordPress 4.5
 * 
 * 6.3.07 - 2016-04-13 - Low Priority
 * Tested on WordPress 4.5
 * You can now use your own Google Maps API key for your maps
 * 
 * 6.3.06 - 2016-04-04 - Low Priority
 * Indonesian Translation added - Thank you Neno
 * Swedish Translation added - Thank you Martin Sleipner
 * Bulgarian Translation added - Thank you Lyubomir Kolev
 * Google Maps API sensor removed from API call 
 * 
 * 6.3.05 - 2016-01-14 - Low priority
 * Multiple tab compatibility added
 * 
 * 6.3.04 - 2016-01-04 - Low priority
 * Tested with WP 4.4
 *
 * 6.3.03 - 2015-11-19 - Low Priority
 * Fixed a bug that caused the map to not display when a theme was not selected
 * 
 * 6.3.02 - 2015-11-06 - Low priority
 * A new theme directory has been created - this allows you to use any map theme or style that you want simply by copying and pasting it's data
 * 
 * 6.3.01 - 2015-10-06 - Low priority
 * Added 3 new google map custom themes
 * Corrected internationalization
 * iPhone map marker styling fix
 * Fixed an autocomplete bug
 * All WP Google Maps language files have been updated
 * 
 * 6.3.00 - 2015-09-02 - Low priority
 * Added 5 map themes to the map editor
 * Added a native map widget so you can drag and drop your maps to your widget area
 * Minor bug fixes
 * Language files updated
 * Turkish translation added - thank you Suha Karalar
 * 
 * 6.2.3 - 2015-08-20 - High priority
 * Included the latest version of datatables to fix the bug experienced with the new jQuery being included in WordPress 4.3
 * Updated datatables.responsive to 1.0.7 and included the minified version of the file instead
 * Fixed a few styling bugs in the map editor
 * 
 * 6.2.2 - Security Update - 2015-07-27 - High Priority
 * Security patch
 * Tested with WP 4.2.3
 * 
 * 6.2.1 - Security Update - 2015-07-13 - High Priority
 * Security enhancements to the map editor page, map javascript, marker categories and front end code
 * 
 * 6.2.0 - Liberty Update - 2015-06-24 - Medium Priority
 * Security enhancements (map editor, marker location, map settings)
 * Weather has been removed (deprecated by Google Maps)
 * Major bug fix (Google Map places bug) - caused the map markers not to show if the map store locator was not enabled
 * Fixed a bug that caused the jQuery error message to display briefly before the map loaded
 * Fixed a bug that caused the max map zoom to default back to 3
 * 
 * 6.1.10 - 2015-06-10 - High priority
 * XSS security patch
 * Security enhancements
 * Fixed a bug that didnt allow you to add a map marker if there were no markers to start with
 * 
 * 6.1.9 - 2015-06-01 - Low priority
 * Fixed french translation bug
 * 
 * 6.1.8 - 2015-05-27 - Low priority
 * Greek translation added - Thank you Konstantinos Koukoulakis
 * Added the Google Maps autocomplete functionality to the "add marker" section of the map editor
 * Added the Google Maps autocomplete functionality to the Store Locator
 * 
 * 6.1.7 - 2015-04-22 - Low priority
 * json_encode (extra parameter) issue fixed for hosts using PHP version < 5.3
 * 
 * 6.1.6 - 2015-04-17 - Low priority
 * Rocketscript fix (Cloudfare)
 * Dutch translation added
 * Main translation file updated
 * 
 * 6.1.5 - 2015-03-16 - High priority
 * Timthumb removed
 * New support page added
 * You can now restrict your store locator search by a specific country
 * Bug fix in map editor
 * SSL bug fix
 * Usability Improvements when right clicking to add a marker on the map.
 * 
 * 6.1.4 - 2015-02-13
 * Safari bug fix
 * Fixed issues with map markers containing addresses with single quotes
 * You can now set the max zoom of your google map
 * 
 * 6.1.3 - 2015-01-19
 * IIS 500 server error fix
 * Small map bug fixes
 * Brazilian portuguese language file updated
 * Activation error fixes
 * 
 * 6.1.2 2015-01-19
 * Code improvements (PHP warnings)
 * Tested in WordPress 4.1
 * 
 * 6.1.1 2014-12-19
 * Code improvements
 * 
 * 6.1.0 2014-12-17
 * Added an alternative method to pull the marker data
 * 
 * 6.0.32
 * Comprehensive checks added to the Marker XML Dir field
 * 
 * 6.0.31 2014-11-28
 * Category bug fix
 * 
 * 6.0.30 2014-11-26
 * Added a check for the DOMDocument class
 * Removed the APC Object Cache warning
 * Added new strings to the PO file
 * 
 * 6.0.29
 * New option: You can now show or hide the Store Locator bouncing icon
 * New feature: Add custom CSS in the settings page
 * Code improvements
 * 
 * 6.0.28
 * Enfold / Avia theme conflict resolved (Google Maps API loading twice)
 * Better marker file/directory control
 * Italian translation added (Tommaso Mori)
 * 
 * 6.0.27 - 2014-09-29
 * French translation updated by Arnaud Thomas
 * Security updates (thank you www.htbridge.com)
 * Fixed the bug that wouldnt allow you to select the Google maps API version
 * Code improvements (PHP warnings)
 * Google Map Store Locator bug fix - map zoom levels on 300km, 150km and 75km were incorrect
 * 
 * 6.0.26
 * Attempting to fix the "is_dir" and "open_basedir restriction" errors some users are experiencing.
 * Updated timthumb to version 2.8.14
 * Altered all instances of "is_dir" in timthumb.php (causing fatal errors on some hosts) and replace it with 'file_exists'
 * 
 * 6.0.25
 * Removed the use of "is_dir" which caused fatal errors on some hosts
 * 
 * 6.0.24
 * Added extra support for folder management and error reporting
 * Code improvements (PHP Warnings)
 * Better polygon and polyline handling
 * Hebrew translation added
 * 
 * 6.0.23
 * Added extra support for corrupt polyline and polygon data
 * 
 * 6.0.22
 * Fixed incorrect warning about permissions when permissions where "2755" etc.
 * Add classes to the google map store locator elements
 * 
 * 6.0.21
 * Backend UI improvement
 * You can now right click to add a marker to the map
 * New markers can be dragged
 * Polygons and polylines now have labels
 * Small bug fixes
 * 
 * 
 * 6.0.20
 * You can now set the query string for the store locator
 * 
 * 6.0.19
 * Fixed a bug that caused the marker file to be recreated on every page load in some instances.
 * Fixed a marker listing display bug (iPhone)
 * Now showing default settings for marker path and URL
 * Removed the "map could not load" error
 * Fixed a bug that when threw off gps co-ordinates when adding a lat,lng as an address
 * 
 */

if(!function_exists('wpgmza_show_php_version_error'))
{
	function wpgmza_show_php_version_error()
	{
		?>
		<div class="notice notice-error">
			<p>
				<?php
				_e('<strong>WP Google Maps:</strong> This plugin does not support PHP version 5.2 or below. Please use your cPanel or contact your host to switch version.', 'wp-google-maps');
				?>
			</p>
		</div>
		<?php
	}
	 
	if(version_compare(phpversion(), '5.3', '<'))
	{
		add_action('admin_notices', 'wpgmza_show_php_version_error');
		return;
	}
}

define("WPGMZA_DIR_PATH", plugin_dir_path(__FILE__));
define('WPGMZA_FILE', __FILE__);

define("WPGMAPS_DIR_PATH", plugin_dir_path(__FILE__));
define("WPGMAPS_DIR",plugin_dir_url(__FILE__));

if(!defined('DS')) define('DS', DIRECTORY_SEPARATOR);

global $wpgmza_version;
global $wpgmza_p_version;
global $wpgmza_t;
global $wpgmza_tblname;
global $wpgmza_tblname_maps;
global $wpgmza_tblname_poly;
global $wpgmza_tblname_polylines;
global $wpgmza_tblname_categories;
global $wpgmza_tblname_category_maps;
global $wpdb;
global $wpgmza_p;
global $wpgmza_g;
global $short_code_active;
global $wpgmza_current_map_id;
global $wpgmza_current_mashup;
global $wpgmza_mashup_ids;
global $debug;
global $debug_step;
global $debug_start;
global $wpgmza_global_array;
global $wpgmza_tblname_circles;
global $wpgmza_tblname_rectangles;

// require_once('includes/crud-test.php');

global $wpgmza_default_store_locator_radii;
$wpgmza_default_store_locator_radii = array(1,5,10,25,50,75,100,150,200,300);

global $wpgmza_override;
$wpgmza_override = array();

$debug = false;
$debug_step = 0;
$wpgmza_p = false;
$wpgmza_g = false;
$WPGMZA_TABLE_NAME_MARKERS = $wpgmza_tblname = $wpdb->prefix . "wpgmza";
$WPGMZA_TABLE_NAME_MAPS = $wpgmza_tblname_maps = $wpdb->prefix . "wpgmza_maps";
$WPGMZA_TABLE_NAME_POLYGONS = $wpgmza_tblname_poly = $wpdb->prefix . "wpgmza_polygon";
$WPGMZA_TABLE_NAME_POLYLINES = $wpgmza_tblname_polylines = $wpdb->prefix . "wpgmza_polylines";
$WPGMZA_TABLE_NAME_CIRCLES = $wpgmza_tblname_circles = $wpdb->prefix . "wpgmza_circles";
$WPGMZA_TABLE_NAME_RECTANGLES = $wpgmza_tblname_rectangles = $wpdb->prefix . "wpgmza_rectangles";
$WPGMZA_TABLE_NAME_CATEGORIES = $wpgmza_tblname_categories = $wpdb->prefix. "wpgmza_categories";
$wpgmza_tblname_category_maps = $wpdb->prefix. "wpgmza_category_maps";

$subject = file_get_contents(__FILE__);
if(preg_match('/Version:\s*(.+)/', $subject, $m))
	$wpgmza_version = trim($m[1]);

define('WPGMZA_VERSION', $wpgmza_version);
define("WPGMAPS", $wpgmza_version);

$wpgmza_p_version = "6.19";
$wpgmza_t = "basic";

require_once(plugin_dir_path(__FILE__) . 'includes/class.auto-loader.php');
require_once(plugin_dir_path(__FILE__) . 'includes/class.gdpr-compliance.php');

require_once(plugin_dir_path(__FILE__) . 'includes/class.plugin.php');
require_once(plugin_dir_path(__FILE__) . 'includes/3rd-party-integration/class.wp-migrate-db-integration.php');
require_once(plugin_dir_path(__FILE__) . 'includes/open-layers/class.nominatim-geocode-cache.php');
require_once(plugin_dir_path(__FILE__) . 'includes/class.maps-engine-dialog.php');

require_once( "base/includes/wp-google-maps-polygons.php" );
require_once( "base/includes/wp-google-maps-polylines.php" );
require_once( "base/classes/widget_module.class.php" );
require_once( "base/includes/deprecated.php" );
require_once( "includes/compat/backwards_compat_v6.php" );

// NB: GDPR
/*include ( "lib/codecabin/deactivate-feedback-form.php" );
add_filter( 'codecabin_deactivate_feedback_form_plugins', 'wpgmaps_deactivation_survey_t2' );
function wpgmaps_deactivation_survey_t2( $plugins ) {
    global $wpgmza_version;
    $plugins[] = (object)array(
        'slug'      => 'wp-google-maps',
        'version'   => WPGMAPS
    );

    return $plugins;
}*/

if (function_exists('wpgmaps_head_pro' )) {
    add_action( 'admin_head', 'wpgmaps_head_pro' );
} else {
    if (function_exists( 'wpgmaps_pro_activate' ) && floatval($wpgmza_version) < 5.24) {
        add_action( 'admin_head', 'wpgmaps_head_old' );
    } else {
        add_action( 'admin_head', 'wpgmaps_head' );
    }
    
}
add_action( 'admin_head','wpgmaps_feedback_head' );


add_action( 'admin_footer', 'wpgmaps_reload_map_on_post' );
register_activation_hook( __FILE__, 'wpgmaps_activate' );
register_deactivation_hook( __FILE__, 'wpgmaps_deactivate' );
add_action( 'init', 'wpgmaps_init' );
add_action( 'admin_menu', 'wpgmaps_admin_menu' );
add_filter( 'widget_text', 'do_shortcode' );

// Google API Loader
// NB: Removed, functionality handed over to GoogleMapsLoader
if(!function_exists('wpgmza_enqueue_scripts'))
{
	function wpgmza_enqueue_scripts()
	{
		global $wpgmza_google_maps_api_loader;
		require_once(plugin_dir_path(__FILE__) . 'includes/class.google-maps-api-loader.php');
		
		$wpgmza_google_maps_api_loader = new WPGMZA\GoogleMapsAPILoader();
		$wpgmza_google_maps_api_loader->registerGoogleMaps();
		
		if(isset($_GET['page']) && preg_match('/wp-google-maps/', $_GET['page']))
			$wpgmza_google_maps_api_loader->enqueueGoogleMaps();
	}
	
	add_action('wp_enqueue_scripts', 'wpgmza_enqueue_scripts');
	add_action('admin_enqueue_scripts', 'wpgmza_enqueue_scripts');
}

$debug_start = (float) array_sum(explode(' ',microtime()));

/**
 * Activate function that creates the first map and sets the default settings
 * @return void
 */
function wpgmaps_activate() {
	global $wpgmza;
    global $wpdb;
    global $wpgmza_version;
    $table_name = $wpdb->prefix . "wpgmza";
    $table_name_maps = $wpdb->prefix . "wpgmza_maps";
	
	$wpgmza_data = get_option("WPGMZA");
	
	$other_settings = get_option('WPGMZA_OTHER_SETTINGS');
	
	if(empty($other_settings))
		$other_settings = array(
			'wpgmza_settings_map_streetview' => 'yes',
			'wpgmza_settings_map_zoom' => 'yes',
			'wpgmza_settings_map_pan' => 'yes',
			'wpgmza_settings_map_type' => 'yes'
		);
	
	update_option('WPGMZA_OTHER_SETTINGS', $other_settings);

    update_option("wpgmza_temp_api",'AIzaSyChPphumyabdfggISDNBuGOlGVBgEvZnGE');

	// set defaults for the Marker XML Dir and Marker XML URL
    if (get_option("wpgmza_xml_location") == "") {
        $upload_dir = wp_upload_dir();
        add_option("wpgmza_xml_location",'{uploads_dir}/wp-google-maps/');
    }
    if (get_option("wpgmza_xml_url") == "") {
        $upload_dir = wp_upload_dir();
        add_option("wpgmza_xml_url",'{uploads_url}/wp-google-maps/');
    }
    
    wpgmaps_handle_db();
    
    wpgmaps_handle_directory();

	// load first map as an example map (i.e. if the user has not installed this plugin before, this must run
	$res_maps = $wpdb->get_results("SELECT * FROM $table_name_maps");
	
	if (!$res_maps) { 
		$rows_affected = $wpdb->insert( $table_name_maps, array(
			"map_title" => __("My first map","wp-google-maps"),
			"map_start_lat" => "45.950464398418106",
			"map_start_lng" => "-109.81550500000003",
			"map_width" => "100",
			"map_height" => "400",
			"map_width_type" => "%",
			"map_height_type" => "px",
			"map_start_location" => "45.950464398418106,-109.81550500000003",
			"map_start_zoom" => "2",
			"directions_enabled" => '1',
			"default_marker" => "0",
			"alignment" => "0",
			"styling_enabled" => "0",
			"styling_json" => "",
			"active" => "0",
			"type" => "1",
			"kml" => "",
			"fusion" => "",
			"bicycle" => "2",
			"traffic" => "2",
			"dbox" => "1",
			"dbox_width" => "100",
			"default_to" => "",
			"listmarkers" => "0",
			"listmarkers_advanced" => "0",
			"filterbycat" => "0",
			"order_markers_by" => "1",
			"order_markers_choice" => "2",
			"show_user_location" => "0",
			"ugm_enabled" => "0",
			"ugm_category_enabled" => "0",
			"ugm_access" => "0",
			"mass_marker_support" => "1",
			"other_settings" => 'a:2:{s:19:"store_locator_style";s:6:"modern";s:33:"wpgmza_store_locator_radius_style";s:6:"modern";}'
		)); 
		
		// load first marker as an example marker
		$stmt = $wpdb->prepare("SELECT * FROM $table_name WHERE `map_id` = %d", 1);
		$results = $wpdb->get_results($stmt);

		$stmt = $wpdb->prepare("INSERT INTO $table_name (
			map_id, 
			address, 
			lat, 
			lng, 
			latlng, 
			pic, 
			link, 
			icon, 
			anim, 
			title, 
			infoopen, 
			description, 
			category, 
			retina
			)		
			
			VALUES 
			
			(%d, %s, %s, %s, {$wpgmza->spatialFunctionPrefix}GeomFromText(%s), %s, %s, %s, %d, %s, %s, %s, %s, %d)", array(
			
			1,
			'California',
			36.778261,
			-119.4179323999,
			'POINT(36.778261 -119.4179323999)',
			'',
			'',
			'',
			0,
			'',
			'',
			'',
			'',
			0
		));
		
		$wpdb->query($stmt);
		
	}
	
    add_option("wpgmaps_current_version", $wpgmza_version);
}

add_action( "activated_plugin", "wpgmza_redirect_on_activate" );
/**
 * Redirect the user to the welcome page on plugin activate
 * @param  string $plugin
 * @return void
 */
function wpgmza_redirect_on_activate( $plugin ) {
    if( $plugin == plugin_basename( __FILE__ ) ) {
        if ( !get_option( "WPGM_V6_FIRST_TIME" ) ) {
            update_option( "WPGM_V6_FIRST_TIME", true );
            // clean the output header and redirect the user
            @ob_flush();
            @ob_end_flush();
            @ob_end_clean();
            
            exit( wp_redirect( admin_url( 'admin.php?page=wp-google-maps-menu&action=welcome_page' ) ) );
        }
    }
}

/**
 * Deactivate function (DEPRECATED)
 * @return void
 */
function wpgmaps_deactivate() { /* wpgmza_cURL_response("deactivate"); */ }

/**
 * Init functionality 
 *
 * Checks if default settings have in fact been set
 * Checks if the XML directory exists
 * Handles first time users and redirects them to the welcome page
 * Handles version checks and subsequent changes if the plugin has been updated
 * 
 * @return void
 */
function wpgmaps_init() {
	global $wpgmza;
    global $wpgmza_pro_version;
    global $wpgmza_version;
	
    wp_enqueue_script("jquery");
    $plugin_dir = basename(dirname(__FILE__))."/languages/";
    load_plugin_textdomain( 'wp-google-maps', false, $plugin_dir );
    
     
    if (get_option("wpgmza_xml_location") == "") {
        $upload_dir = wp_upload_dir();
        add_option("wpgmza_xml_location",'{uploads_dir}/wp-google-maps/');
    }
    
    if (get_option("wpgmza_xml_url") == "") {
        $upload_dir = wp_upload_dir();
        add_option("wpgmza_xml_url",'{uploads_url}/wp-google-maps/');
    }
    
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");

    if (!isset($wpgmza_settings['wpgmza_settings_marker_pull']) || $wpgmza_settings['wpgmza_settings_marker_pull'] == "") {
        
        $wpgmza_first_time = get_option("WPGMZA_FIRST_TIME");
		
		if (!$wpgmza_first_time) { 
			/* first time, set marker pull to DB */
			$wpgmza_settings['wpgmza_settings_marker_pull'] = "0";
			update_option("WPGMZA_OTHER_SETTINGS",$wpgmza_settings);

		} else {
			/* previous users - set it to XML (what they were using originally) */
			$wpgmza_settings['wpgmza_settings_marker_pull'] = "1";
			update_option("WPGMZA_OTHER_SETTINGS",$wpgmza_settings);
		}
    }
   
    if (function_exists("wpgmza_register_pro_version")) {
        global $wpgmza_pro_version;
        if (floatval($wpgmza_pro_version) < 5.41) {
            /* user has pro and is prior to version 5.41 so therefore do not save the shortcode in the URL, rather process it and then save it */
            update_option("wpgmza_xml_url",wpgmza_return_marker_url());
            update_option("wpgmza_xml_location",wpgmza_return_marker_path());
        } else {
            
        }
    } 
    
    
   

    
    
//    delete_option("WPGMZA_FIRST_TIME");
    
    wpgmaps_handle_directory();
    /* handle first time users and updates */
    if (isset($_GET['page']) && $_GET['page'] == 'wp-google-maps-menu') {

        
        /* check if their using APC object cache, if yes, do nothing with the welcome page as it causes issues when caching the DB options */
        if (class_exists("APC_Object_Cache")) {
            /* do nothing here as this caches the "first time" option and the welcome page just loads over and over again. quite annoying really... */
        }  else { 
            if (isset($_GET['override']) && $_GET['override'] == "1") {
                $wpgmza_first_time = $wpgmza_version;
                update_option("WPGMZA_FIRST_TIME",$wpgmza_first_time);
            } else {
                $wpgmza_first_time = get_option("WPGMZA_FIRST_TIME");
                if (!$wpgmza_first_time) { 
					
                    /* show welcome screen */
                    $wpgmza_first_time = $wpgmza_version;
					
                    update_option("WPGMZA_FIRST_TIME",$wpgmza_first_time);
                    wp_redirect(get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-menu&action=welcome_page");
                    exit();
                }
                
                if ($wpgmza_first_time != $wpgmza_version) {
                    update_option("WPGMZA_FIRST_TIME",$wpgmza_version);
                    
                }
                
            }
        }
    }
    /* check if version is outdated or plugin is being automatically updated */
    /* update control */
    $current_version = get_option("wpgmaps_current_version");
	
	if(version_compare($current_version, '7.00', '<'))
		wpgmza_migrate_spatial_data();
	
    if (!isset($current_version) || $current_version != $wpgmza_version) {

        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
        
        update_option("WPGMZA_OTHER_SETTINGS",$wpgmza_settings);

        wpgmaps_handle_db();
        wpgmaps_handle_directory();
        wpgmaps_update_all_xml_file();

        update_option("wpgmaps_current_version",$wpgmza_version);
    }
    
}


/**
 * Create the XML directory if it doesnt exist.
 * @return bool true or false if there was a problem creating the directory
 */
function wpgmaps_handle_directory() {
    
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    if (isset($wpgmza_settings['wpgmza_settings_marker_pull']) && $wpgmza_settings['wpgmza_settings_marker_pull'] == '0') {
        /* using db method, do nothing */
        return;
    }
    if (get_option("wpgmza_xml_location") == "") {
        $upload_dir = wp_upload_dir();
        add_option("wpgmza_xml_location",'{uploads_dir}/wp-google-maps/');
    }
    $xml_marker_location = get_option("wpgmza_xml_location");
    if (!file_exists($xml_marker_location)) {
        if (@mkdir($xml_marker_location)) {
            return true;
        } else {
            return false;
        }
        
    }
    
    
}


/**
 * Plugin action links filter
 *
 * @param array   $links
 * @return array
 */
add_filter( 'network_admin_plugin_action_links_wp-google-maps/wpGoogleMaps.php', 'wpgmza_plugin_action_links' );
add_filter( 'plugin_action_links_wp-google-maps/wpGoogleMaps.php', 'wpgmza_plugin_action_links' );
function wpgmza_plugin_action_links( $links ) {
    array_unshift( $links,
        '<a class="edit" href="' . admin_url('admin.php?page=wp-google-maps-menu') . '">' . __( 'Map Editor', 'wp-google-maps' ) . '</a>' );
    array_unshift( $links,
        '<a class="edit" href="' . admin_url('admin.php?page=wp-google-maps-menu-settings') . '">' . __( 'Settings', 'wp-google-maps' ) . '</a>' );
    array_unshift( $links,
        '<a class="" target="_BLANK" href="'.wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=plugin_link_upgrade").'">' . __( 'Get Pro Version', 'wp-google-maps' ) . '</a>' );


    return $links;
}

// NB: GDPR
//add_action( 'wp_ajax_wpgmza_subscribe','wpgmza_ajax_subscribe');
//add_action( 'wp_ajax_wpgmza_subscribe_hide','wpgmza_ajax_subscribe'); 
function wpgmza_ajax_subscribe() {
    /*$check = check_ajax_referer( 'wpgmza_subscribe', 'security' );
    if ( $check == 1 ) {
        if ( $_POST['action'] == 'wpgmza_subscribe' ) {
            $uid = get_current_user_id();
            update_user_meta( $uid, 'wpgmza_subscribed', true);

        }

        if ( $_POST['action'] == 'wpgmza_subscribe_hide' ) { 
            $uid = get_current_user_id(); 
            update_user_meta( $uid, 'wpgmza_subscribed', true); 
            echo "1"; 
            die(); 
        }  
    }*/
}

// NB: GDPR
/*add_action ( 'admin_head', 'wpgmza_plugin_row_js' );*/
/*function wpgmza_plugin_row_js(){
    $current_page = get_current_screen();

	if(!is_object($current_page))
		return;
	
    if ( $current_page->base == 'plugins' ) {
        wp_register_script( 'wpgmza_plugin_row_js', WPGMAPS_DIR.'js/wpgmaps_plugin_row.js', array( 'jquery-ui-core' ) );
        wp_enqueue_script( 'wpgmza_plugin_row_js' );
        wp_localize_script( 'wpgmza_plugin_row_js', 'wpgmza_sub_nonce', wp_create_nonce("wpgmza_subscribe") );
    }
}*/


/**
 * Adds the email subscription field below the plugin row on the plugins page
 * 
 */
// NB: GDPR
/*add_filter( 'plugin_row_meta', 'wpgmza_plugin_row', 4, 10 );
function wpgmza_plugin_row( $plugin_meta, $plugin_file, $plugin_data, $status ) {

    if ( $plugin_file == "wp-google-maps/wpGoogleMaps.php") {
        $check = get_user_meta(get_current_user_id(),"wpgmza_subscribed");
		
        if (!$check) {
            $ret = '<div class="wpgmza_sub_div" style="margin-top:10px; color:#333; display:block; white-space:normal;">';
            $ret .= '<form>';
            $ret .= '<p><label for="wpgmza_signup_newsletter" style="font-style:italic; margin-bottom:5px;">' . __( 'Sign up to our newsletter and get information on the latest updates, beta versions and specials.', 'wp-google-maps' ) . '</label></p>';
            $ret .= '<span id="wpgmza_subscribe_div">';
            $ret .= '<input type="text" name="wpgmza_signup_newsletter" id="wpgmza_signup_newsletter" value="'.get_option( 'admin_email' ).'"></option>';
            $ret .= '<input type="button" class="button button-primary"  id="wpgmza_signup_newsletter_btn" name="wpgmza_signup_newsletter_btn" value="' . __( 'Sign up', 'wp-google-maps' ) . '" />';
            $ret .= '<input type="button" class="button button-secondary"  id="wpgmza_signup_newsletter_hide" name="wpgmza_signup_newsletter_hide" value="' . __( 'Hide', 'wp-google-maps' ) . '" />';
            $ret .= '<span>';
            $ret .= '</form>';
            $ret .= '</div>';
            array_push( $plugin_meta, $ret );
        }
    }
    return $plugin_meta;
}*/

/**
 * Check if the XML folder exists, if not, display a warning notification
 * @return void
 */
function wpgmaps_folder_check() {
    $xml_marker_location = wpgmza_return_marker_path();
    if (!file_exists($xml_marker_location) && (isset($_GET['activate']) && $_GET['activate'] == 'true')) {
        add_action('admin_notices', 'wpgmaps_folder_warning');
    }
}

/**
 * Notifies the user that the XML folder does not exist 
 * @return void
 */
function wpgmaps_folder_warning() {
    $file = get_option("wpgmza_xml_location");
    echo '
    <div class="error"><p>'.__('<strong>WP Google Maps cannot find the directory it uses to save marker data to. Please confirm that <em>', 'wp-google-maps').' '.$file.' '.__('</em>exists. Please also ensure that you assign file permissions of 755 (or 777) to this directory.','wp-google-maps').'</strong></p></div>
    ';

}


/**
 * DEPRECATED
 * 
 * Notifies the user that the cache directory does not have write permission
 * @return void
 */
function wpgmaps_cache_permission_warning() {
    echo "<div class='error below-h1'><big>";
    _e("Timthumb does not have 'write' permission for the cache directory. Please enable 'write' permissions (755 or 777) for ");
    echo "\"".dirname(__FILE__).DS."cache ";
    _e("in order for images to show up while using Timthumb. Please see ");
    echo "<a href='http://codex.wordpress.org/Changing_File_Permissions#Using_an_FTP_Client'>";
    _e("this page");
    echo "</a> ";
    _e("for help on how to do it. Alternatively, you can disable the use of Timthumb in Maps->Settings");
    echo "</big></div>";
}


/**
 * 
 * Checks if the system has write permission within the cache directory
 * @deprecated
 * @return bool true if yes, false if unacceptable permission
 */
function wpgmaps_check_permissions_cache() {
    $filename = dirname( __FILE__ ).DS.'cache'.DS.'wpgmaps.tmp';
    $testcontent = "Permission Check\n";
    $handle = @fopen($filename, 'w');
    if (@fwrite($handle, $testcontent) === FALSE) {
        @fclose($handle);
        add_option("wpgmza_permission","n");
        return false;
    }
    else {
        @fclose($handle);
        add_option("wpgmza_permission","y");
        return true;
    }


}


/**
 * Reloads the map when the Save Map button is pressed in the map editor
 * @return void
 */
function wpgmaps_reload_map_on_post() {
    /*
    if (isset($_POST['wpgmza_savemap'])){

        $res = wpgmza_get_map_data(sanitize_text_field($_GET['map_id']));
        $wpgmza_lat = $res->map_start_lat;
        $wpgmza_lng = $res->map_start_lng;
        $wpgmza_width = intval($res->map_width);
        $wpgmza_height = intval($res->map_height);
        $wpgmza_width_type = $res->map_width_type;
        $wpgmza_height_type = $res->map_height_type;
        $wpgmza_map_type = $res->type;
        if (!$wpgmza_map_type || $wpgmza_map_type == "" || $wpgmza_map_type == "1") { $wpgmza_map_type = "ROADMAP"; }
        else if ($wpgmza_map_type == "2") { $wpgmza_map_type = "SATELLITE"; }
        else if ($wpgmza_map_type == "3") { $wpgmza_map_type = "HYBRID"; }
        else if ($wpgmza_map_type == "4") { $wpgmza_map_type = "TERRAIN"; }
        else { $wpgmza_map_type = "ROADMAP"; }
        $start_zoom = $res->map_start_zoom;
        if ($start_zoom < 1 || !$start_zoom) { $start_zoom = 5; }
        if (!$wpgmza_lat || !$wpgmza_lng) { $wpgmza_lat = "51.5081290"; $wpgmza_lng = "-0.1280050"; }

        ?>
        <script type="text/javascript">
            jQuery(function() {
                jQuery("#wpgmza_map").css({
                    height:'<?php echo $wpgmza_height; ?><?php echo $wpgmza_height_type; ?>',
                    width:'<?php echo $wpgmza_width; ?><?php echo $wpgmza_width_type; ?>'

                });
                var myLatLng = new WPGMZA.LatLng(<?php echo $wpgmza_lat; ?>,<?php echo $wpgmza_lng; ?>);
                MYMAP.init('#wpgmza_map', myLatLng, <?php echo $start_zoom; ?>);
                UniqueCode=Math.round(Math.random()*10010);
                MYMAP.placeMarkers('<?php echo wpgmaps_get_marker_url(sanitize_text_field($_GET['map_id'])); ?>?u='+UniqueCode,<?php echo sanitize_text_field($_GET['map_id']); ?>);

            });
        </script>
    <?php
    }
*/

}

/**
 * Returns the XML directory based on which version is being used and whether or not a network installation is being used
 * @param  boolean  $mapid  Map ID
 * @return string           Marker XML URL
 */
function wpgmaps_get_marker_url($mapid = false) {
    if (!$mapid) {
        $mapid = sanitize_text_field($_POST['map_id']);
    }
    if (!$mapid) {
        $mapid = sanitize_text_field($_GET['map_id']);
    }
    if (!$mapid) {
        global $wpgmza_current_map_id;
        $mapid = $wpgmza_current_map_id;
    }
    $mapid = intval($mapid);

    global $wpgmza_version;
    if (floatval($wpgmza_version) < 6 || $wpgmza_version == "6.0.4" || $wpgmza_version == "6.0.3" || $wpgmza_version == "6.0.2" || $wpgmza_version == "6.0.1" || $wpgmza_version == "6.0.0") {
        if (is_multisite()) { 
            global $blog_id;
            $wurl = wpgmaps_get_plugin_url()."".$blog_id."-".$mapid."markers.xml";
        }
        else {
            $wurl = wpgmaps_get_plugin_url()."".$mapid."markers.xml";
        }
    } else {
        /* later versions store marker files in wp-content/uploads/wp-google-maps director */
        
        if (get_option("wpgmza_xml_url") == "") {
            $upload_dir = wp_upload_dir();
            add_option("wpgmza_xml_url",'{uploads_url}/wp-google-maps/');
        }
        $xml_marker_url = wpgmza_return_marker_url();
        
        if (is_multisite()) { 
            global $blog_id;

            $wurl = $xml_marker_url.$blog_id."-".$mapid."markers.xml";;
            $wurl = preg_replace('#^https?:#', '', $wurl);
        }
        else {
            $wurl = $xml_marker_url.$mapid."markers.xml";
            $wurl = preg_replace('#^https?:#', '', $wurl);
            


        }
    }
    
    return $wurl;


}

/**
 * Outputs the JavaScript for the edit marker location page
 * @return void
 */
function wpgmaps_admin_edit_marker_javascript() {
	global $wpgmza;

    $res = wpgmza_get_marker_data(sanitize_text_field($_GET['id']));
    $wpgmza_lat = $res->lat;
    $wpgmza_lng = $res->lng;
    $wpgmza_map_type = "ROADMAP";

	$api_version_string = 'v=quarterly';

    $wpgmza_locale = get_locale();
    $wpgmza_suffix = ".com";
    /* Hebrew correction */
    if ($wpgmza_locale == "he_IL") { $wpgmza_locale = "iw"; }

    /* Chinese integration */
    if ($wpgmza_locale == "zh_CN") { $wpgmza_suffix = ".cn"; } else { $wpgmza_suffix = ".com"; } 

    $wpgmza_locale = substr( $wpgmza_locale, 0, 2 );
	
	$scriptLoader = new WPGMZA\ScriptLoader($wpgmza->isProVersion());
	$scriptLoader->enqueueStyles();
	$scriptLoader->enqueueScripts();

    ?>
    <link rel='stylesheet' id='wpgooglemaps-css'  href='<?php echo wpgmaps_get_plugin_url(); ?>/css/wpgmza_style.css' type='text/css' media='all' />
    <link rel="stylesheet" type="text/css" media="all" href="<?php echo wpgmaps_get_plugin_url(); ?>css/data_table.css" />
    <script type="text/javascript" src="<?php echo wpgmaps_get_plugin_url(); ?>js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" >
        jQuery(function($) {
            function wpgmza_InitMap() {
                var myLatLng = new WPGMZA.LatLng(<?php echo $wpgmza_lat; ?>,<?php echo $wpgmza_lng; ?>);
                MYMAP.init('#wpgmza_map', myLatLng, 15);
            }
            jQuery("#wpgmza_map").css({
                height:400,
                width:400
            });
            wpgmza_InitMap();
        });

        var MYMAP = {
            map: null,
            bounds: null
        }
        MYMAP.init = function(selector, latLng, zoom) {
			
			console.log(latLng);
			
            var myOptions = {
                zoom:zoom,
                center: latLng,
                zoomControl: true,
                panControl: true,
                mapTypeControl: true,
                draggable: true,
                disableDoubleClickZoom: false,
                scrollwheel: true,
                streetViewControl: false
            }
			
			if(window.google)
				myOptions.mapTypeId = google.maps.MapTypeId.<?php echo $wpgmza_map_type; ?>
			
			var element = jQuery(selector)[0];
			
			element.setAttribute("data-map-id", <?php echo (int)$res->map_id; ?>);
			
            this.map = WPGMZA.Map.createInstance(element, myOptions);
			
			// this.map.setCenter(latLng);
			
            this.bounds = new WPGMZA.LatLngBounds();

            updateMarkerPosition(latLng);

			console.log("Creating marker on line <?php echo __LINE__ ?>");
            var marker = WPGMZA.Marker.createInstance({
                position: latLng,
                map: this.map,
                draggable: true
            });
            /*google.maps.event.addListener(marker, 'drag', function() {
                updateMarkerPosition(marker.getPosition());
            });*/
			
			marker.on("dragend", function() {
				updateMarkerPosition(marker.getPosition());
			});
        }
        function updateMarkerPosition(latLng) {
            jQuery("#wpgmaps_marker_lat").val(latLng.lat);
            jQuery("#wpgmaps_marker_lng").val(latLng.lng);
        }


    </script>
<?php


}


/**
 * Outputs the JavaScript for the map editor
 * @return void
 */
function wpgmaps_admin_javascript_basic() {
    if (is_admin()) {
		global $wpgmza;
        global $wpdb;
        global $wpgmza_version;
        global $wpgmza_tblname_maps;
        $ajax_nonce = wp_create_nonce("wpgmza");
		
        if( isset( $_POST['wpgmza_save_google_api_key_list'] ) ){  
            if( $_POST['wpgmza_google_maps_api_key'] !== '' ){      
                update_option('wpgmza_google_maps_api_key', sanitize_text_field(trim($_POST['wpgmza_google_maps_api_key'])));
                echo "<div class='updated'><p>";
                $settings_page = "<a href='".admin_url('/admin.php?page=wp-google-maps-menu-settings#tabs-4')."'>".__('settings', 'wp-google-maps')."</a>";
                echo sprintf( __('Your Google Maps API key has been successfully saved. This API key can be changed in the %s page', 'wp-google-maps'), $settings_page );
                echo "</p></div>";
            }          
        }

        if (is_admin() && isset( $_GET['page'] ) && $_GET['page'] == 'wp-google-maps-menu' && isset( $_GET['action'] ) && $_GET['action'] == "edit_marker") {
            wpgmaps_admin_edit_marker_javascript();
        }
        else if (is_admin() && isset($_GET['action']) && isset($_GET['page']) && $_GET['page'] == 'wp-google-maps-menu' && $_GET['action'] == "add_poly") { wpgmaps_b_admin_add_poly_javascript(sanitize_text_field($_GET['map_id'])); }
        else if (is_admin() && isset($_GET['action']) && isset($_GET['page']) && $_GET['page'] == 'wp-google-maps-menu' && $_GET['action'] == "edit_poly") { wpgmaps_b_admin_edit_poly_javascript(sanitize_text_field($_GET['map_id']),sanitize_text_field($_GET['poly_id'])); }
        else if (is_admin() && isset($_GET['action']) && isset($_GET['page']) && $_GET['page'] == 'wp-google-maps-menu' && $_GET['action'] == "add_polyline") { wpgmaps_b_admin_add_polyline_javascript(sanitize_text_field($_GET['map_id'])); }
        else if (is_admin() && isset($_GET['action']) && isset($_GET['page']) && $_GET['page'] == 'wp-google-maps-menu' && $_GET['action'] == "edit_polyline") { wpgmaps_b_admin_edit_polyline_javascript(sanitize_text_field($_GET['map_id']),sanitize_text_field($_GET['poly_id'])); }

        else if (is_admin() && isset( $_GET['page'] ) && $_GET['page'] == 'wp-google-maps-menu' && isset( $_GET['action'] ) && $_GET['action'] == "edit") {

            if (!$_GET['map_id']) { return; }
            $wpgmza_check = wpgmaps_update_xml_file(sanitize_text_field($_GET['map_id']));
            if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
            
            $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");

            /* LOAD GOOGLE MAPS */
            $wpgmza_locale = get_locale();
            $wpgmza_suffix = ".com";
            /* Hebrew correction */
            if ($wpgmza_locale == "he_IL") { $wpgmza_locale = "iw"; }
            /* Chinese integration */
            if ($wpgmza_locale == "zh_CN") { $wpgmza_suffix = ".cn"; } else { $wpgmza_suffix = ".com"; } 

            $wpgmza_locale = substr( $wpgmza_locale, 0, 2 );
            /**
             * Only register the below scrips so that they are available on demand. 
             */
            if(isset($wpgmza_settings['wpgmza_settings_remove_api']) && $wpgmza_settings['wpgmza_settings_remove_api'] == "yes")
                $wpgaps_core_dependancy = array();
			else
			{
				if($wpgmza->settings->engine == 'google-maps')
					$wpgaps_core_dependancy = array( 'wpgmza_api_call' );
				else
					$wpgaps_core_dependancy = array( 'wpgmza_ol_api_call' );
			}
			
            wp_enqueue_style( 'wpgmaps_admin_style', plugins_url('css/wpgmza_style.css', __FILE__),array(),$wpgmza_version.'b');
            wp_enqueue_style( 'wpgmaps_admin_datatables_style', plugins_url('css/data_table.css', __FILE__),array(),$wpgmza_version.'b');
            wp_enqueue_script('wpgmaps_admin_datatables', plugins_url('/js/jquery.dataTables.min.js',__FILE__), $wpgaps_core_dependancy, $wpgmza_version.'b' , false);



            $wpgmza_current_map_id = (int)$_GET['map_id'];

			global $wpgmza;
			$wpgmza->loadScripts();
			
            wp_enqueue_script('wpgmaps_admin_core', plugins_url('/js/wpgmaps-admin-core.js',__FILE__), $wpgaps_core_dependancy, $wpgmza_version.'b' , false);
            do_action("wpgooglemaps_hook_user_js_after_core");
			
			wp_localize_script('wpgmaps_admin_core', 'wpgmza_circle_data_array', wpgmza_get_circle_data(1));
			wp_localize_script('wpgmaps_admin_core', 'wpgmza_rectangle_data_array', wpgmza_get_rectangle_data(1));
			

            $res = array();
            $res[$wpgmza_current_map_id] = wpgmza_get_map_data($wpgmza_current_map_id);
            
			$api_version_string = 'v=quarterly';
            
            $map_other_settings = maybe_unserialize($res[$wpgmza_current_map_id]->other_settings);
            $res[$wpgmza_current_map_id]->other_settings = $map_other_settings;
            $res[$wpgmza_current_map_id]->map_width_type = stripslashes($res[$wpgmza_current_map_id]->map_width_type);


            if ( isset( $res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data'] ) && $res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data'] != '') {
                $res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data'] = html_entity_decode(stripslashes($res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data']));
            }   


            $polygonoptions = array();
            $total_poly_array = wpgmza_b_return_polygon_id_array($wpgmza_current_map_id);
            if ($total_poly_array > 0) {
                foreach ($total_poly_array as $poly_id) {
                    $polygonoptions[$poly_id] = wpgmza_b_return_poly_options($poly_id);

                    $tmp_poly_array = wpgmza_b_return_polygon_array($poly_id);
                    $poly_data_raw_array = array();
                    foreach ($tmp_poly_array as $single_poly) {
                        $poly_data_raw = str_replace(" ","",$single_poly);
                        $poly_data_raw = explode(",",$poly_data_raw);
                        if (isset($poly_data_raw[0]) && isset($poly_data_raw[1])) {
                            $lat = $poly_data_raw[0];
                            $lng = $poly_data_raw[1];
                            $poly_data_raw_array[] = $poly_data_raw;
                        }
                    }
                    $polygonoptions[$poly_id]->polydata = $poly_data_raw_array;

                    $linecolor = $polygonoptions[$poly_id]->linecolor;
                    $fillcolor = $polygonoptions[$poly_id]->fillcolor;
                    $fillopacity = $polygonoptions[$poly_id]->opacity;
                    if (!$linecolor) { $polygonoptions[$poly_id]->linecolor = "000000"; }
                    if (!$fillcolor) { $polygonoptions[$poly_id]->fillcolor = "66FF00"; }
                    if (!$fillopacity) { $polygonoptions[$poly_id]->opacity = "0.5"; }
                }
            }  else { $polygonoptions = array(); } 


            $polylineoptions = array();

            $total_poly_array = wpgmza_b_return_polyline_id_array($wpgmza_current_map_id);
            if ($total_poly_array > 0) {
                foreach ($total_poly_array as $poly_id) {
                    $polylineoptions[$poly_id] = wpgmza_b_return_polyline_options($poly_id);

                    $tmp_poly_array = wpgmza_b_return_polyline_array($poly_id);
                    $poly_data_raw_array = array();
                    foreach ($tmp_poly_array as $single_poly) {
                        $poly_data_raw = str_replace(" ","",$single_poly);
                        $poly_data_raw = str_replace(")","",$poly_data_raw );
                        $poly_data_raw = str_replace("(","",$poly_data_raw );
                        $poly_data_raw = explode(",",$poly_data_raw);
                        if (isset($poly_data_raw[0]) && isset($poly_data_raw[1])) {
                            $lat = $poly_data_raw[0];
                            $lng = $poly_data_raw[1];
                            $poly_data_raw_array[] = $poly_data_raw;
                        }
                    }
                    $polylineoptions[$poly_id]->polydata = $poly_data_raw_array;


                    if (isset($polylineoptions[$poly_id]->linecolor)) { $linecolor = $polylineoptions[$poly_id]->linecolor; } else { $linecolor = false; }
                    if (isset($polylineoptions[$poly_id]->fillcolor)) { $fillcolor = $polylineoptions[$poly_id]->fillcolor; } else { $fillcolor = false; }
                    if (isset($polylineoptions[$poly_id]->opacity)) { $fillopacity = $polylineoptions[$poly_id]->opacity; } else { $fillopacity = false; }
                    if (!$linecolor) { $polylineoptions[$poly_id]->linecolor = "000000"; }
                    if (!$fillcolor) { $polylineoptions[$poly_id]->fillcolor = "66FF00"; }
                    if (!$fillopacity) { $polylineoptions[$poly_id]->opacity = "0.5"; }
                }
            } else { $polylineoptions = array(); } 

            if (isset($wpgmza_settings['wpgmza_settings_marker_pull']) && $wpgmza_settings['wpgmza_settings_marker_pull'] == "0") {
                $markers = wpgmaps_return_markers($wpgmza_current_map_id);
            }
            
            do_action("wpgooglemaps_basic_hook_user_js_after_core");

            wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_mapid', (string)$wpgmza_current_map_id);
            wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_localize', $res);
            wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_localize_polygon_settings', $polygonoptions);
            wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_localize_polyline_settings', $polylineoptions);

            wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_markerurl', wpgmaps_get_marker_url($wpgmza_current_map_id));

            if ($wpgmza_settings['wpgmza_settings_marker_pull'] == "0") {
                wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_localize_marker_data', $markers);
            }
            
            $wpgmza_settings = apply_filters("wpgmza_basic_filter_localize_settings",$wpgmza_settings);

            wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_localize_global_settings', $wpgmza_settings);

            wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_lang_km_away', __("km away","wp-google-maps"));
            wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_lang_m_away', __("miles away","wp-google-maps"));
            wp_localize_script( 'wpgmaps_admin_core', 'wpgmaps_nonce', $ajax_nonce);
            do_action("wpgooglemaps_hook_user_js_after_localize",$res);

            return true;

        }
        return true;










        /************************************** */

  ?>
        <script type="text/javascript" >
            var marker_pull = '<?php echo $marker_pull; ?>';
            var placeSearch, autocomplete;
            var wpgmza_table_length;
            var wpgmzaTable;


            <?php if (isset($markers) && strlen($markers) > 0 && $markers != "[]"){ ?>var db_marker_array = JSON.stringify(<?php echo $markers; ?>);<?php } else { echo "var db_marker_array = '';"; } ?>
                   


        if ('undefined' == typeof window.jQuery) {
            alert("jQuery is not installed. WP Google Maps requires jQuery in order to function properly. Please ensure you have jQuery installed.")
        } else {
            // all good.. continue...
        }




        var marker_added = false;
        var MYMAP = {
            map: null,
            bounds: null
        }
        MYMAP.init = function(selector, latLng, zoom) {
            var myOptions = {
                minZoom: <?php echo $wpgmza_max_zoom; ?>,
                maxZoom: 21,
                zoom:zoom,
                center: latLng,
                zoomControl: <?php if (isset($wpgmza_settings['wpgmza_settings_map_zoom']) && $wpgmza_settings['wpgmza_settings_map_zoom'] == "yes") { echo "false"; } else { echo "true"; } ?>,
                panControl: <?php if (isset($wpgmza_settings['wpgmza_settings_map_pan']) && $wpgmza_settings['wpgmza_settings_map_pan'] == "yes") { echo "false"; } else { echo "true"; } ?>,
                mapTypeControl: <?php if (isset($wpgmza_settings['wpgmza_settings_map_type']) && $wpgmza_settings['wpgmza_settings_map_type'] == "yes") { echo "false"; } else { echo "true"; } ?>,
                streetViewControl: <?php if (isset($wpgmza_settings['wpgmza_settings_map_streetview']) && $wpgmza_settings['wpgmza_settings_map_streetview'] == "yes") { echo "false"; } else { echo "true"; } ?>,
                fullscreenControl: <?php if (isset($wpgmza_settings['wpgmza_settings_map_full_screen_control']) && $wpgmza_settings['wpgmza_settings_map_full_screen_control'] == "yes") { echo "false"; } else { echo "true"; } ?>,
                draggable: <?php if (isset($wpgmza_settings['wpgmza_settings_map_draggable']) && $wpgmza_settings['wpgmza_settings_map_draggable'] == "yes") { echo "false"; } else { echo "true"; } ?>,
                disableDoubleClickZoom: <?php if (isset($wpgmza_settings['wpgmza_settings_map_clickzoom']) && $wpgmza_settings['wpgmza_settings_map_clickzoom'] == "yes") { echo "true"; } else { echo "false"; } ?>,
                scrollwheel: <?php if (isset($wpgmza_settings['wpgmza_settings_map_scroll']) && $wpgmza_settings['wpgmza_settings_map_scroll'] == "yes") { echo "false"; } else { echo "true"; } ?>,
                mapTypeId: google.maps.MapTypeId.<?php echo $wpgmza_map_type; ?>
            }
            this.map = new google.maps.Map(jQuery(selector)[0], myOptions);
            this.bounds = new WPGMZA.LatLngBounds();


            <?php if ($wpgmza_theme_data !== false && isset($wpgmza_theme_data) && $wpgmza_theme_data != '') { ?>
            this.map.setOptions({styles: <?php echo stripslashes($wpgmza_theme_data); ?>});
            <?php } ?>

            google.maps.event.addListener(MYMAP.map, 'rightclick', function(event) {
                if (marker_added === false) {
					console.log("Creating marker on line <?php echo __LINE__ ?>");
                    var marker = WPGMZA.Marker.createInstance({
                        position: event.latLng, 
                        map: MYMAP.map
                    });
                    marker.setDraggable(true);
                    google.maps.event.addListener(marker, 'dragend', function(event) { 
                        jQuery("#wpgmza_add_address").val(event.latLng.lat()+', '+event.latLng.lng());
                    } );
                    jQuery("#wpgmza_add_address").val(event.latLng.lat()+', '+event.latLng.lng());
                    jQuery("#wpgm_notice_message_save_marker").show();
                    marker_added = true;
                    setTimeout(function() {
                        jQuery("#wpgm_notice_message_save_marker").fadeOut('slow')
                    }, 3000);
                } else {
                    jQuery("#wpgm_notice_message_addfirst_marker").fadeIn('fast')
                    setTimeout(function() {
                        jQuery("#wpgm_notice_message_addfirst_marker").fadeOut('slow')
                    }, 3000);
                }
               
            });
            
            /**
             * Deprecated in 6.4.05
             * This was deprecated in wpgmaps-admin-core.js however caused a bug instead

            google.maps.event.addListener(MYMAP.map, 'zoom_changed', function() {
                zoomLevel = MYMAP.map.getZoom();

                jQuery("#wpgmza_start_zoom").val(zoomLevel);
                if (zoomLevel == 0) {
                    MYMAP.map.setZoom(10);
                }
            });
            
            */            
            
<?php
                $total_poly_array = wpgmza_b_return_polygon_id_array(sanitize_text_field($_GET['map_id']));
                if ($total_poly_array > 0) {
                foreach ($total_poly_array as $poly_id) {
                    $polyoptions = wpgmza_b_return_poly_options($poly_id);
                    $linecolor = $polyoptions->linecolor;
                    $fillcolor = $polyoptions->fillcolor;
                    $fillopacity = $polyoptions->opacity;
                    $lineopacity = $polyoptions->lineopacity;
                    $title = $polyoptions->title;
                    $link = $polyoptions->link;
                    $ohlinecolor = $polyoptions->ohlinecolor;
                    $ohfillcolor = $polyoptions->ohfillcolor;
                    $ohopacity = $polyoptions->ohopacity;
                    if (!$linecolor) { $linecolor = "000000"; }
                    if (!$fillcolor) { $fillcolor = "66FF00"; }
                    if ($fillopacity == "") { $fillopacity = "0.5"; }
                    if ($lineopacity == "") { $lineopacity = "1.0"; }
                    if ($ohlinecolor == "") { $ohlinecolor = $linecolor; }
                    if ($ohfillcolor == "") { $ohfillcolor = $fillcolor; }
                    if ($ohopacity == "") { $ohopacity = $fillopacity; }
                    $linecolor = "#".$linecolor;
                    $fillcolor = "#".$fillcolor;
                    $ohlinecolor = "#".$ohlinecolor;
                    $ohfillcolor = "#".$ohfillcolor;
                    
                    $poly_array = wpgmza_b_return_polygon_array($poly_id);
                    
                        
            ?> 

            <?php if (sizeof($poly_array) > 1) { ?>

            var WPGM_PathData_<?php echo $poly_id; ?> = [
                <?php
                        foreach ($poly_array as $single_poly) {
                            $poly_data_raw = str_replace(" ","",$single_poly);
                            $poly_data_raw = explode(",",$poly_data_raw);
                            $lat = $poly_data_raw[0];
                            $lng = $poly_data_raw[1];
                            ?>
                            new WPGMZA.LatLng(<?php echo $lat; ?>, <?php echo $lng; ?>),            
                            <?php
                        }
                ?>
                
               
            ];
			console.log("Creating polygon on line <?php echo __LINE__; ?>");
            var WPGM_Path_<?php echo $poly_id; ?> = new google.maps.Polygon({
              path: WPGM_PathData_<?php echo $poly_id; ?>,
              strokeColor: "<?php echo $linecolor; ?>",
              fillOpacity: "<?php echo $fillopacity; ?>",
              strokeOpacity: "<?php echo $lineopacity; ?>",
              fillColor: "<?php echo $fillcolor; ?>",
              strokeWeight: 2
            });

            WPGM_Path_<?php echo $poly_id; ?>.setMap(this.map);
            <?php } } ?>

            <?php } ?>


           
<?php
                /* polylines */
                    $total_polyline_array = wpgmza_b_return_polyline_id_array(sanitize_text_field($_GET['map_id']));
                    if ($total_polyline_array > 0) {
                    foreach ($total_polyline_array as $poly_id) {
                        $polyoptions = wpgmza_b_return_polyline_options($poly_id);
                        $linecolor = $polyoptions->linecolor;
                        $fillopacity = $polyoptions->opacity;
                        $linethickness = $polyoptions->linethickness;
                        if (!$linecolor) { $linecolor = "000000"; }
                        if (!$linethickness) { $linethickness = "4"; }
                        if (!$fillopacity) { $fillopacity = "0.5"; }
                        $linecolor = "#".$linecolor;
                        $poly_array = wpgmza_b_return_polyline_array($poly_id);
                        ?>
                    
                <?php if (sizeof($poly_array) > 1) { ?>
                    var WPGM_PathLineData_<?php echo $poly_id; ?> = [
                    <?php
                    $poly_array = wpgmza_b_return_polyline_array($poly_id);

                    foreach ($poly_array as $single_poly) {
                        $poly_data_raw = str_replace(" ","",$single_poly);
                        $poly_data_raw = explode(",",$poly_data_raw);
                        $lat = $poly_data_raw[0];
                        $lng = $poly_data_raw[1];
                        ?>
                        new WPGMZA.LatLng(<?php echo $lat; ?>, <?php echo $lng; ?>),            
                        <?php
                    }
                    ?>
                ];
				
                var WPGM_PathLine_<?php echo $poly_id; ?> = new google.maps.Polyline({
                  path: WPGM_PathLineData_<?php echo $poly_id; ?>,
                  strokeColor: "<?php echo $linecolor; ?>",
                  strokeOpacity: "<?php echo $fillopacity; ?>",
                  strokeWeight: "<?php echo $linethickness; ?>"
                  
                });

                WPGM_PathLine_<?php echo $poly_id; ?>.setMap(this.map);
                    <?php } } } ?>    
            
            
            
            
            
            google.maps.event.addListener(MYMAP.map, 'center_changed', function() {
                var location = MYMAP.map.getCenter();
                jQuery("#wpgmza_start_location").val(location.lat()+","+location.lng());
                jQuery("#wpgmaps_save_reminder").show();
            });

            <?php if ($wpgmza_bicycle == "1") { ?>
            var bikeLayer = new google.maps.BicyclingLayer();
            bikeLayer.setMap(MYMAP.map);
            <?php } ?>
            <?php if ($wpgmza_traffic == "1") { ?>
            var trafficLayer = new google.maps.TrafficLayer();
            trafficLayer.setMap(MYMAP.map);
            <?php } ?>
           
            <?php if ($transport_layer == 1) { ?>
            var transitLayer = new google.maps.TransitLayer();
            transitLayer.setMap(MYMAP.map);
            <?php } ?>



            google.maps.event.addListener(MYMAP.map, 'click', function() {
                infoWindow.close();
            });


        }

        var infoWindow = new google.maps.InfoWindow();
        <?php
            $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
            $wpgmza_settings_infowindow_width = "250";
            if (isset($wpgmza_settings['wpgmza_settings_infowindow_width'])) { $wpgmza_settings_infowindow_width = $wpgmza_settings['wpgmza_settings_infowindow_width']; }
            if (!isset($wpgmza_settings_infowindow_width) || !$wpgmza_settings_infowindow_width) { $wpgmza_settings_infowindow_width = "250"; }
        ?>
        infoWindow.setOptions({maxWidth:<?php echo $wpgmza_settings_infowindow_width; ?>});


        

        MYMAP.placeMarkers = function(filename,map_id) {
            marker_array = [];
            
            if (marker_pull === '1') {
            
            
                jQuery.get(filename, function(xml){
                    jQuery(xml).find("marker").each(function(){
                        var wpmgza_map_id = jQuery(this).find('map_id').text();
                        if (wpmgza_map_id == map_id) {
                            var wpmgza_address = jQuery(this).find('address').text();
                            var wpmgza_anim = jQuery(this).find('anim').text();
                            var wpmgza_infoopen = jQuery(this).find('infoopen').text();
                            var lat = jQuery(this).find('lat').text();
                            var lng = jQuery(this).find('lng').text();
                            var point = new WPGMZA.LatLng(parseFloat(lat),parseFloat(lng));
                            MYMAP.bounds.extend(point);

                            if (wpmgza_anim === "1") {
								console.log("Creating marker on line <?php echo __LINE__ ?>");
                                var marker = WPGMZA.Marker.createInstance({
                                        position: point,
                                        map: MYMAP.map,
                                        animation: google.maps.Animation.BOUNCE
                                });
                            }
                            else if (wpmgza_anim === "2") {
								console.log("Creating marker on line <?php echo __LINE__ ?>");
                                var marker = WPGMZA.Marker.createInstance({
                                        position: point,
                                        map: MYMAP.map,
                                        animation: google.maps.Animation.DROP
                                });
                            }
                            else {
								console.log("Creating marker on line <?php echo __LINE__ ?>");
                                var marker = WPGMZA.Marker.createInstance({
                                        position: point,
                                        map: MYMAP.map
                                });
                            }


                            var html='<p class="wpgmza_infowinfow_address" style="margin-top:0; padding-top:0; margin-bottom:2px; padding-bottom:2px; font-weight:bold;">'+wpmgza_address+'</p>';

                            if (wpmgza_infoopen === "1") {
                                
                                infoWindow.setContent(html);
                                infoWindow.open(MYMAP.map, marker);
                            }

                            <?php if ($wpgmza_open_infowindow_by == '2') { ?>
                            google.maps.event.addListener(marker, 'mouseover', function() {
                                infoWindow.close();
                                infoWindow.setContent(html);
                                infoWindow.open(MYMAP.map, marker);

                            });
                            <?php } else { ?>
                            google.maps.event.addListener(marker, 'click', function() {
                                infoWindow.close();
                                infoWindow.setContent(html);
                                infoWindow.open(MYMAP.map, marker);

                            });
                            <?php } ?>

                        }

                    });
                });
            } else {
                if (db_marker_array.length > 0) {
                var dec_marker_array = JSON.parse(db_marker_array);
                jQuery.each(dec_marker_array, function(i, val) {
                
                
                    var wpmgza_address = val.address;
                    var wpmgza_anim = val.anim;
                    var wpmgza_infoopen = val.infoopen;
                    var lat = val.lat;
                    var lng = val.lng;
                    var point = new WPGMZA.LatLng(parseFloat(lat),parseFloat(lng));
                    MYMAP.bounds.extend(point);

                    if (wpmgza_anim === "1") {
						console.log("Creating marker on line <?php echo __LINE__ ?>");
                        var marker = WPGMZA.Marker.createInstance({
                                position: point,
                                map: MYMAP.map,
                                animation: google.maps.Animation.BOUNCE
                        });
                    }
                    else if (wpmgza_anim === "2") {
						console.log("Creating marker on line <?php echo __LINE__ ?>");
                        var marker = WPGMZA.Marker.createInstance({
                                position: point,
                                map: MYMAP.map,
                                animation: google.maps.Animation.DROP
                        });
                    }
                    else {
						console.log("Creating marker on line <?php echo __LINE__ ?>");
                        var marker = WPGMZA.Marker.createInstance({
                                position: point,
                                map: MYMAP.map
                        });
                    }


                    var html='<p class="wpgmza_infowinfow_address" style="margin-top:0; padding-top:0; margin-bottom:2px; padding-bottom:2px; font-weight:bold;">'+wpmgza_address+'</p>';

                    if (wpmgza_infoopen === "1") {
                        
                        infoWindow.setContent(html);
                        infoWindow.open(MYMAP.map, marker);
                    }

                    <?php if ($wpgmza_open_infowindow_by == '2') { ?>
                    google.maps.event.addListener(marker, 'mouseover', function() {
                        infoWindow.close();
                        infoWindow.setContent(html);
                        infoWindow.open(MYMAP.map, marker);

                    });
                    <?php } else { ?>
                    google.maps.event.addListener(marker, 'click', function() {
                        infoWindow.close();
                        infoWindow.setContent(html);
                        infoWindow.open(MYMAP.map, marker);

                    });
                    <?php } ?>
                
                
                
                
                
                
              });
            
            }
            }
        }






        </script>
    <?php
    }

}


/**
 * Outputs the JavaScript for the front end
 * @deprecated 6.3.10 Moved into the wpgmaps_tag_basic function
 * @return void
 */
function wpgmaps_user_javascript_basic() {

    global $short_code_active;
    global $wpgmza_current_map_id;
    global $wpgmza_version;

    $ajax_nonce = wp_create_nonce("wpgmza");

    $res = array();
    $res[$wpgmza_current_map_id] = wpgmza_get_map_data($wpgmza_current_map_id);
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    
	$api_version_string = 'quarterly';
    
    $map_other_settings = maybe_unserialize($res[$wpgmza_current_map_id]->other_settings);
    $res[$wpgmza_current_map_id]->other_settings = $map_other_settings;
    $res[$wpgmza_current_map_id]->map_width_type = stripslashes($res[$wpgmza_current_map_id]->map_width_type);


    if ($res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data'] != '') {
        $res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data'] = html_entity_decode(stripslashes($res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data']));
    }   
    /*
     * deprecated in 6.2.0
     
    if (isset($map_other_settings['weather_layer'])) { $weather_layer = $map_other_settings['weather_layer']; }  else { $weather_layer = false; }
    if (isset($map_other_settings['weather_layer_temp_type'])) { $weather_layer_temp_type = $map_other_settings['weather_layer_temp_type']; } else { $weather_layer_temp_type = false; }
    if (isset($map_other_settings['cloud_layer'])) { $cloud_layer = $map_other_settings['cloud_layer']; } else { $cloud_layer = false; }
    */
   

   /*
    if (isset($map_other_settings['transport_layer'])) { $transport_layer = $map_other_settings['transport_layer']; } else { $transport_layer = false; }
    if (isset($map_other_settings['store_locator_bounce'])) { $store_locator_bounce = $map_other_settings['store_locator_bounce']; } else { $store_locator_bounce = 1; }
    
    $wpgmza_lat = $res->map_start_lat;
    $wpgmza_lng = $res->map_start_lng;
    $wpgmza_width = $res->map_width;
    $wpgmza_height = $res->map_height;
    $wpgmza_width_type = $res->map_width_type;
    $wpgmza_height_type = $res->map_height_type;
    $wpgmza_map_type = $res->type;
    $wpgmza_traffic = $res->traffic;
    $wpgmza_bicycle = $res->bicycle;

    if (isset($map_other_settings['map_max_zoom'])) { $wpgmza_max_zoom = intval($map_other_settings['map_max_zoom']); } else { $wpgmza_max_zoom = 2; }
    if (isset($map_other_settings['wpgmza_theme_data'])) { $wpgmza_theme_data = $map_other_settings['wpgmza_theme_data']; } else { $wpgmza_theme_data = false; }

    
    if (isset($wpgmza_settings['wpgmza_settings_map_open_marker_by'])) { $wpgmza_open_infowindow_by = $wpgmza_settings['wpgmza_settings_map_open_marker_by']; } else { $wpgmza_open_infowindow_by = '1'; }
    if ($wpgmza_open_infowindow_by == null || !isset($wpgmza_open_infowindow_by)) { $wpgmza_open_infowindow_by = '1'; }

    if (!$wpgmza_map_type || $wpgmza_map_type == "" || $wpgmza_map_type == "1") { $wpgmza_map_type = "ROADMAP"; }
    else if ($wpgmza_map_type == "2") { $wpgmza_map_type = "SATELLITE"; }
    else if ($wpgmza_map_type == "3") { $wpgmza_map_type = "HYBRID"; }
    else if ($wpgmza_map_type == "4") { $wpgmza_map_type = "TERRAIN"; }
    else { $wpgmza_map_type = "ROADMAP"; }
    

    $start_zoom = $res->map_start_zoom;
    if ($start_zoom < 1 || !$start_zoom) { $start_zoom = 5; }
    if (!$wpgmza_lat || !$wpgmza_lng) { $wpgmza_lat = "51.5081290"; $wpgmza_lng = "-0.1280050"; }
    
    
    if (isset($wpgmza_settings['wpgmza_settings_marker_pull'])) { $marker_pull = $wpgmza_settings['wpgmza_settings_marker_pull']; } else { $marker_pull = "1"; }
    $restrict_search = false;
    if (isset($map_other_settings['wpgmza_store_locator_restrict'])) { $restrict_search = $map_other_settings['wpgmza_store_locator_restrict']; } else { $restrict_search = false; }
    */  
       
    $polygonoptions = array();
    $total_poly_array = wpgmza_b_return_polygon_id_array($wpgmza_current_map_id);

    if ($total_poly_array > 0) {
        foreach ($total_poly_array as $poly_id) {
            $polygonoptions[$poly_id] = wpgmza_b_return_poly_options($poly_id);

            $tmp_poly_array = wpgmza_b_return_polygon_array($poly_id);
            $poly_data_raw_array = array();
            foreach ($tmp_poly_array as $single_poly) {
                $poly_data_raw = str_replace(" ","",$single_poly);
                $poly_data_raw = explode(",",$poly_data_raw);
                $lat = $poly_data_raw[0];
                $lng = $poly_data_raw[1];
                $poly_data_raw_array[] = $poly_data_raw;
            }
            $polygonoptions[$poly_id]->polydata = $poly_data_raw_array;

            $linecolor = $polygonoptions[$poly_id]->linecolor;
            $fillcolor = $polygonoptions[$poly_id]->fillcolor;
            $fillopacity = $polygonoptions[$poly_id]->opacity;
            if (!$linecolor) { $polygonoptions[$poly_id]->linecolor = "000000"; }
            if (!$fillcolor) { $polygonoptions[$poly_id]->fillcolor = "66FF00"; }
            if (!$fillopacity) { $polygonoptions[$poly_id]->opacity = "0.5"; }
        }
    }  else { $polygonoptions = array(); } 


    $polylineoptions = array();

    $total_poly_array = wpgmza_b_return_polyline_id_array($wpgmza_current_map_id);
    if ($total_poly_array > 0) {
        foreach ($total_poly_array as $poly_id) {
            $polylineoptions[$poly_id] = wpgmza_b_return_polyline_options($poly_id);

            $tmp_poly_array = wpgmza_b_return_polyline_array($poly_id);
            $poly_data_raw_array = array();
            foreach ($tmp_poly_array as $single_poly) {
                $poly_data_raw = str_replace(" ","",$single_poly);
                $poly_data_raw = str_replace(")","",$poly_data_raw );
                $poly_data_raw = str_replace("(","",$poly_data_raw );
                $poly_data_raw = explode(",",$poly_data_raw);
                $lat = $poly_data_raw[0];
                $lng = $poly_data_raw[1];
                $poly_data_raw_array[] = $poly_data_raw;
            }
            $polylineoptions[$poly_id]->polydata = $poly_data_raw_array;


            if (isset($polylineoptions[$poly_id]->linecolor)) { $linecolor = $polylineoptions[$poly_id]->linecolor; } else { $linecolor = false; }
            if (isset($polylineoptions[$poly_id]->fillcolor)) { $fillcolor = $polylineoptions[$poly_id]->fillcolor; } else { $fillcolor = false; }
            if (isset($polylineoptions[$poly_id]->opacity)) { $fillopacity = $polylineoptions[$poly_id]->opacity; } else { $fillopacity = false; }
            if (!$linecolor) { $polylineoptions[$poly_id]->linecolor = "000000"; }
            if (!$fillcolor) { $polylineoptions[$poly_id]->fillcolor = "66FF00"; }
            if (!$fillopacity) { $polylineoptions[$poly_id]->opacity = "0.5"; }
        }
    } else { $polylineoptions = array(); } 

    if (isset($wpgmza_settings['wpgmza_settings_marker_pull']) && $wpgmza_settings['wpgmza_settings_marker_pull'] == "0") {
        $markers = wpgmaps_return_markers($wpgmza_current_map_id);
    }

    wp_enqueue_script( 'wpgmaps_core' );

    do_action("wpgooglemaps_basic_hook_user_js_after_core");

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_mapid', $wpgmza_current_map_id );

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize', $res);
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_polygon_settings', $polygonoptions);
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_polyline_settings', $polylineoptions);

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_markerurl', wpgmaps_get_marker_url($wpgmza_current_map_id));


    if ($wpgmza_settings['wpgmza_settings_marker_pull'] == "0") {
        wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_marker_data', $markers);
    }
    
    $wpgmza_settings = apply_filters("wpgmza_basic_filter_localize_settings",$wpgmza_settings);

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_global_settings', $wpgmza_settings);

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_lang_km_away', __("km away","wp-google-maps"));
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_lang_m_away', __("miles away","wp-google-maps"));

}



/**
 * Adds a localized override variable for the zoom level of the map
 * @return void
 */
add_action("wpgooglemaps_basic_hook_user_js_after_core","wpgooglemaps_basic_hook_control_overrides_user_js_after_core",10);
function wpgooglemaps_basic_hook_control_overrides_user_js_after_core() {
    global $wpgmza_override;
    if (isset($wpgmza_override['zoom'])) {
        wp_localize_script( 'wpgmaps_core', 'wpgmza_override_zoom', $wpgmza_override['zoom']);
    }
}


/**
 * Build the marker XML file
 * @param  boolean $mapid   Map Id
 * @return boolean          true by default
 */
function wpgmaps_update_xml_file($mapid = false) {
    
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    if (isset($wpgmza_settings['wpgmza_settings_marker_pull']) && $wpgmza_settings['wpgmza_settings_marker_pull'] == '0') {
        /* using db method, do nothing */
        return;
    }
    
    if (!$mapid) { $mapid = sanitize_text_field($_POST['map_id']); }
    if (!$mapid) { $mapid = sanitize_text_field($_GET['map_id']); }
    global $wpdb;
    
    
    /* added in 6.0.30 */
    if (!class_exists("DOMDocument")) {
        return new WP_Error( 'db_query_error', __( 'DOMDocument is not enabled' ), "Please contact your host and ask them to enable the DOMDocument class. WP Google Maps uses this class to create the marker data files." );
    }
    
    
    
    $dom = new DOMDocument('1.0');
    $dom->formatOutput = true;
    $channel_main = $dom->createElement('markers');
    $channel = $dom->appendChild($channel_main);
    $table_name = $wpdb->prefix . "wpgmza";

    /* PREVIOUS VERSION HANDLING */
    
    if (function_exists('wpgmza_register_pro_version')) {
        $prov = get_option("WPGMZA_PRO");
        $wpgmza_pro_version = $prov['version'];
        
        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE `map_id` = %d AND `approved` = 1",intval($mapid)) );
    } else {

        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE `map_id` = %d AND `approved` = 1",intval($mapid)) );
    }
    


    

    foreach ( $results as $result ) {   
        
        $id = $result->id;
        $address = stripslashes($result->address);
        $description = do_shortcode(stripslashes($result->description));
        $pic = $result->pic;
        if (!$pic) { $pic = ""; }
        $icon = $result->icon;
        if (!$icon) { $icon = ""; }
        $link_url = $result->link;
        if ($link_url) {  } else { $link_url = ""; }
        $lat = $result->lat;
        $lng = $result->lng;
        $anim = $result->anim;
        $retina = $result->retina;
        $category = $result->category;
        
        if ($icon == "") {
            if (function_exists('wpgmza_get_category_data')) {
                $category_data = wpgmza_get_category_data($category);
                if (isset($category_data->category_icon) && isset($category_data->category_icon) != "") {
                    $icon = $category_data->category_icon;
                } else {
                   $icon = "";
                }
                if (isset($category_data->retina)) {
                    $retina = $category_data->retina;
                }
            }
        }
        $infoopen = $result->infoopen;
        
        $mtitle = stripslashes($result->title);
        $map_id = $result->map_id;

        $channel = $channel_main->appendChild($dom->createElement('marker'));
        $title = $channel->appendChild($dom->createElement('marker_id'));
        $title->appendChild($dom->CreateTextNode($id));
        $title = $channel->appendChild($dom->createElement('map_id'));
        $title->appendChild($dom->CreateTextNode($map_id));
        $title = $channel->appendChild($dom->createElement('title'));
        $title->appendChild($dom->CreateTextNode($mtitle));
        $title = $channel->appendChild($dom->createElement('address'));
        $title->appendChild($dom->CreateTextNode($address));
        $desc = $channel->appendChild($dom->createElement('desc'));
        $desc->appendChild($dom->CreateTextNode($description));
        $desc = $channel->appendChild($dom->createElement('pic'));
        $desc->appendChild($dom->CreateTextNode($pic));
        $desc = $channel->appendChild($dom->createElement('icon'));
        $desc->appendChild($dom->CreateTextNode($icon));
        $desc = $channel->appendChild($dom->createElement('linkd'));
        $desc->appendChild($dom->CreateTextNode($link_url));
        $bd = $channel->appendChild($dom->createElement('lat'));
        $bd->appendChild($dom->CreateTextNode($lat));
        $bd = $channel->appendChild($dom->createElement('lng'));
        $bd->appendChild($dom->CreateTextNode($lng));
        $bd = $channel->appendChild($dom->createElement('anim'));
        $bd->appendChild($dom->CreateTextNode($anim));
        $bd = $channel->appendChild($dom->createElement('retina'));
        $bd->appendChild($dom->CreateTextNode($retina));
        $bd = $channel->appendChild($dom->createElement('category'));
        $bd->appendChild($dom->CreateTextNode($category));
        $bd = $channel->appendChild($dom->createElement('infoopen'));
        $bd->appendChild($dom->CreateTextNode($infoopen));

        
    }
    $upload_dir = wp_upload_dir();
    
    wpgmaps_handle_directory();

    
    $xml_marker_location = wpgmza_return_marker_path(); 
    
	$dom = apply_filters('wpgmza_xml_cache_generated', $dom);
	
	if(is_multisite())
	{
		global $blog_id;
		$dest = $xml_marker_location.$blog_id.'-'.$mapid.'markers.xml';
	}
	else
		$dest = $xml_marker_location.$mapid.'markers.xml';
	
	if(!$dom->save($dest))
		return new WP_Error( 'db_query_error', __( 'Could not save XML file' ), "Could not save marker XML file ($dest) for Map ID $mapid" );
	
	do_action('wpgmza_xml_cache_saved', $dest);
	
    return true;
   
}

/**
 * Return an array of markers with relevant data.
 * Used by AJAX calls throughout sections the plugin
 * @param  boolean $mapid       Map ID
 * @param  boolean $markerid    (optional) will only pull that marker ID if selected
 * @return array                Array of marker data
 */
function wpgmaps_return_markers($mapid = false,$marker_id = false) {
	
    if (!$mapid) {
        return;
    }
    global $wpdb;
    global $wpgmza_tblname;
	
	$table_name = $wpgmza_tblname;
	
	$columns = implode(', ', wpgmza_get_marker_columns());
	
    if ($marker_id) {
        $results = $wpdb->get_results($wpdb->prepare("SELECT $columns FROM $table_name WHERE `map_id` = %d AND `id` = %d",intval($mapid),intval($marker_id)) );
    } else {
        $results = $wpdb->get_results($wpdb->prepare("SELECT $columns FROM $table_name WHERE `map_id` = %d AND `approved` = 1",intval($mapid)) );
    }
	
    $m_array = array();
    $cnt = 0;
    foreach ( $results as $result ) {   
        
        $id = $result->id;
        $address = stripslashes($result->address);
        $description = do_shortcode(stripslashes($result->description));
        $pic = $result->pic;
        if (!$pic) { $pic = ""; }
        $icon = $result->icon;
        if (!$icon) { $icon = ""; }
        $link_url = $result->link;
        if ($link_url) {  } else { $link_url = ""; }
        $lat = $result->lat;
        $lng = $result->lng;
        $anim = $result->anim;
        $retina = $result->retina;
        $category = $result->category;
        $other_data = $result->other_data;
        
        if ($icon == "") {
            if (function_exists('wpgmza_get_category_data')) {
                $category_data = wpgmza_get_category_data($category);
                if (isset($category_data->category_icon) && isset($category_data->category_icon) != "") {
                    $icon = $category_data->category_icon;
                } else {
                   $icon = "";
                }
                if (isset($category_data->retina)) {
                    $retina = $category_data->retina;
                }
            }
        }
        $infoopen = $result->infoopen;
        
        $mtitle = stripslashes($result->title);
        $map_id = $result->map_id;
        
        $m_array[$id] = array(
            'map_id' => $map_id,
            'marker_id' => $id,
            'title' => $mtitle,
            'address' => $address,
            'desc' => $description,
            'pic' => $pic,
            'icon' => $icon,
            'linkd' => $link_url,
            'lat' => $lat,
            'lng' => $lng,
            'anim' => $anim,
            'retina' => $retina,
            'category' => $category,
            'infoopen' => $infoopen,
            'other_data'=> maybe_unserialize($other_data),
            'infoopen' => $infoopen
        );
		
		//$custom_fields = new WPGMZA\CustomMarkerFields();
		if(class_exists('WPGMZA\\CustomMarkerFields'))
		{
			$custom_fields = new WPGMZA\CustomMarkerFields($id);
			$m_array[$id]['custom_fields_json'] = json_encode($custom_fields);
			$m_array[$id]['custom_fields_html'] = $custom_fields->html();
		}
		
        $cnt++;
        
    }

    return $m_array;
   
}

/**
 * Identify the marker URL and return it
 * @return string   Marker URL
 */
function wpgmza_return_marker_url() {
    $url = get_option("wpgmza_xml_url");
    
    
    $content_url = content_url();
    $content_url = trim($content_url, '/');
     
    $plugins_url = plugins_url();
    $plugins_url = trim($plugins_url, '/');
     
    $upload_url = wp_upload_dir();
    $upload_url = $upload_url['baseurl'];
    $upload_url = trim($upload_url, '/');

    $url = str_replace('{wp_content_url}', $content_url, $url);
    $url = str_replace('{plugins_url}', $plugins_url, $url);
    $url = str_replace('{uploads_url}', $upload_url, $url);
    
    /* just incase people use the "dir" instead of "url" */
    $url = str_replace('{wp_content_dir}', $content_url, $url);
    $url = str_replace('{plugins_dir}', $plugins_url, $url);
    $url = str_replace('{uploads_dir}', $upload_url, $url);

    if (empty($url)) {
        $url = $upload_url."/wp-google-maps/";
    }
    
    if (substr($url, -1) != "/") { $url = $url."/"; }


    return $url;
    
    
    
    
    
}

/**
 * Identify the XML marker directory PATH and return it
 * @return string   XML marker dir path 
 */
function wpgmza_return_marker_path() { 
        $file = get_option("wpgmza_xml_location");
        $content_dir = WP_CONTENT_DIR;
        $content_dir = trim($content_dir, '/');
        if (defined('WP_PLUGIN_DIR')) {
            $plugin_dir = str_replace(wpgmza_get_document_root(), '', WP_PLUGIN_DIR);
            $plugin_dir = trim($plugin_dir, '/');
        } else {
            $plugin_dir = str_replace(wpgmza_get_document_root(), '', WP_CONTENT_DIR . '/plugins');
            $plugin_dir = trim($plugin_dir, '/');
        }
        $upload_dir = wp_upload_dir();
        $upload_dir = $upload_dir['basedir'];
        $upload_dir = rtrim($upload_dir, '/');
        
        $file = str_replace('{wp_content_dir}', $content_dir, $file);
        $file = str_replace('{plugins_dir}', $plugin_dir, $file);
        $file = str_replace('{uploads_dir}', $upload_dir, $file);
        $file = trim($file);
        
        if (empty($file)) {
            $file = $upload_dir."/wp-google-maps/";
        }
        

        
        
        
        
        /* 6.0.32 - checked for beginning slash, but not on local host */
        if (
                (isset($_SERVER['SERVER_ADDR']) && $_SERVER['SERVER_ADDR'] == "127.0.0.1") || 
                (isset($_SERVER['LOCAL_ADDR']) && $_SERVER['LOCAL_ADDR'] == "127.0.0.1") || 
                substr($file, 0, 2) == "C:" ||
                substr($file, 0, 2) == "D:" ||
                substr($file, 0, 2) == "E:" ||
                substr($file, 0, 2) == "F:" ||
                substr($file, 0, 2) == "G:"
                
            ) { } else {
            if (substr($file, 0, 1) != "/") { $file = "/".$file; }
        }
        
        /* 6.0.32 - check if its just returning 'wp-content/...' */
        if (substr($file, 0, 10) == "wp-content") { 
            $file = wpgmza_get_site_root()."/".$file;
        }
        
        if (substr($file, -1) != "/") { $file = $file."/"; }
        
        return $file;

    
}

/**
 * Identify the server's root path
 * @return string  root path
 */
function wpgmza_get_document_root() {
    $document_root = null;

    if ($document_root === null) {
        if (!empty($_SERVER['SCRIPT_FILENAME']) && $_SERVER['SCRIPT_FILENAME'] == $_SERVER['PHP_SELF']) {
            $document_root = wpgmza_get_site_root();
        } elseif (!empty($_SERVER['SCRIPT_FILENAME'])) {
            $document_root = substr(wpgmza_path($_SERVER['SCRIPT_FILENAME']), 0, -strlen(wpgmza_path($_SERVER['PHP_SELF'])));
        } elseif (!empty($_SERVER['PATH_TRANSLATED'])) {
            $document_root = substr(wpgmza_path($_SERVER['PATH_TRANSLATED']), 0, -strlen(wpgmza_path($_SERVER['PHP_SELF'])));
        } elseif (!empty($_SERVER['DOCUMENT_ROOT'])) {
            $document_root = wpgmza_path($_SERVER['DOCUMENT_ROOT']);
        } else {
            $document_root = wpgmza_get_site_root();
        }

        $document_root = realpath($document_root);
        $document_root = wpgmza_path($document_root);
    }

    return $document_root;
}
/**
 * Identify and return the site root
 * @return string site root
 */
function wpgmza_get_site_root() {
    $site_root = ABSPATH;
    $site_root = realpath($site_root);
    $site_root = wpgmza_path($site_root);

    return $site_root;
}
/**
 * Trim and structure the path correctly
 * @param  string   $path   The path to be standardized
 * @return string           The path
 */
function wpgmza_path($path) {
    $path = preg_replace('~[/\\\]+~', '/', $path);
    $path = rtrim($path, '/');

    return $path;
}

/**
 * Identify the root of the site
 * @return string Site root
 */
function wpgmza_get_site_path() {
    $site_url = wpgmza_get_site_url();
    $parse_url = @parse_url($site_url);

    if ($parse_url && isset($parse_url['path'])) {
        $site_path = '/' . ltrim($parse_url['path'], '/');
    } else {
        $site_path = '/';
    }

    if (substr($site_path, -1) != '/') {
        $site_path .= '/';
    }

    return $site_path;
}

/**
 * Identify and return the site URL
 * @return string site url
 */
function wpgmza_get_site_url() {
    static $site_url = null;

    if ($site_url === null) {
        $site_url = get_option('siteurl');
        $site_url = rtrim($site_url, '/');
    }

    return $site_url;
}


/**
 * Function to update all XML files
 * This function is called when updating the the plugin
 * @return void
 */
function wpgmaps_update_all_xml_file() {
    global $wpdb;
    
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    if (isset($wpgmza_settings['wpgmza_settings_marker_pull']) && $wpgmza_settings['wpgmza_settings_marker_pull'] == '0') {
        /* using db method, do nothing */
        return;
    }
    
    $table_name = $wpdb->prefix . "wpgmza_maps";
    $results = $wpdb->get_results($wpdb->prepare("SELECT `id` FROM $table_name WHERE `active` = %d",0));

    foreach ( $results as $result ) {
        $map_id = $result->id;
        $wpgmza_check = wpgmaps_update_xml_file($map_id);
        if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
    }
}


/**
 * AJAX callbacks
 * @return void
 */
function wpgmaps_action_callback_basic() {
    global $wpdb;
	global $wpgmza;
    global $wpgmza_tblname;
    global $wpgmza_p;
    global $wpgmza_tblname_poly;
    global $wpgmza_tblname_polylines;
    $check = check_ajax_referer( 'wpgmza', 'security' );
    $table_name = $wpdb->prefix . "wpgmza";

    if ($check == 1) {

        if ($_POST['action'] == "add_marker") {
			
			$fields = array(
				'map_id'		=> '%d',
				'address'		=> '%s',
				'lat'			=> '%f',
				'lng'			=> '%f',
				'latlng'		=> "{$wpgmza->spatialFunctionPrefix}GeomFromText(%s)",
				'infoopen'		=> '%d',
				'description'	=> '%s',
				'title'			=> '%s',
				'anim'			=> '%d',
				'link'			=> '%s',
				'icon'			=> '%s',
				'pic'			=> '%s'
			);
	
			$keys = array_keys($fields);
			$placeholders = array_values($fields);
	
			$qstr = "INSERT INTO $table_name (" . implode(',', $keys) . ") VALUES (" . implode(',', $placeholders) . ")";
			
			$params = array();
			foreach($fields as $key => $placeholder)
			{
				if($key == 'latlng')
				{
					$params[] = "POINT({$_POST['lat']} {$_POST['lng']})";
					continue;
				}
				
				if(!isset($_POST[$key]))
				{
					$params[] = "";
					continue;
				}
				
				$params[] = $_POST[$key];
			}
			
			$stmt = $wpdb->prepare($qstr, $params);
			$rows_affected = $wpdb->query($stmt);
			
            $wpgmza_check = wpgmaps_update_xml_file(sanitize_text_field((int)$_POST['map_id']));
			
            if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
            $return_a = array(
                "marker_id" => $wpdb->insert_id,
                "marker_data" => wpgmaps_return_markers(sanitize_text_field($_POST['map_id']),$wpdb->insert_id),
                "table_html" => wpgmza_return_marker_list(sanitize_text_field($_POST['map_id']))
            );
            echo json_encode($return_a);
			
        }
        if ($_POST['action'] == "edit_marker") {
            $cur_id = sanitize_text_field($_POST['edit_id']);
			
			$qstr = "UPDATE $table_name SET 
				address = %s,
				lat = %f,
				lng = %f,
				latlng = {$wpgmza->spatialFunctionPrefix}GeomFromText(%s),
				anim = %d,
				infoopen = %d
				WHERE
				id = %d
				";
			
			$param = array(
				$_POST['address'],
				$_POST['lat'],
				$_POST['lng'],
				"POINT(" . $_POST['lat'] . " " . $_POST['lng'] . ")",
				$_POST['anim'],
				$_POST['infoopen'],
				$cur_id
			);
			
			foreach($param as $key => $value)
				$param[$key] = sanitize_text_field($value);
				
			$stmt = $wpdb->prepare($qstr, $param);
			$rows_affected = $wpdb->query($stmt);
			
            $wpgmza_check = wpgmaps_update_xml_file(sanitize_text_field((int)$_POST['map_id']));
            if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
            $return_a = array(
                "marker_id" => $cur_id,
                "marker_data" => wpgmaps_return_markers(sanitize_text_field($_POST['map_id']),$cur_id),
                "table_html" => wpgmza_return_marker_list(sanitize_text_field($_POST['map_id']))
            );
            echo json_encode($return_a);

        }
        if ($_POST['action'] == "delete_marker") {
            $marker_id = sanitize_text_field($_POST['marker_id']);
            $wpdb->query( $wpdb->prepare("DELETE FROM $wpgmza_tblname WHERE `id` = %d LIMIT 1",intval($marker_id)) );

            $wpgmza_check = wpgmaps_update_xml_file(sanitize_text_field($_POST['map_id']));
            if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
            $return_a = array(
                "marker_id" => $marker_id,
                "marker_data" => wpgmaps_return_markers(sanitize_text_field($_POST['map_id'])),
                "table_html" => wpgmza_return_marker_list(sanitize_text_field($_POST['map_id']))
            );
            echo json_encode($return_a);


        }
        if ($_POST['action'] == "delete_poly") {
            $poly_id = sanitize_text_field($_POST['poly_id']);
            $wpdb->query($wpdb->prepare("DELETE FROM $wpgmza_tblname_poly WHERE `id` = %d LIMIT 1",intval($poly_id)) );
            echo wpgmza_b_return_polygon_list(sanitize_text_field($_POST['map_id']));
        }
        if ($_POST['action'] == "delete_polyline") {
            $poly_id = sanitize_text_field($_POST['poly_id']);
            $wpdb->query($wpdb->prepare("DELETE FROM $wpgmza_tblname_polylines WHERE `id` = %d LIMIT 1",intval($poly_id)) );
            echo wpgmza_b_return_polyline_list(sanitize_text_field($_POST['map_id']));
        }
		
		if($_POST['action'] == "delete_circle") {
			global $wpgmza_tblname_circles;
			$stmt = $wpdb->prepare("DELETE FROM $wpgmza_tblname_circles WHERE id=%d", array($_POST['circle_id']));
			$wpdb->query($stmt);
			
			echo wpgmza_get_circles_table($_POST['map_id']);
		}
		
		if($_POST['action'] == "delete_rectangle") {
			global $wpgmza_tblname_rectangles;
			$stmt = $wpdb->prepare("DELETE FROM $wpgmza_tblname_rectangles WHERE id=%d", array($_POST['rectangle_id']));
			$wpdb->query($stmt);
			
			echo wpgmza_get_rectangles_table($_POST['map_id']);
		}
    }
    die(); 
}

/**
 * Enqueue the Google Maps API
 * @return void
 */
function wpgmaps_load_maps_api() {
    //wp_enqueue_script('google-maps' , 'http://maps.google.com/maps/api/js' , false , '3');
}

/**
 * Handle the WPGMZA shortcode
 * The shortcode attributes are identified and the relevant data is localized and the JS file enqueued
 * @param  array    $atts   array of shortcode attributes
 * @return void
 */
function wpgmaps_tag_basic( $atts ) {
	
	global $wpgmza_current_map_id;
    global $wpgmza_version;
    global $short_code_active;
    global $wpgmza_override;
	global $wpgmza;

	
	
    extract( shortcode_atts( array(
        'id' 		=> '1', 
		'width' 	=> 'inherit',
		'height' 	=> 'inherit'
    ), $atts ) );

    $ret_msg = "";
    $wpgmza_current_map_id = $atts['id'];

    $res = wpgmza_get_map_data($atts['id']);
    if (!isset($res)) { echo __("Error: The map ID","wp-google-maps")." (".$wpgmza_current_map_id.") ".__("does not exist","wp-google-maps"); return; }
    
    $user_api_key = get_option( 'wpgmza_google_maps_api_key' );
	
    if ($wpgmza->settings->engine == "google-maps" && empty($user_api_key)) {
        $adminurl = admin_url( 'admin.php?page=wp-google-maps-menu-settings#tabs-4');
        $link = sprintf( __( "In order for your map to display, please make sure you insert your Google Maps JavaScript API key in the <a href='%s' target='_BLANK'>Maps->Settings->Advanced tab</a>.", 'wp-google-maps' ),
            $adminurl
        );

        echo "<div class='wpgmza_error' style='background-image:url(".plugins_url('images/map-bg.jpg', __FILE__)."); display:block; padding:15px; border:1px solid #eee; overflow:auto;'>";
        echo "<h3>".__("WP Google Maps Error","wp-google-maps")."</h3>";
        echo "<p style='color:#333;'><strong>".$link."</strong></p>";
        echo "</div>";
        return;
    }

    if (!function_exists('wpgmaps_admin_styles_pro')) {
        
        wp_register_style( 'wpgmaps-style', plugins_url('css/wpgmza_style.css', __FILE__),array(),$wpgmza_version);
        wp_enqueue_style( 'wpgmaps-style' );


        $wpgmaps_extra_css = ".wpgmza_map img { max-width:none; } .wpgmza_widget { overflow: auto; }";
        wp_add_inline_style( 'wpgmaps-style', stripslashes( $wpgmaps_extra_css ) );


        $wpgmza_main_settings = get_option("WPGMZA_OTHER_SETTINGS");
        if (isset($wpgmza_main_settings['wpgmza_custom_css']) && $wpgmza_main_settings['wpgmza_custom_css'] != "") { 
            wp_add_inline_style( 'wpgmaps-style', stripslashes( $wpgmza_main_settings['wpgmza_custom_css'] ) );
        }

    }
     if (isset($atts['zoom'])) {
        $zoom_override = $atts['zoom'];
        $wpgmza_override['zoom'] = $zoom_override;
    }    
   
    $map_align = $res->alignment;

    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
	
    if (isset($wpgmza_settings['wpgmza_settings_marker_pull']) && $wpgmza_settings['wpgmza_settings_marker_pull'] == '0') {
    } else {
        /* only check if marker file exists if they are using the XML method */
        wpgmza_check_if_marker_file_exists($wpgmza_current_map_id);
    }
    
    $map_width_type = stripslashes($res->map_width_type);
    $map_height_type = stripslashes($res->map_height_type);
    if (!isset($map_width_type)) { $map_width_type == "px"; }
    if (!isset($map_height_type)) { $map_height_type == "px"; }
    if ($map_width_type == "%" && intval($res->map_width) > 100) { $res->map_width = 100; }
    if ($map_height_type == "%" && intval($res->map_height) > 100) { $res->map_height = 100; }

	$map_attributes = '';
	
	if(isset($atts['width']) && $atts['width'] != 'inherit')
		$map_attributes .= "data-shortcode-width='{$atts["width"]}' ";
	if(isset($atts['height']) && $atts['height'] != 'inherit')
		$map_attributes .= "data-shortcode-height='{$atts["height"]}' ";
	
	// This is a hack and should be fixed by using DOMDocument
	$settings_attribute_data = clone $res;
	$settings_attribute_data->other_settings = unserialize($settings_attribute_data->other_settings);
	
	$escaped = esc_attr(json_encode($settings_attribute_data));
	$attr = str_replace('\\\\%', '%', $escaped);
	//$attr = stripslashes($attr);
	
	$map_attributes = "data-settings='" . $attr . "'";
	
    if (!$map_align || $map_align == "" || $map_align == "1") { $map_align = "float:left;"; }
    else if ($map_align == "2") { $map_align = "margin-left:auto !important; margin-right:auto; !important; align:center;"; }
    else if ($map_align == "3") { $map_align = "float:right;"; }
    else if ($map_align == "4") { $map_align = ""; }
	
    $map_style = "style=\"display:block; overflow:auto; width:".$res->map_width."".$map_width_type."; height:".$res->map_height."".$map_height_type."; $map_align\"";
	
    $map_other_settings = maybe_unserialize($res->other_settings);
    $sl_data = "";
    if (isset($map_other_settings['store_locator_enabled']) && $map_other_settings['store_locator_enabled'] == 1) {
        $sl_data = wpgmaps_sl_user_output_basic($wpgmza_current_map_id);
    } else { $sl_data = ""; }
    
    $ret_msg .= "
            $sl_data    
            ".apply_filters("wpgooglemaps_filter_map_div_output","<div id=\"wpgmza_map\" $map_attributes $map_style>",$wpgmza_current_map_id)."
            
            </div>
        ";

    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
	
	/*add_action('wp_enqueue_scripts', function() {
		require_once(plugin_dir_path(__FILE__) . 'includes/class.google-maps-api-loader.php');
		$googleMapsAPILoader = new WPGMZA\GoogleMapsAPILoader();
		$googleMapsAPILoader->loadGoogleMaps();
	});*/

	//$core_dependencies = array('wpgmza');
	
	$core_dependencies = array();
	$scriptLoader = new WPGMZA\ScriptLoader($wpgmza->isProVersion());
	$v8Scripts = $scriptLoader->getPluginScripts();
	
	foreach($v8Scripts as $handle => $script)
	{
		$core_dependencies[] = $handle;
	}
	
	$apiLoader = new WPGMZA\GoogleMapsAPILoader();
	// if(!empty($wpgmza_settings['wpgmza_settings_remove_api']))
		
	if($apiLoader->isIncludeAllowed())
	{
		$core_dependencies[] = 'wpgmza_api_call';
		
		if($wpgmza->settings->engine == 'google-maps')
		{
			wp_enqueue_script('wpgmza_canvas_layer_options', plugin_dir_url(__FILE__) . 'lib/CanvasLayerOptions.js', array('wpgmza_api_call'));
			wp_enqueue_script('wpgmza_canvas_layer', plugin_dir_url(__FILE__) . 'lib/CanvasLayer.js', array('wpgmza_api_call'));
		}
	}
    
	//$googleMapsAPILoader = new WPGMZA\GoogleMapsAPILoader();
	//if(!$googleMapsAPILoader->isIncludeAllowed())
		//wp_deregister_script('wpgmza_api_call');

	// TODO: Come up with a proper solution. Gutenberg dependency breaks developer mode
	$gutenbergIndex = array_search('wpgmza-gutenberg', $core_dependencies);
	if($gutenbergIndex !== false)
		array_splice($core_dependencies, $gutenbergIndex, 1);

	if(isset($wpgmza_settings['wpgmza_maps_engine']) && $wpgmza_settings['wpgmza_maps_engine'] == 'open-layers')
	{
		if($index = array_search('wpgmza-google-vertex-context-menu', $core_dependencies))
			array_splice($core_dependencies, $index, 1);
	}
	
    wp_enqueue_script('wpgmaps_core', plugins_url('/js/wpgmaps.js',__FILE__), $core_dependencies, $wpgmza_version.'b' , false);
	
	$wpgmza->loadScripts();
	
	wpgmza_enqueue_fontawesome();
	
	wp_localize_script('wpgmaps_core', 'wpgmza_circle_data_array', wpgmza_get_circle_data(1));
	wp_localize_script('wpgmaps_core', 'wpgmza_rectangle_data_array', wpgmza_get_rectangle_data(1));
	
    do_action("wpgooglemaps_hook_user_js_after_core");

    $res = array();
    $res[$wpgmza_current_map_id] = wpgmza_get_map_data($wpgmza_current_map_id);
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    
	$api_version_string = 'quarterly';
	
    $map_other_settings = maybe_unserialize($res[$wpgmza_current_map_id]->other_settings);
    $res[$wpgmza_current_map_id]->other_settings = $map_other_settings;
    $res[$wpgmza_current_map_id]->map_width_type = stripslashes($res[$wpgmza_current_map_id]->map_width_type);


    if ( isset( $res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data'] ) && $res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data'] != '') {
        $res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data'] = html_entity_decode(stripslashes($res[$wpgmza_current_map_id]->other_settings['wpgmza_theme_data']));
    }   


    $polygonoptions = array();
    $total_poly_array = wpgmza_b_return_polygon_id_array($wpgmza_current_map_id);
    if ($total_poly_array > 0) {
        foreach ($total_poly_array as $poly_id) {
            $polygonoptions[$poly_id] = wpgmza_b_return_poly_options($poly_id);

            $tmp_poly_array = wpgmza_b_return_polygon_array($poly_id);
            $poly_data_raw_array = array();
            foreach ($tmp_poly_array as $single_poly) {
                $poly_data_raw = str_replace(" ","",$single_poly);
                $poly_data_raw = explode(",",$poly_data_raw);
                if (isset($poly_data_raw[0]) && isset($poly_data_raw[1])) {
                    $lat = $poly_data_raw[0];
                    $lng = $poly_data_raw[1];
                    $poly_data_raw_array[] = $poly_data_raw;
                }
            }
            $polygonoptions[$poly_id]->polydata = $poly_data_raw_array;

            $linecolor = $polygonoptions[$poly_id]->linecolor;
            $fillcolor = $polygonoptions[$poly_id]->fillcolor;
            $fillopacity = $polygonoptions[$poly_id]->opacity;
            if (!$linecolor) { $polygonoptions[$poly_id]->linecolor = "000000"; }
            if (!$fillcolor) { $polygonoptions[$poly_id]->fillcolor = "66FF00"; }
            if (!$fillopacity) { $polygonoptions[$poly_id]->opacity = "0.5"; }
        }
    }  else { $polygonoptions = array(); } 


    $polylineoptions = array();

    $total_poly_array = wpgmza_b_return_polyline_id_array($wpgmza_current_map_id);
    if	($total_poly_array > 0) {
        foreach ($total_poly_array as $poly_id) {
            $polylineoptions[$poly_id] = wpgmza_b_return_polyline_options($poly_id);

            $tmp_poly_array = wpgmza_b_return_polyline_array($poly_id);
            $poly_data_raw_array = array();
            foreach ($tmp_poly_array as $single_poly) {
                $poly_data_raw = str_replace(" ","",$single_poly);
                $poly_data_raw = str_replace(")","",$poly_data_raw );
                $poly_data_raw = str_replace("(","",$poly_data_raw );
                $poly_data_raw = explode(",",$poly_data_raw);
                if (isset($poly_data_raw[0]) && isset($poly_data_raw[1])) {
                    $lat = $poly_data_raw[0];
                    $lng = $poly_data_raw[1];
                    $poly_data_raw_array[] = $poly_data_raw;
                }
            }
            $polylineoptions[$poly_id]->polydata = $poly_data_raw_array;


            if (isset($polylineoptions[$poly_id]->linecolor)) { $linecolor = $polylineoptions[$poly_id]->linecolor; } else { $linecolor = false; }
            if (isset($polylineoptions[$poly_id]->fillcolor)) { $fillcolor = $polylineoptions[$poly_id]->fillcolor; } else { $fillcolor = false; }
            if (isset($polylineoptions[$poly_id]->opacity)) { $fillopacity = $polylineoptions[$poly_id]->opacity; } else { $fillopacity = false; }
            if (!$linecolor) { $polylineoptions[$poly_id]->linecolor = "000000"; }
            if (!$fillcolor) { $polylineoptions[$poly_id]->fillcolor = "66FF00"; }
            if (!$fillopacity) { $polylineoptions[$poly_id]->opacity = "0.5"; }
        }
    } else { $polylineoptions = array(); } 

    if (isset($wpgmza_settings['wpgmza_settings_marker_pull']) && $wpgmza_settings['wpgmza_settings_marker_pull'] == "0") {
        $markers = wpgmaps_return_markers($wpgmza_current_map_id);
    }
    
    do_action("wpgooglemaps_basic_hook_user_js_after_core");

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_mapid', $wpgmza_current_map_id);
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize', $res);
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_polygon_settings', $polygonoptions);
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_polyline_settings', $polylineoptions);

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_markerurl', wpgmaps_get_marker_url($wpgmza_current_map_id));


    if ($wpgmza_settings['wpgmza_settings_marker_pull'] == "0") {
        wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_marker_data', $markers);
    }
    
    $wpgmza_settings = apply_filters("wpgmza_basic_filter_localize_settings",$wpgmza_settings);

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_global_settings', $wpgmza_settings);

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_lang_km_away', __("km away","wp-google-maps"));
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_lang_m_away', __("miles away","wp-google-maps"));

    if (isset($wpgmza_settings['wpgmza_force_greedy_gestures']) && $wpgmza_settings['wpgmza_force_greedy_gestures'] == "yes") {
        wp_localize_script( 'wpgmaps_core', 'wpgmza_force_greedy_gestures', "greedy");
    }

    do_action("wpgooglemaps_hook_user_js_after_localize",$res);

	// Autoptimize fix, bypass CSS where our map is present as large amounts of inline JS (our localized data) crashes their plugin. Added at their advice.
	add_filter('autoptimize_filter_css_noptimize', '__return_true');
    
    return $ret_msg;
}

/**
 * Check if the marker file exists
 * @param  Integer $mapid Map ID
 * @return void
 */
function wpgmza_check_if_marker_file_exists($mapid) {
    wpgmaps_handle_directory();
    $upload_dir = wp_upload_dir(); 
    
    $xml_marker_location = get_option("wpgmza_xml_location");
    if (is_multisite()) {
        global $blog_id;
        if (file_exists($xml_marker_location.$blog_id.'-'.$mapid.'markers.xml')) {
            /* all OK */  
        } else {
            $wpgmza_check = wpgmaps_update_xml_file($mapid);
            if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
        }
    }
    else {
            if (file_exists($xml_marker_location.$mapid.'markers.xml')) {
            } else {
                $wpgmza_check = wpgmaps_update_xml_file($mapid);
                if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
            }
    }
}

/**
 * Create the HTML output for the store locator
 * @param  Integer  $map_id     Map ID
 * @return string               HTML output for the store locator
 */
function wpgmaps_sl_user_output_basic($map_id) {
	$global_settings = get_option('WPGMZA_OTHER_SETTINGS');
    $map_settings = wpgmza_get_map_data($map_id);
    
    $map_width = $map_settings->map_width;
    $map_width_type = stripslashes($map_settings->map_width_type);
    $map_other_settings = maybe_unserialize($map_settings->other_settings);
    
    if (isset($map_other_settings['store_locator_query_string'])) { $sl_query_string = stripslashes($map_other_settings['store_locator_query_string']); } else { $sl_query_string = __("ZIP / Address:","wp-google-maps"); }
    if (isset($map_other_settings['store_locator_default_address'])) { $sl_default_address = stripslashes($map_other_settings['store_locator_default_address']); } else { $sl_default_address = ''; }
	
    if (isset($map_other_settings['store_locator_default_radius']))
        $sl_default_radius = stripslashes($map_other_settings['store_locator_default_radius']); 
    
	if (isset($map_other_settings['store_locator_not_found_message'])) { $sl_not_found_message = stripslashes($map_other_settings['store_locator_not_found_message']); } else { $sl_not_found_message = __( "No results found in this location. Please try again.", "wp-google-maps" ); }

	if ($map_width_type == "px" && $map_width < 300) { $map_width = "300"; }
    
    $ret_msg = "";
    
    $ret_msg .= "<div class=\"wpgmza_sl_main_div\">";
    $ret_msg .= "       <div class=\"wpgmza-form-field wpgmza_sl_query_div wpgmza-clearfix\">";
    $ret_msg .= "           <label for='addressInput' class='wpgmza-form-field__label wpgmza-form-field__label--float'>".esc_attr($sl_query_string)."</label>";
	$ret_msg .= "           <input class=\"wpgmza-form-field__input\" type=\"text\" id=\"addressInput\" size=\"20\" value=\"".$sl_default_address."\" />";
	$ret_msg .= "       </div>";

    $ret_msg .= "       <div class=\"wpgmza-form-field wpgmza_sl_radius_div wpgmza-clearfix\"><label for='radiusSelect' class='wpgmza-form-field__label wpgmza-form-field__label--float'>".__("Radius","wp-google-maps").":</label>";
    $ret_msg .= "           <select class=\"wpgmza-form-field__input wpgmza_sl_radius_select\" id=\"radiusSelect\">";
    $ret_msg .= "               ";

    $map_other_settings['store_locator_distance'] = isset($map_other_settings['store_locator_distance']) ? intval($map_other_settings['store_locator_distance']) : 2;
	
	$suffix = (!empty($map_other_settings['store_locator_distance']) && $map_other_settings['store_locator_distance'] == 1 ? __('mi', 'wp-google-maps') : __('km', 'wp-google-maps'));
	
	global $wpgmza_default_store_locator_radii;
	$radii = $wpgmza_default_store_locator_radii;
	
	if(!empty($global_settings['wpgmza_store_locator_radii']) && preg_match_all('/\d+/', $global_settings['wpgmza_store_locator_radii'], $m))
		$radii = array_map('intval', $m[0]);
	
	foreach($radii as $radius) {
		$selected = (!empty($sl_default_radius) && $radius == $sl_default_radius ? 'selected="selected"' : '');
		$ret_msg .= "<option class='wpgmza_sl_select_option' value='$radius' $selected>{$radius}{$suffix}</option>";
	}
	
	$ret_msg .= "               </select><input type='hidden' value='".$map_other_settings['store_locator_distance']."' name='wpgmza_distance_type' id='wpgmza_distance_type'  style='display:none;' />";
    $ret_msg .= "       </div>";
    
    if (function_exists("wpgmza_register_pro_version") && isset($map_other_settings['store_locator_category']) && $map_other_settings['store_locator_category'] == "1") {
        $ret_msg .= "       <div class=\"wpgmza_sl_category_div\">";
        $ret_msg .= "           <div class=\"wpgmza_sl_category_innerdiv1\">".__("Category","wp-google-maps").":</div>";
        $ret_msg .= "           <div class=\"wpgmza_sl_category_innerdiv2\">";
        $ret_msg .= "              ".wpgmza_pro_return_category_checkbox_list($map_id)."";
        $ret_msg .= "           </div>";
        $ret_msg .= "       </div>";
    }
	
	if(empty($map_other_settings['store_locator_style']) || $map_other_settings['store_locator_style'] != 'modern')
		$ret_msg .= "<input class=\"wpgmza_sl_search_button\" type=\"button\" onclick=\"searchLocations($map_id)\" value=\"".__("Search","wp-google-maps")."\"/>";
	else
		$ret_msg .= "<span class='wpgmza_sl_search_button' onclick='searchLocations($map_id);'><i class='fa fa-search'></i></span>";
	
	
	
	$ret_msg .= "       <div class='wpgmza-not-found-msg js-not-found-msg'><p>" . $sl_not_found_message . "</p></div>";
	$ret_msg .= "    </div>";
    //$ret_msg .= "    <div><select id=\"locationSelect\" style=\"width:100%;visibility:hidden\"></select></div>";
    
    return $ret_msg;
    
}


/**
 * Return the plugin URL
 * @return string Plugin URL
 */
function wpgmaps_get_plugin_url() {
    return plugin_dir_url( __FILE__ );
}

/**
 * Handle POST for settings page
 * @return void
 */
add_action('admin_post_wpgmza_settings_page_post', 'wpgmza_settings_page_post');

function wpgmza_settings_page_post()
{
	global $wpdb;
	
	global $wpgmzaGDPRCompliance;
	
	if($wpgmzaGDPRCompliance)
		$wpgmzaGDPRCompliance->onPOST();
	
	//$wpgmza_data = array();
	$wpgmza_data = get_option('WPGMZA_OTHER_SETTINGS');
	if(!$wpgmza_data)
		$wpgmza_data = array();
	
	$checkboxes = array("wpgmza_settings_map_full_screen_control",
		"wpgmza_settings_map_streetview",
		"wpgmza_settings_map_zoom",
		"wpgmza_settings_map_pan",
		"wpgmza_settings_map_type",
		"wpgmza_settings_map_scroll",
		"wpgmza_settings_map_draggable",
		"wpgmza_settings_map_clickzoom",
		"wpgmza_settings_cat_display_qty",
		"wpgmza_settings_force_jquery",
		"wpgmza_settings_remove_api",
		"wpgmza_force_greedy_gestures",
		"wpgmza_settings_image_resizing",
		"wpgmza_settings_infowindow_links",
		"wpgmza_settings_infowindow_address",
		"wpgmza_settings_disable_infowindows",
		"carousel_lazyload",
		"carousel_autoheight",
		"carousel_pagination",
		"carousel_navigation",
		"wpgmza_gdpr_enabled",
		"wpgmza_gdpr_require_consent_before_load",
		"wpgmza_developer_mode",
		'wpgmza_prevent_other_plugins_and_theme_loading_api',
		"wpgmza_gdpr_override_notice",
		"wpgmza_gdpr_require_consent_before_vgm_submit"
	);
	
	foreach($checkboxes as $name) {
		$remap = $name;
		
		switch($name)
		{
			case 'wpgmza_developer_mode':
				$remap = preg_replace('/^wpgmza_/', '', $name);
				break;
		}
		
		if(!empty($_POST[$name]))
			$wpgmza_data[$remap] = sanitize_text_field( $_POST[$name] );
		else if(isset($wpgmza_data[$remap]))
			unset($wpgmza_data[$remap]);
	}
	
	if(isset($_POST['tile_server_url']))
		$wpgmza_data['tile_server_url'] = $_POST['tile_server_url'];
	
	if(isset($_POST['wpgmza_load_engine_api_condition']))
		$wpgmza_data['wpgmza_load_engine_api_condition'] = $_POST['wpgmza_load_engine_api_condition'];
	
	if(!empty($_POST['wpgmza_always_include_engine_api_on_pages']))
		$wpgmza_data['wpgmza_always_include_engine_api_on_pages'] = $_POST['wpgmza_always_include_engine_api_on_pages'];
	
	if(!empty($_POST['wpgmza_always_exclude_engine_api_on_pages']))
		$wpgmza_data['wpgmza_always_exclude_engine_api_on_pages'] = $_POST['wpgmza_always_exclude_engine_api_on_pages'];
	
	if(isset($_POST['wpgmza_use_fontawesome']))
		$wpgmza_data['use_fontawesome'] = $_POST['wpgmza_use_fontawesome'];
	
	if(isset($_POST['wpgmza_maps_engine']))
		$wpgmza_data['wpgmza_maps_engine'] = $_POST['wpgmza_maps_engine'];

	if (isset($_POST['wpgmza_settings_map_open_marker_by'])) { $wpgmza_data['wpgmza_settings_map_open_marker_by'] = sanitize_text_field($_POST['wpgmza_settings_map_open_marker_by']); }

	if (isset($_POST['wpgmza_custom_css'])) { $wpgmza_data['wpgmza_custom_css'] = sanitize_text_field($_POST['wpgmza_custom_css']); }
	if (isset($_POST['wpgmza_custom_js'])) { $wpgmza_data['wpgmza_custom_js'] = $_POST['wpgmza_custom_js']; }
	
	
	
	if (isset($_POST['wpgmza_marker_xml_location'])) { update_option("wpgmza_xml_location",sanitize_text_field($_POST['wpgmza_marker_xml_location'])); }
	if (isset($_POST['wpgmza_marker_xml_url'])) { update_option("wpgmza_xml_url",sanitize_text_field($_POST['wpgmza_marker_xml_url'])); }
	if (isset($_POST['wpgmza_access_level'])) { $wpgmza_data['wpgmza_settings_access_level'] = sanitize_text_field($_POST['wpgmza_access_level']); }
	if (isset($_POST['wpgmza_settings_marker_pull'])) { $wpgmza_data['wpgmza_settings_marker_pull'] = sanitize_text_field($_POST['wpgmza_settings_marker_pull']); }

	// Maps -> Settings -> Store Locator -> option Store Locator Radius
	if (isset($_POST['wpgmza_store_locator_radii'])) { $wpgmza_data['wpgmza_store_locator_radii'] = sanitize_text_field($_POST['wpgmza_store_locator_radii']); }

	if (isset($_POST['wpgmza_settings_enable_usage_tracking'])) { $wpgmza_data['wpgmza_settings_enable_usage_tracking'] = sanitize_text_field($_POST['wpgmza_settings_enable_usage_tracking']); }

	$wpgmza_data = apply_filters("wpgooglemaps_filter_save_settings",$wpgmza_data);

	update_option('WPGMZA_OTHER_SETTINGS', $wpgmza_data);

	if( isset( $_POST['wpgmza_google_maps_api_key'] ) ){ update_option( 'wpgmza_google_maps_api_key', sanitize_text_field( trim($_POST['wpgmza_google_maps_api_key'] )) ); }
	
	if($_POST['wpgmza_settings_marker_pull'] == 1)
        wpgmaps_update_all_xml_file();

	wp_redirect(get_admin_url() . 'admin.php?page=wp-google-maps-menu-settings');
	exit;
}

/**
 * Handles the bulk of the POST data for the plugin
 * @return void
 */
function wpgmaps_head() {

	global $wpgmza;
    global $wpgmza_tblname_maps;
    global $wpgmza_version;

    /* deprecated in version 6.0.30 as GoDaddy have added a "flush cache" feature */
    /*
    $checker = get_dropins();
    if (isset($checker['object-cache.php'])) {
	echo "<div id=\"message\" class=\"error\"><p>".__("Please note: <strong>WP Google Maps will not function correctly while using APC Object Cache.</strong> We have found that GoDaddy hosting packages automatically include this with their WordPress hosting packages. Please email GoDaddy and ask them to remove the object-cache.php from your wp-content/ directory.","wp-google-maps")."</p></div>";
    }
     * 
     */

    if ((isset($_GET['page']) && $_GET['page'] == "wp-google-maps-menu") || (isset($_GET['page']) && $_GET['page'] == "wp-google-maps-menu-settings")) {
        wpgmaps_folder_check();
    }
    
    
    if (isset($_POST['wpgmza_savemap'])){
        global $wpdb;

        

        $map_id = intval(sanitize_text_field($_POST['wpgmza_id']));
        $map_title = sanitize_text_field(esc_attr($_POST['wpgmza_title']));
        $map_height = sanitize_text_field($_POST['wpgmza_height']);
        $map_width = sanitize_text_field($_POST['wpgmza_width']);
        $map_width_type = sanitize_text_field($_POST['wpgmza_map_width_type']);
        if ($map_width_type == "%") { $map_width_type = "\%"; }
        $map_height_type = sanitize_text_field($_POST['wpgmza_map_height_type']);
        if ($map_height_type == "%") { $map_height_type = "\%"; }
        $map_start_location = sanitize_text_field($_POST['wpgmza_start_location']);
        $map_start_zoom = intval(sanitize_text_field($_POST['wpgmza_start_zoom']));
        $type = intval(sanitize_text_field($_POST['wpgmza_map_type']));
        $alignment = intval(sanitize_text_field($_POST['wpgmza_map_align']));
        $bicycle_enabled = isset($_POST['wpgmza_bicycle']) ? 1 : 2;
        $traffic_enabled = isset($_POST['wpgmza_traffic']) ? 1 : 2;

        $map_max_zoom = intval(sanitize_text_field($_POST['wpgmza_max_zoom']));
        
        $gps = explode(",",$map_start_location);
        $map_start_lat = $gps[0];
        $map_start_lng = $gps[1];
        
        $other_settings = array();
       /*$other_settings['store_locator_enabled'] = intval(sanitize_text_field($_POST['wpgmza_store_locator']));
        $other_settings['store_locator_distance'] = intval(sanitize_text_field($_POST['wpgmza_store_locator_distance']));
        $other_settings['store_locator_bounce'] = intval(sanitize_text_field($_POST['wpgmza_store_locator_bounce']));*/

        $other_settings['store_locator_enabled'] = isset($_POST['wpgmza_store_locator']) ? 1 : 2;
        $other_settings['store_locator_distance'] = isset($_POST['wpgmza_store_locator_distance']) ? 1 : 2;

        if (isset($_POST['wpgmza_store_locator_default_radius']))
            $other_settings['store_locator_default_radius'] =  esc_attr($_POST['wpgmza_store_locator_default_radius']);
        
	    if (isset($_POST['wpgmza_store_locator_not_found_message'])) { $other_settings['store_locator_not_found_message'] = sanitize_text_field( $_POST['wpgmza_store_locator_not_found_message'] ); }
        $other_settings['store_locator_bounce'] = isset($_POST['wpgmza_store_locator_bounce']) ? 1 : 2;

        $other_settings['store_locator_query_string'] = sanitize_text_field($_POST['wpgmza_store_locator_query_string']);
        if (isset($_POST['wpgmza_store_locator_default_address'])) { $other_settings['store_locator_default_address'] = sanitize_text_field($_POST['wpgmza_store_locator_default_address']); }
        if (isset($_POST['wpgmza_store_locator_restrict'])) { $other_settings['wpgmza_store_locator_restrict'] = sanitize_text_field($_POST['wpgmza_store_locator_restrict']); }
		
		if(isset($_POST['store_locator_style']))
			$other_settings['store_locator_style'] = $_POST['store_locator_style'];
		
		if(isset($_POST['wpgmza_store_locator_radius_style']))
			$other_settings['wpgmza_store_locator_radius_style'] = $_POST['wpgmza_store_locator_radius_style'];

        $other_settings['map_max_zoom'] = sanitize_text_field($map_max_zoom);

        /* deprecated in 6.2.0
        $other_settings['weather_layer'] = intval($_POST['wpgmza_weather']);
        $other_settings['weather_layer_temp_type'] = intval($_POST['wpgmza_weather_temp_type']);
        $other_settings['cloud_layer'] = intval($_POST['wpgmza_cloud']);
        */
        $other_settings['transport_layer'] = isset($_POST['wpgmza_transport']) ? 1 : 2;
        



        if (isset($_POST['wpgmza_theme'])) { 
            $theme = intval(sanitize_text_field($_POST['wpgmza_theme']));
            $theme_data = sanitize_text_field($_POST['wpgmza_theme_data_'.$theme]);
            $other_settings['wpgmza_theme_data'] = $theme_data;
            $other_settings['wpgmza_theme_selection'] = $theme;
        }

        /* overwrite theme data if a custom theme is selected */
        if (isset($_POST['wpgmza_styling_json'])) { $other_settings['wpgmza_theme_data'] = sanitize_text_field($_POST['wpgmza_styling_json']); }

		$other_settings['wpgmza_show_points_of_interest'] = (isset($_POST['wpgmza_show_points_of_interest']) ? 1 : 0);

        $other_settings_data = maybe_serialize($other_settings);

        $data['map_default_starting_lat'] = $map_start_lat;
        $data['map_default_starting_lng'] = $map_start_lng;
        $data['map_default_height'] = $map_height;
        $data['map_default_width'] = $map_width;
        $data['map_default_zoom'] = $map_start_zoom;
        $data['map_default_max_zoom'] = $map_max_zoom;
        $data['map_default_type'] = $type;
        $data['map_default_alignment'] = $alignment;
        $data['map_default_width_type'] = $map_width_type;
        $data['map_default_height_type'] = $map_height_type;



        $rows_affected = $wpdb->query( $wpdb->prepare(
                "UPDATE $wpgmza_tblname_maps SET
                map_title = %s,
                map_width = %s,
                map_height = %s,
                map_start_lat = %f,
                map_start_lng = %f,
                map_start_location = %s,
                map_start_zoom = %d,
                type = %d,
                bicycle = %d,
                traffic = %d,
                alignment = %d,
                map_width_type = %s,
                map_height_type = %s,
                other_settings = %s
                WHERE id = %d",

                $map_title,
                $map_width,
                $map_height,
                $map_start_lat,
                $map_start_lng,
                $map_start_location,
                $map_start_zoom,
                $type,
                $bicycle_enabled,
                $traffic_enabled,
                $alignment,
                $map_width_type,
                $map_height_type,
                $other_settings_data,
                $map_id)
        );
        update_option('WPGMZA_SETTINGS', $data);
        echo "<div class='updated'>";
        _e("Your settings have been saved.","wp-google-maps");
        echo "</div>";
        if( function_exists( 'wpgmza_caching_notice_changes' ) ){
            add_action( 'admin_notices', 'wpgmza_caching_notice_changes' );
        }        

    }

    else if (isset($_POST['wpgmza_save_maker_location'])){
        global $wpdb;
        global $wpgmza_tblname;
        $mid = sanitize_text_field($_POST['wpgmaps_marker_id']);
        $wpgmaps_marker_lat = sanitize_text_field($_POST['wpgmaps_marker_lat']);
        $wpgmaps_marker_lng = sanitize_text_field($_POST['wpgmaps_marker_lng']);

        $rows_affected = $wpdb->query( $wpdb->prepare(
                "UPDATE $wpgmza_tblname SET
                lat = %s,
                lng = %s,
				latlng = {$wpgmza->spatialFunctionPrefix}GeomFromText('POINT(%f %f)')
                WHERE id = %d",

                $wpgmaps_marker_lat,
                $wpgmaps_marker_lng,
				$wpgmaps_marker_lat,
                $wpgmaps_marker_lng,
                $mid)
        );

        echo "<div class='updated'>";
        _e("Your marker location has been saved.","wp-google-maps");
        echo "</div>";


    }
    else if (isset($_POST['wpgmza_save_poly'])){
        global $wpdb;
        global $wpgmza_tblname_poly;
        $mid = sanitize_text_field($_POST['wpgmaps_map_id']);
        if (!isset($_POST['wpgmza_polygon']) || $_POST['wpgmza_polygon'] == "") {
            echo "<div class='error'>";
            _e("You cannot save a blank polygon","wp-google-maps");
            echo "</div>";
            
        } else {
            $wpgmaps_polydata = sanitize_text_field($_POST['wpgmza_polygon']);
            if ($wpgmaps_polydata !== "") {

                if (isset($_POST['poly_name'])) { $polyname = sanitize_text_field($_POST['poly_name']); } else { $polyname = "Polyline"; }
                if (isset($_POST['poly_line'])) { $linecolor = sanitize_text_field($_POST['poly_line']); } else { $linecolor = "000000"; }
                if (isset($_POST['poly_fill'])) { $fillcolor = sanitize_text_field($_POST['poly_fill']); } else { $fillcolor = "66FF00"; }
                if (isset($_POST['poly_opacity'])) { $opacity = sanitize_text_field($_POST['poly_opacity']); } else { $opacity = "0.5"; }
                if (isset($_POST['poly_line_opacity'])) { $line_opacity = sanitize_text_field($_POST['poly_line_opacity']); } else { $line_opacity = "0.5"; }
                if (isset($_POST['poly_line_hover_line_color'])) { $ohlinecolor = sanitize_text_field($_POST['poly_line_hover_line_color']); } else { $ohlinecolor = ""; }
                if (isset($_POST['poly_hover_fill_color'])) { $ohfillcolor = sanitize_text_field($_POST['poly_hover_fill_color']); } else { $ohfillcolor = ""; }
                if (isset($_POST['poly_hover_opacity'])) { $ohopacity = sanitize_text_field($_POST['poly_hover_opacity']); } else { $ohopacity = ""; }
                if (isset($_POST['wpgmza_polygon_inner'])) { $wpgmaps_polydatainner = sanitize_text_field($_POST['wpgmza_polygon_inner']); } else { $wpgmaps_polydatainner = ""; }


                $rows_affected = $wpdb->query( $wpdb->prepare(
                        "INSERT INTO $wpgmza_tblname_poly SET
                        map_id = %d,
                        polydata = %s,
                        innerpolydata = %s,
                        polyname = %s,
                        linecolor = %s,
                        lineopacity = %s,
                        fillcolor = %s,
                        opacity = %s,
                        ohlinecolor = %s,
                        ohfillcolor = %s,
                        ohopacity = %s
                        ",

                        $mid,
                        $wpgmaps_polydata,
                        $wpgmaps_polydatainner,
                        $polyname,
                        $linecolor,
                        $line_opacity,
                        $fillcolor,
                        $opacity,
                        $ohlinecolor,
                        $ohfillcolor,
                        $ohopacity
                    )
                );
                echo "<div class='updated'>";
                _e("Your polygon has been created.","wp-google-maps");
                echo "</div>";
            }
        }


    }
    else if (isset($_POST['wpgmza_edit_poly'])){
        global $wpdb;
        global $wpgmza_tblname_poly;
        $mid = sanitize_text_field($_POST['wpgmaps_map_id']);
        $pid = sanitize_text_field($_POST['wpgmaps_poly_id']);
        if (!isset($_POST['wpgmza_polygon']) || $_POST['wpgmza_polygon'] == "") {
            echo "<div class='error'>";
            _e("You cannot save a blank polygon","wp-google-maps");
            echo "</div>";
    
        } else {
            $wpgmaps_polydata = sanitize_text_field($_POST['wpgmza_polygon']);
    
            if (isset($_POST['poly_name'])) { $polyname = sanitize_text_field($_POST['poly_name']); } else { $polyname = "Polyline"; }
            if (isset($_POST['poly_line'])) { $linecolor = sanitize_text_field($_POST['poly_line']); } else { $linecolor = "000000"; }
            if (isset($_POST['poly_fill'])) { $fillcolor = sanitize_text_field($_POST['poly_fill']); } else { $fillcolor = "66FF00"; }
            if (isset($_POST['poly_opacity'])) { $opacity = sanitize_text_field($_POST['poly_opacity']); } else { $opacity = "0.5"; }
            if (isset($_POST['poly_line_opacity'])) { $line_opacity = sanitize_text_field($_POST['poly_line_opacity']); } else { $line_opacity = "0.5"; }
            if (isset($_POST['poly_line_hover_line_color'])) { $ohlinecolor = sanitize_text_field($_POST['poly_line_hover_line_color']); } else { $ohlinecolor = ""; }
            if (isset($_POST['poly_hover_fill_color'])) { $ohfillcolor = sanitize_text_field($_POST['poly_hover_fill_color']); } else { $ohfillcolor = ""; }
            if (isset($_POST['poly_hover_opacity'])) { $ohopacity = sanitize_text_field($_POST['poly_hover_opacity']); } else { $ohopacity = ""; }
            if (isset($_POST['wpgmza_polygon_inner'])) { $wpgmaps_polydatainner = sanitize_text_field($_POST['wpgmza_polygon_inner']); } else { $wpgmaps_polydatainner = ""; }
        


            $rows_affected = $wpdb->query( $wpdb->prepare(
                    "UPDATE $wpgmza_tblname_poly SET
                    polydata = %s,
                    innerpolydata = %s,
                    polyname = %s,
                    linecolor = %s,
                    lineopacity = %s,
                    fillcolor = %s,
                    opacity = %s,
                    ohlinecolor = %s,
                    ohfillcolor = %s,
                    ohopacity = %s
                    WHERE `id` = %d"
                    ,

                    $wpgmaps_polydata,
                    $wpgmaps_polydatainner,
                    $polyname,
                    $linecolor,
                    $line_opacity,
                    $fillcolor,
                    $opacity,
                    $ohlinecolor,
                    $ohfillcolor,
                    $ohopacity,
                    $pid
                )
            );
            echo "<div class='updated'>";
            _e("Your polygon has been saved.","wp-google-maps");
            echo "</div>";

        }


    }
    else if (isset($_POST['wpgmza_save_polyline'])){
        global $wpdb;
        global $wpgmza_tblname_polylines;
        $mid = sanitize_text_field($_POST['wpgmaps_map_id']);
        if (!isset($_POST['wpgmza_polyline']) || $_POST['wpgmza_polyline'] == "") {
            echo "<div class='error'>";
            _e("You cannot save a blank polyline","wp-google-maps");
            echo "</div>";
    
        } else {
            $wpgmaps_polydata = sanitize_text_field($_POST['wpgmza_polyline']);
            if ($wpgmaps_polydata !== "") {
        
        
                if (isset($_POST['poly_name'])) { $polyname = sanitize_text_field($_POST['poly_name']); } else { $polyname = ""; }
                if (isset($_POST['poly_line'])) { $linecolor = sanitize_text_field($_POST['poly_line']); } else { $linecolor = "000000"; }
                if (isset($_POST['poly_thickness'])) { $linethickness = sanitize_text_field($_POST['poly_thickness']); } else { $linethickness = "0"; }
                if (isset($_POST['poly_opacity'])) { $opacity = sanitize_text_field($_POST['poly_opacity']); } else { $opacity = "1"; }

                $rows_affected = $wpdb->query( $wpdb->prepare(
                        "INSERT INTO $wpgmza_tblname_polylines SET
                        map_id = %d,
                        polydata = %s,
                        polyname = %s,
                        linecolor = %s,
                        linethickness = %s,
                        opacity = %s
                        ",

                        $mid,
                        $wpgmaps_polydata,
                        $polyname,
                        $linecolor,
                        $linethickness,
                        $opacity
                    )
                );
                echo "<div class='updated'>";
                _e("Your polyline has been created.","wp-google-maps");
                echo "</div>";
            }
        }


    }
    else if (isset($_POST['wpgmza_edit_polyline'])){
        global $wpdb;
        global $wpgmza_tblname_polylines;
        $mid = sanitize_text_field($_POST['wpgmaps_map_id']);
        $pid = sanitize_text_field($_POST['wpgmaps_poly_id']);
        if (!isset($_POST['wpgmza_polyline']) || $_POST['wpgmza_polyline'] == "") {
            echo "<div class='error'>";
            _e("You cannot save a blank polyline","wp-google-maps");
            echo "</div>";
    
        } else {
            $wpgmaps_polydata = sanitize_text_field($_POST['wpgmza_polyline']);
            if (isset($_POST['poly_name'])) { $polyname = sanitize_text_field($_POST['poly_name']); } else { $polyname = ""; }
            if (isset($_POST['poly_line'])) { $linecolor = sanitize_text_field($_POST['poly_line']); } else { $linecolor = "000000"; }
            if (isset($_POST['poly_thickness'])) { $linethickness = sanitize_text_field($_POST['poly_thickness']); } else { $linethickness = "0"; }
            if (isset($_POST['poly_opacity'])) { $opacity = sanitize_text_field($_POST['poly_opacity']); } else { $opacity = "1"; }

            $rows_affected = $wpdb->query( $wpdb->prepare(
                    "UPDATE $wpgmza_tblname_polylines SET
                    polydata = %s,
                    polyname = %s,
                    linecolor = %s,
                    linethickness = %s,
                    opacity = %s
                    WHERE `id` = %d"
                    ,

                    $wpgmaps_polydata,
                    $polyname,
                    $linecolor,
                    $linethickness,
                    $opacity,
                    $pid
                )
            );
            echo "<div class='updated'>";
            _e("Your polyline has been saved.","wp-google-maps");
            echo "</div>";
        }


    }
	else if (isset($_POST['wpgmza_save_circle'])){
        global $wpdb;
        global $wpgmza_tblname_circles;
        
		$center = preg_replace('/[(),]/', '', $_POST['center']);
		
		if(isset($_POST['circle_id']))
		{
			$stmt = $wpdb->prepare("
				UPDATE $wpgmza_tblname_circles SET
				center = {$wpgmza->spatialFunctionPrefix}GeomFromText(%s),
				name = %s,
				color = %s,
				opacity = %f,
				radius = %f
				WHERE id = %d
			", array(
				"POINT($center)",
				$_POST['circle_name'],
				$_POST['circle_color'],
				$_POST['circle_opacity'],
				$_POST['circle_radius'],
				$_POST['circle_id']
			));
		}
		else
		{
			$stmt = $wpdb->prepare("
				INSERT INTO $wpgmza_tblname_circles
				(center, map_id, name, color, opacity, radius)
				VALUES
				({$wpgmza->spatialFunctionPrefix}GeomFromText(%s), %d, %s, %s, %f, %f)
			", array(
				"POINT($center)",
				$_POST['wpgmaps_map_id'],
				$_POST['circle_name'],
				$_POST['circle_color'],
				$_POST['circle_opacity'],
				$_POST['circle_radius']
			));
		}
		
		$wpdb->query($stmt);
		
		?>
		<script type='text/javascript'>
		
		jQuery(function($) {
			window.location.reload();
		});
		
		</script>
		<?php
		
    }
	else if (isset($_POST['wpgmza_save_rectangle'])){
        global $wpdb;
        global $wpgmza_tblname_rectangles;
        
		$m = null;
		preg_match_all('/-?\d+(\.\d+)?/', $_POST['bounds'], $m);
		
		$north = $m[0][0];
		$east = $m[0][1];
		$south = $m[0][2];
		$west = $m[0][3];
		
		$cornerA = "POINT($north $east)";
		$cornerB = "POINT($south $west)";
		
		if(isset($_POST['rectangle_id']))
		{
			$stmt = $wpdb->prepare("
				UPDATE $wpgmza_tblname_rectangles SET
				name = %s,
				color = %s,
				opacity = %f,
				cornerA = {$wpgmza->spatialFunctionPrefix}GeomFromText(%s),
				cornerB = {$wpgmza->spatialFunctionPrefix}GeomFromText(%s)
				WHERE id = %d
			", array(
				$_POST['rectangle_name'],
				$_POST['rectangle_color'],
				$_POST['rectangle_opacity'],
				$cornerA,
				$cornerB,
				$_POST['rectangle_id']
			));
		}
		else
		{
			$stmt = $wpdb->prepare("
				INSERT INTO $wpgmza_tblname_rectangles
				(map_id, name, color, opacity, cornerA, cornerB)
				VALUES
				(%d, %s, %s, %f, {$wpgmza->spatialFunctionPrefix}GeomFromText(%s), {$wpgmza->spatialFunctionPrefix}GeomFromText(%s))
			", array(
				$_POST['wpgmaps_map_id'],
				$_POST['rectangle_name'],
				$_POST['rectangle_color'],
				$_POST['rectangle_opacity'],
				$cornerA,
				$cornerB
			));
		}
		
		$rows = $wpdb->query($stmt);
		
		?>
		<script type='text/javascript'>
		
		jQuery(function($) {
			window.location.reload();
		});
		
		</script>
		<?php
    }
    else if (isset($_POST['wpgmza_save_settings']) && current_user_can('administrator')){
        


    }
    

    



}

/**
 * Sends feedback to CC server
 * @return void
 */
function wpgmaps_feedback_head() {
        
    if( isset( $_POST['wpgmza_savemap'] ) ){

        $wpgmza_settings = get_option('WPGMZA_OTHER_SETTINGS');
            
        if( isset( $wpgmza_settings['wpgmza_settings_enable_usage_tracking'] ) && $wpgmza_settings['wpgmza_settings_enable_usage_tracking'] == 'yes' ){

            $map_id = sanitize_text_field($_POST['wpgmza_id']);

            wpgmza_track_usage( $map_id );

        }
        
    }

    
    if (isset($_POST['wpgmza_save_feedback'])) {
        
        global $wpgmza_pro_version;
        global $wpgmza_global_array;
        if (function_exists('curl_version')) {
            
            $request_url = "http://www.wpgmaps.com/apif/rec.php";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $request_url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);
            curl_setopt($ch, CURLOPT_REFERER, $_SERVER['HTTP_HOST']);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $output = curl_exec($ch);
            
            curl_close($ch);
            $wpgmza_global_array['message'] = __('Thank you for your feedback!','wp-google-maps');
            $wpgmza_global_array['code'] = '100';
        } else {
            
            $wpgmza_global_array['message'] = __('Thank you for your feedback!','wp-google-maps');
            $wpgmza_global_array['code'] = '100';
        }
        
    }
    
    
}

/**
 * POST handling for version 5.24 or less
 * @return void
 */
function wpgmaps_head_old() {
    global $wpgmza_tblname_maps;
    if (isset($_POST['wpgmza_savemap'])){
        global $wpdb;


        $map_id = sanitize_text_field($_POST['wpgmza_id']);
        $map_title = sanitize_text_field($_POST['wpgmza_title']);
        $map_height = sanitize_text_field($_POST['wpgmza_height']);
        $map_width = sanitize_text_field($_POST['wpgmza_width']);


        $map_width_type = sanitize_text_field($_POST['wpgmza_map_width_type']);
        if ($map_width_type == "%") { $map_width_type = "\%"; }
        $map_height_type = sanitize_text_field($_POST['wpgmza_map_height_type']);
        if ($map_height_type == "%") { $map_height_type = "\%"; }
        $map_start_location = sanitize_text_field($_POST['wpgmza_start_location']);
        $map_start_zoom = intval($_POST['wpgmza_start_zoom']);
        $type = intval($_POST['wpgmza_map_type']);
        $alignment = intval($_POST['wpgmza_map_align']);
        $order_markers_by = intval($_POST['wpgmza_order_markers_by']);
        $order_markers_choice = intval($_POST['wpgmza_order_markers_choice']);
        $show_user_location = intval($_POST['wpgmza_show_user_location']);
        $directions_enabled = intval($_POST['wpgmza_directions']);
        $bicycle_enabled = intval($_POST['wpgmza_bicycle']);
        $traffic_enabled = intval($_POST['wpgmza_traffic']);
        $dbox = intval($_POST['wpgmza_dbox']);
        $dbox_width = sanitize_text_field($_POST['wpgmza_dbox_width']);
        $default_to = sanitize_text_field($_POST['wpgmza_default_to']);
        $listmarkers = intval($_POST['wpgmza_listmarkers']);
        $listmarkers_advanced = intval($_POST['wpgmza_listmarkers_advanced']);
        $filterbycat = intval($_POST['wpgmza_filterbycat']);


        $gps = explode(",",$map_start_location);
        $map_start_lat = $gps[0];
        $map_start_lng = $gps[1];
        $map_default_marker = sanitize_text_field($_POST['upload_default_marker']);
        $kml = sanitize_text_field($_POST['wpgmza_kml']);
        $fusion = sanitize_text_field($_POST['wpgmza_fusion']);

        $data['map_default_starting_lat'] = $map_start_lat;
        $data['map_default_starting_lng'] = $map_start_lng;
        $data['map_default_height'] = $map_height;
        $data['map_default_width'] = $map_width;
        $data['map_default_zoom'] = $map_start_zoom;
        $data['map_default_type'] = $type;
        $data['map_default_alignment'] = $alignment;
        $data['map_default_order_markers_by'] = $order_markers_by;
        $data['map_default_order_markers_choice'] = $order_markers_choice;
        $data['map_default_show_user_location'] = $show_user_location;
        $data['map_default_directions'] = $directions_enabled;
        $data['map_default_bicycle'] = $bicycle_enabled;
        $data['map_default_traffic'] = $traffic_enabled;
        $data['map_default_dbox'] = $dbox;
        $data['map_default_dbox_width'] = $dbox_width;
        $data['map_default_default_to'] = $default_to;
        $data['map_default_listmarkers'] = $listmarkers;
        $data['map_default_listmarkers_advanced'] = $listmarkers_advanced;
        $data['map_default_filterbycat'] = $filterbycat;
        $data['map_default_marker'] = $map_default_marker;
        $data['map_default_width_type'] = $map_width_type;
        $data['map_default_height_type'] = $map_height_type;





        $rows_affected = $wpdb->query( $wpdb->prepare(
                "UPDATE $wpgmza_tblname_maps SET
                map_title = %s,
                map_width = %s,
                map_height = %s,
                map_start_lat = %f,
                map_start_lng = %f,
                map_start_location = %s,
                map_start_zoom = %d,
                default_marker = %s,
                type = %d,
                alignment = %d,
                order_markers_by = %d,
                order_markers_choice = %d,
                show_user_location = %d,
                directions_enabled = %d,
                kml = %s,
                bicycle = %d,
                traffic = %d,
                dbox = %d,
                dbox_width = %s,
                default_to = %s,
                listmarkers = %d,
                listmarkers_advanced = %d,
                filterbycat = %d,
                fusion = %s,
                map_width_type = %s,
                map_height_type = %s
                WHERE id = %d",

                $map_title,
                $map_width,
                $map_height,
                $map_start_lat,
                $map_start_lng,
                $map_start_location,
                $map_start_zoom,
                $map_default_marker,
                $type,
                $alignment,
                $order_markers_by,
                $order_markers_choice,
                $show_user_location,
                $directions_enabled,
                $kml,
                $bicycle_enabled,
                $traffic_enabled,
                $dbox,
                $dbox_width,
                $default_to,
                $listmarkers,
                $listmarkers_advanced,
                $filterbycat,
                $fusion,
                $map_width_type,
                $map_height_type,
                $map_id)
        );



        update_option('WPGMZA_SETTINGS', $data);


        echo "<div class='updated'>";
        _e("Your settings have been saved.","wp-google-maps");
        echo "</div>";

    }

    else if (isset($_POST['wpgmza_save_maker_location'])){
        global $wpdb;
        global $wpgmza_tblname;
        $mid = sanitize_text_field($_POST['wpgmaps_marker_id']);
        $wpgmaps_marker_lat = sanitize_text_field($_POST['wpgmaps_marker_lat']);
        $wpgmaps_marker_lng = sanitize_text_field($_POST['wpgmaps_marker_lng']);

        $rows_affected = $wpdb->query( $wpdb->prepare(
                "UPDATE $wpgmza_tblname SET
                lat = %s,
                lng = %s,
				latlng = {$wpgmza->spatialFunctionPrefix}GeomFromText('POINT(%f %f)')
                WHERE id = %d",

                $wpgmaps_marker_lat,
                $wpgmaps_marker_lng,
				$wpgmaps_marker_lat,
                $wpgmaps_marker_lng,
                $mid)
        );





        echo "<div class='updated'>";
        _e("Your marker location has been saved.","wp-google-maps");
        echo "</div>";


    }
    else if (isset($_POST['wpgmza_save_poly'])){
        global $wpdb;
        global $wpgmza_tblname_poly;
        $mid = sanitize_text_field($_POST['wpgmaps_map_id']);
        $wpgmaps_polydata = sanitize_text_field($_POST['wpgmza_polygon']);
        $wpgmaps_polydatainner = sanitize_text_field($_POST['wpgmza_polygon_inner']);
        $linecolor = sanitize_text_field($_POST['poly_line']);
        $fillcolor = sanitize_text_field($_POST['poly_fill']);
        $opacity = sanitize_text_field($_POST['poly_opacity']);

        $rows_affected = $wpdb->query( $wpdb->prepare(
                "INSERT INTO $wpgmza_tblname_poly SET
                map_id = %d,
                polydata = %s,
                innerpolydata = %s,
                linecolor = %s,
                fillcolor = %s,
                opacity = %s
                ",

                $mid,
                $wpgmaps_polydata,
                $wpgmaps_polydatainner,
                $linecolor,
                $fillcolor,
                $opacity
            )
        );
        echo "<div class='updated'>";
        _e("Your polygon has been created.","wp-google-maps");
        echo "</div>";


    }
    else if (isset($_POST['wpgmza_edit_poly'])){

        global $wpdb;
        global $wpgmza_tblname_poly;
        $mid = sanitize_text_field($_POST['wpgmaps_map_id']);
        $pid = sanitize_text_field($_POST['wpgmaps_poly_id']);
        $wpgmaps_polydata = sanitize_text_field($_POST['wpgmza_polygon']);
        $wpgmaps_polydatainner = sanitize_text_field($_POST['wpgmza_polygon_inner']);
        $linecolor = sanitize_text_field($_POST['poly_line']);
        $fillcolor = sanitize_text_field($_POST['poly_fill']);
        $opacity = sanitize_text_field($_POST['poly_opacity']);

        $rows_affected = $wpdb->query( $wpdb->prepare(
                "UPDATE $wpgmza_tblname_poly SET
                polydata = %s,
                innerpolydata = %s,
                linecolor = %s,
                fillcolor = %s,
                opacity = %s
                WHERE `id` = %d"
                ,

                $wpgmaps_polydata,
                $wpgmaps_polydatainner,
                $linecolor,
                $fillcolor,
                $opacity,
                $pid
            )
        );
        echo "<div class='updated'>";
        _e("Your polygon has been saved.","wp-google-maps");
        echo "</div>";


    }
    else if (isset($_POST['wpgmza_save_polyline'])){
        global $wpdb;
        global $wpgmza_tblname_polylines;
        $mid = sanitize_text_field($_POST['wpgmaps_map_id']);
        $wpgmaps_polydata = sanitize_text_field($_POST['wpgmza_polyline']);
        $linecolor = sanitize_text_field($_POST['poly_line']);
        $linethickness = sanitize_text_field($_POST['poly_thickness']);
        $opacity = sanitize_text_field($_POST['poly_opacity']);

        $rows_affected = $wpdb->query( $wpdb->prepare(
                "INSERT INTO $wpgmza_tblname_polylines SET
                map_id = %d,
                polydata = %s,
                linecolor = %s,
                linethickness = %s,
                opacity = %s
                ",

                $mid,
                $wpgmaps_polydata,
                $linecolor,
                $linethickness,
                $opacity
            )
        );
        echo "<div class='updated'>";
        _e("Your polyline has been created.","wp-google-maps");
        echo "</div>";


    }
    else if (isset($_POST['wpgmza_edit_polyline'])){
        global $wpdb;
        global $wpgmza_tblname_polylines;
        $mid = sanitize_text_field($_POST['wpgmaps_map_id']);
        $pid = sanitize_text_field($_POST['wpgmaps_poly_id']);
        $wpgmaps_polydata = sanitize_text_field($_POST['wpgmza_polyline']);
        $linecolor = sanitize_text_field($_POST['poly_line']);
        $linethickness = sanitize_text_field($_POST['poly_thickness']);
        $opacity = sanitize_text_field($_POST['poly_opacity']);

        $rows_affected = $wpdb->query( $wpdb->prepare(
                "UPDATE $wpgmza_tblname_polylines SET
                polydata = %s,
                linecolor = %s,
                linethickness = %s,
                opacity = %s
                WHERE `id` = %d"
                ,

                $wpgmaps_polydata,
                $linecolor,
                $linethickness,
                $opacity,
                $pid
            )
        );
        echo "<div class='updated'>";
        _e("Your polyline has been saved.","wp-google-maps");
        echo "</div>";


    }
    else if (isset($_POST['wpgmza_save_settings'])){
        global $wpdb;
        $wpgmza_data['wpgmza_settings_image_width'] = sanitize_text_field($_POST['wpgmza_settings_image_width']);
        $wpgmza_data['wpgmza_settings_image_height'] = sanitize_text_field($_POST['wpgmza_settings_image_height']);
        $wpgmza_data['wpgmza_settings_use_timthumb'] = sanitize_text_field($_POST['wpgmza_settings_use_timthumb']);
        $wpgmza_data['wpgmza_settings_infowindow_width'] = sanitize_text_field($_POST['wpgmza_settings_infowindow_width']);
        $wpgmza_data['wpgmza_settings_infowindow_links'] = sanitize_text_field($_POST['wpgmza_settings_infowindow_links']);
        $wpgmza_data['wpgmza_settings_infowindow_address'] = sanitize_text_field($_POST['wpgmza_settings_infowindow_address']);
        $wpgmza_data['wpgmza_settings_infowindow_link_text'] = sanitize_text_field($_POST['wpgmza_settings_infowindow_link_text']);
        $wpgmza_data['wpgmza_settings_map_streetview'] = sanitize_text_field($_POST['wpgmza_settings_map_streetview']);
        $wpgmza_data['wpgmza_settings_map_full_screen_control'] = sanitize_text_field($_POST['wpgmza_settings_map_full_screen_control']);
        $wpgmza_data['wpgmza_settings_map_zoom'] = sanitize_text_field($_POST['wpgmza_settings_map_zoom']);
        $wpgmza_data['wpgmza_settings_map_pan'] = sanitize_text_field($_POST['wpgmza_settings_map_pan']);
        $wpgmza_data['wpgmza_settings_map_type'] = sanitize_text_field($_POST['wpgmza_settings_map_type']);
        $wpgmza_data['wpgmza_settings_map_scroll'] = sanitize_text_field($_POST['wpgmza_settings_map_scroll']);
        $wpgmza_data['wpgmza_settings_map_draggable'] = sanitize_text_field($_POST['wpgmza_settings_map_draggable']);
        $wpgmza_data['wpgmza_settings_map_clickzoom'] = sanitize_text_field($_POST['wpgmza_settings_map_clickzoom']);
        $wpgmza_data['wpgmza_settings_ugm_striptags'] = sanitize_text_field($_POST['wpgmza_settings_map_striptags']);
        $wpgmza_data['wpgmza_settings_force_jquery'] = sanitize_text_field($_POST['wpgmza_settings_force_jquery']);
        $wpgmza_data['wpgmza_settings_markerlist_category'] = sanitize_text_field($_POST['wpgmza_settings_markerlist_category']);
        $wpgmza_data['wpgmza_settings_markerlist_icon'] = sanitize_text_field($_POST['wpgmza_settings_markerlist_icon']);
		$wpgmza_data['wpgmza_settings_markerlist_link'] = sanitize_text_field($_POST['wpgmza_settings_markerlist_link']);
        $wpgmza_data['wpgmza_settings_markerlist_title'] = sanitize_text_field($_POST['wpgmza_settings_markerlist_title']);
        $wpgmza_data['wpgmza_settings_markerlist_address'] = sanitize_text_field($_POST['wpgmza_settings_markerlist_address']);
        $wpgmza_data['wpgmza_settings_markerlist_description'] = sanitize_text_field($_POST['wpgmza_settings_markerlist_description']);
        update_option('WPGMZA_OTHER_SETTINGS', $wpgmza_data);
        echo "<div class='updated'>";
        _e("Your settings have been saved.","wp-google-maps");
        echo "</div>";


    }



}






function wpgmaps_admin_menu() {
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    
    if (isset($wpgmza_settings['wpgmza_settings_access_level'])) { $access_level = $wpgmza_settings['wpgmza_settings_access_level']; } else { $access_level = "manage_options"; }
    add_menu_page('WPGoogle Maps', __('Maps','wp-google-maps'), $access_level, 'wp-google-maps-menu', 'wpgmaps_menu_layout', wpgmaps_get_plugin_url()."images/map_app_small.png");
    
    if (function_exists('wpgmaps_menu_category_layout')) { add_submenu_page('wp-google-maps-menu', 'WP Google Maps - Categories', __('Categories','wp-google-maps'), $access_level , 'wp-google-maps-menu-categories', 'wpgmaps_menu_category_layout'); }
	
    if (function_exists('wpgmza_register_pro_version'))
	{
		add_submenu_page(
			'wp-google-maps-menu', 
			'WP Google Maps - Advanced Options', 
			__('Advanced','wp-google-maps'), 
			$access_level , 
			'wp-google-maps-menu-advanced',
			'wpgmaps_menu_advanced_layout'
		);
		
		/*add_submenu_page(
			'wp-google-maps-menu',
			'WP Google Maps - Custom Fields',
			__('Custom Fields', 'wp-google-maps'),
			$access_level,
			'wp-google-maps-menu-custom-fields',
			'WPGMZA\\show_custom_fields_page'
		);*/
	}
	
    add_submenu_page('wp-google-maps-menu', 'WP Google Maps - Settings', __('Settings','wp-google-maps'), $access_level , 'wp-google-maps-menu-settings', 'wpgmaps_menu_settings_layout');
    add_submenu_page('wp-google-maps-menu', 'WP Google Maps - Support', __('Support','wp-google-maps'), $access_level , 'wp-google-maps-menu-support', 'wpgmaps_menu_support_layout');

	
}


function wpgmaps_menu_layout() {
    
    
    
    $handle = 'avia-google-maps-api';
    $list = 'enqueued';
    if (wp_script_is( $handle, $list )) {
        wp_deregister_script('avia-google-maps-api');
    }
    
    /*check to see if we have write permissions to the plugin folder*/
    if (!isset($_GET['action'])) {
        wpgmza_map_page();
    } else {

        if ($_GET['action'] == "welcome_page" || $_GET['action'] == "credits") { } else {
            echo"<br /><div class='wpgmza-support-notice' style='float:right; display:block; width:250px; height:65px; padding:6px; text-align:center; background-color: white;  border-top: 4px solid #0073AA; margin-right:17px;'><strong>".__("Experiencing problems with the plugin?","wp-google-maps")."</strong><br /><a href='http://www.wpgmaps.com/documentation/troubleshooting/' title='WP Google Maps Troubleshooting Section' target='_BLANK'>".__("See the troubleshooting manual.","wp-google-maps")."</a> <br />".__("Or ask a question on our ","wp-google-maps")." <a href='http://www.wpgmaps.com/forums/forum/support-forum/' title='WP Google Maps Support Forum' target='_BLANK'>".__("Support forum.","wp-google-maps")."</a></div>";
        }
        if ($_GET['action'] == "trash" && isset($_GET['map_id'])) {
            if (isset( $_GET['s'] ) && $_GET['s'] == "1") {
                if (wpgmaps_trash_map(sanitize_text_field($_GET['map_id']))) {
                    echo "<script>window.location = \"".get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-menu\"</script>";
                } else {
                    _e("There was a problem deleting the map.","wp-google-maps");
                }
            } else {
                $res = wpgmza_get_map_data(sanitize_text_field($_GET['map_id']));
                echo "<h2>".__("Delete your map","wp-google-maps")."</h2><p>".__("Are you sure you want to delete the map","wp-google-maps")." <strong>\"".$res->map_title."?\"</strong> <br /><a href='?page=wp-google-maps-menu&action=trash&map_id=".sanitize_text_field($_GET['map_id'])."&s=1'>".__("Yes","wp-google-maps")."</a> | <a href='?page=wp-google-maps-menu'>".__("No","wp-google-maps")."</a></p>";
                return;
            }
        }
        if (isset($_GET['action']) && $_GET['action'] == "duplicate" && isset($_GET['map_id'])) {
            if (function_exists('wpgmaps_duplicate_map')) {    
                $new_id = wpgmaps_duplicate_map(sanitize_text_field($_GET['map_id']));
                if ($new_id > 0) {
                    wpgmza_map_page();
                } else {
                    _e("There was a problem duplicating the map.","wp-google-maps");
                    wpgmza_map_page();
                }
            }
        }
         
        else if ($_GET['action'] == "edit_marker" && isset($_GET['id'])) {

            wpgmza_edit_marker(sanitize_text_field($_GET['id']));

        }
        else if ($_GET['action'] == "add_poly" && isset($_GET['map_id'])) {

            if (function_exists("wpgmza_b_real_pro_add_poly")) {
                wpgmza_b_real_pro_add_poly(sanitize_text_field($_GET['map_id']));
            } else {
                wpgmza_b_pro_add_poly(sanitize_text_field($_GET['map_id']));
            }

        }
        else if ($_GET['action'] == "edit_poly" && isset($_GET['map_id'])) {

            if (function_exists("wpgmza_b_real_pro_edit_poly")) {
                wpgmza_b_real_pro_edit_poly(sanitize_text_field($_GET['map_id']));
            } else {
                wpgmza_b_pro_edit_poly(sanitize_text_field($_GET['map_id']));
            }
            

        }
        else if ($_GET['action'] == "add_polyline" && isset($_GET['map_id'])) {

            wpgmza_b_pro_add_polyline(sanitize_text_field($_GET['map_id']));

        }
        else if ($_GET['action'] == "edit_polyline" && isset($_GET['map_id'])) {

            wpgmza_b_pro_edit_polyline(sanitize_text_field($_GET['map_id']));
        }
        else if ($_GET['action'] == "add_heatmap" && isset($_GET['map_id'])) {
            if (function_exists("wpgmza_b_pro_add_heatmap")) { wpgmza_b_pro_add_heatmap(sanitize_text_field($_GET['map_id'])); }
        }
        else if ($_GET['action'] == "edit_heatmap" && isset($_GET['map_id'])) {
            if (function_exists("wpgmza_b_pro_edit_heatmap")) { wpgmza_b_pro_edit_heatmap(sanitize_text_field($_GET['map_id'])); }
        }
		else if ($_GET['action'] == "add_circle" && isset($_GET['map_id'])) {
			wpgmza_b_add_circle(sanitize_text_field($_GET['map_id']));
        }
		else if ($_GET['action'] == "edit_circle" && isset($_GET['map_id'])) {
            wpgmza_b_edit_circle(sanitize_text_field($_GET['map_id']));
        }
		else if ($_GET['action'] == "add_rectangle" && isset($_GET['map_id'])) {
            wpgmza_b_add_rectangle(sanitize_text_field($_GET['map_id']));
        }
		else if ($_GET['action'] == "edit_rectangle" && isset($_GET['map_id'])) {
            wpgmza_b_edit_rectangle(sanitize_text_field($_GET['map_id']));
        }
        else if ($_GET['action'] == 'welcome_page') {
            $file = dirname(__FILE__).'/base/classes/WPGM_templates.php';
            include ($file);
            $wpgmc = new WPGMAPS_templates();
            $wpgmc->welcome_page_v6();
        
        }

        else if ($_GET['action'] == 'credits') {
            $file = dirname(__FILE__).'/base/classes/WPGM_templates.php';
            include ($file);
            $wpgmc = new WPGMAPS_templates();
            $wpgmc->welcome_page_credits();
        
        }
        else {

            if (function_exists('wpgmza_register_pro_version')) {

                $prov = get_option("WPGMZA_PRO");
                $wpgmza_pro_version = $prov['version'];
                if (floatval($wpgmza_pro_version) < 5.41) {
                    wpgmaps_upgrade_notice();
                    wpgmza_pro_menu();
                } else {
                    wpgmza_pro_menu();
                }


            } else {
                wpgmza_basic_menu();

            }

        }
    }

    do_action("wpgmza_check_map_editor_backwards_compat");


}



function wpgmaps_menu_marker_layout() {

    if (!$_GET['action']) {

        wpgmza_marker_page();

    } else {
        echo"<br /><div style='float:right; display:block; width:250px; height:36px; padding:6px; text-align:center; background-color: #EEE; border: 1px solid #E6DB55; margin-right:17px;'><strong>".__("Experiencing problems with the plugin?","wp-google-maps")."</strong><br /><a href='http://www.wpgmaps.com/documentation/troubleshooting/' title='WP Google Maps Troubleshooting Section' target='_BLANK'>".__("See the troubleshooting manual.","wp-google-maps")."</a></div>";


        if ($_GET['action'] == "trash" && isset($_GET['marker_id'])) {

            if ($_GET['s'] == "1") {
                if (wpgmaps_trash_marker(sanitize_text_field($_GET['marker_id']))) {
                    echo "<script>window.location = \"".get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-marker-menu\"</script>";
                } else {
                    _e("There was a problem deleting the marker.");;
                }
            } else {
                $res = wpgmza_get_marker_data(sanitize_text_field($_GET['map_id']));
                echo "<h2>".__("Delete Marker","wp-google-maps")."</h2><p>".__("Are you sure you want to delete this marker:","wp-google-maps")." <strong>\"".$res->address."?\"</strong> <br /><a href='?page=wp-google-maps-marker-menu&action=trash&marker_id=".sanitize_text_field($_GET['marker_id'])."&s=1'>".__("Yes","wp-google-maps")."</a> | <a href='?page=wp-google-maps-marker-menu'>".__("No","wp-google-maps")."</a></p>";
            }



        }
    }

}

function wpgmaps_menu_settings_layout() {
    $my_theme = wp_get_theme();

    $name = $my_theme->get( 'Name' );
    $version = $my_theme->get( 'Version' );
    $modified_version = str_replace('.', '', $version);

    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");

    /*if( $name == 'Avada' && intval( $modified_version ) <= 393 && !isset( $wpgmza_settings['wpgmza_settings_force_jquery'] ) ){

        echo "<div class='error'><p>".__("We have detected a conflict between your current theme's version and our plugin. Should you be experiencing issues with your maps displaying, please update Avada to version 3.9.4 or check the checkbox labelled 'Over-ride current jQuery with version 1.11.3'.", "wp-google-maps")."</p></div>";

    }*/

    if (function_exists('wpgmza_register_pro_version')) {
        if (function_exists('wpgmaps_settings_page_pro')) {
            wpgmaps_settings_page_pro();
        }
    } else {
        wpgmaps_settings_page_basic();
    }
}


function wpgmaps_settings_page_basic() {
    
	global $wpgmza;
	
    wpgmza_stats("settings_basic");
    
    echo"<div class=\"wrap\"><div id=\"icon-edit\" class=\"icon32 icon32-posts-post\"><br></div><h2>".__("WP Google Map Settings","wp-google-maps")."</h2>";

    google_maps_api_key_warning();

    $wpgmza_settings = array_merge((array)$wpgmza->settings, get_option("WPGMZA_OTHER_SETTINGS"));
	
    if (isset($wpgmza_settings['wpgmza_settings_map_full_screen_control'])) { $wpgmza_settings_map_full_screen_control = $wpgmza_settings['wpgmza_settings_map_full_screen_control']; }
    if (isset($wpgmza_settings['wpgmza_settings_map_streetview'])) { $wpgmza_settings_map_streetview = $wpgmza_settings['wpgmza_settings_map_streetview']; }
    if (isset($wpgmza_settings['wpgmza_settings_map_zoom'])) { $wpgmza_settings_map_zoom = $wpgmza_settings['wpgmza_settings_map_zoom']; }
    if (isset($wpgmza_settings['wpgmza_settings_map_pan'])) { $wpgmza_settings_map_pan = $wpgmza_settings['wpgmza_settings_map_pan']; }
    if (isset($wpgmza_settings['wpgmza_settings_map_type'])) { $wpgmza_settings_map_type = $wpgmza_settings['wpgmza_settings_map_type']; }
    if (isset($wpgmza_settings['wpgmza_settings_force_jquery'])) { $wpgmza_force_jquery = $wpgmza_settings['wpgmza_settings_force_jquery']; }

    if (isset($wpgmza_settings['wpgmza_settings_remove_api'])) { $wpgmza_remove_api = $wpgmza_settings['wpgmza_settings_remove_api']; }
    if (isset($wpgmza_settings['wpgmza_force_greedy_gestures'])) { $wpgmza_force_greedy_gestures = $wpgmza_settings['wpgmza_force_greedy_gestures']; }
	
    if (isset($wpgmza_settings['wpgmza_settings_map_scroll'])) { $wpgmza_settings_map_scroll = $wpgmza_settings['wpgmza_settings_map_scroll']; }
    if (isset($wpgmza_settings['wpgmza_settings_map_draggable'])) { $wpgmza_settings_map_draggable = $wpgmza_settings['wpgmza_settings_map_draggable']; }
    if (isset($wpgmza_settings['wpgmza_settings_map_clickzoom'])) { $wpgmza_settings_map_clickzoom = $wpgmza_settings['wpgmza_settings_map_clickzoom']; }
    if (isset($wpgmza_settings['wpgmza_custom_css'])) { $wpgmza_custom_css = $wpgmza_settings['wpgmza_custom_css']; } else { $wpgmza_custom_css  = ""; }
	if (isset($wpgmza_settings['wpgmza_custom_js'])) { $wpgmza_custom_js = $wpgmza_settings['wpgmza_custom_js']; } else { $wpgmza_custom_js  = ""; }
    
    $wpgmza_settings_map_open_marker_by_checked[0] = "";
    $wpgmza_settings_map_open_marker_by_checked[1] = "";
    if (isset($wpgmza_settings['wpgmza_settings_map_open_marker_by'])) { $wpgmza_settings_map_open_marker_by = $wpgmza_settings['wpgmza_settings_map_open_marker_by']; } else { $wpgmza_settings_map_open_marker_by = false; }
    if ($wpgmza_settings_map_open_marker_by == '1') { $wpgmza_settings_map_open_marker_by_checked[0] = "checked='checked'"; }
    else if ($wpgmza_settings_map_open_marker_by == '2') { $wpgmza_settings_map_open_marker_by_checked[1] = "checked='checked'"; }
    else { $wpgmza_settings_map_open_marker_by_checked[0] = "checked='checked'"; }
    
	$wpgmza_settings_disable_infowindows = '';
	if(!empty($wpgmza_settings['wpgmza_settings_disable_infowindows']))
		$wpgmza_settings_disable_infowindows = ' checked="checked"';
	
    $show_advanced_marker_tr = 'style="visibility:hidden; display:none;"';
    $wpgmza_settings_marker_pull_checked[0] = "";
    $wpgmza_settings_marker_pull_checked[1] = "";
    if (isset($wpgmza_settings['wpgmza_settings_marker_pull'])) { $wpgmza_settings_marker_pull = $wpgmza_settings['wpgmza_settings_marker_pull']; } else { $wpgmza_settings_marker_pull = false; }
    if ($wpgmza_settings_marker_pull == '0' || $wpgmza_settings_marker_pull == 0) { $wpgmza_settings_marker_pull_checked[0] = "checked='checked'"; $show_advanced_marker_tr = 'style="visibility:hidden; display:none;"'; }
    else if ($wpgmza_settings_marker_pull == '1' || $wpgmza_settings_marker_pull == 1) { $wpgmza_settings_marker_pull_checked[1] = "checked='checked'";  $show_advanced_marker_tr = 'style="visibility:visible; display:table-row;"'; }
    else { $wpgmza_settings_marker_pull_checked[0] = "checked='checked'"; $show_advanced_marker_tr = 'style="visibility:hidden; display:none;"'; }   
    
    
    
    

    $wpgmza_access_level_checked[0] = "";
    $wpgmza_access_level_checked[1] = "";
    $wpgmza_access_level_checked[2] = "";
    $wpgmza_access_level_checked[3] = "";
    $wpgmza_access_level_checked[4] = "";
    if (isset($wpgmza_settings['wpgmza_settings_access_level'])) { $wpgmza_access_level = $wpgmza_settings['wpgmza_settings_access_level']; } else { $wpgmza_access_level = ""; }
    if ($wpgmza_access_level == "manage_options") { $wpgmza_access_level_checked[0] = "selected"; }
    else if ($wpgmza_access_level == "edit_pages") { $wpgmza_access_level_checked[1] = "selected"; }
    else if ($wpgmza_access_level == "edit_published_posts") { $wpgmza_access_level_checked[2] = "selected"; }
    else if ($wpgmza_access_level == "edit_posts") { $wpgmza_access_level_checked[3] = "selected"; }
    else if ($wpgmza_access_level == "read") { $wpgmza_access_level_checked[4] = "selected"; }
    else { $wpgmza_access_level_checked[0] = "selected"; }
    
    if (isset($wpgmza_settings_map_scroll)) { if ($wpgmza_settings_map_scroll == "yes") { $wpgmza_scroll_checked = "checked='checked'"; } else { $wpgmza_scroll_checked = ""; } } else { $wpgmza_scroll_checked = ""; }
    if (isset($wpgmza_settings_map_draggable)) { if ($wpgmza_settings_map_draggable == "yes") { $wpgmza_draggable_checked = "checked='checked'"; } else { $wpgmza_draggable_checked = ""; } } else { $wpgmza_draggable_checked = ""; }
    if (isset($wpgmza_settings_map_clickzoom)) { if ($wpgmza_settings_map_clickzoom == "yes") { $wpgmza_clickzoom_checked = "checked='checked'"; } else { $wpgmza_clickzoom_checked = ""; } } else { $wpgmza_clickzoom_checked = ""; }

    
    if (isset($wpgmza_settings_map_full_screen_control)) { if ($wpgmza_settings_map_full_screen_control == "yes") { $wpgmza_fullscreen_checked = "checked='checked'"; }  else { $wpgmza_fullscreen_checked = ""; } }  else { $wpgmza_fullscreen_checked = ""; }
    if (isset($wpgmza_settings_map_streetview)) { if ($wpgmza_settings_map_streetview == "yes") { $wpgmza_streetview_checked = "checked='checked'"; }  else { $wpgmza_streetview_checked = ""; } }  else { $wpgmza_streetview_checked = ""; }
    if (isset($wpgmza_settings_map_zoom)) { if ($wpgmza_settings_map_zoom == "yes") { $wpgmza_zoom_checked = "checked='checked'"; } else { $wpgmza_zoom_checked = ""; } } else { $wpgmza_zoom_checked = ""; }
    if (isset($wpgmza_settings_map_pan)) { if ($wpgmza_settings_map_pan == "yes") { $wpgmza_pan_checked = "checked='checked'"; } else { $wpgmza_pan_checked = ""; } } else { $wpgmza_pan_checked = ""; }
    if (isset($wpgmza_settings_map_type)) { if ($wpgmza_settings_map_type == "yes") { $wpgmza_type_checked = "checked='checked'"; } else { $wpgmza_type_checked = ""; } } else { $wpgmza_type_checked = ""; }
    if (isset($wpgmza_force_jquery)) { if ($wpgmza_force_jquery == "yes") { $wpgmza_force_jquery_checked = "checked='checked'"; } else { $wpgmza_force_jquery_checked = ""; } } else { $wpgmza_force_jquery_checked = ""; }

    if (isset($wpgmza_remove_api)) { if ($wpgmza_remove_api == "yes") { $wpgmza_remove_api_checked = "checked='checked'"; } else { $wpgmza_remove_api_checked = ""; } } else { $wpgmza_remove_api_checked = ""; }

    if (isset($wpgmza_force_greedy_gestures)) { if ($wpgmza_force_greedy_gestures == "yes") { $wpgmza_force_greedy_gestures_checked = "checked='checked'"; } else { $wpgmza_force_greedy_gestures_checked = ""; } } else { $wpgmza_force_greedy_gestures_checked = ""; }
    

    if (isset($wpgmza_settings['wpgmza_settings_enable_usage_tracking'])) { 
        if ($wpgmza_settings['wpgmza_settings_enable_usage_tracking'] == "yes") { 
            $wpgmza_settings_enable_usage_tracking = "checked='checked'"; 
        } else { 
            $wpgmza_settings_enable_usage_tracking = ""; 
        } 
    } else { 
        $wpgmza_settings_enable_usage_tracking = ""; 
    }

    if (function_exists('wpgmza_register_pro_version')) {
        $pro_settings1 = wpgmaps_settings_page_sub('infowindow');
        $prov = get_option("WPGMZA_PRO");
        $wpgmza_pro_version = $prov['version'];
        if (floatval($wpgmza_pro_version) < 3.9) {
            $prov_msg = "<div class='error below-h1'><p>Please note that these settings will only work with the Pro Addon version 3.9 and above. Your current version is $wpgmza_pro_version. To download the latest version, please email <a href='mailto:nick@wpgmaps.com'>nick@wpgmaps.com</a></p></div>";
        }
    } else {
        $pro_settings1 = "";
        $prov_msg = "";
    }    

    $marker_location = wpgmza_return_marker_path();
    $marker_url = wpgmza_return_marker_url();
    
    
    $wpgmza_file_perms = substr(sprintf('%o', @fileperms($marker_location)), -4);
    $fpe = false;
    $fpe_error = "";
    if ($wpgmza_file_perms == "0777" || $wpgmza_file_perms == "0755" || $wpgmza_file_perms == "0775" || $wpgmza_file_perms == "0705" || $wpgmza_file_perms == "2777" || $wpgmza_file_perms == "2755" || $wpgmza_file_perms == "2775" || $wpgmza_file_perms == "2705") { 
        $fpe = true;
        $fpe_error = "";
    }
    else if ($wpgmza_file_perms == "0") {
        $fpe = false;
        $fpe_error = __("This folder does not exist. Please create it.","wp-google-maps"). " ($marker_location)";
    } else { 
        $fpe = false;
        $fpe_error = __("File Permissions:","wp-google-maps").$wpgmza_file_perms." ".__(" - The plugin does not have write access to this folder. Please CHMOD this folder to 755 or 777, or change the location","wp-google-maps");
    }
    
    if (!$fpe) {
        $wpgmza_file_perms_check = "<span style='color:red;'>$fpe_error</span>";
    } else {
        $wpgmza_file_perms_check = "<span style='color:green;'>$fpe_error</span>";
        
    }

    // Get the Store Locator Radius option
	global $wpgmza_default_store_locator_radii;
	$wpgmza_store_locator_radii = implode(',', $wpgmza_default_store_locator_radii);
	
    if (!empty($wpgmza_settings['wpgmza_store_locator_radii']))
        $wpgmza_store_locator_radii = $wpgmza_settings['wpgmza_store_locator_radii'];
	
    $upload_dir = wp_upload_dir();
    
        $map_settings_action = '';
		
            $ret = "<form action='" . get_admin_url() . "admin-post.php' method='post' id='wpgmaps_options'>";
			$ret .= '<input name="action" value="wpgmza_settings_page_post" type="hidden"/>';
            $ret .= "    <p>$prov_msg</p>";


            $ret .= "    <div id=\"wpgmaps_tabs\">";
            $ret .= "        <ul>";
            $ret .= "                <li><a href=\"#tabs-1\">".__("Maps","wp-google-maps")."</a></li>";
            $ret .= "                <li><a href=\"#tabs-2\">".__("InfoWindows","wp-google-maps")."</a></li>";
            $ret .= "                <li><a href=\"#tabs-3\">".__("Marker Listing","wp-google-maps")."</a></li>";
            $ret .= "                <li><a href=\"#tabs-4\">".__("Store Locator","wp-google-maps")."</a></li>";
            $ret .= "                <li><a href=\"#tabs-5\">".__("Advanced","wp-google-maps")."</a></li>";
			
			$ret .= apply_filters('wpgmza_global_settings_tabs', '');
			
            $ret .= "        </ul>";
            $ret .= "        <div id=\"tabs-1\">";
            $ret .= "                <h3>".__("Map Settings")."</h3>";
            $ret .= "                <table class='form-table'>";
            $ret .= "                <tr>";
            $ret .= "                     <td width='200' valign='top' style='vertical-align:top;'>".__("General Map Settings","wp-google-maps").":</td>";
            $ret .= "                     <td>";
            $ret .= "                            <div class='switch'><input name='wpgmza_settings_map_full_screen_control' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' id='wpgmza_settings_map_full_screen_control' value='yes' $wpgmza_fullscreen_checked /> <label for='wpgmza_settings_map_full_screen_control'></label></div>".__("Disable Full Screen Control")."<br />";
            $ret .= "                            
			
			<div data-required-maps-engine='google-maps'>
				<div class='switch'>
					<input 
						name='wpgmza_settings_map_streetview' 
						type='checkbox' 
						class='cmn-toggle cmn-toggle-round-flat' 
						id='wpgmza_settings_map_streetview' 
						value='yes' 
						$wpgmza_streetview_checked /> 
					<label for='wpgmza_settings_map_streetview'></label>
				</div>"
				.__("Disable StreetView")."
			</div>
			
			";
				
				
            $ret .= "                            <div class='switch'><input name='wpgmza_settings_map_zoom' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' id='wpgmza_settings_map_zoom' value='yes' $wpgmza_zoom_checked /> <label for='wpgmza_settings_map_zoom'></label></div>".__("Disable Zoom Controls")."<br />";
			
            $ret .= "                            
			
			<div data-required-maps-engine='google-maps'>
				<div class='switch'><input name='wpgmza_settings_map_pan' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' id='wpgmza_settings_map_pan' value='yes' $wpgmza_pan_checked /> 
					<label for='wpgmza_settings_map_pan'></label>
				</div>".__("Disable Pan Controls")."
			</div>
				
			";
			
            $ret .= "
			
			<div data-required-maps-engine='google-maps'>
				<div class='switch'>
					<input 
						name='wpgmza_settings_map_type' 
						type='checkbox' 
						class='cmn-toggle cmn-toggle-round-flat' 
						id='wpgmza_settings_map_type' 
						value='yes' 
						$wpgmza_type_checked /> 
					<label for='wpgmza_settings_map_type'></label>
				</div>"
				.__("Disable Map Type Controls")."
			</div>
			
			";
			
            $ret .= "                            <div class='switch'><input name='wpgmza_settings_map_scroll' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' id='wpgmza_settings_map_scroll' value='yes' $wpgmza_scroll_checked /> <label for='wpgmza_settings_map_scroll'></label></div>".__("Disable Mouse Wheel Zoom","wp-google-maps")."<br />";
            $ret .= "                            <div class='switch'><input name='wpgmza_settings_map_draggable' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' id='wpgmza_settings_map_draggable' value='yes' $wpgmza_draggable_checked /> <label for='wpgmza_settings_map_draggable'></label></div>".__("Disable Mouse Dragging","wp-google-maps")."<br />";
            $ret .= "                            <div class='switch'><input name='wpgmza_settings_map_clickzoom' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' id='wpgmza_settings_map_clickzoom' value='yes' $wpgmza_clickzoom_checked /> <label for='wpgmza_settings_map_clickzoom'></label></div>".__("Disable Mouse Double Click Zooming","wp-google-maps")."<br />";

            $ret .= "                    </td>";
            $ret .= "                 </tr>";
            $ret .= "               <tr>";
            $ret .= "                        <td width='200' valign='top'>".__("Troubleshooting Options","wp-google-maps").":</td>";

            $ret .= "                     <td>";
            $ret .= "           
			
			<div data-required-maps-engine='google-maps'>
				<div class='switch'>
					<input name='wpgmza_settings_remove_api' 
						type='checkbox' 
						class='cmn-toggle cmn-toggle-yes-no' 
						id='wpgmza_settings_remove_api' 
						value='yes' 
						$wpgmza_remove_api_checked /> 
					<label for='wpgmza_settings_remove_api' 
						data-on='".__("Yes", "wp-google-maps")."' 
						data-off='".__("No", "wp-google-maps")."'>
					</label>
				</div> ".__("Do not load the Google Maps API (Only check this if your theme loads the Google Maps API by default)", 'wp-google-maps')."<br />
			</div>
			
			";
			
            $ret .= "                    </td>";
            $ret .= "                </tr>";
			
			$use_fontawesome = (isset($wpgmza_settings['use_fontawesome']) ? $wpgmza_settings['use_fontawesome'] : '4.*');
			$use_fontawesome_5_selected		= ($use_fontawesome == '5.*' ? 'selected="selected"' : '');
			$use_fontawesome_4_selected		= ($use_fontawesome == '4.*' ? 'selected="selected"' : '');
			$use_fontawesome_none_selected	= ($use_fontawesome == 'none' ? 'selected="selected"' : '');
			
			$ret .= "
			
			<tr>
				<td>
					" . __("Use FontAwesome:", "wp-google-maps") . "
				</td>
				<td>
					<select name='wpgmza_use_fontawesome'>
						<option value='5.*' $use_fontawesome_5_selected>5.*</option>
						<option value='4.*' $use_fontawesome_4_selected>4.*</option>
						<option value='none' $use_fontawesome_none_selected>" . __("None", "wp-google-maps") . "</option>
					</select>
				</td>
			</tr>
			
			";
			
			$use_google_maps_selected			= (empty($wpgmza_settings['wpgmza_maps_engine']) || $wpgmza_settings['wpgmza_maps_engine'] == 'google-maps' ? 'selected="selected"' : "");
			$use_open_street_map_selected 		= (isset($wpgmza_settings['wpgmza_maps_engine']) && $wpgmza_settings['wpgmza_maps_engine'] == 'open-layers' ? 'selected="selected"' : "");
			
			$ret .= "
			
			<tr>
				<td>
					" . __("Maps Engine:", "wp-google-maps") . "
				</td>
				<td>
					<select name='wpgmza_maps_engine'>
						<option $use_open_street_map_selected value='open-layers'>OpenLayers</option>
						<option $use_google_maps_selected value='google-maps'>Google Maps</option>
					</select>
				</td>
			</tr>
			
			";
			
			if(isset($wpgmza_settings['wpgmza_maps_engine']) && $wpgmza_settings['wpgmza_maps_engine'] == 'open-layers')
			{
				$tileServerSelect = new WPGMZA\DOMDocument();
				$tileServerSelect->loadPHPFile(plugin_dir_path(__FILE__) . 'html/tile-server-fieldset.html.php');
				// TODO: In Pro, check this property exists
				
				if(isset($wpgmza_settings['tile_server_url']))
				{
					$option = $tileServerSelect->querySelector('option[value="' . $wpgmza_settings['tile_server_url'] . '"]');
					if($option)
						$option->setAttribute('selected', 'selected');
				}
				
				$ret .= $tileServerSelect->html;
			}
			
			$api_loader = new WPGMZA\GoogleMapsAPILoader();
			$ret .= $api_loader->getSettingsHTML();
			
			global $wpgmza;
			$developer_mode_checked = '';
			
			if($wpgmza->settings->developer_mode)
				$developer_mode_checked = 'checked="checked"';
			
            $ret .= "                <tr>";
            $ret .= "                        <td width='200' valign='top'>".__("Lowest level of access to the map editor","wp-google-maps").":</td>";
            $ret .= "                     <td>";
            $ret .= "                        <select id='wpgmza_access_level' name='wpgmza_access_level'  >";
            $ret .= "                                    <option value=\"manage_options\" ".$wpgmza_access_level_checked[0].">Admin</option>";
            $ret .= "                                    <option value=\"edit_pages\" ".$wpgmza_access_level_checked[1].">Editor</option>";
            $ret .= "                                    <option value=\"edit_published_posts\" ".$wpgmza_access_level_checked[2].">Author</option>";
            $ret .= "                                    <option value=\"edit_posts\" ".$wpgmza_access_level_checked[3].">Contributor</option>";
            $ret .= "                                    <option value=\"read\" ".$wpgmza_access_level_checked[4].">Subscriber</option>";
            $ret .= "                        </select>    ";
            $ret .= "                    </td>";
            $ret .= "                </tr>";

            $ret .= "               <tr>";
            $ret .= "                        <td width='200' valign='top'>".__("Enable Usage Tracking","wp-google-maps").":</td>";
            $ret .= "                     <td>";
            $ret .= "                           <div class='switch'><input name='wpgmza_settings_enable_usage_tracking' type='checkbox' class='cmn-toggle cmn-toggle-yes-no' id='wpgmza_settings_enable_usage_tracking' value='yes' $wpgmza_settings_enable_usage_tracking /> <label for='wpgmza_settings_enable_usage_tracking' data-on='".__("Yes", "wp-google-maps")."' data-off='".__("No", "wp-google-maps")."'></label></div> ".__("Allow us to anonymously track how you use your maps and we will send you a 15% Sola Plugins coupon as a token of our gratitude (Coupon will be sent to the administrator's email address)", 'wp-google-maps')."<br />";
            $ret .= "                       <input type='hidden' id='wpgmza_admin_email_coupon' value='".get_option('admin_email')."' />";
            $ret .= "                    </td>";
            $ret .= "                </tr>";

            $ret .= "               <tr>";
            $ret .= "                        <td width='200' valign='top'>".__("Disable Two-Finger Pan","wp-google-maps").":</td>";
            $ret .= "                     <td>";
            $ret .= "                           <div class='switch wpgmza-open-layers-feature-unavailable'><input name='wpgmza_force_greedy_gestures' type='checkbox' class='cmn-toggle cmn-toggle-yes-no' id='wpgmza_force_greedy_gestures' value='yes' $wpgmza_force_greedy_gestures_checked /> <label for='wpgmza_force_greedy_gestures' data-on='".__("Yes", "wp-google-maps")."' data-off='".__("No", "wp-google-maps")."'></label></div> " . __("Removes the need to use two fingers to move the map on mobile devices", "wp-google-maps");
            $ret .= "                    </td>";
            $ret .= "                </tr>";
			
            $ret .= "            </table>";
            $ret = apply_filters("wpgooglemaps_map_settings_output_bottom",$ret,$wpgmza_settings);

            $ret .= "        </div>";
            $ret .= "        <div id=\"tabs-2\">";
            $ret .= "            <h3>".__("Marker InfoWindow Settings")."</h3>";
            $ret .= "            <table class='form-table'>";
            $ret .= "                <tr>";
            $ret .= "                    <td valign='top' width='200' style='vertical-align:top;'>".__("Open Marker InfoWindows by","wp-google-maps")." </td>";
            $ret .= "                        <td><input name='wpgmza_settings_map_open_marker_by' type='radio' id='wpgmza_settings_map_open_marker_by' value='1' ".$wpgmza_settings_map_open_marker_by_checked[0]." />Click<br /><input name='wpgmza_settings_map_open_marker_by' type='radio' id='wpgmza_settings_map_open_marker_by' value='2' ".$wpgmza_settings_map_open_marker_by_checked[1]." />Hover </td>";
            $ret .= "                </tr>";
			
			$ret .= '
				<tr>
					<td valign="top" width="200" style="vertical-align:top;">' . __("Disable InfoWindows", "wp-google-maps") . '</td>
					<td>
						<div class="switch">';
						
			$ret .= "
							<input id='wpgmza_settings_disable_infowindows' name='wpgmza_settings_disable_infowindows' value='1' type='checkbox' class='cmn-toggle cmn-toggle-yes-no' {$wpgmza_settings_disable_infowindows}/><label for='wpgmza_settings_disable_infowindows' data-on='".__("Yes", "wp-google-maps")."' data-off='".__("No", "wp-google-maps")."'></label>
					";
							
			$ret .= '		<label for="wpgmza_settings_disable_infowindows"></label>
						</div>
					</td>
				</tr>
			';
			
            $ret .= "            </table>";
            $ret .= "        </div>";
			
            $ret .= "        <div id=\"tabs-3\">";

            $ret .= "            <table class='form-table'>";
            $ret .= "        <h3>".__("Marker Listing Settings","wp-google-maps")."</h3>";
            $ret .= "       <p>".__("Changing these settings will alter the way the marker list appears on your website.","wp-google-maps")."</p>";
            $ret .= "                 <div class=\"update-nag update-att\">";
            $ret .= "                             <i class=\"fa fa-arrow-circle-right\"> </i> <a target='_blank' href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=mlisting_settings")."\">Add Beautiful Marker Listings</a> to your maps with the Pro version for only $39.99 once off. Support and updates included forever.";
            $ret .= "                 </div>";
            $ret .= "       <hr />";
            
            $ret .= "       <h4>".__("Advanced Marker Listing","wp-google-maps")."</h4>";
            $ret .= "       <table class='form-table'>";
            $ret .= "       <tr>";
            $ret .= "           <td width='200' valign='top' style='vertical-align:top;'>".__("Column settings","wp-google-maps")."</td>";
            $ret .= "           <td>";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Icon column","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Title column","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Address column","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Category column","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Description column","wp-google-maps")."<br />";
            $ret .= "           </td>";
            $ret .= "       </tr>";
            $ret .= "   </table>";
            $ret .= "   <hr/>";
             
            $ret .= "   <h4>".__("Carousel Marker Listing","wp-google-maps")."</h4>";
            $ret .= "   <table class='form-table'>";
            $ret .= "       <tr>";
            $ret .= "           <td width='200' valign='top' style='vertical-align:top;'>".__("Theme selection","wp-google-maps")."</td>";
            $ret .= "           <td>";
            $ret .= "               <select disabled >";
            $ret .= "                   <option >".__("Sky","wp-google-maps")."</option>";
            $ret .= "                   <option >".__("Sun","wp-google-maps")."</option>";
            $ret .= "                   <option >".__("Earth","wp-google-maps")."</option>";
            $ret .= "                   <option >".__("Monotone","wp-google-maps")."</option>";
            $ret .= "                   <option >".__("PinkPurple","wp-google-maps")."</option>";
            $ret .= "                   <option >".__("White","wp-google-maps")."</option>";
            $ret .= "                   <option >".__("Black","wp-google-maps")."</option>";
            $ret .= "               </select>";
            $ret .= "           </td>";
            $ret .= "       </tr>";
            $ret .= "       <tr>";
            $ret .= "           <td width='200' valign='top' style='vertical-align:top;'>".__("Carousel settings","wp-google-maps")."</td>";
            $ret .= "           <td>";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Image","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Title","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Marker Icon","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Address","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Description","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Marker Link","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Hide the Directions Link","wp-google-maps")."<br />";
            $ret .= "               <br /> <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Enable lazyload of images","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Enable autoheight","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox'  class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Enable pagination","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Enable navigation","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='text' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Items","wp-google-maps")."<br />";
            $ret .= "               <div class='switch'><input type='text' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label></label></div>".__("Autoplay after x milliseconds (1000 = 1 second)","wp-google-maps")."<br />";
            $ret .= "           </td>";
            $ret .= "    </tr>";
            $ret .= "   </table>";
            $ret .= "</div>";

            $ret .= "   <div id=\"tabs-4\">";
            $ret .= "      <h3>".__("Store Locator", "wp-google-maps")."</h3>";
            $ret .= "      <table class='form-table'>";
            $ret .= "         <tr>";
            $ret .= "            <td valign='top' width='200' style='vertical-align:top;padding-left:0px;'>".__('Store Locator Radii', 'wp-google-maps')."</td>";
            $ret .= "            <td>";
            $ret .= "               <input type='text' id='wpgmza_store_locator_radii' name='wpgmza_store_locator_radii' value='".trim($wpgmza_store_locator_radii)."' class='wpgmza_store_locator_radii' required='required' pattern='^\d+(,\s*\d+)*$' style='width: 400px;' />";
            $ret .= "               <p style='font-style:italic;' class='store_locator_text_input_tip'>" . __('Use a comma to separate values, eg: 1, 5, 10, 50, 100', 'wp-google-maps') . "</p>";
            $ret .= "            </td>";
            $ret .= "         </tr>";
            $ret .= "      </table>";
            $ret .= "   </div>";

            $ret .= "<div id=\"tabs-5\">";
            $ret .= "               <h3>".__("Advanced Settings","wp-google-maps")."</h3>";
			
            $ret .= "               
			
			<div data-required-maps-engine='google-maps'>
			
				<h4>".__("Google Maps API Key","wp-google-maps")."</h4>";

            $ret .= "                   <table class='form-table'>";
            $ret .= "                <tr>";
            $ret .= "                    <td valign='top' width='200' style='vertical-align:top;'>".__('Google Maps API Key (required)', 'wp-google-maps')."</td>";
            $ret .= "                        <td>";
            $ret .= "                           <input type='text' id='wpgmza_google_maps_api_key' name='wpgmza_google_maps_api_key' value='".trim(get_option('wpgmza_google_maps_api_key'))."' style='width: 400px;' />";
            $ret .= "                        </td>";
            $ret .= "                </tr>";
            $ret .= "                <p>".__("This API key can be obtained from the <a href='https://console.developers.google.com' target='_BLANK'>Google Developers Console</a>. Our <a href='http://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/' target='_BLANK'>documentation</a> provides a full guide on how to obtain this. ","wp-google-maps")."</p>";
            $ret .= "                   </table>
			
			</div>
			
			";

            $ret .= "               <h4>".__("Marker Data Location","wp-google-maps")."</h4>";
            $ret .= "                   <table class='form-table'>";
            $ret .= "                <tr>";
            $ret .= "                    <td valign='top' width='200' style='vertical-align:top;'>".__("Pull marker data from","wp-google-maps")." </td>";
            $ret .= "                        <td>"
                    . "                         <input name='wpgmza_settings_marker_pull' type='radio' id='wpgmza_settings_marker_pull' class='wpgmza_settings_marker_pull' value='0' ".$wpgmza_settings_marker_pull_checked[0]." />".__("Database (Great for small amounts of markers)","wp-google-maps")."<br />"
                    . "                         <input name='wpgmza_settings_marker_pull' type='radio' id='wpgmza_settings_marker_pull' class='wpgmza_settings_marker_pull' value='1' ".$wpgmza_settings_marker_pull_checked[1]." />".__("XML File  (Great for large amounts of markers)","wp-google-maps")
                    . "                      </td>";
            $ret .= "                </tr>";
            $ret .= "                <p>".__("We suggest that you change the two fields below ONLY if you are experiencing issues when trying to save the marker XML files.","wp-google-maps")."</p>";
            $ret .= "                    <tr class='wpgmza_marker_dir_tr' $show_advanced_marker_tr>";
            $ret .= "                           <td width='200' valign='top' style='vertical-align:top;'>".__("Marker data XML directory","wp-google-maps").":</td>";
            $ret .= "                           <td>";
            $ret .= "                               <input id='wpgmza_marker_xml_location' name='wpgmza_marker_xml_location' value='".get_option("wpgmza_xml_location")."' class='regular-text code' /> $wpgmza_file_perms_check";
            $ret .= "                               <br />";
            $ret .= "                               <small>".__("You can use the following","wp-google-maps").": {wp_content_dir},{plugins_dir},{uploads_dir}<br /><br />";
            $ret .= "                               ".__("Currently using","wp-google-maps").": <strong><em>$marker_location</em></strong></small>";
            $ret .= "                       </td>";
            $ret .= "                   </tr>";
            $ret .= "                    <tr class='wpgmza_marker_url_tr' $show_advanced_marker_tr>";
            $ret .= "                           <td width='200' valign='top' style='vertical-align:top;'>".__("Marker data XML URL","wp-google-maps").":</td>";
            $ret .= "                        <td>";
            $ret .= "                           <input id='wpgmza_marker_xml_url' name='wpgmza_marker_xml_url' value='".get_option("wpgmza_xml_url")."' class='regular-text code' />";
            $ret .= "                              <br />";
            $ret .= "                               <br />";
            $ret .= "                               <small>".__("You can use the following","wp-google-maps").": {wp_content_url},{plugins_url},{uploads_url}<br /><br />";
            $ret .= "                               ".__("Currently using","wp-google-maps").": <strong><em>$marker_url</em></strong></small>";
            $ret .= "                       </td>";
            $ret .= "                   </tr>";
            $ret .= "                   </table>";
            $ret .= "               <h4>".__("Custom Scripts","wp-google-maps")."</h4>";
            $ret .= "                   <table class='form-table'>";
            $ret .= "                    <tr>";
            $ret .= "                           <td width='200' valign='top' style='vertical-align:top;'>".__("Custom CSS","wp-google-maps").":</td>";
            $ret .= "                           <td>";
            $ret .= "                               <textarea name=\"wpgmza_custom_css\" id=\"wpgmza_custom_css\" cols=\"70\" rows=\"10\">".stripslashes($wpgmza_custom_css)."</textarea>";
            $ret .= "                       </td>";
            $ret .= "                   </tr>";
            $ret .= "                    <tr>";
            $ret .= "                           <td width='200' valign='top' style='vertical-align:top;'>".__("Custom JS","wp-google-maps").":</td>";
            $ret .= "                           <td>";
            $ret .= "                               <textarea name=\"wpgmza_custom_js\" id=\"wpgmza_custom_js\" cols=\"70\" rows=\"10\">".stripslashes($wpgmza_custom_js)."</textarea>";
            $ret .= "                       </td>";
            $ret .= "                   </tr>";
            $ret .= "                   </table>";
			
			$ret .= "
			
			<h4>" . __('Developer Mode', 'wp-google-maps') . "</h4>
			<input type='checkbox' name='wpgmza_developer_mode' $developer_mode_checked/>
			" . __('Always rebuilds combined script files, does not load combined and minified scripts', 'wp-google-maps') . "
			";
			
            $ret .= "           </div>";
			
			$ret .= apply_filters('wpgmza_global_settings_tab_content', '');
			
            $ret .= "       </div>";
            $ret .= "       <p class='submit'><input type='submit' name='wpgmza_save_settings' class='button-primary' value='".__("Save Settings","wp-google-maps")." &raquo;' /></p>";
            $ret .= "   </form>";
			
			
            $ret .=  "</div>";
			
            echo $ret;
            

}

function wpgmaps_menu_advanced_layout() {
	
    if (function_exists('wpgmza_register_pro_version')) {
        wpgmza_pro_advanced_menu();
    }

}

function wpgmaps_menu_support_layout() {
    if (function_exists('wpgmza_pro_support_menu')) {
        wpgmza_pro_support_menu();
    } else {
        wpgmza_basic_support_menu();
    }

}
function wpgmza_review_nag() {
    if (!function_exists('wpgmza_register_pro_version')) {
        $wpgmza_review_nag = get_option("wpgmza_review_nag");
        if ($wpgmza_review_nag) { 
            return;
        }
        $wpgmza_stats = get_option("wpgmza_stats");

        
        if ($wpgmza_stats) {
            if (isset($wpgmza_stats['dashboard']['first_accessed'])) {
                $first_acc = $wpgmza_stats['dashboard']['first_accessed'];
                $datedif = time() - strtotime($first_acc);
                $days_diff = floor($datedif/(60*60*24));

                if ($days_diff >= 10) {
                    $rate_text = sprintf( __( '<h3>We need your love!</h3><p>If you are enjoying our plugin, please consider <a href="%1$s" target="_blank" class="button button-primary">reviewing WP Google Maps</a>. It would mean the world to us! If you are experiencing issues with the plugin, please <a href="%2$s" target="_blank"  class="button button-secondary">contact us</a> and we will help you as soon as humanly possible!</p>', 'wp-google-maps' ),
                        'https://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5',
                        'http://www.wpgmaps.com/contact-us/'
                    );
                    echo "<style>.wpgmza_upgrade_nag { display:none; }</style>";
                    echo "<div class='updated wpgmza_nag_review_div'>".$rate_text."<p><a href='admin.php?page=wp-google-maps-menu&action2=close_review' class='wpgmza_close_review_nag button button-secondary' title='".__("We will not nag you again, promise!","wp-google-maps")."'>".__("Close","wp-google-maps")."</a></p></div>";
                }
            }
        }
    }

}
function wpgmza_map_page() {
    

    if (isset($_GET['action2']) && $_GET['action2'] == "close_review") {
        update_option("wpgmza_review_nag",time());
    }

    wpgmza_review_nag();    

    google_maps_api_key_warning();    
    
    if (function_exists('wpgmza_register_pro_version')) {
        wpgmza_stats("list_maps_pro");
        echo"<div class=\"wrap\"><div id=\"icon-edit\" class=\"icon32 icon32-posts-post\"><br></div><h2>".__("My Maps","wp-google-maps")." <a href=\"admin.php?page=wp-google-maps-menu&action=new\" class=\"add-new-h2\">".__("Add New","wp-google-maps")."</a>".(function_exists("wpgmaps_wizard_layout") ? " <a href=\"admin.php?page=wp-google-maps-menu&action=wizard\" class=\"add-new-h2\">".__("Wizard","wp-google-maps")."</a>" : "")."</h2>";

        $my_theme = wp_get_theme();

        $name = $my_theme->get( 'Name' );
        $version = $my_theme->get( 'Version' );
        $modified_version = str_replace('.', '', $version);

        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");

        if( $name == 'Avada' && intval( $modified_version ) <= 393 && !isset( $wpgmza_settings['wpgmza_settings_force_jquery'] ) ){

            echo "<div class='error'><p>".printf( /* translators: %s: WP Google Maps Settings Link */ __("We have detected a conflict between your current theme's version and our plugin. Should you be experiencing issues with your maps displaying, please update Avada to version 3.9.4 or go to <a href='%s'>settings page</a> and check the highlighted checkbox.", "wp-google-maps"), admin_url('/admin.php?page=wp-google-maps-menu-settings#wpgmza_settings_force_jquery') )."</p></div>";

        }
        
        wpgmaps_check_versions();
        wpgmaps_list_maps();
    } 
    else {
        wpgmza_stats("list_maps_basic");
        echo"<div class=\"wrap\"><div id=\"icon-edit\" class=\"icon32 icon32-posts-post\"><br></div><h2>".__("My Maps","wp-google-maps")."</h2>";
        echo"<p class='wpgmza_upgrade_nag'><i><a href='".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=mappage_1")."' target=\"_BLANK\" title='".__("Pro Version","wp-google-maps")."'>".__("Create unlimited maps","wp-google-maps")."</a> ".__("with the","wp-google-maps")." <a href='".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=mappage_2")."' title='Pro Version'  target=\"_BLANK\">".__("Pro Version","wp-google-maps")."</a> ".__("of WP Google Maps for only","wp-google-maps")." <strong>$39.99!</strong></i></p>";

        $my_theme = wp_get_theme();

        $name = $my_theme->get( 'Name' );
        $version = $my_theme->get( 'Version' );
        $modified_version = str_replace('.', '', $version);

        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");

        if( $name == 'Avada' && intval( $modified_version ) <= 393 && !isset( $wpgmza_settings['wpgmza_settings_force_jquery'] ) ){

            echo "<div class='error'><p>".printf( /* translators: %s: WP Google Maps Settings Link */ __("We have detected a conflict between your current theme's version and our plugin. Should you be experiencing issues with your maps displaying, please update Avada to version 3.9.4 or go to <a href='%s'>settings page</a> and check the highlighted checkbox.", "wp-google-maps"), admin_url('/admin.php?page=wp-google-maps-menu-settings#wpgmza_settings_force_jquery') )."</p></div>";
			

        }            

        wpgmaps_list_maps();


    }
    echo "</div>";
    echo"<br /><div style='float:right;'><a href='http://www.wpgmaps.com/documentation/troubleshooting/'  target='_BLANK' title='WP Google Maps Troubleshooting Section'>".__("Problems with the plugin? See the troubleshooting manual.","wp-google-maps")."</a></div>";
}


function wpgmaps_list_maps() {
    global $wpdb;
    global $wpgmza_tblname_maps;
    
    if (function_exists('wpgmaps_list_maps_pro')) { wpgmaps_list_maps_pro(); return; }

    if ($wpgmza_tblname_maps) { $table_name = $wpgmza_tblname_maps; } else { $table_name = $wpdb->prefix . "wpgmza_maps"; }


    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE `active` = %d ORDER BY `id` DESC",0));
    echo "

      <table class=\"wp-list-table widefat fixed wpgmza-listing\" cellspacing=\"0\">
	<thead>
	<tr>
		<th scope='col' id='id' class='manage-column column-id sortable desc'  style=''><span>".__("ID","wp-google-maps")."</span></th>
                <th scope='col' id='map_title' class='manage-column column-map_title sortable desc'  style=''><span>".__("Title","wp-google-maps")."</span></th>
                <th scope='col' id='map_width' class='manage-column column-map_width' style=\"\">".__("Width","wp-google-maps")."</th>
                <th scope='col' id='map_height' class='manage-column column-map_height'  style=\"\">".__("Height","wp-google-maps")."</th>
                <th scope='col' id='type' class='manage-column column-type sortable desc'  style=\"\"><span>".__("Type","wp-google-maps")."</span></th>
                <th scope='col' id='type' class='manage-column column-type sortable desc'  style=\"\"><span>".__("Shortcode","wp-google-maps")."</span></th>
        </tr>
	</thead>
        <tbody id=\"the-list\" class='list:wp_list_text_link'>
";
    foreach ( $results as $result ) {
        if ($result->type == "1") { $map_type = __("Roadmap","wp-google-maps"); }
        else if ($result->type == "2") { $map_type = __("Satellite","wp-google-maps"); }
        else if ($result->type == "3") { $map_type = __("Hybrid","wp-google-maps"); }
        else if ($result->type == "4") { $map_type = __("Terrain","wp-google-maps"); }
        if (function_exists('wpgmza_register_pro_version')) {
            $trashlink = "| <a href=\"?page=wp-google-maps-menu&action=trash&map_id=".$result->id."\" title=\"Trash\">".__("Trash","wp-google-maps")."</a>";
        } else {
            $trashlink = "";
        }
        echo "<tr id=\"record_".$result->id."\">";
        echo "<td class='id column-id'>".$result->id."</td>";
        echo "<td class='map_title column-map_title'><strong><big><a href=\"?page=wp-google-maps-menu&action=edit&map_id=".$result->id."\" title=\"".__("Edit","wp-google-maps")."\">".stripslashes($result->map_title)."</a></big></strong><br /><a href=\"?page=wp-google-maps-menu&action=edit&map_id=".$result->id."\" title=\"".__("Edit","wp-google-maps")."\">".__("Edit","wp-google-maps")."</a> $trashlink</td>";
        echo "<td class='map_width column-map_width'>".$result->map_width."".stripslashes($result->map_width_type)."</td>";
        echo "<td class='map_width column-map_height'>".$result->map_height."".stripslashes($result->map_height_type)."</td>";
        echo "<td class='type column-type'>".$map_type."</td>";
        echo "<td class='type column-type'><input class='wpgmza_copy_shortcode' type='text' readonly value='[wpgmza id=\"".$result->id."\"]'/></td>";
        echo "</tr>";


    }
    echo "</table>";
}




function wpgmza_marker_page() {
    echo"<div class=\"wrap\"><div id=\"icon-edit\" class=\"icon32 icon32-posts-post\"><br></div><h2>".__("My Markers","wp-google-maps")." <a href=\"admin.php?page=wp-google-maps-marker-menu&action=new\" class=\"add-new-h2\">".__("Add New","wp-google-maps")."</a></h2>";
    wpgmaps_list_markers();
    echo "</div>";
    echo"<br /><div style='float:right;'><a href='http://www.wpgmaps.com/documentation/troubleshooting/' title='WP Google Maps Troubleshooting Section'>".__("Problems with the plugin? See the troubleshooting manual.","wp-google-maps")."</a></div>";

}

function wpgmaps_list_markers() {
    global $wpdb;
    global $wpgmza_tblname;
	
	$columns = implode(', ', wpgmza_get_marker_columns());
    $results = $wpdb->get_results("SELECT $columns FROM $wpgmza_tblname ORDER BY `address` DESC");
	
    echo "

      <table class=\"wp-list-table widefat fixed \" cellspacing=\"0\">
	<thead>
	<tr>
		<th scope='col' id='marker_id' class='manage-column column-id sortable desc'  style=''><span>".__("ID","wp-google-maps")."</span></th>
                <th scope='col' id='marker_icon' class='manage-column column-map_title sortable desc'  style=''><span>".__("Icon","wp-google-maps")."</span></th>
                <th scope='col' id='marker_linked_to' class='manage-column column-map_title sortable desc'  style=''><span>".__("Linked to","wp-google-maps")."</span></th>
                <th scope='col' id='marker_title' class='manage-column column-map_width' style=\"\">".__("Title","wp-google-maps")."</th>
                <th scope='col' id='marker_address' class='manage-column column-map_width' style=\"\">".__("Address","wp-google-maps")."</th>
                <th scope='col' id='marker_gps' class='manage-column column-map_height'  style=\"\">".__("GPS","wp-google-maps")."</th>
                <th scope='col' id='marker_pic' class='manage-column column-type sortable desc'  style=\"\"><span>".__("Pic","wp-google-maps")."</span></th>
                <th scope='col' id='marker_link' class='manage-column column-type sortable desc'  style=\"\"><span>".__("Link","wp-google-maps")."</span></th>
        </tr>
	</thead>
        <tbody id=\"the-list\" class='list:wp_list_text_link'>
";
    foreach ( $results as $result ) {
        echo "<tr id=\"record_".$result->id."\">";
        echo "<td class='id column-id'>".$result->id."</td>";
        echo "<td class='id column-id'>".$result->icon."</td>";
        echo "<td class='id column-id'>".$result->map_id."</td>";
        echo "<td class='id column-id'>".$result->title."</td>";
        echo "<td class='id column-id'>".$result->address."</td>";
        echo "<td class='id column-id'>".$result->lat.",".$result->lng."</td>";
        echo "<td class='id column-id'>".$result->pic."</td>";
        echo "<td class='id column-id'>".$result->link."</td>";
        echo "</tr>";


    }
    echo "</table>";

}



function wpgmaps_check_versions() {
    $prov = get_option("WPGMZA_PRO");
    $wpgmza_pro_version = $prov['version'];
    if (floatval($wpgmza_pro_version) < 4.51 || $wpgmza_pro_version == null) {
        wpgmaps_upgrade_notice();
    }
}

function wpgmza_basic_menu() {
    
    
    global $wpgmza_tblname_maps;
    global $wpdb;
    /* deprecated
    *  if (!wpgmaps_check_permissions()) { wpgmaps_permission_warning(); }
    */
    if ($_GET['action'] == "edit" && isset($_GET['map_id'])) {
        $res = wpgmza_get_map_data(sanitize_text_field($_GET['map_id']));
        if (function_exists("wpgmaps_marker_permission_check")) { wpgmaps_marker_permission_check(); }


		$global_settings = get_option('WPGMZA_OTHER_SETTINGS');
        
        $other_settings_data = maybe_unserialize($res->other_settings);
        if (isset($other_settings_data['store_locator_enabled'])) { $wpgmza_store_locator_enabled = $other_settings_data['store_locator_enabled']; } else { $wpgmza_store_locator_enabled = 0; }
        if (isset($other_settings_data['store_locator_distance'])) { $wpgmza_store_locator_distance = $other_settings_data['store_locator_distance']; } else { $wpgmza_store_locator_distance = 0; }

		global $wpgmza_default_store_locator_radii;
		$available_store_locator_radii = $wpgmza_default_store_locator_radii;
		
		if(!empty($global_settings['wpgmza_store_locator_radii']) && preg_match_all('/\d+/', $global_settings['wpgmza_store_locator_radii'], $m))
			$available_store_locator_radii = array_map('intval', $m[0]);
		
        if (isset($other_settings_data['store_locator_default_radius']))
            $wpgmza_store_locator_default_radius = $other_settings_data['store_locator_default_radius'];
        
        if (isset($other_settings_data['store_locator_bounce'])) { $wpgmza_store_locator_bounce = $other_settings_data['store_locator_bounce']; } else { $wpgmza_store_locator_bounce = 1; }
        if (isset($other_settings_data['store_locator_query_string'])) { $wpgmza_store_locator_query_string = stripslashes($other_settings_data['store_locator_query_string']); } else { $wpgmza_store_locator_query_string = __("ZIP / Address:","wp-google-maps"); }
        if (isset($other_settings_data['store_locator_default_address'])) { $wpgmza_store_locator_default_address = stripslashes($other_settings_data['store_locator_default_address']); } else { $wpgmza_store_locator_default_address = ""; }
        if (isset($other_settings_data['store_locator_not_found_message'])) { $wpgmza_store_locator_not_found_message = stripslashes($other_settings_data['store_locator_not_found_message']); } else { $wpgmza_store_locator_not_found_message = __( "No results found in this location. Please try again.", "wp-google-maps" ); }
        if (isset($other_settings_data['wpgmza_store_locator_restrict'])) { $wpgmza_store_locator_restrict = $other_settings_data['wpgmza_store_locator_restrict']; } else { $wpgmza_store_locator_restrict = ""; }
		
		$store_locator_style = (empty($other_settings_data['store_locator_style']) ? 'legacy' : $other_settings_data['store_locator_style']);
		$store_locator_radius_style = (empty($other_settings_data['wpgmza_store_locator_radius_style']) ? 'legacy' : $other_settings_data['wpgmza_store_locator_radius_style']);

        /* deprecated in 6.2.0
        if (isset($other_settings_data['weather_layer'])) { $wpgmza_weather_option = $other_settings_data['weather_layer']; } else { $wpgmza_weather_option = 2; } 
        if (isset($other_settings_data['weather_layer_temp_type'])) { $wpgmza_weather_option_temp_type = $other_settings_data['weather_layer_temp_type']; } else { $wpgmza_weather_option_temp_type = 1; } 
        if (isset($other_settings_data['cloud_layer'])) { $wpgmza_cloud_option = $other_settings_data['cloud_layer']; } else { $wpgmza_cloud_option = 2; } 
        */
        if (isset($other_settings_data['transport_layer'])) { $wpgmza_transport_option = $other_settings_data['transport_layer']; } else { $wpgmza_transport_option = 2; } 
        
        if (isset($other_settings_data['map_max_zoom'])) { $wpgmza_max_zoom[intval($other_settings_data['map_max_zoom'])] = "SELECTED"; } else { $wpgmza_max_zoom[1] = "SELECTED";  }
        
        
        if (isset($res->map_start_zoom)) { $wpgmza_zoom[intval($res->map_start_zoom)] = "SELECTED"; } else { $wpgmza_zoom[8] = "SELECTED";  }
        if (isset($res->type)) { $wpgmza_map_type[intval($res->type)] = "SELECTED"; } else { $wpgmza_map_type[1] = "SELECTED"; }
        if (isset($res->alignment)) { $wpgmza_map_align[intval($res->alignment)] = "SELECTED"; } else { $wpgmza_map_align[1] = "SELECTED"; }
        if (isset($res->bicycle)) { $wpgmza_bicycle[intval($res->bicycle)] = "checked"; } else { $wpgmza_bicycle[2] = ""; }
        if (isset($res->traffic)) { $wpgmza_traffic[intval($res->traffic)] = "checked"; } else { $wpgmza_traffic[2] = ""; }

        if (stripslashes($res->map_width_type) == "%") { $wpgmza_map_width_type_percentage = "SELECTED"; $wpgmza_map_width_type_px = ""; } else { $wpgmza_map_width_type_px = "SELECTED"; $wpgmza_map_width_type_percentage = ""; }
        if (stripslashes($res->map_height_type) == "%") { $wpgmza_map_height_type_percentage = "SELECTED"; $wpgmza_map_height_type_px = ""; } else { $wpgmza_map_height_type_px = "SELECTED"; $wpgmza_map_height_type_percentage = ""; }

        for ($i=0;$i<22;$i++) {
            if (!isset($wpgmza_zoom[$i])) { $wpgmza_zoom[$i] = ""; }
        }
        for ($i=0;$i<22;$i++) {
            if (!isset($wpgmza_max_zoom[$i])) { $wpgmza_max_zoom[$i] = ""; }
        }
        for ($i=0;$i<5;$i++) {
            if (!isset($wpgmza_map_type[$i])) { $wpgmza_map_type[$i] = ""; }
        }
        for ($i=0;$i<5;$i++) {
            if (!isset($wpgmza_map_align[$i])) { $wpgmza_map_align[$i] = ""; }
        }
        for ($i=0;$i<3;$i++) {
            if (!isset($wpgmza_bicycle[$i])) { $wpgmza_bicycle[$i] = ""; }
        }
        for ($i=0;$i<3;$i++) {
            if (!isset($wpgmza_traffic[$i])) { $wpgmza_traffic[$i] = ""; }
        }
        
        
        
        $wpgmza_store_locator_enabled_checked = $wpgmza_store_locator_enabled == 1 ? 'checked' : '';

        $wpgmza_store_locator_distance_checked = $wpgmza_store_locator_distance == 1 ? 'checked' : '';
 
        $wpgmza_store_locator_bounce_checked = $wpgmza_store_locator_bounce == 1 ? 'checked' : '';
        

        /*
        $wpgmza_weather_layer_checked[0] = '';
        $wpgmza_weather_layer_checked[1] = '';
        $wpgmza_weather_layer_temp_type_checked[0] = '';
        $wpgmza_weather_layer_temp_type_checked[1] = '';
        $wpgmza_cloud_layer_checked[0] = '';
        $wpgmza_cloud_layer_checked[1] = '';
        */
        $wpgmza_transport_layer_checked[0] = '';
        $wpgmza_transport_layer_checked[1] = '';
        

        /*        
        if ($wpgmza_weather_option == 1) {
            $wpgmza_weather_layer_checked[0] = 'selected';
        } else {
            $wpgmza_weather_layer_checked[1] = 'selected';
        }
        if ($wpgmza_weather_option_temp_type == 1) {
            $wpgmza_weather_layer_temp_type_checked[0] = 'selected';
        } else {
            $wpgmza_weather_layer_temp_type_checked[1] = 'selected';
        }
        if ($wpgmza_cloud_option == 1) {
            $wpgmza_cloud_layer_checked[0] = 'selected';
        } else {
            $wpgmza_cloud_layer_checked[1] = 'selected';
        }
        */
        if ($wpgmza_transport_option == 1) {
            $wpgmza_transport_layer_checked[0] = 'checked';
        } else {
            $wpgmza_transport_layer_checked[1] = 'checked';
        }

        $wpgmza_act = "disabled readonly";
        $wpgmza_act_msg = "<div class=\"update-nag update-att\" style=\"padding:5px; \">".__("Add custom icons, titles, descriptions, pictures and links to your markers with the","wp-google-maps")." \"<a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=below_marker")."\" title=\"".__("Pro Edition","wp-google-maps")."\" target=\"_BLANK\">".__("Pro Edition","wp-google-maps")."</a>\" ".__("of this plugin for just","wp-google-maps")." <strong>$39.99</strong></div>";
        $wpgmza_csv = "<p><a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=csv_link")."\" target=\"_BLANK\" title=\"".__("Pro Edition","wp-google-maps")."\">".__("Purchase the Pro Edition","wp-google-maps")."</a> ".__("of WP Google Maps and save your markers to a CSV file!","wp-google-maps")."</p>";
    }
    

    if (isset($other_settings_data['wpgmza_theme_selection'])) { $theme_sel_checked[$other_settings_data['wpgmza_theme_selection']] = "checked"; $wpgmza_theme_class[$other_settings_data['wpgmza_theme_selection']] = "wpgmza_theme_selection_activate"; } else {  $wpgmza_theme = false; $wpgmza_theme_class[0] = "wpgmza_theme_selection_activate"; }
    for ($i=0;$i<9;$i++) {
        if (!isset($wpgmza_theme_class[$i])) { $wpgmza_theme_class[$i] = ""; }
    }
    for ($i=0;$i<9;$i++) {
        if (!isset($theme_sel_checked[$i])) { $theme_sel_checked[$i] = ""; }
    }   
        
    /* check if they are using W3 Total Cache and that wp-google-maps appears in the rejected files list */
    if (class_exists("W3_Plugin_TotalCache")) {
        $wpgmza_w3_check = new W3_Plugin_TotalCache;
        if (function_exists("w3_instance")) {
            $modules = w3_instance('W3_ModuleStatus');
            $cdn_check = $modules->is_enabled('cdn');
            if (strpos(esc_textarea(implode("\r\n", $wpgmza_w3_check->_config->get_array('cdn.reject.files'))),'wp-google-maps') !== false) {
                $does_cdn_contain_our_plugin = true;
            } else { $does_cdn_contain_our_plugin = false; }



            if ($cdn_check == 1 && !$does_cdn_contain_our_plugin) {
                echo "<div class=\"update-nag\" style=\"padding:5px; \"><h1>".__("Please note","wp-google-maps").":</h1>".__("We've noticed that you are using W3 Total Cache and that you have CDN enabled.<br /><br />In order for the markers to show up on your map, you need to add '<strong><em>{uploads_dir}/wp-google-maps*</strong></em>' to the '<strong>rejected files</strong>' list in the <a href='admin.php?page=w3tc_cdn#advanced'>CDN settings page</a> of W3 Total Cache","wp-google-maps")."</div>";
            }
        }
        
        
    }


    wpgmza_stats("dashboard");

    if( isset( $other_settings_data['wpgmza_theme_data'] ) ){
        $wpgmza_theme_data_custom = $other_settings_data['wpgmza_theme_data'];
    } else {
        /* convert old gold stylign to new styling */
        if (isset($res->styling_json)) {
            $wpgmza_theme_data_custom = stripslashes($res->styling_json);
        } else {
        $wpgmza_theme_data_custom  = '';
    }
    }

	$open_layers_feature_coming_soon = '';
	$open_layers_feature_unavailable = '';
	
	global $wpgmza;
	if($wpgmza->settings->engine == 'open-layers')
	{
		ob_start();
		include(plugin_dir_path(__FILE__) . 'html/ol-feature-coming-soon.html.php');
		$open_layers_feature_coming_soon = ob_get_clean();
		
		ob_start();
		include(plugin_dir_path(__FILE__) . 'html/ol-feature-unavailable.html.php');
		$open_layers_feature_unavailable = ob_get_clean();
	}

	$maps_engine_dialog = new WPGMZA\MapsEngineDialog();
	$maps_engine_dialog_html = $maps_engine_dialog->html();
	
	global $wpgmzaGDPRCompliance;
	$gdpr_privacy_notice_html = $wpgmzaGDPRCompliance->getPrivacyPolicyNoticeHTML();
	
	google_maps_api_key_warning();
    echo "
			$open_layers_feature_unavailable
			$open_layers_feature_coming_soon
			$maps_engine_dialog_html
			
           <div class='wrap'>
                <h1>WP Google Maps</h1>
                <div class='wide'>

                    <h2>".__("Create your Map","wp-google-maps")."</h2>
					
					$gdpr_privacy_notice_html
					
                    <form action='' method='post' id='wpgmaps_options'>
                    
                    <div id=\"wpgmaps_tabs\">
                        <ul>
                            <li><a href=\"#tabs-1\">".__("General Settings","wp-google-maps")."</a></li>
                            <li><a href=\"#tabs-7\">".__("Themes","wp-google-maps")."</a></li>
                            <li><a href=\"#tabs-2\">".__("Directions","wp-google-maps")."</a></li>
                            <li><a href=\"#tabs-3\">".__("Store Locator","wp-google-maps")."</a></li>
                            <li><a href=\"#tabs-4\">".__("Advanced Settings","wp-google-maps")."</a></li>
                            <li><a href=\"#tabs-5\">".__("Marker Listing Options","wp-google-maps")."</a></li>
                            <li style=\"background-color: #d7e6f2; font-weight: bold;\"><a href=\"#tabs-6\">".__("Pro Upgrade","wp-google-maps")."</a></li>
                        </ul>
                        <div id=\"tabs-1\">
                            <p></p>
                            <input type='hidden' name='http_referer' value='" . htmlspecialchars($_SERVER['PHP_SELF'], ENT_QUOTES, 'UTF-8') . "' />
                            <input type='hidden' name='wpgmza_id' id='wpgmza_id' value='".$res->id."' />
                            <input id='wpgmza_start_location' name='wpgmza_start_location' type='hidden' size='40' maxlength='100' value='".$res->map_start_location."' />
                            <select id='wpgmza_start_zoom' name='wpgmza_start_zoom' style='display:none;' >
                                        <option value=\"1\" ".$wpgmza_zoom[1].">1</option>
                                        <option value=\"2\" ".$wpgmza_zoom[2].">2</option>
                                        <option value=\"3\" ".$wpgmza_zoom[3].">3</option>
                                        <option value=\"4\" ".$wpgmza_zoom[4].">4</option>
                                        <option value=\"5\" ".$wpgmza_zoom[5].">5</option>
                                        <option value=\"6\" ".$wpgmza_zoom[6].">6</option>
                                        <option value=\"7\" ".$wpgmza_zoom[7].">7</option>
                                        <option value=\"8\" ".$wpgmza_zoom[8].">8</option>
                                        <option value=\"9\" ".$wpgmza_zoom[9].">9</option>
                                        <option value=\"10\" ".$wpgmza_zoom[10].">10</option>
                                        <option value=\"11\" ".$wpgmza_zoom[11].">11</option>
                                        <option value=\"12\" ".$wpgmza_zoom[12].">12</option>
                                        <option value=\"13\" ".$wpgmza_zoom[13].">13</option>
                                        <option value=\"14\" ".$wpgmza_zoom[14].">14</option>
                                        <option value=\"15\" ".$wpgmza_zoom[15].">15</option>
                                        <option value=\"16\" ".$wpgmza_zoom[16].">16</option>
                                        <option value=\"17\" ".$wpgmza_zoom[17].">17</option>
                                        <option value=\"18\" ".$wpgmza_zoom[18].">18</option>
                                        <option value=\"19\" ".$wpgmza_zoom[19].">19</option>
                                        <option value=\"20\" ".$wpgmza_zoom[20].">20</option>
                                        <option value=\"21\" ".$wpgmza_zoom[21].">21</option>
                                    </select>
                            <table>
                                <tr>
                                    <td>".__("Short code","wp-google-maps").":</td>
                                    <td><input type='text' readonly name='shortcode' class='wpgmza_copy_shortcode' style='font-size:18px; text-align:center;' onclick=\"this.select()\" value='[wpgmza id=\"".$res->id."\"]' /> <small><i>".__("copy this into your post or page to display the map","wp-google-maps")."</i></td>
                                </tr>
                                <tr>
                                    <td>".__("Map Name","wp-google-maps").":</td>
                                    <td><input id='wpgmza_title' name='wpgmza_title' type='text' size='20' maxlength='50' value='".stripslashes(esc_attr($res->map_title))."' /></td>
                                </tr>
                                <tr>
                                     <td>".__("Width","wp-google-maps").":</td>
                                     <td>
                                     <input id='wpgmza_width' name='wpgmza_width' type='text' size='4' maxlength='4' value='".esc_attr($res->map_width)."' />
                                     <select id='wpgmza_map_width_type' name='wpgmza_map_width_type'>
                                        <option value=\"px\" $wpgmza_map_width_type_px>px</option>
                                        <option value=\"%\" $wpgmza_map_width_type_percentage>%</option>
                                     </select>
                                     <small><em>".__("Set to 100% for a responsive map","wp-google-maps")."</em></small>

                                    </td>
                                </tr>
                                <tr>
                                    <td>".__("Height","wp-google-maps").":</td>
                                    <td>
									
										<input id='wpgmza_height' name='wpgmza_height' type='text' size='4' maxlength='4' value='".esc_attr($res->map_height)."' />
										
										<select id='wpgmza_map_height_type' name='wpgmza_map_height_type'>
											<option value=\"px\" $wpgmza_map_height_type_px>px</option>
											<option value=\"%\" $wpgmza_map_height_type_percentage>%</option>
										</select>

										<span id='wpgmza_height_warning' class='notice notice-warning' style='display: none; height: 1em;'>

											".__("We recommend that you leave your height in PX. Depending on your theme, using % for the height may break your map.","wp-google-maps")."

										</span>

                                    </td>
                                </tr>
                                <tr>
                                    <td>".__("Zoom Level","wp-google-maps").":</td>
                                    <td>
                                    <input type=\"text\" id=\"amount\" style=\"display:none;\"  value=\"$res->map_start_zoom\"><div id=\"slider-range-max\"></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>".__("Map Alignment","wp-google-maps").":</td>
                                    <td><select id='wpgmza_map_align' name='wpgmza_map_align'>
                                        <option value=\"1\" ".$wpgmza_map_align[1].">".__("Left","wp-google-maps")."</option>
                                        <option value=\"2\" ".$wpgmza_map_align[2].">".__("Center","wp-google-maps")."</option>
                                        <option value=\"3\" ".$wpgmza_map_align[3].">".__("Right","wp-google-maps")."</option>
                                        <option value=\"4\" ".$wpgmza_map_align[4].">".__("None","wp-google-maps")."</option>
                                    </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>".__("Map type","wp-google-maps").":</td>
                                    <td><select id='wpgmza_map_type' name='wpgmza_map_type'>
                                        <option value=\"1\" ".$wpgmza_map_type[1].">".__("Roadmap","wp-google-maps")."</option>
                                        <option value=\"2\" ".$wpgmza_map_type[2].">".__("Satellite","wp-google-maps")."</option>
                                        <option value=\"3\" ".$wpgmza_map_type[3].">".__("Hybrid","wp-google-maps")."</option>
                                        <option value=\"4\" ".$wpgmza_map_type[4].">".__("Terrain","wp-google-maps")."</option>
                                    </select>
									
									<span class='notice notice-warning wpgmza-theme-and-roadmap-warning'>" . __('Themes can only be used with the Roadmap map type.', 'wp-google-maps') . "</span>
                                    </td>
                                </tr>

                                </table>
                        </div>
                        <div id=\"tabs-7\" class='wpgmza-open-layers-feature-unavailable'>
							<h4>".__("Select a theme for your map","wp-google-maps")."</h4>
							
							<span class='notice notice-warning wpgmza-theme-and-roadmap-warning'>" . __('Themes can only be used with the Roadmap map type.', 'wp-google-maps') . "</span>
							
                            <table class='' id='wpgmaps_theme_table'>
                                <tr>
                                    <td width='50%'>        
                                        <img src=\"".WPGMAPS_DIR."/images/theme_0.jpg\" title=\"Default\" id=\"wpgmza_theme_selection_0\" width=\"200\" class=\"wpgmza_theme_selection ".$wpgmza_theme_class[0]."\" tid=\"0\">     
                                        <img src=\"".WPGMAPS_DIR."/images/theme_1.jpg\" title=\"Blue\" id=\"wpgmza_theme_selection_1\" width=\"200\" class=\"wpgmza_theme_selection ".$wpgmza_theme_class[1]."\"  tid=\"1\">     
                                        <img src=\"".WPGMAPS_DIR."/images/theme_2.jpg\" title=\"Apple Maps\" id=\"wpgmza_theme_selection_2\" width=\"200\" class=\"wpgmza_theme_selection ".$wpgmza_theme_class[2]."\"  tid=\"2\">     
                                        <img src=\"".WPGMAPS_DIR."/images/theme_3.jpg\" title=\"Grayscale\" id=\"wpgmza_theme_selection_3\" width=\"200\" class=\"wpgmza_theme_selection ".$wpgmza_theme_class[3]."\"  tid=\"3\">     
                                        <img src=\"".WPGMAPS_DIR."/images/theme_4.jpg\" title=\"Pale\" id=\"wpgmza_theme_selection_4\" width=\"200\" class=\"wpgmza_theme_selection ".$wpgmza_theme_class[4]."\"  tid=\"4\">     
                                        <img src=\"".WPGMAPS_DIR."/images/theme_5.jpg\" title=\"Red\" id=\"wpgmza_theme_selection_5\" width=\"200\" class=\"wpgmza_theme_selection ".$wpgmza_theme_class[5]."\"  tid=\"5\">     
                                        <img src=\"".WPGMAPS_DIR."/images/theme_6.jpg\" title=\"Dark Grey\" id=\"wpgmza_theme_selection_6\" width=\"200\" class=\"wpgmza_theme_selection ".$wpgmza_theme_class[6]."\"  tid=\"6\">     
                                        <img src=\"".WPGMAPS_DIR."/images/theme_7.jpg\" title=\"Monochrome\" id=\"wpgmza_theme_selection_7\" width=\"200\" class=\"wpgmza_theme_selection ".$wpgmza_theme_class[7]."\"  tid=\"7\">     
                                        <img src=\"".WPGMAPS_DIR."/images/theme_8.jpg\" title=\"Old Fashioned\" id=\"wpgmza_theme_selection_8\" width=\"200\" class=\"wpgmza_theme_selection ".$wpgmza_theme_class[8]."\"  tid=\"8\">     
                                        <input type=\"radio\" name=\"wpgmza_theme\" id=\"rb_wpgmza_theme_0\" value=\"0\" ".$theme_sel_checked[0]." class=\"wpgmza_theme_radio wpgmza_hide_input\">
                                        <input type=\"radio\" name=\"wpgmza_theme\" id=\"rb_wpgmza_theme_1\" value=\"1\" ".$theme_sel_checked[1]." class=\"wpgmza_theme_radio wpgmza_hide_input\">
                                        <input type=\"radio\" name=\"wpgmza_theme\" id=\"rb_wpgmza_theme_2\" value=\"2\" ".$theme_sel_checked[2]." class=\"wpgmza_theme_radio wpgmza_hide_input\">
                                        <input type=\"radio\" name=\"wpgmza_theme\" id=\"rb_wpgmza_theme_3\" value=\"3\" ".$theme_sel_checked[3]." class=\"wpgmza_theme_radio wpgmza_hide_input\">
                                        <input type=\"radio\" name=\"wpgmza_theme\" id=\"rb_wpgmza_theme_4\" value=\"4\" ".$theme_sel_checked[4]." class=\"wpgmza_theme_radio wpgmza_hide_input\">
                                        <input type=\"radio\" name=\"wpgmza_theme\" id=\"rb_wpgmza_theme_5\" value=\"5\" ".$theme_sel_checked[5]." class=\"wpgmza_theme_radio wpgmza_hide_input\">
                                        <input type=\"radio\" name=\"wpgmza_theme\" id=\"rb_wpgmza_theme_6\" value=\"6\" ".$theme_sel_checked[6]." class=\"wpgmza_theme_radio wpgmza_hide_input\">
                                        <input type=\"radio\" name=\"wpgmza_theme\" id=\"rb_wpgmza_theme_7\" value=\"7\" ".$theme_sel_checked[7]." class=\"wpgmza_theme_radio wpgmza_hide_input\">
                                        <input type=\"radio\" name=\"wpgmza_theme\" id=\"rb_wpgmza_theme_8\" value=\"8\" ".$theme_sel_checked[8]." class=\"wpgmza_theme_radio wpgmza_hide_input\">
                                        <textarea name=\"wpgmza_theme_data_0\" id=\"rb_wpgmza_theme_data_0\" class=\"wpgmza_hide_input\">"."[ \"visibility\", \"invert_lightness\", \"color\", \"weight\", \"hue\", \"saturation\", \"lightness\", \"gamma\"]"."</textarea>
                                        <textarea name=\"wpgmza_theme_data_1\" id=\"rb_wpgmza_theme_data_1\" class=\"wpgmza_hide_input\">"."[{\"featureType\": \"administrative\",\"elementType\": \"labels.text.fill\",\"stylers\": [{\"color\": \"#444444\"}]},{\"featureType\": \"landscape\",\"elementType\": \"all\",\"stylers\": [{\"color\": \"#f2f2f2\"}]},{\"featureType\": \"poi\",\"elementType\": \"all\",\"stylers\": [{\"visibility\": \"off\"}]},{\"featureType\": \"road\",\"elementType\": \"all\",\"stylers\": [{\"saturation\": -100},{\"lightness\": 45}]},{\"featureType\": \"road.highway\",\"elementType\": \"all\",\"stylers\": [{\"visibility\": \"simplified\"}]},{\"featureType\": \"road.arterial\",\"elementType\": \"labels.icon\",\"stylers\": [{\"visibility\": \"off\"}]},{\"featureType\": \"transit\",\"elementType\": \"all\",\"stylers\": [{\"visibility\": \"off\"}]},{\"featureType\": \"water\",\"elementType\": \"all\",\"stylers\": [{\"color\": \"#46bcec\"},{\"visibility\": \"on\"}]}]"."</textarea>
                                        <textarea name=\"wpgmza_theme_data_2\" id=\"rb_wpgmza_theme_data_2\" class=\"wpgmza_hide_input\">"."[{\"featureType\":\"landscape.man_made\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#f7f1df\"}]},{\"featureType\":\"landscape.natural\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#d0e3b4\"}]},{\"featureType\":\"landscape.natural.terrain\",\"elementType\":\"geometry\",\"stylers\":[{\"visibility\":\"off\"}]},{\"featureType\":\"poi\",\"elementType\":\"labels\",\"stylers\":[{\"visibility\":\"off\"}]},{\"featureType\":\"poi.business\",\"elementType\":\"all\",\"stylers\":[{\"visibility\":\"off\"}]},{\"featureType\":\"poi.medical\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#fbd3da\"}]},{\"featureType\":\"poi.park\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#bde6ab\"}]},{\"featureType\":\"road\",\"elementType\":\"geometry.stroke\",\"stylers\":[{\"visibility\":\"off\"}]},{\"featureType\":\"road\",\"elementType\":\"labels\",\"stylers\":[{\"visibility\":\"off\"}]},{\"featureType\":\"road.highway\",\"elementType\":\"geometry.fill\",\"stylers\":[{\"color\":\"#ffe15f\"}]},{\"featureType\":\"road.highway\",\"elementType\":\"geometry.stroke\",\"stylers\":[{\"color\":\"#efd151\"}]},{\"featureType\":\"road.arterial\",\"elementType\":\"geometry.fill\",\"stylers\":[{\"color\":\"#ffffff\"}]},{\"featureType\":\"road.local\",\"elementType\":\"geometry.fill\",\"stylers\":[{\"color\":\"black\"}]},{\"featureType\":\"transit.station.airport\",\"elementType\":\"geometry.fill\",\"stylers\":[{\"color\":\"#cfb2db\"}]},{\"featureType\":\"water\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#a2daf2\"}]}]"."</textarea>
                                        <textarea name=\"wpgmza_theme_data_3\" id=\"rb_wpgmza_theme_data_3\" class=\"wpgmza_hide_input\">"."[{\"featureType\":\"landscape\",\"stylers\":[{\"saturation\":-100},{\"lightness\":65},{\"visibility\":\"on\"}]},{\"featureType\":\"poi\",\"stylers\":[{\"saturation\":-100},{\"lightness\":51},{\"visibility\":\"simplified\"}]},{\"featureType\":\"road.highway\",\"stylers\":[{\"saturation\":-100},{\"visibility\":\"simplified\"}]},{\"featureType\":\"road.arterial\",\"stylers\":[{\"saturation\":-100},{\"lightness\":30},{\"visibility\":\"on\"}]},{\"featureType\":\"road.local\",\"stylers\":[{\"saturation\":-100},{\"lightness\":40},{\"visibility\":\"on\"}]},{\"featureType\":\"transit\",\"stylers\":[{\"saturation\":-100},{\"visibility\":\"simplified\"}]},{\"featureType\":\"administrative.province\",\"stylers\":[{\"visibility\":\"off\"}]},{\"featureType\":\"water\",\"elementType\":\"labels\",\"stylers\":[{\"visibility\":\"on\"},{\"lightness\":-25},{\"saturation\":-100}]},{\"featureType\":\"water\",\"elementType\":\"geometry\",\"stylers\":[{\"hue\":\"#ffff00\"},{\"lightness\":-25},{\"saturation\":-97}]}]"."</textarea>
                                        <textarea name=\"wpgmza_theme_data_4\" id=\"rb_wpgmza_theme_data_4\" class=\"wpgmza_hide_input\">"."[{\"featureType\":\"administrative\",\"elementType\":\"all\",\"stylers\":[{\"visibility\":\"on\"},{\"lightness\":33}]},{\"featureType\":\"landscape\",\"elementType\":\"all\",\"stylers\":[{\"color\":\"#f2e5d4\"}]},{\"featureType\":\"poi.park\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#c5dac6\"}]},{\"featureType\":\"poi.park\",\"elementType\":\"labels\",\"stylers\":[{\"visibility\":\"on\"},{\"lightness\":20}]},{\"featureType\":\"road\",\"elementType\":\"all\",\"stylers\":[{\"lightness\":20}]},{\"featureType\":\"road.highway\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#c5c6c6\"}]},{\"featureType\":\"road.arterial\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#e4d7c6\"}]},{\"featureType\":\"road.local\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#fbfaf7\"}]},{\"featureType\":\"water\",\"elementType\":\"all\",\"stylers\":[{\"visibility\":\"on\"},{\"color\":\"#acbcc9\"}]}]"."</textarea>
                                        <textarea name=\"wpgmza_theme_data_5\" id=\"rb_wpgmza_theme_data_5\" class=\"wpgmza_hide_input\">[{\"stylers\": [ {\"hue\": \"#890000\"}, {\"visibility\": \"simplified\"}, {\"gamma\": 0.5}, {\"weight\": 0.5} ] }, { \"elementType\": \"labels\", \"stylers\": [{\"visibility\": \"off\"}] }, { \"featureType\": \"water\", \"stylers\": [{\"color\": \"#890000\"}] } ]</textarea>
                                        <textarea name=\"wpgmza_theme_data_6\" id=\"rb_wpgmza_theme_data_6\" class=\"wpgmza_hide_input\">[{\"featureType\":\"all\",\"elementType\":\"labels.text.fill\",\"stylers\":[{\"saturation\":36},{\"color\":\"#000000\"},{\"lightness\":40}]},{\"featureType\":\"all\",\"elementType\":\"labels.text.stroke\",\"stylers\":[{\"visibility\":\"on\"},{\"color\":\"#000000\"},{\"lightness\":16}]},{\"featureType\":\"all\",\"elementType\":\"labels.icon\",\"stylers\":[{\"visibility\":\"off\"}]},{\"featureType\":\"administrative\",\"elementType\":\"geometry.fill\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":20}]},{\"featureType\":\"administrative\",\"elementType\":\"geometry.stroke\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":17},{\"weight\":1.2}]},{\"featureType\":\"landscape\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":20}]},{\"featureType\":\"poi\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":21}]},{\"featureType\":\"road.highway\",\"elementType\":\"geometry.fill\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":17}]},{\"featureType\":\"road.highway\",\"elementType\":\"geometry.stroke\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":29},{\"weight\":0.2}]},{\"featureType\":\"road.arterial\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":18}]},{\"featureType\":\"road.local\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":16}]},{\"featureType\":\"transit\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":19}]},{\"featureType\":\"water\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#000000\"},{\"lightness\":17}]}]</textarea>
                                        <textarea name=\"wpgmza_theme_data_7\" id=\"rb_wpgmza_theme_data_7\" class=\"wpgmza_hide_input\">[{\"featureType\":\"administrative.locality\",\"elementType\":\"all\",\"stylers\":[{\"hue\":\"#2c2e33\"},{\"saturation\":7},{\"lightness\":19},{\"visibility\":\"on\"}]},{\"featureType\":\"landscape\",\"elementType\":\"all\",\"stylers\":[{\"hue\":\"#ffffff\"},{\"saturation\":-100},{\"lightness\":100},{\"visibility\":\"simplified\"}]},{\"featureType\":\"poi\",\"elementType\":\"all\",\"stylers\":[{\"hue\":\"#ffffff\"},{\"saturation\":-100},{\"lightness\":100},{\"visibility\":\"off\"}]},{\"featureType\":\"road\",\"elementType\":\"geometry\",\"stylers\":[{\"hue\":\"#bbc0c4\"},{\"saturation\":-93},{\"lightness\":31},{\"visibility\":\"simplified\"}]},{\"featureType\":\"road\",\"elementType\":\"labels\",\"stylers\":[{\"hue\":\"#bbc0c4\"},{\"saturation\":-93},{\"lightness\":31},{\"visibility\":\"on\"}]},{\"featureType\":\"road.arterial\",\"elementType\":\"labels\",\"stylers\":[{\"hue\":\"#bbc0c4\"},{\"saturation\":-93},{\"lightness\":-2},{\"visibility\":\"simplified\"}]},{\"featureType\":\"road.local\",\"elementType\":\"geometry\",\"stylers\":[{\"hue\":\"#e9ebed\"},{\"saturation\":-90},{\"lightness\":-8},{\"visibility\":\"simplified\"}]},{\"featureType\":\"transit\",\"elementType\":\"all\",\"stylers\":[{\"hue\":\"#e9ebed\"},{\"saturation\":10},{\"lightness\":69},{\"visibility\":\"on\"}]},{\"featureType\":\"water\",\"elementType\":\"all\",\"stylers\":[{\"hue\":\"#e9ebed\"},{\"saturation\":-78},{\"lightness\":67},{\"visibility\":\"simplified\"}]}]</textarea>
                                        <textarea name=\"wpgmza_theme_data_8\" id=\"rb_wpgmza_theme_data_8\" class=\"wpgmza_hide_input\">[{\"featureType\":\"administrative\",\"stylers\":[{\"visibility\":\"off\"}]},{\"featureType\":\"poi\",\"stylers\":[{\"visibility\":\"simplified\"}]},{\"featureType\":\"road\",\"elementType\":\"labels\",\"stylers\":[{\"visibility\":\"simplified\"}]},{\"featureType\":\"water\",\"stylers\":[{\"visibility\":\"simplified\"}]},{\"featureType\":\"transit\",\"stylers\":[{\"visibility\":\"simplified\"}]},{\"featureType\":\"landscape\",\"stylers\":[{\"visibility\":\"simplified\"}]},{\"featureType\":\"road.highway\",\"stylers\":[{\"visibility\":\"off\"}]},{\"featureType\":\"road.local\",\"stylers\":[{\"visibility\":\"on\"}]},{\"featureType\":\"road.highway\",\"elementType\":\"geometry\",\"stylers\":[{\"visibility\":\"on\"}]},{\"featureType\":\"water\",\"stylers\":[{\"color\":\"#84afa3\"},{\"lightness\":52}]},{\"stylers\":[{\"saturation\":-17},{\"gamma\":0.36}]},{\"featureType\":\"transit.line\",\"elementType\":\"geometry\",\"stylers\":[{\"color\":\"#3f518c\"}]}]</textarea>
                                    </td>
                                    <td width='50%'>
                                    <h3>".__("Or use a custom theme","wp-google-maps")."</h3>
                                    <p><a href='http://www.wpgmaps.com/map-themes/?utm_source=plugin&utm_medium=link&utm_campaign=browse_themes' title='' target='_BLANK' class='button button-primary'>".__("Browse the theme directory","wp-google-maps")."</a></p>
                                    <p>".__("Paste your custom theme data here:","wp-google-maps")."</p>
                                        <textarea name=\"wpgmza_styling_json\" id=\"wpgmza_styling_json\" rows=\"8\" cols=\"40\">".stripslashes($wpgmza_theme_data_custom)."</textarea>
                                    <p><a href='javascript:void(0);' title='".__("Preview","wp-google-maps")."' class='button button-seconday' id='wpgmza_preview_theme'>".__("Preview","wp-google-maps")."</a></p>
                                    </td>

                                </tr>
                                <tr>
                                <td>
                                    <p>

                                    </p>
                                </td>
                                </tr>
                            </table>

                        </div>

                        <div id=\"tabs-2\" class='wpgmza-open-layers-feature-unavailable'>
							
                            <div class=\"update-nag update-att\">
                                
                                        <i class=\"fa fa-arrow-circle-right\"> </i> <a target='_BLANK' href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=directions")."\">Enable directions</a> with the Pro version for only $39.99 once off. Support and updates included forever.

                            </div>
                                        
                                        

                            <table class='form-table' id='wpgmaps_directions_options'>
                                <tr>
                                    <td width='200px'>".__("Enable Directions?","wp-google-maps").":</td>
                                    <td><!--<select class='postform' readonly disabled>
                                        <option>".__("No","wp-google-maps")."</option>
                                        <option>".__("Yes","wp-google-maps")."</option>
                                    </select>-->
                                    <div class='switch  grey-out'>
                                        <input type='checkbox' class='cmn-toggle cmn-toggle-yes-no' disabled> <label class='cmn-override-big' data-on='".__("No","wp-google-maps")."' data-off='".__("No","wp-google-maps")."''></label>
                                    </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    ".__("Directions Box Open by Default?","wp-google-maps").":
                                    </td>
                                    <td>
                                    <select class='postform' readonly disabled>
                                        <option>".__("No","wp-google-maps")."</option>
                                        <option>".__("Yes, on the left","wp-google-maps")."</option>
                                        <option>".__("Yes, on the right","wp-google-maps")."</option>
                                        <option>".__("Yes, above","wp-google-maps")."</option>
                                        <option>".__("Yes, below","wp-google-maps")."</option>
                                    </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                    ".__("Directions Box Width","wp-google-maps").":
                                    </td>
                                    <td>
                                    <input type='text' size='4' maxlength='4' class='small-text' readonly disabled /> px
                                    </td>
                                </tr>

                            </table>
                        </div><!-- end of tab2 -->
                        
                        <div id=\"tabs-3\">
                            
                            <table class='' id='wpgmaps_directions_options'>
                                <tr>
                                    <td width='200'>".__("Enable Store Locator","wp-google-maps").":</td>
                                    <td>
                                        <div class='switch'>
                                            <input type='checkbox' id='wpgmza_store_locator' name='wpgmza_store_locator' class='postform cmn-toggle cmn-toggle-yes-no' ".$wpgmza_store_locator_enabled_checked."> <label class='cmn-override-big' for='wpgmza_store_locator' data-on='".__("Yes","wp-google-maps")."' data-off='".__("No","wp-google-maps")."''></label>
                                        </div>
                                    </td>
                                </tr>
								<tr>
									<td width='200'>".__("Store Locator Style","wp-google-maps").":</td>
									<td>
										<ul>
											<li>
												<input type='radio' 						
													name='store_locator_style' 
													value='legacy'"
													. ($store_locator_style == 'legacy' ? 'checked="checked"' : '') . 
													"/>" 
													. __("Legacy", "wp-google-maps") . 
													" 
											</li>
											<li>
												<input type='radio' 
													name='store_locator_style' 
													value='modern'"
													. ($store_locator_style == 'modern' ? 'checked="checked"' : '') . 
													"/>" 
													. __("Modern", "wp-google-maps") . 
													"
											</li>
										</ul>
									</td>
								</tr>
								<tr>
									<td width='200'>".__("Radius Style","wp-google-maps").":</td>
									<td>
										<ul>
											<li>
												<input type='radio' 						
													name='wpgmza_store_locator_radius_style' 
													value='legacy'"
													. ($store_locator_radius_style == 'legacy' ? 'checked="checked"' : '') . 
													"/>" 
													. __("Legacy", "wp-google-maps") . 
													" 
											</li>
											<li>
												<input type='radio' 
													name='wpgmza_store_locator_radius_style' 
													value='modern'"
													. ($store_locator_radius_style == 'modern' ? 'checked="checked"' : '') . 
													"/>" 
													. __("Modern", "wp-google-maps") . 
													"
											</li>
										</ul>
									</td>
								</tr>
                                <tr>
                                    <td width='200'>".__("Restrict to country","wp-google-maps").":</td>
                                    <td>
                                        <select name='wpgmza_store_locator_restrict' id='wpgmza_store_locator_restrict'>";
                                        $countries = wpgmza_return_country_tld_array();

                                        if( $countries ){
                                            echo "<option value=''>".__('No country selected', 'wp-google-maps')."</option>";
                                            foreach( $countries as $key => $val ){

                                                if( $key == $wpgmza_store_locator_restrict ){ $selected = 'selected'; } else { $selected = ''; }
                                                echo "<option value='$key' $selected>$val</option>";

                                            }

                                        }
                                        echo "</select>
                                    </td>
                                </tr>

                                <tr>
                                    <td>".__("Show distance in","wp-google-maps").":</td>
                                    <td>
                                    <div class='switch'>
                                            <input type='checkbox' id='wpgmza_store_locator_distance' name='wpgmza_store_locator_distance' class='postform cmn-toggle cmn-toggle-yes-no' ".$wpgmza_store_locator_distance_checked."> <label class='cmn-override-big-wide' for='wpgmza_store_locator_distance' data-on='".__("Miles","wp-google-maps")."' data-off='".__("Kilometers","wp-google-maps")."''></label>
                                    </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>".__("Default radius","wp-google-maps").":</td>
                                    <td>
                                    <div>";
									
									// TODO: Select the correct option
									
									$suffix = ($wpgmza_store_locator_distance == 1 ? __('mi', 'wp-google-maps') : __('km', 'wp-google-maps'));
									
                                    echo "<select name='wpgmza_store_locator_default_radius' class='wpgmza-store-locator-default-radius'>";
									
									$default_radius = '10';
									if(!empty($other_settings_data['store_locator_default_radius']))
										$default_radius = $other_settings_data['store_locator_default_radius'];
									
									foreach($available_store_locator_radii as $radius)
									{
										$selected = ($radius == $default_radius ? 'selected="selected"' : '');
										echo "<option value='$radius' $selected>{$radius}{$suffix}</option>";
									}
									
									echo "
                                </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>".__("Query string","wp-google-maps").":</td>
                                    <td><input type=\"text\" name=\"wpgmza_store_locator_query_string\" id=\"wpgmza_store_locator_query_string\" value=\"".esc_attr($wpgmza_store_locator_query_string)."\">
                                    </td>
                                </tr>
                                <tr>
                                    <td>".__("Default address","wp-google-maps").":</td>
                                    <td><input type=\"text\" name=\"wpgmza_store_locator_default_address\" id=\"wpgmza_store_locator_default_address\" value=\"".esc_attr($wpgmza_store_locator_default_address)."\">
                                    </td>
                                </tr>
                                <tr>
                                    <td>" . __( "Not found message" ,"wp-google-maps" ) . ":</td>
                                    <td><input type=\"text\" name=\"wpgmza_store_locator_not_found_message\" id=\"wpgmza_store_locator_not_found_message\" value=\"".esc_attr($wpgmza_store_locator_not_found_message)."\">
                                    </td>
                                </tr>
                                <tr>
                                    <td width='200'>".__("Show bouncing icon","wp-google-maps").":</td>
                                    <td>
                                        <div class='switch'>
                                            <input type='checkbox' id='wpgmza_store_locator_bounce' name='wpgmza_store_locator_bounce' class='postform cmn-toggle cmn-toggle-round-flat' ".$wpgmza_store_locator_bounce_checked."> <label for='wpgmza_store_locator_bounce' data-on='".__("Yes","wp-google-maps")."' data-off='".__("No","wp-google-maps")."''></label>
                                        </div>

                                    </td>
                                </tr>

                            </table>
                            <p><em>".__('View','wp-google-maps')." <a href='http://wpgmaps.com/documentation/store-locator' target='_BLANK'>".__('Store Locator Documentation','wp-google-maps')."</a></em></p>
                        </div><!-- end of tab3 -->

                        <div id=\"tabs-4\">

                        <table class='' id='wpgmaps_advanced_options'>
                        <tr>
                            <td width='320'>".__("Enable Bicycle Layer?","wp-google-maps").":</td>
                            <td>

                            <div class='switch'>
                                <input type='checkbox' id='wpgmza_bicycle' name='wpgmza_bicycle' class='postform cmn-toggle cmn-toggle-yes-no' ".$wpgmza_bicycle[1]."> <label class='cmn-override-big' for='wpgmza_bicycle' data-on='".__("Yes","wp-google-maps")."' data-off='".__("No","wp-google-maps")."''></label>
                            </div>
                            </td>
                        </tr>
                        <tr>
                        <td>".__("Enable Traffic Layer?","wp-google-maps").":</td>
                            <td class='wpgmza-open-layers-feature-unavailable'>

                            <div class='switch'>
                                <input type='checkbox' id='wpgmza_traffic' name='wpgmza_traffic' class='postform cmn-toggle cmn-toggle-yes-no' ".$wpgmza_traffic[1]."> <label class='cmn-override-big' for='wpgmza_traffic' data-on='".__("Yes","wp-google-maps")."' data-off='".__("No","wp-google-maps")."''></label>
                            </div>

                            </td>
                        </tr>
                        
                        <tr>
                            <td width='320'>".__("Enable Public Transport Layer?","wp-google-maps").":</td>
                            <td class='wpgmza-open-layers-feature-unavailable'>

                            <div class='switch'>
                                <input type='checkbox' id='wpgmza_transport' name='wpgmza_transport' class='postform cmn-toggle cmn-toggle-yes-no' ".$wpgmza_transport_layer_checked[0]."> <label class='cmn-override-big' for='wpgmza_transport' data-on='".__("Yes","wp-google-maps")."' data-off='".__("No","wp-google-maps")."''></label>
                            </div>

                            </td>
                        </tr>
                        
                        <tr>
                            <td width='320'>".__("Maximum Zoom Level","wp-google-maps").":</td>
                            <td>
                                <select id='wpgmza_max_zoom' name='wpgmza_max_zoom' >
                                    <option value=\"1\" ".$wpgmza_max_zoom[1].">1</option>
                                    <option value=\"2\" ".$wpgmza_max_zoom[2].">2</option>
                                    <option value=\"3\" ".$wpgmza_max_zoom[3].">3</option>
                                    <option value=\"4\" ".$wpgmza_max_zoom[4].">4</option>
                                    <option value=\"5\" ".$wpgmza_max_zoom[5].">5</option>
                                    <option value=\"6\" ".$wpgmza_max_zoom[6].">6</option>
                                    <option value=\"7\" ".$wpgmza_max_zoom[7].">7</option>
                                    <option value=\"8\" ".$wpgmza_max_zoom[8].">8</option>
                                    <option value=\"9\" ".$wpgmza_max_zoom[9].">9</option>
                                    <option value=\"10\" ".$wpgmza_max_zoom[10].">10</option>
                                    <option value=\"11\" ".$wpgmza_max_zoom[11].">11</option>
                                    <option value=\"12\" ".$wpgmza_max_zoom[12].">12</option>
                                    <option value=\"13\" ".$wpgmza_max_zoom[13].">13</option>
                                    <option value=\"14\" ".$wpgmza_max_zoom[14].">14</option>
                                    <option value=\"15\" ".$wpgmza_max_zoom[15].">15</option>
                                    <option value=\"16\" ".$wpgmza_max_zoom[16].">16</option>
                                    <option value=\"17\" ".$wpgmza_max_zoom[17].">17</option>
                                    <option value=\"18\" ".$wpgmza_max_zoom[18].">18</option>
                                    <option value=\"19\" ".$wpgmza_max_zoom[19].">19</option>
                                    <option value=\"20\" ".$wpgmza_max_zoom[20].">20</option>
                                    <option value=\"21\" ".$wpgmza_max_zoom[21].">21</option>
                                </select>
                            </td>
                        </tr>                        
                        
						<tr>
							<td><label for=\"wpgmza_show_points_of_interest\">".__("Show Points of Interest?", "wp-google-maps")."</label></td>
							<td class='wpgmza-open-layers-feature-unavailable'>
								<input id='wpgmza_show_points_of_interest' type='checkbox' id='wpgmza_show_points_of_interest' name='wpgmza_show_points_of_interest' " .
									(
										!isset($other_settings_data['wpgmza_show_points_of_interest']) ||
										$other_settings_data['wpgmza_show_points_of_interest'] == 1
										?
										"checked='checked'"
										:
										''
									)
								. "/>
								
								<label class='cmn-override-big' for='wpgmza_show_points_of_interest' data-on='".__("Yes","wp-google-maps")."' data-off='".__("No","wp-google-maps")."''></label>
							</td>
						</tr>
						
                    </table>

                            <div class=\"update-nag update-att\">
                                
								<i class=\"fa fa-arrow-circle-right\"> </i> " .
								sprintf( /* translators: %s: WP Google Maps Pro Link */ 
									__(
										"Get the rest of these advanced features with the Pro version for only <a href=\"%s\" target=\"_BLANK\">$39.99 once off</a>. Support and updates included forever.",
										"wp-google-maps"
									), 
									wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=advanced") 
								) . "
                                    
                            </div>

                            <table class='form-table' id='wpgmaps_advanced_options'>
                                <tr>
                                    <td>".__("Default Marker Image","wp-google-maps").":</td>
                                    <td><input id=\"\" name=\"\" type='hidden' size='35' class='regular-text' maxlength='700' value='".$res->default_marker."' ".$wpgmza_act."/> <input id=\"upload_default_marker_btn\" type=\"button\" value=\"".__("Upload Image","wp-google-maps")."\" $wpgmza_act /> <a href=\"javascript:void(0);\" onClick=\"document.forms['wpgmza_map_form'].upload_default_marker.value = ''; var span = document.getElementById('wpgmza_mm'); while( span.firstChild ) { span.removeChild( span.firstChild ); } span.appendChild( document.createTextNode('')); return false;\" title=\"Reset to default\">-reset-</a></td>
                                </tr>

                                <tr>
                                    <td>".__("Show User's Location?","wp-google-maps").":</td>
                                    <td><!--<select class='postform' readonly disabled>
                                        <option >".__("No","wp-google-maps")."</option>
                                        <option >".__("Yes","wp-google-maps")."</option>
                                    </select>-->

                                    <div class='switch grey-out'>
                                        <input type='checkbox' class='cmn-toggle cmn-toggle-yes-no' disabled> <label class='cmn-override-big' data-on='".__("Yes","wp-google-maps")."' data-off='".__("No","wp-google-maps")."''></label>
                                    </div>

                                    </td>
                                </tr>
								
                                <tr>
                                    <td>".__("KML/GeoRSS URL","wp-google-maps").":</td>
                                    <td class='wpgmza-open-layers-feature-unavailable'>
                                     <input type='text' size='100' maxlength='700' class='regular-text' readonly disabled /> <em><small>".__("The KML/GeoRSS layer will over-ride most of your map settings","wp-google-maps")."</small></em></td>
                                    </td>
                                </tr>
                                <tr>
                                    <td>".__("Fusion table ID","wp-google-maps").":</td>
                                    <td class='wpgmza-open-layers-feature-unavailable'>
                                     <input type='text' size='20' maxlength='200' class='small-text' readonly disabled /> <em><small>".__("Read data directly from your Fusion Table.","wp-google-maps")."</small></em></td>
                                    </td>
                                </tr>
                            </table>
                        </div><!-- end of tab4 -->
                        <div id=\"tabs-5\" style=\"font-family:sans-serif;\">
                            <div class=\"update-nag update-att\">
                                
                                        <i class=\"fa fa-arrow-circle-right\"> </i> ".__("Enable Marker Listing with the <a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=marker_listing")."\" target=\"_BLANK\">Pro version for only $39.99 once off</a>. Support and updates included forever.","wp-google-maps")."
                                    
                            </div>
                            <br>
                            <table class='' id='wpgmaps_marker_listing_options' style='padding: 12px;'>
                                <tr>
                                     <td valign=\"top\">".__("List Markers","wp-google-maps").":</td>
                                     <td>

                                        <input type=\"radio\" disabled >".__("None","wp-google-maps")."<br />
                                        <input type=\"radio\" disabled >".__("Basic table","wp-google-maps")."<br />
                                        <input type=\"radio\" disabled >".__("Advanced table with real time search and filtering","wp-google-maps")."<br />
                                        <input type=\"radio\" disabled >".__("Carousel","wp-google-maps")." (".__("beta","wp-google-maps").")<br />


                                    </td>
                                </tr>
                                <tr>
                                     <td>".__("Filter by Category","wp-google-maps").":</td>
                                     <td>
                                       <div class='switch'>
                                         <input id='wpgmza_filterbycat' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled /> <label for='wpgmza_filterbycat'></label> </div>".__("Allow users to filter by category?","wp-google-maps")."
                                       
                                    </td>
                                </tr>
                                <tr>
                                     <td>".__("Order markers by","wp-google-maps").":</td>
                                     <td>
                                        <select disabled class='postform'>
                                            <option >".__("ID","wp-google-maps")."</option>
                                            <option >".__("Title","wp-google-maps")."</option>
                                            <option >".__("Address","wp-google-maps")."</option>
                                            <option >".__("Description","wp-google-maps")."</option>
                                            <option >".__("Category","wp-google-maps")."</option>
                                        </select>
                                        <select disabled class='postform'>
                                            <option >".__("Ascending","wp-google-maps")."</option>
                                            <option >".__("Descending","wp-google-maps")."</option>
                                        </select>

                                    </td>
                                </tr>

                                <tr style='height:20px;'>
                                     <td></td>
                                     <td></td>
                                </tr>

                                <tr>
                                     <td valign='top'>".__("Move list inside map","wp-google-maps").":</td>
                                     <td>
                                       <div class='switch'>
                                        <input disabled type='checkbox' value='1' class='cmn-toggle cmn-toggle-round-flat' /> <label></label></div>".__("Move your marker list inside the map area","wp-google-maps")."<br />

                                        ".__("Placement: ","wp-google-maps")."
                                        <select readonly disabled id='wpgmza_push_in_map_placement' name='wpgmza_push_in_map_placement' class='postform'>
                                            <option>".__("Top Center","wp-google-maps")."</option>
                                            <option>".__("Top Left","wp-google-maps")."</option>
                                            <option>".__("Top Right","wp-google-maps")."</option>
                                            <option>".__("Left Top ","wp-google-maps")."</option>
                                            <option>".__("Right Top","wp-google-maps")."</option>
                                            <option>".__("Left Center","wp-google-maps")."</option>
                                            <option>".__("Right Center","wp-google-maps")."</option>
                                            <option>".__("Left Bottom","wp-google-maps")."</option>
                                            <option>".__("Right Bottom","wp-google-maps")."</option>
                                            <option>".__("Bottom Center","wp-google-maps")."</option>
                                            <option>".__("Bottom Left","wp-google-maps")."</option>
                                            <option>".__("Bottom Right","wp-google-maps")."</option>
                                        </select> <br />
                                    </td>
                                </tr>
                                <tr style='height:20px;'>
                                     <td></td>
                                     <td></td>
                                </tr>                                

                            </table>
                            <div class=\"about-wrap\">
                            <div class=\"feature-section three-col\">
                                <div class=\"col\">
                                 <div class='wpgmza-promo'>
                                     <img src='".WPGMAPS_DIR."base/assets/marker-listing-basic.jpg'/>     
                                     <div class='wpgmza-promo-overlay'>          
                                         <h4>".__("Basic","wp-google-maps")."</h4>
                                         <p style='display:block; height:40px;'>".__("Show a basic list of your markers","wp-google-maps")."</p>
                                     </div>
                                 </div>
                                </div>
                                <div class=\"col\">
                                 <div class='wpgmza-promo'>
                                     <img src='".WPGMAPS_DIR."base/assets/marker-listing-carousel.jpg' />
                                     <div class='wpgmza-promo-overlay'>     
                                         <h4>".__("Carousel","wp-google-maps")."</h4>
                                         <p style='display:block; height:40px;'>".__("Beautiful, responsive, mobile-friendly carousel marker listing","wp-google-maps")."</p>
                                     </div>
                                 </div>            
                                </div>
                                <div class=\"col\">
                                 <div class='wpgmza-promo'>
                                     <img src='".WPGMAPS_DIR."base/assets/marker-listing-advanced.jpg' />    
                                     <div class='wpgmza-promo-overlay'>   
                                         <h4>".__("Tabular","wp-google-maps")."</h4>
                                         <p style='display:block; height:40px;'>".__("Advanced, tabular marker listing functionality with real time filtering","wp-google-maps")."</p>   
                                     </div>       
                                 </div>
                                </div>
                            </div>
                            </div>

                        </div>
                        <div id=\"tabs-6\" style=\"font-family:sans-serif;\">
                            <h1 style=\"font-weight:200;\">12 Amazing Reasons to Upgrade to our Pro Version</h1>
                            <p style=\"font-size:16px; line-height:28px;\">We've spent over two years upgrading our plugin to ensure that it is the most user-friendly and comprehensive map plugin in the WordPress directory. Enjoy the peace of mind knowing that you are getting a truly premium product for all your mapping requirements. Did we also mention that we have fantastic support?</p>
                            <div id=\"wpgm_premium\">
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Create custom markers with detailed info windows</h2>
                                        <p>Add titles, descriptions, HTML, images, animations and custom icons to your markers.</p>
                                    </div>
                                </div>
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Enable directions</h2>
                                        <p>Allow your visitors to get directions to your markers. Either use their location as the starting point or allow them to type in an address.</p>
                                    </div>
                                </div>
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Unlimited maps</h2>
                                        <p>Create as many maps as you like.</p>
                                    </div>
                                </div>
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>List your markers</h2>
                                        <p>Choose between three methods of listing your markers.</p>
                                    </div>
                                </div>                                
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Add categories to your markers</h2>
                                        <p>Create and assign categories to your markers which can then be filtered on your map.</p>
                                    </div>
                                </div>                                
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Advanced options</h2>
                                        <p>Enable advanced options such as showing your visitor's location, marker sorting, bicycle layers, traffic layers and more!</p>
                                    </div>
                                </div>  
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Import / Export</h2>
                                        <p>Export your markers to a CSV file for quick and easy editing. Import large quantities of markers at once.</p>
                                    </div>
                                </div>                                
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Add KML & Fusion Tables</h2>
                                        <p>Add your own KML layers or Fusion Table data to your map</p>
                                    </div>
                                </div>                                   
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Polygons and Polylines</h2>
                                        <p>Add custom polygons and polylines to your map by simply clicking on the map. Perfect for displaying routes and serviced areas.</p>
                                    </div>
                                </div>
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Amazing Support</h2>
                                        <p>We pride ourselves on providing quick and amazing support. <a target=\"_BLANK\" href=\"http://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5\">Read what some of our users think of our support</a>.</p>
                                    </div>
                                </div>
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Easy Upgrade</h2>
                                        <p>You'll receive a download link immediately. Simply upload and activate the Pro plugin to your WordPress admin area and you're done!</p>
                                    </div>
                                </div>                                  
                                <div class=\"wpgm_premium_row\">
                                    <div class=\"wpgm_icon\"></div>
                                    <div class=\"wpgm_details\">
                                        <h2>Free updates and support forever</h2>
                                        <p>Once you're a pro user, you'll receive free updates and support forever! You'll also receive amazing specials on any future plugins we release.</p>
                                    </div>
                                </div>              
                                
                                <br /><p>Get all of this and more for only $39.99 once off</p>                                
                                <br /><a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=upgradenow")."\" target=\"_BLANK\" title=\"Upgrade now for only $39.99 once off\" class=\"button-primary\" style=\"font-size:20px; display:block; width:220px; text-align:center; height:42px; line-height:41px;\">Upgrade Now</a>
                                <br /><br />
                                <a href=\"".wpgm_pro_link("https://www.wpgmaps.com/demo/")."\" target=\"_BLANK\">View the demos</a>.<br /><br />
                                Have a sales question? Contact either Nick on <a href=\"mailto:nick@wpgmaps.com\">nick@wpgmaps.com</a> or use our <a href=\"http://www.wpgmaps.com/contact-us/\" target=\"_BLANK\">contact form</a>. <br /><br />
                                Need help? <a href=\"https://www.wpgmaps.com/forums/\" target=\"_BLANK\">Ask a question on our support forum</a>.       
                                


                        </div><!-- end of tab5 -->   
                        
                        </div>
                        </div>
                    
                    <!-- end of tabs -->


                            
                            <p class='submit'><input type='submit' name='wpgmza_savemap' class='button-primary' value='".__("Save Map","wp-google-maps")." &raquo;' /></p>
                                
                            <p style=\"width:100%; color:#808080;\">
                                ".__("Tip: Use your mouse to change the layout of your map. When you have positioned the map to your desired location, press \"Save Map\" to keep your settings.","wp-google-maps")."</p>

                            <div style='display:block; overflow:auto; width:100%;'>
                            
                            <div style='display:block; width:49%; margin-right:1%; overflow:auto; float:left;'>
                                <div id=\"wpgmaps_tabs_markers\">
                                    <ul>
                                            <li><a href=\"#tabs-m-1\" class=\"tabs-m-1\">".__("Markers","wp-google-maps")."</a></li>
                                            <li><a href=\"#tabs-m-2\" class=\"tabs-m-1\">".__("Advanced markers","wp-google-maps")."</a></li>
                                            <li><a href=\"#tabs-m-3\" class=\"tabs-m-2\">".__("Polygon","wp-google-maps")."</a></li>
                                            <li><a href=\"#tabs-m-4\" class=\"tabs-m-3\">".__("Polylines","wp-google-maps")."</a></li>
                                            <li><a href=\"#tabs-m-5\" class=\"tabs-m-3\">".__("Heatmaps","wp-google-maps")."</a></li>
											<li><a href=\"#tabs-circles\">".__("Circles","wp-google-maps")."</a></li>
											<li><a href=\"#tabs-rectangles\">".__("Rectangles","wp-google-maps")."</a></li>
                                    </ul>
                                    <div id=\"tabs-m-1\">


                                        <h2 style=\"padding-top:0; margin-top:0;\">".__("Markers","wp-google-maps")."</h2>
                                        <table>
                                            <input type=\"hidden\" name=\"wpgmza_edit_id\" id=\"wpgmza_edit_id\" value=\"\" />
                                            <tr>
                                                <td valign='top'>".__("Address/GPS","wp-google-maps").": </td>
                                                <td><input id='wpgmza_add_address' name='wpgmza_add_address' type='text' size='35' maxlength='200' value=''  /> <br /><small><em>".__("Or right click on the map","wp-google-maps")."</small></em><br /><br /></td>

                                            </tr>

                                            <tr>
                                                <td>".__("Animation","wp-google-maps").": </td>
                                                <td>
                                                    <select name=\"wpgmza_animation\" id=\"wpgmza_animation\">
                                                        <option value=\"0\">".__("None","wp-google-maps")."</option>
                                                        <option value=\"1\">".__("Bounce","wp-google-maps")."</option>
                                                        <option value=\"2\">".__("Drop","wp-google-maps")."</option>
                                                </td>
                                            </tr>


                                            <tr>
                                                <td>".__("InfoWindow open by default","wp-google-maps").": </td>
                                                <td>
                                                    <select name=\"wpgmza_infoopen\" id=\"wpgmza_infoopen\">
                                                        <option value=\"0\">".__("No","wp-google-maps")."</option>
                                                        <option value=\"1\">".__("Yes","wp-google-maps")."</option>
                                                </td>
                                            </tr>
                                        <tr>
                                            <td></td>
                                            <td>
                                                <span id=\"wpgmza_addmarker_div\"><input type=\"button\" class='button-primary' id='wpgmza_addmarker' value='".__("Add Marker","wp-google-maps")."' /></span> <span id=\"wpgmza_addmarker_loading\" style=\"display:none;\">".__("Adding","wp-google-maps")."...</span>
                                                <span id=\"wpgmza_editmarker_div\" style=\"display:none;\"><input type=\"button\" id='wpgmza_editmarker'  class='button-primary' value='".__("Save Marker","wp-google-maps")."' /></span><span id=\"wpgmza_editmarker_loading\" style=\"display:none;\">".__("Saving","wp-google-maps")."...</span>
                                                    <div id=\"wpgm_notice_message_save_marker\" style=\"display:none;\">
                                                        <div class=\"update-nag\" style='text-align:left; padding:1px; margin:1px; margin-top:5px'>
                                                                 <h4 style='padding:1px; margin:1px;'>".__("Remember to save your marker","wp-google-maps")."</h4>
                                                        </div>

                                                    </div>
                                                    <div id=\"wpgm_notice_message_addfirst_marker\" style=\"display:none;\">
                                                        <div class=\"update-nag\" style='text-align:left; padding:1px; margin:1px; margin-top:5px'>
                                                                 <h4 style='padding:1px; margin:1px;'>".__("Please add the current marker before trying to add another marker","wp-google-maps")."</h4>
                                                        </div>

                                                    </div>
                                            </td>

                                        </tr>

                                        </table>
                                    </div>

                                    <div id=\"tabs-m-2\">
                                        <h2 style=\"padding-top:0; margin-top:0;\">".__("Advanced markers","wp-google-maps")."</h2>
                                        <div class=\"update-nag update-att\">
                                                    <i class=\"fa fa-arrow-circle-right\"> </i> <a target=\"_BLANK\" href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=advanced_markers")."\">".__("Add advanced markers","wp-google-maps")."</a> ".__("with the Pro version","wp-google-maps")."
                                        </div><br>
                                        <table>
                                        <tr>
                                            <td>".__("Address/GPS","wp-google-maps").": </td>
                                            <td><input id='' name='' type='text' size='35' maxlength='200' value=''  $wpgmza_act /> &nbsp;<br /></td>

                                        </tr>

                                        <tr>
                                            <td>".__("Animation","wp-google-maps").": </td>
                                            <td>
                                                <select name=\"\" id=\"\">
                                                    <option value=\"0\">".__("None","wp-google-maps")."</option>
                                                    <option value=\"1\">".__("Bounce","wp-google-maps")."</option>
                                                    <option value=\"2\">".__("Drop","wp-google-maps")."</option>
                                            </td>
                                        </tr>


                                        <tr>
                                            <td>".__("InfoWindow open by default","wp-google-maps").": </td>
                                            <td>
                                                <select name=\"\" id=\"\">
                                                    <option value=\"0\">".__("No","wp-google-maps")."</option>
                                                    <option value=\"1\">".__("Yes","wp-google-maps")."</option>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>".__("Title","wp-google-maps").": </td>
                                            <td><input id='' name='' type='text' size='35' maxlength='200' value='' $wpgmza_act /></td>

                                        </tr>

                                        <tr><td>".__("Description","wp-google-maps").": </td>
                                            <td><textarea id='' name='' ".$wpgmza_act."  style='background-color:#EEE; width:272px;'></textarea>  &nbsp;<br /></td></tr>
                                        <tr><td>".__("Pic URL","wp-google-maps").": </td>
                                            <td><input id='' name=\"\" type='text' size='35' maxlength='700' value='' ".$wpgmza_act."/> <input id=\"\" type=\"button\" value=\"".__("Upload Image","wp-google-maps")."\" $wpgmza_act /><br /></td></tr>
                                        <tr><td>".__("Link URL","wp-google-maps").": </td>
                                            <td><input id='' name='' type='text' size='35' maxlength='700' value='' ".$wpgmza_act." /></td></tr>
                                        <tr><td>".__("Custom Marker","wp-google-maps").": </td>
                                            <td><input id='' name=\"\" type='hidden' size='35' maxlength='700' value='' ".$wpgmza_act."/> <input id=\"\" type=\"button\" value=\"".__("Upload Image","wp-google-maps")."\" $wpgmza_act /> &nbsp;</td></tr>
										<tr>
											<td>
												" . __('My custom field:', 'wp-google-maps') . "
											</td>
											<td>
												<input disabled/>
											</td>
										</tr>
                                        <tr>
                                            <td>".__("Category","wp-google-maps").": </td>
                                            <td>
                                                <select readonly disabled>
                                                    <option value=\"0\">".__("Select","wp-google-maps")."</option>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td>
                                                <input type=\"button\" class='button-primary' disabled id='' value='".__("Add Marker","wp-google-maps")."' />
                                            </td>

                                            </tr>

                                        </table>
                                        <p>$wpgmza_act_msg</p>
                                        <br /><br />$wpgmza_csv
                                    </div>

                                    <div id=\"tabs-m-3\" class='wpgmza-open-layers-feature-coming-soon'>
                                        <h2 style=\"padding-top:0; margin-top:0;\"> ".__("Polygons","wp-google-maps")."</h2>
                                        <span id=\"wpgmza_addpolygon_div\"><a href='".get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-menu&action=add_poly&map_id=".sanitize_text_field($_GET['map_id'])."' id='wpgmza_addpoly' class='button-primary' value='".__("Add a New Polygon","wp-google-maps")."' />".__("Add a New Polygon","wp-google-maps")."</a></span>
                                        <div id=\"wpgmza_poly_holder\">".wpgmza_b_return_polygon_list(sanitize_text_field($_GET['map_id']))."</div>
                                    </div>
                                    <div id=\"tabs-m-4\" class='wpgmza-open-layers-feature-coming-soon'>
                                        <h2 style=\"padding-top:0; margin-top:0;\"> ".__("Polylines","wp-google-maps")."</h2>
                                        <span id=\"wpgmza_addpolyline_div\"><a href='".get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-menu&action=add_polyline&map_id=".sanitize_text_field($_GET['map_id'])."' id='wpgmza_addpolyline' class='button-primary' value='".__("Add a New Polyline","wp-google-maps")."' />".__("Add a New Polyline","wp-google-maps")."</a></span>
                                        <div id=\"wpgmza_polyline_holder\">".wpgmza_b_return_polyline_list(sanitize_text_field($_GET['map_id']))."</div>
                                    </div>
									
									<div id=\"tabs-circles\" class='wpgmza-open-layers-feature-coming-soon'>
										<h2>
											" . __('Add a Circle', 'wp-google-maps') . "
										</h2>
										<span><a class=\"button-primary\" href=\"" . get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu&action=add_circle&map_id=" . $_GET['map_id'] . "\">" . __("Add a Circle", "wp-google-maps") . "</a></span>
										" . wpgmza_get_circles_table($_GET['map_id']) . "
									</div>
									
									<div id=\"tabs-rectangles\" class='wpgmza-open-layers-feature-coming-soon'>
										<h2>
											" . __('Add a Rectangle', 'wp-google-maps') . "
										</h2>
										<span><a class=\"button-primary\" href=\"" . get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu&action=add_rectangle&map_id=" . $_GET['map_id'] . "\">" . __("Add a Rectangle", "wp-google-maps") . "</a></span>
										" . wpgmza_get_rectangles_table($_GET['map_id']) . "
									</div>
									
                                    <div id=\"tabs-m-5\" class='wpgmza-open-layers-feature-coming-soon'>
                                        <h2 style=\"padding-top:0; margin-top:0;\"> ".__("Heatmaps","wp-google-maps")."</h2>
                                        <a target=\"_BLANK\" href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=heatmaps")."\">".__("Add dynamic heatmap data","wp-google-maps")."</a> ".__("with the Pro version.","wp-google-maps")."
                                        <a target=\"_BLANK\" href=\"https://www.wpgmaps.com/demo/heatmaps-demo/?utm_source=plugin&utm_medium=link&utm_campaign=heatmap_demo\">".__("View a demo.","wp-google-maps")."</a>
                                    </div>
                                </div>
                            </div>
                            <div style='display:block; width:50%; overflow:auto; float:left;'>
                            

                                <div id=\"wpgmza_map\">
                                    <div class=\"update-nag\" style='text-align:center;'>
                                        <small><strong>".__("The map could not load.","wp-google-maps")."</strong><br />".__("This is normally caused by a conflict with another plugin or a JavaScript error that is preventing our plugin's Javascript from executing. Please try disable all plugins one by one and see if this problem persists.","wp-google-maps")."</small>
                                           
                                    </div>
                                </div>
                                <div id=\"wpgmaps_save_reminder\" style=\"display:none;\">
                                    <div class=\"update-nag\" style='text-align:center;'>                                        
                                        <h4>".__("Remember to save your map!","wp-google-maps")."</h4>                                        
                                    </div>
                                </div>
                                <div id='wpgmaps_marker_cache_reminder' style='display: none;'>                                
                                    ".wpgmza_caching_notice_changes(true, true)."
                                </div>
                            </div>
                        </div>
                            


                            
                        </form>
                            
                            <h2 style=\"padding-top:0; margin-top:20px;\">".__("Your Markers","wp-google-maps")."</h2>
                            <div id=\"wpgmza_marker_holder\">
                            ".wpgmza_return_marker_list(sanitize_text_field($_GET['map_id']))."
                            </div>
                        
                            <table style='clear:both;'>
                                <tr>
                                    <td><img src=\"".wpgmaps_get_plugin_url()."images/custom_markers.jpg\" width=\"260\" class='wpgmza-promo' title=\"".__("Add detailed information to your markers!")."\" alt=\"".__("Add custom markers to your map!","wp-google-maps")."\" /><br /><br /></td>
                                    <td valign=\"middle\"><span style=\"font-size:18px; color:#666; margin-left: 15px;\">".__("Add detailed information to your markers for only","wp-google-maps")." <strong>$39.99</strong>. ".__("Click","wp-google-maps")." <a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=image1")."\" title=\"Pro Edition\" target=\"_BLANK\">".__("here","wp-google-maps")."</a></span></td>
                                </tr>
                                <tr>
                                    <td><img src=\"".wpgmaps_get_plugin_url()."images/custom_marker_icons.jpg\" width=\"260\" class='wpgmza-promo' title=\"".__("Add custom markers to your map!","wp-google-maps")."\" alt=\"".__("Add custom markers to your map!","wp-google-maps")."\" /><br /><br /></td>
                                    <td valign=\"middle\"><span style=\"font-size:18px; color:#666; margin-left: 15px;\">".__("Add different marker icons, or your own icons to make your map really stand out!","wp-google-maps")." ".__("Click","wp-google-maps")." <a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=image3")."\" title=\"".__("Pro Edition","wp-google-maps")."\" target=\"_BLANK\">".__("here","wp-google-maps")."</a></span></td>
                                </tr>
                                <tr>
                                    <td><img src=\"".wpgmaps_get_plugin_url()."images/get_directions.jpg\" width=\"260\" class='wpgmza-promo' title=\"".__("Add custom markers to your map!","wp-google-maps")."\" alt=\"".__("Add custom markers to your map!","wp-google-maps")."\" /><br /><br /></td>
                                    <td valign=\"middle\"><span style=\"font-size:18px; color:#666; margin-left: 15px;\">".__("Allow your visitors to get directions to your markers!","wp-google-maps")." ".__("Click","wp-google-maps")." <a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=image2")."\" title=\"".__("Pro Edition","wp-google-maps")."\" target=\"_BLANK\">".__("here","wp-google-maps")."</a></span></td>
                                </tr>

                            </table>

                   <p>
						<small>
							" . __("Thank you for using <a href='https://www.wpgmaps.com'>WP Google Maps</a>! Please <a href='https://wordpress.org/support/plugin/wp-google-maps/reviews/'>rate us on WordPress.org</a>", 'wp-google-maps') . "
							|
							" . __("WP Google Maps is a product of <img src='" . plugin_dir_url(__FILE__) . "images/codecabin.png' alt='CODECABIN_' style='height: 1em;'/>", 'wp-google-maps') . "
							|
							" . __("Please refer to our <a href='https://www.wpgmaps.com/privacy-policy' target='_blank'>Privacy Policy</a> for information on Data Processing", 'wp-google-maps') . "
							|
							" . __("WP Google Maps encourages you to make use of the amazing icons at ", "wp-google-maps") . "<a href='https://mappity.org'>https://mappity.org</a>
						</small>
					</p>
                </div>


            </div>



        ";



}



function wpgmza_edit_marker($mid) {
    global $wpgmza_tblname_maps;

    global $wpdb;
    if ($_GET['action'] == "edit_marker" && isset($mid)) {
        $mid = sanitize_text_field($mid);
        $res = wpgmza_get_marker_data($mid);
        echo "
           <div class='wrap'>
                <h1>WP Google Maps</h1>
                <div class='wide'>

                    <h2>".__("Edit Marker Location","wp-google-maps")." ".__("ID","wp-google-maps")."#$mid</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".$res->map_id."' method='post' id='wpgmaps_edit_marker'>
                    <p></p>

                    <input type='hidden' name='wpgmaps_marker_id' id='wpgmaps_marker_id' value='".$mid."' />
                    <div id=\"wpgmaps_status\"></div>
                    <table>

                        <tr>
                            <td>".__("Marker Latitude","wp-google-maps").":</td>
                            <td><input id='wpgmaps_marker_lat' name='wpgmaps_marker_lat' type='text' size='15' maxlength='100' value='".$res->lat."' /></td>
                        </tr>
                        <tr>
                            <td>".__("Marker Longitude","wp-google-maps").":</td>
                            <td><input id='wpgmaps_marker_lng' name='wpgmaps_marker_lng' type='text' size='15' maxlength='100' value='".$res->lng."' /></td>
                        </tr>

                    </table>
                    <p class='submit'><input type='submit' name='wpgmza_save_maker_location' class='button-primary' value='".__("Save Marker Location","wp-google-maps")." &raquo;' /></p>
                    <p style=\"width:600px; color:#808080;\">".__("Tip: Use your mouse to change the location of the marker. Simply click and drag it to your desired location.","wp-google-maps")."</p>


                    <div id=\"wpgmza_map\">
                        <div class=\"update-nag\" style='text-align:center;'>
                            <ul>
                                <li><small><strong>".__("The map could not load.","wp-google-maps")."</strong><br />".__("This is normally caused by a conflict with another plugin or a JavaScript error that is preventing our plugin's Javascript from executing. Please try disable all plugins one by one and see if this problem persists. If it persists, please contact nick@wpgmaps.com for support.","wp-google-maps")."</small>
                                </li>
                            </ul>
                        </div>
                    </div>




                    </form>
                </div>


            </div>



        ";

    }



}





function wpgmaps_admin_scripts() {
    wp_enqueue_script( 'jquery' );
    wp_enqueue_script('jquery-ui-core');
    wp_enqueue_script('jquery-ui-slider');
	
	global $wpgmza;
	$wpgmza->loadScripts();

    $wpgmza_lang_strings = array(
        "wpgm_copy_string" => __("Copied to clipboard","wp-google-maps")
    );

    if (!function_exists("wpgmza_register_pro_version")) {
        wp_register_script('wpgmaps-admin-basic', plugins_url('js/admin-basic.js', __FILE__), array('jquery'), '1.0', true);
        wp_enqueue_script('wpgmaps-admin-basic');
        wp_localize_script( 'wpgmaps-admin-basic', 'wpgmaps_localize_strings', $wpgmza_lang_strings);
    }

    if (function_exists('wp_enqueue_media')) {
        wp_enqueue_media();
        wp_register_script('my-wpgmaps-upload', plugins_url('js/media.js', __FILE__), array('jquery'), '1.0', true);
        wp_enqueue_script('my-wpgmaps-upload');
    } else {
        wp_enqueue_script('media-upload');
        wp_enqueue_script('thickbox');
        wp_register_script('my-wpgmaps-upload', WP_PLUGIN_URL.'/'.plugin_basename(dirname(__FILE__)).'/upload.js', array('jquery','media-upload','thickbox'));
        wp_enqueue_script('my-wpgmaps-upload');
    }

    if (isset($_GET['action'])) {
        if ($_GET['action'] == "add_poly" || $_GET['action'] == "edit_poly" || $_GET['action'] == "add_polyline" || $_GET['action'] == "edit_polyline") {
            wp_register_script('my-wpgmaps-color', plugins_url('js/jscolor.js',__FILE__), false, '1.4.1', false);
            wp_enqueue_script('my-wpgmaps-color');
        }
        if ($_GET['page'] == "wp-google-maps-menu" && $_GET['action'] == "edit") {
            wp_enqueue_script( 'jquery-ui-tabs');
            wp_register_script('my-wpgmaps-tabs', plugins_url('js/wpgmaps_tabs.js',__FILE__), array('jquery-ui-core'), '1.0.1', true);
            wp_enqueue_script('my-wpgmaps-tabs');
            wp_register_script('my-wpgmaps-color', plugins_url('js/jscolor.js',__FILE__), false, '1.4.1', false);
            wp_enqueue_script('my-wpgmaps-color');
        }
    }
    if (isset($_GET['page'])) {
        
        if ($_GET['page'] == "wp-google-maps-menu-settings") {
            wp_enqueue_script( 'jquery-ui-tabs');
            if (wp_script_is('my-wpgmaps-tabs','registered')) {  } else {
                //wp_register_style('jquery-ui-smoothness', '//code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css');
                //wp_enqueue_style('jquery-ui-smoothness');
                //Using custom stylesheet instead
                wp_register_script('my-wpgmaps-tabs', WPGMAPS_DIR.'js/wpgmaps_tabs.js', array('jquery-ui-core'), '1.0.1', true);
                wp_enqueue_script('my-wpgmaps-tabs');
                
            }
        }

        if ($_GET['page'] == "wp-google-maps-menu-support" && !function_exists('wpgmaps_admin_styles_pro'))
            wpgmza_enqueue_fontawesome();

        if(strpos($_GET['page'], "wp-google-maps") !== false){
            wp_register_style('wpgmaps-admin-style', plugins_url('css/wp-google-maps-admin.css', __FILE__));
            wp_enqueue_style('wpgmaps-admin-style');
        }
    }
    /**
     * Deprecated - anonymous tracking is now sent when a map is saved, if the option is enabled.      
     */
    /*
    if( isset( $wpgmza_settings['wpgmza_settings_enable_usage_tracking'] ) && $wpgmza_settings['wpgmza_settings_enable_usage_tracking'] == 'yes' ){      
        if( ( isset( $_GET['action'] ) && $_GET['action'] == 'edit' ) && isset( $_GET['map_id'] ) ){
            wp_register_script('wpgmaps-usage-tracking', WPGMAPS_DIR.'js/usage_tracking.js', array('jquery'), '1.0.0', true);
            wp_enqueue_script('wpgmaps-usage-tracking');
        }
    }
    */
}
function wpgmaps_user_styles() {
    
    if (!function_exists('wpgmaps_admin_styles_pro')) {
        global $wpgmza_version;
        global $short_code_active;
        if ($short_code_active) {
            wp_register_style( 'wpgmaps-style', plugins_url('css/wpgmza_style.css', __FILE__),array(),$wpgmza_version);
            wp_enqueue_style( 'wpgmaps-style' );
        }
    }
    
    do_action("wpgooglemaps_hook_user_styles");


}

function wpgmaps_admin_styles() {
	global $wpgmza_version;
	
	wp_enqueue_style('thickbox');

	wpgmza_enqueue_fontawesome();

}

if (isset($_GET['page'])) {

    if ($_GET['page'] == 'wp-google-maps-menu' || $_GET['page'] == 'wp-google-maps-menu-settings' || $_GET['page'] == "wp-google-maps-menu-support") {
        add_action('admin_print_scripts', 'wpgmaps_admin_scripts');
        add_action('admin_print_styles', 'wpgmaps_admin_styles');
    }
}

add_action('wp_print_styles', 'wpgmaps_user_styles');

add_action( 'wpgooglemaps_hook_user_js_after_core', 'wpgmaps_user_scripts' );
/**
 * Load custom user JavaScript.
 */
function wpgmaps_user_scripts() {

	static $add_script = true;
	
	if ( ! $add_script ) {

		return;

	}

	$wpgmza_main_settings = get_option( 'WPGMZA_OTHER_SETTINGS' );

	if ( ! empty( $wpgmza_main_settings['wpgmza_custom_js'] ) ) {

		wp_add_inline_script( 'wpgmaps_core', stripslashes( $wpgmza_main_settings['wpgmza_custom_js'] ) );
		$add_script = false;

	}
}

if(!function_exists('wpgmza_get_marker_columns'))
{
    function wpgmza_get_marker_columns()
    {
        global $wpdb;
		global $wpgmza;
        global $wpgmza_tblname;
        global $wpgmza_pro_version;
        
        $useSpatialData = empty($wpgmza_pro_version) || version_compare('7.0', $wpgmza_pro_version, '>=');
        
        $columns = $wpdb->get_col("SHOW COLUMNS FROM $wpgmza_tblname");
        
        if($useSpatialData)
        {
            if(($index = array_search('lat', $columns)) !== false)
                array_splice($columns, $index, 1);
            if(($index = array_search('lng', $columns)) !== false)
                array_splice($columns, $index, 1);
        }
        
        for($i = count($columns) - 1; $i >= 0; $i--)
            $columns[$i] = '`' . trim($columns[$i], '`') . '`';
        
        if($useSpatialData)
        {
            $columns[] = "{$wpgmza->spatialFunctionPrefix}X(latlng) AS lat";
            $columns[] = "{$wpgmza->spatialFunctionPrefix}Y(latlng) AS lng";
        }
        
        return $columns;
    }
}

function wpgmza_return_marker_list($map_id,$admin = true,$width = "100%",$mashup = false,$mashup_ids = false) {
    global $wpdb;
    global $wpgmza_tblname;
    
	$columns = implode(', ', wpgmza_get_marker_columns());
	
    if ($mashup) {
        $map_ids = $mashup_ids;
        $wpgmza_cnt = 0;

        if ($mashup_ids[0] == "ALL") {

            $wpgmza_sql1 = "SELECT $columns FROM $wpgmza_tblname ORDER BY `id` DESC";
        }
        else {
            $wpgmza_id_cnt = count($map_ids);
            $sql_string1 = "";
            foreach ($map_ids as $wpgmza_map_id) {
                $wpgmza_cnt++;
                if ($wpgmza_cnt == 1) { $sql_string1 .= $wpdb->prepare("`map_id` = %d ",$wpgmza_map_id); }
                elseif ($wpgmza_cnt > 1 && $wpgmza_cnt < $wpgmza_id_cnt) { $sql_string1 .= $wpdb->prepare("OR `map_id` = %d ",$wpgmza_map_id); }
                else { $sql_string1 .= $wpdb->prepare("OR `map_id` = %d ",$wpgmza_map_id); }

            }
            $wpgmza_sql1 = "SELECT $columns FROM $wpgmza_tblname WHERE $sql_string1 ORDER BY `id` DESC";

        }

    } else {
        $wpgmza_sql1 = $wpdb->prepare("SELECT $columns FROM $wpgmza_tblname WHERE `map_id` = %d ORDER BY `id` DESC",intval($map_id));
        
    }
    $marker_count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $wpgmza_tblname WHERE map_id = %d",$map_id ) );
    if ($marker_count > 5000) {
        return __("There are too many markers to make use of the live edit function. The maximum amount for this functionality is 5000 markers. Anything more than that could crash your browser. In order to edit your markers, you would need to download the table in CSV format, edit it and re-upload it.","wp-google-maps");
    } else {
        $results = $wpdb->get_results($wpgmza_sql1);
        $wpgmza_tmp_body = "";
        $wpgmza_tmp_head = "";
        $wpgmza_tmp_footer = "";

        $res = wpgmza_get_map_data($map_id);
        if (!$res->default_marker) {
            $default_marker = "<img src='".wpgmaps_get_plugin_url()."images/marker.png' width='27' height='43'/>";
        } else {
            $default_marker = "<img src='".$res->default_marker."' />";
        }
        
        
        foreach ( $results as $result ) {
            $img = $result->pic;
            $link = $result->link;
            $icon = $result->icon;
            
            
            if (isset($result->approved)) {
                $approved = $result->approved;
                if ($approved == 0) {
                    $show_approval_button = true;
                } else {
                    $show_approval_button = false;
                }
            } else {
                $show_approval_button = false;
            }
            
            $category_icon = wpgmza_get_category_icon($result->category);

            if (!$img) { $pic = ""; } else { $pic = "<img src=\"".$result->pic."\" width=\"40\" />"; }
            
            if (!$category_icon) {
                if (!$icon) { 
                    $icon = $default_marker; 
                } else { 
                    $icon = "<img src='".$result->icon."' />";
                }
            } else {
                if (!$icon) { 
                    $icon = "<img src='".$category_icon."' />";
                } else { 
                    $icon = "<img src='".$result->icon."' />";
                }
                
            }

            if (!$link) { $linktd = ""; } else { $linktd = "<a href=\"".$result->link."\" target=\"_BLANK\" title=\"".__("View this link","wp-google-maps")."\">&gt;&gt;</a>"; }

            if ($admin) {
                $wpgmza_tmp_body .= "<tr id=\"wpgmza_tr_".$result->id."\" class=\"gradeU\">";
				
				$wpgmza_tmp_body .= '<td><input type="checkbox" name="mark"/></td>';
				
                $wpgmza_tmp_body .= "<td height=\"40\">".$result->id."</td>";
                $wpgmza_tmp_body .= "<td height=\"40\">".$icon."<input type=\"hidden\" id=\"wpgmza_hid_marker_icon_".$result->id."\" value=\"".$result->icon."\" /><input type=\"hidden\" id=\"wpgmza_hid_marker_anim_".$result->id."\" value=\"".$result->anim."\" /><input type=\"hidden\" id=\"wpgmza_hid_marker_category_".$result->id."\" value=\"".$result->category."\" /><input type=\"hidden\" id=\"wpgmza_hid_marker_infoopen_".$result->id."\" value=\"".$result->infoopen."\" /><input type=\"hidden\" id=\"wpgmza_hid_marker_approved_".$result->id."\" value=\"".$result->approved."\" /><input type=\"hidden\" id=\"wpgmza_hid_marker_retina_".$result->id."\" value=\"".$result->retina."\" />";
				
				if(defined('WPGMZA_PRO_FILE') && file_exists(plugin_dir_path(WPGMZA_PRO_FILE) . 'includes/custom-fields/class.custom-marker-fields.php'))
				{
					require_once(plugin_dir_path(WPGMZA_PRO_FILE) . 'includes/custom-fields/class.custom-marker-fields.php');
					$custom_fields = new WPGMZA\CustomMarkerFields($result->id);
					$custom_fields_json = json_encode($custom_fields);
					$custom_fields_json = htmlspecialchars($custom_fields_json);
					
					$wpgmza_tmp_body .= '<input type="hidden" id="wpgmza_hid_marker_custom_fields_json_' . $result->id . '" value="' . $custom_fields_json . '"/>';
				}
				
				$wpgmza_tmp_body .= "</td>";
                $wpgmza_tmp_body .= "<td>".stripslashes($result->title)."<input type=\"hidden\" id=\"wpgmza_hid_marker_title_".$result->id."\" value=\"".stripslashes($result->title)."\" /></td>";
                $wpgmza_tmp_body .= "<td>".wpgmza_return_category_name($result->category)."<input type=\"hidden\" id=\"wpgmza_hid_marker_category_".$result->id."\" value=\"".$result->category."\" /></td>";
                $wpgmza_tmp_body .= "<td>".stripslashes($result->address)."<input type=\"hidden\" id=\"wpgmza_hid_marker_address_".$result->id."\" value=\"".stripslashes($result->address)."\" /><input type=\"hidden\" id=\"wpgmza_hid_marker_lat_".$result->id."\" value=\"".$result->lat."\" /><input type=\"hidden\" id=\"wpgmza_hid_marker_lng_".$result->id."\" value=\"".$result->lng."\" /></td>";
                $wpgmza_tmp_body .= "<td>".stripslashes($result->description)."<input type=\"hidden\" id=\"wpgmza_hid_marker_desc_".$result->id."\" value=\"".  htmlspecialchars(stripslashes($result->description))."\" /></td>";
                $wpgmza_tmp_body .= "<td>$pic<input type=\"hidden\" id=\"wpgmza_hid_marker_pic_".$result->id."\" value=\"".$result->pic."\" /></td>";
                $wpgmza_tmp_body .= "<td>$linktd<input type=\"hidden\" id=\"wpgmza_hid_marker_link_".$result->id."\" value=\"".$result->link."\" /></td>";
                $wpgmza_tmp_body .= "<td width='170' align='center'>";
                $wpgmza_tmp_body .= "    <a title=\"".__("Edit this marker","wp-google-maps")."\" class=\"wpgmza_edit_btn button\" id=\"".$result->id."\"><i class=\"fa fa-edit\"> </i> </a> ";
                $wpgmza_tmp_body .= "    <a href=\"?page=wp-google-maps-menu&action=edit_marker&id=".$result->id."\" title=\"".__("Edit this marker location","wp-google-maps")."\" class=\"wpgmza_edit_btn button\" id=\"".$result->id."\"><i class=\"fa fa-map-marker\"> </i></a> ";
                if ($show_approval_button) {
                    $wpgmza_tmp_body .= "    <a href=\"javascript:void(0);\" title=\"".__("Approve this marker","wp-google-maps")."\" class=\"wpgmza_approve_btn button\" id=\"".$result->id."\"><i class=\"fa fa-check\"> </i> </a> ";
                }
                $wpgmza_tmp_body .= "    <a href=\"javascript:void(0);\" title=\"".__("Delete this marker","wp-google-maps")."\" class=\"wpgmza_del_btn button\" id=\"".$result->id."\"><i class=\"fa fa-times\"> </i></a>";
                $wpgmza_tmp_body .= "</td>";
                $wpgmza_tmp_body .= "</tr>";
            } else {
                $wpgmza_tmp_body .= "<tr id=\"wpgmza_marker_".$result->id."\" mid=\"".$result->id."\" mapid=\"".$result->map_id."\" class=\"wpgmaps_mlist_row\">";
                $wpgmza_tmp_body .= "   <td width='1px;' style='display:none; width:1px !important;'><span style='display:none;'>".sprintf('%02d', $result->id)."</span></td>";
                $wpgmza_tmp_body .= "   <td class='wpgmza_table_marker' height=\"40\">".str_replace("'","\"",$icon)."</td>";
                $wpgmza_tmp_body .= "   <td class='wpgmza_table_title'>".stripslashes($result->title)."</td>";
                $wpgmza_tmp_body .= "   <td class='wpgmza_table_category'>".wpgmza_return_category_name($result->category)."</td>";
                $wpgmza_tmp_body .= "   <td class='wpgmza_table_address'>".stripslashes($result->address)."</td>";
                $wpgmza_tmp_body .= "   <td class='wpgmza_table_description'>".stripslashes($result->description)."</td>";
                $wpgmza_tmp_body .= "</tr>";
            }
        }
        if ($admin) {
            
            $wpgmza_tmp_head .= "<table id=\"wpgmza_table\" class=\"display\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:$width;\">";
            $wpgmza_tmp_head .= "<thead>";
            $wpgmza_tmp_head .= "<tr>";
            $wpgmza_tmp_head .= "   <td><strong>".__("Mark","wp-google-maps")."</strong></td>";
            $wpgmza_tmp_head .= "   <th><strong>".__("ID","wp-google-maps")."</strong></th>";
            $wpgmza_tmp_head .= "   <th><strong>".__("Icon","wp-google-maps")."</strong></th>";
            $wpgmza_tmp_head .= "   <th><strong>".apply_filters("wpgmza_filter_title_name",__("Title","wp-google-maps"))."</strong></th>";
            $wpgmza_tmp_head .= "   <th><strong>".apply_filters("wpgmza_filter_category_name",__("Category","wp-google-maps"))."</strong></th>";
            $wpgmza_tmp_head .= "   <th><strong>".apply_filters("wpgmza_filter_address_name",__("Address","wp-google-maps"))."</strong></th>";
            $wpgmza_tmp_head .= "   <th><strong>".apply_filters("wpgmza_filter_description_name",__("Description","wp-google-maps"))."</strong></th>";
            $wpgmza_tmp_head .= "   <th><strong>".__("Image","wp-google-maps")."</strong></th>";
            $wpgmza_tmp_head .= "   <th><strong>".__("Link","wp-google-maps")."</strong></th>";
            $wpgmza_tmp_head .= "   <th style='width:182px;'><strong>".__("Action","wp-google-maps")."</strong></th>";
            $wpgmza_tmp_head .= "</tr>";
            $wpgmza_tmp_head .= "</thead>";
            $wpgmza_tmp_head .= "<tbody>";
    
        } else {
            
            $wpgmza_tmp_head .= "<div id=\"wpgmza_marker_holder_".$map_id."\" style=\"width:$width;\">";
            $wpgmza_tmp_head .= "<table id=\"wpgmza_table_".$map_id."\" class=\"wpgmza_table\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:$width;\">";
            $wpgmza_tmp_head .= "<thead>";
            $wpgmza_tmp_head .= "<tr>";
            $wpgmza_tmp_head .= "   <th width='1' style='display:none; width:1px !important;'></th>";
            $wpgmza_tmp_head .= "   <th class='wpgmza_table_marker'><strong></strong></th>";
            $wpgmza_tmp_head .= "   <th class='wpgmza_table_title'><strong>".apply_filters("wpgmza_filter_title_name",__("Title","wp-google-maps"))."</strong></th>";
            $wpgmza_tmp_head .= "   <th class='wpgmza_table_category'><strong>".apply_filters("wpgmza_filter_category_name",__("Category","wp-google-maps"))."</strong></th>";
            $wpgmza_tmp_head .= "   <th class='wpgmza_table_address'><strong>".apply_filters("wpgmza_filter_address_name",__("Address","wp-google-maps"))."</strong></th>";
            $wpgmza_tmp_head .= "   <th class='wpgmza_table_description'><strong>".apply_filters("wpgmza_filter_description_name",__("Description","wp-google-maps"))."</strong></th>";
            $wpgmza_tmp_head .= "</tr>";
            $wpgmza_tmp_head .= "</thead>";
            $wpgmza_tmp_head .= "<tbody>";
        }
        
		$wpgmza_tmp_footer .= "</tbody></table>";
		
		$wpgmza_tmp_footer .= '
			<div>
				&#x21b3;
				<button class="wpgmza button select_all_markers" type="button">Select All</button>
				<button class="wpgmza button bulk_delete" type="button">Bulk Delete</button>
			</div>
		';
		
		if(!$admin)
			$wpgmza_tmp_footer .= '</div>';
		
        return $wpgmza_tmp_head.$wpgmza_tmp_body.$wpgmza_tmp_footer;
    }
}

function wpgmza_return_category_name($cid) {

    global $wpdb;
    global $wpgmza_tblname_categories;
    $pos = strpos($cid, ",");
    if ($pos === false) {
        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM `$wpgmza_tblname_categories` WHERE `id` = %d LIMIT 1",intval($cid)) );
        foreach ( $results as $result ) {
            return $result->category_name;
        }
    } else {
        $categories = explode(",",$cid);
        $ret_cat = "";
        $tot_cnt = count($categories);
        $countr = 0;
        foreach ($categories as $cid) {
            $countr++;
            $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM `$wpgmza_tblname_categories` WHERE `id` = %d LIMIT 1",intval($cid)) );
            foreach ( $results as $result ) {
                if ($countr >= $tot_cnt) {
                    $ret_cat .= $result->category_name;
                } else { $ret_cat .= $result->category_name.","; }
            }
            
        }
        return stripslashes($ret_cat);
    }
    


}


function wpgmaps_chmodr($path, $filemode) {
    /* removed in 6.0.25. is_dir caused fatal errors on some hosts */
}









if (function_exists('wpgmza_register_pro_version')) {
    add_action('wp_ajax_add_marker', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_marker', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_edit_marker', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_approve_marker', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_poly', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_polyline', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_dataset', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_circle', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_rectangle', 'wpgmaps_action_callback_pro');
    add_action('template_redirect','wpgmaps_check_shortcode');

    if (function_exists('wpgmza_register_gold_version') && version_compare($wpgmza_pro_version, '7.10.29', '<=')) {
		// Deprecated with Pro >= 7.10.30, where legacy-map-edit-page.js is used instead
		add_action('admin_head', 'wpgmaps_admin_javascript_gold');
	}else{
		add_action('admin_head', 'wpgmaps_admin_javascript_pro');
	}

    global $wpgmza_pro_version;
    $wpgmza_float_version = floatval( $wpgmza_pro_version );

    
    if( $wpgmza_float_version <= 6.07 ){
        add_action('wp_footer', 'wpgmaps_user_javascript_pro');
    }

    if (function_exists('wpgmza_register_ugm_version')) {
    }

    add_shortcode( 'wpgmza', 'wpgmaps_tag_pro' );
	
} else {
    add_action('admin_head', 'wpgmaps_admin_javascript_basic',19);
    add_action('wp_ajax_add_marker', 'wpgmaps_action_callback_basic');
    add_action('wp_ajax_delete_marker', 'wpgmaps_action_callback_basic');
    add_action('wp_ajax_edit_marker', 'wpgmaps_action_callback_basic');
    add_action('wp_ajax_delete_poly', 'wpgmaps_action_callback_basic');
    add_action('wp_ajax_delete_polyline', 'wpgmaps_action_callback_basic');
    add_action('wp_ajax_delete_circle', 'wpgmaps_action_callback_basic');
    add_action('wp_ajax_delete_rectangle', 'wpgmaps_action_callback_basic');
    
    add_action('template_redirect','wpgmaps_check_shortcode');
    // add_action('wp_footer', 'wpgmaps_user_javascript_basic');
    add_shortcode( 'wpgmza', 'wpgmaps_tag_basic' );
	
}



function wpgmaps_check_shortcode() {
    global $posts;
    global $short_code_active;
    $short_code_active = false;
    $pattern = get_shortcode_regex();

    foreach ($posts as $wpgmpost) {
        preg_match_all('/'.$pattern.'/s', $wpgmpost->post_content, $matches);
        foreach ($matches as $match) {
            if (is_array($match)) {
                foreach($match as $key => $val) {
                    $pos = strpos($val, "wpgmza");
                    if ($pos === false) { } else { $short_code_active = true; }
                }
            }
        }
    }
}

function wpgmaps_check_permissions() {
    $filename = dirname( __FILE__ ).'/wpgmaps.tmp';
    $testcontent = "Permission Check\n";
    $handle = @fopen($filename, 'w');
    if (@fwrite($handle, $testcontent) === FALSE) {
        @fclose($handle);
        add_option("wpgmza_permission","n");
        return false;
    }
    else {
        @fclose($handle);
        add_option("wpgmza_permission","y");
        return true;
    }


}
function wpgmaps_permission_warning() {
    echo "<div class='error below-h1'><big>";
    _e("The plugin directory does not have 'write' permissions. Please enable 'write' permissions (755) for ");
    echo "\"".c."\" ";
    _e("in order for this plugin to work! Please see ");
    echo "<a href='http://codex.wordpress.org/Changing_File_Permissions#Using_an_FTP_Client'>";
    _e("this page");
    echo "</a> ";
    _e("for help on how to do it.");
    echo "</big></div>";
}


/* handle database check upon upgrade */
function wpgmaps_update_db_check() {
    global $wpgmza_version;
    if (get_option('wpgmza_db_version') != $wpgmza_version) {
        update_option("wpgmza_temp_api",'AIzaSyChPphumyabdfggISDNBuGOlGVBgEvZnGE');
        wpgmaps_handle_db();
    }

    
}


add_action('plugins_loaded', 'wpgmaps_update_db_check');





function wpgmaps_handle_db() {
    global $wpdb;
    global $wpgmza_version;
    global $wpgmza_tblname_poly;
    global $wpgmza_tblname_polylines;
    global $wpgmza_tblname_categories;
    global $wpgmza_tblname_category_maps;
    global $wpgmza_tblname_circles;
    global $wpgmza_tblname_rectangles;
    global $wpgmza_tblname;

    $table_name = $wpdb->prefix . "wpgmza";




    $sql = "
        CREATE TABLE `".$table_name."` (
          id int(11) NOT NULL AUTO_INCREMENT,
          map_id int(11) NOT NULL,
          address varchar(700) NOT NULL,
          description mediumtext NOT NULL,
          pic varchar(700) NOT NULL,
          link varchar(700) NOT NULL,
          icon varchar(700) NOT NULL,
          lat varchar(100) NOT NULL,
          lng varchar(100) NOT NULL,
          anim varchar(3) NOT NULL,
          title varchar(700) NOT NULL,
          infoopen varchar(3) NOT NULL,
          category varchar(500) NOT NULL,
          approved tinyint(1) DEFAULT '1',
          retina tinyint(1) DEFAULT '0',
          type tinyint(1) DEFAULT '0',
          did varchar(500) NOT NULL,
          other_data LONGTEXT NOT NULL,
          latlng POINT,
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);



    $sql = "
        CREATE TABLE `".$wpgmza_tblname_poly."` (
          id int(11) NOT NULL AUTO_INCREMENT,
          map_id int(11) NOT NULL,
          polydata LONGTEXT NOT NULL,
          innerpolydata LONGTEXT NOT NULL,
          linecolor VARCHAR(7) NOT NULL,
          lineopacity VARCHAR(7) NOT NULL,
          fillcolor VARCHAR(7) NOT NULL,
          opacity VARCHAR(3) NOT NULL,
          title VARCHAR(250) NOT NULL,
          link VARCHAR(700) NOT NULL,
          ohfillcolor VARCHAR(7) NOT NULL,
          ohlinecolor VARCHAR(7) NOT NULL,
          ohopacity VARCHAR(3) NOT NULL,
          polyname VARCHAR(100) NOT NULL,
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";

    dbDelta($sql);


    $sql = "
        CREATE TABLE `".$wpgmza_tblname_polylines."` (
          id int(11) NOT NULL AUTO_INCREMENT,
          map_id int(11) NOT NULL,
          polydata LONGTEXT NOT NULL,
          linecolor VARCHAR(7) NOT NULL,
          linethickness VARCHAR(3) NOT NULL,
          opacity VARCHAR(3) NOT NULL,
          polyname VARCHAR(100) NOT NULL,
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";

    dbDelta($sql);


    $sql = "
        CREATE TABLE `".$wpgmza_tblname_categories."` (
          id int(11) NOT NULL AUTO_INCREMENT,
          active TINYINT(1) NOT NULL,
          category_name VARCHAR(50) NOT NULL,
          category_icon VARCHAR(700) NOT NULL,
          retina TINYINT(1) DEFAULT '0',
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";

    dbDelta($sql);

    $sql = "
        CREATE TABLE `".$wpgmza_tblname_category_maps."` (
          id int(11) NOT NULL AUTO_INCREMENT,
          cat_id INT(11) NOT NULL,
          map_id INT(11) NOT NULL,
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";

    dbDelta($sql);

	$sql = "
		CREATE TABLE `$wpgmza_tblname_circles` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			name TEXT,
			center POINT,
			radius FLOAT,
			color VARCHAR(16),
			opacity FLOAT,
			PRIMARY KEY  (id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";

	dbDelta($sql);

	$sql = "
		CREATE TABLE `$wpgmza_tblname_rectangles` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			name TEXT,
			cornerA POINT,
			cornerB POINT,
			color VARCHAR(16),
			opacity FLOAT,
			PRIMARY KEY  (id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";

	dbDelta($sql);

    $table_name = $wpdb->prefix . "wpgmza_maps";
    $sql = "
        CREATE TABLE `".$table_name."` (
          id int(11) NOT NULL AUTO_INCREMENT,
          map_title varchar(55) NOT NULL,
          map_width varchar(6) NOT NULL,
          map_height varchar(6) NOT NULL,
          map_start_lat varchar(700) NOT NULL,
          map_start_lng varchar(700) NOT NULL,
          map_start_location varchar(700) NOT NULL,
          map_start_zoom INT(10) NOT NULL,
          default_marker varchar(700) NOT NULL,
          type INT(10) NOT NULL,
          alignment INT(10) NOT NULL,
          directions_enabled INT(10) NOT NULL,
          styling_enabled INT(10) NOT NULL,
          styling_json mediumtext NOT NULL,
          active INT(1) NOT NULL,
          kml VARCHAR(700) NOT NULL,
          bicycle INT(10) NOT NULL,
          traffic INT(10) NOT NULL,
          dbox INT(10) NOT NULL,
          dbox_width varchar(10) NOT NULL,
          listmarkers INT(10) NOT NULL,
          listmarkers_advanced INT(10) NOT NULL,
          filterbycat TINYINT(1) NOT NULL,
          ugm_enabled INT(10) NOT NULL,
          ugm_category_enabled TINYINT(1) NOT NULL,
          fusion VARCHAR(100) NOT NULL,
          map_width_type VARCHAR(3) NOT NULL,
          map_height_type VARCHAR(3) NOT NULL,
          mass_marker_support INT(10) NOT NULL,
          ugm_access INT(10) NOT NULL,
          order_markers_by INT(10) NOT NULL,
          order_markers_choice INT(10) NOT NULL,
          show_user_location INT(3) NOT NULL,
          default_to VARCHAR(700) NOT NULL,
          other_settings longtext NOT NULL,
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;
    ";

    dbDelta($sql);

    /* 6.3.14 */
    $check = $wpdb->query("ALTER TABLE $table_name CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci");


    /* check for previous versions containing 'desc' instead of 'description' */
    $results = $wpdb->get_results("DESC $wpgmza_tblname");
    $founded = 0;
    foreach ($results as $row ) {
        if ($row->Field == "desc") {
            $founded++;
        }
    }
    if ($founded>0) { $wpdb->query("ALTER TABLE $wpgmza_tblname CHANGE `desc` `description` MEDIUMTEXT"); }
    

    
    /* check for older version of "category" and change to varchar instead of int */
    $results = $wpdb->get_results("DESC $wpgmza_tblname");
    $founded = 0;
    foreach ($results as $row ) {
        
        if ($row->Field == "category") {
            if ($row->Type == "int(11)") {
                $founded++;
            }
        }
    }
    if ($founded>0) { $wpdb->query("ALTER TABLE $wpgmza_tblname CHANGE `category` `category` VARCHAR(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0'"); }
    

    add_option("wpgmza_db_version", $wpgmza_version);
    update_option("wpgmza_db_version",$wpgmza_version);
}

function wpgmza_get_map_data($map_id) {
    global $wpdb;
    global $wpgmza_tblname_maps;
    $result = $wpdb->get_results( $wpdb->prepare("SELECT * FROM $wpgmza_tblname_maps WHERE `id` = %d LIMIT 1" , intval($map_id)) );
    if (isset($result[0])) { return $result[0]; }
}
function wpgmza_get_marker_data($mid) {
    global $wpdb;
    global $wpgmza_tblname;
	$columns = implode(', ', wpgmza_get_marker_columns());
    $result = $wpdb->get_results( $wpdb->prepare("SELECT $columns FROM $wpgmza_tblname WHERE `id` = %d LIMIT 1 " , intval($mid)) );
    $res = $result[0];
    return $res;
}
function wpgmaps_upgrade_notice() {
    global $wpgmza_pro_version;
    echo "<div class='error below-h1'>

            <p>Dear Pro User<br /></p>

            <p>We have recently added new functionality to the Pro version of this plugin. You are currently using the latest
            Basic version which needs the latest Pro version for all functionality to work correctly. Your current Pro version is
            $wpgmza_pro_version - The latest Pro version is <strong>5.41</strong><br /></p>

            <p>You should be able to update your Pro version the same way you <a href='update-core.php'>update all other WordPress plugins</a>. </p>
            <p>If you run into any problems updating your pro version, please view <a href='https://www.wpgmaps.com/documentation/how-do-i-update-my-wp-google-maps-progolddev-plugin/'>this page</a>. </p>

            <p>Kind regards,<br /><a href='https://www.wpgmaps.com/'>WP Google Maps</a></p>

    </div>";
}
function wpgmaps_trash_map($map_id) {
    global $wpdb;
    global $wpgmza_tblname_maps;
    if (isset($map_id)) {
		$wpdb->query(
			$wpdb->prepare('DELETE FROM wp_wpgmza WHERE map_id=%d', $map_id)
		);
        $rows_affected = $wpdb->query( $wpdb->prepare( "UPDATE $wpgmza_tblname_maps SET active = %d WHERE id = %d", 1, $map_id) );
        return true;
    } else {
        return false;
    }
}

function wpgmza_stats($sec) {
    $wpgmza_stats = get_option("wpgmza_stats");
    if ($wpgmza_stats) {
        if (isset($wpgmza_stats[$sec]["views"])) {
            $wpgmza_stats[$sec]["views"] = $wpgmza_stats[$sec]["views"] + 1;
            $wpgmza_stats[$sec]["last_accessed"] = date("Y-m-d H:i:s");
        } else {
            $wpgmza_stats[$sec]["views"] = 1;
            $wpgmza_stats[$sec]["last_accessed"] = date("Y-m-d H:i:s");
            $wpgmza_stats[$sec]["first_accessed"] = date("Y-m-d H:i:s");
        }


    } else {

        $wpgmza_stats[$sec]["views"] = 1;
        $wpgmza_stats[$sec]["last_accessed"] = date("Y-m-d H:i:s");
        $wpgmza_stats[$sec]["first_accessed"] = date("Y-m-d H:i:s");


    }
    update_option("wpgmza_stats",$wpgmza_stats);

}

function wpgmaps_filter(&$array) {
    $clean = array();
    foreach($array as $key => &$value ) {
        if( is_array($value) ) {
            wpgmaps_filter($value);
        } else {
            if (get_magic_quotes_gpc()) {
                $data = stripslashes($value);
            }
            $data = esc_sql($value);
        }
    }
}
function wpgmaps_debugger($section) {

    global $debug;
    global $debug_start;
    global $debug_step;
    if ($debug) {
        $end = (float) array_sum(explode(' ',microtime()));
        echo "<!-- $section processing time: ". sprintf("%.4f", ($end-$debug_start))." seconds\n -->";
    }

}

function wpgmaps_load_jquery() {
    if (!is_admin()) {
        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
        if (isset($wpgmza_settings['wpgmza_settings_force_jquery'])) { 
            if ($wpgmza_settings['wpgmza_settings_force_jquery'] == "yes") {
                wp_deregister_script('jquery');
                wp_register_script('jquery', '//code.jquery.com/jquery-1.11.3.min.js', false, "1.11.3");
        }
        }
        wp_enqueue_script('jquery');
    }
}
add_action('wp_enqueue_scripts', 'wpgmaps_load_jquery', 9999);

function wpgmza_get_category_data($cat_id) {
    global $wpgmza_tblname_categories;
    global $wpdb;
    
	$cat_id = (int)$cat_id;
	
    $result = $wpdb->get_row("
	SELECT `category_icon`,`retina`
	FROM `$wpgmza_tblname_categories`
        WHERE `id` = '$cat_id'
        AND `active` = 0
        LIMIT 1
	");
    return $result;
}
function wpgmza_get_category_icon($cat_id) {
    global $wpgmza_tblname_categories;
    global $wpdb;
	
	$cat_id = (int)$cat_id;
    
    $result = $wpdb->get_var("
	SELECT `category_icon`
	FROM `$wpgmza_tblname_categories`
        WHERE `id` = '$cat_id'
        AND `active` = 0
        LIMIT 1
	");
    return $result;
}


function wpgmza_return_error($data) {
    echo "<div id=\"message\" class=\"error\"><p><strong>".$data->get_error_message()."</strong><blockquote>".$data->get_error_data()."</blockquote></p></div>";
    
}

function wpgmza_write_to_error_log($data) {
    error_log(date("Y-m-d H:i:s"). ": WP Google Maps : " . $data->get_error_message() . "->" . $data->get_error_data());
    return;
    
}
function wpgmza_error_directory() {
    return true;
    
}
function wpgmza_return_error_log() {
    $check = wp_upload_dir();
    $file = $check['basedir']."/wp-google-maps/error_log.txt";
    $ret = "";
    if (@file_exists($file)) {
        $fh = @fopen($check['basedir']."/wp-google-maps/error_log.txt","r");

        $ret = "";
        if ($fh) {
            for ($i=0;$i<10;$i++) {
                $visits = fread($fh,4096);
                $ret .= $visits;
            }
        } else {
            $ret .= "No errors to report on";
        }
    } else {
        $ret .= "No errors to report on";
        
    }
    return $ret;
    
}
function wpgmaps_marker_permission_check() {
    
    
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    if (isset($wpgmza_settings['wpgmza_settings_marker_pull']) && $wpgmza_settings['wpgmza_settings_marker_pull'] == '0') {
        /* using db method, do nothing */
        return;
    }
    
    
    if (function_exists("wpgmza_register_pro_version")) {
        global $wpgmza_pro_version;
        if (floatval($wpgmza_pro_version) < 5.41) {
            $marker_location = get_option("wpgmza_xml_location");
        } else {
            $marker_location = wpgmza_return_marker_path();
        }
    } else {
        $marker_location = wpgmza_return_marker_path();
    }
    
    
    $wpgmza_file_perms = substr(sprintf('%o', fileperms($marker_location)), -4);
    $fpe = false;
    $fpe_error = "";
    if ($wpgmza_file_perms == "0777" || $wpgmza_file_perms == "0755" || $wpgmza_file_perms == "0775" || $wpgmza_file_perms == "0705" || $wpgmza_file_perms == "2705" || $wpgmza_file_perms == "2775" || $wpgmza_file_perms == "2777" ) { 
        $fpe = true;
        $fpe_error = "";
    }
    else if ($wpgmza_file_perms == "0") {
        $fpe = false;
        $fpe_error = __("This folder does not exist. Please create it.","wp-google-maps"). ": ". $marker_location;
    } else { 
        $fpe = false;
        $fpe_error = __("WP Google Maps does not have write permission to the marker location directory. This is required to store marker data. Please CHMOD the folder ","wp-google-maps").$marker_location.__(" to 755 or 777, or change the directory in the Maps->Settings page. (Current file permissions are ","wp-google-maps").$wpgmza_file_perms.")";
    }
    
    if (!$fpe) {
	echo "<div id=\"message\" class=\"error\"><p>".$fpe_error."</p></div>";
    } 
}

function wpgmza_basic_support_menu() {
    wpgmza_stats("support_basic");
?>   
        <h1><?php _e("WP Google Maps Support","wp-google-maps"); ?></h1>
        <div class="wpgmza_row">
            <div class='wpgmza_row_col' style='background-color:#FFF;padding: 12px;'>
                <h2><i class="fa fa-book"></i> <?php _e("Documentation","wp-google-maps"); ?></h2>
                <hr />
                <p><?php _e("Getting started? Read through some of these articles to help you along your way.","wp-google-maps"); ?></p>
                <p><strong><?php _e("Documentation:","wp-google-maps"); ?></strong></p>
                <ul>
                    <li><a href='https://www.wpgmaps.com/documentation/creating-your-first-map/' target='_BLANK' title='<?php _e("Creating your first map","wp-google-maps"); ?>'><?php _e("Creating your first map","wp-google-maps"); ?></a></li>
                    <li><a href='https://www.wpgmaps.com/documentation/using-your-map-in-a-widget/' target='_BLANK' title='<?php _e("Using your map as a Widget","wp-google-maps"); ?>'><?php _e("Using your map as a Widget","wp-google-maps"); ?></a></li>
                    <li><a href='https://www.wpgmaps.com/documentation/changing-the-google-maps-language/' target='_BLANK' title='<?php _e("Changing the Google Maps language","wp-google-maps"); ?>'><?php _e("Changing the Google Maps language","wp-google-maps"); ?></a></li>
                    <li><a href='https://www.wpgmaps.com/documentation/' target='_BLANK' title='<?php _e("WP Google Maps Documentation","wp-google-maps"); ?>'><?php _e("View all documentation.","wp-google-maps"); ?></a></li>
                </ul>
            </div>
            <div class='wpgmza_row_col' style='background-color:#FFF;padding: 12px;'>
                <h2><i class="fa fa-exclamation-circle"></i> <?php _e("Troubleshooting","wp-google-maps"); ?></h2>
                <hr />
                <p><?php _e("WP Google Maps has a diverse and wide range of features which may, from time to time, run into conflicts with the thousands of themes and other plugins on the market.","wp-google-maps"); ?></p>
                <p><strong><?php _e("Common issues:","wp-google-maps"); ?></strong></p>
                <ul>
                    <li><a href='https://www.wpgmaps.com/documentation/troubleshooting/my-map-is-not-showing-on-my-website/' target='_BLANK' title='<?php _e("My map is not showing on my website","wp-google-maps"); ?>'><?php _e("My map is not showing on my website","wp-google-maps"); ?></a></li>
                    <li><a href='https://www.wpgmaps.com/documentation/troubleshooting/my-markers-are-not-showing-on-my-map/' target='_BLANK' title='<?php _e("My markers are not showing on my map in the front-end","wp-google-maps"); ?>'><?php _e("My markers are not showing on my map in the front-end","wp-google-maps"); ?></a></li>
                    <li><a href='https://www.wpgmaps.com/documentation/troubleshooting/im-getting-jquery-errors-showing-on-my-website/' target='_BLANK' title='<?php _e("I'm getting jQuery errors showing on my website","wp-google-maps"); ?>'><?php _e("I'm getting jQuery errors showing on my website","wp-google-maps"); ?></a></li>
                </ul>
            </div>
            <div class='wpgmza_row_col' style='background-color:#FFF;padding: 12px;'>
                <h2><i class="fa fa-bullhorn "></i> <?php _e("Support","wp-google-maps"); ?></h2>
                <hr />
                <p><?php _e("Still need help? Use one of these links below.","wp-google-maps"); ?></p>
                <ul>
                    <li><a href='https://www.wpgmaps.com/forums/' target='_BLANK' title='<?php _e("Support forum","wp-google-maps"); ?>'><?php _e("Support forum","wp-google-maps"); ?></a></li>
                    <li><a href='https://www.wpgmaps.com/contact-us/' target='_BLANK' title='<?php _e("Contact us","wp-google-maps"); ?>'><?php _e("Contact us","wp-google-maps"); ?></a></li>
                </ul>
            </div>
            
            
        </div>
        
<?php
}

add_action('wp_ajax_track_usage', 'wpgmaps_usage_tracking_callback');
add_action('wp_ajax_request_coupon', 'wpgmaps_usage_tracking_callback');

function wpgmaps_usage_tracking_callback(){

    if( isset( $_POST['action'] ) ){

        if( $_POST['action'] == 'track_usage' ){

        /**
         * No longer being done in Ajax. Will track when the map is saved.
         */

        }

        if( $_POST['action'] == 'request_coupon' ){

            if( $_POST['status'] == 'true' ){

                if (function_exists('curl_version')) {
                
                    $request_url = "http://ccplugins.co/usage-tracking/coupons.php";

                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $request_url);
                    curl_setopt($ch, CURLOPT_POST, 1);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);
                    curl_setopt($ch, CURLOPT_REFERER, $_SERVER['HTTP_HOST']);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                    
                    $output = curl_exec($ch);                            
                    
                    curl_close($ch);

                    $wpgmza_settings = get_option('WPGMZA_OTHER_SETTINGS');

                    $wpgmza_settings['wpgmza_settings_enable_usage_tracking'] = 'yes';

                    update_option('WPGMZA_OTHER_SETTINGS', $wpgmza_settings);

                } else {
                    $body = "Usage tracking has been enabled by ".$_POST['email'];
                    wp_mail('nick@wpgmaps.com', 'Coupon Code Request', $body);

                }

            } else {

                $wpgmza_settings = get_option('WPGMZA_OTHER_SETTINGS');

                $wpgmza_settings['wpgmza_settings_enable_usage_tracking'] = '0';

                update_option('WPGMZA_OTHER_SETTINGS', $wpgmza_settings);

            }

        }

    }

    wp_die();

}

function wpgmza_return_country_tld_array(){
    $path = plugin_dir_path(__FILE__).'js/countries.json';

    $file = file_get_contents($path);

    $countries = json_decode( $file );

    $tld = array();

    if( $countries ){

        foreach( $countries as $country ){

            if( $country->topLevelDomain[0] !== '' ){
                $tld[str_replace('.', '', $country->topLevelDomain[0])] = $country->name;
            }

        }
        asort( $tld );
    } else {

        $tld['us'] = __('United States of America', 'wp-google-maps');

    }

    return $tld;
}

function google_maps_api_key_warning(){
	
	global $wpgmza;
	
	if($wpgmza->settings->engine != 'google-maps' || empty($wpgmza->settings->engine))
		return;
	
    $g_api_key = get_option('wpgmza_google_maps_api_key');
    if( !$g_api_key || $g_api_key == '' ){
        $video = "<a href='https://www.youtube.com/watch?v=OH98za14LNg' target='_BLANK'>".__('View the instruction video', 'wp-google-maps')."</a>";
        $documentation = "<a href='https://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/' target='_BLANK'>".__('Read the documentation', 'wp-google-maps')."</a>";
        echo "<div class='error'><h1>".__('Important Notification', 'wp-google-maps')."</h1><p>";
        $article = "<a href='https://googlegeodevelopers.blogspot.co.za/2016/06/building-for-scale-updates-to-google.html' target='_BLANK'>".__('You can read more about that here.', 'wp-google-maps')."</a>";
        echo "<p><strong>".__('*ALL* Google Maps now require an API key to function.','wp-google-maps').'</strong> '.$article.'</p>';

        echo "<p>".__("Before creating a map please follow these steps:","wp-google-maps")."";
        echo "<ol>";
        echo "<li>";
        echo " <a target='_BLANK' href='https://www.wpgmaps.com/get-a-google-maps-api-key/' class=''>".__("Create an API key now","wp-google-maps")."</a>";
        echo "</li>";
        echo "<li><form method='POST'>";
        echo __('Paste your API key here and press save:','wp-google-maps');
        echo " <input type='text' name='wpgmza_google_maps_api_key' style='width:350px;' placeholder='".__("paste your Google Maps JavaScript API Key here","wp-google-maps")."' /> <button type='submit' class='button button-primary' name='wpgmza_save_google_api_key_list'>".__('Save', 'wp-google-maps')."</button>";
        echo "</form>";

        echo "</li>";
        echo "</ol>";
        echo "</p>";
        
		echo "<p>" . __('<strong>Alternatively, please switch to the OpenLayers map engine</strong> on the maps settings page', 'wp-google-maps') . "</p>";
		
        echo sprintf( __('Need help? %s or %s.', 'wp-google-maps'), $video, $documentation )."</p>";
        echo "</div>";
    }
}

if( isset( $_GET['page'] ) && $_GET['page'] == 'wp-google-maps-menu' ){
    if( is_admin() ){
        add_action('admin_enqueue_styles', 'wpgmza_deregister_styles',999);
        add_action('admin_enqueue_scripts', 'wpgmza_deregister_styles',999);        
        add_action('admin_head', 'wpgmza_deregister_styles',999);
        add_action('init', 'wpgmza_deregister_styles',999);
        add_action('admin_footer', 'wpgmza_deregister_styles',999);
        add_action('admin_print_styles', 'wpgmza_deregister_styles',999);        
    }
}



function wpgmza_deregister_styles() {
    global $wp_styles;            
    if (isset($wp_styles->registered) && is_array($wp_styles->registered)) {                
        foreach ( $wp_styles->registered as $script) {                    
            if (strpos($script->src, 'jquery-ui.theme.css') !== false || strpos($script->src, 'jquery-ui.css') !== false) {
               // $script->handle = "";
               // $script->src = "";
            }
        }
    }
}

function wpgmza_caching_notice_changes($markers = false, $return = false){    
    if( isset( $_GET['page'] ) && strpos( $_GET['page'], "wp-google-maps" ) !== false ){
        
        if( $return ){
            $class = "update-nag";
        } else {
            $class = "notice notice-info";
        }

        $message = "";

        $w3tc_nonce_url = wp_nonce_url( network_admin_url(
                    'admin.php?page=w3tc_dashboard&amp;w3tc_flush_all' ),
                'w3tc' );

        $cleared_link = "";
        $cache_plugin = "";
        if ( defined( 'W3TC' ) ) {
            $cache_plugin = "W3 Total Cache";
            $cleared_link = $w3tc_nonce_url;
        } else if( function_exists( 'wpsupercache_activate' ) ){
            $cache_plugin = "WP Super Cache";
            $cleared_link = admin_url('options-general.php?page=wpsupercache');
        } else if( class_exists( 'WpFastestCache' ) ){
            $cache_plugin = "WP Fastest Cache";
            $cleared_link = admin_url('admin.php?page=wpfastestcacheoptions');
        }
        if( defined( 'W3TC' ) || function_exists( 'wpsupercache_activate' ) || class_exists( 'WpFastestCache' ) ){
            if ($markers) {
                $message = sprintf( __( "One or more markers have been added or changed, please <a href='%s' class='button'>clear your cache.</a>", "wp-google-maps" ), $cleared_link );                  
            } else {
                $message = sprintf( __( "We have detected that you are using %s on your website. Please <a href='%s' class='button'>clear your cache</a> to ensure that your map is updated.", "wp-google-maps" ), $cache_plugin, $cleared_link );
            }
            
            if( $message != "" ){
                if( $return ){
                    return "<div class='$class' style='border-color: #46b450; line-height: 25px; padding-top:5px; padding-bottom:5px;'>$message</div>"; 
                } else {
                    echo "<div class='$class' style='border-color: #46b450; line-height: 25px; padding-top:5px; padding-bottom:5px;'>$message</div>";  
                }
            }
        } else {
            return;
        }        

    }

}

function wpgm_pro_link($link) {
    if (defined('wpgm_aff')) {
        $id = sanitize_text_field(wpgm_aff);
        if ($id && $id !== "") {
            return "http://affiliatetracker.io/?aff=".$id."&affuri=".base64_encode($link);    
        } else {
            return $link;
        }
        
    } else {
        return $link;
    }
}

function wpgmza_track_usage( $map_id ){

    global $wpdb;
    global $wpgmza_tblname_maps;

    $wpgmza_data = array();

    $wpgmza_settings = get_option('WPGMZA_OTHER_SETTINGS');
            
    if( isset( $wpgmza_settings['wpgmza_settings_enable_usage_tracking'] ) && $wpgmza_settings['wpgmza_settings_enable_usage_tracking'] == 'yes' ){
        
        $map_data = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $wpgmza_tblname_maps WHERE `id` = %d LIMIT 1" , intval( $map_id ) ), ARRAY_A );        
        
        if( isset( $map_data->other_settings ) && $map_data->other_settings == '' ){
            
            /* New map - no changes have been made to it */

        } else {

            $wpgmza_data['map_data'] = maybe_serialize( $map_data );            

            /**
             * Quantity of maps
             */                    
            $qty_maps = $wpdb->get_row( "SELECT COUNT(*) as `map_count` FROM ".$wpdb->prefix."wpgmza_maps" );
            $wpgmza_total_maps = isset( $qty_maps->map_count ) ? $qty_maps->map_count : 'error';           

            $wpgmza_data['map_data_total_maps'] = $wpgmza_total_maps;         
            
            /**
             * Quantity of markers
             */
            $qty_markers = $wpdb->get_row( "SELECT COUNT(*) as `marker_count` FROM ".$wpdb->prefix."wpgmza" );
            $wpgmza_total_markers = isset( $qty_markers->marker_count ) ? $qty_markers->marker_count : 'error';                    
            
            $wpgmza_data['map_data_total_markers'] = $wpgmza_total_markers;

            /**
             * WP Version
             */
            $wpgmza_wp_version = get_bloginfo( "version" );

            $wpgmza_data['wp_version'] = $wpgmza_wp_version;
            
            /**
             * Basic & Pro Current versions
             */                    
            global $wpgmza_version;
            global $wpgmza_pro_version;

            $wpgmza_data['basic_version_number'] = $wpgmza_version;
            $wpgmza_data['pro_version_number'] = $wpgmza_pro_version;
            
            /**
             * Global settings
             */                 
            
            $wpgmza_data['global_settings'] = maybe_serialize( $wpgmza_settings );

            /**
             * Other settings for map
             */
            
            if( isset( $map_data['other_settings'] ) ){
                
                if( $map_data['other_settings'] != '' ){

                    $other_data = maybe_unserialize( $map_data['other_settings'] );                    

                    if( $other_data ){

                        $wpgmza_data['other_map_data'] = maybe_serialize( $other_data );

                    }

                }

            }
            
            /**
             * Current theme active
             */
            $current_theme = wp_get_theme();                    
            if( $current_theme ){
                
                $wpgmza_data['current_theme_name'] = $current_theme->get('Name');
                $wpgmza_data['current_theme_version'] = $current_theme->get('Version');
            
            } else {
                
                $wpgmza_data['current_theme_name'] = 'unknown';
                $wpgmza_data['current_theme_version'] = 'unknown';

            }

            /**
             * Current PHP Version
             */
            if( function_exists( 'phpversion' ) ){
                $wpgmza_php_version = phpversion();                        
            } else {
                $wpgmza_php_version = 'unknown';
            }

            $wpgmza_data['php_version'] = $wpgmza_php_version;
                
            /**
             * Current memory allocated to WP
             */
            if( defined( 'WP_MEMORY_LIMIT' ) ){
                $wpgmza_memory_limit = WP_MEMORY_LIMIT;
            } else {
                $wpgmza_memory_limit = 'unknown';
            }               

            $wpgmza_data['allocated_memory'] = $wpgmza_memory_limit;

            /**
             * Is Debugging Enabled
             */
            if( defined( 'WP_DEBUG' ) ){
                $wpgmza_debug = WP_DEBUG;
            } else {
                $wpgmza_debug = 'unknown';
            }

            $wpgmza_data['wp_debug'] = $wpgmza_debug;
            
            /**
             * Site Language
             */
            if( function_exists( 'get_locale' ) ){
                $wpgmza_locale = get_locale();    
            } else {
                $wpgmza_locale = 'unknown';
            }
            
            $wpgmza_data['locale'] = $wpgmza_locale;            
            
            if (function_exists('curl_version')) {
        
                $request_url = "http://ccplugins.co/usage-tracking/record_comprehensive.php";

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $request_url);
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $wpgmza_data);
                curl_setopt($ch, CURLOPT_REFERER, $_SERVER['HTTP_HOST']);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                
                $output = curl_exec($ch);                            
                
                curl_close($ch);

            } 

        }

    }
}

/**
 * Migrates text lat/lng columns into spatial latlng column if necessary
 * @return void
 */
if(!function_exists('wpgmza_migrate_spatial_data'))
{
	function wpgmza_migrate_spatial_data() {
		
		global $wpgmza;
		global $wpdb;
		global $wpgmza_tblname;
		
		if(!$wpdb->get_var("SHOW COLUMNS FROM ".$wpgmza_tblname." LIKE 'latlng'"))
			$wpdb->query('ALTER TABLE '.$wpgmza_tblname.' ADD latlng POINT');
		
		if($wpdb->get_var("SELECT COUNT(id) FROM $wpgmza_tblname WHERE latlng IS NULL LIMIT 1") == 0)
			return; // Nothing to migrate
		
		$wpdb->query("UPDATE ".$wpgmza_tblname." SET latlng={$wpgmza->spatialFunctionPrefix}PointFromText(CONCAT('POINT(', CAST(lat AS DECIMAL(18,10)), ' ', CAST(lng AS DECIMAL(18,10)), ')'))");
	}
	
	add_action('init', 'wpgmza_migrate_spatial_data', 1);
}

if(!function_exists('wpgmza_get_circles_table'))
{
	function wpgmza_get_circles_table($map_id)
	{
		global $wpdb;
		global $wpgmza_tblname_circles;
		
		$circles_table = "
			<table>
				<thead>
					<tr>
						<th>" . __('ID', 'wp-google-maps') . "</th>
						<th>" . __('Name', 'wp-google-maps') . "</th>
						<th>" . __('Action', 'wp-google-maps') . "</th>
					</tr>
				</thead>
				<tbody>
		";
		
		$stmt = $wpdb->prepare("SELECT * FROM $wpgmza_tblname_circles WHERE map_id = %d", array($map_id));
		$circles = $wpdb->get_results($stmt);
		foreach($circles as $circle)
		{
			$circles_table .= "
				<tr>
					<td>{$circle->id}</td>
					<td>{$circle->name}</td>
					<td width='170' align='left'>
						<a href='" . get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu&amp;action=edit_circle&amp;map_id={$map_id}&amp;circle_id={$circle->id}'
							title='" . __('Edit', 'wp-google-maps') . "' 
							class='wpgmza_edit_circle_btn button'
							id='{$circle->id}'>
							<i class='fa fa-edit'> </i>
						</a> 
						<a href='javascript:void(0);'
							title='" . __('Delete this circle', 'wp-google-maps') . "' class='wpgmza_circle_del_btn button' id='{$circle->id}'><i class='fa fa-times'> </i>
						</a>	
					</td>
				</tr>
			";
		}
		
		$circles_table .= "
				</tbody>
			</table>
		";
		
		return $circles_table;
	}
}
	
if(!function_exists('wpgmza_get_rectangles_table'))
{
	function wpgmza_get_rectangles_table($map_id)
	{
		global $wpdb;
		global $wpgmza_tblname_rectangles;
		
		$rectangles_table = "
			<table>
				<thead>
					<tr>
						<th>" . __('ID', 'wp-google-maps') . "</th>
						<th>" . __('Name', 'wp-google-maps') . "</th>
						<th>" . __('Action', 'wp-google-maps') . "</th>
					</tr>
				</thead>
				<tbody>
		";
		
		$stmt = $wpdb->prepare("SELECT * FROM $wpgmza_tblname_rectangles WHERE map_id = %d", array($map_id));
		$rectangles = $wpdb->get_results($stmt);
		foreach($rectangles as $rectangle)
		{
			$rectangles_table .= "
				<tr>
					<td>{$rectangle->id}</td>
					<td>{$rectangle->name}</td>
					<td width='170' align='left'>
						<a href='" . get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu&amp;action=edit_rectangle&amp;map_id={$map_id}&amp;rectangle_id={$rectangle->id}'
							title='" . __('Edit', 'wp-google-maps') . "' 
							class='wpgmza_edit_rectangle_btn button'
							id='{$rectangle->id}'>
							<i class='fa fa-edit'> </i>
						</a> 
						<a href='javascript:void(0);'
							title='" . __('Delete this rectangle', 'wp-google-maps') . "' class='wpgmza_rectangle_del_btn button' id='{$rectangle->id}'><i class='fa fa-times'> </i>
						</a>	
					</td>
				</tr>
			";
		}
		
		$rectangles_table .= "
				</tbody>
			</table>
		";
		
		return $rectangles_table;
	}
}

function wpgmaps_b_admin_add_circle_javascript()
{
	$res = wpgmza_get_map_data(sanitize_text_field($_GET['map_id']));
        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");


        $wpgmza_lat = $res->map_start_lat;
        $wpgmza_lng = $res->map_start_lng;
        $wpgmza_map_type = $res->type;
        $wpgmza_width = $res->map_width;
        $wpgmza_height = $res->map_height;
        $wpgmza_width_type = $res->map_width_type;
        $wpgmza_height_type = $res->map_height_type;
        if (!$wpgmza_map_type || $wpgmza_map_type == "" || $wpgmza_map_type == "1") { $wpgmza_map_type = "ROADMAP"; }
        else if ($wpgmza_map_type == "2") { $wpgmza_map_type = "SATELLITE"; }
        else if ($wpgmza_map_type == "3") { $wpgmza_map_type = "HYBRID"; }
        else if ($wpgmza_map_type == "4") { $wpgmza_map_type = "TERRAIN"; }
        else { $wpgmza_map_type = "ROADMAP"; }
        $start_zoom = $res->map_start_zoom;
        if ($start_zoom < 1 || !$start_zoom) {
            $start_zoom = 5;
        }

        
        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    	global $api_version_string;
        
		?>
        <link rel='stylesheet' id='wpgooglemaps-css'  href='<?php echo wpgmaps_get_plugin_url(); ?>/css/wpgmza_style.css' type='text/css' media='all' />
        <script type="text/javascript" >
			(function($) {
		
				var myLatLng = new google.maps.LatLng(<?php echo $wpgmza_lat; ?>,<?php echo $wpgmza_lng; ?>);
				circle = null;
				MYMAP = {
					map: null,
					bounds: null
				};
				
				jQuery(function($) {
					function wpgmza_InitMap() {
						
						MYMAP.init('#wpgmza_map', myLatLng, <?php echo $start_zoom; ?>);
					}
					$("#wpgmza_map").css({
						height:'<?php echo $wpgmza_height; ?><?php echo $wpgmza_height_type; ?>',
						width:'<?php echo $wpgmza_width; ?><?php echo $wpgmza_width_type; ?>'
					});
					wpgmza_InitMap();
					
					$("#circle_radius").on("input", function(event) {
						if(!circle)
							return;
						circle.setRadius(parseFloat($(event.target).val()));
						
					});
					$("#circle_opacity").keyup(function() {
						if(!circle)
							return;
						circle.setOptions({
							fillOpacity: parseFloat($(event.target).val())
						});
					});
					
					$("#circle_color").on("input", function(event) {
						if(!circle)
							return;
						circle.setOptions({
							fillColor: $(event.target).val()
						});
					});
					
					$("#wpgmaps_add_circle_form").on("submit", function(event) {
						
						$("input[name='center']").val(circle.getCenter());
						
					});
					
					//$("#fit-bounds-to-shape").on("click", wpgmza_fit_circle_bounds);
					//autocomplete = new google.maps.places.Autocomplete($("#fit-bounds-to-shape")[0]);
						
				});
				
				/*function wpgmza_fit_circle_bounds()
				{
					var bounds = circle.getBounds();
					
					MYMAP.map.fitBounds(bounds);
				}*/
				
				function wpgmza_update_center_field()
				{
					$("input[name='center']").val(circle.getCenter().toString());
				}
				
				function wpgmza_get_width_in_kilometers(map)
				{
					var spherical = google.maps.geometry.spherical, 
						bounds = map.getBounds(), 
						cor1 = bounds.getNorthEast(), 
						cor2 = bounds.getSouthWest(), 
						cor3 = new google.maps.LatLng(cor2.lat(), cor1.lng()), 
						cor4 = new google.maps.LatLng(cor1.lat(), cor2.lng()), 
						width = spherical.computeDistanceBetween(cor1,cor3), 
						height = spherical.computeDistanceBetween( cor1, cor4);
						
					return width;
				}
				
				function handle_radius_warning()
				{
					var km = wpgmza_get_width_in_kilometers(MYMAP.map);
					var circleRadius = $("#circle_radius").val();
					
					var ratio = circleRadius / km;
					
					if(ratio < 0.005)
						$("#circle-radius-visibility-warning").show();
					else
						$("#circle-radius-visibility-warning").hide();
					
					return km;
				}
				
				MYMAP.init = function(selector, latLng, zoom) {
					
					var self = this;
					
					$("#circle-radius-visibility-warning").hide();
					
					var myOptions = {
						zoom:zoom,
						center: latLng,
						zoomControl: true,
						panControl: true,
						mapTypeControl: true,
						streetViewControl: true,
						mapTypeId: google.maps.MapTypeId.<?php echo $wpgmza_map_type; ?>
					};
					
					this.map = new google.maps.Map($(selector)[0], myOptions);
					this.bounds = new google.maps.LatLngBounds();
					
					google.maps.event.addListener(this.map, "click", function(event) {
						
						if(circle)
							circle.setMap(null);
						
						circle = new google.maps.Circle({
							fillColor: $("input[name='circle_color']").val(),
							fillOpacity: $("input[name='circle_opacity']").val(),
							strokeOpacity: 0,
							map: self.map,
							center: event.latLng,
							radius: parseFloat( $("input[name='circle_radius']").val() ),
							draggable: true
						});
						
						circle.addListener("dragend", function() {
							wpgmza_update_center_field();
						});
						
						wpgmza_update_center_field();
						
						handle_radius_warning();
						
					});
					
					google.maps.event.addListener(this.map, "zoom_changed", function(event) {
						
						handle_radius_warning();
						
					});
					
					setTimeout(function() {
						handle_radius_warning();
					}, 2000);
					
					if(window.location.href.match(/edit_circle/))
					{
						var m = $("input[name='center']").val().match(/-?\d+(\.\d+)?/g);
						
						circle = new google.maps.Circle({
							fillColor: $("input[name='circle_color']").val(),
							fillOpacity: $("input[name='circle_opacity']").val(),
							strokeOpacity: 0,
							map: self.map,
							center: new google.maps.LatLng({
								lat: parseFloat(m[0]),
								lng: parseFloat(m[1])
							}),
							radius: parseFloat( $("input[name='circle_radius']").val() ),
							draggable: true
						});
						
						circle.addListener("dragend", function() {
							wpgmza_update_center_field();
						});
						
						MYMAP.map.fitBounds(circle.getBounds());
						
					}
				}

			})(jQuery);

        </script>
        <?php
}

function wpgmza_b_add_circle($mid)
{
	global $wpgmza_tblname_maps;
    global $wpdb;
	
	wpgmaps_b_admin_add_circle_javascript();
	
    if ($_GET['action'] == "add_circle" && isset($mid)) {
        $res = wpgmza_get_map_data($mid);
        echo "
            

            
          
           <div class='wrap'>
                <h1>WP Google Maps</h1>
                <div class='wide'>

                    <h2>".__("Add circle","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".$mid."' method='post' id='wpgmaps_add_circle_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".$mid."' />
					
					<input type='hidden' name='center'/>
					
                    <table class='wpgmza-listing-comp' style='width:30%;float:left;'>
                        <tr>
                            <td>
                                ".__("Name","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"circle\" name=\"circle_name\" type=\"text\" value=\"\" />
                            </td>
                        </tr>
						<tr>
							<td>
                                ".__("Color","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"circle_color\" name=\"circle_color\" type=\"color\" value=\"#ff0000\" />
                            </td>
						</tr>
                        <tr>
                            <td>
                                ".__("Opacity","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"circle_opacity\" name=\"circle_opacity\" type=\"text\" value=\"0.6\" /> (0 - 1.0) example: 0.6 for 60%
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Radius","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"circle_radius\" name=\"circle_radius\" type=\"text\" value=\"20\" />
                            </td>
                    	</tr>
						<tr>
							<td></td>
							<td>
								<p id='circle-radius-visibility-warning' class='notice notice-warning'>
									" . __('Please note your circle may be too small to be visible at this zoom level', 'wp-google-maps') . "
								</p>
							</td>
						</tr>
                    </table>
                    <div class='wpgmza_map_seventy'> 
	                    <div id=\"wpgmza_map\">&nbsp;</div>
	                    <p>
	                            <ul style=\"list-style:initial; margin-top: -145px !important;\" class='update-nag update-blue update-slim update-map-overlay'>
	                                <li style=\"margin-left:30px;\">" . __('Click on the map to insert a circle.', 'wp-google-maps') . "</li>
	                                <li style=\"margin-left:30px;\">" . __('Click or drag the circle to move it.', 'wp-google-maps') . "</li>
	                            </ul>
	                    </p>
	                </div>

                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='wpgmza_save_circle' class='button-primary' value='".__("Save Circle","wp-google-maps")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }
}

function wpgmza_b_edit_circle($mid)
{
	global $wpgmza;
	global $wpgmza_tblname_maps;
	global $wpgmza_tblname_circles;
    global $wpdb;
	
	wpgmaps_b_admin_add_circle_javascript();
	
	wpgmza_enqueue_fontawesome();
	
    if ($_GET['action'] == "edit_circle" && isset($mid)) {
        $res = wpgmza_get_map_data($mid);
		$circle_id = (int)$_GET['circle_id'];
		
		$results = $wpdb->get_results("SELECT *, {$wpgmza->spatialFunctionPrefix}AsText(center) AS center FROM $wpgmza_tblname_circles WHERE id = $circle_id");
		
		if(empty($results))
		{
			echo "<p class='notice notice-error'>" . __('Invalid circle ID', 'wp-google-maps') . "</p>";
			return;
		}
		
		$circle = $results[0];
		
		$name = addcslashes($circle->name, '"');
		$center = preg_replace('/POINT\(|[,)]/', '', $circle->center);
		
        echo "
           <div class='wrap'>
                <h1>WP Google Maps</h1>
                <div class='wide'>

                    <h2>".__("Edit circle","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".$mid."' method='post' id='wpgmaps_add_circle_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".$mid."' />
					<input type='hidden' name='circle_id' value='{$circle_id}'/>
					
					<input type='hidden' name='center' value='{$center}'/>
					
                    <table class='wpgmza-listing-comp' style='width:30%;float:left;'>
                        <tr>
                            <td>
                                " . __("Name","wp-google-maps") . "
                            </td>
                            <td>
                                <input id=\"circle\" name=\"circle_name\" type=\"text\" value=\"$name\" />
                            </td>
                        </tr>
						<tr>
							<td>
								" . __('Center', 'wp-google-maps') . "
							</td>
							<td>
								<input name='center' value='" . esc_attr($center) . "'/>
								<button id='fit-bounds-to-shape' 
									class='button button-secondary' 
									type='button' 
									title='" . __('Fit map bounds to shape', 'wp-google-maps') . "'
									data-fit-bounds-to-shape='circle'>
									<i class='fas fa-eye'></i>
								</button>
							</td>
						</tr>
						<tr>
							<td>
                                ".__("Color","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"circle_color\" name=\"circle_color\" type=\"color\" value=\"{$circle->color}\" />
                            </td>
						</tr>
                        <tr>
                            <td>
                                ".__("Opacity","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"circle_opacity\" name=\"circle_opacity\" type=\"text\" value=\"{$circle->opacity}\" type='number' step='any' /> (0 - 1.0) example: 0.6 for 60%
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Radius","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"circle_radius\" name=\"circle_radius\" type=\"text\" value=\"{$circle->radius}\" type='number' step='any' />
                            </td>
                    	</tr>
						<tr>
							<td></td>
							<td>
								<p id='circle-radius-visibility-warning' class='notice notice-warning'>
									" . __('Please note your circle may be too small to be visible at this zoom level', 'wp-google-maps') . "
								</p>
							</td>
						</tr>
                    </table>
                    <div class='wpgmza_map_seventy'> 
	                    <div id=\"wpgmza_map\">&nbsp;</div>
	                    <p>
	                            <ul style=\"list-style:initial; margin-top: -145px !important;\" class='update-nag update-blue update-slim update-map-overlay'>
	                                <li style=\"margin-left:30px;\">" . __('Click or drag the circle to move it.', 'wp-google-maps') . "</li>
	                            </ul>
	                    </p>
	                </div>

                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='wpgmza_save_circle' class='button-primary' value='".__("Save Circle","wp-google-maps")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }
}


function wpgmaps_b_admin_add_rectangle_javascript()
{
	 $res = wpgmza_get_map_data(sanitize_text_field($_GET['map_id']));
        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");


        $wpgmza_lat = $res->map_start_lat;
        $wpgmza_lng = $res->map_start_lng;
        $wpgmza_map_type = $res->type;
        $wpgmza_width = $res->map_width;
        $wpgmza_height = $res->map_height;
        $wpgmza_width_type = $res->map_width_type;
        $wpgmza_height_type = $res->map_height_type;
        if (!$wpgmza_map_type || $wpgmza_map_type == "" || $wpgmza_map_type == "1") { $wpgmza_map_type = "ROADMAP"; }
        else if ($wpgmza_map_type == "2") { $wpgmza_map_type = "SATELLITE"; }
        else if ($wpgmza_map_type == "3") { $wpgmza_map_type = "HYBRID"; }
        else if ($wpgmza_map_type == "4") { $wpgmza_map_type = "TERRAIN"; }
        else { $wpgmza_map_type = "ROADMAP"; }
        $start_zoom = $res->map_start_zoom;
        if ($start_zoom < 1 || !$start_zoom) {
            $start_zoom = 5;
        }
		?>
        <link rel='stylesheet' id='wpgooglemaps-css'  href='<?php echo wpgmaps_get_plugin_url(); ?>/css/wpgmza_style.css' type='text/css' media='all' />
        <script type="text/javascript" >
		
			var rectangle;
			var MYMAP = {
					map: null,
					bounds: null
				};
		
			(function($) {
		
				var myLatLng = new google.maps.LatLng(<?php echo $wpgmza_lat; ?>,<?php echo $wpgmza_lng; ?>);
				
				jQuery(function($) {
					function wpgmza_InitMap() {
						
						MYMAP.init('#wpgmza_map', myLatLng, <?php echo $start_zoom; ?>);
					}
					$("#wpgmza_map").css({
						height:'<?php echo $wpgmza_height; ?><?php echo $wpgmza_height_type; ?>',
						width:'<?php echo $wpgmza_width; ?><?php echo $wpgmza_width_type; ?>'
					});
					wpgmza_InitMap();
					
					
					$("#rectangle_opacity").keyup(function() {
						if(!rectangle)
							return;
						rectangle.setOptions({
							fillOpacity: parseFloat($(event.target).val())
						});
					});
					
					$("#rectangle_color").on("input", function(event) {
						if(!rectangle)
							return;
						rectangle.setOptions({
							fillColor: $(event.target).val()
						});
					});
					
					$("#wpgmaps_add_rectangle_form").on("submit", function(event) {
						
						$("input[name='bounds']").val(rectangle.getBounds().toString());
						
					});
						
				});
				
				MYMAP.init = function(selector, latLng, zoom) {
					
					var self = this;
					
					  var myOptions = {
						zoom:zoom,
						center: latLng,
						zoomControl: true,
						panControl: true,
						mapTypeControl: true,
						streetViewControl: true,
						mapTypeId: google.maps.MapTypeId.<?php echo $wpgmza_map_type; ?>
					  }
					this.map = new google.maps.Map($(selector)[0], myOptions);
					this.bounds = new WPGMZA.LatLngBounds();
					
					google.maps.event.addListener(this.map, "click", function(event) {
						
						if(rectangle)
							rectangle.setMap(null);
						
						var bounds = MYMAP.map.getBounds();
						var northEast = bounds.getNorthEast();
						var southWest = bounds.getSouthWest();
						var center = bounds.getCenter();
						var width = northEast.lng() - southWest.lng();
						var height = northEast.lat() - southWest.lat();
						
						rectangle = new google.maps.Rectangle({
							fillColor: $("input[name='rectangle_color']").val(),
							fillOpacity: $("input[name='rectangle_opacity']").val(),
							bounds: {
								west: center.lng() - width / 4,
								east: center.lng() + width / 4,
								north: center.lat() - height / 4,
								south: center.lat() + height / 4
							},
							strokeOpacity: 0,
							map: self.map,
							draggable: true,
							editable: true
						});
					});
					
					if(window.location.href.match(/edit_rectangle/))
					{
						var m = $("input[name='bounds']").val().match(/-?\d+(\.\d+)?/g);
						
						rectangle = new google.maps.Rectangle({
							fillColor: $("input[name='rectangle_color']").val(),
							fillOpacity: $("input[name='rectangle_opacity']").val(),
							strokeOpacity: 0,
							map: self.map,
							draggable: true,
							editable: true,
							bounds: {
								north: parseFloat(m[0]),
								west: parseFloat(m[1]),
								south: parseFloat(m[2]),
								east: parseFloat(m[3]),
							}
						});
						
					}
					
					setTimeout(function() {
						$("#fit-bounds-to-shape").click();
					}, 500);
				}

			})(jQuery);

        </script>
        <?php
}

function wpgmza_b_add_rectangle($mid)
{
	global $wpgmza_tblname_maps;
    global $wpdb;
	
	wpgmaps_b_admin_add_rectangle_javascript();
	
    if ($_GET['action'] == "add_rectangle" && isset($mid)) {
        $res = wpgmza_get_map_data($mid);
        echo "
            

            
          
           <div class='wrap'>
                <h1>WP Google Maps</h1>
                <div class='wide'>

                    <h2>".__("Add rectangle","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".$mid."' method='post' id='wpgmaps_add_rectangle_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".$mid."' />
					
					<input type='hidden' name='bounds'/>
					
                    <table class='wpgmza-listing-comp' style='width:30%;float:left;'>
                        <tr>
                            <td>
                                ".__("Name","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"rectangle\" name=\"rectangle_name\" type=\"text\" value=\"\" />
                            </td>
                        </tr>
						<tr>
							<td>
                                ".__("Color","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"rectangle_color\" name=\"rectangle_color\" type=\"color\" value=\"#ff0000\" />
                            </td>
						</tr>
                        <tr>
                            <td>
                                ".__("Opacity","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"rectangle_opacity\" name=\"rectangle_opacity\" type=\"text\" value=\"0.6\" /> (0 - 1.0) example: 0.6 for 60%
                            </td>
                        </tr>
                        
                    </table>
                    <div class='wpgmza_map_seventy'> 
	                    <div id=\"wpgmza_map\">&nbsp;</div>
	                    <p>
	                            <ul style=\"list-style:initial; margin-top: -145px !important;\" class='update-nag update-blue update-slim update-map-overlay'>
	                                <li style=\"margin-left:30px;\">" . __('Click on the map to insert a rectangle.', 'wp-google-maps') . "</li>
	                                <li style=\"margin-left:30px;\">" . __('Click or drag the rectangle to move it.', 'wp-google-maps') . "</li>
	                            </ul>
	                    </p>
	                </div>

                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='wpgmza_save_rectangle' class='button-primary' value='".__("Save rectangle","wp-google-maps")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }
}

function wpgmza_b_edit_rectangle($mid)
{
	global $wpgmza;
	global $wpgmza_tblname_maps;
	global $wpgmza_tblname_rectangles;
    global $wpdb;
	
	wpgmaps_b_admin_add_rectangle_javascript();
	
    if ($_GET['action'] == "edit_rectangle" && isset($mid)) {
        $res = wpgmza_get_map_data($mid);
		$rectangle_id = (int)$_GET['rectangle_id'];
		
		$results = $wpdb->get_results("SELECT *, {$wpgmza->spatialFunctionPrefix}AsText(cornerA) AS cornerA, {$wpgmza->spatialFunctionPrefix}AsText(cornerB) AS cornerB FROM $wpgmza_tblname_rectangles WHERE id = $rectangle_id");
		
		if(empty($results))
		{
			echo "<p class='notice notice-error'>" . __('Invalid rectangle ID', 'wp-google-maps') . "</p>";
			return;
		}
		
		$rectangle = $results[0];
		
		$name = addcslashes($rectangle->name, '"');
		preg_match_all('/-?\d+(\.\d+)?/', $rectangle->cornerA . $rectangle->cornerB, $m);
		
		$north = $m[0][0];
		$west = $m[0][1];
		$south = $m[0][2];
		$east = $m[0][3];
		
        echo "
           <div class='wrap'>
                <h1>WP Google Maps</h1>
                <div class='wide'>

                    <h2>".__("Edit rectangle","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".$mid."' method='post' id='wpgmaps_add_rectangle_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".$mid."' />
					<input type='hidden' name='rectangle_id' value='{$rectangle_id}'/>
					
					<input type='hidden' name='bounds' value='$north $west $south $east'/>
					
                    <table class='wpgmza-listing-comp' style='width:30%;float:left;'>
                        <tr>
                            <td>
                                " . __("Name","wp-google-maps") . "
                            </td>
                            <td>
                                <input id=\"rectangle\" name=\"rectangle_name\" type=\"text\" value=\"$name\" />
                            </td>
                        </tr>
						<tr>
							<td>
                                ".__("Color","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"rectangle_color\" name=\"rectangle_color\" type=\"color\" value=\"{$rectangle->color}\" />
                            </td>
						</tr>
                        <tr>
                            <td>
                                ".__("Opacity","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"rectangle_opacity\" name=\"rectangle_opacity\" type=\"text\" value=\"{$rectangle->opacity}\" type='number' step='any' /> (0 - 1.0) example: 0.6 for 60%
                            </td>
                        </tr>
						<tr>
							<td>
								".__('Show Rectangle', 'wp-google-maps')."
							</td>
							<td>
								<button id='fit-bounds-to-shape' 
									class='button button-secondary' 
									type='button' 
									title='" . __('Fit map bounds to shape', 'wp-google-maps') . "'
									data-fit-bounds-to-shape='rectangle'>
									<i class='fas fa-eye'></i>
								</button>
							</td>
						</tr>
                    </table>
                    <div class='wpgmza_map_seventy'> 
	                    <div id=\"wpgmza_map\">&nbsp;</div>
	                    <p>
	                            <ul style=\"list-style:initial; margin-top: -145px !important;\" class='update-nag update-blue update-slim update-map-overlay'>
	                                <li style=\"margin-left:30px;\">" . __('Click or drag the rectangle to move it.', 'wp-google-maps') . "</li>
	                            </ul>
	                    </p>
	                </div>

                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='wpgmza_save_rectangle' class='button-primary' value='".__("Save rectangle","wp-google-maps")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }
}


if(!function_exists('wpgmza_get_circle_data'))
{
	function wpgmza_get_circle_data($map_id)
	{
		global $wpgmza;
		global $wpdb;
		global $wpgmza_tblname_circles;
		
		$stmt = $wpdb->prepare("SELECT *, {$wpgmza->spatialFunctionPrefix}AsText(center) AS center FROM $wpgmza_tblname_circles WHERE map_id=%d", array($map_id));
		$results = $wpdb->get_results($stmt);
		
		$circles = array();
		foreach($results as $obj)
			$circles[$obj->id] = $obj;
		
		return $circles;
	}
}

if(!function_exists('wpgmza_get_rectangle_data'))
{
	function wpgmza_get_rectangle_data($map_id)
	{
		global $wpgmza;
		global $wpdb;
		global $wpgmza_tblname_rectangles;
		
		$stmt = $wpdb->prepare("SELECT *, {$wpgmza->spatialFunctionPrefix}AsText(cornerA) AS cornerA, {$wpgmza->spatialFunctionPrefix}AsText(cornerB) AS cornerB FROM $wpgmza_tblname_rectangles WHERE map_id=%d", array($map_id));
		$results = $wpdb->get_results($stmt);
		
		$rectangles = array();
		foreach($results as $obj)
			$rectangles[$obj->id] = $obj;
		
		return $rectangles;
	}
}

// Get admin path
function wpgmza_basic_get_admin_path()
{
	$default = ABSPATH . 'wp-admin/';
	
	if(file_exists($default))
		return $default;
	
	return $admin_path = str_replace( get_bloginfo( 'url' ) . '/', ABSPATH, get_admin_url() );
}

// Add circles and rectangles to database
function wpgmza_basic_db_install_circles()
{
	require_once(wpgmza_basic_get_admin_path() . 'includes/upgrade.php');
	
	global $wpgmza_tblname_circles;
	
	$sql = "
		CREATE TABLE `$wpgmza_tblname_circles` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			name TEXT,
			center POINT,
			radius FLOAT,
			color VARCHAR(16),
			opacity FLOAT,
			PRIMARY KEY  (id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";
	
    dbDelta($sql);
}

function wpgmza_basic_db_install_rectangles()
{
	require_once(wpgmza_basic_get_admin_path() . 'includes/upgrade.php');
	
	global $wpgmza_tblname_rectangles;
	
	$sql = "
		CREATE TABLE `$wpgmza_tblname_rectangles` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			name TEXT,
			cornerA POINT,
			cornerB POINT,
			color VARCHAR(16),
			opacity FLOAT,
			PRIMARY KEY  (id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";
	
    dbDelta($sql);
}

function wpgmza_basic_db_install_v7_tables() {
	wpgmza_basic_db_install_circles();
	wpgmza_basic_db_install_rectangles();
}

function maybe_install_v7_tables_basic()
{
	global $wpdb;
	
	if(!$wpdb->get_var("SHOW TABLES LIKE '{$wpdb->prefix}wpgmza_circles'") || !$wpdb->get_var("SHOW TABLES LIKE '{$wpdb->prefix}wpgmza_rectangles'"))
		wpgmza_basic_db_install_v7_tables();
}

add_action('init', 'maybe_install_v7_tables_basic');

if(!function_exists('wpgmza_enqueue_fontawesome'))
{
	/**
	 * Enqueues fontawesome
	 * DEPRECATED :- This functionality has been handed off to the ScriptLoader class
	 */
	function wpgmza_enqueue_fontawesome()
	{
		// DEPRECATED
		/*$settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		if($settings)
			$settings = maybe_unserialize($settings);
		else
			$settings = array(
				'use_fontawesome' => '5.*'
			);

		$version = (empty($settings['use_fontawesome']) ? '4.*' : $settings['use_fontawesome']);
		
		switch($version)
		{
			case '5.*':
				wp_enqueue_style('fontawesome', 'https://use.fontawesome.com/releases/v5.0.9/css/all.css');
				break;
				
			case 'none':
				break;
				
			default:
				wp_enqueue_style('fontawesome', plugins_url('css/font-awesome.min.css', __FILE__));
				break;
		}*/
	}
}

add_action('plugins_loaded', function() {
	
	if(!empty($_GET['wpgmza-build']))
	{
		$scriptLoader = new WPGMZA\ScriptLoader(false);
		$scriptLoader->build();
	
		if(class_exists('WPGMZA\\ProPlugin'))
		{
			$scriptLoader = new WPGMZA\ScriptLoader(true);
			$scriptLoader->build();
		}
		
		echo "Build successful";
		
		exit;
	}
	
});