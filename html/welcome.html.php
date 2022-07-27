<?php

if(!defined('ABSPATH'))
	exit;

?>

<?php global $wpgmza_global_array; ?>
<div id="wpgmza-welcome-page" class="wrap about-wrap">
<p>&nbsp;</p>

<img style="width: 512px;" src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/new-banner.png'; ?>" alt="WP Go Maps"/>

<h1><?php 

global $wpgmza;
printf(__("Welcome to WP Go Maps version %s","wp-google-maps"), $wpgmza->getBasicVersion());

?></h1>

<div class="about-text"><?php _e("Build amazing maps through a simple interface and powerful functionality along with world class support.","wp-google-maps"); ?></div>

<a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' href="admin.php?page=wp-google-maps-menu&amp;action=installer&amp;autoskip=true&amp;override=1"><?php echo __("Skip intro and create a map","wp-google-maps"); ?></a>
<p>&nbsp;</p>


<h2 class="nav-tab-wrapper wp-clearfix">
	<a href="admin.php?page=wp-google-maps-menu&amp;action=welcome_page" class="nav-tab  nav-tab-active"><?php _e("Welcome","wp-google-maps"); ?></a>
	<a href="admin.php?page=wp-google-maps-menu&amp;action=credits" class="nav-tab"><?php _e("Credits","wp-google-maps"); ?></a>

