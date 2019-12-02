<div id="wpgmza-theme-panel">

	<h3>
		<?php
		_e('Theme Presets', 'wp-google-maps');
		?>
	</h3>

	<div id="wpgmza-theme-presets" class="owl-carousel owl-theme">
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/default.png"
				title="<?php _e('Default', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="0"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='["visibility", "invert_lightness", "color", "weight", "hue", "saturation", "lightness", "gamma"]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/blue.png"
				title="<?php _e('Blue', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="1"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='[{"featureType": "administrative","elementType": "labels.text.fill","stylers": [{"color": "#444444"}]},{"featureType": "landscape","elementType": "all","stylers": [{"color": "#f2f2f2"}]},{"featureType": "poi","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "road","elementType": "all","stylers": [{"saturation": -100},{"lightness": 45}]},{"featureType": "road.highway","elementType": "all","stylers": [{"visibility": "simplified"}]},{"featureType": "road.arterial","elementType": "labels.icon","stylers": [{"visibility": "off"}]},{"featureType": "transit","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "water","elementType": "all","stylers": [{"color": "#46bcec"},{"visibility": "on"}]}]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/apple-maps.png"
				title="<?php _e('Apple Maps', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="2"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='[{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]}]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/grayscale.png"
				title="<?php _e('Grayscale', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="3"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='[{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/pale.png"
				title="<?php _e('Pale', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="4"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='[{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2e5d4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/red.png"
				title="<?php _e('Red', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="5"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='[{"stylers": [ {"hue": "#890000"}, {"visibility": "simplified"}, {"gamma": 0.5}, {"weight": 0.5} ] }, { "elementType": "labels", "stylers": [{"visibility": "off"}] }, { "featureType": "water", "stylers": [{"color": "#890000"}] } ]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/dark-grey.png"
				title="<?php _e('Dark Grey', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="6"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='[{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/monochrome.png"
				title="<?php _e('Monochrome', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="7"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='[{"featureType":"administrative.locality","elementType":"all","stylers":[{"hue":"#2c2e33"},{"saturation":7},{"lightness":19},{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"simplified"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":-2},{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"hue":"#e9ebed"},{"saturation":-90},{"lightness":-8},{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":10},{"lightness":69},{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67},{"visibility":"simplified"}]}]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/old-fashioned.png"
				title="<?php _e('Old Fashioned', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="8"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='[{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
		<label>
			<img
				src="<?php echo WPGMAPS_DIR; ?>/images/night-mode.png"
				title="<?php _e('Night Mode', 'wp-google-maps'); ?>"
				/>
			
			<input 
				type="radio" 
				name="wpgmza_theme" 
				value="9"
				class="wpgmza_theme_radio wpgmza_hide_input"
				data-theme-json='[{"elementType":"geometry","stylers":[{"color":"#242f3e"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#746855"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#242f3e"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#575663"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#263c3f"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#6b9a76"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#38414e"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#212a37"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#9ca5b3"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#746855"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#80823e"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#1f2835"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#f3d19c"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2f3948"}]},{"featureType":"transit.station","elementType":"labels.text.fill","stylers":[{"color":"#d59563"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#17263c"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#1b737a"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#515c6d"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#17263c"}]}]'
				/>
			
			<button type="button" class="button-secondary wpgmza-select-theme-preset">
				<?php
				_e('Select Preset', 'wp-google-maps');
				?>
				&raquo;
			</button>
		</label>
		
	</div>
	
	<h3>
		<?php
		_e('Theme Editor', 'wp-google-maps');
		?>
	</h3>
	
	<fieldset>
		<label>
			<?php
			_e('Customise Theme', 'wp-google-maps');
			?>
		</label>
		
		<button type="button" id="wpgmza-open-theme-editor" class="button-primary">
			<?php
			_e('Open Theme Editor', 'wp-google-maps');
			?>
			&raquo;
		</button>
		
		<div id="wpgmza-theme-editor" class="active">
			<div id="wpgmza-theme-editor__edit">
				<fieldset id="wpgmza-theme-editor__feature">
					<label>
						<?php
						_e('Feature', 'wp-google-maps');
						?>
					</label>
					<select id="wpgmza_theme_editor_feature"></select>
					<span id="wpgmza-theme-editor__toggle"><i class="fa fa-times"></i></span>
				</fieldset>
				
				<div id="wpgmza-theme-editor__feature-settings">
					
					
					<div class="wpgmza-form-group wpgmza-form-group__multiple">
						<div>
							<label>
								<?php
								_e('Visibility', 'wp-google-maps');
								?>
							</label>
							<select id="wpgmza_theme_editor_visibility">
								<option value="inherit">
									<?php
									_e('Inherit', 'wp-google-maps');
									?>
								</option>
								<option value="off">
									<?php
									_e('Off', 'wp-google-maps');
									?>
								</option>
								<option value="simplified">
									<?php
									_e('Simplified', 'wp-google-maps');
									?>
								</option>
								<option value="on">
									<?php
									_e('On', 'wp-google-maps');
									?>
								</option>
							</select>
						</div>
						
						<div>
							<label>
								<?php
								_e('Label', 'wp-google-maps');
								?>
							</label>
							<select id="wpgmza_theme_editor_element"></select>
						</div>
						<div>
							<label>
								<?php
								_e('Weight', 'wp-google-maps');
								?>
							</label>
							<input type="number" step="any" id="wpgmza_theme_editor_weight"/>
						</div>

					</div>
					
					<div class="wpgmza-form-group wpgmza-form-group__multiple">
						<div>
							<label>
								<?php
								_e('Gamma', 'wp-google-maps');
								?>
							</label>
							<input type="number" step="0.01" id="wpgmza_theme_editor_gamma"/>
						</div>
						
						<div>
							<label>
								<?php
								_e('Saturation', 'wp-google-maps');
								?>
							</label>
							<input type="number" id="wpgmza_theme_editor_saturation"/>
						</div>
						
						<div>
							<label>
								<?php
								_e('Lightness', 'wp-google-maps');
								?>
							</label>
							<input type="number" id="wpgmza_theme_editor_lightness"/>
						</div>
					</div>

					<div class="wpgmza-form-group wpgmza-form-group__multiple">
						
						<div>
							<label>
								<?php
								_e('Color', 'wp-google-maps');
								?>
							</label>
							<div>
								<input type="checkbox" id="wpgmza_theme_editor_do_color" value="on"/>
								<input type="color" id="wpgmza_theme_editor_color"/>
							</div>
						</div>
						
						<div>
							<label>
								<?php
								_e('Hue', 'wp-google-maps');
								?>
							</label>
							<div>
								<input type="checkbox" id="wpgmza_theme_editor_do_hue" value="on"/>
								<input type="color" id="wpgmza_theme_editor_hue"/>
							</div>
						</div>
						<div id="wpgmza-theme-editor__invert-lightness">
							<label>
								<?php
								_e('Invert Lightness', 'wp-google-maps');
								?>
							</label>
							<div>
								<input type="checkbox" id="wpgmza_theme_editor_do_invert_lightness"/>
							</div>
						</div>
					</div>
					
						
					
				</div>

			</div>
		</div>
	</fieldset>
	
	<h3>
		<?php
		_e('Advanced', 'wp-google-maps');
		?>
	</h3>
	
	<fieldset>
		<label>
			<?php
			_e('Theme Data', 'wp-google-maps');
			?>
		</label>
		<textarea name="wpgmza_theme_data"></textarea>
	</fieldset>
</div>