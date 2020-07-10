/**
 * @namespace WPGMZA
 * @module AddressInput
 * @requires WPGMZA.EventDispatcher
 * @gulp-requires event-dispatcher.js
 */
jQuery(function($) {
	
	WPGMZA.AddressInput = function(element, map)
	{
		if(!(element instanceof HTMLInputElement))
			throw new Error("Element is not an instance of HTMLInputElement");
		
		this.element = element;
		
		var json;
		var options = {
			fields: ["name", "formatted_address"],
			types:	["geocode"]
		};
		
		if(json = $(element).attr("data-autocomplete-options"))
			options = $.extend(options, JSON.parse(json));
		
		if(map && map.settings.wpgmza_store_locator_restrict)
			options.country = map.settings.wpgmza_store_locator_restrict;
		
		if(WPGMZA.isGoogleAutocompleteSupported())
		{
			element.googleAutoComplete = new google.maps.places.Autocomplete(element, options);
			
			if(options.country)
				element.googleAutoComplete.setComponentRestrictions({country: options.country});
		}
		else if(WPGMZA.CloudAPI && WPGMZA.CloudAPI.isBeingUsed)
			element.cloudAutoComplete = new WPGMZA.CloudAutocomplete(element, options);
	}
	
	WPGMZA.extend(WPGMZA.AddressInput, WPGMZA.EventDispatcher);
	
	WPGMZA.AddressInput.createInstance = function(element, map)
	{
		return new WPGMZA.AddressInput(element, map);
	}
	
	/*$(window).on("load", function(event) {
		
		$("input.wpgmza-address").each(function(index, el) {
			
			el.wpgmzaAddressInput = WPGMZA.AddressInput.createInstance(el);
			
		});
		
	});*/
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhZGRyZXNzLWlucHV0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbmFtZXNwYWNlIFdQR01aQVxyXG4gKiBAbW9kdWxlIEFkZHJlc3NJbnB1dFxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlclxyXG4gKiBAZ3VscC1yZXF1aXJlcyBldmVudC1kaXNwYXRjaGVyLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5BZGRyZXNzSW5wdXQgPSBmdW5jdGlvbihlbGVtZW50LCBtYXApXHJcblx0e1xyXG5cdFx0aWYoIShlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkpXHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgaXMgbm90IGFuIGluc3RhbmNlIG9mIEhUTUxJbnB1dEVsZW1lbnRcIik7XHJcblx0XHRcclxuXHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblx0XHRcclxuXHRcdHZhciBqc29uO1xyXG5cdFx0dmFyIG9wdGlvbnMgPSB7XHJcblx0XHRcdGZpZWxkczogW1wibmFtZVwiLCBcImZvcm1hdHRlZF9hZGRyZXNzXCJdLFxyXG5cdFx0XHR0eXBlczpcdFtcImdlb2NvZGVcIl1cclxuXHRcdH07XHJcblx0XHRcclxuXHRcdGlmKGpzb24gPSAkKGVsZW1lbnQpLmF0dHIoXCJkYXRhLWF1dG9jb21wbGV0ZS1vcHRpb25zXCIpKVxyXG5cdFx0XHRvcHRpb25zID0gJC5leHRlbmQob3B0aW9ucywgSlNPTi5wYXJzZShqc29uKSk7XHJcblx0XHRcclxuXHRcdGlmKG1hcCAmJiBtYXAuc2V0dGluZ3Mud3BnbXphX3N0b3JlX2xvY2F0b3JfcmVzdHJpY3QpXHJcblx0XHRcdG9wdGlvbnMuY291bnRyeSA9IG1hcC5zZXR0aW5ncy53cGdtemFfc3RvcmVfbG9jYXRvcl9yZXN0cmljdDtcclxuXHRcdFxyXG5cdFx0aWYoV1BHTVpBLmlzR29vZ2xlQXV0b2NvbXBsZXRlU3VwcG9ydGVkKCkpXHJcblx0XHR7XHJcblx0XHRcdGVsZW1lbnQuZ29vZ2xlQXV0b0NvbXBsZXRlID0gbmV3IGdvb2dsZS5tYXBzLnBsYWNlcy5BdXRvY29tcGxldGUoZWxlbWVudCwgb3B0aW9ucyk7XHJcblx0XHRcdFxyXG5cdFx0XHRpZihvcHRpb25zLmNvdW50cnkpXHJcblx0XHRcdFx0ZWxlbWVudC5nb29nbGVBdXRvQ29tcGxldGUuc2V0Q29tcG9uZW50UmVzdHJpY3Rpb25zKHtjb3VudHJ5OiBvcHRpb25zLmNvdW50cnl9KTtcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYoV1BHTVpBLkNsb3VkQVBJICYmIFdQR01aQS5DbG91ZEFQSS5pc0JlaW5nVXNlZClcclxuXHRcdFx0ZWxlbWVudC5jbG91ZEF1dG9Db21wbGV0ZSA9IG5ldyBXUEdNWkEuQ2xvdWRBdXRvY29tcGxldGUoZWxlbWVudCwgb3B0aW9ucyk7XHJcblx0fVxyXG5cdFxyXG5cdFdQR01aQS5leHRlbmQoV1BHTVpBLkFkZHJlc3NJbnB1dCwgV1BHTVpBLkV2ZW50RGlzcGF0Y2hlcik7XHJcblx0XHJcblx0V1BHTVpBLkFkZHJlc3NJbnB1dC5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG1hcClcclxuXHR7XHJcblx0XHRyZXR1cm4gbmV3IFdQR01aQS5BZGRyZXNzSW5wdXQoZWxlbWVudCwgbWFwKTtcclxuXHR9XHJcblx0XHJcblx0LyokKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblx0XHRcclxuXHRcdCQoXCJpbnB1dC53cGdtemEtYWRkcmVzc1wiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xyXG5cdFx0XHRcclxuXHRcdFx0ZWwud3BnbXphQWRkcmVzc0lucHV0ID0gV1BHTVpBLkFkZHJlc3NJbnB1dC5jcmVhdGVJbnN0YW5jZShlbCk7XHJcblx0XHRcdFxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHR9KTsqL1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6ImFkZHJlc3MtaW5wdXQuanMifQ==
