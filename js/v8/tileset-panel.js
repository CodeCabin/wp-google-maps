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

            WPGMZA.notification("Save map to apply tileset!", false, '.grouping.open[data-group="map-settings-themes-tileset"]', 'top-right');
		});

        this.onTilesetChange();
	}

	WPGMZA.TilesetPanel.prototype.onTilesetChange = function(event){
		this.element.find('.tileset-option').removeClass('selected');

        this.element.find('.tileset-option input:checked').parent().addClass('selected');
	}
});