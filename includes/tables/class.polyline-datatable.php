<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class PolylineDataTable extends DataTable
{
	public function __construct($ajax_parameters=null, $datatable_options=null)
	{
		global $WPGMZA_TABLE_NAME_POLYLINES;
		
		DataTable::__construct($WPGMZA_TABLE_NAME_POLYLINES, $ajax_parameters, $datatable_options);
	}
	
	public function getColumns()
	{
		return array(
			'id'			=> __('ID',				'wp-google-maps'),
			'polyname'		=> __('Name', 			'wp-google-maps')
		);
	}
}