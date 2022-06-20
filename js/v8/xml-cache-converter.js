/**
 * @namespace WPGMZA
 * @module XMLCacheConverter
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.XMLCacheConverter = function()
	{
		
	}
	
	WPGMZA.XMLCacheConverter.prototype.convert = function(xml)
	{
		var markers = [];
		var remap = {
			"marker_id":	"id",
			"linkd":		"link"
		};
		
		$(xml).find("marker").each(function(index, el) {
			
			var data = {};
			
			$(el).children().each(function(j, child) {
				
				var key = child.nodeName;
				
				if(remap[key])
					key = remap[key];
				
				if(child.hasAttribute("data-json"))
					data[key] = JSON.parse($(child).text());
				else
					data[key] = $(child).text();
				
			});
			
			markers.push(data);
			
		});
		
		return markers;
	}
	
});