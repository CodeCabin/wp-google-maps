/**
 * @namespace WPGMZA
 * @module ColorInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.ColorInput = function(element, options){
        if(!(element instanceof HTMLInputElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.dataAttributes = this.element.data();
        this.type = element.type;
        this.value = element.value;

        this.options = {
            format : 'hex',
            anchor : 'left',
            container : false,
            autoClose : true,
            autoOpen : false,
            supportAlpha : true,
            supportPalette : true,
            wheelBorderWidth : 10,
            wheelPadding : 6,
            wheelBorderColor: "rgb(255,255,255)"
        };

        this.parseOptions(options);

        this.state = {
            initialized : false,
            sliderInvert : false,
            lockSlide : false,
            lockPicker : false,
            open : false,
            mouse : {
                down : false
            }
        }

        this.color = {
            h : 0,
            s : 0,
            l : 100,
            a : 1
        };

        this.wrap();
        this.renderControls();

        this.parseColor(this.value);
    }

    WPGMZA.extend(WPGMZA.ColorInput, WPGMZA.EventDispatcher);

    WPGMZA.ColorInput.createInstance = function(element) {
        return new WPGMZA.ColorInput(element);
    }

    WPGMZA.ColorInput.prototype.clamp = function(min, max, value){
        if(isNaN(value)){
            value = 0;
        }
        return Math.min(Math.max(value, min), max);
    }

    WPGMZA.ColorInput.prototype.degreesToRadians = function(degrees) {
        return degrees * (Math.PI / 180);
    }

    WPGMZA.ColorInput.prototype.hueToRgb = function(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    WPGMZA.ColorInput.prototype.getMousePositionInCanvas = function(canvas, event){
        var rect = canvas.getBoundingClientRect();
        
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    WPGMZA.ColorInput.prototype.parseOptions = function(options){
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

    WPGMZA.ColorInput.prototype.getColor = function(override, format){
        var hsl = Object.assign({},this.color);
        if(override){
            for(var i in override){
                hsl[i] = override[i];
            }
        }

        if(!format){
            format = this.options.format;
        }
        
        var rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l, hsl.a);
        switch(format){
            case 'hsl':
                return "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
            case 'hsla':
                return "hsla(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%, " + hsl.a + ")";
            case 'rgb':
                return "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
            case 'rgba':
                return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + rgb.a + ")";
        }

        return this.rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    }

    WPGMZA.ColorInput.prototype.setColor = function(hsl){
        for(var i in hsl){
            this.color[i] = hsl[i];
        }

        if(!this.options.supportAlpha){
            this.color.a = 1;
        }

        this.updatePreview();
        this.commit();

        if(this.state.initialized){
            this.update();
        }
    }

    WPGMZA.ColorInput.prototype.parseColor = function(value){
        if(typeof value === "string"){
            value = value.trim().toLowerCase().replace(/ /g, '');
            if(value === ""){
                value = "rgb(255,255,255)";
            }

            if(value.indexOf("rgb") !== -1){
                value = value.replace(/[a-z\(\)%]/g, '');
                parts = value.split(',');

                this.setColor(this.rgbToHsl(parts[0], parts[1], parts[2], parts[3]));
            } else if (value.indexOf('hsl') !== -1){
                value = value.replace(/[a-z\(\)%]/g, '');
                parts = value.split(',');

                var hsl = {
                    h : parts[0] ? parseInt(parts[0]) : 0,
                    s : parts[1] ? parseInt(parts[1]) : 0,
                    l : parts[2] ? parseInt(parts[2]) : 100,
                    a : parts[3] ? parseFloat(parts[3]) : 1,
                };

                this.setColor(hsl);
            } else {
                var rgb = this.hexToRgb(value);
                this.setColor(this.rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a));
            }
        }
    }

    WPGMZA.ColorInput.prototype.rgbToHsl = function(r, g, b, a) {
        var rgb = {
            r : r >= 0 ? (r / 255) : 255,
            g : g >= 0 ? (g / 255) : 255,
            b : b >= 0 ? (b / 255) : 255,
            a : (a >= 0 ? a : 1)
        };

        var bounds = {
            min : Math.min(rgb.r, rgb.g, rgb.b),
            max : Math.max(rgb.r, rgb.g, rgb.b)
        };

        var delta = bounds.max - bounds.min;

        var hsl = {
            h : (bounds.max + bounds.min) / 2,
            s : (bounds.max + bounds.min) / 2,
            l : (bounds.max + bounds.min) / 2,
            a : rgb.a
        };

        if(delta !== 0){
            hsl.s = hsl.l > 0.5 ? delta / (2 - bounds.max - bounds.min) : delta / (bounds.max + bounds.min);

            switch (bounds.max) {
              case rgb.r: 
                hsl.h = (rgb.g - rgb.b) / delta + (rgb.g < rgb.b ? 6 : 0); 
                break;
              case rgb.g: 
                hsl.h = (rgb.b - rgb.r) / delta + 2; 
                break;
              case rgb.b: 
                hsl.h = (rgb.r - rgb.g) / delta + 4; 
                break;
            }

            hsl.h = hsl.h / 6;
        } else {
            hsl.h = 0;
            hsl.s = 0;
        }

        hsl.h = parseInt(hsl.h * 360);
        hsl.s = parseInt(hsl.s * 100);
        hsl.l = parseInt(hsl.l * 100);

        return hsl;
    }

    WPGMZA.ColorInput.prototype.hexToRgb = function(hex){
        hex = hex.trim().toLowerCase().replace(/ /g, '').replace(/[^A-Za-z0-9\s]/g,'');

        if(hex.length < 6){
            hex += hex.charAt(hex.length - 1).repeat((6 - hex.length));
        }

        return  {
            r : parseInt((hex.slice(0, 2)), 16),
            g : parseInt((hex.slice(2, 4)), 16),
            b : parseInt((hex.slice(4, 6)), 16),
            a : hex.length > 6 ? this.floatToPrecision((parseInt(hex.slice(6, 8), 16)) / 255, 2) : 1
        };
    }

    WPGMZA.ColorInput.prototype.hslToRgb = function(h, s, l, a) {
        var hsl = {
            h : h >= 0 ? h : 0,
            s : s >= 0 ? s / 100 : 0,
            l : l >= 0 ? l / 100 : 0,
            a : a >= 0 ? a : 1
        };

        var rgb = {
            r : 0,
            g : 0,
            b : 0,
            a : hsl.a
        };

        var chroma = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
        var exp = chroma * (1 - Math.abs((hsl.h / 60) % 2 -1));
        var diff = hsl.l - chroma / 2;

        if (0 <= hsl.h && hsl.h < 60) {
            rgb.r = chroma; 
            rgb.g = exp; 
            rgb.b = 0;  
        } else if (60 <= hsl.h && hsl.h < 120) {
            rgb.r = exp; 
            rgb.g = chroma; 
            rgb.b = 0;
        } else if (120 <= hsl.h && hsl.h < 180) {
            rgb.r = 0; 
            rgb.g = chroma; 
            rgb.b = exp;
        } else if (180 <= hsl.h && hsl.h < 240) {
            rgb.r = 0; 
            rgb.g = exp; 
            rgb.b = chroma;
        } else if (240 <= hsl.h && hsl.h < 300) {
            rgb.r = exp; 
            rgb.g = 0; 
            rgb.b = chroma;
        } else if (300 <= hsl.h && hsl.h < 360) {
            rgb.r = chroma; 
            rgb.g = 0; 
            rgb.b = exp;
        }
        rgb.r = Math.round((rgb.r + diff) * 255);
        rgb.g = Math.round((rgb.g + diff) * 255);
        rgb.b = Math.round((rgb.b + diff) * 255);

        return rgb;
    }

    WPGMZA.ColorInput.prototype.rgbToHex = function(r, g, b, a){
        var rgb = {
            r : r >= 0 ? r : 255,
            g : g >= 0 ? g : 255,
            b : b >= 0 ? b : 255,
            a : a >= 0 ? a : 1
        };


        rgb.r = rgb.r.toString(16);
        rgb.g = rgb.g.toString(16);
        rgb.b = rgb.b.toString(16);
        
        if(rgb.a < 1){
            rgb.a = Math.round(rgb.a * 255).toString(16);
        } else {
            rgb.a = "";
        }

        for(var i in rgb){
            if(rgb[i].length === 1){
                rgb[i] = "0" + rgb[i];
            }
        }

        return "#" + rgb.r + rgb.g + rgb.b + rgb.a;
    }

    WPGMZA.ColorInput.prototype.floatToPrecision = function(float, precision){
        float = parseFloat(float);
        return parseFloat(float.toFixed(precision));
    }

    WPGMZA.ColorInput.prototype.wrap = function(){
        var self = this;
        if(this.element && this.type === "text"){
            this.element.hide();
            this.container = $("<div class='wpgmza-color-input-wrapper' />");

            this.container.insertAfter(this.element);
            this.container.append(this.element);

            if(this.options.autoClose){
                $(document.body).on('click', function(){
                    if(self.state.open){
                        self.state.mouse.down = false;
                        self.onTogglePicker();
                    }
                });

                $(document.body).on('colorpicker.open.wpgmza', function(event){
                    if(event.instance === self){
                        return;
                    }

                    if(self.state.open){
                        self.onTogglePicker();
                    }
                });
            }
        } else {
            throw new Error("WPGMZA.ColorInput requires a text field as a base");
        }
    }

    WPGMZA.ColorInput.prototype.renderControls = function(){
        var self = this;
        if(this.container){
            this.preview = $("<div class='wpgmza-color-preview wpgmza-shadow' />");
            this.swatch = $("<div class='swatch' />");
            this.picker = $("<div class='wpgmza-color-picker wpgmza-card wpgmza-shadow' />");

            this.preview.append(this.swatch);

            this.picker.addClass('anchor-' + this.options.anchor);
            this.preview.addClass('anchor-' + this.options.anchor);

            this.preview.on('click', function(event){
                event.stopPropagation();
                self.onTogglePicker();
            });

            this.picker.on('click', function(event){
                event.stopPropagation();
            });

            this.container.append(this.preview);

            if(this.options.container && $(this.options.container).length > 0){
                $(this.options.container).append(this.picker);
                $(this.options.container).addClass('wpgmza-color-input-host');
            } else {
                this.container.append(this.picker);
            }


            if(this.options.autoOpen){
                this.preview.trigger('click');
            }
        }
    }

    WPGMZA.ColorInput.prototype.renderPicker = function(){
        if(!this.state.initialized){
            this.renderWheel();
            this.renderFields();
            this.renderPalette();

            this.state.initialized = true;
        }
    }

    WPGMZA.ColorInput.prototype.renderWheel = function(){
        var self = this;

        this.wheel = {
            wrap : $("<div class='canvas-wrapper' />"),
            element : $("<canvas class='color-wheel' />"),
            handle : $("<div class='canvas-handle' />"),
            slider : $("<div class='canvas-slider' />")
        };

        this.wheel.target = this.wheel.element.get(0);
        
        this.wheel.target.height = 256;
        this.wheel.target.width = 256;

        this.wheel.radius = (this.wheel.target.width - ((this.options.wheelBorderWidth + this.options.wheelPadding) * 2)) / 2;
        this.wheel.degreeStep = 1 / this.wheel.radius;

        this.wheel.context = this.wheel.target.getContext("2d");

        this.wheel.context.clearRect(0, 0, this.wheel.target.width, this.wheel.target.height);

        this.wheel.grid = {
            canvas : document.createElement('canvas')
        };

        this.wheel.grid.canvas.width = 20;
        this.wheel.grid.canvas.height = 20;

        this.wheel.grid.context = this.wheel.grid.canvas.getContext('2d');
        this.wheel.grid.context.fillStyle = 'rgb(255,255,255)';
        this.wheel.grid.context.fillRect(0, 0, this.wheel.grid.canvas.width, this.wheel.grid.canvas.height);
        
        this.wheel.grid.context.fillStyle = 'rgb(180,180,180)';
        this.wheel.grid.context.fillRect(0, 0, this.wheel.grid.canvas.width / 2, this.wheel.grid.canvas.height / 2);
        this.wheel.grid.context.fillRect(this.wheel.grid.canvas.width / 2, this.wheel.grid.canvas.height / 2, this.wheel.grid.canvas.width / 2, this.wheel.grid.canvas.height / 2);
        
        this.wheel.element.on('mousedown', function(event){
            self.state.mouse.down = true;
            self.onPickerMouseSelect(event);
        });

        this.wheel.element.on('mousemove', function(event){
            if(self.state.mouse.down){
                self.onPickerMouseSelect(event);
            }
        });

        this.wheel.element.on('mouseup', function(event){
            self.clearStates();
        });

        this.wheel.element.on('mouseleave', function(event){
            self.clearStates();
        });

        this.wheel.wrap.append(this.wheel.element);        
        this.wheel.wrap.append(this.wheel.handle);        
        this.wheel.wrap.append(this.wheel.slider);        
        this.picker.append(this.wheel.wrap);
    }

    WPGMZA.ColorInput.prototype.renderFields = function(){
        var self = this;
        this.fields = {
            wrap : $("<div class='wpgmza-color-field-wrapper' />"),
            toggle : $("<div class='color-field-toggle' />"),
            blocks : {
                hsla : {
                    keys : ['h','s','l','a']
                }, 
                rgba : {
                    keys : ['r','g','b','a']                    
                },
                hex : {
                    keys : ['hex']
                }
            }
        };

        this.fields.toggle.on('click', function(){
            var view = self.fields.view;
            switch(view){
                case 'hex':
                    view = 'hsla';
                    break;
                case 'hsla':
                    view = 'rgba';
                    break;
                case 'rgba':
                    view = 'hex';
                    break;
            }

            self.updateFieldView(view);
        });

        this.fields.wrap.append(this.fields.toggle);

        for(var group in this.fields.blocks){
            var keys = this.fields.blocks[group].keys;

            this.fields.blocks[group].wrap = $("<div class='field-block' data-type='" + group + "'/>");
            
            this.fields.blocks[group].rows = {
                labels : $("<div class='labels' />"),
                controls : $("<div class='controls' />")
            };

            this.fields.blocks[group].wrap.append(this.fields.blocks[group].rows.controls);
            this.fields.blocks[group].wrap.append(this.fields.blocks[group].rows.labels);

            if(!this.options.supportAlpha && keys.indexOf('a') !== -1){
                this.fields.blocks[group].wrap.addClass('alpha-disabled');
            }

            for(var index in keys){
                var name = keys[index];

                var label = $("<div class='inner-label' />");
                label.text(name);

                this.fields.blocks[group][name] = $("<input type='text'/>");

                this.fields.blocks[group].rows.controls.append(this.fields.blocks[group][name]);
                this.fields.blocks[group].rows.labels.append(label);

                this.fields.blocks[group][name].on('keydown', function(event){
                    const originalEvent = event.originalEvent;
                    if(originalEvent.key === 'Enter'){
                        originalEvent.preventDefault();
                        originalEvent.stopPropagation();
                        $(event.currentTarget).trigger('change');
                    }
                });

                this.fields.blocks[group][name].on('change', function(){
                    self.onFieldChange(this);
                });              
            }

            this.fields.wrap.append(this.fields.blocks[group].wrap);
        }

        this.picker.append(this.fields.wrap);

        this.updateFieldView();
    }

    WPGMZA.ColorInput.prototype.renderPalette = function(){
        var self = this;
        if(!this.options.supportPalette){
            return;
        }

        this.palette = {
            wrap : $("<div class='wpgmza-color-palette-wrap' />"),
            variations : [
                {
                    s : -10,
                    l : -10
                },
                {
                    h : 15,
                },
                {
                    h : 30,
                },
                {
                    h : -15,
                },
                {
                    h : -30,
                },
                {
                    h : 100,
                    s : 10
                },
                {
                    h : -100,
                    s : -10
                },
                {
                    h : 180
                }
            ],
            controls : []
        };

        for(var i in this.palette.variations){
            var variation = this.palette.variations[i];
            var control = $("<div class='palette-swatch' />");
            
            for(var mutator in variation){
                control.attr("data-" + mutator, variation[mutator]);
            }

            control.on('click', function(){
                var elem = $(this);
                self.parseColor(elem.css("background-color"));
                /* Trigger input event, as in user caused changed */
                self.element.trigger('input');
            });

            this.palette.wrap.append(control);
            this.palette.controls.push(control);
        }

        this.picker.append(this.palette.wrap);
    }

    WPGMZA.ColorInput.prototype.updateWheel = function(){
        this.wheel.center = {
            x : this.wheel.radius + this.options.wheelBorderWidth + this.options.wheelPadding,
            y : this.wheel.radius + this.options.wheelBorderWidth + this.options.wheelPadding,
        };

        if(this.color.a < 1){
            this.wheel.grid.pattern = this.wheel.context.createPattern(this.wheel.grid.canvas, 'repeat');
            this.wheel.context.fillStyle = this.wheel.grid.pattern;
            this.wheel.context.beginPath();
            this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, this.wheel.radius, 0, Math.PI * 2, true);
            this.wheel.context.closePath();
            this.wheel.context.fill();
        }

        for(var i = 0; i < 360; i ++) {
            var startAngle = (i - 1) * Math.PI / 180;
            var endAngle = (i + 1) * Math.PI / 180;
            this.wheel.context.beginPath();
            this.wheel.context.moveTo(this.wheel.center.x, this.wheel.center.y);
            this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, this.wheel.radius, startAngle, endAngle);
            this.wheel.context.closePath();
            this.wheel.context.fillStyle = 'hsla(' + i + ', 100%, 50%, ' + this.color.a + ')';
            this.wheel.context.fill();
        }

        var gradient = this.wheel.context.createRadialGradient(this.wheel.center.x , this.wheel.center.y, 0, this.wheel.center.x, this.wheel.center.y, this.wheel.radius);
        gradient.addColorStop(0,'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1,'rgba(255, 255, 255, 0)');
            
        this.wheel.context.fillStyle = gradient;
        this.wheel.context.beginPath();
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, this.wheel.radius, 0, Math.PI * 2, true);
        this.wheel.context.closePath();
        this.wheel.context.fill();

        this.wheel.context.lineWidth = 2;
        this.wheel.context.strokeStyle = this.options.wheelBorderColor;
        this.wheel.context.stroke();
        
        var strokeGradient = this.wheel.context.createLinearGradient(this.wheel.center.x, 0, this.wheel.center.x, this.wheel.target.height);
        strokeGradient.addColorStop(0, this.getColor({l: 95}, 'hsl'));
        strokeGradient.addColorStop(0.5, this.getColor({l: 50}, 'hsl'));
        strokeGradient.addColorStop(1, this.getColor({l: 5}, 'hsl'));

        this.wheel.context.beginPath();
        this.wheel.context.lineWidth = this.options.wheelBorderWidth;
        this.wheel.context.strokeStyle = strokeGradient;
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, (this.wheel.radius + this.options.wheelPadding + (this.options.wheelBorderWidth / 2)), 0, Math.PI * 2);
        this.wheel.context.stroke();

        this.wheel.context.beginPath();
        this.wheel.context.lineWidth = 1;
        this.wheel.context.strokeStyle = this.options.wheelBorderColor;
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, (this.wheel.radius + this.options.wheelPadding + this.options.wheelBorderWidth), 0, Math.PI * 2);
        this.wheel.context.stroke();
        
        this.wheel.context.beginPath();
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, (this.wheel.radius + this.options.wheelPadding), 0, Math.PI * 2);
        this.wheel.context.stroke();

        var shadow = this.wheel.context.createRadialGradient(this.wheel.center.x ,this.wheel.center.y, 0, this.wheel.center.x, this.wheel.center.y, this.wheel.radius);
        shadow.addColorStop(0,'rgba(80, 80, 80, 0)');
        shadow.addColorStop(0.95,'rgba(80, 80, 80, 0.0)');
        shadow.addColorStop(1,'rgba(80, 80, 80, 0.1)');

        this.wheel.context.beginPath();
        this.wheel.context.lineWidth = 6;
        this.wheel.context.strokeStyle = shadow;
        this.wheel.context.arc(this.wheel.center.x, this.wheel.center.y, (this.wheel.radius - 3), 0, Math.PI * 2);
        this.wheel.context.stroke();
    }

    WPGMZA.ColorInput.prototype.update = function(){
        this.updateHandles();
        this.updateWheel();
        this.updateFields();
        this.updatePalette();
    }

    WPGMZA.ColorInput.prototype.updateHandles = function(){
        var localRadius = this.wheel.element.width() / 2;
        var localHandleOffset = ((localRadius - this.options.wheelBorderWidth - this.options.wheelPadding) / 100) * this.color.s;
        
        var handleStyles = {
            left : ((localRadius) + (localHandleOffset * Math.cos(this.degreesToRadians(this.color.h)))) + 'px',
            top : ((localRadius) + (localHandleOffset  * Math.sin(this.degreesToRadians(this.color.h)))) + 'px',
        };

        this.wheel.handle.css(handleStyles);
        
        var sliderDegrees = (360 * (this.color.l / 100) / 2);
        var sliderDegreeOffset = 90;
        if(this.state.sliderInvert){
            sliderDegrees = 360 - sliderDegrees;
        }

        var sliderStyles = {
            left : ((localRadius) + ((localRadius - (this.options.wheelBorderWidth / 2)) * Math.cos(this.degreesToRadians(sliderDegrees + sliderDegreeOffset)))) + 'px',
            top : ((localRadius) + ((localRadius - (this.options.wheelBorderWidth / 2)) * Math.sin(this.degreesToRadians(sliderDegrees + sliderDegreeOffset)))) + 'px',
        };

        this.wheel.slider.css(sliderStyles);
    }

    WPGMZA.ColorInput.prototype.updatePreview = function(){
        this.swatch.css({background: this.getColor(false, 'rgba')});
    }

    WPGMZA.ColorInput.prototype.updateFields = function(){
        var hsl = Object.assign({}, this.color);

        for(var group in this.fields.blocks){
            switch(group){
                case 'hsla':
                    this.fields.blocks[group].h.val(hsl.h);            
                    this.fields.blocks[group].s.val(hsl.s);            
                    this.fields.blocks[group].l.val(hsl.l);            
                    this.fields.blocks[group].a.val(hsl.a);            
                    break;
                case 'rgba':
                    var rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l, hsl.a);
                    this.fields.blocks[group].r.val(rgb.r);            
                    this.fields.blocks[group].g.val(rgb.g);            
                    this.fields.blocks[group].b.val(rgb.b);            
                    this.fields.blocks[group].a.val(rgb.a);  
                    break;
                case 'hex':
                    var rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l, hsl.a);
                    var hex = this.rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);

                    this.fields.blocks[group].hex.val(hex);
                    break;
            }
        }
    }

    WPGMZA.ColorInput.prototype.updatePalette = function(){
        if(!this.options.supportPalette){
            return;
        }

        for(var i in this.palette.controls){
            var hsl = Object.assign({}, this.color);
            var control = this.palette.controls[i];
            var data = control.data();

            if(hsl.l === 0){
                if(data.h){
                    hsl.l += (Math.abs(data.h) / 360) * 100;
                }
                hsl.l += 10;
            } else if (hsl.l === 100){
                if(data.h){
                    hsl.l -= (Math.abs(data.h) / 360) * 100;
                }
                hsl.l -= 10;
            }

            for(var mutator in data){
                hsl[mutator] += data[mutator]; 
            }

            if(hsl.h < 0){
                hsl.h += 360;
            } else if (hsl.h > 360){
                hsl.h -= 360;
            }

            hsl.h = this.clamp(0, 360, hsl.h);
            hsl.s = this.clamp(0, 100, hsl.s);
            hsl.l = this.clamp(0, 100, hsl.l);

            var rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
            
            control.css("background", "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")");
        }
    }

    WPGMZA.ColorInput.prototype.updateFieldView = function(view){
        if(!view){
            view = this.options.format ? this.options.format : 'hex'; 
        }

        switch(view){
            case "rgb":
                view = "rgba";
                break;
            case "hsl":
                view = "hsla";
                break;
        }

        this.fields.view = view;

        for(var group in this.fields.blocks){
            if(group === this.fields.view){
                this.fields.blocks[group].wrap.show();
            } else {
                this.fields.blocks[group].wrap.hide();
            }
        }
    }

    WPGMZA.ColorInput.prototype.onPickerMouseSelect = function(event){
        var localRadius = this.wheel.element.width() / 2;
        var localPosition = this.getMousePositionInCanvas(this.wheel.target, event);

        var dir = {
            x : localPosition.x - localRadius,
            y : localPosition.y - localRadius,
        }

        var angle = Math.atan2(dir.y, dir.x) * 360 / (2 * Math.PI);
        if(angle < 0){
            angle += 360;
        }
        
        
        var distance = Math.sqrt(dir.x * dir.x + dir.y * dir.y);     
        var range = {
            pickerScaler : localRadius / this.wheel.radius,
        }

        range.pickerEdge = range.pickerScaler * (localRadius);
        
        if((distance <= range.pickerEdge || this.state.lockPicker) && !this.state.lockSlide){
            /* We are in range of the main picker cirlce */
            this.setColor({
                h : parseInt(angle), 
                s : Math.min(parseInt((distance / range.pickerEdge) * 100), 100)
            });

            this.state.lockPicker = true;
        } else {
            /* Outside, let's assume they are trying to adjust the brightness? */
            angle = angle - 90;
            if(angle < 0){
                angle += 360;
            }

            this.state.sliderInvert = false;
            if(angle > 180){
                angle = 180 - (angle - 180);
                this.state.sliderInvert = true;
            }


            this.setColor({
                l : parseInt((angle / 180) * 100) 
            });
            
            this.state.lockSlide = true;

        }

        /* Trigger input event, as in user caused changed */
        this.element.trigger('input');
    }

    WPGMZA.ColorInput.prototype.onFieldChange = function(field){
        if(field){
            if($(field).val().trim() === ""){
                return;
            }

            var block = $(field).closest('.field-block');
            var type = block.data('type');

            var raw = [];
            block.find('input').each(function(){
                raw.push($(this).val());
            });

            if(type === "hsla" || type === "rgba"){
                if(raw[3]){
                    var tA = raw[3];
                    if(tA.trim().charAt(tA.trim().length - 1) === "."){
                        return;
                    }
                }
            }

            switch(type){
                case 'hsla':
                    var hsl = {
                        h : raw[0] ? parseInt(raw[0]) : 0,
                        s : raw[1] ? parseInt(raw[1]) : 0,
                        l : raw[2] ? parseInt(raw[2]) : 100,
                        a : raw[3] ? parseFloat(raw[3]) : 1
                    };

                    hsl.h = this.clamp(0, 360, hsl.h);
                    hsl.s = this.clamp(0, 100, hsl.s);
                    hsl.l = this.clamp(0, 100, hsl.l);
                    hsl.a = this.clamp(0.0, 1.0, hsl.a);

                    this.setColor(hsl);
                    break;
                case 'rgba':
                    var rgb = {
                        r : raw[0] ? parseInt(raw[0]) : 255,
                        g : raw[1] ? parseInt(raw[1]) : 255,
                        b : raw[2] ? parseInt(raw[2]) : 255,
                        a : raw[3] ? parseFloat(raw[3]) : 1
                    };

                    rgb.r = this.clamp(0, 255, rgb.r);
                    rgb.g = this.clamp(0, 255, rgb.g);
                    rgb.b = this.clamp(0, 255, rgb.b);
                    rgb.a = this.clamp(0.0, 1.0, rgb.a);

                    var hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
                    this.setColor(hsl);

                    break;
                case 'hex':
                    var rgb = this.hexToRgb(raw[0] ? raw[0] : "#ffffff");
                    this.setColor(this.rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a));
                    break;
            }

            /* Trigger input event, as in user caused changed */
            this.element.trigger('input');
        }
    }

    WPGMZA.ColorInput.prototype.onTogglePicker = function(){
        this.renderPicker();

        this.picker.toggleClass('active');
        this.update();

        this.state.open = this.picker.hasClass('active');
        if(this.state.open){
            $(document.body).trigger({type:"colorpicker.open.wpgmza", instance: this});
        }
    }

    WPGMZA.ColorInput.prototype.clearStates = function(){
        this.state.mouse.down = false;
        this.state.lockSlide = false;
        this.state.lockPicker = false;
    }

    WPGMZA.ColorInput.prototype.commit = function(){
        var syncValue = this.getColor();
        this.element.val(syncValue);
        this.element.trigger('change');
    }

    $(document.body).ready(function(){
        $("input.wpgmza-color-input").each(function(index, el) {
            el.wpgmzaColorInput = WPGMZA.ColorInput.createInstance(el);
        });
    });

});