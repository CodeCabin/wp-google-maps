/**
 * @namespace WPGMZA
 * @module WPGMZA.RestAPI
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Used to interact with the WordPress REST API. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.RestAPI
	 * @constructor WPGMZA.RestAPI
	 * @memberof WPGMZA
	 */
	WPGMZA.RestAPI = function()
	{
		WPGMZA.RestAPI.URL = WPGMZA.resturl;
	}
	
	/**
	 * Creates an instance of a RestAPI, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.RestAPI
	 */
	WPGMZA.RestAPI.createInstance = function() 
	{
		return new WPGMZA.RestAPI();
	}
	
	/**
	 * Makes an AJAX to the REST API, this function is a wrapper for $.ajax
	 * @method
	 * @memberof WPGMZA.RestAPI
	 * @param {string} route The REST API route
	 * @param {object} params The request parameters, see http://api.jquery.com/jquery.ajax/
	 */
	WPGMZA.RestAPI.prototype.call = function(route, params)
	{
		if(typeof route != "string" || !route.match(/^\//))
			throw new Error("Invalid route");
		
		if(WPGMZA.RestAPI.URL.match(/\/$/))
			route = route.replace(/^\//, "");
		
		$.ajax(WPGMZA.RestAPI.URL + route, params);
	}
	
});