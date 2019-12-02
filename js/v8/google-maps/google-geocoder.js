/**
 * @namespace WPGMZA
 * @module GoogleGeocoder
 * @requires WPGMZA.Geocoder
 */
jQuery(function($) {
	
	/**
	 * Subclass, used when Google is the maps engine. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.GoogleGeocoder
	 * @constructor WPGMZA.GoogleGeocoder
	 * @memberof WPGMZA
	 * @augments WPGMZA.Geocoder
	 * @see WPGMZA.Geocoder.createInstance
	 */
	WPGMZA.GoogleGeocoder = function()
	{
		
	}
	
	WPGMZA.GoogleGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.GoogleGeocoder.prototype.constructor = WPGMZA.GoogleGeocoder;
	
	WPGMZA.GoogleGeocoder.prototype.getLatLngFromAddress = function(options, callback)
	{
		if(!options || !options.address)
			throw new Error("No address specified");
		
		if(WPGMZA.isLatLngString(options.address))
			return WPGMZA.Geocoder.prototype.getLatLngFromAddress.call(this, options, callback);
		
		if(options.country)
			options.componentRestrictions = {
				country: options.country
			};
		
		var geocoder = new google.maps.Geocoder();
		
		geocoder.geocode(options, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK)
			{
				var location = results[0].geometry.location;
				var latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				var bounds = null;
				
				if(results[0].geometry.bounds)
					bounds = WPGMZA.LatLngBounds.fromGoogleLatLngBounds(results[0].geometry.bounds);
				
				var results = [
					{
						geometry: {
							location: latLng
						},
						latLng: latLng,
						lat: latLng.lat,
						lng: latLng.lng,
						bounds: bounds
					}
				];
				
				
				
				callback(results, WPGMZA.Geocoder.SUCCESS);
			}
			else
			{
				var nativeStatus = WPGMZA.Geocoder.FAIL;
				
				if(status == google.maps.GeocoderStatus.ZERO_RESULTS)
					nativeStatus = WPGMZA.Geocoder.ZERO_RESULTS;
				
				callback(null, nativeStatus);
			}
		});
	}
	
	WPGMZA.GoogleGeocoder.prototype.getAddressFromLatLng = function(options, callback)
	{
		if(!options || !options.latLng)
			throw new Error("No latLng specified");
		
		var latLng = new WPGMZA.LatLng(options.latLng);
		var geocoder = new google.maps.Geocoder();
		
		var options = $.extend(options, {
			location: {
				lat: latLng.lat,
				lng: latLng.lng
			}
		});
		delete options.latLng;
		
		geocoder.geocode(options, function(results, status) {
			
			if(status !== "OK")
				callback(null, WPGMZA.Geocoder.FAIL);
			
			if(!results || !results.length)
				callback([], WPGMZA.Geocoder.NO_RESULTS);
			
			callback([results[0].formatted_address], WPGMZA.Geocoder.SUCCESS);
			
		});
	}
	
});