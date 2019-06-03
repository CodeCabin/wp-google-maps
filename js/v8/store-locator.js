/**
 * @namespace WPGMZA
 * @module StoreLocator
 * @requires WPGMZA.EventDispatcher
 */
jQuery(function($) {
	
	WPGMZA.StoreLocator = function(map, element)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this._center = null;
		
		this.map = map;
		this.element = element;
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		// TODO: This will be moved into this module instead of listening to the map event
		this.map.on("storelocatorgeocodecomplete", function(event) {
			self.onGeocodeComplete(event);
		});
		
		this.map.on("init", function(event) {
			
			self.map.markerFilter.on("filteringcomplete", function(event) {
				self.onFilteringComplete(event);
			});
			
		});
		
		// Legacy store locator buttons
		$(document.body).on("click", ".wpgmza_sl_search_button_" + map.id, function(event) {
			self.onSearch(event);
		});
		
		$(document.body).on("click", ".wpgmza_sl_reset_button_" + map.id, function(event) {
			self.onReset(event);
		});
	}
	
	WPGMZA.StoreLocator.prototype = Object.create(WPGMZA.EventDispatcher.prototype);
	WPGMZA.StoreLocator.prototype.constructor = WPGMZA.StoreLocator;
	
	WPGMZA.StoreLocator.STATE_INITIAL		= "initial";
	WPGMZA.StoreLocator.STATE_APPLIED		= "applied";
	
	WPGMZA.StoreLocator.createInstance = function(map, element)
	{
		return new WPGMZA.StoreLocator(map, element);
	}
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "radius", {
		"get": function() {
			return $("#radiusSelect_" + this.map.id).val();
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "center", {
		"get": function() {
			return this._center;
		}
	});
	
	WPGMZA.StoreLocator.prototype.onGeocodeComplete = function(event)
	{
		if(!event.results || !event.results.length)
		{
			this._center = null;
			return;
		}
		else
			this._center = new WPGMZA.LatLng( event.results[0].latLng );
		
		this.map.markerFilter.update();
	}
	
	WPGMZA.StoreLocator.prototype.onSearch = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_APPLIED;
	}
	
	WPGMZA.StoreLocator.prototype.onReset = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		this._center = null;
		
		this.map.markerFilter.update();
	}
	
	WPGMZA.StoreLocator.prototype.getFilteringParameters = function()
	{
		if(!this.center)
			return {};
		
		return {
			center: this.center,
			radius: this.radius
		};
	}
	
	WPGMZA.StoreLocator.prototype.onFilteringComplete = function(event)
	{
		if(event.filteredMarkers.length == 0)
			$(this.element).find(".wpgmza-not-found-msg").show();
		else
			$(this.element).find(".wpgmza-not-found-msg").hide();
	}
	
});