/**
 * @namespace WPGMZA
 * @module Polyline
 * @requires WPGMZA.MapObject
 * @gulp-requires map-object.js
 */
jQuery(function($) {
	
	/**
	 * Base class for polylines. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polyline
	 * @constructor WPGMZA.Polyline
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Polyline = function(row, googlePolyline)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polyline");
		
		this.title = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polyline.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polyline.prototype.constructor = WPGMZA.Polyline;
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Polyline.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return WPGMZA.OLPolyline;
				break;
			
			default:
				return WPGMZA.GooglePolyline;
				break;
		}
	}
	
	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @param {object} [row] Options to apply to this polyline.
	 * @param {object} [enginePolyline] An engine polyline, passed from the drawing manager. Used when a polyline has been created by a drawing manager.
	 * @returns {WPGMZA.Polyline} An instance of WPGMZA.Polyline
	 */
	WPGMZA.Polyline.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polyline.getConstructor();
		return new constructor(row, engineObject);
	}
	
	/**
	 * Gets the points on this polylines
	 * @return {array} An array of LatLng literals
	 */
	WPGMZA.Polyline.prototype.getPoints = function()
	{
		return this.toJSON().points;
	}
	
	/**
	 * Returns a JSON representation of this polyline, for serialization
	 * @method
	 * @memberof WPGMZA.Polyline
	 * @returns {object} A JSON object representing this polyline
	 */
	WPGMZA.Polyline.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		result.title = this.title;
		
		return result;
	}
	
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb2x5bGluZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBQb2x5bGluZVxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1hcE9iamVjdFxyXG4gKiBAZ3VscC1yZXF1aXJlcyBtYXAtb2JqZWN0LmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEJhc2UgY2xhc3MgZm9yIHBvbHlsaW5lcy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLlBvbHlsaW5lXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5Qb2x5bGluZVxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKiBAcGFyYW0ge29iamVjdH0gW3Jvd10gT3B0aW9ucyB0byBhcHBseSB0byB0aGlzIHBvbHlsaW5lLlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbZW5naW5lUG9seWxpbmVdIEFuIGVuZ2luZSBwb2x5bGluZSwgcGFzc2VkIGZyb20gdGhlIGRyYXdpbmcgbWFuYWdlci4gVXNlZCB3aGVuIGEgcG9seWxpbmUgaGFzIGJlZW4gY3JlYXRlZCBieSBhIGRyYXdpbmcgbWFuYWdlci5cclxuXHQgKiBAYXVnbWVudHMgV1BHTVpBLk1hcE9iamVjdFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Qb2x5bGluZSA9IGZ1bmN0aW9uKHJvdywgZ29vZ2xlUG9seWxpbmUpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuYXNzZXJ0SW5zdGFuY2VPZih0aGlzLCBcIlBvbHlsaW5lXCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnRpdGxlID0gbnVsbDtcclxuXHRcdFxyXG5cdFx0V1BHTVpBLk1hcE9iamVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuUG9seWxpbmUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTWFwT2JqZWN0LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLlBvbHlsaW5lLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5Qb2x5bGluZTtcclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBjb250cnVjdG9yIHRvIGJlIHVzZWQgYnkgY3JlYXRlSW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgc2VsZWN0ZWQgbWFwcyBlbmdpbmUuXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuUG9seWxpbmVcclxuXHQgKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIGFwcHJvcHJpYXRlIGNvbnRydWN0b3JcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9seWxpbmUuZ2V0Q29uc3RydWN0b3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdHJldHVybiBXUEdNWkEuT0xQb2x5bGluZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5Hb29nbGVQb2x5bGluZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIG1hcCwgPHN0cm9uZz5wbGVhc2UgPGVtPmFsd2F5czwvZW0+IHVzZSB0aGlzIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGNhbGxpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5PC9zdHJvbmc+LlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLlBvbHlsaW5lXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIE9wdGlvbnMgdG8gYXBwbHkgdG8gdGhpcyBwb2x5bGluZS5cclxuXHQgKiBAcGFyYW0ge29iamVjdH0gW2VuZ2luZVBvbHlsaW5lXSBBbiBlbmdpbmUgcG9seWxpbmUsIHBhc3NlZCBmcm9tIHRoZSBkcmF3aW5nIG1hbmFnZXIuIFVzZWQgd2hlbiBhIHBvbHlsaW5lIGhhcyBiZWVuIGNyZWF0ZWQgYnkgYSBkcmF3aW5nIG1hbmFnZXIuXHJcblx0ICogQHJldHVybnMge1dQR01aQS5Qb2x5bGluZX0gQW4gaW5zdGFuY2Ugb2YgV1BHTVpBLlBvbHlsaW5lXHJcblx0ICovXHJcblx0V1BHTVpBLlBvbHlsaW5lLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24ocm93LCBlbmdpbmVPYmplY3QpXHJcblx0e1xyXG5cdFx0dmFyIGNvbnN0cnVjdG9yID0gV1BHTVpBLlBvbHlsaW5lLmdldENvbnN0cnVjdG9yKCk7XHJcblx0XHRyZXR1cm4gbmV3IGNvbnN0cnVjdG9yKHJvdywgZW5naW5lT2JqZWN0KTtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogR2V0cyB0aGUgcG9pbnRzIG9uIHRoaXMgcG9seWxpbmVzXHJcblx0ICogQHJldHVybiB7YXJyYXl9IEFuIGFycmF5IG9mIExhdExuZyBsaXRlcmFsc1xyXG5cdCAqL1xyXG5cdFdQR01aQS5Qb2x5bGluZS5wcm90b3R5cGUuZ2V0UG9pbnRzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLnRvSlNPTigpLnBvaW50cztcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhpcyBwb2x5bGluZSwgZm9yIHNlcmlhbGl6YXRpb25cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Qb2x5bGluZVxyXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IEEgSlNPTiBvYmplY3QgcmVwcmVzZW50aW5nIHRoaXMgcG9seWxpbmVcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9seWxpbmUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gV1BHTVpBLk1hcE9iamVjdC5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHJlc3VsdC50aXRsZSA9IHRoaXMudGl0bGU7XHJcblx0XHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG59KTsiXSwiZmlsZSI6InBvbHlsaW5lLmpzIn0=
