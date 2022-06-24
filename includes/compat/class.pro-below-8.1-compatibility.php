<?php

function wpgmza_get_legacy_pro_shape_editor_dependencies() {
	$scriptLoader	= new \WPGMZA\ScriptLoader();
	$handles		= array_keys($scriptLoader->getPluginScripts());
	
	return $handles;
}

function wpgmza_convert_json_geometry_to_legacy_format($json) {
	$arr = array();
    if (is_array($json)) {	
    	foreach($json as $obj)
    		$arr []= "{$obj->lat},{$obj->lng}";
    }
	
	return $arr;
}

function wpgmza_convert_shape_options_to_legacy_format($data) {
	// Convert new format colors to legacy format colors
	foreach($data as $key => $value) {
		if(preg_match('/color/', $key))
			$data->{$key} = preg_replace("/^#/", "", $value);
	}
	
	return $data;
}

if(!function_exists('wpgmza_get_marker_columns')) {
    function wpgmza_get_marker_columns() {
        global $wpdb;
		global $wpgmza;
        global $wpgmza_tblname;
        global $wpgmza_pro_version;
        
        $useSpatialData = empty($wpgmza_pro_version) || version_compare($wpgmza_pro_version, '7.0.0', '>=');
        
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

/**
 * Render polygon editor HTML
 * @param  integer $mid     Map ID
 * @return string           HTML outut
 */
function wpgmza_b_pro_add_poly($mid) {
	
    global $wpgmza_tblname_maps;
    global $wpdb;
    if ($_GET['action'] == "add_poly" && isset($mid)) {

        if( function_exists('google_maps_api_key_warning' ) ){ google_maps_api_key_warning(); }
        
        $mid = sanitize_text_field($mid);
        $res = wpgmza_get_map_data($mid);
        echo "
            

            
          
           <div class='wrap'>
                <h1>WP Go Maps</h1>
                <div class='wide'>

                    <h2>".__("Add a Polygon","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".esc_attr($mid)."' method='post' id='wpgmaps_add_poly_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".esc_attr($mid)."' />
                    <input type='hidden' name='wpgmaps_polygon-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_polygon-nonce' )."' />

                    <table class='wpgmza-listing-comp' style='width:30%;float:left; height:400px;'>
                    <tr>
                        <td>".__("Name","wp-google-maps")."</td><td><input type=\"text\" value=\"\" name=\"poly_name\" placeholder='".__("Name","wp-google-maps")."'/></td>
                    </tr>
                    <tr>
                        <td>".__("Title","wp-google-maps")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","wp-google-maps")."\" /><i class='wpgmza-info__small'><a href='".wpgm_pro_link("http://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=polygons")."' title='".__("Pro Version","wp-google-maps")."'>".__("Get the Pro add-on","wp-google-maps")."</a></i></td>
                    </tr>
                    <tr>
                        <td>".__("Link","wp-google-maps")."</td><td><input disabled type=\"text\" value=\"Pro version only\" /></td> 
                    </tr>
                    <tr>
                        <td>".__("Line Color","wp-google-maps")."</td><td><input id=\"poly_line\" name=\"poly_line\" type=\"text\" class=\"color\" value=\"000000\" /></td>   
                    </tr>
                    <tr>
                        <td>".__("Line Opacity","wp-google-maps")."</td><td><input id=\"poly_line_opacity\" name=\"poly_line_opacity\" type=\"text\" value=\"0.5\" />  <small class='wpgmza-info__small'>(0 - 1.0) example: 0.5 for 50%</small></td>   
                    </tr>
                    <tr>
                        <td>".__("Fill Color","wp-google-maps")."</td><td><input id=\"poly_fill\" name=\"poly_fill\" type=\"text\" class=\"color\" value=\"66ff00\" /></td>  
                    </tr>
                    <tr>
                        <td>".__("Opacity","wp-google-maps")."</td><td><input id=\"poly_opacity\" name=\"poly_opacity\" type=\"text\" value=\"0.5\" />  <small class='wpgmza-info__small'>(0 - 1.0) example: 0.5 for 50%</small></td>   
                    </tr>
                    <tr>
                        <td>".__("On Hover Line Color","wp-google-maps")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","wp-google-maps")."\"/></td>   
                    </tr>
                    <tr>
                        <td>".__("On Hover Fill Color","wp-google-maps")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","wp-google-maps")."\"/></td>  
                    </tr>
                    <tr>
                        <td>".__("On Hover Opacity","wp-google-maps")."</td><td><input disabled type=\"text\"value=\"".__("Pro version only","wp-google-maps")."\" /></td>   
                    </tr>
					
                        
                    </table>

                    <div class='wpgmza_map_seventy'> 
                        <div id=\"wpgmza_map\">&nbsp;</div>
                    
                        <p>
                                <ul style=\"list-style:initial;\" class='update-nag update-blue update-slim update-map-overlay'>

                                    <li style=\"margin-left:30px;\">".__("Click on the map to insert a vertex.","wp-google-maps")."</li>
                                    <li style=\"margin-left:30px;\">".__("Click on a vertex to remove it.","wp-google-maps")."</li>
                                    <li style=\"margin-left:30px;\">".__("Drag a vertex to move it.","wp-google-maps")."</li>
                                </ul>
                        </p>
                    </div>

                    <div id='wpgmza-polygon-textarea' style='clear: both;'><label>Polygon data:</label><br /><textarea name=\"wpgmza_polygon\" id=\"poly_line_list\" style=\"width:90%; height:100px; border:1px solid #ccc; background-color:#FFF; padding:5px; overflow:auto;\"></textarea>
                    </div>
                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='wpgmza_save_poly' class='button-primary' value='".__("Save Polygon","wp-google-maps")." &raquo;' /></p>

                    </form>
                </div>
            </div>
        ";
    }
}


