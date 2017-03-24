<?php

namespace WPGMZA;

use Smart;

class AvadaWarning extends Smart\Document
{
	/**
	 * This function returns true if the Avada theme warning needs to be displayed
	 * @return boolean
	 */
	public static function shouldBeDisplayed()
	{
		$theme = wp_get_theme();
		
		if($theme->get('Name') == 'Avada' && 
			intval($theme->get('Version') == 393) &&
			!isset(Plugin::$settings->force_jquery))
			return true;
		
		return false;
	}
}

?>