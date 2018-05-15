/**
 * @namespace WPGMZA
 * @module OLModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 */
(function($) {
	
	WPGMZA.OLModernStoreLocator = function(map_id)
	{
		WPGMZA.ModernStoreLocator.call(this, map_id);
	}
	
	WPGMZA.OLModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator);
	WPGMZA.OLModernStoreLocator.prototype.constructor = WPGMZA.OLModernStoreLocator;
	
})(jQuery);