/**
 * Render polygon editor HTML (edit mode)
 * @param  integer $mid     Map ID
 * @return string           HTML outut
 */
function wpgmza_b_pro_edit_poly($mid) {
    global $wpgmza_tblname_maps;
    global $wpdb;
	
    if ($_GET['action'] == "edit_poly" && isset($mid)) {
        $mid = sanitize_text_field($mid);;
        $res = wpgmza_get_map_data($mid);
        $pol = wpgmza_b_return_poly_options(sanitize_text_field($_GET['poly_id']));

        echo "
            

           <div class='wrap'>
                <h1>WP Go Maps</h1>
                <div class='wide'>

                    <h2>".__("Edit Polygon","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".esc_attr($mid)."' method='post' id='wpgmaps_edit_poly_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".esc_attr($mid)."' />
                    <input type='hidden' name='wpgmaps_poly_id' id='wpgmaps_poly_id' value='".esc_attr(intval($_GET['poly_id']))."' />
                    <input type='hidden' name='wpgmaps_polygon-nonce' id='wpgmaps_b_nonce' value='".wp_create_nonce( 'wpgmaps_polygon-nonce' )."' />
                        
                    <table class='wpgmza-listing-comp' style='width:30%;float:left; height:400px;'>
                    <tr>
                        <td>".__("Name","wp-google-maps")."</td><td><input type=\"text\" value=\"".esc_attr(stripslashes($pol->polyname))."\" name=\"poly_name\" /></td>
                    </tr>
                    <tr>
                        <td>".__("Title","wp-google-maps")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","wp-google-maps")."\" /><i><a href='".wpgm_pro_link("http://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=polygons")."' title='".__("Pro Version","wp-google-maps")."'>".__("Get the Pro add-on","wp-google-maps")."</a></i></td>
                    </tr>
                    <tr>
                        <td>".__("Description","wp-google-maps")."</td><td><textarea disabled type=\"text\" value=\"".__("Pro version only","wp-google-maps")."\"></textarea><i><a href='".wpgm_pro_link("http://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=polygons")."' title='".__("Pro Version","wp-google-maps")."'>".__("Get the Pro add-on","wp-google-maps")."</a></i></td>
                    </tr>
                    <tr>
                        <td>".__("Link","wp-google-maps")."</td><td><input disabled type=\"text\" value=\"pro version only\" /></td> 
                    </tr>
                    <tr>
                        <td>".__("Line Color","wp-google-maps")."</td><td><input id=\"poly_line\" name=\"poly_line\" type=\"text\" class=\"color\" value=\"".esc_attr($pol->linecolor)."\" /></td>   
                    </tr>
                    <tr>
                        <td>".__("Line Opacity","wp-google-maps")."</td><td><input id=\"poly_line_opacity\" name=\"poly_line_opacity\" type=\"text\" value=\"".esc_attr($pol->lineopacity)."\" />  <small class='wpgmza-info__small'>(0 - 1.0) example: 0.5 for 50%</small></td>   
                    </tr>
                    <tr>
                        <td>".__("Fill Color","wp-google-maps")."</td><td><input id=\"poly_fill\" name=\"poly_fill\" type=\"text\" class=\"color\" value=\"".esc_attr($pol->fillcolor)."\" /></td>  
                    </tr>
                    <tr>
                        <td>".__("Opacity","wp-google-maps")."</td><td><input id=\"poly_opacity\" name=\"poly_opacity\" type=\"text\" value=\"".esc_attr($pol->opacity)."\" />  <small class='wpgmza-info__small'>(0 - 1.0) example: 0.5 for 50%</small></td>   
                    </tr>
                    <tr>
                        <td>".__("On Hover Line Color","wp-google-maps")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","wp-google-maps")."\"/></td>   
                    </tr>
                    <tr>
                        <td>".__("On Hover Fill Color","wp-google-maps")."</td><td><input disabled type=\"text\" value=\"".__("Pro version only","wp-google-maps")."\"/></td>  
                    </tr>
                    <tr>
                        <td>".__("On Hover Opacity","wp-google-maps")."</td><td><input disabled type=\"text\"value=\"".__("Pro version only","wp-google-maps")."\" /></td>   
                    </tr>
                    <tr>
                        <td>".__("Show Polygon","wp-google-maps")."</td>
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
                        <div id=\"wpgmza_map\" >&nbsp;</div>
                        <p>
                            <ul style=\"list-style:initial;\" class='update-nag update-blue update-slim update-map-overlay'>
                               
                                <li style=\"margin-left:30px;\">Click on the map to insert a vertex.</li>
                                <li style=\"margin-left:30px;\">Click on a vertex to remove it.</li>
                                <li style=\"margin-left:30px;\">Drag a vertex to move it.</li>
                            </ul>
                        </p>
                    </div>
                    
                    <div class='clear'></div>
                     <p style='clear: both;' >Polygon data:<br /><textarea name=\"wpgmza_polygon\" id=\"poly_line_list\" style=\"height:100px; background-color:#FFF; padding:5px; overflow:auto;\"></textarea>
                     <!-- <p style='clear: both;' >Polygon data (inner):<br /><textarea name=\"wpgmza_polygon_inner\" id=\"poly_line_list_inner\" style=\"width:90%; height:100px; border:1px solid #ccc; background-color:#FFF; padding:5px; overflow:auto;\">".esc_textarea($pol->innerpolydata)."</textarea> -->
                    <p class='submit'><a href='javascript:history.back();' class='button button-secondary' title='".__("Cancel")."'>".__("Cancel")."</a> <input type='submit' name='wpgmza_edit_poly' class='button-primary' value='".__("Save Polygon","wp-google-maps")." &raquo;' /></p>

                    </form>
                </div>


            </div>



        ";

    }



}

