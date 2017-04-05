<?php

namespace WPGMZA;

require_once(__DIR__ . '/class.map-object.php');

class Marker extends MapObject
{
	/**
	 * Constructor. See MapObject for abstract options
	 * @constructor
	 */
	public function __construct($options)
	{
		global $WPGMZA_TABLE_NAME_MARKERS;
		$this->table_name = &$WPGMZA_TABLE_NAME_MARKERS;
		
		MapObject::__construct($options);
	}
	
	public function mapOptionsToDB($method, $options)
	{
		if(isset($options['lat']) != isset($options['lng']))
			throw new \Exception('You must assign both lat and lng together');
		
		if(isset($options['lat']) && isset($options['lng']))
		{
			// Set geometry string
			$options['latlng'] = "POINT({$options['lng']} {$options['lat']})";
			
			// Unset text lat/lng options
			unset($options['lat']);
			unset($options['lng']);
		}
		
		$result = MapObject::mapOptionsToDB($method, $options);
		
		return $result;
	}
}

?>