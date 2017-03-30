<?php

namespace WPGMZA;

require_once(WPGMZA_DIR . 'php/class.datatable.php');

class MarkerTable extends DataTable
{
	private $map_id;
	private $columns;
	
	public function __construct($map_id)
	{
		$this->columns = array(
			'id'		=> 'ID',
			'address'	=> 'Address'
		);
		
		DataTable::__construct('wpgmza_list_markers', $this->columns);
		
		$this->map_id = $map_id;
		$this->querySelector('table')->setAttribute('data-map-id', $map_id);
	}
	
	/**
	 * Returns a list of markers in format accepted by DataTables
	 * @return object
	 */
	public function handleAjaxRequest($fields)
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		// Get total marker count
		$total_markers = $wpdb->get_var("SELECT COUNT(id) FROM $WPGMZA_TABLE_NAME_MARKERS");
		
		// Get markers
		$keys = array_keys($this->columns);
		$imploded = implode(',', $keys);
		$qstr = "SELECT SQL_CALC_FOUND_ROWS $imploded FROM $WPGMZA_TABLE_NAME_MARKERS ";
		$clauses = array('map_id=%d');
		$params = array($this->map_id);
		
		$order_column = $keys[ (int)$_POST['order'][0]['column'] ];
		$order_dir = ($_POST['order'][0]['dir'] != 'asc' ? 'desc' : 'asc');
		$start = (int)$_POST['start'];
		$length = (int)$_POST['length'];
		$search = !empty($_POST['search']['value']);
		
		if($search)
		{
			$term = $_POST['search']['value'];
			$subclauses = array();
			
			foreach($this->columns as $key => $label)
			{
				array_push($subclauses, "$key LIKE %s");
				array_push($params, "%$term%");
			}
			
			array_push($clauses, implode(' OR '), $subclauses);
		}
		
		$qstr .= 'WHERE ' . implode(' AND ', $clauses);
		
		$qstr .= " ORDER BY $order_column $order_dir LIMIT $start, $length";
		
		$stmt = $wpdb->prepare($qstr, $params);
		$rows = $wpdb->get_results($stmt);
		
		foreach($rows as $key => $obj)
		{
			$rows[$key] = array_values(
				get_object_vars($obj)
			);
		}
		
		$found_rows = $wpdb->get_var('SELECT FOUND_ROWS()');
		
		$data = (object)array(
			'draw' => (int)$_POST['draw'],
			'recordsTotal' => $total_markers,
			'recordsFiltered' => $found_rows,
			'data' => $rows
		);
		
		return $data;
	}
}

?>