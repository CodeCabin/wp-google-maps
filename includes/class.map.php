<?php

namespace WPGMZA;

require_once(plugin_dir_path(__FILE__) . 'class.crud.php');

class Map extends Crud
{
	public function __construct($id_or_fields=-1)
	{
		global $wpdb;
		
		Crud::__construct("{$wpdb->prefix}wpgmza_maps", $id_or_fields);
	}
	
	public static function create_instance($id_or_fields=-1)
	{
		return apply_filters('wpgmza_create_map_instance', $id_or_fields);
	}
	
	protected function get_arbitrary_data_column_name()
	{
		return "other_settings";
	}
}
