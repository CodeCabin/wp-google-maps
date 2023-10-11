<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

require_once(plugin_dir_path(__FILE__) . '../class.selector-to-xpath.php');

/**
 * Direct replacement for the defauly class.dom-element.php
 * 
 * Due to the fact it is located in the php8 sub directory, we will only load it for PHP 8 users
*/
class DOMElement extends \DOMElement
{
	protected static $xpathConverter;
	
	public function __construct()
	{
		\DOMElement::__construct();
	}
	
	public function __get($name)
	{
		switch($name)
		{
			case "html":
				
				return $this->ownerDocument->saveHTML( $this );
			
				break;
		}
		
		return \DOMElement::__get($name);
	}
	
	/**
	 * Runs a CSS selector on the element. This is equivilant to Javascripts querySelector
	 * @param string $query a CSS selector
	 * @return mixed The first descendant element that matches the selector, or NULL if there is no match
	 */
	public function querySelector($query)
	{
		$results = $this->querySelectorAll($query);		
		
		if(empty($results))
			return null;
		
		return $results[0];
	}
	
	/**
	 * Runs a CSS selector on the element. This is equivilant to Javascripts querySelectorAll
	 * @return mixed Any descendant element's that match the selector, or NULL if there is no match
	 */
	public function querySelectorAll($query, $sort=true)
	{
		$xpath 		= new \DOMXPath($this->ownerDocument);
		
		try{
			$expr 		= DOMElement::selectorToXPath($query);
		}catch(\Exception $e) {
			echo "<p class='notice notice-warning'>Failed to convert CSS selector to XPath (" . $e->getMessage() . ")</p>";
		}
		
		$list	 	= $xpath->query($expr, $this);
		$results	= array();
		
		for($i = 0; $i < $list->length; $i++)
			array_push($results, $list->item($i));
		
		if($sort)
			usort($results, array('WPGMZA\DOMElement', 'sortByDOMPosition'));
		
		return new DOMQueryResults($results);
	}
	
	/**
	 * Traverses from this node up it's ancestors and returns the first node that matches the given selector
	 * @param mixed $selector Either this node the first ancestor that matches this selector, or NULL if no match is found
	 */
	public function closest($selector)
	{
		if($this === $this->ownerDocument->getDocumentElementSafe())
			throw new \Exception('Method not valid on document element');
		
		for($el = $this; $el->parentNode != null; $el = $el->parentNode)
		{
			$m = $el->parentNode->querySelectorAll($selector);
			if(array_search($el, $m, true) !== false)
				return $el;
		}
		
		return null;
	}
	
	/**
	 * Wraps this element in the element passed in, then replaces this nodes original position
	 * @param DOMElement The element to wrap this element in
	 */
	public function wrap($wrapper)
	{
		$this->parentNode->replaceChild($wrapper, $this);
		$wrapper->appendChild($this);
	}
	
	/**
	 * Test if this element comes before the other element in the DOM tree
	 * @return boolean TRUE if this element comes before the other, FALSE if not
	 */
	public function isBefore($other)
	{
		if($this->parentNode === $other->parentNode)
			return ($this->getBreadth() < $other->getBreadth());
		
		$this_depth = $this->getDepth();
		$other_depth = $other->getDepth();
		
		if($this_depth == $other_depth)
			return $this->parentNode->isBefore($other->parentNode);
		
		if($this_depth > $other_depth)
		{
			$ancestor = $this;
			$ancestor_depth = $this_depth;
			
			while($ancestor_depth > $other_depth)
			{
				$ancestor = $ancestor->parentNode;
				$ancestor_depth--;
			}
			
			return $ancestor->isBefore($other);
		}
		
		if($this_depth < $other_depth)
		{
			$ancestor = $other;
			$ancestor_depth = $other_depth;
			
			while($ancestor_depth > $this_depth)
			{
				$ancestor = $ancestor->parentNode;
				$ancestor_depth--;
			}
			
			return $this->isBefore($ancestor);
		}
	}
	
	/**
	 * Returns the breadth (sometimes called child index) of this node in regards to it's siblings
	 * @return int The index of this node
	 */
	public function getBreadth()
	{
		$breadth = 0;
		for($node = $this->previousSibling; $node != null; $node = $node->previousSibling)
			$breadth++;
		return $breadth;
	}
	
	/**
	 * Returns the depth of this node in regards to it's ancestors
	 * @return int The depth of this node
	 */
	public function getDepth()
	{
		$depth = 0;
		for($node = $this->parentNode; $node != null; $node = $node->parentNode)
			$depth++;
		return $depth;
	}
	
	/**
	 * @internal sort function for DOM position sort
	 */
	private static function sortByDOMPosition($a, $b)
	{
		return ($a->isBefore($b) ? -1 : 1);
	}
	
