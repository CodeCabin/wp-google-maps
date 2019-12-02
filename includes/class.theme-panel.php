<?php

namespace WPGMZA;

class ThemePanel extends DOMDocument
{
	public function __construct($map=null)
	{
		global $wpgmza;
		
		DOMDocument::__construct();
		
		$this->loadPHPFile(plugin_dir_path(__DIR__) . 'html/theme-panel.html.php');
		
		$base = plugin_dir_url(__DIR__);
		
		wp_enqueue_script('owl-carousel', 				$base . 'lib/owl.carousel.min.js', array('jquery'), $wpgmza->getBasicVersion());
		wp_enqueue_style('owl-carousel',				$base . 'lib/owl.carousel.css', array(), $wpgmza->getBasicVersion());
		wp_enqueue_style('owl-carousel_theme',			$base . 'lib/owl.theme.css', array(), $wpgmza->getBasicVersion());
		
		wp_enqueue_script('codemirror',					$base . 'lib/codemirror.js', array(), $wpgmza->getBasicVersion());
		wp_enqueue_style('codemirror',					$base . 'lib/codemirror.css', array(), $wpgmza->getBasicVersion());
		wp_enqueue_script('codemirror-javascript',		$base . 'lib/mode/javascript.js', array(), $wpgmza->getBasicVersion());
		
		if($map)
			$this->populate($map);
	}
}
