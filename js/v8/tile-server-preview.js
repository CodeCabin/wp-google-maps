/**
 * @namespace WPGMZA
 * @module TileServerPreview
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.TileServerPreview = function(element, options){
        if(!(element instanceof HTMLSelectElement))
            throw new Error("Element is not an instance of HTMLSelectElement");

        this.element = $(element);

        this.server = false;

        this.wrap();
        this.bindEvents();
        this.update();
    }

    WPGMZA.extend(WPGMZA.TileServerPreview, WPGMZA.EventDispatcher);

    WPGMZA.TileServerPreview.createInstance = function(element) {
        return new WPGMZA.TileServerPreview(element);
    }

    WPGMZA.TileServerPreview.prototype.wrap = function(){
        if(this.element){
            this.container = $("<div class='wpgmza-tile-server-preview-container' />");

            this.image = $("<img class='wpgmza-tile-server-preview-image' />");

            this.container.append(this.image);

            this.element.parent().append(this.container);
            this.container.append(this.element);
        } 
    }

    WPGMZA.TileServerPreview.prototype.bindEvents = function(){
        this.element.on('change', (event) => {
            if(event.target){
                this.server = event.target.value;
                this.update();
            }
        });

        $(document.body).on('tileserverpreview.update.wpgmza', () => {
            this.update();
        })

        this.element.trigger('change');
    }

    WPGMZA.TileServerPreview.prototype.update = function(){
        this.container.removeClass('preview-ready');
        this.container.removeClass('preview-failed');

        this.container.find('.wpgmza-tile-server-preview-wrapper-multi').remove();

        if(this.container.is(":hidden")){
            /* Skip, no reason to update */
            return;
        }

        const definition = this.lookup(this.server);
        if(definition){
            if(definition.multi){
                if(definition.layers && definition.layers.length){
                    this.setImage(this.getPreview(definition.layers[0]), this.image, definition);

                    for(let i in definition.layers){
                        if(i == 0){
                            continue;
                        }

                        let layer = definition.layers[i];
                        let secondaryImageWrapper = $("<div class='wpgmza-tile-server-preview-wrapper-multi' />");
                        let secondaryImage = $("<img class='wpgmza-tile-server-preview-image' />");

                        if(layer.dependencies){
                            for(let dependency of layer.dependencies){
                                let dependencyImage = $("<img class='wpgmza-tile-server-preview-image as-dependency' />");
                                secondaryImageWrapper.append(dependencyImage);

                                this.setImage(this.getPreview(dependency), dependencyImage);
                            }
                        }

                        secondaryImageWrapper.append(secondaryImage);
                        this.container.append(secondaryImageWrapper);

                        this.setImage(this.getPreview(layer), secondaryImage);
                    }
                    
                }
            } else {
                if(definition.dependencies){
                    for(let dependency of definition.dependencies){
                        let dependencyImage = $("<img class='wpgmza-tile-server-preview-image as-dependency' />");

                        this.setImage(this.getPreview(dependency), dependencyImage);
                        this.container.prepend(dependencyImage);
                    }

                }
                
                this.setImage(this.getPreview(definition), this.image, definition);
            }
        } else {
            this.container.addClass('preview-failed');
        }
    }

    WPGMZA.TileServerPreview.prototype.lookup = function(server){
        if(this.element.find(`option[value="${server}"]`)){
            const data = this.element.find(`option[value="${server}"]`).data('tile-server-preview-config');
            return data;
        }
        return false;
    }

    WPGMZA.TileServerPreview.prototype.getPreview = function(data){
        if(data.url){
            let url = data.url;
            url = decodeURI(url);

            const authentication = {};
            if(data.key_required){
                authentication.name = data.key_field_name ? data.key_field_name : 'apikey',
                authentication.token = this.getToken();
            }

            let replacements = [
                { key : "{z}", "value" : 7 },
                { key : "{x}", "value" : 20 },
                { key : "{y}", "value" : 49 },
                { key : "{s}", "value" : "a" },
                { key : "{a-c}", "value" : "a" },
            ];

            let params = data.params ? data.params : {};
            if(authentication && authentication.name && authentication.token){
                if(url.indexOf('{' + authentication.name + '}') !== -1){
                    replacements.push({key : "{" + authentication.name + "}", value : authentication.token});
                } else {
                    params[authentication.name] = authentication.token;
                }
            }

            if(url.indexOf("{alias:") !== -1){
                url = url.replace(/{alias:.*?}/, '');
            }

            let compiledParams = [];
            for(let paramName in params){
                compiledParams.push(`${paramName}=${params[paramName]}`);
            }

            compiledParams = compiledParams.join("&");
            if(compiledParams){
                url = `${url}?${compiledParams}`;
            }

            for(let replacementKey in replacements){
                const replacement = replacements[replacementKey];
                url = url.replace(replacement.key, replacement.value);
            }
            return url;
        }
        return false;
    }

    WPGMZA.TileServerPreview.prototype.setImage = function(url, imageElement, definition){
        this.container.removeAttr('data-failed-fallback');
        if(url){
            const previewImage = new Image();
            previewImage.src = url;
            previewImage.addEventListener('load', () => {
                imageElement.attr('src', previewImage.src);
                this.container.addClass('preview-ready');
            });

            previewImage.addEventListener('error', () => {
                this.container.addClass('preview-failed');

                if(definition && definition instanceof Object){
                    if(definition.type && definition.type === 'vector'){
                        /* Preview on vectors will not work, so we will need to fallback to our local images */
                        if(definition.label && definition.provider){
                            let fallback = `${definition.provider}-${definition.label}`;
                            this.container.attr('data-failed-fallback', fallback.toLowerCase().replaceAll(' ', '-'));
                        }
                    }
                }
            });
        } else {
            /* Failure */
            this.container.addClass('preview-failed');
        }
    }

    WPGMZA.TileServerPreview.prototype.getToken = function(){
        let engine = WPGMZA.settings ? WPGMZA.settings.engine : false;

        if($('[name="wpgmza_maps_engine"]:checked').length){
            if($('[name="wpgmza_maps_engine"]:checked').val() !== engine){
                engine = $('[name="wpgmza_maps_engine"]:checked').val();
            }
        }

        if(engine){
            let tokenFieldName = false;
            let token = false;
            switch(engine){
                case 'open-layer':
                case 'open-layer-latest':
                    tokenFieldName = 'open_layers_api_key';
                    break;
                case 'leaflet':
                    tokenFieldName = 'leaflet_api_key';
                    break;
                case 'leaflet-azure':
                    tokenFieldName = 'wpgmza_leaflet_azure_key';
                    break;
                case 'leaflet-stadia':
                    tokenFieldName = 'wpgmza_leaflet_stadia_key';
                    break;
                case 'leaflet-maptiler':
                    tokenFieldName = 'wpgmza_leaflet_maptiler_key';
                    break;
                case 'leaflet-locationiq':
                    tokenFieldName = 'wpgmza_leaflet_locationiq_key';
                    break;
            }

            if(WPGMZA.settings && WPGMZA.settings[tokenFieldName]){
                token = WPGMZA.settings[tokenFieldName];
            }

            if($('[name="' + tokenFieldName + '"]').length){
                if($('[name="' + tokenFieldName + '"]').val() !== token){
                    token = $('[name="' + tokenFieldName + '"]').val();
                }
            }

            return token;
        }
        return false;
    }

    $(document.body).ready(function(){
        $("select.wpgmza-tile-server-preview").each(function(index, el) {
            el.wpgmzaTileServerPreview = WPGMZA.TileServerPreview.createInstance(el);
        });
    });

});