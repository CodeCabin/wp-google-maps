<div class="wpgmza-feature-panel">

	<div class="wpgmza-feature-drawing-instructions">
		<ul>
			<li>
				<?php
				_e('<strong>Click</strong> on the map to start drawing your polyline.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('Add at least <strong>two</strong> points', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Complete</strong> drawing your polyline by <strong>clicking</strong> the end point a second time.', 'wp-google-maps');
				?>
			</li>
		</ul>
	</div>
	
	<div class="wpgmza-feature-editing-instructions">
		<ul>
			<li>
				<?php
				_e('Use the fields below to edit this polylines information.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Click and drag</strong> existing vertices to move them.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Click and drag</strong> any edge to add vertices.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Hold Alt</strong> and click to remove vertices.', 'wp-google-maps');
				?>
			</li>
		</ul>
	</div>

	<input data-ajax-name="id" type="hidden" value="-1"/>
	<input data-ajax-name="map_id" type="hidden" value="-1"/>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Name", "wp-google-maps");
			?>
		</legend>
		<input type="text" data-ajax-name="polyname"/>
	</fieldset>
	
	<!--<fieldset>
		<legend>
			<?php
			esc_html_e("Description", "wp-google-maps");
			?>
		</legend>
		<textarea data-ajax-name="description"></textarea>
	</fieldset> -->
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Line Color", "wp-google-maps");
			?>
		</legend>
		<input type="color" data-ajax-name="linecolor"/>
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
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Line Thickness", "wp-google-maps");
			?>
		</legend>
		<input type="number" data-ajax-name="linethickness" min="1" max="50" step="1" value="4"/>
	</fieldset>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Polyline data", "wp-google-maps");
			?>
		</legend>
		<textarea data-ajax-name="polydata"></textarea>
	</fieldset>
	
	<fieldset class="wpgmza-save-feature-container">
		<button 
			type="button" 
			class="button button-primary wpgmza-save-feature"
			data-add-caption="<?php esc_attr_e('Add Polyline', 'wp-google-maps'); ?>"
			data-edit-caption="<?php esc_attr_e('Save Polyline', 'wp-google-maps'); ?>">
		</button>
	</fieldset>
</div>