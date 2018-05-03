<?php

namespace WPGMZA;

require_once(plugin_dir_path(__FILE__) . 'google-maps/class.google-maps-loader.php');
require_once(plugin_dir_path(__FILE__) . 'open-street-map/class.osm-loader.php');

class ScriptLoader
{
	private $proMode = false;
	private $logStarted = false;
	public $scripts;
	
	public function __construct($proMode)
	{
		$this->proMode = $proMode;
		
		if($this->proMode)
			$this->scriptsFileLocation = plugin_dir_path(WPGMZA_PRO_FILE) . 'js/v8/pro-scripts.json';
		else
			$this->scriptsFileLocation = plugin_dir_path(__DIR__) . 'js/v8/scripts.json';
	}
	
	protected function log($str)
	{
		$dest = __DIR__ . '/build.log';
		
		if(!$this->logStarted)
			file_put_contents($dest, "");
		
		$this->logStarted = true;
		file_put_contents($dest, date("Y-m-d H:i:s :-\t") . $str . "\r\n", FILE_APPEND);
	}
	
	protected function rglob($pattern, $flags = 0)
	{
		$files = glob($pattern, $flags); 
		
		foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir) {
			
			$files = array_merge($files, $this->rglob($dir.'/'.basename($pattern), $flags));
			
		}
		