	/**
	 * @internal Calls the CSS to XPath converter on the specified selector
	 * @param string $selector The CSS selector
	 * @return string The resulting XPath expression
	 */
	public static function selectorToXPath($selector)
	{
		if(!DOMElement::$xpathConverter)
			DOMElement::$xpathConverter = new Selector\XPathConverter();
		
		$xpath = DOMElement::$xpathConverter->convert($selector);
		
		return $xpath;
	}

	/**
	 * Imports the supplied subject into this node.
	 * @param mixed $subject. Either a \DOMDocument, \DOMNode, .html filename, or string containing HTML/text. The function will attempt to detect which. If you import HTML that contains a <body> element, it will only import the inner body
	 * @throws \Exception the subject was not recognised as any of the types above
	 * @return $this element
	 */
	public function import($subject, $forcePHP=false)
	{
		global $wpgmza;
		
		$node = null;
		
		if($subject instanceof \DOMDocument)
		{
			if(!$subject->getDocumentElementSafe())
				throw new \Exception('Document is empty');
			
			$node = $this->ownerDocument->importNode($subject->getDocumentElementSafe(), true);

		}
		else if($subject instanceof \DOMNode)
		{
			$node = $this->ownerDocument->importNode($subject, true);
		}
		else if(preg_match('/(\.html|\.php)$/i', $subject, $m))
		{
			// Subject is a filename
			if(!file_exists($subject))
				throw new \Exception('HTML file not found');
			
			$temp = new DOMDocument('1.0', 'UTF-8');
			if($forcePHP || preg_match('/\.php$/i', $m[1]))
				$temp->loadPHPFile($subject);
			else
				$temp->load($subject);
			
			$node = $this->ownerDocument->importNode($temp->getDocumentElementSafe(), true);
		}
		else if(is_string($subject))
		{
			if(empty($subject))
				return;
			
			if($subject != strip_tags($subject) || preg_match('/&.+;/', $subject))
			{
				// Subject is a HTML string
				$html = DOMDocument::convertUTF8ToHTMLEntities($subject);
				
				$temp = new DOMDocument('1.0', 'UTF-8');
				$str = "<div id='domdocument-import-payload___'>" . $html . "</div>";

				if($wpgmza->isInDeveloperMode()){
					$temp->loadHTML($str);
				} else {
					@$temp->loadHTML($str);
				}
				
				$body = $temp->querySelector('#domdocument-import-payload___');
				for($child = $body->firstChild; $child != null; $child = $child->nextSibling)
				{
					$node = $this->ownerDocument->importNode($child, true);
					$this->appendChild($node);
				}
			}
			else
				// Subject is a plain string
				$this->appendText($subject);
			
			return;
		}
		else if(empty($subject))
		{
			return;
		}
		else
			throw new \Exception('Don\'t know how to import "' . print_r($subject, true) . '" in ' . $this->ownerDocument->documentURI . ' on line ' . $this->getLineNo());
		
		if($body = $node->querySelector("body"))
		{
			// TODO: I don't think a query selector is necessary here. Iterating over the bodies children should be more optimal
			$results = $node->querySelectorAll("body>*");
			
			foreach($results as $child)
				$this->appendChild($child);
			
			return $results;
		}
		else
		{
			$this->appendChild($node);
			return $node;
		}
		
		return null;
	}
	
	/**
	 * Sets an inline CSS style on this element. If it's already set, the old value will be removed first
	 * @param string $name the CSS property name eg 'background-color'
	 * @param string $value the value of the property eg '#ff4400'
	 * @return $this
	 */
	public function setInlineStyle($name, $value)
	{
		$this->removeInlineStyle($name);
		$style = $this->getAttribute('style');
		$this->setAttribute('style', $style . $name . ':' . $value . ';');
		return $this;
	}
	
	/**
	 * Removes the inline CSS style specified by name
	 * @param string $name the name of the CSS property eg 'background-color'
	 * @return $this
	 */
	public function removeInlineStyle($name)
	{
		if(!$this->hasAttribute('style'))
			return;
		$style = $this->getAttribute('style');
		
		$rules = preg_split('/\s*;\s*/', $style);
		
		for($i = count($rules) - 1; $i >= 0; $i--)
		{
			$param = preg_quote($name);
			
			if(preg_match("/^$param\s*:/", trim($rules[$i])))
				unset($rules[$i]);
		}
		
		$this->setAttribute('style', implode(';', $rules));
		return $this;
	}
	
	/**
	 * Check if this element has an inline style by name
	 * @param string $name the name of the CSS property to test for
	 */
	public function hasInlineStyle($name)
	{
		if(!$this->hasAttribute('style'))
			return false;
		return preg_match("/\s*$name:.*?((;\s*)|$)/", $this->getAttribute('style'));
	}
	
