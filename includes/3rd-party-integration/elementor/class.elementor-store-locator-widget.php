<?php

namespace WPGMZA\Integration;

if(!defined('ABSPATH'))
	return;

if(!class_exists('\Elementor\Widget_Base'))
	return;

require_once __DIR__ . '/class.elementor-module-widget.php';

use Elementor\Controls_Manager;

/**
 * WP Go Maps - Elementor Store Locator Widget
 *
 * Renders the WP Go Maps store locator inside an Elementor page.
 * Extends ElementorModuleWidget for the shared preview/render pattern.
 * Controls mirror the Gutenberg store locator block inspector panel.
 * Frontend rendering delegates to the wpgmza_store_locator shortcode.
 */
class ElementorStoreLocatorWidget extends ElementorModuleWidget
{
	public function get_name()
	{
		return 'wpgmza-store-locator';
	}

	public function get_title()
	{
		return __('Store Locator', 'wp-google-maps');
	}

	public function get_icon()
	{
		return 'dashicons dashicons-store';
	}

	public function get_keywords()
	{
		return array('store locator', 'store', 'store finder', 'map', 'maps', 'wpgmza');
	}

	protected function getPreviewIcon()
	{
		return 'dashicons-store';
	}

	protected function getPreviewTitle()
	{
		return __('Your store locator will appear here on your websites front end', 'wp-google-maps');
	}

	protected function getPreviewHint()
	{
		return __('If used on map page, remember to disable the store locator in your map settings (Maps > Edit > Settings > Store Locator)', 'wp-google-maps');
	}

	/**
	 * Registers widget controls (settings panel fields).
	 *
	 * Mirrors the Gutenberg store locator block inspector panels:
	 *   Defaults section  : default_address, default_radius
	 *   Separation section: url (redirect to a separate map page)
	 *
	 * @return void
	 */
	protected function register_controls()
	{
		$this->start_controls_section(
			'section_defaults',
			array('label' => __('Defaults', 'wp-google-maps'))
		);

		$this->add_control(
			'default_address',
			array(
				'label'       => __('Address', 'wp-google-maps'),
				'type'        => Controls_Manager::TEXT,
				'default'     => '',
				'placeholder' => __('Default search address', 'wp-google-maps'),
			)
		);

		$this->add_control(
			'default_radius',
			array(
				'label'   => __('Radius', 'wp-google-maps'),
				'type'    => Controls_Manager::SELECT,
				'default' => 'none',
				'options' => $this->getRadiusOptions(),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_separation',
			array('label' => __('Separation Redirect', 'wp-google-maps'))
		);

		$this->add_control(
			'url',
			array(
				'label'       => __('URL', 'wp-google-maps'),
				'type'        => Controls_Manager::TEXT,
				'default'     => '',
				'placeholder' => __('https://', 'wp-google-maps'),
				'description' => __('Only set this if your map is located on another page', 'wp-google-maps'),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Builds the radius select options, mirroring the Gutenberg block's getRadiusOptions().
	 *
	 * @return array
	 */
	protected function getRadiusOptions()
	{
		$options  = array('none' => __('Default (As set in map)', 'wp-google-maps'));
		$defaults = '1,2,5,10,25,50,100,200,300';
		$setting  = get_option('WPGMZA_OTHER_SETTINGS');
		$radii    = (!empty($setting['wpgmza_store_locator_radii']) && strlen($setting['wpgmza_store_locator_radii']))
			? $setting['wpgmza_store_locator_radii']
			: $defaults;

		foreach(explode(',', $radii) as $radius){
			$radius = (int) trim($radius);
			if($radius > 0){
				$options[(string) $radius] = (string) $radius;
			}
		}

		return $options;
	}

	/**
	 * Builds the shortcode string from current widget settings.
	 * Called by the parent render() method on the frontend.
	 *
	 * @return string
	 */
	protected function getShortcode()
	{
		$settings = $this->get_settings_for_display();
		$atts     = array();

		if(!empty($settings['default_address'])){
			$atts[] = 'default_address="' . esc_attr($settings['default_address']) . '"';
		}

		if(!empty($settings['default_radius']) && $settings['default_radius'] !== 'none'){
			$atts[] = 'default_radius="' . esc_attr($settings['default_radius']) . '"';
		}

		if(!empty($settings['url'])){
			$atts[] = 'url="' . esc_url($settings['url']) . '"';
		}

		$shortcode = '[' . \WPGMZA\Shortcodes::SLUG . '_' . \WPGMZA\Shortcodes::STORE_LOCATOR;
		if(!empty($atts)){
			$shortcode .= ' ' . implode(' ', $atts);
		}
		$shortcode .= ']';

		return $shortcode;
	}
}
