<?php

if(!defined('ABSPATH'))
	return;

?><div>

	<h2><?php _e('Maps API Error', 'wp-google-maps'); ?></h2>
	
	<div>
	
		<p>
			<?php
			_e('One or more error(s) have occured attempting to initialize the Maps API:', 'wp-google-maps');
			?>
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
	<?php /*
	<p>
		<?php
		_e('See our documentation for solutions to common Google API issues:', 'wp-google-maps');
		?>
	</p>
	
	<ul>
		<li>
			<a href="https://www.wpgmaps.com/documentation/you-have-exceeded-your-request-quota-for-this-api/">
				<?php
				_e('“You have exceeded your request quota for this API”', 'wp-google-maps');
				?>
			</a>
		</li>
		<li>
			<a href="https://www.wpgmaps.com/documentation/troubleshooting/this-page-cant-load-google-maps-correctly/">
				<?php
				_e('“This page can’t load Google Maps correctly”', 'wp-google-maps');
				?>
			</a>
		</li>
		<li>
			<a href="https://www.wpgmaps.com/documentation/troubleshooting/this-api-project-is-not-authorized-to-use-this-api/">
				<?php
				_e('“This API project is not authorized to use this API”', 'wp-google-maps');
				?>
			</a>
		</li>
		<li>
			<a href="https://www.wpgmaps.com/documentation/troubleshooting/api-not-activated-map-error/">
				<?php
				_e('“API Not Activated Map Error”', 'wp-google-maps');
				?>
			</a>
		</li>
	</ul>
	
	<p>
		<?php
		_e('Please see the <a href="https://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/">WP Google Maps Documentation</a> for a step by step guide on setting up your Google Maps API key.', 'wp-google-maps');
		?>
	</p>
	*/ ?>
	<?php /*
	<p>
		<?php
		_e('Please open your Developer Tools (F12 for most browsers) and see your JavaScript console for the full error message.', 'wp-google-maps');
		?>
	</p>
	*/ ?>
	<p class="wpgmza-front-end-only">
		<i class="fa fa-eye" aria-hidden="true"></i>
		<?php
		_e('This dialog is only visible to administrators', 'wp-google-maps');
		?>
	</p>
	
	<!--<button data-remodal-action="confirm" class="remodal-confirm">
		<?php
		_e('Dismiss', 'wp-google-maps');
		?>
	</button>-->

</div>