/**
 * @namespace WPGMZA
 * @module FriendlyError
 * @requires WPGMZA
 * @gulp-requires core.js
 */
jQuery(function($) {
	
	/**
	 * Deprecated
	 * @class WPGMZA.FriendlyError
	 * @constructor WPGMZA.FriendlyError
	 * @memberof WPGMZA
	 * @deprecated
	 */
	WPGMZA.FriendlyError = function()
	{
		
	}
	
	/*var template = '\
		<div class="notice notice-error"> \
			<p> \
			' + WPGMZA.localized_strings.friendly_error + ' \
			</p> \
			<pre style="white-space: pre-line;"></pre> \
		<div> \
		';
	
	WPGMZA.FriendlyError = function(nativeError)
	{
		if(!WPGMZA.is_admin)
		{
			this.element = $(WPGMZA.preloaderHTML);
			$(this.element).removeClass("animated");
			return;
		}
		
		$("#wpgmza-map-edit-page>.wpgmza-preloader").remove();
		
		this.element = $(template);
		this.element.find("pre").html(nativeError.message + "\r\n" + nativeError.stack + "\r\n\r\n on " + window.location.href);
	}*/
	
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJmcmllbmRseS1lcnJvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQG5hbWVzcGFjZSBXUEdNWkFcclxuICogQG1vZHVsZSBGcmllbmRseUVycm9yXHJcbiAqIEByZXF1aXJlcyBXUEdNWkFcclxuICogQGd1bHAtcmVxdWlyZXMgY29yZS5qc1xyXG4gKi9cclxualF1ZXJ5KGZ1bmN0aW9uKCQpIHtcclxuXHRcclxuXHQvKipcclxuXHQgKiBEZXByZWNhdGVkXHJcblx0ICogQGNsYXNzIFdQR01aQS5GcmllbmRseUVycm9yXHJcblx0ICogQGNvbnN0cnVjdG9yIFdQR01aQS5GcmllbmRseUVycm9yXHJcblx0ICogQG1lbWJlcm9mIFdQR01aQVxyXG5cdCAqIEBkZXByZWNhdGVkXHJcblx0ICovXHJcblx0V1BHTVpBLkZyaWVuZGx5RXJyb3IgPSBmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG5cdC8qdmFyIHRlbXBsYXRlID0gJ1xcXHJcblx0XHQ8ZGl2IGNsYXNzPVwibm90aWNlIG5vdGljZS1lcnJvclwiPiBcXFxyXG5cdFx0XHQ8cD4gXFxcclxuXHRcdFx0JyArIFdQR01aQS5sb2NhbGl6ZWRfc3RyaW5ncy5mcmllbmRseV9lcnJvciArICcgXFxcclxuXHRcdFx0PC9wPiBcXFxyXG5cdFx0XHQ8cHJlIHN0eWxlPVwid2hpdGUtc3BhY2U6IHByZS1saW5lO1wiPjwvcHJlPiBcXFxyXG5cdFx0PGRpdj4gXFxcclxuXHRcdCc7XHJcblx0XHJcblx0V1BHTVpBLkZyaWVuZGx5RXJyb3IgPSBmdW5jdGlvbihuYXRpdmVFcnJvcilcclxuXHR7XHJcblx0XHRpZighV1BHTVpBLmlzX2FkbWluKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLmVsZW1lbnQgPSAkKFdQR01aQS5wcmVsb2FkZXJIVE1MKTtcclxuXHRcdFx0JCh0aGlzLmVsZW1lbnQpLnJlbW92ZUNsYXNzKFwiYW5pbWF0ZWRcIik7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0JChcIiN3cGdtemEtbWFwLWVkaXQtcGFnZT4ud3BnbXphLXByZWxvYWRlclwiKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5lbGVtZW50ID0gJCh0ZW1wbGF0ZSk7XHJcblx0XHR0aGlzLmVsZW1lbnQuZmluZChcInByZVwiKS5odG1sKG5hdGl2ZUVycm9yLm1lc3NhZ2UgKyBcIlxcclxcblwiICsgbmF0aXZlRXJyb3Iuc3RhY2sgKyBcIlxcclxcblxcclxcbiBvbiBcIiArIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcclxuXHR9Ki9cclxuXHRcclxufSk7Il0sImZpbGUiOiJmcmllbmRseS1lcnJvci5qcyJ9
