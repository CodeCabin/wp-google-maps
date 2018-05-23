<div id="wpgmza-gdpr-compliance">
	<h2>
		<?php _e('Privacy', 'wp-google-maps'); ?>
	</h2>
	
	<fieldset>
		<label for="wpgmza_gdpr_enabled">
			<?php
			_e('Enable GDPR Compliance', 'wp-google-maps');
			?>
			<i class="fa fa-question-circle" 
				title="<?php _e('Disabling will disable all GDPR related options, this is not advised.', 'wp-google-maps'); ?>"/>
		</label>
		<input name="wpgmza_gdpr_enabled" type="checkbox" checked="checked"/>
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
		<input name="wpgmza_gdpr_retention_purpose"/>
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
</div>