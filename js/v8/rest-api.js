/**
 * @namespace WPGMZA
 * @module WPGMZA.RestAPI
 * @requires WPGMZA
 * @gulp-requires core.js
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
		
		this.useAJAXFallback = false;
	}
	
	WPGMZA.RestAPI.CONTEXT_REST		= "REST";
	WPGMZA.RestAPI.CONTEXT_AJAX		= "AJAX";
	
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
	
	Object.defineProperty(WPGMZA.RestAPI.prototype, "isCompressedPathVariableAllowed", {
		
		get: function()
		{
			// NB: Pro 7 still has a "disable" setting. So use that if Pro 7 is installed.
			if(!WPGMZA.pro_version || WPGMZA.Version.compare(WPGMZA.pro_version, "8.0.0") >= WPGMZA.Version.EQUAL_TO)
				return !WPGMZA.settings.disable_compressed_path_variables;
			
			// Running Pro 7 or below
			return WPGMZA.settings.enable_compressed_path_variables;
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
			
			if(markerIDs.length > 1)
			{
				// NB: Only use Elias Fano encoding if more than one marker is present. The server side decoder does not correctly decode a single digit.
				var encoder		= new WPGMZA.EliasFano();
				var encoded		= encoder.encode(markerIDs);
				var compressed	= pako.deflate(encoded);
				var string		= Array.prototype.map.call(compressed, function(ch) {
					return String.fromCharCode(ch);
				}).join("");
				
				// NB: Append as another path component, this stops the code below performing base64 encoding twice and enlarging the request
				suffix = "/" + btoa(string).replace(/\//g, "-").replace(/=+$/, "");
				
				// NB: midcbp = Marker ID compressed buffer pointer, abbreviated to save space
				params.midcbp = encoded.pointer;
				
				delete params.markerIDs;
			}
		}
		
		var string		= JSON.stringify(params);
		var encoder		= new TextEncoder();
		var input		= encoder.encode(string);
		var compressed	= pako.deflate(input);
		var raw			= Array.prototype.map.call(compressed, function(ch) {
			return String.fromCharCode(ch);
		}).join("");
		
		var base64		= btoa(raw);
		return base64.replace(/\//g, "-").replace(/=+$/, "") + suffix;
	}
	
	function sendAJAXFallbackRequest(route, params)
	{
		var params = $.extend({}, params);
		
		if(!params.data)
			params.data = {};
		
		if("route" in params.data)
			throw new Error("Cannot send route through this method");
		
		if("action" in params.data)
			throw new Error("Cannot send action through this method");
		
		params.data.route = route;
		params.data.action = "wpgmza_rest_api_request";
		
		WPGMZA.restAPI.addNonce(route, params, WPGMZA.RestAPI.CONTEXT_AJAX);
		
		return $.ajax(WPGMZA.ajaxurl, params);
	}
	
	WPGMZA.RestAPI.prototype.getNonce = function(route)
	{
		var matches = [];
		
		for(var pattern in WPGMZA.restnoncetable)
		{
			var regex = new RegExp(pattern);
			
			if(route.match(regex))
				matches.push({
					pattern: pattern,
					nonce: WPGMZA.restnoncetable[pattern],
					length: pattern.length
				});
		}
		
		if(!matches.length)
			throw new Error("No nonce found for route");
		
		matches.sort(function(a, b) {
			return b.length - a.length;
		});
		
		return matches[0].nonce;
	}
	
	WPGMZA.RestAPI.prototype.addNonce = function(route, params, context)
	{
		var self = this;
		
		var setRESTNonce = function(xhr) {
			if(context == WPGMZA.RestAPI.CONTEXT_REST)
				xhr.setRequestHeader('X-WP-Nonce', WPGMZA.restnonce);
			
			if(params && params.method && !params.method.match(/^GET$/i))
				xhr.setRequestHeader('X-WPGMZA-Action-Nonce', self.getNonce(route));
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
		if(this.useAJAXFallback)
			return sendAJAXFallbackRequest(route, params);
		
		var self = this;
		var attemptedCompressedPathVariable = false;
		var fallbackRoute = route;
		var fallbackParams = $.extend({}, params);
		
		if(typeof route != "string" || (!route.match(/^\//) && !route.match(/^http/)))
			throw new Error("Invalid route");
		
		if(WPGMZA.RestAPI.URL.match(/\/$/))
			route = route.replace(/^\//, "");
		
		if(!params)
			params = {};
		
		this.addNonce(route, params, WPGMZA.RestAPI.CONTEXT_REST);
		
		if(!params.error)
			params.error = function(xhr, status, message) {
				if(status == "abort")
					return;	// Don't report abort, let it happen silently
				
				switch(xhr.status)
				{
					case 401:
					case 403:
						// Report back to the server. This is usually due to a security plugin blocking REST requests for non-authenticated users
						$.post(WPGMZA.ajaxurl, {
							action: "wpgmza_report_rest_api_blocked"
						}, function(response) {});
						
						console.warn("The REST API was blocked. This is usually due to security plugins blocking REST requests for non-authenticated users.");
						
						this.useAJAXFallback = true;
						
						return sendAJAXFallbackRequest(fallbackRoute, fallbackParams);
						break;
					
					case 414:
						if(!attemptedCompressedPathVariable)
							break;
					
						// Fallback for HTTP 414 - Request too long with compressed requests
						fallbackParams.method = "POST";
						fallbackParams.useCompressedPathVariable = false;
						
						return WPGMZA.restAPI.call(fallbackRoute, fallbackParams);
					
						break;
				}
				
				throw new Error(message);
			}
		
		if(params.useCompressedPathVariable && 
			this.isCompressedPathVariableSupported && 
			this.isCompressedPathVariableAllowed)
		{
			var compressedParams = $.extend({}, params);
			var data = params.data;
			var base64 = this.compressParams(data);
			
			if(WPGMZA.isServerIIS)
				base64 = base64.replace(/\+/g, "%20");
			
			var compressedRoute = route.replace(/\/$/, "") + "/base64" + base64;
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
		
		// NB: Support plain permalinks
		if(WPGMZA.RestAPI.URL.match(/\?/))
			route = route.replace(/\?/, "&");
		
		return $.ajax(WPGMZA.RestAPI.URL + route, params);
	}
	
	var nativeCallFunction = WPGMZA.RestAPI.call;
	WPGMZA.RestAPI.call = function()
	{
		console.warn("WPGMZA.RestAPI.call was called statically, did you mean to call the function on WPGMZA.restAPI?");
		
		nativeCallFunction.apply(this, arguments);
	}

	$(document.body).on("click", "#wpgmza-rest-api-blocked button.notice-dismiss", function(event) {
		
		WPGMZA.restAPI.call("/rest-api/", {
			method: "POST",
			data: {
				dismiss_blocked_notice: true
			}
		});
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXN0LWFwaS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBXUEdNWkEuUmVzdEFQSVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVXNlZCB0byBpbnRlcmFjdCB3aXRoIHRoZSBXb3JkUHJlc3MgUkVTVCBBUEkuIDxzdHJvbmc+UGxlYXNlIDxlbT5kbyBub3Q8L2VtPiBjYWxsIHRoaXMgY29uc3RydWN0b3IgZGlyZWN0bHkuIEFsd2F5cyB1c2UgY3JlYXRlSW5zdGFuY2UgcmF0aGVyIHRoYW4gaW5zdGFudGlhdGluZyB0aGlzIGNsYXNzIGRpcmVjdGx5Ljwvc3Ryb25nPiBVc2luZyBjcmVhdGVJbnN0YW5jZSBhbGxvd3MgdGhpcyBjbGFzcyB0byBiZSBleHRlcm5hbGx5IGV4dGVuc2libGUuXHJcblx0ICogQGNsYXNzIFdQR01aQS5SZXN0QVBJXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5SZXN0QVBJXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqL1xyXG5cdFdQR01aQS5SZXN0QVBJID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdFdQR01aQS5SZXN0QVBJLlVSTCA9IFdQR01aQS5yZXN0dXJsO1xyXG5cdFx0XHJcblx0XHR0aGlzLnVzZUFKQVhGYWxsYmFjayA9IGZhbHNlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuUmVzdEFQSS5DT05URVhUX1JFU1RcdFx0PSBcIlJFU1RcIjtcclxuXHRXUEdNWkEuUmVzdEFQSS5DT05URVhUX0FKQVhcdFx0PSBcIkFKQVhcIjtcclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgUmVzdEFQSSwgPHN0cm9uZz5wbGVhc2UgPGVtPmFsd2F5czwvZW0+IHVzZSB0aGlzIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGNhbGxpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5PC9zdHJvbmc+LlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLlJlc3RBUElcclxuXHQgKi9cclxuXHRXUEdNWkEuUmVzdEFQSS5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uKCkgXHJcblx0e1xyXG5cdFx0cmV0dXJuIG5ldyBXUEdNWkEuUmVzdEFQSSgpO1xyXG5cdH1cclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlJlc3RBUEkucHJvdG90eXBlLCBcImlzQ29tcHJlc3NlZFBhdGhWYXJpYWJsZVN1cHBvcnRlZFwiLCB7XHJcblx0XHRcclxuXHRcdGdldDogZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gV1BHTVpBLnNlcnZlckNhbkluZmxhdGUgJiYgXCJVaW50OEFycmF5XCIgaW4gd2luZG93ICYmIFwiVGV4dEVuY29kZXJcIiBpbiB3aW5kb3c7XHJcblx0XHR9XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlJlc3RBUEkucHJvdG90eXBlLCBcImlzQ29tcHJlc3NlZFBhdGhWYXJpYWJsZUFsbG93ZWRcIiwge1xyXG5cdFx0XHJcblx0XHRnZXQ6IGZ1bmN0aW9uKClcclxuXHRcdHtcclxuXHRcdFx0Ly8gTkI6IFBybyA3IHN0aWxsIGhhcyBhIFwiZGlzYWJsZVwiIHNldHRpbmcuIFNvIHVzZSB0aGF0IGlmIFBybyA3IGlzIGluc3RhbGxlZC5cclxuXHRcdFx0aWYoIVdQR01aQS5wcm9fdmVyc2lvbiB8fCBXUEdNWkEuVmVyc2lvbi5jb21wYXJlKFdQR01aQS5wcm9fdmVyc2lvbiwgXCI4LjAuMFwiKSA+PSBXUEdNWkEuVmVyc2lvbi5FUVVBTF9UTylcclxuXHRcdFx0XHRyZXR1cm4gIVdQR01aQS5zZXR0aW5ncy5kaXNhYmxlX2NvbXByZXNzZWRfcGF0aF92YXJpYWJsZXM7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBSdW5uaW5nIFBybyA3IG9yIGJlbG93XHJcblx0XHRcdHJldHVybiBXUEdNWkEuc2V0dGluZ3MuZW5hYmxlX2NvbXByZXNzZWRfcGF0aF92YXJpYWJsZXM7XHJcblx0XHR9XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlJlc3RBUEkucHJvdG90eXBlLCBcIm1heFVSTExlbmd0aFwiLCB7XHJcblx0XHRcclxuXHRcdGdldDogZnVuY3Rpb24oKVxyXG5cdFx0e1xyXG5cdFx0XHRyZXR1cm4gMjA4MztcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdFdQR01aQS5SZXN0QVBJLnByb3RvdHlwZS5jb21wcmVzc1BhcmFtcyA9IGZ1bmN0aW9uKHBhcmFtcylcclxuXHR7XHJcblx0XHR2YXIgc3VmZml4ID0gXCJcIjtcclxuXHRcdFxyXG5cdFx0aWYocGFyYW1zLm1hcmtlcklEcylcclxuXHRcdHtcclxuXHRcdFx0dmFyIG1hcmtlcklEc1x0PSBwYXJhbXMubWFya2VySURzLnNwbGl0KFwiLFwiKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKG1hcmtlcklEcy5sZW5ndGggPiAxKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gTkI6IE9ubHkgdXNlIEVsaWFzIEZhbm8gZW5jb2RpbmcgaWYgbW9yZSB0aGFuIG9uZSBtYXJrZXIgaXMgcHJlc2VudC4gVGhlIHNlcnZlciBzaWRlIGRlY29kZXIgZG9lcyBub3QgY29ycmVjdGx5IGRlY29kZSBhIHNpbmdsZSBkaWdpdC5cclxuXHRcdFx0XHR2YXIgZW5jb2Rlclx0XHQ9IG5ldyBXUEdNWkEuRWxpYXNGYW5vKCk7XHJcblx0XHRcdFx0dmFyIGVuY29kZWRcdFx0PSBlbmNvZGVyLmVuY29kZShtYXJrZXJJRHMpO1xyXG5cdFx0XHRcdHZhciBjb21wcmVzc2VkXHQ9IHBha28uZGVmbGF0ZShlbmNvZGVkKTtcclxuXHRcdFx0XHR2YXIgc3RyaW5nXHRcdD0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGNvbXByZXNzZWQsIGZ1bmN0aW9uKGNoKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjaCk7XHJcblx0XHRcdFx0fSkuam9pbihcIlwiKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBOQjogQXBwZW5kIGFzIGFub3RoZXIgcGF0aCBjb21wb25lbnQsIHRoaXMgc3RvcHMgdGhlIGNvZGUgYmVsb3cgcGVyZm9ybWluZyBiYXNlNjQgZW5jb2RpbmcgdHdpY2UgYW5kIGVubGFyZ2luZyB0aGUgcmVxdWVzdFxyXG5cdFx0XHRcdHN1ZmZpeCA9IFwiL1wiICsgYnRvYShzdHJpbmcpLnJlcGxhY2UoL1xcLy9nLCBcIi1cIikucmVwbGFjZSgvPSskLywgXCJcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gTkI6IG1pZGNicCA9IE1hcmtlciBJRCBjb21wcmVzc2VkIGJ1ZmZlciBwb2ludGVyLCBhYmJyZXZpYXRlZCB0byBzYXZlIHNwYWNlXHJcblx0XHRcdFx0cGFyYW1zLm1pZGNicCA9IGVuY29kZWQucG9pbnRlcjtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRkZWxldGUgcGFyYW1zLm1hcmtlcklEcztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgc3RyaW5nXHRcdD0gSlNPTi5zdHJpbmdpZnkocGFyYW1zKTtcclxuXHRcdHZhciBlbmNvZGVyXHRcdD0gbmV3IFRleHRFbmNvZGVyKCk7XHJcblx0XHR2YXIgaW5wdXRcdFx0PSBlbmNvZGVyLmVuY29kZShzdHJpbmcpO1xyXG5cdFx0dmFyIGNvbXByZXNzZWRcdD0gcGFrby5kZWZsYXRlKGlucHV0KTtcclxuXHRcdHZhciByYXdcdFx0XHQ9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChjb21wcmVzc2VkLCBmdW5jdGlvbihjaCkge1xyXG5cdFx0XHRyZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjaCk7XHJcblx0XHR9KS5qb2luKFwiXCIpO1xyXG5cdFx0XHJcblx0XHR2YXIgYmFzZTY0XHRcdD0gYnRvYShyYXcpO1xyXG5cdFx0cmV0dXJuIGJhc2U2NC5yZXBsYWNlKC9cXC8vZywgXCItXCIpLnJlcGxhY2UoLz0rJC8sIFwiXCIpICsgc3VmZml4O1xyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBzZW5kQUpBWEZhbGxiYWNrUmVxdWVzdChyb3V0ZSwgcGFyYW1zKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSAkLmV4dGVuZCh7fSwgcGFyYW1zKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBhcmFtcy5kYXRhKVxyXG5cdFx0XHRwYXJhbXMuZGF0YSA9IHt9O1xyXG5cdFx0XHJcblx0XHRpZihcInJvdXRlXCIgaW4gcGFyYW1zLmRhdGEpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzZW5kIHJvdXRlIHRocm91Z2ggdGhpcyBtZXRob2RcIik7XHJcblx0XHRcclxuXHRcdGlmKFwiYWN0aW9uXCIgaW4gcGFyYW1zLmRhdGEpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzZW5kIGFjdGlvbiB0aHJvdWdoIHRoaXMgbWV0aG9kXCIpO1xyXG5cdFx0XHJcblx0XHRwYXJhbXMuZGF0YS5yb3V0ZSA9IHJvdXRlO1xyXG5cdFx0cGFyYW1zLmRhdGEuYWN0aW9uID0gXCJ3cGdtemFfcmVzdF9hcGlfcmVxdWVzdFwiO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEucmVzdEFQSS5hZGROb25jZShyb3V0ZSwgcGFyYW1zLCBXUEdNWkEuUmVzdEFQSS5DT05URVhUX0FKQVgpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gJC5hamF4KFdQR01aQS5hamF4dXJsLCBwYXJhbXMpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuUmVzdEFQSS5wcm90b3R5cGUuZ2V0Tm9uY2UgPSBmdW5jdGlvbihyb3V0ZSlcclxuXHR7XHJcblx0XHR2YXIgbWF0Y2hlcyA9IFtdO1xyXG5cdFx0XHJcblx0XHRmb3IodmFyIHBhdHRlcm4gaW4gV1BHTVpBLnJlc3Rub25jZXRhYmxlKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgcmVnZXggPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYocm91dGUubWF0Y2gocmVnZXgpKVxyXG5cdFx0XHRcdG1hdGNoZXMucHVzaCh7XHJcblx0XHRcdFx0XHRwYXR0ZXJuOiBwYXR0ZXJuLFxyXG5cdFx0XHRcdFx0bm9uY2U6IFdQR01aQS5yZXN0bm9uY2V0YWJsZVtwYXR0ZXJuXSxcclxuXHRcdFx0XHRcdGxlbmd0aDogcGF0dGVybi5sZW5ndGhcclxuXHRcdFx0XHR9KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIW1hdGNoZXMubGVuZ3RoKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBub25jZSBmb3VuZCBmb3Igcm91dGVcIik7XHJcblx0XHRcclxuXHRcdG1hdGNoZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcblx0XHRcdHJldHVybiBiLmxlbmd0aCAtIGEubGVuZ3RoO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdHJldHVybiBtYXRjaGVzWzBdLm5vbmNlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuUmVzdEFQSS5wcm90b3R5cGUuYWRkTm9uY2UgPSBmdW5jdGlvbihyb3V0ZSwgcGFyYW1zLCBjb250ZXh0KVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0dmFyIHNldFJFU1ROb25jZSA9IGZ1bmN0aW9uKHhocikge1xyXG5cdFx0XHRpZihjb250ZXh0ID09IFdQR01aQS5SZXN0QVBJLkNPTlRFWFRfUkVTVClcclxuXHRcdFx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1XUC1Ob25jZScsIFdQR01aQS5yZXN0bm9uY2UpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYocGFyYW1zICYmIHBhcmFtcy5tZXRob2QgJiYgIXBhcmFtcy5tZXRob2QubWF0Y2goL15HRVQkL2kpKVxyXG5cdFx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVdQR01aQS1BY3Rpb24tTm9uY2UnLCBzZWxmLmdldE5vbmNlKHJvdXRlKSk7XHJcblx0XHR9O1xyXG5cdFx0XHJcblx0XHRpZighcGFyYW1zLmJlZm9yZVNlbmQpXHJcblx0XHRcdHBhcmFtcy5iZWZvcmVTZW5kID0gc2V0UkVTVE5vbmNlO1xyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYmFzZSA9IHBhcmFtcy5iZWZvcmVTZW5kO1xyXG5cdFx0XHRcclxuXHRcdFx0cGFyYW1zLmJlZm9yZVNlbmQgPSBmdW5jdGlvbih4aHIpIHtcclxuXHRcdFx0XHRiYXNlKHhocik7XHJcblx0XHRcdFx0c2V0UkVTVE5vbmNlKHhocik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogTWFrZXMgYW4gQUpBWCB0byB0aGUgUkVTVCBBUEksIHRoaXMgZnVuY3Rpb24gaXMgYSB3cmFwcGVyIGZvciAkLmFqYXhcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5SZXN0QVBJXHJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHJvdXRlIFRoZSBSRVNUIEFQSSByb3V0ZVxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgVGhlIHJlcXVlc3QgcGFyYW1ldGVycywgc2VlIGh0dHA6Ly9hcGkuanF1ZXJ5LmNvbS9qcXVlcnkuYWpheC9cclxuXHQgKi9cclxuXHRXUEdNWkEuUmVzdEFQSS5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uKHJvdXRlLCBwYXJhbXMpXHJcblx0e1xyXG5cdFx0aWYodGhpcy51c2VBSkFYRmFsbGJhY2spXHJcblx0XHRcdHJldHVybiBzZW5kQUpBWEZhbGxiYWNrUmVxdWVzdChyb3V0ZSwgcGFyYW1zKTtcclxuXHRcdFxyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0dmFyIGF0dGVtcHRlZENvbXByZXNzZWRQYXRoVmFyaWFibGUgPSBmYWxzZTtcclxuXHRcdHZhciBmYWxsYmFja1JvdXRlID0gcm91dGU7XHJcblx0XHR2YXIgZmFsbGJhY2tQYXJhbXMgPSAkLmV4dGVuZCh7fSwgcGFyYW1zKTtcclxuXHRcdFxyXG5cdFx0aWYodHlwZW9mIHJvdXRlICE9IFwic3RyaW5nXCIgfHwgKCFyb3V0ZS5tYXRjaCgvXlxcLy8pICYmICFyb3V0ZS5tYXRjaCgvXmh0dHAvKSkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcm91dGVcIik7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5SZXN0QVBJLlVSTC5tYXRjaCgvXFwvJC8pKVxyXG5cdFx0XHRyb3V0ZSA9IHJvdXRlLnJlcGxhY2UoL15cXC8vLCBcIlwiKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBhcmFtcylcclxuXHRcdFx0cGFyYW1zID0ge307XHJcblx0XHRcclxuXHRcdHRoaXMuYWRkTm9uY2Uocm91dGUsIHBhcmFtcywgV1BHTVpBLlJlc3RBUEkuQ09OVEVYVF9SRVNUKTtcclxuXHRcdFxyXG5cdFx0aWYoIXBhcmFtcy5lcnJvcilcclxuXHRcdFx0cGFyYW1zLmVycm9yID0gZnVuY3Rpb24oeGhyLCBzdGF0dXMsIG1lc3NhZ2UpIHtcclxuXHRcdFx0XHRpZihzdGF0dXMgPT0gXCJhYm9ydFwiKVxyXG5cdFx0XHRcdFx0cmV0dXJuO1x0Ly8gRG9uJ3QgcmVwb3J0IGFib3J0LCBsZXQgaXQgaGFwcGVuIHNpbGVudGx5XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c3dpdGNoKHhoci5zdGF0dXMpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y2FzZSA0MDE6XHJcblx0XHRcdFx0XHRjYXNlIDQwMzpcclxuXHRcdFx0XHRcdFx0Ly8gUmVwb3J0IGJhY2sgdG8gdGhlIHNlcnZlci4gVGhpcyBpcyB1c3VhbGx5IGR1ZSB0byBhIHNlY3VyaXR5IHBsdWdpbiBibG9ja2luZyBSRVNUIHJlcXVlc3RzIGZvciBub24tYXV0aGVudGljYXRlZCB1c2Vyc1xyXG5cdFx0XHRcdFx0XHQkLnBvc3QoV1BHTVpBLmFqYXh1cmwsIHtcclxuXHRcdFx0XHRcdFx0XHRhY3Rpb246IFwid3BnbXphX3JlcG9ydF9yZXN0X2FwaV9ibG9ja2VkXCJcclxuXHRcdFx0XHRcdFx0fSwgZnVuY3Rpb24ocmVzcG9uc2UpIHt9KTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihcIlRoZSBSRVNUIEFQSSB3YXMgYmxvY2tlZC4gVGhpcyBpcyB1c3VhbGx5IGR1ZSB0byBzZWN1cml0eSBwbHVnaW5zIGJsb2NraW5nIFJFU1QgcmVxdWVzdHMgZm9yIG5vbi1hdXRoZW50aWNhdGVkIHVzZXJzLlwiKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMudXNlQUpBWEZhbGxiYWNrID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHJldHVybiBzZW5kQUpBWEZhbGxiYWNrUmVxdWVzdChmYWxsYmFja1JvdXRlLCBmYWxsYmFja1BhcmFtcyk7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRjYXNlIDQxNDpcclxuXHRcdFx0XHRcdFx0aWYoIWF0dGVtcHRlZENvbXByZXNzZWRQYXRoVmFyaWFibGUpXHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Ly8gRmFsbGJhY2sgZm9yIEhUVFAgNDE0IC0gUmVxdWVzdCB0b28gbG9uZyB3aXRoIGNvbXByZXNzZWQgcmVxdWVzdHNcclxuXHRcdFx0XHRcdFx0ZmFsbGJhY2tQYXJhbXMubWV0aG9kID0gXCJQT1NUXCI7XHJcblx0XHRcdFx0XHRcdGZhbGxiYWNrUGFyYW1zLnVzZUNvbXByZXNzZWRQYXRoVmFyaWFibGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHJldHVybiBXUEdNWkEucmVzdEFQSS5jYWxsKGZhbGxiYWNrUm91dGUsIGZhbGxiYWNrUGFyYW1zKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG5cdFx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHBhcmFtcy51c2VDb21wcmVzc2VkUGF0aFZhcmlhYmxlICYmIFxyXG5cdFx0XHR0aGlzLmlzQ29tcHJlc3NlZFBhdGhWYXJpYWJsZVN1cHBvcnRlZCAmJiBcclxuXHRcdFx0dGhpcy5pc0NvbXByZXNzZWRQYXRoVmFyaWFibGVBbGxvd2VkKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgY29tcHJlc3NlZFBhcmFtcyA9ICQuZXh0ZW5kKHt9LCBwYXJhbXMpO1xyXG5cdFx0XHR2YXIgZGF0YSA9IHBhcmFtcy5kYXRhO1xyXG5cdFx0XHR2YXIgYmFzZTY0ID0gdGhpcy5jb21wcmVzc1BhcmFtcyhkYXRhKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKFdQR01aQS5pc1NlcnZlcklJUylcclxuXHRcdFx0XHRiYXNlNjQgPSBiYXNlNjQucmVwbGFjZSgvXFwrL2csIFwiJTIwXCIpO1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNvbXByZXNzZWRSb3V0ZSA9IHJvdXRlLnJlcGxhY2UoL1xcLyQvLCBcIlwiKSArIFwiL2Jhc2U2NFwiICsgYmFzZTY0O1xyXG5cdFx0XHR2YXIgZnVsbENvbXByZXNzZWRSb3V0ZSA9IFdQR01aQS5SZXN0QVBJLlVSTCArIGNvbXByZXNzZWRSb3V0ZTtcclxuXHRcdFx0XHJcblx0XHRcdGNvbXByZXNzZWRQYXJhbXMubWV0aG9kID0gXCJHRVRcIjtcclxuXHRcdFx0ZGVsZXRlIGNvbXByZXNzZWRQYXJhbXMuZGF0YTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHBhcmFtcy5jYWNoZSA9PT0gZmFsc2UpXHJcblx0XHRcdFx0Y29tcHJlc3NlZFBhcmFtcy5kYXRhID0ge1xyXG5cdFx0XHRcdFx0c2tpcF9jYWNoZTogMVxyXG5cdFx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjb21wcmVzc2VkUm91dGUubGVuZ3RoIDwgdGhpcy5tYXhVUkxMZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRhdHRlbXB0ZWRDb21wcmVzc2VkUGF0aFZhcmlhYmxlID0gdHJ1ZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRyb3V0ZSA9IGNvbXByZXNzZWRSb3V0ZTtcclxuXHRcdFx0XHRwYXJhbXMgPSBjb21wcmVzc2VkUGFyYW1zO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIEZhbGxiYWNrIGZvciB3aGVuIFVSTCBleGNlZWRzIHByZWRlZmluZWQgbGVuZ3RoIGxpbWl0XHJcblx0XHRcdFx0aWYoIVdQR01aQS5SZXN0QVBJLmNvbXByZXNzZWRQYXRoVmFyaWFibGVVUkxMaW1pdFdhcm5pbmdEaXNwbGF5ZWQpXHJcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oXCJDb21wcmVzc2VkIHBhdGggdmFyaWFibGUgcm91dGUgd291bGQgZXhjZWVkIFVSTCBsZW5ndGggbGltaXRcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0V1BHTVpBLlJlc3RBUEkuY29tcHJlc3NlZFBhdGhWYXJpYWJsZVVSTExpbWl0V2FybmluZ0Rpc3BsYXllZCA9IHRydWU7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gTkI6IFN1cHBvcnQgcGxhaW4gcGVybWFsaW5rc1xyXG5cdFx0aWYoV1BHTVpBLlJlc3RBUEkuVVJMLm1hdGNoKC9cXD8vKSlcclxuXHRcdFx0cm91dGUgPSByb3V0ZS5yZXBsYWNlKC9cXD8vLCBcIiZcIik7XHJcblx0XHRcclxuXHRcdHJldHVybiAkLmFqYXgoV1BHTVpBLlJlc3RBUEkuVVJMICsgcm91dGUsIHBhcmFtcyk7XHJcblx0fVxyXG5cdFxyXG5cdHZhciBuYXRpdmVDYWxsRnVuY3Rpb24gPSBXUEdNWkEuUmVzdEFQSS5jYWxsO1xyXG5cdFdQR01aQS5SZXN0QVBJLmNhbGwgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0Y29uc29sZS53YXJuKFwiV1BHTVpBLlJlc3RBUEkuY2FsbCB3YXMgY2FsbGVkIHN0YXRpY2FsbHksIGRpZCB5b3UgbWVhbiB0byBjYWxsIHRoZSBmdW5jdGlvbiBvbiBXUEdNWkEucmVzdEFQST9cIik7XHJcblx0XHRcclxuXHRcdG5hdGl2ZUNhbGxGdW5jdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdH1cclxuXHJcblx0JChkb2N1bWVudC5ib2R5KS5vbihcImNsaWNrXCIsIFwiI3dwZ216YS1yZXN0LWFwaS1ibG9ja2VkIGJ1dHRvbi5ub3RpY2UtZGlzbWlzc1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHJcblx0XHRXUEdNWkEucmVzdEFQSS5jYWxsKFwiL3Jlc3QtYXBpL1wiLCB7XHJcblx0XHRcdG1ldGhvZDogXCJQT1NUXCIsXHJcblx0XHRcdGRhdGE6IHtcclxuXHRcdFx0XHRkaXNtaXNzX2Jsb2NrZWRfbm90aWNlOiB0cnVlXHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0fSk7XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoicmVzdC1hcGkuanMifQ==
