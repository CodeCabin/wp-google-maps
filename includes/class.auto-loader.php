<?php

namespace WPGMZA;

class AutoLoader
{
	protected $filenamesByClass;
	
	public function __construct()
	{
		 // TODO: Maybe cache these in a JSON object and only refreshin developer mode
		 
		 $this->filenamesByClass = array();
	}
	
	/**
	 * Gets all the defined classes in a file
	 * @return string The fully qualified class
	 * NB: With thanks to netcoder - https://stackoverflow.com/questions/7153000/get-class-name-from-file
	 */
	public function getClassesInFile($file)
	{
		// var_dump("Getting classes in $file");
		
		$fp = fopen($file, 'r');
		$class = $namespace = $buffer = '';
		$i = 0;
		$results = array();
		
		$buffer = file_get_contents($file);
		$tokens = @token_get_all($buffer);

		for (;$i<count($tokens);$i++) {
			if ($tokens[$i][0] === T_NAMESPACE) {
				for ($j=$i+1;$j<count($tokens); $j++) {
					if ($tokens[$j][0] === T_STRING) {
						 $namespace .= '\\'.$tokens[$j][1];
					} else if ($tokens[$j] === '{' || $tokens[$j] === ';') {
						 break;
					}
				}
			}

			if ($tokens[$i][0] === T_CLASS) {
				for ($j=$i+1;$j<count($tokens);$j++) {
					if ($tokens[$j] === '{') {
						$class = $tokens[$i+2][1];
					}
				}
			}
		}
		
		if(!$class)
			return null;
		
		return $namespace . '\\' . $class;
	}
	
	public function getClassesInPathByFilename($path)
	{
		// var_dump("Getting classes in $path");
		
		$results = array();
		
		$dir 	= new \RecursiveDirectoryIterator($path);
		$iter 	= new \RecursiveIteratorIterator($dir);
		$regex 	= new \RegexIterator($iter, '/^.+(\.php)$/i', \RecursiveRegexIterator::GET_MATCH);
		
		foreach($regex as $m) {
			$file = $m[0];
			$classes = $this->getClassesInFile($file);
			$results[$file] = $classes;
		}
		
		return $results;
	}
	
	public function registerClassesInPath($path)
	{
		global $wpgmza;
		
		//$cacheFile = $relative . 'includes/auto-loader-cache.json';
		//$useCache = empty($wpgmza->settings->developer_mode) && file_exists($cacheFile);
		
		$classesByFilename = $this->getClassesInPathByFilename($path);
			
		foreach($classesByFilename as $file => $class)
		{
			if(!empty($class))
				$this->filenamesByClass[$class] = $file;
		}
	}
	
	public function callback($class)
	{
		$pattern = "/^(\\\\?)WPGMZA/";
		
		if(!preg_match($pattern, $class, $m))
			return;
		
		if(empty($m[1]))
			$class = '\\' . $class;
		
		if(!isset($this->filenamesByClass[$class]))
			return;
		
		$file = $this->filenamesByClass[$class];
		
		require_once( $file );
	}
	
}

global $wpgmza_auto_loader;
$wpgmza_auto_loader = new AutoLoader();
$wpgmza_auto_loader->registerClassesInPath(__DIR__);

spl_autoload_register(array($wpgmza_auto_loader, 'callback'));
