/**
 * @namespace WPGMZA
 * @module MarkerFilter
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	WPGMZA.MarkerFilter = function(map)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this.map = map;
	}
	
	WPGMZA.MarkerFilter.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.MarkerFilter.prototype.constructor = WPGMZA.MarkerFilter;
	
	WPGMZA.MarkerFilter.createInstance = function(map)
	{
		return new WPGMZA.MarkerFilter(map);
	}
	
	WPGMZA.MarkerFilter.prototype.getFilteringParameters = function()
	{
		var params = {map_id: this.map.id};
		
		if(this.map.storeLocator)
			params = $.extend(params, this.map.storeLocator.getFilteringParameters());
		
		return params;
	}
	
	WPGMZA.MarkerFilter.prototype.update = function()
	{
		// NB: This function takes no action. The client can hide and show markers based on radius without putting load on the server. This function is only used by the ProMarkerFilter module
	}
	
	WPGMZA.MarkerFilter.prototype.onFilteringComplete = function(results)
	{
		
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXJrZXItZmlsdGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIE1hcmtlckZpbHRlclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyBldmVudC1kaXNwYXRjaGVyLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5NYXJrZXJGaWx0ZXIgPSBmdW5jdGlvbihtYXApXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuRXZlbnREaXNwYXRjaGVyLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwID0gbWFwO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyRmlsdGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5NYXJrZXJGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLk1hcmtlckZpbHRlcjtcclxuXHRcclxuXHRXUEdNWkEuTWFya2VyRmlsdGVyLmNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24obWFwKVxyXG5cdHtcclxuXHRcdHJldHVybiBuZXcgV1BHTVpBLk1hcmtlckZpbHRlcihtYXApO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyRmlsdGVyLnByb3RvdHlwZS5nZXRGaWx0ZXJpbmdQYXJhbWV0ZXJzID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdHZhciBwYXJhbXMgPSB7bWFwX2lkOiB0aGlzLm1hcC5pZH07XHJcblx0XHRcclxuXHRcdGlmKHRoaXMubWFwLnN0b3JlTG9jYXRvcilcclxuXHRcdFx0cGFyYW1zID0gJC5leHRlbmQocGFyYW1zLCB0aGlzLm1hcC5zdG9yZUxvY2F0b3IuZ2V0RmlsdGVyaW5nUGFyYW1ldGVycygpKTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHBhcmFtcztcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk1hcmtlckZpbHRlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdC8vIE5COiBUaGlzIGZ1bmN0aW9uIHRha2VzIG5vIGFjdGlvbi4gVGhlIGNsaWVudCBjYW4gaGlkZSBhbmQgc2hvdyBtYXJrZXJzIGJhc2VkIG9uIHJhZGl1cyB3aXRob3V0IHB1dHRpbmcgbG9hZCBvbiB0aGUgc2VydmVyLiBUaGlzIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBieSB0aGUgUHJvTWFya2VyRmlsdGVyIG1vZHVsZVxyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuTWFya2VyRmlsdGVyLnByb3RvdHlwZS5vbkZpbHRlcmluZ0NvbXBsZXRlID0gZnVuY3Rpb24ocmVzdWx0cylcclxuXHR7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibWFya2VyLWZpbHRlci5qcyJ9