		return $files;
	}
	
	protected function getHandleFromModuleName($module)
	{
		return trim(preg_replace('/^wpgmza\./', 'wpgmza-',
			strtolower(
				preg_replace('/(?<=[A-Za-z])(?=[A-Z][a-z])|(?<=[a-z0-9])(?=[0-9]?[A-Z])/', '-', $module)
			)
		));
	}
	
	protected function getLibraryScripts()
	{
		global $wpgmza;
		
		$plugin_dir_url = plugin_dir_url(__DIR__);
		
		$libraryDependencies = array(
			'datatables'		=> '//cdn.datatables.net/v/dt/dt-1.10.16/datatables.js',
			'jquery-cookie'		=> $plugin_dir_url . 'lib/jquery-cookie.js',
			'modernizr-custom'	=> $plugin_dir_url . 'lib/modernizr-custom.js',
			'remodal'			=> $plugin_dir_url . 'lib/' . ($wpgmza->isUsingMinifiedScripts() ? 'remodal.min.js' : 'remodal.js'),
			'resize-sensor'		=> $plugin_dir_url . 'lib/ResizeSensor.js',
			'spectrum'			=> $plugin_dir_url . 'lib/spectrum.js'
		);
		
		if($wpgmza->isProVersion())
		{
			$pro_dir = plugin_dir_url(WPGMZA_PRO_FILE);
			
			$libraryDependencies = array_merge($libraryDependencies, array(
				'jstree'				=> $pro_dir . ($wpgmza->isUsingMinifiedScripts() ? 'lib/jstree.min.js' : 'lib/jstree.js'),
				'jszip'					=> $pro_dir . 'lib/jszip.min.js',
				'jquery-multiselect'	=> $pro_dir . 'lib/jquery.multiselect.js',
				'owl-carousel'			=> $pro_dir . 'lib/owl.carousel.min.js'
			));
		}
		
		if($wpgmza->getCurrentPage() && is_admin())
		{
			wp_enqueue_script('jquery-ui-core');
			wp_enqueue_script('jquery-ui-dialog');
			wp_enqueue_script('jquery-ui-slider');
			wp_enqueue_script('jquery-ui-tabs');
			wp_enqueue_script('jquery-ui-progressbar');
			wp_enqueue_script('jquery-ui-accordion');
			wp_enqueue_script('jquery-ui-sortable');
			wp_enqueue_script('jquery-ui-draggable');
		}
		
		return apply_filters('wpgmza-get-library-dependencies', $libraryDependencies);
	}
	
	protected function getScanDirectories()
	{
		$result = array(
			plugin_dir_path(__DIR__) . 'js/v8' => plugin_dir_url(__DIR__) . 'js/v8'
		);
		
		if($this->proMode)
			$result[plugin_dir_path(WPGMZA_PRO_FILE) . 'js/v8'] = plugin_dir_url(WPGMZA_PRO_FILE) . 'js/v8';
		
		return $result;
	}
	
	protected function scanDependencies()
	{
		$this->scripts = array();
		
		$directories = $this->getScanDirectories();
		
		$files = array();
		
		$this->log("Scanning dependencies");
		
		foreach($directories as $dir => $path)
		{
			$pro_directory = (preg_match('/-pro/', $dir) ? true : false);
			$files = $this->rglob("$dir/*.js");
		
			foreach($files as $file)
			{
				if(preg_match('/combined\.js|min\.js$/', $file))
					continue;
				
				$this->log("Reading $file");
				
				$contents = file_get_contents($file);
				
				if(!preg_match('/^\/\*\*.+?\*\//s', $contents, $m))
					continue;
				
				$header = $m[0];
				
				// Read module name
				if(!preg_match('/@module\s+(.+)/', $header, $m))
					continue;
				
				$module = trim($m[1]);
				
				$handle = $this->getHandleFromModuleName($module);
				if($handle != 'wpgmza')
					$handle = 'wpgmza-' . $handle;
				
				$dependencies = array();
				
				$this->log("Found $handle");
				
				if(preg_match_all('/@(pro-)?requires (.+)/', $header, $m))
				{
					$len = count($m[0]);
					
					for($i = 0; $i < $len; $i++)
					{
						$pro = !empty($m[1][$i]);

						$dependencyModule = $m[2][$i];
						
						$dependencyHandle = preg_replace('/^wpgmza\./',
							'wpgmza-',
							$this->getHandleFromModuleName($dependencyModule)
						);
						
						if(!$pro)
						{
							$this->log("Adding dependency $dependencyHandle");
							$dependencies[] = $dependencyHandle;
						}
						else if($this->proMode)
						{
							$this->log("Adding Pro dependency $dependencyHandle");
							$dependencies[] = $dependencyHandle;
						}
					}
				}
				
				$src = str_replace($dir, 'js/v8', $file);
				
				$this->scripts[$handle] = (object)array(
					'src'			=> $src,
					'pro'			=> $pro_directory,
					'dependencies'	=> $dependencies
				);
			}
		}
		
		file_put_contents($this->scriptsFileLocation, json_encode($this->scripts, JSON_PRETTY_PRINT));
	}
	
	public function getCombineOrder()
	{
		if(!$this->scripts)
			$this->scanDependencies();
		
		$iterations = 0;
		$scripts = (array)(clone (object)$this->scripts);
		$includedHandles = array();
		$combineOrder = array();
		
		while(!empty($scripts))
		{
			if(++$iterations > 100000)
			{
				echo "Dumping included handles\r\n";
				var_dump($includedHandles);
				
				echo "Dumping remaining scripts\r\n\r\n";
				var_dump($scripts);
				
				throw new \Exception('Iteration limit hit possibly due to dependency recusion or unresolved dependencies');
			}
			
			foreach($scripts as $handle => $script)
			{
				// echo "Looking at $handle\r\n";
				
				foreach($script->dependencies as $dependency)
					if($dependency != 'wpgmza_api_call' && array_search($dependency, $includedHandles) === false)
					{
						// echo "Dependency $dependency not included yet\r\n";
						continue 2;
					}
					
				// echo "Adding $handle ({$script->src})\r\n";
				
				$combineOrder[] = $script->src;
				$includedHandles[] = $handle;
				unset($scripts[$handle]);
				
				break;
			}
		}
		
		return $combineOrder;
	}
	
	public function buildCombinedFile()
	{
		global $wpgmza;
		
		$order = $this->getCombineOrder();
		$combined = array();
		$dest = plugin_dir_path(($this->proMode ? WPGMZA_PRO_FILE : __DIR__)) . 'js/v8/wp-google-maps' . ($this->proMode ? '-pro' : '') . '.combined.js';
		
		foreach($order as $file)
		{
			if(preg_match('/\.(combined|min)\.js$/', $file))
				continue;

			$src = plugin_dir_path(__DIR__) . $file;
			
			if(!file_exists($src))
				$src = plugin_dir_path(WPGMZA_PRO_FILE) . $file;
			
			$contents = "\r\n// $file\r\n" . file_get_contents($src);
			$combined[] = $contents;
		}
		
		$combined = implode("\r\n", $combined);
		
		if(md5(file_get_contents($dest)) == md5($combined))
			return;	// No changes, no need to build
		
		file_put_contents($dest, $combined);
	}
	
	public function build()
	{
		$this->scanDependencies();
		$this->buildCombinedFile();
	}
	
	public function enqueueStyles()
	{	
		global $wpgmza;
	
		//wp_enqueue_style('wpgmza_v7_style', plugin_dir_url(__DIR__) . 'css/v7-style.css');
		//wp_enqueue_style('wpgmza_v7_admin_style', plugin_dir_url(__DIR__) . 'css/wp-google-maps-admin.css');
		
		wp_enqueue_style('wpgmza-color-picker', plugin_dir_url(__DIR__) . 'lib/spectrum.css');
		wp_enqueue_style('datatables', '//cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css');
		
		wp_enqueue_style('remodal', plugin_dir_url(__DIR__) . 'lib/remodal.css');
		wp_enqueue_style('remodal-default-theme', plugin_dir_url(__DIR__) . 'lib/remodal-default-theme.css');

		wp_register_style('fontawesome', plugin_dir_url(__DIR__) . 'css/font-awesome.min.css');
		wp_enqueue_style('fontawesome');
		
		// wp_enqueue_style('animate-css', plugin_dir_url(__DIR__) . 'css/animate.css');
	
		if(!empty(Plugin::$settings->custom_css))
			wp_add_inline_style('wpgmza_v7_style', Plugin::$settings->custom_css);
		
		if($wpgmza->isProVersion())
		{
			wp_enqueue_style('wpgmza_v7_pro_admin_style', plugin_dir_url(WPGMZA_PRO_FILE) . 'css/v7-pro-style.css');
		
			if(empty(Plugin::$settings->use_legacy_html))
				wp_enqueue_style('wpgmza-v7-non-legacy-html-style', plugin_dir_url(WPGMZA_PRO_FILE) . 'css/non-legacy-html.css');
		}
	}
	
	public function enqueueScripts()
	{
		global $wpgmza;
		
		// Get library scripts
		$libraries = $this->getLibraryScripts();
		
		// Enqueue Google API call if necessary
		switch($wpgmza->settings->engine)
		{
			case 'google-maps':
				$loader = ($wpgmza->isProVersion() ? new GoogleProMapsLoader() : new GoogleMapsLoader());
				$loader->loadGoogleMaps();
				break;
				
			default:
				$loader = new OSMLoader();
				$loader->loadOpenStreetMap();
				break;
		}
		
		// Enqueue library scripts first
		foreach($libraries as $handle => $src)
			wp_enqueue_script($handle, $src, array('jquery'));
		
		if($wpgmza->isUsingMinifiedScripts())
		{
			$dir = ($this->proMode ? plugin_dir_path(WPGMZA_PRO_FILE) : plugin_dir_path(__DIR__));
			
			$combined = 'js/v8/wp-google-maps' . ($this->proMode ? '-pro' : '') . '.combined.js';
			$minified = 'js/v8/wp-google-maps' . ($this->proMode ? '-pro' : '') . '.min.js';
			
			$src = $minified;
			
			$delta = filemtime($dir . $combined) - filemtime($dir . $minified);
			
			if($delta > 0)
			{
				$src = $combined;
				
				/*add_action('admin_notices', function() {
					echo '<p class="notice notice-warning">' .
						__('WP Google Maps: Minified script is out of date, using combined script instead.', 'wp-google-maps') .
					'</p>';
				});*/
			}
			
			$this->scripts = array('wpgmza' => 
				(object)array(
					'src'	=> $src,
					'pro'	=> $this->proMode
				)
			);
		}
		else
		{
			// Enqueue core object with library dependencies
			$this->scripts = (array)json_decode(file_get_contents($this->scriptsFileLocation));
		}
		
		// Give the core script library dependencies
		$dependencies = array_keys($libraries);
		
		if(is_admin())
			$dependencies[] = 'wpgmaps_admin_core';
		else
			$dependencies[] = 'wpgmza_api_call';
		
		$this->scripts['wpgmza']->dependencies = $dependencies;
		
		// Enqueue other scripts
		foreach($this->scripts as $handle => $script)
		{
			$fullpath = plugin_dir_url(($script->pro ? WPGMZA_PRO_FILE : __DIR__)) . $script->src;
			
			wp_enqueue_script($handle, $fullpath, $script->dependencies);
		}
		
		// Enqueue localized data
		$this->enqueueLocalizedData();
		//$this->enqueueTourData();
		//$this->enqueueCustomJavascript();
	}
	
	public function enqueueLocalizedData()
	{
		global $wpgmza;
		
		$data = $wpgmza->getLocalizedData();
		
		/*$localized_strings = $data->localized_strings;
		
		foreach($localized_strings as $key => $value)
			$localized_strings[$key] = apply_filters("wpgmza_{$key}_text", $value);
			
		$data->localized_strings = $localized_strings;*/
		
		wp_localize_script('wpgmza', 'WPGMZA_localized_data', (array)$data);
	}
	
	public function enqueueTourData()
	{
		require_once(plugin_dir_path(__DIR__) . 'php/class.tour.php');
		
		$data = Tour::getData();
		
		wp_enqueue_style('hopscotch', plugin_dir_url(__DIR__) . 'lib/hopscotch/css/hopscotch.min.css');
		wp_enqueue_script('hopscotch', plugin_dir_url(__DIR__) . 'lib/hopscotch/js/v8/hopscotch.js');

		wp_localize_script('wpgmza', 'wpgmza_tour_data', $data);
	}
	
	public function enqueueCustomJavascript()
	{
		if(empty(Plugin::$settings->custom_js))
			return;
		
		$customDependencies = null;
		
		if(!empty(Plugin::$settings->custom_js_dependencies))
			$customDependencies = array_map('trim', 
				explode(',', Plugin::$settings->custom_js_dependencies)
			);
		
		wp_add_inline_script('wpgmza', Plugin::$settings->custom_js, $customDependencies);
	}
}


