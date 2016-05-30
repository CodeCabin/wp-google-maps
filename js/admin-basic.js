jQuery(document).ready(function(){


    jQuery("body").on("click",".wpgmza_copy_shortcode", function() {
        var $temp = jQuery('<input>');
        var $tmp2 = jQuery('<span id="wpgmza_tmp" style="display:none; width:100%; text-align:center;">');
        jQuery("body").append($temp);
        $temp.val(jQuery(this).val()).select();
        document.execCommand("copy");
        $temp.remove();
        jQuery(this).after($tmp2);
        jQuery($tmp2).html(wpgmaps_localize_strings["wpgm_copy_string"]);
        jQuery($tmp2).fadeIn();
        setTimeout(function(){ jQuery($tmp2).fadeOut(); }, 1000);
        setTimeout(function(){ jQuery($tmp2).remove(); }, 1500);
    });


});