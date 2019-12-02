<?php
/*
Polylines functionality for WP Google Maps
*/

if(!defined('ABSPATH'))
	exit;

/**
 * Render polyline editor HTML
 * @param  integer $mid     Map ID
 * @return string           HTML outut
 */
function wpgmza_b_pro_add_polyline($mid) {
    global $wpgmza_tblname_maps;
    global $wpdb;
    if ($_GET['action'] == "add_polyline" && isset($mid)) {

        if( function_exists('google_maps_api_key_warning' ) ){ google_maps_api_key_warning(); }

        $res = wpgmza_get_map_data($mid);
        echo "
            

            
          
           <div class='wrap'>
                <h1>WP Google Maps</h1>
                <div class='wide'>

                    <h2>".__("Add a Polyline","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".intval($mid)."' method='post' id='wpgmaps_add_polyline_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".intval($mid)."' />
                    <input type='hidden' name='wpgmaps_polyline-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_polyline-nonce' )."' />
                    <table class='wpgmza-listing-comp' style='width:30%;float:left;'>
                        <tr>
                            <td>
                                ".__("Name","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"poly_name\" name=\"poly_name\" type=\"text\" value=\"\" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Line Color","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"poly_line\" name=\"poly_line\" type=\"text\" class=\"color\" value=\"000000\" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Opacity","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"poly_opacity\" name=\"poly_opacity\" type=\"text\" value=\"0.8\" /> (0 - 1.0) example: 0.8 for 80%
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Line Thickness","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"poly_thickness\" name=\"poly_thickness\" type=\"text\" value=\"4\" /> (0 - 50) example: 4
                            </td>
                                
						</tr>
						
						
						
                    </table>
                    <div class='wpgmza_map_seventy'> 
                        <div id=\"wpgmza_map\">&nbsp;</div>
                        <p>

                                <ul style=\"list-style:initial;\" class='update-nag update-blue update-slim update-map-overlay'>
                                    
                                    <li style=\"margin-left:30px;\">Click on the map to insert a vertex.</li>
                                    <li style=\"margin-left:30px;\">Click on a vertex to remove it.</li>
                                    <li style=\"margin-left:30px;\">Drag a vertex to move it.</li>
                                </ul>
                        </p>
                    </div>


                     <p style='clear: both;'>Polyline data:<br /><textarea name=\"wpgmza_polyline\" id=\"poly_line_list\" style=\" height:100px; background-color:#FFF; padding:5px; overflow:auto;\"></textarea>
                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='wpgmza_save_polyline' class='button-primary' value='".__("Save Polyline","wp-google-maps")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }



}


/**
 * Render polyline editor HTML (edit mode)
 * @param  integer $mid     Map ID
 * @return string           HTML outut
 */
