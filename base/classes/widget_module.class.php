<?php

if(!defined('ABSPATH'))
	exit;

class wpgmza_widget extends WP_Widget {

    /**
     * Widget Constructor
     */
    function __construct() {
        parent::__construct(
            'wpgmza_map_widget', 
            __('WP Go Maps', 'wp-google-maps'), 
            array(
                'description' => __( 'Add your map as a widget', 'wp-google-maps' ),
                'classname' => 'wpgmza_widget'
            )
        );
    }

    /**
     * Outputs Widget Content
     *
     * @param array   $args       Display arguments including 'before_title', 'after_title', 'before_widget', and 'after_widget'.
     * @param array   $instance   The settings for the instance of a widget
     *
     * @return void
     */
    public function widget( $args, $instance ) {
		
		if(!isset($instance['title']))
			$instance['title'] = '';
		
        /* Developer Hook (Filter) - Alter the widget title */
        $title = apply_filters( 'widget_title', $instance['title'] );
        
        echo wp_kses_post($args['before_widget']);
        if (!empty($title)){
            echo wp_kses_post($args['before_title'] . esc_html($title) . $args['after_title']);
        }
        
		if(!isset($instance['selection'])){
			global $wpdb;
			$instance['selection'] = $wpdb->get_var("SELECT id FROM {$wpdb->prefix}wpgmza_maps ORDER BY id DESC LIMIT 1");
		}

        echo do_shortcode("[wpgmza id='".intval($instance['selection'])."']");
        
        echo wp_kses_post($args['after_widget']);
    }

    /**
     * Outputs the settings update form.
     *
     * @param array   $instance     Display arguments including 'before_title', 'after_title', 'before_widget', and 'after_widget'.
     *
     * @return void/string  'noform' (Default - Inherited)
     */
    public function form($instance) {
        if( $instance) {
             if (isset($instance['title'])) { $title = esc_attr($instance['title']); } else { $title = ""; }
             if (isset($instance['selection'])) { $selection = esc_attr($instance['selection']); } else { $selection = false; }
        } else {
            $title = '';
            $selection = false;
        }
        
        echo "<p>";
        echo "<label for=\"" . esc_attr($this->get_field_id('title')) . "\">".__('Title', 'wp-google-maps')."</label>";
        echo "<input class=\"widefat\" id=\"" . esc_attr($this->get_field_id('title')) . "\" name=\"" . esc_attr($this->get_field_name('title')) . "\" type=\"text\" value=\"" . esc_attr($title) . "\" />";
        echo "</p>";
        

        echo "<p><label for=\"" . esc_attr($this->get_field_id('selection')) . "\">".__('Select your map:', 'wp-google-maps')."</label>";
        echo "<select class='widefat' name='" . esc_attr($this->get_field_name('selection')) . "'>";
        wpgmza_get_widget_select_field($selection);
        echo "</select></p>";
   
    }

     /**
     * Updates a particular instance of a widget.
     *
     * @param array   $new_instance     New settings for this instance as input
     * @param array   $old_instance     Old settings for this instance
     *
     * @return array $instance
     */
    public function update( $new_instance, $old_instance ) {
        $instance = array();
        $instance['selection'] = ( ! empty( $new_instance['selection'] ) ) ? strip_tags( $new_instance['selection'] ) : '';
        $instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';

        return $instance;
    }
} 

/**
 * Registers the 'wpgmza' widget
 *
 * @return void
 */
function wpgmza_load_widget() {
    register_widget( 'wpgmza_widget' );
}

/**
 * Outputs the 'options' for the map select field 
 *
 * @return void
 */
function wpgmza_get_widget_select_field($selection) {
    global $wpdb;
    global $wpgmza_tblname_maps;
    
    if (function_exists('wpgmza_get_widget_select_field_pro')) { wpgmza_get_widget_select_field_pro(); return; }

    $results = $wpdb->get_results("SELECT * FROM $wpgmza_tblname_maps WHERE `active` = 0 ORDER BY `id` DESC ");
    
    foreach ( $results as $result ) {
        $sel = ( intval($selection) == $result->id ) ? "selected" : '';
        
        echo "<option ".$sel." value=\"" . esc_attr($result->id) . "\">[ID: " . intval($result->id) . "] " . esc_html($result->map_title) . "</option>";
    }



}
add_action( 'widgets_init', 'wpgmza_load_widget' );
