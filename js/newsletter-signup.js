jQuery(document).ready(function(){

    jQuery("body").on("click", "#wpgmza_signup_newsletter_btn", function() {

        var a_email = jQuery("#wpgmza_signup_newsletter").val();
        jQuery("#wpgmza_signup_newsletter").hide('slow');
        jQuery("#wpgmza_signup_newsletter_btn").hide('slow');
        jQuery("#wpgmza_subscribe_div").html("Thank you!");
        var data = {
            action: 'wpgmza_subscribe',
            prod: 'wpgmza',
            a_email: a_email
            
        };
        jQuery.post('//ccplugins.co/newsletter-subscription/index.php', data, function(response) {
            returned_data = JSON.parse(response);
            
        });

        var data = {
            action: 'wpgmza_subscribe',
            security: wpgmza_sub_nonce
            
        };
        jQuery.post(ajaxurl, data, function(response) {
            
        });


    });
});
