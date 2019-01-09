<?php

namespace WPGMZA;

/**
 * This class represents the plugin itself. Broadly, this module handles practically all interaction with the platform (WP), loading assets as needed, and hooking into the platforms interface to provide menus etc.
 *
 * It also provides a number of helpful utility functions.
 * @property-read string $spatialFunctionPrefix MySQL versions 8 and above prefix all spatial functions with ST_, previous versions do not. This property will be ST_ where necessary, and an empty string where not. You should use this with all DB calls that make use of spaital functions.
 * @property-read string $gdprCompliance An instance of the GDPRCompliance class.
 */
class Plugin
{
	const PAGE_MAP_LIST			= "map-list";
	const PAGE_MAP_EDIT			= "map-edit";
	const PAGE_SETTINGS			= "map-settings";
	const PAGE_SUPPORT			= "map-support";
	
	const PAGE_CATEGORIES		= "categories";
	const PAGE_ADVANCED			= "advanced";
	const PAGE_CUSTOM_FIELDS	= "custom-fields";
	
	private static $enqueueScriptActions = array(
		'wp_enqueue_scripts',
		'admin_enqueue_scripts',
		'enqueue_block_assets'
	);
	public static $enqueueScriptsFired = false;
	
	/** 
	 * @var array The plugins global settings. Please note this will be dropped and handed over to the GlobalSettings module in 7.11.00. This should not effect interaction with this property - you can continue to access this as an array safely.
	 * @deprecated Will be read-only and an instance of GLobalSettings as of 7.11.00
	 */
	public $settings;
	
	/**
	 * @var ScriptLoader An instance of ScriptLoader, used internally.
	 */
	protected $scriptLoader;
	
	/**
	 * @var RestAPI An instance of RestAPI, used internally.
	 */
	protected $restAPI;
	
	private $mysqlVersion = null;
	private $cachedVersion = null;
	private $legacySettings;
	
	/**
	 * Constructor. Called when plugins_loaded fires.
	 */
	public function __construct()
	{
		global $wpdb;
		
		add_filter('load_textdomain_mofile', array($this, 'onLoadTextDomainMOFile'), 10, 2);
		
		$this->mysqlVersion = $wpdb->get_var('SELECT VERSION()');
		
		$this->legacySettings = get_option('WPGMZA_OTHER_SETTINGS');
		if(!$this->legacySettings)
			$this->legacySettings = array();
		
		$settings = $this->getDefaultSettings();
		
		// $temp = GlobalSettings::createInstance();
		
		// Legacy compatibility
		global $wpgmza_pro_version;
		
		// TODO: This should be in default settings, this code is duplicaetd
		if(!empty($wpgmza_pro_version) && version_compare(trim($wpgmza_pro_version), '7.10.00', '<'))
		{
			$self = $this;
			
			$settings['wpgmza_maps_engine'] = $settings['engine'] = 'google-maps';
			
			add_filter('wpgooglemaps_filter_map_div_output', function($output) use ($self) {
				
				$loader = new GoogleMapsAPILoader();
				$loader->registerGoogleMaps();
				$loader->enqueueGoogleMaps();
				
				$self->loadScripts();
				
				return $output;
				
			});
		}
		
		$this->settings = (object)array_merge($this->legacySettings, $settings);
		
		$this->restAPI = new RestAPI();
		$this->gutenbergIntegration = Integration\Gutenberg::createInstance();
		
		if(!empty($this->settings->wpgmza_maps_engine))
			$this->settings->engine = $this->settings->wpgmza_maps_engine;
		
		if(!empty($_COOKIE['wpgmza-developer-mode']))
			$this->settings->developer_mode = true;
		
		foreach(Plugin::$enqueueScriptActions as $action)
		{
			add_action($action, function() use ($action) {
				Plugin::$enqueueScriptsFired = true;
			}, 1);
		}
			
		if($this->settings->engine == 'open-layers')
			require_once(plugin_dir_path(__FILE__) . 'open-layers/class.nominatim-geocode-cache.php');
	}
	
