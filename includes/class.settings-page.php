<?php

namespace WPGMZA;

class SettingsPage extends Page {
	public function __construct() {
		global $wpgmza;
		
		Page::__construct();

		$this->document->loadPHPFile($wpgmza->internalEngine->getTemplate('settings-page.html.php'));

		$this->disableProFeatures();
		$this->hideSelectedProFeatures();
		
		$this->form = $this->document->querySelector('form');

		/* Developer Hook (Filter) - Add tabs to global settings page */
		$addOnTabs = apply_filters("wpgmza_global_settings_tabs", "");
		if(!empty($addOnTabs)){
			$this->form->querySelector('.settings-tabs-nav')->import($addOnTabs);
		}

		/* Developer Hook (Filter) - Add tab content to global settings page */
		$addOnContent = apply_filters("wpgmza_global_settings_tab_content", "");
		if(!empty($addOnContent)){
			$this->form->querySelector('.addition-tabs')->import($addOnContent);
		}

		if(class_exists("COMPLIANZ")){
			$this->form->querySelector('.wpgmza-complianz-notice')->removeClass('wpgmza-hidden');
			$this->form->querySelector('#wpgmza-gdpr-compliance-notice')->addClass('wpgmza-hidden');
			$this->form->querySelector('input[name="wpgmza_gdpr_require_consent_before_load"]')->setAttribute('disabled', 'disabled');
		}

		if(class_exists("WPGMZA\\MapSelect")){
			if($wooCheckoutMapSelectWrapper = $this->document->querySelector('.woo-checkout-map-select-wrapper')){
				$wooCheckoutMapSelect = new MapSelect('woo_checkout_map_id');
				$wooCheckoutMapSelectWrapper->import($wooCheckoutMapSelect);
			}
		}

	    /* Developer Hook (Action) - Alter output of the settings page, passes DOMDocument for mutation */     
		do_action("wpgmza_global_settings_page_created", $this->document);
		
		if(empty($_POST)) {
			$this->document->populate($wpgmza->settings);
			$this->addFormNonces();
			$wpgmza->scriptLoader->enqueueCodeMirror();

		} else {
			if(!$this->isNonceValid($this->form, $_POST['nonce']))
				throw new \Exception("Invalid nonce");
			
			$oldPullMethod	= $wpgmza->settings->wpgmza_settings_marker_pull;
			
			// NB: Prevent slashes accumulating in paths on Windows machines
			$data			= array_map('stripslashes', $_POST);

			// Improved KSES cleanup to support the custom scripts, while still cleaning text inputs like the GDPR overrides
			foreach($data as $key => $value){
				if(is_string($value)){
					if($key === "wpgmza_custom_css" || $key === "wpgmza_custom_js"){
						// Skip custom scripts, they should not be KSES cleaned
						continue;
					}

					$data[$key] = wp_kses_post($value);
				}
			}
			
			$this->document->populate($data);
			
			$data			= $this->form->serializeFormData();

			/* Developer Hook (Filter) - Add data to be saved to global storage, reduxed */
			$data = apply_filters("wpgmza_global_settings_save_redux", $data);
			
			foreach($data as $key => $value)
				$wpgmza->settings->{$key} = $value;
			
			// Update XML caches if we've just switched to XML mode
			if($wpgmza->settings->wpgmza_settings_marker_pull == Plugin::MARKER_PULL_XML && $oldPullMethod != Plugin::MARKER_PULL_XML){
				$wpgmza->updateAllMarkerXMLFiles();
			}
			
			wp_redirect($_SERVER['HTTP_REFERER']);
			return;
		}
	}

	public static function dangerZoneDelete(){
		global $wpgmza;
		
		if(!wp_verify_nonce($_POST['nonce'], 'wpgmza_maps_settings_danger_zone_delete_data')){
			http_response_code(403);
			exit;
		}
		
		if(!$wpgmza->isUserAllowedToEdit()){
			http_response_code(401);
			exit;
		}


		$type = sanitize_text_field($_POST['type']);
		$wpgmza->deleteAllData($type);
		
		wp_send_json(array('success' => 1));
		exit;
	}


	
	
}

add_action('admin_post_wpgmza_save_settings', function() {

	$settingsPage = SettingsPage::createInstance();

});

add_action('wp_ajax_wpgmza_maps_settings_danger_zone_delete_data', array('WPGMZA\\SettingsPage', 'dangerZoneDelete'));

