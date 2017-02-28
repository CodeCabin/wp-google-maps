<?php
/*
Full screen module
 */

/**
 * Add the style sheet to the top of the page
 * @author Nick Duncan <nick@codecabin.co.za>
 * @since  1.0.0
 * @return void
 */
add_action("wpgooglemaps_hook_user_styles","wpgooglemaps_full_screen_hook_control_user_styles",10);
function wpgooglemaps_full_screen_hook_control_user_styles() {
	global $wpgmza_version;
}



/**
 * Add relevant settings to the main WP Google Maps Settings page
 * @param  string $ret             Current table output
 * @param  array  $wpgmza_settings General settings array
 * @since  1.0.0
 * @author Nick Duncan <nick@codecabin.co.za>
 * @return string
 */
add_filter("wpgooglemaps_map_settings_output_bottom","wpgooglemaps_full_screen_filter_control_map_settings_output_bottom",10,2);
function wpgooglemaps_full_screen_filter_control_map_settings_output_bottom($ret,$wpgmza_settings) {
    if (isset($wpgmza_settings['wpgmza_fs_enabled']) && $wpgmza_settings['wpgmza_fs_enabled'] == '1') { $wpgmza_fs_enabled = "checked='checked'"; } else { $wpgmza_fs_enabled = ''; }
    if (isset($wpgmza_settings['wpgmza_fs_string1'])) { $wpgmza_fs_string1 = $wpgmza_settings['wpgmza_fs_string1']; } else { $wpgmza_fs_string1 = __("Full screen","wp-google-maps"); }
    if (isset($wpgmza_settings['wpgmza_fs_string2'])) { $wpgmza_fs_string2 = $wpgmza_settings['wpgmza_fs_string2']; } else { $wpgmza_fs_string2 = __("Close full screen","wp-google-maps"); }

    $ret .= "            <table class='form-table'>";
    $ret .= "               <tr>";
    $ret .= "                        <td width='200' valign='top'>".__("Enable Full Screen Option","wp-google-maps").":</td>";
    $ret .= "                     <td>";
    $ret .= "                           <div class='switch'><input name='wpgmza_fs_enabled' type='checkbox' class='cmn-toggle cmn-toggle-yes-no' id='wpgmza_fs_enabled' value='1' $wpgmza_fs_enabled /> <label for='wpgmza_fs_enabled' data-on='".__("Yes", "wp-google-maps")."' data-off='".__("No", "wp-google-maps")."'></label></div><br />";
    $ret .= "                    </td>";
    $ret .= "                </tr>";
    $ret .= "               <tr>";
    $ret .= "                        <td width='200' valign='top'>".__("Open Full Screen String","wp-google-maps").":</td>";
    $ret .= "                     <td>";
    $ret .= "                           <input name='wpgmza_fs_string1' type='text' id='wpgmza_fs_string1' value='$wpgmza_fs_string1' />";
    $ret .= "                    </td>";
    $ret .= "                </tr>";
    $ret .= "               <tr>";
    $ret .= "                        <td width='200' valign='top'>".__("Close Full Screen String","wp-google-maps").":</td>";
    $ret .= "                     <td>";
    $ret .= "                           <input name='wpgmza_fs_string2' type='text' id='wpgmza_fs_string2' value='$wpgmza_fs_string2' />";
    $ret .= "                    </td>";
    $ret .= "                </tr>";
    $ret .= "             </table>";



	return $ret;

}

add_filter("wpgooglemaps_filter_save_settings","wpgooglemaps_full_screen_filter_control_save_settings",10,1);
function wpgooglemaps_full_screen_filter_control_save_settings($wpgmza_data) {
    if (isset($_POST['wpgmza_fs_enabled'])) { $wpgmza_data['wpgmza_fs_enabled'] = sanitize_text_field($_POST['wpgmza_fs_enabled']); } else { $wpgmza_data['wpgmza_fs_enabled'] = 0; }
    if (isset($_POST['wpgmza_fs_string1'])) { $wpgmza_data['wpgmza_fs_string1'] = sanitize_text_field($_POST['wpgmza_fs_string1']); } else { $wpgmza_data['wpgmza_fs_string1'] = __("Full screen","wp-google-maps"); }
    if (isset($_POST['wpgmza_fs_string2'])) { $wpgmza_data['wpgmza_fs_string2'] = sanitize_text_field($_POST['wpgmza_fs_string2']); } else { $wpgmza_data['wpgmza_fs_string2'] = __("Close full screen","wp-google-maps"); }
	return $wpgmza_data;
}



add_action("wpgooglemaps_hook_user_js_after_core","wpgooglemaps_full_screen_hook_control_user_js_after_core",10);
function wpgooglemaps_full_screen_hook_control_user_js_after_core() {
    if (!function_exists("wpgmaps_pro_activate")) {
        global $wpgmza_version;
        $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
        if (isset($wpgmza_settings['wpgmza_fs_enabled']) && $wpgmza_settings['wpgmza_fs_enabled'] == '1') { 
            wp_register_style( 'wp-google-maps-full-screen', plugins_url('css/wp-google-maps-full-screen-map.css', dirname(dirname(__FILE__))),array(),$wpgmza_version);
            wp_enqueue_style( 'wp-google-maps-full-screen' );
            wp_register_script('wp-google-maps-full-screen-js', plugins_url('/js/wp-google-maps-full-screen-map.js',dirname(dirname(__FILE__))), array(), $wpgmza_version, false);
            wp_enqueue_script('wp-google-maps-full-screen-js');
        }
    }
}

add_action("wpgooglemaps_hook_user_js_after_localize","wpgooglemaps_full_screen_hook_control_user_js_after_localize");
function wpgooglemaps_full_screen_hook_control_user_js_after_localize() {
	$wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    if (isset($wpgmza_settings['wpgmza_fs_string1']) && $wpgmza_settings['wpgmza_fs_string1'] != '') { $wpgmza_fs_string1 = $wpgmza_settings['wpgmza_fs_string1']; } else { $wpgmza_fs_string1 = __("Full screen","wp-google-maps"); }
    if (isset($wpgmza_settings['wpgmza_fs_string2']) && $wpgmza_settings['wpgmza_fs_string2'] != '') { $wpgmza_fs_string2 = $wpgmza_settings['wpgmza_fs_string2']; } else { $wpgmza_fs_string2 = __("Close full screen","wp-google-maps"); }


	wp_localize_script( 'wp-google-maps-full-screen-js', 'wpgmaps_full_screen_string_1', $wpgmza_fs_string1);
	wp_localize_script( 'wp-google-maps-full-screen-js', 'wpgmaps_full_screen_string_2', $wpgmza_fs_string2);


}