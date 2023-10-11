<div class="wpgmza-generic-modal wpgmza-bulk-marker-editor-modal" data-type="marker_editor">
	<div class="wpgmza-generic-modal-inner">
		<!-- Title -->
		<div class="wpgmza-generic-modal-title">
			<?php _e('Bulk Marker Editor', 'wp-google-maps'); ?>
		</div>

		<!-- Content -->
		<div class="wpgmza-generic-modal-content">
			<div class="wpgmza-upsell">
				<?php
					echo sprintf(
						__(
							'Bulk edit markers with the <a href="%s" target="_BLANK">Pro version</a>.',
							"wp-google-maps"
						),
						esc_attr("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&utm_medium=link&utm_campaign=bulkedit-atlas-novus" . wpgmzaGetUpsellLinkParams())
					);
				?>
			</div>

			<div class="wpgmza-row align-center wpgmza-pro-feature">
				<div class="wpgmza-col wpgmza-text-align-right wpgmza-pad-10">
					<label>
						<?php _e("Map", "wp-google-maps"); ?>
					</label>
				</div>
				<div class="wpgmza-col wpgmza-text-align-left wpgmza-pad-10">
					<select data-ajax-name="map_id"></select>
				</div>
			</div>

			<div class="wpgmza-row wpgmza-pro-feature">
				<div class="wpgmza-col wpgmza-text-align-right wpgmza-pad-10">
					<label>
						<?php _e("Category", "wp-google-maps"); ?>
					</label>
				</div>
				<div class="wpgmza-col wpgmza-text-align-left wpgmza-pad-10">
					<div class="bulk-category-selector"></div>
				</div>
			</div>

			<div class="wpgmza-row align-center wpgmza-pro-feature">
				<div class="wpgmza-col wpgmza-text-align-right wpgmza-pad-10">
					<label>
						<?php _e("Sticky", "wp-google-maps"); ?>
					</label>
				</div>
				<div class="wpgmza-col wpgmza-text-align-left wpgmza-pad-10">
					<input data-ajax-name="sticky" type="checkbox"/>
					<small>
						<?php
						esc_html_e('Always on top in Marker Listings', 'wp-google-maps');
						?>
					</small>
				</div>
			</div>

			<div class="wpgmza-row align-center wpgmza-pro-feature">
				<div class="wpgmza-col wpgmza-text-align-right wpgmza-pad-10">
					<label>
						<?php _e("Display on front end", "wp-google-maps"); ?>
					</label>
				</div>
				<div class="wpgmza-col wpgmza-text-align-left wpgmza-pad-10">
					<select data-ajax-name="approved">
						<option value="1">
							<?php esc_html_e('Yes', 'wp-google-maps'); ?>
						</option>
						<option value="0">
							<?php esc_html_e('No', 'wp-google-maps'); ?>
						</option>
					</select>
				</div>
			</div>

			<div class="wpgmza-row align-center wpgmza-pro-feature">
				<div class="wpgmza-col wpgmza-text-align-right wpgmza-pad-10">
					<label>
						<?php _e("Layer", "wp-google-maps"); ?>
					</label>
				</div>
				<div class="wpgmza-col wpgmza-text-align-left wpgmza-pad-10">
					<input data-ajax-name="layergroup" type="number" min="0" max="100" value="0" step="1" />
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="wpgmza-generic-modal-actions">
			<div class="wpgmza-row">
				<div class="wpgmza-col wpgmza-text-align-right">
					<div class="wpgmza-button" data-action="cancel">
						<span><?php _e("Cancel","wp-google-maps"); ?></span>
		        	</div>
		        </div>
				
				<div class="wpgmza-col wpgmza-text-align-left">
					<div class="wpgmza-button" data-action="complete">
						<span><?php _e("Save Changes","wp-google-maps"); ?></span>
		        	</div>
			    </div>
			</div>
		</div>
	</div>
</div>