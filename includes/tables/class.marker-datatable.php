<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class MarkerDataTable extends DataTable
{
	public function __construct($ajax_parameters=null, $datatable_options=null)
	{
		global $wpdb;
		
		DataTable::__construct("{$wpdb->prefix}wpgmza", $ajax_parameters, $datatable_options);
	}
	
	protected function getColumns()
	{
		return array(
			'title'			=> __('Title',			'wp-google-maps'),
			'category'		=> __('Category',		'wp-google-maps'),
			'address'		=> __('Address',		'wp-google-maps'),
			'description'	=> __('Description',	'wp-google-maps')
		);
	}
	
	protected function getWhereClause($input_params, &$query_params, $clause_for_total=false)
	{
		global $wpgmza;
		
		$clause = AjaxTable::getWhereClause($input_params, $query_params, $clause_for_total);
		
		if(!(is_admin() || (isset($_SERVER['HTTP_REFERER']) && preg_match('/page=wp-google-maps-menu/', $_SERVER['HTTP_REFERER']) && $wpgmza->isUserAllowedToEdit())))
		{
			$clause .= ' AND approved=%d';
			$query_params[] = 1;
		}
		
		return $clause;
	}
}
