<div class="wpgmza-generic-modal wpgmza-map-select-modal" data-type="map_select">
	<div class="wpgmza-generic-modal-inner">
		<!-- Title -->
		<div class="wpgmza-generic-modal-title">
			<?php _e('Where would you like to move the marker?', 'wp-google-maps'); ?>
		</div>

		<!-- Content -->
		<div class="wpgmza-generic-modal-content">
			<select data-ajax-name="map_id"></select>
		</div>

		<!-- Actions -->
		<div class="wpgmza-generic-modal-actions">
			<div class="wpgmza-row">
				<div class="wpgmza-col">
					<div class="wpgmza-button" data-action="cancel">
						<span><?php _e("Cancel","wp-google-maps"); ?></span>
		        	</div>

					<div class="wpgmza-button" data-action="complete">
						<span><?php _e("Continue","wp-google-maps"); ?></span>
		        	</div>
			    </div>
			</div>
		</div>
	</div>
</div>