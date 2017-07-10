<?php

namespace Smart;

if(defined('SMART_DOCUMENT_LOADED'))
	return;

define('SMART_NAMESPACE_URI', 'http://www.rylancecreativestudios.co.uk/Smart/');
define('SMART_LIBRARY_DIR', __DIR__);
define('SMART_DOCUMENT_LOADED', true);

require_once(__DIR__ . '/class.element.php');

class Document extends \DOMDocument
{
	private $src_file;
	
	/**
	 * Constructor
	 * @see http://php.net/manual/en/class.domdocument.php
	 */
	public function __construct($version='1.0', $encoding='UTF-8')
	{
		parent::__construct($version, $encoding);
		$this->registerNodeClass('DOMElement', 'Smart\Element');
		$this->onReady();
	}
	
	/**
	 * Fired after construction when the Document is initialized
	 * @return void
	 */
	protected function onReady()
	{
		
	}
	
	/**
	 * Fired after content has been loaded
	 * @return void
	 */
	protected function onLoaded()
	{
		
	}
	
	/**
	 * Loads the specified file and evaulates smart nodes
	 * @see http://php.net/manual/en/domdocument.load.php
	 * @param string $src The file you want to load
	 * @param int $options See http://php.net/manual/en/domdocument.load.php
	 * @return boolean TRUE on success, FALSE otherwise
	 */
	public function load($src, $options=null)
	{
		if(!is_string($src))
			throw new \Exception('Input must be a string');
		
		$result = \DOMDocument::load($src, $options);
		$this->src_file = $src;
		
		$this->onEvaluateSmartNodes();
		$this->onLoaded();
		
		return $result;
	}
	
	/**
	 * Loads the specified file and parses any PHP
	 * @param string $src The file you want to load
	 * @param int $options See http://php.net/manual/en/domdocument.load.php
	 * @return boolean TRUE on success, FALSE otherwise
	 */
	public function loadPHPFile($src, $options=null)
	{
		ob_start();
		include $src;
		$html = ob_get_clean();
		
		if(empty($html))
			throw new \Exception("$src is empty");
		
		$html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
		$result = $this->loadHTML($html);
		
		$this->src_file = $src;
		
		$this->onEvaluateSmartNodes();
		$this->onLoaded();
		
		return $result;
	}
	
	/**
	 * @internal evaulates an inline variable
	 */
	protected function evaluateInlineVariable($str, $node)
	{
		$class = get_class($node);
		$line = $node->getLineNo();
		$name = $node->nodeName;
		$file = $this->src_file;
		
		// echo "Evaluating '$str' in $name on line $line in $file\r\n";
		
		$GLOBALS['__smart_eval_error_suffix'] = " in $class $name on line $line in $file";
		
		set_error_handler(function($errno, $errstr, $errfile, $errline, array $errcontext) {
			if(0 === error_reporting())
				return false;
			
			$errstr .= $GLOBALS['__smart_eval_error_suffix'];
			
			throw new \ErrorException($errstr, 0, $errno, $errfile, $errline);
		});
		
		$result = eval("return $str;");
		restore_error_handler();
		
		return $result;
	}
	
	/**
	 * @internal Handles imports based on the content
	 */
	protected function handleImport($subject, $node, $forcePHP=false)
	{
		if(preg_match('/\.html$/i', $subject))
		{
			if(!file_exists($subject))
				throw new \Exception("File '$subject' not found");
			
			$node->import($subject, $forcePHP);
			
			return;
		}
		
		if(preg_match('/\.php$/i', $subject))
		{
			if(!file_exists($subject))
				throw new \Exception("File '$subject' not found");
			
			$before = get_declared_classes();
			require_once($subject);
			$after = get_declared_classes();
			$diff = array_diff($after, $before);
			
			$classes_in_file = array();
			
			foreach($diff as $class) {
				$reflection = new \ReflectionClass($class);
				$filename = $reflection->getFileName();
				
				if(realpath($filename) == realpath($page_php_filename))
					array_push($classes_in_file, $class);
			}
			
			if(empty($classes_in_file))
				throw new \Exception("No classes defined in $page_php_filename to import");
			
			/*if(count($classes_in_file) > 1)
				throw new \Exception("Don't know which class to import in $page_php_filename");*/
			
			$class_name = $classes_in_file[ count($classes_in_file) - 1 ];
			$instance = new $class_name();
			
			if(!($instance instanceof Document))
				throw new \Exception('Class must be an instance of Smart\\Page');
			
			$node->import($instance);
			
			return;
		}
		
		throw new \Exception("Failed to import page \"$subject\" in {$this->src_file} on line " . $node->getLineNo());
	}
	
