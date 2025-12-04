<?php

if(!defined('ABSPATH'))
	exit;

global $wpgmza;

?>

<div id="wpgmza-welcome-page" class="wrap about-wrap">
    <p>&nbsp;</p>

    <img style="width: 400px;" src="<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/new-banner.png'; ?>" alt="WP Go Maps"/>

    <h1>
        <?php _e("Unlock the full power of WP Go Maps!", "wp-google-maps"); ?>
    </h1>

    <div class="about-text">
        <?php _e("Join over <span>62,773</span> professionals and upgrade to our Pro version.", "wp-google-maps"); ?>
    </div>

    <a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=pro-purchase-page-legacy-v10">
        <?php echo __("Upgrade to Premium Now","wp-google-maps"); ?>
    </a>
    
    <p>&nbsp;</p>

    <div class="wpgmza-flex feature-section two-col">
        <div class="col wpgmza-flex-grid__item" >
            <div class="wpgmza-card">
                <h4><?php _e("Unlimited Maps","wp-google-maps"); ?></h4>
                <p><?php _e("Create as many maps as you like.","wp-google-maps"); ?></p>
                <br>
                <br>
                <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/atlas-novus/unlimited.webp'; ?>' style="border:1px solid #ccc;" />
                <br>
                <br>

                <a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=pro-purchase-page-unlimited-maps-legacy-v10">
                    <?php echo __("Unlock Maps","wp-google-maps"); ?>
                </a>
            </div>             
        </div>
        <div class="col wpgmza-flex-grid__item">
            <div class="wpgmza-card">
                <h4><?php _e("Advanced Markers","wp-google-maps"); ?></h4>
                <p><?php _e("Create custom markers with detailed info windows.","wp-google-maps"); ?></p>
                <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/atlas-novus/custom-markers.webp'; ?>' style="border:1px solid #ccc;" />
                <br>
                <br>
                <a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=pro-purchase-page-advanced-markers-legacy-v10">
                    <?php echo __("Unlock Advanced Markers","wp-google-maps"); ?>
                </a>
            </div>
        </div>
    </div>
    <div class="wpgmza-flex feature-section two-col">
        <div class="col wpgmza-flex-grid__item">
            <div class="wpgmza-card">
                <h4><?php _e("Get Directions","wp-google-maps"); ?></h4>
                <p><?php _e("Allow your visitors to get directions to your markers.","wp-google-maps"); ?></p>
                <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/atlas-novus/directions.webp'; ?>' style="border:1px solid #ccc;" />
                <br>
                <br>
                <a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=pro-purchase-page-directions-legacy-v10">
                    <?php echo __("Unlock Directions","wp-google-maps"); ?>
                </a>
            </div>
        </div>
        <div class="col wpgmza-flex-grid__item">
            <div class="wpgmza-card">
                <h4><?php _e("List Your Markers","wp-google-maps"); ?></h4>
                <p><?php _e("Add marker listings to your maps!","wp-google-maps"); ?></p>
                <img src='<?php echo WPGMZA_PLUGIN_DIR_URL . 'images/atlas-novus/marker-listing.webp'; ?>' style="border:1px solid #ccc;" />
                <br>
                <br>
                <a class="button-primary" style='padding:5px; padding-right:15px; padding-left:15px; height:inherit;' target="_BLANK" href="https://www.wpgmaps.com/purchase-professional-version/?utm_source=plugin&amp;utm_medium=link&amp;utm_campaign=pro-purchase-page-marker-listings-legacy-v10">
                    <?php echo __("Unlock Marker Listings","wp-google-maps"); ?>
                </a>
            </div>
        </div>
    </div>
</div>