<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/class.auto-loader.php');
wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/class.gdpr-compliance.php');
wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/3rd-party-integration/class.wp-migrate-db-integration.php');
wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/open-layers/class.nominatim-geocode-cache.php');
wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/class.maps-engine-dialog.php');
wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/class.installer-page.php');

wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/class.settings-page.php');
wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/styling/class.styling-page.php');
wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/map-edit-page/class.map-edit-page.php');
wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . 'includes/map-edit-page/class.map-editor-tour.php');

wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . "base/classes/widget_module.class.php" );
wpgmza_require_once(WPGMZA_PLUGIN_DIR_PATH . "includes/compat/backwards_compat_v6.php" );

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
	const PAGE_MAP_CREATE_PAGE	= "create-map-page";
	const PAGE_MAP_WIZARD		= "wizard";
	const PAGE_SETTINGS			= "map-settings";
	const PAGE_STYLING			= "map-styling";
	const PAGE_SUPPORT			= "map-support";

	const PAGE_INSTALLER 	  	= "installer";
	
	const PAGE_CATEGORIES		= "categories";
	const PAGE_ADVANCED			= "advanced";
	const PAGE_CUSTOM_FIELDS	= "custom-fields";
	
	const MARKER_PULL_DATABASE	= "0";
	const MARKER_PULL_XML		= "1";
	
	private static $enqueueScriptActions = array(
		'wp_enqueue_scripts',
		'admin_enqueue_scripts',
		'enqueue_block_assets'
	);
	public static $enqueueScriptsFired = false;
	
	private $_database;
	private $_settings;
	private $_stylingSettings;
	private $_gdprCompliance;
	private $_restAPI;
	private $_gutenbergIntegration;
	private $_pro7Compatiblity;
	private $_dynamicTranslations;
	private $_spatialFunctionPrefix = '';
	
	protected $_internalEngine;
	protected $_scriptLoader;

	private $mysqlVersion = null;
	private $cachedVersion = null;
	private $legacySettings;
	
	/**
	 * Constructor. Called when plugins_loaded fires.
	 */
	public function __construct()
	{
		global $wpdb;
		
		// Activation and de-activation hooks
		$file = WPGMZA_PLUGIN_DIR_PATH . 'wpGoogleMaps.php';

		$subject = file_get_contents($file);
		if(preg_match('/Version:\s*(.+)/', $subject, $m))
			$wpgmza_version = trim($m[1]);
		
		register_deactivation_hook($file, array($this, 'onDeactivated'));
		
		// Translation for Pro
		add_filter('load_textdomain_mofile', array($this, 'onLoadTextDomainMOFile'), 10, 2);
		load_plugin_textdomain('wp-google-maps', false, plugin_dir_path(__DIR__) . 'languages/');
		
		// Spatial function prefixes
		$this->mysqlVersion = $wpdb->get_var('SELECT VERSION()');
		
		if(!empty($this->mysqlVersion) && preg_match('/^\d+/', $this->mysqlVersion, $majorVersion) && (int)$majorVersion[0] >= 8)
			$this->_spatialFunctionPrefix = 'ST_';
		
		// Database
		$this->_database = new Database();
		
		// Dynamic translation file
		$this->_dynamicTranslations = new DynamicTranslations();
		
		// Legacy settings
		$this->legacySettings = get_option('WPGMZA_OTHER_SETTINGS');
		if(!$this->legacySettings)
			$this->legacySettings = array();
		
		// Modules
		$this->_settings = new GlobalSettings();
		$this->_stylingSettings = new StylingSettings();
		$this->_pro7Compatiblity = new Pro7Compatibility();
		$this->_pro9Compatibility = new Pro9Compatibility();

		$this->_restAPI = RestAPI::createInstance();
		
		$this->_gutenbergIntegration = Integration\Gutenberg::createInstance();
	
		if(!empty($this->settings->wpgmza_maps_engine))
			$this->settings->engine = $this->settings->wpgmza_maps_engine;

		$this->_internalEngine = new InternalEngine($this->settings->internal_engine);
		$this->_shortcodes = Shortcodes::createInstance($this->_internalEngine);
		
		// Initialisation listener
		add_action('init', array($this, 'onInit'), 9);
		add_action('activated_plugin', array($this, 'onActivatedPlugin'));
		
		// Track if the enqueue action has been fired already so we can enqueue properly
		foreach(Plugin::$enqueueScriptActions as $action)
		{
			add_action($action, function() use ($action) {
				Plugin::$enqueueScriptsFired = true;
			}, 1);
		}
		
		// Include nominatim for it's legacy AJAX hooks
		// TODO: Use a RESTful approach here instead
		if($this->settings->engine == 'open-layers')
			require_once(plugin_dir_path(__FILE__) . 'open-layers/class.nominatim-geocode-cache.php');

		
		if(is_admin())
		{
			// Admin UI
			$this->_adminUI = UI\Admin::createInstance();
			
			// XML admin notices for when XML cache generation nears execution time limit or memory limit
			if($this->settings->wpgmza_settings_marker_pull == '1' && !file_exists($this->getXMLCacheDirPath()))
			{
				$this->settings->wpgmza_settings_marker_pull = '0';
				
				add_action('admin_notices', function() {
					echo '<div class="error"><p>' . __('<strong>WP Go Maps:</strong> Cannot find the specified XML folder. This has been switched back to the Database method in Maps -> Settings -> Advanced', 'wp-google-maps') . '</p></div>';
				});
			}
      
			if($this->settings->displayXMLExecutionTimeWarning)
			{
				$this->settings->displayXMLExecutionTimeWarning = false;
				
				add_action('admin_notices', function() {
					echo '<div class="error"><p>' . __('<strong>WP Go Maps:</strong> Execution time limit was reached whilst generating XML cache. This has been switched back to the Database method in Maps -> Settings -> Advanced', 'wp-google-maps') . '</p></div>';
				});
			}
			
			if($this->settings->displayXMLMemoryLimitWarning)
			{
				$this->settings->displayXMLMemoryLimitWarning = false;
				
				add_action('admin_notices', function() {
					echo '<div class="error"><p>' . __('<strong>WP Go Maps:</strong> Allowed memory size was reached whilst generating XML cache. This has been switched back to the Database method in Maps -> Settings -> Advanced', 'wp-google-maps') . '</p></div>';
				});
			}
		}

		if(!empty($this->settings->enable_dynamic_sql_refac_filter)){
			/* The dynamic SQL refactor option has been enabled */
			add_filter('query', array($this, 'dynamicQueryRefactor'), 99, 1);
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
			case 'stylingSettings':
			case 'gdprCompliance':
			case 'restAPI':
			case 'spatialFunctionPrefix':
			case 'database':
			case 'dynamicTranslations':
			case 'adminUI':
			case 'scriptLoader':
			case 'internalEngine':
			case 'adminNotices':
				return $this->{'_' . $name};
				break;
		}
		
		return $this->{$name};
	}
	
	public function __isset($name)
	{
		switch($name)
		{
			case 'settings':
			case 'stylingSettings':
			case 'gdprCompliance':
			case 'restAPI':
			case 'spatialFunctionPrefix':
			case 'database':
				return true;
				break;
		}
		
		return false;
	}
	
	public function onActivated()
	{
        update_option("wpgmza_temp_api",'AIzaSyDo_fG7DXBOVvdhlrLa-PHREuFDpTklWhY');

	    /* Developer Hook (Action) - Add to plugin activation logic */     
		do_action("wpgmza_plugin_core_on_activate");
		
		if(get_option('wpgmza-first-run'))
			return; // Not first run
		
		$this->onFirstRun();
	}
	
	/**
	 * Please note this fires after *any* plugin has been activated, as opposed to onActivated which is for our plugin
	 */
	public function onActivatedPlugin($plugin)
	{
		if(!preg_match('/wpGoogleMaps\.php$/', $plugin))
			return;
		
		if(get_option('wpgmza_welcome_screen_done'))
			return;
		
		$current_screen = get_current_screen();
		
		if ($current_screen && $current_screen->id == "appearance_page_install-required-plugins" )
			return; // Multiple plugins are being activated, don't show welcome screen
		
		update_option('wpgmza_welcome_screen_done', true);
		
		wp_redirect(admin_url('admin.php?page=wp-google-maps-menu&action=welcome_page'));
		
		exit;
	}
	
	public function onDeactivated()
	{
	    /* Developer Hook (Action) - Add to plugin deactivation logic */     
		do_action("wpgmza_plugin_core_on_deactivate");
	}
	
	public function onInit(){
		$this->_gdprCompliance = new GDPRCompliance();
		$this->_adminNotices = new AdminNotices();

		// Create the XML directory if it doesn't already exist
		$other_settings = get_option('WPGMZA_OTHER_SETTINGS');
		if (isset($other_settings['wpgmza_settings_marker_pull']) && $other_settings['wpgmza_settings_marker_pull'] == '1') {
			$xml_marker_location = get_option("wpgmza_xml_location");
			if (!file_exists($xml_marker_location)) {
				if (@mkdir($xml_marker_location)) {
					return true;
				} else {
					return false;
				}
			}
		}

	    /* Developer Hook (Action) - Add to plugin init logic */     
		do_action("wpgmza_plugin_core_on_init");
	}
	
	protected function onFirstRun()
	{
		$current_screen = get_current_screen();

		$this->database->onFirstRun();
		
		update_option('wpgmza-first-run', date(\DateTime::ISO8601));

	    /* Developer Hook (Action) - Add to first run plugin logic */     
		do_action("wpgmza_plugin_core_on_first_run");

		if($current_screen && $current_screen->id == "appearance_page_install-required-plugins")
			return; // Bulk activating plugins, don't redirect just yet

		/* Developer Hook (Filter) - Prevent/replace activation redirect */
		$preventWelcomeRedir = apply_filters('wpgmza-plugin-core-prevent-welcome-redirect', false);
		if(!empty($preventWelcomeRedir)){
			/* Filter returned a value, we should not redirect */
			return;
		}
		
		wp_redirect( admin_url( 'admin.php?page=wp-google-maps-menu&action=welcome_page' ) );
	}
	
	/**
	 * This function will cause the plugin scripts to be loaded. Firstly it will initialize an instance of ScriptLoader. If the developer mode setting is enabled, the scripts will be rebuilt.
	 *
	 * If any of the enqueue scripts, admin enqueue scripts or enqueue block assets (Gutenberg) actions have already fired, this function will immediately ask the script loader to enqueue the plugins scripts and styles.
	 *
	 * If none of those actions have fired yet, this function will bind to all three and enqueue the scripts at the correct time.
	 * @return void
	 */
	public function loadScripts($forceLoad=false)
	{
		$self = $this;
		
		if(!$this->scriptLoader)
			$this->scriptLoader = new ScriptLoader($this->isProVersion());
		
		if($this->isInDeveloperMode())
			$this->scriptLoader->build();
		
		if(Plugin::$enqueueScriptsFired)
		{
			$this->scriptLoader->enqueueScripts($forceLoad);
			$this->scriptLoader->enqueueStyles($forceLoad);
		}
		else
		{
			foreach(Plugin::$enqueueScriptActions as $action) {
				add_action($action, function() use ($self, $forceLoad) {
					$self->scriptLoader->enqueueScripts($forceLoad);
					$self->scriptLoader->enqueueStyles($forceLoad);
				});
			}
		}
		
	    /* Developer Hook (Action) - Load additional plugin scripts */     
		do_action('wpgmza_plugin_load_scripts');
	}
	
	public function getLocalizedData()
	{
		global $post, $wpgmza;
		
		$document = new DOMDocument();
		
		$document->loadPHPFile($wpgmza->internalEngine->getTemplate('google-maps-api-error-dialog.html.php'));

		$googleMapsAPIErrorDialogHTML = $document->saveInnerBody();
		
		$strings = new Strings();
		
		$settings = clone $this->settings;
		$stylingSettings = clone $this->stylingSettings;
		
		$resturl = preg_replace('#/$#', '', get_rest_url(null, 'wpgmza/v1'));
		$resturl = preg_replace('#^http(s?):#', '', $resturl);
		
		/* Developer Hook (Filter) - Add or alter localization variables */
		$result = apply_filters('wpgmza_plugin_get_localized_data', array(
			'adminurl'				=> admin_url(),
			'siteHash'				=> md5(site_url()),
			'ajaxurl' 				=> admin_url('admin-ajax.php'),
			'pluginDirURL'			=> plugin_dir_url(WPGMZA_FILE),
			
			'ajaxnonce'				=> wp_create_nonce('wpgmza_ajaxnonce'),
			'legacyajaxnonce'		=> wp_create_nonce('wpgmza'),

			'html'					=> array(
				'googleMapsAPIErrorDialog' => $googleMapsAPIErrorDialogHTML
			),
			
			'imageFolderURL'		=> plugin_dir_url(WPGMZA_FILE) . 'images/',
			
			'resturl'				=> preg_replace('#/$#', '', get_rest_url(null, 'wpgmza/v1')),
			'restnonce'				=> wp_create_nonce('wp_rest'),
			'restnoncetable'		=> $this->restAPI->getNonceTable(),

			'settings' 				=> $settings,
			'stylingSettings'		=> $stylingSettings,
			'currentPage'			=> $this->getCurrentPage(),
			
			'userCanAdministrator'	=> (current_user_can('administrator') ? 1 : 0),
			'serverCanInflate'		=> RestAPI::isCompressedPathVariableSupported(),
			
			'localized_strings'		=> $strings->getLocalizedStrings(),
			'api_consent_html'		=> $this->gdprCompliance->getConsentPromptHTML(),
			'basic_version'			=> $this->getBasicVersion(),
			'_isProVersion'			=> $this->isProVersion(),
			
			'defaultMarkerIcon'		=> Marker::DEFAULT_ICON,
			'markerXMLPathURL'		=> Map::getMarkerXMLPathURL(),

			'is_admin'				=> (is_admin() ? 1 : 0),
			'locale'				=> get_locale(),
			
			'isServerIIS'			=> (isset($_SERVER["SERVER_SOFTWARE"]) && preg_match('/microsoft-iis/i', $_SERVER["SERVER_SOFTWARE"])),
			'labelpointIcon'		=> plugin_dir_url(WPGMZA_FILE) . 'images/label-point.png',
			'buildCode' 			=> $wpgmza->internalEngine->getBuildVersion(),
		));
		
		$installationSkipDate = get_option('wpgmza-installer-paused');
		if(!empty($installationSkipDate)){
			if(strtotime(date('Y-m-d')) <= strtotime($installationSkipDate)){
				/* The user skipped installation, we should not redirect them forcefully */
				$result['ignoreInstallerRedirect'] = 'true';
			} 
		}
		
		if($post){
			$result['postID'] = $post->ID;
		}
		
		if(!empty($result['settings']->wpgmza_settings_ugm_email_address)){
			unset($result['settings']->wpgmza_settings_ugm_email_address);
		}

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
				if(isset($_GET['action'])){
					if($_GET['action'] == 'edit'){
						return Plugin::PAGE_MAP_EDIT;
					}
				
					if($_GET['action'] == 'create-map-page'){
						return Plugin::PAGE_MAP_CREATE_PAGE;
					}

					if($_GET['action'] == 'wizard'){
						return Plugin::PAGE_MAP_WIZARD;
					}

					if($_GET['action'] == 'installer'){
						return Plugin::PAGE_INSTALLER;
					}
				}
				
				return Plugin::PAGE_MAP_LIST;
				break;
				
			case 'wp-google-maps-menu-settings':
				return Plugin::PAGE_SETTINGS;
				break;

			case 'wp-google-maps-menu-styling':
				return Plugin::PAGE_STYLING;
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
	
	public function updateAllMarkerXMLFiles()
	{
		global $wpdb, $WPGMZA_TABLE_NAME_MAPS;
		
		$map_ids = $wpdb->get_col("SELECT id FROM $WPGMZA_TABLE_NAME_MAPS");
		
		foreach($map_ids as $id)
		{
			$map = Map::createInstance($id);
			$map->updateXMLFile();
		}

	    /* Developer Hook (Action) - Update all XML files */     
		do_action("wpgmza_plugin_core_update_all_xml_files");
	}
	
	public function isModernComponentStyleAllowed()
	{
		return empty($this->settings->user_interface_style) || $this->settings->user_interface_style == "legacy" || $this->settings->user_interface_style == "modern";
	}
	
	/**
	 * Returns true if we are to be using combined or minified JavaScript
	 * @return bool True if combined or minified scripts are to be used.
	 */
	public function isUsingMinifiedScripts()
	{
		return !$this->isInDeveloperMode();
	}
	
	/**
	 * Returns true if the developer mode setting is checked, or if the developer mode cookie is set.
	 * @return bool True if in developer mode, by setting or by cookie.
	 */
	public function isInDeveloperMode()
	{
		return !(empty($this->settings->wpgmza_developer_mode) && !isset($_COOKIE['wpgmza-developer-mode']));
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
	 * Danger Zone Delete method 
	 * 
	 * This has been refactored a bit in V9.0.0, some notes on that:
	 * - The original implementation had no notable issues
	 * - It did however include a few repeating truncate calls, which could be optimized for better long term dataset management 
	 * - We also added some filters/actions to allow developers to hook into this call if they need to 
	 * - Not needed, but improvements will help streamline things into the future 
	 * 
	 * @param string $type The type of delete action being taken 
	 * 
	 * @return bool 
	 */
	public function deleteAllData($type) {
		global $wpdb, $WPGMZA_TABLE_NAME_MARKERS, $WPGMZA_TABLE_NAME_MAPS,
			$WPGMZA_TABLE_NAME_POLYGONS, $WPGMZA_TABLE_NAME_POLYLINES,
			$WPGMZA_TABLE_NAME_CIRCLES, $WPGMZA_TABLE_NAME_RECTANGLES,
			$WPGMZA_TABLE_NAME_HEATMAPS, $WPGMZA_TABLE_NAME_POINT_LABELS,
			$WPGMZA_TABLE_NAME_IMAGE_OVERLAYS, $WPGMZA_TABLE_NAME_ADMIN_NOTICES,
			$WPGMZA_TABLE_NAME_CATEGORIES, $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES,
			$WPGMZA_TABLE_NAME_CATEGORY_MAPS, $WPGMZA_TABLE_NAME_CUSTOM_FIELDS,
			$WPGMZA_TABLE_NAME_MAPS_HAS_CUSTOM_FIELDS_FILTERS, $WPGMZA_TABLE_NAME_MARKERS_HAS_CUSTOM_FIELDS,
			$WPGMZA_TABLE_NAME_BATCHED_IMPORTS;


		$type = !empty($type) ? str_replace("wpgmza_", "", $type) : false;
		
		$truncateTables = array();
		$dropOptions = false;
		$simulateFirstRun = false;
		

		switch($type){
			case 'destroy_all_data':
				/* Primary Tables */
				$truncateTables[] = $WPGMZA_TABLE_NAME_MAPS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_MARKERS;
				
				/* Shapes */
				$truncateTables[] = $WPGMZA_TABLE_NAME_POLYGONS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_POLYLINES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_CIRCLES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_RECTANGLES;

				/* Datasets */
				$truncateTables[] = $WPGMZA_TABLE_NAME_HEATMAPS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_POINT_LABELS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_IMAGE_OVERLAYS;

				/* Categories */
				$truncateTables[] = $WPGMZA_TABLE_NAME_CATEGORIES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_CATEGORY_MAPS;

				/* Fields */
				$truncateTables[] = $WPGMZA_TABLE_NAME_CUSTOM_FIELDS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_MARKERS_HAS_CUSTOM_FIELDS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_MAPS_HAS_CUSTOM_FIELDS_FILTERS;

				/* Back office */
				$truncateTables[] = $WPGMZA_TABLE_NAME_ADMIN_NOTICES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_BATCHED_IMPORTS;

				$dropOptions = true;
				$simulateFirstRun = true;
				
				break;
			case 'reset_all_settings':
				$dropOptions = true;
				break;
			case 'destroy_maps':
				/* Primary Tables */
				$truncateTables[] = $WPGMZA_TABLE_NAME_MAPS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_MARKERS;
				
				/* Shapes */
				$truncateTables[] = $WPGMZA_TABLE_NAME_POLYGONS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_POLYLINES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_CIRCLES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_RECTANGLES;

				/* Datasets */
				$truncateTables[] = $WPGMZA_TABLE_NAME_HEATMAPS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_POINT_LABELS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_IMAGE_OVERLAYS;

				/* Categories */
				$truncateTables[] = $WPGMZA_TABLE_NAME_CATEGORIES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_CATEGORY_MAPS;

				/* Fields */
				$truncateTables[] = $WPGMZA_TABLE_NAME_CUSTOM_FIELDS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_MARKERS_HAS_CUSTOM_FIELDS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_MAPS_HAS_CUSTOM_FIELDS_FILTERS;

				break;
			case 'destroy_markers':
				/* Markers */
				$truncateTables[] = $WPGMZA_TABLE_NAME_MARKERS;

				/* Marker categorties */
				$truncateTables[] = $WPGMZA_TABLE_NAME_MARKERS_HAS_CATEGORIES;

				/* Marker fields */
				$truncateTables[] = $WPGMZA_TABLE_NAME_MARKERS_HAS_CUSTOM_FIELDS;

				break;
			case 'destroy_shapes':
				/* Shapes */
				$truncateTables[] = $WPGMZA_TABLE_NAME_POLYGONS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_POLYLINES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_CIRCLES;
				$truncateTables[] = $WPGMZA_TABLE_NAME_RECTANGLES;

				/* Datasets */
				$truncateTables[] = $WPGMZA_TABLE_NAME_HEATMAPS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_POINT_LABELS;
				$truncateTables[] = $WPGMZA_TABLE_NAME_IMAGE_OVERLAYS;
				break;
			default:
				/*
				 * Pay respects to the original logic which use to live here 
				 * ----
				 * Is this the real life?
				 * Is this just fantasy?
				 * Caught in a landslide
				 * No escape from reality
				 * Open your eyes
				 * Look up to the skies and seeeee................there is nothing here ¯\_(ツ)_/¯
				*/
				break;

		}

	    /* Developer Hook (Action) - Run actions before danger zone delete, passes type */     
		do_action("wpgmza_settings_danger_zone_before_delete", $type);

		if(!empty($truncateTables)){
			$filteredTables = array();
			foreach($truncateTables as $table){
				if(!empty($table)){
					$filteredTables[] = $table;
				}
			}

			/* Developer Hook (Filter) - Allows for addition/removal of tables from the danger zone action, passes tables, and current action type */
			$truncateTables = apply_filters("wpgmza_settings_danger_zone_truncate_tables", $filteredTables, $type);

			if(!empty($truncateTables) && is_array($truncateTables)){
				foreach($truncateTables as $table){
					/* Truncate the table */
					$wpdb->query("TRUNCATE TABLE `{$table}`");
				}
			}
		}

		if($dropOptions){
			/* Drop the options we have setup */
			$optionsTable = "{$wpdb->prefix}options";
			$wpdb->query("DELETE FROM `{$optionsTable}` WHERE `option_name` LIKE 'wpgm%' LIMIT 30");		
		}

	    /* Developer Hook (Action) - Run actions after danger zone delete, passes type */     
		do_action("wpgmza_settings_danger_zone_after_delete", $type);

		if($simulateFirstRun){
			$this->onFirstRun();
		}

		return true;
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
	
	public static function getProLink($link)
	{
		if(defined('wpgm_aff'))
		{
			$id = sanitize_text_field(wpgm_aff);
			
			if(!empty($id))
				return "http://affiliatetracker.io/?aff=".$id."&affuri=".base64_encode($link);    
		}
		
		return $link;
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
		if($domain == 'wp-google-maps' && !class_exists("WPML_Translation_Management") && function_exists('get_user_locale')){
			$mofile = plugin_dir_path(__DIR__) . 'languages/wp-google-maps-' . \get_user_locale() . '.mo';
		}
		
		return $mofile;
	}
	
	public function getAccessCapability()
	{
		return (empty($this->settings->wpgmza_settings_access_level) ? 'manage_options' : $this->settings->wpgmza_settings_access_level);
	}
	
	public function isUserAllowedToEdit()
	{
		return current_user_can($this->getAccessCapability());
	}
	
	public function getXMLCacheDirPath()
	{
		$dir = $this->settings->wpgmza_marker_xml_location;
		
		if(!empty($dir))
			return $dir;	// Prefer new setting over legacy setting
		
		// But still provide support for legacy migrating users who haven't saved their global settings just yet
		
		$file = get_option("wpgmza_xml_location");
		
		$content_dir = WP_CONTENT_DIR;
		$content_dir = trim($content_dir, '/');
		
		if (defined('WP_PLUGIN_DIR')) {
			$plugin_dir = str_replace(wpgmza_get_document_root(), '', WP_PLUGIN_DIR);
			$plugin_dir = trim($plugin_dir, '/');
		} else {
			$plugin_dir = str_replace(wpgmza_get_document_root(), '', WP_CONTENT_DIR . '/plugins');
			$plugin_dir = trim($plugin_dir, '/');
		}
		
		$upload_dir = wp_upload_dir();
		$upload_dir = $upload_dir['basedir'];
		$upload_dir = rtrim($upload_dir, '/');
		
		$file = str_replace('{wp_content_dir}', $content_dir, $file);
		$file = str_replace('{plugins_dir}', $plugin_dir, $file);
		$file = str_replace('{uploads_dir}', $upload_dir, $file);
		$file = trim($file);

		/* Moving away from realpath implementation, it's unreliable in some environments and thats a deal breaker for us */
		$file = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $file);
		
		$pathParts = explode(DIRECTORY_SEPARATOR, $file);
		$invalidParts = array('.', '..', '~');
		foreach($pathParts as $key => $part){
			$part = trim($part);
			if(in_array($part, $invalidParts)){
				unset($pathParts[$key]);
			}
		}

		/* Rejoin the path, but we will have dropped traversal method */
		if(!empty($pathParts)){
			$file = implode(DIRECTORY_SEPARATOR, $pathParts);
		} else {
			$file = false;
		}
		
		/* Now confirm that path contains either: content, uploads, or plugin directory for storage */
		if(!empty($file)){
			$validRoots = array($content_dir, $upload_dir, $plugin_dir);
			$vRoot = false;
			foreach($validRoots as $root){
				$root = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $root);
				$sample = substr($file, 0, strlen($root));

				if($root === $sample){
					$vRoot = true;
				}
			}
			
			if(empty($vRoot)){
				$file = false;
			}
		}
		
		if (empty($file)) {
			$file = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $upload_dir) . DIRECTORY_SEPARATOR . "wp-google-maps" . DIRECTORY_SEPARATOR;
		}

		if (substr($file, -1) != DIRECTORY_SEPARATOR) { $file = $file . DIRECTORY_SEPARATOR; }
		
		return $file;
	}
	
	public function getXMLCacheDirURL()
	{
		$url = get_option("wpgmza_xml_url");
		
		$content_url = content_url();
		$content_url = trim($content_url, '/');
		 
		$plugins_url = plugins_url();
		$plugins_url = trim($plugins_url, '/');
		 
		$upload_url = wp_upload_dir();
		$upload_url = $upload_url['baseurl'];
		$upload_url = trim($upload_url, '/');

		$url = str_replace('{wp_content_url}', $content_url, $url);
		$url = str_replace('{plugins_url}', $plugins_url, $url);
		$url = str_replace('{uploads_url}', $upload_url, $url);
		
		/* just incase people use the "dir" instead of "url" */
		$url = str_replace('{wp_content_dir}', $content_url, $url);
		$url = str_replace('{plugins_dir}', $plugins_url, $url);
		$url = str_replace('{uploads_dir}', $upload_url, $url);

		if (empty($url)) {
			$url = $upload_url."/wp-google-maps/";
		}
		
		if (substr($url, -1) != "/") { $url = $url."/"; }

		return $url;
	}

	/**
	 * Dynamically refactors SQL statements to not make use of single quote statements 
	 * 
	 * This is helpful on environments where single quote queries are not allowed, or not supported. 
	 * 
	 * Known hosts: WP Engine 
	 * 
	 * This will only run if the option is enabled 
	 * 
	 * @param string $sql The query that is about to be executed 
	 * 
	 * @return string
	 */
	public function dynamicQueryRefactor($sql){
		if(strpos($sql, 'wpgmza') !== FALSE){
			/* This is a WPGMZA query */
			if(strpos($sql, "REPLACE(map_width_type, '\\\\', '')") !== FALSE){
				/* Specifically for map params, which is a big cause of the issue */
				$sql = str_replace("'\\\\'", "''", $sql);
			}
			
			/* General replacement statement */
			$sql = str_replace("\'", "''", $sql);
		}
		return $sql;
	}

	public static function get_rss_feed_as_html($feed_url, $max_item_cnt = 10, $show_date = true, $show_description = true, $max_words = 0, $cache_timeout = 7200, $cache_prefix = "/tmp/rss2html-") {
	    $result = "";
	    // get feeds and parse items
	    $rss = new DOMDocument();
	    $cache_file = $cache_prefix . md5($feed_url);
	    // load from file or load content
	    if ($cache_timeout > 0 &&
	        is_file($cache_file) &&
	        (filemtime($cache_file) + $cache_timeout > time())) {
	            $rss->load($cache_file);
	    } else {
	        $rss->load($feed_url);
	        if ($cache_timeout > 0) {
	            $rss->save($cache_file);
	        }
	    }
	    $feed = array();
	    foreach ($rss->getElementsByTagName('item') as $node) {
	        $item = array (
	            'title' => $node->getElementsByTagName('title')->item(0)->nodeValue,
	            'desc' => $node->getElementsByTagName('description')->item(0)->nodeValue,
	            'content' => $node->getElementsByTagName('description')->item(0)->nodeValue,
	            'link' => $node->getElementsByTagName('link')->item(0)->nodeValue,
	            'date' => $node->getElementsByTagName('pubDate')->item(0)->nodeValue,
	        );
	        $content = $node->getElementsByTagName('encoded'); // <content:encoded>
	        if ($content->length > 0) {
	            $item['content'] = $content->item(0)->nodeValue;
	        }
	        array_push($feed, $item);
	    }
	    // real good count
	    if ($max_item_cnt > count($feed)) {
	        $max_item_cnt = count($feed);
	    }
	    $result .= '<ul class="feed-lists">';
	    for ($x=0;$x<$max_item_cnt;$x++) {
	        $title = str_replace(' & ', ' &amp; ', $feed[$x]['title']);
	        $link = $feed[$x]['link'];
	        $result .= '<li class="feed-item">';
	        $result .= '<div class="feed-title"><strong><a href="'.$link.'" title="'.$title.'">'.$title.'</a></strong></div>';
	        if ($show_date) {
	            $date = date('l F d, Y', strtotime($feed[$x]['date']));
	            $result .= '<small class="feed-date"><em>Posted on '.$date.'</em></small>';
	        }
	        if ($show_description) {
	            $description = $feed[$x]['desc'];
	            $content = $feed[$x]['content'];
	            // find the img
	            $has_image = preg_match('/<img.+src=[\'"](?P<src>.+?)[\'"].*>/i', $content, $image);
	            // no html tags
	            $description = strip_tags(preg_replace('/(<(script|style)\b[^>]*>).*?(<\/\2>)/s', "$1$3", $description), '');
	            // whether cut by number of words
	            if ($max_words > 0) {
	                $arr = explode(' ', $description);
	                if ($max_words < count($arr)) {
	                    $description = '';
	                    $w_cnt = 0;
	                    foreach($arr as $w) {
	                        $description .= $w . ' ';
	                        $w_cnt = $w_cnt + 1;
	                        if ($w_cnt == $max_words) {
	                            break;
	                        }
	                    }
	                    $description .= " ...";
	                }
	            }
	            // add img if it exists
	            if ($has_image == 1) {
	                $description = '<img class="feed-item-image" src="' . $image['src'] . '" />' . $description;
	            }
	            $result .= '<div class="feed-description">' . $description;
	            $result .= ' <a href="'.$link.'" title="'.$title.'">Continue Reading &raquo;</a>'.'</div>';
	        }
	        $result .= '</li>';
	    }
	    $result .= '</ul>';
	    return $result;
	}

	public static function output_rss_feed($feeds, $max_item_cnt = 10, $show_date = true, $show_description = true, $max_words = 0) {
	    
	    $ssl = false;
		if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') {
		    $ssl = true;
		}
		
        $entries = array();
		
        foreach($feeds as $feed)
		{
			if (!$ssl) {
        		$feed = str_replace('https://', 'http://', $feed);
        	}
			
            if ($xml = @simplexml_load_file($feed)) {
            	$entries = array_merge($entries, $xml->xpath("//item"));
            } else {
            	$entries = array();
            }
        }
        
        usort($entries, function ($feed1, $feed2) {
            return strtotime($feed2->pubDate) - strtotime($feed1->pubDate);
        });
		
        $entries	= array_slice($entries, 0, $max_item_cnt);
        
		$document	= new DOMDocument();
		$document->loadHTML("<ul></ul>");
		
		$ul			= $document->querySelector("ul");
        
        foreach($entries as $entry)
		{
			$li		= $document->createElement("li");
			
			$a		= $document->createElement("a");
			
			$a->setAttribute('href', $entry->link);
			$a->appendText(html_entity_decode($entry->title));
			
			$span	= $document->createElement("span");
			$span->addClass("wpgmTimeAgo");
			$span->appendText(Plugin::timeAgo($entry->pubDate));
			
			$li->appendChild($a);
			$li->appendText(" ");
			$li->appendChild($span);
			
			$ul->appendChild($li);
        }
        
        echo $ul->html;
	}

	public static function timeAgo($date) {
	   $timestamp = strtotime($date);	
	   
	   $strTime = array("s", "min", "hr", "d", "mo", "yrs");
	   $length = array("60","60","24","30","12","10");

	   $currentTime = time();
	   if($currentTime >= $timestamp) {
			$diff     = time()- $timestamp;
			for($i = 0; $diff >= $length[$i] && $i < count($length)-1; $i++) {
			$diff = $diff / $length[$i];
			}

			$diff = round($diff);
			return $diff . "" . $strTime[$i] . " ago";
	   }
	}
}

function wpgmza_create_plugin()
{
	global $wpgmza;
	
	if($wpgmza)
		return;
	
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
						_e('WP Go Maps', 'wp-google-maps');
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
}

register_activation_hook(WPGMZA_FILE, function() {
	
	global $wpgmza;
	
	wpgmza_create_plugin();
	
	$wpgmza->onActivated();
	
});

add_action('plugins_loaded', function() {
	
	wpgmza_create_plugin();
	
});
