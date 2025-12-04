<?php
	$currentUser = wp_get_current_user();
?>

<div class="wrap wpgmza-wrap wpgmza-writeup-block wpgmza-shadow-high wpgmza-installer">
	<div class="wpgmza-installer-steps" data-ajax-nonce="<?php echo wp_create_nonce('wpgmza_installer_page'); ?>">
		<div class="step" data-step="0">
			<h1><?php _e("Welcome", "wp-google-maps"); ?>, <?php echo esc_html(ucfirst($currentUser->display_name)); ?></h1>
			<h2><?php _e("What map engine would you like to use?", "wp-google-maps"); ?></h2>

			<br>
			<a href="#" class='wpgmza-installer-skip wpgmza-button' title="<?php _e("We'll remind you in a day or two to finish up", "wp-google-maps"); ?>">
				<?php _e("Not ready? Skip for now!", "wp-google-maps"); ?>
			</a>

			<hr>

			<div class="wpgmza-map-engine-selector">
				<div class="wpgmza-map-engine-selector-grid">
					<label class="wpgmza-map-engine-item" title="<?php esc_attr_e('Google Maps', 'wp-google-maps'); ?>">
						<input type="radio" name="wpgmza_maps_engine" value="google-maps" class="wpgmza-hidden" />
						<div class="wpgmza-map-engine-item-backdrop"></div>
						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/Google_maps_logo.png" />
					</label>

					<label class="wpgmza-map-engine-item" title="<?php esc_attr_e('Microsoft Azure (Formerly Bing)', 'wp-google-maps'); ?>">
						<input type="radio" name="wpgmza_maps_engine" value="leaflet-azure" class="wpgmza-hidden" />
						<div class="wpgmza-map-engine-item-backdrop"></div>
						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/azure_maps_logo.png" />
					</label>

					<label class="wpgmza-map-engine-item" title="<?php esc_attr_e('Stadia Maps', 'wp-google-maps'); ?>">
						<input type="radio" name="wpgmza_maps_engine" value="leaflet-stadia" class="wpgmza-hidden" />
						<div class="wpgmza-map-engine-item-backdrop"></div>
						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/stadia_maps_logo.png" />
					</label>

					<label class="wpgmza-map-engine-item" title="<?php esc_attr_e('Maptiler', 'wp-google-maps'); ?>">
						<input type="radio" name="wpgmza_maps_engine" value="leaflet-maptiler" class="wpgmza-hidden" />
						<div class="wpgmza-map-engine-item-backdrop"></div>
						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/maptiler_logo.png" />
					</label>

					<label class="wpgmza-map-engine-item" title="<?php esc_attr_e('LocationIQ', 'wp-google-maps'); ?>">
						<input type="radio" name="wpgmza_maps_engine" value="leaflet-locationiq" class="wpgmza-hidden" />
						<div class="wpgmza-map-engine-item-backdrop"></div>
						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/location_iq_logo.png" />
					</label>

					<label class="wpgmza-map-engine-item" title="<?php esc_attr_e('Zero Cost Mapping Preset', 'wp-google-maps'); ?>">
						<input type="radio" name="wpgmza_maps_engine" value="leaflet-zerocost" class="wpgmza-hidden" />
						<div class="wpgmza-map-engine-item-backdrop"></div>
						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/zerocost_logo.png" />
					</label>

					<label class="wpgmza-map-engine-item" title="<?php esc_attr_e('Leaflet', 'wp-google-maps'); ?>">
						<input type="radio" name="wpgmza_maps_engine" value="leaflet" class="wpgmza-hidden" />
						<div class="wpgmza-map-engine-item-backdrop"></div>
						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/leaflet_logo.png" />
					</label>

					<label class="wpgmza-map-engine-item" title="<?php esc_attr_e('OpenLayers (V10)', 'wp-google-maps'); ?>">
						<input type="radio" name="wpgmza_maps_engine" value="open-layers-latest" class="wpgmza-hidden" />
						<div class="wpgmza-map-engine-item-backdrop"></div>
						<span>Version 10</span>
						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/openlayers_logo.png" />
					</label>

					<label class="wpgmza-map-engine-item" title="<?php esc_attr_e('OpenLayers (Legacy)', 'wp-google-maps'); ?>">
						<input type="radio" name="wpgmza_maps_engine" value="open-layers" class="wpgmza-hidden" />
						<div class="wpgmza-map-engine-item-backdrop"></div>
						<span>Version 6</span>
						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/openlayers_logo.png" />
					</label>
				</div>

				<!-- Powered by leaflet notice -->
				<div class='wpgmza-map-engine-powered-by' data-required-maps-engine="leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq">
					<span class='wpgmza-map-engine-powered-by-highlight' data-required-maps-engine="leaflet-azure"><?php esc_html_e("Microsoft Azure Maps", "wp-google-maps"); ?></span> 
					<span class='wpgmza-map-engine-powered-by-highlight' data-required-maps-engine="leaflet-stadia"><?php esc_html_e("Stadia Maps", "wp-google-maps"); ?></span> 
					<span class='wpgmza-map-engine-powered-by-highlight' data-required-maps-engine="leaflet-maptiler"><?php esc_html_e("Maptiler", "wp-google-maps"); ?></span> 
					<span class='wpgmza-map-engine-powered-by-highlight' data-required-maps-engine="leaflet-locationiq"><?php esc_html_e("Location IQ", "wp-google-maps"); ?></span> 
					<span class='wpgmza-map-engine-powered-by-highlight' data-required-maps-engine="leaflet-zerocost"><?php esc_html_e("Zero Cost Mapping", "wp-google-maps"); ?></span> 
					<span><?php esc_html_e("is powered by", "wp-google-maps"); ?></span>
					<span class='wpgmza-map-engine-powered-by-highlight'>
						<?php esc_html_e("Leaflet", "wp-google-maps"); ?>
						<span class='wpgmza-map-engine-powered-by-highlight' data-required-maps-engine="leaflet-zerocost"><?php esc_html_e("& OpenFreeMap", "wp-google-maps"); ?></span> 
					</span>
				</div>
			</div>

			<div class="wpgmza-row wpgmza-margin-t-20">
				<div class="wpgmza-col">
					<a href="https://www.wpgmaps.com/help/docs/map-engine-selection-guide/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=installer-engine-selection-docs-atlas-novus-v10" target="_BLANK">
						<small><?php _e("Not Sure? Take a look at our comparison guide!", "wp-google-maps"); ?></small>
					</a>
				</div>
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

			<!-- Azure Maps Features -->
			<div class="engine-step" data-engine="leaflet-azure">
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
							<?php _e("Multiple Styles", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-globe"></i>
						
						<span>
							<?php _e("Satellite Views", "wp-google-maps"); ?>
						</span>
					</div>
				</div>

				<div class="wpgmza-margin-t-20">
					<em><?php _e("You will need a Microsoft Azure Subscription key to access map tiles and address suggestions", "wp-google-maps"); ?></em>
				</div>
			</div>

			<!-- Stadia Maps Features -->
			<div class="engine-step" data-engine="leaflet-stadia">
				<div class="wpgmza-flex-grid center">
					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-lock"></i>
						<span>
							<?php _e("Requires an API key", "wp-google-maps"); ?>
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
							<?php _e("Multiple Styles", "wp-google-maps"); ?>
						</span>
					</div>
				</div>

				<div class="wpgmza-margin-t-20">
					<em><?php _e("You will need a Stadia Maps API Key to access map tiles", "wp-google-maps"); ?></em>
				</div>
			</div>

			<!-- Stadia Maps Features -->
			<div class="engine-step" data-engine="leaflet-maptiler">
				<div class="wpgmza-flex-grid center">
					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-lock"></i>
						<span>
							<?php _e("Requires an API key", "wp-google-maps"); ?>
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
							<?php _e("Multiple Styles", "wp-google-maps"); ?>
						</span>
					</div>
				</div>

				<div class="wpgmza-margin-t-20">
					<em><?php _e("You will need a Maptiler API Key to access map tiles", "wp-google-maps"); ?></em>
				</div>
			</div>

			<!-- LocationIQ Maps Features -->
			<div class="engine-step" data-engine="leaflet-locationiq">
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
							<?php _e("Multiple Styles", "wp-google-maps"); ?>
						</span>
					</div>
				</div>

				<div class="wpgmza-margin-t-20">
					<em><?php _e("You will need a LocationIQ API Key to access map tiles and address suggestions", "wp-google-maps"); ?></em>
				</div>
			</div>

			<!-- Leaflet Features -->
			<div class="engine-step" data-engine="leaflet">
				<div class="wpgmza-flex-grid center">
					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-unlock"></i>
						<span>
							<?php _e("No API keys required", "wp-google-maps"); ?> *
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
							<?php _e("Great performance", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-wrench"></i>
						<span>
							<?php _e("Powerful Features", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-layer-group"></i>
						<span>
							<?php _e("Multiple Tile Servers", "wp-google-maps"); ?>
						</span>
					</div>
				</div>

				<div class="wpgmza-margin-t-20">
					<em><?php _e("Some tile servers do require an API key, however, there are many free options available", "wp-google-maps"); ?></em>
				</div>
			</div>

			<!-- Leaflet Features -->
			<div class="engine-step" data-engine="leaflet-zerocost">
				<div class="wpgmza-flex-grid center">
					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-unlock"></i>
						<span>
							<?php _e("No API keys required", "wp-google-maps"); ?>
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
							<?php _e("Great performance", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-wrench"></i>
						<span>
							<?php _e("Powerful Features", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-layer-group"></i>
						<span>
							<?php _e("Zero Cost Mapping", "wp-google-maps"); ?>
						</span>
					</div>
				</div>
			</div>

			<!-- OpenLayers Features -->
			<div class="engine-step" data-engine="open-layers-latest">
				<div class="wpgmza-flex-grid center">
					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-unlock"></i>
						<span>
							<?php _e("No API keys required", "wp-google-maps"); ?> *
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
						<i class="fas fa-wrench"></i>
						<span>
							<?php _e("Powerful Features", "wp-google-maps"); ?>
						</span>
					</div>

					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-layer-group"></i>
						<span>
							<?php _e("Multiple Tile Servers", "wp-google-maps"); ?>
						</span>
					</div>
				</div>

				<div class="wpgmza-margin-t-20">
					<em><?php _e("Some tile servers do require an API key, however, there are many free options available", "wp-google-maps"); ?></em>
				</div>
			</div>

			<!-- OpenLayers Legacy Features -->
			<div class="engine-step" data-engine="open-layers">
				<div class="wpgmza-flex-grid center">
					<div class="wpgmza-installer-feature-item">
						<i class="fas fa-exclamation"></i>
						<span>
							<?php _e("Legacy Engine", "wp-google-maps"); ?>
						</span>
					</div>

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
					<em><?php _e("This engine is being deprecated and is no longer recommended!", "wp-google-maps"); ?></em>
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
							<?php _e("If preferred, you can create an API key from the <a href='https://wpgmaps.com/google-maps-developer-console/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=installer-dev-console-atlas-novus-v10' target='_BLANK'>Google Developers Console</a>.", "wp-google-maps"); ?>
						</p>

						<p><?php _e("Please review our <a href='https://www.wpgmaps.com/help/docs/creating-a-google-maps-api-key/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=installer-create-api-key-docs-atlas-novus-v10' target='_BLANK'>documentation</a> for a comprehensive guide on API key management.", "wp-google-maps"); ?></p>
						
						
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
							<input type="text" class="wpgmza-text-align-center wpgmza-margin-b-20" name="site_name" value="<?php echo esc_attr(get_bloginfo('name')); ?>">
							
							<h3><?php _e("What is the link to your site?", "wp-google-maps"); ?></h3>
							<input type="text" class="wpgmza-text-align-center wpgmza-margin-b-20" name="site_url" value="">

							<h3><?php _e("Enter your email address", "wp-google-maps"); ?></h3>
							<input type="text" class="wpgmza-text-align-center wpgmza-margin-b-20" name="user_email" value="<?php echo esc_attr($currentUser->user_email); ?>">

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

						<p><?php _e("You can create an API key from the <a href='https://wpgmaps.com/google-maps-developer-console/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=installer-dev-console-atlas-novus-v10' target='_BLANK'>Google Developers Console</a>.", "wp-google-maps"); ?></p>

						<p><?php _e("Please review our <a href='https://www.wpgmaps.com/help/docs/creating-a-google-maps-api-key/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=installer-create-api-key-docs-atlas-novus-v10' target='_BLANK'>documentation</a> for a comprehensive guide on API key management.", "wp-google-maps"); ?></p>

						<br><br>

						<h3><?php _e("Once ready, add your key below", "wp-google-maps"); ?></h3>
						<input type="text" class="wpgmza-text-align-center" name="api_key">
					</div>	
				-->

			</div>

			<!-- Azure Maps Setup -->
			<div class="engine-step" data-engine="leaflet-azure">
				<h1><?php _e("Azure Maps", "wp-google-maps"); ?></h1>
				<h2><?php _e("Let's get your Subscription key set up!", "wp-google-maps"); ?></h2>
				<hr>

				<div class="wpgmza-row">
					<div class="wpgmza-col">
						<h3><?php _e("Get your key from the Microsoft Azure", "wp-google-maps"); ?></h3>
	
						<a class="wpgmza-button" target="_BLANK" href="https://portal.azure.com/">
							<?php _e("Go to Azure Portal", "wp-google-maps"); ?>
						</a>

						<br>
						<br>
						<br>

						<h3><?php _e("Once ready, add your key below", "wp-google-maps"); ?></h3>

						<input type="text" class="wpgmza-text-align-center" name="azure_key">

						<hr>

						<h3><?php _e("Not sure how to start?", "wp-google-maps"); ?></h3>

						<p><?php _e("Please review our <a href='https://www.wpgmaps.com/help/docs/creating-an-azure-maps-subscription-key/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=installer-azure-key-docs-atlas-novus-v10' target='_BLANK'>documentation</a> for a comprehensive guide.", "wp-google-maps"); ?></p>
						
					</div>
				</div>
			</div>

			<!-- Stadia Maps Setup -->
			<div class="engine-step" data-engine="leaflet-stadia">
				<h1><?php _e("Stadia Maps", "wp-google-maps"); ?></h1>
				<h2><?php _e("Let's get your API key set up!", "wp-google-maps"); ?></h2>
				<hr>

				<div class="wpgmza-row">
					<div class="wpgmza-col">
						<h3><?php _e("Get your key from the Stadia Maps", "wp-google-maps"); ?></h3>
	
						<a class="wpgmza-button" target="_BLANK" href="https://client.stadiamaps.com">
							<?php _e("Go to Stadia Maps", "wp-google-maps"); ?>
						</a>

						<br>
						<br>
						<br>

						<h3><?php _e("Once ready, add your key below", "wp-google-maps"); ?></h3>

						<input type="text" class="wpgmza-text-align-center" name="stadia_key">

						<hr>

						<h3><?php _e("Not sure how to start?", "wp-google-maps"); ?></h3>

						<p><?php _e("Please review our <a href='https://www.wpgmaps.com/help/docs/creating-a-stadia-maps-api-key/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=installer-stadia-key-docs-atlas-novus-v10' target='_BLANK'>documentation</a> for a comprehensive guide.", "wp-google-maps"); ?></p>
						
					</div>
				</div>
			</div>

			<!-- Maptiler Maps Setup -->
			<div class="engine-step" data-engine="leaflet-maptiler">
				<h1><?php _e("Maptiler", "wp-google-maps"); ?></h1>
				<h2><?php _e("Let's get your API key set up!", "wp-google-maps"); ?></h2>
				<hr>

				<div class="wpgmza-row">
					<div class="wpgmza-col">
						<h3><?php _e("Get your key from the Maptiler", "wp-google-maps"); ?></h3>
	
						<a class="wpgmza-button" target="_BLANK" href="https://cloud.maptiler.com/">
							<?php _e("Go to Maptiler", "wp-google-maps"); ?>
						</a>

						<br>
						<br>
						<br>

						<h3><?php _e("Once ready, add your key below", "wp-google-maps"); ?></h3>

						<input type="text" class="wpgmza-text-align-center" name="maptiler_key">

						<hr>

						<h3><?php _e("Not sure how to start?", "wp-google-maps"); ?></h3>

						<p><?php _e("Please review our <a href='https://www.wpgmaps.com/help/docs/creating-a-maptiler-api-key/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=installer-maptiler-key-docs-atlas-novus-v10' target='_BLANK'>documentation</a> for a comprehensive guide.", "wp-google-maps"); ?></p>
						
					</div>
				</div>
			</div>

			<!-- LocationIQ Maps Setup -->
			<div class="engine-step" data-engine="leaflet-locationiq">
				<h1><?php _e("LocationIQ", "wp-google-maps"); ?></h1>
				<h2><?php _e("Let's get your API key set up!", "wp-google-maps"); ?></h2>
				<hr>

				<div class="wpgmza-row">
					<div class="wpgmza-col">
						<h3><?php _e("Get your key from the LocationIQ", "wp-google-maps"); ?></h3>
	
						<a class="wpgmza-button" target="_BLANK" href="https://locationiq.com/">
							<?php _e("Go to LocationIQ", "wp-google-maps"); ?>
						</a>

						<br>
						<br>
						<br>

						<h3><?php _e("Once ready, add your key below", "wp-google-maps"); ?></h3>

						<input type="text" class="wpgmza-text-align-center" name="locationiq_key">

						<hr>

						<h3><?php _e("Not sure how to start?", "wp-google-maps"); ?></h3>

						<p><?php _e("Please review our <a href='https://www.wpgmaps.com/help/docs/creating-a-location-iq-access-token/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=installer-locationiq-key-docs-atlas-novus-v10' target='_BLANK'>documentation</a> for a comprehensive guide.", "wp-google-maps"); ?></p>
						
					</div>
				</div>
			</div>

			<!-- Tile Server Setup -->
			<div class="engine-step" data-engine="open-layers|open-layers-latest|leaflet">
				<h1><?php _e("Find a style", "wp-google-maps"); ?></h1>
				<h2><?php _e("What tile server would you like to use?", "wp-google-maps"); ?></h2>
				<hr>

				<div class="wpgmza-row align-center" data-tile-server-select-container>
					
				</div>

				<br><br>
				<br><br>

				<em><?php _e("There are more tile servers available within the settings area of the plugin, but they may require additional set up.", "wp-google-maps"); ?></em>
			</div>

			<!-- Tile Server Setup -->
			<div class="engine-step" data-engine="leaflet-zerocost">
				<h1><?php _e("Find a style", "wp-google-maps"); ?></h1>
				<h2><?php _e("What tile style would you like to use?", "wp-google-maps"); ?></h2>
				<hr>

				<div class="wpgmza-row align-center" data-tile-server-select-container-zerocost>
					
				</div>
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

		<div class="step-assisted-skip wpgmza-pos-relative wpgmza-hidden wpgmza-card">
			<div class="step-assisted-prompt">
				<h1><?php _e("Welcome", "wp-google-maps"); ?>, <?php echo esc_html(ucfirst($currentUser->display_name)); ?></h1>
				<h2><?php _e("Are you exploring WP Go Maps for the first time?", "wp-google-maps"); ?></h2>
				<div>
					<?php _e("If so, we can set things up temporarily so that you can explore and learn more about the tools, or you can continue with your own API keys and settings!", "wp-google-maps"); ?>
				</div>

				<div class="wpgmza-row align-center justify-center gap-4">
					<div class="wpgmza-button wpgmza-button-primary assisted-setup-button" data-intent="quick-setup">
						<span><?php _e("Yes! Quick start","wp-google-maps"); ?></span>
					</div>
					
					<div class="wpgmza-button assisted-setup-button" data-intent="full-setup">
						<span><?php _e("No thanks, full setup","wp-google-maps"); ?></span>
					</div>
				</div>
			</div>

			<div class="step-assisted-permission wpgmza-hidden">
				<h1><?php _e("Perfect, one more thing!", "wp-google-maps"); ?></h1>
				<h2><?php _e("Do we have permission to contact our servers?", "wp-google-maps"); ?></h2>
				<div>
					<?php _e("We'll set up a temporary Google Maps API key for you to use in the map editor, by briefly communicating with our servers.", "wp-google-maps"); ?> 
				</div>
				<div>
					<?php _e("This key can be used to explore our tools, but will need to be replaced with your own API key later.", "wp-google-maps"); ?>
				</div>

				<br>

				<div>
					<strong><?php _e("Note:", "wp-google-maps"); ?></strong> 
					<?php _e("By opting in, your site URL will be shared with our servers in order to create an API key.", "wp-google-maps"); ?>
				</div>

				<div class="wpgmza-row align-center justify-center gap-4">
					<div class="wpgmza-button wpgmza-button-primary assisted-setup-button" data-intent="generate-key">
						<span><?php _e("Yes, I'm okay with that!","wp-google-maps"); ?></span>
					</div>
				</div>

				<br>

				<a href="#" class='assisted-setup-button' data-intent="assisted-decline">
					<?php _e("Or complete the full setup instead!", "wp-google-maps"); ?>
				</a>

			</div>
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
