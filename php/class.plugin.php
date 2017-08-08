<?php

namespace WPGMZA;

require_once(__DIR__ . '/class.version.php');
require_once(__DIR__ . '/class.settings.php');
require_once(__DIR__ . '/class.statistics.php');
require_once(__DIR__ . '/class.map.php');
require_once(__DIR__ . '/../lib/smart/class.document.php');
require_once(__DIR__ . '/class.widget.php');

use Smart;

class Plugin
{
	public static $version;
	public static $settings;
	public static $statistics;
	
	public function __construct()
	{
		// Init
		add_action( 'init', array($this, 'init') );
		
		// Admin enqueue script hook
		if(
			(isset($_GET['page']) && preg_match('/^wp-google-maps/', $_GET['page']))
			||
			preg_match('/plugins\.php/', $_SERVER['REQUEST_URI'])
			)
			add_action('admin_enqueue_scripts', array($this, 'adminEnqueueScripts'));
		
		// Admin menu hook
		add_action('admin_menu', array($this, 'adminMenu'));
		
		// E-Mail subscribe hooks
		add_action('wp_ajax_wpgmza_subscribe', array($this, 'ajaxSubscribe'));
		add_filter('plugin_row_meta', array($this, 'adminNewsletterSignupRow'), 4, 10);
			
		// Hooks for AJAX requests
		add_action('wp_ajax_wpgmza_map_fetch', array($this, 'handleAjaxRequest'));
		add_action('wp_ajax_nopriv_wpgmza_map_fetch', array($this, 'handleAjaxRequest'));
		add_action('wp_ajax_wpgmza_list_markers', array($this, 'handleAjaxRequest'));
		add_action('wp_ajax_wpgmza_query_nominatim_cache', array($this, 'handleAjaxRequest'));
		
		// Shortcode hook
		add_shortcode('wpgmza', array($this, 'handleShortcode'));
	}
	
	/**
	 * Installs the plugin
	 * @return void
	 */
	public static function install()
	{
		require_once(__DIR__ . '/class.installer.php');
		$installer = new Installer();
		$installer->run();
	}
	
	/**
	 * Init function fired by WP init hook
	 * @return void
	 */
	public function init()
	{
		if(Plugin::isMigrationRequired())
			return;	// Hold off installing etc. and let the user go through the migration wizard
		
		$db_version = get_option('wpgmza_db_version');
		if(!empty($db_version))
			$db_version = new Version($db_version);
		
		if(empty($db_version) || defined('WPGMZA_FORCE_V7_INSTALL'))
			Plugin::install();
		
		// Load settings and statistics
		Plugin::$settings 	= new Settings();
		
		Plugin::$settings->is_admin = is_admin();
		Plugin::$settings->url_base = WPGMZA_BASE;
		Plugin::$settings->default_marker_icon = WPGMZA_BASE . 'images/marker.png';
		
		Plugin::$statistics = new Statistics();
		
		$this->handleFirstTime();
		$this->loadJQuery();
		
		wp_enqueue_script('wpgmza-jquery-cookie', WPGMZA_BASE .'lib/jquery-cookie.js');
		
		wp_enqueue_script('wpgmza-core', WPGMZA_BASE . 'js/core.js', array('jquery'));
		wp_enqueue_script('wpgmza-friendly-error', WPGMZA_BASE . 'js/friendly-error.js', array('wpgmza-core'));
		
		// Localize data
		$data = $this->getLocalizedData();
		wp_localize_script('wpgmza-core', 'WPGMZA_global_settings', $data);
		
		// Load scripts if "always load scripts" is on
		if(!empty(Plugin::$settings->always_load_scripts))
		{
			if($this->isProVersion())
			{
				require_once(WPGMZA_PRO_DIR . 'php/class.pro-map.php');
				ProMap::enqueueScripts();
				
				switch(Plugin::$settings->engine)
				{
					case 'google-maps':
						require_once(WPGMZA_PRO_DIR . 'php/google-maps/class.google-pro-maps-loader.php');
						$loader = new GoogleProMapsLoader();
						break;
						
					default:
						require_once(WPGMZA_PRO_DIR . 'php/open-street-map/class.osm-pro-loader.php');
						$loader = new OSMProLoader();
						break;
				}
			}
			else
			{
				Map::enqueueScripts();
				
				switch(Plugin::$settings->engine)
				{
					case 'google-maps':
						require_once(WPGMZA_PRO_DIR . 'php/google-maps/class.google-maps-loader.php');
						$loader = new GoogleMapsLoader();
						break;
					default:
						require_once(WPGMZA_PRO_DIR . 'php/open-street-map/class.osm-loader.php');
						$loader = new OSMLoader();
						break;
				}
			}
			
			$loader->enqueueScripts();
		}
	}

