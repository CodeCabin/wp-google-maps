/**
 * @namespace WPGMZA
 * @module LatLng
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {

	/**
	 * This class represents a latitude and longitude coordinate pair, and provides utilities to work with coordinates, parsing and conversion.
	 * @class WPGMZA.LatLng
	 * @constructor WPGMZA.LatLng
	 * @memberof WPGMZA
	 * @param {number|object} arg A latLng literal, or latitude
	 * @param {number} [lng] The latitude, where arg is a longitude
	 */
	WPGMZA.LatLng = function(arg, lng)
	{
		this._lat = 0;
		this._lng = 0;
		
		if(arguments.length == 0)
			return;
		
		if(arguments.length == 1)
		{
			// TODO: Support latlng string
			
			if(typeof arg == "string")
			{
				var m;
				
				if(!(m = arg.match(WPGMZA.LatLng.REGEXP)))
					throw new Error("Invalid LatLng string");
				
				arg = {
					lat: m[1],
					lng: m[3]
				};
			}
			
			if(typeof arg != "object" || !("lat" in arg && "lng" in arg))
				throw new Error("Argument must be a LatLng literal");
			
			this.lat = arg.lat;
			this.lng = arg.lng;
		}
		else
		{
			this.lat = arg;
			this.lng = lng;
		}
	}
	
	/**
	 * A regular expression which matches latitude and longitude coordinate pairs from a string. Matches 1 and 3 correspond to latitude and longitude, respectively,
	 * @constant {RegExp}
	 * @memberof WPGMZA.LatLng
	 */
	WPGMZA.LatLng.REGEXP = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/;
	
	/**
	 * Returns true if the supplied object is a LatLng literal, also returns true for instances of WPGMZA.LatLng
	 * @method
	 * @static
	 * @memberof WPGMZA.LatLng
	 * @param {object} obj A LatLng literal, or an instance of WPGMZA.LatLng
	 * @return {bool} True if this object is a valid LatLng literal or instance of WPGMZA.LatLng
	 */
	WPGMZA.LatLng.isValid = function(obj)
	{
		if(typeof obj != "object")
			return false;
		
		if(!("lat" in obj && "lng" in obj))
			return false;
		
		return true;
	}
	
	WPGMZA.LatLng.isLatLngString = function(str)
	{
		if(typeof str != "string")
			return false;
		
		return str.match(WPGMZA.LatLng.REGEXP) ? true : false;
	}
	
	/**
	 * The latitude, guaranteed to be a number
	 * @property lat
	 * @memberof WPGMZA.LatLng
	 */
	Object.defineProperty(WPGMZA.LatLng.prototype, "lat", {
		get: function() {
			return this._lat;
		},
		set: function(val) {
			if(!$.isNumeric(val))
				throw new Error("Latitude must be numeric");
			this._lat = parseFloat( val );
		}
	});
	
	/**
	 * The longitude, guaranteed to be a number
	 * @property lng
	 * @memberof WPGMZA.LatLng
	 */
	Object.defineProperty(WPGMZA.LatLng.prototype, "lng", {
		get: function() {
			return this._lng;
		},
		set: function(val) {
			if(!$.isNumeric(val))
				throw new Error("Longitude must be numeric");
			this._lng = parseFloat( val );
		}
	});
	
	WPGMZA.LatLng.fromString = function(string)
	{
		if(!WPGMZA.LatLng.isLatLngString(string))
			throw new Error("Not a valid latlng string");
		
		var m = string.match(WPGMZA.LatLng.REGEXP);
		
		return new WPGMZA.LatLng({
			lat: parseFloat(m[1]),
			lng: parseFloat(m[3])
		});
	}
	
	/**
	 * Returns this latitude and longitude as a string
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @return {string} This object represented as a string
	 */
	WPGMZA.LatLng.prototype.toString = function()
	{
		return this._lat + ", " + this._lng;
	}
	
	/**
	 * Queries the users current location and passes it to a callback, you can pass
	 * geocodeAddress through options if you would like to also receive the address
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @param {function} A callback to receive the WPGMZA.LatLng
	 * @param {object} An object of options, only geocodeAddress is currently supported
	 * @return void
	 */
	WPGMZA.LatLng.fromCurrentPosition = function(callback, options)
	{
		if(!options)
			options = {};
		
		if(!callback)
			return;
		
		WPGMZA.getCurrentPosition(function(position) {
			
			var latLng = new WPGMZA.LatLng({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});
			
			if(options.geocodeAddress)
			{
				var geocoder = WPGMZA.Geocoder.createInstance();
				
				geocoder.getAddressFromLatLng({
					latLng: latLng
				}, function(results) {
					
					if(results.length)
						latLng.address = results[0];
					
					callback(latLng);
					
				});
				
				
			}	
			else
				callback(latLng);
			
		});
	}
	
	/**
	 * Returns an instnace of WPGMZA.LatLng from an instance of google.maps.LatLng
	 * @method
	 * @static
	 * @memberof WPGMZA.LatLng
	 * @param {google.maps.LatLng} The google.maps.LatLng to convert
	 * @return {WPGMZA.LatLng} An instance of WPGMZA.LatLng built from the supplied google.maps.LatLng
	 */
	WPGMZA.LatLng.fromGoogleLatLng = function(googleLatLng)
	{
		return new WPGMZA.LatLng(
			googleLatLng.lat(),
			googleLatLng.lng()
		);
	}
	
	WPGMZA.LatLng.toGoogleLatLngArray = function(arr)
	{
		var result = [];
		
		arr.forEach(function(nativeLatLng) {
			
			if(! (nativeLatLng instanceof WPGMZA.LatLng || ("lat" in nativeLatLng && "lng" in nativeLatLng)) )
				throw new Error("Unexpected input");
			
			result.push(new google.maps.LatLng({
				lat: parseFloat(nativeLatLng.lat),
				lng: parseFloat(nativeLatLng.lng)
			}));
			
		});
		
		return result;
	}
	
	/**
	 * Returns an instance of google.maps.LatLng with the same coordinates as this object
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @return {google.maps.LatLng} This object, expressed as a google.maps.LatLng
	 */
	WPGMZA.LatLng.prototype.toGoogleLatLng = function()
	{
		return new google.maps.LatLng({
			lat: this.lat,
			lng: this.lng
		});
	}
	
	WPGMZA.LatLng.prototype.toLatLngLiteral = function()
	{
		return {
			lat: this.lat,
			lng: this.lng
		};
	}
	
	/**
	 * Moves this latLng by the specified kilometers along the given heading. This function operates in place, as opposed to creating a new instance of WPGMZA.LatLng. With many thanks to Hu Kenneth - https://gis.stackexchange.com/questions/234473/get-a-lonlat-point-by-distance-or-between-2-lonlat-points
	 * @method
	 * @memberof WPGMZA.LatLng
	 * @param {number} kilometers The number of kilometers to move this LatLng by
	 * @param {number} heading The heading, in degrees, to move along, where zero is North
	 * @return {void}
	 */
	WPGMZA.LatLng.prototype.moveByDistance = function(kilometers, heading)
	{
		var radius 		= 6371;
		
		var delta 		= parseFloat(kilometers) / radius;
		var theta 		= parseFloat(heading) / 180 * Math.PI;
		
		var phi1 		= this.lat / 180 * Math.PI;
		var lambda1 	= this.lng / 180 * Math.PI;
		
		var sinPhi1 	= Math.sin(phi1), cosPhi1 = Math.cos(phi1);
		var sinDelta	= Math.sin(delta), cosDelta = Math.cos(delta);
		var sinTheta	= Math.sin(theta), cosTheta = Math.cos(theta);
		
		var sinPhi2		= sinPhi1 * cosDelta + cosPhi1 * sinDelta * cosTheta;
		var phi2		= Math.asin(sinPhi2);
		var y			= sinTheta * sinDelta * cosPhi1;
		var x			= cosDelta - sinPhi1 * sinPhi2;
		var lambda2		= lambda1 + Math.atan2(y, x);
		
		this.lat		= phi2 * 180 / Math.PI;
		this.lng		= lambda2 * 180 / Math.PI;
	}
	
	/**
	 * @function getGreatCircleDistance
	 * @summary Uses the haversine formula to get the great circle distance between this and another LatLng / lat & lng pair
	 * @param arg1 [WPGMZA.LatLng|Object|Number] Either a WPGMZA.LatLng, an object representing a lat/lng literal, or a latitude
	 * @param arg2 (optional) If arg1 is a Number representing latitude, pass arg2 to represent the longitude
	 * @return number The distance "as the crow files" between this point and the other
	 */
	WPGMZA.LatLng.prototype.getGreatCircleDistance = function(arg1, arg2)
	{
		var lat1 = this.lat;
		var lon1 = this.lng;
		var other;
		
		if(arguments.length == 1)
			other = new WPGMZA.LatLng(arg1);
		else if(arguments.length == 2)
			other = new WPGMZA.LatLng(arg1, arg2);
		else
			throw new Error("Invalid number of arguments");
		
		var lat2 = other.lat;
		var lon2 = other.lng;
		
		var R = 6371; // Kilometers
		var phi1 = lat1.toRadians();
		var phi2 = lat2.toRadians();
		var deltaPhi = (lat2-lat1).toRadians();
		var deltaLambda = (lon2-lon1).toRadians();

		var a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
				Math.cos(phi1) * Math.cos(phi2) *
				Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		var d = R * c;
		
		return d;
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsYXRsbmcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTGF0TG5nXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHJcblx0LyoqXHJcblx0ICogVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBjb29yZGluYXRlIHBhaXIsIGFuZCBwcm92aWRlcyB1dGlsaXRpZXMgdG8gd29yayB3aXRoIGNvb3JkaW5hdGVzLCBwYXJzaW5nIGFuZCBjb252ZXJzaW9uLlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuTGF0TG5nXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5MYXRMbmdcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQHBhcmFtIHtudW1iZXJ8b2JqZWN0fSBhcmcgQSBsYXRMbmcgbGl0ZXJhbCwgb3IgbGF0aXR1ZGVcclxuXHQgKiBAcGFyYW0ge251bWJlcn0gW2xuZ10gVGhlIGxhdGl0dWRlLCB3aGVyZSBhcmcgaXMgYSBsb25naXR1ZGVcclxuXHQgKi9cclxuXHRXUEdNWkEuTGF0TG5nID0gZnVuY3Rpb24oYXJnLCBsbmcpXHJcblx0e1xyXG5cdFx0dGhpcy5fbGF0ID0gMDtcclxuXHRcdHRoaXMuX2xuZyA9IDA7XHJcblx0XHRcclxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPT0gMClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHRpZihhcmd1bWVudHMubGVuZ3RoID09IDEpXHJcblx0XHR7XHJcblx0XHRcdC8vIFRPRE86IFN1cHBvcnQgbGF0bG5nIHN0cmluZ1xyXG5cdFx0XHRcclxuXHRcdFx0aWYodHlwZW9mIGFyZyA9PSBcInN0cmluZ1wiKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIG07XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0aWYoIShtID0gYXJnLm1hdGNoKFdQR01aQS5MYXRMbmcuUkVHRVhQKSkpXHJcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIExhdExuZyBzdHJpbmdcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0YXJnID0ge1xyXG5cdFx0XHRcdFx0bGF0OiBtWzFdLFxyXG5cdFx0XHRcdFx0bG5nOiBtWzNdXHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYodHlwZW9mIGFyZyAhPSBcIm9iamVjdFwiIHx8ICEoXCJsYXRcIiBpbiBhcmcgJiYgXCJsbmdcIiBpbiBhcmcpKVxyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IG11c3QgYmUgYSBMYXRMbmcgbGl0ZXJhbFwiKTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMubGF0ID0gYXJnLmxhdDtcclxuXHRcdFx0dGhpcy5sbmcgPSBhcmcubG5nO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmxhdCA9IGFyZztcclxuXHRcdFx0dGhpcy5sbmcgPSBsbmc7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEEgcmVndWxhciBleHByZXNzaW9uIHdoaWNoIG1hdGNoZXMgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBjb29yZGluYXRlIHBhaXJzIGZyb20gYSBzdHJpbmcuIE1hdGNoZXMgMSBhbmQgMyBjb3JyZXNwb25kIHRvIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUsIHJlc3BlY3RpdmVseSxcclxuXHQgKiBAY29uc3RhbnQge1JlZ0V4cH1cclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkxhdExuZ1xyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmcuUkVHRVhQID0gL14oXFwtP1xcZCsoXFwuXFxkKyk/KSxcXHMqKFxcLT9cXGQrKFxcLlxcZCspPykkLztcclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHN1cHBsaWVkIG9iamVjdCBpcyBhIExhdExuZyBsaXRlcmFsLCBhbHNvIHJldHVybnMgdHJ1ZSBmb3IgaW5zdGFuY2VzIG9mIFdQR01aQS5MYXRMbmdcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQHN0YXRpY1xyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IG9iaiBBIExhdExuZyBsaXRlcmFsLCBvciBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHJldHVybiB7Ym9vbH0gVHJ1ZSBpZiB0aGlzIG9iamVjdCBpcyBhIHZhbGlkIExhdExuZyBsaXRlcmFsIG9yIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcclxuXHQgKi9cclxuXHRXUEdNWkEuTGF0TG5nLmlzVmFsaWQgPSBmdW5jdGlvbihvYmopXHJcblx0e1xyXG5cdFx0aWYodHlwZW9mIG9iaiAhPSBcIm9iamVjdFwiKVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcclxuXHRcdGlmKCEoXCJsYXRcIiBpbiBvYmogJiYgXCJsbmdcIiBpbiBvYmopKVxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nLmlzTGF0TG5nU3RyaW5nID0gZnVuY3Rpb24oc3RyKVxyXG5cdHtcclxuXHRcdGlmKHR5cGVvZiBzdHIgIT0gXCJzdHJpbmdcIilcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gc3RyLm1hdGNoKFdQR01aQS5MYXRMbmcuUkVHRVhQKSA/IHRydWUgOiBmYWxzZTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIGxhdGl0dWRlLCBndWFyYW50ZWVkIHRvIGJlIGEgbnVtYmVyXHJcblx0ICogQHByb3BlcnR5IGxhdFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICovXHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFdQR01aQS5MYXRMbmcucHJvdG90eXBlLCBcImxhdFwiLCB7XHJcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fbGF0O1xyXG5cdFx0fSxcclxuXHRcdHNldDogZnVuY3Rpb24odmFsKSB7XHJcblx0XHRcdGlmKCEkLmlzTnVtZXJpYyh2YWwpKVxyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkxhdGl0dWRlIG11c3QgYmUgbnVtZXJpY1wiKTtcclxuXHRcdFx0dGhpcy5fbGF0ID0gcGFyc2VGbG9hdCggdmFsICk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIGxvbmdpdHVkZSwgZ3VhcmFudGVlZCB0byBiZSBhIG51bWJlclxyXG5cdCAqIEBwcm9wZXJ0eSBsbmdcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkxhdExuZ1xyXG5cdCAqL1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuTGF0TG5nLnByb3RvdHlwZSwgXCJsbmdcIiwge1xyXG5cdFx0Z2V0OiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2xuZztcclxuXHRcdH0sXHJcblx0XHRzZXQ6IGZ1bmN0aW9uKHZhbCkge1xyXG5cdFx0XHRpZighJC5pc051bWVyaWModmFsKSlcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJMb25naXR1ZGUgbXVzdCBiZSBudW1lcmljXCIpO1xyXG5cdFx0XHR0aGlzLl9sbmcgPSBwYXJzZUZsb2F0KCB2YWwgKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nLmZyb21TdHJpbmcgPSBmdW5jdGlvbihzdHJpbmcpXHJcblx0e1xyXG5cdFx0aWYoIVdQR01aQS5MYXRMbmcuaXNMYXRMbmdTdHJpbmcoc3RyaW5nKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm90IGEgdmFsaWQgbGF0bG5nIHN0cmluZ1wiKTtcclxuXHRcdFxyXG5cdFx0dmFyIG0gPSBzdHJpbmcubWF0Y2goV1BHTVpBLkxhdExuZy5SRUdFWFApO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5MYXRMbmcoe1xyXG5cdFx0XHRsYXQ6IHBhcnNlRmxvYXQobVsxXSksXHJcblx0XHRcdGxuZzogcGFyc2VGbG9hdChtWzNdKVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgdGhpcyBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIGFzIGEgc3RyaW5nXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHJldHVybiB7c3RyaW5nfSBUaGlzIG9iamVjdCByZXByZXNlbnRlZCBhcyBhIHN0cmluZ1xyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLl9sYXQgKyBcIiwgXCIgKyB0aGlzLl9sbmc7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFF1ZXJpZXMgdGhlIHVzZXJzIGN1cnJlbnQgbG9jYXRpb24gYW5kIHBhc3NlcyBpdCB0byBhIGNhbGxiYWNrLCB5b3UgY2FuIHBhc3NcclxuXHQgKiBnZW9jb2RlQWRkcmVzcyB0aHJvdWdoIG9wdGlvbnMgaWYgeW91IHdvdWxkIGxpa2UgdG8gYWxzbyByZWNlaXZlIHRoZSBhZGRyZXNzXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gQSBjYWxsYmFjayB0byByZWNlaXZlIHRoZSBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IEFuIG9iamVjdCBvZiBvcHRpb25zLCBvbmx5IGdlb2NvZGVBZGRyZXNzIGlzIGN1cnJlbnRseSBzdXBwb3J0ZWRcclxuXHQgKiBAcmV0dXJuIHZvaWRcclxuXHQgKi9cclxuXHRXUEdNWkEuTGF0TG5nLmZyb21DdXJyZW50UG9zaXRpb24gPSBmdW5jdGlvbihjYWxsYmFjaywgb3B0aW9ucylcclxuXHR7XHJcblx0XHRpZighb3B0aW9ucylcclxuXHRcdFx0b3B0aW9ucyA9IHt9O1xyXG5cdFx0XHJcblx0XHRpZighY2FsbGJhY2spXHJcblx0XHRcdHJldHVybjtcclxuXHRcdFxyXG5cdFx0V1BHTVpBLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbihwb3NpdGlvbikge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGxhdExuZyA9IG5ldyBXUEdNWkEuTGF0TG5nKHtcclxuXHRcdFx0XHRsYXQ6IHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcclxuXHRcdFx0XHRsbmc6IHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGVcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zLmdlb2NvZGVBZGRyZXNzKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFyIGdlb2NvZGVyID0gV1BHTVpBLkdlb2NvZGVyLmNyZWF0ZUluc3RhbmNlKCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Z2VvY29kZXIuZ2V0QWRkcmVzc0Zyb21MYXRMbmcoe1xyXG5cdFx0XHRcdFx0bGF0TG5nOiBsYXRMbmdcclxuXHRcdFx0XHR9LCBmdW5jdGlvbihyZXN1bHRzKSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKHJlc3VsdHMubGVuZ3RoKVxyXG5cdFx0XHRcdFx0XHRsYXRMbmcuYWRkcmVzcyA9IHJlc3VsdHNbMF07XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNhbGxiYWNrKGxhdExuZyk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRcclxuXHRcdFx0fVx0XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0XHRjYWxsYmFjayhsYXRMbmcpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGFuIGluc3RuYWNlIG9mIFdQR01aQS5MYXRMbmcgZnJvbSBhbiBpbnN0YW5jZSBvZiBnb29nbGUubWFwcy5MYXRMbmdcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQHN0YXRpY1xyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHBhcmFtIHtnb29nbGUubWFwcy5MYXRMbmd9IFRoZSBnb29nbGUubWFwcy5MYXRMbmcgdG8gY29udmVydFxyXG5cdCAqIEByZXR1cm4ge1dQR01aQS5MYXRMbmd9IEFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmcgYnVpbHQgZnJvbSB0aGUgc3VwcGxpZWQgZ29vZ2xlLm1hcHMuTGF0TG5nXHJcblx0ICovXHJcblx0V1BHTVpBLkxhdExuZy5mcm9tR29vZ2xlTGF0TG5nID0gZnVuY3Rpb24oZ29vZ2xlTGF0TG5nKVxyXG5cdHtcclxuXHRcdHJldHVybiBuZXcgV1BHTVpBLkxhdExuZyhcclxuXHRcdFx0Z29vZ2xlTGF0TG5nLmxhdCgpLFxyXG5cdFx0XHRnb29nbGVMYXRMbmcubG5nKClcclxuXHRcdCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5MYXRMbmcudG9Hb29nbGVMYXRMbmdBcnJheSA9IGZ1bmN0aW9uKGFycilcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gW107XHJcblx0XHRcclxuXHRcdGFyci5mb3JFYWNoKGZ1bmN0aW9uKG5hdGl2ZUxhdExuZykge1xyXG5cdFx0XHRcclxuXHRcdFx0aWYoISAobmF0aXZlTGF0TG5nIGluc3RhbmNlb2YgV1BHTVpBLkxhdExuZyB8fCAoXCJsYXRcIiBpbiBuYXRpdmVMYXRMbmcgJiYgXCJsbmdcIiBpbiBuYXRpdmVMYXRMbmcpKSApXHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBpbnB1dFwiKTtcclxuXHRcdFx0XHJcblx0XHRcdHJlc3VsdC5wdXNoKG5ldyBnb29nbGUubWFwcy5MYXRMbmcoe1xyXG5cdFx0XHRcdGxhdDogcGFyc2VGbG9hdChuYXRpdmVMYXRMbmcubGF0KSxcclxuXHRcdFx0XHRsbmc6IHBhcnNlRmxvYXQobmF0aXZlTGF0TG5nLmxuZylcclxuXHRcdFx0fSkpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIGFuIGluc3RhbmNlIG9mIGdvb2dsZS5tYXBzLkxhdExuZyB3aXRoIHRoZSBzYW1lIGNvb3JkaW5hdGVzIGFzIHRoaXMgb2JqZWN0XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nXHJcblx0ICogQHJldHVybiB7Z29vZ2xlLm1hcHMuTGF0TG5nfSBUaGlzIG9iamVjdCwgZXhwcmVzc2VkIGFzIGEgZ29vZ2xlLm1hcHMuTGF0TG5nXHJcblx0ICovXHJcblx0V1BHTVpBLkxhdExuZy5wcm90b3R5cGUudG9Hb29nbGVMYXRMbmcgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoe1xyXG5cdFx0XHRsYXQ6IHRoaXMubGF0LFxyXG5cdFx0XHRsbmc6IHRoaXMubG5nXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkxhdExuZy5wcm90b3R5cGUudG9MYXRMbmdMaXRlcmFsID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGxhdDogdGhpcy5sYXQsXHJcblx0XHRcdGxuZzogdGhpcy5sbmdcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE1vdmVzIHRoaXMgbGF0TG5nIGJ5IHRoZSBzcGVjaWZpZWQga2lsb21ldGVycyBhbG9uZyB0aGUgZ2l2ZW4gaGVhZGluZy4gVGhpcyBmdW5jdGlvbiBvcGVyYXRlcyBpbiBwbGFjZSwgYXMgb3Bwb3NlZCB0byBjcmVhdGluZyBhIG5ldyBpbnN0YW5jZSBvZiBXUEdNWkEuTGF0TG5nLiBXaXRoIG1hbnkgdGhhbmtzIHRvIEh1IEtlbm5ldGggLSBodHRwczovL2dpcy5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMjM0NDczL2dldC1hLWxvbmxhdC1wb2ludC1ieS1kaXN0YW5jZS1vci1iZXR3ZWVuLTItbG9ubGF0LXBvaW50c1xyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkxhdExuZ1xyXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBraWxvbWV0ZXJzIFRoZSBudW1iZXIgb2Yga2lsb21ldGVycyB0byBtb3ZlIHRoaXMgTGF0TG5nIGJ5XHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IGhlYWRpbmcgVGhlIGhlYWRpbmcsIGluIGRlZ3JlZXMsIHRvIG1vdmUgYWxvbmcsIHdoZXJlIHplcm8gaXMgTm9ydGhcclxuXHQgKiBAcmV0dXJuIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmcucHJvdG90eXBlLm1vdmVCeURpc3RhbmNlID0gZnVuY3Rpb24oa2lsb21ldGVycywgaGVhZGluZylcclxuXHR7XHJcblx0XHR2YXIgcmFkaXVzIFx0XHQ9IDYzNzE7XHJcblx0XHRcclxuXHRcdHZhciBkZWx0YSBcdFx0PSBwYXJzZUZsb2F0KGtpbG9tZXRlcnMpIC8gcmFkaXVzO1xyXG5cdFx0dmFyIHRoZXRhIFx0XHQ9IHBhcnNlRmxvYXQoaGVhZGluZykgLyAxODAgKiBNYXRoLlBJO1xyXG5cdFx0XHJcblx0XHR2YXIgcGhpMSBcdFx0PSB0aGlzLmxhdCAvIDE4MCAqIE1hdGguUEk7XHJcblx0XHR2YXIgbGFtYmRhMSBcdD0gdGhpcy5sbmcgLyAxODAgKiBNYXRoLlBJO1xyXG5cdFx0XHJcblx0XHR2YXIgc2luUGhpMSBcdD0gTWF0aC5zaW4ocGhpMSksIGNvc1BoaTEgPSBNYXRoLmNvcyhwaGkxKTtcclxuXHRcdHZhciBzaW5EZWx0YVx0PSBNYXRoLnNpbihkZWx0YSksIGNvc0RlbHRhID0gTWF0aC5jb3MoZGVsdGEpO1xyXG5cdFx0dmFyIHNpblRoZXRhXHQ9IE1hdGguc2luKHRoZXRhKSwgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XHJcblx0XHRcclxuXHRcdHZhciBzaW5QaGkyXHRcdD0gc2luUGhpMSAqIGNvc0RlbHRhICsgY29zUGhpMSAqIHNpbkRlbHRhICogY29zVGhldGE7XHJcblx0XHR2YXIgcGhpMlx0XHQ9IE1hdGguYXNpbihzaW5QaGkyKTtcclxuXHRcdHZhciB5XHRcdFx0PSBzaW5UaGV0YSAqIHNpbkRlbHRhICogY29zUGhpMTtcclxuXHRcdHZhciB4XHRcdFx0PSBjb3NEZWx0YSAtIHNpblBoaTEgKiBzaW5QaGkyO1xyXG5cdFx0dmFyIGxhbWJkYTJcdFx0PSBsYW1iZGExICsgTWF0aC5hdGFuMih5LCB4KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5sYXRcdFx0PSBwaGkyICogMTgwIC8gTWF0aC5QSTtcclxuXHRcdHRoaXMubG5nXHRcdD0gbGFtYmRhMiAqIDE4MCAvIE1hdGguUEk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEBmdW5jdGlvbiBnZXRHcmVhdENpcmNsZURpc3RhbmNlXHJcblx0ICogQHN1bW1hcnkgVXNlcyB0aGUgaGF2ZXJzaW5lIGZvcm11bGEgdG8gZ2V0IHRoZSBncmVhdCBjaXJjbGUgZGlzdGFuY2UgYmV0d2VlbiB0aGlzIGFuZCBhbm90aGVyIExhdExuZyAvIGxhdCAmIGxuZyBwYWlyXHJcblx0ICogQHBhcmFtIGFyZzEgW1dQR01aQS5MYXRMbmd8T2JqZWN0fE51bWJlcl0gRWl0aGVyIGEgV1BHTVpBLkxhdExuZywgYW4gb2JqZWN0IHJlcHJlc2VudGluZyBhIGxhdC9sbmcgbGl0ZXJhbCwgb3IgYSBsYXRpdHVkZVxyXG5cdCAqIEBwYXJhbSBhcmcyIChvcHRpb25hbCkgSWYgYXJnMSBpcyBhIE51bWJlciByZXByZXNlbnRpbmcgbGF0aXR1ZGUsIHBhc3MgYXJnMiB0byByZXByZXNlbnQgdGhlIGxvbmdpdHVkZVxyXG5cdCAqIEByZXR1cm4gbnVtYmVyIFRoZSBkaXN0YW5jZSBcImFzIHRoZSBjcm93IGZpbGVzXCIgYmV0d2VlbiB0aGlzIHBvaW50IGFuZCB0aGUgb3RoZXJcclxuXHQgKi9cclxuXHRXUEdNWkEuTGF0TG5nLnByb3RvdHlwZS5nZXRHcmVhdENpcmNsZURpc3RhbmNlID0gZnVuY3Rpb24oYXJnMSwgYXJnMilcclxuXHR7XHJcblx0XHR2YXIgbGF0MSA9IHRoaXMubGF0O1xyXG5cdFx0dmFyIGxvbjEgPSB0aGlzLmxuZztcclxuXHRcdHZhciBvdGhlcjtcclxuXHRcdFxyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA9PSAxKVxyXG5cdFx0XHRvdGhlciA9IG5ldyBXUEdNWkEuTGF0TG5nKGFyZzEpO1xyXG5cdFx0ZWxzZSBpZihhcmd1bWVudHMubGVuZ3RoID09IDIpXHJcblx0XHRcdG90aGVyID0gbmV3IFdQR01aQS5MYXRMbmcoYXJnMSwgYXJnMik7XHJcblx0XHRlbHNlXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbnVtYmVyIG9mIGFyZ3VtZW50c1wiKTtcclxuXHRcdFxyXG5cdFx0dmFyIGxhdDIgPSBvdGhlci5sYXQ7XHJcblx0XHR2YXIgbG9uMiA9IG90aGVyLmxuZztcclxuXHRcdFxyXG5cdFx0dmFyIFIgPSA2MzcxOyAvLyBLaWxvbWV0ZXJzXHJcblx0XHR2YXIgcGhpMSA9IGxhdDEudG9SYWRpYW5zKCk7XHJcblx0XHR2YXIgcGhpMiA9IGxhdDIudG9SYWRpYW5zKCk7XHJcblx0XHR2YXIgZGVsdGFQaGkgPSAobGF0Mi1sYXQxKS50b1JhZGlhbnMoKTtcclxuXHRcdHZhciBkZWx0YUxhbWJkYSA9IChsb24yLWxvbjEpLnRvUmFkaWFucygpO1xyXG5cclxuXHRcdHZhciBhID0gTWF0aC5zaW4oZGVsdGFQaGkvMikgKiBNYXRoLnNpbihkZWx0YVBoaS8yKSArXHJcblx0XHRcdFx0TWF0aC5jb3MocGhpMSkgKiBNYXRoLmNvcyhwaGkyKSAqXHJcblx0XHRcdFx0TWF0aC5zaW4oZGVsdGFMYW1iZGEvMikgKiBNYXRoLnNpbihkZWx0YUxhbWJkYS8yKTtcclxuXHRcdHZhciBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMS1hKSk7XHJcblxyXG5cdFx0dmFyIGQgPSBSICogYztcclxuXHRcdFxyXG5cdFx0cmV0dXJuIGQ7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6ImxhdGxuZy5qcyJ9
