<?php

namespace WPGMZA;

require_once(WPGMZA_DIR . 'php/class.datatable.php');

class MarkerTable extends DataTable
{
	private $map;
	private $columns;
	
	public function __construct($map, $columns=null)
	{
		$columns = apply_filters( 'wpgmza_basic_markertable_columns', $columns );

		if($columns == null)
			$this->columns = array(
				'id'		=> __('ID', 'wp-google-maps'),
				'address'	=> __('Address', 'wp-google-maps')
			);
		else
			$this->columns = $columns;
		
		DataTable::__construct('wpgmza_list_markers', $this->columns);
		
		$this->map = $map;
		$this->querySelector('table')->setAttribute('data-map-id', $map->id); // HERE!
	}
	
	/** 
	 * Override this function to add additional columns to the query
	 * @return array
	 */
	protected function filterColumns(&$columns)
	{
		return $columns;
	}
	
	/**
	 * Override this function to manipulate data before it's converted to datatables numeric array format
	 * @return array
	 */
	protected function filterResults(&$rows)
	{
		return $rows;
	}
	
	/**
	 * Gets the WHERE clause for the marker table query
	 * @return string
	 */
	protected function getWhereClause()
	{
		return "map_id=" . (int)$this->map->id;
	}
	
	/**
	 * Returns a list of markers in format accepted by DataTables
	 * @return object
	 */
	public function handleAjaxRequest($fields)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		$params = array();
		
		// Get marker columns
		$table_columns = $wpdb->get_results("SHOW COLUMNS FROM $WPGMZA_TABLE_NAME_MARKERS");
		$table_column_names = array();
		foreach($table_columns as $col)
			array_push($table_column_names, $col->Field);
		
		// Get total marker count
		$total_markers = $wpdb->get_var("SELECT COUNT(id) FROM $WPGMZA_TABLE_NAME_MARKERS WHERE " . $this->getWhereClause());
		
		// Get markers
		// NB: !!! IMPORTANT !!! Please leave lat and lng as the last parameters, the front end depends on it
		$keys = array_keys($this->columns);
		
		$order_column = $keys[ (int)$_POST['order'][0]['column'] ];
		$order_dir = ($_POST['order'][0]['dir'] != 'asc' ? 'desc' : 'asc');
		$start = (int)$_POST['start'];
		$length = (int)$_POST['length'];
		$search = !empty($_POST['search']['value']);
		
		$columns = $this->filterColumns($keys);
		$imploded = implode(',', $columns);
		
		$qstr = "SELECT SQL_CALC_FOUND_ROWS $imploded, Y(latlng) AS lat, X(latlng) AS lng FROM $WPGMZA_TABLE_NAME_MARKERS ";
		
		$qstr .= "WHERE " . $this->getWhereClause() . " ";
		
		$having = array();
		if($search)
		{
			$term = $_POST['search']['value'];
			$having_subclauses = array();
			
			foreach($this->columns as $key => $label)
			{
				array_push($having_subclauses, "$key LIKE %s");
				array_push($params, "%$term%");
			}
			
			if(!empty($having_subclauses))
				array_push($having, implode(' OR ', $having_subclauses));
		}
		
		if(!empty($having))
			$qstr .= ' HAVING ' . implode(' AND ', $having);
		
		$numExcludedIDs = 0;
		if(!empty($_POST['exclude_ids']))
		{
			$raw_ids = explode(',', $_POST['exclude_ids']);
			
			// Sanitize IDs by calling intval on all of them
			$exclude_ids = array_map('intval', $raw_ids);
			$exclude_ids_string = implode(',', $exclude_ids);
			
			// Remember the number of excluded IDs and remove them from the count
			$numExcludedIDs = count($exclude_ids);
			
			$qstr .= " AND id NOT IN ($exclude_ids_string)";
		}
		
		$qstr .= " ORDER BY $order_column $order_dir ";
		
		if($length > 0)
			$qstr .= "LIMIT $start, $length";
		
		if(!empty($params))
			$stmt = $wpdb->prepare($qstr, $params);
		else
			$stmt = $qstr;
		$rows = $wpdb->get_results($stmt);
		
		$this->filterResults($rows);
		
		foreach($rows as $key => $obj)
		{
			$rows[$key] = array_values(
				get_object_vars($obj)
			);
		}
		
		$found_rows = $wpdb->get_var('SELECT FOUND_ROWS()');
		
		$data = (object)array(
			'draw' => apply_filters( 'wpgmza_basic_markertable_ajax_request_draw', (int)$_POST['draw'] ),
			'recordsTotal' => apply_filters( 'wpgmza_basic_markertable_ajax_request_records_total', $total_markers - $numExcludedIDs ),
			'recordsFiltered' => apply_filters( 'wpgmza_basic_markertable_ajax_request_records_filtered', $found_rows ),
			'data' => apply_filters( 'wpgmza_basic_markertable_ajax_request_data', $rows ),
			'query' => apply_filters( 'wpgmza_basic_markertable_ajax_request_query', $stmt )
		);
		
		return $data;
	}
}

?>