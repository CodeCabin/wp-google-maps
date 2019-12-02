/**
 * @namespace WPGMZA
 * @module MapEditPage
 * @requires WPGMZA
 */
jQuery(function($) {
	
	if(WPGMZA.currentPage != "map-edit")
		return;
	
	WPGMZA.MapEditPage = function()
	{
		this.themePanel = new WPGMZA.ThemePanel();
		this.themeEditor = new WPGMZA.ThemeEditor();
		
		this.map = WPGMZA.maps[0];
	}
	
	WPGMZA.MapEditPage.createInstance = function()
	{
		if(WPGMZA.isProVersion() && WPGMZA.Version.compare(WPGMZA.pro_version, "8.0.0") >= WPGMZA.Version.EQUAL_TO)
			return new WPGMZA.ProMapEditPage();
		
		return new WPGMZA.MapEditPage();
	}
	
	$(window).on("load", function(event) {
		
		WPGMZA.mapEditPage = WPGMZA.MapEditPage.createInstance();
		
	});
	
});