<?php

namespace WPGMZA;

class MapSelectDialog extends DOMDocument {
	public function __construct(){
		global $wpgmza;
		DOMDocument::__construct();

		$this->loadPHPFile($wpgmza->internalEngine->getTemplate("map-edit-page/map-select-dialog.html.php"));

		$this->populateSelectOptions();
	}

	public function populateSelectOptions(){
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		
		$maps = $wpdb->get_results("SELECT id, map_title FROM $WPGMZA_TABLE_NAME_MAPS WHERE active = 0 ORDER BY id ASC");
		if(!empty($maps)){
			$select = $this->querySelector('select[data-ajax-name="map_id"]');
			if($select){
				foreach($maps as $map){
					$li = $this->createElement("option");
					$li->setAttribute("value", intval($map->id));
					$li->appendText($map->map_title);

					if(!empty($_GET['map_id'])){
						if(intval($map->id) === intval($_GET['map_id'])){
							$li->setAttribute("selected", "selected");
							$li->appendText(" " . __("(Current)", "wp-google-maps"));
						}
					}

					$select->appendChild($li);
				}
			}
		}

	}
}