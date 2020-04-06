<?php

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
					<input type='hidden' name='wpgmaps_circle-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_circle-nonce' )."' />
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
                            	<input id=\"circle_opacity\" name=\"circle_opacity\" type=\"text\" value=\"0.6\" />  <small class='wpgmza-info__small'>(0 - 1.0) example: 0.6 for 60%</small>
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
					<input type='hidden' name='wpgmaps_circle-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_circle-nonce' )."' />


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
                                <input id=\"circle_opacity\" name=\"circle_opacity\" type=\"text\" value=\"{$circle->opacity}\" type='number' step='any' />  <small class='wpgmza-info__small'>(0 - 1.0) example: 0.6 for 60%</small>
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
	
	$localized_data = array(
		'wpgmza_lat'			=> $wpgmza_lat,
		'wpgmza_lng'			=> $wpgmza_lng,
		'start_zoom'			=> $start_zoom,
		'wpgmza_width'			=> $wpgmza_width,
		'wpgmza_width_type'		=> $wpgmza_width_type,
		'wpgmza_height'			=> $wpgmza_height,
		'wpgmza_height_type'	=> $wpgmza_height_type,
		'wpgmza_map_type'		=> $wpgmza_map_type
	);
	
	wp_enqueue_style('wpgooglemaps-css', wpgmaps_get_plugin_url() . 'css/wpgmza_style.css');
	wp_enqueue_script('wpgmza-legacy-circle-panel', plugin_dir_url(WPGMZA_FILE) . 'js/legacy/legacy-circle-panel.js');
	wp_localize_script('wpgmza-legacy-circle-panel', 'wpgmza_legacy', $localized_data);
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