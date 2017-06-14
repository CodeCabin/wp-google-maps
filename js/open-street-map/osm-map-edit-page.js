(function($) {
	
	var parentConstructor;
	
	WPGMZA.OSMMapEditPage = function()
	{
		WPGMZA.MapEditPage.call(this);
		
		this.map.osmMap.updateSize();
	}
	
	// Inheritence
	if(WPGMZA.isProVersion())
		parentConstructor = WPGMZA.ProMapEditPage;
	else
		parentConstructor = WPGMZA.MapEditPage;
	
	WPGMZA.OSMMapEditPage.prototype = Object.create(parentConstructor.prototype);
	WPGMZA.OSMMapEditPage.prototype.constructor = WPGMZA.OSMMapEditPage;
	
})(jQuery);