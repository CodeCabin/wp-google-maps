<?php

namespace Smart;

require_once(__DIR__ . '/class.selector-to-xpath.php');

class Element extends \DOMElement
{
	protected static $xpathConverter;
	
	public function __construct()
	{
		\DOMElement::__construct();
	}
	
	/*
	 * DOM Traversal
	 */
	public function querySelector($query)
	{
		$results = $this->querySelectorAll($query);		
		if(empty($results))
			return null;
		return $results[0];
	}
	
	public function querySelectorAll($query)
	{
		$xpath 		= new \DOMXPath($this->ownerDocument);
		$expr 		= Element::selectorToXPath($query);
		
		$list	 	= $xpath->query($expr, $this);
		$results	= array();
		
		for($i = 0; $i < $list->length; $i++)
			array_push($results, $list->item($i));
		
		usort($results, array('Smart\Element', 'sortByDOMPosition'));
		
		return $results;
	}
	
	public function closest($selector)
	{
		if($this === $this->ownerDocument->documentElement)
			throw new \Exception('Method not valid on document element');
		
		for($el = $this; $el->parentNode != null; $el = $el->parentNode)
		{
			$m = $el->parentNode->querySelectorAll($selector);
			if(array_search($el, $m, true) !== false)
				return $el;
		}
		
		return null;
	}
	
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
	
	public function getBreadth()
	{
		$breadth = 0;
		for($node = $this->previousSibling; $node != null; $node = $node->previousSibling)
			$breadth++;
		return $breadth;
	}
	
	public function getDepth()
	{
		$depth = 0;
		for($node = $this->parentNode; $node != null; $node = $node->parentNode)
			$depth++;
		return $depth;
	}
	
	private static function sortByDOMPosition($a, $b)
	{
		return ($a->isBefore($b) ? -1 : 1);
	}
	
	public static function selectorToXPath($selector)
	{
		if(!Element::$xpathConverter)
			Element::$xpathConverter = new Selector\XPathConverter();
		
		$xpath = Element::$xpathConverter->convert($selector);
		
		return $xpath;
	}

	/*
	 * Content
	 */
	public function import($subject, $forcePHP=false)
	{
		$node = null;
		
		if($subject instanceof \DOMDocument)
		{
			if(!$subject->documentElement)
				throw new \Exception('Document is empty');
			
			$node = $this->ownerDocument->importNode($subject->documentElement, true);

		}
		else if($subject instanceof \DOMNode)
		{
			$node = $this->ownerDocument->importNode($subject, true);
		}
		else if(preg_match('/\.html$/i', $subject))
		{
			if(!file_exists($subject))
				throw new \Exception('HTML file not found');
			
			$temp = new Document('1.0', 'UTF-8');
			if($forcePHP)
				$temp->loadPHPFile($subject);
			else
				$temp->load($subject);
			
			$node = $this->ownerDocument->importNode($temp->documentElement, true);
		}
		else if(is_string($subject))
		{
			if(empty($subject))
				return;
			
			$subject = mb_convert_encoding($subject, 'HTML-ENTITIES', 'UTF-8');
			
			$temp = new Document('1.0', 'UTF-8');
			$temp->loadHTML($subject);
			
			$body = $temp->querySelector('body');
			for($child = $body->firstChild; $child != null; $child = $child->nextSibling)
			{
				$node = $this->ownerDocument->importNode($child, true);
				$this->appendChild($node);
			}
			
			return;
		}
		else if(empty($subject))
		{
			return;
		}
		else
			throw new \Exception('Don\'t know how to import "' . print_r($subject, true) . '" in ' . $this->ownerDocument->documentURI . ' on line ' . $this->getLineNo());
		
		if($node->querySelector("body"))
		{
			//var_dump("importing body children");
			
			foreach($node->querySelectorAll("body>*") as $child)
			{
				/*var_dump("Importing {$child->nodeName}<br/>");
				
				var_dump(
					$this->ownerDocument->saveXML($child)
				);*/
				
				$this->appendChild($child);
			}
		}
		else
			$this->appendChild($node);
		
		if($this->querySelector('html'))
			throw new \Exception('NOO');
		
		return $this;
	}
	
	/*
	 * Inline styling
	 */
	public function setInlineStyle($name, $value)
	{
		$this->removeInlineStyle($name);
		$style = $this->getAttribute('style');
		$this->setAttribute('style', $style . $name . ':' . $value . ';');
	}
	
	public function removeInlineStyle($name)
	{
		if(!$this->hasAttribute('style'))
			return;
		$style = $this->getAttribute('style');
		$this->setAttribute('style', preg_replace("/\s*$name:.*?((;\s*)|$)/", '', $style));
	}
	
