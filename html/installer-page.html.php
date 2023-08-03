<?php
	$currentUser = wp_get_current_user();
?>

<div class="wrap wpgmza-installer">
	<div class="wpgmza-installer-steps" data-ajax-nonce="<?php echo wp_create_nonce('wpgmza_installer_page'); ?>">
		<div class="step wpgmza-card" data-step="0">
			<h1><?php _e("Welcome", "wp-google-maps"); ?>, <?php echo ucfirst($currentUser->display_name); ?></h2>
			<h2><?php _e("What map engine would you like to use?", "wp-google-maps"); ?></h2>

			<br>
			<a href="#" class='wpgmza-installer-skip' title="<?php _e("We'll remind you in a day or two to finish up", "wp-google-maps"); ?>">
				<?php _e("Not ready? Skip for now!", "wp-google-maps"); ?>
			</a>

			<br><br>

			<div class="wpgmza-flex">
				<div class="col wpgmza-flex-grid__item">
					<input type="radio" name="wpgmza_maps_engine" value="google-maps" id='engine_select_google' class="wpgmza-hidden" />
					<label class="wpgmza-col wpgmza-installer-engine-select" for='engine_select_google'>
						<img class="installer-engine-tile" src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/Google_maps_logo.png" />
					</label>
				</div>
				
				<div class="col wpgmza-flex-grid__item">
					<input type="radio" name="wpgmza_maps_engine" value="open-layers" id='engine_select_open_layers' class="wpgmza-hidden" />
					<label class="wpgmza-col wpgmza-installer-engine-select" for='engine_select_open_layers'>
						<img class="installer-engine-tile" src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/openlayers_logo.png" />
					</label>
				</div>
			</div>

			<br><br>

			<h3>
				<?php _e("Selected Engine Features", "wp-google-maps"); ?>
			</h3>

			<!-- Google Features -->
			<div class="engine-step" data-engine="google-maps">
				<div class="wpgmza-flex wpgmza-installer-feature-reel">
					<div class="wpgmza-installer-feature-item wpgmza-card col">
						<i class="fas fa-lock"></i>
						<span>
							<?php _e("Requires an API key", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item  wpgmza-card col">
						<i class="fas fa-search-plus"></i>
						<span>
							<?php _e("Address suggestions", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item  wpgmza-card col">
						<i class="fas fa-stopwatch"></i>
						<span>
							<?php _e("Improved performance", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item wpgmza-card col">
						<i class="fas fa-paint-roller"></i>
						<span>
							<?php _e("Improved customization", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item wpgmza-card col">
						<i class="fas fa-draw-polygon"></i>
						<span>
							<?php _e("Improved drawing", "wp-google-maps"); ?>
						</span>
					</div>

				</div>

				<br><br>

				<div>
					<em><strong><?php _e("Recommended", "wp-google-maps"); ?></strong> - <?php _e("Creating a Google Maps API key takes only a few minutes with WP Go Maps!", "wp-google-maps"); ?></em>
				</div>
			</div>

			<!-- OpenLayers Features -->
			<div class="engine-step" data-engine="open-layers">
				<div class="wpgmza-flex wpgmza-installer-feature-reel">
					<div class="wpgmza-installer-feature-item wpgmza-card col">
						<i class="fas fa-unlock"></i>
						<span>
							<?php _e("No API keys required", "wp-google-maps"); ?> *
						</span>
					</div>

					<div class="wpgmza-installer-feature-item wpgmza-card col">
						<i class="fas fa-layer-group"></i>
						<span>
							<?php _e("Custom Map Tiles", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item wpgmza-card col">
						<i class="fas fa-brush"></i>
						<span>
							<?php _e("Limited customization", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item wpgmza-card col">
						<i class="fas fa-ghost"></i>
						<span>
							<?php _e("Limited features", "wp-google-maps"); ?>
						</span>
					</div>

				</div>

				<br><br>

				<div>
					<em><?php _e("Directions services and some map tile servers require a free API key, which will need to be created independently", "wp-google-maps"); ?></em>
				</div>
			</div>
			
		</div>

		<div class="step wpgmza-card" data-step="1" data-conditional="engine-set-up">
			<!-- Google Maps Setup -->
			<div class="engine-step" data-engine="google-maps">
				<h1><?php _e("Google Maps", "wp-google-maps"); ?></h1>
				<h2><?php _e("Let's get your API key set up!", "wp-google-maps"); ?></h2>

				<br>
				<div class="wpgmza-row">
					<div class="wpgmza-col">
						<h3><?php _e("Get your key from the Google Maps Platform", "wp-google-maps"); ?></h3>
	
						<div class="button button-secondary launcher-trigger" data-launcher="google-maps-quick-start-launcher" title="Powered by Google Maps Platform" style="height: 40px;line-height: 40px;">
							<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/gm-platform-icon.png" style="max-width: 30px; vertical-align: middle;" /><?php _e("Get an API Key","wp-google-maps"); ?>
						</div>

						<br><br>
						<h3><?php _e("Once ready, add your key below", "wp-google-maps"); ?></h3>

						<input type="text" class="wpgmza-text-align-center" name="api_key">

						<br><br>
						<h3><?php _e("How does this work?", "wp-google-maps"); ?></h3>

						<p>
							<?php _e("The entire process is managed by Google and takes only a few minutes.", "wp-google-maps"); ?> 
							<?php _e("If preferred, you can create an API key from the <a href='https://wpgmaps.com/google-maps-developer-console/' target='_BLANK'>Google Developers Console</a>.", "wp-google-maps"); ?>
						</p>

						<p><?php _e("Please review our <a href='https://docs.wpgmaps.com/creating-a-google-maps-api-key' target='_BLANK'>documentation</a> for a comprehensive guide on API key management.", "wp-google-maps"); ?></p>
						
						
					</div>
				</div>				

			</div>

			<!-- OpenLayers Setup -->
			<div class="engine-step" data-engine="open-layers">
				<h1><?php _e("OpenLayers", "wp-google-maps"); ?></h1>
				<h2><?php _e("What tile server would you like to use?", "wp-google-maps"); ?></h2>

				<br><br>

				<div class="wpgmza-row align-center">
					<div class="wpgmza-col">
						<img class='open_layers_sample_tile wpgmza-card wpgmza-pad-0 wpgmza-shadow' src="https://a.tile.openstreetmap.org/7/20/49.png">				
					</div>

					<div class="wpgmza-col wpgmza-text-align-left">
						<select name="tile_server_url" style="width: 256px;">
							<option 
								value="https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
								data-usage-policy="https://wiki.openstreetmap.org/wiki/Tile_usage_policy">
								<?php
								_e('OpenStreetMap', 'wp-google-maps');
								?>
							</option>

							<option
								value="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"
								data-usage-policy="https://foundation.wikimedia.org/wiki/Maps_Terms_of_Use"
								data-preview-image="https://wiki.openstreetmap.org/w/images/0/02/Wikimedia-tile.png">
								<?php
								_e('Wikimedia Maps', 'wp-google-maps');
								?>
							</option>
							
							<option value="https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
								data-preview-image="https://wiki.openstreetmap.org/w/images/6/63/Humanitarian_style.png">
								<?php
								_e('Humanitarian', 'wp-google-maps');
								?>
							</option>

							<option value="https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png"
								data-preview-image="https://tile.memomaps.de/tilegen/12/2200/1343.png">
								<?php
								_e('Öpnvkarte', 'wp-google-maps');
								?>
							</option>
						</select>
					</div>
				</div>

				<br><br>
				<br><br>

				<em><?php _e("There are more tile servers available within the settings area of the plugin, but they may require additional set up.", "wp-google-maps"); ?></em>
			</div>
			
		</div>


		<div class="step wpgmza-card" data-step="2">
			<h1><?php _e("Great work, we're all set!", "wp-google-maps"); ?></h1>
			<h2><?php _e("We have everything we need to finish your installation", "wp-google-maps"); ?></h2>
			<h3><?php _e("When ready, finish the installation to get started!", "wp-google-maps"); ?></h3>
		</div>

		<div class="step-loader wpgmza-pos-relative wpgmza-hidden wpgmza-card">
			<div class="wpgmza-preloader">
				<div></div>
				<div></div>
			</div>

			<h3 class="progress-busy wpgmza-hidden"><?php _e("Getting things ready...", "wp-google-maps"); ?></h3>
			<h3 class="progress-finish wpgmza-hidden"><?php _e("Finishing up...", "wp-google-maps"); ?></h3>
		</div>

		<div class="wpgmza-flex step-controller">
			<div class="col">
				<div class="wpgmza-text-align-left">
					<div class="wpgmza-button button-secondary prev-step-button">
		        		<i class="fa fa-chevron-left" aria-hidden="true" style="margin-left: 0; margin-right: 10px;"></i>
						<span><?php _e("Back","wp-google-maps"); ?></span>
		        	</div>
		        </div>
			</div>
			
			<div class="col">
				<div class="wpgmza-text-align-right">
					<div class="wpgmza-button button-secondary next-step-button" data-next="<?php _e("Continue","wp-google-maps"); ?>" data-final="<?php _e("Finish install","wp-google-maps"); ?>">
						<span><?php _e("Continue","wp-google-maps"); ?></span>
		        		<i class="fa fa-chevron-right" aria-hidden="true"></i>
		        	</div>
		        </div>
		    </div>
		</div>

		<div class="wpgmza-row">
			<div class="wpgmza-col">
				<a href="#" class='wpgmza-installer-skip' title="<?php _e("We'll remind you in a day or two to finish up", "wp-google-maps"); ?>">
					<?php _e("Skip installation, and finish up later?", "wp-google-maps"); ?>
				</a>
			</div>
		</div>
		
	</div>
</div>
