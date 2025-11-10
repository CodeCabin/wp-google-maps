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
		global $wpgmza;

		HeatmapDataTable::__construct($ajax_parameters);

		$buttonClass = $wpgmza->internalEngine->getButtonClass('button');
		$this->element->import('<div class="wpgmza-marker-listing__actions">
			<span>&#x21b3;</span>
			<button class="wpgmza ' . $buttonClass . ' select_all_features" type="button">' . __('Select All', 'wp-google-maps') . '</button>
			<button class="wpgmza ' . $buttonClass . ' bulk_delete" type="button">' . __('Bulk Delete', 'wp-google-maps') . '</button>
		</div>');
	}
	
	public function getColumns()
	{
		$columns = array(
			'mark' => __('Mark', 'wp-google-maps')
		);

		$columns = array_merge($columns, HeatmapDataTable::getColumns());
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

	protected function getSearchClause($input_params, &$query_params, $exclude_columns=null)
	{
		return HeatmapDataTable::getSearchClause($input_params, $query_params, array(
			'mark',
			'action'
		));
	}
}