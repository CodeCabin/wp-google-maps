<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class AdminMarkerDataTable extends MarkerDataTable
{
	const ID_PLACEHOLDER = '__5d5621cf7b6bb90bfb7bda85a0df7293';
	
	public function __construct($ajax_parameters=null)
	{
		MarkerDataTable::__construct($ajax_parameters, array(
			'order' => array(
				1,
				'desc'
			)
		));
		
		$this->element->setAttribute('data-wpgmza-admin-marker-datatable', null);
		
		$this->element->import('<div class="wpgmza-marker-listing__actions">
			&#x21b3;
			<button class="wpgmza button select_all_markers" type="button">' . __('Select All', 'wp-google-maps') . '</button>
			<button class="wpgmza button bulk_delete" type="button">' . __('Bulk Delete', 'wp-google-maps') . '</button>
		</div>');
	}
	
	protected function getColumns()
	{
		return array(
			'mark'			=> __('Mark', 			'wp-google-maps'),
			'id'			=> __('ID', 			'wp-google-maps'),
			'icon'			=> __('Icon', 			'wp-google-maps'),
			'title'			=> __('Title', 			'wp-google-maps'),
			'category'		=> __('Category', 		'wp-google-maps'),
			'address'		=> __('Address', 		'wp-google-maps'),
			'description'	=> __('Description', 	'wp-google-maps'),
			'pic'			=> __('Image', 			'wp-google-maps'),
			'link'			=> __('Link', 			'wp-google-maps'),
			'sticky'		=> __('Sticky',			'wp-google-maps'),
			'action'		=> __('Action', 		'wp-google-maps')
		);
	}
	
	protected function getActionButtons()
	{
		$id_placeholder = AdminMarkerDataTable::ID_PLACEHOLDER;
		
		return apply_filters('wpgmza_admin_marker_datatable_action_buttons_sql', 'REPLACE(\'
				<div class="wpgmza-action-buttons wpgmza-flex">
					<a title="Edit this marker" class="wpgmza_edit_btn button" data-edit-marker-id="' . $id_placeholder . '">
						<i class="fa fa-edit"> </i>
					</a>
					<a href="?page=wp-google-maps-menu&amp;action=edit_marker&amp;id=' . $id_placeholder . '" title="' 
						. esc_attr( __('Edit this marker location', 'wp-google-maps') )  . 
						'" class="wpgmza_edit_btn button" id="' . $id_placeholder . '">
						<i class="fa fa-map-marker"> </i>
					</a>
					<a title="Center on marker" class="wpgmza_center_btn button" data-center-marker-id="' . $id_placeholder . '">
					<i class="fa fa-eye"> </i>
					</a>
					<a href="javascript: ;" title="'
						. esc_attr( __('Delete this marker', 'wp-google-maps') ) . 
						'" class="wpgmza_del_btn button" data-delete-marker-id="' . $id_placeholder . '">
						<i class="fa fa-times"> </i>
					</a>
				</div>
				
				\',
				"' . $id_placeholder . '",
				id
			) AS `action`
		');
	}
	
	protected function filterColumns(&$columns, $input_params)
	{
		MarkerDataTable::filterColumns($columns, $input_params);
		
		foreach($columns as $key => $value)
		{
			$name = $this->getColumnNameByIndex($key);
			
			switch($name)
			{
				case 'category':
				case 'description':
				case 'pic':
					$columns[$key] = '"" AS ' . $name;
					break;
				
				case 'action':
					$columns[$key] = $this->getActionButtons();
					break;
					
				case 'icon':
					$columns[$key] = '\'<img src="' . Marker::DEFAULT_ICON . '"/>\' AS icon';
					break;
				
				case 'sticky':
					$columns[$key] = '(CASE WHEN sticky = 1 THEN "&#x2714;" ELSE "" END) AS sticky';
					break;
			}
		}
		
		return $columns;
	}
	
	protected function getSearchClause($input_params, &$query_params, $exclude_columns=null)
	{
		return MarkerDataTable::getSearchClause($input_params, $query_params, array(
			'mark',
			'action'
		));
	}
}