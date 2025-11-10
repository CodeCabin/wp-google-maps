<?php

namespace WPGMZA;

class DynamicTranslations extends Factory{
	public $integrations; 

	public function __construct(){
		$this->integrations = array();

		add_action('init', array( $this, 'init'));
	}

	public function init(){
		if(class_exists('WPGMZA\Integration\WPMLDynamicTranslations')){
			/* Initialize WPML Dynamic translations */
			$integrations[] = Integration\WPMLDynamicTranslations::createInstance();
		}

		/* Developer Hook (Action) - Initialize additional dynamic translations */
		do_action('wpgmza_dynamic_translations_init', $this);

		$this->hook();
	}

	public function hook(){
		/* Markers/Shapes */
		add_action('wpgmza_crud_create', array($this, 'registerByType'), 10, 2);
		add_action('wpgmza_crud_update', array($this, 'registerByType'), 10, 2);
		add_action('wpgmza_crud_trash', array($this, 'deregisterByType'), 10, 1);

		add_filter('wpgmza_crud_serialize', array($this, 'fetchByType'), 10, 2);

		/* Map */
		add_action('wpgmza_map_save_before_redirect', array($this, 'registerByMap'), 10, 1);
		add_filter('wpgmza_map_data_settings_object', array($this, 'fetchByMap'), 10, 2);

		/* Settings */
		add_action('wpgmza_global_settings_before_redirect', array($this, 'registerGlobalSettings'), 10, 1);
		add_filter('wpgmza_plugin_get_localized_data_settings', array($this, 'fetchBySettings'), 10, 1);

		add_filter('wpgmza_gdpr_options', array($this, 'fetchByGDPR'), 10, 1);


		/* Developer Hook (Action) - Initialize system level hooks, like marker fetch translation loops etc */
		do_action('wpgmza_dynamic_translations_hook', $this);
	}

	public function getProviders(){
		$providers = apply_filters('wpgmza_dynamic_translations_providers', array());
		return $providers;
	}

	public function register($slug, $content){
		$slug = trim($slug);
		if(!empty($slug) && !empty($content)){
			/* Trigger all integrations to register a translation */
			do_action('wpgmza_dynamic_translations_register', $slug, $content);
		}
	}

	public function deregister($slug){
		$slug = trim($slug);
		if(!empty($slug)){
			/* Trigger all integrations to deregister a translation */
			do_action('wpgmza_dynamic_translations_deregister', $slug);
		}
	}

	public function fetch($slug, $default = ''){
		/* Trigger all integrations to fetch a translation */
		$translation = apply_filters('wpgmza_dynamic_translations_fetch', $default, $slug);
		return !empty($translation) ? $translation : $default;
	}

	public function registerByType($instance, $columns = false){
		if(!empty($instance)){
			if(!empty($instance->id)){
				$slugPrefix = $this->getSlugPrefix($instance);
				$supportedFields = $this->getSupportedFields($instance);
				if(!empty($slugPrefix) && !empty($supportedFields)){
					foreach($supportedFields as $fieldName){
						if(!empty($instance->{$fieldName})){
							/* Check if the crud class is targeting a specific column */
							if(!empty($columns) && is_array($columns)){
								if(!in_array($fieldName, $columns)){
									continue;
								}
							}

							/* This is a supported field and field name */
							if($this->shouldIgnoreField($instance->{$fieldName})){
								continue;
							}

							$this->register("{$slugPrefix}{$fieldName}_{$instance->id}", $instance->{$fieldName});
						}
					}
				}
				
			}
		}

		/* Developer Hook (Action) - Register by type */
		do_action('wpgmza_dynamic_translations_register_by_type', $instance, $columns);
	}

