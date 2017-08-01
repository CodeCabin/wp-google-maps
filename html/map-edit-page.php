<div id="wpgmza-map-edit-page">
	<form method="POST" class="wpgmza" style="display: none;">
		<button id="wpgmza-top-save" type="submit">
			<i class="fa fa-floppy-o" aria-hidden="true"></i>
			Save Map
		</button>

		<h1>
			<?php
			_e("WP Google Maps","wp-google-maps");
			?>
			<small class="wpgmza-pro-version-only">
				(<?php
				_e("including Pro add-on", "wp-google-maps");
				?>)
			</small>
		</h1>
		<!--<h2>
			<?php
			_e("Create your Map","wp-google-maps");
			?>
		</h2>-->
	
		<div class="wpgmza-preloader main-preloader">
			<div class="wpgmza-loader">Loading...</div>
		</div>
	
		<div smart:import-php="<?php
			echo WPGMZA_DIR . 'html/map-edit-page-map-panel.html';
		?>"></div>
	
		<p class="wpgmza-big-save">
			<button type="submit" class="button button-primary">Save Map</button>
		</p>
		
		<div smart:import-php="<?php
			echo WPGMZA_DIR . 'html/map-edit-page-pro-advert.php';
		?>"></div>
	</form>
	
	<div id="pro-upgrade" class="wpgmza-free-version-only">
		<div id="tabs-6" style="font-family:sans-serif;">
			<h1 style="font-weight:200;"><?php _e("12 Amazing Reasons to Upgrade to our Pro Version", "wp-google-maps"); ?></h1>
			<p style="font-size:16px; line-height:28px;"><?php _e("We've spent over two years upgrading our plugin to ensure that it is the most user-friendly and comprehensive map plugin in the WordPress directory. Enjoy the peace of mind knowing that you are getting a truly premium product for all your mapping requirements. Did we also mention that we have fantastic support?", "wp-google-maps"); ?></p>
			<div id="wpgm_premium">
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Create custom markers with detailed info windows", "wp-google-maps"); ?></h2>
						<p><?php _e("Add titles, descriptions, HTML, images, animations and custom icons to your markers.", "wp-google-maps"); ?></p>
					</div>
				</div>
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Enable directions", "wp-google-maps"); ?></h2>
						<p><?php _e("Allow your visitors to get directions to your markers. Either use their location as the starting point or allow them to type in an address.", "wp-google-maps"); ?></p>
					</div>
				</div>
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Unlimited maps", "wp-google-maps"); ?></h2>
						<p><?php _e("Create as many maps as you like.", "wp-google-maps"); ?></p>
					</div>
				</div>
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("List your markers", "wp-google-maps"); ?></h2>
						<p><?php _e("Choose between three methods of listing your markers.", "wp-google-maps"); ?></p>
					</div>
				</div>                                
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Add categories to your markers", "wp-google-maps"); ?></h2>
						<p><?php _e("Create and assign categories to your markers which can then be filtered on your map.", "wp-google-maps"); ?></p>
					</div>
				</div>                                
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Advanced options", "wp-google-maps"); ?></h2>
						<p><?php _e("Enable advanced options such as showing your visitor's location, marker sorting, bicycle layers, traffic layers and more!", "wp-google-maps"); ?></p>
					</div>
				</div>  
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Import / Export", "wp-google-maps"); ?></h2>
						<p><?php _e("Export your markers to a CSV file for quick and easy editing. Import large quantities of markers at once.", "wp-google-maps"); ?></p>
					</div>
				</div>                                
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Add KML &amp; Fusion Tables", "wp-google-maps"); ?></h2>
						<p><?php _e("Add your own KML layers or Fusion Table data to your map", "wp-google-maps"); ?></p>
					</div>
				</div>                                   
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Polygons and Polylines", "wp-google-maps"); ?></h2>
						<p><?php _e("Add custom polygons and polylines to your map by simply clicking on the map. Perfect for displaying routes and serviced areas.", "wp-google-maps"); ?></p>
					</div>
				</div>
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Amazing Support", "wp-google-maps"); ?></h2>
						<p>
							<?php
							_e('We pride ourselves on providing quick and amazing support.', "wp-google-maps");
							?>
							<a target="_BLANK" href="http://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5">
							
								<?php
								_e('Read what some of our users think of our support', "wp-google-maps");
								?>
							</a>
						</p>
					</div>
				</div>
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Easy Upgrade", "wp-google-maps"); ?></h2>
						<p><?php _e("You'll receive a download link immediately. Simply upload and activate the Pro plugin to your WordPress admin area and you're done!", "wp-google-maps"); ?></p>
					</div>
				</div>                                  
				<div class="wpgm_premium_row">
					<div class="wpgm_icon"></div>
					<div class="wpgm_details">
						<h2><?php _e("Free updates and support forever", "wp-google-maps"); ?></h2>
						<p><?php _e("Once you're a pro user, you'll receive free updates and support forever! You'll also receive amazing specials on any future plugins we release.", "wp-google-maps"); ?></p>
					</div>
				</div>              
				
				<br />
				
				<p><?php _e("Get all of this and more for only $39.99 once off", "wp-google-maps"); ?></p>                                
				<br />
				
				<a href="<?php
					echo WPGMZA\Plugin::getProLink(array(
						'utm_source'	=> 'plugin',
						'utm_medium'	=> 'link',
						'utm_campaign'	=> 'upgradenow'
					));
					?>"
					
					title="Upgrade now for only $39.99 once off"
					class="button-primary" 
					style="font-size:20px; display:block; width:220px; text-align:center; height:42px; line-height:41px;">
					<?php
					_e('Upgrade Now', "wp-google-maps");
					?>
				</a>
		
				<br />
				<br />
				
				<a href="https://www.wpgmaps.com/demo/" target="_BLANK">
					<?php
					_e('View the demos', "wp-google-maps");
					?>
				</a>
				
				<br />
				<br />
				
				<?php
				_e('Have a sales question? Contact either Nick or Jarryd on', "wp-google-maps");
				?>
				
				<a href="mailto:nick@wpgmaps.com">nick@wpgmaps.com</a> 
				
				<?php
				_e('or use our', "wp-google-maps");
				?>
				
				<a href="http://www.wpgmaps.com/contact-us/" target="_BLANK"><?php _e("contact form", "wp-google-maps"); ?></a>. 
				
				<br />
				<br />
				
				<?php
				_e('Need help?', "wp-google-maps");
				?>
				
				<a href="http://www.wpgmaps.com/forums/forum/support-forum/" target="_BLANK">
					<?php
					_e('Ask a question on our support forum', "wp-google-maps");
					?>
				</a>
			</div>
		</div>
	</div>
	
	<div id="wpgmza-big-polyline-dialog">
		<i class="fa fa-hand-paper-o" aria-hidden="true"></i>
		<p>
			<?php
			_e('This polyline has a very large number of points. The Google Maps engine may become unresponsive if you attempt to edit this polygon. We recommend using the OpenStreetMap engine under Maps -> Settings, which significantly outperforms Google Maps editing large polylines.', 'wp-google-maps');
			?>
		</p>
		<p>
			<button 
				class="button button-primary"
				onclick="window.open( jQuery('[href$=\'page=wp-google-maps-menu-settings\']').attr('href') )"
				type="button">
				<?php
				_e('Open Settings', 'wp-google-maps');
				?>
			</button>
			<button 
				class="button button-primary"
				onclick="jQuery('#wpgmza-big-polyline-dialog').remodal().close();"
				type="button">
				<?php
				_e('Cancel Editing', 'wp-google-maps');
				?>
			</button>
			<button 
				class="button button-primary"
				onclick="jQuery('#wpgmza-big-polyline-dialog').remodal().close(); WPGMZA.mapEditPage.editPolyline(WPGMZA.mapEditPage.warningPolyline);" 
				type="button">
				<?php
				_e('Ignore and Edit', 'wp-google-maps');
				?>
			</button>
		</p>
	</div>
	
	<?php
	_e("WP Google Maps encourages you to make use of the amazing icons created by Nicolas Mollet's Maps Icons Collection","wp-google-maps");
	?>
	<a href='http://mapicons.nicolasmollet.com'>http://mapicons.nicolasmollet.com/</a>
	<?php
	_e("and to credit him when doing so.","wp-google-maps");
	?>
</div>