/**
 * @namespace WPGMZA
 * @module CSSStateBlock
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.CSSStateBlock = function(element, options){
        if(!(element instanceof HTMLElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.tabs = this.element.find('.wpgmza-css-state-block-item');
        this.items = this.element.find('.wpgmza-css-state-block-content');

        this.items.removeClass('active');
    
        this.bindEvents();
        
        this.element.find('.wpgmza-css-state-block-item:first-child').click();
    }

    WPGMZA.extend(WPGMZA.CSSStateBlock, WPGMZA.EventDispatcher);

    WPGMZA.CSSStateBlock.createInstance = function(element) {
        return new WPGMZA.CSSStateBlock(element);
    }

    WPGMZA.CSSStateBlock.prototype.bindEvents = function(){
        let self = this;
        this.tabs.on('click', function(event) {
            self.onClick($(this));
        });
    }

    WPGMZA.CSSStateBlock.prototype.onClick = function(item){
        const type = item.data('type');
        if(type){
            this.tabs.removeClass('active');
            item.addClass('active');
            
            this.items.removeClass('active');
            this.element.find('.wpgmza-css-state-block-content[data-type="' + type + '"]').addClass('active');
        }
    }

    $(document.body).ready(function(){
        $(".wpgmza-css-state-block").each(function(index, el) {
            el.wpgmzaCSSStateBlock = WPGMZA.CSSStateBlock.createInstance(el);
        });
    });
});