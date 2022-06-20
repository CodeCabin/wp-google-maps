<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class RectangleDataTable extends DataTable
{
	public function __construct($ajax_parameters=null, $datatable_options=null)
	{
		global $WPGMZA_TABLE_NAME_RECTANGLES;
		
		DataTable::__construct($WPGMZA_TABLE_NAME_RECTANGLES, $ajax_parameters, $datatable_options);
	}
	
	public function getColumns()
	{
		return array(
			'id'			=> __('ID',				'wp-google-maps'),
			'name'			=> __('Name', 			'wp-google-maps')
		);
	}
}