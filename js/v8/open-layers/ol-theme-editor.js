/**
 * @namespace WPGMZA
 * @module OLThemeEditor
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.OLThemeEditor = function()
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.element = $("#wpgmza-ol-theme-editor");
		
		if(!this.element.length){
			console.warn("No element to initialise theme editor on");
			return;
		}

		this.mapElement = WPGMZA.maps[0].element;

		$(this.element).find('input[name="wpgmza_ol_tile_filter"]').on('change', function(event){
			self.onFilterChange(event.currentTarget);
		});	
	}
	
	WPGMZA.extend(WPGMZA.OLThemeEditor, WPGMZA.EventDispatcher);

	WPGMZA.OLThemeEditor.prototype.onFilterChange = function(context){
		if(context instanceof HTMLInputElement){
			const value = $(context).val();

			if(this.mapElement){
            	$(this.mapElement).css('--wpgmza-ol-tile-filter', value);
			}
		}
	}
});