	/**
	 * Localizes settings and strings for translation and passing settings to JS
	 * @return object
	 */
	protected function getLocalizedData()
	{
		$data = clone Plugin::$settings;
			
		$data->ajaxurl 					= admin_url('admin-ajax.php');
		$data->fast_ajaxurl				= WPGMZA_BASE . 'php/ajax.fetch.php';
		$data->is_pro_version			= $this->isProVersion();

		$data->localized_strings = array(
			'miles'					=> __('Miles', 'wp-google-maps'),
			'kilometers'			=> __('Kilometers', 'wp-google-maps'),
			
			'unsecure_geolocation' 	=> __('Many browsers are no longer allowing geolocation from unsecured origins. You will need to secure your site with an SSL certificate (HTTPS) or this feature may not work for your visitors', 'wp-google-maps'),
			
			'friendly_error' 		=> __('We\'re sorry, a technical fault has occured. Technical details are below. Please <a href="https://www.wpgmaps.com/support/">visit our support page</a> for help.', 'wp-google-maps'),
			
			'geocode_failed' 		=> __('We couldn\'t find that address, please try again', 'wp-google-maps'),
			'no_address_entered'	=> __('Please enter an address', 'wp-google-maps')
		);
		
		return $data;
	}
	
	/**
	 * Hook for enqueing scripts on the admin backend
	 * @return void
	 */
	public function adminEnqueueScripts($page)
	{
		global $wp_scripts;
		
		wp_enqueue_script('jquery');
		
		wp_enqueue_style('wpgmza_v7_legacy_style', WPGMZA_BASE . 'css/wpgmza_style.css');
		wp_enqueue_style('wpgmza_v7_legacy_admin_style', WPGMZA_BASE . 'css/wp-google-maps-admin.css');
		
		// TODO: Might not be the best place for this... wrap this in the same place as the code to force redirect to migrate page (eg before any WPGM pages are displayed)
		if(!empty($_POST))
			ob_start();
		
		switch($page)
		{
			case 'maps_page_wp-google-maps-menu-settings':
				wp_enqueue_script('wpgmza_settings_page', WPGMZA_BASE . 'js/settings-page.js', array('jquery-ui-tabs'));
			
			case 'plugins.php':
				// Subscribe to newsletter scripts
				wp_register_script( 'wpgmza_newsletter_js', WPGMZA_BASE.'js/newsletter-signup.js', array( 'jquery-ui-core' ) );
				wp_enqueue_script( 'wpgmza_newsletter_js' );
				wp_localize_script( 'wpgmza_newsletter_js', 'wpgmza_sub_nonce', wp_create_nonce("wpgmza_subscribe") );
			
				// Admin plugins page links hooks
				add_filter(
					'network_admin_plugin_action_links_wp-google-maps-v7/wp-google-maps.php',
					array($this, 'adminActionLinks')
				);
				add_filter(
					'plugin_action_links_wp-google-maps-v7/wp-google-maps.php',
					array($this, 'adminActionLinks')
				);
				
				break;
		}
	}
	
	/**
	 * Update first time settings in DB and redirect user to welcome page if necessary
	 * @return void
	 */
	protected function handleFirstTime()
	{
		// Show user welcome page if we need to
		if(!isset($_GET['page']) || $_GET['page'] != 'wp-google-maps-menu')
			return;	
		
		/* check if their using APC object cache, if yes, do nothing with the welcome page as it causes issues when caching the DB options */
		if (class_exists("APC_Object_Cache"))
			return; /* do nothing here as this caches the "first time" option and the welcome page just loads over and over again. quite annoying really... */
		
		$first_time = get_option("WPGMZA_FIRST_TIME");
		
		if(!empty($_GET['override']) || $first_time != (string)Plugin::$version)
			update_option("WPGMZA_FIRST_TIME", (string)Plugin::$version);
		
		if(empty($first_time))
		{
			// Show welcome screen
			wp_redirect(get_option('siteurl') . "/wp-admin/admin.php?page=wp-google-maps-menu&action=welcome_page");
			exit;
		}
	}
	
