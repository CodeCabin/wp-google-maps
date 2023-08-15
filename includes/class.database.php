<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class Database extends Factory
{
	public $version;
	
	public function __construct()
	{
		global $wpgmza;
		global $wpgmza_version;
		
		$this->version = get_option('wpgmza_db_version');

		if(!$this->version || version_compare($this->version, $wpgmza_version, '<'))
		{
			if(!empty($this->version))
			{
				$upgrader = new Upgrader();
				$upgrader->upgrade($this->version);
			}
			
			$this->install();
		}
	}
	
	public static function getCharsetAndCollate()
	{
		global $wpdb;
		$charset_collate = '';

		if(!empty($wpdb->charset))
			$charset_collate = "DEFAULT CHARACTER SET $wpdb->charset";

		if (!empty($wpdb->collate))
			$charset_collate .= " COLLATE $wpdb->collate";
		
		return $charset_collate;
	}
	
	public function install()
	{
		global $wpgmza;
		global $wpgmza_version;
		
		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		
		$this->installMapsTable();
		$this->installMarkerTable();
		$this->installPolygonTable();
		$this->installPolylineTable();
		$this->installCircleTable();
		$this->installRectangleTable();

		$this->installPointLabelsTable();
		$this->installImageOverlayTable();

		$this->installAdminNoticesTable();
		
		$this->setDefaults();
		
		update_option('wpgmza_db_version', $wpgmza_version);
	}
	
	protected function installMapsTable()
	{
		global $WPGMZA_TABLE_NAME_MAPS;
		
		$sql = "CREATE TABLE `$WPGMZA_TABLE_NAME_MAPS` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_title varchar(256) NOT NULL,
			map_width varchar(6) NOT NULL,
			map_height varchar(6) NOT NULL,
			map_start_lat varchar(700) NOT NULL,
			map_start_lng varchar(700) NOT NULL,
			map_start_location varchar(700) NOT NULL,
			map_start_zoom INT(10) NOT NULL,
			default_marker varchar(700) NOT NULL,
			type INT(10) NOT NULL,
			alignment INT(10) NOT NULL,
			directions_enabled INT(10) NOT NULL,
			styling_enabled INT(10) NOT NULL,
			styling_json mediumtext NOT NULL,
			active INT(1) NOT NULL,
			kml VARCHAR(700) NOT NULL,
			bicycle INT(10) NOT NULL,
			traffic INT(10) NOT NULL,
			dbox INT(10) NOT NULL,
			dbox_width varchar(10) NOT NULL,
			listmarkers INT(10) NOT NULL,
			listmarkers_advanced INT(10) NOT NULL,
			filterbycat TINYINT(1) NOT NULL,
			ugm_enabled INT(10) NOT NULL,
			ugm_category_enabled TINYINT(1) NOT NULL,
			fusion VARCHAR(100) NOT NULL,
			map_width_type VARCHAR(3) NOT NULL,
			map_height_type VARCHAR(3) NOT NULL,
			mass_marker_support INT(10) NOT NULL,
			ugm_access INT(10) NOT NULL,
			order_markers_by INT(10) NOT NULL,
			order_markers_choice INT(10) NOT NULL,
			show_user_location INT(3) NOT NULL,
			default_to VARCHAR(700) NOT NULL,
			other_settings longtext NOT NULL,
			PRIMARY KEY  (id)
			) AUTO_INCREMENT=1 " . Database::getCharsetAndCollate();

		dbDelta($sql);
	}
	
	protected function installMarkerTable()
	{
		global $WPGMZA_TABLE_NAME_MARKERS;
		
		$sql = "CREATE TABLE `$WPGMZA_TABLE_NAME_MARKERS` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			address varchar(700) NOT NULL,
			description mediumtext NOT NULL,
			pic varchar(700) NOT NULL,
			link varchar(2083) NOT NULL,
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
			sticky tinyint(1) DEFAULT '0',
			other_data LONGTEXT NOT NULL,
			latlng POINT,
			layergroup INT(3) DEFAULT '0',
			PRIMARY KEY  (id)
			) AUTO_INCREMENT=1 " . Database::getCharsetAndCollate();

		dbDelta($sql);
	}
	
	protected function installPolygonTable()
	{
		global $WPGMZA_TABLE_NAME_POLYGONS;
		
		$sql = "CREATE TABLE `$WPGMZA_TABLE_NAME_POLYGONS` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			polydata LONGTEXT NOT NULL,
			description TEXT NOT NULL,
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
			linethickness VARCHAR(3) NOT NULL,
			layergroup INT(3) DEFAULT '0',
			PRIMARY KEY  (id)
			) AUTO_INCREMENT=1 " . Database::getCharsetAndCollate();

		dbDelta($sql);
	}
	
	protected function installPolylineTable()
	{
		global $WPGMZA_TABLE_NAME_POLYLINES;
		
		$sql = "CREATE TABLE `$WPGMZA_TABLE_NAME_POLYLINES` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			polydata LONGTEXT NOT NULL,
			linecolor VARCHAR(7) NOT NULL,
			linethickness VARCHAR(3) NOT NULL,
			opacity VARCHAR(3) NOT NULL,
			polyname VARCHAR(100) NOT NULL,
			layergroup INT(3) DEFAULT '0',
			PRIMARY KEY  (id)
			) AUTO_INCREMENT=1 " . Database::getCharsetAndCollate();

		dbDelta($sql);
	}
	
	protected function installCircleTable()
	{
		global $WPGMZA_TABLE_NAME_CIRCLES;
		
		$sql = "CREATE TABLE `$WPGMZA_TABLE_NAME_CIRCLES` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			name TEXT,
			center POINT,
			radius FLOAT,
			color VARCHAR(16),
			opacity FLOAT,
			lineColor VARCHAR(16),
			lineOpacity FLOAT DEFAULT '0',
			description TEXT,
			hoverEnabled tinyint(1) DEFAULT '0',
			ohFillColor VARCHAR(16),
			ohLineColor VARCHAR(16),
			ohFillOpacity FLOAT,
			ohLineOpacity FLOAT,
			link VARCHAR(700) NOT NULL,
			layergroup INT(3) DEFAULT '0',
			PRIMARY KEY  (id)
			) AUTO_INCREMENT=1 " . Database::getCharsetAndCollate();

		dbDelta($sql);
	}
	
	protected function installRectangleTable()
	{
		global $WPGMZA_TABLE_NAME_RECTANGLES;
		
		$sql = "CREATE TABLE `$WPGMZA_TABLE_NAME_RECTANGLES` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			name TEXT,
			cornerA POINT,
			cornerB POINT,
			color VARCHAR(16),
			opacity FLOAT,
			lineColor VARCHAR(16),
			lineOpacity FLOAT DEFAULT '0',
			description TEXT,
			hoverEnabled tinyint(1) DEFAULT '0',
			ohFillColor VARCHAR(16),
			ohLineColor VARCHAR(16),
			ohFillOpacity FLOAT,
			ohLineOpacity FLOAT,
			link VARCHAR(700) NOT NULL,
			layergroup INT(3) DEFAULT '0',
			PRIMARY KEY  (id)
			) AUTO_INCREMENT=1 " . Database::getCharsetAndCollate();

		dbDelta($sql);
	}

	protected function installPointLabelsTable(){
		global $WPGMZA_TABLE_NAME_POINT_LABELS;

		$sql = "CREATE TABLE `$WPGMZA_TABLE_NAME_POINT_LABELS` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			name TEXT,
			center POINT,
			fillColor VARCHAR(16),
			lineColor VARCHAR(16),
			opacity FLOAT,
			fontSize VARCHAR(3),
			PRIMARY KEY  (id)
			) AUTO_INCREMENT=1 " . Database::getCharsetAndCollate();

		dbDelta($sql);
	}

	protected function installImageOverlayTable(){
		global $WPGMZA_TABLE_NAME_IMAGE_OVERLAYS;

		$sql = "CREATE TABLE `$WPGMZA_TABLE_NAME_IMAGE_OVERLAYS` (
			id int(11) NOT NULL AUTO_INCREMENT,
			map_id int(11) NOT NULL,
			name TEXT,
			cornerA POINT,
			cornerB POINT,
			image VARCHAR(700),
			opacity FLOAT,
			PRIMARY KEY  (id)
			) AUTO_INCREMENT=1 " . Database::getCharsetAndCollate();

		dbDelta($sql);
	}

	protected function installAdminNoticesTable(){
		global $WPGMZA_TABLE_NAME_ADMIN_NOTICES;

		$sql = "CREATE TABLE `$WPGMZA_TABLE_NAME_ADMIN_NOTICES` (
			id int(11) NOT NULL AUTO_INCREMENT,
			name VARCHAR(255),
			message TEXT,
			active_date DATETIME,
			options LONGTEXT,
			dismissed TINYINT(1) DEFAULT '1',
			PRIMARY KEY  (id)
			) AUTO_INCREMENT=1 " . Database::getCharsetAndCollate();

		dbDelta($sql);		
	}
	
	protected function setDefaults()
	{
		
	}

	public function onFirstRun()
	{
		$map = Map::createInstance(array(
			"map_title"				=> __("My first map","wp-google-maps"),
			"map_start_lat"			=> "45.950464398418106",
			"map_start_lng"			=> "-109.81550500000003",
			"map_width"				=> "100",
			"map_height"			=> "400",
			"map_width_type"		=> "%",
			"map_height_type"		=> "px",
			"map_start_location"	=> "45.950464398418106,-109.81550500000003",
			"map_start_zoom"		=> "2",
			"directions_enabled"	=> '0',
			"alignment"				=> "4"
		));
		
		$marker = Marker::createInstance(array(
			"map_id"				=> $map->id,
			"address"				=> "California",
			"lat"					=> 36.778261,
			"lng"					=> -119.4179323999,
			"approved"				=> 1
		));
	}
}
