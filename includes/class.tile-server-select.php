<?php

namespace WPGMZA;

class TileServerSelect extends DOMDocument {
	public function __construct($options=null) {
		DOMDocument::__construct();
		
		if(!$options)
			$options = array();
		
		$this->loadHTML('<select></select>');
		
		$select		= $this->querySelector('select');
		
		if(!empty($options['name'])){
			$select->setAttribute('name', $options['name']);
        }

		$allowGroups = true;
		if(!empty($options['provider'])){
			/* Filtered by provider */
			$servers = TileServers::getByProvider($options['provider']);
			$allowGroups = false;
		}

		$allowKeyFlag = true;
		if(!empty($options['disableKeyFlags'])){
			$allowKeyFlag = false;
		}

		if(empty($options['disablePreveiws'])){
			$select->addClass('wpgmza-tile-server-preview');
		}

		$ingoreKeyServers = false;
		if(!empty($options['ingoreKeyServers'])){
			$ingoreKeyServers = true;
		}

		$ignoreCustom = false;
		if(!empty($options['ignoreCustom'])){
			$ignoreCustom = true;
		}

        $servers = !empty($servers) ? $servers : TileServers::getList();
		foreach($servers as $server) {
			if(!empty($ingoreKeyServers) && !empty($server->key_required)){
				continue;
			}

			if(!empty($ignoreCustom) && $server->url === 'custom_override'){
				continue;
			}

			$option = $this->createElement('option');
			$option->setAttribute('value', $server->url);

            $label = $server->label;
            if(!empty($server->key_required) && !empty($allowKeyFlag)){
                $label .= " *";
            }

			$option->appendText($label);

			if(!empty($server->url) && !empty($options['value']) && $server->url == $options['value']){
				$option->setAttribute("selected", "selected");
			}

			if(empty($options['disablePreveiws'])){
				/* Previews are enabled, and we can append the meta data for the server, directly to the option */
				$previewConfig = (object) array();
				if(!empty($server->multi)){
					/* Multi-layer - Requires some additional information */
					$previewConfig->multi = true;
					$previewConfig->layers = array();

					$server = TileServers::hydrate($server);
					if(!empty($server->layers)){
						foreach($server->layers as $layer){
							if(empty($layer->config)){
								continue;
							}

							$previewConfig->layers[] = (object) array(
								'url' => $layer->config->url,
								'key_required' => !empty($layer->config->key_required) ? true : false,
								'key_field_name' => !empty($layer->config->key_field_name) ? $layer->config->key_field_name : false,
								'params' => !empty($layer->config->params) ? $layer->config->params : false,
								'dependencies' => !empty($layer->config->dependencies) ? $layer->config->dependencies : false,
								'type' => !empty($layer->config->type) ? $layer->config->type : false,
								'provider' => !empty($layer->config->provider) ? $layer->config->provider : false,
								'label' => !empty($layer->config->label) ? $layer->config->label : false
							);

							
						}
					}
				} else {
					$previewConfig->url = $server->url;
					$previewConfig->key_required = !empty($server->key_required) ? true : false;
					$previewConfig->key_field_name = !empty($server->key_field_name) ? $server->key_field_name : false;
					$previewConfig->params = !empty($server->params) ? $server->params : false;
					$previewConfig->dependencies = !empty($server->dependencies) ? $server->dependencies : false;
					$previewConfig->type = $server->type;
					$previewConfig->provider = $server->provider;
					$previewConfig->label = $server->label;

				}
				$option->setAttribute('data-tile-server-preview-config', json_encode($previewConfig));
			}
			
			if(!empty($server->provider) && !empty($allowGroups)){
				/* We have a provider grouping */
				if($optgroup = $select->querySelector("optgroup[label='{$server->provider}']")){
					$optgroup->appendChild($option);
				} else {
					$group = $this->createElement('optgroup');
					$group->setAttribute('label', $server->provider);

					$group->appendChild($option);
					$select->appendChild($group);
				}
			} else {
				$select->appendChild($option);
			}
		}

	    /* Developer Hook (Action) - Alter the country select output, passes DOMElement for mutation */     
		do_action("wpgmza_tile_server_select_created", $select);
	}
}