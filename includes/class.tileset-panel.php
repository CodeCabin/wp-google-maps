<?php

namespace WPGMZA;

class TilesetPanel extends DOMDocument
{
	public function __construct($map=null) {
		global $wpgmza;
		
		DOMDocument::__construct();
		
		$this->loadPHPFile($wpgmza->internalEngine->getTemplate('tileset-panel.html.php'));
		
        $tileServer = TileServers::getBySettings($wpgmza->settings);
        if(!empty($tileServer) && !empty($tileServer->provider) && $tileServer->url !== 'custom_override'){
            $supported = TileServers::getByProvider($tileServer->provider);
            if(!empty($supported)){
                foreach($supported as $server){
                    if($server->url === 'custom_override'){
                        continue;
                    }

                    if($tileServer->url === $server->url){
                        if($default = $this->querySelector('.tileset-default')){
                            $default->import("<small class='wpgmza-margin-t-10'><strong>" . esc_html($server->label) . "</strong></small>");
                        }
                        continue;
                    }

                    $this->addOption($server);
                }
            }
        } 
		
		if($map){
			$this->populate($map);
        }
	}

    public function addOption($server){
        $preview = $this->getPreview($server);
        if(!empty($preview->url)){
            $container = $this->querySelector('.tileset-selection-panel');
            if($container){
                $html = array();
                $html[] = "<label class='wpgmza-check-card-selector tileset-option " . ($preview->url === 'vector' ? 'as-vector' : '') . "'>";
                $html[] =    "<input type='radio' name='tile_server_override' value='" . esc_attr($server->slug) . "' />";

                if($preview->url !== 'vector'){
                    if(!empty($preview->layers)){
                        $html[] =    "<div class='as-multi-layer'>";

                        if(!empty($preview->dependencies)){
                            /* Process dependency layers */
                            foreach($preview->dependencies as $dependency){
                                if(!empty($dependency)){
                                    $html[] =    "<img src='" . esc_url($dependency) . "' class='as-layer' onerror='this.remove();' />";
                                }
                            }
                        }

                        /* Process additional layers, switchable */
                        foreach($preview->layers as $layer){
                            if(!empty($layer)){
                                $html[] =    "<img src='" . esc_url($layer) . "' class='as-layer' onerror='this.remove();' />";
                            }
                        }

                        $html[] =    "</div>";
                    } else {
                        if(!empty($preview->dependencies)){
                            /* Process dependency layers */
                            foreach($preview->dependencies as $dependency){
                                if(!empty($dependency)){
                                    $html[] =    "<img src='" . esc_url($dependency) . "' class='as-dependency' onerror='this.remove();' />";
                                }
                            }
                        }
                    }
                    
                    $html[] =    "<img src='" . esc_url($preview->url) . "' onerror='this.parentElement.classList.add(\"tileset-panel-error\");' />";
                }
                
                $html[] =    "<span>" . esc_html($server->label) . "</span>";

                $html[] =    "<button type='button' class='wpgmza-button'>";
                $html[] =       __("Select Tileset", "wp-google-maps");
                $html[] =       " &raquo;";
                $html[] =    "</button>";
                $html[] = "</label>";

                $container->import(implode("", $html));
            }
        }
    }

