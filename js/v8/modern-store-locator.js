/**
 * @namespace WPGMZA
 * @module ModernStoreLocator
 * @requires WPGMZA
 * @pro-requires WPGMZA.UseMyLocationButton
 * @gulp-requires core.js
 * @gulp-pro-requires use-my-location-button.js
 */
jQuery(function($) {
	
	/**
	 * The new modern look store locator. It takes the elements from the default look and moves them into the map, wrapping in a new element so we can apply new styles. <strong>Please <em>do not</em> call this constructor directly. Always use createInstance rather than instantiating this class directly.</strong> Using createInstance allows this class to be externally extensible.
	 * @class WPGMZA.ModernStoreLocator
	 * @constructor WPGMZA.ModernStoreLocator
	 * @memberof WPGMZA
	 * @param {int} map_id The ID of the map this store locator belongs to
	 */
	WPGMZA.ModernStoreLocator = function(map_id)
	{
		var self = this;
		var original;
		var map = WPGMZA.getMapByID(map_id);
		
		WPGMZA.assertInstanceOf(this, "ModernStoreLocator");
		
		if(WPGMZA.isProVersion())
			original = $(".wpgmza_sl_search_button[mid='" + map_id + "'], .wpgmza_sl_search_button_" + map_id).closest(".wpgmza_sl_main_div");
		else
			original = $(".wpgmza_sl_search_button").closest(".wpgmza_sl_main_div");
		
		if(!original.length)
			return;
		
		// Build / re-arrange elements
		this.element = $("<div class='wpgmza-modern-store-locator'><div class='wpgmza-inner wpgmza-modern-hover-opaque'/></div>")[0];
		
		var inner = $(this.element).find(".wpgmza-inner");
		
		var addressInput;
		if(WPGMZA.isProVersion())
			addressInput = $(original).find(".addressInput");
		else
			addressInput = $(original).find("#addressInput");
		
		if(wpgmaps_localize[map_id].other_settings.store_locator_query_string && wpgmaps_localize[map_id].other_settings.store_locator_query_string.length)
			addressInput.attr("placeholder", wpgmaps_localize[map_id].other_settings.store_locator_query_string);
		
		inner.append(addressInput);
		
		var titleSearch = $(original).find("[id='nameInput_" + map_id + "']");
		if(titleSearch.length)
		{
			var placeholder = wpgmaps_localize[map_id].other_settings.store_locator_name_string;
			if(placeholder && placeholder.length)
				titleSearch.attr("placeholder", placeholder);
			inner.append(titleSearch);
		}
		
		var button;
		if(button = $(original).find("button.wpgmza-use-my-location"))
			inner.append(button);
		
		$(addressInput).on("keydown keypress", function(event) {
			
			if(event.keyCode == 13)
			{
				// NB: Hacky workaround
				self.searchButton.trigger("click");
				
				// NB: Legacy support
				searchLocations(map_id);
				
				map.storeLocator.onSearch(event);
			}
			
		});
		
		$(addressInput).on("input", function(event) {
			
			self.searchButton.show();
			self.resetButton.hide();
			
		});
		
		inner.append($(original).find("select.wpgmza_sl_radius_select"));
		// inner.append($(original).find(".wpgmza_filter_select_" + map_id));
		
		// Buttons
		this.searchButton = $(original).find( ".wpgmza_sl_search_button, .wpgmza_sl_search_button_div" );
		inner.append(this.searchButton);
		
		this.resetButton = $(original).find( ".wpgmza_sl_reset_button_div" );
		inner.append(this.resetButton);
		
		this.resetButton.on("click", function(event) {
			resetLocations(map_id);
		});
		
		this.resetButton.hide();
		
		if(WPGMZA.isProVersion())
		{
			this.searchButton.on("click", function(event) {
				if($("addressInput_" + map_id).val() == 0)
					return;
				
				self.searchButton.hide();
				self.resetButton.show();
				
				map.storeLocator.state = WPGMZA.StoreLocator.STATE_APPLIED;
			});
			this.resetButton.on("click", function(event) {
				self.resetButton.hide();
				self.searchButton.show();
				
				map.storeLocator.state = WPGMZA.StoreLocator.STATE_INITIAL;
			});
		}
		
		// Distance type
		inner.append($("#wpgmza_distance_type_" + map_id));
		
		// Categories
		var container = $(original).find(".wpgmza_cat_checkbox_holder");
		var ul = $(container).children("ul");
		var items = $(container).find("li");
		var numCategories = 0;
		
		//$(items).find("ul").remove();
		//$(ul).append(items);
		
		var icons = [];
		
		items.each(function(index, el) {
			var id = $(el).attr("class").match(/\d+/);
			
			for(var category_id in wpgmza_category_data) {
				
				if(id == category_id) {
					var src = wpgmza_category_data[category_id].image;
					var icon = $('<div class="wpgmza-chip-icon"/>');
					
					icon.css({
						"background-image": "url('" + src + "')",
						"width": $("#wpgmza_cat_checkbox_" + category_id + " + label").height() + "px"
					});
					icons.push(icon);
					
                    if(src != null && src != ""){
					   //$(el).find("label").prepend(icon);
                       $("#wpgmza_cat_checkbox_" + category_id + " + label").prepend(icon);
                    }
					
					numCategories++;
					
					break;
				}
				
			}
		});

        $(this.element).append(container);

		
		if(numCategories) {
			this.optionsButton = $('<span class="wpgmza_store_locator_options_button"><i class="fa fa-list"></i></span>');
			$(this.searchButton).before(this.optionsButton);
		}
		
		setInterval(function() {
			
			icons.forEach(function(icon) {
				var height = $(icon).height();
				$(icon).css({"width": height + "px"});
				$(icon).closest("label").css({"padding-left": height + 8 + "px"});
			});
			
			$(container).css("width", $(self.element).find(".wpgmza-inner").outerWidth() + "px");
			
		}, 1000);
		
		$(this.element).find(".wpgmza_store_locator_options_button").on("click", function(event) {
			
			if(container.hasClass("wpgmza-open"))
				container.removeClass("wpgmza-open");
			else
				container.addClass("wpgmza-open");
			
		});
		
		// Remove original element
		$(original).remove();
		
		// Event listeners
		$(this.element).find("input, select").on("focus", function() {
			$(inner).addClass("active");
		});
		
		$(this.element).find("input, select").on("blur", function() {
			$(inner).removeClass("active");
		});
		
		$(this.element).on("mouseover", "li.wpgmza_cat_checkbox_item_holder", function(event) {
			self.onMouseOverCategory(event);
		});
		
		$(this.element).on("mouseleave", "li.wpgmza_cat_checkbox_item_holder", function(event) {
			self.onMouseLeaveCategory(event);
		});
		
		$(map.markerFilter).on("filteringcomplete", function(event) {

			if(!this.map.hasVisibleMarkers())
			{
				if(this.map.settings.store_locator_not_found_message !=  WPGMZA.localized_strings.zero_results && this.map.settings.store_locator_not_found_message != "")
				{
					alert(this.map.settings.store_locator_not_found_message);

				}
				else{
					alert(WPGMZA.localized_strings.zero_results);
				}
			}

		});


		$('body').on('click', '.wpgmza_store_locator_options_button', function(event) {
			setTimeout(function(){

				if ($('.wpgmza_cat_checkbox_holder').hasClass('wpgmza-open')) {

					var p_cat = $( ".wpgmza_cat_checkbox_holder" );
					var position_cat = p_cat.position().top + p_cat.outerHeight(true) + $('.wpgmza-modern-store-locator').height();
			
					var $p_map = $('.wpgmza_map');  
					var position_map = $p_map.position().top + $p_map.outerHeight(true); 

					var cat_height = position_cat;

					if (cat_height >= position_map) {
			
						$('.wpgmza_cat_ul').css('overflow', 'scroll ');
					
						$('.wpgmza_cat_ul').css('height', '100%');
				
						$('.wpgmza-modern-store-locator').css('height','100%');
						$('.wpgmza_cat_checkbox_holder.wpgmza-open').css({'padding-bottom': '50px', 'height': '100%'});
					}
				}
			}, 500);
		});

	}
	
	/**
	 * Creates an instance of a modern store locator, <strong>please <em>always</em> use this function rather than calling the constructor directly</strong>.
	 * @method
	 * @memberof WPGMZA.ModernStoreLocator
	 * @param {int} map_id The ID of the map this store locator belongs to
	 * @return {WPGMZA.ModernStoreLocator} An instance of WPGMZA.ModernStoreLocator
	 */
	WPGMZA.ModernStoreLocator.createInstance = function(map_id)
	{
		switch(WPGMZA.settings.engine)
		{
			case "open-layers":
				return new WPGMZA.OLModernStoreLocator(map_id);
				break;
			
			default:
				return new WPGMZA.GoogleModernStoreLocator(map_id);
				break;
		}
	}
	
	// TODO: Move these to a Pro module
	WPGMZA.ModernStoreLocator.prototype.onMouseOverCategory = function(event)
	{
		var li = event.currentTarget;
		
		$(li).children("ul.wpgmza_cat_checkbox_item_holder").stop(true, false).fadeIn();
	}
	
	WPGMZA.ModernStoreLocator.prototype.onMouseLeaveCategory = function(event)
	{
		var li = event.currentTarget;
		
		$(li).children("ul.wpgmza_cat_checkbox_item_holder").stop(true, false).fadeOut();
	}
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtb2Rlcm4tc3RvcmUtbG9jYXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBNb2Rlcm5TdG9yZUxvY2F0b3JcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAcHJvLXJlcXVpcmVzIFdQR01aQS5Vc2VNeUxvY2F0aW9uQnV0dG9uXHJcbiAqIEBndWxwLXJlcXVpcmVzIGNvcmUuanNcclxuICogQGd1bHAtcHJvLXJlcXVpcmVzIHVzZS1teS1sb2NhdGlvbi1idXR0b24uanNcclxuICovXHJcbmpRdWVyeShmdW5jdGlvbigkKSB7XHJcblx0XHJcblx0LyoqXHJcblx0ICogVGhlIG5ldyBtb2Rlcm4gbG9vayBzdG9yZSBsb2NhdG9yLiBJdCB0YWtlcyB0aGUgZWxlbWVudHMgZnJvbSB0aGUgZGVmYXVsdCBsb29rIGFuZCBtb3ZlcyB0aGVtIGludG8gdGhlIG1hcCwgd3JhcHBpbmcgaW4gYSBuZXcgZWxlbWVudCBzbyB3ZSBjYW4gYXBwbHkgbmV3IHN0eWxlcy4gPHN0cm9uZz5QbGVhc2UgPGVtPmRvIG5vdDwvZW0+IGNhbGwgdGhpcyBjb25zdHJ1Y3RvciBkaXJlY3RseS4gQWx3YXlzIHVzZSBjcmVhdGVJbnN0YW5jZSByYXRoZXIgdGhhbiBpbnN0YW50aWF0aW5nIHRoaXMgY2xhc3MgZGlyZWN0bHkuPC9zdHJvbmc+IFVzaW5nIGNyZWF0ZUluc3RhbmNlIGFsbG93cyB0aGlzIGNsYXNzIHRvIGJlIGV4dGVybmFsbHkgZXh0ZW5zaWJsZS5cclxuXHQgKiBAY2xhc3MgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvclxyXG5cdCAqIEBjb25zdHJ1Y3RvciBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBwYXJhbSB7aW50fSBtYXBfaWQgVGhlIElEIG9mIHRoZSBtYXAgdGhpcyBzdG9yZSBsb2NhdG9yIGJlbG9uZ3MgdG9cclxuXHQgKi9cclxuXHRXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yID0gZnVuY3Rpb24obWFwX2lkKVxyXG5cdHtcclxuXHRcdHZhciBzZWxmID0gdGhpcztcclxuXHRcdHZhciBvcmlnaW5hbDtcclxuXHRcdHZhciBtYXAgPSBXUEdNWkEuZ2V0TWFwQnlJRChtYXBfaWQpO1xyXG5cdFx0XHJcblx0XHRXUEdNWkEuYXNzZXJ0SW5zdGFuY2VPZih0aGlzLCBcIk1vZGVyblN0b3JlTG9jYXRvclwiKTtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRvcmlnaW5hbCA9ICQoXCIud3BnbXphX3NsX3NlYXJjaF9idXR0b25bbWlkPSdcIiArIG1hcF9pZCArIFwiJ10sIC53cGdtemFfc2xfc2VhcmNoX2J1dHRvbl9cIiArIG1hcF9pZCkuY2xvc2VzdChcIi53cGdtemFfc2xfbWFpbl9kaXZcIik7XHJcblx0XHRlbHNlXHJcblx0XHRcdG9yaWdpbmFsID0gJChcIi53cGdtemFfc2xfc2VhcmNoX2J1dHRvblwiKS5jbG9zZXN0KFwiLndwZ216YV9zbF9tYWluX2RpdlwiKTtcclxuXHRcdFxyXG5cdFx0aWYoIW9yaWdpbmFsLmxlbmd0aClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0XHJcblx0XHQvLyBCdWlsZCAvIHJlLWFycmFuZ2UgZWxlbWVudHNcclxuXHRcdHRoaXMuZWxlbWVudCA9ICQoXCI8ZGl2IGNsYXNzPSd3cGdtemEtbW9kZXJuLXN0b3JlLWxvY2F0b3InPjxkaXYgY2xhc3M9J3dwZ216YS1pbm5lciB3cGdtemEtbW9kZXJuLWhvdmVyLW9wYXF1ZScvPjwvZGl2PlwiKVswXTtcclxuXHRcdFxyXG5cdFx0dmFyIGlubmVyID0gJCh0aGlzLmVsZW1lbnQpLmZpbmQoXCIud3BnbXphLWlubmVyXCIpO1xyXG5cdFx0XHJcblx0XHR2YXIgYWRkcmVzc0lucHV0O1xyXG5cdFx0aWYoV1BHTVpBLmlzUHJvVmVyc2lvbigpKVxyXG5cdFx0XHRhZGRyZXNzSW5wdXQgPSAkKG9yaWdpbmFsKS5maW5kKFwiLmFkZHJlc3NJbnB1dFwiKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0YWRkcmVzc0lucHV0ID0gJChvcmlnaW5hbCkuZmluZChcIiNhZGRyZXNzSW5wdXRcIik7XHJcblx0XHRcclxuXHRcdGlmKHdwZ21hcHNfbG9jYWxpemVbbWFwX2lkXS5vdGhlcl9zZXR0aW5ncy5zdG9yZV9sb2NhdG9yX3F1ZXJ5X3N0cmluZyAmJiB3cGdtYXBzX2xvY2FsaXplW21hcF9pZF0ub3RoZXJfc2V0dGluZ3Muc3RvcmVfbG9jYXRvcl9xdWVyeV9zdHJpbmcubGVuZ3RoKVxyXG5cdFx0XHRhZGRyZXNzSW5wdXQuYXR0cihcInBsYWNlaG9sZGVyXCIsIHdwZ21hcHNfbG9jYWxpemVbbWFwX2lkXS5vdGhlcl9zZXR0aW5ncy5zdG9yZV9sb2NhdG9yX3F1ZXJ5X3N0cmluZyk7XHJcblx0XHRcclxuXHRcdGlubmVyLmFwcGVuZChhZGRyZXNzSW5wdXQpO1xyXG5cdFx0XHJcblx0XHR2YXIgdGl0bGVTZWFyY2ggPSAkKG9yaWdpbmFsKS5maW5kKFwiW2lkPSduYW1lSW5wdXRfXCIgKyBtYXBfaWQgKyBcIiddXCIpO1xyXG5cdFx0aWYodGl0bGVTZWFyY2gubGVuZ3RoKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgcGxhY2Vob2xkZXIgPSB3cGdtYXBzX2xvY2FsaXplW21hcF9pZF0ub3RoZXJfc2V0dGluZ3Muc3RvcmVfbG9jYXRvcl9uYW1lX3N0cmluZztcclxuXHRcdFx0aWYocGxhY2Vob2xkZXIgJiYgcGxhY2Vob2xkZXIubGVuZ3RoKVxyXG5cdFx0XHRcdHRpdGxlU2VhcmNoLmF0dHIoXCJwbGFjZWhvbGRlclwiLCBwbGFjZWhvbGRlcik7XHJcblx0XHRcdGlubmVyLmFwcGVuZCh0aXRsZVNlYXJjaCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBidXR0b247XHJcblx0XHRpZihidXR0b24gPSAkKG9yaWdpbmFsKS5maW5kKFwiYnV0dG9uLndwZ216YS11c2UtbXktbG9jYXRpb25cIikpXHJcblx0XHRcdGlubmVyLmFwcGVuZChidXR0b24pO1xyXG5cdFx0XHJcblx0XHQkKGFkZHJlc3NJbnB1dCkub24oXCJrZXlkb3duIGtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihldmVudC5rZXlDb2RlID09IDEzKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gTkI6IEhhY2t5IHdvcmthcm91bmRcclxuXHRcdFx0XHRzZWxmLnNlYXJjaEJ1dHRvbi50cmlnZ2VyKFwiY2xpY2tcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gTkI6IExlZ2FjeSBzdXBwb3J0XHJcblx0XHRcdFx0c2VhcmNoTG9jYXRpb25zKG1hcF9pZCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bWFwLnN0b3JlTG9jYXRvci5vblNlYXJjaChldmVudCk7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0JChhZGRyZXNzSW5wdXQpLm9uKFwiaW5wdXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHJcblx0XHRcdHNlbGYuc2VhcmNoQnV0dG9uLnNob3coKTtcclxuXHRcdFx0c2VsZi5yZXNldEJ1dHRvbi5oaWRlKCk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdGlubmVyLmFwcGVuZCgkKG9yaWdpbmFsKS5maW5kKFwic2VsZWN0LndwZ216YV9zbF9yYWRpdXNfc2VsZWN0XCIpKTtcclxuXHRcdC8vIGlubmVyLmFwcGVuZCgkKG9yaWdpbmFsKS5maW5kKFwiLndwZ216YV9maWx0ZXJfc2VsZWN0X1wiICsgbWFwX2lkKSk7XHJcblx0XHRcclxuXHRcdC8vIEJ1dHRvbnNcclxuXHRcdHRoaXMuc2VhcmNoQnV0dG9uID0gJChvcmlnaW5hbCkuZmluZCggXCIud3BnbXphX3NsX3NlYXJjaF9idXR0b24sIC53cGdtemFfc2xfc2VhcmNoX2J1dHRvbl9kaXZcIiApO1xyXG5cdFx0aW5uZXIuYXBwZW5kKHRoaXMuc2VhcmNoQnV0dG9uKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZXNldEJ1dHRvbiA9ICQob3JpZ2luYWwpLmZpbmQoIFwiLndwZ216YV9zbF9yZXNldF9idXR0b25fZGl2XCIgKTtcclxuXHRcdGlubmVyLmFwcGVuZCh0aGlzLnJlc2V0QnV0dG9uKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZXNldEJ1dHRvbi5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdHJlc2V0TG9jYXRpb25zKG1hcF9pZCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZXNldEJ1dHRvbi5oaWRlKCk7XHJcblx0XHRcclxuXHRcdGlmKFdQR01aQS5pc1Byb1ZlcnNpb24oKSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy5zZWFyY2hCdXR0b24ub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRcdGlmKCQoXCJhZGRyZXNzSW5wdXRfXCIgKyBtYXBfaWQpLnZhbCgpID09IDApXHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c2VsZi5zZWFyY2hCdXR0b24uaGlkZSgpO1xyXG5cdFx0XHRcdHNlbGYucmVzZXRCdXR0b24uc2hvdygpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG1hcC5zdG9yZUxvY2F0b3Iuc3RhdGUgPSBXUEdNWkEuU3RvcmVMb2NhdG9yLlNUQVRFX0FQUExJRUQ7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHR0aGlzLnJlc2V0QnV0dG9uLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0XHRzZWxmLnJlc2V0QnV0dG9uLmhpZGUoKTtcclxuXHRcdFx0XHRzZWxmLnNlYXJjaEJ1dHRvbi5zaG93KCk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bWFwLnN0b3JlTG9jYXRvci5zdGF0ZSA9IFdQR01aQS5TdG9yZUxvY2F0b3IuU1RBVEVfSU5JVElBTDtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIERpc3RhbmNlIHR5cGVcclxuXHRcdGlubmVyLmFwcGVuZCgkKFwiI3dwZ216YV9kaXN0YW5jZV90eXBlX1wiICsgbWFwX2lkKSk7XHJcblx0XHRcclxuXHRcdC8vIENhdGVnb3JpZXNcclxuXHRcdHZhciBjb250YWluZXIgPSAkKG9yaWdpbmFsKS5maW5kKFwiLndwZ216YV9jYXRfY2hlY2tib3hfaG9sZGVyXCIpO1xyXG5cdFx0dmFyIHVsID0gJChjb250YWluZXIpLmNoaWxkcmVuKFwidWxcIik7XHJcblx0XHR2YXIgaXRlbXMgPSAkKGNvbnRhaW5lcikuZmluZChcImxpXCIpO1xyXG5cdFx0dmFyIG51bUNhdGVnb3JpZXMgPSAwO1xyXG5cdFx0XHJcblx0XHQvLyQoaXRlbXMpLmZpbmQoXCJ1bFwiKS5yZW1vdmUoKTtcclxuXHRcdC8vJCh1bCkuYXBwZW5kKGl0ZW1zKTtcclxuXHRcdFxyXG5cdFx0dmFyIGljb25zID0gW107XHJcblx0XHRcclxuXHRcdGl0ZW1zLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XHJcblx0XHRcdHZhciBpZCA9ICQoZWwpLmF0dHIoXCJjbGFzc1wiKS5tYXRjaCgvXFxkKy8pO1xyXG5cdFx0XHRcclxuXHRcdFx0Zm9yKHZhciBjYXRlZ29yeV9pZCBpbiB3cGdtemFfY2F0ZWdvcnlfZGF0YSkge1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGlkID09IGNhdGVnb3J5X2lkKSB7XHJcblx0XHRcdFx0XHR2YXIgc3JjID0gd3BnbXphX2NhdGVnb3J5X2RhdGFbY2F0ZWdvcnlfaWRdLmltYWdlO1xyXG5cdFx0XHRcdFx0dmFyIGljb24gPSAkKCc8ZGl2IGNsYXNzPVwid3BnbXphLWNoaXAtaWNvblwiLz4nKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWNvbi5jc3Moe1xyXG5cdFx0XHRcdFx0XHRcImJhY2tncm91bmQtaW1hZ2VcIjogXCJ1cmwoJ1wiICsgc3JjICsgXCInKVwiLFxyXG5cdFx0XHRcdFx0XHRcIndpZHRoXCI6ICQoXCIjd3BnbXphX2NhdF9jaGVja2JveF9cIiArIGNhdGVnb3J5X2lkICsgXCIgKyBsYWJlbFwiKS5oZWlnaHQoKSArIFwicHhcIlxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRpY29ucy5wdXNoKGljb24pO1xyXG5cdFx0XHRcdFx0XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoc3JjICE9IG51bGwgJiYgc3JjICE9IFwiXCIpe1xyXG5cdFx0XHRcdFx0ICAgLy8kKGVsKS5maW5kKFwibGFiZWxcIikucHJlcGVuZChpY29uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAkKFwiI3dwZ216YV9jYXRfY2hlY2tib3hfXCIgKyBjYXRlZ29yeV9pZCArIFwiICsgbGFiZWxcIikucHJlcGVuZChpY29uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdG51bUNhdGVnb3JpZXMrKztcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcbiAgICAgICAgJCh0aGlzLmVsZW1lbnQpLmFwcGVuZChjb250YWluZXIpO1xyXG5cclxuXHRcdFxyXG5cdFx0aWYobnVtQ2F0ZWdvcmllcykge1xyXG5cdFx0XHR0aGlzLm9wdGlvbnNCdXR0b24gPSAkKCc8c3BhbiBjbGFzcz1cIndwZ216YV9zdG9yZV9sb2NhdG9yX29wdGlvbnNfYnV0dG9uXCI+PGkgY2xhc3M9XCJmYSBmYS1saXN0XCI+PC9pPjwvc3Bhbj4nKTtcclxuXHRcdFx0JCh0aGlzLnNlYXJjaEJ1dHRvbikuYmVmb3JlKHRoaXMub3B0aW9uc0J1dHRvbik7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcclxuXHRcdFx0aWNvbnMuZm9yRWFjaChmdW5jdGlvbihpY29uKSB7XHJcblx0XHRcdFx0dmFyIGhlaWdodCA9ICQoaWNvbikuaGVpZ2h0KCk7XHJcblx0XHRcdFx0JChpY29uKS5jc3Moe1wid2lkdGhcIjogaGVpZ2h0ICsgXCJweFwifSk7XHJcblx0XHRcdFx0JChpY29uKS5jbG9zZXN0KFwibGFiZWxcIikuY3NzKHtcInBhZGRpbmctbGVmdFwiOiBoZWlnaHQgKyA4ICsgXCJweFwifSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0JChjb250YWluZXIpLmNzcyhcIndpZHRoXCIsICQoc2VsZi5lbGVtZW50KS5maW5kKFwiLndwZ216YS1pbm5lclwiKS5vdXRlcldpZHRoKCkgKyBcInB4XCIpO1xyXG5cdFx0XHRcclxuXHRcdH0sIDEwMDApO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkuZmluZChcIi53cGdtemFfc3RvcmVfbG9jYXRvcl9vcHRpb25zX2J1dHRvblwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihjb250YWluZXIuaGFzQ2xhc3MoXCJ3cGdtemEtb3BlblwiKSlcclxuXHRcdFx0XHRjb250YWluZXIucmVtb3ZlQ2xhc3MoXCJ3cGdtemEtb3BlblwiKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNvbnRhaW5lci5hZGRDbGFzcyhcIndwZ216YS1vcGVuXCIpO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQvLyBSZW1vdmUgb3JpZ2luYWwgZWxlbWVudFxyXG5cdFx0JChvcmlnaW5hbCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHRcdC8vIEV2ZW50IGxpc3RlbmVyc1xyXG5cdFx0JCh0aGlzLmVsZW1lbnQpLmZpbmQoXCJpbnB1dCwgc2VsZWN0XCIpLm9uKFwiZm9jdXNcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQoaW5uZXIpLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQodGhpcy5lbGVtZW50KS5maW5kKFwiaW5wdXQsIHNlbGVjdFwiKS5vbihcImJsdXJcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdCQoaW5uZXIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG5cdFx0fSk7XHJcblx0XHRcclxuXHRcdCQodGhpcy5lbGVtZW50KS5vbihcIm1vdXNlb3ZlclwiLCBcImxpLndwZ216YV9jYXRfY2hlY2tib3hfaXRlbV9ob2xkZXJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2VsZi5vbk1vdXNlT3ZlckNhdGVnb3J5KGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKHRoaXMuZWxlbWVudCkub24oXCJtb3VzZWxlYXZlXCIsIFwibGkud3BnbXphX2NhdF9jaGVja2JveF9pdGVtX2hvbGRlclwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHRzZWxmLm9uTW91c2VMZWF2ZUNhdGVnb3J5KGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0XHQkKG1hcC5tYXJrZXJGaWx0ZXIpLm9uKFwiZmlsdGVyaW5nY29tcGxldGVcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHJcblx0XHRcdGlmKCF0aGlzLm1hcC5oYXNWaXNpYmxlTWFya2VycygpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aWYodGhpcy5tYXAuc2V0dGluZ3Muc3RvcmVfbG9jYXRvcl9ub3RfZm91bmRfbWVzc2FnZSAhPSAgV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLnplcm9fcmVzdWx0cyAmJiB0aGlzLm1hcC5zZXR0aW5ncy5zdG9yZV9sb2NhdG9yX25vdF9mb3VuZF9tZXNzYWdlICE9IFwiXCIpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0YWxlcnQodGhpcy5tYXAuc2V0dGluZ3Muc3RvcmVfbG9jYXRvcl9ub3RfZm91bmRfbWVzc2FnZSk7XHJcblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRlbHNle1xyXG5cdFx0XHRcdFx0YWxlcnQoV1BHTVpBLmxvY2FsaXplZF9zdHJpbmdzLnplcm9fcmVzdWx0cyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fSk7XHJcblxyXG5cclxuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLndwZ216YV9zdG9yZV9sb2NhdG9yX29wdGlvbnNfYnV0dG9uJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cclxuXHRcdFx0XHRpZiAoJCgnLndwZ216YV9jYXRfY2hlY2tib3hfaG9sZGVyJykuaGFzQ2xhc3MoJ3dwZ216YS1vcGVuJykpIHtcclxuXHJcblx0XHRcdFx0XHR2YXIgcF9jYXQgPSAkKCBcIi53cGdtemFfY2F0X2NoZWNrYm94X2hvbGRlclwiICk7XHJcblx0XHRcdFx0XHR2YXIgcG9zaXRpb25fY2F0ID0gcF9jYXQucG9zaXRpb24oKS50b3AgKyBwX2NhdC5vdXRlckhlaWdodCh0cnVlKSArICQoJy53cGdtemEtbW9kZXJuLXN0b3JlLWxvY2F0b3InKS5oZWlnaHQoKTtcclxuXHRcdFx0XHJcblx0XHRcdFx0XHR2YXIgJHBfbWFwID0gJCgnLndwZ216YV9tYXAnKTsgIFxyXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uX21hcCA9ICRwX21hcC5wb3NpdGlvbigpLnRvcCArICRwX21hcC5vdXRlckhlaWdodCh0cnVlKTsgXHJcblxyXG5cdFx0XHRcdFx0dmFyIGNhdF9oZWlnaHQgPSBwb3NpdGlvbl9jYXQ7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGNhdF9oZWlnaHQgPj0gcG9zaXRpb25fbWFwKSB7XHJcblx0XHRcdFxyXG5cdFx0XHRcdFx0XHQkKCcud3BnbXphX2NhdF91bCcpLmNzcygnb3ZlcmZsb3cnLCAnc2Nyb2xsICcpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdCQoJy53cGdtemFfY2F0X3VsJykuY3NzKCdoZWlnaHQnLCAnMTAwJScpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHQkKCcud3BnbXphLW1vZGVybi1zdG9yZS1sb2NhdG9yJykuY3NzKCdoZWlnaHQnLCcxMDAlJyk7XHJcblx0XHRcdFx0XHRcdCQoJy53cGdtemFfY2F0X2NoZWNrYm94X2hvbGRlci53cGdtemEtb3BlbicpLmNzcyh7J3BhZGRpbmctYm90dG9tJzogJzUwcHgnLCAnaGVpZ2h0JzogJzEwMCUnfSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LCA1MDApO1xyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHRcclxuXHQvKipcclxuXHQgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIGEgbW9kZXJuIHN0b3JlIGxvY2F0b3IsIDxzdHJvbmc+cGxlYXNlIDxlbT5hbHdheXM8L2VtPiB1c2UgdGhpcyBmdW5jdGlvbiByYXRoZXIgdGhhbiBjYWxsaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseTwvc3Ryb25nPi5cclxuXHQgKiBAbWV0aG9kXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3JcclxuXHQgKiBAcGFyYW0ge2ludH0gbWFwX2lkIFRoZSBJRCBvZiB0aGUgbWFwIHRoaXMgc3RvcmUgbG9jYXRvciBiZWxvbmdzIHRvXHJcblx0ICogQHJldHVybiB7V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvcn0gQW4gaW5zdGFuY2Ugb2YgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvclxyXG5cdCAqL1xyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3IuY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbihtYXBfaWQpXHJcblx0e1xyXG5cdFx0c3dpdGNoKFdQR01aQS5zZXR0aW5ncy5lbmdpbmUpXHJcblx0XHR7XHJcblx0XHRcdGNhc2UgXCJvcGVuLWxheWVyc1wiOlxyXG5cdFx0XHRcdHJldHVybiBuZXcgV1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yKG1hcF9pZCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFxyXG5cdFx0XHRkZWZhdWx0OlxyXG5cdFx0XHRcdHJldHVybiBuZXcgV1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvcihtYXBfaWQpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyBUT0RPOiBNb3ZlIHRoZXNlIHRvIGEgUHJvIG1vZHVsZVxyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uTW91c2VPdmVyQ2F0ZWdvcnkgPSBmdW5jdGlvbihldmVudClcclxuXHR7XHJcblx0XHR2YXIgbGkgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xyXG5cdFx0XHJcblx0XHQkKGxpKS5jaGlsZHJlbihcInVsLndwZ216YV9jYXRfY2hlY2tib3hfaXRlbV9ob2xkZXJcIikuc3RvcCh0cnVlLCBmYWxzZSkuZmFkZUluKCk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3IucHJvdG90eXBlLm9uTW91c2VMZWF2ZUNhdGVnb3J5ID0gZnVuY3Rpb24oZXZlbnQpXHJcblx0e1xyXG5cdFx0dmFyIGxpID0gZXZlbnQuY3VycmVudFRhcmdldDtcclxuXHRcdFxyXG5cdFx0JChsaSkuY2hpbGRyZW4oXCJ1bC53cGdtemFfY2F0X2NoZWNrYm94X2l0ZW1faG9sZGVyXCIpLnN0b3AodHJ1ZSwgZmFsc2UpLmZhZGVPdXQoKTtcclxuXHR9XHJcblx0XHJcbn0pOyJdLCJmaWxlIjoibW9kZXJuLXN0b3JlLWxvY2F0b3IuanMifQ==
