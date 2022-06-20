/**
 * @namespace WPGMZA
 * @module CSSBackdropFilterInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.CSSBackdropFilterInput = function(element, options){
        if(!(element instanceof HTMLInputElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.dataAttributes = this.element.data();
        this.type = element.type;
        this.value = element.value;

        this.options = {

        };

        this.parseOptions(options);

        this.state = {
            initialized : false
        }

        this.filters = {
            blur : {
                enable : false,
                value : 0,
                unit : 'px'
            },
            brightness : {
                enable : false,
                value : 0,
                unit : '%'
            },
            contrast : {
                enable : false,
                value : 0,
                unit : '%'
            },
            grayscale : {
                enable : false,
                value : 0,
                unit : '%'
            },
            hue_rotate : {
                enable : false,
                value : 0,
                unit : 'deg'
            },
            invert : {
                enable : false,
                value : 0,
                unit : '%'
            },
            sepia : {
                enable : false,
                value : 0,
                unit : '%'
            },
            saturate : {
                enable : false,
                value : 0,
                unit : '%'
            }
        };

        this.wrap();
        this.renderControls();

        this.parseFilters(this.value);
    }

    WPGMZA.extend(WPGMZA.CSSBackdropFilterInput, WPGMZA.EventDispatcher);

    WPGMZA.CSSBackdropFilterInput.FILTER_PATTERN = /(\S+)/g;
    WPGMZA.CSSBackdropFilterInput.VALUE_PATTERN = /(\(\S*\))/g;

    WPGMZA.CSSBackdropFilterInput.createInstance = function(element) {
        return new WPGMZA.CSSBackdropFilterInput(element);
    }

    WPGMZA.CSSBackdropFilterInput.prototype.parseOptions = function(options){
        if(options){
            for(var i in options){
                if(typeof this.options[i] !== 'undefined'){
                    if(typeof this.options[i] === 'object' && typeof options[i] === 'object'){
                        this.options[i] = Object.assign(this.options[i], options[i]);
                    } else {
                        this.options[i] = options[i];
                    }
                }
            }
        }

        if(this.dataAttributes){
            for(var i in this.dataAttributes){
                if(typeof this.options[i] !== 'undefined'){
                    this.options[i] = this.dataAttributes[i];
                } 
            }
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.getFilters = function(override, format){
        let filters = [];
        for(let type in this.filters){
            const data = this.filters[type];

            if(data.enable){
                type = type.replace("_", "-");
                filters.push(type + "(" + data.value + data.unit + ")");
            }
        }
        return filters.length > 0 ? filters.join(" ") : "none";
    }

    WPGMZA.CSSBackdropFilterInput.prototype.setFilters = function(filters){
        this.clearFilters();
        
        if(filters instanceof Object){
            for(let type in filters){
                if(this.filters[type]){
                    const value = filters[type];
                    if(value){
                        this.filters[type].enable = true;
                        this.filters[type].value = value;
                    }
                }
            }
        }
        
        this.commit();
        if(this.state.initialized){
            this.update();
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.clearFilters = function(){
        for(let i in this.filters){
            this.filters[i].enable = false;
            this.filters[i].value = 0;
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.parseFilters = function(value){
        if(typeof value === "string"){
            value = value.trim().toLowerCase();
            if(value === ""){
                value = "none";
            }

            let filters = {};
            if(value !== "none"){
                /* Some filters exist */
                let matches = value.match(WPGMZA.CSSBackdropFilterInput.FILTER_PATTERN);
                if(matches && matches instanceof Array){
                    for(let match of matches){
                        let valueArg = match.match(WPGMZA.CSSBackdropFilterInput.VALUE_PATTERN);
                        valueArg = valueArg instanceof Array && valueArg.length > 0 ? valueArg[0] : '';

                        let type = match.replace(valueArg, '').replace('-', '_');
                        let value = null;
                        if(valueArg.length > 0){
                            let numericValue = valueArg.match(/(\d+)/g);
                            if(numericValue instanceof Array && numericValue.length > 0){
                                value = parseFloat(numericValue[0]);
                            }
                        }

                        filters[type] = value;
                    }
                }
            }

            this.setFilters(filters);
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.wrap = function(){
        var self = this;
        if(this.element && this.type === "text"){
            this.element.hide();
            this.container = $("<div class='wpgmza-styling-backdrop-filter-input-wrapper' />");

            this.container.insertAfter(this.element);
            this.container.append(this.element);
        } else {
            throw new Error("WPGMZA.CSSUnitInput requires a text field as a base");
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.renderControls = function(){
        var self = this;
        if(this.container){
            this.itemWrappers = {};
            for(let type in this.filters){
                let data = this.filters[type];

                let printType = type.replace("_", " ");

                const wrapper = $("<div class='backdrop-filter-item-wrap' data-type='" + type + "' />");

                const toggleWrap = $("<div class='backdrop-filter-toggle-wrap' />");
                const toggleInput = $("<input type='checkbox' class='backdrop-filter-item-toggle' />");
                const toggleLabel = $("<label />");

                const controlWrap = $("<div class='backdrop-filter-control-wrap' />");

                let controlType = 'text';
                controlAttributes = "data-min='1' data-max='100'";
                if(data.unit === 'deg'){
                    controlAttributes = "data-min='1' data-max='360'";
                } else if (data.unit === 'px'){
                    controlAttributes = "data-min='1' data-max='200'";
                }

                const controlInput = $("<input class='backdrop-filter-item-input' type='" + controlType + "' " + controlAttributes + " value='" + data.value + "' />");
                const controlLabel = $("<small />");
                controlLabel.append("<span>" + data.value + "</span>" + data.unit);

                const slider = $("<div class='backdrop-filter-item-slider' />"); 


                toggleLabel.append(toggleInput);
                toggleLabel.append(printType);

                toggleWrap.append(toggleLabel);

                controlWrap.append(controlInput);
                controlWrap.append(controlLabel);
                controlWrap.append(slider);

                wrapper.append(toggleWrap);
                wrapper.append(controlWrap);


                this.itemWrappers[type] = wrapper;
                this.container.append(wrapper);

                this.state.initialized = true;
                
                /* Events */
                slider.slider({
                    range: "max",
                    min: controlInput.data('min'),
                    max: controlInput.data('max'),
                    value: controlInput.val(),
                    slide: function( event, ui ) {
                        controlInput.val(ui.value);
                        controlLabel.find('span').text(ui.value);
                        controlInput.trigger('change');
                        // self.commit();
                    },
                    change: function(event, ui){
                    }
                });

                controlInput.wpgmzaRelativeSlider = slider;               

                toggleInput.on('change', (event) => {
                    const target = $(event.currentTarget);
                    const parent = target.closest('.backdrop-filter-item-wrap');
                    const type = parent.data('type');

                    if(target.is(':checked')){
                        parent.addClass('enabled');
                        this.setFilterState(type, true);
                    } else {
                        parent.removeClass('enabled');
                        this.setFilterState(type, false);
                    }
                });

                controlInput.on('change', (event) => {
                    const target = $(event.currentTarget);
                    const parent = target.closest('.backdrop-filter-item-wrap');
                    const type = parent.data('type');
                    this.setFilterValue(type, target.val());
                });

            }
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.setFilterState = function(type, state){
        if(this.filters[type]){
            this.filters[type].enable = state;
        }

        this.commit();
    }

    WPGMZA.CSSBackdropFilterInput.prototype.setFilterValue = function(type, value){
        if(this.filters[type]){
            this.filters[type].value = parseFloat(value);
        }

        this.commit();
    }

    WPGMZA.CSSBackdropFilterInput.prototype.update = function(){
        if(this.container){
            for(let type in this.filters){
                const data = this.filters[type];
                
                const row = this.container.find('.backdrop-filter-item-wrap[data-type="' + type + '"]');

                row.find('.backdrop-filter-item-toggle').prop('checked', data.enable).trigger('change');
                row.find('.backdrop-filter-item-input').val(data.value).trigger('change');

                row.find('.backdrop-filter-item-slider').slider('value', data.value);
                row.find('.backdrop-filter-control-wrap').find('small span').text(data.value);

            }
        }
    }

    WPGMZA.CSSBackdropFilterInput.prototype.commit = function(){
        var syncValue = this.getFilters();
        this.element.val(syncValue);
        this.element.trigger('change');
    }

    $(document.body).ready(function(){
        $("input.wpgmza-styling-backdrop-filter-input").each(function(index, el) {
            el.wpgmzaCSSBackdropFilterInput = WPGMZA.CSSBackdropFilterInput.createInstance(el);
        });
    });

});