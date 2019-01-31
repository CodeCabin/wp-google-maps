<?php

// See https://docs.google.com/document/d/16NdGw4C4cd5Q20OwQDGpMB_GiYnojz0Mrug-QRS5zoE/edit#

namespace WPGMZA;

class MarkerFilter extends Factory
{
	protected $_center;
	protected $_radius;
	
	public function __construct($options=null)
	{
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
					
				default:
				
					$this->{"_$name"} = $value;
					
					break;
			}
			
			return;
		}
		
		$this->{$name} = $value;
	}
	
	protected function applyRadiusClause($query)
	{
		if(!$this->center || !$this->radius)
			return;
		
		$lat = $this->_center['lat'] / 180 * 3.1415926;
		$lng = $this->_center['lng'] / 180 * 3.1415926;
		
		$query->where['radius'] = '
			(
				6381 *
			
				2 *
			
				ATAN2(
					SQRT(
						POW( SIN( ( (X(latlng) / 180 * 3.1415926) - %f ) / 2 ), 2 ) +
						COS( X(latlng) / 180 * 3.1415926 ) * COS( %f ) *
						POW( SIN( ( (Y(latlng) / 180 * 3.1415926) - %f ) / 2 ), 2 )
					),
					
					SQRT(1 - 
						(
							POW( SIN( ( (X(latlng) / 180 * 3.1415926) - %f ) / 2 ), 2 ) +
							COS( X(latlng) / 180 * 3.1415926 ) * COS( %f ) *
							POW( SIN( ( (Y(latlng) / 180 * 3.1415926) - %f ) / 2 ), 2 )
						)
					)
				)
			)
			
			< %f
		';
		
		$query->params[] = $lat;
		$query->params[] = $lat;
		$query->params[] = $lng;
		
		$query->params[] = $lat;
		$query->params[] = $lat;
		$query->params[] = $lng;
		
		$query->params[] = $this->radius;
	}
	
	public function getQuery()
	{
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		$query = new Query();
		
		$query->type	= 'SELECT';
		$query->table	= $WPGMZA_TABLE_NAME_MARKERS;
		
		$this->applyRadiusClause($query);
		
		return $query;
	}
	
	public function getFilteredMarkers($fields=null)
	{
		global $wpdb;
		
		$query = $this->getQuery();
		
		if($fields == null)
			$query->fields[] = '*';
		else
			foreach($fields as $field)
				$query->fields[] = $field;
			//$query->fields = $fields;
		
		$sql = $query->build();
		
		$results = $wpdb->get_results($sql);
		
		return $results;
	}
	
	public function getFilteredIDs()
	{
		global $wpdb;
		
		$query = $this->getQuery();
		
		$query->fields[] = 'id';
		
		$sql = $query->build();
		
		return $wpdb->get_col($sql);
	}
	
	
}

/*$filter = MarkerFilter::createInstance();

header('Content-type: text/plain');

$filter->map_id = 1;
$filter->center = array(
	'lat'	=> 51,
	'lng'	=> -3
);
$filter->radius = 500;
//$filter->keywords = 'test';

print_r( $filter->getFilteredIDs() );

exit;*/