/**
 * Render polygons JS
 *
 * @todo  This needs to be converted to a native JS file with localized variables
 * 
 * @param  integer $mapid   Map ID
 * 
 * @return void
 */
function wpgmaps_b_admin_add_poly_javascript($mapid)
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
	
	$total_poly_array = wpgmza_b_return_polygon_id_array(sanitize_text_field($_GET['map_id']));
	
	foreach ($total_poly_array as $poly_id)
	{
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
		
		$localized_data['polygon_data'][$poly_id] = array(
			'strokeColor'		=> $linecolor,
			'fillOpacity'		=> $fillopacity,
			'strokeOpacity'		=> $lineopacity,
			'fillColor'			=> $fillcolor,
			'path'				=> $path_data
		);
	}
	
	$dependencies = wpgmza_get_legacy_pro_shape_editor_dependencies();
	
	wp_enqueue_style('wpgooglemaps-css', wpgmaps_get_plugin_url() . 'css/wpgmza_style.css');
	wp_enqueue_script('wpgmza-legacy-polygon-panel', wpgmaps_get_plugin_url() . 'js/legacy/legacy-polygon-panel.js', $dependencies);
	wp_localize_script('wpgmza-legacy-polygon-panel', 'wpgmza_legacy_polygon_panel_vars', $localized_data);
}

