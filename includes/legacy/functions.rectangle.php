<?php

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

function wpgmza_b_add_rectangle($mid)
{
	global $wpgmza_tblname_maps;
    global $wpdb;
	
	wpgmaps_b_admin_add_rectangle_javascript();
	
    if ($_GET['action'] == "add_rectangle" && isset($mid)) {
    	$mid = intval($mid);
        $res = wpgmza_get_map_data($mid);
        echo "
            

            
          
           <div class='wrap'>
                <h1>WP Go Maps</h1>
                <div class='wide'>

                    <h2>".__("Add rectangle","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".$mid."' method='post' id='wpgmaps_add_rectangle_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".$mid."' />
					<input type='hidden' name='wpgmaps_rectangle-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_rectangle-nonce' )."' />
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
                                <input id=\"rectangle_opacity\" name=\"rectangle_opacity\" type=\"text\" value=\"0.6\" />  <small class='wpgmza-info__small'>(0 - 1.0) example: 0.6 for 60%</small>
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
    	$mid = intval($mid);
        $res = wpgmza_get_map_data($mid);
		$rectangle_id = (int) intval($_GET['rectangle_id']);
		
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
                <h1>WP Go Maps</h1>
                <div class='wide'>

                    <h2>".__("Edit rectangle","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".$mid."' method='post' id='wpgmaps_add_rectangle_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".$mid."' />
					<input type='hidden' name='rectangle_id' value='{$rectangle_id}'/>
					<input type='hidden' name='wpgmaps_rectangle-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_rectangle-nonce' )."' />
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
                                <input id=\"rectangle_opacity\" name=\"rectangle_opacity\" type=\"text\" value=\"{$rectangle->opacity}\" type='number' step='any' />  <small class='wpgmza-info__small'>(0 - 1.0) example: 0.6 for 60%</small>
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
	wp_enqueue_script('wpgmza-legacy-rectangle-panel', plugin_dir_url(WPGMZA_FILE) . 'js/legacy/legacy-rectangle-panel.js');
	wp_localize_script('wpgmza-legacy-rectangle-panel', 'wpgmza_legacy', $localized_data);
}

if(!function_exists('wpgmza_get_rectangles_table'))
{
	function wpgmza_get_rectangles_table($map_id)
	{
		global $wpdb;
		global $wpgmza_tblname_rectangles;

		$map_id = intval($map_id);
		
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
			$rectangle->id = intval($rectangle->id);
			
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
