/**
 * @namespace WPGMZA
 * @module EmbeddedMedia
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.EmbeddedMedia = function(element, container){
        if(!(element instanceof HTMLElement)){
            throw new Error("Element is not an instance of HTMLInputElement");
        }

        if(!(container instanceof HTMLElement)){
            throw new Error("Container is not an instance of HTMLInputElement");
        }

        const self = this;

        WPGMZA.EventDispatcher.apply(this);

        this.element = $(element);
        this.container = $(container);

        this.corners = [
            'southEast'
        ];

        this.handles = null;
        this.activeCorner = false;

        this.container.on('mousemove', function(event){
            self.onMoveHandle(event);
        });

        this.container.on('mouseup', function(event){
            if(self.activeCorner){
                self.onDeactivateHandle(self.activeCorner);
            }
        });

        this.container.on('mouseleave', function(event){
            if(self.activeCorner){
                self.onDeactivateHandle(self.activeCorner);
                self.onDetach();
            }
        });

        this.container.on('mousedown', function(event){
            self.onDetach();
        });
    }

    WPGMZA.extend(WPGMZA.EmbeddedMedia, WPGMZA.EventDispatcher);

    WPGMZA.EmbeddedMedia.createInstance = function(element, container) {
        return new WPGMZA.EmbeddedMedia(element, container);
    }

    WPGMZA.EmbeddedMedia.detatchAll = function(){
        let embedded = document.querySelectorAll('.wpgmza-embedded-media');
        for(let element of embedded){
            if(element.wpgmzaEmbeddedMedia){
                element.wpgmzaEmbeddedMedia.onDetach();
            }
        }

        $('.wpgmza-embedded-media').removeClass('selected');
        $('.wpgmza-embedded-media-handle').remove();
    }

    WPGMZA.EmbeddedMedia.prototype.onSelect = function(){
        this.element.addClass('selected');
        this.updateHandles();
    }

    WPGMZA.EmbeddedMedia.prototype.onDetach = function(){
        this.element.removeClass('selected');
        this.destroyHandles();

        this.container.trigger('media_resized');
    }

    WPGMZA.EmbeddedMedia.prototype.onActivateHandle = function(corner){
        this.activeCorner = corner;
    }

    WPGMZA.EmbeddedMedia.prototype.onDeactivateHandle = function(corner){
        this.activeCorner = false;

        this.updateHandles();
    }

    WPGMZA.EmbeddedMedia.prototype.onMoveHandle = function(event){
        if(this.activeCorner && this.handles[this.activeCorner]){
            const mouse = this.getMousePosition(event);
            if(this.handles[this.activeCorner].element){

                const anchor = this.getAnchorPosition();
                const maxTop = anchor.y + this.element.height();

                if(mouse.y > maxTop){
                    mouse.y = maxTop;
                }

                this.handles[this.activeCorner].element.css({
                    left : (mouse.x - 3) + "px",
                    top : (mouse.y - 3) + "px"
                });

                this.applyResize(mouse);
            }
        }
    }

    WPGMZA.EmbeddedMedia.prototype.createHandles = function(){
        if(!this.handles){
            this.handles = {}

            for(let corner of this.corners){
                this.handles[corner] = {
                    element : $('<div/>'),
                    mutating : false
                }

                this.handles[corner].element.addClass('wpgmza-embedded-media-handle');
                this.handles[corner].element.attr('data-corner', corner);


                this.container.append(this.handles[corner].element);

                this.bindHandle(corner);
            }



            // this.handles.bottomRight.
        }
    }

    WPGMZA.EmbeddedMedia.prototype.destroyHandles = function(){
        if(this.handles && this.handles instanceof Object){
            for(let i in this.handles){
                const handle = this.handles[i];
                if(handle.element){
                    handle.element.remove();
                }
            }

            this.handles = null;
        }
    }


    WPGMZA.EmbeddedMedia.prototype.updateHandles = function(){
        this.createHandles();
        const anchor = this.getAnchorPosition();

        if(this.handles && this.handles instanceof Object){
            for(let corner in this.handles){
                const handle = this.handles[corner].element;
                const position = {
                    top : 0,
                    left : 0
                };

                switch(corner){
                    case 'southEast':
                        position.left = anchor.x + this.element.width();
                        position.top = anchor.y + this.element.height();
                        break;
                }

                handle.css({
                    left : (position.left - 3) + "px",
                    top : (position.top - 3) + "px"
                });
            }
        }

    }

    WPGMZA.EmbeddedMedia.prototype.bindHandle = function(corner){
        const self = this;
        if(this.handles && this.handles[corner]){
            this.handles[corner].element.on('mousedown', function(event){
                event.preventDefault();
                event.stopPropagation();

                self.onActivateHandle(corner);
            });

            this.handles[corner].element.on('mouseup', function(event){
                event.preventDefault();
                event.stopPropagation();

                self.onDeactivateHandle(corner);
            });
        }
    }

    WPGMZA.EmbeddedMedia.prototype.applyResize = function(mouse){
        const anchor = this.getAnchorPosition();
        
        const padding = parseInt(this.container.css('padding').replace('px', ''));

        let maxWidth = Math.abs(mouse.x - anchor.x);
        maxWidth = this.clamp(padding, this.container.width() - padding, maxWidth);

        this.element.css('width', parseInt(maxWidth) + 'px');
        this.element.attr('width', parseInt(maxWidth));

        this.container.trigger('media_resized');
    }

    WPGMZA.EmbeddedMedia.prototype.getMousePosition = function(event){
        event = event.originalEvent ? event.originalEvent : event;
        const pos = {
            x : parseInt(event.pageX - this.container.offset().left),
            y : parseInt(event.pageY - this.container.offset().top)
        };

        const padding = parseInt(this.container.css('padding').replace('px', ''));

        pos.x = this.clamp(padding, this.container.width() - padding, pos.x);
        pos.y = this.clamp(padding, this.container.height() - padding, pos.y);

        return pos;
    }

    WPGMZA.EmbeddedMedia.prototype.getAnchorPosition = function(){
        const pos = {
            x : parseInt(this.element.offset().left - this.container.offset().left),
            y : parseInt(this.element.offset().top - this.container.offset().top)
        };

        return pos;
    }

    WPGMZA.EmbeddedMedia.prototype.clamp = function(min, max, value){
        if(isNaN(value)){
            value = 0;
        }
        return Math.min(Math.max(value, min), max);
    }

});