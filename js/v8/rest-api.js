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
	
	Object.defineProperty(WPGMZA.RestAPI.prototype, "isCompressedPathVariableSupported", {
		
		get: function()
		{
			return WPGMZA.serverCanInflate && "Uint8Array" in window && "TextEncoder" in window;
		}
		
	});
	
	Object.defineProperty(WPGMZA.RestAPI.prototype, "maxURLLength", {
		
		get: function()
		{
			return 2083;
		}
		
	});
	
	WPGMZA.RestAPI.prototype.compressParams = function(params)
	{
		var suffix = "";
		
		if(params.markerIDs)
		{
			var markerIDs	= params.markerIDs.split(",");
			var encoder		= new WPGMZA.EliasFano();
			var encoded		= encoder.encode(markerIDs);
			var compressed	= pako.deflate(encoded);
			var string		= Array.prototype.map.call(compressed, function(ch) {
				return String.fromCharCode(ch);
			}).join("");
			
			// NB: Append as another path component, this stops the code below performing base64 encoding twice and enlarging the request
			suffix = "/" + btoa(string).replace(/\//g, "-");
			
			// NB: midcbp = Marker ID compressed buffer pointer, abbreviated to save space
			params.midcbp = encoded.pointer;
			
			delete params.markerIDs;
		}
		
		var string		= JSON.stringify(params);
		var encoder		= new TextEncoder();
		var input		= encoder.encode(string);
		var compressed	= pako.deflate(input);
		var raw			= Array.prototype.map.call(compressed, function(ch) {
			return String.fromCharCode(ch);
		}).join("");
		
		var base64		= btoa(raw);
		
		return base64.replace(/\//g, "-") + suffix;
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
		var attemptedCompressedPathVariable = false;
		var fallbackRoute = route;
		var fallbackParams = $.extend({}, params);
		
		if(typeof route != "string" || !route.match(/^\//))
			throw new Error("Invalid route");
		
		if(WPGMZA.RestAPI.URL.match(/\/$/))
			route = route.replace(/^\//, "");
		
		if(!params)
			params = {};
		
		var setRESTNonce = function(xhr) {
			xhr.setRequestHeader('X-WP-Nonce', WPGMZA.restnonce);
		};
		
		if(!params.beforeSend)
			params.beforeSend = setRESTNonce;
		else
		{
			var base = params.beforeSend;
			
			params.beforeSend = function(xhr) {
				base(xhr);
				setRESTNonce(xhr);
			}
		}
		
		if(!params.error)
			params.error = function(xhr, status, message) {
				if(status == "abort")
					return;	// Don't report abort, let it happen silently
				
				if(xhr.status == 414 && attemptedCompressedPathVariable)
				{
					// Fallback for HTTP 414 - Request too long with compressed requests
					fallbackParams.method = "POST";
					fallbackParams.useCompressedPathVariable = false;
					
					return WPGMZA.restAPI.call(fallbackRoute, fallbackParams);
				}
				
				throw new Error(message);
			}
		
		if(params.useCompressedPathVariable && this.isCompressedPathVariableSupported && WPGMZA.settings.enable_compressed_path_variables)
		{
			var compressedParams = $.extend({}, params);
			var data = params.data;
			var compressedRoute = route.replace(/\/$/, "") + "/base64" + this.compressParams(data);
			var fullCompressedRoute = WPGMZA.RestAPI.URL + compressedRoute;
			
			compressedParams.method = "GET";
			delete compressedParams.data;
			
			if(params.cache === false)
				compressedParams.data = {
					skip_cache: 1
				};
			
			if(compressedRoute.length < this.maxURLLength)
			{
				attemptedCompressedPathVariable = true;
				
				route = compressedRoute;
				params = compressedParams;
			}
			else
			{
				// Fallback for when URL exceeds predefined length limit
				if(!WPGMZA.RestAPI.compressedPathVariableURLLimitWarningDisplayed)
					console.warn("Compressed path variable route would exceed URL length limit");
				
				WPGMZA.RestAPI.compressedPathVariableURLLimitWarningDisplayed = true;
			}
		}
		
		return $.ajax(WPGMZA.RestAPI.URL + route, params);
	}
	
	var nativeCallFunction = WPGMZA.RestAPI.call;
	WPGMZA.RestAPI.call = function()
	{
		console.warn("WPGMZA.RestAPI.call was called statically, did you mean to call the function on WPGMZA.restAPI?");
		
		nativeCallFunction.apply(this, arguments);
	}
	
});