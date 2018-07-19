<?php
/**
 * Handles Backwards Compatibility
*/

add_action('admin_head', 'wpgmza_check_admin_head_backwards_compat_v6');
/**
 * Runs the head functions if backwards compat is in the motions
*/
function wpgmza_check_admin_head_backwards_compat_v6(){
	if(wpgmza_check_pro_compat_required_v6()){
		if (isset($_POST['wpgmza_save_circle'])){
     		if(function_exists("wpgmaps_head")){
     			wpgmaps_head();
     		}
	    } else if (isset($_POST['wpgmza_save_rectangle'])){
	    	if(function_exists("wpgmaps_head")){
     			wpgmaps_head();
     		}
		}
	}
}


add_action('wpgooglemaps_hook_user_js_after_core', 'wpgmza_check_user_backwards_compat_v6');
/**
 * Checks if user end needs backwards compat code
*/
function wpgmza_check_user_backwards_compat_v6(){
	if(wpgmza_check_pro_compat_required_v6()){
		wp_register_script('wpgmaps-user-backwards-compat', plugins_url('js/backwards_compat_user_v6.js', __FILE__), array('jquery'), '1.0', true);

		wp_localize_script('wpgmaps-user-backwards-compat', 'wpgmza_circle_data_array', wpgmza_backwards_compat_get_all_circle_data());
		wp_localize_script('wpgmaps-user-backwards-compat', 'wpgmza_rectangle_data_array', wpgmza_backwards_compat_get_all_rectangle_data());

		wp_enqueue_script('wpgmaps-user-backwards-compat');
	}
}



add_action("wpgmza_check_map_editor_backwards_compat", "wpgmza_check_map_editor_backwards_compat_v6");
/**
 * Checks if the Pro version is less than the last v6 
 * Set's up backwards compatibility if this is the case
*/
function wpgmza_check_map_editor_backwards_compat_v6(){
	if(isset($_GET['action'])){
		if ($_GET['action'] == "edit" && isset($_GET['map_id']) && wpgmza_check_pro_compat_required_v6()) {
			wp_register_script('wpgmaps-admin-backwards-compat', plugins_url('js/backwards_compat_v6.js', __FILE__), array('jquery', "jquery-ui-core"), '1.0', true);

			$tab_heading = "<li><a href=\"#tabs-circles\">".__("Circles","wp-google-maps")."</a></li>
							<li><a href=\"#tabs-rectangles\">".__("Rectangles","wp-google-maps")."</a></li>";

			$tab_content = "<div id=\"tabs-circles\">
								<h2>
									" . __('Add a Circle', 'wp-google-maps') . "
								</h2>
								<span><a class=\"button-primary\" href=\"" . get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu&action=add_circle&map_id=" . $_GET['map_id'] . "\">" . __("Add a Circle", "wp-google-maps") . "</a></span>
								" . wpgmza_get_circles_table($_GET['map_id']) . "
							</div>
							
							<div id=\"tabs-rectangles\">
								<h2>
									" . __('Add a Rectangle', 'wp-google-maps') . "
								</h2>
								<span><a class=\"button-primary\" href=\"" . get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu&action=add_rectangle&map_id=" . $_GET['map_id'] . "\">" . __("Add a Rectangle", "wp-google-maps") . "</a></span>
								" . wpgmza_get_rectangles_table($_GET['map_id']) . "
							</div>";

			wp_localize_script('wpgmaps-admin-backwards-compat', 'wpgmza_backwards_compat_v6_marker_tab_headings', $tab_heading);
			wp_localize_script('wpgmaps-admin-backwards-compat', 'wpgmza_backwards_compat_v6_marker_tab_content', $tab_content);

			wp_localize_script('wpgmaps-admin-backwards-compat', 'wpgmza_circle_data_array', wpgmza_get_circle_data($_GET['map_id']));
			wp_localize_script('wpgmaps-admin-backwards-compat', 'wpgmza_rectangle_data_array', wpgmza_get_rectangle_data($_GET['map_id']));

			wp_enqueue_script('wpgmaps-admin-backwards-compat');
		}	
	}
}

/**
 * Check if backwards compat code is needed for this version
*/
function wpgmza_check_pro_compat_required_v6(){
	if(function_exists("wpgmza_register_pro_version")){
		global $wpgmza_pro_version;

		if(floatval($wpgmza_pro_version) <= 6.20){
			return true;
		}
	}
	return false;
}

function wpgmza_backwards_compat_get_all_circle_data(){
	global $wpdb;
	global $wpgmza_tblname_circles;
	global $wpgmza;
	
	$stmt = "SELECT *, {$wpgmza->spatialFunctionPrefix}AsText(center) AS center FROM $wpgmza_tblname_circles";
	$results = $wpdb->get_results($stmt);
	
	$circles = array();
	foreach($results as $obj)
		$circles[$obj->id] = $obj;
	
	return $circles;
}

function wpgmza_backwards_compat_get_all_rectangle_data(){
	global $wpdb;
	global $wpgmza_tblname_rectangles;
	global $wpgmza;
	
	$stmt = "SELECT *, {$wpgmza->spatialFunctionPrefix}AsText(cornerA) AS cornerA, {$wpgmza->spatialFunctionPrefix}AsText(cornerB) AS cornerB FROM $wpgmza_tblname_rectangles";
	$results = $wpdb->get_results($stmt);
	
	$rectangles = array();
	foreach($results as $obj)
		$rectangles[$obj->id] = $obj;
	
	return $rectangles;
}
