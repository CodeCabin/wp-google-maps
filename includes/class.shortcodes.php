<?php
namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class Shortcodes extends Factory {
	const SLUG = "wpgmza";
	const STORE_LOCATOR = "store_locator";

	protected $internalEngine;

	/**
	 * Constructor. called by Plugin constructor.
	*/
	public function __construct($internalEngine){
		$this->internalEngine = $internalEngine;
		if(!$this->internalEngine->isLegacy()){
			/*
			 * Modern shortcode register
			*/
			$this->register();
		} else {
			/*
			 * Legacy shortcode register
			*/
			$this->legacy();
		}
		
	    /* Developer Hook (Action) - Register additional shortcodes */     
		do_action("wpgmza_shortcodes_registered");
	}

	/**
	 * Register shortcode handlers 
	 * 
	 * This can be extended from pro, or other plugins using factory filters
	 * 
	 * Calls internal methods, which handle rendering modules the way you would expect
	 *
	 * @return void
	*/
	public function register(){
		add_shortcode(self::SLUG, array($this, "map"));
		add_shortcode(self::SLUG . "_" . self::STORE_LOCATOR, array($this, "storeLocator"));
	}

	/**
	 * Gets the default attributes for a specific shortcode
	 * 
	 * @return array
	*/
	public function getDefaults($slug){
		$attributes = array();
		switch($slug){
			case self::SLUG:
				$attributes = array(
				    "id" => "1",
				    "zoom" => false,
				    "width" => false,
				    "height" => false,
				    "marker" => false,
				);
				break;
			case self::SLUG . "_" . self::STORE_LOCATOR:
				$attributes = array(
					"id" => "1",
					"url" => false,
					"default_radius" => false, 
					"default_address" => false
				);
				break;
		}

		/* Globals across all shortcodes */
		$attributes['classname'] = false;

		return $attributes;
	}

	/**
	 * Render a map from a shortcode
	 * 
	 * @param array $attributes The shortcode attributes
	 *
	 * @return string
	*/
	public function map($attributes){
		global $wpgmza;

		$html = "";
		
		/* Store the raw attributes, as entered by the user */
		$rawAttributes = array_merge(array(), $attributes);
		if(isset($rawAttributes['id'])){
			unset($rawAttributes['id']);
		}

		/* Developer Hook (Filter) - Modify default shortcode attributes for primary map shortcode */
		$defaults = apply_filters("wpgmza_map_shortcode_get_default_attributes", $this->getDefaults(self::SLUG));
		$attributes = shortcode_atts($defaults, $attributes);


		$attributes = (object) $attributes;
		
		$id = !empty($attributes->id) && !empty(intval($attributes->id)) ? intval($attributes->id) : 1;

		$map = Map::createInstance($id, $rawAttributes);

		if($map->element !== null){
			$pullMethod = intval($wpgmza->settings->wpgmza_settings_marker_pull);
		    if(!empty($pullMethod) && $pullMethod === 1){
		    	/* Legacy call, but we will leave it as we won't be making improvemets to XML methods moving forward */
		    	if(function_exists("wpgmza_check_if_marker_file_exists")){
		    		wpgmza_check_if_marker_file_exists($id);
		    	}
		    }

		    $options = array(
				"width"  => !empty($map->map_width) ? intval($map->map_width) : 100,
				"height" => !empty($map->map_height) ? intval($map->map_height) : 400,
				"widthType"  => !empty($map->map_width_type) ? $map->map_width_type : "%",
				"heightType" => !empty($map->map_height_type) ? $map->map_height_type : "px",
				"alignment"  => !empty($map->wpgmza_map_align) ? intval($map->wpgmza_map_align) : 1   	
		    );

			/* Developer Hook (Filter) - Modify default map options for shortcode */
		    $options = (object) apply_filters("wpgmza_shortcode_map_options", $options);

		    $styles = array(
		    	"display" => "block",
		    	"width" => !empty($attributes->width) ? $attributes->width : "{$options->width}{$options->widthType}",
		    	"height" => !empty($attributes->height) ? $attributes->height :"{$options->height}{$options->heightType}",
				"overflow" => "hidden",
				"position" => "relative"
		    );
		    
		    $classes = array(
		    	"wpgmza_map"
		    );

		    if(!empty($attributes->classname)){
		    	$classes[] = esc_attr($attributes->classname);
		    }

		    switch($options->alignment){
		    	case 1:
					$classes[] = "wpgmza-auto-left"; 
		    		break;
		    	case 2: 
					$classes[] = "wpgmza-auto-center";    	
		    		break;
		    	case 3:
					$classes[] = "wpgmza-auto-right";    	
		    		break;
		    }

		    $elemAttributes = array(
		    	"id" => "wpgmza_map_{$id}",
		    	"class" => implode(" ", $classes),
		    	"style" => $this->prepareInlineAttributes($styles, ";", ":", ""),
		    	"data-map-id" => $id,
		    	"data-maps-engine" => esc_attr($wpgmza->settings->engine),
		    	"data-build-engine" => esc_attr($wpgmza->internalEngine->getEngine()),
		    	"data-shortcode-attributes" => $this->prepareJsonAttribute("data-shortcode-attributes", $attributes),
		    	"data-settings" => $this->prepareJsonAttribute('data-settings', $map->getDataSettingsObject()),
		    );

			/* Developer Hook (Filter) - Modify default HTML attributes for container */
		    $elemAttributes = apply_filters("wpgmza_map_shortcode_get_html_attributes", $this->filterMapElementAttributes($elemAttributes, $attributes));

		    $elemAttributes = $this->prepareInlineAttributes($elemAttributes);

		    /* 
		     * Prepare components around map element
		     *
		     * Provide filter, useful for adding/altering/order components 
		    */
		    $components = $this->getMapComponents($map);

			/* Developer Hook (Filter) - Modify map components to be output for a specific map */
		    $components = apply_filters("wpgmza_shortcode_map_components", $components, $map, $attributes);

		    /* Build inner stacks */
		    $innerComponents = "";
		    if(!empty($components->inside)){
		    	foreach($components->inside as $anchor => $nodes){
		    		if(!empty($nodes) && is_array($nodes)){
		    			$innerComponents .= "\n<div class='wpgmza-inner-stack {$anchor}'>" . implode("", $nodes) . "</div>";
		    		} 
		    	}
		    }

			/* Developer Hook (Filter) - Modify HTML content before map container */
		    $before = apply_filters("wpgmza_shortcode_map_container_before", !empty($components->before) ? implode("", $components->before) : "");
			/* Developer Hook (Filter) - Modify HTML content for inner components of the map */
		    $inside = apply_filters("wpgmza_shortcode_map_container_inside", $innerComponents);
			/* Developer Hook (Filter) - Modify HTML content after map container */
		    $after  = apply_filters("wpgmza_shortcode_map_container_after",  !empty($components->after)  ? implode("", $components->after)  : "");
		    
		    $container = "<div {$elemAttributes}>";
		    
			/* Developer Hook (Filter) - Legacy filter, allows modification of map div */
		    $container = apply_filters("wpgooglemaps_filter_map_div_output", $container, $id);

			/* Developer Hook (Filter) - Legacy filter, alter opening tag types */
		    $container = apply_filters("wpgmza_shortcode_map_container_open", $container, $id); 
		    
		    $container .= $inside . "</div>";

		    /* Wrap standlone components */
		    $before = $this->standaloneComponent($before, $options->alignment, $styles);
		    $after = $this->standaloneComponent($after, $options->alignment, $styles);

		    $html = "{$before}{$container}{$after}";

			$coreDependencies = array();
			$scriptLoader = new ScriptLoader($wpgmza->isProVersion());
			$scripts = $scriptLoader->getPluginScripts();
	
			foreach($scripts as $handle => $script){
				$coreDependencies[] = $handle;
			}
	
			$apiLoader = new GoogleMapsAPILoader();
			if($apiLoader->isIncludeAllowed()){
				$coreDependencies[] = 'wpgmza_api_call';

				if($wpgmza->settings->engine == 'google-maps'){
					// TODO: Why is this not handled by the API loader?

					$scriptArgs = apply_filters('wpgmza-get-scripts-arguments', array());

					wp_enqueue_script('wpgmza_canvas_layer_options', WPGMZA_PLUGIN_DIR_URL . 'lib/CanvasLayerOptions.js', array('wpgmza_api_call'), false, $scriptArgs);
					wp_enqueue_script('wpgmza_canvas_layer', WPGMZA_PLUGIN_DIR_URL . 'lib/CanvasLayer.js', array('wpgmza_api_call'), false, $scriptArgs);
				}
			}
    
			// TODO: Come up with a proper solution. Gutenberg dependency breaks developer mode
			$gutenbergIndex = array_search('wpgmza-gutenberg', $coreDependencies);
			if($gutenbergIndex !== false){
				array_splice($coreDependencies, $gutenbergIndex, 1);
			}

			if($wpgmza->settings->engine  == 'open-layers'){
				if($index = array_search('wpgmza-google-vertex-context-menu', $coreDependencies)){
					array_splice($coreDependencies, $index, 1);
				}
			}
	
    		//Legacy hooks
    		/* Developer Hook (Action) - Enqueue additional frontend scripts */ 
    		do_action("wpgooglemaps_hook_user_js_after_core");    
    		/* Developer Hook (Action) - Enqueue additional frontend scripts */ 
			do_action("wpgooglemaps_basic_hook_user_js_after_core");    		
    		/* Developer Hook (Action) - Localize additional frontend script variable  */     
			do_action("wpgooglemaps_hook_user_js_after_localize", $map);

			if(empty($wpgmza->settings->disable_autoptimize_compatibility_fix)){
				// Autoptimize fix, bypass CSS where our map is present as large amounts of inline JS (our localized data) crashes their plugin. Added at their advice.
				add_filter('autoptimize_filter_css_noptimize', '__return_true');
			}
			
		} else {
			$html = __("Error: The map ID", "wp-google-maps") . " (" . $id . ") " . __("does not exist", "wp-google-maps");
		}

		// Internal action before output, for extenstion and hook trigger
		$this->beforeOutput(self::SLUG);

		return $html;
	}

	/** 
	 * Store Location Shortcode Handler
	 * 
	 * @param array $attributes The shortcode attributes
	 * 
	 * @return string
	*/
	public function storeLocator($attributes){
		global $wpgmza;

		$html = "";

		/* Developer Hook (Filter) - Modify default shortcode attributes for store locator shortcode */
		$defaults = apply_filters("wpgmza_sl_shortcode_get_default_attributes", $this->getDefaults(self::SLUG . "_" . self::STORE_LOCATOR));
		$attributes = shortcode_atts($defaults, $attributes);

		$attributes = (object) $attributes;
		
		$id = !empty($attributes->id) && !empty(intval($attributes->id)) ? intval($attributes->id) : 1;

		$map = Map::createInstance($id);
		if($map->element !== null){
			$storeLocator = StoreLocator::createInstance($map);
			
			$container = $storeLocator->document->querySelector('.wpgmza-store-locator');
			if(!empty($container)){
				if(!empty($attributes->url)){
					$container->setAttribute('data-map-id', $id);
					$container->setAttribute('data-url', esc_url($attributes->url));

					/* Probably separated, send over the settings */
					$container->setAttribute('data-map-settings', json_encode($map->getDataSettingsObject()));
				}
								
				if(!empty($attributes->classname)){
					$container->addClass( esc_attr($attributes->classname) );
				}

				if(!empty($attributes->default_radius)){
					$radiusSelect = $container->querySelector('select.wpgmza-radius');
					if($radiusSelect){
						$radiusOptions = $radiusSelect->querySelectorAll('option');
						foreach($radiusOptions as $option){
							if($option->hasAttribute('selected')){
								$option->removeAttribute('selected');
							}

							if(intval($option->getAttribute('value')) === intval($attributes->default_radius)){
								$option->setAttribute('selected', 'selected');
							}
						}

						$radiusSelect->setAttribute('data-default-override', 'true');
					}
				}

				if(!empty($attributes->default_address)){
					$addressInput = $container->querySelector('input[data-name="defaultAddress"]');
					$addressInput->setValue($attributes->default_address);
				}
			}

			$html = $this->standaloneComponent($storeLocator->html);
		} else {
			$html = __("Error: The map ID", "wp-google-maps") . " (" . $id . ") " . __("does not exist", "wp-google-maps");
		}

		$this->beforeOutput(self::SLUG. "_" . self::STORE_LOCATOR);

		return $html;
	}

	/**
	 * Prepares components for the map shortcode
	 * 
	 * Can be overridden by extensions to alter behaviour of the shortcode
	 * 
	 * @param object $map The map this call applies to, allowing for more scale
	 * 
	 * @return object
	*/
	public function getMapComponents($map){
	    $components = (object) array(
	    	"before" => array(),
	    	"inside" => array(),
	    	"after" => array()
	    );

	    $anchors = UI\ComponentAnchorControl::getAnchors();
	    $anchorMap = array_flip($anchors);
	    foreach($anchors as $anchor => $code){
	    	if(!UI\ComponentAnchorControl::isLegacyAnchor($code)){
	    		$components->inside[strtolower($anchor)] = array();
	    	}
	    }
	    
	    if($map->storeLocator){
	    	if($map->store_locator_component_anchor == UI\ComponentAnchorControl::ABOVE){
	    		$components->before[] = $map->storeLocator->html;
	    	} else if ($map->store_locator_component_anchor == UI\ComponentAnchorControl::BELOW){
	    		$components->after[] = $map->storeLocator->html;
	    	} else {
	    		/* Inside container */
	    		if(array_key_exists($map->store_locator_component_anchor, $anchorMap)){
	    			$anchor = strtolower($anchorMap[$map->store_locator_component_anchor]);
	    			if(array_key_exists($anchor, $components->inside)){
	    				$components->inside[$anchor][] = $map->storeLocator->html; 
	    			}
	    		}

	    	}
	    }

	    return $components;
	}

	/**
	 * Generic class extension passthrough allowing for direct extension of inline 
	 * HTML attributes on the map element, before WordPress hooks fire
	 * 
	 * This allows Pro to extend from basic, while also giving 3rd party developers complete access to the final attributes pushed to the DOM
	 * 
	 * @param array $elemAttributes The current input element attributes, before globally filtered
	 * @param object $shortcodeAttributes The current shortcode attributes helpful for logic blocks
	 * 
	 * @return array
	 * 
	*/
	public function filterMapElementAttributes($elemAttributes, $shortcodeAttributes = false){
		return $elemAttributes;
	}

	/**
	 * Wrap HTML in the standalone component div
	 * 
	 * Good for applying modern component styles, with variation, to elements outside of the map
	 * 
	 * @param string $html $The HTML to be wrapped
	 * @param int $align The map alignment, applies a class to the wrap
	 * @param array $styles The map styles, applies some styles to the wrap, assuming they are passed
	 * 
	 * @return string
	*/
	public function standaloneComponent($html, $align = false, $styles = false){
		$classlist = array(
			'wpgmza-standalone-component'
		);

		/* Probably makes sense to make this a reusable anchor method, for now, let's leave it */
		$align = !empty(intval($align)) ? intval($align) : 1; 
		switch($align){
	    	case 1:
				$classlist[] = "wpgmza-auto-left"; 
	    		break;
	    	case 2: 
				$classlist[] = "wpgmza-auto-center";    	
	    		break;
	    	case 3:
				$classlist[] = "wpgmza-auto-right";    	
	    		break;
	    }

		/* Developer Hook (Filter) - Modify standalone component default class list */
		$classlist = apply_filters("wpgmza_standalone_component_classlist", $classlist);

		if(!empty($html) && !empty($classlist)){
			$classlist = implode(" ", $classlist);

			$elemAttributes = array(
				'class' => $classlist
			);

			if(!empty($styles)){
				if(!empty($styles['width'])){
					$elemAttributes['style'] = "width:{$styles['width']}; max-width:{$styles['width']};";
				}
			}

			/* Developer Hook (Filter) - Modify element attributes for standalone component wrapper */
			$elemAttributes = apply_filters("wpgmza_standalone_component_wrap_attributes", $elemAttributes);
		    $elemAttributes = $this->prepareInlineAttributes($elemAttributes);

			$html = "<div {$elemAttributes}>{$html}</div>";
		}
		return $html;
	}

	/**
	 * Internal hook for actions before returning content for a shortcode
	 * 
	 * @param string $slug The shortcode slug which triggered this event
	 * 
	 * @return void
	*/
	public function beforeOutput($slug){
    	/* Developer Hook (Action) - Render additional content before output from shortcode, passes shortcode slug */ 
		do_action('wpgmza_shortcode_before_output', $slug);
	}

	/**
	 * Combines inline attributes 
	 * 
	 * @param array $data The data to be combined
	 * @param string $separator Symbol to use for separate 'rows'
	 * @param string $assigner Symbol to use for key/value assignments
	 * @param string $capsule What to wrap values in, if anything
	 * 
	 * @return string 
	*/
	private function prepareInlineAttributes($data, $separator = " ", $assigner = "=", $capsule = "\""){
		if(is_array($data)){
			$output = "";
			foreach($data as $key => $value){
				if(is_array($value)){
					$value = $this->prepareInlineAttributes($value, $separator, $assigner, $capsule);
				}

				$output .= "{$key}{$assigner}{$capsule}{$value}{$capsule}{$separator}";
			}

			return $output;
		}
		return $data;
	}

	/**
	 * Prepare an inline json attribute for the dom
	 * 
	 * Uses Dom Document, but has a few fallbacks if anything goes wrong along the way
	 * 
	 * @param string $tag Attribute name this data applies to 
	 * @param array|object $data The data to be prepared
	 * 
	 * @return string
	*/  
	private function prepareJsonAttribute($tag, $data){
		$encoded = false;

		if(is_object($data) || is_array($data)){
			$document = new DOMDocument();
			$document->loadHTML('<div id="debug"></div>');
		
			$el = $document->querySelector("#debug");
			$el->setAttribute($tag, json_encode($data));
		
			$html = $document->saveHTML();
			if(preg_match('/' . $tag . '="(.+)"/', $html, $m) || preg_match('/' . $tag . '=\'(.+)\'/', $html, $m)) {
				/* Leverage Dom Doc Encoding */
				if(!empty($m[1])){
					$encoded = $m[1];
				}
			} else {
				/* Fallback */
				$escaped = esc_attr(json_encode($data));
				$attr = str_replace('\\\\%', '%', $escaped);
				$attr = stripslashes($attr);
				$encoded =  $attr;
			}

			if(empty($encoded)){
				/* Something went wrong with both branches */
				$encoded = json_encode($data);
			}
			return esc_attr($encoded);
		}

		return $data;
	}

	/**
	 * Legacy shortcode relay
	 * 
	 * Simply call the legacy functions for shortcodes, when the user is in Legacy mode
	 * 
	 * @return void
	*/
	public function legacy(){
		global $wpgmza_pro_version;
		if (function_exists('wpgmza_register_pro_version')){
		    if (isset($wpgmza_pro_version) && function_exists('wpgmza_register_gold_version') && version_compare($wpgmza_pro_version, '7.10.29', '<=')) {
				// Deprecated with Pro >= 7.10.30, where legacy-map-edit-page.js is used instead
				add_action('admin_head', 'wpgmaps_admin_javascript_gold');
			}

		    add_shortcode( 'wpgmza', 'wpgmaps_tag_pro' );
		} else {
		    add_shortcode( 'wpgmza', 'wpgmaps_tag_basic' );
		}
	}
}