<div id="wpgmza-map-edit-page" class='wrap wpgmza-wrap fullscreen'>
	<div class="wpgmza-editor">
		<div class="sidebar wpgmza-shadow">

			<!-- Map Settings Form -->
			<!-- Any field within this form will be saved to the map settings -->
			<form action="" method="POST" id="wpgmaps_options" name="wpgmza_map_form" class="wpgmza-map-settings-form">
				<input name="action" type="hidden" value="wpgmza_save_map"/>
				<input name="redirect_to" type="hidden"/>
				<input name="map_id" type="hidden"/>
				<input name="real_post_nonce" type="hidden"/>
				<input type='submit' name='wpgmza_savemap' id='wpgmza_savemap' class='wpgmza-hidden' value='<?php _e("Save Map", "wp-google-maps"); ?>'/>


				<!-- Global Tab - Starting view for the editor -->
				<div class="grouping open" data-group="global">
					<div class="heading block" id="wpgmza-main-heading">
						<?php _e('WP Go Maps', 'wp-google-maps'); ?>
						<span id="wpgmza-title-label" class="wpgmza-label-amber"><small></small></span>
					</div>

					<div class="navigation">
						<div class="item caret-right" data-group="map-settings">
							<?php _e("Settings", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-markers">
							<?php _e("Markers", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-polygons">
							<?php _e("Polygons", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-polylines">
							<?php _e("Polylines", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-heatmaps">
							<?php _e("Heatmaps", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-circles">
							<?php _e("Circles", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-rectangles">
							<?php _e("Rectangles", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-point-labels">
							<?php _e("Point Labels", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-image-overlays">
							<?php _e("Image Overlays", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-help">
							<?php _e("Help", "wp-google-maps"); ?>
						</div>

						<div class="item pro caret-right" data-group="map-settings-pro">
							<?php _e("Pro Features", "wp-google-maps"); ?>
						</div>

						<div class="upsell-block auto-rotate">
							<!-- Upsell card - Custom Markers --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/custom-markers.webp');" 
										 title="<?php _e("Add detailed information to your markers!", "wp-google-maps"); ?>"
										 alt="<?php _e("Add detailed information to your markers!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add detailed information to your markers with our Pro version!", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Add custom icons to your markers!", "wp-google-maps"); ?></li>
											<li><?php _e("Display titles, descriptions, images, videos and categories. ", "wp-google-maps"); ?></li>
											<li><?php _e("Control behaviour, hover styles, animations and layers!", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced-markers-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Custom Marker Icons --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/marker-icons.webp');" 
										 title="<?php _e("Create or upload custom marker icons for your markers!", "wp-google-maps"); ?>"
										 alt="<?php _e("Create or upload custom marker icons for your markers!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Create or upload custom marker icons with our Pro version!", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Create new marker icons in minutes!", "wp-google-maps"); ?></li>
											<li><?php _e("Add text or icons and adjust your icon style on the go. ", "wp-google-maps"); ?></li>
											<li><?php _e("Or upload a custom icon instead!", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=custom-marker-icons-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Directions --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/directions.webp');" 
										 title="<?php _e("Allow your visitors to get directions to your markers!", "wp-google-maps"); ?>"
										 alt="<?php _e("Allow your visitors to get directions to your markers!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Allow your visitors to get directions to your markers with our Pro version!", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Get directions to any of your markers!", "wp-google-maps"); ?></li>
											<li><?php _e("Add waypoints to routes, and control transit modes! ", "wp-google-maps"); ?></li>
											<li><?php _e("Control route colour and behaviour!", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=directions-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Marker Listings --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/marker-listing.webp');" 
										 title="<?php _e("List your markers in many different styles with your map!", "wp-google-maps"); ?>"
										 alt="<?php _e("List your markers in many different styles with your map!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add marker listings to your maps with our Pro version!", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Up to six styles!", "wp-google-maps"); ?></li>
											<li><?php _e("Control sorting order, filters and pagination.", "wp-google-maps"); ?></li>
											<li><?php _e("Interactive and customizable!", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker-listing-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Blocks --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/blocks.webp');" 
										 title="<?php _e("Additional blocks and shortcodes!", "wp-google-maps"); ?>"
										 alt="<?php _e("Additional blocks and shortcodes!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Additional blocks and shortcodes with our Pro version", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Up to seven different blocks!", "wp-google-maps"); ?></li>
											<li><?php _e("Create custom layouts with separated components", "wp-google-maps"); ?></li>
											<li><?php _e("Matching shortcodes for each block available!", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=gutenberg-blocks-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Unlimited Maps --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/unlimited.webp');" 
										 title="<?php _e("Create unlimited maps and markers!", "wp-google-maps"); ?>"
										 alt="<?php _e("Create unlimited maps and markers!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Create unlimited maps with our Pro version", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Customize each map individually!", "wp-google-maps"); ?></li>
											<li><?php _e("Zero limits or restrictions to any of your data.", "wp-google-maps"); ?></li>
											<li><?php _e("Custom themes, filtering, and behaviour controls for each map", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=unlimited-maps-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Overlays --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/overlays.webp');" 
										 title="<?php _e("Add image overlays to your map!", "wp-google-maps"); ?>"
										 alt="<?php _e("Add image overlays to your map!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add image overlays with our Pro version", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Add any image overlay to your map!", "wp-google-maps"); ?></li>
											<li><?php _e("Showcase historical maps, datasets, or custom imagery on any map.", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=overlays-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Streetview --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/streetview.webp');" 
										 title="<?php _e("Start in streetview!", "wp-google-maps"); ?>"
										 alt="<?php _e("Start in streetview!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add streetview features our Pro version", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Start in streetview, be default!", "wp-google-maps"); ?></li>
											<li><?php _e("Set your starting location, heading, and pitch.", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=streetview-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Heatmaps --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/heatmaps.jpg');" 
										 title="<?php _e("Add heatmaps to your map!", "wp-google-maps"); ?>"
										 alt="<?php _e("Add heatmaps to your map!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add heatmaps with our Pro version", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Create dynamic heatmaps quickly!", "wp-google-maps"); ?></li>
											<li><?php _e("Adjust styles and intensity of heatmaps.", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=heatmaps-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Store Locator --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/store.webp');" 
										 title="<?php _e("Get more store locator features!", "wp-google-maps"); ?>"
										 alt="<?php _e("Get more store locator features!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add store locator features with our Pro version!", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Additional filter controls!", "wp-google-maps"); ?></li>
											<li><?php _e("Advanced behaviour features.", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>

							<!-- Upsell card - Behaviour --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/custom-markers.webp');" 
										 title="<?php _e("Add behaviour controls!", "wp-google-maps"); ?>"
										 alt="<?php _e("Add behaviour controls!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add behaviour controls with our Pro version!", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Fit map to bounds, or focus on user location!", "wp-google-maps"); ?></li>
											<li><?php _e("Add shape labels, and start in streetview.", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings Tab -->
				<div class="grouping" data-group="map-settings">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='global'></div>
						<?php _e('Settings', 'wp-google-maps'); ?>
					</div>

					<div class="navigation">
						<div class="item caret-right" data-group="map-settings-general">
							<?php _e("General", "wp-google-maps"); ?>
						</div>
						
						<div class="item caret-right" data-group="map-settings-store-locator">
							<?php _e("Store Locator", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-directions">
							<?php _e("Directions", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-themes">
							<?php _e("Themes", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-info-windows">
							<?php _e("Info Windows", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-marker-listings">
							<?php _e("Marker Listing", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-category-legends">
							<?php _e("Legends", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-behaviour">
							<?php _e("Behaviour", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-advanced">
							<?php _e("Advanced", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-integrations">
							<?php _e("Integrations", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item hide-pro caret-right" data-group="map-settings-marker-field">
							<?php _e("Marker Fields", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-beta">
							<?php _e("Beta Features", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-shortcodes">
							<?php _e("Shortcodes", "wp-google-maps"); ?>
						</div>

						<div class="item pro caret-right" data-group="map-settings-pro">
							<?php _e("Pro Features", "wp-google-maps"); ?>
						</div>
					</div>
				</div> 

				<!-- Map Settings - General Tab -->
				<div class="grouping" data-group="map-settings-general">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('General', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Hidden Block-->
						<div class="wpgmza-hidden">
							<!-- All fields are populated dynamically -->
							<input type='hidden' name='http_referer'/>
							<input type='hidden' name='wpgmza_id' id='wpgmza_id'/>
						
							<input type='hidden' name='map_start_lat'/>
							<input type='hidden' name='map_start_lng'/>
							<input type='hidden' name='wpgmza_start_location' id='wpgmza_start_location'/>
						
							<select id='wpgmza_start_zoom' name='wpgmza_start_zoom'>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4" selected>4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
								<option value="8">8</option>
								<option value="9">9</option>
								<option value="10">10</option>
								<option value="11">11</option>
								<option value="12">12</option>
								<option value="13">13</option>
								<option value="14">14</option>
								<option value="15">15</option>
								<option value="16">16</option>
								<option value="17">17</option>
								<option value="18">18</option>
								<option value="19">19</option>
								<option value="20">20</option>
								<option value="21">21</option>
							</select>
						</div>

						<!-- Map Name Field -->
						<fieldset>
							<legend><?php _e("Map Name", "wp-google-maps"); ?></legend>
							<input id='wpgmza_title' name='map_title' class='regular-text' type='text'/>
						</fieldset>

						<!--Shortcode -->
						<fieldset>
							<legend><?php _e("Short code","wp-google-maps"); ?> </legend>
							<input type="text" readonly name="shortcode" class="wpgmza_copy_shortcode" id="shortcode_input"/>
						</fieldset>

						<!-- Shortcode hint -->
						<div class='hint'>
							<?php
								_e("Copy this into your post or page to display the map", "wp-google-maps");
								
								?>
								<br>
								<?php
								
								// NB: I recommend adding a unique ID or class to this link and using the DOM to set the href rather than mixing content with logic here. - Perry
								echo __(sprintf("<a href='%s' target='BLANK'>Click here to automatically create a Map Page now</a>.","admin.php?page=wp-google-maps-menu&amp;action=create-map-page&amp;map_id=". (!empty($_REQUEST['map_id']) ? $_REQUEST['map_id'] : '')),"wp-google-maps");

							?>
						</div>

						<!-- Map Zoom Field -->
						<fieldset>
							<legend> <?php _e("Zoom Level", "wp-google-maps"); ?></legend>
							<input type="text" id="amount" class='map_start_zoom wpgmza-hidden' name="map_start_zoom"/>
							<div id="slider-range-max"></div>
						</fieldset>

						<!-- Hint -->
						<div class="hint">
							<?php _e("Use your mouse to change the starting position of your map. When you have positioned the map to your desired location, press \"Save Map\" to keep your settings.", "wp-google-maps"); ?>
						</div>

						<!-- Map alignment -->
						<fieldset>
							<legend><?php _e("Map Alignment", "wp-google-maps"); ?></legend>
							
							<select id="wpgmza_map_align" name="wpgmza_map_align" class="postform">
								<option value="1">
									<?php _e('Left', 'wp-google-maps'); ?>
								</option>
								<option value="2">
									<?php _e('Center', 'wp-google-maps'); ?>
								</option>
								<option value="3">
									<?php _e('Right', 'wp-google-maps'); ?>
								</option>
								<option value="4">
									<?php _e('None', 'wp-google-maps'); ?>
								</option>
							</select>
						</fieldset>

						<!-- Google Map type -->
						<fieldset data-wpgmza-require-engine="google-maps">
							<legend><?php _e("Map type", "wp-google-maps"); ?></legend>
							
							<select id="wpgmza_map_type" name="type">
								<option value="1">
									<?php _e("Roadmap", "wp-google-maps"); ?>
								</option>
								<option value="2">
									<?php _e("Satellite", "wp-google-maps"); ?>
								</option>
								<option value="3">
									<?php _e("Hybrid", "wp-google-maps"); ?>
								</option>
								<option value="4">
									<?php _e("Terrain", "wp-google-maps"); ?>
								</option>
							</select>
							
							<div class='wpgmza-open-layers-feature-unavailable'></div>
						</fieldset>

						<!-- Map Width Field -->
						<fieldset>
							<legend><?php _e("Width", "wp-google-maps"); ?></legend>
							
							<div class='multi-field'>
								<input id="wpgmza_width" name="map_width" type="number" value="100"/>
								<select id='wpgmza_map_width_type' name='map_width_type'>
									<option value="px">px</option>
									<option value="%" selected="selected">%</option>
									<option value="vw">vw</option>
								</select>
							</div>

							<div class="hint"><?php _e("Set to 100% for a responsive map", "wp-google-maps"); ?></div>
						</fieldset>

						<!-- Map Height Field -->
						<fieldset>
							<legend><?php _e("Height", "wp-google-maps"); ?> </legend>
							
							<div class="multi-field">
								<input id='wpgmza_height' name='map_height' type='number'/>
								<select id='wpgmza_map_height_type' name='map_height_type'>
									<option value="px">px</option>
									<option value="%">%</option>
									<option value="vh">vh</option>
								</select>
							</div>

							<div class="hint"><?php _e("We recommend that you leave your height in PX. Depending on your theme, using % for the height may break your map.", "wp-google-maps"); ?></div>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Store Locator Tab -->
				<div class="grouping" data-group="map-settings-store-locator">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Store Locator', 'wp-google-maps'); ?>
					</div>

					<div class="navigation">
						<div class="item caret-right" data-group="map-settings-store-locator-general">
							<?php _e("General", "wp-google-maps"); ?>
						</div>
						
						<div class="item caret-right" data-group="map-settings-store-locator-fields">
							<?php _e("Fields", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-store-locator-style">
							<?php _e("Style", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-store-locator-advanced">
							<?php _e("Advanced", "wp-google-maps"); ?>
						</div>

						<div class="upsell-block auto-rotate">
							<!-- Upsell card - Store Locator --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/store.webp');" 
										 title="<?php _e("Get more store locator features!", "wp-google-maps"); ?>"
										 alt="<?php _e("Get more store locator features!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add store locator features with our Pro version!", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Additional filter controls!", "wp-google-maps"); ?></li>
											<li><?php _e("Advanced behaviour features.", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-focus-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Store Locator  - General Tab -->
				<div class="grouping" data-group="map-settings-store-locator-general">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-store-locator'></div>
						<?php _e('General', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Enabled field -->
						<fieldset class="wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Enable Store Locator", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col">
								<div class="switch">
									<input type='checkbox' id='store_locator_enabled' name='store_locator_enabled' class='postform cmn-toggle cmn-toggle-round-flat'/>
									<label for='store_locator_enabled'  data-on='<?php esc_attr_e("Yes", "wp-google-maps"); ?>'  data-off='<?php esc_attr_e("No", "wp-google-maps"); ?>'></label>
								</div>
							</div>
						</fieldset>

						<!-- Distance Option -->
						<fieldset class="wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Show distance in", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class="switch">
									<input type='checkbox' 
										id='store_locator_distance' 
										name='store_locator_distance' 
										class='postform cmn-toggle cmn-toggle-yes-no'/>
									<label class='' 
										for='store_locator_distance' 
										data-on='<?php esc_attr_e("Miles", "wp-google-maps"); ?>' 
										data-off='<?php esc_attr_e("Kilometers", "wp-google-maps"); ?>'>
									</label>
								</div>
							</div>
						</fieldset>

						<!-- Legacy Interface style -->
						<fieldset data-require-legacy-user-interface-style="true">
							<legend><?php _e("Store Locator Style", "wp-google-maps"); ?> </legend>
							
							<ul>
								<li>
									<label>
										<input type='radio' name='store_locator_style' value='legacy'/>
										<?php _e("Legacy", "wp-google-maps"); ?>
									</label>
								</li>
								<li>
									<label>
										<input type='radio' name='store_locator_style' value='modern'/>
										<?php _e("Modern", "wp-google-maps"); ?>
									</label>
								</li>
							</ul>
						</fieldset>

						<!-- Radius Option -->
						<fieldset class="wpgmza-pro-feature">
							<legend> <?php _e("Search Area", "wp-google-maps"); ?></legend>
							
							<ul>
								<li>
									<label>
										<input type='radio' name='store_locator_search_area' value='radial' checked='checked' class="wpgmza-pro-feature" />
										<?php _e("Radial", "wp-google-maps"); ?>
									</label>
									
									<div class="hint"><?php _e("Allows the user to select a radius from a predefined list", "wp-google-maps"); ?></div>
								</li>
								<li>
									<label>
										<input type='radio' name='store_locator_search_area' value='auto' class="wpgmza-pro-feature" />
										<?php _e("Auto", "wp-google-maps"); ?>
									</label>
									
									<div class="hint"><?php _e("Intelligently detects the zoom level based on the location entered", "wp-google-maps"); ?></div>

									<div class="hint" data-search-area="auto">
										<?php
											_e("Marker listings will not be filtered based on visible markers. Enable the 'Only load markers within viewport (beta)' option for beta filtering support", "wp-google-maps");
										?>
									</div>
								</li>
							</ul>
						</fieldset>

						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable intelligent, automatic search area with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-radius-atlas-novus">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Default Radius -->
						<fieldset data-search-area="radial">
							<legend><?php _e("Default radius", "wp-google-maps"); ?></legend>
							<div class="wpgmza-inline-dropdown">
								<select name='wpgmza_store_locator_default_radius' class='wpgmza-store-locator-default-radius'></select>
							</div>
						</fieldset>

						<!-- Max auto zoom -->
						<fieldset data-search-area="auto">
							<legend><?php _e("Maximum zoom", "wp-google-maps"); ?></legend>
							<input name='store_locator_auto_area_max_zoom' type='number' min='1' max='21' placeholder="1 - 21"/>
						</fieldset>

						
					</div>
				</div>

				<!-- Map Settings - Store Locator  - Style Tab -->
				<div class="grouping" data-group="map-settings-store-locator-style">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-store-locator'></div>
						<?php _e('Style', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Radial Style -->
						<fieldset data-search-area="radial">
							<legend><?php _e("Radius Style", "wp-google-maps"); ?></legend>
							<ul>
								<li>
									<label>
										<input type='radio' name='wpgmza_store_locator_radius_style' value='legacy' checked='checked' />
										<?php _e("Legacy", "wp-google-maps"); ?>
									</label>
								</li>
								<li>
									<label>
										<input type='radio' name='wpgmza_store_locator_radius_style' value='modern' />
										<?php _e("Modern", "wp-google-maps"); ?>
									</label>
								</li>
							</ul>
						</fieldset>

						<!-- Placement -->
						<fieldset class="wpgmza-row">
							<legend><?php _e("Store Locator Placement", "wp-google-maps"); ?></legend>
							<!-- Only available and supported by Atlas Novus (Legacy uses: wpgmza_store_locator_position) -->
							<select name="store_locator_component_anchor" id="store_locator_component_anchor" class='wpgmza-anchor-control' data-default="TOP"></select>
						</fieldset>

						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable custom styling options with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-position-atlas-novus">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Show center point -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Show center point as an icon", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox' 
										id='wpgmza_store_locator_bounce' 
										name='wpgmza_store_locator_bounce' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
									<label for='wpgmza_store_locator_bounce'></label>
								</div>
							</div>
						</fieldset>

						<!-- Store locator icon -->
						<fieldset id="wpgmza_store_locator_bounce_conditional" 
							style="display: none;" 
							class="wpgmza-store-locator-marker-icon-picker-container wpgmza-pro-feature">
							<legend>
								<?php
								_e("Default Icon", "wp-google-maps");
								?>
							</legend>
						</fieldset>

						<!-- Animation Style -->
						<fieldset class="wpgmza-pro-feature">
							<legend> <?php _e("Marker animation", "wp-google-maps"); ?></legend>
							
							<select name="wpgmza_sl_animation" id="wpgmza_sl_animation" class="wpgmza-pro-feature">
								<option value="0">
									<?php _e("None", "wp-google-maps"); ?>
								</option>
								<option value="1">
									<?php _e("Bounce", "wp-google-maps"); ?>
								</option>
								<option value="2">
									<?php _e("Drop", "wp-google-maps");?>
								</option>
							</select>
						</fieldset>

						<fieldset class="wpgmza-row wpgmza-pro-feature" data-search-area="radial">
							<!-- Line color -->
							<div class="wpgmza-col">
								<legend><?php _e("Line color", "wp-google-maps"); ?></legend>
								<input id="sl_stroke_color" name="sl_stroke_color" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input wpgmza-pro-feature"/>
							</div>

							<!-- Line opacity -->
							<div class="wpgmza-col">
								<legend><?php _e("Opacity", "wp-google-maps"); ?></legend>
								<input id="sl_stroke_opacity" 
									name="sl_stroke_opacity"
									type="number"
									min="0"
									max="1"
									step="0.01"
									class="wpgmza-pro-feature"/>
								
								<div class="hint"><?php _e("Example: 0.5 for 50%", "wp-google-maps"); ?></div>
							</div>
						</fieldset>
						
						<fieldset class="wpgmza_legacy_sl_style_option_area wpgmza-pro-feature wpgmza-row" data-search-area="radial">
							<!-- Fill color -->
							<div class="wpgmza-col">
								<legend><?php _e("Fill color", "wp-google-maps"); ?></legend>
								<input id="sl_fill_color" name="sl_fill_color" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input wpgmza-pro-feature"/>
							</div>

							<!-- Fill opacity -->
							<div class="wpgmza-col">
								<legend><?php _e("Fill opacity", "wp-google-maps"); ?></legend>
								
								<input id="sl_fill_opacity"
									name="sl_fill_opacity"
									type="number"
									min="0"
									max="1"
									step="0.01"
									class="wpgmza-pro-feature"/>

								<div class="hint"><?php _e("Example: 0.5 for 50%", "wp-google-maps"); ?></div>
							</div>
						</fieldset>

						<div class="hint">
							<em>
								<?php
								_e('View', 'wp-google-maps');
								?>
								<a href='https://docs.wpgmaps.com/store-locator' target='_BLANK'>
									<?php
									_e('Store Locator Documentation', 'wp-google-maps');
									?>
								</a>
							</em>
						</div>

					</div>
				</div>

				<!-- Map Settings - Store Locator - Fields Tab -->
				<div class="grouping" data-group="map-settings-store-locator-fields">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-store-locator'></div>
						<?php _e('Fields', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-fields-atlas-novus">
							Edit fields</a> with the Pro version. Support and updates included forever', 'wp-google-maps');
							?>
						</div>

						<!-- Query String -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Query String", "wp-google-maps"); ?></legend>
							<input type="text" name="store_locator_query_string" id="wpgmza_store_locator_query_string" class="wpgmza-pro-feature" placeholder="<?php esc_attr_e("ZIP / Address:", "wp-google-maps"); ?>"/>
						</fieldset>

						<!-- Location Placeholder String -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Location Placeholder", "wp-google-maps"); ?></legend>
							<input type="text" name="store_locator_location_placeholder" id="wpgmza_store_locator_location_placeholder" class="wpgmza-pro-feature" placeholder="<?php esc_attr_e("Enter a location", "wp-google-maps"); ?>"/>
						</fieldset>
						
						<!-- Default Address -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Default address", "wp-google-maps"); ?></legend>
							<div class="wpgmza-inline-field">
								<input type="text" 
									name="store_locator_default_address"
									id="wpgmza_store_locator_default_address"
									class="wpgmza-address wpgmza-pro-feature"
									placeholder="<?php esc_attr_e("Enter a location", "wp-google-maps"); ?>"
									/>
							</div>
						</fieldset>
						
						<!-- Enable title search -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Enable title search", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox'
										id='wpgmza_store_locator_name_search' 
										name='store_locator_name_search' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
									<label for='wpgmza_store_locator_name_search'></label>
								</div>
							</div>
						</fieldset>
						
						<!-- Title string -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Title search String", "wp-google-maps"); ?></legend>
							
							<input type="text" 
								name="store_locator_name_string"
								id="wpgmza_store_locator_name_string"
								class="wpgmza-pro-feature"
								placeholder="<?php esc_attr_e("Enter a title", "wp-google-maps"); ?>" 
								/>
						</fieldset>
						
						<!-- Not found message -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e( "Not found message", "wp-google-maps"); ?></legend>
							
							<input type="text"
								name="store_locator_not_found_message"
								id="wpgmza_store_locator_not_found_message"
								class="wpgmza-pro-feature"
								placeholder="<?php esc_attr_e("No locations found", "wp-google-maps"); ?>" 
								/>
						</fieldset>
					</div>
				</div>


				<!-- Map Settings - Store Locator  - Advanced Tab -->
				<div class="grouping" data-group="map-settings-store-locator-advanced">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-store-locator'></div>
						<?php _e('Advanced', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Restrict to country -->
						<fieldset id="wpgmza-store-locator-country-restriction-container" class="wpgmza-pro-feature">
							<legend>
								<?php
								_e("Restrict to country", "wp-google-maps");
								?>
							</legend>
						</fieldset>

						<!-- Show distance from search -->
						<fieldset class="wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Show distance from search", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox'
										id='store_locator_show_distance' 
										name='store_locator_show_distance' 
										class='postform cmn-toggle cmn-toggle-round-flat'
										/>
									<label for='store_locator_show_distance'></label>
								</div>
							</div>
						</fieldset>

						<!-- Category Filter -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Allow category selection", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox'
										id='wpgmza_store_locator_category_enabled' 
										name='store_locator_category' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'
										/>
									<label for='wpgmza_store_locator_category_enabled'></label>
								</div>
							</div>
						</fieldset>

						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable search by category with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-categories-atlas-novus">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Use user location -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Allow users to use their location as the starting point", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox' 
										id='wpgmza_store_locator_use_their_location' 
										name='wpgmza_store_locator_use_their_location' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
									<label for='wpgmza_store_locator_use_their_location'></label>
								</div>
							</div>
						</fieldset>

						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable user geolocation features with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-user-loc-atlas-novus">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Hide markers until search -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Hide all markers until a search is done", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox' 
										id='wpgmza_store_locator_hide_before_search' 
										name='wpgmza_store_locator_hide_before_search' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
									<label for='wpgmza_store_locator_hide_before_search'></label>
								</div>
							</div>
						</fieldset>

						<!-- Allow nearby search narrowing -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Allow nearby searches", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox' 
										id='store_locator_nearby_searches' 
										name='store_locator_nearby_searches' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
									<label for='store_locator_nearby_searches'></label>
								</div>
							</div>
						</fieldset>

					</div>
				</div>


				<!-- Map Settings - Get Directions Tab -->
				<div class="grouping" data-group="map-settings-directions">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Directions', 'wp-google-maps'); ?>
					</div>

					<div class="settings wpgmza-directions-box-settings-panel">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=directions-atlas-novus">
							Enable directions</a> with the Pro version for only $39.99 once off. Support and updates included forever', 'wp-google-maps');
							?>
						</div>

						<!-- Enable Directions -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
	                        	<legend><?php _e("Enable Directions?","wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col">
	                            <div class='switch'>
	                                <input type='checkbox' class='cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'> 
	                                <label data-on='<?php _e("No","wp-google-maps"); ?>' data-off='<?php _e("No","wp-google-maps"); ?>'></label>
	                            </div>
	                        </div>
						</fieldset>

						<!-- Open by Default -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
	                    	<legend><?php _e("Directions Box Open by Default?","wp-google-maps"); ?></legend>
							
		                    <select class='postform wpgmza-pro-feature'>
		                        <option><?php _e("No","wp-google-maps"); ?></option>
		                        <option><?php _e("Yes, on the left","wp-google-maps"); ?></option>
		                        <option><?php _e("Yes, on the right","wp-google-maps"); ?></option>
		                        <option><?php _e("Yes, above","wp-google-maps"); ?></option>
		                        <option><?php _e("Yes, below","wp-google-maps"); ?></option>
		                    </select>
		                </fieldset>

		                <!-- Width -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
		                	<legend><?php _e("Directions Box Width","wp-google-maps"); ?></legend>
		                	<div class="wpgmza-inline-dropdown">
	                    		<input type='text' size='4' maxlength='4' class='small-text wpgmza-pro-feature' /> px
	                    	</div>
	                    </fieldset>
					</div>
				</div>

				<!-- Map Settings - Themes Tab -->
				<div class="grouping" data-group="map-settings-themes">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Themes', 'wp-google-maps'); ?>
					</div>

					<div class="navigation">
						<div class="item caret-right" data-group="map-settings-themes-presets">
							<?php _e("Presets", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-themes-editor">
							<?php _e("Editor", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-themes-manual" data-wpgmza-require-engine="google-maps">
							<?php _e("Theme Data", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-themes-custom-tile" data-wpgmza-require-engine="open-layers">
							<?php _e("Custom Image", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

				<!-- Map Settings - Themes - Presets Tab -->
				<div class="grouping" data-group="map-settings-themes-presets">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-themes'></div>
						<?php _e('Theme Presets', 'wp-google-maps'); ?>
					</div>

					<div class="settings wpgmza-open-layers-feature-unavailable wpgmza-theme-panel">
						<!-- Presets - Load from file -->
						
						<!-- Now partially supported via style layers -->
						<!--
							<span class='wpgmza-card wpgmza-shadow' data-wpgmza-require-engine="open-layers">
								<?php _e("Not available while using the OpenLayers engine.", "wp-google-maps"); ?>
							</span>
						-->
					</div>
				</div>

				<!-- Map Settings - Themes - Editor Tab -->
				<div class="grouping" data-group="map-settings-themes-editor">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-themes'></div>
						<?php _e('Theme Editor', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<div id="wpgmza-theme-editor" class="" data-wpgmza-require-engine="google-maps">
							<div id="wpgmza-theme-editor__edit">

								<!-- Feature --> 
								<fieldset id="wpgmza-theme-editor__feature">
									<legend><?php _e('Feature', 'wp-google-maps'); ?></legend>
									<select id="wpgmza_theme_editor_feature"></select>
								</fieldset>
								
								<div id="wpgmza-theme-editor__feature-settings">
									<!-- Visibility -->
									<fieldset>
										<legend>
											<?php _e('Visibility', 'wp-google-maps'); ?>
										</legend>
										<select id="wpgmza_theme_editor_visibility">
											<option value="inherit">
												<?php _e('Inherit', 'wp-google-maps'); ?>
											</option>
											<option value="off">
												<?php _e('Off', 'wp-google-maps'); ?>
											</option>
											<option value="simplified">
												<?php _e('Simplified', 'wp-google-maps'); ?>
											</option>
											<option value="on">
												<?php _e('On', 'wp-google-maps'); ?>
											</option>
										</select>
									</fieldset>
									
									<!-- Label -->
									<fieldset>
										<legend><?php _e('Label', 'wp-google-maps'); ?></legend>
										<select id="wpgmza_theme_editor_element"></select>
									</fieldset>
									
									<!-- Weight -->
									<fieldset>
										<legend><?php _e('Weight', 'wp-google-maps'); ?></legend>
										<input type="number" step="any" id="wpgmza_theme_editor_weight"/>
									</fieldset>
									
									<!-- Gamma -->
									<fieldset>
										<legend><?php _e('Gamma', 'wp-google-maps'); ?></legend>
										<input type="number" step="0.01" id="wpgmza_theme_editor_gamma"/>
									</fieldset>
									
									<!-- Saturation -->
									<fieldset>
										<legend><?php _e('Saturation', 'wp-google-maps'); ?></legend>
										<input type="number" id="wpgmza_theme_editor_saturation"/>
									</fieldset>
										
									<!-- Lightness -->
									<fieldset>
										<legend><?php _e('Lightness', 'wp-google-maps'); ?></legend>
										<input type="number" id="wpgmza_theme_editor_lightness"/>
									</fieldset>

									<!-- Color enabled -->
									<fieldset class="wpgmza-row">
										<div class="wpgmza-col">
											<legend><?php _e('Color', 'wp-google-maps'); ?></legend>
										</div>

										<div class="wpgmza-col">
											<div class="switch">
												<input type="checkbox" id="wpgmza_theme_editor_do_color" value="on" class="cmn-toggle cmn-toggle-round-flat" />
												<label for="wpgmza_theme_editor_do_color"></label>
											</div>
										</div>
									</fieldset>
									
									<!-- Color -->
									<fieldset class="wpgmza-joined-fieldset">
										<div class="wpgmza-inline-field">
											<!-- <input type="color" id="wpgmza_theme_editor_color"/> -->
											<input id="wpgmza_theme_editor_color" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#000000" />
										</div>
									</fieldset>

									<!-- Hue enabled -->
									<fieldset class="wpgmza-row">
										<div class="wpgmza-col">
											<legend><?php _e('Hue', 'wp-google-maps'); ?></legend>
										</div>
										<div class="wpgmza-col">
											<div class="switch">
												<input type="checkbox" id="wpgmza_theme_editor_do_hue" value="on" class="cmn-toggle cmn-toggle-round-flat" />
												<label for="wpgmza_theme_editor_do_hue"></label>
											</div>
										</div>
									</fieldset>
									
									<!-- Hue Color -->
									<fieldset class="wpgmza-joined-fieldset">
										<div class="wpgmza-inline-field">
											<!-- <input type="color" id="wpgmza_theme_editor_hue"/> -->
											<input id="wpgmza_theme_editor_hue" type="text" data-support-palette="false" data-support-alpha="false" data-container=".map_wrapper" class="wpgmza-color-input" value="#000000"/>
										</div>
									</fieldset>

									<!-- Invert -->
									<fieldset id="wpgmza-theme-editor__invert-lightness" class="wpgmza-row">
										<div class="wpgmza-col">
											<legend><?php _e('Invert Lightness', 'wp-google-maps'); ?></legend>
										</div>

										<div class="wpgmza-col">
											<div class="switch">
												<input type="checkbox" id="wpgmza_theme_editor_do_invert_lightness" class="cmn-toggle cmn-toggle-round-flat" />
												<label for="wpgmza_theme_editor_do_invert_lightness"></label>
											</div>
										</div>
									</fieldset>
								</div>
							</div>
						</div>

						<div id="wpgmza-ol-theme-editor" class="" data-wpgmza-require-engine="open-layers">
							<fieldset>
								<input type='text' name='wpgmza_ol_tile_filter' class="wpgmza-css-filter-input" />
							</fieldset>

							<!-- Hints -->
							<div class="hint">
								<?php _e("Note: OpenLayers themes are powered by CSS filters. For more granular control, consider an alternate tile server instead", "wp-google-maps"); ?>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Themes - Editor Tab -->
				<div class="grouping" data-group="map-settings-themes-manual">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-themes'></div>
						<?php _e('Theme Data', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<div class="wpgmza_theme_data_container">
							<!-- Theme data -->
							<fieldset>
								<legend><?php _e('Theme Data', 'wp-google-maps'); ?></legend>
								<textarea name="wpgmza_theme_data"></textarea>
							</fieldset>

							<!-- Hints -->
							<div class="hint">
								<?php _e("You can paste JSON style into the block above to theme data from our library or the Google Maps theme editor", "wp-google-maps"); ?>
							</div>

							<div class="hint">
								<?php
									echo sprintf(__('Looking for more themes? <a href="%s" target="_BLANK">Browse our theme directory</a>.', 'wp-google-maps'), 'https://www.wpgmaps.com/themes/');
								?>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Themes - Custom OL Tile Tab -->
				<div class="grouping" data-group="map-settings-themes-custom-tile">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-themes'></div>
						<?php _e('Custom Image', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<p class='notice wpgmza-shadow wpgmza-card wpgmza-pos-relative'>
							<?php
								_e("You will need to save your map to view changes to custom map images", "wp-google-maps");
							?>
						</p>
						
						<!-- Custom Image Toggle -->
						<fieldset class="wpgmza-row wpgmza-pro-feature">
							<div class="wpgmza-col">
								<legend><?php _e("Enable Custom Image", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col">
								<div class="switch">
									<input type='checkbox' id='custom_tile_enabled' name='custom_tile_enabled' class='postform cmn-toggle cmn-toggle-round-flat'/>
									<label for='custom_tile_enabled'  data-on='<?php esc_attr_e("Yes", "wp-google-maps"); ?>'  data-off='<?php esc_attr_e("No", "wp-google-maps"); ?>'></label>
								</div>
							</div>
						</fieldset>

						<!-- Custom Image Tile -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php esc_html_e("Image", "wp-google-maps"); ?></legend>
							<input type="text" name='custom_tile_image' class="wpgmza-image-single-input" />
						</fieldset>

						<!-- Custom Image Width -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature">
							<div class="wpgmza-col">
								<legend><?php esc_html_e("Width (px)", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col">
								<input type="number" name='custom_tile_image_width' />
							</div>
						</fieldset>

						<!-- Custom Image height -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature">
							<div class="wpgmza-col">
								<legend><?php esc_html_e("Height (px)", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col">
								<input type="number" name='custom_tile_image_height' />
							</div>
						</fieldset>

						<!-- Custom Image Attribution -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature">
							<div class="wpgmza-col">
								<legend><?php esc_html_e("Attribution", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col">
								<input type="text" name='custom_tile_image_attribution' />
							</div>
						</fieldset>



					</div>
				</div>

				<!-- Map Settings - Info Windows Tab -->
				<div class="grouping" data-group="map-settings-info-windows">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Info Windows', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=iw-style-atlas-novus">
							Change styles</a> with the Pro version. Support and updates included forever', 'wp-google-maps');
							?>
						</div>

						<!-- Info-window Selector -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Style", "wp-google-maps"); ?></legend>
							
							<div class='wpgmza-infowindow-style-picker'>
								<div class="wpgmza-row">
									<!-- Default Info Window -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_iw_type" value="0" class="wpgmza-pro-feature"/>
										
										<div class='wpgmza-card wpgmza-shadow'>
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_1.png'; ?>');"></div>
											<span><?php _e('Default', 'wp-google-maps');?></span>
										</div>
									</label>
										
									<!-- Modern Info Window -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_iw_type" value="4" class="wpgmza-pro-feature"/>
										
										<div class='wpgmza-card wpgmza-shadow'>
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_3.png'; ?>');"></div>
											<span><?php _e('Panel', 'wp-google-maps'); ?></span>
										</div>
									</label>

									<!-- Global Info Window -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_iw_type" value="-1" class="wpgmza-pro-feature"/>
										
										<div class='wpgmza-card wpgmza-shadow'>
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_inherit.png'; ?>');"></div>
											<span><?php _e('Global', 'wp-google-maps'); ?></span>
										</div>
									</label>
								</div>
							</div>
						</fieldset>

						<!-- Info Window Colors -->
						<!-- Not relevant in Atlas Novus, but we will keep it here for now -->
						<fieldset id="iw_custom_colors_row" class="wpgmza-hidden">
							<legend><?php _e("Infowindow Colors", "wp-google-maps"); ?></legend>
							
							<ul>
								<li>
									<input id="iw_primary_color" name="iw_primary_color" type="color"/>
									<label for="iw_primary_color">
										<?php _e('Primary Color', 'wp-google-maps'); ?>
									</label>
								</li>
								<li>
									<input id="iw_accent_color" name="iw_accent_color" type="color"/>
									<label for="iw_accent_color"><?php _e('Accent Color', 'wp-google-maps'); ?></label>
								</li>
								<li>
									<input id="iw_text_color" name="iw_text_color" type="color"/>
									<label for="iw_text_color"><?php _e('Text Color', 'wp-google-maps'); ?></label>
								</li>
							</ul>
						</fieldset>

						<!-- Close Infowindow on Map Click -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Close InfoWindow on Map Click", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch'>
									<input type="checkbox"
										id="close_infowindow_on_map_click"
										name="close_infowindow_on_map_click"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="close_infowindow_on_map_click"></label>
								</div>
							</div>
						</fieldset>

						<!-- Close Infowindow on Map Click -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Allow users to share marker links", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch'>
									<input type="checkbox"
										id="marker_share_links"
										name="marker_share_links"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="marker_share_links"></label>
								</div>
							</div>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Marker Listing Tab -->
				<div class="grouping" data-group="map-settings-marker-listings">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Marker Listing', 'wp-google-maps'); ?>
					</div>

					<div class="navigation">
						<div class="item caret-right" data-group="map-settings-marker-listings-general">
							<?php _e("General", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-marker-listings-filtering">
							<?php _e("Filtering", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>
						
						<div class="item caret-right" data-group="map-settings-marker-listings-datatables">
							<?php _e("DataTables", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>
										
						<div class="upsell-block auto-rotate">
							<!-- Upsell card - Marker Listings --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/marker-listing.webp');" 
										 title="<?php _e("List your markers in many different styles with your map!", "wp-google-maps"); ?>"
										 alt="<?php _e("List your markers in many different styles with your map!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add marker listings to your maps with our Pro version!", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Up to six styles!", "wp-google-maps"); ?></li>
											<li><?php _e("Control sorting order, filters and pagination.", "wp-google-maps"); ?></li>
											<li><?php _e("Interactive and customizable!", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker-listing-focus-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Marker Listing - Style Tab -->
				<div class="grouping" data-group="map-settings-marker-listings-general">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-marker-listings'></div>
						<?php _e('General', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable Marker Listing with the <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing-atlas-novus" target="_BLANK">Pro version for only $39.99 once off</a>. Support and updates included forever.', "wp-google-maps");
							?>
						</div>

						<!-- Style -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e('Style', 'wp-google-maps'); ?></legend>
							
							<div class="wpgmza-marker-listing-style-menu">
								<div class="wpgmza-row">
									<!-- Disabled -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="0" checked="checked"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_0.png; ?>');"></div>
											<span><?php _e('Disabled', 'wp-google-maps'); ?></span>
										</div>
									</label>

									<!-- Basic List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="4"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_2.png; ?>');"></div>
											<span><?php _e('Basic List', 'wp-google-maps'); ?></span>
										</div>
									</label>
								</div>

								<div class="wpgmza-row">
									<!-- Basic Table -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="1"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_1.png; ?>');"></div>
											<span><?php _e('Basic Table', 'wp-google-maps'); ?></span>
										</div>
									</label>


									<!-- Advanced List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="2"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_3.png; ?>');"></div>
											<span><?php _e('Advanced Table', 'wp-google-maps'); ?></span>
										</div>
									</label>
								</div>

								<div class="wpgmza-row">
									<!-- Carousel List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="3"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_4.png; ?>');"></div>
											<span><?php _e('Carousel', 'wp-google-maps'); ?></span>
										</div>
									</label>

									<!-- Grid List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="7"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_grid.png; ?>');"></div>
											<span><?php _e('Grid', 'wp-google-maps'); ?></span>
										</div>
									</label>
								</div>

								<div class="wpgmza-row">
									<!-- Panel List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="8"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_modern.png; ?>');"></div>
											<span><?php _e('Panel', 'wp-google-maps'); ?></span>
										</div>
									</label>

									<div class="wpgmza-col">
										<!-- Even distribution block -->
									</div>
								</div>
								
							</div>
						</fieldset>

						<!-- Placement -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<legend><?php _e("Placement", "wp-google-maps"); ?></legend>
							<!-- Only available and supported by Atlas Novus (Legacy uses: wpgmza_marker_listing_position) -->
							<select name="marker_listing_component_anchor" id="marker_listing_component_anchor" class='wpgmza-anchor-control' data-default="LEFT" data-anchors="LEFT,RIGHT,ABOVE,BELOW"></select>
						</fieldset>

						<!-- Auto Open (Panel Only) -->
						<fieldset class="wpgmza-pro-feature wpgmza-row" id="marker_listing_component_auto_open_wrap">
							<div class="wpgmza-col">
								<legend><?php _e("Open by default","wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input 
										type='checkbox' 
										id='marker_listing_component_auto_open' 
										name='marker_listing_component_auto_open' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/> 
									<label for='marker_listing_component_auto_open'></label>
								</div>
							</div>
						</fieldset>

						<!-- Order -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Order markers by", "wp-google-maps"); ?></legend>
							
							<div class="wpgmza-row">
								<div class="wpgmza-col">
									<select id="order_markers_by" name="order_markers_by" class="postform wpgmza-stretch">
										<option value="1">
											<?php _e('ID', 'wp-google-maps'); ?>
										</option>
										<option value="2">
											<?php _e('Title', 'wp-google-maps'); ?>
										</option>
										<option value="3">
											<?php _e('Address', 'wp-google-maps'); ?>
										</option>
										<option value="4">
											<?php _e('Description', 'wp-google-maps'); ?>
										</option>
										<option value="5">
											<?php _e('Category', 'wp-google-maps'); ?>
										</option>
										<option value="6">
											<?php _e('Category Priority', 'wp-google-maps'); ?>
										</option>
										<option value="7">
											<?php _e('Distance', 'wp-google-maps'); ?>
										</option>
										<option value="8">
											<?php _e('Rating', 'wp-google-maps'); ?>
										</option>
									</select>
								</div>

								<div class="wpgmza-col">
									<select id="order_markers_choice" name="order_markers_choice" class="wpgmza-stretch">
										<option value="1">
											<?php _e("Ascending", "wp-google-maps"); ?>
										</option>
										<option value="2">
											<?php _e("Descending", "wp-google-maps"); ?>
										</option>
									</select>
								</div>
							</div>
						</fieldset>

						<!-- Pagination Style -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Select different pagination style", "wp-google-maps"); ?></legend>
							
							<select id="dataTable_pagination_style" name="dataTable_pagination_style" class="postform">
								<option value="default">
									<?php _e("Default", "wp-google-maps"); ?>
								</option>
								<option value="page-number-buttons-only">
									<?php _e('Page number buttons only', 'wp-google-maps'); ?>
								</option>
								<option value="prev-and-next-buttons-only">
									<?php _e('Previous and Next buttons only', 'wp-google-maps'); ?>
								</option>
								<option value="prev-and-next-buttons-plus-page-numbers">
									<?php _e('Previous and Next buttons, plus page numbers', 'wp-google-maps'); ?>
								</option>
								<option value="first-prev-next-and-last-buttons">
									<?php _e('First, Previous, Next and Last buttons', 'wp-google-maps'); ?>
								</option>
								<option value="first-prev-next-and-last-buttons-plus-page-numbers">
									<?php _e('First, Previous, Next and Last buttons, plus page numbers', 'wp-google-maps'); ?>
								</option>
								<option value="first-and-last-buttons-plus-page-numbers">
									<?php _e('First and Last buttons, plus page numbers', 'wp-google-maps'); ?>
								</option>
								<option value="hidden">
									<?php _e('Hidden', 'wp-google-maps'); ?>
								</option>
							</select>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Marker Listing - Filtering Tab -->
				<div class="grouping" data-group="map-settings-marker-listings-filtering">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-marker-listings'></div>
						<?php _e('Filtering', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable Marker Listing with the <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing-atlas-novus" target="_BLANK">Pro version for only $39.99 once off</a>. Support and updates included forever.', "wp-google-maps");
							?>
						</div>

						<!-- Category Filter -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Category Filter", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch'>
									<input id='filterbycat' 
										name='filterbycat' 
										class='cmn-toggle cmn-toggle-round-flat' 
										type='checkbox' value='1'/>
									<label for='filterbycat'></label>
								</div>
							</div>
						</fieldset>

						<!-- Placement -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<legend><?php _e("Category Filter Placement", "wp-google-maps"); ?></legend>
							<!-- Only available and supported by Atlas Novus (Legacy uses: wpgmza_marker_listing_position) -->
							<select name="category_filter_component_anchor" id="category_filter_component_anchor" class='wpgmza-anchor-control' data-default="TOP" data-anchors-exclude="LEFT,RIGHT"></select>
						</fieldset>

						<!-- Change marker listing click -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Override Listing Click Zoom Level", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox'
										id='zoom_level_on_marker_listing_override' 
										name='zoom_level_on_marker_listing_override' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for="zoom_level_on_marker_listing_override"></label>
								</div>
							</div>
						</fieldset>

						<!-- Zoom slider -->
						<fieldset  class="wpgmza-zoom-on-marker-listing-click-zoom-level" id="zoom_level_on_marker_listing_click_level" style="display: none;">
							<legend><?php _e("Zoom Level", "wp-google-maps"); ?></legend>

							<input name="zoom_level_on_marker_listing_click" style="display: none;" type="text" id="zoom_level_on_marker_listing_click">
							<div id="zoom-on-marker-listing-click-slider"></div> 
						</fieldset>

						<!-- Disable zoom on marker listing click -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Disable Zoom On Listing Click", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox'
										id='marker_listing_disable_zoom' 
										name='marker_listing_disable_zoom' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for="marker_listing_disable_zoom"></label>
								</div>
							</div>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Marker Listing - Datatables Tab -->
				<div class="grouping" data-group="map-settings-marker-listings-datatables">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-marker-listings'></div>
						<?php _e('DataTables', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable Marker Listing with the <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing-datatables-atlas-novus" target="_BLANK">Pro version for only $39.99 once off</a>. Support and updates included forever.', "wp-google-maps");
							?>
						</div>

						<!-- No Results -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("No results message", "wp-google-maps"); ?></legend>
							<input type="text" 
							name="datatable_no_result_message" 
							id="datatable_no_result_message" 
							placeholder='<?php esc_attr_e('No matching records found', 'wp-google-maps'); ?>'
							/>
						</fieldset>

						<!-- Remove search -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Remove search box", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col">
								<div class='switch'>
									<input id='remove_search_box_datables' 
										name='remove_search_box_datables' 
										class='cmn-toggle cmn-toggle-round-flat' 
										type='checkbox' value='1'/>
									<label for='remove_search_box_datables'></label>
								</div>
							</div>
						</fieldset>

						<!-- Search title -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Change listing table search string", "wp-google-maps"); ?> </legend>
							
							<input type="text" 
							name="datatable_search_string" 
							id="datatable_search_string" 
							placeholder='<?php esc_attr_e('Search:', 'wp-google-maps'); ?>'
							/>
						</fieldset>

						<!-- Results strings --> 
						<fieldset id="datable_strings" class="wpgmza-pro-feature">
							<legend><?php _e("Change results string", "wp-google-maps"); ?></legend>
							
							<ul>
								<li>
									<div class="wpgmza-inline-field">
										<?php esc_attr_e('Showing:', 'wp-google-maps'); ?>		
										<input type="text" 
											name="datatable_result_start" 
											id="datatable_result_start" 
											placeholder='<?php esc_attr_e('Showing', 'wp-google-maps'); ?>'
											/>
									</div>
								</li>

								<li>
									<div class="wpgmza-inline-field">
										<?php esc_attr_e('Of:', 'wp-google-maps'); ?>
										<input type="text" 
											name="datatable_result_of" 
											id="datatable_result_of" 
											placeholder='<?php esc_attr_e('of', 'wp-google-maps'); ?>'
											/>
									</div>
								</li>

								<li>
									<div class="wpgmza-inline-field">
										<?php esc_attr_e('To:', 'wp-google-maps'); ?>
										<input type="text" 
											name="datatable_result_to" 
											id="datatable_result_to" 
											placeholder='<?php esc_attr_e('to', 'wp-google-maps'); ?>'
											/>
									</div>
								</li>

								<li>
									<div class="wpgmza-inline-field">
										<?php esc_attr_e('Entries:', 'wp-google-maps'); ?>
										<input type="text" 
											name="datatable_result_total" 
											id="datatable_result_total" 
											placeholder='<?php esc_attr_e('entries', 'wp-google-maps'); ?>'
											/>
									</div>
								</li>
							</ul>
						</fieldset>

						<!-- Entries -->
						<fieldset id="datable_strings_entries" class="wpgmza-pro-feature">
							<legend><?php _e("Entires:", "wp-google-maps"); ?></legend>
							<ul>
								<li>
									<div class="wpgmza-inline-field">
										<?php esc_attr_e('Show:', 'wp-google-maps'); ?>
										<input type="text" 
											name="datatable_result_show" 
											id="datatable_result_show" 
											placeholder='<?php esc_attr_e('Show:', 'wp-google-maps'); ?>'
											/>
									</div>
								</li>

								<li>
									<div class="wpgmza-inline-field">
										<?php esc_attr_e('Entries', 'wp-google-maps'); ?>
										<input type="text" 
											name="datatable_result_entries" 
											id="datatable_result_entries" 
											placeholder='<?php esc_attr_e('Entries', 'wp-google-maps'); ?>'
											/>		
									</div>
								</li>
							</ul>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Category Legends Tab -->
				<div class="grouping" data-group="map-settings-category-legends">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Category Legends', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable category legends with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=category-legends-atlas-novus">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Enabled field -->
						<fieldset class="wpgmza-row wpgmza-pro-feature">
							<div class="wpgmza-col">
								<legend><?php _e("Enable Category Legends", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class="switch">
									<input type='checkbox' id='category_legends_enabled' name='category_legends_enabled' class='postform cmn-toggle cmn-toggle-round-flat'/>
									<label for='category_legends_enabled'  data-on='<?php esc_attr_e("Yes", "wp-google-maps"); ?>'  data-off='<?php esc_attr_e("No", "wp-google-maps"); ?>'></label>
								</div>
							</div>
						</fieldset>

						<!-- Placement -->
						<fieldset class="wpgmza-row wpgmza-pro-feature">
							<legend><?php _e("Placement", "wp-google-maps"); ?></legend>
							<!-- Only available and supported by Atlas Novus (Legacy uses: wpgmza_store_locator_position) -->
							<select name="category_legends_component_anchor" id="category_legends_component_anchor" class='wpgmza-anchor-control' data-default="BOTTOM_RIGHT" data-anchors-exclude="LEFT,RIGHT"></select>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Behavious Tab -->
				<div class="grouping" data-group="map-settings-behaviour">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Behaviour', 'wp-google-maps'); ?>
					</div>

					<div class="navigation">
						<div class="item caret-right" data-group="map-settings-behaviour-marker">
							<?php _e("Marker", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-behaviour-shapes">
							<?php _e("Shapes", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-behaviour-bounds">
							<?php _e("Bounds", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-behaviour-user-location">
							<?php _e("User Location", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-behaviour-streetview" data-wpgmza-require-engine="google-maps">
							<?php _e("Street View", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php echo __("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>
						
						<div class="upsell-block auto-rotate">
							<!-- Upsell card - Behaviour --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/custom-markers.webp');" 
										 title="<?php _e("Add behaviour controls!", "wp-google-maps"); ?>"
										 alt="<?php _e("Add behaviour controls!", "wp-google-maps"); ?>">
								</div>

								<div class="upsell-block-card-content"> 
									<div class="upsell-block-card-header">
										<div class="upsell-block-card-header-title">
											<?php _e("Add behaviour controls with our Pro version!", "wp-google-maps");  ?>
										</div>
									</div>
									<div class="upsell-block-card-list">
										<ul>
											<li><?php _e("Fit map to bounds, or focus on user location!", "wp-google-maps"); ?></li>
											<li><?php _e("Add shape labels, and start in streetview.", "wp-google-maps"); ?></li>
										</ul>
									</div>

									<div class="upsell-block-card-actions">
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-focus-card-atlas-novus" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Learn more","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Behaviour - Marker Tab -->
				<div class="grouping" data-group="map-settings-behaviour-marker">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'></div>
						<?php _e('Marker', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-marker-atlas-novus">
							Edit behaviour</a> with the Pro version. Support and updates included forever', 'wp-google-maps');
							?>
						</div>

						<!-- Jump to nearest -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Jump to nearest marker on initialization?", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch'>
									<input 
										type='checkbox' 
										id='wpgmza_jump_to_nearest_marker_on_initialization' 
										name='jump_to_nearest_marker_on_initialization' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for='wpgmza_jump_to_nearest_marker_on_initialization'></label>
								</div>
							</div>
						</fieldset>

						<!-- Geolocation Notice -->
						<div class="wpgmza-geolocation-setting"></div>

						<!-- Click marker opens links -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Click marker opens link", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox' 
										id='wpgmza_click_open_link' 
										name='click_open_link' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for='wpgmza_click_open_link'
										data-on='<?php _e("Yes", "wp-google-maps"); ?>' 
										data-off='<?php _e("No", "wp-google-maps"); ?>'>
									</label>
								</div>
							</div>
						</fieldset>

						<!-- Zoom on click -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Zoom on marker click", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox' 
										id='wpgmza_zoom_on_marker_click' 
										name='wpgmza_zoom_on_marker_click' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
									<label for='wpgmza_zoom_on_marker_click' 
										data-on='<?php _e("Yes", "wp-google-maps"); ?>'
										data-off='<?php _e("No", "wp-google-maps"); ?>'>
									</label>
								</div>
							</div>
						</fieldset>

						<!-- Marker click zoom level -->
						<fieldset class="wpgmza-zoom-on-marker-click-zoom-level" id="wpgmza_zoom_on_marker_click_zoom_level" style="display: none;">
							<legend><?php _e("Zoom Level", "wp-google-maps"); ?></legend>
							
							<input name="wpgmza_zoom_on_marker_click_slider" style="display: none;" type="text" id="wpgmza_zoom_on_marker_click_slider">
							<div id="zoom-on-marker-click-slider"></div> 
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Behaviour - Shapes Tab -->
				<div class="grouping" data-group="map-settings-behaviour-shapes">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'></div>
						<?php _e('Shapes', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-polygon-atlas-novus">
							Edit behaviour</a> with the Pro version. Support and updates included forever', 'wp-google-maps');
							?>
						</div>

						<!-- Labels "data-wpgmza-require-engine="google-maps"" Removed  -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Enable Shape Labels", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type="checkbox"
										id="polygon_labels"
										name="polygon_labels"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="polygon_labels"></label>
								</div>
							</div>
						</fieldset>

						<!-- Info windows -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Disable Shape InfoWindows", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type="checkbox"
										id="disable_polygon_info_windows"
										name="disable_polygon_info_windows"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="disable_polygon_info_windows"></label>
								</div>
							</div>
						</fieldset>
					</div>
				</div>						

				<!-- Map Settings - Behaviour - Bounds Tab -->
				<div class="grouping" data-group="map-settings-behaviour-bounds">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'></div>
						<?php _e('Bounds', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-bounds-atlas-novus">
							Edit behaviour</a> with the Pro version. Support and updates included forever', 'wp-google-maps');
							?>
						</div>

						<!-- Fit bouds to markers at page load -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend> <?php _e("Fit map bounds to markers", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox' 
										id='wpgmza_fit_maps_bounds_to_markers' 
										name='fit_maps_bounds_to_markers' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for='wpgmza_fit_maps_bounds_to_markers'
										data-on='<?php _e("Yes", "wp-google-maps"); ?>' 
										data-off='<?php _e("No", "wp-google-maps"); ?>'>
									</label>
								</div>
							</div>
						</fieldset>

						<!-- Fit markers to bounds after filtering -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Fit map bounds to markers after filtering", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox' 
										id='wpgmza_fit_maps_bounds_to_markers_after_filtering' 
										name='fit_maps_bounds_to_markers_after_filtering' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for='wpgmza_fit_maps_bounds_to_markers_after_filtering'
										data-on='<?php _e("Yes", "wp-google-maps"); ?>' 
										data-off='<?php _e("No", "wp-google-maps"); ?>'>
									</label>
								</div>
							</div>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Behaviour - User Location Tab -->
				<div class="grouping" data-group="map-settings-behaviour-user-location">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'></div>
						<?php _e('User Location', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-user-loc-atlas-novus">
							Edit behaviour</a> with the Pro version. Support and updates included forever', 'wp-google-maps');
							?>
						</div>

						<!-- Show user location -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Show User's Location?", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch wpgmza-geolocation-setting'>
									<input 
										type='checkbox' 
										id='wpgmza_show_user_location' 
										name='show_user_location' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/> 
									<label for='wpgmza_show_user_location'></label>
								</div>
							</div>
						</fieldset>

						<!-- User locatio icon -->
						<fieldset class="wpgmza-user-location-marker-icon-picker-container wpgmza-pro-feature" id="wpgmza_show_user_location_conditional" style="display: none;">
							<legend><?php _e("Default User Location Icon", "wp-google-maps"); ?></legend>
						</fieldset>

						<!-- Pan to user -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Automatically pan to users location?", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch wpgmza-geolocation-setting'>
									<input type='checkbox'
										id='wpgmza_automatically_pan_to_users_location' 
										name='automatically_pan_to_users_location' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for="wpgmza_automatically_pan_to_users_location"></label>
								</div>
							</div>
						</fieldset>

						<!-- Change user location pan -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Override User Location Zoom Level", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch wpgmza-geolocation-setting'>
									<input type='checkbox'
										id='wpgmza_override_users_location_zoom_level' 
										name='override_users_location_zoom_level' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for="wpgmza_override_users_location_zoom_level"></label>
								</div>
							</div>
						</fieldset>

						<!-- Zoom slider -->
						<fieldset  class="wpgmza-override-users-location-zoom-levels" id="wpgmza_override_users_location_zoom_levels_slider" style="display: none;">
							<legend><?php _e("Zoom Level", "wp-google-maps"); ?></legend>

							<input name="override_users_location_zoom_levels" style="display: none;" type="text" id="override_users_location_zoom_levels_slider">
							<div id="override-users-location-zoom-levels-slider"></div> 
						</fieldset>

						<!-- Show distance from location -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Show distance from location?", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch wpgmza-geolocation-setting'>
									<input type='checkbox' 
										id='wpgmza_show_distance_from_location' 
										name='show_distance_from_location'
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'
										value='1'/>
									
									<label 
										for='wpgmza_show_distance_from_location'
										data-on='<?php _e("Yes", "wp-google-maps"); ?>'
										data-off='<?php _e("No", "wp-google-maps"); ?>'>
									</label>
								</div>
							</div>
						</fieldset>


						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable user geolocation features with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=general-user-loc-atlas-novus">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>
					</div>
				</div>

				<!-- Map Settings - Behaviour - Streetview Tab -->
				<div class="grouping" data-group="map-settings-behaviour-streetview">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'></div>
						<?php _e('Street View', 'wp-google-maps'); ?>
					</div>

					<div class="settings" >
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable street view features with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=streetview-atlas-novus">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Start in Streetview toggle -->
						<fieldset class="wpgmza-row wpgmza-pro-feature">
							<div class="wpgmza-col">
								<legend><?php _e("Map starts in Street View", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col">
								<div class="switch">
									<input type='checkbox' id='map_starts_in_streetview' name='map_starts_in_streetview' class='postform cmn-toggle cmn-toggle-round-flat'/>
									<label for='map_starts_in_streetview'  data-on='<?php esc_attr_e("Yes", "wp-google-maps"); ?>'  data-off='<?php esc_attr_e("No", "wp-google-maps"); ?>'></label>
								</div>
							</div>
						</fieldset>

						<!-- Streetview starting point editor -->
						<fieldset class="wpgmza-pro-feature streetview-starting-editor">
							<div class="wpgmza-row align-center">
								<div class="wpgmza-col">
									<legend><?php _e("Starting Point", "wp-google-maps"); ?></legend>
								</div>
								<div class="wpgmza-col wpgmza-text-align-right">
									<div class="wpgmza-button streetview-edit-button" 
										data-add="<?php _e("Add Point", "wp-google-maps"); ?>" 
										data-edit="<?php _e("Edit", "wp-google-maps"); ?>"
										data-editing="<?php _e("Stop Editing", "wp-google-maps"); ?>"> 
											<?php _e("Add", "wp-google-maps"); ?>
									</div>

									<div class="wpgmza-button streetview-preview-button"
										data-preview="<?php _e("Preview", "wp-google-maps"); ?>"
										data-open="<?php _e("View", "wp-google-maps"); ?>">
										<?php _e("Preview", "wp-google-maps"); ?>
									</div>
								</div>
							</div>

							<div class="streetview-starting-poisition-info">
								<div class="wpgmza-row align-center">
									<div class="wpgmza-col">
										<legend><?php _e("Position", "wp-google-maps"); ?></legend>
									</div>
									<div class="wpgmza-col">
										<input type="text" name="map_starts_in_streetview_location" readonly>
									</div>
								</div>

								<div class="wpgmza-row align-center">
									<div class="wpgmza-col">
										<legend><?php _e("Heading", "wp-google-maps"); ?></legend>
									</div>
									<div class="wpgmza-col">
										<input type="text" name="map_starts_in_streetview_heading" readonly>
									</div>
								</div>

								<div class="wpgmza-row align-center">
									<div class="wpgmza-col">
										<legend><?php _e("Pitch", "wp-google-maps"); ?></legend>
									</div>
									<div class="wpgmza-col">
										<input type="text" name="map_starts_in_streetview_pitch" readonly>
									</div>
								</div>
							</div>
							
							<div class="wpgmza-row streetview-help-box">
								<div class="wpgmza-col">
									<div class="wpgmza-shadow wpgmza-card wpgmza-pos-relative notice-warning" data-help-type='add'>
										<?php _e("Drag the street view pegman onto the map to set your starting location.", "wp-google-maps"); ?>
									</div>

									<div class="wpgmza-shadow wpgmza-card wpgmza-pos-relative notice-warning" data-help-type='edit'>
										<?php _e("Drag the street view pegman onto the map change starting location, or enter street view and move to a preferred location.", "wp-google-maps"); ?>
									</div>
								</div>
							</div>
						</fieldset>

					</div>
				</div>

				<!-- Map Settings - Advanced Tab -->
				<div class="grouping" data-group="map-settings-advanced">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Advanced', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Zoom Min -->
						<fieldset>
							<legend><?php _e("Maximum Zoom Out Level", "wp-google-maps"); ?></legend>
							
							<input id='wpgmza_max_zoom' 
								name='map_max_zoom'
								min="0"
								max="21"
								step="1"
								value="21"
								type="number"
								placeholder="1 - 21" />
						</fieldset>
						
						<!-- Zoom Max -->
						<fieldset>
							<legend><?php _e("Maximum Zoom In Level", "wp-google-maps"); ?></legend>
							<input id='wpgmza_min_zoom' 
								name='map_min_zoom'
								min="0"
								max="21"
								step="1"
								value="0"
								type="number"
								placeholder="1 - 21" />
						</fieldset>

						<!-- Hide POI -->
						<fieldset class="wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Hide point of interest", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox'
										id='wpgmza_hide_point_of_interest' 
										name='hide_point_of_interest' 
										class='postform cmn-toggle cmn-toggle-round-flat'/>
									<label for='wpgmza_hide_point_of_interest' 
										data-on='<?php _e("Yes", "wp-google-maps"); ?>'
										data-off='<?php _e("No", "wp-google-maps"); ?>'>
									</label>
								</div>
							</div>
						</fieldset>

						<fieldset id="advanced-settings-marker-icon-picker-container">
							<legend><?php _e("Default Marker Image", "wp-google-maps"); ?></legend>
						</fieldset>
							
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable custom marker icons with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced-markers-atlas-novus">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Layers -->
						<fieldset>
							<legend><?php _e('Map Layers', 'wp-google-maps'); ?></legend>
							
							<ul>
								<li>
									<div class='switch switch-inline'>
										<input type='checkbox' 
											id='wpgmza_bicycle' 
											name='bicycle' 
											class='postform cmn-toggle cmn-toggle-round-flat'>
										<label for='wpgmza_bicycle'></label>
										<label for='wpgmza_bicycle'>
											<?php
											_e("Bicycle Layer","wp-google-maps");
											?>
										</label>
									</div>
								</li>

								<li>
									<div class='switch switch-inline'>
										<input type='checkbox' 
											id='wpgmza_traffic' 
											name='traffic' 
											class='postform cmn-toggle cmn-toggle-round-flat'>
										<label for='wpgmza_traffic'></label>
										<label for='wpgmza_traffic'>
											<?php
											_e("Traffic Layer","wp-google-maps");
											?>
										</label>
									</div>
								</li>

								<li>
									<div class='switch switch-inline'>
										<input type='checkbox' 
											id='wpgmza_transport' 
											name='transport_layer' 
											class='postform cmn-toggle cmn-toggle-round-flat'>
										<label for='wpgmza_transport'></label>
										<label for='wpgmza_transport'>
											<?php
											_e("Transit Layer","wp-google-maps");
											?>
										</label>
									</div>
								</li>
							</ul>
							<div class='wpgmza-open-layers-feature-unavailable'></div>
						</fieldset>

						<!-- Disable lightbox -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Disable lightbox for marker images", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch'>
									<input type="checkbox"
										id="disable_lightbox_images"
										name="disable_lightbox_images"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="disable_lightbox_images"></label>
								</div>
							</div>
						</fieldset>

						<!-- Raw JPEG -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Use Raw JPEG coordinates?", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<div class='switch'>
									<input type="checkbox"
										id="use_Raw_Jpeg_Coordinates"
										name="use_Raw_Jpeg_Coordinates"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="use_Raw_Jpeg_Coordinates"></label>
								</div>
							</div>
						</fieldset>

						<!-- Marker Ratings -->
						<fieldset id="wpgmza-marker-ratings" class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e('Enable Marker Ratings', 'wp-google-maps'); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type='checkbox' 
										id='enable_marker_ratings' 
										name='enable_marker_ratings' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for='enable_marker_ratings'></label>
								</div>
							</div>
						</fieldset>


						<!-- KML -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("KML/GeoRSS URL", "wp-google-maps"); ?></legend>
							
							<input id='wpgmza_kml' name='kml' type='text' class='regular-text wpgmza-pro-feature'/>
							
							<div class="hint">
									<?php
									_e("The KML/GeoRSS layer will over-ride most of your map settings","wp-google-maps");
									
									_e("For multiple sources, separate each one by a comma.","wp-google-maps");
									?>
							</div>
						</fieldset>

						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							echo sprintf(
								__(
								'Get the rest of these advanced features with the Pro version for only <a href="%s" target="_BLANK">$39.99 once off</a>. Support and updates included forever.',
								"wp-google-maps"
								),
								"https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced-atlas-novus"
							);
							?>
						</div>
					</div>
				</div>

				<!-- Map Settings - Integrations Tab -->
				<div class="grouping" data-group="map-settings-integrations">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Integrations', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=integrations-atlas-novus">
							Enable integrations</a> with the Pro version. Support and updates included forever', 'wp-google-maps');
							?>
						</div>
						<!-- Load integrations -->
						<fieldset id="wpgmza-integration-panel-container" class="wpgmza-pro-feature wpgmza-pro-feature-hide">
							<legend><?php _e("Integration", "wp-google-maps"); ?></legend>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Beta Tab -->
				<div class="grouping" data-group="map-settings-beta">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Beta Features', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Load in viewport -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<div class="wpgmza-col">
								<legend><?php _e("Only load markers within viewport", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col">
								<div class='switch'>
									<input type="checkbox"
										id="only_load_markers_within_viewport"
										name="only_load_markers_within_viewport"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="only_load_markers_within_viewport"></label>
								</div>
							</div>
						</fieldset>
						
						<div class="hint"><?php _e("This feature may not work as expected with bounds specific settings", "wp-google-maps"); ?></div>
					</div>
				</div>

				<!-- Map Settings - Shortcodes Tab -->
				<div class="grouping" data-group="map-settings-shortcodes">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Shortcodes', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Map Shortcode -->
						<fieldset class="wpgmza-row align-center">
							<div class="wpgmza-col">
								<?php _e("Map", "wp-google-maps"); ?>
							</div>

							<div class="wpgmza-col wpgmza-text-align-right">
								<button class="wpgmza-button wpgmza-shortcode-button">[wpgmza id="<span></span>"]</button>
							</div>
						</fieldset>

						<!-- Map Shortcode Desc -->
						<div class="wpgmza-shortcode-description wpgmza-card wpgmza-shadow wpgmza-margin-t-10 wpgmza-hidden">
							<span><?php _e("Attributes", "wp-google-maps"); ?></span>
							<ul>
								<!-- Basic Features -->
								<li><strong>id</strong> <em><?php _e("The ID of the map you are loading (number)", "wp-google-maps"); ?></em></li>
								<li><strong>zoom</strong> <em><?php _e("Starting zoom level (number)", "wp-google-maps"); ?></em></li>
								<li><strong>width</strong> <em><?php _e("Width of the container (number)", "wp-google-maps"); ?></em></li>
								<li><strong>height</strong> <em><?php _e("Height of the container (number)", "wp-google-maps"); ?></em></li>
								<li><strong>marker</strong> <em><?php _e("Marker you would like to focus (number)", "wp-google-maps"); ?></em></li>
								
								<li><strong>classname</strong> <em><?php _e("CSS class to add to wrapper (string)", "wp-google-maps"); ?></em></li>
								
								<!-- Pro Features -->
								<li class="wpgmza-pro-feature-hide"><strong>mashup</strong> <em><?php _e("Indicates this is a mashup (true|false)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>parent_id</strong> <em><?php _e("Mashup parent map ID (number)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>mashup_ids</strong> <em><?php _e("Mashup map ID's (numbers)", "wp-google-maps"); ?></em></li>
								
								<li class="wpgmza-pro-feature-hide"><strong>cat</strong> <em><?php _e("Starting map category ID (number)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>lat</strong> <em><?php _e("Starting map latitude (number)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>lng</strong> <em><?php _e("Starting map longitude (number)", "wp-google-maps"); ?></em></li>

								<li class="wpgmza-pro-feature-hide"><strong>mark_center</strong> <em><?php _e("Place a marker at the center of the map (true|false)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>enable_category</strong> <em><?php _e("Enable category filter module (true|false)", "wp-google-maps"); ?></em></li>
								
								<li class="wpgmza-pro-feature-hide"><strong>directions_from</strong> <em><?php _e("Default directions starting point (string|latlng)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>directions_to</strong> <em><?php _e("Default directions ending point (string|latlng)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>directions_waypoints</strong> <em><?php _e("Default directions waypoints (string|latlng)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>directions_auto</strong> <em><?php _e("Automatically draw directions (true|false)", "wp-google-maps"); ?></em></li>

								<li class="wpgmza-pro-feature-hide"><strong>type</strong> <em><?php _e("Map type (Google Maps) (string)", "wp-google-maps"); ?></em></li>
							</ul>
						</div>

						<!-- Store Locator Shortcode -->
						<fieldset class="wpgmza-row align-center">
							<div class="wpgmza-col">
								<?php _e("Store Locator", "wp-google-maps"); ?>
							</div>

							<div class="wpgmza-col wpgmza-text-align-right">
								<button class="wpgmza-button wpgmza-shortcode-button">[wpgmza_store_locator id="<span></span>"]</button>
							</div>
						</fieldset>

						<!-- Store Locator Shortcode Desc -->
						<div class="wpgmza-shortcode-description wpgmza-card wpgmza-shadow wpgmza-margin-t-10 wpgmza-hidden">
							<span><?php _e("Attributes", "wp-google-maps"); ?></span>
							<ul>
								<!-- Basic Features -->
								<li><strong>id</strong> <em><?php _e("The ID of the map you are loading (number)", "wp-google-maps"); ?></em></li>
								<li><strong>url</strong> <em><?php _e("Page where your map is located (link)", "wp-google-maps"); ?></em></li>
								<li><strong>default_radius</strong> <em><?php _e("Starting radius (number)", "wp-google-maps"); ?></em></li>
								<li><strong>default_address</strong> <em><?php _e("Starting address (string|latlng)", "wp-google-maps"); ?></em></li>
								
								<li><strong>classname</strong> <em><?php _e("CSS class to add to wrapper (string)", "wp-google-maps"); ?></em></li>
							</ul>
							
							<div class="hint"><?php _e("Note: You can place this shortcode on a separate page by setting the 'url' attribute to your map page location", "wp-google-maps"); ?></div>
						</div>

						<!-- Category Filter Shortcode -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature-hide">
							<div class="wpgmza-col">
								<?php _e("Category Filter", "wp-google-maps"); ?>
							</div>

							<div class="wpgmza-col wpgmza-text-align-right">
								<button class="wpgmza-button wpgmza-shortcode-button">[wpgmza_category_filter id="<span></span>"]</button>
							</div>
						</fieldset>

						<!-- Category Filter Shortcode Desc -->
						<div class="wpgmza-shortcode-description wpgmza-card wpgmza-shadow wpgmza-margin-t-10 wpgmza-hidden wpgmza-pro-feature-hide">
							<span><?php _e("Attributes", "wp-google-maps"); ?></span>
							<ul>
								<!-- Pro Features -->
								<li class="wpgmza-pro-feature-hide"><strong>id</strong> <em><?php _e("The ID of the map you are loading (number)", "wp-google-maps"); ?></em></li>
							</ul>

							<div class="hint"><?php _e("Note: Shortcode must be placed on a page with a map present", "wp-google-maps"); ?></div>
						</div>

						<!-- Category Legends Shortcode -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature-hide">
							<div class="wpgmza-col">
								<?php _e("Category Legends", "wp-google-maps"); ?>
							</div>

							<div class="wpgmza-col wpgmza-text-align-right">
								<button class="wpgmza-button wpgmza-shortcode-button">[wpgmza_category_legends id="<span></span>"]</button>
							</div>
						</fieldset>

						<!-- Category Legends Shortcode Desc -->
						<div class="wpgmza-shortcode-description wpgmza-card wpgmza-shadow wpgmza-margin-t-10 wpgmza-hidden wpgmza-pro-feature-hide">
							<span><?php _e("Attributes", "wp-google-maps"); ?></span>
							<ul>
								<!-- Pro Features -->
								<li class="wpgmza-pro-feature-hide"><strong>id</strong> <em><?php _e("The ID of the map you are loading (number)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>classname</strong> <em><?php _e("CSS class to add to wrapper (string)", "wp-google-maps"); ?></em></li>
							</ul>

							<div class="hint"><?php _e("Note: Shortcode can be placed on a separate page", "wp-google-maps"); ?></div>
						</div>

						<!-- Info Window Shortcode -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature-hide">
							<div class="wpgmza-col">
								<?php _e("Info Window", "wp-google-maps"); ?>
							</div>

							<div class="wpgmza-col wpgmza-text-align-right">
								<button class="wpgmza-button wpgmza-shortcode-button">[wpgmza_infowindow id="<span></span>"]</button>
							</div>
						</fieldset>

						<!-- Info Window Shortcode Desc -->
						<div class="wpgmza-shortcode-description wpgmza-card wpgmza-shadow wpgmza-margin-t-10 wpgmza-hidden wpgmza-pro-feature-hide">
							<span><?php _e("Attributes", "wp-google-maps"); ?></span>
							<ul>
								<!-- Pro Features -->
								<li class="wpgmza-pro-feature-hide"><strong>id</strong> <em><?php _e("The ID of the map you are loading (number)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>hide_title</strong> <em><?php _e("Hide the title (true|false)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>hide_address</strong> <em><?php _e("Hide the address (true|false)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>hide_description</strong> <em><?php _e("Hide the description (true|false)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>hide_category</strong> <em><?php _e("Hide the category (true|false)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>hide_links</strong> <em><?php _e("Hide the links (true|false)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>hide_custom_fields</strong> <em><?php _e("Hide marker fields (true|false)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>hide_image</strong> <em><?php _e("Hide image/gallery (true|false)", "wp-google-maps"); ?></em></li>
							</ul>

							<div class="hint"><?php _e("Note: Shortcode must be placed on a page with a map present", "wp-google-maps"); ?></div>
						</div>

						<!-- Marker Listing Shortcode -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature-hide">
							<div class="wpgmza-col">
								<?php _e("Marker Listing", "wp-google-maps"); ?>
							</div>

							<div class="wpgmza-col wpgmza-text-align-right">
								<button class="wpgmza-button wpgmza-shortcode-button">[wpgmza_marker_listing id="<span></span>"]</button>
							</div>
						</fieldset>

						<!-- Marker Listing Shortcode Desc -->
						<div class="wpgmza-shortcode-description wpgmza-card wpgmza-shadow wpgmza-margin-t-10 wpgmza-hidden wpgmza-pro-feature-hide">
							<span><?php _e("Attributes", "wp-google-maps"); ?></span>
							<ul>
								<!-- Pro Features -->
								<li class="wpgmza-pro-feature-hide"><strong>id</strong> <em><?php _e("The ID of the map you are loading (number)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>style_id</strong> <em><?php _e("The style ID for the listing (number)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>style_slug</strong> <em><?php _e("The style name as a slug for the listing (string)", "wp-google-maps"); ?></em></li>
							</ul>

							<div class="hint"><?php _e("Note: Shortcode must be placed on a page with a map present", "wp-google-maps"); ?></div>
						</div>

						<!-- Directions Shortcode -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature-hide">
							<div class="wpgmza-col">
								<?php _e("Directions", "wp-google-maps"); ?>
							</div>

							<div class="wpgmza-col wpgmza-text-align-right">
								<button class="wpgmza-button wpgmza-shortcode-button">[wpgmza_directions id="<span></span>"]</button>
							</div>
						</fieldset>

						<!-- Directions Shortcode Desc -->
						<div class="wpgmza-shortcode-description wpgmza-card wpgmza-shadow wpgmza-margin-t-10 wpgmza-hidden wpgmza-pro-feature-hide">
							<span><?php _e("Attributes", "wp-google-maps"); ?></span>
							<ul>
								<!-- Pro Features -->
								<li class="wpgmza-pro-feature-hide"><strong>id</strong> <em><?php _e("The ID of the map you are loading (number)", "wp-google-maps"); ?></em></li>

								<li class="wpgmza-pro-feature-hide"><strong>default_from</strong> <em><?php _e("Default directions starting point (string|latlng)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>default_to</strong> <em><?php _e("Default directions ending point (string|latlng)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>auto_run</strong> <em><?php _e("Automatically draw directions (true|false)", "wp-google-maps"); ?></em></li>
							</ul>

							<div class="hint"><?php _e("Note: Shortcode must be placed on a page with a map present", "wp-google-maps"); ?></div>
						</div>
					</div>
				</div>
				

				<!-- Map Settings - Pro Features Tab -->
				<div class="grouping" data-group="map-settings-pro">
					<div class="heading block has-back">
						<div class="item caret-left" data-group='map-settings'></div>
						<?php _e('Pro Features', 'wp-google-maps'); ?>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-shadow wpgmza-card">
							<?php _e('Get all of this and more for only $39.99 once off', 'wp-google-maps'); ?>
						</div>
						
						<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=upgradenow-atlas-novus" 
						   target="_BLANK" title="Upgrade now for only $39.99 once off" 
						   class="wpgmza-button wpgmza-button-accent wpgmza-stretch wpgmza-text-align-center" 
						   id="wpgmza-upgrade-now__btn">
								<?php esc_html_e('Upgrade Now', "wp-google-maps") ?>
						</a>

						<!-- Custom markers -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong><?php _e("Create custom markers with detailed info windows", "wp-google-maps") ?></strong>
							<p><?php _e("Add titles, descriptions, HTML, images, animations and custom icons to your markers.", "wp-google-maps") ?></p>
						</div>

						<!-- Directions -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong>Enable directions</strong>
							<p><?php _e("Allow your visitors to get directions to your markers. Either use their location as the starting point or allow them to type in an address.", "wp-google-maps") ?></p>
						</div>

						<!-- Unlimited maps -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong>Unlimited maps</strong>
							<p><?php _e('Create as many maps as you like.', "wp-google-maps") ?></p>
						</div>

						<!-- Marker Listings -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong>List your markers</strong>
							<p><?php _e('Choose between three methods of listing your markers.', "wp-google-maps") ?></p>
						</div>                                

						<!-- Categories -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong><?php _e('Add categories to your markers', "wp-google-maps") ?></strong>
							<p><?php _e('Create and assign categories to your markers which can then be filtered on your map.', "wp-google-maps") ?></p>
						</div>                                

						<!-- Advanced options -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong><?php _e('Advanced options', "wp-google-maps") ?></strong>
							<p><?php _e("Enable advanced options such as showing your visitor's location, marker sorting, bicycle layers, traffic layers and more!", "wp-google-maps") ?></p>
						</div>  
						
						<!-- Import/Export -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong><?php _e('Import / Export', "wp-google-maps") ?></strong>
							<p><?php _e('Export your markers to a CSV file for quick and easy editing. Import large quantities of markers at once.', "wp-google-maps") ?></p>
						</div>                                

						<!-- KML -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong><?php _e('Add KML &amp; Fusion Tables', "wp-google-maps") ?></strong>
							<p><?php _e('Add your own KML layers or Fusion Table data to your map', "wp-google-maps") ?></p>
						</div>                                   

						<!-- Polygons -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong><?php _e('Polygons and Polylines', "wp-google-maps") ?></strong>
							<p><?php _e('Add custom polygons and polylines to your map by simply clicking on the map. Perfect for displaying routes and serviced areas.', "wp-google-maps") ?></p>
						</div>

						<!-- Amazing support -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong><?php _e('Amazing Support', "wp-google-maps") ?></strong>
							<p><?php _e('We pride ourselves on providing quick and amazing support. <a target="_BLANK" href="http://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5">Read what some of our users think of our support</a>.', "wp-google-maps") ?></p>
						</div>

						<!-- Easy upgrade -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong><?php _e('Easy Upgrade', "wp-google-maps") ?></strong>
							<p><?php _e("You'll receive a download link immediately. Simply upload and activate the Pro plugin to your WordPress admin area and you're done!", "wp-google-maps") ?></p>
						</div>                                  

						<!-- Free updates -->
						<div class='wpgmza-card wpgmza-shadow wpgmza-pro-upsell-card'>
							<strong><?php _e('Free updates and support forever', "wp-google-maps") ?></strong>
							<p><?php _e("Once you're a pro user, you'll receive free updates and support forever! You'll also receive amazing specials on any future plugins we release.", "wp-google-maps") ?></p>
						</div>
						
						<div class="wpgmza-text-align-center">	
							<a href="https://www.wpgmaps.com/demo/" class="wpgmza-button" target="_BLANK"><?php esc_html_e('View the demos', 'wp-google-maps'); ?></a>
						</div>
						
						<br>
						<div class="wpgmza-text-align-center">
							<?php 
								_e("Have a sales question?", "wp-google-maps");
							?>
							<br>
							<?php 
								_e("Contact Nick on <a href=\"mailto:nick@wpgmaps.com\">nick@wpgmaps.com</a> or use our <a href=\"https://www.wpgmaps.com/contact-us/\" target=\"_BLANK\">contact form</a>.", "wp-google-maps");
							?>
						</div>
						
						<br>
						<div class="wpgmza-text-align-center"><?php _e("Need help? <a href=\"https://www.wpgmaps.com/forums/\" target=\"_BLANK\">Ask a question on our support forum</a>.", "wp-google-maps"); ?> </div>
					</div>
				</div>
			</form>

			<!-- Markers Tab -->
			<div class="grouping auto-expand" data-group="map-markers" data-feature-discard="true">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Markers', 'wp-google-maps'); ?>
				</div>

				<div class="navigation">
					<div class="item caret-right" data-group="map-markers-editor">
						<?php _e("Add Marker", "wp-google-maps"); ?>
					</div>
				</div>

				<div class="spacer"></div>

				<div class="feature-list">
					<div class="wpgmza-table-container" id="wpgmza-table-container-Marker"></div>
				</div>
			</div>

			<!-- Markers - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-markers-editor" data-feature="marker">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='map-markers'></div>
					<?php _e('Marker Editor', 'wp-google-maps'); ?>
				</div>

				<div class="wpgmza-feature-accordion settings" id="markers" data-wpgmza-feature-type="marker">
					<div class="wpgmza-accordion">
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced_markers-atlas-novus"><?php esc_html_e("Add advanced markers", "wp-google-maps"); ?></a>
							<?php esc_html_e("with the Pro version","wp-google-maps"); ?>
						</div>

						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Markers - Advanced Markers Tab - Upsell -->
			<div class="grouping" data-group="map-markers-advanced" data-feature="marker">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='map-markers'></div>
					<?php _e('Advanced Markers', 'wp-google-maps'); ?>
				</div>

				<div class="settings" id="advanced-markers">
					<!-- Left in place in case anything has to happen to it -->
				</div>
			</div>

			<!-- Polygons Tab -->
			<div class="grouping auto-expand" data-group="map-polygons" data-feature-discard="true">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Polygons', 'wp-google-maps'); ?>
				</div>

				<div class="navigation">
					<div class="item caret-right" data-group="map-polygon-editor">
						<?php _e("Add Polygon", "wp-google-maps"); ?>
					</div>
				</div>

				<div class="spacer"></div>

				<div class="feature-list">
					<div class="wpgmza-table-container" id="wpgmza-table-container-Polygon"></div>
				</div>
			</div>

			<!-- Polygons - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-polygon-editor" data-feature="polygon">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='map-polygons'></div>
					<?php _e('Polygon Editor', 'wp-google-maps'); ?>
				</div>

				<div class="wpgmza-feature-accordion settings" id="polygons" data-wpgmza-feature-type="polygon">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Polylines Tab -->
			<div class="grouping auto-expand" data-group="map-polylines" data-feature-discard="true">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Polylines', 'wp-google-maps'); ?>
				</div>

				<div class="navigation">
					<div class="item caret-right" data-group="map-polyline-editor">
						<?php _e("Add Polyline", "wp-google-maps"); ?>
					</div>
				</div>

				<div class="spacer"></div>

				<div class="feature-list">
					<div class="wpgmza-table-container" id="wpgmza-table-container-Polyline"></div>
				</div>
			</div>

			<!-- Polylines - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-polyline-editor" data-feature="polyline">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='map-polylines'></div>
					<?php _e('Polyline Editor', 'wp-google-maps'); ?>
				</div>

				<div class="wpgmza-feature-accordion settings" id="polylines" data-wpgmza-feature-type="polyline">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Heatmaps Tab -->
			<div class="grouping auto-expand" data-group="map-heatmaps" data-feature-discard="true">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Heatmaps', 'wp-google-maps'); ?>
				</div>

				<div class="navigation">
					<div class="item caret-right" data-group="map-heatmap-editor">
						<?php _e("Add Heatmap", "wp-google-maps"); ?>
					</div>
				</div>

				<div class="spacer"></div>

				<div class="settings">
					<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
						<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=heatmaps-atlas-novus"><?php esc_html_e("Add heatmaps", "wp-google-maps"); ?></a>
						<?php esc_html_e("with the Pro version","wp-google-maps"); ?>
					</div>
				</div>

				<div class="feature-list">
					<div class="wpgmza-table-container" id="wpgmza-table-container-Heatmap"></div>
				</div>
			</div>

			<!-- Heatmaps - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-heatmap-editor" data-feature="heatmap">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='map-heatmaps'></div>
					<?php _e('Heatmap Editor', 'wp-google-maps'); ?>
				</div>

				<div class="wpgmza-feature-accordion settings" id="heatmaps" data-wpgmza-feature-type="heatmap">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Circles Tab -->
			<div class="grouping auto-expand" data-group="map-circles" data-feature-discard="true">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Circles', 'wp-google-maps'); ?>
				</div>

				<div class="navigation">
					<div class="item caret-right" data-group="map-circle-editor">
						<?php _e("Add Circle", "wp-google-maps"); ?>
					</div>
				</div>

				<div class="spacer"></div>

				<div class="feature-list">
					<div class="wpgmza-table-container" id="wpgmza-table-container-Circle"></div>
				</div>
			</div>

			<!-- Circles - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-circle-editor" data-feature="circle">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='map-circles'></div>
					<?php _e('Circle Editor', 'wp-google-maps'); ?>
				</div>

				<div class="wpgmza-feature-accordion settings" id="circles" data-wpgmza-feature-type="circle">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Rectangles Tab -->
			<div class="grouping auto-expand" data-group="map-rectangles" data-feature-discard="true">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Rectangles', 'wp-google-maps'); ?>
				</div>

				<div class="navigation">
					<div class="item caret-right" data-group="map-rectangle-editor">
						<?php _e("Add Rectangle", "wp-google-maps"); ?>
					</div>
				</div>

				<div class="spacer"></div>

				<div class="feature-list">
					<div class="wpgmza-table-container" id="wpgmza-table-container-Rectangle"></div>
				</div>
			</div>

			<!-- Rectangles - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-rectangle-editor" data-feature="rectangle">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='map-rectangles'></div>
					<?php _e('Rectangle Editor', 'wp-google-maps'); ?>
				</div>

				<div class="wpgmza-feature-accordion settings" id="rectangles" data-wpgmza-feature-type="rectangle">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Point Labels Tab -->
			<div class="grouping auto-expand" data-group="map-point-labels" data-feature-discard="true">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Point Labels', 'wp-google-maps'); ?>
				</div>

				<div class="navigation">
					<div class="item caret-right" data-group="map-point-label-editor">
						<?php _e("Add Label", "wp-google-maps"); ?>
					</div>
				</div>

				<div class="spacer"></div>

				<div class="feature-list">
					<div class="wpgmza-table-container" id="wpgmza-table-container-Pointlabel"></div>
				</div>
			</div>

			<!-- Point Label - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-point-label-editor" data-feature="pointlabel">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='map-point-labels'></div>
					<?php _e('Label Editor', 'wp-google-maps'); ?>
				</div>

				<div class="wpgmza-feature-accordion settings" id="pointlabels" data-wpgmza-feature-type="pointlabel">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Image Overlays Tab -->
			<div class="grouping auto-expand" data-group="map-image-overlays" data-feature-discard="true">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Image Overlays', 'wp-google-maps'); ?>
				</div>

				<div class="navigation">
					<div class="item caret-right" data-group="map-image-overlay-editor">
						<?php _e("Add Overlay", "wp-google-maps"); ?>
					</div>
				</div>

				<div class="spacer"></div>

				<div class="settings">
					<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
						<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=imageoverlays-atlas-novus"><?php esc_html_e("Add image overlays", "wp-google-maps"); ?></a>
						<?php esc_html_e("with the Pro version","wp-google-maps"); ?>
					</div>
				</div>

				<div class="feature-list">
					<div class="wpgmza-table-container" id="wpgmza-table-container-Imageoverlay"></div>
				</div>
			</div>

			<!-- Point Label - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-image-overlay-editor" data-feature="imageoverlay">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='map-image-overlays'></div>
					<?php _e('Overlay Editor', 'wp-google-maps'); ?>
				</div>

				<div class="wpgmza-feature-accordion settings" id="imageoverlays" data-wpgmza-feature-type="imageoverlay">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>


			<!-- Help Tab -->
			<div class="grouping" data-group="map-help">
				<div class="heading block has-back">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Help', 'wp-google-maps'); ?>
				</div>

				<div class="settings">
					<div class="general-info">
						<div class="info-heading"><?php _e("Need help with the plugin?", "wp-google-maps"); ?></div>

						<div class="info-content">
							<?php _e("Use our resources below to find a solution, or get in touch with us directly", "wp-google-maps"); ?>
						</div>

						<ul>
							<li>
								<a href="https://docs.wpgmaps.com/"
									title="<?php esc_attr_e('WP Go Maps Documentation Section', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Documentation", "wp-google-maps"); ?>
								</a>	
							</li>
							
							<li>
								<a href="https://docs.wpgmaps.com/troubleshooting"
									title="<?php esc_attr_e('WP Go Maps Troubleshooting Section', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Troubleshooting", "wp-google-maps"); ?>
								</a>	
							</li>

							<li>
								<a href="https://www.wpgmaps.com/forums/forum/"
									title="<?php esc_attr_e('WP Go Maps Community Forums', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Community forums", "wp-google-maps"); ?>
								</a>	
							</li>

							<li>
								<a href="https://www.facebook.com/groups/wpgooglemaps"
									title="<?php esc_attr_e('Facebook Community', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Facebook Community", "wp-google-maps"); ?>
								</a>	
							</li>

							<li>
								<a href="https://www.reddit.com/r/wpgooglemaps/"
									title="<?php esc_attr_e('Reddit Community', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Reddit Community", "wp-google-maps"); ?>
								</a>	
							</li>

							<li>
								<a href="https://www.wpgmaps.com/contact-us/"
									title="<?php esc_attr_e('WP Go Maps Get in touch', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Get in touch", "wp-google-maps"); ?>
								</a>	
							</li>

							<li>
								<a href="https://www.wpgmaps.com/privacy-policy"
									title="<?php esc_attr_e('WP Go Maps Privacy Policy', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Privacy policy", "wp-google-maps"); ?>
								</a>	
							</li>

							<li>
								<a href="https://wordpress.org/support/plugin/wp-google-maps/reviews/"
									title="<?php esc_attr_e('Leave us a review!', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Rate us on WordPress.org", "wp-google-maps"); ?>
								</a>	
							</li>
						</ul>

						<div class="info-content">
							<?php
								_e("Thank you for using <a href='https://www.wpgmaps.com'>WP Go Maps</a>!", 'wp-google-maps');
							?>
						</div>
					</div>

					<div class="general-info">
						<div class="info-heading"><?php _e("About WP Go Maps", "wp-google-maps"); ?></div>

						<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/new-banner.png'; ?>" />

						<div class="info-content">
							Atlas Novus <span class='versions-text'></span>
						</div>

						<div class="info-content inline-image">
							<?php
								echo sprintf(
									__("A product of <img src='%s' alt='CODECABIN_' style='height: 1em;' class='wpgmze_cc_footer_image'/>", 'wp-google-maps'),
									WPGMZA_PLUGIN_DIR_URL . 'images/codecabin.png'
								);
							?>
						</div>
					</div>
				</div>
			</div>

			<div class="action-bar" data-type="map">
				<div class="wpgmza-row">
					<div class="wpgmza-col">
						<label for="shortcode_input" class="wpgmza-button">Get Shortcode</label>
					</div>
					<div class="wpgmza-col wpgmza-text-align-right">
						<label class="wpgmza-button wpgmza-button-accent dynamic-action wpgmza-hidden"></label>
						<label class="wpgmza-button wpgmza-button-primary static-action" for="wpgmza_savemap"><?php _e("Save Map", "wp-google-maps"); ?></label>
					</div>
				</div>
			</div>
		</div>

		<div class="content">
			<div class="wpgmza-editor-col map-container-wrap">
				<?php echo wpgmaps_check_if_no_api_key(); ?>
				<p class='notice notice-error wpgmza-missing-key-notice wpgmza-hidden wpgmza-shadow wpgmza-card'>
					<?php
						echo sprintf(
							__('Please ensure you <a href="%s">enter a Google Maps API key</a> to continue using Google Maps. Alternatively, swap over to Open Layers by clicking <a id="wpgm-swap-to-open-layers" href="%s">here</a>.', 'wp-google-maps'),
							"admin.php?page=wp-google-maps-menu-settings#advanced-settings",
							"javascript:void(0);"
						);
					?>
				</p>
				<div class='map_wrapper'>
					<div id="wpgmza-map-container"></div>
				</div>

				<div class="quick-actions">
					<div class="toggle">
						<input type="checkbox" id="qa-add-datasets">
						<label class="icon wpgmza-shadow" for="qa-add-datasets" title="Add a dataset">
							<i class="fa fa-times"></i>
						</label>

						<div class="actions">
							<label class="icon wpgmza-shadow" data-type="marker" title="Add a marker">
								<div class="sub-icon" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . "images/marker-tab-icon.png"; ?>');"></div>
							</label>

							<label class="icon wpgmza-shadow" data-type="polygon" title="Add a polygon">
								<div class="sub-icon" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . "images/polygon.png"; ?>');"></div>
							</label>

							<label class="icon wpgmza-shadow" data-type="polyline" title="Add a polyline">
								<div class="sub-icon" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . "images/polyline.png"; ?>');"></div>
							</label>

							<label class="icon wpgmza-shadow" data-type="heatmap" title="Add a heatmap">
								<div class="sub-icon" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . "images/heatmap.png"; ?>');"></div>
							</label>

							<label class="icon wpgmza-shadow" data-type="circle" title="Add a circle">
								<div class="sub-icon" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . "images/circle.png"; ?>');"></div>
							</label>

							<label class="icon wpgmza-shadow" data-type="rectangle" title="Add a rectangle">
								<div class="sub-icon" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . "images/rectangle.png"; ?>');"></div>
							</label>

							<label class="icon wpgmza-shadow" data-type="pointlabel" title="Add a Point Label">
								<div class="sub-icon" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . "images/point-label.png"; ?>');"></div>
							</label>

							<label class="icon wpgmza-shadow" data-type="imageoverlay" title="Add a Image Overlay">
								<div class="sub-icon" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . "images/image-overlays.png"; ?>');"></div>
							</label>
						</div>
					</div>
				</div>

				<div id="wpgmaps_save_reminder" style="display:none;">
                    <div class="wpgmza-nag wpgmza-update-nag wpgmza-card wpgmza-shadow wpgmza-notice warning bottom-anchor">
                        <strong><?php _e("Remember to save your map!","wp-google-maps"); ?></strong>
                    </div>
                </div>
				
			</div>
		</div>
	</div>	
</div>