<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class MarkerFilter extends Factory
{
	protected $_center;
	protected $_radius;
	
	protected $_offset;
	protected $_limit;
	
	public function __construct($options=null)
	{
		if($options)
			foreach($options as $key => $value)
				$this->{$key} = $value;
	}
	
	public function __get($name)
	{
		if(property_exists($this, "_$name"))
			return $this->{"_$name"};
		
		return $this->{$name};
	}
	
	public function __set($name, $value)
	{
		if(property_exists($this, "_$name"))
		{
			switch($name)
			{
				case 'center':
					
					if(!is_array($value) && !is_object($value))
						throw new \Exception('Value must be an object or array with lat and lng');
					
					$arr = (array)$value;
					
					if(!isset($arr['lat']) || !isset($arr['lng']))
						throw new \Exception('Value must have lat and lng');
					
					$this->_center = $arr;
					
					break;
					
				case 'limit':
				case 'offset':
				
					if(!is_numeric($value))
						throw new \Exception('Value must be numeric');
					
					$this->{"_$name"} = $value;
				
					break;
					
				default:
				
					$this->{"_$name"} = $value;
					
					break;
			}
			
			return;
		}
		
		$this->{$name} = $value;
	}
	
	protected function loadMap()
	{
		global $wpdb;
		
		$id = $wpdb->get_var("SELECT id FROM {$wpdb->prefix}wpgmza_maps LIMIT 1");
		
		if(!$id)
			return;
		
		$this->map = new Map($id);
	}
	
	protected function applyRadiusClause($query, $context=Query::WHERE)
	{
		global $wpgmza;
		
		if(!$this->center || !$this->radius)
			return;
		
		$lat = $this->_center['lat'] / 180 * 3.1415926;
		$lng = $this->_center['lng'] / 180 * 3.1415926;
		$radius = $this->radius;
		
		if($this->map && $this->map->storeLocatorDistanceUnits == Distance::UNITS_MI)
			$radius *= Distance::KILOMETERS_PER_MILE;
		
		$query->{$context}['radius'] = "
			(
				6371 *
			
				2 *
			
				ATAN2(
					SQRT(
						POW( SIN( ( ({$wpgmza->spatialFunctionPrefix}X(latlng) / 180 * 3.1415926) - %f ) / 2 ), 2 ) +
						COS( {$wpgmza->spatialFunctionPrefix}X(latlng) / 180 * 3.1415926 ) * COS( %f ) *
						POW( SIN( ( ({$wpgmza->spatialFunctionPrefix}Y(latlng) / 180 * 3.1415926) - %f ) / 2 ), 2 )
					),
					
					SQRT(1 - 
						(
							POW( SIN( ( ({$wpgmza->spatialFunctionPrefix}X(latlng) / 180 * 3.1415926) - %f ) / 2 ), 2 ) +
							COS( {$wpgmza->spatialFunctionPrefix}X(latlng) / 180 * 3.1415926 ) * COS( %f ) *
							POW( SIN( ( ({$wpgmza->spatialFunctionPrefix}Y(latlng) / 180 * 3.1415926) - %f ) / 2 ), 2 )
						)
					)
				)
			)
			
			< %f
		";
		
		$query->params[] = $lat;
		$query->params[] = $lat;
		$query->params[] = $lng;
		
		$query->params[] = $lat;
		$query->params[] = $lat;
		$query->params[] = $lng;
		
		$query->params[] = $radius;
	}
	
	protected function applyIDsClause($set)
	{
		if(empty($this->ids))
			return;
		
		$query->in('id', $set);
	}
	
	protected function applyLimit($query)
	{
		if(empty($this->_limit))
			return;
		
		$limit = "";
		
		if(!empty($this->_offset) || $this->_offset === 0 || $this->_offset === "0")
			$limit = $this->_offset . ",";
		
		$limit .= $this->_limit;
		
		$query->limit = $limit;
	}
		
	public function getQuery()
	{
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		$query = new Query();
		
		$query->type	= 'SELECT';
		$query->table	= $WPGMZA_TABLE_NAME_MARKERS;
		
		$this->applyRadiusClause($query);
		$this->applyIDsClause($query);
		$this->applyLimit($query);
		
		return $query;
	}
	
	public function getColumns($fields=null)
	{
		if(empty($fields))
			return array('*');
		
		$result = array();
		
		foreach($fields as $field)
			$result[] = $field;
			
		return $result;
	}
	
	public function getFilteredMarkers($fields=null)
	{
		global $wpdb;
		
		$query = $this->getQuery($fields);
		$query->fields = $this->getColumns($fields);
		
		$sql = $query->build();
		
		$results = $wpdb->get_results($sql);
		
		// NB: Optimize by only fetching ID here, for filtering. Only fetch the rest if fetch ID not set.
		if(count($query->fields) == 1 && $query->fields[0] == 'id')
			return $results;
		
		$markers = array();
		
		foreach($results as $data)
		{
			$markers[] = Marker::createInstance($data, Crud::BULK_READ);
		}
		
		return apply_filters('wpgmza_fetch_integrated_markers', $markers, $this);
	}
	
	public function getFilteredIDs()
	{
		global $wpdb;
		
		$query = $this->getQuery();
		
		$query->fields[] = 'id';
		
		$sql = $query->build();
		$ids = $wpdb->get_col($sql);
		
		$integrated = apply_filters('wpgmza_fetch_integrated_markers', $markers, $this);
		foreach($integrated as $key => $value)
			$ids[] = $value->id;
		
		return $ids;
	}
	
	
}