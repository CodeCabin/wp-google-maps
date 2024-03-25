<?php

if(!defined('ABSPATH'))
	exit;

?>

<div id="wpgmza-welcome-page" class="wrap about-wrap">
	<p>&nbsp;</p>

	<img style="width: 512px;" src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/new-banner.png'; ?>" alt="WP Go Maps"/>

	<div class="about-text"><?php _e("Thank you for joining our newsletter!","wp-google-maps"); ?></div>

	<p><?php printf(__("Your email address (%s) has been sent to our server and automatically added to our mailing list","wp-google-maps"), esc_html(get_option('admin_email'))); ?></p>

	<a class="button-primary" href="javascript:window.close();">Close Window</a>
	
	<p>&nbsp;</p>
</div>

<script type="text/javascript">
	!function(){if(!window.EncTracking||!window.EncTracking.started){window.EncTracking=Object.assign({}, window.EncTracking, {queue:window.EncTracking&&window.EncTracking.queue?window.EncTracking.queue:[],track:function(t){this.queue.push({type:"track",props:t})},identify:function(t){this.queue.push({type:"identify",props:t})},started:!0});var t=window.EncTracking;t.writeKey="fC5wJAMVagrn9oy7erfLfb1Kx",t.hasOptedIn=true,t.shouldGetConsent=true,t.hasOptedIn&&(t.shouldGetConsent=!1),t.optIn=function(){t.hasOptedIn=!0,t&&t.init()},t.optOut=function(){t.hasOptedIn=!1,t&&t.setOptOut&&t.setOptOut(!0)};var n=function(t){var n=document.createElement("script");n.type="text/javascript",n.async=void 0===t||t,n.src="https://resources-app.encharge.io/encharge-tracking.min.js";var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};"complete"===document.readyState?n():window.attachEvent?window.attachEvent("onload",n):window.addEventListener("load",n,!1)}}();
</script>

<script>
	EncTracking.identify({ 
	  email: "<?php echo esc_attr(get_option('admin_email')); ?>", 
	  tags: "Free"
	});
</script>