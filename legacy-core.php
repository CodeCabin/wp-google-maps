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

wpgmza_require_once(plugin_dir_path(__FILE__) . 'constants.php');

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

	if(!function_exists('get_rest_url'))
	{
		add_action('admin_notices', 'wpgmza_show_rest_api_missing_error');
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
if(preg_match('/Version:\s*(.+)/', $subject, $m))
	$wpgmza_version = trim($m[1]);

register_activation_hook( $wpgmzaMainPluginFile, 'wpgmaps_activate' );
register_deactivation_hook( $wpgmzaMainPluginFile, 'wpgmaps_deactivate' );

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

wpgmza_require_once(plugin_dir_path(WPGMZA_FILE) . 'includes/legacy/functions.circle.php');
wpgmza_require_once(plugin_dir_path(WPGMZA_FILE) . 'includes/legacy/functions.rectangle.php');

if (function_exists('wpgmaps_head_pro' )) {
    add_action( 'admin_head', 'wpgmaps_head_pro' );
} else {
	
    if (function_exists( 'wpgmaps_pro_activate' ) && floatval($wpgmza_version) < 5.24) {
        add_action( 'admin_notices', function() {
			
			?>
			<div class="notice notice-error">
				<p>
					<?php
					_e('<strong>WP Google Maps:</strong> The Pro add-on is not compatible with this version of WP Google Maps. Please update your Pro addon to 5.24 or above', 'wp-google-maps');
					?>
				</p>
			</div>
			<?php
			
		});
    } else {
        add_action( 'admin_head', 'wpgmaps_head' );
    }
    
}

function wpgmaps_head_old()
{
	trigger_error('Deprecated since 8.0.20');
}

add_action( 'admin_init', 'wpgmaps_init' );
add_action( 'admin_menu', 'wpgmaps_admin_menu' );
add_filter( 'widget_text', 'do_shortcode' );


/**
 * Activate function that creates the first map and sets the default settings
 * @return void
 */
function wpgmaps_activate() {
	
	global $wpgmza;
    global $wpdb;
    global $wpgmza_version;
	
	$wpgmza = new WPGMZA\Plugin();
	$wpgmza->database->install();
	
    $table_name = $wpdb->prefix . "wpgmza";
    $table_name_maps = $wpdb->prefix . "wpgmza_maps";
	
	$wpgmza_data = get_option("WPGMZA");
	
	// TODO: Set defaults here, use a hook in the settings object
	$other_settings = get_option('WPGMZA_OTHER_SETTINGS');
	
	if(empty($other_settings))
		$other_settings = array(
			'wpgmza_settings_map_streetview' => 'yes',
			'wpgmza_settings_map_zoom' => 'yes',
			'wpgmza_settings_map_pan' => 'yes',
			'wpgmza_settings_map_type' => 'yes'
		);
	
	update_option('WPGMZA_OTHER_SETTINGS', $other_settings);

    update_option("wpgmza_temp_api",'AIzaSyDjyYKnTqGG2CAF9nmrfB6zgTBE6oPhMk4');

	// set defaults for the Marker XML Dir and Marker XML URL
    if (get_option("wpgmza_xml_location") == "") {
        $upload_dir = wp_upload_dir();
        add_option("wpgmza_xml_location",'{uploads_dir}/wp-google-maps/');
    }
    if (get_option("wpgmza_xml_url") == "") {
        $upload_dir = wp_upload_dir();
        add_option("wpgmza_xml_url",'{uploads_url}/wp-google-maps/');
    }
    
	// NB: Moved to WPGMZA\Database
    //wpgmaps_handle_db();
    
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
			"alignment" => "4",
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
    
    if(!preg_match('/wpGoogleMaps\.php$/', $plugin))
		return;
	
	if(get_option( "WPGM_V6_FIRST_TIME"))
		return;
	
	 $current_screen = get_current_screen();

	if ( $current_screen && $current_screen->id == "appearance_page_install-required-plugins" )
		return;
	
	update_option( "WPGM_V6_FIRST_TIME", true );
	// clean the output header and redirect the user
	@ob_flush();
	@ob_end_flush();
	@ob_end_clean();
	
	exit( wp_redirect( admin_url( 'admin.php?page=wp-google-maps-menu&action=welcome_page' ) ) );
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
    
    if (get_option("wpgmza_xml_location") == "") {
        $upload_dir = wp_upload_dir();
        add_option("wpgmza_xml_location",'{uploads_dir}/wp-google-maps/');
    }
    
    if (get_option("wpgmza_xml_url") == "") {
        $upload_dir = wp_upload_dir();
        add_option("wpgmza_xml_url",'{uploads_url}/wp-google-maps/');
    }
    
	// NB: New settings module
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
	
	if(!$wpgmza_settings)
		$wpgmza_settings = array();
	
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

		// NB: Moved to WPGMZA\Database
        // wpgmaps_handle_db();
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

	wp_enqueue_script('wpgmza-legacy-edit-marker-location-page', plugin_dir_url(__FILE__) . 'js/legacy/legacy-edit-marker-location-page.js');
	wp_localize_script('wpgmza-legacy-edit-marker-location-page', 'wpgmza_legacy', array(
	
		'lat'		=> $wpgmza_lat,
		'lng'		=> $wpgmza_lng,
		'type'		=> $wpgmza_map_type,
		'map_id'	=> $res->map_id
	
	));
}

/**
 * Outputs the JavaScript for the map editor
 * @return void
 */
function wpgmaps_admin_javascript_basic()
{	
	global $wpgmza;
	global $wpdb;
	global $wpgmza_version;
	global $wpgmza_tblname_maps;
	
    if (!is_admin() || !$wpgmza->isUserAllowedToEdit())
		return;
	
	if(!empty($_POST['wpgmaps_marker-nonce']) && !wp_verify_nonce($_POST['wpgmaps_marker-nonce'], 'wpgmza'))
	{
		http_response_code(403);
		exit;
	}
	
	$ajax_nonce = wp_create_nonce("wpgmza");
	
	if( isset( $_POST['wpgmza_save_google_api_key_list'] ) ){  
		if( $_POST['wpgmza_google_maps_api_key'] !== '' ){      
			update_option('wpgmza_google_maps_api_key', sanitize_text_field(trim($_POST['wpgmza_google_maps_api_key'])));
			echo "<div class='updated'><p>";
			$settings_page = "<a href='".admin_url('/admin.php?page=wp-google-maps-menu-settings#tabs-4')."'>".__('settings', 'wp-google-maps')."</a>";
			echo sprintf( __('Your Google Maps API key has been successfully saved. This API key can be changed in the %s page', 'wp-google-maps'), $settings_page );
			echo "<script> window.location.href=window.location.href; return false </script>";
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
		
		if(!empty($_POST))
			$wpgmza_check = wpgmaps_update_xml_file(sanitize_text_field($_GET['map_id']));
		
		$wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");

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
		
		$wpgmza_current_map_id = (int)$_GET['map_id'];

		global $wpgmza;
		$wpgmza->loadScripts();
		
		wp_enqueue_script('wpgmaps_admin_core', plugins_url('/js/wpgmaps-admin-core.js',__FILE__), $wpgaps_core_dependancy, $wpgmza_version.'b' , false);
		do_action("wpgooglemaps_hook_user_js_after_core");
		
		wp_localize_script('wpgmaps_admin_core', 'wpgmza_circle_data_array', wpgmza_get_circle_data(1));
		wp_localize_script('wpgmaps_admin_core', 'wpgmza_rectangle_data_array', wpgmza_get_rectangle_data(1));
		
		$res = array();
		$res[$wpgmza_current_map_id] = wpgmza_get_map_data($wpgmza_current_map_id);
		
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
	
	$map_id = (isset($_POST['map_id']) ? (int)$_POST['map_id'] : null);

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
		$cur_id = (int)$_POST['edit_id'];
		
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
			(int)$_POST['anim'],
			(int)$_POST['infoopen'],
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
		$stmt = $wpdb->prepare("DELETE FROM $wpgmza_tblname_circles WHERE id=%d", array((int)$_POST['circle_id']));
		$wpdb->query($stmt);
		
		echo wpgmza_get_circles_table($map_id);
	}
	
	if($_POST['action'] == "delete_rectangle") {
		global $wpgmza_tblname_rectangles;
		$stmt = $wpdb->prepare("DELETE FROM $wpgmza_tblname_rectangles WHERE id=%d", array((int)$_POST['rectangle_id']));
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

    $res = wpgmza_get_map_data($wpgmza_current_map_id);
	
    if (!isset($res)) { echo __("Error: The map ID","wp-google-maps")." (".$wpgmza_current_map_id.") ".__("does not exist","wp-google-maps"); return; }
    
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
    
	$map = \WPGMZA\Map::createInstance($wpgmza_current_map_id);
	
	if($map->storeLocator)
		$ret_msg .= $map->storeLocator->html;
    
    $ret_msg .= apply_filters("wpgooglemaps_filter_map_div_output", "<div id=\"wpgmza_map\" $map_attributes $map_style>",$wpgmza_current_map_id) . "</div>";

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
	
    wp_enqueue_script('wpgmaps_core', plugins_url('/js/wpgmaps.js',__FILE__), $core_dependencies, $wpgmza_version.'b' , false);
	
	$wpgmza->loadScripts();
	
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

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_mapid', array('wpgmza_legacy_current_map_id' => $wpgmza_current_map_id));
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
 * Handle POST for settings page
 * @return void
 */
add_action('admin_post_wpgmza_settings_page_post', 'wpgmza_settings_page_post');

function wpgmza_settings_page_post()
{
	global $wpdb;
	global $wpgmza;
	
	if(!wp_verify_nonce($_POST['wpgmza_settings_page_post_nonce'], 'wpgmza_settings_page_post'))
	{
		http_response_code(403);
		exit;
	}
	
	if(!$wpgmza->isUserAllowedToEdit())
	{
		http_response_code(401);
		exit;
	}
	
	if($wpgmza)
		$wpgmza->gdprCompliance->onPOST();
	
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
		"wpgmza_gdpr_require_consent_before_vgm_submit",
		"disable_autoptimize_compatibility_fix",
		"disable_compressed_path_variables"
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
		{
			$wpgmza->settings[$remap] = sanitize_text_field( $_POST[$name] );
		}
		else if(isset($wpgmza->settings[$remap]))
		{
			unset($wpgmza->settings[$remap]);
		}
	}
	
	if(isset($_POST['tile_server_url']))
		$wpgmza->settings['tile_server_url'] = sanitize_text_field($_POST['tile_server_url']);
	
	if(isset($_POST['wpgmza_load_engine_api_condition']))
		$wpgmza->settings['wpgmza_load_engine_api_condition'] = sanitize_text_field($_POST['wpgmza_load_engine_api_condition']);
	
	if(isset($_POST['wpgmza_always_include_engine_api_on_pages']))
		$wpgmza->settings['wpgmza_always_include_engine_api_on_pages'] = sanitize_text_field($_POST['wpgmza_always_include_engine_api_on_pages']);
	
	if(isset($_POST['wpgmza_always_exclude_engine_api_on_pages']))
		$wpgmza->settings['wpgmza_always_exclude_engine_api_on_pages'] = sanitize_text_field($_POST['wpgmza_always_exclude_engine_api_on_pages']);
	
	if(isset($_POST['wpgmza_use_fontawesome']))
		$wpgmza->settings['use_fontawesome'] = sanitize_text_field($_POST['wpgmza_use_fontawesome']);
	
	if(isset($_POST['wpgmza_maps_engine']))
		$wpgmza->settings['wpgmza_maps_engine'] = sanitize_text_field($_POST['wpgmza_maps_engine']);
	
	
	if (isset($_POST['wpgmza_settings_map_open_marker_by'])) { $wpgmza->settings['wpgmza_settings_map_open_marker_by'] = sanitize_text_field($_POST['wpgmza_settings_map_open_marker_by']); }

	if (isset($_POST['wpgmza_api_version'])) { $wpgmza->settings['wpgmza_api_version'] = sanitize_text_field($_POST['wpgmza_api_version']); }
	if (isset($_POST['wpgmza_custom_css'])) { $wpgmza->settings['wpgmza_custom_css'] = sanitize_text_field($_POST['wpgmza_custom_css']); }
	if (isset($_POST['wpgmza_custom_js'])) { $wpgmza->settings['wpgmza_custom_js'] = $_POST['wpgmza_custom_js']; }
	
    if (isset($_POST['user_interface_style']))
		$wpgmza->settings['user_interface_style'] = esc_attr($_POST['user_interface_style']);
	
	if (isset($_POST['wpgmza_marker_xml_location'])) { update_option("wpgmza_xml_location",sanitize_text_field($_POST['wpgmza_marker_xml_location'])); }
	if (isset($_POST['wpgmza_marker_xml_url'])) { update_option("wpgmza_xml_url",sanitize_text_field($_POST['wpgmza_marker_xml_url'])); }
	
	if(current_user_can('administrator'))
		if (isset($_POST['wpgmza_access_level'])) { $wpgmza->settings['wpgmza_settings_access_level'] = sanitize_text_field($_POST['wpgmza_access_level']); }
	
	if (isset($_POST['wpgmza_settings_marker_pull'])) { $wpgmza->settings['wpgmza_settings_marker_pull'] = sanitize_text_field($_POST['wpgmza_settings_marker_pull']); }

	// Maps -> Settings -> Store Locator -> option Store Locator Radius
	if (isset($_POST['wpgmza_store_locator_radii'])) { $wpgmza->settings['wpgmza_store_locator_radii'] = sanitize_text_field($_POST['wpgmza_store_locator_radii']); }

	if (isset($_POST['wpgmza_settings_enable_usage_tracking'])) { $wpgmza->settings['wpgmza_settings_enable_usage_tracking'] = sanitize_text_field($_POST['wpgmza_settings_enable_usage_tracking']); }
	
	$arr = apply_filters("wpgooglemaps_filter_save_settings", $wpgmza->settings);
	
	$wpgmza->settings->set($arr);
	
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

	if (!$wpgmza->isUserAllowedToEdit())
		return false;
	
    if ((isset($_GET['page']) && $_GET['page'] == "wp-google-maps-menu") || (isset($_GET['page']) && $_GET['page'] == "wp-google-maps-menu-settings")) {
        wpgmaps_folder_check();
    }
    
    
    if (isset($_POST['wpgmza_savemap'])){

    	if ( !isset( $_POST['wpgmaps_main-nonce'] ) || !wp_verify_nonce( $_POST['wpgmaps_main-nonce'], 'wpgmaps_main-nonce' ) ) {
    		wp_die( __( 'You do not have permission to perform this function', 'wp-google-maps' ) );
    	}

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
        $wpgmza_auto_night_enabled = isset($_POST['wpgmza_auto_night']);


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
            $other_settings['store_locator_default_radius'] =  intval($_POST['wpgmza_store_locator_default_radius']);
        
	    if (isset($_POST['wpgmza_store_locator_not_found_message'])) { $other_settings['store_locator_not_found_message'] = sanitize_text_field( $_POST['wpgmza_store_locator_not_found_message'] ); }
        $other_settings['store_locator_bounce'] = isset($_POST['wpgmza_store_locator_bounce']) ? 1 : 2;

        $other_settings['store_locator_query_string'] = sanitize_text_field($_POST['wpgmza_store_locator_query_string']);
        if (isset($_POST['wpgmza_store_locator_default_address'])) { $other_settings['store_locator_default_address'] = sanitize_text_field($_POST['wpgmza_store_locator_default_address']); }
        if (isset($_POST['wpgmza_store_locator_restrict'])) { $other_settings['wpgmza_store_locator_restrict'] = sanitize_text_field($_POST['wpgmza_store_locator_restrict']); }
		
		if(isset($_POST['store_locator_style']))
			$other_settings['store_locator_style'] = sanitize_text_field($_POST['store_locator_style']);
		
		if(isset($_POST['wpgmza_store_locator_radius_style']))
			$other_settings['wpgmza_store_locator_radius_style'] = sanitize_text_field($_POST['wpgmza_store_locator_radius_style']);

        $other_settings['map_max_zoom'] = sanitize_text_field($map_max_zoom);

        $other_settings['transport_layer'] = isset($_POST['wpgmza_transport']) ? 1 : 2;
        



        if (isset($_POST['wpgmza_theme'])) { 
            $theme = intval(sanitize_text_field($_POST['wpgmza_theme']));
            $theme_data = sanitize_text_field($_POST['wpgmza_theme_data_'.$theme]);
            $other_settings['wpgmza_theme_data'] = $theme_data;
            $other_settings['wpgmza_theme_selection'] = $theme;
        }

		if(isset($_POST['wpgmza_theme_data']))
			$other_settings['wpgmza_theme_data'] = sanitize_text_field(stripslashes($_POST['wpgmza_theme_data']));

		$other_settings['wpgmza_show_points_of_interest'] = (isset($_POST['wpgmza_show_points_of_interest']) ? 1 : 0);

		$other_settings['wpgmza_auto_night'] = $wpgmza_auto_night_enabled ? 1 : 0;

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
    	if ( !isset( $_POST['wpgmaps_marker-nonce'] ) || !wp_verify_nonce( $_POST['wpgmaps_marker-nonce'], 'wpgmaps_marker-nonce' ) ) {
    		wp_die( __( 'You do not have permission to perform this function', 'wp-google-maps' ) );
    	}

		$marker 			= \WPGMZA\Marker::createInstance($_POST['wpgmaps_marker_id']);
		$latlng				= new \WPGMZA\LatLng($_POST['wpgmaps_marker_lat'], $_POST['wpgmaps_marker_lng']);
		
		if(preg_match(\WPGMZA\LatLng::REGEXP, $marker->address))
		{
			$currentAddressPosition = new \WPGMZA\LatLng($marker->address);
			$distance				= \WPGMZA\Distance::between($currentAddressPosition, $marker->getPosition());
			$meters					= $distance / 1000;
			
			if($meters < 1)
			{
				// The marker has an address which looks like coordinates, and they're very close to the markers latitude and longitude
				// Therefore, it would seem that the user has placed this with coordinates and is now looking to move those coordinates here
				// Because of this, we'll update the address with the new coordinates
				$marker->address	= (string)$latlng;
			}
		}
		
		$lat				= $_POST['wpgmaps_marker_lat'];
		$lng				= $_POST['wpgmaps_marker_lng'];
		
		$marker->lat		= $lat;
		$marker->lng		= $lng;
		
		echo "<div class='updated'>";
        _e("Your marker location has been saved.","wp-google-maps");
        echo "</div>";
		
    }
    else if (isset($_POST['wpgmza_save_poly'])){
    	if ( !isset( $_POST['wpgmaps_polygon-nonce'] ) || !wp_verify_nonce( $_POST['wpgmaps_polygon-nonce'], 'wpgmaps_polygon-nonce' ) ) {
    		wp_die( __( 'You do not have permission to perform this function', 'wp-google-maps' ) );
    	}
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
    	if ( !isset( $_POST['wpgmaps_polygon-nonce'] ) || !wp_verify_nonce( $_POST['wpgmaps_polygon-nonce'], 'wpgmaps_polygon-nonce' ) ) {
    		wp_die( __( 'You do not have permission to perform this function', 'wp-google-maps' ) );
    	}

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

    	if ( !isset( $_POST['wpgmaps_polyline-nonce'] ) || !wp_verify_nonce( $_POST['wpgmaps_polyline-nonce'], 'wpgmaps_polyline-nonce' ) ) {
    		wp_die( __( 'You do not have permission to perform this function', 'wp-google-maps' ) );
    	}

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

    	if ( !isset( $_POST['wpgmaps_polyline-nonce'] ) || !wp_verify_nonce( $_POST['wpgmaps_polyline-nonce'], 'wpgmaps_polyline-nonce' ) ) {
    		wp_die( __( 'You do not have permission to perform this function', 'wp-google-maps' ) );
    	}


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

    	if ( !isset( $_POST['wpgmaps_circle-nonce'] ) || !wp_verify_nonce( $_POST['wpgmaps_circle-nonce'], 'wpgmaps_circle-nonce' ) ) {
    		wp_die( __( 'You do not have permission to perform this function', 'wp-google-maps' ) );
    	}

        global $wpdb;
        global $wpgmza_tblname_circles;
        
		$center = preg_replace('/[(),]/', '', sanitize_text_field($_POST['center']));
		
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
				sanitize_text_field($_POST['circle_name']),
				sanitize_hex_color($_POST['circle_color']),
				floatval($_POST['circle_opacity']),
				intval($_POST['circle_radius']),
				intval($_POST['circle_id'])
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
				intval($_POST['wpgmaps_map_id']),
				sanitize_text_field($_POST['circle_name']),
				sanitize_hex_color($_POST['circle_color']),
				floatval($_POST['circle_opacity']),
				intval($_POST['circle_radius'])
			));
		}
		
		$wpdb->query($stmt);
		
    }
	else if (isset($_POST['wpgmza_save_rectangle'])){

    	if ( !isset( $_POST['wpgmaps_rectangle-nonce'] ) || !wp_verify_nonce( $_POST['wpgmaps_rectangle-nonce'], 'wpgmaps_rectangle-nonce' ) ) {
    		wp_die( __( 'You do not have permission to perform this function', 'wp-google-maps' ) );
    	}

        global $wpdb;
        global $wpgmza_tblname_rectangles;
        
		$m = null;
		preg_match_all('/-?\d+(\.\d+)?/', sanitize_text_field($_POST['bounds']), $m);
		
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
				sanitize_text_field($_POST['rectangle_name']),
				sanitize_hex_color($_POST['rectangle_color']),
				floatval($_POST['rectangle_opacity']),
				$cornerA,
				$cornerB,
				intval($_POST['rectangle_id'])
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
				intval($_POST['wpgmaps_map_id']),
				sanitize_text_field($_POST['rectangle_name']),
				sanitize_hex_color($_POST['rectangle_color']),
				floatval($_POST['rectangle_opacity']),
				$cornerA,
				$cornerB
			));
		}
		
		$rows = $wpdb->query($stmt);
    }
}

