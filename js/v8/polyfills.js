/**
 * @namespace WPGMZA
 * @module Polyfills
 * @requires WPGMZA
 * @gulp-requires core.js
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb2x5ZmlsbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgUG9seWZpbGxzXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHJcblx0Ly8gSUUxMSBwb2x5ZmlsbCBmb3Igc2xpY2Ugbm90IGJlaW5nIGltcGxlbWVudGVkIG9uIFVpbnQ4QXJyYXkgKHVzZWQgYnkgdGV4dC5qcylcclxuXHRpZiAoIVVpbnQ4QXJyYXkucHJvdG90eXBlLnNsaWNlKSB7XHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoVWludDhBcnJheS5wcm90b3R5cGUsICdzbGljZScsIHtcclxuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIChiZWdpbiwgZW5kKSB7XHJcblx0XHRcdFx0cmV0dXJuIG5ldyBVaW50OEFycmF5KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMsIGJlZ2luLCBlbmQpKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8vIFNhZmFyaSBwb2x5ZmlsbCBmb3IgRW5mb2xkIHRoZW1lcyBUeXBlRXJyb3I6ICd1bmRlZmluZWQnIGlzIG5vdCBhIHZhbGlkIGFyZ3VtZW50IGZvciAnaW4nXHJcblx0aWYoV1BHTVpBLmlzU2FmYXJpKCkgJiYgIXdpbmRvdy5leHRlcm5hbClcclxuXHRcdHdpbmRvdy5leHRlcm5hbCA9IHt9O1xyXG5cclxufSk7Il0sImZpbGUiOiJwb2x5ZmlsbHMuanMifQ==
