/**
 * @namespace WPGMZA
 * @module LatLngBounds
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * This class represents latitude and longitude bounds as a rectangular area.
	 * NB: This class is not fully implemented
	 * @class WPGMZA.LatLngBounds
	 * @constructor WPGMZA.LatLngBounds
	 * @memberof WPGMZA
	 */
	WPGMZA.LatLngBounds = function(southWest, northEast)
	{
		//console.log("Created bounds", southWest, northEast);
		
		if(southWest instanceof WPGMZA.LatLngBounds)
		{
			var other = southWest;
			this.south = other.south;
			this.north = other.north;
			this.west = other.west;
			this.east = other.east;
		}
		else if(southWest && northEast)
		{
			// TODO: Add checks and errors
			this.south = southWest.lat;
			this.north = northEast.lat;
			this.west = southWest.lng;
			this.east = northEast.lng;
		}
	}
	
	WPGMZA.LatLngBounds.fromGoogleLatLngBounds = function(googleLatLngBounds)
	{
		if(!(googleLatLngBounds instanceof google.maps.LatLngBounds))
			throw new Error("Argument must be an instance of google.maps.LatLngBounds");
		
		var result = new WPGMZA.LatLngBounds();
		var southWest = googleLatLngBounds.getSouthWest();
		var northEast = googleLatLngBounds.getNorthEast();
		
		result.north = northEast.lat();
		result.south = southWest.lat();
		result.west = southWest.lng();
		result.east = northEast.lng();
		
		return result;
	}
	
	WPGMZA.LatLngBounds.fromGoogleLatLngBoundsLiteral = function(obj)
	{
		var result = new WPGMZA.LatLngBounds();
		
		var southWest = obj.southwest;
		var northEast = obj.northeast;
		
		result.north = northEast.lat;
		result.south = southWest.lat;
		result.west = southWest.lng;
		result.east = northEast.lng;
		
		return result;
	}
	
	/**
	 * Returns true if this object is in it's initial state (eg no points specified to gather bounds from)
	 * @method
	 * @memberof WPGMZA.LatLngBounds
	 * @return {bool} True if the object is in it's initial state
	 */
	WPGMZA.LatLngBounds.prototype.isInInitialState = function()
	{
		return (this.north == undefined && this.south == undefined && this.west == undefined && this.east == undefined);
	}
	
	/**
	 * Extends this bounds object to encompass the given latitude and longitude coordinates
	 * @method
	 * @memberof WPGMZA.LatLngBounds
	 * @param {object|WPGMZA.LatLng} latLng either a LatLng literal or an instance of WPGMZA.LatLng
	 */
	WPGMZA.LatLngBounds.prototype.extend = function(latLng)
	{
		if(!(latLng instanceof WPGMZA.LatLng))
			latLng = new WPGMZA.LatLng(latLng);
		
		//console.log("Expanding bounds to " + latLng.toString());
		
		if(this.isInInitialState())
		{
			this.north = this.south = latLng.lat;
			this.west = this.east = latLng.lng;
			return;
		}
		
		if(latLng.lat < this.north)
			this.north = latLng.lat;
		
		if(latLng.lat > this.south)
			this.south = latLng.lat;
		
		if(latLng.lng < this.west)
			this.west = latLng.lng;
		
		if(latLng.lng > this.east)
			this.east = latLng.lng;
	}
	
	WPGMZA.LatLngBounds.prototype.extendByPixelMargin = function(map, x, arg)
	{
		var y = x;
		
		if(!(map instanceof WPGMZA.Map))
			throw new Error("First argument must be an instance of WPGMZA.Map");
		
		if(this.isInInitialState())
			throw new Error("Cannot extend by pixels in initial state");
		
		if(arguments.length >= 3)
			y = arg;
		
		var southWest = new WPGMZA.LatLng(this.south, this.west);
		var northEast = new WPGMZA.LatLng(this.north, this.east);
		
		southWest = map.latLngToPixels(southWest);
		northEast = map.latLngToPixels(northEast);
		
		southWest.x -= x;
		southWest.y += y;
		
		northEast.x += x;
		northEast.y -= y;
		
		southWest = map.pixelsToLatLng(southWest.x, southWest.y);
		northEast = map.pixelsToLatLng(northEast.x, northEast.y);
		
		var temp = this.toString();
		
		this.north = northEast.lat;
		this.south = southWest.lat;
		this.west = southWest.lng;
		this.east = northEast.lng;
		
		// console.log("Extended", temp, "to", this.toString());
	}
	
	WPGMZA.LatLngBounds.prototype.contains = function(latLng)
	{
		//console.log("Checking if latLng ", latLng, " is within bounds " + this.toString());
		
		if(!(latLng instanceof WPGMZA.LatLng))
			throw new Error("Argument must be an instance of WPGMZA.LatLng");
		
		if(latLng.lat < Math.min(this.north, this.south))
			return false;
		
		if(latLng.lat > Math.max(this.north, this.south))
			return false;
		
		if(this.west < this.east)
			return (latLng.lng >= this.west && latLng.lng <= this.east);
		
		return (latLng.lng <= this.west || latLng.lng >= this.east);
	}
	
	WPGMZA.LatLngBounds.prototype.toString = function()
	{
		return this.north + "N " + this.south + "S " + this.west + "W " + this.east + "E";
	}
	
	WPGMZA.LatLngBounds.prototype.toLiteral = function()
	{
		return {
			north: this.north,
			south: this.south,
			west: this.west,
			east: this.east
		};
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsYXRsbmdib3VuZHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTGF0TG5nQm91bmRzXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgbGF0aXR1ZGUgYW5kIGxvbmdpdHVkZSBib3VuZHMgYXMgYSByZWN0YW5ndWxhciBhcmVhLlxyXG5cdCAqIE5COiBUaGlzIGNsYXNzIGlzIG5vdCBmdWxseSBpbXBsZW1lbnRlZFxyXG5cdCAqIEBjbGFzcyBXUEdNWkEuTGF0TG5nQm91bmRzXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5MYXRMbmdCb3VuZHNcclxuXHQgKiBAbWVtYmVyb2YgV1BHTVpBXHJcblx0ICovXHJcblx0V1BHTVpBLkxhdExuZ0JvdW5kcyA9IGZ1bmN0aW9uKHNvdXRoV2VzdCwgbm9ydGhFYXN0KVxyXG5cdHtcclxuXHRcdC8vY29uc29sZS5sb2coXCJDcmVhdGVkIGJvdW5kc1wiLCBzb3V0aFdlc3QsIG5vcnRoRWFzdCk7XHJcblx0XHRcclxuXHRcdGlmKHNvdXRoV2VzdCBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmdCb3VuZHMpXHJcblx0XHR7XHJcblx0XHRcdHZhciBvdGhlciA9IHNvdXRoV2VzdDtcclxuXHRcdFx0dGhpcy5zb3V0aCA9IG90aGVyLnNvdXRoO1xyXG5cdFx0XHR0aGlzLm5vcnRoID0gb3RoZXIubm9ydGg7XHJcblx0XHRcdHRoaXMud2VzdCA9IG90aGVyLndlc3Q7XHJcblx0XHRcdHRoaXMuZWFzdCA9IG90aGVyLmVhc3Q7XHJcblx0XHR9XHJcblx0XHRlbHNlIGlmKHNvdXRoV2VzdCAmJiBub3J0aEVhc3QpXHJcblx0XHR7XHJcblx0XHRcdC8vIFRPRE86IEFkZCBjaGVja3MgYW5kIGVycm9yc1xyXG5cdFx0XHR0aGlzLnNvdXRoID0gc291dGhXZXN0LmxhdDtcclxuXHRcdFx0dGhpcy5ub3J0aCA9IG5vcnRoRWFzdC5sYXQ7XHJcblx0XHRcdHRoaXMud2VzdCA9IHNvdXRoV2VzdC5sbmc7XHJcblx0XHRcdHRoaXMuZWFzdCA9IG5vcnRoRWFzdC5sbmc7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5MYXRMbmdCb3VuZHMuZnJvbUdvb2dsZUxhdExuZ0JvdW5kcyA9IGZ1bmN0aW9uKGdvb2dsZUxhdExuZ0JvdW5kcylcclxuXHR7XHJcblx0XHRpZighKGdvb2dsZUxhdExuZ0JvdW5kcyBpbnN0YW5jZW9mIGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcykpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFyZ3VtZW50IG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzXCIpO1xyXG5cdFx0XHJcblx0XHR2YXIgcmVzdWx0ID0gbmV3IFdQR01aQS5MYXRMbmdCb3VuZHMoKTtcclxuXHRcdHZhciBzb3V0aFdlc3QgPSBnb29nbGVMYXRMbmdCb3VuZHMuZ2V0U291dGhXZXN0KCk7XHJcblx0XHR2YXIgbm9ydGhFYXN0ID0gZ29vZ2xlTGF0TG5nQm91bmRzLmdldE5vcnRoRWFzdCgpO1xyXG5cdFx0XHJcblx0XHRyZXN1bHQubm9ydGggPSBub3J0aEVhc3QubGF0KCk7XHJcblx0XHRyZXN1bHQuc291dGggPSBzb3V0aFdlc3QubGF0KCk7XHJcblx0XHRyZXN1bHQud2VzdCA9IHNvdXRoV2VzdC5sbmcoKTtcclxuXHRcdHJlc3VsdC5lYXN0ID0gbm9ydGhFYXN0LmxuZygpO1xyXG5cdFx0XHJcblx0XHRyZXR1cm4gcmVzdWx0O1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nQm91bmRzLmZyb21Hb29nbGVMYXRMbmdCb3VuZHNMaXRlcmFsID0gZnVuY3Rpb24ob2JqKVxyXG5cdHtcclxuXHRcdHZhciByZXN1bHQgPSBuZXcgV1BHTVpBLkxhdExuZ0JvdW5kcygpO1xyXG5cdFx0XHJcblx0XHR2YXIgc291dGhXZXN0ID0gb2JqLnNvdXRod2VzdDtcclxuXHRcdHZhciBub3J0aEVhc3QgPSBvYmoubm9ydGhlYXN0O1xyXG5cdFx0XHJcblx0XHRyZXN1bHQubm9ydGggPSBub3J0aEVhc3QubGF0O1xyXG5cdFx0cmVzdWx0LnNvdXRoID0gc291dGhXZXN0LmxhdDtcclxuXHRcdHJlc3VsdC53ZXN0ID0gc291dGhXZXN0LmxuZztcclxuXHRcdHJlc3VsdC5lYXN0ID0gbm9ydGhFYXN0LmxuZztcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHJlc3VsdDtcclxuXHR9XHJcblx0XHJcblx0LyoqXHJcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoaXMgb2JqZWN0IGlzIGluIGl0J3MgaW5pdGlhbCBzdGF0ZSAoZWcgbm8gcG9pbnRzIHNwZWNpZmllZCB0byBnYXRoZXIgYm91bmRzIGZyb20pXHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuTGF0TG5nQm91bmRzXHJcblx0ICogQHJldHVybiB7Ym9vbH0gVHJ1ZSBpZiB0aGUgb2JqZWN0IGlzIGluIGl0J3MgaW5pdGlhbCBzdGF0ZVxyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmdCb3VuZHMucHJvdG90eXBlLmlzSW5Jbml0aWFsU3RhdGUgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuICh0aGlzLm5vcnRoID09IHVuZGVmaW5lZCAmJiB0aGlzLnNvdXRoID09IHVuZGVmaW5lZCAmJiB0aGlzLndlc3QgPT0gdW5kZWZpbmVkICYmIHRoaXMuZWFzdCA9PSB1bmRlZmluZWQpO1xyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBFeHRlbmRzIHRoaXMgYm91bmRzIG9iamVjdCB0byBlbmNvbXBhc3MgdGhlIGdpdmVuIGxhdGl0dWRlIGFuZCBsb25naXR1ZGUgY29vcmRpbmF0ZXNcclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5MYXRMbmdCb3VuZHNcclxuXHQgKiBAcGFyYW0ge29iamVjdHxXUEdNWkEuTGF0TG5nfSBsYXRMbmcgZWl0aGVyIGEgTGF0TG5nIGxpdGVyYWwgb3IgYW4gaW5zdGFuY2Ugb2YgV1BHTVpBLkxhdExuZ1xyXG5cdCAqL1xyXG5cdFdQR01aQS5MYXRMbmdCb3VuZHMucHJvdG90eXBlLmV4dGVuZCA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHRpZighKGxhdExuZyBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpKVxyXG5cdFx0XHRsYXRMbmcgPSBuZXcgV1BHTVpBLkxhdExuZyhsYXRMbmcpO1xyXG5cdFx0XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiRXhwYW5kaW5nIGJvdW5kcyB0byBcIiArIGxhdExuZy50b1N0cmluZygpKTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy5pc0luSW5pdGlhbFN0YXRlKCkpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMubm9ydGggPSB0aGlzLnNvdXRoID0gbGF0TG5nLmxhdDtcclxuXHRcdFx0dGhpcy53ZXN0ID0gdGhpcy5lYXN0ID0gbGF0TG5nLmxuZztcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihsYXRMbmcubGF0IDwgdGhpcy5ub3J0aClcclxuXHRcdFx0dGhpcy5ub3J0aCA9IGxhdExuZy5sYXQ7XHJcblx0XHRcclxuXHRcdGlmKGxhdExuZy5sYXQgPiB0aGlzLnNvdXRoKVxyXG5cdFx0XHR0aGlzLnNvdXRoID0gbGF0TG5nLmxhdDtcclxuXHRcdFxyXG5cdFx0aWYobGF0TG5nLmxuZyA8IHRoaXMud2VzdClcclxuXHRcdFx0dGhpcy53ZXN0ID0gbGF0TG5nLmxuZztcclxuXHRcdFxyXG5cdFx0aWYobGF0TG5nLmxuZyA+IHRoaXMuZWFzdClcclxuXHRcdFx0dGhpcy5lYXN0ID0gbGF0TG5nLmxuZztcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLkxhdExuZ0JvdW5kcy5wcm90b3R5cGUuZXh0ZW5kQnlQaXhlbE1hcmdpbiA9IGZ1bmN0aW9uKG1hcCwgeCwgYXJnKVxyXG5cdHtcclxuXHRcdHZhciB5ID0geDtcclxuXHRcdFxyXG5cdFx0aWYoIShtYXAgaW5zdGFuY2VvZiBXUEdNWkEuTWFwKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBXUEdNWkEuTWFwXCIpO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLmlzSW5Jbml0aWFsU3RhdGUoKSlcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGV4dGVuZCBieSBwaXhlbHMgaW4gaW5pdGlhbCBzdGF0ZVwiKTtcclxuXHRcdFxyXG5cdFx0aWYoYXJndW1lbnRzLmxlbmd0aCA+PSAzKVxyXG5cdFx0XHR5ID0gYXJnO1xyXG5cdFx0XHJcblx0XHR2YXIgc291dGhXZXN0ID0gbmV3IFdQR01aQS5MYXRMbmcodGhpcy5zb3V0aCwgdGhpcy53ZXN0KTtcclxuXHRcdHZhciBub3J0aEVhc3QgPSBuZXcgV1BHTVpBLkxhdExuZyh0aGlzLm5vcnRoLCB0aGlzLmVhc3QpO1xyXG5cdFx0XHJcblx0XHRzb3V0aFdlc3QgPSBtYXAubGF0TG5nVG9QaXhlbHMoc291dGhXZXN0KTtcclxuXHRcdG5vcnRoRWFzdCA9IG1hcC5sYXRMbmdUb1BpeGVscyhub3J0aEVhc3QpO1xyXG5cdFx0XHJcblx0XHRzb3V0aFdlc3QueCAtPSB4O1xyXG5cdFx0c291dGhXZXN0LnkgKz0geTtcclxuXHRcdFxyXG5cdFx0bm9ydGhFYXN0LnggKz0geDtcclxuXHRcdG5vcnRoRWFzdC55IC09IHk7XHJcblx0XHRcclxuXHRcdHNvdXRoV2VzdCA9IG1hcC5waXhlbHNUb0xhdExuZyhzb3V0aFdlc3QueCwgc291dGhXZXN0LnkpO1xyXG5cdFx0bm9ydGhFYXN0ID0gbWFwLnBpeGVsc1RvTGF0TG5nKG5vcnRoRWFzdC54LCBub3J0aEVhc3QueSk7XHJcblx0XHRcclxuXHRcdHZhciB0ZW1wID0gdGhpcy50b1N0cmluZygpO1xyXG5cdFx0XHJcblx0XHR0aGlzLm5vcnRoID0gbm9ydGhFYXN0LmxhdDtcclxuXHRcdHRoaXMuc291dGggPSBzb3V0aFdlc3QubGF0O1xyXG5cdFx0dGhpcy53ZXN0ID0gc291dGhXZXN0LmxuZztcclxuXHRcdHRoaXMuZWFzdCA9IG5vcnRoRWFzdC5sbmc7XHJcblx0XHRcclxuXHRcdC8vIGNvbnNvbGUubG9nKFwiRXh0ZW5kZWRcIiwgdGVtcCwgXCJ0b1wiLCB0aGlzLnRvU3RyaW5nKCkpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nQm91bmRzLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKGxhdExuZylcclxuXHR7XHJcblx0XHQvL2NvbnNvbGUubG9nKFwiQ2hlY2tpbmcgaWYgbGF0TG5nIFwiLCBsYXRMbmcsIFwiIGlzIHdpdGhpbiBib3VuZHMgXCIgKyB0aGlzLnRvU3RyaW5nKCkpO1xyXG5cdFx0XHJcblx0XHRpZighKGxhdExuZyBpbnN0YW5jZW9mIFdQR01aQS5MYXRMbmcpKVxyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcmd1bWVudCBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIFdQR01aQS5MYXRMbmdcIik7XHJcblx0XHRcclxuXHRcdGlmKGxhdExuZy5sYXQgPCBNYXRoLm1pbih0aGlzLm5vcnRoLCB0aGlzLnNvdXRoKSlcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHRpZihsYXRMbmcubGF0ID4gTWF0aC5tYXgodGhpcy5ub3J0aCwgdGhpcy5zb3V0aCkpXHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFxyXG5cdFx0aWYodGhpcy53ZXN0IDwgdGhpcy5lYXN0KVxyXG5cdFx0XHRyZXR1cm4gKGxhdExuZy5sbmcgPj0gdGhpcy53ZXN0ICYmIGxhdExuZy5sbmcgPD0gdGhpcy5lYXN0KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIChsYXRMbmcubG5nIDw9IHRoaXMud2VzdCB8fCBsYXRMbmcubG5nID49IHRoaXMuZWFzdCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5MYXRMbmdCb3VuZHMucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLm5vcnRoICsgXCJOIFwiICsgdGhpcy5zb3V0aCArIFwiUyBcIiArIHRoaXMud2VzdCArIFwiVyBcIiArIHRoaXMuZWFzdCArIFwiRVwiO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTGF0TG5nQm91bmRzLnByb3RvdHlwZS50b0xpdGVyYWwgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0bm9ydGg6IHRoaXMubm9ydGgsXHJcblx0XHRcdHNvdXRoOiB0aGlzLnNvdXRoLFxyXG5cdFx0XHR3ZXN0OiB0aGlzLndlc3QsXHJcblx0XHRcdGVhc3Q6IHRoaXMuZWFzdFxyXG5cdFx0fTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibGF0bG5nYm91bmRzLmpzIn0=