function wpgmaps_admin_menu() {
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    
    if (isset($wpgmza_settings['wpgmza_settings_access_level'])) { $access_level = $wpgmza_settings['wpgmza_settings_access_level']; } else { $access_level = "manage_options"; }
	
    add_menu_page('WPGoogle Maps', __('Maps','wp-google-maps'), $access_level, 'wp-google-maps-menu', 'wpgmaps_menu_layout', wpgmaps_get_plugin_url()."images/menu-icon.png");
    
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

	// add_submenu_page('wp-google-maps-menu', 'WP Google Maps - Credits', __('Credits', 'wp-google-maps'), $access_level, 'wp-google-maps-menu-credits', 'wpgmaps_menu_layout');
	
}


function wpgmaps_menu_layout() {
    
    $map_id = isset($_GET['map_id']) ? (int)$_GET['map_id'] : null;
    $nonce = wp_create_nonce('wpgmza_menu_layout_nonce');
	
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
            echo"<div class='wpgmza-support-notice' style='float:right; display:block; width:250px; height:65px; padding:6px; text-align:center; background-color: white;  border-top: 4px solid #0073AA; margin-right:17px;'><strong>".__("Experiencing problems with the plugin?","wp-google-maps")."</strong><br /><a href='http://www.wpgmaps.com/documentation/troubleshooting/' title='WP Google Maps Troubleshooting Section' target='_BLANK'>".__("See the troubleshooting manual.","wp-google-maps")."</a> <br />".__("Or ask a question on our ","wp-google-maps")." <a href='http://www.wpgmaps.com/forums/forum/support-forum/' title='WP Google Maps Support Forum' target='_BLANK'>".__("Support forum.","wp-google-maps")."</a></div>
            <div class='wpgmza-clear'></div>";
        }
		
        if ($_GET['action'] == "trash" && $map_id) {
            if (isset( $_GET['s'] ) && $_GET['s'] == "1") {
				
				if(!wp_verify_nonce($_GET['nonce'], 'wpgmza_menu_layout_nonce'))
				{
					http_response_code(401);
					exit;
				}
				
                wpgmaps_trash_map($map_id);
				
				$url = get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu";
				
				echo "<script>window.location = \"$url\";</script>";
				
				return;
				
            } else {
                $res = wpgmza_get_map_data($map_id);
                echo "<h2>".__("Delete your map","wp-google-maps")."</h2><p>".__("Are you sure you want to delete the map","wp-google-maps")." <strong>\"".$res->map_title."?\"</strong> <br /><a href='?page=wp-google-maps-menu&s=1&action=trash&map_id=".$map_id."&s=1&nonce=$nonce'>".__("Yes","wp-google-maps")."</a> | <a href='?page=wp-google-maps-menu'>".__("No","wp-google-maps")."</a></p>";
                return;
            }
        }
		
        if (isset($_GET['action']) && $_GET['action'] == "duplicate" && $map_id) {
            if (function_exists('wpgmaps_duplicate_map')) {
				
				if(!wp_verify_nonce($_GET['nonce'], 'wpgmza_list_maps_pro_nonce'))
				{
					http_response_code(403);
					exit;
				}
				
                $new_id = wpgmaps_duplicate_map($map_id);
				
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
        elseif ($_GET['action'] == "add_poly" && $map_id) {

            if (function_exists("wpgmza_b_real_pro_add_poly")) {
                wpgmza_b_real_pro_add_poly($map_id);
            } else {
                wpgmza_b_pro_add_poly($map_id);
            }

        }
        else if ($_GET['action'] == "edit_poly" && $map_id) {

            if (function_exists("wpgmza_b_real_pro_edit_poly")) {
                wpgmza_b_real_pro_edit_poly($map_id);
            } else {
                wpgmza_b_pro_edit_poly($map_id);
            }
            

        }
        else if ($_GET['action'] == "add_polyline" && $map_id) {

            wpgmza_b_pro_add_polyline($map_id);

        }
        else if ($_GET['action'] == "edit_polyline" && $map_id) {

            wpgmza_b_pro_edit_polyline($map_id);
        }
        else if ($_GET['action'] == "add_heatmap" && $map_id) {
            if (function_exists("wpgmza_b_pro_add_heatmap")) { wpgmza_b_pro_add_heatmap($map_id); }
        }
        else if ($_GET['action'] == "edit_heatmap" && $map_id) {
            if (function_exists("wpgmza_b_pro_edit_heatmap")) { wpgmza_b_pro_edit_heatmap($map_id); }
        }
		else if ($_GET['action'] == "add_circle" && $map_id) {
			wpgmza_b_add_circle($map_id);
        }
		else if ($_GET['action'] == "edit_circle" && $map_id) {
            wpgmza_b_edit_circle($map_id);
        }
		else if ($_GET['action'] == "add_rectangle" && $map_id) {
            wpgmza_b_add_rectangle($map_id);
        }
		else if ($_GET['action'] == "edit_rectangle" && $map_id) {
            wpgmza_b_edit_rectangle($map_id);
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
                wpgmza_pro_menu();
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
                if (wpgmaps_trash_marker((int)$_GET['marker_id'])) {
                    wp_add_inline_script('wpgmza', "window.location = \"".get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-marker-menu\"");
                } else {
                    _e("There was a problem deleting the marker.");;
                }
            } else {
                $res = wpgmza_get_marker_data((int)$_GET['map_id']);
                echo "<h2>".__("Delete Marker","wp-google-maps")."</h2><p>".__("Are you sure you want to delete this marker:","wp-google-maps")." <strong>\"".$res->address."?\"</strong> <br /><a href='?page=wp-google-maps-marker-menu&action=trash&marker_id=".(int)$_GET['marker_id']."&s=1'>".__("Yes","wp-google-maps")."</a> | <a href='?page=wp-google-maps-marker-menu'>".__("No","wp-google-maps")."</a></p>";
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
	
	if(!$wpgmza->settings->useLegacyHTML || isset($_GET['no-legacy-html']))
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
                    $rate_text = sprintf( __( '<h3>We need your love!</h3><p>If you are enjoying our plugin, please consider <a href="%1$s" target="_blank" class="button-border button-border__green">reviewing WP Google Maps</a>. It would mean the world to us! If you are experiencing issues with the plugin, please <a href="%2$s" target="_blank"  class="button-border button-border__green">contact us</a> and we will help you as soon as humanly possible!</p>', 'wp-google-maps' ),
                        'https://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5',
                        'http://www.wpgmaps.com/contact-us/'
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

        if( $name == 'Avada' && intval( $modified_version ) <= 393 && !isset( $wpgmza_settings['wpgmza_settings_force_jquery'] ) ){

            echo "<div class='error'><p>".printf( /* translators: %s: WP Google Maps Settings Link */ __("We have detected a conflict between your current theme's version and our plugin. Should you be experiencing issues with your maps displaying, please update Avada to version 3.9.4 or go to <a href='%s'>settings page</a> and check the highlighted checkbox.", "wp-google-maps"), admin_url('/admin.php?page=wp-google-maps-menu-settings#wpgmza_settings_force_jquery') )."</p></div>";

        }
        
        wpgmaps_check_versions();
        wpgmaps_list_maps();
    } 
    else {
        wpgmza_stats("list_maps_basic");
        echo"<div class=\"wrap\"><h1>".__("My Maps","wp-google-maps")."</h1>";
        echo"<p class='wpgmza_upgrade_nag'><i><a href='".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=mappage_1")."' target=\"_BLANK\" title='".__("Pro Version","wp-google-maps")."'>".__("Create unlimited maps","wp-google-maps")."</a> ".__("with the","wp-google-maps")." <a href='".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=mappage_2")."' title='Pro Version'  target=\"_BLANK\">".__("Pro Version","wp-google-maps")."</a> ".__("of WP Google Maps for only","wp-google-maps")." <strong>$39.99 ".__("once off!","wp-google-maps")."</strong></i></p>";

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

      <table class=\"wp-list-table widefat wpgmza-listing\" cellspacing=\"0\">
	<thead>
	<tr>
		<th scope='col' id='id' class='manage-column column-id sortable desc'   style='width:50px;'><span>".__("ID","wp-google-maps")."</span></th>
        <th scope='col' id='map_title' class='manage-column column-map_title sortable desc'><span>".__("Title","wp-google-maps")."</span></th>
        <th scope='col' id='map_width' class='manage-column column-map_width' style=\"\">".__("Width","wp-google-maps")."</th>
        <th scope='col' id='map_height' class='manage-column column-map_height'  style=\"\">".__("Height","wp-google-maps")."</th>
        <th scope='col' id='type' class='manage-column column-type sortable desc'  style=\"\"><span>".__("Type","wp-google-maps")."</span></th>
        <th scope='col' id='type' class='manage-column column-type sortable desc'  style=\"\"><span>".__("Action","wp-google-maps")."</span></th>
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
            $trashlink = "<a class='page-title-action' href=\"?page=wp-google-maps-menu&action=trash&map_id=".$result->id."\" title=\"Trash\">".__("Trash","wp-google-maps")."</a>";
        } else {
            $trashlink = "";
        }
        echo "<tr id=\"record_".$result->id."\">";
        echo "<td class='id column-id'>".$result->id."</td>";
        echo "<td class='map_title column-map_title'><strong><big><a href=\"?page=wp-google-maps-menu&action=edit&map_id=".$result->id."\" title=\"".__("Edit","wp-google-maps")."\">".stripslashes($result->map_title)."</a></big></strong><br /></td>";
        echo "<td class='map_width column-map_width'>".$result->map_width."".stripslashes($result->map_width_type)."</td>";
        echo "<td class='map_width column-map_height'>".$result->map_height."".stripslashes($result->map_height_type)."</td>";
        echo "<td class='type column-type'>".$map_type."</td>";
        echo "<td class='type column-type'><a class='page-title-action' href=\"?page=wp-google-maps-menu&action=edit&map_id=".$result->id."\" title=\"".__("Edit","wp-google-maps")."\">".__("Edit","wp-google-maps")."</a> $trashlink</td>";
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
    
    
}

function wpgmza_basic_menu() {
    
    
    global $wpgmza_tblname_maps;
    global $wpdb;
    
	$map_id = isset($_GET['map_id']) ? (int)$_GET['map_id'] : null;
	
    if ($_GET['action'] == "edit" && $map_id) {
        $res = wpgmza_get_map_data($map_id);
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
        
        $wpgmza_auto_night_enabled_checked = isset($other_settings_data['wpgmza_auto_night']) && $other_settings_data['wpgmza_auto_night'] == 1 ? 'checked' : '';

        $wpgmza_transport_layer_checked[0] = '';
        $wpgmza_transport_layer_checked[1] = '';

        if ($wpgmza_transport_option == 1) {
            $wpgmza_transport_layer_checked[0] = 'checked';
        } else {
            $wpgmza_transport_layer_checked[1] = 'checked';
        }

        $wpgmza_act = "disabled readonly";
        $wpgmza_act_msg = "<div class=\"update-nag update-att\" style=\"padding:5px; \">".__("Add custom icons, titles, descriptions, pictures and links to your markers with the","wp-google-maps")." \"<a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=below_marker")."\" title=\"".__("Pro Edition","wp-google-maps")."\" target=\"_BLANK\">".__("Pro Edition","wp-google-maps")."</a>\" ".__("of this plugin for just","wp-google-maps")." <strong>$39.99</strong></div>";
        $wpgmza_csv = "<p><a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=csv_link")."\" target=\"_BLANK\" title=\"".__("Pro Edition","wp-google-maps")."\">".__("Purchase the Pro Edition","wp-google-maps")."</a> ".__("of WP Google Maps and save your markers to a CSV file!","wp-google-maps")."</p>";
    }

    if ($_GET['action'] == 'create-map-page' && $map_id) {
    	$res = wpgmza_get_map_data($map_id);
    	

        // Set the post ID to -1. This sets to no action at moment
        $post_id = -1;
     
        // Set the Author, Slug, title and content of the new post
        $author_id = get_current_user_id();
        if ($author_id) {
	        $slug = 'map';
	        $title = $res->map_title;
	        $content = '[wpgmza id="'.$res->id.'"]';
	        

	        // do we have this slug?
	        $args_posts = array(
			    'post_type'      => 'page',
			    'post_status'    => 'any',
			    'name'           => $slug,
			    'posts_per_page' => 1,
			);
			$loop_posts = new WP_Query( $args_posts );
			if ( ! $loop_posts->have_posts() ) {
			    
			    // we dont
			    $post_id = wp_insert_post(
	                array(
	                    'comment_status'    =>   'closed',
	                    'ping_status'       =>   'closed',
	                    'post_author'       =>   $author_id,
	                    'post_name'         =>   $slug,
	                    'post_title'        =>   $title,
	                    'post_content'      =>  $content,
	                    'post_status'       =>   'publish',
	                    'post_type'         =>   'page'
	                )
	            );
	            echo '<script>window.location.href = "post.php?post='.$post_id.'&action=edit";</script>';
	            return;
			} else {
			    $loop_posts->the_post();
			    
			    // we do!
			    $post_id = wp_insert_post(
	                array(
	                    'comment_status'    =>   'closed',
	                    'ping_status'       =>   'closed',
	                    'post_author'       =>   $author_id,
	                    'post_name'         =>   $slug."-".$res->id,
	                    'post_title'        =>   $title,
	                    'post_content'      =>  $content,
	                    'post_status'       =>   'publish',
	                    'post_type'         =>   'page'
	                )
	            );
	            
	            echo '<script>window.location.href = "post.php?post='.$post_id.'&action=edit";</script>';
	            return;
			}
		} else {
			echo "There was a problem creating the map page.";
			return;
		}
            
        return;
    }
    
    if (isset($other_settings_data['wpgmza_theme_selection'])) { $theme_sel_checked[$other_settings_data['wpgmza_theme_selection']] = "checked"; $wpgmza_theme_class[$other_settings_data['wpgmza_theme_selection']] = "wpgmza_theme_selection_activate"; } else {  $wpgmza_theme = false; $wpgmza_theme_class[0] = "wpgmza_theme_selection_activate"; }
    for ($i=0;$i<10;$i++) {
        if (!isset($wpgmza_theme_class[$i])) { $wpgmza_theme_class[$i] = ""; }
    }
    for ($i=0;$i<10;$i++) {
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
	
	// Admin marker table
	$ajaxParameters = array(
		'map_id' => (int)$map_id
	);
	
	$adminMarkerTable = WPGMZA\AdminMarkerDataTable::createInstance($ajaxParameters);
	$adminMarkerTableHTML = $adminMarkerTable->html();
	
	$map = \WPGMZA\Map::createInstance($_GET['map_id']);
	$themePanel = new WPGMZA\ThemePanel($map);
	
	$birthday	= new DateTime("2013-01-20");
	$today		= new DateTime();
	
	$interval	= $today->diff($birthday);
	$yearsInDevelopment = $interval->format("%y");
	
	//google_maps_api_key_warning();
    echo "
			$open_layers_feature_unavailable
			$open_layers_feature_coming_soon
			$maps_engine_dialog_html
			
           <div class='wrap'>
                <div class='wide'>

                    <h2>".__("Create your Map","wp-google-maps")."</h2>
					
                    <form action='' method='post' id='wpgmaps_options'>
                    
                    <div id=\"wpgmaps_tabs\">
                        <ul>
                            <li><a href=\"#tabs-1\">".__("General Settings","wp-google-maps")."</a></li>
                            <li class='wpgmza-map-edit__themes-tab'><a href=\"#tabs-7\">".__("Themes","wp-google-maps")."</a></li>
                            <li><a href=\"#tabs-2\">".__("Directions","wp-google-maps")."</a></li>
                            <li><a href=\"#tabs-3\">".__("Store Locator","wp-google-maps")."</a></li>
                            <li><a href=\"#tabs-4\">".__("Advanced Settings","wp-google-maps")."</a></li>
                            <li><a href=\"#tabs-5\">".__("Marker Listing Options","wp-google-maps")."</a></li>
                            <li style=\"font-weight: bold;\" class='wpgmza-upgrade-tab'><a href=\"#tabs-6\">".__("Pro Upgrade","wp-google-maps")."</a></li>
                        </ul>
                        <div id=\"tabs-1\">
                            <p></p>
                            <input type='hidden' name='http_referer' value='" . htmlspecialchars($_SERVER['PHP_SELF'], ENT_QUOTES, 'UTF-8') . "' />
                            
                            <input type='hidden' name='wpgmaps_main-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_main-nonce' )."' />

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
                                    <td><input type='text' readonly name='shortcode' class='wpgmza_copy_shortcode' style='font-size:18px; text-align:center;' onclick=\"this.select()\" value='[wpgmza id=\"".$res->id."\"]' /> <small class='wpgmza-info__small wpgmza-info-right'><i>".__("copy this into your post or page to display the map","wp-google-maps").". ".__(sprintf("Or <a href='%s' target='BLANK'>click here to automatically create a Map Page now</a>.","admin.php?page=wp-google-maps-menu&action=create-map-page&map_id=".$res->id),"wp-google-maps")."</i></td>
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
                                     <small class='wpgmza-info__small'><em>".__("Set to 100% for a responsive map","wp-google-maps")."</em></small>

                                    </td>
                                </tr>
                                <tr>
                                    <td>".__("Height","wp-google-maps").":</td>
                                    <td><input id='wpgmza_height' name='wpgmza_height' type='text' size='4' maxlength='4' value='".esc_attr($res->map_height)."' />
                                     <select id='wpgmza_map_height_type' name='wpgmza_map_height_type'>
                                        <option value=\"px\" $wpgmza_map_height_type_px>px</option>
                                        <option value=\"%\" $wpgmza_map_height_type_percentage>%</option>
                                     </select><span style='display:none; width:200px; font-size:10px;' id='wpgmza_height_warning'>".__("We recommend that you leave your height in PX. Depending on your theme, using % for the height may break your map.","wp-google-maps")."</span>

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
									
									<span class='notice notice-warning wpgmza-theme-and-roadmap-warning'>" . __('Themes can only be used with the Roadmap and Terrain map types.', 'wp-google-maps') . "</span>
                                    </td>
                                </tr>

                                </table>
                        </div>
                        <div id=\"tabs-7\" class='make-left wpgmza-open-layers-feature-unavailable'>
							" . $themePanel->html . "
						</div>

                        <div id=\"tabs-2\" class=''>
							
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
								
								" . ($wpgmza->settings->user_interface_style == 'legacy' ? "
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
								" : "
								<tr>
									<td>
										" . __("Store Locator Style", "wp-google-maps") . "
									</td>
									<td>
										" . 
										sprintf(
											__("Looking for styling settings? Try our new <a href='%s' target='_blank'>User Interface Style</a> setting.", "wp-google-maps")
										, admin_url('admin.php?page=wp-google-maps-menu-settings')
										)
										. "
									</td>
								</tr>
								") . "
								
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
                                <!--<tr>
                                    <td>".__("Fusion table ID","wp-google-maps").":</td>
                                    <td class='wpgmza-open-layers-feature-unavailable'>
                                     <input type='text' size='20' maxlength='200' class='small-text' readonly disabled /> <em><small>".__("Read data directly from your Fusion Table.","wp-google-maps")."</small></em></td>
                                    </td>
                                </tr>-->
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
                        <div id='wpgmza-pro-upgrade-tab'>
                            <h1 style=\"font-weight:200;\">12 Amazing Reasons to Upgrade to our Pro Version</h1>
                            <p style=\"font-size:16px; line-height:28px;\">" .
								sprintf(
									__("We've spent over %d years upgrading our plugin to ensure that it is the most user-friendly and comprehensive map plugin in the WordPress directory. Enjoy the peace of mind knowing that you are getting a truly premium product for all your mapping requirements. Did we also mention that we have fantastic support?", "wp-google-maps"),
									$yearsInDevelopment
								)
							. "</p>
                            <div id=\"wpgm_premium\">
                            	<div class='wpgmza-flex'>
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>
													" . __("Create custom markers with detailed info windows", "wp-google-maps") . "</h2>
		                                        <p>" . __("Add titles, descriptions, HTML, images, animations and custom icons to your markers.", "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>Enable directions</h2>
		                                        <p>" . __("Allow your visitors to get directions to your markers. Either use their location as the starting point or allow them to type in an address.", "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>Unlimited maps</h2>
		                                        <p>" . __('Create as many maps as you like.', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>List your markers</h2>
		                                        <p>" . __('Choose between three methods of listing your markers.', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>                                
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>" . __('Add categories to your markers', "wp-google-maps") . "</h2>
		                                        <p>" . __('Create and assign categories to your markers which can then be filtered on your map.', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>                                
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>" . __('Advanced options', "wp-google-maps") . "</h2>
		                                        <p>" . __('Enable advanced options such as showing your visitor\'s location, marker sorting, bicycle layers, traffic layers and more!', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>  
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>" . __('Import / Export', "wp-google-maps") . "</h2>
		                                        <p>" . __('Export your markers to a CSV file for quick and easy editing. Import large quantities of markers at once.', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>                                
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>" . __('Add KML & Fusion Tables', "wp-google-maps") . "</h2>
		                                        <p>" . __('Add your own KML layers or Fusion Table data to your map', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>                                   
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>" . __('Polygons and Polylines', "wp-google-maps") . "</h2>
		                                        <p>" . __('Add custom polygons and polylines to your map by simply clicking on the map. Perfect for displaying routes and serviced areas.', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>" . __('Amazing Support', "wp-google-maps") . "</h2>
		                                        <p>" . __('We pride ourselves on providing quick and amazing support. <a target="_BLANK" href="http://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5">Read what some of our users think of our support</a>.', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>
	                                <div class=\"wpgm_premium_row\">
	                                	<div class=\"wpgmza-card\">
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>" . __('Easy Upgrade', "wp-google-maps") . "</h2>
		                                        <p>" . __('You\'ll receive a download link immediately. Simply upload and activate the Pro plugin to your WordPress admin area and you\'re done!', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>                                  
	                                <div class=\"wpgm_premium_row\">
	                                	<div class='wpgmza-card'>
		                                    <div class=\"wpgm_icon\"></div>
		                                    <div class=\"wpgm_details\">
		                                        <h2>" . __('Free updates and support forever', "wp-google-maps") . "</h2>
		                                        <p>" . __('Once you\'re a pro user, you\'ll receive free updates and support forever! You\'ll also receive amazing specials on any future plugins we release.', "wp-google-maps") . "</p>
		                                    </div>
		                                </div>
	                                </div>
	                            </div> 
	                                
                                <br /><p>Get all of this and more for only $39.99 once off</p>                                
                                <br /><a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=upgradenow")."\" target=\"_BLANK\" title=\"" . __('Upgrade now for only $39.99 once off', "wp-google-maps") . "\" class=\"button-primary\" style=\"font-size:20px; display:block; width:220px; text-align:center; height:42px; line-height:41px;\" id='wpgmza-upgrade-now__btn'>
									" . __('Upgrade Now', "wp-google-maps") . "
								</a>
                                <br /><br />
                                <a href=\"".wpgm_pro_link("https://www.wpgmaps.com/demo/")."\" target=\"_BLANK\">View the demos</a>.<br /><br />
                                " . __('Have a sales question? Contact Nick on <a href=\"mailto:nick@wpgmaps.com\">nick@wpgmaps.com</a> or use our <a href=\"http://www.wpgmaps.com/contact-us/\" target=\"_BLANK\">contact form</a>.', "wp-google-maps") . " <br /><br />
                                " . __('Need help? <a href=\"https://www.wpgmaps.com/forums/\" target=\"_BLANK\">Ask a question on our support forum</a>.', "wp-google-maps") . "
                            </div>

                        </div><!-- end of tab5 -->   
                        
                        </div>
                        </div>
                    
                    <!-- end of tabs -->

							<p class='submit'><input type='submit' name='wpgmza_savemap' class='button-primary' value='".__("Save Map","wp-google-maps")." &raquo;' /></p>


                                
                            <p style=\"width:100%; color:#808080;\" class='wpgmza-map-edit__mouse-tip'>
                                ".__("Tip: Use your mouse to change the layout of your map. When you have positioned the map to your desired location, press \"Save Map\" to keep your settings.","wp-google-maps")."</p>


                            <div id='wpgmza-map-theme-editor__holder'></div>

                            <div id='wpgmza-marker-tabs__wrap' style='display:block; width:100%;'>
                            
                            <div style='display:block; width:49%; margin-right:1%; float:left;'>
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
                                        <div id='wpgmza-marker-edit-panel'>
                                            <input type=\"hidden\" name=\"wpgmza_edit_id\" id=\"wpgmza_edit_id\" value=\"\" />
                                            <div>
                                                <div valign='top'>".__("Address/GPS","wp-google-maps").": </div>
                                                <div><input id='wpgmza_add_address' name='wpgmza_add_address' type='text' size='35' maxlength='200' value=''  /><small class='wpgmza-info__small'><em>".__("Or right click on the map","wp-google-maps")."</small></em></div>
												
												<input name='lat' type='hidden'/>
												<input name='lng' type='hidden'/>
                                            </div>

                                            <div>
                                                <div>".__("Animation","wp-google-maps").": </div>
                                                <div>
                                                    <select name=\"wpgmza_animation\" id=\"wpgmza_animation\">
                                                        <option value=\"0\">".__("None","wp-google-maps")."</option>
                                                        <option value=\"1\">".__("Bounce","wp-google-maps")."</option>
                                                        <option value=\"2\">".__("Drop","wp-google-maps")."</option>
                                                    </select>
                                                </div>
                                            </div>


                                            <div>
                                                <div>".__("InfoWindow open by default","wp-google-maps").": </div>
                                                <div>
                                                    <select name=\"wpgmza_infoopen\" id=\"wpgmza_infoopen\">
                                                        <option value=\"0\">".__("No","wp-google-maps")."</option>
                                                        <option value=\"1\">".__("Yes","wp-google-maps")."</option>
                                                    </select>
                                                </div>
                                            </div>
                                        <div>
                                            <div>
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
                                            </div>

                                        </div>

                                        </div>
                                    </div>

                                    <div id=\"tabs-m-2\">
                                        <h2 style=\"padding-top:0; margin-top:0;\">".__("Advanced markers","wp-google-maps")."</h2>
                                        <div class=\"update-nag update-att\">
                                                    <i class=\"fa fa-arrow-circle-right\"> </i> <a target=\"_BLANK\" href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=advanced_markers")."\">".__("Add advanced markers","wp-google-maps")."</a> ".__("with the Pro version","wp-google-maps")."
                                        </div><br>
                                        <table>
                                        <tr>
                                            <td>".__("Address/GPS","wp-google-maps").": </td>
                                            <td><input id='' name='' type='text' size='35' maxlength='200' value=''  $wpgmza_act placeholder='".__("Address/GPS","wp-google-maps")."'/> &nbsp;<br /></td>

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
                                            <td><input id='' name='' type='text' size='35' maxlength='200' value='' $wpgmza_act placeholder='".__("Address/GPS","wp-google-maps")."' /></td>

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
                                        <span id=\"wpgmza_addpolygon_div\"><a href='".get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-menu&action=add_poly&map_id=".$map_id."' id='wpgmza_addpoly' class='button-primary wpgmza-button__top-right' value='".__("Add a New Polygon","wp-google-maps")."' />".__("Add a New Polygon","wp-google-maps")."</a></span>
                                        <div id=\"wpgmza_poly_holder\">".wpgmza_b_return_polygon_list($map_id)."</div>
                                    </div>
                                    <div id=\"tabs-m-4\" class='wpgmza-open-layers-feature-coming-soon'>
                                        <h2 style=\"padding-top:0; margin-top:0;\"> ".__("Polylines","wp-google-maps")."</h2>
                                        <span id=\"wpgmza_addpolyline_div\"><a href='".get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-menu&action=add_polyline&map_id=".$map_id."' id='wpgmza_addpolyline' class='button-primary wpgmza-button__top-right' value='".__("Add a New Polyline","wp-google-maps")."' />".__("Add a New Polyline","wp-google-maps")."</a></span>
                                        <div id=\"wpgmza_polyline_holder\">".wpgmza_b_return_polyline_list($map_id)."</div>
                                    </div>
									
									<div id=\"tabs-circles\" class='wpgmza-open-layers-feature-coming-soon'>
										<h2 class='wpgmza-marker-tab__title'>
											" . __('Add a Circle', 'wp-google-maps') . "
										</h2>
										<span><a class=\"button-primary wpgmza-button__top-right\" href=\"" . get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu&action=add_circle&map_id=" . $map_id . "\">" . __("Add a Circle", "wp-google-maps") . "</a></span>
										" . wpgmza_get_circles_table($map_id) . "
									</div>
									
									<div id=\"tabs-rectangles\" class='wpgmza-open-layers-feature-coming-soon'>
										<h2 class='wpgmza-marker-tab__title'>
											" . __('Add a Rectangle', 'wp-google-maps') . "
										</h2>
										<span><a class=\"button-primary wpgmza-button__top-right\" href=\"" . get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu&action=add_rectangle&map_id=" . $map_id . "\">" . __("Add a Rectangle", "wp-google-maps") . "</a></span>
										" . wpgmza_get_rectangles_table($map_id) . "
									</div>
									
                                    <div id=\"tabs-m-5\" class='wpgmza-open-layers-feature-coming-soon'>
                                        <h2 style=\"padding-top:0; margin-top:0;\"> ".__("Heatmaps","wp-google-maps")."</h2>
                                        <a target=\"_BLANK\" href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=heatmaps")."\">".__("Add dynamic heatmap data","wp-google-maps")."</a> ".__("with the Pro version.","wp-google-maps")."
                                        <a target=\"_BLANK\" href=\"https://www.wpgmaps.com/demo/heatmaps-demo/?utm_source=plugin&utm_medium=link&utm_campaign=heatmap_demo\">".__("View a demo.","wp-google-maps")."</a>
                                    </div>
                                </div>
                            </div>
                            <div style='display:block; width:50%; overflow:auto; float:left;'>
                            
								".wpgmaps_check_if_no_api_key()."
                                <div id=\"wpgmza_map\" style='min-height:400px;'>
                                    <div class=\"update-nag\" style='text-align:center;'>
                                        <small><strong>".__("The map could not load.","wp-google-maps")."</strong><br />".__("This is normally caused by a conflict with another plugin or a JavaScript error that is preventing our plugin's Javascript from executing. Please try disable all plugins one by one and see if this problem persists.","wp-google-maps")."</small>
                                           
                                    </div>
                                </div>
                                <div id=\"wpgmaps_save_reminder\" style=\"display:none;\">
                                    <div class=\"wpgmza-nag wpgmza-update-nag\" style='text-align:center;'>                                        
                                        <h4>".__("Remember to save your map!","wp-google-maps")."</h4>                                        
                                    </div>
                                </div>
                                <div id='wpgmaps_marker_cache_reminder' style='display: none;'>                                
                                    ".wpgmza_caching_notice_changes(true, true)."
                                </div>
                            </div>
                        </div>
                            


                            
                        </form>
                            <div id='wpgmza-map-edit__markers'>
							<h2 style=\"padding-top:0; margin-top:20px;\">".__("Your Markers","wp-google-maps")."</h2>
							<div id=\"wpgmza_marker_holder\">
							" . $adminMarkerTableHTML . "
							</div>
							</div>
							
                            <div style='clear:both;' id='wpgmza-pro-features'>
                                <div class='wpgmza-pro-features__item'>
                                    <div class='wpgmza-card'>
                                    	<div><img src=\"".wpgmaps_get_plugin_url()."images/custom_markers.jpg\" width=\"260\" class='wpgmza-promo' title=\"".__("Add detailed information to your markers!")."\" alt=\"".__("Add custom markers to your map!","wp-google-maps")."\" /><br /><br /></div>
                                    	<div valign=\"middle\"><span style=\"font-size:18px; color:#666;\" class='wpgmza-feature-item__desc'>".__("Add detailed information to your markers for only","wp-google-maps")." <strong>$39.99</strong>. ".__("Click","wp-google-maps")." <a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=image1")."\" title=\"Pro Edition\" target=\"_BLANK\">".__("here","wp-google-maps")."</a></span></div>
                                    </div>
                                </div>
                                <div class='wpgmza-pro-features__item'>
                                	<div class='wpgmza-card'>
	                                    <div><img src=\"".wpgmaps_get_plugin_url()."images/custom_marker_icons.jpg\" width=\"260\" class='wpgmza-promo' title=\"".__("Add custom markers to your map!","wp-google-maps")."\" alt=\"".__("Add custom markers to your map!","wp-google-maps")."\" /><br /><br /></div>
	                                    <div valign=\"middle\"><span style=\"font-size:18px; color:#666;\" class='wpgmza-feature-item__desc'>".__("Add different marker icons, or your own icons to make your map really stand out!","wp-google-maps")." ".__("Click","wp-google-maps")." <a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=image3")."\" title=\"".__("Pro Edition","wp-google-maps")."\" target=\"_BLANK\">".__("here","wp-google-maps")."</a></span></div>
	                                    </div>
                                </div>
                                <div class='wpgmza-pro-features__item'>
                                	<div class='wpgmza-card'>
	                                    <div><img src=\"".wpgmaps_get_plugin_url()."images/get_directions.jpg\" width=\"260\" class='wpgmza-promo' title=\"".__("Add custom markers to your map!","wp-google-maps")."\" alt=\"".__("Add custom markers to your map!","wp-google-maps")."\" /><br /><br /></div>
	                                    <div valign=\"middle\"><span style=\"font-size:18px; color:#666;\" class='wpgmza-feature-item__desc'>".__("Allow your visitors to get directions to your markers!","wp-google-maps")." ".__("Click","wp-google-maps")." <a href=\"".wpgm_pro_link("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=image2")."\" title=\"".__("Pro Edition","wp-google-maps")."\" target=\"_BLANK\">".__("here","wp-google-maps")."</a></span></div>
	                                    </div>
                                </div>

                            </div>

                   <p id='wpgmza-basic-footer-text'>
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

					<input type='hidden' name='wpgmaps_marker-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_marker-nonce' )."' />
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

        if(strpos($_GET['page'], "wp-google-maps") !== false){
            wp_register_style('wpgmaps-admin-style-basic', plugins_url('css/wp-google-maps-admin.css', __FILE__));
            wp_enqueue_style('wpgmaps-admin-style-basic');
        }

    }

}

