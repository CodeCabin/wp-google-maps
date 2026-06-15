<?php
if(!defined('ABSPATH'))
    exit;

global $wpgmza;
?>

<div id="wpgmza-map-edit-page" class='wrap wpgmza-wrap wpgmza-atlas-major fullscreen'>
    <div class="wpgmza-editor am-shell">

        <!-- Atlas Major Toolbar -->
        <div class="am-toolbar">
            <div class="am-toolbar-left">
                <div class="am-brand">
                    <img class="am-brand-logo" src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/wpgomaps-logo.webp'; ?>" alt="<?php esc_attr_e('WP Go Maps', 'wp-google-maps'); ?>" />
                </div>
                <input type="text" class="am-map-name" id="am_wpgmza_title" name="am_map_title_display" />
                <div class="am-sc-pill">
                    <code class="am-shortcode-display" id="am_shortcode_display"><?php echo !empty($_REQUEST['map_id']) ? '[wpgmza id="' . intval($_REQUEST['map_id']) . '"]' : ''; ?></code>
                    <svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </div>
                <!-- Auto-save pill — populated by js/v8/atlas-major-autosave.js -->
                <div class="am-save-pill" data-state="idle">
                    <span class="am-save-pill-dot"></span>
                    <span class="am-save-pill-text"></span>
                </div>
                <!-- Autosave pause toggle — power-user / support switch
                     to suppress automatic saves. Manual Save Map still
                     works while paused. State is persisted to
                     localStorage so it survives reloads. Bound in
                     js/v8/atlas-major-autosave.js. -->
                <button type="button" class="am-autosave-pause-toggle is-paused" aria-pressed="true" title="<?php esc_attr_e('Click to enable autosave', 'wp-google-maps'); ?>">
                    <svg class="am-autosave-pause-ico" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="none" aria-hidden="true">
                        <rect x="7" y="6" width="3" height="12" rx="0.5"/>
                        <rect x="14" y="6" width="3" height="12" rx="0.5"/>
                    </svg>
                    <svg class="am-autosave-resume-ico" viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="none" aria-hidden="true">
                        <polygon points="7 5 19 12 7 19"/>
                    </svg>
                    <span class="am-autosave-pause-text"><?php esc_html_e('Autosave off', 'wp-google-maps'); ?></span>
                </button>
                <!-- "Remember to save your map!" removed — Atlas Major
                     has auto-save via js/v8/atlas-major-autosave.js.
                     The am-save-pill above handles save state visually. -->
                <span class="am-frontend-only-notice am-frontend-only-notice-toolbar" style="display:none"><?php _e("This setting will only take effect on the frontend map.", "wp-google-maps"); ?></span>
            </div>
            <div class="am-toolbar-right">
                <?php if(!$wpgmza->isProVersion()): ?>
                <a href="https://www.wpgmaps.com/features/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=toolbar-view-pro-features-atlas-major-v10<?php echo wpgmzaGetUpsellLinkParams(); ?>"
                   target="_BLANK" class="am-btn-go-pro">
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>
                    <?php _e("View all Pro features", "wp-google-maps"); ?>
                </a>
                <?php endif; ?>
                <a href="https://www.wpgmaps.com/support/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-help-support-atlas-major-v10"
                   target="_BLANK" rel="noopener" class="am-btn-help item" title="<?php esc_attr_e('Help & Support', 'wp-google-maps'); ?>">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </a>
                <a data-map-preview-button href="" target="_BLANK" class="am-btn am-btn-sec">
                    <svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    <?php _e("Preview", "wp-google-maps"); ?>
                </a>
                <label class="am-btn am-btn-accent" for="wpgmza_savemap"><?php _e("Save Map", "wp-google-maps"); ?></label>
            </div>
        </div>

        <!-- Atlas Major Tab Bar -->
        <div class="am-tabs">
            <div class="am-tab on" data-am-tab="markers" data-am-group="map-markers">
                <svg class="am-ico" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                <?php _e("Markers", "wp-google-maps"); ?>
            </div>
            <div class="am-tab" data-am-tab="settings" data-am-group="map-settings">
                <svg class="am-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <?php _e("Settings", "wp-google-maps"); ?>
            </div>
            <div class="am-tab" data-am-tab="locator" data-am-group="map-settings-store-locator-general">
                <svg class="am-ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <?php _e("Store Locator", "wp-google-maps"); ?>
            </div>
            <div class="am-tab" data-am-tab="directions" data-am-group="map-settings-directions">
                <svg class="am-ico" viewBox="0 0 24 24"><path d="M3 11l19-9-9 19-2-8z"/></svg>
                <?php _e("Directions", "wp-google-maps"); ?>
                <?php if(!$wpgmza->isProVersion()): ?><span class="am-tab-pro"><?php _e("PRO", "wp-google-maps"); ?></span><?php endif; ?>
            </div>
            <div class="am-tab" data-am-tab="listings" data-am-group="map-settings-marker-listings-general">
                <svg class="am-ico" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                <?php _e("Listings", "wp-google-maps"); ?>
                <?php if(!$wpgmza->isProVersion()): ?><span class="am-tab-pro"><?php _e("PRO", "wp-google-maps"); ?></span><?php endif; ?>
            </div>
            <div class="am-tab" data-am-tab="shapes" data-am-group="map-datasets">
                <svg class="am-ico" viewBox="0 0 24 24"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/></svg>
                <?php _e("Shapes", "wp-google-maps"); ?>
            </div>
            <div class="am-tab" data-am-tab="themes" data-am-group="map-settings-themes">
                <svg class="am-ico" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                <?php _e("Themes", "wp-google-maps"); ?>
            </div>
            <?php if(!$wpgmza->isProVersion()): ?>
            <div class="am-tab am-tab-upgrade" data-am-tab="upgrade" data-am-group="map-settings-pro">
                <svg class="am-ico" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>
                <?php _e("Unlock Pro", "wp-google-maps"); ?>
            </div>
            <?php endif; ?>
            <div class="am-tab-fill"></div>
        </div>

        <!-- Main Area: Sidebar (panel) + Content (map canvas) -->
        <div class="am-main">
            <div class="sidebar wpgmza-shadow">

                <!-- Map Settings Form - required by JS -->
                <form action="" method="POST" id="wpgmaps_options" name="wpgmza_map_form" class="wpgmza-map-settings-form">
                    <input name="action" type="hidden" value="wpgmza_save_map"/>
                    <input name="redirect_to" type="hidden"/>
                    <input name="map_id" type="hidden"/>
                    <input name="real_post_nonce" type="hidden"/>
                    <input type='submit' name='wpgmza_savemap' id='wpgmza_savemap' class='wpgmza-hidden' value='<?php _e("Save Map", "wp-google-maps"); ?>'/>

                    <!-- ============================================ -->
                    <!-- ALL GROUPINGS FROM ATLAS NOVUS FOLLOW BELOW -->
                    <!-- Structure is identical - SidebarGroupings.js -->
                    <!-- navigates these via data-group attributes    -->
                    <!-- ============================================ -->

                    <!-- Global Tab - Empty placeholder for JS compatibility -->
                    <div class="grouping open" data-group="global">
                    </div>

				<div class="grouping" data-group="map-datasets">
					<div class="heading block" style="border-bottom:none;">
						<?php esc_html_e('Shapes & Overlays', 'wp-google-maps'); ?>
					</div>

					<div class="am-panel-scroll navigation">
						<div class="item caret-right" data-group="map-polygons">
							<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/polygon.png"; ?>" alt="<?php esc_attr_e("Polygons", "wp-google-maps"); ?>"/></div>
							<?php _e("Polygons", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-polylines">
							<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/polyline.png"; ?>" alt="<?php esc_attr_e("Polylines", "wp-google-maps"); ?>"/></div>
							<?php _e("Polylines", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-circles">
							<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/circle.png"; ?>" alt="<?php esc_attr_e("Circles", "wp-google-maps"); ?>"/></div>
							<?php _e("Circles", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-rectangles">
							<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/rectangle.png"; ?>" alt="<?php esc_attr_e("Rectangles", "wp-google-maps"); ?>"/></div>
							<?php _e("Rectangles", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-point-labels">
							<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/point-label.png"; ?>" alt="<?php esc_attr_e("Point Labels", "wp-google-maps"); ?>"/></div>
							<?php _e("Point Labels", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-heatmaps">
							<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/heatmap.png"; ?>" alt="<?php esc_attr_e("Heatmaps", "wp-google-maps"); ?>"/></div>
							<?php _e("Heatmaps", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill'><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-image-overlays">
							<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/image-overlays.png"; ?>" alt="<?php esc_attr_e("Image Overlays", "wp-google-maps"); ?>"/></div>
							<?php _e("Image Overlays", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill'><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-shape-library">
							<span class="dashicons dashicons-category"></span>
							<?php _e("Shape Library", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill'><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>
					</div>
				</div>


                    <!-- Map Settings Tab - Empty placeholder for JS compatibility -->
                    <div class="grouping" data-group="map-settings">
						<div class="heading block" style="border-bottom:none;">
							<?php _e('Settings', 'wp-google-maps'); ?>
						</div>

						<div class="am-panel-scroll navigation">
							<div class="item caret-right" data-group="map-settings-general">
								<span class="dashicons dashicons-admin-generic"></span>
								<?php _e("General", "wp-google-maps"); ?>
							</div>

							<div class="item caret-right" data-group="map-settings-info-windows">
								<span class="dashicons dashicons-admin-comments"></span>
								<?php _e("Info Windows", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill'><?php _e("Pro", "wp-google-maps"); ?></span>
							</div>

							<div class="item caret-right" data-group="map-settings-category-legends">
								<span class="dashicons dashicons-tag"></span>
								<?php _e("Legends", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill'><?php _e("Pro", "wp-google-maps"); ?></span>
							</div>

							<div class="item caret-right" data-group="map-settings-behaviour">
								<span class="dashicons dashicons-lightbulb"></span>
								<?php _e("Behaviour", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill'><?php _e("Pro", "wp-google-maps"); ?></span>
							</div>

							<div class="item caret-right" data-group="map-settings-advanced">
								<span class="dashicons dashicons-admin-tools"></span>
								<?php _e("Advanced", "wp-google-maps"); ?>
							</div>

							<div class="item caret-right" data-group="map-settings-mobile">
								<span class="dashicons dashicons-smartphone"></span>
								<?php _e("Mobile", "wp-google-maps"); ?>
							</div>

							<div class="item caret-right" data-group="map-settings-integrations">
								<span class="dashicons dashicons-image-filter"></span>
								<?php _e("Integrations", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill'><?php _e("Pro", "wp-google-maps"); ?></span>
							</div>

							<div class="item hide-pro caret-right" data-group="map-settings-marker-field">
								<span class="dashicons dashicons-list-view"></span>
								<?php _e("Marker Fields", "wp-google-maps"); ?>
							</div>

							<div class="item caret-right" data-group="map-settings-beta">
								<span class="dashicons dashicons-hammer"></span>
								<?php _e("Beta Features", "wp-google-maps"); ?>
							</div>

							<div class="item caret-right" data-group="map-settings-shortcodes">
								<span class="dashicons dashicons-shortcode"></span>
								<?php _e("Shortcodes", "wp-google-maps"); ?>
							</div>

							<div class="item pro caret-right" data-group="map-settings-pro">
								<span class="dashicons dashicons-unlock"></span>
								<?php _e("Pro Features", "wp-google-maps"); ?>
							</div>
						</div>
                    </div>

				<div class="grouping" data-group="map-settings-general">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
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
								<option value="22">22</option>
							</select>
						</div>

						<!-- Map Name Field - Hidden in Atlas Major (displayed in toolbar) -->
						<fieldset class="wpgmza-hidden">
							<legend><?php _e("Map Name", "wp-google-maps"); ?></legend>
							<input id='wpgmza_title' name='map_title' class='regular-text' type='text'/>
						</fieldset>

						<!--Shortcode - Hidden in Atlas Major (displayed in toolbar) -->
						<fieldset class="wpgmza-hidden">
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
								echo sprintf(__("<a href='%s' target='BLANK'>Click here to automatically create a Map Page now</a>.", "wp-google-maps"), "admin.php?page=wp-google-maps-menu&amp;action=create-map-page&amp;map_id=". (!empty($_REQUEST['map_id']) ? intval($_REQUEST['map_id']) : ''));

							?>
						</div>

						<!-- Map Zoom Field -->
						<fieldset class="wpgmza-zoom-slider-controller">
							<legend><?php _e("Zoom Level", "wp-google-maps"); ?> <span data-zoom-hint></span></legend>
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

						<!-- Map type - Supported by Google and any tile server with a multi-layer stack -->
						<fieldset>
							<legend><?php _e("Map type", "wp-google-maps"); ?></legend>
							
							<select id="wpgmza_map_type" name="type">
								<option value="1" data-map-type='roadmap'>
									<?php _e("Roadmap", "wp-google-maps"); ?>
								</option>
								<option value="2" data-map-type='satellite'>
									<?php _e("Satellite", "wp-google-maps"); ?>
								</option>
								<option value="3" data-map-type='hybrid'>
									<?php _e("Hybrid", "wp-google-maps"); ?>
								</option>
								<option value="4" data-map-type='terrain'>
									<?php _e("Terrain", "wp-google-maps"); ?>
								</option>
							</select>
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

						<!-- Image Placeholders (per-map override).
						     Stored in this map's other_settings as
						     `image_placeholder` (read as $map->image_placeholder).
						     "Default" = follow the global "Use image
						     placeholders…" rule under Settings; Enabled /
						     Disabled force it for this map. Resolved by
						     wpgmza_pro_image_placeholder_enabled(). Pro
						     feature; Atlas Major only (this template is AM). -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Image Placeholders", "wp-google-maps"); ?></legend>

							<select id="wpgmza_image_placeholder" name="image_placeholder" class="postform">
								<option value=""><?php _e('Default (follow global setting)', 'wp-google-maps'); ?></option>
								<option value="enabled"><?php _e('Enabled', 'wp-google-maps'); ?></option>
								<option value="disabled"><?php _e('Disabled', 'wp-google-maps'); ?></option>
							</select>

							<div class="hint">
								<?php _e('Show a placeholder where a marker has no image, in marker listings and info windows. "Default" follows the global setting under Maps &rarr; Settings.', "wp-google-maps"); ?>
							</div>
						</fieldset>

						<?php
						/* WP Go Maps Cloud — Pro-only complementary callout.
						   Same card as in settings-page.html.php — placed at the
						   bottom of the editor's General Settings sidebar so it
						   sits in the panel Pro users actively spend time in
						   (vs the originally-tried map-help grouping, which is
						   orphaned now that the toolbar Help button redirects
						   externally). Framed as "Also from WP Go Maps" — the
						   cloud product (cloud.wpgmaps.com) is a separate
						   standalone service for non-WordPress platforms,
						   explicitly NOT a Pro replacement. See .am-cloud-upsell
						   in atlas-major.css. UTM campaign tagged
						   `cloud-editor-settings-atlas-major-v10` so analytics
						   can split this entry point from the settings-page
						   one. */
						if($wpgmza->isProVersion()): ?>
						<div class="am-cloud-upsell">
							<div class="am-cloud-upsell-eyebrow">
								<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M17.5 19a4.5 4.5 0 1 0 -0.6 -8.96 5.5 5.5 0 1 0 -10.4 2.45A3 3 0 0 0 7 19h10.5z"/>
								</svg>
								<?php esc_html_e('Also from WP Go Maps', 'wp-google-maps'); ?>
							</div>
							<h3 class="am-cloud-upsell-title"><?php esc_html_e('Need maps outside WordPress?', 'wp-google-maps'); ?></h3>
							<p class="am-cloud-upsell-text">
								<?php esc_html_e('Build maps in the cloud and embed them on Shopify, Wix, Webflow, Squarespace, or any HTML site.', 'wp-google-maps'); ?>
							</p>
							<div class="am-cloud-upsell-platforms" aria-hidden="true">
								<span class="am-cloud-upsell-platform">Shopify</span>
								<span class="am-cloud-upsell-platform">Squarespace</span>
								<span class="am-cloud-upsell-platform">Webflow</span>
								<span class="am-cloud-upsell-platform">Wix</span>
								<span class="am-cloud-upsell-platform">HTML</span>
							</div>
							<a class="am-cloud-upsell-cta" target="_BLANK"
								href="https://cloud.wpgmaps.com/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=cloud-editor-settings-atlas-major-v10">
								<?php esc_html_e('Explore WP Go Maps Cloud', 'wp-google-maps'); ?>
								<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<line x1="5" y1="12" x2="19" y2="12"/>
									<polyline points="12 5 19 12 12 19"/>
								</svg>
							</a>
						</div>
						<?php endif; ?>
					</div>
				</div>

				<!-- Map Settings - Store Locator Tab -->
				<div class="grouping" data-group="map-settings-store-locator">
					<!-- Clean title — no back button in Atlas Major -->
					<div class="heading block" style="border-bottom: none;">
						<?php _e('Store Locator', 'wp-google-maps'); ?>
					</div>

					<!-- Horizontal sub-tabs -->
					<div class="am-subnav">
						<div class="am-subnav-item on item" data-group="map-settings-store-locator-general">
							<?php _e("General", "wp-google-maps"); ?>
						</div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-fields">
							<?php _e("Fields", "wp-google-maps"); ?>
						</div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-style">
							<?php _e("Style", "wp-google-maps"); ?>
						</div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-advanced">
							<?php _e("Advanced", "wp-google-maps"); ?>
						</div>
					</div>

					<!-- Hidden navigation for JS compatibility — SidebarGroupings needs .item.caret-right -->
					<div class="am-hidden-nav" style="display:none;">
						<div class="item caret-right" data-group="map-settings-store-locator-general">
							<?php _e("General", "wp-google-maps"); ?>
						</div>
						<div class="item caret-right" data-group="map-settings-store-locator-fields">
							<?php _e("Fields", "wp-google-maps"); ?>
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
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/store.webp" 
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
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-focus-card-atlas-major-v10" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Unlock Store Locator","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Store Locator  - General Tab -->
				<div class="grouping" data-group="map-settings-store-locator-general">
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-store-locator'></div>
						<?php _e('General', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Store Locator', 'wp-google-maps'); ?></div>
					<div class="am-subnav">
						<div class="am-subnav-item on item" data-group="map-settings-store-locator-general"><?php _e("General", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-fields"><?php _e("Fields", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-style"><?php _e("Style", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-advanced"><?php _e("Advanced", "wp-google-maps"); ?></div>
					</div>

					<div class="settings">
						<!-- Enabled field -->
						<fieldset class="wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable Store Locator", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col textright">
								<div class="switch">
									<input type='checkbox' id='store_locator_enabled' name='store_locator_enabled' class='postform cmn-toggle cmn-toggle-round-flat'/>
									<label for='store_locator_enabled'  data-on='<?php esc_attr_e("Yes", "wp-google-maps"); ?>'  data-off='<?php esc_attr_e("No", "wp-google-maps"); ?>'></label>
								</div>
							</div>
						</fieldset>

						<!-- Distance Option -->
						<fieldset class="wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Show distance in", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
							_e('Enable intelligent, automatic search area with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-radius-atlas-major-v10">Pro add-on</a>', 'wp-google-maps');
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
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-store-locator'></div>
						<?php _e('Style', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Store Locator', 'wp-google-maps'); ?></div>
					<div class="am-subnav">
						<div class="am-subnav-item item" data-group="map-settings-store-locator-general"><?php _e("General", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-fields"><?php _e("Fields", "wp-google-maps"); ?></div>
						<div class="am-subnav-item on item" data-group="map-settings-store-locator-style"><?php _e("Style", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-advanced"><?php _e("Advanced", "wp-google-maps"); ?></div>
					</div>

					<div class="settings">
						<!-- Radial Style -->
						<fieldset data-search-area="radial">
							<legend><?php _e("Radius Style", "wp-google-maps"); ?></legend>
							<ul>
								<li>
									<label>
										<input type='radio' name='wpgmza_store_locator_radius_style' value='legacy' checked='checked' />
										<?php _e("Classic", "wp-google-maps"); ?>
									</label>
								</li>
								<li>
									<label>
										<input type='radio' name='wpgmza_store_locator_radius_style' value='modern' />
										<?php _e("Radar", "wp-google-maps"); ?>
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

						<!-- Button Style -->
						<fieldset class="wpgmza-row">
							<legend><?php _e("Button Style", "wp-google-maps"); ?></legend>
							<select name="store_locator_button_style" id="store_locator_button_style">
								<option value=""><?php _e("Icons", "wp-google-maps"); ?></option>
								<option value="text"><?php _e("Text", "wp-google-maps"); ?></option>
							</select>
						</fieldset>

						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable custom styling options with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-position-atlas-major-v10">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Show center point -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Show center point as an icon", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
								<a href='https://www.wpgmaps.com/help/docs/store-locator/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-store-locator-docs-atlas-major-v10' target='_BLANK'>
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
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-store-locator'></div>
						<?php _e('Fields', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Store Locator', 'wp-google-maps'); ?></div>
					<div class="am-subnav">
						<div class="am-subnav-item item" data-group="map-settings-store-locator-general"><?php _e("General", "wp-google-maps"); ?></div>
						<div class="am-subnav-item on item" data-group="map-settings-store-locator-fields"><?php _e("Fields", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-style"><?php _e("Style", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-advanced"><?php _e("Advanced", "wp-google-maps"); ?></div>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-fields-atlas-major-v10">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable title search", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-store-locator'></div>
						<?php _e('Advanced', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Store Locator', 'wp-google-maps'); ?></div>
					<div class="am-subnav">
						<div class="am-subnav-item item" data-group="map-settings-store-locator-general"><?php _e("General", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-fields"><?php _e("Fields", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-store-locator-style"><?php _e("Style", "wp-google-maps"); ?></div>
						<div class="am-subnav-item on item" data-group="map-settings-store-locator-advanced"><?php _e("Advanced", "wp-google-maps"); ?></div>
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
						<fieldset class="wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Show distance from search", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Allow category selection", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
							_e('Enable search by category with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-categories-atlas-major-v10">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Use user location -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Allow users to use their location as the starting point", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
							_e('Enable user geolocation features with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=store-locator-user-loc-atlas-major-v10">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Hide markers until search -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Hide all markers until a search is done", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Allow nearby searches", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
					<div class="heading block" style="border-bottom:none;">
						<?php _e('Directions', 'wp-google-maps'); ?>
					</div>

					<div class="settings wpgmza-directions-box-settings-panel">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Directions", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=directions-atlas-major-v10">
							Enable directions</a> with the Pro version.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=directions-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Directions', 'wp-google-maps'); ?> 
							</a>
						</div>

						<!-- Enable Directions -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
	                        	<legend><?php _e("Enable Directions?","wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col textright">
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
					<div class="heading block" style="border-bottom:none;"><?php _e('Themes', 'wp-google-maps'); ?></div>

					<div class='item-notice' data-wpgmza-feature-limited-notice='google-maps.advancedMarkerElement'>
						<strong><span class="dashicons dashicons-lock"></span> <?php _e("Feature Limited", "wp-google-maps"); ?></strong>
						<span><?php _e("Theme functionality is not support when using the Advanced Marker Element module in Google Maps. All styling is managed via the cloud on the Google Maps platform. ", "wp-google-maps"); ?></span>
						<span><?php _e("Alternatively, switch to Default under Maps > Settings > Markers > Marker Render Mode, to use local map themes.", "wp-google-maps"); ?></span>
					</div>

					<!-- Horizontal sub-tabs -->
					<div class="am-subnav">
						<div class="am-subnav-item on item" data-group="map-settings-themes-tileset" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Tileset", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-presets" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Presets", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-editor" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Editor", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-manual" data-wpgmza-require-engine="google-maps" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Theme Data", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-custom-tile" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Custom Image", "wp-google-maps"); ?></div>
					</div>

					<!-- Hidden navigation for JS compatibility — SidebarGroupings needs .item.caret-right -->
					<div class="am-hidden-nav" style="display:none;">
						<div class='item-notice' data-wpgmza-feature-limited-notice='google-maps.advancedMarkerElement'>
							<strong><span class="dashicons dashicons-lock"></span> <?php _e("Feature Limited", "wp-google-maps"); ?></strong>
							<span><?php _e("Theme functionality is not support when using the Advanced Marker Element module in Google Maps. All styling is managed via the cloud on the Google Maps platform. ", "wp-google-maps"); ?></span>
							<span><?php _e("Alternatively, switch to Default under Maps > Settings > Markers > Marker Render Mode, to use local map themes.", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-themes-tileset" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost">
							<span class="dashicons dashicons-screenoptions"></span>
							<?php _e("Tileset", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-themes-presets" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'>
							<span class="dashicons dashicons-admin-appearance"></span>
							<?php _e("Presets", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-themes-editor" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'>
							<span class="dashicons dashicons-admin-customizer"></span>
							<?php _e("Editor", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-themes-manual" data-wpgmza-require-engine="google-maps" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'>
							<span class="dashicons dashicons-editor-code"></span>
							<?php _e("Theme Data", "wp-google-maps"); ?>
						</div>

						<div class="item caret-right" data-group="map-settings-themes-custom-tile" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost">
							<span class="dashicons dashicons-format-image"></span>
							<?php _e("Custom Image", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

				<!-- Map Settings - Themes - Presets Tab -->
				<div class="grouping" data-group="map-settings-themes-tileset">
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-themes'></div>
						<?php _e('Tileset', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Themes', 'wp-google-maps'); ?></div>
					<div class='item-notice' data-wpgmza-feature-limited-notice='google-maps.advancedMarkerElement'>
						<strong><span class="dashicons dashicons-lock"></span> <?php _e("Feature Limited", "wp-google-maps"); ?></strong>
						<span><?php _e("Theme functionality is not support when using the Advanced Marker Element module in Google Maps. All styling is managed via the cloud on the Google Maps platform. ", "wp-google-maps"); ?></span>
						<span><?php _e("Alternatively, switch to Default under Maps > Settings > Markers > Marker Render Mode, to use local map themes.", "wp-google-maps"); ?></span>
					</div>
					<div class="am-subnav">
						<div class="am-subnav-item on item" data-group="map-settings-themes-tileset" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Tileset", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-presets" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Presets", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-editor" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Editor", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-manual" data-wpgmza-require-engine="google-maps" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Theme Data", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-custom-tile" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Custom Image", "wp-google-maps"); ?></div>
					</div>

					<div class="settings wpgmza-tileset-panel">
						
					</div>
				</div>

				<!-- Map Settings - Themes - Presets Tab -->
				<div class="grouping" data-group="map-settings-themes-presets">
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-themes'></div>
						<?php _e('Theme Presets', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Themes', 'wp-google-maps'); ?></div>
					<div class='item-notice' data-wpgmza-feature-limited-notice='google-maps.advancedMarkerElement'>
						<strong><span class="dashicons dashicons-lock"></span> <?php _e("Feature Limited", "wp-google-maps"); ?></strong>
						<span><?php _e("Theme functionality is not support when using the Advanced Marker Element module in Google Maps. All styling is managed via the cloud on the Google Maps platform. ", "wp-google-maps"); ?></span>
						<span><?php _e("Alternatively, switch to Default under Maps > Settings > Markers > Marker Render Mode, to use local map themes.", "wp-google-maps"); ?></span>
					</div>
					<div class="am-subnav">
						<div class="am-subnav-item item" data-group="map-settings-themes-tileset" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Tileset", "wp-google-maps"); ?></div>
						<div class="am-subnav-item on item" data-group="map-settings-themes-presets" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Presets", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-editor" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Editor", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-manual" data-wpgmza-require-engine="google-maps" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Theme Data", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-custom-tile" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Custom Image", "wp-google-maps"); ?></div>
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
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-themes'></div>
						<?php _e('Theme Editor', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Themes', 'wp-google-maps'); ?></div>
					<div class='item-notice' data-wpgmza-feature-limited-notice='google-maps.advancedMarkerElement'>
						<strong><span class="dashicons dashicons-lock"></span> <?php _e("Feature Limited", "wp-google-maps"); ?></strong>
						<span><?php _e("Theme functionality is not support when using the Advanced Marker Element module in Google Maps. All styling is managed via the cloud on the Google Maps platform. ", "wp-google-maps"); ?></span>
						<span><?php _e("Alternatively, switch to Default under Maps > Settings > Markers > Marker Render Mode, to use local map themes.", "wp-google-maps"); ?></span>
					</div>
					<div class="am-subnav">
						<div class="am-subnav-item item" data-group="map-settings-themes-tileset" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Tileset", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-presets" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Presets", "wp-google-maps"); ?></div>
						<div class="am-subnav-item on item" data-group="map-settings-themes-editor" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Editor", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-manual" data-wpgmza-require-engine="google-maps" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Theme Data", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-custom-tile" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Custom Image", "wp-google-maps"); ?></div>
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
									<fieldset class="wpgmza-row wpgmza-row-stretch">
										<div class="wpgmza-col-8">
											<legend><?php _e('Color', 'wp-google-maps'); ?></legend>
										</div>

										<div class="wpgmza-col textright">
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
									<fieldset class="wpgmza-row wpgmza-row-stretch">
										<div class="wpgmza-col-8">
											<legend><?php _e('Hue', 'wp-google-maps'); ?></legend>
										</div>
										<div class="wpgmza-col textright">
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
									<fieldset id="wpgmza-theme-editor__invert-lightness" class="wpgmza-row wpgmza-row-stretch">
										<div class="wpgmza-col-8">
											<legend><?php _e('Invert Lightness', 'wp-google-maps'); ?></legend>
										</div>

										<div class="wpgmza-col textright">
											<div class="switch">
												<input type="checkbox" id="wpgmza_theme_editor_do_invert_lightness" class="cmn-toggle cmn-toggle-round-flat" />
												<label for="wpgmza_theme_editor_do_invert_lightness"></label>
											</div>
										</div>
									</fieldset>
								</div>
							</div>
						</div>

						<div id="wpgmza-ol-theme-editor" class="" data-wpgmza-require-engine="open-layers|open-layers-latest">
							<fieldset>
								<input type='text' name='wpgmza_ol_tile_filter' class="wpgmza-css-filter-input" />
							</fieldset>

							<!-- Hints -->
							<div class="hint">
								<?php _e("Note: OpenLayers themes are powered by CSS filters. For more granular control, consider an alternate tile server instead", "wp-google-maps"); ?>
							</div>
						</div>

						<div id="wpgmza-leaflet-theme-editor" class="" data-wpgmza-require-engine="leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost">
							<fieldset>
								<input type='text' name='wpgmza_leaflet_tile_filter' class="wpgmza-css-filter-input" />
							</fieldset>

							<!-- Hints -->
							<div class="hint">
								<?php _e("Note: Leaflet themes are powered by CSS filters. For more granular control, consider an alternate tile server instead", "wp-google-maps"); ?>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Themes - Editor Tab -->
				<div class="grouping" data-group="map-settings-themes-manual">
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-themes'></div>
						<?php _e('Theme Data', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Themes', 'wp-google-maps'); ?></div>
					<div class='item-notice' data-wpgmza-feature-limited-notice='google-maps.advancedMarkerElement'>
						<strong><span class="dashicons dashicons-lock"></span> <?php _e("Feature Limited", "wp-google-maps"); ?></strong>
						<span><?php _e("Theme functionality is not support when using the Advanced Marker Element module in Google Maps. All styling is managed via the cloud on the Google Maps platform. ", "wp-google-maps"); ?></span>
						<span><?php _e("Alternatively, switch to Default under Maps > Settings > Markers > Marker Render Mode, to use local map themes.", "wp-google-maps"); ?></span>
					</div>
					<div class="am-subnav">
						<div class="am-subnav-item item" data-group="map-settings-themes-tileset" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Tileset", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-presets" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Presets", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-editor" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Editor", "wp-google-maps"); ?></div>
						<div class="am-subnav-item on item" data-group="map-settings-themes-manual" data-wpgmza-require-engine="google-maps" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Theme Data", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-custom-tile" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Custom Image", "wp-google-maps"); ?></div>
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
									echo sprintf(__('Looking for more themes? <a href="%s" target="_BLANK">Browse our theme directory</a>.', 'wp-google-maps'), 'https://www.wpgmaps.com/themes/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-themes-atlas-major-v10');
								?>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Themes - Custom OL Tile Tab -->
				<div class="grouping" data-group="map-settings-themes-custom-tile">
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-themes'></div>
						<?php _e('Custom Image', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Themes', 'wp-google-maps'); ?></div>
					<div class='item-notice' data-wpgmza-feature-limited-notice='google-maps.advancedMarkerElement'>
						<strong><span class="dashicons dashicons-lock"></span> <?php _e("Feature Limited", "wp-google-maps"); ?></strong>
						<span><?php _e("Theme functionality is not support when using the Advanced Marker Element module in Google Maps. All styling is managed via the cloud on the Google Maps platform. ", "wp-google-maps"); ?></span>
						<span><?php _e("Alternatively, switch to Default under Maps > Settings > Markers > Marker Render Mode, to use local map themes.", "wp-google-maps"); ?></span>
					</div>
					<div class="am-subnav">
						<div class="am-subnav-item item" data-group="map-settings-themes-tileset" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Tileset", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-presets" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Presets", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-editor" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Editor", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-themes-manual" data-wpgmza-require-engine="google-maps" data-wpgmza-feature-limited='google-maps.advancedMarkerElement'><?php _e("Theme Data", "wp-google-maps"); ?></div>
						<div class="am-subnav-item on item" data-group="map-settings-themes-custom-tile" data-wpgmza-require-engine="open-layers|open-layers-latest|leaflet|leaflet-azure|leaflet-stadia|leaflet-maptiler|leaflet-locationiq|leaflet-zerocost"><?php _e("Custom Image", "wp-google-maps"); ?></div>
					</div>

					<div class="settings">
						<p class='notice wpgmza-shadow wpgmza-card wpgmza-pos-relative'>
							<?php
								_e("You will need to save your map to view changes to custom map images", "wp-google-maps");
							?>
						</p>
						
						<!-- Custom Image Toggle -->
						<fieldset class="wpgmza-row wpgmza-pro-feature">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable Custom Image", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col textright">
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
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Info Window Styles", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=iw-style-atlas-major-v10">
										Change styles</a> with the Pro version.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=iw-style-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Styles', 'wp-google-maps'); ?> 
							</a>
						</div>

						<!-- Info-window Selector -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Style", "wp-google-maps"); ?></legend>
							
							<div class='wpgmza-infowindow-style-picker'>
								<div class="wpgmza-infowindow-style-picker-grouping wpgmza-pro-feature">
									<div class="wpgmza-infowindow-style-picker-grouping-title">
										<?php _e("Marker Anchored", "wp-google-maps"); ?>
									</div>
									<div class="wpgmza-infowindow-style-picker-grid wpgmza-grid wpgmza-grid-cols-3">
										<!-- Classic -->
										<label class="wpgmza-check-card-selector">
											<input type="radio" name="wpgmza_iw_type" value="0" class="wpgmza-pro-feature"/>
											
											<div class='wpgmza-card'>
												<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_1.png'; ?>');"></div>
												<span><?php _e('Default', 'wp-google-maps');?></span>
											</div>
										</label>

										<!-- Thin -->
										<label class="wpgmza-check-card-selector">
											<input type="radio" name="wpgmza_iw_type" value="5" class="wpgmza-pro-feature"/>
											
											<div class='wpgmza-card'>
												<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_thin.png'; ?>');"></div>
												<span><?php _e('Thin', 'wp-google-maps');?></span>
											</div>
										</label>

										<!-- Focus -->
										<label class="wpgmza-check-card-selector">
											<input type="radio" name="wpgmza_iw_type" value="6" class="wpgmza-pro-feature"/>
											
											<div class='wpgmza-card'>
												<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_focus.png'; ?>');"></div>
												<span><?php _e('Focus', 'wp-google-maps');?></span>
											</div>
										</label>
									</div>
								</div>

								<div class="wpgmza-infowindow-style-picker-grouping wpgmza-pro-feature">
									<div class="wpgmza-infowindow-style-picker-grouping-title">
										<?php _e("Map Anchored", "wp-google-maps"); ?>
									</div>
									<div class="wpgmza-infowindow-style-picker-grid wpgmza-grid wpgmza-grid-cols-3">
										<!-- Panel -->
										<label class="wpgmza-check-card-selector">
											<input type="radio" name="wpgmza_iw_type" value="4" class="wpgmza-pro-feature"/>
											
											<div class='wpgmza-card'>
												<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_panel.png'; ?>');"></div>
												<span><?php _e('Panel', 'wp-google-maps'); ?></span>
											</div>
										</label>

										<!-- Card -->
										<label class="wpgmza-check-card-selector">
											<input type="radio" name="wpgmza_iw_type" value="7" class="wpgmza-pro-feature"/>
											
											<div class='wpgmza-card'>
												<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_panel_card.png'; ?>');"></div>
												<span><?php _e('Card', 'wp-google-maps'); ?></span>
											</div>
										</label>

										<!-- Drawer -->
										<label class="wpgmza-check-card-selector">
											<input type="radio" name="wpgmza_iw_type" value="8" class="wpgmza-pro-feature"/>

											<div class='wpgmza-card'>
												<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_panel_drawer.png'; ?>');"></div>
												<span><?php _e('Drawer', 'wp-google-maps'); ?></span>
											</div>
										</label>
									</div>
								</div>

								<div class="wpgmza-infowindow-style-picker-grouping wpgmza-pro-feature">
									<div class="wpgmza-infowindow-style-picker-grouping-title">
										<?php _e("Global", "wp-google-maps"); ?>
									</div>
									<div class="wpgmza-infowindow-style-picker-grid wpgmza-grid wpgmza-grid-cols-3">
										<!-- Global Info Window -->
										<label class="wpgmza-check-card-selector">
											<input type="radio" name="wpgmza_iw_type" value="-1" class="wpgmza-pro-feature"/>

											<div class='wpgmza-card'>
												<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL . '/images/marker_iw_type_inherit.png'; ?>');"></div>
												<span><?php _e('Global', 'wp-google-maps'); ?></span>
											</div>
										</label>
									</div>
								</div>
							</div>
						</fieldset>

						<!-- Placement Controls -->
						<!-- Placement : Card-->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-hidden" id="iw_anchor_panel_card">
							<legend><?php _e("Placement", "wp-google-maps"); ?></legend>
							<select name="iw_anchor_panel_card" class='wpgmza-anchor-control' data-default="BOTTOM_LEFT" data-anchors-exclude="ABOVE,BELOW,LEFT,RIGHT"></select>
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Close InfoWindow on Map Click", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Allow users to share marker links", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
					<div class="heading block" style="border-bottom:none;">
						<?php _e('Marker Listing', 'wp-google-maps'); ?>
					</div>

					<div class="am-subnav">
						<div class="am-subnav-item on item" data-group="map-settings-marker-listings-general"><?php _e("General", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-marker-listings-filtering"><?php _e("Filtering", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-marker-listings-datatables"><?php _e("DataTables", "wp-google-maps"); ?></div>
					</div>

					<div class="am-hidden-nav" style="display:none;">
						<div class="item caret-right" data-group="map-settings-marker-listings-general">
							<?php _e("General", "wp-google-maps"); ?>
						</div>
						<div class="item caret-right" data-group="map-settings-marker-listings-filtering">
							<?php _e("Filtering", "wp-google-maps"); ?>
						</div>
						<div class="item caret-right" data-group="map-settings-marker-listings-datatables">
							<?php _e("DataTables", "wp-google-maps"); ?>
						</div>
										
						<div class="upsell-block auto-rotate">
							<!-- Upsell card - Marker Listings --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/marker-listing.webp" 
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
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker-listing-focus-card-atlas-major-v10" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Unlock Marker Listings","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Marker Listing - Style Tab -->
				<div class="grouping" data-group="map-settings-marker-listings-general">
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-marker-listings'></div>
						<?php _e('General', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Marker Listing', 'wp-google-maps'); ?></div>
					<div class="am-subnav">
						<div class="am-subnav-item on item" data-group="map-settings-marker-listings-general"><?php _e("General", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-marker-listings-filtering"><?php _e("Filtering", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-marker-listings-datatables"><?php _e("DataTables", "wp-google-maps"); ?></div>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Marker Listings", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Enable Marker Listing with the <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing-atlas-major-v10" target="_BLANK">Pro version</a>.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Marker Listings', 'wp-google-maps'); ?> 
							</a>
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
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_0.png');"></div>
											<span><?php _e('Disabled', 'wp-google-maps'); ?></span>
										</div>
									</label>

									<!-- Basic List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="4"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_2.png');"></div>
											<span><?php _e('Basic List', 'wp-google-maps'); ?></span>
										</div>
									</label>
								</div>

								<div class="wpgmza-row">
									<!-- Basic Table -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="1"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_1.png');"></div>
											<span><?php _e('Basic Table', 'wp-google-maps'); ?></span>
										</div>
									</label>


									<!-- Advanced List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="2"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_3.png');"></div>
											<span><?php _e('Advanced Table', 'wp-google-maps'); ?></span>
										</div>
									</label>
								</div>

								<div class="wpgmza-row">
									<!-- Carousel List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="3"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_4.png');"></div>
											<span><?php _e('Carousel', 'wp-google-maps'); ?></span>
										</div>
									</label>

									<!-- Grid List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="7"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_grid.png');"></div>
											<span><?php _e('Grid', 'wp-google-maps'); ?></span>
										</div>
									</label>
								</div>

								<div class="wpgmza-row">
									<!-- Category Grouped List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="9"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_cat_grouped.png');"></div>
											<span><?php _e('Category Grouped List', 'wp-google-maps'); ?></span>
										</div>
									</label>

									<!-- Category Tabbed -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="10"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_cat_grouped_tabs.png');"></div>
											<span><?php _e('Category Grouped Tabs', 'wp-google-maps'); ?></span>
										</div>
									</label>
								</div>

								<div class="wpgmza-row">
									<!-- Panel List -->
									<label class="wpgmza-check-card-selector wpgmza-col">
										<input type="radio" name="wpgmza_listmarkers_by" value="8"/>
										
										<div class="wpgmza-card wpgmza-shadow">
											<div class="wpgmza-auto-image" style="background-image: url('<?php echo WPGMZA_PLUGIN_DIR_URL; ?>/images/marker_list_modern.png');"></div>
											<span><?php _e('Panel', 'wp-google-maps'); ?></span>
										</div>
									</label>

									<div class="wpgmza-col">
										<!-- Even distribution block -->
									</div>
								</div>
								
							</div>
						</fieldset>

						<p class='wpgmza-shadow wpgmza-card wpgmza-pos-relative' id="marker_listing_require_max_length_warning" style="display: none;">
							<?php
								_e("<strong>Important Note</strong><br>For the best results with <strong>Grouped Listings</strong>, please adjust <strong>Maps > Settings > Marker Listing > Show X items by default > To 'ALL'</strong> to prevent pagination from interfering with groupings", "wp-google-maps");
							?>
						</p>

						<!-- Placement -->
						<fieldset class="wpgmza-pro-feature wpgmza-row">
							<legend><?php _e("Placement", "wp-google-maps"); ?></legend>
							<!-- Only available and supported by Atlas Novus (Legacy uses: wpgmza_marker_listing_position) -->
							<select name="marker_listing_component_anchor" id="marker_listing_component_anchor" class='wpgmza-anchor-control' data-default="BELOW" data-anchors="LEFT,RIGHT,ABOVE,BELOW"></select>
						</fieldset>

						<!-- Auto Open (Panel Only) -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch" id="marker_listing_component_auto_open_wrap">
							<div class="wpgmza-col-8">
								<legend><?php _e("Open by default","wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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

						<!-- Marker nudge -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Nudge Marker Center","wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
								<div class='switch' title="<?php esc_attr_e('Nudges marker when opened from the marker listing', 'wp-google-maps'); ?>">
									<input 
										type='checkbox' 
										id='marker_listing_nudge_marker_center' 
										name='marker_listing_nudge_marker_center' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/> 
									<label for='marker_listing_nudge_marker_center'></label>
								</div>
							</div>
						</fieldset>

						<!-- Marker Nudge Control -->
						<fieldset  class="wpgmza-marker-listing-nudge-offsets wpgmza-row" style="display: none;">
							<div class="wpgmza-col">
								<legend><?php _e("Nudge Offset X", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<input name="marker_listing_nudge_x" type="number"> <small>px</small>
							</div>
						</fieldset>

						<!-- Marker Nudge Control -->
						<fieldset  class="wpgmza-marker-listing-nudge-offsets wpgmza-row" style="display: none;">
							<div class="wpgmza-col">
								<legend><?php _e("Nudge Offset Y", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col">
								<input name="marker_listing_nudge_y" type="number"> <small>px</small>
							</div>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Marker Listing - Filtering Tab -->
				<div class="grouping" data-group="map-settings-marker-listings-filtering">
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-marker-listings'></div>
						<?php _e('Filtering', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Marker Listing', 'wp-google-maps'); ?></div>
					<div class="am-subnav">
						<div class="am-subnav-item item" data-group="map-settings-marker-listings-general"><?php _e("General", "wp-google-maps"); ?></div>
						<div class="am-subnav-item on item" data-group="map-settings-marker-listings-filtering"><?php _e("Filtering", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-marker-listings-datatables"><?php _e("DataTables", "wp-google-maps"); ?></div>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Marker Listings", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Enable Marker Listing with the <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing_filters-atlas-major-v10" target="_BLANK">Pro version</a>.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing_filters-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Marker Listings', 'wp-google-maps'); ?> 
							</a>
						</div>

						<!-- Category Filter -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Category Filter", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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

						<!-- Filter Label -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Filter Label", "wp-google-maps"); ?></legend>
							<input type="text" name="category_filter_label_string" id="category_filter_label_string" class="wpgmza-pro-feature" placeholder="<?php esc_attr_e("Filter by", "wp-google-maps"); ?>"/>
						</fieldset>

						<!-- Change marker listing click -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Override Listing Click Zoom Level", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
						<fieldset  class="wpgmza-zoom-on-marker-listing-click-zoom-level wpgmza-zoom-slider-controller" id="zoom_level_on_marker_listing_click_level" style="display: none;">
							<legend><?php _e("Zoom Level", "wp-google-maps"); ?> <span data-zoom-hint></span></legend>

							<input name="zoom_level_on_marker_listing_click" style="display: none;" type="text" id="zoom_level_on_marker_listing_click" data-zoom-slider-preview="<?php _e("Preview: Listing Click Zoom Level", "wp-google-maps"); ?>">
							<div id="zoom-on-marker-listing-click-slider"></div> 
						</fieldset>

						<!-- Disable zoom on marker listing click -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Disable Zoom On Listing Click", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
					<div class="heading block has-back" style="display:none;">
						<div class="item caret-left" data-group='map-settings-marker-listings'></div>
						<?php _e('DataTables', 'wp-google-maps'); ?>
					</div>
					<div class="heading block" style="border-bottom:none;"><?php _e('Marker Listing', 'wp-google-maps'); ?></div>
					<div class="am-subnav">
						<div class="am-subnav-item item" data-group="map-settings-marker-listings-general"><?php _e("General", "wp-google-maps"); ?></div>
						<div class="am-subnav-item item" data-group="map-settings-marker-listings-filtering"><?php _e("Filtering", "wp-google-maps"); ?></div>
						<div class="am-subnav-item on item" data-group="map-settings-marker-listings-datatables"><?php _e("DataTables", "wp-google-maps"); ?></div>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Marker Listings", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Enable Marker Listing with the <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing-datatables-atlas-major-v10" target="_BLANK">Pro version</a>.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker_listing-datatables-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Marker Listings', 'wp-google-maps'); ?> 
							</a>
						</div>

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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Remove search box", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col textright">
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
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Category Legends", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Enable category legends with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=category-legends-atlas-major-v10">Pro add-on</a>', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=category-legends-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Category Legends', 'wp-google-maps'); ?> 
							</a>
						</div>

						<!-- Enabled field -->
						<fieldset class="wpgmza-row wpgmza-pro-feature">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable Category Legends", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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

						<!-- Layout Style -->
						<fieldset class="wpgmza-row wpgmza-pro-feature">
							<legend><?php _e("Style", "wp-google-maps"); ?></legend>
							<select name="category_legends_style" id="category_legends_style">
								<option value=""><?php _e('Row', 'wp-google-maps'); ?></option>
								<option value="1"><?php _e('Column', 'wp-google-maps'); ?></option>
							</select>
						</fieldset>

						<!-- Legends Label -->
						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Legends Label", "wp-google-maps"); ?></legend>
							<input type="text" name="category_legends_label_string" id="category_legends_label_string" class="wpgmza-pro-feature" placeholder="<?php esc_attr_e("Legends", "wp-google-maps"); ?>"/>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Behavious Tab -->
				<div class="grouping" data-group="map-settings-behaviour">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
					</div>

					<div class="navigation">
						<div class="item caret-right" data-group="map-settings-behaviour-marker">
							<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/marker-tab-icon.png"; ?>"/></div>
							<?php _e("Marker", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php esc_attr_e("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-behaviour-shapes">
							<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/polygon.png"; ?>"/></div>
							<?php _e("Shapes", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php esc_attr_e("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-behaviour-bounds">
							<span class="dashicons dashicons-image-crop"></span>
							<?php _e("Bounds", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php esc_attr_e("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-behaviour-user-location">
							<span class="dashicons dashicons-businessperson"></span>
							<?php _e("User Location", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php esc_attr_e("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>

						<div class="item caret-right" data-group="map-settings-behaviour-streetview" data-wpgmza-require-engine="google-maps">
							<span class="dashicons dashicons-editor-insertmore"></span>
							<?php _e("Street View", "wp-google-maps"); ?> <span class='wpgmza-upsell-pro-pill' title="<?php esc_attr_e("Add more features with our Pro add-on", "wp-google-maps"); ?>"><?php _e("Pro", "wp-google-maps"); ?></span>
						</div>
						
						<div class="upsell-block auto-rotate">
							<!-- Upsell card - Behaviour --> 
							<div class='upsell-block-card'>
								<div class="upsell-block-card-image">
									<img src="<?php echo WPGMZA_PLUGIN_DIR_URL; ?>images/atlas-novus/custom-markers.webp" 
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
										<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-focus-card-atlas-major-v10" title="Pro Edition"  target="_BLANK" class="wpgmza-button">
											<?php _e("Unlock Behaviour","wp-google-maps"); ?>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Map Settings - Behaviour - Marker Tab -->
				<div class="grouping" data-group="map-settings-behaviour-marker">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to behaviour', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Behaviour Controls", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-marker-atlas-major-v10">
							Edit behaviour</a> with the Pro version.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-marker-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Behaviour', 'wp-google-maps'); ?> 
							</a>
						</div>

						<!-- Jump to nearest -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Jump to nearest marker on initialization?", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Click marker opens link", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Zoom on marker click", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-zoom-on-marker-click-zoom-level wpgmza-zoom-slider-controller" id="wpgmza_zoom_on_marker_click_zoom_level" style="display: none;">
							<legend><?php _e("Zoom Level", "wp-google-maps"); ?> <span data-zoom-hint></span></legend>
							
							<input name="wpgmza_zoom_on_marker_click_slider" style="display: none;" type="text" id="wpgmza_zoom_on_marker_click_slider" data-zoom-slider-preview="<?php _e("Preview: Marker Click Zoom", "wp-google-maps"); ?>">
							<div id="zoom-on-marker-click-slider"></div> 
						</fieldset>

						<!-- Marker Labels (beta) -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable Marker Labels (beta)", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type='checkbox' 
										id='enable_marker_labels' 
										name='enable_marker_labels' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'>
									<label for='enable_marker_labels' 
										data-on='<?php _e("Yes", "wp-google-maps"); ?>'
										data-off='<?php _e("No", "wp-google-maps"); ?>'>
									</label>
								</div>
							</div>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Behaviour - Shapes Tab -->
				<div class="grouping" data-group="map-settings-behaviour-shapes">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to behaviour', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Behaviour Controls", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-polygon-atlas-major-v10">
							Edit behaviour</a> with the Pro version.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-polygon-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Behaviour', 'wp-google-maps'); ?> 
							</a>
						</div>

						<!-- Labels "data-wpgmza-require-engine="google-maps"" Removed  -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable Shape Labels", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Disable Shape InfoWindows", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type="checkbox"
										id="disable_polygon_info_windows"
										name="disable_polygon_info_windows"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="disable_polygon_info_windows"></label>
								</div>
							</div>
						</fieldset>

						<!-- Shape Filtering -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable Shape Filtering", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type="checkbox"
										id="shape_filtering"
										name="shape_filtering"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="shape_filtering"></label>
								</div>
							</div>
						</fieldset>

						<div class="hint wpgmza-pro-feature"><?php _e("Shape filtering requires a marker category filter to be enabled.", "wp-google-maps"); ?></div>
					</div>
				</div>						

				<!-- Map Settings - Behaviour - Bounds Tab -->
				<div class="grouping" data-group="map-settings-behaviour-bounds">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to behaviour', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Behaviour Controls", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-bounds-atlas-major-v10">
							Edit behaviour</a> with the Pro version.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-bounds-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Behaviour', 'wp-google-maps'); ?> 
							</a>
						</div>

						<!-- Fit bounds to markers at page load -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend> <?php _e("Fit map bounds to markers", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Fit map bounds to markers after filtering", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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

						<!-- Lock map bounds to a preferred boundary -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Limit Map Boundary", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type='checkbox' 
										id='wpgmza_restrict_map_bounds' 
										name='restrict_map_bounds' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for='wpgmza_restrict_map_bounds'
										data-on='<?php _e("Yes", "wp-google-maps"); ?>' 
										data-off='<?php _e("No", "wp-google-maps"); ?>'>
									</label>
								</div>
							</div>
						</fieldset>

						<!-- Boundary Lock Controller Input -->
						<fieldset class="wpgmza-pro-feature wpgmza-row" id="wpgmza_restrict_bounds_adjustment" style="display: none;">
							<div class="wpgmza-col">
								<input type="hidden" name="restrict_boundary_corner_a">
								<input type="hidden" name="restrict_boundary_corner_b">

								<div class="wpgmza-boundary-input-quick-tools">
									<div class="wpgmza-button restrict-map-bounds-use-view" title="Use current viewport as boundary"> 
										<?php _e("Use View", "wp-google-maps"); ?>
									</div>
								</div>

								<div class="wpgmza-boundary-input">
									<div class="wpgmza-boundary-input-controls">
										<!-- South West -->
										<div class="wpgmza-boundary-input-corner" data-corner="southWest">
											<div class="wpgmza-boundary-input-corner-title"><?php _e("South West", "wp-google-maps"); ?></div>
											<div class="wpgmza-boundary-input-coorindate">
												<div class="wpgmza-boundary-component">
													<div class="wpgmza-boundary-component-label">
														<?php _e("Lat", "wp-google-maps"); ?>
													</div>
													<input type="text" class="wpgmza-boundary-component-input" data-boundary-component="lat" />
												</div>

												<div class="wpgmza-boundary-component">
													<div class="wpgmza-boundary-component-label">
														<?php _e("Lng", "wp-google-maps"); ?>
													</div>
													<input type="text" class="wpgmza-boundary-component-input" data-boundary-component="lng" />
												</div>
											</div>
										</div>
										
										<!-- North East -->
										<div class="wpgmza-boundary-input-corner" data-corner="northEast">
											<div class="wpgmza-boundary-input-corner-title"><?php _e("North East", "wp-google-maps"); ?></div>
											<div class="wpgmza-boundary-input-coorindate">
												<div class="wpgmza-boundary-component">
													<div class="wpgmza-boundary-component-label">
														<?php _e("Lat", "wp-google-maps"); ?>
													</div>
													<input type="text" class="wpgmza-boundary-component-input" data-boundary-component="lat" />
												</div>

												<div class="wpgmza-boundary-component">
													<div class="wpgmza-boundary-component-label">
														<?php _e("Lng", "wp-google-maps"); ?>
													</div>
													<input type="text" class="wpgmza-boundary-component-input" data-boundary-component="lng" />
												</div>
											</div>
										</div>
									</div>
								</div>

								<div class="hint"><?php _e("Your map will be locked to these boundaries on the frontend.", "wp-google-maps"); ?></div>

							</div>

						</fieldset>
						
					</div>
				</div>

				<!-- Map Settings - Behaviour - User Location Tab -->
				<div class="grouping" data-group="map-settings-behaviour-user-location">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to behaviour', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Behaviour Controls", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-user-loc-atlas-major-v10">
							Edit behaviour</a> with the Pro version.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=behaviour-user-loc-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Behaviour', 'wp-google-maps'); ?> 
							</a>
						</div>

						<!-- Show user location -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Show User's Location?", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Automatically pan to users location?", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
								<div class='switch wpgmza-geolocation-setting'>
									<input type='checkbox'
										id='wpgmza_automatically_pan_to_users_location' 
										name='automatically_pan_to_users_location' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for="wpgmza_automatically_pan_to_users_location"></label>
								</div>
							</div>
						</fieldset>

						<!-- Pan to user control -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable user location map control", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
								<div class='switch wpgmza-geolocation-setting'>
									<input type='checkbox'
										id='wpgmza_enable_user_location_control' 
										name='enable_user_location_control' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for="wpgmza_enable_user_location_control"></label>
								</div>
							</div>
						</fieldset>

						<!-- Change user location pan -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Override User Location Zoom Level", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
						<fieldset  class="wpgmza-override-users-location-zoom-levels wpgmza-zoom-slider-controller" id="wpgmza_override_users_location_zoom_levels_slider" style="display: none;">
							<legend><?php _e("Zoom Level", "wp-google-maps"); ?> <span data-zoom-hint></span></legend>

							<input name="override_users_location_zoom_levels" style="display: none;" type="text" id="override_users_location_zoom_levels_slider" data-zoom-slider-preview="<?php _e("Preview: User Location Zoom", "wp-google-maps"); ?>">
							<div id="override-users-location-zoom-levels-slider"></div> 
						</fieldset>

						<!-- Show distance from location -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Show distance from location?", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
							_e('Enable user geolocation features with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=general-user-loc-atlas-major-v10">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>
					</div>
				</div>

				<!-- Map Settings - Behaviour - Streetview Tab -->
				<div class="grouping" data-group="map-settings-behaviour-streetview">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings-behaviour'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to behaviour', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings" >
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable street view features with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=streetview-atlas-major-v10">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Start in Streetview toggle -->
						<fieldset class="wpgmza-row wpgmza-pro-feature">
							<div class="wpgmza-col-8">
								<legend><?php _e("Map starts in Street View", "wp-google-maps"); ?></legend>
							</div>
							<div class="wpgmza-col textright">
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
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Zoom level range (dual-handle slider) -->
						<fieldset class="wpgmza-zoom-range-fieldset">
							<legend><?php _e("Zoom Level Range", "wp-google-maps"); ?></legend>
							<div class="wpgmza-dual-zoom-slider" data-min="0" data-max="22">
								<div class="wpgmza-dual-zoom-labels">
									<span><?php _e("Zoom out limit", "wp-google-maps"); ?>: <strong class="wpgmza-dual-zoom-out-label">0</strong></span>
									<span><?php _e("Zoom in limit", "wp-google-maps"); ?>: <strong class="wpgmza-dual-zoom-in-label">21</strong></span>
								</div>
								<div class="wpgmza-dual-zoom-track-wrap">
									<div class="wpgmza-dual-zoom-track"></div>
									<div class="wpgmza-dual-zoom-fill"></div>
									<input type="range" class="wpgmza-dual-zoom-out-input" min="0" max="22" step="1" value="0" aria-label="<?php esc_attr_e('Zoom out limit', 'wp-google-maps'); ?>">
									<input type="range" class="wpgmza-dual-zoom-in-input" min="0" max="22" step="1" value="21" aria-label="<?php esc_attr_e('Zoom in limit', 'wp-google-maps'); ?>">
								</div>
							</div>
							<!-- Hidden inputs preserve form field names for submission -->
							<input type="hidden" id="wpgmza_max_zoom" name="map_max_zoom" value="0">
							<input type="hidden" id="wpgmza_min_zoom" name="map_min_zoom" value="21">
						</fieldset>

						<!-- Hide POI -->
						<fieldset class="wpgmza-row wpgmza-row-stretch" data-wpgmza-require-engine="google-maps" data-wpgmza-feature-limited="google-maps.advancedMarkerElement">
							<div class="wpgmza-col-8">
								<legend><?php _e("Hide point of interest", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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

						<div class="feature-limit-notice" data-wpgmza-feature-limited-notice="google-maps.advancedMarkerElement">
							<span class="dashicons dashicons-lock"></span>
							<?php
							_e('Point of interest cannot be hidden when using the Advanced Marker Element.', 'wp-google-maps');
							?>
						</div>

						<fieldset class="wpgmza-pro-feature">
							<legend><?php _e("Default Marker Image", "wp-google-maps"); ?></legend>
							<div class="wpgmza-css-state-block">
								<div class="wpgmza-css-state-block-tabs">
									<div class="wpgmza-css-state-block-item" data-type="normal"><?php _e("Normal", "wp-google-maps"); ?></div>
									<div class="wpgmza-css-state-block-item" data-type="hover"><?php _e("Hover", "wp-google-maps"); ?></div>
									<div class="wpgmza-css-state-block-item" data-type="select"><?php _e("Select", "wp-google-maps"); ?></div>
								</div>

								<!-- Normal Icon -->
								<div class="wpgmza-css-state-block-content" data-type="normal">
									<div id="advanced-settings-marker-icon-picker-container"></div>
								</div>

								<!-- Hover Icon -->
								<div class="wpgmza-css-state-block-content" data-type="hover">
									<div id="advanced-settings-marker-icon-hover-picker-container"></div>
								</div>

								<!-- Select Icon -->
								<div class="wpgmza-css-state-block-content" data-type="select">
									<div id="advanced-settings-marker-icon-select-picker-container"></div>
								</div>
							</div>
						</fieldset>
							
						<div class="wpgmza-upsell wpgmza-card wpgmza-shadow">
							<?php
							_e('Enable custom marker icons with our <a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced-markers-atlas-major-v10">Pro add-on</a>', 'wp-google-maps');
							?>
						</div>

						<!-- Layers -->
						<fieldset data-wpgmza-require-engine="google-maps|open-layers|open-layers-latest">
							<legend><?php _e('Map Layers', 'wp-google-maps'); ?></legend>
							
							<ul>
								<li data-wpgmza-require-engine="google-maps|open-layers|open-layers-latest">
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

								<li data-wpgmza-require-engine="google-maps">
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

								<li data-wpgmza-require-engine="google-maps">
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

						<!-- Map Scale line Control -->
						<fieldset class="wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable map scale line control", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type='checkbox'
										id='wpgmza_enable_scale_control' 
										name='enable_scale_control' 
										class='postform cmn-toggle cmn-toggle-round-flat'/>
									<label for="wpgmza_enable_scale_control"></label>
								</div>
							</div>
						</fieldset>

						<!-- Disable lightbox -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Disable lightbox for marker images", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Use Raw JPEG coordinates?", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
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
						<fieldset id="wpgmza-marker-ratings" class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e('Enable Marker Ratings', 'wp-google-maps'); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type='checkbox' 
										id='enable_marker_ratings' 
										name='enable_marker_ratings' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for='enable_marker_ratings'></label>
								</div>
							</div>
						</fieldset>

						<!-- Reset map control -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Enable map view reset control", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type='checkbox'
										id='wpgmza_enable_map_reset_control' 
										name='enable_map_reset_control' 
										class='postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature'/>
									<label for="wpgmza_enable_map_reset_control"></label>
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
								'Get the rest of these advanced features with the <a href="%s" target="_BLANK">Pro version</a>. Support and updates included forever.',
								"wp-google-maps"
								),
								"https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=advanced-atlas-major-v10"
							);
							?>
						</div>
					</div>
				</div>

				<!-- Map Settings - Mobile Tab -->
				<div class="grouping" data-group="map-settings-mobile">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Change zoom on mobile devices -->
						<fieldset class="wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Change Starting Zoom on Mobile", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type='checkbox'
										id='zoom_level_mobile_override_enabled' 
										name='zoom_level_mobile_override_enabled' 
										class='postform cmn-toggle cmn-toggle-round-flat'/>
									<label for="zoom_level_mobile_override_enabled"></label>
								</div>
							</div>
						</fieldset>

						<!-- Zoom slider -->
						<fieldset  class="wpgmza-zoom-level-mobile-override-slider-level wpgmza-zoom-slider-controller" id="zoom_level_mobile_override_level" style="display: none;">
							<legend><?php _e("Mobile Zoom Level", "wp-google-maps"); ?> <span data-zoom-hint></span></legend>

							<input name="zoom_level_mobile_override" style="display: none;" type="text" id="zoom_level_mobile_override" data-zoom-slider-preview="<?php _e("Preview: Mobile Zoom Level", "wp-google-maps"); ?>">
							<div id="zoom-level-mobile-override-slider"></div> 
						</fieldset>

						<!-- Change zoom on mobile devices -->
						<fieldset class="wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Change Map Dimensions on Mobile", "wp-google-maps"); ?></legend>
							</div>

							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type='checkbox'
										id='map_dimensions_mobile_override_enabled' 
										name='map_dimensions_mobile_override_enabled' 
										class='postform cmn-toggle cmn-toggle-round-flat'/>
									<label for="map_dimensions_mobile_override_enabled"></label>
								</div>
							</div>
						</fieldset>

						<!-- Map Width Field -->
						<fieldset class='wpgmza-map-mobile-dimension-override' style="display: none;">
							<legend><?php _e("Mobile Width", "wp-google-maps"); ?></legend>
							
							<div class='multi-field'>
								<input id="wpgmza_mobile_width" name="map_mobile_width" type="number" value="100"/>
								<select id='wpgmza_map_mobile_width_type' name='map_mobile_width_type'>
									<option value="px">px</option>
									<option value="%" selected="selected">%</option>
									<option value="vw">vw</option>
								</select>
							</div>
						</fieldset>

						<!-- Map Height Field -->
						<fieldset class='wpgmza-map-mobile-dimension-override' style="display: none;">
							<legend><?php _e("Mobile Height", "wp-google-maps"); ?> </legend>
							
							<div class="multi-field">
								<input id='wpgmza_mobile_height' name='map_mobile_height' type='number' value="200"/>
								<select id='wpgmza_map_mobile_height_type' name='map_mobile_height_type'>
									<option value="px">px</option>
									<option value="%">%</option>
									<option value="vh">vh</option>
								</select>
							</div>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Integrations Tab -->
				<div class="grouping" data-group="map-settings-integrations">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock Integrations", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=integrations-atlas-major-v10">
							Enable integrations</a> with the Pro version.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=integrations-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Integrations', 'wp-google-maps'); ?> 
							</a>
						</div>

						<!-- Load integrations -->
						<fieldset id="wpgmza-integration-panel-container" class="wpgmza-pro-feature wpgmza-pro-feature-hide">
							<legend><?php _e("Integration", "wp-google-maps"); ?></legend>
						</fieldset>
					</div>
				</div>

				<!-- Map Settings - Beta Tab -->
				<div class="grouping" data-group="map-settings-beta">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
					</div>

					<div class="settings">
						<!-- Load in viewport -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Lazyload InfoWindow content", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
								<div class='switch'>
									<input type="checkbox"
										id="lazyload_info_window_content"
										name="lazyload_info_window_content"
										class="postform cmn-toggle cmn-toggle-round-flat wpgmza-pro-feature"/>
									<label for="lazyload_info_window_content"></label>
								</div>
							</div>
						</fieldset>
						
						<div class="hint"><?php _e("Improves performance, by only loading info-window content when it is needed.", "wp-google-maps"); ?></div>

						<!-- Load in viewport -->
						<fieldset class="wpgmza-pro-feature wpgmza-row wpgmza-row-stretch">
							<div class="wpgmza-col-8">
								<legend><?php _e("Only load markers within viewport", "wp-google-maps"); ?></legend>
							</div>
							
							<div class="wpgmza-col textright">
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
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
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
							<div class="wpgmza-col-3">
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
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature">
							<div class="wpgmza-col-3">
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
						</div>

						<!-- Category Legends Shortcode -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature">
							<div class="wpgmza-col-3">
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
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature">
							<div class="wpgmza-col-3">
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
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature">
							<div class="wpgmza-col-3">
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
						</div>

						<!-- Directions Shortcode -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature">
							<div class="wpgmza-col-3">
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

						<!-- Marker Field Filter Shortcode -->
						<fieldset class="wpgmza-row align-center wpgmza-pro-feature">
							<div class="wpgmza-col-3">
								<?php _e("Marker Field Filter", "wp-google-maps"); ?>
							</div>

							<div class="wpgmza-col wpgmza-text-align-right">
								<button class="wpgmza-button wpgmza-shortcode-button">[wpgmza_marker_field_filter id="<span></span>"]</button>
							</div>
						</fieldset>

						<!-- Marker Field Filter Shortcode Desc -->
						<div class="wpgmza-shortcode-description wpgmza-card wpgmza-shadow wpgmza-margin-t-10 wpgmza-hidden wpgmza-pro-feature-hide">
							<span><?php _e("Attributes", "wp-google-maps"); ?></span>
							<ul>
								<!-- Pro Features -->
								<li class="wpgmza-pro-feature-hide"><strong>id</strong> <em><?php _e("The ID of the map you are loading (number)", "wp-google-maps"); ?></em></li>
								<li class="wpgmza-pro-feature-hide"><strong>field_ids</strong> <em><?php _e("Comma-separated list of custom field IDs to display (numbers). Ignore to show all filters.", "wp-google-maps"); ?></em></li>
							</ul>

							<div class="hint"><?php _e("Note: Shortcode must be placed on a page with a map present", "wp-google-maps"); ?></div>
						</div>

						<!-- Upsell -->
						<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
							<div class="wpgmza-upsell-heading"><?php _e("Unlock More Shortcodes", "wp-google-maps"); ?></div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('<a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=shortcodes-atlas-major-v10">
							Get more shortcodes</a> with the Pro version.', 'wp-google-maps');
								?>
							</div>
							<div class="wpgmza-upsell-content">
								<?php
									_e('Support and updates included forever.', 'wp-google-maps');
								?>
							</div>
							<a target="_BLANK" class="wpgmza-upsell-button"
								href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=shortcodes-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
								<?php _e('Unlock Shortcodes', 'wp-google-maps'); ?> 
							</a>
						</div>
						
					</div>
				</div>
				

				<!-- Map Settings - Pro Features Tab -->
				<div class="grouping" data-group="map-settings-pro">
					<div class="am-ed-back heading block has-back">
						<div class="item caret-left" data-group='map-settings'>
							<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
						</div>
						<span class="am-ed-back-text"><?php _e('Back to settings', 'wp-google-maps'); ?></span>
					</div>

					<div class="am-panel-scroll">
						<!-- Hero -->
						<div class="am-up-hero">
							<h2><?php _e("Unlock Pro", "wp-google-maps"); ?></h2>
							<p><?php _e("Everything you need to build powerful, professional maps. Lifetime updates included.", "wp-google-maps"); ?></p>
							<a href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=upgradenow-atlas-major-v10" . wpgmzaGetUpsellLinkParams())); ?>"
							   target="_BLANK" class="am-btn-white" id="wpgmza-upgrade-now__btn">
								<?php _e("Upgrade Now", "wp-google-maps"); ?>
							</a>
						</div>

						<!-- Feature list -->
						<div class="am-up-list">
							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php _e("Advanced Markers", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("Titles, descriptions, images, custom icons, categories, and animations.", "wp-google-maps"); ?></div>
								</div>
							</div>

							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8z"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php _e("Directions", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("Step-by-step directions, waypoints, and transit modes.", "wp-google-maps"); ?></div>
								</div>
							</div>

							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php _e("Unlimited Maps", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("Create as many maps as you need. No limits, ever.", "wp-google-maps"); ?></div>
								</div>
							</div>

							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php _e("Marker Listings", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("Six listing styles — tables, grids, carousels, and more.", "wp-google-maps"); ?></div>
								</div>
							</div>

							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php esc_html_e("Categories & Filtering", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("Organize markers with categories and let visitors filter.", "wp-google-maps"); ?></div>
								</div>
							</div>

							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php _e("Import / Export", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("CSV, KML, and JSON — bulk import thousands of markers.", "wp-google-maps"); ?></div>
								</div>
							</div>

							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php _e("Pro Store Locator", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("Geolocation, category filtering, and hide-before-search.", "wp-google-maps"); ?></div>
								</div>
							</div>

							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php esc_html_e("Heatmaps & Overlays", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("Dynamic heatmaps, image overlays, and KML layers.", "wp-google-maps"); ?></div>
								</div>
							</div>

							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php _e("Advanced Controls", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("User location, bounds, streetview, traffic, and bicycle layers.", "wp-google-maps"); ?></div>
								</div>
							</div>

							<div class="am-up-item">
								<div class="am-up-ico">
									<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
								</div>
								<div>
									<div class="am-up-name"><?php esc_html_e("Lifetime Updates & Support", "wp-google-maps"); ?></div>
									<div class="am-up-desc"><?php _e("One-time purchase. Free updates and priority support forever.", "wp-google-maps"); ?></div>
								</div>
							</div>
						</div>

						<!-- Footer links -->
						<div class="am-up-footer">
							<a href="https://www.wpgmaps.com/demo/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-demo-view-atlas-major-v10" target="_BLANK"><?php _e("View Demos", "wp-google-maps"); ?></a>
							<span class="am-up-footer-sep"></span>
							<a href="https://www.wpgmaps.com/contact-us/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-contactus-atlas-major-v10" target="_BLANK"><?php _e("Contact Sales", "wp-google-maps"); ?></a>
						</div>

						<!-- Secondary CTA — second chance to upgrade after the feature list -->
						<div class="wpgmza-text-align-center" style="margin-top: 20px;">
							<a href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-upgrade-footer-atlas-major-v10"
							   target="_BLANK"
							   class="am-btn am-btn-pro">
								<?php _e("Upgrade to Pro", "wp-google-maps"); ?>
							</a>
						</div>

						<br>
						<div class="wpgmza-text-align-center"><?php _e("Need help? <a href=\"https://www.wpgmaps.com/forums/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-forums-atlas-major-v10\" target=\"_BLANK\">Ask a question on our support forum</a>.", "wp-google-maps"); ?> </div>
					</div>
				</div>
			</form>

			<!-- Markers Tab — Atlas Major: Concept C split-state panel -->
			<div class="grouping auto-expand has-fullscreen" data-group="map-markers" data-feature-discard="true">
				<!-- Hidden heading — SidebarGroupings may reference it -->
				<div class="heading block has-back" style="display:none">
					<div class="item caret-left" data-group='global'></div>
					<?php _e('Markers', 'wp-google-maps'); ?>
					<div class="grouping-toggle-fullscreen" title="Toggle expanded panel view"></div>
				</div>

				<!-- Add Marker bar — own address input with autocomplete -->
				<div class="am-ml-bar">
					<div class="am-ph-title"><?php _e("Add Marker", "wp-google-maps"); ?></div>
					<div class="am-ml-row" style="margin-top: 10px;">
						<input type="text" id="am-quick-add-address" class="am-ml-input" autocomplete="off" placeholder="<?php esc_attr_e('Enter address or coordinates...', 'wp-google-maps'); ?>" />
						<div class="item caret-right item-focus am-btn am-btn-dark am-marker-quick-add" data-group="map-markers-editor">
							<?php _e("Add", "wp-google-maps"); ?>
						</div>
					</div>
					<div id="am-quick-add-autocomplete-results" style="display: none;"></div>
				</div>

				<!-- Marker list header + search -->
				<div class="am-ml-bar" style="border-bottom: 1px solid var(--am-border);">
					<div class="am-ml-bar-row">
						<div class="am-ph-title"><?php _e("Markers", "wp-google-maps"); ?> <span class="am-ml-count"></span></div>
					</div>
					<div class="am-search-field" style="margin-top:10px;">
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
						<input type="text" class="am-ml-search" placeholder="<?php esc_attr_e('Search markers...', 'wp-google-maps'); ?>" />
					</div>
				</div>

				<!-- Atlas Major custom marker list — rendered by JS -->
				<div class="am-panel-scroll">
					<div class="am-marker-list-container"></div>
					<div class="am-ml-pagination"></div>
				</div>

				<!-- Upsell pinned at bottom of marker panel (sibling of am-panel-scroll
				     so it sits outside the scrollable area and stays visible regardless
				     of how many markers exist). -->
				<div class="am-marker-list-upsell">
					<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card">
						<div class="wpgmza-upsell-heading"><?php _e("Do more with your markers", "wp-google-maps"); ?></div>
						<div class="wpgmza-upsell-content">
							<?php _e("Custom icons, categories, images, descriptions, links, hover states, and sorting controls.", "wp-google-maps"); ?>
						</div>
						<a target="_BLANK" class="wpgmza-upsell-button"
							href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=marker-list-upsell-atlas-major-v10" . wpgmzaGetUpsellLinkParams())); ?>">
							<?php _e("Unlock Advanced Markers", "wp-google-maps"); ?>
						</a>
					</div>
				</div>

				<!-- Hidden DataTable — still needed for fullscreen mode and Pro compatibility -->
				<div class="feature-list am-dt-fullscreen-only">
					<div class="wpgmza-table-container" id="wpgmza-table-container-Marker"></div>
				</div>

				<!-- Hidden nav item for JS — SidebarGroupings uses this to navigate to editor -->
				<div class="navigation" style="display:none">
					<div class="item caret-right item-focus" data-group="map-markers-editor">
						<?php _e("Add Marker", "wp-google-maps"); ?>
					</div>
				</div>
			</div>

			<!-- Markers - Editor Tab — Atlas Major: back-nav + scrollable editor -->
			<div class="grouping auto-expand" data-group="map-markers-editor" data-feature="marker">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-markers'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to markers', 'wp-google-maps'); ?></span>
				</div>

				<div class="am-panel-scroll">
					<div class="wpgmza-feature-accordion settings" id="markers" data-wpgmza-feature-type="marker">
						<div class="wpgmza-accordion">
							<!-- Upsell moved into marker-panel.html.php,
							     directly below the "Edit Marker" header. -->
							<div class="wpgmza-feature-panel-container"></div>
						</div>
					</div>
				</div>
			</div>

			<!-- Markers - Advanced Markers Tab - Upsell -->
			<div class="grouping" data-group="map-markers-advanced" data-feature="marker">
				<div class="heading block has-back" style="display:none">
					<div class="item caret-left" data-group='map-markers'></div>
					<?php _e('Advanced Markers', 'wp-google-maps'); ?>
				</div>

				<div class="settings" id="advanced-markers">
					<!-- Left in place in case anything has to happen to it -->
				</div>
			</div>

			<!-- Polygons Tab -->
			<div class="grouping has-fullscreen" data-group="map-polygons" data-feature-discard="true">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-datasets'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to shapes', 'wp-google-maps'); ?></span>
				</div>

				<!-- Add bar -->
				<div class="am-ml-bar">
					<div class="am-ph-title"><?php _e("Add Polygon", "wp-google-maps"); ?></div>
					<div class="am-ml-row" style="margin-top: 10px;">
						<div class="item caret-right item-focus am-btn am-btn-dark" data-group="map-polygon-editor" style="flex:1;justify-content:center;">
							<?php _e("Draw Polygon", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

				<!-- List header -->
				<div class="am-ml-bar" style="border-bottom: 1px solid var(--am-border);">
					<div class="am-ph-title"><?php _e("Polygons", "wp-google-maps"); ?></div>
				</div>

				<!-- Feature list -->
				<div class="am-panel-scroll">
					<div class="am-feature-list-container" data-feature-type="polygon"></div>
					<div class="feature-list am-dt-fullscreen-only">
						<div class="wpgmza-table-container" id="wpgmza-table-container-Polygon"></div>
					</div>
				</div>

				<!-- Hidden nav for JS -->
				<div class="am-hidden-nav" style="display:none;">
					<div class="item caret-right item-focus" data-group="map-polygon-editor">
						<?php _e("Add Polygon", "wp-google-maps"); ?>
					</div>
				</div>
			</div>

			<!-- Polygons - Editor Tab -->
			<div class="grouping auto-expand has-fullscreen" data-group="map-polygon-editor" data-feature="polygon">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-polygons'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to polygons', 'wp-google-maps'); ?></span>
				</div>

				<div class="wpgmza-feature-accordion settings" id="polygons" data-wpgmza-feature-type="polygon">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Polylines Tab -->
			<div class="grouping has-fullscreen" data-group="map-polylines" data-feature-discard="true">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-datasets'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to shapes', 'wp-google-maps'); ?></span>
				</div>

				<!-- Add bar -->
				<div class="am-ml-bar">
					<div class="am-ph-title"><?php _e("Add Polyline", "wp-google-maps"); ?></div>
					<div class="am-ml-row" style="margin-top: 10px;">
						<div class="item caret-right item-focus am-btn am-btn-dark" data-group="map-polyline-editor" style="flex:1;justify-content:center;">
							<?php _e("Draw Polyline", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

				<!-- List header -->
				<div class="am-ml-bar" style="border-bottom: 1px solid var(--am-border);">
					<div class="am-ph-title"><?php _e("Polylines", "wp-google-maps"); ?></div>
				</div>

				<!-- Feature list -->
				<div class="am-panel-scroll">
					<div class="am-feature-list-container" data-feature-type="polyline"></div>
					<div class="feature-list am-dt-fullscreen-only">
						<div class="wpgmza-table-container" id="wpgmza-table-container-Polyline"></div>
					</div>
				</div>

				<!-- Hidden nav for JS -->
				<div class="am-hidden-nav" style="display:none;">
					<div class="item caret-right item-focus" data-group="map-polyline-editor">
						<?php _e("Add Polyline", "wp-google-maps"); ?>
					</div>
				</div>
			</div>

			<!-- Polylines - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-polyline-editor" data-feature="polyline">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-polylines'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to polylines', 'wp-google-maps'); ?></span>
				</div>

				<div class="wpgmza-feature-accordion settings" id="polylines" data-wpgmza-feature-type="polyline">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Heatmaps Tab -->
			<div class="grouping has-fullscreen" data-group="map-heatmaps" data-feature-discard="true">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-datasets'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to shapes', 'wp-google-maps'); ?></span>
				</div>

				<!-- Add bar -->
				<div class="am-ml-bar">
					<div class="am-ph-title"><?php _e("Add Heatmap", "wp-google-maps"); ?></div>
					<div class="am-ml-row" style="margin-top: 10px;">
						<div class="item caret-right item-focus am-btn am-btn-dark" data-group="map-heatmap-editor" style="flex:1;justify-content:center;">
							<?php _e("Add Heatmap", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

				<!-- List header -->
				<div class="am-ml-bar" style="border-bottom: 1px solid var(--am-border);">
					<div class="am-ph-title"><?php _e("Heatmaps", "wp-google-maps"); ?></div>
				</div>

				<!-- Feature list -->
				<div class="am-panel-scroll">
					<div class="am-feature-list-container" data-feature-type="heatmap"></div>
					<div class="feature-list am-dt-fullscreen-only">
						<div class="wpgmza-table-container" id="wpgmza-table-container-Heatmap"></div>
					</div>
				</div>

				<!-- Hidden nav for JS -->
				<div class="am-hidden-nav" style="display:none;">
					<div class="item caret-right item-focus" data-group="map-heatmap-editor">
						<?php _e("Add Heatmap", "wp-google-maps"); ?>
					</div>
				</div>
			</div>

			<!-- Heatmaps - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-heatmap-editor" data-feature="heatmap">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-heatmaps'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to heatmaps', 'wp-google-maps'); ?></span>
				</div>

				<div class="wpgmza-feature-accordion settings" id="heatmaps" data-wpgmza-feature-type="heatmap">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Circles Tab -->
			<div class="grouping has-fullscreen" data-group="map-circles" data-feature-discard="true">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-datasets'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to shapes', 'wp-google-maps'); ?></span>
				</div>

				<!-- Add bar -->
				<div class="am-ml-bar">
					<div class="am-ph-title"><?php _e("Add Circle", "wp-google-maps"); ?></div>
					<div class="am-ml-row" style="margin-top: 10px;">
						<div class="item caret-right item-focus am-btn am-btn-dark" data-group="map-circle-editor" style="flex:1;justify-content:center;">
							<?php _e("Draw Circle", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

				<!-- List header -->
				<div class="am-ml-bar" style="border-bottom: 1px solid var(--am-border);">
					<div class="am-ph-title"><?php _e("Circles", "wp-google-maps"); ?></div>
				</div>

				<!-- Feature list -->
				<div class="am-panel-scroll">
					<div class="am-feature-list-container" data-feature-type="circle"></div>
					<div class="feature-list am-dt-fullscreen-only">
						<div class="wpgmza-table-container" id="wpgmza-table-container-Circle"></div>
					</div>
				</div>

				<!-- Hidden nav for JS -->
				<div class="am-hidden-nav" style="display:none;">
					<div class="item caret-right item-focus" data-group="map-circle-editor">
						<?php _e("Add Circle", "wp-google-maps"); ?>
					</div>
				</div>
			</div>

			<!-- Circles - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-circle-editor" data-feature="circle">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-circles'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to circles', 'wp-google-maps'); ?></span>
				</div>

				<div class="wpgmza-feature-accordion settings" id="circles" data-wpgmza-feature-type="circle">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Rectangles Tab -->
			<div class="grouping has-fullscreen" data-group="map-rectangles" data-feature-discard="true">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-datasets'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to shapes', 'wp-google-maps'); ?></span>
				</div>

				<!-- Add bar -->
				<div class="am-ml-bar">
					<div class="am-ph-title"><?php _e("Add Rectangle", "wp-google-maps"); ?></div>
					<div class="am-ml-row" style="margin-top: 10px;">
						<div class="item caret-right item-focus am-btn am-btn-dark" data-group="map-rectangle-editor" style="flex:1;justify-content:center;">
							<?php _e("Draw Rectangle", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

				<!-- List header -->
				<div class="am-ml-bar" style="border-bottom: 1px solid var(--am-border);">
					<div class="am-ph-title"><?php _e("Rectangles", "wp-google-maps"); ?></div>
				</div>

				<!-- Feature list -->
				<div class="am-panel-scroll">
					<div class="am-feature-list-container" data-feature-type="rectangle"></div>
					<div class="feature-list am-dt-fullscreen-only">
						<div class="wpgmza-table-container" id="wpgmza-table-container-Rectangle"></div>
					</div>
				</div>

				<!-- Hidden nav for JS -->
				<div class="am-hidden-nav" style="display:none;">
					<div class="item caret-right item-focus" data-group="map-rectangle-editor">
						<?php _e("Add Rectangle", "wp-google-maps"); ?>
					</div>
				</div>
			</div>

			<!-- Rectangles - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-rectangle-editor" data-feature="rectangle">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-rectangles'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to rectangles', 'wp-google-maps'); ?></span>
				</div>

				<div class="wpgmza-feature-accordion settings" id="rectangles" data-wpgmza-feature-type="rectangle">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Point Labels Tab -->
			<div class="grouping has-fullscreen" data-group="map-point-labels" data-feature-discard="true">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-datasets'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to shapes', 'wp-google-maps'); ?></span>
				</div>

				<!-- Add bar -->
				<div class="am-ml-bar">
					<div class="am-ph-title"><?php _e("Add Point Label", "wp-google-maps"); ?></div>
					<div class="am-ml-row" style="margin-top: 10px;">
						<div class="item caret-right item-focus am-btn am-btn-dark" data-group="map-point-label-editor" style="flex:1;justify-content:center;">
							<?php _e("Add Point Label", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

				<!-- List header -->
				<div class="am-ml-bar" style="border-bottom: 1px solid var(--am-border);">
					<div class="am-ph-title"><?php _e("Point Labels", "wp-google-maps"); ?></div>
				</div>

				<!-- Feature list -->
				<div class="am-panel-scroll">
					<div class="am-feature-list-container" data-feature-type="pointlabel"></div>
					<div class="feature-list am-dt-fullscreen-only">
						<div class="wpgmza-table-container" id="wpgmza-table-container-Pointlabel"></div>
					</div>
				</div>

				<!-- Hidden nav for JS -->
				<div class="am-hidden-nav" style="display:none;">
					<div class="item caret-right item-focus" data-group="map-point-label-editor">
						<?php _e("Add Point Label", "wp-google-maps"); ?>
					</div>
				</div>
			</div>

			<!-- Point Label - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-point-label-editor" data-feature="pointlabel">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-point-labels'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to point labels', 'wp-google-maps'); ?></span>
				</div>

				<div class="wpgmza-feature-accordion settings" id="pointlabels" data-wpgmza-feature-type="pointlabel">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Image Overlays Tab -->
			<div class="grouping has-fullscreen" data-group="map-image-overlays" data-feature-discard="true">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-datasets'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to shapes', 'wp-google-maps'); ?></span>
				</div>

				<!-- Add bar -->
				<div class="am-ml-bar">
					<div class="am-ph-title"><?php _e("Add Image Overlay", "wp-google-maps"); ?></div>
					<div class="am-ml-row" style="margin-top: 10px;">
						<div class="item caret-right item-focus am-btn am-btn-dark" data-group="map-image-overlay-editor" style="flex:1;justify-content:center;">
							<?php _e("Add Image Overlay", "wp-google-maps"); ?>
						</div>
					</div>
				</div>

				<!-- List header -->
				<div class="am-ml-bar" style="border-bottom: 1px solid var(--am-border);">
					<div class="am-ph-title"><?php _e("Image Overlays", "wp-google-maps"); ?></div>
				</div>

				<!-- Feature list -->
				<div class="am-panel-scroll">
					<div class="am-feature-list-container" data-feature-type="imageoverlay"></div>
					<div class="feature-list am-dt-fullscreen-only">
						<div class="wpgmza-table-container" id="wpgmza-table-container-Imageoverlay"></div>
					</div>
				</div>

				<!-- Hidden nav for JS -->
				<div class="am-hidden-nav" style="display:none;">
					<div class="item caret-right item-focus" data-group="map-image-overlay-editor">
						<?php _e("Add Image Overlay", "wp-google-maps"); ?>
					</div>
				</div>
			</div>

			<!-- Image Overlay - Editor Tab -->
			<div class="grouping auto-expand" data-group="map-image-overlay-editor" data-feature="imageoverlay">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-image-overlays'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to image overlays', 'wp-google-maps'); ?></span>
				</div>

				<div class="wpgmza-feature-accordion settings" id="imageoverlays" data-wpgmza-feature-type="imageoverlay">
					<div class="wpgmza-accordion">
						<div class="wpgmza-feature-panel-container"></div>
					</div>
				</div>
			</div>

			<!-- Shapes - Shape Importer -->
			<div class="grouping auto-expand" data-group="map-shape-library">
				<div class="am-ed-back heading block has-back">
					<div class="item caret-left" data-group='map-datasets'>
						<svg class="am-ico am-ico-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
					</div>
					<span class="am-ed-back-text"><?php _e('Back to shapes', 'wp-google-maps'); ?></span>
				</div>

				<div class="settings">
					<!-- Upsell -->
					<div class="wpgmza-upsell wpgmza-upsell-featured wpgmza-card wpgmza-shadow">
						<div class="wpgmza-upsell-heading"><?php _e("Unlock Shape Library", "wp-google-maps"); ?></div>
						<div class="wpgmza-upsell-content">
							<?php
								_e('Import shapes from our cloud based <a target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=shape-library-atlas-major-v10">
						Shape Library</a> with the Pro version.', 'wp-google-maps');
							?>
						</div>
						<div class="wpgmza-upsell-content">
							<?php
								_e('Support and updates included forever.', 'wp-google-maps');
							?>
						</div>
						<a target="_BLANK" class="wpgmza-upsell-button"
							href="<?php echo esc_attr(\WPGMZA\Plugin::getProLink("https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=shape-library-btn-atlas-major-v10" . wpgmzaGetUpsellLinkParams()));  ?>">
							<?php _e('Unlock Shape Library', 'wp-google-maps'); ?> 
						</a>
					</div>
					
					<div class="wpgmza-shape-library-container"></div>
				</div>
			</div>


			<!-- Help Tab -->
			<div class="grouping" data-group="map-help">
				<div class="heading block" style="border-bottom:none;">
					<?php esc_html_e('Help & Support', 'wp-google-maps'); ?>
				</div>

				<div class="settings">
					<div class="general-info">
						<div class="info-heading"><?php _e("Need help with the plugin?", "wp-google-maps"); ?></div>

						<div class="info-content">
							<?php _e("Use our resources below to find a solution, or get in touch with us directly", "wp-google-maps"); ?>
						</div>

						<ul>
							<li>
								<a href="https://www.wpgmaps.com/help/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-docs-atlas-major-v10"
									title="<?php esc_attr_e('WP Go Maps Documentation Section', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Documentation", "wp-google-maps"); ?>
								</a>	
							</li>
							
							<li>
								<a href="https://www.wpgmaps.com/help/docs-category/troubleshooting/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-docs-troubleshooting-atlas-major-v10"
									title="<?php esc_attr_e('WP Go Maps Troubleshooting Section', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Troubleshooting", "wp-google-maps"); ?>
								</a>	
							</li>

							<li>
								<a href="https://www.wpgmaps.com/forums/forum/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-forums-atlas-major-v10"
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
								<a href="https://www.wpgmaps.com/contact-us/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-contactus-atlas-major-v10"
									title="<?php esc_attr_e('WP Go Maps Get in touch', 'wp-google-maps'); ?>"
									target="_BLANK">
										<?php _e("Get in touch", "wp-google-maps"); ?>
								</a>	
							</li>

							<li>
								<a href="https://www.wpgmaps.com/privacy-policy?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-privacy-atlas-major-v10"
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
								_e("Thank you for using <a href='https://www.wpgmaps.com?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=mapedit-thankyou-use-atlas-major-v10'>WP Go Maps</a>!", 'wp-google-maps');
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
						<label for="shortcode_input" class="wpgmza-button"><?php esc_html_e('Get Shortcode', 'wp-google-maps'); ?></label>
					</div>
					<div class="wpgmza-col wpgmza-text-align-right">
						<label class="wpgmza-button wpgmza-button-accent dynamic-action wpgmza-hidden"></label>
						<a data-map-preview-button href="" target="_BLANK" class="wpgmza-button static-action wpgmza-text-vertical-middle"><?php _e("Preview", "wp-google-maps"); ?></a>
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

				<!-- Live Preview: browser mockup frame -->
				<div class="am-preview-frame">
					<div class="am-preview-browser-bar">
						<div class="am-preview-dots">
							<span></span><span></span><span></span>
						</div>
						<div class="am-preview-url-bar"></div>
						<div class="am-preview-toggle-wrap">
							<span class="am-preview-toggle-label"><?php _e("Live Preview", "wp-google-maps"); ?></span>
							<div class="switch switch-inline am-preview-toggle-switch">
								<input class="cmn-toggle cmn-toggle-round-flat" type="checkbox" id="am-live-preview-toggle" checked="checked"/>
								<label for="am-live-preview-toggle"></label>
							</div>
						</div>
					</div>
					<div class="am-preview-page">
						<div class="am-preview-page-inner">

							<!-- Mockup site header -->
							<div class="am-mock-header">
								<div class="am-mock-header-inner">
									<div class="am-mock-logo">
										<div class="am-mock-logo-icon"></div>
										<div class="am-mock-logo-text">
											<div class="am-mock-site-name"></div>
											<div class="am-mock-tagline"></div>
										</div>
									</div>
									<div class="am-mock-nav">
										<span></span><span></span><span></span><span></span>
									</div>
								</div>
							</div>

							<!-- Mockup page content -->
							<div class="am-mock-content">
								<div class="am-mock-title-row">
									<h1 class="am-mock-page-title"><?php _e("Live Preview", "wp-google-maps"); ?></h1>
									<!-- "Remember to save your map!" — original legacy nag,
									     restored next to the Live Preview heading. JS calls
									     $("#wpgmaps_save_reminder").show() on bounds change
									     (map-edit-page.js:518) so this appears whenever the
									     user moves the map or zooms. Hidden by CSS while
									     autosave is enabled (body.wpgmza-autosave-on) so
									     it only nags users who have autosave turned off.
									     The .top-anchor class from the legacy Atlas Novus
									     markup is intentionally omitted — that variant
									     absolute-positions inside .map-container-wrap; here
									     we want it inline next to the Live Preview h1. -->
									<div id="wpgmaps_save_reminder" style="display:none;">
										<div class="wpgmza-nag wpgmza-update-nag wpgmza-card wpgmza-shadow wpgmza-notice warning am-save-nag">
											<strong><?php _e("Remember to save your map!","wp-google-maps"); ?></strong>
										</div>
									</div>
									<span class="am-frontend-only-notice am-frontend-only-notice-preview" style="display:none"><?php _e("This setting will only take effect on the frontend map.", "wp-google-maps"); ?></span>
								</div>

								<!-- Above-map component slot -->
								<div class="am-preview-slot am-preview-slot-above wpgmza-standalone-component"></div>

								<!-- The actual map -->
								<div class='map_wrapper'>
									<div id="wpgmza-map-container"></div>
								</div>

								<!-- Below-map component slot -->
								<div class="am-preview-slot am-preview-slot-below wpgmza-standalone-component"></div>
							</div>

							<!-- Mockup site footer -->
							<div class="am-mock-footer">
								<div class="am-mock-footer-inner">
									<div class="am-mock-footer-block"></div>
									<div class="am-mock-footer-block"></div>
									<div class="am-mock-footer-block"></div>
								</div>
								<div class="am-mock-footer-copy"></div>
							</div>

						</div>
					</div>
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

				<!-- #wpgmaps_save_reminder lives next to the Live Preview heading
                     (search above for "Remember to save your map!"). Kept inline
                     in the mockup title row so it nags users near where they're
                     working when autosave is off. -->


				<div class="wpgmza-nag wpgmza-update-nag wpgmza-card wpgmza-shadow wpgmza-notice info bottom-left-anchor wpgmza-quick-tip-container" id="am-quick-tip">
					<strong><?php _e("Quick tip: ","wp-google-maps"); ?></strong>
					<span><?php _e("You can right-click on the map to create a marker quickly!", "wp-google-maps"); ?></span>
					<div class="wpgmza-button wpgmza-button-primary" data-quick-action-relay="marker"><?php _e("Go", "wp-google-maps"); ?></div>
					<svg class="am-quick-tip-close" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</div>
				<script>
					(function(){
						if(localStorage.getItem('wpgmza-quick-tip-dismissed') === '1'){
							var el = document.getElementById('am-quick-tip');
							if(el) el.style.display = 'none';
						}
						document.addEventListener('click', function(e){
							if(e.target.closest('.am-quick-tip-close')){
								var el = document.getElementById('am-quick-tip');
								if(el) el.style.display = 'none';
								localStorage.setItem('wpgmza-quick-tip-dismissed', '1');
							}
						});
					})();
				</script>

				<div class="wpgmza-engine-switch-toolbar wpgmza-hidden wpgmza-card wpgmza-shadow">
					<div><?php _e('Would you like to try a different map engine?', 'wp-google-maps'); ?></div>
					<div class="wpgmza-engine-switch-toolbar-inner">
						<select data-engine-switch-control="engine">
							<option value="google-maps"><?php _e('Google Maps', 'wp-google-maps'); ?></option>
							<option value="leaflet-azure"><?php _e('Microsoft Azure (Formerly Bing)', 'wp-google-maps'); ?></option>
							<option value="leaflet-stadia"><?php _e('Stadia Maps', 'wp-google-maps'); ?></option>
							<option value="leaflet-maptiler"><?php _e('Maptiler', 'wp-google-maps'); ?></option>
							<option value="leaflet-locationiq"><?php _e('LocationIQ', 'wp-google-maps'); ?></option>
							<option value="leaflet-zerocost"><?php _e('Zero Cost Mapping', 'wp-google-maps'); ?></option>
							<option value="leaflet"><?php _e('Leaflet', 'wp-google-maps'); ?></option>
							<option value="open-layers-latest"><?php _e('OpenLayers', 'wp-google-maps'); ?></option>
						</select>

						<div class="wpgmza-button wpgmza-button-primary" data-engine-switch-control="apply"><?php _e("Apply", "wp-google-maps"); ?></div>
						<div class="wpgmza-button" data-engine-switch-control="dismiss"><?php _e("Dismiss", "wp-google-maps"); ?></div>
					</div>
				</div>
			</div>

			<!-- Context Menu -->
			<div class="wpgmza-context-menu wpgmza-shadow wpgmza-hidden">
				<div class="wpgmza-context-menu-heading"><?php _e("Quick Create", "wp-google-maps"); ?></div>

				<div class="wpgmza-context-menu-item" data-group="map-markers-editor">
					<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/marker-tab-icon.png"; ?>"/></div>
					<?php _e("Marker", "wp-google-maps"); ?>
				</div>
				
				<div class="wpgmza-context-menu-item" data-group="map-polygon-editor">
					<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/polygon.png"; ?>"/></div>
					<?php _e("Polygon", "wp-google-maps"); ?>
				</div>
				
				<div class="wpgmza-context-menu-item" data-group="map-polyline-editor">
					<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/polyline.png"; ?>"/></div>
					<?php _e("Polyline", "wp-google-maps"); ?>
				</div>

				<div class="wpgmza-context-menu-item" data-group="map-circle-editor">
					<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/circle.png"; ?>"/></div>
					<?php _e("Circle", "wp-google-maps"); ?>
				</div>
					
				<div class="wpgmza-context-menu-item" data-group="map-rectangle-editor">
					<div class="nav-item-icon"><img src="<?php echo WPGMZA_PLUGIN_DIR_URL . "images/rectangle.png"; ?>"/></div>
					<?php _e("Rectangle", "wp-google-maps"); ?>
				</div>
						
			</div><!-- /.wpgmza-context-menu -->

			<!-- Live Preview: hidden component templates (cloned into inner-stacks by JS) -->
			<!-- Pro components are injected by wp-google-maps-pro/js/v8/atlas-major-live-preview-pro.js -->
			<div id="wpgmza-live-preview-templates" style="display:none!important" aria-hidden="true">
				<div data-preview-component="store-locator">
					<?php
						/* Always render the store locator HTML into this hidden
						 * template container, regardless of whether the map
						 * currently has `store_locator_enabled = 1`. The live
						 * preview JS clones this template when the user toggles
						 * SL on, and needs the HTML to exist at page load time.
						 *
						 * We also force `store_locator_button_style = ''` (icons)
						 * here so the template always contains the canonical
						 * SVG-button version. JS in atlas-major-live-preview.js
						 * can then convert SVG → text on each render when the
						 * user's setting is 'text'. The reverse (text → SVG)
						 * isn't possible client-side without a template copy,
						 * so we keep the icons as the single source of truth. */
						$lp_map_id = !empty($_REQUEST['map_id']) ? intval($_REQUEST['map_id']) : 1;
						$lp_map = \WPGMZA\Map::createInstance($lp_map_id);
						$lp_map->store_locator_button_style = '';
						$lp_store_locator = \WPGMZA\StoreLocator::createInstance($lp_map);
						if($lp_store_locator){
							echo $lp_store_locator->html;
						}
					?>
				</div>
			</div>

		</div><!-- /.content -->
        </div><!-- /.am-main -->
    </div><!-- /.wpgmza-editor.am-shell -->
</div><!-- /#wpgmza-map-edit-page -->
