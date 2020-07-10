/**
 * @namespace WPGMZA
 * @module GoogleModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 * @gulp-requires ../modern-store-locator.js
 */
jQuery(function($) {
	
	WPGMZA.GoogleModernStoreLocator = function(map_id)
	{
		var googleMap, self = this;
		
		this.map = WPGMZA.getMapByID(map_id);
		
		WPGMZA.ModernStoreLocator.call(this, map_id);

		var options = {
			fields: ["name", "formatted_address"],
			types: ["geocode"]
		};
		var restrict = wpgmaps_localize[map_id]["other_settings"]["wpgmza_store_locator_restrict"];
		
		this.addressInput = $(this.element).find(".addressInput, #addressInput")[0];
		
		if(this.addressInput)
		{
			if(restrict && restrict.length)
				options.componentRestrictions = {
					country: restrict
				};
			
			this.autoComplete = new google.maps.places.Autocomplete(
				this.addressInput,
				options
			);
		}
		
		// Positioning for Google
		this.map.googleMap.controls[google.maps.ControlPosition.TOP_CENTER].push(this.element);
	}
	
	WPGMZA.GoogleModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator.prototype);
	WPGMZA.GoogleModernStoreLocator.prototype.constructor = WPGMZA.GoogleModernStoreLocator;
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGUtbWFwcy9nb29nbGUtbW9kZXJuLXN0b3JlLWxvY2F0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yXHJcbiAqIEByZXF1aXJlcyBXUEdNWkEuTW9kZXJuU3RvcmVMb2NhdG9yXHJcbiAqIEBndWxwLXJlcXVpcmVzIC4uL21vZGVybi1zdG9yZS1sb2NhdG9yLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3IgPSBmdW5jdGlvbihtYXBfaWQpXHJcblx0e1xyXG5cdFx0dmFyIGdvb2dsZU1hcCwgc2VsZiA9IHRoaXM7XHJcblx0XHRcclxuXHRcdHRoaXMubWFwID0gV1BHTVpBLmdldE1hcEJ5SUQobWFwX2lkKTtcclxuXHRcdFxyXG5cdFx0V1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvci5jYWxsKHRoaXMsIG1hcF9pZCk7XHJcblxyXG5cdFx0dmFyIG9wdGlvbnMgPSB7XHJcblx0XHRcdGZpZWxkczogW1wibmFtZVwiLCBcImZvcm1hdHRlZF9hZGRyZXNzXCJdLFxyXG5cdFx0XHR0eXBlczogW1wiZ2VvY29kZVwiXVxyXG5cdFx0fTtcclxuXHRcdHZhciByZXN0cmljdCA9IHdwZ21hcHNfbG9jYWxpemVbbWFwX2lkXVtcIm90aGVyX3NldHRpbmdzXCJdW1wid3BnbXphX3N0b3JlX2xvY2F0b3JfcmVzdHJpY3RcIl07XHJcblx0XHRcclxuXHRcdHRoaXMuYWRkcmVzc0lucHV0ID0gJCh0aGlzLmVsZW1lbnQpLmZpbmQoXCIuYWRkcmVzc0lucHV0LCAjYWRkcmVzc0lucHV0XCIpWzBdO1xyXG5cdFx0XHJcblx0XHRpZih0aGlzLmFkZHJlc3NJbnB1dClcclxuXHRcdHtcclxuXHRcdFx0aWYocmVzdHJpY3QgJiYgcmVzdHJpY3QubGVuZ3RoKVxyXG5cdFx0XHRcdG9wdGlvbnMuY29tcG9uZW50UmVzdHJpY3Rpb25zID0ge1xyXG5cdFx0XHRcdFx0Y291bnRyeTogcmVzdHJpY3RcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5hdXRvQ29tcGxldGUgPSBuZXcgZ29vZ2xlLm1hcHMucGxhY2VzLkF1dG9jb21wbGV0ZShcclxuXHRcdFx0XHR0aGlzLmFkZHJlc3NJbnB1dCxcclxuXHRcdFx0XHRvcHRpb25zXHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFBvc2l0aW9uaW5nIGZvciBHb29nbGVcclxuXHRcdHRoaXMubWFwLmdvb2dsZU1hcC5jb250cm9sc1tnb29nbGUubWFwcy5Db250cm9sUG9zaXRpb24uVE9QX0NFTlRFUl0ucHVzaCh0aGlzLmVsZW1lbnQpO1xyXG5cdH1cclxuXHRcclxuXHRXUEdNWkEuR29vZ2xlTW9kZXJuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvci5wcm90b3R5cGUpO1xyXG5cdFdQR01aQS5Hb29nbGVNb2Rlcm5TdG9yZUxvY2F0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV1BHTVpBLkdvb2dsZU1vZGVyblN0b3JlTG9jYXRvcjtcclxuXHRcclxufSk7Il0sImZpbGUiOiJnb29nbGUtbWFwcy9nb29nbGUtbW9kZXJuLXN0b3JlLWxvY2F0b3IuanMifQ==
