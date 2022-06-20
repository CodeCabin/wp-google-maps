/**
 * @namespace WPGMZA
 * @module InternalViewport
 * @requires WPGMZA.EventDispatcher
 */
 jQuery(function($) {
    /**
     * Constructor
     * 
     * @param WPGMZA.Map map The map this viewport is bound to 
     */	
	WPGMZA.InternalViewport = function(map){
        const self = this;
        WPGMZA.EventDispatcher.apply(this);

        this.map = map;
        this.limits = {};

        this.element = this.getContainer();

        this.update();

        /* Window events */
        $(window).on('resize', (event) => {
            this.trigger('resize.internalviewport');
            this.update();
        });
    }

    WPGMZA.extend(WPGMZA.InternalViewport, WPGMZA.EventDispatcher);

    WPGMZA.InternalViewport.RECT_TYPE_LARGE  = 0;
    WPGMZA.InternalViewport.RECT_TYPE_MEDIUM = 1;
    WPGMZA.InternalViewport.RECT_TYPE_SMALL  = 2;

    WPGMZA.InternalViewport.CONTAINER_THRESHOLD_MEDIUM = 960;
    WPGMZA.InternalViewport.CONTAINER_THRESHOLD_SMALL = 760;
    
    /**
     * Instance delegate 
     * 
     * @param WPGMZA.Map map The map this viewport is bound to 
     * 
     * @returns WPGMZA.InternalViewport
     */
    WPGMZA.InternalViewport.createInstance = function(map) {
        return new WPGMZA.InternalViewport(map);
    }

    /**
     * Get the active container
     * 
     * @returns Element
     */
    WPGMZA.InternalViewport.prototype.getContainer = function(){
        if(this.map && this.map.element){
            return this.map.element;
        } 
        return document.body || false;
    }

    /**
     * Get the type of rect space available 
     * 
     * Sort of like a media query, but for the container
     * 
     * This aligns with WPGMZA.RECT_TYPE_LARGE, WPGMZA.RECT_TYPE_MEDIUM or WPGMZA.RECT_TYPE_SMALL
     * 
     * @returns int
     */
    WPGMZA.InternalViewport.prototype.getRectType = function(){
        let type = WPGMZA.InternalViewport.RECT_TYPE_LARGE;
        if(this.limits.container && this.limits.container.width.value){
            if(this.limits.container.width.value <= WPGMZA.InternalViewport.CONTAINER_THRESHOLD_SMALL){
                type = WPGMZA.InternalViewport.RECT_TYPE_SMALL;
            } else if (this.limits.container.width.value <= WPGMZA.InternalViewport.CONTAINER_THRESHOLD_MEDIUM){
                type = WPGMZA.InternalViewport.RECT_TYPE_MEDIUM;
            } 
        }
        return type;
    }

    /**
     * Wrap a measurement as an object
     * 
     * @param int|float value The measurement value 
     * @param string suffix The unit of measurement
     * 
     * @returns object 
     */
    WPGMZA.InternalViewport.prototype.wrapMeasurement = function(value, suffix){
        return {
            value : value,
            suffix : (suffix ? suffix : 'px')
        };
    }

    /**
     * Update viewport 
     * 
     * Delegates to trace, localize and addClass methods. May also trigger events for developers
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.update = function(){
        this.trace();
        this.localize();
        this.addClass();

        this.trigger('update.internalviewport');
    }

    /**
     * Trace the viewport 
     * 
     * This is just terminology, as really trace methods only sample resolutions, dimensions, and offsets
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.trace = function(){
        this.traceLimits();

        this.trigger('trace.internalviewport');
    }

    /**
     * Trace limits of the viewport
     * 
     * Measures the container width/height then calculates the maximum dimensions for the inner components (stacks/groups)
     * 
     * Note: This could later take additional steps if we needed it to, but for now it's isolated to stacks and groups
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.traceLimits = function(){
        this.limits = {
            container : {},
            overlays : {},
            panels : {}
        };

        const container  = this.getContainer();
        if(container){
            this.limits.container.width = this.wrapMeasurement(parseInt(this.map.element.offsetWidth));
            this.limits.container.height = this.wrapMeasurement(parseInt(this.map.element.offsetHeight));

            mode = this.getRectType();

            if(this.limits.container.width){
                const overlayMultipliers = [0.5, 0.7, 1];
                this.limits.overlays.max_width = this.wrapMeasurement((overlayMultipliers[mode] * 100), "%");
                
                const panelMultipliers = [0.3, 0.5, 1];
                this.limits.panels.max_width = this.wrapMeasurement((panelMultipliers[mode] * 100), "%");
            }
        }
    }

    /**
     * Localize the limits to the document
     * 
     * This is dome by setting CSS variables on the map container itself
     * 
     * These variables are then used on the CSS side of things to allow the system to adapt it's layouts. Consider this a shim, or polyfill?
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.localize = function(){
        const localized = {};
        for(let tag in this.limits){
            if(!this.limits[tag]){
                continue;
            }

            for(let name in this.limits[tag]){
                const prop = this.limits[tag][name];

                name = name.replaceAll("_", "-");
                name = "--wpgmza--viewport-" + tag + "-" + name;

                localized[name] = prop.value + prop.suffix;
            } 
        }

        const container = this.getContainer();
        if(container){
            $(container).css(localized);
        }

        this.trigger('localize.internalviewport');
    }

    /**
     * Add a class to the container to indicate what type of view is being used at the moment
     * 
     * This may be small, medium or large, depending on the container width. Again nothing to do with screen size
     * 
     * @return void
     */
    WPGMZA.InternalViewport.prototype.addClass = function(){
        const classes = ['wpgmza-viewport-large', 'wpgmza-viewport-medium', 'wpgmza-viewport-small'];
        const container = this.getContainer();
        if(container){
            $(container).removeClass(classes);

            const mode = this.getRectType();
            $(container).addClass(classes[mode]);
        }
    }

});