/**
 * @namespace WPGMZA
 * @module Tour
 * @requires WPGMZA
 */

jQuery(function($) {
    /**
     * Constructor 
     * 
     * @param Element element The wrapper element 
     */
	WPGMZA.Tour = function(element){
        this.findElements(element);
        this.bindEvents();

        this.prepare();
        setTimeout(() => {
            this.prompt();
        }, 3000);
    }

    WPGMZA.Tour.INPUT_CHANGE_INTERVAL = 1500; 

    /**
     * Create a single tour instance
     *  
     * @param Element element The wrapper element 
     * @return WPGMZA.Tour
     */
    WPGMZA.Tour.createInstance = function(element){
        return new WPGMZA.Tour(element);
    }

    /**
     * Static auto init of all tours 
     * 
     * @return void
     */
    WPGMZA.Tour.AutoInit = function(){
        WPGMZA.adminTours = {};
        $(document.body).find('.wpgmza-tour').each(function(index, element){
            const type = $(element).data('type');
            WPGMZA.adminTours[type] = WPGMZA.Tour.createInstance(element);
        });
    }

    /**
     * Prepare the tour based on the elements we have in this instance 
     * 
     * This finds the max steps, and then also sets the start, while initializing a state tracker 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.prepare = function(){
        this.slug = this.elements.wrapper.data('type');

        this.state = {
            running : false,
            step : 0,
            steps : this.elements.steps.length || 0
        }
    }

    /**
     * Find all relelvant tour elements 
     * 
     * @param Element wrapper The tour wrapper element 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.findElements = function(wrapper){
        this.elements = {};
        this.elements.wrapper = $(wrapper);

        this.elements.prompt = this.elements.wrapper.find('.wpgmza-tour-prompt'); 
        this.elements.promptAction = this.elements.prompt.find('.wpgmza-tour-prompt-actions .wpgmza-button');

        this.elements.steps = this.elements.wrapper.find('.wpgmza-tour-step');
    }

    /**
     * Bind events for the tour within the system 
     * 
     * This is more so for the main tour handlers, and less on the anchors
     * 
     * @return void 
     */
    WPGMZA.Tour.prototype.bindEvents = function(){
        /* Prebound events */
        this.elements.promptAction.on('click', (event) => {
            if(event && event.currentTarget){
                this.onPromptAction(event.currentTarget);
            }
        });

        /* Nested events */
        this.elements.steps.each((i, elem) => {
            const anchor = $(elem).data('anchor');
            if(anchor){
                $(anchor).addClass('wpgmza-tour-anchor-link');
            }
        });

        /* Global events, dynamically bounds to body, filers to class */
        $(document.body).on('click', '.wpgmza-tour-next-step-delegate', (event) => {
            if(event.currentTarget instanceof HTMLInputElement){
                /* This is an input, let the input delegate handler sort it */
                return;
            }

            if($(event.currentTarget).data('auto-step')){
                /* This step is automatically handled by the system, no user interaction required */
                event.preventDefault();
                return;
            }

            this.next();
        });

        $(document.body).on('keyup', '.wpgmza-tour-next-step-delegate', (event) => {
            if(event.currentTarget instanceof HTMLInputElement){
                if(event.currentTarget._wpgmzaChangeTimer){
                    clearTimeout(event.currentTarget._wpgmzaChangeTimer);
                }

                /* Timeouts should allow for a few characters to be typed before continuing to the next step */
                event.currentTarget._wpgmzaChangeTimer = setTimeout(() => {
                    this.next();
                }, WPGMZA.Tour.INPUT_CHANGE_INTERVAL);
            }
        });

        $(document.body).on('click', '.wpgmza-tour-anchor-link', (event) => {
            if(!this.state.running){
                /* The user clicked on a tour item before starting the tour, let's dismiss it early */
                this.stop();

                /* We dismiss it as a short term dismissal, this allows it to reload in a few days ideally */
                this.dismiss(true);
            }
        });

        $(document.body).on('click', (event) => {
            this.onFramedClick(event);
        });
    }

    /**
     * On prompt action taen 
     *  
     * @param Element context The button that triggered this event
     */
    WPGMZA.Tour.prototype.onPromptAction = function(context){
        if(context instanceof Element){
            const action = $(context).data('action');            
            switch(action){
                case 'start':
                    this.state.running = true;
                    this.step(0);
                    break;
                default: 
                    this.stop();
                    this.dismiss();
                    break;
            }

        }
    }

    /**
     * On click while framed, we assume framed, but this method will actually check if the frame is active, and do the things 
     * 
     * @param Event event The event that triggered this element 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.onFramedClick = function(event) {
        if(this.elements.frame && this.elements.frame.hasClass('active')){
            if(!jQuery.contains(this.elements.wrapper.get(0), event.target)){
                /* The element is not a part of the tour, that's for sure, but lets make sure it's not a delegate */
                if(!$(event.target).hasClass('wpgmza-tour-next-step-delegate') && !$(event.target).hasClass('wpgmza-tour-anchor-link')){

                    /* Finally, because we don't actually fully bind to elements on an individual level, we must run a boundary comparison on the frame */
                    const boundary = Object.assign({}, this._lastFramePlacement);
                    const pointerEvent = event.originalEvent || false;
                    if(boundary.top && boundary.left && pointerEvent && pointerEvent instanceof PointerEvent){
                        boundary.right = boundary.left + boundary.width;
                        boundary.bottom = boundary.top + boundary.height;

                        const mouse = {
                            x : pointerEvent.clientX,
                            y : pointerEvent.clientY
                        };

                        let shouldDismiss = false;
                        if(mouse.x < boundary.left || mouse.x > boundary.right){
                            /* User is either too far left or too far right */
                            shouldDismiss = true;
                        }

                        if(mouse.y < boundary.top || mouse.y > boundary.bottom){
                            /* User is either too high or too low */
                            shouldDismiss = true;
                        }

                        if(shouldDismiss){
                            this.stop();
                            this.dismiss(true);
                        }
                    } else {
                        /* Assume but ya - Short term dismissal*/
                        this.stop();
                        this.dismiss(true);
                    }                    
                }
            }
        }
    }

    /**
     * Load the prompt popup to either start or dismiss the tour 
     * 
     * This also sets the default step to the start so that everything flows correctly 
     * 
     * @return void 
     */
    WPGMZA.Tour.prototype.prompt = function(){
        this.state.running = false;
        this.state.step = 0;

        this.elements.steps.removeClass('active');
        this.elements.prompt.addClass('active');
    }

    /**
     * Stop the tour 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.stop = function(){
        this.clearViewport();

        this.elements.prompt.removeClass('active');
        this.elements.steps.removeClass('active');
    }

    /**
     * Load a specific step in the tour 
     * 
     * This will hide prompt, and any open steps 
     * 
     * @param int index The step index you want to load up
     * 
     * @return void 
     */
    WPGMZA.Tour.prototype.step = function(index){
        if(this.state.running){
            this.state.step = index;
            
            this.elements.prompt.removeClass('active');
            this.elements.steps.removeClass('active');

            /* Unbind delegates */
            $('.wpgmza-tour-next-step-delegate').removeClass('wpgmza-tour-next-step-delegate');

            if(this.elements.steps[this.state.step]){
                const stepElement = $(this.elements.steps[this.state.step]);
                const anchor = stepElement.data('anchor');

                this.frame(anchor);

                if(this._lastFramePlacement){

                    stepElement.addClass('active');

                    stepElement.css({
                        left : (this._lastFramePlacement.left + this._lastFramePlacement.width) + 'px',
                        top : ((this._lastFramePlacement.top + (this._lastFramePlacement.height / 2)) - (stepElement.outerHeight() / 2)) + 'px'
                    });

                }

                /* Bind delegates */
                $(anchor).addClass('wpgmza-tour-next-step-delegate');

                if(this._lastAutoStepTimer){
                    clearTimeout(this._lastAutoStepTimer);
                }
                if(stepElement.data('auto-step')){
                    this._lastAutoStepTimer = setTimeout(() => {
                        this.next();
                    }, parseInt(stepElement.data('auto-step')));
                }
            }
        }
    }

    /**
     * Move to the next step 
     * 
     * This would be driven by the anchor being clicked/interacted with on screen, perhaps also by a next button, but we will see
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.next = function(){
        if(this.state.running){
            this.clearViewport();
            
            let nextStep = this.state.step + 1; 
            if(nextStep < this.state.steps){
                /* We can step */
                let delay = this.getStepDelay(nextStep);
                if(delay){
                    /* This has a delay */
                    setTimeout(() => {
                        this.step(nextStep);
                    }, delay);
                } else {
                    /* Run it */
                    this.step(nextStep);
                }
            } else {
                this.complete();
            }
        }
    }

    /**
     * Frame the anchor with a shadow box 
     * 
     * @param string anchor The anchor selector 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.frame = function(anchor){
        if(!this.elements.frame){
            this.elements.frame = $("<div class='wpgmza-tour-frame'></div>");
            this.elements.frame.appendTo(this.elements.wrapper);
        }

        this._lastFramePlacement = false;
        this.elements.frame.removeClass('active');

        const anchorElement = document.querySelector(anchor);
        if(anchorElement){
            const anchorRect = anchorElement.getBoundingClientRect();
            const computedStyles = window.getComputedStyle(anchorElement, null);

            const frameStyle = {
                top : parseInt(anchorRect.top),
                left : parseInt(anchorRect.left),
                width : parseInt(anchorRect.width),
                height : parseInt(anchorRect.height),
                borderRadius : 0
            };

            this.elements.frame.css('--wpgmza-tour-frame-border-radius', '0px');
            if(parseInt(computedStyles['border-radius'])){
                frameStyle.borderRadius = parseInt(computedStyles['border-radius']);
                this.elements.frame.css('--wpgmza-tour-frame-border-radius', parseInt(computedStyles['border-radius']) + 'px');
            }

            this._lastFramePlacement = Object.assign({}, frameStyle);

            for(let i in frameStyle){
                frameStyle[i] += "px";
            }
            
            this.elements.frame.css(frameStyle);
            this.elements.frame.addClass('active');
        } 
    }

    /**
     * Clears the active viewport in full, of frames and popups 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.clearViewport = function(){
        if(this.elements.frame && this.elements.frame.hasClass('active')){
            this.elements.frame.removeClass('active');
        }

        this.elements.steps.removeClass('active');
    }

    /**
     * Get and check if a step has a delay associated with it 
     * 
     * @param int index The step you want to get the delay for 
     * 
     * @return int
     */
    WPGMZA.Tour.prototype.getStepDelay = function(index){
        if($(this.elements.steps[index]).data('step-delay')){
            return parseInt($(this.elements.steps[index]).data('step-delay'));
        }
        return 0;
    }

    /**
     * Dismiss the tour
     * 
     * This sends a request to server-side to actually flag this tour as dismissed, you could allow a tour to be dismissed for a few days, or permanently
     * 
     * @param bool short Should this be a short term dismissal, or is it permanent 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.dismiss = function(short){
        if(this.state.complete){
            /* It's already been completed */
            return true;
        }

        short = short ? true : false;
        const data = {
            action  : 'wpgmza_tour_progress_update',
            wpgmza_security : WPGMZA.ajaxnonce,
            tour : this.slug,
            type : short ? 'sleep' : 'dismiss'
        };

        this.request(data, () => {
            /* We don't need to do anything */
        });
    }

    /**
     * Complete a tour, this could store metadata about the tour, if needed, and trigger the next tour, if you wanted it to 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.complete = function(){
        this.state.running = false;
        this.state.complete = true;

        const data = {
            action  : 'wpgmza_tour_progress_update',
            wpgmza_security : WPGMZA.ajaxnonce,
            tour : this.slug,
            type : 'complete'
        };

        this.request(data, () => {
            /* We don't need to do anything */
        });
    }

    /**
     * Server side request, always sent via POST, but with any data you might need 
     * 
     * @param object data 
     * @param function complete 
     * 
     * @return void
     */
    WPGMZA.Tour.prototype.request = function(data, complete){
        if(typeof complete !== 'function'){
            complete = () => {};
        }

        $.ajax(WPGMZA.ajaxurl, {
            method: "POST",
            data: data,
            success: function(response, status, xhr) {
                complete(response);
            },
            error : function(){
                complete();
            }
        });
    }

    /* Init */
    $(document).ready(function(event) {
        if(WPGMZA.getCurrentPage()){
            WPGMZA.Tour.AutoInit();
        }
    });
})