	/**
	 * Getter, see property-read above.
	 */
	public function __get($name)
	{
		switch($name)
		{
			case "spatialFunctionPrefix":
				$result = '';
				
				if(!empty($this->mysqlVersion) && preg_match('/^\d+/', $this->mysqlVersion, $majorVersion) && (int)$majorVersion[0] >= 8)
					$result = 'ST_';
				
				return $result;
				break;
				
			case "gdprCompliance":
				// Temporary shim
				global $wpgmzaGDPRCompliance;
				return $wpgmzaGDPRCompliance;
				break;
		}
		
		return $this->{$name};
	}
	
	/**
	 * This function will cause the plugin scripts to be loaded. Firstly it will initialize an instance of ScriptLoader. If the developer mode setting is enabled, the scripts will be rebuilt.
	 *
	 * If any of the enqueue scripts, admin enqueue scripts or enqueue block assets (Gutenberg) actions have already fired, this function will immediately ask the script loader to enqueue the plugins scripts and styles.
	 *
	 * If none of those actions have fired yet, this function will bind to all three and enqueue the scripts at the correct time.
	 * @return void
	 */
	public function loadScripts()
	{
		if(!$this->scriptLoader)
			$this->scriptLoader = new ScriptLoader($this->isProVersion());
		
		if(!empty($this->settings->developer_mode))
			$this->scriptLoader->build();
		
		if(Plugin::$enqueueScriptsFired)
		{
			$this->scriptLoader->enqueueScripts();
			$this->scriptLoader->enqueueStyles();
		}
		else
		{
			foreach(Plugin::$enqueueScriptActions as $action)
			{
				add_action($action, function() {
					$this->scriptLoader->enqueueScripts();
					$this->scriptLoader->enqueueStyles();
				});
			}
		}
	}
	
	/**
	 * Gets the default settings, passed through the wpgmza_plugin_get_default_settings filter.
	 * @return array An array of key value pairs with the default plugin settings.
	 */
	public function getDefaultSettings()
	{
		$defaultEngine = 'google-maps';
		
		return apply_filters('wpgmza_plugin_get_default_settings', array(
			'engine' 				=> $defaultEngine,
			'google_maps_api_key'	=> get_option('wpgmza_google_maps_api_key'),
			'default_marker_icon'	=> "//maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png",
			'developer_mode'		=> !empty($this->legacySettings['developer_mode'])
		));
	}
	
	/**
	 * Gets the plugins localized data, that is, the data to be initialized as globals client side (for JavaScript). These variables will be made available as JavaScript globals, through wp_localize_script.
	 *
	 * This array is passed through the filter wpgmza_plugin_get_localized_data.
	 * @return array A key value array of variables to be passed to JavaScript.
	 */
	public function getLocalizedData()
	{
		global $wpgmzaGDPRCompliance;
		
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/google-maps-api-error-dialog.html.php');
		$googleMapsAPIErrorDialogHTML = $document->saveInnerBody();
		
		$strings = new Strings();
		
		$settings = clone $this->settings;
		
		$result = apply_filters('wpgmza_plugin_get_localized_data', array(
			'adminurl'				=> admin_url(),
			'ajaxurl' 				=> admin_url('admin-ajax.php'),
			'resturl'				=> get_rest_url(null, 'wpgmza/v1'),
			
			'html'					=> array(
				'googleMapsAPIErrorDialog' => $googleMapsAPIErrorDialogHTML
			),
			
			'settings' 				=> $settings,
			'currentPage'			=> $this->getCurrentPage(),
			'userCanAdministrator'	=> (current_user_can('administrator') ? 1 : 0),
			
			'localized_strings'		=> $strings->getLocalizedStrings(),
			'api_consent_html'		=> $wpgmzaGDPRCompliance->getConsentPromptHTML(),
			'basic_version'			=> $this->getBasicVersion(),
			'_isProVersion'			=> $this->isProVersion(),
			'is_admin'				=> (is_admin() ? 1 : 0)
		));
		
		if(!empty($result->settings->wpgmza_settings_ugm_email_address))
			unset($result->settings->wpgmza_settings_ugm_email_address);
		
		return $result;
	}
	
