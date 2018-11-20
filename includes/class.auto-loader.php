<?php
namespace WPGMZA;

/**
 * The AutoLoader class can be used to scan a directory and register any
 * classes found in the PHP files there, recursively.
 *
 * These classes will be registered for autoloading.
 *
 * This class may be built on to use a JSON cache in the future.
 */
class AutoLoader
{
	protected $filenamesByClass;
	
	/**
	 * The AutoLoader constructor.
	 */
	public function __construct()
	{
		 // TODO: Maybe cache these in a JSON object and only refreshin developer mode
		 
		 $this->filenamesByClass = array();
	}
	
	/**
	 * Updates the JSON cache of classes
	 * @todo implement
	 * @return void
	 */
	protected function updateCache()
	{
		// TODO: Not yet implemented
		
		/*$dst = plugin_dir_path(__FILE__) . 'classes.json';
		
		$json = json_encode((object)array(
			'filenamesByClass' => $this->filenamesByClass
		));
		
		file_put_contents($dst, $json);*/
	}
	
	/**
	 * Gets the first class defined in the specified file
	 * @param string $file The file to scan for a class
	 * @return string The fully qualified class, or NULL if none found
	 * NB: With thanks to netcoder - https://stackoverflow.com/questions/7153000/get-class-name-from-file
	 */
	public function getClassesInFile($file)
	{
		$fp = fopen($file, 'r');
		$class = $namespace = $buffer = '';
		$i = 0;
		$results = array();
		
		$buffer = file_get_contents($file);
		
		if(!function_exists('token_get_all'))
		{
			// Regex fallback for users without token_get_all
			
			if(preg_match('/^\s*namespace\s+(.+);/m', $buffer, $m))
				$namespace = '\\' . trim($m[1]);
			
			if(preg_match('/^(abstract)?\s*class\s+(\w+)/m', $buffer, $m))
				$class = trim($m[2]);
			
			$result = $namespace . '\\' . $class;
		}
		else
		{
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
				
				if(!empty($class))
					break;
			}
			
			$result = $namespace . '\\' . $class;
		}
		
		if(empty($class))
			return null;
		
		return $result;
	}
	
	/**
	 * Gets all the classes in PHP files in the specified path, recursively
	 * @param string $path The path to scan
	 * @return array An array of all the fully qualified 
	 */
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
	
	/**
	 * Recursively scans all PHP files in the given patch and registers any classes found.
	 * @param string $path The path to scan
	 * @return void
	 */
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
		
		$this->updateCache();
	}
	
	/**
	 * This function is registered with PHPs native spl_autoloader_register to require the file associated with the class. This function is to be treated as private and should only be called by PHP itself.
	 * @internal
	 * @param string $class The class passed in by PHP
	 * @return void
	 */
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
