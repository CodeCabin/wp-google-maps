/**
 * @namespace WPGMZA
 * @module Compatibility
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * Reverse compatibility module
	 *
	 * @class WPGMZA.Compatibility
	 * @constructor WPGMZA.Compatibility
	 * @memberof WPGMZA
	 */
	WPGMZA.Compatibility = function()
	{
		this.preventDocumentWriteGoogleMapsAPI();
	}
	
	/**
	 * Prevents document.write from outputting Google Maps API script tag
	 *
	 * @method
	 * @memberof WPGMZA.Compatibility
	 */
	WPGMZA.Compatibility.prototype.preventDocumentWriteGoogleMapsAPI = function()
	{
		var old = document.write;
		
		document.write = function(content)
		{
			if(content.match && content.match(/maps\.google/))
				return;
			
			old.call(document, content);
		}
	}
	
	WPGMZA.compatiblityModule = new WPGMZA.Compatibility();
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wYXRpYmlsaXR5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIENvbXBhdGliaWxpdHlcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldmVyc2UgY29tcGF0aWJpbGl0eSBtb2R1bGVcclxuXHQgKlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuQ29tcGF0aWJpbGl0eVxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuQ29tcGF0aWJpbGl0eVxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKi9cclxuXHRXUEdNWkEuQ29tcGF0aWJpbGl0eSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR0aGlzLnByZXZlbnREb2N1bWVudFdyaXRlR29vZ2xlTWFwc0FQSSgpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBQcmV2ZW50cyBkb2N1bWVudC53cml0ZSBmcm9tIG91dHB1dHRpbmcgR29vZ2xlIE1hcHMgQVBJIHNjcmlwdCB0YWdcclxuXHQgKlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkNvbXBhdGliaWxpdHlcclxuXHQgKi9cclxuXHRXUEdNWkEuQ29tcGF0aWJpbGl0eS5wcm90b3R5cGUucHJldmVudERvY3VtZW50V3JpdGVHb29nbGVNYXBzQVBJID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBvbGQgPSBkb2N1bWVudC53cml0ZTtcclxuXHRcdFxyXG5cdFx0ZG9jdW1lbnQud3JpdGUgPSBmdW5jdGlvbihjb250ZW50KVxyXG5cdFx0e1xyXG5cdFx0XHRpZihjb250ZW50Lm1hdGNoICYmIGNvbnRlbnQubWF0Y2goL21hcHNcXC5nb29nbGUvKSlcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFxyXG5cdFx0XHRvbGQuY2FsbChkb2N1bWVudCwgY29udGVudCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5jb21wYXRpYmxpdHlNb2R1bGUgPSBuZXcgV1BHTVpBLkNvbXBhdGliaWxpdHkoKTtcclxuXHRcclxufSk7Il0sImZpbGUiOiJjb21wYXRpYmlsaXR5LmpzIn0=
