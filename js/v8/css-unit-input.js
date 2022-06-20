/**
 * @namespace WPGMZA
 * @module CSSUnitInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.CSSUnitInput = function(element, options){
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

        this.unit = {
            value : 0,
            suffix : "px" 
        };

        this.wrap();
        this.renderControls();

        this.parseUnits(this.value);
    }

    WPGMZA.extend(WPGMZA.CSSUnitInput, WPGMZA.EventDispatcher);

    WPGMZA.CSSUnitInput.VALID_TYPES = ['px', '%', 'rem', 'em'];

    WPGMZA.CSSUnitInput.createInstance = function(element) {
        return new WPGMZA.CSSUnitInput(element);
    }

    WPGMZA.CSSUnitInput.prototype.parseOptions = function(options){
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

    WPGMZA.CSSUnitInput.prototype.getUnits = function(override, format){
        return this.unit.value + this.unit.suffix;
    }

    WPGMZA.CSSUnitInput.prototype.setUnits = function(value, suffix){
        this.unit.value = value ? parseFloat(value) : this.unit.value;
        this.unit.suffix = suffix ? suffix.trim() : this.unit.suffix;               

        if(this.unit.value - parseInt(this.unit.value) > 0.0){
            this.unit.value = parseFloat(this.unit.value.toFixed(2));
        }

        if(this.unit.value <= 0){
            this.unit.value = 0;
        }

        this.validateSuffix();
        this.commit();

        if(this.state.initialized){
            this.update();
        }
    }

    WPGMZA.CSSUnitInput.prototype.parseUnits = function(value){
        if(typeof value === "string"){
            value = value.trim().toLowerCase().replace(/ /g, '');
            if(value === ""){
                value = "0px";
            }

            let unit = value.match(/((\d+\.\d+)|(\d+))/);
            if(unit && unit[0]){
                unit = parseFloat(unit[0]);
            } else {
                unit = this.unit.value;
            }

            let suffix = value.match(/(([a-z]+)|(%))/);
            if(suffix && suffix[0]){
                suffix = suffix[0];
            } else {
                suffix = this.unit.suffix;
            }

            this.setUnits(unit, suffix);
        }
    }

    WPGMZA.CSSUnitInput.prototype.wrap = function(){
        var self = this;
        if(this.element && this.type === "text"){
            this.element.hide();
            this.container = $("<div class='wpgmza-styling-unit-input-wrapper' />");

            this.container.insertAfter(this.element);
            this.container.append(this.element);
        } else {
            throw new Error("WPGMZA.CSSUnitInput requires a text field as a base");
        }
    }

    WPGMZA.CSSUnitInput.prototype.renderControls = function(){
        var self = this;
        if(this.container){
            this.unitValueInput = $("<input type='text' class='unit-value-input' />");
            this.unitSuffixToggle = $("<div class='unit-suffix-toggle' />");

            this.unitValueStepDownBtn = $("<div class='unit-stepper-button' data-mode='down' />");
            this.unitValueStepUpBtn = $("<div class='unit-stepper-button' data-mode='up' />");
            this.unitValueStepperWrap = $("<div class='unit-stepper-wrapper' />");

            this.unitInnerWrap = $("<div class='unit-input-inner-wrap' />");

            this.unitValueStepperWrap.append(this.unitValueStepUpBtn);
            this.unitValueStepperWrap.append(this.unitValueStepDownBtn);

            this.unitInnerWrap.append(this.unitValueStepperWrap);
            this.unitInnerWrap.append(this.unitValueInput);
            this.unitInnerWrap.append(this.unitSuffixToggle);

            this.container.append(this.unitInnerWrap);

            this.state.initialized = true;

            this.unitValueInput.on('keydown', (event) => {
                const originalEvent = event.originalEvent;
                if(originalEvent.key && originalEvent.key.length === 1){
                    if(originalEvent.key.trim().length === 0 || (originalEvent.key !== '.' && isNaN(parseInt(originalEvent.key)))){
                        /* Space, hide the dimensions input */
                        this.unitSuffixToggle.hide();
                    } 
                } else {
                    if(originalEvent.key === 'ArrowUp'){
                        this.increment();
                    } else if(originalEvent.key === 'ArrowDown'){
                        this.decrement();
                    } else if(originalEvent.key === 'Enter'){
                        originalEvent.preventDefault();
                        originalEvent.stopPropagation();

                        $(event.currentTarget).trigger('change');
                    }
                }
            });

            this.unitValueInput.on('change', (event) => {
                const input = $(event.currentTarget);
                this.parseUnits(input.val());
            });

            this.unitValueStepUpBtn.on('click', (event) => {
                this.increment();
            });

            this.unitValueStepDownBtn.on('click', (event) => {
                this.decrement();
            });
        }
    }

    WPGMZA.CSSUnitInput.prototype.validateSuffix = function(){
        if(this.unit.suffix){
            if(WPGMZA.CSSUnitInput.VALID_TYPES.indexOf(this.unit.suffix) === -1){
                this.unit.suffix = this.options.defaultSuffix;
            }
        } else {
            this.unit.suffix = this.options.defaultSuffix;
        }
    }

    WPGMZA.CSSUnitInput.prototype.increment = function(){
        this.parseUnits(this.unitValueInput.val());
        
        let value = this.unit.value;
        if(value - parseInt(value) > 0.0){
            value += 0.1;
        } else {
            value += 1;
        }
        this.setUnits(value, this.unit.suffix);
    }

    WPGMZA.CSSUnitInput.prototype.decrement = function(){
        this.parseUnits(this.unitValueInput.val());

        let value = this.unit.value;
        if(value - parseInt(value) > 0.0){
            value -= 0.1;
        } else {
            value -= 1;
        }

        this.setUnits(this.unit.value - 1, this.unit.suffix);
    }

    WPGMZA.CSSUnitInput.prototype.update = function(){
        if(this.unitValueInput && this.unitSuffixToggle){
            this.unitValueInput.val(this.unit.value);
            this.unitSuffixToggle.text(this.unit.suffix);

            this.unitSuffixToggle.show();
        }
    }

    WPGMZA.CSSUnitInput.prototype.commit = function(){
        var syncValue = this.getUnits();
        this.element.val(syncValue);
        this.element.trigger('change');
    }

    $(document.body).ready(function(){
        $("input.wpgmza-stylig-unit-input").each(function(index, el) {
            el.wpgmzaCSSUnitInput = WPGMZA.CSSUnitInput.createInstance(el);
        });
    });

});