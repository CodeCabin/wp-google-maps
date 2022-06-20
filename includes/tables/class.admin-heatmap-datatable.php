<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

require_once(plugin_dir_path(__FILE__) . 'trait.admin-feature-datatable.php');

class AdminHeatmapDataTable extends HeatmapDataTable
{
	use AdminFeatureDatatable;
	
	public function __construct($ajax_parameters=null)
	{
		HeatmapDataTable::__construct($ajax_parameters);
	}
	
	public function getColumns()
	{
		$columns = HeatmapDataTable::getColumns();
		$columns['action'] = __('Action', 'wp-google-maps');
		return $columns;
	}
	
	protected function filterColumns(&$columns, $input_params)
	{
		HeatmapDataTable::filterColumns($columns, $input_params);
		
		if(($index = array_search('action', $columns)) !== false)
			$columns[$index] = $this->getActionButtons();
		
		return $columns;
	}
}