/**
 * @namespace WPGMZA
 * @module SettingsPage
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	WPGMZA.SettingsPage = function()
	{
		$("#wpgmza-global-settings").tabs();
	}
	
	WPGMZA.SettingsPage.createInstance = function()
	{
		return new WPGMZA.SettingsPage();
	}
	
	$(window).on("load", function(event) {
		
		var useLegacyHTML = WPGMZA.settings.useLegacyHTML || !window.location.href.match(/no-legacy-html/);
		
		if(WPGMZA.getCurrentPage() == WPGMZA.PAGE_SETTINGS && !useLegacyHTML)
			WPGMZA.settingsPage = WPGMZA.SettingsPage.createInstance();
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy1wYWdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFNldHRpbmdzUGFnZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0V1BHTVpBLlNldHRpbmdzUGFnZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHQkKFwiI3dwZ216YS1nbG9iYWwtc2V0dGluZ3NcIikudGFicygpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuU2V0dGluZ3NQYWdlLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiBuZXcgV1BHTVpBLlNldHRpbmdzUGFnZSgpO1xyXG5cdH1cclxuXHRcclxuXHQkKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcclxuXHRcdHZhciB1c2VMZWdhY3lIVE1MID0gV1BHTVpBLnNldHRpbmdzLnVzZUxlZ2FjeUhUTUwgfHwgIXdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC9uby1sZWdhY3ktaHRtbC8pO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuZ2V0Q3VycmVudFBhZ2UoKSA9PSBXUEdNWkEuUEFHRV9TRVRUSU5HUyAmJiAhdXNlTGVnYWN5SFRNTClcclxuXHRcdFx0V1BHTVpBLnNldHRpbmdzUGFnZSA9IFdQR01aQS5TZXR0aW5nc1BhZ2UuY3JlYXRlSW5zdGFuY2UoKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6InNldHRpbmdzLXBhZ2UuanMifQ==
