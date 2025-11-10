/**
 * @namespace WPGMZA
 * @module WPGMZA.Accessibility
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Used to provide added accessibility tooling to better support WCAG
     * 
     * This covers things like document wide keyboard navigation within our modules, sidebar grouping expansion and so on
     * 
	 * @class WPGMZA.Accessibility
	 * @constructor WPGMZA.Accessibility
	 * @memberof WPGMZA
	 */
	WPGMZA.Accessibility = function() {
        this.bind();
		$(document.body).trigger("init.accessibility.wpgmza");
	}
	
	
	WPGMZA.Accessibility.createInstance = function() {
		return new WPGMZA.Accessibility();
	}

    WPGMZA.Accessibility.prototype.bind = function(){
        const ariaBridgeSelectors = ".wpgmza_map .wpgmza-aria-bridge, .wpgmza-standalone-component .wpgmza-aria-bridge";
        const ariaEventGroupings = {
            keydown : {
                keys : ["Enter"],
                prevent : [" "]
            },
            keyup : {
                keys : [" "]
            }
        }

        /* WCAG - Requires non-natice interactive elements to be opearable with enter and space */
        for(let event in ariaEventGroupings){
            const config = ariaEventGroupings[event];
            $(document.body).on(event, ariaBridgeSelectors, function(event){
                if(event && event.key){
                    if(config.keys && config.keys.indexOf(event.key) !== -1){
                        /* Prevent */
                        event.preventDefault();

                        /* Trigger a simulated click */
                        $(this).trigger('click');
                    }

                    if(config.prevent && config.prevent.indexOf(event.key) !== -1){
                        /* Prevent only*/
                        event.preventDefault();
                    }
                }
            });
        }

        /* Nested panel auto-open */
        $(document.body).on('focusin', '.wpgmza_map .grouping:not(.visible)', function(event) {
            $(this).parent().find('.grouping-handle .icon').click();
        });

        /* Allow Esc to close panels */
        $(document.body).on('keyup', '.wpgmza_map .grouping.visible', function(event) {
            if(event && event.key && event.key === "Escape"){
                $(this).parent().find('.grouping-handle .icon').click();
            }
        });
        
    }
});