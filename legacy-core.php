<?php

if(!defined('ABSPATH'))
	exit;

if(!function_exists('wpgmza_require_once'))
{
	function wpgmza_require_once($filename)
	{
		if(!file_exists($filename))
			throw new Exception("Fatal error: wpgmza_require_once(): Failed opening required '$filename'");
		
		require_once($filename);
	}
}

add_action('plugins_loaded', function() {
	
	global $wpgmza_pro_version;

	if(!empty($wpgmza_pro_version) && version_compare($wpgmza_pro_version, '8.1.0', '<'))
		wpgmza_require_once(plugin_dir_path(__FILE__) . 'includes/compat/class.pro-below-8.1-compatibility.php');
	
}, 1);

wpgmza_require_once(plugin_dir_path(__FILE__) . 'constants.php');
wpgmza_require_once(plugin_dir_path(__FILE__) . 'includes/class.plugin.php');

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

	if(!function_exists('get_rest_url'))
	{
		add_action('admin_notices', 'wpgmza_show_rest_api_missing_error');
		return;
	}
}

define("WPGMZA_DIR_PATH", plugin_dir_path(__FILE__));

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

// wpgmza_require_once('includes/crud-test.php');

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

$wpgmzaMainPluginFile = plugin_dir_path(__FILE__) . 'wpGoogleMaps.php';

$subject = file_get_contents($wpgmzaMainPluginFile);
if(preg_match('/Version:\s*(.+)/', $subject, $wpgmza_m))
	$wpgmza_version = trim($wpgmza_m[1]);

define('WPGMZA_VERSION', $wpgmza_version);
define("WPGMAPS", $wpgmza_version);

$wpgmza_p_version = "6.19";
$wpgmza_t = "basic";

$plugin_dir_path = plugin_dir_path(__FILE__);

wpgmza_require_once($plugin_dir_path . 'includes/class.auto-loader.php');
wpgmza_require_once($plugin_dir_path . 'includes/class.gdpr-compliance.php');
wpgmza_require_once($plugin_dir_path . 'includes/class.plugin.php');
wpgmza_require_once($plugin_dir_path . 'includes/3rd-party-integration/class.wp-migrate-db-integration.php');
wpgmza_require_once($plugin_dir_path . 'includes/open-layers/class.nominatim-geocode-cache.php');
wpgmza_require_once($plugin_dir_path . 'includes/class.maps-engine-dialog.php');
wpgmza_require_once($plugin_dir_path . "base/includes/wp-google-maps-polygons.php" );
wpgmza_require_once($plugin_dir_path . "base/includes/wp-google-maps-polylines.php" );
wpgmza_require_once($plugin_dir_path . "base/classes/widget_module.class.php" );
wpgmza_require_once($plugin_dir_path . "includes/compat/backwards_compat_v6.php" );
wpgmza_require_once($plugin_dir_path . 'includes/legacy/functions.circle.php');
wpgmza_require_once($plugin_dir_path . 'includes/legacy/functions.rectangle.php');

function wpgmaps_head_old()
{
	trigger_error('Deprecated since 8.0.20');
}

add_filter( 'widget_text', 'do_shortcode' );


/**
 * Activate function that creates the first map and sets the default settings
 * @return void
 */

function wpgmaps_activate()
{
	wpgmaps_handle_directory();
}

function wpgmza_redirect_on_activate( $plugin )
{
	trigger_error("Deprecated since 8.1.0");
}

function wpgmaps_deactivate()
{
	trigger_error("Deprecated since 8.1.0");
}

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
function wpgmaps_init()
{
	trigger_error("Deprecated since 8.1.0");
}

/**
 * Create the XML directory if it doesnt exist.
 * @return bool true or false if there was a problem creating the directory
 */
function wpgmaps_handle_directory()
{
    // Deprecated as of 8.1.0
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
    global $wpgmza; 

    array_unshift( $links,
        '<a class="edit" href="' . admin_url('admin.php?page=wp-google-maps-menu') . '">' . __( 'Map Editor', 'wp-google-maps' ) . '</a>' );
    array_unshift( $links,
        '<a class="edit" href="' . admin_url('admin.php?page=wp-google-maps-menu-settings') . '">' . __( 'Settings', 'wp-google-maps' ) . '</a>' );

    if(!$wpgmza->isProVersion()){
        // Only show this link if the user is not a Pro user
        $proLink = "https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=plugin_link_upgrade";
		if(!$wpgmza->internalEngine->isLegacy()){
            $proLink .= "-atlas-novus";
        }

        $proLink .= wpgmzaGetUpsellLinkParams();

        array_unshift( $links,
            '<a class="" target="_BLANK" href="'.wpgm_pro_link($proLink).'">' . __( 'Get Pro Version', 'wp-google-maps' ) . '</a>' );
    }

    return $links;
}

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
    <div class="error"><p>'.__('<strong>WP Go Maps cannot find the directory it uses to save marker data to. Please confirm that <em>', 'wp-google-maps').' '.esc_url($file).' '.__('</em>exists. Please also ensure that you assign file permissions of 755 (or 777) to this directory.','wp-google-maps').'</strong></p></div>
    ';
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
function wpgmaps_admin_edit_marker_javascript()
{
	trigger_error("Deprecated since 8.1.0");
}


