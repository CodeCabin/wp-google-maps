/**
 * @namespace WPGMZA
 * @module GoogleUICompatibility
 * @requires WPGMZA
 * @gulp-requires ../core.js
 */ 
jQuery(function($) {
	
	WPGMZA.GoogleUICompatibility = function()
	{
		var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
				   navigator.userAgent &&
				   navigator.userAgent.indexOf('CriOS') == -1 &&
				   navigator.userAgent.indexOf('FxiOS') == -1;
		
		if(!isSafari)
		{
			var style = $("<style id='wpgmza-google-ui-compatiblity-fix'/>");
			style.html(".wpgmza_map img:not(button img) { padding:0 !important; }");
			$(document.head).append(style);
		}
	}
	
	WPGMZA.googleUICompatibility = new WPGMZA.GoogleUICompatibility();
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21wYXRpYmlsaXR5L2dvb2dsZS11aS1jb21wYXRpYmlsaXR5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEdvb2dsZVVJQ29tcGF0aWJpbGl0eVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL2NvcmUuanNcclxuICovIFxyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVVSUNvbXBhdGliaWxpdHkgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0dmFyIGlzU2FmYXJpID0gbmF2aWdhdG9yLnZlbmRvciAmJiBuYXZpZ2F0b3IudmVuZG9yLmluZGV4T2YoJ0FwcGxlJykgPiAtMSAmJlxyXG5cdFx0XHRcdCAgIG5hdmlnYXRvci51c2VyQWdlbnQgJiZcclxuXHRcdFx0XHQgICBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0NyaU9TJykgPT0gLTEgJiZcclxuXHRcdFx0XHQgICBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0Z4aU9TJykgPT0gLTE7XHJcblx0XHRcclxuXHRcdGlmKCFpc1NhZmFyaSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIHN0eWxlID0gJChcIjxzdHlsZSBpZD0nd3BnbXphLWdvb2dsZS11aS1jb21wYXRpYmxpdHktZml4Jy8+XCIpO1xyXG5cdFx0XHRzdHlsZS5odG1sKFwiLndwZ216YV9tYXAgaW1nOm5vdChidXR0b24gaW1nKSB7IHBhZGRpbmc6MCAhaW1wb3J0YW50OyB9XCIpO1xyXG5cdFx0XHQkKGRvY3VtZW50LmhlYWQpLmFwcGVuZChzdHlsZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5nb29nbGVVSUNvbXBhdGliaWxpdHkgPSBuZXcgV1BHTVpBLkdvb2dsZVVJQ29tcGF0aWJpbGl0eSgpO1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6ImNvbXBhdGliaWxpdHkvZ29vZ2xlLXVpLWNvbXBhdGliaWxpdHkuanMifQ==
