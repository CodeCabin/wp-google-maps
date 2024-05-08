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

		$tempApiKey = get_option('wpgmza_temp_api');
		if(!empty($tempApiKey)){
			$wrapper->setAttribute('data-has-temp-api-key', 'true');
		}

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

			/* Additionally to auto-skipping the installer, we have a new system (as of 2024-05-07) that we are calling auto-onboarding-procedures 
			 * 
			 * For new users, we'll set an auto onboarding procedure to allow us to control their first time experience more effectively
			 * 
			 * This is based on a class constant, which will hold the current installer procedure, and we assume these can only run on `auto-skip` 
			 * which means they came from the welcome/credits page, which is usually right after an installation
			*/
			if(empty(get_option('wpgmza-installer-initial-procedure'))){
				$wrapper->setAttribute('data-auto-onboarding-procedure', 'engine_ol_2024_05');
			}
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

		$action = !empty($_POST['action']) ? $_POST['action'] : false;
		if($action === 'wpgmza_installer_page_skip'){
			/* Chosen to skip installation for now */
			$nextReminder = date('Y-m-d', strtotime('+1 day'));
			update_option('wpgmza-installer-paused', $nextReminder);

			/* Delete retrigger events if stored */
			delete_option('wpgmza-installer-retrigger-event');

		} else if($action === 'wpgmza_installer_page_temp_api_key'){
			/* Chosen to use a temporary API key instead of finishing setup */
			$temporaryKey = InstallerPage::generateTempApiKey();
			if(!empty($temporaryKey)){
				update_option('wpgmza_temp_api', $temporaryKey);
			}

			/* Also skips the installation and delays for a day, in the same way that the skip operation usually would */
			$nextReminder = date('Y-m-d', strtotime('+1 day'));
			update_option('wpgmza-installer-paused', $nextReminder);

			/* Delete retrigger events if stored */
			delete_option('wpgmza-installer-retrigger-event');

		} else if($action === 'wpgmza_installer_page_auto_onboarding_procedure'){
			/* Apply an auto onboarding procedure */
			$procedure = !empty($_POST['procedure']) ? $_POST['procedure'] : false;
			switch($procedure){
				case 'engine_ol_2024_05':
					/* Procedure: OpenLayers default engine
					 * Introduced: 2024-05-7
					 * Goal: Help streamline first time usage by setting the engine to OpenLayers as default, and 
					 * 		 getting the user into the map editor as efficiently as possible. OL needs no keys and as a result may help
					 * 		 with the onboarding of the user
					*/
					
					if(!empty($wpgmza) && !empty($wpgmza->settings)){
						$wpgmza->settings->set('wpgmza_maps_engine', 'open-layers'); 
						$wpgmza->settings->set('wpgmza_maps_engine_dialog_done', true);	
					}
					
					/* Prevent the system from coming back here in 1 day by mistake */
					delete_option('wpgmza-installer-paused');

					/* Mark this so that if the user later changes engines, we can gracefully redirect them to setup again */
					update_option('wpgmza-installer-retrigger-event', 'engine_ol_2024_05');
					update_option('wpgmza-installer-initial-procedure', 'engine_ol_2024_05');

					break;
				default: 
					/* Procedure is unknown, delay the installer for a day and come back to it then, because we aren't sure what was intended */
					$nextReminder = date('Y-m-d', strtotime('+1 day'));
					update_option('wpgmza-installer-paused', $nextReminder);
					break;
			}
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

				/* Delete retrigger events if stored */
				delete_option('wpgmza-installer-retrigger-event');

			}

			/* Developer Hook (Action) - Handle storage from the installer page */     
			do_action("wpgmza_installer_page_on_post");
		}

		wp_send_json(array('success' => 1));
		exit;
	}

	/**
	 * This will generate a temporary API key for the user
	 * 
	 * It will only function within the admin area, and acts as a first-time usage bridge to allow users to try things out
	 * before they go through the process of setting up an API key which they fully control
	 * 
	 * This will only generate a new key if there is no existing key stored within the database, which means it can realistically only be run once
	 * 
	 * @return string 
	 */
	public static function generateTempApiKey(){
		$siteUrl = site_url();
		$siteHash = md5($siteUrl);
		$response = wp_remote_get("https://wpgmaps.us-3.evennode.com/api/v1/google/generate/temporary?d={$siteUrl}&h={$siteHash}");
		if(is_array($response) && !is_wp_error($response)){
			try {
				$details = json_decode($response['body']);
				if(!empty($details) && !empty($details->apikey)){
					return $details->apikey;
				}
			} catch (\Exception $ex){

			} catch (\Error $err){

			}
		}
		return '';
	}

	/**
	 * Check if it's time for us to retrigger any of the installer events based on data changes 
	 * 
	 * This function may redirect the user if applicable
	 * 
	 * @param object $wpgmza
	 * 
	 * @return void
	 */
	public static function retriggerInstallerEvents($wpgmza){
		if(!empty($wpgmza) && !empty($wpgmza->settings)){
			$retriggerEvent = get_option('wpgmza-installer-retrigger-event');
			if(!empty($retriggerEvent)){
				/* We have a stored retrigger event, meaning that we might need to take some action, because a settings change has taken place */
				switch($retriggerEvent){
					case 'engine_ol_2024_05':
						if($wpgmza->settings->wpgmza_maps_engine !== 'open-layers'){
							/* User has moved away from the onboarding engine, time to retrigger the installer */
							delete_option('wpgmza-installer-retrigger-event');

							wp_safe_redirect(admin_url('admin.php?page=wp-google-maps-menu&action=installer&autoskip=true'));
							exit();
						}

						break;
					default:
						/* Unknown retrigger event, stop monitoring */
						delete_option('wpgmza-installer-retrigger-event');
						break;
				}
			}

		}
	}
}

add_action('wpgmza_installer_page_create_instance', function() {
	$installerPage = InstallerPage::createInstance();
});

add_action('wp_ajax_wpgmza_installer_page_save_options', array('WPGMZA\\InstallerPage', 'post'));
add_action('wp_ajax_wpgmza_installer_page_skip', array('WPGMZA\\InstallerPage', 'post'));
add_action('wp_ajax_wpgmza_installer_page_temp_api_key', array('WPGMZA\\InstallerPage', 'post'));
add_action('wp_ajax_wpgmza_installer_page_auto_onboarding_procedure', array('WPGMZA\\InstallerPage', 'post'));

add_action('wpgmza_global_settings_before_redirect', array('WPGMZA\\InstallerPage', 'retriggerInstallerEvents'));