/**
 * Render polygon edit JS
 *
 * @todo  This needs to be converted to a native JS file with localized variables
 * 
 * @param  integer $mapid       Map ID
 * @param  integer $polyid      Polygon ID
 * 
 * @return void
 */
function wpgmaps_b_admin_edit_poly_javascript($mapid,$polyid)
{
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
	
	$total_poly_array = wpgmza_b_return_polygon_id_array(sanitize_text_field($_GET['map_id']));
	
	foreach ($total_poly_array as $poly_id)
	{
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
		
		$localized_data['polygon_data'][$poly_id] = array(
			'storkeColor'		=> $linecolor,
			'fillOpacity'		=> $fillopacity,
			'strokeOpacity'		=> $lineopacity,
			'fillColor'			=> $fillcolor,
			'path'				=> $path_data
		);
	}
	
	$dependencies = wpgmza_get_legacy_pro_shape_editor_dependencies();
	
	wp_enqueue_style('wpgooglemaps-css', wpgmaps_get_plugin_url() . 'css/wpgmza_style.css');
	wp_enqueue_script('wpgmza-legacy-polygon-panel', wpgmaps_get_plugin_url() . 'js/legacy/legacy-polygon-panel.js', $dependencies);
	wp_localize_script('wpgmza-legacy-polygon-panel', 'wpgmza_legacy_polygon_panel_vars', $localized_data);
}

/**
 * Returns the list of polygons displayed in the map editor
 *
 * @todo Build this as a hook or filter instead of a function call
 * 
 * @param  integer  $map_id Map ID
 * @param  boolean  $admin  Identify if user is admin or not
 * @param  string   $width  Width to be used for HTML output
 * @return string           List HTML
 */
function wpgmza_b_return_polygon_list($map_id,$admin = true,$width = "100%") {
    wpgmaps_debugger("return_marker_start");

    global $wpdb;
    global $wpgmza_tblname_poly;
    $wpgmza_tmp = "";

    $results = $wpdb->get_results( $wpdb->prepare("SELECT * FROM $wpgmza_tblname_poly WHERE `map_id` = %d ORDER BY `id` DESC", intval($map_id)) );
    
    $wpgmza_tmp .= "
        
        <table id=\"wpgmza_table_poly\" class=\"display\" cellspacing=\"0\" cellpadding=\"0\" style=\"width:$width;\">
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
        $poly_array = wpgmza_b_return_polygon_array($result->id);
        if (is_array($poly_array)) {
            foreach ($poly_array as $poly_single) {
                $poly_data .= $poly_single.",";
            } 
        }
        if (isset($result->polyname) && $result->polyname != "") { $polygon_name = $result->polyname; } else { $polygon_name = "Polygon".$result->id; }
        
        $wpgmza_tmp .= "
            <tr id=\"wpgmza_poly_tr_".intval($result->id)."\">
                <td height=\"40\">".intval($result->id)."</td>
                <td height=\"40\">".esc_attr(stripslashes($polygon_name))."</td>
                <td width='170' align='left'>
                    <a href=\"".esc_url(get_option('siteurl'))."/wp-admin/admin.php?page=wp-google-maps-menu&action=edit_poly&map_id=".intval($map_id)."&poly_id=".intval($result->id)."\" title=\"".__("Edit","wp-google-maps")."\" class=\"wpgmza_edit_poly_btn button\" id=\"".intval($result->id)."\"><i class=\"fa fa-edit\"> </i></a> 
                    <a href=\"javascript:void(0);\" title=\"".__("Delete this polygon","wp-google-maps")."\" class=\"wpgmza_poly_del_btn button\" id=\"".intval($result->id)."\"><i class=\"fa fa-times\"> </i></a>
                </td>
            </tr>";
        
    }
    $wpgmza_tmp .= "</tbody></table>";
    

    return $wpgmza_tmp;
    
}

