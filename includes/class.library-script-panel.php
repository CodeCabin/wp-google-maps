<?php

namespace WPGMZA;

class LibraryScriptPanel extends DOMDocument
{
	public function __construct()
	{
		global $wpgmza;
		
		DOMDocument::__construct();
		
		$this->loadPHPFile(
			plugin_dir_path(WPGMZA_PRO_FILE) . 'html/library-script-panel.html.php'
		);
	}
}