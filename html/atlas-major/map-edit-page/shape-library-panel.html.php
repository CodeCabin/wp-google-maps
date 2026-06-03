<div class="shape-library-inner wpgmza-pro-feature">
    <!-- General instructions -->
	<div class="wpgmza-card wpgmza-shadow wpgmza-instruction-card wpgmza-pro-feature">
		<strong><?php _e("How to use the shape library", "wp-google-maps"); ?></strong>
		<ul>
			<li>
				<?php _e('<strong>Use the search tool</strong> to find shapes from the cloud.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Import shapes</strong> from the list of results.', 'wp-google-maps'); ?>
			</li>
			<li>
				<?php _e('<strong>Edit</strong> the shape details after importing.', 'wp-google-maps'); ?>
			</li>

            <li>
				<?php _e('All results are sourced from Nominatim.', 'wp-google-maps'); ?>
			</li>
		</ul>
	</div>

    <!-- Search -->
	<fieldset>
		<legend><?php esc_html_e("Search Term", "wp-google-maps"); ?></legend>
		<input type="text" placeholder="<?php esc_attr_e('Start typing...', 'wp-google-maps'); ?>"/>
	</fieldset>

	<!-- Hint -->
	<div class="hint">
		<?php _e("Tip: Try searching for countries, regions, states, counties or cities.", "wp-google-maps"); ?>
	</div>

    <div class="shape-library-busy wpgmza-hidden"></div>

    <div class="shape-library-no-results wpgmza-hidden">
        <strong><?php _e("No results found...", "wp-google-maps"); ?></strong>
		<span><?php _e("Please refine your search to try again", "wp-google-maps"); ?></span>
    </div>

    <div class="shape-library-list wpgmza-hidden">

    </div>
</div>