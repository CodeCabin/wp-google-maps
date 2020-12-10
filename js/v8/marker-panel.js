/**
 * @namespace WPGMZA
 * @module MarkerPanel
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.MarkerPanel = function(element)
	{
		this.element = element;
	}
	
	$(document.body).on("wpgmza_map_editor_init", function(event) {
		
		if(WPGMZA.getCurrentPage() == WPGMZA.PAGE_MAP_EDIT)
			WPGMZA.mapEditPage.markerPanel = new WPGMZA.MarkerPanel($("#wpgmza-marker-edit-panel")[0]);
		
	});
	
});