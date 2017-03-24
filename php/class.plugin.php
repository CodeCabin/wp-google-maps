<?php

namespace WPGMZA;

require_once(__DIR__ . '/class.version.php');
require_once(__DIR__ . '/class.settings.php');
require_once(__DIR__ . '/class.statistics.php');
require_once(__DIR__ . '/../lib/smart/class.document.php');

class Plugin
{
	public static $version;
	public static $settings;
	public static $statistics;
	
	//protected $deregisterOtherGoogleMaps = false;	// TODO: Set this flag when the shortcode is called
	// WARNING: deregister script is never called because $posts is never set in wpgmza_check_shortcode. I've left this commented for the time being
	
	public function __construct()
	{
		// Init
		add_action( 'init', array($this, 'init') );
		
		// Admin enqueue script hook
		add_action('admin_enqueue_scripts', array($this, 'adminEnqueueScripts'));
		add_action('admin_head', array($this, 'adminHead'), 19);
		
		// Admin menu hook
		add_action('admin_menu', array($this, 'adminMenu'));
		
		// E-Mail subscribe hooks
		add_action('wp_ajax_wpgmza_subscribe', array($this, 'ajaxSubscribe'));
		add_filter('plugin_row_meta', array($this, 'adminNewsletterSignupRow'), 4, 10);
		
		// Prevent any other sources adding Google Maps script
		foreach(array('wp_enqueue_scripts', 
			'wp_head', 
			'init', 
			'wp_footer', 
			'wp_print_scripts') as $action)
			add_action($action, array($this, 'deregisterScripts'), 999);
			
		// Hooks for AJAX requests
		add_action('wp_ajax_wpgmza_map_fetch', array($this, 'handleAjaxRequest'));
		add_action('wp_ajax_nopriv_wpgmza_map_fetch', array($this, 'handleAjaxRequest'));
	}
	
	/**
	 * Activation hook
	 * @return void
	 */
	public static function activate()
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
		$db_version = get_option('wpgmza_db_version');
		
		if(empty($db_version) || 
			(new Version($db_version))->isLessThan(Plugin::$version) ||
			defined('WPGMZA_FORCE_V7_MIGRATE'))
			Plugin::activate();
		
		// Load settings and statistics
		Plugin::$settings 	= new Settings();
		Plugin::$statistics = new Statistics();
		
		$this->handleFirstTime();
		
