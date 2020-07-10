/**
 * @namespace WPGMZA
 * @module GoogleGeocoder
 * @requires WPGMZA.Geocoder
 * @gulp-requires ../geocoder.js
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
		WPGMZA.Geocoder.call(this);
	}
	
	WPGMZA.GoogleGeocoder.prototype = Object.create(WPGMZA.Geocoder.prototype);
	WPGMZA.GoogleGeocoder.prototype.constructor = WPGMZA.GoogleGeocoder;
	
	WPGMZA.GoogleGeocoder.prototype.getGoogleGeocoder = function()
	{
		if(WPGMZA.CloudAPI && WPGMZA.CloudAPI.isBeingUsed)
			return new WPGMZA.CloudGeocoder();
		
		return new google.maps.Geocoder();
	}
	
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
		
		var geocoder = this.getGoogleGeocoder();
		
		geocoder.geocode(options, function(results, status) {
			
			if(status == google.maps.GeocoderStatus.OK || status == WPGMZA.CloudGeocoder.SUCCESS)
			{
				var location = results[0].geometry.location;
				var latLng, bounds = null;
				
				latLng = {
					lat: location.lat(),
					lng: location.lng()
				};
				
				if(bounds = results[0].geometry.bounds)
				{
					if(bounds instanceof google.maps.LatLngBounds)
						bounds = WPGMZA.LatLngBounds.fromGoogleLatLngBounds(results[0].geometry.bounds);
					else
						bounds = WPGMZA.LatLngBounds.fromGoogleLatLngBoundsLiteral(results[0].geometry.bounds);
				}
				
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
		var geocoder = this.getGoogleGeocoder();
		
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtZ2VvY29kZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlR2VvY29kZXJcclxuICogQHJlcXVpcmVzIFdQR01aQS5HZW9jb2RlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9nZW9jb2Rlci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBTdWJjbGFzcywgdXNlZCB3aGVuIEdvb2dsZSBpcyB0aGUgbWFwcyBlbmdpbmUuIDxzdHJvbmc+UGxlYXNlIDxlbT5kbyBub3Q8L2VtPiBjYWxsIHRoaXMgY29uc3RydWN0b3IgZGlyZWN0bHkuIEFsd2F5cyB1c2UgY3JlYXRlSW5zdGFuY2UgcmF0aGVyIHRoYW4gaW5zdGFudGlhdGluZyB0aGlzIGNsYXNzIGRpcmVjdGx5Ljwvc3Ryb25nPiBVc2luZyBjcmVhdGVJbnN0YW5jZSBhbGxvd3MgdGhpcyBjbGFzcyB0byBiZSBleHRlcm5hbGx5IGV4dGVuc2libGUuXHJcblx0ICogQGNsYXNzIFdQR01aQS5Hb29nbGVHZW9jb2RlclxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuR29vZ2xlR2VvY29kZXJcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQGF1Z21lbnRzIFdQR01aQS5HZW9jb2RlclxyXG5cdCAqIEBzZWUgV1BHTVpBLkdlb2NvZGVyLmNyZWF0ZUluc3RhbmNlXHJcblx0ICovXHJcblx0V1BHTVpBLkdvb2dsZUdlb2NvZGVyID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdFdQR01aQS5HZW9jb2Rlci5jYWxsKHRoaXMpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlR2VvY29kZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuR2VvY29kZXIucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuR29vZ2xlR2VvY29kZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLkdvb2dsZUdlb2NvZGVyO1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVHZW9jb2Rlci5wcm90b3R5cGUuZ2V0R29vZ2xlR2VvY29kZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoV1BHTVpBLkNsb3VkQVBJICYmIFdQR01aQS5DbG91ZEFQSS5pc0JlaW5nVXNlZClcclxuXHRcdFx0cmV0dXJuIG5ldyBXUEdNWkEuQ2xvdWRHZW9jb2RlcigpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVHZW9jb2Rlci5wcm90b3R5cGUuZ2V0TGF0TG5nRnJvbUFkZHJlc3MgPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaylcclxuXHR7XHJcblx0XHRpZighb3B0aW9ucyB8fCAhb3B0aW9ucy5hZGRyZXNzKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBhZGRyZXNzIHNwZWNpZmllZFwiKTtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLmlzTGF0TG5nU3RyaW5nKG9wdGlvbnMuYWRkcmVzcykpXHJcblx0XHRcdHJldHVybiBXUEdNWkEuR2VvY29kZXIucHJvdG90eXBlLmdldExhdExuZ0Zyb21BZGRyZXNzLmNhbGwodGhpcywgb3B0aW9ucywgY2FsbGJhY2spO1xyXG5cdFx0XHJcblx0XHRpZihvcHRpb25zLmNvdW50cnkpXHJcblx0XHRcdG9wdGlvbnMuY29tcG9uZW50UmVzdHJpY3Rpb25zID0ge1xyXG5cdFx0XHRcdGNvdW50cnk6IG9wdGlvbnMuY291bnRyeVxyXG5cdFx0XHR9O1xyXG5cdFx0XHJcblx0XHR2YXIgZ2VvY29kZXIgPSB0aGlzLmdldEdvb2dsZUdlb2NvZGVyKCk7XHJcblx0XHRcclxuXHRcdGdlb2NvZGVyLmdlb2NvZGUob3B0aW9ucywgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0sgfHwgc3RhdHVzID09IFdQR01aQS5DbG91ZEdlb2NvZGVyLlNVQ0NFU1MpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YXIgbG9jYXRpb24gPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uO1xyXG5cdFx0XHRcdHZhciBsYXRMbmcsIGJvdW5kcyA9IG51bGw7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bGF0TG5nID0ge1xyXG5cdFx0XHRcdFx0bGF0OiBsb2NhdGlvbi5sYXQoKSxcclxuXHRcdFx0XHRcdGxuZzogbG9jYXRpb24ubG5nKClcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGJvdW5kcyA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkuYm91bmRzKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGlmKGJvdW5kcyBpbnN0YW5jZW9mIGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcylcclxuXHRcdFx0XHRcdFx0Ym91bmRzID0gV1BHTVpBLkxhdExuZ0JvdW5kcy5mcm9tR29vZ2xlTGF0TG5nQm91bmRzKHJlc3VsdHNbMF0uZ2VvbWV0cnkuYm91bmRzKTtcclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdFx0Ym91bmRzID0gV1BHTVpBLkxhdExuZ0JvdW5kcy5mcm9tR29vZ2xlTGF0TG5nQm91bmRzTGl0ZXJhbChyZXN1bHRzWzBdLmdlb21ldHJ5LmJvdW5kcyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHZhciByZXN1bHRzID0gW1xyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRnZW9tZXRyeToge1xyXG5cdFx0XHRcdFx0XHRcdGxvY2F0aW9uOiBsYXRMbmdcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0bGF0TG5nOiBsYXRMbmcsXHJcblx0XHRcdFx0XHRcdGxhdDogbGF0TG5nLmxhdCxcclxuXHRcdFx0XHRcdFx0bG5nOiBsYXRMbmcubG5nLFxyXG5cdFx0XHRcdFx0XHRib3VuZHM6IGJvdW5kc1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdF07XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Y2FsbGJhY2socmVzdWx0cywgV1BHTVpBLkdlb2NvZGVyLlNVQ0NFU1MpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHZhciBuYXRpdmVTdGF0dXMgPSBXUEdNWkEuR2VvY29kZXIuRkFJTDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZihzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuWkVST19SRVNVTFRTKVxyXG5cdFx0XHRcdFx0bmF0aXZlU3RhdHVzID0gV1BHTVpBLkdlb2NvZGVyLlpFUk9fUkVTVUxUUztcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRjYWxsYmFjayhudWxsLCBuYXRpdmVTdGF0dXMpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkdvb2dsZUdlb2NvZGVyLnByb3RvdHlwZS5nZXRBZGRyZXNzRnJvbUxhdExuZyA9IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKVxyXG5cdHtcclxuXHRcdGlmKCFvcHRpb25zIHx8ICFvcHRpb25zLmxhdExuZylcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTm8gbGF0TG5nIHNwZWNpZmllZFwiKTtcclxuXHRcdFxyXG5cdFx0dmFyIGxhdExuZyA9IG5ldyBXUEdNWkEuTGF0TG5nKG9wdGlvbnMubGF0TG5nKTtcclxuXHRcdHZhciBnZW9jb2RlciA9IHRoaXMuZ2V0R29vZ2xlR2VvY29kZXIoKTtcclxuXHRcdFxyXG5cdFx0dmFyIG9wdGlvbnMgPSAkLmV4dGVuZChvcHRpb25zLCB7XHJcblx0XHRcdGxvY2F0aW9uOiB7XHJcblx0XHRcdFx0bGF0OiBsYXRMbmcubGF0LFxyXG5cdFx0XHRcdGxuZzogbGF0TG5nLmxuZ1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdGRlbGV0ZSBvcHRpb25zLmxhdExuZztcclxuXHRcdFxyXG5cdFx0Z2VvY29kZXIuZ2VvY29kZShvcHRpb25zLCBmdW5jdGlvbihyZXN1bHRzLCBzdGF0dXMpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHN0YXR1cyAhPT0gXCJPS1wiKVxyXG5cdFx0XHRcdGNhbGxiYWNrKG51bGwsIFdQR01aQS5HZW9jb2Rlci5GQUlMKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKCFyZXN1bHRzIHx8ICFyZXN1bHRzLmxlbmd0aClcclxuXHRcdFx0XHRjYWxsYmFjayhbXSwgV1BHTVpBLkdlb2NvZGVyLk5PX1JFU1VMVFMpO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2FsbGJhY2soW3Jlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NdLCBXUEdNWkEuR2VvY29kZXIuU1VDQ0VTUyk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6Imdvb2dsZS1tYXBzL2dvb2dsZS1nZW9jb2Rlci5qcyJ9
