/**
 * @namespace WPGMZA
 * @module OLModernStoreLocator
 * @requires WPGMZA.ModernStoreLocator
 * @gulp-requires ../modern-store-locator.js
 */
jQuery(function($) {
	
	WPGMZA.OLModernStoreLocator = function(map_id)
	{
		var element;
		
		WPGMZA.ModernStoreLocator.call(this, map_id);
		
		if(WPGMZA.isProVersion())
			element = $(".wpgmza_map[data-map-id='" + map_id + "']");
		else
			element = $("#wpgmza_map");
		
		element.append(this.element);
	}
	
	WPGMZA.OLModernStoreLocator.prototype = Object.create(WPGMZA.ModernStoreLocator);
	WPGMZA.OLModernStoreLocator.prototype.constructor = WPGMZA.OLModernStoreLocator;
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvcGVuLWxheWVycy9vbC1tb2Rlcm4tc3RvcmUtbG9jYXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBPTE1vZGVyblN0b3JlTG9jYXRvclxyXG4gKiBAcmVxdWlyZXMgV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvclxyXG4gKiBAZ3VscC1yZXF1aXJlcyAuLi9tb2Rlcm4tc3RvcmUtbG9jYXRvci5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHRXUEdNWkEuT0xNb2Rlcm5TdG9yZUxvY2F0b3IgPSBmdW5jdGlvbihtYXBfaWQpXHJcblx0e1xyXG5cdFx0dmFyIGVsZW1lbnQ7XHJcblx0XHRcclxuXHRcdFdQR01aQS5Nb2Rlcm5TdG9yZUxvY2F0b3IuY2FsbCh0aGlzLCBtYXBfaWQpO1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuaXNQcm9WZXJzaW9uKCkpXHJcblx0XHRcdGVsZW1lbnQgPSAkKFwiLndwZ216YV9tYXBbZGF0YS1tYXAtaWQ9J1wiICsgbWFwX2lkICsgXCInXVwiKTtcclxuXHRcdGVsc2VcclxuXHRcdFx0ZWxlbWVudCA9ICQoXCIjd3BnbXphX21hcFwiKTtcclxuXHRcdFxyXG5cdFx0ZWxlbWVudC5hcHBlbmQodGhpcy5lbGVtZW50KTtcclxuXHR9XHJcblx0XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV1BHTVpBLk1vZGVyblN0b3JlTG9jYXRvcik7XHJcblx0V1BHTVpBLk9MTW9kZXJuU3RvcmVMb2NhdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdQR01aQS5PTE1vZGVyblN0b3JlTG9jYXRvcjtcclxuXHRcclxufSk7Il0sImZpbGUiOiJvcGVuLWxheWVycy9vbC1tb2Rlcm4tc3RvcmUtbG9jYXRvci5qcyJ9
