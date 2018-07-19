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
		
		//add_action('admin_notices', array($this, 'onAdminNotices'));
		//add_action('admin_post_wpgmza_dismiss_admin_gdpr_warning', array($this, 'onDismissAdminWarning'));
		
		//$this->setDefaultSettings();
	}
	
	public function getDefaultSettings()
	{
		return array(
			'wpgmza_gdpr_enabled'			=> 1,
			'wpgmza_gdpr_default_notice'	=> apply_filters('wpgmza_gdpr_notice',
											__('<p>
	I agree for my personal data to be processed by <span name="wpgmza_gdpr_company_name"></span>, for the purpose(s) of <span name="wpgmza_gdpr_retention_purpose"></span>.
</p>

<p>	
	I agree for my personal data, provided via map API calls, to be processed by the API provider, for the purposes of geocoding (converting addresses to coordinates), reverse geocoding and	generating directions.
</p>
<p>
	Some visual components of WP Google Maps use 3rd party libraries which are loaded over the network. At present the libraries are Google Maps, Open Street Map, jQuery DataTables and FontAwesome. When loading resources over a network, the 3rd party server will receive your IP address and User Agent string amongst other details. Please refer to the Privacy Policy of the respective libraries for details on how they use data and the process to exercise your rights under the GDPR regulations.
</p>
<p>
	WP Google Maps uses jQuery DataTables to display sortable, searchable tables, such as that seen in the Advanced Marker Listing and on the Map Edit Page. jQuery DataTables in certain circumstances uses a cookie to save and later recall the "state" of a given table - that is, the search term, sort column and order and current page. This data is held in local storage and retained until this is cleared manually. No libraries used by WP Google Maps transmit this information.
</p>
<p>
	Please <a href="https://developers.google.com/maps/terms">see here</a> and <a href="https://maps.google.com/help/terms_maps.html">here</a> for Google\'s terms. Please also see <a href="https://policies.google.com/privacy?hl=en-GB&amp;gl=uk">Google\'s Privacy Policy</a>. We do not send the API provider any personally identifying information, or information that could uniquely identify your device.
</p>
<p>
	Where this notice is displayed in place of a map, agreeing to this notice will store a cookie recording your agreement so you are not prompted again.
</p>'), 'wp-google-maps'),

			'wpgmza_gdpr_company_name'		=> get_bloginfo('name'),
			'wpgmza_gdpr_retention_purpose' => 'displaying map tiles, geocoding addresses and calculating and display directions.'
		);
	}
	
	/*public function setDefaultSettings()
	{
		$settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		if(empty($settings))
			$settings = array();
		
		if(isset($settings['wpgmza_gdpr_notice']))
			return;
		
		$settings = array_merge($settings, $this->getDefaultSettings());
		
		update_option('WPGMZA_OTHER_SETTINGS', $settings);
	}*/
	
	public function onPluginGetDefaultSettings($settings)
	{
		return array_merge($settings, $this->getDefaultSettings());
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
		
		$settings = array_merge(
			(array)$this->getDefaultSettings(),
			get_option('WPGMZA_OTHER_SETTINGS')
		);
		
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/gdpr-compliance-settings.html.php');
		
		$document = apply_filters('wpgmza_gdpr_settings_tab_content', $document);
		
		$document->populate($settings);
		
		return $document;
	}
	
	public function getNoticeHTML($checkbox=true)
	{
		$wpgmza_other_settings = array_merge( (array)$this->getDefaultSettings(), get_option('WPGMZA_OTHER_SETTINGS') );
		
		$html = $wpgmza_other_settings['wpgmza_gdpr_default_notice'];
		
		if(!empty($wpgmza_other_settings['wpgmza_gdpr_override_notice']) && !empty($wpgmza_other_settings['wpgmza_gdpr_notice_override_text']))
			$html = $wpgmza_other_settings['wpgmza_gdpr_notice_override_text'];
		
		$company_name 			= (empty($wpgmza_other_settings['wpgmza_gdpr_company_name']) ? '' : $wpgmza_other_settings['wpgmza_gdpr_company_name']);
		$retention_period_days 	= (empty($wpgmza_other_settings['wpgmza_gdpr_retention_period_days']) ? '' : $wpgmza_other_settings['wpgmza_gdpr_retention_period_days']);
		$retention_purpose		= (empty($wpgmza_other_settings['wpgmza_gdpr_retention_purpose']) ? '' : $wpgmza_other_settings['wpgmza_gdpr_retention_purpose']);
		
		$html = preg_replace('/{COMPANY_NAME}/i', $company_name, $html);
		$html = preg_replace('/{RETENTION_PERIOD}/i', $retention_period_days, $html);
		$html = preg_replace('/{RETENTION_PURPOSE}/i', $retention_purpose, $html);
		
		if($checkbox)
			$html = '<input type="checkbox" name="wpgmza_ugm_gdpr_consent" required/> ' . $html;
		
		$html = apply_filters('wpgmza_gdpr_notice_html', $html);
		
		$document = new DOMDocument();
		@$document->loadHTML( utf8_decode($html) );
		$document->populate($wpgmza_other_settings);
		
		return $document->saveInnerBody();
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
	
	/*public function onAdminNotices()
	{
		global $wpgmza;
		
		$settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		if(!empty($settings['wpgmza_gdpr_enabled']))
			return;
		
		if(!empty($_COOKIE['wpgmza-gdpr-user-has-dismissed-admin-warning']))
			return;
		
		echo '
			<div class="notice admin-notice notice-error">
				<p>
					<strong>
						' . __('WP Google Maps - Warning - GDPR Compliance Disabled - Action Required', 'wp-google-maps') . '
					</strong>
				</p>
				<p>
					' . __('GDPR compliance has been disabled, read more about the implications of this here: ', 'wp-google-maps') . '
					<a href="https://www.eugdpr.org/" target="_blank">' . __('EU GDPR', 'wp-google-maps') . '</a>
				</p>
				<p>
					' . __('Additionally please take a look at WP Google Maps <a href="https://www.wpgmaps.com/privacy-policy">Privacy Policy</a>') . '
				</p>
				<p>
					' . __('It is highly recommended that you enable GDPR compliance to ensure your user data is regulated.') . '
				</p>
				
				<form action="' . admin_url('admin-post.php') . '" method="POST">
					<input type="hidden" name="action" value="wpgmza_dismiss_admin_gdpr_warning"/>
					<input type="hidden" name="redirect" value="' . $_SERVER['REQUEST_URI'] . '"/>
				
					<p>
						<a href="' . admin_url('admin.php?page=wp-google-maps-menu-settings') . '" class="button button-secondary">' . __('Privacy Settings', 'wp-google-maps') . '</a>
					
						<button type="submit" class="button button-primary" style="background-color: #DC3232 !important; border: none !important; box-shadow: 0 1px 0 #DA2825; text-shadow: 0px -1px 1px #DA2825">' . __('Dismiss & Accept Responsibility', 'wp-google-maps') . '</button>
					</p>
				</form>
			</div>
		';
	}
	
	public function onDismissAdminWarning()
	{
		setcookie('wpgmza-gdpr-user-has-dismissed-admin-warning', 'true', 2147483647);
		wp_redirect($_POST['redirect']);
		exit;
	}*/
	
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
					{
						$wpgmza_other_settings[$name] = 1;
					}
					else
					{
						unset($wpgmza_other_settings[$name]);
					}
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
