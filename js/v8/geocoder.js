/**
 * @namespace WPGMZA
 * @module Geocoder
 * @requires WPGMZA
 * @gulp-requires core.js
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
			
			// NB: Quick fix, solves issue with right click marker. Solve this there by making behaviour consistent
			latLng.latLng = latLng;
			
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnZW9jb2Rlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBHZW9jb2RlclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyBmb3IgZ2VvY29kZXJzLiA8c3Ryb25nPlBsZWFzZSA8ZW0+ZG8gbm90PC9lbT4gY2FsbCB0aGlzIGNvbnN0cnVjdG9yIGRpcmVjdGx5LiBBbHdheXMgdXNlIGNyZWF0ZUluc3RhbmNlIHJhdGhlciB0aGFuIGluc3RhbnRpYXRpbmcgdGhpcyBjbGFzcyBkaXJlY3RseS48L3N0cm9uZz4gVXNpbmcgY3JlYXRlSW5zdGFuY2UgYWxsb3dzIHRoaXMgY2xhc3MgdG8gYmUgZXh0ZXJuYWxseSBleHRlbnNpYmxlLlxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuR2VvY29kZXJcclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBzZWUgV1BHTVpBLkdlb2NvZGVyLmNyZWF0ZUluc3RhbmNlXHJcblx0ICovXHJcblx0V1BHTVpBLkdlb2NvZGVyID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdFdQR01aQS5hc3NlcnRJbnN0YW5jZU9mKHRoaXMsIFwiR2VvY29kZXJcIik7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEluZGljYXRlcyBhIHN1Y2Nlc3NmdWwgZ2VvY29kZSwgd2l0aCBvbmUgb3IgbW9yZSByZXN1bHRzXHJcblx0ICogQGNvbnN0YW50IFNVQ0NFU1NcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICovXHJcblx0V1BHTVpBLkdlb2NvZGVyLlNVQ0NFU1NcdFx0XHQ9IFwic3VjY2Vzc1wiO1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEluZGljYXRlcyB0aGUgZ2VvY29kZSB3YXMgc3VjY2Vzc2Z1bCwgYnV0IHJldHVybmVkIG5vIHJlc3VsdHNcclxuXHQgKiBAY29uc3RhbnQgWkVST19SRVNVTFRTXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5HZW9jb2Rlci5aRVJPX1JFU1VMVFNcdD0gXCJ6ZXJvLXJlc3VsdHNcIjtcclxuXHRcclxuXHQvKipcclxuXHQgKiBJbmRpY2F0ZXMgdGhlIGdlb2NvZGUgZmFpbGVkLCB1c3VhbGx5IGR1ZSB0byB0ZWNobmljYWwgcmVhc29ucyAoZWcgY29ubmVjdGl2aXR5KVxyXG5cdCAqIEBjb25zdGFudCBGQUlMXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5HZW9jb2Rlci5GQUlMXHRcdFx0PSBcImZhaWxcIjtcclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBjb250cnVjdG9yIHRvIGJlIHVzZWQgYnkgY3JlYXRlSW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgc2VsZWN0ZWQgbWFwcyBlbmdpbmUuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuR2VvY29kZXJcclxuXHQgKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIGFwcHJvcHJpYXRlIGNvbnRydWN0b3JcclxuXHQgKi9cclxuXHRXUEdNWkEuR2VvY29kZXIuZ2V0Q29uc3RydWN0b3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdHJldHVybiBXUEdNWkEuT0xHZW9jb2RlcjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRyZXR1cm4gV1BHTVpBLkdvb2dsZUdlb2NvZGVyO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgR2VvY29kZXIsIDxzdHJvbmc+cGxlYXNlIDxlbT5hbHdheXM8L2VtPiB1c2UgdGhpcyBmdW5jdGlvbiByYXRoZXIgdGhhbiBjYWxsaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseTwvc3Ryb25nPlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICogQHJldHVybiB7V1BHTVpBLkdlb2NvZGVyfSBBIHN1YmNsYXNzIG9mIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqL1xyXG5cdFdQR01aQS5HZW9jb2Rlci5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgY29uc3RydWN0b3IgPSBXUEdNWkEuR2VvY29kZXIuZ2V0Q29uc3RydWN0b3IoKTtcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3IoKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQXR0ZW1wdHMgdG8gY29udmVydCBhIHN0cmVldCBhZGRyZXNzIHRvIGFuIGFycmF5IG9mIHBvdGVudGlhbCBjb29yZGluYXRlcyB0aGF0IG1hdGNoIHRoZSBhZGRyZXNzLCB3aGljaCBhcmUgcGFzc2VkIHRvIGEgY2FsbGJhY2suIElmIHRoZSBhZGRyZXNzIGlzIGludGVycHJldGVkIGFzIGEgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBjb29yZGluYXRlIHBhaXIsIHRoZSBjYWxsYmFjayBpcyBpbW1lZGlhdGVseSBmaXJlZC5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIHRvIGdlb2NvZGUsIGFkZHJlc3MgaXMgbWFuZGF0b3J5LlxyXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIFRoZSBjYWxsYmFjayB0byByZWNlaXZlIHRoZSBnZW9jb2RlIHJlc3VsdC5cclxuXHQgKiBAcmV0dXJuIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5HZW9jb2Rlci5wcm90b3R5cGUuZ2V0TGF0TG5nRnJvbUFkZHJlc3MgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaylcclxuXHR7XHJcblx0XHRpZihXUEdNWkEuaXNMYXRMbmdTdHJpbmcob3B0aW9ucy5hZGRyZXNzKSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIHBhcnRzID0gb3B0aW9ucy5hZGRyZXNzLnNwbGl0KC8sXFxzKi8pO1xyXG5cdFx0XHR2YXIgbGF0TG5nID0gbmV3IFdQR01aQS5MYXRMbmcoe1xyXG5cdFx0XHRcdGxhdDogcGFyc2VGbG9hdChwYXJ0c1swXSksXHJcblx0XHRcdFx0bG5nOiBwYXJzZUZsb2F0KHBhcnRzWzFdKVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIE5COiBRdWljayBmaXgsIHNvbHZlcyBpc3N1ZSB3aXRoIHJpZ2h0IGNsaWNrIG1hcmtlci4gU29sdmUgdGhpcyB0aGVyZSBieSBtYWtpbmcgYmVoYXZpb3VyIGNvbnNpc3RlbnRcclxuXHRcdFx0bGF0TG5nLmxhdExuZyA9IGxhdExuZztcclxuXHRcdFx0XHJcblx0XHRcdGNhbGxiYWNrKFtsYXRMbmddLCBXUEdNWkEuR2VvY29kZXIuU1VDQ0VTUyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEF0dGVtcHRzIHRvIGNvbnZlcnQgbGF0aXR1ZGUgZWFuZCBsb25naXR1ZGUgY29vcmRpbmF0ZXMgaW50byBhIHN0cmVldCBhZGRyZXNzLiBCeSBkZWZhdWx0IHRoaXMgd2lsbCBzaW1wbHkgcmV0dXJuIHRoZSBjb29yZGluYXRlcyB3cmFwcGVkIGluIGFuIGFycmF5LlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgdG8gZ2VvY29kZSwgbGF0TG5nIGlzIG1hbmRhdG9yeS5cclxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgY2FsbGJhY2sgdG8gcmVjZWl2ZSB0aGUgZ2VvY29kZSByZXN1bHQuXHJcblx0ICogQHJldHVybiB7dm9pZH1cclxuXHQgKi9cclxuXHRXUEdNWkEuR2VvY29kZXIucHJvdG90eXBlLmdldEFkZHJlc3NGcm9tTGF0TG5nID0gZnVuY3Rpb24ob3B0aW9ucywgY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0dmFyIGxhdExuZyA9IG5ldyBXUEdNWkEuTGF0TG5nKG9wdGlvbnMubGF0TG5nKTtcclxuXHRcdGNhbGxiYWNrKFtsYXRMbmcudG9TdHJpbmcoKV0sIFdQR01aQS5HZW9jb2Rlci5TVUNDRVNTKTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2VvY29kZXMgZWl0aGVyIGFuIGFkZHJlc3Mgb3IgYSBsYXRpdHVkZSBhbmQgbG9uZ2l0dWRlIGNvb3JkaW5hdGUgcGFpciwgZGVwZW5kaW5nIG9uIHRoZSBpbnB1dFxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkdlb2NvZGVyXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgVGhlIG9wdGlvbnMgdG8gZ2VvY29kZSwgeW91IG11c3Qgc3VwcGx5IDxlbT5laXRoZXI8L2VtPiBsYXRMbmcgPGVtPm9yPC9lbT4gYWRkcmVzcy5cclxuXHQgKiBAdGhyb3dzIFlvdSBtdXN0IHN1cHBseSBlaXRoZXIgYSBsYXRMbmcgb3IgYWRkcmVzc1xyXG5cdCAqIEByZXR1cm4ge3ZvaWR9XHJcblx0ICovXHJcblx0V1BHTVpBLkdlb2NvZGVyLnByb3RvdHlwZS5nZW9jb2RlID0gZnVuY3Rpb24ob3B0aW9ucywgY2FsbGJhY2spXHJcblx0e1xyXG5cdFx0aWYoXCJhZGRyZXNzXCIgaW4gb3B0aW9ucylcclxuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0TGF0TG5nRnJvbUFkZHJlc3Mob3B0aW9ucywgY2FsbGJhY2spO1xyXG5cdFx0ZWxzZSBpZihcImxhdExuZ1wiIGluIG9wdGlvbnMpXHJcblx0XHRcdHJldHVybiB0aGlzLmdldEFkZHJlc3NGcm9tTGF0TG5nKG9wdGlvbnMsIGNhbGxiYWNrKTtcclxuXHRcdFxyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3Qgc3VwcGx5IGVpdGhlciBhIGxhdExuZyBvciBhZGRyZXNzXCIpO1xyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJnZW9jb2Rlci5qcyJ9
