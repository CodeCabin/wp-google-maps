/**
 * @namespace WPGMZA
 * @module LeafletGeocoder
 * @requires WPGMZA.NominatimGeocoder
 */
jQuery(function($) {
	
	/**
	 * @class LeafletGeocoder
	 * @extends NominatimGeocoder
	 * @summary Geocoder - uses Nominatim by default
	 */
	WPGMZA.LeafletGeocoder = function() {
		
	}
	
	WPGMZA.LeafletGeocoder.prototype = Object.create(WPGMZA.NominatimGeocoder.prototype);
	WPGMZA.LeafletGeocoder.prototype.constructor = WPGMZA.LeafletGeocoder;
});