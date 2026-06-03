<?php

namespace WPGMZA;

if(!defined('ABSPATH'))
	return;

/**
 * Compatibility layer between Atlas Major (base) and the Pro add-on.
 *
 * Pattern mirrors Pro9Compatibility / Pro10Compatibility — checks
 * `$wpgmza_pro_version` against `self::$requiresPro` and degrades
 * safely when Pro is older than Atlas Major requires.
 *
 * The minimum required Pro version is held on this class (not in
 * constants.php) so the whole Atlas Major Pro-gate can be retired
 * by deleting this one file when the engine is eventually sunset.
 *
 * Behaviour when Pro is incompatible AND the user has Atlas Major selected:
 *   - InternalEngine::getEngine() returns Atlas Novus instead of Atlas
 *     Major, so template / CSS / JS path resolution + isAtlasMajor()
 *     all fall back uniformly. The stored setting is left intact, so
 *     Atlas Major auto-reactivates when Pro is updated.
 *   - A dismissible admin notice is rendered on every admin page via
 *     WordPress's native `admin_notices` action. Dismissal persists
 *     per-user via user_meta — true "nag once" behaviour.
 *
 * No write-back to settings, no module load attempts. Atlas Major doesn't
 * introduce any new PHP/JS classes — its behaviour is purely template/CSS/
 * JS opt-in via getEngine() / isAtlasMajor() — so a read-time fallback
 * is sufficient to disable every Atlas Major code path cleanly.
 */
class ProAtlasMajorCompatibility {

	/**
	 * Minimum Pro add-on version that ships Atlas Major support.
	 * Bump this when Atlas Major depends on a newer Pro release.
	 */
	public static $requiresPro = '10.1.0';

	const NOTICE_DISMISSED_USER_META = 'wpgmza_atlas_major_pro_outdated_dismissed';
	const NOTICE_DISMISS_NONCE       = 'wpgmza_atlas_major_pro_outdated_dismiss';
	const NOTICE_DISMISS_AJAX_ACTION = 'wpgmza_atlas_major_pro_outdated_dismiss';

	public function __construct(){
		add_action('admin_notices', array($this, 'maybeRenderNotice'));
		add_action('wp_ajax_' . self::NOTICE_DISMISS_AJAX_ACTION, array($this, 'ajaxDismissNotice'));
	}

	/**
	 * Render a dismissible admin notice on WP Go Maps admin pages when:
	 *   - The current admin page is one of ours (page param starts with
	 *     `wp-google-maps-menu`)
	 *   - The current user can manage options
	 *   - The stored engine is Atlas Major
	 *   - Pro is older than the required version
	 *   - The current user hasn't already dismissed this notice
	 *
	 * Scoped to our pages so we don't spam unrelated admin screens (Posts,
	 * Plugins, Dashboard, etc.) — matches user preference.
	 */
	public function maybeRenderNotice(){
		global $wpgmza;

		/* Limit to WP Go Maps admin pages. All our pages live under the
		   `wp-google-maps-menu` slug (see class.admin-ui.php) — Maps,
		   Settings, Styling, Support, Pro Features, and the map editor. */
		if(empty($_GET['page']) || strpos($_GET['page'], 'wp-google-maps-menu') !== 0) return;

		if(!current_user_can('manage_options')) return;
		if(empty($wpgmza) || empty($wpgmza->settings) || empty($wpgmza->settings->internal_engine)) return;
		/* Use the STORED engine here (not getEngine()) — we only want to
		   nag users who actively chose Atlas Major. getEngine() would
		   return Atlas Novus due to the fallback we're notifying them about. */
		$storedEngine = method_exists($wpgmza->internalEngine, 'getStoredEngine')
			? $wpgmza->internalEngine->getStoredEngine()
			: $wpgmza->settings->internal_engine;
		if($storedEngine !== InternalEngine::ATLAS_MAJOR) return;
		if(!self::isProIncompatible()) return;

		$userId = get_current_user_id();
		if(get_user_meta($userId, self::NOTICE_DISMISSED_USER_META, true)) return;

		$message = sprintf(
			/* translators: %s = required Pro version */
			__("Atlas Major has been temporarily paused because your WP Go Maps Pro add-on is older than version %s. The editor will use Atlas Novus until Pro is updated, after which Atlas Major will resume automatically.", "wp-google-maps"),
			self::$requiresPro
		);

		$nonce = wp_create_nonce(self::NOTICE_DISMISS_NONCE);
		$ajaxAction = self::NOTICE_DISMISS_AJAX_ACTION;
		?>
		<div class="notice notice-warning is-dismissible" data-wpgmza-atlas-major-compat-notice>
			<p><strong><?php esc_html_e("WP Go Maps — Atlas Major Paused", "wp-google-maps"); ?></strong></p>
			<p><?php echo esc_html($message); ?></p>
		</div>
		<script>
		(function($){
			$(document).on('click', '[data-wpgmza-atlas-major-compat-notice] .notice-dismiss', function(){
				$.post(ajaxurl, {
					action: <?php echo wp_json_encode($ajaxAction); ?>,
					_ajax_nonce: <?php echo wp_json_encode($nonce); ?>
				});
			});
		})(jQuery);
		</script>
		<?php
	}

	/**
	 * AJAX handler for the dismiss button. Persists dismissal per-user via
	 * user_meta so the notice never appears again for that user (matches
	 * the lead dev's "nag once for engine switches" guidance).
	 */
	public function ajaxDismissNotice(){
		check_ajax_referer(self::NOTICE_DISMISS_NONCE);
		if(!current_user_can('manage_options')){
			wp_send_json_error('insufficient permissions');
		}
		update_user_meta(get_current_user_id(), self::NOTICE_DISMISSED_USER_META, 1);
		wp_send_json_success();
	}

	/**
	 * Returns true when Pro is active AND its version is below the minimum
	 * required for Atlas Major. Returns false when Pro is missing entirely
	 * (no Pro = no Pro-feature drift to worry about — base Atlas Major
	 * features still work standalone).
	 *
	 * Static so InternalEngine::getEngine() can call it without needing
	 * an instance reference (matches the lightweight pattern used by the
	 * existing Pro version compat checks).
	 *
	 * @return bool
	 */
	public static function isProIncompatible(){
		global $wpgmza_pro_version;
		if(empty($wpgmza_pro_version)) return false;
		return version_compare($wpgmza_pro_version, self::$requiresPro, '<');
	}
}
