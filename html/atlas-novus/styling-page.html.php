<div class="wrap wpgmza-wrap fullscreen">
	<div class="wpgmza-editor wpgmza-styling-editor">
		<div class="sidebar wpgmza-shadow">
			<form action="<?php echo admin_url('admin-post.php'); ?>" method="POST" name="wpgmza_map_styling_form">
				<input
					type="hidden"
					name="action"
					value="wpgmza_save_styling_settings"
					/>

				<div class="grouping open" data-group="global">
					<div class="heading block" id="wpgmza-main-heading">
						<div class="wpgmza-row align-center">
							<?php _e('Component Style', 'wp-google-maps'); ?> &nbsp;<small>(<?php _e("beta", "wp-google-maps"); ?>)</small>
						</div>
					</div>

					<div class="settings">
						<fieldset>
							<div class="wpgmza-row">
								<div class="wpgmza-col">
									<legend><?php _e("Background Color", "wp-google-maps"); ?></legend>
								</div>

								<div class="wpgmza-col">
									<input type='text' class="wpgmza-color-input" name='--wpgmza-component-color' data-format="rgba" data-anchor="right" data-support-reset="true"/>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="wpgmza-row">
								<div class="wpgmza-col">
									<legend><?php _e("Text Color", "wp-google-maps"); ?></legend>
								</div>

								<div class="wpgmza-col">
									<input type='text' class="wpgmza-color-input" name='--wpgmza-component-text-color' data-format="rgba" data-anchor="right"/>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="wpgmza-row">
								<div class="wpgmza-col">
									<legend><?php _e("Accent Color", "wp-google-maps"); ?></legend>
								</div>

								<div class="wpgmza-col">
									<input type='text' class="wpgmza-color-input" name='--wpgmza-component-color-accent' data-format="rgba" data-anchor="right"/>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="wpgmza-row">
								<div class="wpgmza-col">
									<legend><?php _e("Accent Text Color", "wp-google-maps"); ?></legend>
								</div>

								<div class="wpgmza-col">
									<input type='text' class="wpgmza-color-input" name='--wpgmza-component-text-color-accent' data-format="rgba" data-anchor="right"/>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="wpgmza-row">
								<div class="wpgmza-col">
									<legend><?php _e("Common Grey", "wp-google-maps"); ?></legend>
								</div>

								<div class="wpgmza-col">
									<input type='text' class="wpgmza-color-input" name='--wpgmza-color-grey-500' data-format="rgba" data-anchor="right"/>
								</div>
							</div>
						</fieldset>


						<fieldset>
							<div class="wpgmza-row">
								<div class="wpgmza-col">
									<legend><?php _e("Border Radius", "wp-google-maps"); ?></legend>
								</div>

								<div class="wpgmza-col wpgmza-text-align-right">
									<input type='text' name='--wpgmza-component-border-radius' class="wpgmza-text-align-right wpgmza-stylig-unit-input" />
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="wpgmza-row">
								<div class="wpgmza-col">
									<legend><?php _e("Font Size", "wp-google-maps"); ?></legend>
								</div>

								<div class="wpgmza-col wpgmza-text-align-right">
									<input type='text' name='--wpgmza-component-font-size' class="wpgmza-text-align-right wpgmza-stylig-unit-input" />
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="wpgmza-row styling-backdrop-filter-row">
								<div class="wpgmza-col">
									<legend><?php _e("Backdrop Filter", "wp-google-maps"); ?></legend>
									<div class="wpgmza-pos-relative wpgmza-notice wpgmza-card wpgmza-shadow">
										<small><?php _e("In order for filters to take effect you will need to make your Background Color transparent. Increase transparency for a more dramatic effect", "wp-google-maps"); ?></small>
									</div>
									<br>
								</div>

								<div class="wpgmza-col wpgmza-text-align-right">
									<input type='text' name='--wpgmza-component-backdrop-filter' class="wpgmza-text-align-right wpgmza-styling-backdrop-filter-input" />
								</div>
							</div>
						</fieldset>

						
					</div>
				</div>

				<div class="action-bar">
					<div class="wpgmza-row">
						<div class="wpgmza-col">
							<select class="wpgmza-styling-preset-select">
								<option value=""><?php _e("Select Preset", "wp-google-maps"); ?></option>
								<option value="default"><?php _e("Default", "wp-google-maps"); ?></option>
								<option value="rounded"><?php _e("Rounded", "wp-google-maps"); ?></option>
								<option value="glass"><?php _e("Glass", "wp-google-maps"); ?></option>
							</select>
						</div>
						<div class="wpgmza-col wpgmza-text-align-right">
							<input class="wpgmza-button wpgmza-button-primary" type="submit" value="<?php _e("Save Styling", "wp-google-maps"); ?>" />
						</div>
					</div>
				</div>
			</form>
		</div>

		<div class="content wpgmza-styling-preview-wrap">
			<div class="preview-demo-browser-view">
				<div class="browser-bar">
					<div class="controls-left">
						<div class="browser-btn"></div>
						<div class="browser-btn"></div>
						<div class="browser-btn"></div>
					</div>

					<div class="controls-center">
						<div class="browser-url"></div>
					</div>

					<div class="controls-right">
						<div class="browser-menu">
							<div class="browser-menu-bar"></div>
							<div class="browser-menu-bar"></div>
							<div class="browser-menu-bar"></div>
						</div>
					</div>
				</div>

				<div class="browser-content">
					<div class="wpgmza_map wpgmza-styling-map-preview" style="position: relative; width: fit-content;">
						<div class="wpgmza-inner-stack top">
							
						</div>

						<div class="wpgmza-inner-stack left">
							<div class="wpgmza-pad-10 wpgmza-style-guide-wrapper">
								<div class="wpgmza-style-guide-step active">
									<strong><?php _e("Welcome to the style editor!", "wp-google-maps"); ?></strong> 
									
									<div class="wpgmza-pad-y-10">
										<?php 
											_e("This is an example of a map component, positioned to the left of the map container.", "wp-google-maps"); 
										?>
									</div>
									<div class="wpgmza-pad-y-10">									
										<?php 
											_e("Components can be positioned at specific anchors within the map, or moved outside the map container if preferred. These positions are managed from within the map editor.", "wp-google-maps"); 
										?>
									</div>
								</div>

								<div class="wpgmza-style-guide-step">
									<strong><?php _e("Styling should be simple!", "wp-google-maps"); ?></strong> 

									<div class="wpgmza-pad-y-10">									
										<?php 
											_e("Styling changes made here will be shared by all maps, to allow for a uniformed styling. Advanced changes are still supported via Custom CSS, if required.", "wp-google-maps");
										?>
									</div>

									<div class="wpgmza-pad-y-10">									
										<?php 
											_e("Components are automatically stacked together in groups based on the alignment you select within the map editor.", "wp-google-maps"); 
										?> 
									</div>
								</div>

								<div class="wpgmza-style-guide-step">
									<strong><?php _e("Interactive Elements", "wp-google-maps"); ?></strong> 

									<div class="wpgmza-pad-y-10">									
										<?php 
											_e("Some components like the Store Locator, Directions Panel (Pro) and Category Filters (Pro), support interactive elements.", "wp-google-maps"); 
										?>
									</div>

									<div class="wpgmza-pad-y-10">									
										<?php
											_e("To support these elements, we provide base styles, which then adapt based on the styling changes made in this area.", "wp-google-maps");
										?>
									</div>
								</div>
								
								<div class="wpgmza-style-guide-step">
									<strong><?php _e("Accent Areas", "wp-google-maps"); ?></strong> 
									<div class="wpgmza-pad-10" style="background: var(--wpgmza-component-color-accent); color: var(--wpgmza-component-text-color-accent); margin: 10px -10px;">
										<?php
											_e("Some sections and elements use accent colors instead of the default component colors.", "wp-google-maps");
										?>
										
										<div class="wpgmza-pad-y-10">
											<input type='text' placeholder="Sample text input...">
										</div>
									</div>


									<div class="wpgmza-pad-y-10">
										<small><input type="checkbox" checked="checked"> Sample checkbox</small>
									</div>

								</div>

								<div class="wpgmza-style-guide-nav">
									<button class='prev-btn'><?php _e("Prev", "wp-google-maps"); ?></button>
									<button class='next-btn'><?php _e("Next", "wp-google-maps"); ?></button>
								</div>
							</div>

							<div class="wpgmza-pad-10 theme-editor-note">
								<div class="wpgmza-row">
									<div class="wpgmza-col-3">
										<img src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/map-theme-hint.png'; ?>" />
									</div>
									<div class="wpgmza-col-9">
										<strong><?php _e("Trying to edit your map theme?", "wp-google-maps"); ?></strong>
										<p>
											<?php _e("You can change the appearance of map tiles from", "wp-google-maps"); ?>:
											<strong><?php _e("Maps > Edit > Settings > Themes > Theme Editor", "wp-google-maps"); ?></strong> 
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
	</div>
</div>