function wpgmza_b_pro_edit_polyline($mid) {
    global $wpgmza_tblname_maps;
    global $wpdb;
    if ($_GET['action'] == "edit_polyline" && isset($mid)) {
        $res = wpgmza_get_map_data($mid);
        $pol = wpgmza_b_return_polyline_options(sanitize_text_field($_GET['poly_id']));

        echo "
            

           <div class='wrap'>
                <h1>WP Google Maps</h1>
                <div class='wide'>

                    <h2>".__("Edit Polyline","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".esc_attr($mid)."' method='post' id='wpgmaps_edit_poly_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".esc_attr($mid)."' />
                    <input type='hidden' name='wpgmaps_poly_id' id='wpgmaps_poly_id' value='".esc_attr($_GET['poly_id'])."' />
                    <input type='hidden' name='wpgmaps_polyline-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_polyline-nonce' )."' />
                    <table class='wpgmza-listing-comp' style='width:30%;float:left;'>
                        <tr>
                            <td>
                                ".__("Name","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"poly_name\" name=\"poly_name\" type=\"text\" value=\"".esc_attr(stripslashes($pol->polyname))."\" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Line Color","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"poly_line\" name=\"poly_line\" type=\"text\" class=\"color\" value=\"".esc_attr($pol->linecolor)."\" />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Opacity","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"poly_opacity\" name=\"poly_opacity\" type=\"text\" value=\"".esc_attr($pol->opacity)."\" /> (0 - 1.0) example: 0.8 for 80%
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ".__("Line Thickness","wp-google-maps")."
                            </td>
                            <td>
                                <input id=\"poly_thickness\" name=\"poly_thickness\" type=\"text\" value=\"".esc_attr($pol->linethickness)."\" /> (0 - 50) example: 4
                            </td>
						</tr>
					
						<tr>
							
							<td>
								".__('Show Polyline', 'wp-google-maps')."
							</td>
							<td>
								<button id='fit-bounds-to-shape' 
									class='button button-secondary' 
									type='button' 
									title='" . __('Fit map bounds to shape', 'wp-google-maps') . "'
									data-fit-bounds-to-shape='poly'>
									<i class='fas fa-eye'></i>
								</button>
							</td>
						
						</tr>
						
                    </table>
                    <div class='wpgmza_map_seventy'> 
                        <div id=\"wpgmza_map\">&nbsp;</div>
                        <p>
                                <ul style=\"list-style:initial;\" class='update-nag update-blue update-slim update-map-overlay'>

                                    <li style=\"margin-left:30px;\">Click on the map to insert a vertex.</li>
                                    <li style=\"margin-left:30px;\">Click on a vertex to remove it.</li>
                                    <li style=\"margin-left:30px;\">Drag a vertex to move it.</li>
                                </ul>
                        </p>
                    </div>

                     <p style='clear: both;'>Polyline data:<br /><textarea name=\"wpgmza_polyline\" id=\"poly_line_list\" style=\"height:100px; background-color:#FFF; padding:5px; overflow:auto;\">{$pol->polydata}</textarea>
                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='wpgmza_edit_polyline' class='button-primary' value='".__("Save Polyline","wp-google-maps")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }



}
/**
 * Render polyline JS
 *
 * @todo  This needs to be converted to a native JS file with localized variables
 * 
 * @param  integer $mapid   Map ID
 * 
 * @return void
 */
function wpgmaps_b_admin_add_polyline_javascript($mapid)
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
	if (isset($res->kml)) { $kml = $res->kml; } else { $kml = false; }
	
	$localized_data = array(
		'wpgmza_lat'			=> $wpgmza_lat,
		'wpgmza_lng'			=> $wpgmza_lng,
		'start_zoom'			=> $start_zoom,
		'wpgmza_width'			=> $wpgmza_width,
		'wpgmza_width_type'		=> $wpgmza_width_type,
		'wpgmza_height'			=> $wpgmza_height,
		'wpgmza_height_type'	=> $wpgmza_height_type,
		'wpgmza_map_type'		=> $wpgmza_map_type,
		'polygon_data'			=> array()
	);
	
	$total_poly_array = wpgmza_b_return_polyline_id_array(sanitize_text_field($_GET['map_id']));
	
	foreach ($total_poly_array as $poly_id)
	{
		$polyoptions = wpgmza_b_return_polyline_options($poly_id);
		$linecolor = $polyoptions->linecolor;
		$lineopacity = $polyoptions->opacity;
		
		if (!$linecolor) { $linecolor = "000000"; }
		if ($lineopacity == "") { $lineopacity = "1.0"; }
		
		$linecolor = "#".$linecolor;
		$poly_array = wpgmza_b_return_polyline_array($poly_id);
		$path_data = array();
		
		foreach($poly_array as $single_poly)
		{
			$poly_data_raw = str_replace(" ","",$single_poly);
			$poly_data_raw = explode(",",$poly_data_raw);
			$lat = $poly_data_raw[0];
			$lng = $poly_data_raw[1];
			
			$path_data[] = array(
				'lat' => $lat,
				'lng' => $lng
			);
		}
		
		$localized_data['polyline_data'][$poly_id] = array(
			'strokeColor'		=> $linecolor,
			'fillOpacity'		=> $fillopacity,
			'strokeOpacity'		=> $lineopacity,
			'fillColor'			=> $fillcolor,
			'path'				=> $path_data
		);
	}
	
	wp_enqueue_style('wpgooglemaps-css', wpgmaps_get_plugin_url() . 'css/wpgmza_style.css');
	wp_enqueue_script('wpgmza-legacy-polyline-panel', wpgmaps_get_plugin_url() . 'js/legacy/legacy-polyline-panel.js');
	wp_localize_script('wpgmza-legacy-polyline-panel', 'wpgmza_legacy_polyline_panel_vars', $localized_data);
}

