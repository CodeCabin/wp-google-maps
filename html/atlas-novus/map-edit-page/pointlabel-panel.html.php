<div class="wpgmza-feature-panel">

	<!-- Create instructions -->
	<div class="wpgmza-feature-drawing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card">
		<strong><?php _e("Creating labels", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('<strong>Click</strong> on the map to add a label.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Adjust</strong> options and move the label to your preferred location.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>
	
	<!-- Edit instructions -->
	<div class="wpgmza-feature-editing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card">
		<strong><?php _e("Editing labels", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('Use the fields below to edit this label.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click and drag</strong> the edge of the label to alter it\'s location.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>

	<!-- Hiddent reference fields -->
	<input data-ajax-name="id" type="hidden" value="-1"/>
	<input data-ajax-name="map_id" type="hidden" value="-1"/>
	
	<input data-ajax-name="center" type="hidden"/>
	
	<!-- Name -->
	<fieldset>
		<legend><?php esc_html_e("Name", "wp-google-maps"); ?></legend>
		<input data-ajax-name="name" type="text"/>
	</fieldset>

	<fieldset class="wpgmza-row wpgmza-pro-feature">
		<!-- Fill Color -->	
		<div class="wpgmza-col-4">
			<legend><?php esc_html_e("Fill Color", "wp-google-maps"); ?></legend>
			<input data-ajax-name="fillColor" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#404040"/>
		</div>

		<!-- Line Color -->	
		<div class="wpgmza-col-8">
			<legend><?php esc_html_e("Line Color", "wp-google-maps"); ?></legend>
			<input data-ajax-name="lineColor" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#ffffff"/>
		</div>
	</fieldset>
	
	<fieldset class="wpgmza-row wpgmza-pro-feature">
		<!-- Opacity -->
		<div class="wpgmza-col">
			<legend><?php esc_html_e("Opacity", "wp-google-maps"); ?></legend>
			<input type="number" data-ajax-name="opacity" min="0" max="1" step="0.1" value="1"/>

			<!-- Hint -->
			<div class="hint">
				<?php esc_html_e('Example: 0.5 for 50%', 'wp-google-maps'); ?>
			</div>
		</div>

		<!-- Font size -->
		<div class="wpgmza-col">
			<legend><?php esc_html_e("Font Size", "wp-google-maps"); ?></legend>
			<input type="number" data-ajax-name="fontSize" min="1" max="100" step="1" value="11"/> <em>px</em>
		</div>
	</fieldset>

	
	<!-- Buttons -->
	<fieldset class="wpgmza-save-feature-container">
		<button 
			type="button" 
			class="wpgmza-button wpgmza-button-accent wpgmza-save-feature"
			data-add-caption="<?php esc_attr_e('Add Label', 'wp-google-maps'); ?>"
			data-edit-caption="<?php esc_attr_e('Save Label', 'wp-google-maps'); ?>">
		</button>
	</fieldset>
</div>