/**
 * Retrieve polygon options from DB
 * 
 * @param  integer $poly_id Polygon ID
 * @return array            MYSQL Array
 */
function wpgmza_b_return_poly_options($poly_id) {
    global $wpdb;
    global $wpgmza_tblname_poly;
	
    $results	= $wpdb->get_results($wpdb->prepare("SELECT * FROM $wpgmza_tblname_poly WHERE `id` = %d LIMIT 1",intval($poly_id)) );
	
	if(empty($results))
		return;
	
	$data		= $results[0];
	
	return wpgmza_convert_shape_options_to_legacy_format($data);
}

/**
 * Return the polygon data in the correct format
 * 
 * @param  integer $poly_id Polygon ID
 * @return array            Poly data array
 */
function wpgmza_b_return_polygon_array($poly_id) {
    global $wpdb;
    global $wpgmza_tblname_poly;
	
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $wpgmza_tblname_poly WHERE `id` = %d LIMIT 1",intval($poly_id)) );
	
	if(empty($results))
		return null;
	
	$polyline = $results[0];
	$polydata = $polyline->polydata;
	
	if(($json = json_decode($polydata)) !== false)
		return wpgmza_convert_json_geometry_to_legacy_format($json);
	
	$regex = '/-?(\d+)(\.\d+)?,\s*-?(\d+)(\.\d+)?/';
	
	if(!preg_match_all($regex, $polydata, $m))
		return array();
	
	return $m[0];
}

/**
 * Return polygon ID array
 *
 * This is used when creating the JSON array of all the polygons and their unique options
 * 
 * @param  integer  $map_id     Map ID
 * @return array                Array of IDs
 */
function wpgmza_b_return_polygon_id_array($map_id) {
    global $wpdb;
    global $wpgmza_tblname_poly;
    $ret = array();
    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $wpgmza_tblname_poly WHERE `map_id` = %d",intval($map_id)) );
    foreach ( $results as $result ) {
        $current_id = $result->id;
        $ret[] = $current_id;
        
    }
    return $ret;
}

