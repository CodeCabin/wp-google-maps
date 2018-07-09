<?php

namespace WPGMZA;

require_once(plugin_dir_path(__FILE__) . 'class.dom-element.php');

class DOMDocument extends \DOMDocument
{
	private $src_file;
	
	/**
	 * Constructor
	 * @see http://php.net/manual/en/class.domdocument.php
	 */
	public function __construct($version='1.0', $encoding='UTF-8')
	{
		\DOMDocument::__construct($version, $encoding);
		
		$this->registerNodeClass('DOMElement', 'WPGMZA\DOMElement');
		$this->onReady();
	}
	
	public static function convertUTF8ToHTMLEntities($html)
	{
		if(function_exists('mb_convert_encoding'))
			return mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
		else
		{
			trigger_error('Using fallback UTF to HTML entity conversion', E_USER_NOTICE);
			return htmlspecialchars_decode(utf8_decode(htmlentities($html, ENT_COMPAT, 'utf-8', false)));
		}
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
	 * Loads the specified file and evaulates nodes
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
		
		$this->onEvaluateNodes();
		$this->onLoaded();
		
		return $result;
	}
	
	/**
	 * Loads the specified file and parses any PHP
	 * @param string $src The file you want to load
	 * @param int $options See http://php.net/manual/en/domdocument.load.php
	 * @return boolean TRUE on success, FALSE otherwise
	 */
	public function loadPHPFile($src, $options=0)
	{
		if(!file_exists($src))
			throw new \Exception("File does not exist: $src");
		
		ob_start();
		include $src;
		$html = ob_get_clean();
		
		if(empty($html))
			throw new \Exception("$src is empty");
		
		$html = DOMDocument::convertUTF8ToHTMLEntities($html);
		$suppress_warnings = !(defined('WP_DEBUG') && WP_DEBUG);
		
		// From PHP 5.4.0 onwards, loadHTML takes 2 arguments
		if(version_compare(PHP_VERSION, '5.4.0', '>='))
		{
			if($suppress_warnings)
				$result = @$this->loadHTML($html, $options);
			else
				$result = $this->loadHTML($html, $options);
		}
		else
		{
			if($suppress_warnings)
				$result = @$this->loadHTML($html);
			else
				$result = $this->loadHTML($html);
		}
		
		$this->src_file = $src;
		
		$this->onLoaded();
		
		return $result;
	}
	
	/**
	 * @internal Handles imports based on the content
	 */
	protected function handleImport($subject, $node, $forcePHP=false)
	{
		if(preg_match('/\.html(\.php)?$/i', $subject))
		{
			if(!file_exists($subject))
				throw new \Exception("File '$subject' not found in {$this->src_file} line " . $node->getLineNo());
			
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
				
				if(realpath($filename) == realpath($subject))
					array_push($classes_in_file, $class);
			}
			
			if(empty($classes_in_file))
				throw new \Exception('No classes found in file');
			
			$class_name = $classes_in_file[ count($classes_in_file) - 1 ];
			$instance = new $class_name();
			
			if(!($instance instanceof DOMDocument))
				throw new \Exception('Class must be an instance of WPGMZA\\DOMDocument');
			
			$node->import($instance);
			
			return;
		}
		
		throw new \Exception("Failed to import page \"$subject\" in {$this->src_file} on line " . $node->getLineNo());
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
		$span->addClass('notice notice-error');
		return $span;
	}
	
	/**
	 * This function saves only the inside of the <body> element of this document. This is useful when you want to import a HTML document into another, but you don't want to end up with nested <html> elements
	 * @return string The HTML string
	 */
	public function saveInnerBody()
	{
		$result = '';
		
		$body = $this->querySelector('body');
		
		if(!$body)
			return null;
		
		for($node = $body->firstChild; $node != null; $node = $node->nextSibling)
			$result .= $this->saveHTML($node);
			
		return $result;
	}
}
