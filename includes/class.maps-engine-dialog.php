<?php

namespace WPGMZA;

/**
 * This class represents the map engine selection dialog, which is presented to the user on the map edit page.
 */
class MapsEngineDialog
{
	/**
	 * Processes AJAX POST when the user makes a selection
	 * @return void
	 */
	public static function post()
	{
		$settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		$settings['wpgmza_maps_engine'] = $_POST['engine'];
		$settings['wpgmza_maps_engine_dialog_done'] = true;
		
		update_option('WPGMZA_OTHER_SETTINGS', $settings);
		
		wp_send_json(array('success' => 1));
		exit;
	}
	
	/**
	 * Echos the dialog HTML
	 * @return void
	 */
	public function html()
	{
		?>
		<div id="wpgmza-maps-engine-dialog" style="display: none;">
			<h1>
				<?php
				_e('Choose a maps engine', 'wp-google-maps');
				?>
			</h1>
			
			<div class="wpgmza-inner">
				<div>
					<input type="radio" 
						name="wpgmza_maps_engine"
						id="wpgmza_maps_engine_open-layers"
						value="open-layers"
						/>
					<label for="wpgmza_maps_engine_open-layers">
						<div>
							<!--<h3>
								<?php
								_e('OpenLayers', 'wp-google-maps');
								?>
							</h3>-->
							
							<img class="wpgmza-engine-logo" src="<?php echo plugin_dir_url(__DIR__) . 'images/OpenLayers_logo.svg.png'?>"/>
							
							<ul>
								<li>
									<?php _e('No API keys required', 'wp-google-maps'); ?>
								</li>
							</ul>
							
							<ul>
								<li>
									<?php _e('Limited functionality', 'wp-google-maps'); ?>
								</li>
							</ul>
						</div>
						
						<!--<p class="wpgmza-centered">
							<button class="button button-primary" data-maps-engine="open-layers">
								<?php
								_e('Use OpenLayers', 'wp-google-maps');
								?>
								
							</button>
						</p>-->
						
						<p class="wpgmza-mock-radio wpgmza-centered">
							<span class="wpgmza-mock-radio-button"></span>
							<img class="wpgmza-mock-radio-label" 
								src="<?php echo plugin_dir_url(__DIR__); ?>images/openlayers_logo.png"
								/>
						</p>
					</label>
				</div>
				
				<div>
					<input type="radio" 
						name="wpgmza_maps_engine"
						id="wpgmza_maps_engine_google-maps"
						value="google-maps"
						/>
					<label for="wpgmza_maps_engine_google-maps">
						<div>
							<!--<h3>
								<?php
								_e('Google Maps', 'wp-google-maps');
								?>
							</h3>-->
							
							<img class="wpgmza-engine-logo" src="<?php echo plugin_dir_url(__DIR__) . 'images/icons8-google-maps-500.png'?>"/>
							
							<!--<ul class="wpgmza-pros">
								<li>
									<?php _e('Full functionality', 'wp-google-maps'); ?>
								</li>
							</ul>-->
							
							<ul>
								<li>
									<?php _e('API Key required', 'wp-google-maps'); ?>
								</li>
							</ul>
						</div>
					
						<!--<p class="wpgmza-centered">
							<button class="button button-primary" data-maps-engine="google-maps">
								<?php
								_e('Use Google Maps', 'wp-google-maps');
								?>
							</button>
						</p>-->
						
						<p class="wpgmza-mock-radio wpgmza-centered">
							<span class="wpgmza-mock-radio-button"></span>
							<img class="wpgmza-mock-radio-label" 
								src="<?php echo plugin_dir_url(__DIR__); ?>images/Google_maps_logo.png"
								/>
						</p>
					</label>
				</div>
			</div>
			
			<p class="wpgmza-centered">
				<button class="button button-primary" id="wpgmza-confirm-engine" disabled>
					<?php
					_e('Select Engine', 'wp-google-maps');
					?>
				</button>
			</p>
			
			<!--<footer>
				<img src="<?php echo plugin_dir_url(__DIR__); ?>images/WP-google-maps-logo-1-B-transparent.png" 
					alt="<?php _e('WP Google Maps', 'wp-google-maps'); ?>"
					/>
				<img src="<?php echo plugin_dir_url(__DIR__); ?>images/codecabin.png"
					alt="by CODECABIN_"
					/>
			</footer>-->
		</div>
		<?php
	}
}

add_action('wp_ajax_wpgmza_maps_engine_dialog_set_engine', array('WPGMZA\\MapsEngineDialog', 'post'));