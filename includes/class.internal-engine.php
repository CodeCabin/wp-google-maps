<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class InternalEngine {
	const LEGACY = "legacy";
	const ATLAS_NOVUS  = "atlas-novus";
	const ATLAS_MAJOR  = "atlas-major";

	const RAND_PROB_FACTOR = 0.7;

	private $engine;
	private $baseUrl;
	private $baseDir;
	private $styleDir;
	private $templateDir;

	private $baseDirOverride;

	/**
	 * Constructor
	 */
	public function __construct($engine = false){
		$this->engine = self::validateEngine($engine);
		$this->baseUrl = rtrim(WPGMZA_PLUGIN_DIR_URL, '/');
		$this->baseDir = rtrim(WPGMZA_PLUGIN_DIR_PATH, '/');
		$this->styleDir = "css";
		$this->templateDir = "html";

		$this->baseDirOverride = false;

		$this->hooks();
	}

	/**
	 * Register hooks for the internal engine
	 * 
	 * @return void
	 */
	public function hooks(){
		add_filter('wpgmza_internal_engine_template_path', array($this, 'getThemeOverrides'), 10, 3);
	}

	/**
	 * Get the current internal engine.
	 *
	 * Returns the EFFECTIVE engine after compatibility checks. If the user
	 * has Atlas Major selected but the active Pro add-on is too old (see
	 * ProAtlasMajorCompatibility), this returns Atlas Novus instead so
	 * template/CSS/JS path resolution falls back cleanly across the board.
	 * The stored setting is unchanged — Atlas Major resumes automatically
	 * when Pro is updated.
	 *
	 * @return string
	 */
	public function getEngine(){
		if($this->engine === self::ATLAS_MAJOR
			&& class_exists('\WPGMZA\ProAtlasMajorCompatibility')
			&& \WPGMZA\ProAtlasMajorCompatibility::isProIncompatible()){
			return self::ATLAS_NOVUS;
		}
		return $this->engine;
	}

	/**
	 * Get the raw stored engine, ignoring any compatibility-based fallbacks.
	 * Use this only when you specifically need the user's saved preference
	 * (e.g. UI rendering of the engine picker, persistence). For all asset
	 * loading and feature gating use getEngine() / isAtlasMajor().
	 *
	 * @return string
	 */
	public function getStoredEngine(){
		return $this->engine;
	}

	/**
	 * Check if the user is running legacy engine
	 *
	 * @return bool
	 */
	public function isLegacy(){
		return $this->getEngine() === self::LEGACY;
	}

	/**
	 * Check if the user is running Atlas Major engine.
	 *
	 * Reads the EFFECTIVE engine via getEngine(), which already applies
	 * the ProAtlasMajorCompatibility fallback. If Atlas Major is selected
	 * but Pro is too old, getEngine() returns Atlas Novus and this
	 * returns false naturally — no separate compat check needed here.
	 *
	 * @return bool
	 */
	public function isAtlasMajor(){
		return $this->getEngine() === self::ATLAS_MAJOR;
	}

	/**
	 * Get the build code for the current version combination 
	 * 
	 * It's important to note that this is not the same as getting the version of the plugin, as this instead is a coded build number with more details such as
	 * engine name codes, and total build trails 
	 * 
	 * It is not reliant on any one plugin to function, which is why it lives in the InternalEngine class specifically. Probably shouldn't be used for file versions or anything like that 
	 * 
	 * @return string
	 */
	public function getBuildVersion(){
		global $wpgmza, 
			$wpgmza_version, $wpgmza_pro_version, 
			$wpgmza_gold_version, $wpgmza_ugm_version;

		/* Using the globals let's register each of the build params */
		$versions = array(
			'basic' => $wpgmza_version,
			'pro' => $wpgmza_pro_version,
			'gold' => $wpgmza_gold_version,
			'vgm' => $wpgmza_ugm_version,
		);

		/* Developer Hook (Filter) - Alter version number array/tags */
		$versions = apply_filters("wpgmza_internal_engine_build_version_plugins", $versions);
		
		$buildCodes = array();
		foreach($versions as $slug => $version){
			if(!empty($version)){
				$tag = strtoupper(substr($slug, 0, 1));
				$buildCodes[] = "{$tag}.{$version}";
			}
		}

		$buildCodes = implode("::", $buildCodes);

		$flags = array();
		
		/* Create a tag from the build name */
		$engine =  strtoupper(substr($this->getEngine(), 0, 1));
		$flags[] = $engine;

		/* Flag for map engine */
		if(!empty($wpgmza->settings->wpgmza_maps_engine)){
			$mapEngine = strtoupper(substr($wpgmza->settings->wpgmza_maps_engine, 0, 1));
			$flags[] = $mapEngine;
		}
		
		/* Flag if dev mode */
		$isDevMode = !empty($wpgmza) && $wpgmza->isInDeveloperMode() ? true : false;
		if($isDevMode){
			$flags[] = "D";
		}


		/* Developer Hook (Filter) - Add or alter plugin build flags */
		$flags = apply_filters("wpgmza_internal_engine_build_version_flags", $flags);
		$flags = implode(".", $flags);

		/* Developer Hook (Filter) - Add or alter final build code string */
		$buildString = apply_filters("wpgmza_internal_engine_build_version", "{$buildCodes}::{$flags}");

		return $buildString;
	}

	/**
	 * Get a path to a stylesheet, based on build 
	 * 
	 * @return string
	 */
	public function getStylesheet($path){
		return $this->compilePath($this->baseUrl, $this->styleDir, $path);
	}

	/**
	 * Get a path to a template file, based on build
	 */
	public function getTemplate($path, $baseOverride = false){
		if(!empty($baseOverride)){
			$this->setBaseDir($baseOverride);
		}

		$template = $this->compilePath($this->getBaseDir(), $this->templateDir, $path);

		$this->unsetBaseDir();

		/* Developer Hook (Filter) - Used to override the path to a template file */
		return apply_filters('wpgmza_internal_engine_template_path', $template, $path, $baseOverride);
	}

	/**
	 * Get button class based on build 
	 * 
	 * Legacy buttons are different from the refactor 
	 * 
	 * @param string $default The default tag class
	 * 
	 * @return string
	 */
	public function getButtonClass($default){
		if($this->engine !== self::LEGACY){
			return "wpgmza-{$default}";
		}

		return $default;
	}

	/**
	 * Get documentation link based on the engine
	 * 
	 * You must provide both an experimental link, and a stable link, and based on the current engine
	 * this function returns the relevant link, effectively hot-swapping based on the engine
	 * 
	 * If no secondary link is provided, the first will be used instead
	 * 
	 * @param string $expLink The experimental documentation link (atlas novus)
	 * @param string $stableLink The stable documentation link (legacy)
	 * 
	 * @return string
	 */
	public function getDocLink($expLink, $stableLink = false){
		if(!empty($stableLink)){
			if($this->engine === self::LEGACY){
				/* Return the stable link instead */
				return $stableLink;
			}
		}

		return !empty($expLink) ? $expLink : "";
	}

	/**
	 * Allows template files to be overridden by the users theme 
	 * 
	 * We recommend placing these within a child theme location like:
	 * - /theme/wp-google-maps/example.html.php
	 * 
	 * This will them automatically override the internal templating directory and allows for further customization
	 * 
	 * Doing this will allow the plugin to update, while still retaining your customized user interface (Store Locator etc)
	 * 
	 * @param string $template The current template path
	 * @param string $path The initial path (filename) passed into the call
	 * @param string $baseOverride The override base directory, not needed in this example, but useful for determining if it is a pro file
	 * 
	 * @return string
	 */
	public function getThemeOverrides($template, $path, $baseOverride = false){
		try{
			$themeDir = get_stylesheet_directory();
			if(!empty($themeDir) && !empty($path)){
				if(file_exists($themeDir)){
					$overrideDir = rtrim($themeDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . "wp-google-maps";
					if(!empty($overrideDir) && file_exists($overrideDir)){
						if(file_exists($overrideDir . DIRECTORY_SEPARATOR . $path)){
							return $overrideDir . DIRECTORY_SEPARATOR . $path;
						}
					}
				}
			}
		} catch (\Exception $ex){

		} catch (\Error $err){
			
		}
		return $template;
	}

	/**
	 * Get base directory, allowing Pro to use basic method for pathing 
	 * 
	 * @return string
	 */
	public function getBaseDir(){
		if(!empty($this->baseDirOverride)){
			return $this->baseDirOverride;
		}
		return $this->baseDir;
	}

	/**
	 * Set override for the base directory 
	 * 
	 * @param string $baseDirOverride The new base directory 
	 * 
	 * @return void
	 */
	private function setBaseDir($baseDirOverride){
		$this->baseDirOverride = rtrim($baseDirOverride, '/');
	}

	/**
	 * Unset, or reset the base directory for the system 
	 * 
	 * @return void 
	 */
	private function unsetBaseDir(){
		$this->baseDirOverride = false;
	}
	
	/**
	 * Compile the full bath to a file, based on engine and caller 
	 * 
	 * @param string $base The base directory to use 
	 * @param string $type The type of resource 
	 * @param string $file The filename to be loaded
	 * 
	 * @return string 
	 */
	private function compilePath($base, $type, $file){
		/* Use the effective engine (getEngine()), which applies the
		   ProAtlasMajorCompatibility fallback. This ensures template
		   paths resolve to atlas-novus when Atlas Major is selected
		   but Pro is too old to support it. */
		$effectiveEngine = $this->getEngine();
		$compiled = array(
			'base' => $base,
			'type' => $type,
			'engine' => $effectiveEngine,
			'file' => $file
		);

		if(empty($effectiveEngine) || $effectiveEngine === self::LEGACY){
			unset($compiled['engine']);
		}

		if(!$this->validatePath($compiled)){
			if(!empty($compiled['engine'])){
				/* Try the fallback engine before going to legacy */
				$fallback = $this->getFallbackEngine();
				if(!empty($fallback)){
					$compiled['engine'] = $fallback;
					if(!$this->validatePath($compiled)){
						unset($compiled['engine']);
					}
				} else {
					unset($compiled['engine']);
				}
			}
		}
		return $this->buildPath($compiled);
	}

	/**
	 * Get the fallback engine for the current engine
	 *
	 * Atlas Major falls back to Atlas Novus, allowing templates to be
	 * inherited without duplication. Only templates that differ need
	 * to be created in the atlas-major directory.
	 *
	 * @return string|null The fallback engine name, or null if none
	 */
	private function getFallbackEngine(){
		switch($this->getEngine()){
			case self::ATLAS_MAJOR:
				return self::ATLAS_NOVUS;
			default:
				return null;
		}
	}

	/**
	 * Build the path based on parts generated by the compilePath method (in most cases)
	 * 
	 * @param array $parts The path parts to be joined 
	 * 
	 * @return string
	 */
	private function buildPath($parts){
		return implode('/', $parts);
	}

	/**
	 * Validate a full path, by checking if the file exists
	 * 
	 * @param array $parts The path parts
	 * 
	 * @return bool
	 */
	private function validatePath($parts){
		$parts['base'] = $this->getBaseDir();
		if(file_exists($this->buildPath($parts))){
			return true;
		}
		return false;
	}

	/**
	 * Valiate engine selection 
	 * 
	 * @return string
	 */
	public static function validateEngine($engine = false){
		switch ($engine) {
			case self::LEGACY:
			case self::ATLAS_NOVUS:
			case self::ATLAS_MAJOR:
				return $engine;
			default:
				return self::getStableBuildName();
		}
	}

	/**
	 * Select a random engine, usually for installation 
	 * 
	 * This accounts for probability factors
	 * 
	 * As of 9.0.13 we use a different approach to randomizing engines, we now use days of the month instead of random ranges
	 * 
	 * @return string
	 */
	public static function getRandomEngine(){
		/* Week based split ratio - As of 9.0.24*/
		$expRange = (object) array(
			"start" => 7,
			"end" => 14
		);

		$today = intval(date('j'));
		if($today > $expRange->start && $today <= $expRange->end){
			/* Installation falls within the experimental build range (2nd week of every month, at the moment) */
			return self::getExperimentalBuildName();
		}
		return self::getDeprecatedBuildName();
	}

	/**
	 * Get the default engine to be used in all installations
	 *
	 * V9 selected a random engine for a Legacy/Novus split test (see
	 * getRandomEngine() — date-based, day-of-month gated). V10 picked
	 * Atlas Novus by default. From V10.1.01 new installs get a true
	 * 50/50 random split between Atlas Novus and Atlas Major so we keep
	 * field coverage on both UIs while Atlas Major matures.
	 *
	 * Called exactly once per install via GlobalSettings::install() →
	 * getDefaults(), gated on `!get_option('wpgmza_global_settings')`.
	 * Existing installs keep whatever `internal_engine` value they
	 * already have in the option, so only genuinely fresh installs
	 * pick up the new split.
	 *
	 * wp_rand() is the WordPress idiom over mt_rand(); both give us the
	 * one-shot coin flip we need here.
	 *
	 * @return string
	 */
	public static function getDefaultEngine(){
		return wp_rand(0, 1) === 0 ? self::ATLAS_NOVUS : self::ATLAS_MAJOR;
	}

	/**
	 * Get stable build name.
	 *
	 * V10 = Atlas Novus. V10.1 = Atlas Major (now stable).
	 *
	 * This is also the fallback validateEngine() returns for unknown /
	 * corrupted stored engine values, so it always points at whatever the
	 * current "default for everyone" engine is.
	 *
	 * @return string
	 */
	public static function getStableBuildName(){
		return self::ATLAS_MAJOR;
	}

	/**
	 * Get experimental build name, in this case atlas novus 
	 * 
	 * Note: As of V10 Atlas Novus is no longer experimental, but is considered default
	 * 
	 * @return string
	 */
	public static function getExperimentalBuildName(){
		return self::ATLAS_NOVUS;
	} 

	/**
	 * Get the last deprecated build name
	 * 
	 * Legacy since V10
	 * 
	 * @return string
	 */
	public static function getDeprecatedBuildName(){
		return self::LEGACY;
	}

}
