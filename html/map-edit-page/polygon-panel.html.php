<div class="wpgmza-feature-panel">

	<div class="wpgmza-feature-drawing-instructions">
		<ul>
			<li>
				<?php
				_e('<strong>Click</strong> on the map to start drawing your polygon.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('Add at least <strong>three</strong> points', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Complete</strong> drawing your polygon by <strong>clicking</strong> the start point a second time.', 'wp-google-maps');
				?>
			</li>
		</ul>
	</div>
	
	<div class="wpgmza-feature-editing-instructions">
		<ul>
			<li>
				<?php
				_e('Use the fields below to edit this polygons information.', 'wp-google-maps');
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
	
	<fieldset class="wpgmza-pro-feature">
		<legend>
			<?php
			esc_html_e("Title", "wp-google-maps");
			?>
		</legend>
		<input type="text" data-ajax-name="title"/>
	</fieldset>
	
	<fieldset class="wpgmza-pro-feature">
		<legend>
			<?php
			esc_html_e("Description", "wp-google-maps");
			?>
		</legend>
		<textarea data-ajax-name="description"></textarea>
	</fieldset>
	
	<fieldset class="wpgmza-pro-feature">
		<legend>
			<?php
			esc_html_e("Link", "wp-google-maps");
			?>
		</legend>
		<input type="text" data-ajax-name="link"/>
	</fieldset>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Line Color", "wp-google-maps");
			?>
		</legend>
		<input type="color" value="#666666" data-ajax-name="linecolor"/>
	</fieldset>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Line Opacity", "wp-google-maps");
			?>
		</legend>
		<input type="number" data-ajax-name="lineopacity" min="0" max="1" step="0.1" value="0.5"/>
		<small>
			<?php
			esc_html_e('(0 - 1.0) example: 0.5 for 50%', 'wp-google-maps');
			?>
		</small>
	</fieldset>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Fill Color", "wp-google-maps");
			?>
		</legend>
		<input type="color" value="#cc0000" data-ajax-name="fillcolor"/>
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
	
	<fieldset class="wpgmza-pro-feature">
		<legend>
			<?php
			esc_html_e("On Hover Line Color", "wp-google-maps");
			?>
		</legend>
		<input type="color" value="#333333" data-ajax-name="ohlinecolor"/>
	</fieldset>
	
	<fieldset class="wpgmza-pro-feature">
		<legend>
			<?php
			esc_html_e("On Hover Fill Color", "wp-google-maps");
			?>
		</legend>
		<input type="color" value="#ff0000" data-ajax-name="ohfillcolor"/>
	</fieldset>
	
	<fieldset class="wpgmza-pro-feature">
		<legend>
			<?php
			esc_html_e("On Hover Opacity", "wp-google-maps");
			?>
		</legend>
		<input type="number" data-ajax-name="ohopacity" min="0" max="1" step="0.1" value="0.7"/>
		<small>
			<?php
			esc_html_e('(0 - 1.0) example: 0.5 for 50%', 'wp-google-maps');
			?>
		</small>
	</fieldset>
	
	<fieldset>
		<legend>
			<?php
			esc_html_e("Polygon data", "wp-google-maps");
			?>
		</legend>
		<textarea data-ajax-name="polydata"></textarea>
	</fieldset>
	
	<fieldset class="wpgmza-save-feature-container">
		<button 
			type="button" 
			class="button button-primary wpgmza-save-feature"
			data-add-caption="<?php esc_attr_e('Add Polygon', 'wp-google-maps'); ?>"
			data-edit-caption="<?php esc_attr_e('Save Polygon', 'wp-google-maps'); ?>">
		</button>
	</fieldset>
</div>