function wpgmaps_admin_styles() {
	global $wpgmza_version;
	
	wp_enqueue_style('thickbox');

}

if (isset($_GET['page'])) {

	$wpgmza_pages = array(
		'wp-google-maps-menu',
		'wp-google-maps-menu-settings',
		'wp-google-maps-menu-support',
		'wp-google-maps-menu-advanced',
		'wp-google-maps-menu-custom-fields',
		'wp-google-maps-menu-categories'
	);

    if (in_array($_GET['page'], $wpgmza_pages)) {
        add_action('admin_enqueue_scripts', 'wpgmaps_admin_scripts');
        add_action('admin_enqueue_scripts', 'wpgmaps_admin_styles', 999);
    }
}

// add_action('wp_print_styles', 'wpgmaps_user_styles');

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
				wpgmza_require_once(plugin_dir_path(WPGMZA_PRO_FILE) . 'includes/custom-fields/class.custom-marker-fields.php');
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
			$wpgmza_tmp_body .= "<td width='170' align='center'><div class='wpgmza-flex'>";
			$wpgmza_tmp_body .= "    <a title=\"".__("Edit this marker","wp-google-maps")."\" class=\"wpgmza_edit_btn button\" id=\"".$result->id."\"><i class=\"fa fa-edit\"> </i> </a> ";
			$wpgmza_tmp_body .= "    <a href=\"?page=wp-google-maps-menu&action=edit_marker&id=".$result->id."\" title=\"".__("Edit this marker location","wp-google-maps")."\" class=\"wpgmza_edit_btn button\" id=\"".$result->id."\"><i class=\"fa fa-map-marker\"> </i></a> ";
			if ($show_approval_button) {
				$wpgmza_tmp_body .= "    <a href=\"javascript:void(0);\" title=\"".__("Approve this marker","wp-google-maps")."\" class=\"wpgmza_approve_btn button\" id=\"".$result->id."\"><i class=\"fa fa-check\"> </i> </a> ";
			}
			$wpgmza_tmp_body .= "    <a href=\"javascript:void(0);\" title=\"".__("Delete this marker","wp-google-maps")."\" class=\"wpgmza_del_btn button\" id=\"".$result->id."\"><i class=\"fa fa-times\"> </i></a>";
			$wpgmza_tmp_body .= "</div></td>";
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
		<div class="wpgmza-marker-listing__actions">
			&#x21b3;
			<button class="wpgmza button select_all_markers" type="button">Select All</button>
			<button class="wpgmza button bulk_delete" type="button">Bulk Delete</button>
		</div>
	';
	
	if(!$admin)
		$wpgmza_tmp_footer .= '</div>';
	
	return $wpgmza_tmp_head.$wpgmza_tmp_body.$wpgmza_tmp_footer;
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
	add_action('wp_ajax_delete_marker', 'wpgmaps_action_callback_pro');	// NB: Legacy support
    add_action('wp_ajax_delete_poly', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_polyline', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_dataset', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_circle', 'wpgmaps_action_callback_pro');
    add_action('wp_ajax_delete_rectangle', 'wpgmaps_action_callback_pro');
    add_action('template_redirect','wpgmaps_check_shortcode');

    if (isset($wpgmza_pro_version) && function_exists('wpgmza_register_gold_version') && version_compare($wpgmza_pro_version, '7.10.29', '<=')) {
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
	
	// NB: Deprecated function, it's reportedly very performance intensive
	return;
	
    global $posts;
    global $short_code_active;
    // $short_code_active = false;
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
        update_option("wpgmza_temp_api",'AIzaSyDjyYKnTqGG2CAF9nmrfB6zgTBE6oPhMk4');
		
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
    global $wpgmza_pro_version;
    
    echo "";
}
function wpgmaps_trash_map($map_id) {
    global $wpdb;
    global $wpgmza_tblname_maps;
    if (isset($map_id)) {
		$wpdb->query(
			$wpdb->prepare('DELETE FROM wp_wpgmza WHERE map_id=%d', (int)$map_id)
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
	<div class="wrap">
	    <h1><?php _e("WP Google Maps Support","wp-google-maps"); ?></h1>
	    <div id="wpgmza-support__row" class="wpgmza_row">
	        <div class='wpgmza_row_col wpgmza-support__col'>
	        	<div class="wpgmza-card">
	                <h2><i class="fa fa-book"></i> <?php _e("Documentation","wp-google-maps"); ?></h2>
	                <p><?php _e("Getting started? Read through some of these articles to help you along your way.","wp-google-maps"); ?></p>
	                <p><strong><?php _e("Documentation:","wp-google-maps"); ?></strong></p>
	                <ul>
	                    <li><a href='https://www.wpgmaps.com/documentation/creating-your-first-map/' target='_BLANK' title='<?php _e("Creating your first map","wp-google-maps"); ?>'><?php _e("Creating your first map","wp-google-maps"); ?></a></li>
	                    <li><a href='https://www.wpgmaps.com/documentation/using-your-map-in-a-widget/' target='_BLANK' title='<?php _e("Using your map as a Widget","wp-google-maps"); ?>'><?php _e("Using your map as a Widget","wp-google-maps"); ?></a></li>
	                    <li><a href='https://www.wpgmaps.com/documentation/changing-the-google-maps-language/' target='_BLANK' title='<?php _e("Changing the Google Maps language","wp-google-maps"); ?>'><?php _e("Changing the Google Maps language","wp-google-maps"); ?></a></li>
	                    <li><a href='https://www.wpgmaps.com/documentation/' target='_BLANK' title='<?php _e("WP Google Maps Documentation","wp-google-maps"); ?>'><?php _e("View all documentation.","wp-google-maps"); ?></a></li>
	                </ul>
	            </div>
	        </div>
	        <div class='wpgmza_row_col wpgmza-support__col'>
	        	<div class="wpgmza-card">
	                <h2><i class="fa fa-exclamation-circle"></i> <?php _e("Troubleshooting","wp-google-maps"); ?></h2>
	                <p><?php _e("WP Google Maps has a diverse and wide range of features which may, from time to time, run into conflicts with the thousands of themes and other plugins on the market.","wp-google-maps"); ?></p>
	                <p><strong><?php _e("Common issues:","wp-google-maps"); ?></strong></p>
	                <ul>
	                    <li><a href='https://www.wpgmaps.com/documentation/troubleshooting/my-map-is-not-showing-on-my-website/' target='_BLANK' title='<?php _e("My map is not showing on my website","wp-google-maps"); ?>'><?php _e("My map is not showing on my website","wp-google-maps"); ?></a></li>
	                    <li><a href='https://www.wpgmaps.com/documentation/troubleshooting/my-markers-are-not-showing-on-my-map/' target='_BLANK' title='<?php _e("My markers are not showing on my map in the front-end","wp-google-maps"); ?>'><?php _e("My markers are not showing on my map in the front-end","wp-google-maps"); ?></a></li>
	                    <li><a href='https://www.wpgmaps.com/documentation/troubleshooting/im-getting-jquery-errors-showing-on-my-website/' target='_BLANK' title='<?php _e("I'm getting jQuery errors showing on my website","wp-google-maps"); ?>'><?php _e("I'm getting jQuery errors showing on my website","wp-google-maps"); ?></a></li>
	                </ul>
	            </div>
	        </div>
	        <div class='wpgmza_row_col wpgmza-support__col'>
	        	<div class="wpgmza-card">
	                <h2><i class="fa fa-bullhorn "></i> <?php _e("Support","wp-google-maps"); ?></h2>
	                <p><?php _e("Still need help? Use one of these links below.","wp-google-maps"); ?></p>
	                <ul>
	                    <li><a href='https://www.wpgmaps.com/forums/' target='_BLANK' title='<?php _e("Support forum","wp-google-maps"); ?>'><?php _e("Support forum","wp-google-maps"); ?></a></li>
	                    <li><a href='https://www.wpgmaps.com/contact-us/' target='_BLANK' title='<?php _e("Contact us","wp-google-maps"); ?>'><?php _e("Contact us","wp-google-maps"); ?></a></li>
	                </ul>
	            </div>
	        </div>
	    </div>
	</div>
<?php
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
        $documentation = "<a href='https://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/' target='_BLANK'>".__('Read the documentation', 'wp-google-maps')."</a>";
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
	
	add_action('init', 'wpgmza_migrate_spatial_data', 1, 11);
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
		trigger_error('Deprecated since 8.0.20');
	}
}

if(isset($_POST['wpgmza_save_maker_location']) ||
	isset($_POST['wpgmza_save_circle']) ||
	isset($_POST['wpgmza_save_rectangle']))
{
	add_filter('wpgmza_plugin_get_localized_data', function($arr) {
		
		$arr['refreshOnLoad'] = true;
		return $arr;
		
	});
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
			
			$readme = preg_replace('/== Changelog ==.+For more, please view the WP Google Maps site/sm', "== Changelog ==\r\n\r\n$changelog\r\n\r\nFor more, please view the WP Google Maps site\r\n", $readme);
			
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

function wpgmaps_check_if_no_api_key() {
	global $wpgmza;
	
	if($wpgmza->settings->engine != 'google-maps' || empty($wpgmza->settings->engine))
		return;
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
    $g_api_key = get_option('wpgmza_google_maps_api_key');
    if( !$g_api_key || $g_api_key == '' ){
        $link1 = "admin.php?page=wp-google-maps-menu-settings";
        $link2 = "javascript:void(0);";
        

        
        $t .= "<p class='notice'>".sprintf(__('Please ensure you <a href="%s">enter a Google Maps API key</a> to continue using Google Maps. Alternatively, swap over to Open Layers by clicking <a id="wpgm-swap-to-open-layers" href="%s">here</a>.', 'wp-google-maps'),$link1,$link2)."</p>";
        
        
        $t .= "";
        return $t;
    }
}