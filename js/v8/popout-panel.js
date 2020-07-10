/**
 * @namespace WPGMZA
 * @module PopoutPanel
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * Common functionality for popout panels, which is the directions box, directions result box, and the modern style marker listing
	 * @class WPGMZA.PopoutPanel
	 * @constructor WPGMZA.PopoutPanel
	 * @memberof WPGMZA
	 */
	WPGMZA.PopoutPanel = function(element)
	{
		this.element = element;
	}
	
	/**
	 * Opens the direction box
	 * @method
	 * @memberof WPGMZA.PopoutPanel
	 */
	WPGMZA.PopoutPanel.prototype.open = function() {
		$(this.element).addClass("wpgmza-open");
	};
	
	/**
	 * Closes the direction box
	 * @method
	 * @memberof WPGMZA.PopoutPanel
	 */
	WPGMZA.PopoutPanel.prototype.close = function() {
		$(this.element).removeClass("wpgmza-open");
	};
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb3BvdXQtcGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBuYW1lc3BhY2UgV1BHTVpBXHJcbiAqIEBtb2R1bGUgUG9wb3V0UGFuZWxcclxuICogQHJlcXVpcmVzIFdQR01aQVxyXG4gKiBAZ3VscC1yZXF1aXJlcyBjb3JlLmpzXHJcbiAqL1xyXG5qUXVlcnkoZnVuY3Rpb24oJCkge1xyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIENvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciBwb3BvdXQgcGFuZWxzLCB3aGljaCBpcyB0aGUgZGlyZWN0aW9ucyBib3gsIGRpcmVjdGlvbnMgcmVzdWx0IGJveCwgYW5kIHRoZSBtb2Rlcm4gc3R5bGUgbWFya2VyIGxpc3RpbmdcclxuXHQgKiBAY2xhc3MgV1BHTVpBLlBvcG91dFBhbmVsXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5Qb3BvdXRQYW5lbFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkFcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9wb3V0UGFuZWwgPSBmdW5jdGlvbihlbGVtZW50KVxyXG5cdHtcclxuXHRcdHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcblx0fVxyXG5cdFxyXG5cdC8qKlxyXG5cdCAqIE9wZW5zIHRoZSBkaXJlY3Rpb24gYm94XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuUG9wb3V0UGFuZWxcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9wb3V0UGFuZWwucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpIHtcclxuXHRcdCQodGhpcy5lbGVtZW50KS5hZGRDbGFzcyhcIndwZ216YS1vcGVuXCIpO1xyXG5cdH07XHJcblx0XHJcblx0LyoqXHJcblx0ICogQ2xvc2VzIHRoZSBkaXJlY3Rpb24gYm94XHJcblx0ICogQG1ldGhvZFxyXG5cdCAqIEBtZW1iZXJvZiBXUEdNWkEuUG9wb3V0UGFuZWxcclxuXHQgKi9cclxuXHRXUEdNWkEuUG9wb3V0UGFuZWwucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XHJcblx0XHQkKHRoaXMuZWxlbWVudCkucmVtb3ZlQ2xhc3MoXCJ3cGdtemEtb3BlblwiKTtcclxuXHR9O1xyXG5cdFxyXG59KTsiXSwiZmlsZSI6InBvcG91dC1wYW5lbC5qcyJ9
