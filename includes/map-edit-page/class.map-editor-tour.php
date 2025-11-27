<?php

namespace WPGMZA;

try {
	wpgmza_require_once(plugin_dir_path(__FILE__) . '../class.dom-document.php');
} catch (\Exception $ex){

} catch (\Error $err){

}

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
					update_option($optionName, $optionValue, false);
				}
			}
		}

		wp_send_json(array('success' => 1));
		exit;
	}

	public function shouldReceiveFTU(){
		/* Should user receive first time usage flow */
		$optionName = "wpgmza-tour-ftu-complete";
		$optionValue = get_option($optionName);
		if(empty($optionValue)){
			return true;
		}
		return false;
	}

	public function loadFTU($document){
		$firstTimeUsageFlow = "ftu.trigger.markercreator";
		if($wrapper = $document->querySelector('.wpgmza-wrap')){
			$wrapper->setAttribute('data-wpgmza-ftu', $firstTimeUsageFlow);
			update_option("wpgmza-tour-ftu-complete", date("Y-m-d H:i:s"), false);
		}
	}

	public function loadOTH($document){
		$hintContainers = $document->querySelectorAll('.wpgmza-one-time-hint');
		if(!empty($hintContainers)){
			foreach($hintContainers as $container){
				$tag = $container->getAttribute('data-hint-tag');
				if($this->shouldReceiveOTH($tag)){
					/* Do not remove the element, and also mark it as complete */
					$this->markCompleteOTH($tag);
				} else {
					$container->remove();
				}
			}
		}
	}

	public function shouldReceiveOTH($tag){
		$optionName = "wpgmza-tour-one-time-hints";
		$optionValue = get_option($optionName);
		if(!empty($optionValue)){
			try{
				$json = json_decode($optionValue);
				if(!empty($json)){
					if(!empty($json->{$tag})){
						/* Has seen this one */
						return false;
					}
				}
			} catch (\Exception $ex){

			} catch (\Error $err){
				
			}
		}
		return true;
	}

	public function markCompleteOTH($tag){
		$optionName = "wpgmza-tour-one-time-hints";
		$optionValue = get_option($optionName);
		$hints = (object) array();
		if(!empty($optionValue)){
			try{
				$json = json_decode($optionValue);
				if(!empty($json)){
					$hints = $json;
				}
			} catch (\Exception $ex){

			} catch (\Error $err){

			}
		}

		if(is_object($hints)){
			$hints->{$tag} = true;

			try{
				$store = json_encode($hints);
				if(!empty($store)){
					update_option($optionName, $store, false);
				}
			} catch (\Exception $ex){

			} catch (\Error $err){

			}
		}
	}
}

add_action('wp_ajax_wpgmza_tour_progress_update', array('WPGMZA\\MapEditorTour', 'logProgressFromAjax'));