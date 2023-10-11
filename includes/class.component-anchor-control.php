<?php

namespace WPGMZA\UI;

#[\AllowDynamicProperties]
class ComponentAnchorControl {
	const TOP 		= 0;
	const LEFT 		= 1;
	const CENTER 	= 2;
	const RIGHT 	= 3;
	const BOTTOM 	= 4;

	const TOP_LEFT 	= 5;
	const TOP_RIGHT = 6;
	
	const BOTTOM_LEFT 	= 7;
	const BOTTOM_RIGHT 	= 8;

	const ABOVE = 9;
	const BELOW = 10;

	/**
	 * Create a controller
	 * 
	 * @param DomElement $element The element to be converted
	*/
	public function __construct($element){
		$this->element = $element;

		$this->parseOptions();
		$this->render();
	}

	private function parseOptions(){
		$this->default = $this->element->getAttribute("data-default");
		$this->anchors = $this->element->getAttribute("data-anchors");
		$this->exclude = $this->element->getAttribute("data-anchors-exclude");

		if(!empty($this->anchors)){
			$this->anchors = explode(",", $this->anchors);
		}

		if(!empty($this->exclude)){
			$this->exclude = explode(",", $this->exclude);
		}
	}

	private function render(){
		$available = self::getAnchors();
		$options = array();
		if(!empty($this->default) && isset($available[$this->default])){
			$options[$this->default] = $available[$this->default];
		}

		foreach($available as $key => $value){
			if($key !== $this->default){
				if(!empty($this->anchors)){
					if(!in_array($key, $this->anchors)){
						continue;
					}
				}

				if(!empty($this->exclude)){
					if(in_array($key, $this->exclude)){
						continue;
					}
				}

				$options[$key] = $value;
			}
		}

		foreach($options as $key => $value){
			$key = ucwords(strtolower(str_replace("_", " ", $key))) . (self::isLegacyAnchor($value) ? ' Map' : '');
			$option = "<option value='{$value}'>{$key}</option>";
			$this->element->import($option);
		}
	}

	public static function getAnchors() {
        $class = new \ReflectionClass(__CLASS__);
        return $class->getConstants();
    }

    public static function isLegacyAnchor($anchor){
    	return ($anchor === self::ABOVE || $anchor === self::BELOW);
    }
}