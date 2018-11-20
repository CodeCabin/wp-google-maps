/**
 * Collection of distance utility functions and constants
 * @namespace WPGMZA
 * @module Distance
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * @class WPGMZA.Distance
	 * @memberof WPGMZA
	 * @deprecated Will be dropped wiht the introduction of global distance units
	 */
	WPGMZA.Distance = {
		
		/**
		 * Miles, represented as true by legacy versions of the plugin
		 * @constant MILES
		 * @static
		 * @memberof WPGMZA.Distance
		 */
		MILES:					true,
		
		/**
		 * Kilometers, represented as false by legacy versions of the plugin
		 * @constant KILOMETERS
		 * @static
		 * @memberof WPGMZA.Distance
		 */
		KILOMETERS:				false,
		
		/**
		 * Miles per kilometer
		 * @constant MILES_PER_KILOMETER
		 * @static
		 * @memberof WPGMZA.Distance
		 */
		MILES_PER_KILOMETER:	0.621371,
		
		/**
		 * Kilometers per mile
		 * @constant KILOMETERS_PER_MILE
		 * @static
		 */
		KILOMETERS_PER_MILE:	1.60934,
		
		/**
		 * Converts a UI distance (eg from a form control) to meters,
		 * accounting for the global units setting
		 * @method uiToMeters
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} uiDistance The distance from the UI, could be in miles or kilometers depending on settings
		 * @return {number} The input distance in meters
		 */
		uiToMeters: function(uiDistance)
		{
			return parseFloat(uiDistance) / (WPGMZA.settings.distance_units == WPGMZA.Distance.MILES ? WPGMZA.Distance.MILES_PER_KILOMETER : 1) * 1000;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to kilometers,
		 * accounting for the global units setting
		 * @method uiToKilometers
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} uiDistance The distance from the UI, could be in miles or kilometers depending on settings
		 * @return {number} The input distance in kilometers
		 */
		uiToKilometers: function(uiDistance)
		{
			return WPGMZA.Distance.uiToMeters(uiDistance) * 0.001;
		},
		
		/**
		 * Converts a UI distance (eg from a form control) to miles, according to settings
		 * @method uiToMiles
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} uiDistance The distance from the UI, could be in miles or kilometers depending on settings
		 * @return {number} The input distance 
		 */
		uiToMiles: function(uiDistance)
		{
			return WPGMZA.Distance.uiToKilometers(uiDistance) * WPGMZA.Distance.MILES_PER_KILOMETER;
		},
		
		/**
		 * Converts kilometers to a UI distance, either the same value, or converted to miles depending on settings.
		 * @method kilometersToUI
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {number} km The input distance in kilometers
		 * @param {number} The UI distance in the units specified by settings
		 */
		kilometersToUI: function(km)
		{
			if(WPGMZA.settings.distance_units == WPGMZA.Distance.MILES)
				return km * WPGMZA.Distance.MILES_PER_KILOMETER;
			return km;
		}
		
	};
	
});