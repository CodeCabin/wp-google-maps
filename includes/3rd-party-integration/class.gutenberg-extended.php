<?php

namespace WPGMZA\Integration;

if(!defined('ABSPATH'))
	return;

/**
 * Further extends the gutenberg functionality in the base plugin
 * 
 * Separated to allow for more modular block registration, without altering the existing module
 */
class GutenbergExtended extends \WPGMZA\Factory {
    public $blocks;
    
    /**
     * Constructor
     */
    public function __construct(){
        $this->blocks = array();
        $this->prepareBlocks();

        add_action('block_categories_all', array($this, 'registerBlockCategory'), 10, 2);
        add_action('enqueue_block_assets', array($this, 'onEnqueueBlockAssets'));
        add_action('init', array($this, 'onInit'));
    }

    /**
     * On init delegate
     * 
     * @return void
    */
    public function onInit(){
        if($this->checkRequirements()){
            $this->registerBlocks();
        }
    }

    /**
     * On block assets enqueue delegate
     * 
     * @return void
    */
    public function onEnqueueBlockAssets(){
        if(!is_admin() || !$this->checkRequirements()){
            return;
        }

        $versionString = $this->getVersion();

        $blockAssets = array(
            "wp-blocks", 
            "wp-i18n",
            "wpgmza"
        );

        if(!wp_script_is('wp-edit-widgets') && !wp_script_is('wp-customize-widgets')){
            $blockAssets[] = "wp-editor";
        }

        foreach($this->blocks as $block){
            if(!empty($block->slug) && !empty($block->base)){
                wp_register_script(
                    "wpgmza-gutenberg-{$block->slug}", 
                    $block->base . "/js/v8/3rd-party-integration/gutenberg/blocks/{$block->slug}/block.js", 
                    $blockAssets,
                    $versionString
                );
            }
        }
    }

    /**
     * Register a custom block category, to keep things modular
     * 
     * @param array $categories
     * @param object $context
     * 
     * @return array
    */
    public function registerBlockCategory($categories, $context){
        //if(!empty($context->post) && $this->checkRequirements()){
        if(!empty($context->post)){
            array_push($categories,
                array(
                    "slug" => "wpgmza-gutenberg",
                    "title" => __("WP Go Maps", "wp-google-maps"),
                    "icon" => null
                )
            );
        }
        return $categories;
    }

    /**
     * Prepare blocks
     * 
     * Extend this in Pro to add more blocks dynamically
     * 
     * @return void
    */
    public function prepareBlocks(){
        $this->prepareBlock('store-locator');
    }

    /**
     * Prepare a block for registration
     * 
     * This is simply a process of linking a slug to a base bath to be registered dynamically when the time is right
     * 
     * @return void
    */
    public function prepareBlock($slug, $baseOverride = false, $basePathOverride = false){
        $this->blocks[] = (object) array(
            'slug' => $slug,
            'base' => !empty($baseOverride) ? $baseOverride : rtrim(WPGMZA_PLUGIN_DIR_URL, '/'),
            'basePath' => !empty($basePathOverride) ? $basePathOverride : rtrim(WPGMZA_PLUGIN_DIR_PATH, '/'),
        );
    }

    /**
     * Register the blocks in WordPress core
     * 
     * @return void
    */
    public function registerBlocks(){
        foreach($this->blocks as $block){
            if(!empty($block->slug)){
                $translatedSlug = ucwords(str_replace(array("-", "_"), " ", $block->slug));
                $translatedSlug = str_replace(" ", "", $translatedSlug);

                $renderMethod = "onRender{$translatedSlug}";
                if(method_exists($this, $renderMethod)){
                    /* Older Registration method */
                    /*
                    register_block_type("gutenberg-wpgmza/{$block->slug}", 
                        array(
                            'render_callback' => array($this, $renderMethod)
                        )
                    );
                    */

                    register_block_type_from_metadata(
                        $block->basePath . "/js/v8/3rd-party-integration/gutenberg/blocks/{$block->slug}", 
                        array(
                            'render_callback' => array($this, $renderMethod)
                        )
                    );
                }
            }
        }
    }


    /**
     * Specifically render the store locator
     * 
     * Could be helpful to modularize this so that all blocks use the same render method. Unsure at the moment
     * 
     * @param array $attr
     * 
     * @return string
    */
    public function onRenderStoreLocator($attr){
        return $this->onRender(\WPGMZA\Shortcodes::SLUG . "_" . \WPGMZA\Shortcodes::STORE_LOCATOR, $attr);
    }

    /**
     * Renders the shortcode for a specific module on the frontend
     * 
     * This is a dynamic function, meaning all sub-renderers will call this eventually
     * 
     * Attributes should be the 'correct' formats/names for the main shortcode to be output
     * 
     * The handle should be the shortcodes registered slug
     * 
     * @param string @handle The shortcode handle
     * @param array $attr The attributes for the shortcode
     * 
     * @return string
    */
    public function onRender($handle, $attr){
        $parts = array(
            $handle
        );
                
        foreach($attr as $name => $value){
            if(is_string($value)){
                $value = addslashes($value);
            } else if(is_array($value)) {
                $value = implode(',', array_map('addslashes', $value));
            } else if(is_object($value)){
                $value = (array) $value;
                $value = implode(',', array_map('addslashes', $value));
            }
            
            $parts[] = "{$name}=\"" . addslashes($value) . "\"";
        }
        
        $parts = implode(" ", $parts);
        return "[{$parts}]";
    }

    /**
     * Check if we can register extended blocks
     * 
     * Requirements:
     * - Must be running atlas novus (It includes new shortcodes)
     * - Must have access to register block type function
     * 
     * @return bool
    */
    private function checkRequirements(){
        global $wpgmza;
        if(!$wpgmza->internalEngine->isLegacy() && function_exists('register_block_type')){
            return true;
        }
        return false;
    }

    /**
     * Get a version string for scripts
     * 
     * @return string
    */
    protected function getVersion(){
        global $wpgmza;
        $version = $wpgmza->getBasicVersion();
        if(method_exists($wpgmza, 'getProVersion')){
            $version .= '+pro-' . $wpgmza->getProVersion();
        }

        return $version;
    }
}