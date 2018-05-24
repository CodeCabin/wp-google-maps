<?php

namespace codecabin\PluginDeactivationForm;

if(!defined('ABSPATH'))
	exit;

// NB: GDPR
return;

if(!is_admin())
	return;

global $pagenow;
if($pagenow != "plugins.php")
	return;

if(defined('CODECABIN_DEACTIVATE_FEEDBACK_FORM_INCLUDED'))
	return;

define('CODECABIN_DEACTIVATE_FEEDBACK_FORM_INCLUDED', true);

function admin_enqueue_scripts()
{
	
	// Enqueue scripts
	wp_enqueue_script('remodal', plugin_dir_url(__FILE__) . 'remodal.min.js');
	wp_enqueue_style('remodal', plugin_dir_url(__FILE__) . 'remodal.css');
	wp_enqueue_style('remodal-default-theme', plugin_dir_url(__FILE__) . 'remodal-default-theme.css');
	
	wp_enqueue_script('codecabin-deactivate-feedback-form', plugin_dir_url(__FILE__) . 'deactivate-feedback-form.js');
	wp_enqueue_style('codecabin-deactivate-feedback-form', plugin_dir_url(__FILE__) . 'deactivate-feedback-form.css');
	
	// Localized strings
	wp_localize_script('codecabin-deactivate-feedback-form', 'codecabin_deactivate_feedback_form_strings', array(
		'quick_feedback'			=> __('Quick Feedback', 'codecabin'),
		'foreword'					=> __('If you would be kind enough, please tell us why you\'re deactivating?', 'codecabin'),
		'better_plugins_name'		=> __('Please tell us which plugin?', 'codecabin'),
		'please_tell_us'			=> __('Please tell us the reason so we can improve the plugin', 'codecabin'),
		'do_not_attach_email'		=> __('Do not send my e-mail address with this feedback', 'codecabin'),
		
		'brief_description'			=> __('Please give us any feedback that could help us improve', 'codecabin'),
		
		'cancel'					=> __('Cancel', 'codecabin'),
		'skip_and_deactivate'		=> __('Skip &amp; Deactivate', 'codecabin'),
		'submit_and_deactivate'		=> __('Submit &amp; Deactivate', 'codecabin'),
		'please_wait'				=> __('Please wait', 'codecabin'),
		'thank_you'					=> __('Thank you!', 'codecabin')
	));
	
	// Plugins
	$plugins = apply_filters('codecabin_deactivate_feedback_form_plugins', array());
	
	// Reasons
	$defaultReasons = array(
		'suddenly-stopped-working'	=> __('The plugin suddenly stopped working', 'codecabin'),
		'plugin-broke-site'			=> __('The plugin broke my site', 'codecabin'),
		'no-longer-needed'			=> __('I don\'t need this plugin any more', 'codecabin'),
		'found-better-plugin'		=> __('I found a better plugin', 'codecabin'),
		'temporary-deactivation'	=> __('It\'s a temporary deactivation, I\'m troubleshooting', 'codecabin'),
		'other'						=> __('Other', 'codecabin')
	);
	
	foreach($plugins as $plugin)
	{
		$plugin->reasons = apply_filters('codecabin_deactivate_feedback_form_reasons', $defaultReasons, $plugin);
	}
	
	// Send plugin data
	wp_localize_script('codecabin-deactivate-feedback-form', 'codecabin_deactivate_feedback_form_plugins', $plugins);
}

add_action('admin_enqueue_scripts', 'codecabin\\PluginDeactivationForm\\admin_enqueue_scripts');

/**
 * Hook for adding plugins, pass an array of objects in the following format:
 *  'slug'		=> 'plugin-slug'
 *  'version'	=> 'plugin-version'
 * @return array The plugins in the format described above
 */
function deactivate_feedback_form_plugins($plugins)
{
	return $plugins;
}
 
add_filter('codecabin_deactivate_feedback_form_plugins', 'codecabin\PluginDeactivationForm\deactivate_feedback_form_plugins');