	/**
	 * @internal gathers and handles any smart nodes
	 */
	protected function onEvaluateSmartNodes()
	{
		$xpath = new \DOMXPath($this);
		
		$m = $xpath->query('
			//@*[namespace-uri()="' . SMART_NAMESPACE_URI . '"]
			|
			//*[@*[starts-with(., "smart:")]]
			|
			//*[@*[starts-with(name(), "smart:")]]
		', $this);
		
		$elems = array();
		
		foreach($m as $node)
		{
			if($node->nodeType == XML_ATTRIBUTE_NODE)
				$subject = $node->ownerElement;
			else if($node->nodeType == XML_ELEMENT_NODE)
				$subject = $node;
			else
				throw new \Exception('Invalid node type');
			
			if(array_search($subject, $elems, true) === false)
				array_push($elems, $subject);
		}
		
		foreach($elems as $el)
			$this->onEvaluateNode($el);
	}
	
	/**
	 * Evaluates smart nodes
	 * Available nodes:
	 * eval: (inside attribute) evaluate PHP code
	 * smart:filter (attribute) if the content of this attribute evaulates to 0 (or FALSE, or NULL) the node will be removed. You can use eval: or PHP inside this node if loading with loadPHPFile
	 * smart:import (attribute) imports the specified HTML file
	 * smart:import-php (attribute) imports the specified HTML file but parses PHP inside it. Do NOT use with ANY HTML that has been generated from user input, this would cause a critical security vulnerability
	 * smart:populate (attribute) populates named elements (elements with 'name' attribute) with the data inside. Must be an object or array in PHP format. Again, do NOT use with ANY values that have been near user input
	 * smart:fill (attribute) fills the element with the specified text. Useful for filling nodes with dynamic text.
	 * smart:list (attribute) (beta) takes an array of PHP objects/subarrays/DOMDocuments and imports them to the element
	 * @param \Smart\Element $node the node to evaluate
	 * @return void
	 */
	protected function onEvaluateNode($node)
	{
		//echo "Evaluating {$node->nodeName} on line {$node->getLineNo()} in {$this->documentURI}<br/>";
		
		foreach($node->attributes as $attr)
		{
			if(strpos($attr->value, 'eval:') === 0)
			{
				$value = $this->evaluateInlineVariable(substr($attr->value, 6), $attr);
				
				//$attr->value = $value;
				$attr->value = htmlspecialchars($value);
			}
		}
		
		if($node->hasAttributeNS(SMART_NAMESPACE_URI, 'filter'))
		{
			$filter = $node->getAttributeNS(SMART_NAMESPACE_URI, 'filter');

			if(empty($filter))
				$node->remove();
			
			$node->removeAttributeNS(SMART_NAMESPACE_URI, 'filter');
		}
		
		if($node->hasAttributeNS(SMART_NAMESPACE_URI, 'import') || $node->hasAttribute('smart:import'))
		{
			$import = ($node->getAttributeNS(SMART_NAMESPACE_URI, 'import') | $node->getAttribute('smart:import'));
			
			$this->handleImport($import, $node);
			
			$node->removeAttributeNS(SMART_NAMESPACE_URI, 'import');
			$node->removeAttribute('smart:import');
		}
		
		if($node->hasAttributeNS(SMART_NAMESPACE_URI, 'import-php') || $node->hasAttribute('smart:import-php'))
		{
			$import = ($node->getAttributeNS(SMART_NAMESPACE_URI, 'import-php') | $node->getAttribute('smart:import-php'));
			
			$this->handleImport($import, $node, true);
			
			$node->removeAttributeNS(SMART_NAMESPACE_URI, 'import-php');
			$node->removeAttribute('smart:import-php');
		}
		
		if($node->hasAttributeNS(SMART_NAMESPACE_URI, 'populate'))
		{
			$populate = $node->getAttributeNS(SMART_NAMESPACE_URI, 'populate');
			$source = eval("return $populate;");
			$node->populate($source);
		}
		
		if($node->hasAttributeNS(SMART_NAMESPACE_URI, 'fill'))
		{
			$fill = $node->getAttributeNS(SMART_NAMESPACE_URI, 'fill');
			$node->appendText($fill);
		}
		
		if($list = $node->getAttributeNS(SMART_NAMESPACE_URI, 'list'))
		{
			$source = eval("return $list;");
			if(!is_array($source))
				throw new \Exception('List source must be an array');
			
			foreach($source as $obj)
				$node->import($obj);
		}
	}
	
	/**
	 * Runs a CSS selector on the element. This is equivilant to Javascripts querySelector
	 * @param string $query a CSS selector
	 * @return mixed The first descendant \Smart\Element that matches the selector, or NULL if there is no match
	 */
	public function querySelector($query)
	{
		if(!$this->documentElement)
			throw new \Exception('Document is empty');
		return $this->documentElement->querySelector($query);
	}
	
	/**
	 * Runs a CSS selector on the element. This is equivilant to Javascripts querySelectorAll
	 * @return mixed Any descendant \Smart\Element's that match the selector, or NULL if there is no match
	 */
	public function querySelectorAll($query)
	{
		if(!$this->documentElement)
			throw new \Exception('Document is empty');
		return $this->documentElement->querySelectorAll($query);
	}
	
	/**
	 * Takes an associative array or object, and populates this element with it
	 * @param mixed $src Object or associative array
	 * @return void
	 */
	public function populate($src, $formatters=null)
	{
		if(!$this->documentElement)
			throw new \Exception('Document is empty');
		return $this->documentElement->populate($src, $formatters);
	}
	
	/**
	 * Utility function to create an error element
	 * @param string $message The error message
	 * @return \Smart\Element
	 */
	public function createErrorElement($message)
	{
		$span = $this->createElement('span');
		$span->appendText($message);
		$span->addClass('error');
		return $span;
	}
	
	/**
	 * This function saves only the inside of the <body> element of this document. This is useful when you want to import a HTML document into another, but you don't want to end up with nested <html> elements
	 * @return string The HTML string
	 */
	public function saveInnerBody()
	{
		$result = '';
		
		foreach($this->querySelectorAll('body>*') as $node)
			$result .= $this->saveHTML($node);
			
		return $result;
	}
}

?>