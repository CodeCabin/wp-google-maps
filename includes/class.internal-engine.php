<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class InternalEngine {
	const LEGACY = "legacy";
	const ATLAS_NOVUS  = "atlas-novus";

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
	}

	/**
	 * Get the current internal engine 
	 * 
	 * @return string
	 */
	public function getEngine(){
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

		return $template;
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
		$compiled = array(
			'base' => $base,
			'type' => $type,
			'engine' => $this->engine,
			'file' => $file
		);

		if(empty($this->engine) || $this->engine === self::LEGACY){
			unset($compiled['engine']);
		}

		if(!$this->validatePath($compiled)){
			if(!empty($compiled['engine'])){
				unset($compiled['engine']);
			}
		} 
		return $this->buildPath($compiled);
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
		/* Standard split ratio approach, not in use as of 9.0.24 */
		/*
		$today = intval(date('j'));
		$days = intval(date('t'));

		$rFact = $today / $days;

		if($rFact <= self::RAND_PROB_FACTOR){
			return self::getExperimentalBuildName();
		}
		return self::getStableBuildName();
		*/

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
		return self::getStableBuildName();
	}

	/**
	 * Get stable build name, in this case legacy 
	 * 
	 * @return string
	 */
	public static function getStableBuildName(){
		return self::LEGACY;
	}

	/**
	 * Get experimental build name, in this case atlas novus 
	 * 
	 * @return string
	 */
	public static function getExperimentalBuildName(){
		return self::ATLAS_NOVUS;
	} 

}
