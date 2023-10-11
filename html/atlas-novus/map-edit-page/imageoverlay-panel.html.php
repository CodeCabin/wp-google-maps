<div class="wpgmza-feature-panel">

	<!-- Create instructions -->
	<div class="wpgmza-feature-drawing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card wpgmza-pro-feature">
		<strong><?php _e("Creating overlays", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('<strong>Click</strong> on the map to set the first corner of your overlay.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click</strong> again to set the other corner and to finish drawing your overlay.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Upload</strong> an image to be placed within the overlay area.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>
	
	<!-- Edit instructions -->
	<div class="wpgmza-feature-editing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card wpgmza-pro-feature">
		<strong><?php _e("Editing overlays", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('Use the fields below to edit this overlay.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click and drag</strong> corners of the overlay to resize it.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Upload</strong> an image to be place within the overlay area.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>

	<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
		<?php
			echo sprintf(
				__('Add image overlays with the <a href="%s" target="_BLANK">Pro version</a>.', "wp-google-maps"),
				esc_attr("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=imvageoverlayseditor-atlas-novus" . wpgmzaGetUpsellLinkParams())
			);
		?>
	</div>

	<!-- Hidden reference fields -->
	<input data-ajax-name="id" type="hidden" value="-1"/>
	<input data-ajax-name="map_id" type="hidden" value="-1"/>
	
	<input data-ajax-name="cornerA" type="hidden"/>
	<input data-ajax-name="cornerB" type="hidden"/>
	
	<!-- Name -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e("Name", "wp-google-maps"); ?></legend>
		<input data-ajax-name="name" type="text"/>
	</fieldset>


	<!-- Opacity -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e("Opacity", "wp-google-maps"); ?></legend>
		<input type="number" data-ajax-name="opacity" min="0" max="1" step="0.1" value="1.0"/>

		<!-- Hint -->
		<div class="hint">
			<?php esc_html_e('Example: 0.5 for 50%', 'wp-google-maps'); ?>
		</div>
	</fieldset>
	
	<!-- Image -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e("Image", "wp-google-maps"); ?></legend>
		<input type="text" data-ajax-name="image" class="wpgmza-image-single-input" />
	</fieldset>

	<div class="wpgmza-row wpgmza-pro-feature wpgmza-margin-t-20 overlay-actions wpgmza-hidden">
		<div class="wpgmza-col">
			<button data-placement="contain" class="wpgmza-button"><i class="fa fa-compress" aria-hidden="true" <?php _e("Place image in center, while maintaining aspect ratio", "wp-google-maps"); ?>></i> <?php esc_html_e("Contain", "wp-google-maps"); ?></button>
			<button data-placement="stretch" class="wpgmza-button"><i class="fa fa-expand" aria-hidden="true" title="<?php _e("Fit image to map boundary", "wp-google-maps"); ?>"></i> <?php esc_html_e("Stretch", "wp-google-maps"); ?></button>
		</div>
	</div>

	<!-- Buttons -->
	<fieldset class="wpgmza-save-feature-container">
		<button 
			type="button" 
			class="wpgmza-button wpgmza-button-accent wpgmza-save-feature"
			data-add-caption="<?php esc_attr_e('Add Overlay', 'wp-google-maps'); ?>"
			data-edit-caption="<?php esc_attr_e('Save Overlay', 'wp-google-maps'); ?>">
		</button>
	</fieldset>
</div>