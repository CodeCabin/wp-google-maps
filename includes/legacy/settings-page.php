<?php

function wpgmza_legacy_settings_page_basic()
{
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
    
	$user_interface_style_checked[0] = '';
	$user_interface_style_checked[1] = '';
	$user_interface_style_checked[2] = '';
	$user_interface_style_checked[3] = '';
	$user_interface_style_checked[4] = '';
	$user_interface_style_checked[5] = '';
	if (isset($wpgmza_settings['user_interface_style'])) { $user_interface_style = $wpgmza_settings['user_interface_style']; } else {$user_interface_style = false; }
	if ($user_interface_style == 'bare-bones') { $user_interface_style_checked[0] = "checked='checked'";
		$wpgmza->settings->user_interface_style = 'bare-bones'; }
	else if ($user_interface_style == 'default') { $user_interface_style_checked[1] = "checked='checked'";
			$wpgmza->settings->user_interface_style = 'default'; }
	else if ($user_interface_style == 'legacy') { $user_interface_style_checked[2] = "checked='checked'"; 
		$wpgmza->settings->user_interface_style = 'legacy';}

	else if ($user_interface_style == 'compact') { $user_interface_style_checked[3] = "checked='checked'";
		$wpgmza->settings->user_interface_style = 'compact'; }
	else if ($user_interface_style == 'modern') { $user_interface_style_checked[4] = "checked='checked'";
		$wpgmza->settings->user_interface_style = 'modern'; }
	else if ($user_interface_style == 'minimal') { $user_interface_style_checked[5] = "checked='checked'";
		$wpgmza->settings->user_interface_style = 'minimal'; }
	else { $user_interface_style_checked[2] = "checked='checked'"; }
    
    

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
	$ret .= wp_nonce_field('wpgmza_settings_page_post', 'wpgmza_settings_page_post_nonce');
	
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
	
	$ret .= "<tr>

				<td>" . __("User Interface Style:", "wp-google-maps") . "</td>

					<td>
						<input type='radio'
							name='user_interface_style'
							id='user_interface_style_bare_bones'
							value='bare-bones' " 
							. $user_interface_style_checked[0] . 
							" />" . __("Bare Bones - Applies no styling to the components at all. This is recommended for designers and developers who want to style the components from scratch.", "wp-google-maps") . "
							
					<br />

						<input type='radio'
							name='user_interface_style'
							id='user_interface_style_default'
							value='default' " 
							. $user_interface_style_checked[1] . 
							" />" . __("Default - The default front end.", "wp-google-maps") . "
							
							<br />

						<input type='radio'
							name='user_interface_style'
							id='user_interface_style_legacy'
							value='legacy' " 
							. $user_interface_style_checked[2] . 
							" />" . __("Legacy - This setting is the same as Default, but provides options to change individual components to the modern style.", "wp-google-maps") . "
							
					<br />
												
						<input type='radio'
							name='user_interface_style'
							id='user_interface_style_compact'
							value='compact' " 
							. $user_interface_style_checked[3] . 
							" />" . __("Compact - Puts all components and their labels inline.", "wp-google-maps") . "
							
					<br />
											
						<input type='radio'
							name='user_interface_style'
							id='user_interface_style_modern'
							value='modern' " 
							. $user_interface_style_checked[4] . 
							" />" . __("Modern - Puts components inside the map, with pull-out panels.", "wp-google-maps") . "
							
					<br />
											
						<input type='radio'
							name='user_interface_style'
							id='user_interface_style_minimal'
							value='minimal' " 
							. $user_interface_style_checked[5] . 
							" />" . __("Minimal - The same as Compact, but with icons instead of text labels.", "wp-google-maps") . "
							
					<br />	
				</td>
			</tr>";

	$ret .= "               <tr>";
	$ret .= "                        <td width='200' valign='top'>".__("Troubleshooting Options","wp-google-maps").":</td>";
	$ret .= "                     <td>";
	$ret .= "                           <div class='switch'><input name='wpgmza_settings_force_jquery' type='checkbox' class='cmn-toggle cmn-toggle-yes-no' id='wpgmza_settings_force_jquery' value='yes' $wpgmza_force_jquery_checked /> <label for='wpgmza_settings_force_jquery' data-on='".__("Yes", "wp-google-maps")."' data-off='".__("No", "wp-google-maps")."'></label></div> ".__("Over-ride current jQuery with version 1.11.3 (Tick this box if you are receiving jQuery related errors after updating to WordPress 4.5)", 'wp-google-maps')."<br />";
	$ret .= "                    </td>";
	$ret .= "                </tr>";

	$ret .= "               <tr>";
	$ret .= "                        <td width='200' valign='top'></td>";
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
	
	
	
	global $wpgmza;
	$developer_mode_checked = '';
	
	if(!empty($wpgmza->settings->developer_mode))
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
	$ret .= "                        <td width='200' valign='top'>".__("Greedy Gesture Handling","wp-google-maps").":</td>";
	$ret .= "                     <td>";
	$ret .= "                           <div class='switch wpgmza-open-layers-feature-unavailable'><input name='wpgmza_force_greedy_gestures' type='checkbox' class='cmn-toggle cmn-toggle-yes-no' id='wpgmza_force_greedy_gestures' value='yes' $wpgmza_force_greedy_gestures_checked /> <label for='wpgmza_force_greedy_gestures' data-on='".__("Yes", "wp-google-maps")."' data-off='".__("No", "wp-google-maps")."'></label></div> " . __("Removes the need to use two fingers to move the map on mobile devices, removes 'Use ctrl + scroll to zoom the map'", "wp-google-maps");
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
	
	$ret .= "
			<tr>
				<td>
					" . __('Disable Compressed Path Variables', 'wp-google-maps') . "
				</td>
				<td>
					<input 
						name='disable_compressed_path_variables' 
						" . (!empty($wpgmza->settings->disable_compressed_path_variables) ? "checked='checked'" : '') . " 
						type='checkbox'
						/>
					<br/>
					" . __('We recommend using this setting if you frequently experience HTTP 414 - Request URI too long. We do not recommend using this setting if your site uses REST caching or a CDN.', 'wp-google-maps') . "
				</td>
			</tr>
			";
	
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
	
	$ret .= "             <tr>
							 <td width='200' valign='top' style='vertical-align:top;'>".__("Disable Autoptimize Compatibility Fix","wp-google-maps").":</td>
						  <td>
							 <input 
								type='checkbox' 
								name='disable_autoptimize_compatibility_fix'
								" . (!empty($wpgmza->settings->disable_autoptimize_compatibility_fix) ? "checked='checked'" : "") . "
								/>
								<div>" . __("Use this setting if you are experiencing issues with Autoptimize's CSS aggregation. This may cause issues on setups with a large amount of marker data.", "wp-google-maps") . "</div>
						 </td>
					 </tr>
	";
	
	$ret .= "                   </table>";
	$ret .= "<button data-required-maps-engine='open-layers' id='wpgmza_flush_cache_btn' class='button-primary'>".__("Flush Geocode Cache","wp-google-maps")."</button>";
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
	
	<div id='wpgmza-developer-mode'>
	<h4>" . __('Developer Mode', 'wp-google-maps') . "</h4>
	<input type='checkbox' name='wpgmza_developer_mode' $developer_mode_checked/>
	" . __('Always rebuilds combined script files, does not load combined and minified scripts', 'wp-google-maps') . "
	</div>";
	
	$ret .= "           </div>";
	
	$ret .= apply_filters('wpgmza_global_settings_tab_content', '');
	
	$ret .= "       </div>";
	$ret .= "       <p class='submit'><input type='submit' name='wpgmza_save_settings' class='button-primary' value='".__("Save Settings","wp-google-maps")." &raquo;' /></p>";
	$ret .= "   </form>";			
	$ret .=  "</div>";
	
	echo $ret;
}