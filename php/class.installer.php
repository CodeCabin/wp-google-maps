<?php

namespace WPGMZA;

class Installer
{
	public function __construct()
	{
		
	}
	
	/**
	 * Function installs first map and sets the default settings
	 * @return void
	 */
	public function run()
	{
		// Install options, db and directory
		$this->installOptions();
		$this->installDB();
		
		// Compare versions and migrate if necessary
		$db_version = new Version( get_option('wpgmza_db_version') );
		
		if(Plugin::$version->isLessThan($db_version) || defined('WPGMZA_FORCE_V7_MIGRATE'))
		{
			
			require_once(__DIR__ . '/class.v7-database-migrator.php');
			$migrator = new V7DatabaseMigrator();
			$migrator->migrate();
			
			update_option('wpgmza_db_version', (string)Plugin::$version);
		}
		
		// Install the default map
		$this->installDefaultMap();
	}
	
	/**
	 * Set up default options
	 * @return void
	 */
	protected function installOptions()
	{
		delete_option("WPGMZA");
		update_option("wpgmza_temp_api",'AIzaSyChPphumyabdfggISDNBuGOlGVBgEvZnGE');
		
		if(empty(get_option("wpgmza_xml_location")))
			add_option("wpgmza_xml_location",'{uploads_dir}/wp-google-maps/');
		if(empty(get_option("wpgmza_xml_url")))
			add_option("wpgmza_xml_url",'{uploads_url}/wp-google-maps/');
		
		if(empty(get_option("wpgmza_db_version")))
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
		
		/*
		 * Install maps
		 */
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_MAPS` (
			`id` int(11) NOT NULL AUTO_INCREMENT,
			`title` VARCHAR(55) NOT NULL,
			`settings` LONGTEXT,
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
		 
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_MARKERS` (
          id int(11) NOT NULL AUTO_INCREMENT,
          map_id int(11) NOT NULL,
          address varchar(700) NOT NULL,
          description mediumtext NOT NULL,
          pic varchar(700) NOT NULL,
          link varchar(700) NOT NULL,
          icon varchar(700) NOT NULL,
          lat varchar(100) NOT NULL,
          lng varchar(100) NOT NULL,
          anim varchar(3) NOT NULL,
          title varchar(700) NOT NULL,
          infoopen varchar(3) NOT NULL,
          category varchar(500) NOT NULL,
          approved tinyint(1) DEFAULT '1',
          retina tinyint(1) DEFAULT '0',
          type tinyint(1) DEFAULT '0',
          did varchar(500) NOT NULL,
          other_data LONGTEXT NOT NULL,
		  latlng POINT NOT NULL,
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
		
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_POLYGONS` (
          id int(11) NOT NULL AUTO_INCREMENT,
          map_id int(11) NOT NULL,
          polydata LONGTEXT NOT NULL,
          innerpolydata LONGTEXT NOT NULL,
          linecolor VARCHAR(7) NOT NULL,
          lineopacity VARCHAR(7) NOT NULL,
          fillcolor VARCHAR(7) NOT NULL,
          opacity VARCHAR(3) NOT NULL,
          title VARCHAR(250) NOT NULL,
          link VARCHAR(700) NOT NULL,
          ohfillcolor VARCHAR(7) NOT NULL,
          ohlinecolor VARCHAR(7) NOT NULL,
          ohopacity VARCHAR(3) NOT NULL,
          polyname VARCHAR(100) NOT NULL,
		  points POLYGON,
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
		
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_POLYLINES` (
          id int(11) NOT NULL AUTO_INCREMENT,
          map_id int(11) NOT NULL,
          polydata LONGTEXT NOT NULL,
          linecolor VARCHAR(7) NOT NULL,
          linethickness VARCHAR(3) NOT NULL,
          opacity VARCHAR(3) NOT NULL,
          polyname VARCHAR(100) NOT NULL,
		  points LINESTRING,
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
	 * Install database category maps table
	 * @return void
	 */
	protected function installDBCategoryMaps()
	{
		global $WPGMZA_TABLE_NAME_CATEGORY_MAPS;
		
		dbDelta("CREATE TABLE `$WPGMZA_TABLE_NAME_CATEGORY_MAPS` (
          id int(11) NOT NULL AUTO_INCREMENT,
          cat_id INT(11) NOT NULL,
          map_id INT(11) NOT NULL,
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
		$this->installDBCategoryMaps();
		
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
		
		$title = __("My first map","wp-google-maps");
		$settings = json_encode(array(
		   'width' => '100%',
		   'height' => '400px',
		   'start_location' => '45.950464398418106,-109.81550500000003',
		   'start_zoom' => '2',
		   'default_marker' => '0',
		   'type' => '1',
		   'alignment' => '1',
		   'directions_enabled' => '1',
		   'styling_enabled' => '0',
		   'styling_data' => NULL,
		   'active' => '1',
		   'kml' => '',
		   'bicycle' => '2',
		   'traffic' => '2',
		   'directions_box_enabled' => '1',
		   'directions_box_width' => '100',
		   'list_markers' => '0',
		   'list_markers_advanced' => '0',
		   'filter_by_category' => '0',
		   'ugm_enabled' => '0',
		   'ugm_category_enabled' => '0',
		   'fusion' => '',
		   'mass_marker_support' => '1',
		   'ugm_access' => '0',
		   'order_markers_by' => '1',
		   'order_markers_choice' => '2',
		   'show_user_location' => '0',
		   'default_to' => '',
		   'map_max_zoom' => '1',
		   'transport_layer' => 2,
		   'wpgmza_theme_data' => '',
		   'wpgmza_show_points_of_interest' => 1
		));
		
		$stmt = $wpdb->prepare("INSERT INTO $WPGMZA_TABLE_NAME_MAPS (title, settings) VALUES (%s, %s)", array(
			$title,
			$settings
		));
		$wpdb->query($stmt);
	}
}

?>