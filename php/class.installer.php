<?php

namespace WPGMZA;

class Installer
{
	public static $MARKER_COLUMNS = array(
		'id'			=> 'int(11) NOT NULL AUTO_INCREMENT',
		'map_id'		=> 'int(11) NOT NULL',
		'address'		=> 'varchar(700) NOT NULL',
		'description'	=> 'mediumtext NOT NULL',
		'pic'			=> 'varchar(700) NOT NULL',
		'link'			=> 'varchar(700) NOT NULL',
		'icon'			=> 'varchar(700) NOT NULL',
		'title'			=> 'varchar(700) NOT NULL',
		'approved'		=> "tinyint(1) DEFAULT '1'",
		'settings'		=> 'LONGTEXT NULL',
		'latlng'		=> 'POINT NOT NULL'
	);

	public static $MAP_COLUMNS = array(
		'id'			=> 'int(11) NOT NULL AUTO_INCREMENT',
		'title'			=> 'VARCHAR(55) NOT NULL',
		'settings'		=> 'LONGTEXT'
	);

	public static $POLYGON_COLUMNS = array(
		'id'			=> 'int(11) NOT NULL AUTO_INCREMENT',
		'map_id'		=> 'int(11) NOT NULL',
		'name'			=> 'VARCHAR(250) NOT NULL',
		'title'			=> 'VARCHAR(250) NOT NULL',
		'link'			=> 'VARCHAR(700) NOT NULL',
		'points'		=> 'POLYGON',
		'settings'		=> 'TEXT'
	);

	public static $POLYLINE_COLUMNS = array(
		'id'			=> 'int(11) NOT NULL AUTO_INCREMENT',
		'map_id'		=> 'int(11) NOT NULL',
		'title'			=> 'VARCHAR(250) NOT NULL',
		'points'		=> 'LINESTRING',
		'settings'		=> 'TEXT'
	);

	public function __construct()
	{
		Installer::$MARKER_COLUMNS = apply_filters( 'wpgmza_installer_marker_columns_filter', $MARKER_COLUMNS );
		Installer::$MAP_COLUMNS = apply_filters( 'wpgmza_installer_map_columns_filter', $MAP_COLUMNS );
		Installer::$POLYGON_COLUMNS = apply_filters( 'wpgmza_installer_polygon_columns_filter', $POLYGON_COLUMNS );
		Installer::$POLYLINE_COLUMNS = apply_filters( 'wpgmza_installer_polyline_columns_filter', $POLYLINE_COLUMNS );
	}
	
	protected function nameAndDefinitionArrayToSQL($columns)
	{
		$sql = '';
		
		foreach($columns as $name => $definition)
			$sql .= "$name $definition,\r\n";
		
		return rtrim($sql);
	}
	
	/**
	 * Function installs first map and sets the default settings
	 * @return void
	 */
	public function run()
	{
		// Install options, db and directory if necessary
		$this->installOptions();
		$this->installDB();
		
		// Compare versions and migrate if necessary
		$db_version = new Version( get_option('wpgmza_db_version') );
		
		if(Plugin::isMigrationRequired() || defined('WPGMZA_FORCE_V7_INSTALL'))
		{
			require_once(__DIR__ . '/class.v7-database-migrator.php');
			$migrator = new V7DatabaseMigrator();
			$migrator->migrate();
		}
		
		update_option('wpgmza_db_version', (string)Plugin::$version);
		
		// Install the default map
		$this->installDefaultMap();
	}
	
	/**
	 * Set up default options
	 * @return void
	 */
	protected function installOptions()
	{
		global $WPGMZA_VERSION;
		
		delete_option("WPGMZA");
		update_option("wpgmza_temp_api",'AIzaSyChPphumyabdfggISDNBuGOlGVBgEvZnGE');
		
		$db_version = get_option("wpgmza_db_version");
		if(empty($db_version))
			update_option("wpgmza_db_version", $WPGMZA_VERSION);
	}
	
	/**
	 * Install database maps table
	 * @return void
	 */
	protected function installDBMaps()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		$mapSQL = $this->nameAndDefinitionArrayToSQL(Installer::$MAP_COLUMNS);
		
