<?php

namespace WPGMZA;

class MapEditorTour extends DOMDocument {
	public function __construct(){
		global $wpgmza;
		DOMDocument::__construct();
		
		$this->loadPHPFile($wpgmza->internalEngine->getTemplate("map-edit-page/map-editor-tour.html.php"));

		if(!empty($wpgmza->settings->engine)){
			$this->querySelector('.wpgmza-tour')->setAttribute('data-map-engine', $wpgmza->settings->engine);
		}
	}

	public function canTour(){
		$optionName = "wpgmza-tour-progress-mapEditor";
		$optionValue = get_option($optionName);
		if(!empty($optionValue)){
			if($optionValue === 'completed' || $optionValue === 'dismissed'){
				return false;
			} else {
				if(strpos($optionValue, 'sleep_') !== FALSE){
					$sleepDate = str_replace('sleep_', '', $optionValue);
					if(!empty($sleepDate)){
						if(strtotime(date('Y-m-d')) <= strtotime($sleepDate)){
							return false;
						} 
					}
				}
			}
		}
		return true;
	}

	public static function logProgressFromAjax(){
		global $wpgmza;
		if(!wp_verify_nonce($_POST['wpgmza_security'], 'wpgmza_ajaxnonce')){
			http_response_code(403);
			exit;
		}
		
		if(!$wpgmza->isUserAllowedToEdit()){
			http_response_code(401);
			exit;
		}

		if(!empty($_POST['action']) && $_POST['action'] === 'wpgmza_tour_progress_update'){
			if(!empty($_POST['tour']) && !empty($_POST['type'])){
				$type = sanitize_text_field($_POST['type']);
				$tour = sanitize_text_field($_POST['tour']);

				$optionName = "wpgmza-tour-progress-{$tour}";
				$optionValue = false;
				switch($type){
					case 'complete':
						$optionValue = 'completed';
						break;
					case 'dismiss':
						$optionValue = 'dismissed';
						break;
					case 'sleep':
						$sleepDate = date('Y-m-d', strtotime('+1 day'));
						$optionValue = "sleep_{$sleepDate}";
						break;
				}

				if(!empty($optionValue)){
					update_option($optionName, $optionValue);
				}
			}
		}

		wp_send_json(array('success' => 1));
		exit;
	}
}

add_action('wp_ajax_wpgmza_tour_progress_update', array('WPGMZA\\MapEditorTour', 'logProgressFromAjax'));