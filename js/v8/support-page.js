/**
 * @namespace WPGMZA
 * @module SupportPage
 * @requires WPGMZA
 */


jQuery(function($) {
	WPGMZA.SupportPage = function(){
		var self = this;

        $(".support-page").tabs();

        $('.wpgmza-copy-sysinfo').on('click', function(){
            const info = $('.system-info').text();

            if(info.length){
				const temp = jQuery('<textarea>');
		        $(document.body).append(temp);
		        temp.val(info).select();
		        document.execCommand("copy");
		        temp.remove();
		        WPGMZA.notification("Info Copied");
			}
        });
    }

    WPGMZA.SupportPage.createInstance = function(){
        return new WPGMZA.SupportPage();
    }

    $(document).ready(function(event) { 
        if(WPGMZA.getCurrentPage() === WPGMZA.PAGE_SUPPORT){
            WPGMZA.supportPage = WPGMZA.SupportPage.createInstance();
        }
    });
});