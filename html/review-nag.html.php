<div id="wpgmza_review_nag">
	<?php
	echo sprintf( __( '<h3>We need your love!</h3><p>If you are enjoying our plugin, please consider <a href="%1$s" target="_blank" class="button button-primary">reviewing WP Google Maps</a>. It would mean the world to us! If you are experiencing issues with the plugin, please <a href="%2$s" target="_blank"  class="button button-secondary">contact us</a> and we will help you as soon as humanly possible!</p>', 'wp-google-maps' ),
		'https://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5',
		'http://www.wpgmaps.com/contact-us/'
	);
	?>
	
	<p>
		<a href='admin.php?page=wp-google-maps-menu&amp;action2=close_review' class='wpgmza_close_review_nag button button-secondary' title='<?php
		_e("We will not nag you again, promise!","wp-google-maps");?>'>			
			<?php _e("Close","wp-google-maps") ?>
		</a>
	</p>
</div>