/**
 * Outputs the JavaScript for the map editor
 * @return void
 */
function wpgmaps_admin_javascript_basic()
{	
	trigger_error("Deprecated since 8.1.0");
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
 * @param int $mapid Map Id
 */
function wpgmaps_update_xml_file($mapid = false)
{
	global $wpgmza, $wpdb, $WPGMZA_TABLE_NAME_MAPS;
	
	if(!isset($wpgmza->settings->wpgmza_settings_marker_pull) || $wpgmza->settings->wpgmza_settings_marker_pull == '0')
		return; // DB method is being used, don't do anything
	
	if($mapid)
	{
		$map = WPGMZA\Map::createInstance($mapid);
		$map->updateXMLFile();
	}
	else
		$wpgmza->updateAllMarkerXMLFiles();
}

/**
 * Identify the marker URL and return it
 * @return string   Marker URL
 */
function wpgmza_return_marker_url() {
	global $wpgmza;
	return $wpgmza->getXMLCacheDirURL();
}

/**
 * Identify the XML marker directory PATH and return it
 * @return string   XML marker dir path 
 */
function wpgmza_return_marker_path() { 
	global $wpgmza;
	return $wpgmza->getXMLCacheDirPath();
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
	
	if(!$check)
	{
		http_response_code(403);
		exit;
	}

	if(!$wpgmza->isUserAllowedToEdit())
	{
		http_response_code(401);
		exit;
	}
	
	$map_id = (isset($_POST['map_id']) ? (int) intval($_POST['map_id']) : null);

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

		$lat = floatval($_POST['lat']);
		$lng = floatval($_POST['lng']);

		$qstr = "INSERT INTO $table_name (" . implode(',', $keys) . ") VALUES (" . implode(',', $placeholders) . ")";
		
		$params = array();
		foreach($fields as $key => $placeholder)
		{
			if($key == 'latlng')
			{
				$params[] = "POINT($lat $lng)";
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
		
		$wpgmza_check = wpgmaps_update_xml_file($map_id);
		
		if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
		$return_a = array(
			"marker_id" => $wpdb->insert_id,
			"marker_data" => wpgmaps_return_markers($map_id, $wpdb->insert_id)
		);
		echo json_encode($return_a);
		
	}
	if ($_POST['action'] == "edit_marker") {
		$cur_id = (int) intval($_POST['edit_id']);
		
		$lat = floatval($_POST['lat']);
		$lng = floatval($_POST['lng']);
		
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
			sanitize_text_field($_POST['address']),
			$lat,
			$lng,
			"POINT($lat $lng)",
			(int) intval($_POST['anim']),
			(int) intval($_POST['infoopen']),
			(int)$cur_id
		);
		
		foreach($param as $key => $value)
			$param[$key] = sanitize_text_field($value);
			
		$stmt = $wpdb->prepare($qstr, $param);
		$rows_affected = $wpdb->query($stmt);
		
		$wpgmza_check = wpgmaps_update_xml_file($map_id);
		if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
		$return_a = array(
			"marker_id" => $cur_id,
			"marker_data" => wpgmaps_return_markers($map_id, $cur_id)
		);
		echo json_encode($return_a);

	}
	if ($_POST['action'] == "delete_marker") {
		
		$marker_id = (int)$_POST['marker_id'];
		$wpdb->query( $wpdb->prepare("DELETE FROM $wpgmza_tblname WHERE `id` = %d LIMIT 1",intval($marker_id)) );

		$wpgmza_check = wpgmaps_update_xml_file($map_id);
		if ( is_wp_error($wpgmza_check) ) wpgmza_return_error($wpgmza_check);
		$return_a = array(
			"marker_id" => $marker_id,
			"marker_data" => wpgmaps_return_markers($map_id)
		);
		echo json_encode($return_a);


	}
	if ($_POST['action'] == "delete_poly") {
		$poly_id = (int)$_POST['poly_id'];
		$wpdb->query($wpdb->prepare("DELETE FROM $wpgmza_tblname_poly WHERE `id` = %d LIMIT 1",intval($poly_id)) );
		echo wpgmza_b_return_polygon_list($map_id);
	}
	if ($_POST['action'] == "delete_polyline") {
		$poly_id = (int)$_POST['poly_id'];
		$wpdb->query($wpdb->prepare("DELETE FROM $wpgmza_tblname_polylines WHERE `id` = %d LIMIT 1",intval($poly_id)) );
		echo wpgmza_b_return_polyline_list($map_id);
	}
	
	if($_POST['action'] == "delete_circle") {
		global $wpgmza_tblname_circles;
		$stmt = $wpdb->prepare("DELETE FROM $wpgmza_tblname_circles WHERE id=%d", array((int) intval($_POST['circle_id'])));
		$wpdb->query($stmt);
		
		echo wpgmza_get_circles_table($map_id);
	}
	
	if($_POST['action'] == "delete_rectangle") {
		global $wpgmza_tblname_rectangles;
		$stmt = $wpdb->prepare("DELETE FROM $wpgmza_tblname_rectangles WHERE id=%d", array((int) intval($_POST['rectangle_id'])));
		$wpdb->query($stmt);
		
		echo wpgmza_get_rectangles_table($map_id);
	}
    
	exit;
}

/**
 * Enqueue the Google Maps API
 * @return void
 */
function wpgmaps_load_maps_api()
{
    //wp_enqueue_script('google-maps' , 'http://maps.google.com/maps/api/js' , false , '3');
}

/**
 * Handle the WPGMZA shortcode
 * The shortcode attributes are identified and the relevant data is localized and the JS file enqueued
 * @param  array    $atts   array of shortcode attributes
 * @return void
 */
function wpgmaps_tag_basic( $atts ) 
{
	global $wpgmza_current_map_id;
    global $wpgmza_version;
    global $short_code_active;
    global $wpgmza_override;
	global $wpgmza;
	
	$short_code_active = true;

    shortcode_atts( array(
        'id' 		=> '1', 
		'width' 	=> 'inherit',
		'height' 	=> 'inherit'
    ), $atts );

    $ret_msg = "";
	
	if(isset($atts['id']))
		$wpgmza_current_map_id = (int)$atts['id'];
	else
		$wpgmza_current_map_id = 1;

	$map = WPGMZA\Map::createInstance(isset($atts['id']) ? $atts['id'] : 1);
	
    $res = wpgmza_get_map_data($wpgmza_current_map_id);
	
    if (!isset($res)) { echo __("Error: The map ID","wp-google-maps")." (". intval($wpgmza_current_map_id) .") ".__("does not exist","wp-google-maps"); return; }
    
    $user_api_key = get_option( 'wpgmza_google_maps_api_key' );
	
    if (!function_exists('wpgmaps_admin_styles_pro')) {
        $wpgmaps_extra_css = ".wpgmza_map img { max-width:none; } .wpgmza_widget { overflow: auto; }";
        wp_add_inline_style( 'wpgmaps-style', stripslashes( $wpgmaps_extra_css ) );

        $wpgmza_main_settings = get_option("WPGMZA_OTHER_SETTINGS");
        if (isset($wpgmza_main_settings['wpgmza_custom_css']) && $wpgmza_main_settings['wpgmza_custom_css'] != "") { 
            wp_add_inline_style( 'wpgmaps-style', stripslashes( $wpgmza_main_settings['wpgmza_custom_css'] ) );
        }

    }
     if (isset($atts['zoom'])) {
        $zoom_override = (int)$atts['zoom'];
        $wpgmza_override['zoom'] = $zoom_override;
    }    
   
    $map_align = $map->wpgmza_map_align;

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
		$map_attributes .= "data-shortcode-width='" . esc_attr($atts["width"]) . "' ";
	if(isset($atts['height']) && $atts['height'] != 'inherit')
		$map_attributes .= "data-shortcode-height='" . esc_attr($atts["height"]) . "' ";
	
	// Using DOMDocument here to properly format the data-settings attribute
	$document = new WPGMZA\DOMDocument();
	$document->loadHTML('<div id="debug"></div>');
	
	$el = $document->querySelector("#debug");
	
	if(isset($res->other_settings) && is_string($res->other_settings))
	{
		$temp = clone $res;
		$temp->other_settings = unserialize($res->other_settings);
		
		$el->setAttribute('data-settings', json_encode($temp));
	}
	else
		$el->setAttribute('data-settings', json_encode($res));
	
	$html = $document->saveHTML();
	
	if(preg_match('/data-settings=".+"/', $html, $m) || preg_match('/data-settings=\'.+\'/', $html, $m))
	{
		$map_attributes = $m[0];
	}
	else
	{
		// Fallback if for some reason we can't match the attribute string
		$escaped = esc_attr(json_encode($res));
		$attr = str_replace('\\\\%', '%', $escaped);
		$attr = stripslashes($attr);
		$map_attributes = "data-settings='" . $attr . "'";
	}
	
	$map_attributes .= " data-map-id='" . $wpgmza_current_map_id . "'";
	$map_attributes .= " Data-maps-engine='" . $wpgmza->settings->engine . "'";
	
	// Using DOMDocument here to properly format the data-shortcode-attributes attribute
	$document = new WPGMZA\DOMDocument();
	$document->loadHTML('<div id="debug"></div>');
	
	$el = $document->querySelector("#debug");
	$el->setAttribute('data-shortcode-attributes', json_encode($atts));
	
	$html = $document->saveHTML();
	
	if(preg_match('/data-shortcode-attributes=".+"/', $html, $m) || preg_match('/data-shortcode-attributes=\'.+\'/', $html, $m))
	{
		$map_attributes .= ' ' . $m[0];
	}
	else
	{
		// Fallback if for some reason we can't match the attribute string
		$escaped = esc_attr(json_encode($atts));
		$attr = str_replace('\\\\%', '%', $escaped);
		$attr = stripslashes($attr);
		$map_attributes = " data-shortcode-attributes='" . $attr . "'";
	}
	
	if(!empty($atts['classname']))
	{
		$map_attributes .= " class='" . esc_attr($atts['classname']) . "'";
	}

    if (!$map_align || $map_align == "" || $map_align == "1") { $map_align = "float:left;"; }
    else if ($map_align == "2") { $map_align = "margin-left:auto !important; margin-right:auto; !important; align:center;"; }
    else if ($map_align == "3") { $map_align = "float:right;"; }
    else if ($map_align == "4") { $map_align = ""; }
	
    $map_style = "style=\"display:block; overflow:auto; width:".$res->map_width."".$map_width_type."; height:".$res->map_height."".$map_height_type."; $map_align\"";
	
    $map_other_settings = maybe_unserialize($res->other_settings);
    
	// NB: "False" represents above, this should really be changed to something clearer or constants should be used in the very least
	if($map->storeLocator && empty($map->wpgmza_store_locator_position))
		$ret_msg .= $map->storeLocator->html;
    
    /* Developer Hook (Filter) - Legacy hook, allowing for changes to the map div from shortcode */
    $ret_msg .= apply_filters("wpgooglemaps_filter_map_div_output", "<div id=\"wpgmza_map\" class=\"wpgmza_map\" $map_attributes $map_style>",$wpgmza_current_map_id) . "</div>";

	// NB: "True" represents below, this should really be changed to something clearer or constants should be used in the very least
	if($map->storeLocator && !empty($map->wpgmza_store_locator_position))
		$ret_msg .= $map->storeLocator->html;

    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
	
	$core_dependencies = array();
	
	$scriptLoader = new WPGMZA\ScriptLoader($wpgmza->isProVersion());
	$v8Scripts = $scriptLoader->getPluginScripts();
	
	foreach($v8Scripts as $handle => $script)
	{
		$core_dependencies[] = $handle;
	}
	
	$apiLoader = new WPGMZA\GoogleMapsAPILoader();
	
	if($apiLoader->isIncludeAllowed())
	{
		$core_dependencies[] = 'wpgmza_api_call';
		
		if($wpgmza->settings->engine == 'google-maps')
		{
			// TODO: Why is this not handled by the API loader?
			wp_enqueue_script('wpgmza_canvas_layer_options', plugin_dir_url(__FILE__) . 'lib/CanvasLayerOptions.js', array('wpgmza_api_call'));
			wp_enqueue_script('wpgmza_canvas_layer', plugin_dir_url(__FILE__) . 'lib/CanvasLayer.js', array('wpgmza_api_call'));
		}
	}
    
	// TODO: Come up with a proper solution. Gutenberg dependency breaks developer mode
	$gutenbergIndex = array_search('wpgmza-gutenberg', $core_dependencies);
	if($gutenbergIndex !== false)
		array_splice($core_dependencies, $gutenbergIndex, 1);

	if(isset($wpgmza_settings['wpgmza_maps_engine']) && $wpgmza_settings['wpgmza_maps_engine'] == 'open-layers')
	{
		if($index = array_search('wpgmza-google-vertex-context-menu', $core_dependencies))
			array_splice($core_dependencies, $index, 1);
	}
	
    /* Developer Hook (Action) - Enqueue additional frontend scripts */ 
    do_action("wpgooglemaps_hook_user_js_after_core");

    $res = array();
    $res[$wpgmza_current_map_id] = wpgmza_get_map_data($wpgmza_current_map_id);
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    
    /* Developer Hook (Action) - Enqueue additional frontend scripts */ 
    do_action("wpgooglemaps_basic_hook_user_js_after_core");

    /* Developer Hook (Action) - Localize additional frontend script variable  */     
    do_action("wpgooglemaps_hook_user_js_after_localize", $map);

	if(empty($wpgmza->settings->disable_autoptimize_compatibility_fix))
	{
		// Autoptimize fix, bypass CSS where our map is present as large amounts of inline JS (our localized data) crashes their plugin. Added at their advice.
		add_filter('autoptimize_filter_css_noptimize', '__return_true');
	}
    
    return $ret_msg;
}

/**
 * Check if the marker file exists
 * @param  Integer $mapid Map ID
 * @return void
 */
function wpgmza_check_if_marker_file_exists($mapid) {
	
	global $blog_id;
	
    wpgmaps_handle_directory();
    $upload_dir = wp_upload_dir(); 
    
    $xml_marker_location = get_option("wpgmza_xml_location");
	
	$path = wpgmza_return_marker_path();
	$file = $path . (is_multisite() ? "$blog_id-" : "") . "{$mapid}markers.xml";
	
	if(file_exists($file))
		return;
	
	wpgmaps_update_xml_file($mapid);
}

/**
 * Create the HTML output for the store locator
 * @param  Integer  $map_id     Map ID
 * @return string               HTML output for the store locator
 */
function wpgmaps_sl_user_output_basic($map_id)
{
	trigger_error("Deprecated in 8.0.20");
}

/**
 * Return the plugin URL
 * @return string Plugin URL
 */
function wpgmaps_get_plugin_url() {
    return plugin_dir_url( __FILE__ );
}

/**
 * Not called at all 
 * 
 * @deprecated since V7
*/
function wpgmaps_menu_marker_layout() {

    if (!$_GET['action']) {

        wpgmza_marker_page();

    } else {
        echo"<br /><div style='float:right; display:block; width:250px; height:36px; padding:6px; text-align:center; background-color: #EEE; border: 1px solid #E6DB55; margin-right:17px;'><strong>".__("Experiencing problems with the plugin?","wp-google-maps")."</strong><br /><a href='https://docs.wpgmaps.com/troubleshooting' title='WP Go Maps Troubleshooting Section' target='_BLANK'>".__("See the troubleshooting manual.","wp-google-maps")."</a></div>";


        if ($_GET['action'] == "trash" && isset($_GET['marker_id'])) {

            if ($_GET['s'] == "1") {
                if (wpgmaps_trash_marker((int) intval($_GET['marker_id']) )) {
                    wp_add_inline_script('wpgmza', "window.location = \"".get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-marker-menu\"");
                } else {
                    _e("There was a problem deleting the marker.");;
                }
            } else {
                $res = wpgmza_get_marker_data((int) intval($_GET['map_id']) );
                echo "<h2>".__("Delete Marker","wp-google-maps")."</h2><p>".__("Are you sure you want to delete this marker:","wp-google-maps")." <strong>\"".strip_tags($res->address)."?\"</strong> <br /><a href='?page=wp-google-maps-marker-menu&action=trash&marker_id=".(int) intval($_GET['marker_id']) ."&s=1'>".__("Yes","wp-google-maps")."</a> | <a href='?page=wp-google-maps-marker-menu'>".__("No","wp-google-maps")."</a></p>";
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
	
	if(!isset($_GET['use-legacy-html']))
	{
		$document = new \WPGMZA\SettingsPage();
		echo $document->html;
		
		return;
	}
	
    require_once(plugin_dir_path(__FILE__) . 'includes/legacy/settings-page.php');
	wpgmza_legacy_settings_page_basic();

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
                    $rate_text = sprintf( __( '<h3>We need your love!</h3><p>If you are enjoying our plugin, please consider <a href="%1$s" target="_blank" class="button-border button-border__green">reviewing WP Go Maps</a>. It would mean the world to us! If you are experiencing issues with the plugin, please <a href="%2$s" target="_blank"  class="button-border button-border__green">contact us</a> and we will help you as soon as humanly possible!</p>', 'wp-google-maps' ),
                        esc_attr('https://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5'),
                        esc_attr('http://www.wpgmaps.com/contact-us/')
                    );
                    echo "<style>.wpgmza_upgrade_nag { display:none; }</style>";
                    echo "<div class='updated wpgmza_nag_review_div'>".$rate_text."<p><a href='admin.php?page=wp-google-maps-menu&action2=close_review' class='wpgmza_close_review_nag button-border button-border__green' title='".__("We will not nag you again, promise!","wp-google-maps")."'>".__("Close","wp-google-maps")."</a></p></div>";
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

    //google_maps_api_key_warning();    
    
    if (function_exists('wpgmza_register_pro_version')) {
        wpgmza_stats("list_maps_pro");
        echo"<div class=\"wrap\"><h1>".__("My Maps","wp-google-maps")." <a href=\"admin.php?page=wp-google-maps-menu&action=new\" class=\"page-title-action\">".__("Add New","wp-google-maps")."</a>".(function_exists("wpgmaps_wizard_layout") ? " <a href=\"admin.php?page=wp-google-maps-menu&action=wizard\" class=\"page-title-action\">".__("Wizard","wp-google-maps")."</a>" : "")."</h1>";

        $my_theme = wp_get_theme();

        $name = $my_theme->get( 'Name' );
        $version = $my_theme->get( 'Version' );
        $modified_version = str_replace('.', '', $version);

        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");

        // Only check for avada major versions below 4 - 7.1 has a different version structure, causing this error to show for new users
        $modified_major = intval(substr($modified_version, 0, 1));
        if($modified_major <= 3){
            if( $name == 'Avada' && intval( $modified_version ) <= 393 && !isset( $wpgmza_settings['wpgmza_settings_force_jquery'] ) ){

                echo "<div class='error'><p>".printf( /* translators: %s: WP Go Maps Settings Link */ __("We have detected a conflict between your current theme's version and our plugin. Should you be experiencing issues with your maps displaying, please update Avada to version 3.9.4 or go to <a href='%s'>settings page</a> and check the highlighted checkbox.", "wp-google-maps"), admin_url('/admin.php?page=wp-google-maps-menu-settings#wpgmza_settings_force_jquery') )."</p></div>";

            }
        }
        
        wpgmaps_check_versions();
        wpgmaps_list_maps();
    } 
    else {
        wpgmza_stats("list_maps_basic");
        echo"<div class=\"wrap\"><h1>".__("My Maps","wp-google-maps")."</h1>";
        echo"<p class='wpgmza_upgrade_nag'><i><a href='".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=mappage_1")."' target=\"_BLANK\" title='".__("Pro Version","wp-google-maps")."'>".__("Create unlimited maps","wp-google-maps")."</a> ".__("with the","wp-google-maps")." <a href='".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=mappage_2")."' title='Pro Version'  target=\"_BLANK\">".__("Pro Version","wp-google-maps")."</a> ".__("of WP Go Maps for only","wp-google-maps")." <strong>$39.99 ".__("once off!","wp-google-maps")."</strong></i></p>";

        $my_theme = wp_get_theme();

        $name = $my_theme->get( 'Name' );
        $version = $my_theme->get( 'Version' );
        $modified_version = str_replace('.', '', $version);

        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");

        // Only check for avada major versions below 4 - 7.1 has a different version structure, causing this error to show for new users
        $modified_major = intval(substr($modified_version, 0, 1));
        if($modified_major <= 3){
            if( $name == 'Avada' && intval( $modified_version ) <= 393 && !isset( $wpgmza_settings['wpgmza_settings_force_jquery'] ) ){

                echo "<div class='error'><p>".printf( /* translators: %s: WP Go Maps Settings Link */ __("We have detected a conflict between your current theme's version and our plugin. Should you be experiencing issues with your maps displaying, please update Avada to version 3.9.4 or go to <a href='%s'>settings page</a> and check the highlighted checkbox.", "wp-google-maps"), admin_url('/admin.php?page=wp-google-maps-menu-settings#wpgmza_settings_force_jquery') )."</p></div>";
    			

            } 
        }           

        wpgmaps_list_maps();


    }
    echo "</div>";
    echo"<br /><div style='float:right;'><a href='https://docs.wpgmaps.com/troubleshooting'  target='_BLANK' title='WP Go Maps Troubleshooting Section'>".__("Problems with the plugin? See the troubleshooting manual.","wp-google-maps")."</a></div>";
}

/**
 * Deprecated
 * 
 * @deprecated since V7
*/
function wpgmza_marker_page() {
    echo"<div class=\"wrap\"><div id=\"icon-edit\" class=\"icon32 icon32-posts-post\"><br></div><h2>".__("My Markers","wp-google-maps")." <a href=\"admin.php?page=wp-google-maps-marker-menu&action=new\" class=\"add-new-h2\">".__("Add New","wp-google-maps")."</a></h2>";
    wpgmaps_list_markers();
    echo "</div>";
    echo"<br /><div style='float:right;'><a href='https://docs.wpgmaps.com/troubleshooting' title='WP Go Maps Troubleshooting Section'>".__("Problems with the plugin? See the troubleshooting manual.","wp-google-maps")."</a></div>";

}

/**
 * Deprecated
 * 
 * @deprecated since V7
*/
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
        echo "<tr id=\"record_".intval($result->id)."\">";
        echo "<td class='id column-id'>".intval($result->id)."</td>";
        echo "<td class='id column-id'>".esc_html($result->icon)."</td>";
        echo "<td class='id column-id'>".intval($result->map_id)."</td>";
        echo "<td class='id column-id'>".esc_html($result->title)."</td>";
        echo "<td class='id column-id'>".esc_html($result->address)."</td>";
        echo "<td class='id column-id'>".floatval($result->lat).",".floatval($result->lng)."</td>";
        echo "<td class='id column-id'>".esc_html($result->pic)."</td>";
        echo "<td class='id column-id'>".esc_url($result->link)."</td>";
        echo "</tr>";


    }
    echo "</table>";

}



function wpgmaps_check_versions() {
    // Deprecated in 8.1.0
}

function wpgmza_basic_menu() {
    // Deprecated in 8.1.0
}

function wpgmza_edit_marker($mid) {
    global $wpgmza_tblname_maps;

    global $wpdb;
    if ($_GET['action'] == "edit_marker" && isset($mid)) {
        $mid = sanitize_text_field($mid);
        $res = wpgmza_get_marker_data($mid);
        echo "
           <div class='wrap'>
                <h1>WP Go Maps</h1>
                <div class='wide'>

                    <h2>".__("Edit Marker Location","wp-google-maps")." ".__("ID","wp-google-maps")."#$mid</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".intval($res->map_id)."' method='post' id='wpgmaps_edit_marker'>
                    <p></p>

					<input type='hidden' name='wpgmaps_marker-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_marker-nonce' )."' />
                    <input type='hidden' name='wpgmaps_marker_id' id='wpgmaps_marker_id' value='".intval($mid)."' />
                    <div id=\"wpgmaps_status\"></div>
                    <table>

                        <tr>
                            <td>".__("Marker Latitude","wp-google-maps").":</td>
                            <td><input id='wpgmaps_marker_lat' name='wpgmaps_marker_lat' type='text' size='15' maxlength='100' value='".floatval($res->lat)."' /></td>
                        </tr>
                        <tr>
                            <td>".__("Marker Longitude","wp-google-maps").":</td>
                            <td><input id='wpgmaps_marker_lng' name='wpgmaps_marker_lng' type='text' size='15' maxlength='100' value='".floatval($res->lng)."' /></td>
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

function wpgmaps_admin_scripts()
{
    trigger_error("Deprecated since 8.1.0");
}

function wpgmaps_admin_styles()
{
	trigger_error("Deprecated since 8.1.0");
}

function wpgmaps_user_scripts()
{
	trigger_error("Deprecated since 8.1.0");
}

function wpgmaps_chmodr($path, $filemode)
{
    // Removed in 6.0.25. is_dir caused fatal errors on some hosts
	trigger_error("Deprecated since 6.0.25");
}

/* 
 * Deprecated since 9.0.0
 *
 * Now managed by Shortcodes class
*/
/*
if (function_exists('wpgmza_register_pro_version')){
    if (isset($wpgmza_pro_version) && function_exists('wpgmza_register_gold_version') && version_compare($wpgmza_pro_version, '7.10.29', '<=')) {
		// Deprecated with Pro >= 7.10.30, where legacy-map-edit-page.js is used instead
		add_action('admin_head', 'wpgmaps_admin_javascript_gold');
	}

    add_shortcode( 'wpgmza', 'wpgmaps_tag_pro' );
} else {
    add_shortcode( 'wpgmza', 'wpgmaps_tag_basic' );
}
*/

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
    echo "\"".""."\" ";
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
        update_option("wpgmza_temp_api",'AIzaSyDo_fG7DXBOVvdhlrLa-PHREuFDpTklWhY');
		
		// NB: Moved to WPGMZA\Database
        //wpgmaps_handle_db();
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

	require_once(wpgmza_basic_get_admin_path() . 'includes/upgrade.php');
	
    $table_name = $wpdb->prefix . "wpgmza";

    

    $sql = "
        CREATE TABLE `".$wpgmza_tblname_category_maps."` (
          id int(11) NOT NULL AUTO_INCREMENT,
          cat_id INT(11) NOT NULL,
          map_id INT(11) NOT NULL,
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
    ";

    dbDelta($sql);

    $table_name = $wpdb->prefix . "wpgmza_maps";
    

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
    
	// NB: Moved to WPGMZA\Database
    // add_option("wpgmza_db_version", $wpgmza_version);
    // update_option("wpgmza_db_version",$wpgmza_version);
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
    trigger_error('Deprecated since 8.1.0');
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

function wpgmaps_filter(&$array)
{
	trigger_error("Deprecated since 8.0.20");
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

/**
 * This fuction remain in place, however, does execute any code
 * 
 * It should be noted this code has technically been disabled for an extensive amount of time, the setting that controls this function was removed pre V8
 * 
 * @deprecated since 8.1.18
*/
function wpgmaps_load_jquery() {}

function wpgmza_get_category_data($cat_id) {
	global $wpgmza;
    global $wpgmza_tblname_categories;
    global $wpdb;
	
	if(!preg_match_all('/\d+/', $cat_id, $m))
		return null;
	
	$ids = array_map('intval', $m[0]);
	
	if(method_exists($wpgmza, 'getProVersion') && version_compare($wpgmza->getProVersion(), '7.0.0', '>='))
	{
		$result = $wpdb->get_row("
			SELECT * FROM $wpgmza_tblname_categories
			WHERE id IN (" . implode(',', $ids) . ")
			AND active = 0
			ORDER BY priority DESC
			LIMIT 1
		");
	}
	else
	{
		$result = $wpdb->get_row("
			SELECT * FROM $wpgmza_tblname_categories
			WHERE id = " . $ids[0] . "
			AND active = 0
			LIMIT 1
		");
	}
	
	return $result;
}
function wpgmza_get_category_icon($cat_id) {
	
	global $wpgmza;
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
    echo "<div id=\"message\" class=\"error\"><p><strong>".strip_tags($data->get_error_message())."</strong><blockquote>".strip_tags($data->get_error_data())."</blockquote></p></div>";
    
}

function wpgmza_write_to_error_log($data) {
    error_log(date("Y-m-d H:i:s"). ": WP Go Maps : " . $data->get_error_message() . "->" . $data->get_error_data());
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
        $fpe_error = __("WP Go Maps does not have write permission to the marker location directory. This is required to store marker data. Please CHMOD the folder ","wp-google-maps").$marker_location.__(" to 755 or 777, or change the directory in the Maps->Settings page. (Current file permissions are ","wp-google-maps").$wpgmza_file_perms.")";
    }
    
    if (!$fpe) {
	echo "<div id=\"message\" class=\"error\"><p>".$fpe_error."</p></div>";
    } 
}

function wpgmza_basic_support_menu()
{
    trigger_error("Deprecated since 8.1.0");
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
        $video = "<a href='https://www.youtube.com/watch?v=nADMsw2xjyI' target='_BLANK'>".__('View the instruction video', 'wp-google-maps')."</a>";
        $documentation = "<a href='https://docs.wpgmaps.com/creating-a-google-maps-api-key' target='_BLANK'>".__('Read the documentation', 'wp-google-maps')."</a>";
        echo "<div class='error wpgmza-error-message'><h1>".__('Important Notification', 'wp-google-maps')."</h1>";
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
		
        echo sprintf( __('Need help? %s or %s.', 'wp-google-maps'), esc_url($video), esc_url($documentation) )."</p>";
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
            return esc_attr("http://affiliatetracker.io/?aff=".$id."&affuri=".base64_encode($link));    
        } else {
            return esc_attr($link);
        }
        
    } else {
        return esc_attr($link);
    }
}

/**
 * Migrates text lat/lng columns into spatial latlng column if necessary
 * @return void
 */
if(!function_exists('wpgmza_migrate_spatial_data'))
{
	function wpgmza_migrate_spatial_data()
	{
		trigger_error('Deprecated since 8.1.0');
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

if(!function_exists('wpgmza_enqueue_fontawesome'))
{
	/**
	 * Enqueues fontawesome
	 * DEPRECATED :- This functionality has been handed off to the ScriptLoader class
	 */
	function wpgmza_enqueue_fontawesome()
	{
		
	}
}

add_action('plugins_loaded', function() {
	
	if(!empty($_GET['wpgmza-build']))
	{
		$scriptLoader = new WPGMZA\ScriptLoader(false);
		$scriptLoader->build();
		
		// Update readme
		$contents = file_get_contents(plugin_dir_path(__FILE__) . "wpGoogleMaps.php");
		if(preg_match_all('#/\*.+?\*/#sm', $contents, $comments))
		{
			$changelog = $comments[0][1];
			
			$changelog = preg_replace("/^ \*/m", "*", $changelog);
			$changelog = preg_replace("/^\/\*.+\r?\n/", "", $changelog);
			$changelog = preg_replace("/^\*\//m", "", $changelog);
			$changelog = preg_replace("/^\* (\d+\.\d+\.\d+[^\r\n]+)/m", "= $1 =", $changelog);
			$changelog = preg_replace("/^\*( *)(\r?\n)/m", "$2", $changelog);
			
			$readme = file_get_contents(plugin_dir_path(__FILE__) . 'readme.txt');
			
			$readme = preg_replace('/== Changelog ==.+For more, please view the WP Go Maps site/sm', "== Changelog ==\r\n\r\n$changelog\r\n\r\nFor more, please view the WP Go Maps site\r\n", $readme);
			
			file_put_contents(plugin_dir_path(__FILE__) . 'readme.txt', $readme);
		}
	
		if(class_exists('WPGMZA\\ProPlugin'))
		{
			$scriptLoader = new WPGMZA\ScriptLoader(true);
			$scriptLoader->build();
		}
		
		echo "Build successful";
		
		exit;
	}
	
});

function wpgmaps_danger_zone_nonce() {
    $nonce = wp_create_nonce('wpgmza_maps_settings_danger_zone_delete_data');
    $t = "<script>";
    $t .= "var wpgmza_dz_nonce = '".$nonce."';";
    $t .= "</script>";
    return $t;
}

function wpgmaps_check_if_no_api_key() {
	global $wpgmza;
	
	if($wpgmza->settings->engine != 'google-maps' || empty($wpgmza->settings->engine))
		return;
	

    $g_api_key = get_option('wpgmza_google_maps_api_key');
    if( !$g_api_key || $g_api_key == '' ){
        $nonce = wp_create_nonce('wpgmza_maps_engine_dialog_set_engine');
    	$t = "<script>";
    	$t .= "var swap_nonce = '".$nonce."';";
    	$t .= "jQuery(function($) {\n";
    	$t .= "$('#wpgm-swap-to-open-layers').on('click', function(event) {\n";
    	$t .= "		$.ajax(WPGMZA.ajaxurl, {\n";
    	$t .= "			method: 'POST',\n";
    	$t .= "			data: {\n";
    	$t .= "				action: 'wpgmza_maps_engine_dialog_set_engine',\n";
    	$t .= "				engine: 'open-layers',\n";
    	$t .= "				nonce: swap_nonce\n";
    	$t .= "			},\n";
    	$t .= "			success: function(response, status, xhr) {\n";
    	$t .= "				window.location.reload();\n";
    	$t .= "			}\n";
    	$t .= "		});\n";
    	$t .= "	});\n";
    		$t .= "	});\n";
    	$t .= "</script>";
    
        return $t;
    }
}
