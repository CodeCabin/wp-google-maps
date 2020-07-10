/**
 * @namespace WPGMZA
 * @module NativeMapsAppIcon
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * Small utility class to create an icon for the native maps app, an Apple icon on iOS devices, a Google icon on other devices
	 * @method WPGMZA.NativeMapsAppIcon
	 * @constructor WPGMZA.NativeMapsAppIcon
	 * @memberof WPGMZA
	 */
	WPGMZA.NativeMapsAppIcon = function() {
		if(navigator.userAgent.match(/^Apple|iPhone|iPad|iPod/))
		{
			this.type = "apple";
			this.element = $('<span><i class="fab fa fa-apple" aria-hidden="true"></i></span>');
		}
		else
		{
			this.type = "google";
			this.element = $('<span><i class="fab fa fa-google" aria-hidden="true"></i></span>');
		}
	};
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJuYXRpdmUtbWFwcy1pY29uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIE5hdGl2ZU1hcHNBcHBJY29uXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBTbWFsbCB1dGlsaXR5IGNsYXNzIHRvIGNyZWF0ZSBhbiBpY29uIGZvciB0aGUgbmF0aXZlIG1hcHMgYXBwLCBhbiBBcHBsZSBpY29uIG9uIGlPUyBkZXZpY2VzLCBhIEdvb2dsZSBpY29uIG9uIG90aGVyIGRldmljZXNcclxuXHQgKiBAbWV0aG9kIFdQR01aQS5OYXRpdmVNYXBzQXBwSWNvblxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTmF0aXZlTWFwc0FwcEljb25cclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICovXHJcblx0V1BHTVpBLk5hdGl2ZU1hcHNBcHBJY29uID0gZnVuY3Rpb24oKSB7XHJcblx0XHRpZihuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9eQXBwbGV8aVBob25lfGlQYWR8aVBvZC8pKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnR5cGUgPSBcImFwcGxlXCI7XHJcblx0XHRcdHRoaXMuZWxlbWVudCA9ICQoJzxzcGFuPjxpIGNsYXNzPVwiZmFiIGZhIGZhLWFwcGxlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvc3Bhbj4nKTtcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50eXBlID0gXCJnb29nbGVcIjtcclxuXHRcdFx0dGhpcy5lbGVtZW50ID0gJCgnPHNwYW4+PGkgY2xhc3M9XCJmYWIgZmEgZmEtZ29vZ2xlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPjwvc3Bhbj4nKTtcclxuXHRcdH1cclxuXHR9O1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6Im5hdGl2ZS1tYXBzLWljb24uanMifQ==
