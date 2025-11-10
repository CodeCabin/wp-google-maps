/**
 * @namespace WPGMZA
 * @module PresetSelectionInput
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
    WPGMZA.PresetSelectionInput = function(element, options){
        this.element = $(element);
        this.input = this.element.find('input');
        this.bind();
    }

    WPGMZA.extend(WPGMZA.PresetSelectionInput, WPGMZA.EventDispatcher);

    WPGMZA.PresetSelectionInput.createInstance = function(element) {
        return new WPGMZA.PresetSelectionInput(element);
    }

    WPGMZA.PresetSelectionInput.prototype.bind = function(){
        this.input.on('change', () => {
            const val = this.input.val();
            this.element.find('.wpgmza-preset-input-controller-option').removeClass('selected');

            if(this.element.find(`.wpgmza-preset-input-controller-option[data-value="${val}"]`).length){
                this.element.find(`.wpgmza-preset-input-controller-option[data-value="${val}"]`).addClass('selected');
            }
        });

        this.element.on('click', '.wpgmza-preset-input-controller-option', (event) => {
            event.preventDefault();
            this.input.val($(event.currentTarget).data('value'));
            this.input.trigger('change');
        });

        this.input.trigger('change');
    }

    $(document.body).ready(function(){
        $(".wpgmza-preset-input-controller").each(function(index, el) {
            el.wpgmzaPresetSelectionInput = WPGMZA.PresetSelectionInput.createInstance(el);
        });
    });

});