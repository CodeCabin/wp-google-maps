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
}