	public function deregisterByType($instance){
		if(!empty($instance)){
			if(!empty($instance->id)){
				$slugPrefix = $this->getSlugPrefix($instance);
				$supportedFields = $this->getSupportedFields($instance);
				if(!empty($slugPrefix) && !empty($supportedFields)){
					foreach($supportedFields as $fieldName){
						$this->deregister("{$slugPrefix}{$fieldName}_{$instance->id}");
					}
				}
			}
		}

		/* Developer Hook (Action) - Deegister by type */
		do_action('wpgmza_dynamic_translations_deregister_by_type', $instance);
	}	

	public function fetchByType($data, $instance){
		if(!is_admin() && !empty($instance)){
			/* Only process these on the frontend */
			if(!empty($instance->id)){
				$slugPrefix = $this->getSlugPrefix($instance);
				$supportedFields = $this->getSupportedFields($instance);
				if(!empty($slugPrefix) && !empty($supportedFields)){
					foreach($supportedFields as $fieldName){
						if(!empty($data[$fieldName])){
							/* This is a supported field and field name */
							if($this->shouldIgnoreField($data[$fieldName])){
								continue;
							}

							$translation = $this->fetch("{$slugPrefix}{$fieldName}_{$instance->id}", $data[$fieldName]);
							if($translation !== $data[$fieldName]){
								/* The request applied a translation */
								$data["{$fieldName}_original"] = $data[$fieldName];
							}

							$data[$fieldName] = $translation;
						}
					}
				}
				
			}
		}

		/* Developer Hook (Action) - Fetch by type */
		$data = apply_filters('wpgmza_dynamic_translations_fetch_by_type', $data, $instance);
		return $data;
	}

	public function getSlugPrefix($instance){
		$prefix = false;
		$instanceSlug = $this->getInstanceSlug($instance);
		if(!empty($instanceSlug)){
			$prefix = "{$instanceSlug}_";
		}

		/* Developer Hook (Action) - slug prefix by type */
		$prefix = apply_filters('wpgmza_dynamic_translations_slug_prefix', $prefix, $instance);
		return $prefix;
	}

	public function getSupportedFields($instance){
		$fields = false;

		$instanceSlug = $this->getInstanceSlug($instance);
		if(!empty($instanceSlug)){
			switch($instanceSlug){
				case 'marker':
					$fields = array(
						'address'
					);
					break;
				case 'polygon':
				case 'polyline':
					$fields = array(
						'polyname'
					);
					break;
				case 'circle':
				case 'rectangle':
				case 'pointlabel':
					$fields = array(
						'name'
					);
					break;
			}
		}

		/* Developer Hook (Action) - slug prefix by type */
		$fields = apply_filters('wpgmza_dynamic_translations_supported_fields', $fields, $instance);
		return $fields;
	}

	public function shouldIgnoreField($content){
		$ignore = false;
		if(!is_string($content)){
			$ignore = true;
		} else {
			$m = false;
			if(preg_match(LatLng::REGEXP, $content, $m)){
				/* This is a lat/lng literal */
				$ignore = true;
			}
		}
		return apply_filters('wpgmza_dynamic_translations_should_ignore_field', $ignore, $content);
	}

	public function getInstanceSlug($instance){
		$slug = false;
		if(!empty($instance)){
			if($instance instanceof Marker){
				$slug = "marker";
			} else if($instance instanceof Polygon){
				$slug = "polygon";
			} else if($instance instanceof Polyline){
				$slug = "polyline";
			} else if($instance instanceof Rectangle){
				$slug = "rectangle";
			} else if($instance instanceof Circle){
				$slug = "circle";
			} else if($instance instanceof Pointlabel){
				$slug = "pointlabel";
			}
		}

		return apply_filters('wpgmza_dynamic_translations_instance_slug', $slug, $instance);
	}

	public function registerByMap($map){
		if(!empty($map)){
			$supportedFields = $this->getSupportedMapFields();
			if(!empty($supportedFields)){
				foreach($supportedFields as $fieldName){
					if(!empty($map->{$fieldName})){
						$value = $map->{$fieldName};
						if(!empty($value)){
							$this->register("map_{$map->id}_{$fieldName}", $value);
						}
					}
				}
			}
		}
	}

