/**
 * @namespace WPGMZA
 * @module OLGeocoder
 * @requires WPGMZA.NominatimGeocoder
 */
jQuery(function($) {
	/**
	 * @class OLGeocoder
	 * @extends NominatimGeocoder
	 * @summary OpenLayers geocoder - uses Nominatim by default
	 */
	WPGMZA.OLGeocoder = function() {
		
	}
	
	WPGMZA.OLGeocoder.prototype = Object.create(WPGMZA.NominatimGeocoder.prototype);
	WPGMZA.OLGeocoder.prototype.constructor = WPGMZA.OLGeocoder;
});