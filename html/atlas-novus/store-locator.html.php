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

	<svg width="40" height="40" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg" class="wpgmza-search" title="<?php esc_attr_e('Search', 'wp-google-maps'); ?>">
		<line x1="40.5183" y1="40.5685" x2="53.5685" y2="53.6188" stroke-width="7" stroke-linecap="round"/>
		<circle cx="24.5" cy="24.5" r="21" stroke-width="7"/>
	</svg>

	<svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="wpgmza-loading">
		<mask id="path-1-inside-1">
			<path d="M60 30C60 24.1471 58.2879 18.422 55.0747 13.53C51.8614 8.63797 47.2873 4.79275 41.9159 2.46799C36.5445 0.143228 30.6103 -0.55952 24.8445 0.446314C19.0786 1.45215 13.7329 4.12263 9.46589 8.12878L13.8401 12.7879C17.1982 9.6351 21.4051 7.53349 25.9427 6.74192C30.4803 5.95035 35.1503 6.5034 39.3775 8.33293C43.6047 10.1625 47.2044 13.1886 49.7332 17.0385C52.2619 20.8884 53.6093 25.3939 53.6093 30H60Z"/>
		</mask>
		<path d="M60 30C60 24.1471 58.2879 18.422 55.0747 13.53C51.8614 8.63797 47.2873 4.79275 41.9159 2.46799C36.5445 0.143228 30.6103 -0.55952 24.8445 0.446314C19.0786 1.45215 13.7329 4.12263 9.46589 8.12878L13.8401 12.7879C17.1982 9.6351 21.4051 7.53349 25.9427 6.74192C30.4803 5.95035 35.1503 6.5034 39.3775 8.33293C43.6047 10.1625 47.2044 13.1886 49.7332 17.0385C52.2619 20.8884 53.6093 25.3939 53.6093 30H60Z" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" mask="url(#path-1-inside-1)"/>
	</svg>


	<svg width="40" height="40" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg" class="wpgmza-reset">
		<line x1="4.94975" y1="5" x2="56.5685" y2="56.6188" stroke-width="7" stroke-linecap="round"/>
		<line x1="5" y1="56.6188" x2="56.6188" y2="5" stroke-width="7" stroke-linecap="round"/>
	</svg>


	
	<div class="wpgmza-error"></div>
</div>