		/*
		 * Install maps
		 */
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_MAPS` (
			$mapSQL
			PRIMARY KEY  (id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1");
		
		/* 6.3.14 */
		$check = $wpdb->query("ALTER TABLE `$WPGMZA_TABLE_NAME_MAPS` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci");
	}
	
	/**
	 * Install database maps table
	 * @return void
	 */
	protected function installDBMarkers()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MARKERS;
		 
		$markerSQL = $this->nameAndDefinitionArrayToSQL(Installer::$MARKER_COLUMNS);
		 
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_MARKERS` (
          $markerSQL
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;");
		 
		/* check for previous versions containing 'desc' instead of 'description' */
		$results = $wpdb->get_results("DESC `$WPGMZA_TABLE_NAME_MARKERS`");
		$founded = 0;
		foreach ($results as $row ) {
			if ($row->Field == "desc") {
				$founded++;
			}
		}
		if($founded > 0)
			$wpdb->query("ALTER TABLE $prefix".TABLE_NAME_MARKERS." CHANGE `desc` `description` MEDIUMTEXT");
		
		/* check for older version of "category" and change to varchar instead of int */
		$results = $wpdb->get_results("DESC `$WPGMZA_TABLE_NAME_MARKERS`");
		$founded = 0;
		foreach ($results as $row ) {
			
			if ($row->Field == "category") {
				if ($row->Type == "int(11)") {
					$founded++;
				}
			}
		}
		if($founded > 0)
			$wpdb->query("ALTER TABLE `$WPGMZA_TABLE_NAME_MARKERS` CHANGE `category` `category` VARCHAR(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '0'");
	}
	
	/**
	 * Install database polygons table
	 * @return void
	 */
	protected function installDBPolygons()
	{
		global $WPGMZA_TABLE_NAME_POLYGONS;
		
		$polygonSQL = $this->nameAndDefinitionArrayToSQL(Installer::$POLYGON_COLUMNS);
		
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_POLYGONS` (
          $polygonSQL
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;");
	}
	
	/**
	 * Install database polylines table
	 * @return void
	 */
	protected function installDBPolylines()
	{
		global $WPGMZA_TABLE_NAME_POLYLINES;
		
		$polylineSQL = $this->nameAndDefinitionArrayToSQL(Installer::$POLYLINE_COLUMNS);
		
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_POLYLINES` (
          $polylineSQL
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;");
	}
	
	/**
	 * Install database categories table
	 * @return void
	 */
	protected function installDBCategories()
	{
		global $WPGMZA_TABLE_NAME_CATEGORIES;
		
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_CATEGORIES` (
          id int(11) NOT NULL AUTO_INCREMENT,
          active TINYINT(1) NOT NULL,
          category_name VARCHAR(50) NOT NULL,
          category_icon VARCHAR(700) NOT NULL,
          retina TINYINT(1) DEFAULT '0',
          PRIMARY KEY  (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;");
	}
	
	/**
	 * Install database tables
	 * @return void
	 */
	protected function installDB()
	{
		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		
		$this->installDBMaps();
		$this->installDBMarkers();
		$this->installDBPolygons();
		$this->installDBPolylines();
		$this->installDBCategories();		

		do_action( 'wpgmza_basic_db_installer' );

	}
	
	/**
	 * Install default map
	 * @return void
	 */	
	protected function installDefaultMap()
	{
		global $wpdb, $WPGMZA_TABLE_NAME_MAPS;
		
		$numMaps = $wpdb->get_var("SELECT COUNT(*) FROM $WPGMZA_TABLE_NAME_MAPS");
		if($numMaps > 0)
			return;
		
		$title = apply_filters( 'wpgmza_basic_default_first_map_title', __("My first map", "wp-google-maps") );

		require_once(WPGMZA_DIR . 'php/class.map.php');
		$settings = Map::getDefaultSettings();
		
		$stmt = $wpdb->prepare("INSERT INTO $WPGMZA_TABLE_NAME_MAPS (title, settings) VALUES (%s, %s)", array(
			$title,
			json_encode($settings)
		));
		
		$wpdb->query($stmt);
	}
}

?>