<?php

namespace WPGMZA;

class StoreLocator extends Factory implements \IteratorAggregate
{
	private $_document;
	private $_map;
	
	public function __construct(Map $map)
	{
		global $wpgmza;
		
		$this->_map = $map;
		
		$this->_document = new DOMDocument();
		$this->_document->loadPHPFile(plugin_dir_path(WPGMZA_FILE) . 'html/store-locator.html.php');
		
		$this->_document->populate($this);
		
		$this->populateRadiusSelect();
		
		if($wpgmza->settings->useLegacyHTML)
		{
			$document = $this->_document;
			
			$document
				->querySelectorAll(".wpgmza-store-locator")
				->addClass("wpgmza_sl_main_div");
			
			$document
				->querySelectorAll(".wpgmza-address-container")
				->addClass("wpgmza-form-field wpgmza_sl_query_div wpgmza-clearfix");
				
			$document
				->querySelectorAll("label.wpgmza-address")
				->setAttribute("for", "addressInput")
				->addClass("wpgmza-form-field__label wpgmza-form-field__label--float");
			
			$document
				->querySelectorAll("input.wpgmza-address")
				->setAttribute("id", "addressInput")
				->setAttribute("size", 20);
			
			$document
				->querySelectorAll(".wpgmza-radius-container")
				->addClass("wpgmza-form-field wpgmza_sl_radius_div wpgmza-clearfix");
			
			$document
				->querySelectorAll("label.wpgmza-radius")
				->setAttribute("for", "radiusSelect")
				->addClass("wpgmza-form-field__label wpgmza-form-field__label--float");
				
			$document
				->querySelectorAll("select.wpgmza-radius")
				->setAttribute("id", "radiusSelect")
				->addClass("wpgmza-form-field__input wpgmza_sl_radius_select");
			
			$document
				->querySelectorAll("input.wpgmza-search")
				->addClass("wpgmza_sl_search_button")
				->setAttribute("onclick", "searchLocations({$this->map->id})");
			
			$document
				->querySelectorAll("div.wpgmza-no-results")
				->addClass("wpgmza-not-found-msg js-not-found-msg");
		}
	}
	
	public function __get($name)
	{
		if(isset($this->{"_$name"}))
			return $this->{"_$name"};
		
		switch($name)
		{
			case "addressLabel":
			case "defaultAddress":
			case "notFoundMessage":
			case "defaultRadius":

				$address_label = __('ZIP / Addressss:', 'wp-google-maps');

				if(!empty($this->map->store_locator_query_string))
				{
					$address_label = $this->map->store_locator_query_string;
				}
			
				$defaults = array(
					"addressLabel"		=> $address_label,
					"defaultAddress"	=> '',
					"notFoundMessage"	=> __('No results found in this location. Please try again.', 'wp-google-maps'),
					"defaultRadius"		=> '10'
				);
			
				$snakeCase = strtolower( preg_replace('/(\b[a-z]+|\G(?!^))((?:[A-Z]|\d+)[a-z]*)/', '\1_\2', $name) );
			
				if(!empty($this->map->{"store_locator_$snakeCase"}))
					return $this->map->{"store_locator_$snakeCase"};
				
				return $defaults[$name];
				break;
				
			case "html":
				return $this->_document->html;
				break;
		}
	}
	
	public function getIterator()
	{
		$reflection = new \ReflectionObject($this);
		$properties = $reflection->getProperties(\ReflectionProperty::IS_PUBLIC);
		
		$arr = array();
		foreach($properties as $prop)
			$arr[$prop->name] = $this->{$prop->name};
		
		$iterator = new \ArrayIterator(
			array_merge(
				$arr,
				array(
					'addressLabel'		=> $this->addressLabel,
					'defaultAddress'	=> $this->defaultAddress,
					'notFoundMessage'	=> $this->notFoundMessage,
					'defaultRadius'		=> $this->defaultRadius
				)
			)
		);
		
		return $iterator;
	}
	
	protected function populateRadiusSelect()
	{
		global $wpgmza;
		
		$document	= $this->_document;
		$radii		= array(1, 5, 10, 25, 50, 75, 100, 150, 200, 300);
		$suffix		= __('km', 'wp-google-maps');
		$select		= $document->querySelector("select.wpgmza-radius");
		
		if(!empty($wpgmza->settings->wpgmza_store_locator_radii))
			$radii = preg_split('/\s*,\s*/', $wpgmza->settings->wpgmza_store_locator_radii);
		
		if(!empty($this->map->store_locator_distance) && $this->map->store_locator_distance == 1)
			$suffix = __('mi', 'wp-google-maps');
		
		foreach($radii as $radius)
		{
			$option = $document->createElement('option');
			
			$option->addClass("wpgmza-radius");
			$option->setAttribute("value", $radius);
			
			if($radius == $this->defaultRadius)
				$option->setAttribute("selected", "selected");
			
			if($wpgmza->settings->useLegacyHTML)
				$option->addClass("wpgmza_sl_select_option");
			
			$option->appendText($radius . $suffix);
			
			$select->appendChild($option);
		}
	}
}
