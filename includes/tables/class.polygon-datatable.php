<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class PolygonDataTable extends DataTable
{
	public function __construct($ajax_parameters=null, $datatable_options=null)
	{
		global $WPGMZA_TABLE_NAME_POLYGONS;
		
		DataTable::__construct($WPGMZA_TABLE_NAME_POLYGONS, $ajax_parameters, $datatable_options);
	}
	
	public function getColumns()
	{
		global $wpgmza;
		
		$columns = array(
			'id'			=> __('ID',				'wp-google-maps'),
			'polyname'			=> __('Name', 			'wp-google-maps'),
			'description'	=> __('Description', 	'wp-google-maps'),
			'link'			=> __('Link', 			'wp-google-maps')
		);

		if(!$wpgmza->internalEngine->isLegacy()){
			/* Atlas Novus Supports HTML, hide it so it doesn't get clunky */
			unset($columns['description']);
		}

		return $columns;
	}
}