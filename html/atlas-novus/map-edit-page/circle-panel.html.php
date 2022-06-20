<div class="wpgmza-feature-panel">

	<!-- Create instructions -->
	<div class="wpgmza-feature-drawing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card">
		<strong><?php _e("Creating circles", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('<strong>Click</strong> on the map to set your circles center.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Move</strong> the mouse to adjust your circles radius.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click</strong> a second time to finish drawing your circle.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>
	
	<!-- Edit instructions -->
	<div class="wpgmza-feature-editing-instructions wpgmza-card wpgmza-shadow wpgmza-instruction-card">
		<strong><?php _e("Editing circles", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('Use the fields below to edit this circles information.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click and drag</strong> the center of the circle to move it.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Click and drag</strong> the edge of the circle to alter it\'s radius.', 'wp-google-maps'); ?>
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

	<!-- Description -->
	<fieldset class="wpgmza-pro-feature">
		<legend><?php esc_html_e("Description", "wp-google-maps"); ?></legend>
		<textarea data-ajax-name="description"></textarea>
	</fieldset>

	<!-- Radius -->	
	<fieldset>
		<legend><?php esc_html_e("Radius (km)", "wp-google-maps"); ?></legend>
		<input data-ajax-name="radius" type="number" min="0" step="any" value="20"/>
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
				<!-- Fill Color -->	
				<div class="wpgmza-col-4">
					<legend><?php esc_html_e("Fill Color", "wp-google-maps"); ?></legend>
					<input data-ajax-name="color" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#808080"/>
				</div>

				<!-- Opacity -->
				<div class="wpgmza-col-8">
					<legend><?php esc_html_e("Opacity", "wp-google-maps"); ?></legend>
					<input type="number" data-ajax-name="opacity" min="0" max="1" step="0.1" value="0.5"/>

					<!-- Hint -->
					<div class="hint">
						<?php esc_html_e('Example: 0.5 for 50%', 'wp-google-maps'); ?>
					</div>
				</div>
			</fieldset>

			<fieldset class="wpgmza-row">
				<!-- Line Color -->	
				<div class="wpgmza-col-4">
					<legend><?php esc_html_e("Line Color", "wp-google-maps"); ?></legend>
					<input data-ajax-name="lineColor" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#000000"/>
				</div>

				<!-- Opacity -->
				<div class="wpgmza-col-8">
					<legend><?php esc_html_e("Opacity", "wp-google-maps"); ?></legend>
					<input type="number" data-ajax-name="lineOpacity" min="0" max="1" step="0.1" value="0.0"/>

					<!-- Hint -->
					<div class="hint">
						<?php esc_html_e('Example: 0.5 for 50%', 'wp-google-maps'); ?>
					</div>
				</div>
			</fieldset>
		</div>

		<!-- Hover shape state -->
		<div class="wpgmza-css-state-block-content" data-type="hover">
			<fieldset class="wpgmza-pro-feature wpgmza-row">
				<div class="wpgmza-col">
					<legend><?php _e("Enable Hover State", "wp-google-maps"); ?></legend>
				</div>
				<div class="wpgmza-col">
					<div class="switch">
						<input type='checkbox' id='cirlce_hover_state_enabled' data-ajax-name='hoverEnabled' class='cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
						<label for='cirlce_hover_state_enabled'  data-on='<?php esc_attr_e("Yes", "wp-google-maps"); ?>'  data-off='<?php esc_attr_e("No", "wp-google-maps"); ?>'></label>
					</div>
				</div>
			</fieldset>

			<fieldset class="wpgmza-pro-feature wpgmza-row">
				<!-- Hover Fill Color -->	
				<div class="wpgmza-col-4">
					<legend><?php esc_html_e("Fill Color", "wp-google-maps"); ?></legend>
					<input data-ajax-name="ohFillColor" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#808080"/>
				</div>

				<!-- Hover Opacity -->
				<div class="wpgmza-col-8">
					<legend><?php esc_html_e("Opacity", "wp-google-maps"); ?></legend>
					<input type="number" data-ajax-name="ohFillOpacity" min="0" max="1" step="0.1" value="0.5"/>

					<!-- Hint -->
					<div class="hint">
						<?php esc_html_e('Example: 0.5 for 50%', 'wp-google-maps'); ?>
					</div>
				</div>
			</fieldset>

			<fieldset class="wpgmza-pro-feature wpgmza-row">
				<!-- Hover Line Color -->	
				<div class="wpgmza-col-4">
					<legend><?php esc_html_e("Line Color", "wp-google-maps"); ?></legend>
					<input data-ajax-name="ohLineColor" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#000000"/>
				</div>

				<!-- Hover Line Opacity -->
				<div class="wpgmza-col-8">
					<legend><?php esc_html_e("Opacity", "wp-google-maps"); ?></legend>
					<input type="number" data-ajax-name="ohLineOpacity" min="0" max="1" step="0.1" value="0.0"/>

					<!-- Hint -->
					<div class="hint">
						<?php esc_html_e('Example: 0.5 for 50%', 'wp-google-maps'); ?>
					</div>
				</div>
			</fieldset>
		</div>
	</div>

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


	
	<!-- Buttons -->
	<fieldset class="wpgmza-save-feature-container">
		<button 
			type="button" 
			class="wpgmza-button wpgmza-button-accent wpgmza-save-feature"
			data-add-caption="<?php esc_attr_e('Add Circle', 'wp-google-maps'); ?>"
			data-edit-caption="<?php esc_attr_e('Save Circle', 'wp-google-maps'); ?>">
		</button>
	</fieldset>
</div>