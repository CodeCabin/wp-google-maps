/**
 * @namespace WPGMZA
 * @module CSSFilterInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.CSSFilterInput = function(element, options){
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

    WPGMZA.extend(WPGMZA.CSSFilterInput, WPGMZA.EventDispatcher);

    WPGMZA.CSSFilterInput.FILTER_PATTERN = /(\S+)/g;
    WPGMZA.CSSFilterInput.VALUE_PATTERN = /(\(\S*\))/g;

    WPGMZA.CSSFilterInput.createInstance = function(element) {
        return new WPGMZA.CSSFilterInput(element);
    }

    WPGMZA.CSSFilterInput.prototype.parseOptions = function(options){
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

    WPGMZA.CSSFilterInput.prototype.getFilters = function(override, format){
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

    WPGMZA.CSSFilterInput.prototype.setFilters = function(filters){
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

    WPGMZA.CSSFilterInput.prototype.clearFilters = function(){
        for(let i in this.filters){
            this.filters[i].enable = false;
            this.filters[i].value = 0;
        }
    }

    WPGMZA.CSSFilterInput.prototype.parseFilters = function(value){
        if(typeof value === "string"){
            value = value.trim().toLowerCase();
            if(value === ""){
                value = "none";
            }

            let filters = {};
            if(value !== "none"){
                /* Some filters exist */
                let matches = value.match(WPGMZA.CSSFilterInput.FILTER_PATTERN);
                if(matches && matches instanceof Array){
                    for(let match of matches){
                        let valueArg = match.match(WPGMZA.CSSFilterInput.VALUE_PATTERN);
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

    WPGMZA.CSSFilterInput.prototype.wrap = function(){
        var self = this;
        if(this.element && this.type === "text"){
            this.element.hide();
            this.container = $("<div class='wpgmza-css-filter-input-wrapper' />");

            this.container.insertAfter(this.element);
            this.container.append(this.element);
        } else {
            throw new Error("WPGMZA.CSSFilterInput requires a text field as a base");
        }
    }

    WPGMZA.CSSFilterInput.prototype.renderControls = function(){
        var self = this;
        if(this.container){
            this.itemWrappers = {};
            for(let type in this.filters){
                let data = this.filters[type];

                let printType = type.replace("_", " ");

                const wrapper = $("<div class='css-filter-item-wrap' data-type='" + type + "' />");

                const toggleWrap = $("<div class='css-filter-toggle-wrap' />");
                const toggleInput = $("<input type='checkbox' class='css-filter-item-toggle' />");
                const toggleLabel = $("<label />");

                const controlWrap = $("<div class='css-filter-control-wrap' />");

                let controlType = 'text';
                controlAttributes = "data-min='1' data-max='100'";
                if(data.unit === 'deg'){
                    controlAttributes = "data-min='1' data-max='360'";
                } else if (data.unit === 'px'){
                    controlAttributes = "data-min='1' data-max='200'";
                }

                const controlInput = $("<input class='css-filter-item-input' type='" + controlType + "' " + controlAttributes + " value='" + data.value + "' />");
                const controlLabel = $("<small />");
                controlLabel.append("<span>" + data.value + "</span>" + data.unit);

                const slider = $("<div class='css-filter-item-slider' />"); 


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
                    const parent = target.closest('.css-filter-item-wrap');
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
                    const parent = target.closest('.css-filter-item-wrap');
                    const type = parent.data('type');
                    this.setFilterValue(type, target.val());
                });

            }
        }
    }

    WPGMZA.CSSFilterInput.prototype.setFilterState = function(type, state){
        if(this.filters[type]){
            this.filters[type].enable = state;
        }

        this.commit();
    }

    WPGMZA.CSSFilterInput.prototype.setFilterValue = function(type, value){
        if(this.filters[type]){
            this.filters[type].value = parseFloat(value);
        }

        this.commit();
    }

    WPGMZA.CSSFilterInput.prototype.update = function(){
        if(this.container){
            for(let type in this.filters){
                const data = this.filters[type];
                
                const row = this.container.find('.css-filter-item-wrap[data-type="' + type + '"]');

                row.find('.css-filter-item-toggle').prop('checked', data.enable).trigger('change');
                row.find('.css-filter-item-input').val(data.value).trigger('change');

                row.find('.css-filter-item-slider').slider('value', data.value);
                row.find('.css-filter-control-wrap').find('small span').text(data.value);

            }
        }
    }

    WPGMZA.CSSFilterInput.prototype.commit = function(){
        var syncValue = this.getFilters();
        this.element.val(syncValue);
        this.element.trigger('change');
    }

    $(document.body).ready(function(){
        $("input.wpgmza-css-filter-input").each(function(index, el) {
            el.wpgmzaCSSFilterInput = WPGMZA.CSSFilterInput.createInstance(el);
        });
    });

});