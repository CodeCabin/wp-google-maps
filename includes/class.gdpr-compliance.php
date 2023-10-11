<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * This module handles all GDPR functionality for the plugin, including
 * displaying notices, settings and handling logic
 */
class GDPRCompliance
{
	private static $filtersBound = false;
	
	public function __construct()
	{
		if(!GDPRCompliance::$filtersBound)
		{
			//add_filter('wpgmza_global_settings_tabs', array($this, 'onGlobalSettingsTabs'));
			//add_filter('wpgmza_global_settings_tab_content', array($this, 'onGlobalSettingsTabContent'), 10, 1);
			
			add_filter('wpgmza_plugin_get_default_settings', array($this, 'onPluginGetDefaultSettings'));
			
			GDPRCompliance::$filtersBound = true;
		}
	}
	
	/**
	 * Gets the default GDPR settings
	 * @return array An array of key value pairs where the key is the setting name
	 */
	public function getDefaultSettings()
	{

		/* Developer Hook (Filter) - Alter the default GDPR notice */
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
	Some visual components of WP Go Maps use 3rd party libraries which are loaded over the network. At present the libraries are Google Maps, Open Street Map, jQuery DataTables and FontAwesome. When loading resources over a network, the 3rd party server will receive your IP address and User Agent string amongst other details. Please refer to the Privacy Policy of the respective libraries for details on how they use data and the process to exercise your rights under the GDPR regulations.
</p>
<p>
	WP Go Maps uses jQuery DataTables to display sortable, searchable tables, such as that seen in the Advanced Marker Listing and on the Map Edit Page. jQuery DataTables in certain circumstances uses a cookie to save and later recall the "state" of a given table - that is, the search term, sort column and order and current page. This data is held in local storage and retained until this is cleared manually. No libraries used by WP Go Maps transmit this information.
</p>
<p>
	Please <a href="https://developers.google.com/maps/terms">see here</a> and <a href="https://maps.google.com/help/terms_maps.html">here</a> for Google\'s terms. Please also see <a href="https://policies.google.com/privacy?hl=en-GB&amp;gl=uk">Google\'s Privacy Policy</a>. We do not send the API provider any personally identifying information, or information that could uniquely identify your device.
</p>
<p>
	Where this notice is displayed in place of a map, agreeing to this notice will store a cookie recording your agreement so you are not prompted again.
</p>'), 'wp-google-maps'),

			'wpgmza_gdpr_company_name'		=> get_bloginfo('name'),
			'wpgmza_gdpr_retention_purpose' => 'displaying map tiles, geocoding addresses and calculating and display directions.',
			'wpgmza_gdpr_button_label' => 'I agree'
		);
	}
	
	/**
	 * Hooks into wpgmza_plugin_get_default_settings filter, to add the default GDPR settings
	 * @param array The settings array passed in by the Plugin instance
	 */
	public function onPluginGetDefaultSettings($settings)
	{
		return array_merge($settings, $this->getDefaultSettings());
	}
	
	/**
	 * Called by onGlobalSettingsTabContent to add the content to our GDPR tab on the settings page, triggered by the filter wpgmza_global_settings_tab_content.
	 * @deprecated Built into the settings page as of 8.1.0, provided for legacy support
	 * @return DOMDocument The GDPR tab content
	 */
	public function getSettingsTabContent()
	{
		global $wpgmza;
		
		$settings = array_merge(
			(array)$this->getDefaultSettings(),
			get_option('WPGMZA_OTHER_SETTINGS')
		);
		
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/gdpr-compliance-settings.html.php');
		
		/* Developer Hook (Filter) - Alter the GDPR settings tab, passes DOMDocument for mutation, must return DOMDocument */
		$document = apply_filters('wpgmza_gdpr_settings_tab_content', $document);
		
		$document->populate($settings);
		
		return $document;
	}
	
	/**
	 * Gets the HTML for the GDPR notice to display on the front end.
	 * @param bool $checkbox Whether to include a consent checkbox.
	 * @return string The HTML string for the GDPR notice
	 */
	public function getNoticeHTML($checkbox=true)
	{
		$wpgmza_other_settings = array_merge( (array)$this->getDefaultSettings(), get_option('WPGMZA_OTHER_SETTINGS') );
		
		/* Developer Hook (Filter) - Alter GDPR HTML output by the plugin */
		$html = apply_filters('wpgmza_gdpr_notice', $wpgmza_other_settings['wpgmza_gdpr_default_notice']);
		
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
		
		/* Developer Hook (Filter) - Alter GDPR Notice HTML */
		$html = apply_filters('wpgmza_gdpr_notice_html', $html);
		
		if(empty($html))
			return "";
		
		$document = new DOMDocument();

		try{
			if(version_compare(phpversion(), '8.2', '>=')){
				/* Deprecations in PHP require us to rework the way we do conversions */
				$converted = htmlspecialchars_decode(mb_encode_numericentity(htmlentities($html, ENT_QUOTES, 'UTF-8'), [0x80, 0x10FFFF, 0, ~0], 'UTF-8'));
				$html = $converted;
			} else {
				if(function_exists('mb_convert_encoding')){
					$html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
				} else{
					trigger_error('Using fallback UTF to HTML entity conversion', E_USER_NOTICE);
					$html = htmlspecialchars_decode(utf8_decode(htmlentities($html, ENT_COMPAT, 'utf-8', false)));
				}
			}
		} catch (\Exception $ex){
			if(function_exists('mb_convert_encoding')){
				$html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
			} else if (function_exists('utf8_decode')){
				$html = utf8_decode($html);
			}
		}

		@$document->loadHTML($html);
		$document->populate($wpgmza_other_settings);
		
		return $document->saveInnerBody();
	}
	
	/**
	 * Gets the HTML for the back end "check our updated privacy policy" notice. This will return an empty string if the notice has already been dismissed.
	 * @return string The notice HTML.
	 */
	public function getPrivacyPolicyNoticeHTML()
	{
		global $wpgmza;
		
		// Dropped in 7.11.*
		return '';
		
		if(!empty($wpgmza->settings->privacy_policy_notice_dismissed))
			return '';
		
		return "
			<div id='wpgmza-gdpr-privacy-policy-notice' class='notice notice-info is-dismissible'>
				<p>" . __('In light of recent EU GDPR regulation, we strongly recommend reviewing the <a target="_blank" href="https://www.wpgmaps.com/privacy-policy">WP Go Maps Privacy Policy</a>', 'wp-google-maps') . "</p>
			</div>
			";
	}
	
	/**
	 * Gets the consent prompt HTML, including the consent button.
	 * @return string The prompt HTML.
	 */
	public function getConsentPromptHTML()
	{
		$wpgmza_other_settings = array_merge( (array)$this->getDefaultSettings(), get_option('WPGMZA_OTHER_SETTINGS') );
		$button_label = ((empty($wpgmza_other_settings['wpgmza_gdpr_button_label']) || $wpgmza_other_settings['wpgmza_gdpr_button_label'] === 'I agree') ? __('I agree', 'wp-google-maps') : $wpgmza_other_settings['wpgmza_gdpr_button_label']);

		return '<div class="wpgmza-gdpr-compliance">' . $this->getNoticeHTML(false) . "<p class='wpgmza-centered'><button class='wpgmza-api-consent'>" . $button_label . "</button></div></p>";
	}
	
	/**
	 * Callback for the wpgmza_global_settings_tabs filter. This adds the GDPR tab. Please note this is the tab itself, as opposed to the tab content.
	 * @param string $input The HTML string passed in by the filter.
	 * @return string The HTML for the tab.
	 */
	public function onGlobalSettingsTabs($input)
	{
		return $input . "<li><a href=\"#wpgmza-gdpr-compliance\">".__("GDPR Compliance","wp-google-maps")."</a></li>";
	}
	
	/**
	 * Callback for the wpgmza_global_settings_tab_content filter. This adds the GPDR tab content. Please note this is for the tab content, as opposed to the tab itself.
	 * @param string $input The HTML string passed in by the filter.
	 * @return string The HTML for the tab content.
	 */
	public function onGlobalSettingsTabContent($input)
	{
		$document = $this->getSettingsTabContent();
		return $input . $document->saveInnerBody();
	}
	
	/**
	 * Handles POST data when the settings page saves.
	 * NB: Deprecated as of 8.1.0. The settings page module handles this.
	 * @deprecated
	 * @return void
	 */
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