/**
 * Render polyline edit JS
 *
 * @todo  This needs to be converted to a native JS file with localized variables
 * 
 * @param  integer $mapid       Map ID
 * @param  integer $polyid      Polygon ID
 * 
 * @return void
 */
function wpgmaps_b_admin_edit_polyline_javascript($mapid,$polyid) {
	$res = wpgmza_get_map_data($mapid);
	
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
	if (isset($res->kml)) { $kml = $res->kml; } else { $kml = false; }
	
	$localized_data = array(
		'wpgmza_lat'			=> $wpgmza_lat,
		'wpgmza_lng'			=> $wpgmza_lng,
		'start_zoom'			=> $start_zoom,
		'wpgmza_width'			=> $wpgmza_width,
		'wpgmza_width_type'		=> $wpgmza_width_type,
		'wpgmza_height'			=> $wpgmza_height,
		'wpgmza_height_type'	=> $wpgmza_height_type,
		'wpgmza_map_type'		=> $wpgmza_map_type,
		'polygon_data'			=> array()
	);
	
	$total_poly_array = wpgmza_b_return_polyline_id_array(sanitize_text_field($_GET['map_id']));
	
	foreach ($total_poly_array as $poly_id)
	{
		
		
		$polyoptions = wpgmza_b_return_polyline_options($poly_id);
		
		$linecolor = $polyoptions->linecolor;
		$lineopacity = $polyoptions->opacity;
		
		if (!$linecolor) { $linecolor = "000000"; }
		if ($lineopacity == "") { $lineopacity = "1.0"; }
		
		$linecolor = "#".$linecolor;
		$poly_array = wpgmza_b_return_polyline_array($poly_id);
		$path_data = array();
		
		foreach($poly_array as $single_poly)
		{
			$poly_data_raw = str_replace(" ","",$single_poly);
			$poly_data_raw = explode(",",$poly_data_raw);
			$lat = $poly_data_raw[0];
			$lng = $poly_data_raw[1];
			
			$path_data[] = array(
				'lat' => $lat,
				'lng' => $lng
			);
		}
		
		$localized_data['polyline_data'][$poly_id] = array(
			'strokeColor'		=> $linecolor,
			'strokeOpacity'		=> $lineopacity,
			'path'				=> $path_data
		);
	}
	
	wp_enqueue_style('wpgooglemaps-css', wpgmaps_get_plugin_url() . 'css/wpgmza_style.css');
	wp_enqueue_script('wpgmza-legacy-polyline-panel', wpgmaps_get_plugin_url() . 'js/legacy/legacy-polyline-panel.js');
	wp_localize_script('wpgmza-legacy-polyline-panel', 'wpgmza_legacy_polyline_panel_vars', $localized_data);
}
/**
 * Returns the list of polylines displayed in the map editor
 *
 * @todo Build this as a hook or filter instead of a function call
 * 
 * @param  integer  $map_id Map ID
 * @param  boolean  $admin  Identify if user is admin or not
 * @param  string   $width  Width to be used for HTML output
 * @return string           List HTML
 */
