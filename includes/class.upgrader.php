<?php

namespace WPGMZA;

class Upgrader
{
	public function upgrade($fromVersion)
	{
		// NB: We don't use the global plugin object here because it's not initialised yet
		$settings = new GlobalSettings();
		
		if(preg_match('/^7\./', $fromVersion)) {
			// Legacy style for upgrading users
			$settings->user_interface_style = "legacy";
		}

		if(preg_match('/^8\./', $fromVersion)) {
			// Legacy build for users upgrading (They will be prompted to switch if they want to)
			$settings->internal_engine = "legacy";
		}
		
		add_action('init', function() {
			global $wpgmza;

    		/* Developer Hook (Action) - Run additional actions as part of an upgrade */ 
			do_action("wpgmza_base_upgrade_hook");

			$wpgmza->updateAllMarkerXMLFiles();
		});
		
		if($this->assertVersionTag($fromVersion)){
			/* Only run version compares if the versio number was asserted */ 
			if(version_compare($fromVersion, '7.00', '<')){
				add_action('init', array($this, 'migrateV7SpatialData'), 1, 11);
			}

			if(version_compare($fromVersion, '8.1.0', '<')){
				add_action('init', array($this, 'migrateCircleData'), 1, 11);
			}

			if(version_compare($fromVersion, '8.1.12', '<')){
				add_action('init', array($this, 'removeMarkerLngLatColumn'), 1, 11);
			}
		}

	}

	public function assertVersionTag($version){
		if(!empty(floatval($version))){
			/* Value was parsed */
			return true;
		}
		return false;
	}

	public function removeMarkerLngLatColumn(){
		global $wpgmza;
		global $wpdb;
		global $wpgmza_tblname;

		if($wpdb->get_var("SHOW COLUMNS FROM ".$wpgmza_tblname." LIKE 'lnglat'")){
			$wpdb->query('ALTER TABLE '.$wpgmza_tblname.' DROP COLUMN lnglat');
		}  
	}
	
	public function migrateV7SpatialData()
	{
		global $wpgmza;
		global $wpdb;
		global $wpgmza_tblname;
		
		if(!$wpdb->get_var("SHOW COLUMNS FROM ".$wpgmza_tblname." LIKE 'latlng'"))
			$wpdb->query('ALTER TABLE '.$wpgmza_tblname.' ADD latlng POINT');
		
		if($wpdb->get_var("SELECT COUNT(id) FROM $wpgmza_tblname WHERE latlng IS NULL LIMIT 1") == 0)
			return; // Nothing to migrate
		
		$wpdb->query("UPDATE ".$wpgmza_tblname." SET latlng={$wpgmza->spatialFunctionPrefix}PointFromText(CONCAT('POINT(', CAST(lat AS DECIMAL(18,10)), ' ', CAST(lng AS DECIMAL(18,10)), ')'))");
	}

	public function migrateCircleData()
	{
		global $wpgmza;
		global $wpdb;
		global $WPGMZA_TABLE_NAME_CIRCLES;

		if($wpdb->get_var("SHOW TABLES LIKE '{$WPGMZA_TABLE_NAME_CIRCLES}'") !== $WPGMZA_TABLE_NAME_CIRCLES){
			return; // Nothing to migrate			
		}
		
		$wpdb->query("UPDATE {$WPGMZA_TABLE_NAME_CIRCLES} SET radius = radius / 1000");
	}
}
