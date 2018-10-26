/**
 * @namespace WPGMZA
 * @module PopoutPanel
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Common functionality for popout panels, which is the
	 * directions box, directions result box, and the modern
	 * style marker listing
	 * @return Object
	 */
	WPGMZA.PopoutPanel = function()
	{
		
	};
	
	/**
	 * Opens the direction box
	 * @return void
	 */
	WPGMZA.PopoutPanel.prototype.open = function() {
		$(this.element).addClass("wpgmza-open");
	};
	
	/**
	 * Closes the direction box
	 * @return void
	 */
	WPGMZA.PopoutPanel.prototype.close = function() {
		$(this.element).removeClass("wpgmza-open");
	};
	
});