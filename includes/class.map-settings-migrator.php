<?php

namespace WPGMZA;

class MapSettingsMigrator {
	public function __construct() {
		
	}
	
	public function migrateMapSettings($map) {
		global $wpgmza;
		if(!$wpgmza->internalEngine->isLegacy()){
			/* Legacy to Atlas Novus */
            if(!isset($map->store_locator_component_anchor) && isset($map->wpgmza_store_locator_position)){
                /* Store Locator Migration */
                $map->store_locator_component_anchor = empty($map->wpgmza_store_locator_position) ? UI\ComponentAnchorControl::ABOVE : UI\ComponentAnchorControl::BELOW;
            }
		}
		
	}
}