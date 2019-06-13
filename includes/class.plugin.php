<?php

namespace WPGMZA;

/**
 * This class represents the plugin itself. Broadly, this module handles practically all interaction with the platform (WP), loading assets as needed, and hooking into the platforms interface to provide menus etc.
 *
 * It also provides a number of helpful utility functions.
 * @property-read string $spatialFunctionPrefix MySQL versions 8 and above prefix all spatial functions with ST_, previous versions do not. This property will be ST_ where necessary, and an empty string where not. You should use this with all DB calls that make use of spaital functions.
 * @property-read string $gdprCompliance An instance of the GDPRCompliance class.
 */
class Plugin extends Factory
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
	
	private $_settings;
	private $_gdprCompliance;
	private $_restAPI;
	private $_spatialFunctionPrefix = '';
	
	protected $scriptLoader;
	
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
		
		// TODO: Could / should cache this above
		if(!empty($this->mysqlVersion) && preg_match('/^\d+/', $this->mysqlVersion, $majorVersion) && (int)$majorVersion[0] >= 8)
			$this->_spatialFunctionPrefix = 'ST_';
		
		$this->legacySettings = get_option('WPGMZA_OTHER_SETTINGS');
		if(!$this->legacySettings)
			$this->legacySettings = array();
		
		// Legacy compatibility
		global $wpgmza_pro_version;
		
		$this->_settings = new GlobalSettings();
		$this->_restAPI = RestAPI::createInstance();
		$this->gutenbergIntegration = Integration\Gutenberg::createInstance();
		
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
		
		if(!empty($this->settings->wpgmza_maps_engine))
			$this->settings->engine = $this->settings->wpgmza_maps_engine;
		
		add_action('init', array($this, 'onInit'), 9);
		
		foreach(Plugin::$enqueueScriptActions as $action)
		{
			add_action($action, function() use ($action) {
				Plugin::$enqueueScriptsFired = true;
			}, 1);
		}
			
		if($this->settings->engine == 'open-layers')
			require_once(plugin_dir_path(__FILE__) . 'open-layers/class.nominatim-geocode-cache.php');
	
		if($this->settings->wpgmza_settings_marker_pull == '1' && !file_exists(wpgmza_return_marker_path()))
		{
			$this->settings->wpgmza_settings_marker_pull = '0';
			
			add_action('admin_notices', function() {
				echo '<div class="error"><p>' . __('<strong>WP Google Maps:</strong> Cannot find the specified XML folder. This has been switched back to the Database method in Maps -> Settings -> Advanced', 'wp-google-maps') . '</p></div>';
			});
		}

	}
	
	public function __set($name, $value)
	{
		if(isset($this->{"_$name"}))
			throw new \Exception('Property is read only');
		
		$this->{$name} = $value;
	}
	
	/**
	 * Getter, see property-read above.
	 */
	public function __get($name)
	{
		switch($name)
		{
			case 'settings':
			case 'gdprCompliance':
			case 'restAPI':
			case 'spatialFunctionPrefix':
				return $this->{'_' . $name};
				break;
		}
		
		return $this->{$name};
	}
	
	public function onInit()
	{
		$this->_gdprCompliance = new GDPRCompliance();
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
		$self = $this;
		
		if(!$this->scriptLoader)
			$this->scriptLoader = new ScriptLoader($this->isProVersion());
		
		if($this->isInDeveloperMode())
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
				add_action($action, function() use ($self) {
					$self->scriptLoader->enqueueScripts();
					$self->scriptLoader->enqueueStyles();
				});
			}
		}
	}
	
	public function getLocalizedData()
	{
		$document = new DOMDocument();
		$document->loadPHPFile(plugin_dir_path(__DIR__) . 'html/google-maps-api-error-dialog.html.php');
		$googleMapsAPIErrorDialogHTML = $document->saveInnerBody();
		
		$strings = new Strings();
		
		$settings = clone $this->settings;
		
		$result = apply_filters('wpgmza_plugin_get_localized_data', array(
			'adminurl'				=> admin_url(),
			'ajaxurl' 				=> admin_url('admin-ajax.php'),

			'html'					=> array(
				'googleMapsAPIErrorDialog' => $googleMapsAPIErrorDialogHTML
			),
			
			'resturl'				=> preg_replace('#/$#', '', get_rest_url(null, 'wpgmza/v1')),
			'restnonce'				=> wp_create_nonce('wp_rest'),

			'settings' 				=> $settings,
			'currentPage'			=> $this->getCurrentPage(),
			
			'userCanAdministrator'	=> (current_user_can('administrator') ? 1 : 0),
			'serverCanInflate'		=> RestAPI::isCompressedPathVariableSupported(),
			
			'localized_strings'		=> $strings->getLocalizedStrings(),
			'api_consent_html'		=> $this->gdprCompliance->getConsentPromptHTML(),
			'basic_version'			=> $this->getBasicVersion(),
			'_isProVersion'			=> $this->isProVersion(),
			
			'defaultMarkerIcon'		=> Marker::DEFAULT_ICON,

			'is_admin'				=> (is_admin() ? 1 : 0),
			'locale'				=> get_locale()
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
		return $this->isInDeveloperMode();
	}
	
	/**
	 * Returns true if the developer mode setting is checked, or if the developer mode cookie is set.
	 * @return bool True if in developer mode, by setting or by cookie.
	 */
	public function isInDeveloperMode()
	{
		return !(empty($this->settings->developer_mode) && !isset($_COOKIE['wpgmza-developer-mode']));
	}
	
	public static function preloadIsInDeveloperMode()
	{
		$globalSettings = get_option('wpgmza_global_settings');
		
		if(empty($globalSettings))
			return !empty($_COOKIE['wpgmza-developer-mode']);
		
		if(!($globalSettings = json_decode($globalSettings)))
			return false;
		
		return isset($globalSettings->developer_mode) && $globalSettings->developer_mode == true;
	}
	
	/**
	 * Check whether we are running the Pro add-on.
	 * @return bool True if the Pro add-on is installed and activated.
	 */
	public function isProVersion()
	{
		if(defined('WPGMZA_PRO_VERSION') && version_compare(WPGMZA_PRO_VERSION, '7.10.00', '<'))
			return true;	// Pre ProPlugin
		
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

add_action('plugins_loaded', function() {
	
	function create()
	{
		global $wpgmza;
		
		if(defined('WPGMZA_PRO_VERSION') && version_compare(WPGMZA_PRO_VERSION, '7.11.00', '<') && class_exists('WPGMZA\\ProPlugin'))
		{
			$wpgmza = new ProPlugin();
			return;
		}
		
		$wpgmza = Plugin::createInstance();
	}
	
	if(Plugin::preloadIsInDeveloperMode())
		create();
	else
		try{
			create();
		}catch(Exception $e){
			add_action('admin_notices', function() use ($e) {
				
				?>
				<div class="notice notice-error is-dismissible">
					<p>
						<?php
						_e('WP Google Maps', 'wp-google-maps');
						?>:
						<?php
						_e('The plugin cannot initialise due to a fatal error. This is usually due to missing files or incompatible software. Please re-install the plugin and any relevant add-ons. We recommend that you use at least PHP 5.6. Technical details are as follows: ', 'wp-google-maps');
						echo $e->getMessage();
						?>
					</p>
				</div>
				<?php
				
			});
		}
	
});
