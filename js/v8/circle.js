/**
 * @namespace WPGMZA
 * @module Circle
 * @requires WPGMZA.MapObject
 * @gulp-requires map-object.js
 */
jQuery(function($) {
	
	var Parent = WPGMZA.MapObject;
	
	/**
	 * Base class for circles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.Circle
	 * @constructor WPGMZA.Circle
	 * @memberof WPGMZA
	 * @augments WPGMZA.MapObject
	 * @see WPGMZA.Circle.createInstance
	 */
	WPGMZA.Circle = function(options, engineCircle)
	{
		var self = this;
		
		WPGMZA.assertInstanceOf(this, "Circle");
		
		this.center = new WPGMZA.LatLng();
		this.radius = 100;
		
		Parent.apply(this, arguments);
	}
	
	WPGMZA.Circle.prototype = Object.create(Parent.prototype);
	WPGMZA.Circle.prototype.constructor = WPGMZA.Circle;
	
	/**
	 * Creates an instance of a circle, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object} options Options for the object (optional)
	 */
	WPGMZA.Circle.createInstance = function(options)
	{
		var constructor;
		
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				constructor = WPGMZA.OLCircle;
				break;
			
			default:
				constructor = WPGMZA.GoogleCircle;
				break;
		}
		
		return new constructor(options);
	}
	
	/**
	 * Gets the circles center
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getCenter = function()
	{
		return this.center.clone();
	}
	
	/**
	 * Sets the circles center
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object|WPGMZA.LatLng} latLng either a literal or as a WPGMZA.LatLng
	 */
	WPGMZA.Circle.prototype.setCenter = function(latLng)
	{
		this.center.lat = latLng.lat;
		this.center.lng = latLng.lng;
	}
	
	/**
	 * Gets the circles radius, in kilometers
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {object|WPGMZA.LatLng} latLng either a literal or as a WPGMZA.LatLng
	 * @returns {WPGMZA.LatLng}
	 */
	WPGMZA.Circle.prototype.getRadius = function()
	{
		return this.radius;
	}
	
	/**
	 * Sets the circles radius, in kilometers
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {number} radius The radius
	 * @returns {void}
	 */
	WPGMZA.Circle.prototype.setRadius = function(radius)
	{
		this.radius = radius;
	}
	
	/**
	 * Returns the map that this circle is being displayed on
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @return {WPGMZA.Map}
	 */
	WPGMZA.Circle.prototype.getMap = function()
	{
		return this.map;
	}
	
	/**
	 * Puts this circle on a map
	 *
	 * @method
	 * @memberof WPGMZA.Circle
	 * @param {WPGMZA.Map} map The target map
	 * @return {void}
	 */
	WPGMZA.Circle.prototype.setMap = function(map)
	{
		if(this.map)
			this.map.removeCircle(this);
		
		if(map)
			map.addCircle(this);
			
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjaXJjbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgQ2lyY2xlXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuTWFwT2JqZWN0XHJcbiAqIEBndWxwLXJlcXVpcmVzIG1hcC1vYmplY3QuanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0dmFyIFBhcmVudCA9IFdQR01aQS5NYXBPYmplY3Q7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQmFzZSBjbGFzcyBmb3IgY2lyY2xlcy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLkNpcmNsZVxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuQ2lyY2xlXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBhdWdtZW50cyBXUEdNWkEuTWFwT2JqZWN0XHJcblx0ICogQHNlZSBXUEdNWkEuQ2lyY2xlLmNyZWF0ZUluc3RhbmNlXHJcblx0ICovXHJcblx0V1BHTVpBLkNpcmNsZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGVuZ2luZUNpcmNsZSlcclxuXHR7XHJcblx0XHR2YXIgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdFdQR01aQS5hc3NlcnRJbnN0YW5jZU9mKHRoaXMsIFwiQ2lyY2xlXCIpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmNlbnRlciA9IG5ldyBXUEdNWkEuTGF0TG5nKCk7XHJcblx0XHR0aGlzLnJhZGl1cyA9IDEwMDtcclxuXHRcdFxyXG5cdFx0UGFyZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5DaXJjbGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQYXJlbnQucHJvdG90eXBlKTtcclxuXHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5DaXJjbGU7XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBhbiBpbnN0YW5jZSBvZiBhIGNpcmNsZSwgPHN0cm9uZz5wbGVhc2UgPGVtPmFsd2F5czwvZW0+IHVzZSB0aGlzIGZ1bmN0aW9uIHJhdGhlciB0aGFuIGNhbGxpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5PC9zdHJvbmc+LlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkNpcmNsZVxyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIE9wdGlvbnMgZm9yIHRoZSBvYmplY3QgKG9wdGlvbmFsKVxyXG5cdCAqL1xyXG5cdFdQR01aQS5DaXJjbGUuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihvcHRpb25zKVxyXG5cdHtcclxuXHRcdHZhciBjb25zdHJ1Y3RvcjtcclxuXHRcdFxyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdGNvbnN0cnVjdG9yID0gV1BHTVpBLk9MQ2lyY2xlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRjb25zdHJ1Y3RvciA9IFdQR01aQS5Hb29nbGVDaXJjbGU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJldHVybiBuZXcgY29uc3RydWN0b3Iob3B0aW9ucyk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIGNpcmNsZXMgY2VudGVyXHJcblx0ICpcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAcmV0dXJucyB7V1BHTVpBLkxhdExuZ31cclxuXHQgKi9cclxuXHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5nZXRDZW50ZXIgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMuY2VudGVyLmNsb25lKCk7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIFNldHMgdGhlIGNpcmNsZXMgY2VudGVyXHJcblx0ICpcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAcGFyYW0ge29iamVjdHxXUEdNWkEuTGF0TG5nfSBsYXRMbmcgZWl0aGVyIGEgbGl0ZXJhbCBvciBhcyBhIFdQR01aQS5MYXRMbmdcclxuXHQgKi9cclxuXHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5zZXRDZW50ZXIgPSBmdW5jdGlvbihsYXRMbmcpXHJcblx0e1xyXG5cdFx0dGhpcy5jZW50ZXIubGF0ID0gbGF0TG5nLmxhdDtcclxuXHRcdHRoaXMuY2VudGVyLmxuZyA9IGxhdExuZy5sbmc7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdGhlIGNpcmNsZXMgcmFkaXVzLCBpbiBraWxvbWV0ZXJzXHJcblx0ICpcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5DaXJjbGVcclxuXHQgKiBAcGFyYW0ge29iamVjdHxXUEdNWkEuTGF0TG5nfSBsYXRMbmcgZWl0aGVyIGEgbGl0ZXJhbCBvciBhcyBhIFdQR01aQS5MYXRMbmdcclxuXHQgKiBAcmV0dXJucyB7V1BHTVpBLkxhdExuZ31cclxuXHQgKi9cclxuXHRXUEdNWkEuQ2lyY2xlLnByb3RvdHlwZS5nZXRSYWRpdXMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXMucmFkaXVzO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBTZXRzIHRoZSBjaXJjbGVzIHJhZGl1cywgaW4ga2lsb21ldGVyc1xyXG5cdCAqXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyBUaGUgcmFkaXVzXHJcblx0ICogQHJldHVybnMge3ZvaWR9XHJcblx0ICovXHJcblx0V1BHTVpBLkNpcmNsZS5wcm90b3R5cGUuc2V0UmFkaXVzID0gZnVuY3Rpb24ocmFkaXVzKVxyXG5cdHtcclxuXHRcdHRoaXMucmFkaXVzID0gcmFkaXVzO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBSZXR1cm5zIHRoZSBtYXAgdGhhdCB0aGlzIGNpcmNsZSBpcyBiZWluZyBkaXNwbGF5ZWQgb25cclxuXHQgKlxyXG5cdCAqIEBtZXRob2RcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBLkNpcmNsZVxyXG5cdCAqIEByZXR1cm4ge1dQR01aQS5NYXB9XHJcblx0ICovXHJcblx0V1BHTVpBLkNpcmNsZS5wcm90b3R5cGUuZ2V0TWFwID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLm1hcDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUHV0cyB0aGlzIGNpcmNsZSBvbiBhIG1hcFxyXG5cdCAqXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuQ2lyY2xlXHJcblx0ICogQHBhcmFtIHtXUEdNWkEuTWFwfSBtYXAgVGhlIHRhcmdldCBtYXBcclxuXHQgKiBAcmV0dXJuIHt2b2lkfVxyXG5cdCAqL1xyXG5cdFdQR01aQS5DaXJjbGUucHJvdG90eXBlLnNldE1hcCA9IGZ1bmN0aW9uKG1hcClcclxuXHR7XHJcblx0XHRpZih0aGlzLm1hcClcclxuXHRcdFx0dGhpcy5tYXAucmVtb3ZlQ2lyY2xlKHRoaXMpO1xyXG5cdFx0XHJcblx0XHRpZihtYXApXHJcblx0XHRcdG1hcC5hZGRDaXJjbGUodGhpcyk7XHJcblx0XHRcdFxyXG5cdH1cclxuXHRcclxufSk7Il0sImZpbGUiOiJjaXJjbGUuanMifQ==
