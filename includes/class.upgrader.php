<?php

namespace WPGMZA;

class Upgrader
{
	public function upgrade($fromVersion)
	{
		// NB: We don't use the global plugin object here because it's not initialised yet
		$settings = new GlobalSettings();
		
		if(preg_match('/^7\./', $fromVersion))
		{
			// Legacy style for upgrading users
			$settings->user_interface_style = "legacy";
		}
		
		add_action('init', function() {
			global $wpgmza;
			$wpgmza->updateAllMarkerXMLFiles();
		});
		
		$this->doFinnishDatatablesTranslationFix($fromVersion);
	}
	
	protected function doFinnishDatatablesTranslationFix($fromVersion)
	{
		// There is an issue in <= 8.0.22 where a lowercase finnish.json file is bundled with the plugin,
		// this causes 404's on case sensitive servers. Let's rename the file here if that is the case
		
		if(!version_compare($fromVersion, '8.0.22', '<='))
			return;
		
		$path = plugin_dir_path(__DIR__) . 'languages/datatables/';
		$lower = "$path/test.json";
		$upper = "$path/Finnish.json";
		
		if(file_exists($lower) && !file_exists($upper))
			rename($lower, $upper);
	}
}
