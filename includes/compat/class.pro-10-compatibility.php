<?php

namespace WPGMZA;

class Pro10Compatibility{
    private $settings;

	public function __construct($settings){
        $this->settings = $settings;

        $this->validateMapEngine();

        add_action('wpgmza_global_settings_page_created', array($this, 'disableV10Features'));
        add_action('wpgmza_map_edit_page_created', array($this, 'disableV10Features'));
        add_action('wpgmza_installer_page_created', array($this, 'disableV10Features'));
	}
	
	public function validateMapEngine(){
        if($this->isIncompatible() || $this->isLegacy()){
            /* Pro is lower than X - Or is Legacy */
            if(!empty($this->settings) && !empty($this->settings->engine)){
                if($this->settings->engine !== 'google-maps' && $this->settings->engine !== 'open-layers'){
                    /* User is attempting to swap to a map engine which requires a Pro update */
                    $this->settings->wpgmza_maps_engine = 'google-maps';
                }
            }

            if(!empty($this->settings) && !empty($this->settings->wpgmza_default_items)){
                $defaultItems = intval($this->settings->wpgmza_default_items);
                $legacySupported = array(1, 5, 10, 25, 50, 100, -1);
                if(!in_array($defaultItems, $legacySupported)){
                    $this->settings->wpgmza_default_items = 5;
                }
            }
        }
	}