	/**
	 * Gets the value of the inline style by name
	 * @param string $name the name of the CSS property you want the value for
	 * @return mixed FALSE if there is no style property or no style with that name exists, or a string containing the property value if it does
	 */
	public function getInlineStyle($name)
	{
		if(!$this->hasAttribute('style'))
			return false;
			
		$m = null;
		if(!preg_match("/\s*$name:(.*?)((;\s*)|$)/", $this->getAttribute('style')))
			return false;
			
		return $m[1];
	}
	
	/**
	 * Adds a class to this elements class attribute. It will be ignored if the class already exists
	 * @param string $name The classname
	 * @return $this
	 */
	public function addClass($name)
	{
		if($this->hasClass($name))
			return;
			
		$class = ($this->hasAttribute('class') ? $this->getAttribute('class') : '');
		$this->setAttribute('class', $class . (strlen($class) > 0 ? ' ' : '') . $name);
		
		return $this;
	}
	
	/**
	 * Removes the specified class from this nodes class attribute
	 * @param string $name The classname
	 * @return $this
	 */
	public function removeClass($name)
	{
		if(!$this->hasAttribute('class'))
			return;
			
		$class = trim(
				preg_replace('/\s{2,}/', ' ',
					preg_replace('/\\b' . $name . '\\b/', ' ', $this->getAttribute('class'))
				)
			);
			
		$this->setAttribute('class', $class);
		
		return $this;
	}
	
	/**
	 * Tests if the specified class exists on this elements class attribute
	 * @param string $name The classname
	 * @return boolean FALSE if no such class existst, TRUE if it does
	 */
	public function hasClass($name)
	{
		if(!$this->hasAttribute('class'))
			return false;
			
		return preg_match('/\\b' . $name . '\\b/', $this->getAttribute('class'));
	}
	
	/**
	 * Populates the target element. If it is a form element, the value will be set according to the elements type/nodeName. If not, the value will be imported instead.
	 * @param The target element. Usually a descendant of this element
	 * @param string $key the key of the value we're populating with, used for formatting
	 * @param string $value the value to populate with
	 * @param array $formatters an array associative of functions to format certain values with, functions should be specified by key
	 * @return void
	 */
	protected function populateElement($target, $key, $value, $formatters)
	{
		if(!($target instanceof \DOMElement))
			throw new \Exception('Argument must be a DOMElement');
		
		switch(strtolower($target->nodeName))
		{
			case 'textarea':
			case 'select':
			case 'input':
				$target->setValue($value);
				break;
				
			case 'img':
				$target->setAttribute('src', $value);
				break;
				
			default:
				if(!is_null($formatters) && isset($formatters[$key]))
					$value = $formatters[$key]($value);
					
				if($value instanceof \DateTime)
					$value = $value->format('D jS M \'y g:ia');
					
				if($key == 'price')
					$value = number_format($value, 2, '.', '');
					
				if(is_object($value))
					throw new \Exception('Expected simple type in "'.$key.'" => "'.print_r($value,true).'"');
				
				$target->import( $value );
				
				break;
		}
	}
	
	/**
	 * Takes a source object or associative array and optional array of formatting functions, and populates descendant named elements with the values from that source.
	 * @param mixed $src Associative array or object with the keys and values
	 * @param array $formatters Optional associative array of functions to format values with. The keys on this array correspond with the keys on $src
	 * @return DOMElement This element
	 */
	public function populate($src=null, $formatters=null)
	{
		$x = new \DOMXPath($this->ownerDocument);
		
		if(!$src)
			return $this;
		
		if(is_scalar($src))
		{
			$this->appendText($src);
			return $this;
		}
		
		foreach($src as $key => $value)
		{
			if(is_array($value))
			{
				$m = $x->query('descendant-or-self::*[@name="' . $key . '[]"]', $this);
				
				if($m->length > 0 && count($value) != $m->length)
				{
					if($src = $m->item(0)->closest('li,tr'))
					{
						for($i = $m->length; $i < count($value); $i++)
						{
							$item = $src->cloneNode(true);
							$src->parentNode->appendChild($item);
						}
						$m = $x->query('descendant-or-self::*[@name="' . $key . '[]"]', $this);
					}
					else
						throw new \Exception('Number of elements must match (' . count($value) . ' != ' . $m->length . ')');
				}
				
				for($i = 0; $i < $m->length; $i++)
					$this->populateElement($m->item($i), $key, $value[$i], $formatters);
			}
			else
			{
				$m = $x->query('descendant-or-self::*[@name="' . $key . '" or @data-name="' . $key . '"]', $this);
				
				for($i = 0; $i < $m->length; $i++)
					$this->populateElement($m->item($i), $key, $value, $formatters);
			}
		}
		
		return $this;
	}
	
