(function($) {
	
	var template = '\
<div class="wpgmza-halt"> \
	<p> \
	' + WPGMZA.settings.localized_strings.friendly_error + ' \
	</p> \
	<pre style="white-space: pre-line;"></pre> \
<div> \
';
	
	WPGMZA.FriendlyError = function(nativeError)
	{
		this.element = $(template);
		this.element.find("pre").html(nativeError.message + "\r\n" + nativeError.stack + "\r\n\r\n on " + window.location.href);
	}
	
})(jQuery);