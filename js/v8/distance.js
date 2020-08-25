/**
 * Collection of distance utility functions and constants
 * @namespace WPGMZA
 * @module Distance
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkaXN0YW5jZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ29sbGVjdGlvbiBvZiBkaXN0YW5jZSB1dGlsaXR5IGZ1bmN0aW9ucyBhbmQgY29uc3RhbnRzXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgRGlzdGFuY2VcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdHZhciBlYXJ0aFJhZGl1c01ldGVycyA9IDYzNzE7XHJcblx0dmFyIHBpVGltZXMzNjAgPSBNYXRoLlBJIC8gMzYwO1xyXG5cdFxyXG5cdGZ1bmN0aW9uIGRlZzJyYWQoZGVnKSB7XHJcblx0ICByZXR1cm4gZGVnICogKE1hdGguUEkvMTgwKVxyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogQGNsYXNzIFdQR01aQS5EaXN0YW5jZVxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKiBAZGVwcmVjYXRlZCBXaWxsIGJlIGRyb3BwZWQgd2lodCB0aGUgaW50cm9kdWN0aW9uIG9mIGdsb2JhbCBkaXN0YW5jZSB1bml0c1xyXG5cdCAqL1xyXG5cdFdQR01aQS5EaXN0YW5jZSA9IHtcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBNaWxlcywgcmVwcmVzZW50ZWQgYXMgdHJ1ZSBieSBsZWdhY3kgdmVyc2lvbnMgb2YgdGhlIHBsdWdpblxyXG5cdFx0ICogQGNvbnN0YW50IE1JTEVTXHJcblx0XHQgKiBAc3RhdGljXHJcblx0XHQgKiBAbWVtYmVyb2YgV1BHTVpBLkRpc3RhbmNlXHJcblx0XHQgKi9cclxuXHRcdE1JTEVTOlx0XHRcdFx0XHR0cnVlLFxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIEtpbG9tZXRlcnMsIHJlcHJlc2VudGVkIGFzIGZhbHNlIGJ5IGxlZ2FjeSB2ZXJzaW9ucyBvZiB0aGUgcGx1Z2luXHJcblx0XHQgKiBAY29uc3RhbnQgS0lMT01FVEVSU1xyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQG1lbWJlcm9mIFdQR01aQS5EaXN0YW5jZVxyXG5cdFx0ICovXHJcblx0XHRLSUxPTUVURVJTOlx0XHRcdFx0ZmFsc2UsXHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogTWlsZXMgcGVyIGtpbG9tZXRlclxyXG5cdFx0ICogQGNvbnN0YW50IE1JTEVTX1BFUl9LSUxPTUVURVJcclxuXHRcdCAqIEBzdGF0aWNcclxuXHRcdCAqIEBtZW1iZXJvZiBXUEdNWkEuRGlzdGFuY2VcclxuXHRcdCAqL1xyXG5cdFx0TUlMRVNfUEVSX0tJTE9NRVRFUjpcdDAuNjIxMzcxLFxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIEtpbG9tZXRlcnMgcGVyIG1pbGVcclxuXHRcdCAqIEBjb25zdGFudCBLSUxPTUVURVJTX1BFUl9NSUxFXHJcblx0XHQgKiBAc3RhdGljXHJcblx0XHQgKi9cclxuXHRcdEtJTE9NRVRFUlNfUEVSX01JTEU6XHQxLjYwOTM0LFxyXG5cdFx0XHJcblx0XHQvLyBUT0RPOiBJbXBsZW1lbnQgV1BHTVpBLnNldHRpbmdzLmRpc3RhbmNlX3VuaXRzXHJcblx0XHRcclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udmVydHMgYSBVSSBkaXN0YW5jZSAoZWcgZnJvbSBhIGZvcm0gY29udHJvbCkgdG8gbWV0ZXJzLFxyXG5cdFx0ICogYWNjb3VudGluZyBmb3IgdGhlIGdsb2JhbCB1bml0cyBzZXR0aW5nXHJcblx0XHQgKiBAbWV0aG9kIHVpVG9NZXRlcnNcclxuXHRcdCAqIEBzdGF0aWNcclxuXHRcdCAqIEBtZW1iZXJvZiBXUEdNWkEuRGlzdGFuY2VcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB1aURpc3RhbmNlIFRoZSBkaXN0YW5jZSBmcm9tIHRoZSBVSSwgY291bGQgYmUgaW4gbWlsZXMgb3Iga2lsb21ldGVycyBkZXBlbmRpbmcgb24gc2V0dGluZ3NcclxuXHRcdCAqIEByZXR1cm4ge251bWJlcn0gVGhlIGlucHV0IGRpc3RhbmNlIGluIG1ldGVyc1xyXG5cdFx0ICovXHJcblx0XHR1aVRvTWV0ZXJzOiBmdW5jdGlvbih1aURpc3RhbmNlKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gcGFyc2VGbG9hdCh1aURpc3RhbmNlKSAvIChXUEdNWkEuc2V0dGluZ3MuZGlzdGFuY2VfdW5pdHMgPT0gV1BHTVpBLkRpc3RhbmNlLk1JTEVTID8gV1BHTVpBLkRpc3RhbmNlLk1JTEVTX1BFUl9LSUxPTUVURVIgOiAxKSAqIDEwMDA7XHJcblx0XHR9LFxyXG5cdFx0XHJcblx0XHQvKipcclxuXHRcdCAqIENvbnZlcnRzIGEgVUkgZGlzdGFuY2UgKGVnIGZyb20gYSBmb3JtIGNvbnRyb2wpIHRvIGtpbG9tZXRlcnMsXHJcblx0XHQgKiBhY2NvdW50aW5nIGZvciB0aGUgZ2xvYmFsIHVuaXRzIHNldHRpbmdcclxuXHRcdCAqIEBtZXRob2QgdWlUb0tpbG9tZXRlcnNcclxuXHRcdCAqIEBzdGF0aWNcclxuXHRcdCAqIEBtZW1iZXJvZiBXUEdNWkEuRGlzdGFuY2VcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSB1aURpc3RhbmNlIFRoZSBkaXN0YW5jZSBmcm9tIHRoZSBVSSwgY291bGQgYmUgaW4gbWlsZXMgb3Iga2lsb21ldGVycyBkZXBlbmRpbmcgb24gc2V0dGluZ3NcclxuXHRcdCAqIEByZXR1cm4ge251bWJlcn0gVGhlIGlucHV0IGRpc3RhbmNlIGluIGtpbG9tZXRlcnNcclxuXHRcdCAqL1xyXG5cdFx0dWlUb0tpbG9tZXRlcnM6IGZ1bmN0aW9uKHVpRGlzdGFuY2UpXHJcblx0XHR7XHJcblx0XHRcdHJldHVybiBXUEdNWkEuRGlzdGFuY2UudWlUb01ldGVycyh1aURpc3RhbmNlKSAqIDAuMDAxO1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb252ZXJ0cyBhIFVJIGRpc3RhbmNlIChlZyBmcm9tIGEgZm9ybSBjb250cm9sKSB0byBtaWxlcywgYWNjb3JkaW5nIHRvIHNldHRpbmdzXHJcblx0XHQgKiBAbWV0aG9kIHVpVG9NaWxlc1xyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQG1lbWJlcm9mIFdQR01aQS5EaXN0YW5jZVxyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IHVpRGlzdGFuY2UgVGhlIGRpc3RhbmNlIGZyb20gdGhlIFVJLCBjb3VsZCBiZSBpbiBtaWxlcyBvciBraWxvbWV0ZXJzIGRlcGVuZGluZyBvbiBzZXR0aW5nc1xyXG5cdFx0ICogQHJldHVybiB7bnVtYmVyfSBUaGUgaW5wdXQgZGlzdGFuY2UgXHJcblx0XHQgKi9cclxuXHRcdHVpVG9NaWxlczogZnVuY3Rpb24odWlEaXN0YW5jZSlcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuIFdQR01aQS5EaXN0YW5jZS51aVRvS2lsb21ldGVycyh1aURpc3RhbmNlKSAqIFdQR01aQS5EaXN0YW5jZS5NSUxFU19QRVJfS0lMT01FVEVSO1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBDb252ZXJ0cyBraWxvbWV0ZXJzIHRvIGEgVUkgZGlzdGFuY2UsIGVpdGhlciB0aGUgc2FtZSB2YWx1ZSwgb3IgY29udmVydGVkIHRvIG1pbGVzIGRlcGVuZGluZyBvbiBzZXR0aW5ncy5cclxuXHRcdCAqIEBtZXRob2Qga2lsb21ldGVyc1RvVUlcclxuXHRcdCAqIEBzdGF0aWNcclxuXHRcdCAqIEBtZW1iZXJvZiBXUEdNWkEuRGlzdGFuY2VcclxuXHRcdCAqIEBwYXJhbSB7bnVtYmVyfSBrbSBUaGUgaW5wdXQgZGlzdGFuY2UgaW4ga2lsb21ldGVyc1xyXG5cdFx0ICogQHBhcmFtIHtudW1iZXJ9IFRoZSBVSSBkaXN0YW5jZSBpbiB0aGUgdW5pdHMgc3BlY2lmaWVkIGJ5IHNldHRpbmdzXHJcblx0XHQgKi9cclxuXHRcdGtpbG9tZXRlcnNUb1VJOiBmdW5jdGlvbihrbSlcclxuXHRcdHtcclxuXHRcdFx0aWYoV1BHTVpBLnNldHRpbmdzLmRpc3RhbmNlX3VuaXRzID09IFdQR01aQS5EaXN0YW5jZS5NSUxFUylcclxuXHRcdFx0XHRyZXR1cm4ga20gKiBXUEdNWkEuRGlzdGFuY2UuTUlMRVNfUEVSX0tJTE9NRVRFUjtcclxuXHRcdFx0cmV0dXJuIGttO1xyXG5cdFx0fSxcclxuXHRcdFxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZXR1cm5zIHRoZSBkaXN0YW5jZSwgaW4ga2lsb21ldGVycywgYmV0d2VlbiB0d28gTGF0TG5nJ3NcclxuXHRcdCAqIEBtZXRob2QgYmV0d2VlblxyXG5cdFx0ICogQHN0YXRpY1xyXG5cdFx0ICogQG1lbWJlcm9mIFdQR01aQS5EaXN0YW5jZVxyXG5cdFx0ICogQHBhcmFtIHtXUEdNWkEuTGF0bG5nfSBUaGUgZmlyc3QgcG9pbnRcclxuXHRcdCAqIEBwYXJhbSB7V1BHTVpBLkxhdGxuZ30gVGhlIHNlY29uZCBwb2ludFxyXG5cdFx0ICogQHJldHVybiB7bnVtYmVyfSBUaGUgZGlzdGFuY2UsIGluIGtpbG9tZXRlcnNcclxuXHRcdCAqL1xyXG5cdFx0YmV0d2VlbjogZnVuY3Rpb24oYSwgYilcclxuXHRcdHtcclxuXHRcdFx0aWYoIShhIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZykgJiYgIShcImxhdFwiIGluIGEgJiYgXCJsbmdcIiBpbiBhKSlcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmcgb3IgYSBsaXRlcmFsXCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoIShiIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZykgJiYgIShcImxhdFwiIGluIGIgJiYgXCJsbmdcIiBpbiBiKSlcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuTGF0TG5nIG9yIGEgbGl0ZXJhbFwiKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGEgPT09IGIpXHJcblx0XHRcdFx0cmV0dXJuIDAuMDtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBsYXQxID0gYS5sYXQ7XHJcblx0XHRcdHZhciBsb24xID0gYS5sbmc7XHJcblx0XHRcdHZhciBsYXQyID0gYi5sYXQ7XHJcblx0XHRcdHZhciBsb24yID0gYi5sbmc7XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgZExhdCA9IGRlZzJyYWQobGF0MiAtIGxhdDEpO1xyXG5cdFx0XHR2YXIgZExvbiA9IGRlZzJyYWQobG9uMiAtIGxvbjEpOyBcclxuXHRcdFx0XHJcblx0XHRcdHZhciBhID0gXHJcblx0XHRcdFx0TWF0aC5zaW4oZExhdC8yKSAqIE1hdGguc2luKGRMYXQvMikgK1xyXG5cdFx0XHRcdE1hdGguY29zKGRlZzJyYWQobGF0MSkpICogTWF0aC5jb3MoZGVnMnJhZChsYXQyKSkgKiBcclxuXHRcdFx0XHRNYXRoLnNpbihkTG9uLzIpICogTWF0aC5zaW4oZExvbi8yKTsgXHJcblx0XHRcdFx0XHJcblx0XHRcdHZhciBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMS1hKSk7IFxyXG5cdFx0XHR2YXIgZCA9IGVhcnRoUmFkaXVzTWV0ZXJzICogYzsgLy8gRGlzdGFuY2UgaW4ga21cclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBkO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fTtcclxuXHRcclxufSk7Il0sImZpbGUiOiJkaXN0YW5jZS5qcyJ9
