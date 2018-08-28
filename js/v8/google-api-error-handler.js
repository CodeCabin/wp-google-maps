/**
 * @namespace WPGMZA
 * @module GoogleAPIErrorHandler
 * @requires WPGMZA
 */
(function($){  

	WPGMZA.GoogleAPIErrorHandler = function() {
		
		if(WPGMZA.settings.engine != "google-maps")
			return;
		
		var _error = console.error;
		
		console.error = function(message)
		{
			var m = message.match(/^Google Maps.+error: (.+)\s+(http(s?):\/\/.+)/m);
			
			if(m)
			{
				var friendlyMessage = "Google Maps API Error:" + m[1].replace(/([A-Z])/g, " $1") + " - See " + m[2] + " for more information";
				alert(friendlyMessage);
			}
			
			_error.apply(this, arguments);
		}
	}
	
	WPGMZA.googleAPIErrorHandler = new WPGMZA.GoogleAPIErrorHandler();

})(jQuery);