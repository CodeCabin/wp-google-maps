(function($) {
	
	WPGMZA.DataTable = function(element, options)
	{
		if(!(element instanceof HTMLElement))
			throw new Error("First argument must be an instance of HTMLElement");
		
		var columns = [];
		
		$(element).find("[data-column-key]").each(function(index, el) {
			columns.push({
				"data": $(el).attr("[data-column-key]")
			});
		});
		
		var settings = {
			"processing":	true,
			"serverSide":	true,
			"ajax": {
				"url":		WPGMZA.settings.ajaxurl,
				"type":		"POST",
				"data":		function(data) {
					return $.extend({}, data, {
						"action": $(element).attr("data-ajax-action"),
						"map_id": $(element).attr("data-map-id")
					});
				}
			},
			"columns":		columns
		};
		
		if(options)
			$.extend(true, settings, options);
		
		$(element).DataTable(settings);
	}
	
})(jQuery);