/**
 * @namespace WPGMZA
 * @module VertexContextMenu
 * @requires WPGMZA
 */
(function($) {
	
	WPGMZA.VertexContextMenu = function(mapEditPage, items)
	{
		WPGMZA.assertInstanceOf(this, "VertexContextMenu");
		
		this.mapEditPage = mapEditPage;
		
		this.element = document.createElement("div");
		this.element.className = "wpgmza-vertex-context-menu";
		
		for(var i = 0; i < items.length; i++)
		{
			var item = $("<div/>");
			item.html(items[i]);
			$(this.element).append(item);
		}
	}
	
})(jQuery);