</h2>

    <div id="wpgmza-support__row" class="feature-section three-col">
        <div class='col wpgmza-support__col wpgmza-margin-0'>
            <div class="wpgmza-card">
                <h4><?php _e("Facebook Group","wp-google-maps"); ?></h4>
                <p><?php _e("Join our Facebook Community","wp-google-maps"); ?></p>

                <a href="https://www.facebook.com/groups/wpgooglemaps" class="button-primary" target="_BLANK"><?php _e("Join Facebook", "wp-google-maps"); ?></a>
                <br><br>
                <small style="opacity: 0.8;"><?php _e("Get to know other WP Go Maps users, receive updates on upcoming features, and share your maps with the community", "wp-google-maps"); ?></small>
            </div>
        </div>
        <div class='col wpgmza-support__col wpgmza-margin-0'>
            <div class="wpgmza-card">
                <h4><?php _e("Reddit","wp-google-maps"); ?></h4>
                <p><?php _e("Join our Reddit Community","wp-google-maps"); ?></p>
                
                <a href="https://www.reddit.com/r/wpgooglemaps/" class="button-primary" target="_BLANK"><?php _e("Join Subreddit", "wp-google-maps"); ?></a>
                <br><br>
                <small style="opacity: 0.8;"><?php _e("Share your maps, speak to the development team, receive updates on upcoming features, and view release specific changelogs", "wp-google-maps"); ?></small>                
            </div>
        </div>
        <div class='col wpgmza-support__col wpgmza-margin-0'>
            <div class="wpgmza-card">
                <h4><?php _e("Newsletters","wp-google-maps"); ?></h4>
                <p><?php _e("Receive specials, guides and latest news", "wp-google-maps"); ?></p>

                <a href="admin.php?page=wp-google-maps-menu&amp;action=newsletter_opt_in" class="button-primary" target="_BLANK"><?php _e("Join Newsletter", "wp-google-maps"); ?></a>
                <br><br>
                <small style="opacity: 0.8;"><?php printf(__("* Clicking this button will send your email address (%s) to our server and automatically sign you up to the newsletter","wp-google-maps"), get_option('admin_email')); ?></small>
            </div>
        </div>
    </div>

    <div class="wpgmza-flex feature-section two-col">
        <div class="col wpgmza-flex-grid__item">
            <div class="wpgmza-card">
                <h4><?php _e("Unlimited Markers","wp-google-maps"); ?></h4>
                <p><?php _e("Create as many markers as you like","wp-google-maps"); ?></p>
                <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/unlimited-markers.png'; ?>' style="border:1px solid #ccc;" />
            </div>             
        </div>
        <div class="col wpgmza-flex-grid__item">
            <div class="wpgmza-card">
                <h4><?php _e("Store Locator","wp-google-maps"); ?></h4>
                <p><?php _e("Let users search for products, branches and stores near them","wp-google-maps"); ?></p>
                 <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/store-locator.png'; ?>' style="border:1px solid #ccc;" />
            </div>
        </div>
    </div>
    <div class="wpgmza-flex feature-section two-col">
        <div class="col wpgmza-flex-grid__item">
            <div class="wpgmza-card">
                <h4><?php _e("Themes","wp-google-maps"); ?></h4>
                <p><?php _e("Select from various <a href='http://wpgmaps.com/map-themes/' target='_BLANK'>map themes</a>, or make your own.","wp-google-maps"); ?></p>
                <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/themes.png' ?>;' style="border:1px solid #ccc;" />
            </div>
        </div>
        <div class="col wpgmza-flex-grid__item">
            <div class="wpgmza-card">
                <h4><?php _e("Polylines","wp-google-maps"); ?>, <?php _e("Polygons","wp-google-maps"); ?>, <?php _e("Circles","wp-google-maps"); ?>, <?php _e("and Squares","wp-google-maps"); ?></h4>
                <p><?php _e("Add custom shapes such as polygons, polylines, circles and squares!","wp-google-maps"); ?></p>
                <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/polygons-and-polylines.png' ?>;' style="border:1px solid #ccc;" />
            </div>
        </div>
    </div>
                
    <div class="feature-section normal clear" >
            <div class="changelog ">
            
                    <?php if (false) { 
					
					// NB: GDPR
					?>
        
                    <!--<h3 style='margin-top:20px;'><?php _e("How did you find out about us?","wp-google-maps"); ?></h3>

                    <div class="feature-section normal">
                        <form action='' method='POST' name='wpgmaps_feedback'>                                            
                        <p><ul class="wpgmza_welcome_poll" style="list-style: none outside none;">
                            <li style="list-style: none outside none;">
                                <input type="radio" id="wpgmaps_findus_repository" value="repository" name="wpgmaps_findus">
                                <label for="wpgmaps_search_term"><?php _e("WordPress.org plugin repository","wp-google-maps"); ?></label>
                                <br /><input type="text" id="wpgmaps_search_term" class="regular-text" style='margin-top:5px; margin-left:40px;'  name="wpgmaps_search_term" placeholder="<?php _e("What search term did you use?","wp-google-maps"); ?>">
                            </li>
                            <li style="list-style: none outside none;">
                                <input type="radio" id="wpgmaps_findus_searchengine" value="search_engine" name="wpgmaps_findus">
                                <label for="wpgmaps_findus_searchengine"><?php _e("Google or other search engine","wp-google-maps"); ?></label>
                            </li>
                            <li style="list-style: none outside none;">
                                <input type="radio" id="wpgmaps_findus_friend" value="friend" name="wpgmaps_findus">
                                <label for="wpgmaps_findus_friend"><?php _e("Friend recommendation","wp-google-maps"); ?></label>
                            </li>
                            <li style="list-style: none outside none;">
                                <input type="radio" id="wpgmaps_findus_other" value="other" name="wpgmaps_findus">
                                <label for="wpgmaps_findus_other"><?php _e("Other","wp-google-maps"); ?></label>
                                <br /><input type="text" id="wpgmaps_findus_other_url" class="regular-text"  style='margin-top:5px; margin-left:40px;'  name="wpgmaps_findus_other_url" placeholder="<?php _e("Please explain","wp-google-maps"); ?>">

                            </li>
                                
                                
                            </ul></p>
                            <input class='button-primary' type='submit' name='wpgmza_save_feedback' value='<?php _e("Submit and create a map","wp-google-maps"); ?>'> 
                            
                        </form>-->
                        </div>
                        <?php } ?>

                        <div id="wpgmza-support__row" class="feature-section three-col">
                            <div class='col wpgmza-support__col'>
                                <div class="wpgmza-card">
                                    <h4><?php _e("New to WP Gos Maps?","wp-google-maps"); ?></h4>
                                    <p><?php _e("You may want to","wp-google-maps"); ?> <a href='http://wpgmaps.com/documentation/' target='_blank' title='Documentation'><?php _e("review our documentation","wp-google-maps"); ?></a> <?php _e("before you get started. If you're a tech-savvy individual, you may skip this step.","wp-google-maps"); ?></p>
                                </div>
                            </div>
                            <div class='col wpgmza-support__col'>
                                <div class="wpgmza-card">
                                    <h4><?php _e("Help me!","wp-google-maps"); ?></h4>
                                    <p><?php _e("Visit our","wp-google-maps"); ?> <a title='Support Desk' target='_blank' href='http://www.wpgmaps.com/support/'><?php _e("Support Desk","wp-google-maps"); ?></a> <?php _e("for quick and friendly help. We'll answer your request within 24hours.","wp-google-maps"); ?></p>
                                </div>
                            </div>
                            <div class='col wpgmza-support__col'>
                                <div class="wpgmza-card">
                                    <h4><?php _e("Feedback","wp-google-maps"); ?></h4>
                                    <p><?php _e("We need you to help us make this plugin better.","wp-google-maps"); ?> <a href='http://www.wpgmaps.com/contact-us/' title='Feedback' target='_BLANK'><?php _e("Send us your feedback","wp-google-maps"); ?></a> <?php _e("and we'll act on it as soon as humanly possible.","wp-google-maps"); ?></p>
                                </div>
                            </div>
                        </div>
                        
                <a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' href="admin.php?page=wp-google-maps-menu&amp;action=installer&amp;autoskip=true&amp;override=1"><?php echo __("OK! Let's start","wp-google-maps"); ?></a>

            </div>
        </div>
