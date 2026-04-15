<?php

namespace WPGMZA\Integration;

if(!defined('ABSPATH'))
	return;

/**
 * This module integrates the plugin with the Elementor page builder.
 *
 * Follows the same Factory/filter override pattern as the Gutenberg integration,
 * allowing Pro to substitute a ProElementor subclass via the
 * wpgmza_create_WPGMZA\Integration\Elementor filter.
 *
 * All Elementor hooks are deferred until elementor/loaded fires, so this module
 * is a no-op when Elementor is not installed.
 */
class Elementor extends \WPGMZA\Factory
{
	/**
	 * Registered widget descriptors.
	 * Each entry is a stdClass with properties: slug, basePath.
	 *
	 * @var array
	 */
	public $widgets;

	/**
	 * Constructor.
	 *
	 * Bails silently if Elementor is not installed — no hooks, no overhead.
	 * Using class_exists() is more reliable than the elementor/loaded action,
	 * which can fire before our plugin's constructor runs depending on plugin
	 * load order.
	 */
	public function __construct()
	{
		if(!class_exists('\Elementor\Plugin')){
			return;
		}

		$this->widgets = array();
		$this->prepareWidgets();

		add_action('elementor/elements/categories_registered', array($this, 'onRegisterCategories'), 10, 1);
		add_action('elementor/widgets/register',               array($this, 'onRegisterWidgets'),    10, 1);
		add_action('elementor/preview/enqueue_styles',         array($this, 'onEnqueuePreviewStyles'));
	}

	/**
	 * Registers the "WP Go Maps" category in the Elementor widget panel.
	 *
	 * @param \Elementor\Elements_Manager $elements_manager
	 * @return void
	 */
	public function onRegisterCategories($elements_manager)
	{
		$elements_manager->add_category(
			'wpgmza-elementor',
			array(
				'title' => __('WP Go Maps', 'wp-google-maps'),
				'icon'  => 'fa fa-map-marker',
			)
		);
	}

	/**
	 * Registers all prepared widgets with Elementor.
	 *
	 * Widget files are explicitly required here rather than relying on the autoloader.
	 * This is necessary because widget class files guard against \Elementor\Widget_Base
	 * not existing. If the autoloader loaded them before Elementor initialised the class
	 * declaration would be silently skipped.
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager
	 * @return void
	 */
	public function onRegisterWidgets($widgets_manager)
	{
		foreach($this->widgets as $widget){
			if(empty($widget->slug) || empty($widget->basePath)){
				continue;
			}

			$this->registerWidget($widgets_manager, $widget->slug, $widget->basePath);
		}
	}

	/**
	 * Declares which widgets to register.
	 *
	 * Extend in Pro by calling parent::prepareWidgets() then calling
	 * $this->prepareWidget() for each additional widget.
	 *
	 * @return void
	 */
	public function prepareWidgets()
	{
		$this->prepareWidget('map');
		$this->prepareWidget('store-locator');
	}

	/**
	 * Adds a widget descriptor to the registration queue.
	 *
	 * Mirrors prepareBlock() in GutenbergExtended.
	 *
	 * @param string      $slug             Widget slug (used to locate the file and derive the class name).
	 * @param string|bool $basePathOverride  Full base path override, or false to use the plugin's default path.
	 * @return void
	 */
	public function prepareWidget($slug, $basePathOverride = false)
	{
		$this->widgets[] = (object) array(
			'slug'     => $slug,
			'basePath' => !empty($basePathOverride)
				? rtrim($basePathOverride, '/')
				: rtrim(WPGMZA_PLUGIN_DIR_PATH, '/'),
		);
	}

	/**
	 * Loads the widget PHP file and registers the widget instance with Elementor.
	 *
	 * The widget class name is derived from the slug:
	 *   'map'           => WPGMZA\Integration\ElementorMapWidget
	 *   'store-locator' => WPGMZA\Integration\ElementorStoreLocatorWidget
	 *
	 * @param \Elementor\Widgets_Manager $manager
	 * @param string                     $slug
	 * @param string                     $basePath
	 * @return void
	 */
	public function registerWidget($manager, $slug, $basePath)
	{
		$widgetFile = $basePath . '/includes/3rd-party-integration/elementor/class.elementor-' . $slug . '-widget.php';

		if(!file_exists($widgetFile)){
			return;
		}

		require_once $widgetFile;

		$translatedSlug = ucwords(str_replace(array('-', '_'), ' ', $slug));
		$translatedSlug = str_replace(' ', '', $translatedSlug);
		$widgetClass    = 'WPGMZA\\Integration\\Elementor' . $translatedSlug . 'Widget';

		if(!class_exists($widgetClass)){
			return;
		}

		$manager->register(new $widgetClass());
	}

	/**
	 * Enqueues the elementor.css stylesheet into the Elementor canvas iframe.
	 *
	 * Must use elementor/preview/enqueue_styles — the editor/after_enqueue_styles
	 * action only targets the editor panel sidebar, not the canvas where previews render.
	 *
	 * @return void
	 */
	public function onEnqueuePreviewStyles()
	{
		wp_enqueue_style(
			'wpgmza-elementor-integration',
			plugin_dir_url(WPGMZA_FILE) . 'css/elementor.css',
			array('dashicons'),
			$this->getVersion()
		);
	}

	/**
	 * Returns a composite version string for cache-busting.
	 * Identical to the helper used in Gutenberg and GutenbergExtended.
	 *
	 * @return string
	 */
	protected function getVersion()
	{
		global $wpgmza;
		$version = $wpgmza->getBasicVersion();
		if(method_exists($wpgmza, 'getProVersion')){
			$version .= '+pro-' . $wpgmza->getProVersion();
		}
		return $version;
	}
}