    public function getPreview($server){
        global $wpgmza;

        $preview = (object) array(
            'url' => false,
            'dependencies' => false,
            'layers' => false
        );

        if(!empty($server->url)){
            $preview->url = $server->url;

            $dependencies = array();
            $layers = array();
            
            $server = TileServers::hydrate($server);

            $authentication = (object) array();
            if(!empty($wpgmza->settings) && !empty($wpgmza->settings->engine)){
                switch($wpgmza->settings->engine){
                    case 'open-layers':
                    case 'open-layers-latest':
                        $authentication->token = !empty($wpgmza->settings->open_layers_api_key) ? $wpgmza->settings->open_layers_api_key : false;
                        break;
                    case 'leaflet':
                        $authentication->token = !empty($wpgmza->settings->leaflet_api_key) ? $wpgmza->settings->leaflet_api_key : false;
                        break;
                    case 'leaflet-azure':
                        $authentication->token = !empty($wpgmza->settings->wpgmza_leaflet_azure_key) ? $wpgmza->settings->wpgmza_leaflet_azure_key : false;
                        break;
                    case 'leaflet-stadia':
                        $authentication->token = !empty($wpgmza->settings->wpgmza_leaflet_stadia_key) ? $wpgmza->settings->wpgmza_leaflet_stadia_key : false;
                        break;
                    case 'leaflet-maptiler':
                        $authentication->token = !empty($wpgmza->settings->wpgmza_leaflet_maptiler_key) ? $wpgmza->settings->wpgmza_leaflet_maptiler_key : false;
                        break;
                    case 'leaflet-locationiq':
                        $authentication->token = !empty($wpgmza->settings->wpgmza_leaflet_locationiq_key) ? $wpgmza->settings->wpgmza_leaflet_locationiq_key : false;
                        break;
                }
            }

		    $params = false;
            if(!empty($server->type) && $server->type === 'vector'){
                /* Vector layers cannot be previews, but they can be swapped */
                if($server->provider === 'OpenFreeMap'){
                    /* We have special placeholder previews for these we can use */
                    return (object) array(
                        'url' => WPGMZA_PLUGIN_DIR_URL . 'images/' . strtolower($server->provider) . "-" . strtolower($server->label) . ".png"
                    );
                }
                return (object) array('url' => 'vector');
            } else if(!empty($server) && !empty($server->multi)){
                if(!empty($server->layers)){
                    foreach($server->layers as $layerIndex => $layer){
                        if($layerIndex === 0){
                            /* Primary layers, dictates the base rended */
                            $preview->url = $layer->config->url;

                            if(!empty($layer->config->key_required)){
                                $authentication->name = !empty($layer->config->key_field_name) ? $layer->config->key_field_name : 'apikey';
                            }

                            if(!empty($layer->config->params)){
                                $params = (array) $layer->config->params;
                            }
                        } else {
                            /* Additional layer, process individually */
                            $layerUrl = $this->compileUrl($layer->config->url, $authentication, $layer->config->params);
                            if(!empty($layerUrl)){
                                $layers[] = $layerUrl;
                            }

                            /* Dependencies */
                            if(!empty($layer->config->dependencies)){
                                foreach($layer->config->dependencies as $dependency){
                                    $dependencyUrl = $this->compileUrl($dependency->url, $authentication, $dependency->params);
                                    if(!empty($dependencyUrl)){
                                        $dependencies[] = $dependencyUrl;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if(!empty($server->key_required)){
                    $authentication->name = !empty($server->key_field_name) ? $server->key_field_name : 'apikey';
                }

                if(!empty($server->params)){
                    $params = (array) $server->params;
                }

                /* Handle dependencies */
                if(!empty($server->dependencies)){
                    foreach($server->dependencies as $dependency){
                        $dependencyUrl = $this->compileUrl($dependency->url, $authentication, $dependency->params);
                        if(!empty($dependencyUrl)){
                            $dependencies[] = $dependencyUrl;
                        }
                    }
                }

            }

            $preview->url = $this->compileUrl($preview->url, $authentication, $params);

            if(!empty($layers)){
                $preview->layers = $layers;
            }

            if(!empty($dependencies)){
                $preview->dependencies = $dependencies;
            }
        }
        return $preview;
    }

    public function compileUrl($url, $authentication = false, $params = false){
        if(!empty($params) && is_object($params)){
            $params = (array) $params;
        }

        if(!empty($authentication) && is_object($authentication) && !empty($authentication->name) && !empty($authentication->token)){
            if(strpos($url, "{" . $authentication->name . "}") !== FALSE){
                    $url = str_replace("{" . $authentication->name . "}", $authentication->token, $url);
            } else {
                if(empty($params)){
                    $params = array();
                }

                $params[$authentication->name] = $authentication->token;
            }
        }

        if(!empty($params) && is_array($params)){
            $compiledParams = array();
            foreach($params as $paramK => $paramV){
                $compiledParams[] = "{$paramK}={$paramV}";
            }

            $compiledParams = implode("&", $compiledParams);

            if(!empty($compiledParams)){
                $url .= "?{$compiledParams}";
            }
        }

        $url = preg_replace("/{alias:.*?}/", "", $url);

        $url = str_replace("{a-c}", "a", $url);
        $url = str_replace("{s}", "a", $url);
        $url = str_replace("{z}/{x}/{y}", "7/20/49", $url);
        $url = str_replace("{z}", "7", $url);
        $url = str_replace("{x}", "20", $url);
        $url = str_replace("{y}", "49", $url);
        

        return $url;
    }
}
