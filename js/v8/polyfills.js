/**
 * @namespace WPGMZA
 * @module Polyfills
 * @requires WPGMZA
 */
jQuery(function($) {

	// IE11 polyfill for slice not being implemented on Uint8Array (used by text.js)
	if (!Uint8Array.prototype.slice) {
		Object.defineProperty(Uint8Array.prototype, 'slice', {
			value: function (begin, end) {
				return new Uint8Array(Array.prototype.slice.call(this, begin, end));
			}
		});
	}
	
	// Safari polyfill for Enfold themes TypeError: 'undefined' is not a valid argument for 'in'
	if(WPGMZA.isSafari() && !window.external)
		window.external = {};

});