	public function hasInlineStyle($name)
	{
		if(!$this->hasAttribute('style'))
			return false;
		return preg_match("/\s*$name:.*?((;\s*)|$)/", $this->getAttribute('style'));
	}
	
	public function getInlineStyle($name)
	{
		if(!$this->hasAttribute('style'))
			return false;
			
		$m = null;
		if(!preg_match("/\s*$name:(.*?)((;\s*)|$)/", $this->getAttribute('style')))
			return false;
			
		return $m[1];
	}
	
	/*
	 * Class
	 */
	public function addClass($name)
	{
		if($this->hasClass($name))
			return;
			
		$class = ($this->hasAttribute('class') ? $this->getAttribute('class') : '');
		$this->setAttribute('class', $class . (strlen($class) > 0 ? ' ' : '') . $name);
	}
	
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
	}
	
	public function hasClass($name)
	{
		if(!$this->hasAttribute('class'))
			return false;
			
		return preg_match('/\\b' . $name . '\\b/', $this->getAttribute('class'));
	}
	
	/*
	 * Population
	 */
	protected function populateElement($target, $key, $value, $formatters)
	{
		if(!($target instanceof \DOMElement))
			throw new \Exception('Argument must be a DOMElement');
		
		if($target->hasAttributeNS(SMART_NAMESPACE_URI, 'html'))
		{
			$target->clear();
			$target->import($value);
			return;
		}
		
		switch(strtolower($target->nodeName))
		{
			case 'textarea':
			case 'select':
			case 'input':
				$target->setValue($value);
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
					
				if($this->hasAttributeNS(SMART_NAMESPACE_URI, 'populate-clear') && $this->getAttribute(SMART_NAMESPACE_URI, 'populate-clear') == false)
					$target->clear();
				
				$target->appendText( $value );
				
				break;
		}
	}
	
	/*
	 * Populate
	 */
	public function populate($src=null, $formatters=null)
	{
		$x = new \DOMXPath($this->ownerDocument);
		
		if($src === null)
		{
			if(preg_match('/form/i', $this->nodeName))
			{
				$method = 'GET';
				
				if($this->hasAttribute('method'))
					$method = $this->getAttribute('method');
				
				switch(strtoupper($method))
				{
					case 'GET':
						$src = $_GET;
						break;
						
					case 'POST':
						$src = $_POST;
						break;
						
					default:
						throw new \Exception("Unknown method $method");
						break;
				}
			}
		}
		
		/*if($src === null)
			throw new \Exception("Populate source cannot be null for {$this->nodeName} on line " . $this->getLineNo() . " in {$this->ownerDocument->documentURI}");*/
		
		if($src === null)
			return;
		
		if(is_scalar($src))
		{
			$this->appendText($src);
			return;
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
				$m = $x->query('descendant-or-self::*[@name="' . $key . '"]', $this);
				
				for($i = 0; $i < $m->length; $i++)
					$this->populateElement($m->item($i), $key, $value, $formatters);
			}
		}
	}
	
	/*
	 * Form validation
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
	 
	public function setValue($value)
	{
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
					return;
				
				$option = $this->querySelector('option[value="' . $value . '"]');
				
				if(!$option)
					throw new \Exception('Option with value "' . $value . '" not found in "' . ($this->getAttribute('name')) . '"');
				
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
						if($value != false)
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
				echo "Setting nodeValue on {$this->nodeName}";
				echo "<pre>";
				throw new \Exception('No');
				
				$this->nodeValue = $value;
				break;
		}
	}
	
	public function isValid()
	{
		if($this->hasAttribute('exclude-from-validation') && strtolower($this->getAttribute('exclude-from-validation')) == 'true')
			return true;
		
		if($this->hasAttribute('required') && preg_match('/required|true/i', $this->getAttribute('required')))
		{
			$type = ($this->hasAttribute('type') ? strtolower($this->getAttribute('type')) : 'text');
			
			switch($type)
			{
				case 'radio':
					if(!$this->hasAttribute('name'))
						throw new \Exception('Radio must have name to be validated');
				
					$form = $this->closest('form');
					$name = $this->getAttribute('name');
					
					if(!$form->querySelector('input[type="radio"][name="' . $name . '"][checked]'))
						return false;
					
					break;
					
				default:
					$value = $this->getValue();
					if(empty($value))
						return false;
					break;
			}
		}
		
		if($this->hasAttribute('pattern'))
		{
			$escaped = addcslashes($this->getAttribute('pattern'), '/');
			$regexp = '/^' . $escaped . '$/';
			
			$result = preg_match($regexp, $this->getValue());
			
			switch(preg_last_error())
			{
				case PREG_NO_ERROR:
					break;
				
				case PREG_INTERNAL_ERROR:
					throw new \Exception('Internal Error');
					break;
				
				case PREG_BACKTRACK_LIMIT_ERROR:
					throw new \Exception('Backtrack limit exceeded');
					break;
					
				case PREG_RECURSION_LIMIT_ERROR:
					throw new \Exception('Recursion limit exceeded');
					break;
					
				case PREG_BAD_UTF8_ERROR:
					throw new \Exception('UTF-8 data malformed');
					break;
				
				case PREG_BAD_UTF8_OFFSET_ERROR:
					throw new \Exception('Bad UTF-8 offset error');
					break;
					
				case PREG_JIT_STACKLIMIT_ERROR:
					throw new \Exception('PCRE function failed due to limited JIT stack space');
					break;
				
				default:
					throw new \Exception('Unknown error');
					break;
			}
			
			if($result === 0)
				return false;
			else if($result === false)
				throw new \Exception('Failed to parse regex pattern "' . $this->getAttribute('pattern') . '" for "'.$this->getAttribute('name').'"');
		}
		
		if($this->hasAttributeNS(SMART_NAMESPACE_URI, 'repeat'))
		{
			$name = $this->getAttributeNS(SMART_NAMESPACE_URI, 'repeat');
			$form = $this->closest('form');
			if(!($source = $form->querySelector('*[name="' . $name . '"]')))
				throw new \Exception("Source element for repeat '$name' not found");
			
			if($source->getValue() != $this->getValue())
				return false;
		}
		
		if($this->hasClass('g-recaptcha') && !(defined('RECAPTCHA_IGNORE') && RECAPTCHA_IGNORE))
		{
			if(!defined('RECAPTCHA_SECRET'))
				throw new \Exception('reCAPTCHA private key not defined');
			
			if(!isset($_POST['g-recaptcha-response']))
				throw new \Exception('reCAPTCHA response not in POST body');
			
			$fields = array(
				'secret' => RECAPTCHA_SECRET,
				'response' => $_POST['g-recaptcha-response']
			);
			
			$ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
			$result = curl_exec($ch);
			curl_close($ch);
			
			if($result === false)
				throw new \Exception('Failed to contact reCAPTCHA server');
			
			$json = json_decode($result);
			$this->response = $json;
			
			if($json->success == false)
				return false;
		}
		
		if($this->hasAttributeNS(SMART_NAMESPACE_URI, 'html'))
		{
			require_once('/lib/HTMLPurifier.auto.php');
			
			$config = \HTMLPurifier_Config::createDefault();
			$purifier = new \HTMLPurifier($config);
			
			$dirty_html = $this->ownerDocument->saveHTML($this);
			$clean_html = $purifier->purify($dirty_html);
			
			$a = new \DOMDocument();
			$b = new \DOMDocument();
			$a->preserveWhiteSpace = false;
			$b->preserveWhiteSpace = false;
			$a->formatOutput = false;
			$b->formatOutput = false;
			libxml_use_internal_errors(true);
			$a->loadHTML($dirty_html);
			$b->loadHTML($clean_html);
			libxml_use_internal_errors(false);
			$a = $a->C14N();
			$b = $b->C14N();
			
			if($a != $b)
				return false;
		}
		
		return true;
	}
	
	public function validate()
	{
		if(!preg_match('/form/i', $this->nodeName))
			throw new \Exception('Method only valid on form elements');
		
		$xpath = new \DOMXPath($this->ownerDocument);
		$xpath->registerNamespace('smart', SMART_NAMESPACE_URI);
		$m = $xpath->query('descendant::*[contains(@class,"g-recaptcha")] | descendant::input[@required|@pattern|@smart:repeat] | descendant::select[@required] | descendant::*[@smart:purify-html]', $this);
		
		foreach($m as $el)
		{
			if(!$el->isValid())
			{
				$message = ($el->hasAttribute('title') ? $el->getAttribute('title') : 'Please try again');
				$error = $this->ownerDocument->createErrorElement($message);
				
				if($el->hasAttribute('name'))
					$error->setAttributeNS(SMART_NAMESPACE_URI, 'smart:target', $el->getAttribute('name'));
				
				$el->parentNode->insertAfter($error, $el);
				
				return false;
			}
		}	
		return true;
	}
	
	/*
	 * Utility functions
	 */
	public function appendText($text)
	{
		$this->appendChild( $this->ownerDocument->createTextNode( $text ) );
	}

	public function insertAfter($elem, $after)
	{
		if($after->parentNode !== $this)
			throw new \Exception('Hierarchy error');
		
		if($after->nextSibling)
			$this->insertBefore($elem, $after->nextSibling);
		else
			$this->appendChild($elem);
	}
	
	public function clear()
	{
		while($this->childNodes->length)
			$this->removeChild($this->firstChild);
		return $this;
	}
	 
	public function remove()
	{
		if($this->parentNode)
			$this->parentNode->removeChild($this);
		return $this;
	}
}

?>