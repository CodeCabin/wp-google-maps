/**
 * @namespace WPGMZA
 * @module StoreLocator
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	WPGMZA.StoreLocator = function(map, element)
	{
		var self = this;
		
		WPGMZA.EventDispatcher.call(this);
		
		this._center = null;
		
		this.map = map;
		this.element = element;
		this.element.wpgmzaStoreLocator = this;
		
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		$(element).find(".wpgmza-not-found-msg").hide();
		
		// Address input
		this.addressInput = WPGMZA.AddressInput.createInstance( $(element).find("input.wpgmza-address")[0], map );
		
		// TODO: This will be moved into this module instead of listening to the map event
		this.map.on("storelocatorgeocodecomplete", function(event) {
			self.onGeocodeComplete(event);
		});
		
		this.map.on("init", function(event) {
			
			self.map.markerFilter.on("filteringcomplete", function(event) {
				self.onFilteringComplete(event);
			});
			
		});
		
		// Catch enter
		$(element).on("keypress", "input", function(event) {
			
			if(event.which != 13)
				return;
			
			// NB: Legacy compatibilty. Do not merge this into 8.1.0
			searchLocations(self.map.id);
			
			self.onSearch(event);
			
		});

		// Legacy store locator buttons
		$(document.body).on("click", ".wpgmza_sl_search_button_" + map.id + ", [data-map-id='" + map.id + "'] .wpgmza_sl_search_button", function(event) {
			self.onSearch(event);
		});
		
		$(document.body).on("click", ".wpgmza_sl_reset_button_" + map.id + ", [data-map-id='" + map.id + "'] .wpgmza_sl_reset_button_div", function(event) {
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
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "distanceUnits", {
	
		"get": function() {
			if(this.map.settings.store_locator_distance == 1)
				return WPGMZA.Distance.MILES;
			
			return WPGMZA.Distance.KILOMETERS;
		}
	
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "radius", {
		"get": function() {
			return $("#radiusSelect, #radiusSelect_" + this.map.id).val();
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "center", {
		"get": function() {
			return this._center;
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "bounds", {
		"get": function() {
			return this._bounds;
		}
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "marker", {
		
		"get": function() {
			
			if(this.map.settings.store_locator_bounce != 1)
				return null;
			
			if(this._marker)
				return this._marker;
			
			var options = {
				visible: false
			};
			
			this._marker = WPGMZA.Marker.createInstance(options);
			this._marker.disableInfoWindow = true;
			this._marker.isFilterable = false;
			
			this._marker.setAnimation(WPGMZA.Marker.ANIMATION_BOUNCE);
			
			return this._marker;
			
		}
		
	});
	
	Object.defineProperty(WPGMZA.StoreLocator.prototype, "circle", {
		
		"get": function() {
			
			if(this._circle)
				return this._circle;
			
			if(this.map.settings.wpgmza_store_locator_radius_style == "modern" && !WPGMZA.isDeviceiOS())
			{
				this._circle = WPGMZA.ModernStoreLocatorCircle.createInstance(this.map.id);
				this._circle.settings.color = this.circleStrokeColor;
			}
			else
			{
				this._circle = WPGMZA.Circle.createInstance({
					strokeColor:	"#ff0000",
					strokeOpacity:	"0.25",
					strokeWeight:	2,
					fillColor:		"#ff0000",
					fillOpacity:	"0.15",
					visible:		false,
					clickable:      false
				});
			}
			
			return this._circle;
			
		}
		
	});
	
	WPGMZA.StoreLocator.prototype.onGeocodeComplete = function(event)
	{
		if(!event.results || !event.results.length)
		{
			this._center = null;
			this._bounds = null;

			return;
		}
		else
		{
			this._center = new WPGMZA.LatLng( event.results[0].latLng );
			this._bounds = new WPGMZA.LatLngBounds( event.results[0].bounds );
		}
		
		this.map.markerFilter.update({}, this);
	}
	
	WPGMZA.StoreLocator.prototype.onSearch = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_APPLIED;
	}
	
	WPGMZA.StoreLocator.prototype.onReset = function(event)
	{
		this.state = WPGMZA.StoreLocator.STATE_INITIAL;
		
		this._center = null;
		this._bounds = null;
		
		this.map.markerFilter.update({}, this);
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
		var params = event.filteringParams;
		var marker = this.marker;
		
		if(marker)
			marker.setVisible(false);
		
		// Center point marker
		if(params.center && marker)
		{
			marker.setPosition(params.center);
			marker.setVisible(true);
			
			if(marker.map != this.map)
				this.map.addMarker(marker);
		}
		
		var circle = this.circle;
		
		if(circle)
		{
			var factor = (this.distanceUnits == WPGMZA.Distance.MILES ? WPGMZA.Distance.KILOMETERS_PER_MILE : 1.0);
			
			circle.setVisible(false);
			
			if(params.center && params.radius)
			{
				circle.setRadius(params.radius * factor);
				circle.setCenter(params.center);
				circle.setVisible(true);
				
				if(circle.map != this.map)
					this.map.addCircle(circle);
			}
			
			if(circle instanceof WPGMZA.ModernStoreLocatorCircle)
				circle.settings.radiusString = this.radius;
		}

		// Show / hide not found message
		if(!this.map.hasVisibleMarkers())
			$(this.element).find(".wpgmza-not-found-msg").show();
		else
			$(this.element).find(".wpgmza-not-found-msg").hide();
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzdG9yZS1sb2NhdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIFN0b3JlTG9jYXRvclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyBldmVudC1kaXNwYXRjaGVyLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IgPSBmdW5jdGlvbihtYXAsIGVsZW1lbnQpXHJcblx0e1xyXG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuRXZlbnREaXNwYXRjaGVyLmNhbGwodGhpcyk7XHJcblx0XHRcclxuXHRcdHRoaXMuX2NlbnRlciA9IG51bGw7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwID0gbWFwO1xyXG5cdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHRcdHRoaXMuZWxlbWVudC53cGdtemFTdG9yZUxvY2F0b3IgPSB0aGlzO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0YXRlID0gV1BHTVpBLlN0b3JlTG9jYXRvci5TVEFURV9JTklUSUFMO1xyXG5cdFx0XHJcblx0XHQkKGVsZW1lbnQpLmZpbmQoXCIud3BnbXphLW5vdC1mb3VuZC1tc2dcIikuaGlkZSgpO1xyXG5cdFx0XHJcblx0XHQvLyBBZGRyZXNzIGlucHV0XHJcblx0XHR0aGlzLmFkZHJlc3NJbnB1dCA9IFdQR01aQS5BZGRyZXNzSW5wdXQuY3JlYXRlSW5zdGFuY2UoICQoZWxlbWVudCkuZmluZChcImlucHV0LndwZ216YS1hZGRyZXNzXCIpWzBdLCBtYXAgKTtcclxuXHRcdFxyXG5cdFx0Ly8gVE9ETzogVGhpcyB3aWxsIGJlIG1vdmVkIGludG8gdGhpcyBtb2R1bGUgaW5zdGVhZCBvZiBsaXN0ZW5pbmcgdG8gdGhlIG1hcCBldmVudFxyXG5cdFx0dGhpcy5tYXAub24oXCJzdG9yZWxvY2F0b3JnZW9jb2RlY29tcGxldGVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbkdlb2NvZGVDb21wbGV0ZShldmVudCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXAub24oXCJpbml0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLm1hcC5tYXJrZXJGaWx0ZXIub24oXCJmaWx0ZXJpbmdjb21wbGV0ZVwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdHNlbGYub25GaWx0ZXJpbmdDb21wbGV0ZShldmVudCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQvLyBDYXRjaCBlbnRlclxyXG5cdFx0JChlbGVtZW50KS5vbihcImtleXByZXNzXCIsIFwiaW5wdXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKGV2ZW50LndoaWNoICE9IDEzKVxyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHJcblx0XHRcdC8vIE5COiBMZWdhY3kgY29tcGF0aWJpbHR5LiBEbyBub3QgbWVyZ2UgdGhpcyBpbnRvIDguMS4wXHJcblx0XHRcdHNlYXJjaExvY2F0aW9ucyhzZWxmLm1hcC5pZCk7XHJcblx0XHRcdFxyXG5cdFx0XHRzZWxmLm9uU2VhcmNoKGV2ZW50KTtcclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBMZWdhY3kgc3RvcmUgbG9jYXRvciBidXR0b25zXHJcblx0XHQkKGRvY3VtZW50LmJvZHkpLm9uKFwiY2xpY2tcIiwgXCIud3BnbXphX3NsX3NlYXJjaF9idXR0b25fXCIgKyBtYXAuaWQgKyBcIiwgW2RhdGEtbWFwLWlkPSdcIiArIG1hcC5pZCArIFwiJ10gLndwZ216YV9zbF9zZWFyY2hfYnV0dG9uXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHNlbGYub25TZWFyY2goZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQoZG9jdW1lbnQuYm9keSkub24oXCJjbGlja1wiLCBcIi53cGdtemFfc2xfcmVzZXRfYnV0dG9uX1wiICsgbWFwLmlkICsgXCIsIFtkYXRhLW1hcC1pZD0nXCIgKyBtYXAuaWQgKyBcIiddIC53cGdtemFfc2xfcmVzZXRfYnV0dG9uX2RpdlwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uUmVzZXQoZXZlbnQpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShXUEdNWkEuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSk7XHJcblx0V1BHTVpBLlN0b3JlTG9jYXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXUEdNWkEuU3RvcmVMb2NhdG9yO1xyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IuU1RBVEVfSU5JVElBTFx0XHQ9IFwiaW5pdGlhbFwiO1xyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IuU1RBVEVfQVBQTElFRFx0XHQ9IFwiYXBwbGllZFwiO1xyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihtYXAsIGVsZW1lbnQpXHJcblx0e1xyXG5cdFx0cmV0dXJuIG5ldyBXUEdNWkEuU3RvcmVMb2NhdG9yKG1hcCwgZWxlbWVudCk7XHJcblx0fVxyXG5cdFxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSwgXCJkaXN0YW5jZVVuaXRzXCIsIHtcclxuXHRcclxuXHRcdFwiZ2V0XCI6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRpZih0aGlzLm1hcC5zZXR0aW5ncy5zdG9yZV9sb2NhdG9yX2Rpc3RhbmNlID09IDEpXHJcblx0XHRcdFx0cmV0dXJuIFdQR01aQS5EaXN0YW5jZS5NSUxFUztcclxuXHRcdFx0XHJcblx0XHRcdHJldHVybiBXUEdNWkEuRGlzdGFuY2UuS0lMT01FVEVSUztcclxuXHRcdH1cclxuXHRcclxuXHR9KTtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlN0b3JlTG9jYXRvci5wcm90b3R5cGUsIFwicmFkaXVzXCIsIHtcclxuXHRcdFwiZ2V0XCI6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gJChcIiNyYWRpdXNTZWxlY3QsICNyYWRpdXNTZWxlY3RfXCIgKyB0aGlzLm1hcC5pZCkudmFsKCk7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLCBcImNlbnRlclwiLCB7XHJcblx0XHRcImdldFwiOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2NlbnRlcjtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoV1BHTVpBLlN0b3JlTG9jYXRvci5wcm90b3R5cGUsIFwiYm91bmRzXCIsIHtcclxuXHRcdFwiZ2V0XCI6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYm91bmRzO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdFxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSwgXCJtYXJrZXJcIiwge1xyXG5cdFx0XHJcblx0XHRcImdldFwiOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHRoaXMubWFwLnNldHRpbmdzLnN0b3JlX2xvY2F0b3JfYm91bmNlICE9IDEpXHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdFxyXG5cdFx0XHRpZih0aGlzLl9tYXJrZXIpXHJcblx0XHRcdFx0cmV0dXJuIHRoaXMuX21hcmtlcjtcclxuXHRcdFx0XHJcblx0XHRcdHZhciBvcHRpb25zID0ge1xyXG5cdFx0XHRcdHZpc2libGU6IGZhbHNlXHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLl9tYXJrZXIgPSBXUEdNWkEuTWFya2VyLmNyZWF0ZUluc3RhbmNlKG9wdGlvbnMpO1xyXG5cdFx0XHR0aGlzLl9tYXJrZXIuZGlzYWJsZUluZm9XaW5kb3cgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLl9tYXJrZXIuaXNGaWx0ZXJhYmxlID0gZmFsc2U7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLl9tYXJrZXIuc2V0QW5pbWF0aW9uKFdQR01aQS5NYXJrZXIuQU5JTUFUSU9OX0JPVU5DRSk7XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gdGhpcy5fbWFya2VyO1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXUEdNWkEuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSwgXCJjaXJjbGVcIiwge1xyXG5cdFx0XHJcblx0XHRcImdldFwiOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHRoaXMuX2NpcmNsZSlcclxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fY2lyY2xlO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYodGhpcy5tYXAuc2V0dGluZ3Mud3BnbXphX3N0b3JlX2xvY2F0b3JfcmFkaXVzX3N0eWxlID09IFwibW9kZXJuXCIgJiYgIVdQR01aQS5pc0RldmljZWlPUygpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhpcy5fY2lyY2xlID0gV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZS5jcmVhdGVJbnN0YW5jZSh0aGlzLm1hcC5pZCk7XHJcblx0XHRcdFx0dGhpcy5fY2lyY2xlLnNldHRpbmdzLmNvbG9yID0gdGhpcy5jaXJjbGVTdHJva2VDb2xvcjtcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNlXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aGlzLl9jaXJjbGUgPSBXUEdNWkEuQ2lyY2xlLmNyZWF0ZUluc3RhbmNlKHtcclxuXHRcdFx0XHRcdHN0cm9rZUNvbG9yOlx0XCIjZmYwMDAwXCIsXHJcblx0XHRcdFx0XHRzdHJva2VPcGFjaXR5Olx0XCIwLjI1XCIsXHJcblx0XHRcdFx0XHRzdHJva2VXZWlnaHQ6XHQyLFxyXG5cdFx0XHRcdFx0ZmlsbENvbG9yOlx0XHRcIiNmZjAwMDBcIixcclxuXHRcdFx0XHRcdGZpbGxPcGFjaXR5Olx0XCIwLjE1XCIsXHJcblx0XHRcdFx0XHR2aXNpYmxlOlx0XHRmYWxzZSxcclxuXHRcdFx0XHRcdGNsaWNrYWJsZTogICAgICBmYWxzZVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRyZXR1cm4gdGhpcy5fY2lyY2xlO1xyXG5cdFx0XHRcclxuXHRcdH1cclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uR2VvY29kZUNvbXBsZXRlID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0aWYoIWV2ZW50LnJlc3VsdHMgfHwgIWV2ZW50LnJlc3VsdHMubGVuZ3RoKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLl9jZW50ZXIgPSBudWxsO1xyXG5cdFx0XHR0aGlzLl9ib3VuZHMgPSBudWxsO1xyXG5cclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLl9jZW50ZXIgPSBuZXcgV1BHTVpBLkxhdExuZyggZXZlbnQucmVzdWx0c1swXS5sYXRMbmcgKTtcclxuXHRcdFx0dGhpcy5fYm91bmRzID0gbmV3IFdQR01aQS5MYXRMbmdCb3VuZHMoIGV2ZW50LnJlc3VsdHNbMF0uYm91bmRzICk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHRoaXMubWFwLm1hcmtlckZpbHRlci51cGRhdGUoe30sIHRoaXMpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuU3RvcmVMb2NhdG9yLnByb3RvdHlwZS5vblNlYXJjaCA9IGZ1bmN0aW9uKGV2ZW50KVxyXG5cdHtcclxuXHRcdHRoaXMuc3RhdGUgPSBXUEdNWkEuU3RvcmVMb2NhdG9yLlNUQVRFX0FQUExJRUQ7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uUmVzZXQgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR0aGlzLnN0YXRlID0gV1BHTVpBLlN0b3JlTG9jYXRvci5TVEFURV9JTklUSUFMO1xyXG5cdFx0XHJcblx0XHR0aGlzLl9jZW50ZXIgPSBudWxsO1xyXG5cdFx0dGhpcy5fYm91bmRzID0gbnVsbDtcclxuXHRcdFxyXG5cdFx0dGhpcy5tYXAubWFya2VyRmlsdGVyLnVwZGF0ZSh7fSwgdGhpcyk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLmdldEZpbHRlcmluZ1BhcmFtZXRlcnMgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0aWYoIXRoaXMuY2VudGVyKVxyXG5cdFx0XHRyZXR1cm4ge307XHJcblx0XHRcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGNlbnRlcjogdGhpcy5jZW50ZXIsXHJcblx0XHRcdHJhZGl1czogdGhpcy5yYWRpdXNcclxuXHRcdH07XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uRmlsdGVyaW5nQ29tcGxldGUgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR2YXIgcGFyYW1zID0gZXZlbnQuZmlsdGVyaW5nUGFyYW1zO1xyXG5cdFx0dmFyIG1hcmtlciA9IHRoaXMubWFya2VyO1xyXG5cdFx0XHJcblx0XHRpZihtYXJrZXIpXHJcblx0XHRcdG1hcmtlci5zZXRWaXNpYmxlKGZhbHNlKTtcclxuXHRcdFxyXG5cdFx0Ly8gQ2VudGVyIHBvaW50IG1hcmtlclxyXG5cdFx0aWYocGFyYW1zLmNlbnRlciAmJiBtYXJrZXIpXHJcblx0XHR7XHJcblx0XHRcdG1hcmtlci5zZXRQb3NpdGlvbihwYXJhbXMuY2VudGVyKTtcclxuXHRcdFx0bWFya2VyLnNldFZpc2libGUodHJ1ZSk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihtYXJrZXIubWFwICE9IHRoaXMubWFwKVxyXG5cdFx0XHRcdHRoaXMubWFwLmFkZE1hcmtlcihtYXJrZXIpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgY2lyY2xlID0gdGhpcy5jaXJjbGU7XHJcblx0XHRcclxuXHRcdGlmKGNpcmNsZSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIGZhY3RvciA9ICh0aGlzLmRpc3RhbmNlVW5pdHMgPT0gV1BHTVpBLkRpc3RhbmNlLk1JTEVTID8gV1BHTVpBLkRpc3RhbmNlLktJTE9NRVRFUlNfUEVSX01JTEUgOiAxLjApO1xyXG5cdFx0XHRcclxuXHRcdFx0Y2lyY2xlLnNldFZpc2libGUoZmFsc2UpO1xyXG5cdFx0XHRcclxuXHRcdFx0aWYocGFyYW1zLmNlbnRlciAmJiBwYXJhbXMucmFkaXVzKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y2lyY2xlLnNldFJhZGl1cyhwYXJhbXMucmFkaXVzICogZmFjdG9yKTtcclxuXHRcdFx0XHRjaXJjbGUuc2V0Q2VudGVyKHBhcmFtcy5jZW50ZXIpO1xyXG5cdFx0XHRcdGNpcmNsZS5zZXRWaXNpYmxlKHRydWUpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGNpcmNsZS5tYXAgIT0gdGhpcy5tYXApXHJcblx0XHRcdFx0XHR0aGlzLm1hcC5hZGRDaXJjbGUoY2lyY2xlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoY2lyY2xlIGluc3RhbmNlb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvckNpcmNsZSlcclxuXHRcdFx0XHRjaXJjbGUuc2V0dGluZ3MucmFkaXVzU3RyaW5nID0gdGhpcy5yYWRpdXM7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU2hvdyAvIGhpZGUgbm90IGZvdW5kIG1lc3NhZ2VcclxuXHRcdGlmKCF0aGlzLm1hcC5oYXNWaXNpYmxlTWFya2VycygpKVxyXG5cdFx0XHQkKHRoaXMuZWxlbWVudCkuZmluZChcIi53cGdtemEtbm90LWZvdW5kLW1zZ1wiKS5zaG93KCk7XHJcblx0XHRlbHNlXHJcblx0XHRcdCQodGhpcy5lbGVtZW50KS5maW5kKFwiLndwZ216YS1ub3QtZm91bmQtbXNnXCIpLmhpZGUoKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoic3RvcmUtbG9jYXRvci5qcyJ9