	public function serializeFormData()
	{
		$data = array();
		
		foreach($this->querySelectorAll('input, select, textarea') as $input)
		{
			$name = $input->getAttribute('name');
			
			if(!$name)
				continue;
			
			if(preg_match('/nonce/i', $name))
				continue; // NB: Do not serialize nonce values
			
			switch($input->getAttribute('type'))
			{
				case 'checkbox':
				
					if($input->getValue())
						$data[$name] = true;
					else
						$data[$name] = false;
					
					break;
					
				case 'radio':
				
					if($input->getAttribute('checked'))
						$data[$name] = $input->getAttribute('value');
				
					break;
				
				default:
					$data[$name] = $input->getValue();
					break;
			}
		}
		
		return $data;
	}
	
	/**
	 * Gets the value of this element
	 * @return mixed A string if the element a text input, textarea or plain node, a boolean if the element is a checkbox or radio, or the value of the selected option if this element is a select
	 */
	public function getValue()
	{
		switch(strtolower($this->nodeName))
		{
			case 'input':
				$type = ($this->hasAttribute('type') ? $this->getAttribute('type') : 'text');
				switch($type)
				{
					case 'radio':
					case 'checkbox':
						return $this->hasAttribute('checked');
						break;
					
					default:
						return $this->getAttribute('value');
						break;
				}
				break;
				
			case 'select':
				$option = $this->querySelector('option[selected]');
				if(!$option)
					return null;
				
				if($option->hasAttribute('value'))
					return $option->getAttribute('value');
				
			default:
				return $this->nodeValue;
				break;
		}
	}
	 
	/**
	 * Sets the value of this element. Intended for form elements only. If this element is a textarea, it will be appended as plain text. If this element is a select, it will attempt to select the option with the specified value. If the input is a radio or checkbox, it will set it accordingly. Otherwise, the value will be put into the value attribute
	 * @throws \Exception If this element is a select, SMART_STRICT_MODE is declared and no option with that value exists
	 * @throws \Exception If you call this method on a non-form element
	 * @return This element
	 */
	public function setValue($value)
	{
		/*if($this->getAttribute("name") == "wpgmza_gdpr_require_consent_before_load")
		{
			
			echo "<pre>";
			debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
			exit;
		}*/
		
		switch(strtolower($this->nodeName))
		{
			case 'textarea':
				$this->clear();
				$this->appendText( $value );
				break;
			
			case 'select':
				$deselect = $this->querySelectorAll('option[selected]');
				foreach($deselect as $d)
					$d->removeAttribute('selected');
				
				if($value === null)
					return $this;
				
				$option = $this->querySelector('option[value="' . $value . '"]');
				
				if(!$option)
					trigger_error('Option with value "' . $value . '" not found in "' . ($this->getAttribute('name')) . '"', E_USER_WARNING);
				else
					$option->setAttribute('selected', 'selected');
				
				break;
				
			case 'input':
				if(!$this->hasAttribute('type') || $this->getAttribute('type') == 'text')
				{
					if(is_string($value))
						$this->setAttribute('value', $value);
				}
				else switch(strtolower($this->getAttribute('type')))
				{
					case 'radio':
						if($this->hasAttribute('value') && $this->getAttribute('value') == $value)
							$this->setAttribute('checked', 'checked');
						else
							$this->removeAttribute('checked');
						break;
						
					case 'checkbox':
						if(!empty($value) && $value != false)
							$this->setAttribute('checked', 'checked');
						else
							$this->removeAttribute('checked');
						break;
						
					default:
						$this->setAttribute('value', $value);
						break;
				}
				break;
				
			default:
				throw new \Exception('Not yet implemented');
				
				$this->nodeValue = $value;
				break;
		}
		
		return $this;
	}
	
	/**
	 * Appends the specified text to this element, shorthand utility function
	 * @return \Smart\Element This element 
	 */
	public function appendText($text)
	{
		$this->appendChild( $this->ownerDocument->createTextNode( $text ) );
		return $this;
	}

	/**
	 * Utility function to append the specified element after one of this elements children. Will append at the end if after is null
	 * @param \Smart\Element the element to insert
	 * @param \Smart\Element one of this elements children, or null
	 * *@return \Smart\Element this element
	 */
	public function insertAfter($elem, $after=null)
	{
		if($after->parentNode && $after->parentNode !== $this)
			throw new \Exception('Hierarchy error');
		
		if($after->nextSibling)
			$this->insertBefore($elem, $after->nextSibling);
		else
			$this->appendChild($elem);
		
		return $this;
	}
	
	/**
	 * Clears this element, completely removing all it's contents
	 * @return \Smart\Element This element
	 */
	public function clear()
	{

		while($this->childNodes->length)
			$this->removeChild($this->firstChild);
		return $this;
	}
	 
	/**
	 * Removes this element from it's parent
	 * @return \Smart\Element This element
	 */
	public function remove() : void
	{
		if($this->parentNode)
			$this->parentNode->removeChild($this);
	}
}

