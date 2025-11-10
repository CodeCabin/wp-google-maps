<div class="wpgmza-feature-panel">

	<!-- Create instructions -->
	<div class="wpgmza-feature-drawing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card">
		<strong><?php _e("Creating polylines", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('<strong>Click</strong> on the map to start drawing your polyline.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('Add at least <strong>two</strong> points', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Complete</strong> drawing your polyline by <strong>clicking</strong> the end point a second time.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>
	
	<!-- Edit insstructions -->
	<div class="wpgmza-feature-editing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card">
		<strong><?php _e("Editing polylines", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('Use the fields below to edit this polylines information.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click and drag</strong> existing vertices to move them.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click and drag</strong> any edge to add vertices.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Hold Alt</strong> and click to remove vertices.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>

	<!-- Translateion instruction -->
	<div class="wpgmza-dynamic-translations-notice wpgmza-card wpgmza-shadow">
		<strong><?php _e("Translating polylines", "wp-google-maps"); ?></strong>
		<span><?php _e("Your polyline translations are being managed by:", "wp-google-maps"); ?> <span data-translation-provider></span></span>
		<span><?php _e("Use their tools to translate content within your polyline", "wp-google-maps"); ?></span>
	</div>

	<!-- Hidden reference fields -->
	<input data-ajax-name="id" type="hidden" value="-1"/>
	<input data-ajax-name="map_id" type="hidden" value="-1"/>
	
	<!-- Name -->
	<fieldset>
		<legend><?php esc_html_e("Name", "wp-google-maps"); ?></legend>
		<input type="text" data-ajax-name="polyname"/>
	</fieldset>

	<!-- Title -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e("Title", "wp-google-maps"); ?></legend>
		<input type="text" data-ajax-name="title"/>
	</fieldset>
	
	<!-- Description -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e("Description", "wp-google-maps"); ?></legend>
		<textarea data-ajax-name="description"></textarea>
	</fieldset>

	<!-- Link -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e("Link", "wp-google-maps"); ?></legend>
		<input type="text" data-ajax-name="link"/>
	</fieldset>

	<div class="wpgmza-css-state-block">
		<div class="wpgmza-css-state-block-tabs">
			<div class="wpgmza-css-state-block-item" data-type="normal"><?php _e("Normal", "wp-google-maps"); ?></div>
			<div class="wpgmza-css-state-block-item" data-type="hover"><?php _e("Hover", "wp-google-maps"); ?></div>
		</div>

		<!-- Normal shape state -->
		<div class="wpgmza-css-state-block-content" data-type="normal">
			<fieldset class="wpgmza-row">
				<!-- Line color -->
				<div class="wpgmza-col">
					<legend><?php esc_html_e("Line Color", "wp-google-maps"); ?></legend>
					<input data-ajax-name="linecolor" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#808080"/>
				</div>

				<!-- Opactiy -->
				<div class="wpgmza-col">
					<legend><?php esc_html_e("Opacity", "wp-google-maps"); ?></legend>
					<input type="number" data-ajax-name="opacity" min="0" max="1" step="0.1" value="0.5"/>
					<div class="hint">
						<?php esc_html_e('Example: 0.5 for 50%', 'wp-google-maps'); ?>
					</div>
				</div>
			</fieldset>	
		</div>

		<!-- Hover shape state -->
		<div class="wpgmza-css-state-block-content" data-type="hover">
			<fieldset class="wpgmza-row wpgmza-pro-feature">
				<!-- Line color -->
				<div class="wpgmza-col">
					<legend><?php esc_html_e("Line Color", "wp-google-maps"); ?></legend>
					<input data-ajax-name="ohlinecolor" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#808080"/>
				</div>

				<!-- Opactiy -->
				<div class="wpgmza-col wpgmza-pro-feature">
					<legend><?php esc_html_e("Opacity", "wp-google-maps"); ?></legend>
					<input type="number" data-ajax-name="ohopacity" min="0" max="1" step="0.1" value="0.5"/>
					<div class="hint">
						<?php esc_html_e('Example: 0.5 for 50%', 'wp-google-maps'); ?>
					</div>
				</div>
			</fieldset>	
		</div>
	</div>
	
	<!-- Thickness -->
	<fieldset>
		<legend> <?php esc_html_e("Line Thickness", "wp-google-maps"); ?> </legend>
		<input type="number" data-ajax-name="linethickness" min="1" max="50" step="1" value="4"/>
	</fieldset>

	<!-- Line Style -->
	<fieldset class="wpgmza-pro-feature">
		<legend> <?php esc_html_e("Line Style", "wp-google-maps"); ?> </legend>
		<select data-ajax-name="linestyle">
			<option value="0">
				<?php esc_html_e('Solid', 'wp-google-maps'); ?>
			</option>
			<option value="1">
				<?php esc_html_e('Dashed', 'wp-google-maps'); ?>
			</option>
			<option value="2">
				<?php esc_html_e('Dotted', 'wp-google-maps'); ?>
			</option>
		</select>
	</fieldset>

	<!-- Layer -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Layer', 'wp-google-maps'); ?></legend>
		
		<div>
			<input data-ajax-name="layergroup" type="number" min="0" max="100" value="0" step="1" />
			<small>
				<?php
				esc_html_e('Increase this number to move the shape to the top', 'wp-google-maps');
				?>
			</small>
		</div>
	</fieldset>

	<!-- Category -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e('Category', 'wp-google-maps'); ?> </legend>
		<div class="wpgmza-category-picker-container"></div>
	</fieldset>
	
	<!-- Polyline data -->
	<div class="fieldset-toggle">
		<span>Show polyline data</span>
	</div>

	<fieldset>
		<textarea data-ajax-name="polydata"></textarea>
	</fieldset>
	
	<!-- buttons -->	
	<fieldset class="wpgmza-save-feature-container">
		<button 
			type="button" 
			class="wpgmza-button wpgmza-button-accent wpgmza-save-feature"
			data-add-caption="<?php esc_attr_e('Add Polyline', 'wp-google-maps'); ?>"
			data-edit-caption="<?php esc_attr_e('Save Polyline', 'wp-google-maps'); ?>">
		</button>
	</fieldset>
</div>