	public function fetchByMap($localized, $map){
		if(!empty($localized) && !empty($map)){
			$supportedFields = $this->getSupportedMapFields();
			if(!empty($supportedFields)){
				foreach($supportedFields as $fieldName){
					if(!empty($map->{$fieldName})){
						$value = $map->{$fieldName};
						$translation = $this->fetch("map_{$map->id}_{$fieldName}", $value);
						if($translation !== $value){
							/* The request applied a translation */
							$translationFieldName = "{$fieldName}_original";
							$localized->override($translationFieldName, $value);
						}

						$localized->override($fieldName, $translation);
					}
				}
			}
		}
		return $localized;
	}

	public function getSupportedMapFields(){
		$fields = array(
			'map_title'
		);

		$fields = apply_filters('wpgmza_dynamic_translations_supported_map_fields', $fields);
		return $fields;
	}

	public function registerGlobalSettings($wpgmza){
		if(!empty($wpgmza) && !empty($wpgmza->settings)){
			$supportedFields = $this->getSupportedSettingsFields();
			if(!empty($supportedFields)){
				foreach($supportedFields as $fieldName){
					if(!empty($wpgmza->settings->{$fieldName})){
						$value = $wpgmza->settings->{$fieldName};
						if(!empty($value)){
							$this->register("settings_{$fieldName}", $value);
						}
					}
				}
			}
		}
	}

	public function fetchBySettings($settings){
		if(!empty($settings)){
			$supportedFields = $this->getSupportedSettingsFields();
			if(!empty($supportedFields)){
				foreach($supportedFields as $fieldName){
					if(!empty($settings->{$fieldName})){
						$value = $settings->{$fieldName};
						$translation = $this->fetch("settings_{$fieldName}", $value);
						if($translation !== $value){
							/* The request applied a translation */
							$translationFieldName = "{$fieldName}_original";
							$settings->override($translationFieldName, $value);
						}

						$settings->override($fieldName, $translation);

						$camelCase = preg_replace("/^(wpgm(za|aps)_)?(settings_)?/", "", $fieldName);
						$camelCase		= str_replace(' ', '', ucwords(str_replace('_', ' ', $camelCase)));
						$camelCase[0]	= strtolower($camelCase[0]);
						if($camelCase !== $fieldName){
							$settings->override($camelCase, $translation);
						}
					}
				}
			}
		}
		return $settings;
	}

	public function fetchByGDPR($settings){
		$supportedFields = $this->getSupportedSettingsFields();
		if(!empty($supportedFields)){
			foreach($supportedFields as $fieldName){
				if(!empty($settings[$fieldName])){
					$value = $settings[$fieldName];
					$translation = $this->fetch("settings_{$fieldName}", $value);
					if($translation !== $value){
						/* The request applied a translation */
						$translationFieldName = "{$fieldName}_original";
						$settings[$translationFieldName] = $value;
					}

					$settings[$fieldName] = $translation;

					$camelCase = preg_replace("/^(wpgm(za|aps)_)?(settings_)?/", "", $fieldName);
					$camelCase		= str_replace(' ', '', ucwords(str_replace('_', ' ', $camelCase)));
					$camelCase[0]	= strtolower($camelCase[0]);
					if($camelCase !== $fieldName){
						$settings[$camelCase] = $translation;
					}

				}
			}
		}
		return $settings;
	}

	public function getSupportedSettingsFields(){
		$fields = array(
			'wpgmza_gdpr_company_name',
			'wpgmza_gdpr_retention_purpose',
			'wpgmza_gdpr_button_label',
			'wpgmza_gdpr_notice_override_text'
		);

		$fields = apply_filters('wpgmza_dynamic_translations_supported_settings_fields', $fields);
		return $fields;
	}
}