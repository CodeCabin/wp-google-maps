<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * We don't actually need to be callin require once here at all
 * 
 * The autoloader works fine, but because it was rebuilt in some ways for PHP8 
 * 
 * We will leave it as it, with a conditional PHP8 brach for now
 * 
 * Expect this to be removed more fully soon
*/
if(version_compare(phpversion(), '8.0', '>=')){
	require_once(plugin_dir_path(__FILE__) . 'php8/class.dom-element.php');
} else {
	require_once(plugin_dir_path(__FILE__) . 'class.dom-element.php');
}

#[\AllowDynamicProperties]
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

		try{
			if(version_compare(phpversion(), '8.2', '>=') && function_exists('mb_encode_numericentity')){
				/* Deprecations in PHP require us to rework the way we do conversions */
				$converted = htmlspecialchars_decode(mb_encode_numericentity(htmlentities($html, ENT_QUOTES, 'UTF-8'), [0x80, 0x10FFFF, 0, ~0], 'UTF-8'));
				return $converted;
			} else {
				if(function_exists('mb_convert_encoding')){
					return mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
				} else{
					trigger_error('Using fallback UTF to HTML entity conversion', E_USER_NOTICE);
					return htmlspecialchars_decode(utf8_decode(htmlentities($html, ENT_COMPAT, 'utf-8', false)));
				}
			}
		} catch (\Exception $ex){
			if(function_exists('mb_convert_encoding')){
				return mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
			} else{
				trigger_error('Using fallback UTF to HTML entity conversion', E_USER_NOTICE);
				return htmlspecialchars_decode(utf8_decode(htmlentities($html, ENT_COMPAT, 'utf-8', false)));
			}
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
	#[\ReturnTypeWillChange]
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
	
	private function translateLineNumber($htmlLineNumber, $src)
	{
		
	}
	
	public function onError($severity, $message, $file, $unused)
	{
		if(!preg_match('/DOMDocument::loadHTML.+line: (\d+)/', $message, $m)){
			trigger_error($message, E_USER_WARNING);
			return;
		}
		
		$htmlLineNumber	= $m[1];
		$lines			= file($this->src_file);
		
		$totalPhpLines	= count($lines);
		$lineCounter	= 1;
		
		$allowShortTags	= ini_get('short_open_tag') == "1";
		$regexOpenTag	= ($allowShortTags ? '/<\?(php)?/' : '/<\?php/');
		$regexCloseTag	= "/\?>/";
		
		$inPhp			= false;
		
		for($phpLineNumber = 1; $phpLineNumber <= $totalPhpLines; $phpLineNumber++)
		{
			if($lineCounter == $htmlLineNumber)
			{
				$message = preg_replace(
					array('/loadHTML/', '/line: \d+/'), 
					array('loadPHPFile', "line: $phpLineNumber"), 
					$message
				);

				/* Supress error because MO files cause issues which can be ignored */
				/* Update 2022-05-12 -> We don't need to log these at all, 
				 * even surpression results in php-error class being added to WP admin area
				 * 
				 * So we simply don't track the notice as it doesn't serve a real purpose on account of MO files 
				*/
				/*
				@trigger_error($message, E_USER_WARNING);
				*/
				return;
			}
			
			$line			= $lines[$phpLineNumber - 1];
			
			$numOpenTags	= preg_match_all($regexOpenTag, $line);
			$numCloseTags	= preg_match_all($regexCloseTag, $line);
			
			if($numOpenTags > $numCloseTags)
			{
				$inPhp		= true;
			}
			else if($numCloseTags > 0)
			{
				$inPhp		= false;
				$lineCounter--;	// NB: I don't understand why a close tag swallows the newline, but it does appear to
			}
			
			if(!$inPhp)
				$lineCounter++;
		}

		$safeEntities = array('progress');
		foreach($safeEntities as $entity){
			if(preg_match("/DOMDocument::loadHTML.+{$entity} invalid in Entity/", $message, $m)){
				// HTML 5 safe entity, doesn't need to be logged
				return;
			}
		}
		
		trigger_error("Failed to translate line number", E_USER_WARNING);
		trigger_error($message, E_USER_WARNING);
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
		
		$this->src_file		= $src;
		$html				= DOMDocument::convertUTF8ToHTMLEntities($html);
		$suppress_warnings	= !(defined('WP_DEBUG') && WP_DEBUG);
		
		if(!$suppress_warnings)
		{
			$error_handler = set_error_handler(array($this, 'onError'), E_WARNING);
		}
		
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
		
		if(!$suppress_warnings)
			set_error_handler($error_handler);
		
		$this->onLoaded();
		
		return $result;
	}
	
	public function getDocumentElementSafe()
	{
		// Workaround for some installations of PHP missing documentElement property
		if(property_exists($this, 'documentElement'))
			return $this->documentElement;
		
		$xpath = new \DOMXPath($this);
		$result = $xpath->query('/html/body');
		$item = $result->item(0);
		
		return $item;
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
		if(!$this->getDocumentElementSafe())
			throw new \Exception('Document is empty');
		
		return $this->getDocumentElementSafe()->querySelector($query);
	}
	
	/**
	 * Runs a CSS selector on the element. This is equivilant to Javascripts querySelectorAll
	 * @return mixed Any descendant \Smart\Element's that match the selector, or NULL if there is no match
	 */
	public function querySelectorAll($query)
	{
		if(!$this->getDocumentElementSafe())
			throw new \Exception('Document is empty');
		
		return $this->getDocumentElementSafe()->querySelectorAll($query);
	}
	
	/**
	 * Takes an associative array or object, and populates this element with it
	 * @param mixed $src Object or associative array
	 * @return void
	 */
	public function populate($src, $formatters=null)
	{
		if(!$this->getDocumentElementSafe())
			throw new \Exception('Document is empty');
		
		return $this->getDocumentElementSafe()->populate($src, $formatters);
	}
	
	public function serializeFormData()
	{
		if(!$this->getDocumentElementSafe())
			throw new \Exception('Document is empty');
		
		return $this->getDocumentElementSafe()->serializeFormData();
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
		
		if(property_exists($this, 'documentElement'))
			$body = $this->querySelector('body');
		else
			$body = $this->getDocumentElementSafe();
		
		if(!$body)
			return null;
		
		for($node = $body->firstChild; $node != null; $node = $node->nextSibling)
			$result .= $this->saveHTML($node);
			
		return $result;
	}
	
	public function __get($name)
	{
		if($name == 'html')
			return $this->saveInnerBody();
		
		return null;
	}
}
