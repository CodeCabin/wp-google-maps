<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

// TODO: Remove, an autoloader is now used
require_once(plugin_dir_path(__FILE__) . 'google-maps/class.google-maps-loader.php');
require_once(plugin_dir_path(__FILE__) . 'open-layers/class.ol-loader.php');

/**
 * This class takes care of all mechanisms regarding script building and loading.
 *
 * When in developer mode, or when running a build script, this class will rebuilt the combined script file, in the correct order, or issue a message where dependencies are missing or circular.
 *
 * When not in developer mode, this class is simply used to enqueue the minified file, or, the combined file if that is more up to date. That can happen when changes have been made and the combined file has been re-built without the minified file being rebuilt.
 */
class ScriptLoader
{
	private static $dependencyErrorDisplayed = false;
	private static $combinedFileBlankErrorDisplayed = false;
	
	private $proMode = false;
	private $logStarted = false;
	
	/**
	 * @var object[] Objects describing each script file, where the array key is the script handle.
	 * @deprecated This is not currently for external use and may be removed.
	 */
	public $scripts;
	
	/**
	 * Constructor.
	 * @param bool $proMode Whether or not to enqueue (and optionally build) the Pro scripts.
	 * @todo This class should inherit Factory rather than using a variable to represent pro.
	 */
	public function __construct($proMode)
	{
		$this->proMode = $proMode;
		
		if($this->proMode)
			$this->scriptsFileLocation = plugin_dir_path(WPGMZA_PRO_FILE) . 'js/v8/pro-scripts.json';
		else
			$this->scriptsFileLocation = plugin_dir_path(__DIR__) . 'js/v8/scripts.json';

		if (function_exists('add_filter')) 
			add_filter('wpgmza-get-library-dependencies', array($this, 'dequeueDataTablesScript'), 10, 1);
	}
	
	/**
	 * Internal function used for logging, useful when debugging the build process. This function will erase the log for each PHP execution lifespan.
	 * @param string $str The string to log. Will be prefixed with a timestamp.
	 * @return void
	 */
	protected function log($str)
	{
		// Disabled in production. Left here for developers wishing to debug build issues.
		return;
		
		$dest = __DIR__ . '/build.log';
		
		if(!$this->logStarted)
			file_put_contents($dest, "");
		
		$this->logStarted = true;
		file_put_contents($dest, date("Y-m-d H:i:s :-\t") . $str . "\r\n", FILE_APPEND);
	}
	
	/**
	 * Recursive glob. This function is used to match files given the specified pattern, recursively.
	 * @param string $pattern The pattern to match
	 * @param int $flags Flags to pass to glob
	 * @return string[] An array of matching files.
	 * @see http://php.net/manual/en/function.glob.php
	 */
	protected function rglob($pattern, $flags = 0)
	{
		$files = glob($pattern, $flags); 
		
		foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir) {
			
			$files = array_merge($files, $this->rglob($dir.'/'.basename($pattern), $flags));
			
		}
		
