<?php

namespace WPGMZA;

class GDPRCompliance
{
	public function __construct()
	{
		$wpgmza_other_settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		if(empty($wpgmza_other_settings['wpgmza_gdpr_defaults_set']))
		{
			$wpgmza_other_settings['wpgmza_gdpr_enabled'] = 1;
			$wpgmza_other_settings['wpgmza_gdpr_notice'] = __('I agree for my personal data, provided via submission through \'User Generated Markers\', \'WP Google Maps\' Live Tracking app (where applicable), to be processed by {COMPANY_NAME}.
		
I agree for my personal data, provided via map API calls, to be processed by the API provider, for the purposes of geocoding (converting addresses to coordinates), reverse geocoding and generating directions.

Data will be stored for {RETENTION_PERIOD} days.
		
Currently supported API providers are Google, who\'s policy is outlined here <a href="https://cloud.google.com/security/gdpr/">here</a>, and OpenStreetMap who outline their policy <a href="https://wiki.openstreetmap.org/wiki/GDPR">here</a>.');

			$wpgmza_other_settings['wpgmza_gdpr_retention_purpose'] = 'Map functionality';
			
			$wpgmza_other_settings['wpgmza_gdpr_defaults_set'] = 1;
			
			update_option('WPGMZA_OTHER_SETTINGS', $wpgmza_other_settings);
		}
		
		add_filter('wpgmza_global_settings_tabs', array($this, 'onGlobalSettingsTabs'));
		add_filter('wpgmza_global_settings_tab_content', array($this, 'onGlobalSettingsTabContent'));
	}
	
	protected function getSettingsTabContent()
	{
		$wpgmza_other_settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/gdpr-compliance-settings.html.php');
		$document->populate($wpgmza_other_settings);
		
		return $document;
	}
	
	public function getNoticeHTML()
	{
		$wpgmza_other_settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		if(!$wpgmza_other_settings || empty($wpgmza_other_settings['wpgmza_gdpr_notice']))
			return '';
		
		$html = $wpgmza_other_settings['wpgmza_gdpr_notice'];
		
		$html = preg_replace('/{COMPANY_NAME}/gi', $wpgmza_other_settings['wpgmza_gdpr_company_name'], $html);
		$html = preg_replace('/{RETENTION_PERIOD}/gi', $wpgmza_other_settings['wpgmza_gdpr_retention_period_days'], $html);
		
		return '<input type="checkbox" name="wpgmza_ugm_gdpr_consent" required/> ' . $html;
	}
	
	public function onGlobalSettingsTabs()
	{
		return "<li><a href=\"#wpgmza-gdpr-compliance\">".__("GDPR Compliance","wp-google-maps")."</a></li>";
	}
	
	public function onGlobalSettingsTabContent()
	{
		$document = $this->getSettingsTabContent();
		return $document->saveInnerBody();
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
					if(isset($wpgmza_other_settings[$name]))
						unset($wpgmza_other_settings[$name]);
					else
						$wpgmza_other_settings[$name] = 1;
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
