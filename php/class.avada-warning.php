<?php

namespace WPGMZA;

use Smart;

class AvadaWarning extends Smart\Document
{
	public function __construct()
	{
		Smart\Document::__construct();
		$this->loadPHPFile(WPGMZA_DIR . 'html/avada-warning.html.php');
	}
	
	/**
	 * This function returns true if the Avada theme warning needs to be displayed
	 * @return boolean
	 */
	public static function shouldBeDisplayed()
	{
		$theme = wp_get_theme();
		
		if($theme->get('Name') == 'Avada' && 
			intval($theme->get('Version') == apply_filters('wpgmza_avada_warning_version_number', 393 ) ) &&
			!isset(Plugin::$settings->force_jquery))
			return true;
		
		return false;
	}
}

?>