		return $files;
	}
	
	/**
	 * Converts a JavaScript module name to a script handle, for instance WPGMZA.GoogleMarker will be converted to wpgmza-google-marker.
	 * @param string $module The JavaScript module name.
	 * @return string The associated script handle.
	 */
	protected function getHandleFromModuleName($module)
	{
		return trim(preg_replace('/^wpgmza\./', 'wpgmza-',
			strtolower(
				preg_replace('/(?<=[A-Za-z])(?=[A-Z][a-z])|(?<=[a-z0-9])(?=[0-9]?[A-Z])/', '-', $module)
			)
		));
	}
	
	/**
	 * This function returns an array of library scripts that the plugin depends on, where the array key is the script handle and the value is the script URL.
	 *
	 * This function will also enqueue all the required jQuery UI scripts required by our plugin as they are needed, for example on the admin pages.
	 *
	 * The result is passed through the filter wpgmza-get-library-dependencies before being returned.
	 * @return array A key value array of scripts, where the key is the handle and the value is the script URL.
	 */
	protected function getLibraryScripts()
	{
		global $wpgmza;
		
		$plugin_dir_url = plugin_dir_url(__DIR__);
		
		$minified = ($wpgmza->isUsingMinifiedScripts() ? '.min' : '');
		
		$libraryDependencies = array(
			'datatables'			=> $plugin_dir_url . "js/jquery.dataTables{$minified}.js",
			'javascript-cookie'		=> $plugin_dir_url . 'lib/jquery-cookie.js',
			'remodal'				=> $plugin_dir_url . "lib/remodal{$minified}.js",
			'spectrum'				=> $plugin_dir_url . 'lib/spectrum.js',
			
			// TODO: These are only needed if the server supports inflate
			'fast-text-encoding'	=> $plugin_dir_url . 'lib/text.min.js',
			'pako'					=> $plugin_dir_url . 'lib/pako_deflate.min.js'
		);
		
		/*if($wpgmza->isProVersion())
		{
			$pro_dir = plugin_dir_url(WPGMZA_PRO_FILE);
			
			$libraryDependencies = array_merge($libraryDependencies, array(
				$pro_dir . 'lib/pagination.min.js'
			));
		}*/
		
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
	
	/**
	 * Returns the directories to be scanned for JavaScript files.
	 * @return array An array of directories, where the keys and values match.
	 */
	protected function getScanDirectories()
	{
		$result = array(
			plugin_dir_path(__DIR__) . 'js/v8' => plugin_dir_url(__DIR__) . 'js/v8'
		);
		
		if($this->proMode)
			$result[plugin_dir_path(WPGMZA_PRO_FILE) . 'js/v8'] = plugin_dir_url(WPGMZA_PRO_FILE) . 'js/v8';
		
		return $result;
	}
	
	/**
	 * This function performs the following actions:
	 *
	 * - Scans the relevant directories for all JavaScript files.
	 * - Reads the comment header from each JavaScript file.
	 * - Converts each found module name to a script handle, and records it in $this->scripts with the handle as the key, the source file and dependencies as the value.
	 * @return void
	 */
	protected function scanDependencies()
	{
		$this->scripts = array();
		
		$directories = $this->getScanDirectories();
		
		$files = array();
		$this->dependenciesByHandle = array();
		
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
				
				if(!preg_match('/\/\*\*.+?\*\//s', $contents, $m))
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
				
				if(empty($this->dependenciesByHandle[$handle]))
					$this->dependenciesByHandle[$handle] = array();
				
				$this->dependenciesByHandle[$handle][] = $file;
				
				$this->scripts[$handle] = (object)array(
					'src'			=> $src,
					'pro'			=> $pro_directory,
					'dependencies'	=> $dependencies
				);
			}
		}
		
		file_put_contents($this->scriptsFileLocation, json_encode($this->scripts, JSON_PRETTY_PRINT));
	}
	
	/**
	 * This function performs the following actions:
	 *
	 * - Takes a snapshot of $this->scripts, we'll call this the pending queue
	 * - Creates an empty list, we'll call this the combine order queue
	 * - For each script in the pending queue, if the scripts dependencies are satisfied, the script is moved off the pending queue and onto the back of the combine order queue
	 * 
	 * This process is repeated until either the pending queue is empty, or a built in iteration limit is hit. When the iteration limit is hit, this usually indicates either missing dependencies or circular dependencies. A notice will be issued when this happens.
	 *
	 * You must call scanDependencies before getCombineOrder.
	 * @note As the plugin becomes increasingly complex, the 100,000 iteration limit may give false positives.
	 * @return object[] An indexed array of script objects, in the order that they must be combined in to respect their dependencies.
	 */
	public function getCombineOrder()
	{
		if(!$this->scripts)
			$this->scanDependencies();
		
		$iterations = 0;
		$scripts = (array)(clone (object)$this->scripts);
		$includedHandles = array();
		$combineOrder = array();
		
		$ignoreDependencyHandles = array(
			'wpgmza_api_call'
		);
		$unresolvedDependencyHandles = array();
		
		while(!empty($scripts))
		{
			if(++$iterations > 100000)
			{
				if(!ScriptLoader::$dependencyErrorDisplayed)
				{
					?>
					<div class="notice notice-error">
						<p>
							WP Google Maps: Build failed. Dumping unresolved dependencies
						</p>
						
						<?php
							echo "<pre>";
							foreach($unresolvedDependencyHandles as $handle => $reference)
							{
								echo "$handle (in " . implode(', ', $this->dependenciesByHandle[$handle]) . ")\r\n";
								echo "Requires:\r\n" . implode("\r\n", $reference);
								echo "\r\n";
							}
							echo "</pre>";
						?>
						
						<p>
							Are you debugging or developing WP Google Maps? If not, please disable developer mode in Maps &rarr; Settings &rarr; Advanced to remove this notice.
						</p>
					</div>
					<?php
					
					ScriptLoader::$dependencyErrorDisplayed = true;
				}
				
				return array();
			}
			
			foreach($scripts as $handle => $script)
			{
				 //echo "\r\nLooking at $handle\r\n";
				
				foreach($script->dependencies as $dependency)
				{
					// Ignored handles (eg API call)
					if(array_search($dependency, $ignoreDependencyHandles) !== false)
					{
						//echo "Ignoring dependency $dependency\r\n";
						continue;
					}
					
					// Already included handles
					if(array_search($dependency, $includedHandles) !== false)
					{
						//echo "Already included $dependency\r\n";
						continue;
					}
					
					// External handles not handled by us. This module only handles internal dependencies
					if(!preg_match('/^wpgmza-/i', $dependency) && $dependency != 'wpgmza')
					{
						//echo "Ignoring external handle $dependency\r\n";
						continue;
					}
					
					if(empty($unresolvedDependencyHandles[$handle]))
						$unresolvedDependencyHandles[$handle] = array();
					$unresolvedDependencyHandles[$handle][$dependency] = $dependency;
					
					//echo "$dependency not yet included, skipping\r\n";
					continue 2;
				}
				
				//echo "Adding $handle ({$script->src})\r\n";
				
				$combineOrder[] = $script->src;
				$includedHandles[] = $handle;
				
				unset($scripts[$handle]);
				unset($unresolvedDependencyHandles[$handle]);
				
				break;
			}
		}
		
		return $combineOrder;
	}
	
	/**
	 * Builds all the plugin scripts into a combined (concatenated) string. The function will then check if the md5 hash of the existing combined script file matches the hash of the string in memory. If they match, the combined file is up to date and is left untouched. If they do not match, the combined file is updated.
	 * @return void
	 */
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
		
		if(file_exists($dest) && md5(file_get_contents($dest)) == md5($combined))
			return;	// No changes, leave the file alone. Updating the file would cause the combined script to be newer than the minified script
		
		if(empty($combined))
		{
			if(function_exists('add_action'))
			{
				if(!ScriptLoader::$combinedFileBlankErrorDisplayed)
				{
					add_action('admin_notices', function() {
						?>
						<div class='notice notice-error'>
							<?php
							_e("
							<p>
								<strong>WP Google Maps:</strong> Failed to build combined script file, the resulting file would be blank.
							</p>
							<p>
								<strong>Developers:</strong> Please check that the file is writable and that all script dependencies are resolved.
							</p>
							<p>
								<strong>Users:</strong> Please disable \"Developer Mode\" in Maps &rarr; Settings &rarr; Advanced.
							</p>
							");
							?>
						</div>
						<?php
					});
					
					ScriptLoader::$combinedFileBlankErrorDisplayed = true;
				}
			}
			else
				throw new \Exception('Combined file would be blank.');
		}
		
		file_put_contents($dest, $combined);
	}
	
	/**
	 * This function performs a full rebuild of the combined script file
	 * @return void
	 */
	public function build()
	{
		$this->scanDependencies();
		$this->buildCombinedFile();
	}
	
	/**
	 * Enqueues all required stylesheets
	 * @return void
	 */
	public function enqueueStyles()
	{	
		global $wpgmza;
	
		// wp_enqueue_style('wpgmza-color-picker', plugin_dir_url(__DIR__) . 'lib/spectrum.css');
		// wp_enqueue_style('datatables', '//cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css');
		
		wp_enqueue_style('wpgmza-common', plugin_dir_url(__DIR__) . 'css/common.css');
		wp_enqueue_style('remodal', plugin_dir_url(__DIR__) . 'lib/remodal.css');
		wp_enqueue_style('remodal-default-theme', plugin_dir_url(__DIR__) . 'lib/remodal-default-theme.css');
	}
	
	/**
	 * Returns an array of objects representing all scripts used by the plugin. In developer mode, this will be one script for each module, when not in developer mode, this will either be the combined or minified file, dependeing on which is more up to date.
	 * @return object[] An array of objects representing the scripts.
	 */
	public function getPluginScripts()
	{
		global $wpgmza;
		
		if(!$wpgmza->isInDeveloperMode())
		{
			$dir = ($this->proMode ? plugin_dir_path(WPGMZA_PRO_FILE) : plugin_dir_path(__DIR__));
			
			$combined = 'js/v8/wp-google-maps' . ($this->proMode ? '-pro' : '') . '.combined.js';
			$minified = 'js/v8/wp-google-maps' . ($this->proMode ? '-pro' : '') . '.min.js';
			
			$src = $minified;
			
			$minified_file_exists = file_exists($dir . $minified);
			
			if($minified_file_exists)
				$delta = filemtime($dir . $combined) - filemtime($dir . $minified);
			
			if(!$minified_file_exists || $delta > 0)
				$src = $combined;
			
			// TODO: Remove this, fix errors
			// $src = $combined;
			
			$scripts = array('wpgmza' => 
				(object)array(
					'src'	=> $src,
					'pro'	=> $this->proMode
				)
			);
		}
		else
		{
			// Enqueue core object with library dependencies
			$scripts = (array)json_decode(file_get_contents($this->scriptsFileLocation));
		}
		
		return $scripts;
	}
	
	/**
	 * Enqueues all the libraries required by the plugin scripts, then enqueues the plugin scripts and localized data (JavaScript globals).
	 * @return void
	 */
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
				$loader = new OLLoader();
				$loader->loadOpenLayers();
				break;
		}
		
		// Enqueue library scripts first
		foreach($libraries as $handle => $src)
		{
			wp_enqueue_script($handle, $src, array('jquery'));
		}
		
		// FontAwesome?
		$version = (empty($wpgmza->settings->use_fontawesome) ? '4.*' : $wpgmza->settings->use_fontawesome);
		
		switch($version)
		{
			case 'none':
				break;
				
			case '5.*':
				wp_enqueue_style('fontawesome', 'https://use.fontawesome.com/releases/v5.0.9/css/all.css');
				
				// If we're not in admin, break. If we are, continue and enqueue FA 4 which is used by the map edit page
				if(!is_admin())
					break;
				
			default:
				wp_enqueue_style('fontawesome', plugin_dir_url(__DIR__) . 'css/font-awesome.min.css');
				break;
		}
		
		// Scripts
		$this->scripts = $this->getPluginScripts();
		
		// Give the core script library dependencies
		$dependencies = array_keys($libraries);
		
		// Sometimes we need to load the plugin JS files but not the maps API. The following code stops the API being loaded as a dependency of the plugin JS files when that is the case.
		$apiLoader = new GoogleMapsAPILoader();
		if($apiLoader->isIncludeAllowed())
			$dependencies[] = 'wpgmza_api_call';
		
		$this->scripts['wpgmza']->dependencies = $dependencies;
		
		$version_string = $wpgmza->getBasicVersion();
		if(method_exists($wpgmza, 'getProVersion'))
			$version_string .= '+pro-' . $wpgmza->getProVersion();
		
		// Enqueue other scripts
		foreach($this->scripts as $handle => $script)
		{
			$fullpath = plugin_dir_url(($script->pro ? WPGMZA_PRO_FILE : __DIR__)) . $script->src;
			
			wp_enqueue_script($handle, $fullpath, $script->dependencies, $version_string);
		}
		
		// Enqueue localized data
		$this->enqueueLocalizedData();
		//$this->enqueueTourData();
		//$this->enqueueCustomJavascript();
	}
	
	/**
	 * Enqueues the plugins localized data, as fetched from Plugin::getLocalizedData
	 * @return void
	 */
	public function enqueueLocalizedData()
	{
		global $wpgmza;
		
		$data = $wpgmza->getLocalizedData();

		wp_localize_script('wpgmza', 'WPGMZA_localized_data', $data);
	}

	/**
	 * Dequeues the datatables if the setting is enabled
	 * @return array
	 */
	public function dequeueDataTablesScript($dep)
	{
		global $wpgmza;

		if (!empty($wpgmza->settings->wpgmza_do_not_enqueue_datatables)) 
		{
			if (!empty($dep['datatables'])) 
			{
				unset($dep['datatables']);
			}
		}

		return $dep;
	}
}
