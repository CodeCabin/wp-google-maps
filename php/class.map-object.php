<?php

namespace WPGMZA;

class MapObject
{
	protected $table_name;
	protected static $show_columns_cache = array();
	
	/**
	 * Constructor. Options
	 * @param $options
	 * @param $options['id'] The markers ID, optional. Will create a new map object if -1 or not set
	 * @param $options['map_id'] The map a newly created map object belongs to. This must be set when creating a map object
	 * @param $options['write_only'] When set, the map object will read from the DB. Use this option to increase performance when you don't need to read any data from the map object
	 */
	public function __construct($options)
	{
		if(!is_array($options))
			throw new \Exception('Argument must be an array of options');
		
		if(!empty($options))
			foreach($options as $key => $value)
			{
				$this->{$key} = $value;
			}
		
		if(!isset($options['id']) || $options['id'] == -1)
			$this->create($options);
		else
			$this->load($options['id'], $options);
	}
	
	/**
	 * Queries columns for this type of object and creates an update or insert statement
	 * @param $method INSERT or UPDATE
	 * @param $options column data
	 * @param $geometry the geometry function, eg PointFromText, optional
	 * @return object
	 */
	protected function mapOptionsToDB($method, $options)
	{
		global $wpdb;
		
		if(!$this->table_name)
			throw new \Exception("Table name must be set before calling constructor");
		
		$assignments = array();
		$params = array();
		
		// Cache the results of show columns to speed things up
		if(isset(MapObject::$show_columns_cache[$this->table_name]))
			$columns = MapObject::$show_columns_cache[$this->table_name];
		else	
			$columns = 
				MapObject::$show_columns_cache[$this->table_name] = 
				$wpdb->get_results("SHOW COLUMNS FROM {$this->table_name}");
		
		// Iterate through. Any columns that exist on this will be put into statement
		foreach($columns as $col)
		{
			if(!isset($options[$col->Field]))
				continue;	// This column is not set in our options
	
			if($col->Field == 'id')
				continue;	// Don't set or insert ID
	
			$assignment = $col->Field . '=';
			
			switch($col->Type)
			{
				case 'point':
					$assignment .= "PointFromText(%s)";
					break;
					
				case 'polygon':
					$assignment .= "PolygonFromText(%s)";
					break;
					
				case 'linestring':
					$assignment .= "LineStringFromText(%s)";
					break;
					
				case 'multipoint':
					$assignment .= "MultiPointFromText(%s)";
					break;
					
				default:
					if(preg_match('/^int/', $col->Type))
						$assignment .= '%d';
					else
						$assignment .= '%s';
					break;
			}
			
			$assignments[$col->Field] = $assignment;
			
			if($col->Field == 'settings')
				array_push($params, json_encode($options['settings']));
			else
				array_push($params, $options[$col->Field]);
		}
		
		// Open statement
		switch($method)
		{
			case "INSERT":
				$qstr = "INSERT INTO ";
				break;
				
			case "UPDATE":
				$qstr = "UPDATE ";
				break;
				
			default:
				throw new \Exception("Method must be INSERT or UPDATE");
				break;
		}
		
		$qstr .= $this->table_name . " SET ";
		
		$qstr .= implode(',', $assignments);
		
		if($method == "UPDATE")
		{
			$qstr .= ' WHERE id=%d';
			array_push($params, $this->id);
		}
		
		// Prepare statement
		$stmt = $wpdb->prepare($qstr, $params);
		
		return (object)array(
			'queryString'		=> $qstr,
			'assignments'		=> $assignments,
			'params'			=> $params,
			'statement'			=> $stmt
		);
	}
	
	protected function create($options)
	{
		global $wpdb;
		
		if(!isset($options['map_id']))
			throw new \Exception('map_id is required to create a new map object');
		
		$stmt = $this->mapOptionsToDB('INSERT', (array)$this)->statement;
		$wpdb->query($stmt);
		
		$this->id = $wpdb->insert_id;
	}
	
	protected function load($id, $options)
	{
		$this->id = $id;
		
		if(isset($options['write_only']) && $options['write_only'])
			return; // no_load set, don't do a load query
		
		$stmt = $wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id=%d");
		$data = $wpdb->get_row($stmt);
		
		if(!$data)
			throw new \Exception('Marker not found');
		
		foreach($data as $key => $value)
		{
			if($key == 'settings')
				$value = json_decode($value);
			$this->{$key} = $value;
		}
	}
	
	public function save()
	{
		global $wpdb;
		
		$stmt = $this->mapOptionsToDB('UPDATE', (array)$this)->statement;
		
		$wpdb->query($stmt);
	}
	
	public function remove()
	{
		global $wpdb;
		
		$stmt = $wpdb->prepare("DELETE FROM {$this->table_name} WHERE id=%d", array($this->id));
		
		$wpdb->query($stmt);
	}
}

?>