    public function disableV10Features($document){
        /* Optiosn/settings hidden here CANNOT work without V10 Pro */
        if($this->isIncompatible()){
            /* Map Engines */
            if($container = $document->querySelector('.wpgmza-map-engine-selector')){
                $incompatibilityEnginesHtml = array();
                $incompatibilityEnginesHtml[] = "<div class='wpgmza-card wpgmza-shadow notice notice-error' style='margin-left: 0; margin-bottom: 40px'>";
                $incompatibilityEnginesHtml[] = __("Some map engines have been disabled because you are running a Pro version below 10.0.0. To use these mapping engines, please update your Pro add-on or deactivate it, to utilize our basic feature set independently.", "wp-google-maps");
                $incompatibilityEnginesHtml[] = "</div>";
                $container->import(implode("", $incompatibilityEnginesHtml));
            }

            $options = $document->querySelectorAll('label.wpgmza-map-engine-item');
            if(!empty($options)){
                foreach($options as $option){
                    if($input = $option->querySelector('input')){
                        if($input->getAttribute('value') !== 'google-maps' && $input->getAttribute('value') !== 'open-layers'){
                            $option->addClass('wpgmza-feature-disable-incompatible');
                        }
                    }
                }
            }

            /* Info Windows */
            $infowindowStyles = $document->querySelectorAll('input[name="wpgmza_iw_type"]');
            if(!empty($infowindowStyles)){
                foreach($infowindowStyles as $style){
                    if(!in_array(intval($style->getAttribute('value')), array(0, 4))){
                        $style->parentNode->addClass('wpgmza-hidden');
                    }
                }
            }

            /* Category Filters */
            $filterStyles = $document->querySelectorAll('input[name="wpgmza_settings_filterbycat_type"]');
            if(!empty($filterStyles)){
                foreach($filterStyles as $style){
                    if(!in_array(intval($style->getAttribute('value')), array(1, 2))){
                        $style->parentNode->addClass('wpgmza-hidden');
                    }
                }
            }

            /* Marker Listing Styles */
            $listingStyles = $document->querySelectorAll('input[name="wpgmza_listmarkers_by"]');
            if(!empty($listingStyles)){
                foreach($listingStyles as $style){
                    if(in_array(intval($style->getAttribute('value')), array(9, 10))){
                        $style->parentNode->addClass('wpgmza-hidden');
                    }
                }
            }

            

            /* General settings/fields */
            $settings = (object) array(
                'hide' => array(
                    'select[name="address_provider"]', '[data-required-address-provider!="open-layers|open-layers-latest"]', '.wprmgza-preset-input-controller-presets',
                    'select[name="user_location_precision"]', 'input[name="enable_insights"]', 'input[name="reduce_editor_geocoding"]',
                    'input[name="wpml_disable_dynamic_translations"]', 'input[name="wpgmza_settings_infowindow_links_nofollow"]',
                    'option[value^="taxonomy_"]', '#beta-settings .tab-row', '.wpgmza-destroy-by-map-container',
                    'input[name="enable_anti_cache_requests"]', 'input[name="disable_map_previews"]',
                    'input[name="marker_listing_nudge_marker_center"]', 'input[name="category_filter_label_string"]',
                    'input[name="category_legends_label_string"]', 'select[name="category_legends_style"]',
                    'input[name="restrict_map_bounds"]', 'input[name="shape_filtering"]', 'input[name="enable_user_location_control"]',
                    'input[name="map_dimensions_mobile_override_enabled"]', 'input[name="lazyload_info_window_content"]', '.item[data-group="map-shape-library"]',
                    'select[name="insight_retention_period"]', '.grouping-toggle-fullscreen', 'input[name="enable_map_reset_control"]',
                    '.item[data-group="map-settings-themes-tileset"]', 'select[data-ajax-name="linestyle"]', 'input[data-ajax-name="linethickness"]',
                    '.wpgmza-boundary-input', '#wpgmza-table-container-Imageoverlay .wpgmza-marker-listing__actions',
                    '#wpgmza-table-container-Heatmap .wpgmza-marker-listing__actions', '.wpgmza-feature-panel[data-wpgmza-feature-type="polygon"] .wpgmza-category-picker-container',
                    '.wpgmza-feature-panel[data-wpgmza-feature-type="polyline"] .wpgmza-category-picker-container', '.wpgmza-feature-panel[data-wpgmza-feature-type="rectangle"] .wpgmza-category-picker-container',
                    '.wpgmza-feature-panel[data-wpgmza-feature-type="circle"] .wpgmza-category-picker-container'
                ),
                'disable' => array()
            );
            
            $formFieldsTypes = array('select', 'input', 'textarea', 'button');
            foreach($settings as $type => $selectors){
                foreach($selectors as $selector){
                    $fields = $document->querySelectorAll($selector);
                    if(!empty($fields)){
                        foreach($fields as $field){
                            $target = $field;
                            if(in_array(strtolower($field->nodeName), $formFieldsTypes)){
                                if($field->hasClass('cmn-toggle') || $field->hasClass('wpgmza-fancy-toggle-switch')){
                                    $closestRow = $field->closest('.tab-row');
                                    if($closestRow){
                                        $target = $closestRow;
                                    } else {
                                        $closestRow = $field->closest('.wpgmza-row');
                                        if($closestRow){
                                            $target = $closestRow;
                                        }
                                    }
                                } else {
                                    $target = $field->parentNode;
                                    if(!$target->hasClass('wpgmza-row') && !$target->hasClass('tab-row')){
                                        $closestRow = $field->closest('.tab-row');
                                        if($closestRow){
                                            $target = $closestRow;
                                        } else {
                                            $closestRow = $field->closest('.wpgmza-row');
                                            if($closestRow){
                                                $target = $closestRow;
                                            }
                                        }
                                    }
                                }
                            }

                            if($type === 'hide'){
                                $target->addClass('wpgmza-hidden');
                            } else if($type === 'disable'){
                                $target->addClass('wpgmza-feature-disable-incompatible');
                            }
                        }
                    }
                }
            }

            /* Some fields, controlled by JS, should be forced to show in compat mode */
            $mustShow = array(
                'googlemaps' => array(
                    'select[name="wpgmza_load_engine_api_condition"]', 'input[name="importer_google_maps_api_key"]',
                    'input[name="enable_google_api_async_param"]', 'input[name="wpgmza_prevent_other_plugins_and_theme_loading_api"]',
                    'select[name="googleMarkerMode"]', 'input[name="wpgmza_google_maps_api_key"]'
                ),
                'openlayers' => array(
                    'select[name="olMarkerMode"]', 'input[name="open_route_service_key"]', 'select[name="tile_server_url"]',
                    'input[name="open_layers_api_key"]'
                )
            );
            
            foreach($mustShow as $engine => $selectors){
                foreach($selectors as $selector){
                    $fields = $document->querySelectorAll($selector);
                    if(!empty($fields)){
                        foreach($fields as $field){
                            $closestRow = $field->closest('.tab-row');
                            if($closestRow){
                                $target = $closestRow;
                            } else {
                                $closestRow = $field->closest('.wpgmza-row');
                                if($closestRow){
                                    $target = $closestRow;
                                }
                            }

                            if(empty($target)){
                                continue;
                            }

                            $targetStyle = $target->getAttribute('style');
                            if(strpos($targetStyle, 'display')){
                                /* Likely has a style rule applied */
                                $target->removeAttribute('style');
                            } else if($target->hasClass('wpgmza-hidden')){
                                /* Using class based */
                                $target->removeClass('wpgmza-hidden');
                            }

                            if($target->hasAttribute('data-required-maps-engine')){
                                $target->removeAttribute('data-required-maps-engine');
                            }

                            $label = false;
                            $closestLabel = $target->querySelector('.title');
                            if($closestLabel){
                                $label = $closestLabel;
                            } else {
                                $closestLabel = $target->querySelector('label');
                                if($closestLabel){
                                    $label = $closestLabel;
                                }
                            }

                            if(!empty($label)){
                                $label->import(" <strong><small>(" . __(($engine === 'googlemaps' ? "Google Maps Only" : "Open Layers Only"), 'wp-google-maps') . ")</small></strong>");
                            }
                        }
                    }
                }
            }
        }
    }

    private function isIncompatible(){
        global $wpgmza_pro_version;
        if(!empty($wpgmza_pro_version)) {
		    if(version_compare($wpgmza_pro_version, '10.0.0', '<')){
                return true; 
            }
        }
        return false;
    }

    private function isLegacy(){
        if(!empty($this->settings) && !empty($this->settings->internal_engine) && $this->settings->internal_engine === InternalEngine::LEGACY){
            return true;
        }
        return false;
    }
}