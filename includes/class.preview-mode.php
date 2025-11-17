<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

class PreviewMode {
    const PREVIEW_PARAM = '_wpgmza_preview_map';
	
	public function __construct(){
		$this->hooks();
	}
	
	public function hooks(){
        if($this->enabled()){
            add_action('admin_init', array($this, 'onAdminInit'));
        }
	}

    public function enabled(){
        global $wpgmza;
        if(!empty($wpgmza) && !empty($wpgmza->settings) && !empty($wpgmza->settings->disable_map_previews)){
            return false;
        }
        return true;
    }

    public function active(){
        if($this->enabled()){
            if(is_admin()){
                $target = $this->getTarget();
                if(!empty($target)){
                    return true;
                }
            }
        }
        return false;
    }

    public function getTarget(){
        if(!empty($_GET['page']) && $_GET['page'] === 'wp-google-maps-menu'){
            if(!empty($_GET['action']) && $_GET['action'] === 'edit' && !empty($_GET['map_id'])){
                if(!empty($_GET[self::PREVIEW_PARAM])){
                    $target = intval($_GET[self::PREVIEW_PARAM]);
                    if(!empty($target) && $target === intval($_GET['map_id'])){
                        return $target;
                    }
                }
            }
        }
        return false;

    }

    public function getPreviewLink($mapId){
        if($this->enabled()){
            $mapId = intval($mapId);
            if(!empty($mapId)){
                $previewUrl = admin_url("admin.php?page=wp-google-maps-menu&action=edit&map_id={$mapId}&" . self::PREVIEW_PARAM . "={$mapId}");
                if(!empty($previewUrl)){
                    return $previewUrl;
                }
            }
        }
        
        return false;
    }

    public function onAdminInit(){
        global $wpgmza;

        try{
            if($this->active() && !empty($wpgmza) && $wpgmza->isUserAllowedToEdit()){
                /* Prepare a preview page, remove old previews and redirect to the preview */
                $this->prune($this->getTarget());
                $pageUrl = $this->generate();

                if(!empty($pageUrl)){
                    wp_safe_redirect($pageUrl);
                }
            }
        } catch (\Exception $ex){

        } catch (\Error $err){

        }
    }

    public function prune($mapId = false){
        try{
            $args = array(
                'post_type'      => 'page',
                'post_status'    => 'draft',
                'posts_per_page' => -1, 
                'fields'         => 'ids' 
            );

            if(!empty($mapId)){
                /* Exclude the current map ID - We can reuse that page */
                $args['meta_query'] = array(
                    array(
                        'key'     => '_wpgmza_preview_id',
                        'value'   => $mapId,
                        'compare' => '!=',
                        'type'    => 'NUMERIC'
                    )
                );
            } else {
                /* Full prune */
                $args['meta_key'] = '_wpgmza_preview_id';
            }
            
            $ids = get_posts($args);
            if(!empty($ids)){
                foreach($ids as $id) {
                    wp_delete_post($id, true); 
                }
            }
        } catch (\Exception $ex){

        } catch (\Error $err){

        }
    }

    public function generate(){
        if($this->active()){
            $mapId = $this->getTarget();
            if(!empty($mapId)){

                $args = array(
                    'post_type'      => 'page',
                    'post_status'    => 'draft',
                    'posts_per_page' => 1,
                    'fields'         => 'ids',
                    'meta_query'     => array(
                        array(
                            'key'     => '_wpgmza_preview_id',
                            'value'   => $mapId,
                            'compare' => '=',
                            'type'    => 'NUMERIC'
                        )
                    )
                );
                
                $existing = get_posts($args);

                $previewId = false;
                if (!empty($existing)) {
                    /* Reuse existing preview page */
                    $previewId = intval(array_shift($existing));
                } else {
                    /* Generate a new preview page */
                    $html = array();
                    $html[] = "<div class='wpgmza-preview-mode-banner'>";
                    $html[] =    "<div class='wpgmza-preview-mode-banner-heading'>" . __("WP Go Maps Preview", "wp-google-maps") . " - " . __("Map ID", "wp-google-maps") . " {$mapId}</div>";
                    $html[] =    "<div class='wpgmza-preview-mode-banner-subheading'>" . __("This is a temporary preview and shows the latest saved version of your map.", "wp-google-maps") . "</div>";
                    $html[] =    "<div class='wpgmza-preview-mode-banner-subheading'>" . __("This page will automatically be removed when a new preview is created.", "wp-google-maps") . "</div>";
                    $html[] =    "<div class='wpgmza-preview-mode-banner-shortcode-wrapper'><span>" . __("Your map shortcode is", "wp-google-maps") . "</span><strong>[[wpgmza id='{$mapId}']]</strong></div>";
                    $html[] = "</div>";
                    $html[] = "[wpgmza id='{$mapId}']";

                    $html = implode("", $html);

                    $previewData = array(
                        'post_title' => __("WP Go Maps Preview", "wp-google-maps"),
                        'post_content' => $html,
                        'post_status' => 'draft',
                        'post_type' => 'page',
                        'post_author' => get_current_user_id(),
                        'meta_input' => array('_wpgmza_preview_id' => $mapId)
                    );

                    $previewId = wp_insert_post( $previewData );
                    if (is_wp_error($previewId)) {
                        $previewId = false;
                    }
                }

                if(!empty($previewId)){
                    return get_preview_post_link($previewId);
                }
            }
            
        }
        return false;
    }
}
