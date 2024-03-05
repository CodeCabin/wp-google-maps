<?php

namespace WPGMZA;

class Feature extends Crud
{
	private static $cachedSubclasses;
	
	public static function isTypeSpatial($type)
	{
		$type = strtolower(preg_replace('/\(\d+\)$/', '', $type));
		
		switch($type)
		{
			case 'geometry':
			case 'point':
			case 'linestring':
			case 'polygon':
			case 'multipoint':
			case 'multilinestring':
			case 'multipolygon':
			case 'geometrycollection':
				return true;
				break;
			
			default:
				break;
		}
		
		return false;
	}
	
	public static function getSubclasses()
	{
		if(Feature::$cachedSubclasses)
			return Feature::$cachedSubclasses;
		
		foreach(glob(__DIR__ . '/*.php') as $file){
			if(basename($file) === 'class.dom-element.php'){
				continue;
			}
			require_once($file);
		}
		
	    /* Developer Hook (Action) - Load required feature classes */     
		do_action('wpgmza_require_feature_classes');
		
		foreach(get_declared_classes() as $class)
		{
			if(!is_subclass_of($class, 'WPGMZA\\Feature'))
				continue;
			
			$reflection = new \ReflectionClass($class);
			
			if(preg_match('/^Pro/', $reflection->getShortName()))
				continue;
			
			Feature::$cachedSubclasses[] = $reflection->getShortName();
		}
		
		return Feature::$cachedSubclasses;
	}
	
	public static function getBulkReadColumns($table)
	{
		global $wpgmza;
		
		$columns = array();
		
		foreach(Crud::getColumnsByTableName($table) as $obj)
		{			
			if(Feature::isTypeSpatial($obj->Type))
				$columns[] = "{$wpgmza->spatialFunctionPrefix}AsText(`{$obj->Field}`) AS {$obj->Field}";
			else
				$columns[] = "`{$obj->Field}`";
		}
		
		return $columns;
	}
	
	public static function convertSpatialTextToJson($text)
	{
		if(preg_match_all('/[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/', $text, $m) === false)
			throw new \Exception('Invalid spatial data, no coordinates found');
		
		$floats	= $m[0];
		$count	= count($floats);
		
		if($count % 2 == 1)
			throw new \Exception('Invalid spatial data, odd number of coordinates found');
		
		if(preg_match('/^POINT/i', $text) || $count == 2)
		{
			if(count($floats) != 2)
				throw new \Exception('Invalid number of coordinates found in point data');
			
			$result = array(
				'lat'	=> $floats[0],
				'lng'	=> $floats[1]
			);

		}
		else
		{
			$result = array();
			
			for($i = 0; $i < $count; $i += 2)
			{
				$result[] = array(
					'lat'	=> $floats[$i],
					'lng'	=> $floats[$i + 1]
				);
			}
		}
		
		return $result;
	}
	
	protected function getReadColumns()
	{
		global $wpgmza;
		
		$columns	= $this->get_columns();
		$result		= array();
		
		foreach($columns as $key => $definition)
		{
			if(Feature::isTypeSpatial($definition->Type))
				$result[] = "{$wpgmza->spatialFunctionPrefix}AsText({$definition->Field}) AS {$definition->Field}";
			else
				$result[] = $definition->Field;
		}
		
		return $result;
	}
	
	protected function get_placeholder_by_type($type)
	{
		global $wpgmza;
		
		switch($type)
		{
			case 'geometry':
			case 'point':
			case 'linestring':
			case 'polygon':
			case 'multipoint':
			case 'multilinestring':
			case 'multipolygon':
			case 'geometrycollection':
				return "{$wpgmza->spatialFunctionPrefix}GeomFromText(%s)";
				break;
			
			default:
				break;
		}
		
		return Crud::get_placeholder_by_type($type);
	}
	
	public function jsonSerialize()
	{
		global $wpgmza;

		$json		= Crud::jsonSerialize();
		$columns	= $this->get_columns_by_name();
		
		foreach($json as $key => $value)
		{
			switch($key)
			{
				case 'dataset':
				case 'polydata':
				
					// NB: Legacy field support
					try{
						$json[$key] = $this->convertSpatialTextToJson($value);
					} catch(\Exception $ex){
						/*
						 * This was added for legacy shape fallback, when the dataset is corrupted
						 * Prevents bad spatial data from breaking the map editor
						 * Added: 2021-01-22
						*/
						$json[$key] = null;
					}

					break;

				case 'description':
					if(!$this->useRawData && empty($wpgmza->processingContext)){
						$json[$key]	= do_shortcode($value);
					}
					break;
				default:
					
					if(isset($columns[$key]) && $this->isTypeSpatial($columns[$key]->Type))
					{
						$converted = $this->convertSpatialTextToJson($value);
						$json[$key] = $converted;
					}
				
					break;
			}
		}
		
		return $json;
	}
}
