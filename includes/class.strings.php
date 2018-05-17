<?php

namespace WPGMZA;

class Strings
{
	public function getLocalizedStrings()
	{
		return array(
			'unsecure_geolocation' 		=> __('Many browsers are no longer allowing geolocation from unsecured origins. You will need to secure your site with an SSL certificate (HTTPS) or this feature may not work for your visitors', 'wp-google-maps')
		);
	}
	
	/**
	 * This function builds a dummy PHP file containing strings from the database,
	 * making these strings scannable by translation software.
	 * TODO: Implement
	 */
	public function buildDynamicStringDummyFile()
	{
		
	}
}
