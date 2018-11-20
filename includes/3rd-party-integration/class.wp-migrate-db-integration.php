<?php

namespace WPGMZA\Integration;

if(!class_exists('WPGMZA\\Integration\\WPMigrateDB'))
{
	/**
	 * Integrates with WP Migrate DB (by Deliciousbrains). Please note our plugin must be selected by default in their plugins compatibilty settings in order for this integration module to be called.
	 */
	class WPMigrateDB
	{
		/**
		 * Constructor
		 */
		public function __construct()
		{
			add_filter('wpmdb_process_column_as_binary', array($this, 'onProcessColumnAsBinary'), 10, 2);
		}
		
		/**
		 * Called by WP Migrate DBs wpmdb_process_column_as_binary filter. If the specified column is a spatial column, indicate that this is binary data. WP Migrate DB will convert it to hex and wrap it with an UNHEX call in their exported data.
		 * @return bool TRUE for binary data, FALSE for everything else.
		 */
		public function onProcessColumnAsBinary($processAsBinary, $struct)
		{
			if(preg_match('/^GEOMETRY|POINT|POLYGON|LINESTRING|MULTIPOINT|MULTILINESTRING|MULTIPOLYGON|GEOMETRYCOLLECTION$/i', $struct->Type))
				return true;
			
			return $processAsBinary;
		}
	}
}

$wpgmza_wp_migration_db_module = new WPMigrateDB();