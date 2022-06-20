/**
 * @namespace WPGMZA
 * @module MarkerFilter
 * @requires WPGMZA.EventDispatcher
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
	
	WPGMZA.MarkerFilter.prototype.update = function(params, source)
	{
		var self = this;
		
		if(this.updateTimeoutID)
			return;
		
		if(!params)
			params = {};
		
		if(this.xhr)
		{
			this.xhr.abort();
			delete this.xhr;
		}
		
		function dispatchEvent(result)
		{
			var event = new WPGMZA.Event("filteringcomplete");
			
			event.map = self.map;
			event.source = source;
			
			event.filteredMarkers = result;
			event.filteringParams = params;
			
			self.onFilteringComplete(event);
			
			self.trigger(event);
			self.map.trigger(event);
		}
		
		this.updateTimeoutID = setTimeout(function() {
			
			params = $.extend(self.getFilteringParameters(), params);
			
			if(params.center instanceof WPGMZA.LatLng)
				params.center = params.center.toLatLngLiteral();
			
			if(params.hideAll)
			{
				// Hide all markers before a store locator search is done
				dispatchEvent([]);
				delete self.updateTimeoutID;
				return;
			}
			
			self.map.showPreloader(true);
			
			self.xhr = WPGMZA.restAPI.call("/markers", {
				data: {
					fields: ["id"],
					filter: JSON.stringify(params)
				},
				success: function(result, status, xhr) {
					
					self.map.showPreloader(false);
					
					dispatchEvent(result);
					
				},
				useCompressedPathVariable: true
			});
			
			delete self.updateTimeoutID;
			
		}, 0);
	}
	
	WPGMZA.MarkerFilter.prototype.onFilteringComplete = function(event)
	{
		var self = this;
		var map = [];
		
		event.filteredMarkers.forEach(function(data) {
			map[data.id] = true;
		});
		
		this.map.markers.forEach(function(marker) {
			if(!marker.isFilterable)
				return;
				
			var allowByFilter = map[marker.id] ? true : false;
			marker.isFiltered = !allowByFilter;
			marker.setVisible(allowByFilter);
			
		});
	}
	
});