/**
 * @namespace WPGMZA
 * @module Geocoder
 * @requires WPGMZA
 */
jQuery(function($) {
	
	/**
	 * Base class for geocoders. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Geocoder
	 * @constructor WPGMZA.Geocoder
	 * @memberof WPGMZA
	 * @see WPGMZA.Geocoder.createInstance
	 */
	WPGMZA.Geocoder = function()
	{
		WPGMZA.assertInstanceOf(this, "Geocoder");
	}
	
	/**
	 * Indicates a successful geocode, with one or more results
	 * @constant SUCCESS
	 * @memberof WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.SUCCESS			= "success";
	
	/**
	 * Indicates the geocode was successful, but returned no results
	 * @constant ZERO_RESULTS
	 * @memberof WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.ZERO_RESULTS	= "zero-results";
	
	/**
	 * Indicates the geocode failed, usually due to technical reasons (eg connectivity)
	 * @constant FAIL
	 * @memberof WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.FAIL			= "fail";
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Geocoder.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return WPGMZA.OLGeocoder;
				break;
				
			default:
				return WPGMZA.GoogleGeocoder;
				break;
		}
	}
	
	/**
	 * Creates an instance of a Geocoder, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @return {WPGMZA.Geocoder} A subclass of WPGMZA.Geocoder
	 */
	WPGMZA.Geocoder.createInstance = function()
	{
		var constructor = WPGMZA.Geocoder.getConstructor();
		return new constructor();
	}
	
	/**
	 * Attempts to convert a street address to an array of potential coordinates that match the address, which are passed to a callback. If the address is interpreted as a latitude and longitude coordinate pair, the callback is immediately fired.
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @param {object} options The options to geocode, address is mandatory.
	 * @param {function} callback The callback to receive the geocode result.
	 * @return {void}
	 */
	WPGMZA.Geocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(WPGMZA.isLatLngString(options.address))
		{
			var parts = options.address.split(/,\s*/);
			var latLng = new WPGMZA.LatLng({
				lat: parseFloat(parts[0]),
				lng: parseFloat(parts[1])
			});
			callback([latLng], WPGMZA.Geocoder.SUCCESS);
		}
	}
	
	/**
	 * Attempts to convert latitude eand longitude coordinates into a street address. By default this will simply return the coordinates wrapped in an array.
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @param {object} options The options to geocode, latLng is mandatory.
	 * @param {function} callback The callback to receive the geocode result.
	 * @return {void}
	 */
	WPGMZA.Geocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		var latLng = new WPGMZA.LatLng(options.latLng);
		callback([latLng.toString()], WPGMZA.Geocoder.SUCCESS);
	}
	
	/**
	 * Geocodes either an address or a latitude and longitude coordinate pair, depending on the input
	 * @method
	 * @memberof WPGMZA.Geocoder
	 * @param {object} options The options to geocode, you must supply <em>either</em> latLng <em>or</em> address.
	 * @throws You must supply either a latLng or address
	 * @return {void}
	 */
	WPGMZA.Geocoder.prototype.geocode = function(options, callback)
	{
		if("address" in options)
			return this.getLatLngFromAddress(options, callback);
		else if("latLng" in options)
			return this.getAddressFromLatLng(options, callback);
		
		throw new Error("You must supply either a latLng or address");
	}
	
});