/**
 * @namespace WPGMZA
 * @module LeafletThemeEditor
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.LeafletThemeEditor = function()
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.element = $("#wpgmza-leaflet-theme-editor");
		
		if(!this.element.length){
			console.warn("No element to initialise theme editor on");
			return;
		}

		this.mapElement = WPGMZA.maps[0].element;

		$(this.element).find('input[name="wpgmza_leaflet_tile_filter"]').on('change', function(event){
			self.onFilterChange(event.currentTarget);
		});	
	}
	
	WPGMZA.extend(WPGMZA.LeafletThemeEditor, WPGMZA.EventDispatcher);

	WPGMZA.LeafletThemeEditor.prototype.onFilterChange = function(context){
		if(context instanceof HTMLInputElement){
			const value = $(context).val();

			if(this.mapElement){
            	$(this.mapElement).css('--wpgmza-leaflet-tile-filter', value);
			}
		}
	}
});