function wpgmza_b_pro_add_polyline($mid) {
    global $wpgmza_tblname_maps;
    global $wpdb;
    if ($_GET['action'] == "add_polyline" && isset($mid)) {

        if( function_exists('google_maps_api_key_warning' ) ){ google_maps_api_key_warning(); }

        $res = wpgmza_get_map_data($mid);
        echo "
            

            
          
           <div class='wrap'>
                <h1>WP Go Maps</h1>
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

        $pol->polydata = esc_textarea($pol->polydata);

        echo "
            

           <div class='wrap'>
                <h1>WP Go Maps</h1>
                <div class='wide'>

                    <h2>".__("Edit Polyline","wp-google-maps")."</h2>
                    <form action='?page=wp-google-maps-menu&action=edit&map_id=".esc_attr($mid)."' method='post' id='wpgmaps_edit_poly_form'>
                    <input type='hidden' name='wpgmaps_map_id' id='wpgmaps_map_id' value='".esc_attr($mid)."' />
                    <input type='hidden' name='wpgmaps_poly_id' id='wpgmaps_poly_id' value='".esc_attr(intval($_GET['poly_id']))."' />
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
			'strokeOpacity'		=> $lineopacity,
			'path'				=> $path_data
		);
	}
	
	$dependencies = wpgmza_get_legacy_pro_shape_editor_dependencies();
	
	wp_enqueue_style('wpgooglemaps-css', wpgmaps_get_plugin_url() . 'css/wpgmza_style.css');
	wp_enqueue_script('wpgmza-legacy-polyline-panel', wpgmaps_get_plugin_url() . 'js/legacy/legacy-polyline-panel.js', $dependencies);
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
	
	$dependencies = wpgmza_get_legacy_pro_shape_editor_dependencies();
	
	wp_enqueue_style('wpgooglemaps-css', wpgmaps_get_plugin_url() . 'css/wpgmza_style.css');
	wp_enqueue_script('wpgmza-legacy-polyline-panel', wpgmaps_get_plugin_url() . 'js/legacy/legacy-polyline-panel.js', $dependencies);
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
            <tr id=\"wpgmza_poly_tr_".intval($result->id)."\">
                <td height=\"40\">".intval($result->id)."</td>
                <td height=\"40\">".esc_attr(stripslashes($poly_name))."</td>
                <td width='170' align='left'>
                    <a href=\"".esc_url(get_option('siteurl'))."/wp-admin/admin.php?page=wp-google-maps-menu&action=edit_polyline&map_id=".intval($map_id)."&poly_id=".intval($result->id)."\" title=\"".__("Edit","wp-google-maps")."\" class=\"wpgmza_edit_poly_btn button\" id=\"".intval($result->id)."\"><i class=\"fa fa-edit\"> </i></a> 
                    <a href=\"javascript:void(0);\" title=\"".__("Delete this polyline","wp-google-maps")."\" class=\"wpgmza_polyline_del_btn button\" id=\"".intval($result->id)."\"><i class=\"fa fa-times\"> </i></a>
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
	
    $results	= $wpdb->get_results($wpdb->prepare("SELECT * FROM $wpgmza_tblname_polylines WHERE `id` = %d LIMIT 1",intval($poly_id)) );
	
	if(empty($results))
		return;
	
	$data		= $results[0];
	
	return wpgmza_convert_shape_options_to_legacy_format($data);
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
	
	if(($json = json_decode($polydata)) !== false)
		return wpgmza_convert_json_geometry_to_legacy_format($json);
	
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

/*
 * Legacy admin menu
 */
function wpgmaps_admin_menu() {
    $wpgmza_settings = get_option("WPGMZA_OTHER_SETTINGS");
    
    if (isset($wpgmza_settings['wpgmza_settings_access_level'])) { $access_level = $wpgmza_settings['wpgmza_settings_access_level']; } else { $access_level = "manage_options"; }
	
    add_menu_page('WP Go Maps', __('Maps','wp-google-maps'), $access_level, 'wp-google-maps-menu', 'wpgmaps_menu_layout', wpgmaps_get_plugin_url()."images/menu-icon.png");
    
	add_submenu_page(
		'wp-google-maps-menu',
		'WP Go Maps - Maps',
		__('Maps', 'wp-google-maps'),
		$access_level,
		'wp-google-maps-menu',
		'wpgmaps_menu_layout'
	);
	
    if (function_exists('wpgmaps_menu_category_layout')) { add_submenu_page('wp-google-maps-menu', 'WP Go Maps - Categories', __('Categories','wp-google-maps'), $access_level , 'wp-google-maps-menu-categories', 'wpgmaps_menu_category_layout'); }
	
    if (function_exists('wpgmza_register_pro_version'))
	{
		add_submenu_page(
			'wp-google-maps-menu', 
			'WP Go Maps - Advanced Options', 
			__('Advanced','wp-google-maps'), 
			$access_level , 
			'wp-google-maps-menu-advanced',
			'wpgmaps_menu_advanced_layout'
		);
		
		remove_submenu_page("wp-google-maps-menu", "wp-google-maps-menu-custom-fields");
		
		add_submenu_page(
			'wp-google-maps-menu',
			'WP Go Maps - Custom Fields',
			__('Custom Fields', 'wp-google-maps'),
			$access_level,
			'wp-google-maps-menu-custom-fields',
			'WPGMZA\\show_custom_fields_page'
		);
	}
	
    add_submenu_page('wp-google-maps-menu', 'WP Go Maps - Settings', __('Settings','wp-google-maps'), $access_level , 'wp-google-maps-menu-settings', 'wpgmaps_menu_settings_layout');
    add_submenu_page('wp-google-maps-menu', 'WP Go Maps - Support', __('Support','wp-google-maps'), $access_level , 'wp-google-maps-menu-support', 'wpgmaps_menu_support_layout');

	// add_submenu_page('wp-google-maps-menu', 'WP Go Maps - Credits', __('Credits', 'wp-google-maps'), $access_level, 'wp-google-maps-menu-credits', 'wpgmaps_menu_layout');
	
}

