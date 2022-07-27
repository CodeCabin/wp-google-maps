<?php

namespace WPGMZA;

class InstallerPage extends Page {
	public function __construct() {
		global $wpgmza;
		
		Page::__construct();
		
		$this->document->loadPHPFile($wpgmza->internalEngine->getTemplate('installer-page.html.php'));

		$wrapper = $this->document->querySelector('.wpgmza-installer-steps');

		$redirectUrl = admin_url('admin.php?page=wp-google-maps-menu');
		
		if(!empty($_GET['map_id'])){
			$editingMap = intval($_GET['map_id']);
			$redirectUrl = admin_url('admin.php?page=wp-google-maps-menu&action=edit&map_id=' . $editingMap);
		}

		$wrapper->setAttribute('data-redirect', $redirectUrl);

		if(!empty($_GET['autoskip'])){
			/* 
			 * The system detected an auto-skip param, let's set this in the DOM, so that the installer is 
			 * automatically skipped for X days when the page loads 
			 * 
			 * This is done in attempt to streamline first time use/onboarding to help users more quickly reach their end goal which is creating a map 
			 * 
			 * At some point the system will bring them back here without autoskip triggered and they will need to complete the onboarding flow, but this 
			 * way it does not feel as intrusive or required 
			*/
			$wrapper->setAttribute('data-auto-skip', 'true');
		}

	    /* Developer Hook (Action) - Alter output of the installer page, passes DOMDocument for mutation */     
		do_action("wpgmza_installer_page_created", $this->document);
	}


	public static function post(){
		global $wpgmza;
		
		if(!wp_verify_nonce($_POST['nonce'], 'wpgmza_installer_page')){
			http_response_code(403);
			exit;
		}
		
		if(!$wpgmza->isUserAllowedToEdit()){
			http_response_code(401);
			exit;
		}

		if($_POST['action'] === 'wpgmza_installer_page_skip'){
			/* Chosen to skip installation for now */
			$nextReminder = date('Y-m-d', strtotime('+1 day'));
			update_option('wpgmza-installer-paused', $nextReminder);
		} else {
			/* Completed the installation flow */
			if(!empty($wpgmza) && !empty($wpgmza->settings)){
				if(!empty($_POST['wpgmza_maps_engine'])){
					$wpgmza->settings->set('wpgmza_maps_engine', sanitize_text_field($_POST['wpgmza_maps_engine'])); 
					$wpgmza->settings->set('wpgmza_maps_engine_dialog_done', true);	
				}

				if(!empty($_POST['api_key'])){
					$wpgmza->settings->set('wpgmza_google_maps_api_key', sanitize_text_field($_POST['api_key']));
					update_option('wpgmza_google_maps_api_key', $_POST['api_key']);
				}

				if(!empty($_POST['tile_server_url'])){
					$wpgmza->settings->set('tile_server_url', sanitize_text_field($_POST['tile_server_url']));
				}

				delete_option('wpgmza-installer-paused');

			}

			/* Developer Hook (Action) - Handle storage from the installer page */     
			do_action("wpgmza_installer_page_on_post");
		}

		wp_send_json(array('success' => 1));
		exit;
	}
}

add_action('wpgmza_installer_page_create_instance', function() {
	$installerPage = InstallerPage::createInstance();
});

add_action('wp_ajax_wpgmza_installer_page_save_options', array('WPGMZA\\InstallerPage', 'post'));
add_action('wp_ajax_wpgmza_installer_page_skip', array('WPGMZA\\InstallerPage', 'post'));
