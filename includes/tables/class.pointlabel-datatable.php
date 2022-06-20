<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class PointlabelDataTable extends DataTable{
	public function __construct($ajax_parameters=null, $datatable_options=null){
		global $WPGMZA_TABLE_NAME_POINT_LABELS;
		DataTable::__construct($WPGMZA_TABLE_NAME_POINT_LABELS, $ajax_parameters, $datatable_options);
	}
	
	public function getColumns(){
		return array(
			'id'			=> __('ID',				'wp-google-maps'),
			'name'			=> __('Name', 			'wp-google-maps')
		);
	}
}