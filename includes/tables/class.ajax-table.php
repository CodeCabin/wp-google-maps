<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class AjaxTable extends Table
{
	protected $lastInputParams;
	
	public function __construct($table_name, $rest_api_route, $ajax_parameters=null)
	{
		Table::__construct($table_name);
		
		$this->element->setAttribute('data-wpgmza-php-class', get_called_class());
		
		$this->setRestAPIRoute($rest_api_route);
		
		if($ajax_parameters)
			$this->setAjaxParameters($ajax_parameters);
	}
	
	public function getAjaxParameters()
	{
		return $this->getAttributeParams('data-wpgmza-ajax-parameters');
	}
	
	public function setAjaxParameters($ajax_parameters)
	{
		$this->setAttributeParams('data-wpgmza-ajax-parameters', $ajax_parameters);
	}
	
	protected function getAttributeParams($name)
	{
		if(!$this->element->hasAttribute($name))
			return (object)array();
		
		return json_decode($this->element->getAttribute($name));
	}
	
	protected function setAttributeParams($name, $params)
	{
		if(!(is_array($params) || is_object($params)))
			throw new \Exception('Parameters must be JSON serializable');
		
		$obj = $this->getAttributeParams($name);
		
		foreach($params as $key => $value)
			$obj->{$key} = $value;
		
		$this->element->setAttribute($name, json_encode($obj));
	}
	
	protected function getRestAPIRoute()
	{
		return $this->element->getAttribute('data-wpgmza-rest-api-route');
	}
	
	protected function setRestAPIRoute($route)
	{
		if(!is_string($route))
			throw new \Exception('Invalid REST API route');
		
		$this->element->setAttribute('data-wpgmza-rest-api-route', $route);
	}
	
	protected function getColumns()
	{
		throw new \Exception('Abstract function called');
	}
	
	protected function getColumnNameByIndex($index)
	{
		$i = 0;
		$columns = $this->getColumns();
		
		foreach($columns as $key => $value)
		{
			if($i++ == $index)
				return $key;
		}
		
		return null;
	}
	
	protected function getOrderBy($input_params, $column_keys)
	{
		return 'id';
	}
	
	protected function getOrderDirection($input_params)
	{
		return 'DESC';
	}
	
	protected function getWhereClause($input_params, &$query_params, $clause_for_total=false)
	{
		global $wpgmza;
		
		$clauses = array();
		
		if(isset($input_params['overrideMarkerIDs']))
		{
			$markerIDs = $input_params['overrideMarkerIDs'];
			
			if(is_string($markerIDs))
				$markerIDs = explode(',', $markerIDs);
			
			if(empty($markerIDs))
				return '0';
			else
				return 'id IN (' . implode(', ', array_map('intval', $markerIDs)) . ')';
		}
		
		if(isset($input_params['mashup_ids']))
		{
			// NB: This is Pro logic and should be moved ideally
			$mashup_ids		= $input_params['mashup_ids'];
			$placeholders	= implode(',', array_fill(0, count($mashup_ids), '%d'));
			
			$clauses['mashup_ids'] = 'map_id IN (' . $placeholders. ')';
			
			for($i = 0; $i < count($mashup_ids); $i++)
				$query_params[] = $mashup_ids[$i];
		}
		else if(isset($input_params['map_id']))
		{
			$clauses['map_id'] = 'map_id=%d';
			$query_params[] = $input_params['map_id'];
		}
		
		// NB: Moved approval check to MarkerDataTable
		
		if(!$clause_for_total)
		{
			$search_clause = $this->getSearchClause($input_params, $query_params);
			if(!empty($search_clause))
				$clauses['search'] = $search_clause;
		}
		
		if(empty($clauses))
			return '1';
		
		return implode(' AND ', $clauses);
	}
	
	protected function getSearchClause($input_params, &$query_params, $exclude_columns=null)
	{
		global $wpdb;
		
		if(isset($input_params['overrideMarkerIDs']))
			return "";
		
		if(empty($input_params['search']['value']))
			return "";
		
		$columns = $this->getColumns();
		
		$clauses = array();
		$term = $input_params['search']['value'];
		$subclauses = array();
		
		foreach($columns as $key => $label)
		{
			if($exclude_columns && array_search($key, $exclude_columns) !== false)
				continue;
			
			array_push($subclauses, "$key LIKE %s");
			array_push($query_params, "%%" . $wpdb->esc_like($term) . "%%");
		}
		
		if(empty($subclauses))
			return '';
		
		$result = "(" . implode(' OR ', $subclauses) . ")";
		
		return $result;
	}
	
	/**
	 * Gets the HAVING clause for the table query
	 * @return string
	 */
	protected function getHavingClause($input_params, &$query_params, $exclude_columns=null)
	{
		return '';
	}
	
	/** 
	 * Override this function to add additional columns to the query
	 * @return array
	 */
	protected function filterColumns(&$columns, $input_params)
	{
		foreach($columns as $key => $value)
		{
			if($value == 'mark')
				$columns[$key] = '\'<input type="checkbox" name="mark"/>\' AS mark';
			//else
				//$columns[$key] = "`$value`";
		}
		
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
	 * Function can be used to override order by column
	 * @return string
	 */
	protected function filterOrderBy($orderBy, $keys)
	{
		return $orderBy;
	}
	
	/**
	 * Function can be used to override order by column
	 * @return string
	 */
	protected function filterOrderDirection($orderDirection)
	{
		return $orderDirection;
	}
	
	protected function filterOrderClause($clause)
	{
		return $clause;
	}
	
	protected function getSQLBeforeWhere($input_params, &$query_params)
	{
		return "";
	}
	
	protected function getSQLAfterWhere($input_params, &$query_params)
	{
		return "";
	}
	
	protected function buildQueryString($columns, $where, $having, $input_params, &$query_params)
	{
		$imploded = implode(',', $columns);
		/**
		 * Modified: 2021-10-11
		 * Change: Remove 'SQL_CALC_FOUND_ROWS' as it is being deprecated
		 * Reason: Some sites experiencing issues with this modifier and subsequent "FOUND_ROWS()" calls as it is being deprecated
		 * Author: Dylan Auty
		*/
		$qstr = "SELECT $imploded FROM {$this->table_name} " . $this->getSQLBeforeWhere($input_params, $query_params) . " WHERE $where " . $this->getSQLAfterWhere($input_params, $query_params, $where);
		
		if(!empty($having))
			$qstr .= " HAVING $having";
		
		return $qstr;
	}
	
	protected function buildCountQueryString($input_params, &$count_query_params)
	{
		$count_where = $this->getWhereClause($input_params, $count_query_params, true);
		
		return "SELECT COUNT(id) FROM {$this->table_name} WHERE $count_where";
	}

	protected function buildFilteredCountQueryString($input_params, &$count_query_params){
		$count_where = $this->getWhereClause($input_params, $count_query_params, false);
		return "SELECT COUNT(id) FROM {$this->table_name} WHERE $count_where";
	}
	
	public function getRecords($input_params)
	{
		global $wpdb;
		global $wpgmza;
		
		// Remember input parameters
		$this->lastInputParams = $input_params;
		
		// Build query
		$columns = $this->getColumns();
		$keys = array_keys($columns);
		
		$query_params = array();
		$total_query_params = array();
		
		// Where / Having
		$where = $this->getWhereClause($input_params, $query_params);
		$having = $this->getHavingClause($input_params, $query_params);
		
		// Order by
		$order_column = $this->filterOrderBy( $this->getOrderBy($input_params, $keys), $keys );
		$order_dir = $this->filterOrderDirection( $this->getOrderDirection($input_params) );
		
		// Columns to select
		$columns = $this->filterColumns($keys, $input_params);
		
		// Build query string
		$qstr = $this->buildQueryString($columns, $where, $having, $input_params, $query_params);
		
		// This code allows for more natural numeric sorting on text fields, not just numeric fields
		if(empty($order_column))
			$order_column = 'id';
		if(empty($order_dir))
			$order_dir = 'ASC';
		
		// NB: Removed ISNULL({$order_column}), {$order_column}+0 {$order_dir}, as this was giving unpredictable results
		$qstr .= " ORDER BY " . $this->filterOrderClause($order_column) . " {$order_dir}";
		//$qstr .= " ORDER BY " . $this->filterOrderClause("ISNULL({$order_column}), {$order_column}+0 {$order_dir}, {$order_column} {$order_dir}");
		
		// Limit
		if(isset($input_params['length']))
		{
			$length = $input_params['length'];
			if(isset($length) && 
				$length != '-1' && 
				!preg_match('/^all$/i', $length))
			{
				$qstr .= " LIMIT " . intval($input_params['length']);

				if(isset($input_params['start']))
					$qstr .= " OFFSET " . intval($input_params['start']);
			}
		}
		
		// Total count
		$count_query_params = array();
		$count_qstr = $this->buildCountQueryString($input_params, $count_query_params);
		
		if(!empty($query_params)){
			$stmt = $wpdb->prepare($count_qstr, $count_query_params);
		} else {
			$stmt = $count_qstr;
		}
		
		$total_count = (int)$wpdb->get_var($stmt);
		
		// Body
		if(!empty($query_params)){
			$stmt = $wpdb->prepare($qstr, $query_params);
		} else{
			$stmt = $qstr;
		}

		$rows = $wpdb->get_results($stmt);
		
		$this->filterResults($rows);
		
		// Found rows
		// DEPRECATED AS PER NOTES RE: MySQL 8.0.17 -> This now requires a separate count query as seen
		// $found_rows = $wpdb->get_var('SELECT FOUND_ROWS()'); 
		$filtered_query_params = array();
		$filtered_count_qstr = $this->buildFilteredCountQueryString($input_params, $filtered_query_params);
		if(!empty($filtered_query_params)){
			$stmt = $wpdb->prepare($filtered_count_qstr, $filtered_query_params);
		} else {
			$stmt = $filtered_count_qstr;
		}

		$found_rows = (int)$wpdb->get_var($stmt);
		
		// Meta
		$meta = array();
		foreach($rows as $key => $value){
			$meta[$key] = (array) $value;
		}
		
		$result = (object)array(
			'recordsTotal'		=> $total_count,
			'recordsFiltered'	=> $found_rows,
			'data'				=> apply_filters('wpgmza_ajax_table_records', $rows),
			'meta'				=> apply_filters('wpgmza_ajax_table_meta', $meta)
		);
		
		if($wpgmza->isInDeveloperMode())
			$result->query		= $stmt;
		
		return $result;
	}
	
	public function data($input_params)
	{
		return $this->getRecords($input_params);
	}
}
