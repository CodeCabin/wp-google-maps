/**
 * @namespace WPGMZA
 * @module MarkerPanel
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	WPGMZA.MarkerPanel = function(element)
	{
		this.element = element;
	}
	
	$(window).on("load", function(event) {
		
		if(WPGMZA.getCurrentPage() == WPGMZA.PAGE_MAP_EDIT)
			WPGMZA.mapEditPage.markerPanel = new WPGMZA.MarkerPanel($("#wpgmza-marker-edit-panel")[0]);
		
	});
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXJrZXItcGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgTWFya2VyUGFuZWxcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdFdQR01aQS5NYXJrZXJQYW5lbCA9IGZ1bmN0aW9uKGVsZW1lbnQpXHJcblx0e1xyXG5cdFx0dGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuXHR9XHJcblx0XHJcblx0JCh3aW5kb3cpLm9uKFwibG9hZFwiLCBmdW5jdGlvbihldmVudCkge1xyXG5cdFx0XHJcblx0XHRpZihXUEdNWkEuZ2V0Q3VycmVudFBhZ2UoKSA9PSBXUEdNWkEuUEFHRV9NQVBfRURJVClcclxuXHRcdFx0V1BHTVpBLm1hcEVkaXRQYWdlLm1hcmtlclBhbmVsID0gbmV3IFdQR01aQS5NYXJrZXJQYW5lbCgkKFwiI3dwZ216YS1tYXJrZXItZWRpdC1wYW5lbFwiKVswXSk7XHJcblx0XHRcclxuXHR9KTtcclxuXHRcclxufSk7Il0sImZpbGUiOiJtYXJrZXItcGFuZWwuanMifQ==
