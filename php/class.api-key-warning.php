<?php

namespace WPGMZA;

use Smart;

class APIKeyWarning extends Smart\Document
{
	public function __construct()
	{
		Smart\Document::__construct();
		$this->loadPHPFile(WPGMZA_DIR . 'html/api-key-warning.html');
		
		// TODO: Accept $_POST here
	}
	
	/**
	 * This function returns true if the API key warning needs to be displayed
	 * @return boolean
	 */
	public static function shouldBeDisplayed()
	{
		return empty(Plugin::$settings->google_maps_api_key);
	}
}

?>