<?php

namespace WPGMZA;

class AutoLoader
{
	public function __construct()
	{
		
	}
	
	/**
	 * Gets all the defined classes in a file
	 * @return string The fully qualified class
	 * NB: With thanks to netcoder - https://stackoverflow.com/questions/7153000/get-class-name-from-file
	 */
	public function getClassesInFile($file)
	{
		$fp = fopen($file, 'r');
		$class = $namespace = $buffer = '';
		$i = 0;
		$results = array();
		
		while (!$class) {
			if (feof($fp)) break;
			
			$buffer .= fread($fp, 512);
			$tokens = @token_get_all($buffer);

			if (strpos($buffer, '{') === false) continue;

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
		}
		
		if(!$class)
			return null;
		
		return $namespace . '\\' . $class;
	}
	
	public function getClassesInPathByFilename($path)
	{
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
		$classes = $this->getClassesInPathByFilename($path);
		
		foreach($classes as $file => $class)
		{
			if(empty($class))
				continue;
			
			spl_autoload_register(function($class) use ($file) {
				require_once $file;
			});
		}
	}
}
