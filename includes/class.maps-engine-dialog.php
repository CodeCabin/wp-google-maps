<?php

namespace WPGMZA;

class MapsEngineDialog
{
	public static function post()
	{
		$settings = get_option('WPGMZA_OTHER_SETTINGS');
		
		$settings['wpgmza_maps_engine'] = $_POST['engine'];
		$settings['wpgmza_maps_engine_dialog_done'] = true;
		
		update_option('WPGMZA_OTHER_SETTINGS', $settings);
		
		wp_send_json(array('success' => 1));
		exit;
	}
	
	public function html()
	{
		?>
		<div id="wpgmza-maps-engine-dialog" style="display: none;">
			<h2>
				<?php
				_e('Choose a maps engine', 'wp-google-maps');
				?>
			</h2>
			
			<div class="wpgmza-inner">
				<div>
					<div>
						<h3>
							<?php
							_e('OpenLayers', 'wp-google-maps');
							?>
						</h3>
						
						<img src="<?php echo plugin_dir_url(__DIR__) . 'images/open-street-map.png'?>"/>
						
						<ul class="wpgmza-pros">
							<li>
								<?php _e('Completely free, no billing', 'wp-google-maps'); ?>
							</li>
							<li>
								<?php _e('Instant setup, no keys required', 'wp-google-maps'); ?>
							</li>
						</ul>
						
						<ul class="wpgmza-cons">
							<li>
								<?php _e('No support for custom map themes', 'wp-google-maps'); ?>
							</li>
							<li>
								<?php _e('No out-of-the-box support for directions', 'wp-google-maps'); ?>
							</li>
						</ul>
					</div>
					
					<p class="wpgmza-centered">
						<button class="button button-primary" data-maps-engine="open-layers">
							<?php
							_e('Use OpenLayers', 'wp-google-maps');
							?>
						</button>
					</p>
				</div>
				
				<div>
					<div>
						<h3>
							<?php
							_e('Google Maps', 'wp-google-maps');
							?>
						</h3>
						
						<img src="<?php echo plugin_dir_url(__DIR__) . 'images/google-maps.png'?>"/>
						
						<ul class="wpgmza-pros">
							<li>
								<?php _e('Supports directions', 'wp-google-maps'); ?>
							</li>
							<li>
								<?php _e('Supports custom map themes', 'wp-google-maps'); ?>
							</li>
						</ul>
						
						<ul class="wpgmza-cons">
							<li>
								<?php _e('Requires billing to be set up *', 'wp-google-maps'); ?>
							</li>
						</ul>
						
						<small>
							<?php _e('* Card details required, $200 each month free, <a href="https://cloud.google.com/maps-platform/pricing/">more info</a>', 'wp-google-maps'); ?>
						</small>
					</div>
					
					<p class="wpgmza-centered">
						<button class="button button-primary" data-maps-engine="google-maps">
							<?php
							_e('Use Google Maps', 'wp-google-maps');
							?>
						</button>
					</p>
				</div>
			</div>
		</div>
		<?php
	}
}

add_action('wp_ajax_wpgmza_maps_engine_dialog_set_engine', array('WPGMZA\\MapsEngineDialog', 'post'));