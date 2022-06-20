<?php

namespace WPGMZA;

class OLThemePanel extends DOMDocument{
	public function __construct($map=null){
		global $wpgmza;
		DOMDocument::__construct();
		$this->loadPHPFile($wpgmza->internalEngine->getTemplate('ol-theme-panel.html.php'));

		$tileServer = "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png";
		if(!empty($wpgmza->settings) && !empty($wpgmza->settings->tile_server_url)){
			$tileServer = $wpgmza->settings->tile_server_url;
		}

		$this->prepare($tileServer);
	}

	public function prepare($tileServer){
		$tileServer = str_replace("{a-c}", "a", $tileServer);
		$tileServer = str_replace("{z}/{x}/{y}", "7/20/49", $tileServer);

		$images = $this->querySelectorAll('img');
		if(!empty($images)){
			foreach($images as $image){
				$image->setAttribute('src', $tileServer);
				if(!empty($image->parentNode)){
					$filter = $image->parentNode->getAttribute('data-filter');
					$image->setAttribute('style', "filter: {$filter};");
				}
			}
		}
	}

}
