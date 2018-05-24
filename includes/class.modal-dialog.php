<?php

namespace WPGMZA;

class ModalDialog extends DOMDocument
{
	public function __construct()
	{
		DOMDocument::__construct();
		
		wp_enqueue_script('remodal', plugin_dir_url(__DIR__) . 'lib/remodal.min.js');
		wp_enqueue_style('remodal', plugin_dir_url(__DIR__) . 'lib/remodal.css');
		wp_enqueue_style('remodal-default-theme', plugin_dir_url(__DIR__) . 'lib/remodal-default-theme.css');
		
		wp_enqueue_style('wpgmaps-style-pro', plugin_dir_url(__DIR__) . 'css/wpgmza_style_pro.css');
	}
}
