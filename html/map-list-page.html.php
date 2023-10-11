<div id='WPGMMapList'>
	<div style='padding:10px; display:block; overflow:auto'>

		<div style="float: right;">
		
			<button type="button"
				class="button button-primary wpgmza-pro-new wpgmza-pro-feature wpgmza-pro-feature-hide" 
				data-action="new-map">
				<?php 
				_e("Add New", "wp-google-maps");
				?>
			</button>
			
			<button type="button"
				class="button button-primary wpgmza-pro-wizard wpgmza-pro-feature wpgmza-pro-feature-hide"
				data-action="wizard">
				<?php
				_e("Wizard", "wp-google-maps");
				?>
			</button>
			
		</div>

		<h1>
			<?php
			esc_html_e("My Maps", "wp-google-maps");
			?>
		</h1>

		<div class="wpgmza-persistent-notice-container"></div>
		
		<div class='wpgmza-review-nag'>
			<?php
			echo sprintf( __( '<h3>We need your love!</h3><p>If you are enjoying our plugin, please consider <a href="%1$s" target="_blank" class="button-border button-border__green">reviewing WP Go Maps</a>. It would mean the world to us! If you are experiencing issues with the plugin, please <a href="%2$s" target="_blank"  class="button-border button-border__green">contact us</a> and we will help you as soon as humanly possible!</p>', 'wp-google-maps' ),
				esc_url('https://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5'),
				esc_url('http://www.wpgmaps.com/contact-us/')
			);
			?>
			
			<p>
				<a href='admin.php?page=wp-google-maps-menu&amp;wpgmza-close-review-nag' class='wpgmza_close_review_nag button-border button-border__green' title="<?php esc_html_e("We will not nag you again, promise!","wp-google-maps"); ?>">
					<?php
					esc_html_e("Close","wp-google-maps");
					?>
				</a>
			</p>
		</div>
		
		<p class='wpgmza_upgrade_nag'>
			<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mappage_1<?php echo wpgmzaGetUpsellLinkParams(); ?>" 	
				target="_BLANK" 
				title="<?php esc_html_e("Pro Version", "wp-google-maps"); ?>">
				<?php
				esc_html_e("Create unlimited maps", "wp-google-maps"); 
				?></a>
			
			<?php
			esc_html_e("with the", "wp-google-maps");
			?>
			
			<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mappage_2<?php echo wpgmzaGetUpsellLinkParams(); ?>"
				title="Pro Version"
				target="_BLANK">
				<?php
				esc_html_e("Pro Version", "wp-google-maps");
				?></a>
				
			<?php
			esc_html_e("of WP Go Maps for only", "wp-google-maps");
			?>
			
			<strong>$39.99 <?php esc_html_e("once off!","wp-google-maps"); ?></strong>
		</p>
		
		<div id="wpgmza-admin-map-table-container"></div>
	</div>
</div>

<?php /*

Will seek approval from WP.org first before implementing this.

<div id='WPGMFeeds'>
	<div id='WPGMLatestNews'>
		<div id='WPGMLatestNewsInner'>
			
			<div style='background-color:#fff; padding:10px;'>
				<h4><?php _e("Latest News", "wp-google-maps"); ?></h4>
				<?php
					WPGMZA\Plugin::output_rss_feed(array('http://wpgmaps.com/public-feeds/latest-news'), 5, true, true, 100);
				?>
			</div>


		</div>

	</div>
	<div id='WPGMFeatureRequests'>
		<div id='WPGMFeatureRequestsInner'>
			
			<div style='background-color:#fff; padding:10px;'>
				<h4><?php _e("Latest Feature Requests", "wp-google-maps"); ?></h4>
				<?php
					WPGMZA\Plugin::output_rss_feed(array('http://wpgmaps.com/public-feeds/latest-feature-requests'), 5, true, true, 100);
				?>
				<p><a href='https://www.wpgmaps.com/forums/forum/suggestions/' class='button button-primary' target='_BLANK'>Submit a request</a></p>
			</div>
			

		</div>

	</div>
	<div id='WPGMLatestTopics'>
		<div id='WPGMLatestTopicsInner'>
			
			<div style='background-color:#fff; padding:10px;'>
				<h4><?php _e("Latest Forum Topics", "wp-google-maps"); ?></h4>
				<?php
					WPGMZA\Plugin::output_rss_feed(array('http://wpgmaps.com/public-feeds/latest-forum-topics'), 5, true, true, 100);
				?>
				<p><a href='https://www.wpgmaps.com/forums/' class='button button-primary' target='_BLANK'>Create a ticket</a></p>
			</div>

		</div>

	</div>
</div> */
