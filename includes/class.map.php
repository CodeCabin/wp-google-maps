<?php

namespace WPGMZA;

require_once(plugin_dir_path(__FILE__) . 'class.crud.php');

/**
 * This class represents a map.
 */
class Map extends Crud
{
	/**
	 * Constructor
	 * @param int|array|object $id_or_fields The ID to read an existing map, or an object or array to create a new one.
	 */
	public function __construct($id_or_fields=-1)
	{
		global $wpdb;
		
		Crud::__construct("{$wpdb->prefix}wpgmza_maps", $id_or_fields);
	}
	
	/**
	 * Deprecated. The Factory class will takeover here
	 * @deprecated
	 */
	public static function create_instance($id_or_fields=-1)
	{
		return apply_filters('wpgmza_create_map_instance', $id_or_fields);
	}
	
	/**
	 * Returns the name of the column used to store arbitrary data, which is "other_settings" on the map table.
	 * @return string The column name.
	 */
	protected function get_arbitrary_data_column_name()
	{
		return "other_settings";
	}
}
