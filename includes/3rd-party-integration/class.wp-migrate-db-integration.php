<?php

namespace WPGMZA\Integration;

if(!class_exists('WPGMZA\\Integration\\WPMigrateDB'))
{
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
}

$wpgmza_wp_migration_db_module = new WPMigrateDB();