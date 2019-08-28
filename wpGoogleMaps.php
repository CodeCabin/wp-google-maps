<?php
/*
Plugin Name: WP Google Maps
Plugin URI: https://www.wpgmaps.com
Description: The easiest to use Google Maps plugin! Create custom Google Maps with high quality markers containing locations, descriptions, images and links. Add your customized map to your WordPress posts and/or pages quickly and easily with the supplied shortcode. No fuss.
Version: 7.11.48
Author: WP Google Maps
Author URI: https://www.wpgmaps.com
Text Domain: wp-google-maps
Domain Path: /languages
*/

/*
 * 7.11.48 :- 2019-08-28 :- Low priority
 * Fixed polygons and polylines not displaying back end before global settings have been saved
 * Increased link column to accept 2083 characters
 *
 * 7.11.47 :- 2019-08-09 :- Medium priority
 * Fixed map engine dialog submission not working
 * Fixed WPGMZA.EventDispatcher not handing some native events over to DOM correctly
 *
 * 7.11.46 :- 2019-08-08 :- Medium priority
 * Fixed conflict with WooCommerce effecting checkout page on installations with debug notices turned on
 * Fixed WPGMZA.getQueryParamValue matching location hash on last parameter
 *
 * 7.11.45 :- 2019-08-07 :- Medium priority
 * Added ABSPATH checks to .html.php files, class.settings.php and backwards_compat_v6.php
 * Fixed add shape buttons disabled for Google when global settings have never been saved
 * Fixed permissions issues when attempting to save global settings (HTTP error 401)
 * Fixed permissions issues preventing users without manage_options capability from logging in
 *
 * 7.11.44 :- 2019-08-01 :- Low priority
 * Added REST API parameter skipNonceCheck for Live Tracking App
 * Fixed map type settings not "live" in map edit page
 * Fixed map type setting not reflected when map edit page initialises
 *
 * 7.11.43 :- 2019-07-31 :- Low priority
 * RestAPI now exposes registerRoute as a public function for add-ons to register REST API routes
 * New action wpgmza_register_rest_api_routes added
 *
 * 7.11.42 :- 2019-07-30 :- Medium priority
 * Added checks for ABSPATH to all PHP modules
 * Added a console warning when Array prototype has been improperly extended, which breaks for ... in loops
 * Improved parameter sanitization
 * Dropped deprecated usage tracking function
 * Dropped unused GoogleGeocoder class
 * Dropped old admin head function, added update notice for users running Pro < 5.24
 * Fixed AJAX REST API POST calls always failing nonce security check
 *
 * 7.11.41 :- 2019-07-29 :- Medium priority
 * Fixed store locator not working in OpenLayers since 7.11.40 due to missing nonce
 *
 * 7.11.40 :- 2019-07-29 :- Medium priority
 * REST API security enhanced with additional per-route nonces
 * getScrollAnimationOffset now accounts for WP admin bar height
 * removeMarker now closes marker InfoWindow before removing it
 * Fixed notice on map edit page on setups with E_NOTICE error display
 * Fixed markers not removed from map panel following bulk delete
 * Fixed GoogleHTMLOverlay is not a constructor when WPGMZA.settings.engine is null
 *
 * 7.11.39 :- 2019-07-25 :- Medium priority
 * Added code to update OpenLayers marker position following icon loading
 * Fixed marker being off-position before user interaction on certain setups
 * Fixed dataTables translations not working
 * Fixed fatal error on map pages when GDPR notice filter returns an empty string
 * Fixed category icon not respected in map panel when running Pro <= 6.*
 *
 * 7.11.38 :- 2019-07-22 :- Low priority
 * Removed advisory REST AJAX notice due to false positives
 *
 * 7.11.37 :- 2019-07-16 :- Low priority
 * Fixed polyline color control not "live" on polygon edit page
 *
 * 7.11.36 :- 2019-07-11 :- Low priority
 * Re-added admin-ajax fallback for when REST API is blocked
 * Fixed Polyline color issue
 *
 * 7.11.35 :- 2019-07-08 :- High priority
 * Security vulnerabilities fixed (Thank you Plugin Review Team at WordPress.org and pluginvulnerabilities.com)
 * 
 * 7.11.34 :- 2019-07-07 :- Medium priority
 * Fixed DataTable sort order unpredictable with mixture of numeric and non-numeric data
 * Rolled back admin-ajax changes pending review
 *
 * 7.11.33 :- 2019-07-02 :- Low priority
 * Added admin-ajax fallback for when REST API is blocked
 * Fixed characters such as accents showing as plain text HTML entities in DOMElement
 * Fixed object must implement countable notice on QueryFragment
 * Regenerated temporary API key
 * Removed unreachable code
 *
 * 7.11.32 :- 2019-06-21 :- Low priority
 * Added mechanism to report 403 Forbidden on REST API, this is usually caused by security plugins blocking REST requests for non-logged in users
 *
 * 7.11.31 :- 2019-06-18 :- Low priority
 * Added checkbox to disable Autoptimize workaround for setups where the workaround prevents CSS aggregation
 * DataTable module now uses RestAPI module to make AJAX requests
 * Fixed "Permalink Manager Lite" breaking admin marker table when POST requests are used
 * Fixed welcome screen not working
 *
 * 7.11.30 :- 2019-06-12 :- Medium priority
 * Added /decompress REST API endpoint for debugging compressed path variable requests
 * Added integration with WP REST Cache by Acato
 * Added Elias Fano encoding modules for efficient transmission of marker ID's on compressed path variable requests
 * REST API module now no longer loads the entire WP REST API client side library
 * Moved clearInterval on Google infowindow to before event is triggered, the event will no longer fire repeatedly if any attached listeners cause an error
 * Fixed bulk delete not working
 * Removed performance intensive regex checks on template_redirect. Short code flag is now set by short code callbacks
 * Fixed notice in legacy-core.php when no map ID present on shortcode
 * Fixed cannot use scalar value as array when localizing legacy current map ID global
 * Fixed issues with older versions of Pro add-on and admin marker table
 *
 * 7.11.29 :- 2019-06-06 :- Low priority
 * Added support for compressed path variables on REST API module (experimental)
 *
 * 7.11.28 :- 2019-06-03 :- Medium priority
 * Added nonce to settings form on admin post action
 * Fixed errors on PHP installations where documentElement is not a property on DOMDocument
 *
 * 7.11.27 :- 2019-05-29 :- Medium priority
 * Added keypress listener for enter on store locator for configurations which don't emit keydown
 * Changed (experimental) compressed REST datatables GET request to use a cachable path variable rather than query string
 * Fixed classes that subclass WPGMZA.AdvancedTableDataTable not having "Show X items" setting applied in Pro
 * Fixed missing spatial function prefixes in WPGMZA\MarkerFilter::applyRadiusClause, now works with MySQL 8.*
 * Fixed "no results found" not showing when new MarkerFilter returns zero results
 * DataTables AJAX route no longer issues notice when used without a HTTP_REFERER
 * 
 * 7.11.26 - 2019-05-22 :- Medium Priority
 * Tested with WordPress 5.2.1
 * REST API only passes map ID to child classes of MarkerListing and AdvancedTable
 * Fixed admin marker table not loading due to the above
 * 
 * 7.11.25 - 2019-05-21 :- Low priority
 * Added CSS max width fix to override themes breaking OpenLayers markers
 * Added WPGMZA.Text and WPGMZA.GoogleText modules
 * Added experimental setting WPGMZA.settings.useCompressedDataTablesRequests
 * Developer mode and SCRIPT_DEBUG will now enqueue OpenLayers unminified
 * WPGMZA.LatLngBounds can now take an instance of WPGMZA.LatLngBounds in constructor arguments
 * Renamed deletePolygon, deletePolyline to removePolygon, removePolyline etc. on WPGMZA.Map
 * wpgmaps_check_shortcode no longer sets short_code_active to false
 * Fixed links not clickable in Pro InfoWindows
 * Fixed issue with WPGMZA.LatLngBounds around 180th meridian
 * Fixed various typos
 * Fixed error where _gdprCompliance on Plugin class would be empty for Gutenberg integration
 *
 * 7.11.24 :- 2019-05-20 :- Medium priority
 * Store Locator module no longer triggers a filter update when the address was not found
 *
 * 7.21.23
 * Tested with WordPress 5.2
 * Added more robust error handling for missing files and failed initialisations (when NOT in developer mode)
 * Fixed LatLngBounds issue with 180th meridian
 * Fixed "undefined" in map edit page infowindows
 *
 * 7.11.22 :- 2019-05-08 :- Low priority
 * Added the ability to toggle auto night mode as well as a theme
 * Added a min height to bakend map so that it does not break when height is set to 100%
 * Added shift-click range selection to admin marker table
 * Added code to automatically regenerate readme.txt changelog
 * Fixed ModernStoreLocator creating OpenLayers store locator when engine setting is null and defaulting to Google
 * Fixed beforeunload listener always bound on map edit page (fixed Save Changes? prompt shown even if no changes were made)
 * Dropped logging in ScriptLoader module
 *
 * 7.11.21 :- 2019-04-16 :- Low priority
 * Added serializeFormData to DOMDocument and DOMElement
 * Added new event for InfoWindows - domready.wpgmza
 * Added new function WPGMZA.extend for shorthand extension of modules
 * Added warning when WPGMZA.RestAPI.call is called (as opposed to WPGMZA.restAPI.call)
 * Implemented factory method for map settings page JS module
 * Changed RestAPI to not throw an error when a call is aborted
 * Changed DB version checks to use global version string (this module is currently not used)
 * Fixed missing comma in DB installation code preventing marker table from being created (this module is currently not used)
 *
 * 7.11.20 :- 2019-04-09 :- Low priority
 * Added Mexican Spanish (es_MX) translations
 * Added revert back to DB pull when XML folder not present
 * Updated PO files from sources
 * Fixed rectangles not working when using v6 of Pro
 *
 * 7.11.19 :- 2019-04-02 :- Low priority
 * Readme.txt Upgrade Notice updated
 * Fixed markers sometimes off position when using OpenLayers
 *
 * 7.11.18 :- 2019-04-02 :- High priority
 * Fixed potential REST API exploit (affects 7.11.00 - 7.11.17 - with thanks to Thomas Chauchefoin)
 *
 * 7.11.17 :- 2019-04-02 :- Low priority
 * Added shortcode attribute classname
 * Fixed Custom CSS classes in Gutenberg editor not being applied
 *
 * 7.11.16 :- 2019-03-28 :- Low priority
 * Added Catalan translation files
 * Added hide POI logic to WPGMZA.GoogleMap
 * Added new global setting WPGMZA.settings.hide_points_of_interest
 *
 * 7.11.15 :- 2019-03-25 :- Medium priority
 * Added caching warning to GDPR Compliance settings panel
 * Added check for wp.components in Gutenberg module
 * Renamed Croation translations to correct -hr.* suffix
 * Fixed incorrect logic causing unapproved markers to appear in Pro marker listings
 * Relaxed "combined file would be blank" from exception to an admin notice when in the WordPress environment
 *
 * 7.11.14 :- 2019-03-14 :- Low priority
 * Added convenience function WPGMZA.getQueryParamValue
 * Most PHP now uses isInDeveloperMode() rather than referencing the setting directly
 * Fixed setting developer mode cookie would set developer mode in database
 *
 * 7.11.13 :- 2019-03-11 :- Low priority 
 * Fixed adding "select" function to Array prototype colliding with "select" event listener for markers
 * Fixed sorting direction not respected in AjaxTable following 7.11.11 changes
 *
 * 7.11.12 :- 2019-03-08 :- Low priority
 * Removed debugging code from class.query.php
 * Fixed mismatched setting name for Store Locator distance units causing "miles" to be ignored
 *
 * 7.11.11 :- 2019-03-07 :- Low priority
 * Allowed LatLngBounds to wrap around 180th meridian, Gold now clusters correctly on wide or zoomed out maps
 * Altered AjaxTable to treat text fields containing numeric data as numeric, giving more natural sort order on those fields
 * Fixed wildcard not being used when no fields passed to Query
 * Fixed notices and inconsistencies with Elementor integration
 *
 * 7.11.10 :- 2019-03-05 :- Low priority
 * Changed Google Maps API error handler to render in a panel rather than in a modal dialog
 * Removed "In light of recent GDPR regulation" admin notice
 * Fixed clicking listen item outside link has no effect on map edit page tabs
 *
 * 7.11.09 :- 2019-02-28 :- Medium priority
 * Added disableInfoWindow to map objects which is used by InfoWindow.prototype.open
 * Added LatLng.fromCurrentPosition
 * Added warning and explanation when Google Maps is selected but API loader is not allowed to load the API
 * Non-standard jQuery versions now issue console warning rather than cancelling map initialisation
 * Map element now fires infowindow close event
 * Fixed infowindow close event firing after infowindow element removed
 *
 * 7.11.08 :- 2019-02-25 :- Medium priority
 * Google Maps API error dialog is now shown when in developer mode
 * Fixed missing link on "No API Keys" message in Google Maps API error dialog
 * Fixed "undefined" InfoWindow opening
 * Removed 100px minimum width from InfoWindows
 *
 * 7.11.07 :- 2019-02-22 :- Medium priority
 * Added Distance class
 * Added property storeLocatorDistanceUnits to WPGMZA\Map
 * Fixed Spatial function prefix not applied for version 8 due to wrong operator
 * Fixed MarkerFilter radius clause ignoring store locator distance units setting
 * Removed console.log call in GoogleMarker setVisible
 *
 * 7.11.06 :- 2019-02-20 :- Low priority
 * WPGMZA.RestAPI.prototype.call now returns xhr
 * Improved modern store locator UX by switching reset button back to search button when text is inputted into address field
 * Fixed "disable double click zoom" logic flipped
 * Fixed undefined notice in AjaxTable breaking carousel marker listing in Pro when display_errors is true
 * Fixed bulk delete not working due to removed legacy function
 *
 * 7.11.05 :- 2019-02-15 :- Medium priority
 * Improved WP Migrate DB integration by adding our plugin to their whitelist when WP Migrate DB is activated
 * Re-added data-wpgmza-datatable-options attribute to datatables
 * Fixed encoding issues in marker listing caused by UTF-8 to HTML entities conversion not being used
 *
 * 7.11.04 :- 2019-02-13 :- Medium priority
 * Added extra functions to LatLngBounds to support upcoming Gold patch  (extendByPixelMargin, contains)
 * Added Caltopo to tile servers
 * Added Latvian translation
 * Shortcode attributes are now passed to map element through data-shortcode-attributes
 * DataTables loads unminified in developer mode
 * DataTables no longer enqueued twice on map edit page
 * DataTables translation re-applied following new AJAX implementation
 * Changed wrong text domains in translation functions in tile-server-fieldset.html.php
 *
 * 7.11.03 :- 2019-02-06 :- Low priority
 * DataTables issue no longer present when running Developer Mode
 * Fixed "display all" breaking admin marker table
 * Fixed "Map Type" not being applied
 *
 * 7.11.02 :- 2019-01-31 :- High priority
 * Added override method to Settings module so settings are overridable without altering database
 * Fixed fatal error in legacy-core.php when running older versions of Pro without Custom Fields
 *
 * 7.11.01 :- 2019-01-30 :- Medium priority
 * Fixed undefined notice in AjaxTable when using Pro marker listings
 * Fixed legacy Google error message breaking Gutenberg editor when no key is present
 * Fixed legacy compatibility issue with Global Settings module
 *
 * 7.11.00 :- 2019-01-30 :- Medium priority
 * Added new GlobalSettings module
 * Optimized marker tables and listings giving significant performance boost when viewing marker listings, editing, adding and deleting markers
 * Nominatim Cache now records country restriction
 * Improved robusticity of data-settings attribute handling
 * Added WPGMZA.LatLng.prototype.toLatLngLiteral
 * Added check for jQuery slider in wpgmaps_tabs.js
 * Added check for WordPress REST API and notices where that is not present
 * Removed 5,000 marker live edit limit following performance optimizations
 * Deprecated redundant WPGMZA_SETTINGS option
 * Moved all code from main PHP file to legacy-core.php
 * Checks for namespace, DOMDocument and WP REST API added in main file, a warning is issued if these are missing rather than a fatal error
 * Fixed undefined index wpgmza_settings_marker_pull on new installations
 * Fixed country restriction broken in OpenLayers
 * Fixed interaction controls (disable pan, double click zoom and mousewheel) ignored in OpenLayers due to wrong scope
 * Fixed zoom limits not respected in OpenLayers
 * Fixed zoom limits incorrectly interpreted by Google
 * Fixed "minZoom cannot exceed maxZoom" breaking Google maps when settings are reversed
 * Fixed country restriction not respected by OpenLayers
 *
 * 7.10.58 :- 2019-01-18 :- Low priority
 * Added code to catch Geocoding Service errors in GoogleAPIErrorHandler
 * Fixed wrong database prefix in wpgmaps_return_markers when running on a multisite installation
 *
 * 7.10.57
 * Corrected year in 7.10.56 changelog
 *
 * 7.10.56 :- 2019-01-09 :- Medium Priority
 * Added function WPGMZA.Distance.between
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
 * 7.10.38 :- Medium priority
 * Gutenberg integration
 * Added factory class
 * Added DIVI compatibility fix
 * Added new table name constants
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
 * 7.10.29
 * Improved return_polygon_array function making edit polygon page more robust
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
 * 6.0.18
 * You can now select which roles can access the map editor
 *
 * 6.0.17
 * Minor update: PO files updated
 *
 * 6.0.16
 * You can now choose which folder your markers are saved in
 * Better error reporting for file permission issues
 *
 * 6.0.15
 * Small bug fixes
 * Map marker location bug fix
 * Russian translation added by Borisa Djuraskovic
 *
 * 6.0.14
 * Code improvements
 * Added option for selecting Celsius or Fahrenheit with the Google Maps weather layer 
 *
 * 6.0.13
 * Fixed PHP warnings and the plugin is now PHP 5.5 compatible
 *
 * 6.0.12
 * Fixed a google map marker XML file location bug
 *
 * 6.0.11
 * Small bug fix on the WP Google Maps welcome page
 *
 * 6.0.10
 * Tested on WP 3.9
 * Fixed a bug that only displayed two map marker categories for the store locator (pro)
 * Added the option to select which Google Map API version you would like to use. There were issues when using Google Map API v3.15 (lines were created on the map for no reason. The default is now Google Map API V3.14)
 *
 * 6.0.9
 * Maps now automatically work in Tabs without having to add any code
 * Added a "zoom level" slider to the Google map settings
 * Added a check for GoDaddy Wordpress hosting and the APC object cache due to the issues that arise while using it
 * Fixed a polyline bug
 * Added "stroke opacity" options to polygons
 * Added a warning when users want to use % for the map height
 *
 * 6.0.8
 * Fixed a Mac Firefox style issue with the WP Google Maps Store Locator
 * Fixed a function error in the polyline functions file
 *
 * 6.0.7
 * Upgrading of plugin is now handled correctly
 *
 * 6.0.6
 * Multisite bug fixes
 * XML marker file bug fixes (thank you Endymion00)
 *
 * 6.0.5
 * Markers are now stored in the uploads folder
 * Small bug fixes
 *
 * 6.0.4
 * Performance update
 *
 * 6.0.3
 * Small bug fix
 *
 * 6.0.2
 * Style bug fix
 *
 * 6.0.1
 * Small bug fix
 *
 * 6.0.0
 * Fixed a map width bug with the datatables layout. Now falls in line with the map width.
 * Added more options to the map settings page
 * Fixed a bug that forced a new geocode on every marker edit, even if the address wasnt changed
 * Updated TimThumb from 2.8.11 to 2.8.13
 * You can now choose for your map InfoWindows to open from mouse click or hover
 * Better error handling when the map cannot show due to conflicts or JS errors
 * Fixed the bug that caused high memory usage
 * Major bug fixes
 *
 * 5.24
 * Bug fix - The map style changed the style of your theme.
 *
 * 5.23
 * Add animations to your map markers (lite)
 * Choose to have the infowindow open by default (lite)
 * Add the bicycle and traffic layer to your map (lite)
 * Substantial coding improvements and bug fixes
 *
 * 5.22
 * Fixed the marker sort order bug
 *
 * 5.21
 * Fixed a bug that if clicking the "add maker" button produced an error, the "add marker" button would disappear.
 *
 * 5.20
 * Categories can now be hidden from the marker list
 * German translation added thanks to Matteo Ender
 *
 * 5.19
 * Fixed a styling bug with Firefox
 * Fixed the bug that caused all markers to be lost upon upgrading
 *
 * 5.18
 * Added improved styling to the address in the map infowindow
 *
 * 5.17
 * Fixed update bug
 *
 * 5.16
 * Plugin now checks to see if the Google Maps API is already loaded before trying to load it again
 * Fixed some SSL bugs
 *
 * 5.15
 * Added marker category functionality
 * Added Google Map Mashup functionality
 * Fixed small bugs
 * Added backwards compatibility for older versions of WordPress
 * Replaced deprecated WordPress function calls
 * Added Spanish translation - Thank you Fernando!
 *
 * 5.14
 * The map plugin now uses the new media manager
 * Fixed some styling conflicts
 * Added missing strings to localization
 * Updated to the latest Timthumb version
 *
 * 5.13
 * Fixed a small bug
 *
 * 5.12
 * Removed deprecated code
 *
 * 5.11
 * Added SSL bug fixes
 * Fixed a bug that wasnt allowing users to edit the exact location
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
}

if(!function_exists('wpgmza_show_dom_document_error'))
{
	function wpgmza_show_dom_document_error()
	{
		?>
		<div class="notice notice-error">
			<p>
				<?php
				_e('<strong>WP Google Maps:</strong> This plugin uses the DOMDocument class, which is unavailable on this server. Please contact your host to request they enable this library.', 'wp-google-maps');
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
				_e('<strong>WP Google Maps:</strong> This plugin requires the WordPress REST API, which does not appear to be present on this installation. Please update WordPress to version 4.7 or above.', 'wp-google-maps');
				?>
			</p>
		</div>
		<?php
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

function wpgmza_preload_is_in_developer_mode()
{
	$globalSettings = get_option('wpgmza_global_settings');
		
	if(empty($globalSettings))
		return !empty($_COOKIE['wpgmza-developer-mode']);
	
	if(!($globalSettings = json_decode($globalSettings)))
		return false;
	
	return isset($globalSettings->developer_mode) && $globalSettings->developer_mode == true;
}

if(wpgmza_preload_is_in_developer_mode())
{
	require_once(plugin_dir_path(__FILE__) . 'legacy-core.php');
}
else
	try{
		require_once(plugin_dir_path(__FILE__) . 'legacy-core.php');
	}catch(Exception $e) {
		add_action('admin_notices', function() use ($e) {
	
			?>
			<div class="notice notice-error is-dismissible">
				<p>
					<strong>
					<?php
					_e('WP Google Maps', 'wp-google-maps');
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