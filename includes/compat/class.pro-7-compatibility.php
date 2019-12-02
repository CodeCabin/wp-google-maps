<?php

namespace WPGMZA;

class Pro7Compatibility
{
	public function __construct()
	{
		add_action('admin_head', array($this, 'onAdminHead'));
	}
	
	public function onAdminHead()
	{
		global $wpgmza;
		
		if(!method_exists($wpgmza, 'getProVersion'))
			return;
		
		$proVersion = $wpgmza->getProVersion();
		
		if(version_compare($proVersion, '8.0.0', '>='))
			return;
		
		// Need to create a ThemePanel, Pro 7 doesn't do this. This enqueues OwlCarousel
		if($wpgmza->getCurrentPage() == Plugin::PAGE_MAP_EDIT)
			$themePanel = new ThemePanel(array());
	}
}