<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class SystemInfo {
	const TYPE_INI = 0;
	const TYPE_CONST = 1;
	const TYPE_PROP = 2;

	public function __construct(){
		$this->info = (object) array();
		$this->analyze();
	}

	public function analyze(){
		$propMap = $this->getInfoMap();
		foreach($propMap as $prop => $type){
			$tag = strtolower($prop);
			$this->info->{$tag} = $this->read($prop, $type);
		}
	}

	public function compile(){
		$items = array();
		foreach($this->info as $prop => $value){
			/* This could be more elegant for sure */
			$title = str_replace(array("php", "mysql", "PHP_os", "vars", "_"), array("PHP", "MySQL", "PHP_OS", "Variables", " "), $prop);
			$title = ucwords($title);
			$items[] = "{$title}: $value";
		}

		/* Developer Hook (Filter) - Modify system info items */
		$items = apply_filters("wpgmza_system_info_compile_items", $items);

		return !empty($items) ? implode("\n", $items) : "No information found...";
	}

	public function read($prop, $type){
		global $wpgmza;

		$value = false;
		try{
			if($type === self::TYPE_INI){
				$value = ini_get($prop);
			} else if ($type === self::TYPE_CONST){
				if(defined($prop)){
					$value = constant($prop);
				}
			} else if ($type === self::TYPE_PROP){
				switch($prop){
					case "MYSQL_VERSION":
						global $wpdb;
						$value = empty($wpdb->use_mysqli) ? mysql_get_server_info() : mysqli_get_server_info($wpdb->dbh);
						break;
					case "internal_engine":
						$value = ucwords(str_replace("-", " ", $wpgmza->internalEngine->getEngine()));
						break;
					case "build_code":
						$value = $wpgmza->internalEngine->getBuildVersion();
						break;
					case "map_engine":
						$value = ucwords(str_replace("-", " ", $wpgmza->settings->wpgmza_maps_engine));
						break;
				}
			}

			return $value;
		} catch (\Exception $ex){
			/* Silence */
		} catch (\Error $err){
			/* Silence */
		}

		return false;
	}

	public function getInfoMap(){
		return array(
			'PHP_VERSION'			=> self::TYPE_CONST,
			'PHP_OS_FAMILY'			=> self::TYPE_CONST,
			'MYSQL_VERSION'			=> self::TYPE_PROP,
			'memory_limit' 			=> self::TYPE_INI,
			'post_max_size'			=> self::TYPE_INI,
			'upload_max_filesize'	=> self::TYPE_INI,
			'max_execution_time'	=> self::TYPE_INI,
			'max_input_time'		=> self::TYPE_INI,
			'max_input_vars'		=> self::TYPE_INI,
			'build_code'			=> self::TYPE_PROP,
			'internal_engine'		=> self::TYPE_PROP,
			'map_engine'			=> self::TYPE_PROP,
		);
	}
}