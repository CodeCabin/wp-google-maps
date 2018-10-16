<?php

namespace WPGMZA\Integration;

class Gutenberg extends \WPGMZA\Factory
{
	public function __construct()
	{
		global $wpgmza;
		
		add_action('enqueue_block_assets', array(
			$this,
			'onEnqueueBlockAssets'
		));
		
		add_action('init', array(
			$this,
			'onInit'
		));
		
		if(function_exists('register_block_type'))
			register_block_type('gutenberg-wpgmza/block', array(
				'render_callback' => array(
					$this,
					'onRender'
				)
			));
	}
	
	public function onEnqueueBlockAssets()
	{
		global $wpgmza;
		
		$wpgmza->loadScripts();
		
		wp_enqueue_style(
			'wpgmza-gutenberg-integration', 
			plugin_dir_url(WPGMZA_FILE) . 'css/gutenberg.css', 
			'', 
			WPGMZA_VERSION
		);
	}
	
	public function onInit()
	{
		global $wpgmza;
		
		if(empty($wpgmza->settings->developer_mode))
			return;
		
		// Strip out JS module code for browser compatibility
		$filename = plugin_dir_path(WPGMZA_FILE) . 'js/v8/3rd-party-integration/gutenberg/dist/gutenberg.js';
		
		$contents = file_get_contents($filename);
		
		$contents = preg_replace('/Object\.defineProperty\(exports.+?;/s', '', $contents);
		
		$contents = preg_replace('/exports\.default = /', '', $contents);
		
		file_put_contents($filename, $contents);
	}
	
	public function onRender($attr)
	{
		extract($attr);
		
		return '[wpgmza id="1"]';
	}
}
