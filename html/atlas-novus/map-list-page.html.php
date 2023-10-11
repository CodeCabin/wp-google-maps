<div id='WPGMMapList' class="wpgmza-wrap">
	<div style='padding:10px; display:block; overflow:auto'>

		<div class="wpgmza-row wpgmza-page-actions">
			<div class="wpgmza-inline-field">
				<h1>
					<?php
					esc_html_e("Maps", "wp-google-maps");
					?>
				</h1>
			</div>

			<div class="wpgmza-action-buttons wpgmza-toolbar wpgmza-pro-feature wpgmza-pro-feature-hide">
				<input type="checkbox" id="wpgmza-toolbar-conditional-map-list">
				<label class="wpgmza-button wpgmza-button-white" for="wpgmza-toolbar-conditional-map-list"><i class="fa fa-plus"></i></label>
				<div class="wpgmza-toolbar-list left-anchor">
					<div class="wpgmza-pro-new" data-action="new-map">
						<?php _e("New Map", "wp-google-maps"); ?>
					</div>
			
					<div class="wpgmza-pro-wizard" data-action="wizard">
						<?php _e("Map Wizard", "wp-google-maps"); ?>
					</div>
				</div>
			</div>
		</div>

		<div class="wpgmza-persistent-notice-container"></div>
		
		<div class='wpgmza-review-nag wpgmza-notice wpgmza-card wpgmza-shadow-high'>
			<?php
			echo sprintf( __( '<h3>We need your love!</h3><p>If you are enjoying our plugin, please consider <a href="%1$s" target="_blank" class="button-border button-border__green">reviewing WP Go Maps</a>. It would mean the world to us! If you are experiencing issues with the plugin, please <a href="%2$s" target="_blank"  class="button-border button-border__green">contact us</a> and we will help you as soon as humanly possible!</p>', 'wp-google-maps' ),
				'https://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5',
				'http://www.wpgmaps.com/contact-us/'
			);
			?>
			
			<p>
				<a href='admin.php?page=wp-google-maps-menu&amp;wpgmza-close-review-nag' class='wpgmza_close_review_nag wpgmza-button' title="<?php esc_html_e("We will not nag you again, promise!","wp-google-maps"); ?>">
					<?php
					esc_html_e("No thanks!","wp-google-maps");
					?>
				</a>
			</p>
		</div>
		
		<p class='wpgmza_upgrade_nag'>
			<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mappage_1-atlas-novus<?php echo wpgmzaGetUpsellLinkParams() ?>" 	
				target="_BLANK" 
				title="<?php esc_html_e("Pro Version", "wp-google-maps"); ?>">
				<?php
				esc_html_e("Create unlimited maps", "wp-google-maps"); 
				?></a>
			
			<?php
			esc_html_e("with the", "wp-google-maps");
			?>
			
			<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mappage_2-atlas-novus<?php echo wpgmzaGetUpsellLinkParams() ?>"
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
		
		<div id="wpgmza-admin-map-table-container" class="wpgmza-card wpgmza-shadow-high wpgmza-datatable-container wpgmza-pad-y-20"></div>
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