		wp_enqueue_script('wpgmza-maps-list', WPGMZA_BASE . 'js/core.js');
	}
	
	/**
	 * Hook for enqueing scripts on the admin backend
	 * @return void
	 */
	public function adminEnqueueScripts($page)
	{
		global $wp_scripts;
		
		wp_enqueue_script('jquery');
		wp_enqueue_script('jquery-ui-core');
		wp_enqueue_script('jquery-ui-slider');
		wp_enqueue_script('jquery-ui-tabs');
		wp_enqueue_script('jquery-ui-progressbar');
		
		wp_enqueue_style('wpgmza_v7_style', WPGMZA_BASE . 'css/wpgmza_style.css');
		wp_enqueue_style('wpgmza_v7_admin_style', WPGMZA_BASE . 'css/wp-google-maps-admin.css');
		
		wp_enqueue_style('wpgmza_v7_admin', WPGMZA_BASE . 'css/v7-style.css');
		
		switch($page)
		{
			case 'maps_page_wp-google-maps-menu-settings':
				wp_enqueue_script('wpgmza_settings_page', WPGMZA_BASE . 'js/settings-page.js', array('jquery-ui-tabs'));
			
			case 'toplevel_page_wp-google-maps-menu':
			case 'maps_page_wp-google-maps-menu-support':
			case 'maps_page_wp-google-maps-menu':
				// FontAwesome
				wp_register_style('fontawesome', WPGMZA_BASE . 'css/font-awesome.min.css');
				wp_enqueue_style('fontawesome');
			
				// Enqueue stylesheets
				wp_enqueue_style('wpgmza_admin_style', WPGMZA_BASE . 'css/wpgmza_style.css', array(), (string)Plugin::$version.'b');
				wp_enqueue_style('wpgmza_admin_datatables_style', WPGMZA_BASE . 'css/data_table.css',array(),(string)Plugin::$version.'b');
				
				// Datatables
				wp_enqueue_script('wpgmza_admin_datatables', WPGMZA_BASE . 'js/jquery.dataTables.min.js', null, (string)Plugin::$version . 'b');
				
				if(!empty($_POST))
					ob_start();
				
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
	
	public function adminHead()
	{
		if(!isset($_GET['page']) || $_GET['page'] != 'wp-google-maps-menu')
			return;
		
		$this->loadGoogleMaps();
	}
	
	public function loadGoogleMaps()
	{
		if(Plugin::$settings->remove_api)
			return;
		
		// Locale
		$locale = get_locale();
		$suffix = '.com';
		
		switch($locale)
		{
			case 'he_IL':
				// Hebrew correction
				$locale = 'iw';
				break;
			
			case 'zh_CN':
				// Chinese integration
				$suffix = '.cn';
				break;
		}
		
		$locale = substr($locale, 0, 2);
		
		// Default params
		$params = array(
			'v' 		=> '3.exp',
			'key'		=> Plugin::$settings->temp_api,
			'language'	=> $locale
		);
		
		// API Version
		if(!empty(Plugin::$settings->api_version))
			$params['v'] = Plugin::$settings->api_version;
		
		// API Key
		if(!empty(Plugin::$settings->google_maps_api_key))
			$params['key'] = Plugin::$settings->google_maps_api_key;
		
		wp_enqueue_script('wpgmza_api_call', '//maps.google' . $suffix . '/maps/api/js?' . http_build_query($params));
	}
	
	/**
	 * Prevent any other Google Maps API script from loading
	 * @return void
	 */
	public function deregisterScripts()
	{
		global $wp_scripts;
		$map_handle = '';
		
		// WARNING: In v6 this function never runs through so I'm going to put this return here to create the same outcome, even though it's not desired
		return;
		
		//if(!$this->deregisterOtherGoogleMaps)
			//return;
		
		if(!isset($wp_scripts->registered) || !is_array($wp_scripts->registered))
			return;
		
		foreach ( $wp_scripts->registered as $script) {             
			if($script->handle == 'wpgmza_api_call')
				continue;
			
			if (strpos($script->src, 'maps.google.com/maps/api/js') !== false || 
				strpos($script->src, 'maps.googleapis.com/maps/api') !== false || 
				strpos($script->src, 'maps.googleapis') !== false || 
				strpos($script->src, 'maps.google') !== false) {
				if (!isset($script->handle) || $script->handle == '') {
					$script->handle = 'remove-this-map-call';
				}
				unset($script->src);
				$map_handle = $script->handle;
				if ($map_handle != '') {
					$wp_scripts->remove( $map_handle );
					$map_handle = '';
					break;
				}
			}
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
	
	/**
	 * Admin menu hook
	 * @return void
	 */
	public function adminMenu()
	{
		$access_level = Plugin::$settings->access_level;
		
		add_menu_page(
			'WP Google Maps', 
			__('Maps', 'wp-google-maps'), 
			$access_level, 
			'wp-google-maps-menu',
			array($this, 'mapsPage'),
			WPGMZA_BASE . 'images/map_app_small.png'
		);
		
		/*
		// NB: I ported this over from the previous version, but it doesn't appear to do anything as the if block expression is never true (at least not in the free version)
		add_submenu_page(
			'wp-google-maps-menu', 
			'WP Google Maps - Advanced Options', 
			__('Advanced','wp-google-maps'), 
			$access_level, 
			'wp-google-maps-menu-advanced', 
			'function'
		);
		*/
		
		add_submenu_page(
			'wp-google-maps-menu', 
			'WP Google Maps - Settings', 
			__('Settings','wp-google-maps'), 
			$access_level, 
			'wp-google-maps-menu-settings', 
			array($this, 'settingsPage')
		);
		
		add_submenu_page(
			'wp-google-maps-menu', 
			'WP Google Maps - Support', 
			__('Support','wp-google-maps'), 
			$access_level, 
			'wp-google-maps-menu-support',
			array($this, 'supportPage')
		);
	}
	
	/**
	 * Echos the support menu page
	 * @return void
	 */
	public function supportPage()
	{
		echo Plugin::evaluateHTMLFile(WPGMZA_DIR . 'html/support-menu.html');
	}
	
	/**
	 * Echos the settings page
	 * @return void
	 */
	public function settingsPage()
	{
		require_once(WPGMZA_DIR . 'php/class.settings-page.php');
		$document = new SettingsPage();
		echo $document->saveHTML($document->querySelector('body>*'));
	}
	
	/**
	 * Echos the maps page
	 * @return void
	 */
	public function mapsPage()
	{
		if(!isset($_GET['action']))
		{
			require_once(WPGMZA_DIR . 'php/class.map-list-page.php');
			$document = new MapListPage();
		}
		else
		{
			require_once(WPGMZA_DIR . 'php/class.map-edit-page.php');
			$document = new MapEditPage();
		}
		echo $document->saveHTML($document->querySelector('body>*'));
	}
	
	/**
	 * Handle AJAX requests from the client
	 * @return void
	 */
	public function handleAjaxRequest()
	{
		$action = ($_GET['action'] | $_POST['action']);
		
		switch($action)
		{
			case 'wpgmza_map_fetch':
				require_once(__DIR__ . '/class.map.php');
				$map = new Map($_GET['map_id']);
				$obj = $map->fetch(
					explode(',',$_GET['bounds']),
					$_GET['sid']
				);
				
				echo json_encode($obj);
				break;
		}
		
		wp_die();
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
	 * Utility function, get pro link
	 * @param array Query string parameters to append to link
	 * @return string
	 */
	public static function getProLink($params)
	{
		return 'https://www.wpgmaps.com/purchase-professional-version/?' . http_build_query($params);
	}
}

Plugin::$version = new Version($WPGMZA_VERSION);

// TODO: Delay this until later. Pro will need to be loaded and subclass this plugin before you create the instance
$wpgmza = new Plugin();

?>