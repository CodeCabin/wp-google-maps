<div class="wpgmza-feature-panel">

	<div class="wpgmza-feature-drawing-instructions">
		<ul>
			<li>
				<?php
				_e('<strong>Click</strong> on the map to set your circles center.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Move</strong> the mouse to adjust your circles radius.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Click</strong> a second time to finish drawing your circle.', 'wp-google-maps');
				?>
			</li>
		</ul>
	</div>
	
	<div class="wpgmza-feature-editing-instructions">
		<ul>
			<li>
				<?php
				_e('Use the fields below to edit this circles information.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Click and drag</strong> the center of the circle to move it.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Click and drag</strong> the edge of the circle to alter it\'s radius.', 'wp-google-maps');
				?>
			</li>
		</ul>
	</div>

	<input data-ajax-name="id" type="hidden" value="-1"/>
	<input data-ajax-name="map_id" type="hidden" value="-1"/>
	
	<input data-ajax-name="center" type="hidden"/>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Name", "wp-google-maps");
			?>
		</legend>
		
		<input data-ajax-name="name" type="text"/>
	</fieldset>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Radius (km)", "wp-google-maps");
			?>
		</legend>
		
		<input data-ajax-name="radius" type="number" min="0" step="any" value="20"/>
	</fieldset>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Fill Color", "wp-google-maps");
			?>
		</legend>
		<input type="color" data-ajax-name="color"/>
	</fieldset>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Opacity", "wp-google-maps");
			?>
		</legend>
		<input type="number" data-ajax-name="opacity" min="0" max="1" step="0.1" value="0.5"/>
		<small>
			<?php
			esc_html_e('(0 - 1.0) example: 0.5 for 50%', 'wp-google-maps');
			?>
		</small>
	</fieldset>
	
	<fieldset class="wpgmza-save-feature-container">
		<button 
			type="button" 
			class="button button-primary wpgmza-save-feature"
			data-add-caption="<?php esc_attr_e('Add Circle', 'wp-google-maps'); ?>"
			data-edit-caption="<?php esc_attr_e('Save Circle', 'wp-google-maps'); ?>">
		</button>
	</fieldset>
</div>