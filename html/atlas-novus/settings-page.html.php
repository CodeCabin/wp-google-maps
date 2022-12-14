<form 
	method="POST" 
	id="wpgmza-global-settings" 
	class="wpgmza-form wpgmza-tabs-container wpgmza-wrap"
	action="<?php 
		echo admin_url('admin-post.php');
	?>"
	>

	<!-- Hidden reference field -->
	<input
		type="hidden"
		name="action"
		value="wpgmza_save_settings"
		/>
	
	<!-- Tabs -->
	<ul class='settings-tabs-nav'>
		<li>
			<a href="#general-settings">
				<?php esc_html_e('General Settings', 'wp-google-maps'); ?>
			</a>
		</li>
		
		<li>
			<a href="#info-windows">
				<?php esc_html_e('Info Windows', 'wp-google-maps'); ?>
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
			<a href="#categories">
				<?php esc_html_e('Categories', 'wp-google-maps'); ?>
			</a>
		</li>

		<li>
			<a href="#gdpr-compliance">
				<?php esc_html_e('GDPR Compliance', 'wp-google-maps'); ?>
			</a>
		</li>

		<li>
			<a href="#advanced-settings">
				<?php esc_html_e('Advanced Settings', 'wp-google-maps'); ?>
			</a>
		</li>

		<li>
			<a href="#woocommerce">
				<?php esc_html_e('WooCommerce', 'wp-google-maps'); ?>
			</a>
		</li>

		<li>
			<a href="#beta-settings">
				<?php esc_html_e('Beta Settings', 'wp-google-maps'); ?>
			</a>
		</li>

		<li>
			<a href="#custom-scripts">
				<?php esc_html_e('Custom Scripts', 'wp-google-maps'); ?>
			</a>
		</li>

		<li>
			<a href="#danger-zone">
				<?php esc_html_e('Danger Zone', 'wp-google-maps'); ?>
			</a>
		</li>

		<li>
			<a href="#miscellaneous">
				<?php esc_html_e('Miscellaneous', 'wp-google-maps'); ?>
			</a>
		</li>
	</ul>
	
	<!-- General Tab -->
	<div id="general-settings">
		<div class="heading">
			<?php _e("General", "wp-google-maps"); ?>
		</div>
		
		<!-- Map Engine -->
		<div class="tab-row">
			<div class="title">
				<?php esc_html_e('Maps Engine', 'wp-google-maps'); ?>
			</div>
			<select name="wpgmza_maps_engine" id="wpgmza_maps_engine">
				<option value="google-maps"><?php esc_html_e('Google Maps', 'wp-google-maps'); ?></option>
				<option value="open-layers"><?php esc_html_e('OpenLayers', 'wp-google-maps'); ?></option>
			</select>

			<small class="wpgmza-pad-5"><a href="<?php echo admin_url('admin.php?page=wp-google-maps-menu&action=installer'); ?>"><?php esc_html_e("Open Installer", "wp-google-maps"); ?></a></small>
		</div>

		<!-- Internal Engine -->
		<div class="tab-row">
			<div class="title">
				<?php esc_html_e('Build', 'wp-google-maps'); ?>
			</div>
			<select name="internal_engine" id="internal_engine">
				<option value="legacy"><?php esc_html_e('Legacy', 'wp-google-maps'); ?></option>
				<option value="atlas-novus"><?php esc_html_e('Atlas Novus', 'wp-google-maps'); ?></option>
			</select>
		</div>
		
		<!-- OpenLayers Tile Server -->	
		<div class="tab-row" data-required-maps-engine="open-layers">
			<div class="title">
				<?php esc_html_e('Tile Server URL', 'wp-google-maps'); ?>
			</div>

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
		</div>

		<!-- OpenLayers Key Hint -->
		<div class="tab-row" data-required-maps-engine="open-layers">
			<div class="title"></div>
			<small>* <?php _e("You can add an API key under the Advanced Settings tab if required by your TileServer provider", "wp-google-maps"); ?></small>
		</div>
		
		<!-- Custom Tile Server -->
		<div class="tab-row" data-required-maps-engine="open-layers">
			<div class='title wpgmza_tile_server_override_component wpgmza-hidden'><?php _e('Custom Tile Server URL', 'wp-google-maps'); ?></div>
			<input  class='wpgmza_tile_server_override_component wpgmza-hidden' name="tile_server_url_override" placeholder="https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
		</div>
		
		<!-- Map behavior settings -->
		<div class="tab-row">
			<div class="title">
				<?php esc_html_e('Map Settings', 'wp-google-maps'); ?>
			</div>
			
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
		</div>
		
		<!-- User interface style, not applicable in atlas novus -->
		<div class="tab-row wpgmza-hidden">
			<div class="title">
				<?php esc_html_e('User Interface Style', 'wp-google-maps'); ?>
				(<em><a href='https://www.wpgmaps.com/documentation/user-interface-style-options/' target='_BLANK'><?php esc_html_e('examples', 'wp-google-maps'); ?></a></em>)
			</div>
			
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
		</div>

		<!-- Lowest access level -->
		<div class="tab-row">
			<div class="title"><?php _e("Lowest level of access to the map editor","wp-google-maps"); ?></div>
			<select name="wpgmza_settings_access_level">
				<option value="manage_options"><?php _e('Admin', 'wp-google-maps'); ?></option>
				<option value="edit_pages"><?php _e('Editor', 'wp-google-maps'); ?></option>
				<option value="edit_published_posts"><?php _e('Author', 'wp-google-maps'); ?></option>
				<option value="edit_posts"><?php _e('Contributor', 'wp-google-maps'); ?></option>
				<option value="read"><?php _e('Subscriber', 'wp-google-maps'); ?></option>
			</select>
		</div>

		<!-- Retina width -->
		<div class="tab-row wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Retina Icon Width","wp-google-maps"); ?></div>
			<span class="settings-group">
				<input name='wpgmza_settings_retina_width' type='text' size='4' maxlength='4' id='wpgmza_settings_retina_width'/> px
			</span>
		</div>

		<!-- Retina height -->
		<div class="tab-row wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Retina Icon Height","wp-google-maps"); ?></div>
			<span class="settings-group">
				<input name='wpgmza_settings_retina_height' type='text' size='4' maxlength='4' id='wpgmza_settings_retina_height'/> px
			</span>
		</div>

		<!-- Gesture Handling -->
		<div class="tab-row has-hint">
			<div class="title"><?php _e("Greedy Gesture Handling","wp-google-maps"); ?></div>
			<div role="group">
				<label>
					<div>
						<input name="wpgmza_force_greedy_gestures" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
					</div>
				</label>
			</div>
		</div>

		<!-- Gesture hint -->
		<div class="tab-row">
			<div class="title"></div>
			<small>
				<?php
				_e("Check this setting to disable two finger pan on mobiles, and Ctrl + Zoom on desktops. Enabling this setting will allow one finger panning on mobiles, and will enable zoom without Ctrl on desktops.", "wp-google-maps");
				?>
			</small>
		</div>
		
		<!-- Disable lightbox -->
		<div class="tab-row wpgmza-pro-feature wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Disable Lightbox", "wp-google-maps"); ?></div>
			<div role="group">
				<label>
					<div>
						<input name="disable_lightbox_images" class="wpgmza-fancy-toggle-switch" type="checkbox"/>
						<?php _e("Prevents the larger image lightbox from opening up when pictures in the infowindow or marker listing are clicked", "wp-google-maps"); ?>
					</div>
				</label>
			</div>
		</div>

		<!-- Gallery Image Size -->
		<div class="tab-row has-hint wpgmza-pro-feature wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Gallery Image Size", "wp-google-maps"); ?></div>
			<select name="gallery_item_source_size">
				<option value="full"><?php _e('Full', 'wp-google-maps'); ?></option>
				<option value="large"><?php _e('Large', 'wp-google-maps'); ?></option>
				<option value="medium"><?php _e('Medium', 'wp-google-maps'); ?></option>
				<option value="small"><?php _e('Small', 'wp-google-maps'); ?></option>
				<option value="thumbnail"><?php _e('Thumbnail', 'wp-google-maps'); ?></option>
			</select>
		</div>

		<div class="tab-row wpgmza-pro-feature wpgmza-pro-feature-hide">
			<div class="title"></div>
			<small>
				<?php _e("Only applies to new images, existing markers would need to be resaved, lightboxes will use full size", "wp-google-maps"); ?>
			</small>
		</div>
	</div>
	
	<!-- Info windows tab -->
	<div id="info-windows">
		<div class="heading">
			<?php _e("Info Windows", "wp-google-maps"); ?>
		</div>

		<!-- Info window style -->
		<div class="tab-row wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Infowindow Style", "wp-google-maps"); ?></div>

			<div class='wpgmza-infowindow-style-picker tab-stretch-right'>
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
				</div>
			</div>
		</div>

		<!-- Open infowindow on -->
		<div class="tab-row">
			<div class="title"><?php _e("Open Marker InfoWindows on", "wp-google-maps"); ?></div>
			
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
		</div>

		<!-- Behaviour settings -->
		<div class="tab-row wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Behaviour", "wp-google-maps"); ?></div>
			
			<ul>
				<!-- Hide Title -->
				<li>
					<div class='switch switch-inline'>
						<input name='infowindow_hide_title' id='infowindow_hide_title' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' value='yes'/> 
						<label for='infowindow_hide_title'></label>
						<?php esc_html_e("Hide the title field","wp-google-maps");  ?>
					</div>
				</li>

				<!-- Hide Address (Uses legacy naming convention) -->
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_infowindow_address' id='wpgmza_settings_infowindow_address' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' value='yes'/> 
						<label for='wpgmza_settings_infowindow_address'></label>
						<?php esc_html_e("Hide the address field","wp-google-maps");  ?>
					</div>
				</li>

				<!-- Hide Categories -->
				<li>
					<div class='switch switch-inline'>
						<input name='infowindow_hide_category' id='infowindow_hide_category' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' value='yes'/> 
						<label for='infowindow_hide_category'></label>
						<?php esc_html_e("Hide the category field","wp-google-maps");  ?>
					</div>
				</li>

				<!-- Hide Gallery -->
				<li>
					<div class='switch switch-inline'>
						<input name='infowindow_hide_gallery' id='infowindow_hide_gallery' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' value='yes'/> 
						<label for='infowindow_hide_gallery'></label>
						<?php esc_html_e("Hide the gallery/image field","wp-google-maps");  ?>
					</div>
				</li>

				<!-- Hide Descriptions -->
				<li>
					<div class='switch switch-inline'>
						<input name='infowindow_hide_description' id='infowindow_hide_description' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' value='yes'/> 
						<label for='infowindow_hide_description'></label>
						<?php esc_html_e("Hide the description field","wp-google-maps");  ?>
					</div>
				</li>

				<!-- Hide Custom Fields -->
				<li>
					<div class='switch switch-inline'>
						<input name='infowindow_hide_marker_fields' id='infowindow_hide_marker_fields' class='cmn-toggle cmn-toggle-round-flat' type='checkbox' value='yes'/> 
						<label for='infowindow_hide_marker_fields'></label>
						<?php esc_html_e("Hide the marker fields","wp-google-maps");  ?>
					</div>
				</li>

				

				<!-- Link targets -->
				<li class="wpgmza-margin-t-20">
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_infowindow_links' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_infowindow_links' 
							value='yes'/> 
						<label for='wpgmza_settings_infowindow_links'></label>
						<?php esc_html_e("Open links in a new window ","wp-google-maps"); ?>
						<small>
							<em><?php esc_html_e("(Tick this if you want to open your links in a new window)","wp-google-maps"); ?></em>	
						</small>
					</div>
				</li>
			</ul>
		</div>

		<!-- Link text -->
		<div class="tab-row wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Link text", "wp-google-maps"); ?></div>

			<input name='wpgmza_settings_infowindow_link_text' type='text' id='wpgmza_settings_infowindow_link_text'/>
		</div>

		<!-- Disable info-windows -->
		<div class="tab-row">
			<div class="title"><?php _e('Disable InfoWindows', 'wp-google-maps'); ?></div>
			
			<div class="switch switch-inline">
				<input name="wpgmza_settings_disable_infowindows" 
						id="wpgmza_settings_disable_infowindows" 
						class="cmn-toggle cmn-toggle-round-flat"
						type="checkbox" />
				<label for="wpgmza_settings_disable_infowindows"></label>
				<label for="wpgmza_settings_disable_infowindows">
					<?php _e("Enabling this setting will prevent any infowindows from opening for all your maps", "wp-google-maps"); ?>
				</label>
			</div>
		</div>

		<!-- Resize images -->
		<div class="tab-row wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Resize Images", "wp-google-maps"); ?></div>

			<div class='switch switch-inline'>
				<input name='wpgmza_settings_image_resizing' 
					class='cmn-toggle cmn-toggle-round-flat' 
					type='checkbox' 
					id='wpgmza_settings_image_resizing' value='yes'/>
					<label for='wpgmza_settings_image_resizing'>
					</label>
					<?php 
						esc_html_e("Resize all images to the below sizes","wp-google-maps"); 
					?>
			</div>
			
		</div>

		<!-- Default image width -->
		<div class="tab-row wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Default Image Width", "wp-google-maps"); ?></div>

			<input name='wpgmza_settings_image_width' type='text' size='4' maxlength='4' id='wpgmza_settings_image_width'/>
			<div class="inline-hint">
				px <em><?php esc_html_e("(can be left blank - max width will be limited to max infowindow width)","wp-google-maps"); ?></em>	
			</div>
		</div>

		<!-- Default image height -->
		<div class="tab-row wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Default Image Height", "wp-google-maps"); ?></div>

			<input name='wpgmza_settings_image_height' type='text' size='4' maxlength='4' id='wpgmza_settings_image_height'/>
			<div class="inline-hint">
				px <em><?php esc_html_e("(can be left blank - leaving both the width and height blank will revert to full size images being used)","wp-google-maps"); ?></em>	
			</div>
		</div>

		<!-- Max infow window width -->
		<div class="tab-row wpgmza-pro-feature-hide">
			<div class="title"><?php _e("Max InfoWindow Width", "wp-google-maps"); ?></div>

			<input name='wpgmza_settings_infowindow_width' type='text' size='4' maxlength='4' id='wpgmza_settings_infowindow_width'/>
			<div class="inline-hint">
				px <em><?php esc_html_e("(can be left blank - leaving both the width and height blank will revert to full size images being used)","wp-google-maps"); ?></em>	
			</div>
		</div>
	</div>
	
	<!-- Marker Listings Tab -->
	<div id="marker-listing">
		<div class="heading">
			<?php _e("Marker Listings", "wp-google-maps"); ?>
		</div>
		
		<!-- Upsell -->
		<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
			<a target="_BLANK"
				href="<?php esc_attr_e(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mlisting_settings-atlas-novus"));  ?>">
				<?php _e('Add Beautiful Marker Listings', 'wp-google-maps'); ?> 
			</a> <?php _e('to your maps with the Pro version for only $39.99 once off. Support and updates included forever.', 'wp-google-maps'); ?>
		</div>
		
		<!-- Sub heading -->
		<div class="tab-row">
			<strong>
				<?php esc_html_e("General Settings","wp-google-maps"); ?> 
			</strong>
		</div>
		
		<!-- Show X -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php esc_html_e("Show X items by default","wp-google-maps"); ?></div>
			
			<select id='wpgmza_default_items' name='wpgmza_default_items'>
				<option value="1">1</option>
				<option value="5">5</option>
				<option value="10">10</option>
				<option value="25">25</option>
				<option value="50">50</option>
				<option value="100">100</option>
				<option value="-1">ALL</option>
			</select>
		</div>

		<!-- Sub heading -->
		<div class="tab-row">
			<strong>
				<?php esc_html_e("Table Listings","wp-google-maps"); ?> 
			</strong>
		</div>
		
		<!-- Colummns -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php _e("Column Visibility", "wp-google-maps"); ?></div>
			
			<ul>
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_markerlist_icon' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_icon' value='yes'/> 
							
						<label for='wpgmza_settings_markerlist_icon'></label>
						<label for='wpgmza_settings_markerlist_icon'>
							<?php esc_html_e("Hide the Icon column","wp-google-maps");  ?>
						</label>
					</div>
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_markerlist_link' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_link' 
							value='yes'/> 
						
						<label for='wpgmza_settings_markerlist_link'></label>
						<label for='wpgmza_settings_markerlist_link'>
							<?php esc_html_e("Hide the Link column","wp-google-maps"); ?>
						</label>
					</div>
				</li>
				
				<li>
					 <div class='switch switch-inline'>
						<input name='wpgmza_settings_markerlist_title' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_title' value='yes'/>
						
						<label for='wpgmza_settings_markerlist_title'></label>
						<label for='wpgmza_settings_markerlist_title'>
							<?php esc_html_e("Hide the Title column","wp-google-maps"); ?>
						</label>
					</div>
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_markerlist_address' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_address' 
							value='yes'/> 
						
						<label for='wpgmza_settings_markerlist_address'></label>
						<label for='wpgmza_settings_markerlist_address'>
							<?php esc_html_e("Hide the Address column","wp-google-maps"); ?>
						</label>
					</div>
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_markerlist_category' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_category' 
							value='yes'/> 

						<label for='wpgmza_settings_markerlist_category'></label>
						<label for='wpgmza_settings_markerlist_category'>
							<?php esc_html_e("Hide the Category column","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_markerlist_description' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_settings_markerlist_description' 
							value='yes'/>

						<label for='wpgmza_settings_markerlist_description'></label>
						<label for='wpgmza_settings_markerlist_description'>
							<?php esc_html_e("Hide the Description column","wp-google-maps"); ?>
						</label>
					</div>
				</li>
			</ul>
		
		</div>

		<!-- Dependencies -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php _e("Dependencies", "wp-google-maps"); ?></div>
			
			<ul>
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_do_not_enqueue_datatables' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_do_not_enqueue_datatables' 
							value='yes'/>

						<label for='wpgmza_do_not_enqueue_datatables'></label>
						<label for='wpgmza_do_not_enqueue_datatables'>
							<?php esc_html_e("Do not Enqueue Datatables","wp-google-maps"); ?>
						</label>
					</div>
				</li>
			</ul>
		</div>
		
		<!-- Sub heading -->
		<div class="tab-row">
			<strong>
				<?php esc_html_e("Carousel Listings","wp-google-maps"); ?> 
			</strong>
		</div>
		
		<!-- Carousel -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php esc_html_e("Theme selection","wp-google-maps"); ?></div>

			<select id='wpgmza_settings_carousel_markerlist_theme' name='wpgmza_settings_carousel_markerlist_theme'>
				<option value="sky">
					<?php esc_html_e("Sky","wp-google-maps"); ?>
				</option>
				<option value="sun">
					<?php esc_html_e("Sun","wp-google-maps"); ?>
				</option>
				<option value="earth">
					<?php esc_html_e("Earth","wp-google-maps"); ?>
				</option>
				<option value="monotone">
					<?php esc_html_e("Monotone","wp-google-maps"); ?>
				</option>
				<option value="pinkpurple">
					<?php esc_html_e("PinkPurple","wp-google-maps"); ?>
				</option>
				<option value="white">
					<?php esc_html_e("White","wp-google-maps"); ?>
				</option>
				<option value="black">
					<?php esc_html_e("Black","wp-google-maps"); ?>
				</option>
			</select>
		</div>
		
		<!-- Fields -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php _e("Field Visibility", "wp-google-maps"); ?></div>
			
			<ul>
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_carousel_markerlist_image' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='wpgmza_settings_carousel_markerlist_image' 
								value='yes'/>
						
						<label for='wpgmza_settings_carousel_markerlist_image'></label>
						<label for='wpgmza_settings_carousel_markerlist_image'>
							<?php esc_html_e("Hide the Image","wp-google-maps"); ?>
						</label>
					</div>
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_carousel_markerlist_title' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='wpgmza_settings_carousel_markerlist_title' 
								value='yes'/>

						<label for='wpgmza_settings_carousel_markerlist_title'></label>
						<label for='wpgmza_settings_carousel_markerlist_title'>
							<?php esc_html_e("Hide the Title","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_carousel_markerlist_icon' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='wpgmza_settings_carousel_markerlist_icon' 
								value='yes'/>
						
						<label for='wpgmza_settings_carousel_markerlist_icon'></label>
						<label for='wpgmza_settings_carousel_markerlist_icon'>
							<?php esc_html_e("Hide the Marker Icon","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_carousel_markerlist_address' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='wpgmza_settings_carousel_markerlist_address' 
								value='yes'/>

						<label for='wpgmza_settings_carousel_markerlist_address'></label>
						<label for='wpgmza_settings_carousel_markerlist_address'>
							<?php esc_html_e("Hide the Address","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_carousel_markerlist_description' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' id='wpgmza_settings_carousel_markerlist_description' 
								value='yes'/>
						
						<label for='wpgmza_settings_carousel_markerlist_description'></label>
						<label for='wpgmza_settings_carousel_markerlist_description'>
							<?php esc_html_e("Hide the Description","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_carousel_markerlist_marker_link' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='wpgmza_settings_carousel_markerlist_marker_link' 
								value='yes'/>
					
						<label for='wpgmza_settings_carousel_markerlist_marker_link'></label>
						<label for='wpgmza_settings_carousel_markerlist_marker_link'>
							<?php esc_html_e("Hide the Marker Link","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_carousel_markerlist_directions' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='wpgmza_settings_carousel_markerlist_directions' 
								value='yes'/>
					
						<label for='wpgmza_settings_carousel_markerlist_directions'></label>
						<label for='wpgmza_settings_carousel_markerlist_directions'>
							<?php esc_html_e("Hide the Directions Link","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
			</ul>
		</div>

		<!-- Options -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php esc_html_e("Carousel options", "wp-google-maps"); ?></div>
		
			<ul>
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_settings_carousel_markerlist_resize_image' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='wpgmza_settings_carousel_markerlist_resize_image' 
								value='yes'/>
						
						<label for='wpgmza_settings_carousel_markerlist_resize_image'></label>
						<label for='wpgmza_settings_carousel_markerlist_resize_image'>
							<?php esc_html_e("Resize Images with Timthumb","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='carousel_lazyload' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='carousel_lazyload' 
								value='yes'/>
					
						<label for='carousel_lazyload'></label>
						<label for='carousel_lazyload'>
							<?php esc_html_e("Enable lazyload of images","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='carousel_autoheight' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='carousel_autoheight' 
								value='yes'/>

						<label for='carousel_autoheight'></label>
						<label for='carousel_autoheight'>
							<?php esc_html_e("Enable autoheight","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='carousel_pagination' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='carousel_pagination' 
								value='yes'/> 
						
						<label for='carousel_pagination'></label>
						<label for='carousel_pagination'>
							<?php esc_html_e("Enable pagination","wp-google-maps"); ?>
						</label>
					</div>
				</li>
				
				<li>
					<div class='switch switch-inline'>
						<input name='carousel_navigation' 
								class='cmn-toggle cmn-toggle-round-flat' 
								type='checkbox' 
								id='carousel_navigation' 
								value='yes'/>

						<label for='carousel_navigation'></label>
						<label for='carousel_navigation'>
							<?php esc_html_e("Enable navigation","wp-google-maps"); ?>
						</label>
					</div> 
				</li>
			</ul>
		</div>

		<!-- Dependencies -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php _e("Dependencies", "wp-google-maps"); ?></div>
			
			<ul>
				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_do_not_enqueue_owl_carousel' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_do_not_enqueue_owl_carousel' 
							value='yes'/>

						<label for='wpgmza_do_not_enqueue_owl_carousel'></label>
						<label for='wpgmza_do_not_enqueue_owl_carousel'>
							<?php esc_html_e("Do not Enqueue Owl Carousel","wp-google-maps"); ?>
						</label>
					</div>
				</li>

				<li>
					<div class='switch switch-inline'>
						<input name='wpgmza_do_not_enqueue_owl_carousel_themes' 
							class='cmn-toggle cmn-toggle-round-flat' 
							type='checkbox' 
							id='wpgmza_do_not_enqueue_owl_carousel_themes' 
							value='yes'/>

						<label for='wpgmza_do_not_enqueue_owl_carousel_themes'></label>
						<label for='wpgmza_do_not_enqueue_owl_carousel_themes'>
							<?php esc_html_e("Do not Enqueue Owl Theme","wp-google-maps"); ?>
						</label>
					</div>
				</li>
			</ul>
		</div>
		
		<!-- Device Settings -->
		<div class="tab-row wpgmza-pro-feature has-hint">
			<div class="title"><?php esc_html_e("Device Settings", "wp-google-maps"); ?></div>	
		</div>

		<!-- Desktop items -->
		<div class="tab-row wpgmza-pro-feature has-hint">
			<div class="title"> - <?php esc_html_e("Deskop Items", "wp-google-maps"); ?></div>
			<ul>
				<li>
					<input name='carousel_items' type='text' id='carousel_items' value="5"/> 
				</li>
			</ul>
		</div>

		<!-- Table items -->
		<div class="tab-row wpgmza-pro-feature has-hint">
			<div class="title"> - <?php esc_html_e("Tablet Items", "wp-google-maps"); ?></div>
			<ul>
				<li>	
					<input name='carousel_items_tablet' type='text' id='carousel_items_tablet' value="3"/>
				</li>
			</ul>
		</div>

		<!-- Mobile items -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"> - <?php esc_html_e("Mobile Items", "wp-google-maps"); ?></div>
			<ul>
				<li>
					<input name='carousel_items_mobile' type='text' id='carousel_items_mobile' value="1"/>
				</li>
			</ul>
		</div>

		<!-- Autoplay -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php esc_html_e("Autoplay", "wp-google-maps"); ?></div>
			<ul>
				<li>
					<input name='carousel_autoplay' type='text' id='carousel_autoplay value="5000"'/>
					<small class="inline-hint">
						<?php esc_html_e("After x milliseconds (1000 = 1 second)","wp-google-maps"); ?>
					</small>
				</li>
			</ul>
		</div>	
	</div>
	
	<!-- Store locator tab -->
	<div id="store-locator">
		<div class="heading">
			<?php _e("Store Locator", "wp-google-maps"); ?>
		</div>

		<div class="tab-row">
			<div class="title"><?php _e('Store Locator Radii', 'wp-google-maps'); ?></div>
			<label>
				<input name="wpgmza_store_locator_radii" pattern="^\d+(,\s*\d+)*$" type="text" />
				<small class="inline-hint">
					<?php _e('Use a comma to separate values, eg: 1, 5, 10, 50, 100', 'wp-google-maps'); ?>
				</small>
			</label>
		</div>
	</div>

	<!-- Categories tab -->
	<div id="categories">
		<div class="heading">
			<?php _e("Categories", "wp-google-maps"); ?>
		</div>

		<!-- Upsell -->
		<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
			<a target="_BLANK"
				href="<?php esc_attr_e(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=categories_settings-atlas-novus"));  ?>">
				<?php _e('Categorize markers', 'wp-google-maps'); ?> 
			</a> <?php _e('with the Pro version for only $39.99 once off. Support and updates included forever.', 'wp-google-maps'); ?>
		</div>

		<!-- Category tree method --> 
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php esc_html_e("Category Source", "wp-google-maps"); ?></div>

			<select name='categoryTreeSource'>
				<option value="native">Native</option>
				<option value="wordpress">WordPress (beta)</option>
			</select>
		</div>
		
		<!-- Tree source hint -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"></div>

			<small class="hint">
				<?php esc_html_e("Changing this to 'WordPress' will disable the built in category tools, and allow you to use WordPress categories instead", "wp-google-maps"); ?>
			</small>
		</div>

		<!-- Category Logic -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title">
				<?php esc_html_e('Category Selection Logic', 'wp-google-maps'); ?>
			</div>
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
		</div>

		<!-- Filter style -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title">
				<?php esc_html_e('Filter by category displayed as', 'wp-google-maps'); ?>
			</div>
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
        </div>
	</div>

	<!-- GDPR -->
	<div id="gdpr-compliance">
		<div class="heading">
			<?php _e("GDPR Compliance", "wp-google-maps"); ?>
		</div>

		<!-- Usage notes -->
		<div class="gdpr-usage-notice">
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

			<p>
				<?php
				_e('For more information about WPGM and GDPR compliance, please refer to our <a href="https://www.wpgmaps.com/gdpr/">GDPR information page</a> and our <a href="https://www.wpgmaps.com/privacy-policy/">Privacy Policy</a>', 'wp-google-maps');
				?>
			</p>
		</div>
		
		<!-- Require consent -->
		<div class="tab-row">
			<label class="title" for="wpgmza_gdpr_require_consent_before_load">
				<?php _e('Require consent before loading Maps API', 'wp-google-maps'); ?>
			</label>

			<div class="switch">
				<input name="wpgmza_gdpr_require_consent_before_load"
						id="wpgmza_gdpr_require_consent_before_load"
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>
				<label for="wpgmza_gdpr_require_consent_before_load"></label>
			</div>
		</div>

		<!-- Complianz Notice -->
		<span class="wpgmza-card wpgmza-shadow notice notice-error wpgmza-complianz-notice wpgmza-hidden" style="display: block;">
			<strong><?php _e("Important Note", "wp-google-maps"); ?>:</strong>
			<?php
				_e('GDPR consent automatically enabled and configured by Complianz', 'wp-google-maps');
			?>
			<br><br>
			<?php
				_e('WP Go Maps GDPR options have been disabled as they are fully controlled by Complianz', 'wp-google-maps');
			?>
		</span>

		<!-- Settinga -->
		<div id="wpgmza-gdpr-compliance-notice" style="display: none;">
			<!-- Company names -->
			<div class="tab-row">
				<label for="wpgmza_gdpr_company_name" class="title">
					<?php _e('Company Name', 'wp-google-maps'); ?>
				</label>

				<input name="wpgmza_gdpr_company_name"/>
			</div>

			<!-- Purpose -->
			<div class="tab-row has-hint">
				<label for="wpgmza_gdpr_retention_purpose" class="title">
					<?php _e('Retention Purpose(s)', 'wp-google-maps'); ?>
				</label>

				<input name="wpgmza_gdpr_retention_purpose"/>
				<div class="inline-hint">
					<?php _e('The GDPR regulates that you need to state why you are processing data.', 'wp-google-maps'); ?>
				</div>
			</div>

			<!-- GDPR Button Label -->
			<div class="tab-row has-hint">
				<label for="wpgmza_gdpr_button_label" class="title">
					<?php _e('Button Label', 'wp-google-maps'); ?>
				</label>

				<input name="wpgmza_gdpr_button_label"/>
				<div class="inline-hint">
					<?php _e('Change the button label shown for the GDPR consent form', 'wp-google-maps'); ?>
				</div>
			</div>

			<!-- Default -->
			<div class="tab-row">
				<label for="wpgmza_gdpr_default_notice"
						class="title"
						title="<?php _e('Users will be asked to accept the notice shown here, in the form of a check box.', 'wp-google-maps'); ?>">
							<?php _e('Default Notice', 'wp-google-maps'); ?>
				</label>

				<div name="wpgmza_gdpr_default_notice" class="tab-stretch-right"></div>
			</div>
			
			<!-- Override -->
			<div class="tab-row">
				<label for="wpgmza_gdpr_override_notice" class="title">
					<?php
					_e('Override GDPR Notice', 'wp-google-maps');
					?>
				</label>
				<div class="switch">
					<input name="wpgmza_gdpr_override_notice" 
							class="cmn-toggle cmn-toggle-round-flat" 
							type="checkbox" 
							id="wpgmza_gdpr_override_notice"/> 
					<label for="wpgmza_gdpr_override_notice"></label>
				</div>
			</div>
			
			<!-- Notice -->
			<div class="wpgmza-card wpgmza-shadow notice notice-error" style="margin-left: 0; margin-bottom: 40px">
				<?php _e('By checking this box, you agree to take sole responsibility for GDPR Compliance with regards to this plugin.', 'wp-google-maps'); ?>
			</div>

			<div class='tab-row' id="wpgmza_gdpr_override_notice_text">
				<label for="wpgmza_gdpr_override_notice_text" class="title">
					<?php _e('Override Text', 'wp-google-maps'); ?>
				</label>
				
				<textarea name="wpgmza_gdpr_notice_override_text" class="tab-stretch-right"></textarea>
			</div>
		</div>
	</div>
	
	<!-- Advanced tab -->	
	<div id="advanced-settings">
		<div class="heading">
			<?php _e("Advanced Settings", "wp-google-maps"); ?>
		</div>
		
		<!-- API key -->
		<div class="tab-row has-hint" data-required-maps-engine="google-maps">
			<div class="title"><?php _e('Google Maps API Key (required)', 'wp-google-maps'); ?></div>
			<input name="wpgmza_google_maps_api_key" id='wpgmza_google_maps_api_key' style='width: 40%;' />

			<small class="wpgmza-pad-5"><a href="<?php echo admin_url('admin.php?page=wp-google-maps-menu&action=installer'); ?>"><?php esc_html_e("Open Installer", "wp-google-maps"); ?></a></small>

		</div>

		<!-- API key hint -->
		<div class="tab-row" data-required-maps-engine="google-maps">
			<div class="title"></div>

			<small class="hint">
				<?php
				_e("This API key can be obtained from 
				the <a href='https://wpgmaps.com/google-maps-developer-console/' target='_BLANK'>Google Developers Console</a>. Our <a href='https://www.wpgmaps.com/documentation/creating-a-google-maps-api-key/' target='_BLANK'>documentation</a> provides a full guide on how to obtain this.", "wp-google-maps");
				?>
			</small>
		</div>
		
		<!-- Import key -->
		<div data-required-maps-engine="google-maps" class="tab-row">
			<div class="title wpgmza-pro-feature-hide"><?php _e("Alternative Import API Key", "wp-google-maps"); ?></div>
			<input name="importer_google_maps_api_key" type='text' style='width: 40%;' class="wpgmza-pro-feature-hide" />
		</div>

		<!-- Import key hint -->
		<div class="tab-row" data-required-maps-engine="google-maps">
			<div class="title"></div>

			<small class="hint wpgmza-pro-feature-hide">
				<?php _e("Generate an IP restricted key to paste into this field if you are experiencing 'Request Denied' when running imports", "wp-google-maps"); ?>
			</small>
		</div>

		<!-- Google Maps API load -->
		<div class="tab-row" data-required-maps-engine="google-maps">
			<div class="title">
				<?php _e('Load Maps Engine API', 'wp-google-maps'); ?>
			</div>
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
		</div>

		<!-- Google Maps Prevent Load -->
		<div class="tab-row" data-required-maps-engine="google-maps">
			<div class="title"><?php _e('Prevent other plugins and theme loading API', 'wp-google-maps'); ?></div>
			<div role="group">
				<label>
					<div>
						<input name="wpgmza_prevent_other_plugins_and_theme_loading_api" type="checkbox" class="wpgmza-fancy-toggle-switch" />
						<?php _e("Use this setting if you are experiencing Google Maps API issues, such as invalid key warnings, or Multiple API warnings", "wp-google-maps"); ?>
					</div>
				</label>
			</div>
		</div>
		
		<!-- OpenLayers API key -->
		<div class="tab-row has-hint" data-required-maps-engine="open-layers">
			<div class="title"><?php echo __('OpenLayers Tileserver Key', 'wp-google-maps'); ?></div>
			<input name='open_layers_api_key' type='text' style='width: 40%;' />
		</div>

		<!-- OpenLayers API key hint -->
		<div class="tab-row" data-required-maps-engine="open-layers">
			<div class="title"></div>

			<small class="hint">
				<?php _e("This is an optional API key provided by your preferred OpenLayers tile service, and should only be added if required by the TileServer provider", "wp-google-maps"); ?>
			</small>
		</div>

		<!-- OpenLayers Geocode -->
		<div class="tab-row has-hint" data-required-maps-engine="open-layers">
			<div class="title wpgmza-pro-feature-hide"><?php echo __('OpenRouteService Key', 'wp-google-maps'); ?></div>
			<input name='open_route_service_key' class="wpgmza-pro-feature-hide" type='text' style='width: 40%;'/>
		</div>

		<!-- OpenLayers Geocode hint -->
		<div class="tab-row" data-required-maps-engine="open-layers">
			<div class="title"></div>

			<small class="hint wpgmza-pro-feature-hide">
				<?php _e("This API key can be obtained from the <a href='https://openrouteservice.org/dev/#/login' target='_BLANK'>OpenRouteService Developers Console</a>.", "wp-google-maps"); ?>
			</small>
		</div>
		
		<!-- Include API -->
		<div class="tab-row">
			<div class="title"><?php _e('Always include engine API on pages', 'wp-google-maps'); ?></div>
			<input name="wpgmza_always_include_engine_api_on_pages" placeholder="<?php _e('Page IDs'); ?>"/>
		</div>
		
		<!-- Exclude API -->
		<div class="tab-row">
			<div class="title"><?php _e('Always exclude engine API on pages', 'wp-google-maps'); ?></div>
			<input name="wpgmza_always_exclude_engine_api_on_pages" placeholder="<?php _e('Page IDs'); ?>"/>
		</div>
			
		<!-- Marker pull method -->
		<div class="tab-row">
			<div class="title"><?php esc_html_e("Pull marker data from", "wp-google-maps"); ?></div>
			
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
		</div>
		
		<!-- XML hidden fields -->
		<div id="xml-cache-settings">
			<div class="tab-row has-hint">
				<div class="title"><?php esc_html_e("Marker data XML directory", "wp-google-maps"); ?></div>
				<input name="wpgmza_marker_xml_location" type='text' style="width: 40%;" />
				
			</div>

			<div class="tab-row">
				<div class="title"></div>
				<div class="hint">
					<p>
						<small>
							<?php esc_html_e("You can use the following", "wp-google-maps"); ?>
							: {wp_content_dir},{plugins_dir},{uploads_dir}
						</small>
					</p>
				</div>
			</div>
			
			<div class="tab-row has-hint">
				<div class="title"><?php esc_html_e("Marker data XML URL", "wp-google-maps"); ?></div>
				<input name="wpgmza_marker_xml_url" type="text" style="width: 40%;" />
			</div>

			<div class="tab-row">
				<div class="title"></div>
				<div class="hint">
					<p>
						<small>
							<?php esc_html_e("You can use the following", "wp-google-maps"); ?>
							: {wp_content_url},{plugins_url},{uploads_url}
						</small>
					</p>
				</div>
			</div>

			<div class="tab-row">
				<div class="title"></div>
				<div class="hint">
					<p>
						<small>
							<strong><?php _e("Note", "wp-google-maps"); ?>: </strong>
							<?php esc_html_e("We no longer recommend using the XML option, outside of special use cases. For most users the database method will be more reliable and efficient", "wp-google-maps"); ?>
						</small>
					</p>
				</div>
			</div>
		</div>
		
		<!--<fieldset id="library-script-panel-container"></fieldset>-->
		
		<div class="tab-row" data-required-maps-engine="open-layers">
			<div class="title"><?php esc_html_e('Flush Geocode Cache', 'wp-google-maps'); ?></div>
			<button id="wpgmza_flush_cache_btn" class="wpgmza-button wpgmza-button-primary">
				<?php _e('Flush', 'wp-google-maps'); ?>
			</button>
		</div>

		<!-- Font awesome version -->
		<div class="tab-row">
			<div class="title">
				<?php esc_html_e('Use FontAwesome', 'wp-google-maps'); ?>
			</div>
			<select name='use_fontawesome'>
				<option value='4.*'>4.*</option>
				<option value='5.*'>5.*</option>
				<option value='none'><?php esc_html_e("None", "wp-google-maps"); ?></option>
			</select>
		</div>
	</div>

	<!-- Woo Commerce Tab -->
	<div id="woocommerce">
		<div class="heading">
			<?php _e("WooCommerce", "wp-google-maps"); ?>
		</div>

		<!-- Upsell -->
		<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
			<a target="_BLANK"
				href="<?php esc_attr_e(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=woo_settings-atlas-novus"));  ?>">
				<?php _e('WooCommerce Integration', 'wp-google-maps'); ?> 
			</a> <?php _e('with the Pro version for only $39.99 once off. Support and updates included forever.', 'wp-google-maps'); ?>
		</div>

		<!-- Woo Commerce Product Editor -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php esc_html_e("Product Location Editor", "wp-google-maps"); ?></div>

			<div class="switch switch-inline">
				<input name="woo_product_location_editor_enabled"
						id="woo_product_location_editor_enabled" 
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>

				<label for="woo_product_location_editor_enabled"></label>
				<label for="woo_product_location_editor_enabled">
					<small>
						<?php
						esc_html_e('Adds a location editor directly to the WooCommerce product editor area', 'wp-google-maps');
						?>
					</small>
				</label>
			</div>
		</div>

		<!-- Woo Commerce Checkout Map -->
		<div class="tab-row wpgmza-pro-feature">
			<div class="title"><?php esc_html_e("Enable Checkout Map", "wp-google-maps"); ?></div>

			<div class="switch switch-inline">
				<input name="woo_checkout_map_enabled"
						id="woo_checkout_map_enabled" 
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>

				<label for="woo_checkout_map_enabled"></label>
				<label for="woo_checkout_map_enabled">
					<small>
						<?php
						esc_html_e('Adds a map to your checkout area, allowing a user to mark their shipping address', 'wp-google-maps');
						?>
					</small>
				</label>
			</div>
		</div>

		<!-- Map Select -->
		<div class="tab-row wpgmza-pro-feature woo-checkout-maps-select-row">
			<div class="title"><?php esc_html_e("Checkout Map", "wp-google-maps"); ?></div>

			<!-- Map select here, should be added for base map -->
			<div class="woo-checkout-map-select-wrapper"></div>
		</div>

		<!-- Checkout location -->
		<div class="tab-row wpgmza-pro-feature woo-checkout-maps-select-row">
			<div class="title"><?php esc_html_e("Checkout Placement", "wp-google-maps"); ?></div>

			<select name="woo_checkout_map_placement">
				<option value="after_order">After Order</option>
				<option value="after_billing">After Billing</option>
				<option value="after_shipping">After Shipping</option>
			</select>
		</div>

	</div>

	<!-- Beta tab -->
	<div id="beta-settings">
		<div class="heading">
			<?php _e("Beta Settings", "wp-google-maps"); ?>
		</div>

		<!-- Batch loader -->
		<div class="tab-row">
			<div class="title"><?php esc_html_e("Batch Loading", "wp-google-maps"); ?></div>

			<div class="switch switch-inline">
				<input name="enable_batch_loading"
						id="enable_batch_loading" 
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>

				<label for="enable_batch_loading"></label>
				<label for="enable_batch_loading">
					<small>
						<?php
						esc_html_e('Load markers in smaller batches, which can improve load times for large datasets', 'wp-google-maps');
						?>
					</small>
				</label>
			</div>
		</div>

		<!-- Batch loader hidden settings -->
		<div id="batch-loader-settings">
			<div class="tab-row">
				<div class="title"><?php esc_html_e("Batch Size", "wp-google-maps"); ?></div>
				<input type="number" name="fetchMarkersBatchSize" min="0" max="10000" step="1" value="100">
			</div>
		</div>
	</div>

	<!-- Custom Scripts tab -->	
	<div id="custom-scripts">
		<div class="heading">
			<?php _e("Custom Scripts", "wp-google-maps"); ?>
		</div>

		<!-- Custom CSS -->
		<div class="tab-row">
			<div class="title"><?php esc_html_e('CSS', 'wp-google-maps'); ?></div>
			<textarea class='tab-stretch-right script-tag' name="wpgmza_custom_css"></textarea>
		</div>
		
		<!-- Custom JS -->
		<div class="tab-row">
			<div class="title"><?php esc_html_e('JavaScript', 'wp-google-maps'); ?></div>
			<textarea class="tab-stretch-right script-tag" name="wpgmza_custom_js"></textarea>
		</div>

	</div>
	
	<!--Danger Zone -->
	<div id='danger-zone'>
		<div class="heading">
			<?php _e("Danger Zone", "wp-google-maps"); ?>
		</div>

		<?php echo wpgmaps_danger_zone_nonce(); ?>
		
		<!-- Intgration Tools (Support Request only) -->
		<div class="tab-row wpgmza-integration-tools wpgmza-pro-feature-hide">
			<div class="title"><?php esc_html_e("Integration Tools", "wp-google-maps"); ?></div>

			<ul>
				<li>
					<button class="wpgmza-button wpgmza-integration-tool-button" data-tool-type="test_collation">Collation Test</button>
					<button class="wpgmza-button wpgmza-integration-tool-button wpgmza-hidden" data-tool-type="resolve_collation">Resolve Collation Issues</button>

					<small class="hint inline-hint">
						<?php esc_html_e('Only use this if requested by our support team.', 'wp-google-maps'); ?>
					</small>
				</li>
			</ul>
		</div>

		<!-- Delete actions -->
		<div id="wpgmza-destroy-data" class='wpgmza-danger-zone tab-row'>
			<div class="title"><?php esc_html_e("Data Management", "wp-google-maps"); ?></div>
			
			<ul>
				<!-- Full Reset -->
				<li>
					<button danger="wpgmza_destroy_all_data" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza-button">Complete Reset</button>
					
					<small class="hint inline-hint">
						<?php esc_html_e('This will delete all settings, maps, markers, shapes, categories, and custom fields and reset the plugin back to the first time you used it.', 'wp-google-maps'); ?>
					</small>
				</li>

				<!-- Reset Settings -->
				<li>
					<button danger="wpgmza_reset_all_settings" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza-button">Reset all settings</button>
					
					<small class="hint inline-hint">
						<?php esc_html_e('This will reset all settings back to their default.', 'wp-google-maps'); ?>
					</small>
				</li>

				<!-- Maps -->
				<li>
					<button danger="wpgmza_destroy_maps" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza-button">Delete all maps</button>
					
					<small class="hint inline-hint">
						<?php esc_html_e('This will delete all maps, markers, shapes, categories, and custom fields.', 'wp-google-maps'); ?>
					</small>
				</li>

				<!-- Markers -->
				<li>
					<button danger="wpgmza_destroy_markers" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza-button">Delete all markers</button>
					
					<small class="hint inline-hint">
						<?php esc_html_e('This will delete all markers.', 'wp-google-maps'); ?>
					</small>
				</li>
				
				<!-- Shapes -->
				<li>
					<button danger="wpgmza_destroy_shapes" name="wpgmza_destroy_data" class="wpgmza_destroy_data wpgmza-button">Delete all shapes</button>
					
					<small class="hint inline-hint">
						<?php esc_html_e('This will delete all shapes.', 'wp-google-maps'); ?>
					</small>
				</li>
			</ul>
		</div>

		<!-- Danger Notice -->
		<div class="tab-row">
			<div class="title"></div>
			<span class="wpgmza-card wpgmza-shadow notice notice-error" style="margin-left: 0">
				<strong><?php _e("Important Note", "wp-google-maps"); ?>:</strong>
				<?php
					_e('Actions taken here cannot be undone, data resets are permanent', 'wp-google-maps');
				?>
			</span>
		</div>
	</div>

	<!-- Misc Column -->
	<div id="miscellaneous">
		<div class="heading">
			<?php _e("Miscellaneous", "wp-google-maps"); ?>
		</div>

		<!-- Compressed paths -->
		<div class="tab-row has-hint">
			<div class="title"><?php esc_html_e('Disable Compressed Path Variables', 'wp-google-maps'); ?></div>
			<div class="switch switch-inline">
				<input name="disable_compressed_path_variables"
						id="disable_compressed_path_variables" 
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>

				<label for="disable_compressed_path_variables"></label>
				<label for="disable_compressed_path_variables">
					<small>
						<?php
						esc_html_e('We recommend using this setting if you frequently experience HTTP 414 - Request URI too long. We do not recommend using this setting if your site uses REST caching or a CDN.', 'wp-google-maps');
						?>
					</small>
				</label>
			</div>
		</div>
		
		<!-- Autoptimize -->
		<div class="tab-row has-hint">
			<div class="title"><?php esc_html_e("Disable Autoptimize Compatibility Fix", "wp-google-maps"); ?></div>
			<div class="switch switch-inline">
				<input name="disable_autoptimize_compatibility_fix"
						id="disable_autoptimize_compatibility_fix"
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>
				
				<label for="disable_autoptimize_compatibility_fix"></label>
				<label for="disable_autoptimize_compatibility_fix">
					<small>
						<?php
						esc_html_e("Use this setting if you are experiencing issues with Autoptimize's CSS aggregation. This may cause issues on setups with a large amount of marker data.", "wp-google-maps");
						?>
					</small>
				</label>
				
			</div>
		</div>

		<!-- Dynamic SQL Refactor -->
		<div class="tab-row has-hint">
			<div class="title"><?php esc_html_e("Enable Dynamic SQL Refactors", "wp-google-maps"); ?></div>
			<div class="switch switch-inline">
				<input name="enable_dynamic_sql_refac_filter"
						id="enable_dynamic_sql_refac_filter"
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>
				
				<label for="enable_dynamic_sql_refac_filter"></label>
				<label for="enable_dynamic_sql_refac_filter">
					<small>
						<?php
						esc_html_e("Use this setting if your marker/map lists are not loading, or no results are being returned throughout the system. Commonly recommend in situations where single quote queries are not allowed. (WP Engine Users)", "wp-google-maps");
						?>
					</small>
				</label>
				
			</div>
		</div>

		<!-- Automatic backups -->
		<div id="wpgmza-disable-automatic-backups" class="tab-row has-hint wpgmza-pro-feature">
			<div class="title"><?php esc_html_e("Disable Automatic Backups (beta)", "wp-google-maps"); ?></div>
			<div class="switch switch-inline">
				<input name="disable_automatic_backups"
						id="disable_automatic_backups"
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>

				<label for="disable_automatic_backups"></label>
				<label for="disable_automatic_backups">
					<small>
						<?php
						esc_html_e('We recommend leaving automatic backups enabled. We will automatically backup your data before an import or update to our plugin.', 'wp-google-maps');
						?>
					</small>
				</label>
			</div>
		</div>

		<!-- Disable google font loading - Highly experimental -->
		<div id="wpgmza-disable-google-fonts" class="tab-row has-hint" data-required-maps-engine="google-maps">
			<div class="title"><?php esc_html_e("Prevent Google Fonts (beta)", "wp-google-maps"); ?></div>
			<div class="switch switch-inline">
				<input name="disable_google_fonts"
						id="disable_google_fonts"
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>

				<label for="disable_google_fonts"></label>
				<label for="disable_google_fonts">
					<small>
						<?php
						esc_html_e('Use this setting to prevent the Google Maps API from loading externally hosted fonts. This is a highly experimental option and may lead to unexpected layout changes. We recommend loading fonts from a local source when this is enabled.', 'wp-google-maps');
						?>
					</small>
				</label>
			</div>
		</div>
		
		<!-- Developer mode -->
		<div id="wpgmza-developer-mode" class="tab-row">
			<div class="title"><?php esc_html_e("Developer Mode", "wp-google-maps"); ?></div>
			<div class="switch switch-inline">
				<input name="wpgmza_developer_mode"
						id="wpgmza_developer_mode"
						class="cmn-toggle cmn-toggle-round-flat" 
						type="checkbox"/>

				<label for="wpgmza_developer_mode"></label>
				<label for="wpgmza_developer_mode">
					<small>
						<?php
						esc_html_e('Always rebuilds combined script files and script cache, does not load combined and minified scripts. Includes database query SQL with REST API responses.', 'wp-google-maps');
						?>
					</small>
				</label>
			</div>
		</div>

	</div>

	<div class="addition-tabs">

	</div>

	<p style="text-align: right;">
		<button type="submit" class="wpgmza-button wpgmza-button-primary">
			<?php esc_html_e("Save Settings", "wp-google-maps"); ?>
		</button>
	</p>
	
</form>
<?php if (get_user_meta( get_current_user_id(), 'wpgmza_hide_chat', true ) == 1 ) {} else { ?>
<a href='https://wpgooglemaps.bleeper.io/' title='Chat with WP Go Maps now' target='_BLANK' class='wpgmza-chat-help'><span id='wpgmzaCloseChat'></span></a>
<?php } ?>