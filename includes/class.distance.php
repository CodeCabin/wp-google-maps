<?php

namespace WPGMZA;

class Distance
{
	const UNITS_KM		= "km";
	const UNITS_MI		= "mi";
	
	const MILES_PER_KILOMETER = 0.621371;
	const KILOMETERS_PER_MILE = 1.60934;
	
	public static function between($a, $b)
	{
		if(!($a instanceof LatLng))
			throw new \Exception('First argument is not an instance of WPGMZA\LatLng');
		
		if(!($b instanceof LatLng))
			throw new \Exception('Second argument is not an instance of WPGMZA\LatLng');
		
		$lat1 = $a->lat;
		$lon1 = $a->lng;
		$lat2 = $b->lat;
		$lon2 = $b->lng;
		
		$dLat = deg2rad($lat2 - $lat1);
		$dLon = deg2rad($lon2 - $lon1);
		
		$a =
			sin($dLat / 2) * sin($dLat / 2) +
			cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
			sin($dLon / 2) * sin($dLon / 2);
		
		$c = 2 * atan2(sqrt($a), sqrt(1 - $a));
		$d = 6371 * $c;
		
		return $d;
	}
}