	/**
	 * If the override jQuery setting is checked, and not on admin page, force jQuery 1.11.13
	 * @return void
	 */
	public function loadJQuery()
	{
		if(is_admin() || empty(Plugin::$settings->force_jquery))
			return;
		
		wp_deregister_script('jquery');
		wp_register_script('jquery', '//code.jquery.com/jquery-1.11.3.min.js', false, "1.11.3");
	}
	
	/**
	 * Function adds links to the plugin admin panel
	 * @param {Array} HTML strings for links
	 * @return array
	 */
	public function adminActionLinks($links)
	{
		array_unshift( $links,
        '<a class="edit" href="' . admin_url('admin.php?page=wp-google-maps-menu') . '">' . __( 'Map Editor', 'wp-google-maps' ) . '</a>' );
		array_unshift( $links,
			'<a class="edit" href="' . admin_url('admin.php?page=wp-google-maps-menu-settings') . '">' . __( 'Settings', 'wp-google-maps' ) . '</a>' );
			
		$pro_link = Plugin::getProLink(array(
			'utm_source'	=> 'plugin',
			'urm_medium'	=> 'link',
			'utm_campaign'	=> 'plugin_link_upgrade'
		));
		array_unshift( $links,
			'<a target="_BLANK" href="'.urlencode($pro_link).'">' . 
			__( 'Get Pro Version', 'wp-google-maps' ) . 
			'</a>' 
		);
			
		return $links;
	}
	
	/**
	 * Adds the email subscription field below the plugin row on the plugins page
	 * @return array
	 */
	public function adminNewsletterSignupRow($links, $file)
	{	
		if(!preg_match('/wp-google-maps.php$/', $file))
			return $links;	
		
		if(get_user_meta(get_current_user_id(),"wpgmza_subscribed"))
			return $links;
		
		$html = Plugin::evaluateHTMLFile(WPGMZA_DIR . 'html/newsletter-signup.html');
		
		array_push($links, $html);
		
		return $links;
	}
	
	/**
	 * Hook for when user subscribes
	 * @return void
	 */
	public function ajaxSubscribe()
	{
		$check = check_ajax_referer( 'wpgmza_subscribe', 'security' );
		if ( $check == 1 ) {
			if ( $_POST['action'] == 'wpgmza_subscribe' ) {
				$uid = get_current_user_id();
				update_user_meta( $uid, 'wpgmza_subscribed', true);
			}
		}
	}
	
	protected function getAdminSubMenuItems()
	{
		$access_level = Plugin::getAccessLevel();
		
		return array(
			array(
				'wp-google-maps-menu', 
				'WP Google Maps - Settings', 
				__('Settings','wp-google-maps'), 
				$access_level, 
				'wp-google-maps-menu-settings', 
				array($this, 'showAdminPage')
			),
			
			array(
				'wp-google-maps-menu', 
				'WP Google Maps - Support', 
				__('Support','wp-google-maps'), 
				$access_level, 
				'wp-google-maps-menu-support',
				array($this, 'showAdminPage')
			)
		);
	}
	
