/**
 * Collection of distance utility functions and constants
 * @namespace WPGMZA
 * @module Distance
 * @requires WPGMZA
 */
jQuery(function($) {
	
	var earthRadiusMeters = 6371;
	var piTimes360 = Math.PI / 360;
	
	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	};
	
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
		
		// TODO: Implement WPGMZA.settings.distance_units
		
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
		},
		
		/**
		 * Returns the distance, in kilometers, between two LatLng's
		 * @method between
		 * @static
		 * @memberof WPGMZA.Distance
		 * @param {WPGMZA.Latlng} The first point
		 * @param {WPGMZA.Latlng} The second point
		 * @return {number} The distance, in kilometers
		 */
		between: function(a, b)
		{
			if(!(a instanceof WPGMZA.LatLng) && !("lat" in a && "lng" in a))
				throw new Error("First argument must be an instance of WPGMZA.LatLng or a literal");
			
			if(!(b instanceof WPGMZA.LatLng) && !("lat" in b && "lng" in b))
				throw new Error("Second argument must be an instance of WPGMZA.LatLng or a literal");
			
			if(a === b)
				return 0.0;
			
			var lat1 = a.lat;
			var lon1 = a.lng;
			var lat2 = b.lat;
			var lon2 = b.lng;
			
			var dLat = deg2rad(lat2 - lat1);
			var dLon = deg2rad(lon2 - lon1); 
			
			var a = 
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
				Math.sin(dLon/2) * Math.sin(dLon/2); 
				
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = earthRadiusMeters * c; // Distance in km
			
			return d;
		}
		
	};
	
});