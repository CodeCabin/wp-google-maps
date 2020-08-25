<?php

// DEPRECATED: Should be loaded in Basic first.
if(!function_exists('wpgmza_get_marker_columns'))
{
	function wpgmza_get_marker_columns()
	{
		global $wpdb;
		global $wpgmza_tblname;
		
		if(empty($wpgmza_tblname))
			return;
		
		$columns = $wpdb->get_col("SHOW COLUMNS FROM $wpgmza_tblname");
		
		if(($index = array_search('lat', $columns)) !== false)
			array_splice($columns, $index, 1);
		if(($index = array_search('lng', $columns)) !== false)
			array_splice($columns, $index, 1);
		
		for($i = count($columns) - 1; $i >= 0; $i--)
			$columns[$i] = '`' . trim($columns[$i], '`') . '`';
		
		$columns[] = 'ST_X(latlng) AS lat';
		$columns[] = 'ST_Y(latlng) AS lng';
		
		return $columns;
	}
}