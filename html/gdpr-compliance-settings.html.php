<div id="wpgmza-gdpr-compliance">
	<h2>
		<?php _e('General Complicance', 'wp-google-maps'); ?>
	</h2>
	
	<fieldset>
		<label for="wpgmza_gdpr_enabled">
			<?php
			_e('Enable GDPR Compliance', 'wp-google-maps');
			?>
			<i class="fa fa-question-circle" 
				title="<?php _e('Disabling will disable all GDPR related options, this is not advised.', 'wp-google-maps'); ?>"/>
		</label>
		<div>
			<input name="wpgmza_gdpr_enabled" type="checkbox"/>
			<br/>
			<small>
				<?php _e('Read more on <a href="https://www.eugdpr.org/" target="_blank">the importance of GDPR Compliance</a>', 'wp-google-maps'); ?>
			</small>
		</div>
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
		<label for="wpgmza_gdpr_notice">
			<?php
			_e('GDPR Notice', 'wp-google-maps');
			?>
			<i class="fa fa-question-circle" 
				title="<?php _e('Users will be asked to accept the notice shown here, in the form of a check box.', 'wp-google-maps'); ?>"></i>
		</label>
		<textarea name="wpgmza_gdpr_notice"></textarea>
	</fieldset>
	
	<fieldset>
		<label for="wpgmza_gdpr_require_consent_before_load">
			<?php
			_e('Require consent before load', 'wp-google-maps');
			?>
			<i class="fa fa-question-circle" 
				title="<?php _e('The GDPR views IP Addresses as Personal Data, which requires consent before being processed. Loading the Google Maps API stores some user information, such as IP Addresses. WP Google Maps endeavours to uphold the spirit of data protection as per the GDPR. Enable this to option to prevent the Maps API from loading, until a user has consented to it.', 'wp-google-maps'); ?>"/>
		</label>
		<input name="wpgmza_gdpr_require_consent_before_load" type="checkbox"/>
	</fieldset>
	
	<h2>
		<?php _e('VGM Add-on Compliance', 'wp-google-maps'); ?>
	</h2>
	
	<p>
		<?php
		_e('For more information about WPGM and GDPR compliance, please refer to our <a href="https://www.wpgmaps.com/gdpr/">GDPR information page</a> and our <a href="https://www.wpgmaps.com/privacy-policy/">Privacy Policy</a>', 'wp-google-maps');
		?>
	</p>
</div>