	/**
	 * Called when user is on any WPGM admin page, echos the relevant page, or forces the migration page if required
	 * @return void
	 */
	public function showAdminPage()
	{
		$m = null;
		
		if($_GET['page'] != 'wp-google-maps-menu' && !preg_match('/^wp-google-maps-menu-(.+)$/', $_GET['page'], $m))
			return;
		
		$page = ($_GET['page'] == 'wp-google-maps-menu' ? 'default' : $m[1]);
		
		if(Plugin::isMigrationRequired())
		{
			require_once(WPGMZA_DIR . 'php/class.migration-wizard.php');
			$document = new MigrationWizard();
		}
		else
		{
			$document = new Smart\Document();
			
			if($this->isProVersion() && isset($_GET['action']) && $_GET['action'] == 'wizard')
			{
				require_once(WPGMZA_PRO_DIR . 'php/class.wizard.php');
				$document = new Wizard();
			}
			else
				switch($page)
				{
					case 'settings':
						if(!$this->isProVersion())
						{
							require_once(WPGMZA_DIR . 'php/class.settings-page.php');
							$document = new SettingsPage();
						}
						else
						{
							require_once(WPGMZA_PRO_DIR . 'php/class.pro-settings-page.php');
							$document = new ProSettingsPage();
						}
						break;
					
					case 'support':
						$document->loadPHPFile(WPGMZA_DIR . 'html/support-menu.html');
						break;
						
					default:
						$document = $this->getMapsPage();
						break;
				}
		}
		
		if($this->isProVersion())
			foreach($document->querySelectorAll('.wpgmza-free-version-only') as $node)
				$node->remove();
		else
			foreach($document->querySelectorAll('.wpgmza-pro-version-only') as $node)
				$node->remove();
		
		$engine = (empty(Plugin::$settings->engine) ? 'open-street-map' : Plugin::$settings->engine);
		foreach($document->querySelectorAll("[class*='wpgmza-engine-']") as $element)
		{
			if(preg_match('/wpgmza-engine(-not)?-(google-maps|open-street-map)/', $element->getAttribute('class'), $m))
			{
				$not = !empty($m[1]);
				$match = $m[2];
				
				if(($engine == $match) == $not)
					$element->remove();
			}
		}
		
		echo $document->saveInnerBody();
	}
	
	/**
	 * Admin menu hook
	 * @return void
	 */
	public function adminMenu()
	{
		add_menu_page(
			'WP Google Maps', 
			__('Maps', 'wp-google-maps'), 
			Plugin::getAccessLevel(),
			'wp-google-maps-menu',
			array($this, 'showAdminPage'),
			WPGMZA_BASE . 'images/map_app_small.png'
		);
		
		$items = $this->getAdminSubMenuItems();
		
		foreach($items as $arr)
			call_user_func_array('add_submenu_page', $arr);
	}
	
	/**
	 * Echos the maps page
	 * @return void
	 */
	public function getMapsPage()
	{
		$action = (isset($_GET['action']) ? $_GET['action'] : null);
		
		switch($action)
		{
			case 'welcome_page':
				require_once(WPGMZA_DIR . 'php/class.welcome-page.php');
				$document = new WelcomePage();
				break;
				
			case 'credits':
				$document = new Smart\Document();
				$document->loadPHPFile(WPGMZA_DIR . 'html/credits.html');
				break;
				
			case 'edit':
				if($this->isProVersion())
				{
					require_once(WPGMZA_PRO_DIR . 'php/class.pro-map-edit-page.php');
					$document = new ProMapEditPage();
				}
				else
				{
					require_once(WPGMZA_DIR . 'php/class.map-edit-page.php');
					$document = new MapEditPage();
				}
				break;
			
			default:
				if($this->isProVersion())
				{
					require_once(WPGMZA_PRO_DIR . 'php/class.pro-map-list-page.php');
					$document = new ProMapListPage();
				}
				else
				{
					require_once(WPGMZA_DIR . 'php/class.map-list-page.php');
					$document = new MapListPage();
				}
				break;
		}

		return $document;
	}
	
	/**
	 * Handle AJAX requests from the client
	 * @return void
	 */
	public function handleAjaxRequest()
	{
		require_once(WPGMZA_DIR . 'lib/smart/class.ajax-response.php');
		
		if(isset($_GET['action']))
			$action = $_GET['action'];
		else if(isset($_POST['action']))
			$action = $_POST['action'];
		else
			throw new \Exception('No action specified');
		
		switch($action)
		{
			case 'wpgmza_map_fetch':
				require_once(__DIR__ . '/class.map.php');
				
				$id = $_GET['map_id'];
				
				$atts = (isset($_GET['shortcodeAttributes']) ? $_GET['shortcodeAttributes'] : array());
				if(isset($atts['parent_id']))
					$id = $atts['parent_id'];
				
				$map = $this->createMapInstance($_GET['map_id']);
				
				$obj = $map->fetch(
					explode(',',$_GET['bounds']),
					$_GET['sid'],
					$atts
				);
				
				$obj = apply_filters('wpgmza_fetch_output_filter', $obj);
				
				$response = new \Smart\AjaxResponse(\Smart\AjaxResponse::JSON);
				$response->send($obj);
				break;
				
			case 'wpgmza_list_markers':
				require_once(__DIR__ . '/class.map.php');
				
				$map = $this->createMapInstance($_POST['map_id']);
				
				$obj = $map->tables->marker->handleAjaxRequest($_POST);
				
				$response = new \Smart\AjaxResponse(\Smart\AjaxResponse::JSON);
				$response->send($obj);
				break;
				
			case 'wpgmza_query_nominatim_cache':
				require_once(__DIR__ . '/open-street-map/class.nominatim-geocode-cache.php');
				
				header('Content-type: application/json');
				$cache = new NominatimGeocodeCache();
				
				if(!empty($_POST))
					$cache->set($_POST['query'], stripslashes($_POST['response']));
				else
				{
					$response = $cache->get($_GET['query']);

					if(!$response)
						echo '[]';
					else
						echo $response;
				}
				
				exit;
				break;
		}
		
		exit;
	}
	
