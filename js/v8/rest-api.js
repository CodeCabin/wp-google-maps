/**
 * @module WPGMZA.RestAPI
 * @namespace WPGMZA
 * @requires WPGMZA
 * @summary Wrapped for the rest API
 */
(function($) {
	
	WPGMZA.RestAPI = function()
	{
		WPGMZA.RestAPI.URL = WPGMZA.resturl;
	}
	
	WPGMZA.RestAPI.createInstance = function() 
	{
		return new WPGMZA.RestAPI();
	}
	
	WPGMZA.RestAPI.prototype.call = function(route, params)
	{
		if(typeof route != "string" || !route.match(/^\//))
			throw new Error("Invalid route");
		
		$.ajax(WPGMZA.RestAPI.URL + route, params);
	}
	
})(jQuery);