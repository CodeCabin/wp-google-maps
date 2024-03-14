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

			if(version_compare($fromVersion, '9.0.30', '<')){
				add_action('init', array($this, 'mitigateExploitVulnerability9030'), 11, 11);
			}

			if(version_compare($fromVersion, '9.0.32', '<')){
				add_action('init', array($this, 'mitigateExploitVulnerability9032'), 11, 11);
			}

			if(version_compare($fromVersion, '9.0.34', '<')){
				add_action('init', array($this, 'mitigateExploitVulnerability9034'), 11, 11);
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

	/**
	 * Mitigates a specific exploit vulnerability in version 9.0.30
	 * 
 	 * Note: This function addresses the exploit issue introduced in version 9.0.28, but we are reversing the effects in 9.0.30
	 *
	 * @return void
	 */
	public function mitigateExploitVulnerability9030(){
		global $wpgmza;
		global $wpdb;
		global $wpgmza_tblname;

		$matched = $wpdb->get_var("SELECT COUNT(id) FROM {$wpgmza_tblname} WHERE `description` LIKE '%/cdn/line.js%'");
		if($matched > 0){
			/* 
			 * We need to reverse the effects of the "line.js" exploit that we located in a recent report
			 * Once done, we will notify the admin of this, and let them know how many markers were affected
			*/
			$wpdb->query("UPDATE {$wpgmza_tblname} SET `description` = '' WHERE `description` LIKE '%/cdn/line.js%'");

			$wpgmza->adminNotices->create('exploitSolver9030', 
				array(
					'title' => '🔐 ' . __('Security Notice', 'wp-google-maps'),
					'message' => __("We detected and resolved an issue with certain markers containing malicious code. The system has automatically cleaned up affected content, however, some marker descriptions have been removed. If you would like to know more, please contact support.")
								. "<br><br>" . __("Markers cleaned:", "wp-google-maps") . " {$matched}",
					'class' => 'notice-error'
				)
			);
		}
	}

	/**
	 * This is an expansion of the 9030 mitigator, which checks the other columns as well. Initially we only had a report for the description, and 
	 * although we suspected this might affect some other fields, we did not have any reports confirming this. 
	 * 
	 * We had a report from Hostpoint (Pascal) which confirmed this. This solution is a slightly more matured version of the original function that cleans up more
	 * comprehensively. This will likely be our last change to this mitigation. 
	 * 
	 * @return void
	 */
	public function mitigateExploitVulnerability9032(){
		global $wpgmza;
		global $wpdb;
		global $wpgmza_tblname;

		/* Columns that could have housed the line.js asset */
		$columns = array('address', 'description', 'pic', 'link', 'icon', 'lat', 'lng', 'title', 'category', 'did', 'other_data');
		$markersCleaned = 0;

		foreach($columns as $column){
			$matched = $wpdb->get_var("SELECT COUNT(id) FROM {$wpgmza_tblname} WHERE `{$column}` LIKE '%/cdn/line.js%'");
			if($matched > 0){
				/* Remove the asset link, even though it is not loaded, from the database, in the same way that 9030 does */
				$wpdb->query("UPDATE {$wpgmza_tblname} SET `{$column}` = '' WHERE `{$column}` LIKE '%/cdn/line.js%'");

				$markersCleaned += $matched;
			}
		}

		/* If we cleaned any data, let's report that to the site owner */
		if(!empty($markersCleaned)){
			$wpgmza->adminNotices->create('exploitSolver9032', 
				array(
					'title' => '🔐 ' . __('Security Notice', 'wp-google-maps'),
					'message' => __("We detected and resolved an issue with certain markers containing malicious code. The system has automatically cleaned up affected content, however, some marker descriptions have been removed. If you would like to know more, please contact support.")
								. "<br><br>" . __("Cleaned fields:", "wp-google-maps") . " {$markersCleaned}",
					'class' => 'notice-error'
				)
			);
		}
	}

	/**
	 * This is an expansion of the 9032 mitigator, which specifically targets two new patterns
	 * 
	 * These patterns include defunc img tags and direct script tags. This has proven effective on some edge-cases for some users
	 * 
	 * @return void
	 */
	public function mitigateExploitVulnerability9034(){
		global $wpgmza;
		global $wpdb;
		global $wpgmza_tblname;

		$columns = array('address', 'description', 'pic', 'link', 'icon', 'lat', 'lng', 'title', 'category', 'did', 'other_data');
		$patterns = array("<img(.*)onerror=", "<script(.*)");

		$markersCleaned = 0;
		foreach($columns as $column){
			foreach($patterns as $pattern){
				$matched = $wpdb->get_var("SELECT COUNT(id) FROM {$wpgmza_tblname} WHERE `{$column}` REGEXP '{$pattern}'");
				if($matched > 0){
					$wpdb->query("UPDATE {$wpgmza_tblname} SET `{$column}` = '' WHERE `{$column}` REGEXP '{$pattern}'");
					$markersCleaned += $matched;
				}
			}
		}

		/* If we cleaned any data, let's report that to the site owner */
		if(!empty($markersCleaned)){
			$wpgmza->adminNotices->create('exploitSolver9034', 
				array(
					'title' => '🔐 ' . __('Security Notice', 'wp-google-maps'),
					'message' => __("We detected and resolved an issue with certain markers containing malicious code. The system has automatically cleaned up affected content, however, some marker fields have been removed. If you would like to know more, please contact support.")
								. "<br><br>" . __("Cleaned fields:", "wp-google-maps") . " {$markersCleaned}",
					'class' => 'notice-error'
				)
			);
		}
	}
}
