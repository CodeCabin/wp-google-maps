<?php

namespace WPGMZA;

use Smart;

class FrontendUIElement extends Smart\Document
{
	public function __construct()
	{
		Smart\Document::__construct();
	}
	
	protected function getHTMLFilename($dir, $basename)
	{
		global $wpgmza;
		
		if(!empty(Plugin::$settings->use_legacy_html))
			return $dir . "html/legacy/" . $basename;
		
		return $dir . "html/" . $basename;
	}
}

?>