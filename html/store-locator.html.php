<div class="wpgmza-store-locator">
	<div class="wpgmza-address-container">
		<label
			class="wpgmza-address"
			data-name="addressLabel"></label>
		<input 
			class="wpgmza-address" 
			type="text" 
			placeholder="<?php esc_attr_e('Enter a location', 'wp-google-maps'); ?>"
			autocomplete="off"
			data-name="defaultAddress"
			/>
	</div>
	
	<div class="wpgmza-radius-container">
		<label class="wpgmza-radius">
			<?php _e('Radius:', 'wp-google-maps'); ?>
		</label>
		<select class="wpgmza-radius"></select>
	</div>
	
	<input 
		class="wpgmza-search" 
		value="<?php esc_attr_e('Search', 'wp-google-maps'); ?>" 
		type="button"/>
	
	<div class="wpgmza-no-results" style="display: none;">
		<p data-name="notFoundMessage"></p>
	</div>
</div>