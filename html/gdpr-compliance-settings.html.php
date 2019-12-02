<?php

if(!defined('ABSPATH'))
	return;

?><div id="wpgmza-gdpr-compliance">
	
	<div>
		<h3><?php _e( 'GDPR Compliance', 'wpgooglemaps' ); ?></h3>
		<p>
			<?php
			_e('Our GDPR notice will be displayed whenever the agreement cookie is not set. Agreeing to the notice will set this cookie.', 'wp-google-maps');
			?>
		</p>
		<p>
			<?php
			_e('Some caching and optimization plugins will continue to serve your map page with the GDPR agreement, disregarding this cookie. In this instance, clicking "I Agree" will reload the page and appear to have no effect. To solve this issue, we recommend you exclude your map page from caching and optimization.', 'wp-google-maps');
			?>
		</p>
	</div>
	
	<div id="wpgmza-gpdr-general-compliance">
	
		<h2>
			<?php _e('General Complicance', 'wp-google-maps'); ?>
		</h2>
		
		<fieldset>
		
			<label for="wpgmza_gdpr_require_consent_before_load">
				<?php
				_e('Require consent before loading Maps API', 'wp-google-maps');
				?>
				<i class="fa fa-question-circle" 
					title="<?php _e('The GDPR views IP Addresses as Personal Data, which requires consent before being processed. Loading the Google Maps API stores some user information, such as IP Addresses. WP Google Maps endeavours to uphold the spirit of data protection as per the GDPR. Enable this to option to prevent the Maps API from loading, until a user has consented to it.', 'wp-google-maps'); ?>"/>
			</label>
			<input name="wpgmza_gdpr_require_consent_before_load" type="checkbox"/>
		</fieldset>
		
	</div>
	
	<div id="wpgmza-gdpr-compliance-notice" style="display: none;">
		
		<h2>
			<?php _e('GDPR Consent Notice', 'wp-google-maps'); ?>
		</h2>
		
		<fieldset>
			<label for="wpgmza_gdpr_default_notice">
				<?php
				_e('GDPR Notice', 'wp-google-maps');
				?>
				<i class="fa fa-question-circle" 
					title="<?php _e('Users will be asked to accept the notice shown here, in the form of a check box.', 'wp-google-maps'); ?>"></i>
			</label>
			
			<div name="wpgmza_gdpr_default_notice"></div>
		</fieldset>
		
		<fieldset>
			<label for="wpgmza_gdpr_company_name">
				<?php
				_e('Company Name', 'wp-google-maps');
				?>
			</label>
			<input name="wpgmza_gdpr_company_name"/>
		</fieldset>
		
		
		<fieldset>
			<label for="wpgmza_gdpr_retention_purpose">
				<?php
				_e('Retention Purpose(s)', 'wp-google-maps');
				?>
			</label>
			<div>
				<input name="wpgmza_gdpr_retention_purpose"/>
				<br/>
				<small>
					<?php
					_e('The GDPR regulates that you need to state why you are processing data.', 'wp-google-maps');
					?>
				</small>
			</div>
		</fieldset>
		
		<fieldset>
			<label for="wpgmza_gdpr_override_notice">
				<?php
				_e('Override GDPR Notice', 'wp-google-maps');
				?>
			</label>
			<div>
				<input name="wpgmza_gdpr_override_notice" type="checkbox"/>
				<br/>
				<span class="notice notice-error" style="padding: 0.5em; display: block;">
					<?php
					_e('By checking this box, you agree to take sole responsibility for GDPR Compliance with regards to this plugin.', 'wp-google-maps');
					?>
				</span>
			</div>
		</fieldset>
		
		<fieldset id="wpgmza_gdpr_override_notice_text">
			<label for="wpgmza_gdpr_override_notice_text">
				<?php
				_e('Override Text', 'wp-google-maps');
				?>
			</label>
			<textarea name="wpgmza_gdpr_notice_override_text"></textarea>
		</fieldset>
		
		
	</div>
	
	<p>
		<?php
		_e('For more information about WPGM and GDPR compliance, please refer to our <a href="https://www.wpgmaps.com/gdpr/">GDPR information page</a> and our <a href="https://www.wpgmaps.com/privacy-policy/">Privacy Policy</a>', 'wp-google-maps');
		?>
	</p>
</div>