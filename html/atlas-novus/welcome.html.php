<?php

if(!defined('ABSPATH'))
	exit;

global $wpgmza;
global $wpgmza_global_array; 

?>

<div class="wpgmza-writeup-tabs">
    <a href="admin.php?page=wp-google-maps-menu&amp;action=welcome_page" class="tab tab-active"><?php _e("Welcome","wp-google-maps"); ?></a>
    <a href="admin.php?page=wp-google-maps-menu&amp;action=credits" class="tab"><?php _e("Credits","wp-google-maps"); ?></a>
</div>

<div id="wpgmza-welcome-page" class="wrap wpgmza-wrap wpgmza-writeup-block wpgmza-shadow-high">
    <img src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/new-banner.png'; ?>" alt="WP Go Maps"/>

    <hr>

    <h1><?php _e("Welcome to Atlas Novus", "wp-google-maps"); ?></h1>
    <h2><?php printf(__("WP Go Maps version %s","wp-google-maps"), $wpgmza->getBasicVersion()); ?></h2>

    <a class="wpgmza-button" href="<?php echo admin_url('admin.php?page=wp-google-maps-menu&amp;action=installer&amp;autoskip=true'); ?>">
        <?php echo __("Skip Introduction, Get Started","wp-google-maps"); ?>
        <i class="fa fa-chevron-right" aria-hidden="true"></i>
    </a>

    <hr>

    <h2><?php _e("Join Our Community", "wp-google-maps"); ?></h2>

    <div class="wpgmza-row">
        <div class="wpgmza-col">
            <h3><?php _e("Facebook Group", "wp-google-maps"); ?></h3>

            <div><?php _e("Get to know other WP Go Maps users, receive updates on upcoming features, and share your maps with the community", "wp-google-maps"); ?></div>
            <a href="https://www.facebook.com/groups/wpgooglemaps" class="wpgmza-button" target="_BLANK"><?php _e("Join Facebook", "wp-google-maps"); ?></a>
        </div>

        <div class="wpgmza-col">
            <h3><?php _e("Reddit", "wp-google-maps"); ?></h3>

            <div><?php _e("Share your maps, speak to the development team, receive updates on upcoming features, and view release specific changelogs", "wp-google-maps"); ?></div>
            <a href="https://www.reddit.com/r/wpgooglemaps/" class="wpgmza-button" target="_BLANK"><?php _e("Join Subreddit", "wp-google-maps"); ?></a>
        </div>

        <div class="wpgmza-col">
            <h3><?php _e("Newsletters", "wp-google-maps"); ?></h3>

            <div><?php printf(__("Clicking this button will send your email address (%s) to our server and automatically sign you up to the newsletter","wp-google-maps"), get_option('admin_email')); ?></div>
            <a href="admin.php?page=wp-google-maps-menu&amp;action=newsletter_opt_in" class="wpgmza-button" target="_BLANK"><?php _e("Join Newsletter", "wp-google-maps"); ?></a>
        </div>
    </div>

    <hr>


    <h2><?php _e("Create maps that you'll love!","wp-google-maps"); ?></h2>
    <h3><?php _e("With our all new map editor, the possibilities are endless","wp-google-maps"); ?></h3>

    <img src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/atlas-novus/modern-editor.png'; ?>" alt="Modern Map Editor"/>

    <div class="separator"></div>

    <div class="wpgmza-row" data-image="right">
        <div class="wpgmza-col">
            <h2><?php _e("Unlimited Markers","wp-google-maps"); ?></h2>
            <h3><?php _e("Create as many markers as you like!","wp-google-maps"); ?></h3>
            <h3><?php _e("No limits, ever!","wp-google-maps"); ?></h3>
            <a class='wpgmza-button' href="#" target="_BLANK"><?php _e("Learn More", "wp-google-maps"); ?></a>
        </div>
        <div class="wpgmza-col wpgmza-text-align-right">
            <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/unlimited-markers.png'; ?>' />
        </div>
    </div>

    <div class="separator"></div>

    <div class="wpgmza-row">
        <div class="wpgmza-col wpgmza-text-align-left">
            <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/store-locator.png'; ?>' />
        </div>
        <div class="wpgmza-col">
            <h2><?php _e("Store Locator","wp-google-maps"); ?></h2>
            <h3><?php _e("Get users to your store, quickly and easily!","wp-google-maps"); ?></h3>
            <h3><?php _e("We will take care of finding the nearest locations","wp-google-maps"); ?></h3>
            <a class='wpgmza-button' href="#" target="_BLANK"><?php _e("Learn More", "wp-google-maps"); ?></a>
        </div>
    </div>

    <div class="separator"></div>

    <div class="wpgmza-row" data-image="right">
        <div class="wpgmza-col">
            <h2><?php _e("Themes","wp-google-maps"); ?></h2>
            <h3><?php _e("Select from various map themes!","wp-google-maps"); ?></h3>
            <h3><?php _e("Or make your own, in a few simple steps","wp-google-maps"); ?></h3>
            <a class='wpgmza-button' href="https://wpgmaps.com/map-themes/" target="_BLANK"><?php _e("Find Themes", "wp-google-maps"); ?></a>
        </div>
        <div class="wpgmza-col wpgmza-text-align-right">
            <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/themes.png' ?>;' />
        </div>
    </div>

    <div class="separator"></div>

    <div class="wpgmza-row">
        <div class="wpgmza-col wpgmza-text-align-left">
            <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/polygons-and-polylines.png' ?>;' />
        </div>

        <div class="wpgmza-col">
            <h2><?php _e("Polylines","wp-google-maps"); ?>, <?php _e("Polygons","wp-google-maps"); ?>, <?php _e("Circles","wp-google-maps"); ?>, <?php _e("and Squares","wp-google-maps"); ?></h2>
            <h3><?php _e("Create shapes with ease and efficiency","wp-google-maps"); ?></h3>
            <h3><?php _e("We have gone back to the drawing board","wp-google-maps"); ?></h3>
            <a class='wpgmza-button' href="#" target="_BLANK"><?php _e("Learn More", "wp-google-maps"); ?></a>

        </div>
    </div>

    <hr>

    <h2><?php _e("New to WP Go Maps?","wp-google-maps"); ?></h2>
    <h3>
        <?php _e("You may want to","wp-google-maps"); ?> 
        <a href='http://wpgmaps.com/documentation/' target='_blank' title='Documentation'>
            <?php _e("review our documentation","wp-google-maps"); ?>
        </a> <?php _e("before you get started.","wp-google-maps"); ?>
    </h3>

    <h3><?php _e("If you're a tech-savvy individual, you may skip this step.", "wp-google-maps"); ?></h3>

    <div class="separator"></div>

    <h2><?php _e("Help me!","wp-google-maps"); ?></h2>
    <h3>
        <?php _e("Visit our","wp-google-maps"); ?> 
        <a title='Support Desk' target='_blank' href='http://www.wpgmaps.com/support/'>
            <?php _e("Support Desk","wp-google-maps"); ?>
        </a> <?php _e("for quick and friendly help.","wp-google-maps"); ?>
    </h3>

    <h3><?php _e("We'll answer your request within 24 hours!", "wp-google-maps"); ?></h3>

    <div class="separator"></div>


    <h2><?php _e("Feedback","wp-google-maps"); ?></h2>
    <h3><?php _e("We need you to help us make this plugin better.","wp-google-maps"); ?></h3>
    <h3> 
        <a href='http://www.wpgmaps.com/contact-us/' title='Feedback' target='_BLANK'>
            <?php _e("Send us your feedback","wp-google-maps"); ?>
        </a> <?php _e("and we'll act on it as soon as humanly possible.","wp-google-maps"); ?>
    </h3>

    <hr>
    
    <h2><?php _e("Ready to get started?", "wp-google-maps"); ?></h2>                
    <a class="wpgmza-button" href="<?php echo admin_url('admin.php?page=wp-google-maps-menu&amp;action=installer&amp;autoskip=true'); ?>">
        <?php echo __("Let's get started","wp-google-maps"); ?>
        <i class="fa fa-chevron-right" aria-hidden="true"></i>
    </a>
</div>
