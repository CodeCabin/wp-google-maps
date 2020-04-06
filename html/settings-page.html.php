<form method="POST" id="wpgmza-global-settings" class="wpgmza-form">
	<ul>
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
			<a href="gdpr-compliance">
				<?php esc_html_e('GDPR Compliance', 'wp-google-maps'); ?>
			</a>
		</li>
	</ul>
	
	<div id="general-settings">
		<fieldset>
			<legend>
				<?php esc_html_e('General Map Settings', 'wp-google-maps'); ?>
			</legend>
			
			<fieldset>
				<legend>
					<?php esc_html_e('Maps Engine', 'wp-google-maps'); ?>
				</legend>
				<select name="wpgmza_maps_engine">
					<option value="open-layers"><?php esc_html_e('OpenLayers', 'wp-google-maps'); ?></option>
					<option value="google-maps"><?php esc_html_e('Google Maps', 'wp-google-maps'); ?></option>
				</select>
			</fieldset>

			<div role="group">
				<label>
					<input name="wpgmza_settings_map_full_screen_control" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
					<?php esc_html_e('Disable Full Screen Control', 'wp-google-maps'); ?>
				</label>
				
				<label>
					<input name="wpgmza_settings_map_streetview" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
					<?php esc_html_e('Disable StreetView', 'wp-google-maps'); ?>
				</label>
				
				<label>
					<input name="wpgmza_settings_map_zoom" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
					<?php esc_html_e('Disable Zoom Controls', 'wp-google-maps'); ?>
				</label>
				
				<label>
					<input name="wpgmza_settings_map_pan" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
					<?php esc_html_e('Disable Pan Controls', 'wp-google-maps'); ?>
				</label>
				
				<label>
					<input name="wpgmza_settings_map_type" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
					<?php esc_html_e('Disable Map Type Controls', 'wp-google-maps'); ?>
				</label>
				
				<label>
					<input name="wpgmza_settings_map_scroll" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
					<?php esc_html_e('Disable Mouse Wheel Zoom', 'wp-google-maps'); ?>
				</label>
				
				<label>
					<input name="wpgmza_settings_map_draggable" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
					<?php esc_html_e('Disable Mouse Dragging', 'wp-google-maps'); ?>
				</label>
				
				<label>
					<input name="wpgmza_settings_map_clickzoom" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
					<?php esc_html_e('Disable Mouse Double Click Zooming', 'wp-google-maps'); ?>
				</label>
			</div>
		</fieldset>
		
		<fieldset>
			<legend>
				<?php esc_html_e('User Interface Style', 'wp-google-maps'); ?>
			</legend>
			<select name="user_interface_style">
				<option value="bare-bones">
					<?php esc_html_e('Bare Bones', 'wp-google-maps'); ?>
				</option>
				<option value="legacy">
					<?php esc_html_e('Legacy', 'wp-google-maps'); ?>
				</option>
				<option value="default">
					<?php esc_html_e('Default', 'wp-google-maps'); ?>
				</option>
				<option value="modern">
					<?php esc_html_e('Modern', 'wp-google-maps'); ?>
				</option>
				<option value="compact">
					<?php esc_html_e('Compact', 'wp-google-maps'); ?>
				</option>
				<option value="minimal">
					<?php esc_html_e('Minimal', 'wp-google-maps'); ?>
				</option>
			</select>
		</fieldset>
		
		<fieldset>
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
		</fieldset>
		
		<fieldset>
			<legend>
				<?php esc_html_e('Use FontAwesome', 'wp-google-maps'); ?>
			</legend>
			<select name='wpgmza_use_fontawesome'>
				<option value='5.*'>5.*</option>
				<option value='4.*'>4.*</option>
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
				
				<option value="http://tile.thunderforest.com/cycle/{z}/{x}/{y}.png"
					data-preview-image="http://b.tile.opencyclemap.org/cycle/16/33199/22539.png">
					<?php
					_e('OpenCycleMap', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
					data-preview-image="https://wiki.openstreetmap.org/w/images/6/63/Humanitarian_style.png">
					<?php
					_e('Humanitarian', 'wp-google-maps');
					?>
				</option>
				
				<option value="https://{a-c}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
					data-preview-image="http://a.www.toolserver.org/tiles/bw-mapnik/9/264/179.png">
					<?php
					_e('Mapnik OSM B&amp;W', 'wp-google-maps');
					?>
				</option>
				
				<option value="https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png"
					data-preview-image="http://c.tiles.wmflabs.org/osm-no-labels/14/7452/6839.png">
					<?php
					_e('Mapnik OSM No Labels', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://a.tile.stamen.com/toner/{z}/{x}/{y}.png"
					data-preview-image="http://a.tile.stamen.com/toner/10/529/366.png">
					<?php
					_e('Stamen Toner', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg"
					data-preview-image="https://wiki.openstreetmap.org/w/images/d/d2/Tile_watercolor_stamen.jpg">
					<?php
					_e('Stamen Watercolor', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://tile.thunderforest.com/transport/{z}/{x}/{y}.png"
					data-preview-image="http://a.tile2.opencyclemap.org/transport/13/4150/2819.png">
					<?php
					_e('Transport Map', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://tile.thunderforest.com/landscape/{z}/{x}/{y}.png"
					data-preview-image="http://a.tile.thunderforest.com/landscape/14/4773/6144.png">
					<?php
					_e('Thunderforest Landscape', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png"
					data-preview-image="http://a.tile.thunderforest.com/outdoors/14/4772/6144.png">
					<?php
					_e('Thunderforest Outdoors', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://tile.memomaps.de/tilegen/{z}/{x}/{y}.png"
					data-preview-image="http://tile.memomaps.de/tilegen/12/2200/1343.png">
					<?php
					_e('Öpnvkarte', 'wp-google-maps');
					?>
				</option>
				
				<option value="http://www.openptmap.org/tiles/{z}/{x}/{y}.png"
					data-preview-image="http://www.openptmap.org/tiles//10/529/366.png">
					<?php
					_e('OpenPtMap', 'wp-google-maps');
					?>
				</option>
				
				<option value="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png">
					<?php
					_e('Carto Light (Positron)', 'wp-google-maps');
					?>
				</option>
				
				<option value="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
					data-preview-image="https://wiki.openstreetmap.org/w/images/b/ba/Cartodb_dark_tile.png">
					<?php
					_e('Carto Dark (Dark Matter)', 'wp-google-maps');
					?>
				</option>
				
				<option value="https://maps-cdn.salesboard.biz/styles/klokantech-3d-gl-style/{z}/{x}/{y}.png">
					<?php
					_e('Klokantech 3d', 'wp-google-maps');
					?>
				</option>
				
				<option value="https://caltopo.com/tile/mb_topo/{z}/{x}/{y}.png">
					<?php
					_e('Caltopo', 'wp-google-maps');
					?>
				</option>
				
			</select>
		</fieldset>
		
		<fieldset>
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
		</fieldset>
		
		<fieldset>
			<legend><?php _e("Lowest level of access to the map editor","wp-google-maps"); ?></legend>
			<select name="wpgmza_access_level">
				<option value="manage_options"><?php _e('Admin', 'wp-google-maps'); ?></option>
				<option value="edit_pages"><?php _e('Editor', 'wp-google-maps'); ?></option>
				<option value="edit_published_posts"><?php _e('Author', 'wp-google-maps'); ?></option>
				<option value="edit_posts"><?php _e('Contributor', 'wp-google-maps'); ?></option>
				<option value="read"><?php _e('Subscriber', 'wp-google-maps'); ?></option>
			</select>
		</fieldset>
		
		<!-- NB: Usage tracking dropped as of 2018 GDPR changes -->
		
		<fieldset>
			<legend><?php _e("Greedy Gesture Handling","wp-google-maps"); ?></legend>
			<input name="wpgmza_force_greedy_gestures" type="checkbox"/>
		</fieldset>
	</div>
	
	<div id="info-windows">
		<fieldset>
			<legend><?php _e("Open Marker InfoWindows by", "wp-google-maps"); ?></legend>
			
			<label>
				<input name="wpgmza_settings_map_open_marker_by" value="1" type="radio"/>
				<?php _e('Click', 'wp-google-maps'); ?>
			</label>
			<label>
				<input name="wpgmza_settings_map_open_marker_by" value="2" type="radio"/>
				<?php _e('Hover', 'wp-google-maps'); ?>
			</label>
		</fieldset>
		
		<fieldset>
			<legend><?php _e('Disable InfoWindows', 'wp-google-maps'); ?></legend>
			<input name="wpgmza_settings_disable_infowindows" type="checkbox"/>
		</fieldset>
	</div>
	
	<div id="marker-listing">
		<div class="update-nag update-att wpgmza-upsell">
			<i class="fa fa-arrow-circle-right"></i>
			<a target="_blank"
				href="<?php 
				
					echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mlisting_settings"));
				
				?>">
				
				<?php esc_html_e('Add Beautiful Marker Listings</a> to your maps with the Pro version for only $39.99 once off. Support and updates included forever.', 'wp-google-maps'); ?>
			</a>
		</div>
	
		NB: Pro settings will be added here
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
				<input name="wpgmza_google_maps_api_key"/>
				<p>
					<small>
						<?php
						_e("This API key can be obtained from the <a href='https://console.developers.google.com' target='_BLANK'>Google Developers Console</a>. Our <a href='http://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/' target='_BLANK'>documentation</a> provides a full guide on how to obtain this.", "wp-google-maps");
						?>
					</small>
				</p>
			</label>
		</fieldset>
		
		NB: OpenRouteService key field will go here
		
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
			
			<label>
				<input name="wpgmza_settings_marker_pull" value="0" type="radio"/>
				<?php
				esc_html_e("Database (Great for small amounts of markers)", "wp-google-maps");
				?>
			</label>
			<label>
				<input name="wpgmza_settings_marker_pull" value="1" type="radio"/>
				<?php
				esc_html_e("XML File  (Great for large amounts of markers)", "wp-google-maps");
				?>
			</label>
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
		
		<h3><?php esc_html_e('Custom Scripts', 'wp-google-maps'); ?></h3>
		
		<fieldset>
			<legend>
				<?php esc_html_e('Custom CSS', 'wp-google-maps'); ?>
			</legend>
			<textarea name="wpgmza_custom_css"></textarea>
		</fieldset>
		
		<fieldset>
			<legend>
				<?php esc_html_e('Custom JS', 'wp-google-maps'); ?>
			</legend>
			<textarea name="wpgmza_custom_js"></textarea>
		</fieldset>
		
		<h3><?php esc_html_e('Other Caching', 'wp-google-maps'); ?></h3>
		
		<fieldset data-required-maps-engine="open-layers">
			<legend>
				<?php _e("Flush Geocode Cache", "wp-google-maps"); ?>
			</legend>
			<button id="wpgmza_flush_cache_btn" class="button-primary">
				<?php _e('Flush', 'wp-google-maps'); ?>
			</button>
		</fieldset>
		
		<h3><?php esc_html_e('Miscellaneous Settings', 'wp-google-maps'); ?></h3>
		
		<fieldset>
			<legend><?php esc_html_e('Disable Compressed Path Variables', 'wp-google-maps'); ?></legend>
			<label>
				<input name="disable_compressed_path_variables" type="checkbox"/>
				<p>
					<small>
						<?php
						esc_html_e('We recommend using this setting if you frequently experience HTTP 414 - Request URI too long. We do not recommend using this setting if your site uses REST caching or a CDN.', 'wp-google-maps');
						?>
					</small>
				</p>
			</label>
		</fieldset>
		
		<fieldset>
			<legend><?php esc_html_e("Disable Autoptimize Compatibility Fix", "wp-google-maps"); ?></legend>
			<label>
				<input name="disable_autoptimize_compatibility_fix" type="checkbox"/>
				<p>
					<small>
						<?php
						esc_html_e("Use this setting if you are experiencing issues with Autoptimize's CSS aggregation. This may cause issues on setups with a large amount of marker data.", "wp-google-maps");
						?>
					</small>
				</p>
			</label>
		</fieldset>
		
		<fieldset id="wpgmza-developer-mode">
			<legend><?php esc_html_e("Developer Mode", "wp-google-maps"); ?></legend>
			<label>
				<input name="wpgmza_developer_mode" type="checkbox"/>
				<p>
					<small>
						<?php
						esc_html_e('Always rebuilds combined script files and script cache, does not load combined and minified scripts. Includes database query SQL with REST API responses.', 'wp-google-maps');
						?>
					</small>
				</p>
			</label>
		</fieldset>
		
	</div>
</form>