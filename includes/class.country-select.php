<?php

namespace WPGMZA;

class CountrySelect extends DOMDocument {
	private static $cachedJson;
	
	public function __construct($options=null) {
		if(empty(CountrySelect::$cachedJson)) {
			$str	= file_get_contents( plugin_dir_path(WPGMZA_FILE) . 'js/countries.json' );
			$json	= json_decode($str);
			
			CountrySelect::$cachedJson = $json;
		}
		
		DOMDocument::__construct();
		
		if(!$options)
			$options = array();
		
		$this->loadHTML('<select></select>');
		
		$select		= $this->querySelector('select');
		
		if(!empty($options['name']))
			$select->setAttribute('name', $options['name']);
		
		$option = $this->createElement('option');
		$option->setAttribute('value', '');
		$option->appendText(__('Please select','wp-google-maps'));
		
		$select->appendChild($option);

		foreach(CountrySelect::$cachedJson as $country) {
			$code = false;

			if(!empty($country->alpha2Code)){
				/* We have the alpha 2 code, which will work far more consistently */
				$code = strtolower($country->alpha2Code);
			} else {
				if(!empty($country->topLevelDomain[0])){
					/* Fallback to the TLD */
					$code	= str_replace('.', '', $country->topLevelDomain[0]);
				}
			}
			
			if(empty($code)){
				continue;
			}
			
			$name	= $country->name;
			
			$option = $this->createElement('option');
			$option->setAttribute('value', $code);
			$option->appendText($name);

			if(!empty($code) && !empty($options['value']) && $code == $options['value']){
				$option->setAttribute("selected", "selected");
			}
			
			$select->appendChild($option);
		}

	    /* Developer Hook (Action) - Alter the country select output, passes DOMElement for mutation */     
		do_action("wpgmza_country_select_created", $select);
	}
}