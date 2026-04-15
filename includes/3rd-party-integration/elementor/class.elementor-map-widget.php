<?php

namespace WPGMZA\Integration;

if(!defined('ABSPATH'))
	return;

if(!class_exists('\Elementor\Widget_Base'))
	return;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

/**
 * WP Go Maps - Elementor Map Widget
 *
 * Renders a WP Go Maps map inside an Elementor page.
 * The editor preview shows the same placeholder used by the Gutenberg block.
 * Frontend rendering delegates entirely to the wpgmza shortcode system.
 *
 * In the base plugin, the first available map is used automatically.
 * Pro extends this widget to add a map selector dropdown via register_controls().
 */
class ElementorMapWidget extends Widget_Base
{
	/**
	 * Returns the widget's internal machine-readable name
	 *
	 * @return string
	 */
	public function get_name()
	{
		return 'wpgmza-map';
	}

	/**
	 * Returns the widget's display title in the Elementor panel
	 *
	 * @return string
	 */
	public function get_title()
	{
		return __('Map', 'wp-google-maps');
	}

	/**
	 * Returns the Elementor icon class for this widget's panel entry
	 *
	 * @return string
	 */
	public function get_icon()
	{
		return 'dashicons dashicons-location-alt';
	}

	/**
	 * Returns the category slugs this widget belongs to.
	 * Must match the slug registered in Elementor::onRegisterCategories().
	 *
	 * @return array
	 */
	public function get_categories()
	{
		return array('wpgmza-elementor');
	}

	/**
	 * Returns keywords for the Elementor widget search
	 *
	 * @return array
	 */
	public function get_keywords()
	{
		return array('map', 'wpgmza', 'wp go maps', 'google maps', 'location');
	}

	/**
	 * Registers widget controls (settings panel fields).
	 *
	 * Calls register_map_selector_controls() first, which is empty in the base
	 * plugin but overridden in Pro to inject a map selector dropdown.
	 *
	 * @return void
	 */
	protected function register_controls()
	{
		$this->start_controls_section(
			'section_map',
			array(
				'label' => __('Map Settings', 'wp-google-maps'),
			)
		);

		$this->register_map_selector_controls();

		$this->add_control(
			'map_editor_link',
			array(
				'type' => Controls_Manager::RAW_HTML,
				'raw'  => sprintf(
					'<p class="map-block-elementor-button-container"><a href="%s" target="_blank" class="button button-primary"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> %s</a></p>',
					esc_url(admin_url('admin.php?page=wp-google-maps-menu')),
					esc_html__('Go to Map Editor', 'wp-google-maps')
				),
			)
		);

		$this->add_control(
			'documentation_link',
			array(
				'type' => Controls_Manager::RAW_HTML,
				'raw'  => sprintf(
					'<p class="map-block-elementor-button-container"><a href="%s" target="_blank" class="button button-primary"><i class="fa fa-book" aria-hidden="true"></i> %s</a></p>',
					esc_url('https://www.wpgmaps.com/help/docs/creating-your-first-map/'),
					esc_html__('View Documentation', 'wp-google-maps')
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Hook for Pro to inject a map selector control before the action buttons.
	 * Empty in the base plugin — base always uses the first available map.
	 *
	 * @return void
	 */
	protected function register_map_selector_controls()
	{
		// Base plugin: no selector — first map is used automatically.
		// Pro overrides this to add a SELECT control populated from the DB.
	}

	/**
	 * Gets the map ID to render.
	 *
	 * In the base plugin this always returns the first available map.
	 * Pro overrides this to return the user-selected map ID from the widget settings.
	 *
	 * @return int
	 */
	protected function getMapId()
	{
		global $wpdb, $WPGMZA_TABLE_NAME_MAPS;
		$map_id = $wpdb->get_var("SELECT id FROM $WPGMZA_TABLE_NAME_MAPS WHERE active = 0 ORDER BY id ASC LIMIT 1");
		return $map_id ? (int) $map_id : 1;
	}

	/**
	 * PHP render method - produces output for both the frontend and the Elementor editor preview iframe.
	 *
	 * Shows a static placeholder in the editor (same as the Gutenberg block) to avoid
	 * running the shortcode and its full asset pipeline inside the admin context.
	 * On the frontend, delegates to the wpgmza shortcode system.
	 *
	 * @return void
	 */
	protected function render()
	{
		if(\Elementor\Plugin::$instance->editor->is_edit_mode()){
			$this->renderPreview();
			return;
		}

		echo do_shortcode('[wpgmza id="' . $this->getMapId() . '"]');
	}

	/**
	 * Renders the static editor preview placeholder.
	 * Shared between render() (PHP path) and content_template() (JS path).
	 *
	 * @return void
	 */
	protected function renderPreview()
	{
		?>
		<div class="wpgmza-elementor-block">
			<span class="dashicons dashicons-location-alt"></span>
			<span class="wpgmza-elementor-block-title">
				<?php esc_html_e('Your map will appear here on your websites front end', 'wp-google-maps'); ?>
			</span>
		</div>
		<?php
	}

	/**
	 * Elementor editor JS preview template (client-side path).
	 *
	 * Outputs the same gray placeholder as renderPreview().
	 * This runs inside the editor canvas without a server round-trip.
	 *
	 * @return void
	 */
	protected function content_template()
	{
		$this->renderPreview();
	}
}
