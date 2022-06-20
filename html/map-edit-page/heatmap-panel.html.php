<div class="wpgmza-feature-panel">

	<div class="wpgmza-feature-drawing-instructions wpgmza-feature-editing-instructions wpgmza-pro-feature-hide">
		<ul>
			<li>
				<?php
				_e('<strong>Click</strong> on the map to add points to your heatmap.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Click</strong> an existing heatmap point to remove points from the heatmap.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Drag</strong> points on the heatmap to re-position them.', 'wp-google-maps');
				?>
			</li>
			<li>
				<?php
				_e('<strong>Hold right mouse</strong> to draw points freehand', 'wp-google-maps');
				?>
			</li>
		</ul>
	</div>

	<input data-ajax-name="id" type="hidden" value="-1"/>
	<input data-ajax-name="map_id" type="hidden" value="-1"/>
	
	<fieldset class="wpgmza-pro-feature">
		<legend>
			<?php
			esc_html_e("Name", "wp-google-maps");
			?>
		</legend>
		<input type="text" data-ajax-name="dataset_name"/>
	</fieldset>
	
	<fieldset class="wpgmza-pro-feature">
		<legend>
			<?php
			esc_html_e("Gradient", "wp-google-maps");
			?>
		</legend>
		
		<label>
			<input name="gradient" type="radio" data-ajax-name="gradient" value='["rgba(0, 0, 255, 0)", "rgba(0, 255, 255, 1)", "rgba(0, 255, 0, 1)", "rgba(255, 255, 0, 1)", "rgba(255, 0, 0, 1)"]' checked="checked"/>
			<?php
			esc_html_e("Default", "wp-google-maps");
			?>
		</label>
		
		<label>
			<input name="gradient" type="radio" data-ajax-name="gradient" value='["rgba(0, 255, 255, 0)","rgba(0, 255, 255, 1)","rgba(0, 191, 255, 1)","rgba(0, 127, 255, 1)","rgba(0, 63, 255, 1)","rgba(0, 0, 255, 1)","rgba(0, 0, 223, 1)","rgba(0, 0, 191, 1)","rgba(0, 0, 159, 1)","rgba(0, 0, 127, 1)","rgba(63, 0, 91, 1)","rgba(127, 0, 63, 1)","rgba(191, 0, 31, 1)","rgba(255, 0, 0, 1)"]'/>
			<?php
			esc_html_e("Blue", "wp-google-maps");
			?>
		</label>
		
	</fieldset>
	
	<fieldset class="wpgmza-pro-feature">
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
			esc_html_e("Radius", "wp-google-maps");
			?>
		</legend>
		<input type="number" data-ajax-name="radius" min="1" step="1" value="20"/>
	</fieldset>
	
	<input data-ajax-name="dataset" type="hidden"/>
	
	<fieldset class="wpgmza-save-feature-container wpgmza-pro-feature-hide">
		<button 
			type="button" 
			class="button button-primary wpgmza-save-feature"
			data-add-caption="<?php esc_attr_e('Add Heatmap', 'wp-google-maps'); ?>"
			data-edit-caption="<?php esc_attr_e('Save Heatmap', 'wp-google-maps'); ?>">
		</button>
	</fieldset>

	<div class="update-nag update-att wpgmza-upsell">
                                
		<i class="fa fa-arrow-circle-right"></i>
		<?php
			echo sprintf(
				__(
					'Add dynamic heatmap data with the <a href="%s" target="_BLANK">Pro version</a>. <a href="%s" target="_BLANK">View a demo</a>',
					"wp-google-maps"
				),
				esc_attr("https://www.wpgmaps.com/demo/heatmaps-demo/?utm_source=plugin&utm_medium=link&utm_campaign=heatmap"),
				esc_attr("https://www.wpgmaps.com/demo/heatmaps-demo/?utm_source=plugin&utm_medium=link&utm_campaign=heatmap_demo")
			);
		?>
	</div>
</div>