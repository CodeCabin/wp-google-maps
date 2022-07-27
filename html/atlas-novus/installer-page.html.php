<?php
	$currentUser = wp_get_current_user();
?>

<div class="wrap wpgmza-wrap wpgmza-writeup-block wpgmza-shadow-high wpgmza-installer">
	<div class="wpgmza-installer-steps" data-ajax-nonce="<?php echo wp_create_nonce('wpgmza_installer_page'); ?>">
		<div class="step" data-step="0">
			<h1><?php _e("Welcome", "wp-google-maps"); ?>, <?php echo ucfirst($currentUser->display_name); ?></h2>
			<h2><?php _e("What map engine would you like to use?", "wp-google-maps"); ?></h2>

			<br>
			<a href="#" class='wpgmza-installer-skip wpgmza-button' title="<?php _e("We'll remind you in a day or two to finish up", "wp-google-maps"); ?>">
				<?php _e("Not ready? Skip for now!", "wp-google-maps"); ?>
			</a>

			<hr>

			<div class="wpgmza-row">
				<input type="radio" name="wpgmza_maps_engine" value="google-maps" id='engine_select_google' class="wpgmza-hidden" />
				<label class="wpgmza-col wpgmza-installer-engine-select" for='engine_select_google'>
					<img class="installer-engine-tile" src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/Google_maps_logo.png" />
				</label>
				
				<input type="radio" name="wpgmza_maps_engine" value="open-layers" id='engine_select_open_layers' class="wpgmza-hidden" />
				<label class="wpgmza-col wpgmza-installer-engine-select" for='engine_select_open_layers'>
					<img class="installer-engine-tile" src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/openlayers_logo.png" />
				</label>
			</div>

			<hr>

			<h3>
				<?php _e("Selected Engine Features", "wp-google-maps"); ?>
			</h3>

			<!-- Google Features -->
			<div class="engine-step" data-engine="google-maps">
				<div class="wpgmza-flex-grid center">
					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-lock"></i>
						<span>
							<?php _e("Requires an API key", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-search-plus"></i>
						<span>
							<?php _e("Address suggestions", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-stopwatch"></i>
						<span>
							<?php _e("Improved performance", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-paint-roller"></i>
						<span>
							<?php _e("Improved customization", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-draw-polygon"></i>
						<span>
							<?php _e("Improved drawing", "wp-google-maps"); ?>
						</span>
					</div>

				</div>

				<div class="wpgmza-margin-t-20">
					<em><strong><?php _e("Recommended", "wp-google-maps"); ?></strong> - <?php _e("Creating a Google Maps API key takes only a few minutes with WP Go Maps!", "wp-google-maps"); ?></em>
				</div>
			</div>

			<!-- OpenLayers Features -->
			<div class="engine-step" data-engine="open-layers">
				<div class="wpgmza-flex-grid center">
					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-unlock"></i>
						<span>
							<?php _e("No API keys required", "wp-google-maps"); ?> *
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-layer-group"></i>
						<span>
							<?php _e("Custom Map Tiles", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-brush"></i>
						<span>
							<?php _e("Limited customization", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-ghost"></i>
						<span>
							<?php _e("Limited features", "wp-google-maps"); ?>
						</span>
					</div>

				</div>

				<div class="wpgmza-margin-t-20">
					<em><?php _e("Directions services and some map tile servers require a free API key, which will need to be created independently", "wp-google-maps"); ?></em>
				</div>
			</div>
			
		</div>

		<div class="step" data-step="1" data-conditional="engine-set-up">
			<!-- Google Maps Setup -->
			<div class="engine-step" data-engine="google-maps">
				<h1><?php _e("Google Maps", "wp-google-maps"); ?></h1>
				<h2><?php _e("Let's get your API key set up!", "wp-google-maps"); ?></h2>
				<hr>

				<div class="wpgmza-row">
					<div class="wpgmza-col">
						<h3><?php _e("Get your key from the Google Maps Platform", "wp-google-maps"); ?></h3>
	
						<div class="wpgmza-button launcher-trigger" data-launcher="google-maps-quick-start-launcher" title="Powered by Google Maps Platform">
							<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/gm-platform-icon.png" /><?php _e("Get an API Key","wp-google-maps"); ?>
						</div>

						<h3><?php _e("Once ready, add your key below", "wp-google-maps"); ?></h3>

						<input type="text" class="wpgmza-text-align-center" name="api_key">

						<hr>

						<h3><?php _e("How does this work?", "wp-google-maps"); ?></h3>

						<p>
							<?php _e("The entire process is managed by Google and takes only a few minutes.", "wp-google-maps"); ?> 
							<?php _e("If preferred, you can create an API key from the <a href='https://wpgmaps.com/google-maps-developer-console/' target='_BLANK'>Google Developers Console</a>.", "wp-google-maps"); ?>
						</p>

						<p><?php _e("Please review our <a href='https://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/' target='_BLANK'>documentation</a> for a comprehensive guide on API key management.", "wp-google-maps"); ?></p>
						
						
					</div>
				</div>

				<!-- Managed keys are not being deployed at this stage; This has been hidden in case we want to trial it later --> 
				<!--
					<div class="wpgmza-row sub-step-container">
						<div class="wpgmza-col">
							<h3><?php _e("Get a managed key"); ?></h3>
							
							<p><?php _e("We'll set up your API key on your behalf and manage all services related to your key.", "wp-google-maps"); ?></p>

							<p><?php _e("You will still receive your monthly credits directly from Google, and the entire process takes only a few minutes.", "wp-google-maps"); ?></p>

							<div class="wpgmza-margin-t-20">
								<em>* <?php _e("Recommended for new users", "wp-google-maps"); ?></em>
							</div>

							<div class="wpgmza-button small sub-step-trigger" data-sub-step="google-maps-auto-key">
								<?php _e("Get automatic key","wp-google-maps"); ?>
							</div>

						</div>

						<div class="wpgmza-col">
							<h3><?php _e("Use your own key"); ?></h3>

							<p><?php _e("We'll guide your through the process of creating your own key, setting up services and restrictions.", "wp-google-maps"); ?></p>

							<p><?php _e("You retain full control over your key, quotas and services.", "wp-google-maps"); ?></p>

							<div class="wpgmza-margin-t-20">
								<em>* <?php _e("Recommended for experienced users", "wp-google-maps"); ?></em>
							</div>

							<div class="wpgmza-button small sub-step-trigger" data-sub-step="google-maps-manual-key">
								<?php _e("Add your own","wp-google-maps"); ?>
							</div>
						</div>
					</div>


					<div class="sub-step wpgmza-hidden" data-sub-step="google-maps-auto-key">
						<h3><?php _e("You've chosen to get a managed key", "wp-google-maps"); ?></h3>

						<p><?php _e("This process is completely automatic and shouldn't take longer than a few minutes.", "wp-google-maps"); ?></p>

						<p><?php _e("Please fill in your details below and we'll get right on it!", "wp-google-maps"); ?></p>

						<br><br>

						<div class="google-maps-auto-key-form-wrapper">
							<div class="wpgmza-margin-20 auto-key-error wpgmza-hidden" 
									data-already-exists="<?php _e("An account with this name already exists, we've changed it slightly below", "wp-google-maps"); ?>"
									data-regioncode="<?php _e("Your address is not specific enough, please provide a region code", "wp-google-maps"); ?>"
									data-postalcode="<?php _e("Your address is not specific enough, please provide a postal code", "wp-google-maps"); ?>"
									data-generic="<?php _e("We couldn't create your account, please check fields and try again", "wp-google-maps"); ?>" 
									data-missing-fields="<?php _e("All fields are required, please complete missing fields", "wp-google-maps"); ?>">
								<strong class="wpgmza-card notice notice-error wpgmza-pos-relative wpgmza-shadow"></strong>
								<br><br>
							</div>

							<h3><?php _e("What is your site called?", "wp-google-maps"); ?></h3>
							<input type="text" class="wpgmza-text-align-center wpgmza-margin-b-20" name="site_name" value="<?php echo get_bloginfo('name'); ?>">
							
							<h3><?php _e("What is the link to your site?", "wp-google-maps"); ?></h3>
							<input type="text" class="wpgmza-text-align-center wpgmza-margin-b-20" name="site_url" value="">

							<h3><?php _e("Enter your email address", "wp-google-maps"); ?></h3>
							<input type="text" class="wpgmza-text-align-center wpgmza-margin-b-20" name="user_email" value="<?php echo $currentUser->user_email; ?>">

							<h3><?php _e("Enter your physical address", "wp-google-maps"); ?></h3>
							<input type="text" class="wpgmza-text-align-center wpgmza-margin-b-20" name="address" value="">

							<div class="optional-sub-field wpgmza-hidden" data-field='postal_code'>
								<h3><?php _e("Postal code", "wp-google-maps"); ?></h3>
								<input type="text" class="wpgmza-text-align-center wpgmza-margin-b-20" name="postal_code" value="">
							</div>

							<div class="optional-sub-field wpgmza-hidden" data-field='region_code'>
								<h3><?php _e("Region code", "wp-google-maps"); ?></h3>
								<input type="text" class="wpgmza-text-align-center wpgmza-margin-b-20" name="region_code" value="">
							</div>

							<div>
								<small><?php _e("To enforce US laws and embargoes, Google requires a valid address for each new key created", "wp-google-maps"); ?></small>
							</div>

							<div class="wpgmza-margin-t-20">
								<div class="wpgmza-button">
									<?php _e("Confirm details and create API key", "wp-google-maps"); ?>
								</div>
							</div>

							<div class="wpgmza-margin-t-20">
								<small><?php _e("By clicking the button above, your details will be sent to our servers for processing", "wp-google-maps"); ?></small>
							</div>
						</div>

					</div>

					<div class="sub-step wpgmza-hidden" data-sub-step="google-maps-manual-key">
						<h3><?php _e("You've chosen to enter a key manually", "wp-google-maps"); ?></h3>

						<p><?php _e("You can create an API key from the <a href='https://wpgmaps.com/google-maps-developer-console/' target='_BLANK'>Google Developers Console</a>.", "wp-google-maps"); ?></p>

						<p><?php _e("Please review our <a href='https://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/' target='_BLANK'>documentation</a> for a comprehensive guide on API key management.", "wp-google-maps"); ?></p>

						<br><br>

						<h3><?php _e("Once ready, add your key below", "wp-google-maps"); ?></h3>
						<input type="text" class="wpgmza-text-align-center" name="api_key">
					</div>	
				-->

			</div>

			<!-- OpenLayers Setup -->
			<div class="engine-step" data-engine="open-layers">
				<h1><?php _e("OpenLayers", "wp-google-maps"); ?></h1>
				<h2><?php _e("What tile server would you like to use?", "wp-google-maps"); ?></h2>
				<hr>

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
			<hr>
		</div>


		<div class="step" data-step="2">
			<h1><?php _e("Great work, we're all set!", "wp-google-maps"); ?></h1>
			<h2><?php _e("We have everything we need to finish your installation", "wp-google-maps"); ?></h2>
			<h3><?php _e("When ready, finish the installation to get started!", "wp-google-maps"); ?></h3>
			<hr>
		</div>

		<div class="step-loader wpgmza-pos-relative wpgmza-hidden">
			<div class="wpgmza-preloader">
				<div></div>
				<div></div>
			</div>

			<h3 class="progress-busy wpgmza-hidden"><?php _e("Getting things ready...", "wp-google-maps"); ?></h3>
			<h3 class="progress-finish wpgmza-hidden"><?php _e("Finishing up...", "wp-google-maps"); ?></h3>
		</div>

		<div class="wpgmza-row step-controller">
			<div class="wpgmza-col-6">
				<div class="wpgmza-text-align-left">
					<div class="wpgmza-button prev-step-button">
		        		<i class="fa fa-chevron-left" aria-hidden="true" style="margin-left: 0; margin-right: 10px;"></i>
						<span><?php _e("Back","wp-google-maps"); ?></span>
		        	</div>
		        </div>
			</div>
			
			<div class="wpgmza-col-6">
				<div class="wpgmza-text-align-right">
					<div class="wpgmza-button next-step-button" data-next="<?php _e("Continue","wp-google-maps"); ?>" data-final="<?php _e("Finish install","wp-google-maps"); ?>">
						<span><?php _e("Continue","wp-google-maps"); ?></span>
		        		<i class="fa fa-chevron-right" aria-hidden="true"></i>
		        	</div>
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
