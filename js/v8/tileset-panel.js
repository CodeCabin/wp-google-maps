/**
 * @namespace WPGMZA
 * @module TilesetPanel
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.TilesetPanel = function() {
		this.element = $("#wpgmza-tileset-panel");
		if(!this.element.length) {
			return;
		}
		
		this.element.on("click", ".tileset-option", (event) => {
			this.onTilesetChange(event);

			/* Skip the "Save map to apply tileset!" reminder when Atlas
			 * Major's live preview is mounted — the live preview JS
			 * applies the tileset to the map immediately on click, so
			 * the notification would be misleading. Atlas Novus / Legacy
			 * still need the reminder since their editors can't preview
			 * the swap until the map is saved + reloaded. */
			if(!document.querySelector('.wpgmza-atlas-major .am-preview-frame')){
				WPGMZA.notification("Save map to apply tileset!", false, '.grouping.open[data-group="map-settings-themes-tileset"]', 'top-right');
			}
		});

        this.onTilesetChange();
	}

	WPGMZA.TilesetPanel.prototype.onTilesetChange = function(event){
		this.element.find('.tileset-option').removeClass('selected');

        this.element.find('.tileset-option input:checked').parent().addClass('selected');
	}
});