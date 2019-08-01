<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

// TODO: Remove, autoloaders are now used
require_once(plugin_dir_path(__FILE__) . '/class.crud.php');

/**
 * This class represents a marker
 */
class Marker extends Crud implements \JsonSerializable
{
	const DEFAULT_ICON = "//maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png";
	
	private static $columns;
	protected $custom_fields;
	
	/**
	 * Constructor
	 * @param int|array|object An integer ID to read a marker, or an array or object to read data from to create a new one. If this argument is not specified, a new marker will be created.
	 */
	public function __construct($id_or_fields=-1)
	{
		global $wpdb;
		
		Crud::__construct("{$wpdb->prefix}wpgmza", $id_or_fields);
		
		// TODO: Why is this happening here and not in the ProMarker module? Keep the filter, but move this
		if(class_exists('WPGMZA\\CustomMarkerFields'))
			$this->custom_fields = apply_filters('wpgmza_get_marker_custom_fields', $this->id);
	}
	
	public static function getColumns()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		if(Marker::$columns)
			return Marker::$columns;
		
		Marker::$columns = $wpdb->get_results('SHOW COLUMNS FROM ' . $WPGMZA_TABLE_NAME_MARKERS);
		
		return Marker::$columns;
	}
	
	/**
	 * Deprecated. The Factory class will take over this functionality
	 * @deprecated
	 */
	public static function create_instance($id_or_fields=-1)
	{
		return apply_filters('wpgmza_create_marker_instance', $id_or_fields);
	}
	
	public static function get_table_name_static()
	{
		global $wpdb;
		return "{$wpdb->prefix}wpgmza";
	}
	
	/**
	 * Returns a clone of this marker for JSON serialization. Unsets latlng binary spatial data which corrupts JSON, and sets custom field data.
	 * @return array A JSON representation of this marker, without spatial data and with custom field ata.
	 */
	public function jsonSerialize()
	{
		$json = Crud::jsonSerialize();
		
		unset($json['latlng']);
		
		return $json;
	}
	
	/**
	 * Overrides Crud::get_placeholder_by_type to correctly handle inserting and updating spatial data placeholders.
	 * @param string $type The column type
	 * @return string If ths column type is point, the correct text-to-spatial function and placeholder. Otherwise, falls back to the default.
	 */
	protected function get_placeholder_by_type($type)
	{
		global $wpgmza;
		
		if($type == 'point')
			return "{$wpgmza->spatialFunctionPrefix}GeomFromText(%s)";
		
		return Crud::get_placeholder_by_type($type);
	}
	
	/**
	 * Overrides Crud::get_column_parameter to correctly handle inserting and updating spatial data values.
	 * @param string $name The colum name
	 * @return string If ths column name is latlng, the POINT function with this markers latitude and longitude. Otherwise, falls back to the default.
	 */
	protected function get_column_parameter($name)
	{
		if($name == 'latlng')
			return "POINT(" . floatval($this->lat) . " " . floatval($this->lng) . ")";
		
		return Crud::get_column_parameter($name);
	}
	
	/**
	 * Returns "other_data", which is the name of the column used to store arbitrary data on thet marker table.
	 * @return string Always other_data for the marker table.
	 */
	protected function get_arbitrary_data_column_name()
	{
		return 'other_data';
	}
	
	public function update()
	{
		Crud::update();
		
		// TODO: Update markers-has-categories
	}
	
	
	/**
	 * Called to update the latlng column for this marker in the database, when any changes are made to this objects properties lat, lng or latlng.
	 * @return void
	 */
	protected function update_latlng()
	{
		global $wpgmza;
		global $wpdb;
		
		$params = array(
			$this->lat,
			$this->lng,
			$this->get_column_parameter('latlng'),
			$this->id
		);
		
		$stmt = $wpdb->prepare("UPDATE " . $this->get_table_name() . " SET lat=%s, lng=%s, latlng={$wpgmza->spatialFunctionPrefix}GeomFromText(%s) WHERE id=%d", $params);
		
		$wpdb->query($stmt);
	}
	
	/**
	 * Sets the named property, calling update_latlng where needed.
	 */
	public function __set($name, $value)
	{
		Crud::__set($name, $value);
		
		switch($name)
		{
			case 'lat':
			case 'lng':
			case 'latlng':
				$this->update_latlng();
				break;
		}
	}
	
	public function getPosition()
	{
		return new LatLng($this->lat, $this->lng);
	}
}

// DEPRECATED: This will be handed over to the factory class
// You can remove this filter and add your own delegate to subclass Marker
add_filter('wpgmza_create_marker_instance', 'WPGMZA\\create_marker_instance_delegate', 10, 1);

function create_marker_instance_delegate($id)
{
	return new Marker($id);
}
