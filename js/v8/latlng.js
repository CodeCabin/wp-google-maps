/**
 * @namespace WPGMZA
 * @module LatLng
 * @requires WPGMZA
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
	
});