<?php

namespace WPGMZA\Integration;

class WPMLDynamicTranslations extends \WPGMZA\Factory{
    const CONTEXT = "WP Go Maps Content";

	public function __construct(){
        $this->hook();
    }

    public function hook(){
        if($this->enabled()){
            add_action('wpgmza_dynamic_translations_register', array($this, 'register'), 10, 2);
            add_action('wpgmza_dynamic_translations_deregister', array($this, 'deregister'), 10, 1);
            add_filter('wpgmza_dynamic_translations_fetch', array($this, 'fetch'), 10, 2);
            add_filter('wpgmza_dynamic_translations_providers', array($this, 'provider'), 10, 1);
        }
    }

    public function provider($providers){
        if(is_array($providers)){
            $providers[] = "WPML";
        }
        return $providers;
    }

    public function register($slug, $content){
        $slug = trim($slug);
        if(!empty($slug)){
            do_action('wpml_register_single_string', self::CONTEXT, $slug, $content);
        }
    }

    public function deregister($slug){
        $slug = trim($slug);
        if(!empty($slug)){
            if(function_exists('icl_unregister_string')){
                try{
                    \icl_unregister_string(self::CONTEXT, $slug);
                } catch(\Exception $ex){

                } catch (\Error $err){
                    
                }
            }
        }
    }

    public function fetch($content, $slug){
        $slug = trim($slug);
        if(!empty($slug)){
            if(function_exists('icl_get_string_id') && !empty($content)){
                $translationRegistered = \icl_get_string_id(self::CONTEXT, $slug);
                if(empty($translationRegistered)){
                    /* Not yet registered, so let's register it now */
                    $this->register($slug, $content);
                } 
            }

            $content = apply_filters('wpml_translate_single_string', $content, self::CONTEXT, $slug);
        }
        return $content;
    }

    public function enabled(){
        global $wpgmza;
        if (defined('ICL_SITEPRESS_VERSION')){
            if(!empty($wpgmza) && !empty($wpgmza->settings) && !empty($wpgmza->settings->wpml_enable_dynamic_translations)){
                return true;
            }
            return false;
        }
        return false;
    }
}