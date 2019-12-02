/**
 * @namespace WPGMZA
 * @module FancyControls
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.FancyControls = {
		
		formatToggleSwitch: function(el)
		{
			var div			= $("<div class='switch'></div>");
			var input		= el;
			var container	= el.parentNode;
			var text		= $(container).text().trim();
			var label		= $("<label></label>");
			
			$(input).addClass("cmn-toggle cmn-toggle-round-flat");
			$(input).attr("id", $(input).attr("name"));
			
			$(label).attr("for", $(input).attr("name"));
			
			$(div).append(input);
			$(div).append(label);
			
			$(container).replaceWith(div);
			
			$(div).wrap($("<div></div>"));
			$(div).after(text);
		},
		
		formatToggleButton: function(el)
		{
			var div			= $("<div class='switch'></div>");
			var input		= el;
			var container	= el.parentNode;
			var text		= $(container).text().trim();
			var label		= $("<label></label>");
			
			$(input).addClass("cmn-toggle cmn-toggle-yes-no");
			$(input).attr("id", $(input).attr("name"));
			
			$(label).attr("for", $(input).attr("name"));
			
			$(label).attr("data-on", WPGMZA.localized_strings.yes);
			$(label).attr("data-off", WPGMZA.localized_strings.no);
			
			$(div).append(input);
			$(div).append(label);
			
			$(container).replaceWith(div);
			
			$(div).wrap($("<div></div>"));
			$(div).after(text);
		}
		
	};
	
	$(".wpgmza-fancy-toggle-switch").each(function(index, el) {
		WPGMZA.FancyControls.formatToggleSwitch(el);
	});
	
	$(".wpgmza-fancy-toggle-button").each(function(index, el) {
		WPGMZA.FancyControls.formatToggleButton(el);
	});
	
});