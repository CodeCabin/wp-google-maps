<div class='error'><h1><?php _e('Important Notification', 'wp-google-maps'); ?></h1><p>
	<p>
		<strong>
			<?php _e('*ALL* Google Maps now require an API key to function.','wp-google-maps') ?>
		</strong>
		<a href='https://googlegeodevelopers.blogspot.co.za/2016/06/building-for-scale-updates-to-google.html' target='_BLANK'><?php _e('You can read more about that here.', 'wp-google-maps'); ?>
		</a>
	</p>

	<p>
		<?php _e("Before creating a map please follow these steps:","wp-google-maps"); ?>
	</p>
	<ol>
		<li>
		 <a target='_BLANK' href='https://console.developers.google.com/flows/enableapi?apiid=maps_backend,geocoding_backend,directions_backend,distance_matrix_backend,elevation_backend&amp;keyType=CLIENT_SIDE&amp;reusekey=true' class=''><?php _e("Create an API key now (free)","wp-google-maps"); ?></a>
		</li>
		<li>
			<form method='POST'>
				<?php _e('Paste your API key here and press save:','wp-google-maps'); ?>
				<input type='text' name='wpgmza_google_maps_api_key' style='width:350px;' placeholder='<?php _e("paste your Google Maps JavaScript API Key here","wp-google-maps"); ?>' /> 
				<button type='submit' class='button button-primary' name='wpgmza_save_google_api_key_list'><?php _e('Save', 'wp-google-maps'); ?></button>
			</form>
		</li>
	</ol>
	<p>
		<em>
			<?php _e("Please note that you are currently using a temporary API key which allows the maps in your back end to be displayed. For your map to be displayed on your website, you will need to follow the above steps.","wp-google-maps"); ?>
		</em>
	</p>
	<p>
		<?php 
		_e('Need help?', 'wp-google-maps');
		?>
		<a href='https://www.youtube.com/watch?v=OH98za14LNg' target='_BLANK'>
			<?php _e('View the instruction video', 'wp-google-maps'); ?>
		</a>
		<?php
		_e('or', 'wp-google-maps');
		?>
		<a href='https://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/' target='_BLANK'>
			<?php _e('Read the documentation', 'wp-google-maps'); ?>
		</a>
	</p>
</div>