<?php
if(!defined('ABSPATH'))
	return;

?>
<div>

	
	<div class="error-overlay-inner">
		<h2><?php _e('Maps API Error', 'wp-google-maps'); ?></h2>
		<p>
			<?php _e('One or more error(s) have occured attempting to initialize the Maps API:', 'wp-google-maps'); ?>
		</p>
	
		<ul class="wpgmza-google-api-error-list">
			<li class="template notice notice-error">
				<span class="wpgmza-message"></span>
				<span class="wpgmza-documentation-buttons">
					<a target="_blank">
						<i class="fa" aria-hidden="true"></i>
					</a>
				</span>
			</li>
		</ul>
	
	</div>

	<p class="wpgmza-front-end-only">
		<i class="fa fa-eye" aria-hidden="true"></i>
		<?php
		_e('This dialog is only visible to administrators', 'wp-google-maps');
		?>
	</p>

</div>