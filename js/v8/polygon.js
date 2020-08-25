/**
 * @namespace WPGMZA
 * @module Polygon
 * @requires WPGMZA.MapObject
 * @gulp-requires map-object.js
 */
jQuery(function($) {
	
	/**
	 * Base class for polygons. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Polygon
	 * @constructor WPGMZA.Polygon
	 * @memberof WPGMZA
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @augments WPGMZA.MapObject
	 */
	WPGMZA.Polygon = function(row, enginePolygon)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Polygon");
		
		this.paths = null;
		this.title = null;
		this.name = null;
		this.link = null;
		
		WPGMZA.MapObject.apply(this, arguments);
	}
	
	WPGMZA.Polygon.prototype = Object.create(WPGMZA.MapObject.prototype);
	WPGMZA.Polygon.prototype.constructor = WPGMZA.Polygon;
	
	/**
	 * Returns the contructor to be used by createInstance, depending on the selected maps engine.
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @return {function} The appropriate contructor
	 */
	WPGMZA.Polygon.getConstructor = function()
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				if(WPGMZA.isProVersion())
					return WPGMZA.OLProPolygon;
				return WPGMZA.OLPolygon;
				break;
			
			default:
				if(WPGMZA.isProVersion())
					return WPGMZA.GoogleProPolygon;
				return WPGMZA.GooglePolygon;
				break;
		}
	}
	
	/**
	 * Creates an instance of a map, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @param {object} [row] Options to apply to this polygon.
	 * @param {object} [enginePolygon] An engine polygon, passed from the drawing manager. Used when a polygon has been created by a drawing manager.
	 * @returns {WPGMZA.Polygon} An instance of WPGMZA.Polygon
	 */
	WPGMZA.Polygon.createInstance = function(row, engineObject)
	{
		var constructor = WPGMZA.Polygon.getConstructor();
		return new constructor(row, engineObject);
	}
	
	/**
	 * Returns a JSON representation of this polygon, for serialization
	 * @method
	 * @memberof WPGMZA.Polygon
	 * @returns {object} A JSON object representing this polygon
	 */
	WPGMZA.Polygon.prototype.toJSON = function()
	{
		var result = WPGMZA.MapObject.prototype.toJSON.call(this);
		
		$.extend(result, {
			name:		this.name,
			title:		this.title,
			link:		this.link,
		});
	
		return result;
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb2x5Z29uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFBvbHlnb25cclxuICogQHJlcXVpcmVzIFdQR01aQS5NYXBPYmplY3RcclxuICogQGd1bHAtcmVxdWlyZXMgbWFwLW9iamVjdC5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBCYXNlIGNsYXNzIGZvciBwb2x5Z29ucy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLlBvbHlnb25cclxuXHQgKiBAY29uc3RydWN0b3IgV1BHTVpBLlBvbHlnb25cclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIE9wdGlvbnMgdG8gYXBwbHkgdG8gdGhpcyBwb2x5Z29uLlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbZW5naW5lUG9seWdvbl0gQW4gZW5naW5lIHBvbHlnb24sIHBhc3NlZCBmcm9tIHRoZSBkcmF3aW5nIG1hbmFnZXIuIFVzZWQgd2hlbiBhIHBvbHlnb24gaGFzIGJlZW4gY3JlYXRlZCBieSBhIGRyYXdpbmcgbWFuYWdlci5cclxuXHQgKiBAYXVnbWVudHMgV1BHTVpBLk1hcE9iamVjdFxyXG5cdCAqL1xyXG5cdFdQR01aQS5Qb2x5Z29uID0gZnVuY3Rpb24ocm93LCBlbmdpbmVQb2x5Z29uKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdFxyXG5cdFx0V1BHTVpBLmFzc2VydEluc3RhbmNlT2YodGhpcywgXCJQb2x5Z29uXCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnBhdGhzID0gbnVsbDtcclxuXHRcdHRoaXMudGl0bGUgPSBudWxsO1xyXG5cdFx0dGhpcy5uYW1lID0gbnVsbDtcclxuXHRcdHRoaXMubGluayA9IG51bGw7XHJcblx0XHRcclxuXHRcdFdQR01aQS5NYXBPYmplY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLlBvbHlnb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuTWFwT2JqZWN0LnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLlBvbHlnb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLlBvbHlnb247XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0aGUgY29udHJ1Y3RvciB0byBiZSB1c2VkIGJ5IGNyZWF0ZUluc3RhbmNlLCBkZXBlbmRpbmcgb24gdGhlIHNlbGVjdGVkIG1hcHMgZW5naW5lLlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLlBvbHlnb25cclxuXHQgKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIGFwcHJvcHJpYXRlIGNvbnRydWN0b3JcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9seWdvbi5nZXRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRzd2l0Y2goV1BHTVpBLnNldHRpbmdzLmVuZ2luZSlcclxuXHRcdHtcclxuXHRcdFx0Y2FzZSBcIm9wZW4tbGF5ZXJzXCI6XHJcblx0XHRcdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTFByb1BvbHlnb247XHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5PTFBvbHlnb247XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFxyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdFx0XHRcdHJldHVybiBXUEdNWkEuR29vZ2xlUHJvUG9seWdvbjtcclxuXHRcdFx0XHRyZXR1cm4gV1BHTVpBLkdvb2dsZVBvbHlnb247XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2YgYSBtYXAsIDxzdHJvbmc+cGxlYXNlIDxlbT5hbHdheXM8L2VtPiB1c2UgdGhpcyBmdW5jdGlvbiByYXRoZXIgdGhhbiBjYWxsaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseTwvc3Ryb25nPi5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Qb2x5Z29uXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtyb3ddIE9wdGlvbnMgdG8gYXBwbHkgdG8gdGhpcyBwb2x5Z29uLlxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbZW5naW5lUG9seWdvbl0gQW4gZW5naW5lIHBvbHlnb24sIHBhc3NlZCBmcm9tIHRoZSBkcmF3aW5nIG1hbmFnZXIuIFVzZWQgd2hlbiBhIHBvbHlnb24gaGFzIGJlZW4gY3JlYXRlZCBieSBhIGRyYXdpbmcgbWFuYWdlci5cclxuXHQgKiBAcmV0dXJucyB7V1BHTVpBLlBvbHlnb259IEFuIGluc3RhbmNlIG9mIFdQR01aQS5Qb2x5Z29uXHJcblx0ICovXHJcblx0V1BHTVpBLlBvbHlnb24uY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihyb3csIGVuZ2luZU9iamVjdClcclxuXHR7XHJcblx0XHR2YXIgY29uc3RydWN0b3IgPSBXUEdNWkEuUG9seWdvbi5nZXRDb25zdHJ1Y3RvcigpO1xyXG5cdFx0cmV0dXJuIG5ldyBjb25zdHJ1Y3Rvcihyb3csIGVuZ2luZU9iamVjdCk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFJldHVybnMgYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgcG9seWdvbiwgZm9yIHNlcmlhbGl6YXRpb25cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Qb2x5Z29uXHJcblx0ICogQHJldHVybnMge29iamVjdH0gQSBKU09OIG9iamVjdCByZXByZXNlbnRpbmcgdGhpcyBwb2x5Z29uXHJcblx0ICovXHJcblx0V1BHTVpBLlBvbHlnb24ucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHR2YXIgcmVzdWx0ID0gV1BHTVpBLk1hcE9iamVjdC5wcm90b3R5cGUudG9KU09OLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdCQuZXh0ZW5kKHJlc3VsdCwge1xyXG5cdFx0XHRuYW1lOlx0XHR0aGlzLm5hbWUsXHJcblx0XHRcdHRpdGxlOlx0XHR0aGlzLnRpdGxlLFxyXG5cdFx0XHRsaW5rOlx0XHR0aGlzLmxpbmssXHJcblx0XHR9KTtcclxuXHRcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cdFxyXG59KTsiXSwiZmlsZSI6InBvbHlnb24uanMifQ==
