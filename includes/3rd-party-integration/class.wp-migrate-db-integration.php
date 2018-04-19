<?php

namespace WPGMZA\Integration;

class WPMigrateDB
{
	public function __construct()
	{
		add_filter('wpmdb_process_column_as_binary', array($this, 'onProcessColumnAsBinary'), 10, 2);
	}
	
	public function onProcessColumnAsBinary($processAsBinary, $struct)
	{
		if(preg_match('/^GEOMETRY|POINT|POLYGON|LINESTRING|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION$/i', $struct->Type))
			return true;
		
		return $processAsBinary;
	}
}

$module = new WPMigrateDB();
