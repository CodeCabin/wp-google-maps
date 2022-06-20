/**
 * @namespace WPGMZA
 * @module StylingPage
 * @requires WPGMZA
 */

jQuery(function($) {
	WPGMZA.StylingPage = function(){
		var self = this;
		
        this.element = document.body;
        
        this.styleGuide = {
            wrapper : $(this.element).find('.wpgmza-styling-map-preview .wpgmza-style-guide-wrapper')
        };

        this.controls = {};
        $(this.element).find('.wpgmza-styling-editor fieldset').each(function(){
            self.prepareControl(this);
        });

        $(this.element).find('.wpgmza-styling-preset-select').on('change', function(){
            self.applyPreset(this);
        });

        this.bindEvents();
        this.parseUserPreset();
    }

    WPGMZA.StylingPage.PRESETS = {};
    WPGMZA.StylingPage.PRESETS.default = {
        "--wpgmza-component-color" : "#ffffff",
        "--wpgmza-component-text-color" : "#000000",
        "--wpgmza-component-color-accent" : "#1A73E8",
        "--wpgmza-component-text-color-accent" : "#ffffff",
        "--wpgmza-color-grey-500" : "#bfbfbf",
        "--wpgmza-component-border-radius" : "2px",
        "--wpgmza-component-font-size" : "15px",
        "--wpgmza-component-backdrop-filter" : "none"
    };
    
    WPGMZA.StylingPage.PRESETS.glass = {
        "--wpgmza-component-color" : "rgba(255, 255, 255, 0.3)",
        "--wpgmza-component-text-color" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-text-color"],
        "--wpgmza-component-color-accent" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-color-accent"],
        "--wpgmza-component-text-color-accent" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-text-color-accent"],
        "--wpgmza-color-grey-500" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-color-grey-500"],
        "--wpgmza-component-border-radius" : "8px",
        "--wpgmza-component-font-size" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-font-size"],
        "--wpgmza-component-backdrop-filter" : "blur(20px)"
    };

    WPGMZA.StylingPage.PRESETS.rounded = {
        "--wpgmza-component-color" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-color"],
        "--wpgmza-component-text-color" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-text-color"],
        "--wpgmza-component-color-accent" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-color-accent"],
        "--wpgmza-component-text-color-accent" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-text-color-accent"],
        "--wpgmza-color-grey-500" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-color-grey-500"],
        "--wpgmza-component-border-radius" : "20px",
        "--wpgmza-component-font-size" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-font-size"],
        "--wpgmza-component-backdrop-filter" : WPGMZA.StylingPage.PRESETS.default["--wpgmza-component-backdrop-filter"]
    };

    WPGMZA.StylingPage.createInstance = function(){
        return new WPGMZA.StylingPage();
    }

    WPGMZA.StylingPage.prototype.prepareControl = function(element){
        var container = $(element);
        var input = container.find('input');

        var name = input.attr('name');

        if(name.trim() === ""){
            return;
        }
        
        this.controls[name] = {
            container : container,
            input : input
        };

        let activeInput = this.controls[name].input.length > 0 ? this.controls[name].input.get(0) : false;
        if(activeInput){
            if(activeInput.wpgmzaColorInput){
                const colorInput = activeInput.wpgmzaColorInput;
                if(colorInput.container){
                    this.controls[name].resetButton = $("<div class='wpgmza-styling-editor-reset-btn' data-reset-control-name='" + name + "' />");
                    colorInput.container.prepend(this.controls[name].resetButton);
                    colorInput.container.addClass('wpgmza-styling-editor-contains-reset');
                }
            } else if(activeInput.wpgmzaCSSUnitInput){
                const unitInput = activeInput.wpgmzaCSSUnitInput;
                if(unitInput.container){
                    this.controls[name].resetButton = $("<div class='wpgmza-styling-editor-reset-btn' data-reset-control-name='" + name + "' />");
                    unitInput.container.prepend(this.controls[name].resetButton);
                    unitInput.container.addClass('wpgmza-styling-editor-contains-reset');
                }

            }
        }


        this.resetControl(this.controls[name]);

    }

    WPGMZA.StylingPage.prototype.bindEvents = function(){
        var self = this;
        for(var name in this.controls){
            this.controls[name].input.on('change', function(){
                self.updateControl(this);
            });
        }

        this.styleGuide.steps = this.styleGuide.wrapper.find('.wpgmza-style-guide-step').length;
        this.styleGuide.index = 0;

        this.styleGuide.wrapper.find('.wpgmza-style-guide-nav .prev-btn').on('click', function(){
            self.styleGuide.index -= 1;
            if(self.styleGuide.index < 0){
                self.styleGuide.index = (self.styleGuide.steps - 1);
            }

            self.styleGuide.wrapper.trigger('update-view');
        });

        this.styleGuide.wrapper.find('.wpgmza-style-guide-nav .next-btn').on('click', function(){
            self.styleGuide.index += 1;
            if(self.styleGuide.index >= self.styleGuide.steps){
                self.styleGuide.index = 0;
            }

            self.styleGuide.wrapper.trigger('update-view');
        });

        this.styleGuide.wrapper.on('update-view', function(){
            self.styleGuide.wrapper.find('.wpgmza-style-guide-step').removeClass('active');
            self.styleGuide.wrapper.find('.wpgmza-style-guide-step:nth-child(' + (self.styleGuide.index + 1) + ')').addClass('active');
        });

        /* Body bound events */
        $(document.body).on('click', '.wpgmza-styling-editor-reset-btn', function(){
            const element = $(this);
            const field = $(this).data('reset-control-name');
            if(field && self.controls[field]){
                self.resetControl(self.controls[field]);
            }
        });
    }

    WPGMZA.StylingPage.prototype.updateControl = function(input){
        var name = $(input).attr('name');
        if(name && name.indexOf('--') !== -1){
            $('.wpgmza-styling-preview-wrap .wpgmza_map').css(name, $(input).val());
        }
    }

    WPGMZA.StylingPage.prototype.resetControl = function(control){
        var name = control.input.attr('name');
        if(!name || name.indexOf('--') === -1){
            return;
        }

        var value = $(':root').css(name);
        if(value){
            value = value.trim();

            const activeInput = control.input.length > 0 ? control.input.get(0) : false;
            if(activeInput){
                if(activeInput.wpgmzaColorInput){
                    const colorInput = activeInput.wpgmzaColorInput;
                    colorInput.parseColor(value);
                } else if(activeInput.wpgmzaCSSUnitInput){
                    const unitInput = activeInput.wpgmzaCSSUnitInput;
                    unitInput.parseUnits(value);
                } else if(activeInput.wpgmzaCSSBackdropFilterInput){
                    const backdropInput = activeInput.wpgmzaCSSBackdropFilterInput;
                    backdropInput.parseFilters(value);
                } else {
                    control.input.val(value);
                }
            } 
        }
    }

    WPGMZA.StylingPage.prototype.parseUserPreset = function(){
        if(WPGMZA.stylingSettings && WPGMZA.stylingSettings instanceof Object){
            if(Object.keys(WPGMZA.stylingSettings).length > 0){
                WPGMZA.StylingPage.PRESETS.user = WPGMZA.stylingSettings;
                $('.wpgmza-styling-preset-select').append("<option value='user'>User Defined</option>");
                $('.wpgmza-styling-preset-select').val('user').trigger('change');
            }
        }
    }

    WPGMZA.StylingPage.prototype.applyPreset = function(element){
        element = $(element);
        const value = element.val();
        if(value && WPGMZA.StylingPage.PRESETS[value]){
            const preset = WPGMZA.StylingPage.PRESETS[value];
            for(let fieldName in preset){
                const fieldValue = preset[fieldName];

                let field = $(this.element).find('input[name="' + fieldName + '"]');
                if(field.length > 0){
                    field = field.get(0);
                    if(field.wpgmzaColorInput){
                        field.wpgmzaColorInput.parseColor(fieldValue);
                    } else if(field.wpgmzaCSSUnitInput){
                        field.wpgmzaCSSUnitInput.parseUnits(fieldValue);
                    } else if(field.wpgmzaCSSBackdropFilterInput){
                        field.wpgmzaCSSBackdropFilterInput.parseFilters(fieldValue);
                    } else {
                        $(field).val(fieldValue);
                        $(field).trigger('change');
                    }
                }
            }
        }
    }

    $(document).ready(function(event) {
        if(WPGMZA.getCurrentPage()){
            WPGMZA.stylingPage = WPGMZA.StylingPage.createInstance();
        }
    });
});