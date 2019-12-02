<?php

namespace WPGMZA;

class SettingsPage extends DOMDocument
{
	public function __construct()
	{
		global $wpgmza;
		
		DOMDocument::__construct();
		
		$this->loadPHPFile(plugin_dir_path(__DIR__) . 'html/settings-page.html.php');
		$this->populate($wpgmza->settings);
	}
}
