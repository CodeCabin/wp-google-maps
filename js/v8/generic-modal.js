/**
 * @namespace WPGMZA
 * @module GenericModal
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.GenericModal = function(element, complete, cancel){
        this.element = $(element);

        this._onComplete = complete ? complete : false;
        this._onCancel = cancel ? cancel : false;

        this.bindEvents();
    }

    WPGMZA.extend(WPGMZA.GenericModal, WPGMZA.EventDispatcher);

    WPGMZA.GenericModal.createInstance = function(element, complete, cancel) {
        if(WPGMZA.isProVersion()){
            return new WPGMZA.ProGenericModal(element, complete, cancel);
        }
        return new WPGMZA.GenericModal(element, complete, cancel);
    }

    WPGMZA.GenericModal.prototype.bindEvents = function(){
        const self = this;
        this.element.on('click', '.wpgmza-button', function(){
            const action = $(this).data('action');
            if(action === 'complete'){
                self.onComplete();
            } else {
                self.onCancel();
            }
        });
    }

    WPGMZA.GenericModal.prototype.getData = function(){
        const data = {};
        this.element.find('input,select').each(function(){
            const ajaxName = $(this).data('ajax-name');

            if(!ajaxName)
                return;

            /* .val() always returns a checkbox's static value attribute (or "on" when
               absent) regardless of whether it's actually checked - matches the
               convention FeaturePanel.serializeFormData() already uses for the same
               data-ajax-name fields on the individual feature panels. */
            if($(this).attr('type') === 'checkbox'){
                data[ajaxName] = $(this).prop('checked') ? 1 : 0;
            } else {
                data[ajaxName] = $(this).val();
            }
        });

        return data;
    }

    WPGMZA.GenericModal.prototype.onComplete = function(){
        this.hide();
        if(typeof this._onComplete === 'function'){
            this._onComplete(this.getData());
        }
    }

    WPGMZA.GenericModal.prototype.onCancel = function(){
        this.hide();
        if(typeof this._onCancel === 'function'){
            this._onCancel();
        }
    }

    WPGMZA.GenericModal.prototype.show = function(complete, cancel){
        /* Support hotswapping */
        this._onComplete = complete ? complete : this._onComplete;
        this._onCancel = cancel ? cancel : this._onCancel;

        this.element.addClass('pending');
    }

    WPGMZA.GenericModal.prototype.hide = function(){
        this.element.removeClass('pending');
    }


});