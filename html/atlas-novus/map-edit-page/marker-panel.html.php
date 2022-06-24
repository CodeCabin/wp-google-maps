<div class="wpgmza-feature-panel wpgmza-marker-panel">
	
	<!-- Create instruction -->
	<div class="wpgmza-feature-drawing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card">
		<strong><?php _e("Creating markers", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('Use the <strong>address</strong> field to add a marker.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('Alternatively, <strong>right click</strong> to manually position your marker.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click and drag</strong> to adjust the markers position.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('Click the <strong>Add Marker</strong> button to create the marker.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>
	
	<!-- Edit instruction -->
	<div class="wpgmza-feature-editing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card">
		<strong><?php _e("Editing markers", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('Use the fields in the marker editor to edit this markers information', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click and drag</strong> to adjust the markers position.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>

	<!-- Hidden reference fields -->
	<input data-ajax-name="id" type="hidden" value="-1"/>
	<input data-ajax-name="map_id" type="hidden" value="-1"/>

	<div class="wpgmza-nag wpgmza-update-nag wpgmza-hidden wpgmza-adjust-mode-notice" style="padding: 10px; margin-bottom: 20px;">
		<strong><?php _e("Position Adjustment", "wp-google-maps"); ?></strong><br><br>
		<?php
			esc_html_e("You can now drag the marker to adjust the position without updating the address field. Field editing is disabled in this mode", "wp-google-maps");
		?>
	</div>
	
	<!-- Title -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Title', 'wp-google-maps'); ?></legend>
		<input type="text" data-ajax-name="title" placeholder="<?php _e('Title', 'wp-google-maps'); ?>"/>
	</fieldset>
	
	<!-- Address -->
	<fieldset style='position:relative;' class="wpgmza-always-on">
		<legend class="wpgmza-hide-in-adjust-mode"><?php esc_html_e('Address/GPS', 'wp-google-maps'); ?></legend>
		
		<div class="wpgmza-input-button__line wpgmza-hide-in-adjust-mode" style='display:block'>
			<input id="wpgmza_add_address_map_editor" type="text" data-ajax-name="address" class="wpgmza-address" autocomplete="off"/>
			<div id='wpgmza_autoc_disabled' style='display:none;'></div>

			<button 
				type="button"
				title="<?php esc_html_e('Extract address from picture', 'wp-google-maps'); ?>"
				class="wpgmza-get-location-from-picture wpgmza-button wpgmza-pro-feature" 
				data-source="[data-picture-url]"
				data-destination="[data-ajax-name='address']">
				<i class="fa fa-file-image-o" aria-hidden="true"></i>
			</button>
		
			<div id="wpgmza_autocomplete_search_results" class="" style="display: none;"></div>
		</div>
		
		<!-- Position (Adjust mode only) -->
		<legend class="wpgmza-show-in-adjust-mode wpgmza-hidden">
			<?php esc_html_e('Position', 'wp-google-maps'); ?>
		</legend>

		<input data-ajax-name="lat" name='lat' type="hidden"/>
		<input data-ajax-name="lng" name='lng' type="hidden"/>
	</fieldset>
	
	<!-- Description -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Description', 'wp-google-maps'); ?></legend>
		<textarea name="wpgmza-description" id="wpgmza-description-editor"></textarea>
	</fieldset>
	
	<!-- Gallery -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Gallery', 'wp-google-maps'); ?></legend>
		<div class="wpgmza-marker-gallery-input-container">
			<input data-ajax-name="gallery"/>
		</div>
	</fieldset>
	
	<!-- Link -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Link URL', 'wp-google-maps'); ?></legend>
		<input type="text" data-ajax-name="link"/>
	</fieldset>
	
	<!-- Marker Icon -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Marker Icon', 'wp-google-maps'); ?></legend>
		<div class="wpgmza-css-state-block">
			<div class="wpgmza-css-state-block-tabs">
				<div class="wpgmza-css-state-block-item" data-type="normal"><?php _e("Normal", "wp-google-maps"); ?></div>
				<div class="wpgmza-css-state-block-item" data-type="hover"><?php _e("Hover", "wp-google-maps"); ?></div>
			</div>

			<!-- Normal shape state -->
			<div class="wpgmza-css-state-block-content" data-type="normal">
				<div class="wpgmza-marker-icon-picker-container"></div>
			</div>

			<!-- Hover shape state -->
			<div class="wpgmza-css-state-block-content" data-type="hover">
				<div class="wpgmza-marker-hover-icon-picker-container"></div>
			</div>
		</div>
	</fieldset>
	
	<!-- Category -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Category', 'wp-google-maps'); ?> </legend>
		<div class="wpgmza-category-picker-container"></div>
	</fieldset>
	
	<!-- Animation -->
	<fieldset>
		<legend><?php esc_html_e('Animation', 'wp-google-maps'); ?>
		</legend>
		<select data-ajax-name="anim">
			<option value="0">
				<?php esc_html_e('None', 'wp-google-maps'); ?>
			</option>
			<option value="1">
				<?php esc_html_e('Bounce', 'wp-google-maps'); ?>
			</option>
			<option value="2">
				<?php esc_html_e('Drop', 'wp-google-maps'); ?>
			</option>
		</select>
	</fieldset>
	
	<!-- Info window -->
	<fieldset>
		<legend><?php esc_html_e('InfoWindow open by default', 'wp-google-maps'); ?></legend>
		<select data-ajax-name="infoopen">
			<option value="0">
				<?php esc_html_e('No', 'wp-google-maps'); ?>
			</option>
			<option value="1">
				<?php esc_html_e('Yes', 'wp-google-maps'); ?>
			</option>
		</select>
	</fieldset>
	
	<!-- Display frontend -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Display on front end', 'wp-google-maps'); ?></legend>
		<select data-ajax-name="approved">
			<option value="1">
				<?php esc_html_e('Yes', 'wp-google-maps'); ?>
			</option>
			<option value="0">
				<?php esc_html_e('No', 'wp-google-maps'); ?>
			</option>
		</select>
	</fieldset>
	
	<!-- Sticky -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Sticky', 'wp-google-maps'); ?></legend>
		
		<div>
			<input data-ajax-name="sticky" type="checkbox"/>
			<small>
				<?php
				esc_html_e('Always on top in Marker Listings', 'wp-google-maps');
				?>
			</small>
		</div>
	</fieldset>

	<!-- Layer -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Layer', 'wp-google-maps'); ?></legend>
		
		<div>
			<input data-ajax-name="layergroup" type="number" min="0" max="100" value="0" step="1" />
			<small>
				<?php
				esc_html_e('Increase this number to move the marker to the top', 'wp-google-maps');
				?>
			</small>
		</div>
	</fieldset>
	
	<!-- Buttons -->
	<fieldset class="wpgmza-save-feature-container wpgmza-always-on">
		<button 
			type="button" 
			class="wpgmza-button wpgmza-button-accent wpgmza-save-feature"
			data-add-caption="<?php esc_attr_e('Add Marker', 'wp-google-maps'); ?>"
			data-edit-caption="<?php esc_attr_e('Save Marker', 'wp-google-maps'); ?>">
		</button>
	</fieldset>
</div>