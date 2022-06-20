<?php

namespace WPGMZA;

class FeaturePanel extends DOMDocument
{
	private $_map_id;
	
	public function __construct($map_id)
	{
		global $wpgmza;
		DOMDocument::__construct();

		$filename = preg_replace('/^pro/i', '', $this->featureType);
		
		$this->loadPHPFile($wpgmza->internalEngine->getTemplate("map-edit-page/$filename-panel.html.php"));

		$this->querySelector('input[data-ajax-name="map_id"]')->setAttribute('value', $map_id);
		
		$this->_map_id = $map_id;
		
		$this->querySelector('.wpgmza-feature-panel')->setAttribute('data-wpgmza-feature-type', $this->featureType);
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case 'map_id':
				return $this->{"_$name"};
				break;
			
			case 'featureType':
				return preg_replace('/^pro/i', '', strtolower( preg_replace("/(^WPGMZA\\\\)|(Panel$)/", '', get_called_class()) ));
				break;
		}
	}
}