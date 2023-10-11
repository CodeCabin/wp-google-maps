<div id="wpgmza-map-edit-page" class='wrap'>
	<h1 id="wpgmza-main-heading">
		<?php
		_e('WP Go Maps', 'wp-google-maps');
		?>
		<span id="wpgmza-title-label" class="wpgmza-label-amber"><small></small></span>
	</h1>
	
	<div class="wide">
		<h2>
			<?php
			_e('Create your Map', 'wp-google-maps');
			?>
			
			<a href="admin.php?page=wp-google-maps-menu&amp;action=new" 
				class="add-new-h2 add-new-editor">
				<?php
				_e("New","wp-google-maps");
				?>
			</a>
			
			<div class='update-nag update-blue update-slim' id='wpmgza_unsave_notice' style='display:none;'>
				<?php
				_e('Unsaved data will be lost', 'wp-google-maps');
				?>
			</div>
		</h2>
		
		<div id="wpgmza-gdpr-privacy-policy-notice"></div>
		
		<form action="" method="POST" id="wpgmaps_options" name="wpgmza_map_form">
		
			<input name="action" type="hidden" value="wpgmza_save_map"/>
			<input name="redirect_to" type="hidden"/>
			<input name="map_id" type="hidden"/>
			<input name="real_post_nonce" type="hidden"/>
		
			<!-- NB: Is name attribute valid on a form? Check spec please -->
			
			<div id="wpgmaps_tabs">
				<ul>
					<li>
						<a href="#general-settings">
							<?php
							_e('General Settings', 'wp-google-maps');
							?>
						</a>
					</li>
					<li>
						<a href="#themes">
							<?php
							_e('Themes', 'wp-google-maps');
							?>
						</a>
					</li>
					<li>
						<a href="#directions">
							<?php
							_e('Directions', 'wp-google-maps');
							?>
						</a>
					</li>
					<li>
						<a href="#store-locator">
							<?php
							_e('Store Locator', 'wp-google-maps');
							?>
						</a>
					</li>
					<li>
						<a href="#advanced-settings">
							<?php
							_e('Advanced Settings', 'wp-google-maps');
							?>
						</a>
					</li>
					<li>
						<a href="#marker-listing">
							<?php
							_e('Marker Listing', 'wp-google-maps');
							?>
						</a>
					</li>
					<li>
						<a href="#marker-filtering">
							<?php
							_e('Marker Filtering', 'wp-google-maps');
							?>
						</a>
					</li>
					<li class="wpgmza-upgrade-tab wpgmza-upsell">
						<a href="#pro-upgrade">
							<?php
							_e('Pro Upgrade', 'wp-google-maps');
							?>
						</a>
					</li>
				</ul>
			
				<div id="general-settings">
					<h3>
						<?php
						_e('Map Settings', 'wp-google-maps');
						?>
					</h3>
					
					<input type='hidden' name='http_referer'/>
					<input type='hidden' name='wpgmza_id' id='wpgmza_id'/>
					
					<!-- NB: Populate dynamically -->
					<input type='hidden' name='map_start_lat'/>
					<input type='hidden' name='map_start_lng'/>
					<input type='hidden' name='wpgmza_start_location' id='wpgmza_start_location'/>
					
					<select id='wpgmza_start_zoom' name='wpgmza_start_zoom' style='display: none;'>
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
					
					<!-- NB: Adapted from old table based layout -->
					<fieldset>
						<legend>
							<?php
							_e("Short code","wp-google-maps");
							?>
						</legend>
						
						<input type="text" readonly name="shortcode" class="wpgmza_copy_shortcode"/>
						
						<small class='wpgmza-info__small'>
							<i>
								
								<?php
								_e("copy this into your post or page to display the map", "wp-google-maps");
		
								// NB: I recommend adding a unique ID or class to this link and using the DOM to set the href rather than mixing content with logic here. - Perry
								echo ". ".__(sprintf("Or <a href='%s' target='BLANK'>click here to automatically create a Map Page now</a>.", "admin.php?page=wp-google-maps-menu&amp;action=create-map-page&amp;map_id=".(!empty($_REQUEST['map_id']) ? intval($_REQUEST['map_id']) : '' )),"wp-google-maps");

								?>
							</i>
						</small>
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Map Name", "wp-google-maps");
							?>
						</legend>
						
						<input id='wpgmza_title' name='map_title' class='regular-text' type='text'/>
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Zoom Level", "wp-google-maps");
							?>
						</legend>
						
						<input type="text" id="amount" class='map_start_zoom' style="display: none;" name="map_start_zoom"/>
						
						<div id="slider-range-max"></div>
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Width", "wp-google-maps");
							?>
						</legend>
						
						<input id="wpgmza_width" name="map_width" type="number" value="100"/>
						
						<select id='wpgmza_map_width_type' name='map_width_type'>
							<option value="px">px</option>
							<option value="%" selected="selected">%</option>
							<option value="vw">vw</option>
						</select>

						<small>
							<em>
								<?php
								_e("Set to 100% for a responsive map", "wp-google-maps");
								?>
							</em>
						</small>
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Height", "wp-google-maps");
							?>
						</legend>
						
						<input id='wpgmza_height' name='map_height' type='number'/>
						
						<select id='wpgmza_map_height_type' name='map_height_type'>
							<option value="px">px</option>
							<option value="%">%</option>
							<option value="vh">vh</option>
						</select>
						
						<span style='display:none;' id='wpgmza_height_warning'>
							<small>
								<?php
								_e("We recommend that you leave your height in PX. Depending on your theme, using % for the height may break your map.", "wp-google-maps");
								?>
							</small>
						</span>
					</fieldset>
				</div>
				
				<div id="themes" class="wpgmza-open-layers-feature-unavailable wpgmza-theme-panel">
				
					<span class='notice notice-warning' data-wpgmza-require-engine="open-layers">
						<?php
						_e("Not available while using the OpenLayers engine and Legacy build. Switch to Atlas Novus build, or Google Maps engine, under Maps -> Settings to access themes", "wp-google-maps");
						?>
					</span>
				
				</div>
				
				<div id="directions" class="wpgmza-directions-box-settings-panel">
				
					 <div class="update-nag update-att wpgmza-upsell">
                                
						<i class="fa fa-arrow-circle-right"></i>
						
						<?php
						_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=directions">
						Enable directions</a> with the Pro version for only $39.99 once off. Support and updates included forever', 'wp-google-maps');
						?>

					</div>

					<table class='form-table wpgmza-pro-feature' id='wpgmaps_directions_options'>
                        <tr>
                            <td width='200px'><?php _e("Enable Directions?","wp-google-maps"); ?>:</td>
                            <td>
	                            <div class='switch'>
	                                <input type='checkbox' class='cmn-toggle cmn-toggle-yes-no wpgmza-pro-feature'> <label class='cmn-override-big' data-on='<?php _e("No","wp-google-maps"); ?>' data-off='<?php _e("No","wp-google-maps"); ?>'></label>
	                            </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            <?php _e("Directions Box Open by Default?","wp-google-maps"); ?>:
                            </td>
                            <td>
                            <select class='postform wpgmza-pro-feature'>
                                <option><?php _e("No","wp-google-maps"); ?></option>
                                <option><?php _e("Yes, on the left","wp-google-maps"); ?></option>
                                <option><?php _e("Yes, on the right","wp-google-maps"); ?></option>
                                <option><?php _e("Yes, above","wp-google-maps"); ?></option>
                                <option><?php _e("Yes, below","wp-google-maps"); ?></option>
                            </select>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            <?php _e("Directions Box Width","wp-google-maps"); ?>:
                            </td>
                            <td>
                            <input type='text' size='4' maxlength='4' class='small-text wpgmza-pro-feature' /> px
                            </td>
                        </tr>

                    </table>
				
				</div>
				
				<div id="store-locator">
					
					<!-- TODO: Use progressive enhancement here -->
					
					<fieldset>
						<legend>
							<?php
							_e("Enable Store Locator", "wp-google-maps");
							?>
						</legend>
						
						<input type='checkbox' 
							id='store_locator_enabled' 
							name='store_locator_enabled' 
							class='postform cmn-toggle cmn-toggle-yes-no'/>
						<label class='cmn-override-big-wide' 
							for='store_locator_enabled' 
							data-on='<?php esc_attr_e("Yes", "wp-google-maps"); ?>' 
							data-off='<?php esc_attr_e("No", "wp-google-maps"); ?>'>
						</label>
						
					</fieldset>
					
					<fieldset data-require-legacy-user-interface-style="true">
						<legend>
							<?php
							_e("Store Locator Style", "wp-google-maps");
							?>
						</legend>
						
						<ul>
							<li>
								<label>
									<input type='radio' 						
										name='store_locator_style' 
										value='legacy'
										/>
									
									<?php
									_e("Legacy", "wp-google-maps");
									?>
								</label>
							</li>
							<li>
								<label>
									<input type='radio' 
										name='store_locator_style' 
										value='modern'
										/>
								
									<?php
									_e("Modern", "wp-google-maps");
									?>
								</label>
							</li>
						</ul>
					</fieldset>
					
					<fieldset data-require-legacy-user-interface-style="false">
						<legend>
							<?php
							_e("Store Locator Style", "wp-google-maps");
							?>
						</legend>
						
						<label class="notice notice-info">
							<?php
							echo sprintf(
								__("Looking for styling settings? Try our new <a href='%s' target='_blank'>User Interface Style</a> setting.", "wp-google-maps"), 
								admin_url('admin.php?page=wp-google-maps-menu-settings')
							);
							?>
						</label>
						
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Search Area", "wp-google-maps");
							?>
						</legend>
						
						<ul>
							<li>
								<label>
									<input type='radio'
										name='store_locator_search_area'
										value='radial'
										checked='checked'
										class="wpgmza-pro-feature"
										/>
										
									<?php
									_e("Radial", "wp-google-maps");
									?>
								</label>
								
								<p>
									<small>
										<?php
										_e("Allows the user to select a radius from a predefined list", "wp-google-maps");
										?>
									</small>
								</p>
							</li>
							<li>
								<label>
									<input type='radio'
										name='store_locator_search_area'
										value='auto'
										class="wpgmza-pro-feature"
										/>
									
									<?php
									_e("Auto", "wp-google-maps");
									?>
								</label>
								
								<p>
									<small>
										<?php
										_e("Intelligently detects the zoom level based on the location entered", "wp-google-maps");
										?>
									</small>
								</p>

								<p class="wpgmza-pro-feature-hide" data-search-area="auto">
									<small>
										<?php
										_e("Marker listings will not be filtered based on visible markers. Enable the 'Only load markers within viewport (beta)' option for beta filtering support", "wp-google-maps");
										?>
									</small>
								</p>
							</li>
						<ul>
					</fieldset>

					<div class="wpgmza-upsell">
						<i class="fa fa-arrow-circle-right"></i>
						<?php
						_e('Enable intelligent, automatic search area with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator">Pro add-on</a>', 'wp-google-maps');
						?>
					</div>
					
					<fieldset data-search-area="radial">
						<legend>
							<?php
							_e("Radius Style", "wp-google-maps");
							?>
						</legend>
						<ul>
							<li>
								<label>
									<input type='radio' 						
										name='wpgmza_store_locator_radius_style' 
										value='legacy'
										checked='checked'
										/>
									
									<?php
									_e("Legacy", "wp-google-maps");
									?>
								</label>
							</li>
							<li>
								<label>
									<input type='radio' 
										name='wpgmza_store_locator_radius_style' 
										value='modern'/>
									
									<?php
									_e("Modern", "wp-google-maps");
									?>
								</label>
							</li>
						</ul>
					</fieldset>
					
					<fieldset data-search-area="radial">
						<legend>
							<?php
							_e("Default radius", "wp-google-maps");
							?>
						</legend>
						
						<select name='wpgmza_store_locator_default_radius' class='wpgmza-store-locator-default-radius'></select>
					</fieldset>
					
					<fieldset data-search-area="auto">
						<legend>
							<?php
							_e("Maximum zoom", "wp-google-maps");
							?>
						</legend>
						
						<input name='store_locator_auto_area_max_zoom'
							type='number'
							min='1'
							max='21'/>
					</fieldset>
					
					<fieldset id="wpgmza-store-locator-country-restriction-container" class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Restrict to country", "wp-google-maps");
							?>
						</legend>
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Show distance in", "wp-google-maps");
							?>
						</legend>
						
						<input type='checkbox' 
							id='store_locator_distance' 
							name='store_locator_distance' 
							class='postform cmn-toggle cmn-toggle-yes-no'/>
						<label class='cmn-override-big-wide' 
							for='store_locator_distance' 
							data-on='<?php esc_attr_e("Miles", "wp-google-maps"); ?>' 
							data-off='<?php esc_attr_e("Kilometers", "wp-google-maps"); ?>'>
						</label>
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Store Locator Placement", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch'>
							<input type='checkbox' 
								id='wpgmza_store_locator_position' 
								name='wpgmza_store_locator_position' 
								class='postform cmn-toggle cmn-toggle-yes-no'/>
							<label class='cmn-override-big-wide' 
								for='wpgmza_store_locator_position' 
								data-on='<?php esc_attr_e("Below Map", "wp-google-maps"); ?>'
								data-off='<?php esc_attr_e("Above Map","wp-google-maps"); ?>'>
							</label>
						</div>
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Show distance from search", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input type='checkbox'
								id='store_locator_show_distance' 
								name='store_locator_show_distance' 
								class='postform cmn-toggle cmn-toggle-round-flat'
								/>
							<label for='store_locator_show_distance'></label>
						</div>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Allow category selection", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input type='checkbox'
								id='wpgmza_store_locator_category_enabled' 
								name='store_locator_category' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'
								/>
							<label for='wpgmza_store_locator_category_enabled'></label>
						</div>
					</fieldset>

					<div class="wpgmza-upsell">
						<i class="fa fa-arrow-circle-right"></i>
						<?php
						_e('Enable search by category with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator">Pro add-on</a>', 'wp-google-maps');
						?>
					</div>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Allow users to use their location as the starting point", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch'>
							<input type='checkbox' 
								id='wpgmza_store_locator_use_their_location' 
								name='wpgmza_store_locator_use_their_location' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
							<label for='wpgmza_store_locator_use_their_location'></label>
						</div>
					</fieldset>

					<div class="wpgmza-upsell">
						<i class="fa fa-arrow-circle-right"></i>
						<?php
						_e('Enable user geolocation features with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator">Pro add-on</a>', 'wp-google-maps');
						?>
					</div>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Show center point as an icon", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch'>
							<input type='checkbox' 
								id='wpgmza_store_locator_bounce' 
								name='wpgmza_store_locator_bounce' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
							<label for='wpgmza_store_locator_bounce'></label>
						</div>
					</fieldset>
					
					<fieldset id="wpgmza_store_locator_bounce_conditional" 
						style="display: none;" 
						class="wpgmza-store-locator-marker-icon-picker-container wpgmza-pro-feature">
						<legend>
							<?php
							_e("Default Icon", "wp-google-maps");
							?>
						</legend>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Marker animation", "wp-google-maps");
							?>
						</legend>
						
						<select name="wpgmza_sl_animation" id="wpgmza_sl_animation" class="wpgmza-pro-feature">
							<option value="0">
								<?php
								_e("None", "wp-google-maps");
								?>
							</option>
							<option value="1">
								<?php
								_e("Bounce", "wp-google-maps");
								?>
							</option>
							<option value="2">
								<?php
								_e("Drop", "wp-google-maps");
								?>
							</option>
						</select>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Hide all markers until a search is done", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch'>
							<input type='checkbox' 
								id='wpgmza_store_locator_hide_before_search' 
								name='wpgmza_store_locator_hide_before_search' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
							<label for='wpgmza_store_locator_hide_before_search'></label>
						</div>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Query String", "wp-google-maps");
							?>
						</legend>
						
						<input type="text" name="store_locator_query_string" id="wpgmza_store_locator_query_string" class="wpgmza-pro-feature"/>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Location Placeholder", "wp-google-maps");
							?>
						</legend>
						
						<input type="text" name="store_locator_location_placeholder" id="wpgmza_store_locator_location_placeholder" class="wpgmza-pro-feature"/>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Default address", "wp-google-maps");
							?>
						</legend>
						
						<input type="text" 
							name="store_locator_default_address"
							id="wpgmza_store_locator_default_address"
							class="wpgmza-address wpgmza-pro-feature"
							/>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Enable title search", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch'>
							<input type='checkbox'
								id='wpgmza_store_locator_name_search' 
								name='store_locator_name_search' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
							<label for='wpgmza_store_locator_name_search'></label>
						</div>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Title search String", "wp-google-maps");
							?>
						</legend>
						
						<input type="text" 
							name="store_locator_name_string"
							id="wpgmza_store_locator_name_string"
							class="wpgmza-pro-feature"/>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e( "Not found message", "wp-google-maps");
							?>
						</legend>
						
						<input type="text"
							name="store_locator_not_found_message"
							id="wpgmza_store_locator_not_found_message"
							class="wpgmza-pro-feature"/>
					</fieldset>
					
					<h3>
						<?php
						_e("Style options", "wp-google-maps");
						?>
					</h3>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Line color", "wp-google-maps");
							?>
						</legend>
						<input id="sl_stroke_color" 
							name="sl_stroke_color" 
							type="color" 
							class="color wpgmza-pro-feature"/>
					</fieldset>
					
					<fieldset class="wpgmza_legacy_sl_style_option_area wpgmza-pro-feature">
						<legend>
							<?php
							_e("Line opacity", "wp-google-maps");
							?>
						</legend>
						
						<input id="sl_stroke_opacity" 
							name="sl_stroke_opacity"
							type="number"
							min="0"
							max="1"
							step="0.01"
							class="wpgmza-pro-feature"/>
						
						<small>
							<?php
							_e("(0 - 1.0) example: 0.5 for 50%", "wp-google-maps");
							?>
						</small>
					</fieldset>
					
					<fieldset class="wpgmza_legacy_sl_style_option_area wpgmza-pro-feature">
						<legend>
							<?php
							_e("Fill color", "wp-google-maps");
							?>
						</legend>
						
						<input id="sl_fill_color" 
							name="sl_fill_color"
							type="color"
							class="color wpgmza-pro-feature"/>
					</fieldset>
					
					<fieldset class="wpgmza_legacy_sl_style_option_area wpgmza-pro-feature">
						<legend>
							<?php
							_e("Fill opacity", "wp-google-maps");
							?>
						</legend>
						
						<input id="sl_fill_opacity"
							name="sl_fill_opacity"
							type="number"
							min="0"
							max="1"
							step="0.01"
							class="wpgmza-pro-feature"/>
					</fieldset>

					<div class="wpgmza-upsell">
						<i class="fa fa-arrow-circle-right"></i>
						<?php
						_e('Enable custom styling options with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator">Pro add-on</a>', 'wp-google-maps');
						?>
					</div>
					
					<p>
						<em>
							<?php
							_e('View', 'wp-google-maps');
							?>
							<a href='https://docs.wpgmaps.com/CB2H-store-locator' target='_BLANK'>
								<?php
								_e('Store Locator Documentation', 'wp-google-maps');
								?>
							</a>
						</em>
					</p>
				</div>
				
				<div id="advanced-settings">
					<h3>
						<?php
						_e("Advanced Settings:", "wp-google-maps")
						?>
					</h3>
					
					<fieldset id="advanced-settings-marker-icon-picker-container">
						<legend>
							<?php
							_e("Default Marker Image", "wp-google-maps");
							?>
						</legend>
						
						<div class="wpgmza-upsell">
							<i class="fa fa-arrow-circle-right"></i>
							<?php
							_e('Enable custom marker icons with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>
					</fieldset>
					
					<fieldset data-wpgmza-require-engine="google-maps">
						<legend>
							<?php
							_e("Map type", "wp-google-maps");
							?>
						</legend>
						
						<select id="wpgmza_map_type" name="type">
							<option value="1">
								<?php
								_e("Roadmap", "wp-google-maps");
								?>
							</option>
							<option value="2">
								<?php
								_e("Satellite", "wp-google-maps");
								?>
							</option>
							<option value="3">
								<?php
								_e("Hybrid", "wp-google-maps");
								?>
							</option>
							<option value="4">
								<?php
								_e("Terrain", "wp-google-maps");
								?>
							</option>
						</select>
						
						<div class='wpgmza-open-layers-feature-unavailable'></div>
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Map Alignment", "wp-google-maps");
							?>
						</legend>
						
						<select id="wpgmza_map_align" 
							name="wpgmza_map_align"
							class="postform">
							<option value="1">
								<?php
								_e('Left', 'wp-google-maps');
								?>
							</option>
							<option value="2">
								<?php
								_e('Center', 'wp-google-maps');
								?>
							</option>
							<option value="3">
								<?php
								_e('Right', 'wp-google-maps');
								?>
							</option>
							<option value="4">
								<?php
								_e('None', 'wp-google-maps');
								?>
							</option>
						</select>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Show User's Location?", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch wpgmza-geolocation-setting'>
							<input 
								type='checkbox' 
								id='wpgmza_show_user_location' 
								name='show_user_location' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/> 
							<label for='wpgmza_show_user_location'></label>
						</div>
					</fieldset>

					<div class="wpgmza-upsell">
						<i class="fa fa-arrow-circle-right"></i>
						<?php
						_e('Enable user geolocation features with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced">Pro add-on</a>', 'wp-google-maps');
						?>
					</div>
					
					<fieldset class="wpgmza-user-location-marker-icon-picker-container wpgmza-pro-feature" id="wpgmza_show_user_location_conditional" style="display: none;">
						<legend>
							<?php
							_e("Default User Location Icon", "wp-google-maps");
							?>
						</legend>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Jump to nearest marker on initialization?", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch wpgmza-geolocation-setting'>
							<input 
								type='checkbox' 
								id='wpgmza_jump_to_nearest_marker_on_initialization' 
								name='jump_to_nearest_marker_on_initialization' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
							<label for='wpgmza_jump_to_nearest_marker_on_initialization'></label>
						</div>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Automatically pan to users location?", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch wpgmza-geolocation-setting'>
							<input type='checkbox'
								id='wpgmza_automatically_pan_to_users_location' 
								name='automatically_pan_to_users_location' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
							<label for="wpgmza_automatically_pan_to_users_location"></label>
						</div>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Override User Location Zoom Level", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch wpgmza-geolocation-setting'>
							<input type='checkbox'
								id='wpgmza_override_users_location_zoom_level' 
								name='override_users_location_zoom_level' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
							<label for="wpgmza_override_users_location_zoom_level"></label>
						</div>
					</fieldset>

					<fieldset 
						class="wpgmza-override-users-location-zoom-levels wpgmza-no-flex" 
						id="wpgmza_override_users_location_zoom_levels_slider" 
						style="display: none;">
						<legend>
							<?php
							_e("Zoom Level", "wp-google-maps");
							?>
						</legend>

						<input name="override_users_location_zoom_levels" style="display: none;" type="text" id="override_users_location_zoom_levels_slider">
						
						 <div id="override-users-location-zoom-levels-slider"></div> 
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Show distance from location?", "wp-google-maps");
							?>
						</legend>
						
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
						<!--<small>
							<em>
								<?php
								_e("This feature will use the users location (where available) or the searched address when a store locator search is performed.","wp-google-maps");
								?>
							</em>
						</small>-->
					</fieldset>
					
					
					<fieldset>
						<legend>
							<?php
							_e("Maximum Zoom Out Level", "wp-google-maps");
							?>
						</legend>
						
						<input id='wpgmza_max_zoom' 
							name='map_max_zoom'
							min="0"
							max="21"
							step="1"
							value="21"
							type="number"/>
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Maximum Zoom In Level", "wp-google-maps");
							?>
						</legend>
						
						<input id='wpgmza_min_zoom' 
							name='map_min_zoom'
							min="0"
							max="21"
							step="1"
							value="0"
							type="number"/>
					</fieldset>

					<div class="wpgmza-upsell">

						<i class="fa fa-arrow-circle-right"> </i>
						<?php
						echo sprintf(
							__(
							'Get the rest of these advanced features with the Pro version for only <a href="%s" target="_BLANK">$39.99 once off</a>. Support and updates included forever.',
							"wp-google-maps"
							),
							"https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced"
						);
						?>

					</div>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Click marker opens link", "wp-google-maps");
							?>
						</legend>
						
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
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Fit map bounds to markers?", "wp-google-maps");
							?>
						</legend>
						
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
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Fit map bounds to markers after filtering?", "wp-google-maps");
							?>
						</legend>
						
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
					</fieldset>
					
					<fieldset>
						<legend>
							<?php
							_e("Hide point of interest", "wp-google-maps");
							?>
						</legend>
						
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
					</fieldset>
					
									
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Zoom on marker click", "wp-google-maps");
							?>
						</legend>
						
						<div>
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

					<fieldset 
						class="wpgmza-zoom-on-marker-click-zoom-level wpgmza-no-flex" 
						id="wpgmza_zoom_on_marker_click_zoom_level" 
						style="display: none;">
						<legend>
							<?php
							_e("Zoom Level", "wp-google-maps");
							?>
						</legend>

						<input name="wpgmza_zoom_on_marker_click_slider" style="display: none;" type="text" id="wpgmza_zoom_on_marker_click_slider">
						
						 <div id="zoom-on-marker-click-slider"></div> 
					</fieldset>

					
					<fieldset>
						<legend>
							<?php
							_e('Enable Layers', 'wp-google-maps');
							?>
						</legend>
						
						<div>
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

							<br>
							
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

							<br>
							
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
							
							<div class='wpgmza-open-layers-feature-unavailable'></div>
						</div>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Close InfoWindow on Map Click", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input type="checkbox"
								id="close_infowindow_on_map_click"
								name="close_infowindow_on_map_click"
								class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
							<label for="close_infowindow_on_map_click"></label>
						</div>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Disable lightbox for marker images", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input type="checkbox"
								id="disable_lightbox_images"
								name="disable_lightbox_images"
								class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
							<label for="disable_lightbox_images"></label>
						</div>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Use Raw JPEG coordinates?", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input type="checkbox"
								id="use_Raw_Jpeg_Coordinates"
								name="use_Raw_Jpeg_Coordinates"
								class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
							<label for="use_Raw_Jpeg_Coordinates"></label>
						</div>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature" data-wpgmza-require-engine="google-maps">
						<legend>
							<?php
							_e("Enable Polygon Labels", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input type="checkbox"
								id="polygon_labels"
								name="polygon_labels"
								class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
							<label for="polygon_labels"></label>
						</div>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Disable Polygon InfoWindows", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input type="checkbox"
								id="disable_polygon_info_windows"
								name="disable_polygon_info_windows"
								class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
							<label for="disable_polygon_info_windows"></label>
						</div>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("KML/GeoRSS URL", "wp-google-maps");
							?>
						</legend>
						
						<input id='wpgmza_kml' 
							name='kml' 
							type='text'
							class='regular-text wpgmza-pro-feature'/>
						<em>
							<small class='wpgmza-text-field__description'>
								<?php
								_e("The KML/GeoRSS layer will over-ride most of your map settings","wp-google-maps");
								
								_e("For multiple sources, separate each one by a comma.","wp-google-maps");
								?>
							</small>
						</em>
					</fieldset>
					
					<fieldset id="wpgmza-integration-panel-container" class="wpgmza-pro-feature wpgmza-pro-feature-hide">
						<legend>
							<?php
							_e("Integration", "wp-google-maps");
							?>
						</legend>
					</fieldset>
					
					<fieldset id="wpgmza-marker-ratings" class="wpgmza-pro-feature">
						<legend>
							<?php
							_e('Enable Marker Ratings', 'wp-google-maps');
							?>
						</legend>
						<div class='switch'>
							<input type='checkbox' 
								id='enable_marker_ratings' 
								name='enable_marker_ratings' 
								class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
							<label for='enable_marker_ratings'></label>
						</div>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
								_e("Only load markers within viewport (beta)", "wp-google-maps");
							?>
						</legend>
						<div class='switch switch-inline'>
							<input type="checkbox"
								id="only_load_markers_within_viewport"
								name="only_load_markers_within_viewport"
								class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
							<label for="only_load_markers_within_viewport"></label>
							<small><?php _e("This feature may not work as expected with bounds specific settings", "wp-google-maps"); ?></small>
						</div>
					</fieldset>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Infowindow Style", "wp-google-maps");
							?>
						</legend>
						<div class='wpgmza-infowindow-style-picker wpgmza-flex'>
						
							<label>
								<input type="radio" name="wpgmza_iw_type" value="0" class="wpgmza-pro-feature"/>
								<div class='wpgmza-flex-item wpgmza-infowindow-picker__item iw_custom_click_hide'>
									<div class="wpgmza-card wpgmza-card-border__hover">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_1.png'; ?>"
											title="<?php esc_attr_e('Default', 'wp-google-maps'); ?>"
											class="wpgmza_mlist_selection"
											/>
										<span class='wpgmza-infowindow-style__name'>
											<?php
											_e('Default Infowindow', 'wp-google-maps');
											?>
										</span>
									</div>
								</div>
							</label>
							
							<label>
								<input type="radio" name="wpgmza_iw_type" value="1" class="wpgmza-pro-feature"/>
								<div class='wpgmza-flex-item wpgmza-infowindow-picker__item iw_custom_click_show'>
									<div class="wpgmza-card wpgmza-card-border__hover">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_2.png'; ?>"
											title="<?php esc_attr_e('Default', 'wp-google-maps'); ?>"
											class="wpgmza_mlist_selection"
											/>
										<span class='wpgmza-infowindow-style__name'>
											<?php
											_e('Modern Infowindow', 'wp-google-maps');
											?>
										</span>
									</div>
								</div>
							</label>
							
							<label>
								<input type="radio" name="wpgmza_iw_type" value="2" class="wpgmza-pro-feature"/>
								<div class='wpgmza-flex-item wpgmza-infowindow-picker__item iw_custom_click_show'>
									<div class="wpgmza-card wpgmza-card-border__hover">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_3.png'; ?>"
											title="<?php esc_attr_e('Default', 'wp-google-maps'); ?>"
											class="wpgmza_mlist_selection"
											/>
										<span class='wpgmza-infowindow-style__name'>
											<?php
											_e('Modern Plus Infowindow', 'wp-google-maps');
											?>
										</span>
									</div>
								</div>
							</label>
							
							<label>
								<input type="radio" name="wpgmza_iw_type" value="3" class="wpgmza-pro-feature"/>
								<div class='wpgmza-flex-item wpgmza-infowindow-picker__item iw_custom_click_show'>
									<div class="wpgmza-card wpgmza-card-border__hover">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_4.png'; ?>"
											title="<?php esc_attr_e('Default', 'wp-google-maps'); ?>"
											class="wpgmza_mlist_selection"
											/>
										<span class='wpgmza-infowindow-style__name'>
											<?php
											_e('Circular Infowindow', 'wp-google-maps');
											?>
										</span>
									</div>
								</div>
							</label>
							

							
							<label>
								<input type="radio" name="wpgmza_iw_type" value="-1" class="wpgmza-pro-feature"/>
								<div class='wpgmza-flex-item wpgmza-infowindow-picker__item iw_custom_click_hide'>
									<div class="wpgmza-card wpgmza-card-border__hover">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_inherit.png'; ?>"
											title="<?php esc_attr_e('Inherit Global Setting', 'wp-google-maps'); ?>"
											class="wpgmza_mlist_selection"
											/>
										<span class='wpgmza-infowindow-style__name'>
											<?php
											_e('Inherit Global Setting', 'wp-google-maps');
											?>
										</span>
									</div>
								</div>
							</label>
						</div>
					</fieldset>
					
					<fieldset id="iw_custom_colors_row" style="display: none;">
						<legend>
							<?php
							_e("Infowindow Colors", "wp-google-maps");
							?>
						</legend>
						
						<ul>
							<li>
								<input id="iw_primary_color" name="iw_primary_color" type="color" class="color"/>
								<label for="iw_primary_color">
									<?php
									_e('Primary Color', 'wp-google-maps');
									?>
								</label>
							</li>
							<li>
								<input id="iw_accent_color" name="iw_accent_color" type="color" class="color"/>
								<label for="iw_accent_color">
									<?php
									_e('Accent Color', 'wp-google-maps');
									?>
								</label>
							</li>
							<li>
								<input id="iw_text_color" name="iw_text_color" type="color" class="color"/>
								<label for="iw_text_color">
									<?php
									_e('Text Color', 'wp-google-maps');
									?>
								</label>
							</li>
						</ul>
					</fieldset>
				</div>
				
				<div id="marker-listing">
					
					<div class="wpgmza-upsell">
						<i class="fa fa-arrow-circle-right"></i>
						<?php
						_e('Enable Marker Listing with the <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing"target="_BLANK">Pro version for only $39.99 once off</a>. Support and updates included forever.', "wp-google-maps");
						?>
					</div>
					
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e('Marker Listing Style', 'wp-google-maps');
							?>
						</legend>
						
						<div class="wpgmza-marker-listing-style-menu">
						
							<div class='wpgmza-marker-listing-picker wpgmza-flex'>
								<div class='wpgmza-marker-listing-picker__item'>
									<label class="wpgmza-card wpgmza-card-border__hover">
										<input type="radio" name="wpgmza_listmarkers_by" value="0" checked="checked"/>
										<img class='wpgmza-listing-item__img' src='<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_0.png'/>
										<span class='wpgmza-listing-item__title'>
											<?php
											_e('No marker listing', 'wp-google-maps');
											?>
										</span>
									</label>
								</div>
							</div>
							
							<div class='wpgmza-marker-listing-picker wpgmza-flex'>
								<div class='wpgmza-marker-listing-picker__item'>
									<label class="wpgmza-card wpgmza-card-border__hover">
										<input type="radio" name="wpgmza_listmarkers_by" value="1"/>
										<img class='wpgmza-listing-item__img' src='<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_1.png'/>
										<span class='wpgmza-listing-item__title'>
											<?php
											_e('Basic table', 'wp-google-maps');
											?>
										</span>
									</label>
								</div>
							</div>
							
							<div class='wpgmza-marker-listing-picker wpgmza-flex'>
								<div class='wpgmza-marker-listing-picker__item'>
									<label class="wpgmza-card wpgmza-card-border__hover">
										<input type="radio" name="wpgmza_listmarkers_by" value="4"/>
										<img class='wpgmza-listing-item__img' src='<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_2.png'/>
										
										<span class='wpgmza-listing-item__title'>
											<?php
											_e('Basic list', 'wp-google-maps');
											?>
										</span>
									</label>
								</div>
							</div>
							
							<div class='wpgmza-marker-listing-picker wpgmza-flex'>
								<div class='wpgmza-marker-listing-picker__item'>
									<label class="wpgmza-card wpgmza-card-border__hover">
										<input type="radio" name="wpgmza_listmarkers_by" value="2"/>
										<img class='wpgmza-listing-item__img' src='<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_3.png'/>
										<span class='wpgmza-listing-item__title'>
											<?php
											_e('Advanced table', 'wp-google-maps');
											?>
										</span>
									</label>
								</div>
							</div>
							
							<div class='wpgmza-marker-listing-picker wpgmza-flex'>
								<div class='wpgmza-marker-listing-picker__item'>
									<label class="wpgmza-card wpgmza-card-border__hover">
										<input type="radio" name="wpgmza_listmarkers_by" value="3"/>
										<img class='wpgmza-listing-item__img' src='<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_4.png'/>										
										<span class='wpgmza-listing-item__title'>
											<?php
											_e('Carousel', 'wp-google-maps');
											?>
										</span>
									</label>
								</div>
							</div>
							
							<div class='wpgmza-marker-listing-picker wpgmza-flex'>
								<div class='wpgmza-marker-listing-picker__item'>
									<label class="wpgmza-card wpgmza-card-border__hover">
										<input type="radio" name="wpgmza_listmarkers_by" value="6"/>
										<img class='wpgmza-listing-item__img' src='<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_modern.png'/>										
										<span class='wpgmza-listing-item__title'>
											<?php
											_e('Modern', 'wp-google-maps');
											?>
										</span>
									</label>
								</div>
							</div>
							
							<div class='wpgmza-marker-listing-picker wpgmza-flex'>
								<div class='wpgmza-marker-listing-picker__item'>
									<label class="wpgmza-card wpgmza-card-border__hover">
										<input type="radio" name="wpgmza_listmarkers_by" value="7"/>
										<img class='wpgmza-listing-item__img' src='<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_grid.png'/>
										<span class='wpgmza-listing-item__title'>
											<?php
											_e('Grid', 'wp-google-maps');
											?>
										</span>
									</label>
								</div>
							</div>
							
						</div>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Marker Listing Placement", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch'>
							<input type='checkbox' 
								id='wpgmza_marker_listing_position' 
								name='wpgmza_marker_listing_position' 
								class='postform cmn-toggle cmn-toggle-yes-no'>
							<label class='cmn-override-big-wide' 
								for='wpgmza_marker_listing_position' 
								data-on='<?php esc_attr_e("Above Map", "wp-google-maps"); ?>'
								data-off='<?php esc_attr_e("Below Map", "wp-google-maps"); ?>'>
							</label>
						</div>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Order markers by", "wp-google-maps");
							?>
						</legend>
						
						<select id="order_markers_by" name="order_markers_by" class="postform">
							<option value="1">
								<?php
								_e('ID', 'wp-google-maps');
								?>
							</option>
							<option value="2">
								<?php
								_e('Title', 'wp-google-maps');
								?>
							</option>
							<option value="3">
								<?php
								_e('Address', 'wp-google-maps');
								?>
							</option>
							<option value="4">
								<?php
								_e('Description', 'wp-google-maps');
								?>
							</option>
							<option value="5">
								<?php
								_e('Category', 'wp-google-maps');
								?>
							</option>
							<option value="6">
								<?php
								_e('Category Priority', 'wp-google-maps');
								?>
							</option>
							<option value="7">
								<?php
								_e('Distance', 'wp-google-maps');
								?>
							</option>
							<option value="8">
								<?php
								_e('Rating', 'wp-google-maps');
								?>
							</option>
						</select>
						
						<select id="order_markers_choice" name="order_markers_choice">
							<option value="1">
								<?php
								_e("Ascending", "wp-google-maps");
								?>
							</option>
							<option value="2">
								<?php
								_e("Descending", "wp-google-maps");
								?>
							</option>
						</select>
					</fieldset>

					<fieldset class="wpgmza-pro-feature" data-wpgmza-require-engine="google-maps">
						<legend>
							<?php
							_e("Move list inside map", "wp-google-maps");
							?>
						</legend>
						
						<div class='switch'>
							<input id='wpgmza_push_in_map' 
								name='wpgmza_push_in_map' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								value='1'/> 
							<label for='wpgmza_push_in_map'></label>
						</div>
					</fieldset>

					<fieldset id="wpgmza_marker_list_conditional" class="wpgmza-pro-feature" data-wpgmza-require-engine="google-maps">
						<legend>
							<?php
							_e("Placement: ","wp-google-maps");
							?>
						</legend>
						<select id="wpgmza_push_in_map_placement" name="wpgmza_push_in_map_placement" class="postform">
							<option value="1">
								<?php
								_e("Top Left", "wp-google-maps");
								?>
							</option>
							<option value="2">
								<?php
								_e("Top Center", "wp-google-maps");
								?>
							</option>
							<option value="3">
								<?php
								_e("Top Right", "wp-google-maps");
								?>
							</option>
							<option value="5">
								<?php
								_e("Left Top", "wp-google-maps");
								?>
							</option>
							<option value="4">
								<?php
								_e("Left Center", "wp-google-maps");
								?>
							</option>
							<option value="7">
								<?php
								_e("Right Top", "wp-google-maps");
								?>
							</option>
							<option value="8">
								<?php
								_e("Right Center", "wp-google-maps");
								?>
							</option>
							<option value="6">
								<?php
								_e("Left Bottom", "wp-google-maps");
								?>
							</option>
							<option value="99">
								<?php
								_e("Right Bottom", "wp-google-maps");
								?>
							</option>
							<option value="11">
								<?php
								_e("Bottom Center", "wp-google-maps");
								?>
							</option>
							<option value="10">
								<?php
								_e("Bottom Left", "wp-google-maps");
								?>
							</option>
							<option value="12">
								<?php
								_e("Bottom Right", "wp-google-maps");
								?>
							</option>
						</select>
					</fieldset>

					<fieldset class="wpgmza-pro-feature" data-wpgmza-require-engine="google-maps">
							
							<legend>
								<?php
								_e("Container Width: ", "wp-google-maps");
								?>
							</legend>
							

							<input type="text" 
								name="wpgmza_push_in_map_width" 
								id="wpgmza_push_in_map_width" 
								placeholder='<?php esc_attr_e('% or px', 'wp-google-maps'); ?>'/>
								
							<em>
								<?php
								_e('Set as % or px, eg. 30% or 400px', 'wp-google-maps');
								?>
							</em>
					</fieldset>
					<fieldset class="wpgmza-pro-feature"  data-wpgmza-require-engine="google-maps">
						
						<legend>
							<?php
							_e("Container Height: ", "wp-google-maps");
							?>
						</legend>
						
						<input type="text" 
							name="wpgmza_push_in_map_height" 
							id="wpgmza_push_in_map_height" 
							placeholder='<?php esc_attr_e('% or px', 'wp-google-maps'); ?>'/>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Filter by Category", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input id='filterbycat' 
								name='filterbycat' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' value='1'/>
							<label for='filterbycat'></label>
						</div>
						<label for='filterbycat' class='wpgmza-info__small'>
							<?php
							_e("Allow users to filter by category?", "wp-google-maps");
							?>
						</label>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Override zoom level on listing click", "wp-google-maps");
							?>
						</legend>

						<div>
							<div class='switch'>
								<input type='checkbox' 
									id='zoom_level_on_marker_listing_override' 
									name='zoom_level_on_marker_listing_override' 
									class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
								<label for='zoom_level_on_marker_listing_override' 
									data-on='<?php _e("Yes", "wp-google-maps"); ?>'
									data-off='<?php _e("No", "wp-google-maps"); ?>'>
								</label>
							</div>
						</div>
					</fieldset>

					<fieldset 
						class="wpgmza-zoom-on-marker-listing-click-zoom-level wpgmza-no-flex" 
						id="zoom_level_on_marker_listing_click_level" 
						style="display: none;">
						<legend>
							<?php
							_e("Zoom Level", "wp-google-maps");
							?>
						</legend>

						<input name="zoom_level_on_marker_listing_click" style="display: none;" type="text" id="zoom_level_on_marker_listing_click">

						 <div id="zoom-on-marker-listing-click-slider"></div> 
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Disable Zoom On Listing Click", "wp-google-maps");
							?>
						</legend>

						<div>
							<div class='switch'>
								<input type='checkbox' 
									id='marker_listing_disable_zoom' 
									name='marker_listing_disable_zoom' 
									class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
								<label for='marker_listing_disable_zoom' 
									data-on='<?php _e("Yes", "wp-google-maps"); ?>'
									data-off='<?php _e("No", "wp-google-maps"); ?>'>
								</label>
							</div>
						</div>
					</fieldset>
					

					<h3>
						<?php
						_e('DataTable Options', 'wp-google-maps');
						?>
					</h3>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("No results message", "wp-google-maps");
							?>
						</legend>
						
						<div>
							<input type="text" 
							name="datatable_no_result_message" 
							id="datatable_no_result_message" 
							placeholder='<?php esc_attr_e('No matching records found', 'wp-google-maps'); ?>'
							/>
						</div>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Remove search box", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input id='remove_search_box_datables' 
								name='remove_search_box_datables' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' value='1'/>
							<label for='remove_search_box_datables'></label>
						</div>
						<label for='remove_search_box_datables' class='wpgmza-info__small'>
							<?php
							_e("Remove search box from Marker Listing Table?", "wp-google-maps");
							?>
						</label>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Select different pagination style", "wp-google-maps");
							?>
						</legend>
						
						<select id="dataTable_pagination_style" name="dataTable_pagination_style" class="postform">
							<option value="default">
								<?php
								_e("Default", "wp-google-maps");
								?>
							</option>
							<option value="page-number-buttons-only">
								<?php
								_e('Page number buttons only', 'wp-google-maps');
								?>
							</option>
							<option value="prev-and-next-buttons-only">
								<?php
								_e('Previous and Next buttons only', 'wp-google-maps');
								?>
							</option>
							<option value="prev-and-next-buttons-plus-page-numbers">
								<?php
								_e('Previous and Next buttons, plus page numbers', 'wp-google-maps');
								?>
							</option>
							<option value="first-prev-next-and-last-buttons">
								<?php
								_e('First, Previous, Next and Last buttons', 'wp-google-maps');
								?>
							</option>
							<option value="first-prev-next-and-last-buttons-plus-page-numbers">
								<?php
								_e('First, Previous, Next and Last buttons, plus page numbers', 'wp-google-maps');
								?>
							</option>
							<option value="first-and-last-buttons-plus-page-numbers">
								<?php
								_e('First and Last buttons, plus page numbers', 'wp-google-maps');
								?>
							</option>
							<option value="hidden">
								<?php _e('Hidden', 'wp-google-maps'); ?>
							</option>
						</select>
					</fieldset>

					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Change listing table search string", "wp-google-maps");
							?>
						</legend>
						
						<div>
							<input type="text" 
							name="datatable_search_string" 
							id="datatable_search_string" 
							placeholder='<?php esc_attr_e('Search:', 'wp-google-maps'); ?>'
							/>
						</div>
					</fieldset>

					<!--<fieldset class="wpgmza-pro-feature">
						<div class='switch'>
							<input id='datatable_result' 
								name='datatable_result' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' value='1'/>
							<label for='datatable_result'></label>
						</div>
						<label for='datatable_result' class='wpgmza-info__small'>
							<?php
							_e("Example: Showing 1 of 6 to 6 entries", "wp-google-maps");
							?>
						</label>
					</fieldset>-->

					<fieldset id="datable_strings" class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Change results string", "wp-google-maps");
							?>
						</legend>
						<div>
							<span>
							<p><?php esc_attr_e('Showing:', 'wp-google-maps'); ?></p>
							<input type="text" 
							name="datatable_result_start" 
							id="datatable_result_start" 
							placeholder='<?php esc_attr_e('Showing:', 'wp-google-maps'); ?>'
							/></span>
						</div>
						<div>
							<span>
							<p><?php esc_attr_e('of', 'wp-google-maps'); ?></p>
							<input type="text" 
							name="datatable_result_of" 
							id="datatable_result_of" 
							placeholder='<?php esc_attr_e('of', 'wp-google-maps'); ?>'
							/></span>
						</div>
						<div>
							<span>
							<p><?php esc_attr_e('to', 'wp-google-maps'); ?></p>
							<input type="text" 
							name="datatable_result_to" 
							id="datatable_result_to" 
							placeholder='<?php esc_attr_e('to', 'wp-google-maps'); ?>'
							/></span>
						</div>

						<div>
							<span>
							<p><?php esc_attr_e('entries', 'wp-google-maps'); ?></p>
							<input type="text" 
							name="datatable_result_total" 
							id="datatable_result_total" 
							placeholder='<?php esc_attr_e('entries', 'wp-google-maps'); ?>'
							/></span>
						</div>
					</fieldset>

					<!--
					<fieldset class="wpgmza-pro-feature">
						<legend>
							<?php
							_e("Change entries string", "wp-google-maps");
							?>
						</legend>
						<div class='switch'>
							<input id='datatable_result_page' 
								name='datatable_result_page' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' value='1'/>
							<label for='datatable_result_page'></label>
						</div>
						<label for='datatable_result_page' class='wpgmza-info__small'>
							<?php
							_e("Example: Showing entries", "wp-google-maps");
							?>
						</label>
					</fieldset>
					-->

					<fieldset id="datable_strings_entries" class="wpgmza-pro-feature">
						<legend>
							
						</legend>
						<div>
							<span>
							<p><?php esc_attr_e('Show:', 'wp-google-maps'); ?></p>
							<input type="text" 
							name="datatable_result_show" 
							id="datatable_result_show" 
							placeholder='<?php esc_attr_e('Show:', 'wp-google-maps'); ?>'
							/></span>
						</div>

						<div>
							<span>
							<p><?php esc_attr_e('Entries', 'wp-google-maps'); ?></p>
							<input type="text" 
							name="datatable_result_entries" 
							id="datatable_result_entries" 
							placeholder='<?php esc_attr_e('Entries', 'wp-google-maps'); ?>'
							/></span>
						</div>
					</fieldset>
					
				</div>
				
				<div id="pro-upgrade" class="wpgmza-pro-feature-upsell">
					<div id="wpgm_premium">
						<div class='wpgmza-flex'>
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2>
											<?php _e("Create custom markers with detailed info windows", "wp-google-maps") ?></h2>
										<p><?php _e("Add titles, descriptions, HTML, images, animations and custom icons to your markers.", "wp-google-maps") ?></p>
									</div>
								</div>
							</div>
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2>Enable directions</h2>
										<p><?php _e("Allow your visitors to get directions to your markers. Either use their location as the starting point or allow them to type in an address.", "wp-google-maps") ?></p>
									</div>
								</div>
							</div>
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2>Unlimited maps</h2>
										<p><?php _e('Create as many maps as you like.', "wp-google-maps") ?></p>
									</div>
								</div>
							</div>
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2>List your markers</h2>
										<p><?php _e('Choose between three methods of listing your markers.', "wp-google-maps") ?></p>
									</div>
								</div>
							</div>                                
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2><?php _e('Add categories to your markers', "wp-google-maps") ?></h2>
										<p><?php _e('Create and assign categories to your markers which can then be filtered on your map.', "wp-google-maps") ?></p>
									</div>
								</div>
							</div>                                
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2><?php _e('Advanced options', "wp-google-maps") ?></h2>
										<p><?php _e("Enable advanced options such as showing your visitor's location, marker sorting, bicycle layers, traffic layers and more!", "wp-google-maps") ?></p>
									</div>
								</div>
							</div>  
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2><?php _e('Import / Export', "wp-google-maps") ?></h2>
										<p><?php _e('Export your markers to a CSV file for quick and easy editing. Import large quantities of markers at once.', "wp-google-maps") ?></p>
									</div>
								</div>
							</div>                                
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2><?php _e('Add KML &amp; Fusion Tables', "wp-google-maps") ?></h2>
										<p><?php _e('Add your own KML layers or Fusion Table data to your map', "wp-google-maps") ?></p>
									</div>
								</div>
							</div>                                   
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2><?php _e('Polygons and Polylines', "wp-google-maps") ?></h2>
										<p><?php _e('Add custom polygons and polylines to your map by simply clicking on the map. Perfect for displaying routes and serviced areas.', "wp-google-maps") ?></p>
									</div>
								</div>
							</div>
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2><?php _e('Amazing Support', "wp-google-maps") ?></h2>
										<p><?php _e('We pride ourselves on providing quick and amazing support. <a target="_BLANK" href="http://wordpress.org/support/view/plugin-reviews/wp-google-maps?filter=5">Read what some of our users think of our support</a>.', "wp-google-maps") ?></p>
									</div>
								</div>
							</div>
							<div class="wpgm_premium_row">
								<div class="wpgmza-card">
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2><?php _e('Easy Upgrade', "wp-google-maps") ?></h2>
										<p><?php _e("You'll receive a download link immediately. Simply upload and activate the Pro plugin to your WordPress admin area and you're done!", "wp-google-maps") ?></p>
									</div>
								</div>
							</div>                                  
							<div class="wpgm_premium_row">
								<div class='wpgmza-card'>
									<div class="wpgm_icon"></div>
									<div class="wpgm_details">
										<h2><?php _e('Free updates and support forever', "wp-google-maps") ?></h2>
										<p><?php _e("Once you're a pro user, you'll receive free updates and support forever! You'll also receive amazing specials on any future plugins we release.", "wp-google-maps") ?></p>
									</div>
								</div>
							</div>
						</div> 
							
						<p>
							<?php
							_e('Get all of this and more for only $39.99 once off', 'wp-google-maps');
							?>
						</p>
						<p>
							<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=upgradenow" target="_BLANK" title="Upgrade now for only $39.99 once off" class="button-primary" style="font-size:20px; display:block; width:220px; text-align:center; height:42px; line-height:41px;" id="wpgmza-upgrade-now__btn">
									<?php esc_html_e('Upgrade Now', "wp-google-maps") ?>
								</a>
						</p>
						
						<p>	
							<a href="https://www.wpgmaps.com/demo/" target="_BLANK">
								<?php esc_html_e('View the demos', 'wp-google-maps'); ?></a>
						</p>
						
						<p>
							<?php 
							_e("Have a sales question? Contact Nick on <a href=\"mailto:nick@wpgmaps.com\">nick@wpgmaps.com</a> or use our <a href=\"https://www.wpgmaps.com/contact-us/\" target=\"_BLANK\">contact form</a>.", "wp-google-maps")
							?>
						</p>
						<p>
							<?php
							_e("Need help? <a href=\"https://www.wpgmaps.com/forums/\" target=\"_BLANK\">Ask a question on our support forum</a>.", "wp-google-maps")
							?>
						</p>
					</div>
				</div>
				
			</div> <!-- End of tabs -->
			
			<!-- NB: <p> has a semantic meaning. Recommend using div instead with a class for padding / margin -->
			<p>
				<input type='submit' name='wpgmza_savemap' class='button-primary' value='<?php _e("Save Map", "wp-google-maps"); ?> &raquo;'/>
			</p>
			
			<p class='wpgmza-map-edit__mouse-tip'>
				<?php
				_e("Tip: Use your mouse to change the layout of your map. When you have positioned the map to your desired location, press \"Save Map\" to keep your settings.", "wp-google-maps");
				?>
			</p>
		</form>
		
		<div class='wgmza-map-editor-holder'>
			<div style="display:block; overflow-y:auto; overflow-x:hidden; width:49%; margin-right:1%; float:left;">
				<div id="wpgmaps_tabs_markers" class="wpgmza-form">

					<div class="wpgmza-editor-row">
						<div class="wpgmza-editor-col">
							<ul class='wpgmza-tab-wrap'>
								<li>
									<a href="#markers">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/marker-tab-icon.png"; ?>" alt=""/>
										<?php _e("Markers","wp-google-maps"); ?>
									</a>
								</li>
								
								<li	class="wpgmza-basic-only wpgmza-upgrade-tab">
									<a href="#advanced-markers">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/marker-tab-icon.png"; ?>" alt=""/>
										<?php _e("Advanced Markers","wp-google-maps"); ?>
									</a>
								</li>

								<li>
									<a href="#polygons">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/polygon.png"; ?>" alt=""/>
										<?php _e("Polygons","wp-google-maps"); ?>
									</a>
								</li>
								<li>
									<a href="#polylines">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/polyline.png"; ?>" alt=""/>
										<?php _e("Polylines","wp-google-maps"); ?>
									</a>
								</li>
								<li>
									<a href="#heatmaps">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/heatmap.png"; ?>" alt=""/>
										<?php _e("Heatmaps","wp-google-maps"); ?>
									</a>
								</li>
								<li>
									<a href="#circles">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/circle.png"; ?>" alt=""/>
										<?php _e("Circles","wp-google-maps"); ?>
									</a>
								</li>
								<li>
									<a href="#rectangles">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/rectangle.png"; ?>" alt=""/>
										<?php _e("Rectangles","wp-google-maps"); ?>
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div class="wpgmza-editor-row">
						
							<?php /* map used to be here */ ?>
						
					</div>

				
					
					
					<div class="wpgmza-feature-accordion" id="markers" data-wpgmza-feature-type="marker">
						
						<div class="wpgmza-accordion">
							<h3
								data-add-caption="<?php esc_attr_e('Add a new Marker', 'wp-google-maps'); ?>"
								data-edit-caption="<?php esc_attr_e('Edit Marker', 'wp-google-maps'); ?>">
							
								<!-- <i class="fa fa-plus-circle" aria-hidden="true"></i> -->
								<?php _e('Add a new Marker', 'wp-google-maps'); ?>
								
							</h3>
							
							<div class="wpgmza-feature-panel-container"></div>



							
							
							
						</div>
						
					</div>
					
					<div class="wpgmza-feature-accordion" id="polygons" data-wpgmza-feature-type="polygon">
					
						<div class="wpgmza-accordion">
							<h3
								data-add-caption="<?php esc_attr_e('Add a new Polygon', 'wp-google-maps'); ?>"
								data-edit-caption="<?php esc_attr_e('Edit Polygon', 'wp-google-maps'); ?>">
								
								<!-- <i class="fa fa-plus-circle" aria-hidden="true"></i> -->
								<?php _e('Add a new Polygon', 'wp-google-maps'); ?>
								
							</h3>
							
							<div class="wpgmza-feature-panel-container"></div>
							

							
							
						</div>
					
					</div>
					
					<div class="wpgmza-feature-accordion" id="polylines" data-wpgmza-feature-type="polyline">
					
						<div class="wpgmza-accordion">
							<h3 
								data-add-caption="<?php esc_attr_e('Add a new Polyline', 'wp-google-maps'); ?>"
								data-edit-caption="<?php esc_attr_e('Edit Polyline', 'wp-google-maps'); ?>">
							
								<!-- <i class="fa fa-plus-circle" aria-hidden="true"></i> -->
								<?php _e('Add a new Polyline', 'wp-google-maps'); ?>
								
							</h3>
							
							<div class="wpgmza-feature-panel-container"></div>
							
							
						</div>
					
					</div>
					
					<div class="wpgmza-feature-accordion" id="heatmaps" data-wpgmza-feature-type="heatmap">
					
						<div class="wpgmza-accordion">
							<h3
								data-add-caption="<?php esc_attr_e('Add a new Heatmap', 'wp-google-maps'); ?>"
								data-edit-caption="<?php esc_attr_e('Edit Heatmaps', 'wp-google-maps'); ?>">
								
								<?php _e('Add a new Heatmap', 'wp-google-maps'); ?>
								
							</h3>
							
							<div class="wpgmza-feature-panel-container"></div>

							
							
						</div>
					
					</div>
					
					<div class="wpgmza-feature-accordion" id="circles" data-wpgmza-feature-type="circle">
					
						<div class="wpgmza-accordion">
							<h3
								data-add-caption="<?php esc_attr_e('Add a new Circle', 'wp-google-maps'); ?>"
								data-edit-caption="<?php esc_attr_e('Edit Circle', 'wp-google-maps'); ?>">
								
								<!-- <i class="fa fa-plus-circle" aria-hidden="true"></i> -->
								<?php _e('Add a new Circle', 'wp-google-maps'); ?>
								
							</h3>
							
							<div class="wpgmza-feature-panel-container"></div>
							
							
							
							
						</div>
					
					</div>
					
					<div class="wpgmza-feature-accordion" id="rectangles" data-wpgmza-feature-type="rectangle">
					
						<div class="wpgmza-accordion">
							<h3
								data-add-caption="<?php esc_attr_e('Add a new Rectangle', 'wp-google-maps'); ?>"
								data-edit-caption="<?php esc_attr_e('Edit Rectangle', 'wp-google-maps'); ?>">
								<!-- <i class="fa fa-plus-circle" aria-hidden="true"></i> -->
								<?php _e('Add a new Rectangle', 'wp-google-maps'); ?>
							</h3>
							
							<div class="wpgmza-feature-panel-container"></div>
							
							
							
							
						</div>
					
					</div>
					
					<div id="advanced-markers">
						
						<div class="wpgmza-upsell">
							<i class="fa fa-arrow-circle-right"></i>
							<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced_markers"><?php esc_html_e("Add advanced markers", "wp-google-maps"); ?></a>
							<?php
							esc_html_e("with the Pro version","wp-google-maps");
							?>
						</div>
					
						<!-- The content will be imported by MapEditPage -->
						
					</div>
					
				</div>
				
				
			
			
			</div>

			<div class="wpgmza-editor-col map-container-wrap">
				<?php echo wpgmaps_check_if_no_api_key(); ?>
				<p class='notice notice-error wpgmza-missing-key-notice wpgmza-hidden'>
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

				<div id="wpgmaps_save_reminder" style="display:none;">
                    <div class="wpgmza-nag wpgmza-update-nag" style='text-align:center;'>
                        <h4><?php _e("Remember to save your map!","wp-google-maps"); ?></h4>
                    </div>
                </div>
				
			</div>
		</div>

		<h3 class="separate wpgmza-table-container-title" id="wpgmza-table-container-title-Rectangle"><?php _e('Edit existing Rectangles', 'wp-google-maps'); ?></h3>
		<h3 class="separate wpgmza-table-container-title" id="wpgmza-table-container-title-Circle"><?php _e('Edit existing Circles', 'wp-google-maps'); ?></h3>
		<h3 class="separate wpgmza-table-container-title" id="wpgmza-table-container-title-Heatmap"><?php _e('Edit existing Heatmaps', 'wp-google-maps'); ?></h3>
		<h3 class="separate wpgmza-table-container-title" id="wpgmza-table-container-title-Polyline"><?php _e('Edit existing Polylines', 'wp-google-maps'); ?></h3>
		<h3 class="separate wpgmza-table-container-title" id="wpgmza-table-container-title-Polygon"><?php _e('Edit existing Polygons', 'wp-google-maps'); ?></h3>
		<h3 class="separate wpgmza-table-container-title" id="wpgmza-table-container-title-Marker"><?php _e('Edit existing Markers', 'wp-google-maps'); ?></h3>
		

		<div class="wpgmza-table-container" id="wpgmza-table-container-Marker"></div>
		<div class="wpgmza-table-container" id="wpgmza-table-container-Polygon"></div>
		<div class="wpgmza-table-container" id="wpgmza-table-container-Polyline"></div>
		<div class="wpgmza-table-container wpgmza-pro-feature-hide" id="wpgmza-table-container-Heatmap"></div>
		<div class="wpgmza-table-container" id="wpgmza-table-container-Rectangle"></div>
		<div class="wpgmza-table-container" id="wpgmza-table-container-Circle"></div>



		<div style='clear:both;' id='wpgmza-pro-features' class="wpgmza-upsell wpgmza-flex wpgmza_no_shadow">
				<div class='wpgmza-pro-features__item'>
					<div class='wpgmza-card'>
						<div>
							<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/custom_markers.jpg" 
								width="260" 
								class='wpgmza-promo' 
								title="<?php _e("Add detailed information to your markers!", "wp-google-maps"); ?>"
								alt="<?php _e("Add custom markers to your map!", "wp-google-maps"); ?>"
								/>
							<br/>
							<br/>
						</div>
						<div valign="middle">
							<span style="font-size:18px; color:#666;" 
								class='wpgmza-feature-item__desc'>
								<?php
								_e("Add detailed information to your markers for only", "wp-google-maps"); 
								?>
								<strong>$39.99</strong>
								<?php
								_e("Click", "wp-google-maps");
								?>
								
								<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=image1"
									title="Pro Edition" 
									target="_BLANK">
									<?php
									_e("here","wp-google-maps");
									?>
								</a>
							</span>
						</div>
					</div>
				</div>
				<div class='wpgmza-pro-features__item'>
					<div class='wpgmza-card'>
						<div>
							<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/custom_marker_icons.jpg" 
								width="260" 
								class='wpgmza-promo' 
								title="<?php _e("Add custom markers to your map!", "wp-google-maps"); ?>" 
								alt="<?php _e("Add custom markers to your map!", "wp-google-maps"); ?>"/>
							
							<br />
							<br />
						</div>
						<div valign="middle">
							<span style="font-size:18px; color:#666;" class='wpgmza-feature-item__desc'>
								<?php
								_e("Add different marker icons, or your own icons to make your map really stand out!", "wp-google-maps");
								?>
								
								<?php
								_e("Click","wp-google-maps");
								?>
								<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=image3"
									title="<?php _e("Pro Edition", "wp-google-maps"); ?>"
									target="_BLANK">
									<?php
									_e("here", "wp-google-maps");
									?>
								</a>
							</span>
						</div>
					</div>
				</div>
				<div class='wpgmza-pro-features__item'>
					<div class='wpgmza-card'>
						<div>
							<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/get_directions.jpg" 
								width="260" 
								class='wpgmza-promo' 
								title="<?php _e("Add custom markers to your map!", "wp-google-maps"); ?>"
								alt="<?php _e("Add custom markers to your map!", "wp-google-maps"); ?>"/>
							<br />
							<br />
						</div>
						<div valign="middle">
							<span style="font-size:18px; color:#666;" class='wpgmza-feature-item__desc'>
								<?php
								_e("Allow your visitors to get directions to your markers!", "wp-google-maps");
								?>
								
								<?php
								_e("Click", "wp-google-maps");
								?>
								<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=image2" 
									title="<?php _e("Pro Edition", "wp-google-maps"); ?>"
									target="_BLANK">
									<?php
									_e("here", "wp-google-maps");
									?>
								</a>
							</span>
						</div>
					</div>
				</div>
			</div>

		<p id='wpgmza-basic-footer-text'>
				<small>
					<?php
					_e("Thank you for using <a href='https://www.wpgmaps.com'>WP Go Maps</a>! Please <a href='https://wordpress.org/support/plugin/wp-google-maps/reviews/'>rate us on WordPress.org</a>", 'wp-google-maps');
					?>
					|
					<?php
					echo sprintf(
						__("WP Go Maps is a product of <img src='%s' alt='CODECABIN_' style='height: 1em;' class='wpgmze_cc_footer_image'/>", 'wp-google-maps'),
						WPGMZA_PLUGIN_DIR_URL . 'images/codecabin.png'
					);
					?>
					|
					<?php
					_e("Please refer to our <a href='https://www.wpgmaps.com/privacy-policy' target='_blank'>Privacy Policy</a> for information on Data Processing", 'wp-google-maps')
					?>
					|
					<?php
					_e("WP Go Maps encourages you to make use of the amazing icons at ", "wp-google-maps");
					?>
					<a href='https://mappity.org'>https://mappity.org</a>
					|
					<?php 
					_e('Translating the plugin with', 'wp-google-maps'); ?>
					<a href='https://docs.wpgmaps.com/translating-the-plugin-with-wpml' target='_BLANK'><?php esc_html_e('WPML', 'wp-google-maps'); ?></a>
				</small>
			</p>

	
</div>
