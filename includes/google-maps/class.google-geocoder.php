<?php

namespace WPGMZA;

/**
 * Server side Google Maps geocoding.
 */
class GoogleGeocoder
{
	/**
	 * @var The Google API key to be used for geocoding
	 */
	public $apiKey;
	
	/**
	 * Constructor.
	 * @param string $apiKey The Google Maps API key to use for geocoding
	 */
	public function __construct($apiKey)
	{
		$this->apiKey = $apiKey;
	}
	
	/**
	 * Converts an address to a latitude longitude pair.
	 * @param string $address The address to geocode
	 * @throws \Exception cURL must be enabled to use this feature
	 * @throws \Exception Failed to parse JSON response
	 * @throws \Exception Failed to geocode address for reason given by Google
	 * @return object An object with the lat and lng of the first coordinate pair returned by Google
	 */
	public function getLatLngFromAddress($address)
	{
		if(!function_exists('\curl_init'))
			throw new \Exception('cURL must be enabled to use this feature');
		
		$url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode($address) . '&key=' . urlencode($this->apiKey) . '&sensor=false';
		
		$ch = curl_init($url);
		
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_REFERER, $_SERVER['HTTP_HOST']);
		
		$result = curl_exec($ch);
		
		$json = json_decode($result);

		do_action( 'wpgmza_google_maps_geocoded_result', $json );
		
		if(!$json)
		{
			$urlWithKeyHidden = preg_replace('/key=[A-Za-z0-9_\-]+/', '[api key]', $url);
			throw new \Exception("Failed to parse JSON response from $urlWithKeyHidden: " . $result . " (cURL error: " . curl_error($ch) . ")");
		}
		
		if(!property_exists($json, 'results'))
			throw new \Exception('Failed to geocode address "'.$address.'": ' . print_r($json, true));
		
		if($json->status != "OK")
			throw new \Exception('Failed to geocode address: "' . $address . '"');
		
		if(empty($json->results))
			return false;
		
		$result = $json->results[0];
		
		$location = $result->geometry->location;

		do_action( 'wpgmza_google_maps_geocoded_result_location', $location );
		
		return (object)array(
			'lat' => $location->lat, 
			'lng' => $location->lng
		);
	}
}

?>