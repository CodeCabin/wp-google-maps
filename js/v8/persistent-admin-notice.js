/**
 * @namespace WPGMZA
 * @module PersistentAdminNotice
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.PersistentAdminNotice = function(element, options){
        if(!(element instanceof HTMLElement))
            throw new Error("Element is not an instance of HTMLInputElement");

        this.element = $(element);
        this.dismissButton = this.element.find('.notice-dismiss');

        this.ajaxActionButton = this.element.find('a[data-ajax]');

        this.bindEvents();
    }

    WPGMZA.extend(WPGMZA.PersistentAdminNotice, WPGMZA.EventDispatcher);

    WPGMZA.PersistentAdminNotice.createInstance = function(element) {
        return new WPGMZA.PersistentAdminNotice(element);
    }

    WPGMZA.PersistentAdminNotice.prototype.bindEvents = function(){
        let self = this;
        this.dismissButton.on('click', function(event) {
            self.onDismiss($(this));
        });

        this.ajaxActionButton.on('click', function(event) {
            event.preventDefault();
            self.onAjaxAction($(this));
        });
    }

    WPGMZA.PersistentAdminNotice.prototype.onDismiss = function(item){
        const noticeSlug = this.element.data('slug');

        const data = {
            action  : 'wpgmza_dismiss_persistent_notice',
            slug : noticeSlug,
            wpgmza_security : WPGMZA.ajaxnonce
        };

        $.ajax(WPGMZA.ajaxurl, {
            method: "POST",
            data: data,
            success: function(response, status, xhr) {
                // Nothing to do
            },
            error : function(){}
        });
    }

    WPGMZA.PersistentAdminNotice.prototype.onAjaxAction = function(item){
        if(item.data('disabled')){
            return;
        }

        const action = item.data('ajax-action');

        item.attr('data-disabled', 'true');
        item.css('opacity', "0.5");

        if(action){
            const data = {
                action : 'wpgmza_persisten_notice_quick_action',
                relay : action,
                wpgmza_security : WPGMZA.ajaxnonce
            };

            $.ajax(WPGMZA.ajaxurl, {
                method: "POST",
                data : data,
                success : function(response){
                    window.location.reload();
                },
                error: function(){}
            });
        }
    }

    $(document.body).ready(function(){
        $(".wpgmza-persistent-notice").each(function(index, el) {
            el.wpgmzaPersistentAdminNotice = WPGMZA.PersistentAdminNotice.createInstance(el);
        });
    });
});