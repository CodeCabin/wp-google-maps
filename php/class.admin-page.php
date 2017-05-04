<?php

namespace WPGMZA;

require_once(WPGMZA_DIR . 'php/class.avada-warning.php');
require_once(WPGMZA_DIR . 'php/class.api-key-warning.php');
require_once(WPGMZA_DIR . 'php/class.review-nag.php');

use Smart;

class AdminPage extends Smart\Document
{
	public function __construct()
	{
		Smart\Document::__construct();
	}
	
	protected function onLoaded()
	{
		Smart\Document::onLoaded();
		
		if($container = $this->querySelector('#warning-container'))
		{
			if(AvadaWarning::shouldBeDisplayed())
				$container->import(new AvadaWarning());
		
			if(APIKeyWarning::shouldBeDisplayed())
				$container->import(new APIKeyWarning());
		}
		
		if($container = $this->querySelector('#nag-container'))
		{
			if(ReviewNag::shouldBeDisplayed())
				$container->import(new ReviewNag());
		}
		
		// TODO: There must be a better way to do this, localize it with WP perhaps
		$this->querySelector('body>*')->setAttribute('data-shortcode-copy-string', __('Copied to clipboard', 'wp-google-maps'));
	}
}

?>