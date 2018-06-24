<?php

namespace WPGMZA;

class GDPRCompliance
{
	public function __construct()
	{
		add_filter('wpgmza_global_settings_tabs', array($this, 'onGlobalSettingsTabs'));
		add_filter('wpgmza_global_settings_tab_content', array($this, 'onGlobalSettingsTabContent'), 10, 1);
		
		add_filter('wpgmza_plugin_get_default_settings', array($this, 'onPluginGetDefaultSettings'));
		
		add_action('wp_ajax_wpgmza_gdpr_privacy_policy_notice_dismissed', array($this, 'onPrivacyPolicyNoticeDismissed'));
	}
	
	public function onPluginGetDefaultSettings($settings)
	{
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/gdpr-default-notice.html.php');
		
		return array_merge($settings, array(
			'wpgmza_gdpr_enabled'		=> 1,
			'wpgmza_gdpr_notice'		=> $document->saveInnerBody(),
			'wpgmza_gdpr_retention_purpose' => 'presenting the data you have submitted on the map.'
		));
	}
	
	public function onPrivacyPolicyNoticeDismissed()
	{
		$wpgmza_other_settings = get_option('WPGMZA_OTHER_SETTINGS');
		$wpgmza_other_settings['privacy_policy_notice_dismissed'] = true;
		
		update_option('WPGMZA_OTHER_SETTINGS', $wpgmza_other_settings);
		
		wp_send_json(array(
			'success' => 1
		));
		
		exit;
	}
	
	protected function getSettingsTabContent()
	{
		global $wpgmza;
		
		$settings = $wpgmza->settings;
		
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/gdpr-compliance-settings.html.php');
		
		$document->populate($settings);
		
		return $document;
	}
	
	public function getNoticeHTML($checkbox=true)
	{
		global $wpgmza;
		
		$wpgmza_other_settings = $wpgmza->settings;
		
		if(!$wpgmza_other_settings || empty($wpgmza_other_settings['wpgmza_gdpr_notice']))
			return '';
		
		$html = $wpgmza_other_settings['wpgmza_gdpr_notice'];
		
		$company_name 			= (empty($wpgmza_other_settings['wpgmza_gdpr_company_name']) ? '' : $wpgmza_other_settings['wpgmza_gdpr_company_name']);
		$retention_period_days 	= (empty($wpgmza_other_settings['wpgmza_gdpr_retention_period_days']) ? '' : $wpgmza_other_settings['wpgmza_gdpr_retention_period_days']);
		$retention_purpose		= (empty($wpgmza_other_settings['wpgmza_gdpr_retention_purpose']) ? '' : $wpgmza_other_settings['wpgmza_gdpr_retention_purpose']);
		
		$html = preg_replace('/{COMPANY_NAME}/i', $company_name, $html);
		$html = preg_replace('/{RETENTION_PERIOD}/i', $retention_period_days, $html);
		$html = preg_replace('/{RETENTION_PURPOSE}/i', $retention_purpose, $html);
		
		if($checkbox)
			$html = '<input type="checkbox" name="wpgmza_ugm_gdpr_consent" required/> ' . $html;
		
		$html = apply_filters('wpgmza_gdpr_notice_html', $html);
		
		return $html;
	}
	
	public function getPrivacyPolicyNoticeHTML()
	{
		global $wpgmza;
		
		if(!empty($wpgmza->settings->privacy_policy_notice_dismissed))
			return '';
		
		return "
			<div id='wpgmza-gdpr-privacy-policy-notice' class='notice notice-info is-dismissible'>
				<p>" . __('In light of recent EU GDPR regulation, we strongly recommend reviewing the <a target="_blank" href="https://www.wpgmaps.com/privacy-policy">WP Google Maps Privacy Policy</a>', 'wp-google-maps') . "</p>
			</div>
			";
	}
	
	public function getConsentPromptHTML()
	{
		return '<div>' . $this->getNoticeHTML(false) . "<p class='wpgmza-centered'><button class='wpgmza-api-consent'>" . __('I agree', 'wp-google-maps') . "</button></div></p>";
	}
	
	public function onGlobalSettingsTabs($input)
	{
		return $input . "<li><a href=\"#wpgmza-gdpr-compliance\">".__("GDPR Compliance","wp-google-maps")."</a></li>";
	}
	
	public function onGlobalSettingsTabContent($input)
	{
		$document = $this->getSettingsTabContent();
		return $input . $document->saveInnerBody();
	}
	
	public function onPOST()
	{
		$document = $this->getSettingsTabContent();
		$document->populate($_POST);
		
		$wpgmza_other_settings = get_option('WPGMZA_OTHER_SETTINGS');
		if(!$wpgmza_other_settings)
			$wpgmza_other_settings = array();
		
		foreach($document->querySelectorAll('input, select, textarea') as $input)
		{
			$name = $input->getAttribute('name');
			
			if(!$name)
				continue;
			
			switch($input->getAttribute('type'))
			{
				case 'checkbox':
					if($input->getValue())
						$wpgmza_other_settings[$name] = 1;
					else
						unset($wpgmza_other_settings[$name]);
					break;
				
				default:
					$wpgmza_other_settings[$name] = stripslashes( $input->getValue() );
					break;
			}
		}
		
		update_option('WPGMZA_OTHER_SETTINGS', $wpgmza_other_settings);
	}
}

$wpgmzaGDPRCompliance = new GDPRCompliance();
