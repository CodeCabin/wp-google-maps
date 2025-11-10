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
            add_action('pre_get_posts', array($this, 'onGetPosts'), 10, 1);
            add_filter('the_content', array($this, 'onPageContent'), 10, 1);
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
            if(!is_admin()){
                $target = $this->getTarget();
                if(!empty($target)){
                    return true;
                }
            }
        }
        return false;
    }

    public function getTarget(){
        if(!empty($_GET[self::PREVIEW_PARAM])){
            $target = intval($_GET[self::PREVIEW_PARAM]);
            if(!empty($target)){
                return $target;
            }
        }
        return false;
    }

    public function getPreviewLink($mapId){
        if($this->enabled()){
            $mapId = intval($mapId);
            if(!empty($mapId)){
                $homeUrl = home_url();
                if(!empty($homeUrl)){
                    return "{$homeUrl}?" . self::PREVIEW_PARAM . "={$mapId}";
                }
            }
        }
        
        return false;
    }

    public function onGetPosts($query){
        if(!empty($query)){
            if($this->active() && $query->is_main_query()){
                $frontPage = get_option('page_on_front');
                if(!empty($frontPage)){
                    $query->set('page_id', $frontPage); 
                }
            }
        }
    }

    public function onPageContent($content){
        if($this->active()){
            $mapId = $this->getTarget();
            if(!empty($mapId)){
                $previewHtml = "<div class='wpgmza-preview-mode-banner'>";
                $previewHtml .=   "<div class='wpgmza-preview-mode-banner-heading'>" . __("WP Go Maps Preview", "wp-google-maps") . " - " . __("Map ID", "wp-google-maps") . " {$mapId}</div>";
                $previewHtml .=   "<div class='wpgmza-preview-mode-banner-subheading'>" . __("This is a temporary preview and shows the latest saved version of your map.", "wp-google-maps") . "</div>";
                $previewHtml .=   "<div class='wpgmza-preview-mode-banner-shortcode-wrapper'><span>" . __("Your map shortcode is", "wp-google-maps") . "</span><strong>[[wpgmza id='{$mapId}']]</strong></div>";
                $previewHtml .= "</div>";
                $previewHtml .= do_shortcode("[wpgmza id='{$mapId}']");
                return $previewHtml;
            }
        }
        return $content;
    }
}
