<?php global $wpgmza_global_array; ?>
<div class="wrap about-wrap">
<p>&nbsp;</p>

<h1><?php 

global $wpgmza;
printf(__("Welcome to WP Google Maps version %s","wp-google-maps"), $wpgmza->getBasicVersion());

?></h1>

<div class="about-text"><?php _e("Build amazing maps through a simple interface and powerful functionality along with world class support.","wp-google-maps"); ?></div>

<div class="wpgmza-badge" style=''></div>

<a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' href="admin.php?page=wp-google-maps-menu&override=1"><?php echo __("Skip intro and create a map","wp-google-maps"); ?></a>
<p>&nbsp;</p>


<h2 class="nav-tab-wrapper wp-clearfix">
	<a href="admin.php?page=wp-google-maps-menu&action=welcome_page" class="nav-tab  nav-tab-active"><?php _e("Welcome","wp-google-maps"); ?></a>
	<a href="admin.php?page=wp-google-maps-menu&action=credits" class="nav-tab"><?php _e("Credits","wp-google-maps"); ?></a>

</h2>

    <div class="feature-section two-col">
        <div class="col">
        <h4><?php _e("Unlimited Markers","wp-google-maps"); ?></h4>
        <p><?php _e("Create as many markers as you like","wp-google-maps"); ?></p>
         <img src='<?php echo WPGMAPS_DIR; ?>base/assets/feature1.jpg' style="border:1px solid #ccc;" />              
        </div>
        <div class="col">
        <h4><?php _e("Store Locator","wp-google-maps"); ?></h4>
        <p><?php _e("Let users search for products, branches and stores near them","wp-google-maps"); ?></p>
         <img src='<?php echo WPGMAPS_DIR; ?>base/assets/feature2.jpg?1=2' style="border:1px solid #ccc;" />
        </div>
    </div>
    <div class="feature-section two-col">
        <div class="col">
        <h4><?php _e("Themes","wp-google-maps"); ?></h4>
        <p><?php _e("Select from various <a href='http://wpgmaps.com/map-themes/' target='_BLANK'>map themes</a>, or make your own.","wp-google-maps"); ?></p>
         <img src='<?php echo WPGMAPS_DIR; ?>base/assets/feature3.jpg' style="border:1px solid #ccc;" />
        </div>
        <div class="col">
        <h4><?php _e("Polylines","wp-google-maps"); ?>, <?php _e("Polygons","wp-google-maps"); ?>, <?php _e("Circles","wp-google-maps"); ?>, <?php _e("and Squares","wp-google-maps"); ?></h4>
        <p><?php _e("Add custom shapes such as polygons, polylines, circles and squares!","wp-google-maps"); ?></p>
         <img src='<?php echo WPGMAPS_DIR; ?>base/assets/feature4.jpg' style="border:1px solid #ccc;" />              
        </div>
    </div>


                <hr />
                
                <div class="feature-section normal clear" >
                    <div class="changelog ">
                    
                                <?php if ($wpgmza_global_array['code'] != "100") { 
								
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
                                <?php } else { ?>
                                <div class="wpgm_notice_message">
                                    <ul>
                                        <li>
                                            <?php echo $wpgmza_global_array['message']; ?>
                                        </li>
                                    </ul>
                                </div>
                                <?php } ?>

                        <div class="feature-section three-col">
                            <div class='col'>
                                <h4><?php _e("New to WP Google Maps?","wp-google-maps"); ?></h4>
                                <p><?php _e("You may want to","wp-google-maps"); ?> <a href='http://wpgmaps.com/documentation/' target='_blank' title='Documentation'><?php _e("review our documentation","wp-google-maps"); ?></a> <?php _e("before you get started. If you're a tech-savvy individual, you may skip this step.","wp-google-maps"); ?></p>
                            </div>
                            <div class='col'>
                                <h4><?php _e("Help me!","wp-google-maps"); ?></h4>
                                <p><?php _e("Visit our","wp-google-maps"); ?> <a title='Support Desk' target='_blank' href='http://www.wpgmaps.com/support/'><?php _e("Support Desk","wp-google-maps"); ?></a> <?php _e("for quick and friendly help. We'll answer your request within 24hours.","wp-google-maps"); ?></p>
                            </div>
                            <div class='col'>
                                <h4><?php _e("Feedback","wp-google-maps"); ?></h4>
                                <p><?php _e("We need you to help us make this plugin better.","wp-google-maps"); ?> <a href='http://www.wpgmaps.com/contact-us/' title='Feedback' target='_BLANK'><?php _e("Send us your feedback","wp-google-maps"); ?></a> <?php _e("and we'll act on it as soon as humanly possible.","wp-google-maps"); ?></p>
                            </div>
                        </div>
                        
                <a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' href="admin.php?page=wp-google-maps-menu&override=1"><?php echo __("OK! Let's start","wp-google-maps"); ?></a>

            </div>
        </div>

</div>