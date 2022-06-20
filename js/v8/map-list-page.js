/**
 * @namespace WPGMZA
 * @module MapListPage
 * @requires WPGMZA
 */
jQuery(function($) {
	
	WPGMZA.MapListPage = function()
	{

		$("body").on("click",".wpgmza_copy_shortcode", function() {
	        var $temp = jQuery('<input>');
	        var $tmp2 = jQuery('<span id="wpgmza_tmp" style="display:none; width:100%; text-align:center;">');
	        jQuery("body").append($temp);
	        $temp.val(jQuery(this).val()).select();
	        document.execCommand("copy");
	        $temp.remove();
	        WPGMZA.notification("Shortcode Copied");
	    });
		
	}
	
	WPGMZA.MapListPage.createInstance = function()
	{
		return new WPGMZA.MapListPage();
	}
	
	$(document).ready(function(event) {
		
		if(WPGMZA.getCurrentPage() == WPGMZA.PAGE_MAP_LIST)
			WPGMZA.mapListPage = WPGMZA.MapListPage.createInstance();
		
	});
	
});