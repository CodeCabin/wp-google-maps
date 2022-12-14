<form 
	method="POST" 
	id="wpgmza-global-settings" 
	class="wpgmza-form"
	action="<?php 
		echo admin_url('admin-post.php');
	?>"
	>

	<input
		type="hidden"
		name="action"
		value="wpgmza_save_settings"
		/>
	
	<ul class='settings-tabs-nav'>
		<li>
			<a href="#general-settings">
				<?php esc_html_e('General Settings', 'wp-google-maps'); ?>
			</a>
		</li>
		<li>
			<a href="#info-windows">
				<?php esc_html_e('InfoWindows', 'wp-google-maps'); ?>
			</a>
		</li>
		<li>
			<a href="#marker-listing">
				<?php esc_html_e('Marker Listing', 'wp-google-maps'); ?>
			</a>
		</li>
		<li>
			<a href="#store-locator">
				<?php esc_html_e('Store Locator', 'wp-google-maps'); ?>
			</a>
		</li>
		<li>
			<a href="#advanced-settings">
				<?php esc_html_e('Advanced Settings', 'wp-google-maps'); ?>
			</a>
		</li>
		<li>
			<a href="#gdpr-compliance">
				<?php esc_html_e('GDPR Compliance', 'wp-google-maps'); ?>
			</a>
		</li>
	</ul>
	
	<div id="general-settings">
	
		<fieldset>
			<legend>
				<?php esc_html_e('Maps Engine', 'wp-google-maps'); ?>
			</legend>
			<select name="wpgmza_maps_engine" id="wpgmza_maps_engine">
				<option value="google-maps"><?php esc_html_e('Google Maps', 'wp-google-maps'); ?></option>
				<option value="open-layers"><?php esc_html_e('OpenLayers', 'wp-google-maps'); ?></option>
			</select>

			<small style="margin-left: 5px"><a href="<?php echo admin_url('admin.php?page=wp-google-maps-menu&action=installer'); ?>"><?php esc_html_e("Open Installer", "wp-google-maps"); ?></a></small>
		</fieldset>

		<fieldset>
			<legend>
				<?php esc_html_e('Build', 'wp-google-maps'); ?>
			</legend>
			<select name="internal_engine" id="internal_engine">
				<option value="legacy"><?php esc_html_e('Legacy', 'wp-google-maps'); ?></option>
				<option value="atlas-novus"><?php esc_html_e('Atlas Novus', 'wp-google-maps'); ?></option>
			</select>
		</fieldset>
	
		<fieldset>
			<legend>
				<?php esc_html_e('General Map Settings', 'wp-google-maps'); ?>
			</legend>
			
			<div role="group">
				<label>
					<div>
						<input name="wpgmza_settings_map_full_screen_control" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php esc_html_e('Disable Full Screen Control', 'wp-google-maps'); ?>
					</div>
				</label>
				
				<label data-required-maps-engine="google-maps">
					<div>
						<input name="wpgmza_settings_map_streetview" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php esc_html_e('Disable StreetView', 'wp-google-maps'); ?>
					</div>
				</label>
				
				<label>
					<div>
						<input name="wpgmza_settings_map_zoom" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php esc_html_e('Disable Zoom Controls', 'wp-google-maps'); ?>
					</div>
				</label>
				
				<label data-required-maps-engine="google-maps">
					<div>
						<input name="wpgmza_settings_map_pan" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php esc_html_e('Disable Pan Controls', 'wp-google-maps'); ?>
					</div>
				</label>
				
				<label data-required-maps-engine="google-maps">
					<div>
						<input name="wpgmza_settings_map_type" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php esc_html_e('Disable Map Type Controls', 'wp-google-maps'); ?>
					</div>
				</label>
				
				<label data-required-maps-engine="google-maps">
					<div>
						<input name="wpgmza_settings_map_tilt_controls" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php esc_html_e('Disable Tilt Controls', 'wp-google-maps'); ?>
					</div>
				</label>

				<label>
					<div>
						<input name="wpgmza_settings_map_scroll" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php esc_html_e('Disable Mouse Wheel Zoom', 'wp-google-maps'); ?>
					</div>
				</label>
				
				<label>
					<div>
						<input name="wpgmza_settings_map_draggable" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php esc_html_e('Disable Mouse Dragging', 'wp-google-maps'); ?>
					</div>
				</label>
				
				<label>
					<div>
						<input name="wpgmza_settings_map_clickzoom" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php esc_html_e('Disable Mouse Double Click Zooming', 'wp-google-maps'); ?>
					</div>
				</label>
			</div>
		</fieldset>
		
		<fieldset>
			<legend>
				<?php esc_html_e('User Interface Style', 'wp-google-maps'); ?>
				(<em><a href='https://www.wpgmaps.com/documentation/user-interface-style-options/' target='_BLANK'><?php esc_html_e('examples', 'wp-google-maps'); ?></a></em>)
			</legend>
			
			<ul>
				<li>
					<label>
						<input type='radio'
							name='user_interface_style'
							value='default'
							checked="checked"/>
						<?php
						_e("<strong>Default</strong> - The default front end.", "wp-google-maps")
						?>
					</label>
				</li>
				<li>
					<label>
						<input type='radio'
							name='user_interface_style'
							value='modern'/>
						<?php
						_e("<strong>Modern</strong> - Puts components inside the map, with pull-out panels.", "wp-google-maps")
						?>
					</label>
				</li>
				<li>
					<label>
						<input type='radio'
							name='user_interface_style'
							value='legacy'/>
						<?php
						_e("<strong>Legacy</strong> - This setting is the same as Default, but provides options to change individual components to the modern style.", "wp-google-maps")
						?>
					</label>
				</li>
				<li>
					<label>
						<input type='radio'
							name='user_interface_style'
							value='compact'/>
						<?php
						_e("<strong>Compact</strong> - Puts all components and their labels inline.", "wp-google-maps")
						?>
					</label>
				</li>
				<li>
					<label>
						<input type='radio'
							name='user_interface_style'
							value='minimal'/>
						<?php
						_e("<strong>Minimal</strong> - The same as Compact, but with icons instead of text labels.", "wp-google-maps");
						?>
					</label>
				</li>
				<li>
					<label>
						<input type='radio'
							name='user_interface_style'
							value='bare-bones'/>
						<?php
						_e("<strong>Bare Bones</strong> - Applies no styling to the components at all. This is recommended for designers and developers who want to style the components from scratch.", "wp-google-maps")
						?>
					</label>
				</li>
			</ul>

		</fieldset>

		<fieldset>
			<legend>
				<?php esc_html_e('Category Selection Logic', 'wp-google-maps'); ?>
			</legend>
			<ul>
				<li>
					<label>
						<input name='wpgmza_settings_cat_logic' type='radio' id='wpgmza_settings_cat_logic_or' value='0' checked="checked" />
						<?php echo __("OR"," wp-google-maps") . " &nbsp; (<span class='description'>" . __("Example: Show the marker if it belongs to Cat A _OR_ Cat B.", "wp-google-maps") . "</span>)"; ?>
					</label>
				</li>

				<li>
					<label>
                    	<input name='wpgmza_settings_cat_logic' type='radio' id='wpgmza_settings_cat_logic_and' value='1'/>
                    	<?php  echo __("AND"," wp-google-maps") . " &nbsp; (<span class='description'>" . __("Example: Only show the marker if it belongs to Cat A _AND_ Cat B.", "wp-google-maps") . "</span>)"; ?>
					</label>
				</li>
			</ul>
		</fieldset>

		<fieldset>
			<legend>
				<?php esc_html_e('Filter by category displayed as', 'wp-google-maps'); ?>
			</legend>
			<ul>
				<li>
					<label>
						<input name='wpgmza_settings_filterbycat_type' type='radio' id='wpgmza_settings_filterbycat_type_dropdown' value='1' checked="checked" />
						<?php _e("Dropdown","wp-google-maps"); ?>
					</label>
				</li>
				<li>
					<label>
                        <input name='wpgmza_settings_filterbycat_type' type='radio' id='wpgmza_settings_filterbycat_type_checkboxes' value='2' />
                        <?php _e("Checkboxes","wp-google-maps"); ?>
                    </label>
                </li>
            </ul>
        </fieldset>
                            
		
		<!--<fieldset>
			<legend>
				<?php esc_html_e('Troubleshooting Options', 'wp-google-maps'); ?>
			</legend>
			
			<label>
				<input name="wpgmza_settings_force_jquery" class="wpgmza-fancy-toggle-button" type="checkbox"/>
				<?php
				esc_html_e("Over-ride current jQuery with version 1.11.3 (Tick this box if you are receiving jQuery related errors after updating to WordPress 4.5)", 'wp-google-maps');
				?>
			</label>
			
			<label data-required-maps-engine="google-maps">
				<input name="wpgmza_settings_remove_api" class="wpgmza-fancy-toggle-button" type="checkbox"/>
				<?php
				esc_html_e("Do not load the Google Maps API (Only check this if your theme loads the Google Maps API by default)", 'wp-google-maps');
				?>
			</label>
		</fieldset>-->
		
		<fieldset>
			<legend>
				<?php esc_html_e('Use FontAwesome', 'wp-google-maps'); ?>
			</legend>
			<select name='use_fontawesome'>
				<option value='4.*'>4.*</option>
				<option value='5.*'>5.*</option>
				<option value='none'><?php esc_html_e("None", "wp-google-maps"); ?></option>
			</select>
		</fieldset>
		
		
		
		<fieldset data-required-maps-engine="open-layers">
			<legend>
				<?php esc_html_e('Tile Server URL', 'wp-google-maps'); ?>
			</legend>
			<select name="tile_server_url">
	
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
				
				<option value="https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png"
					data-preview-image="https://b.tile.opencyclemap.org/cycle/16/33199/22539.png">
					<?php
					_e('OpenCycleMap', 'wp-google-maps');
					?> *
				</option>
				
				<option value="https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
					data-preview-image="https://wiki.openstreetmap.org/w/images/6/63/Humanitarian_style.png">
					<?php
					_e('Humanitarian', 'wp-google-maps');
					?>
				</option>
				
				<option value="https://{a-c}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
					data-preview-image="https://a.www.toolserver.org/tiles/bw-mapnik/9/264/179.png">
					<?php
					_e('Mapnik OSM B&amp;W', 'wp-google-maps');
					?>
				</option>
				
				<option value="https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png"
					data-preview-image="https://c.tiles.wmflabs.org/osm-no-labels/14/7452/6839.png">
					<?php
					_e('Mapnik OSM No Labels', 'wp-google-maps');
					?>
				</option>
				
				<option value="https://a.tile.stamen.com/toner/{z}/{x}/{y}.png"
					data-preview-image="https://a.tile.stamen.com/toner/10/529/366.png">
					<?php
					_e('Stamen Toner', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
					data-preview-image="http://wiki.openstreetmap.org/w/images/d/d2/Tile_watercolor_stamen.jpg">
					<?php
					_e('Stamen Watercolor', 'wp-google-maps');
					?> (No SSL)
				</option>
				
				<option value="https://tile.thunderforest.com/transport/{z}/{x}/{y}.png"
					data-preview-image="https://a.tile2.opencyclemap.org/transport/13/4150/2819.png">
					<?php
					_e('Transport Map', 'wp-google-maps');
					?> *
				</option>
				
				<option value="https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png"
					data-preview-image="https://a.tile.thunderforest.com/landscape/14/4773/6144.png">
					<?php
					_e('Thunderforest Landscape', 'wp-google-maps');
					?> *
				</option>
				
				<option value="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"
					data-preview-image="https://a.tile.thunderforest.com/outdoors/14/4772/6144.png">
					<?php
					_e('Thunderforest Outdoors', 'wp-google-maps');
					?> *
				</option>
				
				<option value="https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png"
					data-preview-image="https://tile.memomaps.de/tilegen/12/2200/1343.png">
					<?php
					_e('Öpnvkarte', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://www.openptmap.org/tiles/{z}/{x}/{y}.png"
					data-preview-image="http://www.openptmap.org/tiles//10/529/366.png">
					<?php
					_e('OpenPtMap', 'wp-google-maps');
					?> (No SSL)
				</option>
				
				<option value="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png">
					<?php
					_e('Carto Light (Positron)', 'wp-google-maps');
					?> *
				</option>
				
				<option value="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
					data-preview-image="https://wiki.openstreetmap.org/w/images/b/ba/Cartodb_dark_tile.png">
					<?php
					_e('Carto Dark (Dark Matter)', 'wp-google-maps');
					?> *
				</option>

				<option value="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png">
					<?php
					_e('MapTiler Streets', 'wp-google-maps');
					?> *
				</option>

				<option value="https://api.maptiler.com/maps/outdoor/{z}/{x}/{y}.png">
					<?php
					_e('MapTiler Outdoor', 'wp-google-maps');
					?> *
				</option>

				<option value="https://api.maptiler.com/maps/pastel/{z}/{x}/{y}.png">
					<?php
					_e('MapTiler Pastel', 'wp-google-maps');
					?> *
				</option>

				<option value="https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png">
					<?php
					_e('MapTiler Basic', 'wp-google-maps');
					?> *
				</option>
				
				<option value="https://caltopo.com/tile/mb_topo/{z}/{x}/{y}.png">
					<?php
					_e('Caltopo', 'wp-google-maps');
					?> *
				</option>

				<option value="custom_override">
					<?php
					_e('Other (Enter URL)', 'wp-google-maps');
					?>
				</option>
				
			</select> 
			<small>&nbsp; * <?php _e("You can add an API key under the Advanced Settings tab if required by your TileServer provider", "wp-google-maps"); ?></small>
		</fieldset>
		
		<fieldset data-required-maps-engine="open-layers">
			<legend class='wpgmza_tile_server_override_component wpgmza-hidden'><?php _e('Custom Tile Server URL', 'wp-google-maps'); ?></legend>
			<input  class='wpgmza_tile_server_override_component wpgmza-hidden' name="tile_server_url_override" placeholder="https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
		</fieldset>

		<fieldset data-required-maps-engine="google-maps">
			<legend>
				<?php _e('Load Maps Engine API', 'wp-google-maps'); ?>
			</legend>
			<select name="wpgmza_load_engine_api_condition">
				<option value="where-required">
					<?php
					_e('Where required', 'wp-google-maps');
					?>
				</option>
				<option value="always">
					<?php
					_e('Always', 'wp-google-maps');
					?>
				</option>
				<option value="only-front-end">
					<?php
					_e('Only Front End', 'wp-google-maps');
					?>
				</option>
				<option value="only-back-end">
					<?php
					_e('Only Back End', 'wp-google-maps');
					?>
				</option>
				<option value="never">
					<?php
					_e('Never', 'wp-google-maps');
					?>
				</option>
			</select>
		</fieldset>
		
		<fieldset>
			<legend><?php _e('Always include engine API on pages', 'wp-google-maps'); ?></legend>
			<input name="wpgmza_always_include_engine_api_on_pages" placeholder="<?php _e('Page IDs'); ?>"/>
		</fieldset>
		
		<fieldset>
			<legend><?php _e('Always exclude engine API on pages', 'wp-google-maps'); ?></legend>
			<input name="wpgmza_always_exclude_engine_api_on_pages" placeholder="<?php _e('Page IDs'); ?>"/>
		</fieldset>
		
		<fieldset>
			<legend><?php _e('Prevent other plugins and theme loading API', 'wp-google-maps'); ?></legend>
			<input name="wpgmza_prevent_other_plugins_and_theme_loading_api" type="checkbox"/>
			<small>
				<?php
				_e("Use this setting if you are experiencing Google Maps API issues, such as invalid key warnings, or Multiple API warnings", "wp-google-maps");
				?>
			</small>
		</fieldset>
		
		<fieldset>
			<legend><?php _e("Lowest level of access to the map editor","wp-google-maps"); ?></legend>
			<select name="wpgmza_settings_access_level">
				<option value="manage_options"><?php _e('Admin', 'wp-google-maps'); ?></option>
				<option value="edit_pages"><?php _e('Editor', 'wp-google-maps'); ?></option>
				<option value="edit_published_posts"><?php _e('Author', 'wp-google-maps'); ?></option>
				<option value="edit_posts"><?php _e('Contributor', 'wp-google-maps'); ?></option>
				<option value="read"><?php _e('Subscriber', 'wp-google-maps'); ?></option>
			</select>
		</fieldset>

		<fieldset>
			<legend><?php _e("Retina Icon Width","wp-google-maps"); ?></legend>
			<span class="settings-group">
				<input name='wpgmza_settings_retina_width' type='text' size='4' maxlength='4' id='wpgmza_settings_retina_width'/> px
			</span>
		</fieldset>
		<fieldset>
			<legend><?php _e("Retina Icon Height","wp-google-maps"); ?></legend>
			<span class="settings-group">
				<input name='wpgmza_settings_retina_height' type='text' size='4' maxlength='4' id='wpgmza_settings_retina_height'/> px
			</span>
		</fieldset>

		
		<!-- NB: Usage tracking dropped as of 2018 GDPR changes -->
		
		<fieldset>
			<legend><?php _e("Greedy Gesture Handling","wp-google-maps"); ?></legend>
			<input name="wpgmza_force_greedy_gestures" type="checkbox"/>
			<small>
				<?php
				_e("Check this setting to disable two finger pan on mobiles, and Ctrl + Zoom on desktops. Enabling this setting will allow one finger panning on mobiles, and will enable zoom without Ctrl on desktops.", "wp-google-maps");
				?>
			</small>
		</fieldset>
		
		<fieldset class="wpgmza-pro-feature wpgmza-pro-feature-hide">
			<legend>
				<?php
				_e("Disable Lightbox", "wp-google-maps");
				?>
			</legend>
			<input name="disable_lightbox_images" type="checkbox"/>
			<small>
				<?php
				_e("Prevents the larger image lightbox from opening up when pictures in the infowindow or marker listing are clicked", "wp-google-maps");
				?>
			</small>
		</fieldset>

		<fieldset class="wpgmza-pro-feature wpgmza-pro-feature-hide">
			<legend>
				<?php
				_e("Gallery Image Size", "wp-google-maps");
				?>
			</legend>
			<select name="gallery_item_source_size">
				<option value="full"><?php _e('Full', 'wp-google-maps'); ?></option>
				<option value="large"><?php _e('Large', 'wp-google-maps'); ?></option>
				<option value="medium"><?php _e('Medium', 'wp-google-maps'); ?></option>
				<option value="small"><?php _e('Small', 'wp-google-maps'); ?></option>
				<option value="thumbnail"><?php _e('Thumbnail', 'wp-google-maps'); ?></option>
			</select>

			<small>
				<?php _e("Only applies to new images, existing markers would need to be resaved, lightboxes will use full size", "wp-google-maps"); ?>
			</small>
		</fieldset>
	</div>
	
	<div id="info-windows">

	<fieldset class="wpgmza-pro-feature-hide">
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
								title="<?php esc_attr_e('No Global Setting', 'wp-google-maps'); ?>"
								class="wpgmza_mlist_selection"
								/>
				
							<span class='wpgmza-infowindow-style__name'>
								<?php
								_e('No Global Setting', 'wp-google-maps');
								?>
							</span>
						</div>
					</div>
				</label>
			</div>
		</fieldset>

		<fieldset class="wpgmza-pro-feature-hide">
			<legend><?php _e("Resize Images", "wp-google-maps"); ?></legend>

			<div class='switch'>
				<input name='wpgmza_settings_image_resizing' 
					class='cmn-toggle cmn-toggle-round-flat' 
					type='checkbox' 
					id='wpgmza_settings_image_resizing' value='yes'/>
					<label for='wpgmza_settings_image_resizing'>
					</label>
			</div>
			<?php 
				esc_html_e("Resize all images to the below sizes","wp-google-maps"); 
			?>
			
		</fieldset>

		<fieldset class="wpgmza-pro-feature-hide">
			<legend><?php _e("Default Image Width", "wp-google-maps"); ?></legend>

			<input name='wpgmza_settings_image_width' type='text' size='4' maxlength='4' id='wpgmza_settings_image_width'/>
			<em><?php esc_html_e("(can be left blank - max width will be limited to max infowindow width)","wp-google-maps"); ?></em>	
		</fieldset>

		<fieldset class="wpgmza-pro-feature-hide">
			<legend><?php _e("Default Image Height", "wp-google-maps"); ?></legend>

			<input name='wpgmza_settings_image_height' type='text' size='4' maxlength='4' id='wpgmza_settings_image_height'/>
			<em><?php esc_html_e("(can be left blank - leaving both the width and height blank will revert to full size images being used)","wp-google-maps"); ?></em>	
		</fieldset>

		<fieldset class="wpgmza-pro-feature-hide">
			<legend><?php _e("Max InfoWindow Width", "wp-google-maps"); ?></legend>

			<input name='wpgmza_settings_infowindow_width' type='text' size='4' maxlength='4' id='wpgmza_settings_infowindow_width'/>
			<em><?php esc_html_e("(can be left blank - leaving both the width and height blank will revert to full size images being used)","wp-google-maps"); ?></em>	
		</fieldset>

		<fieldset class="wpgmza-pro-feature-hide">
			<legend><?php _e("Other settings", "wp-google-maps"); ?></legend>
			
			<ul>
				<li>
					<div class='switch'>
						<input name='wpgmza_settings_infowindow_links' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_infowindow_links' 
							value='yes'/> 
						<label for='wpgmza_settings_infowindow_links'></label>
					</div>
					<?php 
					esc_html_e("Open links in a new window ","wp-google-maps"); 
					?><em><?php esc_html_e("(Tick this if you want to open your links in a new window)","wp-google-maps"); ?></em>	
				</li>
				<li>
					<div class='switch'>
						<input name='wpgmza_settings_infowindow_address' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_infowindow_address' 
							value='yes'/> 
						<label for='wpgmza_settings_infowindow_address'></label>
					</div>
					<?php 
					esc_html_e("Hide the address field","wp-google-maps"); 
					?>
				</li>

				<!-- Hide Categories -->
				<li>
					<div class='switch'>
						<input name='infowindow_hide_category' id='infowindow_hide_category' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' value='yes'/> 
						<label for='infowindow_hide_category'></label>
					</div>
					<?php esc_html_e("Hide the category field","wp-google-maps");  ?>
				</li>
			</ul>
		</fieldset>

		<fieldset class="wpgmza-pro-feature-hide">
			<legend><?php _e("Link text", "wp-google-maps"); ?></legend>

			<input name='wpgmza_settings_infowindow_link_text' type='text' id='wpgmza_settings_infowindow_link_text'/>
		</fieldset>
		
		<fieldset>
			<legend><?php _e("Open Marker InfoWindows by", "wp-google-maps"); ?></legend>
			
			<ul>
				<li>
					<label>
						<input name="wpgmza_settings_map_open_marker_by" value="1" type="radio" checked="checked"/>
						<?php _e('Click', 'wp-google-maps'); ?>
					</label>
				</li>
				<li>
					<label>
						<input name="wpgmza_settings_map_open_marker_by" value="2" type="radio"/>
						<?php _e('Hover', 'wp-google-maps'); ?>
					</label>
				</li>
			</ul>
		</fieldset>
		
		<fieldset>
			<legend><?php _e('Disable InfoWindows', 'wp-google-maps'); ?></legend>
			<input name="wpgmza_settings_disable_infowindows" type="checkbox"/>
			<small>
				<?php
				_e("Enabling this setting will prevent any infowindows from opening for all your maps", "wp-google-maps");
				?>
			</small>
		</fieldset>
	</div>
	
	<!-- class="wpgmza-pro-feature" -->
	<div id="marker-listing">
	
		<h3>
			<?php 
			esc_html_e("Marker Listing Settings","wp-google-maps"); 
			?>
		</h3>
		
		<p>
			<?php
			esc_html_e("Changing these settings will alter the way the marker list appears on your website.","wp-google-maps");
			?>
		</p>
	
		<div class="update-nag update-att wpgmza-upsell">
			<i class="fa fa-arrow-circle-right"></i>
			<a target="_blank"
				href="<?php 
				
					echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mlisting_settings"));
				
				?>">
				
				<?php _e('Add Beautiful Marker Listings
			</a> 
			to your maps with the Pro version for only $39.99 once off. Support and updates included forever.', 'wp-google-maps');
			?>
			
		</div>
		
		<h4>
			<?php 
			esc_html_e("Advanced Marker Listing","wp-google-maps"); 
			?> 
			&amp; 
			<?php 
			esc_html_e("Basic Marker Listings","wp-google-maps"); 
			?>
		</h4>
		
		<fieldset class="wpgmza-pro-feature">
		
			<legend>
				<?php
				_e("Column Visibility", "wp-google-maps");
				?>
			</legend>
			
			<ul>
				<li>
					<div class='switch'>
						<input name='wpgmza_settings_markerlist_icon' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_icon' value='yes'/> 
							
						<label for='wpgmza_settings_markerlist_icon'></label>
					</div>
					<?php 
					esc_html_e("Hide the Icon column","wp-google-maps"); 
					?>
				</li>
				
				<li>
					<div class='switch'>
						<input name='wpgmza_settings_markerlist_link' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_link' 
							value='yes'/> 
						<label for='wpgmza_settings_markerlist_link'></label>
					</div>
					<?php 
					esc_html_e("Hide the Link column","wp-google-maps"); 
					?>
				</li>
				
				<li>
					 <div class='switch'>
						<input name='wpgmza_settings_markerlist_title' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_title' value='yes'/>
						<label for='wpgmza_settings_markerlist_title'></label>
					</div>
					<?php 
					esc_html_e("Hide the Title column","wp-google-maps"); 
					?>
				</li>
				
				<li>
					<div class='switch'>
						<input name='wpgmza_settings_markerlist_address' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_address' 
							value='yes'/> 
						<label for='wpgmza_settings_markerlist_address'></label>
					</div>
					<?php 
					esc_html_e("Hide the Address column","wp-google-maps"); 
					?>
				</li>
				
				<li>
					<div class='switch'>
						<input name='wpgmza_settings_markerlist_category' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_category' 
							value='yes'/> 
						<label for='wpgmza_settings_markerlist_category'></label>
					</div> 
					<?php 
					esc_html_e("Hide the Category column","wp-google-maps"); 
					?>
				</li>
				
				<li>
					<div class='switch'>
						<input name='wpgmza_settings_markerlist_description' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_description' 
							value='yes'/>
						<label for='wpgmza_settings_markerlist_description'></label>
					</div>
					<?php 
					esc_html_e("Hide the Description column","wp-google-maps"); 
					?>
				</li>
				
				
				
			</ul>
		
		</fieldset>

		<fieldset class="wpgmza-pro-feature">
		
			<legend>
				<?php
				_e("Dependencies", "wp-google-maps");
				?>
			</legend>
			
			<ul>
				<li>
					<div class='switch'>
						<input name='wpgmza_do_not_enqueue_datatables' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_do_not_enqueue_datatables' 
							value='yes'/>
						<label for='wpgmza_do_not_enqueue_datatables'></label>
					</div>
					<?php 
					esc_html_e("Do not Enqueue Datatables","wp-google-maps"); 
					?>
				</li>
			</ul>
		</fieldset>
		
		<fieldset class="wpgmza-pro-feature">
			<legend>
				<?php 
				esc_html_e("Show X items by default","wp-google-maps"); 
				?>
			</legend>
			
			<select id='wpgmza_default_items' name='wpgmza_default_items'>
				<option value="1">1</option>
				<option value="5">5</option>
				<option value="10">10</option>
				<option value="25">25</option>
				<option value="50">50</option>
				<option value="100">100</option>
				<option value="-1">ALL</option>
			</select>
		</fieldset>
		
		<h4>
			<?php 
			esc_html_e("Carousel Marker Listing","wp-google-maps"); 
			?>
		</h4>
		
		<fieldset class="wpgmza-pro-feature">
			<legend>
				<?php 
				esc_html_e("Theme selection","wp-google-maps"); 
				?>
			</legend>

			<select id='wpgmza_settings_carousel_markerlist_theme' 
			name='wpgmza_settings_carousel_markerlist_theme'>
				<option value="sky">
					<?php 
					esc_html_e("Sky","wp-google-maps"); 
					?>
				</option>
				<option value="sun">
					<?php 
					esc_html_e("Sun","wp-google-maps"); 
					?>
				</option>
				<option value="earth">
					<?php 
					esc_html_e("Earth","wp-google-maps"); 
					?>
				</option>
				<option value="monotone">
					<?php 
					esc_html_e("Monotone","wp-google-maps"); 
					?>
				</option>
				<option value="pinkpurple">
					<?php 
					esc_html_e("PinkPurple","wp-google-maps"); ?>
				</option>
				<option value="white">
					<?php 
					esc_html_e("White","wp-google-maps"); 
					?>
				</option>
				<option value="black">
					<?php 
					esc_html_e("Black","wp-google-maps"); 
					?>
				</option>
			</select>
		</fieldset>
		
		<fieldset class="wpgmza-pro-feature">
			<legend>
				<?php
				_e("Field Visibility", "wp-google-maps");
				?>
			</legend>
			
			<ul>
				<li>
					<div class='switch'><input name='wpgmza_settings_carousel_markerlist_image' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='wpgmza_settings_carousel_markerlist_image' value='yes'/><label for='wpgmza_settings_carousel_markerlist_image'></label></div>
					<?php esc_html_e("Hide the Image","wp-google-maps"); ?><br />
				</li>
				
				<li>
					<div class='switch'><input name='wpgmza_settings_carousel_markerlist_title' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='wpgmza_settings_carousel_markerlist_title' value='yes'/><label for='wpgmza_settings_carousel_markerlist_title'></label></div> <?php esc_html_e("Hide the Title","wp-google-maps"); ?>
				</li>
				
				<li>
					<div class='switch'><input name='wpgmza_settings_carousel_markerlist_icon' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='wpgmza_settings_carousel_markerlist_icon' value='yes'/><label for='wpgmza_settings_carousel_markerlist_icon'></label></div> <?php esc_html_e("Hide the Marker Icon","wp-google-maps"); ?>
				</li>
				
				<li>
					<div class='switch'><input name='wpgmza_settings_carousel_markerlist_address' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='wpgmza_settings_carousel_markerlist_address' value='yes'/><label for='wpgmza_settings_carousel_markerlist_address'></label></div> <?php esc_html_e("Hide the Address","wp-google-maps"); ?>
				</li>
				
				<li>
					<div class='switch'><input name='wpgmza_settings_carousel_markerlist_description' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='wpgmza_settings_carousel_markerlist_description' value='yes'/><label for='wpgmza_settings_carousel_markerlist_description'></label></div> <?php esc_html_e("Hide the Description","wp-google-maps"); ?>
				</li>
				
				<li>
					<div class='switch'><input name='wpgmza_settings_carousel_markerlist_marker_link' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='wpgmza_settings_carousel_markerlist_marker_link' value='yes'/><label for='wpgmza_settings_carousel_markerlist_marker_link'></label></div> <?php esc_html_e("Hide the Marker Link","wp-google-maps"); ?>
				</li>
				
				<li>
					<div class='switch'><input name='wpgmza_settings_carousel_markerlist_directions' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='wpgmza_settings_carousel_markerlist_directions' value='yes'/><label for='wpgmza_settings_carousel_markerlist_directions'></label></div> <?php esc_html_e("Hide the Directions Link","wp-google-maps"); ?>
				</li>
			</ul>
		</fieldset>

		<fieldset class="wpgmza-pro-feature">
		
			<legend>
				<?php
				esc_html_e("Image and Carousel options", "wp-google-maps");
				?>
			</legend>
		
			<ul>
				<li>
					<div class='switch'><input name='wpgmza_settings_carousel_markerlist_resize_image' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='wpgmza_settings_carousel_markerlist_resize_image' value='yes'/><label for='wpgmza_settings_carousel_markerlist_resize_image'></label></div> <?php esc_html_e("Resize Images with Timthumb","wp-google-maps"); ?>
				</li>
				
				<li>
					<div class='switch'><input name='carousel_lazyload' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='carousel_lazyload' value='yes'/><label for='carousel_lazyload'></label></div> <?php esc_html_e("Enable lazyload of images","wp-google-maps"); ?>
				</li>
				
				<li>
					<div class='switch'><input name='carousel_autoheight' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='carousel_autoheight' value='yes'/><label for='carousel_autoheight'></label></div> <?php esc_html_e("Enable autoheight","wp-google-maps"); ?>
				</li>
				
				<li>
					<div class='switch'><input name='carousel_pagination' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='carousel_pagination' value='yes'/> <label for='carousel_pagination'></label></div><?php esc_html_e("Enable pagination","wp-google-maps"); ?>
				</li>
				
				<li>
					<div class='switch'><input name='carousel_navigation' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' id='carousel_navigation' value='yes'/><label for='carousel_navigation'></label></div> <?php esc_html_e("Enable navigation","wp-google-maps"); ?>
				</li>
				
				
			</ul>
			
		</fieldset>

		<fieldset class="wpgmza-pro-feature">
		
			<legend>
				<?php
				_e("Dependencies", "wp-google-maps");
				?>
			</legend>
			
			<ul>
				<li>
					<div class='switch'>
						<input name='wpgmza_do_not_enqueue_owl_carousel' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_do_not_enqueue_owl_carousel' 
							value='yes'/>
						<label for='wpgmza_do_not_enqueue_owl_carousel'></label>
					</div>
					<?php 
					esc_html_e("Do not Enqueue Owl Carousel","wp-google-maps"); 
					?>
				</li>

				<li>
					<div class='switch'>
						<input name='wpgmza_do_not_enqueue_owl_carousel_themes' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_do_not_enqueue_owl_carousel_themes' 
							value='yes'/>
						<label for='wpgmza_do_not_enqueue_owl_carousel_themes'></label>
					</div>
					<?php 
					esc_html_e("Do not Enqueue Owl Theme","wp-google-maps"); 
					?>
				</li>
			</ul>
		</fieldset>
		
		<fieldset class="wpgmza-pro-feature">
			<legend>
				<?php
				esc_html_e("Responsivity Settings", "wp-google-maps")
				?>
			</legend>
			
			<ul>
				<li>
					<input name='carousel_items' type='text' id='carousel_items' value="5"/> 
					<?php esc_html_e("Items","wp-google-maps"); ?>
				</li>
				
				<li>	
					<input name='carousel_items_tablet' type='text' id='carousel_items_tablet' value="3"/>
					<?php esc_html_e("Items (Tablet)","wp-google-maps"); ?>
				</li>
				
				<li>
					<input name='carousel_items_mobile' type='text' id='carousel_items_mobile' value="1"/>
					<?php esc_html_e("Items (Mobile)","wp-google-maps"); ?>
				</li>
				
				<li>
					<input name='carousel_autoplay' type='text' id='carousel_autoplay' value="5000"/>
					<?php esc_html_e("Autoplay after x milliseconds (1000 = 1 second)","wp-google-maps"); ?>
				</li>
			</ul>
		</fieldset>
		
	</div>
	
	<div id="store-locator">
		<fieldset>
			<legend><?php _e('Store Locator Radii', 'wp-google-maps'); ?></legend>
			<label>
				<input name="wpgmza_store_locator_radii" pattern="^\d+(,\s*\d+)*$"/>
				<p>
					<small>
						<?php _e('Use a comma to separate values, eg: 1, 5, 10, 50, 100', 'wp-google-maps'); ?>
					</small>
				</p>
			</label>
		</fieldset>
	</div>
	
	<div id="advanced-settings">
		<h3><?php _e('API Keys', 'wp-google-maps'); ?></h3>
		
		<fieldset data-required-maps-engine="google-maps">
			<legend><?php _e('Google Maps API Key (required)', 'wp-google-maps'); ?></legend>
			<label>
				<input name="wpgmza_google_maps_api_key" id='wpgmza_google_maps_api_key' style='width: 400px;'/>
				<small style="margin-left: 5px"><a href="<?php echo admin_url('admin.php?page=wp-google-maps-menu&action=installer'); ?>"><?php esc_html_e("Open Installer", "wp-google-maps"); ?></a></small>

				<p>
					<small>
						<?php
						_e("This API key can be obtained from 
						the <a href='https://wpgmaps.com/google-maps-developer-console/' target='_BLANK'>Google Developers Console</a>. Our <a href='http://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/' target='_BLANK'>documentation</a> provides a full guide on how to obtain this.", "wp-google-maps");
						?>
					</small>
				</p>
			</label>
		</fieldset>
		
		<fieldset data-required-maps-engine="google-maps" class="wpgmza-pro-feature">
			<legend class="wpgmza-pro-feature-hide">
				<?php
				_e("Alternative Import API Key", "wp-google-maps");
				?>
			</legend>
			<label class="wpgmza-pro-feature-hide">
				<input name="importer_google_maps_api_key"/>
				<p>
					<small>
						<?php
						_e("Generate an IP restricted key to paste into this field if you are experiencing 'Request Denied' when running imports", "wp-google-maps");
						?>
					</small>
				</p>
			</label>
		</fieldset>
		
		<fieldset data-required-maps-engine="open-layers">
			<legend>
				<?php echo __('OpenLayers Tileserver Key', 'wp-google-maps'); ?>
			</legend>
			<label>
				<input name='open_layers_api_key'/>
				<p>
					<small>
						<?php _e("This is an optional API key provided by your preferred OpenLayers tile service, and should only be added if required by the TileServer provider", "wp-google-maps"); ?>
					</small>
				</p>

			</label>
			
		</fieldset>

		<fieldset data-required-maps-engine="open-layers" class="wpgmza-pro-feature">
			<legend class="wpgmza-pro-feature-hide">
				<?php echo __('OpenRouteService Key', 'wp-google-maps'); ?>
			</legend>
			<label class="wpgmza-pro-feature-hide">
				<input name='open_route_service_key'/>
				<p>
					<small>
						<?php _e("This API key can be obtained from the <a href='https://openrouteservice.org/dev/#/login' target='_BLANK'>OpenRouteService Developers Console</a>.", "wp-google-maps"); ?>
					</small>
				</p>

			</label>
			
		
		</fieldset>


		
		<h3>
			<?php
			esc_html_e("Marker Data Location", "wp-google-maps");
			?>
		</h3>
		
		<p>
			<?php
			esc_html_e("We suggest that you change the two fields below ONLY if you are experiencing issues when trying to save the marker XML files.", "wp-google-maps");
			?>
		</p>
		
		<fieldset>
			<legend><?php esc_html_e("Pull marker data from", "wp-google-maps"); ?></legend>
			
			<ul>
				<li>
					<label>
						<input name="wpgmza_settings_marker_pull" value="0" type="radio" checked="checked"/>
						<?php
						esc_html_e("Database", "wp-google-maps");
						?>
					</label>
				</li>
				<li>
					<label>
						<input name="wpgmza_settings_marker_pull" value="1" type="radio"/>
						<?php
						esc_html_e("XML File", "wp-google-maps");
						?>
					</label>
				</li>
			</ul>
		</fieldset>
		
		<fieldset id="xml-cache-settings">
		
			<fieldset>
				<legend><?php esc_html_e("Marker data XML directory", "wp-google-maps"); ?></legend>
				<input name="wpgmza_marker_xml_location" class="regular-text code"/>
				<p>
					<small>
						<?php esc_html_e("You can use the following", "wp-google-maps"); ?>
						: {wp_content_dir},{plugins_dir},{uploads_dir}
					</small>
				</p>
				<p>
					<small>
						<?php esc_html_e("Currently using", "wp-google-maps"); ?>
						<strong>
							NB: Add $marker_location here
						</strong>
					</small>
				</p>
				<!-- NB: See wpgmza_file_perms_check in legacy-core.php -->
			</fieldset>
			
			<fieldset>
				<legend><?php esc_html_e("Marker data XML URL", "wp-google-maps"); ?></legend>
				<input name="wpgmza_marker_xml_url" class="regular-text code"/>
				<p>
					<small>
						<?php esc_html_e("You can use the following", "wp-google-maps"); ?>
						: {wp_content_dir},{plugins_dir},{uploads_dir}
					</small>
				</p>
				<p>
					<small>
						<?php esc_html_e("Currently using", "wp-google-maps"); ?>
						<strong>
							NB: Add $marker_url here
						</strong>
					</small>
				</p>
				<!-- NB: See wpgmza_file_perms_check in legacy-core.php -->
			</fieldset>
			
		</fieldset>
		
		<!--<fieldset id="library-script-panel-container"></fieldset>-->
		
		<h3><?php esc_html_e('Custom Scripts', 'wp-google-maps'); ?></h3>
		
		<fieldset class='wpgmza-code-mirror-legacy-port'>
			<legend>
				<?php esc_html_e('Custom CSS', 'wp-google-maps'); ?>
			</legend>
			<textarea name="wpgmza_custom_css"></textarea>
		</fieldset>
		
		<fieldset class='wpgmza-code-mirror-legacy-port'>
			<legend>
				<?php esc_html_e('Custom JS', 'wp-google-maps'); ?>
			</legend>
			<textarea name="wpgmza_custom_js"></textarea>
		</fieldset>
		
		<h3 data-required-maps-engine="open-layers"><?php esc_html_e('Other Caching', 'wp-google-maps'); ?></h3>
		
		<fieldset data-required-maps-engine="open-layers">
			<legend>
				<?php _e("Flush Geocode Cache", "wp-google-maps"); ?>
			</legend>
			<button id="wpgmza_flush_cache_btn" class="button-primary">
				<?php _e('Flush', 'wp-google-maps'); ?>
			</button>
		</fieldset>
		
		<h3><?php esc_html_e('Danger Zone', 'wp-google-maps'); ?></h3>
		<?php echo wpgmaps_danger_zone_nonce(); ?>
		<fieldset id="wpgmza-destroy-data" class='wpgmza-danger-zone'>
			<legend><?php esc_html_e("Data Management", "wp-google-maps"); ?></legend>
			
			<p>
				<label>
					<button danger="wpgmza_destroy_all_data" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza_general_btn button button-secondary">Complete Reset</button>
					
						<small class="wpgmza-button-hint-small">
							<?php
							esc_html_e('This will delete all settings, maps, markers, shapes, categories, and custom fields and reset the plugin back to the first time you used it.', 'wp-google-maps');
							?>
						</small>
					
				</label>
			</p>
			<p>&nbsp;</p>
			<p>
				<label>
					<button danger="wpgmza_reset_all_settings" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza_general_btn button button-secondary">Reset all settings</button>
					
						<small class="wpgmza-button-hint-small">
							<?php
							esc_html_e('This will reset all settings back to their default.', 'wp-google-maps');
							?>
						</small>
					
				</label>
			</p>
			<p>&nbsp;</p>
			<p class="wpgmza-pro-feature-hide">
				<label>
					<button danger="wpgmza_destroy_maps" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza_general_btn button button-secondary">Delete all maps</button>
					
						<small class="wpgmza-button-hint-small">
							<?php
							esc_html_e('This will delete all maps, markers, shapes, categories, and custom fields.', 'wp-google-maps');
							?>
						</small>
					
				</label>
			</p>
			<p>
				<label>
					<button danger="wpgmza_destroy_markers" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza_general_btn button button-secondary">Delete all markers</button>
					
						<small class="wpgmza-button-hint-small">
							<?php
							esc_html_e('This will delete all markers.', 'wp-google-maps');
							?>
						</small>
					
				</label>
			</p>
			<p>
				<label>
					<button danger="wpgmza_destroy_shapes" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza_general_btn button button-secondary">Delete all shapes</button>
					
						<small class="wpgmza-button-hint-small">
							<?php
							esc_html_e('This will delete all shapes.', 'wp-google-maps');
							?>
						</small>
					
				</label>
			</p>
			
		</fieldset>


		<h3><?php esc_html_e('Miscellaneous Settings', 'wp-google-maps'); ?></h3>
		
		<fieldset>
			<legend><?php esc_html_e('Disable Compressed Path Variables', 'wp-google-maps'); ?></legend>
			<label>
				<input name="disable_compressed_path_variables" type="checkbox"/>

					<small>
						<?php
						esc_html_e('We recommend using this setting if you frequently experience HTTP 414 - Request URI too long. We do not recommend using this setting if your site uses REST caching or a CDN.', 'wp-google-maps');
						?>
					</small>

			</label>
		</fieldset>
		
		<fieldset>
			<legend><?php esc_html_e("Disable Autoptimize Compatibility Fix", "wp-google-maps"); ?></legend>
			<label>
				<input name="disable_autoptimize_compatibility_fix" type="checkbox"/>
				
					<small>
						<?php
						esc_html_e("Use this setting if you are experiencing issues with Autoptimize's CSS aggregation. This may cause issues on setups with a large amount of marker data.", "wp-google-maps");
						?>
					</small>
				
			</label>
		</fieldset>
		

		<fieldset>
			<legend><?php esc_html_e("Enable Dynamic SQL Refactors", "wp-google-maps"); ?></legend>
			<label>
				<input name="enable_dynamic_sql_refac_filter" type="checkbox"/>
				
					<small>
						<?php
						esc_html_e("Use this setting if your marker/map lists are not loading, or no results are being returned throughout the system. Commonly recommend in situations where single quote queries are not allowed. (WP Engine Users)", "wp-google-maps");
						?>
					</small>
				
			</label>
		</fieldset>

		<fieldset id="wpgmza-disable-automatic-backups" class="wpgmza-pro-feature">
			<legend><?php esc_html_e("Disable Automatic Backups (beta)", "wp-google-maps"); ?></legend>
			<label>
				<input name="disable_automatic_backups" type="checkbox"/>
				
					<small>
						<?php
						esc_html_e('We recommend leaving automatic backups enabled. We will automatically backup your data before an import or update to our plugin.', 'wp-google-maps');
						?>
					</small>
				
			</label>
		</fieldset>

		<fieldset id="wpgmza-disable-google-fonts" data-required-maps-engine="google-maps">
			<legend><?php esc_html_e("Prevent Google Fonts (beta)", "wp-google-maps"); ?></legend>
			<label>
				<input name="disable_google_fonts" type="checkbox"/>
				
					<small>
						<?php
						esc_html_e('Use this setting to prevent the Google Maps API from loading externally hosted fonts. This is a highly experimental option and may lead to unexpected layout changes. We recommend loading fonts from a local source when this is enabled.', 'wp-google-maps');
						?>
					</small>
				
			</label>
		</fieldset>
		
		<fieldset id="wpgmza-developer-mode">
			<legend><?php esc_html_e("Developer Mode", "wp-google-maps"); ?></legend>
			<label>
				<input name="wpgmza_developer_mode" type="checkbox"/>
				
					<small>
						<?php
						esc_html_e('Always rebuilds combined script files and script cache, does not load combined and minified scripts. Includes database query SQL with REST API responses.', 'wp-google-maps');
						?>
					</small>
				
			</label>
		</fieldset>

		
		
	</div>
	
	<div id="gdpr-compliance">
	<div id="wpgmza-gdpr-compliance">
	
	<div>
		<h3><?php _e( 'GDPR Compliance', 'wp-google-maps' ); ?></h3>
		<p>
			<?php
			_e('Our GDPR notice will be displayed whenever the agreement cookie is not set. Agreeing to the notice will set this cookie.', 'wp-google-maps');
			?>
		</p>
		<p>
			<?php
			_e('Some caching and optimization plugins will continue to serve your map page with the GDPR agreement, disregarding this cookie. In this instance, clicking "I Agree" will reload the page and appear to have no effect. To solve this issue, we recommend you exclude your map page from caching and optimization.', 'wp-google-maps');
			?>
		</p>
	</div>
	

	<div id="wpgmza-gpdr-general-compliance">
	
		<h2>
			<?php _e('General Complicance', 'wp-google-maps'); ?>
		</h2>
		

		<fieldset>
		
			<label for="wpgmza_gdpr_require_consent_before_load">
				<?php
				_e('Require consent before loading Maps API', 'wp-google-maps');
				?>
				<i class="fa fa-question-circle" 
					title="<?php _e('The GDPR views IP Addresses as Personal Data, which requires consent before being processed. Loading the Google Maps API stores some user information, such as IP Addresses. WP Go Maps endeavours to uphold the spirit of data protection as per the GDPR. Enable this to option to prevent the Maps API from loading, until a user has consented to it.', 'wp-google-maps'); ?>"/>
			</label>
			<input name="wpgmza_gdpr_require_consent_before_load" type="checkbox"/>
		</fieldset>
		
		<span class="notice notice-error wpgmza-complianz-notice wpgmza-hidden" style="margin-left: 0; display: block;">
			<strong><?php _e("Important Note", "wp-google-maps"); ?>:</strong>
			<?php
				_e('GDPR consent automatically enabled and configured by Complianz', 'wp-google-maps');
			?>
			<br><br>
			<?php
				_e('WP Go Maps GDPR options have been disabled as they are fully controlled by Complianz', 'wp-google-maps');
			?>
		</span>
	</div>

	
	<div id="wpgmza-gdpr-compliance-notice" style="display: none;">
		
		<h2>
			<?php _e('GDPR Consent Notice', 'wp-google-maps'); ?>
		</h2>
		
		<fieldset>
			<legend>
				<label for="wpgmza_gdpr_default_notice">
					<?php
					_e('GDPR Notice', 'wp-google-maps');
					?>
					<i class="fa fa-question-circle" 
						title="<?php _e('Users will be asked to accept the notice shown here, in the form of a check box.', 'wp-google-maps'); ?>"></i>
				</label>
			</legend>
			<div name="wpgmza_gdpr_default_notice"></div>
		</fieldset>
		
		<fieldset>
			<legend>
				<label for="wpgmza_gdpr_company_name">
					<?php
					_e('Company Name', 'wp-google-maps');
					?>
				</label>
			</legend>
			<span class="settings-group">
				<input name="wpgmza_gdpr_company_name"/>
			</span>
		</fieldset>
		
		
		<fieldset>
			<legend>
				<label for="wpgmza_gdpr_retention_purpose">
					<?php
					_e('Retention Purpose(s)', 'wp-google-maps');
					?>
				</label>
			</legend>
			<span class="settings-group">
				<div>
					<input name="wpgmza_gdpr_retention_purpose"/>
					<br/>
					<small>
						<?php
						_e('The GDPR regulates that you need to state why you are processing data.', 'wp-google-maps');
						?>
					</small>
				</div>
			</span>
		</fieldset>
		
		<fieldset>
			<legend>
				<label for="wpgmza_gdpr_override_notice">
					<?php
					_e('Override GDPR Notice', 'wp-google-maps');
					?>
					<input name="wpgmza_gdpr_override_notice" type="checkbox" id="wpgmza_gdpr_override_notice"/> 
				</label>
			</legend>
		</fieldset>
		
		<span class="notice notice-error" style="padding: 0.5em; display: block;">
			<?php
			_e('By checking this box, you agree to take sole responsibility for GDPR Compliance with regards to this plugin.', 'wp-google-maps');
			?>
		</span>

		<fieldset id="wpgmza_gdpr_override_notice_text">
			<legend>
				<label for="wpgmza_gdpr_override_notice_text">
					<?php
					_e('Override Text', 'wp-google-maps');
					?>
				</label>
			</legend>
			<span class="settings-group">
				<textarea name="wpgmza_gdpr_notice_override_text"></textarea>
			</span>
		</fieldset>
		
		
	</div>
	
	<p>
		<?php
		_e('For more information about WPGM and GDPR compliance, please refer to our <a href="https://www.wpgmaps.com/gdpr/">GDPR information page</a> and our <a href="https://www.wpgmaps.com/privacy-policy/">Privacy Policy</a>', 'wp-google-maps');
		?>
	</p>
</div>
	</div>
	
	<div class="addition-tabs">

	</div>

	<p style="text-align: right;">
		<button type="submit" class="button button-primary">
			<?php
			esc_html_e("Save Settings", "wp-google-maps");
			?>
		</button>
	</p>
	
</form>