function wpgmaps_menu_layout() {
    
    $map_id = isset($_GET['map_id']) ? (int) intval($_GET['map_id']) : null;
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
            echo"<div class='wpgmza-support-notice' style='float:right; display:block; width:250px; height:65px; padding:6px; text-align:center; background-color: white;  border-top: 4px solid #0073AA; margin-right:17px;'><strong>".__("Experiencing problems with the plugin?","wp-google-maps")."</strong><br /><a href='http://www.wpgmaps.com/documentation/troubleshooting/' title='WP Go Maps Troubleshooting Section' target='_BLANK'>".__("See the troubleshooting manual.","wp-google-maps")."</a> <br />".__("Or ask a question on our ","wp-google-maps")." <a href='http://www.wpgmaps.com/forums/forum/' title='WP Go Maps Support Forum' target='_BLANK'>".__("Support forum.","wp-google-maps")."</a></div>
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
				
				$url = esc_url(get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu");
				
				echo "<script>window.location = \"$url\";</script>";
				
				return;
				
            } else {
                $res = wpgmza_get_map_data($map_id);
                echo "<h2>".__("Delete your map","wp-google-maps")."</h2><p>".__("Are you sure you want to delete the map","wp-google-maps")." <strong>\"".strip_tags($res->map_title)."?\"</strong> <br /><a href='?page=wp-google-maps-menu&s=1&action=trash&map_id=".$map_id."&s=1&nonce=$nonce'>".__("Yes","wp-google-maps")."</a> | <a href='?page=wp-google-maps-menu'>".__("No","wp-google-maps")."</a></p>";
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

    /* Developer Hook (Action) - Legacy backwards compatibiity action for older versions */ 
    do_action("wpgmza_check_map_editor_backwards_compat");


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
        echo "<tr id=\"record_".intval($result->id)."\">";
        echo "<td class='id column-id'>".intval($result->id)."</td>";
        echo "<td class='map_title column-map_title'><strong><big><a href=\"?page=wp-google-maps-menu&action=edit&map_id=".intval($result->id)."\" title=\"".__("Edit","wp-google-maps")."\">".stripslashes(strip_tags($result->map_title))."</a></big></strong><br /></td>";
        echo "<td class='map_width column-map_width'>".esc_html($result->map_width)."".stripslashes(esc_html($result->map_width_type))."</td>";
        echo "<td class='map_width column-map_height'>".esc_html($result->map_height)."".stripslashes(esc_html($result->map_height_type))."</td>";
        echo "<td class='type column-type'>".$map_type."</td>";
        echo "<td class='type column-type'><a class='page-title-action' href=\"?page=wp-google-maps-menu&action=edit&map_id=".intval($result->id)."\" title=\"".__("Edit","wp-google-maps")."\">".__("Edit","wp-google-maps")."</a> $trashlink</td>";
        echo "<td class='type column-type'><input class='wpgmza_copy_shortcode' type='text' readonly value='[wpgmza id=\"".intval($result->id)."\"]'/></td>";
        echo "</tr>";


    }
    echo "</table>";
}

if(!function_exists('wpgmza_return_marker_list'))
{
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
}

