<?php

namespace WPGMZA;

class LegacyCloudAPIKeyHandler
{
	private $salt = 'un?#Ydc5QTDp)3IGe7#C)!h/R.JqRPE)WZk.COyDzB)X6xhiqMZ3Z:bbw+g2vUCF';

	private $hashes = array(
		'4b32fc6c0456f316db5e7979432d06141a7eadce',
		'8377e614b95c0e5617d2cd9aa4d2891f8268f579',
		'8e81da49e634d3265e853de17c796d0b2cd56d96',
		'f6fbff2182c0c413ba07e504bc0ca060a25303a8'
	);
	
	public function __construct()
	{
		global $wpgmza;
		
		if(empty($wpgmza->settings->wpgmza_google_maps_api_key))
			return;
		
		$hash = hash('SHA1', $this->salt . $wpgmza->settings->wpgmza_google_maps_api_key);
		
		if(array_search($hash, $this->hashes) !== false)
			add_action('admin_notices', array($this, 'onAdminNotices'));
	}
	
	public function onAdminNotices()
	{
		?>
		<div class="notice notice-error">
			<p>
				<strong>
					<?php
					_e("WP Google Maps:", "wp-google-maps");
					?>
				</strong>
				<?php
				_e("You are using an out-of-date Cloud API key and as such you may experience issues with plugin functionality. Please <a href='https://wpgmaps.com/contact-us' target='_BLANK'>open a ticket</a> through our support desk, or <a href='mailto:nick@wpgmaps.com' target='_BLANK'>e-mail us</a> to receive an updated key", "wp-google-maps");
				?>
			</p>
		</div>
		<?php
	}
}
