<?php

class IntegrityChecker
{
	public function __construct()
	{
		
	}
	
	/**
	 * Recursive glob. This function is used to match files given the specified pattern, recursively.
	 * @todo Put this somewhere standardised, this is copied (WET) from the ScriptLoader
	 * @param string $pattern The pattern to match
	 * @param int $flags Flags to pass to glob
	 * @return string[] An array of matching files.
	 * @see http://php.net/manual/en/function.glob.php
	 */
	protected function rglob($pattern, $flags = 0)
	{
		$files = glob($pattern, $flags); 
		
		foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir) {
			
			$files = array_merge($files, $this->rglob($dir.'/'.basename($pattern), $flags));
			
		}
		
		return $files;
	}
	
	public function record($dir, $pattern="*.php")
	{
		$dst		= "$dir/integrity.json";
		$files		= $this->rglob("$dir/$pattern");
		$json		= (object)array('files' => array());
		
		foreach($files as $filename)
		{
			$src	= file_get_contents($filename);
			$crc	= crc32($src);
			
			$json->records []= array(
				'file'		=> preg_replace('#.+includes#', '', $filename),
				'crc32'		=> $crc
			);
		}
		
		file_put_contents($dst, json_encode($json));
	}
	
	public function check($dir)
	{
		$src		= "$dir/integrity.json";
		
		if(!file_exists($src))
		{
			trigger_error("Integrity records missing", E_USER_WARNING);
			return false;
		}
		
		$json		= json_decode( file_get_contents($src) );
		
		foreach($json->records as $record)
		{
			$filename = "$dir/{$record->file}";
			
			if(!file_exists($filename))
			{
				trigger_error("File in integrity record missing ({$record->file})", E_USER_WARNING);
				return false;
			}
			
			$src	= file_get_contents($filename);
			$crc	= crc32($src);
			
			if($crc != $record->crc32)
			{
				trigger_error("File integrity check failed ({$record->file})", E_USER_WARNING);
				return false;
			}
		}
		
		return true;
	}
}