if(!function_exists('wpgmza_return_category_name'))
{
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

    /* Developer Hook (Action) - Enqueue additional scripts */ 
    do_action("wpgooglemaps_basic_hook_user_js_after_core");

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_mapid', $wpgmza_current_map_id );

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize', $res);
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_polygon_settings', $polygonoptions);
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_polyline_settings', $polylineoptions);

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_markerurl', wpgmaps_get_marker_url($wpgmza_current_map_id));


    if ($wpgmza_settings['wpgmza_settings_marker_pull'] == "0") {
        wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_marker_data', $markers);
    }
    
    /* Developer Hook (Filter) - Modify settings object for localization on frontend */
    $wpgmza_settings = apply_filters("wpgmza_basic_filter_localize_settings",$wpgmza_settings);

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_localize_global_settings', $wpgmza_settings);

    wp_localize_script( 'wpgmaps_core', 'wpgmaps_lang_km_away', __("km away","wp-google-maps"));
    wp_localize_script( 'wpgmaps_core', 'wpgmaps_lang_m_away', __("miles away","wp-google-maps"));

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
		
		var_dump("Woo!");
		exit;

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
		$latlng				= new \WPGMZA\LatLng(floatval($_POST['wpgmaps_marker_lat']), floatval($_POST['wpgmaps_marker_lng']));
		
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
		
		$lat				= floatval($_POST['wpgmaps_marker_lat']);
		$lng				= floatval($_POST['wpgmaps_marker_lng']);
		
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
	if (isset($_POST['wpgmza_custom_js'])) { $wpgmza->settings['wpgmza_custom_js'] = sanitize_text_field($_POST['wpgmza_custom_js']); }
	
    if (isset($_POST['user_interface_style']))
		$wpgmza->settings['user_interface_style'] = esc_attr(sanitize_text_field($_POST['user_interface_style']));
	
	if (isset($_POST['wpgmza_marker_xml_location'])) { update_option("wpgmza_xml_location",sanitize_text_field($_POST['wpgmza_marker_xml_location'])); }
	if (isset($_POST['wpgmza_marker_xml_url'])) { update_option("wpgmza_xml_url",sanitize_text_field($_POST['wpgmza_marker_xml_url'])); }
	
	if(current_user_can('administrator'))
		if (isset($_POST['wpgmza_access_level'])) { $wpgmza->settings['wpgmza_settings_access_level'] = sanitize_text_field($_POST['wpgmza_access_level']); }
	
	if (isset($_POST['wpgmza_settings_marker_pull'])) { $wpgmza->settings['wpgmza_settings_marker_pull'] = sanitize_text_field($_POST['wpgmza_settings_marker_pull']); }

	// Maps -> Settings -> Store Locator -> option Store Locator Radius
	if (isset($_POST['wpgmza_store_locator_radii'])) { $wpgmza->settings['wpgmza_store_locator_radii'] = sanitize_text_field($_POST['wpgmza_store_locator_radii']); }

	if (isset($_POST['wpgmza_settings_enable_usage_tracking'])) { $wpgmza->settings['wpgmza_settings_enable_usage_tracking'] = sanitize_text_field($_POST['wpgmza_settings_enable_usage_tracking']); }
    
    /* Developer Hook (Filter) - Legacy, unused, storage hook */
	$arr = apply_filters("wpgooglemaps_filter_save_settings", $wpgmza->settings);
	
	$wpgmza->settings->set($arr);
	
	if( isset( $_POST['wpgmza_google_maps_api_key'] ) ){ update_option( 'wpgmza_google_maps_api_key', sanitize_text_field( trim($_POST['wpgmza_google_maps_api_key'] )) ); }
	
	if($_POST['wpgmza_settings_marker_pull'] == 1)
        wpgmaps_update_all_xml_file();

	wp_redirect(get_admin_url() . 'admin.php?page=wp-google-maps-menu-settings');
	exit;
}

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

if (function_exists('wpgmaps_head_pro' )) {
    add_action( 'admin_head', 'wpgmaps_head_pro' );
} else {
	
    if (function_exists( 'wpgmaps_pro_activate' ) && floatval($wpgmza_version) < 5.24) {
        add_action( 'admin_notices', function() {
			
			?>
			<div class="notice notice-error">
				<p>
					<?php
					_e('<strong>WP Go Maps:</strong> The Pro add-on is not compatible with this version of WP Go Maps. Please update your Pro addon to 5.24 or above', 'wp-google-maps');
					?>
				</p>
			</div>
			<?php
			
		});
    } else {
        add_action( 'admin_head', 'wpgmaps_head' );
    }
    
}

if(!function_exists('wpgmaps_trash_map'))
{
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
}
