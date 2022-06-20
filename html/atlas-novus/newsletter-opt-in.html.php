<?php

if(!defined('ABSPATH'))
	exit;

?>

<div class="wpgmza-writeup-tabs">
    <a href="javascript:window.close();" class="tab tab-active"><?php _e("Close Window","wp-google-maps"); ?></a>
</div>

<div id="wpgmza-welcome-page" class="wrap wpgmza-wrap wpgmza-writeup-block wpgmza-shadow-high">
    <img src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/new-banner.png'; ?>" alt="WP Go Maps"/>

    <hr>

    <h2><?php _e("Thank you for joining our newsletter!", "wp-google-maps"); ?></h2>
    <h3><?php printf(__("Your email address (%s) has been sent to our server and automatically added to our mailing list","wp-google-maps"), get_option('admin_email')); ?></h3>


    <a class="wpgmza-button" href="javascript:window.close();">
        <?php echo __("Close Window","wp-google-maps"); ?>
    </a>

</div>

<script type="text/javascript">
	!function(){if(!window.EncTracking||!window.EncTracking.started){window.EncTracking=Object.assign({}, window.EncTracking, {queue:window.EncTracking&&window.EncTracking.queue?window.EncTracking.queue:[],track:function(t){this.queue.push({type:"track",props:t})},identify:function(t){this.queue.push({type:"identify",props:t})},started:!0});var t=window.EncTracking;t.writeKey="fC5wJAMVagrn9oy7erfLfb1Kx",t.hasOptedIn=true,t.shouldGetConsent=true,t.hasOptedIn&&(t.shouldGetConsent=!1),t.optIn=function(){t.hasOptedIn=!0,t&&t.init()},t.optOut=function(){t.hasOptedIn=!1,t&&t.setOptOut&&t.setOptOut(!0)};var n=function(t){var n=document.createElement("script");n.type="text/javascript",n.async=void 0===t||t,n.src="https://resources-app.encharge.io/encharge-tracking.min.js";var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};"complete"===document.readyState?n():window.attachEvent?window.attachEvent("onload",n):window.addEventListener("load",n,!1)}}();
</script>

<script>
	EncTracking.identify({ 
	  email: "<?php echo get_option('admin_email'); ?>", 
	  tags: "Free"
	});
</script>