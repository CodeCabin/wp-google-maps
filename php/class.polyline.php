<?php

namespace WPGMZA;

require_once(__DIR__ . '/class.map-object.php');

class Polyline extends MapObject
{
	public function __construct($options)
	{
		global $WPGMZA_TABLE_NAME_POLYLINES;
		$this->table_name = &$WPGMZA_TABLE_NAME_POLYLINES;
		
		MapObject::__construct($options);
	}
	
	public function mapOptionsToDB($method, $options)
	{
		if(isset($options['points']))
		{
			$pairs = array();
			
			foreach($options['points'] as $latLng)
				array_push($pairs, "{$latLng->lng} {$latLng->lat}");
			
			$string = implode(',', $pairs);
			$options['points'] = "LINESTRING($string)";
		}
		
		$result = MapObject::mapOptionsToDB($method, $options);
		
		return $result;
	}
}

?>