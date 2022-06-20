/**
 * @namespace WPGMZA
 * @module OLThemePanel
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.OLThemePanel = function()
	{
		var self = this;
		
		this.element = $("#wpgmza-ol-theme-panel");
		this.map = WPGMZA.maps[0];
		
		if(!this.element.length)
		{
			console.warn("No element to initialise theme panel on");
			return;
		}
		
		this.element.on("click", "#wpgmza-theme-presets label, .theme-selection-panel label", function(event) {
			self.onThemePresetClick(event);
		});
		
		WPGMZA.OLThemePanel = this;
	}

	WPGMZA.OLThemePanel.prototype.onThemePresetClick = function(event){
		if(event.currentTarget){
			const element = $(event.currentTarget);
			const filter = element.data('filter');

			if(filter && $('input[name="wpgmza_ol_tile_filter"]').length){
				const input = $('input[name="wpgmza_ol_tile_filter"]').get(0);
				// $('input[name="wpgmza_ol_tile_filter"]').val(filter).trigger('change');

				if(input.wpgmzaCSSFilterInput){
					input.wpgmzaCSSFilterInput.parseFilters(filter);
				}
			}
		}
	}

});