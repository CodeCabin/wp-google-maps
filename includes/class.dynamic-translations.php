<?php

namespace WPGMZA;

class DynamicTranslations
{
	private $map;
	
	public function __construct()
	{
		
	}
	
	public function updateDummyFile()
	{
		global $wpdb;
		global $wpgmza;
		
		$this->map = array();
		
		$source = "<?php\r\n\r\n";
		
		// Global settings
		$source .= $this->convert('wpgmza_gdpr_default_notice');
		$source .= $this->convert('wpgmza_gdpr_company_name');
		$source .= $this->convert('wpgmza_gdpr_retention_purpose');
		
		// Markers, polygons, custom fields, categories, etc.
		$tables = $wpdb->get_col('SHOW TABLES LIKE "%wpgmza%"');
		
		foreach($tables as $table)
		{
			if(preg_match('/geocode_cache/', $table))
				continue;	// Don't want cached JSON, ignore
			
			$columns = array();
			
			foreach($wpdb->get_results("SHOW COLUMNS FROM $table") as $name => $definition)
			{
				if(!preg_match('/text|char/', $definition->Type))
					continue;	// Not text, ignore
				
				if(preg_match('/other_data|other_settings|polydata|lat|lng|latlng|points/', $definition->Field))
					continue;	// Ignore serialized data, it's a security risk. Also ignore geometry
				
				$columns[] = $definition->Field;
			}
			
			if(empty($columns))
				continue;
			
			$qstr		= "SELECT " . implode(', ', $columns) . " FROM $table";
			$results	= $wpdb->get_results($qstr);
			
			foreach($results as $obj)
			{
				foreach($obj as $key => $value)
				{
					if(empty($value) || is_numeric($value))
						continue;	// Looks like coordinates or numeric settings, ignore
					
					if(!preg_match('/[^\-+,.0-9() ]/', $value))
						continue;	// Looks like geometry, ignore
					
					if($json = json_decode($value))
					{
						foreach($json as $jsonKey => $jsonValue)
							$source .= $this->convert($jsonValue);
						
						continue;
					}
					
					$source .= $this->convert($value);
				}
			}
		}
		
		file_put_contents(plugin_dir_path(__DIR__) . 'languages/dynamic/dummy.php', $source);
	}
	
	protected function convert($value)
	{
		if(empty($value))
			return "";	// Empty
		
		if(isset($this->map[$value]))
			return "";	// Already added
		
		$this->map[$value] = true;
		
		return "__('" . addslashes($value) . "', 'wp-google-maps');\r\n";
	}
}