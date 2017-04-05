<?php

namespace WPGMZA;

require_once(__DIR__ . '/class.map-object.php');

class Polygon extends MapObject
{
	public function __construct($options)
	{
		global $WPGMZA_TABLE_NAME_POLYGONS;
		$this->table_name = &$WPGMZA_TABLE_NAME_POLYGONS;
		
		MapObject::__construct($options);
	}
	
	public function mapOptionsToDB($method, $options)
	{
		if(isset($options['points']))
		{
			$pairs = array();
			
			foreach($options['points'] as $latLng)
				array_push($pairs, "{$latLng->lng} {$latLng->lat}");
			
			// Close the polygon
			array_push($pairs, $pairs[0]);
			
			$string = implode(',', $pairs);
			$options['points'] = "POLYGON(($string))";
		}
		
		$result = MapObject::mapOptionsToDB($method, $options);
		
		return $result;
	}
}

?>