	/**
	 * Returns a string stating the current page, relevant to this plugin.  Please refer to the constants on this class for a list of available pages. If the current page is not relevant to this plugin, NULL is returned.
	 * @return string|null The current page, where relevant to this plugin, or null
	 */
	public function getCurrentPage()
	{
		if(!isset($_GET['page']))
			return null;
		
		switch($_GET['page'])
		{
			case 'wp-google-maps-menu':
				if(isset($_GET['action']) && $_GET['action'] == 'edit')
					return Plugin::PAGE_MAP_EDIT;
				
				return Plugin::PAGE_MAP_LIST;
				break;
				
			case 'wp-google-maps-menu-settings':
				return Plugin::PAGE_SETTINGS;
				break;
				
			case 'wp-google-maps-menu-support':
				return Plugin::PAGE_SUPPORT;
				break;
				
			case 'wp-google-maps-menu-categories':
				return Plugin::PAGE_CATEGORIES;
				break;
				
			case 'wp-google-maps-menu-advanced':
				return Plugin::PAGE_ADVANCED;
				break;
				
			case 'wp-google-maps-menu-custom-fields':
				return Plugin::PAGE_CUSTOM_FIELDS;
				break;
		}
		
		return null;
	}
	
	/**
	 * Returns true if we are to be using combined or minified JavaScript
	 * @return bool True if combined or minified scripts are to be used.
	 */
	public function isUsingMinifiedScripts()
	{
		return empty($this->settings->developer_mode);
	}
	
	/**
	 * Returns true if the developer mode setting is checked, or if the developer mode cookie is set.
	 * @return bool True if in developer mode, by setting or by cookie.
	 */
	public function isInDeveloperMode()
	{
		return !(empty($this->settings->developer_mode) && !isset($_COOKIE['wpgmza-developer-mode']));
	}
	
	/**
	 * Check whether we are running the Pro add-on.
	 * @return bool True if the Pro add-on is installed and activated.
	 */
	public function isProVersion()
	{
		return false;
	}
	
	/**
	 * Returns the plugin version, based on the plugin comment header. This value will be cached if it hasn't been read already.
	 * @return string The version string.
	 */
	public function getBasicVersion()
	{
		if($this->cachedVersion != null)
			return $this->cachedVersion;
		
		$subject = file_get_contents(plugin_dir_path(__DIR__) . 'wpGoogleMaps.php');
		if(preg_match('/Version:\s*(.+)/', $subject, $m))
			$this->cachedVersion = trim($m[1]);
		
		return $this->cachedVersion;
	}
	
	/**
	 * Hooks into load_textdomain_mofile, this function is used to override the WordPress repo translations and force the translations bundled with our plugin to be used. These are more complete and accurate than the WordPress community translations.
	 * @param string $mofile Path to the .mo file in question.
	 * @param string $domain The text domain
	 * @return string 
	 */
	public function onLoadTextDomainMOFile($mofile, $domain)
	{
		if($domain == 'wp-google-maps')
			$mofile = plugin_dir_path(__DIR__) . 'languages/wp-google-maps-' . get_locale() . '.mo';
		
		return $mofile;
	}
}

/** 
 * The Factory class will take over this functionality from 7.11.00 onwards. Do not use this hook. 
 * @deprecated 
 */
function create_plugin_instance()
{
	if(defined('WPGMZA_PRO_VERSION'))
		return new ProPlugin();
	
	return new Plugin();
}

add_action('plugins_loaded', function() {
	global $wpgmza;
	$wpgmza = apply_filters('wpgmza_create_plugin_instance', null);
});

add_filter('wpgmza_create_plugin_instance', 'WPGMZA\\create_plugin_instance', 10, 0);
