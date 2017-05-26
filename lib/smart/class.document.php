<?php

namespace Smart;

define('SMART_NAMESPACE_URI', 'http://www.rylancecreativestudios.co.uk/Smart/');

require_once(__DIR__ . '/class.element.php');

class Document extends \DOMDocument
{
	private $src_file;
	
	public function __construct($version='1.0', $encoding='UTF-8')
	{
		parent::__construct($version, $encoding);
		$this->registerNodeClass('DOMElement', 'Smart\Element');
		$this->onReady();
	}
	
	protected function onReady()
	{
		
	}
	
	protected function onLoaded()
	{
		
	}
	
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
	
	public function loadPHPFile($src, $options=null)
	{
		ob_start();
		include $src;
		$html = ob_get_clean();
		
		if(empty($html))
			throw new \Exception("$src is empty");
		$result = $this->loadHTML($html);
		
		$this->src_file = $src;
		
		$this->onEvaluateSmartNodes();
		$this->onLoaded();
		
		return $result;
	}
	
	public function redirect($url)
	{
		$this->loadHTML('<div><h2>Redirecting</h2><p>Please <a>click here</a> if you are not redirected shortly</div>');
		$this->querySelector('a')->setAttribute('href', $url);
		header('Location: ' . $url);
	}
	
	protected function evaluateInlineVariable($str, $node)
	{
		global $user, $db, $fb, $document;
		
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
	
	protected function handleImport($subject, $node, $forcePHP=false)
	{
		global $db, $user;
		
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
	
	protected function onEvaluateNode($node)
	{
		global $db, $user;
		
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
	
	public function querySelector($query)
	{
		if(!$this->documentElement)
			throw new \Exception('Document is empty');
		return $this->documentElement->querySelector($query);
	}
	
	public function querySelectorAll($query)
	{
		if(!$this->documentElement)
			throw new \Exception('Document is empty');
		return $this->documentElement->querySelectorAll($query);
	}
	
	public function populate($src, $formatters=null)
	{
		if(!$this->documentElement)
			throw new \Exception('Document is empty');
		return $this->documentElement->populate($src, $formatters);
	}
	
	public function createErrorElement($message)
	{
		$span = $this->createElement('span');
		$span->appendText($message);
		$span->addClass('error');
		return $span;
	}
	
	public function saveInnerBody()
	{
		$result = '';
		
		foreach($this->querySelectorAll('body>*') as $node)
			$result .= $this->saveHTML($node);
			
		return $result;
	}
}

?>