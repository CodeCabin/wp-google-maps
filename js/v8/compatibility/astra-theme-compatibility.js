/**
 * @namespace WPGMZA
 * @module AstraThemeCompatiblity
 * @requires WPGMZA
 * @gulp-requires ../core.js
 * @description Prevents the document.body.onclick handler firing for markers, which causes the Astra theme to throw an error, preventing the infowindow from opening
 */
jQuery(function($) {
	
	$(window).on("load", function(event) {
		
		var parent = document.body.onclick;
		
		if(!parent)
			return;
		
		document.body.onclick = function(event)
		{
			if(event.target instanceof WPGMZA.Marker)
				return;
			
			parent(event);
		}
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wYXRpYmlsaXR5L2FzdHJhLXRoZW1lLWNvbXBhdGliaWxpdHkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgQXN0cmFUaGVtZUNvbXBhdGlibGl0eVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2NvcmUuanNcclxuICogQGRlc2NyaXB0aW9uIFByZXZlbnRzIHRoZSBkb2N1bWVudC5ib2R5Lm9uY2xpY2sgaGFuZGxlciBmaXJpbmcgZm9yIG1hcmtlcnMsIHdoaWNoIGNhdXNlcyB0aGUgQXN0cmEgdGhlbWUgdG8gdGhyb3cgYW4gZXJyb3IsIHByZXZlbnRpbmcgdGhlIGluZm93aW5kb3cgZnJvbSBvcGVuaW5nXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdCQod2luZG93KS5vbihcImxvYWRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFxyXG5cdFx0dmFyIHBhcmVudCA9IGRvY3VtZW50LmJvZHkub25jbGljaztcclxuXHRcdFxyXG5cdFx0aWYoIXBhcmVudClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRkb2N1bWVudC5ib2R5Lm9uY2xpY2sgPSBmdW5jdGlvbihldmVudClcclxuXHRcdHtcclxuXHRcdFx0aWYoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgV1BHTVpBLk1hcmtlcilcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFxyXG5cdFx0XHRwYXJlbnQoZXZlbnQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoiY29tcGF0aWJpbGl0eS9hc3RyYS10aGVtZS1jb21wYXRpYmlsaXR5LmpzIn0=
