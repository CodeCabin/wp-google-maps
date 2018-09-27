/**
 * @module WPGMZA.RestAPI
 * @namespace WPGMZA
 * @requires WPGMZA
 * @summary Wrapped for the rest API
 */
jQuery(function($) {
	
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
		
		if(WPGMZA.RestAPI.URL.match(/\/$/))
			route = route.replace(/^\//, "");
		
		$.ajax(WPGMZA.RestAPI.URL + route, params);
	}
	
});