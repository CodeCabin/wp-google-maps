/**
 * Internal Engine Constants
 * @namespace WPGMZA
 * @module InternalEngine
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * @class WPGMZA.InternalEngine
	 * @memberof WPGMZA
	 */
	WPGMZA.InternalEngine = {
		
		/**
		 * Legacy
		 * @constant LEGACY
		 * @static
		 * @memberof WPGMZA.InternalEngine
		 */
		LEGACY:	"legacy",
		
		/**
		 * Atlas Novus
		 * @constant ATLAS_NOVUS
		 * @static
		 * @memberof WPGMZA.InternalEngine
		 */
		ATLAS_NOVUS: "atlast-novus",
		
		/**
		 * Check if the interface is in legacy mode,
		 * @method isLegacy
		 * @static
		 * @memberof WPGMZA.InternalEngine
		 * @return {bool} True if in legacy
		 */
		isLegacy: function(){
			return WPGMZA.settings.internalEngine === WPGMZA.InternalEngine.LEGACY;
		},

		/**
		 * Access the global setting in a safe way
		 * @method getEngine
		 * @static
		 * @memberof WPGMZA.InternalEngine
		 * @return {string} The selected engine
		 */
		getEngine: function(){
			return WPGMZA.settings.internalEngine;
		}
	};
	
});