function wpgmza_b_return_polyline_list($map_id,$admin = true,$width = "100%") {
    wpgmaps_debugger("return_marker_start");

    global $wpdb;
    global $wpgmza_tblname_polylines;
    $wpgmza_tmp = "";

    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $wpgmza_tblname_polylines WHERE `map_id` = %d ORDER BY `id` DESC",intval($map_id)) );
    
    $wpgmza_tmp .= "
        
        <table id=\"wpgmza_table_polyline\" class=\"display\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:$width;\">
        <thead>
        <tr>
            <th align='left'><strong>".__("ID","wp-google-maps")."</strong></th>
            <th align='left'><strong>".__("Name","wp-google-maps")."</strong></th>
            <th align='left' style='width:182px;'><strong>".__("Action","wp-google-maps")."</strong></th>
        </tr>
        </thead>
        <tbody>
    ";
    $res = wpgmza_get_map_data($map_id);
    $default_marker = "<img src='".$res->default_marker."' />";
    
    //$wpgmza_data = get_option('WPGMZA');
    //if ($wpgmza_data['map_default_marker']) { $default_icon = "<img src='".$wpgmza_data['map_default_marker']."' />"; } else { $default_icon = "<img src='".wpgmaps_get_plugin_url()."/images/marker.png' />"; }

    foreach ( $results as $result ) {
        unset($poly_data);
        unset($poly_array);
        $poly_data = '';
        $poly_array = wpgmza_b_return_polyline_array($result->id);
        foreach ($poly_array as $poly_single) {
            $poly_data .= $poly_single.",";
        } 
        if (isset($result->polyname) && $result->polyname != "") { $poly_name = $result->polyname; } else { $poly_name = "Polyline".$result->id; }

        $wpgmza_tmp .= "
            <tr id=\"wpgmza_poly_tr_".$result->id."\">
                <td height=\"40\">".$result->id."</td>
                <td height=\"40\">".esc_attr(stripslashes($poly_name))."</td>
                <td width='170' align='left'>
                    <a href=\"".get_option('siteurl')."/wp-admin/admin.php?page=wp-google-maps-menu&action=edit_polyline&map_id=".$map_id."&poly_id=".$result->id."\" title=\"".__("Edit","wp-google-maps")."\" class=\"wpgmza_edit_poly_btn button\" id=\"".$result->id."\"><i class=\"fa fa-edit\"> </i></a> 
                    <a href=\"javascript:void(0);\" title=\"".__("Delete this polyline","wp-google-maps")."\" class=\"wpgmza_polyline_del_btn button\" id=\"".$result->id."\"><i class=\"fa fa-times\"> </i></a>
                </td>
            </tr>";
        
    }
    $wpgmza_tmp .= "</tbody></table>";
    

    return $wpgmza_tmp;
    
}
/**
 * Retrieve polyline options from DB
 * 
 * @param  integer $poly_id Polyline ID
 * @return array            MYSQL Array
 */
function wpgmza_b_return_polyline_options($poly_id) {
    global $wpdb;
    global $wpgmza_tblname_polylines;
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $wpgmza_tblname_polylines WHERE `id` = %d LIMIT 1",intval($poly_id)) );
    foreach ( $results as $result ) {
        return $result;
    }
}

/**
 * Return the polyline data in the format of an array of coordinate-pair strings
 * 
 * @param  integer $poly_id Polyline ID
 * @return array            Poly data array of coordinate-pair strings
 */
function wpgmza_b_return_polyline_array($poly_id) {
    global $wpdb;
    global $wpgmza_tblname_polylines;
	
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $wpgmza_tblname_polylines WHERE `id` = %d LIMIT 1",intval($poly_id)) );
	
	if(empty($results))
		return null;
	
	$polyline = $results[0];
	$polydata = $polyline->polydata;
	
	$regex = '/-?(\d+)(\.\d+)?,\s*-?(\d+)(\.\d+)?/';
	
	if(!preg_match_all($regex, $polydata, $m))
		return array();
	
	return $m[0];
}

/**
 * Return polyline ID array
 *
 * This is used when creating the JSON array of all the polylines and their unique options
 * 
 * @param  integer  $map_id     Map ID
 * @return array                Array of IDs
 */
function wpgmza_b_return_polyline_id_array($map_id) {
    global $wpdb;
    global $wpgmza_tblname_polylines;
    $ret = array();
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $wpgmza_tblname_polylines WHERE `map_id` = %d",intval($map_id)) );
    foreach ( $results as $result ) {
        $current_id = $result->id;
        $ret[] = $current_id;
        
    }
    return $ret;
}