	/**
	 * Get usage tracking data
	 * @return array
	 */
	protected static function getUsageTrackingData()
	{
		global $wpdb;
		global $WPGMZA_TABLE_NAME_MAPS;
		global $WPGMZA_TABLE_NAME_MARKERS;
		global $WPGMZA_TABLE_NAME_POLYGONS;
		global $WPGMZA_TABLE_NAME_POLYLINES;
		
		$theme = wp_get_theme();
		
		$global_settings = array();
		foreach(Plugin::$settings as $key => $value)
			$global_settings[$key] = $value;
		
		$maps = $wpdb->get_results("SELECT * FROM $WPGMZA_TABLE_NAME_MAPS", ARRAY_A);
		foreach($maps as &$map)
		{
			$id = $map['id'];
			
			$map['marker_count']		= $wpdb->get_var("SELECT COUNT(*) FROM $WPGMZA_TABLE_NAME_MARKERS WHERE map_id=$id");
			$map['polygon_count']		= $wpdb->get_var("SELECT COUNT(*) FROM $WPGMZA_TABLE_NAME_POLYGONS WHERE map_id=$id");
			$map['polyline_count']	= $wpdb->get_var("SELECT COUNT(*) FROM $WPGMZA_TABLE_NAME_POLYLINES WHERE map_id=$id");
		}
		
		$data = array(
			// Maps
			'maps'					=> $maps,
			'map_count'				=> $wpdb->get_var("SELECT COUNT(*) FROM $WPGMZA_TABLE_NAME_MAPS"),
			'total_markers'			=> $wpdb->get_var("SELECT COUNT(*) FROM $WPGMZA_TABLE_NAME_MARKERS"),
			
			// WP
			'wp_version'			=> get_bloginfo("version"),
			'basic_version'			=> (string)Plugin::$version,
			'pro_version'			=> 'unknown',
			'global_settings'		=> $global_settings,
			'current_theme_name'	=> ($theme ? $theme->get('Name') : 'unknown'),
			'current_theme_version'	=> ($theme ? $theme->get('Version') : 'unknown'),
			
			// System (set below)
			'phpversion'			=> 'unknown',
			'allocated_memory'		=> 'unknown',
			'wp_debug'				=> 'unknown',
			'locale'				=> 'unknown'
		);
		
		unset($data['global_settings']['google_maps_api_key']);
		
		if(function_exists('phpversion'))
			$data['php_version'] = phpversion();
		
		if(defined('WP_MEMORY_LIMIT'))
			$data['allocated_memory'] = WP_MEMORY_LIMIT;
		
		if(defined('WP_DEBUG'))
			$data['wp_debug'] = WP_DEBUG;
		
		if(function_exists('get_locale'))
			$data['locale'] = get_locale();
		
		return (object)$data;
	}
	
	/**
	 * Send usage tracking data, if the user has that setting enabled
	 * @return void
	 */
	public static function trackUsage()
	{
		if(empty(Plugin::$settings->enable_usage_tracking))
			return;
		
		if(!function_exists('curl_version'))
			return;
		
		$data = (array)Plugin::getUsageTrackingData();
		
		$json = json_encode($data);
		$params = array(
			'usage_data' => $json
		);
		$payload = http_build_query($params);
	
		$request_url = "http://ccplugins.co/usage-tracking/record_comprehensive-v7.php";

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $request_url);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
		curl_setopt($ch, CURLOPT_REFERER, $_SERVER['HTTP_HOST']);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		
		$output = curl_exec($ch);
		
