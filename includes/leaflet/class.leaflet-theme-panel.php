<?php

namespace WPGMZA;

class LeafletThemePanel extends DOMDocument{
	public function __construct($map=null){
		global $wpgmza;
		DOMDocument::__construct();
		$this->loadPHPFile($wpgmza->internalEngine->getTemplate('leaflet-theme-panel.html.php'));
		$tileServer = "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png";
		if(!empty($wpgmza->settings) && !empty($wpgmza->settings->tile_server_url)){
			$tileServer = $wpgmza->settings->tile_server_url;
		}

		$authentication = (object) array();
		if(!empty($wpgmza->settings) && !empty($wpgmza->settings->engine)){
			switch($wpgmza->settings->engine){
				case 'leaflet':
					$tileServer = $wpgmza->settings->tile_server_url;
					
					$authentication->token = !empty($wpgmza->settings->leaflet_api_key) ? $wpgmza->settings->leaflet_api_key : false;
					break;
				case 'leaflet-azure':
					$tileServer = $wpgmza->settings->tile_server_url_leaflet_azure;
					
					$authentication->token = !empty($wpgmza->settings->wpgmza_leaflet_azure_key) ? $wpgmza->settings->wpgmza_leaflet_azure_key : false;
					break;
				case 'leaflet-stadia':
					$tileServer = $wpgmza->settings->tile_server_url_leaflet_stadia;
					
					$authentication->token = !empty($wpgmza->settings->wpgmza_leaflet_stadia_key) ? $wpgmza->settings->wpgmza_leaflet_stadia_key : false;
					break;
				case 'leaflet-maptiler':
					$tileServer = $wpgmza->settings->tile_server_url_leaflet_maptiler;
					
					$authentication->token = !empty($wpgmza->settings->wpgmza_leaflet_maptiler_key) ? $wpgmza->settings->wpgmza_leaflet_maptiler_key : false;
					break;
				case 'leaflet-locationiq':
					$tileServer = $wpgmza->settings->tile_server_url_leaflet_locationiq;
					
					$authentication->token = !empty($wpgmza->settings->wpgmza_leaflet_locationiq_key) ? $wpgmza->settings->wpgmza_leaflet_locationiq_key : false;
					break;
				case 'leaflet-zerocost':
					$tileServer = $wpgmza->settings->tile_server_url_leaflet_zerocost;
					break;
			}
		}
		

		$params = false;

		$serverDefinition = TileServers::getByUrl($tileServer);
		if(!empty($serverDefinition) && !empty($serverDefinition->type) && $serverDefinition->type === 'vector'){
			/* Vector cannot be live rendered like this */
			$fallback = TileServers::getBySlug('openstreetmap');
			if(!empty($fallback) && !empty($fallback->url)){
				$tileServer = $fallback->url;
			}

			if($serverDefinition->provider === "OpenFreeMap"){
				/* We have special fallbacks for openfreemap */
				$tileServer =  WPGMZA_PLUGIN_DIR_URL . 'images/' . strtolower($serverDefinition->provider) . "-" . strtolower($serverDefinition->label) . ".png";
			}
		} else if(!empty($serverDefinition) && !empty($serverDefinition->multi)){
			if(!empty($serverDefinition->layers)){
				if($serverDefinition->layers[0]){
					$layer = $serverDefinition->layers[0];
					$tileServer = $layer->config->url;

					if(!empty($layer->config->key_required)){
						$authentication->name = !empty($layer->config->key_field_name) ? $layer->config->key_field_name : 'apikey';
					}

					if(!empty($layer->config->params)){
						$params = (array) $layer->config->params;
					}
				}
			}
		} else {
			if(!empty($serverDefinition) && !empty($serverDefinition->key_required)){
				$authentication->name = !empty($serverDefinition->key_field_name) ? $serverDefinition->key_field_name : 'apikey';
			}

			if(!empty($serverDefinition) && !empty($serverDefinition->params)){
				$params = (array) $serverDefinition->params;
			}
		}

		$this->prepare($tileServer, $authentication, $params);
	}

	public function prepare($tileServer, $authentication = false, $params = false){
		if(!empty($authentication) && is_object($authentication) && !empty($authentication->name) && !empty($authentication->token)){
			if(strpos($tileServer, "{" . $authentication->name . "}") !== FALSE){
					$tileServer = str_replace("{" . $authentication->name . "}", $authentication->token, $tileServer);
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
				$tileServer .= "?{$compiledParams}";
			}
		}

		$tileServer = str_replace("{a-c}", "a", $tileServer);
		$tileServer = str_replace("{s}", "a", $tileServer);
		$tileServer = str_replace("{z}/{x}/{y}", "7/20/49", $tileServer);
		$tileServer = str_replace("{z}", "7", $tileServer);
		$tileServer = str_replace("{x}", "20", $tileServer);
		$tileServer = str_replace("{y}", "49", $tileServer);
		$tileServer = preg_replace("/{alias:.*?}/", "", $tileServer);

		$images = $this->querySelectorAll('img');
		if(!empty($images)){
			foreach($images as $image){
				$image->setAttribute('src', $tileServer);
				if(!empty($image->parentNode)){
					$filter = $image->parentNode->getAttribute('data-filter');
					$image->setAttribute('style', "filter: {$filter};");

					$image->setAttribute('onerror', "this.parentElement.classList.add('theme-panel-error');");
				}
			}
		}
	}

}
