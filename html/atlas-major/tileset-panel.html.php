<div id="wpgmza-tileset-panel">
	<div class="tileset-selection-panel">
		<label class="wpgmza-check-card-selector tileset-option tileset-default">
            <input type='radio' name='tile_server_override' value='' />
			<span><?php _e('Global Default', 'wp-google-maps'); ?></span>
            <small><?php _e("Maps > Settings > Advanced", 'wp-google-maps'); ?></small>

			<button type="button" class="wpgmza-button">
				<?php
				_e('Select Tileset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
	</div>

    <div class="wpgmza-margin-t-10">
        <?php _e("Please note: You must save your map to update the tileserver", 'wp-google-maps'); ?>
	</div>
</div>