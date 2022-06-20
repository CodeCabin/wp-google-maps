<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class DataTable extends AjaxTable
{
	public function __construct($table_name, $ajax_parameters=null, $datatable_options=null)
	{
		global $wpgmza;
		
		AjaxTable::__construct($table_name, '/datatables/', $ajax_parameters);
		
		$this->element->setAttribute('data-wpgmza-datatable', 'true');

		if($wpgmza->isProVersion()){
			$this->element->setAttribute('data-wpgmza-pro-datatable', 'true');
		}
		
		if($datatable_options)
			$this->setDataTableOptions($datatable_options);
		
		if(!$wpgmza->isProVersion() || version_compare($wpgmza->getProVersion(), '8.1.0', '>='))
			$this->element->setAttribute('data-wpgmza-feature-type', $this->getFeatureType());
		
		$this->initTableDOM();
	}
	
	protected function getFeatureType()
	{
		$class	= get_called_class();
		$regex	= "/WPGMZA\\\\(Pro)?(Admin)?(.+?)DataTable$/";
		
		if(!preg_match($regex, $class, $m))
			throw new \Exception("Failed to match feature type in $class");
		
		return strtolower($m[3]);
	}
	
	protected function getColumns()
	{
		throw new \Exception('Abstract function called');
	}
	
	protected function getOrderBy($input_params, $column_keys)
	{
		$orderBy = $column_keys[ (int)$input_params['order'][0]['column'] ];
		
		if(!empty($orderBy))
			return $orderBy;
		
		// return "{$this->table_name}.id";
		return "id";
	}
	
	protected function getOrderDirection($input_params)
	{
		$orderDirection = $input_params['order'][0]['dir'] != 'asc' ? 'desc' : 'asc';
		
		if(!empty($orderDirection))
			return $orderDirection;
		
		return 'ASC';
	}
	
	public function getDataTableOptions()
	{
		return $this->getAttributeParams('data-wpgmza-datatable-options');
	}
	
	public function setDataTableOptions($options)
	{
		$this->setAttributeParams('data-wpgmza-datatable-options', $options);
	}
	
	public function data($input_params)
	{
		$result = AjaxTable::data($input_params);
		
		if(isset($input_params['draw']))
			$result->draw = $input_params['draw'];
		else
			$result->draw = (isset($_SERVER['HTTP_X_DATATABLES_DRAW']) ? $_SERVER['HTTP_X_DATATABLES_DRAW'] : 0);
		
		return $result;
	}
	
	protected function initTableDOM()
	{
		$columns = $this->getColumns();
		
		$this->element->import('
			<table class="display">
				<thead>
				</thead>
				<tfoot>
				</tfoot>
			</table>
		');
		
		$thead = $this->element->querySelector('thead');
		$tfoot = $this->element->querySelector('tfoot');
		
		foreach($columns as $name => $caption)
		{
			$th = $this->document->createElement('th');
			$th->setAttribute('data-wpgmza-column-name', $name);
			$th->setAttribute('id', "wpgmza_map_list_".$name);
			$th->appendText($caption);
			
			$thead->appendChild($th);
			// $tfoot->appendChild($th->cloneNode(true));
		}
	}
	
	public function getRecords($input_params)
	{
		$result = AjaxTable::getRecords($input_params);
		
		$indexed_rows = array();
		$indexed_meta = array();
		
		foreach($result->data as $key => $obj)
		{
			$indexed_rows[$key] = array_values(
				get_object_vars($obj)
			);
		}
		
		$result->data = $indexed_rows;
		
		return $result;
	}
}
