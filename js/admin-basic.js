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

    jQuery('#wpgmza_settings_enable_usage_tracking').change(function(event) {

        var usage_tracking = jQuery(this);

        if (usage_tracking.is (':checked')){
            var enabled = true;
        } else {
            var enabled = false;
        }
        var email = jQuery("#wpgmza_admin_email_coupon").val();

        var data = {
            action: 'request_coupon',
            email: email,
            status: enabled
        }
        jQuery.post(ajaxurl, data, function(response){
        });

    });

    var radiusStoreLocator      = jQuery('.wpgmza-store-locator-default-radius'),
        radiusStoreLocatorKm    = jQuery('#wpgmza_store_locator_default_radius_km'),
        radiusStoreLocatorMi    = jQuery('#wpgmza_store_locator_default_radius_mi');

    radiusStoreLocator.on('change', function() {
        radiusStoreLocator.val(jQuery(this).val());
    });

    jQuery('#wpgmza_store_locator_distance').on('change', function() {
        radiusStoreLocator.removeClass('active');

        if (jQuery(this).attr('checked')){
            radiusStoreLocatorMi.addClass('active');
        } else {
            radiusStoreLocatorKm.addClass('active');
        }
    });

});