		curl_close($ch);
	}
	
	/**
	 * Request a discount coupon for Sola Plugins
	 * @return void
	 */
	public function requestCoupon()
	{
		$email = wp_get_current_user()->user_email;
		
		if(!function_exists('curl_version'))
		{
			$body = "Usage tracking has been enabled by $email";
			wp_mail('nick@wpgmaps.com', 'Coupon Code Request', $body);
			return;
		}
		
		$request_url = "http://ccplugins.co/usage-tracking/coupons.php";
		
		$data = array(
			'action'	=> 'request_coupon',
			'email'		=> $email,
			'status'	=> true
		);
		
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $request_url);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_REFERER, $_SERVER['HTTP_HOST']);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		
		$output = curl_exec($ch);                            
		curl_close($ch);
	}
	
	/**
	 * Creates a map instance
	 * @return void
	 */
	public function createMapInstance($id, $shortcode_atts=null)
	{
		switch(Plugin::$settings->engine)
		{
			case 'google-maps':
				require_once(WPGMZA_DIR . 'php/google-maps/class.google-map.php');
			
				if($this->isProVersion())
				{
					require_once(WPGMZA_PRO_DIR . 'php/google-maps/class.google-pro-map.php');
					return new GoogleProMap($id, $shortcode_atts);
				}
				
				return new GoogleMap($id, $shortcode_atts);
				break;
				
			default:
				require_once(WPGMZA_DIR . 'php/open-street-map/class.osm-map.php');
				
				if($this->isProVersion())
				{
					require_once(WPGMZA_PRO_DIR . 'php/open-street-map/class.osm-pro-map.php');
					return new OSMProMap($id, $shortcode_atts);
				}
				
				return new OSMMap($id, $shortcode_atts);
				break;
		}
	}
	
	/**
	 * Handle shortcode
	 * @return void
	 */
	public function handleShortcode($atts)
	{
		if(!isset($atts['id']))
			return "<div class='error'>" . __('No map ID specified', 'wp-google-maps') . "</div>";
		
		try{
			$map = $this->createMapInstance($atts['id'], $atts);
		}catch(\Exception $e) {
			return "<div class='error'>" . __($e->getMessage(), 'wp-google-maps') . "</div>";
		}
		
		return $map->saveInnerBody();
	}
	
	/**
	 * Utility function, returns TRUE if the plugin is pro version
	 * @return boolean
	 */
	public function isProVersion()
	{
		return false;
	}
	
	/**
	 * Utility function, load specified file and evaluate inline PHP. Useful for separating HTML from logic, eg to use translation/nationalization functions.
	 * DO NOT pass files to this function that may have been uploaded by an untrusted source. If you need to, make sure it has been sanitized by BOTH PHP AND HTMLPurifier or similar to prevent injection or XSS attacks
	 * @return string
	 */
	public static function evaluateHTMLFile($path)
	{
		ob_start();
		include $path;
		return ob_get_clean();
	}
	
	/**
	 * Returns true if the database needs to be migrated
	 * @return boolean
	 */
	public static function isMigrationRequired()
	{
		if(defined('WPGMZA_FORCE_V7_INSTALL') && WPGMZA_FORCE_V7_INSTALL)
			return true;
		
		$current_db_version = get_option('wpgmza_db_version');
		
		if(!$current_db_version)
			return false;	// WPGMZA not installed
		
		$current_db_version = new Version($current_db_version);
		
		return $current_db_version->major < Plugin::$version->major;
	}
	
	/**
	 * Gets access level
	 * @return string
	 */
	public static function getAccessLevel()
	{
		return (isset(Plugin::$settings->access_level) ? Plugin::$settings->access_level : 'manage_options');
	}
	
	/**
	 * Utility function, get pro link
	 * @param array Query string parameters to append to link
	 * @return string
	 */
	public static function getProLink($params)
	{
		return 'https://www.wpgmaps.com/purchase-professional-version/?' . preg_replace('/&/', '&amp;', http_build_query($params));
	}
}

Plugin::$version = new Version($WPGMZA_VERSION);

?>