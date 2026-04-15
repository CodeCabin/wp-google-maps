<?php

namespace WPGMZA\Integration;

if(!defined('ABSPATH'))
	return;

if(!class_exists('\Elementor\Widget_Base'))
	return;

use Elementor\Widget_Base;

/**
 * Abstract base class for all WP Go Maps Elementor module widgets.
 *
 * Defines the shared preview/render pattern used by both base and Pro widgets:
 *   - get_categories() pins all widgets to the wpgmza-elementor panel category
 *   - renderPreview() outputs the gray module-style placeholder
 *   - render() handles the edit-mode guard: preview in editor, shortcode on frontend
 *   - content_template() delegates to renderPreview() for the JS canvas path
 *
 * Subclasses must implement:
 *   - get_name(), get_title(), get_icon(), get_keywords()
 *   - register_controls()
 *   - getPreviewIcon()  — dashicons class e.g. 'dashicons-location'
 *   - getPreviewTitle() — main placeholder text line
 *   - getShortcode()    — full shortcode string to echo on the frontend
 *
 * Optionally override:
 *   - getPreviewHint()  — italic hint line beneath the title (empty by default)
 *
 * Pro extends this with ProElementorModuleWidget, which adds map-selection
 * helpers (getMapOptions, getDefaultMapId, addMapSelectorControl) used by
 * all Pro module widgets.
 */
abstract class ElementorModuleWidget extends Widget_Base
{
	/**
	 * All WP Go Maps widgets belong to the wpgmza-elementor panel category.
	 *
	 * @return array
	 */
	public function get_categories()
	{
		return array('wpgmza-elementor');
	}

	/**
	 * The dashicons CSS class for the preview placeholder icon.
	 * e.g. 'dashicons-location', 'dashicons-list-view'
	 *
	 * @return string
	 */
	abstract protected function getPreviewIcon();

	/**
	 * The main text line shown in the preview placeholder.
	 *
	 * @return string
	 */
	abstract protected function getPreviewTitle();

	/**
	 * Optional italic hint shown beneath the title in the preview placeholder.
	 * Return an empty string to omit it.
	 *
	 * @return string
	 */
	protected function getPreviewHint()
	{
		return '';
	}

	/**
	 * Outputs the gray module-style editor preview placeholder.
	 * Matches the store locator and all Gutenberg module block previews.
	 *
	 * @return void
	 */
	protected function renderPreview()
	{
		$hint = $this->getPreviewHint();
		?>
		<div class="wpgmza-elementor-block wpgmza-elementor-block-module">
			<span class="dashicons <?php echo esc_attr($this->getPreviewIcon()); ?>"></span>
			<span class="wpgmza-elementor-block-title">
				<?php echo esc_html($this->getPreviewTitle()); ?>
			</span>
			<?php if(!empty($hint)): ?>
			<div class="wpgmza-elementor-block-hint">
				<?php echo esc_html($hint); ?>
			</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Returns the shortcode string to output on the frontend.
	 * Implement in each subclass using get_settings_for_display().
	 *
	 * @return string
	 */
	abstract protected function getShortcode();

	/**
	 * PHP render — shows the preview placeholder in the editor,
	 * outputs the shortcode on the frontend.
	 *
	 * @return void
	 */
	protected function render()
	{
		if(\Elementor\Plugin::$instance->editor->is_edit_mode()){
			$this->renderPreview();
			return;
		}

		echo do_shortcode($this->getShortcode());
	}

	/**
	 * JS editor canvas preview template — same placeholder as renderPreview().
	 *
	 * @return void
	 */
	protected function content_template()
	{
		$this->renderPreview();
	}
}
