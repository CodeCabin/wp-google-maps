<?php

namespace WPGMZA;

class AdminMapDataTable extends DataTable
{
	const ID_PLACEHOLDER = '__bbd3356bf78cf6e13b2b64ab13a70da9';
	
	public function __construct($ajax_parameters=null, $datatable_options=null) {
		global $wpgmza;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		DataTable::__construct($WPGMZA_TABLE_NAME_MAPS, $ajax_parameters, $datatable_options);
		
		@$this->element->setAttribute('data-wpgmza-admin-map-datatable', null);
		
		wp_enqueue_style('datatables', plugin_dir_url(WPGMZA_FILE) . 'css/data_table_front.css');
		
		$buttonClass = $wpgmza->internalEngine->getButtonClass('button');

		if($wpgmza->isProVersion()) {
			$this->element->import('<div class="wpgmza-marker-listing__actions">
				<span>&#x21b3;</span>
				<button class="wpgmza ' . $buttonClass . ' select_all_maps" type="button">' . __('Select All', 'wp-google-maps') . '</button>
				<button class="wpgmza ' . $buttonClass . ' bulk_delete_maps" type="button">' . __('Bulk Delete', 'wp-google-maps') . '</button>
			</div>');
		}
	}
	
	protected function getColumns(){
		global $wpgmza;

		$columns = array(
			'mark'			=> '',
			'id'			=> __('ID',			'wp-google-maps'),
			'map_title'		=> __('Title',		'wp-google-maps'),
			'width'			=> __('Width',		'wp-google-maps'),
			'height'		=> __('Height',		'wp-google-maps'),
			'type'			=> __('Type',		'wp-google-maps'),
			'action'		=> __('Action',		'wp-google-maps'),
			'shortcode'		=> __('Shortcode',	'wp-google-maps')
		);

		if(!$wpgmza->isProVersion()){
			unset($columns['mark']);
		}

		return $columns;
	}
	
	protected function filterColumns(&$columns, $input_params)
	{

		global $wpgmza;

		DataTable::filterColumns($columns, $input_params);
		
		$placeholder = AdminMapDataTable::ID_PLACEHOLDER;
		
		$buttonClass = $wpgmza->internalEngine->getButtonClass('button');

		foreach($columns as $key => $value) {
			$name = $this->getColumnNameByIndex($key);
			global $wpgmza;
			
			switch($name) {
				case 'mark':
				
					$columns[$key] = "REPLACE('
						<input type=\'checkbox\' name=\'mark\' data-map-id=\'$placeholder\'/>
					', '$placeholder', id) AS mark";
					
					break;
				
				case 'width':
					$columns[$key] = "CONCAT(map_width, REPLACE(map_width_type, '\\\\', '')) AS width";
					break;
				
				case 'height':
					$columns[$key] = "CONCAT(map_height, REPLACE(map_height_type, '\\\\', '')) AS height";
					break;
					
				case 'type':
					$columns[$key] = "CASE
						WHEN type = 2 THEN '" . esc_sql( __('Satellite',	'wp-google-maps') ) . "'
						WHEN type = 3 THEN '" . esc_sql( __('Hybrid',		'wp-google-maps') ) . "'
						WHEN type = 4 THEN '" . esc_sql( __('Terrain',		'wp-google-maps') ) . "'
						ELSE '" . esc_sql( __('Roadmap',		'wp-google-maps') ) . "'
						END
					";
					break;
					
				case 'action':
					
					
		
					if($wpgmza->isProVersion()) {
						$columns[$key] = "REPLACE('
						<div class=\"wpgmza-action-group\">
							<button 
								class=\"{$buttonClass}\"
								data-map-id=\"$placeholder\" 
								data-action=\"edit\">
								" . esc_sql( __('Edit', 'wp-google-maps') ) . "
							</button>
							<button 
								class=\"{$buttonClass}\"
								data-map-id=\"$placeholder\" 
								data-action=\"trash\">
								" . esc_sql( __('Trash', 'wp-google-maps') ) . "
							</button>
							<button 
								class=\"{$buttonClass}\"
								data-map-id=\"$placeholder\" 
								data-action=\"duplicate\">
								" . esc_sql( __('Duplicate', 'wp-google-maps') ) . "
							</button>
						</div>
					', '$placeholder', id) AS action";
					} else {
						$columns[$key] = "REPLACE('
						<button 
							class=\"{$buttonClass}\"
							data-map-id=\"$placeholder\" 
							data-action=\"edit\">
							" . esc_sql( __('Edit', 'wp-google-maps') ) . "
						</button>
					', '$placeholder', id) AS action";
					}
					
					
					break;
					
				case 'shortcode':
				
					$placeholder = AdminMapDataTable::ID_PLACEHOLDER;
					
					$columns[$key] = "REPLACE('
						<input class=\"wpgmza_copy_shortcode\" 
							type=\"text\" 
							readonly 
							value=\"[wpgmza id=&quot;$placeholder&quot;]\"/>
					', '$placeholder', id) AS shortcode";
				
					break;
			}
		}
		
		return $columns;
	}
	
	protected function getSearchClause($input_params, &$query_params, $exclude_columns=null)
	{
		return DataTable::getSearchClause($input_params, $query_params, array(
			'mark',
			'width',
			'height',
			'type',
			'action',
			'shortcode'
		));
	}

	protected function getWhereClause($input_params, &$query_params, $clause_for_total=false)
	{
		$clauses = DataTable::getWhereClause($input_params, $query_params, $clause_for_total);
		$clauses .= " AND active=0";

		return $clauses;
	}

	protected function filterResults(&$rows){
		if(!empty($rows)){
			foreach($rows as $key => $row){
				if(!empty($row->map_title)){
					$rows[$key]->map_title = strip_tags($row->map_title);
				}
			}
		}
		return $rows;
	}
}


