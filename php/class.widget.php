<?php

namespace WPGMZA;

class Widget extends \WP_Widget
{
	/**
     * Widget Constructor
     */
    function __construct() {
        \WP_Widget::__construct(
            'wpgmza_map_widget', 
            __('WP Google Maps', 'wp-google-maps'), 
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
        $title = apply_filters( 'wpgmza_widget_title', $instance['title'] );
        
        echo $args['before_widget'];
        if ( ! empty( $title ) )
        echo $args['before_title'] . $title . $args['after_title'];
        

        echo do_shortcode("[wpgmza id='".$instance['selection']."']");
        
    
        
        
        
        echo $args['after_widget'];
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
        echo "<label for=\"".$this->get_field_id('title')."\">".__('Title', 'wp-google-maps')."</label>";
        echo "<input class=\"widefat\" id=\"".$this->get_field_id('title')."\" name=\"".$this->get_field_name('title')."\" type=\"text\" value=\"".$title."\" />";
        echo "</p>";
        

        echo "<p><label for=\"".$this->get_field_id('selection')."\">".__('Select your map:', 'wp-google-maps')."</label>";
        echo "<select class='widefat' name='".$this->get_field_name('selection')."'>";
        $this->echoMapSelectOptions($selection);
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
	
	/**
	 * Echos the map select dropdown
	 * @return void
	 */
	protected function echoMapSelectOptions($selection)
	{
		global $wpdb, $WPGMZA_TABLE_NAME_MAPS;
		
		$results = $wpdb->get_results("SELECT id, title FROM $WPGMZA_TABLE_NAME_MAPS");
		foreach($results as $map)
		{
			echo "<option value='{$map->id}'" .
				($selection == $map->id ? "selected" : "") .
				">[ID: {$map->id}] " . htmlentities($map->title) . "</option>";
		}
	}
}

/**
 * Registers WPGMZA\Widget
 * @return void
 */
function load_widget() {
    register_widget( 'WPGMZA\Widget' );
}
add_action('widgets_init', 'WPGMZA\load_widget');

/**
 * Outputs the 'options' for the map select field 
 * @return void
 */
/*function wpgmza_get_widget_select_field($selection) {
    global $wpdb;
    global $wpgmza_tblname_maps;
    
    if (function_exists('wpgmza_get_widget_select_field_pro')) { wpgmza_get_widget_select_field_pro(); return; }

    $results = $wpdb->get_results("SELECT * FROM $wpgmza_tblname_maps WHERE `active` = 0 ORDER BY `id` DESC ");
    
    foreach ( $results as $result ) {
        $sel = ( intval($selection) == $result->id ) ? "selected" : '';
        
        echo "<option ".$sel." value=\"".$result->id."\">[ID: ".$result->id."] ".stripslashes($result->map_title)."</option>";
    }


}*/

?>