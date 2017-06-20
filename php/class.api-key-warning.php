<?php

namespace WPGMZA;

use Smart;

class APIKeyWarning extends Smart\Document
{
	public function __construct()
	{
		Smart\Document::__construct();
		$this->loadPHPFile(WPGMZA_DIR . 'html/api-key-warning.html');
		
		if(isset($_POST['wpgmza_google_maps_api_key']) && is_admin())
		{
			$url = 'http' . 
				(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] ? 's' : '') .
				'://' .
				$_SERVER['HTTP_HOST'] .
				$_SERVER['REQUEST_URI'];
				
			Plugin::$settings->google_maps_api_key = $_POST['wpgmza_google_maps_api_key'];
			
			wp_redirect($url);
			exit;
		}
	}
	
	/**
	 * This function returns true if the API key warning needs to be displayed
	 * @return boolean
	 */
	public static function shouldBeDisplayed()
	{
		return empty(Plugin::$settings->google_maps_api_key) && (isset(Plugin::$settings->engine) && Plugin::$setting->engine == "google-maps");
	}
}

?>