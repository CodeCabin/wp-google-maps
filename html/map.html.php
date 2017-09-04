<div class="wpgmza-map">

	<div class="error is-hidden" id="wpgmza-jquery-error" data-wpgmza-wp-action-before="wpgmza_map_jquery_error_before" data-wpgmza-wp-action-after="wpgmza_map_jquery_error_after" data-wpgmza-wp-filter="wpgmza_map_jquery_error_filter">
		<?php
		_e('Error: Your version of jQuery is outdated. WP Google Maps requires jQuery version 1.7+ to function correctly. Go to Maps->Settings and check the box that allows you to over-ride your current jQuery to try eliminate this problem.', 'wp-google-maps');
		?>
	</div>

	<div class="wpgmza-load-failed update-nag is-hidden" style="text-align:center;" data-wpgmza-wp-action-before="wpgmza_map_map_load_error_before" data-wpgmza-wp-action-after="wpgmza_map_map_load_error_after" data-wpgmza-wp-filter="wpgmza_map_map_load_error_filter">
		<small>
			<strong>
				<?php _e("The map could not load.","wp-google-maps"); ?>
			</strong>
			<br/>
			<?php 
			_e("This is normally caused by a conflict with another plugin or a JavaScript error that is preventing our plugin's Javascript from executing. Please try disable all plugins one by one and see if this problem persists.","wp-google-maps");
			?>
		</small>
	</div>
	
	<div class="wpgmza-engine-map" data-wpgmza-layout-element="map">
	</div>
	
	<div class="wpgmza-in-map-grid">
		<div class="wpgmza-row">
			<div class="wpgmza-cell" data-grid-position="top-left"></div>
			<div class="wpgmza-cell" data-grid-position="top-center"></div>
			<div class="wpgmza-cell" data-grid-position="top-right"></div>
		</div>
		<div class="wpgmza-row">
			<div class="wpgmza-cell" data-grid-position="center-left"></div>
			<div class="wpgmza-cell" data-grid-position="center"></div>
			<div class="wpgmza-cell" data-grid-position="center-right"></div>
		</div>
		<div class="wpgmza-row">
			<div class="wpgmza-cell" data-grid-position="bottom-left"></div>
			<div class="wpgmza-cell" data-grid-position="bottom-center"></div>
			<div class="wpgmza-cell" data-grid-position="bottom-right"></div>
		</div>
	</div>
	
	<div class="wpgmza-loader map-loading"/>
	
</div>