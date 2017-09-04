<?php

namespace WPGMZA;

require_once(WPGMZA_DIR . 'php/class.frontend-ui-element.php');

class StoreLocator extends FrontendUIElement
{
	public function __construct($map)
	{
		FrontendUIElement::__construct();
		
		$this->map = $map;
		
		$this->loadPHPFile($this->getHTMLFilename(WPGMZA_DIR, 'store-locator.html.php'));
		wp_enqueue_script('wpgmza-store-locator', WPGMZA_BASE . 'js/store-locator.js', array(
			'wpgmza-core'
		));

		do_action('wpgmza_basic_load_store_locator');
	}
}

?>